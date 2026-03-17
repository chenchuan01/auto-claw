# ES5 快速参考 - AutoX.js 开发

## 快速对照表

| ES6+ 写法 | ES5 写法 |
|-----------|----------|
| `class MyClass {}` | `function MyClass() {}` |
| `const x = 1` | `var x = 1` |
| `let x = 1` | `var x = 1` |
| `() => {}` | `function() {}` |
| `for (const item of arr)` | `for (var i = 0; i < arr.length; i++)` |
| `new Map()` | `{}` |
| `new Set()` | `[]` 或 `{}` |
| `async/await` | 同步调用或回调 |
| `const {a, b} = obj` | `var a = obj.a; var b = obj.b;` |
| `[...arr]` | `arr.slice()` |
| `{...obj}` | 手动复制属性 |

## 常用模式

### 1. 构造函数模式

```javascript
// 定义构造函数
function TaskManager(config) {
    this.config = config;
    this.tasks = [];
}

// 添加方法
TaskManager.prototype.addTask = function(task) {
    this.tasks.push(task);
};

TaskManager.prototype.getTasks = function() {
    return this.tasks;
};

// 使用
var manager = new TaskManager({ debug: true });
manager.addTask({ name: 'task1' });
```

### 2. 事件处理器中的 this

```javascript
function UIManager() {
    this.count = 0;
}

UIManager.prototype.bindEvents = function() {
    var self = this;  // 保存 this 引用

    ui.btn.on('click', function() {
        self.count++;  // 使用 self 而不是 this
        console.log(self.count);
    });
};
```

### 3. 数组遍历

```javascript
// 方式 1: 传统 for 循环
for (var i = 0; i < arr.length; i++) {
    var item = arr[i];
    console.log(item);
}

// 方式 2: forEach（推荐）
arr.forEach(function(item, index) {
    console.log(item, index);
});

// 方式 3: for...in（对象遍历）
for (var key in obj) {
    if (!obj.hasOwnProperty(key)) continue;
    var value = obj[key];
    console.log(key, value);
}
```

### 4. 对象操作

```javascript
// 创建对象
var obj = {
    name: 'test',
    value: 123
};

// 复制对象
var newObj = {};
for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
        newObj[key] = obj[key];
    }
}

// 合并对象
function extend(target, source) {
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            target[key] = source[key];
        }
    }
    return target;
}
```

### 5. 数组操作

```javascript
// 复制数组
var newArr = arr.slice();

// 添加元素
arr.push(item);

// 过滤
var filtered = arr.filter(function(item) {
    return item.active;
});

// 映射
var mapped = arr.map(function(item) {
    return item.name;
});

// 查找
var found = arr.find(function(item) {
    return item.id === targetId;
});
```

### 6. 字符串拼接

```javascript
// 简单拼接
var msg = 'Hello ' + name + '!';

// 多行拼接
var html =
    '<div>' +
    '  <h1>' + title + '</h1>' +
    '  <p>' + content + '</p>' +
    '</div>';

// 数组 join
var parts = ['Hello', name, '!'];
var msg = parts.join(' ');
```

### 7. XML 布局构建

```javascript
// 静态布局
ui.layout(
    '<vertical>' +
    '  <text text="标题" textSize="20sp"/>' +
    '  <button id="btn" text="按钮"/>' +
    '</vertical>'
);

// 动态内容
ui.layout(
    '<vertical>' +
    '  <text id="title"/>' +
    '  <text id="content"/>' +
    '</vertical>'
);

ui.title.setText(titleText);
ui.content.setText(contentText);
```

### 8. 模块导出

```javascript
// 导出构造函数
function MyModule() {
    this.data = [];
}

MyModule.prototype.getData = function() {
    return this.data;
};

module.exports = MyModule;

// 使用
var MyModule = require('./my_module');
var instance = new MyModule();
```

### 9. 错误处理

```javascript
try {
    var result = doSomething();
    if (!result) {
        throw new Error('操作失败');
    }
} catch (e) {
    console.error('错误:', e.message);
    toast('发生错误: ' + e.message);
} finally {
    cleanup();
}
```

### 10. 条件判断

```javascript
// 简单判断
var status = isActive ? 'active' : 'inactive';

// 多条件
var result;
if (condition1) {
    result = 'case1';
} else if (condition2) {
    result = 'case2';
} else {
    result = 'default';
}

// 默认值
var value = input || 'default';
var count = options.count || 0;
```

## 常见陷阱

### 1. 变量作用域

```javascript
// ❌ 错误：循环中的闭包问题
for (var i = 0; i < 3; i++) {
    setTimeout(function() {
        console.log(i);  // 输出 3, 3, 3
    }, 100);
}

// ✅ 正确：使用 IIFE
for (var i = 0; i < 3; i++) {
    (function(index) {
        setTimeout(function() {
            console.log(index);  // 输出 0, 1, 2
        }, 100);
    })(i);
}
```

### 2. this 绑定

```javascript
// ❌ 错误：this 丢失
ui.btn.on('click', this.handleClick);

// ✅ 正确：保存 this
var self = this;
ui.btn.on('click', function() {
    self.handleClick();
});
```

### 3. 数组方法返回值

```javascript
// forEach 没有返回值
var result = arr.forEach(function(item) {
    return item * 2;  // 无效
});

// 使用 map
var result = arr.map(function(item) {
    return item * 2;  // 有效
});
```

## 性能优化

### 1. 缓存长度

```javascript
// ❌ 每次都计算长度
for (var i = 0; i < arr.length; i++) {
    // ...
}

// ✅ 缓存长度
for (var i = 0, len = arr.length; i < len; i++) {
    // ...
}
```

### 2. 避免重复查找

```javascript
// ❌ 重复查找 DOM
ui.text1.setText('a');
ui.text1.setTextColor('#000');
ui.text1.setTextSize(16);

// ✅ 缓存引用
var text = ui.text1;
text.setText('a');
text.setTextColor('#000');
text.setTextSize(16);
```

### 3. 字符串拼接优化

```javascript
// ❌ 大量拼接
var str = '';
for (var i = 0; i < 1000; i++) {
    str += i + ',';
}

// ✅ 使用数组
var arr = [];
for (var i = 0; i < 1000; i++) {
    arr.push(i);
}
var str = arr.join(',');
```

## 调试技巧

```javascript
// 1. 控制台输出
console.log('变量值:', variable);
console.error('错误信息:', error);
console.show();  // 显示控制台

// 2. 类型检查
console.log(typeof variable);
console.log(variable instanceof Array);

// 3. 对象查看
console.log(JSON.stringify(obj, null, 2));

// 4. 断点调试（使用 toast）
toast('执行到这里');
sleep(1000);

// 5. 性能测试
var start = Date.now();
doSomething();
var end = Date.now();
console.log('耗时:', end - start, 'ms');
```

## 记住这些

1. **永远使用 `var`**
2. **永远使用 `function`**
3. **永远使用传统 for 循环或 forEach**
4. **XML 中不要用模板字符串插值**
5. **事件处理器中用 `var self = this`**
6. **对象用 `{}`，不用 `new Map()`**
7. **数组用 `[]`，不用 `new Set()`**
8. **不要用 `async/await`**
9. **不要用解构赋值**
10. **不要用展开运算符**
