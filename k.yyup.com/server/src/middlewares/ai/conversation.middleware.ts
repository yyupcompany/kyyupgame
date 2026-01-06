/**
 * AI会话中间层
 * 处理用户与AI的会话管理，组合会话服务、消息服务和记忆服务
 */

import {
  aiConversationService,
  aiMessageService,
  // aiMemoryService removed - replaced by six-dimensional memory system
} from '../../services/ai';
import { 
  BaseMiddleware, 
  IMiddlewareResult, 
  MiddlewareError, 
  ERROR_CODES 
} from './base.middleware';
import { MessageRole } from '../../models/ai-message.model';

/**
 * AI会话中间层接口
 */
export interface IAiConversationMiddleware {
  // 会话管理
  createConversation(userId: number, title?: string): Promise<IMiddlewareResult<{id: string; title: string | null}>>;
  getConversations(userId: number, includeArchived?: boolean): Promise<IMiddlewareResult<any[]>>;
  getConversationDetails(userId: number, conversationId: string): Promise<IMiddlewareResult<any>>;
  updateConversation(userId: number, conversationId: string, data: any): Promise<IMiddlewareResult<boolean>>;
  deleteConversation(userId: number, conversationId: string): Promise<IMiddlewareResult<boolean>>;
  
  // 消息管理
  sendMessage(userId: number, conversationId: string, content: string): Promise<IMiddlewareResult<any>>;
  getMessages(userId: number, conversationId: string, limit?: number): Promise<IMiddlewareResult<any[]>>;
  
  // 记忆管理
  createMemory(userId: number, conversationId: string, content: string, type?: string): Promise<IMiddlewareResult<{id: number}>>;
  getMemories(userId: number, conversationId: string): Promise<IMiddlewareResult<any[]>>;
}

/**
 * AI会话中间层实现
 */
class AiConversationMiddleware extends BaseMiddleware implements IAiConversationMiddleware {
  /**
   * 创建会话
   * @param userId 用户ID
   * @param title 会话标题（可选）
   * @returns 创建的会话信息
   */
  async createConversation(
    userId: number, 
    title?: string
  ): Promise<IMiddlewareResult<{id: string; title: string | null}>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:conversation:create']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有创建会话的权限',
          { userId }
        );
      }
      
      // 创建会话
      const conversation = await aiConversationService.createConversation(userId, title);
      
      // 记录操作
      await this.logOperation(userId, 'CREATE_CONVERSATION', { 
        conversationId: conversation.id,
        title: conversation.title
      });
      
      return this.createSuccessResponse(conversation);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<{id: string; title: string | null}>;
    }
  }
  
  /**
   * 获取用户会话列表
   * @param userId 用户ID
   * @param includeArchived 是否包含已归档会话
   * @returns 会话列表
   */
  async getConversations(
    userId: number, 
    includeArchived = false
  ): Promise<IMiddlewareResult<any[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:conversation:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看会话的权限',
          { userId }
        );
      }
      
      // 获取会话列表
      const conversations = await aiConversationService.getRecentConversations(
        userId,
        20 // 默认返回20条
      );
      
      return this.createSuccessResponse(conversations);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<any[]>;
    }
  }
  
  /**
   * 获取会话详情
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @returns 会话详情
   */
  async getConversationDetails(
    userId: number, 
    conversationId: string
  ): Promise<IMiddlewareResult<any>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:conversation:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看会话详情的权限',
          { userId, conversationId }
        );
      }
      
      // 获取会话详情
      const conversation = await aiConversationService.getConversation(conversationId);
      
      if (!conversation) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '会话不存在或无权访问',
          { conversationId }
        );
      }
      
      // 获取会话消息 - 暂时注释，等待API更新
      // const messages = await messageService.getConversationMessages(userId, conversationId, 50);
      const messages: any[] = []; // 临时空数组
      
      // 获取会话记忆
      // 对话记忆获取已由六维记忆系统处理
      const memories: any[] = [];
      
      // 组合结果
      const result = {
        ...conversation,
        messages,
        memories
      };
      
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * 更新会话信息
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @param data 更新数据
   * @returns 更新结果
   */
  async updateConversation(
    userId: number, 
    conversationId: string, 
    data: any
  ): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:conversation:update']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有更新会话的权限',
          { userId, conversationId }
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

      // 更新会话信息
      let result: any = false;

      // 根据需要更新不同字段
      if (data.title !== undefined) {
        result = await aiConversationService.updateConversationTitle(
          conversationId,
          data.title
        );
      }

      if (data.summary !== undefined) {
        result = await aiConversationService.updateConversationSummary(
          conversationId,
          data.summary
        );
      }

      if (data.isArchived !== undefined) {
        if (data.isArchived) {
          result = await aiConversationService.archiveConversation(conversationId);
        } else {
          result = await aiConversationService.unarchiveConversation(conversationId);
        }
      }
      
      // 记录操作
      await this.logOperation(userId, 'UPDATE_CONVERSATION', { 
        conversationId,
        data
      });
      
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 删除会话
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @returns 删除结果
   */
  async deleteConversation(
    userId: number, 
    conversationId: string
  ): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:conversation:delete']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有删除会话的权限',
          { userId, conversationId }
        );
      }
      
      // 删除会话
      const result = await aiConversationService.deleteConversation(Number(conversationId));
      
      if (!result) {
        throw new MiddlewareError(
          ERROR_CODES.NOT_FOUND,
          '会话不存在或无权访问',
          { conversationId }
        );
      }
      
      // 记录操作
      await this.logOperation(userId, 'DELETE_CONVERSATION', { conversationId });
      
      return this.createSuccessResponse(result);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 发送消息
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @param content 消息内容
   * @returns 消息发送结果
   */
  async sendMessage(
    userId: number, 
    conversationId: string, 
    content: string
  ): Promise<IMiddlewareResult<any>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:message:create']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有发送消息的权限',
          { userId, conversationId }
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
      
      // 使用新的消息服务发送消息（包含RAG功能）
      const aiMessage = await aiMessageService.sendMessage({
        conversationId,
        userId,
        content,
        metadata: {}
      });
      
      // 🧠 激活六维记忆系统 - 记录用户消息到情节记忆
      try {
        // 导入六维记忆系统
        const { getMemorySystem } = await import('../../services/memory/six-dimension-memory.service');
        const memorySystem = getMemorySystem();

        await memorySystem.recordConversation(
          'user',
          content,
          {
            userId: userId.toString(),
            conversationId,
            messageId: aiMessage.id,
            role: 'user',
            timestamp: new Date()
          }
        );

        console.log('✅ 六维记忆系统已记录用户消息', {
          userId,
          conversationId,
          messageId: aiMessage.id,
          contentLength: content.length
        });
      } catch (memoryError) {
        console.warn('⚠️ 六维记忆系统记录失败，继续使用传统存储:', memoryError instanceof Error ? memoryError.message : String(memoryError));
      }
      
      // 记录操作
      await this.logOperation(userId, 'SEND_MESSAGE', {
        conversationId,
        messageId: aiMessage.id
      });

      // 返回结果
      return this.createSuccessResponse({
        aiMessage
      });
    } catch (error) {
      return this.handleError(error);
    }
  }
  
  /**
   * 获取会话消息
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @param limit 消息数量限制
   * @returns 消息列表
   */
  async getMessages(
    userId: number, 
    conversationId: string, 
    limit = 50
  ): Promise<IMiddlewareResult<any[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:message:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看消息的权限',
          { userId, conversationId }
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
      const result = await aiMessageService.getConversationMessages(String(conversationId));
      const messages = result.messages || [];
      
      return this.createSuccessResponse(messages);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<any[]>;
    }
  }
  
  /**
   * 创建记忆
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @param content 记忆内容
   * @param type 记忆类型
   * @returns 创建的记忆信息
   */
  async createMemory(
    userId: number, 
    conversationId: string, 
    content: string, 
    type = 'immediate'
  ): Promise<IMiddlewareResult<{id: number}>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:memory:create']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有创建记忆的权限',
          { userId, conversationId }
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

      // 创建记忆 - 已由六维记忆系统处理
      const memory = { id: 0, message: '记忆创建由六维记忆系统处理' };
      console.log('记忆创建由六维记忆系统处理', { userId, conversationId, contentLength: content.length });
      
      // 记录操作
      await this.logOperation(userId, 'CREATE_MEMORY', { 
        conversationId,
        memoryId: memory.id,
        type
      });
      
      return this.createSuccessResponse(memory);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<{id: number}>;
    }
  }
  
  /**
   * 获取会话记忆
   * @param userId 用户ID
   * @param conversationId 会话ID
   * @returns 记忆列表
   */
  async getMemories(
    userId: number, 
    conversationId: string
  ): Promise<IMiddlewareResult<any[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:memory:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看记忆的权限',
          { userId, conversationId }
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

      // 获取会话记忆 - 已由六维记忆系统处理
      const memories: any[] = [];
      
      return this.createSuccessResponse(memories);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<any[]>;
    }
  }
}

// 导出单例实例
export const aiConversationMiddleware = new AiConversationMiddleware(); 