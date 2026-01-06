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
exports.ScheduleService = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var ScheduleService = /** @class */ (function () {
    function ScheduleService() {
    }
    /**
     * 创建日程
     */
    ScheduleService.prototype.createSchedule = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, scheduleId, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 7]);
                        return [4 /*yield*/, init_1.sequelize.query("INSERT INTO schedules \n         (title, description, start_time, end_time, location, user_id, created_at, updated_at)\n         VALUES (:title, :description, :startTime, :endTime, :location, :userId, NOW(), NOW())", {
                                replacements: {
                                    title: data.title,
                                    description: data.description || null,
                                    startTime: data.startTime,
                                    endTime: data.endTime,
                                    location: data.location || null,
                                    userId: userId
                                },
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 3:
                        result = _a.sent();
                        scheduleId = result[0];
                        return [4 /*yield*/, transaction.commit()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.getScheduleById(scheduleId)];
                    case 5:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 6:
                        _a.sent();
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取日程列表
     */
    ScheduleService.prototype.getSchedules = function (params) {
        var _a;
        if (params === void 0) { params = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _b, page, _c, limit, startDate, endDate, location, userId, offset, whereConditions, replacements, whereClause, countResult, total, schedules;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _b = params.page, page = _b === void 0 ? 1 : _b, _c = params.limit, limit = _c === void 0 ? 10 : _c, startDate = params.startDate, endDate = params.endDate, location = params.location, userId = params.userId;
                        offset = (page - 1) * limit;
                        whereConditions = ['s.deleted_at IS NULL'];
                        replacements = { limit: limit, offset: offset };
                        if (startDate) {
                            whereConditions.push('s.start_time >= :startDate');
                            replacements.startDate = startDate;
                        }
                        if (endDate) {
                            whereConditions.push('s.end_time <= :endDate');
                            replacements.endDate = endDate;
                        }
                        if (location) {
                            whereConditions.push('s.location LIKE :location');
                            replacements.location = "%".concat(location, "%");
                        }
                        if (userId) {
                            whereConditions.push('s.user_id = :userId');
                            replacements.userId = userId;
                        }
                        whereClause = whereConditions.join(' AND ');
                        return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total\n      FROM schedules s\n      WHERE ".concat(whereClause), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResult = _d.sent();
                        total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
                        return [4 /*yield*/, init_1.sequelize.query("SELECT \n        s.*,\n        u.id as user_id,\n        u.username as user_username,\n        u.real_name as user_real_name\n      FROM schedules s\n      LEFT JOIN users u ON s.user_id = u.id\n      WHERE ".concat(whereClause, "\n      ORDER BY s.start_time ASC\n      LIMIT :limit OFFSET :offset"), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        schedules = _d.sent();
                        return [2 /*return*/, {
                                schedules: schedules.map(this.formatSchedule),
                                total: Number(total),
                                page: page,
                                limit: limit
                            }];
                }
            });
        });
    };
    /**
     * 根据ID获取日程
     */
    ScheduleService.prototype.getScheduleById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var schedules;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.query("SELECT \n        s.*,\n        u.id as user_id,\n        u.username as user_username,\n        u.real_name as user_real_name\n      FROM schedules s\n      LEFT JOIN users u ON s.user_id = u.id\n      WHERE s.id = :id AND s.deleted_at IS NULL", {
                            replacements: { id: id },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                    case 1:
                        schedules = _a.sent();
                        if (!schedules.length) {
                            throw new Error('日程不存在');
                        }
                        return [2 /*return*/, this.formatSchedule(schedules[0])];
                }
            });
        });
    };
    /**
     * 更新日程
     */
    ScheduleService.prototype.updateSchedule = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, updateFields, replacements, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 10]);
                        // 检查日程是否存在
                        return [4 /*yield*/, this.getScheduleById(id)];
                    case 3:
                        // 检查日程是否存在
                        _a.sent();
                        updateFields = [];
                        replacements = { id: id };
                        if (data.title !== undefined) {
                            updateFields.push('title = :title');
                            replacements.title = data.title;
                        }
                        if (data.description !== undefined) {
                            updateFields.push('description = :description');
                            replacements.description = data.description;
                        }
                        if (data.startTime !== undefined) {
                            updateFields.push('start_time = :startTime');
                            replacements.startTime = data.startTime;
                        }
                        if (data.endTime !== undefined) {
                            updateFields.push('end_time = :endTime');
                            replacements.endTime = data.endTime;
                        }
                        if (data.location !== undefined) {
                            updateFields.push('location = :location');
                            replacements.location = data.location;
                        }
                        if (!(updateFields.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, transaction.rollback()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.getScheduleById(id)];
                    case 5:
                        updateFields.push('updated_at = NOW()');
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE schedules SET ".concat(updateFields.join(', '), " WHERE id = :id"), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, this.getScheduleById(id)];
                    case 8:
                        error_2 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 9:
                        _a.sent();
                        throw error_2;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除日程
     */
    ScheduleService.prototype.deleteSchedule = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        // 检查日程是否存在
                        return [4 /*yield*/, this.getScheduleById(id)];
                    case 3:
                        // 检查日程是否存在
                        _a.sent();
                        return [4 /*yield*/, init_1.sequelize.query('UPDATE schedules SET deleted_at = NOW() WHERE id = :id', {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 6:
                        error_3 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_3;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取日程统计
     */
    ScheduleService.prototype.getScheduleStatistics = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, replacements, result, stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = 'deleted_at IS NULL';
                        replacements = {};
                        if (userId) {
                            whereClause += ' AND user_id = :userId';
                            replacements.userId = userId;
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT \n        COUNT(*) as total,\n        SUM(CASE WHEN DATE(start_time) = CURDATE() THEN 1 ELSE 0 END) as today,\n        SUM(CASE WHEN YEARWEEK(start_time, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) as thisWeek,\n        SUM(CASE WHEN YEAR(start_time) = YEAR(CURDATE()) AND MONTH(start_time) = MONTH(CURDATE()) THEN 1 ELSE 0 END) as thisMonth\n      FROM schedules \n      WHERE ".concat(whereClause), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        result = _a.sent();
                        stats = result[0] || {};
                        return [2 /*return*/, {
                                total: Number(stats.total) || 0,
                                today: Number(stats.today) || 0,
                                thisWeek: Number(stats.thisWeek) || 0,
                                thisMonth: Number(stats.thisMonth) || 0
                            }];
                }
            });
        });
    };
    /**
     * 获取日历视图数据
     */
    ScheduleService.prototype.getCalendarView = function (year, month, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var startDate, lastDay, endDate, testDate, whereClause, replacements, schedules;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 输入验证
                        if (year < 1900 || year > 2100) {
                            throw new Error('年份必须在1900-2100之间');
                        }
                        if (month < 1 || month > 12) {
                            throw new Error('月份必须在1-12之间');
                        }
                        startDate = "".concat(year, "-").concat(month.toString().padStart(2, '0'), "-01");
                        lastDay = new Date(year, month, 0).getDate();
                        endDate = "".concat(year, "-").concat(month.toString().padStart(2, '0'), "-").concat(lastDay.toString().padStart(2, '0'));
                        testDate = new Date(endDate);
                        if (testDate.getDate() !== lastDay) {
                            throw new Error("\u65E0\u6548\u7684\u65E5\u671F: ".concat(endDate));
                        }
                        console.log("[\u65E5\u5386\u89C6\u56FE] \u67E5\u8BE2\u8303\u56F4: ".concat(startDate, " \u5230 ").concat(endDate, " (").concat(lastDay, "\u5929)"));
                        whereClause = 's.deleted_at IS NULL AND s.start_time >= :startDate AND s.start_time <= :endDate';
                        replacements = { startDate: startDate, endDate: endDate };
                        if (userId) {
                            whereClause += ' AND s.user_id = :userId';
                            replacements.userId = userId;
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT \n        s.*,\n        u.id as user_id,\n        u.username as user_username,\n        u.real_name as user_real_name\n      FROM schedules s\n      LEFT JOIN users u ON s.user_id = u.id\n      WHERE ".concat(whereClause, "\n      ORDER BY s.start_time ASC"), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        schedules = _a.sent();
                        return [2 /*return*/, schedules.map(this.formatSchedule)];
                }
            });
        });
    };
    /**
     * 格式化日程数据
     */
    ScheduleService.prototype.formatSchedule = function (row) {
        return {
            id: row.id,
            title: row.title,
            description: row.description,
            startTime: row.start_time,
            endTime: row.end_time,
            location: row.location,
            userId: row.user_id,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            deletedAt: row.deleted_at,
            user: row.user_username ? {
                id: row.user_id,
                username: row.user_username,
                realName: row.user_real_name
            } : undefined
        };
    };
    return ScheduleService;
}());
exports.ScheduleService = ScheduleService;
// 导出服务实例
exports["default"] = new ScheduleService();
