// 测试AI模型功能
var Config = require('./modules/config');
var DataManager = require('./modules/data_manager');
var AIModels = require('./modules/ai_models');

console.log('测试AI模型功能...');

var dataManager = new DataManager();
var aiModels = new AIModels(dataManager);

// 获取当前设置
var settings = aiModels.getSettings();
console.log('当前AI模型:', settings.aiModel);
console.log('API Key:', settings.aiApiKey ? '已设置' : '未设置');

// 测试获取模型配置
var modelConfig = aiModels.getModelConfig('deepseek');
console.log('DeepSeek模型配置:', modelConfig);

// 测试免费模型列表
console.log('\n免费模型列表:');
var modelKeys = Object.keys(Config.aiModels);
for (var i = 0; i < modelKeys.length; i++) {
    var key = modelKeys[i];
    var model = Config.aiModels[key];
    if (model.free) {
        console.log('- ' + model.name + ' (' + key + ')');
    }
}

console.log('\n测试完成!');