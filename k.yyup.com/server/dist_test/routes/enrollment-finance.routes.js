"use strict";
/**
 * 招生财务联动路由
 */
exports.__esModule = true;
var express_1 = require("express");
var enrollment_finance_controller_1 = require("../controllers/enrollment-finance.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 测试路由 - 不需要认证
router.get('/test', function (req, res) {
    res.json({
        success: true,
        message: '招生财务联动API正常工作',
        timestamp: new Date().toISOString()
    });
});
// 所有其他路由都需要认证
router.use(auth_middleware_1.authenticate);
/**
 * @swagger
 * /api/enrollment-finance/linkages:
 *   get:
 *     summary: 获取招生财务关联列表
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 财务状态筛选
 *       - in: query
 *         name: className
 *         schema:
 *           type: string
 *         description: 班级名称筛选
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/linkages', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.getLinkages);
/**
 * @swagger
 * /api/enrollment-finance/stats:
 *   get:
 *     summary: 获取招生财务统计数据
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.getStatistics);
/**
 * @swagger
 * /api/enrollment-finance/statistics:
 *   get:
 *     summary: 获取招生财务统计数据 (兼容旧路径)
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/statistics', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.getStatistics);
/**
 * @swagger
 * /api/enrollment-finance/fee-package-templates:
 *   get:
 *     summary: 获取费用套餐模板列表
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/fee-package-templates', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.getFeeTemplates);
/**
 * @swagger
 * /api/enrollment-finance/fee-templates:
 *   get:
 *     summary: 获取费用套餐模板列表 (兼容旧路径)
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/fee-templates', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.getFeeTemplates);
/**
 * @swagger
 * /api/enrollment-finance/process/{id}:
 *   get:
 *     summary: 获取招生流程详情
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 招生申请ID
 */
router.get('/process/:id', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.getEnrollmentProcess);
/**
 * @swagger
 * /api/enrollment-finance/confirm-payment:
 *   post:
 *     summary: 确认收款 (园长角色)
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enrollmentId:
 *                 type: string
 *               amount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *               notes:
 *                 type: string
 */
router.post('/confirm-payment', (0, auth_middleware_1.checkRole)(['principal', 'admin']), enrollment_finance_controller_1.EnrollmentFinanceController.confirmPayment);
/**
 * @swagger
 * /api/enrollment-finance/send-payment-reminder:
 *   post:
 *     summary: 发送缴费提醒
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enrollmentIds:
 *                 type: array
 *                 items:
 *                   type: string
 */
router.post('/send-payment-reminder', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.sendPaymentReminder);
/**
 * @swagger
 * /api/enrollment-finance/generate-bill:
 *   post:
 *     summary: 生成缴费单
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/generate-bill', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.generatePaymentBill);
/**
 * @swagger
 * /api/enrollment-finance/batch-generate-bills:
 *   post:
 *     summary: 批量生成缴费单
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 */
router.post('/batch-generate-bills', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.batchGeneratePaymentBills);
/**
 * @swagger
 * /api/enrollment-finance/config:
 *   get:
 *     summary: 获取招生财务配置
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
 */
router.get('/config', (0, auth_middleware_1.checkPermission)('FINANCE_ENROLLMENT_LINKAGE_VIEW'), enrollment_finance_controller_1.EnrollmentFinanceController.getConfig);
exports["default"] = router;
