# 🦞 赚好多能虾助手 - iOS & Android APP 打包指南

---

## 📱 支持的 platform

| 平台 | 状态 | 说明 |
|------|------|------|
| **微信小程序** | ✅ 已完成 | 可直接运行 |
| **Android APP** | ✅ 可打包 | 生成 APK |
| **iOS APP** | ✅ 可打包 | 生成 IPA |
| **H5** | ✅ 已完成 | http://xiabot.cn |

---

## 🚀 快速打包

### 方式 1：使用 HBuilderX（推荐）⭐

**步骤：**

#### 1. 下载 HBuilderX

```
访问：https://www.dcloud.io/hbuilderx.html
下载：正式版（免费）
安装：打开安装包
```

#### 2. 导入项目

```
1. 打开 HBuilderX
2. 文件 -> 导入 -> 从本地目录导入
3. 选择：/Users/liuyibin/.openclaw/workspace/lobster-app/mobile
4. 点击"导入"
```

#### 3. 配置 manifest.json

```
1. 双击打开 manifest.json
2. 基础配置：
   - 应用名称：赚好多能虾助手
   - 应用 Logo：上传 icon.png
   - 版本号：1.0.0 (100)
3. App 图标配置：
   - 上传各尺寸图标
4. 启动界面配置：
   - 上传启动图
```

#### 4. 打包 Android APK

```
1. 菜单 -> 发行 -> 原生 App-云打包
2. 选择：Android
3. 选择：免费打包（公共测试包）
4. 等待打包完成（5-10 分钟）
5. 下载 APK 文件
```

#### 5. 打包 iOS IPA

```
1. 菜单 -> 发行 -> 原生 App-云打包
2. 选择：iOS
3. 需要：
   - Apple Developer 账号（$99/年）
   - 证书和描述文件
4. 等待打包完成
5. 下载 IPA 文件
```

---

### 方式 2：命令行打包（离线）

#### 安装依赖

```bash
cd /Users/liuyibin/.openclaw/workspace/lobster-app/mobile

# 安装 uni-app CLI
npm install -g @dcloudio/uvm
uvm

# 安装项目依赖
npm install
```

#### 打包 Android

```bash
# 打包 Android APK
npx uni build --app-android

# 输出目录
dist/build/app/
```

#### 打包 iOS

```bash
# 打包 iOS IPA
npx uni build --app-ios

# 输出目录
dist/build/ios/
```

---

## 📋 打包前准备

### Android 准备

**1. 应用图标**
```
尺寸：512x512 px
格式：PNG
位置：static/app-icon.png
```

**2. 启动图**
```
尺寸：1125x2436 px（全面屏）
格式：PNG
位置：static/app-splash.png
```

**3. 签名证书**
```
第一次打包会生成
或自己准备 keystore 文件
```

---

### iOS 准备

**1. Apple Developer 账号**
```
费用：$99/年
访问：https://developer.apple.com/
```

**2. 创建证书**
```
1. 登录 Apple Developer
2. Certificates, IDs & Profiles
3. 创建证书：
   - Development（开发）
   - Distribution（发布）
```

**3. 创建 App ID**
```
1. Identifiers
2. 创建 App ID
3. Bundle ID: com.lobster.agent
```

**4. 创建描述文件**
```
1. Profiles
2. 创建描述文件
3. 关联证书和设备
```

---

## 🎯 打包配置

### manifest.json 配置

```json
{
  "name": "赚好多能虾助手",
  "appid": "__UNI__LOBSTER",
  "versionName": "1.0.0",
  "versionCode": "100",
  "app-plus": {
    "distribute": {
      "android": {
        "minSdkVersion": 21,
        "targetSdkVersion": 33
      },
      "ios": {
        "minimum_os_version": "13.0"
      }
    }
  }
}
```

---

## 📊 打包输出

### Android

```
输出文件：lobster-agent.apk
文件大小：约 20-30MB
安装方式：
  - 直接安装（开发测试）
  - 应用市场发布（正式）
```

### iOS

```
输出文件：lobster-agent.ipa
文件大小：约 30-50MB
安装方式：
  - TestFlight（测试）
  - App Store（正式发布）
```

---

## 🚀 发布流程

### Android 发布

**1. 应用市场**
```
- 华为应用市场
- 小米应用商店
- OPPO 软件商店
- vivo 应用商店
- 应用宝（腾讯）
```

**2. 准备材料**
```
- APK 文件
- 应用图标
- 应用截图（3-5 张）
- 应用介绍
- 隐私政策
- 营业执照（个人可免）
```

**3. 提交审核**
```
审核时间：1-3 天
费用：免费（部分市场收费）
```

---

### iOS 发布

**1. App Store Connect**
```
访问：https://appstoreconnect.apple.com
登录：Apple ID
```

**2. 创建应用**
```
1. 我的 App -> 创建 App
2. 选择平台：iOS
3. 填写信息：
   - 名称：赚好多能虾助手
   - Bundle ID：com.lobster.agent
   - SKU：LOBSTER001
```

**3. 上传 IPA**
```
使用 Xcode 或 Transporter 上传
```

**4. 填写应用信息**
```
- 应用截图（6.5 寸和 5.5 寸）
- 应用介绍
- 关键词
- 隐私政策 URL
```

**5. 提交审核**
```
审核时间：1-3 天
费用：$99/年（开发者账号）
```

---

## 💰 费用说明

### Android

| 项目 | 费用 | 说明 |
|------|------|------|
| **开发者账号** | 免费 | 个人账号 |
| **应用市场** | 免费 | 大部分市场 |
| **云打包** | 免费 | HBuilderX 公共包 |
| **总计** | **¥0** | 个人开发 |

---

### iOS

| 项目 | 费用 | 说明 |
|------|------|------|
| **开发者账号** | $99/年 | 必须 |
| **App Store** | 免费 | 包含在账号中 |
| **云打包** | 免费 | HBuilderX 公共包 |
| **总计** | **¥700/年** | 必须费用 |

---

## 🎯 我的建议

### 今天可以做

**1. 用 HBuilderX 打包 Android 测试版**
```
时间：30 分钟
费用：免费
输出：APK 测试包
```

**2. 准备 iOS 开发者账号（如需）**
```
时间：30 分钟
费用：$99/年
必须：正式发布需要
```

---

### 明天可以做

**1. 打包 Android 正式版**
```
- 准备应用市场材料
- 提交应用市场审核
- 等待上架
```

**2. 打包 iOS 测试版**
```
- 使用 TestFlight
- 邀请测试用户
- 收集反馈
```

---

### 备案完成后

**1. iOS 正式发布**
```
- 提交 App Store
- 等待审核（1-3 天）
- 正式上线
```

**2. Android 全市场上架**
```
- 主流应用市场
- 同步上线
```

---

## 📋 快速开始

### 立即打包 Android

**在 Mac 上执行：**

```bash
# 1. 打开 HBuilderX
open /Applications/HBuilderX.app

# 2. 导入项目
# 文件 -> 导入 -> mobile 目录

# 3. 打包
# 菜单 -> 发行 -> 原生 App-云打包
# 选择 Android -> 免费打包
```

**5-10 分钟后下载 APK！**

---

## 📞 需要帮助

**打包遇到问题：**
- HBuilderX 安装问题
- manifest.json 配置
- 证书配置
- 应用市场提交

**随时告诉我！**

---

🦞 **准备好就开始打包吧！**

**推荐先用 HBuilderX 打包 Android 测试版（30 分钟）！** 🚀

**加油！马上就完成了！** 🦞💪
