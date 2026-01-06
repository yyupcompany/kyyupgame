/**
 * AI用量中心API
 *
 * 功能：
 * - 获取AI模型Token用量统计
 * - 获取成本分析数据
 * - 支持跨项目数据访问（k001.yyup.cc -> adminyyup）
 *
 * @author Claude Code
 * @date 2026-01-05
 */

import request from '@/utils/request'

// ==================== 类型定义 ====================

/**
 * 统计概览
 */
export interface UsageOverview {
  totalRequests: number
  totalTokens: number
  totalCost: number
  textTokens: number
  imageTokens: number
  videoTokens: number
  trendData?: {
    text: number[]
    image: number[]
    video: number[]
  }
}

/**
 * AI模型统计
 */
export interface AIModelStats {
  id: number
  name: string
  description: string
  icon: string
  color: string
  status: 'active' | 'busy' | 'inactive'
  statusText: string
  calls: number
  tokens: number
  avgResponse: number
  cost: number
}

/**
 * 排行榜项目
 */
export interface RankingItem {
  id: number
  name: string
  description: string
  avatar?: string
  tokens: number
  percentage: number
  trend: number
}

/**
 * 成本分布
 */
export interface CostDistribution {
  textCost: number
  imageCost: number
  videoCost: number
  totalCost: number
}

// ==================== API方法 ====================

/**
 * 获取用量统计概览
 */
export function getUsageOverview(params?: {
  timeRange?: 'today' | 'week' | 'month' | 'all'
  serviceType?: 'text' | 'image' | 'video' | 'all'
}) {
  return request.get<{
    success: boolean
    data: UsageOverview
    message: string
  }>('/api/usage-center/overview', { params })
}

/**
 * 获取AI模型使用明细
 */
export function getAIModelStats(params?: {
  timeRange?: 'today' | 'week' | 'month' | 'all'
  status?: 'all' | 'active' | 'inactive'
}) {
  return request.get<{
    success: boolean
    data: {
      models: AIModelStats[]
      totalCalls: number
      totalTokens: number
      totalCost: number
    }
    message: string
  }>('/api/usage-center/models', { params })
}

/**
 * 获取Token消耗趋势
 */
export function getTokenTrends(params?: {
  timeRange?: 'today' | 'week' | 'month' | 'all'
  type?: 'text' | 'image' | 'video'
}) {
  return request.get<{
    success: boolean
    data: {
      trends: {
        text: number[]
        image: number[]
        video: number[]
        labels: string[]
      }
      summary: {
        text: { total: number; cost: number; trend: number }
        image: { total: number; cost: number; trend: number }
        video: { total: number; cost: number; trend: number }
      }
    }
    message: string
  }>('/api/usage-center/trends', { params })
}

/**
 * 获取用户排行
 */
export function getUserRanking(params?: {
  type?: 'users' | 'features'
  timeRange?: 'today' | 'week' | 'month' | 'all'
  limit?: number
}) {
  return request.get<{
    success: boolean
    data: {
      items: RankingItem[]
      total: number
    }
    message: string
  }>('/api/usage-center/ranking', { params })
}

/**
 * 获取成本分布
 */
export function getCostDistribution(params?: {
  timeRange?: 'today' | 'week' | 'month' | 'all'
}) {
  return request.get<{
    success: boolean
    data: CostDistribution
    message: string
  }>('/api/usage-center/cost-distribution', { params })
}

/**
 * 刷新用量数据
 */
export function refreshUsageData() {
  return request.post<{
    success: boolean
    message: string
  }>('/api/usage-center/refresh')
}

/**
 * 导出用量报告
 */
export function exportUsageReport(params?: {
  format?: 'xlsx' | 'csv' | 'pdf'
  timeRange?: 'today' | 'week' | 'month' | 'all'
}) {
  return request.post<{
    success: boolean
    data: {
      downloadUrl: string
      filename: string
    }
    message: string
  }>('/api/usage-center/export', { data: params })
}

/**
 * 获取用户详细用量
 */
export function getUserUsageDetail(userId: number, params?: {
  timeRange?: 'today' | 'week' | 'month' | 'all'
}) {
  return request.get<{
    success: boolean
    data: {
      user: {
        id: number
        name: string
        email?: string
        role: string
      }
      stats: {
        totalTokens: number
        totalCost: number
        usageByType: Array<{
          type: string
          tokens: number
          cost: number
          percentage: number
        }>
        usageByModel: AIModelStats[]
      }
      history: Array<{
        date: string
        tokens: number
        cost: number
      }>
    }
    message: string
  }>(`/api/usage-center/user/${userId}`, { params })
}

/**
 * 获取当前用户用量
 */
export function getMyUsage(params?: {
  timeRange?: 'today' | 'week' | 'month' | 'all'
}) {
  return request.get<{
    success: boolean
    data: {
      totalTokens: number
      totalCost: number
      usageByType: Array<{
        type: string
        tokens: number
        cost: number
        quota: number
        usagePercentage: number
      }>
      quotaRemaining: number
    }
    message: string
  }>('/api/usage-center/my-usage', { params })
}

// ==================== 便捷函数 ====================

/**
 * 获取今日用量概览
 */
export function getTodayOverview() {
  return getUsageOverview({ timeRange: 'today' })
}

/**
 * 获取本周用量概览
 */
export function getWeekOverview() {
  return getUsageOverview({ timeRange: 'week' })
}

/**
 * 获取本月用量概览
 */
export function getMonthOverview() {
  return getUsageOverview({ timeRange: 'month' })
}

/**
 * 获取文本生成用量
 */
export function getTextUsage(params?: { timeRange?: 'today' | 'week' | 'month' | 'all' }) {
  return getUsageOverview({ ...params, serviceType: 'text' })
}

/**
 * 获取图片处理用量
 */
export function getImageUsage(params?: { timeRange?: 'today' | 'week' | 'month' | 'all' }) {
  return getUsageOverview({ ...params, serviceType: 'image' })
}

/**
 * 获取视频分析用量
 */
export function getVideoUsage(params?: { timeRange?: 'today' | 'week' | 'month' | 'all' }) {
  return getUsageOverview({ ...params, serviceType: 'video' })
}

export default {
  getUsageOverview,
  getAIModelStats,
  getTokenTrends,
  getUserRanking,
  getCostDistribution,
  refreshUsageData,
  exportUsageReport,
  getUserUsageDetail,
  getMyUsage,
  // 便捷函数
  getTodayOverview,
  getWeekOverview,
  getMonthOverview,
  getTextUsage,
  getImageUsage,
  getVideoUsage
}
