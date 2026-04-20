/**
 * AI对话 - 布局构建模块
 * 构建UI布局XML
 */

var Config = require('../../core/config');
var C = Config.colors;
var I = Config.icons;

/**
 * 构建普通聊天页面布局
 */
function buildLayout() {
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
        '  <!-- 快捷操作栏 -->' +
        '  <horizontal id="quick_bar" bg="' + C.card + '" padding="8 8 12 8" gravity="center_vertical">' +
        '    <text id="btn_quick_pick" text="' + I.target + ' 拾取坐标到对话" textSize="12sp" textColor="' + C.primary + '" bg="' + C.primary + '22" padding="6 10" cornerRadius="8"/>' +
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
 * 构建编辑模式布局（编辑已有脚本）
 */
function buildLayoutWithEdit(taskName) {
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
        '  <!-- 快捷操作栏 -->' +
        '  <horizontal id="quick_bar" bg="' + C.card + '" padding="8 8 12 8" gravity="center_vertical">' +
        '    <text id="btn_quick_pick" text="' + I.target + ' 拾取坐标到对话" textSize="12sp" textColor="' + C.primary + '" bg="' + C.primary + '22" padding="6 10" cornerRadius="8"/>' +
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
        mgr.showMainView();
    });

    ui.btn_new_chat.on('click', function() {
        dialogs.confirm('新建对话', '确定要开始新对话吗？当前对话将被清空。', function(confirmed) {
            if (confirmed) {
                self.messages = [];
                self.addWelcomeMessage();
                self.updateScriptPreview(self);
            }
        });
    });

    ui.btn_send.on('click', function() {
        console.log('[AI Chat] 发送按钮被点击');
        self.sendMessage();
    });

    ui.btn_save_task.on('click', function() {
        self.saveAsTask(self);
    });

    ui.btn_run_script.on('click', function() {
        self.runScript(self);
    });

    ui.btn_view_logs.on('click', function() {
        self.viewTempTaskLogs(self);
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
        self.startCoordinatePicker(function(x, y) {
            // 回调：插入到脚本编辑器
            self.insertCoordinateToInput(x, y, ui.script_editor);
            self.updateLineNumbers();
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
}

/**
 * 绑定编辑模式事件
 */
function bindEventsWithEdit(self, mgr) {
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
        mgr.showTaskDetail(self.currentTaskId);
    });

    ui.btn_new_chat.on('click', function() {
        dialogs.confirm('新建对话', '确定要开始新对话吗？当前对话将被清空。', function(confirmed) {
            if (confirmed) {
                self.messages = [];
                self.addWelcomeMessage();
                self.updateScriptPreview(self);
            }
        });
    });

    ui.btn_send.on('click', function() {
        console.log('[AI Chat] 发送按钮被点击');
        self.sendMessage();
    });

    ui.btn_save_task.on('click', function() {
        self.saveAsTask(self);
    });

    ui.btn_run_script.on('click', function() {
        self.runScript(self);
    });

    ui.btn_view_logs.on('click', function() {
        self.viewTempTaskLogs(self);
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
        self.startCoordinatePicker(function(x, y) {
            // 回调：插入到脚本编辑器
            self.insertCoordinateToInput(x, y, ui.script_editor);
            self.updateLineNumbers();
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
}

module.exports = {
    buildLayout: buildLayout,
    buildLayoutWithEdit: buildLayoutWithEdit,
    bindEvents: bindEvents,
    bindEventsWithEdit: bindEventsWithEdit
};
