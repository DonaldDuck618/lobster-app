/**
 * 企业微信通道
 * 
 * 中国版 OpenClaw 核心通道
 * 支持企业微信机器人消息收发
 */

const axios = require('axios');
const crypto = require('crypto');
const logger = require('../../utils/logger');

class WeComChannel {
  constructor() {
    this.name = 'wecom';
    this.label = '企业微信';
    this.enabled = false;
    this.config = {
      webhook: process.env.WECOM_WEBHOOK,
      corpId: process.env.WECOM_CORP_ID,
      agentId: process.env.WECOM_AGENT_ID,
      secret: process.env.WECOM_SECRET
    };
    
    logger.info('企业微信通道初始化');
  }

  /**
   * 初始化通道
   */
  async initialize() {
    try {
      if (!this.config.webhook) {
        logger.warn('企业微信 Webhook 未配置');
        this.enabled = false;
        return false;
      }

      // 测试连接
      await this.sendMessage('test', '企业微信通道测试连接');
      
      this.enabled = true;
      logger.info('✅ 企业微信通道初始化成功');
      
      return true;
    } catch (error) {
      logger.error('❌ 企业微信通道初始化失败', error);
      this.enabled = false;
      return false;
    }
  }

  /**
   * 发送消息
   */
  async sendMessage(to, message) {
    if (!this.enabled) {
      throw new Error('企业微信通道未启用');
    }

    try {
      const response = await axios.post(this.config.webhook, {
        msgtype: 'text',
        text: {
          content: message,
          mentioned_list: ['@all']
        }
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      logger.info('发送企业微信消息成功', { to });
      
      return {
        success: true,
        messageId: this.generateMessageId()
      };
    } catch (error) {
      logger.error('发送企业微信消息失败', error);
      throw error;
    }
  }

  /**
   * 接收消息
   */
  async receiveMessage(message) {
    logger.info('接收企业微信消息', message);
  }

  /**
   * 生成消息 ID
   */
  generateMessageId() {
    return `wecom_${Date.now()}_${Math.random().toString(36).slice(2)}`;
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

module.exports = WeComChannel;
