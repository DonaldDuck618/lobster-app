/**
 * Agent Loop - 能虾助手核心智能引擎
 * 
 * 借鉴 OpenClaw pi-mono Agent Loop 设计
 * 实现：思考 → 工具调用 → 执行 → 回复 的完整流程
 */

const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');
const db = require('../models/database');
const { v4: uuidv4 } = require('uuid');

// 阿里云百炼配置
const BAILIAN_API_KEY = process.env.BAILIAN_API_KEY || 'sk-sp-0349cb8514b349acbacd895bc5066d6b';
const BAILIAN_API_URL = 'https://coding.dashscope.aliyuncs.com/v1/chat/completions';
const MODEL = 'qwen3.5-plus';

// 工具定义
const TOOLS = [
  {
    name: 'web_search',
    description: '搜索网络获取最新信息。当你不知道某个问题的答案或需要最新信息时使用。',
    parameters: {
      type: 'object',
      properties: {
        query: { 
          type: 'string', 
          description: '搜索关键词，应该具体明确' 
        },
        count: { 
          type: 'number', 
          description: '结果数量 (1-10)',
          default: 5
        }
      },
      required: ['query']
    }
  },
  {
    name: 'calculator',
    description: '执行数学计算。当用户需要计算时使用。',
    parameters: {
      type: 'object',
      properties: {
        expression: { 
          type: 'string', 
          description: '数学表达式，如 "2 + 2 * 3"' 
        }
      },
      required: ['expression']
    }
  }
];

class AgentLoop {
  /**
   * 运行 Agent Loop
   * 
   * @param {string} message - 用户消息
   * @param {Object} session - 会话信息
   * @returns {Promise<Object>} AI 响应
   */
  async run(message, session) {
    const startTime = Date.now();
    logger.info('Agent Loop 启动', { sessionId: session.id, message_length: message.length });

    try {
      // 1. 加载上下文
      const context = await this.loadContext(session);
      
      // 2. 构建系统提示
      const systemPrompt = this.buildSystemPrompt(context);
      
      // 3. 调用 LLM（带工具定义）
      const response = await this.callLLM({
        systemPrompt,
        history: context.history,
        message
      });
      
      // 4. 解析响应
      if (response.toolCalls && response.toolCalls.length > 0) {
        logger.info('检测到工具调用', { tools: response.toolCalls.length });
        
        // 执行工具
        const toolResults = await this.executeTools(response.toolCalls);
        
        // 5. 递归处理（将工具结果反馈给 LLM）
        return await this.runWithToolResults(message, session, toolResults);
      }
      
      // 6. 保存对话
      await this.saveMessage(session, message, response.content);
      
      // 7. 返回响应
      const duration = Date.now() - startTime;
      logger.info('Agent Loop 完成', { sessionId: session.id, duration_ms: duration });
      
      return {
        content: response.content,
        usage: response.usage,
        duration
      };
      
    } catch (error) {
      logger.error('Agent Loop 失败', { message: error.message, stack: error.stack });
      throw error;
    }
  }

  /**
   * 加载上下文
   */
  async loadContext(session) {
    // 获取最近 20 条对话历史
    const history = await db.query(
      'SELECT role, content FROM messages WHERE session_id = ? ORDER BY created_at DESC LIMIT 20',
      [session.id]
    );
    
    // 反转顺序（从旧到新）
    return {
      history: (history || []).reverse().map(h => ({ role: h.role, content: h.content })),
      sessionId: session.id,
      userId: session.user_id
    };
  }

  /**
   * 构建系统提示
   */
  buildSystemPrompt(context) {
    return `你是能虾助手🦞，一个专业、友好、高效的 AI 助手。

## 你的能力
- 解答各种问题
- 搜索网络获取最新信息
- 执行数学计算
- 写作、分析、编程辅助

## 工具使用
你可以使用以下工具来帮助用户：
${TOOLS.map(t => `- ${t.name}: ${t.description}`).join('\n')}

## 回复要求
- 用简洁、清晰、有条理的中文回复
- 如果不确定，请搜索确认
- 如果需要计算，请使用计算器工具
- 保持友好和专业的语气

## 当前会话
会话 ID: ${context.sessionId}`;
  }

  /**
   * 调用 LLM
   */
  async callLLM({ systemPrompt, history, message }) {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: message }
    ];

    try {
      const response = await axios.post(
        BAILIAN_API_URL,
        {
          model: MODEL,
          messages: messages,
          tools: TOOLS.map(tool => ({
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.parameters
            }
          })),
          tool_choice: 'auto',
          max_tokens: 2000,
          temperature: 0.7
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${BAILIAN_API_KEY}`
          },
          timeout: 30000
        }
      );

      const choice = response.data.choices[0];
      const aiMessage = choice.message;

      // 解析工具调用
      const toolCalls = [];
      if (aiMessage.tool_calls) {
        for (const tc of aiMessage.tool_calls) {
          toolCalls.push({
            id: tc.id,
            name: tc.function.name,
            arguments: JSON.parse(tc.function.arguments)
          });
        }
      }

      return {
        content: aiMessage.content || '',
        toolCalls,
        usage: response.data.usage
      };

    } catch (error) {
      logger.error('LLM 调用失败', { message: error.message });
      throw error;
    }
  }

  /**
   * 执行工具
   */
  async executeTools(toolCalls) {
    const results = [];
    
    for (const toolCall of toolCalls) {
      logger.info('执行工具', { name: toolCall.name, args: toolCall.arguments });
      
      try {
        const result = await this.callTool(toolCall.name, toolCall.arguments);
        results.push({
          toolCallId: toolCall.id,
          name: toolCall.name,
          result,
          success: true
        });
      } catch (error) {
        logger.error('工具执行失败', { name: toolCall.name, error: error.message });
        results.push({
          toolCallId: toolCall.id,
          name: toolCall.name,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }

  /**
   * 调用具体工具
   */
  async callTool(name, args) {
    switch (name) {
      case 'web_search': {
        const WebSearchService = require('./web-search');
        return await WebSearchService.search({
          query: args.query,
          count: args.count || 5
        });
      }
      
      case 'calculator': {
        // 安全计算
        const result = eval(args.expression.replace(/[^0-9+\-*/().]/g, ''));
        return { result, expression: args.expression };
      }
      
      default:
        throw new Error(`未知工具：${name}`);
    }
  }

  /**
   * 带工具结果递归运行
   */
  async runWithToolResults(originalMessage, session, toolResults) {
    // 加载最新上下文（包括刚保存的用户消息）
    const context = await this.loadContext(session);
    
    // 构建工具结果消息（添加到最后）
    const toolResultContent = toolResults.map(r => {
      if (r.success) {
        return `[${r.name}] 结果：${JSON.stringify(r.result, null, 2)}`;
      } else {
        return `[${r.name}] 错误：${r.error}`;
      }
    }).join('\n\n');

    const systemPrompt = this.buildSystemPrompt(context);

    // 再次调用 LLM（带上工具结果）
    const response = await this.callLLMWithToolResults({
      systemPrompt,
      history: context.history,
      toolResultContent
    });

    // 保存 AI 响应
    await this.saveMessage(session, null, response.content);

    return {
      content: response.content,
      usage: response.usage,
      toolResults
    };
  }

  /**
   * 调用 LLM（带工具结果）
   */
  async callLLMWithToolResults({ systemPrompt, history, toolResultContent }) {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: `工具执行结果：\n${toolResultContent}\n\n请根据以上工具执行结果，给用户一个完整、清晰的回复。` }
    ];

    const response = await axios.post(
      BAILIAN_API_URL,
      {
        model: MODEL,
        messages: messages,
        max_tokens: 2000,
        temperature: 0.7
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BAILIAN_API_KEY}`
        },
        timeout: 30000
      }
    );

    return {
      content: response.data.choices[0].message.content,
      usage: response.data.usage
    };
  }

  /**
   * 保存消息
   */
  async saveMessage(session, userMessage, aiResponse) {
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // 只保存非空消息
    if (userMessage) {
      await db.query(
        'INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), session.id, 'user', userMessage, now]
      );
    }
    
    if (aiResponse) {
      await db.query(
        'INSERT INTO messages (id, session_id, role, content, created_at) VALUES (?, ?, ?, ?, ?)',
        [uuidv4(), session.id, 'assistant', aiResponse, now]
      );
    }
  }
}

module.exports = AgentLoop;
