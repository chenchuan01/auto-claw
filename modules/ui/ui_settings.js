/**
 * UI设置页面模块
 */

var Config = require('../core/config');
var HeaderBuilder = require('./header_builder');
var C = Config.colors;
var I = Config.icons;

function UISettings(uiManager) {
    this.uiManager = uiManager;
}

UISettings.prototype.getSystemConfig = function() {
    var storage = storages.create('autoclaw_system');
    return {
        enableLogging: storage.get('enableLogging', Config.settings.enableLogging),
        logPath: storage.get('logPath', Config.settings.logPath)
    };
};

UISettings.prototype.show = function() {
    var self = this;
    var mgr = this.uiManager;
    var aiConfig = mgr.aiService.aiConfig.getConfig();
    var systemConfig = this.getSystemConfig();

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        HeaderBuilder.buildHeader({
            title: '系统设置',
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back',
            rightIcon: I.save,
            rightIconId: 'btn_save'
        }) +
        '  <!-- 内容区域 -->' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="20">' +
        '      <!-- API 配置 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24">' +
        '        <text text="API 配置" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        ' +
        '        <text text="API URL" textSize="14sp" textColor="' + C.textSecondary + '" marginBottom="8"/>' +
        '        <input id="input_api_url" hint="https://api.openai.com/v1" text="' + aiConfig.apiUrl + '" textSize="14sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12" cornerRadius="12" singleLine="true"/>' +
        '        ' +
        '        <text text="API Key" textSize="14sp" textColor="' + C.textSecondary + '" marginTop="16" marginBottom="8"/>' +
        '        <input id="input_api_key" hint="sk-..." text="' + aiConfig.apiKey + '" textSize="14sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12" cornerRadius="12" singleLine="true" password="true"/>' +
        '        ' +
        '        <text text="模型名称" textSize="14sp" textColor="' + C.textSecondary + '" marginTop="16" marginBottom="8"/>' +
        '        <input id="input_model" hint="gpt-3.5-turbo" text="' + aiConfig.model + '" textSize="14sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12" cornerRadius="12" singleLine="true"/>' +
        '      </vertical>' +
        '      ' +
        '      <!-- 消息格式 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="消息格式" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        ' +
        '        <horizontal id="radio_openai" padding="12" bg="' + (aiConfig.messageFormat === 'openai' ? C.primary + '33' : '#00000000') + '" cornerRadius="12" marginBottom="12">' +
        '          <text id="icon_openai" text="' + (aiConfig.messageFormat === 'openai' ? '●' : '○') + '" textSize="20sp" textColor="' + C.primary + '" marginRight="12"/>' +
        '          <vertical layout_weight="1">' +
        '            <text text="OpenAI 格式" textSize="16sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '            <text text="适用于 OpenAI、Azure OpenAI、兼容 API" textSize="12sp" textColor="' + C.textSecondary + '" marginTop="4"/>' +
        '          </vertical>' +
        '        </horizontal>' +
        '        ' +
        '        <horizontal id="radio_anthropic" padding="12" bg="' + (aiConfig.messageFormat === 'anthropic' ? C.primary + '33' : '#00000000') + '" cornerRadius="12">' +
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
        '        <text text="使用说明" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        <text text="1. 配置 API URL 和 Key 后即可使用 AI 对话功能" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        <text text="2. OpenAI 格式填 base URL，自动拼接 /chat/completions" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        <text text="3. Anthropic 格式填 base URL，自动拼接 /v1/messages" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '      </vertical>' +
        '      ' +
        '      <!-- 系统参数 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="系统参数" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>' +
        '        ' +
        '        <horizontal gravity="center_vertical" marginBottom="16">' +
        '          <text text="启用系统日志" textSize="14sp" textColor="' + C.textPrimary + '" layout_weight="1"/>' +
        '          <Switch id="switch_enable_log" checked="' + systemConfig.enableLogging + '" trackColor="' + C.primary + '"/>' +
        '        </horizontal>' +
        '        ' +
        '        <text text="日志存放路径" textSize="14sp" textColor="' + C.textSecondary + '" marginBottom="8"/>' +
        '        <input id="input_log_path" hint="/sdcard/AutoClaw/logs/" text="' + systemConfig.logPath + '" textSize="14sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="12" cornerRadius="12" singleLine="true"/>' +
        '        ' +
        '        <button id="btn_clear_cache" text="清理缓存" textSize="14sp" textColor="#FFFFFF" bg="' + C.warning + '" cornerRadius="12" padding="12" marginTop="16"/>' +
        '      </vertical>' +
        '    </vertical>' +
        '  </scroll>' +
        mgr.buildBottomNav('tasks') +
        '</vertical>'
    );

    var selectedFormat = aiConfig.messageFormat;

    // 应用字体
    mgr.fontManager.applyLight(ui.btn_back, ui.btn_save);
    mgr.bindBottomNav();

    // 强制设置 API Key 为密码模式
    ui.input_api_key.setInputType(
        android.text.InputType.TYPE_CLASS_TEXT | android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD
    );

    ui.btn_back.on('click', function() {
        back();
    });

    ui.btn_save.on('click', function() {
        self.saveSettings(selectedFormat);
    });

    ui.radio_openai.on('click', function() {
        selectedFormat = 'openai';
        ui.icon_openai.setText('●');
        ui.icon_anthropic.setText('○');
        ui.radio_openai.attr('bg', C.primary + '33');
        ui.radio_anthropic.attr('bg', '#00000000');
    });

    ui.radio_anthropic.on('click', function() {
        selectedFormat = 'anthropic';
        ui.icon_openai.setText('○');
        ui.icon_anthropic.setText('●');
        ui.radio_openai.attr('bg', '#00000000');
        ui.radio_anthropic.attr('bg', C.primary + '33');
    });
};

UISettings.prototype.saveSettings = function(messageFormat) {
    var mgr = this.uiManager;
    var apiUrl = ui.input_api_url.getText().toString().trim();
    var apiKey = ui.input_api_key.getText().toString().trim();
    var model = ui.input_model.getText().toString().trim();
    var enableLogging = ui.switch_enable_log.isChecked();
    var logPath = ui.input_log_path.getText().toString().trim();

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

    // 保存 AI 配置
    mgr.aiService.aiConfig.saveConfig({
        apiUrl: apiUrl,
        apiKey: apiKey,
        model: model,
        messageFormat: messageFormat
    });

    // 保存系统配置
    var storage = storages.create('autoclaw_system');
    storage.put('enableLogging', enableLogging);
    storage.put('logPath', logPath);

    toast('设置已保存');
    mgr.showMainView();
};

module.exports = UISettings;
