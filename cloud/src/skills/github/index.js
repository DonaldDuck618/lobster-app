/**
 * GitHub Skill - GitHub 操作技能
 * 
 * 参考 OpenClaw github 工具设计
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);
const logger = require('../../utils/logger');

class GitHubSkill {
  constructor() {
    this.name = 'github';
    this.description = 'GitHub 操作工具，支持 Issue 管理、PR 操作、仓库查询等';
  }

  /**
   * 执行技能
   */
  async execute(params) {
    const { action, owner, repo, issue, pr, options } = params;
    
    switch (action) {
      case 'listIssues':
        return await this.listIssues(owner, repo, options);
      
      case 'createIssue':
        return await this.createIssue(owner, repo, options);
      
      case 'viewIssue':
        return await this.viewIssue(owner, repo, issue);
      
      case 'listPRs':
        return await this.listPRs(owner, repo, options);
      
      case 'createPR':
        return await this.createPR(owner, repo, options);
      
      case 'viewPR':
        return await this.viewPR(owner, repo, pr);
      
      case 'checkCI':
        return await this.checkCI(owner, repo, pr);
      
      case 'viewRepo':
        return await this.viewRepo(owner, repo);
      
      default:
        throw new Error(`未知的 GitHub 操作：${action}`);
    }
  }

  /**
   * 列出 Issues
   */
  async listIssues(owner, repo, options = {}) {
    logger.info('列出 Issues', { owner, repo });
    
    try {
      const { stdout } = await execPromise(
        `gh issue list --repo ${owner}/${repo} --json number,title,state,createdAt --limit ${options.limit || 10}`
      );
      
      const issues = JSON.parse(stdout);
      
      return {
        success: true,
        issues: issues,
        count: issues.length
      };
    } catch (error) {
      logger.error('列出 Issues 失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 创建 Issue
   */
  async createIssue(owner, repo, options = {}) {
    logger.info('创建 Issue', { owner, repo, title: options.title });
    
    try {
      const { stdout } = await execPromise(
        `gh issue create --repo ${owner}/${repo} --title "${options.title}" --body "${options.body || ''}" --json number,url`
      );
      
      const issue = JSON.parse(stdout);
      
      return {
        success: true,
        issue: issue,
        url: issue.url
      };
    } catch (error) {
      logger.error('创建 Issue 失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 查看 Issue
   */
  async viewIssue(owner, repo, issueNumber) {
    logger.info('查看 Issue', { owner, repo, issue: issueNumber });
    
    try {
      const { stdout } = await execPromise(
        `gh issue view ${issueNumber} --repo ${owner}/${repo} --json number,title,body,state,comments`
      );
      
      const issue = JSON.parse(stdout);
      
      return {
        success: true,
        issue: issue
      };
    } catch (error) {
      logger.error('查看 Issue 失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 列出 PRs
   */
  async listPRs(owner, repo, options = {}) {
    logger.info('列出 PRs', { owner, repo });
    
    try {
      const { stdout } = await execPromise(
        `gh pr list --repo ${owner}/${repo} --json number,title,state,createdAt --limit ${options.limit || 10}`
      );
      
      const prs = JSON.parse(stdout);
      
      return {
        success: true,
        prs: prs,
        count: prs.length
      };
    } catch (error) {
      logger.error('列出 PRs 失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 创建 PR
   */
  async createPR(owner, repo, options = {}) {
    logger.info('创建 PR', { owner, repo, title: options.title });
    
    try {
      const { stdout } = await execPromise(
        `gh pr create --repo ${owner}/${repo} --title "${options.title}" --body "${options.body || ''}" --base "${options.base || 'main'}" --json number,url`
      );
      
      const pr = JSON.parse(stdout);
      
      return {
        success: true,
        pr: pr,
        url: pr.url
      };
    } catch (error) {
      logger.error('创建 PR 失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 查看 PR
   */
  async viewPR(owner, repo, prNumber) {
    logger.info('查看 PR', { owner, repo, pr: prNumber });
    
    try {
      const { stdout } = await execPromise(
        `gh pr view ${prNumber} --repo ${owner}/${repo} --json number,title,body,state,files,commits`
      );
      
      const pr = JSON.parse(stdout);
      
      return {
        success: true,
        pr: pr
      };
    } catch (error) {
      logger.error('查看 PR 失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 检查 CI 状态
   */
  async checkCI(owner, repo, prNumber) {
    logger.info('检查 CI 状态', { owner, repo, pr: prNumber });
    
    try {
      const { stdout } = await execPromise(
        `gh pr checks ${prNumber} --repo ${owner}/${repo} --json name,status,startedAt`
      );
      
      const checks = JSON.parse(stdout);
      
      const summary = {
        total: checks.length,
        passed: checks.filter(c => c.status === 'PASSING').length,
        failed: checks.filter(c => c.status === 'FAILING').length,
        pending: checks.filter(c => c.status === 'PENDING').length
      };
      
      return {
        success: true,
        checks: checks,
        summary: summary
      };
    } catch (error) {
      logger.error('检查 CI 状态失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 查看仓库信息
   */
  async viewRepo(owner, repo) {
    logger.info('查看仓库', { owner, repo });
    
    try {
      const { stdout } = await execPromise(
        `gh repo view ${owner}/${repo} --json name,description,stargazerCount,forkCount,createdAt`
      );
      
      const repoInfo = JSON.parse(stdout);
      
      return {
        success: true,
        repo: repoInfo
      };
    } catch (error) {
      logger.error('查看仓库失败', error);
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
              enum: ['listIssues', 'createIssue', 'viewIssue', 'listPRs', 'createPR', 'viewPR', 'checkCI', 'viewRepo'],
              description: '操作类型'
            },
            owner: {
              type: 'string',
              description: '仓库所有者'
            },
            repo: {
              type: 'string',
              description: '仓库名称'
            },
            issue: {
              type: 'number',
              description: 'Issue 编号'
            },
            pr: {
              type: 'number',
              description: 'PR 编号'
            },
            options: {
              type: 'object',
              description: '其他选项'
            }
          },
          required: ['action', 'owner', 'repo']
        }
      }
    };
  }
}

module.exports = GitHubSkill;
