/**
 * 移动端仪表盘API模块
 * 集成PC端仪表盘API的完整功能
 */

// 移动端使用PC端的request工具，通过相对路径导入
import { get, post, put, ApiResponse } from '../../utils/request'
import type { ListResponse } from '../types'

// ===== 接口类型定义 =====

/**
 * 任务统计
 */
export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
}

/**
 * 班级统计
 */
export interface ClassStats {
  total: number;
  todayClasses: number;
  studentsCount: number;
  completionRate: number;
}

/**
 * 活动统计
 */
export interface ActivityStats {
  upcoming: number;
  participating: number;
  thisWeek: number;
}

/**
 * 通知统计
 */
export interface NotificationStats {
  unread: number;
  total: number;
  urgent: number;
}

/**
 * 仪表盘统计数据
 */
export interface DashboardStats {
  tasks: TaskStats;
  classes: ClassStats;
  activities: ActivityStats;
  notifications: NotificationStats;
}

/**
 * 今日任务
 */
export interface TodayTask {
  id: number;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  completed: boolean;
  category?: string;
  description?: string;
}

/**
 * 今日课程
 */
export interface TodayCourse {
  id: number;
  time: string;
  className: string;
  subject: string;
  location: string;
  teacher?: string;
  status?: 'pending' | 'ongoing' | 'completed';
  duration?: number;
}

/**
 * 最新通知
 */
export interface RecentNotification {
  id: number;
  title: string;
  content?: string;
  createdAt: string;
  read: boolean;
  type: 'info' | 'warning' | 'error' | 'success';
  priority?: 'high' | 'medium' | 'low';
}

/**
 * 仪表盘数据
 */
export interface DashboardData {
  stats: DashboardStats;
  todayTasks: TodayTask[];
  todayCourses: TodayCourse[];
  recentNotifications: RecentNotification[];
}

/**
 * 综合统计概览
 */
export interface OverviewStats {
  students: number;
  teachers: number;
  classes: number;
  activities: number;
  revenue?: number;
  applications?: number;
}

/**
 * 趋势数据点
 */
export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * 趋势数据
 */
export interface TrendData {
  daily: TrendDataPoint[];
  weekly: TrendDataPoint[];
  monthly: TrendDataPoint[];
}

/**
 * 快速操作项
 */
export interface QuickAction {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  enabled: boolean;
  path?: string;
  action?: string;
  badge?: number;
}

/**
 * 实时数据
 */
export interface RealTimeData {
  onlineUsers: number;
  todayEnrollments: number;
  todayRevenue: number;
  systemLoad: number;
  activeClasses: number;
}

// ===== API 端点常量 =====

const MOBILE_DASHBOARD_ENDPOINTS = {
  BASE: '/api/dashboard',

  // 仪表盘数据 - 使用PC端API
  DASHBOARD_DATA: '/api/dashboard/overview',
  STATS: '/api/dashboard/stats',
  OVERVIEW: '/api/dashboard/overview',

  // 具体数据 - 使用PC端API
  TODAY_TASKS: '/api/todos',
  TODAY_COURSES: '/api/schedules',
  RECENT_NOTIFICATIONS: '/api/notifications',

  // 操作
  UPDATE_TASK_STATUS: '/api/todos',
  MARK_NOTIFICATION_READ: '/api/notifications',

  // 趋势数据
  TRENDS: '/api/dashboard/trends',
  REAL_TIME_DATA: '/api/dashboard/realtime',

  // 快速操作 - 模拟数据，实际可从权限系统获取
  QUICK_ACTIONS: '/api/dashboard/quick-actions'
} as const;

// ===== API 接口实现 =====

/**
 * 移动端仪表盘API类
 */
export class MobileDashboardAPI {
  private static instance: MobileDashboardAPI;

  public static getInstance(): MobileDashboardAPI {
    if (!MobileDashboardAPI.instance) {
      MobileDashboardAPI.instance = new MobileDashboardAPI();
    }
    return MobileDashboardAPI.instance;
  }

  /**
   * 获取仪表盘完整数据
   */
  async getDashboardData(): Promise<ApiResponse<DashboardData>> {
    try {
      console.log('📊 获取移动端仪表盘数据');

      const response = await get<DashboardData>(MOBILE_DASHBOARD_ENDPOINTS.DASHBOARD_DATA);

      console.log('✅ 仪表盘数据获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取仪表盘数据失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取统计数据
   */
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    try {
      console.log('📈 获取移动端统计数据');

      const response = await get<DashboardStats>(MOBILE_DASHBOARD_ENDPOINTS.STATS);

      console.log('✅ 统计数据获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取统计数据失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取概览数据
   */
  async getOverviewStats(): Promise<ApiResponse<OverviewStats>> {
    try {
      console.log('👁️ 获取移动端概览数据');

      const response = await get<OverviewStats>(MOBILE_DASHBOARD_ENDPOINTS.OVERVIEW);

      console.log('✅ 概览数据获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取概览数据失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取今日任务
   */
  async getTodayTasks(limit?: number): Promise<ApiResponse<TodayTask[]>> {
    try {
      console.log('📋 获取今日任务列表', { limit });

      const url = limit
        ? `${MOBILE_DASHBOARD_ENDPOINTS.TODAY_TASKS}?limit=${limit}`
        : MOBILE_DASHBOARD_ENDPOINTS.TODAY_TASKS;

      const response = await get<TodayTask[]>(url);

      console.log('✅ 今日任务获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取今日任务失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取今日课程
   */
  async getTodayCourses(): Promise<ApiResponse<TodayCourse[]>> {
    try {
      console.log('📚 获取今日课程列表');

      const response = await get<TodayCourse[]>(MOBILE_DASHBOARD_ENDPOINTS.TODAY_COURSES);

      console.log('✅ 今日课程获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取今日课程失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取最新通知
   */
  async getRecentNotifications(limit: number = 5): Promise<ApiResponse<RecentNotification[]>> {
    try {
      console.log('🔔 获取最新通知', { limit });

      const response = await get<RecentNotification[]>(
        `${MOBILE_DASHBOARD_ENDPOINTS.RECENT_NOTIFICATIONS}?limit=${limit}`
      );

      console.log('✅ 最新通知获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取最新通知失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 更新任务状态
   */
  async updateTaskStatus(taskId: number, completed: boolean): Promise<ApiResponse<TodayTask>> {
    try {
      console.log('✅ 更新任务状态', { taskId, completed });

      const response = await put<TodayTask>(
        `${MOBILE_DASHBOARD_ENDPOINTS.UPDATE_TASK_STATUS}/${taskId}/status`,
        { completed }
      );

      console.log('✅ 任务状态更新成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 更新任务状态失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 标记通知为已读
   */
  async markNotificationAsRead(notificationId: number): Promise<ApiResponse<any>> {
    try {
      console.log('📖 标记通知为已读', { notificationId });

      const response = await put<any>(
        `${MOBILE_DASHBOARD_ENDPOINTS.MARK_NOTIFICATION_READ}/${notificationId}/read`
      );

      console.log('✅ 通知标记成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 标记通知失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取趋势数据
   */
  async getTrends(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<ApiResponse<TrendData>> {
    try {
      console.log('📈 获取趋势数据', { period });

      const response = await get<TrendData>(
        `${MOBILE_DASHBOARD_ENDPOINTS.TRENDS}?period=${period}`
      );

      console.log('✅ 趋势数据获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取趋势数据失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取实时数据
   */
  async getRealTimeData(): Promise<ApiResponse<RealTimeData>> {
    try {
      console.log('⚡ 获取实时数据');

      const response = await get<RealTimeData>(MOBILE_DASHBOARD_ENDPOINTS.REAL_TIME_DATA);

      console.log('✅ 实时数据获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取实时数据失败:', error);
      throw this.handleError(error);
    }
  }

  /**
   * 获取快速操作列表
   */
  async getQuickActions(userRole?: string): Promise<ApiResponse<QuickAction[]>> {
    try {
      console.log('⚡ 获取快速操作列表', { userRole });

      const url = userRole
        ? `${MOBILE_DASHBOARD_ENDPOINTS.QUICK_ACTIONS}?role=${userRole}`
        : MOBILE_DASHBOARD_ENDPOINTS.QUICK_ACTIONS;

      const response = await get<QuickAction[]>(url);

      console.log('✅ 快速操作列表获取成功:', response);
      return response;

    } catch (error: any) {
      console.error('❌ 获取快速操作列表失败:', error);
      throw this.handleError(error);
    }
  }

  // ===== 私有辅助方法 =====

  /**
   * 错误处理
   */
  private handleError(error: any): Error {
    // 统一错误处理
    if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else if (error.message) {
      return new Error(error.message);
    } else {
      return new Error('移动端仪表盘服务异常');
    }
  }
}

// ===== 导出单例实例 =====

export const mobileDashboardAPI = MobileDashboardAPI.getInstance();

// ===== 导出便捷函数 =====

export const getDashboardData = () =>
  mobileDashboardAPI.getDashboardData();

export const getDashboardStats = () =>
  mobileDashboardAPI.getDashboardStats();

export const getOverviewStats = () =>
  mobileDashboardAPI.getOverviewStats();

export const getTodayTasks = (limit?: number) =>
  mobileDashboardAPI.getTodayTasks(limit);

export const getTodayCourses = () =>
  mobileDashboardAPI.getTodayCourses();

export const getRecentNotifications = (limit?: number) =>
  mobileDashboardAPI.getRecentNotifications(limit);

export const updateTaskStatus = (taskId: number, completed: boolean) =>
  mobileDashboardAPI.updateTaskStatus(taskId, completed);

export const markNotificationAsRead = (notificationId: number) =>
  mobileDashboardAPI.markNotificationAsRead(notificationId);

export const getTrends = (period?: 'daily' | 'weekly' | 'monthly') =>
  mobileDashboardAPI.getTrends(period);

export const getRealTimeData = () =>
  mobileDashboardAPI.getRealTimeData();

export const getQuickActions = (userRole?: string) =>
  mobileDashboardAPI.getQuickActions(userRole);

// ===== 兼容性导出 =====
// 为了与PC端API保持一致，导出兼容的函数名

export const getDashboardStatistics = getDashboardStats;
export const getTodaySchedule = getTodayCourses;

// ===== 导出类型定义 =====

export type {
  TaskStats,
  ClassStats,
  ActivityStats,
  NotificationStats,
  DashboardStats,
  TodayTask,
  TodayCourse,
  RecentNotification,
  DashboardData,
  OverviewStats,
  TrendDataPoint,
  TrendData,
  QuickAction,
  RealTimeData
};

// 默认导出
export default mobileDashboardAPI;