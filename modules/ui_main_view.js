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
        '  <horizontal bg="' + C.primary + '" padding="20 16 16 16" gravity="center_vertical">' +
        '    <vertical layout_weight="1">' +
        '      <text text="AutoClaw" textSize="26sp" textColor="#FFFFFF" textStyle="bold"/>' +
        '      <text text="自动化任务管理" textSize="12sp" textColor="#B3D1FF" marginTop="2"/>' +
        '    </vertical>' +
        '    <text id="btn_settings" text="⚙" textSize="24sp" textColor="#FFFFFF" padding="8 8 8 12"/>' +
        '  </horizontal>' +
        '  <!-- 任务列表区域 -->' +
        '  <frame layout_weight="1">' +
        '    <list id="task_list" bg="' + C.bg + '">' +
        '      <vertical margin="12 16 12 16" bg="' + C.card + '" cornerRadius="18" padding="18" w="*">' +
        '        <horizontal gravity="center_vertical">' +
        '          <text id="status_dot" text="{{this.statusDot}}" textSize="18sp" textColor="{{this.statusColor}}" marginRight="10"/>' +
        '          <vertical layout_weight="1">' +
        '            <text id="task_name" text="{{this.name}}" textSize="17sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '            <text id="task_desc" text="{{this.description}}" textSize="13sp" textColor="' + C.textSecondary + '" maxLines="1" marginTop="4"/>' +
        '          </vertical>' +
        '        </horizontal>' +
        '        <horizontal marginTop="14" gravity="center_vertical">' +
        '          <text id="task_time" text="{{this.lastRunTimeText}}" textSize="12sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text id="task_count" text="执行 {{this.runCount}} 次" textSize="12sp" textColor="' + C.textHint + '"/>' +
        '        </horizontal>' +
        '        <horizontal marginTop="16">' +
        '          <button id="btn_run" text="' + I.play + ' 执行任务" layout_weight="1" marginRight="8" bg="' + C.primary + '" textColor="white" textSize="14sp" cornerRadius="16" h="40" textStyle="bold"/>' +
        '          <button id="btn_manage" text="' + I.ellipsis + ' 管理" layout_weight="1" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="14sp" cornerRadius="16" h="40"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '    </list>' +
        '    <!-- 空状态 -->' +
        '    <vertical id="empty_view" visibility="gone" gravity="center" bg="' + C.bg + '" padding="40">' +
        '      <text text="◎" textSize="64sp" textColor="' + C.textHint + '" gravity="center"/>' +
        '      <text text="暂无任务" textSize="18sp" textColor="' + C.textPrimary + '" marginTop="16" gravity="center" textStyle="bold"/>' +
        '      <text text="点击下方 + 按钮添加第一个任务" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8" gravity="center"/>' +
        '    </vertical>' +
        '  </frame>' +
        '  <!-- 底部导航栏 -->' +
        '  <horizontal bg="' + C.card + '" padding="8 0" cornerRadius="24 24 0 0">' +
        '    <vertical id="btn_tasks" layout_weight="1" gravity="center" padding="12 8">' +
        '      <text id="icon_tasks" text="' + I.bars + '" textSize="22sp" textColor="' + C.primary + '" gravity="center"/>' +
        '      <text text="任务列表" textSize="10sp" textColor="' + C.primary + '" gravity="center" marginTop="4"/>' +
        '    </vertical>' +
        '    <vertical id="btn_ai_chat" layout_weight="1" gravity="center" padding="8 4">' +
        '      <text id="icon_ai_chat" text="' + I.comment + '" w="56" h="56" bg="' + C.primary + '" textColor="white" textSize="28sp" gravity="center" cornerRadius="28" textStyle="bold"/>' +
        '    </vertical>' +
        '    <vertical id="btn_market" layout_weight="1" gravity="center" padding="12 8">' +
        '      <text id="icon_market" text="☁" textSize="22sp" textColor="' + C.textHint + '" gravity="center"/>' +
        '      <text text="任务中心" textSize="10sp" textColor="' + C.textHint + '" gravity="center" marginTop="4"/>' +
        '    </vertical>' +
        '  </horizontal>' +
        '</vertical>'
    );

    this.loadData();
    this.bindEvents();

    // 应用 Font Awesome 字体到图标
    mgr.fontManager.apply(ui.icon_tasks, ui.icon_ai_chat, ui.icon_market);
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
    ui.btn_ai_chat.on('click', function() { mgr.showAIChat(); });
    ui.btn_market.on('click', function() { mgr.showMarketView(); });

    ui.task_list.on('item_bind', function(itemView, itemHolder) {
        var statusDot = itemView.status_dot;
        if (statusDot) {
            statusDot.setTag('status_dot');
        }

        if (itemHolder && itemHolder.item && itemHolder.item.status === 'running' && statusDot) {
            self.startBlinking(statusDot, itemHolder.item.id);
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
