"use strict";
/**
 * AI招生高级功能服务
 *
 * 功能包括:
 * - 智能规划 (Smart Planning)
 * - 招生预测 (Enrollment Forecast)
 * - 招生策略 (Enrollment Strategy)
 * - 容量优化 (Capacity Optimization)
 * - 趋势分析 (Trend Analysis)
 * - 招生仿真 (Enrollment Simulation)
 * - 计划评估 (Plan Evaluation)
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
exports.AIEnrollmentService = void 0;
var ai_bridge_service_1 = require("../ai/bridge/ai-bridge.service");
var enrollment_plan_model_1 = require("../../models/enrollment-plan.model");
var enrollment_application_model_1 = require("../../models/enrollment-application.model");
var AIEnrollmentService = /** @class */ (function () {
    function AIEnrollmentService() {
        this.aiBridge = ai_bridge_service_1.aiBridgeService;
        // Using singleton instance of AIBridgeService
    }
    /**
     * 智能规划 - 基于历史数据和AI分析生成招生计划建议
     */
    AIEnrollmentService.prototype.generateSmartPlanning = function (planId, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, historicalData, marketData, prompt_1, aiResponse, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId)];
                    case 1:
                        plan = _a.sent();
                        return [4 /*yield*/, this.getHistoricalEnrollmentData()];
                    case 2:
                        historicalData = _a.sent();
                        return [4 /*yield*/, this.getMarketAnalysisData()];
                    case 3:
                        marketData = _a.sent();
                        prompt_1 = "\n\u4F5C\u4E3A\u5E7C\u513F\u56ED\u62DB\u751F\u4E13\u5BB6\uFF0C\u8BF7\u57FA\u4E8E\u4EE5\u4E0B\u6570\u636E\u751F\u6210\u667A\u80FD\u62DB\u751F\u89C4\u5212\uFF1A\n\n\u8BA1\u5212\u4FE1\u606F\uFF1A\n- \u76EE\u6807\u4EBA\u6570\uFF1A".concat((plan === null || plan === void 0 ? void 0 : plan.targetCount) || 'N/A', "\n- \u5F00\u59CB\u65F6\u95F4\uFF1A").concat((plan === null || plan === void 0 ? void 0 : plan.startDate) || 'N/A', "\n- \u76EE\u6807\u91D1\u989D\uFF1A").concat((plan === null || plan === void 0 ? void 0 : plan.targetAmount) || 'N/A', "\n- \u5E74\u9F84\u8303\u56F4\uFF1A").concat((plan === null || plan === void 0 ? void 0 : plan.ageRange) || 'N/A', "\n\n\u5386\u53F2\u6570\u636E\uFF1A\n").concat(JSON.stringify(historicalData, null, 2), "\n\n\u5E02\u573A\u6570\u636E\uFF1A\n").concat(JSON.stringify(marketData, null, 2), "\n\n\u8BF7\u63D0\u4F9B\u8BE6\u7EC6\u7684\u667A\u80FD\u89C4\u5212\u5EFA\u8BAE\uFF0C\u5305\u62EC\uFF1A\n1. \u76EE\u6807\u4EBA\u6570\u4F18\u5316\u5EFA\u8BAE\n2. \u5B9A\u4EF7\u7B56\u7565\u5206\u6790\n3. \u65F6\u95F4\u8282\u70B9\u89C4\u5212\n4. \u8425\u9500\u7B56\u7565\u5EFA\u8BAE\n5. \u98CE\u9669\u56E0\u7D20\u8BC6\u522B\n6. \u7F6E\u4FE1\u5EA6\u8BC4\u4F30\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u7ED3\u679C\u3002\n      ");
                        return [4 /*yield*/, this.aiBridge.analyze(prompt_1, {
                                type: 'planning',
                                context: 'enrollment',
                                requireStructured: true
                            })];
                    case 4:
                        aiResponse = _a.sent();
                        result = this.parseSmartPlanningResponse(aiResponse, planId);
                        // 保存分析结果
                        return [4 /*yield*/, this.saveAnalysisResult(planId, 'smart_planning', result)];
                    case 5:
                        // 保存分析结果
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_1 = _a.sent();
                        console.error('智能规划生成失败:', error_1);
                        throw new Error('AI智能规划服务暂时不可用');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 招生预测 - 预测未来招生趋势和申请量
     */
    AIEnrollmentService.prototype.generateEnrollmentForecast = function (planId, timeframe) {
        if (timeframe === void 0) { timeframe = '3months'; }
        return __awaiter(this, void 0, void 0, function () {
            var historicalApplications, seasonalData, marketTrends, prompt_2, aiResponse, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getHistoricalApplicationData()];
                    case 1:
                        historicalApplications = _a.sent();
                        return [4 /*yield*/, this.getSeasonalTrendData()];
                    case 2:
                        seasonalData = _a.sent();
                        return [4 /*yield*/, this.getMarketTrendData()];
                    case 3:
                        marketTrends = _a.sent();
                        prompt_2 = "\n\u4F5C\u4E3A\u6570\u636E\u5206\u6790\u4E13\u5BB6\uFF0C\u8BF7\u57FA\u4E8E\u4EE5\u4E0B\u5386\u53F2\u6570\u636E\u9884\u6D4B\u62DB\u751F\u8D8B\u52BF\uFF1A\n\n\u65F6\u95F4\u8303\u56F4\uFF1A".concat(timeframe, "\n\u5386\u53F2\u7533\u8BF7\u6570\u636E\uFF1A\n").concat(JSON.stringify(historicalApplications, null, 2), "\n\n\u5B63\u8282\u6027\u6570\u636E\uFF1A\n").concat(JSON.stringify(seasonalData, null, 2), "\n\n\u5E02\u573A\u8D8B\u52BF\uFF1A\n").concat(JSON.stringify(marketTrends, null, 2), "\n\n\u8BF7\u63D0\u4F9B\uFF1A\n1. \u77ED\u671F\u548C\u957F\u671F\u9884\u6D4B\n2. \u8F6C\u5316\u7387\u9884\u6D4B\n3. \u5B63\u8282\u6027\u56E0\u7D20\u5206\u6790\n4. \u5E02\u573A\u8D8B\u52BF\u5F71\u54CD\n5. \u9884\u6D4B\u7F6E\u4FE1\u5EA6\n6. \u5EFA\u8BAE\u63AA\u65BD\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u7ED3\u6784\u5316\u9884\u6D4B\u7ED3\u679C\u3002\n      ");
                        return [4 /*yield*/, this.aiBridge.analyze(prompt_2, {
                                type: 'forecast',
                                context: 'enrollment'
                            })];
                    case 4:
                        aiResponse = _a.sent();
                        result = this.parseForecastResponse(aiResponse, planId);
                        return [4 /*yield*/, this.saveAnalysisResult(planId, 'forecast', result)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_2 = _a.sent();
                        console.error('招生预测生成失败:', error_2);
                        throw new Error('AI预测服务暂时不可用');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 招生策略 - 生成个性化招生策略
     */
    AIEnrollmentService.prototype.generateEnrollmentStrategy = function (planId, objectives) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, competitorData, targetAudienceData, prompt_3, aiResponse, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId)];
                    case 1:
                        plan = _a.sent();
                        return [4 /*yield*/, this.getCompetitorAnalysisData()];
                    case 2:
                        competitorData = _a.sent();
                        return [4 /*yield*/, this.getTargetAudienceData()];
                    case 3:
                        targetAudienceData = _a.sent();
                        prompt_3 = "\n\u4F5C\u4E3A\u8425\u9500\u7B56\u7565\u4E13\u5BB6\uFF0C\u8BF7\u4E3A\u4EE5\u4E0B\u62DB\u751F\u8BA1\u5212\u5236\u5B9Acomprehensive\u7B56\u7565\uFF1A\n\n\u8BA1\u5212\u76EE\u6807\uFF1A\n".concat(JSON.stringify(objectives, null, 2), "\n\n\u7ADE\u4E89\u5BF9\u624B\u5206\u6790\uFF1A\n").concat(JSON.stringify(competitorData, null, 2), "\n\n\u76EE\u6807\u53D7\u4F17\u5206\u6790\uFF1A\n").concat(JSON.stringify(targetAudienceData, null, 2), "\n\n\u8BF7\u5236\u5B9A\u5305\u542B\u4EE5\u4E0B\u5185\u5BB9\u7684\u7B56\u7565\uFF1A\n1. \u76EE\u6807\u53D7\u4F17\u7EC6\u5206\n2. \u4EF7\u503C\u5B9A\u4F4D\n3. \u6E20\u9053\u7B56\u7565\n4. \u65F6\u95F4\u89C4\u5212\n5. \u9884\u7B97\u5206\u914D\n6. \u5173\u952E\u6307\u6807\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u7B56\u7565\u65B9\u6848\u3002\n      ");
                        return [4 /*yield*/, this.aiBridge.analyze(prompt_3, {
                                type: 'strategy',
                                context: 'enrollment'
                            })];
                    case 4:
                        aiResponse = _a.sent();
                        result = this.parseStrategyResponse(aiResponse, planId);
                        return [4 /*yield*/, this.saveAnalysisResult(planId, 'strategy', result)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_3 = _a.sent();
                        console.error('招生策略生成失败:', error_3);
                        throw new Error('AI策略服务暂时不可用');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 容量优化 - 优化招生容量和资源配置
     */
    AIEnrollmentService.prototype.generateCapacityOptimization = function (planId) {
        return __awaiter(this, void 0, void 0, function () {
            var capacityData, resourceData, utilizationData, prompt_4, aiResponse, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getCapacityData(planId)];
                    case 1:
                        capacityData = _a.sent();
                        return [4 /*yield*/, this.getResourceData()];
                    case 2:
                        resourceData = _a.sent();
                        return [4 /*yield*/, this.getUtilizationData()];
                    case 3:
                        utilizationData = _a.sent();
                        prompt_4 = "\n\u4F5C\u4E3A\u8FD0\u8425\u4F18\u5316\u4E13\u5BB6\uFF0C\u8BF7\u57FA\u4E8E\u4EE5\u4E0B\u6570\u636E\u8FDB\u884C\u5BB9\u91CF\u4F18\u5316\u5206\u6790\uFF1A\n\n\u5F53\u524D\u5BB9\u91CF\u6570\u636E\uFF1A\n".concat(JSON.stringify(capacityData, null, 2), "\n\n\u8D44\u6E90\u6570\u636E\uFF1A\n").concat(JSON.stringify(resourceData, null, 2), "\n\n\u5229\u7528\u7387\u6570\u636E\uFF1A\n").concat(JSON.stringify(utilizationData, null, 2), "\n\n\u8BF7\u63D0\u4F9B\uFF1A\n1. \u5BB9\u91CF\u5206\u6790\u548C\u74F6\u9888\u8BC6\u522B\n2. \u6700\u4F18\u73ED\u7EA7\u914D\u7F6E\u5EFA\u8BAE\n3. \u8D44\u6E90\u5206\u914D\u4F18\u5316\n4. \u6548\u7387\u63D0\u5347\u65B9\u6848\n5. \u6210\u672C\u6548\u76CA\u5206\u6790\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u4F18\u5316\u5EFA\u8BAE\u3002\n      ");
                        return [4 /*yield*/, this.aiBridge.analyze(prompt_4, {
                                type: 'optimization',
                                context: 'capacity'
                            })];
                    case 4:
                        aiResponse = _a.sent();
                        result = this.parseOptimizationResponse(aiResponse);
                        return [4 /*yield*/, this.saveAnalysisResult(planId, 'optimization', result)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_4 = _a.sent();
                        console.error('容量优化分析失败:', error_4);
                        throw new Error('AI优化服务暂时不可用');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 趋势分析 - 分析招生趋势和市场变化
     */
    AIEnrollmentService.prototype.generateTrendAnalysis = function (timeRange) {
        if (timeRange === void 0) { timeRange = '3years'; }
        return __awaiter(this, void 0, void 0, function () {
            var historicalTrends, marketData, demographicData, prompt_5, aiResponse, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.getHistoricalTrendData(timeRange)];
                    case 1:
                        historicalTrends = _a.sent();
                        return [4 /*yield*/, this.getCurrentMarketData()];
                    case 2:
                        marketData = _a.sent();
                        return [4 /*yield*/, this.getDemographicData()];
                    case 3:
                        demographicData = _a.sent();
                        prompt_5 = "\n\u4F5C\u4E3A\u5E02\u573A\u7814\u7A76\u4E13\u5BB6\uFF0C\u8BF7\u5206\u6790\u4EE5\u4E0B\u6570\u636E\u5E76\u63D0\u4F9B\u8D8B\u52BF\u5206\u6790\uFF1A\n\n\u5386\u53F2\u8D8B\u52BF\uFF08".concat(timeRange, "\uFF09\uFF1A\n").concat(JSON.stringify(historicalTrends, null, 2), "\n\n\u5F53\u524D\u5E02\u573A\u6570\u636E\uFF1A\n").concat(JSON.stringify(marketData, null, 2), "\n\n\u4EBA\u53E3\u7EDF\u8BA1\u6570\u636E\uFF1A\n").concat(JSON.stringify(demographicData, null, 2), "\n\n\u8BF7\u63D0\u4F9B\uFF1A\n1. \u5386\u53F2\u8D8B\u52BF\u5206\u6790\n2. \u5F53\u524D\u5E02\u573A\u72B6\u51B5\n3. \u672A\u6765\u8D8B\u52BF\u9884\u6D4B\n4. \u5E02\u573A\u6D1E\u5BDF\n5. \u7ADE\u4E89\u5206\u6790\n6. \u673A\u4F1A\u8BC6\u522B\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u5206\u6790\u7ED3\u679C\u3002\n      ");
                        return [4 /*yield*/, this.aiBridge.analyze(prompt_5, {
                                type: 'analysis',
                                context: 'trends'
                            })];
                    case 4:
                        aiResponse = _a.sent();
                        result = this.parseTrendAnalysisResponse(aiResponse);
                        return [4 /*yield*/, this.saveAnalysisResult(null, 'trend_analysis', result, 'global')];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_5 = _a.sent();
                        console.error('趋势分析失败:', error_5);
                        throw new Error('AI趋势分析服务暂时不可用');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 招生仿真 - 多场景仿真分析
     */
    AIEnrollmentService.prototype.generateEnrollmentSimulation = function (planId, scenarios) {
        return __awaiter(this, void 0, void 0, function () {
            var baseData, marketConditions, prompt_6, aiResponse, result, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getBaseSimulationData(planId)];
                    case 1:
                        baseData = _a.sent();
                        return [4 /*yield*/, this.getMarketConditions()];
                    case 2:
                        marketConditions = _a.sent();
                        prompt_6 = "\n\u4F5C\u4E3A\u4EFF\u771F\u5206\u6790\u4E13\u5BB6\uFF0C\u8BF7\u57FA\u4E8E\u4EE5\u4E0B\u6570\u636E\u8FDB\u884C\u591A\u573A\u666F\u62DB\u751F\u4EFF\u771F\uFF1A\n\n\u57FA\u7840\u6570\u636E\uFF1A\n".concat(JSON.stringify(baseData, null, 2), "\n\n\u5E02\u573A\u6761\u4EF6\uFF1A\n").concat(JSON.stringify(marketConditions, null, 2), "\n\n\u4EFF\u771F\u573A\u666F\uFF1A\n").concat(JSON.stringify(scenarios, null, 2), "\n\n\u8BF7\u4E3A\u6BCF\u4E2A\u573A\u666F\u63D0\u4F9B\uFF1A\n1. \u9884\u671F\u7533\u8BF7\u91CF\n2. \u5F55\u53D6\u7387\u9884\u6D4B\n3. \u6536\u5165\u9884\u6D4B\n4. \u6210\u529F\u6982\u7387\n5. \u98CE\u9669\u56E0\u7D20\n6. \u6700\u4F18\u573A\u666F\u63A8\u8350\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u4EFF\u771F\u7ED3\u679C\u3002\n      ");
                        return [4 /*yield*/, this.aiBridge.analyze(prompt_6, {
                                type: 'simulation',
                                context: 'enrollment'
                            })];
                    case 3:
                        aiResponse = _a.sent();
                        result = this.parseSimulationResponse(aiResponse);
                        return [4 /*yield*/, this.saveSimulationResult(planId, scenarios, result)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        error_6 = _a.sent();
                        console.error('招生仿真失败:', error_6);
                        throw new Error('AI仿真服务暂时不可用');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计划评估 - 综合评估招生计划
     */
    AIEnrollmentService.prototype.generatePlanEvaluation = function (planId) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, performanceData, benchmarkData, prompt_7, aiResponse, result, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId)];
                    case 1:
                        plan = _a.sent();
                        return [4 /*yield*/, this.getPlanPerformanceData(planId)];
                    case 2:
                        performanceData = _a.sent();
                        return [4 /*yield*/, this.getBenchmarkData()];
                    case 3:
                        benchmarkData = _a.sent();
                        prompt_7 = "\n\u4F5C\u4E3A\u6559\u80B2\u54A8\u8BE2\u4E13\u5BB6\uFF0C\u8BF7\u7EFC\u5408\u8BC4\u4F30\u4EE5\u4E0B\u62DB\u751F\u8BA1\u5212\uFF1A\n\n\u8BA1\u5212\u8BE6\u60C5\uFF1A\n".concat(JSON.stringify(plan, null, 2), "\n\n\u7EE9\u6548\u6570\u636E\uFF1A\n").concat(JSON.stringify(performanceData, null, 2), "\n\n\u884C\u4E1A\u57FA\u51C6\uFF1A\n").concat(JSON.stringify(benchmarkData, null, 2), "\n\n\u8BF7\u4ECE\u4EE5\u4E0B\u7EF4\u5EA6\u8FDB\u884C\u8BC4\u4F30\uFF1A\n1. \u5E02\u573A\u9002\u5E94\u6027 (Market Fit)\n2. \u53EF\u884C\u6027 (Feasibility)  \n3. \u76C8\u5229\u80FD\u529B (Profitability)\n4. \u53EF\u6301\u7EED\u6027 (Sustainability)\n5. \u521B\u65B0\u6027 (Innovation)\n\n\u4E3A\u6BCF\u4E2A\u7EF4\u5EA6\u63D0\u4F9B\u8BC4\u5206(0-100)\u548C\u8BE6\u7EC6\u53CD\u9988\uFF0C\u5E76\u4E0E\u884C\u4E1A\u57FA\u51C6\u5BF9\u6BD4\u3002\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u8BC4\u4F30\u7ED3\u679C\u3002\n      ");
                        return [4 /*yield*/, this.aiBridge.analyze(prompt_7, {
                                type: 'evaluation',
                                context: 'plan'
                            })];
                    case 4:
                        aiResponse = _a.sent();
                        result = this.parseEvaluationResponse(aiResponse, planId);
                        return [4 /*yield*/, this.saveAnalysisResult(planId, 'evaluation', result)];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_7 = _a.sent();
                        console.error('计划评估失败:', error_7);
                        throw new Error('AI评估服务暂时不可用');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    // 私有辅助方法
    AIEnrollmentService.prototype.getHistoricalEnrollmentData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findAll({
                            limit: 10,
                            order: [['createdAt', 'DESC']]
                        })];
                    case 1: 
                    // 获取历史招生数据
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AIEnrollmentService.prototype.getMarketAnalysisData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 获取市场分析数据
                return [2 /*return*/, {
                        competitorCount: 5,
                        averageTuition: 3000,
                        marketGrowthRate: 0.15
                    }];
            });
        });
    };
    AIEnrollmentService.prototype.getHistoricalApplicationData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findAll({
                            limit: 100,
                            order: [['createdAt', 'DESC']]
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    AIEnrollmentService.prototype.getSeasonalTrendData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 模拟季节性数据
                return [2 /*return*/, {
                        spring: { factor: 1.2, description: '春季招生高峰' },
                        summer: { factor: 0.8, description: '夏季相对淡季' },
                        autumn: { factor: 1.1, description: '秋季开学前' },
                        winter: { factor: 0.9, description: '冬季平稳期' }
                    }];
            });
        });
    };
    AIEnrollmentService.prototype.getMarketTrendData = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, {
                        demographics: 'increasing_young_families',
                        economy: 'stable_growth',
                        education_focus: 'high_quality_early_education'
                    }];
            });
        });
    };
    AIEnrollmentService.prototype.saveAnalysisResult = function (planId, analysisType, result, targetType) {
        if (targetType === void 0) { targetType = 'plan'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里应该保存到 ai_enrollment_analytics 表
                // 实际实现需要引入相应的模型
                console.log("\u4FDD\u5B58AI\u5206\u6790\u7ED3\u679C: ".concat(analysisType), { planId: planId, targetType: targetType });
                return [2 /*return*/];
            });
        });
    };
    AIEnrollmentService.prototype.saveSimulationResult = function (planId, scenarios, result) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 保存到 ai_enrollment_simulations 表
                console.log('保存仿真结果:', { planId: planId, scenarios: scenarios, result: result });
                return [2 /*return*/];
            });
        });
    };
    // 解析AI响应的私有方法
    AIEnrollmentService.prototype.parseSmartPlanningResponse = function (aiResponse, planId) {
        // 解析AI响应为结构化数据
        try {
            return {
                planId: planId,
                recommendations: aiResponse.recommendations || {},
                riskFactors: aiResponse.riskFactors || [],
                confidenceScore: aiResponse.confidenceScore || 0.8
            };
        }
        catch (error) {
            // 返回默认结构
            return {
                planId: planId,
                recommendations: {
                    targetCount: 50,
                    pricing: { suggested: 3000, rationale: '基于市场平均水平' },
                    timeline: { optimalStartDate: '2024-09-01', milestones: [] },
                    marketingStrategy: { channels: ['线上推广'], budget: 10000, expectedReach: 1000 }
                },
                riskFactors: [],
                confidenceScore: 0.8
            };
        }
    };
    AIEnrollmentService.prototype.parseForecastResponse = function (aiResponse, planId) {
        return {
            planId: planId,
            forecasts: aiResponse.forecasts || {},
            seasonalFactors: aiResponse.seasonalFactors || [],
            recommendations: aiResponse.recommendations || []
        };
    };
    AIEnrollmentService.prototype.parseStrategyResponse = function (aiResponse, planId) {
        return {
            planId: planId,
            strategies: aiResponse.strategies || {},
            timeline: aiResponse.timeline || {},
            budget: aiResponse.budget || {}
        };
    };
    AIEnrollmentService.prototype.parseOptimizationResponse = function (aiResponse) {
        return {
            capacityAnalysis: aiResponse.capacityAnalysis || {},
            classConfiguration: aiResponse.classConfiguration || {},
            resourceAllocation: aiResponse.resourceAllocation || {},
            efficiencyGains: aiResponse.efficiencyGains || {}
        };
    };
    AIEnrollmentService.prototype.parseTrendAnalysisResponse = function (aiResponse) {
        return {
            trends: aiResponse.trends || {},
            marketInsights: aiResponse.marketInsights || {},
            competitorAnalysis: aiResponse.competitorAnalysis || {}
        };
    };
    AIEnrollmentService.prototype.parseSimulationResponse = function (aiResponse) {
        return {
            simulationId: 'sim_' + Date.now(),
            scenarios: aiResponse.scenarios || [],
            recommendations: aiResponse.recommendations || {}
        };
    };
    AIEnrollmentService.prototype.parseEvaluationResponse = function (aiResponse, planId) {
        return {
            planId: planId,
            overallScore: aiResponse.overallScore || 75,
            dimensions: aiResponse.dimensions || {},
            benchmarks: aiResponse.benchmarks || {},
            improvementAreas: aiResponse.improvementAreas || []
        };
    };
    // 其他数据获取方法的占位符实现
    AIEnrollmentService.prototype.getCompetitorAnalysisData = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getTargetAudienceData = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getCapacityData = function (planId) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getResourceData = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getUtilizationData = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getHistoricalTrendData = function (timeRange) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getCurrentMarketData = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getDemographicData = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getBaseSimulationData = function (planId) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getMarketConditions = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getPlanPerformanceData = function (planId) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    AIEnrollmentService.prototype.getBenchmarkData = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/, {}];
        }); });
    };
    return AIEnrollmentService;
}());
exports.AIEnrollmentService = AIEnrollmentService;
