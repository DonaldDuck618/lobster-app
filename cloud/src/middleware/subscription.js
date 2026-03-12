/**
 * 订阅权限检查中间件
 */

const PaymentService = require('../services/payment');
const logger = require('../utils/logger');

/**
 * 检查特定功能权限
 * @param {string} feature - 功能名称
 */
function checkFeature(feature) {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      
      const permission = await PaymentService.checkPermission(userId, feature);
      
      if (!permission.allowed) {
        logger.info('功能权限不足', { userId, feature, plan: permission.plan });
        
        return res.status(403).json({
          error: 'Forbidden',
          message: `此功能需要 ${getPlanName(permission.plan)} 会员`,
          data: {
            requiredPlan: permission.plan,
            currentPlan: permission.planName,
            upgradeUrl: '/api/v1/payment/plans'
          }
        });
      }

      // 附加权限信息到请求
      req.subscription = permission;
      next();
    } catch (error) {
      logger.error('权限检查失败', error);
      next(error);
    }
  };
}

/**
 * 检查文件上传权限
 */
function checkFileUpload() {
  return checkFeature('fileUpload');
}

/**
 * 检查 Excel 分析权限
 */
function checkExcelAnalysis() {
  return checkFeature('excelAnalysis');
}

/**
 * 检查自定义 Skill 权限
 */
function checkCustomSkills() {
  return checkFeature('customSkills');
}

/**
 * 检查团队协作权限
 */
function checkTeamCollaboration() {
  return checkFeature('teamCollaboration');
}

/**
 * 检查 API 访问权限
 */
function checkApiAccess() {
  return checkFeature('apiAccess');
}

/**
 * 检查每日调用次数限制
 */
function checkDailyLimit() {
  return async (req, res, next) => {
    try {
      const userId = req.user.id;
      const subscription = await PaymentService.getActiveSubscription(userId);
      
      const dailyLimit = subscription.features.dailyAgentCalls;
      
      // -1 表示无限制
      if (dailyLimit === -1) {
        return next();
      }

      // TODO: 检查今日已使用次数
      // const usedToday = await getUsageCount(userId, new Date());
      // if (usedToday >= dailyLimit) {
      //   return res.status(429).json({
      //     error: 'Too Many Requests',
      //     message: `今日调用次数已达上限 (${dailyLimit}次)`,
      //     data: {
      //       used: usedToday,
      //       limit: dailyLimit,
      //       resetAt: getTomorrowStart()
      //     }
      //   });
      // }

      next();
    } catch (error) {
      logger.error('检查每日限额失败', error);
      next(error);
    }
  };
}

/**
 * 获取会员等级名称
 */
function getPlanName(planId) {
  const names = {
    free: '免费版',
    standard: '标准版',
    pro: '专业版',
    enterprise: '企业版'
  };
  return names[planId] || '未知';
}

module.exports = {
  checkFeature,
  checkFileUpload,
  checkExcelAnalysis,
  checkCustomSkills,
  checkTeamCollaboration,
  checkApiAccess,
  checkDailyLimit
};
