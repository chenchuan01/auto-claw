/**
 * UI任务详情模块
 */

var Config = require('../core/config');
var HeaderBuilder = require('./header_builder');
var xmlEscape = require('../utils/xml_escape');
var C = Config.colors;
var I = Config.icons;

function UITaskDetail(uiManager) {
    this.uiManager = uiManager;
    this.pollInterval = null;
}

UITaskDetail.prototype.stopPolling = function() {
    if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
    }
};

UITaskDetail.prototype.show = function(taskId) {
    var self = this;
    var mgr = this.uiManager;
    var task = mgr.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    this.stopPolling();

    var statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        HeaderBuilder.buildHeader({
            title: '任务详情',
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back',
            rightIcon: I.pen,
            rightIconId: 'btn_edit'
        }) +
        '  <!-- 内容区域 -->' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="20">' +
        '      <!-- 任务卡片 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24">' +
        '        <text text="' + task.name + '" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text text="' + (task.description || '暂无描述') + '" textSize="14sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        <horizontal marginTop="18" gravity="center_vertical">' +
        '          <text id="task_status_badge" text="' + statusInfo.text + '" textSize="13sp" textColor="#FFFFFF" bg="' + statusInfo.color + '" padding="6 14" cornerRadius="26" textStyle="bold"/>' +
        '          <text id="task_run_count" text="' + I.play + ' 执行 ' + (task.runCount || 0) + ' 次" textSize="13sp" textColor="' + C.textHint + '" layout_weight="1" gravity="right"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <!-- 任务脚本预览 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="任务脚本" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        <input id="script_preview" textSize="12sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12" cornerRadius="18" minLines="8" maxLines="20" gravity="top" singleLine="false" inputType="textMultiLine"/>' +
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
        '          <text id="task_author" text="' + (task.authorId === 'system' ? I.robot + ' ' : (task.authorId ? I.user + ' ' : '')) + (task.author || '系统') + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 8" marginTop="12">' +
        '          <text text="任务来源" textSize="14sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + (task.source === 'market' ? '中心导入' : '本地创建') + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <!-- 操作按钮 -->' +
        '      <vertical marginTop="20">' +
        '        <horizontal>' +
        '        <button id="btn_run_now" text="' + I.play + ' 执行任务" layout_weight="1" marginRight="8" bg="' + C.primary + '" textColor="#FFFFFF" textSize="15sp" cornerRadius="22" h="48" textStyle="bold"/>' +
        '          <button id="btn_logs" text="' + I.bars + ' 查看日志" layout_weight="1" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="15sp" cornerRadius="22" h="48"/>' +
        '        </horizontal>' +
        '        <horizontal marginTop="12">' +
        '          <button id="btn_delete" text="' + I.xmark + ' 删除任务" layout_weight="1" bg="' + C.error + '" textColor="#FFFFFF" textSize="15sp" cornerRadius="22" h="48" marginTop="0"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    // 更新执行/停止按钮状态
    function updateRunButton() {
        var isRunning = mgr.taskExecutor.getTaskStatus(taskId).isRunning;
        if (isRunning) {
            ui.btn_run_now.setText(I.stop + ' 停止任务');
            ui.btn_run_now.attr('bg', C.error);
        } else {
            ui.btn_run_now.setText(I.play + ' 执行任务');
            ui.btn_run_now.attr('bg', C.primary);
        }
    }

    updateRunButton();

    // 动态设置脚本内容（避免XML转义问题）
    ui.script_preview.setText(task.script || '暂无脚本');

    // 应用 Font Awesome 字体
    mgr.fontManager.apply(ui.btn_back, ui.btn_edit, ui.btn_run_now, ui.btn_logs, ui.btn_delete, ui.task_run_count, ui.task_author);

    // 轮询更新按钮状态
    self.pollInterval = setInterval(function() {
        if (mgr.currentView === 'task_detail' && mgr.currentTaskId === taskId) {
            updateRunButton();
        } else {
            self.stopPolling();
        }
    }, 1000);

    ui.btn_back.on('click', function() {
        self.stopPolling();
        back();
    });
    ui.btn_edit.on('click', function() {
        self.stopPolling();
        mgr.showScriptEditor(taskId);
    });
    ui.btn_run_now.on('click', function() {
        var isRunning = mgr.taskExecutor.getTaskStatus(taskId).isRunning;
        if (isRunning) {
            mgr.stopTask(taskId);
        } else {
            mgr.executeTask(taskId);
        }
        setTimeout(updateRunButton, 300);
    });
    ui.btn_logs.on('click', function() { mgr.dialogs.showTaskLogs(taskId); });
    ui.btn_delete.on('click', function() {
        self.stopPolling();
        mgr.dialogs.confirmDeleteTask(taskId);
    });
};

module.exports = UITaskDetail;
