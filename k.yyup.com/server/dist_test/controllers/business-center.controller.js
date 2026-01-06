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
exports.BusinessCenterController = void 0;
var business_center_service_1 = require("../services/business-center.service");
var apiResponse_1 = require("../utils/apiResponse");
/**
 * 业务中心控制器
 * 处理业务中心相关的API请求
 */
var BusinessCenterController = /** @class */ (function () {
    function BusinessCenterController() {
    }
    /**
     * 获取业务中心概览数据
     * GET /api/business-center/overview
     */
    BusinessCenterController.getOverview = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🏢 业务中心概览数据请求');
                        return [4 /*yield*/, business_center_service_1.BusinessCenterService.getOverview()];
                    case 1:
                        data = _a.sent();
                        apiResponse_1.ApiResponse.success(res, data, '获取业务中心概览数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ 获取业务中心概览数据失败:', error_1);
                        apiResponse_1.ApiResponse.handleError(res, error_1, '获取业务中心概览数据失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取业务流程时间线数据
     * GET /api/business-center/timeline
     */
    BusinessCenterController.getTimeline = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var timelineItems, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('📋 业务流程时间线数据请求');
                        return [4 /*yield*/, business_center_service_1.BusinessCenterService.getBusinessTimeline()];
                    case 1:
                        timelineItems = _a.sent();
                        apiResponse_1.ApiResponse.success(res, { timelineItems: timelineItems }, '获取业务流程时间线数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ 获取业务流程时间线数据失败:', error_2);
                        apiResponse_1.ApiResponse.handleError(res, error_2, '获取业务流程时间线数据失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生进度数据
     * GET /api/business-center/enrollment-progress
     */
    BusinessCenterController.getEnrollmentProgress = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var progressData, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🎯 招生进度数据请求');
                        return [4 /*yield*/, business_center_service_1.BusinessCenterService.getEnrollmentProgress()];
                    case 1:
                        progressData = _a.sent();
                        apiResponse_1.ApiResponse.success(res, progressData, '获取招生进度数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('❌ 获取招生进度数据失败:', error_3);
                        apiResponse_1.ApiResponse.handleError(res, error_3, '获取招生进度数据失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取业务中心统计数据
     * GET /api/business-center/statistics
     */
    BusinessCenterController.getStatistics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var overview, statistics, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('📊 业务中心统计数据请求');
                        return [4 /*yield*/, business_center_service_1.BusinessCenterService.getOverview()];
                    case 1:
                        overview = _a.sent();
                        statistics = {
                            teachingCenter: {
                                totalPlans: overview.teachingCenter.total_plans,
                                activePlans: overview.teachingCenter.active_plans,
                                achievementRate: overview.teachingCenter.overall_achievement_rate,
                                completionRate: overview.teachingCenter.overall_completion_rate
                            },
                            enrollment: {
                                target: overview.enrollment.target,
                                current: overview.enrollment.current,
                                completionRate: Math.round((overview.enrollment.current / overview.enrollment.target) * 100),
                                applications: overview.enrollment.applications
                            },
                            personnel: {
                                teachers: overview.personnel.teachers,
                                students: overview.personnel.students,
                                classes: overview.personnel.classes,
                                parents: overview.personnel.parents
                            },
                            activities: {
                                total: overview.activities.total,
                                ongoing: overview.activities.ongoing,
                                completed: overview.activities.completed,
                                upcoming: overview.activities.upcoming
                            },
                            system: overview.system
                        };
                        apiResponse_1.ApiResponse.success(res, statistics, '获取业务中心统计数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('❌ 获取业务中心统计数据失败:', error_4);
                        apiResponse_1.ApiResponse.handleError(res, error_4, '获取业务中心统计数据失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取业务中心仪表板数据（聚合接口）
     * GET /api/business-center/dashboard
     */
    BusinessCenterController.getDashboard = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, _a, overview, timeline, enrollmentProgress, responseTime, dashboardData, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        console.log('📊 业务中心仪表板数据请求');
                        startTime = Date.now();
                        return [4 /*yield*/, Promise.all([
                                business_center_service_1.BusinessCenterService.getOverview(),
                                business_center_service_1.BusinessCenterService.getBusinessTimeline(),
                                business_center_service_1.BusinessCenterService.getEnrollmentProgress()
                            ])];
                    case 1:
                        _a = _b.sent(), overview = _a[0], timeline = _a[1], enrollmentProgress = _a[2];
                        responseTime = Date.now() - startTime;
                        dashboardData = {
                            overview: overview,
                            timeline: timeline,
                            enrollmentProgress: enrollmentProgress,
                            meta: {
                                responseTime: responseTime,
                                lastUpdated: new Date().toISOString(),
                                dataVersion: '1.0'
                            }
                        };
                        console.log("\u2705 \u4E1A\u52A1\u4E2D\u5FC3\u4EEA\u8868\u677F\u6570\u636E\u83B7\u53D6\u5B8C\u6210\uFF0C\u8017\u65F6: ".concat(responseTime, "ms"));
                        apiResponse_1.ApiResponse.success(res, dashboardData, '获取业务中心仪表板数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        console.error('❌ 获取业务中心仪表板数据失败:', error_5);
                        apiResponse_1.ApiResponse.handleError(res, error_5, '获取业务中心仪表板数据失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教学中心集成数据
     * GET /api/business-center/teaching-integration
     */
    BusinessCenterController.getTeachingIntegration = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var overview, teachingData, integrationData, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('📚 教学中心集成数据请求');
                        return [4 /*yield*/, business_center_service_1.BusinessCenterService.getOverview()];
                    case 1:
                        overview = _a.sent();
                        teachingData = overview.teachingCenter;
                        integrationData = {
                            summary: {
                                totalPlans: teachingData.total_plans || 0,
                                activePlans: teachingData.active_plans || 0,
                                completedPlans: teachingData.completed_plans || 0,
                                achievementRate: teachingData.overall_achievement_rate || 0,
                                completionRate: teachingData.overall_completion_rate || 0
                            },
                            progress: {
                                totalSessions: teachingData.total_sessions || 0,
                                completedSessions: teachingData.completed_sessions || 0,
                                confirmedSessions: teachingData.confirmed_sessions || 0,
                                plansWithMedia: teachingData.plans_with_media || 0
                            },
                            status: 'active',
                            lastUpdated: new Date().toISOString()
                        };
                        apiResponse_1.ApiResponse.success(res, integrationData, '获取教学中心集成数据成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('❌ 获取教学中心集成数据失败:', error_6);
                        apiResponse_1.ApiResponse.handleError(res, error_6, '获取教学中心集成数据失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return BusinessCenterController;
}());
exports.BusinessCenterController = BusinessCenterController;
