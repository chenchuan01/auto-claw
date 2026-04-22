# 返回按钮修复说明

## 问题描述

在以下场景中，点击返回按钮会报"任务不存在"的错误：
1. 任务详情 → AI 编辑脚本 → 返回
2. 任务详情 → 任务日志 → 返回

## 问题原因

返回按钮尝试通过 `mgr.showTaskDetail(taskId)` 返回到特定任务，但：
1. `taskId` 可能丢失或无效
2. 不必要地重新加载页面
3. 增加了复杂度和出错可能

## 修复方案

使用 `activity.back()` 直接返回上一页，而不是尝试重新加载特定任务。

## 修复的文件

### 1. ai_chat/layoutBuilder.js

**修复前**：
```javascript
ui.btn_back.on('click', function() {
    mgr.showTaskDetail(self.currentTaskId);
});
```

**修复后**：
```javascript
ui.btn_back.on('click', function() {
    // 直接返回上一页，不需要指定任务ID
    activity.back();
});
```

### 2. ui_task_logs.js

**修复前**：
```javascript
ui.btn_back.on('click', function() {
    mgr.showTaskDetail(self.taskId);
});
```

**修复后**：
```javascript
ui.btn_back.on('click', function() {
    // 直接返回上一页
    activity.back();
});
```

### 3. script_editor/main.js

**修复前**：
```javascript
UIScriptEditor.prototype.confirmExit = function() {
    // ...
    if (confirmed) {
        mgr.showTaskDetail(self.currentTaskId);
    }
    // ...
    mgr.showTaskDetail(self.currentTaskId);
};
```

**修复后**：
```javascript
UIScriptEditor.prototype.confirmExit = function() {
    // ...
    if (confirmed) {
        // 直接返回上一页
        activity.back();
    }
    // ...
    // 直接返回上一页
    activity.back();
};
```

### 4. ui_manager.js

**修复前**：
```javascript
UIManager.prototype.startAIEditWithScript = function(script, taskName) {
    this.aiChat.showWithScript(script, taskName);
};
```

**修复后**：
```javascript
UIManager.prototype.startAIEditWithScript = function(script, taskName, taskId) {
    this.aiChat.showWithScript(script, taskName, taskId);
};
```

## 优势

1. **简单可靠**：直接使用 Android 的返回栈机制
2. **无需 taskId**：不依赖可能丢失的任务 ID
3. **性能更好**：不需要重新加载页面
4. **用户体验**：符合 Android 标准返回行为

## 测试场景

### 场景 1：AI 编辑脚本返回
1. 进入任务详情
2. 点击"AI 编辑"按钮
3. 点击返回按钮
4. ✓ 应该返回到任务详情页面，不报错

### 场景 2：任务日志返回
1. 进入任务详情
2. 点击"查看日志"按钮
3. 点击返回按钮
4. ✓ 应该返回到任务详情页面，不报错

### 场景 3：脚本编辑器返回
1. 进入任务详情
2. 点击"编辑"按钮
3. 修改脚本
4. 点击返回按钮
5. ✓ 应该提示保存，确认后返回任务详情

## 注意事项

- 保留了脚本编辑器的"未保存提示"功能
- 其他页面的返回逻辑保持不变（如主页返回到主视图）
- 使用 `activity.back()` 是 Android 标准做法
