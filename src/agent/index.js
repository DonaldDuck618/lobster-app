/**
 * Agent Runtime 适配器
 * 
 * 包装 OpenClaw Agent 功能
 * 提供能虾助手兼容接口
 */

const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');
const EventEmitter = require('events');

class AgentAdapter extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      workspace: config.workspace || './workspace',
      model: config.model || 'bailian/qwen3.5-plus',
      ...config
    };
    
    this.sessions = new Map();
    this.tools = new Map();
    this.skills = new Map();
    
    logger.info('Agent Runtime 适配器初始化', this.config);
  }

  /**
   * 初始化 Agent
   */
  async initialize() {
    try {
      // 加载工作空间配置
      await this.loadWorkspace();
      
      // 加载工具
      await this.loadTools();
      
      // 加载技能
      await this.loadSkills();
      
      logger.info('✅ Agent Runtime 初始化完成');
      return true;
    } catch (error) {
      logger.error('❌ Agent Runtime 初始化失败', error);
      throw error;
    }
  }

  /**
   * 加载工作空间
   */
  async loadWorkspace() {
    const fs = require('fs');
    const path = require('path');
    
    const workspaceFiles = [
      'AGENTS.md',
      'SOUL.md',
      'TOOLS.md',
      'IDENTITY.md',
      'USER.md'
    ];
    
    this.workspace = {};
    
    for (const file of workspaceFiles) {
      const filePath = path.join(this.config.workspace, file);
      if (fs.existsSync(filePath)) {
        this.workspace[file] = fs.readFileSync(filePath, 'utf8');
        logger.debug(`加载工作空间文件：${file}`);
      }
    }
    
    logger.info(`✅ 工作空间加载完成 (${Object.keys(this.workspace).length} 个文件)`);
  }

  /**
   * 加载工具
   */
  async loadTools() {
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
        const ToolModule = require(`../tools/${toolName}.js`);
        this.tools.set(toolName, new ToolModule.Tool());
        logger.debug(`加载工具：${toolName}`);
      } catch (error) {
        logger.warn(`工具 ${toolName} 加载失败`);
      }
    }
    
    logger.info(`✅ 工具系统加载完成 (${this.tools.size}/${toolFiles.length})`);
  }

  /**
   * 加载技能
   */
  async loadSkills() {
    const fs = require('fs');
    const path = require('path');
    
    const skillsPath = path.join(__dirname, '../skills');
    
    if (!fs.existsSync(skillsPath)) {
      logger.warn('技能目录不存在');
      return;
    }
    
    const skills = fs.readdirSync(skillsPath);
    
    for (const skill of skills) {
      try {
        const skillPath = path.join(skillsPath, skill, 'index.js');
        if (fs.existsSync(skillPath)) {
          const SkillModule = require(skillPath);
          this.skills.set(skill, new SkillModule.Skill());
          logger.debug(`加载技能：${skill}`);
        }
      } catch (error) {
        logger.warn(`技能 ${skill} 加载失败`);
      }
    }
    
    logger.info(`✅ 技能系统加载完成 (${this.skills.size} 个技能)`);
  }

  /**
   * 运行 Agent
   */
  async run(message, session) {
    const sessionId = session.id || this.generateSessionId();
    
    // 创建或获取会话
    let agentSession = this.sessions.get(sessionId);
    if (!agentSession) {
      agentSession = {
        id: sessionId,
        createdAt: new Date(),
        messages: [],
        context: this.buildContext(session)
      };
      this.sessions.set(sessionId, agentSession);
    }
    
    // 添加用户消息
    agentSession.messages.push({
      role: 'user',
      content: message,
      timestamp: new Date()
    });
    
    try {
      // 调用 LLM
      const response = await this.callLLM(message, agentSession);
      
      // 添加 AI 响应
      agentSession.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      });
      
      // 检查是否需要调用工具
      if (response.toolCalls && response.toolCalls.length > 0) {
        const toolResults = await this.executeTools(response.toolCalls);
        return {
          content: response.content,
          toolCalls: response.toolCalls,
          toolResults
        };
      }
      
      return response;
    } catch (error) {
      logger.error('Agent 运行失败', error);
      throw error;
    }
  }

  /**
   * 构建上下文
   */
  buildContext(session) {
    return {
      workspace: this.workspace,
      tools: Array.from(this.tools.keys()),
      skills: Array.from(this.skills.keys()),
      session
    };
  }

  /**
   * 调用 LLM
   */
  async callLLM(message, session) {
    // 使用能虾助手 Agent Loop
    const AgentLoop = require('../services/agent-loop');
    const agent = new AgentLoop();
    
    return await agent.run(message, session);
  }

  /**
   * 执行工具
   */
  async executeTools(toolCalls) {
    const results = [];
    
    for (const toolCall of toolCalls) {
      try {
        const tool = this.tools.get(toolCall.name);
        if (tool) {
          const result = await tool.execute(toolCall.arguments);
          results.push({
            toolCallId: toolCall.id,
            name: toolCall.name,
            result,
            success: true
          });
        } else {
          results.push({
            toolCallId: toolCall.id,
            name: toolCall.name,
            error: `工具 ${toolCall.name} 不存在`,
            success: false
          });
        }
      } catch (error) {
        results.push({
          toolCallId: toolCall.id,
          name: toolCall.name,
          error: error.message,
          success: false
        });
      }
    }
    
    return results;
  }

  /**
   * 调用技能
   */
  async invokeSkill(skillName, params) {
    const skill = this.skills.get(skillName);
    if (!skill) {
      throw new Error(`技能 ${skillName} 不存在`);
    }
    
    return await skill.invoke(params);
  }

  /**
   * 获取会话
   */
  getSession(sessionId) {
    return this.sessions.get(sessionId);
  }

  /**
   * 删除会话
   */
  deleteSession(sessionId) {
    return this.sessions.delete(sessionId);
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
   * 生成会话 ID
   */
  generateSessionId() {
    return uuidv4();
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    return {
      status: 'ok',
      sessions: this.sessions.size,
      tools: this.tools.size,
      skills: this.skills.size,
      model: this.config.model,
      workspace: Object.keys(this.workspace).length
    };
  }
}

module.exports = AgentAdapter;
