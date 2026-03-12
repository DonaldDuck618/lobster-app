/**
 * 认证服务
 * 支持手机号、邮箱、微信登录
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');
const SMSService = require('./sms');

// 模拟数据库 (实际应该用 PostgreSQL)
const users = new Map();

class AuthService {
  /**
   * 手机号注册
   */
  static async registerByPhone({ phone, code, nickname, avatar }) {
    // 验证手机号格式
    if (!SMSService.validatePhoneFormat(phone)) {
      const error = new Error('手机号格式不正确');
      error.status = 400;
      throw error;
    }

    // 验证验证码
    await SMSService.verifyCode(phone, code, 'register');

    // 检查手机号是否已注册
    const existingUser = Array.from(users.values()).find(u => u.phone === phone);
    if (existingUser) {
      const error = new Error('手机号已被注册');
      error.status = 400;
      throw error;
    }

    // 创建用户
    const user = {
      id: uuidv4(),
      phone,
      phoneVerified: true,
      nickname: nickname || `龙虾用户_${phone.slice(-4)}`,
      avatar,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.set(user.id, user);

    // 生成 Token
    const token = this.generateToken(user);

    logger.info('手机号注册成功', { userId: user.id, phone });

    return {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      token
    };
  }

  /**
   * 手机号登录
   */
  static async loginByPhone({ phone, code }) {
    // 验证手机号格式
    if (!SMSService.validatePhoneFormat(phone)) {
      const error = new Error('手机号格式不正确');
      error.status = 400;
      throw error;
    }

    // 验证验证码
    await SMSService.verifyCode(phone, code, 'login');

    // 查找用户
    let user = Array.from(users.values()).find(u => u.phone === phone);

    if (!user) {
      // 自动注册
      user = {
        id: uuidv4(),
        phone,
        phoneVerified: true,
        nickname: `龙虾用户_${phone.slice(-4)}`,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.set(user.id, user);
    }

    // 更新登录信息
    user.lastLoginAt = new Date();

    // 生成 Token
    const token = this.generateToken(user);

    logger.info('手机号登录成功', { userId: user.id, phone });

    return {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      token
    };
  }

  /**
   * 用户注册 (邮箱)
   */
  static async register({ email, password, nickname }) {
    // 检查用户是否存在
    const existingUser = Array.from(users.values()).find(u => u.email === email);
    if (existingUser) {
      const error = new Error('邮箱已被注册');
      error.status = 400;
      throw error;
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = {
      id: uuidv4(),
      email,
      password: hashedPassword,
      emailVerified: false,
      nickname: nickname || email.split('@')[0],
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.set(user.id, user);

    // 生成 Token
    const token = this.generateToken(user);

    logger.info('用户注册成功', { userId: user.id, email });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      token
    };
  }

  /**
   * 用户登录
   */
  static async login({ email, password }) {
    // 查找用户
    const user = Array.from(users.values()).find(u => u.email === email);
    if (!user) {
      const error = new Error('邮箱或密码错误');
      error.status = 401;
      throw error;
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const error = new Error('邮箱或密码错误');
      error.status = 401;
      throw error;
    }

    // 生成 Token
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info('用户登录成功', { userId: user.id });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      token,
      refreshToken
    };
  }

  /**
   * 微信小程序登录
   */
  static async loginWithWechat(code, encryptedData, iv) {
    // 调用微信 API 换取 openid
    const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
      params: {
        appid: config.wechat.appid,
        secret: config.wechat.secret,
        js_code: code,
        grant_type: config.wechat.grantType
      }
    });

    const { openid, session_key, unionid, errcode, errmsg } = response.data;

    if (errcode !== 0) {
      const error = new Error(`微信登录失败：${errmsg}`);
      error.status = 400;
      throw error;
    }

    // 查找或创建用户
    let user = Array.from(users.values()).find(u => u.wechatOpenid === openid);
    
    if (!user) {
      // 新用户，解密用户信息
      let nickname = `微信用户_${openid.slice(-6)}`;
      let avatar = null;

      if (encryptedData && iv) {
        // TODO: 解密微信加密数据
        // const decrypted = this.decryptWechatData(encryptedData, iv, session_key);
        // nickname = decrypted.nickName;
        // avatar = decrypted.avatarUrl;
      }

      user = {
        id: uuidv4(),
        wechatOpenid: openid,
        wechatUnionid: unionid,
        wechatSessionKey: session_key,
        nickname,
        avatar,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.set(user.id, user);
    } else {
      // 更新 session_key
      user.wechatSessionKey = session_key;
      user.updatedAt = new Date();
    }

    const token = this.generateToken(user);

    logger.info('微信登录成功', { userId: user.id, openid });

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      token,
      isNewUser: !user.createdAt
    };
  }

  /**
   * 解密微信加密数据
   */
  static decryptWechatData(encryptedData, iv, sessionKey) {
    // TODO: 实现微信数据解密
    // const crypto = require('crypto');
    // const sessionBuffer = Buffer.from(sessionKey, 'base64');
    // const encryptedBuffer = Buffer.from(encryptedData, 'base64');
    // const ivBuffer = Buffer.from(iv, 'base64');
    
    // const decipher = crypto.createDecipheriv('aes-128-cbc', sessionBuffer, ivBuffer);
    // decipher.setAutoPadding(true);
    
    // let decrypted = decipher.update(encryptedBuffer, 'binary', 'utf8');
    // decrypted += decipher.final('utf8');
    
    // return JSON.parse(decrypted);
    
    return {
      nickName: '微信用户',
      avatarUrl: null
    };
  }

  /**
   * 刷新 Token
   */
  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret);
      const user = users.get(decoded.userId);
      
      if (!user) {
        const error = new Error('用户不存在');
        error.status = 404;
        throw error;
      }

      const token = this.generateToken(user);

      return { token, refreshToken };
    } catch (error) {
      const err = new Error('Refresh Token 无效');
      err.status = 401;
      throw err;
    }
  }

  /**
   * 生成 JWT Token
   */
  static generateToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  /**
   * 生成 Refresh Token
   */
  static generateRefreshToken(user) {
    return jwt.sign(
      { userId: user.id },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn }
    );
  }

  /**
   * 验证 Token
   */
  static verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      const err = new Error('Token 无效');
      err.status = 401;
      throw err;
    }
  }
}

module.exports = AuthService;
