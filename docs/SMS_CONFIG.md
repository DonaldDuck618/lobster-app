# 📱 阿里云短信服务配置指南

## 当前状态

**短信服务:** ❌ 未配置  
**验证码:** ✅ 开发环境显示在弹窗  
**生产环境:** ⚠️ 需要配置阿里云短信

---

## 🔧 解决方案

### 方案 1: 开发环境（当前）

**验证码显示方式:** 弹窗提示

**使用流程:**
```
1. 点击"发送验证码"
2. 弹窗显示验证码
3. 复制验证码输入
4. 完成登录/注册
```

**优点:**
- ✅ 无需配置
- ✅ 即时可用
- ✅ 方便测试

**缺点:**
- ❌ 不适合生产环境
- ❌ 安全性低

---

### 方案 2: 生产环境（推荐）

**配置阿里云短信服务**

#### 步骤 1: 开通服务

1. 访问阿里云官网：https://www.aliyun.com/
2. 搜索"短信服务"
3. 开通短信服务
4. 完成实名认证

#### 步骤 2: 创建签名

1. 进入短信控制台
2. 签名管理 → 添加签名
3. 填写签名名称（如：能虾助手）
4. 上传相关证明材料
5. 等待审核（通常 1-2 工作日）

#### 步骤 3: 创建模板

1. 模板管理 → 添加模板
2. 模板类型：验证码
3. 模板内容：
   ```
   您的验证码是${code}，5 分钟内有效，请勿泄露。
   ```
4. 等待审核

#### 步骤 4: 获取 AccessKey

1. 访问 RAM 控制台
2. 创建用户或使用现有用户
3. 获取 AccessKey ID 和 Secret

#### 步骤 5: 配置到服务器

**编辑配置文件:**
```bash
ssh root@8.129.98.129
vi /opt/lobster-app/lobster-app/cloud/.env
```

**添加配置:**
```bash
# 阿里云短信配置
ALIYUN_SMS_ACCESS_KEY_ID=你的 AccessKeyID
ALIYUN_SMS_ACCESS_KEY_SECRET=你的 AccessKeySecret
ALIYUN_SMS_SIGN_NAME=能虾助手
ALIYUN_SMS_REGISTER_TEMPLATE=SMS_280756062
ALIYUN_SMS_LOGIN_TEMPLATE=SMS_280756063
```

#### 步骤 6: 安装依赖

```bash
cd /opt/lobster-app/lobster-app/cloud
npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client
```

#### 步骤 7: 更新代码

修改 `src/services/sms.js`，启用真实短信发送。

#### 步骤 8: 重启服务

```bash
pm2 restart lobster-prod
```

---

## 💰 费用说明

### 阿里云短信价格

**国内短信:**
- 前 100 条：免费（测试）
- 1 万条：约 400 元
- 10 万条：约 3600 元

**按量付费:**
- 验证码短信：0.045 元/条
- 通知短信：0.045 元/条

**套餐包:**
- 1000 条：45 元
- 5000 条：200 元
- 10000 条：360 元

---

## 🔒 安全建议

### 1. 频率限制
```javascript
// 已实现
- 60 秒内不能重复发送
- 验证码 5 分钟有效
- 单个 IP 每日限制
```

### 2. 防刷机制
```javascript
// 建议添加
- 图形验证码
- 滑块验证
- 设备指纹
```

### 3. 密钥安全
```bash
# 已实现
- 密钥存储在.env 文件
- 文件权限 600
- 不提交到 Git
```

---

## 📊 当前配置

### 环境变量
```bash
# 查看当前配置
ssh root@8.129.98.129
cat /opt/lobster-app/lobster-app/cloud/.env | grep ALIYUN
```

### 日志查看
```bash
# 查看验证码日志
ssh root@8.129.98.129
tail -f /opt/lobster-app/lobster-app/cloud/logs/app.log | grep 验证码
```

---

## 🎯 快速测试

### 当前测试流程
```
1. 访问 http://8.129.98.129/
2. 点击右上角"登录"
3. 输入手机号：17724620007
4. 点击"发送验证码"
5. 弹窗显示验证码
6. 输入验证码和密码
7. 点击"登录"
```

### 验证码查看
```
方式 1: 弹窗显示（当前）
方式 2: 服务器日志
  ssh root@8.129.98.129
  tail -50 /opt/lobster-app/lobster-app/cloud/logs/app.log | grep 验证码
```

---

## 📞 联系支持

### 阿里云官方
- 官网：https://www.aliyun.com/
- 短信产品：https://www.aliyun.com/product/sms
- 客服电话：95187

### 内部文档
- 配置文档：`docs/SMS_CONFIG.md`
- API 文档：`cloud/docs/API.md`

---

## ✅ 配置检查清单

- [ ] 阿里云账号注册
- [ ] 实名认证完成
- [ ] 短信服务开通
- [ ] 签名创建并审核通过
- [ ] 模板创建并审核通过
- [ ] AccessKey 获取
- [ ] 服务器配置完成
- [ ] 依赖安装完成
- [ ] 代码更新完成
- [ ] 测试发送成功

---

**当前状态:** 🟡 开发环境可用（弹窗显示验证码）  
**生产环境:** ⏳ 待配置阿里云短信  
**建议:** 生产环境务必配置真实短信服务
