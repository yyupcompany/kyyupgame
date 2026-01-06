import { Router } from 'express';
import { SetupPermissionsController } from '../controllers/setup-permissions.controller';
import { verifyToken } from '../middlewares/auth.middleware';

/**
* @swagger
 * components:
 *   schemas:
 *     Setup-permission:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Setup-permission ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Setup-permission 名称
 *           example: "示例Setup-permission"
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
 *     CreateSetup-permissionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Setup-permission 名称
 *           example: "新Setup-permission"
 *     UpdateSetup-permissionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Setup-permission 名称
 *           example: "更新后的Setup-permission"
 *     Setup-permissionListResponse:
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
 *                 $ref: '#/components/schemas/Setup-permission'
 *         message:
 *           type: string
 *           example: "获取setup-permission列表成功"
 *     Setup-permissionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Setup-permission'
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
 * setup-permission管理路由文件
 * 提供setup-permission的基础CRUD操作
*
 * 功能包括：
 * - 获取setup-permission列表
 * - 创建新setup-permission
 * - 获取setup-permission详情
 * - 更新setup-permission信息
 * - 删除setup-permission
*
 * 权限要求：需要有效的JWT Token认证
*/


const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const setupPermissionsController = new SetupPermissionsController();

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
router.post('/business-center-permissions', setupPermissionsController.setupBusinessCenterPermissions.bind(setupPermissionsController));

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
router.post('/fix-business-center-paths', setupPermissionsController.fixBusinessCenterPaths.bind(setupPermissionsController));

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
router.post('/assign-role-permissions', SetupPermissionsController.assignRolePermissions);

export { router as setupPermissionsRoutes };
