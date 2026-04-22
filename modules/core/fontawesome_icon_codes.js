/**
 * Font Awesome 6 Solid 图标码点映射
 * 包含项目中常用的图标
 */

var FA_ICONS = {
    // 基础操作
    'play': '\uf04b',  // 播放/执行
    'pause': '\uf04c',  // 暂停
    'stop': '\uf04d',  // 停止
    'circle-play': '\uf144',  // 圆形播放
    'circle-pause': '\uf28b',  // 圆形暂停
    'circle-stop': '\uf28d',  // 圆形停止

    // 编辑操作
    'pen': '\uf304',  // 编辑
    'pen-to-square': '\uf044',  // 编辑方块
    'trash': '\uf1f8',  // 删除
    'trash-can': '\uf2ed',  // 垃圾桶
    'xmark': '\uf00d',  // 关闭/删除
    'check': '\uf00c',  // 勾选
    'plus': '\u002b',  // 添加
    'minus': '\uf068',  // 减少

    // 箭头
    'arrow-left': '\uf060',  // 左箭头
    'arrow-right': '\uf061',  // 右箭头
    'arrow-up': '\uf062',  // 上箭头
    'arrow-down': '\uf063',  // 下箭头
    'chevron-left': '\uf053',  // 左尖括号
    'chevron-right': '\uf054',  // 右尖括号
    'chevron-up': '\uf077',  // 上尖括号
    'chevron-down': '\uf078',  // 下尖括号

    // 文件操作
    'download': '\uf019',  // 下载
    'upload': '\uf093',  // 上传
    'floppy-disk': '\uf0c7',  // 保存
    'save': '\uf0c7',  // 保存（别名）
    'file': '\uf15b',  // 文件
    'file-code': '\uf1c9',  // 代码文件
    'folder': '\uf07b',  // 文件夹
    'folder-open': '\uf07c',  // 打开文件夹

    // 界面元素
    'bars': '\uf0c9',  // 菜单
    'ellipsis': '\uf141',  // 更多(横)
    'ellipsis-vertical': '\uf142',  // 更多(竖)
    'gear': '\uf013',  // 设置
    'cog': '\uf013',  // 设置（别名）
    'sliders': '\uf1de',  // 滑块

    // 用户
    'user': '\uf007',  // 用户
    'users': '\uf0c0',  // 多用户
    'user-plus': '\uf234',  // 添加用户
    'user-minus': '\uf503',  // 移除用户

    // 通讯
    'envelope': '\uf0e0',  // 邮件
    'comment': '\uf075',  // 评论
    'comments': '\uf086',  // 多评论
    'message': '\uf27a',  // 消息
    'bell': '\uf0f3',  // 通知
    'bell-slash': '\uf1f6',  // 关闭通知

    // 状态
    'circle': '\uf111',  // 圆形
    'circle-dot': '\uf192',  // 圆点
    'square': '\uf0c8',  // 方块
    'square-check': '\uf14a',  // 方块勾选
    'circle-check': '\uf058',  // 圆形勾选
    'circle-xmark': '\uf057',  // 圆形关闭
    'triangle-exclamation': '\uf071',  // 警告
    'circle-info': '\uf05a',  // 信息
    'circle-question': '\uf059',  // 问号

    // 星级
    'star': '\uf005',  // 星星
    'star-half': '\uf089',  // 半星
    'heart': '\uf004',  // 心形
    'bookmark': '\uf02e',  // 书签

    // 时间
    'clock': '\uf017',  // 时钟
    'calendar': '\uf133',  // 日历
    'calendar-days': '\uf073',  // 日历天
    'hourglass': '\uf254',  // 沙漏

    // 导航
    'house': '\uf015',  // 主页
    'home': '\uf015',  // 主页（别名）
    'compass': '\uf14e',  // 指南针
    'map': '\uf279',  // 地图
    'location-dot': '\uf3c5',  // 位置

    // 工具
    'magnifying-glass': '\uf002',  // 搜索
    'search': '\uf002',  // 搜索（别名）
    'wrench': '\uf0ad',  // 扳手
    'screwdriver-wrench': '\uf7d9',  // 工具
    'hammer': '\uf6e3',  // 锤子

    // 代码
    'code': '\uf121',  // 代码
    'terminal': '\uf120',  // 终端
    'laptop-code': '\uf5fc',  // 笔记本代码
    'bug': '\uf188',  // Bug

    // 云服务
    'cloud': '\uf0c2',  // 云
    'cloud-arrow-up': '\uf0ee',  // 上传云
    'cloud-arrow-down': '\uf0ed',  // 下载云
    'server': '\uf233',  // 服务器
    'database': '\uf1c0',  // 数据库

    // 安全
    'eye': '\uf06e',  // 显示
    'eye-slash': '\uf070',  // 隐藏
    'lock': '\uf023',  // 锁定
    'unlock': '\uf09c',  // 解锁
    'key': '\uf084',  // 钥匙
    'shield': '\uf132',  // 盾牌

    // 剪贴板
    'clipboard': '\uf328',  // 剪贴板
    'paste': '\uf0ea',  // 粘贴
    'copy': '\uf0c5',  // 复制

    // 分享
    'share': '\uf064',  // 分享
    'share-nodes': '\uf1e0',  // 分享节点
    'link': '\uf0c1',  // 链接
    'paperclip': '\uf0c6',  // 回形针

    // 旋转
    'rotate': '\uf2f1',  // 旋转
    'rotate-right': '\uf2f9',  // 右旋转
    'rotate-left': '\uf2ea',  // 左旋转
    'arrows-rotate': '\uf021',  // 刷新
    'refresh': '\uf021',  // 刷新（别名）

    // 加载
    'spinner': '\uf110',  // 加载中
    'circle-notch': '\uf1ce',  // 圆形加载

    // 其他
    'bolt': '\uf0e7',  // 闪电
    'bolt-lightning': '\ue0b7',  // 闪电
    'wand-magic-sparkles': '\ue2ca',  // 魔法棒
    'paper-plane': '\uf1d8',  // 纸飞机
    'crosshairs': '\uf05b',  // 十字准星
    'bullseye': '\uf140'  // 靶心
};

/**
 * 获取图标字符
 * @param {string} iconName - 图标名称（如 'home', 'user'）
 * @returns {string} 图标字符，如果不存在返回空字符串
 */
function getIcon(iconName) {
    return FA_ICONS[iconName] || '';
}

/**
 * 检查图标是否存在
 * @param {string} iconName - 图标名称
 * @returns {boolean}
 */
function hasIcon(iconName) {
    return iconName in FA_ICONS;
}

module.exports = {
    FA_ICONS: FA_ICONS,
    getIcon: getIcon,
    hasIcon: hasIcon
};
