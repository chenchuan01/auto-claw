# Font Awesome 6 使用指南

## 概述

项目已集成 Font Awesome 6 Solid 字体图标库，包含 2000+ 丰富的图标资源。Font Awesome 是世界上最流行的图标库之一。

**注意**：项目使用 Solid（实心）样式，因为大部分常用图标只在 Solid 中提供。

## 快速开始

### 1. 初始化字体管理器

```javascript
var FontManager = require('./modules/core/font_manager');

// 创建 Font Awesome 字体管理器
var fontManager = new FontManager('fontawesome');

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
ui.settingsIcon.setText(fontManager.getIcon('gear'));
```

### 3. 使用 Config 中的图标

```javascript
var Config = require('./modules/core/config');

// Config.icons 已经配置好常用图标
ui.playIcon.setText(Config.icons.play);
ui.settingsIcon.setText(Config.icons.cog);
```

## 字体切换

项目支持在 Feather Icons 和 Font Awesome 之间切换：

```javascript
// 使用 Font Awesome（默认）
var fontManager = new FontManager('fontawesome');

// 使用 Feather Icons
var fontManager = new FontManager('feather');
```

在 `ui_manager.js` 中修改字体类型即可全局切换。

## 常用图标列表

### 基础操作
- `play` - 播放
- `pause` - 暂停
- `stop` - 停止
- `circle-play` - 圆形播放
- `circle-pause` - 圆形暂停
- `circle-stop` - 圆形停止

### 编辑操作
- `pen` - 编辑
- `pen-to-square` - 编辑方块
- `trash` - 删除
- `trash-can` - 垃圾桶
- `xmark` - 关闭/删除
- `check` - 勾选
- `plus` - 添加
- `minus` - 减少

### 箭头
- `arrow-left` / `arrow-right` / `arrow-up` / `arrow-down` - 箭头
- `chevron-left` / `chevron-right` / `chevron-up` / `chevron-down` - 尖括号

### 文件操作
- `download` - 下载
- `upload` - 上传
- `save` / `floppy-disk` - 保存
- `file` - 文件
- `file-code` - 代码文件
- `folder` / `folder-open` - 文件夹

### 界面元素
- `bars` - 菜单
- `ellipsis` - 更多（横向）
- `ellipsis-vertical` - 更多（纵向）
- `gear` / `cog` - 设置
- `sliders` - 滑块

### 用户相关
- `user` - 用户
- `users` - 多用户
- `user-plus` - 添加用户
- `user-minus` - 移除用户

### 通讯
- `envelope` - 邮件
- `comment` / `comments` - 评论
- `message` - 消息
- `bell` - 通知
- `bell-slash` - 关闭通知

### 状态
- `circle` - 圆形
- `circle-dot` - 圆点
- `square` - 方块
- `square-check` - 方块勾选
- `circle-check` - 圆形勾选
- `circle-xmark` - 圆形关闭
- `triangle-exclamation` - 警告
- `circle-info` - 信息
- `circle-question` - 问号

### 星级评分
- `star` - 星星
- `star-half` - 半星
- `heart` - 心形
- `bookmark` - 书签

### 时间日期
- `clock` - 时钟
- `calendar` / `calendar-days` - 日历
- `hourglass` - 沙漏

### 工具
- `magnifying-glass` / `search` - 搜索
- `wrench` - 扳手
- `screwdriver-wrench` - 工具
- `hammer` - 锤子

### 代码开发
- `code` - 代码
- `terminal` - 终端
- `laptop-code` - 笔记本代码
- `bug` - Bug

### 云服务
- `cloud` - 云
- `cloud-arrow-up` - 上传云
- `cloud-arrow-down` - 下载云
- `server` - 服务器
- `database` - 数据库

### 其他常用
- `eye` / `eye-slash` - 显示/隐藏
- `lock` / `unlock` - 锁定/解锁
- `key` - 钥匙
- `shield` - 盾牌
- `clipboard` - 剪贴板
- `copy` - 复制
- `paste` - 粘贴
- `share` - 分享
- `link` - 链接
- `rotate` / `arrows-rotate` - 旋转/刷新
- `spinner` / `circle-notch` - 加载中
- `bolt` / `bolt-lightning` - 闪电
- `paper-plane` - 纸飞机
- `crosshairs` - 十字准星
- `bullseye` - 靶心

完整图标列表请参考 `modules/core/fontawesome_icon_codes.js` 文件。

## 示例

### 示例 1：创建带图标的按钮

```javascript
ui.layout(
    <horizontal>
        <button id="playBtn" text="" textSize="20sp" w="48dp" h="48dp"/>
        <button id="pauseBtn" text="" textSize="20sp" w="48dp" h="48dp"/>
        <button id="stopBtn" text="" textSize="20sp" w="48dp" h="48dp"/>
    </horizontal>
);

fontManager.apply(ui.playBtn, ui.pauseBtn, ui.stopBtn);
ui.playBtn.setText(fontManager.getIcon('play'));
ui.pauseBtn.setText(fontManager.getIcon('pause'));
ui.stopBtn.setText(fontManager.getIcon('stop'));
```

### 示例 2：图标 + 文字按钮

```javascript
ui.layout(
    <button id="saveBtn" textSize="16sp" padding="12 24"/>
);

fontManager.apply(ui.saveBtn);
ui.saveBtn.setText(fontManager.getIcon('floppy-disk') + ' 保存');
```

## 注意事项

1. 项目使用 Font Awesome Solid（实心）样式
2. 如需线条风格图标，可以切换到 Feather Icons
3. 图标本质上是文本字符，可以使用 `textSize`、`textColor` 等属性
4. 所有图标名称使用小写字母和连字符（如 `arrow-left`）
5. 部分图标有别名（如 `home` = `house`, `search` = `magnifying-glass`）

## 测试

运行 `test_fontawesome.js` 查看 Font Awesome 图标效果。

## 与 Feather Icons 对比

| 特性 | Font Awesome Solid | Feather Icons |
|------|-------------------|---------------|
| 图标数量 | 2000+ | 287 |
| 风格 | 实心，多样化 | 统一线条 |
| 文件大小 | 较大 (200KB+) | 较小 (36KB) |
| 社区支持 | 非常活跃 | 活跃 |
| 适用场景 | 通用项目，需要丰富图标 | 简约设计，统一风格 |

根据项目需求选择合适的图标库。
