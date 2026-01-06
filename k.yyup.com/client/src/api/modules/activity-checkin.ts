import { get, post } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// 接口类型定义
export interface CheckinRecord {
  id: number
  activityId: number
  contactName: string
  contactPhone: string
  childName: string
  childAge: number
  checkInTime: string | null
  checkInLocation: string | null
  registrationTime: string
}

export interface CheckinStats {
  activity: {
    id: number
    title: string
    capacity: number
    registeredCount: number
    checkedInCount: number
  }
  statistics: {
    totalRegistrations: number
    checkedInCount: number
    notCheckedInCount: number
    checkInRate: number
  }
  timeDistribution: Array<{
    hour: number
    count: number
  }>
}

export interface BatchCheckinRequest {
  registrationIds: number[]
  location: string
}

export interface BatchCheckinResponse {
  successCount: number
  failureCount: number
  details: Array<{
    id: number
    contactName: string
    checkInTime: string
  }>
}

// API 端点
const ACTIVITY_CHECKIN_ENDPOINTS = {
  CHECKIN: `${API_PREFIX}/activity-checkin`,
  BATCH_CHECKIN: `${API_PREFIX}/activity-checkin/batch`,
  STATS: `${API_PREFIX}/activity-checkin/stats`,
  EXPORT: `${API_PREFIX}/activity-checkin/export`,
  TEACHER_OVERVIEW: `${API_PREFIX}/teacher/activity-checkin-overview`
}

/**
 * 单个签到
 */
export const checkInRegistration = (registrationId: number, location: string) => {
  return post<CheckinRecord>(`${ACTIVITY_CHECKIN_ENDPOINTS.CHECKIN}/${registrationId}`, {
    location
  })
}

/**
 * 批量签到
 */
export const batchCheckIn = (data: BatchCheckinRequest) => {
  return post<BatchCheckinResponse>(ACTIVITY_CHECKIN_ENDPOINTS.BATCH_CHECKIN, data)
}

/**
 * 获取活动签到统计
 */
export const getActivityCheckinStats = (activityId: number) => {
  return get<CheckinStats>(`${ACTIVITY_CHECKIN_ENDPOINTS.STATS}/${activityId}`)
}

/**
 * 获取活动签到记录列表
 */
export const getActivityCheckinRecords = (activityId: number, params?: {
  page?: number
  limit?: number
  status?: 'checked_in' | 'not_checked_in' | 'all'
}) => {
  return get<{
    records: CheckinRecord[]
    pagination: {
      page: number
      limit: number
      total: number
      totalPages: number
    }
  }>(`${ACTIVITY_CHECKIN_ENDPOINTS.CHECKIN}/${activityId}/records`, { params })
}

/**
 * 导出签到数据
 */
export const exportCheckinData = (activityId: number) => {
  return get<Blob>(`${ACTIVITY_CHECKIN_ENDPOINTS.EXPORT}/${activityId}`, { responseType: 'blob' });
}

/**
 * 获取教师活动签到概览
 */
export const getTeacherActivityCheckinOverview = () => {
  return get<{
    totalActivities: number
    totalRegistrations: number
    totalCheckins: number
    avgCheckinRate: number
    recentActivities: Array<{
      id: number
      title: string
      registeredCount: number
      checkedInCount: number
      checkInRate: number
      startTime: string
    }>
  }>(ACTIVITY_CHECKIN_ENDPOINTS.TEACHER_OVERVIEW)
}
