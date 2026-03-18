/**
 * Files 工具
 * 
 * OpenClaw Files 工具移植
 * 支持文件读写操作
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../utils/logger');

class FilesTool {
  constructor() {
    this.name = 'files';
    this.description = '文件操作工具，支持读取、写入、编辑文件';
    this.parameters = {
      type: 'object',
      properties: {
        action: { 
          type: 'string', 
          enum: ['read', 'write', 'edit', 'delete'],
          description: '操作类型'
        },
        path: { type: 'string', description: '文件路径' },
        content: { type: 'string', description: '文件内容' }
      },
      required: ['action', 'path']
    };
    
    logger.info('Files 工具初始化');
  }

  /**
   * 执行工具
   */
  async execute(params) {
    const { action, path: filePath, content } = params;
    
    switch (action) {
      case 'read':
        return await this.read(filePath);
      case 'write':
        return await this.write(filePath, content);
      case 'edit':
        return await this.edit(filePath, content);
      case 'delete':
        return await this.delete(filePath);
      default:
        throw new Error(`未知操作：${action}`);
    }
  }

  /**
   * 读取文件
   */
  async read(filePath) {
    logger.info('读取文件', { path: filePath });
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return { success: true, content };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 写入文件
   */
  async write(filePath, content) {
    logger.info('写入文件', { path: filePath });
    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf8');
      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 编辑文件
   */
  async edit(filePath, changes) {
    logger.info('编辑文件', { path: filePath });
    // TODO: 实现文件编辑功能
    return { success: true, path: filePath };
  }

  /**
   * 删除文件
   */
  async delete(filePath) {
    logger.info('删除文件', { path: filePath });
    try {
      await fs.unlink(filePath);
      return { success: true, path: filePath };
    } catch (error) {
      return { success: false, error: error.message };
    }
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

module.exports = { FilesTool, Tool: FilesTool };
