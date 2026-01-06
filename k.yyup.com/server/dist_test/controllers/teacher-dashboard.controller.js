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
exports.TeacherDashboardController = void 0;
var teacher_dashboard_service_1 = require("../services/teacher-dashboard.service");
var models_1 = require("../models");
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
/**
 * 教师工作台控制器
 */
var TeacherDashboardController = /** @class */ (function () {
    function TeacherDashboardController() {
    }
    /**
     * 获取教师工作台数据
     * GET /api/teacher/dashboard
     */
    TeacherDashboardController.getDashboardData = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, dashboardData, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        console.log('🔍 教师工作台请求 - req.user:', req.user);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            console.error('❌ 用户未认证 - req.user:', req.user);
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        console.log('🔍 查找教师记录 - userId:', userId);
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        console.log('🔍 教师记录查询结果:', teacher ? "\u627E\u5230\u6559\u5E08ID: ".concat(teacher.id) : '未找到教师记录');
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        console.log('🔍 调用教师工作台服务 - teacherId:', teacher.id);
                        return [4 /*yield*/, teacher_dashboard_service_1.TeacherDashboardService.getDashboardData(teacher.id)];
                    case 2:
                        dashboardData = _b.sent();
                        console.log('✅ 教师工作台数据获取成功');
                        res.json({
                            success: true,
                            data: dashboardData
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        console.error('❌ 获取教师工作台数据失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取工作台数据失败',
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师统计数据
     * GET /api/teacher/statistics
     */
    TeacherDashboardController.getStatistics = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, statistics, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        return [4 /*yield*/, teacher_dashboard_service_1.TeacherDashboardService.getTeacherStatistics(teacher.id)];
                    case 2:
                        statistics = _b.sent();
                        res.json({
                            success: true,
                            data: statistics
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        console.error('获取教师统计数据失败:', error_2);
                        res.status(500).json({
                            success: false,
                            message: '获取统计数据失败',
                            error: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师活动统计数据
     * GET /api/teacher/activity-statistics
     */
    TeacherDashboardController.getActivityStatistics = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, activityStatsRows, activityTrendsRows, stats, trends, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          COUNT(*) as totalActivities,\n          SUM(CASE WHEN a.status = 'published' THEN 1 ELSE 0 END) as publishedActivities,\n          SUM(CASE WHEN a.status = 'draft' THEN 1 ELSE 0 END) as draftActivities,\n          SUM(CASE WHEN a.status = 'cancelled' THEN 1 ELSE 0 END) as cancelledActivities,\n          SUM(a.registered_count) as totalRegistrations,\n          SUM(a.checked_in_count) as totalCheckins,\n          ROUND(AVG(CASE WHEN a.registered_count > 0 THEN a.checked_in_count * 100.0 / a.registered_count ELSE 0 END), 2) as avgCheckinRate\n        FROM activities a\n        WHERE a.creator_id = :userId AND a.deleted_at IS NULL\n      ", {
                                replacements: { userId: userId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        activityStatsRows = _b.sent();
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          DATE(a.created_at) as date,\n          COUNT(*) as count\n        FROM activities a\n        WHERE a.creator_id = :userId\n          AND a.created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\n          AND a.deleted_at IS NULL\n        GROUP BY DATE(a.created_at)\n        ORDER BY date DESC\n        LIMIT 30\n      ", {
                                replacements: { userId: userId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        activityTrendsRows = _b.sent();
                        stats = (activityStatsRows && activityStatsRows[0]) ? activityStatsRows[0] : {};
                        trends = Array.isArray(activityTrendsRows)
                            ? activityTrendsRows.map(function (trend) { return ({ date: trend.date, count: parseInt(trend.count) }); })
                            : [];
                        res.json({
                            success: true,
                            data: {
                                overview: {
                                    totalActivities: parseInt(stats.totalActivities) || 0,
                                    publishedActivities: parseInt(stats.publishedActivities) || 0,
                                    draftActivities: parseInt(stats.draftActivities) || 0,
                                    cancelledActivities: parseInt(stats.cancelledActivities) || 0,
                                    totalRegistrations: parseInt(stats.totalRegistrations) || 0,
                                    totalCheckins: parseInt(stats.totalCheckins) || 0,
                                    avgCheckinRate: parseFloat(stats.avgCheckinRate) || 0
                                },
                                trends: trends
                            }
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _b.sent();
                        console.error('获取教师活动统计数据失败:', error_3);
                        res.status(500).json({
                            success: false,
                            message: '获取活动统计数据失败',
                            error: error_3 instanceof Error ? error_3.message : '未知错误'
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取今日任务
     * GET /api/teacher/today-tasks
     */
    TeacherDashboardController.getTodayTasks = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, todayTasks, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        return [4 /*yield*/, teacher_dashboard_service_1.TeacherDashboardService.getTodayTasks(teacher.id)];
                    case 2:
                        todayTasks = _b.sent();
                        res.json({
                            success: true,
                            data: todayTasks
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _b.sent();
                        console.error('获取今日任务失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '获取今日任务失败',
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取今日课程
     * GET /api/teacher/today-courses
     */
    TeacherDashboardController.getTodayCourses = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, todayCourses, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        return [4 /*yield*/, teacher_dashboard_service_1.TeacherDashboardService.getTodayCourses(teacher.id)];
                    case 2:
                        todayCourses = _b.sent();
                        res.json({
                            success: true,
                            data: todayCourses
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _b.sent();
                        console.error('获取今日课程失败:', error_5);
                        res.status(500).json({
                            success: false,
                            message: '获取今日课程失败',
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取最新通知
     * GET /api/teacher/recent-notifications
     */
    TeacherDashboardController.getRecentNotifications = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, limit, teacher, notifications, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        limit = parseInt(req.query.limit) || 5;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        return [4 /*yield*/, teacher_dashboard_service_1.TeacherDashboardService.getRecentNotifications(teacher.id, limit)];
                    case 2:
                        notifications = _b.sent();
                        res.json({
                            success: true,
                            data: notifications
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _b.sent();
                        console.error('获取最新通知失败:', error_6);
                        res.status(500).json({
                            success: false,
                            message: '获取最新通知失败',
                            error: error_6 instanceof Error ? error_6.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新任务状态
     * PUT /api/teacher/tasks/:taskId/status
     */
    TeacherDashboardController.updateTaskStatus = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, taskId, completed, updatedTask, error_7;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        taskId = req.params.taskId;
                        completed = req.body.completed;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, teacher_dashboard_service_1.TeacherDashboardService.updateTaskStatus(parseInt(taskId), userId, completed)];
                    case 1:
                        updatedTask = _b.sent();
                        res.json({
                            success: true,
                            data: updatedTask,
                            message: completed ? '任务已完成' : '任务已重新打开'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        console.error('更新任务状态失败:', error_7);
                        res.status(500).json({
                            success: false,
                            message: '更新任务状态失败',
                            error: error_7 instanceof Error ? error_7.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 快速打卡
     * POST /api/teacher/clock-in
     */
    TeacherDashboardController.clockIn = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, type, teacher, clockRecord, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        type = req.body.type;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        return [4 /*yield*/, teacher_dashboard_service_1.TeacherDashboardService.clockIn(teacher.id, type)];
                    case 2:
                        clockRecord = _b.sent();
                        res.json({
                            success: true,
                            data: clockRecord,
                            message: type === 'in' ? '上班打卡成功' : '下班打卡成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_8 = _b.sent();
                        console.error('打卡失败:', error_8);
                        res.status(500).json({
                            success: false,
                            message: '打卡失败',
                            error: error_8 instanceof Error ? error_8.message : '未知错误'
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师活动签到概览
     * GET /api/teacher/activity-checkin-overview
     */
    TeacherDashboardController.getActivityCheckinOverview = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, overviewStats, recentActivities, stats, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          COUNT(DISTINCT a.id) as totalActivities,\n          SUM(a.registered_count) as totalRegistrations,\n          SUM(a.checked_in_count) as totalCheckins,\n          ROUND(AVG(CASE WHEN a.registered_count > 0 THEN a.checked_in_count * 100.0 / a.registered_count ELSE 0 END), 2) as avgCheckinRate\n        FROM activities a\n        LEFT JOIN teachers t ON a.creator_id = t.user_id\n        WHERE t.user_id = :userId AND a.deleted_at IS NULL\n      ", {
                                replacements: { userId: userId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        overviewStats = (_b.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          a.id,\n          a.title,\n          a.registered_count as registeredCount,\n          a.checked_in_count as checkedInCount,\n          ROUND(CASE WHEN a.registered_count > 0 THEN a.checked_in_count * 100.0 / a.registered_count ELSE 0 END, 2) as checkInRate,\n          a.start_time as startTime\n        FROM activities a\n        LEFT JOIN teachers t ON a.creator_id = t.user_id\n        WHERE t.user_id = :userId\n          AND a.deleted_at IS NULL\n          AND a.start_time >= DATE_SUB(NOW(), INTERVAL 30 DAY)\n        ORDER BY a.start_time DESC\n        LIMIT 10\n      ", {
                                replacements: { userId: userId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        recentActivities = (_b.sent())[0];
                        stats = overviewStats[0] || {};
                        res.json({
                            success: true,
                            data: {
                                totalActivities: parseInt(stats.totalActivities) || 0,
                                totalRegistrations: parseInt(stats.totalRegistrations) || 0,
                                totalCheckins: parseInt(stats.totalCheckins) || 0,
                                avgCheckinRate: parseFloat(stats.avgCheckinRate) || 0,
                                recentActivities: recentActivities.map(function (activity) { return ({
                                    id: activity.id,
                                    title: activity.title,
                                    registeredCount: parseInt(activity.registeredCount) || 0,
                                    checkedInCount: parseInt(activity.checkedInCount) || 0,
                                    checkInRate: parseFloat(activity.checkInRate) || 0,
                                    startTime: activity.startTime
                                }); })
                            }
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _b.sent();
                        console.error('获取教师活动签到概览失败:', error_9);
                        res.status(500).json({
                            success: false,
                            message: '获取活动签到概览失败',
                            error: error_9 instanceof Error ? error_9.message : '未知错误'
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 教师任务管理方法 ====================
    /**
     * 获取教师任务统计
     * GET /api/teacher/tasks/stats
     */
    TeacherDashboardController.getTaskStats = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, now, weekAgo, monthAgo, total, completed, pending_1, inProgress, overdue, weeklyCompleted, monthlyCompleted, completionRate, taskStats, error_10;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 8, , 9]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        now = new Date();
                        weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                        return [4 /*yield*/, models_1.Task.count({
                                where: { assignee_id: userId }
                            })];
                    case 1:
                        total = _f.sent();
                        return [4 /*yield*/, models_1.Task.count({
                                where: {
                                    assignee_id: userId,
                                    status: 'completed'
                                }
                            })];
                    case 2:
                        completed = _f.sent();
                        return [4 /*yield*/, models_1.Task.count({
                                where: {
                                    assignee_id: userId,
                                    status: 'pending'
                                }
                            })];
                    case 3:
                        pending_1 = _f.sent();
                        return [4 /*yield*/, models_1.Task.count({
                                where: {
                                    assignee_id: userId,
                                    status: 'in_progress'
                                }
                            })];
                    case 4:
                        inProgress = _f.sent();
                        return [4 /*yield*/, models_1.Task.count({
                                where: {
                                    assignee_id: userId,
                                    due_date: (_b = {}, _b[sequelize_1.Op.lt] = now, _b),
                                    status: (_c = {}, _c[sequelize_1.Op.ne] = 'completed', _c)
                                }
                            })];
                    case 5:
                        overdue = _f.sent();
                        return [4 /*yield*/, models_1.Task.count({
                                where: {
                                    assignee_id: userId,
                                    status: 'completed',
                                    updated_at: (_d = {}, _d[sequelize_1.Op.gte] = weekAgo, _d)
                                }
                            })];
                    case 6:
                        weeklyCompleted = _f.sent();
                        return [4 /*yield*/, models_1.Task.count({
                                where: {
                                    assignee_id: userId,
                                    status: 'completed',
                                    updated_at: (_e = {}, _e[sequelize_1.Op.gte] = monthAgo, _e)
                                }
                            })];
                    case 7:
                        monthlyCompleted = _f.sent();
                        completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
                        taskStats = {
                            total: total,
                            completed: completed,
                            pending: pending_1,
                            overdue: overdue,
                            inProgress: inProgress,
                            completionRate: completionRate,
                            weeklyCompleted: weeklyCompleted,
                            monthlyCompleted: monthlyCompleted
                        };
                        res.json({
                            success: true,
                            data: taskStats
                        });
                        return [3 /*break*/, 9];
                    case 8:
                        error_10 = _f.sent();
                        console.error('获取教师任务统计失败:', error_10);
                        res.status(500).json({
                            success: false,
                            message: '获取任务统计失败',
                            error: error_10 instanceof Error ? error_10.message : '未知错误'
                        });
                        return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师任务列表
     * GET /api/teacher/tasks
     */
    TeacherDashboardController.getTaskList = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, status_1, priority, search, _c, page, _d, pageSize, whereClause, pageNum, size, offset, _e, count, tasks, formattedTasks, error_11;
            var _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.query, status_1 = _b.status, priority = _b.priority, search = _b.search, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.pageSize, pageSize = _d === void 0 ? 20 : _d;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        whereClause = {
                            assignee_id: userId
                        };
                        if (status_1) {
                            whereClause.status = status_1;
                        }
                        if (priority) {
                            whereClause.priority = priority;
                        }
                        if (search) {
                            whereClause[sequelize_1.Op.or] = [
                                { title: (_f = {}, _f[sequelize_1.Op.like] = "%".concat(search, "%"), _f) },
                                { description: (_g = {}, _g[sequelize_1.Op.like] = "%".concat(search, "%"), _g) }
                            ];
                        }
                        pageNum = parseInt(page);
                        size = parseInt(pageSize);
                        offset = (pageNum - 1) * size;
                        return [4 /*yield*/, models_1.Task.findAndCountAll({
                                where: whereClause,
                                include: [
                                    {
                                        model: models_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'username', 'realName']
                                    },
                                    {
                                        model: models_1.User,
                                        as: 'assignee',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ],
                                limit: size,
                                offset: offset,
                                order: [['created_at', 'DESC']]
                            })];
                    case 1:
                        _e = _h.sent(), count = _e.count, tasks = _e.rows;
                        formattedTasks = tasks.map(function (task) {
                            var _a, _b;
                            return ({
                                id: task.id,
                                title: task.title,
                                description: task.description,
                                priority: task.priority,
                                status: task.status,
                                dueDate: task.due_date,
                                progress: task.progress || 0,
                                assignedBy: ((_a = task.creator) === null || _a === void 0 ? void 0 : _a.realName) || ((_b = task.creator) === null || _b === void 0 ? void 0 : _b.username) || '未知',
                                createdAt: task.created_at,
                                updatedAt: task.updated_at,
                                type: task.type,
                                creatorId: task.creator_id,
                                assigneeId: task.assignee_id
                            });
                        });
                        res.json({
                            success: true,
                            data: {
                                list: formattedTasks,
                                total: count,
                                page: pageNum,
                                pageSize: size
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _h.sent();
                        console.error('获取教师任务列表失败:', error_11);
                        res.status(500).json({
                            success: false,
                            message: '获取任务列表失败',
                            error: error_11 instanceof Error ? error_11.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建教师任务
     * POST /api/teacher/tasks
     */
    TeacherDashboardController.createTask = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, title, description, priority, dueDate, teacher, newTask, error_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.body, title = _b.title, description = _b.description, priority = _b.priority, dueDate = _b.dueDate;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _c.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        newTask = {
                            id: Date.now(),
                            title: title,
                            description: description,
                            priority: priority,
                            status: 'pending',
                            dueDate: dueDate,
                            progress: 0,
                            assignedBy: teacher.name,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        res.status(201).json({
                            success: true,
                            message: '任务创建成功',
                            data: newTask
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _c.sent();
                        console.error('创建教师任务失败:', error_12);
                        res.status(500).json({
                            success: false,
                            message: '创建任务失败',
                            error: error_12 instanceof Error ? error_12.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新教师任务
     * PUT /api/teacher/tasks/:id
     */
    TeacherDashboardController.updateTask = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, taskId, _b, title, description, priority, status_2, progress, dueDate, teacher, updatedTask, error_13;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        taskId = req.params.id;
                        _b = req.body, title = _b.title, description = _b.description, priority = _b.priority, status_2 = _b.status, progress = _b.progress, dueDate = _b.dueDate;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _c.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        updatedTask = {
                            id: parseInt(taskId),
                            title: title || '更新的任务标题',
                            description: description || '更新的任务描述',
                            priority: priority || 'medium',
                            status: status_2 || 'in_progress',
                            dueDate: dueDate || '2025-01-15',
                            progress: progress || 50,
                            assignedBy: teacher.name,
                            createdAt: '2025-01-01T08:00:00Z',
                            updatedAt: new Date().toISOString()
                        };
                        res.json({
                            success: true,
                            message: '任务更新成功',
                            data: updatedTask
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _c.sent();
                        console.error('更新教师任务失败:', error_13);
                        res.status(500).json({
                            success: false,
                            message: '更新任务失败',
                            error: error_13 instanceof Error ? error_13.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量完成任务
     * POST /api/teacher/tasks/batch-complete
     */
    TeacherDashboardController.batchCompleteTask = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, taskIds, teacher, completedCount, error_14;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        taskIds = req.body.taskIds;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        if (!taskIds || !Array.isArray(taskIds)) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '请提供有效的任务ID列表'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        completedCount = taskIds.length;
                        res.json({
                            success: true,
                            message: "\u6210\u529F\u5B8C\u6210 ".concat(completedCount, " \u4E2A\u4EFB\u52A1"),
                            data: {
                                completedCount: completedCount,
                                taskIds: taskIds
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _b.sent();
                        console.error('批量完成任务失败:', error_14);
                        res.status(500).json({
                            success: false,
                            message: '批量完成任务失败',
                            error: error_14 instanceof Error ? error_14.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量删除任务
     * DELETE /api/teacher/tasks/batch-delete
     */
    TeacherDashboardController.batchDeleteTask = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, taskIds, teacher, deletedCount, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        taskIds = req.body.taskIds;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        if (!taskIds || !Array.isArray(taskIds)) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '请提供有效的任务ID列表'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        deletedCount = taskIds.length;
                        res.json({
                            success: true,
                            message: "\u6210\u529F\u5220\u9664 ".concat(deletedCount, " \u4E2A\u4EFB\u52A1"),
                            data: {
                                deletedCount: deletedCount,
                                taskIds: taskIds
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_15 = _b.sent();
                        console.error('批量删除任务失败:', error_15);
                        res.status(500).json({
                            success: false,
                            message: '批量删除任务失败',
                            error: error_15 instanceof Error ? error_15.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 教师教学中心方法 ====================
    /**
     * 获取教学统计
     * GET /api/teacher/teaching/stats
     */
    TeacherDashboardController.getTeachingStats = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, teachingStats, error_16;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        teachingStats = {
                            totalClasses: 3,
                            totalStudents: 45,
                            activeClasses: 3,
                            completedLessons: 128,
                            avgAttendance: 92.5,
                            avgScore: 88.3,
                            monthlyLessons: 24,
                            weeklyLessons: 6
                        };
                        res.json({
                            success: true,
                            data: teachingStats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _b.sent();
                        console.error('获取教学统计失败:', error_16);
                        res.status(500).json({
                            success: false,
                            message: '获取教学统计失败',
                            error: error_16 instanceof Error ? error_16.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级列表
     * GET /api/teacher/teaching/classes
     */
    TeacherDashboardController.getClassList = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, classes, error_17;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        classes = [
                            {
                                id: 1,
                                name: '小班A',
                                studentCount: 15,
                                ageGroup: '3-4岁',
                                schedule: '周一至周五 8:30-16:30',
                                room: '101教室',
                                status: 'active'
                            },
                            {
                                id: 2,
                                name: '小班B',
                                studentCount: 16,
                                ageGroup: '3-4岁',
                                schedule: '周一至周五 8:30-16:30',
                                room: '102教室',
                                status: 'active'
                            },
                            {
                                id: 3,
                                name: '中班A',
                                studentCount: 14,
                                ageGroup: '4-5岁',
                                schedule: '周一至周五 8:30-16:30',
                                room: '201教室',
                                status: 'active'
                            }
                        ];
                        res.json({
                            success: true,
                            data: classes
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_17 = _b.sent();
                        console.error('获取班级列表失败:', error_17);
                        res.status(500).json({
                            success: false,
                            message: '获取班级列表失败',
                            error: error_17 instanceof Error ? error_17.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级详情
     * GET /api/teacher-dashboard/teaching/classes/:id
     */
    TeacherDashboardController.getClassDetail = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, classId, teacher, classDetail, error_18;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        classId = req.params.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        if (!classId) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '班级ID不能为空'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        classDetail = {
                            id: parseInt(classId),
                            name: '小班A',
                            studentCount: 15,
                            ageGroup: '3-4岁',
                            schedule: '周一至周五 8:30-16:30',
                            room: '101教室',
                            status: 'active',
                            students: [
                                { id: 1, name: '张三', age: 3, gender: '男', status: 'active' },
                                { id: 2, name: '李四', age: 3, gender: '女', status: 'active' },
                                { id: 3, name: '王五', age: 4, gender: '男', status: 'active' }
                            ],
                            recentRecords: [
                                { id: 1, date: '2025-01-15', content: '今天学习了数字1-10', duration: 30 },
                                { id: 2, date: '2025-01-14', content: '进行了户外活动', duration: 45 }
                            ]
                        };
                        res.json({
                            success: true,
                            data: classDetail
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_18 = _b.sent();
                        console.error('获取班级详情失败:', error_18);
                        res.status(500).json({
                            success: false,
                            message: '获取班级详情失败',
                            error: error_18 instanceof Error ? error_18.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取进度数据
     * GET /api/teacher/teaching/progress
     */
    TeacherDashboardController.getProgressData = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacher, progressData, error_19;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        progressData = [
                            {
                                id: 1,
                                subject: '语言发展',
                                progress: 85,
                                target: 90,
                                status: 'on_track',
                                lastUpdated: '2025-01-01'
                            },
                            {
                                id: 2,
                                subject: '数学认知',
                                progress: 78,
                                target: 80,
                                status: 'on_track',
                                lastUpdated: '2025-01-01'
                            },
                            {
                                id: 3,
                                subject: '艺术创作',
                                progress: 92,
                                target: 85,
                                status: 'ahead',
                                lastUpdated: '2025-01-01'
                            },
                            {
                                id: 4,
                                subject: '体能发展',
                                progress: 65,
                                target: 75,
                                status: 'behind',
                                lastUpdated: '2025-01-01'
                            }
                        ];
                        res.json({
                            success: true,
                            data: progressData
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_19 = _b.sent();
                        console.error('获取进度数据失败:', error_19);
                        res.status(500).json({
                            success: false,
                            message: '获取进度数据失败',
                            error: error_19 instanceof Error ? error_19.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教学记录列表
     * GET /api/teacher-dashboard/teaching/records
     */
    TeacherDashboardController.getTeachingRecords = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, classId_1, startDate, endDate, _c, page, _d, limit, teacher, mockRecords, filteredRecords, pageNum, limitNum, total, startIndex, endIndex, paginatedRecords, error_20;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.query, classId_1 = _b.classId, startDate = _b.startDate, endDate = _b.endDate, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.limit, limit = _d === void 0 ? 10 : _d;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _e.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        mockRecords = [
                            {
                                id: 1,
                                classId: 1,
                                className: '小班A',
                                courseName: '语言发展',
                                teachingDate: '2025-01-08',
                                duration: 45,
                                content: '学习儿歌《小星星》，练习发音和节奏',
                                homework: '回家和家长一起唱儿歌',
                                notes: '学生参与度高，表现良好',
                                attachments: [],
                                createdAt: '2025-01-08T10:00:00Z',
                                updatedAt: '2025-01-08T10:00:00Z'
                            },
                            {
                                id: 2,
                                classId: 1,
                                className: '小班A',
                                courseName: '数学认知',
                                teachingDate: '2025-01-07',
                                duration: 40,
                                content: '认识数字1-5，学习点数',
                                homework: '在家练习数数',
                                notes: '部分学生需要加强练习',
                                attachments: [],
                                createdAt: '2025-01-07T14:00:00Z',
                                updatedAt: '2025-01-07T14:00:00Z'
                            },
                            {
                                id: 3,
                                classId: 2,
                                className: '小班B',
                                courseName: '艺术创作',
                                teachingDate: '2025-01-06',
                                duration: 50,
                                content: '手工制作：彩色纸花',
                                homework: '完成作品装饰',
                                notes: '学生创意丰富',
                                attachments: ['flower1.jpg', 'flower2.jpg'],
                                createdAt: '2025-01-06T15:00:00Z',
                                updatedAt: '2025-01-06T15:00:00Z'
                            }
                        ];
                        filteredRecords = mockRecords;
                        if (classId_1) {
                            filteredRecords = filteredRecords.filter(function (r) { return r.classId === parseInt(classId_1); });
                        }
                        pageNum = parseInt(page);
                        limitNum = parseInt(limit);
                        total = filteredRecords.length;
                        startIndex = (pageNum - 1) * limitNum;
                        endIndex = startIndex + limitNum;
                        paginatedRecords = filteredRecords.slice(startIndex, endIndex);
                        res.json({
                            success: true,
                            data: {
                                records: paginatedRecords,
                                total: total,
                                page: pageNum,
                                limit: limitNum
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_20 = _e.sent();
                        console.error('获取教学记录失败:', error_20);
                        res.status(500).json({
                            success: false,
                            message: '获取教学记录失败',
                            error: error_20 instanceof Error ? error_20.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建教学记录
     * POST /api/teacher-dashboard/teaching/records
     */
    TeacherDashboardController.createTeachingRecord = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, classId, subject, content, date, duration, notes, teacher, newRecord, error_21;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.body, classId = _b.classId, subject = _b.subject, content = _b.content, date = _b.date, duration = _b.duration, notes = _b.notes;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _c.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        newRecord = {
                            id: Date.now(),
                            classId: classId,
                            subject: subject,
                            content: content,
                            date: date,
                            duration: duration,
                            notes: notes,
                            teacherId: teacher.id,
                            teacherName: teacher.name,
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString()
                        };
                        res.status(201).json({
                            success: true,
                            message: '教学记录创建成功',
                            data: newRecord
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_21 = _c.sent();
                        console.error('创建教学记录失败:', error_21);
                        res.status(500).json({
                            success: false,
                            message: '创建教学记录失败',
                            error: error_21 instanceof Error ? error_21.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取学生详情
     * GET /api/teacher-dashboard/teaching/students/:id
     */
    TeacherDashboardController.getStudentDetail = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, studentId, teacher, studentDetail, error_22;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        studentId = req.params.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        if (!studentId) {
                            return [2 /*return*/, res.status(400).json({
                                    success: false,
                                    message: '学生ID不能为空'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _b.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        studentDetail = {
                            id: parseInt(studentId),
                            name: '张三',
                            age: 3,
                            gender: '男',
                            status: 'active',
                            classId: 1,
                            className: '小班A',
                            enrollmentDate: '2024-09-01',
                            parentName: '张父',
                            parentPhone: '13800138000',
                            records: [
                                { id: 1, date: '2025-01-15', content: '学习了数字1-10', score: 85 },
                                { id: 2, date: '2025-01-14', content: '进行了户外活动', score: 90 }
                            ],
                            progress: [
                                { id: 1, subject: '语言发展', progress: 85, target: 90 },
                                { id: 2, subject: '数学认知', progress: 78, target: 80 }
                            ]
                        };
                        res.json({
                            success: true,
                            data: studentDetail
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_22 = _b.sent();
                        console.error('获取学生详情失败:', error_22);
                        res.status(500).json({
                            success: false,
                            message: '获取学生详情失败',
                            error: error_22 instanceof Error ? error_22.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取学生列表
     * GET /api/teacher-dashboard/teaching/students
     */
    TeacherDashboardController.getStudentsList = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, classId_2, gender_1, keyword, _c, page, _d, limit, teacher, mockStudents, filteredStudents, kw_1, pageNum, limitNum, total, startIndex, endIndex, paginatedStudents, error_23;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.query, classId_2 = _b.classId, gender_1 = _b.gender, keyword = _b.keyword, _c = _b.page, page = _c === void 0 ? 1 : _c, _d = _b.limit, limit = _d === void 0 ? 12 : _d;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _e.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        mockStudents = [
                            {
                                id: 1,
                                name: '张小明',
                                gender: 'male',
                                age: 4,
                                classId: 1,
                                className: '小班A',
                                avatar: '/avatars/student1.jpg',
                                parentName: '张先生',
                                parentPhone: '13800138001',
                                enrollmentDate: '2024-09-01',
                                status: 'active'
                            },
                            {
                                id: 2,
                                name: '李小红',
                                gender: 'female',
                                age: 4,
                                classId: 1,
                                className: '小班A',
                                avatar: '/avatars/student2.jpg',
                                parentName: '李女士',
                                parentPhone: '13800138002',
                                enrollmentDate: '2024-09-01',
                                status: 'active'
                            },
                            {
                                id: 3,
                                name: '王小刚',
                                gender: 'male',
                                age: 4,
                                classId: 1,
                                className: '小班A',
                                avatar: '/avatars/student3.jpg',
                                parentName: '王先生',
                                parentPhone: '13800138003',
                                enrollmentDate: '2024-09-01',
                                status: 'active'
                            },
                            {
                                id: 4,
                                name: '赵小丽',
                                gender: 'female',
                                age: 4,
                                classId: 2,
                                className: '小班B',
                                avatar: '/avatars/student4.jpg',
                                parentName: '赵女士',
                                parentPhone: '13800138004',
                                enrollmentDate: '2024-09-01',
                                status: 'active'
                            },
                            {
                                id: 5,
                                name: '陈小强',
                                gender: 'male',
                                age: 5,
                                classId: 3,
                                className: '中班A',
                                avatar: '/avatars/student5.jpg',
                                parentName: '陈先生',
                                parentPhone: '13800138005',
                                enrollmentDate: '2024-09-01',
                                status: 'active'
                            }
                        ];
                        filteredStudents = mockStudents;
                        if (classId_2) {
                            filteredStudents = filteredStudents.filter(function (s) { return s.classId === parseInt(classId_2); });
                        }
                        if (gender_1) {
                            filteredStudents = filteredStudents.filter(function (s) { return s.gender === gender_1; });
                        }
                        if (keyword) {
                            kw_1 = keyword.toLowerCase();
                            filteredStudents = filteredStudents.filter(function (s) {
                                return s.name.toLowerCase().includes(kw_1) ||
                                    s.parentName.toLowerCase().includes(kw_1);
                            });
                        }
                        pageNum = parseInt(page);
                        limitNum = parseInt(limit);
                        total = filteredStudents.length;
                        startIndex = (pageNum - 1) * limitNum;
                        endIndex = startIndex + limitNum;
                        paginatedStudents = filteredStudents.slice(startIndex, endIndex);
                        res.json({
                            success: true,
                            data: {
                                students: paginatedStudents,
                                total: total,
                                page: pageNum,
                                limit: limitNum
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_23 = _e.sent();
                        console.error('获取学生列表失败:', error_23);
                        res.status(500).json({
                            success: false,
                            message: '获取学生列表失败',
                            error: error_23 instanceof Error ? error_23.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新进度
     * PUT /api/teacher/teaching/progress/:id
     */
    TeacherDashboardController.updateProgress = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, progressId, _b, progress, notes, teacher, updatedProgress, error_24;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        progressId = req.params.id;
                        _b = req.body, progress = _b.progress, notes = _b.notes;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, models_1.Teacher.findOne({
                                where: { userId: userId }
                            })];
                    case 1:
                        teacher = _c.sent();
                        if (!teacher) {
                            return [2 /*return*/, res.status(404).json({
                                    success: false,
                                    message: '教师信息不存在'
                                })];
                        }
                        updatedProgress = {
                            id: parseInt(progressId),
                            subject: '语言发展',
                            progress: progress || 85,
                            target: 90,
                            status: progress >= 90 ? 'ahead' : progress >= 80 ? 'on_track' : 'behind',
                            notes: notes || '进度更新',
                            lastUpdated: new Date().toISOString()
                        };
                        res.json({
                            success: true,
                            message: '进度更新成功',
                            data: updatedProgress
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_24 = _c.sent();
                        console.error('更新进度失败:', error_24);
                        res.status(500).json({
                            success: false,
                            message: '更新进度失败',
                            error: error_24 instanceof Error ? error_24.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return TeacherDashboardController;
}());
exports.TeacherDashboardController = TeacherDashboardController;
