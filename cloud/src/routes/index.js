/**
 * API 路由
 */

const express = require('express');
const router = express.Router();

// 导入各模块路由
const authRoutes = require('./auth');
const chatRoutes = require('./chat');
const fileRoutes = require('./files');
const toolRoutes = require('./tools');
const paymentRoutes = require('./payment');
const visionRoutes = require('./vision');
const audioRoutes = require('./audio');

// 注册路由
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/files', fileRoutes);
router.use('/tools', toolRoutes);
router.use('/payment', paymentRoutes);
router.use('/vision', visionRoutes);
router.use('/audio', audioRoutes);

// API 文档
router.get('/', (req, res) => {
  res.json({
    name: '🦞 赚好多能虾助手 API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/v1/auth',
      chat: '/api/v1/chat',
      files: '/api/v1/files',
      tools: '/api/v1/tools',
      payment: '/api/v1/payment',
      vision: '/api/v1/vision',
      audio: '/api/v1/audio'
    },
    docs: 'https://github.com/DonaldDuck618/lobster-app'
  });
});

module.exports = router;
