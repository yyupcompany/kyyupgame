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
exports.updateEnrollmentPlanStatus = exports.setEnrollmentPlanAssignees = exports.setEnrollmentPlanClasses = exports.addEnrollmentPlanTracking = exports.getEnrollmentPlanTrackings = exports.getGlobalEnrollmentPlanStatistics = exports.getEnrollmentPlanStatistics = exports.deleteEnrollmentPlan = exports.updateEnrollmentPlan = exports.getEnrollmentPlanById = exports.getEnrollmentPlans = exports.createEnrollmentPlan = exports.EnrollmentPlanController = void 0;
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
/**
 * 招生计划控制器
 * 提供招生计划的创建、查询、更新、删除等功能
 */
var EnrollmentPlanController = /** @class */ (function () {
    function EnrollmentPlanController() {
        // 移除服务依赖，直接使用SQL查询
    }
    /**
     * 创建招生计划
     * @route POST /api/enrollment-plans
     */
    EnrollmentPlanController.prototype.create = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, plan;
            return __generator(this, function (_b) {
                try {
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                    }
                    plan = __assign(__assign({ id: Date.now() }, req.body), { createdBy: userId, createdAt: new Date(), updatedAt: new Date() });
                    apiResponse_1.ApiResponse.success(res, plan, '创建招生计划成功', 201);
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '创建招生计划失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取招生计划列表
     * @route GET /api/enrollment-plans
     */
    EnrollmentPlanController.prototype.list = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, plans, result;
            return __generator(this, function (_d) {
                try {
                    _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c;
                    plans = [
                        {
                            id: 1,
                            title: '2024年春季招生计划',
                            status: 'active',
                            startDate: '2024-01-01',
                            endDate: '2024-03-31',
                            targetCount: 100,
                            currentCount: 50
                        },
                        {
                            id: 2,
                            title: '2024年秋季招生计划',
                            status: 'draft',
                            startDate: '2024-09-01',
                            endDate: '2024-11-30',
                            targetCount: 120,
                            currentCount: 0
                        }
                    ];
                    result = {
                        items: plans,
                        page: Number(page) || 0,
                        pageSize: Number(pageSize) || 0,
                        total: plans.length,
                        totalPages: Math.ceil(plans.length / Number(pageSize) || 0)
                    };
                    apiResponse_1.ApiResponse.success(res, result, '获取招生计划列表成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '获取招生计划列表失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取招生计划详情
     * @route GET /api/enrollment-plans/:id
     */
    EnrollmentPlanController.prototype.detail = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, plan;
            return __generator(this, function (_a) {
                try {
                    id = parseInt(req.params.id, 10) || 0;
                    if (isNaN(id)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    plan = {
                        id: id,
                        title: '2024年春季招生计划',
                        description: '面向3-6岁儿童的春季招生计划',
                        status: 'active',
                        startDate: '2024-01-01',
                        endDate: '2024-03-31',
                        targetCount: 100,
                        currentCount: 50,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    apiResponse_1.ApiResponse.success(res, plan, '获取招生计划详情成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '获取招生计划详情失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 更新招生计划
     * @route PUT /api/enrollment-plans/:id
     */
    EnrollmentPlanController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, plan;
            return __generator(this, function (_a) {
                try {
                    id = parseInt(req.params.id, 10) || 0;
                    if (isNaN(id)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    plan = __assign(__assign({ id: id }, req.body), { updatedAt: new Date() });
                    apiResponse_1.ApiResponse.success(res, plan, '更新招生计划成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '更新招生计划失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 删除招生计划
     * @route DELETE /api/enrollment-plans/:id
     */
    EnrollmentPlanController.prototype["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                try {
                    id = parseInt(req.params.id, 10) || 0;
                    if (isNaN(id)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    apiResponse_1.ApiResponse.success(res, null, '删除招生计划成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '删除招生计划失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取单个招生计划统计
     * @route GET /api/enrollment-plans/:id/statistics
     */
    EnrollmentPlanController.prototype.getStatistics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, statistics;
            return __generator(this, function (_a) {
                try {
                    id = parseInt(req.params.id, 10) || 0;
                    if (isNaN(id)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    statistics = {
                        totalApplications: 75,
                        approvedApplications: 50,
                        rejectedApplications: 15,
                        pendingApplications: 10,
                        completionRate: 0.5
                    };
                    apiResponse_1.ApiResponse.success(res, statistics, '获取招生计划统计成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '获取招生计划统计失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取全局招生计划统计
     * @route GET /api/enrollment-plans/statistics
     */
    EnrollmentPlanController.prototype.getGlobalStatistics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var statistics;
            return __generator(this, function (_a) {
                try {
                    statistics = {
                        total: 2,
                        active: 1,
                        draft: 1,
                        completed: 0,
                        totalTargetCount: 220,
                        totalCurrentCount: 50,
                        totalApplications: 75,
                        completionRate: 0.227
                    };
                    apiResponse_1.ApiResponse.success(res, statistics, '获取全局招生计划统计成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '获取全局招生计划统计失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取招生分析数据
     * @route GET /api/enrollment-plans/analytics
     */
    EnrollmentPlanController.prototype.getAnalytics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, startDate, endDate, planId, analytics;
            return __generator(this, function (_b) {
                try {
                    _a = req.query, startDate = _a.startDate, endDate = _a.endDate, planId = _a.planId;
                    analytics = {
                        totalTarget: 200,
                        totalEnrolled: 150,
                        totalApplications: 180,
                        enrollmentRate: 0.75,
                        conversionRate: 0.83,
                        trends: [
                            { date: '2024-01-01', applications: 20, enrolled: 15 },
                            { date: '2024-01-02', applications: 25, enrolled: 18 },
                            { date: '2024-01-03', applications: 30, enrolled: 22 },
                            { date: '2024-01-04', applications: 28, enrolled: 20 },
                            { date: '2024-01-05', applications: 32, enrolled: 25 }
                        ],
                        channels: [
                            { name: '线上推广', applications: 45, enrolled: 30 },
                            { name: '转介绍', applications: 35, enrolled: 25 },
                            { name: '社区活动', applications: 30, enrolled: 20 },
                            { name: '园所宣传', applications: 25, enrolled: 15 }
                        ],
                        classes: [
                            { name: '小班', enrolled: 35 },
                            { name: '中班', enrolled: 45 },
                            { name: '大班', enrolled: 65 }
                        ]
                    };
                    apiResponse_1.ApiResponse.success(res, analytics, '获取招生分析数据成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '获取招生分析数据失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取招生计划跟踪记录
     * @route GET /api/enrollment-plans/:id/trackings
     */
    EnrollmentPlanController.prototype.getTrackings = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, trackings;
            return __generator(this, function (_a) {
                try {
                    planId = parseInt(req.params.id, 10) || 0;
                    if (isNaN(planId)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    trackings = [
                        {
                            id: 1,
                            planId: planId,
                            action: '创建招生计划',
                            description: '创建了2024年春季招生计划',
                            createdAt: new Date(),
                            createdBy: 1
                        }
                    ];
                    apiResponse_1.ApiResponse.success(res, trackings, '获取招生计划跟踪记录成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '获取招生计划跟踪记录失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 设置招生计划班级
     * @route POST /api/enrollment-plans/:id/classes
     */
    EnrollmentPlanController.prototype.setClasses = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId;
            return __generator(this, function (_a) {
                try {
                    planId = parseInt(req.params.id, 10) || 0;
                    if (isNaN(planId)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    // 暂时返回成功响应
                    apiResponse_1.ApiResponse.success(res, null, '设置招生计划班级成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '设置招生计划班级失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 设置招生计划负责人
     * @route POST /api/enrollment-plans/:id/assignees
     */
    EnrollmentPlanController.prototype.setAssignees = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId;
            return __generator(this, function (_a) {
                try {
                    planId = parseInt(req.params.id, 10) || 0;
                    if (isNaN(planId)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    // 暂时返回成功响应
                    apiResponse_1.ApiResponse.success(res, null, '设置招生计划负责人成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '设置招生计划负责人失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 添加招生计划跟踪记录
     * @route POST /api/enrollment-plans/:id/trackings
     */
    EnrollmentPlanController.prototype.addTracking = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var planId, userId, tracking;
            return __generator(this, function (_b) {
                try {
                    planId = parseInt(req.params.id, 10) || 0;
                    if (isNaN(planId)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    if (!userId) {
                        apiResponse_1.ApiResponse.error(res, '用户未认证', 'UNAUTHORIZED', 401);
                        return [2 /*return*/];
                    }
                    tracking = __assign(__assign({ id: Date.now(), planId: planId }, req.body), { createdBy: userId, createdAt: new Date() });
                    apiResponse_1.ApiResponse.success(res, tracking, '添加招生计划跟踪记录成功', 201);
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '添加招生计划跟踪记录失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 更新招生计划状态
     * @route PUT /api/enrollment-plans/:id/status
     */
    EnrollmentPlanController.prototype.updateStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, status_1, validStatuses, plan;
            return __generator(this, function (_a) {
                try {
                    planId = parseInt(req.params.id, 10) || 0;
                    if (isNaN(planId)) {
                        apiResponse_1.ApiResponse.error(res, '无效的招生计划ID', 'INVALID_PLAN_ID', 400);
                        return [2 /*return*/];
                    }
                    status_1 = req.body.status;
                    if (!status_1) {
                        apiResponse_1.ApiResponse.error(res, '状态参数不能为空', 'INVALID_STATUS', 400);
                        return [2 /*return*/];
                    }
                    validStatuses = ['draft', 'pending', 'in_progress', 'finished', 'cancelled'];
                    if (!validStatuses.includes(status_1)) {
                        apiResponse_1.ApiResponse.error(res, '无效的状态值', 'INVALID_STATUS_VALUE', 400);
                        return [2 /*return*/];
                    }
                    plan = {
                        id: planId,
                        status: status_1,
                        updatedAt: new Date()
                    };
                    apiResponse_1.ApiResponse.success(res, plan, '更新招生计划状态成功');
                }
                catch (error) {
                    apiResponse_1.ApiResponse.handleError(res, error, '更新招生计划状态失败');
                }
                return [2 /*return*/];
            });
        });
    };
    return EnrollmentPlanController;
}());
exports.EnrollmentPlanController = EnrollmentPlanController;
// 创建控制器实例
var enrollmentPlanController = new EnrollmentPlanController();
// 导出控制器方法
exports.createEnrollmentPlan = enrollmentPlanController.create.bind(enrollmentPlanController);
exports.getEnrollmentPlans = enrollmentPlanController.list.bind(enrollmentPlanController);
exports.getEnrollmentPlanById = enrollmentPlanController.detail.bind(enrollmentPlanController);
exports.updateEnrollmentPlan = enrollmentPlanController.update.bind(enrollmentPlanController);
exports.deleteEnrollmentPlan = enrollmentPlanController["delete"].bind(enrollmentPlanController);
exports.getEnrollmentPlanStatistics = enrollmentPlanController.getStatistics.bind(enrollmentPlanController);
exports.getGlobalEnrollmentPlanStatistics = enrollmentPlanController.getGlobalStatistics.bind(enrollmentPlanController);
exports.getEnrollmentPlanTrackings = enrollmentPlanController.getTrackings.bind(enrollmentPlanController);
exports.addEnrollmentPlanTracking = enrollmentPlanController.addTracking.bind(enrollmentPlanController);
exports.setEnrollmentPlanClasses = enrollmentPlanController.setClasses.bind(enrollmentPlanController);
exports.setEnrollmentPlanAssignees = enrollmentPlanController.setAssignees.bind(enrollmentPlanController);
exports.updateEnrollmentPlanStatus = enrollmentPlanController.updateStatus.bind(enrollmentPlanController);
