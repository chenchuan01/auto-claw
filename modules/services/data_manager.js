/**
 * 数据管理模块
 * 负责任务的增删改查和持久化
 */

var Config = require('../core/config');

function DataManager() {
    this.storage = storages.create(Config.storageName);
    this.tempTasks = []; // 内存中的临时任务（不持久化）
    this.initStorage();
}

DataManager.prototype.initStorage = function() {
    if (!this.storage.get('tasks')) {
        this.storage.put('tasks', []);
    }
    if (!this.storage.get('settings')) {
        this.storage.put('settings', Config.settings);
    }
    if (!this.storage.get('aiConversations')) {
        this.storage.put('aiConversations', []);
    }
};

DataManager.prototype.getTasks = function() {
    return this.storage.get('tasks') || [];
};

DataManager.prototype.getTaskById = function(taskId) {
    var tasks = this.getTasks();
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) return tasks[i];
    }
    // 找不到，再查找临时任务
    for (var j = 0; j < this.tempTasks.length; j++) {
        if (this.tempTasks[j].id === taskId) return this.tempTasks[j];
    }
    return null;
};

DataManager.prototype.addTask = function(taskData) {
    var tasks = this.getTasks();
    var taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 11);

    var task = {
        id: taskId,
        name: taskData.name || '未命名任务',
        description: taskData.description || '',
        script: taskData.script || Config.defaultScript,
        status: 'idle',
        createTime: Date.now(),
        lastRunTime: null,
        runCount: 0,
        source: taskData.source || 'local',
        marketId: taskData.marketId || null,
        author: taskData.author || '本地创建',
        authorId: taskData.authorId || 'local',
        tags: taskData.tags || []
    };

    for (var key in taskData) {
        if (taskData.hasOwnProperty(key)) task[key] = taskData[key];
    }
    task.id = taskId;

    tasks.push(task);
    this.storage.put('tasks', tasks);
    return task;
};

/**
 * 添加临时任务（仅在内存中，不持久化）
 * 用于 AI 对话中临时运行脚本
 */
DataManager.prototype.addTemporaryTask = function(taskData) {
    this.tempTasks.push(taskData);
    // 清理超过 10 个旧临时任务
    if (this.tempTasks.length > 10) {
        this.tempTasks.shift();
    }
    return taskData.id;
};

DataManager.prototype.updateTask = function(taskId, updates) {
    var tasks = this.getTasks();
    var index = -1;
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) { index = i; break; }
    }
    if (index === -1) {
        // 找不到，尝试更新临时任务
        for (var j = 0; j < this.tempTasks.length; j++) {
            if (this.tempTasks[j].id === taskId) {
                var original = this.tempTasks[j];
                var updated = {};
                for (var k in original) {
                    if (original.hasOwnProperty(k)) updated[k] = original[k];
                }
                for (var k in updates) {
                    if (updates.hasOwnProperty(k)) updated[k] = updates[k];
                }
                updated.id = original.id;
                if (original.createTime) {
                    updated.createTime = original.createTime;
                }
                this.tempTasks[j] = updated;
                return updated;
            }
        }
        return null;
    }

    var original = tasks[index];
    var updated = {};
    for (var k in original) {
        if (original.hasOwnProperty(k)) updated[k] = original[k];
    }
    for (var k in updates) {
        if (updates.hasOwnProperty(k)) updated[k] = updates[k];
    }
    updated.id = original.id;
    updated.createTime = original.createTime;

    tasks[index] = updated;
    this.storage.put('tasks', tasks);
    return tasks[index];
};

DataManager.prototype.deleteTask = function(taskId) {
    // 先尝试删除持久化任务
    var tasks = this.getTasks();
    var newTasks = tasks.filter(function(t) { return t.id !== taskId; });
    if (newTasks.length !== tasks.length) {
        this.storage.put('tasks', newTasks);
        return true;
    }
    // 找不到，尝试删除临时任务
    var originalLen = this.tempTasks.length;
    this.tempTasks = this.tempTasks.filter(function(t) { return t.id !== taskId; });
    return this.tempTasks.length !== originalLen;
};

DataManager.prototype.deleteTasks = function(taskIds) {
    var tasks = this.getTasks();
    var newTasks = tasks.filter(function(t) { return taskIds.indexOf(t.id) === -1; });
    this.storage.put('tasks', newTasks);
    return tasks.length - newTasks.length;
};

DataManager.prototype.getTaskStats = function() {
    var tasks = this.getTasks();
    return {
        total: tasks.length,
        idle:    tasks.filter(function(t) { return t.status === 'idle'; }).length,
        running: tasks.filter(function(t) { return t.status === 'running'; }).length,
        success: tasks.filter(function(t) { return t.status === 'success'; }).length,
        failed:  tasks.filter(function(t) { return t.status === 'failed'; }).length,
        paused:  tasks.filter(function(t) { return t.status === 'paused'; }).length
    };
};

DataManager.prototype.backupData = function() {
    try {
        var backupDir = Config.backupDir;
        if (!files.exists(backupDir)) files.createDir(backupDir);

        var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        var backupFile = backupDir + 'backup_' + timestamp + '.json';
        var backupData = {
            version: Config.version,
            backupTime: Date.now(),
            tasks: this.getTasks(),
            settings: this.storage.get('settings') || {}
        };

        files.write(backupFile, JSON.stringify(backupData, null, 2));
        return { success: true, filePath: backupFile, taskCount: backupData.tasks.length };
    } catch (e) {
        return { success: false, error: e.message };
    }
};

DataManager.prototype.restoreData = function(backupFile) {
    try {
        if (!files.exists(backupFile)) return { success: false, error: '备份文件不存在' };

        var backupData = JSON.parse(files.read(backupFile));
        if (!backupData.tasks || !Array.isArray(backupData.tasks)) {
            return { success: false, error: '备份文件格式错误' };
        }

        this.storage.put('tasks', backupData.tasks);
        if (backupData.settings) this.storage.put('settings', backupData.settings);

        return { success: true, taskCount: backupData.tasks.length, backupTime: backupData.backupTime };
    } catch (e) {
        return { success: false, error: e.message };
    }
};

DataManager.prototype.clearAllData = function() {
    this.storage.clear();
    this.initStorage();
    return true;
};

DataManager.prototype.getSettings = function() {
    return this.storage.get('settings') || Config.settings;
};

DataManager.prototype.updateSettings = function(newSettings) {
    var current = this.getSettings();
    var updated = {};
    for (var k in current) {
        if (current.hasOwnProperty(k)) updated[k] = current[k];
    }
    for (var k in newSettings) {
        if (newSettings.hasOwnProperty(k)) updated[k] = newSettings[k];
    }
    this.storage.put('settings', updated);
    return updated;
};

/**
 * 获取所有AI对话历史
 */
DataManager.prototype.getAIConversations = function() {
    return this.storage.get('aiConversations') || [];
};

/**
 * 保存AI对话到历史
 */
DataManager.prototype.saveAIConversation = function(conversation) {
    var conversations = this.getAIConversations();

    // 如果对话已有 id，则更新已有对话，不新增
    if (conversation.id) {
        conversations = conversations.map(function(c) {
            if (c.id === conversation.id) {
                // 更新内容
                return {
                    id: conversation.id,
                    title: conversation.title || this.generateConversationTitle(conversation.messages),
                    messages: conversation.messages,
                    script: conversation.script || '',
                    createTime: c.createTime,
                    updateTime: Date.now()
                };
            }
            return c;
        }, this);
        this.storage.put('aiConversations', conversations);
        return conversation.id;
    }

    // 新增对话
    conversations.unshift({
        id: 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 10),
        title: conversation.title || this.generateConversationTitle(conversation.messages),
        messages: conversation.messages,
        script: conversation.script || '',
        createTime: Date.now()
    });
    // 只保留最近 50 条对话
    if (conversations.length > 50) {
        conversations = conversations.slice(0, 50);
    }
    this.storage.put('aiConversations', conversations);
    return conversations[0].id;
};

/**
 * 删除AI对话历史
 */
DataManager.prototype.deleteAIConversation = function(convId) {
    var conversations = this.getAIConversations();
    conversations = conversations.filter(function(c) {
        return c.id !== convId;
    });
    this.storage.put('aiConversations', conversations);
};

/**
 * 生成对话标题（从第一条用户消息截取）
 */
DataManager.prototype.generateConversationTitle = function(messages) {
    if (!messages || messages.length === 0) return '新对话';
    var firstUserMsg = messages.filter(function(m) {
        return m.role === 'user';
    })[0];
    if (!firstUserMsg) return '新对话';
    var title = firstUserMsg.content.substring(0, 30);
    if (firstUserMsg.content.length > 30) title += '...';
    return title;
};

/**
 * 根据ID获取AI对话
 */
DataManager.prototype.getAIConversationById = function(convId) {
    var conversations = this.getAIConversations();
    for (var i = 0; i < conversations.length; i++) {
        if (conversations[i].id === convId) {
            return conversations[i];
        }
    }
    return null;
};

module.exports = DataManager;
