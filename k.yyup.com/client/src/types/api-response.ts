/**
 * API响应通用类型定义
 */

/**
 * 标准API响应格式
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  code?: string | number;
  error?: string;
}

/**
 * 分页响应格式
 */
export interface PaginatedResponse<T = any> {
  success: boolean;
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages?: number;
  message?: string;
}

/**
 * 列表响应格式 (支持多种响应格式)
 */
export interface ListResponse<T = any> {
  success: boolean;
  data?: T[] | T;
  items?: T[];
  total?: number;
  page?: number;
  pageSize?: number;
  message?: string;
}

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number;
  pageSize?: number;
  size?: number; // 兼容后端size参数
}

/**
 * 搜索查询参数
 */
export interface SearchParams extends PaginationParams {
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 操作结果响应
 */
export interface OperationResponse {
  success: boolean;
  message: string;
  data?: {
    id?: string | number;
    [key: string]: any;
  };
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    size?: number;
    type?: string;
  };
  message?: string;
}

/**
 * 错误响应格式
 */
export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string | number;
  details?: any;
}

/**
 * 统一的HTTP响应类型
 */
export type HttpResponse<T = any> = ApiResponse<T> | PaginatedResponse<T> | ErrorResponse;