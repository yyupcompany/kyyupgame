/**
* @swagger
 * components:
 *   schemas:
 *     Auth-permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Auth-permission ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Auth-permission 名称
 *           example: "示例Auth-permission"
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
 *     CreateAuth-permissionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Auth-permission 名称
 *           example: "新Auth-permission"
 *     UpdateAuth-permissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Auth-permission 名称
 *           example: "更新后的Auth-permission"
 *     Auth-permissionListResponse:
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
 *                 $ref: '#/components/schemas/Auth-permission'
 *         message:
 *           type: string
 *           example: "获取auth-permission列表成功"
 *     Auth-permissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Auth-permission'
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
 * auth-permission管理路由文件
 * 提供auth-permission的基础CRUD操作
*
 * 功能包括：
 * - 获取auth-permission列表
 * - 创建新auth-permission
 * - 获取auth-permission详情
 * - 更新auth-permission信息
 * - 删除auth-permission
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 权限相关的认证路由
*/

import { Router } from 'express';
import { AuthPermissionsController } from '../controllers/auth-permissions.controller';
import { verifyToken } from '../middlewares/auth.middleware';


const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/auth-permissions/permissions:
 *   get:
 *     summary: 获取用户权限列表
 *     description: 获取当前用户的所有权限
 *     tags:
 *       - 认证权限
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/permissions', AuthPermissionsController.getUserPermissions);

/**
* @swagger
 * /api/auth-permissions/menu:
 *   get:
 *     summary: 获取用户菜单
 *     description: 获取当前用户可访问的菜单列表
 *     tags:
 *       - 认证权限
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/menu', AuthPermissionsController.getUserMenu);

/**
* @swagger
 * /api/auth-permissions/check-permission:
 *   post:
 *     summary: 检查用户权限
 *     description: 检查用户是否拥有指定权限
 *     tags:
 *       - 认证权限
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission
 *             properties:
 *               permission:
 *                 type: string
 *     responses:
 *       200:
 *         description: 检查成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/check-permission', AuthPermissionsController.checkPermission);

/**
* @swagger
 * /api/auth-permissions/roles:
 *   get:
 *     summary: 获取用户角色
 *     description: 获取当前用户的所有角色
 *     tags:
 *       - 认证权限
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/roles', AuthPermissionsController.getUserRoles);

export default router;