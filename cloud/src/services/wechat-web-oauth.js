/**
 * 微信网页授权服务
 * 支持微信内 H5 网页授权登录
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const config = require('../config');

// 公众号配置
const WECHAT_OFFICIAL_APP_ID = process.env.WECHAT_OFFICIAL_APP_ID || '';
const WECHAT_OFFICIAL_APP_SECRET = process.env.WECHAT_OFFICIAL_APP_SECRET || '';
const WECHAT_OAUTH_DOMAIN = process.env.WECHAT_OAUTH_DOMAIN || '';

// 微信 OAuth 2.0 授权地址
const WECHAT_OAUTH_URL = 'https://open.weixin.qq.com/connect/oauth2/authorize';
const WECHAT_TOKEN_URL = 'https://api.weixin.qq.com/sns/oauth2/access_token';
const WECHAT_USER_INFO_URL = 'https://api.weixin.qq.com/sns/userinfo';

class WechatWebOAuthService {
  /**
   * 获取授权 URL
   * 
   * @param {string} redirectUri - 回调地址
   * @param {string} scope - 授权作用域 (snsapi_base 或 snsapi_userinfo)
   * @returns {string} 授权 URL
   */
  static getAuthorizeUrl(redirectUri, scope = 'snsapi_userinfo') {
    const params = {
      appid: WECHAT_OFFICIAL_APP_ID,
      redirect_uri: encodeURIComponent(redirectUri),
      response_type: 'code',
      scope: scope,
      state: 'STATE#' + Date.now()
    };

    return `${WECHAT_OAUTH_URL}?${new URLSearchParams(params)}#wechat_redirect`;
  }

  /**
   * 通过 code 换取 access_token 和 openid
   * 
   * @param {string} code - 授权 code
   * @returns {Promise<Object>} { access_token, openid, session_key }
   */
  static async getAccessToken(code) {
    try {
      const response = await axios.get(WECHAT_TOKEN_URL, {
        params: {
          appid: WECHAT_OFFICIAL_APP_ID,
          secret: WECHAT_OFFICIAL_APP_SECRET,
          code: code,
          grant_type: 'authorization_code'
        },
        timeout: 10000
      });

      const data = response.data;

      if (data.errcode) {
        logger.error('微信获取 token 失败', { code: data.errcode, message: data.errmsg });
        throw Object.assign(new Error('微信授权失败：' + data.errmsg), {
          status: 400,
          wechatCode: data.errcode
        });
      }

      logger.info('微信获取 token 成功', { openid: data.openid, scope: data.scope });

      return {
        accessToken: data.access_token,
        openid: data.openid,
        scope: data.scope,
        refreshToken: data.refresh_token
      };
    } catch (error) {
      logger.error('微信获取 token 异常', { message: error.message });
      throw error;
    }
  }

  /**
   * 获取用户信息
   * 
   * @param {string} accessToken - access_token
   * @param {string} openid - 用户 openid
   * @returns {Promise<Object>} 用户信息
   */
  static async getUserInfo(accessToken, openid) {
    try {
      const response = await axios.get(WECHAT_USER_INFO_URL, {
        params: {
          access_token: accessToken,
          openid: openid,
          lang: 'zh_CN'
        },
        timeout: 10000
      });

      const data = response.data;

      if (data.errcode) {
        logger.error('微信获取用户信息失败', { code: data.errcode, message: data.errmsg });
        throw Object.assign(new Error('获取用户信息失败：' + data.errmsg), {
          status: 400,
          wechatCode: data.errcode
        });
      }

      logger.info('微信获取用户信息成功', { openid: data.openid, nickname: data.nickname });

      return {
        openid: data.openid,
        nickname: data.nickname,
        avatar: data.headimgurl,
        gender: data.sex,
        province: data.province,
        city: data.city,
        country: data.country
      };
    } catch (error) {
      logger.error('微信获取用户信息异常', { message: error.message });
      throw error;
    }
  }

  /**
   * 网页授权登录完整流程
   * 
   * @param {string} code - 授权 code
   * @returns {Promise<Object>} 登录结果
   */
  static async webLogin(code) {
    try {
      // 1. 获取 access_token 和 openid
      const tokenData = await this.getAccessToken(code);
      const { accessToken, openid, scope } = tokenData;

      let userInfo;

      // 2. 如果是 snsapi_userinfo，获取用户信息
      if (scope === 'snsapi_userinfo') {
        userInfo = await this.getUserInfo(accessToken, openid);
      } else {
        userInfo = { openid, nickname: '微信用户', avatar: null };
      }

      // 3. 查找或创建用户
      const user = await this.findOrCreateUser(userInfo);

      logger.info('微信网页授权登录成功', { userId: user.id, openid });

      return {
        success: true,
        user,
        openid,
        scope
      };

    } catch (error) {
      logger.error('微信网页授权登录失败', { message: error.message });
      throw error;
    }
  }

  /**
   * 查找或创建用户
   */
  static async findOrCreateUser({ openid, nickname, avatar, gender, province, city }) {
    const db = require('../models/database');

    // 查找现有用户
    let users = await db.query(
      'SELECT * FROM users WHERE wechat_openid = ? LIMIT 1',
      [openid]
    );

    if (users && users.length > 0) {
      // 老用户登录
      const user = users[0];
      await db.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

      logger.info('微信网页授权老用户登录', { userId: user.id });

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
    const finalNickname = nickname || '微信用户' + Math.random().toString(36).slice(-6);

    await db.query(
      'INSERT INTO users (id, wechat_openid, wechat_unionid, nickname, avatar_url, status) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, openid, null, finalNickname, avatar, 'active']
    );

    logger.info('微信网页授权新用户注册', { userId, openid });

    return {
      id: userId,
      nickname: finalNickname,
      avatar: avatar,
      phone: null,
      email: null,
      wechatOpenid: openid,
      isNewUser: true
    };
  }

  /**
   * 检测是否在微信环境
   */
  static isWechat(userAgent) {
    return /micromessenger/i.test(userAgent);
  }

  /**
   * 测试配置
   */
  static testConfig() {
    const hasAppId = !!WECHAT_OFFICIAL_APP_ID && WECHAT_OFFICIAL_APP_ID !== '';
    const hasSecret = !!WECHAT_OFFICIAL_APP_SECRET && WECHAT_OFFICIAL_APP_SECRET !== '';
    const hasDomain = !!WECHAT_OAUTH_DOMAIN && WECHAT_OAUTH_DOMAIN !== '';

    return {
      configured: hasAppId && hasSecret && hasDomain,
      appId: hasAppId ? '已配置' : '未配置',
      secret: hasSecret ? '已配置' : '未配置',
      domain: hasDomain ? WECHAT_OAUTH_DOMAIN : '未配置'
    };
  }
}

module.exports = WechatWebOAuthService;
