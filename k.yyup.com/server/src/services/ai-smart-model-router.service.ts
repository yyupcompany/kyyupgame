/**
 * AI智能模型路由服务
 * 根据查询类型和复杂度自动选择最优的AI模型
 */

import AIModelCacheService from './ai-model-cache.service';

export enum QueryType {
  COUNT = 'count',           // 统计查询：数量、总数
  STATUS_CHECK = 'status_check',  // 状态检查：是否在线、状态如何
  SIMPLE_QUESTION = 'simple_question',  // 简单问答：是什么、是否
  BASIC_EXPLANATION = 'basic_explanation',  // 基础解释：为什么、怎么样
  DATA_QUERY = 'data_query',    // 数据查询：查询具体数据
  ANALYSIS = 'analysis',        // 分析查询：分析、对比
  TOOL_CALLING = 'tool_calling', // 工具调用：需要调用外部工具
  MULTIMODAL = 'multimodal'     // 多模态：包含图片、文档等
}

/**
 * AI任务执行阶段枚举
 * 用于区分任务的不同执行阶段，以便选择最优模型
 */
export enum ExecutionPhase {
  PLANNING = 'planning',      // 规划阶段：复杂度分析、TodoList生成、执行计划制定
  EXECUTION = 'execution',    // 执行阶段：具体工具调用、数据操作、页面导航
  MIXED = 'mixed'            // 混合阶段：包含规划和执行的复合任务
}

export interface QueryAnalysis {
  type: QueryType;
  complexity: number;        // 1-10分制，1最简单，10最复杂
  estimatedTokens: number;   // 预估需要的输出token数
  keywords: string[];        // 关键词
  requiresTools: boolean;    // 是否需要工具调用
  requiresMultimodal: boolean; // 是否需要多模态
  phase?: ExecutionPhase;    // 执行阶段（可选）
}

/**
 * 模型选择选项
 */
export interface ModelSelectionOptions {
  phase?: ExecutionPhase;    // 执行阶段
  toolName?: string;         // 工具名称
  forceModel?: string;       // 强制使用指定模型
  priority?: 'speed' | 'quality' | 'cost'; // 优先级策略
  userQuery?: string;       // 用户原始查询（用于工具数量预估）
}

export class SmartModelRouterService {
  private static instance: SmartModelRouterService;

  private constructor() {}

  public static getInstance(): SmartModelRouterService {
    if (!SmartModelRouterService.instance) {
      SmartModelRouterService.instance = new SmartModelRouterService();
    }
    return SmartModelRouterService.instance;
  }

  /**
   * 分析查询并选择最优模型
   */
  public async selectOptimalModel(
    queryText: string,
    options?: ModelSelectionOptions
  ): Promise<{
    modelName: string;
    modelConfig: any;
    analysis: QueryAnalysis;
    estimatedTime: number;
  }> {
    try {
      console.log('🤖 [SmartRouter] 开始分析查询:', queryText);
      if (options?.phase) {
        console.log(`🔄 [SmartRouter] 执行阶段: ${options.phase}`);
      }

      // 第一步：分析查询
      const analysis = this.analyzeQuery(queryText, options);
      console.log('📊 [SmartRouter] 查询分析结果:', analysis);

      // 第二步：根据分析结果选择模型
      const selectedModel = await this.selectModelByAnalysis(analysis, {
        ...options,
        userQuery: queryText // 确保传递用户查询用于工具数量预估
      });
      console.log('🎯 [SmartRouter] 选择模型:', selectedModel.modelName);
      if (selectedModel.reason) {
        console.log(`💡 [SmartRouter] 选择原因: ${selectedModel.reason}`);
      }

      // 第三步：获取模型配置
      const modelConfig = await AIModelCacheService.getModelByName(selectedModel.modelName);
      if (!modelConfig) {
        throw new Error(`找不到模型配置: ${selectedModel.modelName}`);
      }

      return {
        modelName: selectedModel.modelName,
        modelConfig,
        analysis,
        estimatedTime: selectedModel.estimatedTime
      };

    } catch (error) {
      console.error('❌ [SmartRouter] 智能模型选择失败:', error);
      // 降级到默认模型
      const defaultModel = await AIModelCacheService.getDefaultModel();
      return {
        modelName: defaultModel?.name || 'doubao-seed-1-6-flash-250715',
        modelConfig: defaultModel,
        analysis: {
          type: QueryType.DATA_QUERY,
          complexity: 5,
          estimatedTokens: 500,
          keywords: [],
          requiresTools: false,
          requiresMultimodal: false
        },
        estimatedTime: 2000
      };
    }
  }

  /**
   * 基于工具名称和执行阶段选择最优模型
   * 这是新增的核心优化方法
   */
  public async selectModelForTool(
    toolName: string,
    phase: ExecutionPhase = ExecutionPhase.EXECUTION,
    userQuery?: string
  ): Promise<{
    modelName: string;
    modelConfig: any;
    reason: string;
    estimatedTime: number;
  }> {
    try {
      console.log(`🔧 [SmartRouter] 为工具选择模型: ${toolName} (阶段: ${phase})`);

      // 定义规划阶段工具 - 使用Thinking模型
      const planningTools = [
        'analyze_task_complexity',
        'create_todo_list',
        'generate_execution_plan',
        'workflow_analysis',
        'complex_reasoning'
      ];

      // 定义执行阶段工具 - 使用Flash模型 - 已移除页面操作工具
      const executionTools = [
        'get_student_list',
        'get_teacher_list',
        'get_class_list',
        'create_data_record',
        'update_data_record',
        'delete_data_record',
        'render_component',
        'simple_query'
      ];

      let selectedModelName: string;
      let reason: string;
      let estimatedTime: number;

      // 1. 强制规划阶段工具使用Thinking模型
      if (planningTools.includes(toolName) || phase === ExecutionPhase.PLANNING) {
        selectedModelName = 'doubao-seed-1-6-thinking-250615';
        reason = `规划阶段工具 ${toolName} 使用Thinking模型确保分析质量`;
        estimatedTime = 3000;
        console.log(`🧠 [SmartRouter] ${reason}`);
      }
      // 2. 执行阶段工具优先使用Flash模型
      else if (executionTools.includes(toolName) || phase === ExecutionPhase.EXECUTION) {
        selectedModelName = 'doubao-seed-1-6-flash-250715';
        reason = `执行阶段工具 ${toolName} 使用Flash模型提升响应速度`;
        estimatedTime = 1500;
        console.log(`⚡ [SmartRouter] ${reason}`);
      }
      // 3. 混合阶段或未知工具，基于工具数量预估选择
      else {
        if (userQuery) {
          const analysis = this.analyzeQuery(userQuery);
          const toolEstimation = this.estimateToolRequirements(userQuery);

          // 🎯 核心优化：基于工具数量选择模型
          if (toolEstimation.estimatedTools > 3) {
            selectedModelName = 'doubao-seed-1-6-thinking-250615';
            reason = `预估需要${toolEstimation.estimatedTools}个工具(${toolEstimation.reasoning})，使用Think模型确保质量`;
            estimatedTime = 3000;
          } else {
            selectedModelName = 'doubao-seed-1-6-flash-250715';
            reason = `预估需要${toolEstimation.estimatedTools}个工具(${toolEstimation.reasoning})，使用Flash模型提升速度`;
            estimatedTime = 1500;
          }

          console.log(`🧠 [SmartRouter] ${reason}`);
        } else {
          // 默认使用Flash模型
          selectedModelName = 'doubao-seed-1-6-flash-250715';
          reason = `未知工具 ${toolName} 默认使用Flash模型`;
          estimatedTime = 2000;
        }
        console.log(`🤔 [SmartRouter] ${reason}`);
      }

      // 获取模型配置
      const modelConfig = await AIModelCacheService.getModelByName(selectedModelName);
      if (!modelConfig) {
        throw new Error(`找不到模型配置: ${selectedModelName}`);
      }

      return {
        modelName: selectedModelName,
        modelConfig,
        reason,
        estimatedTime
      };

    } catch (error) {
      console.error('❌ [SmartRouter] 工具模型选择失败:', error);
      // 降级到默认Flash模型
      const defaultModel = await AIModelCacheService.getDefaultModel();
      return {
        modelName: defaultModel?.name || 'doubao-seed-1-6-flash-250715',
        modelConfig: defaultModel,
        reason: '选择失败，降级到默认Flash模型',
        estimatedTime: 2000
      };
    }
  }

  /**
   * 预估工具调用数量
   */
  private estimateToolRequirements(queryText: string): {
    estimatedTools: number;
    toolCategories: string[];
    reasoning: string;
  } {
    const lowerText = queryText.toLowerCase().trim();
    let estimatedTools = 1; // 默认1个工具
    const toolCategories: string[] = [];
    const reasoning: string[] = [];

    // 基于关键词预估工具数量
    if (lowerText.includes('并且') || lowerText.includes('同时') || lowerText.includes('然后')) {
      estimatedTools += 1;
      reasoning.push('多步骤操作需要额外工具');
    }

    if (lowerText.includes('分析') || lowerText.includes('对比') || lowerText.includes('比较')) {
      estimatedTools += 1;
      toolCategories.push('analysis');
      reasoning.push('分析对比需要统计工具');
    }

    if (lowerText.includes('生成') || lowerText.includes('创建') || lowerText.includes('制作')) {
      estimatedTools += 1;
      toolCategories.push('generation');
      reasoning.push('生成创建需要构建工具');
    }

    if (lowerText.includes('查询') || lowerText.includes('获取') || lowerText.includes('显示')) {
      toolCategories.push('query');
      reasoning.push('数据查询需要查询工具');
    }

    if (lowerText.includes('统计') || lowerText.includes('计算') || lowerText.includes('汇总')) {
      estimatedTools += 1;
      toolCategories.push('statistics');
      reasoning.push('统计分析需要计算工具');
    }

    if (lowerText.includes('更新') || lowerText.includes('修改') || lowerText.includes('编辑')) {
      toolCategories.push('update');
      reasoning.push('更新操作需要编辑工具');
    }

    return {
      estimatedTools: Math.min(estimatedTools, 6), // 最大6个工具
      toolCategories,
      reasoning: reasoning.join('；')
    };
  }

  /**
   * 分析查询内容和复杂度
   */
  private analyzeQuery(queryText: string, options?: ModelSelectionOptions): QueryAnalysis {
    const lowerText = queryText.toLowerCase().trim();

    // 关键词匹配
    const countKeywords = ['多少', '数量', '几个', '总数', '统计', '计数', 'count', 'number'];
    const statusKeywords = ['是否', '状态', '在线', '可用', '正常', 'status', 'available', 'online'];
    const simpleQuestionKeywords = ['什么', '是', '吗', '呢', 'what', 'is', 'how', 'why'];
    const basicExplanationKeywords = ['为什么', '如何', '怎样', 'why', 'how', 'explain'];
    const dataKeywords = ['查询', '显示', '列出', 'search', 'show', 'list', 'get'];
    const analysisKeywords = ['分析', '对比', '比较', '分析', 'analyze', 'compare', 'difference'];
    const toolKeywords = ['调用', '执行', '发送', 'call', 'execute', 'send', '操作'];
    const multimodalKeywords = ['图片', '文档', 'pdf', 'image', 'document', 'file'];

    // 确定查询类型
    let type: QueryType;
    let complexity = 1;
    let estimatedTokens = 50;

    if (countKeywords.some(keyword => lowerText.includes(keyword))) {
      type = QueryType.COUNT;
      complexity = 1;
      estimatedTokens = 20;
    } else if (statusKeywords.some(keyword => lowerText.includes(keyword))) {
      type = QueryType.STATUS_CHECK;
      complexity = 1;
      estimatedTokens = 30;
    } else if (simpleQuestionKeywords.some(keyword => lowerText.includes(keyword))) {
      type = QueryType.SIMPLE_QUESTION;
      complexity = 2;
      estimatedTokens = 100;
    } else if (basicExplanationKeywords.some(keyword => lowerText.includes(keyword))) {
      type = QueryType.BASIC_EXPLANATION;
      complexity = 3;
      estimatedTokens = 200;
    } else if (dataKeywords.some(keyword => lowerText.includes(keyword))) {
      type = QueryType.DATA_QUERY;
      complexity = 4;
      estimatedTokens = 500;
    } else if (analysisKeywords.some(keyword => lowerText.includes(keyword))) {
      type = QueryType.ANALYSIS;
      complexity = 6;
      estimatedTokens = 1000;
    } else if (toolKeywords.some(keyword => lowerText.includes(keyword))) {
      type = QueryType.TOOL_CALLING;
      complexity = 7;
      estimatedTokens = 800;
    } else if (multimodalKeywords.some(keyword => lowerText.includes(keyword))) {
      type = QueryType.MULTIMODAL;
      complexity = 8;
      estimatedTokens = 1500;
    } else {
      // 默认为数据查询
      type = QueryType.DATA_QUERY;
      complexity = 5;
      estimatedTokens = 500;
    }

    // 根据查询长度调整复杂度
    if (lowerText.length > 100) complexity += 1;
    if (lowerText.length > 200) complexity += 1;
    if (lowerText.includes('详细') || lowerText.includes('全面')) complexity += 2;

    // 根据关键词数量调整
    const keywords = [
      ...countKeywords.filter(kw => lowerText.includes(kw)),
      ...statusKeywords.filter(kw => lowerText.includes(kw)),
      ...simpleQuestionKeywords.filter(kw => lowerText.includes(kw)),
      ...basicExplanationKeywords.filter(kw => lowerText.includes(kw))
    ];

    if (keywords.length > 3) complexity += 1;

    return {
      type,
      complexity: Math.min(complexity, 10),
      estimatedTokens,
      keywords,
      requiresTools: type === QueryType.TOOL_CALLING,
      requiresMultimodal: type === QueryType.MULTIMODAL,
      phase: options?.phase // 添加执行阶段信息
    };
  }

  /**
   * 根据分析结果选择模型
   */
  private async selectModelByAnalysis(
    analysis: QueryAnalysis,
    options?: ModelSelectionOptions
  ): Promise<{
    modelName: string;
    estimatedTime: number;
    reason?: string;
  }> {
    const { type, complexity, estimatedTokens, requiresTools, requiresMultimodal, phase } = analysis;
    const { userQuery } = options || {};

    // 🚀 新增：执行阶段优化逻辑
    if (options?.phase || phase) {
      const currentPhase = options?.phase || phase;

      // 规划阶段：优先使用Thinking模型
      if (currentPhase === ExecutionPhase.PLANNING) {
        console.log('🧠 [SmartRouter] 规划阶段，选择Thinking模型');
        return { modelName: 'doubao-seed-1-6-thinking-250615', estimatedTime: 3000 };
      }

      // 执行阶段：优先使用Flash模型（除非复杂度很高）
      if (currentPhase === ExecutionPhase.EXECUTION && complexity <= 6) {
        console.log('⚡ [SmartRouter] 执行阶段，选择Flash模型');
        return { modelName: 'doubao-seed-1-6-flash-250715', estimatedTime: 1500 };
      }
    }

    // 🔧 强制模型选择
    if (options?.forceModel) {
      console.log(`🎯 [SmartRouter] 强制使用指定模型: ${options.forceModel}`);
      return { modelName: options.forceModel, estimatedTime: 2000 };
    }

    // 🎯 关键修复：增加基于工具数量预估的智能选择逻辑
    // 在原有逻辑基础上，加入工具数量预估判断
    if (userQuery && (requiresTools || type === QueryType.DATA_QUERY || type === QueryType.ANALYSIS)) {
      console.log('🔍 [SmartRouter] 开始工具数量预估分析');
      const toolEstimation = this.estimateToolRequirements(userQuery);
      console.log('📊 [SmartRouter] 工具预估结果:', toolEstimation);

      // 🚀 核心判断：基于工具数量选择模型
      if (toolEstimation.estimatedTools > 3) {
        console.log('🧠 [SmartRouter] 预估工具数量 > 3，选择Think模型确保质量');
        return {
          modelName: 'doubao-seed-1-6-thinking-250615',
          estimatedTime: 3000,
          reason: `预估需要${toolEstimation.estimatedTools}个工具(${toolEstimation.reasoning})，使用Think模型确保质量`
        };
      } else {
        console.log('⚡ [SmartRouter] 预估工具数量 <= 3，选择Flash模型提升速度');
        return {
          modelName: 'doubao-seed-1-6-flash-250715',
          estimatedTime: 1500,
          reason: `预估需要${toolEstimation.estimatedTools}个工具(${toolEstimation.reasoning})，使用Flash模型提升速度`
        };
      }
    }

    // 📋 原有逻辑：基于查询类型和复杂度的模型选择（作为兜底逻辑）
    // 优先级规则模型选择
    if (requiresMultimodal) {
      return { modelName: 'Doubao-Seed-1.6', estimatedTime: 3000 };
    }

    if (requiresTools) {
      return { modelName: 'Doubao-Seed-1.6', estimatedTime: 2500 };
    }

    if (type === QueryType.COUNT || type === QueryType.STATUS_CHECK) {
      return { modelName: 'doubao-ultra-fast-100', estimatedTime: 500 };
    }

    if (type === QueryType.SIMPLE_QUESTION && complexity <= 2) {
      return { modelName: 'doubao-ultra-fast-100', estimatedTime: 800 };
    }

    if (type === QueryType.BASIC_EXPLANATION && complexity <= 3) {
      return { modelName: 'doubao-fast-200', estimatedTime: 1200 };
    }

    if (complexity <= 4 && estimatedTokens <= 500) {
      return { modelName: 'doubao-seed-1-6-flash-250715', estimatedTime: 1500 };
    }

    if (type === QueryType.ANALYSIS && complexity >= 6) {
      return { modelName: 'doubao-seed-1-6-thinking-250615', estimatedTime: 3000 };
    }

    // 默认选择Flash模型
    return { modelName: 'doubao-seed-1-6-flash-250715', estimatedTime: 2000 };
  }

  /**
   * 批量查询模型选择优化
   */
  public async selectModelsForBatch(queries: string[]): Promise<Array<{
    query: string;
    modelName: string;
    analysis: QueryAnalysis;
  }>> {
    const results = [];

    for (const query of queries) {
      const result = await this.selectOptimalModel(query);
      results.push({
        query,
        modelName: result.modelName,
        analysis: result.analysis
      });
    }

    // 尝试合并相似查询以减少API调用
    return this.optimizeBatchQueries(results);
  }

  /**
   * 优化批量查询
   */
  private optimizeBatchQueries(results: Array<{
    query: string;
    modelName: string;
    analysis: QueryAnalysis;
  }>): Array<{
    query: string;
    modelName: string;
    analysis: QueryAnalysis;
  }> {
    // 这里可以实现查询合并逻辑
    // 比如相似的统计查询可以合并为一个调用
    // 目前返回原始结果
    return results;
  }

  /**
   * 获取模型性能统计
   */
  public getModelPerformanceStats(): {
    [modelName: string]: {
      avgResponseTime: number;
      successRate: number;
      queryTypes: QueryType[];
    };
  } {
    return {
      'doubao-ultra-fast-100': {
        avgResponseTime: 0.5,
        successRate: 98.5,
        queryTypes: [QueryType.COUNT, QueryType.STATUS_CHECK]
      },
      'doubao-fast-200': {
        avgResponseTime: 1.2,
        successRate: 97.8,
        queryTypes: [QueryType.SIMPLE_QUESTION, QueryType.BASIC_EXPLANATION]
      },
      'doubao-seed-1-6-flash-250715': {
        avgResponseTime: 2.0,
        successRate: 96.5,
        queryTypes: [QueryType.DATA_QUERY]
      },
      'doubao-seed-1-6-thinking-250615': {
        avgResponseTime: 3.5,
        successRate: 95.2,
        queryTypes: [QueryType.ANALYSIS]
      },
      'Doubao-Seed-1.6': {
        avgResponseTime: 4.0,
        successRate: 94.8,
        queryTypes: [QueryType.TOOL_CALLING, QueryType.MULTIMODAL]
      }
    };
  }
}

export default SmartModelRouterService.getInstance();