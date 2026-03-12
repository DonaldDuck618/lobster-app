# 🦞 龙虾 Agent - 移动端

> 基于 uniapp 的跨平台移动应用 (iOS & Android)

## 🚀 快速开始

### 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- HBuilderX (可选，用于打包)

### 安装依赖

```bash
cd mobile
npm install
```

### 开发模式

```bash
# H5 开发
npm run dev:h5

# 小程序开发
npm run dev:mp-weixin

# App 开发 (需要 HBuilderX)
npm run dev:app
```

### 打包构建

```bash
# 打包 H5
npm run build:h5

# 打包 小程序
npm run build:mp-weixin

# 打包 App (需要 HBuilderX)
npm run build:app
```

## 📱 平台支持

| 平台 | 状态 | 备注 |
|------|------|------|
| **iOS** | 🟡 开发中 | 最低 iOS 13.0 |
| **Android** | 🟡 开发中 | 最低 Android 5.0 (API 21) |
| **H5** | 🟡 开发中 | 现代浏览器 |
| **微信小程序** | 🟡 开发中 | - |

## 📁 项目结构

```
mobile/
├── pages/              # 页面
│   ├── index/         # 首页 (对话)
│   ├── data/          # 数据中心
│   ├── templates/     # 模板库
│   └── mine/          # 个人中心
├── components/         # 组件
├── utils/             # 工具函数
├── store/             # 状态管理 (Pinia)
├── static/            # 静态资源
├── App.vue            # 应用配置
├── main.js            # 入口文件
├── pages.json         # 页面配置
├── manifest.json      # 应用配置
└── vite.config.js     # Vite 配置
```

## 🎨 UI 框架

- **基础框架**: uniapp 3.x
- **UI 组件**: uView UI 2.x
- **状态管理**: Pinia
- **构建工具**: Vite 5.x

## 🔧 开发规范

### 目录命名

- 文件夹：小写 + 中划线 (如 `user-info`)
- 文件：小写 + 中划线 (如 `user-card.vue`)

### 组件命名

- 大驼峰 (如 `UserProfile.vue`)

### 代码风格

遵循 ESLint 配置

## 📤 打包发布

### iOS 打包

1. 使用 HBuilderX 打开项目
2. 菜单：发行 -> 原生 App-云打包
3. 选择 iOS 平台
4. 配置证书和描述文件
5. 打包生成 .ipa 文件

### Android 打包

1. 使用 HBuilderX 打开项目
2. 菜单：发行 -> 原生 App-云打包
3. 选择 Android 平台
4. 配置签名证书
5. 打包生成 .apk 文件

## 🐛 常见问题

### 1. 依赖安装失败

```bash
# 清除缓存
npm cache clean --force
# 重新安装
rm -rf node_modules package-lock.json
npm install
```

### 2. HBuilderX 识别不到项目

确保项目根目录有 `manifest.json` 文件

### 3. 真机调试

- iOS: 需要 Apple Developer 账号
- Android: 开启 USB 调试模式

## 📞 联系方式

- 邮箱：eric@lobster-app.com
- GitHub: https://github.com/DonaldDuck618/lobster-app

---

🦞 龙虾汤出品 | 让 AI 真正为你工作！
