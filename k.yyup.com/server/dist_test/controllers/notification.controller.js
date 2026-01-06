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
exports.getUnreadCount = exports.markAllAsRead = exports.deleteNotification = exports.markAsRead = exports.updateNotification = exports.getNotificationById = exports.createNotification = exports.getNotifications = void 0;
var apiResponse_1 = require("../utils/apiResponse");
var init_1 = require("../init");
// 获取数据库实例
var getSequelizeInstance = function () {
    return init_1.sequelize;
};
// 获取通知列表
var getNotifications = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, userId, userRole, _a, _b, page, _c, limit, type, status_1, whereClause, replacements, query, notifications, notificationsList, error_1;
    var _d, _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 2, , 3]);
                db = getSequelizeInstance();
                userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.id;
                userRole = (_e = req.user) === null || _e === void 0 ? void 0 : _e.role;
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c, type = _a.type, status_1 = _a.status;
                whereClause = 'WHERE deleted_at IS NULL';
                replacements = {};
                // 教师权限过滤：只能看到发给自己的通知或公开通知
                if (userRole === 'teacher') {
                    whereClause += ' AND (target_type = "all" OR (target_type = "user" AND target_id = :userId) OR (target_type = "role" AND target_id = "teacher"))';
                    replacements.userId = userId;
                }
                if (type) {
                    whereClause += ' AND type = :type';
                    replacements.type = type;
                }
                if (status_1) {
                    whereClause += ' AND status = :status';
                    replacements.status = status_1;
                }
                query = "SELECT * FROM notifications ".concat(whereClause, " ORDER BY created_at DESC LIMIT :limit OFFSET :offset");
                replacements.limit = Number(limit);
                replacements.offset = (Number(page) - 1) * Number(limit);
                return [4 /*yield*/, db.query(query, {
                        replacements: replacements,
                        type: 'SELECT'
                    })];
            case 1:
                notifications = _f.sent();
                notificationsList = Array.isArray(notifications) ? notifications : [];
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        items: notificationsList,
                        total: notificationsList.length,
                        page: Number(page),
                        pageSize: Number(limit),
                        totalPages: Math.ceil(notificationsList.length / Number(limit))
                    })];
            case 2:
                error_1 = _f.sent();
                console.error('Notification error:', error_1);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_1, '获取通知列表失败')];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getNotifications = getNotifications;
// 创建通知
var createNotification = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '创建功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '创建通知失败')];
        }
        return [2 /*return*/];
    });
}); };
exports.createNotification = createNotification;
// 获取通知详情
var getNotificationById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '详情功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '获取通知详情失败')];
        }
        return [2 /*return*/];
    });
}); };
exports.getNotificationById = getNotificationById;
// 更新通知
var updateNotification = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '更新功能暂未实现', 'NOT_IMPLEMENTED', 501)];
        }
        catch (error) {
            return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error, '更新通知失败')];
        }
        return [2 /*return*/];
    });
}); };
exports.updateNotification = updateNotification;
// 标记通知已读
var markAsRead = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, db, notification, updatedNotification, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                id = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!id) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '通知ID不能为空', 'VALIDATION_ERROR', 400)];
                }
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query('SELECT * FROM notifications WHERE id = ? LIMIT 1', {
                        replacements: [id],
                        type: 'SELECT'
                    })];
            case 1:
                notification = _b.sent();
                if (!notification || notification.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '通知不存在', 'NOT_FOUND', 404)];
                }
                // 更新通知为已读状态
                return [4 /*yield*/, db.query('UPDATE notifications SET is_read = 1, read_at = NOW(), updated_at = NOW() WHERE id = ?', {
                        replacements: [id],
                        type: 'UPDATE'
                    })];
            case 2:
                // 更新通知为已读状态
                _b.sent();
                return [4 /*yield*/, db.query('SELECT * FROM notifications WHERE id = ? LIMIT 1', {
                        replacements: [id],
                        type: 'SELECT'
                    })];
            case 3:
                updatedNotification = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, updatedNotification && updatedNotification.length > 0 ? updatedNotification[0] : null)];
            case 4:
                error_2 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '标记通知已读失败')];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.markAsRead = markAsRead;
// 删除通知
var deleteNotification = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, db, notification, softDeleteError_1, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                id = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!id) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '通知ID不能为空', 'VALIDATION_ERROR', 400)];
                }
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query('SELECT * FROM notifications WHERE id = ? LIMIT 1', {
                        replacements: [id],
                        type: 'SELECT'
                    })];
            case 1:
                notification = _b.sent();
                if (!notification || notification.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '通知不存在', 'NOT_FOUND', 404)];
                }
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 6]);
                // 尝试软删除
                return [4 /*yield*/, db.query('UPDATE notifications SET deleted_at = NOW(), updated_at = NOW() WHERE id = ?', {
                        replacements: [id],
                        type: 'UPDATE'
                    })];
            case 3:
                // 尝试软删除
                _b.sent();
                return [3 /*break*/, 6];
            case 4:
                softDeleteError_1 = _b.sent();
                // 如果没有deleted_at字段，则直接删除
                return [4 /*yield*/, db.query('DELETE FROM notifications WHERE id = ?', {
                        replacements: [id],
                        type: 'DELETE'
                    })];
            case 5:
                // 如果没有deleted_at字段，则直接删除
                _b.sent();
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { message: '通知删除成功' })];
            case 7:
                error_3 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_3, '删除通知失败')];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.deleteNotification = deleteNotification;
// 批量标记已读
var markAllAsRead = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, notification_ids, db, placeholders, result, affectedRows, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                notification_ids = req.body.notification_ids;
                db = getSequelizeInstance();
                if (!(notification_ids && Array.isArray(notification_ids) && notification_ids.length > 0)) return [3 /*break*/, 2];
                placeholders = notification_ids.map(function () { return '?'; }).join(',');
                return [4 /*yield*/, db.query("UPDATE notifications SET is_read = 1, read_at = NOW(), updated_at = NOW() WHERE id IN (".concat(placeholders, ")"), {
                        replacements: notification_ids,
                        type: 'UPDATE'
                    })];
            case 1:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        message: "\u6210\u529F\u6807\u8BB0 ".concat(notification_ids.length, " \u6761\u901A\u77E5\u4E3A\u5DF2\u8BFB"),
                        count: notification_ids.length
                    })];
            case 2: return [4 /*yield*/, db.query('UPDATE notifications SET is_read = 1, read_at = NOW(), updated_at = NOW() WHERE is_read = 0', { type: 'UPDATE' })];
            case 3:
                result = _b.sent();
                affectedRows = Array.isArray(result) ? result[1] : 0;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                        message: "\u6210\u529F\u6807\u8BB0 ".concat(affectedRows, " \u6761\u901A\u77E5\u4E3A\u5DF2\u8BFB"),
                        count: affectedRows
                    })];
            case 4: return [3 /*break*/, 6];
            case 5:
                error_4 = _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_4, '批量标记已读失败')];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.markAllAsRead = markAllAsRead;
// 获取未读通知数
var getUnreadCount = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, result, resultList, count, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query('SELECT COUNT(*) as count FROM notifications WHERE is_read = 0', { type: 'SELECT' })];
            case 1:
                result = _a.sent();
                resultList = Array.isArray(result) ? result : [];
                count = resultList.length > 0 ? resultList[0].count : 0;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { count: count })];
            case 2:
                error_5 = _a.sent();
                console.error('Unread count error:', error_5);
                return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_5, '获取未读通知数失败')];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getUnreadCount = getUnreadCount;
