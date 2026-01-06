/**
 * AI记忆API
 * 提供与AI记忆系统交互的API函数
 */
import request from '../utils/request';
import { AI_ENDPOINTS } from './endpoints';
import { MemoryType } from '../types/ai-memory';

// 直接使用request实例的方法

/**
 * 创建记忆
 * @param userId 用户ID
 * @param content 记忆内容
 * @param conversationId 会话ID（可选）
 * @param memoryType 记忆类型（可选）
 * @param importance 重要性评分（可选）
 * @param expiresAt 过期时间（可选）
 * @returns 创建的记忆
 */
export const createMemory = async (
  userId: number,
  content: string,
  conversationId?: string,
  memoryType: MemoryType = MemoryType.SHORT_TERM,
  importance?: number,
  expiresAt?: Date
) => {
  try {
    const response = await request.post(AI_ENDPOINTS.MEMORY.CREATE, {
      userId,
      content,
      conversationId,
      memoryType,
      importance,
      expiresAt: expiresAt?.toISOString()
    });
    return response.data;
  } catch (error) {
    console.error('创建记忆失败:', error);
    throw error;
  }
};

/**
 * 创建带向量嵌入的记忆
 * @param userId 用户ID
 * @param content 记忆内容
 * @param conversationId 会话ID（可选）
 * @param memoryType 记忆类型（可选）
 * @param importance 重要性评分（可选）
 * @param expiresAt 过期时间（可选）
 * @param provider 向量嵌入提供商（可选）
 * @returns 创建的记忆
 */
export const createMemoryWithEmbedding = async (
  userId: number,
  content: string,
  conversationId?: string,
  memoryType: MemoryType = MemoryType.LONG_TERM,
  importance?: number,
  expiresAt?: Date,
  provider?: string // 移除硬编码，使用后端默认配置
) => {
  try {
    const response = await request.post(AI_ENDPOINTS.MEMORY.CREATE_WITH_EMBEDDING, {
      userId,
      content,
      conversationId,
      memoryType,
      importance,
      expiresAt: expiresAt?.toISOString(),
      provider
    });
    return response.data;
  } catch (error) {
    // 静默处理记忆创建API错误，不输出错误日志
    return null; // 返回null表示功能不可用，但不中断流程
  }
};

/**
 * 查找相似记忆
 * @param query 查询文本
 * @param userId 用户ID
 * @param limit 结果数量限制（可选）
 * @param similarityThreshold 相似度阈值（可选）
 * @param provider 向量嵌入提供商（可选）
 * @returns 相似记忆列表
 */
export const findSimilarMemories = async (
  query: string,
  userId: number,
  limit: number = 5,
  similarityThreshold: number = 0.7,
  provider?: string // 移除硬编码，使用后端默认配置
) => {
  try {
    // 使用GET请求传递查询参数，静默处理404错误
    const response = await request.get(AI_ENDPOINTS.MEMORY.SEARCH_SIMILAR, {
      query,
      userId,
      limit,
      similarityThreshold,
      provider
    });
    return response.data;
  } catch (error: any) {
    // 静默处理记忆搜索API错误，不输出错误日志
    if (error.response?.status === 404) {
      // API不存在，静默返回空结果
      return [];
    }
    
    // 其他错误也静默返回空数组，避免中断用户体验
    return [];
  }
};

/**
 * 搜索记忆
 * @param userId 用户ID
 * @param params 搜索参数
 * @returns 搜索结果
 */
export const searchMemories = async (userId: number, params: {
  memoryType?: string;
  minImportance?: number;
  fromDate?: Date | string;
  toDate?: Date | string;
  query?: string;
  limit?: number;
  offset?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
}) => {
  try {
    const searchParams = {
      ...params
    };
    
    const response = await request.get(AI_ENDPOINTS.MEMORY.SEARCH(userId), { params: searchParams });
    return response.data;
  } catch (error: any) {
    console.error('搜索记忆失败:', error);

    // 对于API不可用的情况，返回空结果
    if (error.response?.status === 404) {
      console.warn('记忆搜索API不可用，返回空结果');
      return [];
    }
    
    console.warn('记忆搜索遇到问题，返回空结果');
    return [];
  }
};

/**
 * 获取会话记忆
 * @param userId 用户ID
 * @param conversationId 会话ID
 * @returns 会话记忆列表
 */
export const getConversationMemories = async (userId: number, conversationId: string) => {
  try {
    const response = await request.get(AI_ENDPOINTS.MEMORY.GET_CONVERSATION(conversationId, userId));
    return response.data;
  } catch (error) {
    console.error('获取会话记忆失败:', error);
    throw error;
  }
};

/**
 * 获取记忆详情
 * @param memoryId 记忆ID
 * @param userId 用户ID
 * @returns 记忆详情
 */
export const getMemory = async (memoryId: number, userId: number) => {
  try {
    const response = await request.get(AI_ENDPOINTS.MEMORY.GET_BY_ID(memoryId), {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error('获取记忆详情失败:', error);
    throw error;
  }
};

/**
 * 更新记忆
 * @param memoryId 记忆ID
 * @param userId 用户ID
 * @param updates 更新内容
 * @returns 更新后的记忆
 */
export const updateMemory = async (memoryId: number, userId: number, updates: {
  content?: string;
  importance?: number;
  memoryType?: MemoryType;
  expiresAt?: Date | string | null;
}) => {
  try {
    const response = await request.put(AI_ENDPOINTS.MEMORY.UPDATE(memoryId), {
      ...updates,
      userId
    });
    return response.data;
  } catch (error) {
    console.error('更新记忆失败:', error);
    throw error;
  }
};

/**
 * 删除记忆
 * @param userId 用户ID
 * @param memoryId 记忆ID
 * @returns 操作结果
 */
export const deleteMemory = async (userId: number, memoryId: number) => {
  try {
    const response = await request.del(AI_ENDPOINTS.MEMORY.DELETE(memoryId, userId));
    return response.data;
  } catch (error) {
    console.error('删除记忆失败:', error);
    throw error;
  }
};

/**
 * 获取记忆统计信息
 * @param userId 用户ID
 * @returns 统计信息
 */
export const getMemoryStats = async (userId: number) => {
  try {
    const response = await request.get(AI_ENDPOINTS.MEMORY.STATS(userId));
    return response.data;
  } catch (error) {
    console.error('获取记忆统计信息失败:', error);
    throw error;
  }
};

/**
 * 归档记忆到长期记忆
 * @param memoryId 记忆ID
 * @param options 归档选项
 * @returns 归档后的记忆
 */
export const archiveToLongTerm = async (memoryId: number, options?: {
  reason?: string;
  retentionPeriod?: number;
}) => {
  try {
    const response = await request.put(AI_ENDPOINTS.MEMORY.ARCHIVE(memoryId), options);
    return response.data;
  } catch (error) {
    console.error('归档记忆失败:', error);
    throw error;
  }
};

/**
 * 清理过期记忆（管理员功能）
 * @param options 清理选项
 * @returns 清理结果
 */
export const cleanupExpiredMemories = async (options?: {
  daysOld?: number;
  memoryType?: string;
  dryRun?: boolean;
}) => {
  try {
    const response = await request.del(AI_ENDPOINTS.MEMORY.CLEANUP_EXPIRED, {
      params: options
    });
    return response.data;
  } catch (error) {
    console.error('清理过期记忆失败:', error);
    throw error;
  }
};
