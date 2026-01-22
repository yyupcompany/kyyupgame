/**
 * 意图识别服务
 * 负责分析用户请求，识别意图和复杂度
 * 支持AI模型集成、缓存机制、准确率优化
 */

import { logger } from '../../../utils/logger';
import { unifiedAIBridge } from '../../unified-ai-bridge.service';
import { AIModelCacheService } from '../../ai-model-cache.service';

export enum IntentType {
  NAVIGATION = 'navigation',
  QUERY = 'query',
  OPERATION = 'operation',
  ANALYSIS = 'analysis',
  CREATION = 'creation',
  MODIFICATION = 'modification',
  DELETION = 'deletion',
  CONVERSATION = 'conversation',
  UNKNOWN = 'unknown'
}

export enum TaskComplexity {
  SIMPLE = 'simple',
  MODERATE = 'moderate',
  COMPLEX = 'complex'
}

export enum ToolCapability {
  DATABASE_QUERY = 'database_query',
  DATA_ANALYSIS = 'data_analysis',
  CHART_GENERATION = 'chart_generation',
  NAVIGATION = 'navigation',
  FORM_FILLING = 'form_filling',
  FILE_OPERATION = 'file_operation',
  CALCULATION = 'calculation',
  TEXT_PROCESSING = 'text_processing',
  TASK_MANAGEMENT = 'task_management',    // 任务管理能力
  WORKFLOW = 'workflow'                   // 工作流能力
}

export interface IntentAnalysisResult {
  intent: IntentType;
  complexity: TaskComplexity;
  requiredCapabilities: ToolCapability[];
  confidence: number;
  keywords: string[];
  entities: any[];
  usedAI?: boolean; // 是否使用了AI模型
  cacheHit?: boolean; // 是否命中缓存
}

/**
 * 意图识别服务类
 */
export class IntentRecognitionService {
  private static instance: IntentRecognitionService;
  private cache: Map<string, { result: IntentAnalysisResult; timestamp: number }> = new Map();
  private readonly CACHE_TIMEOUT = 5 * 60 * 1000; // 5分钟缓存
  private modelCacheService: AIModelCacheService;
  private useAI = false; // 是否启用AI模型

  private constructor() {
    this.modelCacheService = AIModelCacheService.getInstance();
    logger.info('✅ [意图识别] 意图识别服务初始化完成');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): IntentRecognitionService {
    if (!IntentRecognitionService.instance) {
      IntentRecognitionService.instance = new IntentRecognitionService();
    }
    return IntentRecognitionService.instance;
  }

  /**
   * 启用AI模型
   */
  enableAI(): void {
    this.useAI = true;
    logger.info('✅ [意图识别] AI模型已启用');
  }

  /**
   * 禁用AI模型
   */
  disableAI(): void {
    this.useAI = false;
    logger.info('✅ [意图识别] AI模型已禁用');
  }

  /**
   * 识别用户意图
   */
  async recognizeIntent(query: string, context?: any): Promise<IntentAnalysisResult> {
    // 检查缓存
    const cacheKey = this.getCacheKey(query, context);
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
      logger.info('✅ [意图识别] 使用缓存结果');
      return { ...cached.result, cacheHit: true };
    }

    // 如果启用AI，使用AI模型识别
    if (this.useAI) {
      try {
        const aiResult = await this.recognizeIntentWithAI(query, context);
        this.cache.set(cacheKey, { result: aiResult, timestamp: Date.now() });
        return { ...aiResult, usedAI: true, cacheHit: false };
      } catch (error) {
        logger.warn('⚠️ [意图识别] AI识别失败，使用规则识别:', error);
        // 降级到规则识别
      }
    }

    // 使用规则识别
    const lowerQuery = query.toLowerCase().trim();

    // 1. 识别意图类型
    const intent = this.detectIntentType(lowerQuery);

    // 2. 评估复杂度
    const complexity = this.evaluateComplexity(lowerQuery, intent);

    // 3. 识别所需能力
    const requiredCapabilities = this.identifyRequiredCapabilities(lowerQuery, intent);

    // 4. 提取关键词
    const keywords = this.extractKeywords(lowerQuery);

    // 5. 提取实体
    const entities = this.extractEntities(lowerQuery);

    // 6. 计算置信度
    const confidence = this.calculateConfidence(intent, keywords, entities);

    const result: IntentAnalysisResult = {
      intent,
      complexity,
      requiredCapabilities,
      confidence,
      keywords,
      entities,
      usedAI: false,
      cacheHit: false
    };

    // 缓存结果
    this.cache.set(cacheKey, { result, timestamp: Date.now() });

    return result;
  }

  /**
   * 使用AI模型识别意图
   */
  private async recognizeIntentWithAI(query: string, context?: any): Promise<IntentAnalysisResult> {
    logger.info('🤖 [意图识别] 使用AI模型识别意图');

    // 获取默认模型
    const model = await this.modelCacheService.getDefaultModel();
    if (!model) {
      throw new Error('未找到可用的AI模型');
    }

    // 构建prompt
    const systemPrompt = `你是一个意图识别专家。请分析用户的查询，识别其意图类型、复杂度和所需能力。

意图类型包括：
- navigation: 导航
- query: 查询
- operation: 操作
- analysis: 分析
- creation: 创建
- modification: 修改
- deletion: 删除
- conversation: 对话
- unknown: 未知

复杂度包括：
- simple: 简单
- moderate: 中等
- complex: 复杂

请以JSON格式返回结果，包含：intent, complexity, requiredCapabilities, confidence, keywords, entities`;

    const userPrompt = `用户查询: ${query}${context ? `\n上下文: ${JSON.stringify(context)}` : ''}`;

    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: userPrompt }
    ];

    // 调用AI模型
    const response = await unifiedAIBridge.chat({
      model: model.name,
      messages,
      temperature: 0.3, // 较低温度以获得更一致的结果
      max_tokens: 500
    });

    const content = response.data?.content || response.data?.message || '{}';

    try {
      // 解析AI返回的JSON
      const aiResult = JSON.parse(content);

      // 验证和规范化结果
      return {
        intent: aiResult.intent || IntentType.UNKNOWN,
        complexity: aiResult.complexity || TaskComplexity.MODERATE,
        requiredCapabilities: aiResult.requiredCapabilities || [],
        confidence: aiResult.confidence || 0.7,
        keywords: aiResult.keywords || [],
        entities: aiResult.entities || []
      };
    } catch (error) {
      logger.error('❌ [意图识别] AI结果解析失败:', error);
      throw new Error('AI识别结果解析失败');
    }
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(query: string, context?: any): string {
    const contextStr = context ? JSON.stringify(context) : '';
    return `${query}:${contextStr}`;
  }
  
  /**
   * 检测意图类型
   */
  private detectIntentType(query: string): IntentType {
    // 导航意图
    if (/打开|跳转|进入|导航|前往|访问/.test(query)) {
      return IntentType.NAVIGATION;
    }
    
    // 查询意图
    if (/查询|查看|显示|列出|统计|多少|有哪些|什么/.test(query)) {
      return IntentType.QUERY;
    }
    
    // 创建意图
    if (/创建|新建|添加|增加|生成/.test(query)) {
      return IntentType.CREATION;
    }
    
    // 修改意图
    if (/修改|更新|编辑|改变|调整/.test(query)) {
      return IntentType.MODIFICATION;
    }
    
    // 删除意图
    if (/删除|移除|清除|取消/.test(query)) {
      return IntentType.DELETION;
    }
    
    // 分析意图
    if (/分析|对比|比较|趋势|预测/.test(query)) {
      return IntentType.ANALYSIS;
    }
    
    // 操作意图
    if (/执行|运行|处理|操作/.test(query)) {
      return IntentType.OPERATION;
    }
    
    // 对话意图（问候/寒暄）
    if (/你好|您好|hi|hello|hey|嗨|哈喽|早上好|下午好|晚上好|早安|晚安|谢谢|感谢|再见|拜拜|bye|帮助/.test(query) || query.length < 5) {
      return IntentType.CONVERSATION;
    }
    
    return IntentType.UNKNOWN;
  }
  
  /**
   * 评估任务复杂度
   */
  private evaluateComplexity(query: string, intent: IntentType): TaskComplexity {
    let score = 0;
    
    // 基于意图的基础分数
    const intentScores: Record<IntentType, number> = {
      [IntentType.CONVERSATION]: 1,
      [IntentType.QUERY]: 2,
      [IntentType.NAVIGATION]: 2,
      [IntentType.CREATION]: 3,
      [IntentType.MODIFICATION]: 3,
      [IntentType.DELETION]: 3,
      [IntentType.OPERATION]: 4,
      [IntentType.ANALYSIS]: 5,
      [IntentType.UNKNOWN]: 2
    };
    
    score += intentScores[intent] || 2;
    
    // 基于查询长度
    if (query.length > 100) score += 2;
    else if (query.length > 50) score += 1;
    
    // 基于关键词复杂度
    if (/并且|同时|然后|接着|之后/.test(query)) score += 2; // 多步骤
    if (/所有|全部|批量/.test(query)) score += 1; // 批量操作
    if (/如果|当|满足|条件/.test(query)) score += 1; // 条件判断
    
    // 判断复杂度等级
    if (score <= 3) return TaskComplexity.SIMPLE;
    if (score <= 6) return TaskComplexity.MODERATE;
    return TaskComplexity.COMPLEX;
  }
  
  /**
   * 识别所需能力
   */
  private identifyRequiredCapabilities(query: string, intent: IntentType): ToolCapability[] {
    const capabilities: ToolCapability[] = [];
    
    // 基于意图添加能力
    switch (intent) {
      case IntentType.NAVIGATION:
        capabilities.push(ToolCapability.NAVIGATION);
        break;
      case IntentType.QUERY:
        capabilities.push(ToolCapability.DATABASE_QUERY);
        break;
      case IntentType.ANALYSIS:
        capabilities.push(ToolCapability.DATA_ANALYSIS);
        if (/图表|图形|可视化/.test(query)) {
          capabilities.push(ToolCapability.CHART_GENERATION);
        }
        break;
      case IntentType.CREATION:
      case IntentType.MODIFICATION:
      case IntentType.DELETION:
        capabilities.push(ToolCapability.DATABASE_QUERY);
        if (/表单|填写/.test(query)) {
          capabilities.push(ToolCapability.FORM_FILLING);
        }
        break;
    }
    
    // 基于关键词添加能力
    if (/文件|上传|下载/.test(query)) {
      capabilities.push(ToolCapability.FILE_OPERATION);
    }
    
    if (/计算|求和|平均|总计/.test(query)) {
      capabilities.push(ToolCapability.CALCULATION);
    }
    
    if (/文本|内容|描述/.test(query)) {
      capabilities.push(ToolCapability.TEXT_PROCESSING);
    }
    
    return [...new Set(capabilities)]; // 去重
  }
  
  /**
   * 提取关键词
   */
  private extractKeywords(query: string): string[] {
    // 简单的关键词提取（实际应用中可以使用NLP库）
    const stopWords = ['的', '了', '是', '在', '有', '和', '就', '不', '人', '都', '一', '我', '你', '他'];
    const words = query.split(/[\s,，。！？；：、]+/);
    
    return words
      .filter(word => word.length > 1 && !stopWords.includes(word))
      .slice(0, 10); // 最多10个关键词
  }
  
  /**
   * 提取实体
   */
  private extractEntities(query: string): any[] {
    const entities: any[] = [];
    
    // 提取数字
    const numbers = query.match(/\d+/g);
    if (numbers) {
      numbers.forEach(num => {
        entities.push({ type: 'number', value: parseInt(num) });
      });
    }
    
    // 提取日期
    const datePatterns = [
      /(\d{4})年(\d{1,2})月(\d{1,2})日/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /今天|昨天|明天|本周|上周|下周|本月|上月|下月/
    ];
    
    datePatterns.forEach(pattern => {
      const match = query.match(pattern);
      if (match) {
        entities.push({ type: 'date', value: match[0] });
      }
    });
    
    return entities;
  }
  
  /**
   * 计算置信度
   */
  private calculateConfidence(intent: IntentType, keywords: string[], entities: any[]): number {
    let confidence = 0.5; // 基础置信度
    
    // 意图明确性
    if (intent !== IntentType.UNKNOWN) {
      confidence += 0.2;
    }
    
    // 关键词数量
    if (keywords.length > 0) {
      confidence += Math.min(keywords.length * 0.05, 0.2);
    }
    
    // 实体数量
    if (entities.length > 0) {
      confidence += Math.min(entities.length * 0.05, 0.1);
    }
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * 判断是否需要工具调用
   */
  requiresTools(analysis: IntentAnalysisResult): boolean {
    // 简单对话不需要工具
    if (analysis.intent === IntentType.CONVERSATION && analysis.complexity === TaskComplexity.SIMPLE) {
      return false;
    }

    // 有明确能力需求的需要工具
    if (analysis.requiredCapabilities.length > 0) {
      return true;
    }

    // 复杂任务需要工具
    if (analysis.complexity === TaskComplexity.COMPLEX) {
      return true;
    }

    return false;
  }

  /**
   * 清理过期缓存
   */
  cleanupExpiredCache(): number {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.CACHE_TIMEOUT) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info(`🧹 [意图识别] 清理了 ${cleaned} 个过期缓存`);
    }

    return cleaned;
  }

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    const count = this.cache.size;
    this.cache.clear();
    logger.info(`🧹 [意图识别] 清空所有缓存: ${count} 个`);
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): {
    size: number;
    timeout: number;
  } {
    return {
      size: this.cache.size,
      timeout: this.CACHE_TIMEOUT
    };
  }

  /**
   * 获取服务统计
   */
  getStats(): {
    cacheSize: number;
    aiEnabled: boolean;
  } {
    return {
      cacheSize: this.cache.size,
      aiEnabled: this.useAI
    };
  }

  /**
   * 批量识别意图
   */
  async recognizeIntentBatch(queries: string[], context?: any): Promise<IntentAnalysisResult[]> {
    logger.info(`🔄 [意图识别] 批量识别: ${queries.length} 个查询`);

    const results = await Promise.all(
      queries.map(query => this.recognizeIntent(query, context))
    );

    return results;
  }

  /**
   * 验证意图识别结果
   */
  validateResult(result: IntentAnalysisResult): boolean {
    // 检查必填字段
    if (!result.intent || !result.complexity) {
      return false;
    }

    // 检查置信度范围
    if (result.confidence < 0 || result.confidence > 1) {
      return false;
    }

    // 检查数组字段
    if (!Array.isArray(result.requiredCapabilities) ||
        !Array.isArray(result.keywords) ||
        !Array.isArray(result.entities)) {
      return false;
    }

    return true;
  }
}

// 导出单例
export const intentRecognitionService = IntentRecognitionService.getInstance();

