/**
* @swagger
 * components:
 *   schemas:
 *     Organization-statu:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Organization-statu ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Organization-statu 名称
 *           example: "示例Organization-statu"
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
 *     CreateOrganization-statuRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Organization-statu 名称
 *           example: "新Organization-statu"
 *     UpdateOrganization-statuRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Organization-statu 名称
 *           example: "更新后的Organization-statu"
 *     Organization-statuListResponse:
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
 *                 $ref: '#/components/schemas/Organization-statu'
 *         message:
 *           type: string
 *           example: "获取organization-statu列表成功"
 *     Organization-statuResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Organization-statu'
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
 * organization-statu管理路由文件
 * 提供organization-statu的基础CRUD操作
*
 * 功能包括：
 * - 获取organization-statu列表
 * - 创建新organization-statu
 * - 获取organization-statu详情
 * - 更新organization-statu信息
 * - 删除organization-statu
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { OrganizationStatusController } from '../controllers/organization-status.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/organization-status/default:
 *   get:
 *     summary: 获取默认幼儿园的机构现状
 *     tags: [OrganizationStatus]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取机构现状
 *       404:
 *         description: 系统中没有幼儿园数据
*/
router.get('/default', OrganizationStatusController.getDefaultStatus);

/**
* @swagger
 * /api/organization-status/{kindergartenId}:
 *   get:
 *     summary: 获取指定幼儿园的机构现状
 *     tags: [OrganizationStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 成功获取机构现状
 *       404:
 *         description: 幼儿园不存在
*/
router.get('/:kindergartenId', OrganizationStatusController.getStatus);

/**
* @swagger
 * /api/organization-status/{kindergartenId}/refresh:
 *   post:
 *     summary: 刷新机构现状数据
 *     tags: [OrganizationStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 数据刷新成功
 *       404:
 *         description: 幼儿园不存在
*/
router.post('/:kindergartenId/refresh', OrganizationStatusController.refreshStatus);

/**
* @swagger
 * /api/organization-status/{kindergartenId}/ai-format:
 *   get:
 *     summary: 获取AI格式化的机构现状文本
 *     tags: [OrganizationStatus]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 成功获取AI格式化文本
 *       404:
 *         description: 幼儿园不存在
*/
router.get('/:kindergartenId/ai-format', OrganizationStatusController.getAIFormattedStatus);

export default router;

