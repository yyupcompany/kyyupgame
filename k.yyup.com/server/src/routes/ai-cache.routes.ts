/**
* @swagger
 * components:
 *   schemas:
 *     Ai-cache:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-cache ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-cache 名称
 *           example: "示例Ai-cache"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateAi-cacheRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-cache 名称
 *           example: "新Ai-cache"
 *     UpdateAi-cacheRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-cache 名称
 *           example: "更新后的Ai-cache"
 *     Ai-cacheListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Ai-cache'
 *         message:
 *           type: string
 *           example: "获取ai-cache列表成功"
 *     Ai-cacheResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-cache'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
 * ai-cache管理路由文件
 * 提供ai-cache的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-cache列表
 * - 创建新ai-cache
 * - 获取ai-cache详情
 * - 更新ai-cache信息
 * - 删除ai-cache
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * AI缓存管理路由
*/

import { Router } from 'express'
import * as aiCacheController from '../controllers/ai-cache.controller'
import { verifyToken } from '../middlewares/auth.middleware'

const router = Router()

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/ai-cache/stats:
 *   get:
 *     summary: 获取缓存统计信息
 *     tags: [AI缓存]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/stats', aiCacheController.getCacheStats)

/**
* @swagger
 * /api/ai-cache/health:
 *   get:
 *     summary: 检查Redis连接状态
 *     tags: [AI缓存]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/health', aiCacheController.checkHealth)

/**
* @swagger
 * /api/ai-cache/tool/{toolName}:
 *   delete:
 *     summary: 清除指定工具的缓存
 *     tags: [AI缓存]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: toolName
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功
*/
router.delete('/tool/:toolName', aiCacheController.clearToolCache)

/**
* @swagger
 * /api/ai-cache/all:
 *   delete:
 *     summary: 清除所有缓存
 *     tags: [AI缓存]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
*/
router.delete('/all', aiCacheController.clearAllCache)

/**
* @swagger
 * /api/ai-cache/reset-stats:
 *   post:
 *     summary: 重置统计信息
 *     tags: [AI缓存]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
*/
router.post('/reset-stats', aiCacheController.resetStats)

/**
* @swagger
 * /api/ai-cache/warmup:
 *   post:
 *     summary: 预热缓存
 *     tags: [AI缓存]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tools:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     args:
 *                       type: object
 *                     intent:
 *                       type: string
 *     responses:
 *       200:
 *         description: 成功
*/
router.post('/warmup', aiCacheController.warmupCache)

export default router

