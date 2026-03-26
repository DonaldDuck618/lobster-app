/**
 * 聊天服务 - 支持多轮对话
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const db = require('../models/database');
const { skillSystem } = require('./skill-system');

class ChatService {
  static async sendMessage({ userId, message, sessionId, context }) {
    try {
      // 创建新会话
      if (!sessionId) {
        sessionId = uuidv4();
        const title = message.substring(0, 50);
        await db.query(
          'INSERT INTO sessions (id, user_id, title) VALUES (?, ?, ?)',
          [sessionId, userId, title]
        );
      }

      // 保存用户消息
      const messageId = uuidv4();
      await db.query(
        'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
        [messageId, sessionId, 'user', message]
      );

      // 调用 AI（传入 sessionId 以支持多轮对话）
      let aiResponse;
      try {
        aiResponse = await this.callAI(message, sessionId, context);
      } catch (error) {
        logger.error('AI 调用失败:', error.message);
        aiResponse = '抱歉，处理失败，请重试。错误：' + error.message;
      }

      // 保存 AI 响应
      const aiResponseId = uuidv4();
      await db.query(
        'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
        [aiResponseId, sessionId, 'assistant', aiResponse]
      );

      return {
        sessionId,
        message: { id: messageId, role: 'user', content: message },
        response: { id: aiResponseId, role: 'assistant', content: aiResponse }
      };
    } catch (error) {
      logger.error('发送消息失败:', error);
      throw error;
    }
  }

  static async callAI(message, sessionId, context = null) {
    const apiKey = process.env.DASHSCOPE_API_KEY || process.env.BAILIAN_API_KEY;
    const model = process.env.DASHSCOPE_MODEL || process.env.BAILIAN_MODEL || 'qwen3.5-plus';
    const baseUrl = process.env.DASHSCOPE_BASE_URL || 'https://coding.dashscope.aliyuncs.com/v1';

    logger.info('调用阿里云百炼', { model, sessionId, hasContext: !!context });

    // 构建系统提示
    const now = new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false });
    let systemContent = '你是赚好多能虾助手，一个专业、友好的 AI 助手。当前时间是：' + now + '（中国上海时间）。请基于这个确切时间回答用户的问题。';
    
    // Excel 上下文
    if (context && context.type === 'excel') {
      systemContent += `\n\n用户刚刚上传了一个 Excel 文件"${context.fileName}"，数据摘要如下:\n${context.summary}\n\n如果用户的问题与这个 Excel 相关，请基于上述数据进行分析回答。`;
    }

    // WebSearch 上下文
    if (context && context.enableSearch) {
      // 注意：实际搜索逻辑需要在路由层或单独的服务中实现
      // 这里只是预留支持
      logger.info('WebSearch 已启用');
    }

    // 获取历史对话（最近 10 条）
    let conversationHistory = [];
    if (sessionId) {
      try {
        const history = await this.getSessionMessages(sessionId, null);
        // 只取最近 10 条消息作为上下文
        const recentHistory = history.slice(-10);
        conversationHistory = recentHistory.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        logger.info(`加载历史对话：${conversationHistory.length} 条`);
      } catch (error) {
        logger.warn('加载历史对话失败:', error.message);
      }
    }

    // 构建完整消息列表
    const messages = [
      { role: 'system', content: systemContent },
      ...conversationHistory,
      { role: 'user', content: message }
    ];

    logger.info(`发送 ${messages.length} 条消息到 AI（1 system + ${conversationHistory.length} history + 1 user）`);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API 请求失败 (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content;
    }
    
    throw new Error('API 返回格式异常');
  }

  static async getSessions(userId) {
    const rows = await db.query(
      'SELECT id, title, created_at, updated_at FROM sessions WHERE user_id = ? ORDER BY updated_at DESC LIMIT 50',
      [userId]
    );
    return rows.map(row => ({
      id: row.id,
      title: row.title || '新对话',
      createdAt: row.created_at,
      lastActiveAt: row.updated_at
    }));
  }

  static async getSessionMessages(sessionId, userId) {
    let query;
    let params;
    
    if (userId) {
      // 验证用户权限
      const [sessions] = await db.query('SELECT id FROM sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
      if (!sessions || sessions.length === 0) {
        throw Object.assign(new Error('会话不存在'), { status: 404 });
      }
      query = 'SELECT id, session_id, role, content, created_at as timestamp FROM messages WHERE session_id = ? ORDER BY created_at ASC';
      params = [sessionId];
    } else {
      // 内部调用，不需要验证用户
      query = 'SELECT id, session_id, role, content, created_at as timestamp FROM messages WHERE session_id = ? ORDER BY created_at ASC';
      params = [sessionId];
    }

    const [messages] = await db.query(query, params);

    return messages.map(msg => ({
      id: msg.id,
      sessionId: msg.session_id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }

  static async deleteSession(userId, sessionId) {
    await db.query('DELETE FROM messages WHERE session_id = ?', [sessionId]);
    await db.query('DELETE FROM sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
  }
}

module.exports = ChatService;
