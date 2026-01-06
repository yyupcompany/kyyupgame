/**
* @swagger
 * components:
 *   schemas:
 *     Inspection-rectification:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Inspection-rectification ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Inspection-rectification 名称
 *           example: "示例Inspection-rectification"
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
 *     CreateInspection-rectificationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Inspection-rectification 名称
 *           example: "新Inspection-rectification"
 *     UpdateInspection-rectificationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Inspection-rectification 名称
 *           example: "更新后的Inspection-rectification"
 *     Inspection-rectificationListResponse:
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
 *                 $ref: '#/components/schemas/Inspection-rectification'
 *         message:
 *           type: string
 *           example: "获取inspection-rectification列表成功"
 *     Inspection-rectificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Inspection-rectification'
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
 * inspection-rectification管理路由文件
 * 提供inspection-rectification的基础CRUD操作
*
 * 功能包括：
 * - 获取inspection-rectification列表
 * - 创建新inspection-rectification
 * - 获取inspection-rectification详情
 * - 更新inspection-rectification信息
 * - 删除inspection-rectification
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import inspectionRectificationController from '../controllers/inspection-rectification.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/inspection-rectifications:
 *   get:
 *     summary: 获取整改任务列表
 *     tags: [整改管理]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, verified, rejected]
 *       - in: query
 *         name: responsiblePersonId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功
*/
router.get('/', inspectionRectificationController.getList.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications/{id}:
 *   get:
 *     summary: 获取整改任务详情
 *     tags: [整改管理]
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
router.get('/:id', inspectionRectificationController.getDetail.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications/plan/{planId}:
 *   get:
 *     summary: 获取检查计划的整改任务
 *     tags: [整改管理]
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
router.get('/plan/:planId', inspectionRectificationController.getByPlan.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications:
 *   post:
 *     summary: 创建整改任务
 *     tags: [整改管理]
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
 *               - problemDescription
 *             properties:
 *               inspectionPlanId:
 *                 type: integer
 *               recordId:
 *                 type: integer
 *               recordItemId:
 *                 type: integer
 *               problemDescription:
 *                 type: string
 *               problemSeverity:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               rectificationMeasures:
 *                 type: string
 *               responsiblePersonId:
 *                 type: integer
 *               responsiblePersonName:
 *                 type: string
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', inspectionRectificationController.create.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications/{id}:
 *   put:
 *     summary: 更新整改任务
 *     tags: [整改管理]
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
router.put('/:id', inspectionRectificationController.update.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications/{id}/complete:
 *   post:
 *     summary: 完成整改
 *     tags: [整改管理]
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
 *             properties:
 *               completionDescription:
 *                 type: string
 *               completionPhotos:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 完成成功
*/
router.post('/:id/complete', inspectionRectificationController.complete.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications/{id}/verify:
 *   post:
 *     summary: 验收整改
 *     tags: [整改管理]
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
 *             required:
 *               - verificationStatus
 *             properties:
 *               verificationStatus:
 *                 type: string
 *                 enum: [pass, fail]
 *               verificationResult:
 *                 type: string
 *               verifierName:
 *                 type: string
 *     responses:
 *       200:
 *         description: 验收完成
*/
router.post('/:id/verify', inspectionRectificationController.verify.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications/{id}/progress:
 *   post:
 *     summary: 添加进度日志
 *     tags: [整改管理]
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
 *             required:
 *               - progress
 *             properties:
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               description:
 *                 type: string
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *               operatorName:
 *                 type: string
 *     responses:
 *       200:
 *         description: 添加成功
*/
router.post('/:id/progress', inspectionRectificationController.addProgressLog.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications/{id}/progress:
 *   get:
 *     summary: 获取进度日志
 *     tags: [整改管理]
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
router.get('/:id/progress', inspectionRectificationController.getProgressLogs.bind(inspectionRectificationController));

/**
* @swagger
 * /api/inspection-rectifications/{id}:
 *   delete:
 *     summary: 删除整改任务
 *     tags: [整改管理]
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
router.delete('/:id', inspectionRectificationController.delete.bind(inspectionRectificationController));

export default router;

