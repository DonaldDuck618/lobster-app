/**
 * 认证路由
 * 支持手机号、邮箱、微信登录
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/auth');
const SMSService = require('../services/sms');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * POST /api/v1/auth/send-code
 * 发送验证码（手机/邮箱）
 */
router.post('/send-code', [
  body('phone').optional().matches(/^1[3-9]\d{9}$/),
  body('email').optional().isEmail(),
  body('type').isIn(['register', 'login', 'bind'])
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, email, type } = req.body;

    if (!phone && !email) {
      return res.status(400).json({ error: '请提供手机号或邮箱' });
    }

    // 发送验证码
    const result = await SMSService.sendVerificationCode(phone || email, type);

    logger.info('验证码已发送', { phone, email, type });

    res.json({
      success: true,
      message: '验证码已发送',
      expires: 300 // 5 分钟
    });
  } catch (error) {
    logger.error('发送验证码失败', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/register/phone
 * 手机号注册
 */
router.post('/register/phone', [
  body('phone').matches(/^1[3-9]\d{9}$/),
  body('password').isLength({ min: 6 }),
  body('code').isLength({ min: 6, max: 6 }),
  body('nickname').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password, code, nickname } = req.body;

    // TODO: 验证验证码
    // await SMSService.verifyCode(phone, code);

    const user = await AuthService.registerByPhone({ phone, password, nickname });

    logger.info('手机号注册成功', { userId: user.id });

    res.status(201).json({
      success: true,
      data: user,
      message: '注册成功'
    });
  } catch (error) {
    logger.error('手机号注册失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/login/phone
 * 手机号登录
 */
router.post('/login/phone', [
  body('phone').matches(/^1[3-9]\d{9}$/),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, password } = req.body;

    const user = await AuthService.loginByPhone({ phone, password });

    logger.info('手机号登录成功', { userId: user.id });

    res.json({
      success: true,
      data: user,
      message: '登录成功'
    });
  } catch (error) {
    logger.error('手机号登录失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/register/email
 * 邮箱注册
 */
router.post('/register/email', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('code').isLength({ min: 6, max: 6 }),
  body('nickname').optional().trim()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, code, nickname } = req.body;

    // TODO: 验证验证码
    // await SMSService.verifyCode(email, code);

    const user = await AuthService.registerByEmail({ email, password, nickname });

    logger.info('邮箱注册成功', { userId: user.id });

    res.status(201).json({
      success: true,
      data: user,
      message: '注册成功'
    });
  } catch (error) {
    logger.error('邮箱注册失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/login/email
 * 邮箱登录
 */
router.post('/login/email', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    const user = await AuthService.loginByEmail({ email, password });

    logger.info('邮箱登录成功', { userId: user.id });

    res.json({
      success: true,
      data: user,
      message: '登录成功'
    });
  } catch (error) {
    logger.error('邮箱登录失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/login/wechat
 * 微信登录
 */
router.post('/login/wechat', [
  body('code').notEmpty(),
  body('encryptedData').optional(),
  body('iv').optional()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, encryptedData, iv } = req.body;

    const user = await AuthService.loginByWechat({ code, encryptedData, iv });

    logger.info('微信登录成功', { userId: user.id });

    res.json({
      success: true,
      data: user,
      message: '登录成功'
    });
  } catch (error) {
    logger.error('微信登录失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/bind/phone
 * 绑定手机号
 */
router.post('/bind/phone', authMiddleware, [
  body('phone').matches(/^1[3-9]\d{9}$/),
  body('code').isLength({ min: 6, max: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { phone, code } = req.body;

    // TODO: 验证验证码
    // await SMSService.verifyCode(phone, code);

    await AuthService.bindPhone({ userId, phone, code });

    logger.info('绑定手机号成功', { userId, phone });

    res.json({
      success: true,
      message: '绑定成功'
    });
  } catch (error) {
    logger.error('绑定手机号失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/bind/email
 * 绑定邮箱
 */
router.post('/bind/email', authMiddleware, [
  body('email').isEmail(),
  body('code').isLength({ min: 6, max: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { email, code } = req.body;

    // TODO: 验证验证码
    // await SMSService.verifyCode(email, code);

    await AuthService.bindEmail({ userId, email, code });

    logger.info('绑定邮箱成功', { userId, email });

    res.json({
      success: true,
      message: '绑定成功'
    });
  } catch (error) {
    logger.error('绑定邮箱失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * POST /api/v1/auth/refresh
 * 刷新 Token
 */
router.post('/refresh', [
  body('refreshToken').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { refreshToken } = req.body;

    const tokens = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    logger.error('刷新 Token 失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * GET /api/v1/auth/me
 * 获取当前用户信息
 */
router.get('/me', authMiddleware, async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const userInfo = await AuthService.getUserInfo(userId);

    res.json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    logger.error('获取用户信息失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

/**
 * PUT /api/v1/auth/me
 * 更新用户信息
 */
router.put('/me', authMiddleware, [
  body('nickname').optional().trim().isLength({ min: 1, max: 50 }),
  body('avatar').optional().isURL()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { nickname, avatar } = req.body;

    const userInfo = await AuthService.updateUserInfo(userId, { nickname, avatar });

    logger.info('更新用户信息成功', { userId });

    res.json({
      success: true,
      data: userInfo
    });
  } catch (error) {
    logger.error('更新用户信息失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;
