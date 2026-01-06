import { request, aiRequest } from '../../utils/request'
import type { ApiResponse } from '../../utils/request'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const AI_QUERY_ENDPOINTS = {
  EXECUTE: `${API_PREFIX}/ai-query/execute`,
  HISTORY: `${API_PREFIX}/ai-query/history`,
  DETAIL: `${API_PREFIX}/ai-query`,
  RE_EXECUTE: (id: number | string) => `${API_PREFIX}/ai-query/${id}/re-execute`,
  FEEDBACK: `${API_PREFIX}/ai-query/feedback`,
  TEMPLATES: `${API_PREFIX}/ai-query/templates`,
  SUGGESTIONS: `${API_PREFIX}/ai-query/suggestions`,
  STATISTICS: `${API_PREFIX}/ai-query/statistics`,
  EXPORT: (id: number | string) => `${API_PREFIX}/ai-query/${id}/export`,
  CLEANUP_CACHE: `${API_PREFIX}/ai-query/cache/cleanup`,
  CAPABILITIES: `${API_PREFIX}/ai-query/capabilities`,
  VALIDATE_SQL: `${API_PREFIX}/ai-query/validate-sql`,
  SCHEMA: `${API_PREFIX}/ai-query/schema`
} as const

// 类型定义
export interface AIQueryRequest {
  query: string
  context?: {
    filters?: Record<string, any>
    userRole?: string
    userId?: number
    permissions?: string[]
    timestamp?: string
  }
  sessionId?: string
}

export interface AIQueryResponse {
  sessionId: string
  data: any[]
  metadata: {
    columns: Array<{
      name: string
      type: string
      label: string
    }>
    rowCount: number
    executionTime: number
    cacheHit: boolean
  }
  visualization?: {
    type: 'table' | 'bar' | 'line' | 'pie' | 'area'
    title?: string
    config?: any
  }
  queryLogId: number
}

export interface AIQueryLog {
  id: number
  naturalQuery: string
  generatedSql?: string
  finalSql?: string
  executionStatus: 'pending' | 'success' | 'failed' | 'cancelled'
  executionTime: number
  aiProcessingTime: number
  resultCount: number
  errorMessage?: string
  errorType?: string
  tokensUsed: number
  modelUsed?: string
  cacheHit: boolean
  queryComplexity: number
  createdAt: string
  updatedAt: string
}

export interface AIQueryTemplate {
  id: number
  name: string
  displayName: string
  description?: string
  category?: string
  exampleQueries?: string[]
  usageCount: number
  successRate: number
  avgExecutionTime: number
}

export interface AIQueryFeedback {
  queryLogId: number
  rating: number
  feedbackType: 'accuracy' | 'speed' | 'usefulness' | 'ui_experience'
  comments?: string
  correctedSql?: string
  suggestedImprovement?: string
}

export interface AIQuerySuggestion {
  id: number
  displayName: string
  description: string
  score: number
}

export interface AIQueryStatistics {
  overview: {
    totalQueries: number
    successfulQueries: number
    failedQueries: number
    successRate: number
  }
  trends: Array<{
    date: string
    count: number
  }>
  popularCategories: Array<{
    category: string
    count: number
  }>
  lastQueryTime?: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface QueryHistoryParams extends PaginationParams {
  queryType?: 'data_query' | 'ai_response'
  startDate?: string
  endDate?: string
}

/**
 * AI查询API模块
 */
export const aiQueryApi = {
  /**
   * 执行AI查询
   */
  async executeQuery(params: AIQueryRequest): Promise<ApiResponse<AIQueryResponse>> {
    // ✅ AI中心查询页面专用的聊天窗口接口 - 使用AI专用请求服务（120秒超时）
    return aiRequest.post('/ai-query/chat', {
      message: params.query,      // AI查询页面使用 message 参数
      context: params.context,
      sessionId: params.sessionId,
      userId: params.context?.userId
    })
  },

  /**
   * 获取查询历史 - 支持新的缓存系统
   */
  async getQueryHistory(params: QueryHistoryParams = {}): Promise<ApiResponse<{
    data: AIQueryLog[]
    total: number
    page: number
    pageSize: number
    totalPages: number
  }>> {
    return request.get(AI_QUERY_ENDPOINTS.HISTORY, params)
  },

  /**
   * 获取查询详情
   */
  async getQueryDetail(id: number): Promise<ApiResponse<AIQueryLog>> {
    return request.get(`${AI_QUERY_ENDPOINTS.DETAIL}/${id}`)
  },

  /**
   * 重新执行查询
   */
  async reExecuteQuery(id: number): Promise<ApiResponse<AIQueryResponse>> {
    return request.post(AI_QUERY_ENDPOINTS.RE_EXECUTE(id))
  },

  /**
   * 提交查询反馈
   */
  async submitFeedback(feedback: AIQueryFeedback): Promise<ApiResponse<any>> {
    return request.post(AI_QUERY_ENDPOINTS.FEEDBACK, feedback)
  },

  /**
   * 获取查询模板
   */
  async getTemplates(params: { category?: string } = {}): Promise<ApiResponse<AIQueryTemplate[]>> {
    return request.get(AI_QUERY_ENDPOINTS.TEMPLATES, params)
  },

  /**
   * 获取查询建议
   */
  async getSuggestions(params: { query: string }): Promise<ApiResponse<AIQuerySuggestion[]>> {
    return request.get(AI_QUERY_ENDPOINTS.SUGGESTIONS, params)
  },

  /**
   * 获取查询统计
   */
  async getStatistics(): Promise<ApiResponse<AIQueryStatistics>> {
    return request.get(AI_QUERY_ENDPOINTS.STATISTICS)
  },

  /**
   * 导出查询结果
   */
  async exportResult(id: number, format: 'excel' | 'csv' | 'pdf'): Promise<ApiResponse<{
    downloadUrl: string
    data?: any[]
  }>> {
    return request.get(AI_QUERY_ENDPOINTS.EXPORT(id), { format })
  },

  /**
   * 清理缓存（管理员功能）
   */
  async cleanupCache(): Promise<ApiResponse<{ deletedCount: number }>> {
    return request.post(AI_QUERY_ENDPOINTS.CLEANUP_CACHE)
  },

  /**
   * 获取AI查询能力信息
   */
  async getCapabilities(): Promise<ApiResponse<{
    supportedQueries: string[]
    availableModels: string[]
    maxComplexity: number
    features: string[]
  }>> {
    return request.get(AI_QUERY_ENDPOINTS.CAPABILITIES)
  },

  /**
   * 验证SQL语法
   */
  async validateSQL(sql: string): Promise<ApiResponse<{
    isValid: boolean
    errors: string[]
    warnings: string[]
    suggestions: string[]
  }>> {
    return request.post(AI_QUERY_ENDPOINTS.VALIDATE_SQL, { sql })
  },

  /**
   * 获取数据库schema信息
   */
  async getDatabaseSchema(): Promise<ApiResponse<{
    tables: Array<{
      name: string
      chineseName: string
      columns: Array<{
        name: string
        chineseName: string
        type: string
        description: string
      }>
    }>
  }>> {
    return request.get(AI_QUERY_ENDPOINTS.SCHEMA)
  }
}

export default aiQueryApi