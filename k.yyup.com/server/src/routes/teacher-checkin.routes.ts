import express from 'express';
import teacherCheckinController from '../controllers/teacher-checkin.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = express.Router();

/**
* @swagger
 * tags:
 *   - name: TeacherCheckin
 *     description: 教师打卡管理 - 管理教师上下班打卡、请假申请和考勤统计
*
 * components:
 *   schemas:
 *     TeacherCheckin:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 打卡记录ID
 *           example: 1001
 *         teacherId:
 *           type: integer
 *           description: 教师ID
 *           example: 5
 *         teacherName:
 *           type: string
 *           description: 教师姓名
 *           example: "李老师"
 *         checkInTime:
 *           type: string
 *           format: date-time
 *           description: 签到时间
 *           example: "2024-01-15T08:30:00.000Z"
 *         checkOutTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 签退时间
 *           example: "2024-01-15T16:30:00.000Z"
 *         workDate:
 *           type: string
 *           format: date
 *           description: 工作日期
 *           example: "2024-01-15"
 *         workHours:
 *           type: number
 *           format: decimal
 *           description: 工作时长（小时）
 *           example: 8.0
 *         status:
 *           type: string
 *           enum: [normal, late, early_leave, absent, leave]
 *           description: 考勤状态
 *           example: "normal"
 *         isCompleted:
 *           type: boolean
 *           description: 是否完成当日考勤
 *           example: true
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: 备注说明
 *           example: "正常工作日"
*
 *     LeaveRequest:
 *       type: object
 *       required:
 *         - leaveType
 *         - startDate
 *         - endDate
 *         - reason
 *       properties:
 *         leaveType:
 *           type: string
 *           enum: [sick, personal, annual, maternity, emergency, other]
 *           description: 请假类型
 *           example: "sick"
 *         startDate:
 *           type: string
 *           format: date
 *           description: 开始日期
 *           example: "2024-01-16"
 *         endDate:
 *           type: string
 *           format: date
 *           description: 结束日期
 *           example: "2024-01-17"
 *         startTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *           description: 开始时间 (HH:mm 格式)
 *           example: "09:00"
 *         endTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9]$"
 *           description: 结束时间 (HH:mm 格式)
 *           example: "18:00"
 *         reason:
 *           type: string
 *           maxLength: 1000
 *           description: 请假原因
 *           example: "身体不适，需要就医"
 *         attachments:
 *           type: array
 *           items:
 *             type: string
 *           description: 附件文件列表
 *           example: ["medical_certificate.pdf"]
 *         contactPhone:
 *           type: string
 *           pattern: "^1[3-9]\\d{9}$"
 *           description: 联系电话
 *           example: "13800138000"
 *         emergencyContact:
 *           type: string
 *           description: 紧急联系人
 *           example: "王老师"
*
 *     LeaveApproval:
 *       type: object
 *       required:
 *         - requestId
 *         - action
 *       properties:
 *         requestId:
 *           type: integer
 *           description: 请假申请ID
 *           example: 2001
 *         action:
 *           type: string
 *           enum: [approve, reject]
 *           description: 审批动作
 *           example: "approve"
 *         comment:
 *           type: string
 *           maxLength: 500
 *           description: 审批意见
 *           example: "同意请假"
*
 *     CheckinStatistics:
 *       type: object
 *       properties:
 *         period:
 *           type: object
 *           properties:
 *             startDate:
 *               type: string
 *               format: date
 *               description: 统计开始日期
 *             endDate:
 *               type: string
 *               format: date
 *               description: 统计结束日期
 *         workDays:
 *           type: integer
 *           description: 工作天数
 *           example: 22
 *         presentDays:
 *           type: integer
 *           description: 正常出勤天数
 *           example: 20
 *         lateDays:
 *           type: integer
 *           description: 迟到天数
 *           example: 1
 *         earlyLeaveDays:
 *           type: integer
 *           description: 早退天数
 *           example: 0
 *         leaveDays:
 *           type: integer
 *           description: 请假天数
 *           example: 1
 *         absentDays:
 *           type: integer
 *           description: 缺勤天数
 *           example: 0
 *         totalWorkHours:
 *           type: number
 *           format: decimal
 *           description: 总工作时长
 *           example: 176.0
 *         averageWorkHours:
 *           type: number
 *           format: decimal
 *           description: 平均工作时长
 *           example: 8.8
 *         attendanceRate:
 *           type: number
 *           format: decimal
 *           description: 出勤率 (百分比)
 *           example: 95.5
*
 * security:
 *   - bearerAuth: []
*
 * responses:
 *   UnauthorizedError:
 *     description: 未认证或token无效
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             code:
 *               type: string
 *               example: "UNAUTHORIZED"
 *             message:
 *               type: string
 *               example: "认证失败"
 *   AlreadyCheckedInError:
 *     description: 已经签到
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             code:
 *               type: string
 *               example: "ALREADY_CHECKED_IN"
 *             message:
 *               type: string
 *               example: "今日已签到，请勿重复操作"
 *   NotCheckedInError:
 *     description: 尚未签到
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             code:
 *               type: string
 *               example: "NOT_CHECKED_IN"
 *             message:
 *               type: string
 *               example: "请先签到后再签退"
*/

/**
 * 教师打卡路由
 * 基础路径: /api/teacher-checkin
*
 * 权限说明：
 * - 所有接口都需要 JWT 认证
 * - 教师只能查看和操作自己的考勤记录
 * - 管理员可以查看所有教师的考勤记录和审批请假申请
*/

/**
* @swagger
 * /api/teacher-checkin/check-in:
 *   post:
 *     tags: [TeacherCheckin]
 *     summary: 教师签到
 *     description: 教师进行上班签到，记录签到时间和位置信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     format: decimal
 *                     description: 纬度
 *                     example: 39.9042
 *                   longitude:
 *                     type: number
 *                     format: decimal
 *                     description: 经度
 *                     example: 116.4074
 *                   address:
 *                     type: string
 *                     description: 签到地址
 *                     example: "北京市朝阳区幼儿园"
 *                 description: 签到位置信息（可选）
 *               notes:
 *                 type: string
 *                 maxLength: 200
 *                 description: 签到备注
 *                 example: "准时到校"
 *               deviceInfo:
 *                 type: string
 *                 description: 设备信息
 *                 example: "iPhone 13 Pro"
 *             example:
 *               location:
 *                 latitude: 39.9042
 *                 longitude: 116.4074
 *                 address: "北京市朝阳区幼儿园"
 *               notes: "准时到校"
 *               deviceInfo: "iPhone 13 Pro"
 *     responses:
 *       201:
 *         description: 签到成功
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
 *                   example: "签到成功"
 *                 data:
 *                   $ref: '#/components/schemas/TeacherCheckin'
 *       400:
 *         description: 请求参数错误或时间不在允许范围内
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "INVALID_TIME"
 *                 message:
 *                   type: string
 *                   example: "不在允许的签到时间范围内"
 *       409:
 *         $ref: '#/components/responses/AlreadyCheckedInError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: 服务器内部错误
*/
router.post('/check-in', verifyToken, (req, res) => {
  teacherCheckinController.checkIn(req, res);
});

/**
* @swagger
 * /api/teacher-checkin/check-out:
 *   post:
 *     tags: [TeacherCheckin]
 *     summary: 教师签退
 *     description: 教师进行下班签退，计算工作时长
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               location:
 *                 type: object
 *                 properties:
 *                   latitude:
 *                     type: number
 *                     format: decimal
 *                     description: 纬度
 *                   longitude:
 *                     type: number
 *                     format: decimal
 *                     description: 经度
 *                   address:
 *                     type: string
 *                     description: 签退地址
 *                 description: 签退位置信息（可选）
 *               notes:
 *                 type: string
 *                 maxLength: 200
 *                 description: 签退备注
 *                 example: "完成今日工作"
 *               workSummary:
 *                 type: string
 *                 maxLength: 1000
 *                 description: 工作总结
 *                 example: "今日完成了教学计划和班级管理"
 *             example:
 *               location:
 *                 latitude: 39.9042
 *                 longitude: 116.4074
 *                 address: "北京市朝阳区幼儿园"
 *               notes: "完成今日工作"
 *               workSummary: "今日完成了教学计划和班级管理"
 *     responses:
 *       200:
 *         description: 签退成功
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
 *                   example: "签退成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 打卡记录ID
 *                       example: 1001
 *                     checkInTime:
 *                       type: string
 *                       format: date-time
 *                       description: 签到时间
 *                       example: "2024-01-15T08:30:00.000Z"
 *                     checkOutTime:
 *                       type: string
 *                       format: date-time
 *                       description: 签退时间
 *                       example: "2024-01-15T16:30:00.000Z"
 *                     workHours:
 *                       type: number
 *                       format: decimal
 *                       description: 工作时长（小时）
 *                       example: 8.0
 *                     status:
 *                       type: string
 *                       description: 考勤状态
 *                       example: "normal"
 *       400:
 *         description: 请求参数错误或时间不在允许范围内
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "INVALID_TIME"
 *                 message:
 *                   type: string
 *                   example: "不在允许的签退时间范围内"
 *       409:
 *         $ref: '#/components/responses/NotCheckedInError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: 服务器内部错误
*/
router.post('/check-out', verifyToken, (req, res) => {
  teacherCheckinController.checkOut(req, res);
});

/**
* @swagger
 * /api/teacher-checkin/today:
 *   get:
 *     tags: [TeacherCheckin]
 *     summary: 获取今日考勤记录
 *     description: 获取当前教师今日的考勤记录，包括签到状态和工作情况
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取今日考勤成功
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
 *                   example: "获取今日考勤成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     hasRecord:
 *                       type: boolean
 *                       description: 是否有考勤记录
 *                       example: true
 *                     checkinRecord:
 *                       $ref: '#/components/schemas/TeacherCheckin'
 *                     canCheckIn:
 *                       type: boolean
 *                       description: 是否可以签到
 *                       example: false
 *                     canCheckOut:
 *                       type: boolean
 *                       description: 是否可以签退
 *                       example: true
 *                     currentTime:
 *                       type: string
 *                       format: date-time
 *                       description: 当前服务器时间
 *                       example: "2024-01-15T14:30:00.000Z"
 *                     workingTimeLimit:
 *                       type: object
 *                       properties:
 *                         checkInStart:
 *                           type: string
 *                           format: time
 *                           description: 最早签到时间
 *                           example: "07:30"
 *                         checkInEnd:
 *                           type: string
 *                           format: time
 *                           description: 最晚签到时间
 *                           example: "09:30"
 *                         checkOutStart:
 *                           type: string
 *                           format: time
 *                           description: 最早签退时间
 *                           example: "16:00"
 *                         checkOutEnd:
 *                           type: string
 *                           format: time
 *                           description: 最晚签退时间
 *                           example: "19:00"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: 服务器内部错误
*/
router.get('/today', verifyToken, (req, res) => {
  teacherCheckinController.getTodayAttendance(req, res);
});

/**
* @swagger
 * /api/teacher-checkin/month:
 *   get:
 *     tags: [TeacherCheckin]
 *     summary: 获取本月考勤记录
 *     description: 获取当前教师本月的考勤记录，支持按月份查询
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *           description: 年份（不传则默认当前年份）
 *           example: 2024
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 12
 *           description: 月份（不传则默认当前月份）
 *           example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 20
 *         description: 每页数量
 *         example: 20
 *     responses:
 *       200:
 *         description: 获取本月考勤记录成功
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
 *                   example: "获取本月考勤记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TeacherCheckin'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           description: 当前页码
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           description: 每页数量
 *                           example: 20
 *                         totalItems:
 *                           type: integer
 *                           description: 总记录数
 *                           example: 22
 *                         totalPages:
 *                           type: integer
 *                           description: 总页数
 *                           example: 2
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalDays:
 *                           type: integer
 *                           description: 本月总天数
 *                           example: 31
 *                         workDays:
 *                           type: integer
 *                           description: 工作天数
 *                           example: 22
 *                         presentDays:
 *                           type: integer
 *                           description: 正常出勤天数
 *                           example: 20
 *                         lateDays:
 *                           type: integer
 *                           description: 迟到天数
 *                           example: 1
 *                         leaveDays:
 *                           type: integer
 *                           description: 请假天数
 *                           example: 1
 *                         absentDays:
 *                           type: integer
 *                           description: 缺勤天数
 *                           example: 0
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         description: 服务器内部错误
*/
router.get('/month', verifyToken, (req, res) => {
  teacherCheckinController.getMonthAttendance(req, res);
});

/**
* @swagger
 * /api/teacher-checkin/leave:
 *   post:
 *     tags: [TeacherCheckin]
 *     summary: 创建请假申请
 *     description: 教师提交请假申请，支持不同类型的请假
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveRequest'
 *           example:
 *             leaveType: "sick"
 *             startDate: "2024-01-16"
 *             endDate: "2024-01-17"
 *             startTime: "09:00"
 *             endTime: "18:00"
 *             reason: "身体不适，需要就医"
 *             contactPhone: "13800138000"
 *             emergencyContact: "王老师"
 *     responses:
 *       201:
 *         description: 请假申请创建成功
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
 *                   example: "请假申请提交成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 申请ID
 *                       example: 2001
 *                     leaveType:
 *                       type: string
 *                       description: 请假类型
 *                       example: "sick"
 *                     startDate:
 *                       type: string
 *                       format: date
 *                       description: 开始日期
 *                       example: "2024-01-16"
 *                     endDate:
 *                       type: string
 *                       format: date
 *                       description: 结束日期
 *                       example: "2024-01-17"
 *                     status:
 *                       type: string
 *                       enum: [pending, approved, rejected]
 *                       description: 申请状态
 *                       example: "pending"
 *                     submittedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 提交时间
 *                       example: "2024-01-15T16:00:00.000Z"
 *       400:
 *         description: 请求参数验证失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *                 message:
 *                   type: string
 *                   example: "请假日期范围无效"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       409:
 *         description: 存在时间冲突的请假申请
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "TIME_CONFLICT"
 *                 message:
 *                   type: string
 *                   example: "该时间段已存在请假申请"
 *       500:
 *         description: 服务器内部错误
*/
router.post('/leave', verifyToken, (req, res) => {
  teacherCheckinController.createLeaveRequest(req, res);
});

/**
* @swagger
 * /api/teacher-checkin/statistics:
 *   get:
 *     tags: [TeacherCheckin]
 *     summary: 获取考勤统计数据
 *     description: 获取指定时间段内的考勤统计信息，支持自定义时间段查询
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 统计开始日期
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: 统计结束日期
 *         example: "2024-01-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [day, week, month, year]
 *           default: month
 *         description: 统计类型
 *         example: "month"
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *         description: 教师ID（管理员查询其他教师时使用）
 *         example: 5
 *     responses:
 *       200:
 *         description: 获取统计数据成功
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
 *                   example: "获取统计数据成功"
 *                 data:
 *                   $ref: '#/components/schemas/CheckinStatistics'
 *       400:
 *         description: 请求参数验证失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *                 message:
 *                   type: string
 *                   example: "日期范围无效"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 权限不足（非管理员查询其他教师数据）
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "FORBIDDEN"
 *                 message:
 *                   type: string
 *                   example: "权限不足"
 *       500:
 *         description: 服务器内部错误
*/
router.get('/statistics', verifyToken, (req, res) => {
  teacherCheckinController.getStatistics(req, res);
});

/**
* @swagger
 * /api/teacher-checkin/history:
 *   get:
 *     tags: [TeacherCheckin]
 *     summary: 获取考勤历史记录
 *     description: 获取教师的考勤历史记录，包括打卡记录和请假申请
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *         example: "2024-01-01"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *         example: "2024-01-31"
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [all, checkin, leave]
 *           default: all
 *         description: 记录类型筛选
 *         example: "all"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [normal, late, early_leave, absent, leave, pending, approved, rejected]
 *         description: 状态筛选
 *         example: "normal"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页数量
 *         example: 20
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *         description: 教师ID（管理员查询其他教师时使用）
 *         example: 5
 *     responses:
 *       200:
 *         description: 获取历史记录成功
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
 *                   example: "获取历史记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         oneOf:
 *                           - $ref: '#/components/schemas/TeacherCheckin'
 *                           - type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 description: 请假申请ID
 *                                 example: 2001
 *                               type:
 *                                 type: string
 *                                 enum: [leave]
 *                                 description: 记录类型
 *                                 example: "leave"
 *                               leaveType:
 *                                 type: string
 *                                 description: 请假类型
 *                                 example: "sick"
 *                               startDate:
 *                                 type: string
 *                                 format: date
 *                                 description: 请假开始日期
 *                                 example: "2024-01-16"
 *                               endDate:
 *                                 type: string
 *                                 format: date
 *                                 description: 请假结束日期
 *                                 example: "2024-01-17"
 *                               status:
 *                                 type: string
 *                                 description: 申请状态
 *                                 example: "approved"
 *                               reason:
 *                                 type: string
 *                                 description: 请假原因
 *                                 example: "身体不适"
 *                               submittedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 description: 提交时间
 *                                 example: "2024-01-15T16:00:00.000Z"
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: integer
 *                           description: 当前页码
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           description: 每页数量
 *                           example: 20
 *                         totalItems:
 *                           type: integer
 *                           description: 总记录数
 *                           example: 50
 *                         totalPages:
 *                           type: integer
 *                           description: 总页数
 *                           example: 3
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalRecords:
 *                           type: integer
 *                           description: 总记录数
 *                           example: 50
 *                         checkinRecords:
 *                           type: integer
 *                           description: 打卡记录数
 *                           example: 45
 *                         leaveRecords:
 *                           type: integer
 *                           description: 请假记录数
 *                           example: 5
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
*/
router.get('/history', verifyToken, (req, res) => {
  teacherCheckinController.getHistory(req, res);
});

/**
* @swagger
 * /api/teacher-checkin/approve:
 *   post:
 *     tags: [TeacherCheckin]
 *     summary: 审核请假申请（管理员）
 *     description: 管理员审核教师的请假申请，支持批准或拒绝
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LeaveApproval'
 *           example:
 *             requestId: 2001
 *             action: "approve"
 *             comment: "同意请假，请安排好工作交接"
 *     responses:
 *       200:
 *         description: 审核操作成功
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
 *                   example: "请假申请审核成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 申请ID
 *                       example: 2001
 *                     status:
 *                       type: string
 *                       description: 审核后状态
 *                       example: "approved"
 *                     approvedBy:
 *                       type: integer
 *                       description: 审核人ID
 *                       example: 1
 *                     approvedByName:
 *                       type: string
 *                       description: 审核人姓名
 *                       example: "园长"
 *                     approvedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 审核时间
 *                       example: "2024-01-15T17:00:00.000Z"
 *                     comment:
 *                       type: string
 *                       description: 审核意见
 *                       example: "同意请假，请安排好工作交接"
 *       400:
 *         description: 请求参数验证失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "VALIDATION_ERROR"
 *                 message:
 *                   type: string
 *                   example: "申请ID不能为空"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         description: 权限不足（非管理员）
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "FORBIDDEN"
 *                 message:
 *                   type: string
 *                   example: "只有管理员可以审核请假申请"
 *       404:
 *         description: 请假申请不存在
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "NOT_FOUND"
 *                 message:
 *                   type: string
 *                   example: "请假申请不存在"
 *       409:
 *         description: 申请已审核
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 code:
 *                   type: string
 *                   example: "ALREADY_PROCESSED"
 *                 message:
 *                   type: string
 *                   example: "该申请已经审核过了"
 *       500:
 *         description: 服务器内部错误
*/
router.post('/approve', verifyToken, (req, res) => {
  teacherCheckinController.approveLeaveRequest(req, res);
});

export default router;

