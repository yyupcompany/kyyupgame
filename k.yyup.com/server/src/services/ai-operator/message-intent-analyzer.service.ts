/**
 * 消息意图分析服务
 * 负责分析用户消息的意图，自动决定是否需要启用工具调用
 * 采用三层分析策略：关键词匹配 → 轻量级模型 → 完整AI分析
 */

import { logger } from '../../utils/logger';
import { intentRecognitionService, IntentType, TaskComplexity } from './core/intent-recognition.service';

export interface MessageAnalysis {
  intent: string;
  confidence: number;
  complexity: string;
  requiresTools: boolean;
  suggestedTools: string[];
  reasoning: string;
  keywords: string[];
  estimatedTokens: number;
  analysisMethod: 'keyword' | 'ai' | 'cache'; // 分析方法
}

/**
 * 意图关键词库
 */
const INTENT_KEYWORDS = {
  greeting: {
    keywords: ['你好', 'hello', 'hi', '早上好', '下午好', '晚上好', '嗨', '你好啊'],
    patterns: [/^(你好|hello|hi|早上好|下午好|晚上好|嗨)[!！。\.\s]*$/i],
    confidence: 0.95,
    requiresTools: false
  },
  
  query: {
    keywords: ['查询', '查看', '显示', '列出', '有多少', '统计', '多少个', '几个', '有哪些'],
    patterns: [/^(查询|查看|显示|列出|统计).*/, /.*有多少.*/, /.*统计.*$/, /.*几个.*$/],
    confidence: 0.85,
    requiresTools: true,
    tools: ['query_students', 'query_teachers', 'get_statistics']
  },
  
  operation: {
    keywords: ['创建', '添加', '删除', '修改', '更新', '编辑', '新建', '增加'],
    patterns: [/^(创建|添加|删除|修改|更新|编辑|新建).*/, /.*请(创建|添加|删除).*$/],
    confidence: 0.8,
    requiresTools: true,
    tools: ['create_record', 'update_record', 'delete_record']
  },
  
  search: {
    keywords: ['搜索', '查找', '搜一下', '找一下', '最新', '新闻'],
    patterns: [/^(搜索|查找|搜一下).*/, /.*最新.*/, /.*新闻.*$/],
    confidence: 0.75,
    requiresTools: true,
    tools: ['web_search']
  },
  
  analysis: {
    keywords: ['分析', '趋势', '对比', '统计', '报告', '数据', '比较'],
    patterns: [/^(分析|生成.*报告|.*趋势分析).*/, /.*数据分析.*$/, /.*对比.*$/],
    confidence: 0.8,
    requiresTools: true,
    tools: ['analyze_trends', 'generate_report']
  },
  
  generation: {
    keywords: ['生成', '制作', '生成报告', '生成方案', '制定', '规划'],
    patterns: [/^(生成|制作|制定).*/, /.*生成(报告|方案|计划).*$/],
    confidence: 0.8,
    requiresTools: true,
    tools: ['generate_report', 'create_plan']
  }
};

/**
 * 消息意图分析服务类
 */
export class MessageIntentAnalyzerService {
  private static instance: MessageIntentAnalyzerService;
  private cache: Map<string, { result: MessageAnalysis; timestamp: number }> = new Map();
  private readonly CACHE_TIMEOUT = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {
    logger.info('✅ [消息意图分析] 服务初始化完成');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): MessageIntentAnalyzerService {
    if (!MessageIntentAnalyzerService.instance) {
      MessageIntentAnalyzerService.instance = new MessageIntentAnalyzerService();
    }
    return MessageIntentAnalyzerService.instance;
  }

  /**
   * 分析消息意图
   */
  async analyzeIntent(message: string, context?: any): Promise<MessageAnalysis> {
    const cacheKey = this.getCacheKey(message);
    
    // 1. 检查缓存
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
      logger.info('📊 [消息意图分析] 使用缓存结果', { message: message.substring(0, 50) });
      return { ...cached.result, analysisMethod: 'cache' };
    }

    // 2. 关键词匹配（第1层）
    const keywordMatch = this.matchKeywords(message);
    if (keywordMatch && keywordMatch.confidence > 0.8) {
      logger.info('📊 [消息意图分析] 关键词匹配成功', {
        message: message.substring(0, 50),
        intent: keywordMatch.intent,
        confidence: keywordMatch.confidence
      });
      const result = this.buildAnalysis(keywordMatch, 'keyword');
      this.cache.set(cacheKey, { result, timestamp: Date.now() });
      return result;
    }

    // 3. 使用意图识别服务（第2-3层）
    try {
      const intentResult = await intentRecognitionService.recognizeIntent(message, context);
      
      logger.info('📊 [消息意图分析] AI分析完成', {
        message: message.substring(0, 50),
        intent: intentResult.intent,
        confidence: intentResult.confidence,
        complexity: intentResult.complexity
      });

      const analysis = this.convertIntentResult(intentResult);
      this.cache.set(cacheKey, { result: analysis, timestamp: Date.now() });
      return analysis;
    } catch (error) {
      logger.error('❌ [消息意图分析] AI分析失败，使用默认分析', error);
      
      // 降级处理：使用关键词匹配结果或默认值
      const defaultAnalysis: MessageAnalysis = {
        intent: 'query',
        confidence: 0.5,
        complexity: 'simple',
        requiresTools: false,
        suggestedTools: [],
        reasoning: '默认分析（AI分析失败）',
        keywords: [],
        estimatedTokens: 100,
        analysisMethod: 'keyword'
      };
      
      this.cache.set(cacheKey, { result: defaultAnalysis, timestamp: Date.now() });
      return defaultAnalysis;
    }
  }

  /**
   * 关键词匹配
   */
  private matchKeywords(message: string): any {
    const lowerMessage = message.toLowerCase();
    let bestMatch = null;
    let bestConfidence = 0;

    for (const [intentName, config] of Object.entries(INTENT_KEYWORDS)) {
      // 检查关键词
      for (const keyword of config.keywords) {
        if (lowerMessage.includes(keyword.toLowerCase())) {
          if (config.confidence > bestConfidence) {
            bestMatch = { intent: intentName, ...config };
            bestConfidence = config.confidence;
          }
        }
      }

      // 检查正则模式
      for (const pattern of config.patterns) {
        if (pattern.test(message)) {
          if (config.confidence > bestConfidence) {
            bestMatch = { intent: intentName, ...config };
            bestConfidence = config.confidence;
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * 构建分析结果
   */
  private buildAnalysis(match: any, method: 'keyword' | 'ai' | 'cache'): MessageAnalysis {
    return {
      intent: match.intent,
      confidence: match.confidence,
      complexity: this.estimateComplexity(match.intent),
      requiresTools: match.requiresTools !== false,
      suggestedTools: match.tools || [],
      reasoning: `基于${method === 'keyword' ? '关键词' : 'AI'}匹配识别为${match.intent}`,
      keywords: match.keywords || [],
      estimatedTokens: 100,
      analysisMethod: method
    };
  }

  /**
   * 转换意图识别结果
   */
  private convertIntentResult(intentResult: any): MessageAnalysis {
    const intentMap: Record<string, string> = {
      [IntentType.CONVERSATION]: 'greeting',
      [IntentType.QUERY]: 'query',
      [IntentType.OPERATION]: 'operation',
      [IntentType.ANALYSIS]: 'analysis',
      [IntentType.CREATION]: 'generation',
      [IntentType.MODIFICATION]: 'operation',
      [IntentType.DELETION]: 'operation',
      [IntentType.NAVIGATION]: 'query'
    };

    const mappedIntent = intentMap[intentResult.intent] || 'query';
    const requiresTools = intentRecognitionService.requiresTools(intentResult);

    return {
      intent: mappedIntent,
      confidence: intentResult.confidence,
      complexity: intentResult.complexity,
      requiresTools,
      suggestedTools: this.mapToolCapabilities(intentResult.requiredCapabilities),
      reasoning: `基于AI分析识别为${mappedIntent}`,
      keywords: intentResult.keywords,
      estimatedTokens: 150,
      analysisMethod: 'ai'
    };
  }

  /**
   * 映射工具能力
   */
  private mapToolCapabilities(capabilities: any[]): string[] {
    const toolMap: Record<string, string> = {
      'database_query': 'query_students',
      'data_analysis': 'analyze_trends',
      'chart_generation': 'generate_report',
      'file_operation': 'file_operation'
    };

    return capabilities
      .map(cap => toolMap[cap] || cap)
      .filter(Boolean);
  }

  /**
   * 估计任务复杂度
   */
  private estimateComplexity(intent: string): string {
    const complexityMap: Record<string, string> = {
      greeting: 'simple',
      query: 'simple',
      operation: 'moderate',
      search: 'moderate',
      analysis: 'complex',
      generation: 'complex'
    };
    return complexityMap[intent] || 'moderate';
  }

  /**
   * 生成缓存键
   */
  private getCacheKey(message: string): string {
    return `intent_${message.substring(0, 50)}`;
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
      logger.info(`🧹 [消息意图分析] 清理了 ${cleaned} 个过期缓存`);
    }

    return cleaned;
  }

  /**
   * 获取缓存统计
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.CACHE_TIMEOUT
    };
  }
}

// 导出单例
export const messageIntentAnalyzer = MessageIntentAnalyzerService.getInstance();

