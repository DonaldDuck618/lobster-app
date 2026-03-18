/**
 * OpenClaw 适配器
 * 
 * 封装 OpenClaw 核心功能，提供能虾助手兼容接口
 * 打造中国版 OpenClaw - 能虾助手
 */

const path = require('path');
const logger = require('../utils/logger');

// OpenClaw 核心路径
const OPENCLAW_PATH = '/usr/local/lib/node_modules/openclaw';

class OpenClawAdapter {
  constructor() {
    this.gateway = null;
    this.agent = null;
    this.tools = new Map();
    this.skills = new Map();
    this.channels = new Map();
    
    logger.info('OpenClaw 适配器初始化中...');
  }

  /**
   * 初始化适配器
   */
  async initialize() {
    try {
      // 1. 加载 Gateway
      await this.loadGateway();
      
      // 2. 加载 Agent Runtime
      await this.loadAgent();
      
      // 3. 加载工具系统
      await this.loadTools();
      
      // 4. 加载技能系统
      await this.loadSkills();
      
      // 5. 加载通道系统
      await this.loadChannels();
      
      logger.info('✅ OpenClaw 适配器初始化完成');
      
      return true;
    } catch (error) {
      logger.error('❌ OpenClaw 适配器初始化失败', error);
      throw error;
    }
  }

  /**
   * 加载 Gateway
   */
  async loadGateway() {
    logger.info('加载 Gateway...');
    
    try {
      // 从 OpenClaw 导入
      const GatewayModule = require(path.join(OPENCLAW_PATH, 'dist/gateway/index.js'));
      this.gateway = new GatewayModule.Gateway({
        port: 18789,
        bind: '127.0.0.1',
        // 能虾助手配置
        lobsterConfig: {
          brand: '能虾助手',
          logo: '🦞',
          language: 'zh-CN'
        }
      });
      
      logger.info('✅ Gateway 加载成功');
    } catch (error) {
      logger.warn('Gateway 加载失败，使用能虾助手 Gateway', error);
      // Fallback: 使用现有能虾助手 Gateway
      this.gateway = null;
    }
  }

  /**
   * 加载 Agent Runtime
   */
  async loadAgent() {
    logger.info('加载 Agent Runtime...');
    
    try {
      const AgentModule = require(path.join(OPENCLAW_PATH, 'dist/agent/index.js'));
      this.agent = new AgentModule.Agent({
        workspace: path.join(process.cwd(), 'workspace'),
        model: 'bailian/qwen3.5-plus',
        // 能虾助手配置
        lobsterConfig: {
          soul: '能虾助手人设',
          identity: 'AI 项目经理'
        }
      });
      
      logger.info('✅ Agent Runtime 加载成功');
    } catch (error) {
      logger.warn('Agent Runtime 加载失败，使用能虾助手 Agent Loop', error);
      this.agent = null;
    }
  }

  /**
   * 加载工具系统
   */
  async loadTools() {
    logger.info('加载工具系统...');
    
    const toolFiles = [
      'browser',
      'canvas',
      'exec',
      'read',
      'write',
      'edit',
      'web_search',
      'message',
      'sessions',
      'subagents'
    ];
    
    for (const toolName of toolFiles) {
      try {
        const ToolModule = require(path.join(OPENCLAW_PATH, `dist/tools/${toolName}.js`));
        this.tools.set(toolName, new ToolModule.Tool());
        logger.info(`  ✅ 工具 ${toolName} 加载成功`);
      } catch (error) {
        logger.warn(`  ⚠️ 工具 ${toolName} 加载失败`);
      }
    }
    
    logger.info(`✅ 工具系统加载完成 (${this.tools.size}/${toolFiles.length})`);
  }

  /**
   * 加载技能系统
   */
  async loadSkills() {
    logger.info('加载技能系统...');
    
    const skillsPath = path.join(OPENCLAW_PATH, 'skills');
    const fs = require('fs');
    
    try {
      const skills = fs.readdirSync(skillsPath);
      
      for (const skill of skills) {
        try {
          const skillPath = path.join(skillsPath, skill, 'index.js');
          if (fs.existsSync(skillPath)) {
            const SkillModule = require(skillPath);
            this.skills.set(skill, new SkillModule.Skill());
            logger.info(`  ✅ 技能 ${skill} 加载成功`);
          }
        } catch (error) {
          logger.warn(`  ⚠️ 技能 ${skill} 加载失败`);
        }
      }
      
      logger.info(`✅ 技能系统加载完成 (${this.skills.size} 个技能)`);
    } catch (error) {
      logger.error('技能系统加载失败', error);
    }
  }

  /**
   * 加载通道系统
   */
  async loadChannels() {
    logger.info('加载通道系统...');
    
    // OpenClaw 通道
    const openclawChannels = [
      'telegram',
      'whatsapp',
      'discord',
      'slack'
    ];
    
    // 能虾助手中国本地化通道
    const lobsterChannels = [
      'wechat-mini',      // 微信小程序
      'dingtalk',         // 钉钉
      'feishu',          // 飞书
      'wecom'            // 企业微信
    ];
    
    // 加载 OpenClaw 通道
    for (const channelName of openclawChannels) {
      try {
        const ChannelModule = require(path.join(OPENCLAW_PATH, `dist/channels/${channelName}.js`));
        this.channels.set(channelName, new ChannelModule.Channel());
        logger.info(`  ✅ 通道 ${channelName} 加载成功`);
      } catch (error) {
        logger.warn(`  ⚠️ 通道 ${channelName} 加载失败`);
      }
    }
    
    // 加载能虾助手通道
    for (const channelName of lobsterChannels) {
      try {
        const ChannelModule = require(path.join(__dirname, `channels/${channelName}.js`));
        this.channels.set(channelName, new ChannelModule.Channel());
        logger.info(`  ✅ 通道 ${channelName} 加载成功`);
      } catch (error) {
        logger.warn(`  ⚠️ 通道 ${channelName} 待实现`);
      }
    }
    
    logger.info(`✅ 通道系统加载完成 (${this.channels.size} 个通道)`);
  }

  /**
   * 运行 Agent
   */
  async runAgent(message, session) {
    if (this.agent) {
      // 使用 OpenClaw Agent
      return await this.agent.run(message, session);
    } else {
      // Fallback: 使用能虾助手 Agent Loop
      const AgentLoop = require('../services/agent-loop');
      const agent = new AgentLoop();
      return await agent.run(message, session);
    }
  }

  /**
   * 执行工具
   */
  async executeTool(toolName, args) {
    if (this.tools.has(toolName)) {
      const tool = this.tools.get(toolName);
      return await tool.execute(args);
    } else {
      throw new Error(`工具 ${toolName} 不存在`);
    }
  }

  /**
   * 调用技能
   */
  async invokeSkill(skillName, params) {
    if (this.skills.has(skillName)) {
      const skill = this.skills.get(skillName);
      return await skill.invoke(params);
    } else {
      throw new Error(`技能 ${skillName} 不存在`);
    }
  }

  /**
   * 获取 Gateway 实例
   */
  getGateway() {
    return this.gateway;
  }

  /**
   * 获取 Agent 实例
   */
  getAgent() {
    return this.agent;
  }

  /**
   * 获取工具列表
   */
  getTools() {
    return Array.from(this.tools.keys());
  }

  /**
   * 获取技能列表
   */
  getSkills() {
    return Array.from(this.skills.keys());
  }

  /**
   * 获取通道列表
   */
  getChannels() {
    return Array.from(this.channels.keys());
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    return {
      status: 'ok',
      gateway: !!this.gateway,
      agent: !!this.agent,
      tools: this.tools.size,
      skills: this.skills.size,
      channels: this.channels.size,
      version: '1.0.0',
      brand: '能虾助手',
      core: 'OpenClaw'
    };
  }
}

module.exports = OpenClawAdapter;
