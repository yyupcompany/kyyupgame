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
exports.__esModule = true;
exports.TaskLogService = void 0;
var database_service_1 = require("./database.service");
var TaskLogService = /** @class */ (function () {
    function TaskLogService() {
        this.db = new database_service_1.DatabaseService();
    }
    /**
     * 记录任务操作日志
     */
    TaskLogService.prototype.logAction = function (taskId, userId, action, oldValue, newValue, description, ipAddress, userAgent) {
        if (oldValue === void 0) { oldValue = null; }
        if (newValue === void 0) { newValue = null; }
        return __awaiter(this, void 0, void 0, function () {
            var query, params;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      INSERT INTO task_logs (\n        task_id, user_id, action, old_value, new_value, description, ip_address, user_agent\n      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)\n    ";
                        params = [
                            taskId,
                            userId,
                            action,
                            oldValue ? JSON.stringify(oldValue) : null,
                            newValue ? JSON.stringify(newValue) : null,
                            description,
                            ipAddress,
                            userAgent
                        ];
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取任务操作日志
     */
    TaskLogService.prototype.getTaskLogs = function (taskId, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, offset, query, logs, countQuery, countResult, total, processedLogs;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.limit, limit = _b === void 0 ? 50 : _b;
                        offset = (page - 1) * limit;
                        query = "\n      SELECT \n        tl.*,\n        u.name as user_name,\n        u.avatar as user_avatar\n      FROM task_logs tl\n      LEFT JOIN users u ON tl.user_id = u.id\n      WHERE tl.task_id = ?\n      ORDER BY tl.created_at DESC\n      LIMIT ? OFFSET ?\n    ";
                        return [4 /*yield*/, this.db.query(query, [taskId, limit, offset])];
                    case 1:
                        logs = _c.sent();
                        countQuery = 'SELECT COUNT(*) as total FROM task_logs WHERE task_id = ?';
                        return [4 /*yield*/, this.db.query(countQuery, [taskId])];
                    case 2:
                        countResult = (_c.sent())[0];
                        total = countResult.total;
                        processedLogs = logs.map(function (log) { return (__assign(__assign({}, log), { old_value: log.old_value ? JSON.parse(log.old_value) : null, new_value: log.new_value ? JSON.parse(log.new_value) : null })); });
                        return [2 /*return*/, {
                                data: processedLogs,
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: total,
                                    totalPages: Math.ceil(total / limit)
                                }
                            }];
                }
            });
        });
    };
    /**
     * 获取用户操作日志
     */
    TaskLogService.prototype.getUserLogs = function (userId, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, offset, query, logs, countQuery, countResult, total, processedLogs;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.limit, limit = _b === void 0 ? 50 : _b;
                        offset = (page - 1) * limit;
                        query = "\n      SELECT \n        tl.*,\n        t.title as task_title,\n        u.name as user_name\n      FROM task_logs tl\n      LEFT JOIN tasks t ON tl.task_id = t.id\n      LEFT JOIN users u ON tl.user_id = u.id\n      WHERE tl.user_id = ?\n      ORDER BY tl.created_at DESC\n      LIMIT ? OFFSET ?\n    ";
                        return [4 /*yield*/, this.db.query(query, [userId, limit, offset])];
                    case 1:
                        logs = _c.sent();
                        countQuery = 'SELECT COUNT(*) as total FROM task_logs WHERE user_id = ?';
                        return [4 /*yield*/, this.db.query(countQuery, [userId])];
                    case 2:
                        countResult = (_c.sent())[0];
                        total = countResult.total;
                        processedLogs = logs.map(function (log) { return (__assign(__assign({}, log), { old_value: log.old_value ? JSON.parse(log.old_value) : null, new_value: log.new_value ? JSON.parse(log.new_value) : null })); });
                        return [2 /*return*/, {
                                data: processedLogs,
                                pagination: {
                                    page: page,
                                    limit: limit,
                                    total: total,
                                    totalPages: Math.ceil(total / limit)
                                }
                            }];
                }
            });
        });
    };
    /**
     * 获取操作统计
     */
    TaskLogService.prototype.getActionStats = function (taskId, userId, dateRange) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, params, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = 'WHERE 1=1';
                        params = [];
                        if (taskId) {
                            whereClause += ' AND task_id = ?';
                            params.push(taskId);
                        }
                        if (userId) {
                            whereClause += ' AND user_id = ?';
                            params.push(userId);
                        }
                        if (dateRange) {
                            whereClause += ' AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)';
                            params.push(dateRange);
                        }
                        query = "\n      SELECT \n        action,\n        COUNT(*) as count,\n        DATE(created_at) as date\n      FROM task_logs\n      ".concat(whereClause, "\n      GROUP BY action, DATE(created_at)\n      ORDER BY date DESC, count DESC\n    ");
                        return [4 /*yield*/, this.db.query(query, params)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 清理旧日志
     */
    TaskLogService.prototype.cleanupOldLogs = function (daysToKeep) {
        if (daysToKeep === void 0) { daysToKeep = 90; }
        return __awaiter(this, void 0, void 0, function () {
            var query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      DELETE FROM task_logs \n      WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)\n    ";
                        return [4 /*yield*/, this.db.query(query, [daysToKeep])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.affectedRows];
                }
            });
        });
    };
    /**
     * 获取最近的操作日志
     */
    TaskLogService.prototype.getRecentLogs = function (limit) {
        if (limit === void 0) { limit = 20; }
        return __awaiter(this, void 0, void 0, function () {
            var query, logs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        tl.*,\n        t.title as task_title,\n        u.name as user_name,\n        u.avatar as user_avatar\n      FROM task_logs tl\n      LEFT JOIN tasks t ON tl.task_id = t.id\n      LEFT JOIN users u ON tl.user_id = u.id\n      ORDER BY tl.created_at DESC\n      LIMIT ?\n    ";
                        return [4 /*yield*/, this.db.query(query, [limit])];
                    case 1:
                        logs = _a.sent();
                        return [2 /*return*/, logs.map(function (log) { return (__assign(__assign({}, log), { old_value: log.old_value ? JSON.parse(log.old_value) : null, new_value: log.new_value ? JSON.parse(log.new_value) : null })); })];
                }
            });
        });
    };
    /**
     * 导出任务日志
     */
    TaskLogService.prototype.exportTaskLogs = function (taskId, format) {
        if (format === void 0) { format = 'json'; }
        return __awaiter(this, void 0, void 0, function () {
            var query, logs, processedLogs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT \n        tl.*,\n        u.name as user_name\n      FROM task_logs tl\n      LEFT JOIN users u ON tl.user_id = u.id\n      WHERE tl.task_id = ?\n      ORDER BY tl.created_at ASC\n    ";
                        return [4 /*yield*/, this.db.query(query, [taskId])];
                    case 1:
                        logs = _a.sent();
                        processedLogs = logs.map(function (log) { return (__assign(__assign({}, log), { old_value: log.old_value ? JSON.parse(log.old_value) : null, new_value: log.new_value ? JSON.parse(log.new_value) : null })); });
                        if (format === 'csv') {
                            return [2 /*return*/, this.convertToCSV(processedLogs)];
                        }
                        return [2 /*return*/, processedLogs];
                }
            });
        });
    };
    /**
     * 转换为CSV格式
     */
    TaskLogService.prototype.convertToCSV = function (logs) {
        if (logs.length === 0)
            return '';
        var headers = ['时间', '用户', '操作', '描述', 'IP地址'];
        var csvRows = [headers.join(',')];
        logs.forEach(function (log) {
            var row = [
                log.created_at,
                log.user_name || '',
                log.action,
                log.description || '',
                log.ip_address || ''
            ];
            csvRows.push(row.map(function (field) { return "\"".concat(field, "\""); }).join(','));
        });
        return csvRows.join('\n');
    };
    /**
     * 批量记录日志
     */
    TaskLogService.prototype.logBatchActions = function (logs) {
        return __awaiter(this, void 0, void 0, function () {
            var query, values;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (logs.length === 0)
                            return [2 /*return*/];
                        query = "\n      INSERT INTO task_logs (\n        task_id, user_id, action, old_value, new_value, description, ip_address, user_agent\n      ) VALUES ?\n    ";
                        values = logs.map(function (log) { return [
                            log.task_id,
                            log.user_id,
                            log.action,
                            log.old_value ? JSON.stringify(log.old_value) : null,
                            log.new_value ? JSON.stringify(log.new_value) : null,
                            log.description,
                            log.ip_address,
                            log.user_agent
                        ]; });
                        return [4 /*yield*/, this.db.query(query, [values])];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return TaskLogService;
}());
exports.TaskLogService = TaskLogService;
