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
exports.DashboardService = void 0;
var todo_model_1 = require("../../models/todo.model");
var schedule_model_1 = require("../../models/schedule.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var DashboardService = /** @class */ (function () {
    function DashboardService() {
    }
    /**
     * 获取仪表盘统计数据
     * @param userId 用户ID
     */
    DashboardService.prototype.getDashboardStats = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var todoCount, startOfDay, endOfDay, todaySchedules;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, todo_model_1.Todo.count({ where: { userId: userId, status: todo_model_1.TodoStatus.PENDING } })];
                    case 1:
                        todoCount = _c.sent();
                        startOfDay = new Date();
                        startOfDay.setHours(0, 0, 0, 0);
                        endOfDay = new Date();
                        endOfDay.setHours(23, 59, 59, 999);
                        return [4 /*yield*/, schedule_model_1.Schedule.findAll({
                                where: {
                                    userId: userId,
                                    startTime: (_a = {},
                                        _a[sequelize_1.Op.gte] = startOfDay,
                                        _a),
                                    endTime: (_b = {},
                                        _b[sequelize_1.Op.lte] = endOfDay,
                                        _b)
                                },
                                order: [['startTime', 'ASC']]
                            })];
                    case 2:
                        todaySchedules = _c.sent();
                        return [2 /*return*/, {
                                todoCount: todoCount,
                                todaySchedules: todaySchedules,
                                quickStats: {
                                    pendingTasks: todoCount,
                                    meetingsToday: todaySchedules.length,
                                    notifications: 0
                                }
                            }];
                }
            });
        });
    };
    /**
     * 获取待办事项列表
     * @param userId 用户ID
     * @param options 分页选项
     * @param filters 过滤条件
     */
    DashboardService.prototype.getTodos = function (userId, options, filters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, _c, sortBy, _d, sortOrder, where;
            var _e;
            return __generator(this, function (_f) {
                _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.pageSize, pageSize = _b === void 0 ? 10 : _b, _c = options.sortBy, sortBy = _c === void 0 ? 'createdAt' : _c, _d = options.sortOrder, sortOrder = _d === void 0 ? 'desc' : _d;
                where = { userId: userId };
                if (filters.status) {
                    where.status = filters.status;
                }
                if (filters.keyword) {
                    where.title = (_e = {}, _e[sequelize_1.Op.like] = "%".concat(filters.keyword, "%"), _e);
                }
                return [2 /*return*/, todo_model_1.Todo.findAndCountAll({
                        where: where,
                        limit: Number(pageSize) > 0 ? Number(pageSize) : 10,
                        offset: Number(page) > 0 ? (Number(page) - 1) * Number(pageSize) : 0,
                        order: [[sortBy, sortOrder]]
                    })];
            });
        });
    };
    /**
     * 创建待办事项
     * @param data 待办事项数据
     */
    DashboardService.prototype.createTodo = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!data.title || !data.userId) {
                    throw apiError_1.ApiError.badRequest('标题和用户ID是必填项');
                }
                return [2 /*return*/, todo_model_1.Todo.create(data)];
            });
        });
    };
    /**
     * 更新待办事项状态
     * @param todoId 待办事项ID
     * @param status 新的状态
     * @param userId 用户ID
     */
    DashboardService.prototype.updateTodoStatus = function (todoId, status, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var todo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, todo_model_1.Todo.findOne({ where: { id: todoId, userId: userId } })];
                    case 1:
                        todo = _a.sent();
                        if (!todo) return [3 /*break*/, 3];
                        todo.status = status;
                        if (status === todo_model_1.TodoStatus.COMPLETED) {
                            todo.completedDate = new Date();
                        }
                        return [4 /*yield*/, todo.save()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, todo];
                }
            });
        });
    };
    /**
     * 删除待办事项
     * @param todoId 待办事项ID
     * @param userId 用户ID
     */
    DashboardService.prototype.deleteTodo = function (todoId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, todo_model_1.Todo.destroy({ where: { id: todoId, userId: userId } })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result > 0];
                }
            });
        });
    };
    /**
     * 获取日程列表
     * @param userId 用户ID
     * @param options 日期范围选项
     */
    DashboardService.prototype.getSchedules = function (userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, replacements, query;
            return __generator(this, function (_a) {
                whereClause = 'WHERE user_id = :userId AND deleted_at IS NULL';
                replacements = { userId: userId };
                if (options.startDate) {
                    whereClause += ' AND start_time >= :startDate';
                    replacements.startDate = options.startDate;
                }
                if (options.endDate) {
                    whereClause += ' AND end_time <= :endDate';
                    replacements.endDate = options.endDate;
                }
                query = "\n      SELECT \n        id,\n        title,\n        description,\n        start_time as startTime,\n        end_time as endTime,\n        location,\n        user_id as userId,\n        created_at as createdAt,\n        updated_at as updatedAt\n      FROM schedules \n      ".concat(whereClause, "\n      ORDER BY start_time ASC\n    ");
                return [2 /*return*/, init_1.sequelize.query(query, {
                        type: sequelize_1.QueryTypes.SELECT,
                        replacements: replacements
                    })];
            });
        });
    };
    /**
     * 创建日程安排
     * @param data 日程数据
     */
    DashboardService.prototype.createSchedule = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!data.title || !data.startTime || !data.userId) {
                    throw apiError_1.ApiError.badRequest('标题、开始时间和用户ID是必填项');
                }
                return [2 /*return*/, schedule_model_1.Schedule.create(data)];
            });
        });
    };
    /**
     * 获取班级概览信息
     */
    DashboardService.prototype.getClassesOverview = function () {
        return __awaiter(this, void 0, void 0, function () {
            var query;
            return __generator(this, function (_a) {
                query = "\n      SELECT \n        id,\n        name,\n        code,\n        type,\n        grade,\n        capacity,\n        current_student_count as studentCount,\n        classroom,\n        status,\n        created_at as createdAt,\n        updated_at as updatedAt\n      FROM classes \n      WHERE deleted_at IS NULL\n      ORDER BY type ASC, name ASC\n    ";
                return [2 /*return*/, init_1.sequelize.query(query, {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            });
        });
    };
    return DashboardService;
}());
exports.DashboardService = DashboardService;
// 导出服务实例
exports["default"] = new DashboardService();
