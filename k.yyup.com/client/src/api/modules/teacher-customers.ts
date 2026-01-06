// 教师客户管理API服务
import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
const TEACHER_CUSTOMERS_API_ENDPOINTS = {
  STATS: `${API_PREFIX}/teacher/customers/stats`,
  CONVERSION_FUNNEL: `${API_PREFIX}/teacher/customers/conversion-funnel`,
  LIST: `${API_PREFIX}/teacher/customers/list`,
  BASE: `${API_PREFIX}/teacher/customers`,
  FOLLOW: (customerId: string) => `${API_PREFIX}/teacher/customers/${customerId}/follow`,
  STATUS: (customerId: string) => `${API_PREFIX}/teacher/customers/${customerId}/status`,
  FOLLOW_RECORDS: (customerId: string) => `${API_PREFIX}/teacher/customers/${customerId}/follow-records`,
  FOLLOW_RECORD_BY_ID: (customerId: string, recordId: string) => `${API_PREFIX}/teacher/customers/${customerId}/follow-records/${recordId}`
} as const;

/**
 * 客户状态枚举
 */
export enum CustomerStatus {
  NEW = 'NEW',
  FOLLOWING = 'FOLLOWING',
  CONVERTED = 'CONVERTED',
  LOST = 'LOST'
}

/**
 * 客户来源枚举
 */
export enum CustomerSource {
  ONLINE = 'ONLINE',
  REFERRAL = 'REFERRAL',
  VISIT = 'VISIT',
  PHONE = 'PHONE',
  OTHER = 'OTHER'
}

/**
 * 客户数据接口
 */
export interface Customer {
  id: string;
  customerName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE';
  childName: string;
  childAge: number;
  source: CustomerSource;
  status: CustomerStatus;
  lastFollowDate?: string;
  assignDate: string;
  remarks?: string;
  createTime: string;
  assignedBy: string;
}

/**
 * 客户统计数据接口
 */
export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  pendingFollow: number;
  convertedCustomers: number;
  lostCustomers: number;
  conversionRate: number;
}

/**
 * 转化漏斗阶段接口
 */
export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

/**
 * 转化漏斗数据接口
 */
export interface ConversionFunnelData {
  stages: FunnelStage[];
  conversionRate: number;
  totalLeads: number;
}

/**
 * 跟进记录接口
 */
export interface FollowRecord {
  id: string;
  followType: string;
  content: string;
  nextFollowDate?: string;
  followDate: string;
  teacherName: string;
}

/**
 * 客户查询参数接口
 */
export interface CustomerQueryParams {
  page?: number;
  pageSize?: number;
  customerName?: string;
  phone?: string;
  status?: CustomerStatus;
  source?: CustomerSource;
}

/**
 * 跟进记录创建参数接口
 */
export interface FollowRecordCreateParams {
  followType: string;
  content: string;
  nextFollowDate?: string;
}

/**
 * 获取教师客户统计数据
 * @returns {Promise<CustomerStats>} 客户统计数据
 */
export const getCustomerStats = () => {
  return request.get(TEACHER_CUSTOMERS_API_ENDPOINTS.STATS);
};

/**
 * 获取客户转化漏斗数据
 * @returns {Promise<ConversionFunnelData>} 转化漏斗数据
 */
export const getConversionFunnel = () => {
  return request.get(TEACHER_CUSTOMERS_API_ENDPOINTS.CONVERSION_FUNNEL);
};

/**
 * 获取教师客户列表
 * @param {CustomerQueryParams} params - 查询参数
 * @returns {Promise<{ list: Customer[], total: number, page: number, pageSize: number, pages: number }>} 客户列表
 */
export const getCustomerList = (params: CustomerQueryParams) => {
  return request.get(TEACHER_CUSTOMERS_API_ENDPOINTS.LIST, { params });
};

/**
 * 添加客户跟进记录
 * @param {string} customerId - 客户ID
 * @param {FollowRecordCreateParams} data - 跟进记录数据
 * @returns {Promise<{ success: boolean, message: string }>} 操作结果
 */
export const addFollowRecord = (customerId: string, data: FollowRecordCreateParams) => {
  return request.post(TEACHER_CUSTOMERS_API_ENDPOINTS.FOLLOW(customerId), data);
};

/**
 * 更新客户状态
 * @param {string} customerId - 客户ID
 * @param {CustomerStatus} status - 新状态
 * @param {string} remarks - 备注
 * @returns {Promise<{ success: boolean, message: string }>} 操作结果
 */
export const updateCustomerStatus = (customerId: string, status: CustomerStatus, remarks?: string) => {
  return request.put(TEACHER_CUSTOMERS_API_ENDPOINTS.STATUS(customerId), { status, remarks });
};

/**
 * 获取客户跟进记录
 * @param {string} customerId - 客户ID
 * @returns {Promise<FollowRecord[]>} 跟进记录列表
 */
export const getFollowRecords = (customerId: string) => {
  return request.get(TEACHER_CUSTOMERS_API_ENDPOINTS.FOLLOW_RECORDS(customerId));
};

/**
 * 创建新客户
 * @param {object} data - 客户数据
 * @returns {Promise<{ success: boolean, message: string, data: Customer }>} 操作结果
 */
export interface CustomerCreateParams {
  name: string;
  phone: string;
  childName: string;
  childAge: number;
  source: string;
  remark?: string;
}

export const createCustomer = (data: CustomerCreateParams) => {
  return request.post(TEACHER_CUSTOMERS_API_ENDPOINTS.BASE, data);
};

/**
 * 更新跟进记录
 * @param {string} customerId - 客户ID
 * @param {string} recordId - 记录ID
 * @param {FollowRecordCreateParams} data - 更新数据
 * @returns {Promise<{ success: boolean, message: string }>} 操作结果
 */
export const updateFollowRecord = (customerId: string, recordId: string, data: FollowRecordCreateParams) => {
  return request.put(TEACHER_CUSTOMERS_API_ENDPOINTS.FOLLOW_RECORD_BY_ID(customerId, recordId), data);
};

/**
 * 删除跟进记录
 * @param {string} customerId - 客户ID
 * @param {string} recordId - 记录ID
 * @returns {Promise<{ success: boolean, message: string }>} 操作结果
 */
export const deleteFollowRecord = (customerId: string, recordId: string) => {
  return request.delete(TEACHER_CUSTOMERS_API_ENDPOINTS.FOLLOW_RECORD_BY_ID(customerId, recordId));
};

/**
 * 教师专用：获取客户跟踪统计数据（包含今日跟进、待跟进等）
 * @returns {Promise<{ totalCustomers: number, todayFollows: number, pendingFollows: number, successRate: number }>} 跟踪统计
 */
export const getCustomerTrackingStats = async () => {
  try {
    const [statsResponse, listResponse] = await Promise.all([
      request.get(TEACHER_CUSTOMERS_API_ENDPOINTS.STATS),
      request.get(TEACHER_CUSTOMERS_API_ENDPOINTS.LIST, { params: { pageSize: 1000 } })
    ]);

    const stats = statsResponse.data;
    const customers = listResponse.data?.list || [];
    
    // 计算今日跟进数量
    const today = new Date().toDateString();
    const todayFollows = customers.filter((c: any) => 
      c.lastFollowDate && new Date(c.lastFollowDate).toDateString() === today
    ).length;
    
    // 计算待跟进数量（状态为NEW或超过3天未跟进的FOLLOWING客户）
    const threeDaysAgo = new Date();
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
    const pendingFollows = customers.filter((c: any) => 
      c.status === 'NEW' || 
      (c.status === 'FOLLOWING' && (!c.lastFollowDate || new Date(c.lastFollowDate) < threeDaysAgo))
    ).length;

    return {
      data: {
        totalCustomers: stats.totalCustomers || 0,
        todayFollows,
        pendingFollows,
        successRate: stats.conversionRate || 0
      }
    };
  } catch (error) {
    console.error('获取客户跟踪统计失败:', error);
    throw error;
  }
};
