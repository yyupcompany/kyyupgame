/**
 * VOS配置API模块
 * 提供VOS（Voice Over Service）配置管理功能
 */

import { request } from '@/utils/request'

// VOS配置类型定义
export interface VOSConfig {
  id?: number
  name: string
  description?: string
  serverHost: string
  serverPort: number
  protocol: 'http' | 'https' | 'ws' | 'wss'
  apiKey: string
  apiSecret?: string
  appId?: string
  username?: string
  password?: string
  voiceType?: string
  sampleRate?: number
  format?: string
  language?: string
  modelName?: string
  maxConcurrentCalls?: number
  timeout?: number
  retryCount?: number
  isActive: boolean
  isDefault?: boolean
  status: 'active' | 'inactive' | 'testing' | 'error'
  lastTestedAt?: Date
  lastErrorMessage?: string
  createdAt?: Date
  updatedAt?: Date
}

export interface VOSConfigResponse {
  success: boolean
  data: VOSConfig | VOSConfig[] | null
  message?: string
}

export interface VOSConfigListResponse {
  success: boolean
  data: {
    items: VOSConfig[]
    total: number
  }
  message?: string
}

/**
 * VOS配置API
 */
export const vosConfigAPI = {
  /**
   * 获取VOS配置列表
   */
  getConfigs: async () => {
    return request.get<VOSConfigListResponse>('/vos-config')
  },

  /**
   * 获取当前激活的VOS配置
   */
  getActiveConfig: async () => {
    return request.get<VOSConfigResponse>('/vos-config/active')
  },

  /**
   * 创建VOS配置
   */
  createConfig: async (data: Partial<VOSConfig>) => {
    return request.post<VOSConfigResponse>('/vos-config', data)
  },

  /**
   * 更新VOS配置
   */
  updateConfig: async (id: number, data: Partial<VOSConfig>) => {
    return request.put<VOSConfigResponse>(`/vos-config/${id}`, data)
  },

  /**
   * 删除VOS配置
   */
  deleteConfig: async (id: number) => {
    return request.delete<VOSConfigResponse>(`/vos-config/${id}`)
  },

  /**
   * 激活VOS配置
   */
  activateConfig: async (id: number) => {
    return request.post<VOSConfigResponse>(`/vos-config/${id}/activate`)
  },

  /**
   * 测试VOS连接
   */
  testConnection: async () => {
    return request.post<VOSConfigResponse>('/vos-config/test')
  },

  /**
   * 获取VOS连接URL
   */
  getConnectionUrl: async () => {
    return request.get<{ success: boolean; data: { url: string } }>('/vos-config/connection-url')
  }
}

export default vosConfigAPI

