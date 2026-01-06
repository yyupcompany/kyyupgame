/**
 * API客户端适配器
 * 用于前端处理可能不一致的API响应
 */

/**
 * 确保数据为数组类型
 * @param data 可能是对象或数组的数据
 * @returns 转换后的数组
 */
export function ensureArray<T>(data: T | T[] | null | undefined): T[] {
  if (data === null || data === undefined) {
    return [];
  }
  return Array.isArray(data) ? data : [data];
}

/**
 * 标准化分页响应
 * @param response API响应数据
 * @returns 标准化后的分页响应
 */
export function normalizePaginationResponse(response: any): {
  total: number;
  page: number;
  pageSize: number;
  list: any[];
} {
  // 如果是已标准化的响应
  if (response && 
      typeof response === 'object' && 
      'list' in response && 
      'total' in response && 
      'page' in response && 
      'pageSize' in response) {
    return {
      ...response,
      list: ensureArray(response.list)
    };
  }
  
  // 处理旧格式响应 - items字段
  if (response && typeof response === 'object' && 'items' in response) {
    return {
      total: response.totalItems || response.total || 0,
      page: response.currentPage || response.page || 1,
      pageSize: response.pageSize || response.size || 10,
      list: ensureArray(response.items)
    };
  }
  
  // 处理旧格式响应 - data字段
  if (response && typeof response === 'object' && 'data' in response) {
    return {
      total: response.totalCount || response.total || 0,
      page: response.currentPage || response.page || 1,
      pageSize: response.pageSize || response.size || 10,
      list: ensureArray(response.data)
    };
  }
  
  // 处理纯数组响应
  if (Array.isArray(response)) {
    return {
      total: response.length,
      page: 1,
      pageSize: response.length,
      list: response
    };
  }
  
  // 处理单个对象响应
  if (response && typeof response === 'object' && !Array.isArray(response)) {
    return {
      total: 1,
      page: 1,
      pageSize: 1,
      list: [response]
    };
  }
  
  // 默认返回空数组
  return {
    total: 0,
    page: 1,
    pageSize: 10,
    list: []
  };
}

/**
 * 解析API响应
 * @param response API响应数据
 * @returns 处理后的数据
 */
export function parseApiResponse(response: any): any {
  // 处理成功响应
  if (response && response.status === 'success' && response.data !== undefined) {
    const data = response.data;
    
    // 处理分页数据
    if (data && typeof data === 'object' && 
        ('list' in data || 'items' in data || 'data' in data || 
         ('total' in data && ('page' in data || 'currentPage' in data)))) {
      return normalizePaginationResponse(data);
    }
    
    // 处理普通数组
    if (Array.isArray(data)) {
      return data;
    }
    
    // 处理单个对象
    return data;
  }
  
  // 处理错误响应
  if (response && response.status === 'error') {
    throw new Error(response.message || '请求失败');
  }
  
  // 返回原始响应
  return response;
}

/**
 * 处理API响应数据
 * 主要是确保包含list字段的响应中，list字段是数组类型
 * @param response API响应数据
 * @returns 处理后的响应数据
 */
export function processApiResponse<T = any>(response: any): T {
  // 如果响应为空，直接返回
  if (!response) {
    return response;
  }
  
  // 如果不是对象，直接返回
  if (typeof response !== 'object') {
    return response;
  }
  
  // 克隆响应对象，避免修改原始对象
  const result = { ...response };
  
  // 处理API响应中的data字段
  if (result.data) {
    // 处理data字段中的list子字段
    if (typeof result.data === 'object' && 'list' in result.data) {
      result.data = {
        ...result.data,
        list: ensureArray(result.data.list)
      };
    }
    
    // 如果data字段本身就是list字段
    if ('list' in result) {
      result.list = ensureArray(result.list);
    }
  }
  
  return result as T;
}

/**
 * 格式化分页响应
 * @param total 总记录数
 * @param page 当前页码
 * @param pageSize 每页记录数
 * @param list 记录列表
 * @returns 格式化后的分页响应
 */
export function formatPaginationResponse<T>(
  total: number,
  page: number,
  pageSize: number,
  list: T | T[]
): { total: number; page: number; pageSize: number; list: T[] } {
  return {
    total,
    page,
    pageSize,
    list: ensureArray<T>(list)
  };
}

/**
 * 创建一个axios拦截器工厂函数
 * 用于在前端项目中安装响应拦截器
 * @example
 * // 在前端项目中使用
 * import axios from 'axios';
 * import { createResponseInterceptor } from '@/utils/api-client-adapter';
 * 
 * // 安装拦截器
 * const removeInterceptor = createResponseInterceptor(axios);
 * 
 * // 如果需要移除拦截器
 * // removeInterceptor();
 */
export function createResponseInterceptor(axiosInstance: any): () => void {
  // 添加响应拦截器
  const interceptorId = axiosInstance.interceptors.response.use(
    (response: any) => {
      // 处理成功的响应
      if (response.data) {
        response.data = processApiResponse(response.data);
      }
      return response;
    },
    (error: any) => {
      // 对响应错误做点什么
      return Promise.reject(error);
    }
  );
  
  // 返回移除拦截器的函数
  return () => {
    axiosInstance.interceptors.response.eject(interceptorId);
  };
}

/**
 * 创建一个全局API适配器对象
 * 包含所有适配器功能
 */
export const ApiAdapter = {
  ensureArray,
  processApiResponse,
  formatPaginationResponse,
  createResponseInterceptor
}; 