import { Request, Response, NextFunction } from 'express';
import { ConversationService } from '../../services/ai/conversation.service';
import { ApiError } from '../../utils/apiError';

/**
 * @openapi
 * tags:
 *   name: AI会话
 *   description: 管理AI系统的会话，包括创建、获取、更新和删除会话
 */

/**
 * AI会话控制器
 * 负责处理会话相关的HTTP请求
 */
export class ConversationController {
  private conversationService = new ConversationService();

  /**
   * @openapi
   * /api/v1/ai/conversations:
   *   get:
   *     summary: 获取会话列表
   *     description: 获取当前用户的所有会话列表，支持分页和归档状态过滤
   *     tags:
   *       - AI会话
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: page
   *         schema:
   *           type: integer
   *           default: 1
   *         description: 页码
   *       - in: query
   *         name: pageSize
   *         schema:
   *           type: integer
   *           default: 10
   *         description: 每页条数
   *       - in: query
   *         name: isArchived
   *         schema:
   *           type: boolean
   *         description: 是否归档，不传则返回所有状态的会话
   *     responses:
   *       200:
   *         description: 成功获取会话列表
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Conversation'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     pageSize:
   *                       type: integer
   *                       example: 10
   *                     totalItems:
   *                       type: integer
   *                       example: 35
   *                     totalPages:
   *                       type: integer
   *                       example: 4
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public listConversations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }
      // 从查询参数获取分页和过滤选项
      const { page = 1, pageSize = 10, isArchived, keyword } = req.query as any;
      const options = {
        page: Number(page) || 1,
        pageSize: Number(pageSize) || 10,
        isArchived: isArchived !== undefined ? String(isArchived) === 'true' : undefined,
        keyword: keyword ? String(keyword) : undefined,
      };
      
      const result = await this.conversationService.getUserConversations(userId, options);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @openapi
   * /api/v1/ai/conversations/{id}:
   *   get:
   *     summary: 获取单个会话详情
   *     description: 根据ID获取特定会话的详细信息
   *     tags:
   *       - AI会话
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 会话ID
   *     responses:
   *       200:
   *         description: 成功获取会话详情
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Conversation'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         description: 会话不存在
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public getConversationById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }

      const conversation = await this.conversationService.getConversation(conversationId);
      res.status(200).json(conversation);
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * @openapi
   * /api/v1/ai/conversations:
   *   post:
   *     summary: 创建新会话
   *     description: 创建一个新的AI会话
   *     tags:
   *       - AI会话
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: false
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: 会话标题，可选
   *                 example: "教学计划讨论"
   *     responses:
   *       201:
   *         description: 会话创建成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Conversation'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public createConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }
      // 从请求体获取可选的标题
      const { title } = req.body;
      
      const newConversation = await this.conversationService.createConversation(userId, title);
      res.status(201).json(newConversation);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @openapi
   * /api/v1/ai/conversations/{id}:
   *   patch:
   *     summary: 更新会话
   *     description: 更新现有会话的标题、归档状态等信息
   *     tags:
   *       - AI会话
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 会话ID
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: 新的会话标题
   *               isArchived:
   *                 type: boolean
   *                 description: 是否归档
   *     responses:
   *       200:
   *         description: 会话更新成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Conversation'
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public updateConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }

      // 从请求体获取要更新的数据
      const updateData = req.body;
      
      const updatedConversation = await this.conversationService.updateConversation(conversationId, updateData);
      res.status(200).json(updatedConversation);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @openapi
   * /api/v1/ai/conversations/{id}:
   *   delete:
   *     summary: 删除会话
   *     description: 永久删除指定ID的会话及其相关的消息记录
   *     tags:
   *       - AI会话
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 会话ID
   *     responses:
   *       204:
   *         description: 会话删除成功
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public deleteConversation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const conversationId = req.params.id;
      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }

      await this.conversationService.deleteConversation(Number(conversationId));
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
} 