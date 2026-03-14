/**
 * MySQL 数据库迁移脚本
 */

const mysql = require('mysql2/promise');
const logger = require('../src/utils/logger');

const config = {
  host: 'rm-wz9l573lf3bo3q8d5.mysql.rds.aliyuncs.com',
  user: 'root',
  password: 'Lobster2026!RDS',
  database: 'lobster_app'
};

async function runMigrations() {
  let connection;
  
  try {
    logger.info('开始 MySQL 数据库迁移...');
    
    connection = await mysql.createConnection(config);
    logger.info('MySQL 连接成功');
    
    // 1. 创建 users 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        phone VARCHAR(20) UNIQUE,
        email VARCHAR(255) UNIQUE,
        password_hash VARCHAR(255),
        nickname VARCHAR(100),
        avatar_url VARCHAR(500),
        wechat_openid VARCHAR(100),
        wechat_unionid VARCHAR(100),
        phone_verified BOOLEAN DEFAULT FALSE,
        email_verified BOOLEAN DEFAULT FALSE,
        last_login_at TIMESTAMP,
        last_login_ip VARCHAR(50),
        status VARCHAR(20) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_phone (phone),
        INDEX idx_email (email),
        INDEX idx_wechat_openid (wechat_openid)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✅ users 表创建成功');
    
    // 2. 创建 sessions 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        title VARCHAR(255),
        type VARCHAR(50) DEFAULT 'chat',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_active_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        is_deleted BOOLEAN DEFAULT FALSE,
        INDEX idx_user_id (user_id),
        INDEX idx_last_active (last_active_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✅ sessions 表创建成功');
    
    // 3. 创建 messages 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id VARCHAR(36) PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL,
        role VARCHAR(20) NOT NULL,
        content TEXT NOT NULL,
        model VARCHAR(100),
        tokens INT,
        cost DECIMAL(10,6),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_session_id (session_id),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✅ messages 表创建成功');
    
    // 4. 创建 files 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS files (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        filename VARCHAR(255) NOT NULL,
        original_name VARCHAR(255),
        mime_type VARCHAR(100),
        size INT NOT NULL,
        storage_path VARCHAR(500),
        storage_url VARCHAR(500),
        status VARCHAR(20) DEFAULT 'uploaded',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✅ files 表创建成功');
    
    // 5. 创建 subscriptions 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        plan_id VARCHAR(50) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'CNY',
        period VARCHAR(20),
        status VARCHAR(20) DEFAULT 'pending',
        start_date TIMESTAMP NULL,
        end_date TIMESTAMP NULL,
        auto_renew BOOLEAN DEFAULT TRUE,
        payment_method VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✅ subscriptions 表创建成功');
    
    // 6. 创建 orders 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        subscription_id VARCHAR(36),
        plan_id VARCHAR(50) NOT NULL,
        plan_name VARCHAR(100) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR(10) DEFAULT 'CNY',
        payment_method VARCHAR(50),
        status VARCHAR(20) DEFAULT 'pending',
        transaction_id VARCHAR(255),
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_user_id (user_id),
        INDEX idx_status (status),
        INDEX idx_created_at (created_at),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✅ orders 表创建成功');
    
    // 7. 创建 usage_stats 表
    await connection.query(`
      CREATE TABLE IF NOT EXISTS usage_stats (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        date DATE NOT NULL,
        model VARCHAR(100),
        input_tokens INT DEFAULT 0,
        output_tokens INT DEFAULT 0,
        total_tokens INT DEFAULT 0,
        cost DECIMAL(10,6) DEFAULT 0,
        api_calls INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_user_date_model (user_id, date, model),
        INDEX idx_user_id (user_id),
        INDEX idx_date (date),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);
    logger.info('✅ usage_stats 表创建成功');
    
    logger.info('🎉 数据库迁移完成！');
    
    // 显示所有表
    const [tables] = await connection.query('SHOW TABLES');
    logger.info('已创建的表:');
    tables.forEach(table => {
      logger.info(`  - ${Object.values(table)[0]}`);
    });
    
  } catch (error) {
    logger.error('数据库迁移失败', error);
    throw error;
  } finally {
    if (connection) {
      await connection.end();
      logger.info('数据库连接已关闭');
    }
  }
}

// 运行迁移
runMigrations()
  .then(() => {
    logger.info('迁移成功完成');
    process.exit(0);
  })
  .catch((error) => {
    logger.error('迁移失败', error);
    process.exit(1);
  });
