/**
* @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Role ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Role 名称
 *           example: "示例Role"
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
 *     CreateRoleRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Role 名称
 *           example: "新Role"
 *     UpdateRoleRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Role 名称
 *           example: "更新后的Role"
 *     RoleListResponse:
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
 *                 $ref: '#/components/schemas/Role'
 *         message:
 *           type: string
 *           example: "获取role列表成功"
 *     RoleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Role'
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
 * role管理路由文件
 * 提供role的基础CRUD操作
*
 * 功能包括：
 * - 获取role列表
 * - 创建新role
 * - 获取role详情
 * - 更新role信息
 * - 删除role
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { roleController } from '../controllers/role.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { invalidateRoleCache } from '../middlewares/cache-invalidation.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/roles/my-roles:
 *   get:
 *     summary: 获取当前用户的角色
 *     description: 获取当前登录用户拥有的所有角色信息
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户角色成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 角色ID
 *                       name:
 *                         type: string
 *                         description: 角色名称
 *                       code:
 *                         type: string
 *                         description: 角色代码
 *                       description:
 *                         type: string
 *                         description: 角色描述
 *                 message:
 *                   type: string
 *                   example: "获取用户角色成功"
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "未授权访问"
*/
router.get('/my-roles', roleController.getUserRoles.bind(roleController));

/**
* @swagger
 * /api/roles/check/{roleCode}:
 *   get:
 *     summary: 检查用户是否有指定角色
 *     description: 检查当前登录用户是否拥有指定角色代码的角色
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleCode
 *         required: true
 *         description: 角色代码
 *         schema:
 *           type: string
 *           example: "ADMIN"
 *     responses:
 *       200:
 *         description: 角色检查成功
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
 *                     hasRole:
 *                       type: boolean
 *                       description: 是否拥有该角色
 *                       example: true
 *                 message:
 *                   type: string
 *                   example: "角色检查成功"
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "未授权访问"
*/
router.get('/check/:roleCode', roleController.checkUserRole.bind(roleController));

/**
* @swagger
 * /api/roles:
 *   get:
 *     summary: 获取所有角色列表
 *     description: 获取系统中所有角色的列表信息（管理员功能）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取角色列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: 角色ID
 *                         example: 1
 *                       name:
 *                         type: string
 *                         description: 角色名称
 *                         example: "管理员"
 *                       code:
 *                         type: string
 *                         description: 角色代码
 *                         example: "ADMIN"
 *                       description:
 *                         type: string
 *                         description: 角色描述
 *                         example: "系统管理员"
 *                       status:
 *                         type: integer
 *                         description: 角色状态
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: 创建时间
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: 更新时间
 *                 message:
 *                   type: string
 *                   example: "获取角色列表成功"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/', roleController.getAllRoles.bind(roleController));

/**
* @swagger
 * /api/roles:
 *   post:
 *     summary: 创建角色
 *     description: 创建新的角色（管理员功能，需要ROLE_MANAGE权限）
 *     tags:
 *       - 角色管理
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
 *               - code
 *             properties:
 *               name:
 *                 type: string
 *                 description: 角色名称
 *                 example: "教师"
 *               code:
 *                 type: string
 *                 description: 角色代码
 *                 example: "TEACHER"
 *               description:
 *                 type: string
 *                 description: 角色描述
 *                 example: "幼儿园教师角色"
 *     responses:
 *       201:
 *         description: 角色创建成功
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
 *                     id:
 *                       type: integer
 *                       description: 角色ID
 *                       example: 3
 *                     name:
 *                       type: string
 *                       description: 角色名称
 *                       example: "教师"
 *                     code:
 *                       type: string
 *                       description: 角色代码
 *                       example: "TEACHER"
 *                     description:
 *                       type: string
 *                       description: 角色描述
 *                       example: "幼儿园教师角色"
 *                     status:
 *                       type: integer
 *                       description: 角色状态
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: "角色创建成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       409:
 *         description: 角色代码已存在
*/
router.post('/', checkPermission('role:manage'), roleController.createRole.bind(roleController), invalidateRoleCache);

/**
* @swagger
 * /api/roles/{id}:
 *   get:
 *     summary: 获取角色详情
 *     description: 根据角色ID获取角色的详细信息（管理员功能，需要ROLE_MANAGE权限）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 角色ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: 获取角色详情成功
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
 *                     id:
 *                       type: integer
 *                       description: 角色ID
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: 角色名称
 *                       example: "管理员"
 *                     code:
 *                       type: string
 *                       description: 角色代码
 *                       example: "ADMIN"
 *                     description:
 *                       type: string
 *                       description: 角色描述
 *                       example: "系统管理员"
 *                     status:
 *                       type: integer
 *                       description: 角色状态
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: 创建时间
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 更新时间
 *                 message:
 *                   type: string
 *                   example: "获取角色详情成功"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 角色不存在
*/
router.get('/:id', checkPermission('role:manage'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sequelize } = require('../init');
    const { QueryTypes } = require('sequelize');

    console.log('[角色详情] 查询角色ID:', id);

    const roleResults = await sequelize.query(
      'SELECT * FROM roles WHERE id = :id AND status = 1',
      {
        replacements: { id: Number(id) || 0 },
        type: QueryTypes.SELECT
      }
    );

    console.log('[角色详情] 查询结果:', roleResults);

    if (!roleResults || roleResults.length === 0) {
      console.log('[角色详情] 角色不存在');
      return res.status(404).json({
        success: false,
        message: '角色不存在'
      });
    }

    const role = roleResults[0];
    console.log('[角色详情] 返回角色信息:', role);

    res.json({
      success: true,
      data: role,
      message: '获取角色详情成功'
    });
  } catch (error) {
    console.error('[角色详情] 查询错误:', error);
    next(error);
  }
});

/**
* @swagger
 * /api/roles/{id}:
 *   put:
 *     summary: 更新角色
 *     description: 更新指定角色的信息（管理员功能，需要ROLE_MANAGE权限）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 角色ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 角色名称
 *                 example: "高级管理员"
 *               code:
 *                 type: string
 *                 description: 角色代码
 *                 example: "ADMIN"
 *               description:
 *                 type: string
 *                 description: 角色描述
 *                 example: "系统高级管理员"
 *               status:
 *                 type: integer
 *                 description: 角色状态
 *                 example: 1
 *     responses:
 *       200:
 *         description: 角色更新成功
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
 *                     id:
 *                       type: integer
 *                       description: 角色ID
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: 角色名称
 *                       example: "高级管理员"
 *                     code:
 *                       type: string
 *                       description: 角色代码
 *                       example: "ADMIN"
 *                     description:
 *                       type: string
 *                       description: 角色描述
 *                       example: "系统高级管理员"
 *                     status:
 *                       type: integer
 *                       description: 角色状态
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: "角色更新成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 角色不存在
 *       409:
 *         description: 角色代码已存在
*/
router.put('/:id', checkPermission('role:manage'), roleController.updateRole.bind(roleController), invalidateRoleCache);

/**
* @swagger
 * /api/roles/{id}:
 *   delete:
 *     summary: 删除角色
 *     description: 删除指定的角色（管理员功能，需要ROLE_MANAGE权限）
 *     tags:
 *       - 角色管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 角色ID
 *         schema:
 *           type: integer
 *           example: 3
 *     responses:
 *       200:
 *         description: 角色删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "角色删除成功"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 角色不存在
 *       409:
 *         description: 角色正在使用中，无法删除
*/
router.delete('/:id', checkPermission('role:manage'), roleController.deleteRole.bind(roleController), invalidateRoleCache);

export default router; 