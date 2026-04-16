/**
 * UI AI对话页面模块
 * 支持对话和脚本预览两个 Tab
 */

var Config = require('./config');
var MarkdownRenderer = require('./markdown_renderer');
var C = Config.colors;
var I = Config.icons;

function UIAIChat(uiManager) {
    this.uiManager = uiManager;
    this.messages = [];
    this.currentTab = 'chat'; // 'chat' 或 'script'
    this.markdownRenderer = new MarkdownRenderer();
}

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

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        '  <horizontal bg="' + C.primary + '" padding="20 16 16 16" gravity="center_vertical">' +
        '    <text id="btn_back" text="' + I.arrowLeft + '" textSize="26sp" textColor="#FFFFFF" padding="4 4 12 4"/>' +
        '    <text text="AI 助手" textSize="22sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_new_chat" text="' + I.plus + '" textSize="24sp" textColor="#FFFFFF" padding="8 8 8 12"/>' +
        '  </horizontal>' +
        '  <!-- Tab 切换 -->' +
        '  <horizontal bg="' + C.card + '" padding="8">' +
        '    <horizontal id="tab_chat" layout_weight="1" gravity="center" padding="12 8" bg="' + C.primary + '22" cornerRadius="12" marginRight="4">' +
        '      <text text="' + I.comment + ' 对话" textSize="15sp" textColor="' + C.primary + '" textStyle="bold"/>' +
        '    </horizontal>' +
        '    <horizontal id="tab_script" layout_weight="1" gravity="center" padding="12 8" bg="#00000000" cornerRadius="12" marginLeft="4">' +
        '      <text text="' + I.code + ' 脚本" textSize="15sp" textColor="' + C.textSecondary + '"/>' +
        '    </horizontal>' +
        '  </horizontal>' +
        '  <!-- 对话视图 -->' +
        '  <frame id="view_chat" layout_weight="1">' +
        '    <scroll id="message_scroll" bg="' + C.bg + '">' +
        '      <vertical id="message_container" padding="16"></vertical>' +
        '    </scroll>' +
        '  </frame>' +
        '  <!-- 脚本视图 -->' +
        '  <frame id="view_script" layout_weight="1" visibility="gone">' +
        '    <vertical bg="' + C.bg + '" padding="16">' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="20" layout_weight="1">' +
        '        <text text="生成的脚本" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        <scroll layout_weight="1">' +
        '          <text id="script_preview" text="暂无脚本代码\\n\\n请在对话中让 AI 生成脚本" textSize="13sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="16" cornerRadius="12" lineSpacingExtra="4"/>' +
        '        </scroll>' +
        '      </vertical>' +
        '      <button id="btn_save_task" text="' + I.download + ' 保存为本地任务" bg="' + C.primary + '" textColor="white" textSize="15sp" cornerRadius="16" h="52" marginTop="16" textStyle="bold"/>' +
        '    </vertical>' +
        '  </frame>' +
        '  <!-- 输入区域 -->' +
        '  <horizontal id="input_area" bg="' + C.card + '" padding="12 16" gravity="center_vertical">' +
        '    <input id="input_message" hint="输入消息..." textSize="15sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12 16" cornerRadius="20" layout_weight="1" singleLine="false" maxLines="4"/>' +
        '    <text id="btn_send" text="' + I.upload + '" textSize="24sp" textColor="' + C.primary + '" padding="12" marginLeft="8"/>' +
        '  </horizontal>' +
        '</vertical>'
    );

    // 应用字体
    mgr.fontManager.apply(ui.btn_back, ui.btn_new_chat, ui.btn_send, ui.btn_save_task);

    // 显示欢迎消息
    if (self.messages.length === 0) {
        self.addWelcomeMessage();
    } else {
        self.renderMessages();
        self.updateScriptPreview();
    }

    // Tab 切换
    ui.tab_chat.on('click', function() {
        self.switchTab('chat');
    });

    ui.tab_script.on('click', function() {
        self.switchTab('script');
    });

    ui.btn_back.on('click', function() {
        mgr.showMainView();
    });

    ui.btn_new_chat.on('click', function() {
        dialogs.confirm('新建对话', '确定要开始新对话吗？当前对话将被清空。', function(confirmed) {
            if (confirmed) {
                self.messages = [];
                self.addWelcomeMessage();
                self.updateScriptPreview();
            }
        });
    });

    ui.btn_send.on('click', function() {
        self.sendMessage();
    });

    ui.btn_save_task.on('click', function() {
        self.saveAsTask();
    });

    ui.input_message.on('key', function(keyCode, event) {
        if (keyCode === android.view.KeyEvent.KEYCODE_ENTER && !event.isShiftPressed()) {
            self.sendMessage();
            return true;
        }
        return false;
    });
};

UIAIChat.prototype.switchTab = function(tab) {
    this.currentTab = tab;

    if (tab === 'chat') {
        ui.view_chat.attr('visibility', 'visible');
        ui.view_script.attr('visibility', 'gone');
        ui.input_area.attr('visibility', 'visible');

        ui.tab_chat.attr('bg', C.primary + '22');
        ui.tab_chat.findViewByText(I.comment + ' 对话').attr('textColor', C.primary);
        ui.tab_chat.findViewByText(I.comment + ' 对话').attr('textStyle', 'bold');

        ui.tab_script.attr('bg', '#00000000');
        ui.tab_script.findViewByText(I.code + ' 脚本').attr('textColor', C.textSecondary);
        ui.tab_script.findViewByText(I.code + ' 脚本').attr('textStyle', 'normal');
    } else {
        ui.view_chat.attr('visibility', 'gone');
        ui.view_script.attr('visibility', 'visible');
        ui.input_area.attr('visibility', 'gone');

        ui.tab_chat.attr('bg', '#00000000');
        ui.tab_chat.findViewByText(I.comment + ' 对话').attr('textColor', C.textSecondary);
        ui.tab_chat.findViewByText(I.comment + ' 对话').attr('textStyle', 'normal');

        ui.tab_script.attr('bg', C.primary + '22');
        ui.tab_script.findViewByText(I.code + ' 脚本').attr('textColor', C.primary);
        ui.tab_script.findViewByText(I.code + ' 脚本').attr('textStyle', 'bold');

        this.updateScriptPreview();
    }
};

UIAIChat.prototype.addWelcomeMessage = function() {
    var welcomeText = '你好！我是 AutoX.js 开发助手。\n\n' +
        '我会通过对话逐步帮你生成自动化脚本：\n' +
        '1️⃣ 告诉我你想自动化什么任务\n' +
        '2️⃣ 我会询问具体细节\n' +
        '3️⃣ 生成初步脚本代码\n' +
        '4️⃣ 根据你的反馈优化\n' +
        '5️⃣ 完成后可保存为本地任务\n\n' +
        '请告诉我，你想做什么自动化任务？';

    this.addMessage('assistant', welcomeText);
};

UIAIChat.prototype.addMessage = function(role, content) {
    this.messages.push({ role: role, content: content });
    this.renderMessages();
};

UIAIChat.prototype.renderMessages = function() {
    var self = this;
    var container = ui.message_container;

    ui.run(function() {
        container.removeAllViews();

        self.messages.forEach(function(msg) {
            var isUser = msg.role === 'user';
            var bgColor = isUser ? C.primary : C.card;
            var textColor = isUser ? '#FFFFFF' : C.textPrimary;
            var alignment = isUser ? 'right' : 'left';
            var marginLeft = isUser ? '60' : '0';
            var marginRight = isUser ? '0' : '60';

            // 创建消息视图（不在 XML 中直接插入文本内容）
            var messageView = ui.inflate(
                '<horizontal gravity="' + alignment + '" marginBottom="12">' +
                '  <vertical bg="' + bgColor + '" cornerRadius="16" padding="12 16" marginLeft="' + marginLeft + '" marginRight="' + marginRight + '" maxWidth="*">' +
                '    <text id="msg_text" textSize="14sp" textColor="' + textColor + '" lineSpacingExtra="4"/>' +
                '  </vertical>' +
                '</horizontal>'
            );

            // 获取 TextView
            var textView = messageView.findViewByStringId('msg_text');

            // AI 消息使用 Markdown 渲染，用户消息直接显示
            if (isUser) {
                textView.setText(msg.content);
            } else {
                self.markdownRenderer.render(textView, msg.content, textColor);
            }

            container.addView(messageView);
        });

        // 滚动到底部
        ui.post(function() {
            ui.message_scroll.fullScroll(android.widget.ScrollView.FOCUS_DOWN);
        }, 100);
    });
};

UIAIChat.prototype.sendMessage = function() {
    var self = this;
    var mgr = this.uiManager;
    var userMessage = ui.input_message.getText().toString().trim();

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
            self.updateScriptPreview();
        }
    });
};

UIAIChat.prototype.updateScriptPreview = function() {
    var mgr = this.uiManager;
    var code = mgr.aiService.extractCode(this.messages);

    if (code) {
        ui.script_preview.setText(code);
        ui.script_preview.attr('textColor', C.textPrimary);
    } else {
        ui.script_preview.setText('暂无脚本代码\n\n请在对话中让 AI 生成脚本');
        ui.script_preview.attr('textColor', C.textHint);
    }
};

UIAIChat.prototype.saveAsTask = function() {
    var self = this;
    var mgr = this.uiManager;
    var code = mgr.aiService.extractCode(this.messages);

    if (!code) {
        toast('暂无可保存的脚本');
        return;
    }

    // 弹出对话框输入任务名称和描述
    dialogs.rawInput('任务名称', '', function(name) {
        if (!name) {
            toast('已取消');
            return;
        }

        dialogs.rawInput('任务描述（可选）', '', function(description) {
            // 创建任务
            var taskId = mgr.dataManager.addTask({
                name: name,
                description: description || 'AI 生成的自动化脚本',
                script: code,
                source: 'ai'
            });

            toast('任务已保存');

            // 询问是否查看任务
            dialogs.confirm('保存成功', '任务"' + name + '"已保存，是否查看任务详情？', function(confirmed) {
                if (confirmed) {
                    mgr.showTaskDetail(taskId);
                }
            });
        });
    });
};

module.exports = UIAIChat;
