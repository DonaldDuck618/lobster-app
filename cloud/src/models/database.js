/**
 * 数据库连接
 * PostgreSQL
 */

const { Pool } = require('pg');
const logger = require('../utils/logger');
const config = require('../config');

let pool;

/**
 * 初始化数据库连接
 */
function initializeDatabase() {
  try {
    pool = new Pool({
      connectionString: config.database.url,
      max: config.database.pool.max,
      min: config.database.pool.min,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('connect', () => {
      logger.info('数据库连接成功');
    });

    pool.on('error', (err) => {
      logger.error('数据库连接错误', err);
    });

    // 测试连接
    testConnection();

    return pool;
  } catch (error) {
    logger.error('数据库初始化失败', error);
    // 开发模式下使用内存存储
    if (process.env.NODE_ENV === 'development') {
      logger.warn('使用内存存储模式');
      return createMemoryStore();
    }
    throw error;
  }
}

/**
 * 测试数据库连接
 */
async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✅ 数据库连接测试成功');
  } catch (error) {
    logger.error('❌ 数据库连接测试失败', error);
  }
}

/**
 * 内存存储 (开发模式 fallback)
 */
function createMemoryStore() {
  const store = {
    users: new Map(),
    sessions: new Map(),
    messages: new Map(),
    files: new Map(),
    subscriptions: new Map(),
    orders: new Map()
  };

  return {
    query: async (text, params) => {
      // 模拟简单的 SQL 操作
      logger.debug('内存存储查询', { text, params });
      return { rows: [] };
    },
    connect: async () => ({
      query: async () => ({ rows: [] }),
      release: () => {}
    }),
    end: async () => {
      logger.info('内存存储已关闭');
    },
    _store: store // 直接访问存储
  };
}

/**
 * 执行查询
 */
async function query(text, params) {
  if (!pool) {
    throw new Error('数据库未初始化');
  }
  
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('数据库查询', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    logger.error('数据库查询失败', { text, error: error.message });
    throw error;
  }
}

/**
 * 获取数据库连接池
 */
function getPool() {
  return pool;
}

/**
 * 关闭数据库连接
 */
async function closeDatabase() {
  if (pool) {
    await pool.end();
    logger.info('数据库连接已关闭');
  }
}

module.exports = {
  initializeDatabase,
  query,
  getPool,
  closeDatabase,
  testConnection
};
