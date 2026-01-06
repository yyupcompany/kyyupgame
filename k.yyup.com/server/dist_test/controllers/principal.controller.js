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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.PrincipalController = void 0;
var principal_service_1 = require("../services/principal.service");
var base_controller_1 = require("./base.controller");
var role_cache_service_1 = __importDefault(require("../services/role-cache.service"));
var PrincipalController = /** @class */ (function (_super) {
    __extends(PrincipalController, _super);
    function PrincipalController() {
        var _this = _super.call(this) || this;
        /**
         * 获取园区概览
         */
        _this.getCampusOverview = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, cachedData, data, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, role_cache_service_1["default"].getPrincipalData(userId, 'campus_overview')];
                    case 1:
                        cachedData = _b.sent();
                        if (cachedData) {
                            console.log('✅ 从缓存获取园区概览数据');
                            return [2 /*return*/, this.handleSuccess(res, cachedData, '获取园区概览成功（缓存）')];
                        }
                        return [4 /*yield*/, this.principalService.getCampusOverview()];
                    case 2:
                        data = _b.sent();
                        // 缓存数据（5分钟）
                        return [4 /*yield*/, role_cache_service_1["default"].setPrincipalData(userId, 'campus_overview', data, 300)];
                    case 3:
                        // 缓存数据（5分钟）
                        _b.sent();
                        this.handleSuccess(res, data, '获取园区概览成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _b.sent();
                        this.handleError(res, error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取待审批列表
         */
        _this.getApprovalList = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, status_1, type, page, pageSize, data, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, status_1 = _a.status, type = _a.type, page = _a.page, pageSize = _a.pageSize;
                        return [4 /*yield*/, this.principalService.getApprovalList({
                                status: status_1,
                                type: type,
                                page: page ? parseInt(page) : 1,
                                pageSize: pageSize ? parseInt(pageSize) : 10
                            })];
                    case 1:
                        data = _b.sent();
                        this.handleSuccess(res, data, '获取待审批列表成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        this.handleError(res, error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 处理审批
         */
        /**
         * 获取仪表板统计
         */
        _this.getDashboardStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, cachedData, data, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, role_cache_service_1["default"].getDashboardData(userId, 'principal')];
                    case 1:
                        cachedData = _b.sent();
                        if (cachedData) {
                            console.log('✅ 从缓存获取园长仪表板统计数据');
                            return [2 /*return*/, this.handleSuccess(res, cachedData, '获取仪表板统计成功（缓存）')];
                        }
                        return [4 /*yield*/, this.principalService.getDashboardStats()];
                    case 2:
                        data = _b.sent();
                        // 缓存数据（5分钟）
                        return [4 /*yield*/, role_cache_service_1["default"].setDashboardData(userId, 'principal', data)];
                    case 3:
                        // 缓存数据（5分钟）
                        _b.sent();
                        this.handleSuccess(res, data, '获取仪表板统计成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _b.sent();
                        this.handleError(res, error_3);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取活动列表
         */
        _this.getActivities = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, page, pageSize, status_2, data, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, page = _a.page, pageSize = _a.pageSize, status_2 = _a.status;
                        return [4 /*yield*/, this.principalService.getActivities({
                                page: page ? parseInt(page) : 1,
                                pageSize: pageSize ? parseInt(pageSize) : 10,
                                status: status_2
                            })];
                    case 1:
                        data = _b.sent();
                        this.handleSuccess(res, data, '获取活动列表成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        this.handleError(res, error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.handleApproval = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, id, action, comment, userId, data, message, error_5;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.params, id = _a.id, action = _a.action;
                        comment = req.body.comment;
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未登录'
                                })];
                        }
                        return [4 /*yield*/, this.principalService.handleApproval(id, action, userId, comment)];
                    case 1:
                        data = _c.sent();
                        message = action === 'approve' ? '审批通过成功' : '审批拒绝成功';
                        this.handleSuccess(res, data, message);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _c.sent();
                        this.handleError(res, error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取重要通知
         */
        _this.getImportantNotices = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var data, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.principalService.getImportantNotices()];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '获取重要通知成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        this.handleError(res, error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 发布通知
         */
        _this.publishNotice = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, data, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未登录'
                                })];
                        }
                        return [4 /*yield*/, this.principalService.publishNotice(__assign(__assign({}, req.body), { publisherId: userId }))];
                    case 1:
                        data = _b.sent();
                        this.handleSuccess(res, data, '发布通知成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        this.handleError(res, error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取园长工作安排
         */
        _this.getPrincipalSchedule = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, data, error_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未登录'
                                })];
                        }
                        return [4 /*yield*/, this.principalService.getPrincipalSchedule(userId)];
                    case 1:
                        data = _b.sent();
                        this.handleSuccess(res, data, '获取工作安排成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        this.handleError(res, error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 创建园长日程安排
         */
        _this.createPrincipalSchedule = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, data, error_9;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未登录'
                                })];
                        }
                        return [4 /*yield*/, this.principalService.createPrincipalSchedule(__assign(__assign({}, req.body), { userId: userId }))];
                    case 1:
                        data = _b.sent();
                        this.handleSuccess(res, data, '创建日程安排成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        this.handleError(res, error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取招生趋势数据
         */
        _this.getEnrollmentTrend = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, period, data, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query.period, period = _a === void 0 ? 'month' : _a;
                        return [4 /*yield*/, this.principalService.getEnrollmentTrend(period)];
                    case 1:
                        data = _b.sent();
                        this.handleSuccess(res, data, '获取招生趋势数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _b.sent();
                        this.handleError(res, error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取客户池统计数据
         */
        _this.getCustomerPoolStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var data, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.principalService.getCustomerPoolStats()];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '获取客户池统计数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        this.handleError(res, error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取客户池列表
         */
        _this.getCustomerPoolList = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var params, data, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = req.query;
                        return [4 /*yield*/, this.principalService.getCustomerPoolList(params)];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '获取客户池列表成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        this.handleError(res, error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取绩效统计数据
         */
        _this.getPerformanceStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var params, data, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = req.query;
                        return [4 /*yield*/, this.principalService.getPerformanceStats(params)];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '获取绩效统计数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _a.sent();
                        this.handleError(res, error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取绩效排名数据
         */
        _this.getPerformanceRankings = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var params, data, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = req.query;
                        return [4 /*yield*/, this.principalService.getPerformanceRankings(params)];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '获取绩效排名数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _a.sent();
                        this.handleError(res, error_14);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取绩效详情数据
         */
        _this.getPerformanceDetails = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var params, data, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        params = req.query;
                        return [4 /*yield*/, this.principalService.getPerformanceDetails(params)];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '获取绩效详情数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_15 = _a.sent();
                        this.handleError(res, error_15);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取客户详情
         */
        _this.getCustomerDetail = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, data, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, this.principalService.getCustomerDetail(parseInt(id))];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '获取客户详情成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_16 = _a.sent();
                        this.handleError(res, error_16);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 分配客户给教师
         */
        _this.assignCustomerTeacher = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var data, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.principalService.assignCustomerTeacher(req.body)];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '分配客户成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_17 = _a.sent();
                        this.handleError(res, error_17);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 批量分配客户给教师
         */
        _this.batchAssignCustomerTeacher = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var data, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.principalService.batchAssignCustomerTeacher(req.body)];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '批量分配客户成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_18 = _a.sent();
                        this.handleError(res, error_18);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 删除客户
         */
        _this.deleteCustomer = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, data, error_19;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, this.principalService.deleteCustomer(parseInt(id))];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '删除客户成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_19 = _a.sent();
                        this.handleError(res, error_19);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 添加客户跟进记录
         */
        _this.addCustomerFollowUp = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, data, error_20;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, this.principalService.addCustomerFollowUp(parseInt(id), req.body)];
                    case 1:
                        data = _a.sent();
                        this.handleSuccess(res, data, '添加跟进记录成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_20 = _a.sent();
                        this.handleError(res, error_20);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        _this.principalService = new principal_service_1.PrincipalService();
        return _this;
    }
    return PrincipalController;
}(base_controller_1.BaseController));
exports.PrincipalController = PrincipalController;
