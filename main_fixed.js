/**
 * AutoX Task Manager - 完整版本
 * 修复了文件截断问题
 */

// 导入模块
const ui = require('ui');
const storages = require('storages');
const dialogs = require('dialogs');
const files = require('files');
const threads = require('threads');
const { setClip, toast } = require('globals');

// 应用配置
const CONFIG = {
    appName: 'AutoX任务管理器',
    version: '1.0.0',
    storageName: 'task_manager_data'
};

// 初始化存储
const storage = storages.create(CONFIG.storageName);

// 主界面
function showMainUI() {
    ui.layout(`
        <vertical>
            <!-- 标题栏 -->
            <horizontal bg="#2196F3" padding="16">
                <text text="${CONFIG.appName}" textSize="24sp" textColor="white" layout_weight="1"/>
                <button id="btn_settings" text="设置" textSize="14sp"/>
            </horizontal>
            
            <!-- 任务列表区域 -->
            <frame layout_weight="1">
                <list id="task_list">
                    <horizontal padding="16" bg="?selectableItemBackground">
                        <vertical layout_weight="1">
                            <text id="task_name" text="{{this.name}}" textSize="18sp" textColor="#212121"/>
                            <text id="task_desc" text="{{this.description}}" textSize="14sp" textColor="#757575" maxLines="1"/>
                            <horizontal marginTop="8">
                                <text id="task_status" text="{{this.status}}" textSize="12sp" textColor="{{this.statusColor}}"/>
                                <text id="task_time" text="{{this.lastRunTime}}" textSize="12sp" textColor="#9E9E9E" layout_weight="1" gravity="right"/>
                            </horizontal>
                        </vertical>
                        <vertical>
                            <button id="btn_run" text="执行" marginLeft="8"/>
                            <button id="btn_manage" text="管理" marginLeft="8" marginTop="4"/>
                        </vertical>
                    </horizontal>
                </list>
                
                <!-- 空状态提示 -->
                <vertical id="empty_view" visibility="gone" gravity="center">
                    <text text="暂无任务" textSize="18sp" textColor="#757575" marginTop="16"/>
                    <text text="点击右下角按钮添加任务" textSize="14sp" textColor="#9E9E9E" marginTop="8"/>
                </vertical>
            </frame>
            
            <!-- 底部导航 -->
            <horizontal bg="#FFFFFF" elevation="8">
                <button id="btn_tasks" text="任务管理" layout_weight="1" style="Widget.AppCompat.Button.Borderless" textColor="#2196F3"/>
                <button id="btn_market" text="任务市场" layout_weight="1" style="Widget.AppCompat.Button.Borderless" textColor="#757575"/>
            </horizontal>
            
            <!-- 浮动操作按钮 -->
            <frame gravity="bottom|right" margin="16">
                <button id="btn_add" w="56" h="56" bg="#2196F3" text="+" textSize="24sp" textColor="white" style="Widget.AppCompat.Button.Colored" circle="true" elevation="8"/>
            </frame>
        </vertical>
    `);
    
    // 初始化数据
    initData();
    
    // 绑定事件
    bindEvents();
}

// 初始化数据
function initData() {
    // 加载任务数据
    let tasks = storage.get('tasks') || [];
    
    // 更新列表
    updateTaskList(tasks);
    
    // 显示/隐藏空状态
    ui.empty_view.visibility = tasks.length === 0 ? 'visible' : 'gone';
}

// 更新任务列表
function updateTaskList(tasks) {
    // 处理任务数据，添加显示属性
    const processedTasks = tasks.map(task => {
        return {
            ...task,
            status: getStatusText(task.status),
            statusColor: getStatusColor(task.status),
            lastRunTime: formatTime(task.lastRunTime)
        };
    });
    
    ui.task_list.setDataSource(processedTasks);
}

// 获取状态文本
function getStatusText(status) {
    const statusMap = {
        'idle': '待执行',
        'running': '执行中',
        'success': '成功',
        'failed': '失败',
        'paused': '已暂停'
    };
    return statusMap[status] || '未知';
}

// 获取状态颜色
function getStatusColor(status) {
    const colorMap = {
        'idle': '#FF9800',
        'running': '#2196F3',
        'success': '#4CAF50',
        'failed': '#F44336',
        'paused': '#9E9E9E'
    };
    return colorMap[status] || '#757575';
}

// 格式化时间
function formatTime(timestamp) {
    if (!timestamp) return '从未执行';
    
    const now = new Date().getTime();
    const diff = now - timestamp;
    
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    
    return new Date(timestamp).toLocaleDateString();
}

// 绑定事件
function bindEvents() {
    // 任务列表项点击
    ui.task_list.on('item_click', (item, i, itemView, listView) => {
        showTaskDetail(item);
    });
    
    // 执行按钮
    ui.task_list.on('item_bind', (itemView, itemHolder) => {
        itemView.btn_run.on('click', () => {
            runTask(itemHolder.item);
        });
        
        itemView.btn_manage.on('click', () => {
            manageTask(itemHolder.item);
        });
    });
    
    // 底部导航
    ui.btn_tasks.on('click', () => {
        // 已经是任务管理页面，刷新数据
        initData();
        ui.btn_tasks.setTextColor('#2196F3');
        ui.btn_market.setTextColor('#757575');
    });
    
    ui.btn_market.on('click', () => {
        showTaskMarket();
        ui.btn_tasks.setTextColor('#757575');
        ui.btn_market.setTextColor('#2196F3');
    });
    
    // 添加按钮
    ui.btn_add.on('click', () => {
        showAddTaskDialog();
    });
    
    // 设置按钮
    ui.btn_settings.on('click', () => {
        showSettings();
    });
}

// 显示任务详情
function showTaskDetail(task) {
    ui.layout(`
        <vertical>
            <horizontal bg="#2196F3" padding="16">
                <button id="btn_back" text="返回" textColor="white"/>
                <text text="任务详情" textSize="20sp" textColor="white" layout_weight="1" gravity="center"/>
                <button id="btn_edit" text="编辑" textColor="white"/>
            </horizontal>
            
            <scroll>
                <vertical padding="16">
                    <text text="${task.name}" textSize="24sp" textColor="#212121"/>
                    <text text="${task.description || '无描述'}" textSize="16sp" textColor="#757575" marginTop="8"/>
                    
                    <card w="*" h="auto" marginTop="16" elevation="2">
                        <vertical padding="16">
                            <text text="任务信息" textSize="18sp" textColor="#212121" marginBottom="8"/>
                            <horizontal>
                                <text text="状态：" textSize="14sp" textColor="#757575" layout_weight="1"/>
                                <text text="${getStatusText(task.status)}" textSize="14sp" textColor="${getStatusColor(task.status)}"/>
                            </horizontal>
                            <horizontal>
                                <text text="创建时间：" textSize="14sp" textColor="#757575" layout_weight="1"/>
                                <text text="${formatTime(task.createTime)}" textSize="14sp" textColor="#212121"/>
                            </horizontal>
                            <horizontal>
                                <text text="最后执行：" textSize="14sp" textColor="#757575" layout_weight="1"/>
                                <text text="${formatTime(task.lastRunTime)}" textSize="14sp" textColor="#212121"/>
                            </horizontal>
                            <horizontal>
                                <text text="执行次数：" textSize="14sp" textColor="#757575" layout_weight="1"/>
                                <text text="${task.runCount || 0}" textSize="14sp" textColor="#212121"/>
                            </horizontal>
                        </vertical>
                    </card>
                    
                    <card w="*" h="auto" marginTop="16" elevation="2">
                        <vertical padding="16">
                            <text text="任务脚本" textSize="18sp" textColor="#212121" marginBottom="8"/>
                            <text text="${task.script || '无脚本内容'}" textSize="14sp" textColor="#212121" bg="#FAFAFA" padding="8"/>
                        </vertical>
                    </card>
                    
                    <horizontal marginTop="16">
                        <button id="btn_run_now" text="立即执行" layout_weight="1" style="Widget.AppCompat.Button.Colored" bg="#4CAF50"/>
                        <button id="btn_schedule" text="定时执行" layout_weight="1" marginLeft="8"/>
                        <button id="btn_delete" text="删除" layout_weight="1" marginLeft="8" style="Widget.AppCompat.Button.Colored" bg="#F44336"/>
                    </horizontal>
                </vertical>
            </scroll>
        </vertical>
    `);
    
    // 绑定事件
    ui.btn_back.on('click', () => {
        showMainUI();
    });
    
    ui.btn_edit.on('click', () => {
        editTask(task);
    });
    
    ui.btn_run_now.on('click', () => {
        runTask(task);
    });
    
    ui.btn_schedule.on('click', () => {
        scheduleTask(task);
    });
    
    ui.btn_delete.on('click', () => {
        deleteTask(task);
    });
}

// 显示任务市场
function showTaskMarket() {
    ui.layout(`
        <vertical>
            <horizontal bg="#2196F3" padding="16">
                <button id="btn_back" text="返回" textColor="white"/>
                <text text="任务市场" textSize="20sp" textColor="white" layout_weight="1" gravity="center"/>
                <button id="btn_refresh" text="刷新" textColor="white"/>
            </horizontal>
            
            <list id="market_list">
                <card w="*" h="auto" margin="8" elevation="2">
                    <vertical padding="16">
                        <horizontal>
                            <vertical layout_weight="1">
                                <text id="market_name" text="{{this.name}}" textSize="18sp" textColor="#212121"/>
                                <text id="market_author" text="作者：{{this.author}}" textSize="12sp" textColor="#757575" marginTop="4"/>
                            </vertical>
                            <button id="btn_import" text="导入" marginLeft="8"/>
                        </horizontal>
                        <text id="market_desc" text="{{this.description}}" textSize="14sp" textColor="#757575" marginTop="8" maxLines="2"/>
                        <horizontal marginTop="8">
                            <text id="market_downloads" text="下载：{{this.downloads}}" textSize="12sp" textColor="#9E9E9E"/>
                            <text id="market_rating" text="评分：{{this.rating}}★" textSize="12sp" textColor="#FF9800" layout_weight="1" gravity="right"/>
                        </horizontal>
                    </vertical>
                </card>
            </list>
            
            <!-- 加载中 -->
            <vertical id="loading_view" gravity="center" visibility="gone">
                <progressbar indeterminate="true"/>
                <text text="加载中..." textSize="14sp" textColor="#757575" marginTop="8"/>
            </vertical>
            
            <!-- 空状态 -->
            <vertical id="market_empty" gravity="center" visibility="gone">
                <text text="暂无任务" textSize="18sp" textColor="#757575" marginTop="16"/>
                <text text="网络连接失败或市场为空" textSize="14sp" textColor="#9E9E9E" marginTop="8"/>
            </vertical>
        </vertical>
    `);
    
    // 加载市场数据
    loadMarketData();
    
    // 绑定事件
    ui.btn_back.on('click', () => {
        showMainUI();
    });
    
    ui.btn_refresh.on('click', () => {
        loadMarketData();
    });
    
    ui.market_list.on('item_click', (item, i, itemView, listView) => {
        showMarketTaskDetail(item);
    });
    
    ui.market_list.on('item_bind', (itemView, itemHolder) => {
        itemView.btn_import.on('click', () => {
            importTask(itemHolder.item);
        });
    });
}

// 加载市场数据
function loadMarketData() {
    ui.loading_view.visibility = 'visible';
    ui.market_empty.visibility = 'gone';
    
    // 模拟网络请求
    setTimeout(() => {
        // 模拟数据
        const marketTasks = [
            {
                id: '1',
                name: '微信自动回复',
                author: '张三',
                description: '自动回复微信消息，支持关键词匹配',
                downloads: 1234,
                rating: 4.5,
                script: '// 微信自动回复脚本\nconsole.log("开始微信自动回复");\ntoast("微信自动回复已启动");\n// 这里可以编写具体的微信自动化逻辑'
            },
            {
                id: '2',
                name: '抖音自动点赞',
                author: '李四',
                description: '自动点赞推荐视频，增加账号活跃度',
                downloads: 856,
                rating: 4.2,
                script: '// 抖音自动点赞脚本\nconsole.log("开始抖音自动点赞");\ntoast("抖音自动点赞已启动");\n// 这里可以编写具体的抖音自动化逻辑'
            },
            {
                id: '3',
                name: '定时清理垃圾',
                author: '王五',
                description: '定时清理手机垃圾文件，释放存储空间',
                downloads: 2100,
                rating: 4.8,
                script: '// 清理垃圾脚本\nconsole.log("开始清理垃圾");\ntoast("垃圾清理已启动");\n// 这里可以编写具体的清理逻辑'
            }
        ];
        
        ui.market_list.setDataSource(marketTasks);
        ui.loading_view.visibility = 'gone';
        
        if (marketTasks.length === 0) {
            ui.market_empty.visibility = 'visible';
        }
    }, 1000);
}

// 显示市场任务详情
function showMarketTaskDetail(task) {
    ui.layout(`
        <vertical>
            <horizontal bg="#2196F3" padding="16">
                <button id="btn_back" text="返回" textColor="white"/>
                <text text="任务详情" textSize="20sp" textColor="white" layout_weight="1" gravity="center"/>
                <button id="btn_import" text="导入" textColor="white"/>
            </horizontal>
            
            <scroll>
                <vertical padding="16">
                    <text text="${task.name}" textSize="24sp" textColor="#212121"/>
                    <text text="作者：${task.author}" textSize="14sp" textColor="#757575" marginTop="4"/>
                    
                    <horizontal marginTop="8">
                        <text text="下载：${task.downloads}" textSize="12sp" textColor="#9E9E9E"/>
                        <text text="评分：${task.rating}★" textSize="12sp" textColor="#FF9800" layout_weight="1" gravity="right"/>
                    </horizontal>
                    
                    <card w="*" h="auto" marginTop="16" elevation="2">
                        <vertical padding="16">
                            <text text="任务简介" textSize="18sp" textColor="#212121" marginBottom="8"/>
                            <text text="${task.description}" textSize="14sp" textColor="#212121"/>
                        </vertical>
                    </card>
                    
                    <card w="*" h="auto" marginTop="16" elevation="2">
                        <vertical padding="16">
                            <text text="详细用途" textSize="18sp" textColor="#212121" marginBottom="8"/>
                            <text text="1. 自动执行指定操作\n2. 支持定时任务\n3. 可配置参数\n4. 执行日志记录" textSize="14sp" textColor="#212121"/>
                        </vertical>
                    </card>
                    
                    <card w="*" h="auto" marginTop="16" elevation="2">
                        <vertical padding="16">
                            <text text="脚本预览" textSize="18sp" textColor="#212121" marginBottom="8"/>
                            <text text="${task.script.substring(0, 200)}..." textSize="12sp" textColor="#212121" bg="#FAFAFA" padding="8"/>
                        </vertical>
                    </card>
                    
                    <button id="btn_import_now" text="立即导入" marginTop="16" style="Widget.AppCompat.Button.Colored" bg="#4CAF50"/>
                </vertical>
            </scroll>
        </vertical>
    `);
    
    // 绑定事件
    ui.btn_back.on('click', () => {
        showTaskMarket();
    });
    
    ui.btn_import.on('click', () => {
        importTask(task);
    });
    
    ui.btn_import_now.on('click', () => {
        importTask(task);
    });
}

// 导入任务
function importTask(marketTask) {
    dialogs.confirm('导入任务', `确定要导入任务