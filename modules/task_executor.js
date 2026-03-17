/**
 * 任务执行器模块
 * 负责任务的执行、停止和状态管理
 */

var Config = require('./config');

function TaskExecutor(dataManager) {
    this.dataManager = dataManager;
    this.runningTasks = {}; // taskId -> thread
    this.taskLogs = {};     // taskId -> logs[]
}

TaskExecutor.prototype.executeTask = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);

    if (!task) { toast('任务不存在'); return false; }
    if (this.runningTasks[taskId]) { toast('任务正在执行中'); return false; }

    this.dataManager.updateTask(taskId, {
        status: 'running',
        lastRunTime: Date.now(),
        runCount: (task.runCount || 0) + 1
    });

    this.taskLogs[taskId] = [];
    this.addTaskLog(taskId, '🚀 开始执行任务: ' + task.name);
    this.addTaskLog(taskId, '📅 开始时间: ' + new Date().toLocaleString());

    // 在主线程中执行脚本，避免线程间通信问题
    try {
        this.addTaskLog(taskId, '📝 开始执行脚本...');

        var originalLog = console.log;
        var logTaskId = taskId;
        var logSelf = self;
        console.log = function() {
            var args = Array.prototype.slice.call(arguments);
            var msg = args.map(function(a) {
                return typeof a === 'object' ? JSON.stringify(a) : String(a);
            }).join(' ');
            logSelf.addTaskLog(logTaskId, msg);
            // 直接调用原始 log 函数，避免 apply 兼容性问题
            if (args.length === 0) {
                originalLog();
            } else if (args.length === 1) {
                originalLog(args[0]);
            } else if (args.length === 2) {
                originalLog(args[0], args[1]);
            } else if (args.length === 3) {
                originalLog(args[0], args[1], args[2]);
            } else {
                originalLog(args.join(' '));
            }
        };

        eval(task.script);
        console.log = originalLog;

        this.addTaskLog(taskId, '✅ 任务执行成功');
        this.dataManager.updateTask(taskId, { status: 'success' });
        toast('任务执行成功');
    } catch (e) {
        this.addTaskLog(taskId, '❌ 任务执行失败: ' + e.message);
        this.addTaskLog(taskId, '🔍 错误堆栈: ' + e.stack);
        this.dataManager.updateTask(taskId, { status: 'failed' });
        toast('任务执行失败: ' + e.message);
    } finally {
        delete this.runningTasks[taskId];
        this.addTaskLog(taskId, '🏁 任务执行结束: ' + new Date().toLocaleString());
    }

    toast('任务开始执行...');
    return true;
};

TaskExecutor.prototype.stopTask = function(taskId) {
    var thread = this.runningTasks[taskId];
    if (!thread) { toast('任务未在运行'); return false; }

    try {
        thread.interrupt();
        delete this.runningTasks[taskId];
        this.dataManager.updateTask(taskId, { status: 'paused' });
        this.addTaskLog(taskId, '⏸️ 任务被手动停止');
        toast('任务已停止');
        return true;
    } catch (e) {
        toast('停止任务失败: ' + e.message);
        return false;
    }
};

TaskExecutor.prototype.getTaskStatus = function(taskId) {
    return {
        isRunning: !!this.runningTasks[taskId],
        thread: this.runningTasks[taskId] || null,
        logs: this.taskLogs[taskId] || []
    };
};

TaskExecutor.prototype.getRunningTasks = function() {
    var self = this;
    var result = [];
    for (var taskId in this.runningTasks) {
        if (!this.runningTasks.hasOwnProperty(taskId)) continue;
        var task = this.dataManager.getTaskById(taskId);
        if (task) {
            result.push({
                taskId: taskId,
                taskName: task.name,
                startTime: task.lastRunTime,
                logs: self.taskLogs[taskId] || []
            });
        }
    }
    return result;
};

TaskExecutor.prototype.stopAllTasks = function() {
    var stoppedCount = 0;
    for (var taskId in this.runningTasks) {
        if (!this.runningTasks.hasOwnProperty(taskId)) continue;
        try {
            this.runningTasks[taskId].interrupt();
            this.dataManager.updateTask(taskId, { status: 'paused' });
            this.addTaskLog(taskId, '⏸️ 任务被批量停止');
            stoppedCount++;
        } catch (e) {
            console.error('停止任务失败:', taskId, e);
        }
    }
    this.runningTasks = {};
    toast('已停止 ' + stoppedCount + ' 个任务');
    return stoppedCount;
};

TaskExecutor.prototype.addTaskLog = function(taskId, message) {
    if (!this.taskLogs[taskId]) this.taskLogs[taskId] = [];
    var logs = this.taskLogs[taskId];
    var timestamp = new Date().toLocaleTimeString();
    logs.push('[' + timestamp + '] ' + message);
    if (logs.length > 1000) logs.splice(0, 200);
};

TaskExecutor.prototype.getTaskLogs = function(taskId, limit) {
    limit = limit || 100;
    var logs = this.taskLogs[taskId] || [];
    return logs.slice(-limit);
};

TaskExecutor.prototype.clearTaskLogs = function(taskId) {
    this.taskLogs[taskId] = [];
    return true;
};

TaskExecutor.prototype.exportTaskLogs = function(taskId, filePath) {
    try {
        var logs = this.getTaskLogs(taskId);
        var task = this.dataManager.getTaskById(taskId);
        if (!task) return { success: false, error: '任务不存在' };

        var lines = [
            '任务名称: ' + task.name,
            '任务ID: ' + taskId,
            '导出时间: ' + new Date().toLocaleString(),
            '日志数量: ' + logs.length,
            '',
            '=== 任务日志 ==='
        ].concat(logs);

        files.write(filePath, lines.join('\n'));
        return { success: true, filePath: filePath, logCount: logs.length };
    } catch (e) {
        return { success: false, error: e.message };
    }
};

TaskExecutor.prototype.executeTasks = function(taskIds) {
    var successCount = 0, failCount = 0;
    for (var i = 0; i < taskIds.length; i++) {
        if (this.executeTask(taskIds[i])) successCount++;
        else failCount++;
    }
    return { total: taskIds.length, success: successCount, failed: failCount };
};

TaskExecutor.prototype.validateTaskScript = function(script) {
    try {
        eval('(function() {' + script + '})');
        return { valid: true, message: '脚本语法正确' };
    } catch (e) {
        return { valid: false, message: e.message, line: e.lineNumber, column: e.columnNumber };
    }
};

module.exports = TaskExecutor;
