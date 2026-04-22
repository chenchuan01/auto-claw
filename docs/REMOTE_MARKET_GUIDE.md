# 远程任务中心功能说明

## 概述

任务中心现在支持从远程服务器获取和同步任务。点击刷新按钮时，图标会旋转一圈，表示正在更新。

## 当前实现

### 1. 刷新按钮动画

点击任务中心的刷新按钮时：
- 图标旋转 360 度（500ms 动画）
- 显示"已刷新任务列表"提示
- 重新加载本地任务数据

**实现代码**：
```javascript
var RotateAnimation = android.view.animation.RotateAnimation;
var Animation = android.view.animation.Animation;
var rotate = new RotateAnimation(
    0, 360,
    Animation.RELATIVE_TO_SELF, 0.5,
    Animation.RELATIVE_TO_SELF, 0.5
);
rotate.setDuration(500);
ui.btn_refresh.startAnimation(rotate);
```

### 2. 远程服务接口

已创建 `RemoteMarketService` 模块，提供以下接口：

#### fetchMarketTasks()
从远程获取任务列表。

**返回**：
```javascript
[
    {
        id: 'task-001',
        name: '任务名称',
        author: '作者',
        authorId: 'user-id',
        description: '任务描述',
        downloads: 100,
        rating: 4.5,
        script: '// 脚本代码',
        version: 1
    },
    // ...
]
```

#### fetchTaskDetail(taskId)
获取指定任务的详细信息。

**参数**：
- `taskId`: 任务 ID

**返回**：任务详情对象

#### syncToLocal(localMarketService)
同步远程任务到本地。

**功能**：
- 检查远程任务列表
- 对比本地任务
- 添加新任务
- 更新已有任务（如果版本更新）

**返回**：是否有任务被更新

#### testConnection()
测试远程服务器连接。

**返回**：连接是否成功

## 后续实现步骤

### 步骤 1：配置远程 API 地址

在 `RemoteMarketService` 中设置 API 地址：

```javascript
var remoteService = new RemoteMarketService();
remoteService.setApiUrl('https://your-api.com/market');
```

或在配置文件中添加：

```javascript
// config.js
remoteMarketApiUrl: 'https://your-api.com/market'
```

### 步骤 2：实现 HTTP 请求

取消注释 `RemoteMarketService` 中的 HTTP 请求代码：

```javascript
RemoteMarketService.prototype.fetchMarketTasks = function() {
    var response = http.get(this.apiUrl + '/tasks', {
        headers: {
            'Content-Type': 'application/json'
        },
        timeout: this.timeout
    });

    if (response.statusCode === 200) {
        var data = response.body.json();
        return data.tasks;
    }
    return null;
};
```

### 步骤 3：集成到 UI

在 `ui_market_view.js` 的 `refreshFromRemote` 方法中：

```javascript
UIMarketView.prototype.refreshFromRemote = function() {
    var self = this;
    var mgr = this.uiManager;

    threads.start(function() {
        try {
            var remoteService = new RemoteMarketService();
            var synced = remoteService.syncToLocal(mgr.marketService);

            ui.post(function() {
                self.loadData();
                if (synced) {
                    toast('已更新任务列表');
                } else {
                    toast('任务列表已是最新');
                }
            });
        } catch (e) {
            ui.post(function() {
                toast('刷新失败: ' + e.message);
            });
        }
    });
};
```

### 步骤 4：添加设置页面

在 AI 设置页面添加远程任务中心配置：

```javascript
// 远程任务中心配置
<vertical bg="' + C.card + '" cornerRadius="20" padding="24" marginTop="16">
  <text text="远程任务中心" textSize="16sp" textColor="' + C.accent + '" textStyle="bold" marginBottom="12"/>
  
  <text text="API 地址" textSize="14sp" textColor="' + C.textSecondary + '" marginBottom="8"/>
  <input id="input_market_api" hint="https://api.example.com/market" textSize="14sp"/>
  
  <button id="btn_test_connection" text="测试连接" marginTop="12"/>
</vertical>
```

## API 接口规范

### GET /tasks

获取任务列表。

**响应**：
```json
{
    "tasks": [
        {
            "id": "task-001",
            "name": "自动签到脚本",
            "author": "张三",
            "authorId": "user-123",
            "description": "每日自动签到",
            "downloads": 100,
            "rating": 4.5,
            "version": 1,
            "createTime": 1234567890000,
            "updateTime": 1234567890000
        }
    ]
}
```

### GET /tasks/:id

获取任务详情。

**响应**：
```json
{
    "task": {
        "id": "task-001",
        "name": "自动签到脚本",
        "author": "张三",
        "authorId": "user-123",
        "description": "每日自动签到",
        "script": "// 脚本代码\ntoast('签到成功');",
        "downloads": 100,
        "rating": 4.5,
        "version": 1,
        "createTime": 1234567890000,
        "updateTime": 1234567890000
    }
}
```

### GET /ping

测试连接。

**响应**：
```json
{
    "status": "ok",
    "version": "1.0.0"
}
```

## 使用示例

### 手动刷新

```javascript
var remoteService = new RemoteMarketService();
remoteService.setApiUrl('https://api.example.com/market');

// 测试连接
if (remoteService.testConnection()) {
    console.log('连接成功');
    
    // 同步任务
    var synced = remoteService.syncToLocal(marketService);
    if (synced) {
        console.log('任务已更新');
    }
}
```

### 自动同步

可以在应用启动时自动同步：

```javascript
// main.js
var remoteService = new RemoteMarketService();
threads.start(function() {
    remoteService.syncToLocal(marketService);
});
```

## 注意事项

1. **网络权限**：确保应用有网络访问权限
2. **超时处理**：默认超时 10 秒，可根据需要调整
3. **错误处理**：网络请求失败时不影响本地功能
4. **版本控制**：通过 version 字段判断是否需要更新
5. **异步执行**：使用 threads.start 避免阻塞 UI

## 测试

### 测试动画

直接点击任务中心的刷新按钮，查看图标是否旋转。

### 测试远程功能

1. 搭建测试服务器
2. 配置 API 地址
3. 取消注释 HTTP 请求代码
4. 点击刷新按钮测试

## 未来扩展

- [ ] 支持任务搜索
- [ ] 支持任务分类
- [ ] 支持任务评论
- [ ] 支持任务收藏
- [ ] 支持任务上传
- [ ] 支持用户认证
- [ ] 支持增量更新
- [ ] 支持离线缓存

## 相关文件

- `modules/services/remote_market_service.js` - 远程服务
- `modules/ui/ui_market_view.js` - 任务中心 UI
- `modules/services/market_service.js` - 本地任务服务
