/**
* @swagger
 * components:
 *   schemas:
 *     Finance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Finance ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Finance 名称
 *           example: "示例Finance"
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
 *     CreateFinanceRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Finance 名称
 *           example: "新Finance"
 *     UpdateFinanceRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Finance 名称
 *           example: "更新后的Finance"
 *     FinanceListResponse:
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
 *                 $ref: '#/components/schemas/Finance'
 *         message:
 *           type: string
 *           example: "获取finance列表成功"
 *     FinanceResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Finance'
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
 * finance管理路由文件
 * 提供finance的基础CRUD操作
*
 * 功能包括：
 * - 获取finance列表
 * - 创建新finance
 * - 获取finance详情
 * - 更新finance信息
 * - 删除finance
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 财务模块路由
*/

import { Router } from 'express';
import { FinanceCenterController } from '../controllers/centers/finance-center.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

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
router.get('/overview', FinanceCenterController.getOverview);

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
router.get('/today-payments', FinanceCenterController.getTodayPayments);

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
router.get('/fee-package-templates', FinanceCenterController.getFeePackageTemplates);

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
router.get('/fee-items', FinanceCenterController.getFeeItems);

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
router.get('/payment-records', FinanceCenterController.getPaymentRecords);

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
router.get('/reports', FinanceCenterController.getFinancialReports);

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
router.get('/enrollment-finance', FinanceCenterController.getEnrollmentFinanceData);

export default router;
