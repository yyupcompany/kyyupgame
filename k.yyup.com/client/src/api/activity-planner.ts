/**
 * 活动策划API服务
 */

import requestInstance from '../utils/request'
import { ACTIVITY_PLANNER_ENDPOINTS } from './endpoints'

/**
 * 活动策划请求接口
 */
export interface ActivityPlanningRequest {
  activityType: string
  targetAudience: string
  budget?: number
  duration?: string
  location?: string
  requirements?: string[]
  preferredStyle?: 'professional' | 'creative' | 'fun' | 'educational'
}

/**
 * 活动策划结果接口
 */
export interface ActivityPlanningResult {
  planId: string
  title: string
  description: string
  detailedPlan: {
    overview: string
    timeline: Array<{
      time: string
      activity: string
      description: string
    }>
    materials: string[]
    budget: {
      total: number
      breakdown: Array<{
        item: string
        cost: number
      }>
    }
    tips: string[]
  }
  generatedImages?: string[]
  audioGuide?: string
  modelsUsed: {
    textModel: string
    imageModel?: string
    speechModel?: string
  }
  processingTime: number
}

/**
 * AI模型信息接口
 */
export interface AIModelInfo {
  id: number
  name: string
  displayName: string
  provider: string
  isDefault: boolean
}

/**
 * 可用模型列表接口
 */
export interface AvailableModels {
  textModels: AIModelInfo[]
  imageModels: AIModelInfo[]
  speechModels: AIModelInfo[]
}

/**
 * 活动策划统计接口
 */
export interface PlanningStats {
  totalPlans: number
  successRate: number
  averageProcessingTime: number
  popularActivityTypes: string[]
}

/**
 * 生成活动策划方案
 * @param planningRequest 策划请求
 * @returns 策划结果
 */
export const generateActivityPlan = async (planningRequest: ActivityPlanningRequest): Promise<ActivityPlanningResult> => {
  const response = await requestInstance.post(ACTIVITY_PLANNER_ENDPOINTS.GENERATE, planningRequest)
  return response.data
}

/**
 * 获取活动策划统计
 * @param days 统计天数，默认30天
 * @returns 统计数据
 */
export const getPlanningStats = async (days: number = 30): Promise<PlanningStats> => {
  const response = await requestInstance.get(ACTIVITY_PLANNER_ENDPOINTS.STATS, {
    params: { days }
  })
  return response.data
}

/**
 * 获取可用AI模型列表
 * @returns 模型列表
 */
export const getAvailableModels = async (): Promise<AvailableModels> => {
  const response = await requestInstance.get(ACTIVITY_PLANNER_ENDPOINTS.MODELS)
  return response.data
}

/**
 * 活动策划API服务
 */
export const activityPlannerApi = {
  generateActivityPlan,
  getPlanningStats,
  getAvailableModels
}