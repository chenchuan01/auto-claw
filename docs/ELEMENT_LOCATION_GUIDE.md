# AutoX.js 元素定位最佳实践指南

本文档总结了 AutoX.js 自动化脚本中元素定位的最佳实践，帮助开发者编写更稳定、更易维护的自动化脚本。

## 核心原则

**稳定性优先**：选择定位策略时，优先考虑应用更新后仍能正常工作的方式。

**定位策略优先级**（从高到低）：
1. 文本内容定位 ⭐⭐⭐⭐⭐
2. 内容描述定位 ⭐⭐⭐⭐
3. 类名+层级定位 ⭐⭐⭐
4. 相对坐标定位 ⭐⭐
5. ID 定位 ⭐（最后手段）

---

## 1. 文本内容定位（最推荐）

### 优点
- **最稳定**：应用更新通常不会改变按钮文字
- **可读性强**：代码一眼就能看懂要点击什么
- **无需维护**：几乎不需要因应用更新而修改

### 基本用法

```javascript
// 精确匹配文本
text("发送").waitFor();
text("发送").findOne().click();

// 模糊匹配（包含关键字）
textContains("发送").findOne(5000).click();

// 正则匹配
textMatches(/发送|提交/).findOne().click();
```

### 组合定位（更精确）

```javascript
// 文本 + 类名
text("发送").className("Button").findOne().click();

// 文本 + 父容器
var container = id("message_area").findOne();
container.findOne(text("发送")).click();
```

### 最佳实践

```javascript
// ✅ 推荐：先等待，再查找，再点击
text("发送").waitFor();
var btn = text("发送").findOne(5000);
if (btn) {
    btn.click();
} else {
    toast("未找到发送按钮");
}

// ❌ 不推荐：直接点击，可能失败
text("发送").click();
```

---

## 2. 内容描述定位

### 优点
- 适用于无文字的图标按钮
- 利用无障碍描述（content-desc）
- 稳定性仅次于文本定位

### 基本用法

```javascript
// 精确匹配描述
desc("返回").findOne(5000).click();

// 模糊匹配
descContains("返回").findOne().click();

// 正则匹配
descMatches(/返回|back/).findOne().click();
```

### 适用场景

```javascript
// 图标按钮（如返回、设置、更多）
desc("返回").waitFor();
desc("返回").findOne().click();

// 组合定位
desc("设置").className("ImageButton").findOne().click();
```

---

## 3. 类名+层级定位

### 优点
- 适用于动态内容（如列表项）
- 可通过层级关系精确定位
- 不依赖文本内容

### 基本用法

```javascript
// 通过类名查找
className("TextView").findOne().click();

// 通过父子关系
var list = className("RecyclerView").findOne();
var firstItem = list.child(0);
firstItem.click();

// 通过兄弟关系
var parent = className("LinearLayout").findOne();
var children = parent.children();
children[1].click(); // 点击第二个子元素
```

### 组合定位

```javascript
// 类名 + 文本
className("TextView").text("消息").findOne().click();

// 类名 + 索引
className("RecyclerView").findOne().child(2).click();

// 多层嵌套
var container = id("main_container").findOne();
var item = container.findOne(className("TextView").textContains("通知"));
item.parent().click(); // 点击父容器
```

---

## 4. 相对坐标定位

### 优点
- 适配不同屏幕尺寸
- 适用于无法通过控件定位的场景
- 可模拟真人点击（随机偏移）

### 何时使用
- 元素没有文字和描述
- 文本定位不唯一
- 控件层级复杂难以定位

### 标准格式（由坐标拾取器生成）

```javascript
// 使用设备宽高比例
var x = parseInt(device.width * 0.5000);   // 水平比例
var y = parseInt(device.height * 0.8500);  // 垂直比例

// 加入随机偏移，模拟真人点击，增加容错
x = x + (Math.random() > 0.5 ? 1 : -1) * parseInt(Math.random() * 8);
y = y + (Math.random() > 0.5 ? 1 : -1) * parseInt(Math.random() * 8);

click(x, y);
```

### 坐标拾取器使用流程

1. 在 AI 对话界面点击【📍 拾取坐标到对话】按钮
2. 屏幕出现十字准星悬浮窗
3. 拖动准星到目标位置
4. 松开手指，点击拾取
5. 相对坐标自动插入到对话框
6. 发送给 AI，AI 会生成相应的点击代码

### 容错范围说明

- 容错范围：屏幕宽高的 0.8%（约 6~10px）
- 1080p 屏幕：约 ±8px
- 720p 屏幕：约 ±6px
- 随机偏移模拟真人点击，避免被检测

---

## 5. ID 定位（最后手段）

### 缺点
- **极不稳定**：应用更新后 ID 经常变化
- **难以维护**：ID 变化后脚本立即失效
- **可读性差**：ID 通常是混淆后的字符串

### 何时使用
- 前四种方式均无法定位
- 临时测试脚本
- 确认 ID 不会变化的场景

### 基本用法

```javascript
// 必须加注释说明 ID 来源和用途
id("send_btn").findOne(5000).click(); // 发送按钮，ID 可能随版本变化

// 组合定位降低风险
id("message_area").findOne().findOne(text("发送")).click();
```

### 风险提示

```javascript
// ❌ 高风险：纯 ID 定位
id("nh5").findOne().click();

// ✅ 降低风险：ID + 文本
id("nh5").findOne().findOne(text("菜单")).click();

// ✅ 更好：优先文本定位
text("菜单").waitFor();
text("菜单").findOne().click();
```

---

## 等待与重试机制

### 等待元素出现

```javascript
// 方式1：waitFor（推荐，会阻塞直到出现）
text("消息").waitFor();
text("消息").findOne().click();

// 方式2：带超时的查找（推荐，5秒超时）
var btn = text("发送").findOne(5000);
if (btn) {
    btn.click();
} else {
    toast("未找到发送按钮");
}

// 方式3：循环等待（适用于复杂场景）
var maxRetry = 10;
var btn = null;
for (var i = 0; i < maxRetry; i++) {
    btn = text("发送").findOne(1000);
    if (btn) break;
    sleep(500);
}
if (btn) btn.click();
```

### 重试点击

```javascript
// 适用于点击可能失败的场景
while (!click("发送")) {
    sleep(200);
}

// 带超时的重试
var success = false;
var maxRetry = 5;
for (var i = 0; i < maxRetry; i++) {
    if (click("发送")) {
        success = true;
        break;
    }
    sleep(300);
}
if (!success) {
    toast("点击失败");
}
```

### 操作间延迟

```javascript
// 短暂等待（等待动画完成）
sleep(500);

// 等待页面加载
sleep(2000);

// 等待网络请求
sleep(3000);
```

---

## 实战案例：企业微信自动打卡

以下是从实际项目中提炼的最佳实践：

```javascript
"auto";

// 全局变量：收集执行信息
var tips = "";

// 解锁手机
function unlockPhone() {
    var code = "150418";
    device.wakeUpIfNeeded();
    sleep(500);
    swipe(300, 900, 300, 200, 1000);
    
    text("0").waitFor();
    code.split('').forEach(function(c) {
        sleep(300);
        while (!click(c)); // 重试点击
    });
    
    sleep(300);
    var numZero = text("0").findOne().bounds();
    while (!click(numZero.centerX() + 200, numZero.centerY()));
    
    sleep(300);
    home();
}

// 切换企微账号
function switchAccount(account) {
    tips = tips + account + "\n";
    
    // 等待菜单按钮出现
    text("菜单").waitFor();
    text("菜单").findOne().click();
    
    sleep(800);
    
    // 检查账号是否已选中
    var ac = text(account).find();
    if (ac.size() > 1) {
        back(); // 已选中，返回
    } else {
        click(account); // 切换账号
    }
    
    sleep(2000);
}

// 获取消息列表中的聊天数字
function getMsgChatNum(isLastday) {
    if (isLastday) {
        var msgTimes = className("TextView").find();
        var times = [];
        msgTimes.forEach(function(i) {
            if (i.text()) {
                times.push(i.text());
            }
        });
        if (times.length > 1) {
            var lastTime = times[times.length - 1];
            log(lastTime);
            isLastday = lastTime.indexOf("昨天") != -1;
        }
    }
    
    if (isLastday) return "1";
    
    var nums = [];
    var msgs = className("TextView").find();
    
    msgs.forEach(function(i) {
        var m = i.text();
        if (m && m.match(/^\d+$/) && !m.match(/^0*$/)) {
            var n = parseInt(m);
            if (n < 80 && nums.indexOf(n) <= 0) {
                nums.push(n);
            }
        }
    });
    
    tips = tips + "nums=>" + nums + "\n";
    
    if (nums && nums.length > 0) {
        return "" + (nums[nums.length - 1] + 1);
    }
    return "1";
}

// 执行活跃任务
function activityTask(task) {
    switchAccount(task);
    
    sleep(5000);
    
    // 等待消息列表加载
    text("消息").waitFor();
    
    var msgTime = className("TextView").findOne().text();
    tips = tips + msgTime + "\n";
    
    var isLastday = msgTime.indexOf("昨天") != -1;
    
    var groupName = task == "卖家精灵" ? "云雅团队群" : "重庆云雅";
    while (!click(groupName));
    
    // 等待输入框出现
    desc("输入框").waitFor();
    var editBox = desc("输入框").findOne();
    editBox.setText("");
    
    var n = getMsgChatNum(isLastday);
    input(n);
    tips = tips + n + "\n";
    
    while (!click("发送"));
    
    sleep(500);
    back();
}

function main() {
    home();
    
    if (!device.isScreenOn()) {
        unlockPhone();
        sleep(300);
    }
    
    // 启动应用
    launchApp("企业微信");
    text("消息").waitFor();
    
    // 执行任务
    activityTask("卖家精灵");
    activityTask("优麦云");
    
    tips = tips + "打卡完成^-^!";
    console.info(tips);
    
    home();
}

main();
```

### 案例要点总结

1. **优先文本定位**：`text("消息").waitFor()` 而不是 `id("xxx")`
2. **重试机制**：`while (!click(groupName))` 确保点击成功
3. **等待机制**：`text("消息").waitFor()` 确保元素已加载
4. **信息收集**：使用 `tips` 变量收集执行过程，便于调试
5. **函数拆分**：每个函数职责单一，便于维护
6. **延迟控制**：操作间加入 `sleep()` 等待界面响应

---

## 总结

### 定位策略选择流程

```
开始
  ↓
元素有可见文字？
  ├─ 是 → 使用 text() 定位 ✅
  └─ 否 ↓
元素有 content-desc？
  ├─ 是 → 使用 desc() 定位 ✅
  └─ 否 ↓
可通过类名+层级定位？
  ├─ 是 → 使用 className() + 层级 ✅
  └─ 否 ↓
使用坐标拾取器获取相对坐标 ⚠️
  ↓
最后手段：ID 定位（需加注释说明风险）❌
```

### 核心建议

1. **永远优先文本定位**
2. **避免使用 ID 定位**
3. **使用 waitFor() 等待元素**
4. **加入重试机制**
5. **操作间加延迟**
6. **函数职责单一**
7. **收集执行信息**
8. **代码加注释**

---

## 相关文档

- [ES5 语法快速参考](./ES5_QUICK_REFERENCE.md)
- [代码风格指南](./CODE_STYLE.md)
- [兼容性说明](./COMPATIBILITY.md)
