# AutoX.js Rhino 引擎兼容性开发指南

## 概述

AutoX.js v6 使用 **Rhino JS 引擎**，这是一个 ES5 兼容的 JavaScript 引擎，对 ES6+ 特性支持有限。本文档详细说明了开发过程中必须遵守的兼容性规则。

## 核心原则

**所有代码必须使用 ES5 语法编写，避免使用任何 ES6+ 特性。**

## 语法兼容性对照表

| 语法特性 | 支持情况 | 使用建议 | 示例 |
|---------|---------|---------|------|
| `class` 关键字 | ❌ 不支持 | 使用构造函数 + prototype | 见下文 |
| `async/await` | ❌ 不支持 | 使用同步调用或回调 | 见下文 |
| `Promise` | ❌ 不支持 | 使用回调函数 | 见下文 |
| `new Map()` | ❌ 不支持 | 使用普通对象 `{}` | 见下文 |
| `new Set()` | ❌ 不支持 | 使用数组或对象模拟 | 见下文 |
| `for...of` | ❌ 不支持 | 使用传统 for 循环 | 见下文 |
| `const/let` | ⚠️ 不稳定 | **统一使用 `var`** | `var x = 1;` |
| 箭头函数 | ⚠️ 不稳定 | **统一使用 `function`** | `function() {}` |
| 模板字符串（普通） | ✅ 支持 | 可以使用 | `` `hello ${name}` `` |
| 模板字符串（XML） | ❌ 有问题 | **禁止在 XML 中使用** | 见下文 |
| 解构赋值 | ❌ 不支持 | 逐个赋值 | 见下文 |
| 展开运算符 `...` | ⚠️ 部分支持 | 避免使用 | 见下文 |
| `Array.find()` | ✅ 支持 | 可以使用 | `arr.find(fn)` |
| `Array.forEach()` | ✅ 支持 | 可以使用 | `arr.forEach(fn)` |
| `Array.map()` | ✅ 支持 | 可以使用 | `arr.map(fn)` |
| `Array.filter()` | ✅ 支持 | 可以使用 | `arr.filter(fn)` |

## 详细转换规则

### 1. Class → 构造函数 + Prototype

**❌ 错误写法（ES6 Class）：**
```javascript
class DataManager {
    constructor() {
        this.data = [];
    }

    getData() {
        return this.data;
    }

    addData(item) {
        this.data.push(item);
    }
}
```

**✅ 正确写法（ES5 构造函数）：**
```javascript
function DataManager() {
    this.data = [];
}

DataManager.prototype.getData = function() {
    return this.data;
};

DataManager.prototype.addData = function(item) {
    this.data.push(item);
};
```

### 2. 箭头函数 → 普通函数

**❌ 错误写法：**
```javascript
setTimeout(() => {
    console.log('hello');
}, 1000);

ui.btn.on('click', () => {
    this.doSomething();
});
```

**✅ 正确写法：**
```javascript
var self = this;

setTimeout(function() {
    console.log('hello');
}, 1000);

ui.btn.on('click', function() {
    self.doSomething();
});
```

### 3. const/let → var

**❌ 错误写法：**
```javascript
const MAX_COUNT = 100;
let currentCount = 0;

for (let i = 0; i < 10; i++) {
    console.log(i);
}
```

**✅ 正确写法：**
```javascript
var MAX_COUNT = 100;
var currentCount = 0;

for (var i = 0; i < 10; i++) {
    console.log(i);
}
```

### 4. for...of → 传统 for 循环

**❌ 错误写法：**
```javascript
for (const item of items) {
    console.log(item);
}

for (const [key, value] of Object.entries(obj)) {
    console.log(key, value);
}
```

**✅ 正确写法：**
```javascript
for (var i = 0; i < items.length; i++) {
    var item = items[i];
    console.log(item);
}

for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    var value = obj[key];
    console.log(key, value);
}
```

### 5. Map → 普通对象

**❌ 错误写法：**
```javascript
var map = new Map();
map.set('key1', 'value1');
map.set('key2', 'value2');
var value = map.get('key1');
map.delete('key2');
```

**✅ 正确写法：**
```javascript
var map = {};
map['key1'] = 'value1';
map['key2'] = 'value2';
var value = map['key1'];
delete map['key2'];
```

### 6. async/await → 同步调用

**❌ 错误写法：**
```javascript
async function fetchData() {
    const response = await http.get(url);
    return response.body.json();
}
```

**✅ 正确写法：**
```javascript
function fetchData() {
    var response = http.get(url);
    return response.body.json();
}
```

### 7. 解构赋值 → 逐个赋值

**❌ 错误写法：**
```javascript
const { name, age } = user;
const [first, second] = array;
```

**✅ 正确写法：**
```javascript
var name = user.name;
var age = user.age;
var first = array[0];
var second = array[1];
```

### 8. 模板字符串在 XML 中的使用

**❌ 错误写法（会导致 XML 解析错误）：**
```javascript
ui.layout(`
    <vertical>
        <text text="${message}"/>
        <text text="用户: ${user.name}"/>
    </vertical>
`);
```

**✅ 正确写法（方案一：字符串拼接）：**
```javascript
ui.layout(
    '<vertical>' +
    '  <text text="' + message + '"/>' +
    '  <text text="用户: ' + user.name + '"/>' +
    '</vertical>'
);
```

**✅ 正确写法（方案二：动态设置）：**
```javascript
ui.layout(
    '<vertical>' +
    '  <text id="msg"/>' +
    '  <text id="username"/>' +
    '</vertical>'
);

ui.msg.setText(message);
ui.username.setText('用户: ' + user.name);
```

### 9. 展开运算符 → 手动复制

**❌ 错误写法：**
```javascript
var newObj = { ...oldObj, newProp: 'value' };
var newArr = [...oldArr, newItem];
```

**✅ 正确写法：**
```javascript
var newObj = {};
for (var key in oldObj) {
    if (oldObj.hasOwnProperty(key)) {
        newObj[key] = oldObj[key];
    }
}
newObj.newProp = 'value';

var newArr = oldArr.slice();
newArr.push(newItem);
```

## UI 布局特殊注意事项

### XML 字符串构建规则

1. **禁止使用模板字符串**
   ```javascript
   // ❌ 错误
   ui.layout(`<text text="${msg}"/>`);

   // ✅ 正确
   ui.layout('<text id="msg"/>');
   ui.msg.setText(msg);
   ```

2. **字符串拼接要小心引号**
   ```javascript
   // ✅ 正确
   ui.layout(
       '<text text="' + message + '" ' +
       'textSize="16sp" ' +
       'textColor="#000000"/>'
   );
   ```

3. **动态内容优先用 setText()**
   ```javascript
   // ✅ 推荐方式
   ui.layout('<text id="dynamic_text"/>');
   ui.dynamic_text.setText(dynamicContent);
   ```

## 常见错误及解决方案

### 错误 1: identifier is a reserved word: class

**原因：** 使用了 `class` 关键字

**解决：** 改为构造函数 + prototype 模式

### 错误 2: SAXParseException: Attr.value missing

**原因：** XML 中使用了模板字符串插值 `${}`

**解决：** 改为字符串拼接或动态设置

### 错误 3: Map is not defined

**原因：** 使用了 `new Map()`

**解决：** 改为普通对象 `{}`

### 错误 4: for...of is not supported

**原因：** 使用了 `for...of` 循环

**解决：** 改为传统 for 循环

## 开发检查清单

在提交代码前，请确认：

- [ ] 没有使用 `class` 关键字
- [ ] 没有使用 `async/await`
- [ ] 没有使用 `new Map()` 或 `new Set()`
- [ ] 没有使用 `for...of` 循环
- [ ] 所有变量使用 `var` 声明
- [ ] 所有函数使用 `function` 关键字
- [ ] XML 布局没有使用模板字符串插值
- [ ] 事件处理器中正确使用 `var self = this`
- [ ] 没有使用解构赋值
- [ ] 没有使用展开运算符

## 已转换文件列表

以下文件已完成 ES5 兼容性转换：

- ✅ `main.js` - 主入口文件
- ✅ `modules/config.js` - 配置模块
- ✅ `modules/data_manager.js` - 数据管理模块
- ✅ `modules/task_executor.js` - 任务执行器
- ✅ `modules/market_service.js` - 市场服务
- ✅ `modules/ui_manager_complete.js` - UI 管理器

## 参考资源

- [AutoX.js 官方文档](https://github.com/kkevsekk1/AutoX)
- [Rhino JavaScript 引擎文档](https://mozilla.github.io/rhino/)
- [ES5 规范](https://es5.github.io/)

## 更新日志

- 2026-03-17: 初始版本，完成所有核心模块的 ES5 转换
