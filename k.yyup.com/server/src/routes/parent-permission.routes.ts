/**
 * 家长权限管理API路由
 * 提供园长管理家长权限的API接口
*/

import { Router } from 'express';
import { ParentPermissionController } from '../controllers/parent-permission.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken);

// 园长权限检查 - 只有园长可以管理家长权限
router.use(checkPermission('parent_permission_manage'));

/**
* @swagger
 * /api/parent-permissions/pending:
 *   get:
 *     summary: 园长获取待审核的权限申请列表
 *     tags: [ParentPermission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取待审核权限申请列表
 *       400:
 *         description: 园长必须关联幼儿园
*/
router.get('/pending', ParentPermissionController.getPendingPermissions);

/**
* @swagger
 * /api/parent-permissions/stats:
 *   get:
 *     summary: 获取园长的权限管理统计
 *     tags: [ParentPermission]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取权限管理统计
*/
router.get('/stats', ParentPermissionController.getPermissionStats);

/**
* @swagger
 * /api/parent-permissions/request:
 *   post:
 *     summary: 家长创建权限申请
 *     tags: [ParentPermission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: 学生ID
 *               permissionScope:
 *                 type: string
 *                 enum: [basic, album, notification, activity, academic, all]
 *                 description: 权限范围
 *               evidenceFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 证明材料文件路径列表
 *               isPermanent:
 *                 type: boolean
 *                 description: 是否永久权限
 *             required:
 *               - studentId
 *     responses:
 *       201:
 *         description: 权限申请提交成功
 *       400:
 *         description: 申请参数错误或关联关系不存在
*/
router.post('/request', ParentPermissionController.createPermissionRequest);

/**
* @swagger
 * /api/parent-permissions/batch-confirm:
 *   post:
 *     summary: 批量确认权限申请
 *     tags: [ParentPermission]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               confirmationIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 权限确认记录ID列表
 *               approved:
 *                 type: boolean
 *                 description: 是否确认通过
 *               confirmNote:
 *                 type: string
 *                 description: 确认备注
 *               rejectReason:
 *                 type: string
 *                 description: 拒绝原因
 *             required:
 *               - confirmationIds
 *               - approved
 *     responses:
 *       200:
 *         description: 批量确认完成
 *       400:
 *         description: 批量确认失败
*/
router.post('/batch-confirm', ParentPermissionController.batchConfirmPermissions);

/**
* @swagger
 * /api/parent-permissions/{id}/confirm:
 *   post:
 *     summary: 园长确认权限申请
 *     tags: [ParentPermission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限确认记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               approved:
 *                 type: boolean
 *                 description: 是否确认通过
 *               confirmNote:
 *                 type: string
 *                 description: 确认备注
 *               rejectReason:
 *                 type: string
 *                 description: 拒绝原因
 *               expiryDate:
 *                 type: string
 *                 format: date
 *                 description: 权限过期时间（可选）
 *               isPermanent:
 *                 type: boolean
 *                 description: 是否永久权限
 *             required:
 *               - approved
 *     responses:
 *       200:
 *         description: 权限确认成功
 *       400:
 *         description: 权限确认失败
*/
router.post('/:id/confirm', ParentPermissionController.confirmPermission);

/**
* @swagger
 * /api/parent-permissions/{id}/toggle:
 *   put:
 *     summary: 暂停或恢复权限
 *     tags: [ParentPermission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限确认记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               suspend:
 *                 type: boolean
 *                 description: 是否暂停权限
 *             required:
 *               - suspend
 *     responses:
 *       200:
 *         description: 权限状态切换成功
 *       400:
 *         description: 权限状态切换失败
*/
router.put('/:id/toggle', ParentPermissionController.togglePermission);

/**
* @swagger
 * /api/parent-permissions/parent/{parentId}:
 *   get:
 *     summary: 获取家长的所有权限记录
 *     tags: [ParentPermission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 获取家长权限记录成功
 *       500:
 *         description: 获取家长权限记录失败
*/
router.get('/parent/:parentId', ParentPermissionController.getParentPermissions);

/**
* @swagger
 * /api/parent-permissions/check/{parentId}:
 *   get:
 *     summary: 检查家长权限状态
 *     tags: [ParentPermission]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: scope
 *         schema:
 *           type: string
 *           enum: [basic, album, notification, activity, academic, all]
 *         description: 要检查的权限范围
 *     responses:
 *       200:
 *         description: 权限状态检查完成
 *       500:
 *         description: 检查家长权限状态失败
*/
router.get('/check/:parentId', ParentPermissionController.checkParentPermissionStatus);

export default router;