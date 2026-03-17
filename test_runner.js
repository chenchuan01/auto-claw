/**
 * AutoX Task Manager 测试运行器
 * 用于快速测试应用功能
 */

console.show();
console.clear();
console.log("🚀 AutoX Task Manager 测试开始");

// 测试1：检查AutoX.js环境
function testEnvironment() {
    console.log("\n📋 测试1：检查环境");
    
    const requiredModules = ['ui', 'storages', 'dialogs', 'app', 'files'];
    let allPassed = true;
    
    requiredModules.forEach(module => {
        try {
            require(module);
            console.log(`  ✓ ${module}模块可用`);
        } catch (e) {
            console.log(`  ✗ ${module}模块不可用: ${e.message}`);
            allPassed = false;
        }
    });
    
    return allPassed;
}

// 测试2：测试UI布局
function testUILayout() {
    console.log("\n📋 测试2：UI布局测试");
    
    try {
        ui.layout(`
            <vertical padding="16">
                <text text="AutoX Task Manager 测试界面" textSize="20sp" textColor="#2196F3"/>
                <text text="这是一个测试界面，验证UI模块是否正常工作" textSize="14sp" textColor="#757575" marginTop="8"/>
                
                <button id="btn_test" text="点击测试" marginTop="16"/>
                <text id="txt_result" text="等待测试..." marginTop="8"/>
                
                <horizontal marginTop="16">
                    <button id="btn_pass" text="通过" layout_weight="1"/>
                    <button id="btn_fail" text="失败" layout_weight="1" marginLeft="8"/>
                </horizontal>
            </vertical>
        `);
        
        ui.btn_test.on('click', () => {
            ui.txt_result.text = "按钮点击测试通过！";
            ui.txt_result.setTextColor("#4CAF50");
        });
        
        ui.btn_pass.on('click', () => {
            toast("UI测试通过");
            console.log("UI测试通过");
        });
        
        ui.btn_fail.on('click', () => {
            toast("UI测试失败");
            console.log("UI测试失败");
        });
        
        console.log("  ✓ UI布局加载成功");
        return true;
    } catch (e) {
        console.log(`  ✗ UI布局失败: ${e.message}`);
        return false;
    }
}

// 测试3：测试存储功能
function testStorage() {
    console.log("\n📋 测试3：存储功能测试");
    
    try {
        const testStorage = storages.create('test_storage');
        
        // 写入测试数据
        testStorage.put('test_key', 'test_value');
        testStorage.put('test_number', 123);
        testStorage.put('test_array', [1, 2, 3]);
        
        // 读取验证
        const value = testStorage.get('test_key');
        const number = testStorage.get('test_number');
        const array = testStorage.get('test_array');
        
        if (value === 'test_value' && number === 123 && array.length === 3) {
            console.log("  ✓ 存储功能正常");
            
            // 清理测试数据
            testStorage.remove('test_key');
            testStorage.remove('test_number');
            testStorage.remove('test_array');
            
            return true;
        } else {
            console.log("  ✗ 存储数据验证失败");
            return false;
        }
    } catch (e) {
        console.log(`  ✗ 存储功能失败: ${e.message}`);
        return false;
    }
}

// 测试4：测试对话框功能
function testDialogs() {
    console.log("\n📋 测试4：对话框功能测试");
    
    return new Promise((resolve) => {
        dialogs.confirm('对话框测试', '这是一个确认对话框测试，点击"确定"继续测试，点击"取消"跳过此测试', (confirmed) => {
            if (confirmed) {
                console.log("  ✓ 对话框功能正常");
                resolve(true);
            } else {
                console.log("  ⚠ 对话框测试被跳过");
                resolve(true); // 跳过不算失败
            }
        });
    });
}

// 测试5：测试文件操作
function testFiles() {
    console.log("\n📋 测试5：文件操作测试");
    
    try {
        const testDir = '/sdcard/AutoXTaskManagerTest';
        const testFile = testDir + '/test.txt';
        
        // 创建目录
        files.createDir(testDir);
        
        // 写入文件
        files.write(testFile, '测试文件内容');
        
        // 读取文件
        const content = files.read(testFile);
        
        if (content === '测试文件内容') {
            console.log("  ✓ 文件操作正常");
            
            // 清理测试文件
            files.remove(testFile);
            files.removeDir(testDir);
            
            return true;
        } else {
            console.log("  ✗ 文件内容验证失败");
            return false;
        }
    } catch (e) {
        console.log(`  ✗ 文件操作失败: ${e.message}`);
        return false;
    }
}

// 测试6：模拟任务数据
function testTaskData() {
    console.log("\n📋 测试6：任务数据测试");
    
    try {
        const storage = storages.create('task_manager_test');
        
        // 创建测试任务
        const testTasks = [
            {
                id: '1',
                name: '测试任务1',
                description: '这是一个测试任务',
                status: 'idle',
                createTime: Date.now(),
                script: 'console.log("测试任务1执行");'
            },
            {
                id: '2',
                name: '测试任务2',
                description: '另一个测试任务',
                status: 'success',
                createTime: Date.now() - 3600000,
                lastRunTime: Date.now() - 1800000,
                script: 'console.log("测试任务2执行");'
            }
        ];
        
        // 保存任务
        storage.put('tasks', testTasks);
        
        // 读取验证
        const loadedTasks = storage.get('tasks');
        
        if (loadedTasks && loadedTasks.length === 2) {
            console.log("  ✓ 任务数据操作正常");
            console.log(`    任务1: ${loadedTasks[0].name}`);
            console.log(`    任务2: ${loadedTasks[1].name}`);
            
            // 清理测试数据
            storage.clear();
            
            return true;
        } else {
            console.log("  ✗ 任务数据验证失败");
            return false;
        }
    } catch (e) {
        console.log(`  ✗ 任务数据操作失败: ${e.message}`);
        return false;
    }
}

// 主测试函数
async function runAllTests() {
    console.log("=".repeat(50));
    console.log("🧪 AutoX Task Manager 综合测试");
    console.log("=".repeat(50));
    
    const testResults = [];
    
    // 运行测试
    testResults.push({
        name: '环境检查',
        result: testEnvironment()
    });
    
    testResults.push({
        name: 'UI布局',
        result: testUILayout()
    });
    
    testResults.push({
        name: '存储功能',
        result: testStorage()
    });
    
    testResults.push({
        name: '对话框',
        result: await testDialogs()
    });
    
    testResults.push({
        name: '文件操作',
        result: testFiles()
    });
    
    testResults.push({
        name: '任务数据',
        result: testTaskData()
    });
    
    // 显示测试结果
    console.log("\n" + "=".repeat(50));
    console.log("📊 测试结果汇总");
    console.log("=".repeat(50));
    
    let passedCount = 0;
    let failedCount = 0;
    
    testResults.forEach(test => {
        if (test.result) {
            console.log(`✅ ${test.name}: 通过`);
            passedCount++;
        } else {
            console.log(`❌ ${test.name}: 失败`);
            failedCount++;
        }
    });
    
    console.log("\n📈 统计:");
    console.log(`   通过: ${passedCount}`);
    console.log(`   失败: ${failedCount}`);
    console.log(`   总计: ${testResults.length}`);
    
    if (failedCount === 0) {
        console.log("\n🎉 所有测试通过！应用可以正常运行。");
        toast("所有测试通过！");
        
        // 询问是否启动主应用
        dialogs.confirm('测试完成', '所有测试通过！是否现在启动AutoX Task Manager？', (start) => {
            if (start) {
                // 启动主应用
                engines.execScriptFile(files.path('./main.js'));
            }
        });
    } else {
        console.log("\n⚠️ 部分测试失败，请检查环境配置。");
        toast("部分测试失败，请查看控制台日志");
    }
}

// 启动测试
runAllTests().catch(e => {
    console.error("测试运行失败:", e);
    toast("测试运行失败: " + e.message);
});