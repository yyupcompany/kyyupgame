/**
* @swagger
 * components:
 *   schemas:
 *     Admission-result:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Admission-result ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Admission-result 名称
 *           example: "示例Admission-result"
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
 *     CreateAdmission-resultRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Admission-result 名称
 *           example: "新Admission-result"
 *     UpdateAdmission-resultRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Admission-result 名称
 *           example: "更新后的Admission-result"
 *     Admission-resultListResponse:
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
 *                 $ref: '#/components/schemas/Admission-result'
 *         message:
 *           type: string
 *           example: "获取admission-result列表成功"
 *     Admission-resultResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Admission-result'
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
 * admission-result管理路由文件
 * 提供admission-result的基础CRUD操作
*
 * 功能包括：
 * - 获取admission-result列表
 * - 创建新admission-result
 * - 获取admission-result详情
 * - 更新admission-result信息
 * - 删除admission-result
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 录取结果路由
*/
import { Router } from 'express';
import * as admissionResultController from '../controllers/admission-result.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/admission-results:
 *   post:
 *     summary: 创建录取结果
 *     tags: [录取结果]
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
 *               - studentName
 *               - parentId
 *               - planId
 *               - status
 *               - type
 *               - admissionDate
 *               - decisionMakerId
 *               - decisionDate
 *             properties:
 *               applicationId:
 *                 type: integer
 *                 description: 报名申请ID
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               classId:
 *                 type: integer
 *                 description: 分配班级ID
 *               status:
 *                 type: string
 *                 enum: [pending, admitted, rejected, waitlisted, confirmed, canceled]
 *                 description: 录取状态
 *               type:
 *                 type: string
 *                 enum: [regular, special, priority, transfer]
 *                 description: 录取类型
 *               admissionDate:
 *                 type: string
 *                 format: date
 *                 description: 录取日期
 *               score:
 *                 type: number
 *                 description: 评分
 *               rank:
 *                 type: integer
 *                 description: 排名
 *               interviewResult:
 *                 type: string
 *                 description: 面试结果
 *               interviewDate:
 *                 type: string
 *                 format: date
 *                 description: 面试日期
 *               interviewerId:
 *                 type: integer
 *                 description: 面试官ID
 *               decisionMakerId:
 *                 type: integer
 *                 description: 决策者ID
 *               decisionDate:
 *                 type: string
 *                 format: date
 *                 description: 决策日期
 *               decisionReason:
 *                 type: string
 *                 description: 决策原因
 *               specialRequirements:
 *                 type: string
 *                 description: 特殊要求
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
  '/', checkPermission('ADMISSION_RESULT_MANAGE'),
  admissionResultController.createResult
);

/**
* @swagger
 * /api/admission-results:
 *   get:
 *     summary: 获取录取结果列表
 *     tags: [录取结果]
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
 *         name: size
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: studentName
 *         schema:
 *           type: string
 *         description: 学生姓名
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 录取状态
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 录取类型
 *       - in: query
 *         name: planId
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *       - in: query
 *         name: parentId
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID
 *       - in: query
 *         name: admissionDateStart
 *         schema:
 *           type: string
 *           format: date
 *         description: 录取开始日期
 *       - in: query
 *         name: admissionDateEnd
 *         schema:
 *           type: string
 *           format: date
 *         description: 录取结束日期
 *     responses:
 *       200:
 *         description: 成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/', checkPermission('ADMISSION_RESULT_MANAGE'),
  admissionResultController.getResults
);

/**
* @swagger
 * /api/admission-results/by-application/{applicationId}:
 *   get:
 *     summary: 按申请获取录取结果
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: applicationId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 申请ID
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
  '/by-application/:applicationId', checkPermission('ADMISSION_RESULT_MANAGE'),
  admissionResultController.getResultsByApplication
);

/**
* @swagger
 * /api/admission-results/by-class/{classId}:
 *   get:
 *     summary: 按班级获取录取结果
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         schema:
 *           type: integer
 *         required: true
 *         description: 班级ID
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
  '/by-class/:classId', checkPermission('ADMISSION_RESULT_MANAGE'),
  admissionResultController.getResultsByClass
);

/**
* @swagger
 * /api/admission-results/statistics:
 *   get:
 *     summary: 获取录取统计数据
 *     tags: [录取结果]
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
  '/statistics', checkPermission('ADMISSION_RESULT_MANAGE'),
  admissionResultController.getStatistics
);

/**
* @swagger
 * /api/admission-results/{id}:
 *   get:
 *     summary: 获取录取结果详情
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 录取结果ID
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
  '/:id', checkPermission('ADMISSION_RESULT_MANAGE'),
  admissionResultController.getResultById
);

/**
* @swagger
 * /api/admission-results/{id}:
 *   put:
 *     summary: 更新录取结果
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 录取结果ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *               planId:
 *                 type: integer
 *                 description: 招生计划ID
 *               classId:
 *                 type: integer
 *                 description: 分配班级ID
 *               status:
 *                 type: string
 *                 enum: [pending, admitted, rejected, waitlisted, confirmed, canceled]
 *                 description: 录取状态
 *               type:
 *                 type: string
 *                 enum: [regular, special, priority, transfer]
 *                 description: 录取类型
 *               admissionDate:
 *                 type: string
 *                 format: date
 *                 description: 录取日期
 *               score:
 *                 type: number
 *                 description: 评分
 *               rank:
 *                 type: integer
 *                 description: 排名
 *               interviewResult:
 *                 type: string
 *                 description: 面试结果
 *               interviewDate:
 *                 type: string
 *                 format: date
 *                 description: 面试日期
 *               interviewerId:
 *                 type: integer
 *                 description: 面试官ID
 *               decisionReason:
 *                 type: string
 *                 description: 决策原因
 *               specialRequirements:
 *                 type: string
 *                 description: 特殊要求
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
  '/:id', checkPermission('ADMISSION_RESULT_MANAGE'),
  admissionResultController.updateResult
);

/**
* @swagger
 * /api/admission-results/{id}:
 *   delete:
 *     summary: 删除录取结果
 *     tags: [录取结果]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: 录取结果ID
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
  '/:id', checkPermission('ADMISSION_RESULT_MANAGE'),
  admissionResultController.deleteResult
);

export default router; 