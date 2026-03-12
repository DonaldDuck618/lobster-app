/**
 * 客户端类型识别中间件
 * 支持多端适配和版本控制
 */

const logger = require('../utils/logger');

// 支持的客户端类型
const CLIENT_TYPES = {
  WECHAT_MINIPROGRAM: 'wechat-miniprogram',
  IOS: 'ios',
  ANDROID: 'android',
  WEB: 'web',
  MACOS: 'macos',
  WINDOWS: 'windows',
  LINUX: 'linux'
};

// 客户端能力映射
const CLIENT_CAPABILITIES = {
  [CLIENT_TYPES.WECHAT_MINIPROGRAM]: {
    pushNotification: false,
    fileUpload: true,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    voiceMessage: true,
    videoMessage: false,
    screenShare: false,
    nativeFeatures: ['camera', 'location', 'wechatPay']
  },
  [CLIENT_TYPES.IOS]: {
    pushNotification: true,
    fileUpload: true,
    maxFileSize: 500 * 1024 * 1024,
    voiceMessage: true,
    videoMessage: true,
    screenShare: false,
    nativeFeatures: ['camera', 'location', 'applePay', 'faceID']
  },
  [CLIENT_TYPES.ANDROID]: {
    pushNotification: true,
    fileUpload: true,
    maxFileSize: 500 * 1024 * 1024,
    voiceMessage: true,
    videoMessage: true,
    screenShare: false,
    nativeFeatures: ['camera', 'location', 'googlePay', 'fingerprint']
  },
  [CLIENT_TYPES.WEB]: {
    pushNotification: true,
    fileUpload: true,
    maxFileSize: 100 * 1024 * 1024,
    voiceMessage: true,
    videoMessage: true,
    screenShare: true,
    nativeFeatures: ['notification']
  },
  [CLIENT_TYPES.MACOS]: {
    pushNotification: true,
    fileUpload: true,
    maxFileSize: 1024 * 1024 * 1024, // 1GB
    voiceMessage: true,
    videoMessage: true,
    screenShare: true,
    nativeFeatures: ['systemTray', 'globalShortcut', 'touchBar']
  },
  [CLIENT_TYPES.WINDOWS]: {
    pushNotification: true,
    fileUpload: true,
    maxFileSize: 1024 * 1024 * 1024,
    voiceMessage: true,
    videoMessage: true,
    screenShare: true,
    nativeFeatures: ['systemTray', 'globalShortcut']
  }
};

/**
 * 客户端类型识别中间件
 */
function clientMiddleware(req, res, next) {
  // 从 Header 获取客户端信息
  const clientType = req.headers['x-client-type'] || CLIENT_TYPES.WEB;
  const clientVersion = req.headers['x-client-version'] || '1.0.0';
  const platformVersion = req.headers['x-platform-version'];

  // 验证客户端类型
  if (!Object.values(CLIENT_TYPES).includes(clientType)) {
    logger.warn('未知客户端类型', { clientType });
  }

  // 附加到 request 对象
  req.client = {
    type: clientType,
    version: clientVersion,
    platformVersion,
    capabilities: CLIENT_CAPABILITIES[clientType] || CLIENT_CAPABILITIES[CLIENT_TYPES.WEB]
  };

  logger.debug('客户端识别', req.client);

  next();
}

/**
 * 检查客户端能力
 */
function checkCapability(capability) {
  return (req, res, next) => {
    const { type, capabilities } = req.client;

    if (!capabilities[capability]) {
      return res.status(400).json({
        error: 'Not Supported',
        message: `当前客户端 (${type}) 不支持此功能`,
        data: {
          clientType: type,
          requiredCapability: capability,
          supportedCapabilities: Object.keys(capabilities).filter(k => capabilities[k])
        }
      });
    }

    next();
  };
}

/**
 * 获取客户端配置
 * 根据不同客户端返回不同配置
 */
function getClientConfig(clientType) {
  const configs = {
    [CLIENT_TYPES.WECHAT_MINIPROGRAM]: {
      maxUploadSize: 100 * 1024 * 1024,
      supportedFormats: ['jpg', 'png', 'gif'],
      features: {
        excelAnalysis: true,
        voiceInput: true,
        videoCall: false,
        screenShare: false
      }
    },
    [CLIENT_TYPES.MACOS]: {
      maxUploadSize: 1024 * 1024 * 1024,
      supportedFormats: ['jpg', 'png', 'gif', 'pdf', 'docx', 'xlsx'],
      features: {
        excelAnalysis: true,
        voiceInput: true,
        videoCall: true,
        screenShare: true,
        globalShortcut: true,
        systemTray: true
      }
    },
    [CLIENT_TYPES.WINDOWS]: {
      maxUploadSize: 1024 * 1024 * 1024,
      supportedFormats: ['jpg', 'png', 'gif', 'pdf', 'docx', 'xlsx'],
      features: {
        excelAnalysis: true,
        voiceInput: true,
        videoCall: true,
        screenShare: true,
        globalShortcut: true,
        systemTray: true
      }
    }
  };

  return configs[clientType] || configs[CLIENT_TYPES.WEB];
}

module.exports = {
  clientMiddleware,
  checkCapability,
  getClientConfig,
  CLIENT_TYPES,
  CLIENT_CAPABILITIES
};
