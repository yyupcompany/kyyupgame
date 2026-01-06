import { Router } from 'express';
import { PrincipalController } from '../controllers/principal.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { activityController } from '../controllers/activity.controller';
import posterTemplateRoutes from './poster-template.routes';

/**
* @swagger
 * components:
 *   schemas:
 *     Principal:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Principal ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Principal 名称
 *           example: "示例Principal"
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
 *     CreatePrincipalRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Principal 名称
 *           example: "新Principal"
 *     UpdatePrincipalRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Principal 名称
 *           example: "更新后的Principal"
 *     PrincipalListResponse:
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
 *                 $ref: '#/components/schemas/Principal'
 *         message:
 *           type: string
 *           example: "获取principal列表成功"
 *     PrincipalResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Principal'
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
 * principal管理路由文件
 * 提供principal的基础CRUD操作
*
 * 功能包括：
 * - 获取principal列表
 * - 创建新principal
 * - 获取principal详情
 * - 更新principal信息
 * - 删除principal
*
 * 权限要求：需要有效的JWT Token认证
*/


/**
 * 园长专属路由
*/
const router = Router();
const principalController = new PrincipalController();

// 使用认证中间件
router.use(verifyToken);

/**
* @swagger
 * /principal/dashboard:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取园长仪表盘数据
 *     description: 获取园长仪表盘统计数据，包括学生数量、教师数量、收入统计等
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
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     studentCount:
 *                       type: integer
 *                       description: 学生总数
 *                     teacherCount:
 *                       type: integer
 *                       description: 教师总数
 *                     classCount:
 *                       type: integer
 *                       description: 班级总数
 *                     monthlyRevenue:
 *                       type: number
 *                       description: 月收入
 *                     pendingApprovals:
 *                       type: integer
 *                       description: 待审批数量
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/dashboard', principalController.getDashboardStats);

/**
* @swagger
 * /principal/campus/overview:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取园区概览
 *     description: 获取园区整体概览信息，包括设施状态、班级分布等
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
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalArea:
 *                       type: number
 *                       description: 园区总面积
 *                     buildingCount:
 *                       type: integer
 *                       description: 建筑数量
 *                     classroomCount:
 *                       type: integer
 *                       description: 教室数量
 *                     facilityStatus:
 *                       type: object
 *                       description: 设施状态统计
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/campus/overview', principalController.getCampusOverview);

/**
* @swagger
 * /principal/approvals:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取待审批列表
 *     description: 获取需要园长审批的事项列表
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [leave, expense, purchase, recruitment]
 *         description: 审批类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *         description: 审批状态
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           type:
 *                             type: string
 *                           title:
 *                             type: string
 *                           applicant:
 *                             type: string
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/approvals', principalController.getApprovalList);

/**
* @swagger
 * /principal/approvals/{id}/{action}:
 *   post:
 *     tags: [园长管理]
 *     summary: 处理审批
 *     description: 对指定的审批事项进行批准或拒绝操作
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 审批项ID
 *       - in: path
 *         name: action
 *         required: true
 *         schema:
 *           type: string
 *           enum: [approve, reject]
 *         description: 审批操作
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               comment:
 *                 type: string
 *                 description: 审批意见
 *             required:
 *               - comment
 *     responses:
 *       200:
 *         description: 处理成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "审批处理成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 审批项不存在
*/
router.post('/approvals/:id/:action', principalController.handleApproval);

/**
* @swagger
 * /principal/notices/important:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取重要通知
 *     description: 获取重要通知列表
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
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           content:
 *                             type: string
 *                           level:
 *                             type: string
 *                             enum: [urgent, important, normal]
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/notices/important', principalController.getImportantNotices);

/**
* @swagger
 * /principal/notices:
 *   post:
 *     tags: [园长管理]
 *     summary: 发布通知
 *     description: 发布新的通知公告
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
 *                 description: 通知标题
 *               content:
 *                 type: string
 *                 description: 通知内容
 *               level:
 *                 type: string
 *                 enum: [urgent, important, normal]
 *                 description: 通知级别
 *               targetAudience:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [teachers, parents, students, all]
 *                 description: 目标受众
 *               scheduleTime:
 *                 type: string
 *                 format: date-time
 *                 description: 定时发送时间（可选）
 *             required:
 *               - title
 *               - content
 *               - level
 *               - targetAudience
 *     responses:
 *       201:
 *         description: 发布成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "通知发布成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 通知ID
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.post('/notices', principalController.publishNotice);

/**
* @swagger
 * /principal/schedule:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取园长工作安排
 *     description: 获取园长的日程安排和工作计划
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: 查询日期
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [meeting, inspection, event, other]
 *         description: 日程类型
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                         format: date-time
 *                       endTime:
 *                         type: string
 *                         format: date-time
 *                       type:
 *                         type: string
 *                       location:
 *                         type: string
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/schedule', principalController.getPrincipalSchedule);

/**
* @swagger
 * /principal/schedule:
 *   post:
 *     tags: [园长管理]
 *     summary: 创建园长日程安排
 *     description: 为园长创建新的日程安排
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
 *                 enum: [meeting, inspection, event, other]
 *                 description: 日程类型
 *               location:
 *                 type: string
 *                 description: 地点
 *               participants:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 参与人员
 *               reminder:
 *                 type: integer
 *                 description: 提醒时间(分钟)
 *             required:
 *               - title
 *               - startTime
 *               - endTime
 *               - type
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "日程创建成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 日程ID
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.post('/schedule', principalController.createPrincipalSchedule);

/**
* @swagger
 * /principal/enrollment/trend:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取招生趋势数据
 *     description: 获取招生趋势统计数据和图表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: 统计周期
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *         description: 指定年份
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     chartData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                           enrollment:
 *                             type: integer
 *                           target:
 *                             type: integer
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalEnrollment:
 *                           type: integer
 *                         growthRate:
 *                           type: number
 *                         targetCompletion:
 *                           type: number
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/enrollment/trend', principalController.getEnrollmentTrend);

/**
* @swagger
 * /principal/customer-pool/stats:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取客户池统计数据
 *     description: 获取客户池的整体统计数据
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
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCustomers:
 *                       type: integer
 *                       description: 客户总数
 *                     newCustomers:
 *                       type: integer
 *                       description: 新客户数
 *                     activeCustomers:
 *                       type: integer
 *                       description: 活跃客户数
 *                     conversionRate:
 *                       type: number
 *                       description: 转化率
 *                     statusDistribution:
 *                       type: object
 *                       properties:
 *                         potential:
 *                           type: integer
 *                         contacted:
 *                           type: integer
 *                         interested:
 *                           type: integer
 *                         enrolled:
 *                           type: integer
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/customer-pool/stats', principalController.getCustomerPoolStats);

/**
* @swagger
 * /principal/customer-pool/list:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取客户池列表
 *     description: 获取客户池中所有客户的列表
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
 *           enum: [potential, contacted, interested, enrolled, lost]
 *         description: 客户状态
 *       - in: query
 *         name: assignedTeacher
 *         schema:
 *           type: integer
 *         description: 分配给的教师ID
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           childName:
 *                             type: string
 *                           childAge:
 *                             type: integer
 *                           status:
 *                             type: string
 *                           assignedTeacher:
 *                             type: string
 *                           lastContact:
 *                             type: string
 *                             format: date-time
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     pagination:
 *                       type: object
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/customer-pool/list', principalController.getCustomerPoolList);

/**
* @swagger
 * /principal/performance/stats:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取绩效统计数据
 *     description: 获取教师和部门的绩效统计数据
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *         description: 统计周期
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: 部门筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         averageScore:
 *                           type: number
 *                         totalTeachers:
 *                           type: integer
 *                         topPerformers:
 *                           type: integer
 *                     departmentStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           department:
 *                             type: string
 *                           averageScore:
 *                             type: number
 *                           teacherCount:
 *                             type: integer
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/performance/stats', principalController.getPerformanceStats);

/**
* @swagger
 * /principal/performance/rankings:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取绩效排名数据
 *     description: 获取教师绩效排名列表
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *         description: 统计周期
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 排名数量
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: 部门筛选
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       rank:
 *                         type: integer
 *                       teacherId:
 *                         type: integer
 *                       teacherName:
 *                         type: string
 *                       department:
 *                         type: string
 *                       score:
 *                         type: number
 *                       metrics:
 *                         type: object
 *                         properties:
 *                           studentSatisfaction:
 *                             type: number
 *                           classPerformance:
 *                             type: number
 *                           attendanceRate:
 *                             type: number
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.get('/performance/rankings', principalController.getPerformanceRankings);

/**
* @swagger
 * /principal/performance/details:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取绩效详情数据
 *     description: 获取指定教师的详细绩效数据
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 教师ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, quarter, year]
 *           default: month
 *         description: 统计周期
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacherInfo:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                         department:
 *                           type: string
 *                         position:
 *                           type: string
 *                     performanceMetrics:
 *                       type: object
 *                       properties:
 *                         overallScore:
 *                           type: number
 *                         studentSatisfaction:
 *                           type: number
 *                         classPerformance:
 *                           type: number
 *                         attendanceRate:
 *                           type: number
 *                         improvementSuggestions:
 *                           type: array
 *                           items:
 *                             type: string
 *                     trendData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                           score:
 *                             type: number
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 教师不存在
*/
router.get('/performance/details', principalController.getPerformanceDetails);

/**
* @swagger
 * /principal/customer-pool/{id}:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取客户详情
 *     description: 获取指定客户的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     phone:
 *                       type: string
 *                     email:
 *                       type: string
 *                     address:
 *                       type: string
 *                     childInfo:
 *                       type: object
 *                       properties:
 *                         name:
 *                           type: string
 *                         age:
 *                           type: integer
 *                         gender:
 *                           type: string
 *                         birthDate:
 *                           type: string
 *                           format: date
 *                     status:
 *                       type: string
 *                     assignedTeacher:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         name:
 *                           type: string
 *                     followUpHistory:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date-time
 *                           content:
 *                             type: string
 *                           type:
 *                             type: string
 *                           followUpBy:
 *                             type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 客户不存在
*/
router.get('/customer-pool/:id', principalController.getCustomerDetail);

/**
* @swagger
 * /principal/customer-pool/assign:
 *   post:
 *     tags: [园长管理]
 *     summary: 分配客户给教师
 *     description: 将客户分配给指定的教师负责跟进
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: 客户ID
 *               teacherId:
 *                 type: integer
 *                 description: 教师ID
 *               note:
 *                 type: string
 *                 description: 分配备注
 *             required:
 *               - customerId
 *               - teacherId
 *     responses:
 *       200:
 *         description: 分配成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "客户分配成功"
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 客户或教师不存在
*/
router.post('/customer-pool/assign', principalController.assignCustomerTeacher);

/**
* @swagger
 * /principal/customer-pool/batch-assign:
 *   post:
 *     tags: [园长管理]
 *     summary: 批量分配客户给教师
 *     description: 批量将多个客户分配给指定的教师负责跟进
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               assignments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     customerId:
 *                       type: integer
 *                       description: 客户ID
 *                     teacherId:
 *                       type: integer
 *                       description: 教师ID
 *                 description: 分配关系列表
 *               note:
 *                 type: string
 *                 description: 批量分配备注
 *             required:
 *               - assignments
 *     responses:
 *       200:
 *         description: 批量分配成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "批量分配成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     successCount:
 *                       type: integer
 *                       description: 成功分配数量
 *                     failedCount:
 *                       type: integer
 *                       description: 失败分配数量
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
router.post('/customer-pool/batch-assign', principalController.batchAssignCustomerTeacher);

/**
* @swagger
 * /principal/customer-pool/{id}:
 *   delete:
 *     tags: [园长管理]
 *     summary: 删除客户
 *     description: 从客户池中删除指定的客户
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: "客户删除成功"
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 客户不存在
*/
router.delete('/customer-pool/:id', principalController.deleteCustomer);

/**
* @swagger
 * /principal/customer-pool/{id}/follow-up:
 *   post:
 *     tags: [园长管理]
 *     summary: 添加客户跟进记录
 *     description: 为指定客户添加新的跟进记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 跟进内容
 *               type:
 *                 type: string
 *                 enum: [call, visit, email, message]
 *                 description: 跟进方式
 *               nextFollowUpDate:
 *                 type: string
 *                 format: date
 *                 description: 下次跟进日期
 *               status:
 *                 type: string
 *                 enum: [potential, contacted, interested, enrolled, lost]
 *                 description: 更新客户状态
 *             required:
 *               - content
 *               - type
 *     responses:
 *       201:
 *         description: 跟进记录添加成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 201
 *                 message:
 *                   type: string
 *                   example: "跟进记录添加成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 跟进记录ID
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 客户不存在
*/
router.post('/customer-pool/:id/follow-up', principalController.addCustomerFollowUp);

/**
* @swagger
 * /principal/activities:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取园长活动列表
 *     description: 获取园长可查看的活动列表，包括筛选和分页功能
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: activityType
 *         schema:
 *           type: integer
 *         description: 活动类型
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *         description: 活动状态
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期筛选
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期筛选
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: created_at
 *         description: 排序字段
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [ASC, DESC]
 *           default: DESC
 *         description: 排序方向
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
 *                 message:
 *                   type: string
 *                   example: "获取活动列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           activityType:
 *                             type: integer
 *                           status:
 *                             type: integer
 *                           startDate:
 *                             type: string
 *                             format: date
 *                           endDate:
 *                             type: string
 *                             format: date
 *                           location:
 *                             type: string
 *                           maxParticipants:
 *                             type: integer
 *                           currentParticipants:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       description: 总数量
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/activities', activityController.getList);

/**
* @swagger
 * /principal/poster-templates:
 *   get:
 *     tags: [园长管理]
 *     summary: 获取海报模板列表
 *     description: 获取海报模板列表，支持分页和筛选
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
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 12
 *         description: 每页数量
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 模板分类
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
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
 *                 message:
 *                   type: string
 *                   example: "获取海报模板列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           category:
 *                             type: string
 *                           thumbnail:
 *                             type: string
 *                           description:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
*/
// 海报模板路由 - 直接处理，避免权限问题
router.get('/poster-templates', async (req, res) => {
  try {
    const { page = 1, pageSize = 12, category, keyword } = req.query;

    // 返回包含真实图片的模拟数据
    const mockTemplates = [
      {
        id: 1,
        name: '秋季入学招生海报',
        description: 'AI生成的秋季入学招生海报模板',
        category: 'festival',
        width: 750,
        height: 1334,
        background: '#FFE4E1',
        thumbnail: '/templates/festival.jpg',
        kindergartenId: null,
        status: 1,
        usageCount: 18,
        remark: '节日庆典专用模板',
        creatorId: 1,
        updaterId: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 2,
        name: '艺术创作坊海报',
        description: 'AI生成的艺术创作坊海报模板',
        category: 'art',
        width: 750,
        height: 1334,
        background: '#E6F3FF',
        thumbnail: '/templates/art.jpg',
        kindergartenId: null,
        status: 1,
        usageCount: 21,
        remark: '艺术创作专用模板',
        creatorId: 1,
        updaterId: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 3,
        name: '科学实验课海报',
        description: 'AI生成的科学实验课海报模板',
        category: 'science',
        width: 750,
        height: 1334,
        background: '#F0FFF0',
        thumbnail: '/templates/science.jpg',
        kindergartenId: null,
        status: 1,
        usageCount: 28,
        remark: '科学探索专用模板',
        creatorId: 1,
        updaterId: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      },
      {
        id: 4,
        name: '亲子运动会海报',
        description: 'AI生成的亲子运动会海报模板',
        category: 'sports',
        width: 750,
        height: 1334,
        background: '#FFF8DC',
        thumbnail: '/templates/sports.jpg',
        kindergartenId: null,
        status: 1,
        usageCount: 35,
        remark: '体育运动专用模板',
        creatorId: 1,
        updaterId: 1,
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01')
      }
    ];

    // 应用筛选条件
    let filteredTemplates = mockTemplates;

    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    if (keyword) {
      const searchKeyword = (keyword as string).toLowerCase();
      filteredTemplates = filteredTemplates.filter(t =>
        t.name.toLowerCase().includes(searchKeyword) ||
        t.description.toLowerCase().includes(searchKeyword)
      );
    }

    // 应用分页
    const startIndex = (Number(page) - 1) * Number(pageSize);
    const endIndex = startIndex + Number(pageSize);
    const paginatedTemplates = filteredTemplates.slice(startIndex, endIndex);

    // 格式化返回数据以匹配前端期望的格式
    const result = {
      templates: paginatedTemplates,
      total: filteredTemplates.length,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(filteredTemplates.length / Number(pageSize))
    };

    res.json({
      success: true,
      data: result,
      message: '获取海报模板列表成功'
    });
  } catch (error) {
    console.error('[PRINCIPAL]: 获取海报模板列表失败:', error);
    res.status(500).json({
      success: false,
      message: '获取海报模板列表失败'
    });
  }
});

export default router;