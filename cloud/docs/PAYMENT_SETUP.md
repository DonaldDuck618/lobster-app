# 🦞 龙虾 Agent - 支付接入完整指南

**版本**: v1.0  
**更新日期**: 2026-03-12  

---

## 💳 支付方式对比

| 方式 | 费率 | 需要资质 | 接入时间 | 推荐场景 |
|------|------|----------|----------|----------|
| **微信支付（官方）** | 0.6% | 营业执照 | 3-7 天 | ✅ 正式上线 |
| **支付宝（官方）** | 0.6% | 营业执照 | 3-7 天 | ✅ 正式上线 |
| **个人收款码** | 0% | 无 | 立即 | ⚠️ 初期测试 |
| **第三方聚合** | 1-3% | 无 | 1 天 | ⚠️ 快速上线 |

---

## 🎯 推荐方案

### 阶段 1: 开发测试期（现在）

**使用个人收款码**

```
优势:
✅ 无需营业执照
✅ 立即可以使用
✅ 零费率

劣势:
❌ 需要手动确认
❌ 无法自动续费
❌ 不适合规模化
```

**操作流程：**
```
1. 生成微信/支付宝收款码
2. 用户上传截图
3. 管理员审核
4. 手动开通会员
```

---

### 阶段 2: 正式上线期（1000+ 用户）

**使用官方支付**

```
优势:
✅ 自动处理
✅ 用户体验好
✅ 支持自动续费
✅ 费率低（0.6%）

劣势:
❌ 需要营业执照
❌ 审核时间长
❌ 需要对公账户
```

---

## 📋 方案 A：个人收款码（立即使用）

### 1. 准备工作

**生成收款码：**

**微信：**
```
1. 打开微信 → 收付款
2. 点击"二维码收款"
3. 点击"收款小账本"
4. 设置收款金额（可选）
5. 保存图片到电脑
```

**支付宝：**
```
1. 打开支付宝 → 收付款
2. 点击"二维码收款"
3. 点击"收钱"
4. 设置收款金额（可选）
5. 保存图片到电脑
```

### 2. 前端实现

```vue
<template>
  <view class="pay-page">
    <view class="pay-amount">
      <text class="amount">¥{{amount}}</text>
      <text class="plan">{{planName}}</text>
    </view>
    
    <view class="qr-section">
      <view class="qr-item">
        <text>微信支付</text>
        <image :src="wechatQR" class="qr-code" />
        <button @tap="confirmPay('wechat')">我已支付</button>
      </view>
      
      <view class="qr-item">
        <text>支付宝支付</text>
        <image :src="alipayQR" class="qr-code" />
        <button @tap="confirmPay('alipay')">我已支付</button>
      </view>
    </view>
    
    <view class="tips">
      <text>温馨提示：</text>
      <text>1. 请扫描二维码支付</text>
      <text>2. 支付后点击"我已支付"</text>
      <text>3. 管理员审核后开通会员</text>
      <text>4. 审核时间：1-24 小时</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      amount: 19,
      planName: '标准版会员',
      wechatQR: '/static/pay/wechat-qr.jpg',
      alipayQR: '/static/pay/alipay-qr.jpg'
    }
  },
  
  methods: {
    async confirmPay(method) {
      // 上传支付截图（可选）
      const screenshot = await this.chooseScreenshot()
      
      // 调用后端 API
      await uni.request({
        url: '/api/v1/payment/confirm',
        method: 'POST',
        data: {
          orderId: this.orderId,
          paymentMethod: method,
          screenshot: screenshot
        }
      })
      
      uni.showToast({
        title: '已提交，等待审核',
        icon: 'success'
      })
    }
  }
}
</script>
```

### 3. 后端实现

```javascript
// POST /api/v1/payment/confirm
router.post('/confirm', authMiddleware, async (req, res) => {
  const { orderId, paymentMethod, screenshot } = req.body
  const userId = req.user.id
  
  // 1. 验证订单
  const order = await OrderModel.findById(orderId)
  if (!order || order.userId !== userId) {
    return res.status(404).json({ error: '订单不存在' })
  }
  
  // 2. 更新订单状态
  order.status = 'pending_verify'
  order.paymentMethod = paymentMethod
  order.screenshot = screenshot
  order.confirmedAt = new Date()
  await order.save()
  
  // 3. 通知管理员审核
  await notifyAdmin(order)
  
  // 4. 返回结果
  res.json({
    success: true,
    message: '已提交支付凭证，等待审核（1-24 小时）'
  })
})

// 管理员审核接口
router.post('/verify', adminMiddleware, async (req, res) => {
  const { orderId, approved, reason } = req.body
  
  const order = await OrderModel.findById(orderId)
  
  if (approved) {
    // 审核通过
    order.status = 'paid'
    order.paidAt = new Date()
    
    // 激活会员
    await activateSubscription(order.userId, order.planId)
    
    // 通知用户
    await notifyUser(order, 'approved')
  } else {
    // 审核拒绝
    order.status = 'failed'
    order.failReason = reason
    
    // 通知用户
    await notifyUser(order, 'rejected')
  }
  
  await order.save()
  
  res.json({ success: true })
})
```

### 4. 管理员审核后台

**简单的审核页面：**

```vue
<template>
  <view class="admin-panel">
    <view class="order-list">
      <view 
        v-for="order in pendingOrders" 
        :key="order.id"
        class="order-item"
      >
        <view class="order-info">
          <text>订单：{{order.orderId}}</text>
          <text>金额：¥{{order.amount}}</text>
          <text>支付方式：{{order.paymentMethod}}</text>
          <text>时间：{{order.confirmedAt}}</text>
        </view>
        
        <view class="order-screenshot">
          <image :src="order.screenshot" mode="widthFix" />
        </view>
        
        <view class="order-actions">
          <button @tap="verify(order.id, true)">通过</button>
          <button @tap="verify(order.id, false)">拒绝</button>
        </view>
      </view>
    </view>
  </view>
</template>
```

---

## 📋 方案 B：微信支付官方接入

### 1. 准备材料

**需要的资质：**
```
✅ 营业执照（个体户或公司）
✅ 法人身份证正反面
✅ 对公账户（或法人银行卡）
✅ 小程序已上线
✅ 小程序类目：工具 - 办公
```

**如果没有营业执照：**
```
方案 1：注册个体工商户
- 费用：免费（自己办）或¥500（代办）
- 时间：3-5 个工作日
- 可以用法人个人银行卡
- 推荐：个体户最简单

方案 2：用公司资质
- 商汤科技或关联公司
- 需要公司授权书
- 用公司对公账户
```

### 2. 申请流程

**步骤 1：注册微信商户平台**
```
访问：https://pay.weixin.qq.com
点击："立即注册"
选择："小程序支付"
填写资料：
  - 基本信息（营业执照、法人信息）
  - 结算信息（银行账户）
  - 业务信息（小程序 AppID）
提交审核 → 等待 3-7 天
```

**步骤 2：账户验证**
```
审核通过后
→ 登录商户平台
→ 账户中心 → 账户验证
→ 打款验证（腾讯打款¥0.01-1 元）
→ 填写收到金额
→ 验证通过
```

**步骤 3：配置开发信息**
```
登录商户平台
→ 开发配置
→ API 安全
→ 设置 API 密钥（32 位）
→ 下载 API 证书
→ 保存：商户号、AppID、密钥、证书
```

**步骤 4：绑定小程序**
```
登录商户平台
→ 产品中心 → 开发配置
→ 支付目录
→ 添加小程序 AppID
→ 提交审核
```

### 3. 技术接入

**后端配置：**
```javascript
// .env 文件
WECHAT_PAY_MCHID=1234567890          // 商户号
WECHAT_PAY_KEY=your32位密钥            // API 密钥
WECHAT_PAY_CERT=/path/to/apiclient_cert.pem
WECHAT_PAY_APPID=wx63721a0ef442fb67  // 小程序 AppID
WECHAT_PAY_NOTIFY_URL=https://api.lobster-app.com/api/v1/payment/wechat-notify
```

**安装 SDK：**
```bash
npm install tenpay
```

**发起支付：**
```javascript
const tenpay = require('tenpay')

const payment = tenpay({
  appid: config.wechat.appid,
  mchid: config.wechat.mchid,
  partnerKey: config.wechat.key,
  notify_url: config.wechat.notifyUrl
})

// 创建支付订单
router.post('/wechat', authMiddleware, async (req, res) => {
  const { orderId } = req.body
  const userId = req.user.id
  const openId = req.user.wechatOpenId // 需要用户已授权
  
  const order = await getOrder(orderId)
  
  const result = await payment.unifiedOrder({
    body: `龙虾 Agent - ${order.planName}`,
    out_trade_no: orderId,
    total_fee: Math.round(order.amount * 100), // 单位：分
    spbill_create_ip: req.ip,
    notify_url: config.wechat.notifyUrl,
    trade_type: 'JSAPI',
    openid: openId
  })
  
  // 返回前端需要的参数
  const payParams = {
    appId: config.wechat.appid,
    timeStamp: Date.now().toString(),
    nonceStr: result.nonce_str,
    package: `prepay_id=${result.prepay_id}`,
    signType: 'RSA',
    paySign: payment.getSign(...)
  }
  
  res.json({ success: true, data: payParams })
})
```

**前端调用：**
```javascript
// 小程序端
async function pay(orderId) {
  const response = await uni.request({
    url: '/api/v1/payment/wechat',
    method: 'POST',
    data: { orderId }
  })
  
  const payParams = response.data.data
  
  // 调用微信支付
  uni.requestPayment({
    ...payParams,
    success: (res) => {
      uni.showToast({
        title: '支付成功',
        icon: 'success'
      })
      // 跳转到会员页
    },
    fail: (err) => {
      uni.showToast({
        title: '支付失败',
        icon: 'none'
      })
    }
  })
}
```

**支付回调：**
```javascript
// POST /api/v1/payment/wechat-notify
router.post('/wechat-notify', async (req, res) => {
  const result = await payment.verifyNotify(req.body)
  
  if (result) {
    // 支付成功
    const orderId = result.out_trade_no
    const transactionId = result.transaction_id
    
    // 更新订单状态
    await updateOrder(orderId, {
      status: 'paid',
      paidAt: new Date(),
      transactionId
    })
    
    // 激活会员
    await activateSubscriptionByOrder(orderId)
    
    // 返回成功
    res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code></xml>')
  } else {
    res.send('<xml><return_code><![CDATA[FAIL]]></return_code></xml>')
  }
})
```

---

## 📋 方案 C：支付宝官方接入

### 1. 准备材料

**需要的资质：**
```
✅ 营业执照（个体户或公司）
✅ 法人身份证
✅ 对公账户（或法人银行卡）
✅ 网站已备案（H5 支付需要）
```

### 2. 申请流程

**步骤 1：注册支付宝开放平台**
```
访问：https://open.alipay.com
登录 → 开发者控制台
→ 创建应用
→ 选择：网页/移动应用
→ 填写应用信息
```

**步骤 2：添加功能**
```
应用详情 → 添加功能
→ 手机网站支付（H5）
→ 提交资料 → 等待审核
```

**步骤 3：配置密钥**
```
应用详情 → 开发信息
→ 接口加签方式 → 设置
→ 选择：公钥
→ 使用支付宝密钥工具生成 RSA2 密钥
→ 上传公钥，保存私钥
```

**步骤 4：签约产品**
```
产品中心 → 立即签约
→ 手机网站支付
→ 提交资料 → 等待审核（3-7 天）
```

### 3. 技术接入

**安装 SDK：**
```bash
npm install alipay-sdk
```

**后端配置：**
```javascript
// .env 文件
ALIPAY_APPID=2021000000000000
ALIPAY_PRIVATE_KEY=your_private_key
ALIPAY_PUBLIC_KEY=alipay_public_key
ALIPAY_RETURN_URL=https://lobster-app.com/pay/return
ALIPAY_NOTIFY_URL=https://api.lobster-app.com/api/v1/payment/alipay-notify
```

**发起支付：**
```javascript
const AlipaySdk = require('alipay-sdk').default

const alipaySdk = new AlipaySdk({
  appId: config.alipay.appid,
  privateKey: config.alipay.privateKey,
  alipayPublicKey: config.alipay.publicKey
})

// 创建支付订单
router.post('/alipay', authMiddleware, async (req, res) => {
  const { orderId } = req.body
  
  const order = await getOrder(orderId)
  
  const result = await alipaySdk.exec('alipay.trade.wap.pay', {
    returnUrl: config.alipay.returnUrl,
    notifyUrl: config.alipay.notifyUrl,
    bizContent: {
      subject: `龙虾 Agent - ${order.planName}`,
      out_trade_no: orderId,
      total_amount: order.amount.toFixed(2),
      product_code: 'QUICK_WAP_WAY'
    }
  })
  
  // 返回支付链接
  res.json({ 
    success: true, 
    data: { payUrl: result } 
  })
})
```

---

## 💰 费用对比

### 个人收款码（阶段 1）

```
费用:
- 费率：0%
- 成本：¥0

时间:
- 准备：5 分钟
- 接入：1 天

限制:
- 需要手动审核
- 无法自动续费
- 不适合大规模
```

### 官方支付（阶段 2）

```
微信支付:
- 费率：0.6%
- 例子：¥19 会员，手续费¥0.114

支付宝:
- 费率：0.6%
- 例子：¥19 会员，手续费¥0.114

时间:
- 准备：3-7 天（审核）
- 接入：2-3 天

优势:
- 自动处理
- 用户体验好
- 支持自动续费
```

---

## 🎯 推荐实施计划

### 第 1 周：个人收款码

```
Day 1: 生成收款码
Day 2: 前端页面开发
Day 3: 后端审核功能
Day 4: 测试上线
```

### 第 2-4 周：申请官方支付

```
Week 2: 注册个体户（如无营业执照）
Week 3: 申请微信支付 + 支付宝
Week 4: 等待审核
```

### 第 5 周：官方支付接入

```
Day 1-2: 技术接入
Day 3: 测试
Day 4: 上线
Day 5: 切换为官方支付
```

---

## ⚠️ 注意事项

### 合规问题

```
✅ 个人收款码:
- 仅限小额测试（月<¥1 万）
- 不要用于大规模商用
- 尽快切换为官方支付

✅ 官方支付:
- 必须有营业执照
- 必须真实交易
- 不得虚假交易
- 按规定纳税
```

### 安全问题

```
✅ 支付安全:
- 使用 HTTPS
- 验证签名
- 防重放攻击
- 金额校验
- 订单过期处理
```

---

## 📞 需要帮助？

**常见问题：**
- 没有营业执照怎么办？
- 个体户如何注册？
- 技术接入问题？
- 审核被拒怎么办？

**随时问我！**

---

🦞 龙虾汤出品 | 让 AI 真正为你工作！

*最后更新：2026-03-12*
