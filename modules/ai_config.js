/**
 * AI 配置管理模块
 */

function AIConfig() {
    this.storageName = 'autoclaw_ai_config';
    this.storage = storages.create(this.storageName);
}

/**
 * 获取 AI 配置
 */
AIConfig.prototype.getConfig = function() {
    return {
        apiUrl: this.storage.get('apiUrl', ''),
        apiKey: this.storage.get('apiKey', ''),
        messageFormat: this.storage.get('messageFormat', 'openai'), // 'openai' 或 'anthropic'
        model: this.storage.get('model', 'gpt-3.5-turbo')
    };
};

/**
 * 保存 AI 配置
 */
AIConfig.prototype.saveConfig = function(config) {
    this.storage.put('apiUrl', config.apiUrl || '');
    this.storage.put('apiKey', config.apiKey || '');
    this.storage.put('messageFormat', config.messageFormat || 'openai');
    this.storage.put('model', config.model || 'gpt-3.5-turbo');
};

/**
 * 检查配置是否完整
 */
AIConfig.prototype.isConfigured = function() {
    var config = this.getConfig();
    return config.apiUrl && config.apiKey;
};

module.exports = AIConfig;
