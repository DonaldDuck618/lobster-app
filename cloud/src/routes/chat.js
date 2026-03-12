/**
 * 聊天路由
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const ChatService = require('../services/chat');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

// 所有聊天接口需要认证
router.use(authMiddleware);

/**
 * POST /api/v1/chat/send
 * 发送消息
 */
router.post('/send', [
  body('message').trim().notEmpty(),
  body('sessionId').optional().isUUID()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { message, sessionId } = req.body;

    // 发送消息
    const response = await ChatService.sendMessage({
      userId,
      message,
      sessionId
    });

    res.json({
      success: true,
      data: response
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/chat/analyze-excel
 * Excel 分析
 */
router.post('/analyze-excel', [
  body('fileId').isUUID(),
  body('requirements').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { fileId, requirements } = req.body;

    // 分析 Excel
    const result = await ChatService.analyzeExcel({
      userId,
      fileId,
      requirements
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/chat/generate-report
 * 生成报告 (周报/日报等)
 */
router.post('/generate-report', [
  body('type').isIn(['weekly', 'daily', 'monthly']),
  body('content').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { type, content } = req.body;

    // 生成报告
    const result = await ChatService.generateReport({
      userId,
      type,
      content
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/chat/sessions
 * 获取会话列表
 */
router.get('/sessions', async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sessions = await ChatService.getSessions(userId);

    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/v1/chat/sessions/:sessionId
 * 删除会话
 */
router.delete('/sessions/:sessionId', async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    await ChatService.deleteSession(userId, sessionId);

    res.json({
      success: true,
      message: '会话已删除'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
