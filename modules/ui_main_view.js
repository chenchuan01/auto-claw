/**
 * UI主界面模块
 */

var Config = require('./config');
var C = Config.colors;

function UIMainView(uiManager) {
    this.uiManager = uiManager;
    this.blinkIntervals = {};
}

UIMainView.prototype.show = function() {
    var self = this;
    var mgr = this.uiManager;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <horizontal bg="' + C.primary + '" padding="16 14" gravity="center_vertical">' +
        '    <vertical layout_weight="1">' +
        '      <text text="AutoClaw" textSize="22sp" textColor="#FFFFFF" textStyle="bold"/>' +
        '      <text text="自动化任务管理" textSize="11sp" textColor="#FFFFFF" alpha="0.8" marginTop="2"/>' +
        '    </vertical>' +
        '    <text id="btn_settings" text="⚙" textSize="22sp" textColor="#FFFFFF" padding="8"/>' +
        '  </horizontal>' +
        '  <frame layout_weight="1">' +
        '    <list id="task_list" bg="' + C.bg + '">' +
        '      <vertical margin="12 6 12 6" bg="' + C.card + '" cornerRadius="14" padding="16" w="*">' +
        '        <horizontal gravity="center_vertical">' +
        '          <text id="status_dot" text="{{this.statusDot}}" textSize="16sp" textColor="{{this.statusColor}}" marginRight="8"/>' +
        '          <vertical layout_weight="1">' +
        '            <text id="task_name" text="{{this.name}}" textSize="16sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '            <text id="task_desc" text="{{this.description}}" textSize="12sp" textColor="' + C.textSecondary + '" maxLines="1" marginTop="3"/>' +
        '          </vertical>' +
        '        </horizontal>' +
        '        <horizontal marginTop="10" gravity="center_vertical">' +
        '          <text id="task_time" text="{{this.lastRunTimeText}}" textSize="11sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text id="task_count" text="执行 {{this.runCount}} 次" textSize="11sp" textColor="' + C.textHint + '"/>' +
        '        </horizontal>' +
        '        <horizontal marginTop="12">' +
        '          <button id="btn_run" text="▶ 执行" layout_weight="1" marginRight="6" bg="' + C.primary + '" textColor="white" textSize="13sp" cornerRadius="8" h="36"/>' +
        '          <button id="btn_manage" text="管理" layout_weight="1" marginLeft="6" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="13sp" cornerRadius="8" h="36"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '    </list>' +
        '    <vertical id="empty_view" visibility="gone" gravity="center" bg="' + C.bg + '">' +
        '      <text text="📋" textSize="56sp" gravity="center"/>' +
        '      <text text="暂无任务" textSize="16sp" textColor="' + C.textSecondary + '" marginTop="12" gravity="center"/>' +
        '      <text text="点击右下角 + 添加第一个任务" textSize="12sp" textColor="' + C.textHint + '" marginTop="6" gravity="center"/>' +
        '    </vertical>' +
        '  </frame>' +
        '  <horizontal bg="' + C.card + '" padding="0 4">' +
        '    <vertical id="btn_tasks" layout_weight="1" gravity="center" padding="10 8">' +
        '      <text text="📋" textSize="20sp" gravity="center"/>' +
        '      <text text="任务列表" textSize="10sp" textColor="' + C.primary + '" gravity="center" marginTop="3"/>' +
        '    </vertical>' +
        '    <vertical id="btn_add" layout_weight="1" gravity="center" padding="6 4">' +
        '      <text text="+" w="48" h="48" bg="' + C.primary + '" textColor="white" textSize="28sp" gravity="center" cornerRadius="24"/>' +
        '    </vertical>' +
        '    <vertical id="btn_market" layout_weight="1" gravity="center" padding="10 8">' +
        '      <text text="🛒" textSize="20sp" gravity="center"/>' +
        '      <text text="任务市场" textSize="10sp" textColor="' + C.textHint + '" gravity="center" marginTop="3"/>' +
        '    </vertical>' +
        '  </horizontal>' +
        '</vertical>'
    );

    this.loadData();
    this.bindEvents();
};

UIMainView.prototype.loadData = function() {
    var self = this;
    var mgr = this.uiManager;
    var tasks = mgr.dataManager.getTasks().map(function(task) {
        var statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;
        return {
            id: task.id,
            name: task.name,
            description: task.description || '暂无描述',
            statusDot: statusInfo.dot,
            statusColor: statusInfo.color,
            status: task.status,
            lastRunTimeText: mgr.formatTime(task.lastRunTime),
            runCount: task.runCount || 0
        };
    });

    ui.task_list.setDataSource(tasks);
    ui.empty_view.attr('visibility', tasks.length === 0 ? 'visible' : 'gone');

    this.setupBlinkAnimation();
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

    if (this.blinkIntervals[taskId]) {
        clearInterval(this.blinkIntervals[taskId]);
    }

    this.blinkIntervals[taskId] = setInterval(function() {
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
    ui.btn_add.on('click', function() { mgr.dialogs.showAddTaskDialog(); });
    ui.btn_market.on('click', function() { mgr.showMarketView(); });

    ui.task_list.on('item_bind', function(itemView, itemHolder) {
        var statusDot = itemView.status_dot;
        if (statusDot) {
            statusDot.setTag('status_dot');
        }

        if (itemHolder && itemHolder.item && itemHolder.item.status === 'running' && statusDot) {
            self.startBlinking(statusDot, itemHolder.item.id);
        }

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
