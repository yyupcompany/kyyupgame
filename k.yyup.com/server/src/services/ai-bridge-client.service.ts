/**
 * AI桥接客户端服务
 * 通过统一租户系统(rent.yyup.cc)调用AI服务
 *
 * 设计策略：
 * 1. 登录时获取模型列表，缓存到内存
 * 2. 设置缓存过期时间（默认5分钟）
 * 3. 调用时检查缓存，过期则自动刷新
 * 4. 支持手动刷新和强制刷新
 */

import axios, { AxiosInstance } from 'axios';

// 统一租户系统API基础URL
const UNIFIED_TENANT_API_URL = process.env.UNIFIED_TENANT_API_URL || 'http://localhost:3001';

// 缓存过期时间（毫秒）- 默认5分钟
const CACHE_TTL_MS = 5 * 60 * 1000;

export interface AIModel {
  id: number;
  name: string;
  displayName: string;
  modelType: string;
  provider: string;
  priority?: number;
  rateLimit?: number;
  monthlyQuota?: number;
  isDefault?: boolean;
}

interface ModelCache {
  models: AIModel[];
  lastFetchTime: number;
  authToken: string;
}

export class AIBridgeClient {
  private static instance: AIBridgeClient;
  private httpClient: AxiosInstance;

  // 模型缓存 - 按租户token分开缓存
  private modelCache: Map<string, ModelCache> = new Map();
  private cacheTTL: number = CACHE_TTL_MS;

  private constructor() {
    this.httpClient = axios.create({
      baseURL: `${UNIFIED_TENANT_API_URL}/api/v1/ai/bridge`,
      headers: { 'Content-Type': 'application/json' },
      timeout: 60000,
    });
    console.log(`🔗 [AIBridgeClient] 初始化，API地址: ${UNIFIED_TENANT_API_URL}`);
  }

  static getInstance(): AIBridgeClient {
    if (!AIBridgeClient.instance) {
      AIBridgeClient.instance = new AIBridgeClient();
    }
    return AIBridgeClient.instance;
  }

  /**
   * 设置缓存过期时间
   */
  setCacheTTL(ttlMs: number): void {
    this.cacheTTL = ttlMs;
  }

  /**
   * 检查缓存是否过期
   */
  private isCacheExpired(cache: ModelCache): boolean {
    return Date.now() - cache.lastFetchTime > this.cacheTTL;
  }

  /**
   * 获取模型列表（带缓存）
   * @param authToken 认证token（可选）
   * @param forceRefresh 是否强制刷新缓存
   */
  async getModels(authToken?: string, forceRefresh: boolean = false): Promise<AIModel[]> {
    const cacheKey = authToken || 'default';
    const cached = this.modelCache.get(cacheKey);

    // 检查缓存是否有效
    if (!forceRefresh && cached && !this.isCacheExpired(cached)) {
      console.log('📦 [AIBridgeClient] 使用缓存的模型列表');
      return cached.models;
    }

    // 缓存过期或不存在，从统一租户系统获取
    console.log('🔄 [AIBridgeClient] 从统一租户系统获取模型列表');

    try {
      const response = await this.httpClient.get('/models', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      if (response.data?.success && response.data?.data?.models) {
        const models = response.data.data.models as AIModel[];

        // 更新缓存
        this.modelCache.set(cacheKey, {
          models,
          lastFetchTime: Date.now(),
          authToken,
        });

        console.log(`✅ [AIBridgeClient] 获取到 ${models.length} 个模型，已缓存`);
        return models;
      }

      return [];
    } catch (error: any) {
      console.error('❌ [AIBridgeClient] 获取模型列表失败:', error.message);

      // 如果有过期缓存，返回过期数据（降级策略）
      if (cached) {
        console.log('⚠️ [AIBridgeClient] 使用过期缓存作为降级');
        return cached.models;
      }

      return [];
    }
  }

  /**
   * 获取默认模型
   */
  async getDefaultModel(authToken: string): Promise<AIModel | null> {
    const models = await this.getModels(authToken);
    return models.find(m => m.isDefault) || models[0] || null;
  }

  /**
   * 按类型获取模型
   */
  async getModelsByType(authToken: string, modelType: string): Promise<AIModel[]> {
    const models = await this.getModels(authToken);
    return models.filter(m => m.modelType === modelType);
  }

  /**
   * 登录时预加载模型列表
   * 建议在用户登录成功后调用
   */
  async preloadModels(authToken: string): Promise<void> {
    console.log('🚀 [AIBridgeClient] 预加载模型列表');
    await this.getModels(authToken, true);
  }

  /**
   * 清除缓存
   */
  clearCache(authToken?: string): void {
    if (authToken) {
      this.modelCache.delete(authToken);
      console.log('🗑️ [AIBridgeClient] 清除指定token的模型缓存');
    } else {
      this.modelCache.clear();
      console.log('🗑️ [AIBridgeClient] 清除所有模型缓存');
    }
  }

  /**
   * 刷新模型缓存
   */
  async refreshModelCache(authToken?: string): Promise<void> {
    console.log('🔄 [AIBridgeClient] 刷新模型缓存');
    await this.getModels(authToken, true);
  }

  /**
   * 发送AI对话请求
   */
  async chat(request: {
    messages: Array<{ role: string; content: string }>;
    model?: string;
    temperature?: number;
    max_tokens?: number;
  }, authToken?: string): Promise<any> {
    try {
      const headers: any = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const response = await this.httpClient.post('/chat', request, { headers });
      return response.data;
    } catch (error: any) {
      console.error('❌ [AIBridgeClient] AI对话请求失败:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * 检查服务状态
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data?.success === true;
    } catch {
      return false;
    }
  }

  /**
   * 获取缓存状态（调试用）
   */
  getCacheStatus(): { size: number; keys: string[] } {
    return {
      size: this.modelCache.size,
      keys: Array.from(this.modelCache.keys()).map(k => k.substring(0, 20) + '...'),
    };
  }
}

export const aiBridgeClient = AIBridgeClient.getInstance();
export default aiBridgeClient;

