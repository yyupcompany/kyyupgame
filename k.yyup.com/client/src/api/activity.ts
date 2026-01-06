import { get, post, put, del } from '@/utils/request';
import type { ApiResponse } from '@/utils/request';
import type { Activity as ActivityType, ActivityCreateRequest, ActivityUpdateRequest } from '../types/activity';
import { createHeaders } from '@/utils/request-config';

/**
 * 活动状态枚举
 */
export enum ActivityStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  ARCHIVED = 'ARCHIVED'
}

/**
 * 活动数据接口
 */
export interface Activity {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  coverImage?: string;
  status: ActivityStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 活动创建参数接口
 */
export interface ActivityCreateParams {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  coverImage?: string;
  status: ActivityStatus;
}

/**
 * 活动查询参数接口
 */
export interface ActivityQueryParams {
  keyword?: string;
  status?: ActivityStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 活动管理API服务
 */
export const activityApi = {
  /**
   * 获取活动列表
   */
  getActivities(params?: any): Promise<ApiResponse<{ activities: ActivityType[]; total: number }>> {
    return get('/activities', { params });
  },

  /**
   * 获取活动详情
   */
  getActivityById(id: string): Promise<ApiResponse<ActivityType>> {
    return get(`/activities/${id}`);
  },

  /**
   * 创建活动
   */
  createActivity(data: ActivityCreateRequest): Promise<ApiResponse<ActivityType>> {
    return post('/activities', data);
  },

  /**
   * 更新活动
   */
  updateActivity(id: string, data: ActivityUpdateRequest): Promise<ApiResponse<ActivityType>> {
    return put(`/activities/${id}`, data);
  },

  /**
   * 删除活动
   */
  deleteActivity(id: string): Promise<ApiResponse<null>> {
    return del(`/activities/${id}`);
  }
};

/**
 * 更新活动状态
 */
export function updateActivityStatus(id: string, status: string) {
  return put(`/activities/${id}/status`, { status });
}

/**
 * 批量删除活动
 */
export function batchDeleteActivities(ids: string[]) {
  return del('/activities/batch', { data: { ids } });
}

/**
 * 上传活动封面
 */
export function uploadActivityCover(formData: FormData) {
  const headers = createHeaders({
    'Content-Type': 'multipart/form-data'
  });
  return post('/upload/activity-cover', formData, { headers });
} 