import { Router } from 'express';
import { FeedbackController } from '../../controllers/ai/feedback.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

/**
* @swagger
* tags:
*   name: AI反馈
*   description: 管理用户对AI系统的反馈和评价
*/

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const feedbackController = new FeedbackController();

/**
* @swagger
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
router.post(
  '/',
  verifyToken,
  feedbackController.submitFeedback
);

export default router; 