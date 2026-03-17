/**
 * 项目验证脚本
 * 检查项目文件完整性和模块化架构
 */

console.show();
console.clear();
console.log("🔍 AutoClaw 项目验证");
console.log("=".repeat(50));

// 检查文件列表
const requiredFiles = [
    'main.js',
    'modules/config.js',
    'modules/data_manager.js',
    'modules/task_executor.js',
    'modules/market_service.js',
    'modules/ui_manager_complete.js',
    'project.json',
    'README.md',
    'INSTALL.md',
    'test_runner.js',
    'test_simple.js',
    'test_quick.js'
];

console.log("\n📁 检查项目文件完整性:");
let fileCheckPassed = true;

requiredFiles.forEach(file => {
    try {
        if (files.exists(files.path('./' + file))) {
            const size = files.size(files.path('./' + file));
            console.log(`  ✅ ${file} (${size} bytes)`);
        } else {
            console.log(`  ❌ ${file} - 文件不存在`);
            fileCheckPassed = false;
        }
    } catch (e) {
        console.log(`  ❌ ${file} - 检查失败: ${e.message}`);
        fileCheckPassed = false;
    }
});

// 检查模块加载
console.log("\n📦 检查模块加载:");
let moduleCheckPassed = true;

const modulesToCheck = [
    { name: 'config.js', path: './modules/config.js' },
    { name: 'data_manager.js', path: './modules/data_manager.js' },
    { name: 'task_executor.js', path: './modules/task_executor.js' },
    { name: 'market_service.js', path: './modules/market_service.js' },
    { name: 'ui_manager_complete.js', path: './modules/ui_manager_complete.js' }
];

modulesToCheck.forEach(module => {
    try {
        const moduleContent = files.read(files.path(module.path));
        const lines = moduleContent.split('\n').length;
        
        // 检查文件是否被截断
        if (moduleContent.length < 100) {
            console.log(`  ⚠️  ${module.name} - 文件可能被截断 (${moduleContent.length} chars)`);
        } else {
            console.log(`  ✅ ${module.name} - 加载成功 (${lines} 行)`);
        }
        
        // 尝试解析模块
        try {
            eval('(function() {' + moduleContent + '})');
        } catch (e) {
            console.log(`  ❌ ${module.name} - 语法错误: ${e.message}`);
            moduleCheckPassed = false;
        }
        
    } catch (e) {
        console.log(`  ❌ ${module.name} - 读取失败: ${e.message}`);
        moduleCheckPassed = false;
    }
});

// 检查主入口文件
console.log("\n🚪 检查主入口文件:");
try {
    const mainContent = files.read(files.path('./main.js'));
    const mainLines = mainContent.split('\n').length;
    
    // 检查是否模块化
    const hasRequire = mainContent.includes('require');
    const hasClassInstantiation = mainContent.includes('new DataManager') || 
                                  mainContent.includes('new TaskExecutor') ||
                                  mainContent.includes('new MarketService') ||
                                  mainContent.includes('new UIManager');
    
    if (hasRequire && hasClassInstantiation) {
        console.log(`  ✅ main.js - 模块化架构正确 (${mainLines} 行)`);
        console.log(`     ✓ 使用require导入模块`);
        console.log(`     ✓ 使用类实例化`);
    } else {
        console.log(`  ⚠️  main.js - 可能不是完全模块化`);
        moduleCheckPassed = false;
    }
    
    // 检查文件大小（避免过大）
    if (mainContent.length > 5000) {
        console.log(`  ⚠️  main.js - 文件较大 (${mainContent.length} chars)，建议保持简洁`);
    }
    
} catch (e) {
    console.log(`  ❌ main.js - 检查失败: ${e.message}`);
    moduleCheckPassed = false;
}

// 检查项目配置
console.log("\n⚙️ 检查项目配置:");
try {
    const projectConfig = JSON.parse(files.read(files.path('./project.json')));
    
    const requiredFields = ['appName', 'packageName', 'versionName', 'versionCode'];
    let configValid = true;
    
    requiredFields.forEach(field => {
        if (!projectConfig[field]) {
            console.log(`  ❌ project.json - 缺少必要字段: ${field}`);
            configValid = false;
        }
    });
    
    if (configValid) {
        console.log(`  ✅ project.json - 配置完整`);
        console.log(`     应用名称: ${projectConfig.appName}`);
        console.log(`     包名: ${projectConfig.packageName}`);
        console.log(`     版本: ${projectConfig.versionName} (${projectConfig.versionCode})`);
    }
    
} catch (e) {
    console.log(`  ❌ project.json - 解析失败: ${e.message}`);
}

// 生成验证报告
console.log("\n" + "=".repeat(50));
console.log("📊 验证报告:");
console.log("=".repeat(50));

if (fileCheckPassed && moduleCheckPassed) {
    console.log("🎉 项目验证通过！");
    console.log("\n✅ 所有检查项通过");
    console.log("✅ 模块化架构完整");
    console.log("✅ 文件完整性良好");
    console.log("\n🚀 可以运行 main.js 启动应用");
    
    // 询问是否启动应用
    setTimeout(() => {
        dialogs.confirm('验证通过', '项目验证成功！是否现在启动应用？', (start) => {
            if (start) {
                engines.execScriptFile(files.path('./main.js'));
            }
        });
    }, 1000);
    
} else {
    console.log("⚠️ 项目验证发现问题:");
    
    if (!fileCheckPassed) {
        console.log("  ❌ 文件完整性检查失败");
    }
    
    if (!moduleCheckPassed) {
        console.log("  ❌ 模块加载检查失败");
    }
    
    console.log("\n🔧 建议修复:");
    console.log("  1. 确保所有模块文件完整");
    console.log("  2. 检查文件是否被截断");
    console.log("  3. 验证模块语法正确性");
    console.log("  4. 重新生成缺失的文件");
    
    toast("项目验证发现问题，请查看控制台");
}

console.log("\n" + "=".repeat(50));
console.log("验证完成时间: " + new Date().toLocaleString());