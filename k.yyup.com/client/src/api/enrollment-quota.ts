import { request, get, post, put, del, ApiResponse } from '@/utils/request'
import { ENROLLMENT_QUOTA_ENDPOINTS, API_PREFIX } from '@/api/endpoints'
import type { 
  EnrollmentQuota, 
  EnrollmentQuotaQueryParams,
  EnrollmentQuotaRequest,
  BatchEnrollmentQuotaRequest,
  BatchAdjustQuotaParams
} from '@/types/enrollment';

/**
 * 获取招生名额列表
 * @param params 查询参数
 * @returns 招生名额列表
 */
export function getEnrollmentQuotas(params: EnrollmentQuotaQueryParams): Promise<ApiResponse<any>> {
  return get(ENROLLMENT_QUOTA_ENDPOINTS.BASE, { params });
}

/**
 * 获取招生名额详情
 * @param id 招生名额ID
 * @returns 招生名额详情
 */
export function getEnrollmentQuota(id: number): Promise<ApiResponse<any>> {
  return get(ENROLLMENT_QUOTA_ENDPOINTS.GET_BY_ID(id));
}

/**
 * 创建招生名额
 * @param data 招生名额数据
 * @returns 创建结果
 */
export function createEnrollmentQuota(data: EnrollmentQuotaRequest): Promise<ApiResponse<any>> {
  return post(ENROLLMENT_QUOTA_ENDPOINTS.BASE, data);
}

/**
 * 批量创建招生名额
 * @param data 批量招生名额数据
 * @returns 创建结果
 */
export function batchCreateEnrollmentQuotas(data: BatchEnrollmentQuotaRequest): Promise<ApiResponse<any>> {
  return post(`${ENROLLMENT_QUOTA_ENDPOINTS.BASE}/batch`, data);
}

/**
 * 更新招生名额
 * @param id 招生名额ID
 * @param data 招生名额数据
 * @returns 更新结果
 */
export function updateEnrollmentQuota(id: number, data: EnrollmentQuotaRequest): Promise<ApiResponse<any>> {
  return put(ENROLLMENT_QUOTA_ENDPOINTS.UPDATE(id), data);
}

/**
 * 删除招生名额
 * @param id 招生名额ID
 * @returns 删除结果
 */
export function deleteEnrollmentQuota(id: number): Promise<ApiResponse<any>> {
  return del(ENROLLMENT_QUOTA_ENDPOINTS.DELETE(id));
}

/**
 * 批量调整招生名额
 * @param data 调整参数
 * @returns 操作结果
 */
export function batchAdjustEnrollmentQuota(data: BatchAdjustQuotaParams): Promise<ApiResponse<any>> {
  return post(`${ENROLLMENT_QUOTA_ENDPOINTS.BASE}/batch-adjust`, data);
}

/**
 * 获取招生计划的所有名额
 * @param planId 招生计划ID
 * @returns 招生名额列表
 */
export function getQuotasByPlanId(planId: number) {
  return get(`${ENROLLMENT_QUOTA_ENDPOINTS.BASE}/by-plan/${planId}`)
}

/**
 * 分配招生名额
 * @param data 分配数据
 * @returns 分配结果
 */
export function allocateEnrollmentQuota(data: any) {
  return post(`${API_PREFIX}/enrollment/quotas/allocate`, data)
}

/**
 * 获取招生名额统计
 * @param planId 招生计划ID
 * @returns 招生名额统计
 */
export function getEnrollmentQuotaStatistics(planId: number): Promise<ApiResponse<any>> {
  return get(`${ENROLLMENT_QUOTA_ENDPOINTS.BASE}/statistics`, { params: { planId } });
}

/**
 * 按年龄分配名额
 * @param planId 招生计划ID
 * @param data 分配参数
 * @returns 操作结果
 */
export const allocateQuotaByAge = (planId: number, data: {
  ageGroups: Array<{
    ageRange: string;
    quota: number;
  }>
}) => {
  return post(`${ENROLLMENT_QUOTA_ENDPOINTS.BASE}/allocate-by-age/${planId}`, data)
}

/**
 * 导出招生名额数据
 * @param planId 招生计划ID
 * @returns 文件流
 */
export function exportEnrollmentQuotas(planId: number): Promise<any> {
  return request.get(`${ENROLLMENT_QUOTA_ENDPOINTS.BASE}/export`, {
    params: { planId },
    responseType: 'blob'
  });
}

/**
 * 获取招生名额调整历史记录
 * @param quotaId 招生名额ID
 * @returns 调整历史记录
 */
export function getQuotaAdjustmentHistory(quotaId: number): Promise<ApiResponse<any>> {
  return get(`${ENROLLMENT_QUOTA_ENDPOINTS.GET_BY_ID(quotaId)}/adjustment-history`);
}

/**
 * 模拟数据
 * @returns 模拟的招生名额列表
 */
export const mockEnrollmentQuotas: EnrollmentQuota[] = [
  {
    id: 1,
    planId: 1,
    className: '小班1班',
    ageRange: '3-4岁',
    totalQuota: 30,
    usedQuota: 28,
    remainingQuota: 2,
    usageRate: 93.33,
    lastUpdated: '2023-05-15'
  },
  {
    id: 2,
    planId: 1,
    className: '小班2班',
    ageRange: '3-4岁',
    totalQuota: 30,
    usedQuota: 25,
    remainingQuota: 5,
    usageRate: 83.33,
    lastUpdated: '2023-05-16'
  },
  {
    id: 3,
    planId: 1,
    className: '中班1班',
    ageRange: '4-5岁',
    totalQuota: 35,
    usedQuota: 32,
    remainingQuota: 3,
    usageRate: 91.43,
    lastUpdated: '2023-05-14'
  },
  {
    id: 4,
    planId: 1,
    className: '中班2班',
    ageRange: '4-5岁',
    totalQuota: 35,
    usedQuota: 30,
    remainingQuota: 5,
    usageRate: 85.71,
    lastUpdated: '2023-05-14'
  },
  {
    id: 5,
    planId: 1,
    className: '大班1班',
    ageRange: '5-6岁',
    totalQuota: 40,
    usedQuota: 38,
    remainingQuota: 2,
    usageRate: 95.00,
    lastUpdated: '2023-05-15'
  },
  {
    id: 6,
    planId: 1,
    className: '大班2班',
    ageRange: '5-6岁',
    totalQuota: 40,
    usedQuota: 36,
    remainingQuota: 4,
    usageRate: 90.00,
    lastUpdated: '2023-05-13'
  }
]; 