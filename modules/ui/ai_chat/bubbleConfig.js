/**
 * AI 对话消息气泡配置
 */

var Config = require('../../core/config');
var C = Config.colors;

/**
 * 消息气泡配置
 */
var MESSAGE_BUBBLE_CONFIG = {
    // 气泡宽度
    bubbleWidth: '280dp',

    // 气泡间距（单独设置）
    bubbleMarginLeft: '16',
    bubbleMarginRight: '16',
    bubbleMarginBottom: '12',

    // 气泡圆角
    bubbleRadius: '16',

    // 气泡内边距
    bubblePadding: '14 12',  // horizontal vertical

    // 用户消息样式
    userBubble: {
        bgColor: C.primary,
        textColor: '#FFFFFF',
        alignment: 'right'
    },

    // AI 消息样式
    aiBubble: {
        bgColor: C.card,
        textColor: C.textPrimary,
        alignment: 'left'
    },

    // 文本样式
    textSize: '14sp',
    lineSpacing: '4',
    textGravity: 'left',  // 文本在气泡内居左

    // 代码块样式
    codeBlock: {
        bgColor: C.surface,
        textColor: C.textPrimary,
        textSize: '12sp',
        radius: '8',
        padding: '10',
        headerPadding: '8 10'
    }
};

/**
 * 获取消息气泡配置
 */
function getConfig() {
    return MESSAGE_BUBBLE_CONFIG;
}

/**
 * 更新消息气泡配置
 */
function updateConfig(config) {
    for (var key in config) {
        if (key in MESSAGE_BUBBLE_CONFIG) {
            if (typeof MESSAGE_BUBBLE_CONFIG[key] === 'object' && !Array.isArray(MESSAGE_BUBBLE_CONFIG[key])) {
                // 嵌套对象
                for (var subKey in config[key]) {
                    if (subKey in MESSAGE_BUBBLE_CONFIG[key]) {
                        MESSAGE_BUBBLE_CONFIG[key][subKey] = config[key][subKey];
                    }
                }
            } else {
                MESSAGE_BUBBLE_CONFIG[key] = config[key];
            }
        }
    }
}

module.exports = {
    getConfig: getConfig,
    updateConfig: updateConfig,
    MESSAGE_BUBBLE_CONFIG: MESSAGE_BUBBLE_CONFIG
};
