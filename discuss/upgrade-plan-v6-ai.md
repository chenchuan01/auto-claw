# AutoClaw 升级计划：AutoX.js v6+ 支持 + AI 大模型脚本生成

## 📋 项目概述

**目标：** 将 AutoClaw 项目升级到 AutoX.js v6+ 版本，并集成 AI 大模型脚本生成功能

**当前版本：** v1.0.0 (基于 AutoX.js v7 Rhino API)
**目标版本：** v2.0.0 (AutoX.js v6+ + AI 功能)

---

## 🎯 升级目标

### 1. AutoX.js v6+ 兼容性升级
- 适配 AutoX.js v6+ 的 API 变化
- 确保向后兼容性
- 优化性能和稳定性

### 2. AI 大模型脚本生成功能
- 集成 AI 大模型 API（支持多种模型）
- 自然语言转脚本功能
- 智能代码补全和优化建议
- 脚本模板库和示例生成

---

## 📊 当前项目分析

### 使用的核心 API

**当前使用的模块：**
- `ui` - 用户界面
- `dialogs` - 对话框
- `storages` - 本地存储
- `threads` - 多线程
- `globals` (toast) - 全局函数
- `files` - 文件操作
- `engines` - 脚本引擎

**项目结构：**
```
AutoClaw/
├── main.js                          # 主入口（93 行）
├── modules/
│   ├── config.js                    # 配置模块（67 行）
│   ├── data_manager.js              # 数据管理（~200 行）
│   ├── task_executor.js             # 任务执行器（271 行）
│   ├── market_service.js            # 市场服务（~400 行）
│   └── ui_manager_complete.js       # UI 管理器（~600 行）
├── market/                          # 任务市场数据
├── scripts/                         # 脚本目录
└── tasks/                           # 任务目录
```

---

## 🔄 AutoX.js v6+ API 变化分析

### 主要变化点

#### 1. 模块导入方式
**v7 (当前):**
```javascript
const ui = require('ui');
const dialogs = require('dialogs');
```

**v6+ (目标):**
```javascript
// 保持兼容，但推荐使用新的导入方式
"auto";
auto.waitFor();
```

#### 2. UI 模块变化
- XML 布局语法基本保持一致
- 事件绑定方式略有调整
- 需要测试所有 UI 组件的兼容性

#### 3. 线程模块变化
- `threads.start()` 在 v6+ 中需要特别注意作用域
- 建议使用 `engines.execScript()` 替代部分场景

#### 4. 存储模块
- `storages` API 保持稳定
- 无需大幅修改

---

## 🚀 升级实施计划

### 阶段一：兼容性升级（预计 2-3 天）

#### 任务 1.1：创建兼容层
**文件：** `modules/compat.js`

```javascript
/**
 * AutoX.js 版本兼容层
 * 统一 v6+ 和 v7 的 API 差异
 */

// 检测 AutoX.js 版本
function detectVersion() {
    try {
        // v6+ 特征检测
        if (typeof auto !== 'undefined' && auto.waitFor) {
            return 'v6+';
        }
        // v7 特征检测
        return 'v7';
    } catch (e) {
        return 'unknown';
    }
}

// 统一的线程执行
function executeInThread(script, callback) {
    const version = detectVersion();

    if (version === 'v6+') {
        // v6+ 使用 engines
        const engine = engines.execScript('thread', script);
        if (callback) {
            engine.on('exit', callback);
        }
        return engine;
    } else {
        // v7 使用 threads
        const thread = threads.start(() => {
            eval(script);
        });
        if (callback) {
            thread.waitFor();
            callback();
        }
        return thread;
    }
}

module.exports = {
    detectVersion,
    executeInThread,
    version: detectVersion()
};
```

#### 任务 1.2：更新 TaskExecutor
**修改文件：** `modules/task_executor.js`

- 使用兼容层的 `executeInThread`
- 添加版本检测逻辑
- 优化错误处理

#### 任务 1.3：测试所有模块
- 在 AutoX.js v6+ 环境中测试
- 记录所有不兼容的 API
- 逐一修复兼容性问题

---

### 阶段二：AI 脚本生成功能（预计 5-7 天）

#### 任务 2.1：AI 服务模块设计
**新建文件：** `modules/ai_service.js`

```javascript
/**
 * AI 脚本生成服务
 * 支持多种 AI 模型
 */

const http = require('http');
const Config = require('./config');

class AIService {
    constructor() {
        this.apiKey = Config.ai.apiKey;
        this.baseUrl = Config.ai.baseUrl;
        this.model = Config.ai.model;
        this.maxTokens = Config.ai.maxTokens || 2000;
    }

    /**
     * 根据自然语言描述生成脚本
     * @param {string} description - 任务描述
     * @param {object} options - 生成选项
     * @returns {Promise<object>} 生成结果
     */
    async generateScript(description, options = {}) {
        const prompt = this.buildPrompt(description, options);

        try {
            const response = await this.callAI(prompt);
            return {
                success: true,
                script: this.extractScript(response),
                explanation: this.extractExplanation(response),
                suggestions: this.extractSuggestions(response)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 优化现有脚本
     * @param {string} script - 原始脚本
     * @returns {Promise<object>} 优化结果
     */
    async optimizeScript(script) {
        const prompt = `请优化以下 AutoX.js 脚本，提高性能和可读性：\n\n${script}`;

        try {
            const response = await this.callAI(prompt);
            return {
                success: true,
                optimizedScript: this.extractScript(response),
                improvements: this.extractImprovements(response)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 脚本错误诊断
     * @param {string} script - 脚本代码
     * @param {string} error - 错误信息
     * @returns {Promise<object>} 诊断结果
     */
    async diagnoseError(script, error) {
        const prompt = `以下 AutoX.js 脚本出现错误，请诊断并提供修复建议：\n\n脚本：\n${script}\n\n错误：\n${error}`;

        try {
            const response = await this.callAI(prompt);
            return {
                success: true,
                diagnosis: this.extractDiagnosis(response),
                fixedScript: this.extractScript(response),
                explanation: this.extractExplanation(response)
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 构建 AI 提示词
     */
    buildPrompt(description, options) {
        const systemPrompt = `你是一个 AutoX.js 脚本生成专家。请根据用户的需求描述，生成可执行的 AutoX.js 脚本。

要求：
1. 生成的脚本必须符合 AutoX.js v6+ 语法
2. 包含必要的错误处理
3. 添加清晰的注释
4. 使用最佳实践
5. 确保脚本安全可靠

AutoX.js 常用 API：
- app.launchApp(name) - 启动应用
- click(x, y) - 点击坐标
- text(str).findOne() - 查找文本控件
- id(str).findOne() - 查找 ID 控件
- sleep(ms) - 延迟
- toast(msg) - 显示提示
- console.log(msg) - 输出日志

请按以下格式输出：

### 脚本代码
\`\`\`javascript
// 生成的脚本代码
\`\`\`

### 功能说明
简要说明脚本的功能和使用方法

### 注意事项
列出使用脚本时需要注意的事项
`;

        const userPrompt = `请生成一个 AutoX.js 脚本，实现以下功能：\n\n${description}`;

        return {
            system: systemPrompt,
            user: userPrompt,
            options: options
        };
    }

    /**
     * 调用 AI API
     */
    async callAI(prompt) {
        const requestBody = {
            model: this.model,
            messages: [
                { role: 'system', content: prompt.system },
                { role: 'user', content: prompt.user }
            ],
            max_tokens: this.maxTokens,
            temperature: 0.7
        };

        const response = http.postJson(this.baseUrl, requestBody, {
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        if (response.statusCode !== 200) {
            throw new Error(`AI API 请求失败: ${response.statusMessage}`);
        }

        return response.body.json();
    }

    /**
     * 从 AI 响应中提取脚本代码
     */
    extractScript(response) {
        const content = response.choices[0].message.content;
        const codeMatch = content.match(/```javascript\n([\s\S]*?)\n```/);
        return codeMatch ? codeMatch[1].trim() : content;
    }

    /**
     * 提取功能说明
     */
    extractExplanation(response) {
        const content = response.choices[0].message.content;
        const explMatch = content.match(/### 功能说明\n([\s\S]*?)(?=###|$)/);
        return explMatch ? explMatch[1].trim() : '';
    }

    /**
     * 提取建议
     */
    extractSuggestions(response) {
        const content = response.choices[0].message.content;
        const suggMatch = content.match(/### 注意事项\n([\s\S]*?)(?=###|$)/);
        return suggMatch ? suggMatch[1].trim() : '';
    }

    /**
     * 提取改进说明
     */
    extractImprovements(response) {
        const content = response.choices[0].message.content;
        const impMatch = content.match(/### 改进说明\n([\s\S]*?)(?=###|$)/);
        return impMatch ? impMatch[1].trim() : '';
    }

    /**
     * 提取诊断结果
     */
    extractDiagnosis(response) {
        const content = response.choices[0].message.content;
        const diagMatch = content.match(/### 错误诊断\n([\s\S]*?)(?=###|$)/);
        return diagMatch ? diagMatch[1].trim() : '';
    }
}

module.exports = AIService;
```

#### 任务 2.2：更新配置模块
**修改文件：** `modules/config.js`

添加 AI 配置：

```javascript
// AI 配置
ai: {
    // 支持多种 AI 模型
    providers: {
        openai: {
            name: 'OpenAI',
            baseUrl: 'https://api.openai.com/v1/chat/completions',
            models: ['gpt-4', 'gpt-3.5-turbo']
        },
        claude: {
            name: 'Claude',
            baseUrl: 'https://api.anthropic.com/v1/messages',
            models: ['claude-3-opus', 'claude-3-sonnet']
        },
        deepseek: {
            name: 'DeepSeek',
            baseUrl: 'https://api.deepseek.com/v1/chat/completions',
            models: ['deepseek-chat', 'deepseek-coder']
        },
        local: {
            name: '本地模型',
            baseUrl: 'http://localhost:11434/api/generate',
            models: ['qwen', 'llama3']
        }
    },

    // 默认配置
    defaultProvider: 'deepseek',
    defaultModel: 'deepseek-coder',
    apiKey: '', // 用户需要配置
    maxTokens: 2000,
    temperature: 0.7,

    // 提示词模板
    templates: {
        generate: '生成脚本',
        optimize: '优化脚本',
        diagnose: '诊断错误',
        explain: '解释代码'
    }
},
```

#### 任务 2.3：AI 脚本编辑器界面
**修改文件：** `modules/ui_manager_complete.js`

添加 AI 辅助编辑器：

```javascript
/**
 * 显示 AI 脚本编辑器
 */
showAIScriptEditor(taskId = null) {
    const task = taskId ? this.dataManager.getTaskById(taskId) : null;

    ui.layout(`
        <vertical>
            <!-- 标题栏 -->
            <horizontal bg="${Config.colors.primary}" padding="16">
                <button id="btn_back" text="返回" textColor="white"/>
                <text text="AI 脚本编辑器" textSize="20sp" textColor="white" layout_weight="1" gravity="center"/>
                <button id="btn_save" text="保存" textColor="white"/>
            </horizontal>

            <scroll>
                <vertical padding="16">
                    <!-- 任务信息 -->
                    <card w="*" h="auto" elevation="2" marginBottom="16">
                        <vertical padding="16">
                            <text text="任务信息" textSize="16sp" textColor="${Config.colors.textPrimary}" marginBottom="8"/>
                            <input id="input_name" hint="任务名称" text="${task?.name || ''}" textSize="16sp"/>
                            <input id="input_desc" hint="任务描述" text="${task?.description || ''}" textSize="14sp" marginTop="8"/>
                        </vertical>
                    </card>

                    <!-- AI 生成区域 -->
                    <card w="*" h="auto" elevation="2" marginBottom="16">
                        <vertical padding="16">
                            <horizontal>
                                <text text="🤖 AI 助手" textSize="16sp" textColor="${Config.colors.textPrimary}" layout_weight="1"/>
                                <button id="btn_ai_settings" text="设置" style="Widget.AppCompat.Button.Borderless"/>
                            </horizontal>

                            <input id="input_ai_prompt" hint="描述你想要实现的功能..." textSize="14sp" marginTop="8" minLines="3"/>

                            <horizontal marginTop="8">
                                <button id="btn_generate" text="🎯 生成脚本" layout_weight="1" marginRight="4"/>
                                <button id="btn_optimize" text="⚡ 优化脚本" layout_weight="1" marginLeft="4"/>
                            </horizontal>

                            <horizontal marginTop="8">
                                <button id="btn_diagnose" text="🔍 诊断错误" layout_weight="1" marginRight="4"/>
                                <button id="btn_explain" text="📖 解释代码" layout_weight="1" marginLeft="4"/>
                            </horizontal>
                        </vertical>
                    </card>

                    <!-- 脚本编辑区 -->
                    <card w="*" h="auto" elevation="2" marginBottom="16">
                        <vertical padding="16">
                            <text text="脚本代码" textSize="16sp" textColor="${Config.colors.textPrimary}" marginBottom="8"/>
                            <input id="input_script" hint="在这里编写或粘贴脚本..." text="${task?.script || Config.defaultScript}" textSize="12sp" minLines="15" typeface="monospace"/>

                            <horizontal marginTop="8">
                                <button id="btn_validate" text="验证语法" layout_weight="1" marginRight="4"/>
                                <button id="btn_test" text="测试运行" layout_weight="1" marginLeft="4"/>
                            </horizontal>
                        </vertical>
                    </card>

                    <!-- AI 建议区 -->
                    <card id="card_suggestions" w="*" h="auto" elevation="2" visibility="gone">
                        <vertical padding="16">
                            <text text="💡 AI 建议" textSize="16sp" textColor="${Config.colors.textPrimary}" marginBottom="8"/>
                            <text id="text_suggestions" textSize="14sp" textColor="${Config.colors.textSecondary}"/>
                        </vertical>
                    </card>
                </vertical>
            </scroll>
        </vertical>
    `);

    this.bindAIEditorEvents(taskId);
}

/**
 * 绑定 AI 编辑器事件
 */
bindAIEditorEvents(taskId) {
    const aiService = new (require('./ai_service'))();

    // 生成脚本
    ui.btn_generate.on('click', async () => {
        const prompt = ui.input_ai_prompt.text();
        if (!prompt) {
            toast('请输入功能描述');
            return;
        }

        toast('AI 正在生成脚本...');
        const result = await aiService.generateScript(prompt);

        if (result.success) {
            ui.input_script.setText(result.script);
            if (result.suggestions) {
                ui.card_suggestions.visibility = 'visible';
                ui.text_suggestions.text = result.suggestions;
            }
            toast('脚本生成成功');
        } else {
            dialogs.alert('生成失败', result.error);
        }
    });

    // 优化脚本
    ui.btn_optimize.on('click', async () => {
        const script = ui.input_script.text();
        if (!script) {
            toast('请先输入脚本');
            return;
        }

        toast('AI 正在优化脚本...');
        const result = await aiService.optimizeScript(script);

        if (result.success) {
            ui.input_script.setText(result.optimizedScript);
            if (result.improvements) {
                ui.card_suggestions.visibility = 'visible';
                ui.text_suggestions.text = result.improvements;
            }
            toast('脚本优化成功');
        } else {
            dialogs.alert('优化失败', result.error);
        }
    });

    // 其他事件...
}
```

#### 任务 2.4：AI 设置界面
**新增功能：** AI 模型配置界面

- 选择 AI 提供商
- 配置 API Key
- 选择模型
- 调整参数（temperature, max_tokens）

#### 任务 2.5：脚本模板库
**新建文件：** `modules/template_library.js`

```javascript
/**
 * 脚本模板库
 * 提供常用的脚本模板
 */

const templates = {
    // 基础模板
    basic: {
        name: '基础模板',
        description: '最简单的脚本模板',
        category: '基础',
        script: `"auto";
auto.waitFor();

console.log("脚本开始执行");
toast("Hello AutoX!");

// 在这里编写你的代码

console.log("脚本执行完成");`
    },

    // 应用启动模板
    launchApp: {
        name: '启动应用',
        description: '启动指定应用并等待加载',
        category: '应用操作',
        script: `"auto";
auto.waitFor();

// 启动应用
app.launchApp("微信");
sleep(3000);

// 等待应用完全加载
waitForPackage("com.tencent.mm", 10000);

toast("应用已启动");`
    },

    // 控件点击模板
    clickWidget: {
        name: '控件点击',
        description: '查找并点击指定控件',
        category: '控件操作',
        script: `"auto";
auto.waitFor();

// 查找控件
var widget = text("确定").findOne(5000);

if (widget) {
    // 点击控件
    widget.click();
    toast("点击成功");
} else {
    toast("未找到控件");
}`
    },

    // 更多模板...
};

module.exports = {
    templates,

    getTemplatesByCategory(category) {
        return Object.values(templates).filter(t => t.category === category);
    },

    getTemplate(key) {
        return templates[key];
    },

    getAllCategories() {
        return [...new Set(Object.values(templates).map(t => t.category))];
    }
};
```

---

### 阶段三：测试与优化（预计 2-3 天）

#### 任务 3.1：单元测试
- 测试所有模块的兼容性
- 测试 AI 功能的准确性
- 测试错误处理机制

#### 任务 3.2：集成测试
- 完整流程测试
- 性能测试
- 稳定性测试

#### 任务 3.3：用户体验优化
- 优化 UI 交互
- 添加加载动画
- 优化错误提示

---

## 📝 实施时间表

| 阶段 | 任务 | 预计时间 | 负责人 |
|------|------|----------|--------|
| 阶段一 | 兼容性升级 | 2-3 天 | 开发团队 |
| 阶段二 | AI 功能开发 | 5-7 天 | 开发团队 |
| 阶段三 | 测试与优化 | 2-3 天 | 测试团队 |
| **总计** | | **9-13 天** | |

---

## 🎯 成功标准

### 功能完整性
- ✅ 完全兼容 AutoX.js v6+
- ✅ AI 脚本生成功能正常工作
- ✅ 所有原有功能保持正常
- ✅ 新增 AI 辅助功能可用

### 性能指标
- ✅ 应用启动时间 < 2 秒
- ✅ AI 脚本生成响应时间 < 10 秒
- ✅ 脚本执行稳定性 > 95%

### 用户体验
- ✅ 界面流畅无卡顿
- ✅ 错误提示清晰明确
- ✅ AI 生成的脚本可用性 > 80%

---

## 🔧 技术栈

### 核心技术
- AutoX.js v6+
- JavaScript ES6+
- Android UI XML

### AI 集成
- OpenAI API
- Claude API
- DeepSeek API
- 本地 Ollama 支持

### 开发工具
- VS Code
- AutoX.js IDE
- Git

---

## 📚 文档更新

### 需要更新的文档
1. README.md - 添加 AI 功能说明
2. INSTALL.md - 更新安装步骤
3. API.md - 新增 AI API 文档
4. CHANGELOG.md - 记录版本变更

### 新增文档
1. AI_GUIDE.md - AI 功能使用指南
2. MIGRATION.md - v1 到 v2 迁移指南
3. TEMPLATE_GUIDE.md - 脚本模板使用指南

---

## ⚠️ 风险与挑战

### 技术风险
1. **API 兼容性问题**
   - 风险：部分 API 在 v6+ 中可能不可用
   - 应对：创建兼容层，提供降级方案

2. **AI 响应质量**
   - 风险：AI 生成的脚本可能不准确
   - 应对：添加脚本验证机制，提供人工修正

3. **网络依赖**
   - 风险：AI 功能依赖网络连接
   - 应对：提供离线模板库，支持本地模型

### 业务风险
1. **用户学习成本**
   - 风险：新功能可能增加学习难度
   - 应对：提供详细教程和示例

2. **API 成本**
   - 风险：AI API 调用可能产生费用
   - 应对：支持多种免费/低成本方案

---

## 💡 后续规划

### v2.1 版本
- 脚本市场 AI 推荐
- 智能脚本调试
- 代码片段管理

### v2.2 版本
- 可视化脚本编辑器
- 脚本录制功能
- 团队协作功能

### v3.0 版本
- 云端脚本同步
- 多设备管理
- 企业版功能

---

## 📞 联系方式

**项目负责人：** AutoX Task Manager Team
**技术支持：** GitHub Issues
**文档地址：** /docs

---

**文档版本：** v1.0
**创建日期：** 2026-03-17
**最后更新：** 2026-03-17
