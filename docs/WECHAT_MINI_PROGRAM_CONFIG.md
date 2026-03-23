# 📱 微信小程序配置文档

## 配置信息

### 小程序基本信息
- **小程序 ID (AppID):** `wx30f07bfe5d52e746`
- **小程序名称:** 赚好多能虾助手
- **配置时间:** 2026-03-17

### 密钥配置
- **AppSecret:** `267e48bb67686dabbf4ab1f5978ffca5`
- **私钥文件:** `/opt/lobster-app/lobster-app/cloud/config/wechat_private_key.pem`
- **权限:** 600 (仅所有者可读写)

---

## 📁 文件位置

```
/opt/lobster-app/lobster-app/
└── cloud/
    └── config/
        └── wechat_private_key.pem  (600 权限)
```

---

## 🔧 环境变量配置

**文件:** `cloud/.env`

```bash
# 微信小程序配置
WECHAT_MINI_APP_ID=wx30f07bfe5d52e746
WECHAT_MINI_APP_SECRET=267e48bb67686dabbf4ab1f5978ffca5
WECHAT_PRIVATE_KEY_PATH=/opt/lobster-app/lobster-app/cloud/config/wechat_private_key.pem
```

---

## 🎯 微信登录流程

### 1. 小程序端
```javascript
// 微信小程序登录
wx.login({
  success: (res) => {
    if (res.code) {
      // 将 code 发送到后端
      fetch('http://8.129.98.129/api/v1/auth/login/wechat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: res.code })
      });
    }
  }
});
```

### 2. 后端处理
```javascript
// POST /api/v1/auth/login/wechat
{
  "code": "微信登录 code"
}

// 响应
{
  "success": true,
  "data": {
    "id": "user_id",
    "nickname": "微信用户",
    "token": "JWT Token",
    "isNewUser": true
  }
}
```

---

## 🔐 安全配置

### 密钥管理
- ✅ 私钥文件权限设置为 600
- ✅ AppSecret 存储在 .env 文件
- ✅ 不提交密钥到 Git 仓库

### Git 忽略配置
```bash
# .gitignore
cloud/config/wechat_private_key.pem
cloud/.env
```

---

## 📊 微信 API 调用

### 登录凭证校验
**接口:** `https://api.weixin.qq.com/sns/jscode2session`

**参数:**
```
appid: wx30f07bfe5d52e746
secret: 267e48bb67686dabbf4ab1f5978ffca5
js_code: [登录 code]
grant_type: authorization_code
```

**响应:**
```json
{
  "openid": "用户唯一标识",
  "session_key": "会话密钥",
  "unionid": "统一标识（如有）"
}
```

---

## 🧪 测试步骤

### 1. 开发工具测试
1. 打开微信开发者工具
2. 导入小程序项目
3. 配置 AppID: `wx30f07bfe5d52e746`
4. 编译运行

### 2. 登录测试
1. 点击小程序登录按钮
2. 获取登录 code
3. 发送到后端
4. 获取 token

### 3. 接口测试
```bash
# 测试微信登录 API
curl -X POST http://8.129.98.129/api/v1/auth/login/wechat \
  -H "Content-Type: application/json" \
  -d '{"code":"test_code"}'
```

---

## 📝 注意事项

### 1. 密钥安全
- ⚠️ 不要将密钥提交到 Git
- ⚠️ 不要在前端代码中暴露 AppSecret
- ⚠️ 定期更换密钥

### 2. 域名配置
**微信公众平台 → 开发 → 开发设置 → 服务器域名**

需要配置：
- **request 合法域名:** `https://8.129.98.129`
- **socket 合法域名:** `wss://8.129.98.129`

### 3. 版本管理
- **开发版:** 用于开发测试
- **体验版:** 用于内部测试
- **正式版:** 发布给用户

---

## 🔗 相关文档

### 官方文档
- [微信小程序登录](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/)
- [微信开放平台](https://open.weixin.qq.com/)

### 内部文档
- 后端 API 文档：`/cloud/docs/API.md`
- 小程序开发文档：`/mobile/docs/`

---

## 📞 问题排查

### 问题 1: 登录失败 401
**原因:** code 无效或过期
**解决:** code 只能使用一次，有效期 5 分钟

### 问题 2: 域名未备案
**原因:** 服务器域名未完成备案
**解决:** 完成 ICP 备案或使用已备案域名

### 问题 3: AppSecret 错误
**原因:** 密钥配置错误
**解决:** 检查 .env 文件中的 AppSecret 是否正确

---

## ✅ 配置检查清单

- [x] 小程序 ID 已配置
- [x] AppSecret 已配置
- [x] 私钥文件已上传
- [x] 文件权限已设置 (600)
- [x] 环境变量已更新
- [ ] 域名已配置（待完成）
- [ ] 小程序已发布（待完成）

---

**配置日期:** 2026-03-17  
**配置者:** 龙虾助手 AI  
**状态:** ✅ 已完成  
**小程序 ID:** wx30f07bfe5d52e746
