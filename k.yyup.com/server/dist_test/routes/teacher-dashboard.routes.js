"use strict";
exports.__esModule = true;
var express_1 = require("express");
var teacher_dashboard_controller_1 = require("../controllers/teacher-dashboard.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var role_middleware_1 = require("../middlewares/role.middleware");
var router = (0, express_1.Router)();
// 应用认证中间件
router.use(auth_middleware_1.authMiddleware);
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
router.get('/dashboard', (0, role_middleware_1.requireRole)(['teacher', 'admin']), // 允许教师和管理员访问
teacher_dashboard_controller_1.TeacherDashboardController.getDashboardData);
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
router.get('/statistics', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getStatistics);
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
router.get('/activity-statistics', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getActivityStatistics);
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
router.get('/activity-checkin-overview', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getActivityCheckinOverview);
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
router.get('/today-tasks', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getTodayTasks);
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
router.get('/today-courses', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getTodayCourses);
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
router.get('/recent-notifications', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getRecentNotifications);
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
router.put('/tasks/:taskId/status', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.updateTaskStatus);
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
router.post('/clock-in', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.clockIn);
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
router.get('/tasks/stats', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getTaskStats);
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
router.get('/tasks', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getTaskList);
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
router.post('/tasks', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.createTask);
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
router.put('/tasks/:id', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.updateTask);
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
router.post('/tasks/batch-complete', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.batchCompleteTask);
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
router["delete"]('/tasks/batch-delete', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.batchDeleteTask);
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
router.get('/teaching/stats', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getTeachingStats);
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
router.get('/teaching/classes', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getClassList);
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
router.get('/teaching/classes/:id', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getClassDetail);
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
router.get('/teaching/progress', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getProgressData);
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
router.get('/teaching/records', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getTeachingRecords);
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
router.post('/teaching/records', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.createTeachingRecord);
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
router.get('/teaching/students', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getStudentsList);
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
router.get('/teaching/students/:id', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.getStudentDetail);
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
router.put('/teaching/progress/:id', (0, role_middleware_1.requireRole)(['teacher', 'admin']), teacher_dashboard_controller_1.TeacherDashboardController.updateProgress);
exports["default"] = router;
