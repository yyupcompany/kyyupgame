"use strict";
/**
 * AI智能模型路由服务
 * 根据查询类型和复杂度自动选择最优的AI模型
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.SmartModelRouterService = exports.ExecutionPhase = exports.QueryType = void 0;
var ai_model_cache_service_1 = __importDefault(require("./ai-model-cache.service"));
var QueryType;
(function (QueryType) {
    QueryType["COUNT"] = "count";
    QueryType["STATUS_CHECK"] = "status_check";
    QueryType["SIMPLE_QUESTION"] = "simple_question";
    QueryType["BASIC_EXPLANATION"] = "basic_explanation";
    QueryType["DATA_QUERY"] = "data_query";
    QueryType["ANALYSIS"] = "analysis";
    QueryType["TOOL_CALLING"] = "tool_calling";
    QueryType["MULTIMODAL"] = "multimodal"; // 多模态：包含图片、文档等
})(QueryType = exports.QueryType || (exports.QueryType = {}));
/**
 * AI任务执行阶段枚举
 * 用于区分任务的不同执行阶段，以便选择最优模型
 */
var ExecutionPhase;
(function (ExecutionPhase) {
    ExecutionPhase["PLANNING"] = "planning";
    ExecutionPhase["EXECUTION"] = "execution";
    ExecutionPhase["MIXED"] = "mixed"; // 混合阶段：包含规划和执行的复合任务
})(ExecutionPhase = exports.ExecutionPhase || (exports.ExecutionPhase = {}));
var SmartModelRouterService = /** @class */ (function () {
    function SmartModelRouterService() {
    }
    SmartModelRouterService.getInstance = function () {
        if (!SmartModelRouterService.instance) {
            SmartModelRouterService.instance = new SmartModelRouterService();
        }
        return SmartModelRouterService.instance;
    };
    /**
     * 分析查询并选择最优模型
     */
    SmartModelRouterService.prototype.selectOptimalModel = function (queryText, options) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, selectedModel, modelConfig, error_1, defaultModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 5]);
                        console.log('🤖 [SmartRouter] 开始分析查询:', queryText);
                        if (options === null || options === void 0 ? void 0 : options.phase) {
                            console.log("\uD83D\uDD04 [SmartRouter] \u6267\u884C\u9636\u6BB5: ".concat(options.phase));
                        }
                        analysis = this.analyzeQuery(queryText, options);
                        console.log('📊 [SmartRouter] 查询分析结果:', analysis);
                        return [4 /*yield*/, this.selectModelByAnalysis(analysis, options)];
                    case 1:
                        selectedModel = _a.sent();
                        console.log('🎯 [SmartRouter] 选择模型:', selectedModel.modelName);
                        return [4 /*yield*/, ai_model_cache_service_1["default"].getModelByName(selectedModel.modelName)];
                    case 2:
                        modelConfig = _a.sent();
                        if (!modelConfig) {
                            throw new Error("\u627E\u4E0D\u5230\u6A21\u578B\u914D\u7F6E: ".concat(selectedModel.modelName));
                        }
                        return [2 /*return*/, {
                                modelName: selectedModel.modelName,
                                modelConfig: modelConfig,
                                analysis: analysis,
                                estimatedTime: selectedModel.estimatedTime
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ [SmartRouter] 智能模型选择失败:', error_1);
                        return [4 /*yield*/, ai_model_cache_service_1["default"].getDefaultModel()];
                    case 4:
                        defaultModel = _a.sent();
                        return [2 /*return*/, {
                                modelName: (defaultModel === null || defaultModel === void 0 ? void 0 : defaultModel.name) || 'doubao-seed-1-6-flash-250715',
                                modelConfig: defaultModel,
                                analysis: {
                                    type: QueryType.DATA_QUERY,
                                    complexity: 5,
                                    estimatedTokens: 500,
                                    keywords: [],
                                    requiresTools: false,
                                    requiresMultimodal: false
                                },
                                estimatedTime: 2000
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 基于工具名称和执行阶段选择最优模型
     * 这是新增的核心优化方法
     */
    SmartModelRouterService.prototype.selectModelForTool = function (toolName, phase, userQuery) {
        if (phase === void 0) { phase = ExecutionPhase.EXECUTION; }
        return __awaiter(this, void 0, void 0, function () {
            var planningTools, executionTools, selectedModelName, reason, estimatedTime, analysis, modelConfig, error_2, defaultModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        console.log("\uD83D\uDD27 [SmartRouter] \u4E3A\u5DE5\u5177\u9009\u62E9\u6A21\u578B: ".concat(toolName, " (\u9636\u6BB5: ").concat(phase, ")"));
                        planningTools = [
                            'analyze_task_complexity',
                            'create_todo_list',
                            'generate_execution_plan',
                            'workflow_analysis',
                            'complex_reasoning'
                        ];
                        executionTools = [
                            'get_student_list',
                            'get_teacher_list',
                            'get_class_list',
                            'create_data_record',
                            'update_data_record',
                            'delete_data_record',
                            'navigate_to_page',
                            'render_component',
                            'get_page_structure',
                            'simple_query'
                        ];
                        selectedModelName = void 0;
                        reason = void 0;
                        estimatedTime = void 0;
                        // 1. 强制规划阶段工具使用Thinking模型
                        if (planningTools.includes(toolName) || phase === ExecutionPhase.PLANNING) {
                            selectedModelName = 'doubao-seed-1-6-thinking-250615';
                            reason = "\u89C4\u5212\u9636\u6BB5\u5DE5\u5177 ".concat(toolName, " \u4F7F\u7528Thinking\u6A21\u578B\u786E\u4FDD\u5206\u6790\u8D28\u91CF");
                            estimatedTime = 3000;
                            console.log("\uD83E\uDDE0 [SmartRouter] ".concat(reason));
                        }
                        // 2. 执行阶段工具优先使用Flash模型
                        else if (executionTools.includes(toolName) || phase === ExecutionPhase.EXECUTION) {
                            selectedModelName = 'doubao-seed-1-6-flash-250715';
                            reason = "\u6267\u884C\u9636\u6BB5\u5DE5\u5177 ".concat(toolName, " \u4F7F\u7528Flash\u6A21\u578B\u63D0\u5347\u54CD\u5E94\u901F\u5EA6");
                            estimatedTime = 1500;
                            console.log("\u26A1 [SmartRouter] ".concat(reason));
                        }
                        // 3. 混合阶段或未知工具，根据查询复杂度选择
                        else {
                            if (userQuery) {
                                analysis = this.analyzeQuery(userQuery);
                                if (analysis.complexity >= 6) {
                                    selectedModelName = 'doubao-seed-1-6-thinking-250615';
                                    reason = "\u590D\u6742\u67E5\u8BE2 (\u590D\u6742\u5EA6: ".concat(analysis.complexity, ") \u4F7F\u7528Thinking\u6A21\u578B");
                                    estimatedTime = 3000;
                                }
                                else {
                                    selectedModelName = 'doubao-seed-1-6-flash-250715';
                                    reason = "\u7B80\u5355\u67E5\u8BE2 (\u590D\u6742\u5EA6: ".concat(analysis.complexity, ") \u4F7F\u7528Flash\u6A21\u578B");
                                    estimatedTime = 1500;
                                }
                            }
                            else {
                                // 默认使用Flash模型
                                selectedModelName = 'doubao-seed-1-6-flash-250715';
                                reason = "\u672A\u77E5\u5DE5\u5177 ".concat(toolName, " \u9ED8\u8BA4\u4F7F\u7528Flash\u6A21\u578B");
                                estimatedTime = 2000;
                            }
                            console.log("\uD83E\uDD14 [SmartRouter] ".concat(reason));
                        }
                        return [4 /*yield*/, ai_model_cache_service_1["default"].getModelByName(selectedModelName)];
                    case 1:
                        modelConfig = _a.sent();
                        if (!modelConfig) {
                            throw new Error("\u627E\u4E0D\u5230\u6A21\u578B\u914D\u7F6E: ".concat(selectedModelName));
                        }
                        return [2 /*return*/, {
                                modelName: selectedModelName,
                                modelConfig: modelConfig,
                                reason: reason,
                                estimatedTime: estimatedTime
                            }];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ [SmartRouter] 工具模型选择失败:', error_2);
                        return [4 /*yield*/, ai_model_cache_service_1["default"].getDefaultModel()];
                    case 3:
                        defaultModel = _a.sent();
                        return [2 /*return*/, {
                                modelName: (defaultModel === null || defaultModel === void 0 ? void 0 : defaultModel.name) || 'doubao-seed-1-6-flash-250715',
                                modelConfig: defaultModel,
                                reason: '选择失败，降级到默认Flash模型',
                                estimatedTime: 2000
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 分析查询内容和复杂度
     */
    SmartModelRouterService.prototype.analyzeQuery = function (queryText, options) {
        var lowerText = queryText.toLowerCase().trim();
        // 关键词匹配
        var countKeywords = ['多少', '数量', '几个', '总数', '统计', '计数', 'count', 'number'];
        var statusKeywords = ['是否', '状态', '在线', '可用', '正常', 'status', 'available', 'online'];
        var simpleQuestionKeywords = ['什么', '是', '吗', '呢', 'what', 'is', 'how', 'why'];
        var basicExplanationKeywords = ['为什么', '如何', '怎样', 'why', 'how', 'explain'];
        var dataKeywords = ['查询', '显示', '列出', 'search', 'show', 'list', 'get'];
        var analysisKeywords = ['分析', '对比', '比较', '分析', 'analyze', 'compare', 'difference'];
        var toolKeywords = ['调用', '执行', '发送', 'call', 'execute', 'send', '操作'];
        var multimodalKeywords = ['图片', '文档', 'pdf', 'image', 'document', 'file'];
        // 确定查询类型
        var type;
        var complexity = 1;
        var estimatedTokens = 50;
        if (countKeywords.some(function (keyword) { return lowerText.includes(keyword); })) {
            type = QueryType.COUNT;
            complexity = 1;
            estimatedTokens = 20;
        }
        else if (statusKeywords.some(function (keyword) { return lowerText.includes(keyword); })) {
            type = QueryType.STATUS_CHECK;
            complexity = 1;
            estimatedTokens = 30;
        }
        else if (simpleQuestionKeywords.some(function (keyword) { return lowerText.includes(keyword); })) {
            type = QueryType.SIMPLE_QUESTION;
            complexity = 2;
            estimatedTokens = 100;
        }
        else if (basicExplanationKeywords.some(function (keyword) { return lowerText.includes(keyword); })) {
            type = QueryType.BASIC_EXPLANATION;
            complexity = 3;
            estimatedTokens = 200;
        }
        else if (dataKeywords.some(function (keyword) { return lowerText.includes(keyword); })) {
            type = QueryType.DATA_QUERY;
            complexity = 4;
            estimatedTokens = 500;
        }
        else if (analysisKeywords.some(function (keyword) { return lowerText.includes(keyword); })) {
            type = QueryType.ANALYSIS;
            complexity = 6;
            estimatedTokens = 1000;
        }
        else if (toolKeywords.some(function (keyword) { return lowerText.includes(keyword); })) {
            type = QueryType.TOOL_CALLING;
            complexity = 7;
            estimatedTokens = 800;
        }
        else if (multimodalKeywords.some(function (keyword) { return lowerText.includes(keyword); })) {
            type = QueryType.MULTIMODAL;
            complexity = 8;
            estimatedTokens = 1500;
        }
        else {
            // 默认为数据查询
            type = QueryType.DATA_QUERY;
            complexity = 5;
            estimatedTokens = 500;
        }
        // 根据查询长度调整复杂度
        if (lowerText.length > 100)
            complexity += 1;
        if (lowerText.length > 200)
            complexity += 1;
        if (lowerText.includes('详细') || lowerText.includes('全面'))
            complexity += 2;
        // 根据关键词数量调整
        var keywords = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], countKeywords.filter(function (kw) { return lowerText.includes(kw); }), true), statusKeywords.filter(function (kw) { return lowerText.includes(kw); }), true), simpleQuestionKeywords.filter(function (kw) { return lowerText.includes(kw); }), true), basicExplanationKeywords.filter(function (kw) { return lowerText.includes(kw); }), true);
        if (keywords.length > 3)
            complexity += 1;
        return {
            type: type,
            complexity: Math.min(complexity, 10),
            estimatedTokens: estimatedTokens,
            keywords: keywords,
            requiresTools: type === QueryType.TOOL_CALLING,
            requiresMultimodal: type === QueryType.MULTIMODAL,
            phase: options === null || options === void 0 ? void 0 : options.phase // 添加执行阶段信息
        };
    };
    /**
     * 根据分析结果选择模型
     */
    SmartModelRouterService.prototype.selectModelByAnalysis = function (analysis, options) {
        return __awaiter(this, void 0, void 0, function () {
            var type, complexity, estimatedTokens, requiresTools, requiresMultimodal, phase, currentPhase;
            return __generator(this, function (_a) {
                type = analysis.type, complexity = analysis.complexity, estimatedTokens = analysis.estimatedTokens, requiresTools = analysis.requiresTools, requiresMultimodal = analysis.requiresMultimodal, phase = analysis.phase;
                // 🚀 新增：执行阶段优化逻辑
                if ((options === null || options === void 0 ? void 0 : options.phase) || phase) {
                    currentPhase = (options === null || options === void 0 ? void 0 : options.phase) || phase;
                    // 规划阶段：优先使用Thinking模型
                    if (currentPhase === ExecutionPhase.PLANNING) {
                        console.log('🧠 [SmartRouter] 规划阶段，选择Thinking模型');
                        return [2 /*return*/, { modelName: 'doubao-seed-1-6-thinking-250615', estimatedTime: 3000 }];
                    }
                    // 执行阶段：优先使用Flash模型（除非复杂度很高）
                    if (currentPhase === ExecutionPhase.EXECUTION && complexity <= 6) {
                        console.log('⚡ [SmartRouter] 执行阶段，选择Flash模型');
                        return [2 /*return*/, { modelName: 'doubao-seed-1-6-flash-250715', estimatedTime: 1500 }];
                    }
                }
                // 🔧 强制模型选择
                if (options === null || options === void 0 ? void 0 : options.forceModel) {
                    console.log("\uD83C\uDFAF [SmartRouter] \u5F3A\u5236\u4F7F\u7528\u6307\u5B9A\u6A21\u578B: ".concat(options.forceModel));
                    return [2 /*return*/, { modelName: options.forceModel, estimatedTime: 2000 }];
                }
                // 📋 原有逻辑：基于查询类型和复杂度的模型选择
                // 优先级规则模型选择
                if (requiresMultimodal) {
                    return [2 /*return*/, { modelName: 'Doubao-Seed-1.6', estimatedTime: 3000 }];
                }
                if (requiresTools) {
                    return [2 /*return*/, { modelName: 'Doubao-Seed-1.6', estimatedTime: 2500 }];
                }
                if (type === QueryType.COUNT || type === QueryType.STATUS_CHECK) {
                    return [2 /*return*/, { modelName: 'doubao-ultra-fast-100', estimatedTime: 500 }];
                }
                if (type === QueryType.SIMPLE_QUESTION && complexity <= 2) {
                    return [2 /*return*/, { modelName: 'doubao-ultra-fast-100', estimatedTime: 800 }];
                }
                if (type === QueryType.BASIC_EXPLANATION && complexity <= 3) {
                    return [2 /*return*/, { modelName: 'doubao-fast-200', estimatedTime: 1200 }];
                }
                if (complexity <= 4 && estimatedTokens <= 500) {
                    return [2 /*return*/, { modelName: 'doubao-seed-1-6-flash-250715', estimatedTime: 1500 }];
                }
                if (type === QueryType.ANALYSIS && complexity >= 6) {
                    return [2 /*return*/, { modelName: 'doubao-seed-1-6-thinking-250615', estimatedTime: 3000 }];
                }
                // 默认选择Flash模型
                return [2 /*return*/, { modelName: 'doubao-seed-1-6-flash-250715', estimatedTime: 2000 }];
            });
        });
    };
    /**
     * 批量查询模型选择优化
     */
    SmartModelRouterService.prototype.selectModelsForBatch = function (queries) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, queries_1, query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        results = [];
                        _i = 0, queries_1 = queries;
                        _a.label = 1;
                    case 1:
                        if (!(_i < queries_1.length)) return [3 /*break*/, 4];
                        query = queries_1[_i];
                        return [4 /*yield*/, this.selectOptimalModel(query)];
                    case 2:
                        result = _a.sent();
                        results.push({
                            query: query,
                            modelName: result.modelName,
                            analysis: result.analysis
                        });
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: 
                    // 尝试合并相似查询以减少API调用
                    return [2 /*return*/, this.optimizeBatchQueries(results)];
                }
            });
        });
    };
    /**
     * 优化批量查询
     */
    SmartModelRouterService.prototype.optimizeBatchQueries = function (results) {
        // 这里可以实现查询合并逻辑
        // 比如相似的统计查询可以合并为一个调用
        // 目前返回原始结果
        return results;
    };
    /**
     * 获取模型性能统计
     */
    SmartModelRouterService.prototype.getModelPerformanceStats = function () {
        return {
            'doubao-ultra-fast-100': {
                avgResponseTime: 0.5,
                successRate: 98.5,
                queryTypes: [QueryType.COUNT, QueryType.STATUS_CHECK]
            },
            'doubao-fast-200': {
                avgResponseTime: 1.2,
                successRate: 97.8,
                queryTypes: [QueryType.SIMPLE_QUESTION, QueryType.BASIC_EXPLANATION]
            },
            'doubao-seed-1-6-flash-250715': {
                avgResponseTime: 2.0,
                successRate: 96.5,
                queryTypes: [QueryType.DATA_QUERY]
            },
            'doubao-seed-1-6-thinking-250615': {
                avgResponseTime: 3.5,
                successRate: 95.2,
                queryTypes: [QueryType.ANALYSIS]
            },
            'Doubao-Seed-1.6': {
                avgResponseTime: 4.0,
                successRate: 94.8,
                queryTypes: [QueryType.TOOL_CALLING, QueryType.MULTIMODAL]
            }
        };
    };
    return SmartModelRouterService;
}());
exports.SmartModelRouterService = SmartModelRouterService;
exports["default"] = SmartModelRouterService.getInstance();
