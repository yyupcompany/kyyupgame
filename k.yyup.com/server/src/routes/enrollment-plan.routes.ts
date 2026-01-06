import { Router } from 'express';
import { EnrollmentPlanController } from '../controllers/enrollment-plan.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
const router = Router();

/**
* @swagger
 * tags:
 *   name: EnrollmentPlan
 *   description: 招生计划管理接口
* 
 * components:
 *   schemas:
 *     EnrollmentPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 招生计划ID
 *         planName:
 *           type: string
 *           description: 计划名称
 *         planDescription:
 *           type: string
 *           description: 计划描述
 *         startDate:
 *           type: string
 *           format: date
 *           description: 开始日期
 *         endDate:
 *           type: string
 *           format: date
 *           description: 结束日期
 *         status:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED, CANCELLED]
 *           description: 计划状态
 *         targetStudentCount:
 *           type: integer
 *           description: 目标招生人数
 *         currentStudentCount:
 *           type: integer
 *           description: 当前招生人数
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
* 
 *     CreateEnrollmentPlanRequest:
 *       type: object
 *       required:
 *         - planName
 *         - startDate
 *         - endDate
 *         - targetStudentCount
 *       properties:
 *         planName:
 *           type: string
 *           description: 计划名称
 *         planDescription:
 *           type: string
 *           description: 计划描述
 *         startDate:
 *           type: string
 *           format: date
 *           description: 开始日期
 *         endDate:
 *           type: string
 *           format: date
 *           description: 结束日期
 *         targetStudentCount:
 *           type: integer
 *           description: 目标招生人数
* 
 *     UpdateEnrollmentPlanRequest:
 *       type: object
 *       properties:
 *         planName:
 *           type: string
 *           description: 计划名称
 *         planDescription:
 *           type: string
 *           description: 计划描述
 *         startDate:
 *           type: string
 *           format: date
 *           description: 开始日期
 *         endDate:
 *           type: string
 *           format: date
 *           description: 结束日期
 *         targetStudentCount:
 *           type: integer
 *           description: 目标招生人数
* 
 *     EnrollmentPlanStatistics:
 *       type: object
 *       properties:
 *         totalApplications:
 *           type: integer
 *           description: 总申请数
 *         approvedApplications:
 *           type: integer
 *           description: 已通过申请数
 *         rejectedApplications:
 *           type: integer
 *           description: 已拒绝申请数
 *         pendingApplications:
 *           type: integer
 *           description: 待处理申请数
 *         completionRate:
 *           type: number
 *           description: 完成率
* 
 *     EnrollmentTracking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 跟踪记录ID
 *         enrollmentPlanId:
 *           type: integer
 *           description: 招生计划ID
 *         trackingDate:
 *           type: string
 *           format: date
 *           description: 跟踪日期
 *         trackingContent:
 *           type: string
 *           description: 跟踪内容
 *         trackedBy:
 *           type: integer
 *           description: 跟踪人ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
*/

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const enrollmentPlanController = new EnrollmentPlanController();

/**
* @swagger
 * /enrollment-plans:
 *   post:
 *     tags: [EnrollmentPlan]
 *     summary: 创建招生计划
 *     description: 创建新的招生计划
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEnrollmentPlanRequest'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.post(
  '/', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.create.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans:
 *   get:
 *     tags: [EnrollmentPlan]
 *     summary: 获取招生计划列表
 *     description: 获取所有招生计划列表，支持分页和筛选
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, ACTIVE, COMPLETED, CANCELLED]
 *         description: 状态筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get(
  '/', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.list.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/statistics:
 *   get:
 *     tags: [EnrollmentPlan]
 *     summary: 获取全局招生计划统计
 *     description: 获取全局招生计划统计数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get(
  '/statistics', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.getGlobalStatistics.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/analytics:
 *   get:
 *     tags: [EnrollmentPlan]
 *     summary: 获取招生分析数据
 *     description: 获取招生计划分析数据和趋势
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get(
  '/analytics', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.getAnalytics.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}:
 *   get:
 *     tags: [EnrollmentPlan]
 *     summary: 获取招生计划详情
 *     description: 根据ID获取招生计划详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.get(
  '/:id', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.detail.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}:
 *   put:
 *     tags: [EnrollmentPlan]
 *     summary: 更新招生计划
 *     description: 更新指定ID的招生计划信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEnrollmentPlanRequest'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.put(
  '/:id', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.update.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}:
 *   delete:
 *     tags: [EnrollmentPlan]
 *     summary: 删除招生计划
 *     description: 删除指定ID的招生计划
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.delete(
  '/:id', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.delete.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}/classes:
 *   post:
 *     tags: [EnrollmentPlan]
 *     summary: 设置招生计划班级
 *     description: 为招生计划关联班级
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classIds
 *             properties:
 *               classIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 班级ID列表
 *     responses:
 *       200:
 *         description: 设置成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.post(
  '/:id/classes', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.setClasses.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}/assignees:
 *   post:
 *     tags: [EnrollmentPlan]
 *     summary: 设置招生计划负责人
 *     description: 为招生计划指定负责人
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assigneeIds
 *             properties:
 *               assigneeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 负责人ID列表
 *     responses:
 *       200:
 *         description: 设置成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.post(
  '/:id/assignees', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.setAssignees.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}/statistics:
 *   get:
 *     tags: [EnrollmentPlan]
 *     summary: 获取招生计划统计
 *     description: 获取指定招生计划的统计数据
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EnrollmentPlanStatistics'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.get(
  '/:id/statistics', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.getStatistics.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}/trackings:
 *   get:
 *     tags: [EnrollmentPlan]
 *     summary: 获取招生计划跟踪记录
 *     description: 获取指定招生计划的跟踪记录列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
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
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.get(
  '/:id/trackings', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.getTrackings.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}/trackings:
 *   post:
 *     tags: [EnrollmentPlan]
 *     summary: 添加招生计划跟踪记录
 *     description: 为指定招生计划添加跟踪记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - trackingContent
 *             properties:
 *               trackingContent:
 *                 type: string
 *                 description: 跟踪内容
 *               trackingDate:
 *                 type: string
 *                 format: date
 *                 description: 跟踪日期（可选，默认当前日期）
 *     responses:
 *       201:
 *         description: 添加成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.post(
  '/:id/trackings', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.addTracking.bind(enrollmentPlanController)
);

/**
* @swagger
 * /enrollment-plans/{id}/status:
 *   put:
 *     tags: [EnrollmentPlan]
 *     summary: 更新招生计划状态
 *     description: 更新指定招生计划的状态
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生计划ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, ACTIVE, COMPLETED, CANCELLED]
 *                 description: 新状态
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生计划不存在
*/
router.put(
  '/:id/status', checkPermission('ENROLLMENT_PLAN_MANAGE'),
  enrollmentPlanController.updateStatus.bind(enrollmentPlanController)
);

export default router; 