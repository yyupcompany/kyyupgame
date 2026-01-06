/**
 * AI助手优化API接口
 */

import request from '@/utils/request'
import { ApiResponse } from '@/types/api'

// 查询请求参数
interface QueryRequest {
  query: string
  conversationId: string
  userId: number
}

// 查询响应数据
interface QueryResponse {
  response: string
  level: 'direct' | 'semantic' | 'complex'
  tokensUsed: number
  tokensSaved: number
  processingTime: number
  savingRate: number
  optimizationInfo?: any
}

// 性能统计响应
interface PerformanceStats {
  performance: {
    totalQueries: number
    directQueries: number
    semanticQueries: number
    complexQueries: number
    averageResponseTime: number
    totalTokensSaved: number
  }
  router: {
    keywordCount: number
    directMatchCount: number
    complexityThreshold: number
  }
  directService: {
    supportedActions: string[]
    cacheHitRate: number
    averageResponseTime: number
  }
  semanticSearch?: {
    cache: {
      size: number
      hitRate: number
      totalQueries: number
      totalHits: number
    }
    entityStats: {
      totalEntities: number
      categoryCounts: { [category: string]: number }
    }
  }
  vectorIndex?: {
    totalItems: number
    typeDistribution: { [type: string]: number }
    averageSearchCount: number
    lastBuildTime: string
    isBuilding: boolean
  }
  complexityEvaluator?: {
    totalEvaluations: number
    levelDistribution: { [level: string]: number }
    averageScore: number
    averageConfidence: number
  }
  dynamicContext?: {
    cacheSize: number
    templateCount: number
    averageTokens: number
  }
  optimization: {
    tokenSavingRate: string
    directQueryRate: string
    semanticQueryRate?: string
    complexQueryRate?: string
  }
}

// 路由测试请求
interface RouteTestRequest {
  query: string
}

// 路由测试响应
interface RouteTestResponse {
  level: string
  confidence: number
  estimatedTokens: number
  matchedKeywords: string[]
  processingTime: number
}

// 直接响应测试请求
interface DirectTestRequest {
  action: string
  query: string
}

// 直接响应测试响应
interface DirectTestResponse {
  success: boolean
  response: string
  tokensUsed: number
  processingTime: number
}

// 健康检查响应
interface HealthCheckResponse {
  status: string
  timestamp: string
  version: string
  features: {
    directResponse: boolean
    semanticRouting: boolean
    complexAnalysis: boolean
    performanceMonitoring: boolean
  }
  stats: {
    uptime: number
    totalQueries: number
    averageResponseTime: number
  }
}

// 关键词响应
interface KeywordsResponse {
  action: string[]
  entity: string[]
  modifier: string[]
  directMatch: string[]
}

/**
 * AI助手优化API类
 */
export class AIAssistantOptimizedAPI {
  private baseURL = '/api/ai-assistant-optimized'

  /**
   * 发送优化查询
   */
  async query(data: QueryRequest): Promise<ApiResponse<QueryResponse>> {
    return request.post(`${this.baseURL}/query`, data)
  }

  /**
   * 获取性能统计
   */
  async getPerformanceStats(): Promise<ApiResponse<PerformanceStats>> {
    return request.get(`${this.baseURL}/stats`)
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return request.get(`${this.baseURL}/health`)
  }

  /**
   * 测试路由功能
   */
  async testRoute(data: RouteTestRequest): Promise<ApiResponse<RouteTestResponse>> {
    return request.post(`${this.baseURL}/test-route`, data)
  }

  /**
   * 测试直接响应功能
   */
  async testDirect(data: DirectTestRequest): Promise<ApiResponse<DirectTestResponse>> {
    return request.post(`${this.baseURL}/test-direct`, data)
  }

  /**
   * 获取关键词词典
   */
  async getKeywords(): Promise<{
    success: boolean
    data: KeywordsResponse
    message?: string
  }> {
    const response = await request.get(`${this.baseURL}/keywords`)
    return {
      success: response.success,
      data: response.data!,
      message: response.message
    }
  }

  /**
   * 保存配置（预留接口）
   */
  async saveConfig(config: any): Promise<{
    success: boolean
    message?: string
  }> {
    return request.post(`${this.baseURL}/config`, config)
  }

  /**
   * 获取配置（预留接口）
   */
  async getConfig(): Promise<{
    success: boolean
    data: any
    message?: string
  }> {
    const response = await request.get(`${this.baseURL}/config`)
    return {
      success: response.success,
      data: response.data!,
      message: response.message
    }
  }

  /**
   * 重置系统（预留接口）
   */
  async resetSystem(): Promise<{
    success: boolean
    message?: string
  }> {
    return request.post(`${this.baseURL}/reset`)
  }

  /**
   * 导出性能报告（预留接口）
   */
  async exportPerformanceReport(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<{
    success: boolean
    data?: any
    downloadUrl?: string
    message?: string
  }> {
    return request.get(`${this.baseURL}/export/performance?format=${format}`)
  }

  /**
   * 批量测试查询（预留接口）
   */
  async batchTest(queries: string[]): Promise<{
    success: boolean
    data: {
      results: Array<{
        query: string
        level: string
        tokensUsed: number
        processingTime: number
        success: boolean
        error?: string
      }>
      summary: {
        totalQueries: number
        successCount: number
        failureCount: number
        averageTokens: number
        averageTime: number
        tokenSavingRate: number
      }
    }
    message?: string
  }> {
    const response = await request.post(`${this.baseURL}/batch-test`, { queries })
    return {
      success: response.success,
      data: response.data!,
      message: response.message
    }
  }

  /**
   * 获取实时监控数据（预留接口）
   */
  async getRealtimeMetrics(): Promise<{
    success: boolean
    data: {
      currentLoad: number
      activeConnections: number
      queueLength: number
      memoryUsage: number
      cpuUsage: number
      responseTime: number
      errorRate: number
    }
    message?: string
  }> {
    const response = await request.get(`${this.baseURL}/metrics/realtime`)
    return {
      success: response.success,
      data: response.data!,
      message: response.message
    }
  }

  /**
   * 获取历史趋势数据（预留接口）
   */
  async getHistoricalTrends(timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<{
    success: boolean
    data: {
      timestamps: string[]
      metrics: {
        queryCount: number[]
        averageResponseTime: number[]
        tokenUsage: number[]
        errorRate: number[]
        directQueryRate: number[]
      }
    }
    message?: string
  }> {
    const response = await request.get(`${this.baseURL}/metrics/trends?range=${timeRange}`)
    return {
      success: response.success,
      data: response.data!,
      message: response.message
    }
  }

  /**
   * 触发系统优化（预留接口）
   */
  async triggerOptimization(type: 'cache' | 'index' | 'keywords' | 'all' = 'all'): Promise<{
    success: boolean
    data: {
      optimizationType: string
      startTime: string
      estimatedDuration: number
      status: 'started' | 'completed' | 'failed'
    }
    message?: string
  }> {
    const response = await request.post(`${this.baseURL}/optimize`, { type })
    return {
      success: response.success,
      data: response.data!,
      message: response.message
    }
  }

  /**
   * 获取优化建议（预留接口）
   */
  async getOptimizationSuggestions(): Promise<{
    success: boolean
    data: {
      suggestions: Array<{
        type: 'performance' | 'accuracy' | 'cost'
        priority: 'high' | 'medium' | 'low'
        title: string
        description: string
        impact: string
        effort: string
        action: string
      }>
    }
    message?: string
  }> {
    const response = await request.get(`${this.baseURL}/suggestions`)
    return {
      success: response.success,
      data: response.data!,
      message: response.message
    }
  }
}

// 导出API实例
export const aiAssistantOptimizedApi = new AIAssistantOptimizedAPI()

// 导出类型定义
export type {
  QueryRequest,
  QueryResponse,
  PerformanceStats,
  RouteTestRequest,
  RouteTestResponse,
  DirectTestRequest,
  DirectTestResponse,
  HealthCheckResponse,
  KeywordsResponse
}
