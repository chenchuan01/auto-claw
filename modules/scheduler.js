/**
 * 定时调度器模块
 * 每分钟检查是否有任务需要执行
 */

function Scheduler(dataManager, taskExecutor) {
    this.dataManager = dataManager;
    this.taskExecutor = taskExecutor;
    this.timer = null;
}

Scheduler.prototype.start = function() {
    var self = this;
    if (this.timer) return;
    this.timer = setInterval(function() {
        self.checkAndRun();
    }, 60000);
};

Scheduler.prototype.stop = function() {
    if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
    }
};

Scheduler.prototype.checkAndRun = function() {
    var now = new Date();
    var hh = ('0' + now.getHours()).slice(-2);
    var mm = ('0' + now.getMinutes()).slice(-2);
    var currentTime = hh + ':' + mm;
    var dayOfWeek = now.getDay(); // 0=周日, 1-5=周一到周五, 6=周六
    var isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    var isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    var tasks = this.dataManager.getTasks();
    for (var i = 0; i < tasks.length; i++) {
        var task = tasks[i];
        if (!task.schedule || !task.schedule.enabled) continue;
        if (task.schedule.time !== currentTime) continue;

        var cycle = task.schedule.cycle;
        var shouldRun = false;
        if (cycle === 'daily') {
            shouldRun = true;
        } else if (cycle === 'weekday' && isWeekday) {
            shouldRun = true;
        } else if (cycle === 'weekend' && isWeekend) {
            shouldRun = true;
        }

        if (shouldRun) {
            console.log('[Scheduler] 触发定时任务: ' + task.name);
            this.taskExecutor.executeTask(task.id);
        }
    }
};

module.exports = Scheduler;
