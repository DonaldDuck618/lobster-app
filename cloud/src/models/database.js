/**
 * 数据库连接
 * MySQL + 内存降级
 */

const logger = require('../utils/logger');

let pool = null;
let mysql = null;

// 尝试加载 mysql2
try {
  mysql = require('mysql2/promise');
} catch (e) {
  logger.warn('mysql2 模块未安装，将使用内存数据库模式');
}

let memoryDB = {
  users: [],
  verification_codes: [],
  sessions: [],
  messages: []
};

// 内存模式标志
let useMemoryMode = false;

/**
 * 初始化数据库连接
 */
async function initializeDatabase() {
  // 如果没有配置数据库或没有 mysql2 模块，使用内存模式
  if (!process.env.DATABASE_URL || !mysql) {
    logger.warn('⚠️ 使用内存数据库模式');
    useMemoryMode = true;
    
    // 添加测试用户（使用预计算的 bcrypt 哈希）
    // 密码: Wujian886+
    // 使用 bcryptjs 生成的哈希
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('Wujian886+', 10);
    
    memoryDB.users.push({
      id: 'user-001',
      phone: '17724620007',
      password_hash: hashedPassword,
      nickname: '测试用户',
      phone_verified: 1,
      status: 'active',
      created_at: new Date().toISOString()
    });
    
    logger.info('✅ 内存数据库初始化完成');
    logger.info('测试账号: 17724620007 / Wujian886+');
    logger.info('密码哈希:', hashedPassword);
    return;
  }

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
    logger.error('❌ 数据库初始化失败，切换到内存模式', error);
    useMemoryMode = true;
    logger.info('✅ 内存数据库初始化完成');
  }
}

/**
 * 测试数据库连接
 */
async function testConnection() {
  if (!pool) return;
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
  // 内存模式
  if (useMemoryMode) {
    return memoryQuery(text, params);
  }
  
  // MySQL 模式
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
 * 内存查询模拟
 */
async function memoryQuery(text, params) {
  logger.debug('内存查询', { text, params });
  
  // 解析 SQL 语句
  const sql = text.toLowerCase();
  
  // SELECT 查询
  if (sql.includes('select')) {
    // users 表查询
    if (sql.includes('from users')) {
      if (sql.includes('where phone =')) {
        const phone = params[0];
        return memoryDB.users.filter(u => u.phone === phone);
      }
      if (sql.includes('where id =')) {
        const id = params[0];
        return memoryDB.users.filter(u => u.id === id);
      }
      return memoryDB.users;
    }
    
    // verification_codes 表查询
    if (sql.includes('from verification_codes')) {
      return memoryDB.verification_codes.filter(vc => {
        if (params.length >= 2) {
          return (vc.phone === params[0] || vc.email === params[0]) && vc.code === params[1];
        }
        return true;
      });
    }
    
    // sessions 表查询
    if (sql.includes('from sessions')) {
      if (sql.includes('where user_id =')) {
        const userId = params[0];
        return memoryDB.sessions.filter(s => s.user_id === userId);
      }
      return memoryDB.sessions;
    }
    
    // messages 表查询
    if (sql.includes('from messages')) {
      if (sql.includes('where session_id =')) {
        const sessionId = params[0];
        return memoryDB.messages.filter(m => m.session_id === sessionId);
      }
      return memoryDB.messages;
    }
    
    return [];
  }
  
  // INSERT 插入
  if (sql.includes('insert into')) {
    if (sql.includes('users')) {
      const newUser = {
        id: params[0],
        phone: params[1] || null,
        email: params[2] || null,
        password_hash: params[3],
        nickname: params[4],
        phone_verified: params[5] || 0,
        status: params[6] || 'active',
        created_at: new Date().toISOString()
      };
      memoryDB.users.push(newUser);
      return { insertId: newUser.id, affectedRows: 1 };
    }
    
    if (sql.includes('verification_codes')) {
      const newCode = {
        id: params[0],
        phone: params[1],
        email: params[2],
        code: params[3],
        type: params[4],
        expires_at: params[5],
        verified: 0,
        created_at: new Date().toISOString()
      };
      memoryDB.verification_codes.push(newCode);
      return { insertId: newCode.id, affectedRows: 1 };
    }
    
    if (sql.includes('sessions')) {
      const newSession = {
        id: params[0],
        user_id: params[1],
        title: params[2],
        created_at: new Date().toISOString()
      };
      memoryDB.sessions.push(newSession);
      return { insertId: newSession.id, affectedRows: 1 };
    }
    
    if (sql.includes('messages')) {
      const newMessage = {
        id: params[0],
        session_id: params[1],
        role: params[2],
        content: params[3],
        created_at: new Date().toISOString()
      };
      memoryDB.messages.push(newMessage);
      return { insertId: newMessage.id, affectedRows: 1 };
    }
    
    return { affectedRows: 1 };
  }
  
  // UPDATE 更新
  if (sql.includes('update')) {
    if (sql.includes('verification_codes')) {
      const id = params[params.length - 1];
      const code = memoryDB.verification_codes.find(vc => vc.id === id);
      if (code) {
        code.verified = 1;
      }
      return { affectedRows: 1 };
    }
    return { affectedRows: 1 };
  }
  
  return [];
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
