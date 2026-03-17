const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const AuthService = require('../services/auth');
const authMiddleware = require('../middleware/auth');
const logger = require('../utils/logger');

router.post('/send-code', [
  body('phone').optional().matches(/^1[3-9]\d{9}$/),
  body('email').optional().isEmail(),
  body('type').isIn(['register', 'login', 'bind', 'reset'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { phone, email, type } = req.body;
    const result = await AuthService.sendVerificationCode({ phone, email, type });
    logger.info('验证码已发送', { phone, email, type });
    res.json(result);
  } catch (error) {
    logger.error('发送验证码失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/register/phone', [
  body('phone').matches(/^1[3-9]\d{9}$/),
  body('password').isLength({ min: 6 }),
  body('code').isLength({ min: 6, max: 6 }),
  body('nickname').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { phone, password, code, nickname } = req.body;
    const user = await AuthService.registerByPhone({ phone, password, code, nickname });
    logger.info('手机号注册成功', { userId: user.id });
    res.status(201).json({ success: true, data: user, message: '注册成功' });
  } catch (error) {
    logger.error('手机号注册失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/login/phone', [
  body('phone').matches(/^1[3-9]\d{9}$/),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { phone, password } = req.body;
    const user = await AuthService.loginByPhone({ phone, password });
    logger.info('手机号登录成功', { userId: user.id });
    res.json({ success: true, data: user, message: '登录成功' });
  } catch (error) {
    logger.error('手机号登录失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/register/email', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('code').isLength({ min: 6, max: 6 }),
  body('nickname').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password, code, nickname } = req.body;
    const user = await AuthService.registerByEmail({ email, password, code, nickname });
    logger.info('邮箱注册成功', { userId: user.id });
    res.status(201).json({ success: true, data: user, message: '注册成功' });
  } catch (error) {
    logger.error('邮箱注册失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/login/email', [
  body('email').isEmail(),
  body('password').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await AuthService.loginByEmail({ email, password });
    logger.info('邮箱登录成功', { userId: user.id });
    res.json({ success: true, data: user, message: '登录成功' });
  } catch (error) {
    logger.error('邮箱登录失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/login/wechat', [
  body('code').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { code } = req.body;
    const user = await AuthService.loginByWechat({ code });
    logger.info('微信小程序登录成功', { userId: user.id });
    res.json({ success: true, data: user, message: '登录成功' });
  } catch (error) {
    logger.error('微信小程序登录失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/login/wechat-web', [
  body('code').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { code } = req.body;
    const user = await AuthService.loginByWechatWeb(code);
    logger.info('微信网页授权登录成功', { userId: user.id });
    res.json({ success: true, data: user, message: '登录成功' });
  } catch (error) {
    logger.error('微信网页授权登录失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.get('/login/wechat-web-url', async (req, res) => {
  try {
    const redirectUri = req.query.redirect_uri || (req.protocol + '://' + req.get('host') + '/auth/wechat-callback');
    const WechatWebOAuthService = require('../services/wechat-web-oauth');
    const authUrl = WechatWebOAuthService.getAuthorizeUrl(redirectUri);
    res.json({ success: true, data: { authUrl } });
  } catch (error) {
    logger.error('获取微信授权 URL 失败', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', authMiddleware, async (req, res) => {
  try {
    const userInfo = await AuthService.getUserInfo(req.user.userId);
    res.json({ success: true, data: userInfo });
  } catch (error) {
    logger.error('获取用户信息失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.put('/me', authMiddleware, [
  body('nickname').optional().trim().isLength({ min: 1, max: 50 }),
  body('avatar').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { nickname, avatar } = req.body;
    const userInfo = await AuthService.updateUserInfo(req.user.userId, { nickname, avatar });
    logger.info('更新用户信息成功', { userId: req.user.userId });
    res.json({ success: true, data: userInfo });
  } catch (error) {
    logger.error('更新用户信息失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.put('/change-password', authMiddleware, [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { oldPassword, newPassword } = req.body;
    await AuthService.changePassword(req.user.userId, oldPassword, newPassword);
    logger.info('密码修改成功', { userId: req.user.userId });
    res.json({ success: true, message: '密码已修改' });
  } catch (error) {
    logger.error('密码修改失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

router.post('/reset-password', [
  body('phone').optional().matches(/^1[3-9]\d{9}$/),
  body('email').optional().isEmail(),
  body('code').isLength({ min: 6, max: 6 }),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { phone, email, code, newPassword } = req.body;
    await AuthService.resetPassword({ phone, email, code, newPassword });
    logger.info('密码重置成功', { phone, email });
    res.json({ success: true, message: '密码已重置' });
  } catch (error) {
    logger.error('密码重置失败', error);
    res.status(error.status || 500).json({ error: error.message });
  }
});

module.exports = router;
