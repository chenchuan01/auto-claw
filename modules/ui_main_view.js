/**
 * UI主界面模块
 */

var Config = require('./config');
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
        '  <horizontal bg="' + C.primary + '" padding="20 12 16 12" gravity="center_vertical">' +
        '    <text text="AutoClaw" textSize="26sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_settings" text="' + I.cog + '" textSize="22sp" textColor="#FFFFFF" padding="8 8 8 12"/>' +
        '  </horizontal>' +
        '  <!-- 任务列表区域 -->' +
        '  <frame layout_weight="1">' +
        '    <list id="task_list" bg="' + C.bg + '">' +
        '      <vertical margin="12 12 12 12" bg="' + C.card + '" cornerRadius="16" padding="16" w="*">' +
        '        <!-- 第一行：任务名称 + 状态标签 -->' +
        '        <horizontal gravity="center_vertical">' +
        '          <text id="task_name" text="{{this.name}}" textSize="19sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        '          <text id="status_tag" text="{{this.statusText}}" textSize="11sp" textColor="white" bg="{{this.statusColor}}" padding="4 8" cornerRadius="10"/>' +
        '        </horizontal>' +
        '        <!-- 第二行：描述 -->' +
        '        <text id="task_desc" text="{{this.description}}" textSize="13sp" textColor="' + C.textSecondary + '" maxLines="1" marginTop="6" ' +  '{{this.descriptionHidden}}' + '/>' +
        '        <!-- 第三行：次要信息 -->' +
        '        <horizontal gravity="center_vertical" marginTop="10">' +
        '          <text text="⏱ {{this.lastRunTimeText}}" textSize="11sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="🔁 {{this.runCount}} 次" textSize="11sp" textColor="' + C.textHint + '"/>' +
        '        </horizontal>' +
        '        <!-- 操作按钮 -->' +
        '        <horizontal marginTop="12">' +
        '          <button id="btn_run" text="' + I.play + ' 执行" layout_weight="1" marginRight="8" bg="' + C.primary + '" textColor="white" textSize="14sp" cornerRadius="12" h="42" textStyle="bold"/>' +
        '          <button id="btn_manage" text="' + I.ellipsis + ' 管理" layout_weight="1" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="14sp" cornerRadius="12" h="42"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '    </list>' +
        '    <!-- 空状态 -->' +
        '    <vertical id="empty_view" visibility="gone" gravity="center" bg="' + C.bg + '" padding="40">' +
        '      <text text="' + I.clipboardList + '" textSize="88sp" textColor="' + C.textHint + '" gravity="center"/>' +
        '    </vertical>' +
        '  </frame>' +
        mgr.buildBottomNav('tasks') +
        '</vertical>'
    );

    this.bindEvents();
    mgr.bindBottomNav();
    mgr.fontManager.apply(ui.btn_settings);
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
        return {
            id: task.id,
            name: task.name,
            description: desc,
            descriptionHidden: desc ? '' : 'visibility="gone"',
            statusDot: statusInfo.dot,
            statusText: statusInfo.text,
            statusColor: statusInfo.color,
            status: task.status,
            lastRunTimeText: mgr.formatTime(task.lastRunTime),
            runCount: task.runCount || 0
        };
    });

    ui.task_list.setDataSource(tasks);
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

UIMainView.prototype.bindEvents = function() {
    var self = this;
    var mgr = this.uiManager;

    ui.btn_settings.on('click', function() { mgr.showSettings(); });

    ui.task_list.on('item_bind', function(itemView, itemHolder) {
        var statusDot = itemView.status_dot;
        if (statusDot) {
            statusDot.setTag('status_dot');
        }

        // 只在任务真正运行时才启动闪烁
        if (itemHolder && itemHolder.item && itemHolder.item.status === 'running' && statusDot) {
            self.startBlinking(statusDot, itemHolder.item.id);
        } else if (statusDot) {
            // 确保非运行状态的任务不闪烁
            statusDot.attr('alpha', '1.0');
        }

        // 应用 Font Awesome 字体到列表项按钮
        mgr.fontManager.apply(itemView.btn_run, itemView.btn_manage);

        itemView.btn_run.on('click', function() {
            if (itemHolder && itemHolder.item) {
                mgr.executeTask(itemHolder.item.id);
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
