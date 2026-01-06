import { request, ApiResponse } from '@/utils/request'
import { 
  ENROLLMENT_PLAN_ENDPOINTS, 
  ENROLLMENT_QUOTA_ENDPOINTS,
  API_PREFIX
} from '@/api/endpoints'
import type {
  EnrollmentPlan,
  EnrollmentPlanQueryParams,
  EnrollmentPlanPaginationResult,
  EnrollmentPlanStatistics,
  AddTrackingRequest,
  CreateEnrollmentPlanRequest,
  UpdateEnrollmentPlanRequest,
  SetEnrollmentPlanClassesRequest
} from '@/types/enrollment';
import { EnrollmentPlanStatus } from '@/types/enrollment';

import { get, post, put, del } from '@/utils/request';
import { transformEnrollmentPlanData, transformListResponse, transformEnrollmentPlanFormData } from '@/utils/dataTransform';

/**
 * 获取招生计划列表
 * @param params 查询参数
 * @returns Promise
 */
export function getEnrollmentPlans(params: EnrollmentPlanQueryParams): Promise<ApiResponse<EnrollmentPlanPaginationResult>> {
  return get(ENROLLMENT_PLAN_ENDPOINTS.BASE, { params }).then((response: any) => {
    // 使用数据转换层处理响应
    return transformListResponse(response, transformEnrollmentPlanData);
  });
}

/**
 * 获取招生计划详情
 * @param id 计划ID
 * @returns Promise
 */
export function getEnrollmentPlan(id: number): Promise<ApiResponse<EnrollmentPlan>> {
  return get(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)).then((response: any) => {
    // 转换响应数据
    if (response.data) {
      response.data = transformEnrollmentPlanData(response.data);
    }
    return response;
  });
}

/**
 * 创建招生计划
 * @param data 计划数据
 * @returns Promise
 */
export function createEnrollmentPlan(data: CreateEnrollmentPlanRequest): Promise<ApiResponse<EnrollmentPlan>> {
  // 转换表单数据
  const transformedData = transformEnrollmentPlanFormData(data);
  
  return post(ENROLLMENT_PLAN_ENDPOINTS.BASE, transformedData).then((response: any) => {
    // 转换响应数据
    if (response.data) {
      response.data = transformEnrollmentPlanData(response.data);
    }
    return response;
  });
}

/**
 * 更新招生计划
 * @param id 计划ID
 * @param data 计划数据
 * @returns Promise
 */
export function updateEnrollmentPlan(id: number, data: UpdateEnrollmentPlanRequest): Promise<ApiResponse<EnrollmentPlan>> {
  // 转换表单数据
  const transformedData = transformEnrollmentPlanFormData(data);
  
  return put(ENROLLMENT_PLAN_ENDPOINTS.UPDATE(id), transformedData).then((response: any) => {
    // 转换响应数据
    if (response.data) {
      response.data = transformEnrollmentPlanData(response.data);
    }
    return response;
  });
}

/**
 * 删除招生计划
 * @param id 计划ID
 * @returns Promise
 */
export function deleteEnrollmentPlan(id: number): Promise<ApiResponse<void>> {
  return del(ENROLLMENT_PLAN_ENDPOINTS.DELETE(id))
}

/**
 * 获取招生计划统计数据
 * @param id 计划ID
 * @returns Promise
 */
export function getEnrollmentPlanStatistics(id: number): Promise<ApiResponse<EnrollmentPlanStatistics>> {
  return get(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/statistics`)
}

/**
 * 获取招生计划名额列表
 * @param id 计划ID
 * @returns Promise
 */
export function getEnrollmentPlanQuotas(id: number): Promise<ApiResponse> {
  return get(ENROLLMENT_QUOTA_ENDPOINTS.BASE, { params: { planId: id } })
}

/**
 * 更新招生计划名额
 * @param id 计划ID
 * @param data 名额数据
 * @returns Promise
 */
export function updateEnrollmentPlanQuotas(id: number, data: any): Promise<ApiResponse> {
  return put(ENROLLMENT_QUOTA_ENDPOINTS.BASE, {
    planId: id,
    ...data
  })
}

/**
 * 获取名额使用历史记录
 * @param id 计划ID
 * @param params 查询参数
 * @returns Promise
 */
export function getQuotaUsageHistory(id: number, params?: any) {
  return get(`${API_PREFIX}/enrollment-plans/${id}/quota-usage-history`, params)
}

/**
 * 发布招生计划
 * @param id 招生计划ID
 * @returns 发布结果
 */
export function publishEnrollmentPlan(id: number) {
  return put(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/publish`)
}

/**
 * 取消招生计划
 * @param id 招生计划ID
 * @returns 取消结果
 */
export function cancelEnrollmentPlan(id: number) {
  return put(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/cancel`)
}

/**
 * 完成招生计划
 * @param id 招生计划ID
 * @returns 完成结果
 */
export function completeEnrollmentPlan(id: number) {
  return put(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/complete`)
}

/**
 * 获取招生数据分析
 * @param params 查询参数
 * @returns Promise<ApiResponse>
 */
export function getEnrollmentAnalytics(params?: { startDate?: string; endDate?: string; planId?: string }): Promise<ApiResponse> {
  return get(ENROLLMENT_PLAN_ENDPOINTS.ANALYTICS, { params });
}

/**
 * 获取所有招生计划的统计概览
 * @returns 统计概览
 */
export function getEnrollmentPlanOverview() {
  return get(`${ENROLLMENT_PLAN_ENDPOINTS.BASE}/overview`)
}

/**
 * 导出招生计划数据
 * @param id 计划ID
 * @param options 导出选项
 * @returns 导出结果
 */
export function exportEnrollmentPlanData(id: number, options: {
  includeQuotas?: boolean;
  includeApplications?: boolean;
  includeTracking?: boolean;
}) {
  return request.get(ENROLLMENT_PLAN_ENDPOINTS.EXPORT(id), {
    params: {
      id,
      ...options
    },
    responseType: 'blob'
  })
}

/**
 * 设置招生计划班级
 * @param id 计划ID
 * @param data 班级数据
 * @returns 设置结果
 */
export function setEnrollmentPlanClasses(id: number, data: SetEnrollmentPlanClassesRequest) {
  return post(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/classes`, data)
}

/**
 * 设置招生计划负责人
 * @param id 计划ID
 * @param data 负责人数据
 * @returns 设置结果
 */
export function setEnrollmentPlanAssignees(id: number, data: any) {
  return post(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/assignees`, data)
}

/**
 * 获取招生计划跟踪记录
 * @param id 招生计划ID
 * @returns 跟踪记录列表
 */
export function getEnrollmentPlanTrackings(id: number) {
  return get(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/trackings`)
}

/**
 * 添加招生计划跟踪记录
 * @param id 招生计划ID
 * @param data 跟踪记录数据
 * @returns 添加结果
 */
export function addEnrollmentPlanTracking(id: number, data: AddTrackingRequest) {
  return post(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/trackings`, data)
}

/**
 * 更新招生计划状态
 * @param id 计划ID
 * @param status 状态值
 * @returns 更新结果
 */
export function updateEnrollmentPlanStatus(id: number, status: number) {
  return request.put(ENROLLMENT_PLAN_ENDPOINTS.UPDATE_STATUS(id), { status })
}

/**
 * 获取招生计划关联班级
 * @param id 招生计划ID
 * @returns 班级列表
 */
export function getEnrollmentPlanClasses(id: number): Promise<ApiResponse> {
  return get(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/classes`)
}

/**
 * 获取所有招生计划统计数据
 * @returns 统计数据
 */
export function getAllEnrollmentPlanStatistics(): Promise<ApiResponse> {
  return get(`${ENROLLMENT_PLAN_ENDPOINTS.BASE}/all-statistics`)
}

/**
 * 复制招生计划
 * @param id 招生计划ID
 * @returns 新计划数据
 */
export function copyEnrollmentPlan(id: number): Promise<ApiResponse> {
  return post(`${ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(id)}/copy`)
}

/**
 * 导出招生计划列表
 * @param params 查询参数
 * @returns 文件流
 */
export function exportEnrollmentPlans(params?: EnrollmentPlanQueryParams): Promise<ApiResponse> {
  return request.get(`${ENROLLMENT_PLAN_ENDPOINTS.BASE}/export`, {
    params,
    responseType: 'blob'
  })
}

// 模拟数据
export const mockEnrollmentPlans: EnrollmentPlan[] = [
  {
    id: 1,
    name: '2023年秋季招生计划',
    startDate: '2023-06-01',
    endDate: '2023-08-31',
    targetCount: 200,
    status: EnrollmentPlanStatus.ACTIVE, // 进行中
    description: '2023年秋季幼儿园招生计划，面向3-6岁儿童',
    createdAt: '2023-05-01',
    updatedAt: '2023-05-15',
    year: 2023,
    term: '秋季',
    kindergartenId: 1
  },
  {
    id: 2,
    name: '2024年春季招生计划',
    startDate: '2023-12-01',
    endDate: '2024-02-28',
    targetCount: 150,
    status: EnrollmentPlanStatus.DRAFT, // 未开始
    description: '2024年春季幼儿园招生计划，主要招收小班新生',
    createdAt: '2023-10-15',
    updatedAt: '2023-10-15',
    year: 2024,
    term: '春季',
    kindergartenId: 1
  },
  {
    id: 3,
    name: '2023年暑期短期班招生',
    startDate: '2023-06-15',
    endDate: '2023-07-15',
    targetCount: 50,
    status: EnrollmentPlanStatus.COMPLETED, // 已完成
    description: '2023年暑期短期兴趣班招生计划',
    createdAt: '2023-05-20',
    updatedAt: '2023-07-20',
    year: 2023,
    term: '夏季',
    kindergartenId: 1
  }
];

/**
 * 招生计划API服务
 */
export const enrollmentPlanApi = {
  /**
   * 获取招生计划列表
   */
  getEnrollmentPlans(params?: any): Promise<ApiResponse<{ plans: EnrollmentPlan[]; total: number }>> {
    return get(ENROLLMENT_PLAN_ENDPOINTS.BASE, { params }).then((response: any) => {
      // 使用数据转换层处理响应
      return transformListResponse(response, transformEnrollmentPlanData);
    });
  },

  /**
   * 获取招生计划详情
   */
  getEnrollmentPlanById(id: string): Promise<ApiResponse<EnrollmentPlan>> {
    return get(ENROLLMENT_PLAN_ENDPOINTS.GET_BY_ID(parseInt(id))).then((response: any) => {
      // 转换响应数据
      if (response.data) {
        response.data = transformEnrollmentPlanData(response.data);
      }
      return response;
    });
  },

  /**
   * 创建招生计划
   */
  createEnrollmentPlan(data: CreateEnrollmentPlanRequest): Promise<ApiResponse<EnrollmentPlan>> {
    // 转换表单数据
    const transformedData = transformEnrollmentPlanFormData(data);
    
    return post(ENROLLMENT_PLAN_ENDPOINTS.BASE, transformedData).then((response: any) => {
      // 转换响应数据
      if (response.data) {
        response.data = transformEnrollmentPlanData(response.data);
      }
      return response;
    });
  },

  /**
   * 更新招生计划
   */
  updateEnrollmentPlan(id: string, data: UpdateEnrollmentPlanRequest): Promise<ApiResponse<EnrollmentPlan>> {
    // 转换表单数据
    const transformedData = transformEnrollmentPlanFormData(data);
    
    return put(ENROLLMENT_PLAN_ENDPOINTS.UPDATE(parseInt(id)), transformedData).then((response: any) => {
      // 转换响应数据
      if (response.data) {
        response.data = transformEnrollmentPlanData(response.data);
      }
      return response;
    });
  },

  /**
   * 删除招生计划
   */
  deleteEnrollmentPlan(id: string): Promise<ApiResponse<null>> {
    return del(ENROLLMENT_PLAN_ENDPOINTS.DELETE(parseInt(id)));
  }
}; 