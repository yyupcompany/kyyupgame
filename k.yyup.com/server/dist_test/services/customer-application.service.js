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
exports.CustomerApplicationService = void 0;
var customer_application_model_1 = require("../models/customer-application.model");
var parent_model_1 = require("../models/parent.model");
var user_model_1 = require("../models/user.model");
var notification_model_1 = require("../models/notification.model");
/**
 * 客户申请服务
 */
var CustomerApplicationService = /** @class */ (function () {
    function CustomerApplicationService() {
    }
    /**
     * 教师申请客户（支持批量）
     */
    CustomerApplicationService.prototype.applyForCustomers = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var customerIds, teacherId, kindergartenId, applyReason, results, _i, customerIds_1, customerId, customer, existingApplication, application, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        customerIds = params.customerIds, teacherId = params.teacherId, kindergartenId = params.kindergartenId, applyReason = params.applyReason;
                        results = {
                            successCount: 0,
                            failedCount: 0,
                            applicationIds: [],
                            failedCustomers: []
                        };
                        _i = 0, customerIds_1 = customerIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < customerIds_1.length)) return [3 /*break*/, 9];
                        customerId = customerIds_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 8]);
                        return [4 /*yield*/, parent_model_1.Parent.findByPk(customerId)];
                    case 3:
                        customer = _a.sent();
                        if (!customer) {
                            results.failedCount++;
                            results.failedCustomers.push({
                                customerId: customerId,
                                reason: '客户不存在'
                            });
                            return [3 /*break*/, 8];
                        }
                        // 2. 检查客户是否已分配
                        if (customer.assignedTeacherId && customer.assignedTeacherId !== teacherId) {
                            results.failedCount++;
                            results.failedCustomers.push({
                                customerId: customerId,
                                reason: "\u5BA2\u6237\u5DF2\u5206\u914D\u7ED9\u5176\u4ED6\u6559\u5E08"
                            });
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, customer_application_model_1.CustomerApplication.findOne({
                                where: {
                                    customerId: customerId,
                                    teacherId: teacherId,
                                    status: customer_application_model_1.CustomerApplicationStatus.PENDING
                                }
                            })];
                    case 4:
                        existingApplication = _a.sent();
                        if (existingApplication) {
                            results.failedCount++;
                            results.failedCustomers.push({
                                customerId: customerId,
                                reason: '已有待审批的申请'
                            });
                            return [3 /*break*/, 8];
                        }
                        return [4 /*yield*/, customer_application_model_1.CustomerApplication.create({
                                customerId: customerId,
                                teacherId: teacherId,
                                kindergartenId: kindergartenId,
                                status: customer_application_model_1.CustomerApplicationStatus.PENDING,
                                applyReason: applyReason,
                                appliedAt: new Date()
                            })];
                    case 5:
                        application = _a.sent();
                        results.successCount++;
                        results.applicationIds.push(application.id);
                        // 5. 发送通知给园长
                        return [4 /*yield*/, this.sendApplicationNotificationToPrincipal(application.id, teacherId, customerId, kindergartenId)];
                    case 6:
                        // 5. 发送通知给园长
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        error_1 = _a.sent();
                        console.error("\u7533\u8BF7\u5BA2\u6237 ".concat(customerId, " \u5931\u8D25:"), error_1);
                        results.failedCount++;
                        results.failedCustomers.push({
                            customerId: customerId,
                            reason: '系统错误'
                        });
                        return [3 /*break*/, 8];
                    case 8:
                        _i++;
                        return [3 /*break*/, 1];
                    case 9: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 发送申请通知给园长
     */
    CustomerApplicationService.prototype.sendApplicationNotificationToPrincipal = function (applicationId, teacherId, customerId, kindergartenId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var teacher, customer, principal, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, user_model_1.User.findByPk(teacherId, {
                                attributes: ['id', 'username', 'real_name']
                            })];
                    case 1:
                        teacher = _d.sent();
                        return [4 /*yield*/, parent_model_1.Parent.findByPk(customerId, {
                                attributes: ['id', 'name', 'phone']
                            })];
                    case 2:
                        customer = _d.sent();
                        if (!teacher || !customer) {
                            console.error('教师或客户信息不存在');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: __assign({ role: 'principal' }, (kindergartenId && { kindergarten_id: kindergartenId })),
                                attributes: ['id']
                            })];
                    case 3:
                        principal = _d.sent();
                        if (!principal) {
                            console.error('未找到园长');
                            return [2 /*return*/];
                        }
                        // 创建通知
                        return [4 /*yield*/, notification_model_1.Notification.create({
                                title: '客户申请通知',
                                content: "\u6559\u5E08 ".concat(teacher.realName || teacher.username, " \u7533\u8BF7\u8DDF\u8E2A\u5BA2\u6237 ").concat(((_a = customer.user) === null || _a === void 0 ? void 0 : _a.realName) || ((_b = customer.user) === null || _b === void 0 ? void 0 : _b.username) || '未知客户', "\uFF08").concat(((_c = customer.user) === null || _c === void 0 ? void 0 : _c.phone) || '无电话', "\uFF09"),
                                type: notification_model_1.NotificationType.SYSTEM,
                                status: notification_model_1.NotificationStatus.UNREAD,
                                userId: principal.id,
                                sourceId: applicationId,
                                sourceType: 'customer_application',
                                senderId: teacherId
                            })];
                    case 4:
                        // 创建通知
                        _d.sent();
                        console.log("\u2705 \u5DF2\u53D1\u9001\u7533\u8BF7\u901A\u77E5\u7ED9\u56ED\u957F (ID: ".concat(principal.id, ")"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _d.sent();
                        console.error('发送申请通知失败:', error_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师的申请记录
     */
    CustomerApplicationService.prototype.getTeacherApplications = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var teacherId, status, page, pageSize, where, _a, rows, count;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        teacherId = params.teacherId, status = params.status, page = params.page, pageSize = params.pageSize;
                        where = { teacherId: teacherId };
                        if (status) {
                            where.status = status;
                        }
                        return [4 /*yield*/, customer_application_model_1.CustomerApplication.findAndCountAll({
                                where: where,
                                include: [
                                    {
                                        model: parent_model_1.Parent,
                                        as: 'customer',
                                        attributes: ['id', 'name', 'phone', 'source', 'follow_status']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'principal',
                                        attributes: ['id', 'username', 'real_name']
                                    }
                                ],
                                order: [['appliedAt', 'DESC']],
                                limit: pageSize,
                                offset: (page - 1) * pageSize
                            })];
                    case 1:
                        _a = _b.sent(), rows = _a.rows, count = _a.count;
                        return [2 /*return*/, {
                                items: rows,
                                total: count,
                                page: page,
                                pageSize: pageSize
                            }];
                }
            });
        });
    };
    /**
     * 获取园长待审批的申请列表
     */
    CustomerApplicationService.prototype.getPrincipalApplications = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergartenId, status, teacherId, customerId, page, pageSize, where, _a, rows, count;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        kindergartenId = params.kindergartenId, status = params.status, teacherId = params.teacherId, customerId = params.customerId, page = params.page, pageSize = params.pageSize;
                        where = {};
                        if (kindergartenId) {
                            where.kindergartenId = kindergartenId;
                        }
                        if (status) {
                            where.status = status;
                        }
                        if (teacherId) {
                            where.teacherId = teacherId;
                        }
                        if (customerId) {
                            where.customerId = customerId;
                        }
                        return [4 /*yield*/, customer_application_model_1.CustomerApplication.findAndCountAll({
                                where: where,
                                include: [
                                    {
                                        model: parent_model_1.Parent,
                                        as: 'customer',
                                        attributes: ['id', 'name', 'phone', 'source', 'follow_status', 'assigned_teacher_id']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'teacher',
                                        attributes: ['id', 'username', 'real_name']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'principal',
                                        attributes: ['id', 'username', 'real_name']
                                    }
                                ],
                                order: [['appliedAt', 'DESC']],
                                limit: pageSize,
                                offset: (page - 1) * pageSize
                            })];
                    case 1:
                        _a = _b.sent(), rows = _a.rows, count = _a.count;
                        return [2 /*return*/, {
                                items: rows,
                                total: count,
                                page: page,
                                pageSize: pageSize
                            }];
                }
            });
        });
    };
    /**
     * 园长审批申请
     */
    CustomerApplicationService.prototype.reviewApplication = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var applicationId, principalId, action, rejectReason, application, customer;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        applicationId = params.applicationId, principalId = params.principalId, action = params.action, rejectReason = params.rejectReason;
                        return [4 /*yield*/, customer_application_model_1.CustomerApplication.findByPk(applicationId, {
                                include: [
                                    {
                                        model: parent_model_1.Parent,
                                        as: 'customer'
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'teacher'
                                    }
                                ]
                            })];
                    case 1:
                        application = _a.sent();
                        if (!application) {
                            throw new Error('申请记录不存在');
                        }
                        if (application.status !== customer_application_model_1.CustomerApplicationStatus.PENDING) {
                            throw new Error('该申请已被处理');
                        }
                        // 2. 更新申请状态
                        application.status = action === 'approve' ? customer_application_model_1.CustomerApplicationStatus.APPROVED : customer_application_model_1.CustomerApplicationStatus.REJECTED;
                        application.principalId = principalId;
                        application.reviewedAt = new Date();
                        if (action === 'reject' && rejectReason) {
                            application.rejectReason = rejectReason;
                        }
                        return [4 /*yield*/, application.save()];
                    case 2:
                        _a.sent();
                        if (!(action === 'approve')) return [3 /*break*/, 5];
                        return [4 /*yield*/, parent_model_1.Parent.findByPk(application.customerId)];
                    case 3:
                        customer = _a.sent();
                        if (!customer) return [3 /*break*/, 5];
                        customer.assignedTeacherId = application.teacherId;
                        return [4 /*yield*/, customer.save()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: 
                    // 4. 发送审批结果通知给教师
                    return [4 /*yield*/, this.sendReviewNotificationToTeacher(application, action, rejectReason)];
                    case 6:
                        // 4. 发送审批结果通知给教师
                        _a.sent();
                        return [2 /*return*/, application];
                }
            });
        });
    };
    /**
     * 发送审批结果通知给教师
     */
    CustomerApplicationService.prototype.sendReviewNotificationToTeacher = function (application, action, rejectReason) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var customer, _d, title, customerName, customerPhone, content, error_3;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 4, , 5]);
                        _d = application.customer;
                        if (_d) return [3 /*break*/, 2];
                        return [4 /*yield*/, parent_model_1.Parent.findByPk(application.customerId)];
                    case 1:
                        _d = (_e.sent());
                        _e.label = 2;
                    case 2:
                        customer = _d;
                        if (!customer) {
                            console.error('客户信息不存在');
                            return [2 /*return*/];
                        }
                        title = action === 'approve' ? '客户申请已通过' : '客户申请已拒绝';
                        customerName = ((_a = customer.user) === null || _a === void 0 ? void 0 : _a.realName) || ((_b = customer.user) === null || _b === void 0 ? void 0 : _b.username) || '未知客户';
                        customerPhone = ((_c = customer.user) === null || _c === void 0 ? void 0 : _c.phone) || '无电话';
                        content = action === 'approve'
                            ? "\u60A8\u7533\u8BF7\u7684\u5BA2\u6237 ".concat(customerName, "\uFF08").concat(customerPhone, "\uFF09 \u5DF2\u5206\u914D\u7ED9\u60A8")
                            : "\u60A8\u7533\u8BF7\u7684\u5BA2\u6237 ".concat(customerName, "\uFF08").concat(customerPhone, "\uFF09 \u672A\u901A\u8FC7\u5BA1\u6279").concat(rejectReason ? "\uFF0C\u539F\u56E0\uFF1A".concat(rejectReason) : '');
                        return [4 /*yield*/, notification_model_1.Notification.create({
                                title: title,
                                content: content,
                                type: notification_model_1.NotificationType.SYSTEM,
                                status: notification_model_1.NotificationStatus.UNREAD,
                                userId: application.teacherId,
                                sourceId: application.id,
                                sourceType: 'customer_application',
                                senderId: application.principalId
                            })];
                    case 3:
                        _e.sent();
                        console.log("\u2705 \u5DF2\u53D1\u9001\u5BA1\u6279\u7ED3\u679C\u901A\u77E5\u7ED9\u6559\u5E08 (ID: ".concat(application.teacherId, ")"));
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _e.sent();
                        console.error('发送审批结果通知失败:', error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量审批申请
     */
    CustomerApplicationService.prototype.batchReviewApplications = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var applicationIds, principalId, action, rejectReason, results, _i, applicationIds_1, applicationId, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        applicationIds = params.applicationIds, principalId = params.principalId, action = params.action, rejectReason = params.rejectReason;
                        results = {
                            successCount: 0,
                            failedCount: 0,
                            failedApplications: []
                        };
                        _i = 0, applicationIds_1 = applicationIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < applicationIds_1.length)) return [3 /*break*/, 6];
                        applicationId = applicationIds_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.reviewApplication({
                                applicationId: applicationId,
                                principalId: principalId,
                                action: action,
                                rejectReason: rejectReason
                            })];
                    case 3:
                        _a.sent();
                        results.successCount++;
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        console.error("\u5BA1\u6279\u7533\u8BF7 ".concat(applicationId, " \u5931\u8D25:"), error_4);
                        results.failedCount++;
                        results.failedApplications.push({
                            applicationId: applicationId,
                            reason: error_4.message || '系统错误'
                        });
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 获取申请详情
     */
    CustomerApplicationService.prototype.getApplicationDetail = function (applicationId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var application;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, customer_application_model_1.CustomerApplication.findByPk(applicationId, {
                            include: [
                                {
                                    model: parent_model_1.Parent,
                                    as: 'customer',
                                    attributes: ['id', 'name', 'phone', 'source', 'follow_status', 'assigned_teacher_id', 'created_at']
                                },
                                {
                                    model: user_model_1.User,
                                    as: 'teacher',
                                    attributes: ['id', 'username', 'real_name', 'phone']
                                },
                                {
                                    model: user_model_1.User,
                                    as: 'principal',
                                    attributes: ['id', 'username', 'real_name']
                                }
                            ]
                        })];
                    case 1:
                        application = _a.sent();
                        if (!application) {
                            throw new Error('申请记录不存在');
                        }
                        // 权限检查：只有申请教师、审批园长或管理员可以查看
                        if (application.teacherId !== userId && application.principalId !== userId) {
                            // 这里可以添加更严格的权限检查
                            console.warn("\u7528\u6237 ".concat(userId, " \u5C1D\u8BD5\u67E5\u770B\u4E0D\u5C5E\u4E8E\u81EA\u5DF1\u7684\u7533\u8BF7 ").concat(applicationId));
                        }
                        return [2 /*return*/, application];
                }
            });
        });
    };
    /**
     * 获取申请统计
     */
    CustomerApplicationService.prototype.getApplicationStats = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, userRole, kindergartenId, stats, applications, where, applications;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        userId = params.userId, userRole = params.userRole, kindergartenId = params.kindergartenId;
                        stats = {
                            total: 0,
                            pending: 0,
                            approved: 0,
                            rejected: 0
                        };
                        if (!(userRole === 'teacher')) return [3 /*break*/, 2];
                        return [4 /*yield*/, customer_application_model_1.CustomerApplication.findAll({
                                where: { teacherId: userId },
                                attributes: ['status']
                            })];
                    case 1:
                        applications = _a.sent();
                        stats.total = applications.length;
                        stats.pending = applications.filter(function (app) { return app.status === customer_application_model_1.CustomerApplicationStatus.PENDING; }).length;
                        stats.approved = applications.filter(function (app) { return app.status === customer_application_model_1.CustomerApplicationStatus.APPROVED; }).length;
                        stats.rejected = applications.filter(function (app) { return app.status === customer_application_model_1.CustomerApplicationStatus.REJECTED; }).length;
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(userRole === 'principal' || userRole === 'admin')) return [3 /*break*/, 4];
                        where = {};
                        if (kindergartenId) {
                            where.kindergartenId = kindergartenId;
                        }
                        return [4 /*yield*/, customer_application_model_1.CustomerApplication.findAll({
                                where: where,
                                attributes: ['status']
                            })];
                    case 3:
                        applications = _a.sent();
                        stats.total = applications.length;
                        stats.pending = applications.filter(function (app) { return app.status === customer_application_model_1.CustomerApplicationStatus.PENDING; }).length;
                        stats.approved = applications.filter(function (app) { return app.status === customer_application_model_1.CustomerApplicationStatus.APPROVED; }).length;
                        stats.rejected = applications.filter(function (app) { return app.status === customer_application_model_1.CustomerApplicationStatus.REJECTED; }).length;
                        _a.label = 4;
                    case 4: return [2 /*return*/, stats];
                }
            });
        });
    };
    return CustomerApplicationService;
}());
exports.CustomerApplicationService = CustomerApplicationService;
