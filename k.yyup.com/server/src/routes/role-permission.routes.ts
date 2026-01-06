import { Router } from 'express';
import rolePermissionController from '../controllers/role-permission.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { permissionIdsSchema, checkPermissionConflictsSchema } from '../validations/role-permission.validation';
import { sequelize } from '../init';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';

/**
* @swagger
 * tags:
 *   name: RolePermissions
 *   description: 角色权限关联管理API
* 
 * components:
 *   schemas:
 *     RolePermission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 角色权限关联ID
 *         roleId:
 *           type: integer
 *           description: 角色ID
 *         permissionId:
 *           type: integer
 *           description: 权限ID
 *         grantorId:
 *           type: integer
 *           description: 授权者ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         roleName:
 *           type: string
 *           description: 角色名称
 *         roleCode:
 *           type: string
 *           description: 角色代码
 *         roleDescription:
 *           type: string
 *           description: 角色描述
 *         permissionName:
 *           type: string
 *           description: 权限名称
 *         permissionCode:
 *           type: string
 *           description: 权限代码
 *         permissionPath:
 *           type: string
 *           description: 权限路径
*     
 *     CreateRolePermissionRequest:
 *       type: object
 *       required:
 *         - roleId
 *         - permissionId
 *       properties:
 *         roleId:
 *           type: integer
 *           description: 角色ID
 *         permissionId:
 *           type: integer
 *           description: 权限ID
 *         assignedBy:
 *           type: integer
 *           description: 授权者ID
 *         notes:
 *           type: string
 *           description: 备注
*     
 *     UpdateRolePermissionRequest:
 *       type: object
 *       properties:
 *         notes:
 *           type: string
 *           description: 备注
*     
 *     PermissionIdsRequest:
 *       type: object
 *       required:
 *         - permissionIds
 *       properties:
 *         permissionIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: 权限ID列表
*/

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// ===== 标准REST API路径 (用于测试脚本) =====

/**
* @swagger
 * /api/role-permissions:
 *   get:
 *     summary: 获取角色权限关联列表
 *     description: 获取系统中所有角色权限关联的列表信息
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取角色权限关联列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取角色权限关联列表成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.get('/', checkPermission('ROLE_PERMISSION_MANAGE'), async (req, res, next) => {
  try {
    const [rolePermissions] = await sequelize.query(`
      SELECT 
        rp.id,
        rp.role_id as roleId,
        rp.permission_id as permissionId,
        rp.grantor_id as grantorId,
        rp.created_at as createdAt,
        rp.updated_at as updatedAt,
        r.name as roleName,
        r.code as roleCode,
        r.description as roleDescription,
        p.name as permissionName,
        p.code as permissionCode,
        p.path as permissionPath
      FROM role_permissions rp
      LEFT JOIN roles r ON rp.role_id = r.id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      ORDER BY rp.created_at DESC
    `);

    ApiResponse.success(res, rolePermissions, '获取角色权限关联列表成功');
  } catch (error) {
    console.error('[ROLE]: 获取角色权限关联列表错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/role-permissions:
 *   post:
 *     summary: 创建角色权限关联
 *     description: 为指定角色分配权限
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateRolePermissionRequest'
 *     responses:
 *       201:
 *         description: 创建角色权限关联成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: 创建角色权限关联成功
 *                 data:
 *                   $ref: '#/components/schemas/RolePermission'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.post('/', checkPermission('ROLE_PERMISSION_MANAGE'), async (req, res, next) => {
  try {
    const { roleId, permissionId, assignedBy, notes } = req.body;
    
    if (!roleId || !permissionId) {
      throw ApiError.badRequest('角色ID和权限ID不能为空');
    }

    // 检查角色是否存在
    const [roles] = await sequelize.query('SELECT id FROM roles WHERE id = ? AND status = 1', {
      replacements: [roleId]
    });
    if (!roles || roles.length === 0) {
      throw ApiError.notFound('角色不存在');
    }

    // 检查权限是否存在
    const [permissions] = await sequelize.query('SELECT id FROM permissions WHERE id = ? AND status = 1', {
      replacements: [permissionId]
    });
    if (!permissions || permissions.length === 0) {
      throw ApiError.notFound('权限不存在');
    }

    // 检查是否已存在该关联
    const [existing] = await sequelize.query(
      'SELECT id FROM role_permissions WHERE role_id = ? AND permission_id = ?',
      { replacements: [roleId, permissionId] }
    );
    
    if (existing && existing.length > 0) {
      throw ApiError.badRequest('该角色权限关联已存在');
    }
    
    // 确保grantorId有值
    const grantorId = assignedBy || (req.user as any)?.id || 1;
    
    // 创建角色权限关联
    await sequelize.query(`
      INSERT INTO role_permissions (role_id, permission_id, grantor_id, created_at, updated_at)
      VALUES (?, ?, ?, NOW(), NOW())
    `, {
      replacements: [roleId, permissionId, grantorId]
    });

    // 获取刚创建的记录
    const [newRolePermission] = await sequelize.query(`
      SELECT 
        rp.id,
        rp.role_id as roleId,
        rp.permission_id as permissionId,
        rp.grantor_id as grantorId,
        rp.created_at as createdAt,
        rp.updated_at as updatedAt
      FROM role_permissions rp
      WHERE rp.role_id = ? AND rp.permission_id = ?
      ORDER BY rp.created_at DESC
      LIMIT 1
    `, {
      replacements: [roleId, permissionId]
    });

    ApiResponse.success(res, newRolePermission[0], '创建角色权限关联成功', 201);
  } catch (error) {
    console.error('[ROLE]: 创建角色权限关联错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/role-permissions/{id}:
 *   get:
 *     summary: 获取角色权限关联详情
 *     description: 根据ID获取角色权限关联的详细信息
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色权限关联ID
 *     responses:
 *       200:
 *         description: 获取角色权限关联详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取角色权限关联详情成功
 *                 data:
 *                   $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.get('/:id', checkPermission('ROLE_PERMISSION_MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [rolePermissions] = await sequelize.query(`
      SELECT 
        rp.id,
        rp.role_id as roleId,
        rp.permission_id as permissionId,
        rp.grantor_id as grantorId,
        rp.created_at as createdAt,
        rp.updated_at as updatedAt,
        r.name as roleName,
        r.code as roleCode,
        r.description as roleDescription,
        p.name as permissionName,
        p.code as permissionCode,
        p.path as permissionPath
      FROM role_permissions rp
      LEFT JOIN roles r ON rp.role_id = r.id
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.id = ?
    `, {
      replacements: [id]
    });

    if (!rolePermissions || rolePermissions.length === 0) {
      throw ApiError.notFound('角色权限关联不存在');
    }

    ApiResponse.success(res, rolePermissions[0], '获取角色权限关联详情成功');
  } catch (error) {
    console.error('[ROLE]: 获取角色权限关联详情错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/role-permissions/{id}:
 *   put:
 *     summary: 更新角色权限关联
 *     description: 更新指定的角色权限关联信息
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色权限关联ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRolePermissionRequest'
 *     responses:
 *       200:
 *         description: 更新角色权限关联成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 更新角色权限关联成功
 *                 data:
 *                   $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
*/
router.put('/:id', checkPermission('ROLE_PERMISSION_MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;
    
    // 检查记录是否存在
    const [existing] = await sequelize.query(
      'SELECT id FROM role_permissions WHERE id = ?',
      { replacements: [id] }
    );
    
    if (!existing || existing.length === 0) {
      throw ApiError.notFound('角色权限关联不存在');
    }

    // 更新记录
    await sequelize.query(`
      UPDATE role_permissions 
      SET updated_at = NOW()
      WHERE id = ?
    `, {
      replacements: [id]
    });

    // 获取更新后的记录
    const [updatedRolePermission] = await sequelize.query(`
      SELECT 
        rp.id,
        rp.role_id as roleId,
        rp.permission_id as permissionId,
        rp.grantor_id as grantorId,
        rp.created_at as createdAt,
        rp.updated_at as updatedAt
      FROM role_permissions rp
      WHERE rp.id = ?
    `, {
      replacements: [id]
    });

    ApiResponse.success(res, updatedRolePermission[0], '更新角色权限关联成功');
  } catch (error) {
    console.error('[ROLE]: 更新角色权限关联错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/role-permissions/by-role/{roleId}:
 *   get:
 *     summary: 按角色获取权限关联
 *     description: 获取指定角色的所有权限关联信息
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 获取角色权限关联成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 获取角色权限关联成功
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/RolePermission'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.get('/by-role/:roleId', checkPermission('ROLE_PERMISSION_MANAGE'), async (req, res, next) => {
  try {
    const { roleId } = req.params;
    
    const [rolePermissions] = await sequelize.query(`
      SELECT 
        rp.id,
        rp.role_id as roleId,
        rp.permission_id as permissionId,
        rp.grantor_id as grantorId,
        rp.created_at as createdAt,
        rp.updated_at as updatedAt,
        p.name as permissionName,
        p.code as permissionCode,
        p.path as permissionPath
      FROM role_permissions rp
      LEFT JOIN permissions p ON rp.permission_id = p.id
      WHERE rp.role_id = ?
      ORDER BY rp.created_at DESC
    `, {
      replacements: [roleId]
    });

    ApiResponse.success(res, rolePermissions, '获取角色权限关联成功');
  } catch (error) {
    console.error('[ROLE]: 按角色获取权限关联错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/role-permissions/{id}:
 *   delete:
 *     summary: 删除角色权限关联
 *     description: 删除指定的角色权限关联
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色权限关联ID
 *     responses:
 *       200:
 *         description: 删除角色权限关联成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: 删除角色权限关联成功
 *                 data:
 *                   type: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.delete('/:id', checkPermission('ROLE_PERMISSION_MANAGE'), async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 删除角色权限关联
    const [result] = await sequelize.query(`
      DELETE FROM role_permissions WHERE id = ?
    `, {
      replacements: [id]
    });

    // 删除不存在的记录也返回成功（幂等性）
    ApiResponse.success(res, null, '删除角色权限关联成功');
  } catch (error) {
    console.error('[ROLE]: 删除角色权限关联错误:', error);
    ApiResponse.handleError(res, error);
  }
});

// ===== 嵌套路径 (保留现有功能) =====

/**
* @swagger
 * /api/role-permissions/roles/{roleId}/permissions:
 *   post:
 *     summary: 为角色分配权限
 *     description: 为指定角色批量分配权限
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionIdsRequest'
 *     responses:
 *       200:
 *         description: 权限分配成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.post(
  '/roles/:roleId/permissions',
  validateRequest(permissionIdsSchema),
  rolePermissionController.assignPermissionsToRole
);

/**
* @swagger
 * /api/role-permissions/roles/{roleId}/permissions:
 *   delete:
 *     summary: 移除角色的权限
 *     description: 批量移除角色的指定权限
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PermissionIdsRequest'
 *     responses:
 *       200:
 *         description: 权限移除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.delete(
  '/roles/:roleId/permissions',
  validateRequest(permissionIdsSchema),
  rolePermissionController.removePermissionsFromRole
);

/**
* @swagger
 * /api/role-permissions/roles/{roleId}/permissions:
 *   get:
 *     summary: 获取角色的所有权限
 *     description: 获取指定角色的所有权限列表
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 获取角色权限成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.get(
  '/roles/:roleId/permissions',
  rolePermissionController.getRolePermissions
);

/**
* @swagger
 * /api/role-permissions/permissions/{permissionId}/inheritance:
 *   get:
 *     summary: 获取权限继承结构
 *     description: 获取指定权限的继承关系结构
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: permissionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限ID
 *     responses:
 *       200:
 *         description: 获取权限继承结构成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.get(
  '/permissions/:permissionId/inheritance',
  rolePermissionController.getPermissionInheritance
);

/**
* @swagger
 * /api/role-permissions/roles/{roleId}/permission-history:
 *   get:
 *     summary: 获取权限分配历史
 *     description: 获取指定角色的权限分配历史记录
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *     responses:
 *       200:
 *         description: 获取权限分配历史成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.get(
  '/roles/:roleId/permission-history',
  rolePermissionController.getRolePermissionHistory
);

/**
* @swagger
 * /api/role-permissions/check-conflicts:
 *   post:
 *     summary: 检查权限冲突
 *     description: 检查权限分配是否存在冲突
 *     tags: [RolePermissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               roleId:
 *                 type: integer
 *                 description: 角色ID
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 权限ID列表
 *     responses:
 *       200:
 *         description: 权限冲突检查完成
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
*/
router.post(
  '/check-conflicts',
  validateRequest(checkPermissionConflictsSchema),
  rolePermissionController.checkPermissionConflicts
);

export default router; 