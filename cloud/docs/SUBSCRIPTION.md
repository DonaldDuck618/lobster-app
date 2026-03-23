# 🦞 赚好多能虾助手 - 会员订阅系统

## 💳 会员等级

| 等级 | 价格 | 周期 | 核心权益 |
|------|------|------|----------|
| **免费版** | ¥0 | 永久 | 基础对话、每天 5 次 Agent 调用 |
| **标准版** | ¥19/月 | 月付 | 无限调用、全工具链、自定义 Skill |
| **专业版** | ¥39/月 | 月付 | 端侧模型、团队协作、专属客服 |
| **企业版** | ¥5000/年 | 年付 | 私有化部署、定制开发 |

---

## 📋 权益对比

| 权益 | 免费版 | 标准版 | 专业版 | 企业版 |
|------|--------|--------|--------|--------|
| **每日 Agent 调用** | 5 次 | 无限 | 无限 | 无限 |
| **文件上传** | ✅ (10MB) | ✅ (100MB) | ✅ (500MB) | ✅ (1GB) |
| **Excel 分析** | ❌ | ✅ | ✅ | ✅ |
| **自定义 Skill** | ❌ | ✅ | ✅ | ✅ |
| **团队协作** | ❌ | ❌ | ✅ | ✅ |
| **专属客服** | ❌ | ❌ | ✅ | ✅ |
| **API 访问** | ❌ | ✅ | ✅ | ✅ |
| **私有化部署** | ❌ | ❌ | ❌ | ✅ |
| **定制开发** | ❌ | ❌ | ❌ | ✅ |

---

## 🚀 API 接口

### 获取会员计划

```bash
GET /api/v1/payment/plans
```

响应：
```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "免费版",
      "price": 0,
      "currency": "CNY",
      "period": "permanent",
      "features": {
        "dailyAgentCalls": 5,
        "fileUpload": true,
        "fileMaxSize": 10485760,
        "excelAnalysis": false,
        "customSkills": false
      }
    },
    {
      "id": "standard",
      "name": "标准版",
      "price": 19,
      "currency": "CNY",
      "period": "monthly",
      "features": {
        "dailyAgentCalls": -1,
        "fileUpload": true,
        "fileMaxSize": 104857600,
        "excelAnalysis": true,
        "customSkills": true
      },
      "popular": true
    }
  ]
}
```

### 创建订单

```bash
POST /api/v1/payment/create-order
Content-Type: application/json
Authorization: Bearer <token>

{
  "planId": "standard",
  "paymentMethod": "wechat"
}
```

### 微信支付

```bash
POST /api/v1/payment/wechat-pay
Content-Type: application/json
Authorization: Bearer <token>

{
  "orderId": "order_id_xxx"
}
```

响应：
```json
{
  "success": true,
  "data": {
    "orderId": "order_id_xxx",
    "paymentMethod": "wechat",
    "payUrl": "https://wx.tenpay.com/...",
    "qrCode": "data:image/png;base64,...",
    "expiresAt": "2026-03-12T13:30:00.000Z"
  }
}
```

### 获取当前订阅

```bash
GET /api/v1/payment/subscription
Authorization: Bearer <token>
```

### 取消订阅

```bash
POST /api/v1/payment/cancel-subscription
Authorization: Bearer <token>
```

### 申请发票

```bash
GET /api/v1/payment/invoice
Authorization: Bearer <token>

{
  "orderId": "order_id_xxx",
  "invoiceType": "company",
  "title": "某某科技有限公司"
}
```

---

## 🔐 权限检查

### 在路由中使用

```javascript
const { checkExcelAnalysis, checkDailyLimit } = require('./middleware/subscription');

// Excel 分析接口 (需要标准版以上)
router.post('/analyze-excel', 
  authMiddleware,
  checkExcelAnalysis(),
  async (req, res) => {
    // 只有标准版、专业版、企业版用户可以访问
  }
);

// 聊天接口 (检查每日限额)
router.post('/send',
  authMiddleware,
  checkDailyLimit(),
  async (req, res) => {
    // 免费版用户每天只能调用 5 次
  }
);
```

### 权限不足响应

```json
{
  "error": "Forbidden",
  "message": "此功能需要 标准版 会员",
  "data": {
    "requiredPlan": "standard",
    "currentPlan": "free",
    "upgradeUrl": "/api/v1/payment/plans"
  }
}
```

---

## 💰 支付流程

### 1. 用户选择会员计划

```
用户访问会员中心 -> 选择标准版 -> 点击购买
```

### 2. 创建订单

```javascript
POST /api/v1/payment/create-order
{
  "planId": "standard",
  "paymentMethod": "wechat"
}
```

### 3. 调用支付接口

```javascript
POST /api/v1/payment/wechat-pay
{
  "orderId": "order_id_xxx"
}

// 返回支付二维码或链接
```

### 4. 用户支付

```
用户扫码支付 -> 微信处理 -> 回调通知
```

### 5. 激活订阅

```javascript
// 微信回调
POST /api/v1/payment/wechat-notify

// 验证签名 -> 更新订单状态 -> 激活订阅
```

### 6. 通知用户

```
推送通知：恭喜您成为赚好多能虾助手 标准版会员！
```

---

## 📊 数据统计

### 订阅统计

```sql
-- 各等级会员数量
SELECT plan_id, COUNT(*) as count
FROM subscriptions
WHERE status = 'active'
GROUP BY plan_id;

-- 月收入统计
SELECT DATE(created_at) as date, SUM(amount) as revenue
FROM orders
WHERE status = 'paid'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at);

-- 续费率
SELECT 
  COUNT(CASE WHEN auto_renew = true THEN 1 END) * 100.0 / COUNT(*) as renewal_rate
FROM subscriptions
WHERE status = 'active';
```

### 收入预测

```javascript
// 月度经常性收入 (MRR)
MRR = Σ(各等级会员数 × 对应价格)

// 年度经常性收入 (ARR)
ARR = MRR × 12

// 用户生命周期价值 (LTV)
LTV = ARPU × 平均订阅月数
```

---

## 🎯 运营策略

### 1. 新用户优惠

```
首月 5 折优惠：¥9.5/月 (标准版)
限时体验：7 天专业版免费试用
```

### 2. 推荐奖励

```
邀请好友购买会员，双方各得 7 天会员
邀请 3 人，得 1 个月标准版会员
```

### 3. 续费优惠

```
连续包月：首月¥19，次月起¥15/月
年付优惠：¥199/年 (相当于¥16.5/月)
```

### 4. 升级策略

```
免费版 -> 标准版：强调无限调用、Excel 分析
标准版 -> 专业版：强调团队协作、专属客服
专业版 -> 企业版：强调私有化部署、定制开发
```

---

## ⚠️ 注意事项

### 1. 支付合规

- ✅ 需要 ICP 许可证
- ✅ 需要文网文证 (网络文化经营许可证)
- ✅ 接入正规支付渠道 (微信支付、支付宝)
- ❌ 不要接入个人收款码

### 2. 退款政策

```
- 虚拟商品不支持 7 天无理由退款
- 如遇技术问题导致无法使用，可申请退款
- 退款申请：support@lobster-app.com
```

### 3. 自动续费

```
- 明确告知用户自动续费规则
- 提供随时取消订阅的入口
- 续费前 24 小时短信/邮件提醒
```

### 4. 发票管理

```
- 支持电子发票
- 个人发票：个人姓名
- 公司发票：公司全称 + 税号
- 发票申请后 3-5 个工作日开具
```

---

## 📞 技术支持

- 支付问题：support@lobster-app.com
- 发票问题：invoice@lobster-app.com
- 商务合作：business@lobster-app.com

---

🦞 赚好多能虾助手出品 | 让 AI 真正为你工作！

*最后更新：2026-03-12*
