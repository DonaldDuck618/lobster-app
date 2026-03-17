# 📱 阿里云短信服务集成指南

## 📋 当前状态

| 项目 | 状态 | 说明 |
|------|------|------|
| 短信服务 | ⚠️ 模拟模式 | 验证码在日志中显示 |
| 阿里云账号 | ❓ 待确认 | 需要开通短信服务 |
| AccessKey | ❓ 待配置 | 需要创建 |
| 短信签名 | ❓ 待创建 | 需要审核 |
| 短信模板 | ❓ 待创建 | 需要审核 |
| SDK | ❌ 未安装 | 需要安装 |

---

## 🎯 配置步骤总览

### 需要完成的配置（按顺序）

1. **开通阿里云短信服务** (5 分钟)
2. **创建 AccessKey** (2 分钟)
3. **创建短信签名** (1-2 工作日审核)
4. **创建短信模板** (1-2 工作日审核)
5. **服务器配置** (5 分钟)
6. **安装 SDK** (2 分钟)
7. **测试验证** (5 分钟)

**总预计时间:** 1-2 工作日（主要等待审核）

---

## 📝 详细配置步骤

### 步骤 1: 开通阿里云短信服务

**访问:** https://www.aliyun.com/product/sms

**步骤:**
```
1. 登录阿里云账号
2. 搜索"短信服务"
3. 点击"立即开通"
4. 完成实名认证（如未完成）
5. 同意服务协议
```

**费用:**
- 新用户免费 100 条测试
- 验证码短信：0.045 元/条
- 套餐包：1000 条 45 元起

---

### 步骤 2: 创建 AccessKey

**访问:** https://ram.console.aliyun.com/manage/ak

**步骤:**
```
1. 进入 RAM 访问控制
2. 点击"创建用户"
3. 输入用户名（如：lobster-sms）
4. 勾选"编程访问"
5. 点击"确定"
6. 复制 AccessKey ID 和 Secret（重要！只显示一次）
```

**权限配置:**
```
需要授予权限：
- AliyunDysmsFullAccess（短信服务完全权限）
```

**安全建议:**
- ✅ 使用子账号 AccessKey
- ✅ 只授予必要权限
- ✅ 定期更换密钥
- ❌ 不要提交到 Git

---

### 步骤 3: 创建短信签名

**访问:** https://dysms.console.aliyun.com/sign

**步骤:**
```
1. 进入短信控制台
2. 左侧菜单：签名管理
3. 点击"添加签名"
4. 填写信息：
   - 签名名称：能虾助手
   - 签名类型：其他
   - 适用场景：验证码
   - 证明材料：上传营业执照或网站备案
5. 提交审核
```

**审核时间:** 1-2 工作日

**签名名称要求:**
- ✅ 能虾助手
- ✅ 龙虾助手
- ✅ 公司名称
- ❌ 不能包含特殊符号
- ❌ 不能太宽泛（如"科技"）

---

### 步骤 4: 创建短信模板

**访问:** https://dysms.console.aliyun.com/template

**步骤:**
```
1. 进入短信控制台
2. 左侧菜单：模板管理
3. 点击"添加模板"
4. 填写信息：
   - 模板名称：验证码通知
   - 模板类型：验证码
   - 模板内容：您的验证码是${code}，${minutes}分钟内有效，请勿泄露。
   - 变量说明：
     * code：验证码
     * minutes：有效期
5. 选择签名：能虾助手
6. 提交审核
```

**审核时间:** 1-2 工作日

**模板内容示例:**
```
✅ 推荐：您的验证码是${code}，5 分钟内有效，请勿泄露。
✅ 推荐：【能虾助手】您的验证码是${code}，有效期${minutes}分钟。
❌ 禁止：包含营销内容
❌ 禁止：包含链接
```

---

### 步骤 5: 服务器配置

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
# 阿里云短信服务配置
ALIYUN_SMS_ACCESS_KEY_ID=你的 AccessKeyID
ALIYUN_SMS_ACCESS_KEY_SECRET=你的 AccessKeySecret
ALIYUN_SMS_SIGN_NAME=能虾助手
ALIYUN_SMS_REGISTER_TEMPLATE=SMS_你的模板 ID
ALIYUN_SMS_LOGIN_TEMPLATE=SMS_你的模板 ID
ALIYUN_SMS_ENDPOINT=dysmsapi.aliyuncs.com
```

**保存退出:**
```
按 Esc，输入 :wq，按 Enter
```

---

### 步骤 6: 安装 SDK

**进入项目目录:**
```bash
cd /opt/lobster-app/lobster-app/cloud
```

**安装阿里云短信 SDK:**
```bash
npm install @alicloud/dysmsapi20170525 @alicloud/openapi-client
```

**验证安装:**
```bash
npm list | grep aliyun
```

---

### 步骤 7: 更新代码

**编辑短信服务:**
```bash
vi /opt/lobster-app/lobster-app/cloud/src/services/sms.js
```

**替换为真实短信发送代码**（见下方代码示例）

**重启服务:**
```bash
pm2 restart lobster-prod
```

---

## 💻 代码示例

### 更新后的 sms.js

```javascript
/**
 * 短信服务 - 阿里云短信
 */

const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
const OpenApi = require('@alicloud/openapi-client');
const config = require('../config');
const logger = require('../utils/logger');

// 验证码存储（生产环境用 Redis）
const verificationCodes = new Map();

// 短信客户端
let smsClient = null;

/**
 * 初始化短信客户端
 */
function initSmsClient() {
  if (!config.aliyun.sms.accessKeyId || !config.aliyun.sms.accessKeySecret) {
    logger.warn('阿里云短信配置缺失');
    return null;
  }

  const conf = new OpenApi.Config({
    accessKeyId: config.aliyun.sms.accessKeyId,
    accessKeySecret: config.aliyun.sms.accessKeySecret,
    endpoint: config.aliyun.sms.endpoint || 'dysmsapi.aliyuncs.com'
  });

  smsClient = new Dysmsapi20170525.default(conf);
  logger.info('阿里云短信客户端初始化成功');
  return smsClient;
}

class SMSService {
  /**
   * 发送验证码
   */
  static async sendVerificationCode(phone, type = 'register') {
    // 验证格式
    if (!this.validatePhoneFormat(phone)) {
      throw Object.assign(new Error('手机号格式不正确'), { status: 400 });
    }

    // 检查频率
    const key = `sms:${phone}:${type}`;
    const lastSent = verificationCodes.get(key);
    if (lastSent && Date.now() - lastSent < 60000) {
      throw Object.assign(new Error('发送过于频繁，请 1 分钟后再试'), { status: 429 });
    }

    // 生成验证码
    const code = Math.random().toString().slice(-6);
    const expiresAt = Date.now() + 5 * 60 * 1000;
    
    verificationCodes.set(key, { code, expiresAt, sentAt: Date.now() });

    // 发送短信
    await this.sendSms(phone, type, code);

    logger.info('验证码已发送', { phone, type });
    return { success: true, message: '验证码已发送', expires: 300 };
  }

  /**
   * 发送短信
   */
  static async sendSms(phone, type, code) {
    if (!smsClient) initSmsClient();

    const templateCode = type === 'register' 
      ? config.aliyun.sms.registerTemplate 
      : config.aliyun.sms.loginTemplate;

    const signName = config.aliyun.sms.signName || '能虾助手';

    const sendSmsRequest = new Dysmsapi20170525.SendSmsRequest({
      phoneNumbers: phone,
      signName: signName,
      templateCode: templateCode,
      templateParam: JSON.stringify({ code: code, minutes: 5 })
    });

    try {
      const response = await smsClient.sendSms(sendSmsRequest);
      logger.info('短信发送成功', { phone, code, requestId: response.body.requestId });
      return response;
    } catch (error) {
      logger.error('短信发送失败', { phone, error: error.message });
      throw Object.assign(new Error('短信发送失败：' + error.message), { status: 500 });
    }
  }

  /**
   * 验证验证码
   */
  static async verifyCode(phone, code, type) {
    const key = `sms:${phone}:${type}`;
    const record = verificationCodes.get(key);

    if (!record) {
      throw Object.assign(new Error('验证码不存在或已过期'), { status: 400 });
    }

    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(key);
      throw Object.assign(new Error('验证码已过期'), { status: 400 });
    }

    if (record.code !== code) {
      throw Object.assign(new Error('验证码错误'), { status: 400 });
    }

    verificationCodes.delete(key);
    return true;
  }

  /**
   * 验证手机号格式
   */
  static validatePhoneFormat(phone) {
    return /^1[3-9]\d{9}$/.test(phone);
  }
}

module.exports = SMSService;
```

---

### 更新 config.js

```javascript
// 添加阿里云短信配置
module.exports = {
  // ... 其他配置
  aliyun: {
    // ... 其他阿里云配置
    sms: {
      accessKeyId: process.env.ALIYUN_SMS_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_SMS_ACCESS_KEY_SECRET,
      signName: process.env.ALIYUN_SMS_SIGN_NAME || '能虾助手',
      registerTemplate: process.env.ALIYUN_SMS_REGISTER_TEMPLATE,
      loginTemplate: process.env.ALIYUN_SMS_LOGIN_TEMPLATE,
      endpoint: process.env.ALIYUN_SMS_ENDPOINT || 'dysmsapi.aliyuncs.com'
    }
  }
};
```

---

## 🧪 测试验证

### 测试发送

```bash
# 登录服务器
ssh root@8.129.98.129

# 测试 API
curl -X POST http://8.129.98.129/api/v1/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{"phone":"17724620007","type":"login"}'

# 查看日志
tail -f /opt/lobster-app/lobster-app/cloud/logs/app.log | grep 短信
```

### 预期响应

**成功:**
```json
{
  "success": true,
  "message": "验证码已发送",
  "expires": 300
}
```

**失败:**
```json
{
  "error": "手机号格式不正确"
}
```

---

## 💰 费用说明

### 短信价格

**国内短信:**
- 验证码：0.045 元/条
- 通知短信：0.045 元/条
- 推广短信：0.08 元/条

**套餐包:**
- 1000 条：45 元
- 5000 条：200 元
- 10000 条：360 元
- 100000 条：3200 元

**免费额度:**
- 新用户：100 条免费
- 有效期：30 天

### 使用估算

**能虾助手场景:**
- 用户注册：1 条/用户
- 用户登录：1 条/次（可选）
- 找回密码：1 条/次

**月度成本估算:**
- 100 用户：约 5-10 元
- 1000 用户：约 50-100 元
- 10000 用户：约 500-1000 元

---

## ⚠️ 注意事项

### 1. 审核要求

**签名审核:**
- ✅ 公司全称（需营业执照）
- ✅ 网站/APP 名称（需备案）
- ✅ 商标名称（需商标证）
- ❌ 不能使用通用词

**模板审核:**
- ✅ 内容简洁明确
- ✅ 变量使用规范
- ❌ 不能包含营销内容
- ❌ 不能包含链接

### 2. 发送限制

**频率限制:**
- 同一手机号：1 条/分钟
- 同一手机号：5 条/小时
- 同一手机号：10 条/天

**总量限制:**
- 根据账户等级不同
- 新用户默认较低
- 可申请提升

### 3. 安全建议

**密钥管理:**
- ✅ 使用环境变量
- ✅ 文件权限 600
- ✅ 不提交到 Git
- ✅ 定期更换

**防刷机制:**
- ✅ IP 频率限制
- ✅ 图形验证码
- ✅ 设备指纹
- ✅ 黑名单机制

---

## 📞 需要提供的信息

### 请提供以下信息以便我帮你配置：

**1. 阿里云账号信息**
```
[ ] 是否已有阿里云账号？
[ ] 是否已完成实名认证？
[ ] 账号类型：个人 / 企业
```

**2. 短信服务信息**
```
[ ] 是否已开通短信服务？
[ ] AccessKey ID: __________
[ ] AccessKey Secret: __________
[ ] 短信签名：__________
[ ] 模板 ID（注册）：__________
[ ] 模板 ID（登录）：__________
```

**3. 配置偏好**
```
[ ] 登录是否强制验证码？
[ ] 注册是否强制验证码？
[ ] 验证码有效期：5 分钟
[ ] 发送频率限制：60 秒
```

---

## 🎯 我可以帮你做什么

### 已完成 ✅
- [x] 短信服务代码框架
- [x] 验证码生成和验证逻辑
- [x] 频率限制实现
- [x] API 接口集成

### 需要你完成 ⏳
- [ ] 开通阿里云短信服务
- [ ] 创建 AccessKey
- [ ] 创建短信签名
- [ ] 创建短信模板
- [ ] 提供配置信息

### 我可以继续帮你 ✅
- [ ] 安装 SDK
- [ ] 更新配置文件
- [ ] 更新代码
- [ ] 重启服务
- [ ] 测试验证

---

## 📝 快速配置清单

**请按顺序完成:**

- [ ] 1. 访问 https://www.aliyun.com/product/sms
- [ ] 2. 开通短信服务
- [ ] 3. 创建 AccessKey（https://ram.console.aliyun.com）
- [ ] 4. 创建短信签名（等待审核）
- [ ] 5. 创建短信模板（等待审核）
- [ ] 6. 提供 AccessKey 和模板 ID 给我
- [ ] 7. 我来完成服务器配置
- [ ] 8. 测试验证

---

**请告诉我:**
1. 你是否已有阿里云账号？
2. 是否需要我指导开通短信服务？
3. 或者你希望我先完成其他功能？

我会根据你的回复提供相应的帮助！🦞📱✨
