/**
* @swagger
 * components:
 *   schemas:
 *     Roles-backup:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Roles-backup ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Roles-backup 名称
 *           example: "示例Roles-backup"
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
 *     CreateRoles-backupRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Roles-backup 名称
 *           example: "新Roles-backup"
 *     UpdateRoles-backupRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Roles-backup 名称
 *           example: "更新后的Roles-backup"
 *     Roles-backupListResponse:
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
 *                 $ref: '#/components/schemas/Roles-backup'
 *         message:
 *           type: string
 *           example: "获取roles-backup列表成功"
 *     Roles-backupResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Roles-backup'
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
 * roles-backup管理路由文件
 * 提供roles-backup的基础CRUD操作
*
 * 功能包括：
 * - 获取roles-backup列表
 * - 创建新roles-backup
 * - 获取roles-backup详情
 * - 更新roles-backup信息
 * - 删除roles-backup
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * roles_backup 路由文件
 * 自动生成 - 2025-07-20T21:41:14.889Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { RoleBackup } from '../models/rolebackup.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/roles-backup:
 *   get:
 *     summary: 获取roles_backup列表
 *     tags: [RoleBackup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await RoleBackup.findAll();
    return ApiResponse.success(res, { list }, '获取roles_backup列表成功');
  } catch (error) {
    console.error('[ROLE]: 获取roles_backup列表失败:', error);
    return ApiResponse.error(res, '获取roles_backup列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/roles-backup:
 *   post:
 *     summary: 创建roles_backup
 *     tags: [RoleBackup]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await RoleBackup.create(req.body);
    return ApiResponse.success(res, item, '创建roles_backup成功');
  } catch (error) {
    console.error('[ROLE]: 创建roles_backup失败:', error);
    return ApiResponse.error(res, '创建roles_backup失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/roles-backup/{id}:
 *   get:
 *     summary: 获取roles_backup详情
 *     tags: [RoleBackup]
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
    const item = await RoleBackup.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'roles_backup不存在');
    }
    
    return ApiResponse.success(res, item, '获取roles_backup详情成功');
  } catch (error) {
    console.error('[ROLE]: 获取roles_backup详情失败:', error);
    return ApiResponse.error(res, '获取roles_backup详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/roles-backup/{id}:
 *   put:
 *     summary: 更新roles_backup
 *     tags: [RoleBackup]
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
    const [updatedRowsCount] = await RoleBackup.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'roles_backup不存在');
    }
    
    const updatedItem = await RoleBackup.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新roles_backup成功');
  } catch (error) {
    console.error('[ROLE]: 更新roles_backup失败:', error);
    return ApiResponse.error(res, '更新roles_backup失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/roles-backup/{id}:
 *   delete:
 *     summary: 删除roles_backup
 *     tags: [RoleBackup]
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
    const deletedRowsCount = await RoleBackup.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'roles_backup不存在');
    }
    
    return ApiResponse.success(res, null, '删除roles_backup成功');
  } catch (error) {
    console.error('[ROLE]: 删除roles_backup失败:', error);
    return ApiResponse.error(res, '删除roles_backup失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
