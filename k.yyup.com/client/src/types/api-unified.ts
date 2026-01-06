/**
 * 统一的API类型定义
 * 
 * 这个文件统一定义所有API相关的类型，解决以下问题：
 * 1. 多个文件中重复定义ApiResponse导致的类型不一致
 * 2. message字段的可选性不统一
 * 3. 响应格式的多样性导致的困惑
 * 
 * 使用指南：
 * - 所有API函数都应该使用这里定义的类型
 * - 不要在其他文件中重复定义ApiResponse
 * - 使用 import type { ApiResponse } from '@/types/api-unified'
 */

// ====== 基础API响应类型 ======

/**
 * 标准API响应格式 - 与后端保持完全一致
 * 所有API都应该返回这种格式的响应
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;  // 注意：这里不是可选的，确保所有响应都有message
  code?: string | number;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

/**
 * 分页响应格式 - 用于列表数据
 */
export interface PaginatedApiResponse<T = any> {
  success: boolean;
  data?: T[];
  items?: T[];  // 兼容后端可能返回items字段
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  message: string;
  code?: string | number;
}

/**
 * 列表响应格式 - 灵活的列表数据响应
 * 支持后端返回的多种格式
 */
export interface ListApiResponse<T = any> {
  success: boolean;
  data?: T[] | T;
  items?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  message: string;
  code?: string | number;
}

// ====== 请求参数类型 ======

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  size?: number; // 兼容后端使用size参数
}

/**
 * 搜索查询参数
 */
export interface SearchParams extends PaginationParams {
  keyword?: string;
  name?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc' | 'ASC' | 'DESC';
}

/**
 * 状态过滤参数
 */
export interface StatusFilterParams {
  status?: string | number;
  active?: boolean;
  enabled?: boolean;
}

// ====== 操作响应类型 ======

/**
 * 创建/更新/删除操作响应
 */
export interface OperationResponse<T = any> {
  success: boolean;
  data?: T;
  message: string;
  id?: string | number;
  code?: string | number;
}

/**
 * 批量操作响应
 */
export interface BatchOperationResponse {
  success: boolean;
  total: number;
  successCount: number;
  failCount: number;
  errors?: Array<{
    id: string | number;
    error: string;
  }>;
  message: string;
}

// ====== 文件操作类型 ======

/**
 * 文件上传响应
 */
export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    originalName?: string;
    size: number;
    type: string;
    path?: string;
  };
  message: string;
}

/**
 * 文件导出响应
 */
export interface ExportResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    downloadUrl?: string;
  };
  message: string;
}

// ====== 错误处理类型 ======

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  message: string;
}

/**
 * 验证错误响应
 */
export interface ValidationErrorResponse extends ErrorResponse {
  error: {
    code: 'VALIDATION_ERROR';
    message: string;
    details: {
      field: string;
      message: string;
    }[];
  };
}

// ====== 认证相关类型 ======

/**
 * 登录响应
 */
export interface LoginResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken?: string;
    user: {
      id: string | number;
      username: string;
      realName?: string;
      email?: string;
      phone?: string;
      avatar?: string;
      role: string;
      roles?: string[];
      permissions?: string[];
    };
    expiresIn?: number;
  };
  message: string;
}

/**
 * 用户信息响应
 */
export interface UserInfoResponse {
  success: boolean;
  data: {
    id: string | number;
    username: string;
    realName?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    role: string;
    roles?: string[];
    permissions?: string[];
    lastLoginAt?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  message: string;
}

// ====== 统计数据类型 ======

/**
 * 统计数据响应
 */
export interface StatsResponse<T = any> {
  success: boolean;
  data: T;
  timestamp?: string;
  message: string;
}

/**
 * 图表数据响应
 */
export interface ChartDataResponse<T = any> {
  success: boolean;
  data: {
    labels: string[];
    datasets: T[];
    options?: any;
  };
  message: string;
}

// ====== 工具类型 ======

/**
 * 提取API响应的数据类型
 */
export type ExtractApiData<T> = T extends ApiResponse<infer U> ? U : never;

/**
 * 提取分页API响应的数据类型
 */
export type ExtractPaginatedData<T> = T extends PaginatedApiResponse<infer U> ? U : never;

/**
 * API函数类型
 */
export type ApiFunction<TParams = any, TResponse = any> = (
  params?: TParams
) => Promise<TResponse>;

/**
 * 分页API函数类型
 */
export type PaginatedApiFunction<TParams = any, TData = any> = (
  params?: TParams & PaginationParams
) => Promise<PaginatedApiResponse<TData>>;

// ====== 类型守卫 ======

/**
 * 检查是否为成功的API响应
 */
export function isSuccessResponse<T>(response: any): response is ApiResponse<T> {
  return response && typeof response.success === 'boolean' && response.success === true;
}

/**
 * 检查是否为错误的API响应
 */
export function isErrorResponse(response: any): response is ErrorResponse {
  return response && typeof response.success === 'boolean' && response.success === false;
}

/**
 * 检查是否为分页响应
 */
export function isPaginatedResponse<T>(response: any): response is PaginatedApiResponse<T> {
  return response && 
         typeof response.success === 'boolean' && 
         (typeof response.total === 'number' || typeof response.page === 'number');
}

// ====== 响应转换工具 ======

/**
 * 标准化API响应
 * 将各种可能的响应格式转换为标准的ApiResponse格式
 */
export function normalizeApiResponse<T>(response: any): ApiResponse<T> {
  // 如果已经是标准格式，直接返回
  if (response && typeof response.success === 'boolean' && response.message) {
    return response;
  }

  // 处理legacy格式 {code: number, data: any, message: string}
  if (response && typeof response.code === 'number') {
    return {
      success: response.code === 0 || response.code === 200,
      data: response.data,
      message: response.message || (response.code === 0 ? '操作成功' : '操作失败'),
      code: response.code
    };
  }

  // 处理纯数据响应
  if (response && typeof response === 'object' && !response.success) {
    return {
      success: true,
      data: response,
      message: '操作成功'
    };
  }

  // 兜底处理
  return {
    success: false,
    message: '响应格式错误'
  };
}

/**
 * 标准化分页响应
 */
export function normalizePaginatedResponse<T>(response: any): PaginatedApiResponse<T> {
  const normalized = normalizeApiResponse(response);

  return {
    success: normalized.success,
    data: response.data,
    items: response.items || response.data || [],
    total: response.total || 0,
    page: response.page || 1,
    pageSize: response.pageSize || response.size || 10,
    totalPages: response.totalPages || Math.ceil((response.total || 0) / (response.pageSize || response.size || 10)),
    message: normalized.message,
    code: normalized.code
  };
}

// ====== 导出默认值 ======

/**
 * 默认成功响应
 */
export const DEFAULT_SUCCESS_RESPONSE: ApiResponse = {
  success: true,
  message: '操作成功'
};

/**
 * 默认错误响应
 */
export const DEFAULT_ERROR_RESPONSE: ErrorResponse = {
  success: false,
  error: {
    code: 'UNKNOWN_ERROR',
    message: '未知错误'
  },
  message: '操作失败'
};

/**
 * 默认分页响应
 */
export const DEFAULT_PAGINATED_RESPONSE: PaginatedApiResponse = {
  success: true,
  items: [],
  total: 0,
  page: 1,
  pageSize: 10,
  message: '获取数据成功'
};