/**
 * UI脚本编辑器模块
 * 提供任务详情查看和脚本编辑功能
 */

var Config = require('../../core/config');
var HeaderBuilder = require('../header_builder');
var codeUtils = require('./codeUtils');
var C = Config.colors;
var I = Config.icons;

function UIScriptEditor(uiManager) {
    this.uiManager = uiManager;
    this.currentTaskId = null;
    this.scriptContent = '';
}

/**
 * 显示编辑器
 */
UIScriptEditor.prototype.show = function(taskId) {
    var self = this;
    var mgr = this.uiManager;
    var task = mgr.dataManager.getTaskById(taskId);
    if (!task) {
        toast('任务不存在');
        return;
    }

    self.currentTaskId = taskId;
    self.scriptContent = task.script || Config.defaultScript;

    var statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;

    // 计算定时信息
    var scheduleText = '';
    if (task.schedule && task.schedule.enabled && task.schedule.time) {
        scheduleText = self.calcNextRunText(task.schedule);
    }

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        HeaderBuilder.buildHeader({
            title: '任务详情与编辑',
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back',
            rightIcon: I.save,
            rightIconId: 'btn_save'
        }) +
        '  <!-- 内容区域 -->' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="20">' +
        '      <!-- 任务信息卡片 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24">' +
        '        <horizontal gravity="center_vertical">' +
        '          <text text="' + task.name + '" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        (scheduleText ? '          <text id="schedule_text" text="' + I.clock + ' ' + scheduleText + '" textSize="12sp" textColor="' + C.primary + '" marginRight="10" textStyle="bold"/>' : '') +
        '          <text text="' + statusInfo.text + '" textSize="12sp" textColor="#FFFFFF" bg="' + statusInfo.color + '" padding="5 12" cornerRadius="20" textStyle="bold"/>' +
        '        </horizontal>' +
        '        <text text="' + (task.description || '暂无描述') + '" textSize="14sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        <text id="task_run_count" text="' + I.play + ' 执行 ' + (task.runCount || 0) + ' 次" textSize="13sp" textColor="' + C.textHint + '" marginTop="10"/>' +
        '      </vertical>' +
        '      <!-- 脚本编辑器 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <!-- 第一行：标题 -->' +
        '        <text text="任务脚本" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        <!-- 第二行：快捷按钮 -->' +
        '        <horizontal gravity="center_vertical" marginBottom="12">' +
        '          <button id="btn_ai_edit" text="' + I.robot + '" w="48" h="48" marginRight="8" bg="' + C.primary + '" textColor="#FFFFFF" textSize="20sp" cornerRadius="12"/>' +
        '          <button id="btn_format" text="' + I.bars + '" w="48" h="48" marginRight="8" bg="' + C.info + '" textColor="#FFFFFF" textSize="20sp" cornerRadius="12"/>' +
        '          <button id="btn_snippets" text="' + I.code + '" w="48" h="48" marginRight="8" bg="' + C.success + '" textColor="#FFFFFF" textSize="20sp" cornerRadius="12"/>' +
        '          <button id="btn_reset" text="' + I.undo + '" w="48" h="48" bg="' + C.warning + '" textColor="#FFFFFF" textSize="20sp" cornerRadius="12"/>' +
        '        </horizontal>' +
        '        <input id="script_input" hint="请输入任务脚本代码..." textSize="13sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="16" cornerRadius="12" minLines="15" gravity="top" singleLine="false"/>' +
        '      </vertical>' +
        '      <!-- 任务信息 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="任务信息" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        <horizontal padding="0 8" marginTop="12">' +
        '          <text text="创建时间" textSize="14sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + mgr.formatTime(task.createTime) + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 8" marginTop="12">' +
        '          <text text="最后执行" textSize="14sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + mgr.formatTime(task.lastRunTime) + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 8" marginTop="12">' +
        '          <text text="作者" textSize="14sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text id="task_author" text="' + (task.authorId === 'system' ? I.robot + ' ' : (task.authorId ? I.user + ' ' : '')) + (task.author || '本地创建') + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 8" marginTop="12">' +
        '          <text text="任务来源" textSize="14sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + (task.source === 'market' ? '中心导入' : '本地创建') + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <!-- 操作按钮 -->' +
        '      <vertical marginTop="24">' +
        '        <horizontal>' +
        '          <button id="btn_run_now" text="' + I.play + ' 执行任务" layout_weight="1" marginRight="8" bg="' + C.primary + '" textColor="#FFFFFF" textSize="15sp" cornerRadius="16" h="48" textStyle="bold"/>' +
        '          <button id="btn_logs" text="' + I.bars + ' 查看日志" layout_weight="1" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="15sp" cornerRadius="16" h="48"/>' +
        '        </horizontal>' +
        '        <button id="btn_delete" text="' + I.xmark + ' 删除任务" bg="' + C.error + '" textColor="#FFFFFF" textSize="15sp" cornerRadius="16" h="48" marginTop="12"/>' +
        '      </vertical>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    ui.script_input.setText(self.scriptContent);

    mgr.fontManager.applyLight(ui.btn_back, ui.btn_save);

    // 应用字体到图标元素
    var iconElements = [ui.btn_ai_edit, ui.btn_format, ui.btn_snippets, ui.btn_reset, ui.task_run_count, ui.task_author, ui.btn_run_now, ui.btn_logs, ui.btn_delete];
    if (ui.schedule_text) {
        iconElements.push(ui.schedule_text);
    }
    mgr.fontManager.apply.apply(mgr.fontManager, iconElements);

    ui.btn_back.on('click', function() {
        self.confirmExit();
    });

    ui.btn_save.on('click', function() {
        self.saveScript();
    });

    ui.btn_ai_edit.on('click', function() {
        var currentScript = ui.script_input.getText().toString();
        mgr.startAIEditWithScript(currentScript, task.name, self.currentTaskId);
    });

    ui.btn_reset.on('click', function() {
        dialogs.confirm('重置脚本', '确定要重置为原始脚本吗？当前未保存的修改将丢失。', function(confirmed) {
            if (confirmed) {
                ui.script_input.setText(self.scriptContent);
                toast('已重置');
            }
        });
    });

    ui.btn_format.on('click', function() {
        var currentScript = ui.script_input.getText().toString();
        var formatted = codeUtils.formatScript(currentScript);
        ui.script_input.setText(formatted);
        toast('脚本已格式化');
    });

    ui.btn_snippets.on('click', function() {
        self.showSnippetsDialog();
    });

    ui.btn_run_now.on('click', function() {
        self.saveAndExecute();
    });

    ui.btn_logs.on('click', function() {
        mgr.dialogs.showTaskLogs(taskId);
    });

    ui.btn_delete.on('click', function() {
        mgr.dialogs.confirmDeleteTask(taskId);
    });
};

/**
 * 保存脚本
 */
UIScriptEditor.prototype.saveScript = function() {
    var self = this;
    var mgr = this.uiManager;
    var newScript = ui.script_input.getText().toString();

    if (!newScript || newScript.trim() === '') {
        toast('脚本内容不能为空');
        return;
    }

    mgr.dataManager.updateTask(self.currentTaskId, {
        script: newScript
    });

    self.scriptContent = newScript;
    toast('脚本已保存');
};

/**
 * 保存并执行
 */
UIScriptEditor.prototype.saveAndExecute = function() {
    var self = this;
    var mgr = this.uiManager;
    var newScript = ui.script_input.getText().toString();

    if (!newScript || newScript.trim() === '') {
        toast('脚本内容不能为空');
        return;
    }

    mgr.dataManager.updateTask(self.currentTaskId, {
        script: newScript
    });

    self.scriptContent = newScript;
    toast('脚本已保存，开始执行...');

    setTimeout(function() {
        mgr.executeTask(self.currentTaskId);
    }, 500);
};

/**
 * 确认退出
 */
UIScriptEditor.prototype.confirmExit = function() {
    var self = this;
    var mgr = this.uiManager;
    var currentScript = ui.script_input.getText().toString();

    if (currentScript !== self.scriptContent) {
        dialogs.confirm('退出编辑', '脚本已修改但未保存，确定要退出吗？', function(confirmed) {
            if (confirmed) {
                // 直接返回上一页
                back();
            }
        });
    } else {
        // 直接返回上一页
        back();
    }
};

/**
 * 显示代码片段对话框
 */
UIScriptEditor.prototype.showSnippetsDialog = function() {
    var self = this;
    codeUtils.showSnippetsDialog(function(snippet) {
        var currentScript = ui.script_input.getText().toString();
        var cursorPos = 0;

        // 尝试获取光标位置（如果支持）
        try {
            cursorPos = ui.script_input.getSelectionStart();
        } catch (e) {
            cursorPos = currentScript.length;
        }

        // 在光标位置插入代码片段
        var newScript = currentScript.substring(0, cursorPos) +
                       snippet.code +
                       currentScript.substring(cursorPos);

        ui.script_input.setText(newScript);

        // 尝试设置光标位置到插入内容之后
        try {
            var newCursorPos = cursorPos + snippet.code.length;
            ui.script_input.setSelection(newCursorPos, newCursorPos);
        } catch (e) {
            // 忽略错误
        }

        toast('已插入代码片段: ' + snippet.name);
    });
};

/**
 * 计算下次执行时间文本
 */
UIScriptEditor.prototype.calcNextRunText = function(schedule) {
    if (!schedule || !schedule.time) return '';

    var now = new Date();
    var timeParts = schedule.time.split(':');
    var hour = parseInt(timeParts[0]);
    var minute = parseInt(timeParts[1]);

    var nextRun = new Date();
    nextRun.setHours(hour);
    nextRun.setMinutes(minute);
    nextRun.setSeconds(0);
    nextRun.setMilliseconds(0);

    // 如果今天的时间已过，推到明天
    if (nextRun <= now) {
        nextRun.setDate(nextRun.getDate() + 1);
    }

    // 根据周期调整
    if (schedule.cycle === 'weekday') {
        // 工作日（周一到周五）
        while (nextRun.getDay() === 0 || nextRun.getDay() === 6) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
    } else if (schedule.cycle === 'weekend') {
        // 周末（周六、周日）
        while (nextRun.getDay() !== 0 && nextRun.getDay() !== 6) {
            nextRun.setDate(nextRun.getDate() + 1);
        }
    }

    var today = new Date();
    today.setHours(0, 0, 0, 0);
    var tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    var nextRunDay = new Date(nextRun);
    nextRunDay.setHours(0, 0, 0, 0);

    if (nextRunDay.getTime() === today.getTime()) {
        return '今天 ' + schedule.time;
    } else if (nextRunDay.getTime() === tomorrow.getTime()) {
        return '明天 ' + schedule.time;
    } else {
        var month = nextRun.getMonth() + 1;
        var day = nextRun.getDate();
        return month + '/' + day + ' ' + schedule.time;
    }
};

module.exports = UIScriptEditor;
