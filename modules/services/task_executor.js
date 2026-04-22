/**
 * 任务执行器模块
 * 负责任务的执行、停止和状态管理
 */

var Config = require('../core/config');

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

    // 如果日志不存在，初始化
    if (!this.taskLogs[taskId]) {
        this.taskLogs[taskId] = [];
    }

    // 添加分隔线，新执行日志和历史日志分开
    if (this.taskLogs[taskId].length > 0) {
        this.addTaskLog(taskId, '');
        this.addTaskLog(taskId, '────────────────────────────────────');
        var d = new Date();
        var dateStr = d.getFullYear() + '-' +
                    String(d.getMonth() + 1).padStart(2, '0') + '-' +
                    String(d.getDate()).padStart(2, '0') + ' ' +
                    String(d.getHours()).padStart(2, '0') + ':' +
                    String(d.getMinutes()).padStart(2, '0');
        this.addTaskLog(taskId, '🔄 【新执行】' + dateStr);
    }

    var d = new Date();
    var dateStr = d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0') + ' ' +
                String(d.getHours()).padStart(2, '0') + ':' +
                String(d.getMinutes()).padStart(2, '0');
    this.addTaskLog(taskId, '[START] 开始执行任务: ' + task.name);
    this.addTaskLog(taskId, '[TIME] ' + dateStr);

    try {
        // 使用 threads.start 直接在新线程执行脚本，这种方式更可靠
        var thread = threads.start(function() {
            try {
                eval(task.script);
            } catch (e) {
                self.addTaskLog(taskId, '✕ 脚本执行异常: ' + e.message + ' @行 ' + e.lineNumber);
            }
        });
        this.runningTasks[taskId] = thread;

        if (!thread || typeof thread.isAlive !== 'function') {
            self.addTaskLog(taskId, '✕ 无法创建执行线程');
            this.dataManager.updateTask(taskId, { status: 'failed' });
            toast('无法创建执行线程');
            return false;
        }

        // 监控脚本完成
        threads.start(function() {
            try {
                // 使用轮询方式等待线程结束
                while (thread.isAlive()) {
                    sleep(100);
                }
            } catch (e) {
                // 等待过程中发生异常
                self.addTaskLog(taskId, '✕ 监控异常: ' + e.message);
            } finally {
                // 不管怎样，都清理运行记录并更新状态
                if (self.runningTasks[taskId] === thread) {
                    delete self.runningTasks[taskId];
                }
                var currentTask = self.dataManager.getTaskById(taskId);
                if (currentTask) {
                    // 如果任务还在运行状态，说明它正常执行完成了
                    // 如果已经被停止，就保持停止状态
                    if (currentTask.status === 'running') {
                        // 检查线程是否真的执行成功
                        var isSuccess = true;
                        try {
                            isSuccess = thread && thread.isAlive && !thread.isAlive();
                        } catch(e) {
                            isSuccess = true;
                        }
                        self.dataManager.updateTask(taskId, {
                            status: isSuccess ? 'success' : 'failed'
                        });
                        if (isSuccess) {
                            self.addTaskLog(taskId, '[OK] 任务执行完成');
                        } else {
                            self.addTaskLog(taskId, '✕ 任务执行失败');
                        }
                    }
                }
                var d = new Date();
                var dateStr = d.getFullYear() + '-' +
                            String(d.getMonth() + 1).padStart(2, '0') + '-' +
                            String(d.getDate()).padStart(2, '0') + ' ' +
                            String(d.getHours()).padStart(2, '0') + ':' +
                            String(d.getMinutes()).padStart(2, '0');
                self.addTaskLog(taskId, '[END] 任务执行结束: ' + dateStr);
            }
        });

        toast('任务开始执行...');
        return true;
    } catch (e) {
        delete this.runningTasks[taskId];
        this.addTaskLog(taskId, '✕ 启动任务失败: ' + e.message);
        this.dataManager.updateTask(taskId, { status: 'failed' });
        toast('启动任务失败: ' + e.message);
        return false;
    }
};

TaskExecutor.prototype.stopTask = function(taskId) {
    var thread = this.runningTasks[taskId];
    if (!thread) { toast('任务未在运行'); return false; }

    try {
        thread.interrupt();
        delete this.runningTasks[taskId];
        this.dataManager.updateTask(taskId, { status: 'paused' });
        this.addTaskLog(taskId, '‖ 任务被手动停止');
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
            this.runningTasks[taskId].forceStop();
            this.dataManager.updateTask(taskId, { status: 'paused' });
            this.addTaskLog(taskId, '‖ 任务被批量停止');
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
    var d = new Date();
    var timestamp = d.getFullYear() + '-' +
                String(d.getMonth() + 1).padStart(2, '0') + '-' +
                String(d.getDate()).padStart(2, '0') + ' ' +
                String(d.getHours()).padStart(2, '0') + ':' +
                String(d.getMinutes()).padStart(2, '0') + ':' +
                String(d.getSeconds()).padStart(2, '0');
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
