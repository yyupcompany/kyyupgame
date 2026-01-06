/**
* @swagger
 * components:
 *   schemas:
 *     Enrollment-interview:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Enrollment-interview ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Enrollment-interview 名称
 *           example: "示例Enrollment-interview"
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
 *     CreateEnrollment-interviewRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Enrollment-interview 名称
 *           example: "新Enrollment-interview"
 *     UpdateEnrollment-interviewRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Enrollment-interview 名称
 *           example: "更新后的Enrollment-interview"
 *     Enrollment-interviewListResponse:
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
 *                 $ref: '#/components/schemas/Enrollment-interview'
 *         message:
 *           type: string
 *           example: "获取enrollment-interview列表成功"
 *     Enrollment-interviewResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Enrollment-interview'
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
 * enrollment-interview管理路由文件
 * 提供enrollment-interview的基础CRUD操作
*
 * 功能包括：
 * - 获取enrollment-interview列表
 * - 创建新enrollment-interview
 * - 获取enrollment-interview详情
 * - 更新enrollment-interview信息
 * - 删除enrollment-interview
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 面试记录路由
*/
import { Router } from 'express';
import * as enrollmentInterviewController from '../controllers/enrollment-interview.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/enrollment-interviews:
 *   post:
 *     summary: 创建面试记录
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - applicationId
 *               - interviewDate
 *               - interviewerId
 *             properties:
 *               applicationId:
 *                 type: integer
 *                 description: 申请ID
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 description: 面试日期
 *               interviewerId:
 *                 type: integer
 *                 description: 面试官ID
 *               location:
 *                 type: string
 *                 description: 面试地点
 *               status:
 *                 type: string
 *                 description: 面试状态
 *     responses:
 *       201:
 *         description: 创建成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/', checkPermission('ENROLLMENT_INTERVIEW_MANAGE'),
  enrollmentInterviewController.createInterview
);

/**
* @swagger
 * /api/enrollment-interviews:
 *   get:
 *     summary: 获取面试记录列表
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/', checkPermission('ENROLLMENT_INTERVIEW_MANAGE'),
  enrollmentInterviewController.getInterviews
);

/**
* @swagger
 * /api/enrollment-interviews/stats:
 *   get:
 *     summary: 获取面试记录统计数据
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/stats', checkPermission('ENROLLMENT_INTERVIEW_MANAGE'),
  enrollmentInterviewController.getInterviewStats
);

/**
* @swagger
 * /api/enrollment-interviews/{id}:
 *   get:
 *     summary: 获取面试记录详情
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 面试记录ID
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:id', checkPermission('ENROLLMENT_INTERVIEW_MANAGE'),
  enrollmentInterviewController.getInterviewById
);

/**
* @swagger
 * /api/enrollment-interviews/{id}:
 *   put:
 *     summary: 更新面试记录
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 面试记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               interviewDate:
 *                 type: string
 *                 format: date-time
 *                 description: 面试日期
 *               location:
 *                 type: string
 *                 description: 面试地点
 *               status:
 *                 type: string
 *                 description: 面试状态
 *               score:
 *                 type: number
 *                 description: 面试分数
 *               feedback:
 *                 type: string
 *                 description: 面试反馈
 *     responses:
 *       200:
 *         description: 更新成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.put(
  '/:id', checkPermission('ENROLLMENT_INTERVIEW_MANAGE'),
  enrollmentInterviewController.updateInterview
);

/**
* @swagger
 * /api/enrollment-interviews/{id}:
 *   delete:
 *     summary: 删除面试记录
 *     tags: [面试记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 面试记录ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 未找到
 *       500:
 *         description: 服务器错误
*/
router.delete(
  '/:id', checkPermission('ENROLLMENT_INTERVIEW_MANAGE'),
  enrollmentInterviewController.deleteInterview
);

export default router; 