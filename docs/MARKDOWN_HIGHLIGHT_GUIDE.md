# Markdown 渲染和代码高亮指南

## 概述

AI 对话页面现在支持完整的 Markdown 渲染和 JavaScript 代码语法高亮：
- 用户和 AI 的所有消息都支持 Markdown 格式
- 代码块自动应用语法高亮
- 支持行内代码、粗体、斜体、标题、列表等

## Markdown 支持

### 文本格式

```markdown
**粗体文本**
*斜体文本*
`行内代码`
```

### 标题

```markdown
# 一级标题
## 二级标题
### 三级标题
```

### 列表

```markdown
- 列表项 1
- 列表项 2
- 列表项 3

1. 有序列表 1
2. 有序列表 2
3. 有序列表 3
```

### 代码块

````markdown
```javascript
function hello() {
    console.log("Hello World");
}
```
````

## 代码语法高亮

### 支持的语言

目前主要支持 JavaScript/AutoX.js 语法高亮。

### 高亮元素

| 元素 | 颜色 | 样式 |
|------|------|------|
| 关键字 | 红色 (#CF222E) | 粗体 |
| 字符串 | 深蓝色 (#0A3069) | 正常 |
| 注释 | 灰色 (#6E7781) | 斜体 |
| 数字 | 蓝色 (#0550AE) | 正常 |
| 函数/对象 | 紫色 (#8250DF) | 正常 |
| 默认文本 | 深灰色 (#24292F) | 正常 |

### 关键字

```javascript
var, let, const, function, return, if, else, for, while,
do, switch, case, break, continue, try, catch, finally,
throw, new, this, typeof, instanceof, true, false, null,
undefined, class, extends, async, await, etc.
```

### 内置函数和对象

```javascript
console, log, toast, sleep, click, text, launchApp,
Array, Object, String, Number, Boolean, Date, Math, JSON,
setTimeout, setInterval, require, module, exports, etc.
```

## 使用示例

### 在 AI 对话中使用

**用户消息**：
```
我想实现一个功能：
1. 打开微信
2. 搜索联系人
3. 发送消息

可以使用 `launchApp()` 和 `click()` 吗？
```

**AI 回复**：
````
当然可以！这是实现代码：

```javascript
// 打开微信
launchApp("微信");
sleep(2000);

// 搜索联系人
click("搜索");
sleep(1000);
setText("张三");

// 发送消息
click("张三");
sleep(1000);
setText("Hello");
click("发送");
```

代码说明：
- **launchApp()** 用于启动应用
- **sleep()** 用于等待界面加载
- **click()** 用于点击元素
- **setText()** 用于输入文本
````

### 代码高亮效果

```javascript
// 注释会显示为灰色斜体
var name = "张三";  // 字符串显示为深蓝色
var age = 25;       // 数字显示为蓝色
var isActive = true; // 关键字显示为红色粗体

function greet() {   // function 关键字红色粗体
    console.log("Hello"); // console 显示为紫色
    return age;      // return 关键字红色粗体
}

/* 多行注释
   也会显示为
   灰色斜体 */
```

## 技术实现

### MarkdownRenderer

负责将 Markdown 文本转换为 Android SpannableString：
- 解析 Markdown 语法
- 应用文本样式（粗体、斜体）
- 处理行内代码
- 处理标题和列表

### CodeHighlighter

负责为代码添加语法高亮：
- 词法分析识别代码元素
- 应用不同颜色的 ForegroundColorSpan
- 应用样式（粗体、斜体）
- 使用等宽字体

### 渲染流程

1. **解析消息**：将消息分为文本块和代码块
2. **渲染文本**：使用 MarkdownRenderer 渲染普通文本
3. **渲染代码**：使用 CodeHighlighter 高亮代码
4. **应用样式**：设置颜色、字体、间距等

## 配置

### 修改高亮颜色

编辑 `code_highlighter.js`：

```javascript
this.colors = {
    keyword: '#CF222E',      // 关键字颜色
    string: '#0A3069',       // 字符串颜色
    comment: '#6E7781',      // 注释颜色
    number: '#0550AE',       // 数字颜色
    function: '#8250DF',     // 函数颜色
    default: '#24292F'       // 默认颜色
};
```

### 添加关键字

编辑 `code_highlighter.js`：

```javascript
this.keywords = [
    'var', 'let', 'const', 'function',
    // 添加更多关键字...
];
```

### 添加内置函数

编辑 `code_highlighter.js`：

```javascript
this.builtins = [
    'console', 'toast', 'sleep',
    // 添加更多内置函数...
];
```

## 测试

运行 `test_markdown_highlight.js` 查看：
- Markdown 基础格式效果
- 行内代码效果
- JavaScript 代码高亮效果
- 复杂代码示例

## 注意事项

1. **性能**：大量代码可能影响渲染性能，建议代码块不超过 200 行
2. **语言支持**：目前主要优化了 JavaScript，其他语言会使用基础高亮
3. **颜色对比**：确保高亮颜色在浅色和深色背景下都清晰可见
4. **等宽字体**：代码自动使用 monospace 字体，确保对齐

## 优势

- **统一体验**：用户和 AI 消息都支持 Markdown
- **代码清晰**：语法高亮让代码更易读
- **专业外观**：类似 GitHub 的代码高亮风格
- **可扩展**：易于添加新的语言支持

## 未来改进

- [ ] 支持更多编程语言（Python, Java, etc.）
- [ ] 支持代码行号显示
- [ ] 支持代码复制按钮
- [ ] 支持深色主题的高亮配色
- [ ] 支持更多 Markdown 语法（表格、链接等）
