/**
* @swagger
 * components:
 *   schemas:
 *     Simple-permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Simple-permission ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Simple-permission 名称
 *           example: "示例Simple-permission"
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
 *     CreateSimple-permissionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Simple-permission 名称
 *           example: "新Simple-permission"
 *     UpdateSimple-permissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Simple-permission 名称
 *           example: "更新后的Simple-permission"
 *     Simple-permissionListResponse:
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
 *                 $ref: '#/components/schemas/Simple-permission'
 *         message:
 *           type: string
 *           example: "获取simple-permission列表成功"
 *     Simple-permissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Simple-permission'
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
 * simple-permission管理路由文件
 * 提供simple-permission的基础CRUD操作
*
 * 功能包括：
 * - 获取simple-permission列表
 * - 创建新simple-permission
 * - 获取simple-permission详情
 * - 更新simple-permission信息
 * - 删除simple-permission
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 简化的权限路由 - 为前端提供统一的权限验证接口
*/

import express from 'express';
import { checkPermission, batchCheckPermissions } from '../controllers/simple-permissions.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * /permissions/check:
 *   post:
 *     summary: 统一权限验证接口
 *     description: 前端只需要调用这一个接口进行权限验证，后端会自动处理4层权限逻辑
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permission:
 *                 type: string
 *                 example: "EDIT_STUDENT"
 *                 description: 权限代码
 *             required:
 *               - permission
 *     responses:
 *       200:
 *         description: 权限验证结果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPermission:
 *                       type: boolean
 *                       example: true
 *                     isAdmin:
 *                       type: boolean
 *                       example: false
 *                 meta:
 *                   type: object
 *                   properties:
 *                     responseTime:
 *                       type: number
 *                     fromCache:
 *                       type: boolean
 *       401:
 *         description: 未授权访问
 *       400:
 *         description: 请求参数错误
*/
router.post('/check', verifyToken, checkPermission);

/**
* @swagger
 * /permissions/batch-check:
 *   post:
 *     summary: 批量权限验证接口
 *     description: 一次性验证多个权限，提高前端性能
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["EDIT_STUDENT", "DELETE_STUDENT", "VIEW_STUDENT"]
 *                 description: 要验证的权限代码列表
 *             required:
 *               - permissions
 *     responses:
 *       200:
 *         description: 批量权限验证结果
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     results:
 *                       type: object
 *                       additionalProperties:
 *                         type: boolean
 *                       example:
 *                         "EDIT_STUDENT": true
 *                         "DELETE_STUDENT": false
 *                         "VIEW_STUDENT": true
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         granted:
 *                           type: number
 *                         denied:
 *                           type: number
*/
router.post('/batch-check', verifyToken, batchCheckPermissions);

export default router;