/**
 * 用户路由
 */

const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// 所有接口需要认证
router.use(authMiddleware);

/**
 * GET /api/v1/users/me
 * 获取当前用户信息
 */
router.get('/me', async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // TODO: 从数据库获取用户信息
    res.json({
      success: true,
      data: {
        id: userId,
        ...req.user
      }
    });
  } catch (error) {
    logger.error('获取用户信息失败', error);
    res.status(500).json({
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/users/me
 * 更新用户信息
 */
router.put('/me', async (req, res) => {
  try {
    const userId = req.user.userId;
    const updates = req.body;
    
    // TODO: 更新数据库
    
    res.json({
      success: true,
      message: '用户信息已更新'
    });
  } catch (error) {
    logger.error('更新用户信息失败', error);
    res.status(500).json({
      error: error.message
    });
  }
});

module.exports = router;
