"use strict";
exports.__esModule = true;
var express_1 = require("express");
var marketing_controller_1 = require("../controllers/marketing.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var controller = new marketing_controller_1.MarketingController();
/**
 * @swagger
 * components:
 *   schemas:
 *     Channel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 渠道ID
 *         channelName:
 *           type: string
 *           description: 渠道名称
 *         channelType:
 *           type: string
 *           description: 渠道类型
 *         utmSource:
 *           type: string
 *           description: UTM来源
 *         visitCount:
 *           type: integer
 *           description: 访问量
 *         leadCount:
 *           type: integer
 *           description: 线索数
 *         conversionCount:
 *           type: integer
 *           description: 转化数
 *         conversionRate:
 *           type: number
 *           description: 转化率
 *         cost:
 *           type: number
 *           description: 成本
 *         revenue:
 *           type: number
 *           description: 收入
 *         roi:
 *           type: number
 *           description: ROI
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *     ReferralStats:
 *       type: object
 *       properties:
 *         newCount:
 *           type: integer
 *           description: 新增推荐数
 *         completedCount:
 *           type: integer
 *           description: 完成推荐数
 *         convRate:
 *           type: number
 *           description: 转化率
 *         topReferrers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               referrerId:
 *                 type: integer
 *               count:
 *                 type: integer
 *     ConversionStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             lead:
 *               type: integer
 *             visit:
 *               type: integer
 *             aware:
 *               type: integer
 *             preEnroll:
 *               type: integer
 *             enroll:
 *               type: integer
 *         series:
 *           type: array
 *           items:
 *             type: object
 *         ranking:
 *           type: array
 *           items:
 *             type: object
 *     FunnelStats:
 *       type: object
 *       properties:
 *         stages:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *               name:
 *                 type: string
 *               count:
 *                 type: integer
 *         rates:
 *           type: object
 *           properties:
 *             lead_to_visit:
 *               type: number
 *             visit_to_aware:
 *               type: number
 *             aware_to_pre_enroll:
 *               type: number
 *             pre_enroll_to_paid:
 *               type: number
 *             overall:
 *               type: number
 */
// 统一加鉴权（可根据需要细分权限）
router.use(auth_middleware_1.verifyToken);
/**
 * @swagger
 * /marketing/channels:
 *   get:
 *     tags: [营销中心-渠道]
 *     summary: 获取渠道列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: 标签筛选
 *     responses:
 *       200:
 *         description: 获取渠道列表成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         items:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Channel'
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         pageSize:
 *                           type: integer
 *   post:
 *     tags: [营销中心-渠道]
 *     summary: 创建渠道
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channelName:
 *                 type: string
 *               channelType:
 *                 type: string
 *               utmSource:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建渠道成功
 */
// 渠道
router.get('/channels', controller.getChannels.bind(controller));
router.get('/channels/tags', controller.getAllChannelTags.bind(controller)); // 获取所有可用标签
router.post('/channels', (0, auth_middleware_1.checkPermission)('MARKETING_CHANNELS_MANAGE'), controller.createChannel.bind(controller));
router.put('/channels/:id', (0, auth_middleware_1.checkPermission)('MARKETING_CHANNELS_MANAGE'), controller.updateChannel.bind(controller));
router["delete"]('/channels/:id', (0, auth_middleware_1.checkPermission)('MARKETING_CHANNELS_MANAGE'), controller.deleteChannel.bind(controller));
router.get('/channels/:id/contacts', controller.getChannelContacts.bind(controller));
router.post('/channels/:id/contacts', (0, auth_middleware_1.checkPermission)('MARKETING_CHANNELS_MANAGE'), controller.addChannelContact.bind(controller));
router["delete"]('/channels/:id/contacts/:contactId', (0, auth_middleware_1.checkPermission)('MARKETING_CHANNELS_MANAGE'), controller.deleteChannelContact.bind(controller));
router.get('/channels/:id/tags', controller.getChannelTags.bind(controller));
router.post('/channels/:id/tags', (0, auth_middleware_1.checkPermission)('MARKETING_CHANNELS_MANAGE'), controller.addChannelTags.bind(controller));
router["delete"]('/channels/:id/tags/:tagId', (0, auth_middleware_1.checkPermission)('MARKETING_CHANNELS_MANAGE'), controller.deleteChannelTag.bind(controller));
router.get('/channels/:id/metrics', controller.getChannelMetrics.bind(controller));
/**
 * @swagger
 * /marketing/referrals:
 *   get:
 *     tags: [营销中心-老带新]
 *     summary: 获取老带新列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *     responses:
 *       200:
 *         description: 获取老带新列表成功
 *
 * /marketing/referrals/stats:
 *   get:
 *     tags: [营销中心-老带新]
 *     summary: 获取老带新统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取老带新统计成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ReferralStats'
 *
 * /marketing/stats/conversions:
 *   get:
 *     tags: [营销中心-转换统计]
 *     summary: 获取转换统计
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: dimension
 *         schema:
 *           type: string
 *           enum: [channel, campaign, month]
 *           default: channel
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *     responses:
 *       200:
 *         description: 获取转换统计成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/ConversionStats'
 *
 * /marketing/stats/funnel:
 *   get:
 *     tags: [营销中心-销售漏斗]
 *     summary: 获取销售漏斗统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取销售漏斗统计成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FunnelStats'
 */
// 老带新
router.get('/referrals', controller.getReferrals.bind(controller));
router.get('/referrals/stats', controller.getReferralStats.bind(controller));
router.get('/referrals/graph', controller.getReferralGraph.bind(controller));
router.get('/referrals/my-codes', controller.getMyReferralCodes.bind(controller));
// 推广码生成
router.post('/referrals/generate', controller.generateReferralCode.bind(controller));
router.get('/referrals/poster-templates', controller.getPosterTemplates.bind(controller));
router.post('/referrals/generate-poster', controller.generateReferralPoster.bind(controller));
router.get('/referrals/:code/stats', controller.getReferralCodeStats.bind(controller));
router.post('/referrals/:code/track', controller.trackReferralClick.bind(controller));
// 统计
router.get('/stats/conversions', controller.getConversionStats.bind(controller));
router.get('/stats/funnel', controller.getFunnelStats.bind(controller));
exports["default"] = router;
