import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../../services/ai/message.service';
import { ApiError } from '../../utils/apiError';

/**
 * @openapi
 * tags:
 *   name: AI消息
 *   description: 管理AI系统会话中的消息，包括创建、获取和删除消息
 */

/**
 * AI消息控制器
 * 负责处理会话消息相关的HTTP请求
 */
export class MessageController {
  private messageService = new MessageService();

  /**
   * @openapi
   * /api/v1/ai/conversations/{conversationId}/messages:
   *   get:
   *     summary: 获取消息列表
   *     description: 获取指定会话的所有消息列表，支持分页
   *     tags:
   *       - AI消息
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: conversationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 会话ID
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
   *           default: 20
   *         description: 每页条数
   *     responses:
   *       200:
   *         description: 成功获取消息列表
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/Message'
   *                 meta:
   *                   type: object
   *                   properties:
   *                     page:
   *                       type: integer
   *                       example: 1
   *                     pageSize:
   *                       type: integer
   *                       example: 20
   *                     totalItems:
   *                       type: integer
   *                       example: 35
   *                     totalPages:
   *                       type: integer
   *                       example: 2
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public listMessages = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }
      
      const { page = 1, pageSize = 20 } = req.query;
      const options = {
        page: Number(page) || 0,
        pageSize: Number(pageSize) || 0,
      };

      const result = await this.messageService.getConversationMessages(conversationId, userId, options);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  /**
   * @openapi
   * /api/v1/ai/conversations/{conversationId}/messages:
   *   post:
   *     summary: 创建新消息
   *     description: 在指定会话中创建一条新消息
   *     tags:
   *       - AI消息
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: conversationId
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
   *             required:
   *               - role
   *               - content
   *             properties:
   *               role:
   *                 type: string
   *                 enum: [user, assistant, system]
   *                 description: 消息发送者角色
   *                 example: user
   *               content:
   *                 type: string
   *                 description: 消息内容
   *                 example: "我想了解更多关于AI的知识"
   *     responses:
   *       201:
   *         description: 消息创建成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Message'
   *       400:
   *         description: 请求参数错误
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 code:
   *                   type: integer
   *                   example: 400
   *                 message:
   *                   type: string
   *                   example: 角色和内容不能为空
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public createMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { conversationId } = req.params;
      const userId = req.user?.id;
      const { content, metadata, stream = false, pagePath } = req.body;

      // 添加调试日志
      console.log('\x1b[32m[MessageController] 接收到消息请求:\x1b[0m', {
        conversationId,
        userId,
        contentLength: content?.length,
        stream,
        metadata
      });

      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }

      if (!content) {
        return next(ApiError.badRequest('消息内容不能为空'));
      }

      // 检查是否请求流式输出
      if (stream) {
        console.log('\x1b[33m[MessageController] 处理流式输出请求\x1b[0m');
        // 设置流式响应头
        res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

        try {
          // 调用流式消息服务
          const streamResult = await this.messageService.sendMessage({
            conversationId,
            userId,
            content,
            metadata,
            pagePath,
          }, true);

          // 如果返回的是流，则管道到响应
          if (streamResult && typeof streamResult.pipe === 'function') {
            streamResult.pipe(res);

            streamResult.on('end', () => {
              res.end();
            });

            streamResult.on('error', (error: any) => {
              console.error('流式输出错误:', error);
              res.write(`data: ${JSON.stringify({ type: 'error', message: '流式输出失败' })}\n\n`);
              res.end();
            });
          } else {
            // 如果不是流，发送错误
            res.write(`data: ${JSON.stringify({ type: 'error', message: '流式输出初始化失败' })}\n\n`);
            res.end();
          }
        } catch (error) {
          console.error('流式消息处理失败:', error);
          res.write(`data: ${JSON.stringify({ type: 'error', message: '流式消息处理失败' })}\n\n`);
          res.end();
        }
      } else {
        // 非流式输出，使用原有逻辑
        const aiMessage = await this.messageService.sendMessage({
          conversationId,
          userId,
          content,
          metadata,
          pagePath,
        });

        res.status(200).json({
          code: 200,
          message: 'success',
          data: aiMessage
        });
      }
    } catch (error) {
      next(error);
    }
  };
  
  /**
   * @openapi
   * /api/v1/ai/conversations/{conversationId}/messages/{messageId}:
   *   delete:
   *     summary: 删除消息
   *     description: 删除指定ID的消息
   *     tags:
   *       - AI消息
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: conversationId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 会话ID
   *       - in: path
   *         name: messageId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: 消息ID
   *     responses:
   *       204:
   *         description: 消息删除成功
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       404:
   *         $ref: '#/components/responses/NotFoundError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public deleteMessage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;

      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }

      await this.messageService.deleteMessage(messageId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };
} 