/**
 * Markdown 渲染模块
 * 将 Markdown 文本转换为 Android SpannableString
 */

function MarkdownRenderer() {
}

/**
 * 渲染 Markdown 到 TextView
 * @param {TextView} textView - Android TextView
 * @param {String} markdown - Markdown 文本
 * @param {String} textColor - 文本颜色
 */
MarkdownRenderer.prototype.render = function(textView, markdown, textColor) {
    var SpannableStringBuilder = android.text.SpannableStringBuilder;
    var Spannable = android.text.Spannable;
    var StyleSpan = android.text.style.StyleSpan;
    var TypefaceSpan = android.text.style.TypefaceSpan;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var BackgroundColorSpan = android.text.style.BackgroundColorSpan;
    var Typeface = android.graphics.Typeface;
    var Color = android.graphics.Color;

    var builder = new SpannableStringBuilder();
    var lines = markdown.split('\n');
    var inCodeBlock = false;
    var codeBlockContent = [];

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // 代码块处理
        if (line.trim().startsWith('```')) {
            if (inCodeBlock) {
                // 结束代码块
                var codeText = codeBlockContent.join('\n');
                this.appendCodeBlock(builder, codeText);
                codeBlockContent = [];
                inCodeBlock = false;
            } else {
                // 开始代码块
                inCodeBlock = true;
            }
            continue;
        }

        if (inCodeBlock) {
            codeBlockContent.push(line);
            continue;
        }

        // 处理普通行
        this.processLine(builder, line);

        // 添加换行（除了最后一行）
        if (i < lines.length - 1) {
            builder.append('\n');
        }
    }

    textView.setText(builder);
};

/**
 * 处理单行文本
 */
MarkdownRenderer.prototype.processLine = function(builder, line) {
    var StyleSpan = android.text.style.StyleSpan;
    var TypefaceSpan = android.text.style.TypefaceSpan;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var BackgroundColorSpan = android.text.style.BackgroundColorSpan;
    var Spannable = android.text.Spannable;
    var Typeface = android.graphics.Typeface;
    var Color = android.graphics.Color;

    var startPos = builder.length();
    var processedLine = line;

    // 标题处理
    var headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
        var level = headerMatch[1].length;
        var text = headerMatch[2];
        builder.append(text);
        builder.setSpan(
            new StyleSpan(Typeface.BOLD),
            startPos,
            builder.length(),
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
        return;
    }

    // 列表处理
    var listMatch = line.match(/^(\s*)([-*+]|\d+\.)\s+(.+)$/);
    if (listMatch) {
        var indent = listMatch[1];
        var bullet = listMatch[2];
        var text = listMatch[3];
        builder.append(indent + '• ' + text);
        this.processInlineStyles(builder, startPos + indent.length + 2);
        return;
    }

    // 普通文本
    builder.append(line);
    this.processInlineStyles(builder, startPos);
};

/**
 * 处理行内样式（粗体、斜体、行内代码）
 */
MarkdownRenderer.prototype.processInlineStyles = function(builder, startPos) {
    var text = builder.toString().substring(startPos);
    var StyleSpan = android.text.style.StyleSpan;
    var TypefaceSpan = android.text.style.TypefaceSpan;
    var BackgroundColorSpan = android.text.style.BackgroundColorSpan;
    var Spannable = android.text.Spannable;
    var Typeface = android.graphics.Typeface;
    var Color = android.graphics.Color;

    // 行内代码 `code`
    var codeRegex = /`([^`]+)`/g;
    var match;
    while ((match = codeRegex.exec(text)) !== null) {
        var matchStart = startPos + match.index;
        var matchEnd = matchStart + match[0].length;

        // 替换为不带反引号的文本
        builder.replace(matchStart, matchEnd, match[1]);

        // 应用样式
        var newEnd = matchStart + match[1].length;
        builder.setSpan(
            new TypefaceSpan('monospace'),
            matchStart,
            newEnd,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
        builder.setSpan(
            new BackgroundColorSpan(Color.parseColor('#F0F0F0')),
            matchStart,
            newEnd,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );

        // 重新获取文本（因为已经修改）
        text = builder.toString().substring(startPos);
        codeRegex.lastIndex = 0;
    }

    // 粗体 **text** 或 __text__
    text = builder.toString().substring(startPos);
    var boldRegex = /(\*\*|__)([^\*_]+)\1/g;
    while ((match = boldRegex.exec(text)) !== null) {
        var matchStart = startPos + match.index;
        var matchEnd = matchStart + match[0].length;

        // 替换为不带标记的文本
        builder.replace(matchStart, matchEnd, match[2]);

        // 应用样式
        var newEnd = matchStart + match[2].length;
        builder.setSpan(
            new StyleSpan(Typeface.BOLD),
            matchStart,
            newEnd,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );

        // 重新获取文本
        text = builder.toString().substring(startPos);
        boldRegex.lastIndex = 0;
    }

    // 斜体 *text* 或 _text_
    text = builder.toString().substring(startPos);
    var italicRegex = /(\*|_)([^\*_]+)\1/g;
    while ((match = italicRegex.exec(text)) !== null) {
        var matchStart = startPos + match.index;
        var matchEnd = matchStart + match[0].length;

        // 替换为不带标记的文本
        builder.replace(matchStart, matchEnd, match[2]);

        // 应用样式
        var newEnd = matchStart + match[2].length;
        builder.setSpan(
            new StyleSpan(Typeface.ITALIC),
            matchStart,
            newEnd,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );

        // 重新获取文本
        text = builder.toString().substring(startPos);
        italicRegex.lastIndex = 0;
    }
};

/**
 * 添加代码块
 */
MarkdownRenderer.prototype.appendCodeBlock = function(builder, code) {
    var TypefaceSpan = android.text.style.TypefaceSpan;
    var BackgroundColorSpan = android.text.style.BackgroundColorSpan;
    var Spannable = android.text.Spannable;
    var Color = android.graphics.Color;

    var startPos = builder.length();
    builder.append(code);

    builder.setSpan(
        new TypefaceSpan('monospace'),
        startPos,
        builder.length(),
        Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
    );
    builder.setSpan(
        new BackgroundColorSpan(Color.parseColor('#F5F5F5')),
        startPos,
        builder.length(),
        Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
    );
};

module.exports = MarkdownRenderer;
