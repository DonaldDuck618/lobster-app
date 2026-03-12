/**
 * 支付服务
 */

const { v4: uuidv4 } = require('uuid');
const { SubscriptionModel, PLANS } = require('../models/subscription');
const logger = require('../utils/logger');

// 模拟订单存储
const orders = new Map();

class PaymentService {
  /**
   * 获取会员计划列表
   */
  static async getPlans() {
    return await SubscriptionModel.getPlans();
  }

  /**
   * 创建支付订单
   */
  static async createOrder({ userId, planId, paymentMethod }) {
    const plan = PLANS[planId.toUpperCase()];
    
    if (!plan) {
      const error = new Error('无效的会员计划');
      error.status = 400;
      throw error;
    }

    // 创建订单
    const order = {
      id: uuidv4(),
      userId,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod,
      status: 'pending', // pending, paid, failed, refunded
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 分钟后过期
    };

    orders.set(order.id, order);

    // 创建订阅记录
    const subscription = await SubscriptionModel.create({
      userId,
      planId,
      paymentMethod
    });

    // 关联订单和订阅
    order.subscriptionId = subscription.id;

    logger.info('订单创建成功', { orderId: order.id, userId, amount: order.amount });

    return {
      orderId: order.id,
      planName: order.planName,
      amount: order.amount,
      currency: order.currency,
      expiresAt: order.expiresAt,
      subscriptionId: subscription.id
    };
  }

  /**
   * 微信支付
   */
  static async wechatPay({ userId, orderId }) {
    const order = orders.get(orderId);
    
    if (!order) {
      const error = new Error('订单不存在');
      error.status = 404;
      throw error;
    }

    if (order.userId !== userId) {
      const error = new Error('无权操作此订单');
      error.status = 403;
      throw error;
    }

    if (order.status !== 'pending') {
      const error = new Error('订单状态异常');
      error.status = 400;
      throw error;
    }

    // TODO: 调用微信支付 API
    // const result = await wechatPay.unifiedOrder({
    //   out_trade_no: orderId,
    //   total_fee: order.amount * 100, // 单位：分
    //   body: `龙虾 Agent - ${order.planName}`,
    //   spbill_create_ip: req.ip,
    //   notify_url: 'https://api.lobster-app.com/api/v1/payment/wechat-notify'
    // });

    // 模拟返回
    return {
      orderId,
      paymentMethod: 'wechat',
      payUrl: 'https://wx.tenpay.com/...', // 支付链接
      qrCode: 'data:image/png;base64,...', // 二维码
      expiresAt: order.expiresAt
    };
  }

  /**
   * 支付宝支付
   */
  static async alipayPay({ userId, orderId }) {
    const order = orders.get(orderId);
    
    if (!order) {
      const error = new Error('订单不存在');
      error.status = 404;
      throw error;
    }

    if (order.userId !== userId) {
      const error = new Error('无权操作此订单');
      error.status = 403;
      throw error;
    }

    if (order.status !== 'pending') {
      const error = new Error('订单状态异常');
      error.status = 400;
      throw error;
    }

    // TODO: 调用支付宝 API
    // const result = await alipaySdk.exec('alipay.trade.page.pay', {
    //   out_trade_no: orderId,
    //   total_amount: order.amount.toFixed(2),
    //   subject: `龙虾 Agent - ${order.planName}`,
    //   return_url: 'https://lobster-app.com/payment/success',
    //   notify_url: 'https://api.lobster-app.com/api/v1/payment/alipay-notify'
    // });

    // 模拟返回
    return {
      orderId,
      paymentMethod: 'alipay',
      payUrl: 'https://openapi.alipay.com/...', // 支付链接
      expiresAt: order.expiresAt
    };
  }

  /**
   * 处理微信支付回调
   */
  static async handleWechatNotify(data) {
    try {
      // TODO: 验证微信签名
      // const isValid = await wechatPay.verifyNotify(data);
      // if (!isValid) {
      //   return { success: false, message: '签名验证失败' };
      // }

      const { out_trade_no: orderId, transaction_id: transactionId } = data;

      const order = orders.get(orderId);
      if (!order) {
        return { success: false, message: '订单不存在' };
      }

      // 更新订单状态
      order.status = 'paid';
      order.transactionId = transactionId;
      order.paidAt = new Date();

      // 激活订阅
      await SubscriptionModel.activate(order.subscriptionId, transactionId);

      logger.info('微信支付成功', { orderId, transactionId });

      return { success: true };
    } catch (error) {
      logger.error('处理微信支付回调失败', error);
      return { success: false, message: error.message };
    }
  }

  /**
   * 获取用户订单列表
   */
  static async getUserOrders(userId, { status, page, limit }) {
    const userOrders = Array.from(orders.values())
      .filter(o => o.userId === userId)
      .filter(o => !status || o.status === status)
      .sort((a, b) => b.createdAt - a.createdAt);

    // 分页
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedOrders = userOrders.slice(start, end);

    return {
      orders: paginatedOrders,
      total: userOrders.length,
      page,
      limit
    };
  }

  /**
   * 获取活跃订阅
   */
  static async getActiveSubscription(userId) {
    const subscription = await SubscriptionModel.getActiveSubscription(userId);
    
    if (!subscription) {
      return {
        planId: 'free',
        planName: '免费版',
        status: 'active',
        features: PLANS.FREE.features
      };
    }

    const plan = PLANS[subscription.planId.toUpperCase()];

    return {
      ...subscription,
      features: plan.features,
      daysRemaining: subscription.endDate 
        ? Math.ceil((new Date(subscription.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        : null
    };
  }

  /**
   * 取消订阅
   */
  static async cancelSubscription(userId) {
    const subscription = await SubscriptionModel.getActiveSubscription(userId);
    
    if (!subscription || subscription.planId === 'free') {
      const error = new Error('没有活跃订阅');
      error.status = 400;
      throw error;
    }

    const result = await SubscriptionModel.cancel(subscription.id, userId);

    logger.info('用户取消订阅', { userId, subscriptionId: subscription.id });

    return result;
  }

  /**
   * 申请发票
   */
  static async requestInvoice({ userId, orderId, invoiceType, title }) {
    const order = orders.get(orderId);
    
    if (!order) {
      const error = new Error('订单不存在');
      error.status = 404;
      throw error;
    }

    if (order.userId !== userId) {
      const error = new Error('无权操作此订单');
      error.status = 403;
      throw error;
    }

    if (order.status !== 'paid') {
      const error = new Error('订单未支付');
      error.status = 400;
      throw error;
    }

    // TODO: 调用发票 API
    const invoice = {
      id: uuidv4(),
      orderId,
      userId,
      type: invoiceType,
      title: title || (invoiceType === 'personal' ? '个人' : '公司'),
      amount: order.amount,
      status: 'pending', // pending, issued, sent
      createdAt: new Date()
    };

    logger.info('发票申请成功', { invoiceId: invoice.id, userId });

    return invoice;
  }

  /**
   * 检查用户权限
   */
  static async checkPermission(userId, feature) {
    return await SubscriptionModel.checkPermission(userId, feature);
  }
}

module.exports = PaymentService;
