# 📱 微信登录使用指南

## 📅 更新时间
**日期:** 2026-03-18 16:10 GMT+8

---

## 🎯 微信登录方式

目前支持 **2 种** 微信登录方式：

### 1. 微信小程序登录 ✅ 可用

**适用场景:** 微信小程序内

**使用步骤:**

#### 第一步：打开小程序
```
1. 打开微信
2. 搜索"能虾助手"小程序
3. 点击进入小程序
```

#### 第二步：点击登录
```
1. 在小程序首页
2. 点击"微信一键登录"按钮
3. 微信会自动授权
```

#### 第三步：完成登录
```
1. 系统自动获取微信信息
2. 创建/关联账号
3. 登录成功
```

**技术实现:**
```javascript
// 小程序代码
wx.login({
  success: (res) => {
    // 获取 code
    const code = res.code;
    
    // 发送到后端
    fetch('http://8.129.98.129/api/v1/auth/login/wechat', {
      method: 'POST',
      data: { code }
    });
  }
});
```

**状态:** ✅ 后端已实现，需要在小程序中集成

---

### 2. 微信网页授权登录 ⏳ 待配置

**适用场景:** 微信内打开 H5 页面

**需要配置:**
```
公众号 AppID: (需要提供)
公众号 AppSecret: (需要提供)
网页授权域名：8.129.98.129
```

**使用流程:**
```
1. 在微信内打开 http://8.129.98.129/
2. 点击"微信登录"
3. 跳转到微信授权页面
4. 用户同意授权
5. 自动登录成功
```

**状态:** ⏳ 需要公众号配置

---

## 📱 小程序集成代码

### 小程序登录页面

**文件:** `mobile/pages/login/login.js`

```javascript
Page({
  data: {
    loading: false
  },

  // 微信一键登录
  async onWechatLogin() {
    this.setData({ loading: true });
    
    try {
      // 1. 调用微信登录
      const { code } = await wx.login();
      
      // 2. 发送到后端
      const response = await wx.request({
        url: 'http://8.129.98.129/api/v1/auth/login/wechat',
        method: 'POST',
        data: { code }
      });
      
      // 3. 处理响应
      if (response.data.success) {
        // 保存 token
        wx.setStorageSync('lobster_token', response.data.data.token);
        
        // 跳转首页
        wx.switchTab({
          url: '/pages/index/index'
        });
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: response.data.error || '登录失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
    }
  }
});
```

### 小程序登录界面

**文件:** `mobile/pages/login/login.wxml`

```xml
<view class="login-container">
  <image class="logo" src="/images/logo.png" mode="aspectFit"/>
  
  <text class="title">能虾助手</text>
  <text class="subtitle">让 AI 真正为你工作</text>
  
  <button 
    class="wechat-btn" 
    bindtap="onWechatLogin"
    disabled="{{loading}}">
    <image class="icon" src="/images/wechat.png"/>
    <text>{{loading ? '登录中...' : '微信一键登录'}}</text>
  </button>
  
  <text class="tip">登录即代表同意用户协议</text>
</view>
```

### 样式文件

**文件:** `mobile/pages/login/login.wxss`

```css
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40rpx;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

.logo {
  width: 200rpx;
  height: 200rpx;
  margin: 40rpx 0;
}

.title {
  font-size: 48rpx;
  font-weight: bold;
  color: white;
  margin: 20rpx 0;
}

.subtitle {
  font-size: 28rpx;
  color: rgba(255,255,255,0.9);
  margin-bottom: 80rpx;
}

.wechat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  color: #07c160;
  border-radius: 50rpx;
  padding: 30rpx 80rpx;
  font-size: 32rpx;
  font-weight: 500;
  box-shadow: 0 10rpx 30rpx rgba(0,0,0,0.2);
}

.wechat-btn .icon {
  width: 40rpx;
  height: 40rpx;
  margin-right: 20rpx;
}

.tip {
  font-size: 24rpx;
  color: rgba(255,255,255,0.7);
  margin-top: 40rpx;
}
```

---

## 🌐 H5 网页登录 (微信内)

### 配置步骤

**需要你提供公众号信息:**

1. **获取公众号配置**
```
登录 https://mp.weixin.qq.com/
开发 → 基本配置
复制 AppID 和 AppSecret
```

2. **配置网页授权域名**
```
设置 → 公众号设置 → 功能设置
网页授权域名：8.129.98.129
```

3. **提供给我配置**
```
公众号 AppID: __________
公众号 AppSecret: __________
```

### H5 登录代码

**前端实现:**

```javascript
// 检测微信环境
function isWechat() {
  return /micromessenger/i.test(navigator.userAgent);
}

// 获取授权 URL
async function getWechatAuthUrl() {
  const redirectUri = encodeURIComponent(window.location.href);
  const response = await fetch(
    `/api/v1/auth/login/wechat-web-url?redirect_uri=${redirectUri}`
  );
  const data = await response.json();
  return data.data.authUrl;
}

// 微信登录
async function wechatLogin() {
  if (!isWechat()) {
    alert('请在微信内打开此页面');
    return;
  }
  
  const authUrl = await getWechatAuthUrl();
  window.location.href = authUrl;
}

// 处理回调
async function handleCallback() {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  
  if (code) {
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
}

// 页面加载时检查回调
handleCallback();
```

---

## 📊 登录流程对比

| 登录方式 | 适用场景 | 状态 | 难度 |
|---------|---------|------|------|
| 小程序登录 | 微信小程序 | ✅ 可用 | ⭐ 简单 |
| H5 网页登录 | 微信内 H5 | ⏳ 待配置 | ⭐⭐ 中等 |
| 手机号登录 | 所有场景 | ⏳ 待短信配置 | ⭐⭐ 中等 |
| 邮箱登录 | 所有场景 | ✅ 可用 | ⭐ 简单 |

---

## 🎯 立即使用

### 方式 1: 小程序登录 (推荐)

**步骤:**
```
1. 打开微信
2. 搜索"能虾助手"小程序
3. 点击"微信一键登录"
4. 完成登录
```

**状态:** ✅ 后端已就绪，需要在小程序中集成

### 方式 2: 邮箱登录 (当前可用)

**步骤:**
```
1. 访问 http://8.129.98.129/
2. 点击"点击登录"
3. 切换到"邮箱登录"
4. 输入邮箱和密码
5. 完成登录
```

**状态:** ✅ 完全可用

---

## 📝 小程序集成清单

### 需要完成的开发

- [ ] 创建小程序登录页面
- [ ] 集成微信登录 API
- [ ] 添加 token 存储
- [ ] 跳转逻辑
- [ ] 错误处理
- [ ] UI 美化

### 后端已就绪

- [x] 微信登录 API (`/api/v1/auth/login/wechat`)
- [x] 小程序配置 (AppID/AppSecret)
- [x] 用户创建/关联
- [x] Token 生成
- [x] 错误处理

---

## 🔧 后端 API 详情

### 微信小程序登录

**接口:** `POST /api/v1/auth/login/wechat`

**请求:**
```json
{
  "code": "微信登录 code"
}
```

**响应:**
```json
{
  "success": true,
  "data": {
    "id": "user_id",
    "nickname": "微信用户 xxx",
    "avatar": null,
    "phone": null,
    "email": null,
    "wechatOpenid": "openid_xxx",
    "token": "JWT Token",
    "isNewUser": true
  }
}
```

---

## 📞 需要帮助？

### 小程序开发问题
- 参考微信小程序官方文档
- 查看 mobile/ 目录代码

### 后端 API 问题
- 查看日志：`ssh root@8.129.98.129 && tail -f /tmp/openclaw.log`
- 检查配置：`grep WECHAT /opt/lobster-app/lobster-app/cloud/.env`

---

## 🎉 总结

**微信登录方式:**
1. ✅ 小程序登录 - 后端已就绪，待小程序集成
2. ⏳ H5 网页登录 - 需要公众号配置

**立即可用:**
- ✅ 邮箱登录
- ⏳ 小程序登录 (需开发)
- ⏳ H5 网页登录 (需配置)

**请提供:**
- 公众号 AppID 和 AppSecret (用于 H5 登录)

**小程序开发完成后即可使用微信登录！** 🦞📱✨
