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
        primary:       '#3B82F6',  // 主浅蓝色
        primaryDark:   '#2563EB',  // 深蓝色
        accent:        '#3B82F6',  // 强调浅蓝色
        success:       '#22C55E',  // 成功绿色
        warning:       '#F59E0B',  // 警告橙色
        error:         '#EF4444',  // 错误红色
        info:          '#3B82F6',  // 信息浅蓝色
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

    // Font Awesome 6 Solid 图标
    icons: {
        play:        '',  // 播放/执行
        stop:        '',  // 停止 (circle-stop)
        xmark:       '',  // 删除/关闭
        trash:       '',  // 垃圾桶 (trash-can)
        pen:         '',  // 编辑
        arrowLeft:   '',  // 返回 (arrow-left)
        download:    '',  // 下载/导入
        upload:      '',  // 上传/导出
        upload2:     '',  // 上传云 (cloud-arrow-up)
        save:        '',  // 保存 (floppy-disk)
        ellipsis:    '',  // 更多 (ellipsis)
        bars:        '',  // 菜单/列表
        code:        '',  // 代码
        star:        '',  // 星级
        user:        '',  // 用户/作者
        refresh:     '',  // 刷新 (arrows-rotate)
        plus:        '+',  // 添加
        clipboardList: '', // 剪贴板 (clipboard)
        robot:       '',  // AI 机器人 (terminal)
        comment:     '',  // 对话 (comment)
        eye:         '',  // 眼睛（显示密码）
        eyeSlash:    '',  // 眼睛划线（隐藏密码）
        magic:       '',  // 魔法棒（格式化）(bolt)
        undo:        '',  // 撤销（重置）(rotate-left)
        cloud:       '',  // 云（任务中心）
        arrowUp:     '',  // 向上箭头
        arrowDown:   '',  // 向下箭头
        circle:      '',  // 圆
        circleO:     '',  // 空心圆（同 circle）
        check:       '',  // 对勾
        pause:       '',  // 暂停
        square:      '',  // 方块
        cog:         '',  // 齿轮（设置）(gear)
        spinner:     '',  // 加载中 (spinner)
        clock:       '',  // 时钟
        info:        '',  // 信息 (circle-info)
        calendar:    '',  // 日历
        paperPlane:  '',  // 纸飞机（发送）(paper-plane)
        crosshairs:  '',  // 十字准星（坐标拾取）
        target:      '',  // 目标 (bullseye)
        history:     '',  // 历史 (clock-rotate-left)
        chip:        '',  // 芯片 (microchip) - AI 图标
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
