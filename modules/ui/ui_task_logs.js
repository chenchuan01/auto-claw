/**
 * 任务日志独立页面模块
 * 显示完整任务日志，支持复制
 */

var Config = require('../core/config');
var C = Config.colors;
var I = Config.icons;

function UITaskLogs(uiManager) {
    this.uiManager = uiManager;
    this.taskId = null;
}

UITaskLogs.prototype.show = function(taskId) {
    var self = this;
    var mgr = this.uiManager;
    var task = mgr.dataManager.getTaskById(taskId);
    if (!task) {
        toast('任务不存在');
        mgr.showMainView();
        return;
    }
    this.taskId = taskId;

    var logs = mgr.taskExecutor.getTaskLogs(taskId);
    var logText = logs.length > 0 ? logs.join('\n') : '暂无日志';

    // 检测是否有错误日志
    var hasError = false;
    var errorText = '';
    for (var i = 0; i < logs.length; i++) {
        if (logs[i].indexOf('✕') !== -1 || logs[i].indexOf('错误') !== -1 || logs[i].indexOf('失败') !== -1) {
            hasError = true;
            errorText += logs[i] + '\n';
        }
    }

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        '  <horizontal bg="' + C.primary + '" padding="20 16 16 16" gravity="center_vertical">' +
        '    <text id="btn_back" text="' + I.arrowLeft + '" textSize="24sp" textColor="#FFFFFF" padding="4 4 12 4"/>' +
        '    <text text="任务日志" textSize="22sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_copy" text="' + I.clipboardList + '" textSize="22sp" textColor="#FFFFFF" padding="8 8 0 8"/>' +
        '  </horizontal>' +
        '  <!-- 日志内容 -->' +
        '  <scroll bg="' + C.bg + '" layout_weight="1">' +
        '    <vertical padding="16">' +
        '      <vertical bg="' + C.card + '" cornerRadius="16" padding="16">' +
        '        <text id="log_content" text="' + logText.replace(/'/g, '\\\'') + '" textSize="12sp" textColor="' + C.textPrimary + '" lineSpacingExtra="4" textIsSelectable="true"/>' +
        '      </vertical>' +
        (hasError ?
        '      <horizontal marginTop="16">' +
        '        <button id="btn_copy_error" text="复制错误" bg="' + C.error + '" textColor="white" textSize="14sp" cornerRadius="12" h="40" layout_weight="1"/>' +
        '      </horizontal>' : '') +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    // 应用字体
    mgr.fontManager.apply(ui.btn_back, ui.btn_copy, ui.btn_back);
    if (hasError && ui.btn_copy_error) {
        mgr.fontManager.apply(ui.btn_copy_error);
    }

    // 事件绑定
    ui.btn_back.on('click', function() {
        mgr.showTaskDetail(self.taskId);
    });

    ui.btn_copy.on('click', function() {
        if (!logText || logText === '暂无日志') {
            toast('暂无日志内容');
            return;
        }
        setClip(logText);
        toast('全部日志已复制到剪贴板');
    });

    if (hasError && ui.btn_copy_error) {
        ui.btn_copy_error.on('click', function() {
            setClip(errorText);
            toast('错误信息已复制到剪贴板');
        });
    }
};

module.exports = UITaskLogs;
