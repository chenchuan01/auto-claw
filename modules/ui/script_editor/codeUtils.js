/**
 * 脚本编辑器 - 代码工具函数
 * 提供格式化和代码片段功能
 */

/**
 * 格式化JavaScript代码
 * 处理缩进和花括号
 */
function formatScript(code) {
    if (!code) return '';

    // 将制表符替换为2个空格
    var lines = code.replace(/\t/g, '  ').split('\n');
    var result = [];
    var indentLevel = 0;
    var indentSize = 2; // 2个空格缩进

    for (var i = 0; i < lines.length; i++) {
        var line = lines[i];

        // 去除行尾空格
        line = line.replace(/\s+$/, '');

        // 如果行以 } 开头，减少缩进级别
        var trimmedLine = line.trim();
        if (trimmedLine.charAt(0) === '}') {
            indentLevel = Math.max(0, indentLevel - 1);
        }

        // 生成缩进字符串
        var indent = '';
        for (var j = 0; j < indentLevel; j++) {
            indent += '  '; // 2个空格
        }

        // 移除前导空格，添加计算后的缩进
        var formattedLine = indent + trimmedLine;
        result.push(formattedLine);

        // 根据花括号调整下一行的缩进级别
        // 统计当前行中 { 和 } 的数量（排除行首的 }）
        var openBraces = (trimmedLine.match(/{/g) || []).length;
        var closeBraces = (trimmedLine.match(/}/g) || []).length;

        // 如果行首是 }，已经减过一次，避免重复减少
        if (trimmedLine.charAt(0) === '}') {
            closeBraces = Math.max(0, closeBraces - 1);
        }

        indentLevel += openBraces - closeBraces;
        indentLevel = Math.max(0, indentLevel);
    }

    // 重新组合，确保末尾有换行符
    var formatted = result.join('\n');
    if (formatted && !formatted.endsWith('\n')) {
        formatted += '\n';
    }
    return formatted;
}

/**
 * 获取预定义代码片段列表
 */
function getSnippets() {
    return [
        {
            name: '等待无障碍服务',
            code: '// 等待无障碍服务启动\n' +
                  'auto.waitFor();\n' +
                  'console.log("无障碍服务已启动");\n'
        },
        {
            name: '点击屏幕坐标',
            code: '// 点击屏幕坐标 (x, y)\n' +
                  'click(500, 800);\n' +
                  'sleep(500); // 等待500毫秒\n'
        },
        {
            name: '查找控件并点击',
            code: '// 查找文本为"确定"的控件并点击\n' +
                  'var btn = text("确定").findOne(5000);\n' +
                  'if (btn) {\n' +
                  '    btn.click();\n' +
                  '    toast("点击成功");\n' +
                  '} else {\n' +
                  '    toast("未找到控件");\n' +
                  '}\n'
        },
        {
            name: '循环执行',
            code: '// 循环执行10次\n' +
                  'for (var i = 0; i < 10; i++) {\n' +
                  '    console.log("第" + (i + 1) + "次执行");\n' +
                  '    // 这里添加你的代码\n' +
                  '    sleep(1000);\n' +
                  '}\n'
        },
        {
            name: '条件判断',
            code: '// 根据条件执行不同操作\n' +
                  'if (条件) {\n' +
                  '    // 条件成立时执行\n' +
                  '} else {\n' +
                  '    // 条件不成立时执行\n' +
                  '}\n'
        },
        {
            name: '截图保存',
            code: '// 请求截图权限并保存截图\n' +
                  'if (!requestScreenCapture()) {\n' +
                  '    toast("请求截图权限失败");\n' +
                  '    exit();\n' +
                  '}\n' +
                  'var img = captureScreen();\n' +
                  'var path = "/sdcard/screenshot_" + new Date().getTime() + ".png";\n' +
                  'img.saveTo(path);\n' +
                  'toast("截图已保存到: " + path);\n' +
                  'img.recycle();\n'
        },
        {
            name: '发送HTTP请求',
            code: '// 发送GET请求\n' +
                  'var response = http.get("https://api.example.com/data");\n' +
                  'if (response.statusCode === 200) {\n' +
                  '    var data = response.body.string();\n' +
                  '    console.log("响应数据:", data);\n' +
                  '} else {\n' +
                  '    console.error("请求失败:", response.statusCode);\n' +
                  '}\n'
        },
        {
            name: '读取文件',
            code: '// 读取文件内容\n' +
                  'var path = "/sdcard/data.txt";\n' +
                  'if (files.exists(path)) {\n' +
                  '    var content = files.read(path);\n' +
                  '    console.log("文件内容:", content);\n' +
                  '} else {\n' +
                  '    console.error("文件不存在");\n' +
                  '}\n'
        }
    ];
}

/**
 * 显示代码片段选择对话框
 */
function showSnippetsDialog(callback) {
    var snippets = getSnippets();
    var snippetNames = [];
    for (var i = 0; i < snippets.length; i++) {
        snippetNames.push(snippets[i].name);
    }

    dialogs.select('选择代码片段', snippetNames, function(index) {
        if (index < 0) return;
        callback(snippets[index]);
    });
}

module.exports = {
    formatScript: formatScript,
    getSnippets: getSnippets,
    showSnippetsDialog: showSnippetsDialog
};
