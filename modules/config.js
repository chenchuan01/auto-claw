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
    
    // 颜色配置（深色主题）
    colors: {
        primary:       '#7C5CBF',
        primaryDark:   '#5A3F9A',
        accent:        '#5B8DEF',
        success:       '#22C55E',
        warning:       '#F59E0B',
        error:         '#EF4444',
        info:          '#5B8DEF',
        bg:            '#0F0F1E',
        card:          '#1A1A2E',
        surface:       '#252540',
        divider:       '#2A2A42',
        textPrimary:   '#FFFFFF',
        textSecondary: '#8B8BA8',
        textHint:      '#5A5A78',
        // 兼容旧引用
        background:    '#0F0F1E',
        cardBackground:'#1A1A2E'
    },

    // 状态映射
    statusMap: {
        idle:    { text: '待执行', color: '#F59E0B' },
        running: { text: '执行中', color: '#5B8DEF' },
        success: { text: '已完成', color: '#22C55E' },
        failed:  { text: '失败',   color: '#EF4444' },
        paused:  { text: '已暂停', color: '#8B8BA8' }
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