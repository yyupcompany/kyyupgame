import { Router } from 'express';
import { TeacherAttendanceController } from '../controllers/teacher-attendance.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

/**
* @swagger
 * tags:
 *   - name: TeacherAttendance
 *     description: 教师考勤管理 - 管理教师对学生的考勤记录
*
 * components:
 *   schemas:
 *     AttendanceRecord:
 *       type: object
 *       required:
 *         - studentId
 *         - status
 *       properties:
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *           example: 123
 *         status:
 *           type: string
 *           enum: [present, absent, late, early_leave, sick_leave, personal_leave, excused]
 *           description: 考勤状态
 *           example: "present"
 *         checkInTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$"
 *           description: 签到时间 (HH:mm:ss 格式)
 *           example: "08:30:00"
 *         checkOutTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$"
 *           description: 签退时间 (HH:mm:ss 格式)
 *           example: "16:30:00"
 *         temperature:
 *           type: number
 *           format: decimal
 *           minimum: 35
 *           maximum: 42
 *           description: 体温 (摄氏度)
 *           example: 36.5
 *         healthStatus:
 *           type: string
 *           enum: [normal, abnormal, quarantine]
 *           description: 健康状态
 *           example: "normal"
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: 备注说明
 *           example: "学生状态良好"
 *         leaveReason:
 *           type: string
 *           maxLength: 500
 *           description: 请假原因
 *           example: "身体不适"
*
 *     BatchAttendanceRequest:
 *       type: object
 *       required:
 *         - classId
 *         - kindergartenId
 *         - attendanceDate
 *         - records
 *       properties:
 *         classId:
 *           type: integer
 *           description: 班级ID
 *           example: 1
 *         kindergartenId:
 *           type: integer
 *           description: 幼儿园ID
 *           example: 1
 *         attendanceDate:
 *           type: string
 *           format: date
 *           description: 考勤日期
 *           example: "2024-01-15"
 *         records:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AttendanceRecord'
 *           minItems: 1
 *           description: 考勤记录列表
*
 *     UpdateAttendanceRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [present, absent, late, early_leave, sick_leave, personal_leave, excused]
 *           description: 考勤状态
 *         checkInTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$"
 *           description: 签到时间
 *         checkOutTime:
 *           type: string
 *           pattern: "^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$"
 *           description: 签退时间
 *         temperature:
 *           type: number
 *           format: decimal
 *           minimum: 35
 *           maximum: 42
 *           description: 体温
 *         healthStatus:
 *           type: string
 *           enum: [normal, abnormal, quarantine]
 *           description: 健康状态
 *         notes:
 *           type: string
 *           maxLength: 1000
 *           description: 备注说明
 *         leaveReason:
 *           type: string
 *           maxLength: 500
 *           description: 请假原因
 *         changeReason:
 *           type: string
 *           maxLength: 500
 *           description: 修改原因
*
 *     ExportRequest:
 *       type: object
 *       required:
 *         - classId
 *         - startDate
 *         - endDate
 *       properties:
 *         classId:
 *           type: integer
 *           description: 班级ID
 *           example: 1
 *         startDate:
 *           type: string
 *           format: date
 *           description: 开始日期
 *           example: "2024-01-01"
 *         endDate:
 *           type: string
 *           format: date
 *           description: 结束日期
 *           example: "2024-01-31"
 *         format:
 *           type: string
 *           enum: [excel, pdf]
 *           default: excel
 *           description: 导出格式
 *           example: "excel"
*
 *     AttendanceStatistics:
 *       type: object
 *       properties:
 *         totalStudents:
 *           type: integer
 *           description: 班级总学生数
 *           example: 25
 *         presentCount:
 *           type: integer
 *           description: 出勤人数
 *           example: 23
 *         absentCount:
 *           type: integer
 *           description: 缺勤人数
 *           example: 2
 *         lateCount:
 *           type: integer
 *           description: 迟到人数
 *           example: 1
 *         earlyLeaveCount:
 *           type: integer
 *           description: 早退人数
 *           example: 0
 *         sickLeaveCount:
 *           type: integer
 *           description: 病假人数
 *           example: 1
 *         personalLeaveCount:
 *           type: integer
 *           description: 事假人数
 *           example: 0
 *         attendanceRate:
 *           type: number
 *           format: decimal
 *           description: 出勤率 (百分比)
 *           example: 92.0
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
*
 * security:
 *   - bearerAuth: []
*
 * responses:
 *   UnauthorizedError:
 *     description: 未认证或权限不足
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
 *               example: "认证失败或权限不足"
 *   ForbiddenError:
 *     description: 权限不足
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
 *               example: "FORBIDDEN"
 *             message:
 *               type: string
 *               example: "权限不足"
 *   ValidationError:
 *     description: 请求参数验证失败
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
 *               example: "VALIDATION_ERROR"
 *             message:
 *               type: string
 *               example: "请求参数验证失败"
 *             errors:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   field:
 *                     type: string
 *                     example: "classId"
 *                   message:
 *                     type: string
 *                     example: "班级ID不能为空"
*/

/**
 * 教师考勤路由
 * 基础路径: /api/teacher/attendance
*
 * 权限说明：
 * - 所有接口都需要 JWT 认证
 * - 需要教师或管理员角色权限
 * - 教师只能管理自己负责的班级
*/

// 所有路由都需要认证和教师角色
router.use(verifyToken);
router.use(requireRole(['teacher', 'admin']));

/**
* @swagger
 * /api/teacher/attendance/classes:
 *   get:
 *     tags: [TeacherAttendance]
 *     summary: 获取教师负责的班级列表
 *     description: 获取当前登录教师负责的所有班级信息，包括班级基本信息和学生数量
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取班级列表成功
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
 *                   example: "获取班级列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     classes:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 班级ID
 *                             example: 1
 *                           name:
 *                             type: string
 *                             description: 班级名称
 *                             example: "小班A"
 *                           grade:
 *                             type: string
 *                             description: 年级
 *                             example: "小班"
 *                           studentCount:
 *                             type: integer
 *                             description: 学生数量
 *                             example: 25
 *                           kindergartenId:
 *                             type: integer
 *                             description: 幼儿园ID
 *                             example: 1
 *                           isCurrentTeacher:
 *                             type: boolean
 *                             description: 是否为当前教师负责
 *                             example: true
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: 服务器内部错误
*/
router.get('/classes', TeacherAttendanceController.getTeacherClasses);

/**
* @swagger
 * /api/teacher/attendance/students/{classId}:
 *   get:
 *     tags: [TeacherAttendance]
 *     summary: 获取班级学生列表
 *     description: 获取指定班级的所有学生信息，用于考勤管理
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 班级ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 获取学生列表成功
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
 *                   example: "获取学生列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 学生ID
 *                             example: 123
 *                           name:
 *                             type: string
 *                             description: 学生姓名
 *                             example: "张小明"
 *                           studentNo:
 *                             type: string
 *                             description: 学号
 *                             example: "ST001"
 *                           gender:
 *                             type: integer
 *                             description: 性别 (1:男 2:女)
 *                             example: 1
 *                           birthDate:
 *                             type: string
 *                             format: date
 *                             description: 出生日期
 *                             example: "2019-05-15"
 *                           classId:
 *                             type: integer
 *                             description: 班级ID
 *                             example: 1
 *                           status:
 *                             type: integer
 *                             description: 学生状态 (1:在读)
 *                             example: 1
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 班级不存在或无权限访问
 *       500:
 *         description: 服务器内部错误
*/
router.get('/students/:classId', TeacherAttendanceController.getClassStudents);

/**
* @swagger
 * /api/teacher/attendance/records:
 *   get:
 *     tags: [TeacherAttendance]
 *     summary: 获取考勤记录
 *     description: 根据查询条件获取考勤记录，支持多种筛选和分页
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID
 *         example: 1
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: integer
 *         description: 学生ID
 *         example: 123
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [present, absent, late, early_leave, sick_leave, personal_leave, excused]
 *         description: 考勤状态筛选
 *         example: "present"
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
 *     responses:
 *       200:
 *         description: 获取考勤记录成功
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
 *                   example: "获取考勤记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: 考勤记录ID
 *                             example: 1001
 *                           studentId:
 *                             type: integer
 *                             description: 学生ID
 *                             example: 123
 *                           studentName:
 *                             type: string
 *                             description: 学生姓名
 *                             example: "张小明"
 *                           classId:
 *                             type: integer
 *                             description: 班级ID
 *                             example: 1
 *                           className:
 *                             type: string
 *                             description: 班级名称
 *                             example: "小班A"
 *                           attendanceDate:
 *                             type: string
 *                             format: date
 *                             description: 考勤日期
 *                             example: "2024-01-15"
 *                           status:
 *                             type: string
 *                             description: 考勤状态
 *                             example: "present"
 *                           checkInTime:
 *                             type: string
 *                             format: time
 *                             description: 签到时间
 *                             example: "08:30:00"
 *                           checkOutTime:
 *                             type: string
 *                             format: time
 *                             description: 签退时间
 *                             example: "16:30:00"
 *                           temperature:
 *                             type: number
 *                             format: decimal
 *                             description: 体温
 *                             example: 36.5
 *                           healthStatus:
 *                             type: string
 *                             description: 健康状态
 *                             example: "normal"
 *                           notes:
 *                             type: string
 *                             description: 备注说明
 *                             example: "状态良好"
 *                           leaveReason:
 *                             type: string
 *                             description: 请假原因
 *                             example: ""
 *                           recordedBy:
 *                             type: integer
 *                             description: 记录人ID
 *                             example: 5
 *                           recordedByName:
 *                             type: string
 *                             description: 记录人姓名
 *                             example: "李老师"
 *                           recordedAt:
 *                             type: string
 *                             format: date-time
 *                             description: 记录时间
 *                             example: "2024-01-15T08:35:00.000Z"
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
 *                           example: 150
 *                         totalPages:
 *                           type: integer
 *                           description: 总页数
 *                           example: 8
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         description: 服务器内部错误
*/

/**
* @swagger
 * /api/teacher/attendance/records:
 *   post:
 *     tags: [TeacherAttendance]
 *     summary: 批量创建考勤记录
 *     description: 为指定班级的学生批量创建考勤记录，支持一次性提交多个学生的考勤信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BatchAttendanceRequest'
 *           example:
 *             classId: 1
 *             kindergartenId: 1
 *             attendanceDate: "2024-01-15"
 *             records:
 *               - studentId: 123
 *                 status: "present"
 *                 checkInTime: "08:30:00"
 *                 temperature: 36.5
 *                 healthStatus: "normal"
 *                 notes: "状态良好"
 *               - studentId: 124
 *                 status: "late"
 *                 checkInTime: "08:45:00"
 *                 temperature: 36.8
 *                 healthStatus: "normal"
 *                 notes: "迟到15分钟"
 *     responses:
 *       201:
 *         description: 批量创建考勤记录成功
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
 *                   example: "批量创建考勤记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     createdCount:
 *                       type: integer
 *                       description: 成功创建的记录数量
 *                       example: 25
 *                     failedCount:
 *                       type: integer
 *                       description: 创建失败的记录数量
 *                       example: 0
 *                     failedRecords:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: integer
 *                             description: 学生ID
 *                           reason:
 *                             type: string
 *                             description: 失败原因
 *                       description: 失败记录详情
 *                       example: []
 *                     totalRecords:
 *                       type: integer
 *                       description: 总记录数
 *                       example: 25
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       409:
 *         description: 考勤记录已存在
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
 *                   example: "CONFLICT"
 *                 message:
 *                   type: string
 *                   example: "该学生今日考勤记录已存在"
 *       500:
 *         description: 服务器内部错误
*/
router.get('/records', TeacherAttendanceController.getAttendanceRecords);

router.post('/records', TeacherAttendanceController.createAttendanceRecords);

/**
* @swagger
 * /api/teacher/attendance/records/{id}:
 *   put:
 *     tags: [TeacherAttendance]
 *     summary: 更新考勤记录（仅当天）
 *     description: 更新指定ID的考勤记录，只能修改当天的记录，需要提供修改原因
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 考勤记录ID
 *         example: 1001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateAttendanceRequest'
 *           example:
 *             status: "early_leave"
 *             checkOutTime: "15:30:00"
 *             notes: "家长提前接走"
 *             changeReason: "家长有事提前接孩子"
 *     responses:
 *       200:
 *         description: 更新考勤记录成功
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
 *                   example: "更新考勤记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 考勤记录ID
 *                       example: 1001
 *                     studentId:
 *                       type: integer
 *                       description: 学生ID
 *                       example: 123
 *                     attendanceDate:
 *                       type: string
 *                       format: date
 *                       description: 考勤日期
 *                       example: "2024-01-15"
 *                     status:
 *                       type: string
 *                       description: 更新后的考勤状态
 *                       example: "early_leave"
 *                     checkOutTime:
 *                       type: string
 *                       format: time
 *                       description: 更新后的签退时间
 *                       example: "15:30:00"
 *                     notes:
 *                       type: string
 *                       description: 更新后的备注
 *                       example: "家长提前接走"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 更新时间
 *                       example: "2024-01-15T15:35:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 考勤记录不存在
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
 *                   example: "考勤记录不存在"
 *       409:
 *         description: 不能修改非当天的考勤记录
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
 *                   example: "FORBIDDEN_OPERATION"
 *                 message:
 *                   type: string
 *                   example: "只能修改当天的考勤记录"
 *       500:
 *         description: 服务器内部错误
*/
router.put('/records/:id', TeacherAttendanceController.updateAttendanceRecord);

/**
* @swagger
 * /api/teacher/attendance/statistics:
 *   get:
 *     tags: [TeacherAttendance]
 *     summary: 获取班级考勤统计数据
 *     description: 获取指定班级在指定时间段内的考勤统计信息，包括出勤率、各状态人数等
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 班级ID
 *         example: 1
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
 *                   $ref: '#/components/schemas/AttendanceStatistics'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 班级不存在或无权限访问
 *       500:
 *         description: 服务器内部错误
*/

/**
* @swagger
 * /api/teacher/attendance/export:
 *   post:
 *     tags: [TeacherAttendance]
 *     summary: 导出班级考勤报表
 *     description: 导出指定班级在指定时间段内的考勤报表，支持Excel和PDF格式
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ExportRequest'
 *           example:
 *             classId: 1
 *             startDate: "2024-01-01"
 *             endDate: "2024-01-31"
 *             format: "excel"
 *     responses:
 *       200:
 *         description: 导出报表成功
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
 *                   example: "导出报表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     downloadUrl:
 *                       type: string
 *                       description: 文件下载链接
 *                       example: "/api/teacher/attendance/download/attendance_report_20240101_20240131.xlsx"
 *                     fileName:
 *                       type: string
 *                       description: 文件名
 *                       example: "attendance_report_20240101_20240131.xlsx"
 *                     fileSize:
 *                       type: string
 *                       description: 文件大小
 *                       example: "2.5MB"
 *                     format:
 *                       type: string
 *                       description: 文件格式
 *                       example: "excel"
 *                     generatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: 生成时间
 *                       example: "2024-01-31T16:30:00.000Z"
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       description: 链接过期时间
 *                       example: "2024-01-31T18:30:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 班级不存在或无权限访问
 *       410:
 *         description: 导出文件已过期
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
 *                   example: "FILE_EXPIRED"
 *                 message:
 *                   type: string
 *                   example: "导出文件已过期，请重新导出"
 *       500:
 *         description: 服务器内部错误或导出失败
*/
router.get('/statistics', TeacherAttendanceController.getStatistics);

router.post('/export', TeacherAttendanceController.exportAttendance);

export default router;

