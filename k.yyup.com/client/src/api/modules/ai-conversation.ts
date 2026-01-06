import { request } from '@/utils/request'
import { API_PREFIX } from '../endpoints/base'

// API端点常量
export const AI_CONVERSATION_ENDPOINTS = {
  BASE: `${API_PREFIX}/ai-conversations`,
  GET_BY_ID: (id: string) => `${API_PREFIX}/ai-conversations/${id}`,
  UPDATE: (id: string) => `${API_PREFIX}/ai-conversations/${id}`,
  DELETE: (id: string) => `${API_PREFIX}/ai-conversations/${id}`,
  MESSAGES: (id: string) => `${API_PREFIX}/ai-conversations/${id}/messages`,
  ADD_MESSAGE: (id: string) => `${API_PREFIX}/ai-conversations/${id}/messages`,
  ARCHIVE: (id: string) => `${API_PREFIX}/ai-conversations/${id}/archive`,
  UNARCHIVE: (id: string) => `${API_PREFIX}/ai-conversations/${id}/unarchive`,
  CLEAR_MESSAGES: (id: string) => `${API_PREFIX}/ai-conversations/${id}/messages`,
  STATS: (id: string) => `${API_PREFIX}/ai-conversations/${id}/stats`,
  SEARCH: `${API_PREFIX}/ai-conversations/search`,
  EXPORT: (id: string) => `${API_PREFIX}/ai-conversations/${id}/export`,
  IMPORT: `${API_PREFIX}/ai-conversations/import`,
  DUPLICATE: (id: string) => `${API_PREFIX}/ai-conversations/${id}/duplicate`,
  BULK_DELETE: `${API_PREFIX}/ai-conversations/bulk-delete`,
  MERGE: `${API_PREFIX}/ai-conversations/merge`,
} as const

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  meta?: {
    page: number
    pageSize: number
    totalItems: number
    totalPages: number
  }
}

// 会话相关接口
export interface Conversation {
  id: string
  userId: number
  title: string | null
  summary: string | null
  lastMessageAt: string
  messageCount: number
  isArchived: boolean
  lastPagePath?: string | null
  pageContext?: string | null
  lastPageUpdateAt?: string | null
  usedMemoryIds?: number[] | null
  metadata?: Record<string, any> | null
  createdAt: string
  updatedAt: string
  messages?: Message[]
}

export interface Message {
  id: number
  conversationId: string
  userId: number
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  messageType: 'text' | 'image' | 'audio' | 'video' | 'file'
  mediaUrl?: string | null
  metadata?: any | null
  tokens: number
  status: 'sending' | 'delivered' | 'failed'
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

// 创建会话请求
export interface CreateConversationRequest {
  title?: string
}

// 更新会话标题请求
export interface UpdateConversationTitleRequest {
  title: string
}

// 添加消息请求
export interface AddMessageRequest {
  role: 'user' | 'assistant' | 'system' | 'tool'
  content: string
  messageType?: 'text' | 'image' | 'audio' | 'video' | 'file'
  metadata?: Record<string, any>
}

// AI会话管理API服务
export class AIConversationService {
  /**
   * 获取用户的会话列表
   */
  static async getConversations(params?: {
    page?: number
    pageSize?: number
    archived?: boolean
  }): Promise<ApiResponse<Conversation[]>> {
    return request.get(AI_CONVERSATION_ENDPOINTS.BASE, { params })
  }

  /**
   * 创建新会话
   */
  static async createConversation(data?: CreateConversationRequest): Promise<ApiResponse<Conversation>> {
    return request.post(AI_CONVERSATION_ENDPOINTS.BASE, data)
  }

  /**
   * 更新会话标题
   */
  static async updateConversationTitle(
    conversationId: string,
    data: UpdateConversationTitleRequest
  ): Promise<ApiResponse<Conversation>> {
    return request.put(AI_CONVERSATION_ENDPOINTS.UPDATE(conversationId), data)
  }

  /**
   * 删除会话（软删除）
   */
  static async deleteConversation(conversationId: string): Promise<ApiResponse<null>> {
    return request.delete(AI_CONVERSATION_ENDPOINTS.DELETE(conversationId))
  }

  /**
   * 获取会话消息列表
   */
  static async getConversationMessages(
    conversationId: string,
    params?: {
      page?: number
      pageSize?: number
    }
  ): Promise<ApiResponse<{
    conversation: Conversation
    messages: Message[]
  }>> {
    return request.get(AI_CONVERSATION_ENDPOINTS.MESSAGES(conversationId), { params })
  }

  /**
   * 添加消息到会话
   */
  static async addMessage(
    conversationId: string,
    data: AddMessageRequest
  ): Promise<ApiResponse<Message>> {
    return request.post(AI_CONVERSATION_ENDPOINTS.ADD_MESSAGE(conversationId), data)
  }

  /**
   * 获取单个会话详情
   */
  static async getConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return request.get(AI_CONVERSATION_ENDPOINTS.GET_BY_ID(conversationId))
  }

  /**
   * 归档会话
   */
  static async archiveConversation(conversationId: string): Promise<ApiResponse<null>> {
    return request.post(AI_CONVERSATION_ENDPOINTS.ARCHIVE(conversationId))
  }

  /**
   * 恢复会话
   */
  static async unarchiveConversation(conversationId: string): Promise<ApiResponse<Conversation>> {
    return request.post(AI_CONVERSATION_ENDPOINTS.UNARCHIVE(conversationId))
  }

  /**
   * 清空会话消息
   */
  static async clearConversationMessages(conversationId: string): Promise<ApiResponse<null>> {
    return request.delete(AI_CONVERSATION_ENDPOINTS.CLEAR_MESSAGES(conversationId))
  }

  /**
   * 批量删除会话
   */
  static async bulkDeleteConversations(conversationIds: string[]): Promise<ApiResponse<null>> {
    return request.post(AI_CONVERSATION_ENDPOINTS.BULK_DELETE, { conversationIds })
  }

  /**
   * 获取会话统计信息
   */
  static async getConversationStats(conversationId: string): Promise<ApiResponse<{
    messageCount: number
    tokenCount: number
    lastActivityTime: string
    averageResponseTime: number
  }>> {
    return request.get(AI_CONVERSATION_ENDPOINTS.STATS(conversationId))
  }

  /**
   * 搜索会话
   */
  static async searchConversations(query: string, params?: {
    page?: number
    pageSize?: number
  }): Promise<ApiResponse<Conversation[]>> {
    return request.get(AI_CONVERSATION_ENDPOINTS.SEARCH, {
      params: { ...params, q: query }
    })
  }

  /**
   * 导出会话
   */
  static async exportConversation(conversationId: string, format: 'json' | 'csv' | 'pdf' = 'json'): Promise<Blob> {
    const response = await request.get(AI_CONVERSATION_ENDPOINTS.EXPORT(conversationId), {
      params: { format },
      responseType: 'blob'
    })
    return response
  }

  /**
   * 导入会话
   */
  static async importConversation(file: File): Promise<ApiResponse<Conversation>> {
    const formData = new FormData()
    formData.append('file', file)
    return request.post(AI_CONVERSATION_ENDPOINTS.IMPORT, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * 复制会话
   */
  static async duplicateConversation(conversationId: string, newTitle?: string): Promise<ApiResponse<Conversation>> {
    return request.post(AI_CONVERSATION_ENDPOINTS.DUPLICATE(conversationId), {
      title: newTitle
    })
  }

  /**
   * 合并会话
   */
  static async mergeConversations(
    sourceConversationIds: string[],
    targetConversationId?: string,
    newTitle?: string
  ): Promise<ApiResponse<Conversation>> {
    return request.post(AI_CONVERSATION_ENDPOINTS.MERGE, {
      sourceConversationIds,
      targetConversationId,
      newTitle
    })
  }
}

export default AIConversationService