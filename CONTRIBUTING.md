# 贡献指南

感谢你考虑为 AutoClaw 做出贡献!

## 🤝 如何贡献

### 报告 Bug
1. 检查 [Issues](https://github.com/chenchuan01/auto-claw/issues) 确保问题未被报告
2. 使用 Bug 报告模板创建新 Issue
3. 提供详细的复现步骤和环境信息

### 提出新功能
1. 先创建一个 Issue 讨论新功能
2. 等待维护者反馈
3. 获得批准后再开始开发

### 提交代码
1. Fork 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的变更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📝 代码规范

### JavaScript 规范
- 使用 ES6+ 语法
- 使用 2 空格缩进
- 使用有意义的变量名
- 添加必要的注释
- 每个函数保持简洁(不超过 50 行)

### 模块规范
- 每个模块使用 `module.exports` 导出
- 使用 `require()` 导入依赖
- 保持模块职责单一
- 每个文件不超过 300 行

### 提交信息规范
使用以下格式:
```
<type>: <subject>

<body>
```

类型(type):
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建/工具变更

示例:
```
feat: 添加任务分组功能

- 支持创建任务分组
- 支持拖拽排序
- 添加分组统计
```

## 🧪 测试

在提交 PR 前,请确保:
1. 在 AutoX.js 中测试通过
2. 运行 `test_runner.js` 验证所有模块
3. 添加必要的测试用例

## 📚 文档

如果你的变更涉及:
- 新功能: 更新 README.md
- API 变更: 更新相关文档
- 配置变更: 更新 INSTALL.md

## 🎨 UI 设计

如果涉及 UI 变更:
- 遵循 Material Design 规范
- 保持与现有界面风格一致
- 提供截图或设计稿
- 考虑不同屏幕尺寸

## ❓ 需要帮助?

- 查看 [文档](https://github.com/chenchuan01/auto-claw/wiki)
- 在 [Discussions](https://github.com/chenchuan01/auto-claw/discussions) 提问
- 加入我们的社区群组

## 📄 许可证

提交代码即表示你同意你的贡献将在 MIT 许可证下发布。
