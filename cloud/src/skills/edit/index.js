/**
 * Edit Skill - 文件编辑技能
 * 
 * 参考 OpenClaw edit 工具设计
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class EditSkill {
  constructor() {
    this.name = 'edit';
    this.description = '文件编辑工具，支持查找替换、插入、删除等操作';
  }

  /**
   * 执行技能
   */
  async execute(params) {
    const { action, filePath, options } = params;
    
    switch (action) {
      case 'edit':
        return await this.edit(filePath, options);
      
      case 'replace':
        return await this.replace(filePath, options);
      
      case 'insert':
        return await this.insert(filePath, options);
      
      case 'delete':
        return await this.delete(filePath, options);
      
      default:
        throw new Error(`未知的操作：${action}`);
    }
  }

  /**
   * 编辑文件 (通用)
   */
  async edit(filePath, options = {}) {
    logger.info('编辑文件', { path: filePath });
    
    try {
      // 安全检查
      if (!this.isPathSafe(filePath)) {
        throw new Error('文件路径不安全');
      }
      
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
        const matches = newContent.match(regex);
        const deleteCount = matches ? matches.length : 0;
        newContent = newContent.replace(regex, '');
        changes += deleteCount;
      }
      
      // 写回文件
      await fs.writeFile(filePath, newContent, 'utf8');
      
      return {
        success: true,
        path: filePath,
        changes: changes,
        oldSize: content.length,
        newSize: newContent.length,
        diff: newContent.length - content.length,
        message: '文件编辑成功'
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
   * 查找替换
   */
  async replace(filePath, options = {}) {
    logger.info('查找替换', { path: filePath, search: options.search });
    
    return await this.edit(filePath, {
      search: options.search,
      replace: options.replace || ''
    });
  }

  /**
   * 插入内容
   */
  async insert(filePath, options = {}) {
    logger.info('插入内容', { path: filePath, position: options.position });
    
    return await this.edit(filePath, {
      insert: options.content,
      position: options.position || 0
    });
  }

  /**
   * 删除内容
   */
  async delete(filePath, options = {}) {
    logger.info('删除内容', { path: filePath, pattern: options.pattern });
    
    return await this.edit(filePath, {
      delete: options.pattern
    });
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
              enum: ['edit', 'replace', 'insert', 'delete'],
              description: '操作类型'
            },
            filePath: {
              type: 'string',
              description: '文件路径'
            },
            options: {
              type: 'object',
              description: '编辑选项',
              properties: {
                search: {
                  type: 'string',
                  description: '查找内容 (正则)'
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
                  description: '插入位置 (字符索引)'
                },
                delete: {
                  type: 'string',
                  description: '删除内容 (正则)'
                },
                content: {
                  type: 'string',
                  description: '内容'
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

module.exports = EditSkill;
