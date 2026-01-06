import { Router } from 'express';
import { SimplifiedCentersController } from '../controllers/simplified-centers.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   name: 集合API
 *   description: 中心页面聚合数据API，用于性能优化
*/

/**
* @swagger
 * /api/centers/system/overview:
 *   get:
 *     summary: 获取系统中心总览数据
 *     tags: [集合API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取系统中心数据
*/
router.get('/system/overview', SimplifiedCentersController.getSystemOverview);

/**
* @swagger
 * /api/centers/activity/overview:
 *   get:
 *     summary: 获取活动中心总览数据
 *     tags: [集合API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取活动中心数据
*/
router.get('/activity/overview', SimplifiedCentersController.getActivityOverview);

/**
* @swagger
 * /api/centers/teacher/overview:
 *   get:
 *     summary: 获取教师中心总览数据
 *     tags: [集合API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取教师中心数据
*/
router.get('/teacher/overview', SimplifiedCentersController.getTeacherOverview);

/**
* @swagger
 * /api/centers/analytics/overview:
 *   get:
 *     summary: 获取分析中心总览数据
 *     tags: [集合API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取分析中心数据
*/
router.get('/analytics/overview', SimplifiedCentersController.getAnalyticsOverview);

/**
* @swagger
 * /api/centers/media/overview:
 *   get:
 *     summary: 获取媒体中心总览数据
 *     tags: [集合API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取媒体中心数据
*/
router.get('/media/overview', SimplifiedCentersController.getMediaOverview);

/**
* @swagger
 * /api/centers/inspection/overview:
 *   get:
 *     summary: 获取检查中心总览数据
 *     tags: [集合API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取检查中心数据
*/
router.get('/inspection/overview', SimplifiedCentersController.getInspectionOverview);

/**
* @swagger
 * /api/centers/dashboard/overview:
 *   get:
 *     summary: 获取工作台总览数据
 *     tags: [集合API]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取工作台数据
*/
router.get('/dashboard/overview', SimplifiedCentersController.getDashboardOverview);

/**
 * 客户池中心路由导入
 */
import centersRoutes from './centers/index';

/**
 * 挂载centers子路由
 */
router.use('/', centersRoutes);

export default router;
