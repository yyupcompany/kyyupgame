/**
 * AI消息中间层
 * 负责AI消息管理，封装消息服务层逻辑
 */

import {
  aiMessageService,
  aiConversationService
} from '../../services/ai';
import { 
  BaseMiddleware, 
  IMiddlewareResult, 
  MiddlewareError, 
  ERROR_CODES 
} from './base.middleware';
import { MessageType, MessageStatus, MessageRole } from '../../models/ai-message.model';

// 类型定义
// 消息内容类型
type MessageContentType = 'text' | 'image' | 'audio' | 'video' | 'file';

// 消息状态类型
type MessageStatusType = 'sending' | 'delivered' | 'failed';

interface Message {
  id: string;
  role: string;
  content: string;
  messageType: string;
  mediaUrl?: string | null;
  tokens?: number;
  createdAt: Date;
}

interface MessageDetail extends Message {
  conversationId: string;
  metadata: Record<string, unknown>;
  status: string;
}

interface MessageCreationParams {
  userId: number;
  conversationId: string;
  role: string;
  content: string;
  messageType?: string;
  mediaUrl?: string;
  metadata?: Record<string, unknown>;
}

/**
 * AI消息中间层接口
 */
export interface IAiMessageMiddleware {
  createMessage(params: MessageCreationParams): Promise<IMiddlewareResult<Message>>;
  getConversationMessages(userId: number, conversationId: string, limit?: number, offset?: number): Promise<IMiddlewareResult<Message[]>>;
  getMessage(userId: number, messageId: string): Promise<IMiddlewareResult<MessageDetail | null>>;
  updateMessageStatus(userId: number, messageId: string, status: string): Promise<IMiddlewareResult<boolean>>;
  deleteMessage(userId: number, messageId: string): Promise<IMiddlewareResult<boolean>>;
  generateAIResponse(userId: number, conversationId: string, prompt: string): Promise<IMiddlewareResult<Message | null>>;
}

/**
 * AI消息中间层实现
 */
class AiMessageMiddleware extends BaseMiddleware implements IAiMessageMiddleware {
  /**
   * 创建消息
   * @param params 消息创建参数
   * @returns 创建的消息
   */
  async createMessage(params: MessageCreationParams): Promise<IMiddlewareResult<Message>> {
    try {
      // 解构参数
      const { 
        userId, 
        conversationId, 
        role, 
        content, 
        messageType = MessageType.TEXT, 
        mediaUrl, 
        metadata 
      } = params;
      
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:message:create']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有创建消息的权限',
          { userId }
        );
      }
      
      // 验证参数
      if (!conversationId) {
        throw new MiddlewareError(
          ERROR_CODES.VALIDATION_FAILED,
          '会话ID不能为空',
          { conversationId }
        );
      }
      
      if (!content && !mediaUrl) {
        throw new MiddlewareError(
          ERROR_CODES.VALIDATION_FAILED,
          '消息内容和媒体URL不能同时为空',
          { content, mediaUrl }
        );
      }
      
      // 验证会话存在且用户有权限
      const conversation = await aiConversationService.getConversation(conversationId);
      if (!conversation) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '会话不存在或无权访问',
          { conversationId }
        );
      }
      
      // 创建消息
      const message = await aiMessageService.createMessage({
        conversationId,
        role: role as MessageRole,
        content
      });
      
      // 记录操作
      await this.logOperation(userId, 'CREATE_MESSAGE', { 
        messageId: message.id,
        conversationId,
        role
      });
      
      return this.createSuccessResponse(message as unknown as Message);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<Message>;
    }
  }
  
  /**
   * 获取会话消息列表
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @param limit 数量限制
   * @param offset 偏移量
   * @returns 消息列表
   */
  async getConversationMessages(
    userId: number, 
    conversationId: string, 
    limit = 50, 
    offset = 0
  ): Promise<IMiddlewareResult<Message[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:message:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看消息的权限',
          { userId }
        );
      }
      
      // 验证会话存在且用户有权限
      const conversation = await aiConversationService.getConversation(conversationId);
      if (!conversation) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '会话不存在或无权访问',
          { conversationId }
        );
      }

      // 获取会话消息
      const result = await aiMessageService.getConversationMessages(
        conversationId,
        userId,
        { page: Math.floor(offset / limit) + 1, pageSize: limit }
      );
      const messages = result.messages;
      
      return this.createSuccessResponse(messages as unknown as Message[]);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<Message[]>;
    }
  }
  
  /**
   * 获取消息详情
   * @param userId 用户ID
   * @param messageId 消息ID
   * @returns 消息详情
   */
  async getMessage(userId: number, messageId: string): Promise<IMiddlewareResult<MessageDetail | null>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:message:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看消息的权限',
          { userId }
        );
      }
      
      // 获取消息详情
      const message = await aiMessageService.getMessage(messageId);
      
      return this.createSuccessResponse(message as unknown as MessageDetail | null);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<MessageDetail | null>;
    }
  }
  
  /**
   * 更新消息状态
   * @param userId 用户ID
   * @param messageId 消息ID
   * @param status 新状态
   * @returns 更新结果
   */
  async updateMessageStatus(userId: number, messageId: string, status: string): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:message:update']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有更新消息的权限',
          { userId }
        );
      }
      
      // 验证消息存在且用户有权限
      const message = await aiMessageService.getMessage(messageId);
      if (!message) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '消息不存在或无权访问',
          { messageId }
        );
      }

      // 更新消息状态
      const result = await aiMessageService.updateMessageStatus(
        messageId,
        status as MessageStatus
      );
      
      // 记录操作
      await this.logOperation(userId, 'UPDATE_MESSAGE_STATUS', { 
        messageId,
        status
      });
      
      return this.createSuccessResponse(true);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 删除消息
   * @param userId 用户ID
   * @param messageId 消息ID
   * @returns 删除结果
   */
  async deleteMessage(userId: number, messageId: string): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:message:delete']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有删除消息的权限',
          { userId }
        );
      }
      
      // 验证消息存在且用户有权限
      const message = await aiMessageService.getMessage(messageId);
      if (!message) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '消息不存在或无权访问',
          { messageId }
        );
      }
      
      // 由于服务层未提供删除消息的方法，返回错误信息
      throw new MiddlewareError(
        ERROR_CODES.SERVICE_UNAVAILABLE,
        '删除消息功能暂不可用',
        { messageId }
      );
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 生成AI响应
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @param prompt 提示文本
   * @returns AI响应消息
   */
  async generateAIResponse(userId: number, conversationId: string, prompt: string): Promise<IMiddlewareResult<Message | null>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:message:generate']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有生成AI响应的权限',
          { userId }
        );
      }
      
      // 验证会话存在且用户有权限
      const conversation = await aiConversationService.getConversation(conversationId);
      if (!conversation) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '会话不存在或无权访问',
          { conversationId }
        );
      }

      // 记录用户消息
      await this.createMessage({
        userId,
        conversationId,
        role: MessageRole.USER,
        content: prompt
      });

      // TODO: 调用AI服务生成响应
      // 这里简化实现，实际应用中应该调用OpenAI等服务
      const aiResponse = "我是AI助手，很高兴为您服务。";

      // 创建AI响应消息
      const responseMessage = await this.createMessage({
        userId,
        conversationId,
        role: MessageRole.ASSISTANT,
        content: aiResponse
      });
      
      return responseMessage;
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<Message | null>;
    }
  }
}

// 导出单例实例
export const aiMessageMiddleware = new AiMessageMiddleware(); 