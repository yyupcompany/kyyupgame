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
var apiResponse_1 = require("../utils/apiResponse");
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     EnrollmentTask:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 招生任务ID
 *         title:
 *           type: string
 *           description: 任务标题
 *         description:
 *           type: string
 *           description: 任务描述
 *         status:
 *           type: string
 *           enum: ['pending', 'in_progress', 'completed', 'cancelled']
 *           description: 任务状态
 *         priority:
 *           type: string
 *           enum: ['low', 'medium', 'high', 'urgent']
 *           description: 任务优先级
 *         assignedTo:
 *           type: integer
 *           description: 分配给的用户ID
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: 截止日期
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *     CreateEnrollmentTask:
 *       type: object
 *       required:
 *         - title
 *         - description
 *         - status
 *         - priority
 *       properties:
 *         title:
 *           type: string
 *           description: 任务标题
 *         description:
 *           type: string
 *           description: 任务描述
 *         status:
 *           type: string
 *           enum: ['pending', 'in_progress', 'completed', 'cancelled']
 *           description: 任务状态
 *         priority:
 *           type: string
 *           enum: ['low', 'medium', 'high', 'urgent']
 *           description: 任务优先级
 *         assignedTo:
 *           type: integer
 *           description: 分配给的用户ID
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: 截止日期
 *     UpdateEnrollmentTask:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: 任务标题
 *         description:
 *           type: string
 *           description: 任务描述
 *         status:
 *           type: string
 *           enum: ['pending', 'in_progress', 'completed', 'cancelled']
 *           description: 任务状态
 *         priority:
 *           type: string
 *           enum: ['low', 'medium', 'high', 'urgent']
 *           description: 任务优先级
 *         assignedTo:
 *           type: integer
 *           description: 分配给的用户ID
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: 截止日期
 *     EnrollmentTaskList:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EnrollmentTask'
 *         total:
 *           type: integer
 *           description: 总数
 *         page:
 *           type: integer
 *           description: 当前页码
 *         pageSize:
 *           type: integer
 *           description: 每页大小
 *         totalPages:
 *           type: integer
 *           description: 总页数
 *   securitySchemes:
 *     BearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
/**
 * @swagger
 * /enrollment-tasks:
 *   get:
 *     tags:
 *       - 招生任务管理
 *     summary: 获取招生任务列表
 *     description: 获取所有招生任务的分页列表
 *     security:
 *       - BearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: ['pending', 'in_progress', 'completed', 'cancelled']
 *         description: 按状态筛选
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: ['low', 'medium', 'high', 'urgent']
 *         description: 按优先级筛选
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: 按分配用户筛选
 *     responses:
 *       200:
 *         description: 成功获取招生任务列表
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EnrollmentTaskList'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 获取招生任务列表
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var tasks;
    return __generator(this, function (_a) {
        try {
            tasks = [];
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    items: tasks,
                    total: tasks.length,
                    page: 1,
                    pageSize: tasks.length,
                    totalPages: 1
                })];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取招生任务列表失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /enrollment-tasks:
 *   post:
 *     tags:
 *       - 招生任务管理
 *     summary: 创建招生任务
 *     description: 创建新的招生任务
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEnrollmentTask'
 *           example:
 *             title: "学前班招生宣传"
 *             description: "负责学前班新学期招生宣传工作，包括宣传资料制作和推广活动"
 *             status: "pending"
 *             priority: "high"
 *             assignedTo: 1
 *             dueDate: "2024-03-15T10:00:00.000Z"
 *     responses:
 *       201:
 *         description: 招生任务创建成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EnrollmentTask'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 创建招生任务
router.post('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '创建招生任务功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '创建招生任务失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /enrollment-tasks/{id}:
 *   get:
 *     tags:
 *       - 招生任务管理
 *     summary: 获取招生任务详情
 *     description: 根据ID获取招生任务的详细信息
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生任务ID
 *     responses:
 *       200:
 *         description: 成功获取招生任务详情
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EnrollmentTask'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生任务不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 获取招生任务详情
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '招生任务详情功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取招生任务详情失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /enrollment-tasks/{id}:
 *   put:
 *     tags:
 *       - 招生任务管理
 *     summary: 更新招生任务
 *     description: 根据ID更新招生任务信息
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生任务ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateEnrollmentTask'
 *           example:
 *             title: "学前班招生宣传（更新）"
 *             description: "负责学前班新学期招生宣传工作，包括宣传资料制作和推广活动，增加线上推广"
 *             status: "in_progress"
 *             priority: "urgent"
 *             assignedTo: 2
 *             dueDate: "2024-03-10T10:00:00.000Z"
 *     responses:
 *       200:
 *         description: 招生任务更新成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/EnrollmentTask'
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生任务不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 更新招生任务
router.put('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '更新招生任务功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '更新招生任务失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /enrollment-tasks/{id}:
 *   delete:
 *     tags:
 *       - 招生任务管理
 *     summary: 删除招生任务
 *     description: 根据ID删除招生任务
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 招生任务ID
 *     responses:
 *       200:
 *         description: 招生任务删除成功
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
 *                         message:
 *                           type: string
 *                           example: "招生任务删除成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生任务不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       501:
 *         description: 功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 删除招生任务
router["delete"]('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '删除招生任务功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '删除招生任务失败')];
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
