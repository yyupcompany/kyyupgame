"use strict";
/**
 * 权限相关的认证路由
 */
exports.__esModule = true;
var express_1 = require("express");
var auth_permissions_controller_1 = require("../controllers/auth-permissions.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/auth-permissions/permissions:
 *   get:
 *     summary: 获取用户权限列表
 *     description: 获取当前用户的所有权限
 *     tags:
 *       - 认证权限
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/permissions', auth_middleware_1.authenticate, auth_permissions_controller_1.AuthPermissionsController.getUserPermissions);
/**
 * @swagger
 * /api/auth-permissions/menu:
 *   get:
 *     summary: 获取用户菜单
 *     description: 获取当前用户可访问的菜单列表
 *     tags:
 *       - 认证权限
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/menu', auth_middleware_1.authenticate, auth_permissions_controller_1.AuthPermissionsController.getUserMenu);
/**
 * @swagger
 * /api/auth-permissions/check-permission:
 *   post:
 *     summary: 检查用户权限
 *     description: 检查用户是否拥有指定权限
 *     tags:
 *       - 认证权限
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permission
 *             properties:
 *               permission:
 *                 type: string
 *     responses:
 *       200:
 *         description: 检查成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/check-permission', auth_middleware_1.authenticate, auth_permissions_controller_1.AuthPermissionsController.checkPermission);
/**
 * @swagger
 * /api/auth-permissions/roles:
 *   get:
 *     summary: 获取用户角色
 *     description: 获取当前用户的所有角色
 *     tags:
 *       - 认证权限
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/roles', auth_middleware_1.authenticate, auth_permissions_controller_1.AuthPermissionsController.getUserRoles);
exports["default"] = router;
