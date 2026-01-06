// 营销管理模块API服务
import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
export const MARKETING_ENDPOINTS = {
  ACTIVITIES: `${API_PREFIX}/activities`,
  CHANNELS: `${API_PREFIX}/marketing/channels`,
  ANALYTICS: `${API_PREFIX}/marketing/analytics`,
  REFERRALS_MY_CODES: `${API_PREFIX}/marketing/referrals/my-codes`,
  REFERRALS_GENERATE: `${API_PREFIX}/marketing/referrals/generate`,
  REFERRALS_POSTER_TEMPLATES: `${API_PREFIX}/marketing/referrals/poster-templates`,
  REFERRALS_GENERATE_POSTER: `${API_PREFIX}/marketing/referrals/generate-poster`
} as const

/**
 * 营销活动状态枚举
 */
export enum MarketingActivityStatus {
  DRAFT = 'DRAFT',
  PLANNED = 'PLANNED',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * 营销活动类型枚举
 */
export enum MarketingActivityType {
  OPEN_DAY = 'OPEN_DAY',
  WORKSHOP = 'WORKSHOP',
  SEMINAR = 'SEMINAR',
  EXHIBITION = 'EXHIBITION',
  ONLINE = 'ONLINE',
  COMMUNITY = 'COMMUNITY',
  OTHER = 'OTHER'
}

/**
 * 营销活动数据接口
 */
export interface MarketingActivity {
  id: string;
  title: string;
  description: string;
  type: MarketingActivityType;
  status: MarketingActivityStatus;
  startDate: string;
  endDate: string;
  location?: string;
  budget: number;
  expenditure: number;
  targetAudience: string;
  estimatedParticipants: number;
  actualParticipants: number;
  leadCount: number;
  conversionCount: number;
  attachments?: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
  }>;
  organizer: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 营销活动创建参数接口
 */
export interface MarketingActivityCreateParams {
  title: string;
  description: string;
  type: MarketingActivityType;
  status: MarketingActivityStatus;
  startDate: string;
  endDate: string;
  location?: string;
  budget: number;
  targetAudience: string;
  estimatedParticipants: number;
  organizer: string;
}

/**
 * 营销活动查询参数接口
 */
export interface MarketingActivityQueryParams {
  keyword?: string;
  type?: MarketingActivityType;
  status?: MarketingActivityStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}

/**
 * 营销渠道数据接口
 */
export interface MarketingChannel {
  id: string;
  name: string;
  type: 'ONLINE' | 'OFFLINE' | 'SOCIAL' | 'PARTNERSHIP' | 'OTHER';
  description: string;
  cost: number;
  leadCount: number;
  conversionCount: number;
  conversionRate: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 营销分析数据接口
 */
export interface MarketingAnalytics {
  totalActivities: number;
  ongoingActivities: number;
  totalLeads: number;
  totalConversions: number;
  conversionRate: number;
  totalExpenditure: number;
  budgetUtilization: number;
  costPerLead: number;
  costPerConversion: number;
  channelPerformance: Array<{
    channel: string;
    leadCount: number;
    conversionCount: number;
    conversionRate: number;
    cost: number;
    costPerLead: number;
    costPerConversion: number;
  }>;
  activityPerformance: Array<{
    activityId: string;
    activityTitle: string;
    leadCount: number;
    conversionCount: number;
    conversionRate: number;
    expenditure: number;
    costPerLead: number;
    costPerConversion: number;
  }>;
  trendsData: Array<{
    period: string;
    leads: number;
    conversions: number;
    expenditure: number;
  }>;
}

/**
 * 获取营销活动列表
 * @param {MarketingActivityQueryParams} params - 查询参数
 * @returns {Promise<{ items: MarketingActivity[], total: number }>} 营销活动列表和总数
 */
export const getMarketingActivityList = (params: MarketingActivityQueryParams) => {
  return request.get(MARKETING_ENDPOINTS.ACTIVITIES, { params });
};

/**
 * 获取营销活动详情
 * @param {string} id - 营销活动ID
 * @returns {Promise<MarketingActivity>} 营销活动详情
 */
export const getMarketingActivityDetail = (id: string) => {
  return request.get(`/api/activities/${id}`);
};

/**
 * 创建营销活动
 * @param {MarketingActivityCreateParams} data - 营销活动创建参数
 * @returns {Promise<MarketingActivity>} 创建的营销活动
 */
export const createMarketingActivity = (data: MarketingActivityCreateParams) => {
  return request.post(MARKETING_ENDPOINTS.ACTIVITIES, data);
};

/**
 * 更新营销活动
 * @param {string} id - 营销活动ID
 * @param {Partial<MarketingActivityCreateParams>} data - 营销活动更新参数
 * @returns {Promise<MarketingActivity>} 更新后的营销活动
 */
export const updateMarketingActivity = (id: string, data: Partial<MarketingActivityCreateParams>) => {
  return request.put(`/api/activities/${id}`, data);
};

/**
 * 删除营销活动
 * @param {string} id - 营销活动ID
 * @returns {Promise<void>}
 */
export const deleteMarketingActivity = (id: string) => {
  return request.del(`/api/activities/${id}`);
};

/**
 * 更新营销活动状态
 * @param {string} id - 营销活动ID
 * @param {MarketingActivityStatus} status - 营销活动状态
 * @returns {Promise<MarketingActivity>} 更新后的营销活动
 */
export const updateMarketingActivityStatus = (id: string, status: MarketingActivityStatus) => {
  return request.put(`/api/activities/${id}/status`, { status });
};

/**
 * 更新营销活动结果数据
 * @param {string} id - 营销活动ID
 * @param {Object} data - 结果数据
 * @returns {Promise<MarketingActivity>} 更新后的营销活动
 */
export const updateMarketingActivityResults = (id: string, data: {
  actualParticipants: number;
  leadCount: number;
  conversionCount: number;
  expenditure: number;
}) => {
  return request.patch(`/api/activities/${id}/results`, data);
};

/**
 * 获取营销渠道列表
 * @returns {Promise<MarketingChannel[]>} 营销渠道列表
 */
export const getMarketingChannelList = () => {
  return request.get(MARKETING_ENDPOINTS.CHANNELS);
};

/**
 * 创建营销渠道
 * @param {Object} data - 渠道数据
 * @returns {Promise<MarketingChannel>} 创建的营销渠道
 */
export const createMarketingChannel = (data: {
  name: string;
  type: 'ONLINE' | 'OFFLINE' | 'SOCIAL' | 'PARTNERSHIP' | 'OTHER';
  description: string;
  cost: number;
}) => {
  return request.post(MARKETING_ENDPOINTS.CHANNELS, data);
};

/**
 * 更新营销渠道
 * @param {string} id - 渠道ID
 * @param {Object} data - 渠道更新数据
 * @returns {Promise<MarketingChannel>} 更新后的营销渠道
 */
export const updateMarketingChannel = (id: string, data: Partial<{
  name: string;
  type: 'ONLINE' | 'OFFLINE' | 'SOCIAL' | 'PARTNERSHIP' | 'OTHER';
  description: string;
  cost: number;
  active: boolean;
}>) => {
  return request.patch(`/api/marketing/channels/${id}`, data);
};

/**
 * 删除营销渠道
 * @param {string} id - 渠道ID
 * @returns {Promise<void>}
 */
export const deleteMarketingChannel = (id: string) => {
  return request.del(`/api/marketing/channels/${id}`);
};

/**
 * 获取营销分析数据
 * @param {Object} params - 查询参数
 * @returns {Promise<MarketingAnalytics>} 营销分析数据
 */
export const getMarketingAnalytics = (params: {
  startDate?: string;
  endDate?: string;
  channelId?: string;
  activityType?: MarketingActivityType;
} = {}) => {
  return request.get(MARKETING_ENDPOINTS.ANALYTICS, { params });
};

/**
 * 导出营销活动数据
 * @param {string} id - 营销活动ID
 * @param {string} format - 导出格式，'excel'或'pdf'
 * @returns {Promise<Blob>} 导出的文件Blob
 */
export const exportMarketingActivityData = (id: string, format: 'excel' | 'pdf') => {
  return request.request({
    url: `/api/activities/${id}/export`,
    method: 'get',
    params: { format },
    responseType: 'blob'
  });
};

/**
 * 导出营销分析报告
 * @param {Object} params - 查询参数
 * @param {string} format - 导出格式，'excel'或'pdf'
 * @returns {Promise<Blob>} 导出的文件Blob
 */
export const exportMarketingAnalyticsReport = (params: {
  startDate?: string;
  endDate?: string;
  channelId?: string;
  activityType?: MarketingActivityType;
} = {}, format: 'excel' | 'pdf') => {
  return request.request({
    url: '/api6970',
    method: 'get',
    params: { ...params, format },
    responseType: 'blob'
  });
};

// 推广码相关接口
export interface ReferralCode {
  id: string;
  referral_code: string;
  title: string;
  description: string;
  activity_name?: string;
  status: 'active' | 'inactive' | 'expired';
  created_at: string;
  expires_at: string;
  usage_limit: number;
  usage_count: number;
  qr_code_url?: string;
  poster_url?: string;
  is_custom: boolean;
  stats: {
    total_referrals: number;
    converted_referrals: number;
    weekly_referrals: number;
    conversion_rate: number;
  };
}

export interface ReferralCodeCreateParams {
  activity_id?: string;
  title: string;
  description: string;
  validity_days: number;
  usage_limit: number;
  is_custom: boolean;
}

export interface ReferralPosterParams {
  template_id: number;
  main_title: string;
  sub_title: string;
  contact_phone: string;
  address: string;
  referral_code: string;
  referral_link: string;
  kindergarten_name?: string;
}

export interface ReferralCodeStats {
  basic_info: {
    referral_code: string;
    title: string;
    description: string;
    created_at: string;
    expires_at: string;
    status: string;
    usage_limit: number;
    usage_count: number;
  };
  referral_stats: {
    total_referrals: number;
    converted_referrals: number;
    weekly_referrals: number;
    monthly_referrals: number;
    conversion_rate: number;
  };
  click_stats: {
    total_clicks: number;
    active_days: number;
    unique_visitors: number;
  };
}

/**
 * 获取我的推广码列表
 * @returns {Promise<{ items: ReferralCode[], total: number }>} 我的推广码列表
 */
export const getMyReferralCodes = () => {
  return request.get(MARKETING_ENDPOINTS.REFERRALS_MY_CODES);
};

/**
 * 生成推广码
 * @param {ReferralCodeCreateParams} data - 推广码生成参数
 * @returns {Promise<ReferralCode>} 生成的推广码
 */
export const generateReferralCode = (data: ReferralCodeCreateParams) => {
  return request.post(MARKETING_ENDPOINTS.REFERRALS_GENERATE, data);
};

/**
 * 获取推广海报模板列表
 * @returns {Promise<Array>} 海报模板列表
 */
export const getPosterTemplates = () => {
  return request.get(MARKETING_ENDPOINTS.REFERRALS_POSTER_TEMPLATES);
};

/**
 * 生成推广海报
 * @param {ReferralPosterParams} data - 海报生成参数
 * @returns {Promise<{ poster_url: string, template_id: number, generated_at: string }>} 海报生成结果
 */
export const generateReferralPoster = (data: ReferralPosterParams) => {
  return request.post(MARKETING_ENDPOINTS.REFERRALS_GENERATE_POSTER, data);
};

/**
 * 获取推广码统计信息
 * @param {string} code - 推广码
 * @returns {Promise<ReferralCodeStats>} 推广码统计信息
 */
export const getReferralCodeStats = (code: string) => {
  return request.get(`/api/marketing/referrals/${code}/stats`);
};

/**
 * 记录推广码点击
 * @param {string} code - 推广码
 * @param {Object} data - 点击信息
 * @returns {Promise<void>}
 */
export const trackReferralClick = (code: string, data: {
  ip_address: string;
  user_agent: string;
  referrer?: string;
}) => {
  return request.post(`/api/marketing/referrals/${code}/track`, data);
}; 