# AI 编辑功能说明

## 功能概述

在脚本编辑器中点击"AI编辑"按钮，可以启动AI对话来优化或修改当前脚本。

## 使用流程

### 1. 进入脚本编辑器

从任务详情页面点击"编辑"按钮，进入脚本编辑器。

### 2. 点击 AI 编辑

在脚本编辑器顶部工具栏，点击"🤖 AI编辑"按钮。

### 3. 自动加载脚本

系统会：
1. 自动跳转到 AI 对话页面
2. 将当前脚本加载到脚本 tab 中
3. 默认显示脚本 tab（而不是对话 tab）
4. 在对话中添加初始提示消息

### 4. 查看和编辑

- **脚本 tab**：显示当前脚本，可以直接编辑
- **对话 tab**：与 AI 对话，获取优化建议

### 5. 保存修改

编辑完成后，点击"💾 保存任务"按钮保存修改。

## 界面说明

### AI 编辑页面布局

```
┌─────────────────────────────────┐
│ ← AI 编辑: 任务名称          + │  ← 标题栏
├─────────────────────────────────┤
│ [💬 对话]  [📝 脚本]           │  ← Tab 切换
├─────────────────────────────────┤
│                                 │
│  脚本编辑区域                   │  ← 默认显示脚本
│  (显示加载的任务脚本)           │
│                                 │
├─────────────────────────────────┤
│ [▶ 运行]  [💾 保存任务]        │  ← 操作按钮
└─────────────────────────────────┘
```

### 默认状态

- **当前 tab**：脚本 tab（高亮显示）
- **脚本内容**：已加载任务脚本
- **对话内容**：包含初始提示消息

## 初始提示消息

系统会自动在对话中添加：

```
请帮我优化/修改这个脚本：

```javascript
// 你的脚本内容
```
```

这样 AI 就知道你想要编辑的脚本内容。

## Tab 切换

### 脚本 tab（默认）

- 显示当前脚本
- 可以直接编辑
- 有行号显示
- 支持格式化、清空等操作

### 对话 tab

- 与 AI 对话
- 查看 AI 的建议
- 可以继续提问

## 操作按钮

| 按钮 | 功能 | 说明 |
|------|------|------|
| 🎯 拾取坐标 | 拾取屏幕坐标 | 在脚本中插入坐标 |
| 格式化 | 格式化代码 | 美化代码格式 |
| 清空 | 清空脚本 | 清空编辑器内容 |
| ▶ 运行 | 运行脚本 | 测试脚本效果 |
| 💾 保存任务 | 保存修改 | 保存到任务 |

## 使用场景

### 场景 1：优化现有脚本

1. 打开任务详情 → 编辑
2. 点击"AI编辑"
3. 在对话 tab 中询问："如何优化这个脚本的性能？"
4. AI 给出建议
5. 在脚本 tab 中应用修改
6. 保存任务

### 场景 2：修复脚本错误

1. 脚本运行出错
2. 打开编辑器 → AI编辑
3. 在对话中描述错误
4. AI 分析并给出修复方案
5. 在脚本 tab 中修改
6. 运行测试
7. 保存任务

### 场景 3：添加新功能

1. 打开编辑器 → AI编辑
2. 在对话中说："帮我添加错误处理"
3. AI 给出代码建议
4. 在脚本 tab 中添加代码
5. 保存任务

## 技术实现

### 启动流程

```javascript
// 1. 脚本编辑器点击 AI 编辑
ui.btn_ai_edit.on('click', function() {
    var currentScript = ui.script_input.getText().toString();
    mgr.startAIEditWithScript(currentScript, task.name, taskId);
});

// 2. UIManager 启动 AI 编辑
UIManager.prototype.startAIEditWithScript = function(script, taskName, taskId) {
    this.currentView = 'ai_chat';
    this.aiChat.showWithScript(script, taskName, taskId);
};

// 3. UIAIChat 显示编辑界面
UIAIChat.prototype.showWithScript = function(script, taskName, taskId) {
    // 设置当前 tab 为脚本
    this.currentTab = 'script';
    
    // 构建布局
    layoutBuilder.buildLayoutWithEdit(taskName);
    
    // 加载脚本
    ui.script_editor.setText(script);
    
    // 切换到脚本 tab
    ui.view_script.attr('visibility', 'visible');
    ui.view_chat.attr('visibility', 'gone');
};
```

### 关键代码

**加载脚本**：
```javascript
ui.script_editor.setText(script);
scriptOperations.updateScriptPreview(this);
scriptOperations.updateLineNumbers();
```

**切换 tab**：
```javascript
ui.post(function() {
    ui.view_chat.attr('visibility', 'gone');
    ui.view_script.attr('visibility', 'visible');
    ui.tab_script.attr('bg', C.primary + '22');
    ui.tab_script_text.attr('textColor', C.primary);
    ui.tab_script_text.attr('textStyle', 'bold');
});
```

## 注意事项

1. **脚本保存**：修改后记得点击"保存任务"
2. **运行测试**：保存前建议先运行测试
3. **对话历史**：切换 tab 不会丢失对话内容
4. **返回操作**：点击返回会回到脚本编辑器

## 优势

1. **无缝集成**：从编辑器直接启动 AI 编辑
2. **脚本预加载**：自动加载当前脚本，无需手动复制
3. **双 tab 设计**：可以边看 AI 建议边编辑脚本
4. **默认显示脚本**：启动后直接看到脚本内容
5. **保持上下文**：AI 知道你要编辑的脚本内容

## 常见问题

### Q: 为什么默认显示脚本 tab？

A: 因为用户点击"AI编辑"时，主要目的是编辑脚本。默认显示脚本 tab 可以让用户立即看到加载的脚本内容，确认是否正确。

### Q: 如何查看 AI 的建议？

A: 点击"对话" tab 切换到对话视图，可以看到 AI 的回复和建议。

### Q: 脚本修改后如何保存？

A: 点击底部的"💾 保存任务"按钮，脚本会保存到当前任务。

### Q: 可以运行测试吗？

A: 可以，点击"▶ 运行"按钮可以运行当前脚本进行测试。

### Q: 返回后脚本会丢失吗？

A: 如果没有保存，返回后修改会丢失。建议先保存再返回。
