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
var auth_middleware_1 = require("../middlewares/auth.middleware");
var class_controller_1 = require("../controllers/class.controller");
var router = (0, express_1.Router)();
var classController = new class_controller_1.ClassController();
/**
 * @swagger
 * /api/classes/stats:
 *   get:
 *     summary: 获取班级统计信息
 *     description: 获取系统中班级的统计数据，包括总数、各年级分布等
 *     tags: [班级管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取班级统计信息
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
 *                     totalClasses:
 *                       type: integer
 *                       description: 班级总数
 *                       example: 12
 *                     gradeDistribution:
 *                       type: object
 *                       description: 年级分布
 *                       additionalProperties:
 *                         type: integer
 *                       example:
 *                         小班: 4
 *                         中班: 4
 *                         大班: 4
 *                     averageStudentsPerClass:
 *                       type: number
 *                       description: 平均每班学生数
 *                       example: 25.5
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/stats', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController.getStats(req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('班级统计路由错误:', error_1);
                res.status(500).json({
                    success: false,
                    message: '获取班级统计失败',
                    error: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes/statistics:
 *   get:
 *     summary: 获取班级统计信息 (兼容性接口)
 *     description: 获取系统中班级的统计数据，与 /stats 接口功能相同，提供兼容性支持
 *     tags: [班级管理]
 *     security:
 *       - bearerAuth: []
 *     deprecated: true
 *     responses:
 *       200:
 *         description: 成功获取班级统计信息
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassStatsResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/statistics', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController.getStats(req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('班级统计路由错误:', error_2);
                res.status(500).json({
                    success: false,
                    message: '获取班级统计失败',
                    error: error_2 instanceof Error ? error_2.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes:
 *   get:
 *     summary: 获取班级列表
 *     description: 分页获取班级列表，支持按年级、教师等条件筛选
 *     tags: [班级管理]
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
 *         name: grade
 *         schema:
 *           type: string
 *           enum: [小班, 中班, 大班]
 *         description: 年级筛选
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: integer
 *         description: 教师ID筛选
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: 搜索关键词（班级名称）
 *     responses:
 *       200:
 *         description: 成功获取班级列表
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
 *                     classes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Class'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController.list(req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('班级列表路由错误:', error_3);
                res.status(500).json({
                    success: false,
                    message: '获取班级列表失败',
                    error: error_3 instanceof Error ? error_3.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: 获取班级详情
 *     description: 根据班级ID获取班级的详细信息，包括教师、学生等关联数据
 *     tags: [班级管理]
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
 *         description: 成功获取班级详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClassDetail'
 *       404:
 *         description: 班级不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级不存在"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController.detail(req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('班级详情路由错误:', error_4);
                res.status(500).json({
                    success: false,
                    message: '获取班级详情失败',
                    error: error_4 instanceof Error ? error_4.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes:
 *   post:
 *     summary: 创建新班级
 *     description: 创建一个新的班级，需要提供班级名称、年级等基本信息
 *     tags: [班级管理]
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
 *             properties:
 *               name:
 *                 type: string
 *                 description: 班级名称
 *                 example: "小一班"
 *               grade:
 *                 type: string
 *                 enum: [小班, 中班, 大班]
 *                 description: 年级
 *                 example: "小班"
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 description: 班级容量
 *                 example: 30
 *               teacherId:
 *                 type: integer
 *                 description: 主班教师ID
 *                 example: 1
 *               description:
 *                 type: string
 *                 description: 班级描述
 *                 example: "活泼可爱的小班"
 *     responses:
 *       201:
 *         description: 成功创建班级
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
 *                   example: "班级创建成功"
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级名称不能为空"
 *       409:
 *         description: 班级名称已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级名称已存在"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                console.log('=== 创建班级路由开始 ===');
                console.log('请求体:', JSON.stringify(req.body, null, 2));
                console.log('用户信息:', req.user);
                return [4 /*yield*/, classController.create(req, res)];
            case 1:
                _a.sent();
                console.log('=== 创建班级路由成功 ===');
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('=== 创建班级路由错误 ===');
                console.error('错误详情:', error_5);
                console.error('错误堆栈:', error_5 instanceof Error ? error_5.stack : '无堆栈信息');
                res.status(500).json({
                    success: false,
                    message: '创建班级失败',
                    error: error_5 instanceof Error ? error_5.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: 更新班级信息
 *     description: 根据班级ID更新班级的详细信息
 *     tags: [班级管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 班级ID
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
 *                 example: "小一班"
 *               grade:
 *                 type: string
 *                 enum: [小班, 中班, 大班]
 *                 description: 年级
 *                 example: "小班"
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 50
 *                 description: 班级容量
 *                 example: 30
 *               teacherId:
 *                 type: integer
 *                 description: 主班教师ID
 *                 example: 1
 *               description:
 *                 type: string
 *                 description: 班级描述
 *                 example: "活泼可爱的小班"
 *     responses:
 *       200:
 *         description: 成功更新班级信息
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
 *                   example: "班级信息更新成功"
 *                 data:
 *                   $ref: '#/components/schemas/Class'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 班级不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级不存在"
 *       409:
 *         description: 班级名称已存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级名称已存在"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController.update(req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('更新班级路由错误:', error_6);
                res.status(500).json({
                    success: false,
                    message: '更新班级失败',
                    error: error_6 instanceof Error ? error_6.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: 删除班级
 *     description: 根据班级ID删除班级，只有在班级没有学生的情况下才能删除
 *     tags: [班级管理]
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
 *         description: 成功删除班级
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
 *                   example: "班级删除成功"
 *       400:
 *         description: 班级有学生，无法删除
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级还有学生，无法删除"
 *       404:
 *         description: 班级不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级不存在"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_7, apiError;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController["delete"](req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('删除班级路由错误:', error_7);
                // 检查是否是ApiError，如果是则使用其状态码
                if (error_7 && typeof error_7 === 'object' && 'statusCode' in error_7) {
                    apiError = error_7;
                    res.status(apiError.statusCode).json({
                        success: false,
                        message: apiError.message,
                        error: apiError.message
                    });
                }
                else {
                    res.status(500).json({
                        success: false,
                        message: '删除班级失败',
                        error: error_7 instanceof Error ? error_7.message : '未知错误'
                    });
                }
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes/{id}/students:
 *   get:
 *     summary: 获取班级学生列表
 *     description: 获取指定班级的所有学生信息，支持分页和搜索
 *     tags: [班级管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 班级ID
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
 *         description: 搜索关键词（学生姓名）
 *     responses:
 *       200:
 *         description: 成功获取班级学生列表
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
 *                     students:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Student'
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 *                     class:
 *                       $ref: '#/components/schemas/Class'
 *       404:
 *         description: 班级不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级不存在"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get('/:id/students', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController.getStudents(req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error('获取班级学生列表路由错误:', error_8);
                res.status(500).json({
                    success: false,
                    message: '获取班级学生列表失败',
                    error: error_8 instanceof Error ? error_8.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes/{id}/students:
 *   post:
 *     summary: 向班级添加学生
 *     description: 将一个或多个学生添加到指定班级中
 *     tags: [班级管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 班级ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentIds
 *             properties:
 *               studentIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: 要添加的学生ID数组
 *                 example: [1, 2, 3]
 *               studentId:
 *                 type: integer
 *                 description: 单个学生ID（兼容性参数）
 *                 example: 1
 *     responses:
 *       200:
 *         description: 成功添加学生到班级
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
 *                   example: "学生添加成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     addedCount:
 *                       type: integer
 *                       description: 成功添加的学生数量
 *                       example: 3
 *                     skippedCount:
 *                       type: integer
 *                       description: 跳过的学生数量（已在班级中）
 *                       example: 0
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               no_students:
 *                 summary: 未提供学生ID
 *                 value:
 *                   success: false
 *                   message: "请提供要添加的学生ID"
 *               capacity_exceeded:
 *                 summary: 班级容量不足
 *                 value:
 *                   success: false
 *                   message: "班级容量不足"
 *       404:
 *         description: 班级或学生不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "班级不存在"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post('/:id/students', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController.addStudent(req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_9 = _a.sent();
                console.error('添加学生到班级路由错误:', error_9);
                res.status(500).json({
                    success: false,
                    message: '添加学生到班级失败',
                    error: error_9 instanceof Error ? error_9.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/classes/{id}/students/{studentId}:
 *   delete:
 *     summary: 从班级移除学生
 *     description: 将指定学生从班级中移除
 *     tags: [班级管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 班级ID
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 学生ID
 *     responses:
 *       200:
 *         description: 成功从班级移除学生
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
 *                   example: "学生移除成功"
 *       404:
 *         description: 班级或学生不存在，或学生不在该班级中
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               class_not_found:
 *                 summary: 班级不存在
 *                 value:
 *                   success: false
 *                   message: "班级不存在"
 *               student_not_found:
 *                 summary: 学生不存在
 *                 value:
 *                   success: false
 *                   message: "学生不存在"
 *               student_not_in_class:
 *                 summary: 学生不在该班级中
 *                 value:
 *                   success: false
 *                   message: "学生不在该班级中"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router["delete"]('/:id/students/:studentId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CLASS_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, classController.removeStudent(req, res)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                console.error('从班级移除学生路由错误:', error_10);
                res.status(500).json({
                    success: false,
                    message: '从班级移除学生失败',
                    error: error_10 instanceof Error ? error_10.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
