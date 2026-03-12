/**
 * 支付路由
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const PaymentService = require('../services/payment');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// 所有支付接口需要认证
router.use(authMiddleware);

/**
 * GET /api/v1/payment/plans
 * 获取会员计划列表
 */
router.get('/plans', async (req, res, next) => {
  try {
    const plans = await PaymentService.getPlans();

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/payment/create-order
 * 创建支付订单
 */
router.post('/create-order', [
  body('planId').isIn(['standard', 'pro', 'enterprise']),
  body('paymentMethod').isIn(['wechat', 'alipay'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { planId, paymentMethod } = req.body;

    // 创建订单
    const order = await PaymentService.createOrder({
      userId,
      planId,
      paymentMethod
    });

    logger.info('创建支付订单', { userId, orderId: order.id, amount: order.amount });

    res.json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/payment/wechat-pay
 * 微信支付
 */
router.post('/wechat-pay', [
  body('orderId').isUUID()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { orderId } = req.body;

    // 调用微信支付
    const result = await PaymentService.wechatPay({ userId, orderId });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/payment/alipay-pay
 * 支付宝支付
 */
router.post('/alipay-pay', [
  body('orderId').isUUID()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { orderId } = req.body;

    // 调用支付宝
    const result = await PaymentService.alipayPay({ userId, orderId });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/payment/wechat-notify
 * 微信支付回调
 */
router.post('/wechat-notify', async (req, res, next) => {
  try {
    const result = await PaymentService.handleWechatNotify(req.body);

    if (result.success) {
      // 返回成功响应给微信
      res.xml = `<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>`;
      res.type('text/xml');
      res.send(res.xml);
    } else {
      res.xml = `<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[${result.message}]]></return_msg></xml>`;
      res.type('text/xml');
      res.send(res.xml);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/payment/orders
 * 获取订单列表
 */
router.get('/orders', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const orders = await PaymentService.getUserOrders(userId, {
      status,
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/payment/subscription
 * 获取当前订阅
 */
router.get('/subscription', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const subscription = await PaymentService.getActiveSubscription(userId);

    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/payment/cancel-subscription
 * 取消订阅
 */
router.post('/cancel-subscription', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await PaymentService.cancelSubscription(userId);

    res.json({
      success: true,
      data: result,
      message: '订阅已取消，服务将持续到当前周期结束'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/payment/invoice
 * 申请发票
 */
router.get('/invoice', [
  body('orderId').isUUID(),
  body('invoiceType').isIn(['personal', 'company']),
  body('title').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { orderId, invoiceType, title } = req.body;

    const invoice = await PaymentService.requestInvoice({
      userId,
      orderId,
      invoiceType,
      title
    });

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
