# APP 颜色配置说明

## 颜色方案

AutoClaw 使用统一的蓝色主题，所有成功、完成、选中状态都使用蓝色系。

## 主要颜色

| 颜色名称 | 色值 | 用途 | 示例 |
|---------|------|------|------|
| primary | #3B82F6 | 主题色 | 按钮、选中状态、强调元素 |
| primaryDark | #2563EB | 深蓝色 | 按钮按下状态 |
| accent | #3B82F6 | 强调色 | Card 标题、重要文字 |
| success | #22C55E | 成功状态 | 已完成标记、成功提示 |
| warning | #F59E0B | 警告状态 | 待执行、警告提示 |
| error | #EF4444 | 错误状态 | 失败标记、错误提示 |
| info | #3B82F6 | 信息提示 | 信息按钮、提示文字 |

## 背景颜色

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| bg | #FFFFFF | 页面背景 |
| card | #F5F7FA | Card 背景 |
| surface | #EEF1F6 | 输入框、表面元素 |
| divider | #E2E6ED | 分割线 |

## 文字颜色

| 颜色名称 | 色值 | 用途 |
|---------|------|------|
| textPrimary | #1A1A2E | 主要文字 |
| textSecondary | #6B7280 | 次要文字 |
| textHint | #9CA3AF | 提示文字 |

## 状态颜色

| 状态 | 颜色 | 色值 | 说明 |
|------|------|------|------|
| 待执行 | 橙色 | #F59E0B | warning |
| 执行中 | 深蓝 | #1F6FEB | 运行状态 |
| 已完成 | 绿色 | #22C55E | success（保持绿色）|
| 失败 | 红色 | #EF4444 | error |
| 已暂停 | 紫色 | #9C27B0 | 暂停状态 |

## 透明度使用

在颜色后添加透明度值：

| 透明度 | 后缀 | 示例 | 效果 |
|--------|------|------|------|
| 13% | 22 | #3B82F622 | 淡蓝色背景 |
| 20% | 33 | #3B82F633 | 浅蓝色背景 |
| 50% | 80 | #3B82F680 | 半透明蓝色 |

## 使用示例

### 按钮

```javascript
// 主要按钮
bg="' + C.primary + '" textColor="white"

// 次要按钮
bg="' + C.surface + '" textColor="' + C.textSecondary + '"

// 危险按钮
bg="' + C.error + '" textColor="white"
```

### 选中状态

```javascript
// 选中背景（淡蓝色）
bg="' + C.primary + '22"

// 选中文字
textColor="' + C.primary + '"
```

### 状态标记

```javascript
// 成功状态（绿色）
bg="' + C.success + '" textColor="white"

// 警告状态（橙色）
bg="' + C.warning + '" textColor="white"

// 错误状态（红色）
bg="' + C.error + '" textColor="white"

// 主要按钮（蓝色）
bg="' + C.primary + '" textColor="white"
```

### Card 标题

```javascript
textColor="' + C.accent + '" textStyle="bold"
```

## 颜色修改历史

### v1.1.0 - 优化颜色使用

**修改内容**：
- AI 设置中的选中状态使用蓝色 `C.primary + '22'`（淡蓝色）
- AI 对话中的运行按钮从绿色改为蓝色 `C.primary`
- 保持"已完成"状态为绿色 `#22C55E`

**影响范围**：
- AI 设置中的消息格式选中状态：淡蓝色背景
- AI 对话中的运行按钮：蓝色
- 任务完成状态标记：保持绿色

**原因**：
- 选中状态使用主题色更统一
- 运行按钮使用主题色更协调
- 完成状态保持绿色符合用户习惯

## 注意事项

1. **不要直接使用色值**：始终使用 `Config.colors` 中的颜色常量
2. **保持一致性**：相同功能使用相同颜色
3. **对比度**：确保文字和背景有足够对比度
4. **无障碍**：考虑色盲用户，不仅依赖颜色区分状态

## 添加新颜色

如需添加新颜色，在 `modules/core/config.js` 中修改：

```javascript
colors: {
    // 现有颜色...
    newColor: '#HEXCODE',  // 新颜色说明
}
```

然后在代码中使用：

```javascript
var C = Config.colors;
bg="' + C.newColor + '"
```

## 测试

修改颜色后，检查以下页面：
- [ ] 主页
- [ ] 任务详情
- [ ] AI 设置
- [ ] 任务中心
- [ ] AI 对话
- [ ] 脚本编辑器

确保所有页面的颜色统一协调。
