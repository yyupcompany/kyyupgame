import { Router } from 'express';
import { permissionController } from '../controllers/permission.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { asyncHandler, safeController } from '../middlewares/async-handler';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         id:
 *           type: integer
 *           description: 权限ID
 *         code:
 *           type: string
 *           description: 权限代码，唯一标识
 *           example: "user:create"
 *         name:
 *           type: string
 *           description: 权限名称
 *           example: "创建用户"
 *         type:
 *           type: string
 *           default: "menu"
 *           description: 权限类型
 *           example: "menu"
 *         path:
 *           type: string
 *           description: 权限路径
 *           example: "/users/create"
 *         component:
 *           type: string
 *           nullable: true
 *           description: 组件路径
 *           example: "UserCreate.vue"
 *         icon:
 *           type: string
 *           nullable: true
 *           description: 图标
 *           example: "user-plus"
 *         parentId:
 *           type: integer
 *           nullable: true
 *           description: 父权限ID
 *         sort:
 *           type: integer
 *           default: 0
 *           description: 排序
 *         status:
 *           type: integer
 *           description: 状态（1：启用，0：禁用）
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
*
 *     UserPage:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 页面权限ID
 *         name:
 *           type: string
 *           description: 页面名称
 *         code:
 *           type: string
 *           description: 页面代码
 *         path:
 *           type: string
 *           description: 页面路径
 *         icon:
 *           type: string
 *           description: 页面图标
*
 *     CreatePermissionRequest:
 *       type: object
 *       required:
 *         - code
 *         - name
 *       properties:
 *         code:
 *           type: string
 *           description: 权限代码，唯一标识
 *           example: "user:create"
 *         name:
 *           type: string
 *           description: 权限名称
 *           example: "创建用户"
 *         type:
 *           type: string
 *           default: "menu"
 *           description: 权限类型
 *         path:
 *           type: string
 *           description: 权限路径
 *         component:
 *           type: string
 *           description: 组件路径
 *         icon:
 *           type: string
 *           description: 图标
 *         parentId:
 *           type: integer
 *           description: 父权限ID
 *         sort:
 *           type: integer
 *           default: 0
 *           description: 排序
*
 *     UpdatePermissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: 权限名称
 *         type:
 *           type: string
 *           description: 权限类型
 *         path:
 *           type: string
 *           description: 权限路径
 *         component:
 *           type: string
 *           description: 组件路径
 *         icon:
 *           type: string
 *           description: 图标
 *         parentId:
 *           type: integer
 *           description: 父权限ID
 *         sort:
 *           type: integer
 *           description: 排序
 *         status:
 *           type: integer
 *           description: 状态（1：启用，0：禁用）
*
 *     CheckPageRequest:
 *       type: object
 *       properties:
 *         pagePath:
 *           type: string
 *           description: 页面路径
 *           example: "/dashboard"
*
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*
 * tags:
 *   - name: Permissions
 *     description: 权限管理
*/

/**
* @swagger
 * /api/permissions:
 *   get:
 *     summary: 获取所有页面权限列表
 *     description: 管理员获取系统中所有权限的列表
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取权限列表
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
 *                     $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: "获取权限列表成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.get('/', requireAdmin, safeController(permissionController, 'getPagePermissions'));

/**
* @swagger
 * /api/permissions:
 *   post:
 *     summary: 创建新权限
 *     description: 管理员创建新的系统权限
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePermissionRequest'
 *     responses:
 *       201:
 *         description: 权限创建成功
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
 *                   example: "权限创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *       400:
 *         description: 请求参数错误或权限代码已存在
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
 *                   example: "权限代码和名称不能为空"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.post('/', requireAdmin, asyncHandler(async (req, res, next) => {
  try {
    const { code, name, type, path, component, icon, parentId, sort } = req.body;
    
    if (!code || !name) {
      return res.status(400).json({
        success: false,
        message: '权限代码和名称不能为空'
      });
    }

    const { sequelize } = require('../init');
    
    // 检查权限代码是否已存在
    const [existingResults] = await sequelize.query(
      'SELECT id FROM permissions WHERE code = :code',
      {
        replacements: { code },
        type: sequelize.QueryTypes.SELECT
      }
    ) as [Record<string, any>[]];

    if (existingResults && existingResults.length > 0) {
      return res.status(400).json({
        success: false,
        message: '权限代码已存在'
      });
    }

    // 创建权限
    const insertResult = await sequelize.query(
      `INSERT INTO permissions (code, name, type, path, component, icon, parent_id, sort, status, created_at, updated_at) 
       VALUES (:code, :name, :type, :path, :component, :icon, :parentId, :sort, 1, NOW(), NOW())`,
      {
        replacements: { 
          code, 
          name, 
          type: type || 'menu',
          path: path || '/',
          component: component || null,
          icon: icon || null,
          parentId: parentId || null,
          sort: sort || 0
        },
        type: sequelize.QueryTypes.INSERT
      }
    );

    // 获取插入的ID
    let insertId = null;
    if (insertResult && Array.isArray(insertResult) && insertResult.length > 0) {
      insertId = insertResult[0];
    }

    res.status(201).json({
      success: true,
      message: '权限创建成功',
      data: { 
        id: insertId,
        code, 
        name, 
        type: type || 'menu',
        path: path || '',
        component: component || null,
        icon: icon || null,
        parentId: parentId || null,
        sort: sort || 0,
        status: 1
      }
    });
  } catch (error) {
    next(error);
  }
}));

/**
* @swagger
 * /api/permissions/my-pages:
 *   get:
 *     summary: 获取当前用户可访问的页面列表
 *     description: 根据用户的角色权限，获取该用户可以访问的页面列表
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户页面权限
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
 *                     userId:
 *                       type: integer
 *                       description: 用户ID
 *                     pages:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserPage'
 *                 message:
 *                   type: string
 *                   example: "获取用户页面权限成功"
 *       401:
 *         description: 用户未登录
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
 *                   example: "用户未登录"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.get('/my-pages', async (req, res, next) => {
  try {
    const user = (req as any).user;
    
    if (!user || !user.id) {
      return res.status(401).json({
        success: false,
        message: '用户未登录'
      });
    }
    
    const { sequelize } = require('../init');
    
    // 查询用户可访问的页面
    const pageQuery = `
      SELECT DISTINCT p.id, p.name, p.code, p.path, p.icon
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = :userId AND p.status = 1
      ORDER BY p.id
    `;
    
    const pages = await sequelize.query(pageQuery, {
      replacements: { userId: user.id },
      type: sequelize.QueryTypes.SELECT
    });
    
    const pagesList = Array.isArray(pages) ? pages : [];
    
    res.json({
      success: true,
      data: {
        userId: user.id,
        pages: pagesList
      },
      message: '获取用户页面权限成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
* @swagger
 * /api/permissions/{id}:
 *   get:
 *     summary: 获取权限详情
 *     description: 根据权限ID获取权限的详细信息
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限ID
 *     responses:
 *       200:
 *         description: 成功获取权限详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: "获取权限详情成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 权限不存在
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
 *                   example: "权限不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.get('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sequelize } = require('../init');
    
    const [permissionResults] = await sequelize.query(
      'SELECT * FROM permissions WHERE id = :id',
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      }
    ) as [Record<string, any>[]];

    if (!permissionResults || permissionResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: '权限不存在'
      });
    }

    const permission = permissionResults[0];
    res.json({
      success: true,
      data: permission,
      message: '获取权限详情成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
* @swagger
 * /api/permissions/{id}:
 *   put:
 *     summary: 更新权限信息
 *     description: 根据权限ID更新权限的信息
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePermissionRequest'
 *     responses:
 *       200:
 *         description: 权限更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: "权限更新成功"
 *       400:
 *         description: 没有需要更新的字段
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
 *                   example: "没有需要更新的字段"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 权限不存在
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
 *                   example: "权限不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.put('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, type, path, component, icon, parentId, sort, status } = req.body;
    const { sequelize } = require('../init');
    
    // 检查权限是否存在
    const [existingResults] = await sequelize.query(
      'SELECT id FROM permissions WHERE id = :id',
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      }
    ) as [Record<string, any>[]];

    if (!existingResults || existingResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: '权限不存在'
      });
    }

    // 构建更新字段
    const updateFields: string[] = [];
    const updateValues: Record<string, any> = { id };

    if (name !== undefined) {
      updateFields.push('name = :name');
      updateValues.name = name;
    }
    if (type !== undefined) {
      updateFields.push('type = :type');
      updateValues.type = type;
    }
    if (path !== undefined) {
      updateFields.push('path = :path');
      updateValues.path = path;
    }
    if (component !== undefined) {
      updateFields.push('component = :component');
      updateValues.component = component;
    }
    if (icon !== undefined) {
      updateFields.push('icon = :icon');
      updateValues.icon = icon;
    }
    if (parentId !== undefined) {
      updateFields.push('parent_id = :parentId');
      updateValues.parentId = parentId;
    }
    if (sort !== undefined) {
      updateFields.push('sort = :sort');
      updateValues.sort = sort;
    }
    if (status !== undefined) {
      updateFields.push('status = :status');
      updateValues.status = status;
    }

    updateFields.push('updated_at = NOW()');

    if (updateFields.length === 1) {
      return res.status(400).json({
        success: false,
        message: '没有需要更新的字段'
      });
    }

    // 更新权限
    await sequelize.query(
      `UPDATE permissions SET ${updateFields.join(', ')} WHERE id = :id`,
      {
        replacements: updateValues,
        type: sequelize.QueryTypes.UPDATE
      }
    );

    // 获取更新后的权限
    const [updatedResults] = await sequelize.query(
      'SELECT * FROM permissions WHERE id = :id',
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      }
    ) as [Record<string, any>[]];

    if (!updatedResults || updatedResults.length === 0) {
      return res.status(500).json({
        success: false,
        message: '更新权限成功但无法查询到权限信息'
      });
    }

    const updatedPermission = updatedResults[0];
    res.json({
      success: true,
      data: updatedPermission,
      message: '权限更新成功'
    });
  } catch (error) {
    next(error);
  }
});

/**
* @swagger
 * /api/permissions/{id}:
 *   delete:
 *     summary: 删除权限
 *     description: 根据权限ID删除权限（只有在没有角色关联时才能删除）
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限ID
 *     responses:
 *       200:
 *         description: 权限删除成功
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
 *                   example: "权限删除成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 删除的权限ID
 *       400:
 *         description: 该权限已分配给角色，无法删除
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
 *                   example: "该权限已分配给角色，无法删除"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 权限不存在
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
 *                   example: "权限不存在"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.delete('/:id', requireAdmin, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { sequelize } = require('../init');
    
    // 检查权限是否存在
    const [existingResults] = await sequelize.query(
      'SELECT id FROM permissions WHERE id = :id',
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      }
    ) as [Record<string, any>[]];

    if (!existingResults || existingResults.length === 0) {
      return res.status(404).json({
        success: false,
        message: '权限不存在'
      });
    }

    // 检查是否有角色关联此权限
    const [rolePermissionResults] = await sequelize.query(
      'SELECT COUNT(*) as count FROM role_permissions WHERE permission_id = :id',
      {
        replacements: { id },
        type: sequelize.QueryTypes.SELECT
      }
    ) as [Record<string, any>[]];

    if (rolePermissionResults && rolePermissionResults[0] && rolePermissionResults[0].count > 0) {
      return res.status(400).json({
        success: false,
        message: '该权限已分配给角色，无法删除'
      });
    }

    // 删除权限
    await sequelize.query(
      'DELETE FROM permissions WHERE id = :id',
      {
        replacements: { id },
        type: sequelize.QueryTypes.DELETE
      }
    );

    res.json({
      success: true,
      message: '权限删除成功',
      data: { id: parseInt(id) }
    });
  } catch (error) {
    next(error);
  }
});

/**
* @swagger
 * /api/permissions/check/{pagePath}:
 *   get:
 *     summary: 检查用户是否可以访问指定页面
 *     description: 根据页面路径检查当前用户是否有访问权限
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: pagePath
 *         required: true
 *         schema:
 *           type: string
 *         description: 页面路径（如：dashboard）
 *         example: "dashboard"
 *     responses:
 *       200:
 *         description: 权限检查完成
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
 *                       description: 是否有权限访问
 *                     pagePath:
 *                       type: string
 *                       description: 页面路径
 *                     userId:
 *                       type: integer
 *                       description: 用户ID
 *                 message:
 *                   type: string
 *                   example: "页面权限检查成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.get('/check/:pagePath', permissionController.checkPageAccess.bind(permissionController));

/**
* @swagger
 * /api/permissions/check-page:
 *   post:
 *     summary: 检查页面权限（POST方式）
 *     description: 通过POST请求方式检查用户对指定页面的访问权限
 *     tags: [Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CheckPageRequest'
 *     responses:
 *       200:
 *         description: 页面权限检查成功
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
 *                   example: "页面权限检查成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasPermission:
 *                       type: boolean
 *                       example: true
 *                       description: 是否有权限访问
 *                     pagePath:
 *                       type: string
 *                       description: 页面路径
 *                     userId:
 *                       type: integer
 *                       description: 用户ID
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.post('/check-page', async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { pagePath } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: '用户未登录',
        data: { hasPermission: false }
      });
    }

    if (!pagePath) {
      return res.status(400).json({
        success: false,
        message: '页面路径不能为空',
        data: { hasPermission: false }
      });
    }

    // 🔧 修复：实际检查用户是否有权限访问该页面
    const { sequelize } = require('../init');
    const { QueryTypes } = require('sequelize');

    const checkQuery = `
      SELECT COUNT(*) as count
      FROM permissions p
      INNER JOIN role_permissions rp ON p.id = rp.permission_id
      INNER JOIN user_roles ur ON rp.role_id = ur.role_id
      WHERE ur.user_id = :userId AND p.path = :pagePath AND p.status = 1
    `;

    const [resultRows] = await sequelize.query(checkQuery, {
      replacements: { userId, pagePath },
      type: QueryTypes.SELECT
    }) as [Record<string, any>[]];

    const result = resultRows && resultRows.length > 0 ? resultRows[0] : { count: 0 };
    const hasPermission = result.count > 0;

    console.log(`[PERMISSION]: 🔐 页面权限检查: userId=${userId}, pagePath=${pagePath}, hasPermission=${hasPermission}`);

    res.json({
      success: true,
      message: hasPermission ? '用户有权限访问该页面' : '用户无权限访问该页面',
      data: {
        hasPermission,
        pagePath,
        userId
      }
    });
  } catch (error) {
    console.error('[PERMISSION]: ❌ 页面权限检查失败:', error);
    res.status(500).json({
      success: false,
      message: '页面权限检查失败',
      data: { hasPermission: false }
    });
  }
});

/**
* @swagger
 * /api/permissions/role/{roleId}:
 *   get:
 *     summary: 获取角色的页面权限
 *     description: 获取指定角色拥有的页面权限列表
 *     tags: [Permissions]
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
 *         description: 成功获取角色页面权限
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
 *                     roleId:
 *                       type: integer
 *                       description: 角色ID
 *                     permissions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Permission'
 *                 message:
 *                   type: string
 *                   example: "获取角色页面权限成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 角色不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.get('/role/:roleId', requireAdmin, permissionController.getRolePagePermissions.bind(permissionController));

/**
* @swagger
 * /api/permissions/role/{roleId}:
 *   put:
 *     summary: 更新角色的页面权限
 *     description: 更新指定角色的页面权限配置
 *     tags: [Permissions]
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
 *             type: object
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 权限ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 角色页面权限更新成功
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
 *                     roleId:
 *                       type: integer
 *                       description: 角色ID
 *                     updatedPermissions:
 *                       type: array
 *                       items:
 *                         type: integer
 *                       description: 更新后的权限ID列表
 *                 message:
 *                   type: string
 *                   example: "角色页面权限更新成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 角色不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.put('/role/:roleId', requireAdmin, permissionController.updateRolePagePermissions.bind(permissionController));

export default router; 