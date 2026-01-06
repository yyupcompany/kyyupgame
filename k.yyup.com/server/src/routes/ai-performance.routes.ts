import { Router } from 'express';
import { AIPerformanceMonitorController } from '../controllers/ai/ai-performance-monitor.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

/**
* @swagger
 * components:
 *   schemas:
 *     Ai-performance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-performance ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-performance 名称
 *           example: "示例Ai-performance"
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
 *     CreateAi-performanceRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-performance 名称
 *           example: "新Ai-performance"
 *     UpdateAi-performanceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-performance 名称
 *           example: "更新后的Ai-performance"
 *     Ai-performanceListResponse:
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
 *                 $ref: '#/components/schemas/Ai-performance'
 *         message:
 *           type: string
 *           example: "获取ai-performance列表成功"
 *     Ai-performanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-performance'
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
 * ai-performance管理路由文件
 * 提供ai-performance的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-performance列表
 * - 创建新ai-performance
 * - 获取ai-performance详情
 * - 更新ai-performance信息
 * - 删除ai-performance
*
 * 权限要求：需要有效的JWT Token认证
*/

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const aiPerformanceController = new AIPerformanceMonitorController();

/**
* @swagger
 * tags:
 *   name: AI Performance Monitor
 *   description: AI性能监控相关接口
*/

/**
* @swagger
 * /api/ai/performance/system-status:
 *   get:
 *     summary: 获取系统状态概览
 *     tags: [AI Performance Monitor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取系统状态成功
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
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [normal, warning, critical]
 *                     message:
 *                       type: string
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         cpu:
 *                           type: object
 *                           properties:
 *                             usage:
 *                               type: number
 *                             cores:
 *                               type: number
 *                         memory:
 *                           type: object
 *                           properties:
 *                             usage:
 *                               type: number
 *                             total:
 *                               type: number
 *                             used:
 *                               type: number
 *                         gpu:
 *                           type: object
 *                           properties:
 *                             usage:
 *                               type: number
 *                             model:
 *                               type: string
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
*/
router.get('/system-status', checkPermission('ai-performance-monitor'), 
  aiPerformanceController.getSystemStatus
);

/**
* @swagger
 * /api/ai/performance/models:
 *   get:
 *     summary: 获取AI模型性能数据
 *     tags: [AI Performance Monitor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d, 30d]
 *           default: 24h
 *         description: 时间范围
 *     responses:
 *       200:
 *         description: 获取AI模型性能数据成功
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
 *                   type: object
 *                   properties:
 *                     models:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           version:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [running, training, stopped, error]
 *                           metrics:
 *                             type: object
 *                             properties:
 *                               responseTime:
 *                                 type: number
 *                               accuracy:
 *                                 type: number
 *                               requestsPerMinute:
 *                                 type: number
 *                               errorRate:
 *                                 type: number
 *                     totalModels:
 *                       type: number
 *                     activeModels:
 *                       type: number
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
*/
router.get('/models', checkPermission('ai-performance-monitor'), 
  aiPerformanceController.getAIModelsPerformance
);

/**
* @swagger
 * /api/ai/performance/logs:
 *   get:
 *     summary: 获取性能日志
 *     tags: [AI Performance Monitor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [all, INFO, WARNING, ERROR, DEBUG]
 *           default: all
 *         description: 日志级别过滤
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 返回数量限制
 *     responses:
 *       200:
 *         description: 获取性能日志成功
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
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           timestamp:
 *                             type: string
 *                             format: date-time
 *                           level:
 *                             type: string
 *                           service:
 *                             type: string
 *                           message:
 *                             type: string
 *                     total:
 *                       type: number
 *                     filters:
 *                       type: object
 *                     lastUpdated:
 *                       type: string
 *                       format: date-time
*/
router.get('/logs', checkPermission('ai-performance-monitor'), 
  aiPerformanceController.getPerformanceLogs
);

/**
* @swagger
 * /api/ai/performance/alerts:
 *   get:
 *     summary: 获取性能警报
 *     tags: [AI Performance Monitor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: string
 *           enum: [all, true, false]
 *           default: false
 *         description: 是否已解决
 *     responses:
 *       200:
 *         description: 获取性能警报成功
*/
router.get('/alerts', checkPermission('ai-performance-monitor'), 
  aiPerformanceController.getPerformanceAlerts
);

/**
* @swagger
 * /api/ai/performance/refresh:
 *   post:
 *     summary: 刷新性能数据
 *     tags: [AI Performance Monitor]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 刷新性能数据成功
*/
router.post('/refresh', checkPermission('ai-performance-monitor'), 
  aiPerformanceController.refreshPerformanceData
);

/**
* @swagger
 * /api/ai/performance/export:
 *   get:
 *     summary: 导出性能报告
 *     tags: [AI Performance Monitor]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv, pdf]
 *           default: json
 *         description: 导出格式
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [1h, 6h, 24h, 7d, 30d]
 *           default: 24h
 *         description: 时间范围
 *     responses:
 *       200:
 *         description: 导出性能报告成功
*/
router.get('/export', checkPermission('ai-performance-monitor'), 
  aiPerformanceController.exportPerformanceReport
);

export default router;
