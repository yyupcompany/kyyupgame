"use strict";
/**
 * 活动中心聚合API路由
 */
exports.__esModule = true;
var express_1 = require("express");
var activity_center_controller_1 = require("../../controllers/centers/activity-center.controller");
var auth_middleware_1 = require("../../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/centers/activity/timeline:
 *   get:
 *     summary: 获取活动中心Timeline数据
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Timeline数据获取成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/timeline', auth_middleware_1.authenticate, activity_center_controller_1.ActivityCenterController.getTimeline);
/**
 * @swagger
 * /api/centers/activity/dashboard:
 *   get:
 *     summary: 获取活动中心仪表板聚合数据
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 活动中心仪表板数据获取成功
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
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalActivities:
 *                           type: number
 *                         ongoingActivities:
 *                           type: number
 *                         totalRegistrations:
 *                           type: number
 *                         averageRating:
 *                           type: number
 *                     activityTemplates:
 *                       type: array
 *                       items:
 *                         type: object
 *                     recentRegistrations:
 *                       type: object
 *                       properties:
 *                         list:
 *                           type: array
 *                         total:
 *                           type: number
 *                     activityPlans:
 *                       type: array
 *                       items:
 *                         type: object
 *                     posterTemplates:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                     meta:
 *                       type: object
 *                       properties:
 *                         responseTime:
 *                           type: number
 *                         dataCount:
 *                           type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/dashboard', auth_middleware_1.authenticate, activity_center_controller_1.ActivityCenterController.getDashboard);
/**
 * @swagger
 * /api/centers/activity/cache/stats:
 *   get:
 *     summary: 获取活动中心缓存统计
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/cache/stats', auth_middleware_1.authenticate, activity_center_controller_1.ActivityCenterController.getCacheStats);
/**
 * @swagger
 * /api/centers/activity/cache/clear:
 *   post:
 *     summary: 清除活动中心缓存
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clearAll
 *         schema:
 *           type: boolean
 *         description: 是否清除所有缓存
 *     responses:
 *       200:
 *         description: 清除成功
 */
router.post('/cache/clear', auth_middleware_1.authenticate, activity_center_controller_1.ActivityCenterController.clearCache);
exports["default"] = router;
