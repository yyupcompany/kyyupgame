/**
 * 示例API模块
 * 这是一个演示如何按照规范实现API请求的示例文件
 */

import { get, post, put, del } from '@/utils/request';
import type { ApiResponse } from '@/utils/request';
import { API_PREFIX } from './endpoints';

/**
 * 示例数据项类型定义
 */
export interface ExampleItem {
  id: string;
  name: string;
  description?: string;
  created: string;
  updated: string;
  status: 'active' | 'inactive' | 'pending';
}

/**
 * 创建示例项的参数
 */
export interface CreateExampleItemParams {
  name: string;
  description?: string;
  status?: 'active' | 'inactive' | 'pending';
}

/**
 * 更新示例项的参数
 */
export type UpdateExampleItemParams = Partial<CreateExampleItemParams>;

/**
 * 查询示例项的参数
 */
export interface QueryExampleItemsParams {
  page?: number;
  pageSize?: number;
  status?: string;
  keyword?: string;
}

/**
 * 示例API端点
 */
const EXAMPLE_ENDPOINTS = {
  BASE: `${API_PREFIX}/examples`,
  DETAIL: (id: string) => `${API_PREFIX}/examples/${id}`,
  ACTIVATE: (id: string) => `${API_PREFIX}/examples/${id}/activate`,
  STATS: `${API_PREFIX}/examples/stats`
};

/**
 * 示例API服务
 */
export const exampleApi = {
  /**
   * 获取示例数据列表
   * @param params 查询参数
   * @returns Promise<ApiResponse<{ items: ExampleItem[]; total: number }>>
   */
  getItems(params?: QueryExampleItemsParams): Promise<ApiResponse<{ items: ExampleItem[]; total: number }>> {
    return get(EXAMPLE_ENDPOINTS.BASE, { params });
  },

  /**
   * 获取单个示例数据
   * @param id 示例数据ID
   * @returns Promise<ApiResponse<ExampleItem>>
   */
  getItem(id: string): Promise<ApiResponse<ExampleItem>> {
    return get(EXAMPLE_ENDPOINTS.DETAIL(id));
  },

  /**
   * 创建示例数据
   * @param data 创建参数
   * @returns Promise<ApiResponse<ExampleItem>>
   */
  createItem(data: CreateExampleItemParams): Promise<ApiResponse<ExampleItem>> {
    return post(EXAMPLE_ENDPOINTS.BASE, data);
  },

  /**
   * 更新示例数据
   * @param id 示例数据ID
   * @param data 更新参数
   * @returns Promise<ApiResponse<ExampleItem>>
   */
  updateItem(id: string, data: UpdateExampleItemParams): Promise<ApiResponse<ExampleItem>> {
    return put(EXAMPLE_ENDPOINTS.DETAIL(id), data);
  },

  /**
   * 删除示例数据
   * @param id 示例数据ID
   * @returns Promise<ApiResponse<null>>
   */
  deleteItem(id: string): Promise<ApiResponse<null>> {
    return del(EXAMPLE_ENDPOINTS.DETAIL(id));
  },

  /**
   * 激活示例数据
   * @param id 示例数据ID
   * @returns Promise<ApiResponse<ExampleItem>>
   */
  activateItem(id: string): Promise<ApiResponse<ExampleItem>> {
    return post(EXAMPLE_ENDPOINTS.ACTIVATE(id));
  },

  /**
   * 获取示例数据统计信息
   * @returns Promise<ApiResponse<{ total: number; active: number; inactive: number }>>
   */
  getStats(): Promise<ApiResponse<{ total: number; active: number; inactive: number }>> {
    return get(EXAMPLE_ENDPOINTS.STATS);
  }
};

// 默认导出API对象
export default exampleApi; 