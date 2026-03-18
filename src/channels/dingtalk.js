/**
 * 钉钉通道
 * 
 * 中国版 OpenClaw 核心通道
 * 支持钉钉机器人消息收发
 */

const axios = require('axios');
const logger = require('../../utils/logger');

class DingTalkChannel {
  constructor() {
    this.name = 'dingtalk';
    this.label = '钉钉';
    this.enabled = false;
    this.config = {
      webhook: process.env.DINGTALK_WEBHOOK,
      secret: process.env.DINGTALK_SECRET
    };
    
    logger.info('钉钉通道初始化');
  }

  /**
   * 初始化通道
   */
  async initialize() {
    try {
      if (!this.config.webhook) {
        logger.warn('钉钉 Webhook 未配置');
        this.enabled = false;
        return false;
      }

      // 测试连接
      await this.sendMessage('test', '钉钉通道测试连接');
      
      this.enabled = true;
      logger.info('✅ 钉钉通道初始化成功');
      
      return true;
    } catch (error) {
      logger.error('❌ 钉钉通道初始化失败', error);
      this.enabled = false;
      return false;
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(to, message) {
    if (!this.enabled) {
      throw new Error('钉钉通道未启用');
    }

    try {
      const response = await axios.post(this.config.webhook, {
        msgtype: 'text',
        text: {
          content: message
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      logger.info('发送钉钉消息成功', { to });
      
      return {
        success: true,
        messageId: this.generateMessageId()
      };
    } catch (error) {
      logger.error('发送钉钉消息失败', error);
      throw error;
    }
  }

  /**
   * 接收消息
   */
  async receiveMessage(message) {
    // TODO: 实现钉钉消息接收回调
    logger.info('接收钉钉消息', message);
  }

  /**
   * 生成消息 ID
   */
  generateMessageId() {
    return `ding_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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

module.exports = DingTalkChannel;
