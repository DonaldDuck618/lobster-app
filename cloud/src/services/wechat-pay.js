/**
 * 微信支付服务
 * 支持小程序支付
 */

const crypto = require('crypto');
const logger = require('../utils/logger');

// 微信支付配置
const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID || '',
  mchId: process.env.WECHAT_MCH_ID || '',
  apiKey: process.env.WECHAT_API_KEY || '',
  notifyUrl: process.env.WECHAT_NOTIFY_URL || 'http://xiabot.cn/api/v1/payment/wechat-notify'
};

class WechatPayService {
  /**
   * 创建小程序支付订单
   */
  static async createOrder(orderId, amount, subject) {
    logger.info('创建微信支付订单', { orderId, amount, subject });

    try {
      // 调用微信统一下单 API
      const unifiedOrder = await this.unifiedOrder(orderId, amount, subject);

      if (unifiedOrder.return_code === 'SUCCESS' && unifiedOrder.result_code === 'SUCCESS') {
        logger.info('微信订单创建成功', { orderId });

        // 生成小程序支付参数
        const payParams = this.generatePayParams(unifiedOrder);

        return {
          success: true,
          orderId: orderId,
          tradeNo: unifiedOrder.transaction_id,
          payParams: payParams
        };
      } else {
        logger.error('微信订单创建失败', unifiedOrder);
        return {
          success: false,
          error: unifiedOrder.return_msg || '订单创建失败'
        };
      }
    } catch (error) {
      logger.error('微信订单创建失败', error.message);
      return {
        success: false,
        error: '订单创建失败'
      };
    }
  }

  /**
   * 统一下单
   */
  static async unifiedOrder(orderId, amount, subject) {
    const params = {
      appid: WECHAT_CONFIG.appId,
      mch_id: WECHAT_CONFIG.mchId,
      nonce_str: this.generateNonce(),
      body: subject,
      out_trade_no: orderId,
      total_fee: Math.round(amount * 100), // 单位：分
      spbill_create_ip: '127.0.0.1',
      notify_url: WECHAT_CONFIG.notifyUrl,
      trade_type: 'JSAPI'
    };

    params.sign = this.generateSign(params);

    const xml = this.objToXml(params);

    try {
      const response = await require('axios').post(
        'https://api.mch.weixin.qq.com/pay/unifiedorder',
        xml,
        {
          headers: { 'Content-Type': 'text/xml' }
        }
      );

      return this.xmlToObj(response.data);
    } catch (error) {
      logger.error('统一下单失败', error.message);
      throw error;
    }
  }

  /**
   * 生成小程序支付参数
   */
  static generatePayParams(unifiedOrder) {
    const params = {
      appId: WECHAT_CONFIG.appId,
      timeStamp: Math.floor(Date.now() / 1000).toString(),
      nonceStr: this.generateNonce(),
      package: `prepay_id=${unifiedOrder.prepay_id}`,
      signType: 'RSA'
    };

    const signStr = `appId=${params.appId}&timeStamp=${params.timeStamp}&nonceStr=${params.nonceStr}&package=${params.package}&signType=${params.signType}`;
    params.paySign = this.generateSignForPay(signStr);

    return params;
  }

  /**
   * 生成签名
   */
  static generateSign(params) {
    const sortedKeys = Object.keys(params).sort();
    const signContent = sortedKeys
      .map(key => `${key}=${params[key]}`)
      .join('&');

    const signStr = `${signContent}&key=${WECHAT_CONFIG.apiKey}`;
    const sign = crypto.createHash('md5').update(signStr).digest('hex').toUpperCase();

    return sign;
  }

  /**
   * 生成支付签名
   */
  static generateSignForPay(signStr) {
    const signStrWithKey = `${signStr}&key=${WECHAT_CONFIG.apiKey}`;
    return crypto.createHash('md5').update(signStrWithKey).digest('hex').toUpperCase();
  }

  /**
   * 生成随机字符串
   */
  static generateNonce() {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * 对象转 XML
   */
  static objToXml(obj) {
    let xml = '<xml>';
    for (const key in obj) {
      xml += `<${key}>${obj[key]}</${key}>`;
    }
    xml += '</xml>';
    return xml;
  }

  /**
   * XML 转对象
   */
  static xmlToObj(xml) {
    // 简单实现，实际应该用 xml2js 库
    const result = {};
    const matches = xml.match(/<(\w+)>([^<]+)<\/\1>/g);
    if (matches) {
      matches.forEach(match => {
        const [, key, value] = match.match(/<(\w+)>([^<]+)<\/\1>/);
        result[key] = value;
      });
    }
    return result;
  }
}

module.exports = WechatPayService;
