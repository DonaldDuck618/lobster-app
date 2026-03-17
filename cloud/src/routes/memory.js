/**
 * 记忆系统路由
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const MemoryService = require('../services/memory');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// 所有接口需要认证
router.use(authMiddleware);

/**
 * POST /api/v1/memory/record
 * 记录记忆
 */
router.post('/record', [
  body('type').notEmpty().withMessage('记忆类型不能为空'),
  body('content').notEmpty().withMessage('记忆内容不能为空'),
  body('category').optional(),
  body('importance').optional().isInt({ min: 1, max: 5 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { type, category, content, importance = 1 } = req.body;
    const userId = req.user.userId;

    const memory = await MemoryService.recordMemory({
      userId,
      type,
      category,
      content,
      importance
    });

    res.json({
      success: true,
      data: memory,
      message: '记忆已保存'
    });
  } catch (error) {
    logger.error('记录记忆失败', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/memory
 * 获取记忆列表
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { type, category, limit = 50 } = req.query;

    const memories = await MemoryService.getMemories({
      userId,
      type,
      category,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: memories,
      total: memories.length
    });
  } catch (error) {
    logger.error('获取记忆失败', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/memory/search
 * 搜索记忆
 */
router.get('/search', [
  query('q').notEmpty().withMessage('搜索关键词不能为空')
], async (req, res) => {
  try {
    const userId = req.user.userId;
    const { q, limit = 20 } = req.query;

    const memories = await MemoryService.searchMemories({
      userId,
      query: q,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: memories,
      total: memories.length
    });
  } catch (error) {
    logger.error('搜索记忆失败', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/memory/preferences
 * 获取用户偏好
 */
router.get('/preferences', async (req, res) => {
  try {
    const userId = req.user.userId;
    const preferences = await MemoryService.getPreferences(userId);

    res.json({
      success: true,
      data: preferences
    });
  } catch (error) {
    logger.error('获取偏好失败', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/v1/memory/preferences
 * 更新用户偏好
 */
router.put('/preferences', [
  body('language').optional().isString(),
  body('timezone').optional().isString(),
  body('theme').optional().isIn(['light', 'dark']),
  body('notificationsEnabled').optional().isBoolean(),
  body('customSettings').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.userId;
    const preferences = req.body;

    await MemoryService.savePreferences(userId, preferences);

    const updated = await MemoryService.getPreferences(userId);

    res.json({
      success: true,
      data: updated,
      message: '偏好已更新'
    });
  } catch (error) {
    logger.error('更新偏好失败', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/memory/history
 * 获取对话历史
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { sessionId, limit = 50 } = req.query;

    const history = await MemoryService.getConversationHistory({
      userId,
      sessionId,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: history,
      total: history.length
    });
  } catch (error) {
    logger.error('获取对话历史失败', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/memory/summary
 * 获取记忆摘要
 */
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user.userId;
    const summary = await MemoryService.getMemorySummary(userId);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    logger.error('获取记忆摘要失败', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/v1/memory/:memoryId
 * 删除记忆
 */
router.delete('/:memoryId', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { memoryId } = req.params;

    await MemoryModel.deleteMemory(memoryId, userId);

    res.json({
      success: true,
      message: '记忆已删除'
    });
  } catch (error) {
    logger.error('删除记忆失败', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
