import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { API_PREFIX } from '../endpoints/base'

/**
 * AI智能推广API接口
 */

// 智能推广API端点
const SMART_PROMOTION_ENDPOINTS = {
  CONTENT_GENERATE: `${API_PREFIX}/smart-promotion/content/generate`,
  SOCIAL_CONTENT_GENERATE: `${API_PREFIX}/smart-promotion/social-content/generate`,
  POSTER_GENERATE: `${API_PREFIX}/smart-promotion/poster/generate`,
  REWARD_CALCULATE: `${API_PREFIX}/smart-promotion/reward/calculate`,
  INCENTIVE_GENERATE: `${API_PREFIX}/smart-promotion/incentive/generate`,
  VIRAL_TRACK: (referralCode: string) => `${API_PREFIX}/smart-promotion/viral/track/${referralCode}`,
  VIRAL_OPTIMIZE: (referralCode: string) => `${API_PREFIX}/smart-promotion/viral/optimize/${referralCode}`,
  STATS: `${API_PREFIX}/smart-promotion/stats`
} as const

// 推广内容生成请求参数
export interface PromotionContentRequest {
  activityId: number
  targetAudience?: 'parents' | 'teachers' | 'community'
  style?: 'professional' | 'friendly' | 'urgent' | 'festive'
  includeIncentives?: boolean
}

// 推广内容响应
export interface PromotionContentResponse {
  content: {
    mainTitle: string
    subTitle: string
    highlights: string[]
    callToAction: string
    socialProof: string
    urgency: string
  }
  activityId: number
  generatedAt: string
}

// 社交媒体内容请求参数
export interface SocialMediaContentRequest {
  activityId: number
  referralCode: string
}

// 社交媒体内容响应
export interface SocialMediaContentResponse {
  socialContent: {
    wechatMoments: string
    wechatGroup: string
    personalMessage: string
  }
  referralCode: string
  generatedAt: string
}

// 完整海报生成请求参数
export interface CompletePosterRequest {
  activityId: number
  referralCode: string
  preferences?: {
    style?: string
    targetAudience?: string
    includeQR?: boolean
    includePricing?: boolean
  }
}

// 完整海报生成响应
export interface CompletePosterResponse {
  posterUrl: string
  qrCodeUrl: string
  downloadUrls: {
    jpg: string
    png: string
    pdf: string
  }
  socialContent: {
    wechatMoments: string
    wechatGroup: string
    personalMessage: string
  }
  analytics: {
    estimatedReach: number
    estimatedConversion: number
    suggestedChannels: string[]
  }
}

// 推广员奖励响应
export interface RewardResponse {
  currentLevel: string
  totalEarnings: number
  pendingRewards: number
  nextLevelProgress: number
  estimatedMonthlyIncome: number
  levelPerks: string[]
}

// 个性化激励响应
export interface IncentiveResponse {
  recommendedActions: string[]
  bonusOpportunities: Array<{
    title: string
    description: string
    reward: string
    deadline: string
  }>
  socialRecognition: string
  exclusivePerks: string[]
}

// 病毒式传播数据响应
export interface ViralDataResponse {
  spreadTree: any[]
  totalReach: number
  conversionFunnel: {
    views: number
    clicks: number
    registrations: number
    payments: number
  }
  viralCoefficient: number
  generationAnalysis: {
    generation1: number
    generation2: number
    generation3: number
  }
}

// 策略优化响应
export interface StrategyOptimizationResponse {
  bottlenecks: string[]
  opportunities: string[]
  recommendations: string[]
  predictedGrowth: number
}

// 推广统计响应
export interface PromotionStatsResponse {
  totalCodes: number
  totalReferrals: number
  totalEarnings: number
  newCodesThisPeriod: number
  newReferralsThisPeriod: number
  timeRange: string
  calculatedAt: string
}

/**
 * AI智能推广API
 */
export const smartPromotionApi = {
  /**
   * 生成AI推广文案
   */
  async generatePromotionContent(params: PromotionContentRequest): Promise<ApiResponse<PromotionContentResponse>> {
    return request.post(SMART_PROMOTION_ENDPOINTS.CONTENT_GENERATE, params)
  },

  /**
   * 生成社交媒体推广内容
   */
  async generateSocialMediaContent(params: SocialMediaContentRequest): Promise<ApiResponse<SocialMediaContentResponse>> {
    return request.post(SMART_PROMOTION_ENDPOINTS.SOCIAL_CONTENT_GENERATE, params)
  },

  /**
   * 一键生成完整推广海报
   */
  async generateCompletePoster(params: CompletePosterRequest): Promise<ApiResponse<CompletePosterResponse>> {
    return request.post(SMART_PROMOTION_ENDPOINTS.POSTER_GENERATE, params)
  },

  /**
   * 计算推广员奖励
   */
  async calculateReward(): Promise<ApiResponse<RewardResponse>> {
    return request.get(SMART_PROMOTION_ENDPOINTS.REWARD_CALCULATE)
  },

  /**
   * 生成个性化激励策略
   */
  async generatePersonalizedIncentive(): Promise<ApiResponse<IncentiveResponse>> {
    return request.post(SMART_PROMOTION_ENDPOINTS.INCENTIVE_GENERATE)
  },

  /**
   * 追踪病毒式传播
   */
  async trackViralSpread(referralCode: string): Promise<ApiResponse<ViralDataResponse>> {
    return request.get(SMART_PROMOTION_ENDPOINTS.VIRAL_TRACK(referralCode))
  },

  /**
   * 优化病毒式传播策略
   */
  async optimizeViralStrategy(referralCode: string): Promise<ApiResponse<StrategyOptimizationResponse>> {
    return request.post(SMART_PROMOTION_ENDPOINTS.VIRAL_OPTIMIZE(referralCode))
  },

  /**
   * 获取推广统计数据
   */
  async getPromotionStats(timeRange: '7d' | '30d' | '90d' = '30d'): Promise<ApiResponse<PromotionStatsResponse>> {
    return request.get(SMART_PROMOTION_ENDPOINTS.STATS, { params: { timeRange } })
  }
}
