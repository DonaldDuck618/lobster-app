/**
 * Exec Skill - 命令执行技能
 * 
 * 参考 OpenClaw exec 工具设计
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const logger = require('../../utils/logger');

class ExecSkill {
  constructor() {
    this.name = 'exec';
    this.description = '命令执行工具，支持执行系统命令、脚本等';
    
    // 安全命令白名单
    this.allowedCommands = [
      'ls', 'dir', 'pwd', 'cd',
      'cat', 'head', 'tail', 'grep',
      'echo', 'printf',
      'date', 'time', 'uptime',
      'whoami', 'hostname',
      'git', 'npm', 'node',
      'curl', 'wget',
      'docker', 'pm2'
    ];
    
    // 危险命令黑名单
    this.blockedCommands = [
      'rm -rf', 'sudo', 'su',
      'chmod 777', 'chown',
      'dd', 'mkfs',
      'wget.*\\|.*sh', 'curl.*\\|.*bash'
    ];
  }

  /**
   * 执行技能
   */
  async execute(params) {
    const { command, options } = params;
    
    // 安全检查
    if (!this.isCommandSafe(command)) {
      throw new Error('命令不安全，禁止执行');
    }
    
    return await this.run(command, options);
  }

  /**
   * 执行命令
   */
  async run(command, options = {}) {
    logger.info('执行命令', { command, options });
    
    try {
      const { stdout, stderr } = await execPromise(command, {
        timeout: options.timeout || 30000,
        maxBuffer: options.maxBuffer || 1024 * 1024,
        cwd: options.cwd || process.cwd(),
        env: options.env || process.env
      });
      
      return {
        success: true,
        stdout: stdout,
        stderr: stderr,
        command: command,
        exitCode: 0
      };
    } catch (error) {
      logger.error('命令执行失败', error);
      
      return {
        success: false,
        error: error.message,
        stdout: error.stdout || '',
        stderr: error.stderr || '',
        command: command,
        exitCode: error.code || 1
      };
    }
  }

  /**
   * 检查命令是否安全
   */
  isCommandSafe(command) {
    // 检查黑名单
    for (const blocked of this.blockedCommands) {
      if (new RegExp(blocked).test(command)) {
        logger.warn('检测到危险命令', { command, blocked });
        return false;
      }
    }
    
    // 检查白名单 (第一个命令)
    const firstCommand = command.split(' ')[0].split('|')[0].trim();
    if (!this.allowedCommands.includes(firstCommand)) {
      logger.warn('命令不在白名单中', { command, firstCommand });
      return false;
    }
    
    return true;
  }

  /**
   * 执行脚本
   */
  async runScript(scriptPath, args = []) {
    const command = `node ${scriptPath} ${args.join(' ')}`;
    return await this.run(command);
  }

  /**
   * 执行 Shell 脚本
   */
  async runShellScript(scriptPath, args = []) {
    const command = `bash ${scriptPath} ${args.join(' ')}`;
    return await this.run(command);
  }

  /**
   * 获取命令输出
   */
  async getOutput(command) {
    const result = await this.run(command);
    return result.stdout;
  }

  /**
   * 获取命令 exit code
   */
  async getExitCode(command) {
    const result = await this.run(command);
    return result.exitCode;
  }

  /**
   * 检查命令是否存在
   */
  async commandExists(command) {
    const result = await this.run(`which ${command}`);
    return result.exitCode === 0;
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
            command: {
              type: 'string',
              description: '要执行的命令'
            },
            options: {
              type: 'object',
              description: '执行选项',
              properties: {
                timeout: {
                  type: 'number',
                  description: '超时时间 (ms)'
                },
                maxBuffer: {
                  type: 'number',
                  description: '最大缓冲区大小'
                },
                cwd: {
                  type: 'string',
                  description: '工作目录'
                }
              }
            }
          },
          required: ['command']
        }
      }
    };
  }
}

module.exports = ExecSkill;
