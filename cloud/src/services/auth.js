/**
 * 认证服务
 * 支持手机号、邮箱、微信登录
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');

// 模拟数据库（实际应该用 MySQL）
const users = new Map();

class AuthService {
  /**
   * 手机号注册
   */
  static async registerByPhone({ phone, password, nickname }) {
    // 检查手机号是否已注册
    const existingUser = Array.from(users.values()).find(u => u.phone === phone);
    if (existingUser) {
      const error = new Error('手机号已被注册');
      error.status = 400;
      throw error;
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = {
      id: uuidv4(),
      phone,
      phoneVerified: true,
      password: hashedPassword,
      nickname: nickname || `用户${phone.slice(-4)}`,
      avatar: null,
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
  static async loginByPhone({ phone, password }) {
    // 查找用户
    const user = Array.from(users.values()).find(u => u.phone === phone);
    if (!user) {
      const error = new Error('手机号或密码错误');
      error.status = 401;
      throw error;
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      const error = new Error('手机号或密码错误');
      error.status = 401;
      throw error;
    }

    // 更新登录时间
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();

    // 生成 Token
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info('手机号登录成功', { userId: user.id, phone });

    return {
      id: user.id,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      token,
      refreshToken
    };
  }

  /**
   * 邮箱注册
   */
  static async registerByEmail({ email, password, nickname }) {
    // 检查邮箱是否已注册
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
      emailVerified: false,
      password: hashedPassword,
      nickname: nickname || email.split('@')[0],
      avatar: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    users.set(user.id, user);

    // 生成 Token
    const token = this.generateToken(user);

    logger.info('邮箱注册成功', { userId: user.id, email });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      token
    };
  }

  /**
   * 邮箱登录
   */
  static async loginByEmail({ email, password }) {
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

    // 更新登录时间
    user.lastLoginAt = new Date();
    user.updatedAt = new Date();

    // 生成 Token
    const token = this.generateToken(user);
    const refreshToken = this.generateRefreshToken(user);

    logger.info('邮箱登录成功', { userId: user.id, email });

    return {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      token,
      refreshToken
    };
  }

  /**
   * 微信登录
   */
  static async loginByWechat({ code, encryptedData, iv }) {
    // TODO: 调用微信 API 换取 openid
    // const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    //   params: {
    //     appid: config.wechat.appid,
    //     secret: config.wechat.secret,
    //     js_code: code,
    //     grant_type: 'authorization_code'
    //   }
    // });
    // const { openid, session_key, unionid } = response.data;

    // 模拟微信登录
    const openid = `wechat_${code}`;
    const unionid = `union_${code}`;
    
    // 查找或创建用户
    let user = Array.from(users.values()).find(u => u.wechatOpenid === openid);
    
    if (!user) {
      // 创建新用户
      user = {
        id: uuidv4(),
        wechatOpenid: openid,
        wechatUnionid: unionid,
        nickname: `微信用户${Math.random().toString(36).slice(-6)}`,
        avatar: null,
        phone: null,
        email: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date()
      };
      users.set(user.id, user);
      
      logger.info('微信新用户登录', { userId: user.id, openid });
    } else {
      // 更新登录时间
      user.lastLoginAt = new Date();
      user.updatedAt = new Date();
      
      logger.info('微信老用户登录', { userId: user.id, openid });
    }

    // 生成 Token
    const token = this.generateToken(user);

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      token,
      isNewUser: !user.phone && !user.email
    };
  }

  /**
   * 绑定手机号
   */
  static async bindPhone({ userId, phone, code }) {
    // TODO: 验证验证码
    const user = users.get(userId);
    if (!user) {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }

    if (user.phone) {
      const error = new Error('已绑定手机号');
      error.status = 400;
      throw error;
    }

    user.phone = phone;
    user.phoneVerified = true;
    user.updatedAt = new Date();

    logger.info('绑定手机号成功', { userId, phone });

    return { success: true };
  }

  /**
   * 绑定邮箱
   */
  static async bindEmail({ userId, email, code }) {
    // TODO: 验证验证码
    const user = users.get(userId);
    if (!user) {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }

    if (user.email) {
      const error = new Error('已绑定邮箱');
      error.status = 400;
      throw error;
    }

    user.email = email;
    user.emailVerified = true;
    user.updatedAt = new Date();

    logger.info('绑定邮箱成功', { userId, email });

    return { success: true };
  }

  /**
   * 生成 JWT Token
   */
  static generateToken(user) {
    return jwt.sign(
      { 
        userId: user.id,
        phone: user.phone,
        email: user.email
      },
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
      const err = new Error('Token 无效或已过期');
      err.status = 401;
      throw err;
    }
  }

  /**
   * 刷新 Token
   */
  static async refreshToken(refreshToken) {
    const decoded = this.verifyToken(refreshToken);
    const user = users.get(decoded.userId);
    
    if (!user) {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }

    const token = this.generateToken(user);
    return { token, refreshToken };
  }

  /**
   * 获取用户信息
   */
  static async getUserInfo(userId) {
    const user = users.get(userId);
    if (!user) {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }

    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      nickname: user.nickname,
      avatar: user.avatar,
      wechatOpenid: user.wechatOpenid,
      phoneVerified: user.phoneVerified || false,
      emailVerified: user.emailVerified || false,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt
    };
  }

  /**
   * 更新用户信息
   */
  static async updateUserInfo(userId, data) {
    const user = users.get(userId);
    if (!user) {
      const error = new Error('用户不存在');
      error.status = 404;
      throw error;
    }

    // 允许更新的字段
    const allowedFields = ['nickname', 'avatar'];
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        user[field] = data[field];
      }
    });

    user.updatedAt = new Date();

    return this.getUserInfo(userId);
  }
}

module.exports = AuthService;
