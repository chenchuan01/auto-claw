/**
 * 简单测试 - 验证基础功能
 * 适合快速验证环境是否正常
 */

console.show();
console.clear();

console.log("🔧 AutoX Task Manager 简单测试");
console.log("=".repeat(40));

// 1. 检查基本模块
console.log("\n1. 检查模块...");
try {
    const ui = require('ui');
    console.log("   ✓ ui模块可用");
} catch (e) {
    console.log("   ✗ ui模块不可用");
}

try {
    const storages = require('storages');
    console.log("   ✓ storages模块可用");
} catch (e) {
    console.log("   ✗ storages模块不可用");
}

// 2. 简单UI测试
console.log("\n2. UI测试...");
ui.layout(`
    <vertical padding="32" gravity="center">
        <text text="AutoX Task Manager" textSize="24sp" textColor="#2196F3"/>
        <text text="测试界面" textSize="16sp" textColor="#757575" marginTop="8"/>
        
        <button id="btn_test" text="点击测试" marginTop="32" w="200"/>
        <text id="txt_status" text="等待测试..." marginTop="16"/>
        
        <horizontal marginTop="32">
            <button id="btn_main" text="运行主程序" layout_weight="1"/>
            <button id="btn_exit" text="退出" layout_weight="1" marginLeft="8"/>
        </horizontal>
    </vertical>
`);

let clickCount = 0;
ui.btn_test.on('click', () => {
    clickCount++;
    ui.txt_status.text = `点击次数: ${clickCount}`;
    ui.txt_status.setTextColor(clickCount % 2 === 0 ? "#4CAF50" : "#2196F3");
    toast(`测试点击 ${clickCount}`);
});

ui.btn_main.on('click', () => {
    console.log("启动主程序...");
    toast("启动主程序");
    
    // 延迟启动，让toast显示
    setTimeout(() => {
        try {
            engines.execScriptFile(files.path('./main.js'));
        } catch (e) {
            toast("启动失败: " + e.message);
            console.error("启动失败:", e);
        }
    }, 500);
});

ui.btn_exit.on('click', () => {
    console.log("退出测试");
    toast("测试结束");
    exit();
});

console.log("   ✓ UI加载成功");
console.log("\n✅ 简单测试完成");
console.log("点击'运行主程序'按钮启动完整应用");