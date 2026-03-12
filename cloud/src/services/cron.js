/**
 * 定时任务服务
 */

const cron = require('node-cron');
const logger = require('../utils/logger');

const jobs = new Map();

/**
 * 初始化定时任务
 */
function initializeCronJobs() {
  logger.info('初始化定时任务...');

  // 任务 1: 每日美股日报 (每天 21:00)
  const dailyReportJob = cron.schedule('0 21 * * *', () => {
    logger.info('执行每日美股日报任务');
    // TODO: 推送美股日报
    // 调用推送服务发送给用户
  }, {
    timezone: 'Asia/Shanghai'
  });

  jobs.set('daily-report', dailyReportJob);

  // 任务 2: 清理过期会话 (每天 3:00)
  const cleanupJob = cron.schedule('0 3 * * *', () => {
    logger.info('执行清理过期会话任务');
    // TODO: 清理 30 天前的会话
  }, {
    timezone: 'Asia/Shanghai'
  });

  jobs.set('cleanup', cleanupJob);

  // 任务 3: 系统健康检查 (每小时)
  const healthCheckJob = cron.schedule('0 * * * *', () => {
    logger.info('执行系统健康检查');
    // TODO: 检查系统健康状态
  });

  jobs.set('health-check', healthCheckJob);

  logger.info('定时任务初始化完成', { count: jobs.size });
}

/**
 * 添加定时任务
 */
function addJob(name, schedule, callback, options = {}) {
  if (jobs.has(name)) {
    logger.warn('定时任务已存在', { name });
    return false;
  }

  const job = cron.schedule(schedule, callback, {
    timezone: options.timezone || 'Asia/Shanghai',
    scheduled: options.scheduled !== false
  });

  jobs.set(name, job);
  logger.info('添加定时任务', { name, schedule });
  return true;
}

/**
 * 移除定时任务
 */
function removeJob(name) {
  const job = jobs.get(name);
  if (job) {
    job.stop();
    jobs.delete(name);
    logger.info('移除定时任务', { name });
    return true;
  }
  return false;
}

/**
 * 获取所有任务状态
 */
function getJobStatus() {
  const status = {};
  jobs.forEach((job, name) => {
    status[name] = {
      scheduled: job.getScheduled(),
      running: job.getStatus() === 'scheduled'
    };
  });
  return status;
}

module.exports = {
  initializeCronJobs,
  addJob,
  removeJob,
  getJobStatus
};
