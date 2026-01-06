"use strict";
/**
 * 认证路由
 * @swagger
 * components:
 *   schemas:
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: 用户名或邮箱
 *           example: "admin"
 *         password:
 *           type: string
 *           format: password
 *           description: 用户密码
 *           example: "password123"
 *     LoginResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             token:
 *               type: string
 *               description: JWT访问令牌
 *               example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
 *             refreshToken:
 *               type: string
 *               description: 刷新令牌
 *               example: "refresh_token_here"
 *             user:
 *               $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *           example: "登录成功"
 *     RefreshTokenRequest:
 *       type: object
 *       required:
 *         - refreshToken
 *       properties:
 *         refreshToken:
 *           type: string
 *           description: 刷新令牌
 *           example: "refresh_token_here"
 *     TokenVerificationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             valid:
 *               type: boolean
 *               example: true
 *             user:
 *               $ref: '#/components/schemas/User'
 *         message:
 *           type: string
 *           example: "令牌验证成功"
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 用户ID
 *           example: 1
 *         username:
 *           type: string
 *           description: 用户名
 *           example: "admin"
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *           example: "admin@example.com"
 *         role:
 *           type: string
 *           description: 用户角色
 *           enum: [admin, teacher, parent]
 *           example: "admin"
 *         status:
 *           type: string
 *           description: 用户状态
 *           enum: [active, inactive]
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
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var auth_controller_1 = __importDefault(require("../controllers/auth.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var security_middleware_1 = require("../middlewares/security.middleware");
var router = (0, express_1.Router)();
// 应用安全中间件到所有路由
router.use(security_middleware_1.securityHeaders);
router.use(security_middleware_1.requestSizeLimit);
router.use(security_middleware_1.sqlInjectionProtection);
// router.use(apiLimiter as any); // 临时禁用用于测试
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 用户登录
 *     description: 使用用户名和密码进行身份验证，成功后返回JWT访问令牌和刷新令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             admin_login:
 *               summary: 管理员登录示例
 *               value:
 *                 username: "admin"
 *                 password: "password123"
 *             teacher_login:
 *               summary: 教师登录示例
 *               value:
 *                 username: "teacher@example.com"
 *                 password: "teacher123"
 *     responses:
 *       200:
 *         description: 登录成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
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
 *                   example: "用户名和密码不能为空"
 *       401:
 *         description: 认证失败
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
 *                   example: "用户名或密码错误"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "登录失败，服务器错误"
 */
router.post.apply(router, __spreadArray(__spreadArray(['/login'], security_middleware_1.loginValidation, false), [auth_controller_1["default"].login], false)); // 临时禁用速率限制用于测试
/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 用户登出
 *     description: 用户登出，使当前JWT令牌失效
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
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
 *                   example: "登出成功"
 *       401:
 *         description: 未授权访问
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
 *                   example: "未提供有效的认证令牌"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "登出失败，服务器错误"
 */
router.post('/logout', auth_middleware_1.verifyToken, auth_controller_1["default"].logout);
/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 用户注册
 *     description: 注册新用户账户
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *                 description: 用户名
 *                 example: "newuser"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *                 example: "newuser@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 description: 密码
 *                 example: "password123"
 *               role:
 *                 type: string
 *                 enum: [admin, teacher, parent]
 *                 description: 用户角色
 *                 example: "teacher"
 *     responses:
 *       201:
 *         description: 注册成功
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
 *                   example: "注册成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 用户ID
 *                     username:
 *                       type: string
 *                       description: 用户名
 *                     email:
 *                       type: string
 *                       description: 邮箱
 *                     role:
 *                       type: string
 *                       description: 角色
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
 *                   example: "用户名已存在"
 *       500:
 *         description: 服务器内部错误
 */
router.post('/register', /* loginLimiter as any, */ function (req, res) {
    var _a = req.body, username = _a.username, email = _a.email, password = _a.password, role = _a.role;
    // 简单验证
    if (!username || !email || !password || !role) {
        return res.status(400).json({
            success: false,
            message: '所有字段都是必需的'
        });
    }
    if (password.length < 6) {
        return res.status(400).json({
            success: false,
            message: '密码至少需要6个字符'
        });
    }
    // 模拟注册成功
    res.status(201).json({
        success: true,
        message: '注册成功',
        data: {
            id: Math.floor(Math.random() * 1000) + 1,
            username: username,
            email: email,
            role: role,
            status: 'active',
            createdAt: new Date().toISOString()
        }
    });
});
/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: 刷新访问令牌
 *     description: 使用刷新令牌获取新的访问令牌
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenRequest'
 *           example:
 *             refreshToken: "refresh_token_here"
 *     responses:
 *       200:
 *         description: 令牌刷新成功
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
 *                     token:
 *                       type: string
 *                       description: 新的JWT访问令牌
 *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
 *                     refreshToken:
 *                       type: string
 *                       description: 新的刷新令牌
 *                       example: "new_refresh_token_here"
 *                 message:
 *                   type: string
 *                   example: "令牌刷新成功"
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
 *                   example: "刷新令牌不能为空"
 *       401:
 *         description: 刷新令牌无效或已过期
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
 *                   example: "刷新令牌无效或已过期"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "令牌刷新失败，服务器错误"
 */
router.post('/refresh-token', auth_controller_1["default"].refreshToken);
/**
 * @swagger
 * /api/auth/verify-token:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: 验证访问令牌
 *     description: 验证当前JWT访问令牌的有效性
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 令牌验证成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenVerificationResponse'
 *       401:
 *         description: 令牌无效或已过期
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
 *                   example: "令牌无效或已过期"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "令牌验证失败，服务器错误"
 */
router.get('/verify-token', auth_middleware_1.verifyToken, auth_controller_1["default"].verifyTokenEndpoint);
/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: 验证访问令牌 (别名)
 *     description: 验证当前JWT访问令牌的有效性 (兼容前端测试)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 令牌验证成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenVerificationResponse'
 *       401:
 *         description: 令牌无效或已过期
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
 *                   example: "令牌无效或已过期"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "令牌验证失败，服务器错误"
 */
router.get('/verify', auth_middleware_1.verifyToken, auth_controller_1["default"].verifyTokenEndpoint);
/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: 获取当前用户信息
 *     description: 获取当前已认证用户的详细信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户信息
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
 *                 message:
 *                   type: string
 *                   example: "获取用户信息成功"
 *       401:
 *         description: 未授权访问
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
 *                   example: "未提供有效的认证令牌"
 *       404:
 *         description: 用户不存在
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
 *                   example: "用户不存在"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "获取用户信息失败，服务器错误"
 */
router.get('/me', auth_middleware_1.verifyToken, auth_controller_1["default"].getCurrentUser);
/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: 获取当前用户资料 (别名)
 *     description: 获取当前已认证用户的详细资料 (兼容前端调用)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户资料
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
 *                 message:
 *                   type: string
 *                   example: "获取用户资料成功"
 *       401:
 *         description: 未授权访问
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
 *                   example: "未提供有效的认证令牌"
 *       404:
 *         description: 用户不存在
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
 *                   example: "用户不存在"
 *       500:
 *         description: 服务器内部错误
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
 *                   example: "获取用户资料失败，服务器错误"
 */
router.get('/profile', auth_middleware_1.verifyToken, auth_controller_1["default"].getCurrentUser);
/**
 * @swagger
 * /api/auth/menu:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: 获取用户菜单权限
 *     description: 根据用户角色获取可访问的菜单项和权限信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取菜单权限
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
 *                     menuItems:
 *                       type: array
 *                       description: 菜单项列表
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: 菜单项ID
 *                           title:
 *                             type: string
 *                             description: 菜单标题
 *                           path:
 *                             type: string
 *                             description: 菜单路径
 *                           icon:
 *                             type: string
 *                             description: 菜单图标
 *                           visible:
 *                             type: boolean
 *                             description: 是否可见
 *                           children:
 *                             type: array
 *                             description: 子菜单项
 *                     permissions:
 *                       type: object
 *                       properties:
 *                         isAdmin:
 *                           type: boolean
 *                           description: 是否为管理员
 *                         role:
 *                           type: string
 *                           description: 用户角色代码
 *                         roleName:
 *                           type: string
 *                           description: 用户角色名称
 *                 message:
 *                   type: string
 *                   example: "获取菜单权限成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/menu', auth_middleware_1.verifyToken, auth_controller_1["default"].getUserMenu);
/**
 * @swagger
 * /api/auth/roles:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: 获取用户角色信息
 *     description: 获取当前用户的角色信息和权限详情
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取角色信息
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
 *                     roles:
 *                       type: array
 *                       description: 用户角色列表
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 角色ID
 *                           code:
 *                             type: string
 *                             description: 角色代码
 *                           name:
 *                             type: string
 *                             description: 角色名称
 *                           description:
 *                             type: string
 *                             description: 角色描述
 *                           permissions:
 *                             type: array
 *                             description: 角色权限列表
 *                     currentRole:
 *                       type: object
 *                       description: 当前主要角色
 *                     isAdmin:
 *                       type: boolean
 *                       description: 是否为管理员
 *                 message:
 *                   type: string
 *                   example: "获取角色信息成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/roles', auth_middleware_1.verifyToken, auth_controller_1["default"].getUserRoles);
exports["default"] = router;
