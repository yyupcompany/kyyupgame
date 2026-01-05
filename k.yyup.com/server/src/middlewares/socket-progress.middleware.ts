/**
 * WebSocket进度推送中间件
 * 集成Socket.IO并初始化AI进度事件服务
 */

import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import AIProgressEventService from '../services/ai-progress-event.service';

export class SocketProgressMiddleware {
  private static instance: SocketProgressMiddleware;
  private io: SocketIOServer;
  private progressService: typeof AIProgressEventService;

  private constructor() {
    this.progressService = AIProgressEventService;
  }

  public static getInstance(): SocketProgressMiddleware {
    if (!SocketProgressMiddleware.instance) {
      SocketProgressMiddleware.instance = new SocketProgressMiddleware();
    }
    return SocketProgressMiddleware.instance;
  }

  /**
   * 初始化Socket.IO服务器
   */
  public initializeSocketIO(httpServer: HTTPServer): void {
    // 🔧 修复：动态构建允许的CORS源
    const port = process.env.PORT || 3000;
    const frontendPort = process.env.FRONTEND_PORT || 5173;

    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [
          process.env.FRONTEND_URL || 'https://k.yyup.cc',
          `http://localhost:${frontendPort}`,
          `http://127.0.0.1:${frontendPort}`,
          `http://localhost:${port}`,
          `http://127.0.0.1:${port}`
        ],
        methods: ['GET', 'POST'],
        credentials: true
      },
      transports: ['websocket', 'polling']
    });

    console.log('🔌 [SocketProgress] Socket.IO服务器已初始化');

    // 初始化进度事件服务的Socket.IO集成
    this.progressService.initializeSocketIO(this.io);

    // 设置Socket.IO事件监听
    this.setupSocketEventListeners();

    console.log('📡 [SocketProgress] 进度推送中间件已启动');
  }

  /**
   * 设置Socket.IO事件监听器
   */
  private setupSocketEventListeners(): void {
    this.io.on('connection', (socket: any) => {
      console.log(`🔗 [SocketProgress] 客户端连接: ${socket.id}`);

      // 用户认证并加入用户房间
      socket.on('authenticate', (data: any) => {
        const { userId, token } = data;

        // 这里可以添加JWT token验证逻辑
        // 暂时简化处理，直接加入用户房间
        socket.join(`user_${userId}`);
        socket.userId = userId;

        console.log(`👤 [SocketProgress] 用户 ${userId} 已认证，加入房间 user_${userId}`);

        socket.emit('authenticated', {
          success: true,
          userId,
          message: '认证成功'
        });
      });

      // 监听AI查询进度订阅
      socket.on('subscribe_ai_progress', (data: any) => {
        const { sessionId } = data;

        if (!socket.userId) {
          socket.emit('error', { message: '请先进行用户认证' });
          return;
        }

        // 加入特定查询的房间
        socket.join(`query_${sessionId}`);

        console.log(`📊 [SocketProgress] 用户 ${socket.userId} 订阅查询进度: ${sessionId}`);

        socket.emit('subscribed', {
          sessionId,
          message: '已订阅查询进度'
        });
      });

      // 监听取消订阅
      socket.on('unsubscribe_ai_progress', (data: any) => {
        const { sessionId } = data;

        socket.leave(`query_${sessionId}`);

        console.log(`📊 [SocketProgress] 用户 ${socket.userId} 取消订阅查询进度: ${sessionId}`);

        socket.emit('unsubscribed', {
          sessionId,
          message: '已取消订阅查询进度'
        });
      });

      // 监听AI消息发送
      socket.on('ai_message', async (data: any) => {
        const { message, userId, conversationId, context } = data;
        // 🔧 autoExecute 已废弃，现在由大模型自动判断是否调用工具

        if (!socket.userId) {
          socket.emit('error', { message: '请先进行用户认证' });
          return;
        }

        console.log(`💬 [SocketProgress] 收到AI消息: ${message?.substring(0, 50)}...`);
        console.log(`🎯 [SocketProgress] conversationId=${conversationId}`);
        // 🔧 autoExecute 已废弃，现在由大模型自动判断是否调用工具

        try {
          // 🎯 直接调用AI Bridge服务（支持实时进度推送）
          // 🔧 移除：autoExecute 参数，现在总是启用工具，由大模型判断
          const result = await this.callAIBridge(message, userId, conversationId, context, socket);

          console.log(`✅ [SocketProgress] AI处理完成，准备发送最终响应`);

          // 发送AI响应
          socket.emit('ai_response', {
            success: true,
            data: result,
            timestamp: Date.now()
          });

        } catch (error: any) {
          console.error('❌ [SocketProgress] AI消息处理失败:', error);

          socket.emit('ai_response', {
            success: false,
            error: error.message || 'AI处理失败',
            timestamp: Date.now()
          });
        }
      });

      // 监听心跳
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // 处理断开连接
      socket.on('disconnect', (reason: string) => {
        console.log(`🔌 [SocketProgress] 客户端断开连接: ${socket.id}, 原因: ${reason}`);

        // 清理该用户的活跃会话
        if (socket.userId) {
          this.cleanupUserSessions(socket.userId);
        }
      });

      // 错误处理
      socket.on('error', (error: any) => {
        console.error(`❌ [SocketProgress] Socket错误 (${socket.id}):`, error);
      });
    });

    // 定期清理过期会话
    setInterval(() => {
      this.progressService.cleanupExpiredSessions();
    }, 5 * 60 * 1000); // 每5分钟清理一次
  }

  /**
   * 清理用户会话
   */
  private cleanupUserSessions(userId: number): void {
    // 获取用户的所有活跃会话
    const activeSessions = this.progressService.getActiveSessions();

    activeSessions.forEach(sessionId => {
      const session = this.progressService.getActiveSession(sessionId);
      if (session && session.userId === userId) {
        // 标记会话为完成状态
        this.progressService.completeProgress(sessionId, {
          message: '用户连接断开，查询会话已清理'
        });
      }
    });
  }

  /**
   * 直接调用AI Bridge服务（支持实时进度推送）
   * 🔧 移除：autoExecute 参数，现在总是启用工具，由大模型判断
   */
  private async callAIBridge(
    message: string,
    userId: string,
    conversationId: string,
    context: any,
    socket: any
  ) {
    try {
      console.log(`🎯 [SocketProgress] 直接调用AI Bridge服务，enableTools=true（由大模型判断）`);

      // 🎯 动态导入UnifiedIntelligenceService
      const { UnifiedIntelligenceService } = await import('../services/ai-operator/unified-intelligence.service');
      const intelligenceService = new UnifiedIntelligenceService();

      // 构建用户请求
      const userRequest = {
        content: message,
        userId,
        conversationId: conversationId || `unified_${Date.now()}`,
        context: {
          timestamp: new Date().toISOString(),
          source: 'socket-io-bridge',
          enableTools: true, // 🔧 总是启用工具，由大模型判断是否调用
          enableWebSearch: false,
          role: context?.role || 'parent',
          pagePath: context?.pagePath,
          ...context
        }
      };

      // 🎯 创建进度回调函数，通过Socket.IO实时推送进度事件
      const progressCallback = (status: string, details?: any) => {
        console.log(`📊 [SocketProgress] 进度事件: ${status}`, details);

        // 🎯 根据事件类型发送不同的Socket.IO事件
        if (status === 'tool_call_start') {
          socket.emit('ai_query_progress', {
            type: 'tool_call_start',
            data: details,
            timestamp: Date.now()
          });
        } else if (status === 'tool_call_complete') {
          socket.emit('ai_query_progress', {
            type: 'tool_call_complete',
            data: details,
            timestamp: Date.now()
          });
        } else if (status === 'thinking') {
          socket.emit('ai_query_progress', {
            type: 'thinking',
            content: details,
            timestamp: Date.now()
          });
        } else if (status === 'tool_intent') {
          socket.emit('ai_query_progress', {
            type: 'tool_intent',
            data: details,
            timestamp: Date.now()
          });
        } else {
          // 其他进度消息
          socket.emit('ai_query_progress', {
            type: 'progress',
            message: status,
            details,
            timestamp: Date.now()
          });
        }
      };

      // @deprecated processUserRequestWithProgress 已移除，请使用流式接口
      // 🎯 调用AI Bridge服务（带进度回调）
      // 已废弃：请使用 processUserRequestStreamSingleRound 或 processUserRequestStream
      throw new Error('processUserRequestWithProgress 已废弃，请使用流式接口：/api/ai/unified/stream-chat-single');

    } catch (error: any) {
      console.error('❌ [SocketProgress] AI Bridge调用失败:', error);
      throw new Error(error.message || 'AI处理失败');
    }
  }

  /**
   * 获取Socket.IO服务器实例
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * 手动发送进度事件（用于外部调用）
   */
  public async sendProgress(
    sessionId: string,
    stepId: string,
    message: string,
    progress: number,
    userId?: number
  ): Promise<void> {
    if (this.progressService.getActiveSession(sessionId)) {
      await this.progressService.sendProgress(sessionId, stepId, message, progress);
    } else {
      // 如果没有活跃会话，创建一个临时的
      if (userId) {
        this.progressService.startProgressTracking({
          sessionId,
          queryId: `manual_${Date.now()}`,
          userId,
          totalSteps: 10
        });
        await this.progressService.sendProgress(sessionId, stepId, message, progress);
      }
    }
  }

  /**
   * 获取连接统计
   */
  public getConnectionStats(): {
    connectedClients: number;
    activeSessions: number;
    rooms: string[];
  } {
    const sockets = this.io.sockets.sockets;
    const rooms = Array.from(this.io.sockets.adapter.rooms.keys());
    const activeSessions = this.progressService.getActiveSessions();

    return {
      connectedClients: sockets.size,
      activeSessions: activeSessions.length,
      rooms: rooms
    };
  }
}

export default SocketProgressMiddleware;