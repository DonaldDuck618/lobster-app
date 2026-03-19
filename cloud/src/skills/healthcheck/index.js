/**
 * Healthcheck Skill - 系统健康检查技能
 * 
 * 参考 OpenClaw healthcheck 工具设计
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const logger = require('../../utils/logger');
const os = require('os');

class HealthcheckSkill {
  constructor() {
    this.name = 'healthcheck';
    this.description = '系统健康检查工具，检查服务器、服务、资源状态';
  }

  /**
   * 执行技能
   */
  async execute(params) {
    const { check, service } = params;
    
    switch (check) {
      case 'system':
        return await this.system();
      
      case 'service':
        return await this.service(service);
      
      case 'resources':
        return await this.resources();
      
      case 'full':
        return await this.full();
      
      default:
        return await this.system();
    }
  }

  /**
   * 系统检查
   */
  async system() {
    logger.info('系统健康检查');
    
    try {
      const checks = {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        uptime: os.uptime(),
        totalMemory: os.totalmem(),
        freeMemory: os.freemem(),
        cpuCount: os.cpus().length,
        loadAverage: os.loadavg()
      };
      
      const health = {
        status: 'healthy',
        checks: checks,
        timestamp: new Date().toISOString()
      };
      
      // 内存使用率检查
      const memoryUsage = (os.totalmem() - os.freemem()) / os.totalmem() * 100;
      if (memoryUsage > 90) {
        health.status = 'warning';
        health.warnings = ['内存使用率超过 90%'];
      }
      
      // CPU 负载检查
      const loadAvg = os.loadavg()[0];
      const cpuCount = os.cpus().length;
      if (loadAvg > cpuCount * 0.8) {
        health.status = 'warning';
        health.warnings = health.warnings || [];
        health.warnings.push('CPU 负载较高');
      }
      
      return {
        success: true,
        health: health
      };
    } catch (error) {
      logger.error('系统检查失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 服务检查
   */
  async service(serviceName) {
    logger.info('服务健康检查', { service: serviceName });
    
    try {
      // 检查 PM2 服务
      const { stdout } = await execPromise(`pm2 list --json`);
      const processes = JSON.parse(stdout);
      
      const service = processes.find(p => p.name === serviceName);
      
      if (!service) {
        return {
          success: false,
          error: `服务 ${serviceName} 不存在`
        };
      }
      
      const health = {
        name: service.name,
        status: service.status === 'online' ? 'healthy' : 'unhealthy',
        pid: service.pid,
        uptime: service.pm2_env.pm_uptime,
        memory: service.monit.memory,
        cpu: service.monit.cpu,
        restarts: service.pm2_env.restart_time,
        timestamp: new Date().toISOString()
      };
      
      return {
        success: true,
        health: health
      };
    } catch (error) {
      logger.error('服务检查失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 资源检查
   */
  async resources() {
    logger.info('资源健康检查');
    
    try {
      const resources = {
        cpu: {
          cores: os.cpus().length,
          model: os.cpus()[0].model,
          speed: os.cpus()[0].speed,
          load: os.loadavg()
        },
        memory: {
          total: os.totalmem(),
          free: os.freemem(),
          used: os.totalmem() - os.freemem(),
          usage: (os.totalmem() - os.freemem()) / os.totalmem() * 100
        },
        disk: await this.getDiskUsage(),
        network: await this.getNetworkInfo()
      };
      
      const health = {
        status: 'healthy',
        resources: resources,
        timestamp: new Date().toISOString()
      };
      
      // 资源警告检查
      if (resources.memory.usage > 90) {
        health.status = 'warning';
        health.warnings = ['内存使用率过高'];
      }
      
      if (resources.disk && resources.disk.usage > 90) {
        health.status = 'warning';
        health.warnings = health.warnings || [];
        health.warnings.push('磁盘使用率过高');
      }
      
      return {
        success: true,
        health: health
      };
    } catch (error) {
      logger.error('资源检查失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 获取磁盘使用情况
   */
  async getDiskUsage() {
    try {
      const { stdout } = await execPromise('df -h / | tail -1');
      const parts = stdout.trim().split(/\s+/);
      
      return {
        total: parts[1],
        used: parts[2],
        available: parts[3],
        usage: parseFloat(parts[4]) || 0
      };
    } catch {
      return null;
    }
  }

  /**
   * 获取网络信息
   */
  async getNetworkInfo() {
    try {
      const interfaces = os.networkInterfaces();
      const info = {};
      
      for (const [name, addresses] of Object.entries(interfaces)) {
        info[name] = addresses
          .filter(addr => addr.family === 'IPv4' && !addr.internal)
          .map(addr => ({
            address: addr.address,
            netmask: addr.netmask
          }));
      }
      
      return info;
    } catch {
      return null;
    }
  }

  /**
   * 完整健康检查
   */
  async full() {
    logger.info('完整健康检查');
    
    const [system, resources] = await Promise.all([
      this.system(),
      this.resources()
    ]);
    
    return {
      success: true,
      system: system.health,
      resources: resources.health,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * 获取技能定义
   */
  getDefinition() {
    return {
      type: 'function',
      function: {
        name: this.name,
        description: this.description,
        parameters: {
          type: 'object',
          properties: {
            check: {
              type: 'string',
              enum: ['system', 'service', 'resources', 'full'],
              description: '检查类型'
            },
            service: {
              type: 'string',
              description: '服务名称 (用于 service 检查)'
            }
          },
          required: ['check']
        }
      }
    };
  }
}

module.exports = HealthcheckSkill;
