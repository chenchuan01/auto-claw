# 返回按钮行为说明

## 所有返回按钮统一使用 activity.back()

为了简化逻辑和避免错误，所有详情页面的返回按钮都使用 `activity.back()` 直接返回上一页。

## 已修复的页面

### 1. AI 编辑脚本页面
**文件**：`modules/ui/ai_chat/layoutBuilder.js`

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

### 2. 任务日志页面
**文件**：`modules/ui/ui_task_logs.js`

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

### 3. 脚本编辑器
**文件**：`modules/ui/script_editor/main.js`

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

## 返回流程

### 场景 1：任务详情 → 查看日志 → 返回
```
主页 → 任务详情 → 查看日志 → [返回] → 任务详情
```

**实现**：
1. 主页点击任务 → `mgr.showTaskDetail(taskId)`
2. 任务详情点击"查看日志" → `mgr.showTaskLogs(taskId)`
3. 日志页面点击返回 → `activity.back()` → 自动返回任务详情

### 场景 2：任务详情 → AI 编辑 → 返回
```
主页 → 任务详情 → AI 编辑 → [返回] → 任务详情
```

**实现**：
1. 主页点击任务 → `mgr.showTaskDetail(taskId)`
2. 任务详情点击"AI 编辑" → `mgr.startAIEditWithScript(...)`
3. AI 编辑点击返回 → `activity.back()` → 自动返回任务详情

### 场景 3：任务详情 → 脚本编辑 → 返回
```
主页 → 任务详情 → 脚本编辑 → [返回] → 任务详情
```

**实现**：
1. 主页点击任务 → `mgr.showTaskDetail(taskId)`
2. 任务详情点击"编辑" → `mgr.showScriptEditor(taskId)`
3. 脚本编辑点击返回 → `activity.back()` → 自动返回任务详情

## 优势

### 1. 简单可靠
- 使用 Android 原生的返回栈机制
- 不需要手动管理页面跳转
- 不会出现"任务不存在"的错误

### 2. 符合用户习惯
- 与 Android 系统返回键行为一致
- 用户体验更自然
- 支持手势返回

### 3. 易于维护
- 不需要传递和保存 taskId
- 减少状态管理的复杂度
- 代码更简洁

## 注意事项

### 1. 保留特殊逻辑
某些页面的返回需要特殊处理，保持原有逻辑：

**脚本编辑器**：
- 检查是否有未保存的修改
- 提示用户确认后再返回
- 使用 `confirmExit()` 方法

**AI 对话**：
- 可能需要清理资源
- 停止正在进行的请求
- 保存对话历史

### 2. 不适用的场景
以下场景不使用 `activity.back()`：

**主页返回**：
- 使用 `mgr.showMainView()` 确保回到主页
- 不是简单的返回上一页

**跨模块跳转**：
- 从任务中心跳转到主页
- 从设置跳转到主页
- 需要明确指定目标页面

### 3. 测试要点
测试所有返回场景：
- [ ] 任务详情 → 日志 → 返回
- [ ] 任务详情 → AI 编辑 → 返回
- [ ] 任务详情 → 脚本编辑 → 返回
- [ ] 任务详情 → 脚本编辑（有修改）→ 返回（提示）
- [ ] 任务中心 → 任务详情 → 返回

## 实现原理

### Android 返回栈
```
[主页] → [任务详情] → [日志页面]
  ↑          ↑            ↓
  └──────────┴────── back()
```

调用 `activity.back()` 时：
1. 销毁当前页面
2. 从返回栈弹出
3. 恢复上一个页面
4. 自动刷新页面状态

### 页面生命周期
```javascript
// 进入页面
mgr.showTaskLogs(taskId);
// → 创建新页面
// → 压入返回栈

// 返回
activity.back();
// → 销毁当前页面
// → 弹出返回栈
// → 恢复上一页面
```

## 调试

如果返回有问题，检查：

1. **是否正确调用**：
```javascript
// 正确
activity.back();

// 错误
mgr.showTaskDetail(taskId); // 可能 taskId 丢失
```

2. **是否有拦截**：
```javascript
// 检查是否有 onBackPressed 拦截
ui.emitter.on('back_pressed', function(e) {
    // 如果这里 return true，会阻止返回
});
```

3. **返回栈状态**：
```javascript
// 打印返回栈
console.log('Current view:', mgr.currentView);
console.log('Task ID:', mgr.currentTaskId);
```

## 总结

所有详情页面的返回按钮统一使用 `activity.back()`：
- ✓ 简单可靠
- ✓ 符合习惯
- ✓ 易于维护
- ✓ 不会出错

特殊情况（如未保存提示）在返回前处理，但最终仍使用 `activity.back()` 返回。
