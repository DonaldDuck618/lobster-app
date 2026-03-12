/**
 * 🦞 龙虾 Agent - 云侧 Gateway 服务
 * 
 * 主入口文件
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const ws = require('ws');
const cron = require('node-cron');

const logger = require('./utils/logger');
const config = require('./config');
const routes = require('./routes');
const WebSocketServer = require('./services/websocket');
const { initializeCronJobs } = require('./services/cron');
const { initializeDatabase } = require('./models/database');
const { initializeRedis } = require('./services/redis');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet()); // 安全头
app.use(cors()); // 跨域
app.use(compression()); // 压缩
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 日志中间件
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('user-agent')
  });
  next();
});

// 路由
app.use('/api/v1', routes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'lobster-gateway',
    version: '1.0.0'
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.name || 'Internal Server Error',
    message: err.message || '服务器内部错误'
  });
});

// 启动服务器
const server = app.listen(PORT, () => {
  logger.info(`🦞 龙虾 Gateway 启动成功`, {
    port: PORT,
    env: process.env.NODE_ENV
  });
  
  // 初始化数据库
  initializeDatabase();
  
  // 初始化 Redis
  initializeRedis();
  
  // 初始化 WebSocket
  const wss = new WebSocketServer(server);
  
  // 初始化定时任务
  initializeCronJobs();
  
  logger.info('✅ 所有服务初始化完成');
});

// 优雅关闭
process.on('SIGTERM', () => {
  logger.info('收到 SIGTERM 信号，正在关闭服务...');
  server.close(() => {
    logger.info('服务已关闭');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('收到 SIGINT 信号，正在关闭服务...');
  server.close(() => {
    logger.info('服务已关闭');
    process.exit(0);
  });
});

module.exports = app;
