/**
 * API 路由
 */

const express = require('express');
const router = express.Router();

// 导入各模块路由
const authRoutes = require('./auth');
const chatRoutes = require('./chat');
const fileRoutes = require('./files');
const userRoutes = require('./users');
const toolRoutes = require('./tools');
const cronRoutes = require('./cron');
const paymentRoutes = require('./payment');

// 注册路由
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/files', fileRoutes);
router.use('/users', userRoutes);
router.use('/tools', toolRoutes);
router.use('/cron', cronRoutes);
router.use('/payment', paymentRoutes);

// API 文档
router.get('/', (req, res) => {
  res.json({
    name: '🦞 能虾助手 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      chat: '/api/v1/chat',
      files: '/api/v1/files',
      users: '/api/v1/users',
      tools: '/api/v1/tools',
      cron: '/api/v1/cron',
      payment: '/api/v1/payment'
    },
    docs: 'https://github.com/DonaldDuck618/lobster-app'
  });
});

module.exports = router;

// 更新 API 文档，添加 tools 端点详情
router.get('/', (req, res) => {
  res.json({
    name: '🦞 龙虾 Agent API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      chat: '/api/v1/chat',
      files: '/api/v1/files',
      users: '/api/v1/users',
      tools: '/api/v1/tools',
      cron: '/api/v1/cron',
      payment: '/api/v1/payment',
      vision: '/api/v1/vision',
      audio: '/api/v1/audio'
    },
    docs: 'https://github.com/DonaldDuck618/lobster-app'
  });
});
