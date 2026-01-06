"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var analytics_controller_1 = __importDefault(require("../../controllers/ai/analytics.controller"));
var auth_middleware_1 = require("../../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_middleware_1.verifyToken);
/**
 * @swagger
 * /api/v1/ai/analytics/overview:
 *   get:
 *     summary: 获取使用概览
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: AI使用概览数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnalyticsOverview'
 */
router.get('/overview', analytics_controller_1["default"].getUsageOverview);
/**
 * @swagger
 * /api/v1/ai/analytics/models/distribution:
 *   get:
 *     summary: 获取模型使用分布
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 模型使用分布数据
 */
router.get('/models/distribution', analytics_controller_1["default"].getModelUsageDistribution);
/**
 * @swagger
 * /api/v1/ai/analytics/activity/trend:
 *   get:
 *     summary: 获取用户活跃度趋势
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *         description: 时间范围
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *         description: 限制数量
 *     responses:
 *       200:
 *         description: 用户活跃度趋势数据
 */
router.get('/activity/trend', analytics_controller_1["default"].getUserActivityTrend);
/**
 * @swagger
 * /api/v1/ai/analytics/user/{userId}:
 *   get:
 *     summary: 获取特定用户分析
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 用户分析数据
 */
router.get('/user/:userId', analytics_controller_1["default"].getUserAnalytics);
/**
 * @swagger
 * /api/v1/ai/analytics/content:
 *   get:
 *     summary: 获取内容分析
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 内容分析数据
 */
router.get('/content', analytics_controller_1["default"].getContentAnalytics);
/**
 * @swagger
 * /api/v1/ai/analytics/report:
 *   post:
 *     summary: 生成分析报表
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: 开始日期
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: 结束日期
 *               includeUserDetails:
 *                 type: boolean
 *                 description: 是否包含用户详情
 *               selectedMetrics:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 选定的指标
 *     responses:
 *       200:
 *         description: 分析报表生成成功
 */
router.post('/report', analytics_controller_1["default"].generateAnalyticsReport);
/**
 * @swagger
 * /api/v1/ai/analytics/dashboard:
 *   get:
 *     summary: 获取仪表板数据
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *         description: 时间范围
 *     responses:
 *       200:
 *         description: 仪表板数据
 */
router.get('/dashboard', analytics_controller_1["default"].getDashboardData);
/**
 * @swagger
 * /api/v1/ai/analytics/predictive-analytics:
 *   get:
 *     summary: 获取AI预测分析数据
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [enrollment, revenue, churn, satisfaction]
 *         description: 预测类型
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *         description: 预测时间范围
 *     responses:
 *       200:
 *         description: 预测分析数据
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
 *                   example: "获取预测分析数据成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     predictions:
 *                       type: object
 *                       properties:
 *                         enrollment:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                             accuracy:
 *                               type: number
 *                             trend:
 *                               type: string
 *                         revenue:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                             accuracy:
 *                               type: number
 *                             trend:
 *                               type: string
 *                         churn:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                             accuracy:
 *                               type: number
 *                             trend:
 *                               type: string
 *                         satisfaction:
 *                           type: object
 *                           properties:
 *                             value:
 *                               type: number
 *                             accuracy:
 *                               type: number
 *                             trend:
 *                               type: string
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           confidence:
 *                             type: number
 *                           impact:
 *                             type: string
 *                           type:
 *                             type: string
 */
router.get('/predictive-analytics', analytics_controller_1["default"].getPredictiveAnalytics);
/**
 * @swagger
 * /api/v1/ai/analytics/predictive-analytics/refresh:
 *   post:
 *     summary: 刷新预测分析数据
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 刷新成功
 */
router.post('/predictive-analytics/refresh', analytics_controller_1["default"].refreshPredictiveAnalytics);
/**
 * @swagger
 * /api/v1/ai/analytics/predictive-analytics/export:
 *   post:
 *     summary: 导出预测分析报告
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [json, excel, pdf]
 *                 description: 导出格式
 *               includeCharts:
 *                 type: boolean
 *                 description: 是否包含图表
 *     responses:
 *       200:
 *         description: 导出成功
 */
router.post('/predictive-analytics/export', analytics_controller_1["default"].exportPredictiveReport);
exports["default"] = router;
