/**
 * 市场服务模块
 * 负责与任务市场交互
 */

var Config = require('../core/config');

function MarketService() {
    this.baseUrl = Config.marketApi.baseUrl;
    this.timeout = Config.marketApi.timeout;
    this.cache = {};
    this.cacheTimeout = 5 * 60 * 1000;
}

MarketService.prototype.getMarketTasks = function(options) {
    options = options || {};
    var cacheKey = 'market_tasks_' + JSON.stringify(options);

    if (this.cache[cacheKey]) {
        var cached = this.cache[cacheKey];
        if (Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
    }

    var marketTasks = this._getMockMarketTasks(options);
    this.cache[cacheKey] = { timestamp: Date.now(), data: marketTasks };
    return marketTasks;
};

MarketService.prototype._getMockMarketTasks = function(options) {
    options = options || {};
    var allTasks = [
        {
            id: 'hello_world',
            name: 'Hello World',
            author: '系统',
            authorId: 'system',
            description: '最简单的入门示例：弹出 Hello World 消息',
            downloads: 128,
            rating: 5.0,
            ratingCount: 36,
            version: '1.0.0',
            updateTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
            script: '// Hello World - 第一个 AutoX 脚本\nconsole.log("Hello World!");\ntoast("Hello World!");\n',
            tags: ['入门', '示例', '测试'],
            category: '示例',
            price: 0,
            requirements: ['AutoX.js v6.0+ (ES5)']
        }
    ];

    var filtered = allTasks.slice();

    if (options.category) {
        filtered = filtered.filter(function(t) { return t.category === options.category; });
    }

    if (options.search) {
        var q = options.search.toLowerCase();
        filtered = filtered.filter(function(t) {
            return t.name.toLowerCase().indexOf(q) !== -1 ||
                   t.description.toLowerCase().indexOf(q) !== -1 ||
                   t.tags.some(function(tag) { return tag.toLowerCase().indexOf(q) !== -1; });
        });
    }

    if (options.sortBy) {
        filtered.sort(function(a, b) {
            if (options.sortBy === 'rating') return b.rating - a.rating;
            if (options.sortBy === 'updateTime') return b.updateTime - a.updateTime;
            return b.downloads - a.downloads;
        });
    }

    return filtered;
};

MarketService.prototype.searchMarketTasks = function(query, options) {
    var opts = options || {};
    opts.search = query;
    return this.getMarketTasks(opts);
};

MarketService.prototype.getTaskDetail = function(taskId) {
    var tasks = this.getMarketTasks();
    for (var i = 0; i < tasks.length; i++) {
        if (tasks[i].id === taskId) return tasks[i];
    }
    return null;
};

MarketService.prototype.getPopularTasks = function(limit) {
    limit = limit || 10;
    return this.getMarketTasks({ sortBy: 'downloads' }).slice(0, limit);
};

MarketService.prototype.getNewestTasks = function(limit) {
    limit = limit || 10;
    return this.getMarketTasks({ sortBy: 'updateTime' }).slice(0, limit);
};

MarketService.prototype.getTasksByCategory = function(category) {
    return this.getMarketTasks({ category: category });
};

MarketService.prototype.downloadTaskScript = function(taskId) {
    try {
        var task = this.getTaskDetail(taskId);
        if (!task) return { success: false, error: '任务不存在' };
        return { success: true, task: task, script: task.script };
    } catch (e) {
        return { success: false, error: e.message };
    }
};

MarketService.prototype.clearCache = function() {
    this.cache = {};
    return true;
};

module.exports = MarketService;
