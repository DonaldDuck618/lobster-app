/**
 * 配置管理
 */

module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development'
  },
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  
  // 数据库配置
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: parseInt(process.env.DB_POOL_MIN) || 2,
      max: parseInt(process.env.DB_POOL_MAX) || 10
    }
  },
  
  // Redis 配置
  redis: {
    url: process.env.REDIS_URL,
    prefix: process.env.REDIS_PREFIX || 'lobster:'
  },
  
  // 大模型配置
  models: {
    dashscope: {
      apiKey: process.env.DASHSCOPE_API_KEY,
      model: process.env.DASHSCOPE_MODEL || 'qwen-plus'
    },
    zhipu: {
      apiKey: process.env.ZHIPU_API_KEY,
      model: process.env.ZHIPU_MODEL || 'glm-4'
    },
    moonshot: {
      apiKey: process.env.MOONSHOT_API_KEY,
      model: process.env.MOONSHOT_MODEL || 'kimi-plus'
    }
  },
  
  // 搜索 API 配置
  search: {
    tavily: {
      apiKey: process.env.TAVILY_API_KEY
    },
    baidu: {
      apiKey: process.env.BAIDU_API_KEY
    }
  },
  
  // 文件存储配置
  oss: {
    endpoint: process.env.OSS_ENDPOINT,
    bucket: process.env.OSS_BUCKET,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET
  },
  
  // 内容安全配置
  contentSecurity: {
    enabled: process.env.CONTENT_SECURITY_ENABLED === 'true',
    aliyun: {
      accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
      accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET
    }
  },
  
  // 微信小程序配置
  wechat: {
    appid: process.env.WECHAT_APPID || 'wx63721a0ef442fb67',
    secret: process.env.WECHAT_SECRET,
    grantType: process.env.WECHAT_GRANT_TYPE || 'client_credential'
  },
  
  // 阿里云配置
  aliyun: {
    accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET,
    sms: {
      signName: process.env.ALIYUN_SMS_SIGN_NAME || '赚好多能虾助手',
      registerTemplate: process.env.ALIYUN_SMS_REGISTER_TEMPLATE || 'SMS_280756062',
      loginTemplate: process.env.ALIYUN_SMS_LOGIN_TEMPLATE || 'SMS_280756063'
    }
  },
  
  // 限流配置
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 分钟
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  },
  
  // 文件上传配置
  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 100 * 1024 * 1024, // 100MB
    path: process.env.UPLOAD_PATH || './uploads'
  },
  
  // 日志配置
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    file: process.env.LOG_FILE || 'logs/app.log'
  }
};
