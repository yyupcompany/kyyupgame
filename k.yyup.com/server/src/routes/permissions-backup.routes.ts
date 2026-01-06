/**
* @swagger
 * components:
 *   schemas:
 *     Permissions-backup:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Permissions-backup ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Permissions-backup 名称
 *           example: "示例Permissions-backup"
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
 *     CreatePermissions-backupRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Permissions-backup 名称
 *           example: "新Permissions-backup"
 *     UpdatePermissions-backupRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Permissions-backup 名称
 *           example: "更新后的Permissions-backup"
 *     Permissions-backupListResponse:
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
 *                 $ref: '#/components/schemas/Permissions-backup'
 *         message:
 *           type: string
 *           example: "获取permissions-backup列表成功"
 *     Permissions-backupResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Permissions-backup'
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
 * permissions-backup管理路由文件
 * 提供permissions-backup的基础CRUD操作
*
 * 功能包括：
 * - 获取permissions-backup列表
 * - 创建新permissions-backup
 * - 获取permissions-backup详情
 * - 更新permissions-backup信息
 * - 删除permissions-backup
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * permissions_backup 路由文件
 * 自动生成 - 2025-07-20T21:41:14.887Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { PermissionBackup } from '../models/permissionbackup.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/permissions-backup:
 *   get:
 *     summary: 获取permissions_backup列表
 *     tags: [PermissionBackup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await PermissionBackup.findAll();
    return ApiResponse.success(res, { list }, '获取permissions_backup列表成功');
  } catch (error) {
    console.error('[PERMISSION]: 获取permissions_backup列表失败:', error);
    return ApiResponse.error(res, '获取permissions_backup列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/permissions-backup:
 *   post:
 *     summary: 创建permissions_backup
 *     tags: [PermissionBackup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await PermissionBackup.create(req.body);
    return ApiResponse.success(res, item, '创建permissions_backup成功');
  } catch (error) {
    console.error('[PERMISSION]: 创建permissions_backup失败:', error);
    return ApiResponse.error(res, '创建permissions_backup失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/permissions-backup/{id}:
 *   get:
 *     summary: 获取permissions_backup详情
 *     tags: [PermissionBackup]
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
    const item = await PermissionBackup.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'permissions_backup不存在');
    }
    
    return ApiResponse.success(res, item, '获取permissions_backup详情成功');
  } catch (error) {
    console.error('[PERMISSION]: 获取permissions_backup详情失败:', error);
    return ApiResponse.error(res, '获取permissions_backup详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/permissions-backup/{id}:
 *   put:
 *     summary: 更新permissions_backup
 *     tags: [PermissionBackup]
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
    const [updatedRowsCount] = await PermissionBackup.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'permissions_backup不存在');
    }
    
    const updatedItem = await PermissionBackup.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新permissions_backup成功');
  } catch (error) {
    console.error('[PERMISSION]: 更新permissions_backup失败:', error);
    return ApiResponse.error(res, '更新permissions_backup失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/permissions-backup/{id}:
 *   delete:
 *     summary: 删除permissions_backup
 *     tags: [PermissionBackup]
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
    const deletedRowsCount = await PermissionBackup.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'permissions_backup不存在');
    }
    
    return ApiResponse.success(res, null, '删除permissions_backup成功');
  } catch (error) {
    console.error('[PERMISSION]: 删除permissions_backup失败:', error);
    return ApiResponse.error(res, '删除permissions_backup失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
