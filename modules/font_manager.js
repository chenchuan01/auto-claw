/**
 * 字体管理模块
 * 负责加载和应用 Font Awesome 图标字体
 */

function FontManager() {
    this.typeface = null;
    this.fontPath = files.path('./assets/fonts/fa-solid-900.ttf');
}

/**
 * 加载字体文件
 */
FontManager.prototype.load = function() {
    try {
        if (files.exists(this.fontPath)) {
            this.typeface = android.graphics.Typeface.createFromFile(this.fontPath);
            console.log('[FontManager] Font Awesome 字体加载成功');
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
    var views = Array.prototype.slice.call(arguments);

    views.forEach(function(view) {
        if (view) {
            ui.run(function() {
                try {
                    view.setTypeface(tf);
                } catch (e) {
                    console.error('[FontManager] 应用字体失败: ' + e);
                }
            });
        }
    });
};

/**
 * 检查字体是否已加载
 */
FontManager.prototype.isLoaded = function() {
    return this.typeface !== null;
};

module.exports = FontManager;
