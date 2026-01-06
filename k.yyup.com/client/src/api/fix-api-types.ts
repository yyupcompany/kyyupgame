/**
 * API类型修复工具
 * 
 * 该文件提供了解决utils/request和types/system中API响应类型不兼容问题的工具函数
 * 问题: utils/request.ApiResponse.message是string|undefined，而types/system.ApiResponse.message是string
 */

import type { ApiResponse as RequestApiResponse } from '@/utils/request';
import type { ApiResponse as SystemApiResponse } from '@/types/system';

/**
 * 将request.ApiResponse类型转换为system.ApiResponse类型
 * 确保message属性符合system.ApiResponse类型要求
 * 
 * @param response utils/request中的ApiResponse
 * @returns 符合types/system.ApiResponse类型的响应
 */
export function convertToSystemApiResponse<T>(response: RequestApiResponse<T>): SystemApiResponse<T> {
  return {
    ...response,
    // 确保message属性是string类型
    message: response.message || '',
    success: response.success || false,
    data: response.data as T
  };
}

/**
 * 包装API函数，确保返回类型符合system.ApiResponse
 * 
 * @param apiFunc 原始API函数
 * @returns 返回符合system.ApiResponse类型的API函数
 */
export function wrapApiFunction<T, P extends any[]>(
  apiFunc: (...args: P) => Promise<RequestApiResponse<T>>
): (...args: P) => Promise<SystemApiResponse<T>> {
  return async (...args: P) => {
    const response = await apiFunc(...args);
    return convertToSystemApiResponse(response);
  };
}

/**
 * 从工具中正确导入和使用API类型的示例
 * 
 * 解决方案1：统一使用utils/request中的ApiResponse类型
 * import type { ApiResponse } from '@/utils/request';
 * 
 * 解决方案2：使用转换函数处理类型不匹配
 * import { wrapApiFunction } from '@/api/fix-api-types';
 * import { get } from '@/utils/request';
 * 
 * // 原始函数
 * function getDataRaw(id: string) {
 *   return get(`/api/data/${id}`);
 * }
 * 
 * // 包装后函数，返回符合system.ApiResponse类型的结果
 * export const getData = wrapApiFunction(getDataRaw);
 */

/**
 * 解决方案3：修改类型定义（需要修改utils/request.ts文件）
 * 
 * 在utils/request.ts中将ApiResponse.message改为非可选：
 * 
 * export interface ApiResponse<T = any> {
 *   success: boolean;
 *   data?: T;
 *   message: string; // 从message?: string改为message: string
 *   // ...其他属性
 * }
 * 
 * 然后确保所有API响应都设置message属性
 */

/**
 * 解决方案4：使用类型断言
 * 
 * import type { ApiResponse as SystemApiResponse } from '@/types/system';
 * import { get } from '@/utils/request';
 * 
 * function getData(id: string): Promise<SystemApiResponse<any>> {
 *   return get(`/api/data/${id}`) as Promise<SystemApiResponse<any>>;
 * }
 */ 