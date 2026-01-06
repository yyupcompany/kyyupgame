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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var apiResponse_1 = require("../utils/apiResponse");
var schedule_service_1 = __importDefault(require("../services/system/schedule.service"));
var router = express_1["default"].Router();
/**
 * @swagger
 * components:
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 日程ID
 *         title:
 *           type: string
 *           description: 日程标题
 *         description:
 *           type: string
 *           description: 日程描述
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *         location:
 *           type: string
 *           description: 地点
 *         userId:
 *           type: integer
 *           description: 用户ID
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */
/**
 * @swagger
 * /api/schedules:
 *   get:
 *     summary: 获取日程列表
 *     tags: [Schedules]
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
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: 地点
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 用户ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var params, result, totalPages, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                params = {
                    page: req.query.page ? parseInt(req.query.page) : 1,
                    limit: req.query.limit ? parseInt(req.query.limit) : 10,
                    startDate: req.query.startDate,
                    endDate: req.query.endDate,
                    location: req.query.location,
                    userId: req.query.userId ? parseInt(req.query.userId) : undefined
                };
                return [4 /*yield*/, schedule_service_1["default"].getSchedules(params)];
            case 1:
                result = _a.sent();
                totalPages = Math.ceil(result.total / result.limit);
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: result.schedules,
                        total: result.total,
                        page: result.page,
                        limit: result.limit,
                        totalPages: totalPages
                    })];
            case 2:
                error_1 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取日程列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 获取日程统计 (必须在 /:id 之前)
/**
 * @swagger
 * /api/schedules/statistics:
 *   get:
 *     summary: 获取日程统计
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 统计数据获取成功
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
 *                   description: 日程统计数据
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/statistics', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, stats, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, schedule_service_1["default"].getScheduleStatistics(userId)];
            case 1:
                stats = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, stats)];
            case 2:
                error_2 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '获取日程统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/schedules/stats:
 *   get:
 *     summary: 获取日程统计（别名）
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 统计数据获取成功
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
 *                   description: 日程统计数据
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取日程统计 - 别名路由 (必须在 /:id 之前)
router.get('/stats', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, stats, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, schedule_service_1["default"].getScheduleStatistics(userId)];
            case 1:
                stats = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, stats)];
            case 2:
                error_3 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '获取日程统计失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
// 获取日历视图 (必须在 /:id 之前)
router.get('/calendar/:year/:month', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, year, month, schedules, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                year = parseInt(req.params.year);
                month = parseInt(req.params.month);
                return [4 /*yield*/, schedule_service_1["default"].getCalendarView(year, month, userId)];
            case 1:
                schedules = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: schedules,
                        total: schedules.length,
                        year: year,
                        month: month
                    })];
            case 2:
                error_4 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '获取日历视图失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/schedules:
 *   post:
 *     summary: 创建日程
 *     tags: [Schedules]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - startTime
 *               - endTime
 *             properties:
 *               title:
 *                 type: string
 *                 description: 日程标题
 *                 example: "团队会议"
 *               description:
 *                 type: string
 *                 description: 日程描述
 *                 example: "讨论项目进度"
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *               location:
 *                 type: string
 *                 description: 地点
 *     responses:
 *       201:
 *         description: 创建成功
 */
router.post('/', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var data, userId, schedule, error_5;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                data = {
                    title: req.body.title,
                    description: req.body.description,
                    startTime: req.body.startTime,
                    endTime: req.body.endTime,
                    location: req.body.location
                };
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                return [4 /*yield*/, schedule_service_1["default"].createSchedule(data, userId)];
            case 1:
                schedule = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, schedule, '创建日程成功', 201)];
            case 2:
                error_5 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '创建日程失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/schedules/{id}:
 *   get:
 *     summary: 获取日程详情
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日程ID
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 日程不存在
 */
router.get('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, schedule, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id);
                return [4 /*yield*/, schedule_service_1["default"].getScheduleById(id)];
            case 1:
                schedule = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, schedule)];
            case 2:
                error_6 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_6, '获取日程详情失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/schedules/{id}:
 *   put:
 *     summary: 更新日程
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日程ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: 日程标题
 *               description:
 *                 type: string
 *                 description: 日程描述
 *               startTime:
 *                 type: string
 *                 format: date-time
 *                 description: 开始时间
 *               endTime:
 *                 type: string
 *                 format: date-time
 *                 description: 结束时间
 *               location:
 *                 type: string
 *                 description: 地点
 *     responses:
 *       200:
 *         description: 更新成功
 *       404:
 *         description: 日程不存在
 */
router.put('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, data, schedule, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id);
                data = {
                    title: req.body.title,
                    description: req.body.description,
                    startTime: req.body.startTime,
                    endTime: req.body.endTime,
                    location: req.body.location
                };
                return [4 /*yield*/, schedule_service_1["default"].updateSchedule(id, data)];
            case 1:
                schedule = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, schedule, '更新日程成功')];
            case 2:
                error_7 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_7, '更新日程失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/schedules/{id}:
 *   delete:
 *     summary: 删除日程
 *     tags: [Schedules]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 日程ID
 *     responses:
 *       200:
 *         description: 删除成功
 *       404:
 *         description: 日程不存在
 */
router["delete"]('/:id', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = parseInt(req.params.id);
                return [4 /*yield*/, schedule_service_1["default"].deleteSchedule(id)];
            case 1:
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '删除日程成功')];
            case 2:
                error_8 = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_8, '删除日程失败')];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
