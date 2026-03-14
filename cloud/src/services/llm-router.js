/**
 * 大模型路由服务
 * 支持多模型切换：阿里云百炼、通义千问、智谱 GLM、MiniMax、Kimi
 */

const config = require('../config');
const logger = require('../utils/logger');
const axios = require('axios');

// 模型配置
const MODELS = {
  // 阿里云百炼（新增，默认）
  bailian: {
    provider: 'bailian',
    model: process.env.BAILIAN_MODEL || 'qwen-plus',
    apiKey: process.env.BAILIAN_API_KEY || 'sk-cea10340d64a459fb785294982232ea7',
    baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
    temperature: 0.7,
    maxTokens: 2000,
    context: '你是能虾助手 AI 助手。用中文简洁回答。'
  },
  
  // 通义千问（备用）
  qwen: {
    provider: 'dashscope',
    model: 'qwen-plus',
    apiKey: process.env.DASHSCOPE_API_KEY,
    temperature: 0.7,
    maxTokens: 2000,
    context: '你是能虾助手 AI 助手。用中文简洁回答。'
  },
  
  // 智谱 GLM
  glm: {
    provider: 'zhipu',
    model: 'glm-4',
    apiKey: process.env.ZHIPU_API_KEY,
    temperature: 0.7,
    maxTokens: 2000,
    context: '你是能虾助手 AI 助手。用中文简洁回答。'
  },
  
  // MiniMax（便宜，适合对话）
  minimax: {
    provider: 'minimax',
    model: 'abab6.5',
    apiKey: process.env.MINIMAX_API_KEY,
    temperature: 0.7,
    maxTokens: 2000,
    context: '你是能虾助手 AI 助手。用中文简洁回答。'
  },
  
  // Kimi（长文本）
  kimi: {
    provider: 'moonshot',
    model: 'kimi-plus',
    apiKey: process.env.MOONSHOT_API_KEY,
    temperature: 0.7,
    maxTokens: 2000,
    context: '你是能虾助手 AI 助手。用中文简洁回答。'
  }
};

// 任务类型到模型的映射
const TASK_MODEL_MAP = {
  'chat': 'bailian',           // 日常对话 - 用百炼
  'excel': 'bailian',          // Excel 分析 - 用百炼
  'writing': 'bailian',        // 文案写作 - 用百炼
  'code': 'bailian',           // 代码生成 - 用百炼
  'reasoning': 'bailian',      // 复杂推理 - 用百炼
  'ocr': 'bailian',            // OCR 识别 - 用百炼
  'search': 'bailian'          // 搜索报告 - 用百炼
};

class LLMRouter {
  /**
   * 根据任务类型选择模型
   */
  static selectModel(taskType, userPreference = 'bailian') {
    // 用户可以指定偏好模型
    const modelKey = userPreference || TASK_MODEL_MAP[taskType] || 'bailian';
    return MODELS[modelKey] || MODELS.bailian;
  }

  /**
   * 调用大模型
   */
  static async call({ taskType, message, sessionId, userId, modelPreference }) {
    const startTime = Date.now();
    
    // 选择模型
    const model = this.selectModel(taskType, modelPreference);
    
    logger.info('调用大模型', {
      userId,
      model: model.model,
      provider: model.provider,
      taskType
    });

    try {
      // 构建 Prompt
      const prompt = this.buildPrompt(model.context, message);
      
      // 调用对应 provider 的 API
      let response;
      switch (model.provider) {
        case 'bailian':
          response = await this.callBailian(model, prompt);
          break;
        case 'dashscope':
          response = await this.callDashScope(model, prompt);
          break;
        case 'zhipu':
          response = await this.callZhipu(model, prompt);
          break;
        case 'minimax':
          response = await this.callMiniMax(model, prompt);
          break;
        case 'moonshot':
          response = await this.callMoonshot(model, prompt);
          break;
        default:
          throw new Error(`未知的 provider: ${model.provider}`);
      }

      // 记录用量
      const duration = Date.now() - startTime;
      const cost = this.calculateCost(response.usage, model);
      
      logger.info('大模型调用成功', {
        userId,
        model: model.model,
        tokens: response.usage.totalTokens,
        cost: `¥${cost.toFixed(4)}`,
        duration: `${duration}ms`
      });
      
      return {
        content: response.content,
        model: model.model,
        usage: response.usage,
        cost,
        duration
      };
    } catch (error) {
      logger.error('大模型调用失败', {
        userId,
        model: model.model,
        error: error.message
      });
      
      // 降级策略：切换到备用模型
      if (model.provider !== 'bailian') {
        logger.info('降级到阿里云百炼');
        return await this.call({
          taskType,
          message,
          sessionId,
          userId,
          modelPreference: 'bailian'
        });
      }
      
      throw error;
    }
  }

  /**
   * 构建 Prompt
   */
  static buildPrompt(context, message) {
    return `${context}\n\n用户：${message}\n助手：`;
  }

  /**
   * 调用阿里云百炼 API
   */
  static async callBailian(model, prompt) {
    if (!model.apiKey) {
      logger.warn('百炼 API Key 未配置，使用模拟响应');
      return {
        content: '这是阿里云百炼的模拟响应（API Key 未配置）',
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 }
      };
    }

    try {
      const response = await axios.post(
        `${model.baseUrl}/services/aigc/text-generation/generation`,
        {
          model: model.model,
          input: {
            messages: [
              { role: 'system', content: model.context },
              { role: 'user', content: prompt }
            ]
          },
          parameters: {
            temperature: model.temperature,
            max_tokens: model.maxTokens
          }
        },
        {
          headers: {
            'Authorization': `Bearer ${model.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = response.data;
      
      return {
        content: result.output?.text || result.output?.choices?.[0]?.message?.content || '无响应',
        usage: {
          inputTokens: result.usage?.input_tokens || 0,
          outputTokens: result.usage?.output_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      logger.error('百炼 API 调用失败', error.response?.data || error.message);
      throw new Error('百炼 API 调用失败');
    }
  }

  /**
   * 调用通义千问 API
   */
  static async callDashScope(model, prompt) {
    // 复用百炼调用（同一个 API）
    return await this.callBailian(model, prompt);
  }

  /**
   * 调用智谱 GLM API
   */
  static async callZhipu(model, prompt) {
    if (!model.apiKey) {
      return {
        content: '智谱 GLM API Key 未配置',
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 }
      };
    }

    try {
      const response = await axios.post(
        'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        {
          model: model.model,
          messages: [
            { role: 'system', content: model.context },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${model.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = response.data;
      
      return {
        content: result.choices?.[0]?.message?.content || '无响应',
        usage: {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      logger.error('智谱 API 调用失败', error.response?.data || error.message);
      throw new Error('智谱 API 调用失败');
    }
  }

  /**
   * 调用 MiniMax API
   */
  static async callMiniMax(model, prompt) {
    if (!model.apiKey) {
      return {
        content: 'MiniMax API Key 未配置',
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 }
      };
    }

    try {
      const response = await axios.post(
        'https://api.minimax.chat/v1/text/chatcompletion_v2',
        {
          model: model.model,
          messages: [
            { role: 'system', content: model.context },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${model.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = response.data;
      
      return {
        content: result.choices?.[0]?.message?.content || '无响应',
        usage: {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      logger.error('MiniMax API 调用失败', error.response?.data || error.message);
      throw new Error('MiniMax API 调用失败');
    }
  }

  /**
   * 调用 Moonshot Kimi API
   */
  static async callMoonshot(model, prompt) {
    if (!model.apiKey) {
      return {
        content: 'Moonshot API Key 未配置',
        usage: { inputTokens: 10, outputTokens: 20, totalTokens: 30 }
      };
    }

    try {
      const response = await axios.post(
        'https://api.moonshot.cn/v1/chat/completions',
        {
          model: model.model,
          messages: [
            { role: 'system', content: model.context },
            { role: 'user', content: prompt }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${model.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const result = response.data;
      
      return {
        content: result.choices?.[0]?.message?.content || '无响应',
        usage: {
          inputTokens: result.usage?.prompt_tokens || 0,
          outputTokens: result.usage?.completion_tokens || 0,
          totalTokens: result.usage?.total_tokens || 0
        }
      };
    } catch (error) {
      logger.error('Moonshot API 调用失败', error.response?.data || error.message);
      throw new Error('Moonshot API 调用失败');
    }
  }

  /**
   * 计算成本
   */
  static calculateCost(usage, model) {
    // 不同模型的单价（元/1K tokens）
    const prices = {
      'bailian': { input: 0.004, output: 0.012 },
      'qwen-plus': { input: 0.004, output: 0.012 },
      'qwen-max': { input: 0.02, output: 0.06 },
      'glm-4': { input: 0.005, output: 0.015 },
      'abab6.5': { input: 0.001, output: 0.003 },
      'kimi-plus': { input: 0.006, output: 0.018 }
    };

    const price = prices[model.model] || prices.bailian;
    const inputCost = (usage.inputTokens / 1000) * price.input;
    const outputCost = (usage.outputTokens / 1000) * price.output;
    
    return inputCost + outputCost;
  }

  /**
   * 获取可用模型列表
   */
  static getAvailableModels() {
    return Object.entries(MODELS).map(([key, model]) => ({
      key,
      name: model.model,
      provider: model.provider,
      available: !!model.apiKey
    }));
  }
}

module.exports = LLMRouter;
