/**
* @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Permission ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Permission 名称
 *           example: "示例Permission"
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
 *     CreatePermissionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Permission 名称
 *           example: "新Permission"
 *     UpdatePermissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Permission 名称
 *           example: "更新后的Permission"
 *     PermissionListResponse:
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
 *                 $ref: '#/components/schemas/Permission'
 *         message:
 *           type: string
 *           example: "获取permission列表成功"
 *     PermissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Permission'
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
 * permission管理路由文件
 * 提供permission的基础CRUD操作
*
 * 功能包括：
 * - 获取permission列表
 * - 创建新permission
 * - 获取permission详情
 * - 更新permission信息
 * - 删除permission
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 权限路由
 * 提供动态路由和权限验证API
*/

import express from 'express';
import { 
  getDynamicRoutes, 
  getUserPermissions, 
  checkPermission, 
  getAllRoutes 
} from '../controllers/permissions.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * /api/permissions/dynamic-routes:
 *   get:
 *     summary: 获取用户的动态路由
 *     description: 获取当前用户可访问的动态路由列表
 *     tags:
 *       - 权限管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/dynamic-routes', verifyToken, getDynamicRoutes);

/**
* @swagger
 * /api/permissions/user-permissions:
 *   get:
 *     summary: 获取用户权限列表
 *     description: 获取当前用户的所有权限
 *     tags:
 *       - 权限管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/user-permissions', verifyToken, getUserPermissions);

/**
* @swagger
 * /api/permissions/check-permission:
 *   post:
 *     summary: 检查用户权限
 *     description: 检查用户是否拥有指定权限
 *     tags:
 *       - 权限管理
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
router.post('/check-permission', verifyToken, checkPermission);

/**
* @swagger
 * /api/permissions/all-routes:
 *   get:
 *     summary: 获取所有可用路由
 *     description: 获取系统中所有可用的路由（用于路由表生成）
 *     tags:
 *       - 权限管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/all-routes', verifyToken, getAllRoutes);

export default router;