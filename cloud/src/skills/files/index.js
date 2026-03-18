/**
 * Files Skill - 文件读写技能
 * 
 * 参考 OpenClaw files 工具设计
 */

const fs = require('fs').promises;
const path = require('path');
const logger = require('../../utils/logger');

class FilesSkill {
  constructor() {
    this.name = 'files';
    this.description = '文件读写工具，支持读取、写入、编辑文件';
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
      
      case 'exists':
        return await this.exists(filePath);
      
      case 'delete':
        return await this.delete(filePath);
      
      case 'list':
        return await this.list(filePath);
      
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
      
      return {
        success: true,
        content: content,
        size: content.length,
        path: filePath
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
        size: content.length
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
  async edit(filePath, options) {
    logger.info('编辑文件', { path: filePath });
    
    try {
      // 读取原内容
      const content = await fs.readFile(filePath, 'utf8');
      
      // 执行编辑操作
      let newContent = content;
      
      if (options.search && options.replace) {
        // 查找替换
        newContent = content.replace(
          new RegExp(options.search, 'g'),
          options.replace
        );
      }
      
      if (options.append) {
        // 追加内容
        newContent += options.append;
      }
      
      if (options.prepend) {
        // 前置内容
        newContent = options.prepend + newContent;
      }
      
      // 写回文件
      await fs.writeFile(filePath, newContent, 'utf8');
      
      return {
        success: true,
        path: filePath,
        changes: newContent.length - content.length
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
   * 检查文件是否存在
   */
  async exists(filePath) {
    try {
      await fs.access(filePath);
      return {
        success: true,
        exists: true,
        path: filePath
      };
    } catch {
      return {
        success: true,
        exists: false,
        path: filePath
      };
    }
  }

  /**
   * 删除文件
   */
  async delete(filePath) {
    logger.info('删除文件', { path: filePath });
    
    try {
      await fs.unlink(filePath);
      
      return {
        success: true,
        path: filePath
      };
    } catch (error) {
      logger.error('删除文件失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 列出目录内容
   */
  async list(dirPath) {
    logger.info('列出目录', { path: dirPath });
    
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });
      
      const files = [];
      const directories = [];
      
      for (const entry of entries) {
        if (entry.isFile()) {
          files.push(entry.name);
        } else if (entry.isDirectory()) {
          directories.push(entry.name);
        }
      }
      
      return {
        success: true,
        path: dirPath,
        files: files,
        directories: directories,
        total: entries.length
      };
    } catch (error) {
      logger.error('列出目录失败', error);
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
              enum: ['read', 'write', 'edit', 'exists', 'delete', 'list'],
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
              description: '编辑选项'
            }
          },
          required: ['action', 'filePath']
        }
      }
    };
  }
}

module.exports = FilesSkill;
