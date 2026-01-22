/**
 * 用量中心API端点
 * @description 用量统计、费用查询等API
 */

import { request, type ApiResponse } from '@/utils/request';

/**
 * 用量类型
 */
export enum UsageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  VIDEO = 'video',
  EMBEDDING = 'embedding'
}

/**
 * 用量概览统计
 */
export interface UsageOverview {
  totalCalls: number;
  totalCost: number;
  activeUsers: number;
  usageByType: Array<{
    type: UsageType;
    count: number;
    cost: number;
  }>;
}

/**
 * 用户用量统计
 */
export interface UserUsage {
  userId: number;
  username: string;
  realName: string;
  email: string;
  totalCalls: number;
  totalCost: number;
  totalTokens: number;
}

/**
 * 用户详细用量
 */
export interface UserUsageDetail {
  usageByType: Array<{
    type: UsageType;
    count: number;
    cost: number;
    tokens: number;
  }>;
  usageByModel: Array<{
    modelId: number;
    modelName: string;
    provider: string;
    count: number;
    cost: number;
  }>;
  recentUsage: Array<{
    id: number;
    modelName: string;
    usageType: UsageType;
    totalTokens: number;
    cost: number;
    createdAt: string;
  }>;
}

/**
 * 查询参数
 */
export interface UsageQueryParams {
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 分页响应接口
 */
export interface PageResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * 获取用量中心概览统计
 */
export const getUsageOverview = (params?: UsageQueryParams): Promise<ApiResponse<UsageOverview>> => {
  return request.get('/api/usage-center/overview', { params });
};

/**
 * 获取用户用量列表
 */
export const getUserUsageList = (params?: UsageQueryParams): Promise<ApiResponse<PageResponse<UserUsage>>> => {
  return request.get('/api/usage-center/users', { params });
};

/**
 * 获取用户详细用量
 */
export const getUserUsageDetail = (userId: number, params?: UsageQueryParams): Promise<ApiResponse<UserUsageDetail>> => {
  return request.get(`/usage-center/user/${userId}/detail`, { params });
};

/**
 * 获取当前用户的用量统计（教师用）
 */
export const getMyUsage = (params?: UsageQueryParams): Promise<ApiResponse<UserUsageDetail>> => {
  return request.get('/api/usage-center/my-usage', { params });
};

/**
 * 用户配额信息
 */
export interface UserQuota {
  userId: number;
  monthlyQuota: number;
  monthlyCostQuota: number;
  currentMonthUsage: number;
  currentMonthCost: number;
  usagePercentage: number;
  costPercentage: number;
  warningEnabled: boolean;
  warningThreshold: number;
}

/**
 * 预警信息
 */
export interface WarningInfo {
  userId: number;
  username: string;
  realName: string;
  email: string;
  monthlyQuota: number;
  monthlyCostQuota: number;
  currentUsage: number;
  currentCost: number;
  usagePercentage: number;
  costPercentage: number;
  warningThreshold: number;
}

/**
 * 获取用户配额信息
 */
export const getUserQuota = (userId: number): Promise<ApiResponse<UserQuota>> => {
  return request.get(`/usage-quota/user/${userId}`);
};

/**
 * 更新用户配额
 */
export const updateUserQuota = (userId: number, data: Partial<UserQuota>): Promise<ApiResponse> => {
  return request.put(`/usage-quota/user/${userId}`, data);
};

/**
 * 获取所有预警信息
 */
export const getWarnings = (): Promise<ApiResponse<WarningInfo[]>> => {
  return request.get('/api/usage-quota/warnings');
};

