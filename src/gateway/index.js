/**
 * Gateway 适配器
 * 
 * 包装 OpenClaw Gateway 功能
 * 提供能虾助手兼容接口
 */

const WebSocket = require('ws');
const logger = require('../utils/logger');
const EventEmitter = require('events');

class GatewayAdapter extends EventEmitter {
  constructor(config = {}) {
    super();
    this.config = {
      port: config.port || 18789,
      bind: config.bind || '127.0.0.1',
      ...config
    };
    
    this.wsServer = null;
    this.clients = new Map();
    this.sessions = new Map();
    
    logger.info('Gateway 适配器初始化', this.config);
  }

  /**
   * 启动 Gateway
   */
  async start() {
    return new Promise((resolve, reject) => {
      try {
        // 创建 WebSocket 服务器
        this.wsServer = new WebSocket.Server({
          port: this.config.port,
          host: this.config.bind
        });

        this.wsServer.on('listening', () => {
          logger.info(`✅ Gateway 已启动 ws://${this.config.bind}:${this.config.port}`);
          resolve(true);
        });

        this.wsServer.on('connection', (ws, req) => {
          this.handleConnection(ws, req);
        });

        this.wsServer.on('error', (error) => {
          logger.error('❌ Gateway 错误', error);
          reject(error);
        });

      } catch (error) {
        logger.error('❌ Gateway 启动失败', error);
        reject(error);
      }
    });
  }

  /**
   * 处理连接
   */
  handleConnection(ws, req) {
    const clientId = this.generateClientId();
    this.clients.set(clientId, { ws, connectedAt: new Date() });

    logger.info('客户端连接', { clientId, ip: req.socket.remoteAddress });

    ws.on('message', (data) => {
      this.handleMessage(clientId, data);
    });

    ws.on('close', () => {
      this.clients.delete(clientId);
      logger.info('客户端断开', { clientId });
    });

    ws.on('error', (error) => {
      logger.error('客户端错误', { clientId, error: error.message });
    });

    // 发送欢迎消息
    this.send(clientId, {
      type: 'welcome',
      payload: {
        clientId,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
  }

  /**
   * 处理消息
   */
  handleMessage(clientId, data) {
    try {
      const message = JSON.parse(data.toString());
      logger.debug('收到消息', { clientId, type: message.type });

      // 根据消息类型处理
      switch (message.type) {
        case 'connect':
          this.handleConnect(clientId, message);
          break;
        case 'agent':
          this.handleAgent(clientId, message);
          break;
        case 'send':
          this.handleSend(clientId, message);
          break;
        case 'health':
          this.handleHealth(clientId, message);
          break;
        default:
          this.send(clientId, {
            type: 'error',
            payload: { message: `未知消息类型：${message.type}` }
          });
      }
    } catch (error) {
      logger.error('消息处理失败', { clientId, error: error.message });
      this.send(clientId, {
        type: 'error',
        payload: { message: error.message }
      });
    }
  }

  /**
   * 处理连接请求
   */
  handleConnect(clientId, message) {
    const session = {
      id: this.generateSessionId(),
      clientId,
      createdAt: new Date(),
      state: 'connected'
    };
    
    this.sessions.set(session.id, session);
    
    this.send(clientId, {
      type: 'res',
      id: message.id,
      payload: {
        sessionId: session.id,
        status: 'connected'
      }
    });
  }

  /**
   * 处理 Agent 请求
   */
  handleAgent(clientId, message) {
    // 触发 agent 事件，由上层处理
    this.emit('agent', {
      clientId,
      message: message.payload,
      respond: (response) => this.send(clientId, response)
    });
  }

  /**
   * 处理发送请求
   */
  handleSend(clientId, message) {
    // 触发 send 事件，由上层处理
    this.emit('send', {
      clientId,
      message: message.payload,
      respond: (response) => this.send(clientId, response)
    });
  }

  /**
   * 处理健康检查
   */
  handleHealth(clientId, message) {
    this.send(clientId, {
      type: 'res',
      id: message.id,
      payload: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        clients: this.clients.size,
        sessions: this.sessions.size
      }
    });
  }

  /**
   * 发送消息
   */
  send(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  /**
   * 广播消息
   */
  broadcast(message, excludeClientId = null) {
    let count = 0;
    for (const [clientId, client] of this.clients) {
      if (clientId !== excludeClientId && client.ws.readyState === WebSocket.OPEN) {
        if (this.send(clientId, message)) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * 停止 Gateway
   */
  async stop() {
    return new Promise((resolve) => {
      if (this.wsServer) {
        this.wsServer.close(() => {
          logger.info('Gateway 已停止');
          resolve(true);
        });
      } else {
        resolve(true);
      }
    });
  }

  /**
   * 生成客户端 ID
   */
  generateClientId() {
    return `client_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * 生成会话 ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  }

  /**
   * 获取状态
   */
  getStatus() {
    return {
      running: !!this.wsServer,
      port: this.config.port,
      bind: this.config.bind,
      clients: this.clients.size,
      sessions: this.sessions.size
    };
  }

  /**
   * 健康检查
   */
  async healthCheck() {
    return {
      status: 'ok',
      gateway: this.getStatus(),
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = GatewayAdapter;
