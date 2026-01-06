/**
* @swagger
 * components:
 *   schemas:
 *     Attendance-center:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Attendance-center ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Attendance-center 名称
 *           example: "示例Attendance-center"
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
 *     CreateAttendance-centerRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Attendance-center 名称
 *           example: "新Attendance-center"
 *     UpdateAttendance-centerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Attendance-center 名称
 *           example: "更新后的Attendance-center"
 *     Attendance-centerListResponse:
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
 *                 $ref: '#/components/schemas/Attendance-center'
 *         message:
 *           type: string
 *           example: "获取attendance-center列表成功"
 *     Attendance-centerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Attendance-center'
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
 * attendance-center管理路由文件
 * 提供attendance-center的基础CRUD操作
*
 * 功能包括：
 * - 获取attendance-center列表
 * - 创建新attendance-center
 * - 获取attendance-center详情
 * - 更新attendance-center信息
 * - 删除attendance-center
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { AttendanceCenterController } from '../controllers/attendance-center.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

/**
 * 考勤中心路由（园长/管理员）
 * 基础路径: /api/attendance-center
*/

// 所有路由都需要认证和园长/管理员角色
router.use(verifyToken);
router.use(requireRole(['principal', 'admin']));

/**
* @swagger
 * /api/attendance-center/overview:
 *   get:
 *     summary: 获取全园考勤概览
 *     description: 获取幼儿园的整体考勤情况概览，包括出勤率、异常情况等
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-01"
 *         description: 查询日期（可选，默认今天）
 *     responses:
 *       200:
 *         description: 成功获取考勤概览
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
 *                     date:
 *                       type: string
 *                       example: "2023-12-01"
 *                     totalStudents:
 *                       type: integer
 *                       example: 150
 *                     presentCount:
 *                       type: integer
 *                       example: 142
 *                     absentCount:
 *                       type: integer
 *                       example: 8
 *                     attendanceRate:
 *                       type: number
 *                       example: 94.67
 *                     lateCount:
 *                       type: integer
 *                       example: 3
 *                     leaveEarlyCount:
 *                       type: integer
 *                       example: 2
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/overview', AttendanceCenterController.getOverview);

/**
* @swagger
 * /api/attendance-center/statistics/daily:
 *   get:
 *     summary: 获取日考勤统计
 *     description: 获取指定日期的详细考勤统计数据，包括各班级的出勤情况、异常统计等
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-01"
 *         description: 查询日期（可选，默认今天）
 *     responses:
 *       200:
 *         description: 成功获取日考勤统计数据
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
 *                     date:
 *                       type: string
 *                       example: "2023-12-01"
 *                       description: 统计日期
 *                     totalStudents:
 *                       type: integer
 *                       example: 150
 *                       description: 总学生数
 *                     presentCount:
 *                       type: integer
 *                       example: 142
 *                       description: 出勤人数
 *                     absentCount:
 *                       type: integer
 *                       example: 8
 *                       description: 缺勤人数
 *                     lateCount:
 *                       type: integer
 *                       example: 3
 *                       description: 迟到人数
 *                     leaveEarlyCount:
 *                       type: integer
 *                       example: 2
 *                       description: 早退人数
 *                     sickLeaveCount:
 *                       type: integer
 *                       example: 3
 *                       description: 病假人数
 *                     personalLeaveCount:
 *                       type: integer
 *                       example: 2
 *                       description: 事假人数
 *                     classStatistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           classId:
 *                             type: integer
 *                             example: 1
 *                           className:
 *                             type: string
 *                             example: "小班A班"
 *                           totalStudents:
 *                             type: integer
 *                             example: 25
 *                           presentCount:
 *                             type: integer
 *                             example: 24
 *                           attendanceRate:
 *                             type: number
 *                             example: 96.0
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/statistics/daily', AttendanceCenterController.getDailyStatistics);

/**
* @swagger
 * /api/attendance-center/statistics/weekly:
 *   get:
 *     summary: 获取周考勤统计
 *     description: 获取指定日期范围内的周考勤统计数据，支持自定义周区间，提供趋势分析
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-11-27"
 *         description: 开始日期（周一）
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-03"
 *         description: 结束日期（周日）
 *     responses:
 *       200:
 *         description: 成功获取周考勤统计数据
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
 *                     weekRange:
 *                       type: string
 *                       example: "2023-11-27 至 2023-12-03"
 *                       description: 统计周范围
 *                     totalSchoolDays:
 *                       type: integer
 *                       example: 5
 *                       description: 本周上学天数
 *                     averageAttendanceRate:
 *                       type: number
 *                       example: 95.2
 *                       description: 平均出勤率
 *                     totalStudentDays:
 *                       type: integer
 *                       example: 750
 *                       description: 应出勤总人天数
 *                     presentStudentDays:
 *                       type: integer
 *                       example: 714
 *                       description: 实际出勤人天数
 *                     dailyStatistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2023-11-27"
 *                           dayOfWeek:
 *                             type: string
 *                             example: "周一"
 *                           attendanceRate:
 *                             type: number
 *                             example: 96.0
 *                           presentCount:
 *                             type: integer
 *                             example: 145
 *                           absentCount:
 *                             type: integer
 *                             example: 5
 *                     trendAnalysis:
 *                       type: object
 *                       properties:
 *                         comparedToLastWeek:
 *                           type: number
 *                           example: 2.3
 *                           description: 与上周相比的出勤率变化（百分点）
 *                         bestDay:
 *                           type: string
 *                           example: "2023-11-29"
 *                           description: 本周出勤率最高的一天
 *                         worstDay:
 *                           type: string
 *                           example: "2023-11-27"
 *                           description: 本周出勤率最低的一天
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/statistics/weekly', AttendanceCenterController.getWeeklyStatistics);

/**
* @swagger
 * /api/attendance-center/statistics/monthly:
 *   get:
 *     summary: 获取月考勤统计
 *     description: 获取指定年月的详细考勤统计数据，包括月度趋势、工作日/非工作日分析、异常统计等
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2023
 *         description: 年份
 *       - in: query
 *         name: month
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           example: 12
 *         description: 月份（1-12）
 *     responses:
 *       200:
 *         description: 成功获取月考勤统计数据
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
 *                     year:
 *                       type: integer
 *                       example: 2023
 *                       description: 年份
 *                     month:
 *                       type: integer
 *                       example: 12
 *                       description: 月份
 *                     monthName:
 *                       type: string
 *                       example: "十二月"
 *                       description: 月份名称
 *                     totalSchoolDays:
 *                       type: integer
 *                       example: 22
 *                       description: 本月上学天数
 *                     totalStudents:
 *                       type: integer
 *                       example: 150
 *                       description: 总学生数
 *                     monthlyAttendanceRate:
 *                       type: number
 *                       example: 94.8
 *                       description: 月度出勤率
 *                     weeklyStatistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           weekNumber:
 *                             type: integer
 *                             example: 1
 *                             description: 第几周
 *                           weekRange:
 *                             type: string
 *                             example: "12-01 至 12-03"
 *                           attendanceRate:
 *                             type: number
 *                             example: 95.2
 *                           trend:
 *                             type: string
 *                             enum: [up, down, stable]
 *                             example: "up"
 *                     classStatistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           classId:
 *                             type: integer
 *                             example: 1
 *                           className:
 *                             type: string
 *                             example: "小班A班"
 *                           attendanceRate:
 *                             type: number
 *                             example: 96.5
 *                           ranking:
 *                             type: integer
 *                             example: 1
 *                             description: 出勤率排名
 *                     absentReasons:
 *                       type: object
 *                       properties:
 *                         sick:
 *                           type: integer
 *                           example: 45
 *                           description: 病假人次
 *                         personal:
 *                           type: integer
 *                           example: 23
 *                           description: 事假人次
 *                         unexcused:
 *                           type: integer
 *                           example: 8
 *                           description: 旷课人次
 *                     comparison:
 *                       type: object
 *                       properties:
 *                         comparedToLastMonth:
 *                           type: number
 *                           example: 1.2
 *                           description: 与上月相比的出勤率变化
 *                         comparedToLastYear:
 *                           type: number
 *                           example: 0.8
 *                           description: 与去年同期相比的出勤率变化
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/statistics/monthly', AttendanceCenterController.getMonthlyStatistics);

/**
* @swagger
 * /api/attendance-center/statistics/quarterly:
 *   get:
 *     summary: 获取季度考勤统计
 *     description: 获取指定年份季度的考勤统计数据，包含3个月的详细分析、趋势对比和异常情况统计
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2023
 *         description: 年份
 *       - in: query
 *         name: quarter
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 4
 *           example: 4
 *         description: 季度（1-4）
 *     responses:
 *       200:
 *         description: 成功获取季度考勤统计数据
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
 *                     year:
 *                       type: integer
 *                       example: 2023
 *                       description: 年份
 *                     quarter:
 *                       type: integer
 *                       example: 4
 *                       description: 季度
 *                     quarterName:
 *                       type: string
 *                       example: "第四季度"
 *                       description: 季度名称
 *                     quarterlyAttendanceRate:
 *                       type: number
 *                       example: 95.3
 *                       description: 季度平均出勤率
 *                     monthlyBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                             example: 10
 *                           monthName:
 *                             type: string
 *                             example: "十月"
 *                           attendanceRate:
 *                             type: number
 *                             example: 94.8
 *                           schoolDays:
 *                             type: integer
 *                             example: 22
 *                           presentDays:
 *                             type: integer
 *                             example: 3156
 *                     classPerformance:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           classId:
 *                             type: integer
 *                             example: 1
 *                           className:
 *                             type: string
 *                             example: "小班A班"
 *                           quarterlyAttendanceRate:
 *                             type: number
 *                             example: 96.2
 *                           ranking:
 *                             type: integer
 *                             example: 1
 *                     trends:
 *                       type: object
 *                       properties:
 *                         monthOverMonth:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: integer
 *                                 example: 10
 *                               change:
 *                                 type: number
 *                                 example: 0.5
 *                               trend:
 *                                 type: string
 *                                 example: "up"
 *                         bestPerformingClass:
 *                           type: string
 *                           example: "小班A班"
 *                         mostImprovedClass:
 *                           type: string
 *                           example: "中班B班"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/statistics/quarterly', AttendanceCenterController.getQuarterlyStatistics);

/**
* @swagger
 * /api/attendance-center/statistics/yearly:
 *   get:
 *     summary: 获取年度考勤统计
 *     description: 获取指定年份的完整考勤统计数据，包含全年趋势分析、季度对比、班级表现排名和异常情况统计
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: year
 *         required: true
 *         schema:
 *           type: integer
 *           example: 2023
 *         description: 年份
 *     responses:
 *       200:
 *         description: 成功获取年度考勤统计数据
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
 *                     year:
 *                       type: integer
 *                       example: 2023
 *                       description: 统计年份
 *                     yearlyAttendanceRate:
 *                       type: number
 *                       example: 94.6
 *                       description: 年度平均出勤率
 *                     totalSchoolDays:
 *                       type: integer
 *                       example: 248
 *                       description: 全年上学天数
 *                     totalStudentDays:
 *                       type: integer
 *                       example: 37200
 *                       description: 全年应出勤总人天数
 *                     quarterlyBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           quarter:
 *                             type: integer
 *                             example: 1
 *                           quarterName:
 *                             type: string
 *                             example: "第一季度"
 *                           attendanceRate:
 *                             type: number
 *                             example: 93.8
 *                           trend:
 *                             type: string
 *                             enum: [up, down, stable]
 *                             example: "up"
 *                     monthlyTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: integer
 *                             example: 1
 *                           monthName:
 *                             type: string
 *                             example: "一月"
 *                           attendanceRate:
 *                             type: number
 *                             example: 92.5
 *                           changeFromLastMonth:
 *                             type: number
 *                             example: -0.8
 *                     classRankings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rank:
 *                             type: integer
 *                             example: 1
 *                           classId:
 *                             type: integer
 *                             example: 1
 *                           className:
 *                             type: string
 *                             example: "小班A班"
 *                           attendanceRate:
 *                             type: number
 *                             example: 97.2
 *                           totalStudents:
 *                             type: integer
 *                             example: 25
 *                     attendanceInsights:
 *                       type: object
 *                       properties:
 *                         bestMonth:
 *                           type: object
 *                           properties:
 *                             month:
 *                               type: string
 *                               example: "六月"
 *                             attendanceRate:
 *                               type: number
 *                               example: 97.8
 *                         worstMonth:
 *                           type: object
 *                           properties:
 *                             month:
 *                               type: string
 *                               example: "一月"
 *                             attendanceRate:
 *                               type: number
 *                               example: 92.5
 *                         improvementTrend:
 *                           type: string
 *                           enum: [improving, declining, stable]
 *                           example: "improving"
 *                     absentAnalysis:
 *                       type: object
 *                       properties:
 *                         totalAbsentDays:
 *                           type: integer
 *                           example: 1998
 *                         sickLeavePercentage:
 *                           type: number
 *                           example: 65.2
 *                         personalLeavePercentage:
 *                           type: number
 *                           example: 28.5
 *                         unexcusedPercentage:
 *                           type: number
 *                           example: 6.3
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/statistics/yearly', AttendanceCenterController.getYearlyStatistics);

/**
* @swagger
 * /api/attendance-center/statistics/by-class:
 *   get:
 *     summary: 按班级统计考勤数据
 *     description: 获取指定幼儿园各班级的考勤统计数据，支持自定义时间范围，提供班级排名和对比分析
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-01"
 *         description: 开始日期（可选，默认本月第一天）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         description: 结束日期（可选，默认本月最后一天）
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           example: false
 *         description: 是否包含已停用班级（可选，默认false）
 *     responses:
 *       200:
 *         description: 成功获取按班级统计的考勤数据
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
 *                     dateRange:
 *                       type: string
 *                       example: "2023-12-01 至 2023-12-31"
 *                       description: 统计日期范围
 *                     totalClasses:
 *                       type: integer
 *                       example: 8
 *                       description: 统计班级总数
 *                     averageAttendanceRate:
 *                       type: number
 *                       example: 94.6
 *                       description: 全园平均出勤率
 *                     classStatistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           classId:
 *                             type: integer
 *                             example: 1
 *                           className:
 *                             type: string
 *                             example: "小班A班"
 *                           teacherName:
 *                             type: string
 *                             example: "张老师"
 *                           totalStudents:
 *                             type: integer
 *                             example: 25
 *                           presentDays:
 *                             type: integer
 *                             example: 525
 *                           attendanceRate:
 *                             type: number
 *                             example: 96.8
 *                           ranking:
 *                             type: integer
 *                             example: 1
 *                           absentCount:
 *                             type: integer
 *                             example: 8
 *                           lateCount:
 *                             type: integer
 *                             example: 3
 *                           performance:
 *                             type: string
 *                             enum: [excellent, good, average, poor]
 *                             example: "excellent"
 *                     performanceDistribution:
 *                       type: object
 *                       properties:
 *                         excellent:
 *                           type: integer
 *                           example: 3
 *                         good:
 *                           type: integer
 *                           example: 4
 *                         average:
 *                           type: integer
 *                           example: 1
 *                         poor:
 *                           type: integer
 *                           example: 0
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/statistics/by-class', AttendanceCenterController.getStatisticsByClass);

/**
* @swagger
 * /api/attendance-center/statistics/by-age:
 *   get:
 *     summary: 按年龄段统计考勤数据
 *     description: 获取指定幼儿园各年龄段（小班、中班、大班）的考勤统计数据，提供年龄段的出勤规律分析
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-01"
 *         description: 开始日期（可选，默认本月第一天）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         description: 结束日期（可选，默认本月最后一天）
 *     responses:
 *       200:
 *         description: 成功获取按年龄段统计的考勤数据
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
 *                     dateRange:
 *                       type: string
 *                       example: "2023-12-01 至 2023-12-31"
 *                       description: 统计日期范围
 *                     totalStudents:
 *                       type: integer
 *                       example: 150
 *                       description: 统计学生总数
 *                     ageGroupStatistics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           ageGroup:
 *                             type: string
 *                             enum: [小班, 中班, 大班]
 *                             example: "小班"
 *                           ageRange:
 *                             type: string
 *                             example: "3-4岁"
 *                           studentCount:
 *                             type: integer
 *                             example: 50
 *                           classCount:
 *                             type: integer
 *                             example: 2
 *                           attendanceRate:
 *                             type: number
 *                             example: 95.2
 *                           presentDays:
 *                             type: integer
 *                             example: 1050
 *                           absentDays:
 *                             type: integer
 *                             example: 50
 *                           sickDays:
 *                             type: integer
 *                             example: 35
 *                           personalLeaveDays:
 *                             type: integer
 *                             example: 15
 *                           ranking:
 *                             type: integer
 *                             example: 1
 *                     ageGroupComparison:
 *                       type: object
 *                       properties:
 *                         bestPerformingGroup:
 *                           type: string
 *                           example: "小班"
 *                           description: 出勤率最高的年龄段
 *                         attendanceGap:
 *                           type: number
 *                           example: 3.8
 *                           description: 最高与最低出勤率的差距
 *                         healthInsights:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               ageGroup:
 *                                 type: string
 *                                 example: "小班"
 *                               healthIssue:
 *                                 type: string
 *                                 example: "感冒多发"
 *                               suggestion:
 *                                 type: string
 *                                 example: "加强健康教育和营养指导"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/statistics/by-age', AttendanceCenterController.getStatisticsByAge);

/**
* @swagger
 * /api/attendance-center/records:
 *   get:
 *     summary: 获取考勤记录列表
 *     description: 获取幼儿园的考勤记录，支持多条件筛选和分页查询，提供详细的考勤信息和导出功能
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 班级ID（可选）
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *           example: 123
 *         description: 学生ID（可选）
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-01"
 *         description: 开始日期（可选）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         description: 结束日期（可选）
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, late, leave_early, sick_leave, personal_leave]
 *           example: "present"
 *         description: 考勤状态（可选）
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           example: 1
 *           minimum: 1
 *         description: 页码（可选，默认1）
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           example: 20
 *           minimum: 1
 *           maximum: 100
 *         description: 每页数量（可选，默认20）
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [date, class, student, status, check_in_time]
 *           example: "date"
 *         description: 排序字段（可选，默认date）
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           example: "desc"
 *         description: 排序方向（可选，默认desc）
 *     responses:
 *       200:
 *         description: 成功获取考勤记录列表
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1234
 *                             description: 考勤记录ID
 *                           studentId:
 *                             type: integer
 *                             example: 123
 *                           studentName:
 *                             type: string
 *                             example: "张三"
 *                           classId:
 *                             type: integer
 *                             example: 1
 *                           className:
 *                             type: string
 *                             example: "小班A班"
 *                           attendanceDate:
 *                             type: string
 *                             format: date
 *                             example: "2023-12-01"
 *                           status:
 *                             type: string
 *                             example: "present"
 *                           checkInTime:
 *                             type: string
 *                             format: time
 *                             example: "08:30"
 *                           checkOutTime:
 *                             type: string
 *                             format: time
 *                             example: "16:30"
 *                           temperature:
 *                             type: number
 *                             example: 36.5
 *                           healthStatus:
 *                             type: string
 *                             example: "正常"
 *                           notes:
 *                             type: string
 *                             example: "精神状态良好"
 *                           recordedBy:
 *                             type: string
 *                             example: "李老师"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2023-12-01T08:35:00Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         totalItems:
 *                           type: integer
 *                           example: 150
 *                         totalPages:
 *                           type: integer
 *                           example: 8
 *                         hasNext:
 *                           type: boolean
 *                           example: true
 *                         hasPrev:
 *                           type: boolean
 *                           example: false
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                           example: 150
 *                         presentCount:
 *                           type: integer
 *                           example: 120
 *                         absentCount:
 *                           type: integer
 *                           example: 25
 *                         lateCount:
 *                           type: integer
 *                           example: 5
 *                         attendanceRate:
 *                           type: number
 *                           example: 80.0
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/records', AttendanceCenterController.getAllRecords);

/**
* @swagger
 * /api/attendance-center/records/{id}:
 *   put:
 *     summary: 修改考勤记录
 *     description: 园长或管理员权限，修改指定的考勤记录，包括状态、时间、健康信息等，所有修改都会记录操作日志
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1234
 *         description: 考勤记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [present, absent, late, leave_early, sick_leave, personal_leave]
 *                 example: "sick_leave"
 *                 description: 考勤状态
 *               checkInTime:
 *                 type: string
 *                 format: time
 *                 example: "08:45"
 *                 description: 签到时间
 *               checkOutTime:
 *                 type: string
 *                 format: time
 *                 example: "16:15"
 *                 description: 签退时间
 *               temperature:
 *                 type: number
 *                 example: 37.2
 *                 description: 体温（摄氏度）
 *               healthStatus:
 *                 type: string
 *                 example: "轻微感冒"
 *                 description: 健康状态
 *               notes:
 *                 type: string
 *                 example: "学生状态良好，正常参与活动"
 *                 description: 备注
 *               leaveReason:
 *                 type: string
 *                 example: "家庭事务"
 *                 description: 请假原因
 *               changeReason:
 *                 type: string
 *                 required: true
 *                 example: "家长电话确认实际为病假"
 *                 description: 修改原因（必填）
 *     responses:
 *       200:
 *         description: 成功修改考勤记录
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
 *                     id:
 *                       type: integer
 *                       example: 1234
 *                     previousStatus:
 *                       type: string
 *                       example: "absent"
 *                     newStatus:
 *                       type: string
 *                       example: "sick_leave"
 *                     changeReason:
 *                       type: string
 *                       example: "家长电话确认实际为病假"
 *                     changedBy:
 *                       type: string
 *                       example: "园长"
 *                     changedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T14:30:00Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.put('/records/:id', AttendanceCenterController.updateRecord);

/**
* @swagger
 * /api/attendance-center/records/{id}:
 *   delete:
 *     summary: 删除考勤记录
 *     description: 园长或管理员权限，删除指定的考勤记录，删除操作不可恢复，需要提供删除原因
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1234
 *         description: 考勤记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - deleteReason
 *             properties:
 *               deleteReason:
 *                 type: string
 *                 example: "重复录入，需要删除"
 *                 description: 删除原因（必填）
 *     responses:
 *       200:
 *         description: 成功删除考勤记录
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
 *                     deletedRecordId:
 *                       type: integer
 *                       example: 1234
 *                     deleteReason:
 *                       type: string
 *                       example: "重复录入，需要删除"
 *                     deletedBy:
 *                       type: string
 *                       example: "园长"
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T14:30:00Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.delete('/records/:id', AttendanceCenterController.deleteRecord);

/**
* @swagger
 * /api/attendance-center/records/reset:
 *   post:
 *     summary: 重置考勤记录
 *     description: 园长或管理员权限，重置指定考勤记录为默认状态，通常用于数据错误修正
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 1234
 *                 description: 考勤记录ID（必填）
 *               changeReason:
 *                 type: string
 *                 example: "系统错误导致数据异常，需要重置"
 *                 description: 重置原因（可选）
 *     responses:
 *       200:
 *         description: 成功重置考勤记录
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
 *                     recordId:
 *                       type: integer
 *                       example: 1234
 *                     previousState:
 *                       type: object
 *                       example:
 *                       - status: "absent"
 *                       - checkInTime: null
 *                       - checkOutTime: null
 *                     resetState:
 *                       type: object
 *                       example:
 *                       - status: "present"
 *                       - checkInTime: "08:30"
 *                       - checkOutTime: "16:30"
 *                     resetReason:
 *                       type: string
 *                       example: "系统错误导致数据异常，需要重置"
 *                     resetBy:
 *                       type: string
 *                       example: "园长"
 *                     resetAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T14:30:00Z"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/records/reset', AttendanceCenterController.resetRecord);

/**
* @swagger
 * /api/attendance-center/abnormal:
 *   get:
 *     summary: 获取异常考勤分析
 *     description: 获取指定时间段内的异常考勤情况分析，包括频繁缺勤、异常模式、预警建议等
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-01"
 *         description: 开始日期（可选，默认本月第一天）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         description: 结束日期（可选，默认本月最后一天）
 *       - in: query
 *         name: alertLevel
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           example: "medium"
 *         description: 预警级别筛选（可选）
 *     responses:
 *       200:
 *         description: 成功获取异常考勤分析数据
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
 *                     analysisPeriod:
 *                       type: string
 *                       example: "2023-12-01 至 2023-12-31"
 *                       description: 分析时间段
 *                     totalAbnormalCases:
 *                       type: integer
 *                       example: 25
 *                       description: 异常案例总数
 *                     abnormalPatterns:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           patternType:
 *                             type: string
 *                             enum: [frequent_absence, irregular_schedule, health_issues, behavioral]
 *                             example: "frequent_absence"
 *                           patternDescription:
 *                             type: string
 *                             example: "频繁缺勤"
 *                           affectedStudents:
 *                             type: integer
 *                             example: 8
 *                           severityLevel:
 *                             type: string
 *                             enum: [low, medium, high, critical]
 *                             example: "medium"
 *                     studentAlerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: integer
 *                             example: 123
 *                           studentName:
 *                             type: string
 *                             example: "张三"
 *                           className:
 *                             type: string
 *                             example: "小班A班"
 *                           alertType:
 *                             type: string
 *                             example: "连续缺勤超过3天"
 *                           alertLevel:
 *                             type: string
 *                             example: "high"
 *                           alertReason:
 *                             type: string
 *                             example: "本周连续缺勤4天，建议关注"
 *                           suggestion:
 *                             type: string
 *                             example: "联系家长了解情况，提供必要帮助"
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *                         example: "加强对频繁缺勤学生的关注和家访"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/abnormal', AttendanceCenterController.getAbnormalAnalysis);

/**
* @swagger
 * /api/attendance-center/health:
 *   get:
 *     summary: 获取健康监测数据
 *     description: 获取学生健康监测统计数据，包括体温异常、健康状况分析、流行病趋势等
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *         description: 幼儿园ID
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-01"
 *         description: 开始日期（可选，默认本月第一天）
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *           example: "2023-12-31"
 *         description: 结束日期（可选，默认本月最后一天）
 *       - in: query
 *         name: healthStatus
 *         schema:
 *           type: string
 *           enum: [normal, fever, cough, cold, other]
 *           example: "fever"
 *         description: 健康状态筛选（可选）
 *     responses:
 *       200:
 *         description: 成功获取健康监测数据
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
 *                     monitoringPeriod:
 *                       type: string
 *                       example: "2023-12-01 至 2023-12-31"
 *                       description: 监测时间段
 *                     totalHealthChecks:
 *                       type: integer
 *                       example: 3000
 *                       description: 总健康检查次数
 *                     healthStatusDistribution:
 *                       type: object
 *                       properties:
 *                         normal:
 *                           type: integer
 *                           example: 2850
 *                           description: 正常人数
 *                         fever:
 *                           type: integer
 *                           example: 45
 *                           description: 发热人数
 *                         cough:
 *                           type: integer
 *                           example: 68
 *                           description: 咳嗽人数
 *                         cold:
 *                           type: integer
 *                           example: 37
 *                           description: 感冒人数
 *                     temperatureAnalysis:
 *                       type: object
 *                       properties:
 *                         averageTemperature:
 *                           type: number
 *                           example: 36.6
 *                           description: 平均体温
 *                         feverCount:
 *                           type: integer
 *                           example: 12
 *                           description: 发热人次
 *                         highFeverCount:
 *                           type: integer
 *                           example: 3
 *                           description: 高热人次（≥39°C）
 *                     healthTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             example: "2023-12-01"
 *                           abnormalCount:
 *                             type: integer
 *                             example: 15
 *                           healthScore:
 *                             type: number
 *                             example: 95.0
 *                             description: 健康评分（0-100）
 *                     healthAlerts:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           alertType:
 *                             type: string
 *                             example: "群体性发热"
 *                           severity:
 *                             type: string
 *                             enum: [low, medium, high, critical]
 *                             example: "medium"
 *                           affectedCount:
 *                             type: integer
 *                             example: 8
 *                           description:
 *                             type: string
 *                             example: "小班A班发现多例发热"
 *                           recommendation:
 *                             type: string
 *                             example: "建议加强晨检和教室通风"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.get('/health', AttendanceCenterController.getHealthMonitoring);

/**
* @swagger
 * /api/attendance-center/export:
 *   post:
 *     summary: 导出考勤报表
 *     description: 园长或管理员权限，导出指定时间段的考勤数据报表，支持Excel和PDF格式，包含详细统计和分析
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - kindergartenId
 *               - startDate
 *               - endDate
 *             properties:
 *               kindergartenId:
 *                 type: integer
 *                 example: 1
 *                 description: 幼儿园ID（必填）
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-01"
 *                 description: 开始日期（必填）
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2023-12-31"
 *                 description: 结束日期（必填）
 *               format:
 *                 type: string
 *                 enum: [excel, pdf]
 *                 example: "excel"
 *                 default: "excel"
 *                 description: 导出格式（可选，默认excel）
 *               includeDetails:
 *                 type: boolean
 *                 example: true
 *                 default: true
 *                 description: 是否包含详细记录（可选，默认true）
 *               includeStatistics:
 *                 type: boolean
 *                 example: true
 *                 default: true
 *                 description: 是否包含统计分析（可选，默认true）
 *               includeCharts:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *                 description: 是否包含图表（仅PDF格式，可选，默认false）
 *               reportType:
 *                 type: string
 *                 enum: [summary, detailed, analysis]
 *                 example: "detailed"
 *                 default: "detailed"
 *                 description: 报表类型（可选，默认detailed）
 *     responses:
 *       200:
 *         description: 成功导出考勤报表
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
 *                     exportId:
 *                       type: string
 *                       example: "export_20231201_143022"
 *                       description: 导出任务ID
 *                     downloadUrl:
 *                       type: string
 *                       example: "/api/attendance-center/download/export_20231201_143022.xlsx"
 *                       description: 下载链接
 *                     fileName:
 *                       type: string
 *                       example: "考勤报表_2023-12-01_至_2023-12-31.xlsx"
 *                       description: 文件名
 *                     fileSize:
 *                       type: string
 *                       example: "2.5MB"
 *                       description: 文件大小
 *                     format:
 *                       type: string
 *                       example: "excel"
 *                       description: 导出格式
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T14:30:22Z"
 *                       description: 生成时间
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T20:30:22Z"
 *                       description: 过期时间
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                           example: 3000
 *                         dateRange:
 *                           type: string
 *                           example: "2023-12-01 至 2023-12-31"
 *                         attendanceRate:
 *                           type: number
 *                           example: 94.6
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/export', AttendanceCenterController.exportAttendance);

/**
* @swagger
 * /api/attendance-center/import:
 *   post:
 *     summary: 批量导入考勤数据
 *     description: 园长或管理员权限，批量导入考勤数据，支持Excel文件上传和数据验证，提供导入结果报告
 *     tags:
 *       - 考勤中心管理
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - records
 *             properties:
 *               records:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - studentId
 *                     - classId
 *                     - kindergartenId
 *                     - attendanceDate
 *                     - status
 *                   properties:
 *                     studentId:
 *                       type: integer
 *                       example: 123
 *                       description: 学生ID（必填）
 *                     classId:
 *                       type: integer
 *                       example: 1
 *                       description: 班级ID（必填）
 *                     kindergartenId:
 *                       type: integer
 *                       example: 1
 *                       description: 幼儿园ID（必填）
 *                     attendanceDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-12-01"
 *                       description: 考勤日期（必填）
 *                     status:
 *                       type: string
 *                       enum: [present, absent, late, leave_early, sick_leave, personal_leave]
 *                       example: "present"
 *                       description: 考勤状态（必填）
 *                     checkInTime:
 *                       type: string
 *                       format: time
 *                       example: "08:30"
 *                       description: 签到时间（可选）
 *                     checkOutTime:
 *                       type: string
 *                       format: time
 *                       example: "16:30"
 *                       description: 签退时间（可选）
 *                     temperature:
 *                       type: number
 *                       example: 36.5
 *                       description: 体温（可选）
 *                     healthStatus:
 *                       type: string
 *                       example: "正常"
 *                       description: 健康状态（可选）
 *                     notes:
 *                       type: string
 *                       example: "学生状态良好"
 *                       description: 备注（可选）
 *                     leaveReason:
 *                       type: string
 *                       example: "家中有事"
 *                       description: 请假原因（可选）
 *               validateOnly:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *                 description: 仅验证数据不实际导入（可选，默认false）
 *               skipDuplicates:
 *                 type: boolean
 *                 example: true
 *                 default: true
 *                 description: 跳过重复记录（可选，默认true）
 *               updateExisting:
 *                 type: boolean
 *                 example: false
 *                 default: false
 *                 description: 更新已存在的记录（可选，默认false）
 *     responses:
 *       200:
 *         description: 成功导入考勤数据
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
 *                     importId:
 *                       type: string
 *                       example: "import_20231201_143022"
 *                       description: 导入任务ID
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                           example: 100
 *                           description: 总记录数
 *                         successCount:
 *                           type: integer
 *                           example: 95
 *                           description: 成功导入数
 *                         failureCount:
 *                           type: integer
 *                           example: 5
 *                           description: 失败数
 *                         duplicateCount:
 *                           type: integer
 *                           example: 3
 *                           description: 重复记录数
 *                         updatedCount:
 *                           type: integer
 *                           example: 2
 *                           description: 更新记录数
 *                     details:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           rowIndex:
 *                             type: integer
 *                             example: 1
 *                           status:
 *                             type: string
 *                             enum: [success, failure, duplicate, updated]
 *                             example: "success"
 *                           studentName:
 *                             type: string
 *                             example: "张三"
 *                           message:
 *                             type: string
 *                             example: "导入成功"
 *                           errors:
 *                             type: array
 *                             items:
 *                               type: string
 *                               example: "学生ID不存在"
 *                     validationErrors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "validation_error"
 *                           message:
 *                             type: string
 *                             example: "日期格式不正确"
 *                           rowCount:
 *                             type: integer
 *                             example: 5
 *                     importedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T14:30:22Z"
 *                       description: 导入时间
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.post('/import', AttendanceCenterController.importAttendance);

export default router;

