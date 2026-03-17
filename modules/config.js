/**
 * 配置模块
 * 存储应用配置常量
 */

module.exports = {
    // 应用信息
    appName: 'AutoX任务管理器',
    version: '1.0.0',
    author: 'AutoX Task Manager Team',
    
    // 存储配置
    storageName: 'task_manager_data',
    backupDir: '/sdcard/AutoXTaskManager/backups/',
    
    // 颜色配置
    colors: {
        primary: '#2196F3',
        success: '#4CAF50',
        warning: '#FF9800',
        error: '#F44336',
        info: '#9E9E9E',
        textPrimary: '#212121',
        textSecondary: '#757575',
        textHint: '#9E9E9E',
        background: '#FFFFFF',
        cardBackground: '#FAFAFA'
    },
    
    // 状态映射
    statusMap: {
        idle: { text: '待执行', color: '#FF9800' },
        running: { text: '执行中', color: '#2196F3' },
        success: { text: '成功', color: '#4CAF50' },
        failed: { text: '失败', color: '#F44336' },
        paused: { text: '已暂停', color: '#9E9E9E' }
    },
    
    // 默认任务脚本
    defaultScript: `// AutoX 任务脚本
console.log("任务开始执行");
toast("任务执行中...");

// 这里编写你的自动化脚本
// 示例：等待2秒
sleep(2000);

// 示例：显示完成消息
toast("任务执行完成");
console.log("任务执行结束");`,
    
    // 市场API配置
    marketApi: {
        baseUrl: 'https://api.autox-taskmanager.com',
        timeout: 10000,
        retryCount: 3
    },
    
    // 应用设置
    settings: {
        autoBackup: true,
        backupInterval: 24 * 60 * 60 * 1000, // 24小时
        maxBackupFiles: 10,
        enableLogging: true,
        logLevel: 'info'
    }
};