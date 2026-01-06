// 活动模块API服务
import { get, request, type ApiResponse } from '../../utils/request';
import { 
  transformActivityData, 
  transformActivityRegistrationData,
  transformListResponse,
  transformActivityFormData,
  transformActivityRegistrationFormData
} from '@/utils/dataTransform';
import { ACTIVITY_EVALUATION_ENDPOINTS } from '../endpoints/activity';

// 活动API端点配置 - 与后端路由对齐 (移除/api前缀，baseURL已包含)
const ACTIVITY_ENDPOINTS = {
  // 基础活动接口 (对应 activities.routes.ts)
  BASE: '/activities',
  GET_BY_ID: (id: number | string) => `/activities/${id}`,
  STATISTICS: '/activities/statistics',
  
  // 活动计划接口 (对应 activity-plan.routes.ts)
  PLANS: '/activity-plans',
  PLAN_BY_ID: (id: number | string) => `/activity-plans/${id}`,
  PLAN_BY_CATEGORY: (category: string) => `/activity-plans/by-category/${category}`,
  PLAN_REGISTRATIONS: (id: number | string) => `/activity-plans/${id}/registrations`,
  
  // 活动报名接口 (对应 activity-registration.routes.ts)
  REGISTRATIONS: '/activity-registrations',
  REGISTRATION_BY_ID: (id: number | string) => `/activity-registrations/${id}`,
  REGISTRATIONS_BY_ACTIVITY: (activityId: number | string) => `/activity-registrations/by-activity/${activityId}`,
  REGISTRATIONS_BY_STUDENT: (studentId: number | string) => `/activity-registrations/by-student/${studentId}`,
  
  // 活动签到接口 (对应 activity-checkin.routes.ts)
  CHECKINS: '/activity-checkins',
  CHECKIN_BY_ID: (id: number | string) => `/activity-checkins/${id}`,
  CHECKINS_BATCH: '/activity-checkins/batch',
  
  // 活动评价接口 (对应 activity-evaluation.routes.ts)
  EVALUATIONS: '/activity-evaluations',
  EVALUATION_BY_ID: (id: number | string) => `/activity-evaluations/${id}`,
};

/**
 * 活动基础信息接口
 */
export interface Activity {
  id: number;
  title: string;
  description?: string;
  activityType: number; // 1:开放日 2:体验课 3:亲子活动 4:招生说明会 5:家长会 6:节日活动 7:其他
  coverImage?: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  fee?: number;
  agenda?: string;
  registrationStartTime: string;
  registrationEndTime: string;
  needsApproval: number; // 0:否 1:是
  status: number; // 0:草稿 1:未开始 2:报名中 3:进行中 4:已结束 5:已取消
  registeredCount?: number;
  kindergartenId?: number;
  planId?: number;
  remark?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 活动创建/更新参数接口
 */
export interface ActivityParams {
  kindergartenId?: number;
  planId?: number;
  title: string;
  activityType: number;
  coverImage?: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  fee?: number;
  description?: string;
  agenda?: string;
  registrationStartTime: string;
  registrationEndTime: string;
  needsApproval?: number;
  status?: number;
  remark?: string;
}

/**
 * 活动查询参数接口
 */
export interface ActivityQueryParams {
  page?: number;
  size?: number;
  title?: string;
  activityType?: number;
  status?: number;
  kindergartenId?: number;
  planId?: number;
  startTimeStart?: string;
  startTimeEnd?: string;
}

/**
 * 活动报名信息接口
 */
export interface ActivityRegistration {
  id: number;
  activityId: number;
  parentId?: number;
  studentId?: number;
  contactName: string;
  contactPhone: string;
  childName?: string;
  childAge?: number;
  childGender?: number; // 0:未知 1:男 2:女
  attendeeCount: number;
  specialNeeds?: string;
  source?: string;
  status: number; // 0:待审核 1:已确认 2:已拒绝 3:已取消 4:已签到 5:未出席
  isConversion?: number; // 0:未转化 1:已转化
  createdAt: string;
  updatedAt: string;
}

/**
 * 活动报名参数接口
 */
export interface RegistrationParams {
  activityId: number;
  parentId?: number;
  studentId?: number;
  contactName: string;
  contactPhone: string;
  childName?: string;
  childAge?: number;
  childGender?: number;
  attendeeCount: number;
  specialNeeds?: string;
  source?: string;
}

/**
 * 活动签到信息接口
 */
export interface ActivityCheckin {
  id: number;
  activityId: number;
  registrationId: number;
  checkinTime: string;
  checkinMethod: number; // 1:手动 2:扫码 3:人脸识别
  checkinLocation?: string;
  remark?: string;
  createdAt: string;
}

/**
 * 活动评价信息接口
 */
export interface ActivityEvaluation {
  id: number;
  activityId: number;
  registrationId: number;
  rating: number; // 1-5星评价
  content?: string;
  tags?: string; // JSON格式的标签数组
  isAnonymous: number; // 0:否 1:是
  createdAt: string;
}

/**
 * 活动统计信息接口
 */
export interface ActivityStatistics {
  total_activities: number;
  active: number;
  completed: number;
  cancelled: number;
  this_month: number;
  last_month: number;
  participation_rate: number;
}

// ==================== 基础活动管理 API ====================

/**
 * 获取活动列表
 */
export function getActivityList(params?: ActivityQueryParams): Promise<ApiResponse<{
  items: Activity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return get(ACTIVITY_ENDPOINTS.BASE, params).then((response: any) => {
    const normalized = transformListResponse(response, transformActivityData);
    const page = params?.page || 1;
    const size = (params as any)?.size || (params as any)?.limit || 10;
    const total = normalized.total || 0;
    return {
      success: response?.success !== false,
      data: {
        items: normalized.items || [],
        total,
        page,
        pageSize: size,
        totalPages: Math.max(1, Math.ceil(total / size))
      },
      message: response?.message || 'Success'
    } as ApiResponse<any>;
  });
}

/**
 * 获取活动详情
 */
export function getActivityDetail(id: number | string): Promise<ApiResponse<Activity>> {
  return request.get(ACTIVITY_ENDPOINTS.GET_BY_ID(id)).then(response => {
    if (response.data) {
      response.data = transformActivityData(response.data);
    }
    return response;
  });
}

/**
 * 获取活动统计
 */
export function getActivityStatistics(): Promise<ApiResponse<ActivityStatistics>> {
  return request.get(ACTIVITY_ENDPOINTS.STATISTICS);
}

// ==================== 活动计划管理 API ====================

/**
 * 获取活动计划列表
 */
export function getActivityPlans(params?: ActivityQueryParams): Promise<ApiResponse<{
  items: Activity[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return request.get(ACTIVITY_ENDPOINTS.PLANS, params);
}

/**
 * 获取活动计划详情
 */
export function getActivityPlanDetail(id: number | string): Promise<ApiResponse<Activity>> {
  return request.get(ACTIVITY_ENDPOINTS.PLAN_BY_ID(id));
}

/**
 * 创建活动计划
 */
export function createActivityPlan(data: ActivityParams): Promise<ApiResponse<Activity>> {
  const transformedData = transformActivityFormData(data);
  return request.post(ACTIVITY_ENDPOINTS.PLANS, transformedData).then(response => {
    if (response.data) {
      response.data = transformActivityData(response.data);
    }
    return response;
  });
}

/**
 * 更新活动计划
 */
export function updateActivityPlan(id: number | string, data: Partial<ActivityParams>): Promise<ApiResponse<Activity>> {
  const transformedData = transformActivityFormData(data);
  return request.put(ACTIVITY_ENDPOINTS.PLAN_BY_ID(id), transformedData).then(response => {
    if (response.data) {
      response.data = transformActivityData(response.data);
    }
    return response;
  });
}

/**
 * 删除活动计划
 */
export function deleteActivityPlan(id: number | string): Promise<ApiResponse<void>> {
  return request.del(ACTIVITY_ENDPOINTS.PLAN_BY_ID(id));
}

/**
 * 按类别获取活动计划
 */
export function getActivityPlansByCategory(category: string): Promise<ApiResponse<Activity[]>> {
  return request.get(ACTIVITY_ENDPOINTS.PLAN_BY_CATEGORY(category));
}

/**
 * 获取活动计划的报名列表
 */
export function getActivityPlanRegistrations(id: number | string, params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<{
  items: ActivityRegistration[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return request.get(ACTIVITY_ENDPOINTS.PLAN_REGISTRATIONS(id), params);
}

// ==================== 活动报名管理 API ====================

/**
 * 获取活动报名列表
 */
export function getActivityRegistrations(params?: {
  page?: number;
  limit?: number;
  activityId?: number;
  parentId?: number;
  studentId?: number;
  contactName?: string;
  contactPhone?: string;
  status?: number;
  isConversion?: number;
}): Promise<ApiResponse<{
  items: ActivityRegistration[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return request.get(ACTIVITY_ENDPOINTS.REGISTRATIONS, params);
}

/**
 * 获取活动报名详情
 */
export function getRegistrationDetail(id: number | string): Promise<ApiResponse<ActivityRegistration>> {
  return request.get(ACTIVITY_ENDPOINTS.REGISTRATION_BY_ID(id));
}

/**
 * 创建活动报名
 */
export function createRegistration(data: RegistrationParams): Promise<ApiResponse<ActivityRegistration>> {
  return request.post(ACTIVITY_ENDPOINTS.REGISTRATIONS, data);
}

/**
 * 更新活动报名
 */
export function updateRegistration(id: number | string, data: Partial<RegistrationParams>): Promise<ApiResponse<ActivityRegistration>> {
  const transformedData = transformActivityRegistrationFormData(data);
  return request.put(ACTIVITY_ENDPOINTS.REGISTRATION_BY_ID(id), transformedData).then(response => {
    if (response.data) {
      response.data = transformActivityRegistrationData(response.data);
    }
    return response;
  });
}

/**
 * 删除活动报名
 */
export function deleteRegistration(id: number | string): Promise<ApiResponse<void>> {
  return request.del(ACTIVITY_ENDPOINTS.REGISTRATION_BY_ID(id));
}

/**
 * 按活动获取报名列表
 */
export function getRegistrationsByActivity(activityId: number | string, params?: {
  page?: number;
  size?: number;
}): Promise<ApiResponse<{
  items: ActivityRegistration[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return request.get(ACTIVITY_ENDPOINTS.REGISTRATIONS_BY_ACTIVITY(activityId), params).then(response => {
    return transformListResponse(response, transformActivityRegistrationData);
  });
}

/**
 * 按学生获取报名列表
 */
export function getRegistrationsByStudent(studentId: number | string): Promise<ApiResponse<ActivityRegistration[]>> {
  return request.get(ACTIVITY_ENDPOINTS.REGISTRATIONS_BY_STUDENT(studentId));
}

// ==================== 活动签到管理 API ====================

/**
 * 获取活动签到列表
 */
export function getActivityCheckins(params?: {
  page?: number;
  size?: number;
  activityId?: number;
  registrationId?: number;
}): Promise<ApiResponse<{
  items: ActivityCheckin[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return request.get(ACTIVITY_ENDPOINTS.CHECKINS, params);
}

/**
 * 获取签到详情
 */
export function getCheckinDetail(id: number | string): Promise<ApiResponse<ActivityCheckin>> {
  return request.get(ACTIVITY_ENDPOINTS.CHECKIN_BY_ID(id));
}

/**
 * 批量创建活动签到
 */
export function batchCreateCheckins(data: {
  activityId: number;
  registrationIds: number[];
  checkinMethod?: number;
  checkinLocation?: string;
  remark?: string;
}): Promise<ApiResponse<ActivityCheckin[]>> {
  return request.post(ACTIVITY_ENDPOINTS.CHECKINS_BATCH, data);
}

// ==================== 活动评价管理 API ====================

/**
 * 获取活动评价列表
 */
export function getActivityEvaluations(params?: {
  page?: number;
  size?: number;
  activityId?: number;
  registrationId?: number;
  rating?: number;
}): Promise<ApiResponse<{
  items: ActivityEvaluation[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>> {
  return request.get(ACTIVITY_EVALUATION_ENDPOINTS.BASE, params);
}

/**
 * 获取评价详情
 */
export function getEvaluationDetail(id: number | string): Promise<ApiResponse<ActivityEvaluation>> {
  return request.get(ACTIVITY_EVALUATION_ENDPOINTS.GET_BY_ID(id));
}

/**
 * 创建活动评价
 */
export function createEvaluation(data: {
  activityId: number;
  registrationId: number;
  rating: number;
  content?: string;
  tags?: string[];
  isAnonymous?: number;
}): Promise<ApiResponse<ActivityEvaluation>> {
  return request.post(ACTIVITY_EVALUATION_ENDPOINTS.BASE, {
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : undefined
  });
}

/**
 * 更新活动评价
 */
export function updateEvaluation(id: number | string, data: {
  rating?: number;
  content?: string;
  tags?: string[];
  isAnonymous?: number;
}): Promise<ApiResponse<ActivityEvaluation>> {
  return request.put(ACTIVITY_ENDPOINTS.EVALUATION_BY_ID(id), {
    ...data,
    tags: data.tags ? JSON.stringify(data.tags) : undefined
  });
}

/**
 * 删除活动评价
 */
export function deleteEvaluation(id: number | string): Promise<ApiResponse<void>> {
  return request.del(ACTIVITY_ENDPOINTS.EVALUATION_BY_ID(id));
}

// ==================== 兼容性API (保持向后兼容) ====================

/**
 * @deprecated 使用 getActivityPlans 替代
 */
export const createActivity = createActivityPlan;

/**
 * @deprecated 使用 updateActivityPlan 替代
 */
export const updateActivity = updateActivityPlan;

/**
 * @deprecated 使用 deleteActivityPlan 替代
 */
export const deleteActivity = deleteActivityPlan;

/**
 * @deprecated 使用 getActivityPlanRegistrations 替代
 */
export const getActivityRegistrationsOld = getActivityPlanRegistrations;

/**
 * 更新活动状态 (兼容性方法)
 */
export function updateActivityStatus(id: number | string, status: number): Promise<ApiResponse<Activity>> {
  return updateActivityPlan(id, { status });
} 