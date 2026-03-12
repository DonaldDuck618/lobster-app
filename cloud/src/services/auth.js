/**
 * 认证服务
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');
const logger = require('../utils/logger');

// 模拟数据库 (实际应该用 PostgreSQL)
const users = new Map();

class AuthService {
  /**
   * 用户注册
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
  static async loginWithWechat(code) {
    // TODO: 调用微信 API 换取 openid
    // const response = await axios.get('https://api.weixin.qq.com/sns/jscode2session', {
    //   params: {
    //     appid: config.wechat.appid,
    //     secret: config.wechat.secret,
    //     js_code: code,
    //     grant_type: config.wechat.grantType
    //   }
    // });
    // const { openid, session_key } = response.data;

    // 模拟微信登录
    const openid = `wechat_${code}`;
    
    // 查找或创建用户
    let user = Array.from(users.values()).find(u => u.openid === openid);
    
    if (!user) {
      user = {
        id: uuidv4(),
        openid,
        nickname: `微信用户_${Math.random().toString(36).substr(2, 6)}`,
        avatar: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      users.set(user.id, user);
    }

    const token = this.generateToken(user);

    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      token
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
