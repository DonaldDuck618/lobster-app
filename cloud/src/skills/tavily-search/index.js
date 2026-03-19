/**
 * Tavily Search Skill - Tavily 搜索技能
 * 
 * 参考 OpenClaw tavily-search 工具设计
 */

const axios = require('axios');
const logger = require('../../utils/logger');

// Tavily API 配置
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || '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';
const TAVILY_API_URL = 'https://api.tavily.com/search';

class TavilySearchSkill {
  constructor() {
    this.name = 'tavily-search';
    this.description = 'Tavily AI 搜索引擎，提供高质量、去重的搜索结果';
  }

  /**
   * 执行技能
   */
  async execute(params) {
    const { action, query, options } = params;
    
    switch (action) {
      case 'search':
        return await this.search(query, options);
      
      case 'news':
        return await this.news(query, options);
      
      default:
        throw new Error(`未知的操作：${action}`);
    }
  }

  /**
   * 搜索
   */
  async search(query, options = {}) {
    logger.info('Tavily 搜索', { query, options });
    
    try {
      const config = {
        api_key: TAVILY_API_KEY,
        query: query,
        search_depth: options.searchDepth || 'basic',
        max_results: options.maxResults || 5,
        include_answer: options.includeAnswer || false,
        include_domains: options.includeDomains || [],
        exclude_domains: options.excludeDomains || []
      };

      const response = await axios.post(TAVILY_API_URL, config, {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Lobster-Assistant/1.0'
        },
        timeout: 30000
      });

      const data = response.data;

      return {
        success: true,
        query: data.query || query,
        answer: data.answer || null,
        results: (data.results || []).map(result => ({
          title: result.title || '无标题',
          url: result.url || '',
          snippet: result.content || result.snippet || '',
          score: result.score || 0,
          publishedDate: result.published_date || null
        })),
        total: data.results?.length || 0,
        searchDepth: config.search_depth,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error('Tavily 搜索失败', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 新闻搜索
   */
  async news(query, options = {}) {
    logger.info('Tavily 新闻搜索', { query });
    
    return await this.search(query, {
      ...options,
      searchDepth: 'advanced',
      maxResults: options.maxResults || 10
    });
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
              enum: ['search', 'news'],
              description: '操作类型'
            },
            query: {
              type: 'string',
              description: '搜索关键词'
            },
            options: {
              type: 'object',
              description: '搜索选项',
              properties: {
                searchDepth: {
                  type: 'string',
                  enum: ['basic', 'advanced'],
                  description: '搜索深度'
                },
                maxResults: {
                  type: 'number',
                  description: '结果数量 (1-10)'
                },
                includeAnswer: {
                  type: 'boolean',
                  description: '是否包含 AI 答案'
                },
                includeDomains: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '包含的域名'
                },
                excludeDomains: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '排除的域名'
                }
              }
            }
          },
          required: ['action', 'query']
        }
      }
    };
  }
}

module.exports = TavilySearchSkill;
