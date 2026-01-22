/**
 * 家长沟通记录API服务
 *
 * 提供家长沟通记录的CRUD操作和统计分析功能
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/utils/request'

const API_BASE = '/parent-communications'

// 沟通类型枚举
export type CommunicationType = 'phone' | 'message' | 'meeting' | 'video' | 'wechat'

// 沟通方向枚举
export type CommunicationDirection = 'inbound' | 'outbound'

// 沟通状态枚举
export type CommunicationStatus = 'completed' | 'followup_needed' | 'escalated'

// 沟通记录类型
export interface ParentCommunication {
  id: number
  parentId: number
  studentId: number
  communicationType: CommunicationType
  direction: CommunicationDirection
  content: string
  summary: string | null
  sentiment: number | null
  topics: string[]
  duration: number | null
  attachments: string[]
  status: CommunicationStatus
  followupRequired: boolean
  nextFollowupDate: string | null
  nextFollowupType: string | null
  responseRequired: boolean
  responseDeadline: string | null
  aiGenerated: boolean
  aiSuggestions: string | null
  createdBy: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  // 关联数据
  parent?: {
    id: number
    parentName: string
    phone: string
    studentName: string
  }
  creator?: {
    id: number
    name: string
    role: string
  }
}

// 创建参数
export interface CreateCommunicationParams {
  parentId: number
  studentId: number
  communicationType: CommunicationType
  direction: CommunicationDirection
  content: string
  summary?: string
  sentiment?: number
  topics?: string[]
  duration?: number
  attachments?: string[]
  status?: CommunicationStatus
  followupRequired?: boolean
  nextFollowupDate?: string
  nextFollowupType?: string
  responseRequired?: boolean
  responseDeadline?: string
  aiGenerated?: boolean
}

// 更新参数
export interface UpdateCommunicationParams {
  content?: string
  summary?: string
  status?: CommunicationStatus
  followupRequired?: boolean
  nextFollowupDate?: string
  nextFollowupType?: string
}

// 查询参数
export interface CommunicationQueryParams {
  page?: number
  limit?: number
  parentId?: number
  studentId?: number
  communicationType?: CommunicationType
  direction?: CommunicationDirection
  status?: CommunicationStatus
  startDate?: string
  endDate?: string
  topics?: string
}

// AI建议响应
export interface AiSuggestionResponse {
  communicationId: number
  suggestions: Array<{
    id: string
    tone: string
    confidence: number
    response: string
    alternativeResponses: string[]
  }>
  generatedAt: string
}

// 统计响应
export interface CommunicationStatistics {
  totalCommunications: number
  byType: Array<{ communicationType: string; count: string }>
  byStatus: Array<{ status: string; count: string }>
  byDirection: Array<{ direction: string; count: string }>
  avgResponseTime: number
  satisfactionScore: number
}

// API服务
export const parentCommunicationApi = {
  /**
   * 创建沟通记录
   */
  create: (data: CreateCommunicationParams) =>
    request.post<ApiResponse<ParentCommunication>>(API_BASE, data),

  /**
   * 获取沟通记录详情
   */
  getById: (id: number) =>
    request.get<ApiResponse<ParentCommunication>>(`${API_BASE}/${id}`),

  /**
   * 获取沟通记录列表
   */
  list: (params?: CommunicationQueryParams) =>
    request.get<ApiResponse<{
      total: number
      page: number
      limit: number
      totalPages: number
      communications: ParentCommunication[]
    }>>(API_BASE, { params }),

  /**
   * 更新沟通记录
   */
  update: (id: number, data: UpdateCommunicationParams) =>
    request.put<ApiResponse<ParentCommunication>>(`${API_BASE}/${id}`, data),

  /**
   * 删除沟通记录
   */
  delete: (id: number) =>
    request.delete<ApiResponse<null>>(`${API_BASE}/${id}`),

  /**
   * 获取沟通统计
   */
  getStatistics: (params?: { startDate?: string; endDate?: string }) =>
    request.get<ApiResponse<CommunicationStatistics>>(`${API_BASE}/statistics`, { params }),

  /**
   * 获取待跟进记录
   */
  getPendingFollowups: () =>
    request.get<ApiResponse<ParentCommunication[]>>(`${API_BASE}/pending-followups`),

  /**
   * 生成AI回复建议
   */
  generateAiSuggestion: (communicationId: number) =>
    request.post<ApiResponse<AiSuggestionResponse>>(
      `${API_BASE}/${communicationId}/ai-suggestion`
    ),

  /**
   * 批量创建沟通记录
   */
  bulkCreate: (data: CreateCommunicationParams[]) =>
    request.post<ApiResponse<ParentCommunication[]>>(`${API_BASE}/bulk`, data)
}

export default parentCommunicationApi
