/**
 * 大模型路由服务
 * 根据任务类型智能选择最优模型
 */

const config = require('../config');
const logger = require('../utils/logger');

// 模型配置
const MODELS = {
  // 日常对话 - 最便宜
  chat: {
    provider: 'minimax',
    model: 'abab6.5',
    temperature: 0.7,
    maxTokens: 2000,
    price: 0.001, // ¥/1K tokens
    context: '你是龙虾汤 AI 助手。用中文简洁回答。'
  },
  
  // Excel 分析 - 性价比
  excel: {
    provider: 'dashscope',
    model: 'qwen-plus',
    temperature: 0.3,
    maxTokens: 4000,
    price: 0.004,
    context: '你是数据分析专家。分析 Excel 数据，输出关键洞察。用表格和图表展示。'
  },
  
  // 文案写作 - 中等
  writing: {
    provider: 'zhipu',
    model: 'glm-4',
    temperature: 0.8,
    maxTokens: 3000,
    price: 0.005,
    context: '你是专业文案。写作用户需要的内容，语言流畅、专业。'
  },
  
  // 代码生成 - 好模型
  code: {
    provider: 'dashscope',
    model: 'qwen-max',
    temperature: 0.2,
    maxTokens: 4000,
    price: 0.02,
    context: '你是资深程序员。写高质量代码，加注释。'
  },
  
  // 复杂推理 - 最好的
  reasoning: {
    provider: 'dashscope',
    model: 'qwen-max',
    temperature: 0.5,
    maxTokens: 4000,
    price: 0.02,
    context: '你是逻辑专家。逐步推理，给出详细分析过程。'
  }
};

// 任务类型映射
const TASK_TYPE_MAP = {
  '聊天': 'chat',
  '对话': 'chat',
  'Excel': 'excel',
  '分析': 'excel',
  '数据': 'excel',
  '周报': 'writing',
  '日报': 'writing',
  '文案': 'writing',
  '邮件': 'writing',
  '代码': 'code',
  '编程': 'code',
  '推理': 'reasoning',
  '逻辑': 'reasoning'
};

class LLMRouter {
  /**
   * 根据任务类型选择模型
   */
  static selectModel(taskType, message) {
    // 1. 关键词匹配
    for (const [keyword, type] of Object.entries(TASK_TYPE_MAP)) {
      if (message.includes(keyword) || taskType.includes(keyword)) {
        return MODELS[type];
      }
    }
    
    // 2. 默认用聊天模型 (最便宜)
    return MODELS.chat;
  }
  
  /**
   * 调用大模型
   */
  static async call({ taskType, message, sessionId, userId }) {
    const startTime = Date.now();
    
    // 选择模型
    const model = this.selectModel(taskType, message);
    
    logger.info('调用大模型', {
      userId,
      sessionId,
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
      const cost = this.calculateCost(response.usage, model.price);
      
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
      if (model.provider !== 'dashscope') {
        logger.info('尝试降级到通义千问');
        return await this.call({
          taskType: 'chat', // 降级用聊天
          message: `抱歉，刚才的服务暂时不可用。你的问题是：${message}`,
          sessionId,
          userId
        });
      }
      
      throw error;
    }
  }
  
  /**
   * 构建 Prompt
   */
  static buildPrompt(context, message) {
    // 精简 Prompt，节省 tokens
    return `${context}\n\n用户：${message}\n助手：`;
  }
  
  /**
   * 调用通义千问
   */
  static async callDashScope(model, prompt) {
    const apiKey = config.models.dashscope.apiKey;
    
    // 如果没有配置 API Key，使用模拟模式
    if (!apiKey) {
      logger.warn('DashScope API Key 未配置，使用模拟响应');
      console.log('🤖 [通义千问模拟]', prompt.slice(0, 50) + '...');
      return {
        content: '这是通义千问的回答...(开发模式)',
        usage: {
          inputTokens: prompt.length / 4,
          outputTokens: 100,
          totalTokens: prompt.length / 4 + 100
        }
      };
    }

    try {
      // 调用 DashScope API
      const response = await axios.post(
        'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
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
            'Authorization': `Bearer ${apiKey}`,
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
      logger.error('通义千问调用失败', error.response?.data || error.message);
      throw new Error('AI 服务暂时不可用');
    }
  }
  
  /**
   * 调用智谱 GLM
   */
  static async callZhipu(model, prompt) {
    // TODO: 实现 Zhipu API 调用
    return {
      content: '这是智谱 GLM 的回答...',
      usage: {
        inputTokens: prompt.length / 4,
        outputTokens: 100,
        totalTokens: prompt.length / 4 + 100
      }
    };
  }
  
  /**
   * 调用 MiniMax
   */
  static async callMiniMax(model, prompt) {
    // TODO: 实现 MiniMax API 调用
    return {
      content: '这是 MiniMax 的回答...',
      usage: {
        inputTokens: prompt.length / 4,
        outputTokens: 100,
        totalTokens: prompt.length / 4 + 100
      }
    };
  }
  
  /**
   * 调用 Moonshot Kimi
   */
  static async callMoonshot(model, prompt) {
    // TODO: 实现 Moonshot API 调用
    return {
      content: '这是 Kimi 的回答...',
      usage: {
        inputTokens: prompt.length / 4,
        outputTokens: 100,
        totalTokens: prompt.length / 4 + 100
      }
    };
  }
  
  /**
   * 计算成本
   */
  static calculateCost(usage, pricePer1K) {
    return (usage.totalTokens / 1000) * pricePer1K;
  }
  
  /**
   * 获取模型列表
   */
  static getModels() {
    return Object.entries(MODELS).map(([type, config]) => ({
      type,
      ...config
    }));
  }
}

module.exports = LLMRouter;
