// @ts-nocheck
// 招生计划模块API服务
import request, { ApiResponse } from '@/utils/request';
import { ENROLLMENT_PLAN_ENDPOINTS, ENROLLMENT_QUOTA_ENDPOINTS } from '../endpoints';
import type { 
  EnrollmentPlan, 
  EnrollmentPlanQueryParams, 
  EnrollmentQuota, 
  EnrollmentPlanStatistics,
  CreateEnrollmentPlanRequest,
  UpdateEnrollmentPlanRequest,
  BatchEnrollmentQuotaRequest,
  EnrollmentQuotaRequest
} from '@/types/enrollment';

/**
 * 招生计划状态枚举
 */
export enum EnrollmentPlanStatus {
  DRAFT = 'DRAFT',       // 草稿
  ACTIVE = 'ACTIVE',     // 活动
  PAUSED = 'PAUSED',     // 暂停
  COMPLETED = 'COMPLETED', // 完成
  CANCELLED = 'CANCELLED'  // 取消
}

/**
 * 招生计划类型枚举
 */
export enum EnrollmentPlanType {
  STANDARD = 'STANDARD',  // 标准班
  SUMMER = 'SUMMER',      // 暑期班
  WINTER = 'WINTER',      // 寒假班
  SPECIAL = 'SPECIAL'     // 特色班
}

/**
 * 后端返回的招生计划数据结构
 */
export interface BackendEnrollmentPlanResponse {
  id: number;
  name: string;
  code?: string;
  year: number;
  term: string;
  startDate: string;
  endDate: string;
  targetCount: number;
  enrolledCount: number;
  status: string;
  description?: string;
  ageRequirement?: string;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
  quotaDetails?: {
    id: number;
    className: string;
    ageRange: string;
    totalQuota: number;
    usedQuota: number;
    remainingQuota: number;
  }[];
}

/**
 * 适配后端返回的招生计划数据到前端格式
 * @param data 后端返回的数据
 * @returns 前端适配后的数据
 */
export function adaptEnrollmentPlan(data: BackendEnrollmentPlanResponse): EnrollmentPlan {
  return {
    id: data.id,
    name: data.name,
    code: data.code,
    year: data.year,
    term: data.term,
    startDate: data.startDate,
    endDate: data.endDate,
    targetCount: data.targetCount,
    actualCount: data.enrolledCount,
    kindergartenId: 0, // 后端没有提供这个字段，默认为0
    kindergartenName: '', // 后端没有提供这个字段，默认为空
    status: data.status as EnrollmentPlanStatus,
    description: data.description,
    ageRequirement: data.ageRequirement,
    remarks: data.remarks,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt
  };
}

/**
 * 适配后端返回的招生计划列表到前端格式
 * @param data 后端返回的数据
 * @returns 前端适配后的数据
 */
export function adaptEnrollmentPlanList(data: {
  items: BackendEnrollmentPlanResponse[];
  total: number;
  page: number;
  pageSize: number;
} | undefined): {
  data: EnrollmentPlan[];
  total: number;
  page: number;
  size: number;
} {
  if (!data || !data.items) {
    return {
      data: [],
      total: 0,
      page: 1,
      size: 10
    };
  }
  
  return {
    data: data.items.map(adaptEnrollmentPlan),
    total: data.total,
    page: data.page,
    size: data.pageSize
  };
}

/**
 * 获取招生计划列表
 * @param params 查询参数
 * @returns Promise
 */
export async function getEnrollmentPlanList(params?: EnrollmentPlanQueryParams): Promise<ApiResponse<{
  data: EnrollmentPlan[];
  total: number;
  page: number;
  size: number;
}>> {
  // 转换前端参数到后端期望的格式
  const apiParams: Record<string, any> = {
    ...params,
    pageSize: params?.pageSize || params?.size,
    // 处理日期范围参数
    startDate: params?.startDateFrom,
    endDate: params?.startDateTo
  };
  
  // 删除多余参数
  if ('size' in apiParams) delete apiParams.size;
  if ('startDateFrom' in apiParams) delete apiParams.startDateFrom;
  if ('startDateTo' in apiParams) delete apiParams.startDateTo;
  
  const response = await request.get(ENROLLMENT_PLAN_ENDPOINTS.BASE, apiParams);
  
  if (response.success && response.data) {
    return {
      success: true,
      data: adaptEnrollmentPlanList(response.data),
      message: response.message
    };
  }
  
  return response;
}

/**
 * 获取招生计划详情
 * @param id 招生计划ID
 * @returns Promise
 */
export async function getEnrollmentPlanDetail(id: string | number): Promise<ApiResponse<EnrollmentPlan>> {
  const response = await request.get(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id));
  
  if (response.success && response.data) {
    return {
      success: true,
      data: adaptEnrollmentPlan(response.data),
      message: response.message
    };
  }
  
  return response;
}

/**
 * 创建招生计划
 * @param data 招生计划数据
 * @returns Promise
 */
export function createEnrollmentPlan(data: CreateEnrollmentPlanRequest): Promise<ApiResponse<EnrollmentPlan>> {
  return request.post(ENROLLMENT_PLAN_ENDPOINTS.BASE, data);
}

/**
 * 更新招生计划
 * @param id 招生计划ID
 * @param data 招生计划数据
 * @returns Promise
 */
export function updateEnrollmentPlan(id: string | number, data: Partial<UpdateEnrollmentPlanRequest>): Promise<ApiResponse<EnrollmentPlan>> {
  return request.put(ENROLLMENT_PLAN_ENDPOINTS.UPDATE(id), data);
}

/**
 * 删除招生计划
 * @param id 招生计划ID
 * @returns Promise
 */
export function deleteEnrollmentPlan(id: string | number): Promise<ApiResponse<null>> {
  return request.del(ENROLLMENT_PLAN_ENDPOINTS.DELETE(id));
}

/**
 * 获取招生计划名额列表
 * @param planId 招生计划ID
 * @param params 查询参数
 * @returns Promise
 */
export async function getEnrollmentQuotas(planId: string | number, params?: any): Promise<ApiResponse<{
  items: EnrollmentQuota[];
  total: number;
  page: number;
  pageSize: number;
}>> {
  const response = await request.get(ENROLLMENT_PLAN_ENDPOINTS.GET_QUOTAS(planId), params);
  
  if (response.success && response.data) {
    // 转换数据格式如果需要
    return response;
  }
  
  return response;
}

/**
 * 创建招生名额
 * @param data 招生名额数据
 * @returns Promise
 */
export function createEnrollmentQuota(data: EnrollmentQuotaRequest): Promise<ApiResponse<EnrollmentQuota>> {
  return request.post(ENROLLMENT_QUOTA_ENDPOINTS.BASE, data);
}

/**
 * 批量创建招生名额
 * @param data 批量招生名额数据
 * @returns Promise
 */
export function batchCreateEnrollmentQuotas(data: BatchEnrollmentQuotaRequest): Promise<ApiResponse<EnrollmentQuota[]>> {
  return request.post(`${ENROLLMENT_QUOTA_ENDPOINTS.BASE}/batch`, data);
}

/**
 * 更新招生名额
 * @param id 名额ID
 * @param data 名额数据
 * @returns Promise
 */
export function updateEnrollmentQuota(id: string | number, data: Partial<EnrollmentQuotaRequest>): Promise<ApiResponse<EnrollmentQuota>> {
  return request.put(ENROLLMENT_QUOTA_ENDPOINTS.UPDATE(id), data);
}

/**
 * 删除招生名额
 * @param id 名额ID
 * @returns Promise
 */
export function deleteEnrollmentQuota(id: string | number): Promise<ApiResponse<null>> {
  return request.del(ENROLLMENT_QUOTA_ENDPOINTS.DELETE(id));
}

/**
 * 招生计划统计数据接口
 */
export interface EnrollmentAnalytics {
  totalPlans: number;
  activePlans: number;
  completedPlans: number;
  totalTarget: number;
  totalEnrolled: number;
  enrollmentRate: number;
  plansByType: Record<EnrollmentPlanType, number>;
  monthlyEnrollment: Array<{
    month: string;
    count: number;
  }>;
}

/**
 * 获取招生计划统计数据
 * @returns Promise
 */
export function getEnrollmentAnalytics(): Promise<ApiResponse<EnrollmentAnalytics>> {
  return request.get(`${ENROLLMENT_PLAN_ENDPOINTS.BASE}/analytics`);
}

/**
 * 更新招生计划状态
 * @param id 招生计划ID
 * @param status 招生计划状态
 * @returns Promise
 */
export function updateEnrollmentPlanStatus(id: string | number, status: EnrollmentPlanStatus): Promise<ApiResponse<EnrollmentPlan>> {
  return request.put(`${ENROLLMENT_PLAN_ENDPOINTS.UPDATE(id)}/status`, { status });
}

/**
 * 导出招生计划数据
 * @param planId 招生计划ID
 * @returns Promise
 */
export function exportEnrollmentPlanData(planId: string | number): Promise<ApiResponse<Blob>> {
  return request.get(`${ENROLLMENT_PLAN_ENDPOINTS.BASE}/${planId}/export`, {}, { responseType: 'blob' });
}

/**
 * 状态映射
 */
export const backendStatusMap: Record<string, string> = {
  DRAFT: '草稿',
  ACTIVE: '招生中',
  PAUSED: '已暂停',
  COMPLETED: '已完成',
  CANCELLED: '已取消'
};

/**
 * 招生计划API对象 - 统一的API接口
 */
export const enrollmentPlanApi = {
  // 获取招生计划列表
  getList: (params: any = {}) => {
    const { page = 1, limit = 10, ...rest } = params;
    return request.get(`${ENROLLMENT_PLAN_ENDPOINTS.BASE}?page=${page}&limit=${limit}`, { params: rest });
  },

  // 根据ID获取招生计划
  getById: (id: string | number) => {
    return request.get(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}`);
  },

  // 创建招生计划
  create: (data: any) => {
    return request.post(ENROLLMENT_PLAN_ENDPOINTS.BASE, data);
  },

  // 更新招生计划
  update: (id: string | number, data: any) => {
    return request.put(`${ENROLLMENT_PLAN_ENDPOINTS.UPDATE(id)}`, data);
  },

  // 删除招生计划
  delete: (id: string | number) => {
    return request.delete(`${ENROLLMENT_PLAN_ENDPOINTS.DELETE(id)}`);
  },

  // 获取统计数据
  getStatistics: () => {
    return request.get(`${ENROLLMENT_PLAN_ENDPOINTS.BASE}/statistics`);
  },

  // 获取分析数据
  getAnalytics: () => {
    return getEnrollmentAnalytics();
  },

  // 更新状态
  updateStatus: (id: string | number, status: EnrollmentPlanStatus) => {
    return updateEnrollmentPlanStatus(id, status);
  },

  // 导出数据
  export: (planId: string | number) => {
    return exportEnrollmentPlanData(planId);
  }
}; 