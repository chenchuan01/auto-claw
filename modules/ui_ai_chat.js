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
    this.lastTempTaskId = null; // 最近一次临时运行的任务ID
    // 坐标拾取相关
    this.coordinatePickerWindow = null;
    this.isPickingCoordinate = false;
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
        '    <text id="btn_back" text="' + I.arrowLeft + '" textSize="24sp" textColor="#FFFFFF" padding="4 4 12 4"/>' +
        '    <text text="AI 助手" textSize="22sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_new_chat" text="' + I.plus + '" textSize="22sp" textColor="#FFFFFF" padding="8 8 8 12"/>' +
        '  </horizontal>' +
        '  <!-- Tab 切换 -->' +
        '  <horizontal bg="' + C.card + '" padding="8">' +
        '    <horizontal id="tab_chat" layout_weight="1" gravity="center" padding="12 8" bg="' + C.primary + '22" cornerRadius="12" marginRight="4">' +
        '      <text id="tab_chat_text" text="' + I.comment + ' 对话" textSize="15sp" textColor="' + C.primary + '" textStyle="bold"/>' +
        '    </horizontal>' +
        '    <horizontal id="tab_script" layout_weight="1" gravity="center" padding="12 8" bg="#00000000" cornerRadius="12" marginLeft="4">' +
        '      <text id="tab_script_text" text="' + I.code + ' 脚本" textSize="15sp" textColor="' + C.textSecondary + '"/>' +
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
        '    <vertical bg="' + C.bg + '" padding="12">' +
        '      <!-- 编辑器工具栏 -->' +
        '      <horizontal bg="' + C.card + '" cornerRadius="12 12 0 0" padding="12 10" gravity="center_vertical">' +
        '        <text id="script_title" text="暂无脚本" textSize="13sp" textColor="' + C.textSecondary + '" layout_weight="1" singleLine="true"/>' +
        '        <text id="btn_pick_coordinate" text="' + I.target + ' 拾取坐标" textSize="12sp" textColor="' + C.primary + '" bg="' + C.primary + '22" padding="6 10" cornerRadius="8" marginRight="8"/>' +
        '        <text id="btn_format" text="格式化" textSize="12sp" textColor="' + C.primary + '" bg="' + C.primary + '22" padding="6 10" cornerRadius="8" marginRight="8"/>' +
        '        <text id="btn_clear_script" text="清空" textSize="12sp" textColor="' + C.error + '" bg="' + C.error + '22" padding="6 10" cornerRadius="8"/>' +
        '      </horizontal>' +
        '      <!-- 编辑区域 -->' +
        '      <horizontal bg="' + C.surface + '" cornerRadius="0 0 12 12" layout_weight="1">' +
        '        <!-- 行号 -->' +
        '        <scroll id="line_number_scroll" w="40" bg="#E8EDF5">' +
        '          <vertical id="line_numbers" padding="12 12 4 12">' +
        '            <text id="line_number_text" text="1" textSize="12sp" textColor="' + C.textHint + '" gravity="right" lineSpacingExtra="2"/>' +
        '          </vertical>' +
        '        </scroll>' +
        '        <!-- 代码输入框 -->' +
        '        <scroll layout_weight="1">' +
        '          <input id="script_editor" hint="AI 生成的脚本将显示在这里，你也可以直接编辑..." textSize="12sp" textColor="' + C.textPrimary + '" padding="12" singleLine="false" gravity="top" bg="#00000000" inputType="textMultiLine"/>' +
        '        </scroll>' +
        '      </horizontal>' +
        '      <!-- 底部按钮 -->' +
        '      <horizontal marginTop="12">' +
        '        <button id="btn_run_script" text="' + I.play + ' 运行" bg="' + C.success + '" textColor="white" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" marginRight="4" textStyle="bold"/>' +
        '        <button id="btn_view_logs" text="' + I.clock + ' 日志" bg="' + C.info + '" textColor="white" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" marginLeft="4" visibility="gone"/>' +
        '      </horizontal>' +
        '      <horizontal marginTop="8">' +
        '        <button id="btn_save_task" text="' + I.save + ' 保存任务" bg="' + C.primary + '" textColor="white" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" textStyle="bold"/>' +
        '      </horizontal>' +
        '    </vertical>' +
        '  </frame>' +
        '  <!-- 输入区域 -->' +
        '  <horizontal id="input_area" bg="' + C.card + '" padding="12 8" gravity="center_vertical">' +
        '    <input id="input_message" hint="输入消息..." textSize="15sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12 16" cornerRadius="20" layout_weight="1" singleLine="false" maxLines="4"/>' +
        '    <button id="btn_send" text="' + I.paperPlane + '" bg="' + C.primary + '" textColor="#FFFFFF" textSize="18sp" cornerRadius="20" h="44" w="48" marginLeft="8"/>' +
        '  </horizontal>' +
        '</vertical>'
    );

    // 应用字体
    mgr.fontManager.apply(ui.btn_back, ui.btn_new_chat, ui.btn_save_task, ui.btn_run_script, ui.btn_view_logs, ui.btn_pick_coordinate, ui.btn_send);

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
        console.log('[AI Chat] 发送按钮被点击');
        self.sendMessage();
    });

    ui.btn_save_task.on('click', function() {
        self.saveAsTask();
    });

    ui.btn_run_script.on('click', function() {
        self.runScript();
    });

    ui.btn_view_logs.on('click', function() {
        self.viewTempTaskLogs();
    });

    ui.btn_clear_script.on('click', function() {
        dialogs.confirm('清空脚本', '确定要清空编辑器中的脚本吗？', function(confirmed) {
            if (confirmed) {
                ui.script_editor.setText('');
                ui.script_title.setText('暂无脚本');
                self.updateLineNumbers();
            }
        });
    });

    ui.btn_pick_coordinate.on('click', function() {
        self.startCoordinatePicker();
    });

    ui.btn_format.on('click', function() {
        var code = ui.script_editor.getText().toString();
        if (code.trim()) {
            toast('格式化功能开发中');
        } else {
            toast('暂无脚本可格式化');
        }
    });

    // 编辑器内容变化时更新行号
    ui.script_editor.addTextChangedListener({
        afterTextChanged: function(editable) {
            self.updateLineNumbers();
        }
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

/**
 * 解析 Markdown 分块，区分文本段落和代码块
 */
UIAIChat.prototype.parseMarkdownBlocks = function(markdown) {
    var lines = markdown.split('\n');
    var blocks = [];
    var currentText = [];
    var inCode = false;
    var currentCode = [];
    var currentLang = '';

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];
        var trimmed = line.trim();

        if (trimmed.startsWith('```')) {
            if (inCode) {
                // 结束代码块
                blocks.push({
                    type: 'code',
                    language: currentLang,
                    content: currentCode.join('\n')
                });
                currentCode = [];
                currentLang = '';
                inCode = false;
            } else {
                // 开始新代码块
                if (currentText.length > 0) {
                    blocks.push({
                        type: 'text',
                        content: currentText.join('\n')
                    });
                    currentText = [];
                }
                currentLang = trimmed.slice(3).trim();
                inCode = true;
            }
            continue;
        }

        if (inCode) {
            currentCode.push(line);
        } else {
            currentText.push(line);
        }
    }

    // 处理剩余文本
    if (currentText.length > 0) {
        blocks.push({
            type: 'text',
            content: currentText.join('\n')
        });
    }

    return blocks;
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

            // 创建消息容器
            var messageContainer = ui.inflate(
                '<horizontal gravity="' + alignment + '" marginBottom="28">' +
                '  <vertical id="content_container" bg="' + bgColor + '" cornerRadius="16" padding="12 16" marginLeft="' + marginLeft + '" marginRight="' + marginRight + '" maxWidth="*">' +
                '  </vertical>' +
                '</horizontal>'
            );

            var contentContainer = messageContainer.content_container;
            var blocks = self.parseMarkdownBlocks(msg.content);

            // 用户消息：整个放在一个 TextView（不需要折叠）
            if (isUser) {
                var textView = ui.inflate(
                    '<text id="msg_text" textSize="14sp" textColor="' + textColor + '" lineSpacingExtra="4" textIsSelectable="true"/>'
                );
                textView.setText(msg.content);
                contentContainer.addView(textView);
                container.addView(messageContainer);
                return;
            }

            // AI 消息：分段渲染，代码块可折叠
            blocks.forEach(function(block) {
                if (block.type === 'text') {
                    if (!block.content.trim()) return;
                    var textView = ui.inflate(
                        '<text textSize="14sp" textColor="' + textColor + '" lineSpacingExtra="4" textIsSelectable="true"/>'
                    );
                    self.markdownRenderer.render(textView, block.content, textColor);
                    contentContainer.addView(textView);
                } else if (block.type === 'code') {
                    var lineCount = block.content.split('\n').length;
                    var codeBlock = ui.inflate(
                        '<vertical>' +
                        '  <horizontal id="code_header" bg="' + C.surface + '" cornerRadius="8" padding="8 10" gravity="center_vertical" marginTop="6" marginBottom="4">' +
                        '    <text id="code_title" text="' + I.code + ' 代码 (' + lineCount + ' 行)" textSize="13sp" textColor="' + C.textPrimary + '" layout_weight="1"/>' +
                        '    <text id="code_toggle" text="' + I.arrowDown + '" textSize="16sp" textColor="' + C.textSecondary + '"/>' +
                        '  </horizontal>' +
                        '  <vertical id="code_content" bg="' + C.surface + '" cornerRadius="8" padding="10" visibility="visible">' +
                        '    <text id="code_text" textSize="12sp" textColor="' + C.textPrimary + '" textIsSelectable="true"/>' +
                        '  </vertical>' +
                        '</vertical>'
                    );
                    codeBlock.code_text.setText(block.content);
                    // 默认展开
                    var expanded = true;
                    codeBlock.code_header.on('click', function() {
                        expanded = !expanded;
                        if (expanded) {
                            codeBlock.code_content.attr('visibility', 'visible');
                            codeBlock.code_toggle.setText(I.arrowDown);
                        } else {
                            codeBlock.code_content.attr('visibility', 'gone');
                            codeBlock.code_toggle.setText(I.arrowLeft);
                        }
                        // 应用字体到图标
                        self.uiManager.fontManager.apply(codeBlock.code_toggle, codeBlock.code_title);
                    });
                    // 应用字体
                    self.uiManager.fontManager.apply(codeBlock.code_toggle, codeBlock.code_title);
                    contentContainer.addView(codeBlock);
                }
            });

            container.addView(messageContainer);
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
            self.updateScriptPreview();
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

UIAIChat.prototype.updateScriptPreview = function() {
    var mgr = this.uiManager;
    var code = mgr.aiService.extractCode(this.messages);

    if (code) {
        ui.script_editor.setText(code);
        ui.script_title.setText('AI 生成脚本 (' + code.split('\n').length + ' 行)');

        // 脚本有更新时，在脚本 tab 上显示提示
        ui.tab_script_text.setText(I.code + ' 脚本 ' + I.circle);
    } else {
        ui.script_editor.setText('');
        ui.script_title.setText('暂无脚本');
    }

    this.updateLineNumbers();
};

UIAIChat.prototype.updateLineNumbers = function() {
    var code = ui.script_editor.getText().toString();
    var lines = code ? code.split('\n').length : 1;
    var lineNumberText = '';

    for (var i = 1; i <= lines; i++) {
        lineNumberText += i + '\n';
    }

    ui.line_number_text.setText(lineNumberText.trim());
};

UIAIChat.prototype.runScript = function() {
    var self = this;
    var mgr = this.uiManager;
    var code = ui.script_editor.getText().toString().trim();

    if (!code) {
        toast('暂无可运行的脚本');
        return;
    }

    dialogs.confirm('运行脚本', '确定要运行当前脚本吗？', function(confirmed) {
        if (!confirmed) return;

        // 创建一个临时任务来记录日志
        var tempTaskId = 'temp_ai_' + Date.now();
        var tempTask = {
            id: tempTaskId,
            name: 'AI 临时运行脚本',
            description: 'AI 对话中临时运行的脚本',
            script: code,
            status: 'idle',
            createdAt: Date.now(),
            lastRunTime: null,
            runCount: 0
        };

        // 添加到数据管理器（不持久化，只在内存中）
        mgr.dataManager.addTemporaryTask(tempTask);
        self.lastTempTaskId = tempTaskId;

        // 执行任务并记录日志
        var success = mgr.taskExecutor.executeTask(tempTaskId);

        if (success) {
            // 显示查看日志按钮
            ui.post(function() {
                ui.btn_view_logs.attr('visibility', 'visible');
            });
            toast('脚本已开始运行，运行完成后可点击查看日志');
        } else {
            // 执行失败也要显示日志按钮查看错误
            ui.post(function() {
                ui.btn_view_logs.attr('visibility', 'visible');
            });
        }
    });
};

/**
 * 查看临时运行任务的日志
 */
UIAIChat.prototype.viewTempTaskLogs = function() {
    var self = this;
    var mgr = this.uiManager;

    if (!this.lastTempTaskId) {
        toast('暂无日志，请先运行脚本');
        return;
    }

    // 直接跳转到日志页面
    mgr.showTaskLogs(this.lastTempTaskId);
};

/**
 * 启动坐标拾取器（悬浮窗）
 */
UIAIChat.prototype.startCoordinatePicker = function() {
    var self = this;
    var mgr = this.uiManager;

    // 检查悬浮窗权限
    if (!floaty.checkPermission()) {
        floaty.requestPermission(function(granted) {
            if (granted) {
                self.doStartCoordinatePicker();
            } else {
                toast('需要悬浮窗权限才能使用坐标拾取');
            }
        });
        return;
    }

    this.doStartCoordinatePicker();
};

/**
 * 实际创建坐标拾取悬浮窗
 */
UIAIChat.prototype.doStartCoordinatePicker = function() {
    var self = this;
    var mgr = this.uiManager;

    if (this.isPickingCoordinate) {
        toast('坐标拾取已经在运行了');
        return;
    }

    this.isPickingCoordinate = true;

    // 在新线程创建悬浮窗
    threads.start(function() {
        // 使用一个简单布局，手动创建控件 - 这样更可靠
        var window = floaty.window(
            '<vertical padding="8" bg="#00000000">' +
            '</vertical>'
        );

        // 手动创建所有控件
        var context = context;
        var container = new android.widget.LinearLayout(context);
        container.setOrientation(android.widget.LinearLayout.VERTICAL);
        container.setGravity(android.view.Gravity.CENTER);
        container.setLayoutParams(new android.widget.FrameLayout.LayoutParams(
            android.widget.FrameLayout.LayoutParams.WRAP_CONTENT,
            android.widget.FrameLayout.LayoutParams.WRAP_CONTENT
        ));

        // 十字准星 - 用一个固定大小的 FrameLayout
        var crosshairFrame = new android.widget.FrameLayout(context);
        crosshairFrame.setLayoutParams(new android.widget.LinearLayout.LayoutParams(
            Math.round(160 * context.getResources().getDisplayMetrics().density),
            Math.round(160 * context.getResources().getDisplayMetrics().density)
        ));

        // 添加四个角
        var textPaint = new android.text.TextPaint();
        textPaint.setColor(0xAAFF0000);
        textPaint.setTextSize(40 * context.getResources().getDisplayMetrics().density);
        textPaint.setAntiAlias(true);

        // 由于动态创建比较复杂，改用简单方式，直接在XML中写出但不依赖id绑定
        window.setContentView(
            '<frame bg="#00000000" w="*" h="*">' +
            '  <vertical w="wrap_content" h="wrap_content" gravity="center" layout_gravity="center">' +
            '    <!-- 圆形半透明背景 + 十字准星 -->' +
            '    <frame w="140" h="140" gravity="center">' +
            '      <!-- 圆形背景 - 用text模拟 -->' +
            '      <text text="" w="140" h="140" bg="#00000088" gravity="center" cornerRadius="70"/>' +
            '      <!-- 水平十字线 -->' +
            '      <text text="" bg="#FF0000AA" h="2" w="120" gravity="center"/>' +
            '      <!-- 垂直十字线 -->' +
            '      <text text="" bg="#FF0000AA" w="2" h="120" gravity="center"/>' +
            '      <!-- 中心点 -->' +
            '      <text text="" w="8" h="8" bg="#FF0000AA" gravity="center" cornerRadius="4"/>' +
            '    </frame>' +
            '    <text text="点击圆形获取坐标" textSize="12sp" textColor="#FFFFFF" bg="#80000000" padding="6 3" gravity="center" cornerRadius="4" marginTop="4"/>' +
            '  </vertical>' +
            '</frame>'
        );

        // 遍历获取所有子控件
        var root = window.getDecorView();
        // 结构: root (frame) → vertical → [crosshair frame, coord text]
        var outerFrame = root;
        var vertical = outerFrame.getChildAt(0);
        var coordText = vertical.getChildAt(1);

        // 保存引用
        window.container = vertical;
        window.coord_text = coordText;

        // 设置窗口可拖动（整个区域都可拖动）
        // 点击就是拾取，拖动就是移动
        vertical.setOnTouchListener(function(view, event) {
            var action = event.getAction();
            if (action == android.view.MotionEvent.ACTION_DOWN) {
                var x = event.getRawX();
                var y = event.getRawY();
                self.lastX = x;
                self.lastY = y;
                self.dragging = false;
                return true;
            } else if (action == android.view.MotionEvent.ACTION_MOVE) {
                var dx = event.getRawX() - self.lastX;
                var dy = event.getRawY() - self.lastY;
                if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
                    self.dragging = true;
                }
                window.setPosition(
                    window.getX() + dx,
                    window.getY() + dy
                );
                self.lastX = event.getRawX();
                self.lastY = event.getRawY();
                return true;
            } else if (action == android.view.MotionEvent.ACTION_UP) {
                if (!self.dragging) {
                    // 不是拖动，就是点击，获取坐标
                    self.pickCoordinate(window);
                }
                return true;
            }
            return false;
        });

        window.setTouchable(true);
        window.setFocusable(false);
        self.coordinatePickerWindow = window;

        ui.run(function() {
            toast('拖动圆形到目标位置点击，自动拾取坐标并插入');
        });
    });
};

/**
 * 拾取当前坐标并插入到编辑器
 */
UIAIChat.prototype.pickCoordinate = function(window) {
    var self = this;
    // 获取屏幕中心坐标（窗口中心就是十字中心）
    var screenWidth = device.width;
    var screenHeight = device.height;
    var windowX = window.getX();
    var windowY = window.getY();
    var windowWidth = window.getWidth();
    var windowHeight = window.getHeight();

    // 计算十字中心的实际屏幕坐标
    var x = Math.round(windowX + windowWidth / 2);
    var y = Math.round(windowY + windowHeight / 2);

    // 插入到脚本编辑器的光标当前位置
    ui.run(function() {
        try {
            var editor = ui.script_editor;
            var insertion = 'click(' + x + ', ' + y + ');';

            // 获取当前文本和光标位置
            var editable = editor.getEditableText();
            var selectionStart = editor.getSelectionStart();
            var selectionEnd = editor.getSelectionEnd();

            if (editable != null) {
                // 在光标位置插入
                editable.replace(selectionStart, selectionEnd, insertion);
                // 光标移到插入内容后
                editor.setSelection(selectionStart + insertion.length);
            } else {
                //  fallback: 整个替换
                var currentCode = '';
                var textObj = editor.getText();
                if (textObj) {
                    currentCode = textObj.toString();
                }
                var newCode = currentCode.substring(0, selectionStart) + insertion + currentCode.substring(selectionEnd);
                editor.setText(newCode);
                editor.setSelection(selectionStart + insertion.length);
            }

            self.updateLineNumbers();
            toast('坐标已插入: ' + x + ', ' + y);
            // 自动关闭悬浮窗
            self.stopCoordinatePicker(window);
        } catch(e) {
            console.error('插入到编辑器失败:', e);
            toast('坐标获取成功: ' + x + ', ' + y + ', 请手动复制');
            setClip('click(' + x + ', ' + y + ');');
            self.stopCoordinatePicker(window);
        }
    });
};

/**
 * 停止坐标拾取
 */
UIAIChat.prototype.stopCoordinatePicker = function(window) {
    if (window) {
        window.close();
    }
    if (this.coordinatePickerWindow) {
        this.coordinatePickerWindow.close();
        this.coordinatePickerWindow = null;
    }
    this.isPickingCoordinate = false;
    this.dragging = false;
    ui.run(function() {
        toast('坐标拾取已结束');
    });
};

UIAIChat.prototype.saveAsTask = function() {
    var self = this;
    var mgr = this.uiManager;
    var code = ui.script_editor.getText().toString().trim();

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

UIAIChat.prototype.showWithScript = function(script, taskName) {
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

    this.messages = [];
    this.currentTab = 'chat';

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        '  <horizontal bg="' + C.primary + '" padding="20 16 16 16" gravity="center_vertical">' +
        '    <text id="btn_back" text="' + I.arrowLeft + '" textSize="24sp" textColor="#FFFFFF" padding="4 4 12 4"/>' +
        '    <text text="AI 编辑: ' + (taskName || '脚本') + '" textSize="22sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_new_chat" text="' + I.plus + '" textSize="22sp" textColor="#FFFFFF" padding="8 8 8 12"/>' +
        '  </horizontal>' +
        '  <!-- Tab 切换 -->' +
        '  <horizontal bg="' + C.card + '" padding="8">' +
        '    <horizontal id="tab_chat" layout_weight="1" gravity="center" padding="12 8" bg="' + C.primary + '22" cornerRadius="12" marginRight="4">' +
        '      <text id="tab_chat_text" text="' + I.comment + ' 对话" textSize="15sp" textColor="' + C.primary + '" textStyle="bold"/>' +
        '    </horizontal>' +
        '    <horizontal id="tab_script" layout_weight="1" gravity="center" padding="12 8" bg="#00000000" cornerRadius="12" marginLeft="4">' +
        '      <text id="tab_script_text" text="' + I.code + ' 脚本" textSize="15sp" textColor="' + C.textSecondary + '"/>' +
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
        '    <vertical bg="' + C.bg + '" padding="12">' +
        '      <!-- 编辑器工具栏 -->' +
        '      <horizontal bg="' + C.card + '" cornerRadius="12 12 0 0" padding="12 10" gravity="center_vertical">' +
        '        <text id="script_title" text="AI 生成脚本" textSize="13sp" textColor="' + C.textSecondary + '" layout_weight="1" singleLine="true"/>' +
        '        <text id="btn_pick_coordinate" text="' + I.target + ' 拾取坐标" textSize="12sp" textColor="' + C.primary + '" bg="' + C.primary + '22" padding="6 10" cornerRadius="8" marginRight="8"/>' +
        '        <text id="btn_format" text="格式化" textSize="12sp" textColor="' + C.primary + '" bg="' + C.primary + '22" padding="6 10" cornerRadius="8" marginRight="8"/>' +
        '        <text id="btn_clear_script" text="清空" textSize="12sp" textColor="' + C.error + '" bg="' + C.error + '22" padding="6 10" cornerRadius="8"/>' +
        '      </horizontal>' +
        '      <!-- 编辑区域 -->' +
        '      <horizontal bg="' + C.surface + '" cornerRadius="0 0 12 12" layout_weight="1">' +
        '        <!-- 行号 -->' +
        '        <scroll id="line_number_scroll" w="40" bg="#E8EDF5">' +
        '          <vertical id="line_numbers" padding="12 12 4 12">' +
        '            <text id="line_number_text" text="1" textSize="12sp" textColor="' + C.textHint + '" gravity="right" lineSpacingExtra="2"/>' +
        '          </vertical>' +
        '        </scroll>' +
        '        <!-- 代码输入框 -->' +
        '        <scroll layout_weight="1">' +
        '          <input id="script_editor" hint="AI 生成的脚本将显示在这里，你也可以直接编辑..." textSize="12sp" textColor="' + C.textPrimary + '" padding="12" singleLine="false" gravity="top" bg="#00000000" inputType="textMultiLine"/>' +
        '        </scroll>' +
        '      </horizontal>' +
        '      <!-- 底部按钮 -->' +
        '      <horizontal marginTop="12">' +
        '        <button id="btn_run_script" text="' + I.play + ' 运行" bg="' + C.success + '" textColor="white" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" marginRight="4" textStyle="bold"/>' +
        '        <button id="btn_view_logs" text="' + I.clock + ' 日志" bg="' + C.info + '" textColor="white" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" marginLeft="4" visibility="gone"/>' +
        '      </horizontal>' +
        '      <horizontal marginTop="8">' +
        '        <button id="btn_save_task" text="' + I.save + ' 保存任务" bg="' + C.primary + '" textColor="white" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" textStyle="bold"/>' +
        '      </horizontal>' +
        '    </vertical>' +
        '  </frame>' +
        '  <!-- 输入区域 -->' +
        '  <horizontal id="input_area" bg="' + C.card + '" padding="12 8" gravity="center_vertical">' +
        '    <input id="input_message" hint="输入消息..." textSize="15sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12 16" cornerRadius="20" layout_weight="1" singleLine="false" maxLines="4"/>' +
        '    <button id="btn_send" text="' + I.paperPlane + '" bg="' + C.primary + '" textColor="#FFFFFF" textSize="18sp" cornerRadius="20" h="44" w="48" marginLeft="8"/>' +
        '  </horizontal>' +
        '</vertical>'
    );

    // 应用字体
    mgr.fontManager.apply(ui.btn_back, ui.btn_new_chat, ui.btn_save_task, ui.btn_run_script, ui.btn_view_logs, ui.btn_pick_coordinate, ui.btn_send);

    // 添加初始提示消息，包含要编辑的脚本
    var prompt = '请帮我优化/修改这个脚本：\n\n```javascript\n' + script + '\n```';
    this.addMessage('user', prompt);

    // 脚本已经在输入框
    ui.script_editor.setText(script);
    this.updateScriptPreview();
    this.updateLineNumbers();

    // Tab 切换
    ui.tab_chat.on('click', function() {
        self.switchTab('chat');
    });

    ui.tab_script.on('click', function() {
        self.switchTab('script');
    });

    ui.btn_back.on('click', function() {
        mgr.showTaskDetail(self.currentTaskId);
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
        console.log('[AI Chat] 发送按钮被点击');
        self.sendMessage();
    });

    ui.btn_save_task.on('click', function() {
        self.saveAsTask();
    });

    ui.btn_run_script.on('click', function() {
        self.runScript();
    });

    ui.btn_view_logs.on('click', function() {
        self.viewTempTaskLogs();
    });

    ui.btn_clear_script.on('click', function() {
        dialogs.confirm('清空脚本', '确定要清空编辑器中的脚本吗？', function(confirmed) {
            if (confirmed) {
                ui.script_editor.setText('');
                ui.script_title.setText('暂无脚本');
                self.updateLineNumbers();
            }
        });
    });

    ui.btn_pick_coordinate.on('click', function() {
        self.startCoordinatePicker();
    });

    ui.btn_format.on('click', function() {
        var code = ui.script_editor.getText().toString();
        if (code.trim()) {
            toast('格式化功能开发中');
        } else {
            toast('暂无脚本可格式化');
        }
    });

    // 编辑器内容变化时更新行号
    ui.script_editor.addTextChangedListener({
        afterTextChanged: function(editable) {
            self.updateLineNumbers();
        }
    });

    ui.input_message.on('key', function(keyCode, event) {
        if (keyCode === android.view.KeyEvent.KEYCODE_ENTER && !event.isShiftPressed()) {
            self.sendMessage();
            return true;
        }
        return false;
    });
};

module.exports = UIAIChat;
