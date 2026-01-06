/**
 * 活动报名API模块
 * Activity Registration API Module
 */

import { request } from '@/utils/request'
import type { ApiResponse } from '@/types/api'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const ACTIVITY_REGISTRATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/activity-registrations`,
  BY_ID: (id: number) => `${API_PREFIX}/activity-registrations/${id}`,
  USER: (userId?: number) => userId ? `${API_PREFIX}/activity-registrations/user/${userId}` : `${API_PREFIX}/activity-registrations/user`,
  STATS: (activityId: number) => `${API_PREFIX}/activity-registrations/stats/${activityId}`,
  STATUS: (id: number) => `${API_PREFIX}/activity-registrations/${id}/status`,
  BATCH_REVIEW: `${API_PREFIX}/activity-registrations/batch-review`
} as const

// 类型定义
export interface ActivityRegistrationRequest {
  activityId: number
  studentId?: number
  parentId?: number
  notes?: string
  emergencyContact?: string
  emergencyPhone?: string
}

export interface ActivityRegistrationResponse {
  id: number
  activityId: number
  studentId: number
  parentId: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  registrationTime: string
  notes?: string
  emergencyContact?: string
  emergencyPhone?: string
  activity?: {
    id: number
    title: string
    startTime: string
    endTime: string
    location: string
    maxParticipants: number
    currentParticipants: number
  }
}

export interface ActivityRegistrationStats {
  totalRegistrations: number
  pendingRegistrations: number
  approvedRegistrations: number
  rejectedRegistrations: number
  cancelledRegistrations: number
}

/**
 * 报名参加活动
 */
export const joinActivity = async (data: ActivityRegistrationRequest): Promise<ApiResponse<ActivityRegistrationResponse>> => {
  return request.post(ACTIVITY_REGISTRATION_ENDPOINTS.BASE, data)
}

/**
 * 取消活动报名
 */
export const cancelActivity = async (registrationId: number): Promise<ApiResponse<null>> => {
  return request.delete(ACTIVITY_REGISTRATION_ENDPOINTS.BY_ID(registrationId))
}

/**
 * 获取用户的报名记录
 */
export const getUserRegistrations = async (userId?: number): Promise<ApiResponse<ActivityRegistrationResponse[]>> => {
  const url = ACTIVITY_REGISTRATION_ENDPOINTS.USER(userId)
  return request.get(url)
}

/**
 * 获取活动报名统计
 */
export const getActivityRegistrationStats = async (activityId: number): Promise<ApiResponse<ActivityRegistrationStats>> => {
  return request.get(ACTIVITY_REGISTRATION_ENDPOINTS.STATS(activityId))
}

/**
 * 更新报名状态
 */
export const updateRegistrationStatus = async (
  registrationId: number,
  status: 'approved' | 'rejected'
): Promise<ApiResponse<ActivityRegistrationResponse>> => {
  return request.put(ACTIVITY_REGISTRATION_ENDPOINTS.STATUS(registrationId), { status })
}

/**
 * 批量审核报名
 */
export const batchReviewRegistrations = async (
  registrationIds: number[],
  action: 'approve' | 'reject'
): Promise<ApiResponse<null>> => {
  return request.post(ACTIVITY_REGISTRATION_ENDPOINTS.BATCH_REVIEW, {
    registrationIds,
    action
  })
}

// 默认导出
export default {
  joinActivity,
  cancelActivity,
  getUserRegistrations,
  getActivityRegistrationStats,
  updateRegistrationStatus,
  batchReviewRegistrations
}