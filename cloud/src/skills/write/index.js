/**
 * Write Skill - 文件写入技能
 * 
 * 参考 OpenClaw write 工具设计
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class WriteSkill {
  constructor() {
    this.name = 'write';
    this.description = '文件写入工具，支持写入各种文本文件';
  }

  /**
   * 执行技能
   */
  async execute(params) {
    const { action, filePath, content, options } = params;
    
    switch (action) {
      case 'write':
        return await this.write(filePath, content, options);
      
      case 'append':
        return await this.append(filePath, content, options);
      
      case 'create':
        return await this.create(filePath, content, options);
      
      default:
        throw new Error(`未知的操作：${action}`);
    }
  }

  /**
   * 写入文件
   */
  async write(filePath, content, options = {}) {
    logger.info('写入文件', { path: filePath, size: content.length });
    
    try {
      // 安全检查
      if (!this.isPathSafe(filePath)) {
        throw new Error('文件路径不安全');
      }
      
      // 确保目录存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // 写入文件
      await fs.writeFile(filePath, content, options.encoding || 'utf8');
      
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        size: stats.size,
        written: content.length,
        modified: stats.mtime.toISOString(),
        message: '文件写入成功'
      };
    } catch (error) {
      logger.error('写入文件失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 追加内容
   */
  async append(filePath, content, options = {}) {
    logger.info('追加内容', { path: filePath, size: content.length });
    
    try {
      // 安全检查
      if (!this.isPathSafe(filePath)) {
        throw new Error('文件路径不安全');
      }
      
      // 追加内容
      await fs.appendFile(filePath, content, options.encoding || 'utf8');
      
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        size: stats.size,
        appended: content.length,
        modified: stats.mtime.toISOString(),
        message: '内容追加成功'
      };
    } catch (error) {
      logger.error('追加内容失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 创建文件
   */
  async create(filePath, content, options = {}) {
    logger.info('创建文件', { path: filePath });
    
    try {
      // 安全检查
      if (!this.isPathSafe(filePath)) {
        throw new Error('文件路径不安全');
      }
      
      // 检查文件是否已存在
      try {
        await fs.access(filePath);
        return {
          success: false,
          error: '文件已存在',
          exists: true
        };
      } catch {
        // 文件不存在，继续创建
      }
      
      // 确保目录存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // 创建文件
      await fs.writeFile(filePath, content || '', options.encoding || 'utf8');
      
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        path: filePath,
        size: stats.size,
        created: stats.birthtime.toISOString(),
        message: '文件创建成功'
      };
    } catch (error) {
      logger.error('创建文件失败', error);
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
              enum: ['write', 'append', 'create'],
              description: '操作类型'
            },
            filePath: {
              type: 'string',
              description: '文件路径'
            },
            content: {
              type: 'string',
              description: '文件内容'
            },
            options: {
              type: 'object',
              description: '写入选项',
              properties: {
                encoding: {
                  type: 'string',
                  description: '文件编码'
                }
              }
            }
          },
          required: ['action', 'filePath', 'content']
        }
      }
    };
  }
}

module.exports = WriteSkill;
