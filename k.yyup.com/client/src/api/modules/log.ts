import { request } from '../../utils/request';
import type { ApiResponse } from '../../utils/request';
import type { PaginationParams, PaginatedResult } from '../../types/system';
import { API_PREFIX } from '../endpoints/base';

// API端点常量
const LOG_ENDPOINTS = {
  BASE: `${API_PREFIX}/system-logs`,
  BY_ID: (id: string | number) => `${API_PREFIX}/system-logs/${id}`,
  EXPORT: `${API_PREFIX}/system-logs/export`,
  BATCH_DELETE: `${API_PREFIX}/system-logs/batch`,
  CLEAR: `${API_PREFIX}/system-logs/clear`
} as const;

/**
 * API响应类型
 */
interface ApiResponseType<T = any> {
  items?: T[];
  total?: number;
  success?: boolean;
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * 日志级别
 */
export enum LogLevel {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

/**
 * 系统日志信息
 */
export interface SystemLog {
  id: string;
  timestamp: string;
  level: LogLevel;
  message: string;
  module: string;
  userId?: string;
  userName?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
}

/**
 * 系统日志查询参数
 */
export interface SystemLogQueryParams {
  page?: number;
  pageSize?: number;
  level?: LogLevel;
  module?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * 获取系统日志列表
 * @param params 查询参数
 * @returns 系统日志列表和总数
 */
export function getSystemLogList(params?: SystemLogQueryParams): Promise<ApiResponseType<SystemLog>> {
  return request.get(LOG_ENDPOINTS.BASE, { params });
}

/**
 * 获取系统日志详情
 * @param id 日志ID
 * @returns 系统日志详情
 */
export function getSystemLogDetail(id: string): Promise<ApiResponseType<SystemLog>> {
  return request.get(LOG_ENDPOINTS.BY_ID(id));
}

/**
 * 删除系统日志
 * @param id 日志ID
 * @returns 删除结果
 */
export function deleteSystemLog(id: string): Promise<ApiResponseType<{ success: boolean }>> {
  return request.del(LOG_ENDPOINTS.BY_ID(id));
}

/**
 * 批量删除系统日志
 * @param ids 日志ID数组
 * @returns 删除结果
 */
export function batchDeleteSystemLogs(ids: string[]): Promise<ApiResponseType<{ success: boolean; count: number }>> {
  return request.del(LOG_ENDPOINTS.BATCH_DELETE, { data: { ids } });
}

/**
 * 清空系统日志
 * @param params 清空条件
 * @returns 清空结果
 */
export function clearSystemLogs(params?: {
  level?: LogLevel;
  module?: string;
  beforeDate?: string;
}): Promise<ApiResponseType<{ success: boolean; count: number }>> {
  return request.del(LOG_ENDPOINTS.CLEAR, { data: params });
}

/**
 * 导出系统日志
 * @param params 导出条件
 * @returns 文件URL
 */
export function exportSystemLogs(params?: {
  level?: LogLevel;
  module?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}): Promise<ApiResponseType<{ fileUrl: string }>> {
  return request.get(LOG_ENDPOINTS.EXPORT, { params, responseType: 'blob' });
}

/**
 * 系统日志类型
 */
export interface SystemLogType {
  id: number;
  type: 'login' | 'operation' | 'system';
  module: string;
  title: string;
  method?: string;
  url?: string;
  requestParams?: string;
  username: string;
  ip: string;
  location: string;
  browser: string;
  os: string;
  status: 'success' | 'fail';
  error?: string;
  time: number;
  createdAt: string;
}

/**
 * 日志查询参数
 */
export interface LogQueryParams extends PaginationParams {
  type?: string;
  username?: string;
  ip?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 清空日志参数
 */
export interface ClearLogParams {
  type?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * 获取日志列表
 * @param params 查询参数
 * @returns 日志列表和分页信息
 */
export function getLogs(params: LogQueryParams): Promise<ApiResponse<PaginatedResult<SystemLogType>>> {
  return request.get(LOG_ENDPOINTS.BASE, { params }) as unknown as Promise<ApiResponse<PaginatedResult<SystemLogType>>>;
}

/**
 * 获取日志详情
 * @param id 日志ID
 * @returns 日志详情
 */
export function getLogDetail(id: number): Promise<ApiResponse<SystemLogType>> {
  return request.get(LOG_ENDPOINTS.BY_ID(id)) as unknown as Promise<ApiResponse<SystemLogType>>;
}

/**
 * 删除日志
 * @param id 日志ID
 * @returns 操作结果
 */
export function deleteLog(id: number): Promise<ApiResponse<null>> {
  return request.del(`/system-logs/${id}`) as unknown as Promise<ApiResponse<null>>;
}

/**
 * 批量删除日志
 * @param ids 日志ID数组
 * @returns 操作结果
 */
export function batchDeleteLogs(ids: number[]): Promise<ApiResponse<null>> {
  return request.request({
    url: '/api4045',
    method: 'delete',
    data: { ids }
  }) as unknown as Promise<ApiResponse<null>>;
}

/**
 * 清空日志
 * @param params 清空参数
 * @returns 操作结果
 */
export function clearLogs(params: ClearLogParams): Promise<ApiResponse<null>> {
  return request.request({
    url: '/api4328',
    method: 'delete',
    data: params
  }) as unknown as Promise<ApiResponse<null>>;
}

/**
 * 导出日志
 * @param params 查询参数
 * @returns 文件流
 */
export function exportLogs(params: LogQueryParams): Promise<Blob> {
  return request.request({
    url: '/api4597',
    method: 'get',
    params,
    responseType: 'blob'
  }) as unknown as Promise<Blob>;
}