"use strict";
/**
 * AI分析与反馈中间层
 * 负责AI使用分析和用户反馈管理，组合分析服务和反馈服务
 */
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
exports.__esModule = true;
exports.aiAnalyticsAndFeedbackMiddleware = void 0;
var ai_1 = require("../../services/ai");
var base_middleware_1 = require("./base.middleware");
/**
 * AI分析与反馈中间层实现
 */
var AiAnalyticsAndFeedbackMiddleware = /** @class */ (function (_super) {
    __extends(AiAnalyticsAndFeedbackMiddleware, _super);
    function AiAnalyticsAndFeedbackMiddleware() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 获取AI使用概览
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns AI使用概览数据
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getUsageOverview = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, overview, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:analytics:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看分析数据的权限');
                        }
                        return [4 /*yield*/, ai_1.aiAnalyticsService.getUsageOverview(startDate, endDate)];
                    case 2:
                        overview = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(overview)];
                    case 3:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.handleError(error_1)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模型使用分布
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 模型使用分布数据
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getModelUsageDistribution = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, distribution, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:analytics:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看分析数据的权限');
                        }
                        return [4 /*yield*/, ai_1.aiAnalyticsService.getModelUsageDistribution(startDate, endDate)];
                    case 2:
                        distribution = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(distribution)];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.handleError(error_2)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户活跃度趋势
     * @param timeRange 时间范围
     * @param limit 数据点限制
     * @returns 用户活跃度趋势数据
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getUserActivityTrend = function (timeRange, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, trend, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:analytics:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看分析数据的权限');
                        }
                        return [4 /*yield*/, ai_1.aiAnalyticsService.getUserActivityTrend(timeRange, limit)];
                    case 2:
                        trend = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(trend)];
                    case 3:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.handleError(error_3)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取特定用户分析
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 用户分析数据
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getUserAnalytics = function (userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, analytics, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:analytics:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看分析数据的权限');
                        }
                        return [4 /*yield*/, ai_1.aiAnalyticsService.getUserAnalytics(userId, startDate, endDate)];
                    case 2:
                        analytics = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(analytics)];
                    case 3:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.handleError(error_4)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取内容分析
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 内容分析数据
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getContentAnalytics = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, analytics, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:analytics:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看分析数据的权限');
                        }
                        return [4 /*yield*/, ai_1.aiAnalyticsService.getContentAnalytics(startDate, endDate)];
                    case 2:
                        analytics = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(analytics)];
                    case 3:
                        error_5 = _a.sent();
                        return [2 /*return*/, this.handleError(error_5)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成分析报表
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param includeUserDetails 是否包含用户详情
     * @param selectedMetrics 选定的指标
     * @returns 报表生成结果
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.generateAnalyticsReport = function (startDate, endDate, includeUserDetails, selectedMetrics) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, report, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:analytics:report'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有生成分析报表的权限');
                        }
                        return [4 /*yield*/, ai_1.aiAnalyticsService.generateAnalyticsReport(startDate, endDate, includeUserDetails, selectedMetrics)];
                    case 2:
                        report = _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(0, 'GENERATE_ANALYTICS_REPORT', {
                                reportId: report.reportId,
                                startDate: startDate,
                                endDate: endDate,
                                includeUserDetails: includeUserDetails,
                                selectedMetrics: selectedMetrics
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(report)];
                    case 4:
                        error_6 = _a.sent();
                        return [2 /*return*/, this.handleError(error_6)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建反馈
     * @param userId 用户ID
     * @param feedbackType 反馈类型
     * @param sourceType 来源类型
     * @param content 反馈内容
     * @param sourceId 来源ID
     * @param rating 评分
     * @returns 创建的反馈ID
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.createFeedback = function (userId, feedbackType, sourceType, content, sourceId, rating) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, feedback, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:feedback:create'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有创建反馈的权限', { userId: userId });
                        }
                        // 验证参数
                        if (!content) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.VALIDATION_FAILED, '反馈内容不能为空', { content: content });
                        }
                        return [4 /*yield*/, ai_1.aiFeedbackService.createFeedback(userId, feedbackType, sourceType, content, sourceId, rating)];
                    case 2:
                        feedback = _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'CREATE_FEEDBACK', {
                                feedbackId: feedback.id,
                                feedbackType: feedbackType,
                                sourceType: sourceType
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(feedback)];
                    case 4:
                        error_7 = _a.sent();
                        return [2 /*return*/, this.handleError(error_7)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户反馈列表
     * @param userId 用户ID
     * @param limit 数量限制
     * @returns 反馈列表
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getUserFeedbacks = function (userId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, feedbacks, formattedFeedbacks, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:feedback:read'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看反馈的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiFeedbackService.getUserFeedbacks(userId, limit)];
                    case 2:
                        feedbacks = _a.sent();
                        formattedFeedbacks = feedbacks.map(function (feedback) { return (__assign({}, feedback)); });
                        return [2 /*return*/, this.createSuccessResponse(formattedFeedbacks)];
                    case 3:
                        error_8 = _a.sent();
                        return [2 /*return*/, this.handleError(error_8)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取特定状态的反馈
     * @param status 反馈状态
     * @param limit 数量限制
     * @returns 反馈列表
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getFeedbacksByStatus = function (status, limit) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, feedbacks, formattedFeedbacks, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:feedback:admin'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有管理反馈的权限');
                        }
                        return [4 /*yield*/, ai_1.aiFeedbackService.getFeedbacksByStatus(status, limit)];
                    case 2:
                        feedbacks = _a.sent();
                        formattedFeedbacks = feedbacks.map(function (feedback) { return (__assign({}, feedback)); });
                        return [2 /*return*/, this.createSuccessResponse(formattedFeedbacks)];
                    case 3:
                        error_9 = _a.sent();
                        return [2 /*return*/, this.handleError(error_9)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新反馈状态
     * @param feedbackId 反馈ID
     * @param status 新状态
     * @param adminNotes 管理员备注
     * @returns 更新结果
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.updateFeedbackStatus = function (feedbackId, status, adminNotes) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, result, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:feedback:admin'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有管理反馈的权限');
                        }
                        return [4 /*yield*/, ai_1.aiFeedbackService.updateFeedbackStatus(feedbackId, status, adminNotes)];
                    case 2:
                        result = _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(0, 'UPDATE_FEEDBACK_STATUS', {
                                feedbackId: feedbackId,
                                status: status,
                                adminNotes: adminNotes
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(result)];
                    case 4:
                        error_10 = _a.sent();
                        return [2 /*return*/, this.handleError(error_10)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取反馈详情
     * @param feedbackId 反馈ID
     * @returns 反馈详情
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getFeedbackDetails = function (feedbackId) {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, feedback, formattedFeedback, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:feedback:admin'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看反馈详情的权限');
                        }
                        return [4 /*yield*/, ai_1.aiFeedbackService.getFeedbackDetails(feedbackId)];
                    case 2:
                        feedback = _a.sent();
                        formattedFeedback = feedback ? __assign({}, feedback) : null;
                        return [2 /*return*/, this.createSuccessResponse(formattedFeedback)];
                    case 3:
                        error_11 = _a.sent();
                        return [2 /*return*/, this.handleError(error_11)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取反馈统计
     * @returns 反馈统计数据
     */
    AiAnalyticsAndFeedbackMiddleware.prototype.getFeedbackStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var hasPermission, stats, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:feedback:admin'])];
                    case 1:
                        hasPermission = _a.sent();
                        if (!hasPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看反馈统计的权限');
                        }
                        return [4 /*yield*/, ai_1.aiFeedbackService.getFeedbackStats()];
                    case 2:
                        stats = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(stats)];
                    case 3:
                        error_12 = _a.sent();
                        return [2 /*return*/, this.handleError(error_12)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AiAnalyticsAndFeedbackMiddleware;
}(base_middleware_1.BaseMiddleware));
// 导出单例实例
exports.aiAnalyticsAndFeedbackMiddleware = new AiAnalyticsAndFeedbackMiddleware();
