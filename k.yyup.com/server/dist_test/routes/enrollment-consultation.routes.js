"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var enrollment_consultation_controller_1 = __importDefault(require("../controllers/enrollment-consultation.controller"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /enrollment-consultation:
 *   post:
 *     summary: 创建招生咨询记录
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - parentName
 *               - phone
 *               - childName
 *               - childAge
 *               - consultationType
 *             properties:
 *               parentName:
 *                 type: string
 *                 description: 家长姓名
 *                 example: "张三"
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *                 example: "13800138000"
 *               childName:
 *                 type: string
 *                 description: 孩子姓名
 *                 example: "小明"
 *               childAge:
 *                 type: integer
 *                 description: 孩子年龄
 *                 example: 4
 *               childGender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 孩子性别
 *                 example: "male"
 *               consultationType:
 *                 type: string
 *                 enum: [phone, online, visit]
 *                 description: 咨询方式
 *                 example: "phone"
 *               consultationContent:
 *                 type: string
 *                 description: 咨询内容
 *                 example: "想了解课程安排和收费标准"
 *               preferredContactTime:
 *                 type: string
 *                 description: 希望联系时间
 *                 example: "工作日下午"
 *               notes:
 *                 type: string
 *                 description: 备注信息
 *                 example: "对小班制教学感兴趣"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "创建招生咨询记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     parentName:
 *                       type: string
 *                       example: "张三"
 *                     phone:
 *                       type: string
 *                       example: "13800138000"
 *                     childName:
 *                       type: string
 *                       example: "小明"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 */
// 招生咨询CRUD接口
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), enrollment_consultation_controller_1["default"].createConsultation);
/**
 * @swagger
 * /enrollment-consultation:
 *   get:
 *     summary: 获取招生咨询列表
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页条数
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: status
 *         in: query
 *         description: 咨询状态筛选
 *         schema:
 *           type: string
 *           enum: [pending, contacted, visited, enrolled, cancelled]
 *       - name: consultationType
 *         in: query
 *         description: 咨询方式筛选
 *         schema:
 *           type: string
 *           enum: [phone, online, visit]
 *       - name: keyword
 *         in: query
 *         description: 关键字搜索(家长姓名/电话/孩子姓名)
 *         schema:
 *           type: string
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
 *                   example: "获取招生咨询列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 50
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           parentName:
 *                             type: string
 *                             example: "张三"
 *                           phone:
 *                             type: string
 *                             example: "13800138000"
 *                           childName:
 *                             type: string
 *                             example: "小明"
 *                           childAge:
 *                             type: integer
 *                             example: 4
 *                           consultationType:
 *                             type: string
 *                             example: "phone"
 *                           status:
 *                             type: string
 *                             example: "pending"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), function (req, res) {
    res.json({
        success: true,
        message: '获取招生咨询列表成功',
        data: {
            total: 0,
            items: [],
            page: 1,
            pageSize: 10
        }
    });
});
/**
 * @swagger
 * /enrollment-consultation/statistics:
 *   get:
 *     summary: 获取招生咨询统计数据
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: startDate
 *         in: query
 *         description: 开始日期(YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-01-01"
 *       - name: endDate
 *         in: query
 *         description: 结束日期(YYYY-MM-DD)
 *         schema:
 *           type: string
 *           format: date
 *           example: "2024-12-31"
 *       - name: groupBy
 *         in: query
 *         description: 统计分组方式
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
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
 *                   example: "获取统计数据成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalConsultations:
 *                           type: integer
 *                           description: 总咨询数
 *                           example: 120
 *                         pendingCount:
 *                           type: integer
 *                           description: 待处理数量
 *                           example: 15
 *                         contactedCount:
 *                           type: integer
 *                           description: 已联系数量
 *                           example: 80
 *                         enrolledCount:
 *                           type: integer
 *                           description: 已报名数量
 *                           example: 25
 *                         conversionRate:
 *                           type: number
 *                           format: float
 *                           description: 转化率(%)
 *                           example: 20.83
 *                     consultationTypeStats:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "phone"
 *                           count:
 *                             type: integer
 *                             example: 60
 *                           percentage:
 *                             type: number
 *                             format: float
 *                             example: 50.0
 *                     timeSeriesData:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           period:
 *                             type: string
 *                             example: "2024-01"
 *                           count:
 *                             type: integer
 *                             example: 25
 *                           enrolled:
 *                             type: integer
 *                             example: 5
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 */
// 招生咨询统计分析接口 - 注意：这个路由必须放在/:id路由之前
router.get('/statistics', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), enrollment_consultation_controller_1["default"].getConsultationStatistics);
/**
 * @swagger
 * /enrollment-consultation/followups:
 *   post:
 *     summary: 创建咨询跟进记录
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - consultationId
 *               - followupType
 *               - followupContent
 *             properties:
 *               consultationId:
 *                 type: integer
 *                 description: 招生咨询记录ID
 *                 example: 1
 *               followupType:
 *                 type: string
 *                 enum: [phone, email, visit, other]
 *                 description: 跟进方式
 *                 example: "phone"
 *               followupContent:
 *                 type: string
 *                 description: 跟进内容
 *                 example: "电话联系家长，详细介绍了课程安排和收费标准"
 *               nextFollowupDate:
 *                 type: string
 *                 format: date
 *                 description: 下次跟进日期
 *                 example: "2024-02-01"
 *               outcome:
 *                 type: string
 *                 enum: [interested, not_interested, need_more_info, scheduled_visit, enrolled]
 *                 description: 跟进结果
 *                 example: "interested"
 *               notes:
 *                 type: string
 *                 description: 备注信息
 *                 example: "家长表示有意向，希望安排实地参观"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "创建跟进记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     consultationId:
 *                       type: integer
 *                       example: 1
 *                     followupType:
 *                       type: string
 *                       example: "phone"
 *                     followupContent:
 *                       type: string
 *                       example: "电话联系家长，详细介绍了课程安排和收费标准"
 *                     outcome:
 *                       type: string
 *                       example: "interested"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生咨询记录不存在
 */
// 招生咨询跟进接口
router.post('/followups', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), enrollment_consultation_controller_1["default"].createFollowup);
/**
 * @swagger
 * /enrollment-consultation/followups:
 *   get:
 *     summary: 获取跟进记录列表
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: consultationId
 *         in: query
 *         description: 招生咨询记录ID筛选
 *         schema:
 *           type: integer
 *       - name: followupType
 *         in: query
 *         description: 跟进方式筛选
 *         schema:
 *           type: string
 *           enum: [phone, email, visit, other]
 *       - name: outcome
 *         in: query
 *         description: 跟进结果筛选
 *         schema:
 *           type: string
 *           enum: [interested, not_interested, need_more_info, scheduled_visit, enrolled]
 *       - name: page
 *         in: query
 *         description: 页码
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页条数
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
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
 *                   example: "获取跟进记录列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 30
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           consultationId:
 *                             type: integer
 *                             example: 1
 *                           followupType:
 *                             type: string
 *                             example: "phone"
 *                           followupContent:
 *                             type: string
 *                             example: "电话联系家长，详细介绍了课程安排"
 *                           outcome:
 *                             type: string
 *                             example: "interested"
 *                           nextFollowupDate:
 *                             type: string
 *                             format: date
 *                             example: "2024-02-01"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           consultation:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 1
 *                               parentName:
 *                                 type: string
 *                                 example: "张三"
 *                               childName:
 *                                 type: string
 *                                 example: "小明"
 *                               phone:
 *                                 type: string
 *                                 example: "13800138000"
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 10
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 */
router.get('/followups', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), enrollment_consultation_controller_1["default"].getFollowupList);
/**
 * @swagger
 * /enrollment-consultation/followups/{id}:
 *   get:
 *     summary: 根据ID获取跟进记录详情
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 跟进记录ID
 *         schema:
 *           type: integer
 *           example: 1
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
 *                   example: "获取跟进记录详情成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     consultationId:
 *                       type: integer
 *                       example: 1
 *                     followupType:
 *                       type: string
 *                       example: "phone"
 *                     followupContent:
 *                       type: string
 *                       example: "电话联系家长，详细介绍了课程安排和收费标准"
 *                     outcome:
 *                       type: string
 *                       example: "interested"
 *                     nextFollowupDate:
 *                       type: string
 *                       format: date
 *                       example: "2024-02-01"
 *                     notes:
 *                       type: string
 *                       example: "家长表示有意向，希望安排实地参观"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     consultation:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         parentName:
 *                           type: string
 *                           example: "张三"
 *                         childName:
 *                           type: string
 *                           example: "小明"
 *                         phone:
 *                           type: string
 *                           example: "13800138000"
 *                         childAge:
 *                           type: integer
 *                           example: 4
 *                         consultationType:
 *                           type: string
 *                           example: "phone"
 *                         status:
 *                           type: string
 *                           example: "contacted"
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 跟进记录不存在
 */
router.get('/followups/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), enrollment_consultation_controller_1["default"].getFollowupById);
/**
 * @swagger
 * /enrollment-consultation/{id}:
 *   get:
 *     summary: 根据ID获取招生咨询记录详情
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生咨询记录ID
 *         schema:
 *           type: integer
 *           example: 1
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
 *                   example: "获取招生咨询记录详情成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     parentName:
 *                       type: string
 *                       example: "张三"
 *                     phone:
 *                       type: string
 *                       example: "13800138000"
 *                     childName:
 *                       type: string
 *                       example: "小明"
 *                     childAge:
 *                       type: integer
 *                       example: 4
 *                     childGender:
 *                       type: string
 *                       example: "male"
 *                     consultationType:
 *                       type: string
 *                       example: "phone"
 *                     consultationContent:
 *                       type: string
 *                       example: "想了解课程安排和收费标准"
 *                     preferredContactTime:
 *                       type: string
 *                       example: "工作日下午"
 *                     status:
 *                       type: string
 *                       example: "pending"
 *                     notes:
 *                       type: string
 *                       example: "对小班制教学感兴趣"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     followups:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           followupType:
 *                             type: string
 *                             example: "phone"
 *                           followupContent:
 *                             type: string
 *                             example: "电话联系家长"
 *                           outcome:
 *                             type: string
 *                             example: "interested"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生咨询记录不存在
 */
// ID路由必须放在具体路径之后
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), enrollment_consultation_controller_1["default"].getConsultationById);
/**
 * @swagger
 * /enrollment-consultation/{id}:
 *   put:
 *     summary: 更新招生咨询记录
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生咨询记录ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               parentName:
 *                 type: string
 *                 description: 家长姓名
 *                 example: "张三"
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *                 example: "13800138000"
 *               childName:
 *                 type: string
 *                 description: 孩子姓名
 *                 example: "小明"
 *               childAge:
 *                 type: integer
 *                 description: 孩子年龄
 *                 example: 4
 *               childGender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 孩子性别
 *                 example: "male"
 *               consultationType:
 *                 type: string
 *                 enum: [phone, online, visit]
 *                 description: 咨询方式
 *                 example: "phone"
 *               consultationContent:
 *                 type: string
 *                 description: 咨询内容
 *                 example: "想了解课程安排和收费标准"
 *               preferredContactTime:
 *                 type: string
 *                 description: 希望联系时间
 *                 example: "工作日下午"
 *               status:
 *                 type: string
 *                 enum: [pending, contacted, visited, enrolled, cancelled]
 *                 description: 咨询状态
 *                 example: "contacted"
 *               notes:
 *                 type: string
 *                 description: 备注信息
 *                 example: "对小班制教学感兴趣"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "更新招生咨询记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     parentName:
 *                       type: string
 *                       example: "张三"
 *                     phone:
 *                       type: string
 *                       example: "13800138000"
 *                     childName:
 *                       type: string
 *                       example: "小明"
 *                     status:
 *                       type: string
 *                       example: "contacted"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生咨询记录不存在
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), enrollment_consultation_controller_1["default"].updateConsultation);
/**
 * @swagger
 * /enrollment-consultation/{id}:
 *   delete:
 *     summary: 删除招生咨询记录
 *     tags: [Enrollment Consultation]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生咨询记录ID
 *         schema:
 *           type: integer
 *           example: 1
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "删除招生咨询记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedId:
 *                       type: integer
 *                       example: 1
 *                     deletedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 招生咨询记录不存在
 *       409:
 *         description: 存在关联数据，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "该咨询记录存在跟进记录，无法删除"
 *                 data:
 *                   type: object
 *                   properties:
 *                     followupCount:
 *                       type: integer
 *                       example: 3
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_CONSULTATION_MANAGE'), enrollment_consultation_controller_1["default"].deleteConsultation);
exports["default"] = router;
