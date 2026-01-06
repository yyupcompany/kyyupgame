"use strict";
exports.__esModule = true;
var express_1 = require("express");
var marketing_center_controller_1 = require("../controllers/marketing-center.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var marketingCenterController = new marketing_center_controller_1.MarketingCenterController();
/**
 * @swagger
 * tags:
 *   name: MarketingCenter
 *   description: 营销中心API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     MarketingStatistics:
 *       type: object
 *       properties:
 *         activeCampaigns:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               description: 活跃营销活动数量
 *             change:
 *               type: string
 *               description: 变化百分比
 *         newCustomers:
 *           type: object
 *           properties:
 *             count:
 *               type: integer
 *               description: 本月新客户数量
 *             change:
 *               type: string
 *               description: 变化百分比
 *         conversionRate:
 *           type: object
 *           properties:
 *             rate:
 *               type: number
 *               description: 转化率
 *             change:
 *               type: string
 *               description: 变化百分比
 *         marketingROI:
 *           type: object
 *           properties:
 *             roi:
 *               type: number
 *               description: 营销ROI
 *             change:
 *               type: string
 *               description: 变化百分比
 *     MarketingCampaignSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 活动ID
 *         title:
 *           type: string
 *           description: 活动标题
 *         description:
 *           type: string
 *           description: 活动描述
 *         status:
 *           type: string
 *           description: 活动状态
 *         startDate:
 *           type: string
 *           format: date
 *           description: 开始日期
 *         participantCount:
 *           type: integer
 *           description: 参与人数
 *         conversionRate:
 *           type: number
 *           description: 转化率
 *     MarketingChannel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 渠道名称
 *         icon:
 *           type: string
 *           description: 渠道图标
 *         monthlyCustomers:
 *           type: integer
 *           description: 本月获客数
 *         conversionRate:
 *           type: number
 *           description: 转化率
 *         acquisitionCost:
 *           type: number
 *           description: 获客成本
 *         status:
 *           type: string
 *           description: 运行状态
 */
/**
 * @swagger
 * /api/marketing-center/statistics:
 *   get:
 *     summary: 获取营销中心统计数据
 *     tags: [MarketingCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取营销统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/MarketingStatistics'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/statistics', auth_middleware_1.verifyToken, marketingCenterController.getStatistics);
/**
 * @swagger
 * /api/marketing-center/campaigns/recent:
 *   get:
 *     summary: 获取最近的营销活动
 *     tags: [MarketingCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 3
 *         description: 返回的活动数量限制
 *     responses:
 *       200:
 *         description: 成功获取最近营销活动
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
 *                     $ref: '#/components/schemas/MarketingCampaignSummary'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/campaigns/recent', auth_middleware_1.verifyToken, marketingCenterController.getRecentCampaigns);
/**
 * @swagger
 * /api/marketing-center/channels:
 *   get:
 *     summary: 获取营销渠道概览
 *     tags: [MarketingCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取营销渠道数据
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
 *                     $ref: '#/components/schemas/MarketingChannel'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/channels', auth_middleware_1.verifyToken, marketingCenterController.getChannels);
exports["default"] = router;
