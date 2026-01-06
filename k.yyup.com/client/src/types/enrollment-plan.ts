/**
 * 招生计划状态
 */
export type EnrollmentPlanStatus = 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';

/**
 * 招生计划基本信息
 */
export interface EnrollmentPlan {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: EnrollmentPlanStatus;
  targetCount: number;
  appliedCount: number;
  admittedCount: number;
  enrolledCount: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 招生计划创建请求
 */
export interface EnrollmentPlanCreateRequest {
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  targetCount: number;
}

/**
 * 招生计划更新请求
 */
export interface EnrollmentPlanUpdateRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  targetCount?: number;
  status?: EnrollmentPlanStatus;
}

/**
 * 招生计划详情（包含关联数据）
 */
export interface EnrollmentPlanDetail extends EnrollmentPlan {
  quotas?: Array<{
    id: string;
    grade: string;
    targetCount: number;
    appliedCount: number;
    admittedCount: number;
    enrolledCount: number;
  }>;
  applications?: Array<{
    id: string;
    studentName: string;
    grade: string;
    status: string;
    appliedAt: string;
    updatedAt: string;
  }>;
  timeline?: Array<{
    id: string;
    title: string;
    description: string;
    startDate: string;
    endDate: string;
    status: string;
  }>;
} 