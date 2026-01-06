/**
 * 统一API架构 - 消除移动端和PC端API调用差异
 *
 * 这个文件提供了统一的API调用接口，确保移动端和PC端使用相同的API架构
 * 包含统一的错误处理、请求拦截、响应格式化等功能
 */

import { request } from '@/utils/request'
import { ElMessage } from 'element-plus'

// 统一的API响应接口
export interface UnifiedApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  code?: number
  timestamp?: number
}

// 统一的分页请求参数
export interface UnifiedPaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

// 统一的分页响应数据
export interface UnifiedPaginationResponse<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

/**
 * 统一API客户端类
 * 提供统一的API调用方法和错误处理
 */
export class UnifiedApiClient {
  private baseURL: string

  constructor(baseURL: string = '/api') {
    this.baseURL = baseURL
  }

  /**
   * 统一的GET请求
   */
  async get<T>(url: string, params?: any): Promise<UnifiedApiResponse<T>> {
    try {
      const response = await request({
        method: 'GET',
        url: `${this.baseURL}${url}`,
        params
      })
      return this.formatResponse(response)
    } catch (error) {
      return this.handleError(error, 'GET请求失败')
    }
  }

  /**
   * 统一的POST请求
   */
  async post<T>(url: string, data?: any): Promise<UnifiedApiResponse<T>> {
    try {
      const response = await request({
        method: 'POST',
        url: `${this.baseURL}${url}`,
        data
      })
      return this.formatResponse(response)
    } catch (error) {
      return this.handleError(error, 'POST请求失败')
    }
  }

  /**
   * 统一的PUT请求
   */
  async put<T>(url: string, data?: any): Promise<UnifiedApiResponse<T>> {
    try {
      const response = await request({
        method: 'PUT',
        url: `${this.baseURL}${url}`,
        data
      })
      return this.formatResponse(response)
    } catch (error) {
      return this.handleError(error, 'PUT请求失败')
    }
  }

  /**
   * 统一的DELETE请求
   */
  async delete<T>(url: string): Promise<UnifiedApiResponse<T>> {
    try {
      const response = await request({
        method: 'DELETE',
        url: `${this.baseURL}${url}`
      })
      return this.formatResponse(response)
    } catch (error) {
      return this.handleError(error, 'DELETE请求失败')
    }
  }

  /**
   * 统一的文件上传
   */
  async upload<T>(url: string, file: File, additionalData?: any): Promise<UnifiedApiResponse<T>> {
    try {
      const formData = new FormData()
      formData.append('file', file)

      if (additionalData) {
        Object.keys(additionalData).forEach(key => {
          formData.append(key, additionalData[key])
        })
      }

      const response = await request({
        method: 'POST',
        url: `${this.baseURL}${url}`,
        data: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      return this.formatResponse(response)
    } catch (error) {
      return this.handleError(error, '文件上传失败')
    }
  }

  /**
   * 格式化API响应
   */
  private formatResponse(response: any): UnifiedApiResponse {
    return {
      success: response.success !== false,
      data: response.data,
      message: response.message,
      code: response.code,
      timestamp: Date.now()
    }
  }

  /**
   * 统一的错误处理
   */
  private handleError(error: any, defaultMessage: string): UnifiedApiResponse {
    frontendLogger.error('API请求错误:', error)

    const message = error?.response?.data?.message ||
                   error?.message ||
                   defaultMessage

    // 显示错误提示（仅在非静默模式下）
    if (process.env.NODE_ENV === 'development') {
      ElMessage.error(message)
    }

    return {
      success: false,
      message,
      code: error?.response?.status || 500,
      timestamp: Date.now()
    }
  }
}

// 创建统一API客户端实例
export const unifiedApi = new UnifiedApiClient()

/**
 * 系统相关API - 统一的系统管理接口
 */
export const systemApi = {
  // 获取系统统计信息
  async getStats(): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.get('/system/stats')
  },

  // 获取系统健康状态
  async getHealth(): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.get('/system/health')
  },

  // 获取系统日志
  async getLogs(params?: UnifiedPaginationParams & { level?: string }): Promise<UnifiedApiResponse<UnifiedPaginationResponse<any>>> {
    return unifiedApi.get('/system/logs', params)
  },

  // 获取系统设置
  async getSettings(): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.get('/system/settings')
  },

  // 更新系统设置
  async updateSettings(data: any): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.put('/system/settings', data)
  },

  // 重启系统服务
  async restartService(serviceId: string | number): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.post(`/system/services/${serviceId}/restart`)
  },

  // 系统备份
  async createBackup(): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.post('/system/backup')
  },

  // 获取备份列表
  async getBackups(params?: UnifiedPaginationParams): Promise<UnifiedApiResponse<UnifiedPaginationResponse<any>>> {
    return unifiedApi.get('/system/backups', params)
  }
}

/**
 * 用户管理相关API - 统一的用户管理接口
 */
export const userApi = {
  // 获取用户列表
  async getUsers(params?: UnifiedPaginationParams & { search?: string; role?: string }): Promise<UnifiedApiResponse<UnifiedPaginationResponse<any>>> {
    return unifiedApi.get('/users', params)
  },

  // 创建用户
  async createUser(userData: any): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.post('/users', userData)
  },

  // 更新用户
  async updateUser(userId: string | number, userData: any): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.put(`/users/${userId}`, userData)
  },

  // 删除用户
  async deleteUser(userId: string | number): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.delete(`/users/${userId}`)
  },

  // 获取角色列表
  async getRoles(): Promise<UnifiedApiResponse<any[]>> {
    return unifiedApi.get('/roles')
  },

  // 获取权限列表
  async getPermissions(): Promise<UnifiedApiResponse<any[]>> {
    return unifiedApi.get('/permissions')
  },

  // 检查用户权限
  async checkPermission(permission: string): Promise<UnifiedApiResponse<{ hasPermission: boolean }>> {
    return unifiedApi.get('/auth/check-permission', { permission })
  }
}

/**
 * 家长中心相关API - 统一的家长中心接口
 */
export const parentApi = {
  // 获取家长的孩子列表
  async getChildren(): Promise<UnifiedApiResponse<any[]>> {
    return unifiedApi.get('/parent/children')
  },

  // 添加孩子
  async addChild(childData: any): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.post('/parent/children', childData)
  },

  // 更新孩子信息
  async updateChild(childId: string | number, childData: any): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.put(`/parent/children/${childId}`, childData)
  },

  // 获取孩子成长记录
  async getChildGrowth(childId: string | number, params?: UnifiedPaginationParams): Promise<UnifiedApiResponse<UnifiedPaginationResponse<any>>> {
    return unifiedApi.get(`/parent/children/${childId}/growth`, params)
  },

  // 获取活动列表
  async getActivities(params?: UnifiedPaginationParams & { type?: string; status?: string }): Promise<UnifiedApiResponse<UnifiedPaginationResponse<any>>> {
    return unifiedApi.get('/parent/activities', params)
  },

  // 报名活动
  async enrollActivity(activityId: string | number): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.post(`/parent/activities/${activityId}/enroll`)
  },

  // 获取通知列表
  async getNotifications(params?: UnifiedPaginationParams & { unreadOnly?: boolean }): Promise<UnifiedApiResponse<UnifiedPaginationResponse<any>>> {
    return unifiedApi.get('/parent/notifications', params)
  },

  // 标记通知为已读
  async markNotificationRead(notificationId: string | number): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.put(`/parent/notifications/${notificationId}/read`)
  },

  // 获取AI助手建议
  async getAISuggestions(params?: { childId?: string; category?: string }): Promise<UnifiedApiResponse<any[]>> {
    return unifiedApi.get('/parent/ai-suggestions', params)
  },

  // 获取家长统计数据
  async getParentStats(): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.get('/parent/stats')
  }
}

/**
 * 通知中心相关API - 统一的通知管理接口
 */
export const notificationApi = {
  // 获取通知列表
  async getNotifications(params?: UnifiedPaginationParams & {
    type?: string;
    priority?: string;
    unreadOnly?: boolean
  }): Promise<UnifiedApiResponse<UnifiedPaginationResponse<any>>> {
    return unifiedApi.get('/notifications', params)
  },

  // 发送通知
  async sendNotification(notificationData: any): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.post('/notifications', notificationData)
  },

  // 批量操作通知
  async batchUpdateNotifications(notificationIds: string[], action: 'read' | 'unread' | 'delete'): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.put('/notifications/batch', { notificationIds, action })
  },

  // 获取通知分类
  async getNotificationCategories(): Promise<UnifiedApiResponse<any[]>> {
    return unifiedApi.get('/notifications/categories')
  },

  // 创建通知分类
  async createNotificationCategory(categoryData: any): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.post('/notifications/categories', categoryData)
  }
}

/**
 * 权限管理相关API - 统一的权限控制接口
 */
export const permissionApi = {
  // 获取用户权限
  async getUserPermissions(): Promise<UnifiedApiResponse<string[]>> {
    return unifiedApi.get('/auth/permissions')
  },

  // 获取动态路由
  async getDynamicRoutes(): Promise<UnifiedApiResponse<any[]>> {
    return unifiedApi.get('/auth/dynamic-routes')
  },

  // 检查权限
  async checkPermission(permission: string, resource?: string): Promise<UnifiedApiResponse<{ allowed: boolean }>> {
    return unifiedApi.post('/auth/check-permission', { permission, resource })
  },

  // 获取角色权限映射
  async getRolePermissionMapping(): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.get('/auth/role-permission-mapping')
  },

  // 更新角色权限
  async updateRolePermissions(roleId: string | number, permissions: string[]): Promise<UnifiedApiResponse<any>> {
    return unifiedApi.put(`/auth/roles/${roleId}/permissions`, { permissions })
  }
}

/**
 * 缓存管理工具
 */
export class ApiCacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map()

  set(key: string, data: any, ttl: number = 300000): void { // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  get(key: string): any | null {
    const item = this.cache.get(key)
    if (!item) return null

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key)
      return null
    }

    return item.data
  }

  delete(key: string): void {
    this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // 缓存包装器
  async cached<T>(key: string, apiCall: () => Promise<T>, ttl?: number): Promise<T> {
    const cached = this.get(key)
    if (cached) return cached

    const result = await apiCall()
    this.set(key, result, ttl)
    return result
  }
}

// 创建缓存管理实例
export const apiCache = new ApiCacheManager()

/**
 * 批量API请求工具
 */
export class BatchRequestHandler {
  private pendingRequests: Map<string, Promise<any>> = new Map()

  async request<T>(key: string, apiCall: () => Promise<T>): Promise<T> {
    // 如果已有相同的请求在进行中，返回该请求的Promise
    if (this.pendingRequests.has(key)) {
      return this.pendingRequests.get(key)
    }

    // 创建新请求
    const requestPromise = apiCall()
    this.pendingRequests.set(key, requestPromise)

    try {
      const result = await requestPromise
      return result
    } finally {
      // 请求完成后清除
      this.pendingRequests.delete(key)
    }
  }
}

// 创建批量请求处理实例
export const batchRequest = new BatchRequestHandler()

/**
 * 导出所有API模块，供移动端和PC端统一使用
 */
export default {
  unifiedApi,
  systemApi,
  userApi,
  parentApi,
  notificationApi,
  permissionApi,
  apiCache,
  batchRequest
}

/**
 * 使用示例：
 *
 * // 在任何组件中统一使用
 * import { systemApi, parentApi, apiCache } from '@/api/unified-api'
 *
 * // 获取系统统计
 * const stats = await systemApi.getStats()
 *
 * // 使用缓存
 * const cachedStats = await apiCache.cached('system-stats', () => systemApi.getStats())
 *
 * // 获取家长的孩子列表
 * const children = await parentApi.getChildren()
 *
 * // 批量请求避免重复
 * const activities = await batchRequest.request('activities', () => parentApi.getActivities())
 */