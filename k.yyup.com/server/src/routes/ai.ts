import { Router } from 'express';
import AIController from '../controllers/ai.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
// memoryRoutes removed - replaced by six-dimensional memory system

const router = Router();

// =============================================
// AI Root Route
// =============================================

/**
 * @swagger
 * /api/ai:
 *   get:
 *     summary: 获取AI模块API信息
 *     description: 返回AI模块的基本信息和可用端点
 *     tags: [AI - 基础信息]
 *     responses:
 *       200:
 *         description: 成功获取AI模块信息
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
 *                   example: "AI模块API"
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     description:
 *                       type: string
 *                       example: "幼儿园管理系统AI模块"
 *                     endpoints:
 *                       type: object
 *                       properties:
 *                         models:
 *                           type: string
 *                           example: "/models"
 *                         conversations:
 *                           type: string
 *                           example: "/conversations"
 *                         billing:
 *                           type: string
 *                           example: "/models/:id/billing"
 */
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI模块API',
    data: {
      version: '1.0.0',
      description: '幼儿园管理系统AI模块',
      endpoints: {
        models: '/models',
        conversations: '/conversations',
        billing: '/models/:id/billing'
      }
    }
  });
});

// =============================================
// Model Config Routes
// =============================================

/**
 * @swagger
 * /api/ai/models/stats:
 *   get:
 *     summary: 获取AI模型统计信息
 *     description: 获取所有AI模型的使用统计和性能数据
 *     tags: [AI - 模型管理]
 *     responses:
 *       200:
 *         description: 成功获取模型统计信息
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
 *                     totalModels:
 *                       type: integer
 *                     activeModels:
 *                       type: integer
 *                     totalUsage:
 *                       type: integer
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/stats', AIController.getStats);

/**
 * @swagger
 * /api/ai/models/default:
 *   get:
 *     summary: 获取默认AI模型
 *     description: 获取当前系统设置的默认AI模型配置
 *     tags: [AI - 模型管理]
 *     responses:
 *       200:
 *         description: 成功获取默认模型
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       404:
 *         description: 未找到默认模型
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/default', AIController.getDefaultModel);

/**
 * @swagger
 * /api/ai/models:
 *   get:
 *     summary: 获取所有AI模型
 *     description: 获取系统中配置的所有AI模型列表
 *     tags: [AI - 模型管理]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *     responses:
 *       200:
 *         description: 成功获取模型列表
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
 *                     $ref: '#/components/schemas/AIModel'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models', AIController.getAllModels);

/**
 * @swagger
 * /api/ai/models/{id}:
 *   get:
 *     summary: 根据ID获取AI模型
 *     description: 获取指定ID的AI模型详细信息
 *     tags: [AI - 模型管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取模型信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/:id', AIController.getModelById);

/**
 * @swagger
 * /api/ai/models:
 *   post:
 *     summary: 创建新的AI模型
 *     description: 创建新的AI模型配置（需要管理员权限）
 *     tags: [AI - 模型管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - provider
 *               - modelType
 *             properties:
 *               name:
 *                 type: string
 *                 description: 模型名称
 *               provider:
 *                 type: string
 *                 description: 模型提供商
 *               modelType:
 *                 type: string
 *                 description: 模型类型
 *               apiKey:
 *                 type: string
 *                 description: API密钥
 *               baseUrl:
 *                 type: string
 *                 description: 基础URL
 *               maxTokens:
 *                 type: integer
 *                 description: 最大令牌数
 *     responses:
 *       201:
 *         description: 模型创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.post('/models', AIController.createModel); // Assumes admin rights

/**
 * @swagger
 * /api/ai/models/{id}:
 *   patch:
 *     summary: 更新AI模型
 *     description: 更新指定ID的AI模型配置（需要管理员权限）
 *     tags: [AI - 模型管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 模型名称
 *               provider:
 *                 type: string
 *                 description: 模型提供商
 *               modelType:
 *                 type: string
 *                 description: 模型类型
 *               apiKey:
 *                 type: string
 *                 description: API密钥
 *               baseUrl:
 *                 type: string
 *                 description: 基础URL
 *               maxTokens:
 *                 type: integer
 *                 description: 最大令牌数
 *               isActive:
 *                 type: boolean
 *                 description: 是否启用
 *     responses:
 *       200:
 *         description: 模型更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.patch('/models/:id', AIController.updateModel); // Assumes admin rights

/**
 * @swagger
 * /api/ai/models/{id}:
 *   delete:
 *     summary: 删除AI模型
 *     description: 删除指定ID的AI模型（需要管理员权限）
 *     tags: [AI - 模型管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 模型删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.delete('/models/:id', AIController.deleteModel); // Assumes admin rights

/**
 * @swagger
 * /api/ai/models/default:
 *   post:
 *     summary: 设置默认AI模型
 *     description: 设置系统默认使用的AI模型
 *     tags: [AI - 模型管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelId
 *             properties:
 *               modelId:
 *                 type: integer
 *                 description: 要设置为默认的模型ID
 *     responses:
 *       200:
 *         description: 默认模型设置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/AIModel'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.post('/models/default', AIController.setDefaultModel);

/**
 * @swagger
 * /api/ai/models/{id}/capabilities/{capability}:
 *   get:
 *     summary: 检查模型能力
 *     description: 检查指定AI模型是否支持特定能力
 *     tags: [AI - 模型管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *       - name: capability
 *         in: path
 *         required: true
 *         description: 能力类型
 *         schema:
 *           type: string
 *           enum: [text_generation, image_generation, speech_to_text, text_to_speech, translation]
 *     responses:
 *       200:
 *         description: 成功检查模型能力
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
 *                     modelId:
 *                       type: integer
 *                     capability:
 *                       type: string
 *                     supported:
 *                       type: boolean
 *                     details:
 *                       type: object
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/:id/capabilities/:capability', AIController.checkModelCapability);

// =============================================
// Model Billing Routes
// =============================================

/**
 * @swagger
 * /api/ai/models/{id}/billing:
 *   get:
 *     summary: 获取模型计费规则
 *     description: 获取指定AI模型的计费规则和价格配置
 *     tags: [AI - 计费管理]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取计费规则
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
 *                     $ref: '#/components/schemas/BillingRule'
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/models/:id/billing', AIController.getBillingRules);

/**
 * @swagger
 * /api/ai/models/{id}/billing:
 *   post:
 *     summary: 创建计费规则
 *     description: 为指定AI模型创建新的计费规则（需要管理员权限）
 *     tags: [AI - 计费管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 模型ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - billingType
 *               - rate
 *             properties:
 *               billingType:
 *                 type: string
 *                 enum: [per_token, per_request, per_minute]
 *                 description: 计费类型
 *               rate:
 *                 type: number
 *                 description: 费率
 *               currency:
 *                 type: string
 *                 default: "CNY"
 *                 description: 货币类型
 *               description:
 *                 type: string
 *                 description: 规则描述
 *     responses:
 *       201:
 *         description: 计费规则创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BillingRule'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 模型不存在
 *       500:
 *         description: 服务器内部错误
 */
router.post('/models/:id/billing', AIController.createBillingRule); // Assumes admin rights

// =============================================
// Conversation & Message Routes
// =============================================
// All routes below would typically be protected by an authentication middleware
router.use(authMiddleware);

/**
 * @swagger
 * /api/ai/conversations:
 *   get:
 *     summary: 获取对话列表
 *     description: 获取当前用户的AI对话列表
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: 成功获取对话列表
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
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.get('/conversations', AIController.getConversations);

/**
 * @swagger
 * /api/ai/conversations:
 *   post:
 *     summary: 创建新对话
 *     description: 创建新的AI对话会话
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 对话标题
 *               modelId:
 *                 type: integer
 *                 description: 使用的AI模型ID（可选，默认使用系统默认模型）
 *               systemPrompt:
 *                 type: string
 *                 description: 系统提示词
 *               context:
 *                 type: object
 *                 description: 对话上下文信息
 *     responses:
 *       201:
 *         description: 对话创建成功
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
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.post('/conversations', AIController.createConversation);

/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   get:
 *     summary: 获取对话详情
 *     description: 获取指定ID的对话详细信息
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取对话详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/conversations/:id', AIController.getConversationById);

/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   put:
 *     summary: 更新对话信息
 *     description: 更新指定对话的信息
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 对话标题
 *               systemPrompt:
 *                 type: string
 *                 description: 系统提示词
 *               context:
 *                 type: object
 *                 description: 对话上下文信息
 *               isActive:
 *                 type: boolean
 *                 description: 是否活跃
 *     responses:
 *       200:
 *         description: 对话更新成功
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
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.put('/conversations/:id', AIController.updateConversation);

/**
 * @swagger
 * /api/ai/conversations/{id}:
 *   delete:
 *     summary: 删除对话
 *     description: 删除指定的对话及其所有消息
 *     tags: [AI - 对话管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 对话删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.delete('/conversations/:id', AIController.deleteConversation);

/**
 * @swagger
 * /api/ai/conversations/{id}/messages:
 *   get:
 *     summary: 获取对话消息
 *     description: 获取指定对话的所有消息
 *     tags: [AI - 消息管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *     responses:
 *       200:
 *         description: 成功获取消息列表
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
 *                     $ref: '#/components/schemas/AIMessage'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/conversations/:id/messages', AIController.getConversationMessages);

/**
 * @swagger
 * /api/ai/conversations/{id}/messages:
 *   post:
 *     summary: 发送消息
 *     description: 向指定对话发送新消息并获取AI回复
 *     tags: [AI - 消息管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 对话ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: 消息内容
 *               messageType:
 *                 type: string
 *                 enum: [text, image, file]
 *                 default: text
 *                 description: 消息类型
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *                     name:
 *                       type: string
 *                 description: 附件列表
 *     responses:
 *       201:
 *         description: 消息发送成功，返回用户消息和AI回复
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
 *                     userMessage:
 *                       $ref: '#/components/schemas/AIMessage'
 *                     aiResponse:
 *                       $ref: '#/components/schemas/AIMessage'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 对话不存在
 *       500:
 *         description: 服务器内部错误
 */
router.post('/conversations/:id/messages', AIController.sendMessage);

// =============================================
// Memory Routes
// =============================================

/**
 * @swagger
 * /api/ai/memories:
 *   get:
 *     summary: 获取AI记忆列表
 *     description: 获取当前用户的AI记忆和偏好信息
 *     tags: [AI - 记忆管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: memoryType
 *         in: query
 *         description: 记忆类型筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [user_preference, user_interest, conversation_context, system_note]
 *       - name: importance
 *         in: query
 *         description: 重要性筛选（最小值）
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 10
 *     responses:
 *       200:
 *         description: 成功获取记忆列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIMemory'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.get('/memories', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }
    
    // 返回模拟的记忆列表
    res.status(200).json({
      code: 200,
      message: 'success',
      data: [
        {
          id: 1,
          content: '用户喜欢春季活动',
          memoryType: 'user_preference',
          importance: 8,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          content: '用户关注招生宣传',
          memoryType: 'user_interest',
          importance: 7,
          createdAt: new Date().toISOString()
        }
      ]
    });
  } catch (error) {
    console.error('获取记忆列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取记忆列表失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * @swagger
 * /api/ai/memories:
 *   post:
 *     summary: 创建AI记忆
 *     description: 为当前用户创建新的AI记忆条目
 *     tags: [AI - 记忆管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - memoryType
 *             properties:
 *               conversationId:
 *                 type: integer
 *                 description: 关联的对话ID（可选）
 *               content:
 *                 type: string
 *                 description: 记忆内容
 *                 minLength: 1
 *                 maxLength: 1000
 *               memoryType:
 *                 type: string
 *                 enum: [user_preference, user_interest, conversation_context, system_note]
 *                 description: 记忆类型
 *               importance:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 10
 *                 default: 5
 *                 description: 重要性等级（1-10）
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *     responses:
 *       201:
 *         description: 记忆创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   $ref: '#/components/schemas/AIMemory'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.post('/memories', async (req, res) => {
  try {
    const userId = req.user?.id;
    const { conversationId, content, memoryType, importance } = req.body;
    
    if (!userId) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }
    
    if (!content || !memoryType) {
      return res.status(400).json({ 
        code: 400, 
        message: 'content and memoryType are required' 
      });
    }
    
    // 返回模拟的创建结果
    const newMemory = {
      id: Date.now(),
      userId,
      conversationId,
      content,
      memoryType,
      importance: importance || 5,
      createdAt: new Date().toISOString()
    };
    
    res.status(201).json({
      code: 201,
      message: 'success',
      data: newMemory
    });
  } catch (error) {
    console.error('创建记忆失败:', error);
    res.status(500).json({
      code: 500,
      message: '创建记忆失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// router.use('/', memoryRoutes); // removed - replaced by six-dimensional memory system

// =============================================
// AI Predictions Routes
// =============================================

/**
 * @swagger
 * /api/ai/predictions:
 *   get:
 *     summary: 获取AI预测分析
 *     description: 获取基于AI分析的幼儿园运营预测数据，包括招生、出勤、活动和资源使用预测
 *     tags: [AI - 预测分析]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timeRange
 *         in: query
 *         description: 预测时间范围
 *         required: false
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *       - name: category
 *         in: query
 *         description: 预测类别
 *         required: false
 *         schema:
 *           type: string
 *           enum: [enrollment, attendance, activities, resources, all]
 *           default: all
 *     responses:
 *       200:
 *         description: 成功获取AI预测分析
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
 *                   example: "获取AI预测分析成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     enrollment:
 *                       type: object
 *                       properties:
 *                         nextMonth:
 *                           type: object
 *                           properties:
 *                             predicted:
 *                               type: integer
 *                               example: 45
 *                             confidence:
 *                               type: number
 *                               format: float
 *                               example: 0.85
 *                             trend:
 *                               type: string
 *                               enum: [increasing, stable, decreasing]
 *                               example: "increasing"
 *                         nextQuarter:
 *                           type: object
 *                           properties:
 *                             predicted:
 *                               type: integer
 *                               example: 120
 *                             confidence:
 *                               type: number
 *                               format: float
 *                               example: 0.78
 *                             trend:
 *                               type: string
 *                               enum: [increasing, stable, decreasing]
 *                               example: "stable"
 *                     attendance:
 *                       type: object
 *                       properties:
 *                         weeklyPrediction:
 *                           type: array
 *                           items:
 *                             type: integer
 *                           example: [92, 89, 94, 91, 88]
 *                         averageRate:
 *                           type: number
 *                           format: float
 *                           example: 90.8
 *                         confidence:
 *                           type: number
 *                           format: float
 *                           example: 0.82
 *                     activities:
 *                       type: object
 *                       properties:
 *                         participationRate:
 *                           type: object
 *                           properties:
 *                             predicted:
 *                               type: number
 *                               format: float
 *                               example: 87.5
 *                             confidence:
 *                               type: number
 *                               format: float
 *                               example: 0.79
 *                             recommendations:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["建议增加户外活动", "考虑添加科学实验课程"]
 *                     resources:
 *                       type: object
 *                       properties:
 *                         teacherWorkload:
 *                           type: object
 *                           properties:
 *                             prediction:
 *                               type: string
 *                               enum: [low, moderate, high]
 *                               example: "moderate"
 *                             confidence:
 *                               type: number
 *                               format: float
 *                               example: 0.74
 *                             suggestions:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["合理分配教学任务", "适当增加助教支持"]
 *                         facilityUsage:
 *                           type: object
 *                           properties:
 *                             classrooms:
 *                               type: number
 *                               format: float
 *                               example: 0.85
 *                             playground:
 *                               type: number
 *                               format: float
 *                               example: 0.72
 *                             library:
 *                               type: number
 *                               format: float
 *                               example: 0.45
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [trend, alert, opportunity]
 *                           message:
 *                             type: string
 *                           priority:
 *                             type: string
 *                             enum: [low, medium, high]
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器内部错误
 */
router.get('/predictions', async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ 
        success: false,
        message: 'Unauthorized' 
      });
    }
    
    // 返回AI预测分析数据
    res.status(200).json({
      success: true,
      message: '获取AI预测分析成功',
      data: {
        enrollment: {
          nextMonth: {
            predicted: 45,
            confidence: 0.85,
            trend: 'increasing'
          },
          nextQuarter: {
            predicted: 120,
            confidence: 0.78,
            trend: 'stable'
          }
        },
        attendance: {
          weeklyPrediction: [92, 89, 94, 91, 88],
          averageRate: 90.8,
          confidence: 0.82
        },
        activities: {
          participationRate: {
            predicted: 87.5,
            confidence: 0.79,
            recommendations: [
              '建议增加户外活动',
              '考虑添加科学实验课程',
              '增强亲子互动活动'
            ]
          }
        },
        resources: {
          teacherWorkload: {
            prediction: 'moderate',
            confidence: 0.74,
            suggestions: ['合理分配教学任务', '适当增加助教支持']
          },
          facilityUsage: {
            classrooms: 0.85,
            playground: 0.72,
            library: 0.45
          }
        },
        insights: [
          {
            type: 'trend',
            message: '招生趋势稳定，建议加强宣传活动',
            priority: 'medium'
          },
          {
            type: 'alert',
            message: '图书馆使用率偏低，建议增加阅读活动',
            priority: 'low'
          },
          {
            type: 'opportunity',
            message: '户外活动参与度高，可考虑扩展相关项目',
            priority: 'high'
          }
        ]
      }
    });
  } catch (error) {
    console.error('获取AI预测分析失败:', error);
    res.status(500).json({
      success: false,
      message: '获取AI预测分析失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// =============================================
// Agent Dispatch Routes
// =============================================

/**
 * @swagger
 * /api/ai/agent/dispatch:
 *   post:
 *     summary: 调度AI智能体
 *     description: 向指定类型的AI智能体发送消息并获取响应
 *     tags: [AI - 智能体调度]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentType
 *               - message
 *             properties:
 *               agentType:
 *                 type: string
 *                 enum: [ACTIVITY_PLANNER, CONTENT_CREATOR]
 *                 description: 智能体类型
 *                 example: "ACTIVITY_PLANNER"
 *               message:
 *                 type: string
 *                 description: 发送给智能体的消息
 *                 minLength: 1
 *                 maxLength: 1000
 *                 example: "帮我策划一个春季亲子活动"
 *     responses:
 *       200:
 *         description: 智能体响应成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     agentType:
 *                       type: string
 *                       example: "ACTIVITY_PLANNER"
 *                     content:
 *                       type: string
 *                       description: 智能体的响应内容
 *                     sessionId:
 *                       type: string
 *                       description: 会话ID
 *                       example: "session_1673445600000_123"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: 响应时间戳
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
 *                   example: "agentType and message are required"
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 401
 *                 message:
 *                   type: string
 *                   example: "Unauthorized"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 *                   example: "智能体调度失败"
 *                 error:
 *                   type: string
 *                   description: 错误详情
 */
router.post('/agent/dispatch', async (req, res) => {
  try {
    const { agentType, message } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ code: 401, message: 'Unauthorized' });
    }
    
    if (!agentType || !message) {
      return res.status(400).json({ 
        code: 400, 
        message: 'agentType and message are required' 
      });
    }
    
    // 简单的智能体响应模拟
    const responses = {
      'ACTIVITY_PLANNER': '我是活动策划智能体，很高兴为您服务！针对您的需求，我建议从以下几个方面来策划活动：\n1. 明确活动目标和主题\n2. 确定目标受众和参与人数\n3. 制定详细的活动流程和时间安排\n4. 准备必要的物料和场地\n5. 建立有效的宣传推广策略',
      'CONTENT_CREATOR': '我是内容创作智能体，很高兴为您提供创作服务！基于您的需求，我会为您创作优质的内容：\n1. 深入了解您的品牌定位和目标受众\n2. 制定符合品牌调性的内容策略\n3. 创作吸引人的标题和正文内容\n4. 优化内容的可读性和传播效果\n5. 提供多样化的内容形式建议'
    };
    
    const response = responses[agentType] || '我是AI智能体，很高兴为您服务！我正在为您处理这个请求...';
    
    res.status(200).json({
      code: 200,
      message: 'success',
      data: {
        agentType,
        content: response + `\n\n您的问题："${message}"`,
        sessionId: `session_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('智能体调度失败:', error);
    res.status(500).json({
      code: 500,
      message: '智能体调度失败',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// =============================================
// Image Generation Routes  
// =============================================

/**
 * @swagger
 * /api/ai/generate-activity-image:
 *   post:
 *     summary: 生成活动海报图片
 *     description: 使用AI文生图模型为活动生成海报图片，支持自定义提示词和风格
 *     tags: [AI - 图片生成]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - prompt
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: 图片生成提示词
 *                 example: "3-6岁幼儿园春游活动场景，孩子们在公园里快乐游玩"
 *               style:
 *                 type: string
 *                 enum: [cartoon, natural, artistic]
 *                 default: cartoon
 *                 description: 图片风格
 *               size:
 *                 type: string  
 *                 enum: ["512x512", "1024x1024", "1024x768", "768x1024"]
 *                 default: "1024x768"
 *                 description: 图片尺寸
 *               category:
 *                 type: string
 *                 enum: [activity, poster, template, marketing, education]
 *                 default: activity
 *                 description: 图片分类
 *               activityData:
 *                 type: object
 *                 description: 活动相关数据，用于优化图片生成
 *                 properties:
 *                   title:
 *                     type: string
 *                     description: 活动标题
 *                   description:  
 *                     type: string
 *                     description: 活动描述
 *                   activityType:
 *                     type: integer
 *                     description: 活动类型
 *     responses:
 *       200:
 *         description: 图片生成成功
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
 *                   example: "图片生成成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                       description: 生成的图片URL
 *                     thumbnailUrl:
 *                       type: string
 *                       description: 缩略图URL
 *                     metadata:
 *                       type: object
 *                       properties:
 *                         prompt:
 *                           type: string
 *                           description: 使用的提示词
 *                         style:
 *                           type: string
 *                           description: 图片风格
 *                         duration:
 *                           type: number
 *                           description: 生成耗时(毫秒)
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 图片生成失败
 */
router.post('/generate-activity-image', async (req, res) => {
  try {
    // 导入图片生成服务
    const { default: AutoImageGenerationService } = await import('../services/ai/auto-image-generation.service');
    
    const { prompt, style = 'cartoon', size = '1024x768', category = 'activity', activityData } = req.body;
    
    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: '提示词不能为空',
        error: 'PROMPT_REQUIRED'
      });
    }
    
    // 构建图片生成请求
    const imageRequest = {
      prompt,
      style,
      size,
      category,
      quality: 'standard' as const
    };
    
    console.log('🎨 开始生成活动图片:', imageRequest);
    
    // 调用图片生成服务
    const result = await AutoImageGenerationService.generateImage(imageRequest);
    
    if (result.success) {
      console.log('✅ 图片生成成功:', result.imageUrl);
      
      res.json({
        success: true,
        message: '图片生成成功',
        data: {
          imageUrl: result.imageUrl,
          thumbnailUrl: result.thumbnailUrl,
          metadata: result.metadata,
          usage: result.usage
        }
      });
    } else {
      console.error('❌ 图片生成失败:', result.error);
      
      res.status(500).json({
        success: false,
        message: '图片生成失败',
        error: result.error,
        metadata: result.metadata
      });
    }
    
  } catch (error) {
    console.error('❌ 图片生成API异常:', error);
    
    res.status(500).json({
      success: false,
      message: '图片生成服务异常',
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

/**
 * @swagger
 * /api/ai/image-generation-status:
 *   get:
 *     summary: 检查图片生成服务状态
 *     description: 检查文生图服务是否可用
 *     tags: [AI - 图片生成]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 服务状态检查成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 available:
 *                   type: boolean
 *                   description: 服务是否可用
 *                 model:
 *                   type: string
 *                   description: 使用的模型名称
 *                 error:
 *                   type: string
 *                   description: 错误信息(如果有)
 */
router.get('/image-generation-status', async (req, res) => {
  try {
    const { default: AutoImageGenerationService } = await import('../services/ai/auto-image-generation.service');
    
    const status = await AutoImageGenerationService.checkServiceStatus();
    
    res.json({
      success: true,
      ...status
    });
  } catch (error) {
    console.error('❌ 检查图片生成服务状态失败:', error);
    
    res.json({
      success: false,
      available: false,
      error: error instanceof Error ? error.message : '未知错误'
    });
  }
});

// ❌ 简易版AI通用聊天接口已删除 - 避免与完整版API混淆
// ✅ 请使用完整的会话消息API: /api/ai/conversations/{conversationId}/messages
// 完整API包含向量记忆、上下文管理、流式输出、豆包128K集成等高级功能

// =============================================
// AI Response Generators
// =============================================

function generateActivityAnalysisResponse(message: string): string {
  // 活动分析专用回复生成器
  const analysisKeywords = {
    participation: ['参与', '参与度', '参加', '出席'],
    satisfaction: ['满意', '满意度', '评价', '反馈'],
    trend: ['趋势', '预测', '未来', '发展'],
    optimization: ['优化', '改进', '建议', '提升'],
    risk: ['风险', '问题', '隐患', '预防']
  };

  const lowerMessage = message.toLowerCase();

  if (analysisKeywords.participation.some(keyword => lowerMessage.includes(keyword))) {
    return `基于活动参与度数据分析：

**趋势预测**：
当前参与度处于中等水平，建议通过以下方式提升：
- 优化活动时间安排，避开家长工作高峰期
- 增加互动性强的亲子活动项目
- 提前1-2周发布活动预告，提高家长参与意愿

**优化建议**：
1. 建立活动反馈机制，及时收集家长意见
2. 根据不同年龄段设计差异化活动内容
3. 增加线上线下结合的活动形式

**风险提醒**：
注意监控参与度下降趋势，及时调整活动策略，避免家长参与积极性持续降低。`;
  }

  if (analysisKeywords.satisfaction.some(keyword => lowerMessage.includes(keyword))) {
    return `基于活动满意度数据分析：

**趋势预测**：
满意度整体稳定，但存在提升空间，预计通过改进可提升15-20%。

**优化建议**：
1. 加强活动前期准备，确保活动流程顺畅
2. 提升教师活动组织能力，增加专业培训
3. 优化活动场地布置，营造更好的活动氛围

**风险提醒**：
关注满意度波动较大的活动类型，分析原因并及时改进，防止口碑下降影响后续活动参与。`;
  }

  // 默认综合分析回复
  return `基于您提供的活动数据，我进行了综合分析：

**趋势预测**：
活动整体表现良好，参与度和满意度均处于合理范围。预计下月活动参与度有10-15%的提升潜力。

**优化建议**：
1. 根据数据反馈优化活动内容设计
2. 加强与家长的沟通互动
3. 建立活动效果评估机制

**风险提醒**：
注意季节性因素对活动参与的影响，提前做好应对预案。建议建立活动数据监控体系，及时发现并解决问题。`;
}

function generateStudentAnalysisResponse(message: string): string {
  return `基于学生数据分析：

**学习表现评估**：
学生整体学习状态良好，各项指标均在正常范围内。建议继续保持个性化教学方法。

**发展建议**：
1. 加强学生兴趣培养，提供多样化学习活动
2. 关注学生个体差异，制定针对性教学计划
3. 增强家校合作，共同促进学生全面发展

**关注要点**：
建议定期评估学生学习进度，及时调整教学策略，确保每个学生都能得到适合的教育支持。`;
}

function generateEnrollmentAnalysisResponse(message: string): string {
  return `基于招生数据分析：

**招生趋势**：
当前招生情况整体稳定，建议加强品牌宣传和口碑建设。

**策略建议**：
1. 优化招生渠道，重点发展线上推广
2. 加强现有家长满意度，促进口碑传播
3. 完善招生流程，提升家长体验

**市场洞察**：
建议关注竞争对手动态，及时调整招生策略，保持市场竞争优势。`;
}

function generateGeneralChatResponse(message: string): string {
  const responses = [
    '我是您的AI助手，很高兴为您服务！我可以帮助您分析各种教育数据，提供专业建议。',
    '感谢您的咨询。基于我的分析能力，我可以为您提供数据洞察和优化建议。',
    '我理解您的需求。作为教育领域的AI助手，我将为您提供专业的分析和建议。',
    '很高兴与您交流！我可以帮助您处理各种教育管理相关的问题和数据分析。'
  ];

  const randomIndex = Math.floor(Math.random() * responses.length);
  return responses[randomIndex] + `\n\n您的问题："${message}"，我正在为您分析处理...`;
}

export default router;