/**
 * AI模型管理器
 * 支持多种免费和付费AI模型调用
 */

var Config = require('./config');

function AIModels(dataManager) {
    this.dataManager = dataManager;
    this.currentModel = null;
}

AIModels.prototype.getSettings = function() {
    var settings = this.dataManager.getSettings();
    return {
        aiModel: settings.aiModel || 'opencode',
        aiApiKey: settings.aiApiKey || ''
    };
};

AIModels.prototype.getModelConfig = function(modelKey) {
    return Config.aiModels[modelKey] || null;
};

AIModels.prototype.setModel = function(modelKey) {
    var settings = this.dataManager.getSettings();
    settings.aiModel = modelKey;
    this.dataManager.updateSettings(settings);
};

AIModels.prototype.setApiKey = function(apiKey) {
    var settings = this.dataManager.getSettings();
    settings.aiApiKey = apiKey;
    this.dataManager.updateSettings(settings);
};

AIModels.prototype.chat = function(messages, callback) {
    var settings = this.getSettings();
    var modelConfig = this.getModelConfig(settings.aiModel);
    
    if (!modelConfig) {
        callback({ error: '未选择的AI模型' });
        return;
    }
    
    // 处理自定义模型
    var baseUrl = modelConfig.baseUrl;
    if (settings.aiModel === 'custom') {
        var fullSettings = this.dataManager.getSettings();
        baseUrl = fullSettings.customModelBaseUrl || '';
        if (!baseUrl) {
            callback({ error: '自定义模型需要Base URL' });
            return;
        }
    }
    
    if (!settings.aiApiKey && !modelConfig.free) {
        callback({ error: '需要API Key' });
        return;
    }
    
    var requestBody = {
        model: modelConfig.model,
        messages: messages,
        max_tokens: modelConfig.maxTokens || 2000,
        temperature: 0.7
    };
    
    var headers = {
        'Content-Type': 'application/json'
    };
    
    var apiKey = settings.aiApiKey;
    
    switch (settings.aiModel) {
        case 'openai':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'anthropic':
            headers['x-api-key'] = apiKey;
            headers['anthropic-version'] = '2023-06-01';
            break;
        case 'groq':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'openrouter':
            headers['Authorization'] = 'Bearer ' + apiKey;
            headers['HTTP-Referer'] = 'https://autoclaw.app';
            headers['X-Title'] = 'AutoClaw';
            break;
        case 'together':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'cerebras':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'deepseek':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'minimax':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'siliconflow':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'moonshot':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'stepfun':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case '智谱':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case '阿里云':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case '百度':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case '腾讯':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        case 'opencode':
            headers['Authorization'] = 'Bearer ' + apiKey;
            break;
        default:
            headers['Authorization'] = 'Bearer ' + apiKey;
    }
    
    var url = baseUrl + '/chat/completions';

    // 使用异步执行避免阻塞UI
    threads.start(function() {
        try {
            var response = http.post(url, JSON.stringify(requestBody), {
                headers: headers,
                timeout: 60000
            });

            var result = JSON.parse(response.body.string());

            if (result.choices && result.choices.length > 0) {
                ui.run(function() {
                    callback({
                        success: true,
                        content: result.choices[0].message.content,
                        model: modelConfig.name
                    });
                });
            } else if (result.error) {
                ui.run(function() {
                    callback({ error: result.error.message || result.error });
                });
            } else {
                ui.run(function() {
                    callback({ error: '未知错误' });
                });
            }
        } catch (e) {
            ui.run(function() {
                callback({ error: e.message });
            });
        }
    });
};

AIModels.prototype.chatAsync = function(messages) {
    var self = this;
    return new Promise(function(resolve, reject) {
        self.chat(messages, function(result) {
            if (result.error) {
                reject(new Error(result.error));
            } else {
                resolve(result);
            }
        });
    });
};

AIModels.prototype.complete = function(prompt, callback) {
    var messages = [{ role: 'user', content: prompt }];
    this.chat(messages, callback);
};

AIModels.prototype.generateCode = function(taskDescription, callback) {
    var systemPrompt = '你是一个专业的AutoX.js脚本编写助手。请根据用户的需求生成高质量的AutoX.js自动化脚本代码。';
    var userPrompt = '请为以下任务生成AutoX.js脚本：\n\n' + taskDescription;
    
    var messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
    
    this.chat(messages, callback);
};

AIModels.prototype.explainCode = function(code, callback) {
    var systemPrompt = '你是一个专业的AutoX.js脚本分析助手。请解释用户提供的代码功能和逻辑。';
    var userPrompt = '请解释以下AutoX.js脚本：\n\n```javascript\n' + code + '\n```';
    
    var messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
    
    this.chat(messages, callback);
};

AIModels.prototype.optimizeCode = function(code, callback) {
    var systemPrompt = '你是一个专业的AutoX.js脚本优化助手。请优化用户提供的代码，提高执行效率和稳定性。';
    var userPrompt = '请优化以下AutoX.js脚本：\n\n```javascript\n' + code + '\n```\n\n请直接给出优化后的代码，不需要解释。';
    
    var messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
    ];
    
    this.chat(messages, function(result) {
        if (result.success) {
            var codeMatch = result.content.match(/```javascript\n([\s\S]*?)```/);
            if (codeMatch) {
                callback({ success: true, code: codeMatch[1] });
                return;
            }
            var codeMatch2 = result.content.match(/```\n([\s\S]*?)```/);
            if (codeMatch2) {
                callback({ success: true, code: codeMatch2[1] });
                return;
            }
            callback({ success: true, code: result.content });
        } else {
            callback(result);
        }
    });
};

module.exports = AIModels;
