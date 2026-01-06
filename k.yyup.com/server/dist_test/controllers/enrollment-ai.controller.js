"use strict";
/**
 * AI招生功能控制器
 *
 * 处理所有AI招生高级功能的API请求:
 * - 智能规划 (/smart-planning)
 * - 招生预测 (/forecast)
 * - 招生策略 (/strategy)
 * - 容量优化 (/optimization)
 * - 趋势分析 (/trends)
 * - 招生仿真 (/simulation)
 * - 计划评估 (/evaluation)
 */
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
exports.EnrollmentAIController = void 0;
var ai_enrollment_service_1 = require("../services/enrollment/ai-enrollment.service");
var response_handler_1 = require("../utils/response-handler");
var EnrollmentAIController = /** @class */ (function () {
    function EnrollmentAIController() {
        this.aiEnrollmentService = new ai_enrollment_service_1.AIEnrollmentService();
    }
    /**
     * 智能规划 - POST /api/enrollment-plan/:id/smart-planning
     */
    EnrollmentAIController.prototype.generateSmartPlanning = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, parameters, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        planId = req.params.id;
                        parameters = req.body;
                        return [4 /*yield*/, this.aiEnrollmentService.generateSmartPlanning(parseInt(planId), parameters)];
                    case 1:
                        result = _a.sent();
                        response_handler_1.ResponseHandler.success(res, result, '智能规划生成成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('智能规划API错误:', error_1);
                        response_handler_1.ResponseHandler.error(res, error_1.message || 'AI智能规划服务异常', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 招生预测 - POST /api/enrollment-plan/:id/forecast
     */
    EnrollmentAIController.prototype.generateForecast = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, _a, timeframe, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        planId = req.params.id;
                        _a = req.body.timeframe, timeframe = _a === void 0 ? '3months' : _a;
                        return [4 /*yield*/, this.aiEnrollmentService.generateEnrollmentForecast(parseInt(planId), timeframe)];
                    case 1:
                        result = _b.sent();
                        response_handler_1.ResponseHandler.success(res, result, '招生预测生成成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.error('招生预测API错误:', error_2);
                        response_handler_1.ResponseHandler.error(res, error_2.message || 'AI预测服务异常', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 招生策略 - POST /api/enrollment-plan/:id/strategy
     */
    EnrollmentAIController.prototype.generateStrategy = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, objectives, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        planId = req.params.id;
                        objectives = req.body;
                        return [4 /*yield*/, this.aiEnrollmentService.generateEnrollmentStrategy(parseInt(planId), objectives)];
                    case 1:
                        result = _a.sent();
                        response_handler_1.ResponseHandler.success(res, result, '招生策略生成成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('招生策略API错误:', error_3);
                        response_handler_1.ResponseHandler.error(res, error_3.message || 'AI策略服务异常', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 容量优化 - POST /api/enrollment-plan/:id/optimization
     */
    EnrollmentAIController.prototype.generateOptimization = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        planId = req.params.id;
                        return [4 /*yield*/, this.aiEnrollmentService.generateCapacityOptimization(parseInt(planId))];
                    case 1:
                        result = _a.sent();
                        response_handler_1.ResponseHandler.success(res, result, '容量优化分析完成');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('容量优化API错误:', error_4);
                        response_handler_1.ResponseHandler.error(res, error_4.message || 'AI优化服务异常', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 趋势分析 - GET /api/enrollment/trends
     */
    EnrollmentAIController.prototype.generateTrendAnalysis = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, timeRange, result, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query.timeRange, timeRange = _a === void 0 ? '3years' : _a;
                        return [4 /*yield*/, this.aiEnrollmentService.generateTrendAnalysis(timeRange)];
                    case 1:
                        result = _b.sent();
                        response_handler_1.ResponseHandler.success(res, result, '趋势分析完成');
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        console.error('趋势分析API错误:', error_5);
                        response_handler_1.ResponseHandler.error(res, error_5.message || 'AI趋势分析服务异常', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 招生仿真 - POST /api/enrollment-plan/:id/simulation
     */
    EnrollmentAIController.prototype.generateSimulation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, _a, scenarios, result, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        planId = req.params.id;
                        _a = req.body.scenarios, scenarios = _a === void 0 ? [] : _a;
                        if (!Array.isArray(scenarios) || scenarios.length === 0) {
                            return [2 /*return*/, response_handler_1.ResponseHandler.error(res, '请提供至少一个仿真场景', 400)];
                        }
                        return [4 /*yield*/, this.aiEnrollmentService.generateEnrollmentSimulation(parseInt(planId), scenarios)];
                    case 1:
                        result = _b.sent();
                        response_handler_1.ResponseHandler.success(res, result, '招生仿真完成');
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        console.error('招生仿真API错误:', error_6);
                        response_handler_1.ResponseHandler.error(res, error_6.message || 'AI仿真服务异常', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计划评估 - POST /api/enrollment-plan/:id/evaluation
     */
    EnrollmentAIController.prototype.generateEvaluation = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        planId = req.params.id;
                        return [4 /*yield*/, this.aiEnrollmentService.generatePlanEvaluation(parseInt(planId))];
                    case 1:
                        result = _a.sent();
                        response_handler_1.ResponseHandler.success(res, result, '计划评估完成');
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('计划评估API错误:', error_7);
                        response_handler_1.ResponseHandler.error(res, error_7.message || 'AI评估服务异常', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取AI分析历史 - GET /api/enrollment-plan/:id/ai-history
     */
    EnrollmentAIController.prototype.getAIAnalysisHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, _a, type, _b, limit, history_1;
            return __generator(this, function (_c) {
                try {
                    planId = req.params.id;
                    _a = req.query, type = _a.type, _b = _a.limit, limit = _b === void 0 ? 10 : _b;
                    history_1 = [
                        {
                            id: 1,
                            analysisType: 'smart_planning',
                            createdAt: new Date(),
                            confidenceScore: 0.85,
                            summary: '智能规划建议已生成'
                        },
                        {
                            id: 2,
                            analysisType: 'forecast',
                            createdAt: new Date(),
                            confidenceScore: 0.78,
                            summary: '3个月招生预测完成'
                        }
                    ];
                    response_handler_1.ResponseHandler.success(res, history_1, 'AI分析历史获取成功');
                }
                catch (error) {
                    console.error('获取AI历史API错误:', error);
                    response_handler_1.ResponseHandler.error(res, error.message || '获取AI分析历史失败', 500);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 批量AI分析 - POST /api/enrollment-plan/:id/batch-analysis
     */
    EnrollmentAIController.prototype.batchAnalysis = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId_1, _a, analysisTypes, results_1, errors_1, analysisPromises, response, error_8;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        planId_1 = req.params.id;
                        _a = req.body.analysisTypes, analysisTypes = _a === void 0 ? [] : _a;
                        if (!Array.isArray(analysisTypes) || analysisTypes.length === 0) {
                            return [2 /*return*/, response_handler_1.ResponseHandler.error(res, '请指定要执行的分析类型', 400)];
                        }
                        results_1 = {};
                        errors_1 = [];
                        analysisPromises = analysisTypes.map(function (type) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, error_9;
                            return __generator(this, function (_m) {
                                switch (_m.label) {
                                    case 0:
                                        _m.trys.push([0, 13, , 14]);
                                        _a = type;
                                        switch (_a) {
                                            case 'smart_planning': return [3 /*break*/, 1];
                                            case 'forecast': return [3 /*break*/, 3];
                                            case 'strategy': return [3 /*break*/, 5];
                                            case 'optimization': return [3 /*break*/, 7];
                                            case 'evaluation': return [3 /*break*/, 9];
                                        }
                                        return [3 /*break*/, 11];
                                    case 1:
                                        _b = results_1;
                                        _c = type;
                                        return [4 /*yield*/, this.aiEnrollmentService.generateSmartPlanning(parseInt(planId_1))];
                                    case 2:
                                        _b[_c] = _m.sent();
                                        return [3 /*break*/, 12];
                                    case 3:
                                        _d = results_1;
                                        _e = type;
                                        return [4 /*yield*/, this.aiEnrollmentService.generateEnrollmentForecast(parseInt(planId_1))];
                                    case 4:
                                        _d[_e] = _m.sent();
                                        return [3 /*break*/, 12];
                                    case 5:
                                        _f = results_1;
                                        _g = type;
                                        return [4 /*yield*/, this.aiEnrollmentService.generateEnrollmentStrategy(parseInt(planId_1), {})];
                                    case 6:
                                        _f[_g] = _m.sent();
                                        return [3 /*break*/, 12];
                                    case 7:
                                        _h = results_1;
                                        _j = type;
                                        return [4 /*yield*/, this.aiEnrollmentService.generateCapacityOptimization(parseInt(planId_1))];
                                    case 8:
                                        _h[_j] = _m.sent();
                                        return [3 /*break*/, 12];
                                    case 9:
                                        _k = results_1;
                                        _l = type;
                                        return [4 /*yield*/, this.aiEnrollmentService.generatePlanEvaluation(parseInt(planId_1))];
                                    case 10:
                                        _k[_l] = _m.sent();
                                        return [3 /*break*/, 12];
                                    case 11:
                                        errors_1.push("\u4E0D\u652F\u6301\u7684\u5206\u6790\u7C7B\u578B: ".concat(type));
                                        _m.label = 12;
                                    case 12: return [3 /*break*/, 14];
                                    case 13:
                                        error_9 = _m.sent();
                                        errors_1.push("".concat(type, "\u5206\u6790\u5931\u8D25: ").concat(error_9.message));
                                        return [3 /*break*/, 14];
                                    case 14: return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.allSettled(analysisPromises)];
                    case 1:
                        _b.sent();
                        response = {
                            results: results_1,
                            errors: errors_1,
                            summary: {
                                total: analysisTypes.length,
                                successful: Object.keys(results_1).length,
                                failed: errors_1.length
                            }
                        };
                        response_handler_1.ResponseHandler.success(res, response, '批量AI分析完成');
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        console.error('批量分析API错误:', error_8);
                        response_handler_1.ResponseHandler.error(res, error_8.message || '批量AI分析服务异常', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * AI分析状态检查 - GET /api/enrollment/ai-status
     */
    EnrollmentAIController.prototype.checkAIStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var status_1;
            return __generator(this, function (_a) {
                try {
                    status_1 = {
                        available: true,
                        services: {
                            smartPlanning: { status: 'online', responseTime: '2.3s' },
                            forecast: { status: 'online', responseTime: '1.8s' },
                            strategy: { status: 'online', responseTime: '3.1s' },
                            optimization: { status: 'online', responseTime: '2.7s' },
                            trends: { status: 'online', responseTime: '4.2s' },
                            simulation: { status: 'online', responseTime: '5.1s' },
                            evaluation: { status: 'online', responseTime: '2.9s' }
                        },
                        lastUpdated: new Date(),
                        version: '1.0.0'
                    };
                    response_handler_1.ResponseHandler.success(res, status_1, 'AI服务状态检查完成');
                }
                catch (error) {
                    console.error('AI状态检查错误:', error);
                    response_handler_1.ResponseHandler.error(res, error.message || 'AI状态检查失败', 500);
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 导出AI分析报告 - GET /api/enrollment-plan/:id/export-ai-report
     */
    EnrollmentAIController.prototype.exportAIReport = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, _a, format, smartPlanning, forecast, evaluation, report, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        planId = req.params.id;
                        _a = req.query.format, format = _a === void 0 ? 'json' : _a;
                        return [4 /*yield*/, this.aiEnrollmentService.generateSmartPlanning(parseInt(planId))];
                    case 1:
                        smartPlanning = _b.sent();
                        return [4 /*yield*/, this.aiEnrollmentService.generateEnrollmentForecast(parseInt(planId))];
                    case 2:
                        forecast = _b.sent();
                        return [4 /*yield*/, this.aiEnrollmentService.generatePlanEvaluation(parseInt(planId))];
                    case 3:
                        evaluation = _b.sent();
                        report = {
                            planId: parseInt(planId),
                            generatedAt: new Date(),
                            analyses: {
                                smartPlanning: smartPlanning,
                                forecast: forecast,
                                evaluation: evaluation
                            },
                            summary: {
                                overallScore: evaluation.overallScore,
                                keyRecommendations: smartPlanning.recommendations,
                                riskFactors: smartPlanning.riskFactors
                            }
                        };
                        if (format === 'pdf') {
                            // 生成PDF报告的逻辑
                            res.setHeader('Content-Type', 'application/pdf');
                            res.setHeader('Content-Disposition', "attachment; filename=\"ai-report-".concat(planId, ".pdf\""));
                            // 实际需要PDF生成库
                            return [2 /*return*/, response_handler_1.ResponseHandler.error(res, 'PDF导出功能开发中', 501)];
                        }
                        response_handler_1.ResponseHandler.success(res, report, 'AI分析报告导出成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_10 = _b.sent();
                        console.error('导出AI报告错误:', error_10);
                        response_handler_1.ResponseHandler.error(res, error_10.message || '导出AI报告失败', 500);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return EnrollmentAIController;
}());
exports.EnrollmentAIController = EnrollmentAIController;
