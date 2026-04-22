# Header 统一管理指南

## 概述

项目已实现统一的 Header 管理系统，所有页面的 Header 高度、样式、图标粗细都通过 `header_builder.js` 统一控制。

## 特性

- **固定高度**：所有 Header 高度统一为 56dp
- **分离样式**：标题和图标的字体参数独立控制
- **图标粗细**：图标使用正常粗细（normal），标题使用粗体（bold）
- **统一配置**：通过 `HEADER_CONFIG` 集中管理所有样式参数

## Header 配置

```javascript
var HEADER_CONFIG = {
    height: '56dp',           // 固定高度
    padding: '16 16 16 16',   // 统一内边距

    // 标题样式
    titleSize: '20sp',
    titleColor: '#FFFFFF',
    titleStyle: 'bold',
    titleLineSpacing: '0dp',  // 行间距（避免遮挡）
    titleGravity: 'center_vertical', // 垂直居中（避免遮挡）
    titleIncludeFontPadding: false,  // 移除字体内置 padding（中英文等高）

    // 图标样式
    iconSize: '20sp',
    iconColor: '#FFFFFF',
    iconStyle: 'normal',      // 图标不使用粗体
    iconWidth: '40dp',

    // 背景
    background: C.primary
};
```

### 关键配置说明

- **titleGravity**: 设置为 `center_vertical` 确保标题文字垂直居中，避免上下遮挡
- **titleLineSpacing**: 设置为 `0dp` 避免额外的行间距导致文字被裁剪
- **titleIncludeFontPadding**: 设置为 `false` 移除字体内置的上下 padding，解决中英文字体不等高问题
- **height**: 固定 56dp 高度，配合垂直居中确保文字完整显示

## 使用方法

### 1. 引入模块

```javascript
var HeaderBuilder = require('./header_builder');
// 或在子目录中
var HeaderBuilder = require('../header_builder');
```

### 2. 构建 Header

```javascript
// 标准 Header（返回 + 标题 + 操作按钮）
HeaderBuilder.buildHeader({
    title: '任务详情',
    leftIcon: I.arrowLeft,
    leftIconId: 'btn_back',
    rightIcon: I.pen,
    rightIconId: 'btn_edit'
})

// 主页样式（无返回按钮）
HeaderBuilder.buildHeader({
    title: 'AutoClaw',
    rightIcon: I.cog,
    rightIconId: 'btn_settings'
})

// 双右侧图标
HeaderBuilder.buildHeader({
    title: 'AI 设置',
    leftIcon: I.arrowLeft,
    leftIconId: 'btn_back',
    rightIcon: I.save,
    rightIconId: 'btn_save',
    rightIcon2: I.refresh,
    rightIcon2Id: 'btn_refresh'
})
```

### 3. 应用字体

```javascript
// 在 UI 布局完成后，应用字体到图标
mgr.fontManager.apply(ui.btn_back, ui.btn_edit);
```

## 参数说明

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| title | string | 否 | 标题文本 |
| leftIcon | string | 否 | 左侧图标（通常是返回按钮） |
| leftIconId | string | 否 | 左侧图标的 id，默认 'btn_back' |
| rightIcon | string | 否 | 右侧图标 |
| rightIconId | string | 否 | 右侧图标的 id，默认 'btn_right' |
| rightIcon2 | string | 否 | 第二个右侧图标 |
| rightIcon2Id | string | 否 | 第二个右侧图标的 id，默认 'btn_right2' |

## 完整示例

```javascript
var Config = require('../core/config');
var HeaderBuilder = require('./header_builder');
var C = Config.colors;
var I = Config.icons;

function UITaskDetail(uiManager) {
    this.uiManager = uiManager;
}

UITaskDetail.prototype.show = function(taskId) {
    var mgr = this.uiManager;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        HeaderBuilder.buildHeader({
            title: '任务详情',
            leftIcon: I.arrowLeft,
            leftIconId: 'btn_back',
            rightIcon: I.pen,
            rightIconId: 'btn_edit'
        }) +
        '  <!-- 页面内容 -->' +
        '  <scroll>' +
        '    <vertical padding="16">' +
        '      <text text="内容区域"/>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    // 应用字体到图标
    mgr.fontManager.apply(ui.btn_back, ui.btn_edit);

    // 绑定事件
    ui.btn_back.on('click', () => {
        mgr.showMainView();
    });

    ui.btn_edit.on('click', () => {
        // 编辑操作
    });
};
```

## 自定义配置

如果需要修改全局 Header 配置：

```javascript
var HeaderBuilder = require('./header_builder');

// 更新配置
HeaderBuilder.updateHeaderConfig({
    height: '60dp',
    titleSize: '22sp',
    iconSize: '22sp'
});
```

## 已更新的页面

以下页面已使用统一的 Header 系统：

- ✓ 主视图 (ui_main_view.js)
- ✓ 任务详情 (ui_task_detail.js)
- ✓ 任务中心 (ui_market_view.js)
- ✓ 任务日志 (ui_task_logs.js)
- ✓ AI 设置 (ui_settings.js)
- ✓ AI 助手 (ai_chat/layoutBuilder.js)
- ✓ 脚本编辑器 (script_editor/main.js)

## 测试

- 运行 `test_header.js` 查看不同 Header 样式的效果
- 运行 `test_header_fix.js` 查看文字遮挡问题的修复对比

## 注意事项

1. **图标粗细**：图标使用 `normal` 样式，不会像标题那样粗
2. **固定高度**：所有 Header 高度统一为 56dp，确保视觉一致性
3. **字体应用**：记得在布局完成后调用 `fontManager.apply()` 应用字体
4. **ID 命名**：建议使用语义化的 ID 名称（如 `btn_back`, `btn_save`）
5. **文字遮挡**：标题已设置 `gravity="center_vertical"` 和 `lineSpacingExtra="0dp"` 避免遮挡问题

## 优势

- **一致性**：所有页面 Header 样式统一
- **可维护性**：修改配置即可全局更新
- **灵活性**：支持多种 Header 布局组合
- **清晰度**：图标和标题样式分离，视觉层次更清晰
- **无遮挡**：标题垂直居中且行间距为 0，确保文字完整显示

## 常见问题

### Q: 标题文字被上下裁剪或遮挡？

**A**: 已通过以下方式修复：
1. 标题添加 `gravity="center_vertical"` 确保垂直居中
2. 标题添加 `lineSpacingExtra="0dp"` 避免额外行间距
3. 标题添加 `includeFontPadding="false"` 移除字体内置 padding
4. 容器设置 `gravity="center_vertical"` 确保所有元素对齐

### Q: 中英文字体高度不一致？

**A**: 通过 `includeFontPadding="false"` 解决：
- Android TextView 默认会为字体添加额外的上下 padding
- 中文字体和英文字体的 padding 不同，导致高度不一致
- 设置 `includeFontPadding="false"` 可以移除这些 padding
- 配合 `gravity="center_vertical"` 确保文字居中对齐

### Q: 如何调整 Header 高度？

**A**: 修改 `HEADER_CONFIG.height` 即可全局更新：
```javascript
HeaderBuilder.updateHeaderConfig({
    height: '60dp'
});
```

### Q: 标题太长怎么办？

**A**: 标题会自动使用 `layout_weight="1"` 占据剩余空间，超长文字会自动换行或截断。建议标题保持简短（10 字以内）。
