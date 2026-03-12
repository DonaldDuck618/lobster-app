/**
 * 聊天服务
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

// 模拟会话存储
const sessions = new Map();
const messages = new Map();

class ChatService {
  /**
   * 发送消息
   */
  static async sendMessage({ userId, message, sessionId }) {
    // 创建或获取会话
    if (!sessionId) {
      sessionId = uuidv4();
      sessions.set(sessionId, {
        id: sessionId,
        userId,
        createdAt: new Date(),
        lastActiveAt: new Date()
      });
    }

    // 保存用户消息
    const userMessage = {
      id: uuidv4(),
      sessionId,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    if (!messages.has(sessionId)) {
      messages.set(sessionId, []);
    }
    messages.get(sessionId).push(userMessage);

    // TODO: 调用大模型 API
    // const response = await callLLM(message);
    
    // 模拟 AI 响应
    const aiResponse = {
      id: uuidv4(),
      sessionId,
      role: 'assistant',
      content: `收到你的消息："${message}"\n\n我正在处理中，稍后给你详细回复。`,
      timestamp: new Date()
    };

    messages.get(sessionId).push(aiResponse);

    // 更新会话时间
    const session = sessions.get(sessionId);
    session.lastActiveAt = new Date();

    logger.info('消息发送成功', { sessionId, userId });

    return {
      sessionId,
      message: userMessage,
      response: aiResponse
    };
  }

  /**
   * 分析 Excel
   */
  static async analyzeExcel({ userId, fileId, requirements }) {
    // TODO: 调用 Excel 分析工具
    // const result = await ExcelTool.analyze(fileId, requirements);

    // 模拟响应
    return {
      fileId,
      summary: {
        rows: 1234,
        columns: 15,
        totalSales: 5678900,
        growth: '+23.5%'
      },
      insights: [
        '3 月销售额环比增长 45%',
        '华东大区贡献 40% 销售额',
        'SKU-A001 为爆款，占比 15%'
      ],
      suggestions: [
        '加大华东区投入，保持增长势头',
        '关注异常订单，排查刷单风险',
        'SKU-A001 备货充足，避免断货'
      ]
    };
  }

  /**
   * 生成报告
   */
  static async generateReport({ userId, type, content }) {
    // TODO: 调用报告生成工具
    // const report = await ReportTool.generate(type, content);

    const templates = {
      weekly: '周报模板',
      daily: '日报模板',
      monthly: '月报模板'
    };

    return {
      type,
      template: templates[type],
      content: content || '请提供本周工作要点...',
      generatedAt: new Date()
    };
  }

  /**
   * 获取会话列表
   */
  static async getSessions(userId) {
    const userSessions = Array.from(sessions.values())
      .filter(s => s.userId === userId)
      .sort((a, b) => b.lastActiveAt - a.lastActiveAt);

    return userSessions.map(session => ({
      id: session.id,
      createdAt: session.createdAt,
      lastActiveAt: session.lastActiveAt,
      messageCount: messages.get(session.id)?.length || 0
    }));
  }

  /**
   * 删除会话
   */
  static async deleteSession(userId, sessionId) {
    const session = sessions.get(sessionId);
    
    if (!session) {
      const error = new Error('会话不存在');
      error.status = 404;
      throw error;
    }

    if (session.userId !== userId) {
      const error = new Error('无权删除此会话');
      error.status = 403;
      throw error;
    }

    sessions.delete(sessionId);
    messages.delete(sessionId);

    logger.info('会话已删除', { sessionId, userId });
  }

  /**
   * 获取会话消息
   */
  static async getMessages(sessionId) {
    return messages.get(sessionId) || [];
  }
}

module.exports = ChatService;
