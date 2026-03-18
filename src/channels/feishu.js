/**
 * 飞书通道
 * 
 * 中国版 OpenClaw 核心通道
 * 支持飞书机器人消息收发
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../../utils/logger');

class FeishuChannel {
  constructor() {
    this.name = 'feishu';
    this.label = '飞书';
    this.enabled = false;
    this.config = {
      webhook: process.env.FEISHU_WEBHOOK,
      secret: process.env.FEISHU_SECRET
    };
    
    logger.info('飞书通道初始化');
  }

  /**
   * 初始化通道
   */
  async initialize() {
    try {
      if (!this.config.webhook) {
        logger.warn('飞书 Webhook 未配置');
        this.enabled = false;
        return false;
      }

      // 测试连接
      await this.sendMessage('test', '飞书通道测试连接');
      
      this.enabled = true;
      logger.info('✅ 飞书通道初始化成功');
      
      return true;
    } catch (error) {
      logger.error('❌ 飞书通道初始化失败', error);
      this.enabled = false;
      return false;
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(to, message) {
    if (!this.enabled) {
      throw new Error('飞书通道未启用');
    }

    try {
      // 生成签名
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const stringToSign = timestamp + '\n' + this.config.secret;
      const signature = crypto
        .createHmac('sha256', stringToSign)
        .digest()
        .toString('base64');

      const response = await axios.post(this.config.webhook, {
        msg_type: 'text',
        content: {
          text: message
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'X-Lark-Request-Timestamp': timestamp,
          'X-Lark-Signature': signature
        }
      });

      logger.info('发送飞书消息成功', { to });
      
      return {
        success: true,
        messageId: this.generateMessageId()
      };
    } catch (error) {
      logger.error('发送飞书消息失败', error);
      throw error;
    }
  }

  /**
   * 接收消息
   */
  async receiveMessage(message) {
    logger.info('接收飞书消息', message);
  }

  /**
   * 生成消息 ID
   */
  generateMessageId() {
    return `feishu_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    return {
      name: this.name,
      label: this.label,
      enabled: this.enabled,
      configured: !!this.config.webhook
    };
  }
}

module.exports = FeishuChannel;
