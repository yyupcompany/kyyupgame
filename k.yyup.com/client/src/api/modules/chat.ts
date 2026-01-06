import { get, post, put, del, ApiResponse } from '@/utils/request';

/**
 * 聊天消息类型
 */
export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system'
}

/**
 * 聊天消息状态
 */
export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

/**
 * 聊天消息
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  type: MessageType;
  content: string;
  status: MessageStatus;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

/**
 * 聊天对话
 */
export interface ChatConversation {
  id: string;
  title: string;
  participants: Array<{
    id: string;
    name: string;
    avatar?: string;
    role: string;
  }>;
  lastMessage?: ChatMessage;
  unreadCount: number;
  isGroup: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * 聊天查询参数
 */
export interface ChatQueryParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: 'private' | 'group';
  participantId?: string;
}

/**
 * 发送消息请求
 */
export interface SendMessageRequest {
  conversationId: string;
  type: MessageType;
  content: string;
  metadata?: Record<string, any>;
}

/**
 * 创建对话请求
 */
export interface CreateConversationRequest {
  title?: string;
  participantIds: string[];
  isGroup: boolean;
}

/**
 * 聊天系统API
 */
export const chatApi = {
  /**
   * 获取对话列表
   */
  getConversations(params?: ChatQueryParams): Promise<ApiResponse<{
    items: ChatConversation[];
    total: number;
  }>> {
    return get('/chat/conversations', { params });
  },

  /**
   * 创建对话
   */
  createConversation(data: CreateConversationRequest): Promise<ApiResponse<ChatConversation>> {
    return post('/chat/conversations', data);
  },

  /**
   * 获取对话详情
   */
  getConversation(id: string): Promise<ApiResponse<ChatConversation>> {
    return get(`/chat/conversations/${id}`);
  },

  /**
   * 更新对话
   */
  updateConversation(id: string, data: {
    title?: string;
    participantIds?: string[];
  }): Promise<ApiResponse<ChatConversation>> {
    return put(`/chat/conversations/${id}`, data);
  },

  /**
   * 删除对话
   */
  deleteConversation(id: string): Promise<ApiResponse> {
    return del(`/chat/conversations/${id}`);
  },

  /**
   * 获取对话消息
   */
  getMessages(conversationId: string, params?: {
    page?: number;
    pageSize?: number;
    beforeMessageId?: string;
  }): Promise<ApiResponse<{
    items: ChatMessage[];
    total: number;
    hasMore: boolean;
  }>> {
    return get(`/chat/conversations/${conversationId}/messages`, { params });
  },

  /**
   * 发送消息
   */
  sendMessage(data: SendMessageRequest): Promise<ApiResponse<ChatMessage>> {
    return post('/chat/messages', data);
  },

  /**
   * 标记消息已读
   */
  markMessageAsRead(messageId: string): Promise<ApiResponse> {
    return put(`/chat/messages/${messageId}/read`);
  },

  /**
   * 标记对话已读
   */
  markConversationAsRead(conversationId: string): Promise<ApiResponse> {
    return put(`/chat/conversations/${conversationId}/read`);
  },

  /**
   * 删除消息
   */
  deleteMessage(messageId: string): Promise<ApiResponse> {
    return del(`/chat/messages/${messageId}`);
  },

  /**
   * 上传聊天文件
   */
  uploadFile(file: File, conversationId: string): Promise<ApiResponse<{
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  }>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('conversationId', conversationId);
    return post('/chat/upload', formData);
  },

  /**
   * 获取未读消息统计
   */
  getUnreadCount(): Promise<ApiResponse<{
    total: number;
    byConversation: Record<string, number>;
  }>> {
    return get('/chat/unread-count');
  }
};

// 兼容性导出
export const getChatConversations = chatApi.getConversations;
export const createChatConversation = chatApi.createConversation;
export const getChatMessages = chatApi.getMessages;
export const sendChatMessage = chatApi.sendMessage;