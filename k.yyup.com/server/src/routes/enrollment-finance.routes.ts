/**
* @swagger
 * components:
 *   schemas:
 *     Enrollment-finance:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Enrollment-finance ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Enrollment-finance 名称
 *           example: "示例Enrollment-finance"
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
 *     CreateEnrollment-financeRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Enrollment-finance 名称
 *           example: "新Enrollment-finance"
 *     UpdateEnrollment-financeRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Enrollment-finance 名称
 *           example: "更新后的Enrollment-finance"
 *     Enrollment-financeListResponse:
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
 *                 $ref: '#/components/schemas/Enrollment-finance'
 *         message:
 *           type: string
 *           example: "获取enrollment-finance列表成功"
 *     Enrollment-financeResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Enrollment-finance'
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
 * enrollment-finance管理路由文件
 * 提供enrollment-finance的基础CRUD操作
*
 * 功能包括：
 * - 获取enrollment-finance列表
 * - 创建新enrollment-finance
 * - 获取enrollment-finance详情
 * - 更新enrollment-finance信息
 * - 删除enrollment-finance
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 招生财务联动路由
*/

import { Router } from 'express';
import { EnrollmentFinanceController } from '../controllers/enrollment-finance.controller';
import { verifyToken, checkRole, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 测试路由 - 不需要认证
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: '招生财务联动API正常工作',
    timestamp: new Date().toISOString()
  });
});

// 所有其他路由都需要认证
router.use(verifyToken);

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
router.get('/linkages', 
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'), 
  EnrollmentFinanceController.getLinkages
);

/**
* @swagger
 * /api/enrollment-finance/stats:
 *   get:
 *     summary: 获取招生财务统计数据
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
*/
router.get('/stats',
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'),
  EnrollmentFinanceController.getStatistics
);

/**
* @swagger
 * /api/enrollment-finance/statistics:
 *   get:
 *     summary: 获取招生财务统计数据 (兼容旧路径)
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
*/
router.get('/statistics',
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'),
  EnrollmentFinanceController.getStatistics
);

/**
* @swagger
 * /api/enrollment-finance/fee-package-templates:
 *   get:
 *     summary: 获取费用套餐模板列表
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
*/
router.get('/fee-package-templates',
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'),
  EnrollmentFinanceController.getFeeTemplates
);

/**
* @swagger
 * /api/enrollment-finance/fee-templates:
 *   get:
 *     summary: 获取费用套餐模板列表 (兼容旧路径)
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
*/
router.get('/fee-templates',
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'),
  EnrollmentFinanceController.getFeeTemplates
);

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
router.get('/process/:id', 
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'), 
  EnrollmentFinanceController.getEnrollmentProcess
);

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
router.post('/confirm-payment', 
  checkRole(['principal', 'admin']), 
  EnrollmentFinanceController.confirmPayment
);

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
router.post('/send-payment-reminder', 
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'), 
  EnrollmentFinanceController.sendPaymentReminder
);

/**
* @swagger
 * /api/enrollment-finance/generate-bill:
 *   post:
 *     summary: 生成缴费单
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
*/
router.post('/generate-bill', 
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'), 
  EnrollmentFinanceController.generatePaymentBill
);

/**
* @swagger
 * /api/enrollment-finance/batch-generate-bills:
 *   post:
 *     summary: 批量生成缴费单
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
*/
router.post('/batch-generate-bills', 
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'), 
  EnrollmentFinanceController.batchGeneratePaymentBills
);

/**
* @swagger
 * /api/enrollment-finance/config:
 *   get:
 *     summary: 获取招生财务配置
 *     tags: [EnrollmentFinance]
 *     security:
 *       - bearerAuth: []
*/
router.get('/config', 
  checkPermission('FINANCE_ENROLLMENT_LINKAGE_VIEW'), 
  EnrollmentFinanceController.getConfig
);

export default router;
