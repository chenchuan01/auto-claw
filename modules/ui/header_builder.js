/**
 * Header 配置和构建器
 * 统一管理所有页面的 header 样式
 */

var Config = require('../core/config');
var C = Config.colors;
var I = Config.icons;

/**
 * Header 配置
 */
var HEADER_CONFIG = {
    height: '56dp',           // 固定高度
    padding: '16 16 16 16',   // 统一内边距

    // 标题样式
    titleSize: '20sp',
    titleColor: '#FFFFFF',
    titleStyle: 'bold',
    titleLineSpacing: '0dp',  // 行间距（避免遮挡）
    titleGravity: 'center_vertical', // 垂直居中（避免遮挡）
    titleIncludeFontPadding: false,  // 移除字体内置 padding（中英文等高）

    // 图标样式
    iconSize: '20sp',
    iconColor: '#FFFFFF',
    iconStyle: 'normal',      // 图标不使用粗体
    iconWidth: '40dp',

    // 背景
    background: C.primary
};

/**
 * 构建标准 header
 * @param {Object} options - 配置选项
 *   - title: 标题文本
 *   - leftIcon: 左侧图标（通常是返回按钮）
 *   - leftIconId: 左侧图标的 id
 *   - rightIcon: 右侧图标
 *   - rightIconId: 右侧图标的 id
 *   - rightIcon2: 第二个右侧图标
 *   - rightIcon2Id: 第二个右侧图标的 id
 * @returns {string} header XML 字符串
 */
function buildHeader(options) {
    options = options || {};

    var xml = '<horizontal bg="' + HEADER_CONFIG.background + '" ' +
              'h="' + HEADER_CONFIG.height + '" ' +
              'padding="' + HEADER_CONFIG.padding + '" ' +
              'gravity="center_vertical">';

    // 左侧图标（通常是返回按钮）
    if (options.leftIcon) {
        xml += '<text id="' + (options.leftIconId || 'btn_back') + '" ' +
               'text="' + options.leftIcon + '" ' +
               'textSize="' + HEADER_CONFIG.iconSize + '" ' +
               'textColor="' + HEADER_CONFIG.iconColor + '" ' +
               'w="' + HEADER_CONFIG.iconWidth + '" ' +
               'gravity="center"/>';
    }

    // 标题
    if (options.title) {
        xml += '<text text="' + options.title + '" ' +
               'textSize="' + HEADER_CONFIG.titleSize + '" ' +
               'textColor="' + HEADER_CONFIG.titleColor + '" ' +
               'textStyle="' + HEADER_CONFIG.titleStyle + '" ' +
               'gravity="' + HEADER_CONFIG.titleGravity + '" ' +
               'lineSpacingExtra="' + HEADER_CONFIG.titleLineSpacing + '" ' +
               'includeFontPadding="false" ' +
               'layout_weight="1"/>';
    }

    // 右侧图标2（如果有）
    if (options.rightIcon2) {
        xml += '<text id="' + (options.rightIcon2Id || 'btn_right2') + '" ' +
               'text="' + options.rightIcon2 + '" ' +
               'textSize="' + HEADER_CONFIG.iconSize + '" ' +
               'textColor="' + HEADER_CONFIG.iconColor + '" ' +
               'w="' + HEADER_CONFIG.iconWidth + '" ' +
               'gravity="center"/>';
    }

    // 右侧图标
    if (options.rightIcon) {
        xml += '<text id="' + (options.rightIconId || 'btn_right') + '" ' +
               'text="' + options.rightIcon + '" ' +
               'textSize="' + HEADER_CONFIG.iconSize + '" ' +
               'textColor="' + HEADER_CONFIG.iconColor + '" ' +
               'w="' + HEADER_CONFIG.iconWidth + '" ' +
               'gravity="center"/>';
    }

    xml += '</horizontal>';

    return xml;
}

/**
 * 获取 header 配置
 */
function getHeaderConfig() {
    return HEADER_CONFIG;
}

/**
 * 更新 header 配置
 */
function updateHeaderConfig(config) {
    for (var key in config) {
        if (key in HEADER_CONFIG) {
            HEADER_CONFIG[key] = config[key];
        }
    }
}

module.exports = {
    buildHeader: buildHeader,
    getHeaderConfig: getHeaderConfig,
    updateHeaderConfig: updateHeaderConfig,
    HEADER_CONFIG: HEADER_CONFIG
};
