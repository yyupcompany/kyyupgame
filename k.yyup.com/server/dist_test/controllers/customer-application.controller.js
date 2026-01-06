"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.CustomerApplicationController = void 0;
var base_controller_1 = require("./base.controller");
var customer_application_service_1 = require("../services/customer-application.service");
/**
 * 客户申请控制器
 */
var CustomerApplicationController = /** @class */ (function (_super) {
    __extends(CustomerApplicationController, _super);
    function CustomerApplicationController() {
        var _this = _super.call(this) || this;
        /**
         * 教师申请客户（支持批量）
         * POST /api/teacher/customer-applications
         */
        _this.applyForCustomers = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, customerIds, applyReason, teacherId, kindergartenId, result, error_1;
            var _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        _a = req.body, customerIds = _a.customerIds, applyReason = _a.applyReason;
                        teacherId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
                        kindergartenId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.kindergartenId;
                        // 参数验证
                        if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
                            res.status(400).json({
                                success: false,
                                message: '请选择要申请的客户'
                            });
                            return [2 /*return*/];
                        }
                        if (!teacherId) {
                            res.status(401).json({
                                success: false,
                                message: '未授权访问'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.customerApplicationService.applyForCustomers({
                                customerIds: customerIds,
                                teacherId: teacherId,
                                kindergartenId: kindergartenId,
                                applyReason: applyReason
                            })];
                    case 1:
                        result = _e.sent();
                        this.handleSuccess(res, result, '申请提交成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _e.sent();
                        this.handleError(res, error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取教师的申请记录
         * GET /api/teacher/customer-applications
         */
        _this.getTeacherApplications = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var teacherId, _a, status_1, _b, page, _c, pageSize, result, error_2;
            var _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        teacherId = ((_d = req.user) === null || _d === void 0 ? void 0 : _d.userId) || ((_e = req.user) === null || _e === void 0 ? void 0 : _e.id);
                        _a = req.query, status_1 = _a.status, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c;
                        if (!teacherId) {
                            res.status(401).json({
                                success: false,
                                message: '未授权访问'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.customerApplicationService.getTeacherApplications({
                                teacherId: teacherId,
                                status: status_1,
                                page: Number(page),
                                pageSize: Number(pageSize)
                            })];
                    case 1:
                        result = _f.sent();
                        this.handleSuccess(res, result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _f.sent();
                        this.handleError(res, error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取园长待审批的申请列表
         * GET /api/principal/customer-applications
         */
        _this.getPrincipalApplications = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var kindergartenId, _a, status_2, teacherId, customerId, _b, page, _c, pageSize, result, error_3;
            var _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        kindergartenId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.kindergartenId;
                        _a = req.query, status_2 = _a.status, teacherId = _a.teacherId, customerId = _a.customerId, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c;
                        return [4 /*yield*/, this.customerApplicationService.getPrincipalApplications({
                                kindergartenId: kindergartenId,
                                status: status_2,
                                teacherId: teacherId ? Number(teacherId) : undefined,
                                customerId: customerId ? Number(customerId) : undefined,
                                page: Number(page),
                                pageSize: Number(pageSize)
                            })];
                    case 1:
                        result = _e.sent();
                        this.handleSuccess(res, result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _e.sent();
                        this.handleError(res, error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 园长审批申请
         * POST /api/principal/customer-applications/:id/review
         */
        _this.reviewApplication = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, _a, action, rejectReason, principalId, result, error_4;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        _a = req.body, action = _a.action, rejectReason = _a.rejectReason;
                        principalId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
                        // 参数验证
                        if (!action || !['approve', 'reject'].includes(action)) {
                            res.status(400).json({
                                success: false,
                                message: '审批操作无效'
                            });
                            return [2 /*return*/];
                        }
                        if (action === 'reject' && !rejectReason) {
                            res.status(400).json({
                                success: false,
                                message: '拒绝申请时必须填写拒绝理由'
                            });
                            return [2 /*return*/];
                        }
                        if (!principalId) {
                            res.status(401).json({
                                success: false,
                                message: '未授权访问'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.customerApplicationService.reviewApplication({
                                applicationId: Number(id),
                                principalId: principalId,
                                action: action,
                                rejectReason: rejectReason
                            })];
                    case 1:
                        result = _d.sent();
                        this.handleSuccess(res, result, action === 'approve' ? '已同意申请' : '已拒绝申请');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _d.sent();
                        this.handleError(res, error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 批量审批申请
         * POST /api/principal/customer-applications/batch-review
         */
        _this.batchReviewApplications = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, applicationIds, action, rejectReason, principalId, result, error_5;
            var _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.body, applicationIds = _a.applicationIds, action = _a.action, rejectReason = _a.rejectReason;
                        principalId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.userId) || ((_c = req.user) === null || _c === void 0 ? void 0 : _c.id);
                        // 参数验证
                        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
                            res.status(400).json({
                                success: false,
                                message: '请选择要审批的申请'
                            });
                            return [2 /*return*/];
                        }
                        if (!action || !['approve', 'reject'].includes(action)) {
                            res.status(400).json({
                                success: false,
                                message: '审批操作无效'
                            });
                            return [2 /*return*/];
                        }
                        if (action === 'reject' && !rejectReason) {
                            res.status(400).json({
                                success: false,
                                message: '批量拒绝申请时必须填写拒绝理由'
                            });
                            return [2 /*return*/];
                        }
                        if (!principalId) {
                            res.status(401).json({
                                success: false,
                                message: '未授权访问'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.customerApplicationService.batchReviewApplications({
                                applicationIds: applicationIds,
                                principalId: principalId,
                                action: action,
                                rejectReason: rejectReason
                            })];
                    case 1:
                        result = _d.sent();
                        this.handleSuccess(res, result, "\u6279\u91CF".concat(action === 'approve' ? '同意' : '拒绝', "\u6210\u529F"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _d.sent();
                        this.handleError(res, error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取申请详情
         * GET /api/customer-applications/:id
         */
        _this.getApplicationDetail = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, userId, result, error_6;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
                        if (!userId) {
                            res.status(401).json({
                                success: false,
                                message: '未授权访问'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.customerApplicationService.getApplicationDetail(Number(id), userId)];
                    case 1:
                        result = _c.sent();
                        this.handleSuccess(res, result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _c.sent();
                        this.handleError(res, error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取申请统计
         * GET /api/customer-applications/stats
         */
        _this.getApplicationStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, userRole, kindergartenId, result, error_7;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id);
                        userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
                        kindergartenId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.kindergartenId;
                        if (!userId) {
                            res.status(401).json({
                                success: false,
                                message: '未授权访问'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.customerApplicationService.getApplicationStats({
                                userId: userId,
                                userRole: userRole,
                                kindergartenId: kindergartenId
                            })];
                    case 1:
                        result = _e.sent();
                        this.handleSuccess(res, result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _e.sent();
                        this.handleError(res, error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.customerApplicationService = new customer_application_service_1.CustomerApplicationService();
        return _this;
    }
    return CustomerApplicationController;
}(base_controller_1.BaseController));
exports.CustomerApplicationController = CustomerApplicationController;
exports["default"] = new CustomerApplicationController();
