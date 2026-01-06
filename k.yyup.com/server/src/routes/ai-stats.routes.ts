/**
* @swagger
 * components:
 *   schemas:
 *     Ai-stat:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-stat ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-stat 名称
 *           example: "示例Ai-stat"
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
 *     CreateAi-statRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-stat 名称
 *           example: "新Ai-stat"
 *     UpdateAi-statRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-stat 名称
 *           example: "更新后的Ai-stat"
 *     Ai-statListResponse:
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
 *                 $ref: '#/components/schemas/Ai-stat'
 *         message:
 *           type: string
 *           example: "获取ai-stat列表成功"
 *     Ai-statResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-stat'
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
 * ai-stat管理路由文件
 * 提供ai-stat的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-stat列表
 * - 创建新ai-stat
 * - 获取ai-stat详情
 * - 更新ai-stat信息
 * - 删除ai-stat
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { aiStatsController } from '../controllers/ai-stats.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/ai-stats/overview:
 *   get:
 *     summary: 获取AI中心概览统计
 *     description: 获取AI中心的概览统计数据
 *     tags:
 *       - AI统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/overview', aiStatsController.getOverviewStats);

/**
* @swagger
 * /api/ai-stats/recent-tasks:
 *   get:
 *     summary: 获取最近的AI任务
 *     description: 获取最近执行的AI任务列表
 *     tags:
 *       - AI统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/recent-tasks', aiStatsController.getRecentTasks);

/**
* @swagger
 * /api/ai-stats/models:
 *   get:
 *     summary: 获取AI模型列表
 *     description: 获取系统中可用的AI模型列表
 *     tags:
 *       - AI统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/models', aiStatsController.getAIModels);

/**
* @swagger
 * /api/ai-stats/analysis-history:
 *   get:
 *     summary: 获取分析历史
 *     description: 获取AI分析的历史记录
 *     tags:
 *       - AI统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/analysis-history', aiStatsController.getAnalysisHistory);

export default router;
