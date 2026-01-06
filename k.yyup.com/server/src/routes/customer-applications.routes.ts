/**
* @swagger
 * components:
 *   schemas:
 *     Customer-application:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Customer-application ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Customer-application 名称
 *           example: "示例Customer-application"
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
 *     CreateCustomer-applicationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Customer-application 名称
 *           example: "新Customer-application"
 *     UpdateCustomer-applicationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Customer-application 名称
 *           example: "更新后的Customer-application"
 *     Customer-applicationListResponse:
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
 *                 $ref: '#/components/schemas/Customer-application'
 *         message:
 *           type: string
 *           example: "获取customer-application列表成功"
 *     Customer-applicationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Customer-application'
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
 * customer-application管理路由文件
 * 提供customer-application的基础CRUD操作
*
 * 功能包括：
 * - 获取customer-application列表
 * - 创建新customer-application
 * - 获取customer-application详情
 * - 更新customer-application信息
 * - 删除customer-application
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import customerApplicationController from '../controllers/customer-application.controller';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   name: CustomerApplications
 *   description: 客户申请管理API
*/

/**
* @swagger
 * /api/teacher/customer-applications:
 *   post:
 *     summary: 教师申请客户（支持批量）
 *     tags: [CustomerApplications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerIds
 *             properties:
 *               customerIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 客户ID列表
 *                 example: [1, 2, 3]
 *               applyReason:
 *                 type: string
 *                 description: 申请理由
 *                 example: "这些客户是我之前在活动中接触过的"
 *     responses:
 *       200:
 *         description: 申请提交成功
 *       401:
 *         description: 未授权
*/
router.post('/teacher/customer-applications', customerApplicationController.applyForCustomers);

/**
* @swagger
 * /api/teacher/customer-applications:
 *   get:
 *     summary: 获取教师的申请记录
 *     tags: [CustomerApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 申请状态
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
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
*/
router.get('/teacher/customer-applications', customerApplicationController.getTeacherApplications);

/**
* @swagger
 * /api/principal/customer-applications:
 *   get:
 *     summary: 获取园长待审批的申请列表
 *     tags: [CustomerApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 申请状态
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *         description: 教师ID
 *       - in: query
 *         name: customerId
 *         schema:
 *           type: integer
 *         description: 客户ID
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
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
*/
router.get('/principal/customer-applications', customerApplicationController.getPrincipalApplications);

/**
* @swagger
 * /api/principal/customer-applications/{id}/review:
 *   post:
 *     summary: 园长审批申请
 *     tags: [CustomerApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - action
 *             properties:
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: 审批操作
 *                 example: "approve"
 *               rejectReason:
 *                 type: string
 *                 description: 拒绝理由（拒绝时必填）
 *                 example: "该客户已有其他教师跟进"
 *     responses:
 *       200:
 *         description: 审批成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
*/
router.post('/principal/customer-applications/:id/review', customerApplicationController.reviewApplication);

/**
* @swagger
 * /api/principal/customer-applications/batch-review:
 *   post:
 *     summary: 批量审批申请
 *     tags: [CustomerApplications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationIds
 *               - action
 *             properties:
 *               applicationIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 申请ID列表
 *                 example: [1, 2, 3]
 *               action:
 *                 type: string
 *                 enum: [approve, reject]
 *                 description: 审批操作
 *                 example: "approve"
 *               rejectReason:
 *                 type: string
 *                 description: 拒绝理由（批量拒绝时必填）
 *                 example: "批量拒绝原因"
 *     responses:
 *       200:
 *         description: 批量审批成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
*/
router.post('/principal/customer-applications/batch-review', customerApplicationController.batchReviewApplications);

/**
* @swagger
 * /api/customer-applications/stats:
 *   get:
 *     summary: 获取申请统计
 *     tags: [CustomerApplications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
*/
router.get('/stats', customerApplicationController.getApplicationStats);

/**
* @swagger
 * /api/customer-applications/{id}:
 *   get:
 *     summary: 获取申请详情
 *     tags: [CustomerApplications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 申请不存在
*/
router.get('/customer-applications/:id', customerApplicationController.getApplicationDetail);

export default router;

