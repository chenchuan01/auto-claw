/**
 * UI脚本编辑器模块
 * 提供任务详情查看和脚本编辑功能
 */

var Config = require('./config');
var C = Config.colors;

function UIScriptEditor(uiManager) {
    this.uiManager = uiManager;
    this.currentTaskId = null;
    this.scriptContent = '';
}

UIScriptEditor.prototype.show = function(taskId) {
    var self = this;
    var mgr = this.uiManager;
    var task = mgr.dataManager.getTaskById(taskId);
    if (!task) {
        toast('任务不存在');
        return;
    }

    self.currentTaskId = taskId;
    self.scriptContent = task.script || Config.defaultScript;

    var statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <!-- 标题栏 -->' +
        '  <horizontal bg="' + C.card + '" padding="20 16 16 16" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="26sp" textColor="' + C.textPrimary + '" padding="4 4 12 4"/>' +
        '    <text text="任务详情与编辑" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_save" text="✓" textSize="24sp" textColor="' + C.textPrimary + '" padding="8 8 8 12"/>' +
        '  </horizontal>' +
        '  <!-- 内容区域 -->' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="20">' +
        '      <!-- 任务信息卡片 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24">' +
        '        <text text="' + task.name + '" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text text="' + (task.description || '暂无描述') + '" textSize="14sp" textColor="' + C.textSecondary + '" marginTop="8"/>' +
        '        <horizontal marginTop="18" gravity="center_vertical">' +
        '          <text text="' + statusInfo.text + '" textSize="13sp" textColor="' + statusInfo.color + '" bg="' + statusInfo.color + '22" padding="6 14" cornerRadius="20" textStyle="bold"/>' +
        '          <text text="执行 ' + (task.runCount || 0) + ' 次" textSize="13sp" textColor="' + C.textHint + '" layout_weight="1" gravity="right"/>' +
        '        </horizontal>' +
        '      </vertical>' +
'      <!-- 脚本编辑器 -->' +
'      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
'        <horizontal gravity="center_vertical" marginBottom="16">' +
        '          <text text="✎ 任务脚本" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" layout_weight="1"/>' +
        '          <text id="btn_format" text="◇ 格式化" textSize="13sp" textColor="' + C.primary + '" padding="6 12" bg="' + C.primary + '22" cornerRadius="8" marginRight="8"/>' +
        '          <text id="btn_snippets" text="☰ 片段" textSize="13sp" textColor="' + C.primary + '" padding="6 12" bg="' + C.primary + '22" cornerRadius="8" marginRight="8"/>' +
        '          <text id="btn_reset" text="↻ 重置" textSize="13sp" textColor="' + C.primary + '" padding="6 12" bg="' + C.primary + '22" cornerRadius="8"/>' +
'        </horizontal>' +
'        <input id="script_input" hint="请输入任务脚本代码..." textSize="13sp" textColor="' + C.textPrimary + '" bg="' + C.surface + '" padding="16" cornerRadius="12" minLines="15" gravity="top" singleLine="false"/>' +
'      </vertical>' +
        '      <!-- 任务信息 -->' +
        '      <vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">' +
        '        <text text="☰ 任务信息" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="16"/>' +
        '        <horizontal padding="0 8" marginTop="12">' +
        '          <text text="创建时间" textSize="14sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + mgr.formatTime(task.createTime) + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 8" marginTop="12">' +
        '          <text text="最后执行" textSize="14sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + mgr.formatTime(task.lastRunTime) + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 8" marginTop="12">' +
        '          <text text="任务来源" textSize="14sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + (task.source === 'market' ? '中心导入' : '本地创建') + '" textSize="14sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <!-- 操作按钮 -->' +
        '      <vertical marginTop="24">' +
        '        <horizontal>' +
        '          <button id="btn_run_now" text="▶ 执行任务" layout_weight="1" marginRight="8" bg="' + C.primary + '" textColor="white" textSize="15sp" cornerRadius="16" h="48" textStyle="bold"/>' +
        '          <button id="btn_logs" text="☰ 查看日志" layout_weight="1" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="15sp" cornerRadius="16" h="48"/>' +
        '        </horizontal>' +
        '        <horizontal marginTop="12">' +
        '          <button id="btn_export" text="↑ 导出脚本" layout_weight="1" marginRight="8" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="15sp" cornerRadius="16" h="48"/>' +
        '          <button id="btn_delete" text="✕ 删除任务" layout_weight="1" bg="' + C.error + '22" textColor="' + C.error + '" textSize="15sp" cornerRadius="16" h="48"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    ui.script_input.setText(self.scriptContent);

    ui.btn_back.on('click', function() {
        self.confirmExit();
    });

    ui.btn_save.on('click', function() {
        self.saveScript();
    });

    ui.btn_reset.on('click', function() {
        dialogs.confirm('重置脚本', '确定要重置为原始脚本吗？当前未保存的修改将丢失。', function(confirmed) {
            if (confirmed) {
                ui.script_input.setText(self.scriptContent);
                toast('已重置');
            }
        });
    });

    ui.btn_format.on('click', function() {
        var currentScript = ui.script_input.getText().toString();
        var formatted = self.formatScript(currentScript);
        ui.script_input.setText(formatted);
        toast('脚本已格式化');
    });

    ui.btn_snippets.on('click', function() {
        self.showSnippetsDialog();
    });

    ui.btn_run_now.on('click', function() {
        self.saveAndExecute();
    });

    ui.btn_logs.on('click', function() {
        mgr.dialogs.showTaskLogs(taskId);
    });

    ui.btn_export.on('click', function() {
        mgr.exportTaskScript(taskId);
    });

    ui.btn_delete.on('click', function() {
        mgr.dialogs.confirmDeleteTask(taskId);
    });
};

UIScriptEditor.prototype.saveScript = function() {
    var self = this;
    var mgr = this.uiManager;
    var newScript = ui.script_input.getText().toString();

    if (!newScript || newScript.trim() === '') {
        toast('脚本内容不能为空');
        return;
    }

    mgr.dataManager.updateTask(self.currentTaskId, {
        script: newScript
    });

    self.scriptContent = newScript;
    toast('脚本已保存');
};

UIScriptEditor.prototype.saveAndExecute = function() {
    var self = this;
    var mgr = this.uiManager;
    var newScript = ui.script_input.getText().toString();

    if (!newScript || newScript.trim() === '') {
        toast('脚本内容不能为空');
        return;
    }

    mgr.dataManager.updateTask(self.currentTaskId, {
        script: newScript
    });

    self.scriptContent = newScript;
    toast('脚本已保存，开始执行...');

    setTimeout(function() {
        mgr.executeTask(self.currentTaskId);
    }, 500);
};

UIScriptEditor.prototype.confirmExit = function() {
    var self = this;
    var mgr = this.uiManager;
    var currentScript = ui.script_input.getText().toString();

    if (currentScript !== self.scriptContent) {
        dialogs.confirm('退出编辑', '脚本已修改但未保存，确定要退出吗？', function(confirmed) {
            if (confirmed) {
                mgr.showMainView();
            }
        });
    } else {
        mgr.showMainView();
    }
};

UIScriptEditor.prototype.formatScript = function(code) {
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
        
        // 计算当前行的前导空格数（仅用于参考，实际使用indentLevel）
        var leadingSpaces = line.match(/^\s*/)[0].length;
        
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
};

UIScriptEditor.prototype.showSnippetsDialog = function() {
    var self = this;
    var snippets = [
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
    
    var snippetNames = [];
    for (var i = 0; i < snippets.length; i++) {
        snippetNames.push(snippets[i].name);
    }
    
    dialogs.select('选择代码片段', snippetNames, function(index) {
        if (index < 0) return;
        
        var selectedSnippet = snippets[index];
        var currentScript = ui.script_input.getText().toString();
        var cursorPos = 0;
        
        // 尝试获取光标位置（如果支持）
        try {
            cursorPos = ui.script_input.getSelectionStart();
        } catch (e) {
            cursorPos = currentScript.length;
        }
        
        // 在光标位置插入代码片段
        var newScript = currentScript.substring(0, cursorPos) +
                       selectedSnippet.code +
                       currentScript.substring(cursorPos);
        
        ui.script_input.setText(newScript);
        
        // 尝试设置光标位置到插入内容之后
        try {
            var newCursorPos = cursorPos + selectedSnippet.code.length;
            ui.script_input.setSelection(newCursorPos, newCursorPos);
        } catch (e) {
            // 忽略错误
        }
        
        toast('已插入代码片段: ' + selectedSnippet.name);
    });
};

module.exports = UIScriptEditor;
