/**
 * 招生管理模块的类型定义
 */

// 招生计划接口
export interface EnrollmentPlan {
  id: number;
  name: string;
  code?: string;
  year: number;
  term: string;
  startDate: string;
  endDate: string;
  targetCount: number;
  actualCount?: number;
  kindergartenId: number;
  kindergartenName?: string;
  status: EnrollmentPlanStatus;
  description?: string;
  ageRequirement?: string;
  remarks?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 招生计划状态枚举
export enum EnrollmentPlanStatus {
  DRAFT = 'DRAFT',     // 草稿
  ACTIVE = 'ACTIVE',   // 活动中
  PAUSED = 'PAUSED',   // 已暂停
  COMPLETED = 'COMPLETED', // 已完成
  CANCELLED = 'CANCELLED'  // 已取消
}

// 招生计划查询参数
export interface EnrollmentPlanQueryParams {
  keyword?: string;
  status?: EnrollmentPlanStatus;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  page?: number;
  pageSize?: number;
  size?: number;
  name?: string;
  startDate?: string;
  endDate?: string;
  kindergartenId?: number;
  year?: number;
}

// Additional types for testing and clean architecture
export interface QuotaStats {
  totalQuota: number
  usedQuota: number
  availableQuota: number
  utilizationRate: number
  ageGroups?: AgeGroupQuota[]
}

export interface AgeGroupQuota {
  ageGroup: string
  totalQuota: number
  usedQuota: number
}

export interface FormValidationResult {
  isValid: boolean
  errors: string[]
  term?: string;
}

// 招生计划分页结果
export interface EnrollmentPlanPaginationResult {
  data: EnrollmentPlan[];
  total: number;
  page: number;
  size: number;
}

// 招生名额实体
export interface EnrollmentQuota {
  id: number;
  planId: number;
  className: string;
  ageRange: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  usageRate: number;
  lastUpdated: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

// 招生名额查询参数
export interface EnrollmentQuotaQueryParams {
  planId?: number;
  className?: string;
  page?: number;
  pageSize?: number;
  ageRange?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// 招生名额创建/更新请求
export interface EnrollmentQuotaRequest {
  planId: number;
  className: string;
  ageRange: string;
  totalQuota: number;
}

// 批量创建招生名额请求
export interface BatchEnrollmentQuotaRequest {
  planId: number;
  quotas: Array<{
    className: string;
    ageRange: string;
    totalQuota: number;
  }>;
}

// 招生计划统计信息
export interface EnrollmentPlanStatistics {
  totalApplications: number;
  pendingApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  enrolledStudents: number;
  totalConsultations: number;
  conversionRate: number;
  dailyApplications: Array<{
    date: string;
    count: number;
  }>;
  sourceDistribution: Array<{
    source: string;
    count: number;
    percentage: number;
  }>;
  ageDistribution: Array<{
    ageRange: string;
    count: number;
    percentage: number;
  }>;
}

// 班级汇总信息
export interface ClassSummary {
  classId: number;
  className: string;
  totalQuota: number;     // 总名额
  usedQuota: number;      // 已使用名额
  remainingQuota: number; // 剩余名额
  usageRate: number;      // 使用率
}

// 渠道汇总信息
export interface ChannelSummary {
  channelId: number;
  channelName: string;
  applicationCount: number; // 申请人数
  admissionCount: number;   // 录取人数
  conversionRate: number;   // 转化率
}

// 每日申请数据
export interface DailyApplication {
  date: string;
  count: number;
}

// 计划跟踪记录
export interface EnrollmentTracking {
  id: number;
  planId: number;
  content: string;
  createdBy: number;
  createdByName: string;
  createdAt: string;
}

// 添加计划跟踪记录请求
export interface AddTrackingRequest {
  content: string;
}

// 招生记录
export interface EnrollmentRecord {
  id: number;
  planId: number;
  childName: string;
  parentName: string;
  contactPhone: string;
  status: number;
  createdAt: string;
  updatedAt: string;
  assigneeIds: number[];
}

// 批量调整名额请求参数
export interface BatchAdjustQuotaParams {
  quotaIds: number[];
  adjustmentType: 'increase' | 'decrease';
  adjustmentValue: number;
  reason?: string;
}

// 班级名额汇总
export interface ClassQuotaSummary {
  classId: number;
  className: string;
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  usageRate: number;
}

// 每日记录
export interface DailyRecord {
  date: string;
  count: number;
}

// 创建招生计划请求
export interface CreateEnrollmentPlanRequest {
  kindergartenId: number;
  name: string;
  startDate: string;
  endDate: string;
  targetCount: number;
  description?: string;
  status?: EnrollmentPlanStatus;
  year: number;
  term: string;
  ageRequirement?: string;
  remarks?: string;
}

// 更新招生计划请求
export interface UpdateEnrollmentPlanRequest {
  name?: string;
  startDate?: string;
  endDate?: string;
  targetCount?: number;
  description?: string;
  status?: EnrollmentPlanStatus;
  year?: number;
  term?: string;
  ageRequirement?: string;
  remarks?: string;
}

// 设置招生计划班级请求
export interface SetEnrollmentPlanClassesRequest {
  classIds: number[];
}

// 设置招生计划负责人请求
export interface SetEnrollmentPlanAssigneesRequest {
  assigneeIds: number[];
}

// 招生名额调整记录
export interface QuotaAdjustmentRecord {
  id: number;
  quotaId: number;
  adjustmentType: 'increase' | 'decrease';
  adjustmentValue: number;
  beforeValue: number;
  afterValue: number;
  reason: string;
  operatorId: number;
  operatorName: string;
  createdAt: string;
  planId?: number;
  previousQuota?: number;
  newQuota?: number;
  adjustment?: number;
  createdBy?: number;
}

// 招生名额统计
export interface EnrollmentQuotaStatistics {
  totalQuota: number;
  usedQuota: number;
  remainingQuota: number;
  usageRate: number;
  ageGroupStats: Array<{
    ageRange: string;
    totalQuota: number;
    usedQuota: number;
    remainingQuota: number;
    usageRate: number;
  }>;
}

// 招生计划请求
export interface EnrollmentPlanRequest {
  name: string;
  year: number;
  semester: 'spring' | 'autumn' | 'winter' | 'summer';
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  description?: string;
} 