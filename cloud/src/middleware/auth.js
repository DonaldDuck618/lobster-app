/**
 * 认证中间件
 */

const AuthService = require('../services/auth');
const logger = require('../utils/logger');

module.exports = async (req, res, next) => {
  try {
    // 从 Header 获取 Token
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: '缺少认证信息'
      });
    }

    const token = authHeader.substring(7);

    // 验证 Token
    const decoded = AuthService.verifyToken(token);

    // 附加用户信息到请求
    req.user = {
      id: decoded.userId,
      email: decoded.email
    };

    logger.debug('认证通过', { userId: req.user.id });

    next();
  } catch (error) {
    if (error.status === 401) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: error.message
      });
    }

    logger.error('认证失败', error);
    next(error);
  }
};
