/**
 * 数据库连接
 * MySQL
 */

const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

let pool;

/**
 * 初始化数据库连接
 */
async function initializeDatabase() {
  try {
    const url = new URL(process.env.DATABASE_URL);
    
    pool = mysql.createPool({
      host: url.hostname,
      port: parseInt(url.port) || 3306,
      user: url.username,
      password: url.password,
      database: url.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 测试连接
    await testConnection();

    logger.info('✅ MySQL 数据库连接成功');
    
    return pool;
  } catch (error) {
    logger.error('❌ 数据库初始化失败', error);
    throw error;
  }
}

/**
 * 测试数据库连接
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.query('SELECT 1 AS connected');
    connection.release();
    logger.info('数据库连接测试成功');
  } catch (error) {
    logger.error('数据库连接测试失败', error);
    throw error;
  }
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
    const [result] = await pool.execute(text, params);
    const duration = Date.now() - start;
    logger.debug('数据库查询', { text, duration, rows: Array.isArray(result) ? result.length : 0 });
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
