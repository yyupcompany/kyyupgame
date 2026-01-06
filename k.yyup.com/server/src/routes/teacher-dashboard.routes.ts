/**
* @swagger
 * components:
 *   schemas:
 *     Teacher-dashboard:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Teacher-dashboard ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Teacher-dashboard 名称
 *           example: "示例Teacher-dashboard"
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
 *     CreateTeacher-dashboardRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher-dashboard 名称
 *           example: "新Teacher-dashboard"
 *     UpdateTeacher-dashboardRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Teacher-dashboard 名称
 *           example: "更新后的Teacher-dashboard"
 *     Teacher-dashboardListResponse:
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
 *                 $ref: '#/components/schemas/Teacher-dashboard'
 *         message:
 *           type: string
 *           example: "获取teacher-dashboard列表成功"
 *     Teacher-dashboardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Teacher-dashboard'
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
 * teacher-dashboard管理路由文件
 * 提供teacher-dashboard的基础CRUD操作
*
 * 功能包括：
 * - 获取teacher-dashboard列表
 * - 创建新teacher-dashboard
 * - 获取teacher-dashboard详情
 * - 更新teacher-dashboard信息
 * - 删除teacher-dashboard
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { TeacherDashboardController } from '../controllers/teacher-dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';
import { applyDataScope } from '../middlewares/data-scope.middleware';

const router = Router();

// 应用认证中间件
router.use(verifyToken);

// 应用数据范围中间件（园区隔离）
// 必须在verifyToken之后，因为需要req.user.kindergartenId
router.use(applyDataScope);

/**
* @swagger
 * /api/teacher-dashboard/dashboard:
 *   get:
 *     summary: 获取教师工作台数据
 *     description: 获取教师工作台的综合数据，包括统计信息、任务、课程等
 *     tags:
 *       - 教师工作台
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
 *                 data:
 *                   type: object
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/dashboard',
  requireRole(['teacher', 'admin']),  // 允许教师和管理员访问
  TeacherDashboardController.getDashboardData
);

/**
* @swagger
 * /api/teacher-dashboard/statistics:
 *   get:
 *     summary: 获取教师统计数据
 *     description: 获取教师的各项统计数据
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/statistics',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getStatistics
);

/**
* @swagger
 * /api/teacher-dashboard/activity-statistics:
 *   get:
 *     summary: 获取教师活动统计数据
 *     description: 获取教师参与活动的统计信息
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/activity-statistics',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getActivityStatistics
);

/**
* @swagger
 * /api/teacher-dashboard/activity-checkin-overview:
 *   get:
 *     summary: 获取教师活动签到概览
 *     description: 获取教师活动签到的概览信息
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/activity-checkin-overview',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getActivityCheckinOverview
);

/**
* @swagger
 * /api/teacher-dashboard/today-tasks:
 *   get:
 *     summary: 获取今日任务
 *     description: 获取教师今日的任务列表
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/today-tasks',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getTodayTasks
);

/**
* @swagger
 * /api/teacher-dashboard/today-courses:
 *   get:
 *     summary: 获取今日课程
 *     description: 获取教师今日的课程安排
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/today-courses',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getTodayCourses
);

/**
* @swagger
 * /api/teacher-dashboard/recent-notifications:
 *   get:
 *     summary: 获取最新通知
 *     description: 获取教师的最新通知列表
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/recent-notifications',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getRecentNotifications
);

/**
* @swagger
 * /api/teacher-dashboard/tasks/{taskId}/status:
 *   put:
 *     summary: 更新任务状态
 *     description: 更新指定任务的状态
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *         description: 任务ID
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
 *                 enum: [pending, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/tasks/:taskId/status',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.updateTaskStatus
);

/**
* @swagger
 * /api/teacher-dashboard/clock-in:
 *   post:
 *     summary: 快速打卡
 *     description: 教师快速打卡签到
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: string
 *                 description: 打卡位置
 *               remark:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       200:
 *         description: 打卡成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/clock-in',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.clockIn
);

/**
* @swagger
 * /api/teacher-dashboard/tasks/stats:
 *   get:
 *     summary: 获取教师任务统计
 *     description: 获取教师任务的统计信息
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/tasks/stats',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getTaskStats
);

/**
* @swagger
 * /api/teacher-dashboard/tasks:
 *   get:
 *     summary: 获取教师任务列表
 *     description: 获取教师的任务列表，支持分页和筛选
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled]
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/tasks',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getTaskList
);

/**
* @swagger
 * /api/teacher-dashboard/tasks:
 *   post:
 *     summary: 创建教师任务
 *     description: 创建新的教师任务
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/tasks',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.createTask
);

/**
* @swagger
 * /api/teacher-dashboard/tasks/{id}:
 *   put:
 *     summary: 更新教师任务
 *     description: 更新指定的教师任务
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/tasks/:id',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.updateTask
);

/**
* @swagger
 * /api/teacher-dashboard/tasks/batch-complete:
 *   post:
 *     summary: 批量完成任务
 *     description: 批量将任务标记为已完成
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 批量完成成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/tasks/batch-complete',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.batchCompleteTask
);

/**
* @swagger
 * /api/teacher-dashboard/tasks/batch-delete:
 *   delete:
 *     summary: 批量删除任务
 *     description: 批量删除指定的任务
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - taskIds
 *             properties:
 *               taskIds:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 批量删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.delete('/tasks/batch-delete',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.batchDeleteTask
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/stats:
 *   get:
 *     summary: 获取教学统计
 *     description: 获取教师的教学统计数据
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/teaching/stats',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getTeachingStats
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/classes:
 *   get:
 *     summary: 获取班级列表
 *     description: 获取教师负责的班级列表
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/teaching/classes',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getClassList
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/classes/{id}:
 *   get:
 *     summary: 获取班级详情
 *     description: 获取教师负责班级的详细信息
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 班级ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/teaching/classes/:id',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getClassDetail
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/progress:
 *   get:
 *     summary: 获取进度数据
 *     description: 获取教学进度数据
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: string
 *         description: 班级ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/teaching/progress',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getProgressData
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/records:
 *   get:
 *     summary: 获取教学记录列表
 *     description: 获取教师的教学记录列表
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID（可选）
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期（可选）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期（可选）
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
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/teaching/records',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getTeachingRecords
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/records:
 *   post:
 *     summary: 创建教学记录
 *     description: 创建新的教学记录
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *               - content
 *             properties:
 *               classId:
 *                 type: string
 *                 description: 班级ID
 *               content:
 *                 type: string
 *                 description: 教学内容
 *               date:
 *                 type: string
 *                 format: date
 *               remark:
 *                 type: string
 *     responses:
 *       200:
 *         description: 创建成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post('/teaching/records',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.createTeachingRecord
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/students:
 *   get:
 *     summary: 获取学生列表
 *     description: 获取教师负责班级的学生列表
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID（可选）
 *       - in: query
 *         name: gender
 *         schema:
 *           type: string
 *           enum: [male, female]
 *         description: 性别（可选）
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词（可选）
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
 *           default: 12
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/teaching/students',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getStudentsList
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/students/{id}:
 *   get:
 *     summary: 获取学生详情
 *     description: 获取教师班级中学生的详细信息
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get('/teaching/students/:id',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.getStudentDetail
);

/**
* @swagger
 * /api/teacher-dashboard/teaching/progress/{id}:
 *   put:
 *     summary: 更新进度
 *     description: 更新教学进度
 *     tags:
 *       - 教师工作台
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progress:
 *                 type: number
 *                 description: 进度百分比
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: 更新成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.put('/teaching/progress/:id',
  requireRole(['teacher', 'admin']),
  TeacherDashboardController.updateProgress
);

export default router;
