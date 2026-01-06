/**
 * 基础认证路由 - 统一租户认证集成版
*/

import { Router } from 'express';
import { verifyToken, authenticateWithUnifiedAuth } from '../middlewares/auth.middleware';
import authController from '../controllers/auth.controller';
// 注册功能已迁移到统一认证系统
// import authRegisterRoutes from './auth-register.routes';

const router = Router();

// 注意：登录和获取租户列表接口不需要验证令牌

/**
* @swagger
 * /auth/login:
 *   post:
 *     summary: 用户登录（统一租户认证）
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *               password:
 *                 type: string
 *                 description: 密码
 *               tenantCode:
 *                 type: string
 *                 description: 租户代码（可选）
 *     responses:
 *       200:
 *         description: 登录成功
 *       401:
 *         description: 认证失败
*/
router.post('/login', authenticateWithUnifiedAuth);

/**
* @swagger
 * /auth/logout:
 *   post:
 *     summary: 用户登出
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 登出成功
*/
router.post('/logout', verifyToken, authController.logout);

/**
* @swagger
 * /auth/me:
 *   get:
 *     summary: 获取当前用户信息
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取用户信息成功
*/
router.get('/me', verifyToken, authController.getCurrentUser);

/**
* @swagger
 * /auth/tenants:
 *   post:
 *     summary: 获取用户关联的租户列表
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 description: 手机号
 *               password:
 *                 type: string
 *                 description: 密码
 *     responses:
 *       200:
 *         description: 获取租户列表成功
*/
router.post('/tenants', authController.getUserTenants);

/**
* @swagger
 * /auth/bind-tenant:
 *   post:
 *     summary: 绑定用户到租户
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               globalUserId:
 *                 type: string
 *                 description: 全局用户ID
 *               tenantCode:
 *                 type: string
 *                 description: 租户代码
 *               role:
 *                 type: string
 *                 description: 用户角色
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 权限列表
 *     responses:
 *       200:
 *         description: 绑定成功
*/
router.post('/bind-tenant', authController.bindUserToTenant);

// ========== 验证码登录相关接口 ==========

// ========== 注意 ==========
// 验证码、注册等功能已迁移到统一认证系统
// 前端请直接调用统一认证API: http://admin.yyup.cc 或 http://localhost:4001
// - POST /api/auth/send-code - 发送验证码
// - POST /api/auth/login-with-code - 验证码登录
// - POST /api/auth/check-domain - 检查域名
// - POST /api/auth/register - 用户注册
// ==========================

// 注册功能已迁移到统一认证系统，不再使用本地注册
// router.use('/', authRegisterRoutes);

export default router;