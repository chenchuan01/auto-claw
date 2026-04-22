/**
 * 字体管理模块
 * 负责加载和应用图标字体（支持 Feather Icons 和 Font Awesome）
 */

var FeatherIconCodes = require('./feather_icon_codes');
var FontAwesomeIconCodes = require('./fontawesome_icon_codes');

/**
 * @param {string} fontType - 字体类型：'feather' 或 'fontawesome'（默认 'fontawesome'）
 */
function FontManager(fontType) {
    this.typeface = null;
    this.fontType = fontType || 'fontawesome';

    if (this.fontType === 'feather') {
        this.fontPath = files.path('./assets/fonts/feather.ttf');
        this.icons = FeatherIconCodes;
    } else if (this.fontType === 'fontawesome') {
        // 使用 Solid 字体，因为大部分常用图标只在 Solid 中存在
        this.fontPath = files.path('./assets/fonts/fa-solid-900.ttf');
        this.icons = FontAwesomeIconCodes;
    } else {
        throw new Error('不支持的字体类型: ' + fontType);
    }
}

/**
 * 加载字体文件
 */
FontManager.prototype.load = function() {
    try {
        if (files.exists(this.fontPath)) {
            this.typeface = android.graphics.Typeface.createFromFile(this.fontPath);
            var fontName = this.fontType === 'feather' ? 'Feather Icons' : 'Font Awesome';
            console.log('[FontManager] ' + fontName + ' 字体加载成功');
            return true;
        } else {
            console.warn('[FontManager] 字体文件不存在: ' + this.fontPath);
            console.warn('[FontManager] 将使用默认 Unicode 图标');
            return false;
        }
    } catch (e) {
        console.error('[FontManager] 字体加载失败: ' + e);
        return false;
    }
};

/**
 * 应用字体到指定的视图
 * @param {...View} views - 要应用字体的视图（可传入多个）
 */
FontManager.prototype.apply = function() {
    if (!this.typeface) return;

    var tf = this.typeface;
    var isFontAwesome = this.fontType === 'fontawesome';

    // 使用传统方式处理 arguments（兼容 Rhino 引擎）
    for (var i = 0; i < arguments.length; i++) {
        (function(view) {
            if (view) {
                ui.run(function() {
                    try {
                        // Font Awesome 使用 NORMAL，Feather Icons 也使用 NORMAL
                        view.setTypeface(tf, android.graphics.Typeface.NORMAL);
                        // 清除可能存在的 paint flags
                        view.getPaint().setFakeBoldText(false);
                    } catch (e) {
                        console.error('[FontManager] 应用字体失败: ' + e);
                    }
                });
            }
        })(arguments[i]);
    }
};

/**
 * 检查字体是否已加载
 */
FontManager.prototype.isLoaded = function() {
    return this.typeface !== null;
};

/**
 * 获取图标字符
 * @param {string} iconName - 图标名称（如 'home', 'settings'）
 * @returns {string} 图标字符
 */
FontManager.prototype.getIcon = function(iconName) {
    return this.icons.getIcon(iconName);
};

/**
 * 获取所有可用的图标名称
 * @returns {Array<string>} 图标名称数组
 */
FontManager.prototype.getAvailableIcons = function() {
    return Object.keys(this.icons.FEATHER_ICONS);
};

/**
 * 应用字体到视图（高级版本，支持自定义样式）
 * @param {View} view - 要应用字体的视图
 * @param {Object} options - 选项 {style: 'normal'|'bold', antiAlias: true}
 */
FontManager.prototype.applyWithOptions = function(view, options) {
    if (!this.typeface || !view) return;

    options = options || {};
    var style = android.graphics.Typeface.NORMAL;

    if (options.style === 'bold') {
        style = android.graphics.Typeface.BOLD;
    }

    var tf = this.typeface;
    ui.run(function() {
        try {
            view.setTypeface(tf, style);

            if (options.antiAlias !== false) {
                view.getPaint().setAntiAlias(true);
            }

            if (options.style !== 'bold') {
                view.getPaint().setFakeBoldText(false);
            }
        } catch (e) {
            console.error('[FontManager] 应用字体失败: ' + e);
        }
    });
};

module.exports = FontManager;
