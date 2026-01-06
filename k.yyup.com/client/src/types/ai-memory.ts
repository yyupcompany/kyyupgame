/**
 * AI记忆类型定义
 */

/**
 * 记忆类型枚举
 */
export enum MemoryType {
  IMMEDIATE = 'immediate',
  SHORT_TERM = 'short_term',
  LONG_TERM = 'long_term'
}

/**
 * 向量嵌入数据
 */
export interface EmbeddingVector {
  vector: number[];
  dimensions: number;
  model: string;
  provider: string;
}

/**
 * 记忆接口
 */
export interface Memory {
  id: number;
  userId: number;
  conversationId: string;
  content: string;
  embedding?: EmbeddingVector;
  importance: number;
  memoryType: MemoryType;
  createdAt: string;
  expiresAt?: string;
}

/**
 * 相似记忆结果接口
 */
export interface SimilarMemoryResult extends Memory {
  similarity: number;
}

/**
 * 记忆搜索参数接口
 */
export interface MemorySearchParams {
  userId: number;
  memoryType?: MemoryType;
  minImportance?: number;
  fromDate?: Date | string;
  toDate?: Date | string;
  query?: string;
  limit?: number;
  offset?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
}

/**
 * 记忆搜索结果接口
 */
export interface MemorySearchResult {
  items: Memory[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 记忆统计信息接口
 */
export interface MemoryStats {
  totalCount: number;
  averageImportance: number;
  typeDistribution: {
    immediate: number;
    shortTerm: number;
    longTerm: number;
  };
  importanceDistribution: {
    low: number; // 0-0.3
    medium: number; // 0.3-0.7
    high: number; // 0.7-1.0
  };
  createdToday: number;
  createdThisWeek: number;
  createdThisMonth: number;
}

/**
 * 记忆设置接口
 */
export interface MemorySettings {
  importanceThreshold: number;
  archivePeriod: 'daily' | 'weekly' | 'monthly' | 'never';
  retentionPolicy: 'archive' | 'delete';
}

/**
 * 相似记忆接口
 */
export interface SimilarMemory extends Memory {
  similarity: number;
}

/**
 * 创建记忆参数
 */
export interface CreateMemoryParams {
  userId: number;
  content: string;
  conversationId?: string;
  memoryType: MemoryType;
  importance?: number;
  expiresAt?: string;
}

/**
 * 创建带向量嵌入的记忆参数
 */
export interface CreateMemoryWithEmbeddingParams extends CreateMemoryParams {
  provider?: string; // 移除硬编码提供商限制，支持数据库配置的任意提供商
}

/**
 * 查找相似记忆参数
 */
export interface FindSimilarMemoriesParams {
  query: string;
  userId: number;
  limit?: number;
  similarityThreshold?: number;
  provider?: string; // 移除硬编码提供商限制，支持数据库配置的任意提供商
}

/**
 * 搜索记忆参数
 */
export interface SearchMemoriesParams {
  userId: number;
  memoryType?: MemoryType;
  minImportance?: number;
  fromDate?: string;
  toDate?: string;
  limit?: number;
  offset?: number;
}

/**
 * API响应格式
 */
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}
