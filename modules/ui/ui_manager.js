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
var UIScriptEditor = require('./ui_script_editor');
var UISettings = require('./ui_settings');
var UIAIChat = require('./ui_ai_chat');
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

    this.fontManager = new FontManager();
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
    this.scheduleView = new UISchedule(this);
    this.scheduler = new Scheduler(dataManager, taskExecutor);
    this.scheduler.start();
}

UIManager.prototype.showMainView = function() {
    this.currentView = 'main';
    this.mainView.show();
    this.startAutoRefresh();
    this.setupBackHandler();
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
    var success = this.taskExecutor.executeTask(taskId);
    if (success) {
        setTimeout(function() {
            if (self.currentView === 'main') {
                self.mainView.loadData();
            }
        }, 500);
    }
};

UIManager.prototype.stopTask = function(taskId) {
    this.taskExecutor.stopTask(taskId);
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

UIManager.prototype.startAIEditWithScript = function(script, taskName) {
    this.currentView = 'ai_chat';
    this.stopAutoRefresh();
    this.aiChat.showWithScript(script, taskName);
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
        '      <text id="nav_icon_ai" text="' + I.robot + '" w="56" h="56" bg="' + C.primary + '" textColor="white" textSize="26sp" gravity="center" cornerRadius="28" textStyle="bold"/>' +
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
