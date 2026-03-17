/**
 * AutoX Task Manager - 模块化主程序
 * 完整版本，经过代码审查
 */

// ==================== 模块导入 ====================
const ui = require('ui');
const storages = require('storages');
const dialogs = require('dialogs');
const files = require('files');
const threads = require('threads');
const { setClip, toast } = require('globals');

// ==================== 配置常量 ====================
const CONFIG = {
    appName: 'AutoX任务管理器',
    version: '1.0.0',
    storageName: 'task_manager_data',
    marketUrl: 'https://api.autox-taskmanager.com/market'
};

// ==================== 工具函数 ====================

// 格式化时间
function formatTime(timestamp) {
    if (!timestamp) return '从未执行';
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';
    return new Date(timestamp).toLocaleDateString();
}

// 获取状态文本
function getStatusText(status) {
    const map = { idle: '待执行', running: '执行中', success: '成功', failed: '失败', paused: '已暂停' };
    return map[status] || '未知';
}

// 获取状态颜色
function getStatusColor(status) {
    const map = { idle: '#FF9800', running: '#2196F3', success: '#4CAF50', failed: '#F44336', paused: '#9E9E9E' };
    return map[status] || '#757575';
}

// ==================== 数据管理 ====================

class DataManager {
    constructor() {
        this.storage = storages.create(CONFIG.storageName);
    }

    // 获取所有任务
    getTasks() {
        return this.storage.get('tasks') || [];
    }

    // 保存任务
    saveTasks(tasks) {
        this.storage.put('tasks', tasks);
    }

    // 添加任务
    addTask(task) {
        const tasks = this.getTasks();
        tasks.push(task);
        this.saveTasks(tasks);
        return task;
    }

    // 更新任务
    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updates };
            this.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    }

    // 删除任务
    deleteTask(taskId) {
        const tasks = this.getTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        this.saveTasks(filtered);
        return filtered.length !== tasks.length;
    }

    // 获取任务
    getTask(taskId) {
        const tasks = this.getTasks();
        return tasks.find(t => t.id === taskId);
    }
}

// ==================== 任务执行器 ====================

class TaskExecutor {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.runningTasks = new Map();
    }

    // 执行任务
    executeTask(taskId) {
        const task = this.dataManager.getTask(taskId);
        if (!task) {
            toast('任务不存在');
            return false;
        }

        // 更新状态为执行中
        this.dataManager.updateTask(taskId, {
            status: 'running',
            lastRunTime: Date.now(),
            runCount: (task.runCount || 0) + 1
        });

        // 在新线程中执行
        const thread = threads.start(() => {
            try {
                // 执行脚本
                eval(task.script);
                
                // 执行成功
                this.dataManager.updateTask(taskId, { status: 'success' });
                toast('任务执行成功');
            } catch (error) {
                // 执行失败
                this.dataManager.updateTask(taskId, { status: 'failed' });
                toast('任务执行失败: ' + error.message);
                console.error('任务执行错误:', error);
            } finally {
                this.runningTasks.delete(taskId);
            }
        });

        this.runningTasks.set(taskId, thread);
        toast('任务开始执行...');
        return true;
    }

    // 停止任务
    stopTask(taskId) {
        const thread = this.runningTasks.get(taskId);
        if (thread) {
            thread.interrupt();
            this.runningTasks.delete(taskId);
            this.dataManager.updateTask(taskId, { status: 'paused' });
            toast('任务已停止');
            return true;
        }
        return false;
    }
}

// ==================== 市场服务 ====================

class MarketService {
    // 获取市场任务列表
    async getMarketTasks() {
        try {
            // 模拟数据
            return [
                {
                    id: 'market_1',
                    name: '微信自动回复',
                    author: '张三',
                    description: '自动回复微信消息，支持关键词匹配',
                    downloads: 1234,
                    rating: 4.5,
                    script: 'console.log("微信自动回复脚本");\ntoast("开始执行微信自动回复");'
                },
                {
                    id: 'market_2',
                    name: '抖音自动点赞',
                    author: '李四',
                    description: '自动点赞推荐视频，增加账号活跃度',
                    downloads: 856,
                    rating: 4.2,
                    script: 'console.log("抖音自动点赞脚本");\ntoast("开始执行抖音自动点赞");'
                }
            ];
        } catch (error) {
            console.error('获取市场数据失败:', error);
            return [];
        }
    }

    // 导入市场任务
    importMarketTask(marketTask, dataManager) {
        const localTask = {
            id: 'local_' + Date.now(),
            name: marketTask.name,
            description: marketTask.description,
            script: marketTask.script,
            status: 'idle',
            createTime: Date.now(),
            lastRunTime: null,
            runCount: 0,
            source: 'market',
            marketId: marketTask.id
        };

        return dataManager.addTask(localTask);
    }
}

// ==================== UI管理器 ====================

class UIManager {
    constructor(dataManager, taskExecutor, marketService) {
        this.dataManager = dataManager;
        this.taskExecutor = taskExecutor;
        this.marketService = marketService;
        this.currentView = 'main';
    }

    // 显示主界面
    showMainView() {
        this.currentView = 'main';
        
        ui.layout(`
            <vertical>
                <!-- 标题栏 -->
                <horizontal bg="#2196F3" padding="16">
                    <text text="${CONFIG.appName}" textSize="24sp" textColor="white" layout_weight="1"/>
                    <button id="btn_settings" text="设置" textSize="14sp"/>
                </horizontal>
                
                <!-- 任务列表 -->
                <frame layout_weight="1">
                    <list id="task_list">
                        <horizontal padding="16" bg="?selectableItemBackground">
                            <vertical layout_weight="1">
                                <text id="task_name" text="{{this.name}}" textSize="18sp" textColor="#212121"/>
                                <text id="task_desc" text="{{this.description}}" textSize="14sp" textColor="#757575" maxLines="1"/>
                                <horizontal marginTop="8">
                                    <text id="task_status" text="{{this.statusText}}" textSize="12sp" textColor="{{this.statusColor}}"/>
                                    <text id="task_time" text="{{this.lastRunTimeText}}" textSize="12sp" textColor="#9E9E9E" layout_weight="1" gravity="right"/>
                                </horizontal>
                            </vertical>
                            <vertical>
                                <button id="btn_run" text="执行" marginLeft="8"/>
                                <button id="btn_manage" text="管理" marginLeft="8" marginTop="4"/>
                            </vertical>
                        </horizontal>
                    </list>
                    
                    <!-- 空状态 -->
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
                
                <!-- 添加按钮 -->
                <frame gravity="bottom|right" margin="16">
                    <button id="btn_add" w="56" h="56" bg="#2196F3" text="+" textSize="24sp" textColor="white" style="Widget.AppCompat.Button.Colored" circle="true" elevation="8"/>
                </frame>
            </vertical>
        `);

        this.loadTaskList();
        this.bindMainEvents();
    }

    // 加载任务列表
    loadTaskList() {
        const tasks = this.dataManager.getTasks().map(task => ({
            ...task,
            statusText: getStatusText(task.status),
            statusColor: getStatusColor(task.status),
            lastRunTimeText: formatTime(task.lastRunTime)
        }));

        ui.task_list.setDataSource(tasks);
        ui.empty_view.visibility = tasks.length === 0 ? 'visible' : 'gone';
    }

    // 绑定主界面事件
    bindMainEvents() {
        // 任务点击
        ui.task_list.on('item_click', (item) => {
            this.showTaskDetail(item.id);
        });

        // 执行按钮
        ui.task_list.on('item_bind', (itemView, itemHolder) => {
            itemView.btn_run.on('click', () => {
                this.taskExecutor.executeTask(itemHolder.item.id);
                setTimeout(() => this.loadTaskList(), 500);
            });

            itemView.btn_manage.on('click', () => {
                this.showTaskManagement(itemHolder.item.id);
            });
        });

        // 底部导航
        ui.btn_tasks.on('click', () => {
            this.showMainView();
        });

        ui.btn_market.on('click', () => {
            this.showMarketView();
        });

        // 添加按钮
        ui.btn_add.on('click', () => {
            this.showAddTaskDialog();
        });

        // 设置按钮
        ui.btn_settings.on('click', () => {
            this.showSettings();
        });
    }

    // 显示任务详情
    showTaskDetail(taskId) {
        const task = this.dataManager.getTask(taskId);
        if (!task) return;

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
                        
                        <!-- 任务信息卡片 -->
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
                        
                        <!-- 操作按钮 -->
                        <horizontal marginTop="16">
                            <button id="btn_run_now" text="立即执行" layout_weight="1" style="Widget.AppCompat.Button.Colored" bg="#4CAF50"/>
                            <button id="btn_delete" text="删除" layout_weight="1" marginLeft="8" style="Widget.AppCompat.Button.Colored" bg="#F44336"/>
                        </horizontal>
                    </vertical>
                </scroll>
            </vertical>
        `);

        // 绑定事件
        ui.btn_back.on('click', () => {
            this.showMainView();
        });

        ui.btn_edit.on('click', () => {
            this.showEditTask(taskId);
        });

        ui.btn_run_now.on('click', () => {
            this.taskExecutor.executeTask(taskId);
            setTimeout(() => this.showTaskDetail(taskId), 1000);
        });

        ui.btn_delete.on('click', () => {
            dialogs.confirm('删除任务', `确定要删除任务"${task.name}"吗？`, (confirmed) => {
                if (confirmed) {
                    this.dataManager.deleteTask(taskId);
                    toast('任务已删除');
                    this.showMainView();
                }
            });
        });
    }

    // 显示任务市场
    async showMarketView() {
        this.currentView = 'market';

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
                <vertical id="loading_view" gravity="center">
                    <progressbar indeterminate="true"/>
                    <text text="加载中..." textSize="14sp" textColor="#757575" marginTop="8"/>
                </vertical>
            </vertical>
        `);

        // 加载市场数据
        ui.loading_view.visibility = 'visible';
        const marketTasks = await this.marketService.getMarketTasks();
        ui.market_list.setDataSource(marketTasks);
        ui.loading_view.visibility = 'gone';

        // 绑定事件
        ui.btn_back.on('click', () => {
            this.showMainView();
        });

        ui.btn_refresh.on('click', () => {
            this.showMarketView();
        });

        ui.market_list.on('item_click', (item) => {
            this.showMarketTaskDetail(item);
        });

        ui.market_list.on('item_bind', (itemView, itemHolder) => {
            itemView.btn_import.on('click', () => {
                this.importMarketTask(itemHolder.item);
            });
        });
    }

    // 显示市场任务详情
    showMarketTaskDetail(marketTask) {
        ui.layout(`
            <vertical>
                <horizontal bg="#2196F3" padding="16">
                    <button id="btn_back" text="返回" textColor="white"/>
                    <text text="任务详情" textSize="20sp" textColor="white" layout_weight="1" gravity="center"/>
                    <button id="btn_import" text="导入" textColor="white"/>
                </horizontal>
                
                <scroll>
                    <vertical padding="16">
                        <text text="${marketTask.name}" textSize="24sp" textColor="#212121"/>
                        <text text="作者：${marketTask.author}" textSize="14sp" textColor="#757575" marginTop="4"/>
                        
                        <horizontal marginTop="8">
                            <text text="下载：${marketTask.downloads}" textSize="12sp" text