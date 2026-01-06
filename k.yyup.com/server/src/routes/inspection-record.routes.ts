/**
* @swagger
 * components:
 *   schemas:
 *     Inspection-record:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Inspection-record ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Inspection-record 名称
 *           example: "示例Inspection-record"
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
 *     CreateInspection-recordRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Inspection-record 名称
 *           example: "新Inspection-record"
 *     UpdateInspection-recordRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Inspection-record 名称
 *           example: "更新后的Inspection-record"
 *     Inspection-recordListResponse:
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
 *                 $ref: '#/components/schemas/Inspection-record'
 *         message:
 *           type: string
 *           example: "获取inspection-record列表成功"
 *     Inspection-recordResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Inspection-record'
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
 * inspection-record管理路由文件
 * 提供inspection-record的基础CRUD操作
*
 * 功能包括：
 * - 获取inspection-record列表
 * - 创建新inspection-record
 * - 获取inspection-record详情
 * - 更新inspection-record信息
 * - 删除inspection-record
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import inspectionRecordController from '../controllers/inspection-record.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/inspection-records:
 *   get:
 *     summary: 获取检查记录列表
 *     tags: [检查记录]
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
 *       - in: query
 *         name: inspectionPlanId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: grade
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/', inspectionRecordController.getList.bind(inspectionRecordController));

/**
* @swagger
 * /api/inspection-records/{id}:
 *   get:
 *     summary: 获取检查记录详情
 *     tags: [检查记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/:id', inspectionRecordController.getDetail.bind(inspectionRecordController));

/**
* @swagger
 * /api/inspection-records/plan/{planId}:
 *   get:
 *     summary: 获取检查计划的所有记录
 *     tags: [检查记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: planId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/plan/:planId', inspectionRecordController.getByPlan.bind(inspectionRecordController));

/**
* @swagger
 * /api/inspection-records:
 *   post:
 *     summary: 创建检查记录
 *     tags: [检查记录]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inspectionPlanId
 *               - checkDate
 *             properties:
 *               inspectionPlanId:
 *                 type: integer
 *               checkDate:
 *                 type: string
 *                 format: date
 *               checkerName:
 *                 type: string
 *               totalScore:
 *                 type: number
 *               grade:
 *                 type: string
 *               summary:
 *                 type: string
 *               suggestions:
 *                 type: string
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', inspectionRecordController.create.bind(inspectionRecordController));

/**
* @swagger
 * /api/inspection-records/{id}:
 *   put:
 *     summary: 更新检查记录
 *     tags: [检查记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put('/:id', inspectionRecordController.update.bind(inspectionRecordController));

/**
* @swagger
 * /api/inspection-records/{id}:
 *   delete:
 *     summary: 删除检查记录
 *     tags: [检查记录]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
*/
router.delete('/:id', inspectionRecordController.delete.bind(inspectionRecordController));

export default router;

