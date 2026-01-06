/**
 * 招生计划类型定义文件
 */

/**
 * 创建招生计划的数据传输对象
 */
export interface CreateEnrollmentPlanDto {
  name: string;
  year: number;
  term: string;
  startDate: string;
  endDate: string;
  targetCount: number;
  status?: string;
  description?: string;
  classIds?: number[];
  assigneeIds?: number[];
}

/**
 * 更新招生计划的数据传输对象
 */
export interface UpdateEnrollmentPlanDto extends Partial<CreateEnrollmentPlanDto> {
  id: number;
}

/**
 * 招生计划响应对象
 */
export interface EnrollmentPlanResponse {
  id: number;
  name: string;
  year: number;
  term: string;
  startDate: string;
  endDate: string;
  targetCount: number;
  status: string;
  description: string | null;
  actualCount: number;
  completionRate: number;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * 招生计划列表响应对象
 */
export interface EnrollmentPlanListResponse {
  total: number;
  items: EnrollmentPlanResponse[];
  page: number;
  pageSize: number;
}

/**
 * 招生计划详情响应对象
 */
export interface EnrollmentPlanDetailResponse extends EnrollmentPlanResponse {
  classes: {
    id: number;
    name: string;
  }[];
  assignees: {
    id: number;
    name: string;
  }[];
  creator: {
    id: number;
    name: string;
  };
  statistics: {
    totalApplications: number;
    approvedApplications: number;
    rejectedApplications: number;
    pendingApplications: number;
    conversionRate: number;
  };
}

/**
 * 招生计划过滤参数
 */
export interface EnrollmentPlanFilterParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  year?: number;
  term?: string;
  status?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 招生计划执行跟踪过滤参数
 */
export interface EnrollmentPlanTrackingFilterParams {
  planId: number;
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  assigneeId?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 招生计划班级关联传输对象
 */
export interface EnrollmentPlanClassDto {
  planId: number;
  classIds: number[];
}

/**
 * 招生计划分配人员传输对象
 */
export interface EnrollmentPlanAssigneeDto {
  planId: number;
  assigneeIds: number[];
}

/**
 * 招生计划完成统计响应对象
 */
export interface EnrollmentPlanStatisticsResponse {
  planId: number;
  planName: string;
  targetCount: number;
  actualCount: number;
  completionRate: number;
  dailyStatistics: {
    date: string;
    count: number;
    accumulatedCount: number;
  }[];
  weeklyStatistics: {
    weekStart: string;
    weekEnd: string;
    count: number;
    accumulatedCount: number;
  }[];
  sourceStatistics: {
    source: string;
    count: number;
    percentage: number;
  }[];
} 