import axios from 'axios';
import request from '../utils/request';
import { AI_ENDPOINTS, AI_MEMORY_ENDPOINTS } from './endpoints';

// 解构request实例中的方法
const { get, post, put, del } = request;

// API基础URL - 现在使用endpoints配置
// const API_URL = '/api/ai'; // 删除硬编码路径

/**
 * AI模型信息
 */
interface AIModel {
  id: number;
  name: string;
  provider: string;
  contextWindow: number;
  maxTokens: number;
  capabilities: string[];
  description: string;
  isAvailable: boolean;
}

/**
 * AI会话信息
 */
interface AIConversation {
  id: number;
  title: string;
  userId: number;
  modelId: number;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string;
}

/**
 * AI消息元数据
 */
interface AIMessageMetadata {
  tokens?: number;
  model?: string;
  temperature?: number;
  responseTime?: number;
  attachments?: string[];
  references?: string[];
}

/**
 * AI消息信息
 */
interface AIMessage {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant';
  content: string;
  metadata?: AIMessageMetadata;
  createdAt: string;
}

/**
 * 创建会话请求
 */
interface CreateConversationRequest {
  title?: string;
  modelId?: number;
}

/**
 * 发送消息请求
 */
interface SendMessageRequest {
  content: string;
  metadata?: AIMessageMetadata;
}

/**
 * AI模型参数
 */
interface AIModelParameters {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
  contextWindow?: number;
}

/**
 * 创建模型请求
 */
interface CreateModelRequest {
  name: string;
  displayName: string;
  provider: string;
  modelType: string;
  apiVersion?: string;
  endpointUrl: string;
  apiKey: string;
  modelParameters?: AIModelParameters;
  isActive?: boolean;
  isDefault?: boolean;
}

/**
 * 更新模型请求
 */
interface UpdateModelRequest {
  name?: string;
  displayName?: string;
  provider?: string;
  modelType?: string;
  apiVersion?: string;
  endpointUrl?: string;
  apiKey?: string;
  modelParameters?: any;
  isActive?: boolean;
  isDefault?: boolean;
}

/**
 * AI服务API
 * 处理与AI模型相关的API调用
 */
export const aiApi = {
  /**
   * 获取可用的AI模型列表
   */
  async getModels() {
    try {
      const response = await get(AI_ENDPOINTS.MODELS);
      return response.data;
    } catch (error) {
      console.error('获取AI模型列表失败:', error);
      throw error;
    }
  },

  /**
   * 获取AI模型配置列表 (兼容性方法)
   */
  async getModelConfigs() {
    try {
      const response = await get(AI_ENDPOINTS.MODELS);
      return response;
    } catch (error) {
      console.error('获取AI模型配置失败:', error);
      throw error;
    }
  },

  /**
   * 获取特定AI模型的详情
   * @param modelId 模型ID
   */
  async getModelDetails(modelId: number) {
    try {
      const response = await get(AI_ENDPOINTS.MODEL_BY_ID(modelId));
      return response.data;
    } catch (error) {
      console.error('获取模型详情失败:', error);
      throw error;
    }
  },

  /**
   * 获取模型计费信息
   * @param modelId 模型ID
   */
  async getModelBilling(modelId: number) {
    try {
      const response = await get(AI_ENDPOINTS.MODEL_BILLING(modelId));
      return response.data;
    } catch (error) {
      console.error('获取模型计费信息失败:', error);
      throw error;
    }
  },

  /**
   * 获取当前默认的AI模型
   */
  async getDefaultModel() {
    try {
      const response = await get(AI_ENDPOINTS.MODEL_DEFAULT);
      return response.data;
    } catch (error) {
      console.error('获取默认模型失败:', error);
      throw error;
    }
  },

  /**
   * 设置用户默认的AI模型
   * @param modelId 模型ID
   */
  async setDefaultModel(modelId: number) {
    try {
      const response = await post(AI_ENDPOINTS.MODEL_DEFAULT, { modelId });
      return response.data;
    } catch (error) {
      console.error('设置默认模型失败:', error);
      throw error;
    }
  },
  
  /**
   * 获取用户AI使用配额信息
   */
  async getUserQuota() {
    try {
      const response = await get(AI_ENDPOINTS.USER_QUOTA);
      return response.data;
    } catch (error) {
      console.error('获取用户配额信息失败:', error);
      throw error;
    }
  },
  
  /**
   * 检查模型是否支持特定功能
   * @param modelId 模型ID
   * @param capability 能力/功能名称
   */
  async checkModelCapability(modelId: number, capability: string) {
    try {
      const response = await get(AI_ENDPOINTS.MODEL_CAPABILITIES(modelId, capability));
      return response.data.supported;
    } catch (error) {
      console.error(`检查模型能力失败: ${capability}`, error);
      return false;
    }
  },

  // =============================================
  // 模型管理API (CRUD操作)
  // =============================================

  /**
   * 创建新的AI模型配置
   * @param data 模型配置数据
   */
  async createModel(data: CreateModelRequest) {
    try {
      const response = await post(AI_ENDPOINTS.MODELS, data);
      return response.data;
    } catch (error) {
      console.error('创建模型失败:', error);
      throw error;
    }
  },

  /**
   * 更新AI模型配置
   * @param modelId 模型ID
   * @param data 更新数据
   */
  async updateModel(modelId: number, data: UpdateModelRequest) {
    try {
      const response = await put(AI_ENDPOINTS.MODEL_BY_ID(modelId), data);
      return response.data;
    } catch (error) {
      console.error('更新模型失败:', error);
      throw error;
    }
  },

  /**
   * 删除AI模型配置
   * @param modelId 模型ID
   */
  async deleteModel(modelId: number) {
    try {
      await del(AI_ENDPOINTS.MODEL_BY_ID(modelId));
    } catch (error) {
      console.error('删除模型失败:', error);
      throw error;
    }
  },

  /**
   * 切换模型状态
   * @param modelId 模型ID
   * @param isActive 是否激活
   */
  async toggleModelStatus(modelId: number, isActive: boolean) {
    try {
      const response = await put(AI_ENDPOINTS.MODEL_BY_ID(modelId), { isActive });
      return response.data;
    } catch (error) {
      console.error('切换模型状态失败:', error);
      throw error;
    }
  },

  // =============================================
  // 会话管理API
  // =============================================

  /**
   * 获取用户的会话列表
   */
  async getConversations(): Promise<AIConversation[]> {
    try {
      const response = await get(AI_ENDPOINTS.CONVERSATIONS);
      return response.data;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      throw error;
    }
  },

  /**
   * 创建新会话
   * @param data 会话创建数据
   */
  async createConversation(data: CreateConversationRequest) {
    try {
      const response = await post(AI_ENDPOINTS.CONVERSATIONS, data);
      return response;
    } catch (error) {
      console.error('创建会话失败:', error);
      throw error;
    }
  },

  /**
   * 获取单个会话详情
   * @param conversationId 会话ID
   */
  async getConversation(conversationId: string) {
    try {
      const response = await get(AI_ENDPOINTS.CONVERSATION_BY_ID(conversationId));
      return response;
    } catch (error) {
      console.error('获取会话详情失败:', error);
      throw error;
    }
  },

  /**
   * 获取会话的消息列表
   * @param conversationId 会话ID
   */
  async getConversationMessages(conversationId: number): Promise<AIMessage[]> {
    try {
      const response = await get(AI_ENDPOINTS.CONVERSATION_MESSAGES(conversationId));
      return response.data;
    } catch (error) {
      console.error('获取会话消息失败:', error);
      throw error;
    }
  },

  /**
   * 发送消息到会话
   * @param conversationId 会话ID
   * @param data 消息数据
   */
  async sendMessage(conversationId: number, data: SendMessageRequest): Promise<AIMessage> {
    try {
      const response = await post(AI_ENDPOINTS.SEND_MESSAGE(conversationId), data);
      return response.data;
    } catch (error) {
      console.error('发送消息失败:', error);
      throw error;
    }
  },

  /**
   * 发送流式消息到会话
   * @param conversationId 会话ID
   * @param data 消息数据
   * @param onChunk 流式数据回调
   */
  async sendMessageStream(
    conversationId: string | number,
    data: SendMessageRequest,
    onChunk?: (chunk: any) => void
  ): Promise<void> {
    try {
      const url = `${import.meta.env.VITE_API_BASE_URL}${AI_ENDPOINTS.SEND_MESSAGE(conversationId)}`;
      const requestBody = {
        ...data,
        stream: true
      };

      console.log('\x1b[32m[前端] 发送流式消息请求:\x1b[0m', {
        url,
        conversationId,
        requestBody,
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
        AI_ENDPOINTS_SEND_MESSAGE: AI_ENDPOINTS.SEND_MESSAGE(conversationId)
      });

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kindergarten_token') || 'MOCK_JWT_TOKEN'}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法获取响应流');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();

              if (data === '[DONE]') {
                return;
              }

              try {
                const parsed = JSON.parse(data);
                if (onChunk) {
                  onChunk(parsed);
                }
              } catch (e) {
                console.warn('解析流式数据失败:', e);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    } catch (error) {
      console.error('发送流式消息失败:', error);
      throw error;
    }
  },

  /**
   * 删除会话
   * @param conversationId 会话ID
   */
  async deleteConversation(conversationId: number): Promise<void> {
    try {
      await del(AI_ENDPOINTS.CONVERSATION_BY_ID(conversationId));
    } catch (error) {
      console.error('删除会话失败:', error);
      throw error;
    }
  },

  /**
   * 更新会话标题
   * @param conversationId 会话ID
   * @param title 新标题
   */
  async updateConversationTitle(conversationId: number, title: string): Promise<void> {
    try {
      await put(AI_ENDPOINTS.CONVERSATION_BY_ID(conversationId), { title });
    } catch (error) {
      console.error('更新会话标题失败:', error);
      throw error;
    }
  },

  // =============================================
  // AI模块初始化和额外功能
  // =============================================

  /**
   * 初始化AI模块
   * @returns 初始化结果
   */
  async initialize() {
    try {
      const response = await get(AI_ENDPOINTS.INITIALIZE);
      return response;
    } catch (error) {
      console.error('初始化AI模块失败:', error);
      throw error;
    }
  },

  /**
   * 搜索记忆
   * @param params 搜索参数
   * @returns 搜索结果
   */
  async searchMemories(params: {
    userId: number;
    query: string;
    limit?: number;
  }) {
    try {
      const response = await post(AI_MEMORY_ENDPOINTS.SEARCH(params.userId), params);
      return response;
    } catch (error) {
      console.error('搜索记忆失败:', error);
      throw error;
    }
  },

  /**
   * 删除记忆
   * @param userId 用户ID
   * @param memoryId 记忆ID
   * @returns 删除结果
   */
  async deleteMemory(userId: number, memoryId: string) {
    try {
      const response = await del(AI_MEMORY_ENDPOINTS.DELETE_BY_ID(memoryId), {
        params: { userId }
      });
      return response;
    } catch (error) {
      console.error('删除记忆失败:', error);
      throw error;
    }
  },

  /**
   * 启动咨询会话
   * @param params 咨询参数
   * @returns 咨询会话信息
   */
  async startConsultation(params: {
    userId: number;
    consultationType: string;
  }) {
    try {
      const response = await post(AI_ENDPOINTS.CONSULTATION_START, params);
      return response;
    } catch (error) {
      console.error('启动咨询失败:', error);
      throw error;
    }
  }
};

// 导出类型定义
export type { 
  AIModel, 
  AIConversation, 
  AIMessage, 
  CreateConversationRequest, 
  SendMessageRequest,
  CreateModelRequest,
  UpdateModelRequest
};

/**
 * 创建记忆
 * @param params 记忆参数
 * @returns 创建结果
 */
export const createMemory = async (params: {
  userId: number;
  conversationId: string;
  content: string;
  memoryType?: string;
  importance?: number;
}) => {
  try {
    const response = await axios.post(AI_MEMORY_ENDPOINTS.CREATE, params);
    return response.data;
  } catch (error) {
    console.error('创建记忆失败:', error);
    throw error;
  }
};

/**
 * 获取会话记忆
 * @param userId 用户ID
 * @param conversationId 会话ID
 * @param limit 返回数量限制
 * @returns 记忆列表
 */
export const getConversationMemories = async (
  userId: number,
  conversationId: string,
  limit = 20
) => {
  try {
    const response = await axios.get(
      AI_MEMORY_ENDPOINTS.GET_CONVERSATION(conversationId, userId),
      { params: { limit } }
    );
    return response.data;
  } catch (error) {
    console.error('获取会话记忆失败:', error);
    throw error;
  }
};

/**
 * 删除记忆
 * @param userId 用户ID
 * @param memoryId 记忆ID
 * @returns 删除结果
 */
export const deleteMemory = async (userId: number, memoryId: number) => {
  try {
    const response = await axios.delete(
      AI_MEMORY_ENDPOINTS.DELETE(memoryId, userId)
    );
    return response.data;
  } catch (error) {
    console.error('删除记忆失败:', error);
    throw error;
  }
};

/**
 * 总结会话并创建长期记忆
 * @param userId 用户ID
 * @param conversationId 会话ID
 * @returns 总结结果
 */
export const summarizeConversation = async (
  userId: number,
  conversationId: string
) => {
  try {
    const response = await axios.post(
      AI_MEMORY_ENDPOINTS.SUMMARIZE(conversationId, userId)
    );
    return response.data;
  } catch (error) {
    console.error('总结会话失败:', error);
    throw error;
  }
};

/**
 * 创建带向量嵌入的记忆
 * @param params 记忆参数
 * @returns 创建结果
 */
export const createMemoryWithEmbedding = async (params: {
  userId: number;
  conversationId: string;
  content: string;
  memoryType?: string;
  importance?: number;
}) => {
  try {
    const response = await axios.post(AI_MEMORY_ENDPOINTS.CREATE_WITH_EMBEDDING, params);
    return response.data;
  } catch (error) {
    console.error('创建带嵌入的记忆失败:', error);
    throw error;
  }
};

/**
 * 查找语义相似的记忆
 * @param params 查询参数
 * @returns 相似记忆列表
 */
export const searchSimilarMemories = async (params: {
  userId: number;
  query: string;
  limit?: number;
  threshold?: number;
}) => {
  try {
    const response = await axios.post(AI_MEMORY_ENDPOINTS.SEARCH_SIMILAR, params);
    return response.data;
  } catch (error) {
    console.error('查找相似记忆失败:', error);
    throw error;
  }
};

/**
 * 按时间范围搜索记忆
 * @param params 查询参数
 * @returns 时间范围内的相似记忆列表
 */
export const searchMemoriesByTimeRange = async (params: {
  userId: number;
  query: string;
  startDate: string;
  endDate: string;
  limit?: number;
  threshold?: number;
}) => {
  try {
    const response = await post(`/ai/memory/memory/search/time-range/${params.userId}`, {
      query: params.query,
      startDate: params.startDate,
      endDate: params.endDate,
      limit: params.limit || 10,
      threshold: params.threshold || 0.6
    });
    return response.data;
  } catch (error) {
    console.error('按时间范围搜索记忆失败:', error);
    throw error;
  }
};

/**
 * 搜索上个月的记忆
 * @param params 查询参数
 * @returns 上个月的相关记忆列表
 */
export const searchLastMonthMemories = async (params: {
  userId: number;
  query: string;
  limit?: number;
}) => {
  try {
    const response = await post(`/ai/memory/memory/search/last-month/${params.userId}`, {
      query: params.query,
      limit: params.limit || 15
    });
    return response.data;
  } catch (error) {
    console.error('搜索上个月记忆失败:', error);
    throw error;
  }
};