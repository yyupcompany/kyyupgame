/**
 * 智能概念提取服务
 * 基于豆包1.6 Flash模型的智能概念提取和分类系统
 */

import { aiBridgeService } from '../../ai/bridge/ai-bridge.service';
import { logger } from '../../../utils/logger';
import { AIModelConfig } from '../../../models/ai-model-config.model';

export interface ExtractedConcept {
  name: string;
  description: string;
  category: string;
  confidence: number;
  relationships: string[];
  examples: string[];
  importance: 'high' | 'medium' | 'low';
}

export interface ConceptExtractionResult {
  concepts: ExtractedConcept[];
  summary: string;
  keyTopics: string[];
  sentiment: 'positive' | 'neutral' | 'negative';
  domain: string;
}

export interface ExtractionContext {
  userId?: string;
  conversationId?: string;
  domain?: string;
  previousConcepts?: string[];
}

export interface ExtractionMetrics {
  textLength: number;
  conceptCount: number;
  processingTime: number;
  success: boolean;
  method: 'ai_intelligent' | 'regex_fallback';
  timestamp: Date;
}

export class IntelligentConceptExtractionService {
  private static instance: IntelligentConceptExtractionService;
  private flashModelConfig: AIModelConfig | null = null;
  private conceptCache = new Map<string, { result: ConceptExtractionResult; timestamp: number }>();
  private rateLimiter = new Map<string, number[]>();
  private metrics: ExtractionMetrics[] = [];

  private constructor() {}

  public static getInstance(): IntelligentConceptExtractionService {
    if (!IntelligentConceptExtractionService.instance) {
      IntelligentConceptExtractionService.instance = new IntelligentConceptExtractionService();
    }
    return IntelligentConceptExtractionService.instance;
  }

  /**
   * 初始化Flash模型配置
   */
  private async initializeFlashModel(): Promise<void> {
    if (this.flashModelConfig) return;

    try {
      this.flashModelConfig = await AIModelConfig.findOne({
        where: {
          name: 'doubao-seed-1-6-flash-250715',
          status: 'active'
        }
      });

      if (!this.flashModelConfig) {
        logger.warn('[智能概念提取] Flash模型配置未找到，将使用默认模型');
      } else {
        logger.info('[智能概念提取] Flash模型配置加载成功', {
          model: this.flashModelConfig.displayName
        });
      }
    } catch (error) {
      logger.error('[智能概念提取] 初始化Flash模型失败:', error);
    }
  }

  /**
   * 使用豆包1.6 Flash进行智能概念提取
   * @param text 要分析的文本
   * @param context 可选的上下文信息
   * @returns 提取的概念和相关信息
   */
  public async extractConceptsIntelligently(
    text: string,
    context?: ExtractionContext
  ): Promise<ConceptExtractionResult> {
    const startTime = Date.now();

    await this.initializeFlashModel();

    // 输入验证
    if (!this.validateInput(text)) {
      throw new Error('输入文本验证失败');
    }

    // 速率限制检查
    if (!this.checkRateLimit(context?.userId || 'anonymous')) {
      throw new Error('请求频率过高，请稍后再试');
    }

    // 检查缓存
    const cachedResult = this.getCachedResult(text);
    if (cachedResult) {
      this.recordMetrics({
        textLength: text.length,
        conceptCount: cachedResult.concepts.length,
        processingTime: Date.now() - startTime,
        success: true,
        method: 'ai_intelligent',
        timestamp: new Date()
      });
      return cachedResult;
    }

    logger.info('[智能概念提取] 开始分析文本', {
      textLength: text.length,
      context
    });

    try {
      // 构建智能概念提取的提示词
      const prompt = this.buildConceptExtractionPrompt(text, context);

      // 使用Flash模型进行快速推理
      const response = await aiBridgeService.generateFastChatCompletion({
        model: this.flashModelConfig?.name || 'default',
        messages: [
          {
            role: 'system',
            content: `你是一个专业的概念分析专家，专门从文本中提取和分类关键概念。

你的任务是：
1. 识别文本中的核心概念和关键词
2. 为每个概念生成准确的描述
3. 将概念分类到合适的类别中
4. 评估概念的重要性和置信度
5. 识别概念之间的关系

请严格按照JSON格式返回结果，包含以下字段：
{
  "concepts": [
    {
      "name": "概念名称",
      "description": "详细描述（50-100字）",
      "category": "分类（如：教育管理、教学方法、心理学等）",
      "confidence": 0.9,
      "relationships": ["相关概念1", "相关概念2"],
      "examples": ["示例1", "示例2"],
      "importance": "high/medium/low"
    }
  ],
  "summary": "文本内容摘要（100字以内）",
  "keyTopics": ["主题1", "主题2", "主题3"],
  "sentiment": "positive/neutral/negative",
  "domain": "所属领域（如：教育、技术、管理等）"
}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const aiResponse = response.choices?.[0]?.message?.content || '';

      // 解析AI响应
      const result = this.parseAIResponse(aiResponse);

      // 缓存结果
      this.setCachedResult(text, result);

      // 记录成功指标
      this.recordMetrics({
        textLength: text.length,
        conceptCount: result.concepts.length,
        processingTime: Date.now() - startTime,
        success: true,
        method: 'ai_intelligent',
        timestamp: new Date()
      });

      logger.info('[智能概念提取] 分析完成', {
        conceptsCount: result.concepts.length,
        domain: result.domain,
        sentiment: result.sentiment,
        processingTime: Date.now() - startTime
      });

      return result;

    } catch (error) {
      logger.error('[智能概念提取] 智能提取失败，回退到基础提取:', error);

      // 回退到基础提取方法
      const fallbackResult = await this.fallbackConceptExtraction(text);

      // 记录失败指标
      this.recordMetrics({
        textLength: text.length,
        conceptCount: fallbackResult.concepts.length,
        processingTime: Date.now() - startTime,
        success: false,
        method: 'regex_fallback',
        timestamp: new Date()
      });

      return fallbackResult;
    }
  }

  /**
   * 批量概念提取
   * @param texts 文本数组
   * @param context 上下文信息
   * @returns 批量提取结果
   */
  public async batchExtractConcepts(
    texts: string[],
    context?: ExtractionContext
  ): Promise<ConceptExtractionResult[]> {
    const results: ConceptExtractionResult[] = [];

    // 更新上下文以包含之前提取的概念
    const updatedContext = { ...context, previousConcepts: [] };

    for (const text of texts) {
      try {
        const result = await this.extractConceptsIntelligently(text, updatedContext);
        results.push(result);

        // 将当前结果的概念添加到下一个文本的上下文中
        updatedContext.previousConcepts = [
          ...updatedContext.previousConcepts,
          ...result.concepts.map(c => c.name)
        ];
      } catch (error) {
        logger.error('[智能概念提取] 批量提取中的单个文本失败:', error);
        results.push(this.fallbackConceptExtraction(text));
      }
    }

    return results;
  }

  /**
   * 概念去重和合并
   * @param results 多个提取结果
   * @returns 合并后的结果
   */
  public mergeConceptResults(results: ConceptExtractionResult[]): ConceptExtractionResult {
    const conceptMap = new Map<string, ExtractedConcept>();

    for (const result of results) {
      for (const concept of result.concepts) {
        if (conceptMap.has(concept.name)) {
          // 合并概念，保留更高的置信度
          const existing = conceptMap.get(concept.name)!;
          if (concept.confidence > existing.confidence) {
            conceptMap.set(concept.name, concept);
          } else {
            // 合并关系和示例
            existing.relationships = [...new Set([...existing.relationships, ...concept.relationships])];
            existing.examples = [...new Set([...existing.examples, ...concept.examples])];
          }
        } else {
          conceptMap.set(concept.name, concept);
        }
      }
    }

    const mergedConcepts = Array.from(conceptMap.values());

    return {
      concepts: mergedConcepts,
      summary: results.map(r => r.summary).join(' '),
      keyTopics: [...new Set(results.flatMap(r => r.keyTopics))],
      sentiment: results.some(r => r.sentiment === 'positive') ? 'positive' :
               results.some(r => r.sentiment === 'negative') ? 'negative' : 'neutral',
      domain: results[0]?.domain || '通用'
    };
  }

  /**
   * 构建概念提取的提示词
   */
  private buildConceptExtractionPrompt(text: string, context?: any): string {
    let prompt = `请分析以下文本，提取其中的关键概念：

文本内容：
"""
${text}
"""`;

    if (context) {
      prompt += `\n\n上下文信息：`;
      if (context.domain) {
        prompt += `\n- 领域：${context.domain}`;
      }
      if (context.previousConcepts && context.previousConcepts.length > 0) {
        prompt += `\n- 已有概念：${context.previousConcepts.join(', ')}`;
      }
      if (context.userId) {
        prompt += `\n- 用户ID：${context.userId}`;
      }
    }

    prompt += `\n\n请重点关注：
1. 教育相关的专业概念
2. 管理方法和流程
3. 技术工具和应用
4. 重要的实体和关系

请确保提取的概念准确、分类合理，并给出适当的置信度评估。`;

    return prompt;
  }

  /**
   * 解析AI响应为结构化数据
   */
  private parseAIResponse(aiResponse: string): ConceptExtractionResult {
    try {
      // 尝试提取JSON部分
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);

        // 验证和标准化数据
        return {
          concepts: (parsed.concepts || []).map((concept: any) => ({
            name: concept.name || '',
            description: concept.description || '',
            category: concept.category || '未分类',
            confidence: Math.max(0, Math.min(1, concept.confidence || 0.5)),
            relationships: Array.isArray(concept.relationships) ? concept.relationships : [],
            examples: Array.isArray(concept.examples) ? concept.examples : [],
            importance: ['high', 'medium', 'low'].includes(concept.importance)
              ? concept.importance as 'high' | 'medium' | 'low'
              : 'medium'
          })),
          summary: parsed.summary || '',
          keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
          sentiment: ['positive', 'neutral', 'negative'].includes(parsed.sentiment)
            ? parsed.sentiment as 'positive' | 'neutral' | 'negative'
            : 'neutral',
          domain: parsed.domain || '通用'
        };
      }
    } catch (error) {
      logger.warn('[智能概念提取] JSON解析失败，尝试文本解析:', error);
    }

    // 如果JSON解析失败，进行文本解析
    return this.parseTextResponse(aiResponse);
  }

  /**
   * 文本响应解析（备用方案）
   */
  private parseTextResponse(response: string): ConceptExtractionResult {
    const concepts: ExtractedConcept[] = [];
    const lines = response.split('\n');

    let currentConcept: Partial<ExtractedConcept> = {};

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed.startsWith('概念名称:') || trimmed.startsWith('概念:')) {
        if (currentConcept.name) {
          concepts.push(this.finalizeConcept(currentConcept));
        }
        currentConcept = { name: trimmed.split(':')[1]?.trim() || '' };
      } else if (trimmed.startsWith('描述:')) {
        currentConcept.description = trimmed.split(':')[1]?.trim() || '';
      } else if (trimmed.startsWith('分类:')) {
        currentConcept.category = trimmed.split(':')[1]?.trim() || '未分类';
      }
    }

    if (currentConcept.name) {
      concepts.push(this.finalizeConcept(currentConcept));
    }

    return {
      concepts,
      summary: response.substring(0, 100),
      keyTopics: concepts.map(c => c.name).slice(0, 3),
      sentiment: 'neutral',
      domain: '通用'
    };
  }

  /**
   * 完善概念对象
   */
  private finalizeConcept(concept: Partial<ExtractedConcept>): ExtractedConcept {
    return {
      name: concept.name || '',
      description: concept.description || '',
      category: concept.category || '未分类',
      confidence: concept.confidence || 0.7,
      relationships: concept.relationships || [],
      examples: concept.examples || [],
      importance: concept.importance || 'medium'
    };
  }

  /**
   * 回退的概念提取方法（基于规则）
   */
  private async fallbackConceptExtraction(text: string): Promise<ConceptExtractionResult> {
    logger.info('[智能概念提取] 使用回退概念提取方法');

    const keywords = text.match(/[A-Za-z\u4e00-\u9fa5]{2,}/g) || [];
    const uniqueKeywords = [...new Set(keywords)].slice(0, 8);

    const concepts: ExtractedConcept[] = uniqueKeywords.map(keyword => ({
      name: keyword,
      description: `自动提取的关键词: ${keyword}`,
      category: 'auto_extracted',
      confidence: 0.6,
      relationships: [],
      examples: [],
      importance: 'medium' as const
    }));

    return {
      concepts,
      summary: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      keyTopics: uniqueKeywords.slice(0, 3),
      sentiment: 'neutral',
      domain: '通用'
    };
  }

  /**
   * 输入验证
   */
  private validateInput(text: string): boolean {
    // 检查文本长度
    if (text.length > 10000) {
      logger.warn('[智能概念提取] 文本过长，截断处理');
      return false;
    }

    // 检查恶意内容
    const maliciousPatterns = [
      /<script[^>]*>.*?<\/script>/gi,
      /javascript:/gi,
      /data:text\/html/gi
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(text)) {
        logger.warn('[智能概念提取] 检测到潜在的恶意内容');
        return false;
      }
    }

    return true;
  }

  /**
   * 速率限制检查
   */
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.rateLimiter.get(userId) || [];

    // 清理1分钟前的请求记录
    const recentRequests = userRequests.filter(time => now - time < 60000);

    if (recentRequests.length >= 100) { // 每分钟100次限制
      logger.warn('[智能概念提取] 用户超过频率限制', { userId });
      return false;
    }

    recentRequests.push(now);
    this.rateLimiter.set(userId, recentRequests);
    return true;
  }

  /**
   * 获取缓存结果
   */
  private getCachedResult(text: string): ConceptExtractionResult | null {
    const hash = this.hashText(text);
    const cached = this.conceptCache.get(hash);

    if (cached && (Date.now() - cached.timestamp) < 3600000) { // 1小时缓存
      return cached.result;
    }

    return null;
  }

  /**
   * 设置缓存结果
   */
  private setCachedResult(text: string, result: ConceptExtractionResult): void {
    const hash = this.hashText(text);
    this.conceptCache.set(hash, {
      result,
      timestamp: Date.now()
    });
  }

  /**
   * 文本哈希计算
   */
  private hashText(text: string): string {
    // 简单的哈希函数
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char) & 0xffffffff;
    }
    return hash.toString();
  }

  /**
   * 记录性能指标
   */
  private recordMetrics(metrics: ExtractionMetrics): void {
    this.metrics.push(metrics);

    // 保持最近1000条记录
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * 获取性能指标
   */
  public getMetrics(): {
    totalExtractions: number;
    averageProcessingTime: number;
    averageConceptsPerText: number;
    successRate: number;
    aiUsageRate: number;
  } {
    const total = this.metrics.length;
    if (total === 0) {
      return {
        totalExtractions: 0,
        averageProcessingTime: 0,
        averageConceptsPerText: 0,
        successRate: 0,
        aiUsageRate: 0
      };
    }

    const successful = this.metrics.filter(m => m.success).length;
    const aiExtractions = this.metrics.filter(m => m.method === 'ai_intelligent').length;

    return {
      totalExtractions: total,
      averageProcessingTime: this.metrics.reduce((sum, m) => sum + m.processingTime, 0) / total,
      averageConceptsPerText: this.metrics.reduce((sum, m) => sum + m.conceptCount, 0) / total,
      successRate: successful / total,
      aiUsageRate: aiExtractions / total
    };
  }

  /**
   * 清理过期缓存
   */
  public clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, cached] of this.conceptCache.entries()) {
      if (now - cached.timestamp > 3600000) { // 1小时过期
        this.conceptCache.delete(key);
      }
    }
  }

  /**
   * 获取缓存统计
   */
  public getCacheStats(): {
    totalEntries: number;
    expiredEntries: number;
    hitRate: number;
  } {
    const now = Date.now();
    let expiredEntries = 0;

    for (const [, cached] of this.conceptCache.entries()) {
      if (now - cached.timestamp > 3600000) {
        expiredEntries++;
      }
    }

    return {
      totalEntries: this.conceptCache.size,
      expiredEntries,
      hitRate: this.conceptCache.size > 0 ?
        (this.conceptCache.size - expiredEntries) / this.conceptCache.size : 0
    };
  }
}

// 导出单例实例
export const intelligentConceptExtraction = IntelligentConceptExtractionService.getInstance();