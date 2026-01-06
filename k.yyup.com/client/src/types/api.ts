/**
 * API响应基础类型定义
 * 与后端 server/src/utils/apiResponse.ts 保持一致
 */
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: {
    code: string;
    message: string;
  }
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
}

/**
 * 排序参数
 */
export interface SortParams {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * 查询参数基础类型
 */
export interface QueryParams extends PaginationParams, SortParams {
  keyword?: string
  status?: string
  startDate?: string
  endDate?: string
  [key: string]: any
}

/**
 * 错误响应类型
 */
export interface ErrorResponse {
  success: false
  error: string
  message?: string
  code?: number
  details?: any
}

/**
 * 成功响应类型
 */
export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  code?: number
}

/**
 * API请求配置
 */
export interface RequestConfig {
  timeout?: number
  headers?: Record<string, string>
  retries?: number
  retryDelay?: number
}

/**
 * 文件上传响应
 */
export interface UploadResponse {
  url: string
  filename: string
  originalName: string
  size: number
  mimeType: string
  path?: string
}

/**
 * 批量操作响应
 */
export interface BatchOperationResponse {
  success: number
  failed: number
  total: number
  errors?: Array<{
    id: string | number
    error: string
  }>
}

/**
 * 导出响应
 */
export interface ExportResponse {
  downloadUrl: string
  filename: string
  size?: number
  expiresAt?: string
}

/**
 * 统计数据响应
 */
export interface StatisticsResponse {
  total: number
  active: number
  inactive: number
  growth: number
  trend: Array<{
    date: string
    value: number
  }>
}

/**
 * 验证响应
 */
export interface ValidationResponse {
  isValid: boolean
  errors: string[]
  warnings?: string[]
  suggestions?: string[]
}

// 导出常用的响应类型别名
export type ApiSuccessResponse<T = any> = SuccessResponse<T>
export type ApiErrorResponse = ErrorResponse
export type ApiPaginatedResponse<T = any> = ApiResponse<PaginatedResponse<T>>

// 默认导出
export default ApiResponse