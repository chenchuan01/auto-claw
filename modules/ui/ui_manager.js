/**
 * UI管理器主模块
 * 整合所有UI子模块
 */

var Config = require('../core/config');
var C = Config.colors;
var I = Config.icons;
var UIMainView = require('./ui_main_view');
var UITaskDetail = require('./ui_task_detail');
var UITaskLogs = require('./ui_task_logs');
var UIMarketView = require('./ui_market_view');
var UIDialogs = require('./ui_dialogs');
var UIScriptEditor = require('./script_editor/main');
var UISettings = require('./ui_settings');
var UIAIChat = require('./ai_chat/main');
var UIAIHistory = require('./ui_ai_history');
var UISchedule = require('./ui_schedule');
var FontManager = require('../core/font_manager');
var AIService = require('../ai/ai_service');
var Scheduler = require('../services/scheduler');

function UIManager(dataManager, taskExecutor, marketService, recorder) {
    this.dataManager = dataManager;
    this.taskExecutor = taskExecutor;
    this.marketService = marketService;
    this.recorder = recorder;
    this.currentView = 'main';
    this.currentTaskId = null;
    this.fabWindow = null;
    this.refreshInterval = null;

    this.fontManager = new FontManager('fontawesome');
    this.fontManager.load();

    this.aiService = new AIService();

    this.mainView = new UIMainView(this);
    this.taskDetail = new UITaskDetail(this);
    this.taskLogs = new UITaskLogs(this);
    this.marketView = new UIMarketView(this);
    this.dialogs = new UIDialogs(this);
    this.scriptEditor = new UIScriptEditor(this);
    this.settingsView = new UISettings(this);
    this.aiChat = new UIAIChat(this);
    this.aiHistory = new UIAIHistory(this);
    this.scheduleView = new UISchedule(this);
    this.scheduler = new Scheduler(dataManager, taskExecutor);
    this.scheduler.start();

    // 设置状态栏颜色与 header 一致
    this.setStatusBarColor();
}

UIManager.prototype.setStatusBarColor = function() {
    try {
        var color = android.graphics.Color.parseColor(C.primary);
        activity.getWindow().setStatusBarColor(color);
        // 状态栏图标用浅色（白色），与深色 header 搭配
        var decorView = activity.getWindow().getDecorView();
        var flags = decorView.getSystemUiVisibility();
        // 清除 LIGHT_STATUS_BAR 标志，使图标显示为白色
        flags = flags & ~android.view.View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
        decorView.setSystemUiVisibility(flags);
    } catch (e) {
        console.log('[UIManager] 设置状态栏颜色失败: ' + e.message);
    }
};

UIManager.prototype.showMainView = function() {
    this.currentView = 'main';
    this.resetStaleRunningTasks();
    this.mainView.show();
    this.startAutoRefresh();
    this.setupBackHandler();
};

// 软件启动时重置所有任务状态为待执行
UIManager.prototype.resetStaleRunningTasks = function() {
    var self = this;
    var tasks = this.dataManager.getTasks();
    tasks.forEach(function(task) {
        // 将所有非 idle 状态重置为 idle
        if (task.status !== 'idle') {
            self.dataManager.updateTask(task.id, { status: 'idle' });
        }
    });
};

UIManager.prototype.startAutoRefresh = function() {
    var self = this;
    if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
    }
    this.refreshInterval = setInterval(function() {
        if (self.currentView === 'main') {
            self.mainView.loadData();
        }
    }, 2000);
};

UIManager.prototype.stopAutoRefresh = function() {
    if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
        this.refreshInterval = null;
    }
};

UIManager.prototype.showTaskDetail = function(taskId) {
    this.currentView = 'task_detail';
    this.currentTaskId = taskId;
    this.stopAutoRefresh();
    this.taskDetail.show(taskId);
    this.setupBackHandler();
};

UIManager.prototype.showMarketView = function() {
    this.currentView = 'market';
    this.stopAutoRefresh();
    this.marketView.show();
    this.setupBackHandler();
};

UIManager.prototype.showScriptEditor = function(taskId) {
    this.currentView = 'script_editor';
    this.currentTaskId = taskId;
    this.stopAutoRefresh();
    this.scriptEditor.show(taskId);
    this.setupBackHandler();
};

UIManager.prototype.executeTask = function(taskId) {
    var self = this;
    var success = this.taskExecutor.executeTask(taskId, function(completedTaskId) {
        // 任务完成回调，立即刷新 UI
        if (self.currentView === 'main') {
            self.mainView.loadData();
        }
    });
    if (success) {
        setTimeout(function() {
            if (self.currentView === 'main') {
                self.mainView.loadData();
            }
        }, 500);
    }
};

UIManager.prototype.stopTask = function(taskId) {
    var self = this;
    this.taskExecutor.stopTask(taskId);
    setTimeout(function() {
        if (self.currentView === 'main') {
            self.mainView.loadData();
        }
    }, 300);
};

UIManager.prototype.showScheduleDialog = function(taskId) {
    this.currentView = 'schedule';
    this.currentTaskId = taskId;
    this.stopAutoRefresh();
    this.scheduleView.show(taskId);
    this.setupBackHandler();
};

UIManager.prototype.showSettings = function() {
    this.currentView = 'settings';
    this.stopAutoRefresh();
    this.settingsView.show();
    this.setupBackHandler();
};

UIManager.prototype.showAIChat = function() {
    this.currentView = 'ai_chat';
    this.stopAutoRefresh();
    this.aiChat.show();
    this.setupBackHandler();
};

UIManager.prototype.showAIHistory = function() {
    this.currentView = 'ai_history';
    this.stopAutoRefresh();
    this.aiHistory.show();
    this.setupBackHandler();
};

UIManager.prototype.startAIEditWithScript = function(script, taskName, taskId) {
    this.currentView = 'ai_chat';
    this.stopAutoRefresh();
    this.aiChat.showWithScript(script, taskName, taskId);
    this.setupBackHandler();
};

UIManager.prototype.showTaskLogs = function(taskId) {
    this.currentView = 'task_logs';
    this.currentTaskId = taskId;
    this.stopAutoRefresh();
    this.taskLogs.show(taskId);
    this.setupBackHandler();
};

UIManager.prototype.setupBackHandler = function() {
    var self = this;
    ui.emitter.removeAllListeners('back_pressed');
    ui.emitter.on('back_pressed', function(e) {
        var view = self.currentView;
        if (view === 'main') {
            activity.finish();
        } else if (view === 'ai_history') {
            e.consumed = true;
            self.showAIChat();
        } else {
            e.consumed = true;
            self.showMainView();
        }
    });
};

UIManager.prototype.buildBottomNav = function(activeTab) {
    var tasksColor = activeTab === 'tasks' ? C.primary : C.textHint;
    var marketColor = activeTab === 'market' ? C.primary : C.textHint;
    return '  <horizontal bg="' + C.card + '" padding="8 0" cornerRadius="40 40 0 0">' +
        '    <vertical id="nav_btn_tasks" layout_weight="1" gravity="center" padding="12 8">' +
        '      <text id="nav_icon_tasks" text="' + I.bars + '" textSize="20sp" textColor="' + tasksColor + '" gravity="center"/>' +
        '      <text text="任务列表" textSize="10sp" textColor="' + tasksColor + '" gravity="center" marginTop="4"/>' +
        '    </vertical>' +
        '    <vertical id="nav_btn_ai" layout_weight="1" gravity="center" padding="8 4">' +
        '      <text id="nav_icon_ai" text="' + I.paperPlane + '" w="56" h="56" bg="' + C.primary + '" textColor="#FFFFFF" textSize="26sp" gravity="center" cornerRadius="28" textStyle="bold"/>' +
        '    </vertical>' +
        '    <vertical id="nav_btn_market" layout_weight="1" gravity="center" padding="12 8">' +
        '      <text id="nav_icon_market" text="' + I.cloud + '" textSize="20sp" textColor="' + marketColor + '" gravity="center"/>' +
        '      <text text="任务中心" textSize="10sp" textColor="' + marketColor + '" gravity="center" marginTop="4"/>' +
        '    </vertical>' +
        '  </horizontal>';
};

UIManager.prototype.bindBottomNav = function() {
    var self = this;
    this.fontManager.apply(ui.nav_icon_tasks, ui.nav_icon_ai, ui.nav_icon_market);
    ui.nav_btn_tasks.on('click', function() { self.showMainView(); });
    ui.nav_btn_ai.on('click', function() { self.showAIChat(); });
    ui.nav_btn_market.on('click', function() { self.showMarketView(); });
};

UIManager.prototype.formatTime = function(timestamp) {
    if (!timestamp) return '从未执行';
    var d = new Date(timestamp);
    return d.getFullYear() + '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
        ('0' + d.getDate()).slice(-2) + ' ' +
        ('0' + d.getHours()).slice(-2) + ':' +
        ('0' + d.getMinutes()).slice(-2);
};

module.exports = UIManager;
