/**
 * 认证路由
 */

const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/auth');
const logger = require('../utils/logger');

/**
 * POST /api/v1/auth/register
 * 用户注册
 */
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('nickname').optional().trim()
], async (req, res, next) => {
  try {
    // 验证输入
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, nickname } = req.body;

    // 创建用户
    const user = await AuthService.register({ email, password, nickname });

    logger.info('用户注册成功', { userId: user.id, email });

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          nickname: user.nickname
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
  body('code').notEmpty()
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code } = req.body;

    // 微信登录
    const user = await AuthService.loginWithWechat(code);

    logger.info('微信登录成功', { userId: user.id });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
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
