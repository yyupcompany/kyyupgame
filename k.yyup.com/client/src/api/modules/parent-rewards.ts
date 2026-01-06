import { request } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const PARENT_REWARDS_ENDPOINTS = {
  BASE: `${API_PREFIX}/parent-rewards`,
  BY_ID: (id: string) => `${API_PREFIX}/parent-rewards/${id}`,
  USE: (id: string) => `${API_PREFIX}/parent-rewards/${id}/use`
} as const

/**
 * 获取家长奖励列表
 */
export function getParentRewards() {
  return request.get(PARENT_REWARDS_ENDPOINTS.BASE)
}

/**
 * 获取奖励详情
 */
export function getRewardDetail(id: string) {
  return request.get(PARENT_REWARDS_ENDPOINTS.BY_ID(id))
}

/**
 * 使用奖励
 */
export function useReward(id: string, data?: any) {
  return request.post(PARENT_REWARDS_ENDPOINTS.USE(id), data)
}