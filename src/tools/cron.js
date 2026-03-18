/**
 * Cron 工具
 * 
 * OpenClaw Cron 工具移植
 * 支持定时任务管理
 */

const cron = require('node-cron');
const logger = require('../utils/logger');

class CronTool {
  constructor() {
    this.name = 'cron';
    this.description = '定时任务工具，支持创建、删除、管理定时任务';
    this.parameters = {
      type: 'object',
      properties: {
        action: { 
          type: 'string', 
          enum: ['create', 'delete', 'list'],
          description: '操作类型'
        },
        schedule: { type: 'string', description: 'Cron 表达式' },
        task: { type: 'string', description: '任务描述' }
      },
      required: ['action']
    };
    
    this.tasks = new Map();
    logger.info('Cron 工具初始化');
  }

  /**
   * 执行工具
   */
  async execute(params) {
    const { action, schedule, task } = params;
    
    switch (action) {
      case 'create':
        return await this.create(schedule, task);
      case 'delete':
        return await this.delete(task);
      case 'list':
        return this.list();
      default:
        throw new Error(`未知操作：${action}`);
    }
  }

  /**
   * 创建定时任务
   */
  async create(schedule, task) {
    logger.info('创建定时任务', { schedule, task });
    try {
      const taskId = `task_${Date.now()}`;
      const job = cron.schedule(schedule, () => {
        logger.info('定时任务执行', { taskId, task });
      });
      
      this.tasks.set(taskId, { schedule, task, job });
      return { success: true, taskId };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 删除定时任务
   */
  async delete(taskId) {
    logger.info('删除定时任务', { taskId });
    const task = this.tasks.get(taskId);
    if (task) {
      task.job.stop();
      this.tasks.delete(taskId);
      return { success: true, taskId };
    }
    return { success: false, error: '任务不存在' };
  }

  /**
   * 列出定时任务
   */
  list() {
    const tasks = [];
    for (const [id, task] of this.tasks) {
      tasks.push({ id, ...task });
    }
    return { success: true, tasks };
  }

  /**
   * 工具描述
   */
  getDefinition() {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: this.parameters
      }
    };
  }
}

module.exports = { CronTool, Tool: CronTool };
