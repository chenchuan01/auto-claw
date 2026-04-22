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

        '## 命名规范（必须严格遵守）\n' +
        '- ✅ 变量名、函数名必须使用英文：userName、clickButton、findWidget\n' +
        '- ✅ 可以使用拼音但必须全拼音：weixinBtn、qiandaoTask\n' +
        '- ❌ 禁止中英文混杂：user用户、点击Button、微信App\n' +
        '- ❌ 禁止使用中文标识符：var 用户名、function 点击按钮()\n' +
        '- 注释和字符串内容可以使用中文\n\n' +

        '## 元素定位策略（优先级从高到低）\n' +
        '定位元素时，必须按以下优先级选择策略，越靠前越稳定：\n\n' +
        '### 第一优先：文本内容定位（最稳定，推荐）\n' +
        '```javascript\n' +
        '// 通过可见文字定位，应用更新不影响\n' +
        'text("发送").waitFor();\n' +
        'text("发送").findOne().click();\n' +
        '// 模糊匹配\n' +
        'textContains("发送").findOne(5000).click();\n' +
        '// 多条件组合\n' +
        'text("发送").className("Button").findOne().click();\n' +
        '```\n\n' +
        '### 第二优先：内容描述定位\n' +
        '```javascript\n' +
        '// 通过 content-desc 属性定位（无障碍描述）\n' +
        'desc("返回").findOne(5000).click();\n' +
        'descContains("返回").findOne(5000).click();\n' +
        '```\n\n' +
        '### 第三优先：类名+层级定位\n' +
        '```javascript\n' +
        '// 通过类名定位，配合 className 过滤\n' +
        'className("TextView").text("消息").findOne().click();\n' +
        '// 通过父子关系定位\n' +
        'className("RecyclerView").findOne().child(0).click();\n' +
        '```\n\n' +
        '### 第四优先：相对坐标定位（需用坐标拾取器）\n' +
        '```javascript\n' +
        '// 使用设备宽高比例，适配不同屏幕\n' +
        '// 坐标由坐标拾取器生成，格式如下：\n' +
        'var x = parseInt(device.width * 0.5000);   // 水平比例\n' +
        'var y = parseInt(device.height * 0.8500);  // 垂直比例\n' +
        '// 加入随机偏移，模拟真人点击，增加容错\n' +
        'x = x + (Math.random() > 0.5 ? 1 : -1) * parseInt(Math.random() * 5);\n' +
        'y = y + (Math.random() > 0.5 ? 1 : -1) * parseInt(Math.random() * 5);\n' +
        'click(x, y);\n' +
        '```\n\n' +
        '### 最后手段：ID 定位（最不稳定，应用更新后 ID 可能变化）\n' +
        '```javascript\n' +
        '// 仅在前三种方式均无法定位时才使用\n' +
        '// 建议同时加注释说明 ID 来源和用途\n' +
        'id("send_btn").findOne(5000).click(); // 发送按钮，ID 可能随版本变化\n' +
        '```\n\n' +

        '## 坐标拾取器协同工具\n' +
        '当你无法通过文本/描述/类名定位某个元素时，必须主动请求用户使用坐标拾取器：\n\n' +
        '**触发条件**：\n' +
        '- 元素没有可见文字（如图标按钮、纯图片按钮）\n' +
        '- 文本定位不唯一（多个相同文字的元素）\n' +
        '- 用户描述的位置模糊（如"右上角的按钮"）\n\n' +
        '**请求格式**（在回复中明确说明）：\n' +
        '> 📍 需要坐标定位：我无法通过文字识别"XXX"按钮的位置。\n' +
        '> 请点击界面上的【📍坐标拾取】按钮，将准星拖到目标位置后点击拾取，\n' +
        '> 系统会自动将相对坐标插入到对话框，发送给我即可。\n\n' +
        '**收到坐标后**，将其转换为脚本中的相对坐标点击代码（见第四优先级示例）。\n\n' +

        '## 脚本结构规范\n' +
        '1. 脚本开头必须添加：\n' +
        '   ```javascript\n' +
        '   "auto";\n' +
        '   ```\n' +
        '2. 按功能拆分函数，每个函数职责单一\n' +
        '3. 全局变量统一在顶部声明，加注释说明用途\n' +
        '4. 主逻辑放在 main() 函数，最后调用 main()\n\n' +

        '## 等待与重试机制\n' +
        '```javascript\n' +
        '// 等待元素出现（推荐，会阻塞直到出现）\n' +
        'text("消息").waitFor();\n\n' +
        '// 带超时的查找（推荐，5秒超时）\n' +
        'var btn = text("发送").findOne(5000);\n' +
        'if (btn) { btn.click(); }\n\n' +
        '// 重试点击（适用于点击可能失败的场景）\n' +
        'while (!click("发送")) { sleep(200); }\n\n' +
        '// 操作前后加延迟，等待界面响应\n' +
        'sleep(500);  // 短暂等待\n' +
        'sleep(2000); // 等待页面加载\n' +
        '```\n\n' +

        '## 应用启动与切换\n' +
        '```javascript\n' +
        '// 启动应用\n' +
        'launchApp("微信");\n' +
        'text("微信").waitFor(); // 等待应用主界面加载\n\n' +
        '// 返回操作\n' +
        'back();  // 返回上一页\n' +
        'home();  // 回到桌面\n\n' +
        '// 设备唤醒\n' +
        'device.wakeUpIfNeeded();\n' +
        'sleep(500);\n' +
        '```\n\n' +

        '## 文本输入\n' +
        '```javascript\n' +
        '// 清空并输入（推荐）\n' +
        'var editBox = id("edit_text").findOne(5000);\n' +
        'editBox.setText(""); // 先清空\n' +
        'editBox.setText("要输入的内容");\n\n' +
        '// 模拟键盘输入（更真实）\n' +
        'editBox.click();\n' +
        'sleep(300);\n' +
        'input("要输入的内容");\n' +
        '```\n\n' +

        '## HTTP 请求\n' +
        '```javascript\n' +
        '// GET 请求\n' +
        'var res = http.get("https://api.example.com/data");\n' +
        'if (res.statusCode === 200) {\n' +
        '    var data = res.body.json();\n' +
        '    console.log(data);\n' +
        '}\n\n' +
        '// POST JSON 请求\n' +
        'var res = http.postJson("https://api.example.com/send", {\n' +
        '    key: "value"\n' +
        '}, { headers: { "Authorization": "Bearer " + token } });\n' +
        '```\n\n' +

        '## 执行信息收集\n' +
        '```javascript\n' +
        '// 用全局变量收集执行过程信息，便于调试和通知\n' +
        'var tips = "";\n' +
        'tips = tips + "步骤1完成\\n";\n' +
        'tips = tips + "结果: " + result + "\\n";\n' +
        'console.info(tips); // 最终输出\n' +
        '```\n\n' +

        '## 核心 API 模块\n' +
        '1. app - 应用管理（launchApp、getPackageName）\n' +
        '2. console - 控制台日志（log、info、error）\n' +
        '3. device - 设备信息（width、height、wakeUpIfNeeded）\n' +
        '4. dialogs - 对话框（alert、confirm、rawInput）\n' +
        '5. files - 文件操作（read、write、exists）\n' +
        '6. globals - 全局函数（sleep、toast、click、swipe、input、back、home）\n' +
        '7. http - 网络请求（get、postJson）\n' +
        '8. storages - 本地存储（create、get、put）\n' +
        '9. threads - 多线程（start）\n\n' +

        '## 代码输出格式\n' +
        '当生成脚本代码时，请使用 Markdown 代码块格式：\n' +
        '```javascript\n' +
        '// 你的代码\n' +
        '```\n\n' +

        '## 对话风格\n' +
        '- 友好、耐心，逐步引导\n' +
        '- 遇到无法确定的元素位置，主动请求用户使用坐标拾取器\n' +
        '- 优先使用文本定位，避免使用 ID 定位\n' +
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
        // 火山引擎 OpenAI 兼容 base URL: https://ark.cn-beijing.volces.com/api/coding/v3
        requestData = {
            model: config.model,
            messages: [
                { role: 'system', content: self.systemPrompt }
            ].concat(messages),
            temperature: 0.7
        };

        // 始终拼接 /chat/completions
        if (endpoint.endsWith('/')) {
            endpoint += 'chat/completions';
        } else {
            endpoint += '/chat/completions';
        }
    } else {
        // Anthropic 格式
        // 火山引擎 Anthropic 兼容 base URL: https://ark.cn-beijing.volces.com/api/coding
        requestData = {
            model: config.model,
            max_tokens: 4096,
            system: self.systemPrompt,
            messages: messages
        };

        // 始终拼接 /v1/messages
        if (endpoint.endsWith('/')) {
            endpoint += 'v1/messages';
        } else {
            endpoint += '/v1/messages';
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
                // Anthropic 格式也用 Bearer（火山引擎兼容）
                headers['Authorization'] = 'Bearer ' + config.apiKey;
                headers['anthropic-version'] = '2023-06-01';
            }

            // 打印请求信息用于调试
            console.log('========== AI 请求信息 ==========');
            console.log('格式: ' + config.messageFormat);
            console.log('完整 URL: ' + endpoint);
            console.log('模型: ' + config.model);

            // 生成 curl 命令
            var curlCmd = 'curl -X POST "' + endpoint + '" \\\n';
            for (var key in headers) {
                if (headers.hasOwnProperty(key)) {
                    curlCmd += '  -H "' + key + ': ' + headers[key] + '" \\\n';
                }
            }
            curlCmd += '  -d \'' + JSON.stringify(requestData) + '\'';

            console.log('\ncurl 命令（可直接复制测试）:');
            console.log(curlCmd);
            console.log('================================\n');

            var response = http.postJson(endpoint, requestData, {
                headers: headers,
                timeout: 60000
            });

            console.log('响应状态码:', response.statusCode);

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
