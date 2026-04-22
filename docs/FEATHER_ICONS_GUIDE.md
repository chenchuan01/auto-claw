# Feather Icons 字体图标使用指南

## 概述

项目已集成 Feather Icons 字体图标库，包含 287 个精美的图标。使用字体图标而非 WebView 渲染，性能更好，使用更简单。

## 重要说明

**图标码点已更新！** 如果你发现图标无法正常显示，请确保：

1. 使用的是 `assets/fonts/feather.ttf` 字体文件
2. `Config.icons` 中的码点已更新为正确值
3. 调用了 `fontManager.load()` 和 `fontManager.apply()`

运行 `test_config_icons.js` 可以验证所有图标是否正确显示。

## 快速开始

### 1. 初始化字体管理器

```javascript
var FontManager = require('./modules/core/font_manager');

// 创建字体管理器实例
var fontManager = new FontManager();

// 加载字体文件
var loaded = fontManager.load();
if (!loaded) {
    console.error('字体加载失败');
}
```

### 2. 在 UI 中使用图标

```javascript
ui.layout(
    <vertical>
        <text id="homeIcon" textSize="24sp"/>
        <text id="settingsIcon" textSize="24sp"/>
    </vertical>
);

// 应用字体到文本视图
fontManager.apply(ui.homeIcon, ui.settingsIcon);

// 设置图标字符
ui.homeIcon.setText(fontManager.getIcon('home'));
ui.settingsIcon.setText(fontManager.getIcon('settings'));
```

### 3. 动态创建图标

```javascript
// 创建一个带图标的按钮
var iconText = ui.inflate(
    <text textSize="20sp" gravity="center"/>
);

fontManager.apply(iconText);
iconText.setText(fontManager.getIcon('search'));
```

## API 参考

### FontManager

#### 方法

- `load()`: 加载字体文件，返回 boolean 表示是否成功
- `apply(...views)`: 将字体应用到一个或多个视图（自动使用 NORMAL 样式）
- `applyWithOptions(view, options)`: 高级应用方法，支持自定义样式
  - `options.style`: 'normal' 或 'bold'（默认 'normal'）
  - `options.antiAlias`: 是否抗锯齿（默认 true）
- `getIcon(iconName)`: 获取指定名称的图标字符
- `getAvailableIcons()`: 获取所有可用图标名称数组
- `isLoaded()`: 检查字体是否已加载

#### 关于字体粗细

**重要**：Feather Icons 是线条风格的图标，推荐使用正常粗细（NORMAL）。

`apply()` 方法会自动：
- 设置字体样式为 `Typeface.NORMAL`
- 禁用假粗体效果（`setFakeBoldText(false)`）
- 即使视图在 XML 中设置了 `textStyle="bold"`，也会被修正为正常粗细

如果确实需要粗体效果，使用 `applyWithOptions()`：

```javascript
fontManager.applyWithOptions(ui.iconView, {style: 'bold'});
```

运行 `test_font_weight.js` 可以对比不同粗细的效果。

## 常用图标列表

### 导航类
- `home` - 主页
- `menu` - 菜单
- `arrow-left` - 左箭头
- `arrow-right` - 右箭头
- `arrow-up` - 上箭头
- `arrow-down` - 下箭头
- `chevron-left` - 左尖括号
- `chevron-right` - 右尖括号

### 操作类
- `search` - 搜索
- `settings` - 设置
- `edit` - 编辑
- `trash` - 删除
- `save` - 保存
- `download` - 下载
- `upload` - 上传
- `copy` - 复制

### 状态类
- `check` - 勾选
- `x` - 关闭
- `check-circle` - 成功
- `alert-circle` - 警告
- `info` - 信息
- `help-circle` - 帮助

### 用户类
- `user` - 用户
- `users` - 多用户
- `user-plus` - 添加用户
- `user-minus` - 移除用户

### 通讯类
- `mail` - 邮件
- `message-circle` - 消息
- `phone` - 电话
- `bell` - 通知

### 媒体类
- `play` - 播放
- `pause` - 暂停
- `stop-circle` - 停止
- `skip-forward` - 快进
- `skip-back` - 快退

### 文件类
- `file` - 文件
- `folder` - 文件夹
- `file-text` - 文本文件
- `file-plus` - 新建文件

### 其他
- `heart` - 喜欢
- `star` - 收藏
- `calendar` - 日历
- `clock` - 时钟
- `lock` - 锁定
- `unlock` - 解锁

完整图标列表请参考 `modules/core/feather_icon_codes.js` 文件。

## 示例

### 示例 1：创建带图标的标题栏

```javascript
ui.layout(
    <horizontal bg="#2196F3" h="56dp" gravity="center_vertical">
        <text id="backIcon" textSize="24sp" w="48dp" gravity="center" textColor="#FFFFFF"/>
        <text text="页面标题" textSize="18sp" flex="1" textColor="#FFFFFF"/>
        <text id="moreIcon" textSize="24sp" w="48dp" gravity="center" textColor="#FFFFFF"/>
    </horizontal>
);

fontManager.apply(ui.backIcon, ui.moreIcon);
ui.backIcon.setText(fontManager.getIcon('arrow-left'));
ui.moreIcon.setText(fontManager.getIcon('more-vertical'));

// 添加点击事件
ui.backIcon.on('click', () => {
    toast('返回');
});
```

### 示例 2：创建图标列表

```javascript
var icons = ['home', 'search', 'heart', 'user', 'settings'];
var iconViews = [];

ui.layout(
    <vertical id="container" padding="16"/>
);

icons.forEach(function(iconName) {
    var row = ui.inflate(
        <horizontal marginBottom="8">
            <text id="icon" textSize="24sp" w="48dp" gravity="center"/>
            <text id="label" textSize="16sp" gravity="center_vertical"/>
        </horizontal>
    );

    fontManager.apply(row.icon);
    row.icon.setText(fontManager.getIcon(iconName));
    row.label.setText(iconName);

    ui.container.addView(row);
});
```

## 注意事项

1. 字体文件位于 `assets/fonts/feather.ttf`，确保文件存在
2. 必须先调用 `load()` 加载字体，再使用 `apply()` 应用到视图
3. 图标本质上是文本字符，可以使用 `textSize`、`textColor` 等属性调整样式
4. 所有图标名称使用小写字母和连字符（如 `arrow-left`）
5. **重要**：`Config.icons` 中的图标码点必须与 `feather.ttf` 字体文件匹配

## 测试

- 运行 `test_feather_font_integration.js` 查看基础字体图标效果
- 运行 `test_config_icons.js` 验证 Config 中的图标码点是否正确
- 运行 `test_font_weight.js` 对比不同字体粗细的效果

## 故障排查

### 图标显示为方块或乱码

**原因**：图标码点不匹配

**解决方案**：
1. 检查 `Config.icons` 中的码点是否正确
2. 运行 `test_config_icons.js` 验证
3. 确保使用的是 `feather.ttf` 而非其他字体文件

### 图标不显示

**原因**：字体未加载或未应用

**解决方案**：
1. 确保调用了 `fontManager.load()`
2. 确保调用了 `fontManager.apply(view)`
3. 检查字体文件路径是否正确

### 部分图标正常，部分图标异常

**原因**：个别图标码点错误

**解决方案**：
1. 运行 `test_config_icons.js` 找出错误的图标
2. 对照 `feather_icon_codes.js` 更新 `Config.icons` 中的码点

### 图标看起来太粗或太细

**原因**：字体粗细设置不当

**解决方案**：
1. 使用 `fontManager.apply()` 会自动设置为正常粗细
2. 运行 `test_font_weight.js` 查看不同粗细的对比效果
3. Feather Icons 推荐使用正常粗细（NORMAL）

