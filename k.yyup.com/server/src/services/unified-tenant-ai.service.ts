/**
 * 统一租户中心AI服务
 * 负责与统一租户中心的AI模型和用量服务对接
 */

import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { logger } from '../utils/logger';

// 统一租户中心API配置
const UNIFIED_TENANT_CONFIG = {
  baseURL: process.env.UNIFIED_TENANT_API_URL || process.env.UNIFIED_TENANT_AI_URL || 'http://localhost:4001',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'X-Tenant-ID': process.env.TENANT_ID || process.env.TENANT_CODE || 'k001',
    'X-Service-Name': 'kindergarten-system'
  }
};

/**
 * AI模型配置接口
 */
export interface AIModelConfig {
  id: string;
  modelName: string;
  provider: string;
  modelType: 'text' | 'image' | 'speech' | 'embedding' | 'reasoning' | 'search';
  maxTokens?: number;
  temperature?: number;
  isActive: boolean;
  capabilities: string[];
  pricing?: {
    inputTokenPrice: number;
    outputTokenPrice: number;
    currency: string;
  };
}

/**
 * AI使用统计接口
 */
export interface AIUsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  modelUsage: Array<{
    modelId: string;
    modelName: string;
    requests: number;
    tokens: number;
    cost: number;
  }>;
  period: {
    start: string;
    end: string;
  };
}

/**
 * AI请求参数接口
 */
export interface AIRequestParams {
  modelId: string;
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

/**
 * AI响应接口
 */
export interface AIResponse {
  success: boolean;
  data: {
    content?: string;
    choices?: Array<{
      message: { content: string };
      finish_reason: string;
    }>;
    usage?: {
      prompt_tokens: number;
      completion_tokens: number;
      total_tokens: number;
    };
    model: string;
  };
  usage?: {
    requestId: string;
    timestamp: string;
    modelId: string;
    tokensUsed: number;
    cost: number;
  };
  message?: string;
  error?: string;
}

/**
 * 统一租户中心AI服务类
 */
export class UnifiedTenantAIService {
  private httpClient: AxiosInstance;
  private isHealthy: boolean = true;
  private lastHealthCheck: number = 0;
  private readonly HEALTH_CHECK_INTERVAL = 30000; // 30秒

  constructor() {
    this.httpClient = axios.create(UNIFIED_TENANT_CONFIG);

    // 请求拦截器
    this.httpClient.interceptors.request.use(
      (config) => {
        logger.info('统一租户中心AI请求', {
          method: config.method?.toUpperCase(),
          url: config.url,
          headers: config.headers
        });
        return config;
      },
      (error) => {
        logger.error('统一租户中心AI请求错误', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.httpClient.interceptors.response.use(
      (response: AxiosResponse) => {
        logger.info('统一租户中心AI响应', {
          status: response.status,
          url: response.config.url,
          dataSize: JSON.stringify(response.data).length
        });
        return response;
      },
      (error) => {
        logger.error('统一租户中心AI响应错误', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * 检查服务健康状态并处理降级
   */
  private async ensureHealthy(): Promise<boolean> {
    const now = Date.now();

    // 如果距离上次检查不足间隔时间，返回当前状态
    if (now - this.lastHealthCheck < this.HEALTH_CHECK_INTERVAL && this.isHealthy) {
      return true;
    }

    try {
      const isHealthy = await this.healthCheck();
      this.isHealthy = isHealthy;
      this.lastHealthCheck = now;

      if (!isHealthy) {
        logger.warn('⚠️  统一租户中心服务不可用，启用降级模式');
      } else if (!this.isHealthy) {
        logger.info('✅ 统一租户中心服务已恢复');
      }

      return isHealthy;
    } catch (error) {
      logger.error('❌ 健康检查失败', error);
      this.isHealthy = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  /**
   * 包装API调用，添加错误处理和降级逻辑
   */
  private async apiCallWithFallback<T>(
    apiCall: () => Promise<T>,
    fallbackData: T,
    operation: string
  ): Promise<T> {
    try {
      // 检查服务健康状态
      const isHealthy = await this.ensureHealthy();

      if (!isHealthy) {
        logger.warn(`⚠️  统一租户中心不可用，${operation}使用降级数据`);
        return fallbackData;
      }

      // 尝试调用API
      const result = await apiCall();

      if (!result) {
        logger.warn(`⚠️  统一租户中心返回空数据，${operation}使用降级数据`);
        return fallbackData;
      }

      return result;
    } catch (error: any) {
      logger.error(`❌ ${operation}API调用失败，使用降级数据`, {
        error: error.message,
        code: error.code,
        status: error.response?.status
      });

      // 标记服务不健康
      this.isHealthy = false;
      this.lastHealthCheck = Date.now();

      return fallbackData;
    }
  }

  /**
   * 获取可用AI模型列表
   */
  async getAvailableModels(activeOnly: boolean = true): Promise<AIModelConfig[]> {
    try {
      const response = await this.httpClient.get('/api/v1/ai/models', {
        params: { activeOnly }
      });

      if (response.data.success) {
        return response.data.data.models;
      } else {
        throw new Error(response.data.message || '获取AI模型列表失败');
      }
    } catch (error: any) {
      logger.error('获取AI模型列表失败', error);
      throw new Error(`获取AI模型列表失败: ${error.message}`);
    }
  }

  /**
   * 获取指定模型详情
   */
  async getModelById(modelId: string): Promise<AIModelConfig | null> {
    try {
      const response = await this.httpClient.get(`/api/v1/ai/models/${modelId}`);

      if (response.data.success) {
        return response.data.data;
      } else {
        logger.warn(`获取模型详情失败: ${response.data.message}`);
        return null;
      }
    } catch (error: any) {
      logger.error(`获取模型${modelId}详情失败`, error);
      return null;
    }
  }

  /**
   * 调用AI模型进行文本生成
   */
  async generateText(params: AIRequestParams): Promise<AIResponse> {
    try {
      const response = await this.httpClient.post('/api/v1/ai/chat/completions', params);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          usage: response.data.usage
        };
      } else {
        throw new Error(response.data.message || 'AI文本生成失败');
      }
    } catch (error: any) {
      logger.error('AI文本生成失败', error);
      return {
        success: false,
        data: {} as any,
        error: error.response?.data?.message || error.message || 'AI服务暂时不可用'
      };
    }
  }

  /**
   * 调用AI模型进行图像生成
   */
  async generateImage(params: {
    prompt: string;
    modelId?: string;
    size?: string;
    quality?: string;
  }): Promise<AIResponse> {
    try {
      const response = await this.httpClient.post('/api/v1/ai/image/generate', params);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          usage: response.data.usage
        };
      } else {
        throw new Error(response.data.message || 'AI图像生成失败');
      }
    } catch (error: any) {
      logger.error('AI图像生成失败', error);
      return {
        success: false,
        data: {} as any,
        error: error.response?.data?.message || error.message || 'AI图像生成服务暂时不可用'
      };
    }
  }

  /**
   * 调用AI模型进行语音合成
   */
  async synthesizeSpeech(params: {
    text: string;
    modelId?: string;
    voice?: string;
    speed?: number;
  }): Promise<AIResponse> {
    try {
      const response = await this.httpClient.post('/api/v1/ai/speech/synthesize', params);

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          usage: response.data.usage
        };
      } else {
        throw new Error(response.data.message || 'AI语音合成失败');
      }
    } catch (error: any) {
      logger.error('AI语音合成失败', error);
      return {
        success: false,
        data: {} as any,
        error: error.response?.data?.message || error.message || 'AI语音合成服务暂时不可用'
      };
    }
  }

  /**
   * 获取AI使用统计
   */
  async getUsageStats(period?: {
    start?: string;
    end?: string;
  }): Promise<AIUsageStats | null> {
    const fallbackData: AIUsageStats = {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      modelUsage: [],
      period: {
        start: period?.start || '',
        end: period?.end || ''
      }
    };

    return this.apiCallWithFallback(
      async () => {
        const response = await this.httpClient.get('/api/v1/ai/analytics/overview', {
          params: period
        });

        if (response.data.code === 200) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || '获取使用统计失败');
        }
      },
      fallbackData,
      '获取用量统计'
    );
  }

  /**
   * 获取租户内用户用量列表
   */
  async getTenantUserUsageList(params?: {
    startDate?: string;
    endDate?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{
    items: Array<{
      userId: number;
      username: string;
      realName: string;
      email: string;
      totalCalls: number;
      totalCost: number;
      totalTokens: number;
    }>;
    total: number;
    page: number;
    pageSize: number;
  } | null> {
    const fallbackData = {
      items: [],
      total: 0,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20
    };

    return this.apiCallWithFallback(
      async () => {
        const response = await this.httpClient.get('/api/v1/ai/analytics/users/list', {
          params: {
            startDate: params?.startDate,
            endDate: params?.endDate,
            page: params?.page || 1,
            pageSize: params?.pageSize || 20
          }
        });

        if (response.data.code === 200) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || '获取用户用量列表失败');
        }
      },
      fallbackData,
      '获取用户用量列表'
    );
  }

  /**
   * 获取用户详细用量信息
   */
  async getUserUsageDetail(userId: number, params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<{
    usageByType: Array<{
      type: string;
      count: number;
      cost: number;
      tokens: number;
    }>;
    usageByModel: Array<{
      modelId: string;
      modelName: string;
      provider: string;
      count: number;
      cost: number;
    }>;
    recentUsage: Array<{
      id: number;
      modelName: string;
      usageType: string;
      totalTokens: number;
      cost: number;
      createdAt: string;
    }>;
  } | null> {
    const fallbackData = {
      usageByType: [],
      usageByModel: [],
      recentUsage: []
    };

    return this.apiCallWithFallback(
      async () => {
        const response = await this.httpClient.get(`/api/v1/ai/analytics/user/${userId}`, {
          params: {
            startDate: params?.startDate,
            endDate: params?.endDate
          }
        });

        if (response.data.code === 200) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || '获取用户详细用量失败');
        }
      },
      fallbackData,
      '获取用户详细用量'
    );
  }

  /**
   * 获取当前用户用量信息
   */
  async getCurrentUserUsage(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const fallbackData = {
      usageByType: [],
      usageByModel: [],
      recentUsage: []
    };

    return this.apiCallWithFallback(
      async () => {
        const response = await this.httpClient.get('/api/v1/ai/analytics/user/current', {
          params: {
            startDate: params?.startDate,
            endDate: params?.endDate
          }
        });

        if (response.data.code === 200) {
          return response.data.data;
        } else {
          throw new Error(response.data.message || '获取当前用户用量失败');
        }
      },
      fallbackData,
      '获取当前用户用量'
    );
  }

  /**
   * 检查AI服务健康状态
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.httpClient.get('/api/v1/ai/health');
      return response.data.success && response.data.data.status === 'healthy';
    } catch (error) {
      logger.error('AI服务健康检查失败', error);
      return false;
    }
  }

  /**
   * 批量获取模型信息
   */
  async batchGetModels(modelIds: string[]): Promise<AIModelConfig[]> {
    try {
      const response = await this.httpClient.post('/api/v1/ai/models/batch', {
        modelIds
      });

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || '批量获取模型信息失败');
      }
    } catch (error: any) {
      logger.error('批量获取模型信息失败', error);
      throw new Error(`批量获取模型信息失败: ${error.message}`);
    }
  }

  /**
   * 获取模型使用限制
   */
  async getModelLimits(modelId: string): Promise<{
    maxRequestsPerMinute: number;
    maxTokensPerDay: number;
    currentUsage: {
      requests: number;
      tokens: number;
    };
  } | null> {
    try {
      const response = await this.httpClient.get(`/api/v1/ai/models/${modelId}/limits`);

      if (response.data.success) {
        return response.data.data;
      } else {
        logger.warn(`获取模型限制失败: ${response.data.message}`);
        return null;
      }
    } catch (error: any) {
      logger.error(`获取模型${modelId}限制失败`, error);
      return null;
    }
  }
}

// 创建单例实例
export const unifiedTenantAIService = new UnifiedTenantAIService();

export default unifiedTenantAIService;