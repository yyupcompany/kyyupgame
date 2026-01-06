/**
 * AI模型缓存服务
 * 缓存模型配置，减少数据库查询
 */

import AIModelConfig from '../models/ai-model-config.model';

interface ModelCacheEntry {
  model: any;
  timestamp: number;
}

class AIModelCacheService {
  private static instance: AIModelCacheService;
  private cache: Map<string, ModelCacheEntry> = new Map();
  private ttl: number = 5 * 60 * 1000; // 5分钟过期
  private defaultModel: any = null;
  private initialized: boolean = false;

  static getInstance(): AIModelCacheService {
    if (!AIModelCacheService.instance) {
      AIModelCacheService.instance = new AIModelCacheService();
    }
    return AIModelCacheService.instance;
  }

  /**
   * 初始化缓存
   */
  async initializeCache(): Promise<void> {
    if (this.initialized) return;
    console.log('🔄 [模型缓存] 初始化缓存...');
    try {
      const models = await AIModelConfig.findAll({ where: { status: 'active' } });
      for (const model of models) {
        this.set(model.name, model);
      }
      this.defaultModel = models.find((m: any) => m.isDefault) || models[0];
      this.initialized = true;
      console.log(`✅ [模型缓存] 已缓存 ${models.length} 个模型`);
    } catch (error) {
      console.error('❌ [模型缓存] 初始化失败:', error);
    }
  }

  /**
   * 获取缓存的模型配置
   */
  get(modelName: string): any | undefined {
    const entry = this.cache.get(modelName);
    if (entry && Date.now() - entry.timestamp < this.ttl) {
      return entry.model;
    }
    if (entry) {
      this.cache.delete(modelName);
    }
    return undefined;
  }

  /**
   * 设置缓存
   */
  set(modelName: string, model: any): void {
    this.cache.set(modelName, {
      model,
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
      initialized: this.initialized
    };
  }

  /**
   * 刷新缓存
   */
  refresh(modelName: string): void {
    this.cache.delete(modelName);
  }

  /**
   * 获取默认模型
   */
  async getDefaultModel(): Promise<any> {
    if (this.defaultModel) return this.defaultModel;
    await this.initializeCache();
    return this.defaultModel;
  }

  /**
   * 获取可用模型列表
   */
  async getAvailableModels(): Promise<any[]> {
    await this.initializeCache();
    return Array.from(this.cache.values()).map(e => e.model);
  }

  /**
   * 获取意图分析模型
   */
  async getIntentAnalysisModel(): Promise<any> {
    return this.getDefaultModel();
  }

  /**
   * 获取问答模型
   */
  async getQAModel(): Promise<any> {
    return this.getDefaultModel();
  }

  /**
   * 根据名称获取模型
   */
  async getModelByName(modelName: string): Promise<any> {
    await this.initializeCache();
    return this.get(modelName) || this.defaultModel;
  }
}

export const aiModelCacheService = new AIModelCacheService();
export { AIModelCacheService };
export default aiModelCacheService;

