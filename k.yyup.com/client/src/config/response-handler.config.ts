/**
 * 统一响应处理配置
 *
 * 规范化所有API响应格式，确保错误处理一致性
 */

import type { AxiosResponse } from 'axios';

/**
 * 标准API响应格式
 */
export interface StandardApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string | { message?: string; code?: string };
}

/**
 * 兼容格式1: code格式
 */
interface CodeFormatResponse<T = any> {
  code: number;
  data?: T;
  message?: string;
}

/**
 * 兼容格式2: rows/count格式
 */
interface RowsCountResponse<T = any> {
  rows: T[];
  count: number;
}

/**
 * 兼容格式3: data array格式
 */
interface DataArrayResponse<T = any> {
  data: T[];
  message?: string;
}

/**
 * 响应格式类型
 */
type ResponseFormat =
  | 'standard'     // { success, data, message, error }
  | 'code'         // { code, data, message }
  | 'rows-count'   // { rows, count }
  | 'data-array'   // { data: [], message }
  | 'unknown';     // 其他格式

/**
 * 检测响应格式类型
 */
export function detectResponseFormat(data: any): ResponseFormat {
  if (!data || typeof data !== 'object') {
    return 'unknown';
  }

  // 标准格式 { success: boolean }
  if ('success' in data && typeof data.success === 'boolean') {
    return 'standard';
  }

  // code格式 { code: number }
  if ('code' in data && typeof data.code === 'number') {
    return 'code';
  }

  // rows/count格式
  if ('rows' in data && 'count' in data && Array.isArray(data.rows)) {
    return 'rows-count';
  }

  // data array格式
  if ('data' in data && Array.isArray(data.data) && 'message' in data) {
    return 'data-array';
  }

  return 'unknown';
}

/**
 * 从错误对象中提取错误消息
 *
 * @param error 错误对象（可以是字符串或对象）
 * @returns 标准化的错误消息
 */
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }

  if (error && typeof error === 'object') {
    // 尝试多种可能的错误消息字段
    return (
      error.message ||
      error.msg ||
      error.error?.message ||
      error.description ||
      '未知错误'
    );
  }

  return '未知错误';
}

/**
 * 从响应数据中提取错误消息
 *
 * @param data 响应数据
 * @param defaultMessage 默认消息
 * @returns 错误消息
 */
export function getErrorMessage(data: any, defaultMessage: string = '操作失败'): string {
  // 检查 error 字段
  if (data.error) {
    return extractErrorMessage(data.error);
  }

  // 检查 message 字段
  if (data.message) {
    return data.message;
  }

  return defaultMessage;
}

/**
 * 检查响应是否表示成功
 *
 * @param data 响应数据
 * @returns 是否成功
 */
export function isSuccessResponse(data: any): boolean {
  const format = detectResponseFormat(data);

  switch (format) {
    case 'standard':
      return data.success === true;

    case 'code':
      // HTTP状态码风格: 2xx = 成功
      return data.code >= 200 && data.code < 300;

    case 'rows-count':
    case 'data-array':
      // 这些格式默认认为是成功的（除非明确标记为失败）
      return true;

    default:
      // 对于未知格式，假设成功
      return true;
  }
}

/**
 * 将任意响应格式转换为标准格式
 *
 * @param data 响应数据
 * @returns 标准格式的响应
 */
export function normalizeResponse<T = any>(data: any): StandardApiResponse<T> {
  const format = detectResponseFormat(data);

  switch (format) {
    case 'standard':
      // 已经是标准格式
      return data as StandardApiResponse<T>;

    case 'code':
      // 转换 code 格式为标准格式
      const codeResponse = data as CodeFormatResponse<T>;
      return {
        success: isSuccessResponse(codeResponse),
        data: codeResponse.data,
        message: codeResponse.message,
        error: !isSuccessResponse(codeResponse) ? getErrorMessage(codeResponse, '操作失败') : undefined
      };

    case 'rows-count':
      // 转换 rows/count 格式为标准格式
      const rowsCountResponse = data as RowsCountResponse<T>;
      return {
        success: true,
        data: {
          items: rowsCountResponse.rows,
          total: rowsCountResponse.count
        } as any,
        message: 'Success'
      };

    case 'data-array':
      // 转换 data array 格式为标准格式
      const dataArrayResponse = data as DataArrayResponse<T>;
      return {
        success: true,
        data: {
          items: dataArrayResponse.data,
          total: dataArrayResponse.data.length
        } as any,
        message: dataArrayResponse.message || 'Success'
      };

    default:
      // 未知格式，包装为标准格式
      return {
        success: true,
        data: data,
        message: 'Success'
      };
  }
}

/**
 * 响应处理器类
 *
 * 提供链式API处理响应
 */
export class ResponseHandler {
  private response: AxiosResponse;
  private data: any;

  constructor(response: AxiosResponse) {
    this.response = response;
    this.data = response.data;
  }

  /**
   * 检查是否成功
   */
  isSuccess(): boolean {
    return isSuccessResponse(this.data);
  }

  /**
   * 获取标准化响应
   */
  normalize(): StandardApiResponse {
    return normalizeResponse(this.data);
  }

  /**
   * 获取错误消息
   */
  getErrorMessage(): string {
    return getErrorMessage(this.data);
  }

  /**
   * 获取数据部分
   */
  getData<T = any>(): T | undefined {
    const normalized = this.normalize();
    return normalized.data;
  }

  /**
   * 处理响应（成功则返回数据，失败则抛出错误）
   */
  handle<T = any>(): T {
    if (this.isSuccess()) {
      return this.getData<T>() as T;
    }

    throw new Error(this.getErrorMessage());
  }
}

/**
 * 创建响应处理器
 *
 * @param response Axios响应对象
 * @returns 响应处理器实例
 */
export function createResponseHandler(response: AxiosResponse): ResponseHandler {
  return new ResponseHandler(response);
}

/**
 * 导出配置
 */
export default {
  detectResponseFormat,
  extractErrorMessage,
  getErrorMessage,
  isSuccessResponse,
  normalizeResponse,
  ResponseHandler,
  createResponseHandler
};
