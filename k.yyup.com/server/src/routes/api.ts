/**
 * API路由 - 系统主要接口集合
 * @swagger
 * components:
 *   schemas:
 *     SystemLog:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 日志ID
 *           example: 1
 *         level:
 *           type: string
 *           enum: [error, warn, info, debug]
 *           description: 日志级别
 *           example: "info"
 *         message:
 *           type: string
 *           description: 日志消息
 *           example: "用户登录成功"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 时间戳
 *           example: "2025-07-01T10:00:00Z"
 *         userId:
 *           type: integer
 *           description: 用户ID
 *           example: 1
 *         ip:
 *           type: string
 *           description: IP地址
 *           example: "192.168.1.100"
 *         userAgent:
 *           type: string
 *           description: 用户代理
 *           example: "Mozilla/5.0..."
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 待办事项ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 待办事项标题
 *           example: "完成月度报告"
 *         description:
 *           type: string
 *           description: 待办事项描述
 *           example: "编写和提交月度工作报告"
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *           description: 待办事项状态
 *           example: "pending"
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: 优先级
 *           example: "high"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: 截止日期
 *           example: "2025-07-20T18:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2025-07-01T09:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2025-07-01T09:00:00Z"
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 日程ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 日程标题
 *           example: "教师评估会议"
 *         description:
 *           type: string
 *           description: 日程描述
 *           example: "讨论教师绩效评估"
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *           example: "2025-07-15T09:00:00Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *           example: "2025-07-15T11:00:00Z"
 *         location:
 *           type: string
 *           description: 地点
 *           example: "会议室A"
 *         type:
 *           type: string
 *           enum: [meeting, class, event, activity]
 *           description: 日程类型
 *           example: "meeting"
 *         attendees:
 *           type: array
 *           description: 参与人员
 *           items:
 *             type: string
 *           example: ["王主任", "李老师", "张老师"]
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2025-07-01T09:00:00Z"
 *     Activity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 活动ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 活动标题
 *           example: "春季运动会"
 *         description:
 *           type: string
 *           description: 活动描述
 *           example: "幼儿园春季运动会活动"
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *           example: "2025-04-15T09:00:00Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *           example: "2025-04-15T12:00:00Z"
 *         location:
 *           type: string
 *           description: 活动地点
 *           example: "幼儿园操场"
 *         maxParticipants:
 *           type: integer
 *           description: 最大参与人数
 *           example: 200
 *         currentParticipants:
 *           type: integer
 *           description: 当前参与人数
 *           example: 150
 *         status:
 *           type: string
 *           enum: [planned, ongoing, completed, cancelled]
 *           description: 活动状态
 *           example: "planned"
 *     EnrollmentApplication:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 申请ID
 *           example: 1
 *         studentName:
 *           type: string
 *           description: 学生姓名
 *           example: "张小明"
 *         parentName:
 *           type: string
 *           description: 家长姓名
 *           example: "张先生"
 *         phone:
 *           type: string
 *           description: 联系电话
 *           example: "13800138000"
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *           example: "parent@example.com"
 *         enrollmentPlanId:
 *           type: integer
 *           description: 报名计划ID
 *           example: 1
 *         status:
 *           type: string
 *           enum: [pending, approved, rejected]
 *           description: 申请状态
 *           example: "pending"
 *         notes:
 *           type: string
 *           description: 备注
 *           example: "希望尽快安排面试"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 申请时间
 *           example: "2025-07-01T10:00:00Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2025-07-01T10:00:00Z"
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: 操作是否成功
 *           example: true
 *         message:
 *           type: string
 *           description: 响应消息
 *           example: "操作成功"
 *         data:
 *           type: object
 *           description: 响应数据
 *         total:
 *           type: integer
 *           description: 总数（用于分页）
 *           example: 100
 *         page:
 *           type: integer
 *           description: 当前页码
 *           example: 1
 *         pageSize:
 *           type: integer
 *           description: 每页数量
 *           example: 10
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

import express from 'express';
import multer from 'multer';
import * as path from 'path';
import { authMiddleware } from '../middlewares/auth.middleware';
import { RequestWithUser } from '../types/express';

// 导入新的控制器
import { DashboardController } from '../controllers/dashboard.controller';
import { PrincipalController } from '../controllers/principal.controller';
import { ApplicationsController } from '../controllers/applications.controller';
import { QuotasController } from '../controllers/quotas.controller';
import { MarketingController } from '../controllers/marketing.controller';
import { PosterUploadController, uploadPosterImageMiddleware } from '../controllers/poster-upload.controller';

// AI智能分配和跟进分析路由
import aiSmartAssignRoutes from './ai-smart-assign.routes';
import followupAnalysisRoutes from './followup-analysis.routes';

// 初始化路由
const router = express.Router();

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});
const upload = multer({ storage });

// 系统日志相关路由
import { SystemLogController } from '../controllers/system-log.controller';
const systemLogController = new SystemLogController();

/**
 * @swagger
 * /api/system/logs:
 *   get:
 *     summary: 获取系统日志列表
 *     tags: [系统日志]
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
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: 日志级别
 *     responses:
 *       200:
 *         description: 系统日志列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SystemLog'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 */
router.get('/system/logs', authMiddleware, systemLogController.getLogs.bind(systemLogController));

/**
 * @swagger
 * /api/system/logs/{id}:
 *   get:
 *     summary: 获取指定系统日志详情
 *     tags: [系统日志]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日志ID
 *     responses:
 *       200:
 *         description: 系统日志详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/SystemLog'
 */
router.get('/system/logs/:id', authMiddleware, systemLogController.getLogById.bind(systemLogController));

/**
 * @swagger
 * /api/system/logs/{id}:
 *   delete:
 *     summary: 删除指定系统日志
 *     tags: [系统日志]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日志ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/system/logs/:id', authMiddleware, systemLogController.deleteLog.bind(systemLogController));

/**
 * @swagger
 * /api/system/logs/batch:
 *   delete:
 *     summary: 批量删除系统日志
 *     tags: [系统日志]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要删除的日志ID数组
 *             required:
 *               - ids
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/system/logs/batch', authMiddleware, systemLogController.batchDeleteLogs.bind(systemLogController));

/**
 * @swagger
 * /api/system/logs/clear:
 *   delete:
 *     summary: 清空所有系统日志
 *     tags: [系统日志]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 清空成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/system/logs/clear', authMiddleware, systemLogController.clearLogs.bind(systemLogController));

/**
 * @swagger
 * /api/system/logs/export:
 *   get:
 *     summary: 导出系统日志
 *     tags: [系统日志]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [csv, json]
 *           default: csv
 *         description: 导出格式
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [error, warn, info, debug]
 *         description: 日志级别过滤
 *     responses:
 *       200:
 *         description: 导出文件
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get('/system/logs/export', authMiddleware, systemLogController.exportLogs.bind(systemLogController));

// 通知相关路由已移至 notifications.routes.ts

// 仪表盘相关路由
const dashboardController = new DashboardController();

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: 获取仪表盘统计数据
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 仪表盘统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                     totalTeachers:
 *                       type: integer
 *                     totalClasses:
 *                       type: integer
 *                     totalApplications:
 *                       type: integer
 */
router.get('/dashboard/stats', authMiddleware, (req, res) => dashboardController.getDashboardStats(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/todos:
 *   get:
 *     summary: 获取待办事项列表
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 待办事项列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Todo'
 */
router.get('/dashboard/todos', authMiddleware, (req, res) => dashboardController.getTodos(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/todos:
 *   post:
 *     summary: 创建待办事项
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 待办事项标题
 *               description:
 *                 type: string
 *                 description: 待办事项描述
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: 优先级
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *             required:
 *               - title
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 */
router.post('/dashboard/todos', authMiddleware, (req, res) => dashboardController.createTodo(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/todos/{id}/status:
 *   patch:
 *     summary: 更新待办事项状态
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed]
 *                 description: 新状态
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 */
router.patch('/dashboard/todos/:id/status', authMiddleware, (req, res) => dashboardController.updateTodoStatus(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/todos/{id}:
 *   delete:
 *     summary: 删除待办事项
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/dashboard/todos/:id', authMiddleware, (req, res) => dashboardController.deleteTodo(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/schedule:
 *   get:
 *     summary: 获取日程安排列表
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 查询日期
 *     responses:
 *       200:
 *         description: 日程安排列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 */
router.get('/dashboard/schedule', authMiddleware, (req, res) => dashboardController.getSchedules(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/schedule:
 *   post:
 *     summary: 创建日程安排
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 日程标题
 *               description:
 *                 type: string
 *                 description: 日程描述
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *               type:
 *                 type: string
 *                 enum: [meeting, class, event, activity]
 *                 description: 日程类型
 *             required:
 *               - title
 *               - startTime
 *               - endTime
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 */
router.post('/dashboard/schedule', authMiddleware, (req, res, next) => dashboardController.createSchedule(req as RequestWithUser, res, next));

/**
 * @swagger
 * /api/dashboard/classes:
 *   get:
 *     summary: 获取班级概览
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 班级概览数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       teacherName:
 *                         type: string
 *                       studentCount:
 *                         type: integer
 *                       capacity:
 *                         type: integer
 */
router.get('/dashboard/classes', authMiddleware, (req, res) => dashboardController.getClassesOverview(req as RequestWithUser, res));

// 新增的仪表板API端点

/**
 * @swagger
 * /api/campus/overview:
 *   get:
 *     summary: 获取校园概览
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 校园概览数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                     totalTeachers:
 *                       type: integer
 *                     totalClasses:
 *                       type: integer
 *                     occupancyRate:
 *                       type: number
 *                       format: float
 */
router.get('/campus/overview', authMiddleware, (req, res) => dashboardController.getCampusOverview(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/class-create:
 *   get:
 *     summary: 获取班级创建仪表盘数据
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 班级创建仪表盘数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get('/dashboard/class-create', authMiddleware, (req, res) => dashboardController.getClassCreateDashboard(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/class-detail/{id}:
 *   get:
 *     summary: 获取班级详情仪表盘数据
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         description: 班级ID (可选)
 *     responses:
 *       200:
 *         description: 班级详情仪表盘数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get('/dashboard/class-detail/:id?', authMiddleware, (req, res) => dashboardController.getClassDetailDashboard(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/class-list:
 *   get:
 *     summary: 获取班级列表仪表盘数据
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 班级列表仪表盘数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get('/dashboard/class-list', authMiddleware, (req, res) => dashboardController.getClassListDashboard(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/custom-layout:
 *   get:
 *     summary: 获取自定义布局仪表盘数据
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 自定义布局仪表盘数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.get('/dashboard/custom-layout', authMiddleware, (req, res) => dashboardController.getCustomLayoutDashboard(req as RequestWithUser, res));

/**
 * @swagger
 * /api/dashboard/data-statistics:
 *   get:
 *     summary: 获取数据统计
 *     tags: [仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 数据统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentStats:
 *                       type: object
 *                     teacherStats:
 *                       type: object
 *                     classStats:
 *                       type: object
 *                     applicationStats:
 *                       type: object
 */
router.get('/dashboard/data-statistics', authMiddleware, (req, res) => dashboardController.getDataStatistics(req as RequestWithUser, res));

// 园长功能相关路由
const principalController = new PrincipalController();

/**
 * @swagger
 * /api/principal/dashboard-stats:
 *   get:
 *     summary: 获取园长仪表盘统计
 *     tags: [园长功能]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 园长仪表盘统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalStudents:
 *                       type: integer
 *                     totalTeachers:
 *                       type: integer
 *                     totalClasses:
 *                       type: integer
 *                     enrollmentRate:
 *                       type: number
 *                       format: float
 */
router.get('/principal/dashboard-stats', authMiddleware, (req, res) => principalController.getDashboardStats(req as RequestWithUser, res));

/**
 * @swagger
 * /api/principal/activities:
 *   get:
 *     summary: 获取园长活动列表
 *     tags: [园长功能]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 活动列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Activity'
 */
router.get('/principal/activities', authMiddleware, (req, res) => principalController.getActivities(req as RequestWithUser, res));

// 申请管理相关路由
const applicationsController = new ApplicationsController();

/**
 * @swagger
 * /api/applications:
 *   get:
 *     summary: 获取申请列表
 *     tags: [申请管理]
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
 *           enum: [pending, approved, rejected]
 *         description: 申请状态
 *     responses:
 *       200:
 *         description: 申请列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     applications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/EnrollmentApplication'
 *                     total:
 *                       type: integer
 */
router.get('/applications', authMiddleware, (req, res) => applicationsController.getApplications(req as RequestWithUser, res));

/**
 * @swagger
 * /api/applications:
 *   post:
 *     summary: 创建新申请
 *     tags: [申请管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *                 description: 学生姓名
 *               parentName:
 *                 type: string
 *                 description: 家长姓名
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               enrollmentPlanId:
 *                 type: integer
 *                 description: 报名计划ID
 *               notes:
 *                 type: string
 *                 description: 备注
 *             required:
 *               - studentName
 *               - parentName
 *               - phone
 *               - enrollmentPlanId
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentApplication'
 */
router.post('/applications', authMiddleware, (req, res) => applicationsController.createApplication(req as RequestWithUser, res));

/**
 * @swagger
 * /api/applications/{id}/status:
 *   patch:
 *     summary: 更新申请状态
 *     tags: [申请管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 申请ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: 新状态
 *               notes:
 *                 type: string
 *                 description: 处理备注
 *             required:
 *               - status
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentApplication'
 */
router.patch('/applications/:id/status', authMiddleware, (req, res) => applicationsController.updateApplicationStatus(req as RequestWithUser, res));

/**
 * @swagger
 * /api/applications/{id}:
 *   delete:
 *     summary: 删除申请
 *     tags: [申请管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 申请ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/applications/:id', authMiddleware, (req, res) => applicationsController.deleteApplication(req as RequestWithUser, res));

// 配额管理相关路由
const quotasController = new QuotasController();

/**
 * @swagger
 * /api/quotas:
 *   get:
 *     summary: 获取配额列表
 *     tags: [配额管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 配额列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       className:
 *                         type: string
 *                       totalQuota:
 *                         type: integer
 *                       usedQuota:
 *                         type: integer
 *                       availableQuota:
 *                         type: integer
 */
router.get('/quotas', authMiddleware, (req, res) => quotasController.getQuotas(req as RequestWithUser, res));

/**
 * @swagger
 * /api/quotas:
 *   post:
 *     summary: 创建配额
 *     tags: [配额管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *               quota:
 *                 type: integer
 *                 description: 配额数量
 *               academicYear:
 *                 type: string
 *                 description: 学年
 *             required:
 *               - classId
 *               - quota
 *               - academicYear
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.post('/quotas', authMiddleware, (req, res) => quotasController.createQuota(req as RequestWithUser, res));

/**
 * @swagger
 * /api/quotas/{id}:
 *   put:
 *     summary: 更新配额
 *     tags: [配额管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配额ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quota:
 *                 type: integer
 *                 description: 新配额数量
 *               academicYear:
 *                 type: string
 *                 description: 学年
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 */
router.put('/quotas/:id', authMiddleware, (req, res) => quotasController.updateQuota(req as RequestWithUser, res));

/**
 * @swagger
 * /api/quotas/{id}:
 *   delete:
 *     summary: 删除配额
 *     tags: [配额管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配额ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.delete('/quotas/:id', authMiddleware, (req, res) => quotasController.deleteQuota(req as RequestWithUser, res));

// 营销分析相关路由
const marketingController = new MarketingController();

/**
 * @swagger
 * /api/marketing/analysis:
 *   get:
 *     summary: 获取营销分析数据
 *     tags: [营销分析]
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
 *         description: 营销分析数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     campaigns:
 *                       type: array
 *                       items:
 *                         type: object
 *                     conversions:
 *                       type: object
 *                     metrics:
 *                       type: object
 */
router.get('/marketing/analysis', authMiddleware, (req, res) => marketingController.getAnalysis(req as RequestWithUser, res));

/**
 * @swagger
 * /api/marketing/roi:
 *   get:
 *     summary: 获取营销ROI分析
 *     tags: [营销分析]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: campaignId
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *         description: 分析周期
 *     responses:
 *       200:
 *         description: ROI分析数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     roi:
 *                       type: number
 *                       format: float
 *                     cost:
 *                       type: number
 *                       format: float
 *                     revenue:
 *                       type: number
 *                       format: float
 *                     conversions:
 *                       type: integer
 */
router.get('/marketing/roi', authMiddleware, (req, res) => marketingController.getROIAnalysis(req as RequestWithUser, res));

// HMR触发注释更新 - 2025-07-02T21:52 - 修复导入顺序
// 海报图片上传路由
const posterUploadController = new PosterUploadController();

/**
 * @swagger
 * /api/posters/upload:
 *   post:
 *     summary: 上传海报图片
 *     tags: [文件上传]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的图片文件
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     fileName:
 *                       type: string
 *                     url:
 *                       type: string
 *                     size:
 *                       type: integer
 *       400:
 *         description: 上传失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
router.post('/posters/upload', authMiddleware, uploadPosterImageMiddleware.single('file'), posterUploadController.uploadPosterImage.bind(posterUploadController));

// AI智能分配路由
router.use('/ai', aiSmartAssignRoutes);

// 跟进质量分析路由
router.use('/followup', followupAnalysisRoutes);

// 导出路由
export default router;