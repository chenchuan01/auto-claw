# 更新日志

所有重要的项目变更都会记录在这个文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/),
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 计划中
- 任务分组功能
- 任务依赖关系
- 云端同步
- 多语言支持

## [1.0.0] - 2026-03-17

### 新增
- ✨ 完整的任务管理系统
  - 添加、编辑、删除任务
  - 任务状态管理(待执行、执行中、成功、失败)
  - 任务执行次数统计

- 🛒 任务市场功能
  - 浏览市场任务
  - 搜索和过滤
  - 一键导入任务
  - 任务评分和下载统计

- 🚀 任务执行引擎
  - 多线程安全执行
  - 实时日志记录
  - 任务停止功能
  - 脚本语法验证

- 💾 数据管理
  - 本地数据持久化
  - 数据备份和恢复
  - 设置管理
  - 自动备份功能

- 🎨 用户界面
  - Material Design 风格
  - 响应式布局
  - 状态颜色编码
  - 空状态提示
  - 底部导航栏

### 技术特性
- 📦 模块化架构设计
- 🔒 完善的错误处理
- 📝 详细的代码注释
- 🧪 测试脚本支持
- 📚 完整的文档

### 文件结构
```
AutoClaw/
├── main.js                      # 主入口
├── modules/                     # 核心模块
│   ├── config.js               # 配置
│   ├── data_manager.js         # 数据管理
│   ├── task_executor.js        # 任务执行
│   ├── market_service.js       # 市场服务
│   └── ui_manager_complete.js  # UI管理
├── test_runner.js              # 测试运行器
└── project.json                # 应用配置
```

### 已知问题
- 市场功能使用模拟数据(待接入真实 API)
- UI 管理器文件较大(计划后续拆分)

---

## 版本说明

### 版本号格式: MAJOR.MINOR.PATCH

- **MAJOR**: 不兼容的 API 变更
- **MINOR**: 向后兼容的功能新增
- **PATCH**: 向后兼容的问题修复

### 变更类型

- `新增`: 新功能
- `变更`: 现有功能的变更
- `废弃`: 即将移除的功能
- `移除`: 已移除的功能
- `修复`: Bug 修复
- `安全`: 安全相关的修复

[Unreleased]: https://github.com/chenchuan01/auto-claw/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/chenchuan01/auto-claw/releases/tag/v1.0.0
