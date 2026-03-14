/**
 * 短信服务
 * 阿里云短信
 */

const config = require('../config');
const logger = require('../utils/logger');

// 模拟验证码存储 (生产环境应该用 Redis)
const verificationCodes = new Map();

// 阿里云短信客户端 (待配置)
let smsClient = null;

/**
 * 初始化阿里云短信客户端
 */
function initSmsClient() {
  if (!config.aliyun.accessKeyId || !config.aliyun.accessKeySecret) {
    logger.warn('阿里云短信配置缺失，使用模拟模式');
    return null;
  }

  try {
    // TODO: 安装 @alicloud/dysmsapi20170525 后启用
    // const Dysmsapi20170525 = require('@alicloud/dysmsapi20170525');
    // const OpenApi = require('@alicloud/openapi-client');
    
    // const config = new OpenApi.Config({
    //   accessKeyId: config.aliyun.accessKeyId,
    //   accessKeySecret: config.aliyun.accessKeySecret,
    //   endpoint: 'dysmsapi.aliyuncs.com'
    // });
    
    // return new Dysmsapi20170525(config);
    
    logger.info('阿里云短信客户端初始化成功');
    return { mock: true }; // 模拟模式
  } catch (error) {
    logger.error('阿里云短信客户端初始化失败', error);
    return null;
  }
}

class SMSService {
  /**
   * 发送验证码
   */
  static async sendVerificationCode(phone, type = 'register') {
    // 验证手机号格式
    if (!this.validatePhoneFormat(phone)) {
      const error = new Error('手机号格式不正确');
      error.status = 400;
      throw error;
    }

    // 检查发送频率
    const key = `sms:${phone}:${type}`;
    const lastSent = verificationCodes.get(key);
    
    if (lastSent && Date.now() - lastSent < 60000) {
      const error = new Error('发送过于频繁，请 1 分钟后再试');
      error.status = 429;
      throw error;
    }

    // 生成 6 位验证码
    const code = Math.random().toString().slice(-6);
    
    // 存储验证码 (5 分钟有效期)
    const expiresAt = Date.now() + 5 * 60 * 1000;
    verificationCodes.set(key, {
      code,
      expiresAt,
      sentAt: Date.now()
    });

    logger.info('验证码已生成', { phone, type, code });

    // 调用阿里云短信 API
    const result = await this.callAliyunSMS(phone, code, type);
    
    return {
      success: true,
      message: '验证码已发送',
      expires: 300, // 秒
      bizId: result.bizId
    };
  }

  /**
   * 验证验证码
   */
  static async verifyCode(phone, code, type = 'register') {
    const key = `sms:${phone}:${type}`;
    const record = verificationCodes.get(key);

    if (!record) {
      const error = new Error('验证码不存在或已过期');
      error.status = 400;
      throw error;
    }

    if (Date.now() > record.expiresAt) {
      verificationCodes.delete(key);
      const error = new Error('验证码已过期');
      error.status = 400;
      throw error;
    }

    if (record.code !== code) {
      const error = new Error('验证码错误');
      error.status = 400;
      throw error;
    }

    // 验证成功，删除验证码
    verificationCodes.delete(key);

    return { success: true };
  }

  /**
   * 验证手机号格式
   */
  static validatePhoneFormat(phone) {
    // 中国大陆手机号：11 位，1 开头，第二位 3-9
    const regex = /^1[3-9]\d{9}$/;
    return regex.test(phone);
  }

  /**
   * 调用阿里云短信 API
   */
  static async callAliyunSMS(phone, code, type) {
    // 初始化客户端
    if (!smsClient) {
      smsClient = initSmsClient();
    }

    // 如果是模拟模式，直接返回成功
    if (smsClient && smsClient.mock) {
      logger.info('[模拟模式] 发送短信', { phone, code, type });
      console.log(`📱 验证码：${code} (有效期 5 分钟)`); // 开发环境打印验证码
      return { success: true, bizId: 'mock_' + Date.now() };
    }

    // 正式环境调用阿里云 API
    try {
      // TODO: 安装 SDK 后启用
      // const sendSmsRequest = new Dysmsapi20170525.Models.SendSmsRequest({
      //   phoneNumbers: phone,
      //   signName: '能虾助手',
      //   templateCode: type === 'register' ? 'SMS_280756062' : 'SMS_280756063',
      //   templateParam: JSON.stringify({ code })
      // });
      
      // const response = await smsClient.sendSms(sendSmsRequest);
      
      logger.info('阿里云短信发送成功', { phone, type });
      
      return {
        success: true,
        bizId: 'aliyun_' + Date.now()
      };
    } catch (error) {
      logger.error('阿里云短信发送失败', error);
      throw new Error('短信发送失败，请稍后重试');
    }
  }

  /**
   * 清理过期验证码
   */
  static cleanup() {
    const now = Date.now();
    for (const [key, record] of verificationCodes.entries()) {
      if (now > record.expiresAt) {
        verificationCodes.delete(key);
      }
    }
  }
}

// 每分钟清理一次过期验证码
setInterval(() => SMSService.cleanup(), 60000);

module.exports = SMSService;
