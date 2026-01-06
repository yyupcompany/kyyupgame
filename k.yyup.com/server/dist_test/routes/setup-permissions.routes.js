"use strict";
exports.__esModule = true;
exports.setupPermissionsRoutes = void 0;
var express_1 = require("express");
var setup_permissions_controller_1 = require("../controllers/setup-permissions.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
exports.setupPermissionsRoutes = router;
var setupPermissionsController = new setup_permissions_controller_1.SetupPermissionsController();
/**
 * @swagger
 * /setup/business-center-permissions:
 *   post:
 *     tags: [权限设置]
 *     summary: 设置业务中心权限
 *     description: 为所有角色配置业务中心访问权限，解决权限不足问题
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 权限设置成功
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
 *                   example: 权限配置成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 业务中心权限设置完成
 *                     verification:
 *                       type: object
 *                       description: 权限配置验证结果
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/business-center-permissions', auth_middleware_1.verifyToken, setupPermissionsController.setupBusinessCenterPermissions.bind(setupPermissionsController));
/**
 * @swagger
 * /setup/fix-business-center-paths:
 *   post:
 *     tags: [权限设置]
 *     summary: 修复业务中心权限路径
 *     description: 修复业务中心权限表中的路径，从锚点路径改为实际路由路径
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 权限路径修复成功
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
 *                   example: 权限路径修复成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: 业务中心权限路径修复完成
 *                     pathMappings:
 *                       type: number
 *                       example: 11
 *                     pagePermissions:
 *                       type: number
 *                       example: 6
 *                     verification:
 *                       type: object
 *                       description: 权限配置验证结果
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/fix-business-center-paths', auth_middleware_1.verifyToken, setupPermissionsController.fixBusinessCenterPaths.bind(setupPermissionsController));
/**
 * @swagger
 * /setup/assign-role-permissions:
 *   post:
 *     tags: [权限设置]
 *     summary: 为其他角色分配业务中心权限
 *     description: 为园长、教师、家长角色分配相应的业务中心访问权限
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 角色权限分配成功
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
 *                   example: 角色权限分配完成
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalAssigned:
 *                       type: number
 *                       example: 18
 *                     rolePermissionMapping:
 *                       type: object
 *                       description: 角色权限映射关系
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/assign-role-permissions', auth_middleware_1.verifyToken, setup_permissions_controller_1.SetupPermissionsController.assignRolePermissions);
