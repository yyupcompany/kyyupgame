"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var customer_application_controller_1 = __importDefault(require("../controllers/customer-application.controller"));
var router = (0, express_1.Router)();
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
router.post('/teacher/customer-applications', auth_middleware_1.verifyToken, customer_application_controller_1["default"].applyForCustomers);
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
router.get('/teacher/customer-applications', auth_middleware_1.verifyToken, customer_application_controller_1["default"].getTeacherApplications);
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
router.get('/principal/customer-applications', auth_middleware_1.verifyToken, customer_application_controller_1["default"].getPrincipalApplications);
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
router.post('/principal/customer-applications/:id/review', auth_middleware_1.verifyToken, customer_application_controller_1["default"].reviewApplication);
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
router.post('/principal/customer-applications/batch-review', auth_middleware_1.verifyToken, customer_application_controller_1["default"].batchReviewApplications);
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
router.get('/stats', auth_middleware_1.verifyToken, customer_application_controller_1["default"].getApplicationStats);
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
router.get('/customer-applications/:id', auth_middleware_1.verifyToken, customer_application_controller_1["default"].getApplicationDetail);
exports["default"] = router;
