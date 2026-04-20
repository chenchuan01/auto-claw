/**
 * 测试 FontManager 模块
 */

"ui";

var FontManager = require('./modules/font_manager');

ui.layout(
    '<vertical padding="16">' +
    '  <text id="test1" text="测试文本1" textSize="20sp"/>' +
    '  <text id="test2" text="测试文本2" textSize="20sp"/>' +
    '  <button id="btn_test" text="测试应用字体"/>' +
    '</vertical>'
);

var fontManager = new FontManager();
fontManager.load();

ui.btn_test.on('click', function() {
    try {
        console.log('开始测试字体应用...');
        fontManager.apply(ui.test1, ui.test2);
        toast('字体应用成功');
    } catch (e) {
        console.error('字体应用失败:', e);
        toast('字体应用失败: ' + e.message);
    }
});
