/**
 * WebSocket 服务
 */

const WebSocket = require('ws');
const { v4: uuidv4 } = require('uuid');
const logger = require('../utils/logger');

class WebSocketServer {
  constructor(server) {
    this.wss = new WebSocket.Server({ 
      server,
      path: '/ws'
    });
    
    this.clients = new Map(); // userId -> Set<WebSocket>
    this.sessions = new Map(); // sessionId -> { userId, ws }

    this.wss.on('connection', (ws, req) => {
      this.handleConnection(ws, req);
    });

    logger.info('WebSocket 服务已启动');
  }

  /**
   * 处理新连接
   */
  handleConnection(ws, req) {
    const userId = this.extractUserId(req);
    const clientId = uuidv4();

    logger.info('WebSocket 连接', { userId, clientId });

    // 保存连接
    if (!this.clients.has(userId)) {
      this.clients.set(userId, new Set());
    }
    this.clients.get(userId).add(ws);

    // 发送欢迎消息
    this.send(ws, {
      type: 'welcome',
      message: '欢迎使用龙虾 Agent',
      clientId
    });

    // 处理消息
    ws.on('message', (data) => {
      this.handleMessage(userId, ws, data);
    });

    // 处理断开
    ws.on('close', () => {
      this.handleDisconnect(userId, ws);
    });

    // 处理错误
    ws.on('error', (error) => {
      logger.error('WebSocket 错误', { userId, error });
    });
  }

  /**
   * 处理消息
   */
  handleMessage(userId, ws, data) {
    try {
      const message = JSON.parse(data.toString());
      
      logger.debug('收到 WebSocket 消息', { userId, type: message.type });

      switch (message.type) {
        case 'chat':
          this.handleChat(userId, ws, message);
          break;
        case 'ping':
          this.send(ws, { type: 'pong', timestamp: Date.now() });
          break;
        default:
          this.send(ws, { 
            type: 'error', 
            message: '未知的消息类型' 
          });
      }
    } catch (error) {
      logger.error('处理 WebSocket 消息失败', error);
      this.send(ws, { 
        type: 'error', 
        message: '消息解析失败' 
      });
    }
  }

  /**
   * 处理聊天消息
   */
  async handleChat(userId, ws, message) {
    const { content, sessionId } = message;

    // TODO: 调用聊天服务
    // const response = await ChatService.sendMessage({ userId, message: content, sessionId });

    // 模拟响应
    const response = {
      type: 'chat_response',
      sessionId: sessionId || uuidv4(),
      content: `收到：${content}`,
      timestamp: new Date().toISOString()
    };

    this.send(ws, response);
  }

  /**
   * 处理断开
   */
  handleDisconnect(userId, ws) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(userId);
      }
    }

    logger.info('WebSocket 断开', { userId });
  }

  /**
   * 发送消息
   */
  send(ws, data) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(data));
    }
  }

  /**
   * 广播消息给用户
   */
  broadcastToUser(userId, data) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      userClients.forEach(ws => {
        this.send(ws, data);
      });
    }
  }

  /**
   * 提取用户 ID
   */
  extractUserId(req) {
    // TODO: 从 Token 中提取用户 ID
    // 目前使用 URL 参数
    const url = new URL(req.url, 'http://localhost');
    return url.searchParams.get('userId') || 'anonymous';
  }
}

module.exports = WebSocketServer;
