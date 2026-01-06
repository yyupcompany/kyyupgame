"use strict";
exports.__esModule = true;
var express_1 = require("express");
var business_center_controller_1 = require("../controllers/business-center.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var role_middleware_1 = require("../middlewares/role.middleware");
var router = (0, express_1.Router)();
// 应用认证中间件
router.use(auth_middleware_1.authMiddleware);
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
router.get('/overview', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), business_center_controller_1.BusinessCenterController.getOverview);
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
router.get('/timeline', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), business_center_controller_1.BusinessCenterController.getTimeline);
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
router.get('/enrollment-progress', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), business_center_controller_1.BusinessCenterController.getEnrollmentProgress);
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
router.get('/statistics', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), business_center_controller_1.BusinessCenterController.getStatistics);
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
router.get('/dashboard', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), business_center_controller_1.BusinessCenterController.getDashboard);
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
router.get('/teaching-integration', (0, role_middleware_1.requireRole)(['admin', 'principal', 'teacher']), business_center_controller_1.BusinessCenterController.getTeachingIntegration);
exports["default"] = router;
