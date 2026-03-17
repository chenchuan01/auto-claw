/**
 * 配置模块
 * 存储应用配置常量
 */

module.exports = {
    // 应用信息
    appName: 'AutoClaw',
    version: '1.0.0',
    author: 'AutoClaw Team',

    // 存储配置
    storageName: 'autoclaw_data',
    backupDir: '/sdcard/AutoClaw/backups/',
    
    // 颜色配置（白色主题 + 小米卡布里蓝）
    colors: {
        primary:       '#1F6FEB',
        primaryDark:   '#1558C0',
        accent:        '#1F6FEB',
        success:       '#22C55E',
        warning:       '#F59E0B',
        error:         '#EF4444',
        info:          '#1F6FEB',
        bg:            '#FFFFFF',
        card:          '#F5F7FA',
        surface:       '#EEF1F6',
        divider:       '#E2E6ED',
        textPrimary:   '#1A1A2E',
        textSecondary: '#6B7280',
        textHint:      '#9CA3AF',
        // 兼容旧引用
        background:    '#FFFFFF',
        cardBackground:'#F5F7FA'
    },

    // 状态映射
    statusMap: {
        idle:    { text: '待执行', color: '#FFA726', dot: '●' },
        running: { text: '执行中', color: '#FFA726', dot: '●' },
        success: { text: '已完成', color: '#66BB6A', dot: '●' },
        failed:  { text: '失败',   color: '#EF5350', dot: '●' },
        paused:  { text: '已暂停', color: '#FFA726', dot: '●' }
    },
    
    // 默认任务脚本
    defaultScript: '// AutoX 任务脚本\n' +
        'console.log("任务开始执行");\n' +
        'toast("任务执行中...");\n\n' +
        '// 这里编写你的自动化脚本\n' +
        '// 示例：等待2秒\n' +
        'sleep(2000);\n\n' +
        '// 示例：显示完成消息\n' +
        'toast("任务执行完成");\n' +
        'console.log("任务执行结束");',
    
    // 市场API配置
    marketApi: {
        baseUrl: 'https://api.autoclaw.com',
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