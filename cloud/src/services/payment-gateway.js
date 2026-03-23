/**
 * 支付网关服务
 * 支持微信支付、支付宝、个人收款码
 */

const config = require('../config');
const logger = require('../utils/logger');

class PaymentGatewayService {
  /**
   * 创建支付订单
   */
  static async createOrder({ userId, planId, paymentMethod }) {
    const plan = this.getPlan(planId);
    
    // 生成订单号
    const orderId = this.generateOrderId();
    
    // 创建订单记录
    const order = {
      orderId,
      userId,
      planId,
      planName: plan.name,
      amount: plan.price,
      currency: 'CNY',
      paymentMethod,
      status: 'pending',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 分钟过期
    };

    // TODO: 保存到数据库
    // await OrderModel.create(order);

    logger.info('创建支付订单', order);

    return order;
  }

  /**
   * 微信支付 - 小程序
   */
  static async wechatPayMiniProgram({ orderId, userId, openId }) {
    const order = await this.getOrder(orderId);
    
    if (!order) {
      throw new Error('订单不存在');
    }

    // 调用微信支付 API
    // const result = await wechatPay.unifiedOrder({
    //   body: `赚好多能虾助手 - ${order.planName}`,
    //   out_trade_no: orderId,
    //   total_fee: Math.round(order.amount * 100), // 单位：分
    //   spbill_create_ip: req.ip,
    //   notify_url: config.wechat.payNotifyUrl,
    //   trade_type: 'JSAPI',
    //   openid: openId
    // });

    // 返回前端需要的参数
    const payParams = {
      appId: config.wechat.appid,
      timeStamp: Date.now().toString(),
      nonceStr: this.generateNonce(),
      package: `prepay_id=${result.prepay_id}`,
      signType: 'RSA',
      paySign: this.generateWechatSign(...)
    };

    return payParams;
  }

  /**
   * 支付宝 H5 支付
   */
  static async alipayH5({ orderId, userId }) {
    const order = await this.getOrder(orderId);
    
    if (!order) {
      throw new Error('订单不存在');
    }

    // 调用支付宝 API
    // const result = await alipaySdk.exec('alipay.trade.wap.pay', {
    //   subject: `赚好多能虾助手 - ${order.planName}`,
    //   out_trade_no: orderId,
    //   total_amount: order.amount.toFixed(2),
    //   product_code: 'QUICK_WAP_WAY',
    //   return_url: config.alipay.returnUrl,
    //   notify_url: config.alipay.notifyUrl
    // });

    // 返回支付链接
    return {
      payUrl: result,
      orderId
    };
  }

  /**
   * 个人收款码支付
   */
  static async personalQRCode({ orderId, userId, paymentMethod }) {
    const order = await this.getOrder(orderId);
    
    if (!order) {
      throw new Error('订单不存在');
    }

    // 获取收款码
    const qrCode = paymentMethod === 'wechat' 
      ? config.personal.wechatQRCode 
      : config.personal.alipayQRCode;

    return {
      qrCode,
      amount: order.amount,
      orderId,
      instruction: '请扫描二维码支付，支付后点击"我已支付"'
    };
  }

  /**
   * 确认支付（个人收款码）
   */
  static async confirmPayment({ orderId, userId, screenshot }) {
    const order = await this.getOrder(orderId);
    
    if (!order) {
      throw new Error('订单不存在');
    }

    // 更新订单状态
    order.status = 'pending_verify';
    order.screenshot = screenshot;
    order.confirmedAt = new Date();

    // TODO: 保存到数据库
    // await OrderModel.update(order);

    // 通知管理员审核
    await this.notifyAdmin(order);

    logger.info('用户确认支付，待审核', order);

    return {
      success: true,
      message: '已提交支付凭证，等待审核'
    };
  }

  /**
   * 审核支付（管理员）
   */
  static async verifyPayment({ orderId, adminId, approved }) {
    const order = await this.getOrder(orderId);
    
    if (!order) {
      throw new Error('订单不存在');
    }

    if (approved) {
      // 审核通过
      order.status = 'paid';
      order.paidAt = new Date();
      
      // 激活会员
      await this.activateSubscription(order.userId, order.planId);
      
      logger.info('支付审核通过', order);
    } else {
      // 审核拒绝
      order.status = 'failed';
      order.failReason = '支付凭证无效';
      
      logger.info('支付审核拒绝', order);
    }

    // TODO: 保存到数据库
    // await OrderModel.update(order);

    // 通知用户
    await this.notifyUser(order);

    return { success: true };
  }

  /**
   * 激活会员
   */
  static async activateSubscription(userId, planId) {
    // TODO: 创建或更新订阅
    // await SubscriptionModel.activate(userId, planId);
    
    logger.info('激活会员', { userId, planId });
  }

  /**
   * 获取订单
   */
  static async getOrder(orderId) {
    // TODO: 从数据库查询
    // return await OrderModel.findById(orderId);
    return null;
  }

  /**
   * 生成订单号
   */
  static generateOrderId() {
    const date = new Date();
    const timestamp = date.toISOString().replace(/[-:T.Z]/g, '').slice(0, 14);
    const random = Math.random().toString(36).slice(-6).toUpperCase();
    return `ORD${timestamp}${random}`;
  }

  /**
   * 生成随机字符串
   */
  static generateNonce() {
    return Math.random().toString(36).slice(-10).toUpperCase();
  }

  /**
   * 获取会员计划
   */
  static getPlan(planId) {
    const plans = {
      standard: { id: 'standard', name: '标准版', price: 19 },
      pro: { id: 'pro', name: '专业版', price: 39 },
      enterprise: { id: 'enterprise', name: '企业版', price: 5000 }
    };
    return plans[planId];
  }

  /**
   * 通知管理员
   */
  static async notifyAdmin(order) {
    // TODO: 发送通知给管理员
    // 可以通过微信模板消息、短信、邮件等
    logger.info('通知管理员审核', order);
  }

  /**
   * 通知用户
   */
  static async notifyUser(order) {
    // TODO: 发送通知给用户
    logger.info('通知用户', order);
  }
}

module.exports = PaymentGatewayService;
