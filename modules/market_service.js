/**
 * 市场服务模块
 * 负责与任务市场交互
 */

var Config = require('./config');

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
            id: 'market_open_wechat',
            name: '打开微信',
            author: '系统',
            authorId: 'system',
            description: '简单的测试脚本：启动微信应用',
            downloads: 1523,
            rating: 4.9,
            ratingCount: 89,
            version: '1.0.0',
            updateTime: Date.now() - 1 * 24 * 60 * 60 * 1000,
            script: 'toast("正在启动微信...");\napp.launchApp("微信");\nsleep(2000);\ntoast("微信已启动");',
            tags: ['测试', '微信', '启动应用'],
            category: '测试工具',
            price: 0,
            requirements: ['AutoX.js v7.0+']
        },
        {
            id: 'market_open_feishu',
            name: '打开飞书',
            author: '系统',
            authorId: 'system',
            description: '简单的测试脚本：启动飞书应用',
            downloads: 892,
            rating: 4.8,
            ratingCount: 45,
            version: '1.0.0',
            updateTime: Date.now() - 2 * 24 * 60 * 60 * 1000,
            script: 'toast("正在启动飞书...");\napp.launchApp("飞书");\nsleep(2000);\ntoast("飞书已启动");',
            tags: ['测试', '飞书', '启动应用'],
            category: '测试工具',
            price: 0,
            requirements: ['AutoX.js v7.0+']
        },
        {
            id: 'market_open_alipay',
            name: '打开支付宝',
            author: '系统',
            authorId: 'system',
            description: '简单的测试脚本：启动支付宝应用',
            downloads: 2156,
            rating: 4.9,
            ratingCount: 123,
            version: '1.0.0',
            updateTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
            script: 'toast("正在启动支付宝...");\napp.launchApp("支付宝");\nsleep(2000);\ntoast("支付宝已启动");',
            tags: ['测试', '支付宝', '启动应用'],
            category: '测试工具',
            price: 0,
            requirements: ['AutoX.js v7.0+']
        },
        {
            id: 'market_device_info',
            name: '显示设备信息',
            author: '系统',
            authorId: 'system',
            description: '测试脚本：显示设备的基本信息',
            downloads: 1678,
            rating: 4.7,
            ratingCount: 67,
            version: '1.0.0',
            updateTime: Date.now() - 4 * 24 * 60 * 60 * 1000,
            script: 'var info = "设备信息:\\n";\ninfo += "屏幕宽度: " + device.width + "\\n";\ninfo += "屏幕高度: " + device.height + "\\n";\ninfo += "Android版本: " + device.release + "\\n";\ninfo += "SDK版本: " + device.sdkInt + "\\n";\ninfo += "电量: " + device.getBattery() + "%\\n";\nconsole.log(info);\ntoast("设备信息已输出到日志");',
            tags: ['测试', '设备信息', '调试'],
            category: '测试工具',
            price: 0,
            requirements: ['AutoX.js v7.0+']
        },
        {
            id: 'market_click_center',
            name: '点击屏幕中心',
            author: '系统',
            authorId: 'system',
            description: '测试脚本：点击屏幕中心位置',
            downloads: 945,
            rating: 4.6,
            ratingCount: 34,
            version: '1.0.0',
            updateTime: Date.now() - 5 * 24 * 60 * 60 * 1000,
            script: 'var x = device.width / 2;\nvar y = device.height / 2;\ntoast("即将点击屏幕中心 (" + x + ", " + y + ")");\nsleep(1000);\nclick(x, y);\ntoast("已点击屏幕中心");',
            tags: ['测试', '点击', '坐标'],
            category: '测试工具',
            price: 0,
            requirements: ['AutoX.js v7.0+']
        },
        {
            id: 'market_hello_world',
            name: 'Hello World',
            author: '系统',
            authorId: 'system',
            description: '最简单的测试脚本：显示 Hello World',
            downloads: 3421,
            rating: 5.0,
            ratingCount: 156,
            version: '1.0.0',
            updateTime: Date.now() - 6 * 24 * 60 * 60 * 1000,
            script: 'console.log("Hello World!");\ntoast("Hello World!");\nsleep(1000);\nconsole.log("测试脚本执行完成");',
            tags: ['测试', '入门', '示例'],
            category: '测试工具',
            price: 0,
            requirements: ['AutoX.js v7.0+']
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
