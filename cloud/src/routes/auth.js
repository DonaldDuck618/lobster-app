/**
 * 认证路由
 * 支持手机号、邮箱、微信登录
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/auth');
const SMSService = require('../services/sms');
const logger = require('../utils/logger');

/**
 * POST /api/v1/auth/send-code
 * 发送验证码
 */
router.post('/send-code', [
  body('phone').matches(/^1[3-9]\d{9}$/),
  body('type').isIn(['register', 'login']).optional()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, type = 'register' } = req.body;

    // 发送验证码
    const result = await SMSService.sendVerificationCode(phone, type);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/register/phone
 * 手机号注册
 */
router.post('/register/phone', [
  body('phone').matches(/^1[3-9]\d{9}$/),
  body('code').isLength({ min: 6, max: 6 }),
  body('nickname').optional().trim(),
  body('avatar').optional().isURL()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, code, nickname, avatar } = req.body;

    // 手机号注册
    const user = await AuthService.registerByPhone({ phone, code, nickname, avatar });

    logger.info('手机号注册成功', { userId: user.id, phone });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar
        },
        token: user.token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/login/phone
 * 手机号登录
 */
router.post('/login/phone', [
  body('phone').matches(/^1[3-9]\d{9}$/),
  body('code').isLength({ min: 6, max: 6 })
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { phone, code } = req.body;

    // 手机号登录
    const user = await AuthService.loginByPhone({ phone, code });

    logger.info('手机号登录成功', { userId: user.id, phone });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar
        },
        token: user.token
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/login
 * 用户登录
 */
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], async (req, res, next) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 登录
    const user = await AuthService.login({ email, password });

    logger.info('用户登录成功', { userId: user.id });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname
        },
        token: user.token,
        refreshToken: user.refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/auth/wechat
 * 微信小程序登录
 */
router.post('/wechat', [
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

    // 微信登录
    const user = await AuthService.loginWithWechat(code, encryptedData, iv);

    logger.info('微信登录成功', { userId: user.id });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          nickname: user.nickname,
          avatar: user.avatar
        },
        token: user.token,
        isNewUser: user.isNewUser
      }
    });
  } catch (error) {
    next(error);
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

    // 刷新 Token
    const tokens = await AuthService.refreshToken(refreshToken);

    res.json({
      success: true,
      data: tokens
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
