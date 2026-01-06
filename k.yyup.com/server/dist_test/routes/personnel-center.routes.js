"use strict";
/**
 * 人事中心路由 - 管理学生、家长、教师和班级
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 学生ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 学生姓名
 *           example: "张三"
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *           example: "male"
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *           example: "2018-05-15"
 *         classId:
 *           type: integer
 *           description: 班级ID
 *           example: 1
 *         status:
 *           type: string
 *           enum: [active, inactive, graduated]
 *           description: 学生状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     Parent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 家长ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 家长姓名
 *           example: "李四"
 *         phone:
 *           type: string
 *           description: 手机号码
 *           example: "13800138000"
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *           example: "parent@example.com"
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           description: 与学生关系
 *           example: "father"
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 家长状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     Teacher:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 教师ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 教师姓名
 *           example: "王老师"
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *           example: "female"
 *         phone:
 *           type: string
 *           description: 手机号码
 *           example: "13900139000"
 *         email:
 *           type: string
 *           format: email
 *           description: 邮箱地址
 *           example: "teacher@example.com"
 *         subject:
 *           type: string
 *           description: 主教科目
 *           example: "语文"
 *         experience:
 *           type: integer
 *           description: 工作年限
 *           example: 5
 *         status:
 *           type: string
 *           enum: [active, inactive, on_leave]
 *           description: 教师状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     Class:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 班级ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 班级名称
 *           example: "大班A班"
 *         grade:
 *           type: string
 *           description: 年级
 *           example: "大班"
 *         teacherId:
 *           type: integer
 *           description: 班主任ID
 *           example: 1
 *         capacity:
 *           type: integer
 *           description: 班级容量
 *           example: 30
 *         currentCount:
 *           type: integer
 *           description: 当前学生数
 *           example: 25
 *         status:
 *           type: string
 *           enum: [active, inactive]
 *           description: 班级状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     BatchOperation:
 *       type: object
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: integer
 *           description: 要操作的ID列表
 *           example: [1, 2, 3]
 *         action:
 *           type: string
 *           description: 操作类型
 *           example: "activate"
 *         data:
 *           type: object
 *           description: 更新数据
 *           example: {"status": "active"}
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
exports.__esModule = true;
var express_1 = require("express");
var personnel_center_controller_1 = require("../controllers/personnel-center.controller");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/personnel-center/overview:
 *   get:
 *     tags:
 *       - Personnel Center
 *     summary: 获取人事中心概览数据
 *     description: 获取学生、家长、教师、班级的总体统计概览
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取概览数据
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalStudents:
 *                           type: integer
 *                           description: 学生总数
 *                           example: 150
 *                         totalParents:
 *                           type: integer
 *                           description: 家长总数
 *                           example: 280
 *                         totalTeachers:
 *                           type: integer
 *                           description: 教师总数
 *                           example: 25
 *                         totalClasses:
 *                           type: integer
 *                           description: 班级总数
 *                           example: 8
 *                         activeStudents:
 *                           type: integer
 *                           description: 在读学生数
 *                           example: 145
 *                         activeTeachers:
 *                           type: integer
 *                           description: 在职教师数
 *                           example: 23
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/overview', personnel_center_controller_1.personnelCenterController.getOverview);
/**
 * @swagger
 * /api/personnel-center/distribution:
 *   get:
 *     tags:
 *       - Personnel Center
 *     summary: 获取人员分布数据
 *     description: 获取按年级、性别、班级等维度的人员分布统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取分布数据
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         gradeDistribution:
 *                           type: array
 *                           description: 年级分布
 *                           items:
 *                             type: object
 *                             properties:
 *                               grade:
 *                                 type: string
 *                                 example: "大班"
 *                               count:
 *                                 type: integer
 *                                 example: 50
 *                         genderDistribution:
 *                           type: array
 *                           description: 性别分布
 *                           items:
 *                             type: object
 *                             properties:
 *                               gender:
 *                                 type: string
 *                                 example: "male"
 *                               count:
 *                                 type: integer
 *                                 example: 75
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/distribution', personnel_center_controller_1.personnelCenterController.getPersonnelDistribution);
/**
 * @swagger
 * /api/personnel-center/trend:
 *   get:
 *     tags:
 *       - Personnel Center
 *     summary: 获取人员趋势数据
 *     description: 获取人员数量的时间趋势变化数据
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: period
 *         in: query
 *         description: 统计周期
 *         required: false
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *       - name: startDate
 *         in: query
 *         description: 开始日期
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: 结束日期
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: 成功获取趋势数据
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         studentTrend:
 *                           type: array
 *                           description: 学生数量趋势
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                                 example: "2024-01-01"
 *                               count:
 *                                 type: integer
 *                                 example: 145
 *                         teacherTrend:
 *                           type: array
 *                           description: 教师数量趋势
 *                           items:
 *                             type: object
 *                             properties:
 *                               date:
 *                                 type: string
 *                                 format: date
 *                               count:
 *                                 type: integer
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/trend', personnel_center_controller_1.personnelCenterController.getPersonnelTrend);
/**
 * @swagger
 * /api/personnel-center/statistics:
 *   get:
 *     tags:
 *       - Personnel Center
 *     summary: 获取人事统计数据
 *     description: 获取详细的人事统计分析数据
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         enrollmentRate:
 *                           type: number
 *                           description: 入园率
 *                           example: 0.95
 *                         teacherStudentRatio:
 *                           type: number
 *                           description: 师生比例
 *                           example: 6.2
 *                         averageClassSize:
 *                           type: number
 *                           description: 平均班级规模
 *                           example: 18.75
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/statistics', personnel_center_controller_1.personnelCenterController.getPersonnelStatistics);
// ========== 学生管理路由 ==========
/**
 * @swagger
 * /api/personnel-center/students:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 获取学生列表
 *     description: 分页获取学生列表，支持搜索和筛选
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         description: 搜索关键词（姓名、学号等）
 *         required: false
 *         schema:
 *           type: string
 *       - name: classId
 *         in: query
 *         description: 班级ID筛选
 *         required: false
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, graduated]
 *       - name: gender
 *         in: query
 *         description: 性别筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female]
 *     responses:
 *       200:
 *         description: 成功获取学生列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/students', personnel_center_controller_1.personnelCenterController.getStudents);
/**
 * @swagger
 * /api/personnel-center/students:
 *   post:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 创建学生
 *     description: 创建新的学生记录
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gender
 *               - birthDate
 *             properties:
 *               name:
 *                 type: string
 *                 description: 学生姓名
 *                 example: "张三"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 性别
 *                 example: "male"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: 出生日期
 *                 example: "2018-05-15"
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *                 example: 1
 *               parentId:
 *                 type: integer
 *                 description: 家长ID
 *                 example: 1
 *               phone:
 *                 type: string
 *                 description: 紧急联系电话
 *                 example: "13800138000"
 *               address:
 *                 type: string
 *                 description: 家庭住址
 *                 example: "北京市朝阳区"
 *               remarks:
 *                 type: string
 *                 description: 备注信息
 *                 example: "过敏体质"
 *     responses:
 *       201:
 *         description: 学生创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.post('/students', personnel_center_controller_1.personnelCenterController.createStudent);
/**
 * @swagger
 * /api/personnel-center/students/{id}:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 获取学生详情
 *     description: 根据ID获取学生的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 学生ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取学生详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Student'
 *                         - type: object
 *                           properties:
 *                             parents:
 *                               type: array
 *                               description: 家长信息
 *                               items:
 *                                 $ref: '#/components/schemas/Parent'
 *                             class:
 *                               $ref: '#/components/schemas/Class'
 *       404:
 *         description: 学生不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/students/:id', personnel_center_controller_1.personnelCenterController.getStudentDetail);
/**
 * @swagger
 * /api/personnel-center/students/{id}:
 *   put:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 更新学生信息
 *     description: 根据ID更新学生信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 学生ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 学生姓名
 *                 example: "张三"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 性别
 *                 example: "male"
 *               birthDate:
 *                 type: string
 *                 format: date
 *                 description: 出生日期
 *                 example: "2018-05-15"
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [active, inactive, graduated]
 *                 description: 学生状态
 *                 example: "active"
 *               phone:
 *                 type: string
 *                 description: 紧急联系电话
 *                 example: "13800138000"
 *               address:
 *                 type: string
 *                 description: 家庭住址
 *                 example: "北京市朝阳区"
 *               remarks:
 *                 type: string
 *                 description: 备注信息
 *                 example: "过敏体质"
 *     responses:
 *       200:
 *         description: 学生信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Student'
 *       404:
 *         description: 学生不存在
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.put('/students/:id', personnel_center_controller_1.personnelCenterController.updateStudent);
/**
 * @swagger
 * /api/personnel-center/students/{id}:
 *   delete:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 删除学生
 *     description: 根据ID删除学生记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 学生ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 学生删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 学生不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/students/:id', personnel_center_controller_1.personnelCenterController.deleteStudent);
/**
 * @swagger
 * /api/personnel-center/students/batch:
 *   put:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 批量更新学生
 *     description: 批量更新多个学生的信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/BatchOperation'
 *               - type: object
 *                 properties:
 *                   ids:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     description: 学生ID列表
 *                     example: [1, 2, 3]
 *                   data:
 *                     type: object
 *                     description: 更新数据
 *                     example:
 *                       classId: 2
 *                       status: "active"
 *     responses:
 *       200:
 *         description: 批量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         updated:
 *                           type: integer
 *                           description: 更新成功的数量
 *                           example: 3
 *                         failed:
 *                           type: integer
 *                           description: 更新失败的数量
 *                           example: 0
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.put('/students/batch', personnel_center_controller_1.personnelCenterController.batchUpdateStudents);
/**
 * @swagger
 * /api/personnel-center/students/batch:
 *   delete:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 批量删除学生
 *     description: 批量删除多个学生记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 学生ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deleted:
 *                           type: integer
 *                           description: 删除成功的数量
 *                           example: 3
 *                         failed:
 *                           type: integer
 *                           description: 删除失败的数量
 *                           example: 0
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/students/batch', personnel_center_controller_1.personnelCenterController.batchDeleteStudents);
/**
 * @swagger
 * /api/personnel-center/students/export:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 导出学生数据
 *     description: 导出学生数据为Excel文件
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         description: 导出格式
 *         required: false
 *         schema:
 *           type: string
 *           enum: [xlsx, csv]
 *           default: xlsx
 *       - name: classId
 *         in: query
 *         description: 班级ID筛选
 *         required: false
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, graduated]
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/students/export', personnel_center_controller_1.personnelCenterController.exportStudents);
// ========== 家长管理路由 ==========
/**
 * @swagger
 * /api/personnel-center/parents:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 获取家长列表
 *     description: 分页获取家长列表，支持搜索和筛选
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         description: 搜索关键词（姓名、手机号等）
 *         required: false
 *         schema:
 *           type: string
 *       - name: relationship
 *         in: query
 *         description: 关系筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [father, mother, guardian]
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 成功获取家长列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Parent'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/parents', personnel_center_controller_1.personnelCenterController.getParents);
/**
 * @swagger
 * /api/personnel-center/parents:
 *   post:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 创建家长
 *     description: 创建新的家长记录
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - phone
 *               - relationship
 *             properties:
 *               name:
 *                 type: string
 *                 description: 家长姓名
 *                 example: "李四"
 *               phone:
 *                 type: string
 *                 description: 手机号码
 *                 example: "13800138000"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *                 example: "parent@example.com"
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *                 example: "father"
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 关联的学生ID列表
 *                 example: [1, 2]
 *               address:
 *                 type: string
 *                 description: 家庭住址
 *                 example: "北京市朝阳区"
 *               occupation:
 *                 type: string
 *                 description: 职业
 *                 example: "工程师"
 *               workPlace:
 *                 type: string
 *                 description: 工作单位
 *                 example: "科技公司"
 *     responses:
 *       201:
 *         description: 家长创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Parent'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.post('/parents', personnel_center_controller_1.personnelCenterController.createParent);
/**
 * @swagger
 * /api/personnel-center/parents/{id}:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 获取家长详情
 *     description: 根据ID获取家长的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 家长ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取家长详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Parent'
 *                         - type: object
 *                           properties:
 *                             students:
 *                               type: array
 *                               description: 关联的学生信息
 *                               items:
 *                                 $ref: '#/components/schemas/Student'
 *       404:
 *         description: 家长不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/parents/:id', personnel_center_controller_1.personnelCenterController.getParentDetail);
/**
 * @swagger
 * /api/personnel-center/parents/{id}:
 *   put:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 更新家长信息
 *     description: 根据ID更新家长信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 家长ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 家长姓名
 *                 example: "李四"
 *               phone:
 *                 type: string
 *                 description: 手机号码
 *                 example: "13800138000"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *                 example: "parent@example.com"
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *                 example: "father"
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 家长状态
 *                 example: "active"
 *               address:
 *                 type: string
 *                 description: 家庭住址
 *                 example: "北京市朝阳区"
 *               occupation:
 *                 type: string
 *                 description: 职业
 *                 example: "工程师"
 *               workPlace:
 *                 type: string
 *                 description: 工作单位
 *                 example: "科技公司"
 *     responses:
 *       200:
 *         description: 家长信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Parent'
 *       404:
 *         description: 家长不存在
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.put('/parents/:id', personnel_center_controller_1.personnelCenterController.updateParent);
/**
 * @swagger
 * /api/personnel-center/parents/{id}:
 *   delete:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 删除家长
 *     description: 根据ID删除家长记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 家长ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 家长删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 家长不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/parents/:id', personnel_center_controller_1.personnelCenterController.deleteParent);
/**
 * @swagger
 * /api/personnel-center/parents/batch:
 *   put:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 批量更新家长
 *     description: 批量更新多个家长的信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/BatchOperation'
 *               - type: object
 *                 properties:
 *                   ids:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     description: 家长ID列表
 *                     example: [1, 2, 3]
 *                   data:
 *                     type: object
 *                     description: 更新数据
 *                     example:
 *                       status: "active"
 *                       relationship: "father"
 *     responses:
 *       200:
 *         description: 批量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         updated:
 *                           type: integer
 *                           description: 更新成功的数量
 *                           example: 3
 *                         failed:
 *                           type: integer
 *                           description: 更新失败的数量
 *                           example: 0
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.put('/parents/batch', personnel_center_controller_1.personnelCenterController.batchUpdateParents);
/**
 * @swagger
 * /api/personnel-center/parents/batch:
 *   delete:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 批量删除家长
 *     description: 批量删除多个家长记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 家长ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deleted:
 *                           type: integer
 *                           description: 删除成功的数量
 *                           example: 3
 *                         failed:
 *                           type: integer
 *                           description: 删除失败的数量
 *                           example: 0
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/parents/batch', personnel_center_controller_1.personnelCenterController.batchDeleteParents);
/**
 * @swagger
 * /api/personnel-center/parents/export:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 导出家长数据
 *     description: 导出家长数据为Excel文件
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         description: 导出格式
 *         required: false
 *         schema:
 *           type: string
 *           enum: [xlsx, csv]
 *           default: xlsx
 *       - name: relationship
 *         in: query
 *         description: 关系筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [father, mother, guardian]
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/parents/export', personnel_center_controller_1.personnelCenterController.exportParents);
// ========== 教师管理路由 ==========
/**
 * @swagger
 * /api/personnel-center/teachers:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 获取教师列表
 *     description: 分页获取教师列表，支持搜索和筛选
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         description: 搜索关键词（姓名、手机号等）
 *         required: false
 *         schema:
 *           type: string
 *       - name: subject
 *         in: query
 *         description: 科目筛选
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, on_leave]
 *       - name: gender
 *         in: query
 *         description: 性别筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female]
 *     responses:
 *       200:
 *         description: 成功获取教师列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Teacher'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/teachers', personnel_center_controller_1.personnelCenterController.getTeachers);
/**
 * @swagger
 * /api/personnel-center/teachers:
 *   post:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 创建教师
 *     description: 创建新的教师记录
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - gender
 *               - phone
 *               - subject
 *             properties:
 *               name:
 *                 type: string
 *                 description: 教师姓名
 *                 example: "王老师"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 性别
 *                 example: "female"
 *               phone:
 *                 type: string
 *                 description: 手机号码
 *                 example: "13900139000"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *                 example: "teacher@example.com"
 *               subject:
 *                 type: string
 *                 description: 主教科目
 *                 example: "语文"
 *               experience:
 *                 type: integer
 *                 description: 工作年限
 *                 example: 5
 *               education:
 *                 type: string
 *                 description: 学历
 *                 example: "本科"
 *               certificate:
 *                 type: string
 *                 description: 教师资格证书
 *                 example: "幼儿园教师资格证"
 *               address:
 *                 type: string
 *                 description: 家庭住址
 *                 example: "北京市朝阳区"
 *               hireDate:
 *                 type: string
 *                 format: date
 *                 description: 入职日期
 *                 example: "2020-09-01"
 *     responses:
 *       201:
 *         description: 教师创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.post('/teachers', personnel_center_controller_1.personnelCenterController.createTeacher);
/**
 * @swagger
 * /api/personnel-center/teachers/{id}:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 获取教师详情
 *     description: 根据ID获取教师的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 教师ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取教师详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Teacher'
 *                         - type: object
 *                           properties:
 *                             classes:
 *                               type: array
 *                               description: 负责的班级信息
 *                               items:
 *                                 $ref: '#/components/schemas/Class'
 *       404:
 *         description: 教师不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/teachers/:id', personnel_center_controller_1.personnelCenterController.getTeacherDetail);
/**
 * @swagger
 * /api/personnel-center/teachers/{id}:
 *   put:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 更新教师信息
 *     description: 根据ID更新教师信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 教师ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 教师姓名
 *                 example: "王老师"
 *               gender:
 *                 type: string
 *                 enum: [male, female]
 *                 description: 性别
 *                 example: "female"
 *               phone:
 *                 type: string
 *                 description: 手机号码
 *                 example: "13900139000"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: 邮箱地址
 *                 example: "teacher@example.com"
 *               subject:
 *                 type: string
 *                 description: 主教科目
 *                 example: "语文"
 *               experience:
 *                 type: integer
 *                 description: 工作年限
 *                 example: 5
 *               status:
 *                 type: string
 *                 enum: [active, inactive, on_leave]
 *                 description: 教师状态
 *                 example: "active"
 *               education:
 *                 type: string
 *                 description: 学历
 *                 example: "本科"
 *               certificate:
 *                 type: string
 *                 description: 教师资格证书
 *                 example: "幼儿园教师资格证"
 *               address:
 *                 type: string
 *                 description: 家庭住址
 *                 example: "北京市朝阳区"
 *     responses:
 *       200:
 *         description: 教师信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: 教师不存在
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.put('/teachers/:id', personnel_center_controller_1.personnelCenterController.updateTeacher);
/**
 * @swagger
 * /api/personnel-center/teachers/{id}:
 *   delete:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 删除教师
 *     description: 根据ID删除教师记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 教师ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 教师删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 教师不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/teachers/:id', personnel_center_controller_1.personnelCenterController.deleteTeacher);
/**
 * @swagger
 * /api/personnel-center/teachers/batch:
 *   put:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 批量更新教师
 *     description: 批量更新多个教师的信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/BatchOperation'
 *               - type: object
 *                 properties:
 *                   ids:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     description: 教师ID列表
 *                     example: [1, 2, 3]
 *                   data:
 *                     type: object
 *                     description: 更新数据
 *                     example:
 *                       status: "active"
 *                       subject: "语文"
 *     responses:
 *       200:
 *         description: 批量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         updated:
 *                           type: integer
 *                           description: 更新成功的数量
 *                           example: 3
 *                         failed:
 *                           type: integer
 *                           description: 更新失败的数量
 *                           example: 0
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.put('/teachers/batch', personnel_center_controller_1.personnelCenterController.batchUpdateTeachers);
/**
 * @swagger
 * /api/personnel-center/teachers/batch:
 *   delete:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 批量删除教师
 *     description: 批量删除多个教师记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 教师ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deleted:
 *                           type: integer
 *                           description: 删除成功的数量
 *                           example: 3
 *                         failed:
 *                           type: integer
 *                           description: 删除失败的数量
 *                           example: 0
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/teachers/batch', personnel_center_controller_1.personnelCenterController.batchDeleteTeachers);
/**
 * @swagger
 * /api/personnel-center/teachers/export:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 导出教师数据
 *     description: 导出教师数据为Excel文件
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         description: 导出格式
 *         required: false
 *         schema:
 *           type: string
 *           enum: [xlsx, csv]
 *           default: xlsx
 *       - name: subject
 *         in: query
 *         description: 科目筛选
 *         required: false
 *         schema:
 *           type: string
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, on_leave]
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/teachers/export', personnel_center_controller_1.personnelCenterController.exportTeachers);
// ========== 班级管理路由 ==========
/**
 * @swagger
 * /api/personnel-center/classes:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 获取班级列表
 *     description: 分页获取班级列表，支持搜索和筛选
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         description: 搜索关键词（班级名称等）
 *         required: false
 *         schema:
 *           type: string
 *       - name: grade
 *         in: query
 *         description: 年级筛选
 *         required: false
 *         schema:
 *           type: string
 *       - name: teacherId
 *         in: query
 *         description: 班主任ID筛选
 *         required: false
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 成功获取班级列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Class'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/classes', personnel_center_controller_1.personnelCenterController.getClasses);
/**
 * @swagger
 * /api/personnel-center/classes:
 *   post:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 创建班级
 *     description: 创建新的班级记录
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - grade
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *                 description: 班级名称
 *                 example: "大班A班"
 *               grade:
 *                 type: string
 *                 description: 年级
 *                 example: "大班"
 *               teacherId:
 *                 type: integer
 *                 description: 班主任ID
 *                 example: 1
 *               capacity:
 *                 type: integer
 *                 description: 班级容量
 *                 example: 30
 *               classroom:
 *                 type: string
 *                 description: 教室位置
 *                 example: "教学楼301"
 *               schedule:
 *                 type: string
 *                 description: 上课时间安排
 *                 example: "周一至周五 8:00-17:00"
 *               description:
 *                 type: string
 *                 description: 班级描述
 *                 example: "重点班级，注重艺术培养"
 *     responses:
 *       201:
 *         description: 班级创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Class'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.post('/classes', personnel_center_controller_1.personnelCenterController.createClass);
/**
 * @swagger
 * /api/personnel-center/classes/{id}:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 获取班级详情
 *     description: 根据ID获取班级的详细信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 班级ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功获取班级详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Class'
 *                         - type: object
 *                           properties:
 *                             teacher:
 *                               $ref: '#/components/schemas/Teacher'
 *                             students:
 *                               type: array
 *                               description: 班级学生列表
 *                               items:
 *                                 $ref: '#/components/schemas/Student'
 *       404:
 *         description: 班级不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/classes/:id', personnel_center_controller_1.personnelCenterController.getClassDetail);
/**
 * @swagger
 * /api/personnel-center/classes/{id}:
 *   put:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 更新班级信息
 *     description: 根据ID更新班级信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 班级ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: 班级名称
 *                 example: "大班A班"
 *               grade:
 *                 type: string
 *                 description: 年级
 *                 example: "大班"
 *               teacherId:
 *                 type: integer
 *                 description: 班主任ID
 *                 example: 1
 *               capacity:
 *                 type: integer
 *                 description: 班级容量
 *                 example: 30
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 description: 班级状态
 *                 example: "active"
 *               classroom:
 *                 type: string
 *                 description: 教室位置
 *                 example: "教学楼301"
 *               schedule:
 *                 type: string
 *                 description: 上课时间安排
 *                 example: "周一至周五 8:00-17:00"
 *               description:
 *                 type: string
 *                 description: 班级描述
 *                 example: "重点班级，注重艺术培养"
 *     responses:
 *       200:
 *         description: 班级信息更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/Class'
 *       404:
 *         description: 班级不存在
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.put('/classes/:id', personnel_center_controller_1.personnelCenterController.updateClass);
/**
 * @swagger
 * /api/personnel-center/classes/{id}:
 *   delete:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 删除班级
 *     description: 根据ID删除班级记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 班级ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 班级删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 班级不存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/classes/:id', personnel_center_controller_1.personnelCenterController.deleteClass);
/**
 * @swagger
 * /api/personnel-center/classes/batch:
 *   put:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 批量更新班级
 *     description: 批量更新多个班级的信息
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/BatchOperation'
 *               - type: object
 *                 properties:
 *                   ids:
 *                     type: array
 *                     items:
 *                       type: integer
 *                     description: 班级ID列表
 *                     example: [1, 2, 3]
 *                   data:
 *                     type: object
 *                     description: 更新数据
 *                     example:
 *                       teacherId: 2
 *                       status: "active"
 *     responses:
 *       200:
 *         description: 批量更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         updated:
 *                           type: integer
 *                           description: 更新成功的数量
 *                           example: 3
 *                         failed:
 *                           type: integer
 *                           description: 更新失败的数量
 *                           example: 0
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.put('/classes/batch', personnel_center_controller_1.personnelCenterController.batchUpdateClasses);
/**
 * @swagger
 * /api/personnel-center/classes/batch:
 *   delete:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 批量删除班级
 *     description: 批量删除多个班级记录（软删除）
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ids
 *             properties:
 *               ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 班级ID列表
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: 批量删除成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         deleted:
 *                           type: integer
 *                           description: 删除成功的数量
 *                           example: 3
 *                         failed:
 *                           type: integer
 *                           description: 删除失败的数量
 *                           example: 0
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/classes/batch', personnel_center_controller_1.personnelCenterController.batchDeleteClasses);
/**
 * @swagger
 * /api/personnel-center/classes/export:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 导出班级数据
 *     description: 导出班级数据为Excel文件
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: format
 *         in: query
 *         description: 导出格式
 *         required: false
 *         schema:
 *           type: string
 *           enum: [xlsx, csv]
 *           default: xlsx
 *       - name: grade
 *         in: query
 *         description: 年级筛选
 *         required: false
 *         schema:
 *           type: string
 *       - name: teacherId
 *         in: query
 *         description: 班主任ID筛选
 *         required: false
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           text/csv:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/classes/export', personnel_center_controller_1.personnelCenterController.exportClasses);
// ========== 关联操作路由 ==========
/**
 * @swagger
 * /api/personnel-center/students/{studentId}/assign-class:
 *   post:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 分配学生到班级
 *     description: 将学生分配到指定班级
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: studentId
 *         in: path
 *         required: true
 *         description: 学生ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *             properties:
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *                 example: 1
 *               remarks:
 *                 type: string
 *                 description: 备注信息
 *                 example: "正常转入"
 *     responses:
 *       200:
 *         description: 分配成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 学生或班级不存在
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.post('/students/:studentId/assign-class', personnel_center_controller_1.personnelCenterController.assignStudentToClass);
/**
 * @swagger
 * /api/personnel-center/teachers/{teacherId}/assign-class:
 *   post:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 分配教师到班级
 *     description: 将教师分配为指定班级的班主任
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: teacherId
 *         in: path
 *         required: true
 *         description: 教师ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - classId
 *             properties:
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *                 example: 1
 *               role:
 *                 type: string
 *                 description: 教师角色
 *                 enum: [homeroom, subject, assistant]
 *                 example: "homeroom"
 *               subject:
 *                 type: string
 *                 description: 教授科目（如果是科目教师）
 *                 example: "语文"
 *     responses:
 *       200:
 *         description: 分配成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 教师或班级不存在
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.post('/teachers/:teacherId/assign-class', personnel_center_controller_1.personnelCenterController.assignTeacherToClass);
/**
 * @swagger
 * /api/personnel-center/parents/{parentId}/add-child:
 *   post:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 添加学生到家长
 *     description: 建立家长与学生的关联关系
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: parentId
 *         in: path
 *         required: true
 *         description: 家长ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - relationship
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: 学生ID
 *                 example: 1
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *                 example: "father"
 *               isPrimary:
 *                 type: boolean
 *                 description: 是否为主要联系人
 *                 example: true
 *     responses:
 *       200:
 *         description: 关联建立成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 家长或学生不存在
 *       400:
 *         description: 请求参数错误或关联已存在
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.post('/parents/:parentId/add-child', personnel_center_controller_1.personnelCenterController.addChildToParent);
// ========== 搜索和筛选 ==========
/**
 * @swagger
 * /api/personnel-center/search:
 *   get:
 *     tags:
 *       - Personnel Center
 *     summary: 全局搜索
 *     description: 在学生、家长、教师、班级中进行全局搜索
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *           example: "张三"
 *       - name: type
 *         in: query
 *         description: 搜索类型限制
 *         required: false
 *         schema:
 *           type: string
 *           enum: [students, parents, teachers, classes]
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         students:
 *                           type: array
 *                           description: 匹配的学生
 *                           items:
 *                             $ref: '#/components/schemas/Student'
 *                         parents:
 *                           type: array
 *                           description: 匹配的家长
 *                           items:
 *                             $ref: '#/components/schemas/Parent'
 *                         teachers:
 *                           type: array
 *                           description: 匹配的教师
 *                           items:
 *                             $ref: '#/components/schemas/Teacher'
 *                         classes:
 *                           type: array
 *                           description: 匹配的班级
 *                           items:
 *                             $ref: '#/components/schemas/Class'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/search', personnel_center_controller_1.personnelCenterController.globalSearch);
/**
 * @swagger
 * /api/personnel-center/students/search:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Students
 *     summary: 搜索学生
 *     description: 根据条件搜索学生
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *           example: "张三"
 *       - name: classId
 *         in: query
 *         description: 班级ID筛选
 *         required: false
 *         schema:
 *           type: integer
 *       - name: grade
 *         in: query
 *         description: 年级筛选
 *         required: false
 *         schema:
 *           type: string
 *       - name: gender
 *         in: query
 *         description: 性别筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female]
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, graduated]
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/students/search', personnel_center_controller_1.personnelCenterController.searchStudents);
/**
 * @swagger
 * /api/personnel-center/parents/search:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Parents
 *     summary: 搜索家长
 *     description: 根据条件搜索家长
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *           example: "李四"
 *       - name: relationship
 *         in: query
 *         description: 关系筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [father, mother, guardian]
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Parent'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/parents/search', personnel_center_controller_1.personnelCenterController.searchParents);
/**
 * @swagger
 * /api/personnel-center/teachers/search:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Teachers
 *     summary: 搜索教师
 *     description: 根据条件搜索教师
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *           example: "王老师"
 *       - name: subject
 *         in: query
 *         description: 科目筛选
 *         required: false
 *         schema:
 *           type: string
 *       - name: gender
 *         in: query
 *         description: 性别筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [male, female]
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive, on_leave]
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Teacher'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/teachers/search', personnel_center_controller_1.personnelCenterController.searchTeachers);
/**
 * @swagger
 * /api/personnel-center/classes/search:
 *   get:
 *     tags:
 *       - Personnel Center
 *       - Classes
 *     summary: 搜索班级
 *     description: 根据条件搜索班级
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: q
 *         in: query
 *         required: true
 *         description: 搜索关键词
 *         schema:
 *           type: string
 *           example: "大班"
 *       - name: grade
 *         in: query
 *         description: 年级筛选
 *         required: false
 *         schema:
 *           type: string
 *       - name: teacherId
 *         in: query
 *         description: 班主任ID筛选
 *         required: false
 *         schema:
 *           type: integer
 *       - name: status
 *         in: query
 *         description: 状态筛选
 *         required: false
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *       - name: page
 *         in: query
 *         description: 页码
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页数量
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: 搜索成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Class'
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
 */
router.get('/classes/search', personnel_center_controller_1.personnelCenterController.searchClasses);
exports["default"] = router;
