# 🦞 龙虾 Agent (Lobster APP)

> 移动端 AI 智能助手 - 能真正干活的通用 Agent

[![Status](https://img.shields.io/badge/status-developing-yellow)]()
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-blue)]()
[![License](https://img.shields.io/badge/license-proprietary-green)]()

---

## 📱 项目简介

龙虾 Agent 是一款基于 OpenClaw 的移动端 AI 助手应用，专注于帮助用户**真正完成工作任务**，而不仅仅是聊天。

### 核心能力

- 📊 **Excel 数据分析** - 上传表格，自动分析生成报告
- 🔍 **智能搜索** - 多源搜索，自动生成研究报告
- 📝 **文案写作** - 周报、报告、邮件、营销文案一键生成
- 🤖 **自动化流程** - 多步骤任务自动完成
- 💼 **办公提效** - 钉钉/微信自动化、客户消息自动回复

---

## 🎯 目标用户

| 用户群体 | 占比 | 核心需求 |
|----------|------|----------|
| 职场白领/新媒体运营 | 60% | Excel 分析、文案生成、周报撰写、社交媒体自动化 |
| 小微企业/电商卖家 | 20% | 客服自动化、选品分析、订单对账、营销文案 |
| 学生/自由职业者 | 15% | 论文资料搜集、数据处理、学习助手 |
| 技术爱好者 | 5% | 自定义 Skill、DIY Agent、二次开发 |

---

## 🏗️ 技术架构

### 方案：云侧 Gateway + 端侧轻量 APP

```
┌─────────────────┐         ┌─────────────────┐
│   移动端 APP     │         │   云侧 Gateway   │
│  (React Native) │ ◄─────► │  (OpenClaw)     │
│                 │  WS/API │                 │
│ • 对话 UI        │         │ • Agent 引擎     │
│ • 文件上传       │         │ • 工具链         │
│ • 用户管理       │         │ • Skill 生态     │
│ • 消息推送       │         │ • 大模型调用     │
└─────────────────┘         └─────────────────┘
```

### 技术栈

| 模块 | 技术选型 |
|------|----------|
| **前端框架** | React Native / uniapp |
| **UI 组件** | uView UI |
| **云侧服务** | OpenClaw Gateway (Node.js) |
| **大模型** | 通义千问 / 智谱 GLM / Moonshot |
| **搜索 API** | Tavily / 百度 / 360 |
| **数据库** | PostgreSQL + Redis |
| **云服务** | 阿里云 / 腾讯云 |

---

## 📋 功能规划

### MVP 版本 (v1.0) - 2 个月

- [ ] 用户注册/登录
- [ ] 对话界面 (类微信)
- [ ] 文件上传 (Excel、PDF、图片)
- [ ] Excel 数据分析
- [ ] 网络搜索 + 报告生成
- [ ] 文案/周报写作

### v2.0 - 4 个月

- [ ] 自定义 Skill
- [ ] 自动化流程编排
- [ ] 团队协作
- [ ] 会员订阅系统

### v3.0 - 6 个月+

- [ ] Skill 市场
- [ ] 端侧大模型
- [ ] 企业私有化部署

---

## 🚀 快速开始

### 云侧部署

```bash
# 克隆项目
git clone https://github.com/DonaldDuck618/lobster-app.git
cd lobster-app/cloud

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入 API Key

# 启动服务
npm start
```

### 移动端开发

```bash
cd mobile

# 安装依赖
npm install

# 运行开发服务器
npm run ios  # iOS
npm run android  # Android
```

---

## 💰 商业模式

### 会员订阅

| 版本 | 价格 | 功能 |
|------|------|------|
| **免费版** | 免费 | 基础对话、每天 5 次 Agent 调用 |
| **标准版** | 19 元/月 | 无限调用、全工具链、自定义 Skill |
| **专业版** | 39 元/月 | 端侧模型、团队协作、专属客服 |

### 企业版

- 私有化部署：5000-50000 元/年
- 定制开发：按需报价

---

## 📄 许可证

本项目为商业软件，未经许可不得用于商业用途。

---

## 📞 联系方式

- **创始人**: Eric (Duck Donald)
- **邮箱**: [待填写]
- **微信**: [待填写]

---

## 🙏 致谢

- [OpenClaw](https://github.com/openclaw/openclaw) - 核心 Agent 引擎
- [React Native](https://reactnative.dev/) - 移动端框架
- [Tavily](https://tavily.com/) - 搜索 API

---

**🦞 龙虾汤出品 | 让 AI 真正为你工作！**

*Last Updated: 2026-03-12*
