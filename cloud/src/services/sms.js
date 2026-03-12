/**
 * 短信服务
 * 阿里云短信
 */

const config = require('../config');
const logger = require('../utils/logger');

// 模拟验证码存储 (生产环境应该用 Redis)
const verificationCodes = new Map();

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

    // TODO: 调用阿里云短信 API
    // const result = await this.callAliyunSMS(phone, code, type);
    
    // 模拟发送成功
    return {
      success: true,
      message: '验证码已发送',
      expires: 300 // 秒
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
    // TODO: 实现阿里云短信调用
    // const client = new Dysmsapi({
    //   accessKeyId: config.aliyun.accessKeyId,
    //   accessKeySecret: config.aliyun.accessKeySecret
    // });
    
    // const params = {
    //   PhoneNumbers: phone,
    //   SignName: '龙虾 Agent',
    //   TemplateCode: type === 'register' ? 'SMS_123456789' : 'SMS_987654321',
    //   TemplateParam: JSON.stringify({ code })
    // };
    
    // const response = await client.sendSms(params);
    
    logger.info('发送阿里云短信', { phone, code, type });
    
    return {
      success: true,
      bizId: 'mock_biz_id'
    };
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
