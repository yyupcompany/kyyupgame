/**
 * 统一AI路由
 * 通过统一租户中心提供AI服务
*/

import { Router } from 'express';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import UnifiedAIController from '../controllers/unified-ai.controller';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     AIModelConfig:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 模型ID
 *           example: "doubao-pro-128k"
 *         modelName:
 *           type: string
 *           description: 模型名称
 *           example: "豆包Pro-128K"
 *         provider:
 *           type: string
 *           description: 提供商
 *           example: "doubao"
 *         modelType:
 *           type: string
 *           enum: [text, image, speech, embedding, reasoning, search]
 *           description: 模型类型
 *         maxTokens:
 *           type: integer
 *           description: 最大令牌数
 *         temperature:
 *           type: number
 *           description: 温度参数
 *         isActive:
 *           type: boolean
 *           description: 是否激活
 *         capabilities:
 *           type: array
 *           items:
 *             type: string
 *           description: 能力列表
 *     AIRequestParams:
 *       type: object
 *       required:
 *         - modelId
 *       properties:
 *         modelId:
 *           type: string
 *           description: 模型ID
 *         messages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *               content:
 *                 type: string
 *         prompt:
 *           type: string
 *           description: 提示词
 *         maxTokens:
 *           type: integer
 *           description: 最大令牌数
 *         temperature:
 *           type: number
 *           description: 温度参数
 *         stream:
 *           type: boolean
 *           description: 是否流式输出
 *     AIUsageStats:
 *       type: object
 *       properties:
 *         totalRequests:
 *           type: integer
 *           description: 总请求数
 *         totalTokens:
 *           type: integer
 *           description: 总令牌数
 *         totalCost:
 *           type: number
 *           description: 总费用
 *         modelUsage:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               modelId:
 *                 type: string
 *               modelName:
 *                 type: string
 *               requests:
 *                 type: integer
 *               tokens:
 *                 type: integer
 *               cost:
 *                 type: number
 *         period:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *             end:
 *               type: string
*/

/**
* @swagger
 * /api/unified-ai/models:
 *   get:
 *     tags: [统一AI服务]
 *     summary: 获取可用AI模型列表
 *     description: 获取统一租户中心提供的可用AI模型列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activeOnly
 *         schema:
 *           type: boolean
 *           default: true
 *         description: 只返回激活的模型
 *     responses:
 *       200:
 *         description: 获取模型列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIModelConfig'
 *                 message:
 *                   type: string
 *                   example: "获取AI模型列表成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 获取可用AI模型列表
router.get('/models', UnifiedAIController.getAvailableModels);

/**
* @swagger
 * /api/unified-ai/models/{id}:
 *   get:
 *     tags: [统一AI服务]
 *     summary: 获取AI模型详情
 *     description: 根据ID获取指定AI模型的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 获取模型详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AIModelConfig'
 *                 message:
 *                   type: string
 *                   example: "获取AI模型详情成功"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 获取AI模型详情
router.get('/models/:id', UnifiedAIController.getModelById);

/**
* @swagger
 * /api/unified-ai/chat/completions:
 *   post:
 *     tags: [统一AI服务]
 *     summary: AI文本生成
 *     description: 使用统一租户中心的AI模型进行文本生成
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AIRequestParams'
 *     responses:
 *       200:
 *         description: 文本生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     content:
 *                       type: string
 *                     usage:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "AI文本生成成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// AI文本生成
router.post('/chat/completions', checkPermission('ai:use'), UnifiedAIController.generateText);

/**
* @swagger
 * /api/unified-ai/image/generate:
 *   post:
 *     tags: [统一AI服务]
 *     summary: AI图像生成
 *     description: 使用统一租户中心的AI模型进行图像生成
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
 *                 description: 图像描述
 *               modelId:
 *                 type: string
 *                 description: 模型ID
 *               size:
 *                 type: string
 *                 enum: [256x256, 512x512, 1024x1024, 1792x1024, 1024x1792]
 *                 default: 1024x1024
 *               quality:
 *                 type: string
 *                 enum: [standard, hd]
 *                 default: standard
 *     responses:
 *       200:
 *         description: 图像生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     imageUrl:
 *                       type: string
 *                     usage:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "AI图像生成成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// AI图像生成
router.post('/image/generate', checkPermission('ai:use'), UnifiedAIController.generateImage);

/**
* @swagger
 * /api/unified-ai/speech/synthesize:
 *   post:
 *     tags: [统一AI服务]
 *     summary: AI语音合成
 *     description: 使用统一租户中心的AI模型进行语音合成
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *             properties:
 *               text:
 *                 type: string
 *                 description: 要合成的文本
 *               modelId:
 *                 type: string
 *                 description: 模型ID
 *               voice:
 *                 type: string
 *                 enum: [alloy, echo, fable, onyx, nova, shimmer]
 *                 default: alloy
 *               speed:
 *                 type: number
 *                 minimum: 0.25
 *                 maximum: 4.0
 *                 default: 1.0
 *     responses:
 *       200:
 *         description: 语音合成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     audioUrl:
 *                       type: string
 *                     usage:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "AI语音合成成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// AI语音合成
router.post('/speech/synthesize', checkPermission('ai:use'), UnifiedAIController.synthesizeSpeech);

/**
* @swagger
 * /api/unified-ai/usage/stats:
 *   get:
 *     tags: [统一AI服务]
 *     summary: 获取AI使用统计
 *     description: 获取当前租户的AI使用统计数据
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 统计开始时间
 *       - in: query
 *         name: end
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 统计结束时间
 *     responses:
 *       200:
 *         description: 获取使用统计成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/AIUsageStats'
 *                 message:
 *                   type: string
 *                   example: "获取AI使用统计成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 获取AI使用统计
router.get('/usage/stats', checkPermission('AI_STATS_VIEW'), UnifiedAIController.getUsageStats);

/**
* @swagger
 * /api/unified-ai/health:
 *   get:
 *     tags: [统一AI服务]
 *     summary: AI服务健康检查
 *     description: 检查统一租户中心AI服务的健康状态
 *     responses:
 *       200:
 *         description: 健康检查成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [healthy, unhealthy]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     service:
 *                       type: string
 *                       example: "unified-tenant-ai"
 *                 message:
 *                   type: string
 *                   example: "AI服务健康检查完成"
*/
// AI服务健康检查
router.get('/health', UnifiedAIController.healthCheck);

/**
* @swagger
 * /api/unified-ai/models/batch:
 *   post:
 *     tags: [统一AI服务]
 *     summary: 批量获取模型信息
 *     description: 批量获取多个AI模型的详细信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - modelIds
 *             properties:
 *               modelIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 模型ID列表
 *     responses:
 *       200:
 *         description: 批量获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AIModelConfig'
 *                 message:
 *                   type: string
 *                   example: "批量获取模型信息成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 批量获取模型信息
router.post('/models/batch', checkPermission('ai:view'), UnifiedAIController.batchGetModels);

/**
* @swagger
 * /api/unified-ai/models/{id}/limits:
 *   get:
 *     tags: [统一AI服务]
 *     summary: 获取模型使用限制
 *     description: 获取指定AI模型的使用限制和当前使用情况
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 模型ID
 *     responses:
 *       200:
 *         description: 获取模型限制成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     maxRequestsPerMinute:
 *                       type: integer
 *                     maxTokensPerDay:
 *                       type: integer
 *                     currentUsage:
 *                       type: object
 *                       properties:
 *                         requests:
 *                           type: integer
 *                         tokens:
 *                           type: integer
 *                 message:
 *                   type: string
 *                   example: "获取模型使用限制成功"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 获取模型使用限制
router.get('/models/:id/limits', checkPermission('ai:view'), UnifiedAIController.getModelLimits);

/**
* @swagger
 * /api/unified-ai/marketing/copy:
 *   post:
 *     tags: [统一AI服务]
 *     summary: 新媒体中心文案生成
 *     description: 为新媒体中心生成营销文案
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - target
 *             properties:
 *               type:
 *                 type: string
 *                 description: 文案类型（如：招生简章、活动宣传、品牌推广）
 *               target:
 *                 type: string
 *                 description: 目标受众（如：3-6岁儿童家长、幼儿园老师、社区家庭）
 *               requirements:
 *                 type: string
 *                 description: 特殊要求
 *               modelId:
 *                 type: string
 *                 description: 指定使用的AI模型
 *     responses:
 *       200:
 *         description: 文案生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     copy:
 *                       type: string
 *                     type:
 *                       type: string
 *                     target:
 *                       type: string
 *                     requirements:
 *                       type: string
 *                     usage:
 *                       type: object
 *                 message:
 *                   type: string
 *                   example: "营销文案生成成功"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
// 新媒体中心文案生成
router.post('/marketing/copy', checkPermission('ai:use'), UnifiedAIController.generateMarketingCopy);

export default router;