/**
 * UI管理器主模块
 * 整合所有UI子模块
 */

var Config = require('./config');
var UIMainView = require('./ui_main_view');
var UITaskDetail = require('./ui_task_detail');
var UIMarketView = require('./ui_market_view');
var UIDialogs = require('./ui_dialogs');

function UIManager(dataManager, taskExecutor, marketService, recorder) {
    this.dataManager = dataManager;
    this.taskExecutor = taskExecutor;
    this.marketService = marketService;
    this.recorder = recorder;
    this.currentView = 'main';
    this.currentTaskId = null;
    this.fabWindow = null;
    this.refreshInterval = null;

    this.mainView = new UIMainView(this);
    this.taskDetail = new UITaskDetail(this);
    this.marketView = new UIMarketView(this);
    this.dialogs = new UIDialogs(this);
}

UIManager.prototype.showMainView = function() {
    this.currentView = 'main';
    this.mainView.show();
    this.startAutoRefresh();
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
};

UIManager.prototype.showMarketView = function() {
    this.currentView = 'market';
    this.stopAutoRefresh();
    this.marketView.show();
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

UIManager.prototype.exportTaskScript = function(taskId) {
    var task = this.dataManager.getTaskById(taskId);
    if (!task) return;
    var exportPath = '/sdcard/AutoClaw/exports/' + task.name + '_' + Date.now() + '.js';
    try {
        if (!files.exists('/sdcard/AutoClaw/exports/')) {
            files.createDir('/sdcard/AutoClaw/exports/');
        }
        files.write(exportPath, task.script);
        toast('已导出到: ' + exportPath);
    } catch (e) {
        toast('导出失败: ' + e.message);
    }
};

UIManager.prototype.showScheduleDialog = function() {
    toast('定时执行功能开发中...');
};

UIManager.prototype.showSettings = function() {
    toast('设置功能开发中...');
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
