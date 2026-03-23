const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');
const db = require('../models/database');

class AuthService {
  static validatePhone(phone) { return /^1[3-9]\d{9}$/.test(phone); }
  static validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

  static async generateCode(contact, type) {
    const code = Math.random().toString().slice(-6);
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    await db.query('INSERT INTO verification_codes (id, phone, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?, ?)',
      [uuidv4(), contact.includes('@') ? null : contact, contact.includes('@') ? contact : null, code, type, expires]);
    logger.info('验证码已生成', { contact, type, code });
    return code;
  }

  static async verifyCode(contact, code, type) {
    const rows = await db.query('SELECT * FROM verification_codes WHERE (phone = ? OR email = ?) AND code = ? AND type = ? AND verified = 0 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1', [contact, contact, code, type]);
    if (!rows || rows.length === 0) throw Object.assign(new Error('验证码无效或已过期'), { status: 400 });
    await db.query('UPDATE verification_codes SET verified = 1 WHERE id = ?', [rows[0].id]);
    return true;
  }

  static async sendVerificationCode({ phone, email, type }) {
    const contact = phone || email;
    if (!contact) throw Object.assign(new Error('请提供手机号或邮箱'), { status: 400 });
    if (phone && !this.validatePhone(phone)) throw Object.assign(new Error('手机号格式不正确'), { status: 400 });
    if (email && !this.validateEmail(email)) throw Object.assign(new Error('邮箱格式不正确'), { status: 400 });
    const key = phone ? phone : email;
    const lastSent = await db.query('SELECT created_at FROM verification_codes WHERE (phone = ? OR email = ?) AND type = ? AND created_at > DATE_SUB(NOW(), INTERVAL 60 SECOND) ORDER BY created_at DESC LIMIT 1', [key, key, type]);
    if (lastSent && lastSent.length > 0) throw Object.assign(new Error('发送过于频繁，请 1 分钟后再试'), { status: 429 });
    const code = await this.generateCode(contact, type);
    logger.info('验证码已发送', { contact, type });
    return { success: true, message: '验证码已发送', expires: 300 };
  }

  static async registerByPhone({ phone, password, code, nickname }) {
    if (!this.validatePhone(phone)) throw Object.assign(new Error('手机号格式不正确'), { status: 400 });
    await this.verifyCode(phone, code, 'register');
    const existingUser = await db.query('SELECT id FROM users WHERE phone = ? LIMIT 1', [phone]);
    if (existingUser && existingUser.length > 0) throw Object.assign(new Error('手机号已被注册'), { status: 400 });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    await db.query('INSERT INTO users (id, phone, password_hash, nickname, phone_verified, status) VALUES (?, ?, ?, ?, 1, ?)', [userId, phone, hashedPassword, nickname || '用户' + phone.slice(-4), 'active']);
    logger.info('手机号注册成功', { userId, phone });
    return { id: userId, phone, nickname: nickname || '用户' + phone.slice(-4), avatar: null, token: this.generateToken({ id: userId, phone }) };
  }

  static async loginByPhone({ phone, password }) {
    if (!this.validatePhone(phone)) throw Object.assign(new Error('手机号格式不正确'), { status: 400 });
    let users = await db.query('SELECT * FROM users WHERE phone = ? LIMIT 1', [phone]);
    
    // 内存模式：如果用户不存在且是测试账号，自动创建
    if ((!users || users.length === 0) && phone === '17724620007' && password === 'Wujian886+') {
      logger.info('创建测试用户');
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Wujian886+', 10);
      await db.query('INSERT INTO users (id, phone, password_hash, nickname, phone_verified, status) VALUES (?, ?, ?, ?, 1, ?)', 
        ['user-001', '17724620007', hashedPassword, '测试用户', 'active']);
      users = await db.query('SELECT * FROM users WHERE phone = ? LIMIT 1', [phone]);
    }
    
    if (!users || users.length === 0) throw Object.assign(new Error('手机号或密码错误'), { status: 401 });
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw Object.assign(new Error('手机号或密码错误'), { status: 401 });
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    logger.info('手机号登录成功', { userId: user.id, phone });
    return { id: user.id, phone: user.phone, nickname: user.nickname, avatar: user.avatar_url, token: this.generateToken(user), refreshToken: this.generateRefreshToken(user) };
  }

  static async registerByEmail({ email, password, code, nickname }) {
    if (!this.validateEmail(email)) throw Object.assign(new Error('邮箱格式不正确'), { status: 400 });
    await this.verifyCode(email, code, 'register');
    const existingUser = await db.query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existingUser && existingUser.length > 0) throw Object.assign(new Error('邮箱已被注册'), { status: 400 });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();
    await db.query('INSERT INTO users (id, email, password_hash, nickname, email_verified, status) VALUES (?, ?, ?, ?, 1, ?)', [userId, email, hashedPassword, nickname || email.split('@')[0], 'active']);
    logger.info('邮箱注册成功', { userId, email });
    return { id: userId, email, nickname: nickname || email.split('@')[0], avatar: null, token: this.generateToken({ id: userId, email }) };
  }

  static async loginByEmail({ email, password }) {
    if (!this.validateEmail(email)) throw Object.assign(new Error('邮箱格式不正确'), { status: 400 });
    const users = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    if (!users || users.length === 0) throw Object.assign(new Error('邮箱或密码错误'), { status: 401 });
    const user = users[0];
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw Object.assign(new Error('邮箱或密码错误'), { status: 401 });
    await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
    logger.info('邮箱登录成功', { userId: user.id, email });
    return { id: user.id, email: user.email, nickname: user.nickname, avatar: user.avatar_url, token: this.generateToken(user), refreshToken: this.generateRefreshToken(user) };
  }

  static async loginByWechat({ code }) {
    const WechatService = require('./wechat-login');
    const result = await WechatService.miniProgramLogin(code);
    const token = this.generateToken({ id: result.user.id, phone: result.user.phone, email: result.user.email });
    return { ...result.user, token, wechatOpenid: result.openid };
  }

  static async loginByWechatWeb(code) {
    const WechatWebOAuthService = require('./wechat-web-oauth');
    const result = await WechatWebOAuthService.webLogin(code);
    const token = this.generateToken({ id: result.user.id, phone: result.user.phone, email: result.user.email });
    return { ...result.user, token, wechatOpenid: result.openid };
  }

  static async resetPassword({ phone, email, code, newPassword }) {
    const contact = phone || email;
    if (!contact) throw Object.assign(new Error('请提供手机号或邮箱'), { status: 400 });
    await this.verifyCode(contact, code, 'reset');
    let users;
    if (phone) {
      users = await db.query('SELECT * FROM users WHERE phone = ? LIMIT 1', [phone]);
    } else {
      users = await db.query('SELECT * FROM users WHERE email = ? LIMIT 1', [email]);
    }
    if (!users || users.length === 0) throw Object.assign(new Error('用户不存在'), { status: 404 });
    const user = users[0];
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);
    logger.info('密码重置成功', { userId: user.id });
    return { success: true, message: '密码已重置' };
  }

  static async changePassword(userId, oldPassword, newPassword) {
    const users = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!users || users.length === 0) throw Object.assign(new Error('用户不存在'), { status: 404 });
    const user = users[0];
    const isValid = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isValid) throw Object.assign(new Error('原密码错误'), { status: 400 });
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [hashedPassword, user.id]);
    logger.info('密码修改成功', { userId });
    return { success: true, message: '密码已修改' };
  }

  static generateToken(user) {
    return jwt.sign({ userId: user.id, phone: user.phone || null, email: user.email || null }, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  }

  static generateRefreshToken(user) {
    return jwt.sign({ userId: user.id }, config.jwt.secret, { expiresIn: config.jwt.refreshExpiresIn });
  }

  static verifyToken(token) {
    try { return jwt.verify(token, config.jwt.secret); }
    catch (error) { throw Object.assign(new Error('Token 无效或已过期'), { status: 401 }); }
  }

  static async refreshToken(refreshToken) {
    const decoded = this.verifyToken(refreshToken);
    const users = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [decoded.userId]);
    if (!users || users.length === 0) throw Object.assign(new Error('用户不存在'), { status: 404 });
    return { token: this.generateToken(users[0]), refreshToken };
  }

  static async getUserInfo(userId) {
    const users = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!users || users.length === 0) throw Object.assign(new Error('用户不存在'), { status: 404 });
    const user = users[0];
    return { id: user.id, phone: user.phone || null, email: user.email || null, nickname: user.nickname, avatar: user.avatar_url, wechatOpenid: user.wechat_openid || null, phoneVerified: !!user.phone_verified, emailVerified: !!user.email_verified, createdAt: user.created_at, lastLoginAt: user.last_login_at };
  }

  static async updateUserInfo(userId, data) {
    const users = await db.query('SELECT * FROM users WHERE id = ? LIMIT 1', [userId]);
    if (!users || users.length === 0) throw Object.assign(new Error('用户不存在'), { status: 404 });
    const updates = [], values = [];
    if (data.nickname !== undefined) { updates.push('nickname = ?'); values.push(data.nickname); }
    if (data.avatar !== undefined) { updates.push('avatar_url = ?'); values.push(data.avatar); }
    if (updates.length > 0) { values.push(userId); await db.query('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?', values); }
    return this.getUserInfo(userId);
  }
}

module.exports = AuthService;
