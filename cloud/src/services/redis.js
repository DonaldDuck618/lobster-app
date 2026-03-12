/**
 * Redis 缓存服务
 */

const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

let redisClient = null;

/**
 * 初始化 Redis 连接
 */
function initializeRedis() {
  if (!config.redis.url) {
    logger.warn('Redis 未配置，使用内存缓存模式');
    return createMemoryCache();
  }

  try {
    redisClient = new Redis(config.redis.url, {
      keyPrefix: config.redis.prefix,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.error('Redis 连接失败，使用内存缓存');
          return null;
        }
        return Math.min(times * 50, 2000);
      }
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis 连接成功');
    });

    redisClient.on('error', (err) => {
      logger.error('❌ Redis 错误', err.message);
    });

    return redisClient;
  } catch (error) {
    logger.error('Redis 初始化失败', error);
    return createMemoryCache();
  }
}

/**
 * 内存缓存 (fallback)
 */
function createMemoryCache() {
  const cache = new Map();
  
  return {
    async get(key) {
      const item = cache.get(key);
      if (!item) return null;
      
      if (item.expires && Date.now() > item.expires) {
        cache.delete(key);
        return null;
      }
      
      return item.value;
    },
    
    async set(key, value, options = {}) {
      const expires = options.expires ? Date.now() + options.expires : null;
      cache.set(key, { value, expires });
      return 'OK';
    },
    
    async del(key) {
      cache.delete(key);
      return 1;
    },
    
    async exists(key) {
      return cache.has(key) ? 1 : 0;
    },
    
    async incr(key) {
      const item = cache.get(key);
      const value = item ? (parseInt(item.value) || 0) + 1 : 1;
      cache.set(key, { value });
      return value;
    },
    
    async expire(key, seconds) {
      const item = cache.get(key);
      if (item) {
        item.expires = Date.now() + seconds * 1000;
        cache.set(key, item);
      }
      return 1;
    },
    
    async quit() {
      cache.clear();
      logger.info('内存缓存已关闭');
    }
  };
}

/**
 * 获取 Redis 客户端
 */
function getClient() {
  if (!redisClient) {
    redisClient = initializeRedis();
  }
  return redisClient;
}

/**
 * 缓存装饰器
 */
function cache(options = {}) {
  const { key, ttl = 3600 } = options;
  
  return function(target, name, descriptor) {
    const originalMethod = descriptor.value;
    
    descriptor.value = async function(...args) {
      const client = getClient();
      const cacheKey = typeof key === 'function' ? key(...args) : `${key}:${JSON.stringify(args)}`;
      
      try {
        // 尝试从缓存获取
        const cached = await client.get(cacheKey);
        if (cached) {
          logger.debug('缓存命中', { key: cacheKey });
          return JSON.parse(cached);
        }
        
        // 执行原方法
        const result = await originalMethod.apply(this, args);
        
        // 写入缓存
        if (result !== null && result !== undefined) {
          await client.set(cacheKey, JSON.stringify(result), {
            expires: ttl * 1000
          });
        }
        
        return result;
      } catch (error) {
        logger.error('缓存操作失败', error);
        // 缓存失败不影响主逻辑
        return await originalMethod.apply(this, args);
      }
    };
    
    return descriptor;
  };
}

/**
 * 限流器
 */
async function rateLimit(key, limit, windowMs) {
  const client = getClient();
  const now = Date.now();
  const windowKey = `rate:${key}:${Math.floor(now / windowMs)}`;
  
  const count = await client.incr(windowKey);
  
  if (count === 1) {
    await client.expire(windowKey, Math.ceil(windowMs / 1000));
  }
  
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    resetAt: Math.ceil(now / windowMs) * windowMs
  };
}

module.exports = {
  initializeRedis,
  getClient,
  cache,
  rateLimit
};
