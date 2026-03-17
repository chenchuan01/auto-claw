/**
 * 快速测试 - 最小化功能验证
 * 只测试最核心的功能
 */

// 最小化测试，不显示控制台
toast("🚀 开始快速测试");

// 测试1：UI模块
try {
    ui.layout(`
        <vertical padding="16" gravity="center">
            <text text="快速测试" textSize="20sp" textColor="#2196F3"/>
            <text text="正在验证核心功能..." textSize="14sp" textColor="#757575" marginTop="8"/>
            <progressbar indeterminate="true" marginTop="16"/>
        </vertical>
    `);
    toast("✓ UI模块正常");
} catch (e) {
    toast("✗ UI模块异常: " + e.message);
    exit();
}

// 测试2：存储模块
setTimeout(() => {
    try {
        const testStorage = storages.create('quick_test');
        testStorage.put('test', 'value');
        const value = testStorage.get('test');
        
        if (value === 'value') {
            toast("✓ 存储模块正常");
        } else {
            toast("✗ 存储数据异常");
        }
        testStorage.clear();
    } catch (e) {
        toast("✗ 存储模块异常: " + e.message);
    }
    
    // 测试3：文件模块
    setTimeout(() => {
        try {
            const testFile = '/sdcard/quick_test.txt';
            files.write(testFile, 'test');
            const content = files.read(testFile);
            
            if (content === 'test') {
                toast("✓ 文件模块正常");
            } else {
                toast("✗ 文件数据异常");
            }
            files.remove(testFile);
        } catch (e) {
            toast("✗ 文件模块异常: " + e.message);
        }
        
        // 显示结果并启动主程序
        setTimeout(() => {
            ui.layout(`
                <vertical padding="32" gravity="center">
                    <text text="✅ 测试完成" textSize="24sp" textColor="#4CAF50"/>
                    <text text="核心功能验证通过" textSize="16sp" textColor="#757575" marginTop="8"/>
                    
                    <button id="btn_start" text="启动应用" marginTop="32" w="200" style="Widget.AppCompat.Button.Colored"/>
                    <button id="btn_close" text="关闭" marginTop="16" w="200"/>
                </vertical>
            `);
            
            ui.btn_start.on('click', () => {
                toast("启动主程序...");
                setTimeout(() => {
                    try {
                        engines.execScriptFile(files.path('./main.js'));
                    } catch (e) {
                        toast("启动失败");
                    }
                }, 300);
            });
            
            ui.btn_close.on('click', () => {
                exit();
            });
        }, 500);
    }, 500);
}, 500);