/**
 * 任务执行器模块
 * 负责任务的执行、停止和状态管理
 */

const threads = require('threads');
const { toast } = require('globals');
const Config = require('./config');

class TaskExecutor {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.runningTasks = new Map(); // taskId -> thread
        this.taskLogs = new Map(); // taskId -> logs
    }
    
    // 执行任务
    executeTask(taskId) {
        const task = this.dataManager.getTaskById(taskId);
        
        if (!task) {
            toast('任务不存在');
            return false;
        }
        
        // 如果任务已经在运行，提示用户
        if (this.runningTasks.has(taskId)) {
            toast('任务正在执行中');
            return false;
        }
        
        // 更新任务状态为执行中
        this.dataManager.updateTask(taskId, {
            status: 'running',
            lastRunTime: Date.now(),
            runCount: (task.runCount || 0) + 1
        });
        
        // 初始化任务日志
        this.taskLogs.set(taskId, []);
        this.addTaskLog(taskId, `🚀 开始执行任务: ${task.name}`);
        this.addTaskLog(taskId, `📅 开始时间: ${new Date().toLocaleString()}`);
        
        // 在新线程中执行任务
        const thread = threads.start(() => {
            try {
                // 执行脚本
                this.addTaskLog(taskId, '📝 开始执行脚本...');
                
                // 重写console.log以捕获日志
                const originalLog = console.log;
                console.log = (...args) => {
                    const logMessage = args.map(arg => 
                        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
                    ).join(' ');
                    
                    this.addTaskLog(taskId, logMessage);
                    originalLog.apply(console, args);
                };
                
                // 执行用户脚本
                eval(task.script);
                
                // 恢复原始console.log
                console.log = originalLog;
                
                // 执行成功
                this.addTaskLog(taskId, '✅ 任务执行成功');
                this.dataManager.updateTask(taskId, { status: 'success' });
                toast('任务执行成功');
                
            } catch (error) {
                // 执行失败
                this.addTaskLog(taskId, `❌ 任务执行失败: ${error.message}`);
                this.addTaskLog(taskId, `🔍 错误堆栈: ${error.stack}`);
                this.dataManager.updateTask(taskId, { status: 'failed' });
                toast('任务执行失败: ' + error.message);
                
            } finally {
                // 清理资源
                this.runningTasks.delete(taskId);
                this.addTaskLog(taskId, `🏁 任务执行结束: ${new Date().toLocaleString()}`);
            }
        });
        
        this.runningTasks.set(taskId, thread);
        toast('任务开始执行...');
        return true;
    }
    
    // 停止任务
    stopTask(taskId) {
        const thread = this.runningTasks.get(taskId);
        
        if (!thread) {
            toast('任务未在运行');
            return false;
        }
        
        try {
            // 中断线程
            thread.interrupt();
            this.runningTasks.delete(taskId);
            
            // 更新任务状态
            this.dataManager.updateTask(taskId, { status: 'paused' });
            this.addTaskLog(taskId, '⏸️ 任务被手动停止');
            
            toast('任务已停止');
            return true;
            
        } catch (error) {
            toast('停止任务失败: ' + error.message);
            return false;
        }
    }
    
    // 获取任务运行状态
    getTaskStatus(taskId) {
        return {
            isRunning: this.runningTasks.has(taskId),
            thread: this.runningTasks.get(taskId),
            logs: this.taskLogs.get(taskId) || []
        };
    }
    
    // 获取所有运行中的任务
    getRunningTasks() {
        const runningTasks = [];
        
        for (const [taskId, thread] of this.runningTasks.entries()) {
            const task = this.dataManager.getTaskById(taskId);
            if (task) {
                runningTasks.push({
                    taskId,
                    taskName: task.name,
                    startTime: task.lastRunTime,
                    logs: this.taskLogs.get(taskId) || []
                });
            }
        }
        
        return runningTasks;
    }
    
    // 停止所有任务
    stopAllTasks() {
        let stoppedCount = 0;
        
        for (const [taskId, thread] of this.runningTasks.entries()) {
            try {
                thread.interrupt();
                this.dataManager.updateTask(taskId, { status: 'paused' });
                this.addTaskLog(taskId, '⏸️ 任务被批量停止');
                stoppedCount++;
            } catch (error) {
                console.error('停止任务失败:', taskId, error);
            }
        }
        
        this.runningTasks.clear();
        toast(`已停止 ${stoppedCount} 个任务`);
        return stoppedCount;
    }
    
    // 添加任务日志
    addTaskLog(taskId, message) {
        if (!this.taskLogs.has(taskId)) {
            this.taskLogs.set(taskId, []);
        }
        
        const logs = this.taskLogs.get(taskId);
        const timestamp = new Date().toLocaleTimeString();
        logs.push(`[${timestamp}] ${message}`);
        
        // 限制日志数量，避免内存占用过大
        if (logs.length > 1000) {
            logs.splice(0, 200); // 保留最近800条
        }
    }
    
    // 获取任务日志
    getTaskLogs(taskId, limit = 100) {
        const logs = this.taskLogs.get(taskId) || [];
        return logs.slice(-limit); // 返回最近的日志
    }
    
    // 清空任务日志
    clearTaskLogs(taskId) {
        this.taskLogs.set(taskId, []);
        return true;
    }
    
    // 导出任务日志
    exportTaskLogs(taskId, filePath) {
        try {
            const logs = this.getTaskLogs(taskId);
            const task = this.dataManager.getTaskById(taskId);
            
            if (!task) {
                return { success: false, error: '任务不存在' };
            }
            
            const logContent = [
                `任务名称: ${task.name}`,
                `任务ID: ${taskId}`,
                `导出时间: ${new Date().toLocaleString()}`,
                `日志数量: ${logs.length}`,
                '',
                '=== 任务日志 ===',
                ...logs
            ].join('\n');
            
            files.write(filePath, logContent);
            
            return {
                success: true,
                filePath,
                logCount: logs.length
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 批量执行任务
    executeTasks(taskIds) {
        let successCount = 0;
        let failCount = 0;
        
        taskIds.forEach(taskId => {
            const success = this.executeTask(taskId);
            if (success) {
                successCount++;
            } else {
                failCount++;
            }
        });
        
        return {
            total: taskIds.length,
            success: successCount,
            failed: failCount
        };
    }
    
    // 检查任务脚本语法
    validateTaskScript(script) {
        try {
            // 尝试解析脚本语法
            eval('(function() {' + script + '})');
            return {
                valid: true,
                message: '脚本语法正确'
            };
        } catch (error) {
            return {
                valid: false,
                message: error.message,
                line: error.lineNumber,
                column: error.columnNumber
            };
        }
    }
}

module.exports = TaskExecutor;