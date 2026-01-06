import { Router, Response, Request } from 'express';
import userController from '../controllers/user.controller';
import { getUsers } from '../controllers/user-simple.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { requireAdmin } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import { createUserSchema, updateUserSchema, changePasswordSchema } from '../validations/user.validation';
import { invalidateUserCache } from '../middlewares/cache-invalidation.middleware';
import { RequestWithUser } from '../types/express';


const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户ID
 *         username:
 *           type: string
 *           description: 用户名
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *         phone:
 *           type: string
 *           description: 手机号码
 *         name:
 *           type: string
 *           description: 真实姓名
 *         role:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *           description: 用户角色
 *         status:
 *           type: string
 *           enum: [active, inactive, locked]
 *           description: 用户状态
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     CreateUserRequest:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *         - name
 *         - role
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *           description: 用户名
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *         password:
 *           type: string
 *           minLength: 6
 *           description: 密码
 *         phone:
 *           type: string
 *           description: 手机号码
 *         name:
 *           type: string
 *           description: 真实姓名
 *         role:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *           description: 用户角色
 *     UpdateUserRequest:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *           description: 用户名
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *         phone:
 *           type: string
 *           description: 手机号码
 *         name:
 *           type: string
 *           description: 真实姓名
 *         role:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *           description: 用户角色
 *     UpdateStatusRequest:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           oneOf:
 *             - type: string
 *               enum: [active, inactive, locked]
 *             - type: integer
 *               enum: [0, 1]
 *               description: 0=inactive, 1=active
 *           description: 用户状态
 *         reason:
 *           type: string
 *           description: 状态变更原因
 *     ChangePasswordRequest:
 *       type: object
 *       required:
 *         - currentPassword
 *         - newPassword
 *       properties:
 *         currentPassword:
 *           type: string
 *           description: 当前密码
 *         newPassword:
 *           type: string
 *           minLength: 6
 *           description: 新密码
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
* @swagger
 * /api/users:
 *   post:
 *     tags: [用户管理]
 *     summary: 创建用户
 *     description: 管理员创建新用户账户
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserRequest'
 *     responses:
 *       201:
 *         description: 用户创建成功
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
 *                   example: 用户创建成功
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足，需要管理员权限
 *       409:
 *         description: 用户名或邮箱已存在
*/
router.post(
  '/',
  requireAdmin,
  validateRequest(createUserSchema),
  userController.createUser,
  invalidateUserCache  // 创建用户后清除缓存
);

/**
* @swagger
 * /api/users:
 *   get:
 *     tags: [用户管理]
 *     summary: 获取用户列表
 *     description: 获取系统中的所有用户列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 每页数量
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *         description: 按角色筛选
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, locked]
 *         description: 按状态筛选
 *     responses:
 *       200:
 *         description: 用户列表获取成功
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
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: 未授权访问
*/
router.get(
  '/',
  getUsers
);

/**
* @swagger
 * /api/users/me:
 *   get:
 *     tags: [用户管理]
 *     summary: 获取当前登录用户信息
 *     description: 获取当前登录用户的详细信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户信息获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权访问
*/
router.get(
  '/me',
  (req, res) => {
    // 认证中间件已将用户信息附加到req对象
    // 直接返回req.user
    const userReq = req as RequestWithUser;
    res.json({
      success: true,
      data: userReq.user
    });
  }
);

/**
* @swagger
 * /api/users/profile:
 *   get:
 *     tags: [用户管理]
 *     summary: 获取用户资料
 *     description: 获取当前用户的详细资料信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 用户资料获取成功
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
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *                     profile:
 *                       type: object
 *                       description: 用户扩展资料
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 用户不存在
*/
router.get(
  '/profile',
  userController.getUserProfile
);

/**
* @swagger
 * /api/users/{id}/status:
 *   patch:
 *     tags: [用户管理]
 *     summary: 更新用户状态
 *     description: 管理员更新指定用户的状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStatusRequest'
 *     responses:
 *       200:
 *         description: 用户状态更新成功
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
 *                   example: 用户状态更新成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 用户ID
 *                     status:
 *                       type: string
 *                       description: 更新后的状态
 *                     reason:
 *                       type: string
 *                       description: 状态变更原因
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足，需要管理员权限
 *       404:
 *         description: 用户不存在
*/
router.patch(
  '/:id/status',
  requireAdmin,
  async (req, res, next) => {
    try {
      const tenantDb = (req.user as any)?.tenantCode || 'tenant_dev';
      const { id } = req.params;
      const { status, reason } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          message: '状态参数不能为空'
        });
      }

      // 验证状态值（支持数字和字符串格式）
      let statusValue = status;
      if (typeof status === 'number') {
        // 数字格式：0=inactive, 1=active
        if (status === 0) statusValue = 'inactive';
        else if (status === 1) statusValue = 'active';
        else {
          return res.status(400).json({
            success: false,
            message: '无效的状态值，数字格式只支持0或1'
          });
        }
      } else {
        // 字符串格式验证
        const validStatuses = ['active', 'inactive', 'locked'];
        if (!validStatuses.includes(status)) {
          return res.status(400).json({
            success: false,
            message: '无效的状态值'
          });
        }
        statusValue = status;
      }

      const { sequelize } = require('../init');
      
      // 检查用户是否存在
      const [userResults] = await sequelize.query(
        `SELECT id FROM ${tenantDb}.users WHERE id = :id`,
        {
          replacements: { id },
          type: sequelize.QueryTypes.SELECT
        }
      ) as [Record<string, any>[]];

      if (!userResults || userResults.length === 0) {
        return res.status(404).json({
          success: false,
          message: '用户不存在'
        });
      }

      // 更新用户状态
      await sequelize.query(
        `UPDATE ${tenantDb}.users SET status = :status, updated_at = NOW() WHERE id = :id`,
        {
          replacements: { status: statusValue, id },
          type: sequelize.QueryTypes.UPDATE
        }
      );

      res.json({
        success: true,
        message: '用户状态更新成功',
        data: { id: parseInt(id), status: statusValue, reason }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
* @swagger
 * /api/users/{id}/change-password:
 *   post:
 *     tags: [用户管理]
 *     summary: 修改用户密码
 *     description: 修改指定用户的密码
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangePasswordRequest'
 *     responses:
 *       200:
 *         description: 密码修改成功
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
 *                   example: 密码修改成功
 *       400:
 *         description: 请求参数错误或当前密码不正确
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 用户不存在
*/
router.post(
  '/:id/change-password',
  validateRequest(changePasswordSchema),
  userController.changePassword
);

/**
* @swagger
 * /api/users/{id}:
 *   get:
 *     tags: [用户管理]
 *     summary: 获取用户详情
 *     description: 根据用户ID获取用户详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 用户详情获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 用户不存在
*/
router.get(
  '/:id',
  userController.getUserById
);

/**
* @swagger
 * /api/users/{id}:
 *   put:
 *     tags: [用户管理]
 *     summary: 更新用户信息
 *     description: 管理员更新指定用户的信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserRequest'
 *     responses:
 *       200:
 *         description: 用户信息更新成功
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
 *                   example: 用户信息更新成功
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足，需要管理员权限
 *       404:
 *         description: 用户不存在
 *       409:
 *         description: 用户名或邮箱已存在
*/
router.put(
  '/:id',
  requireAdmin,
  validateRequest(updateUserSchema),
  userController.updateUser,
  invalidateUserCache  // 更新用户后清除缓存
);

/**
* @swagger
 * /api/users/{id}:
 *   delete:
 *     tags: [用户管理]
 *     summary: 删除用户
 *     description: 管理员删除指定用户账户
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 用户删除成功
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
 *                   example: 用户删除成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足，需要管理员权限
 *       404:
 *         description: 用户不存在
 *       409:
 *         description: 用户有关联数据，无法删除
*/
router.delete(
  '/:id',
  requireAdmin,
  userController.deleteUser,
  invalidateUserCache  // 删除用户后清除缓存
);

export default router; 
