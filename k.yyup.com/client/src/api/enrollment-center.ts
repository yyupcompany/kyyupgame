/**
 * 招生中心API服务
 * 为招生中心页面提供完整的数据接口调用
 */

import { request } from '@/utils/request'

// API基础路径 (注意：request工具的baseURL为空，需要手动添加/api前缀)
// 后端路由注册为 /api/enrollment-center
const API_BASE = '/api/enrollment-center'

// ==================== 类型定义 ====================

// 概览数据类型
export interface OverviewStatistics {
  totalConsultations: {
    value: number
    trend: number
    trendText: string
  }
  applications: {
    value: number
    trend: number
    trendText: string
  }
  trials: {
    value: number
    trend: number
    trendText: string
  }
  conversionRate: {
    value: number
    trend: number
    trendText: string
  }
}

export interface OverviewCharts {
  enrollmentTrend: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
  sourceChannel: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
}

export interface OverviewData {
  statistics: OverviewStatistics
  charts: OverviewCharts
  quickStats: {
    pendingApplications: number
    todayConsultations: number
    upcomingInterviews: number
  }
}

// 计划管理类型
export interface EnrollmentPlan {
  id: number
  title: string
  year: number
  semester: string
  targetCount: number
  appliedCount: number
  progress: number
  status: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  quotas?: Array<{
    id: number
    className: string
    totalQuota: number
    usedQuota: number
  }>
}

export interface PlanQuery {
  page?: number
  pageSize?: number
  search?: string
  year?: number
  semester?: 'spring' | 'autumn'
  status?: 'draft' | 'active' | 'inactive'
  sortBy?: 'createdAt' | 'year' | 'targetCount'
  sortOrder?: 'asc' | 'desc'
}

export interface CreatePlanData {
  title: string
  year: number
  semester: 'spring' | 'autumn'
  targetCount: number
  targetAmount?: number
  ageRange?: string
  startDate: string
  endDate: string
  description?: string
  status?: 'draft' | 'active'
  quotas?: Array<{
    classId: number
    quota: number
  }>
}

// 申请管理类型
export interface EnrollmentApplication {
  id: number
  applicationNo: string
  studentName: string
  gender: string
  birthDate: string
  parentName: string
  parentPhone: string
  planTitle: string
  planId: number
  status: string
  applicationDate: string
  materialsCount: number
  interviewScheduled: boolean
}

export interface ApplicationQuery {
  page?: number
  pageSize?: number
  search?: string
  planId?: number
  status?: 'pending' | 'approved' | 'rejected' | 'interview'
  applicationDateFrom?: string
  applicationDateTo?: string
  sortBy?: 'applicationDate' | 'studentName' | 'status'
  sortOrder?: 'asc' | 'desc'
}

// 咨询管理类型
export interface ConsultationStatistics {
  todayConsultations: number
  pendingFollowUp: number
  monthlyConversions: number
  averageResponseTime: number
  sourceAnalysis: Array<{
    source: string
    count: number
    conversionRate: number
  }>
  statusDistribution: Array<{
    status: string
    count: number
    percentage: number
  }>
}

// 数据分析类型
export interface AnalyticsMetrics {
  yoyGrowth: number
  momGrowth: number
  targetCompletion: number
  averageCost: number
  comparison: {
    current: {
      period: string
      consultations: number
      applications: number
      conversions: number
    }
    previous: {
      period: string
      consultations: number
      applications: number
      conversions: number
    }
  }
}

// AI功能类型
export interface AIPrediction {
  prediction: {
    expectedApplications: number
    confidence: number
    factors: Array<{
      name: string
      impact: number
      description: string
    }>
  }
  chart: {
    categories: string[]
    series: Array<{
      name: string
      data: number[]
    }>
  }
}

export interface AIStrategy {
  suggestions: Array<{
    id: string
    title: string
    description: string
    expectedImprovement: string
    confidence: number
    priority: 'high' | 'medium' | 'low'
    category: 'marketing' | 'timing' | 'pricing' | 'process'
    implementation: {
      steps: string[]
      timeline: string
      resources: string[]
    }
  }>
  metrics: {
    predictedApplications: number
    recommendedQuota: number
    optimalTiming: string
    riskAssessment: 'low' | 'medium' | 'high'
  }
}

// ==================== API服务类 ====================

export class EnrollmentCenterAPI {
  
  // ==================== 概览数据 ====================
  
  /**
   * 获取招生中心概览数据
   */
  static async getOverview(params?: {
    timeRange?: 'week' | 'month' | 'quarter' | 'year'
    kindergartenId?: number
  }): Promise<OverviewData> {
    return request.get(`${API_BASE}/overview`, { params })
  }

  // ==================== 计划管理 ====================
  
  /**
   * 获取招生计划列表
   */
  static async getPlans(query?: PlanQuery) {
    return request.get(`${API_BASE}/plans`, { params: query })
  }

  /**
   * 获取招生计划详情
   */
  static async getPlanDetail(id: number) {
    return request.get(`${API_BASE}/plans/${id}`)
  }

  /**
   * 创建招生计划
   */
  static async createPlan(data: CreatePlanData) {
    return request.post(`${API_BASE}/plans`, data)
  }

  /**
   * 更新招生计划
   */
  static async updatePlan(id: number, data: Partial<CreatePlanData>) {
    return request.put(`${API_BASE}/plans/${id}`, data)
  }

  /**
   * 删除招生计划
   */
  static async deletePlan(id: number) {
    return request.delete(`${API_BASE}/plans/${id}`)
  }

  // ==================== 申请管理 ====================
  
  /**
   * 获取申请列表
   */
  static async getApplications(query?: ApplicationQuery) {
    return request.get(`${API_BASE}/applications`, { params: query })
  }

  /**
   * 获取申请详情
   */
  static async getApplicationDetail(id: number) {
    return request.get(`${API_BASE}/applications/${id}`)
  }

  /**
   * 更新申请状态
   */
  static async updateApplicationStatus(id: number, data: {
    status: 'pending' | 'approved' | 'rejected' | 'interview'
    remarks?: string
    notifyParent?: boolean
  }) {
    return request.put(`${API_BASE}/applications/${id}/status`, data)
  }

  // ==================== 咨询管理 ====================
  
  /**
   * 获取咨询列表
   */
  static async getConsultations(query?: {
    page?: number
    pageSize?: number
    search?: string
    status?: string
    source?: string
  }) {
    return request.get(`${API_BASE}/consultations`, { params: query })
  }

  /**
   * 获取咨询统计数据
   */
  static async getConsultationStatistics(): Promise<ConsultationStatistics> {
    return request.get(`${API_BASE}/consultations/statistics`)
  }

  // ==================== 数据分析 ====================
  
  /**
   * 获取招生趋势分析
   */
  static async getAnalyticsTrends(params?: {
    timeRange?: 'month' | 'quarter' | 'year'
    dimension?: 'source' | 'plan' | 'region'
    compareWith?: 'lastPeriod' | 'lastYear'
  }) {
    return request.get(`${API_BASE}/analytics/trends`, { params })
  }

  /**
   * 获取转化漏斗分析
   */
  static async getAnalyticsFunnel(params?: {
    timeRange?: 'month' | 'quarter' | 'year'
  }) {
    return request.get(`${API_BASE}/analytics/funnel`, { params })
  }

  /**
   * 获取地域分布分析
   */
  static async getAnalyticsRegions(params?: {
    timeRange?: 'month' | 'quarter' | 'year'
  }) {
    return request.get(`${API_BASE}/analytics/regions`, { params })
  }

  /**
   * 获取关键指标对比
   */
  static async getAnalyticsMetrics(params?: {
    timeRange?: 'month' | 'quarter' | 'year'
    compareWith?: 'lastPeriod' | 'lastYear'
  }): Promise<AnalyticsMetrics> {
    return request.get(`${API_BASE}/analytics/metrics`, { params })
  }

  // ==================== AI功能 ====================
  
  /**
   * AI智能预测
   */
  static async aiPredict(data: {
    planId?: number
    timeRange: 'month' | 'quarter' | 'year'
    factors?: string[]
  }): Promise<AIPrediction> {
    return request.post(`${API_BASE}/ai/predict`, data)
  }

  /**
   * AI策略优化建议
   */
  static async aiStrategy(data?: {
    planId?: number
    focusArea?: 'marketing' | 'timing' | 'pricing' | 'process'
  }): Promise<AIStrategy> {
    return request.post(`${API_BASE}/ai/strategy`, data)
  }

  /**
   * AI容量分析
   */
  static async aiCapacityAnalysis(data: {
    planId: number
    targetIncrease?: number
  }) {
    return request.post(`${API_BASE}/ai/capacity`, data)
  }
}

// ==================== 便捷方法导出 ====================

// 概览数据
export const getEnrollmentOverview = EnrollmentCenterAPI.getOverview

// 计划管理
export const getEnrollmentPlans = EnrollmentCenterAPI.getPlans
export const getEnrollmentPlanDetail = EnrollmentCenterAPI.getPlanDetail
export const createEnrollmentPlan = EnrollmentCenterAPI.createPlan
export const updateEnrollmentPlan = EnrollmentCenterAPI.updatePlan
export const deleteEnrollmentPlan = EnrollmentCenterAPI.deletePlan

// 申请管理
export const getEnrollmentApplications = EnrollmentCenterAPI.getApplications
export const getEnrollmentApplicationDetail = EnrollmentCenterAPI.getApplicationDetail
export const updateApplicationStatus = EnrollmentCenterAPI.updateApplicationStatus

// 咨询管理
export const getEnrollmentConsultations = EnrollmentCenterAPI.getConsultations
export const getConsultationStatistics = EnrollmentCenterAPI.getConsultationStatistics

// 数据分析
export const getAnalyticsTrends = EnrollmentCenterAPI.getAnalyticsTrends
export const getAnalyticsFunnel = EnrollmentCenterAPI.getAnalyticsFunnel
export const getAnalyticsRegions = EnrollmentCenterAPI.getAnalyticsRegions
export const getAnalyticsMetrics = EnrollmentCenterAPI.getAnalyticsMetrics

// AI功能
export const aiPredict = EnrollmentCenterAPI.aiPredict
export const aiStrategy = EnrollmentCenterAPI.aiStrategy
export const aiCapacityAnalysis = EnrollmentCenterAPI.aiCapacityAnalysis

// 默认导出
export default EnrollmentCenterAPI
