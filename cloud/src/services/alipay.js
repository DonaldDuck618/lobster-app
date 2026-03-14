/**
 * 支付宝支付服务
 * 支持小程序支付、H5 支付
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../utils/logger');

// 支付宝配置
const ALIPAY_CONFIG = {
  appId: process.env.ALIPAY_APP_ID || '',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  gatewayUrl: 'https://openapi.alipay.com/gateway.do',
  notifyUrl: process.env.ALIPAY_NOTIFY_URL || 'http://xiabot.cn/api/v1/payment/alipay-notify'
};

class AlipayService {
  /**
   * 创建支付订单（小程序支付）
   */
  static async createOrder(orderId, amount, subject) {
    logger.info('创建支付宝订单', { orderId, amount, subject });

    const params = {
      app_id: ALIPAY_CONFIG.appId,
      method: 'alipay.trade.create',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('Z', '+08:00'),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: orderId,
        total_amount: amount.toFixed(2),
        subject: subject,
        product_code: 'FACE_TO_FACE_PAYMENT'
      })
    };

    // 生成签名
    params.sign = this.generateSign(params);

    try {
      const response = await axios.post(ALIPAY_CONFIG.gatewayUrl, params);
      const result = response.data;

      logger.info('支付宝订单创建成功', { orderId });

      return {
        success: true,
        orderId: orderId,
        tradeNo: result.alipay_trade_create_response?.trade_no,
        amount: amount
      };
    } catch (error) {
      logger.error('支付宝订单创建失败', error.response?.data || error.message);
      return {
        success: false,
        error: '支付订单创建失败'
      };
    }
  }

  /**
   * 生成 RSA2 签名
   */
  static generateSign(params) {
    const sortedKeys = Object.keys(params).sort();
    const signContent = sortedKeys
      .filter(key => params[key] && key !== 'sign' && key !== 'sign_type')
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const sign = crypto.createSign('RSA-SHA256');
    sign.update(signContent, 'utf8');
    sign.end();

    const signature = sign.sign(ALIPAY_CONFIG.privateKey, 'base64');
    return signature;
  }

  /**
   * 验证支付宝回调签名
   */
  static verifySign(params) {
    const sign = params.sign;
    const sortedKeys = Object.keys(params).sort();
    const signContent = sortedKeys
      .filter(key => params[key] && key !== 'sign' && key !== 'sign_type')
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(signContent, 'utf8');
    verify.end();

    return verify.verify(ALIPAY_CONFIG.alipayPublicKey, sign, 'base64');
  }

  /**
   * 查询订单状态
   */
  static async queryOrder(orderId) {
    const params = {
      app_id: ALIPAY_CONFIG.appId,
      method: 'alipay.trade.query',
      format: 'JSON',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace('Z', '+08:00'),
      version: '1.0',
      biz_content: JSON.stringify({
        out_trade_no: orderId
      })
    };

    params.sign = this.generateSign(params);

    try {
      const response = await axios.post(ALIPAY_CONFIG.gatewayUrl, params);
      const result = response.data;

      return {
        success: true,
        status: result.alipay_trade_query_response?.trade_status,
        tradeNo: result.alipay_trade_query_response?.trade_no
      };
    } catch (error) {
      logger.error('查询订单失败', error.message);
      return {
        success: false,
        error: '查询订单失败'
      };
    }
  }
}

module.exports = AlipayService;
