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

    // Font Awesome 图标（需要加载 fa-solid-900.ttf）
    icons: {
        play:        '\uf04b',  // 播放/执行
        stop:        '\uf04d',  // 停止
        xmark:       '\uf00d',  // 删除/关闭
        pen:         '\uf044',  // 编辑（edit）
        arrowLeft:   '\uf060',  // 返回
        download:    '\uf019',  // 下载/导入
        upload:      '\uf093',  // 上传/导出
        save:        '\uf0c7',  // 保存（磁盘）
        ellipsis:    '\uf141',  // 更多
        bars:        '\uf0c9',  // 菜单/列表
        code:        '\uf121',  // 代码/格式化
        star:        '\uf005',  // 星级
        user:        '\uf007',  // 用户/作者
        refresh:     '\uf021',  // 刷新
        plus:        '\uf067',  // 添加
        clipboardList: '\uf46d', // 片段
        robot:       '\uf544',  // AI 机器人
        comment:     '\uf075',  // 对话
        eye:         '\uf06e',  // 眼睛（显示密码）
        eyeSlash:    '\uf070',  // 眼睛划线（隐藏密码）
        magic:       '\uf0d0',  // 魔法棒（格式化）
        undo:        '\uf0e2',  // 撤销（重置）
        cloud:       '\uf0c2',  // 云（任务中心）
        arrowUp:     '\uf062',  // 向上箭头
        arrowDown:   '\uf063',  // 向下箭头
        circle:      '\uf111',  // 实心圆
        circleO:     '\uf10c',  // 空心圆
        check:       '\uf00c',  // 对勾
        pause:       '\uf04c',  // 暂停
        square:      '\uf0c8',  // 方块
        cog:         '\uf013',  // 齿轮（设置）
        spinner:     '\uf110',  // 加载中
        clock:       '\uf017',  // 时钟
        info:        '\uf129',  // 信息
        calendar:    '\uf073',   // 日历
        paperPlane:  '\uf1d8',  // 纸飞机（发送）
        crosshairs:  '\uf05b',  // 十字准星（坐标拾取）
        target:      '\uf05b',  // 目标（别名）
    },

    // 状态映射
    statusMap: {
        idle:    { text: '待执行', color: '#F59E0B', dot: '●' },
        running: { text: '执行中', color: '#1F6FEB', dot: '●' },
        success: { text: '已完成', color: '#22C55E', dot: '●' },
        failed:  { text: '失败',   color: '#EF4444', dot: '●' },
        paused:  { text: '已暂停', color: '#9C27B0', dot: '●' }
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
