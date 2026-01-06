"use strict";
/**
 * 客户池中心聚合API路由
 */
exports.__esModule = true;
var express_1 = require("express");
var customer_pool_center_controller_1 = require("../../controllers/centers/customer-pool-center.controller");
var auth_middleware_1 = require("../../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/centers/customer-pool/dashboard:
 *   get:
 *     summary: 获取客户池中心仪表板聚合数据
 *     tags: [Centers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 客户池中心仪表板数据获取成功
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
 *                     poolStatistics:
 *                       type: object
 *                       properties:
 *                         totalCustomers:
 *                           type: number
 *                         activeCustomers:
 *                           type: number
 *                         potentialCustomers:
 *                           type: number
 *                         convertedCustomers:
 *                           type: number
 *                         conversionRate:
 *                           type: number
 *                     customerPools:
 *                       type: object
 *                       properties:
 *                         data:
 *                           type: array
 *                         pagination:
 *                           type: object
 *                     recentCustomers:
 *                       type: array
 *                       items:
 *                         type: object
 *                     conversionAnalysis:
 *                       type: array
 *                       items:
 *                         type: object
 *                     channelAnalysis:
 *                       type: array
 *                       items:
 *                         type: object
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
router.get('/dashboard', auth_middleware_1.authenticate, customer_pool_center_controller_1.CustomerPoolCenterController.getDashboard);
exports["default"] = router;
