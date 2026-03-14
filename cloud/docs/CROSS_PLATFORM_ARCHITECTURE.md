# 🦞 能虾助手 - 跨平台架构设计

**支持平台**: 微信小程序、iOS、Android、Web、macOS、Windows、Linux

---

## 🏗️ 架构设计原则

### 1. **后端统一** ✅

- 一套 API 服务所有端
- RESTful API + WebSocket
- 客户端类型识别和适配
- 版本控制和向后兼容

### 2. **前端组件化** ✅

- 核心逻辑 100% 复用
- UI 组件按平台适配
- 统一的 API 调用层
- 共享工具函数库

### 3. **协议标准化** ✅

- 统一的 WebSocket 消息格式
- 标准化的错误码
- 一致的响应格式
- 客户端能力协商

### 4. **配置可移植** ✅

- 环境变量统一管理
- 平台特定配置分离
- 支持动态配置更新

---

## 📱 支持的平台

| 平台 | 技术栈 | 状态 | 代码复用率 |
|------|--------|------|------------|
| **微信小程序** | uniapp | ✅ 已开发 | 70% |
| **iOS App** | uniapp | ⏳ 待开发 | 70% |
| **Android App** | uniapp | ⏳ 待开发 | 70% |
| **Web** | Vue3/React | ⏳ 待开发 | 80% |
| **macOS** | Electron | ✅ 框架已建 | 90% |
| **Windows** | Electron | ⏳ 待开发 | 90% |
| **Linux** | Electron | ⏳ 待开发 | 90% |

---

## 🎯 客户端类型识别

### API 设计

```javascript
// 请求 Header
headers: {
  'X-Client-Type': 'macos',          // 客户端类型
  'X-Client-Version': '1.0.0',       // 客户端版本
  'X-Platform-Version': '14.0'       // 平台版本 (如 macOS 14.0)
}
```

### 支持的客户端类型

```javascript
const CLIENT_TYPES = {
  WECHAT_MINIPROGRAM: 'wechat-miniprogram',
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
  MACOS: 'macos',
  WINDOWS: 'windows',
  LINUX: 'linux'
};
```

### 能力映射

```javascript
const CLIENT_CAPABILITIES = {
  macos: {
    pushNotification: true,
    fileUpload: true,
    maxFileSize: 1024 * 1024 * 1024, // 1GB
    voiceMessage: true,
    videoMessage: true,
    screenShare: true,
    nativeFeatures: ['systemTray', 'globalShortcut', 'touchBar']
  },
  wechat-miniprogram: {
    pushNotification: false,
    fileUpload: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    voiceMessage: true,
    videoMessage: false,
    screenShare: false,
    nativeFeatures: ['camera', 'location', 'wechatPay']
  }
  // ... 其他平台
};
```

---

## 💻 Electron 桌面应用

### 架构

```
desktop/
├── src/
│   ├── main/           # 主进程
│   │   ├── index.js    # 入口
│   │   ├── window.js   # 窗口管理
│   │   ├── tray.js     # 托盘菜单
│   │   └── shortcut.js # 全局快捷键
│   ├── renderer/       # 渲染进程 (复用 Web 代码)
│   │   ├── components/ # UI 组件
│   │   ├── pages/      # 页面
│   │   └── utils/      # 工具
│   └── preload/        # 预加载脚本
├── resources/          # 静态资源
│   └── icon.png
└── package.json
```

### 核心功能

```javascript
// 主进程功能
- 窗口管理 (创建、关闭、最小化)
- 系统托盘
- 全局快捷键
- 自动更新
- 本地存储
- 文件系统访问
- 原生菜单

// 渲染进程功能
- 复用 Web 组件
- 调用原生 API
- WebSocket 通信
- 本地文件操作
```

### 跨平台打包

```bash
# macOS
npm run build:mac
# 输出：dmg (支持 Intel + Apple Silicon)

# Windows
npm run build:win
# 输出：exe/nsis

# Linux
npm run build:linux
# 输出：AppImage/deb/rpm
```

---

## 🔄 代码复用策略

### 100% 复用

```
├── cloud/              # 后端 API
├── utils/              # 工具函数
│   ├── format.js       # 格式化
│   ├── validate.js     # 验证
│   └── constants.js    # 常量
└── api/                # API 调用
    ├── auth.js         # 认证
    ├── chat.js         # 聊天
    └── files.js        # 文件
```

### 70-90% 复用

```
├── components/         # UI 组件
│   ├── Button.vue      # 按钮 (平台适配)
│   ├── Input.vue       # 输入框
│   └── Message.vue     # 消息气泡
└── pages/              # 页面
    ├── Chat.vue        # 聊天页
    ├── Files.vue       # 文件页
    └── Profile.vue     # 个人页
```

### 平台特定代码

```
├── platforms/
│   ├── wechat/         # 微信小程序特定
│   ├── ios/            # iOS 特定
│   ├── android/        # Android 特定
│   └── desktop/        # 桌面端特定
│       ├── tray.js     # 系统托盘
│       └── shortcut.js # 全局快捷键
```

---

## 📊 统一响应格式

### 成功响应

```json
{
  "success": true,
  "code": 200,
  "message": "success",
  "data": {
    // 业务数据
  },
  "meta": {
    "timestamp": 1710234567,
    "requestId": "uuid_xxx",
    "clientType": "macos"
  }
}
```

### 错误响应

```json
{
  "success": false,
  "code": 400,
  "error": "Bad Request",
  "message": "参数错误",
  "data": {
    "field": "phone",
    "details": "手机号格式不正确"
  },
  "meta": {
    "timestamp": 1710234567,
    "requestId": "uuid_xxx"
  }
}
```

---

## 🌐 WebSocket 消息协议

### 消息格式

```typescript
interface WSMessage {
  type: 'chat' | 'file' | 'notification' | 'system';
  version: string;
  clientId: string;
  clientType: string;
  payload: any;
  timestamp: number;
}
```

### 示例

```javascript
// 发送消息
{
  "type": "chat",
  "version": "1.0",
  "clientId": "device_uuid",
  "clientType": "macos",
  "payload": {
    "message": "你好",
    "sessionId": "session_uuid"
  },
  "timestamp": 1710234567
}

// 接收消息
{
  "type": "chat",
  "version": "1.0",
  "payload": {
    "message": "你好，我是能虾助手",
    "role": "assistant"
  },
  "timestamp": 1710234567
}
```

---

## 🎨 UI 适配策略

### 响应式设计

```css
/* 移动端优先 */
.container {
  padding: 10px;
}

/* 平板 */
@media (min-width: 768px) {
  .container {
    padding: 20px;
  }
}

/* 桌面端 */
@media (min-width: 1024px) {
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### 平台特定样式

```javascript
// 根据平台应用不同样式
const platformStyles = {
  macos: {
    titleBar: 'hidden', // 使用原生标题栏
    trafficLights: true // macOS 红绿灯按钮
  },
  windows: {
    titleBar: 'custom', // 自定义标题栏
    trafficLights: false
  },
  wechat: {
    titleBar: 'native', // 小程序原生导航栏
    navigationBar: true
  }
};
```

---

## 🚀 开发流程

### 1. 开发新平台

```bash
# 1. 创建平台目录
mkdir platforms/new-platform

# 2. 复制基础模板
cp -r platforms/web/* platforms/new-platform/

# 3. 适配平台特定功能
# - 修改 API 调用
# - 适配 UI 组件
# - 添加原生功能

# 4. 测试
npm run test:new-platform
```

### 2. 添加新功能

```bash
# 1. 在后端添加 API
# cloud/src/routes/new-feature.js

# 2. 在共享代码添加组件
# components/NewFeature.vue

# 3. 在各平台页面引用
# platforms/*/pages/xxx.vue

# 4. 测试所有平台
npm run test:all-platforms
```

---

## 📦 发布流程

### 多端同时发布

```bash
# 1. 更新版本号
npm version patch  # 或 minor/major

# 2. 构建所有平台
npm run build:all

# 3. 发布
npm run release:all
```

### 版本同步

```
v1.0.0
├── 微信小程序 v1.0.0 (审核中)
├── iOS App v1.0.0 (审核中)
├── Android App v1.0.0 (审核中)
├── Web v1.0.0 (已部署)
├── macOS v1.0.0 (已发布)
└── Windows v1.0.0 (已发布)
```

---

## 🔐 安全考虑

### 1. API 认证

```javascript
// 所有端使用统一的 JWT Token
headers: {
  'Authorization': 'Bearer eyJhbGc...'
}
```

### 2. 设备指纹

```javascript
// 识别设备
headers: {
  'X-Device-Id': 'unique_device_fingerprint'
}
```

### 3. 平台特定安全

| 平台 | 安全措施 |
|------|----------|
| **小程序** | 微信审核、域名白名单 |
| **iOS** | App Store 审核、沙箱环境 |
| **macOS** | 代码签名、公证 |
| **Windows** | 代码签名、SmartScreen |

---

## 📊 性能优化

### 1. 资源加载

```javascript
// 按平台加载资源
const resources = {
  macos: ['macos-specific.css', 'tray-icon.png'],
  wechat: ['wechat-specific.css']
};

loadResources(resources[platform]);
```

### 2. 缓存策略

```javascript
// 不同平台不同缓存策略
const cacheConfig = {
  macos: { maxAge: '7d' }, // 桌面端缓存 7 天
  wechat: { maxAge: '1d' }, // 小程序缓存 1 天
  mobile: { maxAge: '3d' }  // 移动端缓存 3 天
};
```

---

## 🎯 扩展性保障

### 1. 插件系统

```javascript
// 支持平台特定插件
const plugins = {
  macos: ['touchbar-plugin', 'tray-plugin'],
  wechat: ['wechat-pay-plugin']
};
```

### 2. 特性检测

```javascript
// 运行时检测支持的特性
if (client.capabilities.screenShare) {
  enableScreenShare();
}
```

### 3. 降级策略

```javascript
// 不支持的功能优雅降级
try {
  await useAdvancedFeature();
} catch {
  useBasicFeature(); // 降级到基础功能
}
```

---

## 📈 未来扩展

### 可能的新平台

| 平台 | 优先级 | 预计工作量 |
|------|--------|------------|
| **iPad** | P1 | 2 天 (复用 iOS) |
| **Chrome 扩展** | P2 | 3 天 |
| **智能手表** | P3 | 5 天 |
| **车载系统** | P4 | 7 天 |

### 扩展策略

```
1. 评估平台特性
2. 确定复用代码比例
3. 开发平台适配层
4. 测试和发布
```

---

🦞 能虾助手出品 | 让 AI 真正为你工作！

*最后更新：2026-03-12*
