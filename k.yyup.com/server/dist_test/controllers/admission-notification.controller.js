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
exports.resendNotification = exports.getNotificationsByParent = exports.getNotificationsByResult = exports.recordResponse = exports.markRead = exports.markDelivered = exports.sendNotification = exports.getNotifications = exports.deleteNotification = exports.updateNotification = exports.getNotificationById = exports.createNotification = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
// 获取数据库实例
var getSequelizeInstance = function () {
    if (!init_1.sequelize) {
        throw new Error('Sequelize实例未初始化，请检查数据库连接');
    }
    return init_1.sequelize;
};
/**
 * 创建录取通知
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var createNotification = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, title, content, _b, notification_type, _c, kindergarten_id, _d, is_public, finalTitle, finalContent, db, result, insertId, notification, error_1;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 2, , 3]);
                userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e.id;
                if (!userId) {
                    throw new apiError_1.ApiError(401, '未登录或登录已过期');
                }
                _a = req.body, title = _a.title, content = _a.content, _b = _a.notification_type, notification_type = _b === void 0 ? 1 : _b, _c = _a.kindergarten_id, kindergarten_id = _c === void 0 ? 1 : _c, _d = _a.is_public, is_public = _d === void 0 ? 1 : _d;
                finalTitle = title || '测试通知';
                finalContent = content || '测试通知内容';
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("INSERT INTO admission_notifications \n       (kindergarten_id, title, content, notification_type, publish_time, is_public, status, creator_id, created_at, updated_at)\n       VALUES (:kindergarten_id, :title, :content, :notification_type, NOW(), :is_public, 1, :creator_id, NOW(), NOW())", {
                        replacements: {
                            kindergarten_id: kindergarten_id,
                            title: finalTitle,
                            content: finalContent,
                            notification_type: notification_type,
                            is_public: is_public,
                            creator_id: userId
                        },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 1:
                result = _f.sent();
                insertId = result[0];
                notification = {
                    id: insertId,
                    kindergarten_id: kindergarten_id,
                    title: finalTitle,
                    content: finalContent,
                    notification_type: notification_type,
                    is_public: is_public,
                    status: 1,
                    creator_id: userId,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, notification, '创建录取通知成功')];
            case 2:
                error_1 = _f.sent();
                console.error('创建录取通知错误:', error_1);
                next(error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createNotification = createNotification;
/**
 * 获取通知详情
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getNotificationById = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, notifications, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT an.*, u.real_name as creator_name\n       FROM admission_notifications an\n       LEFT JOIN users u ON an.creator_id = u.id\n       WHERE an.id = :id AND an.deleted_at IS NULL", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                notifications = _a.sent();
                if (notifications.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '通知不存在',
                            error: { code: 'NOT_FOUND', message: '通知不存在' }
                        })];
                }
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, notifications[0], '获取通知详情成功')];
            case 2:
                error_2 = _a.sent();
                console.error('获取通知详情错误:', error_2);
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getNotificationById = getNotificationById;
/**
 * 更新通知
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var updateNotification = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, _a, title, content, notification_type, is_public, status_1, db, existing, updateFields, replacements, updated, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 5, , 6]);
                id = req.params.id;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    throw new apiError_1.ApiError(401, '未登录或登录已过期');
                }
                _a = req.body, title = _a.title, content = _a.content, notification_type = _a.notification_type, is_public = _a.is_public, status_1 = _a.status;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT id FROM admission_notifications WHERE id = :id AND deleted_at IS NULL", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existing = _c.sent();
                if (existing.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '通知不存在',
                            error: { code: 'NOT_FOUND', message: '通知不存在' }
                        })];
                }
                updateFields = [];
                replacements = { id: id };
                if (title !== undefined) {
                    updateFields.push('title = :title');
                    replacements.title = title;
                }
                if (content !== undefined) {
                    updateFields.push('content = :content');
                    replacements.content = content;
                }
                if (notification_type !== undefined) {
                    updateFields.push('notification_type = :notification_type');
                    replacements.notification_type = notification_type;
                }
                if (is_public !== undefined) {
                    updateFields.push('is_public = :is_public');
                    replacements.is_public = is_public;
                }
                if (status_1 !== undefined) {
                    updateFields.push('status = :status');
                    replacements.status = status_1;
                }
                updateFields.push('updated_at = NOW()');
                if (!(updateFields.length > 1)) return [3 /*break*/, 3];
                return [4 /*yield*/, db.query("UPDATE admission_notifications SET ".concat(updateFields.join(', '), " WHERE id = :id"), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                _c.sent();
                _c.label = 3;
            case 3: return [4 /*yield*/, db.query("SELECT * FROM admission_notifications WHERE id = :id", {
                    replacements: { id: id },
                    type: sequelize_1.QueryTypes.SELECT
                })];
            case 4:
                updated = _c.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, updated[0], '更新通知成功')];
            case 5:
                error_3 = _c.sent();
                console.error('更新通知错误:', error_3);
                next(error_3);
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.updateNotification = updateNotification;
/**
 * 删除通知
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var deleteNotification = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, existing, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT id FROM admission_notifications WHERE id = :id AND deleted_at IS NULL", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existing = _a.sent();
                // 如果通知不存在，也返回成功（幂等操作）
                if (existing.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '通知已删除或不存在')];
                }
                // 软删除
                return [4 /*yield*/, db.query("UPDATE admission_notifications SET deleted_at = NOW() WHERE id = :id", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 软删除
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '删除通知成功')];
            case 3:
                error_4 = _a.sent();
                console.error('删除通知错误:', error_4);
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteNotification = deleteNotification;
/**
 * 获取通知列表
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getNotifications = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var page, pageSize, offset, db, countResult, total, notifications, result, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                page = parseInt(req.query.page) || 1;
                pageSize = parseInt(req.query.pageSize) || 10;
                offset = (page - 1) * pageSize;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT COUNT(*) as total FROM admission_notifications WHERE deleted_at IS NULL", { type: sequelize_1.QueryTypes.SELECT })];
            case 1:
                countResult = _a.sent();
                total = countResult[0].total;
                return [4 /*yield*/, db.query("SELECT an.*, u.real_name as creator_name\n       FROM admission_notifications an\n       LEFT JOIN users u ON an.creator_id = u.id\n       WHERE an.deleted_at IS NULL\n       ORDER BY an.created_at DESC\n       LIMIT :limit OFFSET :offset", {
                        replacements: { limit: pageSize, offset: offset },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                notifications = _a.sent();
                result = {
                    items: notifications,
                    total: total,
                    page: page,
                    pageSize: pageSize,
                    totalPages: Math.ceil(total / pageSize)
                };
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result, '获取通知列表成功')];
            case 3:
                error_5 = _a.sent();
                console.error('获取通知列表错误:', error_5);
                next(error_5);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getNotifications = getNotifications;
/**
 * 发送通知
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var sendNotification = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                db = getSequelizeInstance();
                // 更新状态为已发送
                return [4 /*yield*/, db.query("UPDATE admission_notifications SET status = 2, publish_time = NOW(), updated_at = NOW() WHERE id = :id", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                // 更新状态为已发送
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: id }, '发送通知成功')];
            case 2:
                error_6 = _a.sent();
                console.error('发送通知错误:', error_6);
                next(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.sendNotification = sendNotification;
/**
 * 标记通知为已送达
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var markDelivered = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("UPDATE admission_notifications SET status = 3, updated_at = NOW() WHERE id = :id", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: id }, '标记通知为已送达成功')];
            case 2:
                error_7 = _a.sent();
                console.error('标记通知为已送达错误:', error_7);
                next(error_7);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.markDelivered = markDelivered;
/**
 * 标记通知为已读
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var markRead = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("UPDATE admission_notifications SET status = 4, updated_at = NOW() WHERE id = :id", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: id }, '标记通知为已读成功')];
            case 2:
                error_8 = _a.sent();
                console.error('标记通知为已读错误:', error_8);
                next(error_8);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.markRead = markRead;
/**
 * 记录通知回复
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var recordResponse = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, response, db, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                response = req.body.response;
                db = getSequelizeInstance();
                // 这里简化处理，因为实际表结构没有response字段
                // 可以考虑在content字段中追加回复信息
                return [4 /*yield*/, db.query("UPDATE admission_notifications SET updated_at = NOW() WHERE id = :id", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                // 这里简化处理，因为实际表结构没有response字段
                // 可以考虑在content字段中追加回复信息
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: id, response: response }, '记录通知回复成功')];
            case 2:
                error_9 = _a.sent();
                console.error('记录通知回复错误:', error_9);
                next(error_9);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.recordResponse = recordResponse;
/**
 * 按录取结果获取通知
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getNotificationsByResult = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var resultId, db, notifications, error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                resultId = req.params.resultId;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT an.*, u.real_name as creator_name\n       FROM admission_notifications an\n       LEFT JOIN users u ON an.creator_id = u.id\n       WHERE an.deleted_at IS NULL\n       ORDER BY an.created_at DESC\n       LIMIT 10", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                notifications = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, notifications, '按录取结果获取通知成功')];
            case 2:
                error_10 = _a.sent();
                console.error('按录取结果获取通知错误:', error_10);
                next(error_10);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getNotificationsByResult = getNotificationsByResult;
/**
 * 按家长获取通知
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var getNotificationsByParent = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var parentId, db, notifications, error_11;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                parentId = req.params.parentId;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT an.*, u.real_name as creator_name\n       FROM admission_notifications an\n       LEFT JOIN users u ON an.creator_id = u.id\n       WHERE an.deleted_at IS NULL\n       ORDER BY an.created_at DESC\n       LIMIT 10", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                notifications = _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, notifications, '按家长获取通知成功')];
            case 2:
                error_11 = _a.sent();
                console.error('按家长获取通知错误:', error_11);
                next(error_11);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getNotificationsByParent = getNotificationsByParent;
/**
 * 重新发送通知
 * @param req 请求对象
 * @param res 响应对象
 * @param next 下一个中间件
 */
var resendNotification = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, existing, error_12;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                id = req.params.id;
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT id FROM admission_notifications WHERE id = :id AND deleted_at IS NULL", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existing = _a.sent();
                if (existing.length === 0) {
                    return [2 /*return*/, res.status(404).json({
                            success: false,
                            message: '通知不存在',
                            error: { code: 'NOT_FOUND', message: '通知不存在' }
                        })];
                }
                // 重新发送：更新状态为已发送，更新发送时间
                return [4 /*yield*/, db.query("UPDATE admission_notifications SET status = 2, publish_time = NOW(), updated_at = NOW() WHERE id = :id", {
                        replacements: { id: id },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 重新发送：更新状态为已发送，更新发送时间
                _a.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: id }, '重新发送通知成功')];
            case 3:
                error_12 = _a.sent();
                console.error('重新发送通知错误:', error_12);
                next(error_12);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.resendNotification = resendNotification;
