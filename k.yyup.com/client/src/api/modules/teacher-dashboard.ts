import { get, post, put } from '@/utils/request'

// 接口类型定义
export interface TaskStats {
  total: number
  completed: number
  pending: number
  overdue: number
}

export interface ClassStats {
  total: number
  todayClasses: number
  studentsCount: number
  completionRate: number
}

export interface ActivityStats {
  upcoming: number
  participating: number
  thisWeek: number
}

export interface NotificationStats {
  unread: number
  total: number
  urgent: number
}

export interface DashboardStats {
  tasks: TaskStats
  classes: ClassStats
  activities: ActivityStats
  notifications: NotificationStats
}

export interface TodayTask {
  id: number
  title: string
  priority: string
  deadline: string
  completed: boolean
}

export interface TodayCourse {
  id: number
  time: string
  className: string
  subject: string
  location: string
}

export interface RecentNotification {
  id: number
  title: string
  createdAt: string
  read: boolean
}

export interface DashboardData {
  stats: DashboardStats
  todayTasks: TodayTask[]
  todayCourses: TodayCourse[]
  recentNotifications: RecentNotification[]
}

export interface ActivityStatisticsOverview {
  totalActivities: number
  publishedActivities: number
  draftActivities: number
  cancelledActivities: number
  totalRegistrations: number
  totalCheckins: number
  avgCheckinRate: number
}

export interface ActivityTrend {
  date: string
  count: number
}

export interface ActivityStatisticsData {
  overview: ActivityStatisticsOverview
  trends: ActivityTrend[]
}

export interface ClockRecord {
  teacherId: number
  type: 'in' | 'out'
  timestamp: Date
  location: string
  message: string
}

// API 端点
const TEACHER_DASHBOARD_ENDPOINTS = {
  DASHBOARD: '/teacher-dashboard/dashboard',
  STATISTICS: '/teacher-dashboard/statistics',
  TODAY_TASKS: '/teacher-dashboard/today-tasks',
  TODAY_COURSES: '/teacher-dashboard/today-courses',
  RECENT_NOTIFICATIONS: '/teacher-dashboard/recent-notifications',
  UPDATE_TASK_STATUS: '/teacher-dashboard/tasks',
  CLOCK_IN: '/teacher-dashboard/clock-in'
}

/**
 * 获取教师工作台数据
 */
export const getTeacherDashboardData = () => {
  return get<DashboardData>(TEACHER_DASHBOARD_ENDPOINTS.DASHBOARD)
}

/**
 * 获取教师统计数据
 */
export const getTeacherStatistics = () => {
  return get<DashboardStats>(TEACHER_DASHBOARD_ENDPOINTS.STATISTICS)
}

/**
 * 获取仪表盘统计数据 (别名)
 */
export const getDashboardStatistics = getTeacherStatistics

/**
 * 获取今日日程安排
 */
export const getTodaySchedule = () => {
  return get<TodayCourse[]>(TEACHER_DASHBOARD_ENDPOINTS.TODAY_COURSES)
}

/**
 * 获取教师活动统计数据
 */
export const getTeacherActivityStatistics = () => {
  return get<ActivityStatisticsData>('/teacher-dashboard/activity-statistics')
}

/**
 * 获取今日任务
 */
export const getTodayTasks = () => {
  return get<TodayTask[]>(TEACHER_DASHBOARD_ENDPOINTS.TODAY_TASKS)
}

/**
 * 获取今日课程
 */
export const getTodayCourses = () => {
  return get<TodayCourse[]>(TEACHER_DASHBOARD_ENDPOINTS.TODAY_COURSES)
}

/**
 * 获取最新通知
 */
export const getRecentNotifications = (limit: number = 5) => {
  return get<RecentNotification[]>(
    `${TEACHER_DASHBOARD_ENDPOINTS.RECENT_NOTIFICATIONS}?limit=${limit}`
  )
}

/**
 * 更新任务状态
 */
export const updateTaskStatus = (taskId: number, completed: boolean) => {
  return put<TodayTask>(
    `${TEACHER_DASHBOARD_ENDPOINTS.UPDATE_TASK_STATUS}/${taskId}/status`,
    { completed }
  )
}

/**
 * 快速打卡
 */
export const clockIn = (type: 'in' | 'out') => {
  return post<ClockRecord>(TEACHER_DASHBOARD_ENDPOINTS.CLOCK_IN, { type })
}

// 导出端点常量供其他模块使用
export { TEACHER_DASHBOARD_ENDPOINTS }
