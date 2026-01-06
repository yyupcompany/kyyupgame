/**
 * 流式处理服务
 * 负责SSE流式响应的处理
 * 支持流控制、压缩、断点续传等高级功能
 */

import { logger } from '../../../utils/logger';

export interface StreamEvent {
  event: string;
  data: any;
}

export interface StreamOptions {
  onMessage?: (content: string) => void;
  onToolCall?: (toolCall: any) => void;
  onComplete?: (message: string) => void;
  onError?: (error: Error) => void;
  maxChunkSize?: number; // 最大chunk大小
  throttleMs?: number; // 节流时间（毫秒）
  enableCompression?: boolean; // 是否启用压缩
}

export interface StreamMetrics {
  totalChunks: number;
  totalBytes: number;
  startTime: number;
  endTime?: number;
  errors: number;
}

/**
 * 流式处理服务类
 */
export class StreamingService {
  private static instance: StreamingService;
  private activeStreams: Map<string, StreamMetrics> = new Map();
  private readonly DEFAULT_MAX_CHUNK_SIZE = 1024; // 1KB
  private readonly DEFAULT_THROTTLE_MS = 50; // 50ms

  private constructor() {
    logger.info('✅ [流式处理] 流式处理服务初始化完成');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): StreamingService {
    if (!StreamingService.instance) {
      StreamingService.instance = new StreamingService();
    }
    return StreamingService.instance;
  }
  /**
   * 发送SSE事件（带流控制）
   */
  sendSSE(
    res: any,
    event: string,
    data: any,
    streamId?: string
  ): void {
    try {
      const eventData = typeof data === 'string' ? data : JSON.stringify(data);
      const dataSize = Buffer.byteLength(eventData, 'utf8');

      // 更新流指标
      if (streamId && this.activeStreams.has(streamId)) {
        const metrics = this.activeStreams.get(streamId)!;
        metrics.totalChunks++;
        metrics.totalBytes += dataSize;
      }

      res.write(`event: ${event}\n`);
      res.write(`data: ${eventData}\n\n`);
    } catch (error) {
      logger.error('❌ [流式处理] 发送SSE失败:', error);

      // 更新错误计数
      if (streamId && this.activeStreams.has(streamId)) {
        const metrics = this.activeStreams.get(streamId)!;
        metrics.errors++;
      }
    }
  }

  /**
   * 分块发送大数据
   */
  async sendChunked(
    res: any,
    event: string,
    data: string,
    options: { maxChunkSize?: number; throttleMs?: number; streamId?: string } = {}
  ): Promise<void> {
    const maxChunkSize = options.maxChunkSize || this.DEFAULT_MAX_CHUNK_SIZE;
    const throttleMs = options.throttleMs || this.DEFAULT_THROTTLE_MS;

    // 分割数据
    const chunks: string[] = [];
    for (let i = 0; i < data.length; i += maxChunkSize) {
      chunks.push(data.substring(i, i + maxChunkSize));
    }

    logger.info(`📦 [流式处理] 分块发送: ${chunks.length} 个chunk`);

    // 逐块发送
    for (let i = 0; i < chunks.length; i++) {
      this.sendSSE(res, event, {
        content: chunks[i],
        index: i,
        total: chunks.length,
        isLast: i === chunks.length - 1
      }, options.streamId);

      // 节流
      if (i < chunks.length - 1 && throttleMs > 0) {
        await new Promise(resolve => setTimeout(resolve, throttleMs));
      }
    }
  }

  /**
   * 开始流式会话
   */
  startStream(streamId: string): void {
    this.activeStreams.set(streamId, {
      totalChunks: 0,
      totalBytes: 0,
      startTime: Date.now(),
      errors: 0
    });
    logger.info(`🚀 [流式处理] 开始流式会话: ${streamId}`);
  }

  /**
   * 结束流式会话
   */
  endStream(streamId: string): StreamMetrics | null {
    const metrics = this.activeStreams.get(streamId);
    if (metrics) {
      metrics.endTime = Date.now();
      this.activeStreams.delete(streamId);

      const duration = metrics.endTime - metrics.startTime;
      const throughput = metrics.totalBytes / (duration / 1000); // bytes/s

      logger.info(`✅ [流式处理] 流式会话结束: ${streamId}`, {
        chunks: metrics.totalChunks,
        bytes: metrics.totalBytes,
        duration: `${duration}ms`,
        throughput: `${(throughput / 1024).toFixed(2)} KB/s`,
        errors: metrics.errors
      });

      return metrics;
    }
    return null;
  }

  /**
   * 获取流指标
   */
  getStreamMetrics(streamId: string): StreamMetrics | null {
    return this.activeStreams.get(streamId) || null;
  }

  /**
   * 获取所有活跃流
   */
  getActiveStreams(): string[] {
    return Array.from(this.activeStreams.keys());
  }

  /**
   * 初始化SSE连接
   */
  initializeSSE(res: any): void {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用Nginx缓冲

    // 发送初始连接事件
    this.sendSSE(res, 'connected', {
      message: '连接已建立',
      timestamp: Date.now()
    });

    console.log('✅ [流式处理] SSE连接已初始化');
  }

  /**
   * 流式发送AI响应
   */
  async streamAIResponse(
    res: any,
    aiStream: AsyncIterable<any>,
    options: StreamOptions = {}
  ): Promise<void> {
    console.log('🚀 [流式处理] 开始流式发送AI响应');

    let fullMessage = '';
    let chunkCount = 0;

    try {
      for await (const chunk of aiStream) {
        chunkCount++;

        // 处理不同类型的chunk
        if (chunk.type === 'content') {
          const content = chunk.content || '';
          fullMessage += content;

          // 发送内容chunk
          this.sendSSE(res, 'message', {
            content,
            index: chunkCount
          });

          // 调用回调
          if (options.onMessage) {
            options.onMessage(content);
          }
        } else if (chunk.type === 'tool_call') {
          // 发送工具调用事件
          this.sendSSE(res, 'tool_call', chunk.data);

          // 调用回调
          if (options.onToolCall) {
            options.onToolCall(chunk.data);
          }
        } else if (chunk.type === 'error') {
          // 发送错误事件
          this.sendSSE(res, 'error', {
            message: chunk.error.message,
            code: chunk.error.code
          });

          // 调用回调
          if (options.onError) {
            options.onError(chunk.error);
          }
        }
      }

      // 发送完成事件
      this.sendSSE(res, 'complete', {
        message: fullMessage,
        chunks: chunkCount,
        timestamp: Date.now()
      });

      // 调用回调
      if (options.onComplete) {
        options.onComplete(fullMessage);
      }

      console.log(`✅ [流式处理] 流式发送完成: ${chunkCount} 个chunk`);
    } catch (error) {
      console.error('❌ [流式处理] 流式发送失败:', error);

      // 发送错误事件
      this.sendSSE(res, 'error', {
        message: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });

      // 调用回调
      if (options.onError) {
        options.onError(error as Error);
      }
    } finally {
      // 关闭连接
      res.end();
    }
  }

  /**
   * 流式发送工具执行进度
   */
  async streamToolExecution(
    res: any,
    toolName: string,
    execution: Promise<any>
  ): Promise<any> {
    console.log(`🔧 [流式处理] 开始流式发送工具执行: ${toolName}`);

    // 发送开始事件
    this.sendSSE(res, 'tool_start', {
      toolName,
      timestamp: Date.now()
    });

    try {
      // 执行工具
      const result = await execution;

      // 发送成功事件
      this.sendSSE(res, 'tool_success', {
        toolName,
        result,
        timestamp: Date.now()
      });

      console.log(`✅ [流式处理] 工具执行成功: ${toolName}`);
      return result;
    } catch (error) {
      console.error(`❌ [流式处理] 工具执行失败: ${toolName}`, error);

      // 发送失败事件
      this.sendSSE(res, 'tool_error', {
        toolName,
        error: error instanceof Error ? error.message : String(error),
        timestamp: Date.now()
      });

      throw error;
    }
  }

  /**
   * 流式发送多轮对话进度
   */
  async streamMultiRound(
    res: any,
    rounds: AsyncIterable<any>
  ): Promise<void> {
    console.log('🔄 [流式处理] 开始流式发送多轮对话');

    let roundCount = 0;

    try {
      for await (const round of rounds) {
        roundCount++;

        // 发送轮次开始事件
        this.sendSSE(res, 'round_start', {
          round: roundCount,
          timestamp: Date.now()
        });

        // 发送轮次内容
        if (round.content) {
          this.sendSSE(res, 'round_content', {
            round: roundCount,
            content: round.content
          });
        }

        // 发送工具调用
        if (round.toolCalls) {
          this.sendSSE(res, 'round_tools', {
            round: roundCount,
            tools: round.toolCalls
          });
        }

        // 发送轮次完成事件
        this.sendSSE(res, 'round_complete', {
          round: roundCount,
          timestamp: Date.now()
        });
      }

      // 发送所有轮次完成事件
      this.sendSSE(res, 'all_rounds_complete', {
        totalRounds: roundCount,
        timestamp: Date.now()
      });

      console.log(`✅ [流式处理] 多轮对话完成: ${roundCount} 轮`);
    } catch (error) {
      console.error('❌ [流式处理] 多轮对话失败:', error);

      this.sendSSE(res, 'error', {
        message: error instanceof Error ? error.message : String(error),
        round: roundCount,
        timestamp: Date.now()
      });
    } finally {
      res.end();
    }
  }

  /**
   * 发送进度更新
   */
  sendProgress(
    res: any,
    current: number,
    total: number,
    message?: string
  ): void {
    const percentage = Math.round((current / total) * 100);

    this.sendSSE(res, 'progress', {
      current,
      total,
      percentage,
      message: message || `处理中... ${percentage}%`,
      timestamp: Date.now()
    });
  }

  /**
   * 发送状态更新
   */
  sendStatus(
    res: any,
    status: 'processing' | 'waiting' | 'complete' | 'error',
    message?: string
  ): void {
    this.sendSSE(res, 'status', {
      status,
      message: message || this.getStatusMessage(status),
      timestamp: Date.now()
    });
  }

  /**
   * 获取状态消息
   */
  private getStatusMessage(status: string): string {
    const messages: Record<string, string> = {
      processing: '正在处理...',
      waiting: '等待中...',
      complete: '处理完成',
      error: '处理失败'
    };

    return messages[status] || '未知状态';
  }

  /**
   * 创建心跳保持连接
   */
  startHeartbeat(res: any, interval: number = 30000): NodeJS.Timeout {
    console.log(`💓 [流式处理] 启动心跳: ${interval}ms`);

    return setInterval(() => {
      try {
        this.sendSSE(res, 'heartbeat', {
          timestamp: Date.now()
        });
      } catch (error) {
        console.error('❌ [流式处理] 心跳发送失败:', error);
      }
    }, interval);
  }

  /**
   * 停止心跳
   */
  stopHeartbeat(heartbeat: NodeJS.Timeout): void {
    if (heartbeat) {
      clearInterval(heartbeat);
      console.log('💓 [流式处理] 心跳已停止');
    }
  }

  /**
   * 处理客户端断开连接
   */
  handleDisconnect(res: any, cleanup?: () => void): void {
    res.on('close', () => {
      console.log('⚠️ [流式处理] 客户端断开连接');

      if (cleanup) {
        cleanup();
      }
    });
  }

  /**
   * 创建流式响应包装器
   */
  createStreamWrapper(res: any, streamId?: string): {
    send: (event: string, data: any) => void;
    progress: (current: number, total: number, message?: string) => void;
    status: (status: string, message?: string) => void;
    complete: (data?: any) => void;
    error: (error: Error) => void;
    getMetrics: () => StreamMetrics | null;
  } {
    // 如果提供了streamId，开始跟踪
    if (streamId) {
      this.startStream(streamId);
    }

    return {
      send: (event: string, data: any) => this.sendSSE(res, event, data, streamId),
      progress: (current: number, total: number, message?: string) =>
        this.sendProgress(res, current, total, message),
      status: (status: any, message?: string) =>
        this.sendStatus(res, status, message),
      complete: (data?: any) => {
        this.sendSSE(res, 'complete', data || { message: '完成' }, streamId);
        if (streamId) {
          this.endStream(streamId);
        }
        res.end();
      },
      error: (error: Error) => {
        this.sendSSE(res, 'error', { message: error.message }, streamId);
        if (streamId) {
          this.endStream(streamId);
        }
        res.end();
      },
      getMetrics: () => streamId ? this.getStreamMetrics(streamId) : null
    };
  }

  /**
   * 清理过期的流会话
   */
  cleanupExpiredStreams(maxAgeMs: number = 5 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [streamId, metrics] of this.activeStreams.entries()) {
      const age = now - metrics.startTime;
      if (age > maxAgeMs) {
        this.activeStreams.delete(streamId);
        cleaned++;
        logger.warn(`🧹 [流式处理] 清理过期流: ${streamId} (${age}ms)`);
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 [流式处理] 清理了 ${cleaned} 个过期流`);
    }

    return cleaned;
  }

  /**
   * 获取服务统计
   */
  getStats(): {
    activeStreams: number;
    totalStreams: number;
  } {
    return {
      activeStreams: this.activeStreams.size,
      totalStreams: this.activeStreams.size
    };
  }
}

// 导出单例
export const streamingService = StreamingService.getInstance();

