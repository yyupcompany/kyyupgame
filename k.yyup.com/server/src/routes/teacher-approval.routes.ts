/**
 * 教师权限管理路由
 * 为园长提供教师权限审核和管理功能
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { validateRequest } from '../middlewares/validate.middleware';
import teacherApprovalController from '../controllers/teacher-approval.controller';

const router = Router();

// 所有教师权限管理路由都需要认证和园长/管理员权限
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

router.use(requireRole(['principal', 'admin']));

/**
* @swagger
 * /teacher-approvals/pending:
 *   get:
 *     tags: [Teacher Approval Management]
 *     summary: 获取待审核的教师权限申请列表
 *     description: 园长获取待审核的教师权限申请
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       teacher:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           realName:
 *                             type: string
 *                             example: "张老师"
 *                           phone:
 *                             type: string
 *                             example: "13800138000"
 *                           email:
 *                             type: string
 *                             example: "teacher@example.com"
 *                       class:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           name:
 *                             type: string
 *                             example: "大班A班"
 *                       approvalScope:
 *                         type: string
 *                         enum: [basic, student_management, attendance_management, activity_management, teaching_management, all]
 *                         example: "basic"
 *                       requestedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-12-01T10:00:00Z"
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/pending', teacherApprovalController.getPendingTeacherApprovals);

/**
* @swagger
 * /teacher-approvals:
 *   get:
 *     tags: [Teacher Approval Management]
 *     summary: 获取所有教师权限记录
 *     description: 获取所有教师权限记录，支持状态过滤和分页
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected, suspended]
 *         description: 按状态过滤
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TeacherApproval'
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/', teacherApprovalController.getAllTeacherApprovals);

/**
* @swagger
 * /teacher-approvals/stats:
 *   get:
 *     tags: [Teacher Approval Management]
 *     summary: 获取教师权限统计数据
 *     description: 获取教师权限的各项统计数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     pending:
 *                       type: integer
 *                       example: 5
 *                     approved:
 *                       type: integer
 *                       example: 40
*                     rejected:
 *                       type: integer
 *                       example: 3
*                     suspended:
*                       type: integer
*                       example: 2
*                     scopeStats:
*                       type: object
*                       properties:
*                         basic:
*                           type: integer
*                           example: 15
*                         student_management:
*                           type: integer
*                           example: 10
*                         attendance_management:
*                           type: integer
*                           example: 8
*                         activity_management:
*                           type: integer
*                           example: 5
*                         teaching_management:
*                           type: integer
*                           example: 7
*                         all:
*                           type: integer
*                           example: 5
*       401:
*         description: 未授权访问
*       403:
*         description: 权限不足
*       500:
*         description: 服务器内部错误
*/
router.get('/stats', teacherApprovalController.getTeacherPermissionStats);

/**
* @swagger
 * /teacher-approvals/{id}:
 *   get:
 *     tags: [Teacher Approval Management]
 *     summary: 获取指定教师的权限详情
 *     description: 获取指定教师的权限详情信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/TeacherApproval'
*       401:
*         description: 未授权访问
*       403:
*         description: 权限不足
*       404:
*         description: 教师权限记录不存在
*       500:
*         description: 服务器内部错误
*/
router.get('/:id', teacherApprovalController.getTeacherPermissionDetail);

/**
* @swagger
 * /teacher-approvals/{id}/approve:
 *   post:
 *     tags: [Teacher Approval Management]
 *     summary: 审核教师权限申请
 *     description: 园长审核教师的权限申请
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限申请ID
 *     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - approved
*             properties:
*               approved:
*                 type: boolean
*                 description: 是否通过审核
*                 example: true
*               approveNote:
*                 type: string
*                 description: 审核备注（通过时）
*                 example: "审核通过，权限有效期为1年"
*               rejectReason:
*                 type: string
*                 description: 拒绝原因（拒绝时）
*                 example: "资料不全，请补充相关证明材料"
*               expiryDate:
*                 type: string
*                 format: date-time
*                 description: 权限过期时间（可选）
*                 example: "2024-12-01T10:00:00Z"
*               isPermanent:
*                 type: boolean
*                 description: 是否永久权限
*                 example: false
*     responses:
*       200:
*         description: 审核成功
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   $ref: '#/components/schemas/TeacherApproval'
*                 message:
*                   type: string
*                   example: "教师权限申请审核通过"
*       400:
*         description: 请求参数错误
*       401:
*         description: 未授权访问
*       403:
*         description: 权限不足
*       404:
*         description: 权限申请不存在
*       500:
*         description: 服务器内部错误
*/
router.post('/:id/approve', teacherApprovalController.approveTeacherRequest);

/**
* @swagger
 * /teacher-approvals/batch-approve:
 *   post:
 *     tags: [Teacher Approval Management]
 *     summary: 批量审核教师权限申请
 *     description: 园长批量审核教师的权限申请
 *     security:
 *       - bearerAuth: []
 *     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - approvalIds
*               - approved
*             properties:
*               approvalIds:
*                 type: array
*                 items:
*                   type: integer
*                 description: 权限申请ID列表
*                 example: [1, 2, 3]
*               approved:
*                 type: boolean
*                 description: 是否通过审核
*                 example: true
*               approveNote:
*                 type: string
*                 description: 审核备注（通过时）
*                 example: "批量审核通过"
*               rejectReason:
*                 type: string
*                 description: 拒绝原因（拒绝时）
*                 example: "资料不全"
*     responses:
*       200:
*         description: 批量审核成功
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
*                     success:
*                       type: integer
*                       example: 2
*                     failed:
*                       type: integer
*                       example: 1
*                     errors:
*                       type: array
*                       items:
*                         type: string
*                       example: ["ID 3: 申请已处理"]
*                 message:
*                   type: string
*                   example: "批量审核通过成功：2个申请，失败：1个"
*       400:
*         description: 请求参数错误
*       401:
*         description: 未授权访问
*       403:
*         description: 权限不足
*       500:
*         description: 服务器内部错误
*/
router.post('/batch-approve', teacherApprovalController.batchApproveTeacherRequests);

/**
* @swagger
 * /teacher-approvals/{id}/toggle:
 *   put:
 *     tags: [Teacher Approval Management]
 *     summary: 暂停或恢复教师权限
 *     description: 暂停或恢复已审核通过的教师权限
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 权限记录ID
 *     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             required:
*               - suspend
*             properties:
*               suspend:
*                 type: boolean
*                 description: 是否暂停权限
*                 example: true
*     responses:
*       200:
*         description: 操作成功
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   $ref: '#/components/schemas/TeacherApproval'
*                 message:
*                   type: string
*                   example: "教师权限已暂停"
*       400:
*         description: 请求参数错误
*       401:
*         description: 未授权访问
*       403:
*         description: 权限不足
*       404:
*         description: 权限记录不存在
*       500:
*         description: 服务器内部错误
*/
router.put('/:id/toggle', teacherApprovalController.toggleTeacherPermission);

export default router;