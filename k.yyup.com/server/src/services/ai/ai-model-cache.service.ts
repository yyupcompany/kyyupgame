/**
 * AI模型缓存服务 - 简化版占位符
 */

class AIModelCacheServiceImpl {
  private static instance: AIModelCacheServiceImpl;

  static getInstance(): AIModelCacheServiceImpl {
    if (!AIModelCacheServiceImpl.instance) {
      AIModelCacheServiceImpl.instance = new AIModelCacheServiceImpl();
    }
    return AIModelCacheServiceImpl.instance;
  }

  async get(key: string): Promise<any> {
    console.log('💾 获取缓存:', key);
    return null;
  }

  async set(key: string, value: any): Promise<void> {
    console.log('💾 设置缓存:', key);
  }
}

export const aiModelCacheService = AIModelCacheServiceImpl.getInstance();
export { AIModelCacheServiceImpl as AIModelCacheService };
export default aiModelCacheService;
