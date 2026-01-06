"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var todo_service_1 = __importDefault(require("../services/system/todo.service"));
var router = (0, express_1.Router)();
/**
 * @swagger
 * components:
 *   schemas:
 *     Todo:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 待办事项ID
 *         title:
 *           type: string
 *           description: 任务标题
 *         description:
 *           type: string
 *           description: 任务描述
 *         priority:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *           description: 优先级（1-最低，5-最高）
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled, overdue]
 *           description: 任务状态
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: 截止日期
 *         userId:
 *           type: integer
 *           description: 创建用户ID
 *         assignedTo:
 *           type: integer
 *           description: 分配给用户ID
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           description: 标签列表
 *         relatedId:
 *           type: integer
 *           description: 关联ID
 *         relatedType:
 *           type: string
 *           description: 关联类型
 *         notify:
 *           type: boolean
 *           description: 是否通知
 *         notifyTime:
 *           type: string
 *           format: date-time
 *           description: 通知时间
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *       required:
 *         - id
 *         - title
 *         - status
 *         - userId
 */
/**
 * @swagger
 * /api/todos:
 *   get:
 *     summary: 获取待办事项列表
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 创建用户ID
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: integer
 *         description: 分配给用户ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled, overdue]
 *         description: 任务状态
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *         description: 优先级
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *       - in: query
 *         name: relatedType
 *         schema:
 *           type: string
 *         description: 关联类型
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                     page:
 *                       type: integer
 *                       description: 当前页码
 *                     pageSize:
 *                       type: integer
 *                       description: 每页数量
 *                     totalPages:
 *                       type: integer
 *                       description: 总页数
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, totalPages, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                params = {
                    userId: req.query.userId ? parseInt(req.query.userId) : undefined,
                    assignedTo: req.query.assignedTo ? parseInt(req.query.assignedTo) : undefined,
                    status: req.query.status,
                    priority: req.query.priority ? parseInt(req.query.priority) : undefined,
                    keyword: req.query.keyword,
                    relatedType: req.query.relatedType,
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
                    sortBy: req.query.sortBy || 'created_at',
                    sortOrder: req.query.sortOrder || 'DESC'
                };
                return [4 /*yield*/, todo_service_1["default"].getTodos(params)];
            case 1:
                result = _a.sent();
                totalPages = Math.ceil(result.count / params.pageSize);
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: result.rows,
                        total: result.count,
                        page: params.page,
                        pageSize: params.pageSize,
                        totalPages: totalPages
                    })];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取待办事项列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/todos/my:
 *   get:
 *     summary: 获取我的待办事项列表
 *     tags: [Todos]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, cancelled, overdue]
 *         description: 任务状态
 *       - in: query
 *         name: priority
 *         schema:
 *           type: integer
 *           enum: [1, 2, 3, 4, 5]
 *         description: 优先级
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Todo'
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 */
router.get('/my', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, params, result, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                params = {
                    userId: userId,
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    pageSize: req.query.pageSize ? parseInt(req.query.pageSize) : 10,
                    status: req.query.status,
                    priority: req.query.priority ? parseInt(req.query.priority) : undefined
                };
                return [4 /*yield*/, todo_service_1["default"].getTodos(params)];
            case 1:
                result = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: result.rows,
                        total: result.count
                    })];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '获取我的待办失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/todos/statistics:
 *   get:
 *     summary: 获取待办事项统计信息
 *     tags: [Todos]
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
 *                 total:
 *                   type: integer
 *                   description: 总数
 *                 pending:
 *                   type: integer
 *                   description: 待处理数量
 *                 in_progress:
 *                   type: integer
 *                   description: 进行中数量
 *                 completed:
 *                   type: integer
 *                   description: 已完成数量
 *                 overdue:
 *                   type: integer
 *                   description: 逾期数量
 */
router.get('/statistics', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, stats, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, todo_service_1["default"].getTodoStats(userId)];
            case 1:
                stats = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, stats)];
            case 2:
                error_3 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '获取待办统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/todos/stats:
 *   get:
 *     summary: 获取待办事项统计信息（别名）
 *     tags: [Todos]
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
 *                 total:
 *                   type: integer
 *                   description: 总数
 *                 pending:
 *                   type: integer
 *                   description: 待处理数量
 *                 in_progress:
 *                   type: integer
 *                   description: 进行中数量
 *                 completed:
 *                   type: integer
 *                   description: 已完成数量
 *                 overdue:
 *                   type: integer
 *                   description: 逾期数量
 */
router.get('/stats', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, stats, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, todo_service_1["default"].getTodoStats(userId)];
            case 1:
                stats = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, stats)];
            case 2:
                error_4 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '获取待办统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/todos:
 *   post:
 *     summary: 创建待办事项
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 description: 任务标题
 *                 example: "完成项目文档"
 *               description:
 *                 type: string
 *                 description: 任务描述
 *                 example: "编写API文档和用户手册"
 *               priority:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *                 description: 优先级
 *                 default: 3
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled, overdue]
 *                 description: 任务状态
 *                 default: pending
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *               assignedTo:
 *                 type: integer
 *                 description: 分配给用户ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *               relatedId:
 *                 type: integer
 *                 description: 关联ID
 *               relatedType:
 *                 type: string
 *                 description: 关联类型
 *               notify:
 *                 type: boolean
 *                 description: 是否通知
 *                 default: false
 *               notifyTime:
 *                 type: string
 *                 format: date-time
 *                 description: 通知时间
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
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 */
router.post('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, todo, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                data = {
                    title: req.body.title,
                    description: req.body.description,
                    priority: req.body.priority,
                    status: req.body.status,
                    dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined,
                    userId: (_a = req.user) === null || _a === void 0 ? void 0 : _a.id,
                    assignedTo: req.body.assignedTo,
                    tags: req.body.tags,
                    relatedId: req.body.relatedId,
                    relatedType: req.body.relatedType,
                    notify: req.body.notify,
                    notifyTime: req.body.notifyTime ? new Date(req.body.notifyTime) : undefined
                };
                return [4 /*yield*/, todo_service_1["default"].createTodo(data)];
            case 1:
                todo = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, todo, '创建待办事项成功', 201)];
            case 2:
                error_5 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '创建待办事项失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/todos/{id}:
 *   get:
 *     summary: 获取待办事项详情
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
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
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
 */
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, todo, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id);
                return [4 /*yield*/, todo_service_1["default"].getTodoById(id)];
            case 1:
                todo = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, todo)];
            case 2:
                error_6 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_6, '获取待办事项详情失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/todos/{id}:
 *   put:
 *     summary: 更新待办事项
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 任务标题
 *               description:
 *                 type: string
 *                 description: 任务描述
 *               priority:
 *                 type: integer
 *                 enum: [1, 2, 3, 4, 5]
 *                 description: 优先级
 *               status:
 *                 type: string
 *                 enum: [pending, in_progress, completed, cancelled, overdue]
 *                 description: 任务状态
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *               assignedTo:
 *                 type: integer
 *                 description: 分配给用户ID
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 标签列表
 *               notify:
 *                 type: boolean
 *                 description: 是否通知
 *               notifyTime:
 *                 type: string
 *                 format: date-time
 *                 description: 通知时间
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
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *                 message:
 *                   type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
 */
router.put('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, data, todo, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id);
                data = __assign(__assign({}, req.body), { dueDate: req.body.dueDate ? new Date(req.body.dueDate) : undefined, notifyTime: req.body.notifyTime ? new Date(req.body.notifyTime) : undefined });
                return [4 /*yield*/, todo_service_1["default"].updateTodo(id, data)];
            case 1:
                todo = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, todo, '更新待办事项成功')];
            case 2:
                error_7 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_7, '更新待办事项失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/todos/{id}/complete:
 *   patch:
 *     summary: 标记待办事项为完成
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
 *     responses:
 *       200:
 *         description: 标记成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Todo'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
 */
router.patch('/:id/complete', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, todo, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id);
                return [4 /*yield*/, todo_service_1["default"].markTodoCompleted(id)];
            case 1:
                todo = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, todo, '标记待办完成成功')];
            case 2:
                error_8 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_8, '标记待办完成失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/todos/{id}:
 *   delete:
 *     summary: 删除待办事项
 *     tags: [Todos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 待办事项ID
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
 *                 data:
 *                   type: 'null'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id);
                return [4 /*yield*/, todo_service_1["default"].deleteTodo(id)];
            case 1:
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '删除待办事项成功')];
            case 2:
                error_9 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_9, '删除待办事项失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
