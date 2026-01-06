import { Request, Response } from 'express';
import { AIConversation, AIMessage } from '../models';
import { Op } from 'sequelize';
import { MessageRole } from '../models/ai-message.model';

/**
 * AI会话管理控制器
 * 负责处理会话的CRUD操作和消息管理
 */

export class AIConversationController {
  /**
   * 获取用户的会话列表
   */
  static async getConversations(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { page = 1, pageSize = 20, archived = false } = req.query;

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const { count, rows: conversations } = await AIConversation.findAndCountAll({
        where: {
          userId,
          isArchived: archived === 'true'
        },
        order: [['lastMessageAt', 'DESC']],
        limit,
        offset,
        include: [{
          model: AIMessage,
          as: 'messages',
          required: false,
          where: { isDeleted: false },
          limit: 20, // 每个会话最多加载20条消息
          order: [['createdAt', 'ASC']]
        }]
      });

      res.json({
        success: true,
        data: conversations,
        meta: {
          page: Number(page),
          pageSize: Number(pageSize),
          totalItems: count,
          totalPages: Math.ceil(count / Number(pageSize))
        }
      });
    } catch (error) {
      console.error('获取会话列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取会话列表失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 创建新会话
   */
  static async createConversation(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const { title } = req.body;

      const conversation = await AIConversation.create({
        userId,
        title: title || '新会话',
        lastMessageAt: new Date(),
        messageCount: 0
      });

      // 检查用户会话数量，如果超过限制则归档最早的会话
      await AIConversationController.archiveOldConversations(userId);

      res.status(201).json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('创建会话失败:', error);
      res.status(500).json({
        success: false,
        message: '创建会话失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 更新会话标题
   */
  static async updateConversationTitle(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { title } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const conversation = await AIConversation.findOne({
        where: { id, userId }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '会话不存在'
        });
      }

      await conversation.update({ title });

      res.json({
        success: true,
        data: conversation
      });
    } catch (error) {
      console.error('更新会话标题失败:', error);
      res.status(500).json({
        success: false,
        message: '更新会话标题失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 删除会话
   */
  static async deleteConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const conversation = await AIConversation.findOne({
        where: { id, userId }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '会话不存在'
        });
      }

      // 软删除会话相关的所有消息
      await AIMessage.update(
        { isDeleted: true },
        { where: { conversationId: id } }
      );

      // 归档会话
      await conversation.update({ isArchived: true });

      res.json({
        success: true,
        message: '会话已删除'
      });
    } catch (error) {
      console.error('删除会话失败:', error);
      res.status(500).json({
        success: false,
        message: '删除会话失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 获取会话详情（包含消息列表）
   */
  static async getConversationMessages(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { page = 1, pageSize = 20 } = req.query;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const conversation = await AIConversation.findOne({
        where: { id, userId }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '会话不存在'
        });
      }

      const offset = (Number(page) - 1) * Number(pageSize);
      const limit = Number(pageSize);

      const { count, rows: messages } = await AIMessage.findAndCountAll({
        where: {
          conversationId: id,
          isDeleted: false
        },
        order: [['createdAt', 'ASC']],
        limit,
        offset
      });

      res.json({
        success: true,
        data: {
          conversation,
          messages
        },
        meta: {
          page: Number(page),
          pageSize: Number(pageSize),
          totalItems: count,
          totalPages: Math.ceil(count / Number(pageSize))
        }
      });
    } catch (error) {
      console.error('获取会话消息失败:', error);
      res.status(500).json({
        success: false,
        message: '获取会话消息失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 添加消息到会话
   */
  static async addMessage(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { role, content, messageType = 'text', metadata = {} } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const conversation = await AIConversation.findOne({
        where: { id, userId }
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: '会话不存在'
        });
      }

      // 创建新消息
      const message = await AIMessage.create({
        conversationId: id,
        userId,
        role,
        content,
        messageType,
        metadata
      });

      // 更新会话的最后消息时间和消息数量
      await conversation.update({
        lastMessageAt: new Date(),
        messageCount: conversation.messageCount + 1
      });

      // 🔧 暂时注释掉消息修剪功能，先确保基本功能正常
      // TODO: 修复静态方法调用问题
      // await AIConversationController.trimConversationMessages(id);

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('添加消息失败:', error);
      res.status(500).json({
        success: false,
        message: '添加消息失败',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  }

  /**
   * 归档旧会话（保持最多50个活跃会话）
   */
  private static async archiveOldConversations(userId: number) {
    try {
      const activeConversationsCount = await AIConversation.count({
        where: {
          userId,
          isArchived: false
        }
      });

      if (activeConversationsCount > 50) {
        // 归档最早的会话
        const conversationsToArchive = await AIConversation.findAll({
          where: {
            userId,
            isArchived: false
          },
          order: [['lastMessageAt', 'ASC']],
          limit: activeConversationsCount - 45
        });

        for (const conversation of conversationsToArchive) {
          await conversation.update({ isArchived: true });
        }
      }
    } catch (error) {
      console.error('归档旧会话失败:', error);
    }
  }

  /**
   * 修剪会话消息（保持最多20条消息）
   * @param conversationId 会话ID
   */
  private static async trimConversationMessages(conversationId: string) {
    try {
      const messageCount = await AIMessage.count({
        where: {
          conversationId,
          isDeleted: false
        }
      });

      if (messageCount > 20) {
        // 获取需要删除的消息ID（最早的消息）
        const messagesToDelete = await AIMessage.findAll({
          where: {
            conversationId,
            isDeleted: false
          },
          order: [['createdAt', 'ASC']],
          limit: messageCount - 20,
          attributes: ['id']
        });

        // 软删除多余的消息
        if (messagesToDelete.length > 0) {
          const messageIds = messagesToDelete.map(msg => msg.id);
          await AIMessage.update(
            { isDeleted: true },
            {
              where: {
                id: { [Op.in]: messageIds }
              }
            }
          );

          // 更新会话的消息数量
          const newMessageCount = await AIMessage.count({
            where: {
              conversationId,
              isDeleted: false
            }
          });

          await AIConversation.update(
            { messageCount: newMessageCount },
            { where: { id: conversationId } }
          );
        }
      }
    } catch (error) {
      console.error('修剪会话消息失败:', error);
    }
  }
}