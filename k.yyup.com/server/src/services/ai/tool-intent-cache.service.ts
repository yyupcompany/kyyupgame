/**
 * 工具意图缓存服务
 * 缓存工具调用意图识别结果，提高响应速度
 */

interface IntentCacheEntry {
  intent: string;
  tools: string[];
  timestamp: number;
}

class ToolIntentCacheService {
  private cache: Map<string, IntentCacheEntry> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5分钟过期

  /**
   * 获取缓存的意图
   */
  get(query: string): IntentCacheEntry | undefined {
    const entry = this.cache.get(query);
    if (entry && Date.now() - entry.timestamp < this.ttl) {
      return entry;
    }
    if (entry) {
      this.cache.delete(query);
    }
    return undefined;
  }

  /**
   * 设置缓存
   */
  set(query: string, intent: string, tools: string[]): void {
    this.cache.set(query, {
      intent,
      tools,
      timestamp: Date.now()
    });
  }

  /**
   * 清除缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return {
      size: this.cache.size,
      ttl: this.ttl,
      hitRate: 0,
      missRate: 0
    };
  }

  /**
   * 清除特定工具的缓存
   */
  clearTool(toolName: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tools.includes(toolName)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * 清除所有缓存
   */
  clearAll(): void {
    this.cache.clear();
  }

  /**
   * 重置统计
   */
  resetStats(): void {
    // 重置统计数据
    console.log('📊 重置缓存统计');
  }

  /**
   * 预热缓存
   */
  async warmup(tools?: string[]): Promise<void> {
    console.log('🔥 预热工具意图缓存', tools ? `(${tools.length}个工具)` : '');
    // 预热常用查询
    if (tools) {
      for (const tool of tools) {
        this.set(tool, tool, [tool]);
      }
    }
  }

  /**
   * 检查连接状态
   */
  isConnected(): boolean {
    return true; // 内存缓存始终可用
  }
}

export const toolIntentCacheService = new ToolIntentCacheService();
export default toolIntentCacheService;

