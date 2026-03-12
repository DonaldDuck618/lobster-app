# 🦞 龙虾 Agent - 微信小程序开发指南

## 📋 准备工作

### 1. 注册微信小程序账号

**步骤：**
1. 访问 https://mp.weixin.qq.com
2. 点击"立即注册"
3. 选择"小程序"
4. 填写信息（邮箱、密码等）
5. 邮箱激活
6. 信息登记（主体类型选择"企业"或"个人"）
7. 完成验证

**费用：**
- 个人主体：免费
- 企业主体：300 元/年（认证费）

### 2. 获取 AppID

1. 登录小程序后台
2. 进入 **开发** -> **开发管理** -> **开发设置**
3. 找到 **AppID(小程序 ID)**
4. 复制 AppID（格式：`wx____________`）

### 3. 配置开发信息

打开 `manifest.json`，找到 `mp-weixin` 配置：

```json
"mp-weixin": {
  "appid": "wx____________",  // 填入你的 AppID
  ...
}
```

---

## 🚀 开发流程

### 方式一：使用 HBuilderX（推荐）

**步骤：**

1. **下载 HBuilderX**
   - 访问 https://www.dcloud.io/hbuilderx.html
   - 下载并安装

2. **导入项目**
   - 打开 HBuilderX
   - 文件 -> 导入 -> 从本地目录导入
   - 选择 `lobster-app/mobile` 目录

3. **运行到小程序模拟器**
   - 点击工具栏 **运行** -> **运行到小程序模拟器** -> **微信开发者工具**
   - 首次运行会提示安装微信开发者工具

4. **预览和调试**
   - 自动打开微信开发者工具
   - 可以在模拟器中预览
   - 支持实时调试

### 方式二：使用微信开发者工具

**步骤：**

1. **下载微信开发者工具**
   - 访问 https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
   - 下载并安装

2. **导入项目**
   - 打开微信开发者工具
   - 导入项目
   - 项目目录：`lobster-app/mobile/dist/dev/mp-weixin`
   - AppID：填入你的 AppID
   - 开发模式：选择"小程序"
   - 后端服务：选择不使用云服务

3. **编译运行**
   - 点击"编译"
   - 在模拟器中预览

---

## 📤 上传发布

### 1. 开发版上传

**使用 HBuilderX：**

1. 菜单：**发行** -> **小程序-微信**
2. 等待编译完成
3. 生成目录：`dist/build/mp-weixin`

**使用命令行：**

```bash
npm run build:mp-weixin
```

### 2. 上传到微信后台

**步骤：**

1. 打开微信开发者工具
2. 导入项目（`dist/build/mp-weixin` 目录）
3. 点击右上角 **上传**
4. 填写版本号和备注
5. 上传成功

### 3. 提交审核

**微信后台操作：**

1. 登录 https://mp.weixin.qq.com
2. 进入 **版本管理**
3. 找到刚上传的开发版
4. 点击 **提交审核**

**审核材料：**

- 小程序功能截图
- 功能介绍
- 测试账号（如需要登录）
- 隐私政策链接
- 用户协议链接

**审核时间：**
- 通常 1-7 个工作日
- 加急可当天审核

### 4. 发布上线

1. 审核通过后，在版本管理中找到审核版
2. 点击 **发布**
3. 用户即可搜索到你的小程序

---

## ⚠️ 注意事项

### 1. 小程序审核规范

**常见拒绝原因：**
- ❌ 功能不完整（有空白页、无法使用的功能）
- ❌ 诱导分享、关注
- ❌ 违规内容（色情、暴力、政治敏感）
- ❌ 未标明虚拟支付
- ❌ 隐私政策不完善

**建议：**
- ✅ 确保核心功能完整可用
- ✅ 完善隐私政策和用户协议
- ✅ 添加客服入口
- ✅ 添加关于我们页面

### 2. 小程序限制

| 限制项 | 说明 |
|--------|------|
| **包大小** | 主包 ≤ 2MB，总包 ≤ 20MB |
| **启动时间** | 冷启动 ≤ 3 秒 |
| **API 调用** | 部分 API 需要用户授权 |
| **域名限制** | 必须使用备案域名，HTTPS |
| **虚拟支付** | iOS 端禁止虚拟物品支付 |

### 3. 域名配置

**步骤：**

1. 登录小程序后台
2. 开发 -> 开发管理 -> 开发设置
3. 服务器域名
4. 配置以下域名：
   - request 合法域名（API 接口）
   - socket 合法域名（WebSocket）
   - uploadFile 合法域名（文件上传）
   - downloadFile 合法域名（文件下载）

**要求：**
- 必须使用 HTTPS
- 域名必须 ICP 备案
- 每月最多修改 5 次

---

## 🔧 常用 API

### 1. 登录

```javascript
// 微信登录
uni.login({
  provider: 'weixin',
  success: function(loginRes) {
    // 获取 code
    const code = loginRes.code
    
    // 发送到后端，换取 session
    uni.request({
      url: 'https://api.lobster-app.com/v1/login/weixin',
      method: 'POST',
      data: { code }
    })
  }
})
```

### 2. 用户信息

```javascript
// 获取用户信息
uni.getUserProfile({
  desc: '用于完善用户资料',
  success: function(profile) {
    console.log(profile.userInfo)
  }
})
```

### 3. 文件上传

```javascript
// 选择文件
uni.chooseMessage({
  type: 'file',
  success: function(res) {
    const tempFilePath = res.tempFiles[0].path
    
    // 上传文件
    uni.uploadFile({
      url: 'https://api.lobster-app.com/v1/files/upload',
      filePath: tempFilePath,
      name: 'file',
      success: function(uploadRes) {
        console.log(uploadRes.data)
      }
    })
  }
})
```

### 4. 订阅消息

```javascript
// 请求订阅消息
uni.requestSubscribeMessage({
  tmplIds: ['template_id_1', 'template_id_2'],
  success: function(res) {
    console.log(res)
  }
})
```

---

## 📊 小程序数据运营

### 1. 数据指标

登录小程序后台可查看：
- 访问数据（UV、PV）
- 访问路径
- 用户画像
- 性能数据
- 错误分析

### 2. 优化建议

**提升留存：**
- 优化首次体验
- 添加签到功能
- 推送有价值通知

**提升转化：**
- 优化付费流程
- 添加优惠券
- 限时促销活动

---

## 🐛 常见问题

### Q1: 小程序无法调用 API？

**检查：**
1. 域名是否已配置
2. 是否使用 HTTPS
3. 域名是否已备案
4. 是否在小程序后台配置

### Q2: 包大小超限？

**解决方案：**
1. 启用分包加载
2. 压缩图片资源
3. 移除无用代码
4. 使用 CDN 加载大文件

### Q3: 审核被拒？

**常见原因：**
1. 功能不完整 → 完善核心功能
2. 类目不符 → 选择正确类目
3. 隐私问题 → 完善隐私政策
4. 虚拟支付 → 移除 iOS 支付

---

## 📞 技术支持

- **uniapp 文档**: https://uniapp.dcloud.net.cn
- **微信小程序文档**: https://developers.weixin.qq.com/miniprogram/dev/framework/
- **项目仓库**: https://github.com/DonaldDuck618/lobster-app

---

🦞 龙虾汤出品 | 让 AI 真正为你工作！
