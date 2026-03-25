/**
 * 脚本辅助模块
 * 提供代码格式化和 AutoX.js 代码片段
 */

// AutoX.js 常用代码片段
var snippets = [
    {
        category: '基础',
        items: [
            { name: 'toast 提示', code: 'toast("提示内容");' },
            { name: 'sleep 延时', code: 'sleep(1000);' },
            { name: 'console.log', code: 'console.log("调试信息");' },
            { name: '无障碍等待', code: '"auto";\nauto.waitFor();' },
            { name: 'try-catch', code: 'try {\n    // 代码\n} catch (e) {\n    console.error("错误:", e.message);\n}' }
        ]
    },
    {
        category: '坐标操作',
        items: [
            { name: '点击坐标', code: 'click(x, y);' },
            { name: '长按坐标', code: 'longClick(x, y);' },
            { name: '滑动', code: 'swipe(x1, y1, x2, y2, 500);' },
            { name: '按压', code: 'press(x, y, 1000);' },
            { name: '手势', code: 'gesture(500, [x1, y1], [x2, y2]);' }
        ]
    },
    {
        category: '控件操作',
        items: [
            { name: '文本查找点击', code: 'var w = text("按钮").findOne(5000);\nif (w) {\n    w.click();\n}' },
            { name: 'ID 查找点击', code: 'var w = id("btn_id").findOne(5000);\nif (w) {\n    w.click();\n}' },
            { name: '描述查找', code: 'var w = desc("描述").findOne(5000);' },
            { name: '输入文本', code: 'var w = id("input_id").findOne(5000);\nif (w) {\n    w.setText("文本内容");\n}' },
            { name: '滚动查找', code: 'var w = className("android.widget.ScrollView").findOne();\nif (w) {\n    w.scrollForward();\n}' }
        ]
    },
    {
        category: '应用与设备',
        items: [
            { name: '启动应用', code: 'app.launchApp("应用名");' },
            { name: '包名启动', code: 'app.launch("com.example.app");' },
            { name: '获取包名', code: 'var pkg = app.getPackageName("应用名");\nconsole.log(pkg);' },
            { name: '当前包名', code: 'var pkg = currentPackage();\nconsole.log(pkg);' },
            { name: '屏幕尺寸', code: 'var w = device.width;\nvar h = device.height;\nconsole.log("屏幕: " + w + "x" + h);' }
        ]
    },
    {
        category: '文件与存储',
        items: [
            { name: '读取文件', code: 'var content = files.read("/sdcard/test.txt");\nconsole.log(content);' },
            { name: '写入文件', code: 'files.write("/sdcard/test.txt", "内容");' },
            { name: '本地存储', code: 'var storage = storages.create("my_data");\nstorage.put("key", "value");\nvar val = storage.get("key");' }
        ]
    },
    {
        category: '流程控制',
        items: [
            { name: '循环执行', code: 'for (var i = 0; i < 10; i++) {\n    // 循环体\n    sleep(1000);\n}' },
            { name: '条件等待', code: 'while (!text("目标").exists()) {\n    sleep(500);\n}\ntext("目标").findOne().click();' },
            { name: '定时执行', code: 'setInterval(function() {\n    // 定时执行的代码\n}, 5000);' }
        ]
    }
];

/**
 * 统计行中不在字符串和注释内的括号数
 */
function countBrackets(line) {
    var opens = 0, closes = 0;
    var inStr = false, strCh = '';

    for (var i = 0; i < line.length; i++) {
        var ch = line.charAt(i);

        if (inStr) {
            if (ch === strCh && line.charAt(i - 1) !== '\\') inStr = false;
            continue;
        }
        if (ch === '"' || ch === "'") { inStr = true; strCh = ch; continue; }
        if (ch === '/' && line.charAt(i + 1) === '/') break;

        if (ch === '{') opens++;
        if (ch === '}') closes++;
    }
    return { opens: opens, closes: closes };
}

/**
 * 简易 JS 代码格式化
 */
function formatScript(code) {
    if (!code || code.trim() === '') return code;

    var lines = code.split('\n');
    var result = [];
    var indent = 0;
    var tab = '    ';

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i].trim();
        if (line === '') { result.push(''); continue; }

        var br = countBrackets(line);
        var startsWithClose = /^[}\]\)]/.test(line);

        // 行首是闭括号，先减缩进
        if (startsWithClose) {
            indent = Math.max(0, indent - 1);
        }

        var prefix = '';
        for (var j = 0; j < indent; j++) prefix += tab;
        result.push(prefix + line);

        // 净增的开括号影响下一行缩进（行首闭括号已处理，补回）
        var net = br.opens - br.closes + (startsWithClose ? 1 : 0);
        indent = Math.max(0, indent + net);
    }

    return result.join('\n');
}

/**
 * 获取全部代码片段（扁平列表，用于搜索）
 */
function getAllSnippets() {
    var all = [];
    for (var i = 0; i < snippets.length; i++) {
        var cat = snippets[i];
        for (var j = 0; j < cat.items.length; j++) {
            all.push({
                category: cat.category,
                name: cat.items[j].name,
                code: cat.items[j].code
            });
        }
    }
    return all;
}

module.exports = {
    snippets: snippets,
    formatScript: formatScript,
    getAllSnippets: getAllSnippets
};
