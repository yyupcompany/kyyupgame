"use strict";
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var enrollment_statistics_controller_1 = require("../controllers/enrollment-statistics.controller");
var router = (0, express_1.Router)();
var enrollmentStatisticsController = new enrollment_statistics_controller_1.EnrollmentStatisticsController();
/**
 * @swagger
 * tags:
 *   name: EnrollmentStatistics
 *   description: 招生统计管理
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     EnrollmentStatistics:
 *       type: object
 *       properties:
 *         totalApplications:
 *           type: number
 *           description: 总申请数
 *         confirmedApplications:
 *           type: number
 *           description: 已确认申请数
 *         pendingApplications:
 *           type: number
 *           description: 待处理申请数
 *         conversionRate:
 *           type: number
 *           description: 转化率
 *         monthlyData:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 description: 月份
 *               applications:
 *                 type: number
 *                 description: 申请数量
 *
 *     TrendData:
 *       type: object
 *       properties:
 *         period:
 *           type: string
 *           description: 时间段
 *         enrollments:
 *           type: number
 *           description: 招生数量
 *         trend:
 *           type: string
 *           enum: [increasing, decreasing, stable]
 *           description: 趋势
 *
 *     ChannelAnalysis:
 *       type: object
 *       properties:
 *         channelName:
 *           type: string
 *           description: 渠道名称
 *         applicationCount:
 *           type: number
 *           description: 申请数量
 *         conversionRate:
 *           type: number
 *           description: 转化率
 *         cost:
 *           type: number
 *           description: 成本
 *         roi:
 *           type: number
 *           description: 投资回报率
 */
/**
 * @swagger
 * /api/enrollment-statistics:
 *   get:
 *     summary: 获取招生统计数据
 *     description: 获取总体招生统计信息，包括申请数量、确认数量和转化率
 *     tags: [EnrollmentStatistics]
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
 *       - in: query
 *         name: campusId
 *         schema:
 *           type: integer
 *         description: 校区ID
 *     responses:
 *       200:
 *         description: 招生统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentStatistics'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), enrollmentStatisticsController.getStatistics);
/**
 * @swagger
 * /api/enrollment-statistics/trend:
 *   get:
 *     summary: 获取招生趋势数据
 *     description: 获取指定时间段内的招生趋势分析数据
 *     tags: [EnrollmentStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *         description: 统计周期
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
 *         description: 招生趋势数据
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
 *                     $ref: '#/components/schemas/TrendData'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/trend', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), enrollmentStatisticsController.getTrend);
/**
 * @swagger
 * /api/enrollment-statistics/channel:
 *   get:
 *     summary: 获取渠道分析数据
 *     description: 获取各招生渠道的效果分析数据，包括转化率和成本效益
 *     tags: [EnrollmentStatistics]
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
 *       - in: query
 *         name: channelType
 *         schema:
 *           type: string
 *         description: 渠道类型
 *     responses:
 *       200:
 *         description: 渠道分析数据
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
 *                     $ref: '#/components/schemas/ChannelAnalysis'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/channel', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), enrollmentStatisticsController.getChannelAnalysis);
/**
 * @swagger
 * /api/enrollment-statistics/plans:
 *   get:
 *     summary: 获取招生计划统计数据
 *     description: 获取各招生计划的统计信息，包括目标数、实际完成数等
 *     tags: [EnrollmentStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: planId
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled]
 *         description: 计划状态
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 年份
 *     responses:
 *       200:
 *         description: 招生计划统计数据
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
 *                     type: object
 *                     properties:
 *                       planId:
 *                         type: integer
 *                         description: 计划ID
 *                       planName:
 *                         type: string
 *                         description: 计划名称
 *                       targetCount:
 *                         type: number
 *                         description: 目标数量
 *                       actualCount:
 *                         type: number
 *                         description: 实际数量
 *                       completionRate:
 *                         type: number
 *                         description: 完成率
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/plans', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), function (req, res) {
    enrollmentStatisticsController.getPlanStatistics(req, res);
});
/**
 * @swagger
 * /api/enrollment-statistics/channels:
 *   get:
 *     summary: 获取招生渠道统计数据
 *     description: 获取各招生渠道的详细统计信息
 *     tags: [EnrollmentStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: channelId
 *         schema:
 *           type: integer
 *         description: 渠道ID
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
 *         description: 招生渠道统计数据
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
 *                     $ref: '#/components/schemas/ChannelAnalysis'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/channels', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), function (req, res) {
    enrollmentStatisticsController.getChannelStatistics(req, res);
});
/**
 * @swagger
 * /api/enrollment-statistics/activities:
 *   get:
 *     summary: 获取招生活动统计数据
 *     description: 获取招生活动的效果统计数据
 *     tags: [EnrollmentStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: string
 *         description: 活动类型
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
 *         description: 招生活动统计数据
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
 *                     type: object
 *                     properties:
 *                       activityId:
 *                         type: integer
 *                         description: 活动ID
 *                       activityName:
 *                         type: string
 *                         description: 活动名称
 *                       participantCount:
 *                         type: number
 *                         description: 参与人数
 *                       conversionCount:
 *                         type: number
 *                         description: 转化人数
 *                       conversionRate:
 *                         type: number
 *                         description: 转化率
 *                       cost:
 *                         type: number
 *                         description: 活动成本
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/activities', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), function (req, res) {
    enrollmentStatisticsController.getActivityStatistics(req, res);
});
/**
 * @swagger
 * /api/enrollment-statistics/conversions:
 *   get:
 *     summary: 获取招生转化率统计数据
 *     description: 获取各阶段的招生转化率统计分析
 *     tags: [EnrollmentStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: funnel
 *         schema:
 *           type: string
 *           enum: [inquiry, visit, application, enrollment]
 *         description: 转化漏斗阶段
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
 *         description: 招生转化率统计数据
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
 *                     inquiryToVisit:
 *                       type: number
 *                       description: 咨询到到访转化率
 *                     visitToApplication:
 *                       type: number
 *                       description: 到访到申请转化率
 *                     applicationToEnrollment:
 *                       type: number
 *                       description: 申请到入学转化率
 *                     overallConversion:
 *                       type: number
 *                       description: 整体转化率
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/conversions', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), function (req, res) {
    enrollmentStatisticsController.getConversionStatistics(req, res);
});
/**
 * @swagger
 * /api/enrollment-statistics/performance:
 *   get:
 *     summary: 获取招生业绩统计数据
 *     description: 获取招生团队和个人的业绩统计数据
 *     tags: [EnrollmentStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: staffId
 *         schema:
 *           type: integer
 *         description: 招生员工ID
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: integer
 *         description: 部门ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [monthly, quarterly, yearly]
 *         description: 统计周期
 *     responses:
 *       200:
 *         description: 招生业绩统计数据
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
 *                     type: object
 *                     properties:
 *                       staffId:
 *                         type: integer
 *                         description: 员工ID
 *                       staffName:
 *                         type: string
 *                         description: 员工姓名
 *                       enrollmentCount:
 *                         type: number
 *                         description: 招生数量
 *                       target:
 *                         type: number
 *                         description: 目标数量
 *                       achievementRate:
 *                         type: number
 *                         description: 达成率
 *                       ranking:
 *                         type: integer
 *                         description: 排名
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/performance', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), function (req, res) {
    enrollmentStatisticsController.getPerformanceStatistics(req, res);
});
/**
 * @swagger
 * /api/enrollment-statistics/trends:
 *   get:
 *     summary: 获取招生趋势统计数据
 *     description: 获取长期招生趋势分析数据，包括预测数据
 *     tags: [EnrollmentStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: timespan
 *         schema:
 *           type: string
 *           enum: [6months, 1year, 2years, 3years]
 *         description: 时间跨度
 *       - in: query
 *         name: includeForecast
 *         schema:
 *           type: boolean
 *         description: 是否包含预测数据
 *       - in: query
 *         name: granularity
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *         description: 数据粒度
 *     responses:
 *       200:
 *         description: 招生趋势统计数据
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
 *                     historical:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TrendData'
 *                       description: 历史数据
 *                     forecast:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TrendData'
 *                       description: 预测数据
 *                     trendAnalysis:
 *                       type: object
 *                       properties:
 *                         direction:
 *                           type: string
 *                           enum: [upward, downward, stable]
 *                           description: 趋势方向
 *                         growthRate:
 *                           type: number
 *                           description: 增长率
 *                         seasonality:
 *                           type: boolean
 *                           description: 是否有季节性
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/trends', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_STATISTICS_MANAGE'), function (req, res) {
    enrollmentStatisticsController.getTrendStatistics(req, res);
});
exports["default"] = router;
