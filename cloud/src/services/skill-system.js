/**
 * 技能系统基础框架
 * 
 * 参考 OpenClaw 技能系统设计
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class SkillSystem {
  constructor() {
    this.skills = new Map();
    this.skillsDir = path.join(__dirname, 'skills');
  }

  /**
   * 初始化技能系统
   */
  async initialize() {
    try {
      logger.info('初始化技能系统...');
      
      // 扫描技能目录
      const skillDirs = await this.scanSkills();
      
      // 加载每个技能
      for (const skillDir of skillDirs) {
        await this.loadSkill(skillDir);
      }
      
      logger.info(`✅ 技能系统初始化完成，已加载 ${this.skills.size} 个技能`);
      
      return true;
    } catch (error) {
      logger.error('技能系统初始化失败', error);
      throw error;
    }
  }

  /**
   * 扫描技能目录
   */
  async scanSkills() {
    try {
      const entries = await fs.readdir(this.skillsDir, { withFileTypes: true });
      const skillDirs = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name);
      
      logger.info(`发现 ${skillDirs.length} 个技能目录`);
      return skillDirs;
    } catch (error) {
      logger.warn('技能目录不存在，创建默认目录');
      await fs.mkdir(this.skillsDir, { recursive: true });
      return [];
    }
  }

  /**
   * 加载技能
   */
  async loadSkill(skillName) {
    try {
      const skillPath = path.join(this.skillsDir, skillName, 'index.js');
      const skillMetaPath = path.join(this.skillsDir, skillName, 'SKILL.md');
      
      // 检查技能文件是否存在
      try {
        await fs.access(skillPath);
      } catch {
        logger.warn(`技能 ${skillName} 缺少 index.js，跳过`);
        return;
      }
      
      // 加载技能模块
      const SkillModule = require(skillPath);
      const skill = new SkillModule();
      
      // 读取技能元数据
      let meta = { name: skillName };
      try {
        await fs.access(skillMetaPath);
        const metaContent = await fs.readFile(skillMetaPath, 'utf8');
        meta = this.parseSkillMeta(metaContent);
      } catch {
        logger.debug(`技能 ${skillName} 缺少 SKILL.md，使用默认元数据`);
      }
      
      // 注册技能
      skill.name = meta.name || skillName;
      skill.description = meta.description || '';
      this.skills.set(skillName, skill);
      
      logger.info(`✅ 加载技能：${skillName}`);
      
    } catch (error) {
      logger.error(`加载技能 ${skillName} 失败`, error);
    }
  }

  /**
   * 解析技能元数据
   */
  parseSkillMeta(content) {
    const meta = {};
    const lines = content.split('\n');
    
    for (const line of lines) {
      if (line.startsWith('name:')) {
        meta.name = line.replace('name:', '').trim();
      } else if (line.startsWith('description:')) {
        meta.description = line.replace('description:', '').trim();
      }
    }
    
    return meta;
  }

  /**
   * 获取技能
   */
  getSkill(skillName) {
    return this.skills.get(skillName);
  }

  /**
   * 获取所有技能
   */
  getAllSkills() {
    return Array.from(this.skills.values()).map(skill => ({
      name: skill.name,
      description: skill.description
    }));
  }

  /**
   * 执行技能
   */
  async executeSkill(skillName, params) {
    const skill = this.getSkill(skillName);
    
    if (!skill) {
      throw new Error(`技能 ${skillName} 不存在`);
    }
    
    if (!skill.execute) {
      throw new Error(`技能 ${skillName} 没有 execute 方法`);
    }
    
    return await skill.execute(params);
  }

  /**
   * 注册技能
   */
  registerSkill(skillName, skillInstance) {
    this.skills.set(skillName, skillInstance);
    logger.info(`✅ 注册技能：${skillName}`);
  }

  /**
   * 卸载技能
   */
  unregisterSkill(skillName) {
    const removed = this.skills.delete(skillName);
    if (removed) {
      logger.info(`✅ 卸载技能：${skillName}`);
    }
    return removed;
  }

  /**
   * 获取技能列表
   */
  listSkills() {
    return Array.from(this.skills.keys());
  }

  /**
   * 技能数量
   */
  count() {
    return this.skills.size;
  }

  /**
   * 导出技能配置
   */
  exportConfig() {
    return {
      total: this.count(),
      skills: this.getAllSkills()
    };
  }
}

// 单例模式
const skillSystem = new SkillSystem();

module.exports = {
  SkillSystem,
  skillSystem
};
