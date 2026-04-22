/**
 * XML转义工具
 * 用于在XML属性中安全地嵌入文本内容
 */

/**
 * 转义XML属性值中的特殊字符
 * @param {string} str - 需要转义的字符串
 * @returns {string} 转义后的字符串
 */
function escapeXmlAttr(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

module.exports = {
    escapeXmlAttr: escapeXmlAttr
};
