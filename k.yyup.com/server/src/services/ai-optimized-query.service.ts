/**
 * AI优化查询服务
 * 集成智能模型路由和并行处理优化
 */

import SmartModelRouterService, { QueryType } from './ai-smart-model-router.service';
import { unifiedAIBridge } from './unified-ai-bridge.service';
import AIQueryCacheService from './ai-query-cache.service';
import AIProgressEventService from './ai-progress-event.service';

export interface OptimizedQueryResult {
  type: string;
  data?: any;
  response?: string;
  metadata: {
    executionTime: number;
    usedModel: string;
    queryType: QueryType;
    complexity: number;
    estimatedTokens: number;
    actualTokens?: number;
    cacheHit: boolean;
    optimizationApplied: string[];
  };
  visualization?: any;
  sessionId?: string;
  queryLogId?: number;
}

export class AIOptimizedQueryService {
  private static instance: AIOptimizedQueryService;
  private cacheService: typeof AIQueryCacheService;
  private modelRouter: typeof SmartModelRouterService;
  private progressService: typeof AIProgressEventService;

  private constructor() {
    this.cacheService = AIQueryCacheService;
    this.modelRouter = SmartModelRouterService;
    this.progressService = AIProgressEventService;
  }

  public static getInstance(): AIOptimizedQueryService {
    if (!AIOptimizedQueryService.instance) {
      AIOptimizedQueryService.instance = new AIOptimizedQueryService();
    }
    return AIOptimizedQueryService.instance;
  }

  /**
   * 优化版查询处理 - 主要入口点 (带实时进度)
   */
  public async processOptimizedQuery(
    queryText: string,
    userId: number,
    sessionId?: string
  ): Promise<OptimizedQueryResult> {
    const startTime = Date.now();
    const optimizationApplied: string[] = [];
    const effectiveSessionId = sessionId || `query_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      console.log('🚀 [OptimizedAI] 开始处理优化查询:', queryText);

      // 第一步：检查缓存
      await this.progressService.sendProgress(effectiveSessionId, 'cache_check', '检查缓存结果...', 35);
      const cachedResult = await this.cacheService.getCachedResult(queryText, userId);
      if (cachedResult) {
        await this.progressService.sendProgress(effectiveSessionId, 'cache_hit', '找到缓存结果，直接返回', 100);
        optimizationApplied.push('cache_hit');
        return {
          ...cachedResult,
          metadata: {
            ...cachedResult.metadata,
            optimizationApplied
          }
        };
      }

      // 第二步：智能模型选择
      await this.progressService.sendProgress(effectiveSessionId, 'model_select', '分析查询意图并选择最优AI模型...', 25);
      const modelSelection = await this.modelRouter.selectOptimalModel(queryText);
      console.log('🎯 [OptimizedAI] 选择模型:', modelSelection.modelName);

      // 第三步：并行处理优化 (带实时进度)
      const result = await this.executeOptimizedQueryWithProgress(
        queryText,
        userId,
        effectiveSessionId,
        modelSelection,
        optimizationApplied
      );

      const executionTime = Date.now() - startTime;
      console.log(`⚡ [OptimizedAI] 查询完成，耗时: ${executionTime}ms`);

      // 保存到缓存
      await this.cacheService.saveQueryResult(
        queryText,
        userId,
        result.type === 'data_query' ? 'data_query' : 'ai_response',
        result,
        effectiveSessionId,
        modelSelection.modelName,
        executionTime
      );

      // 完成进度
      await this.progressService.sendProgress(effectiveSessionId, 'complete', '查询完成', 100);

      return {
        ...result,
        metadata: {
          ...result.metadata,
          executionTime,
          optimizationApplied
        }
      };

    } catch (error) {
      console.error('❌ [OptimizedAI] 查询处理失败:', error);
      if (this.progressService.getActiveSession(effectiveSessionId)) {
        this.progressService.handleProgressError(effectiveSessionId, error as Error);
      }
      throw error;
    }
  }

  /**
   * 执行优化查询 (带实时进度反馈)
   */
  private async executeOptimizedQueryWithProgress(
    queryText: string,
    userId: number,
    sessionId: string,
    modelSelection: any,
    optimizationApplied: string[]
  ): Promise<OptimizedQueryResult> {
    const { analysis } = modelSelection;

    // 确定查询复杂度类型
    const complexityType = analysis.complexity <= 3 ? 'simple' :
                          analysis.complexity <= 6 ? 'medium' : 'complex';

    // 获取对应的进度步骤
    const steps = this.progressService.getQuerySteps(complexityType);

    // 初始化进度跟踪
    this.progressService.startProgressTracking({
      sessionId,
      queryId: `query_${Date.now()}`,
      userId,
      totalSteps: steps.length,
      onComplete: (result) => {
        console.log(`✅ [Progress] 查询 ${sessionId} 完成`);
      },
      onError: (error) => {
        console.error(`❌ [Progress] 查询 ${sessionId} 失败:`, error);
      }
    });

    // 根据查询类型选择处理策略并发送进度
    switch (analysis.type) {
      case QueryType.COUNT:
      case QueryType.STATUS_CHECK:
        optimizationApplied.push('ultra_fast_model');
        await this.progressService.sendProgress(sessionId, 'execute', '执行快速查询...', 70);
        return await this.handleSimpleQuery(queryText, modelSelection);

      case QueryType.SIMPLE_QUESTION:
        optimizationApplied.push('fast_response_model');
        await this.progressService.sendProgress(sessionId, 'execute', '执行AI问答...', 70);
        return await this.handleSimpleQuestion(queryText, modelSelection);

      case QueryType.BASIC_EXPLANATION:
        optimizationApplied.push('medium_fast_model');
        await this.progressService.sendProgress(sessionId, 'execute', '执行解释查询...', 70);
        return await this.handleBasicExplanation(queryText, modelSelection);

      case QueryType.DATA_QUERY:
        optimizationApplied.push('standard_model');
        await this.progressService.sendProgress(sessionId, 'data_prepare', '准备查询数据...', 45);
        await this.progressService.sendProgress(sessionId, 'execute', '执行数据查询...', 75);
        return await this.handleDataQuery(queryText, userId, sessionId, modelSelection);

      case QueryType.ANALYSIS:
        optimizationApplied.push('thinking_model');
        await this.progressService.sendProgress(sessionId, 'data_prepare', '准备分析数据...', 45);
        await this.progressService.sendProgress(sessionId, 'execute', '执行深度分析...', 75);
        return await this.handleAnalysis(queryText, userId, sessionId, modelSelection);

      case QueryType.TOOL_CALLING:
        optimizationApplied.push('tool_model');
        await this.progressService.sendProgress(sessionId, 'data_prepare', '准备工具调用...', 45);
        await this.progressService.sendProgress(sessionId, 'execute', '执行工具调用...', 75);
        return await this.handleToolCalling(queryText, userId, sessionId, modelSelection);

      default:
        optimizationApplied.push('default_model');
        await this.progressService.sendProgress(sessionId, 'execute', '执行默认查询...', 70);
        return await this.handleDefaultQuery(queryText, userId, sessionId, modelSelection);
    }
  }

  /**
   * 执行优化查询
   */
  private async executeOptimizedQuery(
    queryText: string,
    userId: number,
    sessionId: string | undefined,
    modelSelection: any,
    optimizationApplied: string[]
  ): Promise<OptimizedQueryResult> {
    const { analysis } = modelSelection;

    // 根据查询类型选择处理策略
    switch (analysis.type) {
      case QueryType.COUNT:
      case QueryType.STATUS_CHECK:
        optimizationApplied.push('ultra_fast_model');
        return await this.handleSimpleQuery(queryText, modelSelection);

      case QueryType.SIMPLE_QUESTION:
        optimizationApplied.push('fast_response_model');
        return await this.handleSimpleQuestion(queryText, modelSelection);

      case QueryType.BASIC_EXPLANATION:
        optimizationApplied.push('medium_fast_model');
        return await this.handleBasicExplanation(queryText, modelSelection);

      case QueryType.DATA_QUERY:
        optimizationApplied.push('standard_model');
        return await this.handleDataQuery(queryText, userId, sessionId, modelSelection);

      case QueryType.ANALYSIS:
        optimizationApplied.push('thinking_model');
        return await this.handleAnalysis(queryText, userId, sessionId, modelSelection);

      case QueryType.TOOL_CALLING:
        optimizationApplied.push('tool_model');
        return await this.handleToolCalling(queryText, userId, sessionId, modelSelection);

      default:
        optimizationApplied.push('default_model');
        return await this.handleDefaultQuery(queryText, userId, sessionId, modelSelection);
    }
  }

  /**
   * 处理简单查询（统计、状态检查）
   */
  private async handleSimpleQuery(
    queryText: string,
    modelSelection: any
  ): Promise<OptimizedQueryResult> {
    const { modelName, analysis } = modelSelection;

    // 构建优化提示词
    const optimizedPrompt = this.buildOptimizedPrompt(queryText, analysis.type);

    try {
      const response = await unifiedAIBridge.chat({
        model: modelName,
        messages: [
          {
            role: 'system',
            content: '你是一个高效的查询助手。请简洁准确地回答问题，输出限制在50字以内。'
          },
          {
            role: 'user',
            content: optimizedPrompt
          }
        ],
        temperature: 0.1,
        max_tokens: analysis.estimatedTokens
      });

      return {
        type: 'ai_response',
        response: response.data?.content || response.data?.message || '无法处理查询',
        metadata: {
          executionTime: 0,
          usedModel: modelName,
          queryType: analysis.type,
          complexity: analysis.complexity,
          estimatedTokens: analysis.estimatedTokens,
          actualTokens: response.data?.usage?.totalTokens || 0,
          cacheHit: false,
          optimizationApplied: []
        }
      };

    } catch (error) {
      console.error('❌ [SimpleQuery] 处理失败:', error);
      throw error;
    }
  }

  /**
   * 处理简单问答
   */
  private async handleSimpleQuestion(
    queryText: string,
    modelSelection: any
  ): Promise<OptimizedQueryResult> {
    const { modelName, analysis } = modelSelection;

    const response = await unifiedAIBridge.chat({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: '请直接准确地回答问题，输出限制在100字以内。'
        },
        {
          role: 'user',
          content: queryText
        }
      ],
      temperature: 0.2,
      max_tokens: analysis.estimatedTokens
    }, {
      endpointUrl: modelSelection.modelConfig.endpointUrl,
      apiKey: modelSelection.modelConfig.apiKey
    });

    return {
      type: 'ai_response',
      response: response.data?.content || response.data?.message || '无法回答问题',
      metadata: {
        executionTime: 0,
        usedModel: modelName,
        queryType: analysis.type,
        complexity: analysis.complexity,
        estimatedTokens: analysis.estimatedTokens,
        actualTokens: response.data?.usage?.totalTokens || 0,
        cacheHit: false,
        optimizationApplied: []
      }
    };
  }

  /**
   * 处理基础解释
   */
  private async handleBasicExplanation(
    queryText: string,
    modelSelection: any
  ): Promise<OptimizedQueryResult> {
    const { modelName, analysis } = modelSelection;

    const response = await unifiedAIBridge.chat({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: '请用简洁明了的语言解释问题，输出限制在200字以内。'
        },
        {
          role: 'user',
          content: queryText
        }
      ],
      temperature: 0.3,
      max_tokens: analysis.estimatedTokens
    }, {
      endpointUrl: modelSelection.modelConfig.endpointUrl,
      apiKey: modelSelection.modelConfig.apiKey
    });

    return {
      type: 'ai_response',
      response: response.data?.content || response.data?.message || '无法解释',
      metadata: {
        executionTime: 0,
        usedModel: modelName,
        queryType: analysis.type,
        complexity: analysis.complexity,
        estimatedTokens: analysis.estimatedTokens,
        actualTokens: response.data?.usage?.totalTokens || 0,
        cacheHit: false,
        optimizationApplied: []
      }
    };
  }

  /**
   * 处理数据查询
   */
  private async handleDataQuery(
    queryText: string,
    userId: number,
    sessionId: string | undefined,
    modelSelection: any
  ): Promise<OptimizedQueryResult> {
    // 这里可以调用原有的数据查询逻辑
    // 目前返回模拟结果
    return {
      type: 'ai_response',
      response: `数据查询结果: ${queryText}`,
      metadata: {
        executionTime: 0,
        usedModel: modelSelection.modelName,
        queryType: modelSelection.analysis.type,
        complexity: modelSelection.analysis.complexity,
        estimatedTokens: modelSelection.analysis.estimatedTokens,
        cacheHit: false,
        optimizationApplied: []
      }
    };
  }

  /**
   * 处理分析查询
   */
  private async handleAnalysis(
    queryText: string,
    userId: number,
    sessionId: string | undefined,
    modelSelection: any
  ): Promise<OptimizedQueryResult> {
    const { modelName, analysis } = modelSelection;

    const response = await unifiedAIBridge.chat({
      model: modelName,
      messages: [
        {
          role: 'system',
          content: '你是一个专业的数据分析师，请提供详细的分析结果。'
        },
        {
          role: 'user',
          content: queryText
        }
      ],
      temperature: 0.7,
      max_tokens: analysis.estimatedTokens
    }, {
      endpointUrl: modelSelection.modelConfig.endpointUrl,
      apiKey: modelSelection.modelConfig.apiKey
    });

    return {
      type: 'ai_response',
      response: response.data?.content || response.data?.message || '无法分析',
      metadata: {
        executionTime: 0,
        usedModel: modelName,
        queryType: analysis.type,
        complexity: analysis.complexity,
        estimatedTokens: analysis.estimatedTokens,
        actualTokens: response.data?.usage?.totalTokens || 0,
        cacheHit: false,
        optimizationApplied: []
      }
    };
  }

  /**
   * 处理工具调用
   */
  private async handleToolCalling(
    queryText: string,
    userId: number,
    sessionId: string | undefined,
    modelSelection: any
  ): Promise<OptimizedQueryResult> {
    // 这里可以实现工具调用逻辑
    return {
      type: 'ai_response',
      response: `工具调用结果: ${queryText}`,
      metadata: {
        executionTime: 0,
        usedModel: modelSelection.modelName,
        queryType: modelSelection.analysis.type,
        complexity: modelSelection.analysis.complexity,
        estimatedTokens: modelSelection.analysis.estimatedTokens,
        cacheHit: false,
        optimizationApplied: []
      }
    };
  }

  /**
   * 处理默认查询
   */
  private async handleDefaultQuery(
    queryText: string,
    userId: number,
    sessionId: string | undefined,
    modelSelection: any
  ): Promise<OptimizedQueryResult> {
    const response = await unifiedAIBridge.chat({
      model: modelSelection.modelName,
      messages: [
        {
          role: 'system',
          content: '你是一个智能助手，请准确回答用户问题。'
        },
        {
          role: 'user',
          content: queryText
        }
      ],
      temperature: 0.7,
      max_tokens: modelSelection.analysis.estimatedTokens
    }, {
      endpointUrl: modelSelection.modelConfig.endpointUrl,
      apiKey: modelSelection.modelConfig.apiKey
    });

    return {
      type: 'ai_response',
      response: response.data?.content || response.data?.message || '无法处理',
      metadata: {
        executionTime: 0,
        usedModel: modelSelection.modelName,
        queryType: modelSelection.analysis.type,
        complexity: modelSelection.analysis.complexity,
        estimatedTokens: modelSelection.analysis.estimatedTokens,
        actualTokens: response.data?.usage?.totalTokens || 0,
        cacheHit: false,
        optimizationApplied: []
      }
    };
  }

  /**
   * 构建优化提示词
   */
  private buildOptimizedPrompt(queryText: string, queryType: QueryType): string {
    switch (queryType) {
      case QueryType.COUNT:
        return `请统计查询: ${queryText}。只需返回数字或简要结果。`;
      case QueryType.STATUS_CHECK:
        return `请检查状态: ${queryText}。只需返回"是"或"否"，或简短状态。`;
      default:
        return queryText;
    }
  }

  /**
   * 获取性能统计
   */
  public getPerformanceStats(): any {
    return {
      modelRouter: this.modelRouter.getModelPerformanceStats(),
      cacheStats: this.cacheService.getCacheStats()
    };
  }
}

export default AIOptimizedQueryService.getInstance();