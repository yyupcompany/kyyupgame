/**
 * AI缓存服务
 * 管理AI响应缓存
 */

export interface CacheEntry {
  key: string;
  value: any;
  ttl: number;
  createdAt: Date;
  hitCount: number;
}

export interface CacheStats {
  totalEntries: number;
  hitRate: number;
  memoryUsage: number;
}

class AICacheService {
  private cache: Map<string, CacheEntry> = new Map();

  /**
   * 获取缓存
   */
  async get(key: string): Promise<any | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.createdAt.getTime() > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hitCount++;
    return entry.value;
  }

  /**
   * 设置缓存
   */
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    this.cache.set(key, {
      key,
      value,
      ttl,
      createdAt: new Date(),
      hitCount: 0
    });
  }

  /**
   * 删除缓存
   */
  async delete(key: string): Promise<boolean> {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  async clear(): Promise<void> {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  async getStats(): Promise<CacheStats> {
    let totalHits = 0;
    this.cache.forEach(entry => {
      totalHits += entry.hitCount;
    });
    
    return {
      totalEntries: this.cache.size,
      hitRate: this.cache.size > 0 ? totalHits / this.cache.size : 0,
      memoryUsage: 0
    };
  }

  /**
   * 清理过期缓存
   */
  async cleanup(): Promise<number> {
    const now = Date.now();
    let cleaned = 0;

    this.cache.forEach((entry, key) => {
      if (now - entry.createdAt.getTime() > entry.ttl * 1000) {
        this.cache.delete(key);
        cleaned++;
      }
    });

    return cleaned;
  }

  /**
   * 生成文档分析缓存键
   */
  generateDocumentAnalysisKey(documentId: string, analysisType?: string): string {
    return `doc_analysis:${documentId}:${analysisType || 'default'}`;
  }

  /**
   * 生成计划分析缓存键
   */
  generatePlanAnalysisKey(planId: string, analysisType?: string): string {
    return `plan_analysis:${planId}:${analysisType || 'default'}`;
  }

  /**
   * 获取带元数据的缓存
   */
  async getWithMetadata(key: string): Promise<{ value: any; age: number } | null> {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.createdAt.getTime() > entry.ttl * 1000) {
      this.cache.delete(key);
      return null;
    }

    entry.hitCount++;
    return {
      value: entry.value,
      age: now - entry.createdAt.getTime()
    };
  }
}

export const aiCacheService = new AICacheService();
export default aiCacheService;

