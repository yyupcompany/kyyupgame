/**
* @swagger
 * components:
 *   schemas:
 *     Activity-template:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity-template ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Activity-template 名称
 *           example: "示例Activity-template"
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
 *     CreateActivity-templateRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-template 名称
 *           example: "新Activity-template"
 *     UpdateActivity-templateRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-template 名称
 *           example: "更新后的Activity-template"
 *     Activity-templateListResponse:
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
 *                 $ref: '#/components/schemas/Activity-template'
 *         message:
 *           type: string
 *           example: "获取activity-template列表成功"
 *     Activity-templateResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Activity-template'
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
 * activity-template管理路由文件
 * 提供activity-template的基础CRUD操作
*
 * 功能包括：
 * - 获取activity-template列表
 * - 创建新activity-template
 * - 获取activity-template详情
 * - 更新activity-template信息
 * - 删除activity-template
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import activityTemplateController from '../controllers/activity-template.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/activity-templates:
 *   get:
 *     summary: 获取所有活动模板
 *     description: 获取活动模板列表
 *     tags:
 *       - 活动模板
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', activityTemplateController.getAll);

/**
* @swagger
 * /api/activity-templates/{id}:
 *   get:
 *     summary: 获取单个活动模板
 *     description: 根据ID获取活动模板详情
 *     tags:
 *       - 活动模板
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/:id', activityTemplateController.getById);

/**
* @swagger
 * /api/activity-templates:
 *   post:
 *     summary: 创建活动模板
 *     description: 创建新的活动模板
 *     tags:
 *       - 活动模板
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
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/', activityTemplateController.create);

/**
* @swagger
 * /api/activity-templates/{id}:
 *   put:
 *     summary: 更新活动模板
 *     description: 更新指定的活动模板
 *     tags:
 *       - 活动模板
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
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/:id', activityTemplateController.update);

/**
* @swagger
 * /api/activity-templates/{id}:
 *   delete:
 *     summary: 删除活动模板
 *     description: 删除指定的活动模板
 *     tags:
 *       - 活动模板
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
router.delete('/:id', activityTemplateController.delete);

/**
* @swagger
 * /api/activity-templates/{id}/use:
 *   post:
 *     summary: 使用活动模板
 *     description: 使用模板并增加使用次数
 *     tags:
 *       - 活动模板
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 使用成功
*/
router.post('/:id/use', activityTemplateController.use);

export default router;
