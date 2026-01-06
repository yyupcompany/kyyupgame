/**
 * 统一租户AI客户端服务
 * 通过HTTP调用统一租户系统(rent.yyup.cc)的AI Bridge API
 * 所有AI调用都需要通过统一租户系统进行，实现集中管理和计费
 *
 * 缓存策略：
 * 1. 登录时预加载模型列表到缓存
 * 2. 设置缓存过期时间（默认5分钟）
 * 3. 调用时检查缓存，过期则自动刷新
 * 4. 支持手动刷新和强制刷新
 */

import axios, { AxiosInstance } from 'axios';

// 统一租户系统API基础URL
const UNIFIED_TENANT_API_URL = process.env.UNIFIED_TENANT_API_URL || 'http://localhost:3001';

// 缓存过期时间（毫秒）- 默认5分钟
const MODEL_CACHE_TTL_MS = 5 * 60 * 1000;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  model?: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  stream?: boolean;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    message: string;
    content?: string;
    usage?: {
      inputTokens: number;
      outputTokens: number;
      totalTokens: number;
      cost: number;
      responseTime: number;
    };
  };
  error?: string;
}

export interface AudioProcessRequest {
  model?: string;
  file: Buffer | string;
  filename?: string;
  action?: 'transcribe' | 'translate' | 'synthesize';
  language?: string;
  response_format?: string;
}

export interface AudioProcessResponse {
  success: boolean;
  data?: {
    text?: string;
    audio_url?: string;
    duration?: number;
    language?: string;
    usage?: any;
  };
  error?: string;
}

export interface ImageGenerateRequest {
  model?: string;
  prompt: string;
  n?: number;
  size?: string;
  quality?: string;
  logo_info?: {
    add_logo: boolean;
    [key: string]: any;
  };
}

export interface ImageGenerateResponse {
  success: boolean;
  data?: {
    images: Array<{
      url: string;
      revised_prompt?: string;
    }>;
    usage?: any;
    responseTime: number;
  };
  error?: string;
}

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
}

class UnifiedTenantAIClientService {
  private httpClient: AxiosInstance;

  // 模型缓存 - 按租户token分开缓存
  private modelCache: Map<string, ModelCache> = new Map();
  private cacheTTL: number = MODEL_CACHE_TTL_MS;

  constructor() {
    this.httpClient = axios.create({
      baseURL: `${UNIFIED_TENANT_API_URL}/api/v1/ai/bridge`,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60秒超时
    });

    console.log(`🔗 [统一租户AI客户端] 初始化，API地址: ${UNIFIED_TENANT_API_URL}`);
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
   * AI对话
   */
  async chat(request: ChatRequest, authToken?: string): Promise<ChatResponse> {
    try {
      const headers: any = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('🤖 [统一租户AI客户端] 发起AI对话请求');

      const response = await this.httpClient.post('/chat', request, { headers });

      return response.data;
    } catch (error: any) {
      console.error('❌ [统一租户AI客户端] AI对话请求失败:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'AI对话请求失败',
      };
    }
  }

  /**
   * 统一AI调用接口
   * 根据参数自动识别类型（text/image/video/audio）
   */
  async generate(request: any, authToken?: string): Promise<any> {
    try {
      const headers: any = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('🌉 [统一租户AI客户端] 发起统一AI调用:', request.model || '未指定模型');

      // 统一接口，根据参数自动识别类型
      const response = await this.httpClient.post('/', request, { headers });

      return response.data;
    } catch (error: any) {
      console.error('❌ [统一租户AI客户端] AI调用失败:', error.message);
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'AI调用失败',
      };
    }
  }

  /**
   * 图片生成（保留兼容性）
   */
  async imageGenerate(request: ImageGenerateRequest, authToken?: string): Promise<ImageGenerateResponse> {
    // 调用统一接口
    const response = await this.generate(request, authToken);

    // 转换返回格式以保持兼容性
    if (response.success && response.data) {
      return {
        success: true,
        data: {
          images: response.data.result?.images || [],
          usage: response.data.usage || {},
          responseTime: response.data.responseTime || 0
        }
      };
    }

    return {
      success: false,
      error: response.error || '图片生成请求失败'
    };
  }

  /**
   * 语音处理（语音识别/合成）
   */
  async processAudio(request: AudioProcessRequest, authToken?: string): Promise<AudioProcessResponse> {
    try {
      const headers: any = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('🎤 [统一租户AI客户端] 发起音频处理请求');

      // 如果是Buffer，需要转换为base64
      const requestData = {
        ...request,
        file: request.file instanceof Buffer ? request.file.toString('base64') : request.file,
      };

      const response = await this.httpClient.post('/audio-process', requestData, { headers });

      return response.data;
    } catch (error: any) {
      console.error('❌ [统一租户AI客户端] 音频处理请求失败:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || '音频处理请求失败',
      };
    }
  }

  /**
   * 获取可用模型列表（带缓存）
   * @param authToken 认证token
   * @param forceRefresh 是否强制刷新缓存
   */
  async getModels(authToken?: string, forceRefresh: boolean = false): Promise<AIModel[]> {
    const cacheKey = authToken || 'default';
    const cached = this.modelCache.get(cacheKey);

    // 检查缓存是否有效
    if (!forceRefresh && cached && !this.isCacheExpired(cached)) {
      console.log('📦 [统一租户AI客户端] 使用缓存的模型列表');
      return cached.models;
    }

    // 缓存过期或不存在，从统一租户系统获取
    console.log('🔄 [统一租户AI客户端] 从统一租户系统获取模型列表');

    try {
      const headers: any = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const response = await this.httpClient.get('/models', { headers });

      if (response.data?.success && response.data?.data?.models) {
        const models = response.data.data.models as AIModel[];

        // 更新缓存
        this.modelCache.set(cacheKey, {
          models,
          lastFetchTime: Date.now(),
        });

        console.log(`✅ [统一租户AI客户端] 获取到 ${models.length} 个模型，已缓存`);
        return models;
      }

      return [];
    } catch (error: any) {
      console.error('❌ [统一租户AI客户端] 获取模型列表失败:', error.message);

      // 如果有过期缓存，返回过期数据（降级策略）
      if (cached) {
        console.log('⚠️ [统一租户AI客户端] 使用过期缓存作为降级');
        return cached.models;
      }

      return [];
    }
  }

  /**
   * 获取默认模型
   */
  async getDefaultModel(authToken?: string): Promise<AIModel | null> {
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
    console.log('🚀 [统一租户AI客户端] 预加载模型列表');
    await this.getModels(authToken, true);
  }

  /**
   * 清除缓存
   */
  clearCache(authToken?: string): void {
    if (authToken) {
      this.modelCache.delete(authToken);
      console.log('🗑️ [统一租户AI客户端] 清除指定token的模型缓存');
    } else {
      this.modelCache.clear();
      console.log('🗑️ [统一租户AI客户端] 清除所有模型缓存');
    }
  }

  /**
   * 网络搜索
   */
  async search(request: any, authToken?: string): Promise<any> {
    try {
      const headers: any = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('🔍 [统一租户AI客户端] 发起网络搜索请求');

      const response = await this.httpClient.post('/', {
        model: request.model || 'search',
        query: request.query,
        searchType: request.searchType || 'web',
        maxResults: request.maxResults || 10,
        enableAISummary: request.enableAISummary !== false
      }, { headers });

      // 转换返回格式
      if (response.data?.success && response.data?.data?.result) {
        return {
          success: true,
          data: response.data.data.result
        };
      }

      return {
        success: false,
        error: response.data?.error || '网络搜索请求失败'
      };
    } catch (error: any) {
      console.error('❌ [统一租户AI客户端] 网络搜索请求失败:', error.message);
      return {
        success: false,
        error: error.response?.data?.message || error.message || '网络搜索请求失败',
      };
    }
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/health');
      return response.data?.success === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * 获取缓存状态（调试用）
   */
  getCacheStatus(): { size: number; entries: Array<{ key: string; modelsCount: number; age: number }> } {
    const entries = Array.from(this.modelCache.entries()).map(([key, cache]) => ({
      key: key.substring(0, 20) + '...',
      modelsCount: cache.models.length,
      age: Math.round((Date.now() - cache.lastFetchTime) / 1000), // 缓存年龄（秒）
    }));

    return {
      size: this.modelCache.size,
      entries,
    };
  }
}

// 导出单例实例
export const unifiedTenantAIClient = new UnifiedTenantAIClientService();
export default UnifiedTenantAIClientService;

