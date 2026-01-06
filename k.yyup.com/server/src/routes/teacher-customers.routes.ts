/**
* @swagger
 * components:
 *   schemas:
 *     Teacher-customer:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Teacher-customer ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Teacher-customer 名称
 *           example: "示例Teacher-customer"
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
 *     CreateTeacher-customerRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher-customer 名称
 *           example: "新Teacher-customer"
 *     UpdateTeacher-customerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher-customer 名称
 *           example: "更新后的Teacher-customer"
 *     Teacher-customerListResponse:
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
 *                 $ref: '#/components/schemas/Teacher-customer'
 *         message:
 *           type: string
 *           example: "获取teacher-customer列表成功"
 *     Teacher-customerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Teacher-customer'
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
 * teacher-customer管理路由文件
 * 提供teacher-customer的基础CRUD操作
*
 * 功能包括：
 * - 获取teacher-customer列表
 * - 创建新teacher-customer
 * - 获取teacher-customer详情
 * - 更新teacher-customer信息
 * - 删除teacher-customer
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 教师客户管理路由
*/

import { Router } from 'express';
import { TeacherCustomersController } from '../controllers/teacher-customers.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { applyDataScope } from '../middlewares/data-scope.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// 应用数据范围中间件（园区隔离）
// 必须在verifyToken之后，因为需要req.user.kindergartenId
router.use(applyDataScope);

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
router.get('/stats', TeacherCustomersController.getCustomerStats);

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
router.get('/conversion-funnel', TeacherCustomersController.getConversionFunnel);

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
router.get('/list', TeacherCustomersController.getCustomerList);

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
router.post('/:customerId/follow', TeacherCustomersController.addFollowRecord);

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
router.put('/:customerId/status', TeacherCustomersController.updateCustomerStatus);

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
router.get('/:customerId/follow-records', TeacherCustomersController.getFollowRecords);

export default router;