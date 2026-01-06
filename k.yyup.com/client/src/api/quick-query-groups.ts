/**
 * 快捷查询分组API
 */

import { request } from '@/utils/request'

// 接口定义
export interface QuickQueryItem {
  keyword: string
  description: string
  tokens: number
  category: string
}

export interface QuickQueryGroup {
  id: string
  name: string
  icon: string
  description: string
  queries: QuickQueryItem[]
}

export interface QuickQueryGroupOverview {
  id: string
  name: string
  icon: string
  description: string
  queryCount: number
}

// API响应类型
export interface ApiResponse<T = any> {
  success: boolean
  data: T
  message: string
}

/**
 * 快捷查询分组API服务
 */
export const quickQueryGroupsApi = {
  /**
   * 获取所有快捷查询分组
   */
  getAllGroups(): Promise<ApiResponse<QuickQueryGroup[]>> {
    return request.get('/api/quick-query-groups')
  },

  /**
   * 获取快捷查询分组概览
   */
  getGroupsOverview(): Promise<ApiResponse<QuickQueryGroupOverview[]>> {
    return request.get('/api/quick-query-groups/overview')
  },

  /**
   * 根据分组ID获取查询列表
   */
  getGroupById(groupId: string): Promise<ApiResponse<QuickQueryGroup>> {
    return request.get(`/quick-query-groups/${groupId}`)
  },

  /**
   * 搜索查询关键词
   */
  searchQueries(keyword: string): Promise<ApiResponse<QuickQueryItem[]>> {
    return request.get('/api/quick-query-groups/search', {
      params: { q: keyword }
    })
  },

  /**
   * 根据类别获取查询
   */
  getQueriesByCategory(category: string): Promise<ApiResponse<QuickQueryItem[]>> {
    return request.get(`/quick-query-groups/category/${category}`)
  }
}

export default quickQueryGroupsApi
