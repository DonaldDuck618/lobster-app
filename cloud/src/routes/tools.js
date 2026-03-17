/**
 * Web Search 路由
 * 
 * 提供网页搜索功能
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const WebSearchService = require('../services/web-search');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * POST /api/v1/tools/search
 * 网页搜索
 */
router.post('/search', authMiddleware, [
  body('query')
    .notEmpty().withMessage('搜索关键词不能为空')
    .isString().withMessage('搜索关键词必须是字符串')
    .trim()
    .isLength({ min: 1, max: 500 }).withMessage('搜索关键词长度必须在 1-500 字符之间'),
  body('count')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('结果数量必须在 1-10 之间'),
  body('searchDepth')
    .optional()
    .isIn(['basic', 'advanced']).withMessage('搜索深度必须是 basic 或 advanced'),
  body('includeAnswer')
    .optional()
    .isBoolean().withMessage('includeAnswer 必须是布尔值')
], async (req, res) => {
  try {
    // 验证参数
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // 提取参数
    const {
      query,
      count = 5,
      searchDepth = 'basic',
      includeAnswer = false,
      includeDomains = [],
      excludeDomains = []
    } = req.body;

    logger.info('网页搜索请求', { 
      userId: req.user.userId, 
      query, 
      count, 
      searchDepth 
    });

    // 执行搜索
    const results = await WebSearchService.search({
      query,
      count,
      searchDepth,
      includeAnswer,
      includeDomains,
      excludeDomains
    });

    res.json({
      success: true,
      data: results,
      message: '搜索成功'
    });

  } catch (error) {
    logger.error('网页搜索失败', error);
    res.status(error.status || 500).json({
      error: error.name || 'Search Error',
      message: error.message || '搜索失败'
    });
  }
});

/**
 * GET /api/v1/tools/search/stats
 * 获取搜索使用统计
 */
router.get('/search/stats', authMiddleware, async (req, res) => {
  try {
    const stats = WebSearchService.getUsageStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    logger.error('获取统计信息失败', error);
    res.status(500).json({
      error: 'Stats Error',
      message: error.message
    });
  }
});

/**
 * POST /api/v1/tools/search/reset-limit
 * 重置限流计数（管理员功能）
 */
router.post('/search/reset-limit', authMiddleware, async (req, res) => {
  try {
    // TODO: 添加管理员权限检查
    WebSearchService.resetRateLimit();
    
    logger.info('搜索限流已重置', { userId: req.user.userId });
    
    res.json({
      success: true,
      message: '限流已重置'
    });
  } catch (error) {
    logger.error('重置限流失败', error);
    res.status(500).json({
      error: 'Reset Error',
      message: error.message
    });
  }
});

module.exports = router;
