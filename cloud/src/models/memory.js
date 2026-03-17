/**
 * 用户记忆模型
 * 
 * 存储用户偏好、习惯和重要记忆
 */

const db = require('./database');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class MemoryModel {
  /**
   * 创建记忆表
   */
  static async createTable() {
    // 用户记忆表
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_memories (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        type VARCHAR(20),
        category VARCHAR(50),
        content TEXT,
        importance TINYINT DEFAULT 1,
        expires_at DATETIME,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id),
        INDEX idx_type (type),
        INDEX idx_category (category)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 用户偏好表
    await db.query(`
      CREATE TABLE IF NOT EXISTS user_preferences (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) UNIQUE,
        language VARCHAR(10) DEFAULT 'zh-CN',
        timezone VARCHAR(50) DEFAULT 'Asia/Shanghai',
        theme VARCHAR(20) DEFAULT 'light',
        notifications_enabled TINYINT DEFAULT 1,
        custom_settings JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 对话历史表（短期记忆）
    await db.query(`
      CREATE TABLE IF NOT EXISTS conversation_history (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36),
        session_id VARCHAR(36),
        role VARCHAR(20),
        content TEXT,
        tokens INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_session (user_id, session_id),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    logger.info('记忆系统表初始化完成');
  }

  /**
   * 保存用户记忆
   */
  static async saveMemory({ userId, type, category, content, importance = 1, expiresAt = null }) {
    const id = uuidv4();
    await db.query(
      'INSERT INTO user_memories (id, user_id, type, category, content, importance, expires_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, type, category, content, importance, expiresAt]
    );
    logger.info('用户记忆已保存', { userId, type, category });
    return { id, userId, type, category, content, importance };
  }

  /**
   * 获取用户记忆
   */
  static async getMemories({ userId, type, category, limit = 50 }) {
    let sql = 'SELECT * FROM user_memories WHERE user_id = ? AND (expires_at IS NULL OR expires_at > NOW())';
    const params = [userId];

    if (type) {
      sql += ' AND type = ?';
      params.push(type);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    sql += ' ORDER BY importance DESC, created_at DESC LIMIT ?';
    params.push(limit);

    const rows = await db.query(sql, params);
    return rows;
  }

  /**
   * 搜索记忆
   */
  static async searchMemories({ userId, query, limit = 20 }) {
    const rows = await db.query(
      'SELECT * FROM user_memories WHERE user_id = ? AND content LIKE ? AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY importance DESC LIMIT ?',
      [userId, `%${query}%`, limit]
    );
    return rows;
  }

  /**
   * 删除记忆
   */
  static async deleteMemory(memoryId, userId) {
    await db.query('DELETE FROM user_memories WHERE id = ? AND user_id = ?', [memoryId, userId]);
  }

  /**
   * 保存用户偏好
   */
  static async savePreferences(userId, preferences) {
    const id = uuidv4();
    const { language = 'zh-CN', timezone = 'Asia/Shanghai', theme = 'light', notificationsEnabled = 1, customSettings = {} } = preferences;

    await db.query(
      `INSERT INTO user_preferences (id, user_id, language, timezone, theme, notifications_enabled, custom_settings) 
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE 
         language = VALUES(language),
         timezone = VALUES(timezone),
         theme = VALUES(theme),
         notifications_enabled = VALUES(notifications_enabled),
         custom_settings = VALUES(custom_settings)`,
      [id, userId, language, timezone, theme, notificationsEnabled, JSON.stringify(customSettings)]
    );

    logger.info('用户偏好已保存', { userId });
  }

  /**
   * 获取用户偏好
   */
  static async getPreferences(userId) {
    const rows = await db.query('SELECT * FROM user_preferences WHERE user_id = ?', [userId]);
    if (!rows || rows.length === 0) {
      // 返回默认偏好
      return {
        language: 'zh-CN',
        timezone: 'Asia/Shanghai',
        theme: 'light',
        notificationsEnabled: true,
        customSettings: {}
      };
    }
    const pref = rows[0];
    return {
      ...pref,
      notificationsEnabled: !!pref.notifications_enabled,
      customSettings: pref.custom_settings ? JSON.parse(pref.custom_settings) : {}
    };
  }

  /**
   * 保存对话历史（短期记忆）
   */
  static async saveConversationHistory({ userId, sessionId, role, content, tokens = 0 }) {
    const id = uuidv4();
    await db.query(
      'INSERT INTO conversation_history (id, user_id, session_id, role, content, tokens) VALUES (?, ?, ?, ?, ?, ?)',
      [id, userId, sessionId, role, content, tokens]
    );
  }

  /**
   * 获取对话历史
   */
  static async getConversationHistory({ userId, sessionId, limit = 50 }) {
    let sql = 'SELECT * FROM conversation_history WHERE user_id = ?';
    const params = [userId];

    if (sessionId) {
      sql += ' AND session_id = ?';
      params.push(sessionId);
    }

    sql += ' ORDER BY created_at ASC LIMIT ?';
    params.push(limit);

    return await db.query(sql, params);
  }

  /**
   * 清理过期的对话历史（保留最近 7 天）
   */
  static async cleanupOldHistory(userId) {
    await db.query(
      'DELETE FROM conversation_history WHERE user_id = ? AND created_at < DATE_SUB(NOW(), INTERVAL 7 DAY)',
      [userId]
    );
  }

  /**
   * 获取记忆统计
   */
  static async getMemoryStats(userId) {
    const [memories] = await db.query('SELECT COUNT(*) as count FROM user_memories WHERE user_id = ?', [userId]);
    const [conversations] = await db.query('SELECT COUNT(*) as count FROM conversation_history WHERE user_id = ?', [userId]);
    const [tokens] = await db.query('SELECT SUM(tokens) as total FROM conversation_history WHERE user_id = ?', [userId]);

    return {
      totalMemories: memories?.count || 0,
      totalConversations: conversations?.count || 0,
      totalTokens: tokens?.total || 0
    };
  }
}

module.exports = MemoryModel;
