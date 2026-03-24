# 🦞 赚好多能虾助手 - 微信小程序

## 项目配置

**AppID:** wx30f07bfe5d52e746  
**AppSecret:** 267e48bb67686dabbf4ab1f5978ffca5

---

## 开发步骤

### 1. 下载微信开发者工具

https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html

### 2. 导入项目

1. 打开微信开发者工具
2. 选择"导入项目"
3. 项目目录：`/opt/lobster-app/lobster-app/miniprogram`
4. AppID: `wx30f07bfe5d52e746`
5. 点击"导入"

### 3. 配置服务器域名

登录微信公众平台：
1. 开发管理 → 开发设置
2. 服务器域名 → request 合法域名
3. 添加：`https://xiabot.cn`
4. 添加：`http://xiabot.cn` (开发阶段)

### 4. 修改配置

编辑 `app.js`:
```javascript
globalData: {
  apiBaseUrl: 'https://xiabot.cn'  // 生产环境用 HTTPS
}
```

### 5. 编译预览

1. 点击"编译"按钮
2. 扫码在真机上预览
3. 测试登录和对话功能

### 6. 上传发布

1. 点击右上角"上传"
2. 填写版本号和备注
3. 登录 mp.weixin.qq.com
4. 提交审核
5. 审核通过后发布

---

## 功能列表

### 已实现
- ✅ 微信登录
- ✅ AI 对话
- ✅ 历史记录
- ✅ Markdown 渲染
- ✅ 流式输出

### 待开发
- ⏳ 语音输入
- ⏳ 文件上传
- ⏳ 网络搜索
- ⏳ 会话管理

---

## API 接口

### 登录
```javascript
POST /api/v1/auth/login/wechat
{
  "code": "微信登录 code"
}
```

### 对话
```javascript
POST /api/v1/chat/send
{
  "message": "用户消息"
}
```

---

## 注意事项

1. **HTTPS 要求**: 生产环境必须使用 HTTPS
2. **域名备案**: xiabot.cn 已备案 ✅
3. **内容安全**: 需接入微信内容安全 API
4. **用户隐私**: 遵守微信小程序隐私政策

---

## 下一步

1. 配置 HTTPS 证书
2. 完善登录流程
3. 添加更多功能
4. 提交审核

---

**开发文档:** https://developers.weixin.qq.com/miniprogram/dev/framework/
