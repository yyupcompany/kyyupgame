/**
 * 仪表盘相关API端点
 */
import { API_PREFIX } from './base';

// 仪表盘接口
export const DASHBOARD_ENDPOINTS = {
  STATS: `${API_PREFIX}dashboard/stats`,
  CLASSES: `${API_PREFIX}dashboard/classes`,
  TODOS: `${API_PREFIX}dashboard/todos`,
  TODO_STATUS: (id: number | string) => `${API_PREFIX}dashboard/todos/${id}/status`,
  TODO_DELETE: (id: number | string) => `${API_PREFIX}dashboard/todos/${id}`,
  SCHEDULES: `${API_PREFIX}dashboard/schedules`,
  ENROLLMENT_TRENDS: `${API_PREFIX}dashboard/enrollment-trends`,
  CHANNEL_ANALYSIS: `${API_PREFIX}dashboard/channel-analysis`,
  CONVERSION_FUNNEL: `${API_PREFIX}dashboard/conversion-funnel`,
  ACTIVITIES: `${API_PREFIX}dashboard/activities`,
  OVERVIEW: `${API_PREFIX}dashboard/overview`,
  SYSTEM_STATUS: `${API_PREFIX}dashboard/real-time/system-status`,
  STATISTICS: `${API_PREFIX}dashboard/statistics`,
  STATISTICS_TABLE: `${API_PREFIX}dashboard/statistics/table`,
  STATISTICS_ENROLLMENT_TRENDS: `${API_PREFIX}dashboard/statistics/enrollment-trends`,
  STATISTICS_ACTIVITY_DATA: `${API_PREFIX}dashboard/statistics/activity-data`,
  NOTICES_STATS: `${API_PREFIX}dashboard/notices/stats`,
  NOTICES_IMPORTANT: `${API_PREFIX}dashboard/notices/important`,
  NOTICE_READ: (id: number | string) => `${API_PREFIX}dashboard/notices/${id}/read`,
  NOTICES_MARK_ALL_READ: `${API_PREFIX}dashboard/notices/mark-all-read`,
  NOTICE_DELETE: (id: number | string) => `${API_PREFIX}dashboard/notices/${id}`,
  QUICK_STATS: `${API_PREFIX}dashboard/quick-stats`,
  RECENT_ACTIVITIES: `${API_PREFIX}dashboard/recent-activities`,
  PERFORMANCE_METRICS: `${API_PREFIX}dashboard/performance-metrics`,
  ALERTS: `${API_PREFIX}dashboard/alerts`,
  WIDGET_DATA: (widget: string) => `${API_PREFIX}dashboard/widgets/${widget}`,
  // 新增统计端点
  GRADUATION_STATS: `${API_PREFIX}dashboard/graduation-stats`,
  PRE_ENROLLMENT_STATS: `${API_PREFIX}dashboard/pre-enrollment-stats`,
} as const;

// 通知管理接口
export const NOTIFICATION_ENDPOINTS = {
  BASE: `${API_PREFIX}notifications`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}notifications/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}notifications/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}notifications/${id}`,
  MARK_READ: (id: number | string) => `${API_PREFIX}notifications/${id}/read`,
  MARK_ALL_READ: `${API_PREFIX}notifications/mark-all-read`,
  GET_UNREAD: `${API_PREFIX}notifications/unread`,
  GET_RECENT: `${API_PREFIX}notifications/recent`,
  SEND: `${API_PREFIX}notifications/send`,
  BATCH_SEND: `${API_PREFIX}notifications/batch-send`,
  TEMPLATES: `${API_PREFIX}notifications/templates`,
  SETTINGS: `${API_PREFIX}notifications/settings`,
} as const;

// 待办事项接口
export const TODO_ENDPOINTS = {
  BASE: `${API_PREFIX}todos`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}todos/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}todos/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}todos/${id}`,
  UPDATE_STATUS: (id: number | string) => `${API_PREFIX}todos/${id}/status`,
  BATCH_UPDATE: `${API_PREFIX}todos/batch-update`,
  BATCH_DELETE: `${API_PREFIX}todos/batch-delete`,
  GET_MY_TODOS: `${API_PREFIX}todos/my`,
  GET_OVERDUE: `${API_PREFIX}todos/overdue`,
  STATISTICS: `${API_PREFIX}todos/statistics`,
} as const;

// 日程管理接口
export const SCHEDULE_ENDPOINTS = {
  BASE: `${API_PREFIX}schedules`,
  GET_BY_ID: (id: number | string) => `${API_PREFIX}schedules/${id}`,
  UPDATE: (id: number | string) => `${API_PREFIX}schedules/${id}`,
  DELETE: (id: number | string) => `${API_PREFIX}schedules/${id}`,
  GET_BY_DATE: (date: string) => `${API_PREFIX}schedules/date/${date}`,
  GET_BY_WEEK: (week: string) => `${API_PREFIX}schedules/week/${week}`,
  GET_BY_MONTH: (month: string) => `${API_PREFIX}schedules/month/${month}`,
  GET_CONFLICTS: `${API_PREFIX}schedules/conflicts`,
  BATCH_CREATE: `${API_PREFIX}schedules/batch-create`,
  EXPORT: `${API_PREFIX}schedules/export`,
} as const;