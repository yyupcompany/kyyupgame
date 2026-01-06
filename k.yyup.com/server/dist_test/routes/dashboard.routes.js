"use strict";
/**
 * 仪表盘路由 - 系统概览和统计功能
 * @swagger
 * components:
 *   schemas:
 *     DashboardOverview:
 *       type: object
 *       properties:
 *         totalUsers:
 *           type: number
 *           description: 总用户数
 *           example: 150
 *         totalKindergartens:
 *           type: number
 *           description: 总幼儿园数
 *           example: 12
 *         totalStudents:
 *           type: number
 *           description: 总学生数
 *           example: 1200
 *         totalApplications:
 *           type: number
 *           description: 总申请数
 *           example: 85
 *         recentActivities:
 *           type: array
 *           description: 最近活动
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: number
 *               type:
 *                 type: string
 *               description:
 *                 type: string
 *               time:
 *                 type: string
 *     DashboardStats:
 *       type: object
 *       properties:
 *         userCount:
 *           type: number
 *           description: 用户数量
 *           example: 10
 *         kindergartenCount:
 *           type: number
 *           description: 幼儿园数量
 *           example: 5
 *         studentCount:
 *           type: number
 *           description: 学生数量
 *           example: 150
 *         enrollmentCount:
 *           type: number
 *           description: 招生数量
 *           example: 25
 *         activityCount:
 *           type: number
 *           description: 活动数量
 *           example: 8
 *     TodoItem:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: 待办事项ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 待办事项标题
 *           example: "完成月度报告"
 *         description:
 *           type: string
 *           description: 待办事项描述
 *           example: "编写和提交月度工作报告"
 *         status:
 *           type: string
 *           enum: [pending, completed]
 *           description: 待办事项状态
 *           example: "pending"
 *         priority:
 *           type: string
 *           enum: [low, medium, high]
 *           description: 优先级
 *           example: "high"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: 截止日期
 *           example: "2025-07-20T18:00:00Z"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2025-07-01T09:00:00Z"
 *     ScheduleItem:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: 日程ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 日程标题
 *           example: "教师评估会议"
 *         startTime:
 *           type: string
 *           format: date-time
 *           description: 开始时间
 *           example: "2025-07-15T09:00:00Z"
 *         endTime:
 *           type: string
 *           format: date-time
 *           description: 结束时间
 *           example: "2025-07-15T11:00:00Z"
 *         location:
 *           type: string
 *           description: 地点
 *           example: "会议室A"
 *         attendees:
 *           type: array
 *           description: 参与人员
 *           items:
 *             type: string
 *           example: ["王主任", "李老师", "张老师"]
 *     NoticeItem:
 *       type: object
 *       properties:
 *         id:
 *           type: number
 *           description: 通知ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "2025年秋季招生计划已发布"
 *         publishTime:
 *           type: string
 *           format: date-time
 *           description: 发布时间
 *           example: "2025-03-15T08:00:00Z"
 *         importance:
 *           type: string
 *           enum: [HIGH, MEDIUM, LOW]
 *           description: 重要程度
 *           example: "HIGH"
 *         readCount:
 *           type: number
 *           description: 已读数量
 *           example: 20
 *         totalCount:
 *           type: number
 *           description: 总接收人数
 *           example: 24
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 * tags:
 *   - name: Dashboard
 *     description: 仪表盘管理相关接口
 */
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
var dashboard_controller_1 = require("../controllers/dashboard.controller");
var dashboard_service_1 = require("../services/dashboard/dashboard.service");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var customer_pool_routes_1 = __importDefault(require("./customer-pool.routes"));
var logger_1 = require("../utils/logger");
var apiResponse_1 = require("../utils/apiResponse");
var router = express_1["default"].Router();
var dashboardController = new dashboard_controller_1.DashboardController();
// 使用认证中间件
router.use(auth_middleware_1.authMiddleware);
/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: 获取仪表盘概览
 *     description: 获取系统整体概览数据，包括用户、幼儿园、学生、申请等统计信息
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取仪表盘概览
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
 *                     totalUsers:
 *                       type: number
 *                       description: 总用户数
 *                       example: 150
 *                     totalKindergartens:
 *                       type: number
 *                       description: 总幼儿园数
 *                       example: 12
 *                     totalStudents:
 *                       type: number
 *                       description: 总学生数
 *                       example: 1200
 *                     totalApplications:
 *                       type: number
 *                       description: 总申请数
 *                       example: 85
 *                     recentActivities:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           type:
 *                             type: string
 *                           description:
 *                             type: string
 *                           time:
 *                             type: string
 *                 message:
 *                   type: string
 *                   example: 获取仪表盘概览成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取仪表盘概览
router.get('/overview', function (req, res, next) {
    try {
        logger_1.logger.info('[API调试] 访问仪表盘概览接口');
        return apiResponse_1.ApiResponse.success(res, {
            totalUsers: 150,
            totalKindergartens: 12,
            totalStudents: 1200,
            totalApplications: 85,
            recentActivities: [
                { id: 1, type: 'enrollment', description: '新增报名申请', time: '2025-06-10 09:30' },
                { id: 2, type: 'activity', description: '活动报名开始', time: '2025-06-10 08:15' }
            ]
        }, '获取仪表盘概览成功');
    }
    catch (error) {
        logger_1.logger.error("[API\u8C03\u8BD5] \u4EEA\u8868\u76D8\u6982\u89C8\u63A5\u53E3\u9519\u8BEF: ".concat(error));
        next(error);
    }
});
/**
 * @swagger
 * /api/dashboard/statistics:
 *   get:
 *     summary: 获取统计数据
 *     description: 获取详细的统计数据，包括招生、活动、用户等各类统计信息
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
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
 *                     enrollmentStats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 1200
 *                         thisMonth:
 *                           type: number
 *                           example: 85
 *                         growth:
 *                           type: number
 *                           example: 12.5
 *                     activityStats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 45
 *                         thisMonth:
 *                           type: number
 *                           example: 8
 *                         participation:
 *                           type: number
 *                           example: 89.2
 *                     userStats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                           example: 150
 *                         active:
 *                           type: number
 *                           example: 128
 *                         newThisMonth:
 *                           type: number
 *                           example: 15
 *                 message:
 *                   type: string
 *                   example: 获取统计数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取统计数据
router.get('/statistics', function (req, res, next) {
    try {
        logger_1.logger.info('[API调试] 访问统计数据接口');
        return apiResponse_1.ApiResponse.success(res, {
            enrollmentStats: {
                total: 1200,
                thisMonth: 85,
                growth: 12.5
            },
            activityStats: {
                total: 45,
                thisMonth: 8,
                participation: 89.2
            },
            userStats: {
                total: 150,
                active: 128,
                newThisMonth: 15
            }
        }, '获取统计数据成功');
    }
    catch (error) {
        logger_1.logger.error("[API\u8C03\u8BD5] \u7EDF\u8BA1\u6570\u636E\u63A5\u53E3\u9519\u8BEF: ".concat(error));
        next(error);
    }
});
/**
 * @swagger
 * /api/dashboard/real-time/system-status:
 *   get:
 *     summary: 获取实时系统状态
 *     description: 获取系统实时运行状态，包括CPU、内存、数据库等信息
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取系统状态
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
 *                     status:
 *                       type: string
 *                       example: healthy
 *                     uptime:
 *                       type: string
 *                       example: "15 days 8 hours"
 *                     cpu:
 *                       type: object
 *                       properties:
 *                         usage:
 *                           type: number
 *                           example: 45.2
 *                         cores:
 *                           type: number
 *                           example: 4
 *                     memory:
 *                       type: object
 *                       properties:
 *                         used:
 *                           type: number
 *                           example: 2.1
 *                         total:
 *                           type: number
 *                           example: 8.0
 *                         usage:
 *                           type: number
 *                           example: 26.3
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: connected
 *                         responseTime:
 *                           type: number
 *                           example: 12
 *                     services:
 *                       type: object
 *                       properties:
 *                         api:
 *                           type: string
 *                           example: running
 *                         auth:
 *                           type: string
 *                           example: running
 *                         notification:
 *                           type: string
 *                           example: running
 *                     lastCheck:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: 获取系统状态成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取实时系统状态
router.get('/real-time/system-status', function (req, res, next) {
    try {
        logger_1.logger.info('[API调试] 访问实时系统状态接口');
        return apiResponse_1.ApiResponse.success(res, {
            status: 'healthy',
            uptime: '15 days 8 hours',
            cpu: {
                usage: 45.2,
                cores: 4
            },
            memory: {
                used: 2.1,
                total: 8.0,
                usage: 26.3
            },
            database: {
                status: 'connected',
                responseTime: 12
            },
            services: {
                api: 'running',
                auth: 'running',
                notification: 'running'
            },
            lastCheck: new Date().toISOString()
        }, '获取系统状态成功');
    }
    catch (error) {
        logger_1.logger.error("[API\u8C03\u8BD5] \u7CFB\u7EDF\u72B6\u6001\u63A5\u53E3\u9519\u8BEF: ".concat(error));
        next(error);
    }
});
/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: 获取仪表盘统计数据
 *     description: 获取简化的仪表盘统计数据，包括用户、幼儿园、学生、招生、活动等数量统计
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
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
 *                     userCount:
 *                       type: number
 *                       description: 用户数量
 *                       example: 10
 *                     kindergartenCount:
 *                       type: number
 *                       description: 幼儿园数量
 *                       example: 5
 *                     studentCount:
 *                       type: number
 *                       description: 学生数量
 *                       example: 150
 *                     enrollmentCount:
 *                       type: number
 *                       description: 招生数量
 *                       example: 25
 *                     activityCount:
 *                       type: number
 *                       description: 活动数量
 *                       example: 8
 *                 message:
 *                   type: string
 *                   example: 获取仪表盘统计数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取仪表盘统计数据
router.get('/stats', function (req, res, next) {
    try {
        logger_1.logger.info('[API调试] 访问仪表盘统计接口');
        logger_1.logger.info("[API\u8C03\u8BD5] \u7528\u6237\u5BF9\u8C61: ".concat(JSON.stringify(req.user || {})));
        logger_1.logger.info("[API\u8C03\u8BD5] \u6743\u9650\u5217\u8868: ".concat(JSON.stringify(req.permissions || [])));
        // 返回简化的统计数据
        return apiResponse_1.ApiResponse.success(res, {
            userCount: 10,
            kindergartenCount: 5,
            studentCount: 150,
            enrollmentCount: 25,
            activityCount: 8
        }, '获取仪表盘统计数据成功');
    }
    catch (error) {
        logger_1.logger.error("[API\u8C03\u8BD5] \u4EEA\u8868\u76D8\u7EDF\u8BA1\u63A5\u53E3\u9519\u8BEF: ".concat(error));
        // 返回错误细节（仅在开发环境）
        if (process.env.NODE_ENV === 'development') {
            return res.status(500).json({
                success: false,
                message: '服务器内部错误',
                details: error instanceof Error
                    ? { message: error.message, stack: error.stack }
                    : String(error)
            });
        }
        next(error);
    }
});
/**
 * @swagger
 * /api/dashboard/todos:
 *   get:
 *     summary: 获取待办事项
 *     description: 获取当前用户的待办事项列表
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取待办事项
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       title:
 *                         type: string
 *                       description:
 *                         type: string
 *                       status:
 *                         type: string
 *                         enum: [pending, completed]
 *                       priority:
 *                         type: string
 *                         enum: [low, medium, high]
 *                       dueDate:
 *                         type: string
 *                         format: date-time
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                 message:
 *                   type: string
 *                   example: 获取待办事项成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取待办事项
router.get('/todos', function (req, res) { return dashboardController.getTodos(req, res); });
// 注意：已移除模拟待办事项API，请使用 /todos 接口获取真实数据
/**
 * @swagger
 * /api/dashboard/schedule-data:
 *   get:
 *     summary: 获取日程安排页面的所有数据
 *     description: 获取日程安排页面的完整数据，包括统计信息、日程事件和即将到来的事件
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         description: 开始日期
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         description: 结束日期
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: viewType
 *         description: 视图类型
 *         schema:
 *           type: string
 *           enum: [month, week, day]
 *           default: month
 *       - in: query
 *         name: limit
 *         description: 即将到来事件的数量限制
 *         schema:
 *           type: integer
 *           default: 5
 *     responses:
 *       200:
 *         description: 成功获取日程数据
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
 *                     stats:
 *                       type: object
 *                       description: 统计数据
 *                     events:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           title:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           endTime:
 *                             type: string
 *                             format: date-time
 *                     upcomingEvents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           title:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                 message:
 *                   type: string
 *                   example: 获取日程数据成功
 *       401:
 *         description: 用户未认证
 *       500:
 *         description: 服务器错误
 */
// 获取日程安排页面的所有数据（优化后的合并接口）
router.get('/schedule-data', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, startDate, endDate, _b, viewType, _c, limit, dashboardService, _d, stats, schedules, upcomingSchedules, error_1;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 2, , 3]);
                userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: '用户未认证'
                        })];
                }
                _a = req.query, startDate = _a.startDate, endDate = _a.endDate, _b = _a.viewType, viewType = _b === void 0 ? 'month' : _b, _c = _a.limit, limit = _c === void 0 ? 5 : _c;
                dashboardService = new dashboard_service_1.DashboardService();
                return [4 /*yield*/, Promise.all([
                        // 1. 获取统计数据
                        dashboardController.getScheduleStats(userId),
                        // 2. 获取当前视图的日程数据
                        dashboardService.getSchedules(userId, {
                            startDate: startDate ? new Date(startDate) : undefined,
                            endDate: endDate ? new Date(endDate) : undefined
                        }),
                        // 3. 获取即将到来的日程（未来7天）
                        dashboardController.getUpcomingSchedules(userId, parseInt(limit) || 5)
                    ])];
            case 1:
                _d = _f.sent(), stats = _d[0], schedules = _d[1], upcomingSchedules = _d[2];
                res.json({
                    success: true,
                    data: {
                        stats: stats,
                        events: schedules,
                        upcomingEvents: upcomingSchedules
                    },
                    message: '获取日程数据成功'
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _f.sent();
                console.error('获取日程数据失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: '获取日程数据失败'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/dashboard/schedules:
 *   get:
 *     summary: 获取日程安排
 *     description: 获取用户的日程安排列表
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取日程安排
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       title:
 *                         type: string
 *                       startTime:
 *                         type: string
 *                         format: date-time
 *                       endTime:
 *                         type: string
 *                         format: date-time
 *                       location:
 *                         type: string
 *                       description:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: 获取日程安排成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取日程安排
router.get('/schedules', function (req, res) { return dashboardController.getSchedules(req, res); });
/**
 * @swagger
 * /api/dashboard/principal/stats:
 *   get:
 *     summary: 获取园长仪表盘统计数据
 *     description: 获取园长专用的仪表盘统计数据，包括学生、班级、教师、活动等详细统计
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取园长统计数据
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
 *                     totalStudents:
 *                       type: number
 *                       description: 总学生数
 *                       example: 320
 *                     totalClasses:
 *                       type: number
 *                       description: 总班级数
 *                       example: 12
 *                     totalTeachers:
 *                       type: number
 *                       description: 总教师数
 *                       example: 24
 *                     totalActivities:
 *                       type: number
 *                       description: 总活动数
 *                       example: 15
 *                     pendingApplications:
 *                       type: number
 *                       description: 待处理申请数
 *                       example: 18
 *                     enrollmentRate:
 *                       type: number
 *                       description: 招生率
 *                       example: 0.85
 *                     teacherAttendanceRate:
 *                       type: number
 *                       description: 教师出勤率
 *                       example: 0.95
 *                     studentAttendanceRate:
 *                       type: number
 *                       description: 学生出勤率
 *                       example: 0.92
 *                     studentTrend:
 *                       type: number
 *                       description: 学生数量趋势
 *                       example: 5.2
 *                     classTrend:
 *                       type: number
 *                       description: 班级数量趋势
 *                       example: 0
 *                     applicationTrend:
 *                       type: number
 *                       description: 申请数量趋势
 *                       example: 12.5
 *                     enrollmentTrend:
 *                       type: number
 *                       description: 招生趋势
 *                       example: 3.8
 *                 message:
 *                   type: string
 *                   example: 获取园长仪表盘统计数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 园长仪表盘统计数据
router.get('/principal/stats', function (req, res) {
    // 返回匹配前端接口的数据结构
    res.json({
        success: true,
        data: {
            totalStudents: 320,
            totalClasses: 12,
            totalTeachers: 24,
            totalActivities: 15,
            pendingApplications: 18,
            enrollmentRate: 0.85,
            teacherAttendanceRate: 0.95,
            studentAttendanceRate: 0.92,
            studentTrend: 5.2,
            classTrend: 0,
            applicationTrend: 12.5,
            enrollmentTrend: 3.8
        },
        message: '获取园长仪表盘统计数据成功'
    });
});
/**
 * @swagger
 * /api/dashboard/principal/customer-pool/stats:
 *   get:
 *     summary: 获取客户池统计数据
 *     description: 获取客户池相关的统计信息（转发路由）
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取客户池统计数据
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
 *                   description: 客户池统计数据
 *                 message:
 *                   type: string
 *                   example: 获取客户池统计数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 客户池相关路由已移动到专用路由文件中
// 为了保持向后兼容性，添加路由转发
router.get('/principal/customer-pool/stats', function (req, res, next) {
    // 修改请求路径，转发到客户池路由
    req.url = '/stats';
    (0, customer_pool_routes_1["default"])(req, res, next);
});
/**
 * @swagger
 * /api/dashboard/principal/customer-pool/list:
 *   get:
 *     summary: 获取客户池列表
 *     description: 获取客户池的客户列表（转发路由）
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取客户池列表
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
 *                     customers:
 *                       type: array
 *                       description: 客户列表
 *                     pagination:
 *                       type: object
 *                       description: 分页信息
 *                 message:
 *                   type: string
 *                   example: 获取客户池列表成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/principal/customer-pool/list', function (req, res, next) {
    // 修改请求路径，转发到客户池路由
    req.url = '/list';
    (0, customer_pool_routes_1["default"])(req, res, next);
});
/**
 * @swagger
 * /api/dashboard/notices/stats:
 *   get:
 *     summary: 获取通知统计
 *     description: 获取通知的统计数据，包括总数、未读数、重要通知数和紧急通知数
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取通知统计
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
 *                     total:
 *                       type: number
 *                       description: 总通知数
 *                       example: 15
 *                     unread:
 *                       type: number
 *                       description: 未读通知数
 *                       example: 5
 *                     important:
 *                       type: number
 *                       description: 重要通知数
 *                       example: 3
 *                     urgent:
 *                       type: number
 *                       description: 紧急通知数
 *                       example: 1
 *                 message:
 *                   type: string
 *                   example: 获取通知统计成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 园长通知统计
router.get('/notices/stats', function (req, res) {
    // 返回模拟统计数据
    res.json({
        success: true,
        data: {
            total: 15,
            unread: 5,
            important: 3,
            urgent: 1
        },
        message: '获取通知统计成功'
    });
});
/**
 * @swagger
 * /api/dashboard/notices/important:
 *   get:
 *     summary: 获取重要通知
 *     description: 获取重要通知列表
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取重要通知
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                             example: 1
 *                           title:
 *                             type: string
 *                             example: "2025年秋季招生计划已发布"
 *                           publishTime:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-03-15T08:00:00Z"
 *                           importance:
 *                             type: string
 *                             enum: [HIGH, MEDIUM, LOW]
 *                             example: HIGH
 *                           readCount:
 *                             type: number
 *                             example: 20
 *                           totalCount:
 *                             type: number
 *                             example: 24
 *                     total:
 *                       type: number
 *                       example: 3
 *                 message:
 *                   type: string
 *                   example: 获取重要通知成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 园长通知
router.get('/notices/important', function (req, res) {
    // 返回模拟数据
    res.json({
        success: true,
        data: {
            items: [
                {
                    id: 1,
                    title: '2025年秋季招生计划已发布',
                    publishTime: '2025-03-15T08:00:00Z',
                    importance: 'HIGH',
                    readCount: 20,
                    totalCount: 24
                },
                {
                    id: 2,
                    title: '新版招生简章需要审核',
                    publishTime: '2025-03-14T10:30:00Z',
                    importance: 'MEDIUM',
                    readCount: 15,
                    totalCount: 24
                },
                {
                    id: 3,
                    title: '明日将举行教师培训',
                    publishTime: '2025-03-13T14:00:00Z',
                    importance: 'MEDIUM',
                    readCount: 22,
                    totalCount: 24
                }
            ],
            total: 3
        },
        message: '获取重要通知成功'
    });
});
/**
 * @swagger
 * /api/dashboard/notices/{id}/read:
 *   post:
 *     summary: 标记通知为已读
 *     description: 将指定的通知标记为已读状态
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 通知ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功标记已读
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: 标记已读成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 通知不存在
 *       500:
 *         description: 服务器错误
 */
// 标记通知为已读
router.post('/notices/:id/read', function (req, res) {
    var id = req.params.id;
    // 模拟标记已读操作
    res.json({
        success: true,
        data: null,
        message: '标记已读成功'
    });
});
/**
 * @swagger
 * /api/dashboard/notices/mark-all-read:
 *   post:
 *     summary: 标记所有通知为已读
 *     description: 将所有未读通知标记为已读状态
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功标记所有已读
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: 全部标记已读成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 标记所有通知为已读
router.post('/notices/mark-all-read', function (req, res) {
    // 模拟标记所有已读操作
    res.json({
        success: true,
        data: null,
        message: '全部标记已读成功'
    });
});
/**
 * @swagger
 * /api/dashboard/notices/{id}:
 *   delete:
 *     summary: 删除通知
 *     description: 删除指定的通知
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 通知ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功删除通知
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: 删除通知成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 通知不存在
 *       500:
 *         description: 服务器错误
 */
// 删除通知
router["delete"]('/notices/:id', function (req, res) {
    var id = req.params.id;
    // 模拟删除操作
    res.json({
        success: true,
        data: null,
        message: '删除通知成功'
    });
});
/**
 * @swagger
 * /api/dashboard/schedule:
 *   get:
 *     summary: 获取园长日程安排
 *     description: 获取园长的日程安排和待办事项
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取日程安排
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
 *                     todoItems:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           title:
 *                             type: string
 *                           dueDate:
 *                             type: string
 *                             format: date-time
 *                           priority:
 *                             type: string
 *                             enum: [HIGH, MEDIUM, LOW]
 *                     schedules:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: number
 *                           title:
 *                             type: string
 *                           startTime:
 *                             type: string
 *                             format: date-time
 *                           endTime:
 *                             type: string
 *                             format: date-time
 *                           location:
 *                             type: string
 *                           attendees:
 *                             type: array
 *                             items:
 *                               type: string
 *                 message:
 *                   type: string
 *                   example: 获取日程安排成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 园长日程安排
router.get('/schedule', function (req, res) {
    // 返回模拟数据
    res.json({
        success: true,
        data: {
            todoItems: [
                {
                    id: 1,
                    title: '审核新入园申请',
                    dueDate: '2025-03-18T16:00:00Z',
                    priority: 'HIGH'
                },
                {
                    id: 2,
                    title: '准备周四家长会',
                    dueDate: '2025-03-20T09:00:00Z',
                    priority: 'MEDIUM'
                },
                {
                    id: 3,
                    title: '检查新教材采购情况',
                    dueDate: '2025-03-22T13:00:00Z',
                    priority: 'LOW'
                }
            ],
            schedules: [
                {
                    id: 1,
                    title: '教师评估会议',
                    startTime: '2025-03-15T09:00:00Z',
                    endTime: '2025-03-15T11:00:00Z',
                    location: '会议室A',
                    attendees: ['王主任', '李老师', '张老师']
                },
                {
                    id: 2,
                    title: '家长开放日',
                    startTime: '2025-03-17T14:00:00Z',
                    endTime: '2025-03-17T17:00:00Z',
                    location: '幼儿园操场',
                    attendees: ['全体教师', '家长代表']
                },
                {
                    id: 3,
                    title: '教育局检查准备会',
                    startTime: '2025-03-19T10:30:00Z',
                    endTime: '2025-03-19T12:00:00Z',
                    location: '园长办公室',
                    attendees: ['园长', '副园长', '各部门负责人']
                }
            ]
        },
        message: '获取日程安排成功'
    });
});
/**
 * @swagger
 * /api/dashboard/enrollment-trend:
 *   get:
 *     summary: 获取招生趋势数据
 *     description: 根据时间周期获取招生趋势数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         description: 时间周期
 *         schema:
 *           type: string
 *           enum: [week, month, year]
 *           default: month
 *     responses:
 *       200:
 *         description: 成功获取招生趋势数据
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
 *                     periods:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["1月", "2月", "3月", "4月", "5月", "6月"]
 *                     values:
 *                       type: array
 *                       items:
 *                         type: number
 *                       example: [15, 12, 20, 18, 25, 22]
 *                 message:
 *                   type: string
 *                   example: 获取招生趋势数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 招生趋势数据
router.get('/enrollment-trend', function (req, res) {
    var _a = req.query.period, period = _a === void 0 ? 'month' : _a;
    // 根据不同时间周期返回不同的模拟数据
    var data;
    if (period === 'week') {
        data = {
            periods: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            values: [5, 7, 3, 6, 8, 4, 2]
        };
    }
    else if (period === 'month') {
        data = {
            periods: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            values: [15, 12, 20, 18, 25, 22, 30, 28, 35, 25, 20, 18]
        };
    }
    else {
        data = {
            periods: ['2020', '2021', '2022', '2023', '2024', '2025'],
            values: [180, 220, 250, 280, 320, 300]
        };
    }
    res.json({
        success: true,
        data: data,
        message: '获取招生趋势数据成功'
    });
});
/**
 * @swagger
 * /api/dashboard/classes:
 *   get:
 *     summary: 获取班级概览
 *     description: 获取班级的概览信息和统计数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取班级概览
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: number
 *                       name:
 *                         type: string
 *                       type:
 *                         type: string
 *                       capacity:
 *                         type: number
 *                       currentStudents:
 *                         type: number
 *                       teacher:
 *                         type: string
 *                       room:
 *                         type: string
 *                 message:
 *                   type: string
 *                   example: 获取班级概览成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取班级概览
router.get('/classes', function (req, res) { return dashboardController.getClassesOverview(req, res); });
/**
 * @swagger
 * /api/dashboard/todos:
 *   post:
 *     summary: 创建待办事项
 *     description: 创建新的待办事项
 *     tags: [Dashboard]
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
 *                 description: 待办事项标题
 *                 example: "完成月度报告"
 *               description:
 *                 type: string
 *                 description: 待办事项描述
 *                 example: "编写和提交月度工作报告"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 description: 优先级
 *                 example: high
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *                 description: 截止日期
 *                 example: "2025-07-20T18:00:00Z"
 *     responses:
 *       201:
 *         description: 成功创建待办事项
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
 *                     id:
 *                       type: number
 *                     title:
 *                       type: string
 *                     description:
 *                       type: string
 *                     priority:
 *                       type: string
 *                     status:
 *                       type: string
 *                     dueDate:
 *                       type: string
 *                       format: date-time
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: 创建待办事项成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 创建待办事项
router.post('/todos', function (req, res) { return dashboardController.createTodo(req, res); });
/**
 * @swagger
 * /api/dashboard/todos/{id}/status:
 *   patch:
 *     summary: 更新待办事项状态
 *     description: 更新指定待办事项的状态
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 待办事项ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, completed]
 *                 description: 新的状态
 *                 example: completed
 *     responses:
 *       200:
 *         description: 成功更新状态
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
 *                     id:
 *                       type: number
 *                     status:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                 message:
 *                   type: string
 *                   example: 更新待办事项状态成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
 *       500:
 *         description: 服务器错误
 */
// 更新待办事项状态
router.patch('/todos/:id/status', function (req, res) { return dashboardController.updateTodoStatus(req, res); });
/**
 * @swagger
 * /api/dashboard/todos/{id}:
 *   delete:
 *     summary: 删除待办事项
 *     description: 删除指定的待办事项
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 待办事项ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 成功删除待办事项
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: null
 *                 message:
 *                   type: string
 *                   example: 删除待办事项成功
 *       401:
 *         description: 未授权
 *       404:
 *         description: 待办事项不存在
 *       500:
 *         description: 服务器错误
 */
// 删除待办事项
router["delete"]('/todos/:id', function (req, res) { return dashboardController.deleteTodo(req, res); });
/**
 * @swagger
 * /api/dashboard/enrollment-trends:
 *   get:
 *     summary: 获取招生趋势数据
 *     description: 获取详细的招生趋势分析数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取招生趋势数据
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
 *                   description: 招生趋势数据
 *                 message:
 *                   type: string
 *                   example: 获取招生趋势数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取招生趋势数据
router.get('/enrollment-trends', function (req, res) { return dashboardController.getEnrollmentTrends(req, res); });
/**
 * @swagger
 * /api/dashboard/channel-analysis:
 *   get:
 *     summary: 获取招生渠道分析
 *     description: 获取招生渠道的分析数据和效果统计
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取渠道分析数据
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
 *                   description: 渠道分析数据
 *                 message:
 *                   type: string
 *                   example: 获取招生渠道分析成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取招生渠道分析
router.get('/channel-analysis', function (req, res) { return dashboardController.getChannelAnalysis(req, res); });
/**
 * @swagger
 * /api/dashboard/conversion-funnel:
 *   get:
 *     summary: 获取咨询转化漏斗
 *     description: 获取咨询到报名的转化漏斗数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取转化漏斗数据
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
 *                   description: 转化漏斗数据
 *                 message:
 *                   type: string
 *                   example: 获取咨询转化漏斗成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取咨询转化漏斗
router.get('/conversion-funnel', function (req, res) { return dashboardController.getConversionFunnel(req, res); });
// 测试路由已删除 - API优化
/**
 * @swagger
 * /api/dashboard/activities:
 *   get:
 *     summary: 获取活动数据
 *     description: 获取活动参与度图表所需的数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取活动数据
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
 *                   description: 活动数据
 *                 message:
 *                   type: string
 *                   example: 获取活动数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 获取活动数据（用于活动参与度图表）
router.get('/activities', function (req, res) { return dashboardController.getActivityData(req, res); });
// 备用路由已删除 - API优化，使用 /activities 替代
/**
 * @swagger
 * /api/dashboard/class-create:
 *   get:
 *     summary: 获取班级创建相关数据
 *     description: 获取创建班级所需的数据，包括可用教师、班级类型、教室等
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取班级创建数据
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
 *                     availableTeachers:
 *                       type: array
 *                       description: 可用教师列表
 *                     classTypes:
 *                       type: array
 *                       description: 班级类型列表
 *                     availableRooms:
 *                       type: array
 *                       description: 可用教室列表
 *                     classTemplates:
 *                       type: array
 *                       description: 班级模板列表
 *                 message:
 *                   type: string
 *                   example: 获取班级创建仪表板数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 新增的仪表板API端点 - 直接实现
router.get('/class-create', function (req, res) {
    res.json({
        success: true,
        message: '获取班级创建仪表板数据成功',
        data: {
            availableTeachers: [
                { id: 1, name: '张老师', subject: '语言', available: true },
                { id: 2, name: '李老师', subject: '数学', available: true },
                { id: 3, name: '王老师', subject: '艺术', available: false }
            ],
            classTypes: [
                { id: 1, name: '小班', capacity: 20, ageRange: '3-4岁' },
                { id: 2, name: '中班', capacity: 25, ageRange: '4-5岁' },
                { id: 3, name: '大班', capacity: 30, ageRange: '5-6岁' }
            ],
            availableRooms: [
                { id: 1, name: '教室A101', capacity: 30, available: true },
                { id: 2, name: '教室A102', capacity: 25, available: true },
                { id: 3, name: '教室B201', capacity: 20, available: false }
            ],
            classTemplates: [
                { id: 1, name: '标准小班配置', description: '适合3-4岁儿童' },
                { id: 2, name: '标准中班配置', description: '适合4-5岁儿童' }
            ]
        }
    });
});
/**
 * @swagger
 * /api/dashboard/class-detail/{id}:
 *   get:
 *     summary: 获取班级详情数据
 *     description: 根据班级ID获取班级详细信息和统计数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         description: 班级ID（可选，默认为1）
 *     responses:
 *       200:
 *         description: 成功获取班级详情数据
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
 *                     classInfo:
 *                       type: object
 *                       description: 班级基本信息
 *                     attendanceStats:
 *                       type: object
 *                       description: 出勤统计
 *                     activities:
 *                       type: array
 *                       description: 活动列表
 *                 message:
 *                   type: string
 *                   example: 获取班级详情仪表板数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/class-detail/:id?', function (req, res) {
    var classId = req.params.id || 1;
    res.json({
        success: true,
        message: '获取班级详情仪表板数据成功',
        data: {
            classInfo: {
                id: parseInt(classId),
                name: "\u6D4B\u8BD5\u73ED\u7EA7".concat(classId),
                type: '中班',
                capacity: 25,
                currentStudents: 18,
                teacher: { id: 1, name: '张老师', phone: '13800000001' },
                room: { id: 1, name: '教室A101', floor: 1 }
            },
            studentList: Array.from({ length: 18 }, function (_, i) { return ({
                id: i + 1,
                name: "\u5B66\u751F".concat(i + 1),
                age: 4,
                enrollDate: '2024-09-01',
                parent: { name: "\u5BB6\u957F".concat(i + 1), phone: "1380000".concat(String(i + 1).padStart(4, '0')) }
            }); }),
            attendance: {
                today: 16,
                thisWeek: 85,
                thisMonth: 92
            },
            activities: [
                { id: 1, name: '户外游戏', date: '2024-12-01', participants: 18 },
                { id: 2, name: '艺术创作', date: '2024-12-02', participants: 15 }
            ]
        }
    });
});
/**
 * @swagger
 * /api/dashboard/class-list:
 *   get:
 *     summary: 获取班级列表数据
 *     description: 获取所有班级的列表和统计信息
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取班级列表数据
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
 *                       description: 班级列表
 *                     summary:
 *                       type: object
 *                       description: 班级统计摘要
 *                 message:
 *                   type: string
 *                   example: 获取班级列表仪表板数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/class-list', function (req, res) {
    res.json({
        success: true,
        message: '获取班级列表仪表板数据成功',
        data: {
            summary: {
                totalClasses: 8,
                totalStudents: 186,
                totalTeachers: 12,
                averageCapacity: 23.25
            },
            classes: [
                {
                    id: 1,
                    name: '小一班',
                    type: '小班',
                    capacity: 20,
                    currentStudents: 18,
                    teacher: '张老师',
                    room: '教室A101',
                    status: 'active'
                },
                {
                    id: 2,
                    name: '小二班',
                    type: '小班',
                    capacity: 20,
                    currentStudents: 19,
                    teacher: '李老师',
                    room: '教室A102',
                    status: 'active'
                },
                {
                    id: 3,
                    name: '中一班',
                    type: '中班',
                    capacity: 25,
                    currentStudents: 22,
                    teacher: '王老师',
                    room: '教室B201',
                    status: 'active'
                },
                {
                    id: 4,
                    name: '中二班',
                    type: '中班',
                    capacity: 25,
                    currentStudents: 24,
                    teacher: '赵老师',
                    room: '教室B202',
                    status: 'active'
                },
                {
                    id: 5,
                    name: '大一班',
                    type: '大班',
                    capacity: 30,
                    currentStudents: 28,
                    teacher: '陈老师',
                    room: '教室C301',
                    status: 'active'
                }
            ],
            statistics: {
                byType: {
                    '小班': { count: 2, totalStudents: 37 },
                    '中班': { count: 2, totalStudents: 46 },
                    '大班': { count: 1, totalStudents: 28 }
                },
                occupancyRate: 0.86,
                vacantSpots: 27
            }
        }
    });
});
/**
 * @swagger
 * /api/dashboard/custom-layout:
 *   get:
 *     summary: 获取自定义布局仪表板数据
 *     description: 获取用户自定义布局的仪表板数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取自定义布局数据
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
 *                   description: 自定义布局数据
 *                 message:
 *                   type: string
 *                   example: 获取自定义布局数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/custom-layout', function (req, res) { return dashboardController.getCustomLayoutDashboard(req, res); });
/**
 * @swagger
 * /api/dashboard/data-statistics:
 *   get:
 *     summary: 获取数据统计
 *     description: 获取系统数据统计信息
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取数据统计
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
 *                   description: 数据统计信息
 *                 message:
 *                   type: string
 *                   example: 获取数据统计成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/data-statistics', function (req, res) { return dashboardController.getDataStatistics(req, res); });
/**
 * @swagger
 * /api/dashboard/charts:
 *   get:
 *     summary: 获取图表数据
 *     description: 获取仪表板各种图表所需的数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取图表数据
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
 *                     enrollmentTrend:
 *                       type: array
 *                       description: 招生趋势数据
 *                     activityStats:
 *                       type: array
 *                       description: 活动统计数据
 *                     classDistribution:
 *                       type: array
 *                       description: 班级分布数据
 *                     performanceMetrics:
 *                       type: array
 *                       description: 绩效指标数据
 *                 message:
 *                   type: string
 *                   example: 获取图表数据成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 图表数据API - 修复404错误
router.get('/charts', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, type, _c, timeRange, chartData;
    return __generator(this, function (_d) {
        try {
            _a = req.query, _b = _a.type, type = _b === void 0 ? 'all' : _b, _c = _a.timeRange, timeRange = _c === void 0 ? 'month' : _c;
            console.log("[API\u8C03\u8BD5] \u83B7\u53D6\u56FE\u8868\u6570\u636E: type=".concat(type, ", timeRange=").concat(timeRange));
            chartData = {};
            if (type === 'all' || type === 'student') {
                // 学生数量趋势
                chartData.studentTrends = {
                    labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                    data: [120, 135, 140, 155, 165, 180],
                    label: '学生数量'
                };
            }
            if (type === 'all' || type === 'activity') {
                // 活动参与度
                chartData.activityParticipation = {
                    labels: ['户外活动', '艺术创作', '科学实验', '音乐舞蹈', '体育运动'],
                    data: [85, 92, 78, 88, 95],
                    label: '参与度(%)'
                };
            }
            if (type === 'all' || type === 'enrollment') {
                // 招生趋势
                chartData.enrollmentTrends = {
                    labels: ['小班', '中班', '大班'],
                    data: [45, 52, 38],
                    label: '招生人数'
                };
            }
            if (type === 'all' || type === 'attendance') {
                // 出勤率统计
                chartData.attendanceStats = {
                    labels: ['周一', '周二', '周三', '周四', '周五'],
                    data: [95, 92, 88, 91, 89],
                    label: '出勤率(%)'
                };
            }
            res.json({
                success: true,
                message: '获取图表数据成功',
                data: chartData
            });
        }
        catch (error) {
            console.error('[API错误] 获取图表数据失败:', error);
            res.status(500).json({
                success: false,
                message: '获取图表数据失败',
                error: error instanceof Error ? error.message : '未知错误'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/dashboard/kindergarten:
 *   get:
 *     summary: 获取幼儿园概览数据
 *     description: 获取幼儿园的整体概览信息，包括设施、项目等
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取幼儿园概览数据
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
 *                     basic:
 *                       type: object
 *                       description: 基本信息
 *                     facilities:
 *                       type: object
 *                       description: 设施信息
 *                     academics:
 *                       type: object
 *                       description: 教学项目信息
 *                 message:
 *                   type: string
 *                   example: 获取幼儿园概览成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 校园概览API (兼容性) - 添加 /kindergarten 端点
router.get('/kindergarten', function (req, res) {
    res.json({
        success: true,
        message: '获取校园概览成功',
        data: {
            campusInfo: {
                name: '示例幼儿园',
                established: '2015',
                area: '5000平方米',
                location: '示例市示例区示例街道123号'
            },
            facilities: {
                classrooms: 24,
                playgrounds: 2,
                libraries: 1,
                canteens: 1,
                medicalRooms: 2,
                artRooms: 3,
                musicRooms: 2
            },
            capacity: {
                totalCapacity: 600,
                currentEnrollment: 486,
                occupancyRate: 0.81,
                availableSpots: 114
            },
            staff: {
                totalTeachers: 80,
                seniorTeachers: 35,
                adminStaff: 15,
                supportStaff: 25
            },
            academics: {
                classes: 24,
                programs: ['基础教育', '艺术培养', '体能训练', '语言发展'],
                specialFeatures: ['双语教学', '科学启蒙', '创意手工', '户外探索']
            }
        }
    });
});
/**
 * @swagger
 * /api/dashboard/campus-overview:
 *   get:
 *     summary: 获取校园概览数据
 *     description: 获取校园的详细概览信息
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取校园概览数据
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
 *                   description: 校园概览数据
 *                 message:
 *                   type: string
 *                   example: 获取校园概览成功
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
// 校园概览API - 直接实现
router.get('/campus-overview', function (req, res) {
    res.json({
        success: true,
        message: '获取校园概览成功',
        data: {
            campusInfo: {
                name: '示例幼儿园',
                established: '2015',
                area: '5000平方米',
                location: '示例市示例区示例街道123号'
            },
            facilities: {
                classrooms: 24,
                playgrounds: 2,
                libraries: 1,
                canteens: 1,
                medicalRooms: 2,
                artRooms: 3,
                musicRooms: 2
            },
            capacity: {
                totalCapacity: 600,
                currentEnrollment: 486,
                occupancyRate: 0.81,
                availableSpots: 114
            },
            staff: {
                totalTeachers: 80,
                seniorTeachers: 35,
                adminStaff: 15,
                supportStaff: 25
            },
            academics: {
                classes: 24,
                programs: ['基础教育', '艺术培养', '体能训练', '语言发展'],
                specialFeatures: ['双语教学', '科学启蒙', '创意手工', '户外探索']
            }
        }
    });
});
/**
 * @swagger
 * /api/dashboard/statistics/table:
 *   get:
 *     summary: 获取统计表格数据
 *     description: 获取分页的统计表格数据
 *     tags: [Dashboard]
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
 *         name: type
 *         schema:
 *           type: string
 *         description: 统计类型
 *     responses:
 *       200:
 *         description: 成功获取表格数据
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
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           date:
 *                             type: string
 *                           enrollmentCount:
 *                             type: number
 *                           activityCount:
 *                             type: number
 *                           participationRate:
 *                             type: number
 *                           conversionRate:
 *                             type: number
 *                           revenue:
 *                             type: number
 *                           updateTime:
 *                             type: string
 *                     total:
 *                       type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/statistics/table', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, pageSize, startDate, endDate, type, generateTableData, totalItems, currentPage, size, startIndex, allData, items;
    return __generator(this, function (_d) {
        try {
            _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, startDate = _a.startDate, endDate = _a.endDate, type = _a.type;
            generateTableData = function (count) {
                var data = [];
                var now = new Date();
                for (var i = 0; i < count; i++) {
                    var date = new Date(now);
                    date.setDate(date.getDate() - i);
                    data.push({
                        id: "stat_".concat(i + 1),
                        date: date.toISOString().split('T')[0],
                        enrollmentCount: Math.floor(Math.random() * 60) + 10,
                        activityCount: Math.floor(Math.random() * 10) + 1,
                        participationRate: (Math.random() * 40 + 50).toFixed(1),
                        conversionRate: (Math.random() * 30 + 10).toFixed(1),
                        revenue: Math.floor(Math.random() * 100000) + 20000,
                        updateTime: new Date().toLocaleString('zh-CN')
                    });
                }
                return data;
            };
            totalItems = 100;
            currentPage = parseInt(page) || 1;
            size = parseInt(pageSize) || 10;
            startIndex = (currentPage - 1) * size;
            allData = generateTableData(totalItems);
            items = allData.slice(startIndex, startIndex + size);
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    items: items,
                    total: totalItems,
                    page: currentPage,
                    pageSize: size,
                    totalPages: Math.ceil(totalItems / size)
                }, '获取表格数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取表格数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/dashboard/statistics/enrollment-trends:
 *   get:
 *     summary: 获取招生趋势数据
 *     description: 获取招生趋势图表数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: 成功获取招生趋势数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       value:
 *                         type: number
 *                       label:
 *                         type: string
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/statistics/enrollment-trends', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, startDate, endDate, generateTrendData, trendData;
    return __generator(this, function (_b) {
        try {
            _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
            generateTrendData = function () {
                var data = [];
                var now = new Date();
                for (var i = 29; i >= 0; i--) {
                    var date = new Date(now);
                    date.setDate(date.getDate() - i);
                    var dateStr = date.toISOString().split('T')[0];
                    var value = Math.floor(Math.random() * 50) + 10;
                    data.push({
                        date: dateStr,
                        value: value,
                        label: dateStr
                    });
                }
                return data;
            };
            trendData = generateTrendData();
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, trendData, '获取招生趋势数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取招生趋势数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/dashboard/statistics/activity-data:
 *   get:
 *     summary: 获取活动数据
 *     description: 获取活动统计数据
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: 成功获取活动数据
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
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: string
 *                     series:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           data:
 *                             type: array
 *                             items:
 *                               type: number
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/statistics/activity-data', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, startDate, endDate, generateActivityData, activityData;
    return __generator(this, function (_b) {
        try {
            _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
            generateActivityData = function () {
                var categories = ['体育活动', '艺术活动', '科学实验', '社会实践', '音乐舞蹈', '手工制作'];
                var series = [
                    {
                        name: '参与人数',
                        data: categories.map(function () { return Math.floor(Math.random() * 100) + 20; })
                    },
                    {
                        name: '活动次数',
                        data: categories.map(function () { return Math.floor(Math.random() * 20) + 5; })
                    }
                ];
                return {
                    categories: categories,
                    series: series
                };
            };
            activityData = generateActivityData();
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activityData, '获取活动数据成功')];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取活动数据失败')];
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/dashboard/cache/stats:
 *   get:
 *     summary: 获取Dashboard缓存统计
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/cache/stats', auth_middleware_1.verifyToken, dashboardController.getDashboardCacheStats);
/**
 * @swagger
 * /api/dashboard/cache/clear:
 *   post:
 *     summary: 清除Dashboard缓存
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clearAll
 *         schema:
 *           type: boolean
 *         description: 是否清除所有缓存
 *     responses:
 *       200:
 *         description: 清除成功
 */
router.post('/cache/clear', auth_middleware_1.verifyToken, dashboardController.clearDashboardCache);
exports["default"] = router;
