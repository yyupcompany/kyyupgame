import { get, post, put, del, ApiResponse } from '@/utils/request';

/**
 * AI助手类型
 */
export enum AIAssistantType {
  ENROLLMENT = 'enrollment',
  EDUCATION = 'education',
  MANAGEMENT = 'management',
  ANALYSIS = 'analysis'
}

/**
 * AI对话消息
 */
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

/**
 * AI对话会话
 */
export interface AIConversation {
  id: string;
  title: string;
  type: AIAssistantType;
  messages: AIMessage[];
  createdAt: string;
  updatedAt: string;
}

/**
 * AI模型配置
 */
export interface AIModelConfig {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature: number;
  maxTokens: number;
  isActive: boolean;
}

/**
 * AI分析结果
 */
export interface AIAnalysisResult {
  type: 'enrollment_prediction' | 'student_performance' | 'revenue_forecast';
  data: Record<string, any>;
  insights: string[];
  recommendations: string[];
  confidence: number;
  generatedAt: string;
}

/**
 * AI功能API
 */
export const aiApi = {
  /**
   * 获取AI对话列表
   */
  getConversations(params?: {
    type?: AIAssistantType;
    page?: number;
    pageSize?: number;
  }): Promise<ApiResponse<{
    items: AIConversation[];
    total: number;
  }>> {
    return get('/ai/conversations', { params });
  },

  /**
   * 创建AI对话
   */
  createConversation(data: {
    title: string;
    type: AIAssistantType;
  }): Promise<ApiResponse<AIConversation>> {
    return post('/ai/conversations', data);
  },

  /**
   * 获取AI对话详情
   */
  getConversation(id: string): Promise<ApiResponse<AIConversation>> {
    return get(`/ai/conversations/${id}`);
  },

  /**
   * 发送AI消息
   */
  sendMessage(conversationId: string, data: {
    content: string;
    context?: Record<string, any>;
  }): Promise<ApiResponse<AIMessage>> {
    return post(`/ai/conversations/${conversationId}/messages`, data);
  },

  /**
   * 删除AI对话
   */
  deleteConversation(id: string): Promise<ApiResponse> {
    return del(`/ai/conversations/${id}`);
  },

  /**
   * 获取AI模型配置
   */
  getModelConfigs(): Promise<ApiResponse<AIModelConfig[]>> {
    return get('/ai/models');
  },

  /**
   * 创建AI模型配置
   */
  createModelConfig(data: Omit<AIModelConfig, 'id'>): Promise<ApiResponse<AIModelConfig>> {
    return post('/ai/models', data);
  },

  /**
   * 更新AI模型配置
   */
  updateModelConfig(id: string, data: Partial<AIModelConfig>): Promise<ApiResponse<AIModelConfig>> {
    return put(`/ai/models/${id}`, data);
  },

  /**
   * 删除AI模型配置
   */
  deleteModelConfig(id: string): Promise<ApiResponse> {
    return del(`/ai/models/${id}`);
  },

  /**
   * 测试AI模型连接
   */
  testModelConnection(id: string): Promise<ApiResponse<{
    success: boolean;
    message: string;
    latency?: number;
  }>> {
    return post(`/ai/models/${id}/test`);
  },

  /**
   * 获取AI分析结果
   */
  getAnalysisResults(params?: {
    type?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<AIAnalysisResult[]>> {
    return get('/ai/analysis', { params });
  },

  /**
   * 生成AI分析
   */
  generateAnalysis(data: {
    type: 'enrollment_prediction' | 'student_performance' | 'revenue_forecast';
    parameters: Record<string, any>;
  }): Promise<ApiResponse<AIAnalysisResult>> {
    return post('/ai/analysis', data);
  }
};

// 兼容性导出
export const getAIConversations = aiApi.getConversations;
export const createAIConversation = aiApi.createConversation;
export const sendAIMessage = aiApi.sendMessage;
export const getAIModelConfigs = aiApi.getModelConfigs;