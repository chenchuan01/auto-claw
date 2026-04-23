/**
 * 支持实时代码高亮的编辑器
 */

var CodeHighlighter = require('../../utils/code_highlighter');

/**
 * 为 EditText 添加实时代码高亮
 * @param {EditText} editText - Android EditText 控件
 */
function setupHighlightedEditor(editText) {
    var highlighter = new CodeHighlighter();
    var isUpdating = false;

    // 添加文本变化监听器
    editText.addTextChangedListener({
        beforeTextChanged: function(s, start, count, after) {
            // 不需要处理
        },
        onTextChanged: function(s, start, before, count) {
            // 不需要处理
        },
        afterTextChanged: function(editable) {
            if (isUpdating) return;

            isUpdating = true;
            try {
                // 保存光标位置
                var selectionStart = editText.getSelectionStart();
                var selectionEnd = editText.getSelectionEnd();

                // 获取文本内容
                var text = editable.toString();

                // 清除现有的样式
                var spans = editable.getSpans(0, editable.length(), android.text.style.CharacterStyle);
                for (var i = 0; i < spans.length; i++) {
                    editable.removeSpan(spans[i]);
                }

                // 应用语法高亮
                highlighter.applyHighlight(editable, text);

                // 恢复光标位置
                editText.setSelection(
                    Math.min(selectionStart, editable.length()),
                    Math.min(selectionEnd, editable.length())
                );
            } catch (e) {
                console.error('[HighlightedEditor] 高亮失败: ' + e);
            } finally {
                isUpdating = false;
            }
        }
    });

    // 初始高亮
    var initialText = editText.getText().toString();
    if (initialText) {
        var editable = editText.getEditableText();
        highlighter.applyHighlight(editable, initialText);
    }
}

module.exports = {
    setupHighlightedEditor: setupHighlightedEditor
};
