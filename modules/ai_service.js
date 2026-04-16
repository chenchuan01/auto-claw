/**
 * AI 服务模块
 * 支持 OpenAI 和 Anthropic 两种消息格式
 */

var AIConfig = require('./ai_config');

function AIService() {
    this.aiConfig = new AIConfig();
    this.systemPrompt = this.loadSystemPrompt();
}

/**
 * 加载 AutoX.js 开发助手系统提示词
 */
AIService.prototype.loadSystemPrompt = function() {
    return '你是 AutoX.js 开发助手，专门帮助用户通过对话逐步生成 AutoX.js v6 自动化脚本。\n\n' +
        '## 核心目标\n' +
        '通过多轮对话，step by step 引导用户明确需求，最终生成完整可用的自动化脚本。\n' +
        '- 第一步：了解用户想要自动化的任务（如：自动签到、批量操作等）\n' +
        '- 第二步：询问具体细节（目标应用、操作步骤、触发条件等）\n' +
        '- 第三步：生成初步脚本代码\n' +
        '- 第四步：根据用户反馈优化和调整脚本\n' +
        '- 最终：提供完整的、可直接运行的脚本代码\n\n' +
        '## 重要语法约束\n' +
        '- AutoX.js v6 使用 ES5 语法（Rhino 引擎）\n' +
        '- ❌ 不支持：箭头函数、let/const、模板字符串、解构、class、async/await、Promise\n' +
        '- ✅ 只能使用：var 声明变量、function 关键字、传统字符串拼接\n\n' +
        '## 核心 API 模块\n' +
        '1. app - 应用管理（启动应用、获取包名）\n' +
        '2. console - 控制台日志\n' +
        '3. device - 设备信息（屏幕尺寸、电量等）\n' +
        '4. dialogs - 对话框（alert、confirm、input）\n' +
        '5. files - 文件操作\n' +
        '6. globals - 全局函数（sleep、toast、剪贴板）\n' +
        '7. http - 网络请求\n' +
        '8. coordinatesBasedAutomation - 坐标操作（click、swipe、gesture）\n' +
        '9. widgetsBasedAutomation - 控件操作（text().findOne()、id()、className()）\n' +
        '10. keys - 按键模拟（返回键、Home键）\n' +
        '11. timers - 定时器\n' +
        '12. storages - 本地存储\n' +
        '13. ui - 用户界面\n\n' +
        '## 脚本最佳实践\n' +
        '1. 脚本开头必须添加：\n' +
        '   "auto";\n' +
        '   auto.waitFor();\n' +
        '2. 使用超时机制：text("按钮").findOne(5000)\n' +
        '3. 添加延迟：sleep(1000)\n' +
        '4. 错误处理：try-catch 包裹关键操作\n' +
        '5. 检查控件存在性：if (widget) { widget.click(); }\n' +
        '6. 添加日志：console.log()、toast()\n\n' +
        '## 代码输出格式\n' +
        '当生成脚本代码时，请使用 Markdown 代码块格式：\n' +
        '```javascript\n' +
        '// 你的代码\n' +
        '```\n\n' +
        '## 对话风格\n' +
        '- 友好、耐心，逐步引导\n' +
        '- 主动询问不明确的细节\n' +
        '- 提供代码时附带简要说明\n' +
        '- 鼓励用户测试并反馈结果\n\n' +
        '现在，请开始与用户对话，帮助他们生成自动化脚本！';
};

/**
 * 发送消息到 AI
 * @param {Array} messages - 消息历史
 * @param {Function} callback - 回调函数 callback(error, response)
 */
AIService.prototype.sendMessage = function(messages, callback) {
    var self = this;
    var config = this.aiConfig.getConfig();

    if (!config.apiUrl || !config.apiKey) {
        callback('请先配置 AI 设置', null);
        return;
    }

    var requestData;
    var endpoint = config.apiUrl;

    if (config.messageFormat === 'openai') {
        // OpenAI 格式
        requestData = {
            model: config.model,
            messages: [
                { role: 'system', content: self.systemPrompt }
            ].concat(messages),
            temperature: 0.7
        };

        // 确保 endpoint 以 /chat/completions 结尾
        if (!endpoint.endsWith('/chat/completions')) {
            if (endpoint.endsWith('/')) {
                endpoint += 'chat/completions';
            } else {
                endpoint += '/chat/completions';
            }
        }
    } else {
        // Anthropic 格式
        requestData = {
            model: config.model,
            max_tokens: 4096,
            system: self.systemPrompt,
            messages: messages
        };

        // 确保 endpoint 以 /messages 结尾
        if (!endpoint.endsWith('/messages')) {
            if (endpoint.endsWith('/')) {
                endpoint += 'messages';
            } else {
                endpoint += '/messages';
            }
        }
    }

    threads.start(function() {
        try {
            var headers = {
                'Content-Type': 'application/json'
            };

            if (config.messageFormat === 'openai') {
                headers['Authorization'] = 'Bearer ' + config.apiKey;
            } else {
                headers['x-api-key'] = config.apiKey;
                headers['anthropic-version'] = '2023-06-01';
            }

            var response = http.postJson(endpoint, requestData, {
                headers: headers,
                timeout: 60000
            });

            if (response.statusCode === 200) {
                var result = response.body.json();
                var content;

                if (config.messageFormat === 'openai') {
                    content = result.choices[0].message.content;
                } else {
                    content = result.content[0].text;
                }

                ui.run(function() {
                    callback(null, content);
                });
            } else {
                var errorMsg = '请求失败: ' + response.statusCode;
                try {
                    var errorBody = response.body.string();
                    errorMsg += '\n' + errorBody;
                } catch (e) {
                    // ignore
                }
                ui.run(function() {
                    callback(errorMsg, null);
                });
            }
        } catch (e) {
            ui.run(function() {
                callback('网络请求失败: ' + e.message, null);
            });
        }
    });
};

/**
 * 从消息中提取 JavaScript 代码块
 * @param {Array} messages - 消息历史
 * @return {String} 提取的代码，如果没有则返回空字符串
 */
AIService.prototype.extractCode = function(messages) {
    var allCode = [];

    for (var i = 0; i < messages.length; i++) {
        if (messages[i].role === 'assistant') {
            var content = messages[i].content;
            // 匹配 ```javascript 或 ```js 代码块
            var regex = /```(?:javascript|js)\n([\s\S]*?)```/g;
            var match;

            while ((match = regex.exec(content)) !== null) {
                allCode.push(match[1].trim());
            }
        }
    }

    // 返回最后一个代码块（通常是最新的完整版本）
    return allCode.length > 0 ? allCode[allCode.length - 1] : '';
};

module.exports = AIService;
