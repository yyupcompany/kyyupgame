/**
* @swagger
 * components:
 *   schemas:
 *     Inspection:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Inspection ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Inspection 名称
 *           example: "示例Inspection"
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
 *     CreateInspectionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Inspection 名称
 *           example: "新Inspection"
 *     UpdateInspectionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Inspection 名称
 *           example: "更新后的Inspection"
 *     InspectionListResponse:
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
 *                 $ref: '#/components/schemas/Inspection'
 *         message:
 *           type: string
 *           example: "获取inspection列表成功"
 *     InspectionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Inspection'
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
 * inspection管理路由文件
 * 提供inspection的基础CRUD操作
*
 * 功能包括：
 * - 获取inspection列表
 * - 创建新inspection
 * - 获取inspection详情
 * - 更新inspection信息
 * - 删除inspection
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import inspectionTypeController from '../controllers/inspection-type.controller';
import inspectionPlanController from '../controllers/inspection-plan.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/inspection/types:
 *   get:
 *     summary: 获取检查类型列表
 *     description: 获取所有检查类型的列表
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/types', inspectionTypeController.getList.bind(inspectionTypeController));

/**
* @swagger
 * /api/inspection/types/active:
 *   get:
 *     summary: 获取启用的检查类型
 *     description: 获取所有启用状态的检查类型，用于下拉选择
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/types/active', inspectionTypeController.getActiveList.bind(inspectionTypeController));

/**
* @swagger
 * /api/inspection/types/{id}:
 *   get:
 *     summary: 获取检查类型详情
 *     description: 获取指定检查类型的详细信息
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/types/:id', inspectionTypeController.getDetail.bind(inspectionTypeController));

/**
* @swagger
 * /api/inspection/types:
 *   post:
 *     summary: 创建检查类型
 *     description: 创建新的检查类型
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 description: 检查类型名称
 *               description:
 *                 type: string
 *                 description: 描述
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/types', inspectionTypeController.create.bind(inspectionTypeController));

/**
* @swagger
 * /api/inspection/types/{id}:
 *   put:
 *     summary: 更新检查类型
 *     description: 更新指定的检查类型
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/types/:id', inspectionTypeController.update.bind(inspectionTypeController));

/**
* @swagger
 * /api/inspection/types/{id}:
 *   delete:
 *     summary: 删除检查类型
 *     description: 删除指定的检查类型
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.delete('/types/:id', inspectionTypeController.delete.bind(inspectionTypeController));

/**
* @swagger
 * /api/inspection/types/batch-delete:
 *   post:
 *     summary: 批量删除检查类型
 *     description: 批量删除多个检查类型
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 批量删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/types/batch-delete', inspectionTypeController.batchDelete.bind(inspectionTypeController));

/**
* @swagger
 * /api/inspection/plans:
 *   get:
 *     summary: 获取检查计划列表
 *     description: 获取所有检查计划的列表
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/plans', inspectionPlanController.getList.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/timeline:
 *   get:
 *     summary: 获取Timeline数据
 *     description: 获取检查计划的时间线数据
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/plans/timeline', inspectionPlanController.getTimeline.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/{id}:
 *   get:
 *     summary: 获取检查计划详情
 *     description: 获取指定检查计划的详细信息
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/plans/:id', inspectionPlanController.getDetail.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans:
 *   post:
 *     summary: 创建检查计划
 *     description: 创建新的检查计划
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - typeId
 *               - startDate
 *             properties:
 *               name:
 *                 type: string
 *               typeId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/plans', inspectionPlanController.create.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/generate-yearly:
 *   post:
 *     summary: 自动生成年度检查计划
 *     description: 根据配置自动生成年度检查计划
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *             properties:
 *               year:
 *                 type: integer
 *                 description: 年份
 *     responses:
 *       200:
 *         description: 生成成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/plans/generate-yearly', inspectionPlanController.generateYearlyPlan.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/{id}:
 *   put:
 *     summary: 更新检查计划
 *     description: 更新指定的检查计划
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               name:
 *                 type: string
 *               typeId:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/plans/:id', inspectionPlanController.update.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/{id}:
 *   delete:
 *     summary: 删除检查计划
 *     description: 删除指定的检查计划
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.delete('/plans/:id', inspectionPlanController.delete.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/{id}/tasks:
 *   get:
 *     summary: 获取检查计划的任务列表
 *     description: 获取指定检查计划的所有任务
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 检查计划ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/plans/:id/tasks', inspectionPlanController.getTasks.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/{id}/tasks:
 *   post:
 *     summary: 创建检查任务
 *     description: 为指定检查计划创建新任务
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 检查计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               assignedTo:
 *                 type: integer
 *                 description: 分配给的用户ID
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *                 default: medium
 *               dueDate:
 *                 type: string
 *                 format: date
 *                 description: 截止日期
 *     responses:
 *       201:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/plans/:id/tasks', inspectionPlanController.createTask.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/{id}/tasks/{taskId}:
 *   put:
 *     summary: 更新检查任务
 *     description: 更新指定的检查任务
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 检查计划ID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               assignedTo:
 *                 type: integer
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled]
 *               progress:
 *                 type: integer
 *                 minimum: 0
 *                 maximum: 100
 *               dueDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/plans/:id/tasks/:taskId', inspectionPlanController.updateTask.bind(inspectionPlanController));

/**
* @swagger
 * /api/inspection/plans/{id}/tasks/{taskId}:
 *   delete:
 *     summary: 删除检查任务
 *     description: 删除指定的检查任务
 *     tags:
 *       - 巡检管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 检查计划ID
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.delete('/plans/:id/tasks/:taskId', inspectionPlanController.deleteTask.bind(inspectionPlanController));

export default router;

