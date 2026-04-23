/**
 * AI对话 - 脚本操作模块
 * 处理脚本预览、更新、运行、保存等功能
 */

var Config = require('../../core/config');
var I = Config.icons;

/**
 * 更新脚本预览
 */
function updateScriptPreview(self) {
    var mgr = self.uiManager;
    var code = mgr.aiService.extractCode(self.messages);

    if (code) {
        ui.script_editor.setText(code);
        ui.script_title.setText('AI 生成脚本 (' + code.split('\n').length + ' 行)');

        // 脚本有更新时，在脚本 tab 上显示提示
        ui.tab_script_text.setText(I.code + ' 脚本 ' + I.circle);
    } else {
        ui.script_editor.setText('');
        ui.script_title.setText('暂无脚本');
    }

    updateLineNumbers();
}

/**
 * 更新行号显示
 */
function updateLineNumbers() {
    var code = ui.script_editor.getText().toString();
    var lines = code ? code.split('\n').length : 1;
    var lineNumberText = '';

    for (var i = 1; i <= lines; i++) {
        lineNumberText += i + '\n';
    }

    ui.line_number_text.setText(lineNumberText.trim());
}

/**
 * 运行当前脚本
 */
function runScript(self) {
    var mgr = self.uiManager;
    var code = ui.script_editor.getText().toString().trim();

    if (!code) {
        toast('暂无可运行的脚本');
        return;
    }

    dialogs.confirm('运行脚本', '确定要运行当前脚本吗？', function(confirmed) {
        if (!confirmed) return;

        // 创建一个临时任务来记录日志
        var tempTaskId = 'temp_ai_' + Date.now();
        var tempTask = {
            id: tempTaskId,
            name: 'AI 临时运行脚本',
            description: 'AI 对话中临时运行的脚本',
            script: code,
            status: 'idle',
            createdAt: Date.now(),
            lastRunTime: null,
            runCount: 0
        };

        // 添加到数据管理器（不持久化，只在内存中）
        mgr.dataManager.addTemporaryTask(tempTask);
        self.lastTempTaskId = tempTaskId;

        // 执行任务并记录日志
        var success = mgr.taskExecutor.executeTask(tempTaskId);

        if (success) {
            // 显示查看日志按钮
            ui.post(function() {
                if (ui.btn_view_logs) {
                    ui.btn_view_logs.attr('visibility', 'visible');
                }
            });
            toast('脚本已开始运行，运行完成后可点击查看日志');
        } else {
            // 执行失败也要显示日志按钮查看错误
            ui.post(function() {
                if (ui.btn_view_logs) {
                    ui.btn_view_logs.attr('visibility', 'visible');
                }
            });
        }
    });
}

/**
 * 查看临时运行任务的日志
 */
function viewTempTaskLogs(self) {
    var mgr = self.uiManager;

    if (!self.lastTempTaskId) {
        toast('暂无日志，请先运行脚本');
        return;
    }

    // 直接跳转到日志页面
    mgr.showTaskLogs(self.lastTempTaskId);
}

/**
 * 保存为任务
 */
function saveAsTask(self) {
    var mgr = self.uiManager;
    var code = ui.script_editor.getText().toString().trim();

    if (!code) {
        toast('暂无可保存的脚本');
        return;
    }

    // 如果是从已有任务触发的AI编辑，直接更新该任务
    if (self.currentTaskId) {
        var task = mgr.dataManager.getTaskById(self.currentTaskId);
        if (task) {
            dialogs.confirm('更新任务', '确定要将AI生成的脚本保存到任务"' + task.name + '"吗？', function(confirmed) {
                if (!confirmed) {
                    toast('已取消');
                    return;
                }

                // 更新任务脚本
                mgr.dataManager.updateTask(self.currentTaskId, {
                    script: code
                });

                // 同时保存当前对话到历史对话
                if (self.messages && self.messages.length > 0) {
                    var currentScript = ui.script_editor.getText().toString();
                    mgr.dataManager.saveAIConversation({
                        messages: self.messages,
                        script: currentScript,
                        title: task.name
                    });
                }

                toast('任务已更新');

                // 询问是否查看任务
                dialogs.confirm('保存成功', '任务"' + task.name + '"已更新，是否查看任务详情？', function(confirmed) {
                    if (confirmed) {
                        mgr.showScriptEditor(self.currentTaskId);
                    }
                });
            });
            return;
        }
    }

    // 否则创建新任务
    dialogs.rawInput('任务名称', '', function(name) {
        if (!name) {
            toast('已取消');
            return;
        }

        dialogs.rawInput('任务描述（可选）', '', function(description) {
            // 创建任务
            var taskId = mgr.dataManager.addTask({
                name: name,
                description: description || 'AI 生成的自动化脚本',
                script: code,
                source: 'ai'
            });

            // 同时保存当前对话到历史对话
            if (self.messages && self.messages.length > 0) {
                var currentScript = ui.script_editor.getText().toString();
                mgr.dataManager.saveAIConversation({
                    messages: self.messages,
                    script: currentScript,
                    title: name
                });
            }

            toast('任务已保存');

            // 询问是否查看任务
            dialogs.confirm('保存成功', '任务"' + name + '"已保存，是否查看任务详情？', function(confirmed) {
                if (confirmed) {
                    mgr.showTaskDetail(taskId);
                }
            });
        });
    });
}

module.exports = {
    updateScriptPreview: updateScriptPreview,
    updateLineNumbers: updateLineNumbers,
    runScript: runScript,
    viewTempTaskLogs: viewTempTaskLogs,
    saveAsTask: saveAsTask
};
