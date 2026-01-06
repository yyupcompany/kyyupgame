/**
* @swagger
 * components:
 *   schemas:
 *     Page-permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Page-permission ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Page-permission 名称
 *           example: "示例Page-permission"
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
 *     CreatePage-permissionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Page-permission 名称
 *           example: "新Page-permission"
 *     UpdatePage-permissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Page-permission 名称
 *           example: "更新后的Page-permission"
 *     Page-permissionListResponse:
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
 *                 $ref: '#/components/schemas/Page-permission'
 *         message:
 *           type: string
 *           example: "获取page-permission列表成功"
 *     Page-permissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Page-permission'
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
 * page-permission管理路由文件
 * 提供page-permission的基础CRUD操作
*
 * 功能包括：
 * - 获取page-permission列表
 * - 创建新page-permission
 * - 获取page-permission详情
 * - 更新page-permission信息
 * - 删除page-permission
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 页面权限路由 - Level 3: 页面操作权限
 * Page Permissions Routes - Level 3: Page Action Permissions
*/

import express from 'express';
import { getPageActions, batchCheckPermissions } from '../controllers/page-permissions.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * /permissions/page-actions:
 *   get:
 *     summary: Level 3 - 获取页面操作权限
 *     description: 获取指定页面的操作权限（button类型），支持按pageId或pagePath查询
 *     tags: [Permissions]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: pageId
 *         schema:
 *           type: string
 *         description: 页面权限ID
 *       - in: query
 *         name: pagePath
 *         schema:
 *           type: string
 *         description: 页面路径（支持模糊匹配）
 *     responses:
 *       200:
 *         description: 成功获取页面权限
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
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           name:
 *                             type: string
 *                           code:
 *                             type: string
 *                           type:
 *                             type: string
 *                             example: button
 *                           permission:
 *                             type: string
 *                     grouped:
 *                       type: object
 *                       description: 按功能分组的权限
 *                     summary:
 *                       type: object
 *                       description: 权限统计信息
 *                 meta:
 *                   type: object
 *                   properties:
 *                     fromCache:
 *                       type: boolean
 *                     responseTime:
 *                       type: number
 *                     level:
 *                       type: number
 *                       example: 3
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器错误
*/
router.get('/page-actions', verifyToken, getPageActions);

/**
* @swagger
 * /permissions/batch-check:
 *   post:
 *     summary: Level 3 - 批量权限验证
 *     description: 批量验证多个权限，提高验证效率
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
 *                           example: 3
 *                         granted:
 *                           type: number
 *                           example: 2
 *                         denied:
 *                           type: number
 *                           example: 1
 *                 meta:
 *                   type: object
 *                   properties:
 *                     responseTime:
 *                       type: number
 *                     level:
 *                       type: number
 *                       example: 3
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器错误
*/
router.post('/batch-check', verifyToken, batchCheckPermissions);

export default router;