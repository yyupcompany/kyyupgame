/**
 * AI对话服务
 * 管理AI对话会话
 */

import { AIConversation, AIMessage } from '../../models';
import { MessageRole } from '../../models/ai-message.model';
import { getMemorySystem } from '../memory/six-dimension-memory.service';

export interface ConversationData {
  id?: string;
  userId: number;
  title?: string;
  model?: string;
  status?: string;
}

export interface MessageData {
  conversationId: string;
  role: MessageRole;
  content: string;
}

export class ConversationService {
  /**
   * 创建对话
   * @param userIdOrData - 用户ID或对话数据对象
   * @param title - 对话标题（可选，当第一个参数是userId时使用）
   */
  async createConversation(userIdOrData: number | ConversationData, title?: string): Promise<any> {
    try {
      let data: ConversationData;

      if (typeof userIdOrData === 'number') {
        data = { userId: userIdOrData, title };
      } else {
        data = userIdOrData;
      }

      // 检查用户现有会话数量，每个用户最多保留10个会话
      const MAX_CONVERSATIONS = 10;
      const existingConversations = await AIConversation.findAll({
        where: { userId: data.userId },
        order: [['createdAt', 'ASC']], // 按创建时间升序排列，最旧的在前
        attributes: ['id', 'createdAt', 'title']
      });

      // 如果已有10个或更多会话，删除最旧的会话
      if (existingConversations.length >= MAX_CONVERSATIONS) {
        const conversationsToDelete = existingConversations.slice(0, existingConversations.length - MAX_CONVERSATIONS + 1);
        const idsToDelete = conversationsToDelete.map(c => c.id);
        
        console.log(`✨ 用户 ${data.userId} 已有 ${existingConversations.length} 个会话，删除最旧的 ${conversationsToDelete.length} 个会话`);
        console.log(`删除的会话 ID:`, idsToDelete);
        
        // 删除旧会话及其消息
        const deletedMessages = await AIMessage.destroy({ where: { conversationId: idsToDelete } });
        const deletedConversations = await AIConversation.destroy({ where: { id: idsToDelete } });
        
        // 删除相关的六维记忆数据（情节记忆）
        await this.deleteConversationMemories(idsToDelete);
        
        console.log(`✅ 已删除 ${deletedConversations} 个会话、${deletedMessages} 条消息和相关记忆`);
      }

      // 只创建数据库中存在的字段
      const conversationData: any = {
        userId: data.userId,
        title: data.title || '新对话'
      };
      
      // 如果数据库支持 model 和 status 字段，再添加
      // 这里暂时不添加，避免字段不存在错误

      const conversation = await AIConversation.create(conversationData);
      return conversation;
    } catch (error) {
      console.error('创建对话失败:', error);
      throw error;
    }
  }

  /**
   * 获取对话列表
   */
  async getConversations(userId: number): Promise<any[]> {
    try {
      const conversations = await AIConversation.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        // 只查询数据库中存在的字段，避免 model/status 字段错误
        attributes: [
          'id',
          'userId',
          'title',
          'summary',
          'lastMessageAt',
          'messageCount',
          'isArchived',
          'createdAt',
          'updatedAt'
        ]
      });
      return conversations;
    } catch (error) {
      console.error('获取对话列表失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户对话列表（别名）
   */
  async getUserConversations(userId: number, options?: any): Promise<{ conversations: any[]; total: number }> {
    const conversations = await this.getConversations(userId);
    return { conversations, total: conversations.length };
  }

  /**
   * 获取对话详情
   */
  async getConversation(conversationId: string): Promise<any> {
    try {
      return await AIConversation.findByPk(conversationId);
    } catch (error) {
      console.error('获取对话详情失败:', error);
      throw error;
    }
  }

  /**
   * 更新对话
   */
  async updateConversation(conversationId: string, data: Partial<ConversationData>): Promise<any> {
    try {
      const conversation = await AIConversation.findByPk(conversationId);
      if (!conversation) throw new Error('对话不存在');
      const { id, ...updateData } = data;
      await conversation.update(updateData);
      return conversation;
    } catch (error) {
      console.error('更新对话失败:', error);
      throw error;
    }
  }

  /**
   * 删除对话
   */
  async deleteConversation(conversationId: number): Promise<boolean> {
    try {
      // 先删除消息
      await AIMessage.destroy({ where: { conversationId } });
      
      // 删除会话
      const result = await AIConversation.destroy({ where: { id: conversationId } });
      
      // 删除相关的六维记忆数据
      await this.deleteConversationMemories([conversationId]);
      
      return result > 0;
    } catch (error) {
      console.error('删除对话失败:', error);
      throw error;
    }
  }

  /**
   * 删除会话相关的六维记忆数据
   * @param conversationIds - 会话ID数组
   */
  private async deleteConversationMemories(conversationIds: any[]): Promise<void> {
    try {
      const memorySystem = getMemorySystem();
      let totalDeleted = 0;
      
      for (const conversationId of conversationIds) {
        // 删除情节记忆中与该会话相关的记录
        // metadata 中包含 conversationId
        const deleted = await memorySystem.getEpisodic().deleteByMetadata({ conversationId });
        totalDeleted += deleted;
      }
      
      if (totalDeleted > 0) {
        console.log(`🧠 已删除 ${totalDeleted} 条六维记忆数据（会话ID: ${conversationIds.join(', ')})`);
      }
    } catch (error) {
      // 记忆删除失败不应该影响会话删除
      console.warn('⚠️ 删除六维记忆数据失败:', error instanceof Error ? error.message : String(error));
    }
  }

  /**
   * 添加消息到对话
   */
  async addMessage(data: MessageData): Promise<any> {
    try {
      const message = await AIMessage.create({
        conversationId: data.conversationId,
        role: data.role,
        content: data.content
      });
      return message;
    } catch (error) {
      console.error('添加消息失败:', error);
      throw error;
    }
  }

  /**
   * 获取对话消息
   */
  async getMessages(conversationId: number): Promise<any[]> {
    try {
      const messages = await AIMessage.findAll({
        where: { conversationId },
        order: [['createdAt', 'ASC']]
      });
      return messages;
    } catch (error) {
      console.error('获取消息失败:', error);
      throw error;
    }
  }

  /**
   * 获取最近对话
   */
  async getRecentConversations(userId: number, limit: number = 10): Promise<any[]> {
    try {
      const conversations = await AIConversation.findAll({
        where: { userId },
        order: [['updatedAt', 'DESC']],
        limit,
        // 只查询数据库中存在的字段
        attributes: [
          'id',
          'userId',
          'title',
          'summary',
          'lastMessageAt',
          'messageCount',
          'isArchived',
          'createdAt',
          'updatedAt'
        ]
      });
      return conversations;
    } catch (error) {
      console.error('获取最近对话失败:', error);
      throw error;
    }
  }

  /**
   * 更新对话标题
   */
  async updateConversationTitle(conversationId: string, title: string): Promise<any> {
    return this.updateConversation(conversationId, { title });
  }

  /**
   * 更新对话摘要
   */
  async updateConversationSummary(conversationId: string, summary: string): Promise<any> {
    return this.updateConversation(conversationId, { title: summary });
  }

  /**
   * 归档对话
   */
  async archiveConversation(conversationId: string): Promise<any> {
    return this.updateConversation(conversationId, { status: 'archived' });
  }

  /**
   * 取消归档对话
   */
  async unarchiveConversation(conversationId: string): Promise<any> {
    return this.updateConversation(conversationId, { status: 'active' });
  }
}

export const conversationService = new ConversationService();
export default conversationService;

