import { Router } from 'express';
import { MessageController } from '../../controllers/ai/message.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';

/**
* @swagger
* tags:
*   - name: AI消息管理
*     description: AI系统会话消息管理，支持多种消息类型、状态管理和流式处理
*
* components:
*   schemas:
*     Message:
*       type: object
*       properties:
*         id:
*           type: integer
*           description: 消息唯一标识
*           example: 123
*         conversationId:
*           type: string
*           format: uuid
*           description: 所属会话ID
*           example: "550e8400-e29b-41d4-a716-446655440000"
*         role:
*           type: string
*           enum: [user, assistant, system]
*           description: 消息发送者角色
*           example: "user"
*         content:
*           type: string
*           description: 消息内容
*           example: "我想了解更多关于AI的知识"
*         messageType:
*           type: string
*           enum: [text, image, audio, video, file, system]
*           description: 消息类型
*           default: text
*           example: "text"
*         status:
*           type: string
*           enum: [sending, sent, delivered, read, failed]
*           description: 消息状态
*           default: sent
*           example: "sent"
*         metadata:
*           type: object
*           description: 消息元数据
*           properties:
*             tokenCount:
*               type: integer
*               description: 消息消耗的token数量
*               example: 150
*             model:
*               type: string
*               description: 处理消息的AI模型
*               example: "gpt-4"
*             streaming:
*               type: boolean
*               description: 是否为流式消息
*               default: false
*             attachments:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   type:
*                     type: string
*                     example: "image"
*                   url:
*                     type: string
*                     example: "https://example.com/image.jpg"
*                   name:
*                     type: string
*                     example: "attachment.jpg"
*         createdAt:
*           type: string
*           format: date-time
*           description: 创建时间
*           example: "2023-12-01T10:00:00Z"
*         updatedAt:
*           type: string
*           format: date-time
*           description: 更新时间
*           example: "2023-12-01T10:00:00Z"
*       required:
*         - id
*         - conversationId
*         - role
*         - content
*         - createdAt
*         - updatedAt
*
*     MessageListResponse:
*       type: object
*       properties:
*         success:
*           type: boolean
*           description: 请求是否成功
*           example: true
*         data:
*           type: object
*           properties:
*             messages:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Message'
*               description: 消息列表
*             pagination:
*               type: object
*               properties:
*                 page:
*                   type: integer
*                   example: 1
*                 pageSize:
*                   type: integer
*                   example: 20
*                 total:
*                   type: integer
*                   example: 100
*                 totalPages:
*                   type: integer
*                   example: 5
*               description: 分页信息
*         message:
*           type: string
*           description: 响应消息
*           example: "获取消息列表成功"
*
*     CreateMessageRequest:
*       type: object
*       properties:
*         role:
*           type: string
*           enum: [user, assistant, system]
*           description: 消息发送者角色
*           example: "user"
*         content:
*           type: string
*           description: 消息内容
*           example: "我想了解更多关于AI的知识"
*         messageType:
*           type: string
*           enum: [text, image, audio, video, file, system]
*           description: 消息类型
*           default: text
*           example: "text"
*         metadata:
*           type: object
*           description: 消息元数据
*           properties:
*             streaming:
*               type: boolean
*               description: 是否为流式消息
*               default: false
*             model:
*               type: string
*               description: 指定AI模型
*               example: "gpt-4"
*             attachments:
*               type: array
*               items:
*                 type: object
*                 properties:
*                   type:
*                     type: string
*                     example: "image"
*                   url:
*                     type: string
*                     example: "https://example.com/image.jpg"
*       required:
*         - role
*         - content
*
*     UpdateMetadataRequest:
*       type: object
*       properties:
*         metadata:
*           type: object
*           description: 要更新的元数据
*           example:
*             tokenCount: 150
*             model: "gpt-4"
*             processed: true
*       required:
*         - metadata
*
*     ErrorResponse:
*       type: object
*       properties:
*         success:
*           type: boolean
*           example: false
*         error:
*           type: string
*           description: 错误信息
*           example: "参数验证失败"
*         code:
*           type: integer
*           description: 错误代码
*           example: 400
*
*   responses:
*     UnauthorizedError:
*       description: 未授权访问
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/ErrorResponse'
*           example:
*             success: false
*             error: "未授权访问，请提供有效的认证信息"
*             code: 401
*
*     NotFoundError:
*       description: 资源不存在
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/ErrorResponse'
*           example:
*             success: false
*             error: "指定的会话或消息不存在"
*             code: 404
*
*     ServerError:
*       description: 服务器内部错误
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/ErrorResponse'
*           example:
*             success: false
*             error: "服务器内部错误，请稍后重试"
*             code: 500
*
*     ValidationError:
*       description: 请求参数验证失败
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/ErrorResponse'
*           example:
*             success: false
*             error: "请求参数不完整或格式错误"
*             code: 400
*/

// 使用 mergeParams: true 来获取父级路由中的 :conversationId
const router = Router({ mergeParams: true });
const messageController = new MessageController();

/**
* @swagger
* /api/v1/ai/conversations/{conversationId}/messages:
*   get:
*     summary: 获取会话消息列表
*     description: |
*       获取指定会话的所有消息列表，支持分页查询和多种过滤选项。
*       按时间倒序返回消息，最新消息在前。
*
*       **业务场景：**
*       - 加载会话历史记录
*       - 分页浏览长会话内容
*       - 按消息类型筛选显示
*       - 按状态筛选消息
*
*       **权限控制：**
*       - 用户只能访问自己创建的会话消息
*       - 支持管理员查看所有会话消息
*     tags:
*       - AI消息管理
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: conversationId
*         required: true
*         schema:
*           type: string
*           format: uuid
*         description: 会话唯一标识符
*         example: "550e8400-e29b-41d4-a716-446655440000"
*       - in: query
*         name: page
*         schema:
*           type: integer
*           minimum: 1
*           default: 1
*         description: 页码，从1开始
*         example: 1
*       - in: query
*         name: pageSize
*         schema:
*           type: integer
*           minimum: 1
*           maximum: 100
*           default: 20
*         description: 每页消息数量，最大100条
*         example: 20
*       - in: query
*         name: messageType
*         schema:
*           type: string
*           enum: [text, image, audio, video, file, system]
*         description: 按消息类型过滤
*         example: "text"
*       - in: query
*         name: status
*         schema:
*           type: string
*           enum: [sending, sent, delivered, read, failed]
*         description: 按消息状态过滤
*         example: "sent"
*       - in: query
*         name: role
*         schema:
*           type: string
*           enum: [user, assistant, system]
*         description: 按发送者角色过滤
*         example: "user"
*       - in: query
*         name: startDate
*         schema:
*           type: string
*           format: date-time
*         description: 开始时间过滤（ISO 8601格式）
*         example: "2023-12-01T00:00:00Z"
*       - in: query
*         name: endDate
*         schema:
*           type: string
*           format: date-time
*         description: 结束时间过滤（ISO 8601格式）
*         example: "2023-12-31T23:59:59Z"
*     responses:
*       200:
*         description: 成功获取消息列表
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/MessageListResponse'
*             example:
*               success: true
*               data:
*                 messages:
*                   - id: 123
*                     conversationId: "550e8400-e29b-41d4-a716-446655440000"
*                     role: "user"
*                     content: "你好，我想了解AI的知识"
*                     messageType: "text"
*                     status: "sent"
*                     metadata:
*                       tokenCount: 25
*                       streaming: false
*                     createdAt: "2023-12-01T10:00:00Z"
*                     updatedAt: "2023-12-01T10:00:00Z"
*                   - id: 124
*                     conversationId: "550e8400-e29b-41d4-a716-446655440000"
*                     role: "assistant"
*                     content: "您好！我很高兴为您介绍AI相关的知识..."
*                     messageType: "text"
*                     status: "delivered"
*                     metadata:
*                       tokenCount: 180
*                       model: "gpt-4"
*                       streaming: false
*                     createdAt: "2023-12-01T10:00:05Z"
*                     updatedAt: "2023-12-01T10:00:05Z"
*                 pagination:
*                   page: 1
*                   pageSize: 20
*                   total: 45
*                   totalPages: 3
*               message: "获取消息列表成功"
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       404:
*         description: 会话不存在或无权访问
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "指定的会话不存在或您没有权限访问"
*               code: 404
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.get(
  '/',
  authMiddleware,
  messageController.listMessages
);

/**
* @swagger
* /api/v1/ai/conversations/{conversationId}/messages:
*   post:
*     summary: 创建新消息
*     description: |
*       在指定会话中创建一条新消息。支持多种消息类型和状态管理。
*
*       **业务场景：**
*       - 用户发送问题到AI助手
*       - AI助手回复用户消息
*       - 系统发送通知消息
*       - 支持流式和非流式消息创建
*       - 支持附件上传（图片、文件等）
*
*       **权限控制：**
*       - 用户只能在自己的会话中创建消息
*       - system角色消息需要管理员权限
*       - 流式消息需要特殊权限
*     tags:
*       - AI消息管理
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: conversationId
*         required: true
*         schema:
*           type: string
*           format: uuid
*         description: 会话唯一标识符
*         example: "550e8400-e29b-41d4-a716-446655440000"
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/CreateMessageRequest'
*           examples:
*             basicTextMessage:
*               summary: 基本文本消息
*               value:
*                 role: "user"
*                 content: "请帮我解释一下机器学习的基本概念"
*                 messageType: "text"
*             messageWithAttachment:
*               summary: 带附件的消息
*               value:
*                 role: "user"
*                 content: "请分析这张图片"
*                 messageType: "image"
*                 metadata:
*                   attachments:
*                     - type: "image"
*                       url: "https://example.com/image.jpg"
*                       name: "分析图片.jpg"
*             streamingMessage:
*               summary: 流式消息
*               value:
*                 role: "assistant"
*                 content: "我来为您详细解释..."
*                 messageType: "text"
*                 metadata:
*                   streaming: true
*                   model: "gpt-4"
*     responses:
*       201:
*         description: 消息创建成功
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   $ref: '#/components/schemas/Message'
*                 message:
*                   type: string
*                   example: "消息创建成功"
*             example:
*               success: true
*               data:
*                 id: 125
*                 conversationId: "550e8400-e29b-41d4-a716-446655440000"
*                 role: "user"
*                 content: "请帮我解释一下机器学习的基本概念"
*                 messageType: "text"
*                 status: "sent"
*                 metadata:
*                   tokenCount: 35
*                   streaming: false
*                 createdAt: "2023-12-01T10:05:00Z"
*                 updatedAt: "2023-12-01T10:05:00Z"
*               message: "消息创建成功"
*       400:
*         $ref: '#/components/responses/ValidationError'
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       403:
*         description: 权限不足
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "您没有权限在此会话中创建system类型消息"
*               code: 403
*       404:
*         description: 会话不存在
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "指定的会话不存在"
*               code: 404
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.post(
  '/',
  authMiddleware,
  messageController.createMessage
);

/**
* @swagger
* /api/v1/ai/conversations/{conversationId}/messages/{messageId}/metadata:
*   patch:
*     summary: 更新消息元数据
*     description: |
*       合并更新指定消息的metadata字段，支持添加或修改消息的扩展信息。
*
*       **业务场景：**
*       - 更新消息的token消耗统计
*       - 记录消息处理使用的AI模型
*       - 添加消息相关的分析数据
*       - 更新消息的处理状态
*       - 添加自定义标签和分类
*
*       **权限控制：**
*       - 用户只能更新自己会话中的消息元数据
*       - 管理员可以更新所有消息的元数据
*       - 系统关键字段需要特殊权限
*     tags:
*       - AI消息管理
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: conversationId
*         required: true
*         schema:
*           type: string
*           format: uuid
*         description: 会话唯一标识符
*         example: "550e8400-e29b-41d4-a716-446655440000"
*       - in: path
*         name: messageId
*         required: true
*         schema:
*           type: integer
*         description: 消息唯一标识符
*         example: 123
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/UpdateMetadataRequest'
*           examples:
*             updateTokenCount:
*               summary: 更新token统计
*               value:
*                 metadata:
*                   tokenCount: 150
*                   model: "gpt-4"
*                   processed: true
*             addAnalysisData:
*               summary: 添加分析数据
*               value:
*                 metadata:
*                   sentiment: "positive"
*                   category: "technical"
*                   keywords: ["AI", "machine learning", "explanation"]
*                   confidence: 0.95
*     responses:
*       200:
*         description: 元数据更新成功
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   $ref: '#/components/schemas/Message'
*                 message:
*                   type: string
*                   example: "消息元数据更新成功"
*             example:
*               success: true
*               data:
*                 id: 123
*                 conversationId: "550e8400-e29b-41d4-a716-446655440000"
*                 role: "user"
*                 content: "请帮我解释一下机器学习"
*                 messageType: "text"
*                 status: "sent"
*                 metadata:
*                   tokenCount: 150
*                   model: "gpt-4"
*                   processed: true
*                   sentiment: "positive"
*                   category: "technical"
*                 createdAt: "2023-12-01T10:00:00Z"
*                 updatedAt: "2023-12-01T10:05:00Z"
*               message: "消息元数据更新成功"
*       400:
*         $ref: '#/components/responses/ValidationError'
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       403:
*         description: 权限不足或字段受保护
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "您没有权限修改系统保护的元数据字段"
*               code: 403
*       404:
*         description: 消息不存在或无权访问
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "指定的消息不存在或您没有权限访问"
*               code: 404
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.patch(
  '/:messageId/metadata',
  authMiddleware,
  async (req, res, next) => {
    try {
      const { messageId } = req.params as any;
      const metadata = req.body?.metadata || {};

      const { MessageService } = await import('../../services/ai/message.service');
      const service = new MessageService();

      const updated = await service.updateMessageMetadata(String(messageId), metadata);
      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  }
)


/**
* @swagger
* /api/v1/ai/conversations/{conversationId}/messages/{messageId}:
*   delete:
*     summary: 删除消息
*     description: |
*       删除指定ID的消息。删除操作不可逆，请谨慎操作。
*
*       **业务场景：**
*       - 用户删除不当或错误的消息
*       - 管理员清理违规内容
*       - 删除测试消息
*       - 用户隐私保护需求
*
*       **权限控制：**
*       - 用户只能删除自己会话中的消息
*       - 管理员可以删除任何消息
*       - 系统消息需要管理员权限删除
*       - 删除操作会记录审计日志
*
*       **注意事项：**
*       - 删除操作不可逆
*       - 可能影响AI对话的连续性
*       - 批量删除请使用专用接口
*     tags:
*       - AI消息管理
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: path
*         name: conversationId
*         required: true
*         schema:
*           type: string
*           format: uuid
*         description: 会话唯一标识符
*         example: "550e8400-e29b-41d4-a716-446655440000"
*       - in: path
*         name: messageId
*         required: true
*         schema:
*           type: integer
*         description: 消息唯一标识符
*         example: 123
*       - in: query
*         name: hardDelete
*         schema:
*           type: boolean
*           default: false
*         description: 是否彻底删除（true）或软删除（false），默认软删除
*         example: false
*     responses:
*       204:
*         description: 消息删除成功（无内容返回）
*       200:
*         description: 消息删除成功（返回删除信息）
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 message:
*                   type: string
*                   example: "消息删除成功"
*                 data:
*                   type: object
*                   properties:
*                     deletedMessageId:
*                       type: integer
*                       example: 123
*                     hardDelete:
*                       type: boolean
*                       example: false
*                     deletedAt:
*                       type: string
*                       format: date-time
*                       example: "2023-12-01T10:10:00Z"
*             example:
*               success: true
*               message: "消息删除成功"
*               data:
*                 deletedMessageId: 123
*                 hardDelete: false
*                 deletedAt: "2023-12-01T10:10:00Z"
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       403:
*         description: 权限不足
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "您没有权限删除此消息"
*               code: 403
*       404:
*         description: 消息不存在或无权访问
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "指定的消息不存在或您没有权限访问"
*               code: 404
*       409:
*         description: 消息正在处理中，无法删除
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "消息正在AI处理中，请稍后再试"
*               code: 409
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.delete(
  '/:messageId',
  authMiddleware,
  messageController.deleteMessage
);

export default router;