/**
 * UI管理器模块 - 完整版本
 * 负责所有界面显示和用户交互
 */

const ui = require('ui');
const dialogs = require('dialogs');
const { toast } = require('globals');
const Config = require('./config');

class UIManager {
    constructor(dataManager, taskExecutor, marketService) {
        this.dataManager = dataManager;
        this.taskExecutor = taskExecutor;
        this.marketService = marketService;
        this.currentView = 'main';
        this.currentTaskId = null;
    }
    
    // 显示主界面
    showMainView() {
        this.currentView = 'main';
        
        ui.layout(`
            <vertical>
                <!-- 标题栏 -->
                <horizontal bg="${Config.colors.primary}" padding="16">
                    <text text="${Config.appName}" textSize="24sp" textColor="white" layout_weight="1"/>
                    <button id="btn_settings" text="设置" textSize="14sp" textColor="white"/>
                </horizontal>
                
                <!-- 任务列表 -->
                <frame layout_weight="1">
                    <list id="task_list">
                        <card w="*" h="auto" margin="8" elevation="2">
                            <vertical padding="16">
                                <horizontal>
                                    <vertical layout_weight="1">
                                        <text id="task_name" text="{{this.name}}" textSize="18sp" textColor="${Config.colors.textPrimary}"/>
                                        <text id="task_desc" text="{{this.description}}" textSize="14sp" textColor="${Config.colors.textSecondary}" maxLines="1" marginTop="4"/>
                                    </vertical>
                                    <text id="task_status" text="{{this.statusText}}" textSize="12sp" textColor="{{this.statusColor}}" padding="4 8" cornerRadius="12"/>
                                </horizontal>
                                <horizontal marginTop="8">
                                    <text id="task_time" text="{{this.lastRunTimeText}}" textSize="12sp" textColor="${Config.colors.textHint}"/>
                                    <text id="task_count" text="执行 {{this.runCount}} 次" textSize="12sp" textColor="${Config.colors.textHint}" layout_weight="1" gravity="right"/>
                                </horizontal>
                                <horizontal marginTop="8">
                                    <button id="btn_run" text="执行" layout_weight="1" marginRight="4"/>
                                    <button id="btn_manage" text="管理" layout_weight="1" marginLeft="4"/>
                                </horizontal>
                            </vertical>
                        </card>
                    </list>
                    
                    <!-- 空状态 -->
                    <vertical id="empty_view" visibility="gone" gravity="center" padding="32">
                        <text text="📋" textSize="48sp" textColor="${Config.colors.textHint}"/>
                        <text text="暂无任务" textSize="18sp" textColor="${Config.colors.textPrimary}" marginTop="16"/>
                        <text text="点击右下角按钮添加第一个任务" textSize="14sp" textColor="${Config.colors.textSecondary}" marginTop="8"/>
                    </vertical>
                </frame>
                
                <!-- 底部导航 -->
                <horizontal bg="${Config.colors.background}" elevation="8">
                    <button id="btn_tasks" text="📋 任务" layout_weight="1" style="Widget.AppCompat.Button.Borderless" textColor="${Config.colors.primary}"/>
                    <button id="btn_market" text="🛒 市场" layout_weight="1" style="Widget.AppCompat.Button.Borderless" textColor="${Config.colors.textSecondary}"/>
                </horizontal>
                
                <!-- 浮动操作按钮 -->
                <frame gravity="bottom|right" margin="16">
                    <button id="btn_add" w="56" h="56" bg="${Config.colors.primary}" text="+" textSize="24sp" textColor="white" style="Widget.AppCompat.Button.Colored" circle="true" elevation="8"/>
                </frame>
            </vertical>
        `);
        
        this.loadMainData();
        this.bindMainEvents();
    }
    
    // 加载主界面数据
    loadMainData() {
        const tasks = this.dataManager.getTasks().map(task => ({
            ...task,
            statusText: Config.statusMap[task.status]?.text || '未知',
            statusColor: Config.statusMap[task.status]?.color || Config.colors.textSecondary,
            lastRunTimeText: this.formatTime(task.lastRunTime),
            runCount: task.runCount || 0
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
                this.executeTask(itemHolder.item.id);
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
        const task = this.dataManager.getTaskById(taskId);
        if (!task) {
            toast('任务不存在');
            return;
        }
        
        this.currentTaskId = taskId;
        this.currentView = 'task_detail';
        
        const statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;
        
        ui.layout(`
            <vertical>
                <!-- 标题栏 -->
                <horizontal bg="${Config.colors.primary}" padding="16">
                    <button id="btn_back" text="返回" textColor="white"/>
                    <text text="任务详情" textSize="20sp" textColor="white" layout_weight="1" gravity="center"/>
                    <button id="btn_edit" text="编辑" textColor="white"/>
                </horizontal>
                
                <scroll>
                    <vertical padding="16">
                        <!-- 任务标题 -->
                        <text text="${task.name}" textSize="24sp" textColor="${Config.colors.textPrimary}"/>
                        <text text="${task.description || '无描述'}" textSize="16sp" textColor="${Config.colors.textSecondary}" marginTop="8"/>
                        
                        <!-- 状态标签 -->
                        <horizontal marginTop="16">
                            <text text="${statusInfo.text}" textSize="14sp" textColor="white" padding="8 16" bg="${statusInfo.color}" cornerRadius="20"/>
                            <text text="执行 ${task.runCount || 0} 次" textSize="14sp" textColor="${Config.colors.textSecondary}" layout_weight="1" gravity="right"/>
                        </horizontal>
                        
                        <!-- 任务信息卡片 -->
                        <card w="*" h="auto" marginTop="16" elevation="2">
                            <vertical padding="16">
                                <text text="📋 任务信息" textSize="18sp" textColor="${Config.colors.textPrimary}" marginBottom="12"/>
                                
                                <horizontal marginTop="8">
                                    <text text="创建时间：" textSize="14sp" textColor="${Config.colors.textSecondary}" layout_weight="1"/>
                                    <text text="${this.formatTime(task.createTime)}" textSize="14sp" textColor="${Config.colors.textPrimary}"/>
                                </horizontal>
                                
                                <horizontal marginTop="8">
                                    <text text="最后执行：" textSize="14sp" textColor="${Config.colors.textSecondary}" layout_weight="1"/>
                                    <text text="${this.formatTime(task.lastRunTime)}" textSize="14sp" textColor="${Config.colors.textPrimary}"/>
                                </horizontal>
                                
                                <horizontal marginTop="8">
                                    <text text="任务来源：" textSize="14sp" textColor="${Config.colors.textSecondary}" layout_weight="1"/>
                                    <text text="${task.source === 'market' ? '市场导入' : '本地创建'}" textSize="14sp" textColor="${Config.colors.textPrimary}"/>
                                </horizontal>
                            </vertical>
                        </card>
                        
                        <!-- 操作按钮 -->
                        <horizontal marginTop="24">
                            <button id="btn_run_now" text="▶️ 执行" layout_weight="1" style="Widget.AppCompat.Button.Colored" bg="${Config.colors.success}" marginRight="8"/>
                            <button id="btn_logs" text="📝 日志" layout_weight="1" style="Widget.AppCompat.Button.Colored" bg="${Config.colors.info}"/>
                        </horizontal>
                        
                        <!-- 更多操作 -->
                        <horizontal marginTop="12">
                            <button id="btn_export" text="📤 导出" layout_weight="1" marginRight="8"/>
                            <button id="btn_delete" text="🗑️ 删除" layout_weight="1" style="Widget.AppCompat.Button.Colored" bg="${Config.colors.error}"/>
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
            this.executeTask(taskId);
        });
        
        ui.btn_logs.on('click', () => {
            this.showTaskLogs(taskId);
        });
        
        ui.btn_export.on('click', () => {
            this.showExportOptions(taskId);
        });
        
        ui.btn_delete.on('click', () => {
            this.confirmDeleteTask(taskId);
        });
    }
    
    // 显示任务市场
    async showMarketView() {
        this.currentView = 'market';
        
        ui.layout(`
            <vertical>
                <!-- 标题栏 -->
                <horizontal bg="${Config.colors.primary}" padding="16">
                    <button id="btn_back" text="返回" textColor="white"/>
                    <text text="🛒 任务市场" textSize="20sp" textColor="white" layout_weight="1" gravity="center"/>
                    <button id="btn_refresh" text="刷新" textColor="white"/>
                </horizontal>
                
                <!-- 市场任务列表 -->
                <list id="market_list">
                    <card w="*" h="auto" margin="8" elevation="2">
                        <vertical padding="16">
                            <horizontal>
                                <vertical layout_weight="1">
                                    <text id="market_name" text="{{this.name}}" textSize="18sp" textColor="${Config.colors.textPrimary}"/>
                                    <text id="market_author" text="作者：{{this.author}}" textSize="12sp" textColor="${Config.colors.textSecondary}" marginTop="4"/>
                                </vertical>
                                <button id="btn_import" text="导入" marginLeft="8"/>
                            </horizontal>
                            <text id="market_desc" text="{{this.description}}" textSize="14sp" textColor="${Config.colors.textSecondary}" marginTop="8" maxLines="2"/>
                            <horizontal marginTop="8">
                                <text id="market_downloads" text="⬇️ {{this.downloads}}" textSize="12sp" textColor="${Config.colors.textHint}"/>
                                <text id="market_rating" text="⭐ {{this.rating}}" textSize="12sp" textColor="#FF9800" layout_weight="1" gravity="right"/>
                            </horizontal>
                        </vertical>
                    </card>
                </list>
                
                <!-- 加载中 -->
                <vertical id="loading_view" gravity="center" padding="32">
                    <progressbar indeterminate="true"/>
                    <text text="加载市场任务..." textSize="14sp" textColor="${Config.colors.textSecondary}" marginTop="8"/>
                </vertical>
            </vertical>
        `);
        
        // 加载市场数据
        await this.loadMarketData();
        
        // 绑定事件
        this.bindMarketEvents();
    }
    
    // 加载市场数据
    async loadMarketData() {
        ui.loading_view.visibility = 'visible';
        
        try {
            const marketTasks = await this.marketService.getMarketTasks();
            ui.market_list.setDataSource(marketTasks);
        } catch (error) {
            toast('加载市场数据失败: ' + error.message);
        } finally {
            ui.loading_view.visibility = 'gone';
        }
    }
    
    // 绑定市场界面事件
    bindMarketEvents() {
        ui.btn_back.on('click', () => {
            this.showMainView();
        });
        
        ui.btn_refresh.on('click', async () => {
            await this.loadMarketData();
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
                <horizontal bg="${Config.colors.primary}" padding="16">
                    <button id="btn_back" text="返回" textColor="white"/>
                    <text text="任务详情" textSize="20sp" textColor="white" layout_weight="1" gravity="center"/>
                    <button id="btn_import" text="导入" textColor="white"/>
                </horizontal>
                
                <scroll>
                    <vertical padding="16">
                        <text text="${marketTask.name}" textSize="24sp" textColor="${Config.colors.textPrimary}"/>
                        <text text="作者：${marketTask.author}" textSize="14sp" textColor="${Config.colors.textSecondary}" marginTop="4"/>
                        
                        <horizontal marginTop="8">
                            <text text="⬇️ ${marketTask.downloads}" textSize="12sp" textColor="${Config.colors.textHint}"/>
                            <text text="⭐ ${marketTask.rating}" textSize="12sp" textColor="#FF9800" layout_weight="1" gravity="right"/>
                        </horizontal>
                        
                        <card w="*" h="auto" marginTop="16" elevation="2">
                            <vertical padding="16">
                                <text text="任务简介" textSize="18sp" textColor="${Config.colors.textPrimary}" marginBottom="8"/>
                                <text text="${marketTask.description}" textSize="14sp" textColor="${Config.colors.textPrimary}"/>
                            </vertical>
                        </card>
                        
                        <button id="btn_import_now" text="立即导入" marginTop="16" style="Widget.AppCompat.Button.Colored" bg="${Config.colors.success}"/>
                    </vertical>
                </scroll>
            </vertical>
        `);
        
        ui.btn_back.on('click', () => {
            this.showMarketView();
        });
        
        ui.btn_import.on('click', () => {
            this.importMarketTask(marketTask);
        });
        
        ui.btn_import_now.on('click', () => {
            this.importMarketTask(marketTask);
        });
    }
    
    // 导入市场任务
    importMarketTask(marketTask) {
        dialogs.confirm('导入任务', `确定要导入任务"${marketTask.name}"吗？`, (confirmed) => {
            if (confirmed) {
                const newTask = {
                    name: marketTask.name,
                    description: marketTask.description,
                    script: marketTask.script,
                    source: 'market',
                    marketId: marketTask.id
                };
                
                this.dataManager.addTask(newTask);
                toast('任务导入成功');
                this.showMainView();
            }
        });
    }
    
    // 执行任务
    executeTask(taskId) {
        const success = this.taskExecutor.executeTask(taskId);
        if (success) {
            setTimeout(() => this.loadMainData(), 1000);
        }
    }
    
    // 显示任务管理菜单
    showTaskManagement(taskId) {
        const task = this.dataManager.getTaskById(taskId);
        if (!task) return;
        
        const options = ['编辑任务', '查看日志', '导出脚本', '定时执行', '删除任务'];
        
        dialogs.select('任务管理', options, (index) => {
            if (index >= 0) {
                const action = options[index];
                switch (action) {
                    case '编辑任务':
                        this.showEditTask(taskId);
                        break;
                    case '查看日志':
                        this.showTaskLogs(taskId);
                        break;
                    case '导出脚本':
                        this.exportTaskScript(taskId);
                        break;
                    case '定时执行':
                        this.showScheduleDialog(taskId);
                        break;
                    case '删除任务':
                        this.confirmDeleteTask(taskId);
                        break;
                }
            }
        });
    }
    
    // 显示编辑任务对话框
    showEditTask(taskId) {
        const task = this.dataManager.getTaskById(taskId);
        if (!task) return;
        
        dialogs.rawInput('编辑任务名称', '请输入任务名称：', task.name, (name) => {
            if (name && name.trim()) {
                dialogs.rawInput('编辑任务描述', '请输入任务描述：', task.description || '', (description) => {
                    dialogs.rawInput('编辑任务脚本', '请输入任务脚本：', task.script || Config.defaultScript, (script) => {
                        this.dataManager.updateTask(taskId, {
                            name: name.trim(),
                            description: description.trim(),
                            script: script
                        });
                        toast('任务更新成功');
                        this.showMainView();
                    });
                });
            }
        });
    }
    
    // 显示添加任务对话框
    showAddTaskDialog() {
        dialogs.rawInput('新建任务', '请输入任务名称：', '', (name) => {
            if (name && name.trim()) {
