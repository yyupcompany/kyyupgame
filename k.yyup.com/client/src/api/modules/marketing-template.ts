// 营销模板模块API服务
import { request } from '@/utils/request';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
export const MARKETING_TEMPLATE_ENDPOINTS = {
  TEMPLATES: `${API_PREFIX}/marketing/templates`,
  STATS: `${API_PREFIX}/marketing/templates/stats`,
  RECOMMENDATIONS: `${API_PREFIX}/marketing/templates/recommendations`,
  MY_FAVORITES: `${API_PREFIX}/marketing/templates/my-favorites`,
  MY_TEMPLATES: `${API_PREFIX}/marketing/templates/my-templates`,
  SEARCH: `${API_PREFIX}/marketing/templates/search`,
  UPLOAD_THUMBNAIL: `${API_PREFIX}/marketing/templates/upload-thumbnail`,
  UPLOAD_PREVIEW: `${API_PREFIX}/marketing/templates/upload-preview`,
  IMPORT: `${API_PREFIX}/marketing/templates/import`,
  CATEGORIES: `${API_PREFIX}/marketing/templates/categories`,
  TAGS: `${API_PREFIX}/marketing/templates/tags`,
  FEATURES: `${API_PREFIX}/marketing/templates/features`
} as const

/**
 * 营销模板类型枚举
 */
export enum MarketingTemplateType {
  ACTIVITY = 'activity',
  CONTENT = 'content',
  EMAIL = 'email',
  SMS = 'sms',
  POSTER = 'poster',
  SOCIAL_MEDIA = 'social_media'
}

/**
 * 营销模板行业枚举
 */
export enum MarketingTemplateIndustry {
  EDUCATION = 'education',
  TRAINING = 'training',
  EARLY_EDUCATION = 'early_education',
  CHILD_CARE = 'child_care',
  ART = 'art',
  SPORTS = 'sports'
}

/**
 * 营销模板状态枚举
 */
export enum MarketingTemplateStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * 营销模板数据接口
 */
export interface MarketingTemplate {
  id: string;
  name: string;
  description: string;
  type: MarketingTemplateType;
  industry: MarketingTemplateIndustry;
  targetAudience: string;
  purpose: string;
  thumbnail: string;
  preview: string;
  content: string;
  variables?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'image' | 'url';
    label: string;
    required: boolean;
    defaultValue?: any;
    options?: string[];
  }>;
  tags: string[];
  author: string;
  authorId: string;
  isPublic: boolean;
  usageCount: number;
  favoriteCount: number;
  rating: number;
  ratingCount: number;
  conversionRate: number;
  features: string[];
  scenario?: string;
  instructions?: string;
  status: MarketingTemplateStatus;
  createdAt: string;
  updatedAt: string;
  isHot?: boolean;
  isNew?: boolean;
}

/**
 * 营销模板创建参数接口
 */
export interface MarketingTemplateCreateParams {
  name: string;
  description: string;
  type: MarketingTemplateType;
  industry: MarketingTemplateIndustry;
  targetAudience: string;
  purpose: string;
  content: string;
  variables?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'image' | 'url';
    label: string;
    required: boolean;
    defaultValue?: any;
    options?: string[];
  }>;
  tags: string[];
  isPublic: boolean;
  scenario?: string;
  instructions?: string;
}

/**
 * 营销模板更新参数接口
 */
export interface MarketingTemplateUpdateParams {
  name?: string;
  description?: string;
  content?: string;
  variables?: Array<{
    name: string;
    type: 'text' | 'number' | 'date' | 'image' | 'url';
    label: string;
    required: boolean;
    defaultValue?: any;
    options?: string[];
  }>;
  tags?: string[];
  isPublic?: boolean;
  scenario?: string;
  instructions?: string;
  status?: MarketingTemplateStatus;
}

/**
 * 营销模板查询参数接口
 */
export interface MarketingTemplateQueryParams {
  keyword?: string;
  type?: MarketingTemplateType;
  industry?: MarketingTemplateIndustry;
  targetAudience?: string;
  tags?: string[];
  author?: string;
  isPublic?: boolean;
  minRating?: number;
  features?: string[];
  status?: MarketingTemplateStatus;
  sortBy?: 'createdAt' | 'updatedAt' | 'usageCount' | 'rating' | 'conversionRate';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

/**
 * 营销模板统计接口
 */
export interface MarketingTemplateStats {
  total: number;
  byType: Record<MarketingTemplateType, number>;
  byIndustry: Record<MarketingTemplateIndustry, number>;
  popular: number;
  new: number;
  favorites: number;
  averageRating: number;
  averageUsageCount: number;
  averageConversionRate: number;
}

/**
 * 营销模板使用记录接口
 */
export interface TemplateUsageRecord {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  usageDate: string;
  purpose: string;
  customVariables?: Record<string, any>;
  result?: {
    views?: number;
    conversions?: number;
    conversionRate?: number;
  };
  createdAt: string;
}

/**
 * 营销模板评价接口
 */
export interface TemplateReview {
  id: string;
  templateId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * 营销模板收藏接口
 */
export interface TemplateFavorite {
  id: string;
  templateId: string;
  userId: string;
  createdAt: string;
}

/**
 * 获取营销模板列表
 * @param {MarketingTemplateQueryParams} params - 查询参数
 * @returns {Promise<{ items: MarketingTemplate[], total: number }>} 营销模板列表和总数
 */
export const getMarketingTemplateList = (params: MarketingTemplateQueryParams) => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.TEMPLATES, { params });
};

/**
 * 获取营销模板详情
 * @param {string} id - 模板ID
 * @returns {Promise<MarketingTemplate>} 营销模板详情
 */
export const getMarketingTemplateDetail = (id: string) => {
  return request.get(`/api/marketing/templates/${id}`);
};

/**
 * 创建营销模板
 * @param {MarketingTemplateCreateParams} data - 模板创建参数
 * @returns {Promise<MarketingTemplate>} 创建的营销模板
 */
export const createMarketingTemplate = (data: MarketingTemplateCreateParams) => {
  return request.post(MARKETING_TEMPLATE_ENDPOINTS.TEMPLATES, data);
};

/**
 * 更新营销模板
 * @param {string} id - 模板ID
 * @param {MarketingTemplateUpdateParams} data - 模板更新参数
 * @returns {Promise<MarketingTemplate>} 更新后的营销模板
 */
export const updateMarketingTemplate = (id: string, data: MarketingTemplateUpdateParams) => {
  return request.put(`/api/marketing/templates/${id}`, data);
};

/**
 * 删除营销模板
 * @param {string} id - 模板ID
 * @returns {Promise<void>}
 */
export const deleteMarketingTemplate = (id: string) => {
  return request.del(`/api/marketing/templates/${id}`);
};

/**
 * 复制营销模板
 * @param {string} id - 模板ID
 * @param {Object} data - 复制参数
 * @returns {Promise<MarketingTemplate>} 复制的营销模板
 */
export const duplicateMarketingTemplate = (id: string, data?: {
  name?: string;
  description?: string;
  isPublic?: boolean;
}) => {
  return request.post(`/api/marketing/templates/${id}/duplicate`, data);
};

/**
 * 发布营销模板
 * @param {string} id - 模板ID
 * @returns {Promise<MarketingTemplate>} 更新后的营销模板
 */
export const publishMarketingTemplate = (id: string) => {
  return request.patch(`/api/marketing/templates/${id}/publish`);
};

/**
 * 归档营销模板
 * @param {string} id - 模板ID
 * @returns {Promise<MarketingTemplate>} 更新后的营销模板
 */
export const archiveMarketingTemplate = (id: string) => {
  return request.patch(`/api/marketing/templates/${id}/archive`);
};

/**
 * 获取营销模板统计
 * @returns {Promise<MarketingTemplateStats>} 营销模板统计
 */
export const getMarketingTemplateStats = () => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.STATS);
};

/**
 * 获取推荐模板
 * @param {Object} params - 推荐参数
 * @returns {Promise<MarketingTemplate[]>} 推荐模板列表
 */
export const getRecommendedTemplates = (params: {
  type?: MarketingTemplateType;
  industry?: MarketingTemplateIndustry;
  targetAudience?: string;
  limit?: number;
} = {}) => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.RECOMMENDATIONS, { params });
};

/**
 * 应用营销模板
 * @param {string} id - 模板ID
 * @param {Object} data - 应用参数
 * @returns {Promise<{ result: any, template: MarketingTemplate }>} 应用结果
 */
export const applyMarketingTemplate = (id: string, data: {
  variables?: Record<string, any>;
  purpose?: string;
  targetId?: string;
}) => {
  return request.post(`/api/marketing/templates/${id}/apply`, data);
};

/**
 * 获取模板使用记录
 * @param {string} id - 模板ID
 * @param {Object} params - 查询参数
 * @returns {Promise<{ items: TemplateUsageRecord[], total: number }>} 使用记录列表和总数
 */
export const getTemplateUsageRecords = (id: string, params: {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
} = {}) => {
  return request.get(`/api/marketing/templates/${id}/usage`, { params });
};

/**
 * 获取模板评价
 * @param {string} id - 模板ID
 * @param {Object} params - 查询参数
 * @returns {Promise<{ items: TemplateReview[], total: number }>} 评价列表和总数
 */
export const getTemplateReviews = (id: string, params: {
  page?: number;
  pageSize?: number;
  rating?: number;
} = {}) => {
  return request.get(`/api/marketing/templates/${id}/reviews`, { params });
};

/**
 * 创建模板评价
 * @param {string} id - 模板ID
 * @param {Object} data - 评价数据
 * @returns {Promise<TemplateReview>} 创建的评价
 */
export const createTemplateReview = (id: string, data: {
  rating: number;
  comment?: string;
}) => {
  return request.post(`/api/marketing/templates/${id}/reviews`, data);
};

/**
 * 更新模板评价
 * @param {string} id - 模板ID
 * @param {string} reviewId - 评价ID
 * @param {Object} data - 评价更新数据
 * @returns {Promise<TemplateReview>} 更新后的评价
 */
export const updateTemplateReview = (id: string, reviewId: string, data: {
  rating?: number;
  comment?: string;
}) => {
  return request.put(`/api/marketing/templates/${id}/reviews/${reviewId}`, data);
};

/**
 * 删除模板评价
 * @param {string} id - 模板ID
 * @param {string} reviewId - 评价ID
 * @returns {Promise<void>}
 */
export const deleteTemplateReview = (id: string, reviewId: string) => {
  return request.del(`/api/marketing/templates/${id}/reviews/${reviewId}`);
};

/**
 * 添加模板收藏
 * @param {string} id - 模板ID
 * @returns {Promise<TemplateFavorite>} 创建的收藏记录
 */
export const addTemplateFavorite = (id: string) => {
  return request.post(`/api/marketing/templates/${id}/favorites`);
};

/**
 * 取消模板收藏
 * @param {string} id - 模板ID
 * @returns {Promise<void>}
 */
export const removeTemplateFavorite = (id: string) => {
  return request.del(`/api/marketing/templates/${id}/favorites`);
};

/**
 * 获取我的模板收藏
 * @param {Object} params - 查询参数
 * @returns {Promise<{ items: MarketingTemplate[], total: number }>} 收藏的模板列表和总数
 */
export const getMyTemplateFavorites = (params: {
  type?: MarketingTemplateType;
  industry?: MarketingTemplateIndustry;
  page?: number;
  pageSize?: number;
} = {}) => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.MY_FAVORITES, { params });
};

/**
 * 获取我的模板
 * @param {Object} params - 查询参数
 * @returns {Promise<{ items: MarketingTemplate[], total: number }}> 我的模板列表和总数
 */
export const getMyTemplates = (params: {
  type?: MarketingTemplateType;
  status?: MarketingTemplateStatus;
  page?: number;
  pageSize?: number;
} = {}) => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.MY_TEMPLATES, { params });
};

/**
 * 搜索营销模板
 * @param {Object} params - 搜索参数
 * @returns {Promise<{ items: MarketingTemplate[], total: number }>} 搜索结果
 */
export const searchMarketingTemplates = (params: {
  keyword: string;
  type?: MarketingTemplateType;
  industry?: MarketingTemplateIndustry;
  targetAudience?: string;
  tags?: string[];
  features?: string[];
  minRating?: number;
  page?: number;
  pageSize?: number;
}) => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.SEARCH, { params });
};

/**
 * 上传模板缩略图
 * @param {FormData} file - 文件数据
 * @returns {Promise<{ url: string, filename: string }>} 上传结果
 */
export const uploadTemplateThumbnail = (file: FormData) => {
  return request.post(MARKETING_TEMPLATE_ENDPOINTS.UPLOAD_THUMBNAIL, file, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 上传模板预览图
 * @param {FormData} file - 文件数据
 * @returns {Promise<{ url: string, filename: string }>} 上传结果
 */
export const uploadTemplatePreview = (file: FormData) => {
  return request.post(MARKETING_TEMPLATE_ENDPOINTS.UPLOAD_PREVIEW, file, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 导出营销模板
 * @param {string} id - 模板ID
 * @param {string} format - 导出格式
 * @returns {Promise<Blob>} 导出的文件Blob
 */
export const exportMarketingTemplate = (id: string, format: 'json' | 'pdf' | 'docx') => {
  return request.request({
    url: `/api/marketing/templates/${id}/export`,
    method: 'get',
    params: { format },
    responseType: 'blob'
  });
};

/**
 * 批量导入营销模板
 * @param {FormData} file - 文件数据
 * @returns {Promise<{ success: number, failed: number, errors: string[] }>} 导入结果
 */
export const importMarketingTemplates = (file: FormData) => {
  return request.post(MARKETING_TEMPLATE_ENDPOINTS.IMPORT, file, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

/**
 * 获取模板分类列表
 * @returns {Promise<Array<{ name: string, count: number }>>} 分类列表
 */
export const getTemplateCategories = () => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.CATEGORIES);
};

/**
 * 获取模板标签列表
 * @returns {Promise<Array<{ name: string, count: number }>>} 标签列表
 */
export const getTemplateTags = () => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.TAGS);
};

/**
 * 获取模板特性列表
 * @returns {Promise<Array<string>}> 特性列表
 */
export const getTemplateFeatures = () => {
  return request.get(MARKETING_TEMPLATE_ENDPOINTS.FEATURES);
};