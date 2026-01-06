"use strict";
/**
 * 权限路由
 * 提供动态路由和权限验证API
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var permissions_controller_1 = require("../controllers/permissions.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = express_1["default"].Router();
/**
 * @swagger
 * /api/permissions/dynamic-routes:
 *   get:
 *     summary: 获取用户的动态路由
 *     description: 获取当前用户可访问的动态路由列表
 *     tags:
 *       - 权限管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/dynamic-routes', auth_middleware_1.verifyToken, permissions_controller_1.getDynamicRoutes);
/**
 * @swagger
 * /api/permissions/user-permissions:
 *   get:
 *     summary: 获取用户权限列表
 *     description: 获取当前用户的所有权限
 *     tags:
 *       - 权限管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/user-permissions', auth_middleware_1.verifyToken, permissions_controller_1.getUserPermissions);
/**
 * @swagger
 * /api/permissions/check-permission:
 *   post:
 *     summary: 检查用户权限
 *     description: 检查用户是否拥有指定权限
 *     tags:
 *       - 权限管理
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
router.post('/check-permission', auth_middleware_1.verifyToken, permissions_controller_1.checkPermission);
/**
 * @swagger
 * /api/permissions/all-routes:
 *   get:
 *     summary: 获取所有可用路由
 *     description: 获取系统中所有可用的路由（用于路由表生成）
 *     tags:
 *       - 权限管理
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/all-routes', auth_middleware_1.verifyToken, permissions_controller_1.getAllRoutes);
exports["default"] = router;
