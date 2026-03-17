# 🔧 网页端对话问题排查指南

## 问题现象

用户报告：网页端无法进行对话

---

## 🔍 可能原因和解决方案

### 1. 未登录状态 ⭐ 最常见

**现象:**
- 点击发送按钮无反应
- 弹出登录窗口
- 显示"点击登录"

**解决方案:**
```
1. 点击左下角"点击登录"或用户头像
2. 输入手机号
3. 点击"发送验证码"
4. 输入收到的验证码
5. 设置密码（首次注册）或直接登录
6. 登录成功后即可对话
```

**检查方法:**
```javascript
// 浏览器控制台执行
console.log(localStorage.getItem('lobster_token'));
// 如果返回 null，说明未登录
```

---

### 2. Token 过期

**现象:**
- 之前能对话，突然不能了
- 提示"认证失败"或"Token 无效"

**解决方案:**
```
1. 清除本地存储
   localStorage.removeItem('lobster_token');
2. 刷新页面
3. 重新登录
```

---

### 3. 网络问题

**现象:**
- 点击发送后无响应
- 控制台显示网络错误

**检查方法:**
```bash
# 测试 API 是否可达
curl http://8.129.98.129/health

# 测试对话 API
curl http://8.129.98.129/api/v1/chat/send \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

**解决方案:**
- 检查网络连接
- 确认服务器地址正确
- 检查防火墙设置

---

### 4. 浏览器兼容性

**支持浏览器:**
- ✅ Chrome 90+
- ✅ Safari 14+
- ✅ Firefox 88+
- ✅ Edge 90+

**不支持:**
- ❌ IE 浏览器
- ❌ 旧版本浏览器

**解决方案:**
- 升级浏览器到最新版本
- 使用推荐的浏览器

---

### 5. 浏览器缓存问题

**现象:**
- 页面显示异常
- JavaScript 错误

**解决方案:**
```
1. 清除浏览器缓存
   - Chrome: Ctrl+Shift+Delete
   - Safari: Cmd+Option+E
2. 强制刷新页面
   - Chrome: Ctrl+F5
   - Safari: Cmd+Shift+R
3. 或使用无痕模式打开
```

---

## 📊 诊断流程

### 步骤 1: 检查登录状态
```
访问：http://8.129.98.129/
查看左下角：
- 显示"点击登录" → 未登录，需要登录
- 显示用户名 → 已登录，继续下一步
```

### 步骤 2: 检查浏览器控制台
```
1. 按 F12 打开开发者工具
2. 切换到 Console 标签
3. 查看是否有红色错误
4. 如有错误，记录错误信息
```

### 步骤 3: 测试 API
```bash
# 1. 获取 Token（从浏览器控制台）
console.log(localStorage.getItem('lobster_token'));

# 2. 测试 API
curl http://8.129.98.129/api/v1/chat/send \
  -H "Authorization: Bearer [YOUR_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"message":"test"}'
```

### 步骤 4: 检查网络请求
```
1. F12 → Network 标签
2. 点击发送按钮
3. 查看是否有 /api/v1/chat/send 请求
4. 检查响应状态码
   - 200: 成功
   - 401: 未登录/Token 过期
   - 500: 服务器错误
```

---

## 🎯 常见错误代码

### 错误 401 Unauthorized
**原因:** 未登录或 Token 过期
**解决:** 重新登录

### 错误 500 Internal Server Error
**原因:** 服务器错误
**解决:** 联系管理员

### 错误 CORS
**原因:** 跨域问题
**解决:** 检查服务器 CORS 配置

### 错误 Network Error
**原因:** 网络连接失败
**解决:** 检查网络连接

---

## 📝 完整测试流程

### 1. 注册/登录
```
1. 访问 http://8.129.98.129/
2. 点击"点击登录"
3. 输入手机号：138xxxxxxx
4. 点击"发送验证码"
5. 输入验证码
6. 输入密码（注册时）
7. 点击"登录"
```

### 2. 开始对话
```
1. 登录成功后，看到欢迎界面
2. 在底部输入框输入消息
3. 点击发送按钮或按 Enter
4. 等待 AI 回复
```

### 3. 查看历史
```
1. 左侧边栏显示最近对话
2. 点击对话标题切换
3. 点击"新建对话"开始新对话
```

---

## 🔧 开发者调试

### 检查前端代码
```javascript
// 浏览器控制台执行

// 1. 检查 Token
const token = localStorage.getItem('lobster_token');
console.log('Token:', token);

// 2. 检查 API 地址
console.log('API_BASE:', 'http://8.129.98.129/api/v1');

// 3. 测试发送消息
fetch('http://8.129.98.129/api/v1/chat/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({ message: 'test' })
}).then(res => res.json()).then(console.log);
```

### 检查后端日志
```bash
# SSH 登录服务器
ssh root@8.129.98.129

# 查看 PM2 日志
pm2 logs lobster-prod --lines 50

# 查看错误
pm2 logs lobster-prod --lines 50 | grep -i error
```

---

## ✅ 验证清单

- [ ] 浏览器版本符合要求
- [ ] 已登录（左下角显示用户名）
- [ ] Token 存在（localStorage）
- [ ] 网络连接正常
- [ ] 服务器地址正确
- [ ] 无浏览器控制台错误
- [ ] API 测试成功

---

## 📞 获取帮助

### 自查步骤
1. 检查是否登录
2. 清除缓存重试
3. 更换浏览器测试
4. 查看控制台错误

### 联系支持
如以上方法都无法解决，请提供：
- 浏览器版本
- 错误截图
- 控制台错误信息
- 网络请求截图

---

**文档更新日期:** 2026-03-17  
**状态:** 🟢 已完成  
**适用版本:** Web v1.0
