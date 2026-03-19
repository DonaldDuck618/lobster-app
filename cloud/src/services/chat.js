/**
 * 聊天服务 - 集成技能系统
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const db = require('../models/database');
const { skillSystem } = require('./skill-system');

class ChatService {
  /**
   * 发送消息 - 支持技能调用
   */
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

    // 检查是否是技能调用
    const skillMatch = message.match(/^\/(\S+)\s*(.*)/);
    let aiResponse;
    
    if (skillMatch) {
      // 技能调用
      const skillName = skillMatch[1];
      const params = this.parseParams(skillMatch[2]);
      
      try {
        const result = await skillSystem.executeSkill(skillName, params);
        aiResponse = `✅ 技能执行成功:\n\n${JSON.stringify(result, null, 2)}`;
      } catch (error) {
        aiResponse = `❌ 技能执行失败:\n${error.message}`;
      }
    } else {
      // 普通对话 - 调用 AI
      aiResponse = await this.callAI(message, sessionId);
    }
    
    // 保存 AI 响应
    const aiResponseId = uuidv4();
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

  /**
   * 解析参数
   */
  static parseParams(paramsStr) {
    try {
      return JSON.parse(paramsStr);
    } catch {
      return { query: paramsStr };
    }
  }

  /**
   * 调用 AI
   */
  static async callAI(message, sessionId) {
    // TODO: 调用阿里云百炼 API
    return `收到你的消息："${message}"\n\n我正在处理中，稍后给你详细回复。`;
  }

  /**
   * 获取会话列表
   */
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

  /**
   * 获取会话消息
   */
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

  /**
   * 删除会话
   */
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

module.exports = ChatService;
