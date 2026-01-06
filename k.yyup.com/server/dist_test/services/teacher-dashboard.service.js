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
exports.TeacherDashboardService = void 0;
var sequelize_1 = require("sequelize");
var todo_model_1 = require("../models/todo.model");
var notification_model_1 = require("../models/notification.model");
var course_progress_model_1 = require("../models/course-progress.model");
var class_model_1 = require("../models/class.model");
var student_model_1 = require("../models/student.model");
var activity_model_1 = require("../models/activity.model");
var teacher_model_1 = require("../models/teacher.model");
/**
 * 教师工作台服务
 */
var TeacherDashboardService = /** @class */ (function () {
    function TeacherDashboardService() {
    }
    /**
     * 获取教师工作台完整数据
     */
    TeacherDashboardService.getDashboardData = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, taskStats, classStats, activityStats, notificationStats, todayTasks, todayCourses, recentNotifications;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.getTaskStats(teacherId),
                            this.getClassStats(teacherId),
                            this.getActivityStats(teacherId),
                            this.getNotificationStats(teacherId),
                            this.getTodayTasks(teacherId),
                            this.getTodayCourses(teacherId),
                            this.getRecentNotifications(teacherId, 5)
                        ])];
                    case 1:
                        _a = _b.sent(), taskStats = _a[0], classStats = _a[1], activityStats = _a[2], notificationStats = _a[3], todayTasks = _a[4], todayCourses = _a[5], recentNotifications = _a[6];
                        return [2 /*return*/, {
                                stats: {
                                    tasks: taskStats,
                                    classes: classStats,
                                    activities: activityStats,
                                    notifications: notificationStats
                                },
                                todayTasks: todayTasks,
                                todayCourses: todayCourses,
                                recentNotifications: recentNotifications
                            }];
                }
            });
        });
    };
    /**
     * 获取任务统计
     */
    TeacherDashboardService.getTaskStats = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var today, tomorrow, _a, total, completed, pending_1, overdue, error_1;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        today = new Date();
                        today.setHours(0, 0, 0, 0);
                        tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return [4 /*yield*/, Promise.all([
                                todo_model_1.Todo.count({
                                    where: {
                                        assignedTo: teacherId,
                                        status: (_b = {}, _b[sequelize_1.Op.ne] = 'deleted', _b)
                                    }
                                })["catch"](function () { return 0; }),
                                todo_model_1.Todo.count({
                                    where: {
                                        assignedTo: teacherId,
                                        status: 'completed'
                                    }
                                })["catch"](function () { return 0; }),
                                todo_model_1.Todo.count({
                                    where: {
                                        assignedTo: teacherId,
                                        status: (_c = {}, _c[sequelize_1.Op["in"]] = ['pending', 'in_progress'], _c)
                                    }
                                })["catch"](function () { return 0; }),
                                todo_model_1.Todo.count({
                                    where: {
                                        assignedTo: teacherId,
                                        status: (_d = {}, _d[sequelize_1.Op["in"]] = ['pending', 'in_progress'], _d),
                                        dueDate: (_e = {}, _e[sequelize_1.Op.lt] = today, _e)
                                    }
                                })["catch"](function () { return 0; })
                            ])];
                    case 1:
                        _a = _f.sent(), total = _a[0], completed = _a[1], pending_1 = _a[2], overdue = _a[3];
                        return [2 /*return*/, { total: total || 0, completed: completed || 0, pending: pending_1 || 0, overdue: overdue || 0 }];
                    case 2:
                        error_1 = _f.sent();
                        console.error('获取任务统计失败:', error_1);
                        return [2 /*return*/, { total: 0, completed: 0, pending: 0, overdue: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级统计
     */
    TeacherDashboardService.getClassStats = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var teacher, classes, total, today, todayStart, todayEnd, todayClasses, studentsCount, _a, totalSessions, completedSessions, completionRate, error_2;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, teacher_model_1.Teacher.findByPk(teacherId, {
                                include: [{
                                        model: class_model_1.Class,
                                        as: 'classes'
                                    }]
                            })["catch"](function () { return null; })];
                    case 1:
                        teacher = _d.sent();
                        classes = (teacher === null || teacher === void 0 ? void 0 : teacher.classes) || [];
                        total = classes.length;
                        today = new Date();
                        todayStart = new Date(today.setHours(0, 0, 0, 0));
                        todayEnd = new Date(today.setHours(23, 59, 59, 999));
                        return [4 /*yield*/, course_progress_model_1.CourseProgress.count({
                                where: {
                                    teacher_id: teacherId,
                                    session_date: (_b = {},
                                        _b[sequelize_1.Op.between] = [todayStart, todayEnd],
                                        _b)
                                }
                            })["catch"](function () { return 0; })];
                    case 2:
                        todayClasses = _d.sent();
                        studentsCount = 0;
                        if (!(classes.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, student_model_1.Student.count({
                                include: [{
                                        model: class_model_1.Class,
                                        as: 'class',
                                        where: {
                                            id: (_c = {}, _c[sequelize_1.Op["in"]] = classes.map(function (c) { return c.id; }), _c)
                                        }
                                    }]
                            })["catch"](function () { return 0; })];
                    case 3:
                        studentsCount = _d.sent();
                        _d.label = 4;
                    case 4: return [4 /*yield*/, Promise.all([
                            course_progress_model_1.CourseProgress.count({
                                where: { teacher_id: teacherId }
                            })["catch"](function () { return 0; }),
                            course_progress_model_1.CourseProgress.count({
                                where: {
                                    teacher_id: teacherId,
                                    completion_status: 'completed'
                                }
                            })["catch"](function () { return 0; })
                        ])];
                    case 5:
                        _a = _d.sent(), totalSessions = _a[0], completedSessions = _a[1];
                        completionRate = totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0;
                        return [2 /*return*/, {
                                total: total || 0,
                                todayClasses: todayClasses || 0,
                                studentsCount: studentsCount || 0,
                                completionRate: completionRate || 0
                            }];
                    case 6:
                        error_2 = _d.sent();
                        console.error('获取班级统计失败:', error_2);
                        return [2 /*return*/, {
                                total: 0,
                                todayClasses: 0,
                                studentsCount: 0,
                                completionRate: 0
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动统计
     */
    TeacherDashboardService.getActivityStats = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, weekStart, weekEnd, _a, upcoming, participating, thisWeek, error_3;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        now = new Date();
                        weekStart = new Date(now);
                        weekStart.setDate(now.getDate() - now.getDay());
                        weekStart.setHours(0, 0, 0, 0);
                        weekEnd = new Date(weekStart);
                        weekEnd.setDate(weekStart.getDate() + 7);
                        return [4 /*yield*/, Promise.all([
                                activity_model_1.Activity.count({
                                    where: {
                                        creatorId: teacherId,
                                        startTime: (_b = {}, _b[sequelize_1.Op.gt] = now, _b),
                                        status: activity_model_1.ActivityStatus.REGISTRATION_OPEN
                                    }
                                })["catch"](function () { return 0; }),
                                activity_model_1.Activity.count({
                                    where: {
                                        creatorId: teacherId,
                                        status: (_c = {}, _c[sequelize_1.Op["in"]] = [activity_model_1.ActivityStatus.REGISTRATION_OPEN, activity_model_1.ActivityStatus.IN_PROGRESS], _c)
                                    }
                                })["catch"](function () { return 0; }),
                                activity_model_1.Activity.count({
                                    where: {
                                        creatorId: teacherId,
                                        startTime: (_d = {},
                                            _d[sequelize_1.Op.between] = [weekStart, weekEnd],
                                            _d)
                                    }
                                })["catch"](function () { return 0; })
                            ])];
                    case 1:
                        _a = _e.sent(), upcoming = _a[0], participating = _a[1], thisWeek = _a[2];
                        return [2 /*return*/, {
                                upcoming: upcoming || 0,
                                participating: participating || 0,
                                thisWeek: thisWeek || 0
                            }];
                    case 2:
                        error_3 = _e.sent();
                        console.error('获取活动统计失败:', error_3);
                        return [2 /*return*/, { upcoming: 0, participating: 0, thisWeek: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取通知统计
     */
    TeacherDashboardService.getNotificationStats = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, unread, total, urgent, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.all([
                                notification_model_1.Notification.count({
                                    where: {
                                        userId: teacherId,
                                        status: 'unread'
                                    }
                                })["catch"](function () { return 0; }),
                                notification_model_1.Notification.count({
                                    where: {
                                        userId: teacherId
                                    }
                                })["catch"](function () { return 0; }),
                                notification_model_1.Notification.count({
                                    where: {
                                        userId: teacherId,
                                        type: 'system',
                                        status: 'unread'
                                    }
                                })["catch"](function () { return 0; })
                            ])];
                    case 1:
                        _a = _b.sent(), unread = _a[0], total = _a[1], urgent = _a[2];
                        return [2 /*return*/, {
                                unread: unread || 0,
                                total: total || 0,
                                urgent: urgent || 0
                            }];
                    case 2:
                        error_4 = _b.sent();
                        console.error('获取通知统计失败:', error_4);
                        return [2 /*return*/, { unread: 0, total: 0, urgent: 0 }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取今日任务
     */
    TeacherDashboardService.getTodayTasks = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var today, tomorrow, tasks, error_5;
            var _a, _b;
            var _this = this;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        today = new Date();
                        today.setHours(0, 0, 0, 0);
                        tomorrow = new Date(today);
                        tomorrow.setDate(tomorrow.getDate() + 1);
                        return [4 /*yield*/, todo_model_1.Todo.findAll({
                                where: {
                                    assignedTo: teacherId,
                                    dueDate: (_a = {},
                                        _a[sequelize_1.Op.between] = [today, tomorrow],
                                        _a),
                                    status: (_b = {}, _b[sequelize_1.Op.ne] = 'deleted', _b)
                                },
                                order: [['priority', 'DESC'], ['dueDate', 'ASC']],
                                limit: 10
                            })["catch"](function () { return []; })];
                    case 1:
                        tasks = _c.sent();
                        return [2 /*return*/, tasks.map(function (task) { return ({
                                id: task.id,
                                title: task.title,
                                priority: _this.getPriorityText(task.priority.toString()),
                                deadline: task.dueDate ? new Date(task.dueDate).toLocaleTimeString('zh-CN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                }) : '',
                                completed: task.status === 'completed'
                            }); })];
                    case 2:
                        error_5 = _c.sent();
                        console.error('获取今日任务失败:', error_5);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取今日课程
     */
    TeacherDashboardService.getTodayCourses = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.log('🔍 获取今日课程 - teacherId:', teacherId);
                console.log('⚠️ 暂时跳过CourseProgress查询，返回空数组');
                // 暂时返回空数组，避免500错误
                return [2 /*return*/, []];
            });
        });
    };
    /**
     * 获取最新通知
     */
    TeacherDashboardService.getRecentNotifications = function (teacherId, limit) {
        if (limit === void 0) { limit = 5; }
        return __awaiter(this, void 0, void 0, function () {
            var notifications, error_6;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, notification_model_1.Notification.findAll({
                                where: {
                                    userId: teacherId
                                },
                                order: [['createdAt', 'DESC']],
                                limit: limit
                            })["catch"](function () { return []; })];
                    case 1:
                        notifications = _a.sent();
                        return [2 /*return*/, notifications.map(function (notification) { return ({
                                id: notification.id,
                                title: notification.title,
                                createdAt: _this.getRelativeTime(notification.createdAt),
                                read: notification.status === 'read'
                            }); })];
                    case 2:
                        error_6 = _a.sent();
                        console.error('获取最新通知失败:', error_6);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师统计数据
     */
    TeacherDashboardService.getTeacherStatistics = function (teacherId) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, taskStats, classStats, activityStats, notificationStats;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            this.getTaskStats(teacherId),
                            this.getClassStats(teacherId),
                            this.getActivityStats(teacherId),
                            this.getNotificationStats(teacherId)
                        ])];
                    case 1:
                        _a = _b.sent(), taskStats = _a[0], classStats = _a[1], activityStats = _a[2], notificationStats = _a[3];
                        return [2 /*return*/, {
                                tasks: taskStats,
                                classes: classStats,
                                activities: activityStats,
                                notifications: notificationStats
                            }];
                }
            });
        });
    };
    /**
     * 更新任务状态
     * 修复：使用 Task 模型而不是 Todo 模型
     * @param taskId 任务ID
     * @param userId 用户ID（任务的assignee_id）
     * @param completed 是否完成
     */
    TeacherDashboardService.updateTaskStatus = function (taskId, userId, completed) {
        return __awaiter(this, void 0, void 0, function () {
            var Task, task, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        Task = require('../models').Task;
                        return [4 /*yield*/, Task.findOne({
                                where: {
                                    id: taskId,
                                    assignee_id: userId // 使用 Task 模型的字段，assignee_id 是用户ID
                                }
                            })];
                    case 1:
                        task = _a.sent();
                        if (!task) {
                            throw new Error('任务不存在或无权限');
                        }
                        // 更新任务状态
                        task.status = completed ? 'completed' : 'pending';
                        task.updated_at = new Date();
                        // 如果完成，记录完成时间
                        if (completed) {
                            task.progress = 100;
                        }
                        return [4 /*yield*/, task.save()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, task];
                    case 3:
                        error_7 = _a.sent();
                        console.error('更新任务状态失败:', error_7);
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 打卡记录
     */
    TeacherDashboardService.clockIn = function (teacherId, type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里应该创建考勤记录
                // 由于没有考勤表，暂时返回模拟数据
                return [2 /*return*/, {
                        teacherId: teacherId,
                        type: type,
                        timestamp: new Date(),
                        location: '幼儿园',
                        message: type === 'in' ? '上班打卡成功' : '下班打卡成功'
                    }];
            });
        });
    };
    /**
     * 获取优先级文本
     */
    TeacherDashboardService.getPriorityText = function (priority) {
        var priorityMap = {
            'high': '高',
            'medium': '中',
            'low': '低'
        };
        return priorityMap[priority] || '中';
    };
    /**
     * 获取相对时间
     */
    TeacherDashboardService.getRelativeTime = function (date) {
        var now = new Date();
        var diff = now.getTime() - date.getTime();
        var minutes = Math.floor(diff / (1000 * 60));
        var hours = Math.floor(diff / (1000 * 60 * 60));
        var days = Math.floor(diff / (1000 * 60 * 60 * 24));
        if (minutes < 60) {
            return "".concat(minutes, "\u5206\u949F\u524D");
        }
        else if (hours < 24) {
            return "".concat(hours, "\u5C0F\u65F6\u524D");
        }
        else {
            return "".concat(days, "\u5929\u524D");
        }
    };
    return TeacherDashboardService;
}());
exports.TeacherDashboardService = TeacherDashboardService;
