/**
 * 定时任务服务
 */

const cron = require('node-cron');
const logger = require('../utils/logger');
const OpenClawLearner = require('../../scripts/learn-openclaw');

const jobs = new Map();

/**
 * 初始化定时任务
 */
function initializeCronJobs() {
  logger.info('初始化定时任务...');

  // 任务 1: 清理过期会话 (每天 3:00)
  const cleanupJob = cron.schedule('0 3 * * *', () => {
    logger.info('执行清理过期会话任务');
    // TODO: 清理 30 天前的会话
  }, {
    timezone: 'Asia/Shanghai'
  });

  jobs.set('cleanup', cleanupJob);

  // 任务 2: 系统健康检查 (每小时)
  const healthCheckJob = cron.schedule('0 * * * *', () => {
    logger.info('执行系统健康检查');
    // TODO: 检查系统健康状态
  });

  jobs.set('health-check', healthCheckJob);

  // 任务 3: OpenClaw 学习 (每天早上 8:00)
  const learnOpenClawJob = cron.schedule('0 8 * * *', async () => {
    logger.info('🦞 开始 OpenClaw 学习之旅...');
    
    try {
      const learner = new OpenClawLearner();
      const result = await learner.learn();
      
      logger.info('✅ OpenClaw 学习完成', {
        newFeatures: result.newFeatures,
        improvements: result.improvements,
        reportFile: result.filePath
      });
    } catch (error) {
      logger.error('❌ OpenClaw 学习失败', error);
    }
  }, {
    timezone: 'Asia/Shanghai'
  });

  jobs.set('learn-openclaw', learnOpenClawJob);

  logger.info('定时任务初始化完成', { count: jobs.size });
}

/**
 * 获取所有任务状态
 */
function getJobStatus() {
  const status = {};
  jobs.forEach((job, name) => {
    status[name] = {
      scheduled: job.getScheduled(),
      running: job.getStatus && job.getStatus() === 'scheduled'
    };
  });
  return status;
}

module.exports = {
  initializeCronJobs,
  getJobStatus
};
