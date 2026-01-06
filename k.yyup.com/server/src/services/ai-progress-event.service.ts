/**
 * AI查询进度事件服务
 * 为前端提供实时进度反馈，解决复杂查询用户等待焦虑
 */

export interface ProgressStep {
  id: string;
  message: string;
  progress: number;
  estimatedTime?: number;
  detail?: string;
}

export interface ProgressEvent {
  sessionId: string;
  stepId: string;
  currentStep: ProgressStep;
  totalSteps: number;
  timestamp: number;
  queryId?: string;
  userId: number;
}

export interface QueryProgressConfig {
  sessionId: string;
  queryId: string;
  userId: number;
  totalSteps: number;
  onProgress?: (event: ProgressEvent) => void;
  onComplete?: (result: any) => void;
  onError?: (error: Error) => void;
}

export class AIProgressEventService {
  private static instance: AIProgressEventService;
  private activeSessions: Map<string, QueryProgressConfig> = new Map();
  // 🔧 已移除 Socket.IO 依赖 - 不再使用WebSocket推送进度
  // private io: any;

  private constructor() {}

  public static getInstance(): AIProgressEventService {
    if (!AIProgressEventService.instance) {
      AIProgressEventService.instance = new AIProgressEventService();
    }
    return AIProgressEventService.instance;
  }

  /**
   * 初始化Socket.IO集成
   * 🔧 已废弃 - 不再使用WebSocket
   */
  public initializeSocketIO(io: any): void {
    // this.io = io;
    console.log('⚠️ [ProgressEvent] Socket.IO已移除，进度推送功能已禁用');
  }

  /**
   * 开始查询进度跟踪
   */
  public startProgressTracking(config: QueryProgressConfig): void {
    this.activeSessions.set(config.sessionId, config);
    console.log(`🎯 [ProgressEvent] 开始跟踪查询进度: ${config.sessionId}`);
  }

  /**
   * 发送进度事件
   */
  public async sendProgress(
    sessionId: string,
    stepId: string,
    message: string,
    progress: number,
    detail?: string
  ): Promise<void> {
    const config = this.activeSessions.get(sessionId);
    if (!config) {
      console.warn(`⚠️ [ProgressEvent] 未找到会话配置: ${sessionId}`);
      return;
    }

    const progressStep: ProgressStep = {
      id: stepId,
      message,
      progress,
      detail
    };

    const progressEvent: ProgressEvent = {
      sessionId,
      stepId,
      currentStep: progressStep,
      totalSteps: config.totalSteps,
      timestamp: Date.now(),
      queryId: config.queryId,
      userId: config.userId
    };

    // 🔧 已移除WebSocket推送 - 只保留本地回调
    // if (this.io) {
    //   this.io.to(`user_${config.userId}`).emit('ai_query_progress', progressEvent);
    // }

    // 触发本地回调（用于内部处理）
    if (config.onProgress) {
      config.onProgress(progressEvent);
    }

    console.log(`📊 [ProgressEvent] 进度推送: ${message} (${progress}%)`);
  }

  /**
   * 查询步骤定义
   */
  public getQuerySteps(queryComplexity: 'simple' | 'medium' | 'complex' = 'medium'): ProgressStep[] {
    const baseSteps = [
      { id: 'start', message: '开始处理查询...', progress: 5 },
      { id: 'analyze', message: '分析查询意图...', progress: 15 },
      { id: 'model_select', message: '选择最优AI模型...', progress: 25 },
      { id: 'cache_check', message: '检查缓存结果...', progress: 35 },
    ];

    const simpleSteps = [
      ...baseSteps,
      { id: 'execute', message: '执行快速查询...', progress: 70 },
      { id: 'format', message: '格式化结果...', progress: 90 },
      { id: 'complete', message: '查询完成', progress: 100 }
    ];

    const mediumSteps = [
      ...baseSteps,
      { id: 'data_prepare', message: '准备查询数据...', progress: 45 },
      { id: 'execute', message: '执行AI查询...', progress: 65 },
      { id: 'analyze_result', message: '分析查询结果...', progress: 80 },
      { id: 'format', message: '格式化响应...', progress: 95 },
      { id: 'complete', message: '查询完成', progress: 100 }
    ];

    const complexSteps = [
      ...baseSteps,
      { id: 'data_prepare', message: '准备查询数据...', progress: 45 },
      { id: 'table_analysis', message: '分析相关表结构...', progress: 55 },
      { id: 'sql_generation', message: '生成优化SQL语句...', progress: 65 },
      { id: 'execute', message: '执行复杂查询...', progress: 75 },
      { id: 'result_analysis', message: '深度分析结果...', progress: 85 },
      { id: 'visualization', message: '生成智能可视化...', progress: 92 },
      { id: 'format', message: '组装最终响应...', progress: 98 },
      { id: 'complete', message: '复杂查询完成', progress: 100 }
    ];

    switch (queryComplexity) {
      case 'simple': return simpleSteps;
      case 'complex': return complexSteps;
      default: return mediumSteps;
    }
  }

  /**
   * 完成查询跟踪
   */
  public completeProgress(sessionId: string, result?: any): void {
    const config = this.activeSessions.get(sessionId);
    if (!config) return;

    // 发送完成事件
    this.sendProgress(sessionId, 'complete', '查询完成', 100);

    // 触发完成回调
    if (config.onComplete) {
      config.onComplete(result);
    }

    // 清理会话
    this.activeSessions.delete(sessionId);
    console.log(`✅ [ProgressEvent] 查询完成: ${sessionId}`);
  }

  /**
   * 处理错误
   */
  public handleProgressError(sessionId: string, error: Error): void {
    const config = this.activeSessions.get(sessionId);
    if (!config) return;

    // 🔧 已移除WebSocket错误推送
    // if (this.io) {
    //   this.io.to(`user_${config.userId}`).emit('ai_query_error', {
    //     sessionId,
    //     error: error.message,
    //     timestamp: Date.now()
    //   });
    // }

    // 触发错误回调
    if (config.onError) {
      config.onError(error);
    }

    // 清理会话
    this.activeSessions.delete(sessionId);
    console.log(`❌ [ProgressEvent] 查询错误: ${sessionId}`, error);
  }

  /**
   * 获取活跃会话状态
   */
  public getActiveSession(sessionId: string): QueryProgressConfig | undefined {
    return this.activeSessions.get(sessionId);
  }

  /**
   * 获取所有活跃会话
   */
  public getActiveSessions(): string[] {
    return Array.from(this.activeSessions.keys());
  }

  /**
   * 清理过期会话
   */
  public cleanupExpiredSessions(): void {
    const now = Date.now();
    const expiredSessions: string[] = [];

    this.activeSessions.forEach((config, sessionId) => {
      // 假设5分钟未活动为过期
      const lastActivity = now;
      if (lastActivity > 5 * 60 * 1000) {
        expiredSessions.push(sessionId);
      }
    });

    expiredSessions.forEach(sessionId => {
      this.activeSessions.delete(sessionId);
      console.log(`🧹 [ProgressEvent] 清理过期会话: ${sessionId}`);
    });
  }
}

export default AIProgressEventService.getInstance();