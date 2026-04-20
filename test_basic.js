// 测试基本模块功能
console.log('测试基本模块功能...');

try {
    // 测试Config模块
    var Config = require('./modules/config');
    console.log('Config模块加载成功');
    console.log('应用名称:', Config.appName);
    console.log('版本:', Config.version);
    console.log('AI模型数量:', Object.keys(Config.aiModels).length);
    
    // 测试免费模型
    var freeModels = 0;
    for (var key in Config.aiModels) {
        if (Config.aiModels[key].free) freeModels++;
    }
    console.log('免费模型数量:', freeModels);
    
    // 测试模块依赖
    console.log('\n测试模块依赖...');
    var modules = [
        './modules/data_manager.js',
        './modules/task_executor.js', 
        './modules/market_service.js',
        './modules/ui_manager.js',
        './modules/ui_main_view.js',
        './modules/ui_task_detail.js',
        './modules/ui_market_view.js',
        './modules/ui_dialogs.js',
        './modules/ui_script_editor.js',
        './modules/ui_settings.js',
        './modules/ai_models.js',
        './modules/script_helper.js',
        './modules/recorder.js'
    ];
    
    var missing = [];
    for (var i = 0; i < modules.length; i++) {
        try {
            require(modules[i]);
            console.log('✓ ' + modules[i]);
        } catch (e) {
            console.log('✗ ' + modules[i] + ' - ' + e.message);
            missing.push(modules[i]);
        }
    }
    
    if (missing.length === 0) {
        console.log('\n所有模块加载成功!');
    } else {
        console.log('\n缺失模块:', missing.length);
    }
    
} catch (error) {
    console.error('测试失败:', error);
}

console.log('\n测试完成!');