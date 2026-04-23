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
    this.currentConversationId = null; // 当前对话ID（如果是从历史加载的）
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

    // 普通入口清空任务关联，保存时创建新任务
    self.currentTaskId = null;

    // 应用字体
    mgr.fontManager.applyLight(ui.btn_back, ui.btn_new_chat, ui.btn_history);
    mgr.fontManager.apply(ui.btn_save_task, ui.btn_run_script, ui.btn_view_logs, ui.btn_pick_coordinate, ui.btn_format, ui.btn_clear_script, ui.btn_quick_pick, ui.btn_send, ui.tab_chat_text, ui.tab_script_text);

    // 显示欢迎消息
    if (self.messages.length === 0) {
        messageRenderer.addWelcomeMessage(self);
    } else {
        messageRenderer.renderMessages(self);
        scriptOperations.updateScriptPreview(self);
    }

    // 默认聚焦输入框
    ui.post(function() {
        ui.input_message.requestFocus();
        var imm = context.getSystemService(android.view.inputmethod.InputMethodManager);
        imm.showSoftInput(ui.input_message, 0);
    }, 300);
};

/**
 * Tab切换
 */
UIAIChat.prototype.switchTab = function(tab) {
    this.currentTab = tab;

    // 解析颜色
    var colorWhite = android.graphics.Color.parseColor('#FFFFFF');
    var colorGray = android.graphics.Color.parseColor(C.textHint);

    if (tab === 'chat') {
        ui.view_chat.attr('visibility', 'visible');
        ui.view_script.attr('visibility', 'gone');
        ui.input_area.attr('visibility', 'visible');
        ui.quick_bar.attr('visibility', 'visible');

        ui.tab_chat.attr('bg', C.primary);
        ui.tab_chat_text.setTextColor(colorWhite);
        ui.tab_chat_text.setTypeface(ui.tab_chat_text.getTypeface(), android.graphics.Typeface.BOLD);

        ui.tab_script.attr('bg', C.surface);
        ui.tab_script_text.setTextColor(colorGray);
        ui.tab_script_text.setTypeface(ui.tab_script_text.getTypeface(), android.graphics.Typeface.NORMAL);
    } else {
        ui.view_chat.attr('visibility', 'gone');
        ui.view_script.attr('visibility', 'visible');
        ui.input_area.attr('visibility', 'gone');
        ui.quick_bar.attr('visibility', 'gone');

        ui.tab_chat.attr('bg', C.surface);
        ui.tab_chat_text.setTextColor(colorGray);
        ui.tab_chat_text.setTypeface(ui.tab_chat_text.getTypeface(), android.graphics.Typeface.NORMAL);

        ui.tab_script.attr('bg', C.primary);
        ui.tab_script_text.setTextColor(colorWhite);
        ui.tab_script_text.setTypeface(ui.tab_script_text.getTypeface(), android.graphics.Typeface.BOLD);

        scriptOperations.updateScriptPreview(this);
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
    this.currentTab = 'chat';  // 默认显示对话tab

    // 使用统一布局，仅标题自定义
    var pageTitle = taskName ? ('AI 编辑: ' + taskName) : 'AI 助手';
    layoutBuilder.buildLayout(pageTitle);
    layoutBuilder.bindEvents(self, mgr);

    // 应用字体
    mgr.fontManager.applyLight(ui.btn_back, ui.btn_new_chat, ui.btn_history);
    mgr.fontManager.apply(ui.btn_save_task, ui.btn_run_script, ui.btn_view_logs, ui.btn_pick_coordinate, ui.btn_format, ui.btn_clear_script, ui.btn_quick_pick, ui.btn_send, ui.tab_chat_text, ui.tab_script_text);

    // 添加初始提示消息，包含要编辑的脚本
    var prompt = '我的原始脚本如下:\n\n```javascript\n' + script + '\n```';
    this.addMessage('user', prompt);

    // 脚本已经在输入框
    ui.script_editor.setText(script);
    if (taskName) {
        ui.script_title.setText(taskName);
    }
    scriptOperations.updateScriptPreview(this);
    scriptOperations.updateLineNumbers();

    // 默认停留在对话tab，不自动发送，等待用户确认后发送
    ui.post(function() {
        self.switchTab('chat');
        // 默认聚焦输入框，方便用户补充说明后发送
        ui.post(function() {
            ui.input_message.requestFocus();
            var imm = context.getSystemService(android.view.inputmethod.InputMethodManager);
            imm.showSoftInput(ui.input_message, 0);
        }, 300);
    });
};

// 导出方法引用
UIAIChat.prototype.addWelcomeMessage = function() {
    messageRenderer.addWelcomeMessage(this);
};

UIAIChat.prototype.renderMessages = function() {
    messageRenderer.renderMessages(this);
};

/**
 * 保存当前对话到历史
 */
UIAIChat.prototype.saveCurrentConversationToHistory = function() {
    var mgr = this.uiManager;
    if (this.messages.length === 0) return;

    // 获取当前脚本内容
    var currentScript = '';
    if (ui.script_editor) {
        currentScript = ui.script_editor.getText().toString();
    }

    // 如果已经有 conversationId，更新而不是新建
    var data = {
        id: this.currentConversationId,
        messages: this.messages,
        script: currentScript,
        title: null // 自动生成
    };

    mgr.dataManager.saveAIConversation(data);
};

/**
 * 加载历史对话到当前界面
 */
UIAIChat.prototype.loadConversation = function(conv) {
    var self = this;
    // 先保存当前对话（如果有内容）
    if (this.messages.length > 0) {
        this.saveCurrentConversationToHistory();
    }

    // 加载对话数据
    this.currentConversationId = conv.id;
    this.messages = JSON.parse(JSON.stringify(conv.messages));

    // 如果有保存的脚本，恢复它
    if (conv.script && ui.script_editor) {
        ui.script_editor.setText(conv.script);
        scriptOperations.updateScriptPreview(this);
        scriptOperations.updateLineNumbers();
    }

    // 重新渲染消息
    messageRenderer.renderMessages(this);
    toast('已加载历史对话');
};

module.exports = UIAIChat;
