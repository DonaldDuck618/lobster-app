/**
 * Read Skill - 文件读取技能
 * 
 * 参考 OpenClaw read 工具设计
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class ReadSkill {
  constructor() {
    this.name = 'read';
    this.description = '文件读取工具，支持读取各种文本文件';
  }

  /**
   * 执行技能
   */
  async execute(params) {
    const { action, filePath, options } = params;
    
    switch (action) {
      case 'read':
        return await this.read(filePath, options);
      
      case 'readLines':
        return await this.readLines(filePath, options);
      
      case 'readJSON':
        return await this.readJSON(filePath);
      
      default:
        throw new Error(`未知的操作：${action}`);
    }
  }

  /**
   * 读取文件
   */
  async read(filePath, options = {}) {
    logger.info('读取文件', { path: filePath });
    
    try {
      // 安全检查
      if (!this.isPathSafe(filePath)) {
        throw new Error('文件路径不安全');
      }
      
      // 读取文件
      const content = await fs.readFile(filePath, options.encoding || 'utf8');
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        content: content,
        path: filePath,
        size: stats.size,
        modified: stats.mtime.toISOString(),
        created: stats.birthtime.toISOString(),
        lines: content.split('\n').length
      };
    } catch (error) {
      logger.error('读取文件失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 读取文件行
   */
  async readLines(filePath, options = {}) {
    logger.info('读取文件行', { path: filePath });
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const lines = content.split('\n');
      
      const start = options.start || 0;
      const end = options.end || lines.length;
      const limitedLines = lines.slice(start, end);
      
      return {
        success: true,
        lines: limitedLines,
        totalLines: lines.length,
        start: start,
        end: end,
        path: filePath
      };
    } catch (error) {
      logger.error('读取文件行失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 读取 JSON 文件
   */
  async readJSON(filePath) {
    logger.info('读取 JSON 文件', { path: filePath });
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const data = JSON.parse(content);
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        data: data,
        path: filePath,
        size: stats.size,
        modified: stats.mtime.toISOString()
      };
    } catch (error) {
      logger.error('读取 JSON 文件失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 检查路径是否安全
   */
  isPathSafe(filePath) {
    // 防止路径遍历攻击
    const resolvedPath = path.resolve(filePath);
    const workspacePath = path.resolve(process.cwd());
    
    // 确保文件在工作空间内
    return resolvedPath.startsWith(workspacePath);
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
            action: {
              type: 'string',
              enum: ['read', 'readLines', 'readJSON'],
              description: '操作类型'
            },
            filePath: {
              type: 'string',
              description: '文件路径'
            },
            options: {
              type: 'object',
              description: '读取选项',
              properties: {
                encoding: {
                  type: 'string',
                  description: '文件编码'
                },
                start: {
                  type: 'number',
                  description: '起始行号'
                },
                end: {
                  type: 'number',
                  description: '结束行号'
                }
              }
            }
          },
          required: ['action', 'filePath']
        }
      }
    };
  }
}

module.exports = ReadSkill;
