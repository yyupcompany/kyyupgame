import { request } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

/**
 * 业务中心API模块
 */

// API端点常量
export const BUSINESS_CENTER_ENDPOINTS = {
  OVERVIEW: `${API_PREFIX}/business-center/overview`,
  TIMELINE: `${API_PREFIX}/business-center/timeline`,
  ENROLLMENT_PROGRESS: `${API_PREFIX}/business-center/enrollment-progress`,
  STATISTICS: `${API_PREFIX}/business-center/statistics`,
  DASHBOARD: `${API_PREFIX}/business-center/dashboard`,
  TEACHING_INTEGRATION: `${API_PREFIX}/business-center/teaching-integration`,
  UI_CONFIG: `${API_PREFIX}/business-center/ui-config`
} as const

// 业务中心概览数据接口
export interface BusinessCenterOverview {
  teachingCenter: {
    total_plans: number
    active_plans: number
    completed_plans: number
    overall_achievement_rate: number
    overall_completion_rate: number
    total_sessions: number
    completed_sessions: number
    confirmed_sessions: number
    plans_with_media: number
  }
  enrollment: {
    target: number
    current: number
    applications: number
    approved: number
  }
  personnel: {
    teachers: number
    students: number
    parents: number
    classes: number
  }
  activities: {
    total: number
    ongoing: number
    completed: number
    upcoming: number
  }
  system: {
    uptime: string
    modules: number
    configItems: number
    lastBackup: string
  }
  lastUpdated: string
}

// 业务流程时间线项目接口
export interface TimelineItem {
  id: string
  title: string
  description: string
  icon: string
  status: 'completed' | 'in-progress' | 'pending'
  progress: number
  assignee?: string
  deadline?: string
  detailDescription: string
  metrics?: Array<{
    key: string
    label: string
    value: string | number
  }>
  recentOperations?: Array<{
    id: string
    time: string
    content: string
    user: string
  }>
}

// 招生进度数据接口
export interface EnrollmentProgress {
  target: number
  current: number
  percentage: number
  milestones: Array<{
    id: string
    label: string
    position: number
    target: number
  }>
}

// 业务中心仪表板数据接口
export interface BusinessCenterDashboard {
  overview: BusinessCenterOverview
  timeline: TimelineItem[]
  enrollmentProgress: EnrollmentProgress
  meta: {
    responseTime: number
    lastUpdated: string
    dataVersion: string
  }
}

// 业务中心统计数据接口
export interface BusinessCenterStatistics {
  teachingCenter: {
    totalPlans: number
    activePlans: number
    achievementRate: number
    completionRate: number
  }
  enrollment: {
    target: number
    current: number
    completionRate: number
    applications: number
  }
  personnel: {
    teachers: number
    students: number
    classes: number
    parents: number
  }
  activities: {
    total: number
    ongoing: number
    completed: number
    upcoming: number
  }
  system: {
    uptime: string
    modules: number
    configItems: number
    lastBackup: string
  }
}

// 教学中心集成数据接口
export interface TeachingIntegration {
  summary: {
    totalPlans: number
    activePlans: number
    completedPlans: number
    achievementRate: number
    completionRate: number
  }
  progress: {
    totalSessions: number
    completedSessions: number
    confirmedSessions: number
    plansWithMedia: number
  }
  status: string
  lastUpdated: string
}

// UI配置数据接口
export interface UIConfig {
  progressColors: {
    excellent: number  // 优秀阈值
    good: number       // 良好阈值
    warning: number    // 警告阈值
  }
  milestones: {
    default: number[]  // 默认里程碑百分比
  }
  colors: {
    excellent: string  // 优秀颜色
    good: string       // 良好颜色
    warning: string    // 警告颜色
    default: string    // 默认颜色
  }
}

/**
 * 业务中心API服务类
 */
export class BusinessCenterService {

  /**
   * 获取业务中心概览数据
   */
  static async getOverview(): Promise<BusinessCenterOverview> {
    try {
      const response = await request.get(BUSINESS_CENTER_ENDPOINTS.OVERVIEW)
      return response.data
    } catch (error) {
      console.error('获取业务中心概览数据失败:', error)
      throw error
    }
  }

  /**
   * 获取业务流程时间线数据
   */
  static async getTimeline(): Promise<TimelineItem[]> {
    try {
      // 业务中心聚合数据可能较慢：单独放宽超时，避免误判为“端点不对齐”
      const response = await request.get(BUSINESS_CENTER_ENDPOINTS.TIMELINE, { timeout: 30000 })
      return response.data.timelineItems
    } catch (error) {
      console.error('获取业务流程时间线数据失败:', error)
      throw error
    }
  }

  /**
   * 获取招生进度数据
   */
  static async getEnrollmentProgress(): Promise<EnrollmentProgress> {
    try {
      // 业务中心聚合数据可能较慢：单独放宽超时，避免误判为“端点不对齐”
      const response = await request.get(BUSINESS_CENTER_ENDPOINTS.ENROLLMENT_PROGRESS, { timeout: 30000 })
      return response.data
    } catch (error) {
      console.error('获取招生进度数据失败:', error)
      throw error
    }
  }

  /**
   * 获取业务中心统计数据
   */
  static async getStatistics(): Promise<BusinessCenterStatistics> {
    try {
      const response = await request.get(BUSINESS_CENTER_ENDPOINTS.STATISTICS)
      return response.data
    } catch (error) {
      console.error('获取业务中心统计数据失败:', error)
      throw error
    }
  }

  /**
   * 获取业务中心仪表板数据（聚合接口）
   */
  static async getDashboard(): Promise<BusinessCenterDashboard> {
    try {
      const response = await request.get(BUSINESS_CENTER_ENDPOINTS.DASHBOARD)
      return response.data
    } catch (error) {
      console.error('获取业务中心仪表板数据失败:', error)
      throw error
    }
  }

  /**
   * 获取教学中心集成数据
   */
  static async getTeachingIntegration(): Promise<TeachingIntegration> {
    try {
      const response = await request.get(BUSINESS_CENTER_ENDPOINTS.TEACHING_INTEGRATION)
      return response.data
    } catch (error) {
      console.error('获取教学中心集成数据失败:', error)
      throw error
    }
  }

  /**
   * 获取UI配置数据
   */
  static async getUIConfig(): Promise<UIConfig> {
    try {
      const response = await request.get(BUSINESS_CENTER_ENDPOINTS.UI_CONFIG)
      return response.data
    } catch (error) {
      console.error('获取UI配置数据失败:', error)
      throw error
    }
  }
}
