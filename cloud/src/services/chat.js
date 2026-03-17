const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const db = require('../models/database');
const AgentLoop = require('./agent-loop');

class ChatService {
  static async sendMessage({ userId, message, sessionId }) {
    // 创建新会话或获取现有会话
    if (!sessionId) {
      sessionId = uuidv4();
      const title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
      await db.query(
        'INSERT INTO sessions (id, user_id, title) VALUES (?, ?, ?)',
        [sessionId, userId, title]
      );
      logger.info('创建新会话', { sessionId, userId, title });
    } else {
      await db.query('UPDATE sessions SET updated_at = NOW() WHERE id = ? AND user_id = ?', [sessionId, userId]);
    }

    // 保存用户消息
    const messageId = uuidv4();
    await db.query(
      'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [messageId, sessionId, 'user', message]
    );

    // 使用 Agent Loop 处理对话
    const aiResponseId = uuidv4();
    let aiResponse;
    let toolUsage = null;
    
    try {
      const agent = new AgentLoop();
      const session = { id: sessionId, user_id: userId };
      const result = await agent.run(message, session);
      
      aiResponse = result.content;
      toolUsage = result.toolResults;
      
      logger.info('Agent Loop 回复成功', { 
        sessionId, 
        response_length: aiResponse.length,
        tools_used: toolUsage ? toolUsage.length : 0 
      });
    } catch (error) {
      logger.error('Agent Loop 失败', error);
      aiResponse = '抱歉，处理您的请求时遇到了问题，请稍后重试。';
    }
    
    await db.query(
      'INSERT INTO messages (id, session_id, role, content) VALUES (?, ?, ?, ?)',
      [aiResponseId, sessionId, 'assistant', aiResponse]
    );

    // 更新会话标题
    await db.query(
      'UPDATE sessions SET title = ? WHERE id = ? AND (title = \'新会话\' OR title IS NULL)',
      [message.substring(0, 50) + (message.length > 50 ? '...' : ''), sessionId]
    );

    return {
      sessionId,
      message: { id: messageId, sessionId, role: 'user', content: message, timestamp: new Date() },
      response: { id: aiResponseId, sessionId, role: 'assistant', content: aiResponse, timestamp: new Date() }
    };
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
    const sessions = await db.query('SELECT id FROM sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
    if (!sessions || sessions.length === 0) {
      throw Object.assign(new Error('会话不存在或无权访问'), { status: 404 });
    }

    const messages = await db.query(
      'SELECT id, session_id, role, content, created_at as timestamp FROM messages WHERE session_id = ? ORDER BY created_at ASC',
      [sessionId]
    );

    return messages.map(msg => ({
      id: msg.id,
      sessionId: msg.session_id,
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp
    }));
  }

  static async deleteSession(userId, sessionId) {
    const sessions = await db.query('SELECT id FROM sessions WHERE id = ? AND user_id = ?', [sessionId, userId]);
    if (!sessions || sessions.length === 0) {
      throw Object.assign(new Error('会话不存在'), { status: 404 });
    }

    await db.query('DELETE FROM messages WHERE session_id = ?', [sessionId]);
    await db.query('DELETE FROM sessions WHERE id = ?', [sessionId]);

    logger.info('会话已删除', { sessionId, userId });
  }
}

// 智能模拟回复（临时使用）
function generateSmartResponse(message) {
  const responses = {
    '你好': '你好！我是能虾助手，很高兴为您服务。有什么我可以帮助您的吗？',
    '介绍': '我是能虾助手，一个专业、友好、高效的 AI 助手。我擅长帮助用户解答问题、写作、分析、编程等。请问有什么我可以帮您的吗？',
    '你是谁': '我是能虾助手🦞，由龙虾助手团队开发的 AI 智能助手。我可以帮您完成各种任务，比如写作、分析、搜索、编程等。',
    '默认': '感谢您的消息！我正在学习中，目前还在测试阶段。如需更智能的回复，请配置有效的阿里云百炼 API Key。当前我可以帮您：1. 网络搜索 2. 文件处理 3. 数据分析 4. 基础对话。请问有什么可以帮您的？'
  };
  
  // 简单匹配
  for (const [key, value] of Object.entries(responses)) {
    if (message.includes(key)) {
      return value;
    }
  }
  
  return responses['默认'];
}

module.exports = ChatService;
