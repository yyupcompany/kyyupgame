/**
 * 活动中心API接口
 */
import { request } from '@/utils/request'

// ==================== 活动概览 API ====================

/**
 * 获取活动概览数据
 */
export function getActivityOverview() {
  return request.get('/api/activity-center/overview')
}

/**
 * 获取活动分布统计
 */
export function getActivityDistribution() {
  return request.get('/api/activity-center/distribution')
}

/**
 * 获取活动趋势数据
 */
export function getActivityTrend() {
  return request.get('/api/activity-center/trend')
}

// ==================== 活动管理 API ====================

/**
 * 获取活动列表
 */
export function getActivities(params?: {
  page?: number
  pageSize?: number
  title?: string
  type?: string
  status?: string
  startDate?: string
  endDate?: string
}) {
  return request.get('/api/activity-center/activities', { params })
}

/**
 * 获取活动详情
 */
export function getActivityDetail(id: string) {
  return request.get(`/api/activity-center/activities/${id}`)
}

/**
 * 创建活动
 */
export function createActivity(data: any) {
  return request.post('/api/activity-center/activities', data)
}

/**
 * 更新活动
 */
export function updateActivity(id: string, data: any) {
  return request.put(`/api/activity-center/activities/${id}`, data)
}

/**
 * 删除活动
 */
export function deleteActivity(id: string) {
  return request.delete(`/api/activity-center/activities/${id}`)
}

/**
 * 发布活动
 */
export function publishActivity(id: string) {
  return request.post(`/api/activity-center/activities/${id}/publish`)
}

/**
 * 取消活动
 */
export function cancelActivity(id: string) {
  return request.post(`/api/activity-center/activities/${id}/cancel`)
}

// ==================== 报名管理 API ====================

/**
 * 获取报名列表
 */
export function getRegistrations(params?: {
  page?: number
  pageSize?: number
  activityId?: string
  studentName?: string
  parentName?: string
  status?: string
}) {
  return request.get('/api/activity-center/registrations', { params })
}

/**
 * 获取报名详情
 */
export function getRegistrationDetail(id: string) {
  return request.get(`/api/activity-center/registrations/${id}`)
}

/**
 * 审核报名
 */
export function approveRegistration(id: string, data: { status: string; remark?: string }) {
  return request.post(`/api/activity-center/registrations/${id}/approve`, data)
}

/**
 * 批量审核报名
 */
export function batchApproveRegistrations(ids: string[], data: { status: string; remark?: string }) {
  return request.post('/api/activity-center/registrations/batch-approve', { ids, ...data })
}

// ==================== 活动分析 API ====================

/**
 * 获取活动分析数据
 */
export function getActivityAnalytics(params?: {
  activityId?: string
  startDate?: string
  endDate?: string
  type?: string
}) {
  return request.get('/api/activity-center/analytics', { params })
}

/**
 * 获取活动效果报告
 */
export function getActivityReport(id: string) {
  return request.get(`/api/activity-center/analytics/${id}/report`)
}

/**
 * 获取参与度分析
 */
export function getParticipationAnalysis(params?: {
  startDate?: string
  endDate?: string
  type?: string
}) {
  return request.get('/api/activity-center/analytics/participation', { params })
}

// ==================== 通知管理 API ====================

/**
 * 获取通知列表
 */
export function getNotifications(params?: {
  page?: number
  pageSize?: number
  type?: string
  status?: string
}) {
  return request.get('/api/activity-center/notifications', { params })
}

/**
 * 发送活动通知
 */
export function sendActivityNotification(data: {
  activityId: string
  type: string
  title: string
  content: string
  recipients: string[]
  sendTime?: string
}) {
  return request.post('/api/activity-center/notifications/send', data)
}

/**
 * 获取通知模板
 */
export function getNotificationTemplates() {
  return request.get('/api/activity-center/notifications/templates')
}

/**
 * 创建通知模板
 */
export function createNotificationTemplate(data: {
  name: string
  type: string
  title: string
  content: string
}) {
  return request.post('/api/activity-center/notifications/templates', data)
}

/**
 * 更新通知模板
 */
export function updateNotificationTemplate(id: string, data: any) {
  return request.put(`/api/activity-center/notifications/templates/${id}`, data)
}

/**
 * 删除通知模板
 */
export function deleteNotificationTemplate(id: string) {
  return request.delete(`/api/activity-center/notifications/templates/${id}`)
}

// ==================== 类型定义 ====================

export interface ActivityOverview {
  totalActivities: number
  ongoingActivities: number
  totalRegistrations: number
  activeParticipants: number
  monthlyGrowth: {
    activities: number
    registrations: number
    participants: number
  }
}

export interface ActivityDistribution {
  byType: Array<{ name: string; value: number }>
  byStatus: Array<{ name: string; value: number }>
  byMonth: Array<{ month: string; count: number }>
}

export interface ActivityTrend {
  activities: Array<{ date: string; count: number }>
  registrations: Array<{ date: string; count: number }>
  participants: Array<{ date: string; count: number }>
}

export interface Activity {
  id: string
  title: string
  description: string
  type: string
  status: string
  startTime: string
  endTime: string
  location: string
  capacity: number
  registeredCount: number
  price: number
  organizer: string
  createdAt: string
  updatedAt: string
}

export interface Registration {
  id: string
  activityId: string
  activityTitle: string
  studentId: string
  studentName: string
  parentId: string
  parentName: string
  parentPhone: string
  status: string
  registeredAt: string
  approvedAt?: string
  remark?: string
}

export interface ActivityAnalytics {
  overview: {
    totalParticipants: number
    completionRate: number
    satisfactionScore: number
    revenue: number
  }
  participation: {
    byAge: Array<{ age: string; count: number }>
    byGender: Array<{ gender: string; count: number }>
    bySource: Array<{ source: string; count: number }>
  }
  feedback: {
    ratings: Array<{ rating: number; count: number }>
    comments: Array<{ comment: string; rating: number; date: string }>
  }
}

export interface Notification {
  id: string
  type: string
  title: string
  content: string
  activityId?: string
  activityTitle?: string
  recipients: number
  sentAt: string
  status: string
}

export interface NotificationTemplate {
  id: string
  name: string
  type: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}
