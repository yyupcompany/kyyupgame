"use strict";
/**
 * 财务模块路由
 */
exports.__esModule = true;
var express_1 = require("express");
var finance_center_controller_1 = require("../controllers/centers/finance-center.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/finance/overview:
 *   get:
 *     summary: 获取财务概览数据
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 财务概览数据获取成功
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
 *                     monthlyRevenue:
 *                       type: number
 *                     revenueGrowth:
 *                       type: number
 *                     pendingAmount:
 *                       type: number
 *                     pendingCount:
 *                       type: number
 *                     collectionRate:
 *                       type: number
 *                     paidCount:
 *                       type: number
 *                     totalCount:
 *                       type: number
 *                     overdueAmount:
 *                       type: number
 *                     overdueCount:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/overview', auth_middleware_1.authenticate, finance_center_controller_1.FinanceCenterController.getOverview);
/**
 * @swagger
 * /api/finance/today-payments:
 *   get:
 *     summary: 获取今日缴费数据
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 今日缴费数据获取成功
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
 *                     todayAmount:
 *                       type: number
 *                     todayCount:
 *                       type: number
 *                     payments:
 *                       type: array
 *                       items:
 *                         type: object
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/today-payments', auth_middleware_1.authenticate, finance_center_controller_1.FinanceCenterController.getTodayPayments);
/**
 * @swagger
 * /api/finance/fee-package-templates:
 *   get:
 *     summary: 获取费用套餐模板列表
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 费用套餐模板列表获取成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/fee-package-templates', auth_middleware_1.authenticate, finance_center_controller_1.FinanceCenterController.getFeePackageTemplates);
/**
 * @swagger
 * /api/finance/fee-items:
 *   get:
 *     summary: 获取收费项目列表
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 收费项目列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       category:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       period:
 *                         type: string
 *                       isRequired:
 *                         type: boolean
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/fee-items', auth_middleware_1.authenticate, finance_center_controller_1.FinanceCenterController.getFeeItems);
/**
 * @swagger
 * /api/finance/payment-records:
 *   get:
 *     summary: 获取缴费记录列表
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 缴费记录列表获取成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/payment-records', auth_middleware_1.authenticate, finance_center_controller_1.FinanceCenterController.getPaymentRecords);
/**
 * @swagger
 * /api/finance/reports:
 *   get:
 *     summary: 获取财务报表数据
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 财务报表数据获取成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/reports', auth_middleware_1.authenticate, finance_center_controller_1.FinanceCenterController.getFinancialReports);
/**
 * @swagger
 * /api/finance/enrollment-finance:
 *   get:
 *     summary: 获取招生财务联动数据
 *     tags: [Finance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 招生财务联动数据获取成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/enrollment-finance', auth_middleware_1.authenticate, finance_center_controller_1.FinanceCenterController.getEnrollmentFinanceData);
exports["default"] = router;
