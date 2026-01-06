import { Router } from 'express';
import { ConversationController } from '../../controllers/ai/conversation.controller';
import { verifyToken } from '../../middlewares/auth.middleware';
import messageRoutes from './message.routes';

/**
* @swagger
* tags:
*   name: AI会话
*   description: 管理AI系统的会话，包括创建、获取、更新和删除会话
* 
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*   
*   responses:
*     UnauthorizedError:
*       description: 访问令牌丢失、无效或过期
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               code:
*                 type: integer
*                 example: 401
*               message:
*                 type: string
*                 example: 用户未授权
*
*     NotFoundError:
*       description: 请求的资源不存在
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               code:
*                 type: integer
*                 example: 404
*               message:
*                 type: string
*                 example: 会话不存在或无权访问
*
*     ServerError:
*       description: 服务器内部错误
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               code:
*                 type: integer
*                 example: 500
*               message:
*                 type: string
*                 example: 服务器内部错误
*
*   schemas:
*     Conversation:
*       type: object
*       properties:
*         id:
*           type: string
*           format: uuid
*           description: 会话唯一标识符
*         title:
*           type: string
*           description: 会话标题
*           example: "教学计划讨论"
*         userId:
*           type: string
*           format: uuid
*           description: 创建会话的用户ID
*         isArchived:
*           type: boolean
*           description: 是否已归档
*           default: false
*         messageCount:
*           type: integer
*           description: 会话中的消息数量
*           example: 5
*         lastMessageAt:
*           type: string
*           format: date-time
*           description: 最后一条消息的时间
*         createdAt:
*           type: string
*           format: date-time
*           description: 会话创建时间
*         updatedAt:
*           type: string
*           format: date-time
*           description: 会话更新时间
*       required:
*         - id
*         - userId
*         - isArchived
*         - createdAt
*         - updatedAt
*
*     ConversationListResponse:
*       type: object
*       properties:
*         code:
*           type: integer
*           example: 200
*         message:
*           type: string
*           example: "获取会话列表成功"
*         data:
*           type: object
*           properties:
*             conversations:
*               type: array
*               items:
*                 $ref: '#/components/schemas/Conversation'
*             pagination:
*               type: object
*               properties:
*                 page:
*                   type: integer
*                   description: 当前页码
*                   example: 1
*                 pageSize:
*                   type: integer
*                   description: 每页条数
*                   example: 10
*                 total:
*                   type: integer
*                   description: 总记录数
*                   example: 25
*                 totalPages:
*                   type: integer
*                   description: 总页数
*                   example: 3
*               required:
*                 - page
*                 - pageSize
*                 - total
*                 - totalPages
*           required:
*             - conversations
*             - pagination
*       required:
*         - code
*         - message
*         - data
*/

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const conversationController = new ConversationController();

/**
* @swagger
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
*               $ref: '#/components/schemas/ConversationListResponse'
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.get(
  '/',
  verifyToken,
  conversationController.listConversations
);

/**
* @swagger
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
router.post(
  '/',
  verifyToken,
  conversationController.createConversation
);

/**
* @swagger
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
*         $ref: '#/components/responses/NotFoundError'
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.get(
  '/:id',
  verifyToken,
  conversationController.getConversationById
);

/**
* @swagger
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
router.patch(
  '/:id',
  verifyToken,
  conversationController.updateConversation
);

/**
* @swagger
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
router.delete(
  '/:id',
  verifyToken,
  conversationController.deleteConversation
);

// 挂载消息路由到会话路由下
router.use('/:conversationId/messages', messageRoutes);

export default router;