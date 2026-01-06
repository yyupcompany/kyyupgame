/**
 * 统一智能决策协调器 (重构版)
 * 使用新的子服务架构，简化主逻辑，提升可维护性
 * 集成AIBridgeService和缓存机制
 */

import { intentRecognitionService } from './core/intent-recognition.service';
import { promptBuilderService } from './core/prompt-builder.service';
import { toolOrchestratorService } from './core/tool-orchestrator.service';
import { streamingService } from './core/streaming.service';
// import { multiRoundChatService } from './core/multi-round-chat.service'; // 暂未使用
import { memoryIntegrationService } from './core/memory-integration.service';

import { unifiedAIBridge } from '../unified-ai-bridge.service';
import { aiModelCacheService } from '../ai-model-cache.service';
import { getMemorySystem } from '../memory/six-dimension-memory.service';
import { logger } from '../../utils/logger';

/**
 * 用户请求接口
 */
export interface UserRequest {
  content: string;
  userId: string;
  conversationId: string;
  context?: any;
}

/**
 * 响应接口
 */
export interface IntelligenceResponse {
  success: boolean;
  message: string;
  data?: any;
  toolCalls?: any[];
  requiresMultiRound?: boolean;
  error?: string;
}

/**
 * 统一智能决策协调器类
 */
export class UnifiedIntelligenceCoordinator {
  private static instance: UnifiedIntelligenceCoordinator;
  private initialized = false;
  private modelCacheService: typeof aiModelCacheService;
  private requestCache: Map<string, { response: string; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {
    this.modelCacheService = aiModelCacheService;
  }

  /**
   * 获取单例实例
   */
  static getInstance(): UnifiedIntelligenceCoordinator {
    if (!UnifiedIntelligenceCoordinator.instance) {
      UnifiedIntelligenceCoordinator.instance = new UnifiedIntelligenceCoordinator();
    }
    return UnifiedIntelligenceCoordinator.instance;
  }

  /**
   * 初始化协调器
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    logger.info('🚀 [协调器] 初始化统一智能决策协调器...');

    try {
      // 初始化模型缓存
      await this.modelCacheService.initializeCache();

      // 初始化记忆系统
      const memorySystem = await getMemorySystem();
      memoryIntegrationService.setMemorySystem(memorySystem);

      // 注册工具（这里需要根据实际情况注册）
      // toolOrchestratorService.registerTool(...);

      this.initialized = true;
      logger.info('✅ [协调器] 初始化完成');
    } catch (error) {
      logger.error('❌ [协调器] 初始化失败:', error);
      throw error;
    }
  }

  /**
   * 处理用户请求（主入口）
   */
  async processRequest(request: UserRequest): Promise<IntelligenceResponse> {
    console.log(`📥 [协调器] 处理请求: ${request.content.substring(0, 50)}...`);

    try {
      // 确保已初始化
      await this.initialize();

      // 1. 意图识别
      const intentAnalysis = await intentRecognitionService.recognizeIntent(
        request.content,
        request.context
      );

      console.log(`🎯 [协调器] 意图: ${intentAnalysis.intent}, 复杂度: ${intentAnalysis.complexity}`);

      // 2. 检索记忆上下文
      const memoryContext = await memoryIntegrationService.retrieveMemoryContext(
        request.content,
        request.userId,
        {
          dimensions: ['core', 'episodic', 'semantic'],
          limit: 5
        }
      );

      console.log(`🧠 [协调器] 检索到 ${memoryContext.items.length} 条记忆`);

      // 3. 判断是否需要工具
      const requiresTools = intentRecognitionService.requiresTools(intentAnalysis);

      if (requiresTools) {
        // 需要工具的复杂请求
        return await this.handleToolBasedRequest(request, intentAnalysis, memoryContext);
      } else {
        // 简单对话请求
        return await this.handleSimpleChat(request, intentAnalysis, memoryContext);
      }
    } catch (error) {
      console.error('❌ [协调器] 处理失败:', error);
      return {
        success: false,
        message: '处理请求时发生错误',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * 处理基于工具的请求
   */
  private async handleToolBasedRequest(
    request: UserRequest,
    intentAnalysis: any,
    memoryContext: any
  ): Promise<IntelligenceResponse> {
    console.log('🔧 [协调器] 处理工具请求');

    try {
      // 1. 编排工具
      const toolPlan = await toolOrchestratorService.orchestrateTools(
        intentAnalysis,
        request.content
      );

      console.log(`📋 [协调器] 工具计划: ${toolPlan.tools.length} 个工具`);

      // 2. 执行工具链
      const toolResults = await toolOrchestratorService.executeToolChain(
        toolPlan,
        { userId: request.userId, conversationId: request.conversationId }
      );

      console.log(`✅ [协调器] 工具执行完成: ${toolResults.length} 个结果`);

      // 3. 构建提示词
      const systemPrompt = promptBuilderService.buildSystemPrompt({
        userRole: request.context?.userRole || 'user',
        memoryContext: memoryContext.items,
        tools: toolPlan.tools
      });

      const userPrompt = promptBuilderService.buildUserPrompt(
        request.content,
        {
          toolResults,
          pageContext: request.context?.pageContext
        }
      );

      // 4. 调用AI模型
      const aiResponse = await this.callAIModel(
        systemPrompt,
        userPrompt,
        request.userId
      );

      return {
        success: true,
        message: aiResponse,
        toolCalls: toolPlan.tools,
        data: {
          toolResults,
          intentAnalysis
        }
      };
    } catch (error) {
      console.error('❌ [协调器] 工具请求处理失败:', error);
      throw error;
    }
  }

  /**
   * 处理简单对话
   */
  private async handleSimpleChat(
    request: UserRequest,
    intentAnalysis: any,
    memoryContext: any
  ): Promise<IntelligenceResponse> {
    console.log('💬 [协调器] 处理简单对话');

    try {
      // 1. 构建提示词
      const systemPrompt = promptBuilderService.buildSystemPrompt({
        userRole: request.context?.userRole || 'user',
        memoryContext: memoryContext.items
      });

      const userPrompt = promptBuilderService.buildUserPrompt(
        request.content,
        {
          pageContext: request.context?.pageContext
        }
      );

      // 2. 调用AI模型
      const aiResponse = await this.callAIModel(
        systemPrompt,
        userPrompt,
        request.userId
      );

      return {
        success: true,
        message: aiResponse,
        data: {
          intentAnalysis,
          memoryContext: memoryContext.items
        }
      };
    } catch (error) {
      console.error('❌ [协调器] 简单对话处理失败:', error);
      throw error;
    }
  }

  /**
   * 处理流式请求
   */
  async processStreamRequest(
    request: UserRequest,
    res: any
  ): Promise<void> {
    console.log(`📡 [协调器] 处理流式请求: ${request.content.substring(0, 50)}...`);

    try {
      // 初始化SSE
      streamingService.initializeSSE(res);

      // 创建流包装器
      const stream = streamingService.createStreamWrapper(res);

      // 发送连接成功
      stream.status('connected', '连接成功');

      // 确保已初始化
      await this.initialize();

      // 1. 意图识别
      stream.progress(1, 5, '正在分析意图...');
      const intentAnalysis = await intentRecognitionService.recognizeIntent(
        request.content,
        request.context
      );

      // 2. 检索记忆
      stream.progress(2, 5, '正在检索记忆...');
      const memoryContext = await memoryIntegrationService.retrieveMemoryContext(
        request.content,
        request.userId
      );

      // 3. 构建提示词
      stream.progress(3, 5, '正在构建提示词...');
      const systemPrompt = promptBuilderService.buildSystemPrompt({
        userRole: request.context?.userRole || 'user',
        memoryContext: memoryContext.items
      });

      const userPrompt = promptBuilderService.buildUserPrompt(request.content);

      // 4. 流式调用AI
      stream.progress(4, 5, '正在生成回答...');
      await this.streamAIResponse(systemPrompt, userPrompt, request.userId, stream);

      // 5. 完成
      stream.complete({
        intentAnalysis,
        memoryCount: memoryContext.items.length
      });
    } catch (error) {
      console.error('❌ [协调器] 流式请求处理失败:', error);
      streamingService.createStreamWrapper(res).error(
        error instanceof Error ? error : new Error(String(error))
      );
    }
  }

  /**
   * 调用AI模型
   */
  private async callAIModel(
    systemPrompt: string,
    userPrompt: string,
    userId: string
  ): Promise<string> {
    try {
      // 检查缓存
      const cacheKey = `${userId}:${systemPrompt.substring(0, 50)}:${userPrompt.substring(0, 50)}`;
      const cached = this.requestCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.info('✅ [协调器] 使用缓存响应');
        return cached.response;
      }

      // 获取默认模型
      const model = await this.modelCacheService.getDefaultModel();
      if (!model) {
        throw new Error('未找到可用的AI模型');
      }

      logger.info(`🤖 [协调器] 使用模型: ${model.name}`);

      // 构建消息
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ];

      // 调用AI模型
      const response = await unifiedAIBridge.chat({
        model: model.name,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      const content = response.data?.content || response.data?.message || '';

      // 更新缓存
      this.requestCache.set(cacheKey, { response: content, timestamp: Date.now() });

      return content;
    } catch (error) {
      logger.error('❌ [协调器] AI模型调用失败:', error);

      // 降级策略：返回友好错误消息
      return this.getFallbackResponse(error);
    }
  }

  /**
   * 获取降级响应
   */
  private getFallbackResponse(error: any): string {
    logger.warn('⚠️ [协调器] 使用降级响应');

    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes('timeout') || errorMessage.includes('超时')) {
      return '抱歉，AI服务响应超时，请稍后重试。';
    }

    if (errorMessage.includes('rate limit') || errorMessage.includes('限流')) {
      return '抱歉，当前请求过多，请稍后重试。';
    }

    return '抱歉，AI服务暂时不可用，请稍后重试。';
  }

  /**
   * 流式调用AI模型
   */
  private async streamAIResponse(
    systemPrompt: string,
    userPrompt: string,
    userId: string,
    stream: any
  ): Promise<void> {
    try {
      // 获取默认模型
      const model = await this.modelCacheService.getDefaultModel();
      if (!model) {
        throw new Error('未找到可用的AI模型');
      }

      logger.info(`🤖 [协调器] 流式调用模型: ${model.name}`);

      // 构建消息
      const messages = [
        { role: 'system' as const, content: systemPrompt },
        { role: 'user' as const, content: userPrompt }
      ];

      // 调用AI模型（非流式，因为UnifiedAIBridge的流式支持需要特殊处理）
      const response = await unifiedAIBridge.chat({
        model: model.name,
        messages,
        temperature: 0.7,
        max_tokens: 2000
      });

      // 模拟流式发送
      const content = response.data?.content || response.data?.message || '';
      const chunks = content.match(/.{1,50}/g) || [content];

      for (const chunk of chunks) {
        stream.send('message', { content: chunk });
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    } catch (error) {
      logger.error('❌ [协调器] 流式AI调用失败:', error);
      throw error;
    }
  }

  /**
   * 清理过期缓存
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.requestCache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.requestCache.delete(key);
      }
    }
    logger.info(`🧹 [协调器] 清理过期缓存，剩余: ${this.requestCache.size} 条`);
  }

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    this.requestCache.clear();
    logger.info('🧹 [协调器] 已清空所有缓存');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; timeout: number } {
    return {
      size: this.requestCache.size,
      timeout: this.cacheTimeout
    };
  }

  /**
   * 获取服务状态
   */
  getStatus(): {
    initialized: boolean;
    cacheSize: number;
    modelCacheInitialized: boolean;
  } {
    return {
      initialized: this.initialized,
      cacheSize: this.requestCache.size,
      modelCacheInitialized: this.modelCacheService ? true : false
    };
  }
}

// 导出单例
export const unifiedIntelligenceCoordinator = UnifiedIntelligenceCoordinator.getInstance();

