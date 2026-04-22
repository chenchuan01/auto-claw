/**
 * 代码语法高亮模块
 * 为 JavaScript 代码添加语法高亮
 */

function CodeHighlighter() {
    // 颜色配置 - 深色主题（VS Code Dark+ 风格）
    this.colors = {
        keyword: '#569CD6',      // 关键字 - 浅蓝色
        string: '#CE9178',       // 字符串 - 浅橙色
        comment: '#6A9955',      // 注释 - 暗绿色
        number: '#B5CEA8',       // 数字 - 浅绿色
        function: '#DCDCAA',     // 函数名 - 浅黄色
        operator: '#D4D4D4',     // 操作符 - 浅灰色
        default: '#D4D4D4'       // 默认文本 - 浅灰色
    };

    // JavaScript 关键字
    this.keywords = [
        'var', 'let', 'const', 'function', 'return', 'if', 'else', 'for', 'while',
        'do', 'switch', 'case', 'break', 'continue', 'try', 'catch', 'finally',
        'throw', 'new', 'this', 'typeof', 'instanceof', 'in', 'of', 'delete',
        'void', 'null', 'undefined', 'true', 'false', 'class', 'extends',
        'import', 'export', 'default', 'async', 'await', 'yield', 'static',
        'get', 'set', 'super', 'with', 'debugger'
    ];

    // 常用函数和对象
    this.builtins = [
        'console', 'log', 'error', 'warn', 'info', 'debug',
        'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval',
        'require', 'module', 'exports', 'toast', 'sleep', 'click',
        'text', 'desc', 'id', 'className', 'bounds', 'exists',
        'launchApp', 'currentPackage', 'currentActivity', 'back',
        'home', 'recents', 'powerDialog', 'notifications',
        'Array', 'Object', 'String', 'Number', 'Boolean', 'Date',
        'Math', 'JSON', 'RegExp', 'Error', 'Promise'
    ];
}

/**
 * 高亮代码
 * @param {TextView} textView - Android TextView
 * @param {String} code - 代码文本
 * @param {String} language - 语言类型（目前只支持 javascript）
 */
CodeHighlighter.prototype.highlight = function(textView, code, language) {
    var SpannableStringBuilder = android.text.SpannableStringBuilder;
    var Spannable = android.text.Spannable;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var StyleSpan = android.text.style.StyleSpan;
    var TypefaceSpan = android.text.style.TypefaceSpan;
    var Typeface = android.graphics.Typeface;
    var Color = android.graphics.Color;

    var builder = new SpannableStringBuilder(code);

    // 应用等宽字体
    builder.setSpan(
        new TypefaceSpan('monospace'),
        0,
        builder.length(),
        Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
    );

    if (language === 'javascript' || language === 'js' || !language) {
        this.highlightJavaScript(builder);
    }

    textView.setText(builder);
};

/**
 * 高亮 JavaScript 代码
 */
CodeHighlighter.prototype.highlightJavaScript = function(builder) {
    var text = builder.toString();
    var Spannable = android.text.Spannable;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var StyleSpan = android.text.style.StyleSpan;
    var Typeface = android.graphics.Typeface;
    var Color = android.graphics.Color;

    // 1. 高亮注释（单行和多行）
    this.highlightComments(builder, text);

    // 2. 高亮字符串
    this.highlightStrings(builder, text);

    // 3. 高亮数字
    this.highlightNumbers(builder, text);

    // 4. 高亮关键字
    this.highlightKeywords(builder, text);

    // 5. 高亮内置函数和对象
    this.highlightBuiltins(builder, text);
};

/**
 * 高亮注释
 */
CodeHighlighter.prototype.highlightComments = function(builder, text) {
    var Spannable = android.text.Spannable;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var StyleSpan = android.text.style.StyleSpan;
    var Typeface = android.graphics.Typeface;
    var Color = android.graphics.Color;

    // 单行注释 //
    var singleLineRegex = /\/\/.*/g;
    var match;
    while ((match = singleLineRegex.exec(text)) !== null) {
        builder.setSpan(
            new ForegroundColorSpan(Color.parseColor(this.colors.comment)),
            match.index,
            match.index + match[0].length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
        builder.setSpan(
            new StyleSpan(Typeface.ITALIC),
            match.index,
            match.index + match[0].length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
    }

    // 多行注释 /* */
    var multiLineRegex = /\/\*[\s\S]*?\*\//g;
    while ((match = multiLineRegex.exec(text)) !== null) {
        builder.setSpan(
            new ForegroundColorSpan(Color.parseColor(this.colors.comment)),
            match.index,
            match.index + match[0].length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
        builder.setSpan(
            new StyleSpan(Typeface.ITALIC),
            match.index,
            match.index + match[0].length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
    }
};

/**
 * 高亮字符串
 */
CodeHighlighter.prototype.highlightStrings = function(builder, text) {
    var Spannable = android.text.Spannable;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var Color = android.graphics.Color;

    // 双引号字符串
    var doubleQuoteRegex = /"(?:[^"\\]|\\.)*"/g;
    var match;
    while ((match = doubleQuoteRegex.exec(text)) !== null) {
        builder.setSpan(
            new ForegroundColorSpan(Color.parseColor(this.colors.string)),
            match.index,
            match.index + match[0].length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
    }

    // 单引号字符串
    var singleQuoteRegex = /'(?:[^'\\]|\\.)*'/g;
    while ((match = singleQuoteRegex.exec(text)) !== null) {
        builder.setSpan(
            new ForegroundColorSpan(Color.parseColor(this.colors.string)),
            match.index,
            match.index + match[0].length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
    }

    // 模板字符串
    var templateRegex = /`(?:[^`\\]|\\.)*`/g;
    while ((match = templateRegex.exec(text)) !== null) {
        builder.setSpan(
            new ForegroundColorSpan(Color.parseColor(this.colors.string)),
            match.index,
            match.index + match[0].length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
    }
};

/**
 * 高亮数字
 */
CodeHighlighter.prototype.highlightNumbers = function(builder, text) {
    var Spannable = android.text.Spannable;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var Color = android.graphics.Color;

    // 匹配数字（整数、小数、十六进制）
    var numberRegex = /\b(?:0x[0-9a-fA-F]+|\d+\.?\d*)\b/g;
    var match;
    while ((match = numberRegex.exec(text)) !== null) {
        builder.setSpan(
            new ForegroundColorSpan(Color.parseColor(this.colors.number)),
            match.index,
            match.index + match[0].length,
            Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
        );
    }
};

/**
 * 高亮关键字
 */
CodeHighlighter.prototype.highlightKeywords = function(builder, text) {
    var Spannable = android.text.Spannable;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var StyleSpan = android.text.style.StyleSpan;
    var Typeface = android.graphics.Typeface;
    var Color = android.graphics.Color;

    for (var i = 0; i < this.keywords.length; i++) {
        var keyword = this.keywords[i];
        var regex = new RegExp('\\b' + keyword + '\\b', 'g');
        var match;
        while ((match = regex.exec(text)) !== null) {
            builder.setSpan(
                new ForegroundColorSpan(Color.parseColor(this.colors.keyword)),
                match.index,
                match.index + match[0].length,
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            );
            builder.setSpan(
                new StyleSpan(Typeface.BOLD),
                match.index,
                match.index + match[0].length,
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            );
        }
    }
};

/**
 * 高亮内置函数和对象
 */
CodeHighlighter.prototype.highlightBuiltins = function(builder, text) {
    var Spannable = android.text.Spannable;
    var ForegroundColorSpan = android.text.style.ForegroundColorSpan;
    var Color = android.graphics.Color;

    for (var i = 0; i < this.builtins.length; i++) {
        var builtin = this.builtins[i];
        var regex = new RegExp('\\b' + builtin + '\\b', 'g');
        var match;
        while ((match = regex.exec(text)) !== null) {
            builder.setSpan(
                new ForegroundColorSpan(Color.parseColor(this.colors.function)),
                match.index,
                match.index + match[0].length,
                Spannable.SPAN_EXCLUSIVE_EXCLUSIVE
            );
        }
    }
};

module.exports = CodeHighlighter;
