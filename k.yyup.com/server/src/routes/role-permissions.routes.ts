/**
* @swagger
 * components:
 *   schemas:
 *     Role-permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Role-permission ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Role-permission 名称
 *           example: "示例Role-permission"
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
 *     CreateRole-permissionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Role-permission 名称
 *           example: "新Role-permission"
 *     UpdateRole-permissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Role-permission 名称
 *           example: "更新后的Role-permission"
 *     Role-permissionListResponse:
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
 *                 $ref: '#/components/schemas/Role-permission'
 *         message:
 *           type: string
 *           example: "获取role-permission列表成功"
 *     Role-permissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Role-permission'
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
 * role-permission管理路由文件
 * 提供role-permission的基础CRUD操作
*
 * 功能包括：
 * - 获取role-permission列表
 * - 创建新role-permission
 * - 获取role-permission详情
 * - 更新role-permission信息
 * - 删除role-permission
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * role_permissions 路由文件
 * 自动生成 - 2025-07-20T21:41:14.889Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { RolePermission } from '../models/role-permission.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/role-permissions:
 *   get:
 *     summary: 获取role_permissions列表
 *     tags: [RolePermission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await RolePermission.findAll();
    return ApiResponse.success(res, { list }, '获取role_permissions列表成功');
  } catch (error) {
    console.error('[ROLE]: 获取role_permissions列表失败:', error);
    return ApiResponse.error(res, '获取role_permissions列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/role-permissions:
 *   post:
 *     summary: 创建role_permissions
 *     tags: [RolePermission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await RolePermission.create(req.body);
    return ApiResponse.success(res, item, '创建role_permissions成功');
  } catch (error) {
    console.error('[ROLE]: 创建role_permissions失败:', error);
    return ApiResponse.error(res, '创建role_permissions失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/role-permissions/{id}:
 *   get:
 *     summary: 获取role_permissions详情
 *     tags: [RolePermission]
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
 *         description: 获取成功
*/
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await RolePermission.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'role_permissions不存在');
    }
    
    return ApiResponse.success(res, item, '获取role_permissions详情成功');
  } catch (error) {
    console.error('[ROLE]: 获取role_permissions详情失败:', error);
    return ApiResponse.error(res, '获取role_permissions详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/role-permissions/{id}:
 *   put:
 *     summary: 更新role_permissions
 *     tags: [RolePermission]
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
 *         description: 更新成功
*/
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await RolePermission.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'role_permissions不存在');
    }
    
    const updatedItem = await RolePermission.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新role_permissions成功');
  } catch (error) {
    console.error('[ROLE]: 更新role_permissions失败:', error);
    return ApiResponse.error(res, '更新role_permissions失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/role-permissions/{id}:
 *   delete:
 *     summary: 删除role_permissions
 *     tags: [RolePermission]
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
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await RolePermission.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'role_permissions不存在');
    }
    
    return ApiResponse.success(res, null, '删除role_permissions成功');
  } catch (error) {
    console.error('[ROLE]: 删除role_permissions失败:', error);
    return ApiResponse.error(res, '删除role_permissions失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
