/**
 * UI管理器模块 - 深色主题版
 */

var Config = require('./config');
var C = Config.colors;

function UIManager(dataManager, taskExecutor, marketService, recorder) {
    this.dataManager = dataManager;
    this.taskExecutor = taskExecutor;
    this.marketService = marketService;
    this.recorder = recorder;
    this.currentView = 'main';
    this.currentTaskId = null;
    this.fabWindow = null;
}

// ─── 主界面 ───────────────────────────────────────────────
UIManager.prototype.showMainView = function() {
    var self = this;
    this.currentView = 'main';

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <horizontal bg="' + C.card + '" padding="16 14" gravity="center_vertical">' +
        '    <vertical layout_weight="1">' +
        '      <text text="AutoClaw" textSize="22sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '      <text text="自动化任务管理" textSize="11sp" textColor="' + C.textHint + '" marginTop="2"/>' +
        '    </vertical>' +
        '    <text id="btn_settings" text="⚙" textSize="22sp" textColor="' + C.textSecondary + '" padding="8"/>' +
        '  </horizontal>' +
        '  <frame layout_weight="1">' +
        '    <list id="task_list" bg="' + C.bg + '">' +
        '      <vertical margin="12 6 12 6" bg="' + C.card + '" cornerRadius="14" padding="16" w="*">' +
        '        <horizontal gravity="center_vertical">' +
        '          <vertical layout_weight="1">' +
        '            <text id="task_name" text="{{this.name}}" textSize="16sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '            <text id="task_desc" text="{{this.description}}" textSize="12sp" textColor="' + C.textSecondary + '" maxLines="1" marginTop="3"/>' +
        '          </vertical>' +
        '          <text id="task_status" text="{{this.statusText}}" textSize="11sp" textColor="{{this.statusColor}}" bg="{{this.statusBg}}" padding="4 10" cornerRadius="20" marginLeft="8"/>' +
        '        </horizontal>' +
        '        <horizontal marginTop="10" gravity="center_vertical">' +
        '          <text id="task_time" text="{{this.lastRunTimeText}}" textSize="11sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text id="task_count" text="执行 {{this.runCount}} 次" textSize="11sp" textColor="' + C.textHint + '"/>' +
        '        </horizontal>' +
        '        <horizontal marginTop="12">' +
        '          <button id="btn_run" text="▶ 执行" layout_weight="1" marginRight="6" bg="' + C.primary + '" textColor="white" textSize="13sp" cornerRadius="8" h="36"/>' +
        '          <button id="btn_manage" text="管理" layout_weight="1" marginLeft="6" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="13sp" cornerRadius="8" h="36"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '    </list>' +
        '    <vertical id="empty_view" visibility="gone" gravity="center" bg="' + C.bg + '">' +
        '      <text text="📋" textSize="56sp" gravity="center"/>' +
        '      <text text="暂无任务" textSize="16sp" textColor="' + C.textSecondary + '" marginTop="12" gravity="center"/>' +
        '      <text text="点击右下角 + 添加第一个任务" textSize="12sp" textColor="' + C.textHint + '" marginTop="6" gravity="center"/>' +
        '    </vertical>' +
        '  </frame>' +
        '  <horizontal bg="' + C.card + '" padding="0 4">' +
        '    <vertical id="btn_tasks" layout_weight="1" gravity="center" padding="10 8">' +
        '      <text text="📋" textSize="20sp" gravity="center"/>' +
        '      <text text="任务列表" textSize="10sp" textColor="' + C.primary + '" gravity="center" marginTop="3"/>' +
        '    </vertical>' +
        '    <vertical id="btn_add" layout_weight="1" gravity="center" padding="6 4">' +
        '      <button text="+" w="48" h="48" bg="' + C.primary + '" textColor="white" textSize="26sp" style="Widget.AppCompat.Button" gravity="center"/>' +
        '    </vertical>' +
        '    <vertical id="btn_market" layout_weight="1" gravity="center" padding="10 8">' +
        '      <text text="🛒" textSize="20sp" gravity="center"/>' +
        '      <text text="任务市场" textSize="10sp" textColor="' + C.textHint + '" gravity="center" marginTop="3"/>' +
        '    </vertical>' +
        '  </horizontal>' +
        '</vertical>'
    );

    this.loadMainData();
    this.bindMainEvents();
    this.setupFab();
};

// ─── 数据加载 ─────────────────────────────────────────────
UIManager.prototype.loadMainData = function() {
    var self = this;
    var tasks = this.dataManager.getTasks().map(function(task) {
        var statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;
        return {
            id: task.id,
            name: task.name,
            description: task.description || '暂无描述',
            statusText: statusInfo.text,
            statusColor: statusInfo.color,
            statusBg: statusInfo.color + '22',
            lastRunTimeText: self.formatTime(task.lastRunTime),
            runCount: task.runCount || 0
        };
    });

    ui.task_list.setDataSource(tasks);
    ui.empty_view.attr('visibility', tasks.length === 0 ? 'visible' : 'gone');
};

// ─── 事件绑定 ─────────────────────────────────────────────
UIManager.prototype.bindMainEvents = function() {
    var self = this;

    ui.task_list.on('item_click', function(item) {
        self.showTaskDetail(item.id);
    });

    ui.task_list.on('item_bind', function(itemView, itemHolder) {
        itemView.btn_run.on('click', function() {
            self.executeTask(itemHolder.item.id);
        });
        itemView.btn_manage.on('click', function() {
            self.showTaskManagement(itemHolder.item.id);
        });
    });

    ui.btn_tasks.on('click', function() { self.showMainView(); });
    ui.btn_add.on('click', function() { self.showAddMenu(); });
    ui.btn_market.on('click', function() { self.showMarketView(); });
    ui.btn_settings.on('click', function() { self.showSettings(); });
};

// ─── FAB（已内嵌到底部导航，不再使用 floaty）────────────────
UIManager.prototype.setupFab = function() {
    // floaty.window() 在 UI 线程会死锁，改用底部导航栏内嵌按钮
};

UIManager.prototype.showAddMenu = function() {
    var self = this;
    dialogs.select('新建任务', ['✏️  手动输入'], function(index) {
        if (index === 0) self.showAddTaskDialog();
    });
};

UIManager.prototype.startRecording = function() {
    var self = this;
    if (!this.recorder) { toast('录制功能不可用'); return; }
    dialogs.confirm('开始录制', '确定后将回到桌面，执行你想录制的操作，完成后点击悬浮条"停止"。', function(ok) {
        if (!ok) return;
        if (self.fabWindow) {
            try { self.fabWindow.close(); } catch (e) {}
            self.fabWindow = null;
        }
        self.recorder.start();
    });
};

// ─── 任务详情 ─────────────────────────────────────────────
UIManager.prototype.showTaskDetail = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    this.currentTaskId = taskId;
    this.currentView = 'task_detail';
    var statusInfo = Config.statusMap[task.status] || Config.statusMap.idle;

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <horizontal bg="' + C.card + '" padding="12 14" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="22sp" textColor="' + C.textPrimary + '" padding="4 4 12 4"/>' +
        '    <text text="任务详情" textSize="18sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_edit" text="✎" textSize="20sp" textColor="' + C.textSecondary + '" padding="8"/>' +
        '  </horizontal>' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="16">' +
        '      <vertical bg="' + C.card + '" cornerRadius="14" padding="20">' +
        '        <text text="' + task.name + '" textSize="20sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text text="' + (task.description || '暂无描述') + '" textSize="13sp" textColor="' + C.textSecondary + '" marginTop="6"/>' +
        '        <horizontal marginTop="14" gravity="center_vertical">' +
        '          <text text="' + statusInfo.text + '" textSize="12sp" textColor="' + statusInfo.color + '" bg="' + statusInfo.color + '22" padding="4 12" cornerRadius="20"/>' +
        '          <text text="执行 ' + (task.runCount || 0) + ' 次" textSize="12sp" textColor="' + C.textHint + '" layout_weight="1" gravity="right"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <vertical bg="' + C.card + '" cornerRadius="14" padding="20" marginTop="12">' +
        '        <text text="任务信息" textSize="14sp" textColor="' + C.textSecondary + '" textStyle="bold" marginBottom="12"/>' +
        '        <horizontal padding="0 6">' +
        '          <text text="创建时间" textSize="13sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + this.formatTime(task.createTime) + '" textSize="13sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 6" marginTop="8">' +
        '          <text text="最后执行" textSize="13sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + this.formatTime(task.lastRunTime) + '" textSize="13sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '        <horizontal padding="0 6" marginTop="8">' +
        '          <text text="任务来源" textSize="13sp" textColor="' + C.textHint + '" layout_weight="1"/>' +
        '          <text text="' + (task.source === 'market' ? '市场导入' : '本地创建') + '" textSize="13sp" textColor="' + C.textPrimary + '"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <horizontal marginTop="16">' +
        '        <button id="btn_run_now" text="▶  执行" layout_weight="1" marginRight="8" bg="' + C.primary + '" textColor="white" textSize="14sp" cornerRadius="10" h="44"/>' +
        '        <button id="btn_logs" text="📝  日志" layout_weight="1" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="14sp" cornerRadius="10" h="44"/>' +
        '      </horizontal>' +
        '      <horizontal marginTop="10">' +
        '        <button id="btn_export" text="导出" layout_weight="1" marginRight="8" bg="' + C.surface + '" textColor="' + C.textSecondary + '" textSize="14sp" cornerRadius="10" h="44"/>' +
        '        <button id="btn_delete" text="删除" layout_weight="1" bg="#EF444422" textColor="#EF4444" textSize="14sp" cornerRadius="10" h="44"/>' +
        '      </horizontal>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    ui.btn_back.on('click', function() { self.showMainView(); });
    ui.btn_edit.on('click', function() { self.showEditTask(taskId); });
    ui.btn_run_now.on('click', function() { self.executeTask(taskId); });
    ui.btn_logs.on('click', function() { self.showTaskLogs(taskId); });
    ui.btn_export.on('click', function() { self.showExportOptions(taskId); });
    ui.btn_delete.on('click', function() { self.confirmDeleteTask(taskId); });
};

// ─── 任务市场 ─────────────────────────────────────────────
UIManager.prototype.showMarketView = function() {
    var self = this;
    this.currentView = 'market';

    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <horizontal bg="' + C.card + '" padding="12 14" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="22sp" textColor="' + C.textPrimary + '" padding="4 4 12 4"/>' +
        '    <text text="任务市场" textSize="18sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        '    <text id="btn_refresh" text="↻" textSize="22sp" textColor="' + C.textSecondary + '" padding="8"/>' +
        '  </horizontal>' +
        '  <list id="market_list" bg="' + C.bg + '">' +
        '    <vertical margin="12 6 12 6" bg="' + C.card + '" cornerRadius="14" padding="16" w="*">' +
        '      <horizontal gravity="center_vertical">' +
        '        <vertical layout_weight="1">' +
        '          <text id="market_name" text="{{this.name}}" textSize="15sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '          <text id="market_author" text="{{this.author}}" textSize="11sp" textColor="' + C.textHint + '" marginTop="3"/>' +
        '        </vertical>' +
        '        <button id="btn_import" text="导入" bg="' + C.primary + '" textColor="white" textSize="12sp" cornerRadius="8" h="32" w="60" marginLeft="8"/>' +
        '      </horizontal>' +
        '      <text id="market_desc" text="{{this.description}}" textSize="12sp" textColor="' + C.textSecondary + '" marginTop="8" maxLines="2"/>' +
        '      <horizontal marginTop="10">' +
        '        <text id="market_downloads" text="⬇ {{this.downloads}}" textSize="11sp" textColor="' + C.textHint + '"/>' +
        '        <text id="market_rating" text="★ {{this.rating}}" textSize="11sp" textColor="#F59E0B" layout_weight="1" gravity="right"/>' +
        '      </horizontal>' +
        '    </vertical>' +
        '  </list>' +
        '</vertical>'
    );

    this.loadMarketData();
    ui.btn_back.on('click', function() { self.showMainView(); });
    ui.btn_refresh.on('click', function() { self.loadMarketData(); });
    ui.market_list.on('item_click', function(item) { self.showMarketTaskDetail(item); });
    ui.market_list.on('item_bind', function(itemView, itemHolder) {
        itemView.btn_import.on('click', function() { self.importMarketTask(itemHolder.item); });
    });
};

UIManager.prototype.loadMarketData = function() {
    try {
        ui.market_list.setDataSource(this.marketService.getMarketTasks());
    } catch (e) {
        toast('加载市场数据失败: ' + e.message);
    }
};

UIManager.prototype.showMarketTaskDetail = function(marketTask) {
    var self = this;
    ui.layout(
        '<vertical bg="' + C.bg + '">' +
        '  <horizontal bg="' + C.card + '" padding="12 14" gravity="center_vertical">' +
        '    <text id="btn_back" text="←" textSize="22sp" textColor="' + C.textPrimary + '" padding="4 4 12 4"/>' +
        '    <text text="任务详情" textSize="18sp" textColor="' + C.textPrimary + '" textStyle="bold" layout_weight="1"/>' +
        '  </horizontal>' +
        '  <scroll bg="' + C.bg + '">' +
        '    <vertical padding="16">' +
        '      <vertical bg="' + C.card + '" cornerRadius="14" padding="20">' +
        '        <text text="' + marketTask.name + '" textSize="20sp" textColor="' + C.textPrimary + '" textStyle="bold"/>' +
        '        <text text="作者：' + marketTask.author + '" textSize="12sp" textColor="' + C.textHint + '" marginTop="6"/>' +
        '        <horizontal marginTop="10">' +
        '          <text text="⬇ ' + marketTask.downloads + '" textSize="12sp" textColor="' + C.textHint + '"/>' +
        '          <text text="★ ' + marketTask.rating + '" textSize="12sp" textColor="#F59E0B" layout_weight="1" gravity="right"/>' +
        '        </horizontal>' +
        '      </vertical>' +
        '      <vertical bg="' + C.card + '" cornerRadius="14" padding="20" marginTop="12">' +
        '        <text text="任务简介" textSize="14sp" textColor="' + C.textSecondary + '" textStyle="bold" marginBottom="10"/>' +
        '        <text text="' + marketTask.description + '" textSize="13sp" textColor="' + C.textPrimary + '"/>' +
        '      </vertical>' +
        '      <button id="btn_import_task" text="导入任务" bg="' + C.primary + '" textColor="white" textSize="14sp" cornerRadius="10" h="44" marginTop="16"/>' +
        '    </vertical>' +
        '  </scroll>' +
        '</vertical>'
    );

    ui.btn_back.on('click', function() { self.showMarketView(); });
    ui.btn_import_task.on('click', function() { self.importMarketTask(marketTask); });
};

UIManager.prototype.importMarketTask = function(marketTask) {
    var self = this;
    dialogs.confirm('导入任务', '确定要导入任务「' + marketTask.name + '」吗？', function(ok) {
        if (!ok) return;
        try {
            self.dataManager.addTask({
                name: marketTask.name,
                description: marketTask.description,
                script: marketTask.script,
                source: 'market',
                marketId: marketTask.id
            });
            toast('任务导入成功');
            self.showMainView();
        } catch (e) {
            toast('导入失败: ' + e.message);
        }
    });
};

// ─── 任务执行 ─────────────────────────────────────────────
UIManager.prototype.executeTask = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    dialogs.confirm('执行任务', '确定要执行任务「' + task.name + '」吗？', function(ok) {
        if (!ok) return;
        toast('开始执行任务...');
        self.taskExecutor.executeTask(taskId);
    });
};

// ─── 任务管理 ─────────────────────────────────────────────
UIManager.prototype.showTaskManagement = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    dialogs.select('管理任务', ['编辑任务', '查看日志', '导出任务', '删除任务'], function(index) {
        if (index === 0) self.showEditTask(taskId);
        else if (index === 1) self.showTaskLogs(taskId);
        else if (index === 2) self.showExportOptions(taskId);
        else if (index === 3) self.confirmDeleteTask(taskId);
    });
};

UIManager.prototype.showEditTask = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    dialogs.rawInput('编辑任务名称', task.name, task.name, function(name) {
        if (!name || !name.trim()) return;
        dialogs.rawInput('编辑任务描述', task.description || '', task.description || '', function(desc) {
            self.dataManager.updateTask(taskId, {
                name: name.trim(),
                description: desc ? desc.trim() : ''
            });
            toast('任务已更新');
            self.showTaskDetail(taskId);
        });
    });
};

UIManager.prototype.showAddTaskDialog = function() {
    var self = this;
    dialogs.rawInput('新建任务', '请输入任务名称：', '', function(name) {
        if (!name || !name.trim()) return;
        dialogs.rawInput('任务描述', '请输入任务描述（可选）：', '', function(desc) {
            var taskId = self.dataManager.addTask({
                name: name.trim(),
                description: desc ? desc.trim() : '',
                script: Config.defaultScript
            });
            toast('任务创建成功');
            self.showTaskDetail(taskId);
        });
    });
};

UIManager.prototype.confirmDeleteTask = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    dialogs.confirm('删除任务', '确定要删除任务「' + task.name + '」吗？此操作不可恢复。', function(ok) {
        if (!ok) return;
        self.dataManager.deleteTask(taskId);
        toast('任务已删除');
        self.showMainView();
    });
};

// ─── 任务日志 ─────────────────────────────────────────────
UIManager.prototype.showTaskLogs = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    var logs = task.logs || [];
    if (logs.length === 0) {
        toast('暂无执行日志');
        return;
    }

    var logTexts = logs.map(function(log) {
        return self.formatTime(log.time) + ' - ' + log.status + '\n' + (log.message || '');
    });

    dialogs.select('执行日志', logTexts, function(index) {
        if (index >= 0) {
            dialogs.alert('日志详情', logTexts[index]);
        }
    });
};

// ─── 任务导出 ─────────────────────────────────────────────
UIManager.prototype.exportTaskScript = function(taskId) {
    var task = this.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    try {
        var exportPath = Config.backupDir + task.name + '_' + Date.now() + '.js';
        files.createWithDirs(exportPath);
        files.write(exportPath, task.script);
        toast('脚本已导出到: ' + exportPath);
    } catch (e) {
        toast('导出失败: ' + e.message);
    }
};

UIManager.prototype.showExportOptions = function(taskId) {
    var self = this;
    dialogs.select('导出选项', ['导出脚本', '导出任务配置'], function(index) {
        if (index === 0) self.exportTaskScript(taskId);
        else if (index === 1) self.exportTaskConfig(taskId);
    });
};

UIManager.prototype.exportTaskConfig = function(taskId) {
    var task = this.dataManager.getTaskById(taskId);
    if (!task) { toast('任务不存在'); return; }

    try {
        var exportPath = Config.backupDir + task.name + '_config_' + Date.now() + '.json';
        files.createWithDirs(exportPath);
        files.write(exportPath, JSON.stringify(task, null, 2));
        toast('配置已导出到: ' + exportPath);
    } catch (e) {
        toast('导出失败: ' + e.message);
    }
};

// ─── 设置界面 ─────────────────────────────────────────────
UIManager.prototype.showSettings = function() {
    var self = this;
    dialogs.select('设置', ['关于应用', '清除数据', '备份数据', '恢复数据'], function(index) {
        if (index === 0) {
            dialogs.alert('关于 ' + Config.appName,
                '版本: ' + Config.version + '\n' +
                '作者: ' + Config.author + '\n\n' +
                '一个简单易用的自动化任务管理工具'
            );
        } else if (index === 1) {
            dialogs.confirm('清除数据', '确定要清除所有数据吗？此操作不可恢复。', function(ok) {
                if (!ok) return;
                self.dataManager.clearAll();
                toast('数据已清除');
                self.showMainView();
            });
        } else if (index === 2) {
            try {
                self.dataManager.backup();
                toast('数据备份成功');
            } catch (e) {
                toast('备份失败: ' + e.message);
            }
        } else if (index === 3) {
            try {
                self.dataManager.restore();
                toast('数据恢复成功');
                self.showMainView();
            } catch (e) {
                toast('恢复失败: ' + e.message);
            }
        }
    });
};

// ─── 工具函数 ─────────────────────────────────────────────
UIManager.prototype.formatTime = function(timestamp) {
    if (!timestamp) return '从未执行';
    var date = new Date(timestamp);
    var now = new Date();
    var diff = now - date;

    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return Math.floor(diff / 60000) + ' 分钟前';
    if (diff < 86400000) return Math.floor(diff / 3600000) + ' 小时前';
    if (diff < 604800000) return Math.floor(diff / 86400000) + ' 天前';

    return date.getFullYear() + '-' +
        ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
        ('0' + date.getDate()).slice(-2) + ' ' +
        ('0' + date.getHours()).slice(-2) + ':' +
        ('0' + date.getMinutes()).slice(-2);
};

UIManager.prototype.importMarketTask = function(marketTask) {
    var self = this;
    dialogs.confirm('导入任务', '确定要导入"' + marketTask.name + '"吗？', function(confirmed) {
        if (confirmed) {
            self.dataManager.addTask({
                name: marketTask.name,
                description: marketTask.description,
                script: marketTask.script,
                source: 'market',
                marketId: marketTask.id
            });
            toast('任务导入成功');
            self.showMainView();
        }
    });
};

UIManager.prototype.executeTask = function(taskId) {
    var self = this;
    var success = this.taskExecutor.executeTask(taskId);
    if (success) {
        setTimeout(function() { self.loadMainData(); }, 1000);
    }
};

UIManager.prototype.showTaskManagement = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) return;
    var options = ['编辑任务', '查看日志', '导出脚本', '定时执行', '删除任务'];
    dialogs.select('任务管理', options, function(index) {
        if (index < 0) return;
        switch (options[index]) {
            case '编辑任务': self.showEditTask(taskId); break;
            case '查看日志': self.showTaskLogs(taskId); break;
            case '导出脚本': self.exportTaskScript(taskId); break;
            case '定时执行': self.showScheduleDialog(taskId); break;
            case '删除任务': self.confirmDeleteTask(taskId); break;
        }
    });
};

UIManager.prototype.showEditTask = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) return;
    dialogs.rawInput('编辑任务名称', '请输入任务名称：', task.name, function(name) {
        if (!name || !name.trim()) return;
        dialogs.rawInput('编辑任务描述', '请输入任务描述：', task.description || '', function(description) {
            dialogs.rawInput('编辑任务脚本', '请输入任务脚本：', task.script || Config.defaultScript, function(script) {
                self.dataManager.updateTask(taskId, {
                    name: name.trim(),
                    description: description.trim(),
                    script: script
                });
                toast('任务更新成功');
                self.showMainView();
            });
        });
    });
};

UIManager.prototype.showAddTaskDialog = function() {
    var self = this;
    dialogs.rawInput('新建任务', '请输入任务名称：', '', function(name) {
        if (!name || !name.trim()) return;
        dialogs.rawInput('任务描述', '请输入任务描述（可选）：', '', function(description) {
            dialogs.rawInput('任务脚本', '请输入任务脚本：', Config.defaultScript, function(script) {
                self.dataManager.addTask({
                    name: name.trim(),
                    description: description ? description.trim() : '',
                    script: script || Config.defaultScript
                });
                toast('任务创建成功');
                self.showMainView();
            });
        });
    });
};

UIManager.prototype.confirmDeleteTask = function(taskId) {
    var self = this;
    var task = this.dataManager.getTaskById(taskId);
    if (!task) return;
    dialogs.confirm('删除任务', '确定要删除"' + task.name + '"吗？此操作不可撤销。', function(confirmed) {
        if (confirmed) {
            self.dataManager.deleteTask(taskId);
            toast('任务已删除');
            self.showMainView();
        }
    });
};

UIManager.prototype.showTaskLogs = function(taskId) {
    var task = this.dataManager.getTaskById(taskId);
    if (!task) return;
    var logs = this.taskExecutor.getTaskLogs(taskId);
    dialogs.alert('任务日志 - ' + task.name, logs.length > 0 ? logs.join('\n') : '暂无日志');
};

UIManager.prototype.exportTaskScript = function(taskId) {
    var task = this.dataManager.getTaskById(taskId);
    if (!task) return;
    var exportPath = '/sdcard/AutoClaw/exports/' + task.name + '_' + Date.now() + '.js';
    try {
        if (!files.exists('/sdcard/AutoClaw/exports/')) files.createDir('/sdcard/AutoClaw/exports/');
        files.write(exportPath, task.script);
        toast('已导出到: ' + exportPath);
    } catch (e) {
        toast('导出失败: ' + e.message);
    }
};

UIManager.prototype.showExportOptions = function(taskId) { this.exportTaskScript(taskId); };
UIManager.prototype.showScheduleDialog = function() { toast('定时执行功能开发中...'); };
UIManager.prototype.showSettings = function() { toast('设置功能开发中...'); };

UIManager.prototype.formatTime = function(timestamp) {
    if (!timestamp) return '从未执行';
    var d = new Date(timestamp);
    return d.getFullYear() + '-' +
        ('0' + (d.getMonth() + 1)).slice(-2) + '-' +
        ('0' + d.getDate()).slice(-2) + ' ' +
        ('0' + d.getHours()).slice(-2) + ':' +
        ('0' + d.getMinutes()).slice(-2);
};

module.exports = UIManager;
