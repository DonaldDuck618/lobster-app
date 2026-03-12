# 🦞 龙虾 Agent - 云侧 Gateway 服务

> 移动端 AI 助手的云侧后端服务

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- PostgreSQL >= 14 (可选，开发模式可用内存存储)
- Redis >= 6 (可选)

### 安装依赖

```bash
cd lobster-app/cloud
npm install
```

### 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入必要的配置
# 至少需要配置：
# - JWT_SECRET
# - DATABASE_URL (开发模式可选)
# - 大模型 API Key (DASHSCOPE_API_KEY 等)
```

### 启动服务

```bash
# 开发模式 (自动重启)
npm run dev

# 生产模式
npm start
```

服务启动后访问：http://localhost:3000

---

## 📁 项目结构

```
cloud/
├── src/
│   ├── index.js           # 主入口
│   ├── config/            # 配置文件
│   ├── routes/            # API 路由
│   │   ├── auth.js        # 认证路由
│   │   ├── chat.js        # 聊天路由
│   │   ├── files.js       # 文件路由
│   │   └── ...
│   ├── services/          # 业务服务
│   │   ├── auth.js        # 认证服务
│   │   ├── chat.js        # 聊天服务
│   │   ├── websocket.js   # WebSocket 服务
│   │   └── cron.js        # 定时任务
│   ├── middleware/        # 中间件
│   │   └── auth.js        # 认证中间件
│   ├── models/            # 数据模型
│   │   └── database.js    # 数据库连接
│   ├── tools/             # 工具集
│   │   ├── excel.js       # Excel 处理
│   │   ├── search.js      # 搜索工具
│   │   └── ...
│   ├── skills/            # 技能模块
│   └── utils/             # 工具函数
│       └── logger.js      # 日志工具
├── config/                # 配置文件
├── scripts/               # 脚本
├── tests/                 # 测试
├── logs/                  # 日志目录
└── uploads/               # 上传文件目录
```

---

## 🛠️ API 接口

### 认证接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/auth/register` | 用户注册 |
| POST | `/api/v1/auth/login` | 用户登录 |
| POST | `/api/v1/auth/wechat` | 微信登录 |
| POST | `/api/v1/auth/refresh` | 刷新 Token |

### 聊天接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/chat/send` | 发送消息 |
| POST | `/api/v1/chat/analyze-excel` | Excel 分析 |
| POST | `/api/v1/chat/generate-report` | 生成报告 |
| GET | `/api/v1/chat/sessions` | 获取会话列表 |
| DELETE | `/api/v1/chat/sessions/:id` | 删除会话 |

### 文件接口

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/v1/files/upload` | 上传文件 |
| GET | `/api/v1/files/:id` | 获取文件信息 |
| DELETE | `/api/v1/files/:id` | 删除文件 |

### WebSocket

```
ws://localhost:3000/ws?userId=xxx
```

---

## 📝 开发指南

### 添加新路由

1. 在 `src/routes/` 创建路由文件
2. 在 `src/routes/index.js` 注册路由

### 添加新服务

1. 在 `src/services/` 创建服务文件
2. 在路由中调用服务

### 添加工具

1. 在 `src/tools/` 创建工具文件
2. 在服务中调用工具

---

## 🔐 安全配置

### JWT 配置

```env
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
```

### 限流配置

```env
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### CORS 配置

```javascript
// 在 src/index.js 中配置
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));
```

---

## 📊 监控与日志

### 日志查看

```bash
# 实时查看日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

### 健康检查

```bash
curl http://localhost:3000/health
```

---

## 🚀 部署

### Docker 部署 (推荐)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### PM2 部署

```bash
# 安装 PM2
npm install -g pm2

# 启动服务
pm2 start src/index.js --name lobster-gateway

# 开机自启
pm2 startup
pm2 save
```

---

## 🧪 测试

```bash
# 运行测试
npm test

# 运行单个测试
npm test -- auth.test.js
```

---

## 📞 技术支持

- 项目仓库：https://github.com/DonaldDuck618/lobster-app
- 问题反馈：https://github.com/DonaldDuck618/lobster-app/issues

---

🦞 龙虾汤出品 | 让 AI 真正为你工作！
