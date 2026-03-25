/**
 * AutoClaw - 最终版本主入口文件
 * 模块化架构，避免文件过大被截断
 */

"ui";

// 显示启动界面
ui.layout(
    '<vertical gravity="center" w="*" h="*" bg="#FFFFFF">' +
    '  <vertical gravity="center">' +
    '    <text text="▶" textSize="56sp" textColor="#1F6FEB" gravity="center"/>' +
    '    <text text="AutoClaw" textSize="26sp" textColor="#1A1A2E" textStyle="bold" gravity="center" marginTop="16"/>' +
    '    <text text="自动化任务管理" textSize="13sp" textColor="#1F6FEB" gravity="center" marginTop="6"/>' +
    '    <progressbar indeterminate="true" style="Widget.AppCompat.ProgressBar.Horizontal" indeterminateTint="#1F6FEB" w="160" h="4" marginTop="40" cornerRadius="2"/>' +
    '  </vertical>' +
    '</vertical>'
);

// 延迟加载模块，避免启动时卡顿
setTimeout(function() {
    try {
        // 导入模块
        var Config = require('./modules/config');
        var DataManager = require('./modules/data_manager');
        var TaskExecutor = require('./modules/task_executor');
        var MarketService = require('./modules/market_service');
        var UIManager = require('./modules/ui_manager');

        // 初始化管理器
        var dataManager = new DataManager();
        var taskExecutor = new TaskExecutor(dataManager);
        var marketService = new MarketService();
        var uiManager = new UIManager(dataManager, taskExecutor, marketService, null);

        // 显示主界面
        uiManager.showMainView();

        // 显示欢迎消息
        setTimeout(function() {
            toast('欢迎使用 ' + Config.appName + ' v' + Config.version);
        }, 500);

    } catch (error) {
        console.error('应用启动失败:', error);

        // 显示错误界面
        var errorMsg = error.message || '未知错误';
        ui.layout(
            '<vertical gravity="center" padding="32" bg="#FFFFFF">' +
            '  <text text="✕" textSize="48sp" textColor="#F44336"/>' +
            '  <text text="应用启动失败" textSize="20sp" textColor="#1A1A2E" marginTop="16"/>' +
            '  <text id="error_msg" textSize="14sp" textColor="#6B7280" marginTop="8"/>' +
            '  <text text="请检查模块文件是否完整" textSize="12sp" textColor="#9CA3AF" marginTop="4"/>' +
            '  <button id="btn_retry" text="↻ 重试" marginTop="32" style="Widget.AppCompat.Button.Colored"/>' +
            '  <button id="btn_check" text="⟳ 检查模块" marginTop="16"/>' +
            '</vertical>'
        );

        // 设置错误消息文本
        ui.error_msg.setText(errorMsg);

        ui.btn_retry.on('click', function() {
            // 重新加载页面
            engines.execScriptFile(files.path('./main.js'));
        });

        ui.btn_check.on('click', function() {
            // 检查模块文件
            checkModules();
        });
    }
}, 300);

// 检查模块文件
function checkModules() {
    var modules = [
        './modules/config.js',
        './modules/data_manager.js',
        './modules/task_executor.js',
        './modules/market_service.js',
        './modules/ui_manager_complete.js'
    ];

    var missingModules = [];

    for (var i = 0; i < modules.length; i++) {
        var modulePath = modules[i];
        try {
            require(modulePath);
        } catch (e) {
            missingModules.push(modulePath);
        }
    }

    if (missingModules.length === 0) {
        toast('所有模块文件完整');
    } else {
        dialogs.alert('缺失的模块', '以下模块文件缺失或损坏：\n\n' + missingModules.join('\n'));
    }
}