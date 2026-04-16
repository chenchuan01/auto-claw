/**
 * UI设置页面模块
 */

var Config = require('./config');
var C = Config.colors;
var I = Config.icons;

function UISettings(uiManager) {
    this.uiManager = uiManager;
}

UISettings.prototype.show = function() {
    var self = this;
    var mgr = this.uiManager;
    var aiConfig = mgr.aiService.aiConfig.getConfig();

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        '  <horizontal bg="' + C.primary + '" padding="20 16 16 16" gravity="center_vertical">' +
        '    <text id="btn_back" text="' + I.arrowLeft + '" textSize="26sp" textColor="#FFFFFF" padding="4 4 12 4"/>' +
        '    <text text="AI 设置" textSize="22sp" textColor="#FFFFFF" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_save" text="✓" textSize="24sp" textColor="#FFFFFF" padding="8 8 8 12"/>' +
        '  </horizontal>' +
        '  <!-- 内容区域 -->' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="20">' +
        '      <!-- API 配置 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24">' +
        '        <text text="API 配置" textSize="18sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="20"/>' +
        '        ' +
        '        <text text="API URL" textSize="14sp" textColor="' + C.textSecondary + '" marginBottom="8"/>' +
        '        <input id="input_api_url" hint="https://api.openai.com/v1" text="' + aiConfig.apiUrl + '" textSize="14sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12" cornerRadius="12" singleLine="true"/>' +
        '        ' +
        '        <text text="API Key" textSize="14sp" textColor="' + C.textSecondary + '" marginTop="16" marginBottom="8"/>' +
        '        <input id="input_api_key" hint="sk-..." text="' + aiConfig.apiKey + '" textSize="14sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12" cornerRadius="12" singleLine="true" inputType="textPassword"/>' +
        '        ' +
        '        <text text="模型名称" textSize="14sp" textColor="' + C.textSecondary + '" marginTop="16" marginBottom="8"/>' +
        '        <input id="input_model" hint="gpt-3.5-turbo" text="' + aiConfig.model + '" textSize="14sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12" cornerRadius="12" singleLine="true"/>' +
        '      </vertical>' +
        '      ' +
        '      <!-- 消息格式 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="消息格式" textSize="18sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="16"/>' +
        '        ' +
        '        <horizontal id="radio_openai" padding="12" bg="' + (aiConfig.messageFormat === 'openai' ? C.primary + '22' : '#00000000') + '" cornerRadius="12" marginBottom="12">' +
        '          <text id="icon_openai" text="' + (aiConfig.messageFormat === 'openai' ? '●' : '○') + '" textSize="20sp" textColor="' + C.primary + '" marginRight="12"/>' +
        '          <vertical layout_weight="1">' +
        '            <text text="OpenAI 格式" textSize="16sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '            <text text="适用于 OpenAI、Azure OpenAI、兼容 API" textSize="12sp" textColor="' + C.textSecondary + '" marginTop="4"/>' +
        '          </vertical>' +
        '        </horizontal>' +
        '        ' +
        '        <horizontal id="radio_anthropic" padding="12" bg="' + (aiConfig.messageFormat === 'anthropic' ? C.primary + '22' : '#00000000') + '" cornerRadius="12">' +
        '          <text id="icon_anthropic" text="' + (aiConfig.messageFormat === 'anthropic' ? '●' : '○') + '" textSize="20sp" textColor="' + C.primary + '" marginRight="12"/>' +
        '          <vertical layout_weight="1">' +
        '            <text text="Anthropic 格式" textSize="16sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '            <text text="适用于 Claude API" textSize="12sp" textColor="' + C.textSecondary + '" marginTop="4"/>' +
        '          </vertical>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      ' +
        '      <!-- 说明 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="' + I.bars + ' 使用说明" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        <text text="1. 配置 API URL 和 Key 后即可使用 AI 对话功能" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        <text text="2. OpenAI 格式 URL 示例: https://api.openai.com/v1" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        <text text="3. Anthropic 格式 URL 示例: https://api.anthropic.com/v1" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        <text text="4. AI 助手已集成 AutoX.js v6 开发知识" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '      </vertical>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    var selectedFormat = aiConfig.messageFormat;

    // 应用字体
    mgr.fontManager.apply(ui.btn_back);

    ui.btn_back.on('click', function() {
        mgr.showMainView();
    });

    ui.btn_save.on('click', function() {
        self.saveSettings(selectedFormat);
    });

    ui.radio_openai.on('click', function() {
        selectedFormat = 'openai';
        ui.icon_openai.setText('●');
        ui.icon_anthropic.setText('○');
        ui.radio_openai.attr('bg', C.primary + '22');
        ui.radio_anthropic.attr('bg', '#00000000');
    });

    ui.radio_anthropic.on('click', function() {
        selectedFormat = 'anthropic';
        ui.icon_openai.setText('○');
        ui.icon_anthropic.setText('●');
        ui.radio_openai.attr('bg', '#00000000');
        ui.radio_anthropic.attr('bg', C.primary + '22');
    });
};

UISettings.prototype.saveSettings = function(messageFormat) {
    var mgr = this.uiManager;
    var apiUrl = ui.input_api_url.getText().toString().trim();
    var apiKey = ui.input_api_key.getText().toString().trim();
    var model = ui.input_model.getText().toString().trim();

    if (!apiUrl) {
        toast('请输入 API URL');
        return;
    }

    if (!apiKey) {
        toast('请输入 API Key');
        return;
    }

    if (!model) {
        toast('请输入模型名称');
        return;
    }

    mgr.aiService.aiConfig.saveConfig({
        apiUrl: apiUrl,
        apiKey: apiKey,
        model: model,
        messageFormat: messageFormat
    });

    toast('设置已保存');
    mgr.showMainView();
};

module.exports = UISettings;
