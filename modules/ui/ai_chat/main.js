/**
 * UI AI对话页面模块
 * 支持对话和脚本预览两个 Tab
 */

var Config = require('../../core/config');
var MarkdownRenderer = require('../../utils/markdown_renderer');
var coordinatePicker = require('./coordinatePicker');
var messageRenderer = require('./messageRenderer');
var scriptOperations = require('./scriptOperations');
var layoutBuilder = require('./layoutBuilder');
var C = Config.colors;
var I = Config.icons;

function UIAIChat(uiManager) {
    this.uiManager = uiManager;
    this.messages = [];
    this.currentTab = 'chat'; // 'chat' 或 'script'
    this.markdownRenderer = new MarkdownRenderer();
    this.lastTempTaskId = null; // 最近一次临时运行的任务ID
    // 坐标拾取相关
    this.coordinatePickerWindow = null;
    this.isPickingCoordinate = false;
    this.pickCallback = null; // 拾取完成回调
    this.dragging = false;
}

/**
 * 显示AI聊天页面
 */
UIAIChat.prototype.show = function() {
    var self = this;
    var mgr = this.uiManager;

    // 检查是否已配置
    if (!mgr.aiService.aiConfig.isConfigured()) {
        dialogs.confirm('未配置 AI', '请先在设置中配置 AI API，是否现在前往设置？', function(confirmed) {
            if (confirmed) {
                mgr.showSettings();
            }
        });
        return;
    }

    layoutBuilder.buildLayout();
    layoutBuilder.bindEvents(self, mgr);

    // 应用字体
    mgr.fontManager.apply(ui.btn_back, ui.btn_new_chat, ui.btn_save_task, ui.btn_run_script, ui.btn_view_logs, ui.btn_pick_coordinate, ui.btn_quick_pick, ui.btn_send);

    // 显示欢迎消息
    if (self.messages.length === 0) {
        messageRenderer.addWelcomeMessage(self);
    } else {
        messageRenderer.renderMessages(self);
        scriptOperations.updateScriptPreview(self);
    }
};

/**
 * Tab切换
 */
UIAIChat.prototype.switchTab = function(tab) {
    this.currentTab = tab;

    if (tab === 'chat') {
        ui.view_chat.attr('visibility', 'visible');
        ui.view_script.attr('visibility', 'gone');
        ui.input_area.attr('visibility', 'visible');

        ui.tab_chat.attr('bg', C.primary + '22');
        ui.tab_chat_text.attr('textColor', C.primary);
        ui.tab_chat_text.attr('textStyle', 'bold');

        ui.tab_script.attr('bg', '#00000000');
        ui.tab_script_text.attr('textColor', C.textSecondary);
        ui.tab_script_text.attr('textStyle', 'normal');
    } else {
        ui.view_chat.attr('visibility', 'gone');
        ui.view_script.attr('visibility', 'visible');
        ui.input_area.attr('visibility', 'gone');

        ui.tab_chat.attr('bg', '#00000000');
        ui.tab_chat_text.attr('textColor', C.textSecondary);
        ui.tab_chat_text.attr('textStyle', 'normal');

        ui.tab_script.attr('bg', C.primary + '22');
        ui.tab_script_text.attr('textColor', C.primary);
        ui.tab_script_text.attr('textStyle', 'bold');

        scriptOperations.updateScriptPreview(self);
    }
};

/**
 * 添加消息
 */
UIAIChat.prototype.addMessage = function(role, content) {
    this.messages.push({ role: role, content: content });
    messageRenderer.renderMessages(this);
};

/**
 * 发送消息到AI
 */
UIAIChat.prototype.sendMessage = function() {
    var self = this;
    var mgr = this.uiManager;

    var inputText = ui.input_message.getText();
    console.log('[AI Chat] getText() 结果:', inputText, '类型:', typeof inputText);

    var userMessage = inputText ? inputText.toString().trim() : '';
    console.log('[AI Chat] 用户消息:', userMessage);

    if (!userMessage) {
        toast('请输入消息');
        return;
    }

    // 清空输入框
    ui.input_message.setText('');

    // 添加用户消息
    self.addMessage('user', userMessage);

    // 添加加载提示
    self.addMessage('assistant', '正在思考...');

    // 发送到 AI
    mgr.aiService.sendMessage(self.messages.slice(0, -1), function(error, response) {
        // 移除加载提示
        self.messages.pop();

        if (error) {
            self.addMessage('assistant', '抱歉，发生错误：' + error);
        } else {
            self.addMessage('assistant', response);
            // 更新脚本预览
            scriptOperations.updateScriptPreview(self);
        }

        // AI回复完成后，自动聚焦输入框，方便连续对话
        ui.post(function() {
            // 只有在对话tab才聚焦
            if (self.currentTab === 'chat') {
                ui.input_message.requestFocus();
                // 显示输入法
                var imm = context.getSystemService(android.view.inputmethod.InputMethodManager);
                imm.showSoftInput(ui.input_message, 0);
            }
        });
    });
};

/**
 * 启动坐标拾取
 */
UIAIChat.prototype.startCoordinatePicker = function(callback) {
    coordinatePicker.startCoordinatePicker(this, callback);
};

/**
 * 停止坐标拾取
 */
UIAIChat.prototype.stopCoordinatePicker = function(window) {
    coordinatePicker.stopCoordinatePicker(this, window);
};

/**
 * 插入坐标到输入框
 */
UIAIChat.prototype.insertCoordinateToInput = function(x, y, inputView) {
    coordinatePicker.insertCoordinateToInput(x, y, inputView, ui);
};

/**
 * 显示已有脚本的编辑对话
 */
UIAIChat.prototype.showWithScript = function(script, taskName, currentTaskId) {
    var self = this;
    var mgr = this.uiManager;
    this.currentTaskId = currentTaskId;

    // 检查是否已配置
    if (!mgr.aiService.aiConfig.isConfigured()) {
        dialogs.confirm('未配置 AI', '请先在设置中配置 AI API，是否现在前往设置？', function(confirmed) {
            if (confirmed) {
                mgr.showSettings();
            }
        });
        return;
    }

    this.messages = [];
    this.currentTab = 'chat';

    layoutBuilder.buildLayoutWithEdit(taskName);
    layoutBuilder.bindEventsWithEdit(self, mgr);

    // 应用字体
    mgr.fontManager.apply(ui.btn_back, ui.btn_new_chat, ui.btn_save_task, ui.btn_run_script, ui.btn_view_logs, ui.btn_pick_coordinate, ui.btn_quick_pick, ui.btn_send);

    // 添加初始提示消息，包含要编辑的脚本
    var prompt = '请帮我优化/修改这个脚本：\n\n```javascript\n' + script + '\n```';
    this.addMessage('user', prompt);

    // 脚本已经在输入框
    ui.script_editor.setText(script);
    scriptOperations.updateScriptPreview(this);
    scriptOperations.updateLineNumbers();
};

// 导出方法引用
UIAIChat.prototype.addWelcomeMessage = function() {
    messageRenderer.addWelcomeMessage(this);
};

UIAIChat.prototype.renderMessages = function() {
    messageRenderer.renderMessages(this);
};

module.exports = UIAIChat;
