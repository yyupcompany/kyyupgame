/**
 * 记忆集成服务
 * 负责六维记忆检索、记忆上下文格式化、记忆相关性排序
 * 集成真实的六维记忆系统
 */

import SixDimensionMemoryService from '../../memory/six-dimension-memory.service';
import { logger } from '../../../utils/logger';

export interface MemoryItem {
  id: string;
  dimension: string;
  content: string;
  relevance: number;
  timestamp: number;
  metadata?: any;
}

export interface MemoryContext {
  items: MemoryItem[];
  totalCount: number;
  dimensions: string[];
  query: string;
}

/**
 * 记忆集成服务类
 */
export class MemoryIntegrationService {
  private static instance: MemoryIntegrationService;
  private memorySystem: SixDimensionMemoryService;
  private cache: Map<string, { context: MemoryContext; timestamp: number }> = new Map();
  private cacheTimeout = 5 * 60 * 1000; // 5分钟缓存

  private constructor() {
    this.memorySystem = new SixDimensionMemoryService();
    logger.info('✅ [记忆集成] 记忆集成服务初始化完成');
  }

  /**
   * 获取单例实例
   */
  static getInstance(): MemoryIntegrationService {
    if (!MemoryIntegrationService.instance) {
      MemoryIntegrationService.instance = new MemoryIntegrationService();
    }
    return MemoryIntegrationService.instance;
  }

  /**
   * 设置记忆系统（用于测试）
   */
  setMemorySystem(memorySystem: any): void {
    this.memorySystem = memorySystem;
    logger.info('✅ [记忆集成] 记忆系统已设置');
  }

  /**
   * 检索记忆上下文
   */
  async retrieveMemoryContext(
    query: string,
    userId: string,
    options?: {
      dimensions?: string[];
      limit?: number;
      minRelevance?: number;
      useCache?: boolean;
    }
  ): Promise<MemoryContext> {
    logger.info(`🧠 [记忆集成] 检索记忆: ${query}`, { userId });

    // 检查缓存
    if (options?.useCache !== false) {
      const cacheKey = `${userId}:${query}`;
      const cached = this.cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        logger.info('✅ [记忆集成] 使用缓存结果');
        return cached.context;
      }
    }

    // 如果没有记忆系统，返回空上下文
    if (!this.memorySystem) {
      logger.warn('⚠️ [记忆集成] 记忆系统未设置');
      return this.getEmptyContext(query);
    }

    try {
      // 检索六维记忆
      const dimensions = options?.dimensions || this.getDefaultDimensions();
      const limit = options?.limit || 5;
      const minRelevance = options?.minRelevance || 0.5;

      const items: MemoryItem[] = [];

      // 并行检索各个维度
      const retrievalPromises = dimensions.map(async (dimension) => {
        try {
          const results = await this.retrieveDimension(
            dimension,
            query,
            userId,
            limit
          );
          return results;
        } catch (error) {
          logger.error(`❌ [记忆集成] ${dimension} 维度检索失败:`, error);
          return [];
        }
      });

      const allResults = await Promise.all(retrievalPromises);

      // 合并结果
      allResults.forEach(results => {
        items.push(...results);
      });

      // 按相关性排序
      const sortedItems = this.sortByRelevance(items);

      // 过滤低相关性项
      const filteredItems = sortedItems.filter(
        item => item.relevance >= minRelevance
      );

      // 限制数量
      const limitedItems = filteredItems.slice(0, limit * dimensions.length);

      logger.info(`✅ [记忆集成] 检索完成: ${limitedItems.length} 条记忆`);

      const context: MemoryContext = {
        items: limitedItems,
        totalCount: items.length,
        dimensions,
        query
      };

      // 更新缓存
      if (options?.useCache !== false) {
        const cacheKey = `${userId}:${query}`;
        this.cache.set(cacheKey, { context, timestamp: Date.now() });
      }

      return context;
    } catch (error) {
      logger.error('❌ [记忆集成] 检索失败:', error);
      return this.getEmptyContext(query);
    }
  }

  /**
   * 检索单个维度
   */
  private async retrieveDimension(
    dimension: string,
    query: string,
    userId: string,
    limit: number
  ): Promise<MemoryItem[]> {
    try {
      // 使用六维记忆系统进行检索
      const results = await this.memorySystem.activeRetrieval(query, { userId });

      // 根据维度提取结果
      const dimensionResult = results[dimension];
      if (!dimensionResult || !dimensionResult.items) {
        return [];
      }

      // 转换为MemoryItem格式
      const items: MemoryItem[] = dimensionResult.items.slice(0, limit).map((item: any, index: number) => {
        const relevance = dimensionResult.relevance_scores?.[index] || 0.5;

        return {
          id: item.id || `${dimension}-${index}`,
          dimension,
          content: this.extractContent(item, dimension),
          relevance,
          timestamp: this.extractTimestamp(item),
          metadata: item.metadata || {}
        };
      });

      return items;
    } catch (error) {
      logger.error(`❌ [记忆集成] ${dimension} 维度检索失败:`, error);
      return [];
    }
  }

  /**
   * 从记忆项中提取内容
   */
  private extractContent(item: any, dimension: string): string {
    switch (dimension) {
      case 'core':
        return item.persona?.value || item.human?.value || '';
      case 'episodic':
        return item.summary || item.details || '';
      case 'semantic':
        return item.description || item.name || '';
      case 'procedural':
        return item.description || item.name || '';
      case 'resource':
        return item.description || item.uri || '';
      case 'knowledge':
        return item.content || item.topic || '';
      default:
        return JSON.stringify(item);
    }
  }

  /**
   * 从记忆项中提取时间戳
   */
  private extractTimestamp(item: any): number {
    if (item.created_at) {
      return new Date(item.created_at).getTime();
    }
    if (item.occurred_at) {
      return new Date(item.occurred_at).getTime();
    }
    if (item.validated_at) {
      return new Date(item.validated_at).getTime();
    }
    return Date.now();
  }

  /**
   * 获取默认维度
   */
  private getDefaultDimensions(): string[] {
    return ['core', 'episodic', 'semantic'];
  }

  /**
   * 按相关性排序
   */
  private sortByRelevance(items: MemoryItem[]): MemoryItem[] {
    return items.sort((a, b) => b.relevance - a.relevance);
  }

  /**
   * 获取空上下文
   */
  private getEmptyContext(query: string): MemoryContext {
    return {
      items: [],
      totalCount: 0,
      dimensions: [],
      query
    };
  }

  /**
   * 格式化记忆上下文为文本
   */
  formatMemoryContext(context: MemoryContext): string {
    if (context.items.length === 0) {
      return '';
    }

    let formatted = '\n## 📚 相关记忆上下文\n';
    formatted += '基于用户的历史记忆，以下是相关的上下文信息：\n\n';

    // 按维度分组
    const byDimension = this.groupByDimension(context.items);

    Object.entries(byDimension).forEach(([dimension, items]) => {
      formatted += `### ${this.getDimensionName(dimension)}\n`;
      items.forEach((item, index) => {
        formatted += `${index + 1}. ${item.content} (相关度: ${(item.relevance * 100).toFixed(0)}%)\n`;
      });
      formatted += '\n';
    });

    formatted += '请参考这些记忆信息，为用户提供更加个性化和连贯的服务。\n';

    return formatted;
  }

  /**
   * 按维度分组
   */
  private groupByDimension(items: MemoryItem[]): Record<string, MemoryItem[]> {
    const grouped: Record<string, MemoryItem[]> = {};

    items.forEach(item => {
      if (!grouped[item.dimension]) {
        grouped[item.dimension] = [];
      }
      grouped[item.dimension].push(item);
    });

    return grouped;
  }

  /**
   * 获取维度名称
   */
  private getDimensionName(dimension: string): string {
    const names: Record<string, string> = {
      core: '核心记忆',
      episodic: '情景记忆',
      semantic: '语义记忆',
      procedural: '程序记忆',
      resource: '资源记忆',
      knowledge: '知识库'
    };

    return names[dimension] || dimension;
  }

  /**
   * 格式化为简洁列表
   */
  formatAsSimpleList(context: MemoryContext): string[] {
    return context.items.map(item => item.content);
  }

  /**
   * 格式化为结构化数据
   */
  formatAsStructured(context: MemoryContext): any[] {
    return context.items.map(item => ({
      dimension: item.dimension,
      content: item.content,
      relevance: item.relevance,
      timestamp: item.timestamp
    }));
  }

  /**
   * 计算记忆覆盖率
   */
  calculateCoverage(context: MemoryContext): any {
    const dimensionCounts: Record<string, number> = {};

    context.items.forEach(item => {
      dimensionCounts[item.dimension] = (dimensionCounts[item.dimension] || 0) + 1;
    });

    const totalDimensions = 6; // 六维记忆
    const coveredDimensions = Object.keys(dimensionCounts).length;

    return {
      totalDimensions,
      coveredDimensions,
      coverageRate: (coveredDimensions / totalDimensions) * 100,
      dimensionCounts
    };
  }

  /**
   * 过滤记忆
   */
  filterMemories(
    context: MemoryContext,
    filters: {
      dimensions?: string[];
      minRelevance?: number;
      maxAge?: number; // 毫秒
    }
  ): MemoryContext {
    let filtered = context.items;

    // 按维度过滤
    if (filters.dimensions && filters.dimensions.length > 0) {
      filtered = filtered.filter(item =>
        filters.dimensions!.includes(item.dimension)
      );
    }

    // 按相关性过滤
    if (filters.minRelevance !== undefined) {
      filtered = filtered.filter(item =>
        item.relevance >= filters.minRelevance!
      );
    }

    // 按时间过滤
    if (filters.maxAge !== undefined) {
      const cutoffTime = Date.now() - filters.maxAge;
      filtered = filtered.filter(item =>
        item.timestamp >= cutoffTime
      );
    }

    return {
      ...context,
      items: filtered,
      totalCount: filtered.length
    };
  }

  /**
   * 合并多个记忆上下文
   */
  mergeContexts(contexts: MemoryContext[]): MemoryContext {
    if (contexts.length === 0) {
      return this.getEmptyContext('');
    }

    const allItems: MemoryItem[] = [];
    const allDimensions = new Set<string>();

    contexts.forEach(context => {
      allItems.push(...context.items);
      context.dimensions.forEach(dim => allDimensions.add(dim));
    });

    // 去重（基于ID）
    const uniqueItems = Array.from(
      new Map(allItems.map(item => [item.id, item])).values()
    );

    // 排序
    const sortedItems = this.sortByRelevance(uniqueItems);

    return {
      items: sortedItems,
      totalCount: sortedItems.length,
      dimensions: Array.from(allDimensions),
      query: contexts[0].query
    };
  }

  /**
   * 获取统计信息
   */
  getStats(context: MemoryContext): any {
    const coverage = this.calculateCoverage(context);

    const avgRelevance = context.items.length > 0
      ? context.items.reduce((sum, item) => sum + item.relevance, 0) / context.items.length
      : 0;

    const recentItems = context.items.filter(
      item => Date.now() - item.timestamp < 24 * 60 * 60 * 1000 // 24小时内
    ).length;

    return {
      totalItems: context.items.length,
      dimensions: context.dimensions.length,
      coverage: coverage.coverageRate,
      avgRelevance: avgRelevance * 100,
      recentItems,
      oldestTimestamp: context.items.length > 0
        ? Math.min(...context.items.map(item => item.timestamp))
        : null,
      newestTimestamp: context.items.length > 0
        ? Math.max(...context.items.map(item => item.timestamp))
        : null
    };
  }

  /**
   * 清理过期缓存
   */
  clearExpiredCache(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
    logger.info(`🧹 [记忆集成] 清理过期缓存，剩余: ${this.cache.size} 条`);
  }

  /**
   * 清空所有缓存
   */
  clearAllCache(): void {
    this.cache.clear();
    logger.info('🧹 [记忆集成] 已清空所有缓存');
  }

  /**
   * 获取缓存统计
   */
  getCacheStats(): { size: number; timeout: number } {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout
    };
  }
}

// 导出单例
export const memoryIntegrationService = MemoryIntegrationService.getInstance();

