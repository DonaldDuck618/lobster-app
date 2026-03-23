# 🦞 赚好多能虾助手 - 用户认证指南

## 📱 支持的登录方式

| 方式 | 适用场景 | 优先级 | 状态 |
|------|----------|--------|------|
| **手机号 + 验证码** | 中国大陆用户 | P0 | ✅ |
| **微信小程序授权** | 小程序端 | P0 | ✅ |
| **邮箱 + 密码** | 国际用户/备用 | P1 | ✅ |
| **账号密码登录** | 老用户回访 | P1 | ✅ |

---

## 🔐 手机号认证

### 1. 发送验证码

```bash
POST /api/v1/auth/send-code
Content-Type: application/json

{
  "phone": "13800138000",
  "type": "register" // 或 "login"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "message": "验证码已发送",
    "expires": 300
  }
}
```

**限制：**
- ✅ 同一手机号 1 分钟内只能发送 1 次
- ✅ 验证码 5 分钟有效
- ✅ 每日最多发送 10 次

---

### 2. 手机号注册

```bash
POST /api/v1/auth/register/phone
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456",
  "nickname": "龙虾用户",
  "avatar": "https://example.com/avatar.jpg"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid_xxx",
      "phone": "138****8000",
      "nickname": "龙虾用户",
      "avatar": "https://..."
    },
    "token": "eyJhbGc..."
  }
}
```

---

### 3. 手机号登录

```bash
POST /api/v1/auth/login/phone
Content-Type: application/json

{
  "phone": "13800138000",
  "code": "123456"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid_xxx",
      "phone": "138****8000",
      "nickname": "龙虾用户"
    },
    "token": "eyJhbGc..."
  }
}
```

**特性：**
- ✅ 未注册手机号自动注册
- ✅ 登录即验证手机号
- ✅ 返回 JWT Token

---

## 💬 微信小程序登录

### 1. 小程序端获取 code

```javascript
// 小程序代码
wx.login({
  success: (res) => {
    if (res.code) {
      // 发送 code 到后端
      callBackend('/api/v1/auth/wechat', {
        code: res.code
      });
    }
  }
});
```

### 2. 后端调用微信 API

```bash
POST /api/v1/auth/wechat
Content-Type: application/json

{
  "code": "071xxx",
  "encryptedData": "...", // 可选，获取用户信息
  "iv": "..." // 可选
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid_xxx",
      "nickname": "微信用户",
      "avatar": null
    },
    "token": "eyJhbGc...",
    "isNewUser": true
  }
}
```

**流程说明：**
1. 小程序调用 `wx.login()` 获取 code
2. 后端用 code 换取 openid
3. 根据 openid 查找或创建用户
4. 返回 JWT Token
5. 小程序保存 Token 用于后续请求

---

## 📧 邮箱认证

### 1. 邮箱注册

```bash
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456",
  "nickname": "龙虾用户"
}
```

**响应：**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid_xxx",
      "email": "user@example.com",
      "nickname": "龙虾用户"
    },
    "token": "eyJhbGc..."
  }
}
```

### 2. 邮箱登录

```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "123456"
}
```

---

## 🔑 Token 使用

### 1. Token 格式

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
{
  "userId": "uuid_xxx",
  "email": "user@example.com",
  "iat": 1710234567,
  "exp": 1710839367
}.
signature
```

### 2. Token 有效期

| Token 类型 | 有效期 | 用途 |
|-----------|--------|------|
| **Access Token** | 7 天 | API 请求认证 |
| **Refresh Token** | 30 天 | 刷新 Access Token |

### 3. 使用方式

```bash
# 在 Header 中携带
Authorization: Bearer eyJhbGc...

# 示例
curl -X GET http://localhost:3000/api/v1/user/profile \
  -H "Authorization: Bearer eyJhbGc..."
```

### 4. Token 刷新

```bash
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}
```

---

## 🛡️ 安全机制

### 1. 密码加密

```javascript
// 使用 bcrypt 加密
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);
```

### 2. 验证码安全

| 措施 | 说明 |
|------|------|
| **格式验证** | 11 位中国大陆手机号 |
| **频率限制** | 1 分钟 1 次 |
| **有效期** | 5 分钟 |
| **每日限额** | 10 次/天 |
| **一次性** | 验证后立即失效 |

### 3. Token 安全

| 措施 | 说明 |
|------|------|
| **JWT 签名** | HS256 算法 |
| **过期时间** | 7 天/30 天 |
| **黑名单机制** | 支持 Token 吊销 |
| **IP 绑定** | 可选 |

### 4. 防刷机制

```javascript
// 同一 IP 每分钟最多 20 次请求
rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20
});
```

---

## 📊 数据库设计

### users 表结构

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  phone VARCHAR(20) UNIQUE,          -- 手机号
  email VARCHAR(255) UNIQUE,         -- 邮箱
  password_hash VARCHAR(255),        -- 密码哈希
  nickname VARCHAR(100),             -- 昵称
  avatar_url VARCHAR(500),           -- 头像
  wechat_openid VARCHAR(100),        -- 微信 openid
  wechat_unionid VARCHAR(100),       -- 微信 unionid
  wechat_session_key VARCHAR(255),   -- 微信 session_key
  phone_verified BOOLEAN DEFAULT FALSE,  -- 手机是否验证
  email_verified BOOLEAN DEFAULT FALSE,  -- 邮箱是否验证
  last_login_at TIMESTAMP,           -- 最后登录时间
  last_login_ip VARCHAR(50),         -- 最后登录 IP
  status VARCHAR(20) DEFAULT 'active',   -- 状态
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_phone_or_email CHECK (
    phone IS NOT NULL OR email IS NOT NULL
  )
);
```

---

## 🎯 最佳实践

### 1. 小程序端

```javascript
// 登录流程
async function login() {
  // 1. 获取微信 code
  const { code } = await wx.login();
  
  // 2. 发送到后端
  const res = await request('/api/v1/auth/wechat', {
    method: 'POST',
    data: { code }
  });
  
  // 3. 保存 Token
  wx.setStorageSync('token', res.data.token);
  wx.setStorageSync('userInfo', res.data.user);
  
  return res.data;
}

// 后续请求携带 Token
function request(url, options = {}) {
  const token = wx.getStorageSync('token');
  
  return wx.request({
    url,
    header: {
      'Authorization': `Bearer ${token}`
    },
    ...options
  });
}
```

### 2. 移动端 (uniapp)

```javascript
// 手机号登录
async function loginByPhone(phone, code) {
  const res = await uni.request({
    url: '/api/v1/auth/login/phone',
    method: 'POST',
    data: { phone, code }
  });
  
  // 保存 Token
  uni.setStorageSync('token', res.data.token);
  
  return res.data;
}

// 检查登录状态
function checkLogin() {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.navigateTo({ url: '/pages/login/login' });
    return false;
  }
  return true;
}
```

---

## ⚠️ 注意事项

### 1. 微信小程序要求

- ✅ 必须企业认证才能使用登录功能
- ✅ 需要在微信后台配置服务器域名
- ✅ 用户隐私协议必须完善
- ❌ 个人主体无法获取用户信息 (昵称、头像)

### 2. 手机号合规

- ✅ 必须明确告知用户用途
- ✅ 需要用户同意隐私政策
- ✅ 支持注销账号
- ❌ 不得强制收集手机号

### 3. Token 安全

- ✅ HTTPS 传输
- ✅ 本地加密存储
- ✅ 定期刷新
- ❌ 不要明文存储

---

## 📞 常见问题

### Q1: 验证码收不到怎么办？

**检查：**
1. 手机号格式是否正确
2. 是否超过发送频率限制
3. 手机是否欠费/信号不好
4. 是否被拦截软件拦截

**解决：**
- 等待 1 分钟后重试
- 检查手机短信拦截设置
- 联系客服手动发送

### Q2: 微信登录失败？

**检查：**
1. 小程序是否企业认证
2. 是否配置了服务器域名
3. code 是否过期 (5 分钟)
4. 微信后台配置是否正确

### Q3: Token 失效了怎么办？

**处理：**
1. 捕获 401 错误
2. 调用刷新接口
3. 刷新失败则重新登录
4. 跳转到登录页

---

🦞 赚好多能虾助手出品 | 让 AI 真正为你工作！

*最后更新：2026-03-12*
