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
/**
 * 家长路由配置
 */
var express_1 = require("express");
var parent_controller_1 = require("../controllers/parent.controller");
var parent_student_relation_controller_1 = require("../controllers/parent-student-relation.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var parentController = new parent_controller_1.ParentController();
var parentStudentRelationController = new parent_student_relation_controller_1.ParentStudentRelationController();
// 路由中间件
var auth = auth_middleware_1.verifyToken;
/**
 * 家长管理路由
 *
 * 路由前缀: /api/parents
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     Parent:
 *       type: object
 *       required:
 *         - name
 *         - phone
 *         - relationship
 *       properties:
 *         id:
 *           type: integer
 *           description: 家长ID
 *         name:
 *           type: string
 *           description: 家长姓名
 *         phone:
 *           type: string
 *           description: 联系电话
 *         email:
 *           type: string
 *           description: 邮箱地址
 *         wechat:
 *           type: string
 *           description: 微信号
 *         idCard:
 *           type: string
 *           description: 身份证号
 *         address:
 *           type: string
 *           description: 家庭地址
 *         occupation:
 *           type: string
 *           description: 职业
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           description: 与学生关系
 *         emergencyContact:
 *           type: string
 *           description: 紧急联系方式
 *         remark:
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
 *     ParentStudent:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 关系记录ID
 *         parentId:
 *           type: integer
 *           description: 家长ID
 *         studentId:
 *           type: integer
 *           description: 学生ID
 *         relationship:
 *           type: string
 *           enum: [father, mother, guardian]
 *           description: 与学生关系
 *         isEmergencyContact:
 *           type: boolean
 *           description: 是否为紧急联系人
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         parent:
 *           $ref: '#/components/schemas/Parent'
 *         student:
 *           $ref: '#/components/schemas/Student'
 *     Child:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 子女ID
 *         parentId:
 *           type: integer
 *           description: 家长ID
 *         name:
 *           type: string
 *           description: 子女姓名
 *         gender:
 *           type: string
 *           enum: [male, female]
 *           description: 性别
 *         birthDate:
 *           type: string
 *           format: date
 *           description: 出生日期
 *         classId:
 *           type: integer
 *           description: 班级ID
 *         class:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             grade:
 *               type: string
 *         relationship:
 *           type: string
 *           description: 关系
 *         enrollmentDate:
 *           type: string
 *           format: date
 *           description: 入学日期
 *     Communication:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 沟通记录ID
 *         parentId:
 *           type: integer
 *           description: 家长ID
 *         teacherId:
 *           type: integer
 *           description: 老师ID
 *         teacher:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *             subject:
 *               type: string
 *         type:
 *           type: string
 *           enum: [phone, wechat, email, visit]
 *           description: 沟通方式
 *         topic:
 *           type: string
 *           description: 沟通主题
 *         content:
 *           type: string
 *           description: 沟通内容
 *         communicationDate:
 *           type: string
 *           format: date
 *           description: 沟通日期
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 记录创建时间
 *
 *   tags:
 *     - name: Parents
 *       description: 家长管理API
 */
/**
 * @swagger
 * /api/parents:
 *   post:
 *     summary: 创建家长
 *     tags: [Parents]
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
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               wechat:
 *                 type: string
 *                 description: 微信号
 *               idCard:
 *                 type: string
 *                 description: 身份证号
 *               address:
 *                 type: string
 *                 description: 家庭地址
 *               occupation:
 *                 type: string
 *                 description: 职业
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *               emergencyContact:
 *                 type: string
 *                 description: 紧急联系方式
 *               remark:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       201:
 *         description: 家长创建成功
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
 *                   example: 家长创建成功
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.post('/', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), parentController.create);
/**
 * @swagger
 * /api/parents:
 *   get:
 *     summary: 获取家长列表
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（姓名、电话）
 *       - in: query
 *         name: relationship
 *         schema:
 *           type: string
 *           enum: [father, mother, guardian]
 *         description: 与学生关系
 *     responses:
 *       200:
 *         description: 家长列表获取成功
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
 *                   example: 家长列表获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     parents:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Parent'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器内部错误
 */
router.get('/', auth, (0, auth_middleware_1.checkPermission)('PARENT_LIST'), parentController.list);
/**
 * @swagger
 * /api/parents/{id}:
 *   get:
 *     summary: 获取家长详情
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 家长详情获取成功
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
 *                   example: 家长详情获取成功
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/:id', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), parentController.detail);
/**
 * @swagger
 * /api/parents/{id}:
 *   put:
 *     summary: 更新家长信息
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
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
 *               phone:
 *                 type: string
 *                 description: 联系电话
 *               email:
 *                 type: string
 *                 description: 邮箱地址
 *               wechat:
 *                 type: string
 *                 description: 微信号
 *               idCard:
 *                 type: string
 *                 description: 身份证号
 *               address:
 *                 type: string
 *                 description: 家庭地址
 *               occupation:
 *                 type: string
 *                 description: 职业
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *               emergencyContact:
 *                 type: string
 *                 description: 紧急联系方式
 *               remark:
 *                 type: string
 *                 description: 备注
 *     responses:
 *       200:
 *         description: 家长信息更新成功
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
 *                   example: 家长信息更新成功
 *                 data:
 *                   $ref: '#/components/schemas/Parent'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
 */
router.put('/:id', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), parentController.update);
/**
 * @swagger
 * /api/parents/{id}:
 *   delete:
 *     summary: 删除家长
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 家长删除成功
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
 *                   example: 家长删除成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/:id', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), parentController["delete"]);
/**
 * @swagger
 * /api/parents/{id}/students:
 *   get:
 *     summary: 获取指定家长的所有学生
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 家长学生列表获取成功
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
 *                   example: 家长学生列表获取成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ParentStudent'
 *                     total:
 *                       type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/:id/students', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), parentStudentRelationController.getParentStudents);
/**
 * @swagger
 * /api/parents/{id}/students:
 *   post:
 *     summary: 为指定家长添加学生关系
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
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
 *               relationship:
 *                 type: string
 *                 enum: [father, mother, guardian]
 *                 description: 与学生关系
 *               isEmergencyContact:
 *                 type: boolean
 *                 description: 是否为紧急联系人
 *                 default: false
 *     responses:
 *       201:
 *         description: 家长学生关系添加成功
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
 *                   example: 家长学生关系添加成功
 *                 data:
 *                   $ref: '#/components/schemas/ParentStudent'
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长或学生不存在
 *       409:
 *         description: 关系已存在
 *       500:
 *         description: 服务器内部错误
 */
router.post('/:id/students', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), parentStudentRelationController.addParentStudent);
/**
 * @swagger
 * /api/parents/{parentId}/students/{studentId}:
 *   delete:
 *     summary: 删除指定家长的学生关系
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: parentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *     responses:
 *       200:
 *         description: 家长学生关系删除成功
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
 *                   example: 家长学生关系删除成功
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长或学生关系不存在
 *       500:
 *         description: 服务器内部错误
 */
router["delete"]('/:parentId/students/:studentId', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), parentStudentRelationController.removeParentStudent);
/**
 * @swagger
 * /api/parents/{id}/children:
 *   get:
 *     summary: 获取家长的子女列表（API兼容性别名）
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *     responses:
 *       200:
 *         description: 家长子女列表获取成功
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
 *                   example: 获取家长子女列表成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     children:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Child'
 *                     total:
 *                       type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/:id/children', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parentId, mockChildren;
    return __generator(this, function (_a) {
        try {
            parentId = req.params.id;
            mockChildren = [
                {
                    id: 1,
                    parentId: parseInt(parentId),
                    name: '小明',
                    gender: 'male',
                    birthDate: '2020-03-15',
                    classId: 1,
                    "class": { id: 1, name: '小一班', grade: 'junior' },
                    relationship: 'son',
                    enrollmentDate: '2024-09-01'
                },
                {
                    id: 2,
                    parentId: parseInt(parentId),
                    name: '小红',
                    gender: 'female',
                    birthDate: '2019-08-20',
                    classId: 2,
                    "class": { id: 2, name: '中一班', grade: 'middle' },
                    relationship: 'daughter',
                    enrollmentDate: '2023-09-01'
                }
            ];
            res.json({
                success: true,
                message: '获取家长子女列表成功',
                data: {
                    children: mockChildren,
                    total: mockChildren.length
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: '获取家长子女列表失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/parents/{id}/communications:
 *   get:
 *     summary: 获取家长沟通记录
 *     tags: [Parents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 家长ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [phone, wechat, email, visit]
 *         description: 沟通方式
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
 *         description: 家长沟通记录获取成功
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
 *                   example: 获取家长沟通记录成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     communications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Communication'
 *                     total:
 *                       type: integer
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       404:
 *         description: 家长不存在
 *       500:
 *         description: 服务器内部错误
 */
router.get('/:id/communications', auth, (0, auth_middleware_1.checkPermission)('PARENT_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var parentId, mockCommunications;
    return __generator(this, function (_a) {
        try {
            parentId = req.params.id;
            mockCommunications = [
                {
                    id: 1,
                    parentId: parseInt(parentId),
                    teacherId: 1,
                    teacher: { id: 1, name: '张老师', subject: '班主任' },
                    type: 'phone',
                    topic: '学习情况沟通',
                    content: '孩子最近在课堂上表现积极，但需要加强数学练习',
                    communicationDate: '2024-07-10',
                    createdAt: new Date().toISOString()
                },
                {
                    id: 2,
                    parentId: parseInt(parentId),
                    teacherId: 2,
                    teacher: { id: 2, name: '李老师', subject: '英语老师' },
                    type: 'wechat',
                    topic: '家庭作业指导',
                    content: '建议家长在家多陪孩子练习英语口语',
                    communicationDate: '2024-07-08',
                    createdAt: new Date().toISOString()
                }
            ];
            res.json({
                success: true,
                message: '获取家长沟通记录成功',
                data: {
                    communications: mockCommunications,
                    total: mockCommunications.length
                }
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                message: '获取家长沟通记录失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
// 触发热重载 - 2025-06-11 06:41 
