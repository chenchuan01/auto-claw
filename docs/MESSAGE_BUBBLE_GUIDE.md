# AI 对话消息气泡样式指南

## 概述

AI 对话页面的消息气泡已优化，具有以下特性：
- 固定宽度的消息气泡
- 消息之间有明确的间隔
- 消息内容在气泡中居左对齐
- 用户和 AI 消息样式区分明显

## 样式配置

所有消息气泡样式通过 `bubbleConfig.js` 统一管理。

### 默认配置

```javascript
var MESSAGE_BUBBLE_CONFIG = {
    // 气泡宽度
    bubbleWidth: '280dp',

    // 气泡间距 (left top right bottom)
    bubbleMargin: '16 0 16 12',

    // 气泡圆角
    bubbleRadius: '16',

    // 气泡内边距 (horizontal vertical)
    bubblePadding: '14 12',

    // 用户消息样式
    userBubble: {
        bgColor: C.primary,      // 主题色背景
        textColor: '#FFFFFF',    // 白色文字
        alignment: 'right'       // 右对齐
    },

    // AI 消息样式
    aiBubble: {
        bgColor: C.card,         // 卡片背景色
        textColor: C.textPrimary,// 主要文字色
        alignment: 'left'        // 左对齐
    },

    // 文本样式
    textSize: '14sp',
    lineSpacing: '4',
    textGravity: 'left',         // 文本在气泡内居左

    // 代码块样式
    codeBlock: {
        bgColor: C.surface,
        textColor: C.textPrimary,
        textSize: '12sp',
        radius: '8',
        padding: '10',
        headerPadding: '8 10'
    }
};
```

## 视觉效果

### 用户消息
- 右对齐
- 蓝色背景（主题色）
- 白色文字
- 固定宽度 280dp
- 文字在气泡内居左

### AI 消息
- 左对齐
- 浅灰色背景（卡片色）
- 深色文字
- 固定宽度 280dp
- 文字在气泡内居左

### 消息间隔
- 左右边距：16dp
- 底部间距：12dp
- 确保消息之间有清晰的视觉分隔

## 自定义配置

如果需要调整样式，可以使用 `updateConfig` 方法：

```javascript
var BubbleConfig = require('./modules/ui/ai_chat/bubbleConfig');

// 调整气泡宽度
BubbleConfig.updateConfig({
    bubbleWidth: '300dp'
});

// 调整间距
BubbleConfig.updateConfig({
    bubbleMargin: '20 0 20 16'
});

// 调整用户消息颜色
BubbleConfig.updateConfig({
    userBubble: {
        bgColor: '#FF5722'
    }
});
```

## 代码块样式

AI 消息中的代码块有特殊样式：
- 独立的背景色（surface 色）
- 可折叠/展开
- 显示代码行数
- 代码文字居左对齐
- 支持文本选择和复制

## 测试

运行 `test_message_bubbles.js` 查看消息气泡的实际效果。

## 技术细节

### 气泡宽度
- 固定宽度 280dp，适配大部分手机屏幕
- 不使用 `maxWidth="*"`，避免气泡宽度不一致
- 长文本会在气泡内自动换行

### 文本对齐
- 气泡容器使用 `gravity` 控制左右对齐
- 文本内容使用 `gravity="left"` 确保居左显示
- 避免文字在气泡中居中或右对齐

### 间距设计
- 使用 `margin` 而不是 `marginBottom`，更灵活
- 左右边距确保气泡不贴边
- 底部间距确保消息之间有呼吸感

## 注意事项

1. **固定宽度**：所有消息气泡宽度一致，视觉更整齐
2. **文字居左**：即使是用户消息（右对齐），文字也在气泡内居左
3. **间隔明确**：消息之间有 12dp 的间隔，易于区分
4. **可选择文本**：所有消息文本都可以长按选择和复制

## 对比

### 修改前
- 气泡宽度不固定（使用 maxWidth）
- 消息间隔不明确（marginBottom 28）
- 文字对齐方式不统一
- 用户消息有 marginLeft，AI 消息有 marginRight

### 修改后
- 固定宽度 280dp
- 统一间隔 margin="16 0 16 12"
- 所有文字在气泡内居左
- 使用 gravity 控制气泡对齐，更简洁
