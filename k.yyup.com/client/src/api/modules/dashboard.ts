// 仪表盘模块API服务
import request from '../../utils/request';
import type { ApiResponse } from '../../utils/request';
import { DASHBOARD_ENDPOINTS } from '../endpoints';
import { transformListResponse, transformTodoData, transformDashboardStats, transformScheduleData, transformActivityData } from '../../utils/dataTransform';

/**
 * 仪表盘统计数据接口 - 对齐后端API响应
 */
export interface DashboardStats {
  // 后端 /api/dashboard/stats 返回的字段
  userCount: number;
  kindergartenCount: number;
  studentCount: number;
  enrollmentCount: number;
  activityCount: number;
  teacherCount: number;
  classCount: number;
  // 可选的计算字段
  enrollmentRate?: number;
  attendanceRate?: number;
  graduationRate?: number;
}

/**
 * 仪表盘概览数据接口 - 对齐后端 /api/dashboard/overview
 */
export interface DashboardOverview {
  totalUsers: number;
  totalKindergartens: number;
  totalStudents: number;
  totalApplications: number;
  recentActivities: RecentActivity[];
}

/**
 * 近期活动接口
 */
export interface RecentActivity {
  id: number;
  type: string;
  description: string;
  time: string;
}

/**
 * 待办事项状态
 */
export enum TodoStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  IN_PROGRESS = 'in_progress'
}

/**
 * 待办事项接口
 */
export interface Todo {
  id: number;
  title: string;
  content?: string;
  status: TodoStatus;
  priority: number;
  dueDate?: Date;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 日程接口
 */
export interface Schedule {
  id: number;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 班级概览接口
 */
export interface ClassOverview {
  id: string;
  name: string;
  capacity: number;
  enrolled: number;
  ageGroup: string;
  teacherCount: number;
}

/**
 * 招生趋势点接口
 */
export interface EnrollmentTrendPoint {
  date: string;
  count: number;
}

/**
 * 招生趋势接口
 */
export interface EnrollmentTrend {
  trends: EnrollmentTrendPoint[];
  distribution: {
    age3: number;
    age4: number;
    age5: number;
    age6: number;
  };
}

/**
 * 活动数据接口
 */
export interface ActivityData {
  activityName: string;
  participantCount: number;
  completionRate: number;
}

/**
 * 频道分析接口
 */
export interface ChannelAnalysis {
  channelName: string;
  count: number;
  conversionRate: number;
}

/**
 * 转化漏斗接口
 */
export interface ConversionFunnel {
  stage: string;
  count: number;
  conversionRate: number;
}

/**
 * 获取仪表盘统计数据
 * @returns {Promise<ApiResponse<DashboardStats>>} 仪表盘统计数据
 */
export const getDashboardStats = () => {
  return request.get(DASHBOARD_ENDPOINTS.STATS).then(response => {
    // 使用数据转换层处理响应
    if (response.data) {
      response.data = transformDashboardStats(response.data);
    }
    return response;
  });
};

/**
 * 获取仪表盘概览数据
 * @returns {Promise<ApiResponse<DashboardOverview>>} 仪表盘概览数据
 */
export const getDashboardOverview = () => {
  return request.get(DASHBOARD_ENDPOINTS.OVERVIEW);
};

/**
 * 获取待办事项列表
 * @param params 查询参数
 * @returns Promise - 后端返回分页格式 {items: Todo[], total: number, page: number, pageSize: number, totalPages: number}
 */
export function getTodos(params?: {
  status?: TodoStatus;
  page?: number;
  pageSize?: number;
}): Promise<ApiResponse<{
  items: Todo[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return request.get(DASHBOARD_ENDPOINTS.TODOS, params).then(response => {
    // 使用数据转换层处理响应
    return transformListResponse(response, transformTodoData);
  });
}

/**
 * 获取日程列表
 * @param params 查询参数
 * @returns Promise
 */
export function getSchedules(params?: {
  startDate?: Date;
  endDate?: Date;
}): Promise<ApiResponse<Schedule[]>> {
  return request.get(DASHBOARD_ENDPOINTS.SCHEDULES, params).then(response => {
    // 转换响应数据
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(transformScheduleData);
    }
    return response;
  });
}

/**
 * 获取班级概览
 * @returns {Promise<ApiResponse<ClassOverview[]>>} 班级概览数据
 */
export const getClassesOverview = () => {
  return request.get(DASHBOARD_ENDPOINTS.CLASSES);
};

/**
 * 获取招生趋势
 * @param params 查询参数
 * @returns {Promise<ApiResponse<EnrollmentTrend>>} 招生趋势数据
 */
export const getEnrollmentTrends = (params?: { period?: string }) => {
  return request.get(DASHBOARD_ENDPOINTS.ENROLLMENT_TRENDS, params);
};

/**
 * 获取活动数据
 * @param params 查询参数
 * @returns {Promise<ApiResponse<ActivityData[]>>} 活动数据
 */
export const getActivityData = (params?: { period?: string }) => {
  return request.get(DASHBOARD_ENDPOINTS.ACTIVITIES, params).then(response => {
    // 转换响应数据
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(transformActivityData);
    }
    return response;
  });
};

/**
 * 获取渠道分析
 * @param params 查询参数
 * @returns {Promise<ApiResponse<ChannelAnalysis[]>>} 渠道分析数据
 */
export const getChannelAnalysis = (params?: { period?: string }) => {
  return request.get(DASHBOARD_ENDPOINTS.CHANNEL_ANALYSIS, params);
};

/**
 * 获取转化漏斗
 * @param params 查询参数
 * @returns {Promise<ApiResponse<ConversionFunnel[]>>} 转化漏斗数据
 */
export const getConversionFunnel = (params?: { period?: string }) => {
  return request.get(DASHBOARD_ENDPOINTS.CONVERSION_FUNNEL, params);
};

/**
 * 获取近期活动
 * @param params 查询参数
 * @returns {Promise<ApiResponse<any[]>>} 近期活动数据
 */
export const getRecentActivities = (params?: { limit?: number }) => {
  return request.get(DASHBOARD_ENDPOINTS.ACTIVITIES, params).then(response => {
    // 转换响应数据
    if (response.data && Array.isArray(response.data)) {
      response.data = response.data.map(transformActivityData);
    }
    return response;
  });
};

/**
 * 毕业统计数据接口
 */
export interface GraduationStats {
  label: string;        // 毕业时间标签，如 "2025年9月"
  year: number;         // 毕业年份
  count: number;        // 毕业人数
  month: number;        // 毕业月份 (9)
}

/**
 * 预报名统计数据接口
 */
export interface PreEnrollmentStats {
  spring: {
    label: string;      // 春季标签，如 "2025年3月"
    year: number;       // 年份
    month: number;      // 月份 (3)
    semester: number;   // 学期 (1=春季)
    count: number;      // 预报名人数
  };
  autumn: {
    label: string;      // 秋季标签，如 "2025年9月"
    year: number;       // 年份
    month: number;      // 月份 (9)
    semester: number;   // 学期 (2=秋季)
    count: number;      // 预报名人数
  };
}

/**
 * 获取即将毕业人数统计
 * @returns {Promise<ApiResponse<GraduationStats>>} 毕业统计数据
 */
export const getGraduationStats = () => {
  return request.get<GraduationStats>(DASHBOARD_ENDPOINTS.GRADUATION_STATS);
};

/**
 * 获取预报名人数统计
 * @returns {Promise<ApiResponse<PreEnrollmentStats>>} 预报名统计数据
 */
export const getPreEnrollmentStats = () => {
  return request.get<PreEnrollmentStats>(DASHBOARD_ENDPOINTS.PRE_ENROLLMENT_STATS);
};

/**
 * 更新待办事项状态
 * @param id 待办事项ID
 * @param status 新状态
 * @returns {Promise<ApiResponse<Todo>>} 更新后的待办事项
 */
export const updateTodoStatus = (id: number, status: TodoStatus) => {
  return request.patch(DASHBOARD_ENDPOINTS.TODO_STATUS(id), { status });
};

/**
 * 删除待办事项
 * @param id 待办事项ID
 * @returns {Promise<ApiResponse<void>>} 删除结果
 */
export const deleteTodo = (id: number) => {
  return request.delete(DASHBOARD_ENDPOINTS.TODO_DELETE(id));
}; 