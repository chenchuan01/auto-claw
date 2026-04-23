/**
 * UI主界面模块
 */

var Config = require('../core/config');
var HeaderBuilder = require('./header_builder');
var C = Config.colors;
var I = Config.icons;

function UIMainView(uiManager) {
    this.uiManager = uiManager;
    this.blinkIntervals = {};
}

UIMainView.prototype.show = function() {
    var self = this;
    var mgr = this.uiManager;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        HeaderBuilder.buildHeader({
            title: 'AutoClaw',
            rightIcon: I.cog,
            rightIconId: 'btn_settings'
        }) +
        '  <!-- 任务列表区域 -->' +
        '  <frame layout_weight="1">' +
        '    <list id="task_list" bg="' + C.bg + '">' +
        '      <frame margin="12 12 12 12" bg="' + C.card + '" cornerRadius="32" w="*">' +
        '        <vertical padding="16">' +
        '        <!-- 第一行：任务名称 + 定时信息 + 状态圆点 -->' +
        '        <horizontal gravity="center_vertical">' +
        '          <text id="task_name" text="{{this.name}}" textSize="19sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        '          <text id="schedule_text" text="{{this.scheduleText}}" textSize="11sp" textColor="' + C.primary + '" marginRight="8" textStyle="bold" visibility="{{this.scheduleVisible}}"/>' +
        '          <text id="status_dot" text="{{this.statusDot}}" textSize="20sp" textColor="{{this.statusColor}}"/>' +
        '        </horizontal>' +
        '        <!-- 第二行：描述 -->' +
        '        <text id="task_desc" text="{{this.description}}" textSize="13sp" textColor="' + C.textSecondary + '" maxLines="1" marginTop="6"/>' +
        '        <!-- 第三行：次要信息 -->' +
        '        <horizontal gravity="center_vertical" marginTop="10">' +
        '          <text id="last_run_time" text="' + I.calendar + ' {{this.lastRunTimeText}}" textSize="11sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text id="run_count" text="' + I.play + ' {{this.runCount}} 次" textSize="11sp" textColor="' + C.textHint + '"/>' +
        '        </horizontal>' +
        '        <!-- 操作按钮 -->' +
        '        <horizontal marginTop="12">' +
        '          <button id="btn_run" text="' + I.play + ' 执行" layout_weight="1" marginRight="8" bg="' + C.primary + '" textColor="#FFFFFF" textSize="14sp" cornerRadius="24" h="42" textStyle="bold"/>' +
        '          <button id="btn_manage" text="' + I.ellipsis + ' 管理" layout_weight="1" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="14sp" cornerRadius="24" h="42"/>' +
        '        </horizontal>' +
        '        </vertical>' +
        '      </frame>' +
        '    </list>' +
        '    <!-- 空状态 -->' +
        '    <vertical id="empty_view" visibility="gone" gravity="center" bg="' + C.bg + '" padding="40">' +
        '      <text text="' + I.robot + '" textSize="88sp" textColor="' + C.primary + '" gravity="center"/>' +
        '    </vertical>' +
        '  </frame>' +
        mgr.buildBottomNav('tasks') +
        '</vertical>'
    );

    this.bindEvents();
    mgr.bindBottomNav();
    mgr.fontManager.applyLight(ui.btn_settings);
    // 应用字体到空状态图标
    mgr.fontManager.apply(ui.empty_view.getChildAt(0));

    ui.post(function() {
        self.loadData();
    });
};

UIMainView.prototype.loadData = function() {
    var self = this;
    var mgr = this.uiManager;

    // 清除所有闪烁动画
    this.clearAllBlinkAnimations();

    var tasks = mgr.dataManager.getTasks().map(function(task) {
        var statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;
        var desc = task.description || '';
        var scheduleVisible = 'gone';
        var scheduleText = '';
        if (task.schedule && task.schedule.enabled && task.schedule.time) {
            scheduleVisible = 'visible';
            scheduleText = I.clock + ' ' + self.calcNextRunText(task.schedule);
        }
        return {
            id: task.id,
            name: task.name,
            description: desc,
            statusDot: statusInfo.dot,
            statusText: statusInfo.text,
            statusColor: statusInfo.color,
            status: task.status,
            isRunning: task.status === 'running',
            lastRunTimeText: mgr.formatTime(task.lastRunTime),
            runCount: task.runCount || 0,
            scheduleVisible: scheduleVisible,
            scheduleText: scheduleText
        };
    });

    ui.task_list.setDataSource(tasks);

    // 手动更新所有可见列表项的按钮状态
    ui.post(function() {
        try {
            var listView = ui.task_list;
            if (!listView) return;

            for (var i = 0; i < listView.getChildCount(); i++) {
                var itemView = listView.getChildAt(i);
                if (!itemView) continue;

                var btnRun = itemView.findViewWithTag('btn_run');
                if (!btnRun) continue;

                // 获取对应的任务数据
                if (i < tasks.length) {
                    self.updateRunButton(btnRun, tasks[i].isRunning);
                }
            }
        } catch (e) {
            console.error('[UIMainView] 更新按钮状态失败: ' + e);
        }
    });

    ui.empty_view.attr('visibility', tasks.length === 0 ? 'visible' : 'gone');
};

UIMainView.prototype.clearAllBlinkAnimations = function() {
    for (var taskId in this.blinkIntervals) {
        if (this.blinkIntervals.hasOwnProperty(taskId)) {
            clearInterval(this.blinkIntervals[taskId]);
            delete this.blinkIntervals[taskId];
        }
    }
};

UIMainView.prototype.setupBlinkAnimation = function() {
    var self = this;

    for (var taskId in this.blinkIntervals) {
        if (this.blinkIntervals.hasOwnProperty(taskId)) {
            clearInterval(this.blinkIntervals[taskId]);
            delete this.blinkIntervals[taskId];
        }
    }

    ui.post(function() {
        var listView = ui.task_list;
        if (!listView) return;

        for (var i = 0; i < listView.getChildCount(); i++) {
            var itemView = listView.getChildAt(i);
            if (!itemView) continue;

            var statusDot = itemView.findViewWithTag('status_dot');
            if (!statusDot) continue;

            var task = self.uiManager.dataManager.getTasks()[i];
            if (!task) continue;

            if (task.status === 'running') {
                self.startBlinking(statusDot, task.id);
            }
        }
    });
};

UIMainView.prototype.startBlinking = function(dotView, taskId) {
    var self = this;
    var visible = true;

    // 清除该任务的旧定时器
    if (this.blinkIntervals[taskId]) {
        clearInterval(this.blinkIntervals[taskId]);
        delete this.blinkIntervals[taskId];
    }

    // 创建新的闪烁定时器
    this.blinkIntervals[taskId] = setInterval(function() {
        // 检查任务是否还在运行
        var task = self.uiManager.dataManager.getTaskById(taskId);
        if (!task || task.status !== 'running') {
            // 任务已停止，清除定时器并恢复透明度
            clearInterval(self.blinkIntervals[taskId]);
            delete self.blinkIntervals[taskId];
            ui.post(function() {
                if (dotView) {
                    dotView.attr('alpha', '1.0');
                }
            });
            return;
        }

        ui.post(function() {
            if (dotView) {
                dotView.attr('alpha', visible ? '1.0' : '0.2');
                visible = !visible;
            }
        });
    }, 500);
};

UIMainView.prototype.updateRunButton = function(btnView, isRunning) {
    var mgr = this.uiManager;
    if (isRunning) {
        btnView.attr('bg', C.warning);
        btnView.setText(I.pause + ' 停止');
    } else {
        btnView.attr('bg', C.primary);
        btnView.setText(I.play + ' 执行');
    }
    mgr.fontManager.apply(btnView);
};

UIMainView.prototype.calcNextRunText = function(schedule) {
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
        return month + '月' + day + '日 ' + schedule.time;
    }
};

UIMainView.prototype.bindEvents = function() {
    var self = this;
    var mgr = this.uiManager;

    ui.btn_settings.on('click', function() { mgr.showSettings(); });

    ui.task_list.on('item_bind', function(itemView, itemHolder) {
        var statusDot = itemView.status_dot;
        if (statusDot) {
            statusDot.setTag('status_dot');
        }

        // 给按钮打标签，方便后续查找
        if (itemView.btn_run) {
            itemView.btn_run.setTag('btn_run');
        }

        // 只在任务真正运行时才启动闪烁
        if (itemHolder && itemHolder.item && itemHolder.item.status === 'running' && statusDot) {
            self.startBlinking(statusDot, itemHolder.item.id);
        } else if (statusDot) {
            // 确保非运行状态的任务不闪烁
            statusDot.attr('alpha', '1.0');
        }

        // 应用 Font Awesome 字体到图标
        mgr.fontManager.apply(itemView.btn_run, itemView.btn_manage, itemView.last_run_time, itemView.run_count);
        if (itemView.schedule_text) {
            mgr.fontManager.apply(itemView.schedule_text);
        }

        // 根据运行状态更新按钮外观
        if (itemHolder && itemHolder.item) {
            self.updateRunButton(itemView.btn_run, itemHolder.item.isRunning);
        }

        // 清除旧的点击监听器，避免重复绑定
        itemView.btn_run.removeAllListeners('click');
        itemView.btn_manage.removeAllListeners('click');

        itemView.btn_run.on('click', function() {
            if (itemHolder && itemHolder.item) {
                var taskId = itemHolder.item.id;
                var isRunning = itemHolder.item.isRunning;

                if (isRunning) {
                    // 立即更新按钮状态为执行
                    self.updateRunButton(itemView.btn_run, false);
                    // 停止任务
                    mgr.stopTask(taskId);
                } else {
                    // 立即更新按钮状态为停止
                    self.updateRunButton(itemView.btn_run, true);
                    // 执行任务
                    mgr.executeTask(taskId);
                }
            }
        });
        itemView.btn_manage.on('click', function() {
            if (itemHolder && itemHolder.item) {
                mgr.dialogs.showTaskManagement(itemHolder.item.id);
            }
        });
    });
};

module.exports = UIMainView;
