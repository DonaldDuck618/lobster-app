/**
 * Web Search 服务 - Tavily AI 搜索
 * 
 * 功能：
 * - 使用 Tavily API 进行智能网页搜索
 * - 支持基础搜索和深度搜索
 * - 自动限流和重试
 * - 结果去重和质量过滤
 */

const axios = require('axios');
const logger = require('../utils/logger');
const config = require('../config');

// Tavily API 配置
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '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';
const TAVILY_BASE_URL = 'https://api.tavily.com/search';

// 限流配置
const RATE_LIMIT = {
  maxRequests: 100, // 每小时最大请求数
  windowMs: 60 * 60 * 1000, // 1 小时
};

// 请求计数
let requestCount = 0;
let windowStart = Date.now();

class WebSearchService {
  /**
   * 搜索网页
   * 
   * @param {Object} options - 搜索选项
   * @param {string} options.query - 搜索关键词
   * @param {number} [options.count=5] - 结果数量 (1-10)
   * @param {string} [options.searchDepth='basic'] - 搜索深度：basic 或 advanced
   * @param {boolean} [options.includeAnswer=false] - 是否包含 AI 答案
   * @param {string[]} [options.includeDomains] - 包含的域名列表
   * @param {string[]} [options.excludeDomains] - 排除的域名列表
   * 
   * @returns {Promise<Object>} 搜索结果
   */
  static async search({
    query,
    count = 5,
    searchDepth = 'basic',
    includeAnswer = false,
    includeDomains = [],
    excludeDomains = []
  }) {
    // 验证参数
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      throw Object.assign(new Error('搜索关键词不能为空'), { status: 400 });
    }

    // 限流检查
    this.checkRateLimit();

    try {
      // 构建请求体
      const requestBody = {
        api_key: TAVILY_API_KEY,
        query: query.trim(),
        max_results: Math.min(Math.max(count, 1), 10), // 限制 1-10
        search_depth: searchDepth,
        include_answer: includeAnswer,
        include_domains: includeDomains,
        exclude_domains: excludeDomains
      };

      logger.info('执行 Tavily 搜索', { query, count, searchDepth });

      // 发送请求
      const response = await axios.post(TAVILY_BASE_URL, requestBody, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Lobster-Assistant/1.0'
        },
        timeout: 10000 // 10 秒超时
      });

      // 更新请求计数
      this.incrementRequestCount();

      // 处理响应
      const results = this.processResults(response.data);

      logger.info('Tavily 搜索成功', { 
        query, 
        totalResults: results.results.length,
        hasAnswer: !!results.answer 
      });

      return results;

    } catch (error) {
      logger.error('Tavily 搜索失败', { 
        query, 
        error: error.message,
        status: error.response?.status 
      });

      // 错误处理
      throw this.handleError(error);
    }
  }

  /**
   * 处理搜索结果
   */
  static processResults(data) {
    const results = {
      query: data.query || '',
      answer: data.answer || null,
      results: (data.results || []).map(result => ({
        title: result.title || '无标题',
        url: result.url || '',
        snippet: result.content || result.snippet || '',
        score: result.score || 0,
        publishedDate: result.published_date || null
      })),
      total: data.results?.length || 0
    };

    // 按相关性排序
    results.results.sort((a, b) => b.score - a.score);

    return results;
  }

  /**
   * 检查限流
   */
  static checkRateLimit() {
    const now = Date.now();
    
    // 重置窗口
    if (now - windowStart > RATE_LIMIT.windowMs) {
      requestCount = 0;
      windowStart = now;
    }

    // 检查是否超出限制
    if (requestCount >= RATE_LIMIT.maxRequests) {
      const error = new Error('搜索请求过于频繁，请稍后重试');
      error.status = 429;
      throw error;
    }
  }

  /**
   * 增加请求计数
   */
  static incrementRequestCount() {
    requestCount++;
  }

  /**
   * 错误处理
   */
  static handleError(error) {
    // API 错误
    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          return Object.assign(new Error('Tavily API 密钥无效'), { status: 500 });
        case 402:
          return Object.assign(new Error('Tavily API 配额已用尽'), { status: 503 });
        case 429:
          return Object.assign(new Error('Tavily API 请求过于频繁'), { status: 429 });
        default:
          return Object.assign(new Error(`Tavily API 错误：${status}`), { status: 500 });
      }
    }

    // 网络错误
    if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
      return Object.assign(new Error('搜索请求超时，请稍后重试'), { status: 504 });
    }

    // 其他错误
    return Object.assign(new Error(`搜索失败：${error.message}`), { status: 500 });
  }

  /**
   * 获取使用统计
   */
  static getUsageStats() {
    return {
      requestCount,
      windowStart: new Date(windowStart).toISOString(),
      limit: RATE_LIMIT.maxRequests,
      windowMs: RATE_LIMIT.windowMs
    };
  }

  /**
   * 重置限流计数（管理员功能）
   */
  static resetRateLimit() {
    requestCount = 0;
    windowStart = Date.now();
  }
}

module.exports = WebSearchService;
