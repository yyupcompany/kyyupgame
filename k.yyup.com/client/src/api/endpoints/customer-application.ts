import { request } from '@/utils/request';

/**
 * 客户申请状态
 */
export enum CustomerApplicationStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

/**
 * 客户申请接口
 */
export interface CustomerApplication {
  id: number;
  customerId: number;
  teacherId: number;
  principalId?: number;
  kindergartenId?: number;
  status: CustomerApplicationStatus;
  applyReason?: string;
  rejectReason?: string;
  appliedAt: string;
  reviewedAt?: string;
  customer?: {
    id: number;
    name: string;
    phone: string;
    source?: string;
    follow_status?: string;
    assigned_teacher_id?: number;
  };
  teacher?: {
    id: number;
    username: string;
    real_name?: string;
    phone?: string;
  };
  principal?: {
    id: number;
    username: string;
    real_name?: string;
  };
}

/**
 * 申请客户参数
 */
export interface ApplyCustomersParams {
  customerIds: number[];
  applyReason?: string;
}

/**
 * 申请结果
 */
export interface ApplyCustomersResult {
  successCount: number;
  failedCount: number;
  applicationIds: number[];
  failedCustomers: Array<{
    customerId: number;
    reason: string;
  }>;
}

/**
 * 查询申请列表参数
 */
export interface GetApplicationsParams {
  status?: CustomerApplicationStatus | string;
  teacherId?: number;
  customerId?: number;
  page?: number;
  pageSize?: number;
}

/**
 * 申请列表响应
 */
export interface ApplicationListResponse {
  items: CustomerApplication[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 审批申请参数
 */
export interface ReviewApplicationParams {
  action: 'approve' | 'reject';
  rejectReason?: string;
}

/**
 * 批量审批参数
 */
export interface BatchReviewParams {
  applicationIds: number[];
  action: 'approve' | 'reject';
  rejectReason?: string;
}

/**
 * 批量审批结果
 */
export interface BatchReviewResult {
  successCount: number;
  failedCount: number;
  failedApplications: Array<{
    applicationId: number;
    reason: string;
  }>;
}

/**
 * 申请统计
 */
export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

/**
 * 客户申请API
 */
export const customerApplicationApi = {
  /**
   * 教师申请客户（支持批量）
   */
  applyForCustomers(params: ApplyCustomersParams) {
    return request.post<ApplyCustomersResult>('/api/teacher/customer-applications', params);
  },

  /**
   * 获取教师的申请记录
   */
  getTeacherApplications(params?: GetApplicationsParams) {
    return request.get<ApplicationListResponse>('/api/teacher/customer-applications', { params });
  },

  /**
   * 获取园长待审批的申请列表
   */
  getPrincipalApplications(params?: GetApplicationsParams) {
    return request.get<ApplicationListResponse>('/api/principal/customer-applications', { params });
  },

  /**
   * 园长审批申请
   */
  reviewApplication(id: number, params: ReviewApplicationParams) {
    return request.post<CustomerApplication>(`/api/principal/customer-applications/${id}/review`, params);
  },

  /**
   * 批量审批申请
   */
  batchReviewApplications(params: BatchReviewParams) {
    return request.post<BatchReviewResult>('/api/principal/customer-applications/batch-review', params);
  },

  /**
   * 获取申请详情
   */
  getApplicationDetail(id: number) {
    return request.get<CustomerApplication>(`/api/customer-applications/${id}`);
  },

  /**
   * 获取申请统计
   */
  getApplicationStats() {
    return request.get<ApplicationStats>('/api/customer-applications/stats');
  },
};

export default customerApplicationApi;

