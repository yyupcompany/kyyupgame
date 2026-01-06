"use strict";
/**
 * 教师客户管理路由
 */
exports.__esModule = true;
var express_1 = require("express");
var teacher_customers_controller_1 = require("../controllers/teacher-customers.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
// 所有路由都需要认证
router.use(auth_middleware_1.verifyToken);
/**
 * @swagger
 * /api/teacher-customers/stats:
 *   get:
 *     summary: 获取教师客户统计
 *     description: 获取教师的客户统计数据
 *     tags:
 *       - 教师客户管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/stats', teacher_customers_controller_1.TeacherCustomersController.getCustomerStats);
/**
 * @swagger
 * /api/teacher-customers/conversion-funnel:
 *   get:
 *     summary: 获取客户转化漏斗数据
 *     description: 获取客户转化漏斗的统计数据
 *     tags:
 *       - 教师客户管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/conversion-funnel', teacher_customers_controller_1.TeacherCustomersController.getConversionFunnel);
/**
 * @swagger
 * /api/teacher-customers/list:
 *   get:
 *     summary: 获取教师客户列表
 *     description: 获取教师的客户列表
 *     tags:
 *       - 教师客户管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/list', teacher_customers_controller_1.TeacherCustomersController.getCustomerList);
/**
 * @swagger
 * /api/teacher-customers/{customerId}/follow:
 *   post:
 *     summary: 添加客户跟进记录
 *     description: 为客户添加跟进记录
 *     tags:
 *       - 教师客户管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 添加成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:customerId/follow', teacher_customers_controller_1.TeacherCustomersController.addFollowRecord);
/**
 * @swagger
 * /api/teacher-customers/{customerId}/status:
 *   put:
 *     summary: 更新客户状态
 *     description: 更新客户的状态
 *     tags:
 *       - 教师客户管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.put('/:customerId/status', teacher_customers_controller_1.TeacherCustomersController.updateCustomerStatus);
/**
 * @swagger
 * /api/teacher-customers/{customerId}/follow-records:
 *   get:
 *     summary: 获取客户跟进记录
 *     description: 获取指定客户的跟进记录列表
 *     tags:
 *       - 教师客户管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:customerId/follow-records', teacher_customers_controller_1.TeacherCustomersController.getFollowRecords);
exports["default"] = router;
