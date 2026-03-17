/**
 * 记忆服务
 * 
 * 管理用户记忆、偏好和对话历史
 */

const MemoryModel = require('../models/memory');
const logger = require('../utils/logger');

class MemoryService {
  /**
   * 初始化记忆系统
   */
  static async initialize() {
    await MemoryModel.createTable();
    logger.info('记忆系统初始化完成');
  }

  /**
   * 记录重要记忆
   */
  static async recordMemory({ userId, type, category, content, importance = 1 }) {
    try {
      const memory = await MemoryModel.saveMemory({
        userId,
        type,
        category,
        content,
        importance
      });
      logger.info('记忆已记录', { userId, type, category });
      return memory;
    } catch (error) {
      logger.error('记录记忆失败', error);
      throw error;
    }
  }

  /**
   * 获取用户记忆
   */
  static async getMemories({ userId, type, category, limit = 50 }) {
    try {
      return await MemoryModel.getMemories({ userId, type, category, limit });
    } catch (error) {
      logger.error('获取记忆失败', error);
      return [];
    }
  }

  /**
   * 搜索记忆
   */
  static async searchMemories({ userId, query, limit = 20 }) {
    try {
      return await MemoryModel.searchMemories({ userId, query, limit });
    } catch (error) {
      logger.error('搜索记忆失败', error);
      return [];
    }
  }

  /**
   * 保存用户偏好
   */
  static async savePreferences(userId, preferences) {
    try {
      await MemoryModel.savePreferences(userId, preferences);
      logger.info('用户偏好已保存', { userId });
    } catch (error) {
      logger.error('保存偏好失败', error);
      throw error;
    }
  }

  /**
   * 获取用户偏好
   */
  static async getPreferences(userId) {
    try {
      return await MemoryModel.getPreferences(userId);
    } catch (error) {
      logger.error('获取偏好失败', error);
      return {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        theme: 'light',
        notificationsEnabled: true,
        customSettings: {}
      };
    }
  }

  /**
   * 记录对话（自动保存到短期记忆）
   */
  static async recordConversation({ userId, sessionId, role, content }) {
    try {
      // 估算 token 数（中文约 1.5 字符/token）
      const tokens = Math.ceil(content.length / 1.5);
      
      await MemoryModel.saveConversationHistory({
        userId,
        sessionId,
        role,
        content,
        tokens
      });

      // 定期清理旧历史
      if (Math.random() < 0.1) { // 10% 概率清理
        await MemoryModel.cleanupOldHistory(userId);
      }
    } catch (error) {
      logger.error('记录对话失败', error);
    }
  }

  /**
   * 获取对话历史
   */
  static async getConversationHistory({ userId, sessionId, limit = 50 }) {
    try {
      return await MemoryModel.getConversationHistory({ userId, sessionId, limit });
    } catch (error) {
      logger.error('获取对话历史失败', error);
      return [];
    }
  }

  /**
   * 获取用户记忆摘要
   */
  static async getMemorySummary(userId) {
    try {
      const stats = await MemoryModel.getMemoryStats(userId);
      const preferences = await this.getPreferences(userId);
      const recentMemories = await this.getMemories({ userId, limit: 10 });

      return {
        stats,
        preferences,
        recentMemories,
        hasMemory: stats.totalMemories > 0 || stats.totalConversations > 0
      };
    } catch (error) {
      logger.error('获取记忆摘要失败', error);
      return null;
    }
  }

  /**
   * 智能记忆（从对话中提取重要信息）
   */
  static async intelligentRecord({ userId, sessionId, content, role }) {
    // 只记录用户的重要信息
    if (role !== 'user') return;

    // 检测是否是重要信息
    const importantPatterns = [
      /我叫 (?:为)?([^\s,，.]+)/,  // 姓名
      /我喜欢 (?:欢)?([^\s,，.]+)/,  // 偏好
      /我住在 (?:在)?([^\s,，.]+)/,  // 地址
      /我工作 (?:在)?([^\s,，.]+)/,  // 工作
      /我的 (?:的)?([^\s,，.]+) 是/  // 个人信息
    ];

    for (const pattern of importantPatterns) {
      const match = content.match(pattern);
      if (match) {
        await this.recordMemory({
          userId,
          type: 'preference',
          category: 'personal',
          content: content,
          importance: 3
        });
        break;
      }
    }
  }
}

module.exports = MemoryService;
