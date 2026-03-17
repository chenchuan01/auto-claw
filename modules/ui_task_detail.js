/**
 * UI任务详情模块
 */

var Config = require('./config');
var C = Config.colors;

function UITaskDetail(uiManager) {
    this.uiManager = uiManager;
}

UITaskDetail.prototype.show = function(taskId) {
    var self = this;
    var mgr = this.uiManager;
    var task = mgr.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    var statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <horizontal bg="' + C.primary + '" padding="12 14" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="22sp" textColor="#FFFFFF" padding="4 4 12 4"/>' +
        '    <text text="任务详情" textSize="18sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_edit" text="✎" textSize="20sp" textColor="#FFFFFF" padding="8"/>' +
        '  </horizontal>' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="16">' +
        '      <vertical bg="' + C.card + '" cornerRadius="14" padding="20">' +
        '        <text text="' + task.name + '" textSize="20sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text text="' + (task.description || '暂无描述') + '" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="6"/>' +
        '        <horizontal marginTop="14" gravity="center_vertical">' +
        '          <text text="' + statusInfo.text + '" textSize="12sp" textColor="' + statusInfo.color + '" bg="' + statusInfo.color + '22" padding="4 12" cornerRadius="20"/>' +
        '          <text text="执行 ' + (task.runCount || 0) + ' 次" textSize="12sp" textColor="' + C.textHint + '" layout_weight="1" gravity="right"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <vertical bg="' + C.card + '" cornerRadius="14" padding="20" marginTop="12">' +
        '        <text text="任务信息" textSize="14sp" textColor="' + C.textSecondary + '" textStyle="bold" marginBottom="12"/>' +
        '        <horizontal padding="0 6">' +
        '          <text text="创建时间" textSize="13sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + mgr.formatTime(task.createTime) + '" textSize="13sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 6" marginTop="8">' +
        '          <text text="最后执行" textSize="13sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + mgr.formatTime(task.lastRunTime) + '" textSize="13sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 6" marginTop="8">' +
        '          <text text="任务来源" textSize="13sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + (task.source === 'market' ? '市场导入' : '本地创建') + '" textSize="13sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <horizontal marginTop="16">' +
        '        <button id="btn_run_now" text="▶  执行" layout_weight="1" marginRight="8" bg="' + C.primary + '" textColor="white" textSize="14sp" cornerRadius="10" h="44"/>' +
        '        <button id="btn_logs" text="📝  日志" layout_weight="1" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="14sp" cornerRadius="10" h="44"/>' +
        '      </horizontal>' +
        '      <horizontal marginTop="10">' +
        '        <button id="btn_export" text="导出" layout_weight="1" marginRight="8" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="14sp" cornerRadius="10" h="44"/>' +
        '        <button id="btn_delete" text="删除" layout_weight="1" bg="#EF444422" textColor="#EF4444" textSize="14sp" cornerRadius="10" h="44"/>' +
        '      </horizontal>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    ui.btn_back.on('click', function() { mgr.showMainView(); });
    ui.btn_edit.on('click', function() { mgr.dialogs.showEditTask(taskId); });
    ui.btn_run_now.on('click', function() { mgr.executeTask(taskId); });
    ui.btn_logs.on('click', function() { mgr.dialogs.showTaskLogs(taskId); });
    ui.btn_export.on('click', function() { mgr.exportTaskScript(taskId); });
    ui.btn_delete.on('click', function() { mgr.dialogs.confirmDeleteTask(taskId); });
};

module.exports = UITaskDetail;
