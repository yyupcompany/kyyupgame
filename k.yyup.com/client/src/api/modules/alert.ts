/**
 * 预警中心API服务
 *
 * 提供告警管理和告警规则配置功能
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

const API_BASE = '/alerts'

// 告警类型枚举
export type AlertType = 'attendance' | 'payment' | 'health' | 'safety' | 'enrollment' | 'custom'

// 告警级别枚举
export type AlertLevel = 'low' | 'medium' | 'high' | 'critical'

// 告警状态枚举
export type AlertStatus = 'active' | 'acknowledged' | 'resolved' | 'dismissed'

// 告警记录类型
export interface Alert {
  id: number
  alertType: AlertType
  alertLevel: AlertLevel
  title: string
  description: string
  sourceType: 'system' | 'manual' | 'scheduled'
  sourceId: string | null
  status: AlertStatus
  priority: number
  triggeredAt: string
  acknowledgedAt: string | null
  acknowledgedBy: number | null
  resolvedAt: string | null
  resolvedBy: number | null
  resolution: string | null
  metadata: Record<string, any>
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  // 关联数据
  acknowledger?: {
    id: number
    name: string
  }
  resolver?: {
    id: number
    name: string
  }
}

// 告警规则类型
export interface AlertRule {
  id: number
  name: string
  description: string
  alertType: AlertType
  alertLevel: AlertLevel
  conditionType: 'threshold' | 'schedule' | 'event' | 'expression'
  conditionConfig: Record<string, any>
  actionType: 'notify' | 'escalate' | 'auto_resolve'
  actionConfig: Record<string, any>
  enabled: boolean
  scopeType: 'global' | 'class' | 'student' | 'parent'
  scopeId: string | null
  cooldownMinutes: number
  lastTriggeredAt: string | null
  triggerCount: number
  createdAt: string
  updatedAt: string
}

// 创建告警参数
export interface CreateAlertParams {
  alertType: AlertType
  alertLevel: AlertLevel
  title: string
  description: string
  sourceType?: 'system' | 'manual' | 'scheduled'
  sourceId?: string
  priority?: number
  metadata?: Record<string, any>
}

// 更新告警参数
export interface UpdateAlertParams {
  status?: AlertStatus
  resolution?: string
}

// 创建规则参数
export interface CreateRuleParams {
  name: string
  description?: string
  alertType: AlertType
  alertLevel: AlertLevel
  conditionType: 'threshold' | 'schedule' | 'event' | 'expression'
  conditionConfig: Record<string, any>
  actionType: 'notify' | 'escalate' | 'auto_resolve'
  actionConfig: Record<string, any>
  enabled?: boolean
  scopeType?: 'global' | 'class' | 'student' | 'parent'
  scopeId?: string | null
  cooldownMinutes?: number
}

// 查询参数
export interface AlertQueryParams {
  page?: number
  limit?: number
  alertType?: AlertType
  alertLevel?: AlertLevel
  status?: AlertStatus
  startDate?: string
  endDate?: string
}

// 告警统计
export interface AlertStatistics {
  total: number
  activeCount: number
  todayCount: number
  byType: Array<{ alertType: string; count: string }>
  byLevel: Array<{ alertLevel: string; count: string }>
  byStatus: Array<{ status: string; count: string }>
}

// API服务
export const alertApi = {
  /**
   * 创建告警
   */
  createAlert: (data: CreateAlertParams) =>
    request.post<ApiResponse<Alert>>(API_BASE, data),

  /**
   * 获取告警列表
   */
  listAlerts: (params?: AlertQueryParams) =>
    request.get<ApiResponse<{
      total: number
      page: number
      limit: number
      totalPages: number
      alerts: Alert[]
    }>>(API_BASE, { params }),

  /**
   * 获取告警统计
   */
  getStatistics: (params?: { startDate?: string; endDate?: string }) =>
    request.get<ApiResponse<AlertStatistics>>(`${API_BASE}/statistics`, { params }),

  /**
   * 获取告警详情
   */
  getAlert: (id: number) =>
    request.get<ApiResponse<Alert>>(`${API_BASE}/${id}`),

  /**
   * 更新告警状态
   */
  updateAlert: (id: number, data: UpdateAlertParams) =>
    request.put<ApiResponse<Alert>>(`${API_BASE}/${id}`, data),

  /**
   * 删除告警
   */
  deleteAlert: (id: number) =>
    request.delete<ApiResponse<null>>(`${API_BASE}/${id}`),

  /**
   * 创建告警规则
   */
  createRule: (data: CreateRuleParams) =>
    request.post<ApiResponse<AlertRule>>(`${API_BASE}/rules`, data),

  /**
   * 获取告警规则列表
   */
  listRules: (params?: { page?: number; limit?: number; alertType?: AlertType; enabled?: boolean }) =>
    request.get<ApiResponse<{
      total: number
      page: number
      limit: number
      totalPages: number
      rules: AlertRule[]
    }>>(`${API_BASE}/rules/list`, { params }),

  /**
   * 切换规则启用状态
   */
  toggleRule: (id: number) =>
    request.put<ApiResponse<AlertRule>>(`${API_BASE}/rules/${id}/toggle`),

  /**
   * 触发告警检查 (定时任务)
   */
  checkAlerts: (type?: AlertType) =>
    request.post<ApiResponse<{
      checkedRules: number
      triggeredAlerts: number
      alerts: Alert[]
    }>>(`${API_BASE}/check`, null, { params: { type } })
}

export default alertApi
