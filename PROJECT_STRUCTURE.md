# AutoClaw - 项目结构

## 📁 项目目录结构

```
AutoClaw/
├── main.js                      # 主入口文件（简洁，仅初始化）
├── main_fixed.js                # 旧版本（备份）
├── main_complete_v1.js          # 完整版本（备份）
├── main_simple.js               # 简化版本（备份）
├── project.json                 # 应用配置
├── README.md                    # 项目说明
├── INSTALL.md                   # 安装指南
├── DEMO.md                      # 演示脚本
├── build.sh                     # 构建脚本
├── test_runner.js               # 测试运行器
├── test_simple.js               # 简单测试
├── test_quick.js                # 快速测试
├── validate_project.js          # 项目验证脚本
├── PROJECT_STRUCTURE.md         # 项目结构文档
└── modules/                     # 模块目录
    ├── config.js               # 配置模块
    ├── data_manager.js         # 数据管理模块
    ├── task_executor.js        # 任务执行器模块
    ├── market_service.js       # 市场服务模块
    └── ui_manager_complete.js  # UI管理器模块
```

## 🏗️ 模块化架构设计

### 1. **main.js** - 主入口文件
```javascript
// 简洁的入口，仅负责初始化
const Config = require('./modules/config');
const DataManager = require('./modules/data_manager');
const TaskExecutor = require('./modules/task_executor');
const MarketService = require('./modules/market_service');
const UIManager = require('./modules/ui_manager_complete');

function initApp() {
    const dataManager = new DataManager();
    const taskExecutor = new TaskExecutor(dataManager);
    const marketService = new MarketService();
    const uiManager = new UIManager(dataManager, taskExecutor, marketService);
    
    uiManager.showMainView();
}

initApp();
```

### 2. **config.js** - 配置模块
- 应用配置常量
- 颜色配置
- 状态映射
- 默认脚本模板
- API配置

### 3. **data_manager.js** - 数据管理模块
- 任务数据的增删改查
- 数据持久化（使用AutoX.js的storages）
- 数据备份和恢复
- 设置管理

### 4. **task_executor.js** - 任务执行器模块
- 任务执行和停止
- 多线程管理
- 任务日志记录
- 脚本语法验证

### 5. **market_service.js** - 市场服务模块
- 市场任务数据获取
- 任务搜索和过滤
- 模拟API数据（可替换为真实API）
- 缓存管理

### 6. **ui_manager_complete.js** - UI管理器模块
- 所有界面显示
- 用户交互处理
- 事件绑定
- 界面状态管理

## 🔧 核心功能

### ✅ 已完成功能
1. **任务管理**
   - 添加/编辑/删除任务
   - 任务状态显示（待执行、执行中、成功、失败）
   - 任务执行次数统计
   - 任务来源标识（本地/市场）

2. **任务执行**
   - 单任务执行
   - 多线程安全执行
   - 执行日志记录
   - 任务停止功能

3. **任务市场**
   - 市场任务浏览
   - 任务搜索和过滤
   - 任务详情查看
   - 一键导入市场任务

4. **数据管理**
   - 本地数据持久化
   - 数据备份和恢复
   - 设置管理
   - 自动备份

5. **用户界面**
   - Material Design风格
   - 响应式布局
   - 状态颜色编码
   - 空状态提示

### 🚀 特色功能
1. **模块化设计** - 易于维护和扩展
2. **错误处理** - 完善的异常捕获和用户提示
3. **日志系统** - 详细的任务执行日志
4. **模拟数据** - 离线可用的市场数据
5. **代码审查** - 内置脚本语法验证

## 📱 界面设计

### 主界面
- 顶部标题栏 + 设置按钮
- 任务列表卡片式显示
- 底部导航（任务/市场）
- 浮动添加按钮

### 任务详情页
- 任务基本信息
- 状态标签
- 操作按钮（执行、日志、导出、删除）

### 任务市场
- 市场任务列表
- 搜索功能
- 任务详情页
- 一键导入

## 🧪 测试文件

### test_runner.js
- 综合测试所有模块
- 环境检查
- 功能验证
- 结果统计

### test_simple.js
- 简单UI测试
- 基础功能验证
- 快速启动测试

### test_quick.js
- 最小化测试
- 核心模块验证
- 快速环境检查

## 🚀 部署和使用

### 安装步骤
1. 安装AutoX.js到Android设备
2. 开启无障碍服务
3. 导入项目文件夹
4. 运行main.js

### 构建APK（可选）
```bash
# 使用提供的构建脚本
chmod +x build.sh
./build.sh
```

## 🔄 扩展性

### 添加新功能
1. 在对应模块中添加功能
2. 更新UI管理器显示逻辑
3. 添加测试用例

### 替换市场API
1. 修改market_service.js中的API调用
2. 更新数据解析逻辑
3. 添加错误处理

### 自定义主题
1. 修改config.js中的颜色配置
2. 更新UI布局中的颜色引用

## 📊 性能优化

### 已实现的优化
1. **模块懒加载** - 按需加载模块
2. **数据缓存** - 市场数据缓存
3. **日志限制** - 防止内存泄漏
4. **线程管理** - 避免线程泄漏

### 建议的优化
1. 图片资源压缩
2. 数据库索引优化
3. 网络请求合并
4. 内存使用监控

## 🐛 故障排除

### 常见问题
1. **无法导入文件** - 检查存储权限
2. **UI不显示** - 检查UI模块加载
3. **任务执行失败** - 检查脚本语法
4. **市场数据加载失败** - 检查网络连接

### 调试方法
1. 使用test_runner.js进行环境检查
2. 查看控制台日志
3. 检查任务执行日志
4. 验证数据存储

## 📈 未来规划

### 短期目标
1. 添加任务分组功能
2. 实现任务依赖关系
3. 添加任务模板系统
4. 优化市场搜索功能

### 长期目标
1. 云端同步功能
2. 任务分享社区
3. 智能任务推荐
4. 多语言支持

---

**项目状态**: ✅ 重构完成，模块化架构就绪  
**代码质量**: 🟢 经过模块化拆分，避免文件过大  
**测试覆盖**: 🟡 基础测试可用，建议增加单元测试  
**部署难度**: 🟢 简单，直接导入AutoX.js运行  
**主入口文件**: main.js (已重命名，保持标准结构)