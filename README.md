# 🦐 能虾助手 - 你的 AI 智能助手

**让 AI 真正为你工作**

[![Status](https://img.shields.io/badge/status-ready-green)]()
[![Version](https://img.shields.io/badge/version-1.0.0-blue)]()
[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20Mini%20Program%20%7C%20Android%20%7C%20iOS-purple)]()

---

## 📖 简介

**能虾助手**是一款全平台 AI 智能助手，支持文字对话、图片识别、语音输入、Excel 分析、周报写作等多种功能，帮助你提升工作效率。

### 核心特性

- 🤖 **AI 智能对话** - 有问必答，支持多轮对话
- 📊 **Excel 分析** - 自动分析数据，生成洞察报告
- 📝 **周报日报** - 1 分钟自动生成工作报告
- 📸 **图片 OCR** - 快速识别图片中的文字
- 🎤 **语音输入** - 解放双手，语音转文字
- 🎨 **图像生成** - 文生图，创意无限
- 🔍 **搜索报告** - 自动搜索行业报告
- 💳 **会员系统** - 灵活的付费方案

---

## 🌐 在线体验

### Web 版
```
http://xiabot.cn
```

### 支付页面
```
http://xiabot.cn/payment.html
```

---

## 📱 支持平台

| 平台 | 状态 | 说明 |
|------|------|------|
| **Web 版** | ✅ 已上线 | 浏览器直接访问 |
| **微信小程序** | ✅ 已开发 | 微信开发者工具 |
| **Android APP** | ✅ 可打包 | 云打包生成 APK |
| **iOS APP** | ✅ 可打包 | 云打包生成 IPA |

---

## 🚀 快速开始

### Web 版使用

1. 访问 http://xiabot.cn
2. 注册/登录账号
3. 开始对话或选择快捷指令
4. 享受 AI 带来的便利

### 小程序使用

1. 打开微信开发者工具
2. 导入 mobile 目录
3. 编译运行
4. 扫码体验

### APP 打包

#### Android
```bash
# 使用 HBuilderX
1. 导入 mobile 项目
2. 发行 -> 原生 App-云打包
3. 选择 Android
4. 等待打包完成
```

#### iOS
```bash
# 使用 HBuilderX
1. 导入 mobile 项目
2. 发行 -> 原生 App-云打包
3. 选择 iOS
4. 需要 Apple Developer 账号
```

---

## 💡 功能演示

### AI 对话
```
用户：帮我写一份周报
能虾：好的，请提供以下信息：
      1. 本周主要工作内容
      2. 遇到的问题
      3. 下周计划
```

### Excel 分析
```
用户上传 Excel 文件
能虾：已收到文件，正在分析...
      📊 数据概览
      - 总行数：1234 行
      - 总销售额：¥5,678,900
      - 同比增长：+23.5%
      
      💡 主要发现
      1. 3 月销售额环比增长 45%
      2. 华东大区贡献 40% 销售额
      3. SKU-A001 为爆款，占比 15%
```

### 图片 OCR
```
用户上传包含文字的图片
能虾：📸 图片识别成功
      识别内容：
      会议通知
      时间：2026-03-15 14:00
      地点：会议室 A
      主题：Q1 复盘会议
```

---

## 💳 会员方案

### 免费版
```
价格：¥0/月
• 每天 5 次 Agent 调用
• 基础文件处理
• 10MB 文件限制
```

### 标准版 ⭐ 最受欢迎
```
价格：¥19/月
• 无限次 Agent 调用
• 全工具链使用
• 100MB 文件限制
• 自定义 Skill
```

### 专业版
```
价格：¥39/月
• 标准版所有功能
• 端侧模型使用
• 团队协作功能
• 500MB 文件限制
• 专属客服
```

### 企业版
```
价格：¥5000/年
• 专业版所有功能
• 私有化部署
• 定制开发
• 1GB 文件限制
• SLA 保障
```

---

## 🛠️ 技术栈

### 后端
```
• Node.js 22+
• Express.js
• MySQL (RDS)
• Redis
• OSS 对象存储
```

### 前端
```
• HTML5/CSS3/JavaScript
• uni-app (小程序/APP)
• Vue 3
```

### AI 能力
```
• 阿里云百炼 (通义千问)
• 阿里云视觉智能 (OCR)
• 阿里云智能语音 (ASR/TTS)
• 智谱 GLM
• MiniMax
• Moonshot Kimi
```

### 部署
```
• 阿里云 ECS
• PM2 进程管理
• Nginx 反向代理
```

---

## 📁 项目结构

```
lobster-app/
├── cloud/              # 后端服务
│   ├── src/
│   │   ├── routes/     # API 路由
│   │   ├── services/   # 业务服务
│   │   ├── middleware/ # 中间件
│   │   └── utils/      # 工具函数
│   ├── scripts/        # 脚本文件
│   └── docs/           # 文档
├── mobile/             # 移动端 (小程序/APP)
│   ├── pages/          # 页面
│   ├── utils/          # 工具
│   └── static/         # 静态资源
├── web/                # Web 前端
│   ├── index.html      # 主页
│   └── payment.html    # 支付页
├── BRANDING.md         # 品牌规范
└── README.md           # 项目说明
```

---

## 🔌 API 文档

### 认证接口
```
POST /api/v1/auth/register    # 用户注册
POST /api/v1/auth/login       # 用户登录
POST /api/v1/auth/wechat      # 微信登录
```

### 聊天接口
```
POST /api/v1/chat/send        # 发送消息
GET  /api/v1/chat/sessions    # 会话列表
```

### 文件接口
```
POST /api/v1/files/upload     # 上传文件
GET  /api/v1/files            # 文件列表
```

### 视觉接口
```
POST /api/v1/vision/ocr       # OCR 识别
POST /api/v1/vision/analyze   # 图片分析
POST /api/v1/vision/table     # 表格识别
```

### 音频接口
```
POST /api/v1/audio/transcribe # 语音识别
POST /api/v1/audio/synthesize # 语音合成
```

### 支付接口
```
GET  /api/v1/payment/plans         # 会员套餐
POST /api/v1/payment/create-order  # 创建订单
POST /api/v1/payment/qr/submit     # 提交支付凭证
```

---

## 📊 性能指标

### 响应时间
```
• API 响应：~200ms
• 页面加载：~1s
• 图片上传：~5s
• OCR 识别：~15s
```

### 并发能力
```
• 日活用户：1000+
• 并发请求：100/s
• 存储容量：50GB (可扩展)
```

---

## 💰 成本结构

### 固定成本
```
• ECS 服务器：¥99/年
• 域名：¥60/年
• RDS MySQL: ¥119/月
• Redis: ¥49/月
• OSS: ¥14/月
• 总计：¥195/月 (首年)
```

### 可变成本
```
• 视觉智能：¥0.003/次 (1000 次免费/月)
• 智能语音：¥0.006/分钟 (1000 分钟免费/月)
• 大模型：¥0.004/1K tokens (100 万免费/月)
```

---

## 🎯 开发路线图

### v1.0 (当前版本) ✅
```
✅ 核心功能开发
✅ 多平台支持
✅ 支付功能
✅ 服务器部署
```

### v1.1 (计划中)
```
• 官方支付接入
• 小程序上架
• APP 市场上架
• SSL 证书配置
```

### v2.0 (未来)
```
• 云端同步
• 对话搜索
• 文件预览
• 批量导出
• 更多 AI 能力
```

---

## 🤝 贡献指南

### 开发环境设置
```bash
# 克隆项目
git clone https://github.com/DonaldDuck618/lobster-app.git

# 安装后端依赖
cd lobster-app/cloud
npm install

# 安装前端依赖
cd ../mobile
npm install

# 启动后端服务
npm run dev
```

### 提交代码
```bash
# 创建分支
git checkout -b feature/your-feature

# 提交代码
git commit -m "feat: add your feature"

# 推送分支
git push origin feature/your-feature

# 创建 Pull Request
```

---

## 📄 许可证

```
MIT License
© 2026 能虾助手
```

---

## 📞 联系方式

### 官方渠道
```
• 网站：http://xiabot.cn
• 邮箱：support@xiabot.cn
• GitHub: https://github.com/DonaldDuck618/lobster-app
```

### 客服时间
```
• 工作日：9:00-18:00
• 周末：10:00-16:00
```

---

## 🎉 致谢

感谢以下开源项目和服务：

- [OpenClaw](https://github.com/openclaw/openclaw) - 框架灵感
- [uni-app](https://uniapp.dcloud.net.cn/) - 跨平台框架
- [阿里云](https://www.aliyun.com/) - 云服务支持
- [Express.js](https://expressjs.com/) - Web 框架

---

**能虾助手 - 让 AI 真正为你工作** 🦐

*Last Updated: 2026-03-14*
