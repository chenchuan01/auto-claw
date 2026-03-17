/**
 * AutoX Task Manager - 完整版本 v1.0
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

// 工具函数
function getStatusText(status) {
    const map = { idle: '待执行', running: '执行中', success: '成功', failed: '失败', paused: '已暂停' };
    return map[status] || '未知';
}

function getStatusColor(status) {
    const map = { idle: '#FF9800', running: '#2196F3', success: '#4CAF50', failed: '#F44336', paused: '#9E9E9E' };
    return map[status] || '#757575';
}

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

// 主界面
function showMainUI() {
    ui.layout(`
        <vertical>
            <horizontal bg="#2196F3" padding="16">
                <text text="${CONFIG.appName}" textSize="24sp" textColor="white" layout_weight="1"/>
                <button id="btn_settings" text="设置" textSize="14sp"/>
            </horizontal>
            
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
                
                <vertical id="empty_view" visibility="gone" gravity="center">
                    <text text="暂无任务" textSize="18sp" textColor="#757575" marginTop="16"/>
                    <text text="点击右下角按钮添加任务" textSize="14sp" textColor="#9E9E9E" marginTop="8"/>
                </vertical>
            </frame>
            
            <horizontal bg="#FFFFFF" elevation="8">
                <button id="btn_tasks" text="任务管理" layout_weight="1" style="Widget.AppCompat.Button.Borderless" textColor="#2196F3"/>
                <button id="btn_market" text="任务市场" layout_weight="1" style="Widget.AppCompat.Button.Borderless" textColor="#757575"/>
            </horizontal>
            
            <frame gravity="bottom|right" margin="16">
                <button id="btn_add" w="56" h="56" bg="#2196F3" text="+" textSize="24sp" textColor="white" style="Widget.AppCompat.Button.Colored" circle="true" elevation="8"/>
            </frame>
        </vertical>
    `);
    
    initData();
    bindEvents();
}

// 初始化数据
function initData() {
    let tasks = storage.get('tasks') || [];
    updateTaskList(tasks);
    ui.empty_view.visibility = tasks.length === 0 ? 'visible' : 'gone';
}

// 更新任务列表
function updateTaskList(tasks) {
    const processedTasks = tasks.map(task => ({
        ...task,
        statusText: getStatusText(task.status),
        statusColor: getStatusColor(task.status),
        lastRunTimeText: formatTime(task.lastRunTime)
    }));
    ui.task_list.setDataSource(processedTasks);
}

// 绑定事件
function bindEvents() {
    ui.task_list.on('item_click', (item) => {
        showTaskDetail(item);
    });
    
    ui.task_list.on('item_bind', (itemView, itemHolder) => {
        itemView.btn_run.on('click', () => {
            runTask(itemHolder.item);
        });
        itemView.btn_manage.on('click', () => {
            manageTask(itemHolder.item);
        });
    });
    
    ui.btn_tasks.on('click', () => {
        initData();
        ui.btn_tasks.setTextColor('#2196F3');
        ui.btn_market.setTextColor('#757575');
    });
    
    ui.btn_market.on('click', () => {
        showTaskMarket();
        ui.btn_tasks.setTextColor('#757575');
        ui.btn_market.setTextColor('#2196F3');
    });
    
    ui.btn_add.on('click', () => {
        showAddTaskDialog();
    });
    
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
                    
                    <horizontal marginTop="16">
                        <button id="btn_run_now" text="立即执行" layout_weight="1" style="Widget.AppCompat.Button.Colored" bg="#4CAF50"/>
                        <button id="btn_delete" text="删除" layout_weight="1" marginLeft="8" style="Widget.AppCompat.Button.Colored" bg="#F44336"/>
                    </horizontal>
                </vertical>
            </scroll>
        </vertical>
    `);
    
    ui.btn_back.on('click', () => {
        showMainUI();
    });
    
    ui.btn_edit.on('click', () => {
        editTask(task);
    });
    
    ui.btn_run_now.on('click', () => {
        runTask(task);
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
            
            <vertical id="loading_view" gravity="center">
                <progressbar indeterminate="true"/>
                <text text="加载中..." textSize="14sp" textColor="#757575" marginTop="8"/>
            </vertical>
        </vertical>
    `);
    
    loadMarketData();
    
    ui.btn_back.on('click', () => {
        showMainUI();
    });
    
    ui.btn_refresh.on('click', () => {
        loadMarketData();
    });
    
    ui.market_list.on('item_click', (item) => {
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
    
    setTimeout(() => {
        const marketTasks = [
            {
                id: '1',
                name: '微信自动回复',
                author: '张三',
                description: '自动回复微信消息，支持关键词匹配',
                downloads: 1234,
                rating: 4.5,
                script: 'console.log("微信自动回复");'
            },
            {
                id: '2',
                name: '抖音自动点赞',
                author: '李四',
                description: '自动点赞推荐视频',
                downloads: 856,
                rating: 4.2,
                script: 'console.log("抖音自动点赞");'
            }
        ];
        
        ui.market_list.setDataSource(marketTasks);
        ui.loading_view.visibility = 'gone';
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
                    
                    <button id="btn_import_now" text="立即导入" marginTop="16" style="Widget.AppCompat.Button.Colored" bg="#4CAF50"/>
                </vertical>
            </scroll>
        </vertical>
    `);
    
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
    dialogs.confirm('导入任务', `确定要导入任务"${marketTask.name}"吗？`, (confirmed) => {
        if (confirmed) {
            const newTask = {
                id: 'task_' + Date.now(),
                name: marketTask.name,
                description: marketTask.description,
                script: marketTask.script,
                status: 'idle',
                createTime: Date.now(),
                lastRunTime: null,
                runCount: 0,
                source: 'market'
            };
            
            let tasks = storage.get('tasks') || [];
            tasks.push(newTask);
            storage.put('tasks', tasks);
            
            toast('任务导入成功');
            showMainUI();
        }
    });
}

// 运行任务
function runTask(task) {
    dialogs.confirm('执行任务', `确定要执行任务"${task.name}"吗？`, (confirmed) => {
        if (confirmed) {
            // 更新任务状态
            let tasks = storage.get('tasks') || [];
            const index = tasks.findIndex(t => t.id === task.id);
            if (index !== -1) {
                tasks[index].status = 'running';
                tasks[index].lastRunTime = Date.now();
                tasks[index].runCount = (tasks[index].runCount || 0) + 1;
                storage.put('tasks', tasks);
            }
            
            toast('任务开始执行...');
            
            // 在新线程中执行脚本
            threads.start(() => {
                try {
                    eval(task.script || 'console.log("无脚本内容")');
                    
                    // 执行成功
                    tasks = storage.get('tasks') || [];
                    const taskIndex = tasks.findIndex(t => t.id === task.id);
                    if (taskIndex !== -1) {
                        tasks[taskIndex].status = 'success';
                        storage.put('tasks', tasks);
                    }
                    
                    toast('任务执行成功');
                } catch (error) {
                    // 执行失败
                    tasks = storage.get('tasks') || [];
                    const taskIndex = tasks.findIndex(t => t.id === task.id);
                    if (taskIndex !== -1) {
                        tasks[taskIndex].status = 'failed';
                        storage.put('tasks', tasks);
                    }
                    
                    toast('任务执行失败: ' + error.message);
                }
            });
        }
    });
}

// 管理任务
function manageTask(task) {
    const options = ['编辑任务', '定时执行', '导出脚本', '分享任务', '删除任务'];
    
    dialogs.select('任务管理', options, (index) => {
        if (index >= 0) {
            const action = options[index];
            switch (action) {
                case '编辑任务':
                    editTask(task);
                    break;
                case '定时执行':
                    scheduleTask(task);
                    break;
                case '导出脚本':
                    exportScript(task);
                    break;
                case '分享任务':
                    shareTask(task);
                    break;
                case '删除任务':
                    deleteTask(task);
                    break;
            }
        }
    });
}

// 编辑任务
function editTask(task) {
    dialogs.rawInput('编辑任务', '请输入任务名称：', task.name, (name) => {
        if (name) {
            dialogs.rawInput('编辑任务', '请输入任务描述：', task.description || '', (description) => {
                dialogs.rawInput('编辑任务', '请输入任务脚本：', task.script || '', (script) => {
                    let tasks = storage.get('tasks') || [];
                    const index = tasks.findIndex(t => t.id === task.id);
                    if (index !== -1) {
                        tasks[index].name = name;
                        tasks[index].description = description;
                        tasks[index].script = script;
                        storage.put('tasks', tasks);
                        toast('任务更新成功');
                        showMainUI();
                    }
                });
            });
        }
    });
}

// 删除任务
function deleteTask(task) {
    dialogs.confirm('删除任务', `确定要删除任务"${task.name}"吗？`, (confirmed) => {
        if (