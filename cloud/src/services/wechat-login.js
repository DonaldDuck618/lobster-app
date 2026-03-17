/**
 * 微信登录服务
 * 支持微信小程序登录
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const config = require('../config');

// 微信小程序配置
const WECHAT_MINI_APP_ID = process.env.WECHAT_MINI_APP_ID || 'wx30f07bfe5d52e746';
const WECHAT_MINI_APP_SECRET = process.env.WECHAT_MINI_APP_SECRET || '267e48bb67686dabbf4ab1f5978ffca5';

// 微信 API 地址
const WECHAT_AUTH_URL = 'https://api.weixin.qq.com/sns/jscode2session';

class WechatService {
  /**
   * 微信小程序登录
   * 
   * @param {string} code - 微信登录 code
   * @returns {Promise<Object>} 登录结果
   */
  static async miniProgramLogin(code) {
    try {
      // 调用微信 API 换取 openid
      const response = await axios.get(WECHAT_AUTH_URL, {
        params: {
          appid: WECHAT_MINI_APP_ID,
          secret: WECHAT_MINI_APP_SECRET,
          js_code: code,
          grant_type: 'authorization_code'
        },
        timeout: 10000
      });

      const data = response.data;

      if (data.errcode) {
        logger.error('微信登录失败', { code: data.errcode, message: data.errmsg });
        throw Object.assign(new Error('微信登录失败：' + data.errmsg), { 
          status: 400,
          wechatCode: data.errcode 
        });
      }

      const { openid, session_key, unionid } = data;

      logger.info('微信 API 调用成功', { openid, unionid });

      // 查找或创建用户
      const user = await this.findOrCreateUser({
        wechatOpenid: openid,
        wechatUnionid: unionid,
        sessionKey: session_key
      });

      return {
        success: true,
        user,
        openid,
        sessionKey
      };

    } catch (error) {
      logger.error('微信登录异常', { message: error.message, code: error.wechatCode });
      throw error;
    }
  }

  /**
   * 查找或创建用户
   */
  static async findOrCreateUser({ wechatOpenid, wechatUnionid, sessionKey }) {
    const db = require('../models/database');

    // 查找现有用户
    let users = await db.query(
      'SELECT * FROM users WHERE wechat_openid = ? LIMIT 1',
      [wechatOpenid]
    );

    if (users && users.length > 0) {
      // 老用户登录
      const user = users[0];
      await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
      
      logger.info('微信老用户登录', { userId: user.id, openid: wechatOpenid });
      
      return {
        id: user.id,
        nickname: user.nickname,
        avatar: user.avatar_url,
        phone: user.phone,
        email: user.email,
        wechatOpenid: user.wechat_openid,
        isNewUser: false
      };
    }

    // 新用户注册
    const userId = uuidv4();
    const nickname = '微信用户' + Math.random().toString(36).slice(-6);
    
    await db.query(
      'INSERT INTO users (id, wechat_openid, wechat_unionid, nickname, status) VALUES (?, ?, ?, ?, ?)',
      [userId, wechatOpenid, wechatUnionid || null, nickname, 'active']
    );

    logger.info('微信新用户注册', { userId, openid: wechatOpenid });

    return {
      id: userId,
      nickname,
      avatar: null,
      phone: null,
      email: null,
      wechatOpenid,
      isNewUser: true
    };
  }

  /**
   * 绑定手机号到微信账号
   */
  static async bindPhone(userId, phone, encryptedData, iv) {
    const db = require('../models/database');
    
    // TODO: 解密微信手机号
    // 需要使用 session_key 解密 encryptedData
    
    await db.query(
      'UPDATE users SET phone = ?, phone_verified = 1 WHERE id = ?',
      [phone, userId]
    );

    logger.info('微信绑定手机号成功', { userId, phone });
    return { success: true };
  }

  /**
   * 获取微信手机号（需要用户授权）
   */
  static async getPhoneNumber(code) {
    // 获取 accessToken
    const accessTokenResponse = await axios.get(
      'https://api.weixin.qq.com/cgi-bin/token',
      {
        params: {
          grant_type: 'client_credential',
          appid: WECHAT_MINI_APP_ID,
          secret: WECHAT_MINI_APP_SECRET
        }
      }
    );

    const { access_token } = accessTokenResponse.data;

    // 获取手机号
    const phoneResponse = await axios.post(
      'https://api.weixin.qq.com/wxa/business/getuserphonenumber',
      { code },
      {
        params: { access_token },
        headers: { 'Content-Type': 'application/json' }
      }
    );

    return phoneResponse.data;
  }

  /**
   * 测试连接
   */
  static async testConnection() {
    try {
      // 测试配置是否正确
      const response = await axios.get(WECHAT_AUTH_URL, {
        params: {
          appid: WECHAT_MINI_APP_ID,
          secret: WECHAT_MINI_APP_SECRET,
          js_code: 'test_code',
          grant_type: 'authorization_code'
        },
        timeout: 5000
      });

      // 40013 是无效的 code，但说明配置正确
      if (response.data.errcode === 40013 || response.data.errcode === 40029) {
        return true;
      }
      
      return false;
    } catch (error) {
      logger.error('微信连接测试失败', error);
      return false;
    }
  }
}

module.exports = WechatService;
