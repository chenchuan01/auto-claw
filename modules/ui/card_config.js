/**
 * Card 样式配置
 * 统一管理所有 card 的样式
 */

var Config = require('../core/config');
var C = Config.colors;

/**
 * Card 样式配置
 */
var CARD_CONFIG = {
    // 标准 card（详情页面）
    standard: {
        padding: '24',
        cornerRadius: '20',
        marginTop: '16',

        // title 样式
        titleSize: '16sp',
        titleColor: C.accent,
        titleStyle: 'bold',
        titleMarginBottom: '12'
    },

    // 列表 card（主页、任务中心列表）
    list: {
        padding: '20',
        cornerRadius: '20',
        margin: '12 16 12 16',

        // title 样式
        titleSize: '19sp',
        titleColor: C.textPrimary,
        titleStyle: 'bold'
    },

    // 小 card（日志、输入框等）
    small: {
        padding: '16',
        cornerRadius: '16'
    }
};

/**
 * 构建标准 card 的 title
 * @param {string} text - 标题文本
 * @returns {string} title XML
 */
function buildCardTitle(text) {
    return '<text text="' + text + '" ' +
           'textSize="' + CARD_CONFIG.standard.titleSize + '" ' +
           'textColor="' + CARD_CONFIG.standard.titleColor + '" ' +
           'textStyle="' + CARD_CONFIG.standard.titleStyle + '" ' +
           'marginBottom="' + CARD_CONFIG.standard.titleMarginBottom + '"/>';
}

/**
 * 获取 card 配置
 */
function getConfig(type) {
    return CARD_CONFIG[type || 'standard'];
}

module.exports = {
    CARD_CONFIG: CARD_CONFIG,
    buildCardTitle: buildCardTitle,
    getConfig: getConfig
};
