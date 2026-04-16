/**
 * UI对话框模块
 */

var Config = require('./config');

function UIDialogs(uiManager) {
    this.uiManager = uiManager;
}

UIDialogs.prototype.showAddTaskDialog = function() {
    var self = this;
    var mgr = this.uiManager;
    dialogs.rawInput('请输入任务名称', '', function(name) {
        if (!name || !name.trim()) return;
        dialogs.rawInput('请输入任务描述（可选）', '', function(description) {
            dialogs.rawInput('请输入任务脚本', Config.defaultScript, function(script) {
                mgr.dataManager.addTask({
                    name: name.trim(),
                    description: description ? description.trim() : '',
                    script: script || Config.defaultScript
                });
                toast('任务创建成功');
                mgr.showMainView();
            });
        });
    });
};

UIDialogs.prototype.showEditTask = function(taskId) {
    var self = this;
    var mgr = this.uiManager;
    var task = mgr.dataManager.getTaskById(taskId);
    if (!task) return;
    dialogs.rawInput('请输入任务名称', task.name, function(name) {
        if (!name || !name.trim()) return;
        dialogs.rawInput('请输入任务描述', task.description || '', function(description) {
            dialogs.rawInput('请输入任务脚本', task.script || Config.defaultScript, function(script) {
                mgr.dataManager.updateTask(taskId, {
                    name: name.trim(),
                    description: description.trim(),
                    script: script
                });
                toast('任务更新成功');
                mgr.showMainView();
            });
        });
    });
};

UIDialogs.prototype.showTaskManagement = function(taskId) {
    var self = this;
    var mgr = this.uiManager;
    var task = mgr.dataManager.getTaskById(taskId);
    if (!task) return;
    var options = ['查看详情', '编辑脚本', '查看日志', '定时执行', '删除任务'];
    dialogs.select('任务管理', options, function(index) {
        if (index < 0) return;
        switch (options[index]) {
            case '查看详情': mgr.showTaskDetail(taskId); break;
            case '编辑脚本': mgr.showScriptEditor(taskId); break;
            case '查看日志': self.showTaskLogs(taskId); break;
            case '定时执行': mgr.showScheduleDialog(taskId); break;
            case '删除任务': self.confirmDeleteTask(taskId); break;
        }
    });
};

UIDialogs.prototype.confirmDeleteTask = function(taskId) {
    var self = this;
    var mgr = this.uiManager;
    var task = mgr.dataManager.getTaskById(taskId);
    if (!task) return;
    dialogs.confirm('删除任务', '确定要删除"' + task.name + '"吗？此操作不可撤销。', function(confirmed) {
        if (confirmed) {
            mgr.dataManager.deleteTask(taskId);
            toast('任务已删除');
            mgr.showMainView();
        }
    });
};

UIDialogs.prototype.showTaskLogs = function(taskId) {
    var mgr = this.uiManager;
    mgr.showTaskLogs(taskId);
};

UIDialogs.prototype.importMarketTask = function(marketTask) {
    var self = this;
    var mgr = this.uiManager;
    dialogs.confirm('导入任务', '确定要导入"' + marketTask.name + '"吗？', function(confirmed) {
        if (confirmed) {
            mgr.dataManager.addTask({
                name: marketTask.name,
                description: marketTask.description,
                script: marketTask.script,
                source: 'market',
                marketId: marketTask.id,
                author: marketTask.author || '系统',
                authorId: marketTask.authorId || 'system'
            });
            toast('任务导入成功');
            mgr.showMainView();
        }
    });
};

module.exports = UIDialogs;
