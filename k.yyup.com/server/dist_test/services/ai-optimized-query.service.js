"use strict";
/**
 * AI优化查询服务
 * 集成智能模型路由和并行处理优化
 */
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.AIOptimizedQueryService = void 0;
var ai_smart_model_router_service_1 = __importStar(require("./ai-smart-model-router.service"));
var ai_bridge_service_1 = require("./ai/bridge/ai-bridge.service");
var ai_query_cache_service_1 = __importDefault(require("./ai-query-cache.service"));
var ai_progress_event_service_1 = __importDefault(require("./ai-progress-event.service"));
var AIOptimizedQueryService = /** @class */ (function () {
    function AIOptimizedQueryService() {
        this.cacheService = ai_query_cache_service_1["default"];
        this.modelRouter = ai_smart_model_router_service_1["default"];
        this.progressService = ai_progress_event_service_1["default"];
    }
    AIOptimizedQueryService.getInstance = function () {
        if (!AIOptimizedQueryService.instance) {
            AIOptimizedQueryService.instance = new AIOptimizedQueryService();
        }
        return AIOptimizedQueryService.instance;
    };
    /**
     * 优化版查询处理 - 主要入口点 (带实时进度)
     */
    AIOptimizedQueryService.prototype.processOptimizedQuery = function (queryText, userId, sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, optimizationApplied, effectiveSessionId, cachedResult, modelSelection, result, executionTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        optimizationApplied = [];
                        effectiveSessionId = sessionId || "query_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 11, , 12]);
                        console.log('🚀 [OptimizedAI] 开始处理优化查询:', queryText);
                        // 第一步：检查缓存
                        return [4 /*yield*/, this.progressService.sendProgress(effectiveSessionId, 'cache_check', '检查缓存结果...', 35)];
                    case 2:
                        // 第一步：检查缓存
                        _a.sent();
                        return [4 /*yield*/, this.cacheService.getCachedResult(queryText, userId)];
                    case 3:
                        cachedResult = _a.sent();
                        if (!cachedResult) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.progressService.sendProgress(effectiveSessionId, 'cache_hit', '找到缓存结果，直接返回', 100)];
                    case 4:
                        _a.sent();
                        optimizationApplied.push('cache_hit');
                        return [2 /*return*/, __assign(__assign({}, cachedResult), { metadata: __assign(__assign({}, cachedResult.metadata), { optimizationApplied: optimizationApplied }) })];
                    case 5: 
                    // 第二步：智能模型选择
                    return [4 /*yield*/, this.progressService.sendProgress(effectiveSessionId, 'model_select', '分析查询意图并选择最优AI模型...', 25)];
                    case 6:
                        // 第二步：智能模型选择
                        _a.sent();
                        return [4 /*yield*/, this.modelRouter.selectOptimalModel(queryText)];
                    case 7:
                        modelSelection = _a.sent();
                        console.log('🎯 [OptimizedAI] 选择模型:', modelSelection.modelName);
                        return [4 /*yield*/, this.executeOptimizedQueryWithProgress(queryText, userId, effectiveSessionId, modelSelection, optimizationApplied)];
                    case 8:
                        result = _a.sent();
                        executionTime = Date.now() - startTime;
                        console.log("\u26A1 [OptimizedAI] \u67E5\u8BE2\u5B8C\u6210\uFF0C\u8017\u65F6: ".concat(executionTime, "ms"));
                        // 保存到缓存
                        return [4 /*yield*/, this.cacheService.saveQueryResult(queryText, userId, result.type === 'data_query' ? 'data_query' : 'ai_response', result, effectiveSessionId, modelSelection.modelName, executionTime)];
                    case 9:
                        // 保存到缓存
                        _a.sent();
                        // 完成进度
                        return [4 /*yield*/, this.progressService.sendProgress(effectiveSessionId, 'complete', '查询完成', 100)];
                    case 10:
                        // 完成进度
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, result), { metadata: __assign(__assign({}, result.metadata), { executionTime: executionTime, optimizationApplied: optimizationApplied }) })];
                    case 11:
                        error_1 = _a.sent();
                        console.error('❌ [OptimizedAI] 查询处理失败:', error_1);
                        if (this.progressService.getActiveSession(effectiveSessionId)) {
                            this.progressService.handleProgressError(effectiveSessionId, error_1);
                        }
                        throw error_1;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行优化查询 (带实时进度反馈)
     */
    AIOptimizedQueryService.prototype.executeOptimizedQueryWithProgress = function (queryText, userId, sessionId, modelSelection, optimizationApplied) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, complexityType, steps, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        analysis = modelSelection.analysis;
                        complexityType = analysis.complexity <= 3 ? 'simple' :
                            analysis.complexity <= 6 ? 'medium' : 'complex';
                        steps = this.progressService.getQuerySteps(complexityType);
                        // 初始化进度跟踪
                        this.progressService.startProgressTracking({
                            sessionId: sessionId,
                            queryId: "query_".concat(Date.now()),
                            userId: userId,
                            totalSteps: steps.length,
                            onComplete: function (result) {
                                console.log("\u2705 [Progress] \u67E5\u8BE2 ".concat(sessionId, " \u5B8C\u6210"));
                            },
                            onError: function (error) {
                                console.error("\u274C [Progress] \u67E5\u8BE2 ".concat(sessionId, " \u5931\u8D25:"), error);
                            }
                        });
                        _a = analysis.type;
                        switch (_a) {
                            case ai_smart_model_router_service_1.QueryType.COUNT: return [3 /*break*/, 1];
                            case ai_smart_model_router_service_1.QueryType.STATUS_CHECK: return [3 /*break*/, 1];
                            case ai_smart_model_router_service_1.QueryType.SIMPLE_QUESTION: return [3 /*break*/, 4];
                            case ai_smart_model_router_service_1.QueryType.BASIC_EXPLANATION: return [3 /*break*/, 7];
                            case ai_smart_model_router_service_1.QueryType.DATA_QUERY: return [3 /*break*/, 10];
                            case ai_smart_model_router_service_1.QueryType.ANALYSIS: return [3 /*break*/, 14];
                            case ai_smart_model_router_service_1.QueryType.TOOL_CALLING: return [3 /*break*/, 18];
                        }
                        return [3 /*break*/, 22];
                    case 1:
                        optimizationApplied.push('ultra_fast_model');
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'execute', '执行快速查询...', 70)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.handleSimpleQuery(queryText, modelSelection)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        optimizationApplied.push('fast_response_model');
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'execute', '执行AI问答...', 70)];
                    case 5:
                        _b.sent();
                        return [4 /*yield*/, this.handleSimpleQuestion(queryText, modelSelection)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7:
                        optimizationApplied.push('medium_fast_model');
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'execute', '执行解释查询...', 70)];
                    case 8:
                        _b.sent();
                        return [4 /*yield*/, this.handleBasicExplanation(queryText, modelSelection)];
                    case 9: return [2 /*return*/, _b.sent()];
                    case 10:
                        optimizationApplied.push('standard_model');
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'data_prepare', '准备查询数据...', 45)];
                    case 11:
                        _b.sent();
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'execute', '执行数据查询...', 75)];
                    case 12:
                        _b.sent();
                        return [4 /*yield*/, this.handleDataQuery(queryText, userId, sessionId, modelSelection)];
                    case 13: return [2 /*return*/, _b.sent()];
                    case 14:
                        optimizationApplied.push('thinking_model');
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'data_prepare', '准备分析数据...', 45)];
                    case 15:
                        _b.sent();
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'execute', '执行深度分析...', 75)];
                    case 16:
                        _b.sent();
                        return [4 /*yield*/, this.handleAnalysis(queryText, userId, sessionId, modelSelection)];
                    case 17: return [2 /*return*/, _b.sent()];
                    case 18:
                        optimizationApplied.push('tool_model');
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'data_prepare', '准备工具调用...', 45)];
                    case 19:
                        _b.sent();
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'execute', '执行工具调用...', 75)];
                    case 20:
                        _b.sent();
                        return [4 /*yield*/, this.handleToolCalling(queryText, userId, sessionId, modelSelection)];
                    case 21: return [2 /*return*/, _b.sent()];
                    case 22:
                        optimizationApplied.push('default_model');
                        return [4 /*yield*/, this.progressService.sendProgress(sessionId, 'execute', '执行默认查询...', 70)];
                    case 23:
                        _b.sent();
                        return [4 /*yield*/, this.handleDefaultQuery(queryText, userId, sessionId, modelSelection)];
                    case 24: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    /**
     * 执行优化查询
     */
    AIOptimizedQueryService.prototype.executeOptimizedQuery = function (queryText, userId, sessionId, modelSelection, optimizationApplied) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        analysis = modelSelection.analysis;
                        _a = analysis.type;
                        switch (_a) {
                            case ai_smart_model_router_service_1.QueryType.COUNT: return [3 /*break*/, 1];
                            case ai_smart_model_router_service_1.QueryType.STATUS_CHECK: return [3 /*break*/, 1];
                            case ai_smart_model_router_service_1.QueryType.SIMPLE_QUESTION: return [3 /*break*/, 3];
                            case ai_smart_model_router_service_1.QueryType.BASIC_EXPLANATION: return [3 /*break*/, 5];
                            case ai_smart_model_router_service_1.QueryType.DATA_QUERY: return [3 /*break*/, 7];
                            case ai_smart_model_router_service_1.QueryType.ANALYSIS: return [3 /*break*/, 9];
                            case ai_smart_model_router_service_1.QueryType.TOOL_CALLING: return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1:
                        optimizationApplied.push('ultra_fast_model');
                        return [4 /*yield*/, this.handleSimpleQuery(queryText, modelSelection)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3:
                        optimizationApplied.push('fast_response_model');
                        return [4 /*yield*/, this.handleSimpleQuestion(queryText, modelSelection)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5:
                        optimizationApplied.push('medium_fast_model');
                        return [4 /*yield*/, this.handleBasicExplanation(queryText, modelSelection)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7:
                        optimizationApplied.push('standard_model');
                        return [4 /*yield*/, this.handleDataQuery(queryText, userId, sessionId, modelSelection)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9:
                        optimizationApplied.push('thinking_model');
                        return [4 /*yield*/, this.handleAnalysis(queryText, userId, sessionId, modelSelection)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11:
                        optimizationApplied.push('tool_model');
                        return [4 /*yield*/, this.handleToolCalling(queryText, userId, sessionId, modelSelection)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13:
                        optimizationApplied.push('default_model');
                        return [4 /*yield*/, this.handleDefaultQuery(queryText, userId, sessionId, modelSelection)];
                    case 14: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    /**
     * 处理简单查询（统计、状态检查）
     */
    AIOptimizedQueryService.prototype.handleSimpleQuery = function (queryText, modelSelection) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var modelName, analysis, optimizedPrompt, response, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        modelName = modelSelection.modelName, analysis = modelSelection.analysis;
                        optimizedPrompt = this.buildOptimizedPrompt(queryText, analysis.type);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: modelName,
                                messages: [
                                    {
                                        role: 'system',
                                        content: '你是一个高效的查询助手。请简洁准确地回答问题，输出限制在50字以内。'
                                    },
                                    {
                                        role: 'user',
                                        content: optimizedPrompt
                                    }
                                ],
                                temperature: 0.1,
                                max_tokens: analysis.estimatedTokens
                            }, {
                                endpointUrl: modelSelection.modelConfig.endpointUrl,
                                apiKey: modelSelection.modelConfig.apiKey
                            })];
                    case 2:
                        response = _d.sent();
                        return [2 /*return*/, {
                                type: 'ai_response',
                                response: ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '无法处理查询',
                                metadata: {
                                    executionTime: 0,
                                    usedModel: modelName,
                                    queryType: analysis.type,
                                    complexity: analysis.complexity,
                                    estimatedTokens: analysis.estimatedTokens,
                                    actualTokens: ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.total_tokens) || 0,
                                    cacheHit: false,
                                    optimizationApplied: []
                                }
                            }];
                    case 3:
                        error_2 = _d.sent();
                        console.error('❌ [SimpleQuery] 处理失败:', error_2);
                        throw error_2;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理简单问答
     */
    AIOptimizedQueryService.prototype.handleSimpleQuestion = function (queryText, modelSelection) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var modelName, analysis, response;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        modelName = modelSelection.modelName, analysis = modelSelection.analysis;
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: modelName,
                                messages: [
                                    {
                                        role: 'system',
                                        content: '请直接准确地回答问题，输出限制在100字以内。'
                                    },
                                    {
                                        role: 'user',
                                        content: queryText
                                    }
                                ],
                                temperature: 0.2,
                                max_tokens: analysis.estimatedTokens
                            }, {
                                endpointUrl: modelSelection.modelConfig.endpointUrl,
                                apiKey: modelSelection.modelConfig.apiKey
                            })];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, {
                                type: 'ai_response',
                                response: ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '无法回答问题',
                                metadata: {
                                    executionTime: 0,
                                    usedModel: modelName,
                                    queryType: analysis.type,
                                    complexity: analysis.complexity,
                                    estimatedTokens: analysis.estimatedTokens,
                                    actualTokens: ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.total_tokens) || 0,
                                    cacheHit: false,
                                    optimizationApplied: []
                                }
                            }];
                }
            });
        });
    };
    /**
     * 处理基础解释
     */
    AIOptimizedQueryService.prototype.handleBasicExplanation = function (queryText, modelSelection) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var modelName, analysis, response;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        modelName = modelSelection.modelName, analysis = modelSelection.analysis;
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: modelName,
                                messages: [
                                    {
                                        role: 'system',
                                        content: '请用简洁明了的语言解释问题，输出限制在200字以内。'
                                    },
                                    {
                                        role: 'user',
                                        content: queryText
                                    }
                                ],
                                temperature: 0.3,
                                max_tokens: analysis.estimatedTokens
                            }, {
                                endpointUrl: modelSelection.modelConfig.endpointUrl,
                                apiKey: modelSelection.modelConfig.apiKey
                            })];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, {
                                type: 'ai_response',
                                response: ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '无法解释',
                                metadata: {
                                    executionTime: 0,
                                    usedModel: modelName,
                                    queryType: analysis.type,
                                    complexity: analysis.complexity,
                                    estimatedTokens: analysis.estimatedTokens,
                                    actualTokens: ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.total_tokens) || 0,
                                    cacheHit: false,
                                    optimizationApplied: []
                                }
                            }];
                }
            });
        });
    };
    /**
     * 处理数据查询
     */
    AIOptimizedQueryService.prototype.handleDataQuery = function (queryText, userId, sessionId, modelSelection) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里可以调用原有的数据查询逻辑
                // 目前返回模拟结果
                return [2 /*return*/, {
                        type: 'ai_response',
                        response: "\u6570\u636E\u67E5\u8BE2\u7ED3\u679C: ".concat(queryText),
                        metadata: {
                            executionTime: 0,
                            usedModel: modelSelection.modelName,
                            queryType: modelSelection.analysis.type,
                            complexity: modelSelection.analysis.complexity,
                            estimatedTokens: modelSelection.analysis.estimatedTokens,
                            cacheHit: false,
                            optimizationApplied: []
                        }
                    }];
            });
        });
    };
    /**
     * 处理分析查询
     */
    AIOptimizedQueryService.prototype.handleAnalysis = function (queryText, userId, sessionId, modelSelection) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var modelName, analysis, response;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        modelName = modelSelection.modelName, analysis = modelSelection.analysis;
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: modelName,
                                messages: [
                                    {
                                        role: 'system',
                                        content: '你是一个专业的数据分析师，请提供详细的分析结果。'
                                    },
                                    {
                                        role: 'user',
                                        content: queryText
                                    }
                                ],
                                temperature: 0.7,
                                max_tokens: analysis.estimatedTokens
                            }, {
                                endpointUrl: modelSelection.modelConfig.endpointUrl,
                                apiKey: modelSelection.modelConfig.apiKey
                            })];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, {
                                type: 'ai_response',
                                response: ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '无法分析',
                                metadata: {
                                    executionTime: 0,
                                    usedModel: modelName,
                                    queryType: analysis.type,
                                    complexity: analysis.complexity,
                                    estimatedTokens: analysis.estimatedTokens,
                                    actualTokens: ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.total_tokens) || 0,
                                    cacheHit: false,
                                    optimizationApplied: []
                                }
                            }];
                }
            });
        });
    };
    /**
     * 处理工具调用
     */
    AIOptimizedQueryService.prototype.handleToolCalling = function (queryText, userId, sessionId, modelSelection) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里可以实现工具调用逻辑
                return [2 /*return*/, {
                        type: 'ai_response',
                        response: "\u5DE5\u5177\u8C03\u7528\u7ED3\u679C: ".concat(queryText),
                        metadata: {
                            executionTime: 0,
                            usedModel: modelSelection.modelName,
                            queryType: modelSelection.analysis.type,
                            complexity: modelSelection.analysis.complexity,
                            estimatedTokens: modelSelection.analysis.estimatedTokens,
                            cacheHit: false,
                            optimizationApplied: []
                        }
                    }];
            });
        });
    };
    /**
     * 处理默认查询
     */
    AIOptimizedQueryService.prototype.handleDefaultQuery = function (queryText, userId, sessionId, modelSelection) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                            model: modelSelection.modelName,
                            messages: [
                                {
                                    role: 'system',
                                    content: '你是一个智能助手，请准确回答用户问题。'
                                },
                                {
                                    role: 'user',
                                    content: queryText
                                }
                            ],
                            temperature: 0.7,
                            max_tokens: modelSelection.analysis.estimatedTokens
                        }, {
                            endpointUrl: modelSelection.modelConfig.endpointUrl,
                            apiKey: modelSelection.modelConfig.apiKey
                        })];
                    case 1:
                        response = _d.sent();
                        return [2 /*return*/, {
                                type: 'ai_response',
                                response: ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '无法处理',
                                metadata: {
                                    executionTime: 0,
                                    usedModel: modelSelection.modelName,
                                    queryType: modelSelection.analysis.type,
                                    complexity: modelSelection.analysis.complexity,
                                    estimatedTokens: modelSelection.analysis.estimatedTokens,
                                    actualTokens: ((_c = response.usage) === null || _c === void 0 ? void 0 : _c.total_tokens) || 0,
                                    cacheHit: false,
                                    optimizationApplied: []
                                }
                            }];
                }
            });
        });
    };
    /**
     * 构建优化提示词
     */
    AIOptimizedQueryService.prototype.buildOptimizedPrompt = function (queryText, queryType) {
        switch (queryType) {
            case ai_smart_model_router_service_1.QueryType.COUNT:
                return "\u8BF7\u7EDF\u8BA1\u67E5\u8BE2: ".concat(queryText, "\u3002\u53EA\u9700\u8FD4\u56DE\u6570\u5B57\u6216\u7B80\u8981\u7ED3\u679C\u3002");
            case ai_smart_model_router_service_1.QueryType.STATUS_CHECK:
                return "\u8BF7\u68C0\u67E5\u72B6\u6001: ".concat(queryText, "\u3002\u53EA\u9700\u8FD4\u56DE\"\u662F\"\u6216\"\u5426\"\uFF0C\u6216\u7B80\u77ED\u72B6\u6001\u3002");
            default:
                return queryText;
        }
    };
    /**
     * 获取性能统计
     */
    AIOptimizedQueryService.prototype.getPerformanceStats = function () {
        return {
            modelRouter: this.modelRouter.getModelPerformanceStats(),
            cacheStats: this.cacheService.getCacheStats()
        };
    };
    return AIOptimizedQueryService;
}());
exports.AIOptimizedQueryService = AIOptimizedQueryService;
exports["default"] = AIOptimizedQueryService.getInstance();
