import { get, post, ApiResponse } from '@/utils/request';

/**
 * 统计时间范围
 */
export enum StatisticsPeriod {
  DAILY = 'daily',
  WEEKLY = 'weekly', 
  MONTHLY = 'monthly',
  YEARLY = 'yearly'
}

/**
 * 统计数据点
 */
export interface StatisticsDataPoint {
  date: string;
  value: number;
  label?: string;
}

/**
 * 招生统计
 */
export interface EnrollmentStatistics {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  trends: StatisticsDataPoint[];
}

/**
 * 学生统计
 */
export interface StudentStatistics {
  total: number;
  byAge: Record<string, number>;
  byGender: Record<string, number>;
  byClass: Record<string, number>;
  trends: StatisticsDataPoint[];
}

/**
 * 教师统计
 */
export interface TeacherStatistics {
  total: number;
  active: number;
  onLeave: number;
  byDepartment: Record<string, number>;
  bySubject: Record<string, number>;
  trends: StatisticsDataPoint[];
}

/**
 * 收入统计
 */
export interface RevenueStatistics {
  total: number;
  byMonth: StatisticsDataPoint[];
  bySource: Record<string, number>;
  trends: StatisticsDataPoint[];
}

/**
 * 活动统计
 */
export interface ActivityStatistics {
  total: number;
  published: number;
  draft: number;
  participation: StatisticsDataPoint[];
}

/**
 * 综合仪表盘统计
 */
export interface DashboardStatistics {
  enrollment: EnrollmentStatistics;
  students: StudentStatistics;
  revenue: RevenueStatistics;
  activities: ActivityStatistics;
}

/**
 * 统计查询参数
 */
export interface StatisticsQueryParams {
  startDate?: string;
  endDate?: string;
  period?: StatisticsPeriod;
  kindergartenId?: string;
  classId?: string;
}

/**
 * 统计分析API
 */
export const statisticsApi = {
  /**
   * 获取仪表盘统计
   */
  getDashboardStatistics(params?: StatisticsQueryParams): Promise<ApiResponse<DashboardStatistics>> {
    return get('/api/statistics/dashboard', params ? { params } : undefined);
  },

  /**
   * 获取招生统计
   */
  getEnrollmentStatistics(params?: StatisticsQueryParams): Promise<ApiResponse<EnrollmentStatistics>> {
    return get('/api/statistics/enrollment', params ? { params } : undefined);
  },

  /**
   * 获取学生统计
   */
  getStudentStatistics(params?: StatisticsQueryParams): Promise<ApiResponse<StudentStatistics>> {
    return get('/api/statistics/students', params ? { params } : undefined);
  },

  /**
   * 获取收入统计
   */
  getTeacherStatistics(params?: StatisticsQueryParams): Promise<ApiResponse<TeacherStatistics>> {
    return get('/api/statistics/teachers', params ? { params } : undefined);
  },

  /**
   * 获取活动统计
   */
  getActivityStatistics(params?: StatisticsQueryParams): Promise<ApiResponse<ActivityStatistics>> {
    return get('/api/statistics/activities', params ? { params } : undefined);
  },

  /**
   * 生成统计报告
   */
  generateReport(data: {
    type: 'enrollment' | 'student' | 'revenue' | 'activity';
    format: 'pdf' | 'excel';
    params: StatisticsQueryParams;
  }): Promise<ApiResponse<{ downloadUrl: string }>> {
    return post('/api/statistics/reports', data);
  },

  /**
   * 获取收入统计
   */
  getRevenueStatistics(params?: StatisticsQueryParams): Promise<ApiResponse<RevenueStatistics>> {
    return get('/api/statistics/revenue', params ? { params } : undefined);
  },

  /**
   * 获取实时统计
   */
  getRealTimeStatistics(): Promise<ApiResponse<{
    onlineUsers: number;
    todayEnrollments: number;
    todayRevenue: number;
    systemLoad: number;
  }>> {
    return get('/api/statistics/realtime');
  }
};

// 兼容性导出
export const getDashboardStatistics = statisticsApi.getDashboardStatistics;
export const getEnrollmentStatistics = statisticsApi.getEnrollmentStatistics;
export const getStudentStatistics = statisticsApi.getStudentStatistics;
export const getTeacherStatistics = statisticsApi.getTeacherStatistics;
export const getRevenueStatistics = statisticsApi.getRevenueStatistics;
export const getActivityStatistics = statisticsApi.getActivityStatistics;