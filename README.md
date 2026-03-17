# AutoClaw

> 基于 AutoX.js 开发的 Android 自动化任务管理工具

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AutoX.js](https://img.shields.io/badge/AutoX.js-v7.0+-blue.svg)](https://github.com/kkevsekk1/AutoX)
[![Android](https://img.shields.io/badge/Android-5.0+-green.svg)](https://developer.android.com)
[![Version](https://img.shields.io/badge/version-1.0.0-orange.svg)](https://github.com/chenchuan01/auto-claw/releases)

## 📖 简介

AutoClaw 是一个功能完整的 Android 自动化任务管理平台，基于 [AutoX.js](https://github.com/kkevsekk1/AutoX) 开发。它提供了直观的任务管理界面、任务市场、多线程执行引擎和完善的数据管理功能。

## ✨ 功能特性

### 📋 任务管理
- 以卡片列表形式展示所有任务
- 支持添加、编辑、删除任务
- 任务状态实时显示（待执行、执行中、成功、失败）
- 任务执行次数和时间统计

### 🛒 任务市场
- 浏览社区发布的自动化脚本
- 支持关键词搜索和分类过滤
- 查看任务详情、评分和下载量
- 一键导入市场任务到本地

### 🚀 任务执行
- 多线程安全执行，互不干扰
- 实时日志记录和查看
- 支持手动停止运行中的任务
- 内置脚本语法验证

### 💾 数据管理
- 基于 AutoX.js storages 的本地持久化
- 支持数据备份和恢复
- 应用设置管理
- 自动定时备份

## 📱 界面预览

```
┌─────────────────────────────┐
│  AutoClaw            [设置] │
├─────────────────────────────┤
│  总计:5  执行中:1  成功:3   │
├─────────────────────────────┤
│ ┌─────────────────────────┐ │
│ │ 微信自动回复      [执行中]│ │
│ │ 自动回复微信消息...      │ │
│ │ 最后执行: 5分钟前  3次   │ │
│ │ [执行]          [管理]  │ │
│ └─────────────────────────┘ │
│ ┌─────────────────────────┐ │
│ │ 抖音自动点赞      [待执行]│ │
│ │ 自动点赞推荐视频...      │ │
│ │ 最后执行: 1小时前  10次  │ │
│ │ [执行]          [管理]  │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ [📋 任务] [🛒 市场] [📊 统计]│
└─────────────────────────────┘
```

## 🏗️ 项目结构

```
AutoClaw/
├── main.js                      # 主入口文件
├── project.json                 # 应用配置
├── modules/                     # 核心模块
│   ├── config.js               # 配置常量
│   ├── data_manager.js         # 数据管理
│   ├── task_executor.js        # 任务执行引擎
│   ├── market_service.js       # 市场服务
│   └── ui_manager_complete.js  # UI 管理器
├── test_runner.js              # 测试运行器
├── test_simple.js              # 简单测试
├── test_quick.js               # 快速测试
└── validate_project.js         # 项目验证
```

## 🚀 快速开始

### 环境要求

- Android 5.0+ (API 21+)
- [AutoX.js](https://github.com/kkevsekk1/AutoX) v7.0+
- 开启无障碍服务权限

### 安装步骤

1. **安装 AutoX.js**
   - 从 [AutoX.js Releases](https://github.com/kkevsekk1/AutoX/releases) 下载最新版本
   - 安装到 Android 设备

2. **开启无障碍服务**
   - 进入 设置 → 无障碍 → AutoX.js
   - 开启无障碍服务

3. **导入项目**
   - 将项目文件夹复制到设备存储
   - 在 AutoX.js 中打开项目文件夹

4. **运行应用**
   ```
   运行 main.js
   ```

### 权限说明

应用需要以下权限:

| 权限 | 用途 |
|------|------|
| INTERNET | 访问任务市场 |
| WRITE_EXTERNAL_STORAGE | 数据备份 |
| READ_EXTERNAL_STORAGE | 读取备份文件 |
| SYSTEM_ALERT_WINDOW | 悬浮窗显示 |

## 🔧 技术栈

| 模块 | 技术 |
|------|------|
| UI 框架 | AutoX.js UI 模块 |
| 数据存储 | AutoX.js storages |
| 网络请求 | AutoX.js http |
| 多线程 | AutoX.js threads |
| 定时任务 | AutoX.js timers |
| JavaScript 引擎 | Rhino (ES5 兼容) |

## ⚠️ 重要说明

本项目使用 **ES5 语法**编写，以兼容 AutoX.js 的 Rhino JavaScript 引擎。

**开发者请注意：**
- 不支持 ES6+ 特性（class、async/await、箭头函数等）
- 详细兼容性说明请查看 [兼容性开发指南](docs/COMPATIBILITY.md)
- 安装说明请查看 [安装指南](INSTALL.md)

## 📦 模块说明

### config.js
集中管理所有配置常量，包括颜色主题、状态映射、API 配置等。

### data_manager.js
负责任务数据的 CRUD 操作和持久化，支持备份恢复功能。

### task_executor.js
多线程任务执行引擎，支持并发执行、日志记录和任务停止。

### market_service.js
任务市场服务，支持搜索、过滤、缓存和任务导入。

### ui_manager_complete.js
完整的 UI 管理器，处理所有界面显示和用户交互事件。

## 🧪 测试

```javascript
// 运行完整测试套件
engines.execScriptFile('./test_runner.js');

// 快速环境检查
engines.execScriptFile('./test_quick.js');

// 项目验证
engines.execScriptFile('./validate_project.js');
```

## 🗺️ 开发路线图

### v1.1.0 (计划中)
- [ ] 任务分组功能
- [ ] 任务依赖关系
- [ ] 定时任务调度器
- [ ] 任务模板系统

### v1.2.0 (计划中)
- [ ] 真实市场 API 接入
- [ ] 用户认证系统
- [ ] 任务评论功能
- [ ] 数据统计图表

### v2.0.0 (长期)
- [ ] 云端同步
- [ ] 任务分享社区
- [ ] 智能任务推荐
- [ ] 多语言支持

## 🤝 贡献

欢迎贡献代码！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交变更 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 🐛 问题反馈

如果你发现了 Bug 或有功能建议，请 [创建 Issue](https://github.com/chenchuan01/auto-claw/issues)。

## 📄 许可证

本项目基于 [MIT 许可证](LICENSE) 开源。

## 🙏 致谢

- [AutoX.js](https://github.com/kkevsekk1/AutoX) - 强大的 Android 自动化框架
- [Material Design](https://material.io) - UI 设计规范

---

**如果这个项目对你有帮助，请给个 ⭐ Star！**
