/**
 * 语音配置API模块
 * 统一管理VOS和SIP两种配置模式
 */

import { request } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// 语音配置API端点
const VOICE_CONFIG_ENDPOINTS = {
  BASE: `${API_PREFIX}/voice-config`,
  STATS: `${API_PREFIX}/voice-config/stats`,
  ACTIVE: `${API_PREFIX}/voice-config/active`,
  BY_ID: (id: number) => `${API_PREFIX}/voice-config/${id}`,
  TOGGLE: (id: number) => `${API_PREFIX}/voice-config/${id}/toggle`,
  TEST: (id: number) => `${API_PREFIX}/voice-config/${id}/test`,
  VALIDATE: (id: number) => `${API_PREFIX}/voice-config/${id}/validate`
} as const

export type VoiceConfigType = 'vos' | 'sip'

export interface VoiceConfig {
  id: number
  name: string
  description?: string
  configType: VoiceConfigType

  // VOS配置
  vosServerHost?: string
  vosServerPort?: number
  vosApiKey?: string
  vosDidNumbers?: string[]
  vosDefaultDidNumber?: string
  vosMaxConcurrentCalls?: number

  // SIP配置
  sipServerHost?: string
  sipServerPort?: number
  sipProtocol?: 'udp' | 'tcp' | 'tls'
  sipRealm?: string
  sipUsername?: string
  sipPassword?: string
  sipDidNumbers?: string[]
  sipDefaultDidNumber?: string
  sipAudioCodecs?: string[]
  sipRtpPortStart?: number
  sipRtpPortEnd?: number

  // 通用配置
  isActive: boolean
  isDefault: boolean
  status: 'active' | 'inactive' | 'testing' | 'error'
  lastConnectedAt?: string
  lastTestedAt?: string
  lastErrorMessage?: string
  createdAt: string
  updatedAt: string

  // 计算属性
  summary?: {
    type: string
    server: string
    realm?: string
    username?: string
    didCount: number
    defaultDid?: string
    maxCalls?: number
    codecs?: string[]
  }
  validation?: {
    isValid: boolean
    errors: string[]
  }
}

export interface CreateVOSConfigData {
  name: string
  description?: string
  configType: 'vos'
  vosServerHost: string
  vosServerPort?: number
  vosApiKey: string
  vosDidNumbers?: string[]
  vosDefaultDidNumber?: string
  vosMaxConcurrentCalls?: number
}

export interface CreateSIPConfigData {
  name: string
  description?: string
  configType: 'sip'
  sipServerHost: string
  sipServerPort?: number
  sipProtocol?: 'udp' | 'tcp' | 'tls'
  sipRealm?: string
  sipUsername: string
  sipPassword: string
  sipDidNumbers?: string[]
  sipDefaultDidNumber?: string
  sipAudioCodecs?: string[]
  sipRtpPortStart?: number
  sipRtpPortEnd?: number
}

export type CreateVoiceConfigData = CreateVOSConfigData | CreateSIPConfigData

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data: T
  error?: string
}

export interface PageResponse<T = any> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// 语音配置API
export const voiceConfigApi = {
  // 获取语音配置列表
  getList: (params?: {
    page?: number
    pageSize?: number
    search?: string
    configType?: VoiceConfigType
    status?: string
    isActive?: boolean
  }): Promise<ApiResponse<PageResponse<VoiceConfig>>> => {
    return request.get(VOICE_CONFIG_ENDPOINTS.BASE, { params })
  },

  // 获取语音配置统计信息
  getStats: (): Promise<ApiResponse<{
    total: number
    active: number
    inactive: number
    error: number
    vos: {
      total: number
      active: number
      inactive: number
    }
    sip: {
      total: number
      active: number
      inactive: number
    }
  }>> => {
    return request.get(VOICE_CONFIG_ENDPOINTS.STATS)
  },

  // 获取当前激活的语音配置
  getActive: (): Promise<ApiResponse<VoiceConfig>> => {
    return request.get(VOICE_CONFIG_ENDPOINTS.ACTIVE)
  },

  // 获取语音配置详情
  getById: (id: number): Promise<ApiResponse<VoiceConfig>> => {
    return request.get(VOICE_CONFIG_ENDPOINTS.BY_ID(id))
  },

  // 创建语音配置
  create: (data: CreateVoiceConfigData): Promise<ApiResponse<VoiceConfig>> => {
    return request.post(VOICE_CONFIG_ENDPOINTS.BASE, data)
  },

  // 更新语音配置
  update: (id: number, data: Partial<VoiceConfig>): Promise<ApiResponse<VoiceConfig>> => {
    return request.put(VOICE_CONFIG_ENDPOINTS.BY_ID(id), data)
  },

  // 删除语音配置
  delete: (id: number): Promise<ApiResponse<null>> => {
    return request.delete(VOICE_CONFIG_ENDPOINTS.BY_ID(id))
  },

  // 激活/停用语音配置
  toggle: (id: number, isActive: boolean): Promise<ApiResponse<VoiceConfig>> => {
    return request.post(VOICE_CONFIG_ENDPOINTS.TOGGLE(id), { isActive })
  },

  // 测试语音配置连接
  test: (id: number): Promise<ApiResponse<{
    success: boolean
    message: string
    latency: number
    testedAt: string
  }>> => {
    return request.post(VOICE_CONFIG_ENDPOINTS.TEST(id))
  },

  // 验证语音配置
  validate: (id: number): Promise<ApiResponse<{
    isValid: boolean
    errors: string[]
  }>> => {
    return request.post(VOICE_CONFIG_ENDPOINTS.VALIDATE(id))
  }
}

// 辅助函数：验证VOS配置数据
export const validateVOSConfig = (data: any): { isValid: boolean; errors: string[] } => {
  const errors = []

  if (!data.name) errors.push('配置名称不能为空')
  if (!data.vosServerHost) errors.push('VOS服务器地址不能为空')
  if (!data.vosApiKey) errors.push('VOS API密钥不能为空')
  if (data.vosServerPort && (data.vosServerPort < 1 || data.vosServerPort > 65535)) {
    errors.push('VOS服务器端口必须在1-65535之间')
  }
  if (data.vosMaxConcurrentCalls && (data.vosMaxConcurrentCalls < 1 || data.vosMaxConcurrentCalls > 1000)) {
    errors.push('最大并发通话数必须在1-1000之间')
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 辅助函数：验证SIP配置数据
export const validateSIPConfig = (data: any): { isValid: boolean; errors: string[] } => {
  const errors = []

  if (!data.name) errors.push('配置名称不能为空')
  if (!data.sipServerHost) errors.push('SIP服务器地址不能为空')
  if (!data.sipUsername) errors.push('SIP用户名不能为空')
  if (!data.sipPassword) errors.push('SIP密码不能为空')
  if (data.sipServerPort && (data.sipServerPort < 1 || data.sipServerPort > 65535)) {
    errors.push('SIP服务器端口必须在1-65535之间')
  }
  if (data.sipRtpPortStart && data.sipRtpPortEnd) {
    if (data.sipRtpPortStart >= data.sipRtpPortEnd) {
      errors.push('RTP端口起始必须小于结束端口')
    }
    if (data.sipRtpPortStart < 1024 || data.sipRtpPortEnd > 65535) {
      errors.push('RTP端口范围必须在1024-65535之间')
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

// 辅助函数：获取配置类型的显示文本
export const getConfigTypeText = (type: VoiceConfigType): string => {
  const typeMap: Record<VoiceConfigType, string> = {
    vos: 'VOS (简单配置)',
    sip: 'SIP (标准协议)'
  }
  return typeMap[type] || type
}

// 辅助函数：获取配置类型的描述
export const getConfigTypeDescription = (type: VoiceConfigType): string => {
  const descMap: Record<VoiceConfigType, string> = {
    vos: 'VOS配置：简单的IP地址和端口配置，适合快速部署',
    sip: 'SIP配置：完整的SIP协议配置，支持高级功能'
  }
  return descMap[type] || type
}

// 辅助函数：生成默认DID号码
export const generateDefaultDidNumber = (configType: VoiceConfigType, baseNumber?: string): string => {
  if (configType === 'vos') {
    return baseNumber || '01012345678'
  } else if (configType === 'sip') {
    return baseNumber || '01012345679'
  }
  return ''
}

// 辅助函数：获取默认编解码器
export const getDefaultAudioCodecs = (configType: VoiceConfigType): string[] => {
  if (configType === 'vos') {
    return ['PCMA', 'PCMU']
  } else if (configType === 'sip') {
    return ['PCMU', 'PCMA', 'G729', 'Opus']
  }
  return []
}