import request from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const TEACHER_REWARDS_ENDPOINTS = {
  REWARDS: `${API_PREFIX}/teacher/rewards`,
  REWARDS_STATS: `${API_PREFIX}/teacher/rewards/stats`,
  REWARD_BY_ID: (id: number) => `${API_PREFIX}/teacher/rewards/${id}`,
  USE_VOUCHER: (id: number) => `${API_PREFIX}/teacher/rewards/${id}/use`,
  REFERRAL_LEADS: (rewardId: number) => `${API_PREFIX}/teacher/rewards/${rewardId}/referral-leads`,
  REFERRAL_STATS: `${API_PREFIX}/teacher/rewards/referral-stats`,
  REFERRALS: `${API_PREFIX}/teacher/referrals`
} as const

// 教师奖励相关类型定义
export interface TeacherReward {
  id: number
  title: string
  description: string
  type: 'cash' | 'voucher' | 'gift' | 'points'
  value?: number
  currency?: string
  status: 'available' | 'used' | 'expired'
  expiryDate?: string
  createdAt: string
  updatedAt?: string
  usedAt?: string
  source: string
  usageInstructions?: string
  // 转介绍相关字段
  shareInfo?: {
    leads: Array<{
      id: number
      childName?: string
      visitorName?: string
      visitorPhone: string
      assignedTeacher: string
      status: string
      statusText: string
      sopProgress?: {
        currentStage: string
        progress: number
        successProbability: number
      }
    }>
  }
}

export interface TeacherRewardStats {
  availableRewards: number
  usedRewards: number
  expiredRewards: number
  totalRewards: number
  totalValue: number
  availableValue: number
  usedValue: number
}

export interface TeacherRewardListParams {
  status?: string
  type?: string
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface TeacherRewardListResponse {
  list: TeacherReward[]
  total: number
  page: number
  pageSize: number
  stats: TeacherRewardStats
}

export interface UseVoucherParams {
  useLocation: string
  notes?: string
}

class TeacherRewardsService {
  /**
   * 获取教师奖励列表和统计信息
   */
  async getRewardsList(params?: TeacherRewardListParams): Promise<ApiResponse<TeacherRewardListResponse>> {
    return request({
      url: TEACHER_REWARDS_ENDPOINTS.REWARDS,
      method: 'GET',
      params
    })
  }

  /**
   * 获取奖励统计信息
   */
  async getRewardStats(): Promise<ApiResponse<TeacherRewardStats>> {
    return request({
      url: TEACHER_REWARDS_ENDPOINTS.REWARDS_STATS,
      method: 'GET'
    })
  }

  /**
   * 获取单个奖励详情
   */
  async getRewardDetail(id: number): Promise<ApiResponse<TeacherReward>> {
    return request({
      url: TEACHER_REWARDS_ENDPOINTS.REWARD_BY_ID(id),
      method: 'GET'
    })
  }

  /**
   * 使用代金券
   */
  async useVoucher(id: number, params: UseVoucherParams): Promise<ApiResponse<{ success: boolean; message: string }>> {
    return request({
      url: TEACHER_REWARDS_ENDPOINTS.USE_VOUCHER(id),
      method: 'POST',
      data: params
    })
  }

  /**
   * 刷新奖励数据和统计信息
   */
  async refreshRewardsData(params?: TeacherRewardListParams): Promise<{
    rewards: TeacherReward[]
    stats: TeacherRewardStats
  }> {
    try {
      const response = await this.getRewardsList(params)
      if (response.success && response.data) {
        return {
          rewards: response.data.list,
          stats: response.data.stats
        }
      }
      throw new Error(response.message || '获取奖励数据失败')
    } catch (error) {
      console.error('刷新奖励数据失败:', error)
      throw error
    }
  }

  /**
   * 获取转介绍分享带来的线索信息
   */
  async getReferralLeads(rewardId: number): Promise<ApiResponse<any[]>> {
    return request({
      url: TEACHER_REWARDS_ENDPOINTS.REFERRAL_LEADS(rewardId),
      method: 'GET'
    })
  }

  /**
   * 获取教师转介绍统计数据
   */
  async getReferralStats(): Promise<ApiResponse<{
    totalReferrals: number
    convertedReferrals: number
    pendingReferrals: number
    totalRewards: number
    conversionRate: number
    monthlyStats: Array<{
      month: string
      referrals: number
      conversions: number
      rewards: number
    }>
  }>> {
    return request({
      url: TEACHER_REWARDS_ENDPOINTS.REFERRAL_STATS,
      method: 'GET'
    })
  }

  /**
   * 创建转介绍记录
   */
  async createReferral(data: {
    visitorName: string
    visitorPhone: string
    childName?: string
    childAge?: number
    notes?: string
  }): Promise<ApiResponse<{
    id: number
    referralCode: string
    shareUrl: string
  }>> {
    return request({
      url: TEACHER_REWARDS_ENDPOINTS.REFERRALS,
      method: 'POST',
      data
    })
  }

  /**
   * 获取转介绍记录列表
   */
  async getReferralList(params?: {
    status?: string
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<{
    list: any[]
    total: number
    page: number
    pageSize: number
  }>> {
    return request({
      url: TEACHER_REWARDS_ENDPOINTS.REFERRALS,
      method: 'GET',
      params
    })
  }
}

// 创建服务实例
export const TeacherRewardsService = new TeacherRewardsService()

// 导出类型和服务
export type { TeacherRewardsService as default }
export default TeacherRewardsService