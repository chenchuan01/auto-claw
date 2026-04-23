/**
 * 任务日志独立页面模块
 * 显示完整任务日志，支持复制
 */

var HeaderBuilder = require('./header_builder');
var Config = require('../core/config');
var xmlEscape = require('../utils/xml_escape');
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
        HeaderBuilder.buildHeader({
            title: '任务日志',
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back',
            rightIcon: I.trash,
            rightIconId: 'btn_clear_logs'
        }) +
        '  <!-- 日志内容 -->' +
        '  <scroll bg="' + C.bg + '" layout_weight="1">' +
        '    <vertical padding="16">' +
        '      <vertical bg="' + C.card + '" cornerRadius="16" padding="16">' +
        '        <text id="log_content" textSize="12sp" textColor="' + C.textPrimary + '" lineSpacingExtra="4" textIsSelectable="true"/>' +
        '      </vertical>' +
        (hasError ?
        '      <horizontal marginTop="16">' +
        '        <button id="btn_copy_error" text="复制错误" bg="' + C.error + '" textColor="#FFFFFF" textSize="14sp" cornerRadius="12" h="40" layout_weight="1"/>' +
        '      </horizontal>' : '') +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    // 应用字体
    mgr.fontManager.applyLight(ui.btn_back, ui.btn_clear_logs);
    if (hasError && ui.btn_copy_error) {
        mgr.fontManager.applyLight(ui.btn_copy_error);
    }

    // 动态设置日志内容（避免XML转义问题）
    ui.log_content.setText(logText);

    // 事件绑定
    ui.btn_back.on('click', function() {
        back();
    });

    ui.btn_clear_logs.on('click', function() {
        dialogs.confirm('清空日志', '确定要清空这个任务的所有日志吗？', function(confirmed) {
            if (confirmed) {
                mgr.taskExecutor.clearTaskLogs(taskId);
                toast('日志已清空');
                self.show(taskId); // 刷新页面
            }
        });
    });

    if (hasError && ui.btn_copy_error) {
        ui.btn_copy_error.on('click', function() {
            setClip(errorText);
            toast('错误信息已复制到剪贴板');
        });
    }
};

module.exports = UITaskLogs;
