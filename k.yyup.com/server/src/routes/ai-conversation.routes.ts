import { Router } from 'express';
import { AIConversationController } from '../controllers/ai-conversation.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { rateLimit } from 'express-rate-limit';

const router = Router();

// API限流配置 - 临时关闭速率限制用于测试
const conversationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 10000, // 临时关闭速率限制，最大10000次请求
  message: {
    success: false,
    message: 'API请求过于频繁，请稍后再试'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 应用中间件 - 临时禁用速率限制用于测试
router.use(verifyToken);
// router.use(conversationLimiter); // 完全禁用速率限制

/**
 * @swagger
 * tags:
 *   - name: AI Conversations
 *     description: AI会话管理接口
 */

/**
 * @swagger
 * /api/ai-conversations:
 *   get:
 *     summary: 获取用户的会话列表
 *     tags: [AI Conversations]
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
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: archived
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含归档会话
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: 未认证
 */
router.get('/', AIConversationController.getConversations);

/**
 * @swagger
 * /api/ai-conversations:
 *   post:
 *     summary: 创建新会话
 *     tags: [AI Conversations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 会话标题（可选）
 *                 example: "新会话"
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未认证
 */
router.post('/', AIConversationController.createConversation);

/**
 * @swagger
 * /api/ai-conversations/{id}:
 *   put:
 *     summary: 更新会话标题
 *     tags: [AI Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 example: "更新的会话标题"
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 会话不存在
 *       401:
 *         description: 未认证
 */
router.put('/:id', AIConversationController.updateConversationTitle);

/**
 * @swagger
 * /api/ai-conversations/{id}:
 *   delete:
 *     summary: 删除会话（软删除）
 *     tags: [AI Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 会话ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 会话不存在
 *       401:
 *         description: 未认证
 */
router.delete('/:id', AIConversationController.deleteConversation);

/**
 * @swagger
 * /api/ai-conversations/{id}/messages:
 *   get:
 *     summary: 获取会话消息列表
 *     tags: [AI Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     conversation:
 *                       $ref: '#/components/schemas/Conversation'
 *                     messages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Message'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         description: 会话不存在
 *       401:
 *         description: 未认证
 */
router.get('/:id/messages', AIConversationController.getConversationMessages);

/**
 * @swagger
 * /api/ai-conversations/{id}/messages:
 *   post:
 *     summary: 添加消息到会话
 *     tags: [AI Conversations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *                 enum: [user, assistant, system, tool]
 *                 description: 消息角色
 *                 example: "user"
 *               content:
 *                 type: string
 *                 description: 消息内容
 *                 example: "你好，我想了解一下..."
 *               messageType:
 *                 type: string
 *                 enum: [text, image, audio, video, file]
 *                 description: 消息类型
 *                 default: "text"
 *               metadata:
 *                 type: object
 *                 description: 消息元数据
 *                 example: {}
 *     responses:
 *       201:
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Message'
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 会话不存在
 *       401:
 *         description: 未认证
 */
router.post('/:id/messages', AIConversationController.addMessage);

export default router;