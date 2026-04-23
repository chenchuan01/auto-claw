/**
 * AI对话 - 布局构建模块
 * 构建UI布局XML
 */

var Config = require('../../core/config');
var HeaderBuilder = require('../header_builder');
var scriptOperations = require('./scriptOperations');
var highlightedEditor = require('./highlightedEditor');
var C = Config.colors;
var I = Config.icons;

/**
 * 构建AI聊天页面布局
 * @param {string} title - 自定义标题（可选，默认为"AI 助手"）
 */
function buildLayout(title) {
    var pageTitle = title || 'AI 助手';
    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        HeaderBuilder.buildHeader({
            title: pageTitle,
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back',
            rightIcon: I.plus,
            rightIconId: 'btn_new_chat',
            rightIcon2: I.history,
            rightIcon2Id: 'btn_history'
        }) +
        '  <!-- Tab 切换 -->' +
        '  <horizontal bg="' + C.card + '" padding="8">' +
        '    <horizontal id="tab_chat" layout_weight="1" gravity="center" padding="12 8" bg="' + C.primary + '" cornerRadius="12" marginRight="4">' +
        '      <text id="tab_chat_text" text="' + I.comment + ' 对话" textSize="15sp" textColor="#FFFFFF" textStyle="bold"/>' +
        '    </horizontal>' +
        '    <horizontal id="tab_script" layout_weight="1" gravity="center" padding="12 8" bg="' + C.surface + '" cornerRadius="12" marginLeft="4">' +
        '      <text id="tab_script_text" text="' + I.code + ' 脚本" textSize="15sp" textColor="' + C.textHint + '"/>' +
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
        '        <text id="btn_pick_coordinate" text="' + I.target + '" textSize="16sp" textColor="#FFFFFF" bg="' + C.info + '" w="36" h="36" gravity="center" cornerRadius="18" marginRight="6"/>' +
        '        <text id="btn_format" text="' + I.magic + '" textSize="16sp" textColor="#FFFFFF" bg="' + C.warning + '" w="36" h="36" gravity="center" cornerRadius="18" marginRight="6"/>' +
        '        <text id="btn_clear_script" text="' + I.trash + '" textSize="16sp" textColor="#FFFFFF" bg="' + C.error + '" w="36" h="36" gravity="center" cornerRadius="18"/>' +
        '      </horizontal>' +
        '      <!-- 编辑区域 -->' +
        '      <horizontal bg="#F0F4F8" cornerRadius="0 0 12 12" layout_weight="1">' +
        '        <!-- 行号 -->' +
        '        <scroll id="line_number_scroll" w="40" bg="#E2E8F0">' +
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
        '        <button id="btn_run_script" text="' + I.play + ' 运行" bg="' + C.primary + '" textColor="#FFFFFF" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" marginRight="4" textStyle="bold"/>' +
        '        <button id="btn_view_logs" text="' + I.list + ' 日志" bg="' + C.info + '" textColor="#FFFFFF" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" marginLeft="4" marginRight="4" visibility="gone"/>' +
        '        <button id="btn_save_task" text="' + I.save + ' 保存任务" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="14sp" cornerRadius="16" h="48" layout_weight="1" marginLeft="4" textStyle="bold"/>' +
        '      </horizontal>' +
        '    </vertical>' +
        '  </frame>' +
        '  <!-- 快捷操作栏 -->' +
        '  <horizontal id="quick_bar" bg="' + C.card + '" padding="8 8 12 8" gravity="center_vertical">' +
        '    <text id="btn_quick_pick" text="' + I.target + ' 拾取坐标到对话" textSize="12sp" textColor="' + C.textSecondary + '" bg="' + C.surface + '" padding="6 10" cornerRadius="8"/>' +
        '  </horizontal>' +
        '  <!-- 输入区域 -->' +
        '  <horizontal id="input_area" bg="' + C.card + '" padding="12 8 12 12" gravity="center_vertical">' +
        '    <input id="input_message" hint="输入消息..." textSize="15sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12 16" cornerRadius="20" layout_weight="1" singleLine="false" maxLines="4"/>' +
        '    <button id="btn_send" text="' + I.paperPlane + '" bg="' + C.primary + '" textColor="#FFFFFF" textSize="18sp" cornerRadius="20" h="44" w="48" marginLeft="8"/>' +
        '  </horizontal>' +
        '</vertical>'
    );
}

/**
 * 绑定事件处理
 */
function bindEvents(self, mgr) {
    // 快捷拾取坐标到对话
    ui.btn_quick_pick.on('click', function() {
        self.startCoordinatePicker(function(x, y) {
            // 回调：插入到对话输入框
            self.insertCoordinateToInput(x, y, ui.input_message);
        });
    });

    // Tab 切换
    ui.tab_chat.on('click', function() {
        self.switchTab('chat');
    });

    ui.tab_script.on('click', function() {
        self.switchTab('script');
    });

    ui.btn_back.on('click', function() {
        // 返回前保存当前对话到历史
        if (self.messages && self.messages.length > 1) {
            self.saveCurrentConversationToHistory();
        }
        back();
    });

    ui.btn_new_chat.on('click', function() {
        dialogs.confirm('新建对话', '确定要开始新对话吗？当前对话将被清空。', function(confirmed) {
            if (confirmed) {
                // 保存当前对话到历史
                if (self.messages.length > 0) {
                    self.saveCurrentConversationToHistory();
                }
                self.messages = [];
                self.addWelcomeMessage();
                scriptOperations.updateScriptPreview(self);
                if (ui.script_editor) {
                    ui.script_editor.setText('');
                    ui.script_title.setText('暂无脚本');
                    scriptOperations.updateLineNumbers();
                }
            }
        });
    });

    ui.btn_history.on('click', function() {
        // 跳转到单独的历史对话页面
        mgr.showAIHistory();
    });

    ui.btn_send.on('click', function() {
        console.log('[AI Chat] 发送按钮被点击');
        self.sendMessage();
    });

    ui.btn_save_task.on('click', function() {
        scriptOperations.saveAsTask(self);
    });

    ui.btn_run_script.on('click', function() {
        scriptOperations.runScript(self);
    });

    if (ui.btn_view_logs) {
        ui.btn_view_logs.on('click', function() {
            scriptOperations.viewTempTaskLogs(self);
        });
    }

    ui.btn_clear_script.on('click', function() {
        dialogs.confirm('清空脚本', '确定要清空编辑器中的脚本吗？', function(confirmed) {
            if (confirmed) {
                ui.script_editor.setText('');
                ui.script_title.setText('暂无脚本');
                scriptOperations.updateLineNumbers();
            }
        });
    });

    ui.btn_pick_coordinate.on('click', function() {
        self.startCoordinatePicker(function(x, y) {
            // 回调：插入到脚本编辑器
            self.insertCoordinateToInput(x, y, ui.script_editor);
            scriptOperations.updateLineNumbers();
        });
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
            scriptOperations.updateLineNumbers();
        }
    });

    // 为脚本编辑器启用实时代码高亮
    ui.post(function() {
        highlightedEditor.setupHighlightedEditor(ui.script_editor);
    }, 100);

    ui.input_message.on('key', function(keyCode, event) {
        if (keyCode === android.view.KeyEvent.KEYCODE_ENTER && !event.isShiftPressed()) {
            self.sendMessage();
            return true;
        }
        return false;
    });
}

module.exports = {
    buildLayout: buildLayout,
    bindEvents: bindEvents
};
