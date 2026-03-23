# 🦞 贡献指南

欢迎为赚好多能虾助手 项目贡献代码！

## 如何参与

### 1. Fork 项目

点击 GitHub 页面右上角的 Fork 按钮。

### 2. 克隆项目

```bash
git clone https://github.com/YOUR_USERNAME/lobster-app.git
cd lobster-app
```

### 3. 创建分支

```bash
git checkout -b feature/your-feature-name
```

### 4. 提交代码

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

### 5. 创建 Pull Request

在 GitHub 上创建 PR，描述你的改动。

## 代码规范

### Commit 信息格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Type 类型：**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建/工具链

**示例：**
```
feat(app): 添加文件上传功能

- 实现 Excel 文件上传
- 添加进度条显示
- 支持文件类型校验

Closes #123
```

## 开发环境

### 云侧开发

```bash
cd cloud
npm install
npm run dev
```

### 移动端开发

```bash
cd mobile
npm install
npm run ios  # iOS
npm run android  # Android
```

## 测试

```bash
npm test
npm run test:coverage
```

## 问题反馈

遇到问题？请提交 [Issue](https://github.com/DonaldDuck618/lobster-app/issues)。

## 联系方式

- 邮箱：eric@lobster-app.com
- 微信：[待填写]

---

感谢你的贡献！🦞
