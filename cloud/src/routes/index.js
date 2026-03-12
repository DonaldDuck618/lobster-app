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

// 注册路由
router.use('/auth', authRoutes);
router.use('/chat', chatRoutes);
router.use('/files', fileRoutes);
router.use('/users', userRoutes);
router.use('/tools', toolRoutes);
router.use('/cron', cronRoutes);

// API 文档
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
      cron: '/api/v1/cron'
    },
    docs: 'https://github.com/DonaldDuck618/lobster-app'
  });
});

module.exports = router;
