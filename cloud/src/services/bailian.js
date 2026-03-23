/**
 * 阿里云百炼 AI 服务
 * 使用通义千问模型进行对话
 */

const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');

// 阿里云百炼配置（根据配置文件）
const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY || 'sk-sp-0349cb8514b349acbacd895bc5066d6b';
const BAILIAN_API_URL = 'https://coding.dashscope.aliyuncs.com/v1/chat/completions'; // OpenAI 兼容模式
const MODEL = 'qwen3.5-plus'; // 通义千问 3.5 Plus

class BailianService {
  /**
   * 调用阿里云百炼 API（兼容模式）
   * 
   * @param {string} prompt - 用户输入
   * @param {Array} history - 对话历史
   * @returns {Promise<string>} AI 回复
   */
  static async chat(prompt, history = []) {
    try {
      // 构建消息（兼容 OpenAI 格式）
      const messages = [
        {
          role: 'system',
          content: '你是赚好多能虾助手，一个专业、友好、高效的 AI 助手。你擅长帮助用户解答问题、写作、分析、编程等。请用简洁、清晰、有条理的语言回复。'
        },
        ...history,
        { role: 'user', content: prompt }
      ];

      // 调用 API（兼容模式）
      const response = await axios.post(
        BAILIAN_API_URL,
        {
          model: MODEL,
          messages: messages,
          max_tokens: 2000,
          temperature: 0.7,
          top_p: 0.8
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BAILIAN_API_KEY}`
          },
          timeout: 30000
        }
      );

      // 解析响应（兼容模式）
      if (response.data && response.data.choices && response.data.choices.length > 0) {
        const content = response.data.choices[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';
        logger.info('阿里云百炼 AI 回复成功', { prompt_length: prompt.length, response_length: content.length });
        return content;
      } else {
        logger.warn('阿里云百炼 API 响应格式异常', response.data);
        return '抱歉，处理您的请求时遇到了问题，请稍后重试。';
      }

    } catch (error) {
      logger.error('阿里云百炼 API 调用失败', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });

      // 401 错误返回 false，使用模拟回复
      if (error.response?.status === 401) {
        throw new Error('API_KEY_INVALID');
      }
      
      return `抱歉，发生了一个错误：${error.message}`;
    }
  }

  /**
   * 流式对话（SSE）
   * 暂不支持，使用普通对话
   */
  static async chatStream(prompt, history = [], onChunk) {
    return await this.chat(prompt, history);
  }

  /**
   * 测试连接
   */
  static async testConnection() {
    try {
      const response = await axios.post(
        BAILIAN_API_URL,
        { model: MODEL, messages: [{ role: 'user', content: '你好' }] },
        {
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${BAILIAN_API_KEY}` },
          timeout: 10000
        }
      );
      return !!(response.data && response.data.choices);
    } catch (error) {
      if (error.response?.status === 401) {
        logger.warn('阿里云百炼 API Key 无效');
      }
      return false;
    }
  }
}

module.exports = BailianService;

module.exports = BailianService;
