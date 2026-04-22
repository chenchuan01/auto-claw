# 图标显示问题诊断指南

## 快速检查

运行以下测试脚本检查图标状态：

1. **test_icon_validation.js** - 验证码点是否匹配
2. **test_icon_display.js** - 可视化检查图标显示
3. **test_fontawesome_verify.js** - 验证字体文件加载

## 常见问题

### 1. 图标显示为方块 □

**原因**：字体文件中不包含该图标的码点

**解决方案**：
```bash
# 检查是否使用了正确的字体文件
# Font Awesome Solid: fa-solid-900.ttf
# Font Awesome Regular: fa-regular-400.ttf

# 确认 font_manager.js 中的字体路径
this.fontPath = files.path('./assets/fonts/fa-solid-900.ttf');
```

### 2. 图标显示为空白

**原因**：
- 字体未正确加载
- 字体未应用到 TextView
- 码点错误

**解决方案**：
```javascript
// 1. 确认字体加载成功
var fontManager = new FontManager('fontawesome');
if (!fontManager.load()) {
    console.error('字体加载失败');
}

// 2. 确认应用字体到视图
mgr.fontManager.apply(ui.btn_icon);

// 3. 检查码点是否正确
console.log('图标码点:', Config.icons.play);
```

### 3. 部分图标正常，部分不正常

**原因**：使用了 Regular 字体，但某些图标只在 Solid 中存在

**解决方案**：
- 切换到 Solid 字体（推荐）
- 或者只使用 Regular 中存在的图标

## 验证步骤

### 步骤 1：验证码点匹配

```bash
node test_icon_validation.js
```

**预期输出**：
```
✓ 成功: 39/39
✗ 错误: 0
⚠ 警告: 0
```

如果有错误，说明 Config.icons 和 fontawesome_icon_codes.js 不一致。

### 步骤 2：可视化检查

运行 `test_icon_display.js`，查看每个图标的显示效果。

**正常**：图标清晰显示，状态为 ✓
**异常**：显示为方块或空白

### 步骤 3：检查字体文件

```bash
# 检查字体文件是否存在
ls -lh assets/fonts/fa-solid-900.ttf

# 检查文件大小（应该约 200KB+）
# 如果文件太小或不存在，需要重新下载
```

## 图标码点对照表

| Config 键名 | Font Awesome 名称 | 码点 | 说明 |
|------------|------------------|------|------|
| play | play | \uf04b | 播放 |
| pause | pause | \uf04c | 暂停 |
| stop | circle-stop | \uf28d | 停止 |
| xmark | xmark | \uf00d | 关闭 |
| pen | pen | \uf304 | 编辑 |
| arrowLeft | arrow-left | \uf060 | 返回 |
| download | download | \uf019 | 下载 |
| upload | upload | \uf093 | 上传 |
| save | floppy-disk | \uf0c7 | 保存 |
| bars | bars | \uf0c9 | 菜单 |
| code | code | \uf121 | 代码 |
| star | star | \uf005 | 星级 |
| user | user | \uf007 | 用户 |
| refresh | arrows-rotate | \uf021 | 刷新 |
| plus | plus | \u002b | 添加 |
| cog | gear | \uf013 | 设置 |
| spinner | spinner | \uf110 | 加载 |

完整列表见 `modules/core/config.js`

## 修复方案

### 方案 1：确认使用 Solid 字体

编辑 `modules/core/font_manager.js`：

```javascript
if (this.fontType === 'fontawesome') {
    // 使用 Solid 字体
    this.fontPath = files.path('./assets/fonts/fa-solid-900.ttf');
    this.icons = FontAwesomeIconCodes;
}
```

### 方案 2：重新下载字体文件

如果字体文件损坏或不完整：

```bash
# 删除旧文件
rm assets/fonts/fa-solid-900.ttf

# 重新下载
# 从 Font Awesome 官网下载最新版本
# https://fontawesome.com/download
```

### 方案 3：验证并修复码点

运行验证脚本：

```bash
node test_icon_validation.js
```

如果发现码点不匹配，手动修复 `modules/core/config.js`。

## 调试技巧

### 1. 打印图标信息

```javascript
var iconCode = Config.icons.play;
console.log('图标码点:', iconCode);
console.log('Unicode:', 'U+' + iconCode.charCodeAt(0).toString(16).toUpperCase());
console.log('字符:', iconCode);
```

### 2. 测试单个图标

```javascript
ui.layout('<text id="test" textSize="48sp"/>');
var fontManager = new FontManager('fontawesome');
fontManager.load();
fontManager.apply(ui.test);
ui.test.setText(Config.icons.play);
```

### 3. 对比字体文件

```bash
# 检查字体文件的图标数量
# 使用字体查看工具（如 FontForge）打开字体文件
# 查看是否包含所需的 Unicode 码点
```

## 已知问题

### 1. Regular vs Solid

**问题**：某些图标只在 Solid 中存在
**影响图标**：play, pause, stop, check, plus, minus 等
**解决**：使用 Solid 字体

### 2. 字体缓存

**问题**：更换字体后图标未更新
**解决**：
```javascript
// 清除应用缓存或重启应用
// 或者使用不同的字体名称
```

### 3. TextView 限制

**问题**：某些 Android 版本对自定义字体支持有限
**解决**：确保使用 TypefaceSpan 或 setTypeface

## 验证清单

- [ ] 字体文件存在且完整（fa-solid-900.ttf）
- [ ] font_manager.js 指向正确的字体文件
- [ ] Config.icons 中所有码点都正确
- [ ] fontawesome_icon_codes.js 包含所有需要的图标
- [ ] 所有使用图标的地方都调用了 fontManager.apply()
- [ ] 运行 test_icon_validation.js 无错误
- [ ] 运行 test_icon_display.js 所有图标正常显示

## 联系支持

如果以上方法都无法解决问题：

1. 运行所有测试脚本并保存输出
2. 检查 assets/fonts/ 目录下的文件
3. 提供 Android 版本和设备信息
4. 截图显示异常的图标

## 参考资料

- Font Awesome 官方文档: https://fontawesome.com/docs
- Font Awesome 图标搜索: https://fontawesome.com/icons
- 项目文档: docs/FONTAWESOME_GUIDE.md
