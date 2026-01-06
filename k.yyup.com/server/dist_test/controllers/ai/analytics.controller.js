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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.AnalyticsController = void 0;
var ai_analytics_service_1 = __importDefault(require("../../services/ai/ai-analytics.service"));
/**
 * AI数据分析控制器
 * 负责处理AI分析相关的HTTP请求
 */
var AnalyticsController = /** @class */ (function () {
    function AnalyticsController() {
        var _this = this;
        this.analyticsService = ai_analytics_service_1["default"];
        /**
         * @description 获取AI使用概览
         * @route GET /api/v1/ai/analytics/overview
         */
        this.getUsageOverview = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, startDate, endDate, start, end, overview, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                        if (!startDate || !endDate) {
                            res.status(400).json({
                                code: 400,
                                message: '请提供开始和结束日期',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        start = new Date(startDate);
                        end = new Date(endDate);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            res.status(400).json({
                                code: 400,
                                message: '无效的日期格式',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        if (start >= end) {
                            res.status(400).json({
                                code: 400,
                                message: '开始日期必须早于结束日期',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.analyticsService.getUsageOverview(start, end)];
                    case 1:
                        overview = _b.sent();
                        res.status(200).json({
                            code: 200,
                            message: '获取AI使用概览成功',
                            data: overview
                        });
                        return [2 /*return*/];
                    case 2:
                        error_1 = _b.sent();
                        console.error('获取AI使用概览失败:', error_1);
                        res.status(500).json({
                            code: 500,
                            message: error_1 instanceof Error ? error_1.message : '获取AI使用概览失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 获取模型使用分布
         * @route GET /api/v1/ai/analytics/models/distribution
         */
        this.getModelUsageDistribution = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, startDate, endDate, start, end, distribution, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                        if (!startDate || !endDate) {
                            res.status(400).json({
                                code: 400,
                                message: '请提供开始和结束日期',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        start = new Date(startDate);
                        end = new Date(endDate);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            res.status(400).json({
                                code: 400,
                                message: '无效的日期格式',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.analyticsService.getModelUsageDistribution(start, end)];
                    case 1:
                        distribution = _b.sent();
                        res.status(200).json({
                            code: 200,
                            message: '获取模型使用分布成功',
                            data: distribution
                        });
                        return [2 /*return*/];
                    case 2:
                        error_2 = _b.sent();
                        console.error('获取模型使用分布失败:', error_2);
                        res.status(500).json({
                            code: 500,
                            message: error_2 instanceof Error ? error_2.message : '获取模型使用分布失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 获取用户活跃度趋势
         * @route GET /api/v1/ai/analytics/activity/trend
         */
        this.getUserActivityTrend = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, timeRange, _c, limit, validTimeRanges, limitNum, trend, error_3;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.timeRange, timeRange = _b === void 0 ? 'week' : _b, _c = _a.limit, limit = _c === void 0 ? '30' : _c;
                        validTimeRanges = ['day', 'week', 'month', 'quarter', 'year'];
                        if (!validTimeRanges.includes(timeRange)) {
                            res.status(400).json({
                                code: 400,
                                message: "\u65E0\u6548\u7684\u65F6\u95F4\u8303\u56F4\uFF0C\u652F\u6301: ".concat(validTimeRanges.join(', ')),
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        limitNum = parseInt(limit, 10);
                        if (isNaN(limitNum) || limitNum <= 0 || limitNum > 365) {
                            res.status(400).json({
                                code: 400,
                                message: '限制数量必须是1-365之间的数字',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.analyticsService.getUserActivityTrend(timeRange, limitNum)];
                    case 1:
                        trend = _d.sent();
                        res.status(200).json({
                            code: 200,
                            message: '获取用户活跃度趋势成功',
                            data: trend
                        });
                        return [2 /*return*/];
                    case 2:
                        error_3 = _d.sent();
                        console.error('获取用户活跃度趋势失败:', error_3);
                        res.status(500).json({
                            code: 500,
                            message: error_3 instanceof Error ? error_3.message : '获取用户活跃度趋势失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 获取特定用户分析
         * @route GET /api/v1/ai/analytics/user/:userId
         */
        this.getUserAnalytics = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, _a, startDate, endDate, authenticatedUserId, targetUserId, start, end, userAnalytics, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = req.params.userId;
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                        authenticatedUserId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        targetUserId = authenticatedUserId || parseInt(userId, 10);
                        if (!targetUserId) {
                            res.status(400).json({
                                code: 400,
                                message: '请提供有效的用户ID',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        if (!startDate || !endDate) {
                            res.status(400).json({
                                code: 400,
                                message: '请提供开始和结束日期',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        start = new Date(startDate);
                        end = new Date(endDate);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            res.status(400).json({
                                code: 400,
                                message: '无效的日期格式',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.analyticsService.getUserAnalytics(targetUserId, start, end)];
                    case 1:
                        userAnalytics = _c.sent();
                        res.status(200).json({
                            code: 200,
                            message: '获取用户分析数据成功',
                            data: userAnalytics
                        });
                        return [2 /*return*/];
                    case 2:
                        error_4 = _c.sent();
                        console.error('获取用户分析数据失败:', error_4);
                        res.status(500).json({
                            code: 500,
                            message: error_4 instanceof Error ? error_4.message : '获取用户分析数据失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 获取内容分析
         * @route GET /api/v1/ai/analytics/content
         */
        this.getContentAnalytics = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, startDate, endDate, start, end, contentAnalytics, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                        if (!startDate || !endDate) {
                            res.status(400).json({
                                code: 400,
                                message: '请提供开始和结束日期',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        start = new Date(startDate);
                        end = new Date(endDate);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            res.status(400).json({
                                code: 400,
                                message: '无效的日期格式',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.analyticsService.getContentAnalytics(start, end)];
                    case 1:
                        contentAnalytics = _b.sent();
                        res.status(200).json({
                            code: 200,
                            message: '获取内容分析数据成功',
                            data: contentAnalytics
                        });
                        return [2 /*return*/];
                    case 2:
                        error_5 = _b.sent();
                        console.error('获取内容分析数据失败:', error_5);
                        res.status(500).json({
                            code: 500,
                            message: error_5 instanceof Error ? error_5.message : '获取内容分析数据失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 生成分析报表
         * @route POST /api/v1/ai/analytics/report
         */
        this.generateAnalyticsReport = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, startDate, endDate, _b, includeUserDetails, _c, selectedMetrics, start, end, user, report, error_6;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.body, startDate = _a.startDate, endDate = _a.endDate, _b = _a.includeUserDetails, includeUserDetails = _b === void 0 ? false : _b, _c = _a.selectedMetrics, selectedMetrics = _c === void 0 ? [] : _c;
                        if (!startDate || !endDate) {
                            res.status(400).json({
                                code: 400,
                                message: '请提供开始和结束日期',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        start = new Date(startDate);
                        end = new Date(endDate);
                        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                            res.status(400).json({
                                code: 400,
                                message: '无效的日期格式',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        if (start >= end) {
                            res.status(400).json({
                                code: 400,
                                message: '开始日期必须早于结束日期',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        user = req.user;
                        if (!user || !user.isAdmin) {
                            res.status(403).json({
                                code: 403,
                                message: '需要管理员权限才能生成报表',
                                data: null
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.analyticsService.generateAnalyticsReport(start, end, includeUserDetails, selectedMetrics)];
                    case 1:
                        report = _d.sent();
                        res.status(200).json({
                            code: 200,
                            message: '分析报表生成成功',
                            data: report
                        });
                        return [2 /*return*/];
                    case 2:
                        error_6 = _d.sent();
                        console.error('生成分析报表失败:', error_6);
                        res.status(500).json({
                            code: 500,
                            message: error_6 instanceof Error ? error_6.message : '生成分析报表失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 获取仪表板数据
         * @route GET /api/v1/ai/analytics/dashboard
         */
        this.getDashboardData = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, timeRange, now, startDate, _b, overview, modelDistribution, activityTrend, contentAnalytics, dashboardData, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.query.timeRange, timeRange = _a === void 0 ? 'week' : _a;
                        now = new Date();
                        startDate = void 0;
                        switch (timeRange) {
                            case 'day':
                                startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
                                break;
                            case 'week':
                                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                                break;
                            case 'month':
                                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                                break;
                            case 'quarter':
                                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                                break;
                            case 'year':
                                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                                break;
                            default:
                                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        }
                        return [4 /*yield*/, Promise.all([
                                this.analyticsService.getUsageOverview(startDate, now),
                                this.analyticsService.getModelUsageDistribution(startDate, now),
                                this.analyticsService.getUserActivityTrend(timeRange, 30),
                                this.analyticsService.getContentAnalytics(startDate, now)
                            ])];
                    case 1:
                        _b = _c.sent(), overview = _b[0], modelDistribution = _b[1], activityTrend = _b[2], contentAnalytics = _b[3];
                        dashboardData = {
                            overview: overview,
                            modelDistribution: modelDistribution.slice(0, 5),
                            activityTrend: activityTrend,
                            contentAnalytics: contentAnalytics,
                            timeRange: timeRange,
                            lastUpdated: new Date()
                        };
                        res.status(200).json({
                            code: 200,
                            message: '获取仪表板数据成功',
                            data: dashboardData
                        });
                        return [2 /*return*/];
                    case 2:
                        error_7 = _c.sent();
                        console.error('获取仪表板数据失败:', error_7);
                        res.status(500).json({
                            code: 500,
                            message: error_7 instanceof Error ? error_7.message : '获取仪表板数据失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 获取AI预测分析数据
         * @route GET /api/v1/ai/analytics/predictive-analytics
         */
        this.getPredictiveAnalytics = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, type, _b, timeRange, predictiveData, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.query, type = _a.type, _b = _a.timeRange, timeRange = _b === void 0 ? 'month' : _b;
                        return [4 /*yield*/, this.analyticsService.getPredictiveAnalytics({
                                type: type,
                                timeRange: timeRange
                            })];
                    case 1:
                        predictiveData = _c.sent();
                        res.status(200).json({
                            code: 200,
                            message: '获取预测分析数据成功',
                            data: predictiveData
                        });
                        return [2 /*return*/];
                    case 2:
                        error_8 = _c.sent();
                        console.error('获取预测分析数据失败:', error_8);
                        res.status(500).json({
                            code: 500,
                            message: error_8 instanceof Error ? error_8.message : '获取预测分析数据失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 刷新预测分析数据
         * @route POST /api/v1/ai/analytics/predictive-analytics/refresh
         */
        this.refreshPredictiveAnalytics = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 调用刷新服务
                        return [4 /*yield*/, this.analyticsService.refreshPredictiveAnalytics()];
                    case 1:
                        // 调用刷新服务
                        _a.sent();
                        res.status(200).json({
                            code: 200,
                            message: '预测分析数据刷新成功',
                            data: { refreshed: true, timestamp: new Date() }
                        });
                        return [2 /*return*/];
                    case 2:
                        error_9 = _a.sent();
                        console.error('刷新预测分析数据失败:', error_9);
                        res.status(500).json({
                            code: 500,
                            message: error_9 instanceof Error ? error_9.message : '刷新预测分析数据失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * @description 导出预测分析报告
         * @route POST /api/v1/ai/analytics/predictive-analytics/export
         */
        this.exportPredictiveReport = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, format, _c, includeCharts, reportData, error_10;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.body, _b = _a.format, format = _b === void 0 ? 'json' : _b, _c = _a.includeCharts, includeCharts = _c === void 0 ? false : _c;
                        return [4 /*yield*/, this.analyticsService.exportPredictiveReport({
                                format: format,
                                includeCharts: includeCharts
                            })];
                    case 1:
                        reportData = _d.sent();
                        res.status(200).json({
                            code: 200,
                            message: '预测分析报告导出成功',
                            data: reportData
                        });
                        return [2 /*return*/];
                    case 2:
                        error_10 = _d.sent();
                        console.error('导出预测分析报告失败:', error_10);
                        res.status(500).json({
                            code: 500,
                            message: error_10 instanceof Error ? error_10.message : '导出预测分析报告失败',
                            data: null
                        });
                        return [2 /*return*/];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return AnalyticsController;
}());
exports.AnalyticsController = AnalyticsController;
// 导出控制器实例
exports["default"] = new AnalyticsController();
