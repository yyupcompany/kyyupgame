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
exports.AdmissionNotificationService = void 0;
/**
 * 录取通知服务
 */
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var admission_notification_model_1 = require("../../models/admission-notification.model");
var admission_result_model_1 = require("../../models/admission-result.model");
var parent_student_relation_model_1 = require("../../models/parent-student-relation.model");
var user_model_1 = require("../../models/user.model");
var message_template_model_1 = require("../../models/message-template.model");
var apiError_1 = require("../../utils/apiError");
// 分页工具函数
var getPagination = function (page, size) {
    var limit = size ? +size : 10;
    var offset = page ? (page - 1) * limit : 0;
    return { limit: limit, offset: offset };
};
var getPagingData = function (data, count, page, limit) {
    var totalItems = count;
    var currentPage = page ? +page : 0;
    var totalPages = Math.ceil(totalItems / limit);
    return {
        totalItems: totalItems,
        data: data,
        totalPages: totalPages,
        currentPage: currentPage
    };
};
/**
 * 录取通知服务类
 */
var AdmissionNotificationService = /** @class */ (function () {
    function AdmissionNotificationService() {
    }
    /**
     * 创建录取通知
     * @param notificationData 通知数据
     * @param userId 当前用户ID
     * @returns 创建的通知
     */
    AdmissionNotificationService.prototype.createNotification = function (notificationData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, admission, parentRelation, template, notification, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 9, , 11]);
                        return [4 /*yield*/, admission_result_model_1.AdmissionResult.findByPk(notificationData.admissionId)];
                    case 3:
                        admission = _a.sent();
                        if (!admission) {
                            throw new apiError_1.ApiError(404, '录取结果不存在');
                        }
                        // 检查录取状态是否为已录取
                        if (admission.status !== admission_result_model_1.AdmissionStatus.ADMITTED && admission.status !== admission_result_model_1.AdmissionStatus.CONFIRMED) {
                            throw new apiError_1.ApiError(400, "\u5F53\u524D\u5F55\u53D6\u72B6\u6001(".concat(admission.status, ")\u4E0D\u5141\u8BB8\u53D1\u9001\u901A\u77E5"));
                        }
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findByPk(notificationData.parentId)];
                    case 4:
                        parentRelation = _a.sent();
                        if (!parentRelation) {
                            throw new apiError_1.ApiError(404, '家长关系不存在');
                        }
                        if (!notificationData.templateId) return [3 /*break*/, 6];
                        return [4 /*yield*/, message_template_model_1.MessageTemplate.findByPk(notificationData.templateId)];
                    case 5:
                        template = _a.sent();
                        if (!template) {
                            throw new apiError_1.ApiError(404, '消息模板不存在');
                        }
                        _a.label = 6;
                    case 6: return [4 /*yield*/, admission_notification_model_1.AdmissionNotification.create(__assign(__assign({}, notificationData), { status: admission_notification_model_1.NotificationStatus.PENDING, createdBy: userId, updatedBy: userId }), { transaction: transaction })];
                    case 7:
                        notification = _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 8:
                        _a.sent();
                        return [2 /*return*/, notification];
                    case 9:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 10:
                        _a.sent();
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取通知详情
     * @param id 通知ID
     * @returns 通知详情
     */
    AdmissionNotificationService.prototype.getNotificationById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var notification;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, admission_notification_model_1.AdmissionNotification.findByPk(id, {
                            include: [
                                {
                                    model: admission_result_model_1.AdmissionResult,
                                    as: 'admissionResult'
                                },
                                {
                                    model: parent_student_relation_model_1.ParentStudentRelation,
                                    as: 'parentRelation',
                                    attributes: ['id']
                                },
                                {
                                    model: user_model_1.User,
                                    as: 'creator',
                                    attributes: ['id', 'username', 'name']
                                },
                                {
                                    model: message_template_model_1.MessageTemplate,
                                    as: 'template',
                                    attributes: ['id', 'name', 'content']
                                },
                            ]
                        })];
                    case 1:
                        notification = _a.sent();
                        if (!notification) {
                            throw new apiError_1.ApiError(404, '通知不存在');
                        }
                        return [2 /*return*/, notification];
                }
            });
        });
    };
    /**
     * 更新通知
     * @param id 通知ID
     * @param notificationData 通知数据
     * @param userId 当前用户ID
     * @returns 更新后的通知
     */
    AdmissionNotificationService.prototype.updateNotification = function (id, notificationData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, notification, parentRelation, template, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 12]);
                        return [4 /*yield*/, admission_notification_model_1.AdmissionNotification.findByPk(id)];
                    case 3:
                        notification = _a.sent();
                        if (!notification) {
                            throw new apiError_1.ApiError(404, '通知不存在');
                        }
                        // 检查通知状态是否允许更新
                        if (notification.status !== admission_notification_model_1.NotificationStatus.PENDING && notification.status !== admission_notification_model_1.NotificationStatus.FAILED) {
                            throw new apiError_1.ApiError(400, "\u5F53\u524D\u72B6\u6001(".concat(notification.status, ")\u4E0D\u5141\u8BB8\u66F4\u65B0\u901A\u77E5"));
                        }
                        if (!(notificationData.parentId && notificationData.parentId !== notification.parentId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findByPk(notificationData.parentId)];
                    case 4:
                        parentRelation = _a.sent();
                        if (!parentRelation) {
                            throw new apiError_1.ApiError(404, '家长关系不存在');
                        }
                        _a.label = 5;
                    case 5:
                        if (!(notificationData.templateId && notificationData.templateId !== notification.templateId)) return [3 /*break*/, 7];
                        return [4 /*yield*/, message_template_model_1.MessageTemplate.findByPk(notificationData.templateId)];
                    case 6:
                        template = _a.sent();
                        if (!template) {
                            throw new apiError_1.ApiError(404, '消息模板不存在');
                        }
                        _a.label = 7;
                    case 7: 
                    // 更新通知
                    return [4 /*yield*/, notification.update(__assign(__assign({}, notificationData), { updatedBy: userId }), { transaction: transaction })];
                    case 8:
                        // 更新通知
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, this.getNotificationById(id)];
                    case 10:
                        error_2 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 11:
                        _a.sent();
                        throw error_2;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除通知
     * @param id 通知ID
     * @returns 是否删除成功
     */
    AdmissionNotificationService.prototype.deleteNotification = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, notification, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, admission_notification_model_1.AdmissionNotification.findByPk(id)];
                    case 3:
                        notification = _a.sent();
                        if (!notification) {
                            throw new apiError_1.ApiError(404, '通知不存在');
                        }
                        // 检查通知状态是否允许删除
                        if (notification.status !== admission_notification_model_1.NotificationStatus.PENDING && notification.status !== admission_notification_model_1.NotificationStatus.FAILED) {
                            throw new apiError_1.ApiError(400, "\u5F53\u524D\u72B6\u6001(".concat(notification.status, ")\u4E0D\u5141\u8BB8\u5220\u9664\u901A\u77E5"));
                        }
                        // 删除通知
                        return [4 /*yield*/, notification.destroy({ transaction: transaction })];
                    case 4:
                        // 删除通知
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
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
     * 获取通知列表
     * @param filters 过滤条件
     * @param page 页码
     * @param size 每页大小
     * @returns 通知列表
     */
    AdmissionNotificationService.prototype.getNotifications = function (filters, page, size) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, offset, condition, _b, count, rows;
            var _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = getPagination(page, size), limit = _a.limit, offset = _a.offset;
                        condition = {};
                        // 添加过滤条件
                        if (filters.studentName) {
                            condition.studentName = (_c = {}, _c[sequelize_1.Op.like] = "%".concat(filters.studentName, "%"), _c);
                        }
                        if (filters.status) {
                            condition.status = filters.status;
                        }
                        if (filters.method) {
                            condition.method = filters.method;
                        }
                        if (filters.startDate) {
                            condition.createdAt = (_d = {}, _d[sequelize_1.Op.gte] = filters.startDate, _d);
                        }
                        if (filters.endDate) {
                            condition.createdAt = __assign(__assign({}, condition.createdAt), (_e = {}, _e[sequelize_1.Op.lte] = filters.endDate, _e));
                        }
                        return [4 /*yield*/, admission_notification_model_1.AdmissionNotification.findAndCountAll({
                                where: condition,
                                include: [
                                    {
                                        model: admission_result_model_1.AdmissionResult,
                                        as: 'admissionResult'
                                    },
                                    {
                                        model: parent_student_relation_model_1.ParentStudentRelation,
                                        as: 'parentRelation',
                                        attributes: ['id']
                                    },
                                ],
                                limit: limit,
                                offset: offset,
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        _b = _f.sent(), count = _b.count, rows = _b.rows;
                        return [2 /*return*/, getPagingData(rows, count, page, limit)];
                }
            });
        });
    };
    /**
     * 发送通知
     * @param id 通知ID
     * @param userId 当前用户ID
     * @returns 发送后的通知
     */
    AdmissionNotificationService.prototype.sendNotification = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, notification, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.getNotificationById(id)];
                    case 3:
                        notification = _a.sent();
                        // 检查状态
                        if (notification.status !== admission_notification_model_1.NotificationStatus.PENDING) {
                            throw new apiError_1.ApiError(400, "\u5F53\u524D\u72B6\u6001(".concat(notification.status, ")\u4E0D\u5141\u8BB8\u53D1\u9001\u901A\u77E5"));
                        }
                        // 更新状态为已发送
                        return [4 /*yield*/, notification.update({
                                status: admission_notification_model_1.NotificationStatus.SENT,
                                sentTime: new Date(),
                                updatedBy: userId
                            }, { transaction: transaction })];
                    case 4:
                        // 更新状态为已发送
                        _a.sent();
                        // TODO: 实现真正的发送逻辑，如调用短信、邮件API
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        // TODO: 实现真正的发送逻辑，如调用短信、邮件API
                        _a.sent();
                        return [2 /*return*/, notification];
                    case 6:
                        error_4 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 标记为已送达
     * @param id 通知ID
     * @param userId 当前用户ID
     * @returns 更新后的通知
     */
    AdmissionNotificationService.prototype.markDelivered = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, notification, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.getNotificationById(id)];
                    case 3:
                        notification = _a.sent();
                        // 检查状态
                        if (notification.status !== admission_notification_model_1.NotificationStatus.SENT) {
                            throw new apiError_1.ApiError(400, "\u5F53\u524D\u72B6\u6001(".concat(notification.status, ")\u65E0\u6CD5\u6807\u8BB0\u4E3A\u5DF2\u9001\u8FBE"));
                        }
                        return [4 /*yield*/, notification.update({
                                status: admission_notification_model_1.NotificationStatus.DELIVERED,
                                deliveredTime: new Date(),
                                updatedBy: userId
                            }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, notification];
                    case 6:
                        error_5 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_5;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 标记为已读
     * @param id 通知ID
     * @param userId 当前用户ID
     * @returns 更新后的通知
     */
    AdmissionNotificationService.prototype.markRead = function (id, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, notification, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.getNotificationById(id)];
                    case 3:
                        notification = _a.sent();
                        return [4 /*yield*/, notification.update({
                                status: admission_notification_model_1.NotificationStatus.READ,
                                readTime: new Date(),
                                updatedBy: userId
                            }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, notification];
                    case 6:
                        error_6 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_6;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录回复
     * @param id 通知ID
     * @param responseData 回复数据
     * @param userId 当前用户ID
     * @returns 更新后的通知
     */
    AdmissionNotificationService.prototype.recordResponse = function (id, responseData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, notification, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.getNotificationById(id)];
                    case 3:
                        notification = _a.sent();
                        return [4 /*yield*/, notification.update({
                                response: responseData.response,
                                updatedBy: userId
                            }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, notification];
                    case 6:
                        error_7 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_7;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    AdmissionNotificationService.prototype.doSendNotification = function (notification, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var admission, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        // 根据通知方式发送通知
                        switch (notification.method) {
                            case admission_notification_model_1.NotificationMethod.SMS:
                                // 实现短信发送逻辑
                                console.log("\u53D1\u9001\u77ED\u4FE1\u901A\u77E5\u7ED9\u5BB6\u957FID: ".concat(notification.parentId, ", \u5185\u5BB9: ").concat(notification.content));
                                break;
                            case admission_notification_model_1.NotificationMethod.EMAIL:
                                // 实现邮件发送逻辑
                                console.log("\u53D1\u9001\u90AE\u4EF6\u901A\u77E5\u7ED9\u5BB6\u957FID: ".concat(notification.parentId, ", \u5185\u5BB9: ").concat(notification.content));
                                break;
                            case admission_notification_model_1.NotificationMethod.SYSTEM:
                                // 实现系统通知发送逻辑
                                console.log("\u53D1\u9001\u7CFB\u7EDF\u901A\u77E5\u7ED9\u5BB6\u957FID: ".concat(notification.parentId, ", \u5185\u5BB9: ").concat(notification.content));
                                break;
                            default:
                                console.warn("\u672A\u77E5\u7684\u901A\u77E5\u65B9\u5F0F: ".concat(notification.method));
                                return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, admission_result_model_1.AdmissionResult.findByPk(notification.admissionId, { transaction: transaction })];
                    case 1:
                        admission = _a.sent();
                        if (!admission) return [3 /*break*/, 3];
                        return [4 /*yield*/, admission.update({
                                notificationDate: new Date(),
                                notificationMethod: notification.method,
                                updatedBy: notification.updatedBy
                            }, { transaction: transaction })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, true];
                    case 4:
                        error_8 = _a.sent();
                        console.error('发送通知失败:', error_8);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return AdmissionNotificationService;
}());
exports.AdmissionNotificationService = AdmissionNotificationService;
// 导出服务实例
exports["default"] = new AdmissionNotificationService();
