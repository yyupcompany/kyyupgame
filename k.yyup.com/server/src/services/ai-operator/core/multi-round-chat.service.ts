/**
 * 多轮对话服务
 * 负责管理多轮对话状态、协调工具调用、结果整合
 * 支持对话持久化、恢复、导出等高级功能
 */

import { ToolExecutionResult } from './tool-orchestrator.service';
import { logger } from '../../../utils/logger';
import fs from 'fs/promises';
import path from 'path';

export interface ChatRound {
  roundNumber: number;
  userMessage: string;
  aiResponse?: string;
  toolCalls?: any[];
  toolResults?: ToolExecutionResult[];
  timestamp: number;
  status: 'pending' | 'processing' | 'complete' | 'error';
  error?: Error;
}

export interface MultiRoundContext {
  conversationId: string;
  userId: string;
  rounds: ChatRound[];
  currentRound: number;
  maxRounds: number;
  isComplete: boolean;
  finalResult?: any;
  createdAt?: number;
  updatedAt?: number;
  metadata?: Record<string, any>;
}

export interface ConversationExport {
  context: MultiRoundContext;
  exportedAt: number;
  version: string;
}

export interface PersistenceOptions {
  storageDir?: string;
  autoSave?: boolean;
  saveInterval?: number;
}

/**
 * 多轮对话服务类
 */
export class MultiRoundChatService {
  private static instance: MultiRoundChatService;
  private contexts: Map<string, MultiRoundContext> = new Map();
  private readonly DEFAULT_MAX_ROUNDS = 20;
  private readonly STORAGE_DIR = path.join(process.cwd(), 'data', 'conversations');
  private readonly VERSION = '1.0.0';
  private autoSaveInterval?: NodeJS.Timeout;
  private persistenceEnabled = false;

  private constructor() {
    logger.info('✅ [多轮对话] 多轮对话服务初始化完成');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): MultiRoundChatService {
    if (!MultiRoundChatService.instance) {
      MultiRoundChatService.instance = new MultiRoundChatService();
    }
    return MultiRoundChatService.instance;
  }

  /**
   * 启用持久化
   */
  async enablePersistence(options: PersistenceOptions = {}): Promise<void> {
    const storageDir = options.storageDir || this.STORAGE_DIR;

    try {
      // 确保存储目录存在
      await fs.mkdir(storageDir, { recursive: true });
      this.persistenceEnabled = true;

      logger.info(`✅ [多轮对话] 持久化已启用: ${storageDir}`);

      // 启用自动保存
      if (options.autoSave) {
        const interval = options.saveInterval || 60000; // 默认1分钟
        this.autoSaveInterval = setInterval(() => {
          this.saveAllContexts().catch(err => {
            logger.error('❌ [多轮对话] 自动保存失败:', err);
          });
        }, interval);
        logger.info(`✅ [多轮对话] 自动保存已启用: ${interval}ms`);
      }
    } catch (error) {
      logger.error('❌ [多轮对话] 启用持久化失败:', error);
      throw error;
    }
  }

  /**
   * 禁用持久化
   */
  disablePersistence(): void {
    this.persistenceEnabled = false;

    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = undefined;
      logger.info('✅ [多轮对话] 自动保存已禁用');
    }

    logger.info('✅ [多轮对话] 持久化已禁用');
  }

  /**
   * 保存单个对话上下文
   */
  async saveContext(conversationId: string): Promise<void> {
    const context = this.contexts.get(conversationId);
    if (!context) {
      throw new Error(`Context not found: ${conversationId}`);
    }

    const filePath = path.join(this.STORAGE_DIR, `${conversationId}.json`);
    const exportData: ConversationExport = {
      context,
      exportedAt: Date.now(),
      version: this.VERSION
    };

    try {
      await fs.writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf-8');
      logger.info(`💾 [多轮对话] 保存上下文: ${conversationId}`);
    } catch (error) {
      logger.error(`❌ [多轮对话] 保存上下文失败: ${conversationId}`, error);
      throw error;
    }
  }

  /**
   * 保存所有对话上下文
   */
  async saveAllContexts(): Promise<void> {
    const savePromises = Array.from(this.contexts.keys()).map(id =>
      this.saveContext(id).catch((err: Error) => {
        logger.error(`❌ [多轮对话] 保存失败: ${id}`, err);
      })
    );

    await Promise.all(savePromises);
    logger.info(`💾 [多轮对话] 保存所有上下文: ${this.contexts.size} 个`);
  }

  /**
   * 加载对话上下文
   */
  async loadContext(conversationId: string): Promise<MultiRoundContext | null> {
    const filePath = path.join(this.STORAGE_DIR, `${conversationId}.json`);

    try {
      const data = await fs.readFile(filePath, 'utf-8');
      const exportData: ConversationExport = JSON.parse(data);

      // 恢复上下文
      this.contexts.set(conversationId, exportData.context);
      logger.info(`📂 [多轮对话] 加载上下文: ${conversationId}`);

      return exportData.context;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error(`❌ [多轮对话] 加载上下文失败: ${conversationId}`, error);
      }
      return null;
    }
  }

  /**
   * 加载所有对话上下文
   */
  async loadAllContexts(): Promise<number> {
    try {
      const files = await fs.readdir(this.STORAGE_DIR);
      const jsonFiles = files.filter(f => f.endsWith('.json'));

      let loaded = 0;
      for (const file of jsonFiles) {
        const conversationId = file.replace('.json', '');
        const context = await this.loadContext(conversationId);
        if (context) {
          loaded++;
        }
      }

      logger.info(`📂 [多轮对话] 加载所有上下文: ${loaded} 个`);
      return loaded;
    } catch (error) {
      logger.error('❌ [多轮对话] 加载所有上下文失败:', error);
      return 0;
    }
  }

  /**
   * 删除持久化的对话
   */
  async deletePersistedContext(conversationId: string): Promise<void> {
    const filePath = path.join(this.STORAGE_DIR, `${conversationId}.json`);

    try {
      await fs.unlink(filePath);
      logger.info(`🗑️ [多轮对话] 删除持久化上下文: ${conversationId}`);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        logger.error(`❌ [多轮对话] 删除失败: ${conversationId}`, error);
        throw error;
      }
    }
  }

  /**
   * 初始化多轮对话上下文
   */
  initializeContext(
    conversationId: string,
    userId: string,
    maxRounds?: number,
    metadata?: Record<string, any>
  ): MultiRoundContext {
    const now = Date.now();
    const context: MultiRoundContext = {
      conversationId,
      userId,
      rounds: [],
      currentRound: 0,
      maxRounds: maxRounds || this.DEFAULT_MAX_ROUNDS,
      isComplete: false,
      createdAt: now,
      updatedAt: now,
      metadata
    };

    this.contexts.set(conversationId, context);
    logger.info(`✅ [多轮对话] 初始化上下文: ${conversationId}, 最大轮数: ${context.maxRounds}`);

    return context;
  }

  /**
   * 获取上下文
   */
  getContext(conversationId: string): MultiRoundContext | undefined {
    return this.contexts.get(conversationId);
  }

  /**
   * 开始新一轮对话
   */
  startRound(
    conversationId: string,
    userMessage: string
  ): ChatRound {
    const context = this.contexts.get(conversationId);
    if (!context) {
      throw new Error(`Context not found: ${conversationId}`);
    }

    // 检查是否超过最大轮数
    if (context.currentRound >= context.maxRounds) {
      throw new Error(`Max rounds exceeded: ${context.maxRounds}`);
    }

    context.currentRound++;

    const round: ChatRound = {
      roundNumber: context.currentRound,
      userMessage,
      timestamp: Date.now(),
      status: 'pending'
    };

    context.rounds.push(round);
    console.log(`🔄 [多轮对话] 开始第 ${context.currentRound} 轮`);

    return round;
  }

  /**
   * 更新当前轮次状态
   */
  updateRoundStatus(
    conversationId: string,
    status: ChatRound['status'],
    data?: Partial<ChatRound>
  ): void {
    const context = this.contexts.get(conversationId);
    if (!context || context.rounds.length === 0) {
      return;
    }

    const currentRound = context.rounds[context.rounds.length - 1];
    currentRound.status = status;

    if (data) {
      Object.assign(currentRound, data);
    }

    this.updateContextTimestamp(conversationId);
    logger.info(`📝 [多轮对话] 更新轮次状态: ${status}`);
  }

  /**
   * 添加AI响应
   */
  addAIResponse(
    conversationId: string,
    response: string
  ): void {
    const context = this.contexts.get(conversationId);
    if (!context || context.rounds.length === 0) {
      return;
    }

    const currentRound = context.rounds[context.rounds.length - 1];
    currentRound.aiResponse = response;

    this.updateContextTimestamp(conversationId);
    logger.info(`💬 [多轮对话] 添加AI响应: ${response.substring(0, 50)}...`);
  }

  /**
   * 添加工具调用
   */
  addToolCalls(
    conversationId: string,
    toolCalls: any[]
  ): void {
    const context = this.contexts.get(conversationId);
    if (!context || context.rounds.length === 0) {
      return;
    }

    const currentRound = context.rounds[context.rounds.length - 1];
    currentRound.toolCalls = toolCalls;

    this.updateContextTimestamp(conversationId);
    logger.info(`🔧 [多轮对话] 添加工具调用: ${toolCalls.length} 个`);
  }

  /**
   * 添加工具执行结果
   */
  addToolResults(
    conversationId: string,
    results: ToolExecutionResult[]
  ): void {
    const context = this.contexts.get(conversationId);
    if (!context || context.rounds.length === 0) {
      return;
    }

    const currentRound = context.rounds[context.rounds.length - 1];
    currentRound.toolResults = results;

    const successCount = results.filter(r => r.success).length;
    this.updateContextTimestamp(conversationId);
    logger.info(`✅ [多轮对话] 添加工具结果: ${successCount}/${results.length} 成功`);
  }

  /**
   * 完成当前轮次
   */
  completeRound(conversationId: string): void {
    this.updateRoundStatus(conversationId, 'complete');
    logger.info(`✅ [多轮对话] 完成当前轮次`);
  }

  /**
   * 标记轮次错误
   */
  markRoundError(
    conversationId: string,
    error: Error
  ): void {
    this.updateRoundStatus(conversationId, 'error', { error });
    console.error(`❌ [多轮对话] 轮次错误:`, error);
  }

  /**
   * 判断是否需要继续
   */
  shouldContinue(conversationId: string): boolean {
    const context = this.contexts.get(conversationId);
    if (!context) {
      return false;
    }

    // 已完成
    if (context.isComplete) {
      return false;
    }

    // 达到最大轮数
    if (context.currentRound >= context.maxRounds) {
      console.log(`⚠️ [多轮对话] 达到最大轮数: ${context.maxRounds}`);
      return false;
    }

    // 检查最后一轮是否有工具调用
    const lastRound = context.rounds[context.rounds.length - 1];
    if (!lastRound || !lastRound.toolCalls || lastRound.toolCalls.length === 0) {
      console.log(`✅ [多轮对话] 无需继续，没有工具调用`);
      return false;
    }

    return true;
  }

  /**
   * 完成多轮对话
   */
  completeConversation(
    conversationId: string,
    finalResult?: any
  ): void {
    const context = this.contexts.get(conversationId);
    if (!context) {
      return;
    }

    context.isComplete = true;
    context.finalResult = finalResult;

    console.log(`✅ [多轮对话] 对话完成: ${context.currentRound} 轮`);
  }

  /**
   * 获取对话历史
   */
  getHistory(conversationId: string): ChatRound[] {
    const context = this.contexts.get(conversationId);
    return context ? context.rounds : [];
  }

  /**
   * 获取对话摘要
   */
  getSummary(conversationId: string): any {
    const context = this.contexts.get(conversationId);
    if (!context) {
      return null;
    }

    const totalToolCalls = context.rounds.reduce(
      (sum, round) => sum + (round.toolCalls?.length || 0),
      0
    );

    const successfulRounds = context.rounds.filter(
      round => round.status === 'complete'
    ).length;

    return {
      conversationId: context.conversationId,
      userId: context.userId,
      totalRounds: context.currentRound,
      successfulRounds,
      totalToolCalls,
      isComplete: context.isComplete,
      duration: context.rounds.length > 0
        ? context.rounds[context.rounds.length - 1].timestamp - context.rounds[0].timestamp
        : 0
    };
  }

  /**
   * 格式化对话历史为消息列表
   */
  formatAsMessages(conversationId: string): any[] {
    const context = this.contexts.get(conversationId);
    if (!context) {
      return [];
    }

    const messages: any[] = [];

    context.rounds.forEach(round => {
      // 用户消息
      messages.push({
        role: 'user',
        content: round.userMessage
      });

      // AI响应
      if (round.aiResponse) {
        messages.push({
          role: 'assistant',
          content: round.aiResponse
        });
      }

      // 工具调用
      if (round.toolCalls && round.toolCalls.length > 0) {
        round.toolCalls.forEach(toolCall => {
          messages.push({
            role: 'assistant',
            content: null,
            tool_calls: [toolCall]
          });
        });
      }

      // 工具结果
      if (round.toolResults && round.toolResults.length > 0) {
        round.toolResults.forEach(result => {
          messages.push({
            role: 'tool',
            tool_call_id: result.toolName,
            content: JSON.stringify(result.data)
          });
        });
      }
    });

    return messages;
  }

  /**
   * 清理上下文
   */
  clearContext(conversationId: string): void {
    this.contexts.delete(conversationId);
    console.log(`🗑️ [多轮对话] 清理上下文: ${conversationId}`);
  }

  /**
   * 清理所有上下文
   */
  clearAllContexts(): void {
    const count = this.contexts.size;
    this.contexts.clear();
    console.log(`🗑️ [多轮对话] 清理所有上下文: ${count} 个`);
  }

  /**
   * 导出对话为JSON
   */
  exportConversation(conversationId: string): ConversationExport | null {
    const context = this.contexts.get(conversationId);
    if (!context) {
      return null;
    }

    return {
      context,
      exportedAt: Date.now(),
      version: this.VERSION
    };
  }

  /**
   * 导入对话
   */
  importConversation(exportData: ConversationExport): void {
    const { context } = exportData;
    this.contexts.set(context.conversationId, context);
    logger.info(`📥 [多轮对话] 导入对话: ${context.conversationId}`);
  }

  /**
   * 分析对话质量
   */
  analyzeConversation(conversationId: string): {
    quality: number;
    metrics: {
      avgRoundDuration: number;
      toolUsageRate: number;
      successRate: number;
      errorRate: number;
    };
  } | null {
    const context = this.contexts.get(conversationId);
    if (!context || context.rounds.length === 0) {
      return null;
    }

    const rounds = context.rounds;
    const totalRounds = rounds.length;

    // 计算平均轮次时长
    let totalDuration = 0;
    for (let i = 1; i < rounds.length; i++) {
      totalDuration += rounds[i].timestamp - rounds[i - 1].timestamp;
    }
    const avgRoundDuration = totalRounds > 1 ? totalDuration / (totalRounds - 1) : 0;

    // 计算工具使用率
    const roundsWithTools = rounds.filter(r => r.toolCalls && r.toolCalls.length > 0).length;
    const toolUsageRate = roundsWithTools / totalRounds;

    // 计算成功率
    const successfulRounds = rounds.filter(r => r.status === 'complete').length;
    const successRate = successfulRounds / totalRounds;

    // 计算错误率
    const errorRounds = rounds.filter(r => r.status === 'error').length;
    const errorRate = errorRounds / totalRounds;

    // 计算综合质量分数 (0-100)
    const quality = Math.round(
      successRate * 50 +           // 成功率占50%
      (1 - errorRate) * 30 +       // 低错误率占30%
      toolUsageRate * 20           // 工具使用占20%
    );

    return {
      quality,
      metrics: {
        avgRoundDuration,
        toolUsageRate,
        successRate,
        errorRate
      }
    };
  }

  /**
   * 获取统计信息
   */
  getStats(): {
    activeContexts: number;
    totalRounds: number;
    completedConversations: number;
    persistenceEnabled: boolean;
    contexts: Array<{
      conversationId: string;
      currentRound: number;
      maxRounds: number;
      isComplete: boolean;
      createdAt?: number;
    }>;
  } {
    const contexts = Array.from(this.contexts.values());
    const totalRounds = contexts.reduce((sum, ctx) => sum + ctx.currentRound, 0);
    const completedConversations = contexts.filter(ctx => ctx.isComplete).length;

    return {
      activeContexts: this.contexts.size,
      totalRounds,
      completedConversations,
      persistenceEnabled: this.persistenceEnabled,
      contexts: contexts.map(ctx => ({
        conversationId: ctx.conversationId,
        currentRound: ctx.currentRound,
        maxRounds: ctx.maxRounds,
        isComplete: ctx.isComplete,
        createdAt: ctx.createdAt
      }))
    };
  }

  /**
   * 清理过期的对话上下文
   */
  cleanupExpiredContexts(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [conversationId, context] of this.contexts.entries()) {
      const age = now - (context.updatedAt || context.createdAt || 0);
      if (age > maxAgeMs && context.isComplete) {
        this.contexts.delete(conversationId);
        cleaned++;
        logger.info(`🧹 [多轮对话] 清理过期对话: ${conversationId} (${age}ms)`);
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 [多轮对话] 清理了 ${cleaned} 个过期对话`);
    }

    return cleaned;
  }

  /**
   * 更新上下文时间戳
   */
  private updateContextTimestamp(conversationId: string): void {
    const context = this.contexts.get(conversationId);
    if (context) {
      context.updatedAt = Date.now();
    }
  }
}

// 导出单例
export const multiRoundChatService = MultiRoundChatService.getInstance();

