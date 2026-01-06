import { Request, Response, NextFunction } from 'express';
import { FeedbackService } from '../../services/ai/feedback.service';
import { ApiError } from '../../utils/apiError';
import { FeedbackType, FeedbackSource } from '../../models/ai-feedback.model';

/**
 * @openapi
 * tags:
 *   name: AI反馈
 *   description: 管理用户对AI系统的反馈和评价
 */

/**
 * AI反馈控制器
 * 负责处理用户反馈相关的HTTP请求
 */
export class FeedbackController {
  private feedbackService = new FeedbackService();

  /**
   * @openapi
   * /api/v1/ai/feedback:
   *   post:
   *     summary: 提交反馈
   *     description: 提交用户对AI系统的反馈信息
   *     tags:
   *       - AI反馈
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - feedbackType
   *               - sourceType
   *               - content
   *             properties:
   *               feedbackType:
   *                 type: string
   *                 enum: [general, response, suggestion, bug, feature]
   *                 description: 反馈类型
   *                 example: "suggestion"
   *               sourceType:
   *                 type: string
   *                 enum: [conversation, message, application, system]
   *                 description: 反馈来源类型
   *                 example: "conversation"
   *               sourceId:
   *                 type: string
   *                 nullable: true
   *                 description: 反馈来源ID（如会话ID、消息ID）
   *                 example: "conv-12345-abcde"
   *               content:
   *                 type: string
   *                 description: 反馈内容
   *                 example: "希望能增加更多的模型选择"
   *               rating:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 5
   *                 nullable: true
   *                 description: 反馈评分（1-5分）
   *                 example: 4
   *     responses:
   *       201:
   *         description: 反馈提交成功
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Feedback'
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
   *                   example: 反馈类型、来源和内容不能为空
   *       401:
   *         $ref: '#/components/responses/UnauthorizedError'
   *       500:
   *         $ref: '#/components/responses/ServerError'
   */
  public submitFeedback = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return next(ApiError.unauthorized('用户未授权'));
      }

      const {
        feedbackType,
        sourceType,
        sourceId,
        content,
        rating
      } = req.body;

      if (!feedbackType || !sourceType || !content) {
        return next(ApiError.badRequest('反馈类型、来源和内容不能为空'));
      }

      const feedbackDto = {
        userId,
        feedbackType: feedbackType as FeedbackType,
        sourceType: sourceType as FeedbackSource,
        sourceId: sourceId as string | undefined,
        content: content as string,
        rating: rating ? Number(rating) || 0 : undefined,
      };

      const newFeedback = await this.feedbackService.createFeedback(feedbackDto);
      res.status(201).json(newFeedback);
    } catch (error) {
      next(error);
    }
  };
} 