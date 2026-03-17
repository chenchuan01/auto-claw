/**
 * 数据管理模块
 * 负责任务的增删改查和持久化
 */

const storages = require('storages');
const files = require('files');
const Config = require('./config');

class DataManager {
    constructor() {
        this.storage = storages.create(Config.storageName);
        this.initStorage();
    }
    
    // 初始化存储
    initStorage() {
        // 确保tasks数组存在
        if (!this.storage.get('tasks')) {
            this.storage.put('tasks', []);
        }
        
        // 确保设置存在
        if (!this.storage.get('settings')) {
            this.storage.put('settings', Config.settings);
        }
    }
    
    // 获取所有任务
    getTasks() {
        return this.storage.get('tasks') || [];
    }
    
    // 根据ID获取任务
    getTaskById(taskId) {
        const tasks = this.getTasks();
        return tasks.find(task => task.id === taskId);
    }
    
    // 添加任务
    addTask(taskData) {
        const tasks = this.getTasks();
        
        // 生成任务ID
        const taskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        // 创建完整任务对象
        const task = {
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
            tags: taskData.tags || [],
            ...taskData
        };
        
        tasks.push(task);
        this.storage.put('tasks', tasks);
        
        return task;
    }
    
    // 更新任务
    updateTask(taskId, updates) {
        const tasks = this.getTasks();
        const index = tasks.findIndex(task => task.id === taskId);
        
        if (index === -1) {
            return null;
        }
        
        // 保留原始ID和创建时间
        const originalTask = tasks[index];
        tasks[index] = {
            ...originalTask,
            ...updates,
            id: originalTask.id, // 确保ID不变
            createTime: originalTask.createTime // 确保创建时间不变
        };
        
        this.storage.put('tasks', tasks);
        return tasks[index];
    }
    
    // 删除任务
    deleteTask(taskId) {
        const tasks = this.getTasks();
        const newTasks = tasks.filter(task => task.id !== taskId);
        
        if (newTasks.length === tasks.length) {
            return false; // 没有找到要删除的任务
        }
        
        this.storage.put('tasks', newTasks);
        return true;
    }
    
    // 批量删除任务
    deleteTasks(taskIds) {
        const tasks = this.getTasks();
        const newTasks = tasks.filter(task => !taskIds.includes(task.id));
        this.storage.put('tasks', newTasks);
        return tasks.length - newTasks.length;
    }
    
    // 获取任务统计
    getTaskStats() {
        const tasks = this.getTasks();
        
        return {
            total: tasks.length,
            idle: tasks.filter(t => t.status === 'idle').length,
            running: tasks.filter(t => t.status === 'running').length,
            success: tasks.filter(t => t.status === 'success').length,
            failed: tasks.filter(t => t.status === 'failed').length,
            paused: tasks.filter(t => t.status === 'paused').length
        };
    }
    
    // 备份数据
    backupData() {
        try {
            const backupDir = Config.backupDir;
            
            // 创建备份目录
            if (!files.exists(backupDir)) {
                files.createDir(backupDir);
            }
            
            // 生成备份文件名
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupFile = backupDir + 'backup_' + timestamp + '.json';
            
            // 获取所有数据
            const backupData = {
                version: Config.version,
                backupTime: Date.now(),
                tasks: this.getTasks(),
                settings: this.storage.get('settings') || {}
            };
            
            // 写入备份文件
            files.write(backupFile, JSON.stringify(backupData, null, 2));
            
            return {
                success: true,
                filePath: backupFile,
                taskCount: backupData.tasks.length
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 恢复数据
    restoreData(backupFile) {
        try {
            if (!files.exists(backupFile)) {
                return {
                    success: false,
                    error: '备份文件不存在'
                };
            }
            
            // 读取备份文件
            const backupContent = files.read(backupFile);
            const backupData = JSON.parse(backupContent);
            
            // 验证备份数据格式
            if (!backupData.tasks || !Array.isArray(backupData.tasks)) {
                return {
                    success: false,
                    error: '备份文件格式错误'
                };
            }
            
            // 恢复数据
            this.storage.put('tasks', backupData.tasks);
            
            if (backupData.settings) {
                this.storage.put('settings', backupData.settings);
            }
            
            return {
                success: true,
                taskCount: backupData.tasks.length,
                backupTime: backupData.backupTime
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    // 清除所有数据
    clearAllData() {
        this.storage.clear();
        this.initStorage();
        return true;
    }
    
    // 获取设置
    getSettings() {
        return this.storage.get('settings') || Config.settings;
    }
    
    // 更新设置
    updateSettings(newSettings) {
        const currentSettings = this.getSettings();
        const updatedSettings = {
            ...currentSettings,
            ...newSettings
        };
        
        this.storage.put('settings', updatedSettings);
        return updatedSettings;
    }
}

module.exports = DataManager;