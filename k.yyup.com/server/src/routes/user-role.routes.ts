import { Router } from 'express';
import userRoleController from '../controllers/user-role.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { roleIdsSchema, primaryRoleSchema, roleValiditySchema } from '../validations/user-role.validation';
import { sequelize } from '../init';
import { ApiResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/apiError';
import { invalidateUserRoleCache } from '../middlewares/cache-invalidation.middleware';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   name: 用户角色关联
 *   description: 用户角色关联管理API - 管理用户与角色之间的关联关系、权限分配和角色生效期管理
*/

/**
* @swagger
 * components:
 *   schemas:
 *     UserRole:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户角色关联ID
 *           example: 1
 *         userId:
 *           type: integer
 *           description: 用户ID
 *           example: 123
 *         roleId:
 *           type: integer
 *           description: 角色ID
 *           example: 456
 *         isPrimary:
 *           type: boolean
 *           description: 是否为主要角色
 *           example: true
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效开始时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效结束时间
 *           example: "2024-12-31T23:59:59.000Z"
 *         grantorId:
 *           type: integer
 *           description: 授权人ID
 *           example: 789
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         username:
 *           type: string
 *           description: 用户名
 *           example: "john_doe"
 *         realName:
 *           type: string
 *           description: 真实姓名
 *           example: "张三"
 *         roleName:
 *           type: string
 *           description: 角色名称
 *           example: "管理员"
 *         roleCode:
 *           type: string
 *           description: 角色代码
 *           example: "ADMIN"
 *         roleDescription:
 *           type: string
 *           description: 角色描述
 *           example: "系统管理员角色"
*     
 *     CreateUserRoleRequest:
 *       type: object
 *       required:
 *         - userId
 *         - roleId
 *       properties:
 *         userId:
 *           type: integer
 *           description: 用户ID
 *           example: 123
 *         roleId:
 *           type: integer
 *           description: 角色ID
 *           example: 456
 *         assignedBy:
 *           type: integer
 *           description: 分配人ID（可选）
 *           example: 789
 *         notes:
 *           type: string
 *           description: 备注信息（可选）
 *           example: "临时分配管理员权限"
*     
 *     UpdateUserRoleRequest:
 *       type: object
 *       properties:
 *         isPrimary:
 *           type: boolean
 *           description: 是否为主要角色
 *           example: true
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效开始时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效结束时间
 *           example: "2024-12-31T23:59:59.000Z"
 *         notes:
 *           type: string
 *           description: 备注信息
 *           example: "更新角色有效期"
*     
 *     RoleAssignmentRequest:
 *       type: object
 *       required:
 *         - roleIds
 *       properties:
 *         roleIds:
 *           type: array
 *           items:
 *             type: integer
 *           description: 角色ID数组
 *           example: [1, 2, 3]
*     
 *     SetPrimaryRoleRequest:
 *       type: object
 *       required:
 *         - roleId
 *       properties:
 *         roleId:
 *           type: integer
 *           description: 设置为主要角色的角色ID
 *           example: 1
*     
 *     UpdateRoleValidityRequest:
 *       type: object
 *       properties:
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效开始时间
 *           example: "2023-01-01T00:00:00.000Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 角色生效结束时间
 *           example: "2024-12-31T23:59:59.000Z"
*   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

// ===== 标准REST API路径 (用于测试脚本) =====

/**
* @swagger
 * /api/user-role:
 *   get:
 *     summary: 获取用户角色关联列表
 *     description: 获取所有用户角色关联记录的详细信息，包括用户信息、角色信息及关联状态
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户角色关联列表
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
 *                   example: "获取用户角色关联列表成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserRole'
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       500:
 *         description: 服务器内部错误
*/
router.get('/', checkPermission('USER_ROLE_MANAGE'), async (req, res, next) => {
  try {
    // 获取租户数据库名称（共享连接池模式）
    const tenantDb = getTenantDatabaseName(req);

    const [userRoles] = await sequelize.query(`
      SELECT
        ur.id,
        ur.user_id as userId,
        ur.role_id as roleId,
        ur.is_primary as isPrimary,
        ur.start_time as startTime,
        ur.end_time as endTime,
        ur.grantor_id as grantorId,
        ur.created_at as createdAt,
        ur.updated_at as updatedAt,
        u.username,
        u.real_name as realName,
        r.name as roleName,
        r.code as roleCode,
        r.description as roleDescription
      FROM ${tenantDb}.user_roles ur
      LEFT JOIN ${tenantDb}.users u ON ur.user_id = u.id
      LEFT JOIN ${tenantDb}.roles r ON ur.role_id = r.id
      WHERE ur.deleted_at IS NULL
      ORDER BY ur.created_at DESC
    `);

    ApiResponse.success(res, userRoles, '获取用户角色关联列表成功');
  } catch (error) {
    console.error('[USER]: 获取用户角色关联列表错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/user-role:
 *   post:
 *     summary: 创建用户角色关联
 *     description: 为指定用户分配角色，建立用户与角色之间的关联关系
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRoleRequest'
 *     responses:
 *       201:
 *         description: 成功创建用户角色关联
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
 *                   example: "创建用户角色关联成功"
 *                 data:
 *                   $ref: '#/components/schemas/UserRole'
 *       400:
 *         description: 请求参数错误
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
 *                   examples:
 *                     missing_params:
 *                       value: "用户ID和角色ID不能为空"
 *                     existing_relation:
 *                       value: "该用户角色关联已存在"
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       404:
 *         description: 资源不存在
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
 *                   examples:
 *                     user_not_found:
 *                       value: "用户不存在或已被禁用"
 *                     role_not_found:
 *                       value: "角色不存在"
 *       500:
 *         description: 服务器内部错误
*/
router.post('/', checkPermission('USER_ROLE_MANAGE'), async (req, res, next) => {
  try {
    const tenantDb = getTenantDatabaseName(req);
    const { userId, roleId, assignedBy, notes } = req.body;
    
    if (!userId || !roleId) {
      throw ApiError.badRequest('用户ID和角色ID不能为空');
    }

    // 检查用户是否存在
    const [users] = await sequelize.query(`SELECT id FROM ${tenantDb}.users WHERE id = ? AND status = "active"`, {
      replacements: [userId]
    });
    if (!users || users.length === 0) {
      throw ApiError.notFound('用户不存在或已被禁用');
    }

    // 检查角色是否存在
    const [roles] = await sequelize.query(`SELECT id FROM ${tenantDb}.roles WHERE id = ? AND status = 1`, {
      replacements: [roleId]
    });
    if (!roles || roles.length === 0) {
      throw ApiError.notFound('角色不存在');
    }

    // 检查是否已存在该关联
    const [existing] = await sequelize.query(
      `SELECT id FROM ${tenantDb}.user_roles WHERE user_id = ? AND role_id = ? AND deleted_at IS NULL`,
      { replacements: [userId, roleId] }
    );

    if (existing && existing.length > 0) {
      throw ApiError.badRequest('该用户角色关联已存在');
    }

    // 确保grantorId有值
    const grantorId = assignedBy || (req.user as any)?.id || 1;

    // 创建用户角色关联
    await sequelize.query(`
      INSERT INTO ${tenantDb}.user_roles (user_id, role_id, grantor_id, is_primary, start_time, created_at, updated_at)
      VALUES (?, ?, ?, 0, NOW(), NOW(), NOW())
    `, {
      replacements: [userId, roleId, grantorId]
    });

    // 获取刚创建的记录（通过用户ID和角色ID查找最新的记录）
    const [newUserRole] = await sequelize.query(`
      SELECT
        ur.id,
        ur.user_id as userId,
        ur.role_id as roleId,
        ur.is_primary as isPrimary,
        ur.start_time as startTime,
        ur.end_time as endTime,
        ur.grantor_id as grantorId,
        ur.created_at as createdAt,
        ur.updated_at as updatedAt
      FROM ${tenantDb}.user_roles ur
      WHERE ur.user_id = ? AND ur.role_id = ? AND ur.deleted_at IS NULL
      ORDER BY ur.created_at DESC
      LIMIT 1
    `, {
      replacements: [userId, roleId]
    });

    ApiResponse.success(res, newUserRole[0], '创建用户角色关联成功', 201);
  } catch (error) {
    console.error('[USER]: 创建用户角色关联错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/user-role/{id}:
 *   get:
 *     summary: 获取用户角色关联详情
 *     description: 根据用户角色关联ID获取特定用户角色关联的详细信息
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户角色关联ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功获取用户角色关联详情
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
 *                   example: "获取用户角色关联详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/UserRole'
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       404:
 *         description: 用户角色关联不存在
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
 *                   example: "用户角色关联不存在"
 *       500:
 *         description: 服务器内部错误
*/
router.get('/:id', checkPermission('USER_ROLE_MANAGE'), async (req, res, next) => {
  try {
    const tenantDb = getTenantDatabaseName(req);
    const { id } = req.params;

    const [userRoles] = await sequelize.query(`
      SELECT 
        ur.id,
        ur.user_id as userId,
        ur.role_id as roleId,
        ur.is_primary as isPrimary,
        ur.start_time as startTime,
        ur.end_time as endTime,
        ur.grantor_id as grantorId,
        ur.created_at as createdAt,
        ur.updated_at as updatedAt,
        u.username,
        u.real_name as realName,
        r.name as roleName,
        r.code as roleCode,
        r.description as roleDescription
      FROM ${tenantDb}.user_roles ur
      LEFT JOIN ${tenantDb}.users u ON ur.user_id = u.id
      LEFT JOIN ${tenantDb}.roles r ON ur.role_id = r.id
      WHERE ur.id = ? AND ur.deleted_at IS NULL
    `, {
      replacements: [id]
    });

    if (!userRoles || userRoles.length === 0) {
      throw ApiError.notFound('用户角色关联不存在');
    }

    ApiResponse.success(res, userRoles[0], '获取用户角色关联详情成功');
  } catch (error) {
    console.error('[USER]: 获取用户角色关联详情错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/user-role/{id}:
 *   put:
 *     summary: 更新用户角色关联
 *     description: 更新指定用户角色关联的配置，如主要角色状态、生效时间等
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户角色关联ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRoleRequest'
 *     responses:
 *       200:
 *         description: 成功更新用户角色关联
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
 *                   example: "更新用户角色关联成功"
 *                 data:
 *                   $ref: '#/components/schemas/UserRole'
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       404:
 *         description: 用户角色关联不存在
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
 *                   example: "用户角色关联不存在"
 *       500:
 *         description: 服务器内部错误
*/
router.put('/:id', checkPermission('USER_ROLE_MANAGE'), async (req, res, next) => {
  try {
    const tenantDb = getTenantDatabaseName(req);
    const { id } = req.params;
    const { isPrimary, startTime, endTime, notes } = req.body;

    // 检查记录是否存在
    const [existing] = await sequelize.query(
      `SELECT id FROM ${tenantDb}.user_roles WHERE id = ? AND deleted_at IS NULL`,
      { replacements: [id] }
    );
    
    if (!existing || existing.length === 0) {
      throw ApiError.notFound('用户角色关联不存在');
    }

    // 构建更新SQL
    const updateFields = [];
    const replacements = [];
    
    if (isPrimary !== undefined) {
      updateFields.push('is_primary = ?');
      replacements.push(isPrimary);
    }
    
    if (startTime) {
      updateFields.push('start_time = ?');
      replacements.push(new Date(startTime));
    }
    
    if (endTime) {
      updateFields.push('end_time = ?');
      replacements.push(new Date(endTime));
    }
    
    updateFields.push('updated_at = NOW()');
    replacements.push(id);

    await sequelize.query(`
      UPDATE ${tenantDb}.user_roles
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `, {
      replacements
    });

    // 获取更新后的记录
    const [updatedUserRole] = await sequelize.query(`
      SELECT
        ur.id,
        ur.user_id as userId,
        ur.role_id as roleId,
        ur.is_primary as isPrimary,
        ur.start_time as startTime,
        ur.end_time as endTime,
        ur.grantor_id as grantorId,
        ur.created_at as createdAt,
        ur.updated_at as updatedAt
      FROM ${tenantDb}.user_roles ur
      WHERE ur.id = ?
    `, {
      replacements: [id]
    });

    ApiResponse.success(res, updatedUserRole[0], '更新用户角色关联成功');
  } catch (error) {
    console.error('[USER]: 更新用户角色关联错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/user-role/by-user/{userId}:
 *   get:
 *     summary: 按用户获取角色关联
 *     description: 获取指定用户的所有角色关联记录，按主要角色优先排序
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     responses:
 *       200:
 *         description: 成功获取用户角色关联
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
 *                   example: "获取用户角色关联成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserRole'
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       500:
 *         description: 服务器内部错误
*/
router.get('/by-user/:userId', checkPermission('USER_ROLE_MANAGE'), async (req, res, next) => {
  try {
    const tenantDb = getTenantDatabaseName(req);
    const { userId } = req.params;

    const [userRoles] = await sequelize.query(`
      SELECT 
        ur.id,
        ur.user_id as userId,
        ur.role_id as roleId,
        ur.is_primary as isPrimary,
        ur.start_time as startTime,
        ur.end_time as endTime,
        ur.grantor_id as grantorId,
        ur.created_at as createdAt,
        ur.updated_at as updatedAt,
        r.name as roleName,
        r.code as roleCode,
        r.description as roleDescription
      FROM ${tenantDb}.user_roles ur
      LEFT JOIN ${tenantDb}.roles r ON ur.role_id = r.id
      WHERE ur.user_id = ? AND ur.deleted_at IS NULL
      ORDER BY ur.is_primary DESC, ur.created_at DESC
    `, {
      replacements: [userId]
    });

    ApiResponse.success(res, userRoles, '获取用户角色关联成功');
  } catch (error) {
    console.error('[USER]: 按用户获取角色关联错误:', error);
    ApiResponse.handleError(res, error);
  }
});

/**
* @swagger
 * /api/user-role/{id}:
 *   delete:
 *     summary: 删除用户角色关联
 *     description: 软删除指定的用户角色关联记录，操作具有幂等性
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户角色关联ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 成功删除用户角色关联
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
 *                   example: "删除用户角色关联成功"
 *                 data:
 *                   type: null
 *                   example: null
 *       401:
 *         description: 未授权 - 缺少或无效的访问令牌
 *       403:
 *         description: 权限不足 - 需要USER_ROLE_MANAGE权限
 *       500:
 *         description: 服务器内部错误
*/
router.delete('/:id', checkPermission('USER_ROLE_MANAGE'), async (req, res, next) => {
  try {
    const tenantDb = getTenantDatabaseName(req);
    const { id } = req.params;

    // 软删除用户角色关联
    const [result] = await sequelize.query(`
      UPDATE ${tenantDb}.user_roles
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ? AND deleted_at IS NULL
    `, {
      replacements: [id]
    });

    // 删除不存在的记录也返回成功（幂等性）
    ApiResponse.success(res, null, '删除用户角色关联成功');
  } catch (error) {
    console.error('[USER]: 删除用户角色关联错误:', error);
    ApiResponse.handleError(res, error);
  }
});

// ===== 嵌套路径 (保留现有功能) =====

/**
* @swagger
 * /api/user-role/users/{userId}/roles:
 *   post:
 *     summary: 为用户分配角色
 *     description: 批量为指定用户分配多个角色
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleAssignmentRequest'
 *     responses:
 *       200:
 *         description: 成功为用户分配角色
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
 *                   example: "角色分配成功"
 *                 data:
 *                   type: object
 *                   description: 分配结果详情
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
*/
router.post(
  '/users/:userId/roles',
  validateRequest(roleIdsSchema),
  userRoleController.assignRolesToUser,
  invalidateUserRoleCache  // 分配角色后清除用户缓存
);

/**
* @swagger
 * /api/user-role/users/{userId}/roles:
 *   delete:
 *     summary: 移除用户的角色
 *     description: 批量移除指定用户的多个角色
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoleAssignmentRequest'
 *     responses:
 *       200:
 *         description: 成功移除用户角色
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
 *                   example: "角色移除成功"
 *                 data:
 *                   type: object
 *                   description: 移除结果详情
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
*/
router.delete(
  '/users/:userId/roles',
  validateRequest(roleIdsSchema),
  userRoleController.removeRolesFromUser,
  invalidateUserRoleCache  // 移除角色后清除用户缓存
);

/**
* @swagger
 * /api/user-role/users/{userId}/roles:
 *   get:
 *     summary: 获取用户的所有角色
 *     description: 获取指定用户的所有角色信息，包括角色详情和权限列表
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     responses:
 *       200:
 *         description: 成功获取用户角色列表
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
 *                   example: "获取用户角色成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 用户角色详情，包含角色信息和权限列表
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
*/
router.get(
  '/users/:userId/roles',
  userRoleController.getUserRoles
);

/**
* @swagger
 * /api/user-role/users/{userId}/primary-role:
 *   put:
 *     summary: 设置用户主要角色
 *     description: 设置指定用户的主要角色，同时取消其他角色的主要状态
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SetPrimaryRoleRequest'
 *     responses:
 *       200:
 *         description: 成功设置用户主要角色
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
 *                   example: "设置主要角色成功"
 *                 data:
 *                   type: object
 *                   description: 更新后的用户角色信息
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户或角色不存在
 *       500:
 *         description: 服务器内部错误
*/
router.put(
  '/users/:userId/primary-role',
  validateRequest(primaryRoleSchema),
  userRoleController.setPrimaryRole
);

/**
* @swagger
 * /api/user-role/users/{userId}/roles/{roleId}/validity:
 *   put:
 *     summary: 更新用户角色有效期
 *     description: 更新指定用户特定角色的生效时间和失效时间
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 角色ID
 *         example: 456
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateRoleValidityRequest'
 *     responses:
 *       200:
 *         description: 成功更新角色有效期
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
 *                   example: "更新角色有效期成功"
 *                 data:
 *                   type: object
 *                   description: 更新后的用户角色关联信息
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户角色关联不存在
 *       500:
 *         description: 服务器内部错误
*/
router.put(
  '/users/:userId/roles/:roleId/validity',
  validateRequest(roleValiditySchema),
  userRoleController.updateRoleValidity
);

/**
* @swagger
 * /api/user-role/users/{userId}/role-history:
 *   get:
 *     summary: 获取用户角色分配记录
 *     description: 获取指定用户的角色分配历史记录，包括分配时间、操作人等信息
 *     tags: [用户角色关联]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *         example: 123
 *     responses:
 *       200:
 *         description: 成功获取用户角色分配记录
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
 *                   example: "获取角色分配记录成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 用户角色分配历史记录，包含操作时间、操作人、角色变更等信息
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
 *       500:
 *         description: 服务器内部错误
*/
router.get(
  '/users/:userId/role-history',
  userRoleController.getUserRoleHistory
);

export default router; 