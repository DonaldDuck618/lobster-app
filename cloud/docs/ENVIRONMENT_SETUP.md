# 🦞 能虾助手 - 环境配置指南

**双环境架构**: 开发环境 + 生产环境

---

## 📋 环境列表

| 环境 | 用途 | 配置 | 成本 |
|------|------|------|------|
| **开发环境** | 本地开发 | `.env.development` | ¥0 |
| **生产环境** | 阿里云部署 | `.env.production` | ¥600/月 |

---

## 🚀 快速开始

### 开发环境 (本地)

```bash
# 1. 进入项目目录
cd cloud

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 访问服务
http://localhost:3000
```

**特点：**
- ✅ 自动热重载
- ✅ Mock 数据 (不消耗 API 额度)
- ✅ 详细日志
- ✅ 零成本

---

### 生产环境 (阿里云)

```bash
# 1. 配置环境变量
cp .env.production .env
# 编辑 .env 填入真实配置

# 2. 安装依赖
npm install --production

# 3. 启动服务
npm run start:prod

# 或使用 PM2
pm2 start src/index.js --name lobster-prod
```

**特点：**
- ✅ 真实 API
- ✅ 性能优化
- ✅ 安全加固
- 💰 按量付费

---

## 📁 配置文件说明

### .env.development (开发环境)

```bash
NODE_ENV=development
PORT=3000

# 本地数据库 (SQLite)
DATABASE_URL=sqlite:./dev.db

# 内存缓存
REDIS_URL=

# 模拟模式 (不消耗额度)
DASHSCOPE_MOCK=true
ALIYUN_SMS_MOCK=true
OSS_MOCK=true

# 详细日志
LOG_LEVEL=debug
```

### .env.production (生产环境)

```bash
NODE_ENV=production
PORT=3000

# 云数据库 (RDS MySQL)
DATABASE_URL=mysql://user:pass@host:3306/lobster_prod

# Redis 缓存
REDIS_URL=redis://host:6379

# 真实 API
DASHSCOPE_MOCK=false
ALIYUN_SMS_MOCK=false
OSS_MOCK=false

# 简洁日志
LOG_LEVEL=info
```

---

## 🔧 常用命令

### 开发环境

```bash
# 启动开发服务器
npm run dev

# 运行测试
npm test

# 代码检查
npm run lint

# 数据库迁移
npm run db:migrate

# 清理临时文件
npm run clean
```

### 生产环境

```bash
# 启动生产服务
npm run start:prod

# 一键部署
npm run deploy

# 查看日志
npm run logs

# 构建生产版本
npm run build:prod
```

---

## 📊 环境对比

| 特性 | 开发环境 | 生产环境 |
|------|----------|----------|
| **NODE_ENV** | development | production |
| **数据库** | SQLite | MySQL (RDS) |
| **缓存** | 内存 | Redis |
| **大模型** | Mock | 真实 API |
| **短信** | 打印 | 真实发送 |
| **文件存储** | 本地 | OSS |
| **日志级别** | debug | info |
| **限流** | 宽松 | 严格 |
| **调试** | 开启 | 关闭 |
| **热重载** | 开启 | 关闭 |

---

## 🛡️ 安全配置

### 开发环境

```bash
# 允许跨域
CORS_ORIGIN=*

# 调试模式
DEBUG=true

# 不验证 HTTPS
HTTPS_ENABLED=false
```

### 生产环境

```bash
# 限制跨域
CORS_ORIGIN=https://lobster-app.com

# 关闭调试
DEBUG=false

# 强制 HTTPS
HTTPS_ENABLED=true

# 信任代理
TRUST_PROXY=true
```

---

## 📝 部署流程

### 1. 本地开发测试

```bash
# 开发环境
npm run dev

# 运行测试
npm test

# 确保测试通过
```

### 2. 提交代码

```bash
git add .
git commit -m "feat: 新功能"
git push origin main
```

### 3. 一键部署

```bash
# 配置服务器
export DEPLOY_SERVER=your-server-ip
export DEPLOY_USER=root

# 执行部署
npm run deploy
```

### 4. 验证部署

```bash
# 健康检查
curl http://localhost:3000/health

# 查看日志
pm2 logs lobster-prod

# 重启服务 (如有问题)
pm2 restart lobster-prod
```

---

## ⚠️ 注意事项

### 开发环境

- ✅ 使用 Mock 数据，不消耗 API 额度
- ✅ 可以随意测试，不影响生产
- ❌ 不要提交 .env 文件到 Git
- ❌ 不要使用生产环境配置

### 生产环境

- ✅ 使用真实配置
- ✅ 严格的安全限制
- ✅ 完整的日志记录
- ❌ 不要开启 DEBUG 模式
- ❌ 不要使用开发环境配置

---

## 🔍 故障排查

### 开发环境问题

**问题：无法启动**
```bash
# 检查端口占用
lsof -i :3000

# 清理并重启
npm run clean
npm run dev
```

**问题：Mock 数据不工作**
```bash
# 检查配置
cat .env.development | grep MOCK

# 确保 MOCK=true
```

### 生产环境问题

**问题：服务无法访问**
```bash
# 检查服务状态
pm2 status

# 查看日志
pm2 logs lobster-prod

# 重启服务
pm2 restart lobster-prod
```

**问题：数据库连接失败**
```bash
# 检查配置
cat .env | grep DATABASE_URL

# 测试连接
mysql -h host -u user -p
```

---

## 📞 需要帮助？

**常见问题：**
- 环境配置问题
- 部署失败
- 性能问题
- 安全问题

**联系方式：**
- 📝 查看文档
- 💬 团队沟通
- 🐛 提交 Issue

---

🦞 能虾助手出品 | 让 AI 真正为你工作！

*最后更新：2026-03-12*
