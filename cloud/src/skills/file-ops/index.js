/**
 * File Operations Skill - 文件读写编辑技能
 * 
 * 参考 OpenClaw read/write/edit 工具设计
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class FileOpsSkill {
  constructor() {
    this.name = 'file-ops';
    this.description = '文件读写编辑工具，支持读取、写入、编辑文件内容';
  }

  /**
   * 执行技能
   */
  async execute(params) {
    const { action, filePath, content, options } = params;
    
    switch (action) {
      case 'read':
        return await this.read(filePath);
      
      case 'write':
        return await this.write(filePath, content);
      
      case 'edit':
        return await this.edit(filePath, options);
      
      case 'append':
        return await this.append(filePath, content);
      
      default:
        throw new Error(`未知的文件操作：${action}`);
    }
  }

  /**
   * 读取文件
   */
  async read(filePath) {
    logger.info('读取文件', { path: filePath });
    
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const stats = await fs.stat(filePath);
      
      return {
        success: true,
        content: content,
        path: filePath,
        size: stats.size,
        modified: stats.mtime.toISOString(),
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
   * 写入文件
   */
  async write(filePath, content) {
    logger.info('写入文件', { path: filePath, size: content.length });
    
    try {
      // 确保目录存在
      const dir = path.dirname(filePath);
      await fs.mkdir(dir, { recursive: true });
      
      // 写入文件
      await fs.writeFile(filePath, content, 'utf8');
      
      return {
        success: true,
        path: filePath,
        size: content.length,
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
   * 编辑文件
   */
  async edit(filePath, options = {}) {
    logger.info('编辑文件', { path: filePath });
    
    try {
      // 读取原内容
      const content = await fs.readFile(filePath, 'utf8');
      let newContent = content;
      let changes = 0;
      
      // 查找替换
      if (options.search && options.replace !== undefined) {
        const regex = new RegExp(options.search, 'g');
        const matches = content.match(regex);
        changes = matches ? matches.length : 0;
        newContent = content.replace(regex, options.replace);
      }
      
      // 插入内容
      if (options.insert) {
        const insertPos = options.position || 0;
        newContent = newContent.slice(0, insertPos) + 
                     options.insert + 
                     newContent.slice(insertPos);
        changes++;
      }
      
      // 删除内容
      if (options.delete) {
        const regex = new RegExp(options.delete, 'g');
        newContent = newContent.replace(regex, '');
        changes++;
      }
      
      // 写回文件
      await fs.writeFile(filePath, newContent, 'utf8');
      
      return {
        success: true,
        path: filePath,
        changes: changes,
        oldSize: content.length,
        newSize: newContent.length,
        diff: newContent.length - content.length
      };
    } catch (error) {
      logger.error('编辑文件失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 追加内容
   */
  async append(filePath, content) {
    logger.info('追加内容', { path: filePath, size: content.length });
    
    try {
      await fs.appendFile(filePath, content, 'utf8');
      
      return {
        success: true,
        path: filePath,
        size: content.length,
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
              enum: ['read', 'write', 'edit', 'append'],
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
              description: '编辑选项',
              properties: {
                search: {
                  type: 'string',
                  description: '查找内容'
                },
                replace: {
                  type: 'string',
                  description: '替换内容'
                },
                insert: {
                  type: 'string',
                  description: '插入内容'
                },
                position: {
                  type: 'number',
                  description: '插入位置'
                },
                delete: {
                  type: 'string',
                  description: '删除内容 (正则)'
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

module.exports = FileOpsSkill;
