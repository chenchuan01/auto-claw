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

    // 颜色配置（清新浅色主题 + 现代化设计）
    colors: {
        primary:       '#1F6FEB',  // 主蓝色
        primaryDark:   '#1558C0',  // 深蓝色
        accent:        '#1F6FEB',  // 强调蓝色
        success:       '#22C55E',  // 成功绿色
        warning:       '#F59E0B',  // 警告橙色
        error:         '#EF4444',  // 错误红色
        info:          '#1F6FEB',  // 信息蓝色
        bg:            '#FFFFFF',  // 背景白色
        card:          '#F5F7FA',  // 卡片背景浅灰
        surface:       '#EEF1F6',  // 表面元素更浅灰
        divider:       '#E2E6ED',  // 分割线浅灰
        textPrimary:   '#1A1A2E',  // 主要文字深灰
        textSecondary: '#6B7280',  // 次要文字中灰
        textHint:      '#9CA3AF',  // 提示文字浅灰
        // 兼容旧引用
        background:    '#FFFFFF',
        cardBackground:'#F5F7FA'
    },

    // 状态映射
    statusMap: {
        idle:    { text: '待执行', color: '#F59E0B', dot: '●' },     // 警告橙色
        running: { text: '执行中', color: '#1F6FEB', dot: '●' },     // 主蓝色
        success: { text: '已完成', color: '#22C55E', dot: '●' },     // 成功绿色
        failed:  { text: '失败',   color: '#EF4444', dot: '●' },     // 错误红色
        paused:  { text: '已暂停', color: '#9C27B0', dot: '●' }      // 紫色
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
