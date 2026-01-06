/**
 * 招生名额类型定义文件
 */

/**
 * 创建招生名额的数据传输对象
 */
export interface CreateEnrollmentQuotaDto {
  planId: number;
  classId: number;
  totalQuota: number;
  usedQuota?: number;
  reservedQuota?: number;
  remark?: string;
}

/**
 * 更新招生名额的数据传输对象
 */
export interface UpdateEnrollmentQuotaDto extends Partial<Omit<CreateEnrollmentQuotaDto, 'planId' | 'classId'>> {
  id: number;
}

/**
 * 招生名额响应对象
 */
export interface EnrollmentQuotaResponse {
  id: number;
  planId: number;
  classId: number;
  totalQuota: number;
  usedQuota: number;
  reservedQuota: number;
  availableQuota: number;
  remark: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: {
    id: number;
    name: string;
    year: number;
    term: string;
  };
  class?: {
    id: number;
    name: string;
    grade: string;
  };
}

/**
 * 招生名额列表响应对象
 */
export interface EnrollmentQuotaListResponse {
  total: number;
  items: EnrollmentQuotaResponse[];
  page: number;
  pageSize: number;
}

/**
 * 招生名额过滤参数
 */
export interface EnrollmentQuotaFilterParams {
  page?: number;
  pageSize?: number;
  planId?: number;
  classId?: number;
  hasAvailable?: boolean;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * 招生名额分配请求对象
 */
export interface EnrollmentQuotaAllocationDto {
  quotaId: number;
  amount: number;
  applicantId?: number;
  type: 'use' | 'reserve' | 'release';
  remark?: string;
}

/**
 * 招生名额统计响应对象
 */
export interface EnrollmentQuotaStatisticsResponse {
  planId: number;
  planName: string;
  totalQuota: number;
  usedQuota: number;
  reservedQuota: number;
  availableQuota: number;
  utilizationRate: number;
  classSummary: {
    classId: number;
    className: string;
    totalQuota: number;
    usedQuota: number;
    reservedQuota: number;
    availableQuota: number;
    utilizationRate: number;
  }[];
}

/**
 * 招生名额批量调整请求对象
 */
export interface EnrollmentQuotaBatchAdjustmentDto {
  planId: number;
  adjustments: {
    classId: number;
    amount: number;
  }[];
  remark?: string;
} 