# 📱 微信网页授权登录配置指南

## 📅 完成时间
**日期:** 2026-03-17 20:50 GMT+8

---

## ✅ 功能状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 网页授权服务 | ✅ 已完成 | WechatWebOAuthService |
| API 接口 | ✅ 已完成 | 3 个接口 |
| 前端集成 | ⏳ 待配置 | 需要公众号配置 |
| 公众号配置 | ❓ 待提供 | 需要你提供 |

---

## 🎯 需要你提供的配置信息

### 公众号信息（必需）

**请按以下步骤获取：**

**1. 登录公众号后台**
```
访问：https://mp.weixin.qq.com/
用公众号管理员微信扫码登录
```

**2. 获取 AppID 和 AppSecret**
```
菜单：开发 → 基本配置
复制：
- AppID(公众号 ID): __________
- AppSecret(公众号密钥): __________
```

**3. 配置网页授权域名**
```
菜单：设置 → 公众号设置 → 功能设置
网页授权域名：8.129.98.129
（需要验证文件，按提示操作）
```

---

## 🔧 配置步骤

### 步骤 1: 更新服务器配置

**登录服务器:**
```bash
ssh root@8.129.98.129
```

**编辑配置文件:**
```bash
vi /opt/lobster-app/lobster-app/cloud/.env
```

**添加配置:**
```bash
# 微信网页授权配置（公众号）
WECHAT_OFFICIAL_APP_ID=你的公众号 AppID
WECHAT_OFFICIAL_APP_SECRET=你的公众号 AppSecret
WECHAT_OAUTH_DOMAIN=8.129.98.129
```

**保存退出:**
```
按 Esc，输入 :wq，按 Enter
```

### 步骤 2: 重启服务

```bash
pm2 restart lobster-prod
```

### 步骤 3: 测试配置

```bash
curl http://8.129.98.129/api/v1/auth/login/wechat-web-url
```

---

## 📊 已实现的 API 接口

### 1. 获取授权 URL
**接口:** `GET /api/v1/auth/login/wechat-web-url`

**参数:**
- `redirect_uri` (可选): 回调地址

**响应:**
```json
{
  "success": true,
  "data": {
    "authUrl": "https://open.weixin.qq.com/connect/oauth2/authorize?..."
  }
}
```

**使用:**
```
用户访问这个 URL → 微信授权 → 回调到 redirect_uri
```

---

### 2. 网页授权登录
**接口:** `POST /api/v1/auth/login/wechat-web`

**请求:**
```json
{
  "code": "微信返回的 code"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "nickname": "微信昵称",
    "avatar": "头像 URL",
    "token": "JWT Token",
    "wechatOpenid": "openid",
    "isNewUser": true
  }
}
```

---

### 3. 微信小程序登录（已有）
**接口:** `POST /api/v1/auth/login/wechat`

**用于:** 小程序内登录

---

## 🎨 前端集成示例

### H5 网页登录流程

**1. 检测微信环境**
```javascript
function isWechat() {
  return /micromessenger/i.test(navigator.userAgent);
}
```

**2. 跳转到微信授权**
```javascript
if (isWechat()) {
  // 获取授权 URL
  const response = await fetch('/api/v1/auth/login/wechat-web-url?redirect_uri=' + encodeURIComponent(window.location.href));
  const data = await response.json();
  
  // 跳转到微信授权页面
  window.location.href = data.data.authUrl;
} else {
  // 非微信环境，显示手机号登录
  showPhoneLogin();
}
```

**3. 处理回调**
```javascript
// 在回调页面
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');

if (code) {
  // 用 code 登录
  const response = await fetch('/api/v1/auth/login/wechat-web', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // 保存 token
    localStorage.setItem('lobster_token', data.data.token);
    // 跳转首页
    window.location.href = '/';
  }
}
```

---

## 📱 完整登录流程

```
用户访问 H5 页面
    ↓
检测是否在微信内
    ↓
是 → 获取授权 URL
    ↓
用户同意授权
    ↓
微信返回 code
    ↓
用 code 换取用户信息
    ↓
查找/创建用户
    ↓
返回 Token
    ↓
登录成功
```

---

## 🎯 配置检查清单

### 必需配置
- [ ] 公众号 AppID
- [ ] 公众号 AppSecret
- [ ] 网页授权域名
- [ ] 服务器配置更新
- [ ] 服务重启

### 可选配置
- [ ] 前端页面集成
- [ ] 回调页面开发
- [ ] 测试验证

---

## 💡 使用场景

### 场景 1: 用户在微信内打开 H5

```
1. 用户点击朋友分享的链接
2. 在微信内打开能虾助手 H5
3. 页面自动检测微信环境
4. 显示"微信一键登录"按钮
5. 用户点击授权
6. 登录成功
```

### 场景 2: 用户在普通浏览器打开

```
1. 用户用手机浏览器访问
2. 检测非微信环境
3. 显示手机号登录
4. 输入手机号和验证码
5. 登录成功
```

---

## 📊 登录方式对比

| 登录方式 | 微信小程序 | 微信内 H5 | 普通浏览器 |
|---------|-----------|---------|-----------|
| 小程序登录 | ✅ | ❌ | ❌ |
| 网页授权 | ❌ | ✅ | ❌ |
| 手机号 | ✅ | ✅ | ✅ |

---

## 🔍 测试方法

### 测试配置状态

```bash
curl http://8.129.98.129/api/v1/auth/login/wechat-web-url
```

**成功响应:**
```json
{
  "success": true,
  "data": { "authUrl": "https://..." }
}
```

**失败响应（未配置）:**
```json
{
  "error": "微信配置缺失"
}
```

---

## ⚠️ 注意事项

### 1. 域名验证
- 网页授权域名需要验证所有权
- 按微信提示上传验证文件
- 验证通过后才能使用

### 2. 授权作用域
- `snsapi_base`: 静默授权，只获取 openid
- `snsapi_userinfo`: 需要用户同意，获取用户信息

### 3. Token 有效期
- access_token: 2 小时
- refresh_token: 30 天
- JWT Token: 7 天

---

## 📝 公众号配置截图指引

### 获取 AppID 和 AppSecret
```
公众号后台 → 开发 → 基本配置
↓
看到：
- AppID(公众号 ID): wx__________
- AppSecret(公众号密钥): __________
```

### 配置网页授权域名
```
公众号后台 → 设置 → 公众号设置 → 功能设置
↓
网页授权域名 → 设置
↓
输入：8.129.98.129
↓
下载验证文件，上传到服务器根目录
↓
验证通过
```

---

## 🎉 完成后的效果

**用户在微信内访问 H5:**
```
┌─────────────────────┐
│   能虾助手          │
├─────────────────────┤
│                     │
│  [微信一键登录] 🟢  │
│                     │
│  或使用手机号登录   │
│  [手机号输入框]     │
│  [验证码] [发送]    │
│                     │
└─────────────────────┘
```

---

## 📞 下一步

**请提供公众号配置信息:**

```
公众号 AppID: __________
公众号 AppSecret: __________
```

**提供后我会:**
1. 更新服务器配置
2. 测试授权流程
3. 集成到前端页面
4. 完成最终测试

---

**当前状态:** ✅ 代码已完成，⏳ 等待公众号配置  
**预计完成时间:** 提供配置后 30 分钟
