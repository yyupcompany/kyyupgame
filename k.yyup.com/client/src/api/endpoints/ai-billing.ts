/**
 * AI计费相关API端点
 */

import { request, type ApiResponse } from '@/utils/request';

/**
 * 计费类型
 */
export enum BillingType {
  TOKEN = 'token',
  SECOND = 'second',
  COUNT = 'count',
  CHARACTER = 'character',
}

/**
 * 计费状态
 */
export enum BillingStatus {
  PENDING = 'pending',
  CALCULATED = 'calculated',
  BILLED = 'billed',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

/**
 * 计费记录
 */
export interface BillingRecord {
  id: number;
  userId: number;
  modelId: number;
  usageId: number;
  billingType: BillingType;
  quantity: number;
  unit: string;
  inputTokens?: number;
  outputTokens?: number;
  durationSeconds?: number;
  imageCount?: number;
  characterCount?: number;
  inputPrice: number;
  outputPrice: number;
  unitPrice: number;
  totalCost: number;
  currency: string;
  billingStatus: BillingStatus;
  billingTime?: string;
  paymentTime?: string;
  billingCycle: string;
  createdAt: string;
  updatedAt: string;
  modelConfig?: {
    id: number;
    name: string;
    modelType: string;
  };
}

/**
 * 用户账单
 */
export interface UserBill {
  userId: number;
  billingCycle: string;
  totalCost: number;
  currency: string;
  records: BillingRecord[];
  breakdown: {
    [key in BillingType]?: {
      count: number;
      cost: number;
      quantity: number;
    };
  };
}

/**
 * 计费统计
 */
export interface BillingStatistics {
  totalRecords: number;
  totalCost: number;
  byType: {
    [key in BillingType]?: {
      count: number;
      cost: number;
      quantity: number;
    };
  };
  byStatus: {
    [key in BillingStatus]?: {
      count: number;
      cost: number;
    };
  };
  period?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 趋势数据
 */
export interface TrendData {
  period: string;
  data: Array<{
    date: string;
    totalCost: number;
    totalCalls: number;
  }>;
}

/**
 * 获取当前用户账单
 */
export const getMyBill = (cycle?: string): Promise<ApiResponse<UserBill>> => {
  return request.get('/api/ai-billing/my-bill', { params: { cycle } });
};

/**
 * 获取用户账单
 */
export const getUserBill = (userId: number, cycle?: string): Promise<ApiResponse<UserBill>> => {
  return request.get(`/ai-billing/user/${userId}/bill`, { params: { cycle } });
};

/**
 * 导出账单CSV
 */
export const exportBillCSV = async (userId: number, cycle: string): Promise<Blob> => {
  const response: any = await request.get(`/ai-billing/user/${userId}/export`, {
    params: { cycle, format: 'csv' },
    responseType: 'blob',
  });
  return response.data || response;
};

/**
 * 获取计费统计
 * @param params 查询参数
 * @param params.startDate 开始日期
 * @param params.endDate 结束日期
 * @param params.period 周期 (daily/weekly/monthly/quarterly/yearly)
 */
export const getBillingStatistics = (params?: {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}): Promise<ApiResponse<BillingStatistics>> => {
  return request.get('/api/ai-billing/statistics', { params });
};

/**
 * 更新计费状态
 */
export const updateBillingStatus = (
  billingId: number,
  status: BillingStatus,
  paymentTime?: string
): Promise<ApiResponse> => {
  return request.put(`/ai-billing/record/${billingId}/status`, {
    status,
    paymentTime,
  });
};

/**
 * 批量更新计费状态
 */
export const batchUpdateBillingStatus = (
  billingIds: number[],
  status: BillingStatus
): Promise<ApiResponse<{ affectedCount: number }>> => {
  return request.put('/api/ai-billing/records/batch-status', {
    billingIds,
    status,
  });
};

/**
 * 获取用户计费趋势
 */
export const getUserBillingTrend = (
  userId: number,
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  months: number = 6
): Promise<ApiResponse<TrendData>> => {
  return request.get(`/ai-billing/user/${userId}/trend`, {
    params: { period, months },
  });
};

/**
 * 获取当前用户计费趋势
 */
export const getMyBillingTrend = (
  period: 'daily' | 'weekly' | 'monthly' = 'monthly',
  months: number = 6
): Promise<ApiResponse<TrendData>> => {
  // 假设当前用户ID存储在本地存储或状态中
  const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
  const userId = userInfo.id;
  
  if (!userId) {
    return Promise.reject(new Error('用户未登录'));
  }
  
  return getUserBillingTrend(userId, period, months);
};

/**
 * 格式化计费类型标签
 */
export const formatBillingType = (type: BillingType): string => {
  const labels = {
    [BillingType.TOKEN]: 'Token计费',
    [BillingType.SECOND]: '时长计费',
    [BillingType.COUNT]: '次数计费',
    [BillingType.CHARACTER]: '字符计费',
  };
  return labels[type] || type;
};

/**
 * 格式化计费状态标签
 */
export const formatBillingStatus = (status: BillingStatus): string => {
  const labels = {
    [BillingStatus.PENDING]: '待计费',
    [BillingStatus.CALCULATED]: '已计算',
    [BillingStatus.BILLED]: '已计费',
    [BillingStatus.PAID]: '已支付',
    [BillingStatus.FAILED]: '失败',
    [BillingStatus.REFUNDED]: '已退款',
  };
  return labels[status] || status;
};

/**
 * 获取计费状态颜色
 */
export const getBillingStatusColor = (status: BillingStatus): string => {
  const colors = {
    [BillingStatus.PENDING]: 'info',
    [BillingStatus.CALCULATED]: 'primary',
    [BillingStatus.BILLED]: 'warning',
    [BillingStatus.PAID]: 'success',
    [BillingStatus.FAILED]: 'danger',
    [BillingStatus.REFUNDED]: 'info',
  };
  return colors[status] || 'info';
};

