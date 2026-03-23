/**
 * OpenClaw 学习脚本
 * 每天自动学习 OpenClaw 官网和 GitHub 最新内容
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../src/utils/logger');

const CONFIG = {
  github: {
    apiUrl: 'https://api.github.com/repos/openclaw/openclaw'
  },
  docs: {
    baseUrl: 'https://docs.openclaw.ai',
    pages: ['/start/getting-started', '/gateway/configuration', '/tools/skills']
  },
  output: {
    dir: '/opt/lobster-app/lobster-app/cloud/learn-reports'
  }
};

class OpenClawLearner {
  constructor() {
    this.reports = [];
    this.newFeatures = [];
    this.improvements = [];
  }

  async learnFromGitHub() {
    logger.info('开始学习 GitHub 仓库...');
    try {
      const [releasesRes, commitsRes, repoRes] = await Promise.all([
        axios.get(`${CONFIG.github.apiUrl}/releases?per_page=5`),
        axios.get(`${CONFIG.github.apiUrl}/commits?per_page=10`),
        axios.get(CONFIG.github.apiUrl)
      ]);
      const repo = repoRes.data;
      this.reports.push({
        source: 'GitHub',
        repo: { name: repo.name, stars: repo.stargazers_count, forks: repo.forks_count },
        releases: releasesRes.data.map(r => ({ version: r.tag_name, name: r.name, url: r.html_url })),
        commits: commitsRes.data.map(c => ({ sha: c.sha.slice(0,7), message: c.commit.message.split('\n')[0] }))
      });
      logger.info('GitHub 学习完成');
    } catch (error) {
      logger.error('GitHub 学习失败', error.message);
    }
  }

  async learnFromDocs() {
    logger.info('开始学习官方文档...');
    try {
      const pages = await Promise.all(CONFIG.docs.pages.map(async page => {
        try {
          const res = await axios.get(CONFIG.docs.baseUrl + page, { timeout: 10000 });
          const match = res.data.match(/<title>(.*?)<\/title>/);
          return { page, title: match ? match[1] : page, url: CONFIG.docs.baseUrl + page };
        } catch { return null; }
      }));
      this.reports.push({ source: 'Official Docs', pages: pages.filter(p => p) });
      logger.info('官方文档学习完成');
    } catch (error) {
      logger.error('官方文档学习失败', error.message);
    }
  }

  analyzeImprovements() {
    logger.info('分析可借鉴功能...');
    const gh = this.reports.find(r => r.source === 'GitHub');
    if (gh) {
      gh.releases.forEach(r => {
        this.newFeatures.push({ feature: `OpenClaw ${r.version} 发布`, description: r.name, priority: 'High', action: '研究新版本特性' });
      });
      gh.commits.forEach(c => {
        if (c.message.toLowerCase().includes('feat') || c.message.toLowerCase().includes('add')) {
          this.newFeatures.push({ feature: `新功能：${c.message}`, priority: 'Medium', action: '评估是否集成' });
        }
      });
    }
    logger.info('分析完成');
  }

  async generateReport() {
    logger.info('生成学习报告...');
    const date = new Date().toISOString().split('T')[0];
    let report = `# 🦞 赚好多能虾助手 - OpenClaw 学习报告\n\n**日期**: ${date}\n\n---\n\n## 📊 GitHub 概况\n\n`;
    const gh = this.reports.find(r => r.source === 'GitHub');
    if (gh) {
      report += `- **Stars**: ${gh.repo.stars} ⭐\n- **Forks**: ${gh.repo.forks} 🍴\n\n### 最新 Releases\n${gh.releases.map(r => `- ${r.version}: ${r.name}`).join('\n')}\n\n### 最新 Commits\n${gh.commits.slice(0,5).map(c => `- \`${c.sha}\` ${c.message}`).join('\n')}\n\n`;
    }
    report += `---\n\n## 🎯 新功能发现\n\n${this.newFeatures.length > 0 ? this.newFeatures.map((f,i) => `### ${i+1}. ${f.feature}\n\n**优先级**: ${f.priority}\n**行动**: ${f.action}\n`).join('\n') : '暂无'}\n\n---\n\n## 📋 总结\n\n**新功能**: ${this.newFeatures.length} 个\n\n*报告由赚好多能虾助手 自动生成*\n`;
    await fs.mkdir(CONFIG.output.dir, { recursive: true });
    const filePath = path.join(CONFIG.output.dir, `openclaw-learning-${date}.md`);
    await fs.writeFile(filePath, report, 'utf-8');
    logger.info(`报告已保存：${filePath}`);
    return { filePath, newFeatures: this.newFeatures.length };
  }

  async learn() {
    logger.info('🦞 开始 OpenClaw 学习之旅...');
    try {
      await this.learnFromGitHub();
      await this.learnFromDocs();
      this.analyzeImprovements();
      const result = await this.generateReport();
      logger.info('✅ OpenClaw 学习完成！', { newFeatures: result.newFeatures });
      return result;
    } catch (error) {
      logger.error('❌ OpenClaw 学习失败', error);
      throw error;
    }
  }
}

if (require.main === module) {
  new OpenClawLearner().learn().then(r => { console.log('✅ 学习完成！', r.filePath); process.exit(0); }).catch(e => { console.error('❌ 失败:', e); process.exit(1); });
}

module.exports = OpenClawLearner;
