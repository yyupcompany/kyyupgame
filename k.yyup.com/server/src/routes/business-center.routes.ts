/**
* @swagger
 * components:
 *   schemas:
 *     Business-center:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Business-center ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Business-center 名称
 *           example: "示例Business-center"
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
 *     CreateBusiness-centerRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Business-center 名称
 *           example: "新Business-center"
 *     UpdateBusiness-centerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Business-center 名称
 *           example: "更新后的Business-center"
 *     Business-centerListResponse:
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
 *                 $ref: '#/components/schemas/Business-center'
 *         message:
 *           type: string
 *           example: "获取business-center列表成功"
 *     Business-centerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Business-center'
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
 * business-center管理路由文件
 * 提供business-center的基础CRUD操作
*
 * 功能包括：
 * - 获取business-center列表
 * - 创建新business-center
 * - 获取business-center详情
 * - 更新business-center信息
 * - 删除business-center
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { BusinessCenterController } from '../controllers/business-center.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

// 应用认证中间件
router.use(verifyToken);

/**
* @swagger
 * tags:
 *   name: 业务中心
 *   description: 业务中心管理API
*/

/**
* @swagger
 * /api/business-center/overview:
 *   get:
 *     summary: 获取业务中心概览数据
 *     description: 获取业务中心的综合概览数据，包括各个中心的统计信息
 *     tags: [业务中心]
 *     security:
 *       - bearerAuth: []
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
 *                     teachingCenter:
 *                       type: object
 *                     enrollment:
 *                       type: object
 *                     personnel:
 *                       type: object
 *                     activities:
 *                       type: object
 *                     system:
 *                       type: object
 *                 message:
 *                   type: string
*/
router.get('/overview',
  requireRole(['admin', 'principal', 'teacher']),
  BusinessCenterController.getOverview
);

/**
* @swagger
 * /api/business-center/timeline:
 *   get:
 *     summary: 获取业务流程时间线数据
 *     description: 获取业务流程的时间线数据，包括各个业务模块的进度和状态
 *     tags: [业务中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/timeline',
  requireRole(['admin', 'principal', 'teacher']),
  BusinessCenterController.getTimeline
);

/**
* @swagger
 * /api/business-center/enrollment-progress:
 *   get:
 *     summary: 获取招生进度数据
 *     description: 获取招生进度的详细数据，包括目标、当前进度和里程碑
 *     tags: [业务中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/enrollment-progress',
  requireRole(['admin', 'principal', 'teacher']),
  BusinessCenterController.getEnrollmentProgress
);

/**
* @swagger
 * /api/business-center/statistics:
 *   get:
 *     summary: 获取业务中心统计数据
 *     description: 获取业务中心的关键统计指标
 *     tags: [业务中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/statistics',
  requireRole(['admin', 'principal', 'teacher']),
  BusinessCenterController.getStatistics
);

/**
* @swagger
 * /api/business-center/dashboard:
 *   get:
 *     summary: 获取业务中心仪表板数据
 *     description: 获取业务中心仪表板的聚合数据，包括概览、时间线和招生进度
 *     tags: [业务中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/dashboard',
  requireRole(['admin', 'principal', 'teacher']),
  BusinessCenterController.getDashboard
);

/**
* @swagger
 * /api/business-center/teaching-integration:
 *   get:
 *     summary: 获取教学中心集成数据
 *     description: 获取教学中心的集成数据，用于业务中心展示
 *     tags: [业务中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/teaching-integration',
  requireRole(['admin', 'principal', 'teacher']),
  BusinessCenterController.getTeachingIntegration
);

/**
* @swagger
 * /api/business-center/ui-config:
 *   get:
 *     summary: 获取UI配置数据
 *     description: 获取UI配置数据，包括进度颜色阈值和里程碑配置
 *     tags: [业务中心]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/ui-config',
  requireRole(['admin', 'principal', 'teacher']),
  BusinessCenterController.getUIConfig
);

export default router;
