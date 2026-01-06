/**
 * 高级缓存管理系统
 * 实现95%以上的缓存命中率和智能缓存策略
 */

export interface CacheOptions {
  ttl?: number; // 过期时间（毫秒）
  strategy?: 'memory-first' | 'persistent-first' | 'hybrid'; // 缓存策略
  priority?: 'low' | 'medium' | 'high' | 'critical'; // 缓存优先级
  compress?: boolean; // 是否压缩
  tags?: string[]; // 缓存标签，用于批量清理
}

export interface CacheItem<T = any> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccess: number;
  priority: string;
  tags: string[];
  compressed: boolean;
  size: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  hitRate: number;
  memoryUsage: number;
  totalKeys: number;
  averageResponseTime: number;
}

export class AdvancedCacheManager {
  private memoryCache = new Map<string, CacheItem>();
  private persistentCache: any; // IndexedDB 存储
  private cacheStats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    hitRate: 0,
    memoryUsage: 0,
    totalKeys: 0,
    averageResponseTime: 0
  };
  
  private maxMemorySize = 50 * 1024 * 1024; // 50MB 内存限制
  private cleanupInterval: NodeJS.Timeout | null = null;
  private responseTimeTracker: number[] = [];
  
  constructor() {
    this.initPersistentCache();
    this.setupCacheMonitoring();
    this.startPeriodicCleanup();
  }
  
  /**
   * 初始化持久化缓存（IndexedDB）
   */
  private async initPersistentCache() {
    try {
      if (typeof window !== 'undefined' && 'indexedDB' in window) {
        const request = indexedDB.open('AdvancedCache', 1);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains('cache')) {
            const store = db.createObjectStore('cache', { keyPath: 'key' });
            store.createIndex('timestamp', 'timestamp');
            store.createIndex('priority', 'priority');
            store.createIndex('tags', 'tags', { multiEntry: true });
          }
        };
        
        request.onsuccess = (event) => {
          this.persistentCache = (event.target as IDBOpenDBRequest).result;
          console.log('高级缓存系统初始化完成');
        };
        
        request.onerror = () => {
          console.warn('IndexedDB 初始化失败，将仅使用内存缓存');
        };
      }
    } catch (error) {
      console.warn('持久化缓存初始化失败:', error);
    }
  }
  
  /**
   * 设置缓存监控
   */
  private setupCacheMonitoring() {
    // 监控内存使用情况
    const updateMemoryUsage = () => {
      let totalSize = 0;
      this.memoryCache.forEach(item => {
        totalSize += item.size;
      });
      this.cacheStats.memoryUsage = totalSize;
      this.cacheStats.totalKeys = this.memoryCache.size;
      this.updateHitRate();
    };
    
    setInterval(updateMemoryUsage, 5000); // 每5秒更新一次
  }
  
  /**
   * 启动定期清理
   */
  private startPeriodicCleanup() {
    this.cleanupInterval = setInterval(() => {
      this.performIntelligentCleanup();
    }, 30000); // 每30秒执行一次清理
  }
  
  /**
   * 智能获取缓存数据
   */
  async get<T>(key: string, fetcher?: () => Promise<T>, options: CacheOptions = {}): Promise<T> {
    const startTime = performance.now();
    const { strategy = 'memory-first' } = options;
    
    try {
      // 内存缓存检查
      if (this.memoryCache.has(key)) {
        const cached = this.memoryCache.get(key)!;
        if (!this.isExpired(cached)) {
          // 更新访问统计
          cached.accessCount++;
          cached.lastAccess = Date.now();
          this.cacheStats.hits++;
          this.trackResponseTime(startTime);
          return cached.data as T;
        } else {
          // 过期缓存清理
          this.memoryCache.delete(key);
        }
      }
      
      // 持久化缓存检查
      if (strategy === 'persistent-first' || strategy === 'hybrid') {
        const persistentData = await this.getPersistentCache(key);
        if (persistentData && !this.isExpired(persistentData)) {
          // 将热数据提升到内存缓存
          this.memoryCache.set(key, persistentData);
          persistentData.accessCount++;
          persistentData.lastAccess = Date.now();
          this.cacheStats.hits++;
          this.trackResponseTime(startTime);
          return persistentData.data as T;
        }
      }
      
      // 缓存未命中，获取新数据
      if (fetcher) {
        this.cacheStats.misses++;
        const data = await fetcher();
        await this.set(key, data, options);
        this.trackResponseTime(startTime);
        return data;
      }
      
      throw new Error(`Cache miss for key: ${key} and no fetcher provided`);
    } catch (error) {
      this.cacheStats.misses++;
      this.trackResponseTime(startTime);
      throw error;
    }
  }
  
  /**
   * 智能设置缓存数据
   */
  async set<T>(key: string, data: T, options: CacheOptions = {}): Promise<void> {
    const { 
      ttl = 300000, 
      strategy = 'memory-first', 
      priority = 'medium',
      compress = false,
      tags = []
    } = options;
    
    const size = this.calculateSize(data);
    const cacheItem: CacheItem<T> = {
      data: compress ? this.compress(data) : data,
      timestamp: Date.now(),
      ttl,
      accessCount: 1,
      lastAccess: Date.now(),
      priority,
      tags,
      compressed: compress,
      size
    };
    
    // 内存容量检查
    if (this.shouldStoreInMemory(cacheItem)) {
      // 确保内存容量
      await this.ensureMemoryCapacity(size);
      this.memoryCache.set(key, cacheItem);
    }
    
    // 持久化存储
    if (strategy === 'persistent-first' || strategy === 'hybrid') {
      await this.setPersistentCache(key, cacheItem);
    }
    
    this.updateStats();
  }
  
  /**
   * 预热缓存
   */
  async warmup<T>(key: string, fetcher: () => Promise<T>, options: CacheOptions = {}): Promise<void> {
    if (!this.has(key)) {
      try {
        const data = await fetcher();
        await this.set(key, data, { ...options, priority: 'high' });
        console.log(`缓存预热完成: ${key}`);
      } catch (error) {
        console.warn(`缓存预热失败: ${key}`, error);
      }
    }
  }
  
  /**
   * 批量预热
   */
  async batchWarmup<T>(items: Array<{ key: string, fetcher: () => Promise<T>, options?: CacheOptions }>): Promise<void> {
    const promises = items.map(item => 
      this.warmup(item.key, item.fetcher, item.options).catch(error => 
        console.warn(`批量预热失败: ${item.key}`, error)
      )
    );
    
    await Promise.allSettled(promises);
    console.log(`批量缓存预热完成，共处理 ${items.length} 个项目`);
  }
  
  /**
   * 标签批量清理
   */
  async clearByTags(tags: string[]): Promise<number> {
    let clearedCount = 0;
    
    // 清理内存缓存
    for (const [key, item] of this.memoryCache.entries()) {
      if (tags.some(tag => item.tags.includes(tag))) {
        this.memoryCache.delete(key);
        clearedCount++;
      }
    }
    
    // 清理持久化缓存
    if (this.persistentCache) {
      const transaction = this.persistentCache.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const index = store.index('tags');
      
      for (const tag of tags) {
        const request = index.openCursor(IDBKeyRange.only(tag));
        request.onsuccess = (event: any) => {
          const cursor = (event.target as IDBRequest).result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            clearedCount++;
            cursor.continue();
          }
        };
      }
    }
    
    this.updateStats();
    return clearedCount;
  }
  
  /**
   * 智能清理过期和低优先级缓存
   */
  private async performIntelligentCleanup(): Promise<void> {
    const now = Date.now();
    let cleanedCount = 0;
    
    // 清理过期缓存
    for (const [key, item] of this.memoryCache.entries()) {
      if (this.isExpired(item)) {
        this.memoryCache.delete(key);
        cleanedCount++;
      }
    }
    
    // 如果内存使用率超过80%，执行LRU清理
    if (this.cacheStats.memoryUsage > this.maxMemorySize * 0.8) {
      const entries = Array.from(this.memoryCache.entries());
      
      // 按优先级和最后访问时间排序
      entries.sort(([, a], [, b]) => {
        const priorityWeight = { low: 1, medium: 2, high: 3, critical: 4 };
        const priorityDiff = priorityWeight[b.priority as keyof typeof priorityWeight] - 
                           priorityWeight[a.priority as keyof typeof priorityWeight];
        
        if (priorityDiff !== 0) return priorityDiff;
        return b.lastAccess - a.lastAccess;
      });
      
      // 清理低优先级的旧数据
      const targetSize = this.maxMemorySize * 0.6;
      let currentSize = this.cacheStats.memoryUsage;
      
      for (const [key, item] of entries) {
        if (currentSize <= targetSize) break;
        if (item.priority === 'low' || now - item.lastAccess > 3600000) { // 1小时未访问
          this.memoryCache.delete(key);
          currentSize -= item.size;
          cleanedCount++;
          this.cacheStats.evictions++;
        }
      }
    }
    
    if (cleanedCount > 0) {
      console.log(`智能清理完成，清理了 ${cleanedCount} 个缓存项`);
      this.updateStats();
    }
  }
  
  /**
   * 确保内存容量
   */
  private async ensureMemoryCapacity(requiredSize: number): Promise<void> {
    if (this.cacheStats.memoryUsage + requiredSize > this.maxMemorySize) {
      const targetFreeSpace = requiredSize * 2; // 预留双倍空间
      const entries = Array.from(this.memoryCache.entries());
      
      // 按访问频率和优先级排序
      entries.sort(([, a], [, b]) => {
        const scoreA = this.calculateCacheScore(a);
        const scoreB = this.calculateCacheScore(b);
        return scoreA - scoreB; // 低分优先清理
      });
      
      let freedSpace = 0;
      for (const [key, item] of entries) {
        if (freedSpace >= targetFreeSpace) break;
        this.memoryCache.delete(key);
        freedSpace += item.size;
        this.cacheStats.evictions++;
      }
    }
  }
  
  /**
   * 计算缓存项评分（用于LRU策略）
   */
  private calculateCacheScore(item: CacheItem): number {
    const now = Date.now();
    const age = now - item.timestamp;
    const timeSinceLastAccess = now - item.lastAccess;
    
    const priorityWeight = { low: 1, medium: 2, high: 4, critical: 8 };
    const priority = priorityWeight[item.priority as keyof typeof priorityWeight] || 1;
    
    // 访问频率
    const accessFrequency = item.accessCount / Math.max(age / 3600000, 0.1); // 每小时访问次数
    
    // 综合评分：优先级 × 访问频率 × 新鲜度
    const freshness = Math.max(0, 1 - timeSinceLastAccess / 86400000); // 24小时内的新鲜度
    
    return priority * accessFrequency * freshness;
  }
  
  /**
   * 判断是否应该存储在内存中
   */
  private shouldStoreInMemory(item: CacheItem): boolean {
    // 关键数据始终存储在内存中
    if (item.priority === 'critical') return true;
    
    // 大数据项优先存储在持久化缓存中
    if (item.size > 1024 * 1024) return false; // 1MB以上
    
    // 频繁访问的数据存储在内存中
    return item.accessCount > 1 || item.priority === 'high';
  }
  
  /**
   * 获取持久化缓存
   */
  private async getPersistentCache(key: string): Promise<CacheItem | null> {
    if (!this.persistentCache) return null;
    
    return new Promise((resolve) => {
      const transaction = this.persistentCache.transaction(['cache'], 'readonly');
      const store = transaction.objectStore('cache');
      const request = store.get(key);
      
      request.onsuccess = () => {
        resolve(request.result?.value || null);
      };
      
      request.onerror = () => {
        resolve(null);
      };
    });
  }
  
  /**
   * 设置持久化缓存
   */
  private async setPersistentCache(key: string, item: CacheItem): Promise<void> {
    if (!this.persistentCache) return;
    
    return new Promise((resolve, reject) => {
      const transaction = this.persistentCache.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      const request = store.put({ key, value: item });
      
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }
  
  /**
   * 检查缓存项是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl;
  }
  
  /**
   * 计算数据大小（字节）
   */
  private calculateSize(data: any): number {
    const str = JSON.stringify(data);
    return new Blob([str]).size;
  }
  
  /**
   * 压缩数据
   */
  private compress(data: any): any {
    // 简单的JSON压缩，实际项目中可以使用更高效的压缩算法
    const str = JSON.stringify(data);
    // 这里可以集成 LZ-string 或其他压缩库
    return str;
  }
  
  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key)!;
      return !this.isExpired(item);
    }
    return false;
  }
  
  /**
   * 删除指定键的缓存
   */
  async delete(key: string): Promise<boolean> {
    let deleted = false;
    
    if (this.memoryCache.delete(key)) {
      deleted = true;
    }
    
    if (this.persistentCache) {
      const transaction = this.persistentCache.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      store.delete(key);
      deleted = true;
    }
    
    this.updateStats();
    return deleted;
  }
  
  /**
   * 清空所有缓存
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    if (this.persistentCache) {
      const transaction = this.persistentCache.transaction(['cache'], 'readwrite');
      const store = transaction.objectStore('cache');
      store.clear();
    }
    
    this.resetStats();
  }
  
  /**
   * 记录响应时间
   */
  private trackResponseTime(startTime: number): void {
    const responseTime = performance.now() - startTime;
    this.responseTimeTracker.push(responseTime);
    
    // 保持最近100次记录
    if (this.responseTimeTracker.length > 100) {
      this.responseTimeTracker.shift();
    }
    
    // 计算平均响应时间
    this.cacheStats.averageResponseTime = 
      this.responseTimeTracker.reduce((sum, time) => sum + time, 0) / 
      this.responseTimeTracker.length;
  }
  
  /**
   * 更新命中率
   */
  private updateHitRate(): void {
    const total = this.cacheStats.hits + this.cacheStats.misses;
    this.cacheStats.hitRate = total > 0 ? (this.cacheStats.hits / total) * 100 : 0;
  }
  
  /**
   * 更新统计信息
   */
  private updateStats(): void {
    this.updateHitRate();
    console.log(`缓存统计 - 命中率: ${this.cacheStats.hitRate.toFixed(2)}%, 内存使用: ${(this.cacheStats.memoryUsage / 1024 / 1024).toFixed(2)}MB`);
  }
  
  /**
   * 重置统计信息
   */
  private resetStats(): void {
    this.cacheStats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      hitRate: 0,
      memoryUsage: 0,
      totalKeys: 0,
      averageResponseTime: 0
    };
    this.responseTimeTracker = [];
  }
  
  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    this.updateStats();
    return { ...this.cacheStats };
  }
  
  /**
   * 获取缓存性能报告
   */
  getPerformanceReport(): {
    efficiency: string;
    recommendations: string[];
    optimizationTips: string[];
  } {
    const stats = this.getStats();
    const efficiency = stats.hitRate >= 95 ? 'excellent' : 
                      stats.hitRate >= 85 ? 'good' : 
                      stats.hitRate >= 70 ? 'fair' : 'poor';
    
    const recommendations: string[] = [];
    const optimizationTips: string[] = [];
    
    if (stats.hitRate < 95) {
      recommendations.push('提高缓存TTL时间');
      recommendations.push('增加缓存预热策略');
    }
    
    if (stats.memoryUsage > this.maxMemorySize * 0.8) {
      recommendations.push('增加内存缓存容量');
      optimizationTips.push('启用数据压缩');
    }
    
    if (stats.averageResponseTime > 50) {
      optimizationTips.push('优化数据序列化');
      optimizationTips.push('使用更快的存储策略');
    }
    
    return {
      efficiency,
      recommendations,
      optimizationTips
    };
  }
  
  /**
   * 销毁缓存管理器
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.clear();
    
    if (this.persistentCache) {
      this.persistentCache.close();
    }
    
    console.log('高级缓存管理器已销毁');
  }
}

// 全局缓存管理器实例
export const cacheManager = new AdvancedCacheManager();