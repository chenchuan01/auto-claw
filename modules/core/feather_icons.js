/**
 * Feather Icons 图标管理器
 * 使用 WebView 渲染 SVG 图标
 */

var Config = require('./config');

function FeatherIcons() {
    this.iconsPath = files.path('./assets/feather');
    this.cache = {}; // SVG 内容缓存
}

/**
 * 读取 SVG 文件内容
 * @param {string} iconName - 图标名称（如 'play', 'arrow-left'）
 * @returns {string} SVG 内容
 */
FeatherIcons.prototype.getSvg = function(iconName) {
    // 检查缓存
    if (this.cache[iconName]) {
        return this.cache[iconName];
    }

    var svgPath = files.join(this.iconsPath, iconName + '.svg');

    if (!files.exists(svgPath)) {
        console.warn('[FeatherIcons] 图标不存在: ' + iconName);
        return '';
    }

    try {
        var svgContent = files.read(svgPath);
        this.cache[iconName] = svgContent;
        return svgContent;
    } catch (e) {
        console.error('[FeatherIcons] 读取图标失败: ' + iconName, e);
        return '';
    }
};

/**
 * 创建图标 WebView（用于 UI 布局中的图标）
 * @param {string} iconName - 图标名称
 * @param {Object} options - 选项 {color, size, strokeWidth}
 * @returns {WebView} Android WebView
 */
FeatherIcons.prototype.createWebView = function(iconName, options) {
    options = options || {};
    var color = options.color || '#000000';
    var size = options.size || 24;
    var strokeWidth = options.strokeWidth || 2;

    var svgContent = this.getSvg(iconName);
    if (!svgContent) return null;

    // 修改 SVG 属性
    svgContent = svgContent.replace(/stroke="currentColor"/g, 'stroke="' + color + '"');
    svgContent = svgContent.replace(/stroke-width="2"/g, 'stroke-width="' + strokeWidth + '"');
    svgContent = svgContent.replace(/width="24"/g, 'width="' + size + '"');
    svgContent = svgContent.replace(/height="24"/g, 'height="' + size + '"');

    var html = '<!DOCTYPE html>' +
        '<html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>' +
        'body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; background: transparent; }' +
        'svg { display: block; }' +
        '</style></head><body>' +
        svgContent +
        '</body></html>';

    var webView = new com.stardust.autojs.core.web.InjectableWebView(context);
    webView.setBackgroundColor(android.graphics.Color.TRANSPARENT);

    var layoutParams = new android.widget.LinearLayout.LayoutParams(
        size * context.getResources().getDisplayMetrics().density,
        size * context.getResources().getDisplayMetrics().density
    );
    webView.setLayoutParams(layoutParams);

    webView.loadDataWithBaseURL(null, html, 'text/html', 'utf-8', null);

    return webView;
};

/**
 * 生成图标的 HTML 字符串（用于在 XML 布局中嵌入）
 * 注意：AutoX.js 的 XML 布局不支持直接嵌入 WebView，需要动态添加
 * @param {string} iconName - 图标名称
 * @param {Object} options - 选项 {color, size, strokeWidth}
 * @returns {string} 图标的占位符 ID
 */
FeatherIcons.prototype.getPlaceholderId = function(iconName, options) {
    // 返回一个唯一 ID，用于后续动态替换
    return 'feather_icon_' + iconName + '_' + Date.now();
};

module.exports = FeatherIcons;
