# AutoClaw - 演示脚本

本文件包含AutoClaw应用的演示脚本，用于展示应用功能和测试运行环境。

## 🎬 演示脚本列表

### 1. 基础功能演示
```javascript
// demo_basic.js
console.show();
console.log("🚀 AutoClaw 基础功能演示");
console.log("=".repeat(50));

// 检查环境
console.log("📱 检查运行环境:");
console.log("  AutoX.js版本: " + (typeof app !== 'undefined' ? app.version : '未知'));
console.log("  设备型号: " + device.model);
console.log("  Android版本: " + device.release);
console.log("  屏幕分辨率: " + device.width + "x" + device.height);

// 模拟任务创建
console.log("\n📝 模拟任务创建:");
const mockTasks = [
    { name: "微信自动回复", status: "idle", runCount: 0 },
    { name: "抖音自动点赞", status: "running", runCount: 5 },
    { name: "清理垃圾文件", status: "success", runCount: 12 }
];

mockTasks.forEach((task, index) => {
    console.log(`  ${index + 1}. ${task.name} - 状态: ${task.status} - 执行次数: ${task.runCount}`);
});

console.log("\n✅ 基础功能演示完成");
```

### 2. UI界面演示
```javascript
// demo_ui.js
ui.layout(`
    <vertical padding="32" gravity="center">
        <text text="🎬 AutoClaw UI演示" textSize="24sp" textColor="#2196F3"/>
        
        <!-- 任务卡片演示 -->
        <card w="*" h="auto" margin="16" elevation="4">
            <vertical padding="16">
                <horizontal>
                    <vertical layout_weight="1">
                        <text text="微信自动回复" textSize="18sp" textColor="#212121"/>
                        <text text="自动回复微信消息" textSize="14sp" textColor="#757575" marginTop="4"/>
                    </vertical>
                    <text text="待执行" textSize="12sp" textColor="#FF9800" padding="4 8" bg="#FFF3E0" cornerRadius="12"/>
                </horizontal>
                <horizontal marginTop="8">
                    <text text="最后执行: 2026-03-17 10:30" textSize="12sp" textColor="#9E9E9E"/>
                    <text text="执行 0 次" textSize="12sp" textColor="#9E9E9E" layout_weight="1" gravity="right"/>
                </horizontal>
                <horizontal marginTop="8">
                    <button id="btn_run" text="执行" layout_weight="1" marginRight="4"/>
                    <button id="btn_manage" text="管理" layout_weight="1" marginLeft="4"/>
                </horizontal>
            </vertical>
        </card>
        
        <!-- 状态标签演示 -->
        <horizontal marginTop="16">
            <text text="待执行" textSize="14sp" textColor="#FF9800" padding="8 16" bg="#FFF3E0" cornerRadius="20" marginRight="8"/>
            <text text="执行中" textSize="14sp" textColor="#2196F3" padding="8 16" bg="#E3F2FD" cornerRadius="20" marginRight="8"/>
            <text text="成功" textSize="14sp" textColor="#4CAF50" padding="8 16" bg="#E8F5E9" cornerRadius="20" marginRight="8"/>
            <text text="失败" textSize="14sp" textColor="#F44336" padding="8 16" bg="#FFEBEE" cornerRadius="20"/>
        </horizontal>
        
        <!-- 操作按钮 -->
        <button id="btn_start" text="启动应用" marginTop="32" style="Widget.AppCompat.Button.Colored"/>
    </vertical>
`);

ui.btn_run.on('click', () => {
    toast("执行任务");
});

ui.btn_manage.on('click', () => {
    toast("管理任务");
});

ui.btn_start.on('click', () => {
    engines.execScriptFile(files.path('./main.js'));
});
```

### 3. 市场功能演示
```javascript
// demo_market.js
console.show();
console.log("🛒 AutoClaw 市场功能演示");
console.log("=".repeat(50));

// 模拟市场数据
const marketTasks = [
    {
        name: "微信自动回复",
        author: "张三",
        description: "自动回复微信消息，支持关键词匹配",
        downloads: 12345,
        rating: 4.7
    },
    {
        name: "抖音自动点赞", 
        author: "李四",
        description: "自动点赞推荐视频，增加账号活跃度",
        downloads: 8567,
        rating: 4.3
    },
    {
        name: "智能清理垃圾文件",
        author: "王五",
        description: "自动扫描并清理手机垃圾文件",
        downloads: 21034,
        rating: 4.8
    }
];

console.log("📋 市场任务列表:");
marketTasks.forEach((task, index) => {
    console.log(`\n${index + 1}. ${task.name}`);
    console.log(`   作者: ${task.author}`);
    console.log(`   描述: ${task.description}`);
    console.log(`   下载量: ${task.downloads}次`);
    console.log(`   评分: ${task.rating}⭐`);
});

console.log("\n🔍 搜索功能演示:");
const searchKeyword = "微信";
const searchResults = marketTasks.filter(task => 
    task.name.includes(searchKeyword) || 
    task.description.includes(searchKeyword)
);

console.log(`搜索"${searchKeyword}"，找到${searchResults.length}个结果`);

console.log("\n✅ 市场功能演示完成");
```

### 4. 数据管理演示
```javascript
// demo_data.js
console.show();
console.log("💾 AutoClaw 数据管理演示");
console.log("=".repeat(50));

// 模拟数据存储
const storageName = 'autoclaw_demo_data';
const demoStorage = storages.create(storageName);

// 保存数据
const demoData = {
    tasks: [
        { id: 'task_001', name: '演示任务1', status: 'idle' },
        { id: 'task_002', name: '演示任务2', status: 'success' }
    ],
    settings: {
        theme: 'light',
        autoBackup: true,
        notification: true
    },
    stats: {
        totalTasks: 2,
        completedTasks: 1,
        totalRunCount: 15
    }
};

demoStorage.put('app_data', demoData);
console.log("💾 数据保存成功");

// 读取数据
const loadedData = demoStorage.get('app_data');
console.log("\n📖 读取数据:");
console.log("  任务数量: " + loadedData.tasks.length);
console.log("  设置主题: " + loadedData.settings.theme);
console.log("  统计信息: " + loadedData.stats.totalTasks + "个任务，执行" + loadedData.stats.totalRunCount + "次");

// 备份数据
const backupDir = '/sdcard/AutoClaw/demo_backups/';
files.ensureDir(backupDir);
const backupFile = backupDir + 'demo_backup_' + Date.now() + '.json';
files.write(backupFile, JSON.stringify(loadedData, null, 2));
console.log("\n📤 数据备份成功: " + backupFile);

// 清理演示数据
demoStorage.clear();
console.log("\n🧹 演示数据清理完成");

console.log("\n✅ 数据管理演示完成");
```

## 🚀 如何使用演示脚本

### 方法1: 在AutoX.js中直接运行
1. 打开AutoX.js应用
2. 点击"新建脚本"
3. 复制粘贴演示脚本
4. 点击运行

### 方法2: 保存为文件运行
1. 将演示脚本保存为.js文件
2. 导入到AutoX.js
3. 点击运行

### 方法3: 集成测试
1. 运行 `test_runner.js` 进行综合测试
2. 运行 `test_simple.js` 进行简单测试
3. 运行 `test_quick.js` 进行快速测试

## 📊 演示脚本功能说明

### 基础功能演示 (demo_basic.js)
- 环境检查
- 设备信息获取
- 模拟任务数据
- 控制台输出

### UI界面演示 (demo_ui.js)
- Material Design界面
- 任务卡片展示
- 状态标签显示
- 按钮交互

### 市场功能演示 (demo_market.js)
- 市场任务列表
- 搜索功能
- 任务详情
- 评分和下载量

### 数据管理演示 (demo_data.js)
- 数据存储和读取
- 设置管理
- 数据备份
- 统计信息

## 🔧 自定义演示

你可以修改演示脚本中的以下内容：

1. **任务数据** - 修改 `mockTasks` 数组
2. **UI样式** - 修改颜色、布局等
3. **市场数据** - 修改 `marketTasks` 数组
4. **测试逻辑** - 添加自定义测试用例

## 🐛 故障排除

### 常见问题
1. **脚本无法运行** - 检查AutoX.js版本和权限
2. **UI不显示** - 检查布局语法
3. **数据保存失败** - 检查存储权限
4. **文件操作失败** - 检查文件路径权限

### 调试建议
1. 使用 `console.show()` 查看日志
2. 逐步运行脚本片段
3. 检查错误信息
4. 验证文件路径

## 📈 扩展演示

你可以基于这些演示脚本创建：
1. **自动化测试套件** - 集成所有功能测试
2. **性能测试** - 测试应用响应速度
3. **兼容性测试** - 测试不同设备兼容性
4. **压力测试** - 测试大数据量处理能力

---

**演示脚本状态**: ✅ 就绪  
**兼容性**: 🟢 支持AutoX.js v6+  
**使用难度**: 🟢 简单，直接复制运行  
**扩展性**: 🟡 中等，可自定义修改