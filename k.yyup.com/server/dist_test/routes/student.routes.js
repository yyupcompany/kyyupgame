"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var express_1 = require("express");
var student_controller_1 = require("../controllers/student.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var studentController = new student_controller_1.StudentController();
/**
 * @swagger
 * tags:
 *   name: Students
 *   description: 学生管理接口
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       required:
 *         - name
 *         - studentId
 *         - birthDate
 *         - gender
 *       properties:
 *         id:
 *           type: integer
 *           description: 学生ID
 *         name:
 *           type: string
 *           description: 学生姓名
 *         studentId:
 *           type: string
 *           description: 学号
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *         classId:
 *           type: integer
 *           description: 班级ID
 *         status:
 *           type: string
 *           enum: [active, inactive, graduated]
 *           description: 学生状态
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           description: 入学日期
 *         photoUrl:
 *           type: string
 *           description: 头像URL
 *         address:
 *           type: string
 *           description: 家庭地址
 *         phone:
 *           type: string
 *           description: 联系电话
 *         emergencyContact:
 *           type: string
 *           description: 紧急联系人
 *         emergencyPhone:
 *           type: string
 *           description: 紧急联系电话
 *         allergies:
 *           type: string
 *           description: 过敏信息
 *         medicalConditions:
 *           type: string
 *           description: 健康状况
 *         notes:
 *           type: string
 *           description: 备注
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *
 *     StudentRequest:
 *       type: object
 *       required:
 *         - name
 *         - studentId
 *         - birthDate
 *         - gender
 *       properties:
 *         name:
 *           type: string
 *           description: 学生姓名
 *           example: "张小明"
 *         studentId:
 *           type: string
 *           description: 学号
 *           example: "STU001"
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *           example: "2018-05-15"
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *           example: "male"
 *         classId:
 *           type: integer
 *           description: 班级ID
 *           example: 1
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           description: 入学日期
 *           example: "2024-09-01"
 *         photoUrl:
 *           type: string
 *           description: 头像URL
 *         address:
 *           type: string
 *           description: 家庭地址
 *           example: "北京市朝阳区某某街道"
 *         phone:
 *           type: string
 *           description: 联系电话
 *           example: "13800138000"
 *         emergencyContact:
 *           type: string
 *           description: 紧急联系人
 *           example: "张父"
 *         emergencyPhone:
 *           type: string
 *           description: 紧急联系电话
 *           example: "13900139000"
 *         allergies:
 *           type: string
 *           description: 过敏信息
 *         medicalConditions:
 *           type: string
 *           description: 健康状况
 *         notes:
 *           type: string
 *           description: 备注
 *
 *     StudentStats:
 *       type: object
 *       properties:
 *         totalStudents:
 *           type: integer
 *           description: 学生总数
 *         activeStudents:
 *           type: integer
 *           description: 在读学生数
 *         inactiveStudents:
 *           type: integer
 *           description: 非在读学生数
 *         graduatedStudents:
 *           type: integer
 *           description: 毕业学生数
 *         studentsWithoutClass:
 *           type: integer
 *           description: 未分配班级学生数
 *         averageAge:
 *           type: number
 *           description: 平均年龄
 *
 *     GrowthRecord:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 记录ID
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *         recordDate:
 *           type: string
 *           format: date
 *           description: 记录日期
 *         height:
 *           type: number
 *           description: 身高(cm)
 *         weight:
 *           type: number
 *           description: 体重(kg)
 *         milestone:
 *           type: string
 *           description: 发展里程碑
 *         teacherNote:
 *           type: string
 *           description: 教师备注
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 */
/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: 创建学生
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRequest'
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
 *                   example: "创建学生成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       409:
 *         description: 学号已存在
 */
/**
 * @swagger
 * /api/students/by-class:
 *   get:
 *     summary: 按班级获取学生列表
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: 班级ID
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
 *         description: 搜索关键词(姓名、学号)
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
 *                   example: "获取班级学生列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     list:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 *       403:
 *         description: 权限不足
 */
router.get('/by-class', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), studentController.getStudentsByClass);
/**
 * @swagger
 * /api/students/search:
 *   get:
 *     summary: 搜索学生
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词(姓名、学号)
 *       - in: query
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, graduated]
 *         description: 学生状态
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
 *         description: 搜索成功
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
 *                   example: "搜索学生成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: 权限不足
 */
router.get('/search', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), studentController.search);
/**
 * @swagger
 * /api/students/available:
 *   get:
 *     summary: 获取可用学生列表
 *     description: 获取未分配班级的学生列表
 *     tags: [Students]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取可用学生列表成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       403:
 *         description: 权限不足
 */
router.get('/available', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), studentController.getAvailableStudents);
/**
 * @swagger
 * /api/students/stats:
 *   get:
 *     summary: 获取学生统计
 *     tags: [Students]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取学生统计成功"
 *                 data:
 *                   $ref: '#/components/schemas/StudentStats'
 *       403:
 *         description: 权限不足
 */
router.get('/stats', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), studentController.getStats);
/**
 * @swagger
 * /api/students/statistics:
 *   get:
 *     summary: 获取学生统计信息
 *     description: 兼容性接口，功能同/stats
 *     tags: [Students]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取学生统计成功"
 *                 data:
 *                   $ref: '#/components/schemas/StudentStats'
 *       403:
 *         description: 权限不足
 */
router.get('/statistics', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), studentController.getStats);
/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: 获取学生列表
 *     tags: [Students]
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
 *         name: classId
 *         schema:
 *           type: integer
 *         description: 班级ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, graduated]
 *         description: 学生状态
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
 *                   example: "获取学生列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       403:
 *         description: 权限不足
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), studentController.list);
/**
 * @swagger
 * /api/students/status:
 *   put:
 *     summary: 更新学生状态
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - status
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: 学生ID
 *                 example: 1
 *               status:
 *                 type: string
 *                 enum: [active, inactive, graduated]
 *                 description: 新状态
 *                 example: "active"
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
 *                   example: "更新学生状态成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 */
router.put('/status', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_UPDATE'), studentController.updateStatus);
/**
 * @swagger
 * /api/students/assign-class:
 *   post:
 *     summary: 为学生分配班级
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - classId
 *             properties:
 *               studentId:
 *                 type: integer
 *                 description: 学生ID
 *                 example: 1
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *                 example: 1
 *     responses:
 *       200:
 *         description: 分配成功
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
 *                   example: "分配班级成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生或班级不存在
 */
router.post('/assign-class', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_UPDATE'), studentController.assignClass);
/**
 * @swagger
 * /api/students/add-to-class:
 *   post:
 *     summary: 添加学生到班级
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             allOf:
 *               - $ref: '#/components/schemas/StudentRequest'
 *               - type: object
 *                 required:
 *                   - classId
 *                 properties:
 *                   classId:
 *                     type: string
 *                     description: 班级ID
 *                     example: "1"
 *     responses:
 *       201:
 *         description: 添加成功
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
 *                   example: "学生已添加到班级"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 班级不存在
 */
router.post('/add-to-class', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_MANAGE'), studentController.addToClass);
/**
 * @swagger
 * /api/students/{id}/remove-from-class:
 *   delete:
 *     summary: 从班级移除学生
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: 学生ID
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
 *                 type: string
 *                 description: 班级ID
 *                 example: "1"
 *     responses:
 *       200:
 *         description: 移除成功
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
 *                   example: "学生已从班级移除"
 *                 data:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生或班级不存在
 */
router["delete"]('/:id/remove-from-class', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_MANAGE'), studentController.removeFromClass);
/**
 * @swagger
 * /api/students/batch-assign-class:
 *   post:
 *     summary: 批量为学生分配班级
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *               - classId
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 学生ID列表
 *                 example: [1, 2, 3]
 *               classId:
 *                 type: integer
 *                 description: 班级ID
 *                 example: 1
 *     responses:
 *       200:
 *         description: 批量分配成功
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
 *                   example: "批量分配班级成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     successCount:
 *                       type: integer
 *                       description: 成功分配数量
 *                       example: 3
 *                     failedCount:
 *                       type: integer
 *                       description: 失败分配数量
 *                       example: 0
 *                     updatedStudents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 班级不存在
 */
router.post('/batch-assign-class', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_UPDATE'), studentController.batchAssignClass);
/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: 获取学生详情
 *     tags: [Students]
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
 *                   example: "获取学生详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), studentController.detail);
/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: 更新学生信息
 *     tags: [Students]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudentRequest'
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
 *                   example: "更新学生信息成功"
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: 请求参数错误
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 *       409:
 *         description: 学号已存在
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_UPDATE'), studentController.update);
/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: 删除学生
 *     tags: [Students]
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
 *                   example: "删除学生成功"
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 *       409:
 *         description: 学生已分配班级或有相关记录，无法删除
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_MANAGE'), studentController["delete"]);
/**
 * @swagger
 * /api/students/{id}/parents:
 *   get:
 *     summary: 获取学生的家长列表
 *     tags: [Students]
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
 *                   example: "获取学生家长列表成功"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Parent'
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 */
router.get('/:id/parents', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), studentController.getParents);
/**
 * @swagger
 * /api/students/{id}/growth-records:
 *   get:
 *     summary: 获取学生成长记录
 *     tags: [Students]
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
 *                   example: "获取学生成长记录成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     records:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GrowthRecord'
 *                     total:
 *                       type: integer
 *                       description: 记录总数
 *                       example: 2
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 学生不存在
 *       500:
 *         description: 获取学生成长记录失败
 */
router.get('/:id/growth-records', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('STUDENT_VIEW'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, mockGrowthRecords;
    return __generator(this, function (_a) {
        try {
            studentId = req.params.id;
            mockGrowthRecords = [
                {
                    id: 1,
                    studentId: parseInt(studentId),
                    recordDate: '2024-06-01',
                    height: 105.5,
                    weight: 18.2,
                    milestone: '能够完整表达简单句子',
                    teacherNote: '语言表达能力有明显提升',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    studentId: parseInt(studentId),
                    recordDate: '2024-05-01',
                    height: 104.8,
                    weight: 17.9,
                    milestone: '能够独立完成简单拼图',
                    teacherNote: '动手能力和专注力都有进步',
                    createdAt: new Date().toISOString()
                }
            ];
            res.json({
                success: true,
                message: '获取学生成长记录成功',
                data: {
                    records: mockGrowthRecords,
                    total: mockGrowthRecords.length
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: '获取学生成长记录失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
