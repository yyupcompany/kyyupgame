"use strict";
/**
 * 统一智能决策中心
 * 负责统一分析用户请求，智能选择最优工具，协调执行并整合结果
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
exports.UnifiedIntelligenceService = exports.ToolType = exports.ToolCapability = exports.TaskComplexity = exports.IntentType = void 0;
var rbac_middleware_1 = require("../../middlewares/rbac.middleware");
var six_dimension_memory_service_1 = require("../memory/six-dimension-memory.service");
var model_selector_service_1 = __importDefault(require("../ai/model-selector.service"));
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var tool_manager_service_1 = require("../ai/tools/core/tool-manager.service");
var ai_smart_model_router_service_1 = require("../ai-smart-model-router.service");
var tool_loader_service_1 = require("../ai/tools/core/tool-loader.service");
var tool_description_generator_service_1 = require("../ai/tools/tool-description-generator.service");
// 统一最大迭代次数配置（优先读取 AI_MAX_ITERATIONS，其次兼容 VITE_AI_MAX_ITERATIONS；默认 12）
var ENV_MAX_ITERS = Number(process.env.AI_MAX_ITERATIONS || process.env.VITE_AI_MAX_ITERATIONS || 12);
var IntentType;
(function (IntentType) {
    IntentType["PAGE_OPERATION"] = "page_operation";
    IntentType["DATA_VISUALIZATION"] = "data_visualization";
    IntentType["TASK_MANAGEMENT"] = "task_management";
    IntentType["EXPERT_CONSULTATION"] = "expert_consultation";
    IntentType["INFORMATION_QUERY"] = "information_query";
    IntentType["COMPLEX_WORKFLOW"] = "complex_workflow"; // 复杂工作流请求
})(IntentType = exports.IntentType || (exports.IntentType = {}));
var TaskComplexity;
(function (TaskComplexity) {
    TaskComplexity["SIMPLE"] = "simple";
    TaskComplexity["MODERATE"] = "moderate";
    TaskComplexity["COMPLEX"] = "complex";
    TaskComplexity["VERY_COMPLEX"] = "very_complex"; // 7+个步骤，需要分解
})(TaskComplexity = exports.TaskComplexity || (exports.TaskComplexity = {}));
var ToolCapability;
(function (ToolCapability) {
    ToolCapability["PAGE_AWARENESS"] = "page_awareness";
    ToolCapability["DOM_MANIPULATION"] = "dom_manipulation";
    ToolCapability["NAVIGATION"] = "navigation";
    ToolCapability["DATA_VISUALIZATION"] = "data_visualization";
    ToolCapability["TASK_DECOMPOSITION"] = "task_decomposition";
    ToolCapability["EXPERT_CONSULTATION"] = "expert_consultation";
    ToolCapability["FORM_PROCESSING"] = "form_processing";
    ToolCapability["STATE_VALIDATION"] = "state_validation";
})(ToolCapability = exports.ToolCapability || (exports.ToolCapability = {}));
var ToolType;
(function (ToolType) {
    ToolType["PAGE_AWARENESS"] = "page_awareness";
    ToolType["ACTION_EXECUTION"] = "action_execution";
    ToolType["DATA_VISUALIZATION"] = "data_visualization";
    ToolType["COGNITIVE"] = "cognitive";
    ToolType["EXPERT_CONSULTATION"] = "expert_consultation";
})(ToolType = exports.ToolType || (exports.ToolType = {}));
/**
 * 统一智能决策服务
 */
var UnifiedIntelligenceService = /** @class */ (function () {
    function UnifiedIntelligenceService() {
        // 初始化六维记忆服务
        this.memoryService = (0, six_dimension_memory_service_1.getMemorySystem)();
        // 初始化工具加载器（用于生成工具预说明）
        this.toolLoader = new tool_loader_service_1.ToolLoaderService();
        // 🚀 初始化智能模型路由器
        this.smartModelRouter = ai_smart_model_router_service_1.SmartModelRouterService.getInstance();
        console.log('🧠 [UnifiedIntelligence] 六维记忆系统已初始化');
        console.log('🎯 [UnifiedIntelligence] 智能模型路由器已初始化');
    }
    /**
     * 从查询中提取动作 - 使用查询路由服务的统一匹配逻辑
     */
    UnifiedIntelligenceService.prototype.extractActionFromQuery = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var queryRouterService, directMatch, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/query-router.service')); })];
                    case 1:
                        queryRouterService = (_a.sent()).queryRouterService;
                        directMatch = queryRouterService.checkDirectMatch(query);
                        if (directMatch && directMatch.action) {
                            console.log("\uD83C\uDFAF [extractActionFromQuery] \u5339\u914D\u5230\u52A8\u4F5C: ".concat(directMatch.action, " for query: ").concat(query));
                            return [2 /*return*/, directMatch.action];
                        }
                        console.log("\u26A0\uFE0F [extractActionFromQuery] \u672A\u5339\u914D\u5230\u52A8\u4F5C for query: ".concat(query));
                        return [2 /*return*/, null];
                    case 2:
                        error_1 = _a.sent();
                        console.error("\u274C [extractActionFromQuery] \u5BFC\u5165\u67E5\u8BE2\u8DEF\u7531\u670D\u52A1\u5931\u8D25:", error_1);
                        return [2 /*return*/, null];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 三级分级检索处理入口 - 智能选择最优处理方式
     */
    UnifiedIntelligenceService.prototype.processUserRequest = function (request) {
        var _a, _b, _c, _d, _e;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, securityCheck, memoryResult, relevantMemories, enrichedRequest, aiResponse, response, error_2;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        startTime = Date.now();
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 6, , 7]);
                        console.log('🧠 [UnifiedIntelligence] 开始三级分级检索处理:', request.content);
                        console.log('🎯 [TRACE-15] 进入 processUserRequest 方法，isDirectMode =', (_a = request.context) === null || _a === void 0 ? void 0 : _a.isDirectMode);
                        return [4 /*yield*/, this.performSecurityCheck(request)];
                    case 2:
                        securityCheck = _f.sent();
                        if (!securityCheck.allowed) {
                            console.warn('🚨 [Security] 权限检查失败:', securityCheck.reason);
                            return [2 /*return*/, this.createSecurityDeniedResponse(securityCheck, Date.now() - startTime)];
                        }
                        // ===== 架构简化：跳过Level-1-Enhanced，直接进入AI处理 =====
                        console.log('🚀 [架构简化] 跳过Level-1-Enhanced，直接进入AI智能工具选择...');
                        // ===== 架构简化：直接进入Level-3 AI处理 =====
                        console.log('🤖 [架构简化] 直接启用大模型深度处理...');
                        // 检查特殊情况的覆盖设置（保持兼容性）
                        if (((_b = request === null || request === void 0 ? void 0 : request.context) === null || _b === void 0 ? void 0 : _b.levelOverride) === 'level-3' || ((_c = request === null || request === void 0 ? void 0 : request.context) === null || _c === void 0 ? void 0 : _c.levelOverride) === 'complex') {
                            console.log('⏭️ [Override] 特殊情况覆盖，继续使用Level-3处理');
                        }
                        // 检查网页搜索标志（保持兼容性）
                        if (((_d = request === null || request === void 0 ? void 0 : request.context) === null || _d === void 0 ? void 0 : _d.enableWebSearch) === true) {
                            console.log('🔍 [WebSearch] 检测到网页搜索请求，使用完整AI处理');
                        }
                        // 2. 检索相关记忆（启用优化统计）
                        console.log('🔍 [Memory] 检索相关记忆...');
                        return [4 /*yield*/, this.retrieveRelevantMemories(request, true)];
                    case 3:
                        memoryResult = _f.sent();
                        relevantMemories = memoryResult.memories;
                        console.log("\uD83D\uDCDA [Memory] \u68C0\u7D22\u5230 ".concat(relevantMemories.length, " \u6761\u76F8\u5173\u8BB0\u5FC6"));
                        enrichedRequest = __assign(__assign({}, request), { memoryContext: relevantMemories, complexityContext: { level: 'complex', score: 0.9, reasoning: '架构简化：直接使用AI智能工具选择' } });
                        console.log('🎯 [TRACE-17] 准备调用 processWithAI，isDirectMode =', (_e = enrichedRequest.context) === null || _e === void 0 ? void 0 : _e.isDirectMode);
                        return [4 /*yield*/, this.processWithAI(enrichedRequest)];
                    case 4:
                        aiResponse = _f.sent();
                        console.log('🤖 [Level-3] 大模型处理完成');
                        // 5. 存储新的记忆
                        console.log('💾 [Memory] 存储新记忆...');
                        return [4 /*yield*/, this.storeNewMemory(request, aiResponse)];
                    case 5:
                        _f.sent();
                        response = this.createSuccessResponse(aiResponse, Date.now() - startTime);
                        if (response.metadata) {
                            response.metadata.level = 'level-3';
                            response.metadata.approach = 'multi_round_with_tools';
                        }
                        console.log('✅ [Level-3] 大模型响应完成');
                        return [2 /*return*/, response];
                    case 6:
                        error_2 = _f.sent();
                        console.error('❌ [UnifiedIntelligence] 三级检索处理失败:', error_2);
                        return [2 /*return*/, this.createErrorResponse(error_2, Date.now() - startTime)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 评估查询复杂度
     */
    UnifiedIntelligenceService.prototype.evaluateQueryComplexity = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var queryLower, simplePatterns, mediumPatterns, complexPatterns, _i, simplePatterns_1, pattern, _a, mediumPatterns_1, pattern, _b, complexPatterns_1, pattern, dynamicScore;
            return __generator(this, function (_c) {
                queryLower = query.toLowerCase();
                simplePatterns = [
                    /^(学生|教师|家长|客户)总数$/,
                    /^(招生|活动|通知|文件|任务)统计$/,
                    /^(系统状态|健康检查)$/,
                    /^(绩效|通知|存储|我的任务)$/
                ];
                mediumPatterns = [
                    /查询.*统计/,
                    /分析.*数据/,
                    /生成.*报告/,
                    /比较.*情况/
                ];
                complexPatterns = [
                    // 原有模式
                    /创建|生成.*活动/,
                    /制定.*计划/,
                    /设计.*方案/,
                    /分析.*趋势.*预测/,
                    // 多步骤操作模式 - 更灵活的匹配
                    /(查询|搜索).*(然后|接着|再).*(分析|总结|处理)/,
                    /(获取|查找).*(数据|信息).*(分析|处理)/,
                    /(数据库|搜索).*(结果|数据).*(分析|搜索)/,
                    // 工具调用组合模式 - 降低匹配门槛
                    /工具.*调用/,
                    /多个.*步骤/,
                    /(综合|全面|深度).*(处理|分析)/,
                    // 复杂业务场景
                    /策划.*执行/,
                    /优化.*建议/,
                    /完整.*流程/,
                    /系统.*分析/,
                    /专业.*建议/,
                    // 英文复杂模式 - 重新设计更宽松的匹配
                    /(query|search).*(then|and).*(search|analyze|provide)/i,
                    /(database|data).*(search|query).*(analysis|analyze)/i,
                    /(comprehensive|detailed|complete).*(analysis|report)/i,
                    /(multi|multiple).*(step|stage|phase)/i,
                    /(complex|advanced).*(workflow|process)/i,
                    /provide.*(comprehensive|detailed|complete)/i
                ];
                // 检查简单模式
                for (_i = 0, simplePatterns_1 = simplePatterns; _i < simplePatterns_1.length; _i++) {
                    pattern = simplePatterns_1[_i];
                    if (pattern.test(queryLower)) {
                        return [2 /*return*/, {
                                level: 'simple',
                                score: 0.2,
                                reasoning: '匹配简单查询模式，可用轻量级处理'
                            }];
                    }
                }
                // 检查中等模式
                for (_a = 0, mediumPatterns_1 = mediumPatterns; _a < mediumPatterns_1.length; _a++) {
                    pattern = mediumPatterns_1[_a];
                    if (pattern.test(queryLower)) {
                        return [2 /*return*/, {
                                level: 'medium',
                                score: 0.5,
                                reasoning: '匹配中等复杂度模式，需要数据分析'
                            }];
                    }
                }
                // 检查复杂模式
                for (_b = 0, complexPatterns_1 = complexPatterns; _b < complexPatterns_1.length; _b++) {
                    pattern = complexPatterns_1[_b];
                    if (pattern.test(queryLower)) {
                        console.log("\uD83C\uDFAF [\u590D\u6742\u5EA6\u8BC4\u4F30] \u5339\u914D\u5230\u590D\u6742\u6A21\u5F0F: ".concat(pattern.source));
                        return [2 /*return*/, {
                                level: 'complex',
                                score: 0.8,
                                reasoning: '匹配复杂查询模式，需要大模型处理'
                            }];
                    }
                }
                dynamicScore = this.calculateDynamicComplexity(query);
                console.log("\uD83D\uDCCA [\u590D\u6742\u5EA6\u8BC4\u4F30] \u52A8\u6001\u8BC4\u5206: ".concat(dynamicScore, ", \u67E5\u8BE2: \"").concat(query.substring(0, 50), "...\""));
                if (dynamicScore >= 0.7) {
                    console.log("\uD83D\uDE80 [\u590D\u6742\u5EA6\u8BC4\u4F30] \u52A8\u6001\u8BC4\u4F30\u89E6\u53D1Level-3: ".concat(dynamicScore));
                    return [2 /*return*/, {
                            level: 'complex',
                            score: dynamicScore,
                            reasoning: "\u52A8\u6001\u8BC4\u4F30\u4E3A\u9AD8\u590D\u6742\u5EA6(".concat(dynamicScore, ")\uFF0C\u9700\u8981\u5927\u6A21\u578B\u5904\u7406")
                        }];
                }
                // 默认中等复杂度
                console.log("\u26A1 [\u590D\u6742\u5EA6\u8BC4\u4F30] \u4F7F\u7528\u8F7B\u91CF\u7EA7\u5904\u7406: ".concat(Math.max(dynamicScore, 0.4)));
                return [2 /*return*/, {
                        level: 'medium',
                        score: Math.max(dynamicScore, 0.4),
                        reasoning: "\u52A8\u6001\u8BC4\u4F30\u590D\u6742\u5EA6(".concat(dynamicScore, ")\uFF0C\u4F7F\u7528\u8F7B\u91CF\u7EA7\u5904\u7406")
                    }];
            });
        });
    };
    /**
     * 动态复杂度评估
     */
    UnifiedIntelligenceService.prototype.calculateDynamicComplexity = function (query) {
        var score = 0;
        var queryLower = query.toLowerCase();
        // 1. 查询长度评分 (最大0.2分)
        if (query.length > 50)
            score += 0.1;
        if (query.length > 100)
            score += 0.1;
        // 2. 多步骤操作关键词 (每个0.15分)
        var multiStepKeywords = ['然后', '接着', '之后', '再', '并且', '同时', 'then', 'and then', 'after'];
        var multiStepCount = multiStepKeywords.filter(function (keyword) { return queryLower.includes(keyword); }).length;
        score += Math.min(multiStepCount * 0.15, 0.3);
        // 3. 工具调用关键词 (每个0.1分)
        var toolKeywords = ['查询', '搜索', '分析', '生成', '创建', '导航', '截图', '填写', 'search', 'analyze', 'create', 'navigate'];
        var toolCount = toolKeywords.filter(function (keyword) { return queryLower.includes(keyword); }).length;
        score += Math.min(toolCount * 0.1, 0.4);
        // 4. 复杂分析关键词 (每个0.2分)
        var analysisKeywords = ['全面', '深度', '综合', '详细', '完整', '系统', 'comprehensive', 'detailed', 'complete'];
        var analysisCount = analysisKeywords.filter(function (keyword) { return queryLower.includes(keyword); }).length;
        score += Math.min(analysisCount * 0.2, 0.4);
        // 5. 业务复杂度关键词 (每个0.15分)
        var businessKeywords = ['策划', '优化', '建议', '方案', '流程', '策略', 'strategy', 'optimize', 'workflow'];
        var businessCount = businessKeywords.filter(function (keyword) { return queryLower.includes(keyword); }).length;
        score += Math.min(businessCount * 0.15, 0.3);
        // 6. 多目标操作 (0.2分)
        var multiTargetKeywords = ['多个', '各种', '所有', '全部', 'multiple', 'various', 'all'];
        if (multiTargetKeywords.some(function (keyword) { return queryLower.includes(keyword); })) {
            score += 0.2;
        }
        return Math.min(score, 1.0); // 最大1.0分
    };
    /**
     * 轻量级模型处理
     */
    UnifiedIntelligenceService.prototype.processWithLightModel = function (request, complexityResult) {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                try {
                    console.log('⚡ [LightModel] 轻量级模型处理已禁用，直接返回失败以升级到第三级');
                    response = {
                        success: false,
                        data: {
                            message: '轻量级处理跳过，升级到大模型处理',
                            toolExecutions: [],
                            uiComponents: [],
                            recommendations: [],
                            analysis: {
                                intent: 'escalate_to_full_ai',
                                complexity: complexityResult.level,
                                complexityScore: complexityResult.score
                            }
                        },
                        metadata: {
                            executionTime: 100,
                            toolsUsed: ['classifier'],
                            confidenceScore: 0.9,
                            nextSuggestedActions: [],
                            complexity: TaskComplexity.SIMPLE,
                            approach: 'escalate_to_level_3',
                            level: 'level-2'
                        }
                    };
                    return [2 /*return*/, response];
                }
                catch (error) {
                    console.error('❌ [LightModel] 轻量级处理失败:', error);
                    return [2 /*return*/, this.createErrorResponse(error, 1000)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 带实时进度推送的处理入口
     */
    UnifiedIntelligenceService.prototype.processUserRequestWithProgress = function (request, progressCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, securityCheck, aiResponse, response, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        console.log('🧠 [UnifiedIntelligence] 开始处理用户请求 (带进度):', request.content);
                        progressCallback('🔍 正在进行安全检查...');
                        return [4 /*yield*/, this.performSecurityCheck(request)];
                    case 2:
                        securityCheck = _a.sent();
                        if (!securityCheck.allowed) {
                            console.warn('🚨 [Security] 权限检查失败:', securityCheck.reason);
                            progressCallback('❌ 权限检查失败');
                            return [2 /*return*/, this.createSecurityDeniedResponse(securityCheck, Date.now() - startTime)];
                        }
                        progressCallback('✅ 安全检查通过，准备调用AI服务...');
                        return [4 /*yield*/, this.processWithAIProgress(request, progressCallback)];
                    case 3:
                        aiResponse = _a.sent();
                        console.log('🤖 [AI] 大模型处理完成');
                        progressCallback('🎯 AI处理完成，正在生成响应...');
                        response = this.createSuccessResponse(aiResponse, Date.now() - startTime);
                        console.log('✅ [Response] 响应生成完成');
                        progressCallback('✅ 响应已生成完成');
                        return [2 /*return*/, response];
                    case 4:
                        error_3 = _a.sent();
                        console.error('❌ [UnifiedIntelligence] 处理失败:', error_3);
                        progressCallback('❌ 处理失败: ' + error_3.message);
                        return [2 /*return*/, this.createErrorResponse(error_3, Date.now() - startTime)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 带进度回调的AI处理
     */
    UnifiedIntelligenceService.prototype.processWithAIProgress = function (request, progressCallback) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var messages, result, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        progressCallback('🔄 开始多轮智能处理...');
                        console.log('🔄 [MultiRound] 开始多轮智能处理...');
                        _b = {
                            role: 'system'
                        };
                        return [4 /*yield*/, this.buildSystemPrompt(((_a = request.context) === null || _a === void 0 ? void 0 : _a.role) || 'user', request.context)];
                    case 1:
                        messages = [
                            (_b.content = _c.sent(),
                                _b),
                            {
                                role: 'user',
                                content: request.content
                            }
                        ];
                        progressCallback('💭 正在构建对话上下文...');
                        return [4 /*yield*/, this.executeMultiRoundChatProgress(messages, request, progressCallback)];
                    case 2:
                        result = _c.sent();
                        progressCallback('🎉 多轮处理成功完成');
                        console.log('✅ [MultiRound] 多轮处理完成');
                        return [2 /*return*/, result];
                    case 3:
                        error_4 = _c.sent();
                        console.error('❌ [AI] 多轮处理失败:', error_4);
                        progressCallback('❌ AI处理失败');
                        throw new Error('AI处理失败: ' + error_4.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 带进度回调的多轮对话执行
     */
    UnifiedIntelligenceService.prototype.executeMultiRoundChatProgress = function (messages, request, progressCallback, maxIterations) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        if (maxIterations === void 0) { maxIterations = ENV_MAX_ITERS; }
        return __awaiter(this, void 0, void 0, function () {
            var axios, currentMessages, iterationCount, finalResult, conversationHistory, toolExecutions, stopAfterRender, FUNCTION_TOOLS, _loop_1, this_1, state_1;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        axios = require('axios');
                        currentMessages = __spreadArray([], messages, true);
                        iterationCount = 0;
                        finalResult = null;
                        conversationHistory = [];
                        toolExecutions = [];
                        stopAfterRender = false;
                        FUNCTION_TOOLS = this.getFunctionToolsDefinition();
                        _loop_1 = function () {
                            var isSimpleGreeting, allowTools, allowWeb, userRole, selection, modelConfig, filteredTools, mandatoryTools_1, webSearchTool, aiBridgeService, aiBridgeMessages, enableToolsFromFrontend, enableWebSearchFromFrontend, toolChoice, finalTools, isSearchIntent, response, streamResponse, aiMessage, renderedThisRound, i, toolCall, argsPreview, toolResult, error_5, hasSubstantialContent, error_6;
                            return __generator(this, function (_m) {
                                switch (_m.label) {
                                    case 0:
                                        iterationCount++;
                                        progressCallback("\uD83D\uDD04 \u5F00\u59CB\u7B2C ".concat(iterationCount, " \u8F6E\u5BF9\u8BDD..."));
                                        console.log("\uD83D\uDD04 \u5F00\u59CB\u7B2C ".concat(iterationCount, " \u8F6E\u5BF9\u8BDD..."));
                                        _m.label = 1;
                                    case 1:
                                        _m.trys.push([1, 14, , 15]);
                                        // 调用豆包AI模型
                                        progressCallback("\uD83E\uDD16 \u6B63\u5728\u8C03\u7528AI\u6A21\u578B (\u7B2C ".concat(iterationCount, " \u8F6E)..."));
                                        isSimpleGreeting = this_1.isSimpleGreeting(request.content);
                                        allowTools = !isSimpleGreeting;
                                        allowWeb = !!((_a = request === null || request === void 0 ? void 0 : request.context) === null || _a === void 0 ? void 0 : _a.enableWebSearch);
                                        console.log("\uD83D\uDD27 [\u667A\u80FD\u5DE5\u5177\u8C03\u7528] \u5DE5\u5177\u8C03\u7528\u914D\u7F6E: allowTools=".concat(allowTools, ", allowWeb=").concat(allowWeb, ", isSimpleGreeting=").concat(isSimpleGreeting));
                                        userRole = this_1.normalizeRole(((_b = request === null || request === void 0 ? void 0 : request.context) === null || _b === void 0 ? void 0 : _b.role) || 'parent');
                                        return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                                                modelType: ai_model_config_model_1.ModelType.TEXT,
                                                // 不再根据web_search能力选择模型，始终使用默认文本模型
                                                requireCapabilities: undefined
                                            })];
                                    case 2:
                                        selection = _m.sent();
                                        modelConfig = selection.model;
                                        filteredTools = [];
                                        if (allowTools) {
                                            mandatoryTools_1 = [
                                                'analyze_task_complexity',
                                                'create_todo_list',
                                                'update_todo_task',
                                                'get_todo_list',
                                                'delete_todo_task'
                                            ];
                                            // 加载强制性工具
                                            filteredTools = FUNCTION_TOOLS.filter(function (tool) {
                                                return mandatoryTools_1.includes(tool["function"].name);
                                            });
                                            // 如果启用网页搜索，添加web_search工具
                                            if (allowWeb) {
                                                webSearchTool = FUNCTION_TOOLS.find(function (tool) { return tool["function"].name === 'web_search'; });
                                                if (webSearchTool) {
                                                    filteredTools.push(webSearchTool);
                                                }
                                            }
                                        }
                                        else if (allowWeb) {
                                            // 仅启用网页搜索的情况
                                            filteredTools = [FUNCTION_TOOLS.find(function (tool) { return tool["function"].name === 'web_search'; })].filter(Boolean);
                                        }
                                        // 🛑 若上一轮已完成渲染，则本轮起不再提供任何工具，强制模型给出总结/答案
                                        if (stopAfterRender) {
                                            console.log('🛑 [ToolGate] 上一轮检测到渲染完成，本轮禁用工具定义并关闭工具调用');
                                            filteredTools = [];
                                        }
                                        console.log("\uD83D\uDD27 [DirectChat] \u5DE5\u5177\u914D\u7F6E: allowWeb=".concat(allowWeb, ", allowTools=").concat(allowTools));
                                        console.log("\uD83D\uDD27 [DirectChat] \u53EF\u7528\u5DE5\u5177\u6570\u91CF: ".concat(filteredTools.length));
                                        if (filteredTools.length > 0) {
                                            console.log("\uD83D\uDD27 [DirectChat] \u5DE5\u5177\u5217\u8868:", filteredTools.map(function (t) { return t["function"].name; }));
                                        }
                                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/bridge/ai-bridge.service')); })];
                                    case 3:
                                        aiBridgeService = (_m.sent()).aiBridgeService;
                                        aiBridgeMessages = (function () {
                                            // 先按原始结构拷贝必要字段
                                            var mapped = currentMessages.map(function (msg) {
                                                var base = { role: msg.role, content: msg.content };
                                                if (msg.role === 'tool' && msg.tool_call_id) {
                                                    base.tool_call_id = msg.tool_call_id;
                                                }
                                                if (msg.role === 'assistant' && msg.tool_calls) {
                                                    base.tool_calls = msg.tool_calls;
                                                }
                                                return base;
                                            });
                                            // 严格清洗：
                                            var sanitized = [];
                                            var lastAssistantToolCallIds = [];
                                            for (var _i = 0, mapped_1 = mapped; _i < mapped_1.length; _i++) {
                                                var m = mapped_1[_i];
                                                if (m.role === 'assistant') {
                                                    var ids = Array.isArray(m.tool_calls)
                                                        ? m.tool_calls.map(function (tc) { return tc === null || tc === void 0 ? void 0 : tc.id; }).filter(function (id) { return typeof id === 'string' && id.length > 0; })
                                                        : [];
                                                    lastAssistantToolCallIds = ids;
                                                    sanitized.push(m);
                                                    continue;
                                                }
                                                if (m.role === 'tool') {
                                                    if (!m.tool_call_id) {
                                                        console.warn('⚠️ [Sanitize] 丢弃非法 tool 消息：缺少 tool_call_id（以避免 400）');
                                                        continue;
                                                    }
                                                    if (!lastAssistantToolCallIds.includes(m.tool_call_id)) {
                                                        console.warn('⚠️ [Sanitize] 丢弃孤立 tool 消息：找不到匹配的 assistant.tool_calls id=', m.tool_call_id);
                                                        continue;
                                                    }
                                                    sanitized.push(m);
                                                    continue;
                                                }
                                                // 其他角色原样保留
                                                sanitized.push(m);
                                            }
                                            return sanitized;
                                        })();
                                        enableToolsFromFrontend = (_d = (_c = request === null || request === void 0 ? void 0 : request.context) === null || _c === void 0 ? void 0 : _c.enableTools) !== null && _d !== void 0 ? _d : false;
                                        enableWebSearchFromFrontend = (_f = (_e = request === null || request === void 0 ? void 0 : request.context) === null || _e === void 0 ? void 0 : _e.enableWebSearch) !== null && _f !== void 0 ? _f : false;
                                        toolChoice = 'none';
                                        finalTools = filteredTools;
                                        if (filteredTools.length > 0) {
                                            if (enableToolsFromFrontend === true) {
                                                // 智能代理开启：强制调用工具
                                                toolChoice = iterationCount === 1 ? 'required' : 'auto';
                                                console.log('🚀 [智能代理-多轮] 强制启用工具调用模式: required');
                                            }
                                            else if (enableWebSearchFromFrontend === true && filteredTools.length === 1 && filteredTools[0]["function"].name === 'web_search') {
                                                isSearchIntent = this_1.isSearchIntentQuery(request.content);
                                                toolChoice = isSearchIntent ? 'auto' : 'none';
                                                console.log("\uD83D\uDD0D [\u641C\u7D22\u6A21\u5F0F] \u641C\u7D22\u610F\u56FE=".concat(isSearchIntent, ", \u5DE5\u5177\u9009\u62E9=").concat(toolChoice));
                                                // 🔧 修复：如果不是搜索意图，清空工具列表
                                                if (!isSearchIntent) {
                                                    finalTools = [];
                                                }
                                            }
                                            else {
                                                // 其他情况：不调用工具
                                                toolChoice = 'none';
                                                finalTools = []; // 🔧 修复：清空工具列表，使用纯聊天模式
                                                console.log('⚠️ [工具调用] 智能代理未开启，禁用工具调用，使用纯聊天模式');
                                            }
                                        }
                                        return [4 /*yield*/, aiBridgeService.generateChatCompletionStream({
                                                model: modelConfig.name,
                                                messages: aiBridgeMessages,
                                                tools: finalTools,
                                                tool_choice: toolChoice,
                                                temperature: ((_g = modelConfig.modelParameters) === null || _g === void 0 ? void 0 : _g.temperature) || 0.7,
                                                max_tokens: ((_h = modelConfig.modelParameters) === null || _h === void 0 ? void 0 : _h.maxTokens) || 2000,
                                                stream: true
                                            }, {
                                                endpointUrl: modelConfig.endpointUrl,
                                                apiKey: modelConfig.apiKey
                                            }, undefined, (_j = request === null || request === void 0 ? void 0 : request.context) === null || _j === void 0 ? void 0 : _j.userId)];
                                    case 4:
                                        response = _m.sent();
                                        return [4 /*yield*/, this_1.handleStreamResponse(response, progressCallback, iterationCount, allowTools, allowWeb)];
                                    case 5:
                                        streamResponse = _m.sent();
                                        aiMessage = streamResponse.choices[0].message;
                                        console.log("\u2705 \u7B2C ".concat(iterationCount, " \u8F6EAI\u8C03\u7528\u6210\u529F"));
                                        progressCallback("\u2705 \u7B2C ".concat(iterationCount, " \u8F6EAI\u8C03\u7528\u6210\u529F"));
                                        // 添加AI响应到对话历史
                                        currentMessages.push(aiMessage);
                                        conversationHistory.push({
                                            iteration: iterationCount,
                                            request: currentMessages[currentMessages.length - 2],
                                            response: aiMessage
                                        });
                                        if (!(allowTools && aiMessage.tool_calls && aiMessage.tool_calls.length > 0)) return [3 /*break*/, 12];
                                        progressCallback("\uD83D\uDD27 \u7B2C ".concat(iterationCount, " \u8F6E\u68C0\u6D4B\u5230 ").concat(aiMessage.tool_calls.length, " \u4E2A\u5DE5\u5177\u8C03\u7528"));
                                        console.log("\uD83D\uDD27 \u7B2C ".concat(iterationCount, " \u8F6E\u68C0\u6D4B\u5230 ").concat(aiMessage.tool_calls.length, " \u4E2A\u5DE5\u5177\u8C03\u7528"));
                                        renderedThisRound = false;
                                        i = 0;
                                        _m.label = 6;
                                    case 6:
                                        if (!(i < aiMessage.tool_calls.length)) return [3 /*break*/, 11];
                                        toolCall = aiMessage.tool_calls[i];
                                        argsPreview = '无参数';
                                        try {
                                            if (toolCall["function"].arguments) {
                                                // 检查参数是否是有效的JSON
                                                if (typeof toolCall["function"].arguments === 'string') {
                                                    JSON.parse(toolCall["function"].arguments); // 验证JSON有效性
                                                    argsPreview = toolCall["function"].arguments.substring(0, 100);
                                                }
                                                else {
                                                    argsPreview = JSON.stringify(toolCall["function"].arguments).substring(0, 100);
                                                }
                                            }
                                        }
                                        catch (parseError) {
                                            console.warn("\u26A0\uFE0F \u5DE5\u5177\u8C03\u7528\u53C2\u6570\u89E3\u6790\u5931\u8D25: ".concat(toolCall["function"].name), parseError);
                                            argsPreview = '参数解析失败';
                                        }
                                        progressCallback("\uD83D\uDD27 \u6267\u884C\u5DE5\u5177: ".concat(toolCall["function"].name, "\uFF0C\u53C2\u6570: ").concat(argsPreview, "..."));
                                        console.log("\uD83D\uDD27 \u6267\u884C\u5DE5\u5177: ".concat(toolCall["function"].name, "\uFF0C\u53C2\u6570:"), toolCall["function"].arguments);
                                        _m.label = 7;
                                    case 7:
                                        _m.trys.push([7, 9, , 10]);
                                        return [4 /*yield*/, this_1.executeFunctionTool(toolCall, request, progressCallback)];
                                    case 8:
                                        toolResult = _m.sent();
                                        // 标记渲染完成
                                        if (((_k = toolCall["function"]) === null || _k === void 0 ? void 0 : _k.name) === 'render_component') {
                                            renderedThisRound = true;
                                        }
                                        progressCallback("\u2705 \u5DE5\u5177\u8C03\u7528\u6210\u529F: ".concat(toolCall["function"].name));
                                        // 添加工具结果到对话
                                        currentMessages.push({
                                            role: 'tool',
                                            tool_call_id: toolCall.id,
                                            content: JSON.stringify(toolResult)
                                        });
                                        // 记录工具执行
                                        toolExecutions.push({
                                            iteration: iterationCount,
                                            tool: toolCall["function"].name,
                                            arguments: toolCall["function"].arguments,
                                            result: toolResult,
                                            timestamp: new Date().toISOString()
                                        });
                                        return [3 /*break*/, 10];
                                    case 9:
                                        error_5 = _m.sent();
                                        console.error("\u274C \u5DE5\u5177\u8C03\u7528\u5931\u8D25: ".concat(toolCall["function"].name, ":"), error_5);
                                        progressCallback("\u274C \u5DE5\u5177\u8C03\u7528\u5931\u8D25: ".concat(toolCall["function"].name));
                                        // 添加错误结果到对话
                                        currentMessages.push({
                                            role: 'tool',
                                            tool_call_id: toolCall.id,
                                            content: JSON.stringify({
                                                error: '工具执行失败',
                                                details: error_5.message
                                            })
                                        });
                                        return [3 /*break*/, 10];
                                    case 10:
                                        i++;
                                        return [3 /*break*/, 6];
                                    case 11:
                                        // 若本轮已完成页面渲染，则从下一轮开始禁用工具，促使模型输出总结/答案
                                        if (renderedThisRound) {
                                            stopAfterRender = true;
                                            progressCallback('render_complete', { message: '页面渲染完成，进入总结阶段' });
                                            console.log('🎯 [ToolGate] 检测到 render_component，本轮后将禁用工具并进入答案阶段');
                                        }
                                        hasSubstantialContent = aiMessage.content &&
                                            typeof aiMessage.content === 'string' &&
                                            aiMessage.content.trim().length > 100;
                                        if (hasSubstantialContent && iterationCount >= 1) {
                                            stopAfterRender = true;
                                            progressCallback('answer_complete', { message: 'AI已给出实质性答案，准备收敛' });
                                            console.log('🎯 [ToolGate] 检测到实质性答案内容，下一轮将禁用工具强制收敛');
                                            console.log("\uD83D\uDCDD [\u7B54\u6848\u9884\u89C8] ".concat(aiMessage.content.substring(0, 200), "..."));
                                        }
                                        progressCallback("\uD83D\uDCCB \u7B2C ".concat(iterationCount, " \u8F6E\u5DE5\u5177\u8C03\u7528\u5B8C\u6210\uFF0C\u7EE7\u7EED\u4E0B\u4E00\u8F6E\u5BF9\u8BDD..."));
                                        console.log("\uD83D\uDCCB \u7B2C ".concat(iterationCount, " \u8F6E\u5DE5\u5177\u8C03\u7528\u5B8C\u6210\uFF0C\u7EE7\u7EED\u4E0B\u4E00\u8F6E\u5BF9\u8BDD..."));
                                        return [2 /*return*/, "continue"];
                                    case 12:
                                        // 没有工具调用，对话结束
                                        finalResult = {
                                            message: aiMessage.content || '处理完成',
                                            conversationHistory: conversationHistory,
                                            toolExecutions: toolExecutions,
                                            totalIterations: iterationCount,
                                            finalMessage: aiMessage
                                        };
                                        progressCallback("\u2705 \u5BF9\u8BDD\u5B8C\u6210\uFF0C\u5171\u8FDB\u884C\u4E86 ".concat(iterationCount, " \u8F6E"));
                                        console.log("\u2705 \u5BF9\u8BDD\u5B8C\u6210\uFF0C\u5171\u8FDB\u884C\u4E86 ".concat(iterationCount, " \u8F6E"));
                                        return [2 /*return*/, "break"];
                                    case 13: return [3 /*break*/, 15];
                                    case 14:
                                        error_6 = _m.sent();
                                        console.error("\u274C \u7B2C ".concat(iterationCount, " \u8F6E\u5BF9\u8BDD\u5931\u8D25:"), error_6);
                                        progressCallback("\u274C \u7B2C ".concat(iterationCount, " \u8F6E\u5BF9\u8BDD\u5931\u8D25"));
                                        if (iterationCount === 1) {
                                            // 第一轮就失败，直接抛出错误
                                            throw error_6;
                                        }
                                        else {
                                            // 后续轮次失败，使用已有结果
                                            finalResult = {
                                                message: '处理过程中遇到错误，但已完成部分操作',
                                                conversationHistory: conversationHistory,
                                                toolExecutions: toolExecutions,
                                                totalIterations: iterationCount - 1,
                                                error: error_6.message
                                            };
                                            return [2 /*return*/, "break"];
                                        }
                                        return [3 /*break*/, 15];
                                    case 15: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _l.label = 1;
                    case 1:
                        if (!(iterationCount < maxIterations)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        state_1 = _l.sent();
                        if (state_1 === "break")
                            return [3 /*break*/, 3];
                        return [3 /*break*/, 1];
                    case 3:
                        if (iterationCount >= maxIterations) {
                            progressCallback("\u26A0\uFE0F \u8FBE\u5230\u6700\u5927\u8FED\u4EE3\u6B21\u6570 ".concat(maxIterations, "\uFF0C\u505C\u6B62\u5904\u7406"));
                            console.log("\u26A0\uFE0F \u8FBE\u5230\u6700\u5927\u8FED\u4EE3\u6B21\u6570 ".concat(maxIterations, "\uFF0C\u505C\u6B62\u5904\u7406"));
                            finalResult = {
                                message: "\u5DF2\u5B8C\u6210 ".concat(maxIterations, " \u8F6E\u5904\u7406\uFF0C\u53EF\u80FD\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u4EFB\u52A1"),
                                conversationHistory: conversationHistory,
                                toolExecutions: toolExecutions,
                                totalIterations: maxIterations,
                                warning: 'max_iterations_reached'
                            };
                        }
                        return [2 /*return*/, finalResult];
                }
            });
        });
    };
    /**
     * 多轮智能处理请求（集成Function Tools功能）
     */
    UnifiedIntelligenceService.prototype.processWithAI = function (request) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, isSimpleGreeting, messages, memoryContent_1, result, error_7;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        console.log('🔄 [MultiRound] 开始多轮智能处理...');
                        console.log('🎯 [TRACE-18] 进入 processWithAI 方法，isDirectMode =', (_a = request.context) === null || _a === void 0 ? void 0 : _a.isDirectMode);
                        // 🔧 修复：构建系统提示词，不包含记忆上下文（记忆上下文将作为单独的消息）
                        console.log('🎯 [TRACE-19] 准备调用 buildSystemPrompt...');
                        return [4 /*yield*/, this.buildSystemPrompt(((_b = request.context) === null || _b === void 0 ? void 0 : _b.role) || 'user', request.context)];
                    case 1:
                        systemPrompt = _c.sent();
                        console.log('🎯 [TRACE-20] buildSystemPrompt 完成，系统提示词长度:', systemPrompt.length);
                        isSimpleGreeting = this.isSimpleGreeting(request.content);
                        messages = [
                            {
                                role: 'system',
                                content: systemPrompt
                            }
                        ];
                        // 🧠 如果有记忆上下文且不是简单问候语，作为单独的系统消息插入
                        if (request.memoryContext && request.memoryContext.length > 0 && !isSimpleGreeting) {
                            memoryContent_1 = '## 📚 相关记忆上下文\n';
                            memoryContent_1 += '基于用户的历史记忆，以下是相关的上下文信息：\n\n';
                            request.memoryContext.forEach(function (memory) {
                                memoryContent_1 += "- ".concat(memory.content, "\n");
                            });
                            memoryContent_1 += '\n请参考这些记忆信息，为用户提供更加个性化和连贯的服务。';
                            messages.push({
                                role: 'system',
                                content: memoryContent_1
                            });
                            console.log("\uD83E\uDDE0 [MultiRound] \u5DF2\u6DFB\u52A0 ".concat(request.memoryContext.length, " \u6761\u8BB0\u5FC6\u4E0A\u4E0B\u6587\uFF08\u4F5C\u4E3A\u5355\u72EC\u6D88\u606F\uFF09"));
                        }
                        // 添加用户消息
                        messages.push({
                            role: 'user',
                            content: request.content
                        });
                        // 执行多轮对话循环
                        console.log('🎯 [TRACE-26] 准备调用 executeMultiRoundChat...');
                        return [4 /*yield*/, this.executeMultiRoundChat(messages, request)];
                    case 2:
                        result = _c.sent();
                        console.log('✅ [MultiRound] 多轮处理完成');
                        return [2 /*return*/, result];
                    case 3:
                        error_7 = _c.sent();
                        console.error('❌ [AI] 多轮处理失败:', error_7);
                        throw new Error('AI处理失败: ' + error_7.message);
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行多轮对话处理
     */
    UnifiedIntelligenceService.prototype.executeMultiRoundChat = function (messages, request, maxIterations) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
        if (maxIterations === void 0) { maxIterations = ENV_MAX_ITERS; }
        return __awaiter(this, void 0, void 0, function () {
            var axios, currentMessages, iterationCount, finalResult, conversationHistory, toolExecutions, progressCallback, FUNCTION_TOOLS, _loop_2, this_2, state_2;
            var _this = this;
            return __generator(this, function (_p) {
                switch (_p.label) {
                    case 0:
                        axios = require('axios');
                        currentMessages = __spreadArray([], messages, true);
                        iterationCount = 0;
                        finalResult = null;
                        conversationHistory = [];
                        toolExecutions = [];
                        progressCallback = function (status, details) {
                            console.log("\uD83D\uDCCA [Progress] ".concat(status), details || '');
                        };
                        FUNCTION_TOOLS = this.getFunctionToolsDefinition();
                        _loop_2 = function () {
                            var isSimpleGreeting2, allowTools2, allowWeb2, userRole2, modelConfig, AIModelConfig_1, specifiedModel, selection2, selection2, filteredTools2, lastMessage, lastToolCall, aiBridgeService, aiBridgeMessages, toolChoice, isDirectMode, finalTools, forceNonStream, useStream, apiRequest, response, streamResponse, choice, message, isSimpleGreeting, friendlyResponse, parsedToolCalls_1, functionCallRegex, matches, aiReasoningContent_1, toolResultMessages, toolPromises, toolResults, _i, toolResults_1, toolResult, iterationError_1;
                            return __generator(this, function (_q) {
                                switch (_q.label) {
                                    case 0:
                                        iterationCount++;
                                        console.log("\uD83D\uDD04 \u5F00\u59CB\u7B2C ".concat(iterationCount, " \u8F6E\u5BF9\u8BDD..."));
                                        _q.label = 1;
                                    case 1:
                                        _q.trys.push([1, 16, , 17]);
                                        isSimpleGreeting2 = this_2.isSimpleGreeting(request.content);
                                        allowTools2 = !isSimpleGreeting2;
                                        allowWeb2 = !!((_a = request === null || request === void 0 ? void 0 : request.context) === null || _a === void 0 ? void 0 : _a.enableWebSearch);
                                        console.log("\uD83D\uDD27 [\u667A\u80FD\u5DE5\u5177\u8C03\u7528-\u8F6E\u6B21".concat(iterationCount, "] \u5DE5\u5177\u8C03\u7528\u914D\u7F6E: allowTools2=").concat(allowTools2, ", allowWeb2=").concat(allowWeb2, ", isSimpleGreeting=").concat(isSimpleGreeting2));
                                        userRole2 = this_2.normalizeRole(((_b = request === null || request === void 0 ? void 0 : request.context) === null || _b === void 0 ? void 0 : _b.role) || 'parent');
                                        modelConfig = void 0;
                                        if (!((_c = request === null || request === void 0 ? void 0 : request.context) === null || _c === void 0 ? void 0 : _c.modelName)) return [3 /*break*/, 7];
                                        console.log("\uD83C\uDFAF [ModelOverride] \u4F7F\u7528\u6307\u5B9A\u6A21\u578B: ".concat(request.context.modelName));
                                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
                                    case 2:
                                        AIModelConfig_1 = (_q.sent()).AIModelConfig;
                                        return [4 /*yield*/, AIModelConfig_1.findOne({
                                                where: {
                                                    name: request.context.modelName,
                                                    status: 'active'
                                                }
                                            })];
                                    case 3:
                                        specifiedModel = _q.sent();
                                        if (!specifiedModel) return [3 /*break*/, 4];
                                        modelConfig = specifiedModel;
                                        console.log("\u2705 [ModelOverride] \u6210\u529F\u52A0\u8F7D\u6307\u5B9A\u6A21\u578B: ".concat(modelConfig.name));
                                        return [3 /*break*/, 6];
                                    case 4:
                                        console.log("\u26A0\uFE0F [ModelOverride] \u672A\u627E\u5230\u6307\u5B9A\u6A21\u578B,\u4F7F\u7528\u9ED8\u8BA4\u6A21\u578B");
                                        return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                                                modelType: ai_model_config_model_1.ModelType.TEXT,
                                                requireCapabilities: undefined
                                            })];
                                    case 5:
                                        selection2 = _q.sent();
                                        modelConfig = selection2.model;
                                        _q.label = 6;
                                    case 6: return [3 /*break*/, 9];
                                    case 7: return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                                            modelType: ai_model_config_model_1.ModelType.TEXT,
                                            // 不再根据web_search能力选择模型，始终使用默认文本模型
                                            requireCapabilities: undefined
                                        })];
                                    case 8:
                                        selection2 = _q.sent();
                                        modelConfig = selection2.model;
                                        _q.label = 9;
                                    case 9:
                                        filteredTools2 = [];
                                        if (allowTools2) {
                                            lastMessage = currentMessages[currentMessages.length - 1];
                                            lastToolCall = (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.role) === 'assistant' && (lastMessage === null || lastMessage === void 0 ? void 0 : lastMessage.tool_calls)
                                                ? (_e = (_d = lastMessage.tool_calls[0]) === null || _d === void 0 ? void 0 : _d["function"]) === null || _e === void 0 ? void 0 : _e.name
                                                : null;
                                            console.log("\uD83D\uDD0D [ToolStage] \u5F53\u524D\u8F6E\u6B21: ".concat(iterationCount, ", \u4E0A\u4E00\u8F6E\u5DE5\u5177: ").concat(lastToolCall || '无'));
                                            // 🎯 放宽阶段限制：允许模型在各轮选择任意可用工具（更灵活的多工具调用）
                                            filteredTools2 = FUNCTION_TOOLS;
                                            console.log("\uD83D\uDFE2 [Tools] \u653E\u5BBD\u9636\u6BB5\u9650\u5236\uFF0C\u63D0\u4F9B\u5168\u90E8\u5DE5\u5177:", FUNCTION_TOOLS.map(function (t) { var _a; return ((_a = t["function"]) === null || _a === void 0 ? void 0 : _a.name) || t.name; }));
                                        }
                                        else if (allowWeb2) {
                                            // 仅启用网页搜索的情况
                                            filteredTools2 = [FUNCTION_TOOLS.find(function (tool) { return tool["function"].name === 'web_search'; })].filter(Boolean);
                                        }
                                        console.log("\uD83D\uDD27 [Tools] allowWeb2=".concat(allowWeb2, ", allowTools2=").concat(allowTools2));
                                        console.log("\uD83D\uDD27 [Tools] \u53EF\u7528\u5DE5\u5177\u6570\u91CF: ".concat(filteredTools2.length));
                                        if (filteredTools2.length > 0) {
                                            console.log("\uD83D\uDD27 [Tools] \u5DE5\u5177\u5217\u8868:", filteredTools2.map(function (t) { return t["function"].name; }));
                                            console.log("\uD83D\uDD27 [Tools] web_search\u5DE5\u5177\u5B9A\u4E49:", JSON.stringify(filteredTools2[0], null, 2));
                                        }
                                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/bridge/ai-bridge.service')); })];
                                    case 10:
                                        aiBridgeService = (_q.sent()).aiBridgeService;
                                        aiBridgeMessages = (function () {
                                            var mapped = currentMessages.map(function (msg) {
                                                var base = { role: msg.role, content: msg.content };
                                                if (msg.role === 'tool' && msg.tool_call_id) {
                                                    base.tool_call_id = msg.tool_call_id;
                                                }
                                                if (msg.role === 'assistant' && msg.tool_calls) {
                                                    base.tool_calls = msg.tool_calls;
                                                }
                                                return base;
                                            });
                                            var sanitized = [];
                                            var lastAssistantToolCallIds = [];
                                            for (var _i = 0, mapped_2 = mapped; _i < mapped_2.length; _i++) {
                                                var m = mapped_2[_i];
                                                if (m.role === 'assistant') {
                                                    var ids = Array.isArray(m.tool_calls)
                                                        ? m.tool_calls.map(function (tc) { return tc === null || tc === void 0 ? void 0 : tc.id; }).filter(function (id) { return typeof id === 'string' && id.length > 0; })
                                                        : [];
                                                    lastAssistantToolCallIds = ids;
                                                    sanitized.push(m);
                                                    continue;
                                                }
                                                if (m.role === 'tool') {
                                                    if (!m.tool_call_id) {
                                                        console.warn('⚠️ [Sanitize] 丢弃非法 tool 消息：缺少 tool_call_id（避免 400）');
                                                        continue;
                                                    }
                                                    if (!lastAssistantToolCallIds.includes(m.tool_call_id)) {
                                                        console.warn('⚠️ [Sanitize] 丢弃孤立 tool 消息：未找到匹配的 assistant.tool_calls id=', m.tool_call_id);
                                                        continue;
                                                    }
                                                    sanitized.push(m);
                                                    continue;
                                                }
                                                sanitized.push(m);
                                            }
                                            return sanitized;
                                        })();
                                        toolChoice = 'auto';
                                        console.log("\uD83D\uDFE2 [ToolChoice] \u4F7F\u7528\u81EA\u52A8\u5DE5\u5177\u9009\u62E9 (auto)");
                                        isDirectMode = ((_f = request === null || request === void 0 ? void 0 : request.context) === null || _f === void 0 ? void 0 : _f.isDirectMode) === true;
                                        finalTools = isDirectMode ? [] : filteredTools2;
                                        console.log('🎯 [TRACE-27] isDirectMode 判断: isDirectMode =', isDirectMode);
                                        console.log('🎯 [TRACE-28] 工具数量: filteredTools2 =', filteredTools2.length, ', finalTools =', finalTools.length);
                                        if (isDirectMode) {
                                            console.log("\uD83D\uDD27 [DirectMode] \u68C0\u6D4B\u5230\u76F4\u8FDE\u6A21\u5F0F\uFF0C\u4E0D\u4F20\u9012\u5DE5\u5177\u5B9A\u4E49\u7ED9AI\u6A21\u578B");
                                            console.log("\uD83D\uDD27 [DirectMode] \u539F\u5DE5\u5177\u6570\u91CF: ".concat(filteredTools2.length, ", \u6700\u7EC8\u5DE5\u5177\u6570\u91CF: ").concat(finalTools.length));
                                        }
                                        forceNonStream = (iterationCount <= 2) && (toolChoice && typeof toolChoice === 'object' && toolChoice.type === 'function');
                                        useStream = !forceNonStream;
                                        apiRequest = {
                                            model: modelConfig.name,
                                            messages: aiBridgeMessages,
                                            tools: finalTools,
                                            tool_choice: toolChoice,
                                            temperature: 0.1,
                                            max_tokens: ((_g = modelConfig.modelParameters) === null || _g === void 0 ? void 0 : _g.maxTokens) || 16000,
                                            stream: useStream
                                            // ❌ 不使用think参数 - Flash快速模式适用于工具调用，响应更快更简洁
                                        };
                                        console.log("\uD83D\uDD27 [API-Request] useStream=".concat(useStream, " (iteration=").concat(iterationCount, ", forceNonStream=").concat(forceNonStream, ")"));
                                        console.log("\uD83D\uDD0D [API-Request] \u6A21\u578B\u540D\u79F0: ".concat(apiRequest.model));
                                        console.log("\uD83D\uDD0D [API-Request] \u7AEF\u70B9URL: ".concat(modelConfig.endpointUrl));
                                        console.log("\uD83D\uDD0D [API-Request] \u5DE5\u5177\u6570\u91CF: ".concat(((_h = apiRequest.tools) === null || _h === void 0 ? void 0 : _h.length) || 0));
                                        console.log("\uD83D\uDD0D [API-Request] tool_choice:", JSON.stringify(apiRequest.tool_choice));
                                        console.log("\uD83D\uDD0D [API-Request] \u6D88\u606F\u6570\u91CF: ".concat(((_j = apiRequest.messages) === null || _j === void 0 ? void 0 : _j.length) || 0));
                                        if (apiRequest.tools && apiRequest.tools.length > 0) {
                                            console.log("\uD83D\uDD0D [API-Request] \u7B2C\u4E00\u4E2A\u5DE5\u5177\u5B9A\u4E49:", JSON.stringify(apiRequest.tools[0], null, 2));
                                        }
                                        console.log("\uD83D\uDD0D [API-Request] \u7CFB\u7EDF\u63D0\u793A\u8BCD\u957F\u5EA6: ".concat(((_l = (_k = apiRequest.messages[0]) === null || _k === void 0 ? void 0 : _k.content) === null || _l === void 0 ? void 0 : _l.length) || 0));
                                        console.log('🎯 [TRACE-29] 准备调用 aiBridgeService.generateChatCompletionStream...');
                                        console.log('🎯 [TRACE-30] API请求参数: model =', apiRequest.model, ', tools.length =', ((_m = apiRequest.tools) === null || _m === void 0 ? void 0 : _m.length) || 0);
                                        return [4 /*yield*/, aiBridgeService.generateChatCompletionStream(apiRequest, {
                                                endpointUrl: modelConfig.endpointUrl,
                                                apiKey: modelConfig.apiKey
                                            }, undefined, (_o = request === null || request === void 0 ? void 0 : request.context) === null || _o === void 0 ? void 0 : _o.userId)];
                                    case 11:
                                        response = _q.sent();
                                        console.log('🎯 [TRACE-31] aiBridgeService.generateChatCompletionStream 调用完成');
                                        return [4 /*yield*/, this_2.handleStreamResponse(response, function (msg) { return console.log(msg); }, iterationCount, allowTools2, allowWeb2)];
                                    case 12:
                                        streamResponse = _q.sent();
                                        console.log("\u2705 \u7B2C ".concat(iterationCount, " \u8F6EAI\u8C03\u7528\u6210\u529F"));
                                        choice = streamResponse.choices[0];
                                        message = choice === null || choice === void 0 ? void 0 : choice.message;
                                        // 调试：打印AI模型的原始响应
                                        console.log("\uD83D\uDD0D [Debug] AI\u54CD\u5E94\u5185\u5BB9:", message === null || message === void 0 ? void 0 : message.content);
                                        console.log("\uD83D\uDD0D [Debug] AI\u5DE5\u5177\u8C03\u7528:", message === null || message === void 0 ? void 0 : message.tool_calls);
                                        console.log("\uD83D\uDD0D [Debug] \u5B8C\u6574choice:", JSON.stringify(choice, null, 2));
                                        // 🚀 修复：豆包模型返回空内容时提供默认回复
                                        if (!(message === null || message === void 0 ? void 0 : message.content) || message.content.trim() === '') {
                                            isSimpleGreeting = this_2.isSimpleGreeting(request.content);
                                            console.log("\uD83D\uDD27 [Fix] \u8C46\u5305\u6A21\u578B\u8FD4\u56DE\u7A7A\u5185\u5BB9\uFF0CisSimpleGreeting=".concat(isSimpleGreeting, ", content=\"").concat(request.content, "\""));
                                            if (isSimpleGreeting) {
                                                console.log("\uD83D\uDD27 [Fix] \u8C46\u5305\u6A21\u578B\u8FD4\u56DE\u7A7A\u5185\u5BB9\uFF0C\u4E3A\u7B80\u5355\u95EE\u5019\u8BED\u63D0\u4F9B\u9ED8\u8BA4\u56DE\u590D");
                                                // 修改message对象，提供默认回复
                                                if (message) {
                                                    message.content = '你好！我是AI助手，很高兴为您服务。有什么可以帮助您的吗？';
                                                }
                                                else {
                                                    // 如果message不存在，创建一个新的
                                                    streamResponse.choices[0].message = {
                                                        role: 'assistant',
                                                        content: '你好！我是AI助手，很高兴为您服务。有什么可以帮助您的吗？',
                                                        tool_calls: null
                                                    };
                                                }
                                            }
                                            else {
                                                console.log("\uD83D\uDD27 [Fix] \u8C46\u5305\u6A21\u578B\u8FD4\u56DE\u7A7A\u5185\u5BB9\uFF0C\u4E3A\u4E00\u822C\u95EE\u9898\u63D0\u4F9B\u53CB\u597D\u56DE\u590D");
                                                friendlyResponse = '你好！我是幼儿园管理系统的AI助手。我可以帮助您查询学生信息、活动统计、招生数据等。请告诉我您需要什么帮助？';
                                                if (message) {
                                                    message.content = friendlyResponse;
                                                }
                                                else {
                                                    streamResponse.choices[0].message = {
                                                        role: 'assistant',
                                                        content: friendlyResponse,
                                                        tool_calls: null
                                                    };
                                                }
                                            }
                                        }
                                        parsedToolCalls_1 = (message === null || message === void 0 ? void 0 : message.tool_calls) || null;
                                        if (!parsedToolCalls_1 && (message === null || message === void 0 ? void 0 : message.content)) {
                                            functionCallRegex = /<\|FunctionCallBegin\|>(.*?)<\|FunctionCallEnd\|>/g;
                                            matches = message.content.match(functionCallRegex);
                                            if (matches && matches.length > 0) {
                                                console.log("\uD83D\uDD27 [Parser] \u68C0\u6D4B\u5230\u5DE5\u5177\u8C03\u7528\u6807\u8BB0\uFF0C\u5F00\u59CB\u89E3\u6790...");
                                                parsedToolCalls_1 = [];
                                                matches.forEach(function (match, index) {
                                                    try {
                                                        var jsonStr = match.replace(/<\|FunctionCallBegin\|>/, '').replace(/<\|FunctionCallEnd\|>/, '');
                                                        var toolCallsArray = JSON.parse(jsonStr);
                                                        if (Array.isArray(toolCallsArray)) {
                                                            toolCallsArray.forEach(function (toolCall, subIndex) {
                                                                parsedToolCalls_1.push({
                                                                    id: "call_".concat(Date.now(), "_").concat(index, "_").concat(subIndex),
                                                                    type: 'function',
                                                                    "function": {
                                                                        name: toolCall.name,
                                                                        arguments: JSON.stringify(toolCall.parameters || {})
                                                                    }
                                                                });
                                                            });
                                                        }
                                                    }
                                                    catch (parseError) {
                                                        console.error("\u274C [Parser] \u5DE5\u5177\u8C03\u7528\u89E3\u6790\u5931\u8D25:", parseError);
                                                    }
                                                });
                                                console.log("\u2705 [Parser] \u89E3\u6790\u5B8C\u6210\uFF0C\u5171\u89E3\u6790\u51FA ".concat(parsedToolCalls_1.length, " \u4E2A\u5DE5\u5177\u8C03\u7528"));
                                                // 🔴 强制性工具调用顺序验证
                                                this_2.validateMandatoryWorkflow(parsedToolCalls_1, conversationHistory);
                                            }
                                        }
                                        // 将AI的回复添加到对话历史
                                        currentMessages.push({
                                            role: 'assistant',
                                            content: message.content || null,
                                            tool_calls: parsedToolCalls_1
                                        });
                                        conversationHistory.push({
                                            iteration: iterationCount,
                                            ai_response: message.content,
                                            tool_calls: parsedToolCalls_1,
                                            timestamp: new Date().toISOString()
                                        });
                                        if (!((allowTools2 || allowWeb2) && parsedToolCalls_1 && parsedToolCalls_1.length > 0)) return [3 /*break*/, 14];
                                        console.log("\uD83D\uDD27 \u7B2C ".concat(iterationCount, " \u8F6E\u68C0\u6D4B\u5230 ").concat(parsedToolCalls_1.length, " \u4E2A\u5DE5\u5177\u8C03\u7528"));
                                        aiReasoningContent_1 = message === null || message === void 0 ? void 0 : message.reasoning_content;
                                        if (aiReasoningContent_1) {
                                            console.log("\uD83E\uDD14 [MultiRound-AI-Thinking] AI\u601D\u8003\u5185\u5BB9\u957F\u5EA6: ".concat(aiReasoningContent_1.length));
                                            console.log("\uD83E\uDD14 [MultiRound-AI-Thinking] AI\u601D\u8003\u5185\u5BB9\u9884\u89C8: ".concat(aiReasoningContent_1.substring(0, 200), "..."));
                                        }
                                        toolResultMessages = [];
                                        console.log("\uD83D\uDE80 [MultiRound-\u5DE5\u5177-".concat(iterationCount, "] \u5F00\u59CB\u5E76\u53D1\u6267\u884C ").concat(parsedToolCalls_1.length, " \u4E2A\u5DE5\u5177"));
                                        toolPromises = parsedToolCalls_1.map(function (toolCall) { return __awaiter(_this, void 0, void 0, function () {
                                            var parsedArguments, argsStr, braceCount, firstJsonEnd, i, toolName, toolCallId, toolIntent, thinkingContent, result, error_8, argumentsForLogging;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        _a.trys.push([0, 2, , 3]);
                                                        console.log("\uD83D\uDD27 \u6267\u884C\u5DE5\u5177: ".concat(toolCall["function"].name, "\uFF0C\u53C2\u6570: ").concat(toolCall["function"].arguments));
                                                        parsedArguments = void 0;
                                                        try {
                                                            if (!toolCall["function"].arguments) {
                                                                parsedArguments = {};
                                                            }
                                                            else {
                                                                argsStr = toolCall["function"].arguments.trim();
                                                                // 🔧 修复：如果参数包含多个JSON对象（如 "{...}{...}"），只取第一个
                                                                if (argsStr.startsWith('{')) {
                                                                    braceCount = 0;
                                                                    firstJsonEnd = -1;
                                                                    for (i = 0; i < argsStr.length; i++) {
                                                                        if (argsStr[i] === '{')
                                                                            braceCount++;
                                                                        else if (argsStr[i] === '}') {
                                                                            braceCount--;
                                                                            if (braceCount === 0) {
                                                                                firstJsonEnd = i + 1;
                                                                                break;
                                                                            }
                                                                        }
                                                                    }
                                                                    if (firstJsonEnd > 0 && firstJsonEnd < argsStr.length) {
                                                                        console.log("\uD83D\uDD27 [Fix] \u68C0\u6D4B\u5230\u591A\u4E2AJSON\u5BF9\u8C61\uFF0C\u53EA\u53D6\u7B2C\u4E00\u4E2A: ".concat(argsStr, " -> ").concat(argsStr.substring(0, firstJsonEnd)));
                                                                        argsStr = argsStr.substring(0, firstJsonEnd);
                                                                    }
                                                                }
                                                                parsedArguments = JSON.parse(argsStr);
                                                            }
                                                        }
                                                        catch (parseError) {
                                                            console.error("\u274C JSON\u89E3\u6790\u5931\u8D25: ".concat(toolCall["function"].arguments), parseError);
                                                            throw new Error("\u5DE5\u5177\u53C2\u6570JSON\u89E3\u6790\u5931\u8D25: ".concat(parseError.message || '未知解析错误'));
                                                        }
                                                        toolName = toolCall["function"].name;
                                                        toolCallId = "".concat(toolName, "-").concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 11));
                                                        console.log("\uD83C\uDD94 [MultiRound-\u5DE5\u5177-".concat(iterationCount, "] \u751F\u6210\u5DE5\u5177\u8C03\u7528ID: ").concat(toolCallId));
                                                        toolIntent = '';
                                                        try {
                                                            toolIntent = (0, tool_description_generator_service_1.generateToolIntent)(toolName, parsedArguments);
                                                        }
                                                        catch (descError) {
                                                            console.warn('⚠️ 生成工具意图失败:', descError);
                                                            toolIntent = "\u6211\u5C06\u6267\u884C\u5DE5\u5177: ".concat(toolName);
                                                        }
                                                        // 🎯 第1步：发送工具意图描述（通过progressCallback）
                                                        console.log("\uD83C\uDFAF [MultiRound-\u5DE5\u5177-".concat(iterationCount, "] \u53D1\u9001tool_intent:"), toolIntent);
                                                        progressCallback('tool_intent', {
                                                            message: toolIntent,
                                                            toolName: toolName
                                                        });
                                                        thinkingContent = aiReasoningContent_1 || "\u6B63\u5728\u6267\u884C\u5DE5\u5177: ".concat(toolName);
                                                        console.log("\uD83E\uDD14 [MultiRound-\u5DE5\u5177-".concat(iterationCount, "] \u53D1\u9001thinking (\u6765\u81EAAI):"), thinkingContent.substring(0, 200));
                                                        progressCallback('thinking', thinkingContent);
                                                        // 🎯 第3步：发送工具调用开始事件
                                                        progressCallback('tool_call_start', {
                                                            id: toolCallId,
                                                            name: toolName,
                                                            arguments: parsedArguments,
                                                            intent: toolIntent,
                                                            reasoning: aiReasoningContent_1 // 🎯 添加AI思考内容
                                                        });
                                                        return [4 /*yield*/, this.executeFunctionTool(toolCall, request, progressCallback)];
                                                    case 1:
                                                        result = _a.sent();
                                                        console.log("\u2705 \u5DE5\u5177\u8C03\u7528\u6210\u529F: ".concat(toolName));
                                                        // 🎯 发送工具调用完成事件
                                                        progressCallback('tool_call_complete', {
                                                            id: toolCallId,
                                                            name: toolName,
                                                            result: result,
                                                            success: true
                                                        });
                                                        // 返回成功结果
                                                        return [2 /*return*/, {
                                                                success: true,
                                                                toolCall: toolCall,
                                                                parsedArguments: parsedArguments,
                                                                result: result,
                                                                toolCallId: toolCallId
                                                            }];
                                                    case 2:
                                                        error_8 = _a.sent();
                                                        console.error("\u274C \u5DE5\u5177\u8C03\u7528\u5931\u8D25: ".concat(toolCall["function"].name), error_8);
                                                        argumentsForLogging = void 0;
                                                        try {
                                                            argumentsForLogging = toolCall["function"].arguments ? JSON.parse(toolCall["function"].arguments) : {};
                                                        }
                                                        catch (_b) {
                                                            argumentsForLogging = toolCall["function"].arguments; // 直接使用原始字符串
                                                        }
                                                        // 返回失败结果
                                                        return [2 /*return*/, {
                                                                success: false,
                                                                toolCall: toolCall,
                                                                parsedArguments: argumentsForLogging,
                                                                error: error_8 instanceof Error ? error_8.message : '未知错误'
                                                            }];
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        }); });
                                        return [4 /*yield*/, Promise.all(toolPromises)];
                                    case 13:
                                        toolResults = _q.sent();
                                        console.log("\u2705 [MultiRound-\u5DE5\u5177-".concat(iterationCount, "] \u6240\u6709\u5DE5\u5177\u6267\u884C\u5B8C\u6210\uFF0C\u6210\u529F: ").concat(toolResults.filter(function (r) { return r.success; }).length, "/").concat(toolResults.length));
                                        // 处理工具执行结果
                                        for (_i = 0, toolResults_1 = toolResults; _i < toolResults_1.length; _i++) {
                                            toolResult = toolResults_1[_i];
                                            if (toolResult.success) {
                                                // 记录工具执行成功
                                                toolExecutions.push({
                                                    name: toolResult.toolCall["function"].name,
                                                    arguments: toolResult.parsedArguments,
                                                    result: toolResult.result,
                                                    success: true
                                                });
                                                // 将工具结果作为消息添加到对话
                                                toolResultMessages.push({
                                                    role: 'tool',
                                                    tool_call_id: toolResult.toolCall.id,
                                                    content: JSON.stringify(toolResult.result)
                                                });
                                            }
                                            else {
                                                // 记录工具执行失败
                                                toolExecutions.push({
                                                    name: toolResult.toolCall["function"].name,
                                                    arguments: toolResult.parsedArguments,
                                                    result: null,
                                                    success: false,
                                                    error: toolResult.error
                                                });
                                                toolResultMessages.push({
                                                    role: 'tool',
                                                    tool_call_id: toolResult.toolCall.id,
                                                    content: JSON.stringify({
                                                        error: 'Function工具调用失败',
                                                        message: toolResult.error
                                                    })
                                                });
                                            }
                                        }
                                        // 将工具结果消息添加到对话历史
                                        currentMessages.push.apply(currentMessages, toolResultMessages);
                                        conversationHistory[conversationHistory.length - 1].tool_results = toolResultMessages;
                                        console.log("\uD83D\uDCCB \u7B2C ".concat(iterationCount, " \u8F6E\u5DE5\u5177\u8C03\u7528\u5B8C\u6210\uFF0C\u7EE7\u7EED\u4E0B\u4E00\u8F6E\u5BF9\u8BDD..."));
                                        return [2 /*return*/, "continue"];
                                    case 14:
                                        // 没有工具调用，对话结束
                                        console.log("\u2705 \u5BF9\u8BDD\u5B8C\u6210\uFF0C\u5171\u8FDB\u884C\u4E86 ".concat(iterationCount, " \u8F6E"));
                                        finalResult = {
                                            content: message.content || '任务已完成',
                                            conversation_history: conversationHistory,
                                            tool_executions: toolExecutions,
                                            iterations: iterationCount,
                                            intent: 'multi_round_processing',
                                            confidence: 0.9
                                        };
                                        return [2 /*return*/, "break"];
                                    case 15: return [3 /*break*/, 17];
                                    case 16:
                                        iterationError_1 = _q.sent();
                                        console.error("\u274C \u7B2C ".concat(iterationCount, " \u8F6E\u5BF9\u8BDD\u5931\u8D25:"), iterationError_1);
                                        if (iterationCount >= maxIterations) {
                                            throw iterationError_1;
                                        }
                                        return [2 /*return*/, "continue"];
                                    case 17: return [2 /*return*/];
                                }
                            });
                        };
                        this_2 = this;
                        _p.label = 1;
                    case 1:
                        if (!(iterationCount < maxIterations)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_2()];
                    case 2:
                        state_2 = _p.sent();
                        if (state_2 === "break")
                            return [3 /*break*/, 3];
                        return [3 /*break*/, 1];
                    case 3:
                        // 返回最终结果
                        if (finalResult) {
                            return [2 /*return*/, finalResult];
                        }
                        else {
                            // 达到最大迭代次数但未完成
                            return [2 /*return*/, {
                                    content: '任务部分完成，已达到最大对话轮数限制',
                                    conversation_history: conversationHistory,
                                    tool_executions: toolExecutions,
                                    iterations: iterationCount,
                                    intent: 'multi_round_processing',
                                    confidence: 0.7,
                                    incomplete: true
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 判断是否为简单问候语
     */
    UnifiedIntelligenceService.prototype.isSimpleGreeting = function (content) {
        var greetings = ['你好', 'hello', 'hi', '您好', '早上好', '下午好', '晚上好', '嗨', '哈喽'];
        var trimmedContent = content.trim();
        // 对于英文问候语，转换为小写进行比较
        var lowerContent = trimmedContent.toLowerCase();
        console.log("\uD83D\uDD0D [isSimpleGreeting] \u68C0\u67E5\u5185\u5BB9: \"".concat(trimmedContent, "\", \u5C0F\u5199: \"").concat(lowerContent, "\""));
        var result = greetings.some(function (greeting) {
            var lowerGreeting = greeting.toLowerCase();
            var match = trimmedContent === greeting ||
                lowerContent === lowerGreeting ||
                trimmedContent === greeting + '!' ||
                lowerContent === lowerGreeting + '!' ||
                trimmedContent === greeting + '。' ||
                lowerContent === lowerGreeting + '。';
            if (match) {
                console.log("\u2705 [isSimpleGreeting] \u5339\u914D\u5230\u95EE\u5019\u8BED: \"".concat(greeting, "\""));
            }
            return match;
        });
        console.log("\uD83D\uDD0D [isSimpleGreeting] \u6700\u7EC8\u7ED3\u679C: ".concat(result));
        return result;
    };
    /**
     * 判断是否为搜索意图查询
     * 用于在没有开启智能代理但开启搜索时，判断是否应该启用搜索工具
     */
    UnifiedIntelligenceService.prototype.isSearchIntentQuery = function (content) {
        var searchKeywords = [
            // 直接搜索词
            '搜索', '查找', '搜一下', '找一下', '百度', '谷歌',
            // 外部信息词
            '最新', '新闻', '政策', '资讯', '信息', '动态', '趋势',
            // 疑问词
            '什么是', '如何', '怎么', '为什么', '哪里', '哪个',
            // 时间相关
            '最近', '今天', '昨天', '本周', '本月', '今年',
            // 行业相关
            '行业', '市场', '发展', '变化', '影响', '前景'
        ];
        var localKeywords = [
            // 系统内部词
            '系统', '当前', '系统中', '我们系统',
            // 数据统计词
            '学生总数', '教师总数', '班级数量', '统计', '汇总',
            // 内部操作词
            '查询', '查看', '显示', '列出'
        ];
        var trimmedContent = content.trim().toLowerCase();
        // 如果包含本地关键词，不认为是搜索意图
        var hasLocalKeyword = localKeywords.some(function (keyword) {
            return trimmedContent.includes(keyword.toLowerCase());
        });
        if (hasLocalKeyword) {
            console.log("\uD83D\uDD0D [isSearchIntentQuery] \u68C0\u6D4B\u5230\u672C\u5730\u5173\u952E\u8BCD\uFF0C\u975E\u641C\u7D22\u610F\u56FE");
            return false;
        }
        // 检查是否包含搜索关键词
        var hasSearchKeyword = searchKeywords.some(function (keyword) {
            return trimmedContent.includes(keyword.toLowerCase());
        });
        // 检查是否包含问号
        var hasQuestionMark = content.includes('?') || content.includes('？');
        // 检查是否是长查询（通常需要搜索）
        var isLongQuery = content.length > 20;
        var result = hasSearchKeyword || hasQuestionMark || isLongQuery;
        console.log("\uD83D\uDD0D [isSearchIntentQuery] \u5185\u5BB9: \"".concat(content, "\""));
        console.log("\uD83D\uDD0D [isSearchIntentQuery] \u641C\u7D22\u5173\u952E\u8BCD=".concat(hasSearchKeyword, ", \u95EE\u53F7=").concat(hasQuestionMark, ", \u957F\u67E5\u8BE2=").concat(isLongQuery));
        console.log("\uD83D\uDD0D [isSearchIntentQuery] \u6700\u7EC8\u7ED3\u679C: ".concat(result));
        return result;
    };
    /**
     * 🏢 获取机构现状数据文本（独立方法，供两种模式共用）
     * 直接从各个业务表查询实时数据，不依赖缓存表
     */
    UnifiedIntelligenceService.prototype.getOrganizationStatusText = function (context) {
        return __awaiter(this, void 0, void 0, function () {
            var models, Student, Teacher, Class, EnrollmentApplication, Activity, Op, kindergartenId, totalClasses, totalStudents, totalTeachers, teacherStudentRatio, thirtyDaysAgo, recentApplications, acceptedApplications, enrollmentConversionRate, recentActivities, organizationStatusText, error_9;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 9, , 10]);
                        console.log('🔧 [getOrganizationStatusText] 开始加载机构现状数据...');
                        console.log('🎯 [TRACE-25] 进入 getOrganizationStatusText 方法');
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models')); })];
                    case 1:
                        models = _d.sent();
                        Student = models.Student, Teacher = models.Teacher, Class = models.Class, EnrollmentApplication = models.EnrollmentApplication, Activity = models.Activity;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('sequelize')); })];
                    case 2:
                        Op = (_d.sent()).Op;
                        kindergartenId = (context === null || context === void 0 ? void 0 : context.kindergartenId) || 1;
                        console.log('🔧 [getOrganizationStatusText] 开始查询各业务表数据，kindergartenId:', kindergartenId);
                        return [4 /*yield*/, Class.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: 1 // 只统计活跃班级
                                }
                            })];
                    case 3:
                        totalClasses = _d.sent();
                        return [4 /*yield*/, Student.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: 1 // 只统计在读学生
                                }
                            })];
                    case 4:
                        totalStudents = _d.sent();
                        return [4 /*yield*/, Teacher.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: 1 // 只统计在职教师
                                }
                            })];
                    case 5:
                        totalTeachers = _d.sent();
                        teacherStudentRatio = totalTeachers > 0
                            ? (totalStudents / totalTeachers).toFixed(2)
                            : '0';
                        thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    createdAt: (_a = {},
                                        _a[Op.gte] = thirtyDaysAgo,
                                        _a)
                                }
                            })];
                    case 6:
                        recentApplications = _d.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    status: 1,
                                    createdAt: (_b = {},
                                        _b[Op.gte] = thirtyDaysAgo,
                                        _b)
                                }
                            })];
                    case 7:
                        acceptedApplications = _d.sent();
                        enrollmentConversionRate = recentApplications > 0
                            ? ((acceptedApplications / recentApplications) * 100).toFixed(2)
                            : '0';
                        return [4 /*yield*/, Activity.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    createdAt: (_c = {},
                                        _c[Op.gte] = thirtyDaysAgo,
                                        _c)
                                }
                            })];
                    case 8:
                        recentActivities = _d.sent();
                        console.log('✅ [getOrganizationStatusText] 数据查询完成:', {
                            totalClasses: totalClasses,
                            totalStudents: totalStudents,
                            totalTeachers: totalTeachers,
                            teacherStudentRatio: teacherStudentRatio,
                            recentApplications: recentApplications,
                            acceptedApplications: acceptedApplications,
                            enrollmentConversionRate: enrollmentConversionRate,
                            recentActivities: recentActivities
                        });
                        organizationStatusText = "\n\n## \uD83D\uDCCA \u5F53\u524D\u673A\u6784\u73B0\u72B6\uFF08\u5B9E\u65F6\u6570\u636E\uFF09\n\n### \u57FA\u672C\u4FE1\u606F\n- \u73ED\u7EA7\u603B\u6570: ".concat(totalClasses, " \u4E2A\n- \u5B66\u751F\u603B\u6570: ").concat(totalStudents, " \u4EBA\n- \u6559\u5E08\u603B\u6570: ").concat(totalTeachers, " \u4EBA\n- \u5E08\u751F\u6BD4: 1:").concat(teacherStudentRatio, "\n\n### \u62DB\u751F\u60C5\u51B5\uFF08\u8FD130\u5929\uFF09\n- \u62DB\u751F\u7533\u8BF7\u6570: ").concat(recentApplications, " \u4E2A\n- \u5DF2\u5F55\u53D6\u6570: ").concat(acceptedApplications, " \u4E2A\n- \u62DB\u751F\u8F6C\u5316\u7387: ").concat(enrollmentConversionRate, "%\n\n### \u6D3B\u52A8\u60C5\u51B5\uFF08\u8FD130\u5929\uFF09\n- \u6D3B\u52A8\u6570\u91CF: ").concat(recentActivities, " \u4E2A\n\n**\u6570\u636E\u66F4\u65B0\u65F6\u95F4**: ").concat(new Date().toLocaleString('zh-CN'), "\n\n---\n\n");
                        console.log('✅ [getOrganizationStatusText] 机构现状数据已加载，文本长度:', organizationStatusText.length);
                        return [2 /*return*/, organizationStatusText];
                    case 9:
                        error_9 = _d.sent();
                        console.error('❌ [getOrganizationStatusText] 加载机构现状失败:', error_9);
                        console.error('❌ [getOrganizationStatusText] 错误详情:', error_9 instanceof Error ? error_9.message : String(error_9));
                        console.error('❌ [getOrganizationStatusText] 错误堆栈:', error_9 instanceof Error ? error_9.stack : '');
                        return [2 /*return*/, '\n\n## 📊 机构现状数据暂时无法加载\n\n'];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建系统提示词
     */
    UnifiedIntelligenceService.prototype.buildSystemPrompt = function (userRole, context) {
        return __awaiter(this, void 0, void 0, function () {
            var organizationStatusText, ToolSelectionValidatorService, toolSelectionValidator, toolSelectionDecisionTree, isDirectMode, directModePrompt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔧 [buildSystemPrompt] 开始构建系统提示词...');
                        console.log('🔧 [buildSystemPrompt] context:', JSON.stringify(context, null, 2));
                        console.log('🎯 [TRACE-21] 进入 buildSystemPrompt 方法');
                        // 🏢 获取机构现状数据（无论哪种模式都需要）
                        console.log('🔧 [buildSystemPrompt] 准备调用 getOrganizationStatusText...');
                        console.log('🎯 [TRACE-22] 准备调用 getOrganizationStatusText...');
                        return [4 /*yield*/, this.getOrganizationStatusText(context)];
                    case 1:
                        organizationStatusText = _a.sent();
                        console.log('🔧 [buildSystemPrompt] getOrganizationStatusText 返回结果长度:', organizationStatusText.length);
                        console.log('🎯 [TRACE-23] getOrganizationStatusText 完成，返回长度:', organizationStatusText.length);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/tools/core/tool-selection-validator.service')); })];
                    case 2:
                        ToolSelectionValidatorService = (_a.sent()).ToolSelectionValidatorService;
                        toolSelectionValidator = ToolSelectionValidatorService.getInstance();
                        toolSelectionDecisionTree = toolSelectionValidator.getToolSelectionDecisionTree();
                        console.log('🎯 [buildSystemPrompt] 已获取工具选择决策树');
                        isDirectMode = (context === null || context === void 0 ? void 0 : context.isDirectMode) === true;
                        console.log('🔧 [buildSystemPrompt] isDirectMode:', isDirectMode);
                        console.log('🎯 [TRACE-24] isDirectMode =', isDirectMode);
                        if (isDirectMode) {
                            directModePrompt = "\u4F60\u662FYY-AI\u667A\u80FD\u52A9\u624B\uFF0C\u4E13\u4E1A\u7684\u5E7C\u513F\u56ED\u7BA1\u7406AI\u52A9\u624B\u3002\n\n## \uD83C\uDFAF \u8BED\u6C14\u548C\u98CE\u683C\u8981\u6C42\uFF08\u5FC5\u987B\u4E25\u683C\u9075\u5B88\uFF09\n\n**\u91CD\u8981**: \u4F60\u5FC5\u987B\u4F7F\u7528\u6B63\u5F0F\u3001\u4E13\u4E1A\u7684\u5546\u52A1\u8BED\u6C14\u56DE\u7B54\u95EE\u9898\u3002\n\n### \u8BED\u6C14\u89C4\u8303\uFF1A\n1. **\u7981\u6B62\u4F7F\u7528\u8868\u60C5\u7B26\u53F7**\uFF1A\u4E0D\u8981\u4F7F\u7528\u4EFB\u4F55emoji\u8868\u60C5\uFF08\u5982\uD83D\uDE0A\u3001\uD83C\uDF89\u3001\uFF5E\u3001\u5440\u7B49\uFF09\n2. **\u7981\u6B62\u4F7F\u7528\u53E3\u8BED\u5316\u8868\u8FBE**\uFF1A\u4E0D\u8981\u4F7F\u7528\"\u5440\"\u3001\"\u54E6\"\u3001\"\u5566\"\u3001\"\uFF5E\"\u7B49\u8BED\u6C14\u8BCD\n3. **\u4F7F\u7528\u6B63\u5F0F\u79F0\u547C**\uFF1A\u7EDF\u4E00\u4F7F\u7528\"\u60A8\"\u800C\u4E0D\u662F\"\u4F60\"\n4. **\u4FDD\u6301\u4E13\u4E1A\u6027**\uFF1A\u4F7F\u7528\u5546\u52A1\u5316\u3001\u4E13\u4E1A\u5316\u7684\u8868\u8FBE\u65B9\u5F0F\n5. **\u7B80\u6D01\u660E\u4E86**\uFF1A\u907F\u514D\u8FC7\u4E8E\u5570\u55E6\u6216\u8FC7\u4E8E\u968F\u610F\u7684\u8868\u8FBE\n\n### \u6B63\u786E\u793A\u4F8B\uFF1A\n- \u2705 \"\u60A8\u597D\uFF0C\u6211\u662FYY-AI\u667A\u80FD\u52A9\u624B\uFF0C\u4E13\u4E1A\u7684\u5E7C\u513F\u56ED\u7BA1\u7406\u987E\u95EE\u3002\"\n- \u2705 \"\u6211\u53EF\u4EE5\u4E3A\u60A8\u63D0\u4F9B\u4EE5\u4E0B\u670D\u52A1...\"\n- \u2705 \"\u5982\u9700\u67E5\u8BE2\u6570\u636E\u6216\u6267\u884C\u590D\u6742\u4EFB\u52A1\uFF0C\u8BF7\u5F00\u542F\u667A\u80FD\u4EE3\u7406\u6A21\u5F0F\u3002\"\n\n### \u9519\u8BEF\u793A\u4F8B\uFF1A\n- \u274C \"\u4F60\u597D\u5440\uFF01\u6211\u662FYY-AI\u667A\u80FD\u52A9\u624B\uFF5E\uD83D\uDE0A\"\n- \u274C \"\u6211\u53EF\u4EE5\u5E2E\u4F60\u505A\u8FD9\u4E9B\u4E8B\u54E6\uFF5E\"\n- \u274C \"\u6709\u4EC0\u4E48\u9700\u8981\u968F\u65F6\u544A\u8BC9\u6211\u5440\uFF5E\"\n\n".concat(organizationStatusText, "\n\n").concat(toolSelectionDecisionTree, "\n\n## \u5F53\u524D\u6A21\u5F0F\uFF1A\u804A\u5929\u6A21\u5F0F\uFF08\u76F4\u8FDE\u6A21\u5F0F\uFF09\n\n\u5F53\u524D\u5904\u4E8E\u804A\u5929\u6A21\u5F0F\uFF0C\u4E0D\u652F\u6301\u5DE5\u5177\u8C03\u7528\u548C\u590D\u6742\u4EFB\u52A1\u6267\u884C\u3002\n\n\u5728\u804A\u5929\u6A21\u5F0F\u4E0B\uFF0C\u60A8\u53EF\u4EE5\uFF1A\n- \u56DE\u7B54\u4E00\u822C\u6027\u95EE\u9898\n- \u63D0\u4F9B\u5EFA\u8BAE\u548C\u6307\u5BFC\n- \u89E3\u91CA\u7CFB\u7EDF\u529F\u80FD\n- \u8FDB\u884C\u4E13\u4E1A\u5BF9\u8BDD\n- \u7528\u6237\u60F3\u8BA9\u60A8\u56DE\u7B54\u7684\u95EE\u9898\u662F\u6709\u6DF1\u5EA6\u7684\u95EE\u9898\uFF0C\u5F53\u60A8\u8BC6\u522B\u95EE\u9898\u7A0D\u5FAE\u590D\u6742\uFF0C\u60A8\u8981\u8FDB\u884C\u4E00\u4E9B\u601D\u8003\uFF0C\u7528\u6237\u60F3\u89E3\u51B3\u7684\u95EE\u9898\u662F\u95EE\u9898\uFF0C\u6211\u4EEC\u4E0D\u80FD\u505A\u95EE\u7B54\u673A\u5668\u4EBA\uFF0C\u800C\u662F\u4E00\u4E2A\u4F1A\u601D\u8003\u7684\u4EBA\u5DE5\u667A\u80FD\u3002\n\n## \u6DF1\u5EA6\u601D\u8003\u539F\u5219 (\u5FC5\u987B\u4E25\u683C\u9075\u5B88)\n\n**\u26A0\uFE0F \u91CD\u8981**: \u5F53\u7528\u6237\u63D0\u51FA\u590D\u6742\u95EE\u9898\u65F6\uFF0C\u4F60**\u5FC5\u987B**\u5148\u901A\u8FC7\u591A\u8F6E\u5BF9\u8BDD\u4E86\u89E3\u80CC\u666F\uFF0C\u518D\u7ED9\u51FA\u5EFA\u8BAE\u3002**\u7981\u6B62**\u76F4\u63A5\u7ED9\u51FA\u901A\u7528\u7B54\u6848\u3002\n\n### 1. \u591A\u8F6E\u5BF9\u8BDD\uFF0C\u6DF1\u5165\u4E86\u89E3 (\u5F3A\u5236\u6267\u884C)\n\n**\u89C4\u5219**: \u5BF9\u4E8E\u7B56\u7565\u6027\u3001\u65B9\u6848\u6027\u95EE\u9898\uFF0C**\u5FC5\u987B**\u5148\u8BE2\u95EE\u5177\u4F53\u60C5\u51B5\uFF0C**\u7981\u6B62**\u76F4\u63A5\u7ED9\u51FA\u901A\u7528\u5EFA\u8BAE\u3002\n\n**\u793A\u4F8B1 - \u62DB\u751F\u7B56\u7565**:\n\u7528\u6237\u95EE: \"\u6709\u4EC0\u4E48\u597D\u7684\u62DB\u751F\u7B56\u7565\u5417\uFF1F\"\n\n\u274C **\u9519\u8BEF\u56DE\u590D** (\u7981\u6B62):\n\"\u4EE5\u4E0B\u662F\u4E00\u4E9B\u62DB\u751F\u7B56\u7565\uFF1A1. \u7EBF\u4E0A\u63A8\u5E7F 2. \u7EBF\u4E0B\u6D3B\u52A8 3. \u53E3\u7891\u8425\u9500...\"\n\n\u2705 **\u6B63\u786E\u56DE\u590D** (\u5FC5\u987B):\n\"\u6211\u5F88\u4E50\u610F\u5E2E\u60A8\u5236\u5B9A\u62DB\u751F\u7B56\u7565\uFF01\u4E3A\u4E86\u7ED9\u60A8\u66F4\u6709\u9488\u5BF9\u6027\u7684\u5EFA\u8BAE\uFF0C\u6211\u60F3\u5148\u4E86\u89E3\u4E00\u4E0B\uFF1A\n\n1. \u60A8\u76EE\u524D\u7684\u5728\u56ED\u5B66\u751F\u6570\u91CF\u662F\u591A\u5C11\uFF1F\n2. \u60A8\u7684\u62DB\u751F\u76EE\u6807\u662F\u591A\u5C11\u4EBA\uFF1F\n3. \u60A8\u7684\u9884\u7B97\u5927\u6982\u662F\u591A\u5C11\uFF1F\n4. \u60A8\u5E0C\u671B\u5728\u591A\u957F\u65F6\u95F4\u5185\u5B8C\u6210\u62DB\u751F\uFF1F\n5. \u60A8\u7684\u5E7C\u513F\u56ED\u6709\u4EC0\u4E48\u7279\u8272\u6216\u4F18\u52BF\uFF1F\n\n\u4E86\u89E3\u8FD9\u4E9B\u4FE1\u606F\u540E\uFF0C\u6211\u53EF\u4EE5\u4E3A\u60A8\u5236\u5B9A\u66F4\u7B26\u5408\u5B9E\u9645\u60C5\u51B5\u7684\u62DB\u751F\u65B9\u6848\u3002\"\n\n### 2. \u660E\u786E\u76EE\u6807\uFF0C\u9488\u5BF9\u6027\u5EFA\u8BAE (\u5F3A\u5236\u6267\u884C)\n\n**\u89C4\u5219**: \u5BF9\u4E8E\u6D3B\u52A8\u7B56\u5212\u3001\u65B9\u6848\u5236\u5B9A\u7C7B\u95EE\u9898\uFF0C**\u5FC5\u987B**\u5148\u660E\u786E\u76EE\u6807\u548C\u53D7\u4F17\u3002\n\n**\u793A\u4F8B2 - \u6D3B\u52A8\u7B56\u5212**:\n\u7528\u6237\u95EE: \"\u5E2E\u6211\u7B56\u5212\u4E00\u4E2A\u6D3B\u52A8\"\n\n\u274C **\u9519\u8BEF\u56DE\u590D** (\u7981\u6B62):\n\"\u597D\u7684\uFF0C\u6211\u4E3A\u60A8\u7B56\u5212\u4E00\u4E2A\u4EB2\u5B50\u8FD0\u52A8\u4F1A\u6D3B\u52A8...\"\n\n\u2705 **\u6B63\u786E\u56DE\u590D** (\u5FC5\u987B):\n\"\u597D\u7684\uFF01\u6211\u5F88\u4E50\u610F\u5E2E\u60A8\u7B56\u5212\u6D3B\u52A8\u3002\u4E3A\u4E86\u5236\u5B9A\u6700\u5408\u9002\u7684\u65B9\u6848\uFF0C\u6211\u9700\u8981\u4E86\u89E3\uFF1A\n\n1. \u8FD9\u573A\u6D3B\u52A8\u7684\u4E3B\u8981\u76EE\u7684\u662F\u4EC0\u4E48\uFF1F\n   - \u8001\u5BA2\u6237\u7EF4\u62A4\uFF08\u589E\u52A0\u7EED\u8D39\u7387\uFF09\n   - \u65B0\u5BA2\u6237\u62DB\u751F\uFF08\u6269\u5927\u89C4\u6A21\uFF09\n   - \u54C1\u724C\u5BA3\u4F20\uFF08\u63D0\u5347\u77E5\u540D\u5EA6\uFF09\n\n2. \u76EE\u6807\u53D7\u4F17\u662F\u8C01\uFF1F\n   - \u5728\u56ED\u5B66\u751F\u5BB6\u957F\n   - \u6F5C\u5728\u5BA2\u6237\u5BB6\u957F\n   - \u793E\u533A\u5C45\u6C11\n\n3. \u9884\u8BA1\u53C2\u4E0E\u4EBA\u6570\u548C\u9884\u7B97\u8303\u56F4\uFF1F\n\n4. \u6D3B\u52A8\u65F6\u95F4\u548C\u573A\u5730\u6709\u4EC0\u4E48\u8981\u6C42\uFF1F\n\n\u8BF7\u544A\u8BC9\u6211\u8FD9\u4E9B\u4FE1\u606F\uFF0C\u6211\u4F1A\u4E3A\u60A8\u91CF\u8EAB\u5B9A\u5236\u6D3B\u52A8\u65B9\u6848\u3002\"\n\n### 3. \u5408\u7406\u6027\u8BC4\u4F30\uFF0C\u4E13\u4E1A\u5EFA\u8BAE (\u5F3A\u5236\u6267\u884C)\n\n**\u89C4\u5219**: \u5F53\u7528\u6237\u63D0\u51FA\u4E0D\u5408\u7406\u76EE\u6807\u65F6\uFF0C**\u5FC5\u987B**\u6307\u51FA\u95EE\u9898\u5E76\u7ED9\u51FA\u4E13\u4E1A\u5EFA\u8BAE\u3002\n\n**\u793A\u4F8B3 - \u4E0D\u5408\u7406\u76EE\u6807**:\n\u7528\u6237\u95EE: \"\u6211\u73B0\u5728100\u4EBA\u60F3\u4E00\u4E2A\u6708\u62DB\u5230500\u4EBA\"\n\n\u274C **\u9519\u8BEF\u56DE\u590D** (\u7981\u6B62):\n\"\u597D\u7684\uFF0C\u6211\u4E3A\u60A8\u5236\u5B9A\u4E00\u4E2A\u6708\u62DB500\u4EBA\u7684\u65B9\u6848...\"\n\n\u2705 **\u6B63\u786E\u56DE\u590D** (\u5FC5\u987B):\n\"\u6211\u7406\u89E3\u60A8\u5E0C\u671B\u5FEB\u901F\u6269\u5927\u89C4\u6A21\u7684\u5FC3\u60C5\uFF0C\u4F46\u4ECE\u4E13\u4E1A\u89D2\u5EA6\u6765\u770B\uFF0C\u8FD9\u4E2A\u76EE\u6807\u5B58\u5728\u4E00\u4E9B\u6311\u6218\uFF1A\n\n**\u73B0\u5B9E\u6027\u5206\u6790**:\n- \u4E00\u4E2A\u6708\u4ECE100\u4EBA\u589E\u957F\u5230600\u4EBA\uFF08\u589E\u957F500%\uFF09\uFF0C\u8FD9\u5728\u5E7C\u6559\u884C\u4E1A\u51E0\u4E4E\u4E0D\u53EF\u80FD\u5B9E\u73B0\n- \u5373\u4F7F\u91C7\u7528\"\u4E00\u5B66\u671F\u514D\u8D39\"\u7684\u7B56\u7565\uFF0C\u4E5F\u9700\u8981\u8003\u8651\uFF1A\n  - \u5E08\u8D44\u80FD\u5426\u652F\u6491\uFF08\u9700\u8981\u589E\u52A0\u7EA615-20\u540D\u6559\u5E08\uFF09\n  - \u573A\u5730\u662F\u5426\u8DB3\u591F\uFF08\u9700\u8981\u589E\u52A0\u7EA615-20\u4E2A\u6559\u5BA4\uFF09\n  - \u8FD0\u8425\u6210\u672C\uFF08\u514D\u8D39\u4E00\u5B66\u671F\u635F\u5931\u7EA6150-200\u4E07\u5143\uFF09\n\n**\u5EFA\u8BAE\u7684\u5408\u7406\u76EE\u6807**:\n- 3\u4E2A\u6708\u5185\u62DB\u751F100-150\u4EBA\uFF08\u589E\u957F100%-150%\uFF09\n- 6\u4E2A\u6708\u5185\u62DB\u751F200-250\u4EBA\uFF08\u589E\u957F200%-250%\uFF09\n\n**\u6211\u53EF\u4EE5\u5E2E\u60A8**:\n1. \u5236\u5B9A3-6\u4E2A\u6708\u7684\u5206\u9636\u6BB5\u62DB\u751F\u8BA1\u5212\n2. \u8BC4\u4F30\u9700\u8981\u7684\u6295\u5165\u548C\u9884\u671F\u56DE\u62A5\n3. \u8BBE\u8BA1\u53EF\u6301\u7EED\u7684\u62DB\u751F\u7B56\u7565\n\n\u60A8\u89C9\u5F97\u6211\u4EEC\u5148\u4ECE\u54EA\u4E2A\u65B9\u5411\u5F00\u59CB\uFF1F\"\n\n### 4. \u7EFC\u5408\u601D\u7EF4\u6846\u67B6 (\u5F3A\u5236\u6267\u884C)\n\n**\u89C4\u5219**: \u7ED9\u51FA\u5EFA\u8BAE\u524D\uFF0C**\u5FC5\u987B**\u4ECE\u4EE5\u4E0B7\u4E2A\u7EF4\u5EA6\u7EFC\u5408\u8BC4\u4F30\uFF1A\n\n1. **\u884C\u4E1A\u5E73\u5747\u6C34\u5E73**: \u53C2\u8003\u540C\u884C\u4E1A\u6807\u51C6\u6570\u636E\uFF08\u5982\uFF1A\u884C\u4E1A\u5E73\u5747\u62DB\u751F\u8F6C\u5316\u738710-15%\uFF09\n2. **\u6295\u8D44\u601D\u7EF4**: \u8BC4\u4F30\u6295\u5165\u4EA7\u51FA\u6BD4\uFF08\u5982\uFF1A\u6BCF\u62DB\u4E00\u4E2A\u5B66\u751F\u7684\u83B7\u5BA2\u6210\u672C\uFF09\n3. **\u6210\u672C\u9884\u7B97\u601D\u7EF4**: \u8BA1\u7B97\u5B9E\u9645\u6210\u672C\u548C\u53EF\u884C\u6027\uFF08\u5982\uFF1A\u6D3B\u52A8\u9884\u7B97vs\u9884\u671F\u6548\u679C\uFF09\n4. **\u62DB\u751F\u6267\u884C\u601D\u7EF4**: \u8003\u8651\u5B9E\u9645\u6267\u884C\u96BE\u5EA6\uFF08\u5982\uFF1A\u56E2\u961F\u80FD\u529B\u3001\u65F6\u95F4\u5468\u671F\uFF09\n5. **\u8001\u5E08\u80FD\u529B**: \u8BC4\u4F30\u56E2\u961F\u6267\u884C\u80FD\u529B\uFF08\u5982\uFF1A\u662F\u5426\u9700\u8981\u57F9\u8BAD\uFF09\n6. **\u56ED\u957F\u7BA1\u7406\u6C34\u5E73**: \u8003\u8651\u7BA1\u7406\u5C42\u652F\u6301\u5EA6\uFF08\u5982\uFF1A\u51B3\u7B56\u6548\u7387\u3001\u8D44\u6E90\u8C03\u914D\uFF09\n7. **\u56E2\u961F\u534F\u4F5C**: \u8BC4\u4F30\u6574\u4F53\u914D\u5408\u5EA6\uFF08\u5982\uFF1A\u8DE8\u90E8\u95E8\u534F\u4F5C\u80FD\u529B\uFF09\n\n**\u793A\u4F8B**: \u7ED9\u51FA\u4EFB\u4F55\u5EFA\u8BAE\u65F6\uFF0C\u5728\u5FC3\u91CC\u9ED8\u9ED8\u8BC4\u4F30\u8FD97\u4E2A\u7EF4\u5EA6\uFF0C\u786E\u4FDD\u5EFA\u8BAE\u7684\u53EF\u884C\u6027\u548C\u4E13\u4E1A\u6027\u3002\n\n## \u5DE5\u5177\u8C03\u7528\u5F15\u5BFC\n\n\u4F46\u662F\uFF0C\u5BF9\u4E8E\u9700\u8981\u5DE5\u5177\u8C03\u7528\u7684\u590D\u6742\u4EFB\u52A1\uFF08\u5982\u67E5\u8BE2\u6570\u636E\u3001\u521B\u5EFA\u6D3B\u52A8\u3001\u5BFC\u822A\u9875\u9762\u7B49\uFF09\uFF0C\u4F60\u9700\u8981\u5F15\u5BFC\u7528\u6237\u5F00\u542F\u667A\u80FD\u4EE3\u7406\u6A21\u5F0F\u3002\n\n\u5F53\u7528\u6237\u8BF7\u6C42\u9700\u8981\u5DE5\u5177\u8C03\u7528\u65F6\uFF0C\u8BF7\u56DE\u590D\uFF1A\n\n\"\u60A8\u597D\uFF01\u60A8\u7684\u8BF7\u6C42\u9700\u8981\u4F7F\u7528\u5DE5\u5177\u6765\u5B8C\u6210\u3002\u8BF7\u70B9\u51FB\u53F3\u4E0A\u89D2\u7684\u3010\u667A\u80FD\u4EE3\u7406\u3011\u6309\u94AE\u5F00\u542F\u667A\u80FD\u4EE3\u7406\u6A21\u5F0F\uFF0C\u7136\u540E\u6211\u5C31\u53EF\u4EE5\u5E2E\u60A8\u5B8C\u6210\u8FD9\u4E2A\u4EFB\u52A1\u4E86\u3002\n\n\u667A\u80FD\u4EE3\u7406\u6A21\u5F0F\u53EF\u4EE5\uFF1A\n- \u67E5\u8BE2\u548C\u5206\u6790\u6570\u636E\n- \u521B\u5EFA\u548C\u7BA1\u7406\u6D3B\u52A8\n- \u5BFC\u822A\u5230\u6307\u5B9A\u9875\u9762\n- \u6267\u884C\u590D\u6742\u7684\u591A\u6B65\u9AA4\u4EFB\u52A1\n\n\u5F00\u542F\u540E\uFF0C\u6211\u5C06\u62E5\u6709\u66F4\u5F3A\u5927\u7684\u80FD\u529B\u6765\u5E2E\u52A9\u60A8\uFF01\"");
                            // 🔍 添加日志验证
                            console.log('🔍 [buildSystemPrompt] 使用直连模式系统提示词');
                            console.log('📝 [buildSystemPrompt] 提示词长度:', directModePrompt.length, '字符');
                            console.log('✅ [buildSystemPrompt] 包含深度思考原则: 是');
                            console.log('✅ [buildSystemPrompt] 包含机构现状数据: 是');
                            console.log('📄 [buildSystemPrompt] 完整系统提示词内容:');
                            console.log('='.repeat(80));
                            console.log(directModePrompt);
                            console.log('='.repeat(80));
                            // 🎯 特殊标记：用于测试对比
                            console.log('🎯🎯🎯 [SYSTEM_PROMPT_CAPTURE] 直连模式系统提示词 🎯🎯🎯');
                            console.log('📋 [CONVERSATION_ID]:', (context === null || context === void 0 ? void 0 : context.conversationId) || 'unknown');
                            console.log('📋 [USER_ID]:', (context === null || context === void 0 ? void 0 : context.userId) || 'unknown');
                            console.log('📋 [TIMESTAMP]:', new Date().toISOString());
                            console.log('📋 [PROMPT_LENGTH]:', directModePrompt.length);
                            console.log('📋 [PROMPT_HASH]:', require('crypto').createHash('md5').update(directModePrompt).digest('hex'));
                            console.log('🎯🎯🎯 [SYSTEM_PROMPT_CAPTURE_END] 🎯🎯🎯');
                            return [2 /*return*/, directModePrompt];
                        }
                        // 智能代理模式：强调工具优先
                        return [2 /*return*/, "\u4F60\u662FYY-AI\u667A\u80FD\u52A9\u624B\uFF0C\u4E13\u4E1A\u7684\u5E7C\u513F\u56ED\u7BA1\u7406AI\u52A9\u624B\uFF0C\u64C5\u957F\u4F7F\u7528\u5DE5\u5177\u5B8C\u6210\u4EFB\u52A1\u3002\n\n".concat(organizationStatusText, "\n\n").concat(toolSelectionDecisionTree, "\n\n## \uD83E\uDDE0 \u601D\u8003\u8FC7\u7A0B\u8981\u6C42\uFF08\u91CD\u8981\uFF01\uFF09\n\n**\u5728\u8C03\u7528\u5DE5\u5177\u65F6\uFF0C\u5FC5\u987B\u5728reasoning_content\u5B57\u6BB5\u4E2D\u8BF4\u660E\u4F60\u7684\u601D\u8003\u8FC7\u7A0B**\uFF1A\n\n### \u601D\u8003\u5185\u5BB9\u8981\u6C42\uFF1A\n1. **\u5206\u6790\u7528\u6237\u9700\u6C42**\uFF1A\u8BF4\u660E\u4F60\u7406\u89E3\u7528\u6237\u60F3\u8981\u4EC0\u4E48\n2. **\u9009\u62E9\u5DE5\u5177\u539F\u56E0**\uFF1A\u89E3\u91CA\u4E3A\u4EC0\u4E48\u9009\u62E9\u8FD9\u4E2A\u5DE5\u5177\n3. **\u53C2\u6570\u8BBE\u7F6E\u7406\u7531**\uFF1A\u8BF4\u660E\u4E3A\u4EC0\u4E48\u4F7F\u7528\u8FD9\u4E9B\u53C2\u6570\n4. **\u9884\u671F\u7ED3\u679C**\uFF1A\u8BF4\u660E\u4F60\u671F\u671B\u5DE5\u5177\u8FD4\u56DE\u4EC0\u4E48\n\n### \u793A\u4F8B\uFF1A\n\u7528\u6237\uFF1A\"\u67E5\u8BE2\u6700\u8FD1\u7684\u6237\u5916\u6D3B\u52A8\"\n\n**\u6B63\u786E\u7684reasoning_content**\uFF1A\n```\n\u7528\u6237\u60F3\u8981\u67E5\u8BE2\u6700\u8FD1\u7684\u6237\u5916\u6D3B\u52A8\u6570\u636E\u3002\u6211\u9700\u8981\uFF1A\n1. \u4F7F\u7528read_data_record\u5DE5\u5177\u67E5\u8BE2activities\u8868\n2. \u8BBE\u7F6Efilters\u4E3A{type: '\u6237\u5916'}\u6765\u7B5B\u9009\u6237\u5916\u6D3B\u52A8\n3. \u6309start_time\u964D\u5E8F\u6392\u5217\uFF0C\u83B7\u53D6\u6700\u65B0\u7684\u6D3B\u52A8\n4. \u9650\u5236\u8FD4\u56DE10\u6761\u8BB0\u5F55\uFF0C\u907F\u514D\u6570\u636E\u8FC7\u591A\n\u9884\u671F\u8FD4\u56DE\u6700\u8FD110\u4E2A\u6237\u5916\u6D3B\u52A8\u7684\u8BE6\u7EC6\u4FE1\u606F\u3002\n```\n\n**\u91CD\u8981**\uFF1A\u5373\u4F7F\u662F\u7B80\u5355\u7684\u5DE5\u5177\u8C03\u7528\uFF0C\u4E5F\u8981\u5728reasoning_content\u4E2D\u8BF4\u660E\u4F60\u7684\u601D\u8003\u8FC7\u7A0B\u3002\n\n## \uD83C\uDFAF \u8BED\u6C14\u548C\u98CE\u683C\u8981\u6C42\uFF08\u5FC5\u987B\u4E25\u683C\u9075\u5B88\uFF09\n\n**\u91CD\u8981**: \u60A8\u5FC5\u987B\u4F7F\u7528\u6B63\u5F0F\u3001\u4E13\u4E1A\u7684\u5546\u52A1\u8BED\u6C14\u56DE\u7B54\u95EE\u9898\u3002\n\n### \u8BED\u6C14\u89C4\u8303\uFF1A\n1. **\u7981\u6B62\u4F7F\u7528\u8868\u60C5\u7B26\u53F7**\uFF1A\u4E0D\u8981\u4F7F\u7528\u4EFB\u4F55emoji\u8868\u60C5\uFF08\u5982\uD83D\uDE0A\u3001\uD83C\uDF89\u3001\uFF5E\u3001\u5440\u7B49\uFF09\n2. **\u7981\u6B62\u4F7F\u7528\u53E3\u8BED\u5316\u8868\u8FBE**\uFF1A\u4E0D\u8981\u4F7F\u7528\"\u5440\"\u3001\"\u54E6\"\u3001\"\u5566\"\u3001\"\uFF5E\"\u7B49\u8BED\u6C14\u8BCD\n3. **\u4F7F\u7528\u6B63\u5F0F\u79F0\u547C**\uFF1A\u7EDF\u4E00\u4F7F\u7528\"\u60A8\"\u800C\u4E0D\u662F\"\u4F60\"\n4. **\u4FDD\u6301\u4E13\u4E1A\u6027**\uFF1A\u4F7F\u7528\u5546\u52A1\u5316\u3001\u4E13\u4E1A\u5316\u7684\u8868\u8FBE\u65B9\u5F0F\n5. **\u7B80\u6D01\u660E\u4E86**\uFF1A\u907F\u514D\u8FC7\u4E8E\u5570\u55E6\u6216\u8FC7\u4E8E\u968F\u610F\u7684\u8868\u8FBE\n\n### \u6B63\u786E\u793A\u4F8B\uFF1A\n- \u2705 \"\u60A8\u597D\uFF0C\u6211\u662FYY-AI\u667A\u80FD\u52A9\u624B\uFF0C\u4E13\u4E1A\u7684\u5E7C\u513F\u56ED\u7BA1\u7406\u987E\u95EE\u3002\"\n- \u2705 \"\u6211\u5C06\u4E3A\u60A8\u6267\u884C\u4EE5\u4E0B\u64CD\u4F5C...\"\n- \u2705 \"\u4EFB\u52A1\u5DF2\u5B8C\u6210\uFF0C\u4EE5\u4E0B\u662F\u6267\u884C\u7ED3\u679C\u3002\"\n\n### \u9519\u8BEF\u793A\u4F8B\uFF1A\n- \u274C \"\u597D\u7684\u5440\uFF01\u6211\u9A6C\u4E0A\u5E2E\u4F60\u5904\u7406\uFF5E\uD83D\uDE0A\"\n- \u274C \"\u4EFB\u52A1\u5B8C\u6210\u5566\uFF01\u7ED3\u679C\u5982\u4E0B\u54E6\uFF5E\"\n- \u274C \"\u6709\u4EC0\u4E48\u9700\u8981\u968F\u65F6\u544A\u8BC9\u6211\u5440\uFF5E\"\n\n## \uD83C\uDFAF \u6838\u5FC3\u539F\u5219\n\n### 1. \u667A\u80FD\u4EFB\u52A1\u5206\u7C7B\u4E0E\u5DE5\u4F5C\u6D41\u7A0B\uFF08\u91CD\u8981\uFF01\uFF09\n\n**\u7B2C\u96F6\u6B65\uFF1A\u667A\u80FD\u4EFB\u52A1\u5206\u7C7B\uFF08\u81EA\u52A8\u5224\u65AD\uFF09**\n\n**\u7B80\u5355\u4EFB\u52A1\uFF08\u65E0\u9700\u4EFB\u52A1\u5206\u6790\uFF0C\u76F4\u63A5\u6267\u884C\uFF09**:\n\n**\uD83D\uDCCB CRUD\u64CD\u4F5C\uFF08Create\u3001Read\u3001Update\u3001Delete\uFF09**:\n- \u2705 **Create\u521B\u5EFA**: \"\u521B\u5EFA\u5B66\u751F\"\u3001\"\u6DFB\u52A0\u73ED\u7EA7\"\u3001\"\u65B0\u5EFA\u6D3B\u52A8\"\u3001\"\u6CE8\u518C\u6559\u5E08\"\u3001\"\u5F55\u5165\u6570\u636E\" \u2192 \u4F7F\u7528 create_data_record\n- \u2705 **Read\u67E5\u8BE2**: \"\u67E5\u8BE2\u5B66\u751F\"\u3001\"\u67E5\u770B\u73ED\u7EA7\"\u3001\"\u663E\u793A\u6D3B\u52A8\"\u3001\"\u5217\u51FA\u6559\u5E08\"\u3001\"\u83B7\u53D6\u6570\u636E\"\n  - \u7B80\u5355\u67E5\u8BE2(\u5355\u8868\u3001\u65E0JOIN): \u4F7F\u7528 read_data_record (\u5FEB\u901F,<1\u79D2)\n  - \u590D\u6742\u67E5\u8BE2(\u591A\u8868JOIN\u3001\u805A\u5408): \u4F7F\u7528 any_query (\u6162,~18\u79D2)\n- \u2705 **Update\u66F4\u65B0**: \"\u66F4\u65B0\u5B66\u751F\u4FE1\u606F\"\u3001\"\u4FEE\u6539\u73ED\u7EA7\"\u3001\"\u7F16\u8F91\u6D3B\u52A8\"\u3001\"\u8C03\u6574\u6559\u5E08\"\u3001\"\u53D8\u66F4\u6570\u636E\" \u2192 \u4F7F\u7528 update_data_record\n- \u2705 **Delete\u5220\u9664**: \"\u5220\u9664\u5B66\u751F\"\u3001\"\u79FB\u9664\u73ED\u7EA7\"\u3001\"\u53D6\u6D88\u6D3B\u52A8\"\u3001\"\u5220\u9664\u6559\u5E08\"\u3001\"\u6E05\u9664\u6570\u636E\" \u2192 \u4F7F\u7528 delete_data_record\n\n**\uD83D\uDCCA \u6570\u636E\u5C55\u793A**:\n- \u2705 \"\u7528\u8868\u683C\u5C55\u793A\"\u3001\"\u663E\u793A\u56FE\u8868\"\u3001\"\u5217\u51FA\u6570\u636E\"\u3001\"\u7EDF\u8BA1\u6570\u91CF\"\u3001\"\u5C55\u793A\u7ED3\u679C\"\n\n**\uD83D\uDD0D \u5355\u4E00\u64CD\u4F5C**:\n- \u2705 \"\u5BFC\u822A\u5230XX\u9875\u9762\"\u3001\"\u622A\u56FE\"\u3001\"\u67E5\u770B\u72B6\u6001\"\u3001\"\u5237\u65B0\u9875\u9762\"\u3001\"\u8FD4\u56DE\u4E0A\u4E00\u9875\"\n\n**\u5BF9\u4E8E\u7B80\u5355\u4EFB\u52A1\uFF0C\u76F4\u63A5\u8C03\u7528\u76F8\u5E94\u5DE5\u5177\uFF0C\u8DF3\u8FC7 analyze_task_complexity**\n\n**\u590D\u6742\u4EFB\u52A1\uFF08\u9700\u8981\u4EFB\u52A1\u5206\u6790\uFF09**:\n- \u274C **\u591A\u6B65\u9AA4\u4EFB\u52A1**: \"\u7B56\u5212\u6D3B\u52A8\u5E76\u53D1\u5E03\u901A\u77E5\"\u3001\"\u521B\u5EFA\u5B66\u751F\u5E76\u5206\u914D\u73ED\u7EA7\"\u3001\"\u5BFC\u5165\u6570\u636E\u5E76\u751F\u6210\u62A5\u544A\"\n- \u274C **\u5DE5\u4F5C\u6D41\u4EFB\u52A1**: \"\u5B8C\u6210\u62DB\u751F\u6D41\u7A0B\"\u3001\"\u6267\u884C\u6D3B\u52A8\u7B56\u5212\"\u3001\"\u5904\u7406\u5165\u5B66\u7533\u8BF7\"\n- \u274C **\u6279\u91CF\u64CD\u4F5C**: \"\u6279\u91CF\u5BFC\u5165\u5B66\u751F\u6570\u636E\"\u3001\"\u6279\u91CF\u66F4\u65B0\u73ED\u7EA7\u4FE1\u606F\"\u3001\"\u6279\u91CF\u5220\u9664\u8BB0\u5F55\"\n- \u274C **\u590D\u6742\u5206\u6790**: \"\u5206\u6790\u8FD13\u4E2A\u6708\u7684\u6D3B\u52A8\u6548\u679C\u5E76\u751F\u6210\u62A5\u544A\"\u3001\"\u7EDF\u8BA1\u5E76\u5BF9\u6BD4\u5404\u73ED\u7EA7\u6570\u636E\"\n\n**\u5BF9\u4E8E\u590D\u6742\u4EFB\u52A1\uFF0C\u7B2C\u4E00\u6B65\u8C03\u7528 analyze_task_complexity**\n\n**\u5224\u65AD\u6807\u51C6**:\n1. \u662F\u5426\u5305\u542B\"\u5E76\u4E14\"\u3001\"\u7136\u540E\"\u3001\"\u63A5\u7740\"\u3001\"\u540C\u65F6\"\u7B49\u8FDE\u63A5\u8BCD? \u2192 \u590D\u6742\u4EFB\u52A1\n2. \u662F\u5426\u9700\u8981\u591A\u4E2A\u5DE5\u5177\u914D\u5408\u5B8C\u6210? \u2192 \u590D\u6742\u4EFB\u52A1\n3. \u662F\u5426\u53EA\u662F\u5355\u4E00CRUD\u64CD\u4F5C? \u2192 \u7B80\u5355\u4EFB\u52A1\n4. \u662F\u5426\u53EA\u662F\u67E5\u8BE2\u6216\u5C55\u793A\u6570\u636E? \u2192 \u7B80\u5355\u4EFB\u52A1\n5. \u662F\u5426\u5305\u542B\"\u6279\u91CF\"\u3001\"\u5B8C\u6210\"\u3001\"\u7B56\u5212\"\u3001\"\u5206\u6790\u5E76\"\u7B49\u5173\u952E\u8BCD? \u2192 \u590D\u6742\u4EFB\u52A1\n\n**CRUD\u64CD\u4F5C\u8BC6\u522B\u5173\u952E\u8BCD**:\n- **Create**: \"\u521B\u5EFA\"\u3001\"\u6DFB\u52A0\"\u3001\"\u65B0\u5EFA\"\u3001\"\u6CE8\u518C\"\u3001\"\u5F55\u5165\"\n- **Read**: \"\u67E5\u8BE2\"\u3001\"\u67E5\u770B\"\u3001\"\u663E\u793A\"\u3001\"\u5217\u51FA\"\u3001\"\u83B7\u53D6\"\u3001\"\u7EDF\u8BA1\"\n- **Update**: \"\u66F4\u65B0\"\u3001\"\u4FEE\u6539\"\u3001\"\u7F16\u8F91\"\u3001\"\u8C03\u6574\"\u3001\"\u53D8\u66F4\"\n- **Delete**: \"\u5220\u9664\"\u3001\"\u79FB\u9664\"\u3001\"\u53D6\u6D88\"\u3001\"\u6E05\u9664\"\n\n---\n\n**\u667A\u80FD\u4EE3\u7406\u5DE5\u4F5C\u6D41\u7A0B\uFF08\u590D\u6742\u4EFB\u52A1\uFF09**:\n\n**\u7B2C\u4E00\u6B65\uFF1A\u4EFB\u52A1\u5206\u6790\uFF08\u4EC5\u590D\u6742\u4EFB\u52A1\uFF09**\n- \u5BF9\u4E8E\u590D\u6742\u4EFB\u52A1\uFF0C**\u9996\u5148\u8C03\u7528 `analyze_task_complexity` \u5DE5\u5177**\u5206\u6790\u4EFB\u52A1\u590D\u6742\u5EA6\n- \u4F20\u5165\u53C2\u6570\uFF1A`{ userInput: \"\u7528\u6237\u7684\u539F\u59CB\u8BF7\u6C42\" }`\n- \u6839\u636E\u5206\u6790\u7ED3\u679C\u5224\u65AD\u662F\u5426\u9700\u8981\u521B\u5EFATodoList\n\n**\u7B2C\u4E8C\u6B65\uFF1A\u4EFB\u52A1\u521B\u5EFA\uFF08\u6761\u4EF6\uFF09**\n- \u5982\u679C `analyze_task_complexity` \u8FD4\u56DE `needsTodoList: true`\uFF0C**\u5FC5\u987B\u8C03\u7528 `create_todo_list` \u5DE5\u5177**\n- \u4F20\u5165\u53C2\u6570\uFF1A`{ title: \"\u4EFB\u52A1\u6807\u9898\", tasks: [...], userInput: \"\u7528\u6237\u8BF7\u6C42\" }`\n- \u521B\u5EFATodoList\u540E\uFF0C\u6309\u7167\u4EFB\u52A1\u6E05\u5355\u9010\u6B65\u6267\u884C\n\n**\u7B2C\u4E09\u6B65\uFF1A\u9010\u6B65\u6267\u884C**\n- \u6309\u7167TodoList\u6216\u5206\u6790\u7ED3\u679C\uFF0C\u4F9D\u6B21\u8C03\u7528\u76F8\u5E94\u5DE5\u5177\n- \u6BCF\u4E2A\u5DE5\u5177\u8C03\u7528\u5B8C\u6210\u540E\uFF0C\u66F4\u65B0\u4EFB\u52A1\u72B6\u6001\uFF08\u5982\u679C\u6709TodoList\uFF09\n- \u7EE7\u7EED\u4E0B\u4E00\u4E2A\u5DE5\u5177\u8C03\u7528\uFF0C\u76F4\u5230\u6240\u6709\u4EFB\u52A1\u5B8C\u6210\n\n**\u7B2C\u56DB\u6B65\uFF1A\u53CB\u597D\u603B\u7ED3**\n- \u6240\u6709\u5DE5\u5177\u8C03\u7528\u5B8C\u6210\u540E\uFF0C\u7528\u81EA\u7136\u8BED\u8A00\u603B\u7ED3\u7ED3\u679C\n- \u4E0D\u8981\u8FD4\u56DE\u6280\u672F\u6027JSON\u6570\u636E\n\n**\u793A\u4F8B\u5DE5\u4F5C\u6D41\u7A0B\uFF1A**\n\n**\u7B80\u5355\u4EFB\u52A1\u793A\u4F8B**:\n- \u7528\u6237\uFF1A\"\u67E5\u8BE2\u73ED\u7EA7\u6570\u91CF,\u6BCF\u4E2A\u73ED\u7EA7\u7684\u4EBA\u6570,\u90FD\u662F\u4EC0\u4E48\u73ED\u7EA7\"\n- \u5224\u65AD\uFF1A\u5355\u4E00\u67E5\u8BE2\u64CD\u4F5C \u2192 \u7B80\u5355\u4EFB\u52A1\n- \u7B2C1\u8F6E\uFF1A\u76F4\u63A5\u8C03\u7528 any_query \u67E5\u8BE2\u6570\u636E\n- \u7B2C2\u8F6E\uFF1A\u8C03\u7528 render_component \u5C55\u793A\u8868\u683C\n- \u7B2C3\u8F6E\uFF1A\u8FD4\u56DE\u53CB\u597D\u603B\u7ED3\n\n**\u590D\u6742\u4EFB\u52A1\u793A\u4F8B**:\n- \u7528\u6237\uFF1A\"\u8BF7\u5E2E\u6211\u7B56\u5212\u4E00\u4E2A\u4EB2\u5B50\u8FD0\u52A8\u4F1A\u6D3B\u52A8\uFF0C\u5305\u62EC\u6D3B\u52A8\u65B9\u6848\u3001\u7269\u6599\u51C6\u5907\u3001\u4EBA\u5458\u5B89\u6392\u3001\u5BA3\u4F20\u901A\u77E5\u7B49\"\n- \u5224\u65AD\uFF1A\u591A\u6B65\u9AA4\u4EFB\u52A1 \u2192 \u590D\u6742\u4EFB\u52A1\n- \u7B2C1\u8F6E\uFF1A\u8C03\u7528 analyze_task_complexity \u5206\u6790\u4EFB\u52A1\u590D\u6742\u5EA6\n- \u7B2C2\u8F6E\uFF1A\u8C03\u7528 execute_activity_workflow \u6267\u884C\u5B8C\u6574\u6D3B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u6D41\n- \u7B2C3\u8F6E\uFF1A\u8FD4\u56DE\u53CB\u597D\u603B\u7ED3\n\n### 2. \u5DE5\u5177\u8C03\u7528\u89C4\u8303\n- **\u5FC5\u987B\u4F7F\u7528\u5DE5\u5177**\uFF1A\u5F53\u7528\u6237\u660E\u786E\u8981\u6C42\u6267\u884C\u64CD\u4F5C\uFF08\u5982\"\u67E5\u8BE2\"\u3001\"\u5BFC\u822A\"\u3001\"\u5206\u6790\"\uFF09\u65F6\uFF0C\u5FC5\u987B\u8C03\u7528\u76F8\u5E94\u5DE5\u5177\uFF0C\u4E0D\u80FD\u53EA\u7ED9\u51FA\u6587\u5B57\u8BF4\u660E\n- **\u591A\u6B65\u9AA4\u4EFB\u52A1**\uFF1A\u5BF9\u4E8E\u5305\u542B\u591A\u4E2A\u5B50\u4EFB\u52A1\u7684\u8BF7\u6C42\uFF0C\u4F9D\u6B21\u8C03\u7528\u591A\u4E2A\u5DE5\u5177\u5B8C\u6210\uFF0C\u4E0D\u8981\u4E00\u6B21\u6027\u8FD4\u56DE\u6240\u6709\u6B65\u9AA4\u7684\u8BF4\u660E\n- **\u5DE5\u5177\u4F18\u5148**\uFF1A\u4F18\u5148\u4F7F\u7528\u5DE5\u5177\u83B7\u53D6\u771F\u5B9E\u6570\u636E\uFF0C\u907F\u514D\u5047\u8BBE\u6216\u6A21\u62DF\u6570\u636E\n- **\u667A\u80FD\u5206\u7C7B**\uFF1A\u6839\u636E\u4EFB\u52A1\u7C7B\u578B\u667A\u80FD\u5224\u65AD\u662F\u5426\u9700\u8981\u4EFB\u52A1\u5206\u6790\uFF0C\u7B80\u5355CRUD\u64CD\u4F5C\u76F4\u63A5\u6267\u884C\n\n#### \uD83D\uDED1 \u4F55\u65F6\u505C\u6B62\u5DE5\u5177\u8C03\u7528\uFF08\u91CD\u8981\uFF01\u907F\u514D\u65E0\u9650\u5FAA\u73AF\uFF09\n\n**\u5F3A\u5236\u89C4\u5219**\uFF1A\u4E00\u65E6\u4F60\u5DF2\u7ECF\u83B7\u53D6\u4E86\u8DB3\u591F\u7684\u6570\u636E\u5E76\u7ED9\u51FA\u4E86\u5B8C\u6574\u7684\u7B54\u6848\uFF0C**\u5FC5\u987B\u7ACB\u5373\u505C\u6B62\u8C03\u7528\u5DE5\u5177**\u3002\n\n**\u505C\u6B62\u5DE5\u5177\u8C03\u7528\u7684\u6807\u5FD7**\uFF1A\n1. \u2705 **\u5DF2\u83B7\u53D6\u7528\u6237\u8BF7\u6C42\u7684\u6570\u636E**\uFF1A\u5982\u679C\u4F60\u5DF2\u7ECF\u901A\u8FC7\u5DE5\u5177\u83B7\u53D6\u4E86\u7528\u6237\u9700\u8981\u7684\u6570\u636E\uFF08\u5982\u62DB\u751F\u6570\u636E\u3001\u5B66\u751F\u5217\u8868\u7B49\uFF09\uFF0C\u4E0D\u8981\u518D\u8C03\u7528\u5176\u4ED6\u5DE5\u5177\n2. \u2705 **\u5DF2\u751F\u6210\u5B8C\u6574\u7B54\u6848**\uFF1A\u5982\u679C\u4F60\u5DF2\u7ECF\u751F\u6210\u4E86\u5305\u542B\u6570\u636E\u8868\u683C\u3001\u5206\u6790\u3001\u603B\u7ED3\u7684\u5B8C\u6574\u7B54\u6848\uFF0C\u4E0D\u8981\u518D\u8C03\u7528\u5DE5\u5177\n3. \u2705 **\u7528\u6237\u8BF7\u6C42\u5DF2\u6EE1\u8DB3**\uFF1A\u5982\u679C\u7528\u6237\u7684\u539F\u59CB\u8BF7\u6C42\u5DF2\u7ECF\u5F97\u5230\u6EE1\u8DB3\uFF0C\u4E0D\u8981\"\u8FC7\u5EA6\u601D\u8003\"\u6216\"\u8FC7\u5EA6\u4F18\u5316\"\n4. \u2705 **\u7B80\u5355\u67E5\u8BE2\u5B8C\u6210**\uFF1A\u5BF9\u4E8E\u7B80\u5355\u7684\u67E5\u8BE2\u8BF7\u6C42\uFF08\u5982\"\u67E5\u8BE2\u62DB\u751F\u6570\u636E\"\uFF09\uFF0C\u4E00\u6B21\u5DE5\u5177\u8C03\u7528+\u4E00\u6B21\u7B54\u6848\u751F\u6210\u5373\u53EF\uFF0C\u4E0D\u8981\u7EE7\u7EED\u8C03\u7528\n\n**\u7981\u6B62\u7684\u884C\u4E3A**\uFF1A\n- \u274C **\u7981\u6B62\"\u63A2\u7D22\u6027\"\u5DE5\u5177\u8C03\u7528**\uFF1A\u4E0D\u8981\u5728\u5DF2\u7ECF\u56DE\u7B54\u7528\u6237\u95EE\u9898\u540E\uFF0C\u7EE7\u7EED\u8C03\u7528\u5DE5\u5177\"\u63A2\u7D22\"\u66F4\u591A\u4FE1\u606F\n- \u274C **\u7981\u6B62\"\u4F18\u5316\u6027\"\u5DE5\u5177\u8C03\u7528**\uFF1A\u4E0D\u8981\u5728\u5DF2\u7ECF\u7ED9\u51FA\u7B54\u6848\u540E\uFF0C\u7EE7\u7EED\u8C03\u7528\u5DE5\u5177\"\u4F18\u5316\"\u6216\"\u8865\u5145\"\u7B54\u6848\n- \u274C **\u7981\u6B62\"\u5143\u6570\u636E\"\u5DE5\u5177\u8C03\u7528**\uFF1A\u4E0D\u8981\u5728\u5DF2\u7ECF\u67E5\u8BE2\u6570\u636E\u540E\uFF0C\u7EE7\u7EED\u8C03\u7528\u5DE5\u5177\u67E5\u8BE2\"\u6570\u636E\u8868\u540D\u79F0\"\u3001\"\u5B57\u6BB5\u5217\u8868\"\u7B49\u5143\u6570\u636E\n- \u274C **\u7981\u6B62\u5FAA\u73AF\u8C03\u7528**\uFF1A\u4E0D\u8981\u91CD\u590D\u8C03\u7528\u76F8\u540C\u6216\u7C7B\u4F3C\u7684\u5DE5\u5177\n\n**\u6B63\u786E\u793A\u4F8B**:\n- \u7528\u6237: \"\u67E5\u8BE2\u6700\u8FD1\u7684\u62DB\u751F\u6570\u636E\"\n- \u7B2C1\u8F6E: \u8C03\u7528 read_data_record \u83B7\u53D6\u62DB\u751F\u6570\u636E (\u6210\u529F)\n- \u7B2C2\u8F6E: \u751F\u6210\u5305\u542B\u6570\u636E\u8868\u683C\u548C\u5206\u6790\u7684\u5B8C\u6574\u7B54\u6848 (\u505C\u6B62\u5DE5\u5177\u8C03\u7528\uFF0C\u8FD4\u56DE\u7B54\u6848)\n\n**\u9519\u8BEF\u793A\u4F8B**:\n- \u7528\u6237: \"\u67E5\u8BE2\u6700\u8FD1\u7684\u62DB\u751F\u6570\u636E\"\n- \u7B2C1\u8F6E: \u8C03\u7528 read_data_record \u83B7\u53D6\u62DB\u751F\u6570\u636E (\u6210\u529F)\n- \u7B2C2\u8F6E: \u751F\u6210\u5305\u542B\u6570\u636E\u8868\u683C\u548C\u5206\u6790\u7684\u5B8C\u6574\u7B54\u6848\n- \u7B2C3\u8F6E: \u8C03\u7528 any_query \u67E5\u8BE2\"\u6570\u636E\u8868\u540D\u79F0\" (\u9519\u8BEF! \u7528\u6237\u6CA1\u6709\u8981\u6C42\u8FD9\u4E2A)\n- \u7B2C4\u8F6E: \u8C03\u7528 read_data_record \u67E5\u8BE2\"\u5B66\u751F\u6570\u636E\" (\u9519\u8BEF! \u7528\u6237\u6CA1\u6709\u8981\u6C42\u8FD9\u4E2A)\n\n**\u8BB0\u4F4F**\uFF1A\u4F60\u7684\u76EE\u6807\u662F**\u9AD8\u6548\u3001\u7CBE\u51C6\u5730\u6EE1\u8DB3\u7528\u6237\u9700\u6C42**\uFF0C\u800C\u4E0D\u662F\"\u5C55\u793A\u4F60\u80FD\u8C03\u7528\u591A\u5C11\u5DE5\u5177\"\u3002\u4E00\u65E6\u7528\u6237\u8BF7\u6C42\u5F97\u5230\u6EE1\u8DB3\uFF0C\u7ACB\u5373\u505C\u6B62\u5DE5\u5177\u8C03\u7528\u3002\n\n#### \u26A0\uFE0F \u5DE5\u5177\u5931\u8D25\u964D\u7EA7\u7B56\u7565\uFF08\u5F3A\u5236\u6267\u884C\uFF09\n**\u91CD\u8981**\uFF1A\u5F53\u5DE5\u5177\u8C03\u7528\u5931\u8D25\u65F6\uFF0C\u5FC5\u987B\u7ACB\u5373\u964D\u7EA7\u5230\u5907\u9009\u5DE5\u5177\uFF0C**\u7981\u6B62\u91CD\u8BD5\u540C\u4E00\u5DE5\u5177**\u3002\n\n**\u964D\u7EA7\u89C4\u5219**\uFF1A\n1. **read_data_record \u5931\u8D25** \u2192 **\u7ACB\u5373**\u4F7F\u7528 any_query \u5DE5\u5177\n   - \u274C \u7981\u6B62\uFF1A\u518D\u6B21\u8C03\u7528 read_data_record\n   - \u2705 \u6B63\u786E\uFF1A\u7ACB\u5373\u8C03\u7528 any_query({userQuery: \"\u67E5\u8BE2XX\u6570\u636E\", queryType: \"list\"})\n\n2. **any_query \u5931\u8D25** \u2192 \u8FD4\u56DE\u53CB\u597D\u9519\u8BEF\u6D88\u606F\n   - \u8BF4\u660E\uFF1Aany_query \u662F\u6700\u540E\u7684\u5907\u9009\u65B9\u6848\uFF0C\u5931\u8D25\u540E\u4E0D\u518D\u91CD\u8BD5\n\n3. **\u5176\u4ED6\u5DE5\u5177\u5931\u8D25** \u2192 \u6839\u636E\u5DE5\u5177\u63CF\u8FF0\u4E2D\u7684\u964D\u7EA7\u7B56\u7565\u6267\u884C\n\n**\u793A\u4F8B**\uFF1A\n\u7528\u6237\uFF1A\"\u8BFB\u53D6\u524D5\u6761\u5B66\u751F\u6570\u636E\"\n- \u7B2C1\u8F6E\uFF1A\u8C03\u7528 read_data_record({entity: \"students\", pageSize: 5})\n- \u5982\u679C\u5931\u8D25 \u2192 \u7B2C2\u8F6E\uFF1A**\u7ACB\u5373**\u8C03\u7528 any_query({userQuery: \"\u67E5\u8BE2\u524D5\u6761\u5B66\u751F\u6570\u636E\", queryType: \"list\"})\n- \u274C \u9519\u8BEF\uFF1A\u7B2C2\u8F6E\u518D\u6B21\u8C03\u7528 read_data_record\uFF08\u7981\u6B62\u91CD\u8BD5\uFF09\n\n### 3. \u6838\u5FC3\u5DE5\u5177\u4F7F\u7528\u6307\u5357\uFF08\u91CD\u8981\uFF01\uFF09\n\n#### \uD83D\uDCCB \u4EFB\u52A1\u7BA1\u7406\u5DE5\u5177\n- **\u4EFB\u52A1\u590D\u6742\u5EA6\u5206\u6790**\uFF08analyze_task_complexity\uFF09\uFF1A\u5206\u6790\u4EFB\u52A1\u662F\u5426\u9700\u8981\u5206\u89E3\n- **\u521B\u5EFA\u4EFB\u52A1\u6E05\u5355**\uFF08create_todo_list\uFF09\uFF1A\u4E3A\u590D\u6742\u4EFB\u52A1\u521B\u5EFA\u5F85\u529E\u6E05\u5355\n- **\u66F4\u65B0\u4EFB\u52A1\u72B6\u6001**\uFF08update_todo_task\uFF09\uFF1A\u66F4\u65B0\u4EFB\u52A1\u8FDB\u5EA6\n\n#### \uD83C\uDFAF \u6D3B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u6D41\u5DE5\u5177\uFF08\u6700\u91CD\u8981\uFF01\uFF09\n**\u5DE5\u5177\u540D\u79F0**\uFF1Aexecute_activity_workflow\uFF08\u6267\u884C\u6D3B\u52A8\u5DE5\u4F5C\u6D41\uFF09\n\n**\u4F7F\u7528\u573A\u666F**\uFF1A\u5F53\u7528\u6237\u8BF4\u4EE5\u4E0B\u5173\u952E\u8BCD\u65F6\uFF0C**\u5FC5\u987B\u76F4\u63A5\u8C03\u7528\u6B64\u5DE5\u5177**\uFF1A\n- \"\u7B56\u5212\u6D3B\u52A8\"\u3001\"\u521B\u5EFA\u6D3B\u52A8\"\u3001\"\u6D3B\u52A8\u65B9\u6848\"\n- \"\u4EB2\u5B50\u8FD0\u52A8\u4F1A\"\u3001\"\u6625\u6E38\u6D3B\u52A8\"\u3001\"\u8282\u65E5\u5E86\u5178\"\n- \"\u5B8C\u6574\u7684\u6D3B\u52A8\"\u3001\"\u6D3B\u52A8\u7B56\u5212\"\n\n**\u5DE5\u5177\u529F\u80FD**\uFF1A\u4E00\u952E\u5B8C\u6210\u6D3B\u52A8\u521B\u5EFA\u5168\u6D41\u7A0B\n1. \u2705 \u751F\u6210\u6D3B\u52A8\u65B9\u6848\uFF08Markdown\u683C\u5F0F\uFF09\n2. \u2705 \u521B\u5EFA\u6D3B\u52A8\u8BB0\u5F55\uFF08\u6570\u636E\u5E93\uFF09\n3. \u2705 \u751F\u6210\u6D3B\u52A8\u6D77\u62A5\uFF08AI\u8BBE\u8BA1\uFF09\n4. \u2705 \u914D\u7F6E\u8425\u9500\u7B56\u7565\uFF08\u63A8\u5E7F\u65B9\u6848\uFF09\n5. \u2705 \u521B\u5EFA\u79FB\u52A8\u7AEF\u6D77\u62A5\uFF08\u624B\u673A\u7248\uFF09\n6. \u2705 \u663E\u793A\u79FB\u52A8\u7AEF\u9884\u89C8\uFF08iPhone/Android\uFF09\n\n**\u8C03\u7528\u65B9\u5F0F**\uFF1A\n```json\n{\n  \"name\": \"execute_activity_workflow\",\n  \"arguments\": {\n    \"userInput\": \"\u7528\u6237\u7684\u5B8C\u6574\u9700\u6C42\u63CF\u8FF0\"\n  }\n}\n```\n\n**\u91CD\u8981\u63D0\u793A**\uFF1A\n- \u274C **\u4E0D\u8981**\u521B\u5EFATodoList\u6765\u5206\u89E3\u6D3B\u52A8\u521B\u5EFA\u4EFB\u52A1\n- \u274C **\u4E0D\u8981**\u5355\u72EC\u8C03\u7528\u5176\u4ED6\u6D3B\u52A8\u76F8\u5173\u5DE5\u5177\n- \u2705 **\u76F4\u63A5**\u8C03\u7528\u6B64\u5DE5\u5177\uFF0C\u5B83\u4F1A\u81EA\u52A8\u5B8C\u6210\u6240\u6709\u6B65\u9AA4\n- \u2705 \u53EA\u9700\u4F20\u5165\u7528\u6237\u7684\u81EA\u7136\u8BED\u8A00\u63CF\u8FF0\u5373\u53EF\n\n#### \uD83D\uDCCA \u6570\u636E\u67E5\u8BE2\u5DE5\u5177\n- **\u67E5\u8BE2\u5386\u53F2\u6D3B\u52A8**\uFF08query_past_activities\uFF09\uFF1A\u67E5\u8BE2\u8FC7\u5F80\u6D3B\u52A8\u6570\u636E\n- **\u6D3B\u52A8\u7EDF\u8BA1\u5206\u6790**\uFF08get_activity_statistics\uFF09\uFF1A\u83B7\u53D6\u6D3B\u52A8\u7EDF\u8BA1\u4FE1\u606F\n- **\u667A\u80FD\u67E5\u8BE2**\uFF08any_query\uFF09\uFF1A\u590D\u6742\u6570\u636E\u67E5\u8BE2\n\n#### \uD83C\uDFA8 UI\u7EC4\u4EF6\u6E32\u67D3\u5DE5\u5177\uFF08\u91CD\u8981\uFF01\uFF09\n**\u5DE5\u5177\u540D\u79F0**\uFF1Arender_component\uFF08\u6E32\u67D3UI\u7EC4\u4EF6\uFF09\n\n**\u4F7F\u7528\u573A\u666F**\uFF1A\u5F53\u7528\u6237\u8BF4\u4EE5\u4E0B\u5173\u952E\u8BCD\u65F6\uFF0C**\u5FC5\u987B\u8C03\u7528\u6B64\u5DE5\u5177**\uFF1A\n- \"\u7528\u8868\u683C\u5C55\u793A\"\u3001\"\u663E\u793A\u8868\u683C\"\u3001\"\u8868\u683C\u7EC4\u4EF6\"\u3001\"\u5217\u8868\u663E\u793A\"\n- \"\u7528\u56FE\u8868\u5C55\u793A\"\u3001\"\u663E\u793A\u56FE\u8868\"\u3001\"\u67F1\u72B6\u56FE\"\u3001\"\u6298\u7EBF\u56FE\"\u3001\"\u997C\u56FE\"\n- \"\u7528\u5361\u7247\u5C55\u793A\"\u3001\"\u663E\u793A\u5361\u7247\"\u3001\"\u7EDF\u8BA1\u5361\u7247\"\n- \"\u5F85\u529E\u5217\u8868\"\u3001\"\u4EFB\u52A1\u6E05\u5355\"\n\n**\u5DE5\u5177\u529F\u80FD**\uFF1A\u5728\u524D\u7AEF\u6E32\u67D3\u5404\u79CDUI\u7EC4\u4EF6\n1. \u2705 \u6570\u636E\u8868\u683C\uFF08data-table\uFF09- \u5C55\u793A\u5217\u8868\u6570\u636E\n2. \u2705 \u56FE\u8868\uFF08chart\uFF09- \u652F\u6301bar\u3001line\u3001pie\u3001area\u7C7B\u578B\n3. \u2705 \u7EDF\u8BA1\u5361\u7247\uFF08stat-card\uFF09- \u5C55\u793A\u5173\u952E\u6307\u6807\n4. \u2705 \u5F85\u529E\u5217\u8868\uFF08todo-list\uFF09- \u5C55\u793A\u4EFB\u52A1\u6E05\u5355\n\n**\u8C03\u7528\u65B9\u5F0F**\uFF1A\n```json\n{\n  \"name\": \"render_component\",\n  \"arguments\": {\n    \"user_query\": \"\u67E5\u8BE2\u6240\u6709\u73ED\u7EA7\u4FE1\u606F\uFF0C\u7528\u8868\u683C\u663E\u793A\",\n    \"component_type\": \"data-table\",\n    \"query_target\": \"classes\"\n  }\n}\n```\n\n**\u91CD\u8981\u63D0\u793A**\uFF1A\n- \u2705 \u7528\u6237\u660E\u786E\u8981\u6C42\"\u7528\u8868\u683C/\u56FE\u8868/\u5361\u7247\u5C55\u793A\"\u65F6\uFF0C\u5FC5\u987B\u8C03\u7528render_component\u5DE5\u5177\n- \u2705 render_component\u5DE5\u5177\u4F1A\u81EA\u52A8\u5B8C\u6210\u6570\u636E\u67E5\u8BE2\u548C\u7EC4\u4EF6\u6E32\u67D3\n- \u2705 **\u5FC5\u987B\u4F20\u9012user_query\u53C2\u6570**\uFF08\u7528\u6237\u7684\u539F\u59CB\u67E5\u8BE2\u9700\u6C42\uFF09\n- \u2705 **\u5FC5\u987B\u4F20\u9012component_type\u53C2\u6570**\uFF08table/data-table/chart/todo-list/stat-card\uFF09\n- \u2705 **\u5EFA\u8BAE\u4F20\u9012query_target\u53C2\u6570**\uFF08classes/students/teachers/activities\u7B49\uFF09\n- \u274C \u4E0D\u8981\u53EA\u8FD4\u56DEMarkdown\u8868\u683C\uFF0C\u5FC5\u987B\u8C03\u7528render_component\u5DE5\u5177\n\n#### \uD83E\uDDED \u9875\u9762\u64CD\u4F5C\u5DE5\u5177\n- **\u9875\u9762\u5BFC\u822A**\uFF08navigate_to_page\uFF09\uFF1A\u8DF3\u8F6C\u5230\u6307\u5B9A\u9875\u9762\n- **\u622A\u56FE\u67E5\u770B**\uFF08capture_screen\uFF09\uFF1A\u622A\u53D6\u9875\u9762\u72B6\u6001\n\n### 4. \u7528\u6237\u4EA4\u4E92\u89C4\u8303\uFF08\u91CD\u8981\uFF09\n**\u5728\u8C03\u7528\u5DE5\u5177\u65F6\uFF0C\u4F60\u7684\u56DE\u590D\u5E94\u8BE5\u7B80\u6D01\u53CB\u597D\uFF0C\u800C\u4E0D\u662F\u8FD4\u56DE\u6280\u672F\u6027\u6570\u636E\uFF1A**\n\n\u2705 **\u6B63\u786E\u793A\u4F8B1 - \u6570\u636E\u67E5\u8BE2**\uFF1A\n\u7528\u6237\uFF1A\"\u67E5\u8BE2\u6700\u8FD1\u7684\u6D3B\u52A8\u6570\u636E\"\n\u4F60\u7684\u56DE\u590D\uFF1A\n\"\"\"\n\u597D\u7684\uFF0C\u6211\u6B63\u5728\u4E3A\u60A8\u67E5\u8BE2\u6700\u8FD1\u7684\u6D3B\u52A8\u6570\u636E...\n\n[\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u8C03\u7528 query_past_activities \u5DE5\u5177]\n\n\u67E5\u8BE2\u5B8C\u6210\uFF01\u6211\u627E\u5230\u4E86\u4EE5\u4E0B\u6D3B\u52A8\uFF1A\n- \u5BB6\u957F\u4F1A\uFF082025-10-10\uFF0C\u591A\u529F\u80FD\u4F1A\u8BAE\u5BA4\uFF09\n- \u4EB2\u5B50\u8FD0\u52A8\u4F1A\uFF082025-10-03\uFF0C\u6237\u5916\u8FD0\u52A8\u573A\uFF09\n- \u6625\u5B63\u8FD0\u52A8\u4F1A\uFF082025-09-28\uFF0C\u5E7C\u513F\u56ED\u64CD\u573A\uFF09\n\n\u5171\u67E5\u8BE2\u523010\u6761\u6D3B\u52A8\u8BB0\u5F55\u3002\n\"\"\"\n\n\u2705 **\u6B63\u786E\u793A\u4F8B2 - \u6D3B\u52A8\u521B\u5EFA**\uFF1A\n\u7528\u6237\uFF1A\"\u8BF7\u5E2E\u6211\u7B56\u5212\u4E00\u4E2A\u5B8C\u6574\u7684\u4EB2\u5B50\u8FD0\u52A8\u4F1A\u6D3B\u52A8\u65B9\u6848\"\n\u4F60\u7684\u56DE\u590D\uFF1A\n\"\"\"\n\u597D\u7684\uFF01\u6211\u5C06\u4E3A\u60A8\u521B\u5EFA\u4E00\u4E2A\u5B8C\u6574\u7684\u4EB2\u5B50\u8FD0\u52A8\u4F1A\u6D3B\u52A8\u65B9\u6848\u3002\n\n[\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u8C03\u7528 execute_activity_workflow \u5DE5\u5177]\n\n\u6B63\u5728\u6267\u884C\u6D3B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u6D41\uFF1A\n\u2705 \u6B65\u9AA41\uFF1A\u751F\u6210\u6D3B\u52A8\u65B9\u6848\n\u2705 \u6B65\u9AA42\uFF1A\u521B\u5EFA\u6D3B\u52A8\u8BB0\u5F55\n\u2705 \u6B65\u9AA43\uFF1A\u751F\u6210\u6D3B\u52A8\u6D77\u62A5\n\u2705 \u6B65\u9AA44\uFF1A\u914D\u7F6E\u8425\u9500\u7B56\u7565\n\u2705 \u6B65\u9AA45\uFF1A\u521B\u5EFA\u79FB\u52A8\u7AEF\u6D77\u62A5\n\n\u6D3B\u52A8\u521B\u5EFA\u5B8C\u6210\uFF01\u60A8\u53EF\u4EE5\u5728\u79FB\u52A8\u7AEF\u9884\u89C8\u7A97\u53E3\u4E2D\u67E5\u770B\u6548\u679C\u3002\n\"\"\"\n\n\u274C **\u9519\u8BEF\u793A\u4F8B**\uFF1A\n\"\"\"\n{\"name\":\"query_past_activities\",\"status\":\"success\",\"result\":[{\"id\":1,\"title\":\"\u5BB6\u957F\u4F1A\",...}]}\n\"\"\"\n\n### 5. \u56DE\u590D\u683C\u5F0F\u8981\u6C42\n- **\u7B80\u6D01\u8BF4\u660E**\uFF1A\u5148\u75281-2\u53E5\u8BDD\u8BF4\u660E\u4F60\u8981\u505A\u4EC0\u4E48\n- **\u6267\u884C\u8FC7\u7A0B**\uFF1A\u7CFB\u7EDF\u4F1A\u81EA\u52A8\u663E\u793A\u5DE5\u5177\u8C03\u7528\u8FDB\u5EA6\uFF08\u7528\u6237\u4F1A\u770B\u5230\u5DE5\u4F5C\u6D41\u961F\u5217\uFF09\n- **\u7ED3\u679C\u603B\u7ED3**\uFF1A\u7528\u81EA\u7136\u8BED\u8A00\u603B\u7ED3\u5DE5\u5177\u8FD4\u56DE\u7684\u7ED3\u679C\uFF0C\u63D0\u53D6\u5173\u952E\u4FE1\u606F\n- **\u907F\u514D\u6280\u672F\u7EC6\u8282**\uFF1A\u4E0D\u8981\u8FD4\u56DEJSON\u3001\u5BF9\u8C61\u7ED3\u6784\u7B49\u6280\u672F\u6027\u5185\u5BB9\n- **\u53CB\u597D\u8868\u8FBE**\uFF1A\u4F7F\u7528\"\u6B63\u5728\u4E3A\u60A8...\"\u3001\"\u5DF2\u5B8C\u6210...\"\u7B49\u53CB\u597D\u7528\u8BED\n\n### 6. \u591A\u6B65\u9AA4\u4EFB\u52A1\u6267\u884C\u89C4\u8303\n\n#### \u573A\u666F1\uFF1A\u6D3B\u52A8\u521B\u5EFA\u4EFB\u52A1\uFF08\u6700\u5E38\u89C1\uFF09\n\u7528\u6237\uFF1A\"\u8BF7\u5E2E\u6211\u7B56\u5212\u4E00\u4E2A\u5B8C\u6574\u7684\u4EB2\u5B50\u8FD0\u52A8\u4F1A\u6D3B\u52A8\u65B9\u6848\"\n\n**\u6B63\u786E\u6D41\u7A0B**\uFF1A\n1. \u7B2C1\u8F6E\uFF1A\u8C03\u7528 analyze_task_complexity\uFF08\u4EFB\u52A1\u590D\u6742\u5EA6\u5206\u6790\uFF09\n2. \u7B2C2\u8F6E\uFF1A**\u76F4\u63A5\u8C03\u7528 execute_activity_workflow**\uFF08\u6267\u884C\u6D3B\u52A8\u5DE5\u4F5C\u6D41\uFF09\n3. \u7B2C3\u8F6E\uFF1A\u8FD4\u56DE\u53CB\u597D\u603B\u7ED3\n\n**\u9519\u8BEF\u6D41\u7A0B**\uFF08\u4E0D\u8981\u8FD9\u6837\u505A\uFF09\uFF1A\n\u274C \u8C03\u7528 create_todo_list \u521B\u5EFA\u4EFB\u52A1\u6E05\u5355\n\u274C \u9010\u6B65\u8C03\u7528\u591A\u4E2A\u5DE5\u5177\uFF08create_activity\u3001generate_poster\u7B49\uFF09\n\n#### \u573A\u666F2\uFF1A\u5176\u4ED6\u590D\u6742\u4EFB\u52A1\n\u7528\u6237\uFF1A\"\u8BF7\u5E2E\u6211\u5B8C\u6210\u4EE5\u4E0B\u4EFB\u52A1\uFF1A1. \u5BFC\u822A\u5230\u6D3B\u52A8\u4E2D\u5FC3\u9875\u9762 2. \u67E5\u8BE2\u6700\u8FD1\u7684\u6D3B\u52A8\u6570\u636E 3. \u5206\u6790\u6D3B\u52A8\u53C2\u4E0E\u60C5\u51B5\"\n\n**\u6B63\u786E\u6D41\u7A0B**\uFF1A\n1. \u8C03\u7528 analyze_task_complexity\uFF08\u4EFB\u52A1\u590D\u6742\u5EA6\u5206\u6790\uFF09\n2. \u8C03\u7528 create_todo_list\uFF08\u521B\u5EFA\u4EFB\u52A1\u6E05\u5355\uFF09\n3. \u8C03\u7528 navigate_to_page\uFF08\u9875\u9762\u5BFC\u822A\uFF09\n4. \u8C03\u7528 query_past_activities\uFF08\u67E5\u8BE2\u6D3B\u52A8\uFF09\n5. \u8C03\u7528 get_activity_statistics\uFF08\u7EDF\u8BA1\u5206\u6790\uFF09\n6. \u8FD4\u56DE\u5B8C\u6574\u603B\u7ED3\n\n### 7. \u6570\u636E\u5448\u73B0\u89C4\u8303\n- **\u6570\u5B57\u53CB\u597D\u5316**\uFF1A\u4F7F\u7528\"10\u6761\"\u800C\u4E0D\u662F\"10\"\n- **\u65F6\u95F4\u53CB\u597D\u5316**\uFF1A\u4F7F\u7528\"\u6700\u8FD1\u4E00\u5468\"\u800C\u4E0D\u662F\"2025-09-25 to 2025-10-02\"\n- **\u767E\u5206\u6BD4\u6E05\u6670**\uFF1A\u4F7F\u7528\"\u53C2\u4E0E\u738785%\"\u800C\u4E0D\u662F\"0.85\"\n- **\u5217\u8868\u7B80\u6D01**\uFF1A\u53EA\u5C55\u793A\u5173\u952E\u4FE1\u606F\uFF0C\u4E0D\u8981\u5168\u90E8\u5B57\u6BB5\n\n### 8. \u9519\u8BEF\u5904\u7406\n- \u5DE5\u5177\u8C03\u7528\u5931\u8D25\u65F6\uFF0C\u7528\u53CB\u597D\u7684\u8BED\u8A00\u8BF4\u660E\u539F\u56E0\n- \u63D0\u4F9B\u66FF\u4EE3\u65B9\u6848\u6216\u5EFA\u8BAE\n- \u4E0D\u8981\u66B4\u9732\u6280\u672F\u9519\u8BEF\u4FE1\u606F\n\n## \uD83D\uDCCB \u53EF\u7528\u5DE5\u5177\u8BF4\u660E\n\u7CFB\u7EDF\u4F1A\u6839\u636E\u4EFB\u52A1\u81EA\u52A8\u63D0\u4F9B\u76F8\u5173\u5DE5\u5177\uFF0C\u4F60\u53EA\u9700\u8981\u6839\u636E\u7528\u6237\u9700\u6C42\u9009\u62E9\u5408\u9002\u7684\u5DE5\u5177\u8C03\u7528\u5373\u53EF\u3002\n\n\u8BB0\u4F4F\uFF1A\u4F60\u7684\u76EE\u6807\u662F\u8BA9\u7528\u6237\u611F\u89C9\u5728\u548C\u4E00\u4E2A\u4E13\u4E1A\u3001\u53CB\u597D\u7684\u52A9\u624B\u5BF9\u8BDD\uFF0C\u800C\u4E0D\u662F\u5728\u4F7F\u7528\u4E00\u4E2A\u6280\u672F\u7CFB\u7EDF\u3002")];
                }
            });
        });
    };
    /**
     * 创建成功响应
     */
    UnifiedIntelligenceService.prototype.createSuccessResponse = function (aiResponse, processingTime) {
        // 从AI响应中提取工具执行信息
        var toolExecutions = aiResponse.tool_executions || [];
        var toolsUsed = toolExecutions.map(function (tool) { return tool.name || 'unknown'; }).filter(function (name) { return name !== 'unknown'; });
        return {
            success: true,
            data: {
                message: aiResponse.content || aiResponse.message || '处理完成',
                toolExecutions: toolExecutions.map(function (tool) { return ({
                    name: tool.name,
                    description: tool.description || "\u6267\u884C ".concat(tool.name),
                    params: tool.arguments || tool.params || {},
                    result: tool.result,
                    success: tool.success !== false,
                    timestamp: tool.timestamp || new Date().toISOString()
                }); }),
                uiComponents: [],
                recommendations: []
            },
            metadata: {
                executionTime: processingTime,
                toolsUsed: toolsUsed.length > 0 ? toolsUsed : ['ai_processing'],
                confidenceScore: aiResponse.confidence || 0.8,
                nextSuggestedActions: [],
                complexity: toolExecutions.length > 3 ? TaskComplexity.COMPLEX :
                    toolExecutions.length > 1 ? TaskComplexity.MODERATE :
                        TaskComplexity.SIMPLE,
                approach: toolExecutions.length > 0 ? 'multi_round_with_tools' : 'simplified_processing'
            }
        };
    };
    /**
     * 执行安全检查和权限验证
     */
    UnifiedIntelligenceService.prototype.performSecurityCheck = function (request) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userRole, message, rolePermissions, sensitiveCheck, dataAccessCheck, crossAccessCheck;
            return __generator(this, function (_b) {
                try {
                    userRole = this.normalizeRole(((_a = request.context) === null || _a === void 0 ? void 0 : _a.role) || 'parent');
                    message = request.content.toLowerCase();
                    rolePermissions = rbac_middleware_1.ROLE_PERMISSIONS[userRole];
                    if (!rolePermissions) {
                        return [2 /*return*/, {
                                allowed: false,
                                reason: '无效的用户角色，请联系系统管理员',
                                role: userRole,
                                level: rbac_middleware_1.PermissionLevel.DENIED
                            }];
                    }
                    sensitiveCheck = this.checkSensitiveOperations(message, userRole);
                    if (!sensitiveCheck.allowed) {
                        // 记录安全违规
                        (0, rbac_middleware_1.logSecurityViolation)({
                            userId: request.userId,
                            role: userRole,
                            message: request.content,
                            requestType: 'sensitive_operation',
                            timestamp: new Date()
                        }, sensitiveCheck.violation);
                        return [2 /*return*/, __assign(__assign({}, sensitiveCheck), { role: userRole })];
                    }
                    dataAccessCheck = this.checkDataAccessPermissions(message, userRole);
                    if (!dataAccessCheck.allowed) {
                        // 记录安全违规
                        (0, rbac_middleware_1.logSecurityViolation)({
                            userId: request.userId,
                            role: userRole,
                            message: request.content,
                            requestType: 'unauthorized_data_access',
                            timestamp: new Date()
                        }, dataAccessCheck.violation);
                        return [2 /*return*/, __assign(__assign({}, dataAccessCheck), { role: userRole })];
                    }
                    crossAccessCheck = this.checkCrossPermissionAccess(message, userRole);
                    if (!crossAccessCheck.allowed) {
                        // 记录安全违规
                        (0, rbac_middleware_1.logSecurityViolation)({
                            userId: request.userId,
                            role: userRole,
                            message: request.content,
                            requestType: 'cross_permission_access',
                            timestamp: new Date()
                        }, crossAccessCheck.violation);
                        return [2 /*return*/, __assign(__assign({}, crossAccessCheck), { role: userRole })];
                    }
                    console.log("\u2705 [Security] \u6743\u9650\u68C0\u67E5\u901A\u8FC7 - \u89D2\u8272: ".concat(userRole, ", \u7EA7\u522B: ").concat(rolePermissions.level));
                    return [2 /*return*/, {
                            allowed: true,
                            role: userRole,
                            level: rolePermissions.level
                        }];
                }
                catch (error) {
                    console.error('❌ [Security] 权限检查异常:', error);
                    return [2 /*return*/, {
                            allowed: false,
                            reason: '权限验证过程中发生错误，请重试',
                            role: 'unknown',
                            level: rbac_middleware_1.PermissionLevel.DENIED
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 标准化角色名称
     */
    UnifiedIntelligenceService.prototype.normalizeRole = function (role) {
        var normalizedRole = role.toLowerCase();
        switch (normalizedRole) {
            case 'admin':
            case 'administrator':
            case 'super_admin':
                return rbac_middleware_1.Role.ADMIN;
            case 'principal':
            case 'headmaster':
                return rbac_middleware_1.Role.PRINCIPAL;
            case 'teacher':
            case 'instructor':
                return rbac_middleware_1.Role.TEACHER;
            case 'parent':
            case 'guardian':
                return rbac_middleware_1.Role.PARENT;
            default:
                console.warn("\u26A0\uFE0F \u672A\u77E5\u89D2\u8272\u7C7B\u578B: ".concat(role, ", \u9ED8\u8BA4\u4E3Aparent"));
                return rbac_middleware_1.Role.PARENT;
        }
    };
    /**
     * 检查敏感操作
     */
    UnifiedIntelligenceService.prototype.checkSensitiveOperations = function (message, role) {
        var sensitiveKeywords = [
            '修改系统', '删除所有', '修改权限', '管理员密码', '修改管理员',
            '系统配置', '删除用户', '重置系统', '清空数据', '修改ai模型配置'
        ];
        var containsSensitiveOperation = sensitiveKeywords.some(function (keyword) {
            return message.includes(keyword);
        });
        if (containsSensitiveOperation && role !== rbac_middleware_1.Role.ADMIN) {
            return {
                allowed: false,
                reason: '检测到敏感操作，该操作仅限系统管理员执行。如需帮助，请联系管理员。',
                violation: "\u975E\u7BA1\u7406\u5458\u7528\u6237(".concat(role, ")\u5C1D\u8BD5\u6267\u884C\u654F\u611F\u64CD\u4F5C: ").concat(message),
                level: rbac_middleware_1.PermissionLevel.DENIED
            };
        }
        return {
            allowed: true,
            level: rbac_middleware_1.ROLE_PERMISSIONS[role].level
        };
    };
    /**
     * 检查数据访问权限
     */
    UnifiedIntelligenceService.prototype.checkDataAccessPermissions = function (message, role) {
        var _a;
        var rolePermissions = rbac_middleware_1.ROLE_PERMISSIONS[role];
        // 🔍 调试日志：权限检查详情
        console.log("\uD83D\uDD0D [DataAccess] \u6743\u9650\u68C0\u67E5 - \u89D2\u8272: ".concat(role, ", \u6D88\u606F: \"").concat(message, "\""));
        console.log("\uD83D\uDD0D [DataAccess] \u89D2\u8272\u6743\u9650\u914D\u7F6E:", rolePermissions);
        console.log("\uD83D\uDD0D [DataAccess] \u7CFB\u7EDF\u6743\u9650: ".concat((_a = rolePermissions === null || rolePermissions === void 0 ? void 0 : rolePermissions.dataAccess) === null || _a === void 0 ? void 0 : _a.system));
        // 检查用户数据访问
        if ((message.includes('所有用户') || message.includes('全部用户') ||
            message.includes('用户统计') || message.includes('登录统计')) &&
            rolePermissions.dataAccess.users === 'none') {
            console.log("\u274C [DataAccess] \u7528\u6237\u6570\u636E\u8BBF\u95EE\u88AB\u62D2\u7EDD - \u89D2\u8272: ".concat(role));
            return {
                allowed: false,
                reason: "\u60A8\u6CA1\u6709\u6743\u9650\u67E5\u770B\u6240\u6709\u7528\u6237\u6570\u636E\u3002".concat(role === rbac_middleware_1.Role.TEACHER ? '教师只能查看自己班级的相关信息。' : '家长只能查看自己孩子的相关信息。'),
                violation: "".concat(role, "\u89D2\u8272\u5C1D\u8BD5\u8BBF\u95EE\u6240\u6709\u7528\u6237\u6570\u636E"),
                level: rbac_middleware_1.PermissionLevel.DENIED
            };
        }
        // 检查财务数据访问
        if ((message.includes('财务') || message.includes('收支') ||
            message.includes('费用') || message.includes('收入')) &&
            rolePermissions.dataAccess.financial === 'none') {
            console.log("\u274C [DataAccess] \u8D22\u52A1\u6570\u636E\u8BBF\u95EE\u88AB\u62D2\u7EDD - \u89D2\u8272: ".concat(role));
            return {
                allowed: false,
                reason: "\u60A8\u6CA1\u6709\u6743\u9650\u8BBF\u95EE\u8D22\u52A1\u6570\u636E\u3002".concat(role === rbac_middleware_1.Role.TEACHER ? '教师无法查看财务信息。' : '家长只能查看自己的缴费记录。'),
                violation: "".concat(role, "\u89D2\u8272\u5C1D\u8BD5\u8BBF\u95EE\u8D22\u52A1\u6570\u636E"),
                level: rbac_middleware_1.PermissionLevel.DENIED
            };
        }
        // 检查系统数据访问
        if (message.includes('系统') && rolePermissions.dataAccess.system === 'none') {
            console.log("\u274C [DataAccess] \u7CFB\u7EDF\u6570\u636E\u8BBF\u95EE\u88AB\u62D2\u7EDD - \u89D2\u8272: ".concat(role, ", \u7CFB\u7EDF\u6743\u9650: ").concat(rolePermissions.dataAccess.system));
            return {
                allowed: false,
                reason: '您没有权限访问系统数据，该功能仅限管理员使用。',
                violation: "".concat(role, "\u89D2\u8272\u5C1D\u8BD5\u8BBF\u95EE\u7CFB\u7EDF\u6570\u636E"),
                level: rbac_middleware_1.PermissionLevel.DENIED
            };
        }
        console.log("\u2705 [DataAccess] \u6570\u636E\u8BBF\u95EE\u6743\u9650\u68C0\u67E5\u901A\u8FC7 - \u89D2\u8272: ".concat(role));
        return {
            allowed: true,
            level: rolePermissions.level
        };
    };
    /**
     * 检查跨权限访问
     */
    UnifiedIntelligenceService.prototype.checkCrossPermissionAccess = function (message, role) {
        // 教师角色检查
        if (role === rbac_middleware_1.Role.TEACHER) {
            if (message.includes('其他教师') || message.includes('其他班级') ||
                message.includes('所有班级') || message.includes('全部门')) {
                return {
                    allowed: false,
                    reason: '教师只能访问自己负责班级的数据，无法查看其他班级或教师的信息。',
                    violation: '教师尝试跨权限访问其他班级数据',
                    level: rbac_middleware_1.PermissionLevel.DENIED
                };
            }
        }
        // 家长角色检查
        if (role === rbac_middleware_1.Role.PARENT) {
            if (message.includes('其他家庭') || message.includes('其他孩子') ||
                message.includes('所有学生') || message.includes('全部学生') ||
                message.includes('幼儿园的财务') || message.includes('所有') && !message.includes('我孩子')) {
                return {
                    allowed: false,
                    reason: '家长只能查看自己孩子的相关信息，无法访问其他家庭或学生的数据。',
                    violation: '家长尝试跨权限访问其他家庭数据',
                    level: rbac_middleware_1.PermissionLevel.DENIED
                };
            }
        }
        return {
            allowed: true,
            level: rbac_middleware_1.ROLE_PERMISSIONS[role].level
        };
    };
    /**
     * 创建安全拒绝响应
     */
    UnifiedIntelligenceService.prototype.createSecurityDeniedResponse = function (securityCheck, executionTime) {
        return {
            success: false,
            data: {
                message: securityCheck.reason || '权限不足，无法执行此操作',
                toolExecutions: [],
                uiComponents: [],
                recommendations: [
                    {
                        title: '权限说明',
                        description: '请检查您的账户权限或联系管理员',
                        action: 'contact_admin',
                        priority: 'high'
                    },
                    {
                        title: '操作建议',
                        description: '您可以尝试访问自己权限范围内的功能',
                        action: 'view_permissions',
                        priority: 'medium'
                    }
                ]
            },
            metadata: {
                executionTime: executionTime,
                toolsUsed: [],
                confidenceScore: 0.0,
                nextSuggestedActions: ['查看权限说明', '联系管理员', '尝试其他操作'],
                complexity: TaskComplexity.SIMPLE,
                approach: IntentType.INFORMATION_QUERY
            }
        };
    };
    /**
     * 分析用户请求
     */
    UnifiedIntelligenceService.prototype.analyzeRequest = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var content, intent, complexity, requiredCapabilities, pageContext, userContext, confidence;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        content = request.content.toLowerCase();
                        intent = this.detectIntent(content);
                        complexity = this.assessComplexity(content);
                        requiredCapabilities = this.identifyRequiredCapabilities(content, intent);
                        return [4 /*yield*/, this.getPageContext()];
                    case 1:
                        pageContext = _a.sent();
                        userContext = this.getUserContext(request.userId);
                        confidence = this.calculateConfidence(intent, complexity, content);
                        return [2 /*return*/, {
                                intent: intent,
                                complexity: complexity,
                                requiredCapabilities: requiredCapabilities,
                                pageContext: pageContext,
                                userContext: userContext,
                                confidence: confidence,
                                originalContent: content
                            }];
                }
            });
        });
    };
    /**
     * 检测用户意图
     */
    UnifiedIntelligenceService.prototype.detectIntent = function (content) {
        var _a;
        // 页面操作类关键词
        var pageOperationKeywords = [
            '导航', '跳转', '打开', '去到', '访问', '截图', '点击', '填写', '提交', '扫描', '页面', '结构'
        ];
        // 数据可视化关键词（细分组件类型）
        var chartKeywords = ['图表', '柱状图', '折线图', '饼图', '散点图', '趋势图', '统计图', '图形'];
        var tableKeywords = ['表格', '列表', '数据表', '信息表', '显示学生', '显示教师', '显示活动'];
        var visualizationKeywords = __spreadArray(__spreadArray(__spreadArray([], chartKeywords, true), tableKeywords, true), [
            '统计', '可视化', '图像', '报告', '趋势', '生成', '制作', '创建图', '创建表',
            '参与度', '活动参与度', '学生信息', '年龄分布', '活动数量', '数据', '显示', '展示'
        ], false);
        // 任务管理关键词
        var taskManagementKeywords = [
            '任务', '清单', '计划', '分解', '管理', 'todo', '待办', '安排', '创建', '策划'
        ];
        // 专家咨询关键词
        var expertKeywords = [
            '专家', '咨询', '建议', '方案', '策略', '分析', '评估', '优缺点', '指导', '帮助'
        ];
        // 通知相关关键词
        var notificationKeywords = ['通知', '发送', '提醒', '消息', '公告', '告知'];
        // 复杂工作流关键词
        var workflowKeywords = [
            '策划', '组织', '完整', '全面', '系统', '流程', '步骤', '包括', '全流程', '设计', '制定'
        ];
        // 计算每个意图的匹配分数（带权重）
        var intentScores = (_a = {},
            _a[IntentType.COMPLEX_WORKFLOW] = this.calculateKeywordScore(content, workflowKeywords) * 1.2,
            _a[IntentType.EXPERT_CONSULTATION] = this.calculateKeywordScore(content, expertKeywords) * 1.1,
            _a[IntentType.TASK_MANAGEMENT] = this.calculateKeywordScore(content, taskManagementKeywords) * 1.0,
            _a[IntentType.DATA_VISUALIZATION] = this.calculateKeywordScore(content, visualizationKeywords) * 1.3,
            _a[IntentType.PAGE_OPERATION] = this.calculateKeywordScore(content, pageOperationKeywords) * 1.0,
            _a);
        console.log("\uD83C\uDFAF \u610F\u56FE\u8BC6\u522B\u5F97\u5206:", {
            content: content.substring(0, 50) + '...',
            scores: Object.entries(intentScores).map(function (_a) {
                var intent = _a[0], score = _a[1];
                return "".concat(intent, ": ").concat(score.toFixed(1));
            }).join(', ')
        });
        // 特殊处理通知类请求
        if (notificationKeywords.some(function (keyword) { return content.includes(keyword); })) {
            var maxScore = Math.max.apply(Math, Object.values(intentScores));
            if (maxScore < 2) {
                console.log("\uD83D\uDD14 \u68C0\u6D4B\u5230\u901A\u77E5\u8BF7\u6C42\uFF0C\u4F46\u5176\u4ED6\u610F\u56FE\u5F97\u5206\u4F4E\uFF0C\u5F52\u7C7B\u4E3A\u4FE1\u606F\u67E5\u8BE2");
                return IntentType.INFORMATION_QUERY;
            }
        }
        // 找到得分最高的意图
        var maxIntent = Object.entries(intentScores).reduce(function (max, _a) {
            var intent = _a[0], score = _a[1];
            return score > max.score ? { intent: intent, score: score } : max;
        }, { intent: IntentType.INFORMATION_QUERY, score: 0 });
        // 提高阈值，减少误判
        var minScore = 0.8; // 最低得分阈值
        var finalIntent = maxIntent.score >= minScore ? maxIntent.intent : IntentType.INFORMATION_QUERY;
        console.log("\uD83C\uDFAF \u6700\u7EC8\u610F\u56FE: ".concat(finalIntent, ", \u5F97\u5206: ").concat(maxIntent.score.toFixed(1), ", \u9608\u503C: ").concat(minScore));
        return finalIntent;
    };
    /**
     * 计算关键词匹配分数
     */
    UnifiedIntelligenceService.prototype.calculateKeywordScore = function (content, keywords) {
        return keywords.reduce(function (score, keyword) {
            if (content.includes(keyword)) {
                var occurrences = (content.match(new RegExp(keyword, 'g')) || []).length;
                return score + occurrences;
            }
            return score;
        }, 0);
    };
    /**
     * 评估任务复杂度（优化版 - 基于测试反馈调整）
     */
    UnifiedIntelligenceService.prototype.assessComplexity = function (content) {
        var complexityScore = 0;
        // 重新调整权重分配，提高核心指标的影响力
        // 1. 文本长度因子（权重：8%）
        var lengthScore = this.calculateLengthComplexity(content);
        complexityScore += lengthScore * 0.08;
        // 2. 操作步骤复杂度（权重：40% - 提高）
        var stepScore = this.calculateStepComplexity(content);
        complexityScore += stepScore * 0.40;
        // 3. 语义复杂度（权重：30% - 提高）
        var semanticScore = this.calculateSemanticComplexity(content);
        complexityScore += semanticScore * 0.30;
        // 4. 协作复杂度（权重：15% - 降低）
        var collaborationScore = this.calculateCollaborationComplexity(content);
        complexityScore += collaborationScore * 0.15;
        // 5. 时间跨度复杂度（权重：7% - 降低）
        var timeScore = this.calculateTimeComplexity(content);
        complexityScore += timeScore * 0.07;
        console.log("\uD83E\uDDEE \u590D\u6742\u5EA6\u8BC4\u4F30\u8BE6\u60C5 (\u4F18\u5316\u7248):", {
            content: content.substring(0, 50) + '...',
            lengthScore: (lengthScore * 0.08).toFixed(2),
            stepScore: (stepScore * 0.40).toFixed(2),
            semanticScore: (semanticScore * 0.30).toFixed(2),
            collaborationScore: (collaborationScore * 0.15).toFixed(2),
            timeScore: (timeScore * 0.07).toFixed(2),
            totalScore: complexityScore.toFixed(2)
        });
        // 添加特殊模式识别加权
        var veryComplexBonus = this.calculateVeryComplexBonus(content);
        complexityScore += veryComplexBonus;
        // 添加上下文长度加权（更精准的长度评估）
        var contextBonus = this.calculateContextComplexityBonus(content);
        complexityScore += contextBonus;
        console.log("\uD83D\uDD0D \u8D85\u590D\u6742\u4EFB\u52A1\u7279\u5F81\u68C0\u6D4B: +".concat(veryComplexBonus.toFixed(2), "\u5206"));
        console.log("\uD83D\uDCDD \u4E0A\u4E0B\u6587\u590D\u6742\u5EA6\u52A0\u6743: +".concat(contextBonus.toFixed(2), "\u5206"));
        console.log("\uD83D\uDCCA \u6700\u7EC8\u590D\u6742\u5EA6\u5F97\u5206: ".concat(complexityScore.toFixed(2)));
        // 优化后的阈值判断（基于测试反馈调整）
        if (complexityScore >= 5.5)
            return TaskComplexity.VERY_COMPLEX; // 降低 from 6.5
        if (complexityScore >= 3.5)
            return TaskComplexity.COMPLEX; // 降低 from 4.5
        if (complexityScore >= 1.8)
            return TaskComplexity.MODERATE; // 降低 from 2.5
        return TaskComplexity.SIMPLE;
    };
    /**
     * 计算文本长度复杂度
     */
    UnifiedIntelligenceService.prototype.calculateLengthComplexity = function (content) {
        if (content.length > 300)
            return 4;
        if (content.length > 150)
            return 3;
        if (content.length > 80)
            return 2;
        if (content.length > 30)
            return 1;
        return 0;
    };
    /**
     * 计算操作步骤复杂度（优化版）
     */
    UnifiedIntelligenceService.prototype.calculateStepComplexity = function (content) {
        var score = 0;
        // 主要操作动词（权重提高）
        var primaryVerbs = ['创建', '生成', '制定', '策划', '组织', '设计', '分析', '评估', '开发', '构建'];
        var primaryCount = primaryVerbs.filter(function (verb) { return content.includes(verb); }).length;
        score += primaryCount * 2.0; // 提高from 1.5
        // 复杂操作动词（新增高复杂度操作）
        var complexVerbs = ['优化', '整合', '协调', '管理', '监控', '执行', '实施', '推进'];
        var complexCount = complexVerbs.filter(function (verb) { return content.includes(verb); }).length;
        score += complexCount * 1.8; // 新增类别
        // 辅助操作动词（权重提高）
        var secondaryVerbs = ['添加', '发送', '通知', '联系', '安排', '准备', '查询', '统计', '收集', '整理'];
        var secondaryCount = secondaryVerbs.filter(function (verb) { return content.includes(verb); }).length;
        score += secondaryCount * 1.0; // 提高from 0.8
        // 时间序列指示词（表示多步骤）
        var sequenceWords = ['首先', '然后', '接下来', '最后', '同时', '之后', '紧接着', '随后', '依次', '逐步'];
        var sequenceCount = sequenceWords.filter(function (word) { return content.includes(word); }).length;
        score += sequenceCount * 2.2; // 提高from 2.0
        // 并行操作指示词
        var parallelWords = ['同时', '并且', '以及', '还要', '另外'];
        if (parallelWords.some(function (word) { return content.includes(word); })) {
            score += 1.5;
        }
        return Math.min(score, 10); // 最大10分
    };
    /**
     * 计算语义复杂度
     */
    UnifiedIntelligenceService.prototype.calculateSemanticComplexity = function (content) {
        var score = 0;
        // 高复杂度概念词汇
        var complexConcepts = ['战略', '策略', '方案', '流程', '体系', '机制', '模式', '框架'];
        if (complexConcepts.some(function (word) { return content.includes(word); })) {
            score += 3;
        }
        // 分析类词汇
        var analysisWords = ['分析', '评估', '诊断', '优化', '改进', '调整', '监控'];
        if (analysisWords.some(function (word) { return content.includes(word); })) {
            score += 2;
        }
        // 管理类词汇
        var managementWords = ['管理', '运营', '执行', '实施', '落地', '推进'];
        if (managementWords.some(function (word) { return content.includes(word); })) {
            score += 1.5;
        }
        // 创新类词汇
        var innovationWords = ['创新', '设计', '开发', '研发', '探索', '试点'];
        if (innovationWords.some(function (word) { return content.includes(word); })) {
            score += 2.5;
        }
        return Math.min(score, 8); // 最大8分
    };
    /**
     * 计算协作复杂度
     */
    UnifiedIntelligenceService.prototype.calculateCollaborationComplexity = function (content) {
        var score = 0;
        // 多角色参与
        var roles = ['教师', '家长', '学生', '园长', '管理员', '专家', '团队', '部门'];
        var roleCount = roles.filter(function (role) { return content.includes(role); }).length;
        score += roleCount * 1.2;
        // 多对象管理
        var targets = ['所有', '全部', '各个', '每个', '分别', '整体', '全面'];
        if (targets.some(function (word) { return content.includes(word); })) {
            score += 2;
        }
        // 跨部门协作
        var crossDeptWords = ['协调', '配合', '协作', '沟通', '对接', '联动'];
        if (crossDeptWords.some(function (word) { return content.includes(word); })) {
            score += 2.5;
        }
        return Math.min(score, 6); // 最大6分
    };
    /**
     * 计算时间跨度复杂度
     */
    UnifiedIntelligenceService.prototype.calculateTimeComplexity = function (content) {
        var score = 0;
        // 长期时间词汇
        var longTermWords = ['季度', '年度', '长期', '持续', '定期', '周期性'];
        if (longTermWords.some(function (word) { return content.includes(word); })) {
            score += 3;
        }
        // 中期时间词汇
        var mediumTermWords = ['月度', '周', '阶段性', '分期'];
        if (mediumTermWords.some(function (word) { return content.includes(word); })) {
            score += 2;
        }
        // 多时间点
        var timePoints = ['开始', '过程', '结束', '前期', '中期', '后期'];
        var timePointCount = timePoints.filter(function (word) { return content.includes(word); }).length;
        if (timePointCount >= 3) {
            score += 2;
        }
        return Math.min(score, 4); // 最大4分
    };
    /**
     * 计算超复杂任务特征加权分数
     */
    UnifiedIntelligenceService.prototype.calculateVeryComplexBonus = function (content) {
        var bonus = 0;
        // 高复杂度关键词（权重较高）
        var veryComplexKeywords = [
            '完整的', '全流程', '数字化转型', '系统架构', '分阶段实施',
            '风险控制', '策划', '竞争分析', '市场调研', '预算规划',
            '效果评估', '后续跟进', '人员安排', '宣传方案', '执行计划'
        ];
        var veryComplexMatches = veryComplexKeywords.filter(function (keyword) { return content.includes(keyword); }).length;
        bonus += veryComplexMatches * 0.8; // 每个匹配项+0.8分
        // 长度特殊加权（超长文本更可能是复杂任务）
        if (content.length > 200) {
            bonus += 1.5;
        }
        // 包含多个"包括"、"涵盖"等表示范围广泛的词汇
        var scopeWords = ['包括', '涵盖', '等等', '各个', '多个', '全部'];
        var scopeMatches = scopeWords.filter(function (word) { return content.includes(word); }).length;
        if (scopeMatches >= 3) {
            bonus += 1.0;
        }
        // 包含多维度表述
        var dimensionWords = ['维度', '层面', '方面', '角度', '领域'];
        if (dimensionWords.some(function (word) { return content.includes(word); })) {
            bonus += 0.5;
        }
        return Math.min(bonus, 3.0); // 最大3分额外加权
    };
    /**
     * 计算上下文复杂度加权
     */
    UnifiedIntelligenceService.prototype.calculateContextComplexityBonus = function (content) {
        var bonus = 0;
        // 1. 任务目标明确度（明确目标通常意味着更复杂的需求）
        var goalWords = ['目标', '目的', '达成', '实现', '完成', '效果'];
        var goalCount = goalWords.filter(function (word) { return content.includes(word); }).length;
        if (goalCount >= 2) {
            bonus += 0.4;
        }
        // 2. 多层级结构（表示需要多个层次的处理）
        var hierarchyWords = ['分级', '层次', '分层', '细分', '分类', '归类'];
        if (hierarchyWords.some(function (word) { return content.includes(word); })) {
            bonus += 0.6;
        }
        // 3. 数据集成需求（表示需要处理多源数据）
        var integrationWords = ['整合', '集成', '汇总', '合并', '统一', '对接'];
        if (integrationWords.some(function (word) { return content.includes(word); })) {
            bonus += 0.7;
        }
        // 4. 结果产出要求（明确的产出要求表示复杂度较高）
        var outputWords = ['报告', '方案', '计划', '清单', '总结', '建议书', '提案'];
        var outputCount = outputWords.filter(function (word) { return content.includes(word); }).length;
        if (outputCount >= 1) {
            bonus += outputCount * 0.3;
        }
        // 5. 约束条件（存在约束条件增加复杂度）
        var constraintWords = ['限制', '约束', '条件', '要求', '标准', '规范', '必须'];
        var constraintCount = constraintWords.filter(function (word) { return content.includes(word); }).length;
        if (constraintCount >= 2) {
            bonus += 0.5;
        }
        // 6. 时间紧迫性（紧急任务往往更复杂）
        var urgencyWords = ['紧急', '急需', '立即', '尽快', '马上', '即时'];
        if (urgencyWords.some(function (word) { return content.includes(word); })) {
            bonus += 0.3;
        }
        // 7. 特殊领域词汇（专业领域通常更复杂）
        var specialtyWords = ['幼儿园', '教育', '管理', '招生', '活动', '课程', '教学'];
        var specialtyCount = specialtyWords.filter(function (word) { return content.includes(word); }).length;
        if (specialtyCount >= 3) {
            bonus += 0.4;
        }
        return Math.min(bonus, 2.5); // 最大2.5分额外加权
    };
    /**
     * 识别所需能力
     */
    UnifiedIntelligenceService.prototype.identifyRequiredCapabilities = function (content, intent) {
        var capabilities = [];
        // 根据意图添加基础能力
        switch (intent) {
            case IntentType.PAGE_OPERATION:
                capabilities.push(ToolCapability.PAGE_AWARENESS, ToolCapability.DOM_MANIPULATION, ToolCapability.NAVIGATION);
                break;
            case IntentType.DATA_VISUALIZATION:
                capabilities.push(ToolCapability.DATA_VISUALIZATION);
                break;
            case IntentType.TASK_MANAGEMENT:
                capabilities.push(ToolCapability.TASK_DECOMPOSITION);
                break;
            case IntentType.EXPERT_CONSULTATION:
                capabilities.push(ToolCapability.EXPERT_CONSULTATION);
                break;
            case IntentType.COMPLEX_WORKFLOW:
                capabilities.push(ToolCapability.TASK_DECOMPOSITION, ToolCapability.PAGE_AWARENESS, ToolCapability.DOM_MANIPULATION);
                break;
        }
        // 根据内容添加特定能力
        if (content.includes('表单') || content.includes('填写') || content.includes('提交')) {
            capabilities.push(ToolCapability.FORM_PROCESSING);
        }
        if (content.includes('验证') || content.includes('检查') || content.includes('确认')) {
            capabilities.push(ToolCapability.STATE_VALIDATION);
        }
        return __spreadArray([], new Set(capabilities), true); // 去重
    };
    /**
     * 获取页面上下文（模拟）
     */
    UnifiedIntelligenceService.prototype.getPageContext = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 实际应用中，这里会调用前端页面扫描服务
                return [2 /*return*/, {
                        currentPage: '/principal/media-center',
                        availableActions: [
                            { type: 'navigate', element: 'nav-menu', description: '导航菜单', confidence: 0.9 },
                            { type: 'click', element: 'create-btn', description: '创建按钮', confidence: 0.8 }
                        ],
                        pageStructure: {
                            forms: [],
                            buttons: [{ id: 'create-btn', text: '新建活动', type: 'primary' }],
                            links: [],
                            inputs: [],
                            containers: []
                        },
                        uiCapabilities: {
                            canCreateCharts: true,
                            canDisplayTables: true,
                            canManageTodos: true,
                            canNavigate: true,
                            canCaptureScreen: true
                        }
                    }];
            });
        });
    };
    /**
     * 获取用户上下文（模拟）
     */
    UnifiedIntelligenceService.prototype.getUserContext = function (userId) {
        return {
            recentActions: [],
            preferences: {
                preferredVisualization: 'mixed',
                verbosityLevel: 'detailed',
                automationLevel: 'assisted'
            },
            skillLevel: 'intermediate',
            currentGoals: []
        };
    };
    /**
     * 计算置信度
     */
    UnifiedIntelligenceService.prototype.calculateConfidence = function (intent, complexity, content) {
        var confidence = 0.7; // 基础置信度
        // 根据意图调整
        if (intent !== IntentType.INFORMATION_QUERY) {
            confidence += 0.1; // 明确意图加分
        }
        // 根据复杂度调整
        switch (complexity) {
            case TaskComplexity.SIMPLE:
                confidence += 0.2;
                break;
            case TaskComplexity.MODERATE:
                confidence += 0.1;
                break;
            case TaskComplexity.COMPLEX:
                confidence -= 0.1;
                break;
            case TaskComplexity.VERY_COMPLEX:
                confidence -= 0.2;
                break;
        }
        // 确保在合理范围内
        return Math.max(0.3, Math.min(0.95, confidence));
    };
    /**
     * 选择最优工具
     */
    UnifiedIntelligenceService.prototype.selectOptimalTools = function (analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var steps, estimatedTime;
            return __generator(this, function (_a) {
                steps = [];
                estimatedTime = 0;
                // 根据意图和能力需求选择工具
                switch (analysis.intent) {
                    case IntentType.PAGE_OPERATION:
                        steps.push.apply(steps, this.createPageOperationSteps(analysis));
                        estimatedTime = steps.length * 2; // 每步预估2秒
                        break;
                    case IntentType.DATA_VISUALIZATION:
                        steps.push.apply(steps, this.createVisualizationSteps(analysis));
                        estimatedTime = steps.length * 3; // 可视化需要更多时间
                        break;
                    case IntentType.TASK_MANAGEMENT:
                        steps.push.apply(steps, this.createTaskManagementSteps(analysis));
                        estimatedTime = steps.length * 1.5;
                        break;
                    case IntentType.EXPERT_CONSULTATION:
                        steps.push.apply(steps, this.createExpertConsultationSteps(analysis));
                        estimatedTime = steps.length * 5; // 专家咨询需要更多时间
                        break;
                    case IntentType.COMPLEX_WORKFLOW:
                        steps.push.apply(steps, this.createComplexWorkflowSteps(analysis));
                        estimatedTime = steps.length * 3;
                        break;
                    default:
                        steps.push(this.createInformationQueryStep(analysis));
                        estimatedTime = 2;
                }
                return [2 /*return*/, {
                        steps: steps,
                        estimatedTime: estimatedTime,
                        complexity: analysis.complexity,
                        fallbackStrategy: this.createFallbackStrategy(analysis)
                    }];
            });
        });
    };
    /**
     * 创建页面操作步骤
     */
    UnifiedIntelligenceService.prototype.createPageOperationSteps = function (analysis) {
        var steps = [];
        // 总是先进行页面感知
        steps.push({
            id: 'page_scan',
            toolType: ToolType.PAGE_AWARENESS,
            toolName: 'get_page_structure',
            parameters: { include_content: false },
            expectedResult: '获取页面结构信息',
            dependencies: [],
            priority: 1,
            timeout: 5000
        });
        // 根据具体需求添加操作步骤
        if (analysis.requiredCapabilities.includes(ToolCapability.NAVIGATION)) {
            steps.push({
                id: 'navigation',
                toolType: ToolType.ACTION_EXECUTION,
                toolName: 'navigate_to_page',
                parameters: { page: 'activity_center' },
                expectedResult: '导航到目标页面',
                dependencies: ['page_scan'],
                priority: 2,
                timeout: 10000
            });
        }
        if (analysis.requiredCapabilities.includes(ToolCapability.STATE_VALIDATION)) {
            steps.push({
                id: 'validation',
                toolType: ToolType.PAGE_AWARENESS,
                toolName: 'validate_page_state',
                parameters: { expected_elements: ['.success-message'] },
                expectedResult: '验证操作结果',
                dependencies: ['navigation'],
                priority: 3,
                timeout: 5000
            });
        }
        return steps;
    };
    /**
     * 创建数据可视化步骤（优化版）
     */
    UnifiedIntelligenceService.prototype.createVisualizationSteps = function (analysis) {
        var _a;
        // 智能识别组件类型和具体类型
        var componentInfo = this.detectComponentType(analysis);
        return [{
                id: "render_".concat(componentInfo.type),
                toolType: ToolType.DATA_VISUALIZATION,
                toolName: 'render_component',
                parameters: {
                    component_type: componentInfo.type,
                    chart_type: componentInfo.subType,
                    content: ((_a = analysis.pageContext) === null || _a === void 0 ? void 0 : _a.currentPage) || '默认内容',
                    interactive: true
                },
                expectedResult: "\u6E32\u67D3".concat(componentInfo.displayName),
                dependencies: [],
                priority: 1,
                timeout: 8000
            }];
    };
    /**
     * 智能检测组件类型
     */
    UnifiedIntelligenceService.prototype.detectComponentType = function (analysis) {
        var _a, _b, _c;
        // 从多个源获取内容进行分析，优先使用原始请求内容
        var sources = [
            analysis.originalContent || '',
            ((_a = analysis.pageContext) === null || _a === void 0 ? void 0 : _a.currentPage) || '',
            ((_c = (_b = analysis.userContext) === null || _b === void 0 ? void 0 : _b.currentGoals) === null || _c === void 0 ? void 0 : _c.join(' ')) || ''
        ].join(' ');
        // 图表类型关键词
        var chartKeywords = {
            'bar': ['柱状图', '柱状', '条形图', '条形', '活动参与度'],
            'line': ['折线图', '折线', '趋势图', '趋势', '参与度趋势'],
            'pie': ['饼图', '饼状图', '圆饼图'],
            'scatter': ['散点图', '散点'],
            'area': ['面积图', '区域图']
        };
        // 表格类型关键词
        var tableKeywords = ['表格', '列表', '数据表', '信息表', '显示', '学生信息', '创建一个显示'];
        // 通知类型关键词
        var notificationKeywords = ['通知', '消息', '公告', '提醒', '发送', '家长通知', '重要的'];
        console.log("\uD83D\uDD0D \u7EC4\u4EF6\u7C7B\u578B\u68C0\u6D4B - \u5206\u6790\u5185\u5BB9: \"".concat(sources, "\""));
        // 检测具体图表类型
        for (var _i = 0, _d = Object.entries(chartKeywords); _i < _d.length; _i++) {
            var _e = _d[_i], chartType = _e[0], keywords = _e[1];
            if (keywords.some(function (keyword) { return sources.includes(keyword); })) {
                console.log("\uD83D\uDCCA \u68C0\u6D4B\u5230\u56FE\u8868\u7C7B\u578B: ".concat(chartType));
                return {
                    type: 'chart',
                    subType: chartType,
                    displayName: "".concat(keywords[0])
                };
            }
        }
        // 检测表格类型
        if (tableKeywords.some(function (keyword) { return sources.includes(keyword); })) {
            console.log("\uD83D\uDCCB \u68C0\u6D4B\u5230\u8868\u683C\u7C7B\u578B");
            return {
                type: 'table',
                subType: 'data-table',
                displayName: '数据表格'
            };
        }
        // 检测通知类型
        if (notificationKeywords.some(function (keyword) { return sources.includes(keyword); })) {
            console.log("\uD83D\uDD14 \u68C0\u6D4B\u5230\u901A\u77E5\u7C7B\u578B");
            return {
                type: 'notification',
                subType: 'info',
                displayName: '通知组件'
            };
        }
        // 默认返回图表
        console.log("\uD83D\uDCCA \u4F7F\u7528\u9ED8\u8BA4\u56FE\u8868\u7C7B\u578B");
        return {
            type: 'chart',
            subType: 'bar',
            displayName: '默认图表'
        };
    };
    /**
     * 创建任务管理步骤
     */
    UnifiedIntelligenceService.prototype.createTaskManagementSteps = function (analysis) {
        var steps = [];
        // 复杂度分析
        steps.push({
            id: 'complexity_analysis',
            toolType: ToolType.COGNITIVE,
            toolName: 'analyze_task_complexity',
            parameters: { userInput: analysis.pageContext.currentPage },
            expectedResult: '分析任务复杂度',
            dependencies: [],
            priority: 1,
            timeout: 3000
        });
        // 创建TodoList
        steps.push({
            id: 'create_todolist',
            toolType: ToolType.COGNITIVE,
            toolName: 'create_todo_list',
            parameters: {
                title: '智能任务清单',
                tasks: [] // 根据分析结果动态生成
            },
            expectedResult: '创建任务清单',
            dependencies: ['complexity_analysis'],
            priority: 2,
            timeout: 5000
        });
        return steps;
    };
    /**
     * 创建专家咨询步骤
     */
    UnifiedIntelligenceService.prototype.createExpertConsultationSteps = function (analysis) {
        return [{
                id: 'expert_consultation',
                toolType: ToolType.EXPERT_CONSULTATION,
                toolName: 'call_expert',
                parameters: {
                    expert_id: 'activity_planner',
                    query: analysis.pageContext.currentPage
                },
                expectedResult: '获取专家建议',
                dependencies: [],
                priority: 1,
                timeout: 60000 // 与前端60秒超时保持一致
            }];
    };
    /**
     * 创建复杂工作流步骤
     */
    UnifiedIntelligenceService.prototype.createComplexWorkflowSteps = function (analysis) {
        var steps = [];
        // 组合多种能力
        steps.push.apply(steps, this.createTaskManagementSteps(analysis));
        steps.push.apply(steps, this.createPageOperationSteps(analysis));
        return steps;
    };
    /**
     * 创建信息查询步骤
     */
    UnifiedIntelligenceService.prototype.createInformationQueryStep = function (analysis) {
        return {
            id: 'info_query',
            toolType: ToolType.COGNITIVE,
            toolName: 'any_query',
            parameters: { userQuery: analysis.pageContext.currentPage },
            expectedResult: '查询相关信息',
            dependencies: [],
            priority: 1,
            timeout: 8000
        };
    };
    /**
     * 创建降级策略
     */
    UnifiedIntelligenceService.prototype.createFallbackStrategy = function (analysis) {
        return {
            primaryFailed: [],
            alternativeApproach: '使用基础文本回复',
            degradedMode: analysis.complexity === TaskComplexity.VERY_COMPLEX
        };
    };
    /**
     * 执行工具链（增强错误处理和降级策略）
     */
    UnifiedIntelligenceService.prototype.executeToolChain = function (plan, analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var results, consecutiveFailures, maxConsecutiveFailures, i, step, startTime, result, executionTime, validationResult, error_10, executionTime, fallbackResult, globalFallback, alternativeResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD27 \u5F00\u59CB\u6267\u884C ".concat(plan.steps.length, " \u4E2A\u5DE5\u5177\u6B65\u9AA4"));
                        results = [];
                        consecutiveFailures = 0;
                        maxConsecutiveFailures = 2;
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < plan.steps.length)) return [3 /*break*/, 11];
                        step = plan.steps[i];
                        startTime = Date.now();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 10]);
                        console.log("\u26A1 \u6267\u884C\u6B65\u9AA4 ".concat(i + 1, "/").concat(plan.steps.length, ": ").concat(step.toolName));
                        // 检查依赖项是否满足
                        if (!this.checkDependencies(step, results)) {
                            throw new Error("\u4F9D\u8D56\u9879\u672A\u6EE1\u8DB3: ".concat(step.dependencies.join(', ')));
                        }
                        return [4 /*yield*/, this.executeStepWithTimeout(step)];
                    case 3:
                        result = _a.sent();
                        executionTime = Date.now() - startTime;
                        validationResult = this.validateStepResult(step, result);
                        results.push({
                            toolName: step.toolName,
                            stepId: step.id,
                            status: 'completed',
                            result: validationResult.isValid ? result : __assign(__assign({}, result), { warning: validationResult.warning }),
                            executionTime: executionTime,
                            confidence: validationResult.confidence
                        });
                        consecutiveFailures = 0; // 重置连续失败计数
                        console.log("\u2705 \u6B65\u9AA4\u5B8C\u6210: ".concat(step.toolName, " (").concat(executionTime, "ms, \u7F6E\u4FE1\u5EA6: ").concat(validationResult.confidence, ")"));
                        return [3 /*break*/, 10];
                    case 4:
                        error_10 = _a.sent();
                        console.error("\u274C \u6B65\u9AA4\u5931\u8D25: ".concat(step.toolName), error_10);
                        consecutiveFailures++;
                        executionTime = Date.now() - startTime;
                        return [4 /*yield*/, this.executeFallbackStrategy(step, error_10, analysis)];
                    case 5:
                        fallbackResult = _a.sent();
                        results.push({
                            toolName: step.toolName,
                            stepId: step.id,
                            status: fallbackResult.success ? 'completed' : 'failed',
                            result: fallbackResult,
                            executionTime: executionTime,
                            confidence: fallbackResult.success ? 0.6 : 0.1
                        });
                        if (!(consecutiveFailures >= maxConsecutiveFailures)) return [3 /*break*/, 7];
                        console.warn("\u26A0\uFE0F \u8FDE\u7EED\u5931\u8D25".concat(consecutiveFailures, "\u6B21\uFF0C\u542F\u52A8\u5168\u5C40\u964D\u7EA7\u7B56\u7565"));
                        return [4 /*yield*/, this.executeGlobalFallback(analysis, results)];
                    case 6:
                        globalFallback = _a.sent();
                        results.push(globalFallback);
                        return [3 /*break*/, 11];
                    case 7:
                        if (!(step.priority === 1)) return [3 /*break*/, 9];
                        console.warn("\u26A0\uFE0F \u5173\u952E\u6B65\u9AA4\u5931\u8D25: ".concat(step.toolName, "\uFF0C\u5C1D\u8BD5\u5907\u7528\u65B9\u6848"));
                        return [4 /*yield*/, this.tryAlternativeApproach(step, analysis)];
                    case 8:
                        alternativeResult = _a.sent();
                        if (alternativeResult) {
                            results.push(alternativeResult);
                        }
                        _a.label = 9;
                    case 9: return [3 /*break*/, 10];
                    case 10:
                        i++;
                        return [3 /*break*/, 1];
                    case 11: return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 检查步骤依赖项
     */
    UnifiedIntelligenceService.prototype.checkDependencies = function (step, completedResults) {
        if (!step.dependencies || step.dependencies.length === 0) {
            return true;
        }
        // 创建已完成步骤ID映射（包括toolName和stepId）
        var completedStepIds = new Set();
        completedResults
            .filter(function (result) { return result.status === 'completed'; })
            .forEach(function (result) {
            completedStepIds.add(result.toolName);
            // 如果有stepId，也添加进去
            if (result.stepId) {
                completedStepIds.add(result.stepId);
            }
        });
        // 检查依赖项是否都满足
        var unmetDependencies = step.dependencies.filter(function (dep) { return !completedStepIds.has(dep); });
        if (unmetDependencies.length > 0) {
            console.log("\uD83D\uDD0D \u4F9D\u8D56\u9879\u68C0\u67E5 - \u6B65\u9AA4: ".concat(step.id, ", \u672A\u6EE1\u8DB3\u4F9D\u8D56: ").concat(unmetDependencies.join(', ')));
            console.log("\uD83D\uDD0D \u5DF2\u5B8C\u6210\u6B65\u9AA4: [".concat(Array.from(completedStepIds).join(', '), "]"));
        }
        return unmetDependencies.length === 0;
    };
    /**
     * 带超时的步骤执行
     */
    UnifiedIntelligenceService.prototype.executeStepWithTimeout = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var timeout;
            return __generator(this, function (_a) {
                timeout = step.timeout || 10000;
                return [2 /*return*/, Promise.race([
                        this.executeStep(step),
                        new Promise(function (_, reject) {
                            return setTimeout(function () { return reject(new Error("\u6267\u884C\u8D85\u65F6: ".concat(timeout, "ms"))); }, timeout);
                        })
                    ])];
            });
        });
    };
    /**
     * 验证步骤结果
     */
    UnifiedIntelligenceService.prototype.validateStepResult = function (step, result) {
        var _a, _b, _c, _d;
        // 基础验证
        if (!result) {
            return { isValid: false, confidence: 0.1, warning: '结果为空' };
        }
        // 根据步骤类型进行特定验证
        switch (step.toolName) {
            case 'get_page_structure':
                var hasStructure = result.pageStructure &&
                    (((_a = result.pageStructure.forms) === null || _a === void 0 ? void 0 : _a.length) > 0 ||
                        ((_b = result.pageStructure.buttons) === null || _b === void 0 ? void 0 : _b.length) > 0 ||
                        ((_c = result.pageStructure.links) === null || _c === void 0 ? void 0 : _c.length) > 0);
                return {
                    isValid: hasStructure,
                    confidence: hasStructure ? 0.9 : 0.5,
                    warning: hasStructure ? undefined : '页面结构数据不完整'
                };
            case 'navigate_to_page':
                var hasRoute = result.route && result.success;
                return {
                    isValid: hasRoute,
                    confidence: hasRoute ? 0.95 : 0.3,
                    warning: hasRoute ? undefined : '导航可能未成功'
                };
            case 'create_todo_list':
                var hasTodoList = result.todoList && ((_d = result.todoList.tasks) === null || _d === void 0 ? void 0 : _d.length) > 0;
                return {
                    isValid: hasTodoList,
                    confidence: hasTodoList ? 0.9 : 0.4,
                    warning: hasTodoList ? undefined : 'TodoList创建不完整'
                };
            default:
                // 通用验证：检查是否有message字段
                var hasMessage = result.message || result.success !== false;
                return {
                    isValid: hasMessage,
                    confidence: hasMessage ? 0.8 : 0.5,
                    warning: hasMessage ? undefined : '执行结果可能不完整'
                };
        }
    };
    /**
     * 执行降级策略
     */
    UnifiedIntelligenceService.prototype.executeFallbackStrategy = function (step, error, analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var simpleComplexity;
            return __generator(this, function (_a) {
                console.log("\uD83D\uDD04 \u6267\u884C\u964D\u7EA7\u7B56\u7565: ".concat(step.toolName));
                try {
                    // 根据工具类型提供不同的降级策略
                    switch (step.toolName) {
                        case 'get_page_structure':
                            return [2 /*return*/, {
                                    success: true,
                                    fallback: true,
                                    pageStructure: { forms: [], buttons: [], links: [], inputs: [] },
                                    message: '使用默认页面结构（降级模式）',
                                    originalError: error.message
                                }];
                        case 'navigate_to_page':
                            return [2 /*return*/, {
                                    success: true,
                                    fallback: true,
                                    route: step.parameters.page || '/dashboard',
                                    message: '使用默认导航（降级模式）',
                                    originalError: error.message
                                }];
                        case 'analyze_task_complexity':
                            simpleComplexity = analysis.complexity || TaskComplexity.MODERATE;
                            return [2 /*return*/, {
                                    success: true,
                                    fallback: true,
                                    needsTodoList: simpleComplexity !== TaskComplexity.SIMPLE,
                                    complexityLevel: simpleComplexity,
                                    message: '使用简化复杂度分析（降级模式）',
                                    originalError: error.message
                                }];
                        case 'create_todo_list':
                            return [2 /*return*/, {
                                    success: true,
                                    fallback: true,
                                    todoList: {
                                        id: "fallback_todo_".concat(Date.now()),
                                        title: '简化任务清单',
                                        tasks: [
                                            { id: 'task_1', title: '开始执行', priority: 'high', status: 'pending' },
                                            { id: 'task_2', title: '完成任务', priority: 'medium', status: 'pending' }
                                        ]
                                    },
                                    message: '使用简化TodoList（降级模式）',
                                    originalError: error.message
                                }];
                        case 'render_component':
                            return [2 /*return*/, {
                                    success: true,
                                    fallback: true,
                                    componentData: {
                                        type: 'text',
                                        data: { message: '图表渲染暂不可用，请稍后重试' }
                                    },
                                    message: '使用文本替代组件（降级模式）',
                                    originalError: error.message
                                }];
                        default:
                            return [2 /*return*/, {
                                    success: false,
                                    fallback: true,
                                    message: "".concat(step.toolName, " \u6267\u884C\u5931\u8D25\uFF0C\u6682\u65E0\u964D\u7EA7\u65B9\u6848"),
                                    suggestion: '请检查系统状态或尝试其他操作',
                                    originalError: error.message
                                }];
                    }
                }
                catch (fallbackError) {
                    console.error("\u274C \u964D\u7EA7\u7B56\u7565\u4E5F\u5931\u8D25\u4E86: ".concat(step.toolName), fallbackError);
                    return [2 /*return*/, {
                            success: false,
                            fallback: true,
                            message: "".concat(step.toolName, " \u964D\u7EA7\u5931\u8D25"),
                            originalError: error.message,
                            fallbackError: fallbackError.message
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 执行全局降级策略
     */
    UnifiedIntelligenceService.prototype.executeGlobalFallback = function (analysis, currentResults) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, completedTools, hasValidResults, fallbackMessage_1;
            var _this = this;
            return __generator(this, function (_a) {
                console.log('🚨 执行全局降级策略');
                startTime = Date.now();
                try {
                    completedTools = currentResults.filter(function (r) { return r.status === 'completed'; });
                    hasValidResults = completedTools.length > 0;
                    fallbackMessage_1 = '由于系统遇到多个错误，已启动降级模式。';
                    if (hasValidResults) {
                        fallbackMessage_1 += "\n\n\u5DF2\u6210\u529F\u5B8C\u6210 ".concat(completedTools.length, " \u4E2A\u64CD\u4F5C\uFF1A\n");
                        completedTools.forEach(function (tool, index) {
                            fallbackMessage_1 += "".concat(index + 1, ". ").concat(_this.getToolDisplayName(tool.toolName), "\n");
                        });
                    }
                    fallbackMessage_1 += '\n💡 建议：\n';
                    fallbackMessage_1 += '• 请尝试简化您的请求\n';
                    fallbackMessage_1 += '• 检查网络连接状态\n';
                    fallbackMessage_1 += '• 稍后重试或联系技术支持\n';
                    return [2 /*return*/, {
                            toolName: 'global_fallback',
                            status: 'completed',
                            result: {
                                success: true,
                                fallback: true,
                                message: fallbackMessage_1,
                                completedOperations: completedTools.length,
                                recommendation: '建议简化请求或稍后重试'
                            },
                            executionTime: Date.now() - startTime,
                            confidence: 0.7
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            toolName: 'global_fallback',
                            status: 'failed',
                            result: {
                                success: false,
                                message: '系统降级失败，请联系技术支持',
                                error: error.message
                            },
                            executionTime: Date.now() - startTime,
                            confidence: 0.1
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 尝试备用方案
     */
    UnifiedIntelligenceService.prototype.tryAlternativeApproach = function (step, analysis) {
        return __awaiter(this, void 0, void 0, function () {
            var alternativeMap, alternativeTool, startTime, alternativeStep, result, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("\uD83D\uDD04 \u5C1D\u8BD5\u5907\u7528\u65B9\u6848: ".concat(step.toolName));
                        alternativeMap = {
                            'get_page_structure': 'capture_screen',
                            'navigate_to_page': 'validate_page_state',
                            'render_component': 'create_todo_list',
                            'call_expert': 'any_query'
                        };
                        alternativeTool = alternativeMap[step.toolName];
                        if (!alternativeTool) {
                            return [2 /*return*/, null];
                        }
                        startTime = Date.now();
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        alternativeStep = __assign(__assign({}, step), { id: "".concat(step.id, "_alternative"), toolName: alternativeTool, expectedResult: "".concat(step.expectedResult, " (\u5907\u7528\u65B9\u6848)") });
                        return [4 /*yield*/, this.executeStep(alternativeStep)];
                    case 2:
                        result = _a.sent();
                        return [2 /*return*/, {
                                toolName: alternativeTool,
                                status: 'completed',
                                result: __assign(__assign({}, result), { alternative: true, originalTool: step.toolName, message: "".concat(result.message || '', " (\u5907\u7528\u65B9\u6848)") }),
                                executionTime: Date.now() - startTime,
                                confidence: 0.7
                            }];
                    case 3:
                        error_11 = _a.sent();
                        console.error("\u274C \u5907\u7528\u65B9\u6848\u4E5F\u5931\u8D25\u4E86: ".concat(alternativeTool), error_11);
                        return [2 /*return*/, null];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行单个步骤（集成实际工具）
     */
    UnifiedIntelligenceService.prototype.executeStep = function (step) {
        return __awaiter(this, void 0, void 0, function () {
            var functionToolsServiceTools, ToolLoaderService_1, loader, toolDefs, toolDef, result, error_12, errorMessage, _a, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 27, , 28]);
                        console.log("\uD83D\uDD27 [UnifiedIntelligence] \u6267\u884C\u5DE5\u5177: ".concat(step.toolName));
                        functionToolsServiceTools = [
                            'query_past_activities',
                            'get_activity_statistics',
                            'query_enrollment_history',
                            'analyze_business_trends'
                        ];
                        if (!functionToolsServiceTools.includes(step.toolName)) return [3 /*break*/, 8];
                        // 尝试使用新的工具加载器系统
                        console.log("\uD83D\uDD04 [ExecuteStep] \u5C1D\u8BD5\u4F7F\u7528\u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C: ".concat(step.toolName));
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/tools/core/tool-loader.service')); })];
                    case 2:
                        ToolLoaderService_1 = (_b.sent()).ToolLoaderService;
                        loader = new ToolLoaderService_1();
                        return [4 /*yield*/, loader.loadTools([step.toolName])];
                    case 3:
                        toolDefs = _b.sent();
                        toolDef = toolDefs[0];
                        if (!(toolDef && typeof toolDef.implementation === 'function')) return [3 /*break*/, 5];
                        console.log("\u2705 [ExecuteStep] \u901A\u8FC7\u65B0\u5DE5\u5177\u7CFB\u7EDF\u627E\u5230\u5DE5\u5177: ".concat(step.toolName));
                        return [4 /*yield*/, toolDef.implementation(step.parameters)];
                    case 4:
                        result = _b.sent();
                        return [2 /*return*/, { success: true, result: result }];
                    case 5:
                        console.warn("\u26A0\uFE0F [ExecuteStep] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5DE5\u5177: ".concat(step.toolName));
                        return [2 /*return*/, { success: false, message: "\u5DE5\u5177 ".concat(step.toolName, " \u5728\u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5B9E\u73B0") }];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        error_12 = _b.sent();
                        console.error("\u274C [ExecuteStep] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C\u5931\u8D25: ".concat(step.toolName), error_12);
                        errorMessage = error_12 instanceof Error ? error_12.message : '未知错误';
                        return [2 /*return*/, { success: false, message: "\u5DE5\u5177 ".concat(step.toolName, " \u6267\u884C\u5931\u8D25: ").concat(errorMessage) }];
                    case 8:
                        _a = step.toolName;
                        switch (_a) {
                            case 'get_page_structure': return [3 /*break*/, 9];
                            case 'navigate_to_page': return [3 /*break*/, 11];
                            case 'analyze_task_complexity': return [3 /*break*/, 13];
                            case 'create_todo_list': return [3 /*break*/, 15];
                            case 'validate_page_state': return [3 /*break*/, 17];
                            case 'render_component': return [3 /*break*/, 19];
                            case 'call_expert': return [3 /*break*/, 21];
                            case 'any_query': return [3 /*break*/, 23];
                        }
                        return [3 /*break*/, 25];
                    case 9: return [4 /*yield*/, this.executePageStructureScan(step.parameters)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.executeNavigation(step.parameters)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.executeComplexityAnalysis(step.parameters)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: return [4 /*yield*/, this.executeCreateTodoList(step.parameters)];
                    case 16: return [2 /*return*/, _b.sent()];
                    case 17: return [4 /*yield*/, this.executePageValidation(step.parameters)];
                    case 18: return [2 /*return*/, _b.sent()];
                    case 19: return [4 /*yield*/, this.executeRenderComponent(step.parameters)];
                    case 20: return [2 /*return*/, _b.sent()];
                    case 21: return [4 /*yield*/, this.executeExpertConsultation(step.parameters)];
                    case 22: return [2 /*return*/, _b.sent()];
                    case 23: return [4 /*yield*/, this.executeIntelligentQuery(step.parameters)];
                    case 24: return [2 /*return*/, _b.sent()];
                    case 25:
                        console.warn("\u26A0\uFE0F \u672A\u77E5\u5DE5\u5177: ".concat(step.toolName, "\uFF0C\u4F7F\u7528\u9ED8\u8BA4\u5904\u7406"));
                        return [2 /*return*/, {
                                success: true,
                                message: "".concat(step.toolName, " \u6267\u884C\u5B8C\u6210"),
                                timestamp: new Date().toISOString()
                            }];
                    case 26: return [3 /*break*/, 28];
                    case 27:
                        error_13 = _b.sent();
                        console.error("\u274C \u5DE5\u5177\u6267\u884C\u5931\u8D25: ".concat(step.toolName), error_13);
                        throw error_13;
                    case 28: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行页面结构扫描
     */
    UnifiedIntelligenceService.prototype.executePageStructureScan = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 模拟页面扫描，实际应用中可以调用前端页面扫描服务
                return [2 /*return*/, {
                        action: 'scan_page_elements',
                        pageStructure: {
                            forms: [
                                { id: 'activity-form', action: '/api/activities', method: 'POST' }
                            ],
                            buttons: [
                                { id: 'create-btn', text: '新建活动', type: 'primary' },
                                { id: 'save-btn', text: '保存', type: 'success' }
                            ],
                            links: [
                                { id: 'nav-dashboard', href: '/dashboard', text: '工作台' },
                                { id: 'nav-activities', href: '/activities', text: '活动中心' }
                            ],
                            inputs: [
                                { id: 'activity-title', type: 'text', name: 'title', placeholder: '请输入活动标题' },
                                { id: 'activity-desc', type: 'textarea', name: 'description', placeholder: '请输入活动描述' }
                            ]
                        },
                        capabilities: {
                            canCreateActivity: true,
                            canNavigate: true,
                            canFillForm: true
                        },
                        message: '页面结构扫描完成，发现2个表单、2个按钮、2个链接、2个输入框'
                    }];
            });
        });
    };
    /**
     * 执行页面导航
     */
    UnifiedIntelligenceService.prototype.executeNavigation = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var page, subPage, pageMap, targetRoute, fullRoute;
            return __generator(this, function (_a) {
                page = parameters.page || parameters.pageName;
                subPage = parameters.subPage;
                pageMap = {
                    'dashboard': '/centers/dashboard',
                    'personnel_center': '/centers/personnel',
                    'activity_center': '/centers/activity',
                    'enrollment_center': '/centers/enrollment',
                    'education_center': '/centers/education',
                    'marketing_center': '/centers/marketing',
                    'ai_center': '/centers/ai',
                    'system_center': '/centers/system',
                    'finance_center': '/centers/finance',
                    'customer_pool_center': '/centers/customer-pool',
                    'script_center': '/centers/script',
                    'task_center': '/centers/task',
                    'analytics_center': '/centers/analytics',
                    'new_media_center': '/principal/media-center',
                    'media_center': '/principal/media-center',
                    // 主要功能页面
                    'customer': '/customer',
                    'student': '/student',
                    'teacher': '/teacher',
                    'activity': '/activity',
                    'application': '/application',
                    'parent': '/parent',
                    'marketing': '/marketing',
                    'statistics': '/statistics',
                    // 教育管理
                    'student_management': '/education/student-management',
                    'teacher_management': '/education/teacher-management',
                    'parent_management': '/education/parent-management',
                    // 招生管理
                    'enrollment': '/enrollment',
                    'prospects': '/enrollment/prospects',
                    'enrollment_activities': '/enrollment/activities',
                    'enrollment_statistics': '/enrollment/statistics'
                };
                targetRoute = pageMap[page] || "/".concat(page);
                fullRoute = subPage ? "".concat(targetRoute, "/").concat(subPage) : targetRoute;
                return [2 /*return*/, {
                        action: 'navigate',
                        route: fullRoute,
                        previousRoute: '/current-page',
                        success: true,
                        message: "\u6210\u529F\u5BFC\u822A\u5230 ".concat(fullRoute),
                        pageInfo: {
                            title: this.getPageTitle(page),
                            breadcrumb: [page, subPage].filter(Boolean)
                        }
                    }];
            });
        });
    };
    /**
     * 执行复杂度分析
     */
    UnifiedIntelligenceService.prototype.executeComplexityAnalysis = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var userInput, analysisResults, complexityScore, needsTodoList, autoAction;
            return __generator(this, function (_a) {
                userInput = parameters.userInput;
                analysisResults = {
                    inputLength: (userInput === null || userInput === void 0 ? void 0 : userInput.length) || 0,
                    actionWords: this.countActionWords(userInput || ''),
                    sequenceWords: this.hasSequenceWords(userInput || ''),
                    complexKeywords: this.hasComplexKeywords(userInput || ''),
                    multipleTargets: this.hasMultipleTargets(userInput || '')
                };
                complexityScore = this.calculateComplexityScore(analysisResults);
                needsTodoList = complexityScore >= 4;
                autoAction = this.detectAutoAction(userInput || '');
                return [2 /*return*/, {
                        needsTodoList: needsTodoList,
                        complexityLevel: this.getComplexityLevel(complexityScore),
                        complexityScore: complexityScore,
                        analysisResults: analysisResults,
                        recommendation: needsTodoList ? '建议创建任务清单进行分解管理' : '此任务相对简单，可以直接执行',
                        message: "\u4EFB\u52A1\u590D\u6742\u5EA6\u5206\u6790\u5B8C\u6210\uFF1A".concat(this.getComplexityLevel(complexityScore), "\u7EA7\u522B"),
                        auto_action: autoAction // 🎯 新增：自动推荐下一步工具
                    }];
            });
        });
    };
    /**
     * 🎯 智能检测用户意图,自动推荐下一步工具调用
     */
    UnifiedIntelligenceService.prototype.detectAutoAction = function (userInput) {
        var input = userInput.toLowerCase();
        // 检测是否需要查询+渲染
        var needsQuery = /查询|显示|展示|统计|分析|查看/.test(input);
        var needsChart = /图表|表格|卡片|可视化|图形/.test(input);
        var needsTable = /表格|列表/.test(input);
        if (needsQuery && (needsChart || needsTable)) {
            // 用户要求查询数据并用图表/表格展示
            return {
                next_tools: ['any_query', 'render_component'],
                reason: '用户要求查询数据并用图表/表格展示，需要先调用any_query获取数据，然后调用render_component渲染UI组件',
                workflow: 'query_and_render',
                mandatory: true // 🎯 标记为强制执行
            };
        }
        // 检测是否只需要查询
        if (needsQuery && !needsChart && !needsTable) {
            return {
                next_tools: ['any_query'],
                reason: '用户要求查询数据，需要调用any_query获取数据',
                workflow: 'query_only',
                mandatory: false
            };
        }
        // 检测是否需要导航
        var needsNavigation = /打开|跳转|进入|前往/.test(input);
        if (needsNavigation) {
            return {
                next_tools: ['navigate_to_page'],
                reason: '用户要求导航到指定页面',
                workflow: 'navigation',
                mandatory: false
            };
        }
        // 默认：无特定工具推荐
        return null;
    };
    /**
     * 执行创建TodoList
     */
    UnifiedIntelligenceService.prototype.executeCreateTodoList = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, title, _b, tasks, userInput, generatedTasks, todoList;
            return __generator(this, function (_c) {
                _a = parameters.title, title = _a === void 0 ? '智能任务清单' : _a, _b = parameters.tasks, tasks = _b === void 0 ? [] : _b, userInput = parameters.userInput;
                generatedTasks = tasks;
                if (tasks.length === 0 && userInput) {
                    generatedTasks = this.generateTasksFromInput(userInput);
                }
                todoList = {
                    id: "todo_".concat(Date.now()),
                    title: title,
                    tasks: generatedTasks.map(function (task, index) { return ({
                        id: "task_".concat(index + 1),
                        title: typeof task === 'string' ? task : task.title,
                        priority: typeof task === 'object' ? task.priority : 'medium',
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        estimatedTime: typeof task === 'object' ? task.estimatedTime : 30
                    }); }),
                    createdAt: new Date().toISOString(),
                    estimatedTotalTime: generatedTasks.length * 30
                };
                return [2 /*return*/, {
                        todoList: todoList,
                        statistics: {
                            totalTasks: todoList.tasks.length,
                            estimatedTime: todoList.estimatedTotalTime,
                            priorityDistribution: this.getTaskPriorityDistribution(todoList.tasks)
                        },
                        storageInstruction: {
                            action: 'save_to_localStorage',
                            key: "ai_todolist_".concat(todoList.id),
                            data: todoList,
                            expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
                        },
                        message: "TodoList\u521B\u5EFA\u6210\u529F\uFF0C\u5305\u542B".concat(todoList.tasks.length, "\u4E2A\u4EFB\u52A1\uFF0C\u9884\u8BA1\u8017\u65F6").concat(todoList.estimatedTotalTime, "\u5206\u949F")
                    }];
            });
        });
    };
    /**
     * 执行页面状态验证
     */
    UnifiedIntelligenceService.prototype.executePageValidation = function (parameters) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var expected_elements, expected_text, expected_url, validationResults, overallSuccess;
            return __generator(this, function (_b) {
                expected_elements = parameters.expected_elements, expected_text = parameters.expected_text, expected_url = parameters.expected_url;
                validationResults = {
                    elementsValidation: (expected_elements === null || expected_elements === void 0 ? void 0 : expected_elements.map(function (element) { return ({
                        element: element,
                        exists: Math.random() > 0.2,
                        message: "\u5143\u7D20 ".concat(element, " \u9A8C\u8BC1")
                    }); })) || [],
                    textValidation: (expected_text === null || expected_text === void 0 ? void 0 : expected_text.map(function (text) { return ({
                        text: text,
                        found: Math.random() > 0.3,
                        message: "\u6587\u672C \"".concat(text, "\" \u9A8C\u8BC1")
                    }); })) || [],
                    urlValidation: expected_url ? {
                        expected: expected_url,
                        actual: '/current-page',
                        match: Math.random() > 0.1 // 模拟90%成功率
                    } : null
                };
                overallSuccess = __spreadArray(__spreadArray(__spreadArray([], validationResults.elementsValidation.map(function (r) { return r.exists; }), true), validationResults.textValidation.map(function (r) { return r.found; }), true), [
                    (_a = validationResults.urlValidation) === null || _a === void 0 ? void 0 : _a.match
                ], false).filter(Boolean).length > 0;
                return [2 /*return*/, {
                        success: overallSuccess,
                        validationResults: validationResults,
                        summary: "\u9875\u9762\u72B6\u6001\u9A8C\u8BC1\u5B8C\u6210\uFF0C".concat(overallSuccess ? '符合' : '不符合', "\u9884\u671F"),
                        message: '页面状态验证执行完成'
                    }];
            });
        });
    };
    /**
     * 执行组件渲染
     */
    UnifiedIntelligenceService.prototype.executeRenderComponent = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var component_type, chart_type, content, interactive, componentData, message;
            return __generator(this, function (_a) {
                component_type = parameters.component_type, chart_type = parameters.chart_type, content = parameters.content, interactive = parameters.interactive;
                // 根据组件类型生成不同的数据结构
                switch (component_type) {
                    case 'chart':
                        componentData = this.generateChartData(chart_type, content);
                        message = "".concat(this.getChartTypeName(chart_type), "\u6E32\u67D3\u6210\u529F");
                        break;
                    case 'table':
                        componentData = this.generateTableData(content);
                        message = '数据表格渲染成功';
                        break;
                    case 'notification':
                        componentData = this.generateNotificationData(content);
                        message = '通知组件渲染成功';
                        break;
                    default:
                        componentData = this.generateChartData('bar', content);
                        message = '默认图表渲染成功';
                }
                return [2 /*return*/, {
                        componentData: componentData,
                        renderInfo: {
                            rendered: true,
                            elementId: "".concat(component_type, "_").concat(Date.now()),
                            timestamp: new Date().toISOString(),
                            interactive: interactive || false
                        },
                        message: message
                    }];
            });
        });
    };
    /**
     * 生成图表数据
     */
    UnifiedIntelligenceService.prototype.generateChartData = function (chartType, content) {
        var baseData = {
            type: 'chart',
            config: {
                chartType: chartType || 'bar',
                responsive: true,
                animation: true,
                title: (content === null || content === void 0 ? void 0 : content.includes('活动')) ? '活动统计图表' : '数据统计图表'
            }
        };
        switch (chartType) {
            case 'line':
                return __assign(__assign({}, baseData), { data: {
                        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
                        datasets: [{
                                label: '活动参与度趋势',
                                data: [65, 70, 80, 75, 85, 90],
                                borderColor: '#36A2EB',
                                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                                tension: 0.4
                            }]
                    } });
            case 'pie':
                return __assign(__assign({}, baseData), { data: {
                        labels: ['已完成', '进行中', '待开始', '已取消'],
                        datasets: [{
                                data: [45, 25, 20, 10],
                                backgroundColor: ['#4BC0C0', '#36A2EB', '#FFCE56', '#FF6384']
                            }]
                    } });
            default:
                return __assign(__assign({}, baseData), { data: {
                        labels: ['一月', '二月', '三月', '四月', '五月'],
                        datasets: [{
                                label: '活动数量',
                                data: [12, 19, 8, 15, 10],
                                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF']
                            }]
                    } });
        }
    };
    /**
     * 生成表格数据
     */
    UnifiedIntelligenceService.prototype.generateTableData = function (content) {
        return {
            type: 'table',
            config: {
                title: (content === null || content === void 0 ? void 0 : content.includes('学生')) ? '学生信息表' : '数据信息表',
                pagination: true,
                searchable: true
            },
            data: {
                headers: ['姓名', '年龄', '班级', '状态'],
                rows: [
                    ['张小明', '5岁', '大班A', '正常'],
                    ['李小红', '4岁', '中班B', '正常'],
                    ['王小刚', '6岁', '大班C', '请假'],
                    ['赵小美', '5岁', '大班A', '正常'],
                    ['孙小华', '4岁', '中班A', '正常']
                ]
            }
        };
    };
    /**
     * 生成通知数据
     */
    UnifiedIntelligenceService.prototype.generateNotificationData = function (content) {
        return {
            type: 'notification',
            config: {
                title: '重要通知',
                type: 'info',
                closable: true,
                showIcon: true
            },
            data: {
                message: (content === null || content === void 0 ? void 0 : content.includes('家长')) ? '家长会通知：本周五下午2点召开家长会，请各位家长准时参加。' : '系统通知：请注意查看最新公告信息。',
                timestamp: new Date().toISOString(),
                priority: 'high'
            }
        };
    };
    /**
     * 获取图表类型中文名称
     */
    UnifiedIntelligenceService.prototype.getChartTypeName = function (chartType) {
        var typeMap = {
            'bar': '柱状图',
            'line': '折线图',
            'pie': '饼图',
            'scatter': '散点图',
            'area': '面积图'
        };
        return typeMap[chartType] || '图表';
    };
    /**
     * 执行专家咨询
     */
    UnifiedIntelligenceService.prototype.executeExpertConsultation = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var expert_id, query, expertMap, expert;
            return __generator(this, function (_a) {
                expert_id = parameters.expert_id, query = parameters.query;
                expertMap = {
                    'activity_planner': {
                        name: '活动策划专家',
                        expertise: ['活动策划', '流程设计', '效果评估'],
                        experience: '10年+'
                    },
                    'education_specialist': {
                        name: '教育专家',
                        expertise: ['课程设计', '教学方法', '儿童发展'],
                        experience: '15年+'
                    },
                    'marketing_expert': {
                        name: '营销专家',
                        expertise: ['市场分析', '推广策略', '品牌建设'],
                        experience: '8年+'
                    }
                };
                expert = expertMap[expert_id] || expertMap['activity_planner'];
                return [2 /*return*/, {
                        expert: expert,
                        consultation: {
                            query: query,
                            response: "\u57FA\u4E8E\u6211\u5728".concat(expert.expertise.join('、'), "\u65B9\u9762\u7684\u4E13\u4E1A\u7ECF\u9A8C\uFF0C\u6211\u5EFA\u8BAE\u60A8..."),
                            recommendations: [
                                '建议1：从目标用户需求出发',
                                '建议2：制定详细的执行计划',
                                '建议3：建立效果评估机制'
                            ],
                            nextSteps: [
                                '制定具体实施方案',
                                '准备所需资源',
                                '设置关键节点检查'
                            ]
                        },
                        message: "".concat(expert.name, "\u54A8\u8BE2\u5B8C\u6210\uFF0C\u63D0\u4F9B\u4E86\u4E13\u4E1A\u5EFA\u8BAE\u548C\u5B9E\u65BD\u5EFA\u8BAE")
                    }];
            });
        });
    };
    /**
     * 执行智能查询
     */
    UnifiedIntelligenceService.prototype.executeIntelligentQuery = function (parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var userQuery, _a, queryType, _b, expectedFormat, queryResults;
            return __generator(this, function (_c) {
                userQuery = parameters.userQuery, _a = parameters.queryType, queryType = _a === void 0 ? 'detailed' : _a, _b = parameters.expectedFormat, expectedFormat = _b === void 0 ? 'mixed' : _b;
                queryResults = {
                    query: userQuery,
                    type: queryType,
                    results: [
                        {
                            title: '查询结果1',
                            content: '这是基于您的查询返回的相关信息...',
                            confidence: 0.95,
                            source: 'database_query'
                        },
                        {
                            title: '查询结果2',
                            content: '额外的相关信息和建议...',
                            confidence: 0.88,
                            source: 'knowledge_base'
                        }
                    ],
                    summary: '查询完成，找到2条相关结果',
                    suggestions: [
                        '您可能还想了解...',
                        '相关的操作建议...'
                    ]
                };
                return [2 /*return*/, {
                        queryResults: queryResults,
                        format: expectedFormat,
                        metadata: {
                            totalResults: queryResults.results.length,
                            averageConfidence: queryResults.results.reduce(function (sum, r) { return sum + r.confidence; }, 0) / queryResults.results.length,
                            queryTime: new Date().toISOString()
                        },
                        message: "\u667A\u80FD\u67E5\u8BE2\u5B8C\u6210\uFF0C\u627E\u5230".concat(queryResults.results.length, "\u6761\u7ED3\u679C")
                    }];
            });
        });
    };
    // 辅助方法
    UnifiedIntelligenceService.prototype.getPageTitle = function (page) {
        var titleMap = {
            'dashboard': '工作台',
            'activity_center': '活动中心',
            'personnel_center': '人员中心',
            'enrollment_center': '招生中心',
            'marketing_center': '营销中心',
            'ai_center': 'AI中心',
            'system_center': '系统中心'
        };
        return titleMap[page] || page;
    };
    UnifiedIntelligenceService.prototype.countActionWords = function (text) {
        var actionWords = ['创建', '生成', '添加', '发送', '通知', '统计', '分析', '安排', '联系', '制定'];
        return actionWords.filter(function (word) { return text.includes(word); }).length;
    };
    UnifiedIntelligenceService.prototype.hasSequenceWords = function (text) {
        var sequenceWords = ['首先', '然后', '接下来', '最后', '同时', '之后'];
        return sequenceWords.some(function (word) { return text.includes(word); });
    };
    UnifiedIntelligenceService.prototype.hasComplexKeywords = function (text) {
        var complexKeywords = ['策划', '组织', '安排', '制定', '设计', '准备', '统计', '分析'];
        return complexKeywords.some(function (word) { return text.includes(word); });
    };
    UnifiedIntelligenceService.prototype.hasMultipleTargets = function (text) {
        var multipleTargets = ['所有', '全部', '各个', '每个', '分别'];
        return multipleTargets.some(function (word) { return text.includes(word); });
    };
    UnifiedIntelligenceService.prototype.calculateComplexityScore = function (analysis) {
        var score = 0;
        if (analysis.inputLength > 100)
            score += 1;
        if (analysis.inputLength > 200)
            score += 1;
        score += Math.min(analysis.actionWords, 3);
        if (analysis.sequenceWords)
            score += 2;
        if (analysis.complexKeywords)
            score += 1;
        if (analysis.multipleTargets)
            score += 1;
        return score;
    };
    UnifiedIntelligenceService.prototype.getComplexityLevel = function (score) {
        if (score >= 6)
            return 'very_complex';
        if (score >= 4)
            return 'complex';
        if (score >= 2)
            return 'moderate';
        return 'simple';
    };
    UnifiedIntelligenceService.prototype.generateTasksFromInput = function (userInput) {
        // 基于用户输入智能生成任务
        var baseKeywords = {
            '策划': ['需求分析', '方案设计', '资源准备', '执行计划'],
            '活动': ['活动策划', '场地准备', '人员安排', '宣传推广', '效果评估'],
            '创建': ['需求分析', '内容准备', '创建执行', '质量检查'],
            '分析': ['数据收集', '数据分析', '结果整理', '报告生成']
        };
        var tasks = [];
        Object.entries(baseKeywords).forEach(function (_a) {
            var keyword = _a[0], taskList = _a[1];
            if (userInput.includes(keyword)) {
                tasks.push.apply(tasks, taskList.map(function (task) { return ({
                    title: task,
                    priority: 'medium',
                    estimatedTime: 30
                }); }));
            }
        });
        // 如果没有匹配的关键词，生成通用任务
        if (tasks.length === 0) {
            tasks = [
                { title: '需求分析和准备', priority: 'high', estimatedTime: 30 },
                { title: '具体实施执行', priority: 'medium', estimatedTime: 45 },
                { title: '结果验收和总结', priority: 'low', estimatedTime: 15 }
            ];
        }
        return tasks.slice(0, 6); // 最多6个任务
    };
    UnifiedIntelligenceService.prototype.getTaskPriorityDistribution = function (tasks) {
        var distribution = { high: 0, medium: 0, low: 0 };
        tasks.forEach(function (task) {
            distribution[task.priority]++;
        });
        return distribution;
    };
    /**
     * 整合结果
     */
    UnifiedIntelligenceService.prototype.integrateResults = function (results, analysis, executionTime) {
        var successfulResults = results.filter(function (r) { return r.status === 'completed'; });
        var failedResults = results.filter(function (r) { return r.status === 'failed'; });
        // 构建响应消息
        var message = this.generateResponseMessage(analysis, successfulResults);
        // 构建UI组件
        var uiComponents = this.generateUIComponents(successfulResults, analysis);
        // 构建建议
        var recommendations = this.generateRecommendations(analysis, results);
        // 计算置信度
        var confidenceScore = successfulResults.length / results.length * analysis.confidence;
        return {
            success: failedResults.length === 0,
            data: {
                message: message,
                toolExecutions: results,
                uiComponents: uiComponents,
                recommendations: recommendations,
                todoList: this.extractTodoList(successfulResults),
                visualizations: this.extractVisualizations(successfulResults)
            },
            metadata: {
                executionTime: executionTime,
                toolsUsed: results.map(function (r) { return r.toolName; }),
                confidenceScore: confidenceScore,
                nextSuggestedActions: this.generateNextActions(analysis),
                complexity: analysis.complexity,
                approach: analysis.intent
            }
        };
    };
    /**
     * 生成响应消息
     */
    UnifiedIntelligenceService.prototype.generateResponseMessage = function (analysis, results) {
        var _this = this;
        var message = "\u6211\u5DF2\u7ECF\u4E3A\u60A8\u667A\u80FD\u5206\u6790\u5E76\u5904\u7406\u4E86\u8FD9\u4E2A".concat(this.getComplexityText(analysis.complexity), "\u8BF7\u6C42\u3002\n\n");
        message += "\uD83C\uDFAF **\u8BC6\u522B\u610F\u56FE**: ".concat(this.getIntentText(analysis.intent), "\n");
        message += "\uD83D\uDCCA **\u590D\u6742\u5EA6\u8BC4\u4F30**: ".concat(this.getComplexityText(analysis.complexity), "\n");
        message += "\u26A1 **\u6267\u884C\u65B9\u5F0F**: ".concat(this.getApproachDescription(analysis.intent), "\n\n");
        if (results.length > 0) {
            message += "\uD83D\uDEE0\uFE0F **\u6267\u884C\u7684\u64CD\u4F5C**:\n";
            results.forEach(function (result, index) {
                message += "".concat(index + 1, ". ").concat(_this.getToolDisplayName(result.toolName), " \u2705\n");
            });
        }
        return message;
    };
    /**
     * 生成UI组件（重新设计核心逻辑）
     */
    UnifiedIntelligenceService.prototype.generateUIComponents = function (results, analysis) {
        var _this = this;
        var components = [];
        // 首先从工具执行结果中提取组件
        results.forEach(function (result) {
            var _a;
            if (result.toolName === 'create_todo_list' && result.result.todoList) {
                components.push({
                    type: 'todo-list',
                    data: result.result.todoList,
                    props: { interactive: true, animated: true },
                    animation: 'fadeInUp'
                });
            }
            if (result.toolName === 'render_component' && result.result.componentData) {
                var componentData = result.result.componentData;
                // 根据实际组件类型生成UI组件
                components.push({
                    type: componentData.type,
                    data: componentData,
                    props: {
                        responsive: componentData.type === 'chart',
                        interactive: ((_a = result.result.renderInfo) === null || _a === void 0 ? void 0 : _a.interactive) || false,
                        animated: true
                    },
                    animation: _this.getComponentAnimation(componentData.type)
                });
            }
        });
        // 如果没有从工具结果中生成组件，但分析显示需要数据可视化，则直接生成
        if (components.length === 0 && analysis && analysis.intent === IntentType.DATA_VISUALIZATION) {
            console.log('🎨 直接生成数据可视化组件');
            var directComponent = this.generateDirectUIComponent(analysis);
            if (directComponent) {
                components.push(directComponent);
            }
        }
        return components;
    };
    /**
     * 直接生成UI组件（不依赖工具执行结果）
     */
    UnifiedIntelligenceService.prototype.generateDirectUIComponent = function (analysis) {
        var content = analysis.originalContent || '';
        var componentInfo = this.detectComponentType(analysis);
        var componentData;
        switch (componentInfo.type) {
            case 'chart':
                componentData = this.generateChartData(componentInfo.subType, content);
                break;
            case 'table':
                componentData = this.generateTableData(content);
                break;
            case 'notification':
                componentData = this.generateNotificationData(content);
                break;
            default:
                return null;
        }
        return {
            type: componentInfo.type,
            data: componentData,
            props: {
                responsive: componentInfo.type === 'chart',
                interactive: true,
                animated: true
            },
            animation: this.getComponentAnimation(componentInfo.type)
        };
    };
    /**
     * 获取组件动画类型
     */
    UnifiedIntelligenceService.prototype.getComponentAnimation = function (componentType) {
        var animationMap = {
            'chart': 'zoomIn',
            'table': 'slideInUp',
            'notification': 'bounceIn',
            'todo-list': 'fadeInUp'
        };
        return animationMap[componentType] || 'fadeIn';
    };
    /**
     * 判断是否是简单CRUD操作
     */
    UnifiedIntelligenceService.prototype.isSimpleCRUDOperation = function (content) {
        var contentLower = content.toLowerCase();
        // CRUD关键词
        var createKeywords = ['创建', '添加', '新建', '注册', '录入'];
        var readKeywords = ['查询', '查看', '显示', '列出', '获取', '统计'];
        var updateKeywords = ['更新', '修改', '编辑', '调整', '变更'];
        var deleteKeywords = ['删除', '移除', '取消', '清除'];
        // 复杂任务关键词
        var complexKeywords = ['策划', '完成', '批量', '分析并', '执行', '创建并'];
        var multiStepIndicators = /并且|然后|接着|同时/;
        // 检查是否包含复杂任务关键词
        var hasComplexKeyword = complexKeywords.some(function (kw) { return contentLower.includes(kw); });
        var hasMultipleSteps = multiStepIndicators.test(content);
        if (hasComplexKeyword || hasMultipleSteps) {
            return false; // 复杂任务
        }
        // 检查是否包含CRUD关键词
        var hasCRUDKeyword = __spreadArray(__spreadArray(__spreadArray(__spreadArray([], createKeywords, true), readKeywords, true), updateKeywords, true), deleteKeywords, true).some(function (kw) { return contentLower.includes(kw); });
        return hasCRUDKeyword; // 简单CRUD操作
    };
    /**
     * 验证强制性工作流程
     */
    UnifiedIntelligenceService.prototype.validateMandatoryWorkflow = function (toolCalls, conversationHistory) {
        var _a;
        if (!toolCalls || toolCalls.length === 0)
            return;
        var toolNames = toolCalls.map(function (call) { var _a; return ((_a = call["function"]) === null || _a === void 0 ? void 0 : _a.name) || call.name; });
        var isFirstIteration = conversationHistory.length <= 1;
        console.log("\uD83D\uDD0D [Workflow Validator] \u9A8C\u8BC1\u5DE5\u5177\u8C03\u7528\u987A\u5E8F:", toolNames);
        // 🟢 规则1: 第一轮建议调用 analyze_task_complexity（仅复杂任务）
        if (isFirstIteration && !toolNames.includes('analyze_task_complexity')) {
            // 检查是否是简单CRUD操作
            var userInput = ((_a = conversationHistory[0]) === null || _a === void 0 ? void 0 : _a.content) || '';
            var isSimpleCRUD = this.isSimpleCRUDOperation(userInput);
            if (!isSimpleCRUD) {
                console.warn("\u26A0\uFE0F [Workflow Validator] \u5EFA\u8BAE: \u590D\u6742\u4EFB\u52A1\u5E94\u8BE5\u5148\u8C03\u7528 analyze_task_complexity");
            }
            else {
                console.log("\u2705 [Workflow Validator] \u7B80\u5355CRUD\u64CD\u4F5C\uFF0C\u8DF3\u8FC7\u4EFB\u52A1\u5206\u6790");
            }
        }
        // 🔴 规则2: 如果有复杂任务，应该有 create_todo_list
        var hasComplexityAnalysis = toolNames.includes('analyze_task_complexity');
        var hasTodoListCreation = toolNames.includes('create_todo_list');
        if (hasComplexityAnalysis && !hasTodoListCreation) {
            console.warn("\u26A0\uFE0F [Workflow Validator] \u5EFA\u8BAE: \u68C0\u6D4B\u5230\u590D\u6742\u5EA6\u5206\u6790\uFF0C\u53EF\u80FD\u9700\u8981\u521B\u5EFATodoList");
        }
        // 🔴 规则3: TodoList更新应该在任务执行后
        var hasTaskUpdate = toolNames.includes('update_todo_task');
        var hasOtherTools = toolNames.some(function (name) {
            return !['analyze_task_complexity', 'create_todo_list', 'update_todo_task'].includes(name);
        });
        if (hasOtherTools && hasTodoListCreation && !hasTaskUpdate) {
            console.warn("\u26A0\uFE0F [Workflow Validator] \u5EFA\u8BAE: \u6267\u884C\u4EFB\u52A1\u540E\u5E94\u8BE5\u66F4\u65B0TodoList\u72B6\u6001");
        }
        console.log("\u2705 [Workflow Validator] \u5DE5\u4F5C\u6D41\u7A0B\u9A8C\u8BC1\u5B8C\u6210");
    };
    /**
     * 生成建议
     */
    UnifiedIntelligenceService.prototype.generateRecommendations = function (analysis, results) {
        var recommendations = [];
        if (analysis.complexity === TaskComplexity.VERY_COMPLEX) {
            recommendations.push({
                title: '复杂任务分解',
                description: '建议将当前任务进一步分解为更小的子任务',
                action: 'create_subtasks',
                priority: 'high'
            });
        }
        if (analysis.intent === IntentType.PAGE_OPERATION) {
            recommendations.push({
                title: '页面状态监控',
                description: '建议在操作后验证页面状态',
                action: 'validate_state',
                priority: 'medium'
            });
        }
        return recommendations;
    };
    /**
     * 提取TodoList
     */
    UnifiedIntelligenceService.prototype.extractTodoList = function (results) {
        var _a;
        var todoResult = results.find(function (r) { return r.toolName === 'create_todo_list'; });
        return ((_a = todoResult === null || todoResult === void 0 ? void 0 : todoResult.result) === null || _a === void 0 ? void 0 : _a.todoList) || null;
    };
    /**
     * 提取可视化组件
     */
    UnifiedIntelligenceService.prototype.extractVisualizations = function (results) {
        return results
            .filter(function (r) { return r.toolName === 'render_component'; })
            .map(function (r) { return r.result; });
    };
    /**
     * 生成下一步建议
     */
    UnifiedIntelligenceService.prototype.generateNextActions = function (analysis) {
        var actions = [];
        switch (analysis.intent) {
            case IntentType.PAGE_OPERATION:
                actions.push('验证操作结果', '继续下一步操作', '返回上一页');
                break;
            case IntentType.TASK_MANAGEMENT:
                actions.push('更新任务状态', '添加新任务', '查看任务详情');
                break;
            case IntentType.DATA_VISUALIZATION:
                actions.push('切换图表类型', '导出数据', '设置筛选条件');
                break;
            default:
                actions.push('继续对话', '查看详细信息', '获取更多帮助');
        }
        return actions;
    };
    /**
     * 创建错误响应
     */
    UnifiedIntelligenceService.prototype.createErrorResponse = function (error, executionTime) {
        // 🚀 修复：提供更友好的错误信息而不是"抱歉"
        var userFriendlyMessage = "AI\u670D\u52A1\u6682\u65F6\u9047\u5230\u4E86\u4E00\u4E9B\u95EE\u9898\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002\u5982\u679C\u95EE\u9898\u6301\u7EED\u5B58\u5728\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u3002\n\n\u6280\u672F\u4FE1\u606F\uFF1A".concat(error.message);
        return {
            success: false,
            data: {
                message: userFriendlyMessage,
                toolExecutions: [],
                uiComponents: [],
                recommendations: [
                    {
                        title: '重试请求',
                        description: '可以尝试重新发送请求',
                        action: 'retry',
                        priority: 'high'
                    }
                ]
            },
            metadata: {
                executionTime: executionTime,
                toolsUsed: [],
                confidenceScore: 0.1,
                nextSuggestedActions: ['重试', '简化请求', '寻求帮助'],
                complexity: TaskComplexity.SIMPLE,
                approach: 'error_handling'
            },
            error: error.message
        };
    };
    // 辅助方法
    UnifiedIntelligenceService.prototype.getIntentText = function (intent) {
        var _a;
        var intentMap = (_a = {},
            _a[IntentType.PAGE_OPERATION] = '页面操作',
            _a[IntentType.DATA_VISUALIZATION] = '数据可视化',
            _a[IntentType.TASK_MANAGEMENT] = '任务管理',
            _a[IntentType.EXPERT_CONSULTATION] = '专家咨询',
            _a[IntentType.INFORMATION_QUERY] = '信息查询',
            _a[IntentType.COMPLEX_WORKFLOW] = '复杂工作流',
            _a);
        return intentMap[intent] || '未知意图';
    };
    UnifiedIntelligenceService.prototype.getComplexityText = function (complexity) {
        var _a;
        var complexityMap = (_a = {},
            _a[TaskComplexity.SIMPLE] = '简单',
            _a[TaskComplexity.MODERATE] = '中等',
            _a[TaskComplexity.COMPLEX] = '复杂',
            _a[TaskComplexity.VERY_COMPLEX] = '非常复杂',
            _a);
        return complexityMap[complexity] || '未知';
    };
    UnifiedIntelligenceService.prototype.getApproachDescription = function (intent) {
        var _a;
        var approachMap = (_a = {},
            _a[IntentType.PAGE_OPERATION] = '页面感知 + DOM操作',
            _a[IntentType.DATA_VISUALIZATION] = '数据处理 + 图表渲染',
            _a[IntentType.TASK_MANAGEMENT] = '任务分解 + 进度管理',
            _a[IntentType.EXPERT_CONSULTATION] = '专家匹配 + 咨询分析',
            _a[IntentType.INFORMATION_QUERY] = '智能查询 + 结果整理',
            _a[IntentType.COMPLEX_WORKFLOW] = '多维分析 + 协同执行',
            _a);
        return approachMap[intent] || '标准处理';
    };
    UnifiedIntelligenceService.prototype.getToolDisplayName = function (toolName) {
        var nameMap = {
            'get_page_structure': '页面结构扫描',
            'navigate_to_page': '智能导航',
            'analyze_task_complexity': '复杂度分析',
            'create_todo_list': '任务清单创建',
            'render_component': '数据可视化',
            'call_expert': '专家咨询',
            'validate_page_state': '状态验证',
            'any_query': '智能查询'
        };
        return nameMap[toolName] || toolName;
    };
    /**
     * 获取Function Tools定义（使用统一工具注册中心）
     */
    UnifiedIntelligenceService.prototype.getFunctionToolsDefinition = function () {
        // 🚀 使用统一工具注册中心
        var _a = require('../ai/tools/core/tool-registry.service'), toolRegistry = _a.toolRegistry, ToolScenario = _a.ToolScenario;
        var tools = toolRegistry.getToolsForScenario(ToolScenario.UNIFIED_INTELLIGENCE, {
            includeWebSearch: true
        });
        console.log("\u2705 [UnifiedIntelligence] \u4ECE\u5DE5\u5177\u6CE8\u518C\u4E2D\u5FC3\u83B7\u53D6 ".concat(tools.length, " \u4E2A\u5DE5\u5177"));
        return tools;
        // 🔴 旧的硬编码工具定义已废弃，保留注释供参考
        /*
        return [
          {
            type: 'function',
            function: {
              name: 'query_past_activities',
              description: '查询历史活动数据',
              parameters: {
                type: 'object',
                properties: {
                  limit: {
                    type: 'integer',
                    default: 10,
                    description: '返回结果数量限制'
                  }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'get_activity_statistics',
              description: '获取活动统计信息和分析数据',
              parameters: {
                type: 'object',
                properties: {
                  period: {
                    type: 'string',
                    description: '统计周期：month、quarter、year',
                    default: 'month'
                  }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'query_enrollment_history',
              description: '查询招生历史数据',
              parameters: {
                type: 'object',
                properties: {
                  limit: {
                    type: 'integer',
                    default: 10,
                    description: '返回结果数量限制'
                  }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'analyze_business_trends',
              description: '分析业务趋势和发展状况',
              parameters: {
                type: 'object',
                properties: {
                  timeRange: {
                    type: 'string',
                    description: '分析时间范围：3months、6months、year',
                    default: '6months'
                  }
                }
              }
            }
          },
    
          {
            type: 'function',
            function: {
              name: 'navigate_to_page',
              description: '导航到指定页面',
              parameters: {
                type: 'object',
                properties: {
                  pageName: {
                    type: 'string',
                    description: '页面名称，如：activity_center、dashboard、student_management、new_media_center、media_center等'
                  }
                },
                required: ['pageName']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'capture_screen',
              description: '截取页面截图查看当前状态',
              parameters: {
                type: 'object',
                properties: {
                  element: {
                    type: 'string',
                    description: '要截取的元素选择器，留空表示整个页面'
                  }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'any_query',
              description: `🚀 智能API查询工具 - 基于API分组的查询模式
    
    **核心能力**:
    1. 自动识别查询涉及的API分组(学生、教师、班级、活动等)
    2. 生成API调用计划并执行
    3. 整合多个API的查询结果
    4. 支持复杂的多步骤查询
    
    **适用场景**:
    - ✅ 跨多个业务域的复杂查询
    - ✅ 需要整合多个API结果的查询
    - ✅ 统计分析类查询
    
    **不适用场景**:
    - ❌ 简单的单表查询 (应该直接调用对应API)
    - ❌ 单一CRUD操作 (使用create/update/delete工具)
    
    **重要提示**:
    - 一次调用即可完成查询,无需重复调用
    - 工具会自动识别所需的API分组
    - 结果已经过AI整合和格式化
    
    **示例**:
    - "查询所有班级的学生人数和教师信息" → 自动调用班级API和教师API
    - "统计本月活动参与率最高的前5个活动" → 自动调用活动API和统计API
    `,
              parameters: {
                type: 'object',
                properties: {
                  userQuery: {
                    type: 'string',
                    description: '用户的原始查询需求（完整描述）'
                  },
                  queryType: {
                    type: 'string',
                    description: '查询类型：statistical（统计分析）、detailed（详细数据）、comparison（对比分析）、trend（趋势分析）',
                    default: 'detailed'
                  },
                  expectedFormat: {
                    type: 'string',
                    description: '期望的返回格式：table（表格）、chart（图表）、summary（摘要）、mixed（混合）',
                    default: 'mixed'
                  }
                },
                required: ['userQuery']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'web_search',
              description: '执行网络搜索，获取最新的教育政策、行业资讯等信息',
              parameters: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: '搜索查询词，如：最新学前教育政策、9月1日社保政策等'
                  },
                  searchType: {
                    type: 'string',
                    description: '搜索类型：policy（政策法规）、industry（行业资讯）、research（研究报告）、general（综合搜索）',
                    default: 'general'
                  }
                },
                required: ['query']
              }
            }
          },
          // 🔴 强制性工具：基于Anthropic最佳实践的任务管理工具
          {
            type: 'function',
            function: {
              name: 'analyze_task_complexity',
              description: '分析任务复杂度，判断是否需要创建TodoList进行任务分解',
              parameters: {
                type: 'object',
                properties: {
                  userInput: {
                    type: 'string',
                    description: '用户的原始输入或查询'
                  },
                  context: {
                    type: 'string',
                    description: '当前上下文信息',
                    default: ''
                  }
                },
                required: ['userInput']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'create_todo_list',
              description: '为复杂任务创建待办事项清单，支持任务分解和优先级管理',
              parameters: {
                type: 'object',
                properties: {
                  title: {
                    type: 'string',
                    description: '任务清单的标题'
                  },
                  description: {
                    type: 'string',
                    description: '任务清单的描述',
                    default: ''
                  },
                  tasks: {
                    type: 'array',
                    description: '任务列表',
                    items: {
                      type: 'object',
                      properties: {
                        title: { type: 'string', description: '任务标题' },
                        description: { type: 'string', description: '任务描述' },
                        priority: { type: 'string', enum: ['high', 'medium', 'low'], default: 'medium' },
                        status: { type: 'string', enum: ['pending', 'in_progress', 'completed'], default: 'pending' }
                      },
                      required: ['title']
                    },
                    default: []
                  }
                },
                required: ['title']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'update_todo_task',
              description: '更新TodoList中的任务状态或信息',
              parameters: {
                type: 'object',
                properties: {
                  taskId: {
                    type: 'string',
                    description: '任务ID'
                  },
                  status: {
                    type: 'string',
                    enum: ['pending', 'in_progress', 'completed'],
                    description: '新的任务状态'
                  },
                  notes: {
                    type: 'string',
                    description: '更新说明或备注',
                    default: ''
                  }
                },
                required: ['taskId', 'status']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'get_todo_list',
              description: '获取当前的TodoList状态和任务进度',
              parameters: {
                type: 'object',
                properties: {
                  listId: {
                    type: 'string',
                    description: '任务清单ID，留空获取最新的清单',
                    default: ''
                  }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'delete_todo_task',
              description: '删除TodoList中的指定任务',
              parameters: {
                type: 'object',
                properties: {
                  taskId: {
                    type: 'string',
                    description: '要删除的任务ID'
                  },
                  reason: {
                    type: 'string',
                    description: '删除原因',
                    default: ''
                  }
                },
                required: ['taskId']
              }
            }
          }
          ,
          {
            type: 'function',
            function: {
              name: 'render_component',
              description: '在前端渲染指定的UI组件用于展示数据/图表/卡片',
              parameters: {
                type: 'object',
                properties: {
                  component_type: { type: 'string', description: '组件类型：table、card、chart 等' },
                  title: { type: 'string', description: '组件标题' },
                  data: { type: 'object', description: '要展示的数据对象' },
                  chart_type: { type: 'string', description: '当 component_type=chart 时的图表类型：bar、line、pie 等' },
                  options: { type: 'object', description: '组件渲染选项，如列定义、样式等' }
                },
                required: ['component_type', 'title']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'get_expert_list',
              description: '获取专家列表（姓名/领域/可约时间）',
              parameters: {
                type: 'object',
                properties: {
                  domain: { type: 'string', description: '专家领域过滤，如：early_education、marketing' }
                }
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'consult_recruitment_planner',
              description: '咨询招生策划师，获取针对性招生策略建议',
              parameters: {
                type: 'object',
                properties: {
                  query: { type: 'string', description: '咨询问题', },
                  context: { type: 'string', description: '学校/地区/时间等上下文，非必填', default: '' }
                },
                required: ['query']
              }
            }
          },
          {
            type: 'function',
            function: {
              name: 'navigate_back',
              description: '浏览器后退到上一页或多级返回',
              parameters: {
                type: 'object',
                properties: {
                  steps: { type: 'integer', description: '返回步数', default: 1 },
                  options: { type: 'object', description: '返回选项（保留滚动位置等）' }
                }
              }
            }
          }
    
        ];
        */
    };
    /**
     * 执行Function Tool（从原Function Tools系统移植）
     */
    UnifiedIntelligenceService.prototype.executeFunctionTool = function (toolCall, request, progressCallback) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var toolName, rawArgs, args, type, period, mapPeriod, st, webSearchTool, query, maxResults, searchResponse, searchError_1, ToolLoaderService_2, loader, defs, toolDef, execResult, legacyResult, fallbackErr_1, errorMessage, legacyResult, error_14;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        toolName = ((_a = toolCall["function"]) === null || _a === void 0 ? void 0 : _a.name) || toolCall.name;
                        rawArgs = typeof ((_b = toolCall["function"]) === null || _b === void 0 ? void 0 : _b.arguments) === 'string'
                            ? (function () { try {
                                return JSON.parse(toolCall["function"].arguments);
                            }
                            catch (_a) {
                                return toolCall["function"].arguments;
                            } })()
                            : (((_c = toolCall["function"]) === null || _c === void 0 ? void 0 : _c.arguments) || toolCall.arguments || {});
                        args = __assign({}, (rawArgs || {}));
                        // 🎯 注入用户上下文（用于CRUD工具等需要用户信息的工具）
                        args.__userContext = {
                            userId: request.userId,
                            conversationId: request.conversationId,
                            context: request.context
                        };
                        // 1) navigate_to_page: 允许 pageName/page/page_path 同义
                        if (toolName === 'navigate_to_page') {
                            if (!args.page && (args.pageName || args.page_path)) {
                                args.page = args.pageName || args.page_path;
                            }
                        }
                        // 2) capture_screen: 兼容 capture_type/element_selector/area/options -> fullPage/selector
                        if (toolName === 'capture_screen') {
                            type = args.capture_type || args.type;
                            if (type === 'full_page')
                                args.fullPage = true;
                            if (type === 'viewport')
                                args.fullPage = false;
                            if (type === 'element' && args.element_selector)
                                args.selector = args.element_selector;
                            // 其余字段保留给前端 UI 指令使用
                        }
                        // 3) get_activity_statistics: 兼容 period/time_period/statistic_type -> metrics/timeRange
                        if (toolName === 'get_activity_statistics') {
                            period = args.time_period || args.period;
                            mapPeriod = function (p) { return ({ month: 'last_month', quarter: 'last_quarter', year: 'last_year' }[p] || 'last_month'); };
                            if (period)
                                args.timeRange = mapPeriod(String(period));
                            // 若未提供 metrics，根据 statistic_type 或默认给一组通用指标
                            if (!args.metrics || !Array.isArray(args.metrics) || args.metrics.length === 0) {
                                st = args.statistic_type || 'summary';
                                if (st === 'participation')
                                    args.metrics = ['total_activities', 'average_participants', 'activity_frequency'];
                                else if (st === 'effectiveness')
                                    args.metrics = ['satisfaction_score', 'success_rate'];
                                else if (st === 'trends')
                                    args.metrics = ['activity_frequency', 'popular_time_slots'];
                                else
                                    args.metrics = ['total_activities', 'average_participants', 'success_rate', 'satisfaction_score'];
                            }
                        }
                        console.log("\uD83D\uDD27 \u5F00\u59CB\u6267\u884CFunction\u5DE5\u5177: ".concat(toolName, "\uFF0C\u53C2\u6570:"), args);
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 15, , 16]);
                        if (!(toolName === 'web_search')) return [3 /*break*/, 6];
                        console.log('📡 执行真实网络搜索:', args.query || args.userQuery || '');
                        _d.label = 2;
                    case 2:
                        _d.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/tools/web-operation/web-search.tool')); })];
                    case 3:
                        webSearchTool = (_d.sent()).webSearchTool;
                        query = args.query || args.userQuery;
                        maxResults = args.count || args.maxResults || 5;
                        return [4 /*yield*/, webSearchTool.search(query, { maxResults: maxResults, enableAISummary: true })];
                    case 4:
                        searchResponse = _d.sent();
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    query: query,
                                    results: searchResponse.results,
                                    total: searchResponse.totalResults,
                                    summary: searchResponse.aiSummary,
                                    timeCost: searchResponse.searchTime
                                },
                                message: '网络搜索成功(Volcano)'
                            }];
                    case 5:
                        searchError_1 = _d.sent();
                        console.error('❌ 网络搜索失败:', searchError_1);
                        return [2 /*return*/, {
                                success: true,
                                data: {
                                    query: args.query || args.userQuery,
                                    results: [{ title: "\u5173\u4E8E\"".concat(args.query || args.userQuery, "\"\u7684\u4FE1\u606F"), url: 'https://example.com', snippet: "\u8FD9\u662F\u5173\u4E8E\"".concat(args.query || args.userQuery, "\"\u7684\u76F8\u5173\u4FE1\u606F\u3002"), source: 'mock_fallback' }],
                                    total: 1,
                                    source: 'mock_search_fallback'
                                },
                                message: '网络搜索完成（使用模拟数据）'
                            }];
                    case 6:
                        // 直接尝试使用新工具加载器系统
                        console.log("\uD83D\uDD04 [UnifiedIntelligence] \u5C1D\u8BD5\u4F7F\u7528\u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C: ".concat(toolName));
                        _d.label = 7;
                    case 7:
                        _d.trys.push([7, 13, , 14]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/tools/core/tool-loader.service')); })];
                    case 8:
                        ToolLoaderService_2 = (_d.sent()).ToolLoaderService;
                        loader = new ToolLoaderService_2();
                        return [4 /*yield*/, loader.loadTools([toolName])];
                    case 9:
                        defs = _d.sent();
                        toolDef = defs[0];
                        if (!(toolDef && typeof toolDef.implementation === 'function')) return [3 /*break*/, 11];
                        console.log("\u2705 [UnifiedIntelligence] \u901A\u8FC7\u65B0\u5DE5\u5177\u7CFB\u7EDF\u627E\u5230\u5DE5\u5177: ".concat(toolName));
                        return [4 /*yield*/, toolDef.implementation(args)];
                    case 10:
                        execResult = _d.sent();
                        console.log("\u2705 ".concat(toolName, " \u901A\u8FC7\u65B0\u5DE5\u5177\u5B9E\u73B0\u6267\u884C\u5B8C\u6210"));
                        return [2 /*return*/, execResult]; // 已是 ToolResult 形态
                    case 11:
                        console.warn("\u26A0\uFE0F [UnifiedIntelligence] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5DE5\u5177: ".concat(toolName));
                        legacyResult = { status: 'error', error: "\u5DE5\u5177 ".concat(toolName, " \u5728\u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5B9E\u73B0") };
                        return [2 /*return*/, legacyResult];
                    case 12: return [3 /*break*/, 14];
                    case 13:
                        fallbackErr_1 = _d.sent();
                        console.error("\u274C [UnifiedIntelligence] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C\u5931\u8D25: ".concat(toolName), fallbackErr_1);
                        errorMessage = fallbackErr_1 instanceof Error ? fallbackErr_1.message : '未知错误';
                        legacyResult = { status: 'error', error: "\u5DE5\u5177 ".concat(toolName, " \u6267\u884C\u5931\u8D25: ").concat(errorMessage) };
                        console.log("\u274C ".concat(toolName, " \u6267\u884C\u5931\u8D25\uFF0C\u7ED3\u679C:"), legacyResult);
                        return [2 /*return*/, legacyResult];
                    case 14: return [3 /*break*/, 16];
                    case 15:
                        error_14 = _d.sent();
                        console.error("\u274C Function\u5DE5\u5177\u6267\u884C\u5931\u8D25: ".concat(toolName), error_14);
                        return [2 /*return*/, {
                                success: false,
                                error: 'Function工具调用失败',
                                message: error_14 instanceof Error ? error_14.message : '未知错误'
                            }];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行Function Tool（使用统一工具执行器 - 新版本）
     * 🚀 这是新的统一执行器版本，逐步替代上面的旧版本
     */
    UnifiedIntelligenceService.prototype.executeFunctionToolV2 = function (toolCall, request, progressCallback) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var toolExecutor, toolName, args, result, error_15;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        toolExecutor = require('../ai/tools/core/tool-executor.service').toolExecutor;
                        toolName = ((_a = toolCall["function"]) === null || _a === void 0 ? void 0 : _a.name) || toolCall.name;
                        args = ((_b = toolCall["function"]) === null || _b === void 0 ? void 0 : _b.arguments) || toolCall.arguments || {};
                        console.log("\uD83D\uDD27 [UnifiedIntelligence-V2] \u6267\u884C\u5DE5\u5177: ".concat(toolName));
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, toolExecutor.execute({
                                name: toolName,
                                arguments: args,
                                id: toolCall.id
                            })];
                    case 2:
                        result = _c.sent();
                        return [2 /*return*/, result];
                    case 3:
                        error_15 = _c.sent();
                        console.error("\u274C [UnifiedIntelligence-V2] \u5DE5\u5177\u6267\u884C\u5931\u8D25: ".concat(toolName), error_15);
                        return [2 /*return*/, {
                                success: false,
                                error: error_15.message || '工具执行失败',
                                metadata: { name: toolName }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取豆包模型配置
     */
    UnifiedIntelligenceService.prototype.getDoubaoModelConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var AIModelConfig_2, modelConfig, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
                    case 1:
                        AIModelConfig_2 = (_a.sent()).AIModelConfig;
                        return [4 /*yield*/, AIModelConfig_2.findOne({
                                where: {
                                    name: 'doubao-seed-1-6-thinking-250615',
                                    status: 'active'
                                }
                            })];
                    case 2:
                        modelConfig = _a.sent();
                        if (!modelConfig) {
                            throw new Error('未找到活跃的豆包模型配置');
                        }
                        return [2 /*return*/, modelConfig];
                    case 3:
                        error_16 = _a.sent();
                        console.error('获取豆包模型配置失败:', error_16);
                        // 返回默认配置作为备用
                        return [2 /*return*/, {
                                name: 'doubao-seed-1-6-thinking-250615',
                                endpointUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
                                apiKey: '1c155dc7-0cec-441b-9b00-0fb8ccc16089',
                                modelParameters: {
                                    temperature: 0.7,
                                    maxTokens: 2000
                                }
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理流式响应
     */
    UnifiedIntelligenceService.prototype.handleStreamResponse = function (response, progressCallback, iterationCount, allowTools, allowWeb) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 🚨🚨🚨🚨🚨 强制日志：验证新代码是否被执行
                console.log('🚨🚨🚨🚨🚨 [CRITICAL-VERIFICATION] handleStreamResponse 方法已执行！这是新代码！');
                console.log('🚨🚨🚨🚨🚨 [CRITICAL-VERIFICATION] 时间戳:', new Date().toISOString());
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var fullContent = '';
                        var fullReasoningContent = ''; // 🔧 新增：累加思考内容
                        var fullResponse = null;
                        var buffer = '';
                        var lastProgressUpdate = 0;
                        var lastReasoningUpdate = 0; // 🔧 新增：思考内容更新时间戳
                        var progressUpdateInterval = 500; // 500ms更新一次进度，避免无限重复
                        var streamTimeout;
                        // 👇 精简流日志：默认仅在开始/结束各打一条；设置 AI_STREAM_VERBOSE=1 可开启逐行调试
                        var STREAM_VERBOSE = process.env.AI_STREAM_VERBOSE === '1';
                        var sseChunkCount = 0;
                        // 🚨🚨🚨 强制日志：验证变量初始化
                        console.log('🚨🚨🚨 [VERIFICATION] fullReasoningContent 变量已初始化:', fullReasoningContent);
                        var estimateTokens = function (text) {
                            if (!text)
                                return 0;
                            var cjk = (text.match(/[\u4e00-\u9fff]/g) || []).length;
                            var nonCjk = text.length - cjk;
                            // 约定：中文≈1 token/字，其他≈4 字符/1 token
                            return cjk + Math.ceil(nonCjk / 4);
                        };
                        console.log("\uD83D\uDCE5 [Stream] \u5F00\u59CB\u63A5\u53D7\u6D41\u5F0F\u56DE\u590D (\u7B2C".concat(iterationCount, "\u8F6E)..."));
                        progressCallback("\uD83D\uDD04 \u5F00\u59CB\u5904\u7406AI\u6D41\u5F0F\u54CD\u5E94...");
                        // 检查响应对象是否有效
                        if (!response) {
                            console.error("\u274C \u54CD\u5E94\u5BF9\u8C61\u4E3A\u7A7A (\u7B2C".concat(iterationCount, "\u8F6E)"));
                            reject(new Error('响应对象为空'));
                            return;
                        }
                        // 设置流式响应超时（60秒）- 复杂任务需要更多思考时间
                        streamTimeout = setTimeout(function () {
                            console.warn("\u26A0\uFE0F \u6D41\u5F0F\u54CD\u5E94\u8D85\u65F6 (\u7B2C".concat(iterationCount, "\u8F6E)\uFF0C\u5F3A\u5236\u7ED3\u675F"));
                            progressCallback("\u26A0\uFE0F AI\u54CD\u5E94\u8D85\u65F6\uFF0860\u79D2\uFF09\uFF0C\u4F7F\u7528\u5F53\u524D\u5185\u5BB9");
                            // 🔧 如果有思考内容但没有最终回复，使用思考内容作为回复
                            var timeoutContent = fullContent || fullReasoningContent || '响应超时，请重试';
                            var timeoutResponse = {
                                choices: [{
                                        message: {
                                            role: 'assistant',
                                            content: timeoutContent,
                                            reasoning_content: fullReasoningContent || undefined,
                                            tool_calls: (fullResponse === null || fullResponse === void 0 ? void 0 : fullResponse.tool_calls) || null
                                        }
                                    }]
                            };
                            resolve(timeoutResponse);
                        }, 60000); // 复杂任务需要更多思考时间
                        // AIBridgeService 返回的是直接的 Readable 流对象，不是包含 data 属性的响应对象
                        var stream = response.data || response;
                        if (!stream || typeof stream.on !== 'function') {
                            console.error("\u274C \u6D41\u5BF9\u8C61\u65E0\u6548 (\u7B2C".concat(iterationCount, "\u8F6E):"), typeof stream);
                            reject(new Error('流对象无效'));
                            return;
                        }
                        stream.on('data', function (chunk) {
                            var _a, _b;
                            var chunkStr = chunk.toString();
                            if (STREAM_VERBOSE)
                                console.log("\uD83D\uDD0D [Stream-Raw] \u6536\u5230\u539F\u59CBchunk (\u957F\u5EA6=".concat(chunkStr.length, "):"), chunkStr.substring(0, 200));
                            sseChunkCount++;
                            buffer += chunkStr;
                            // 处理多个SSE数据块
                            var lines = buffer.split('\n');
                            buffer = lines.pop() || ''; // 保留最后一行（可能是不完整的）
                            if (STREAM_VERBOSE)
                                console.log("\uD83D\uDD0D [Stream-Lines] \u5206\u5272\u540E\u884C\u6570: ".concat(lines.length));
                            for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
                                var line = lines_1[_i];
                                if (line.trim() === '')
                                    continue;
                                if (STREAM_VERBOSE)
                                    console.log("\uD83D\uDD0D [Stream-Line] \u5904\u7406\u884C:", line.substring(0, 100));
                                if (line.startsWith('data: ')) {
                                    var data = line.slice(6).trim();
                                    if (STREAM_VERBOSE)
                                        console.log("\uD83D\uDD0D [Stream-Data] \u63D0\u53D6data:", data.substring(0, 100));
                                    if (data === '[DONE]') {
                                        if (STREAM_VERBOSE)
                                            console.log("\u2705 [Stream] \u5355\u8F6E\u54CD\u5E94\u5B8C\u6210 (\u7B2C".concat(iterationCount, "\u8F6E)"));
                                        progressCallback("\u2705 AI\u6D41\u5F0F\u54CD\u5E94\u5B8C\u6210");
                                        // 清理超时定时器
                                        if (streamTimeout) {
                                            clearTimeout(streamTimeout);
                                        }
                                        // 🔧 如果有思考内容但没有最终回复，使用思考内容作为回复
                                        var finalContent = fullContent;
                                        if (!finalContent && fullReasoningContent) {
                                            console.log("\uD83D\uDD27 [Fix] \u8C46\u5305\u6A21\u578B\u53EA\u8FD4\u56DE\u601D\u8003\u5185\u5BB9\uFF0C\u4F7F\u7528\u601D\u8003\u5185\u5BB9\u4F5C\u4E3A\u6700\u7EC8\u56DE\u590D");
                                            finalContent = fullReasoningContent;
                                        }
                                        // 构建最终响应格式
                                        var finalResponse = {
                                            choices: [{
                                                    message: {
                                                        role: 'assistant',
                                                        content: finalContent,
                                                        reasoning_content: fullReasoningContent || undefined,
                                                        tool_calls: (fullResponse === null || fullResponse === void 0 ? void 0 : fullResponse.tool_calls) || null
                                                    }
                                                }]
                                        };
                                        resolve(finalResponse);
                                        return;
                                    }
                                    try {
                                        var jsonData = JSON.parse(data);
                                        // 🔍 调试：打印每个流式数据块
                                        if (STREAM_VERBOSE)
                                            console.log("\uD83D\uDD0D [Stream-Debug] \u6536\u5230\u6570\u636E\u5757:", JSON.stringify(jsonData).substring(0, 200));
                                        if (jsonData.choices && jsonData.choices[0]) {
                                            var choice = jsonData.choices[0];
                                            // 🔍 处理delta格式（流式增量）
                                            if (choice.delta) {
                                                var delta = choice.delta;
                                                // 🚨🚨🚨 验证日志：打印delta对象的所有字段
                                                console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [DELTA-DEBUG] Delta\u5BF9\u8C61\u5B57\u6BB5:", Object.keys(delta));
                                                console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [DELTA-DEBUG] Delta\u5B8C\u6574\u5185\u5BB9:", JSON.stringify(delta));
                                                // 🔧 处理思考内容 (reasoning_content) - 豆包thinking模型
                                                if (delta.reasoning_content) {
                                                    console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [REASONING-FOUND] \u53D1\u73B0reasoning_content\u5B57\u6BB5\uFF01");
                                                    // 累加思考内容
                                                    fullReasoningContent += delta.reasoning_content;
                                                    // 限制思考内容更新频率，避免无限重复输出
                                                    var now = Date.now();
                                                    if (now - lastReasoningUpdate > progressUpdateInterval) {
                                                        var reasoningPreview_1 = fullReasoningContent.length > 100 ?
                                                            fullReasoningContent.substring(fullReasoningContent.length - 100) + '...' : fullReasoningContent;
                                                        progressCallback("\uD83E\uDD14 AI\u6B63\u5728\u601D\u8003: ".concat(reasoningPreview_1));
                                                        lastReasoningUpdate = now;
                                                    }
                                                    // 打印日志
                                                    var reasoningPreview = delta.reasoning_content.length > 50 ?
                                                        delta.reasoning_content.substring(0, 50) + '...' : delta.reasoning_content;
                                                    console.log("\uD83E\uDD14 [Reasoning] ".concat(reasoningPreview));
                                                }
                                                else {
                                                    console.log("\uD83D\uDEA8\uD83D\uDEA8\uD83D\uDEA8 [REASONING-NOT-FOUND] \u672A\u53D1\u73B0reasoning_content\u5B57\u6BB5");
                                                }
                                                // 累加文本内容
                                                if (delta.content) {
                                                    fullContent += delta.content;
                                                    // 限制进度更新频率，避免无限重复输出
                                                    var now = Date.now();
                                                    if (now - lastProgressUpdate > progressUpdateInterval) {
                                                        var preview = fullContent.length > 100 ?
                                                            fullContent.substring(0, 100) + '...' : fullContent;
                                                        progressCallback("\uD83D\uDCAC AI\u6B63\u5728\u56DE\u590D: ".concat(preview));
                                                        lastProgressUpdate = now;
                                                    }
                                                }
                                                // 处理工具调用（当允许工具或启用网页搜索时）
                                                if ((allowTools || allowWeb) && delta.tool_calls) {
                                                    if (STREAM_VERBOSE)
                                                        console.log("\uD83D\uDD27 [Stream-Debug] \u68C0\u6D4B\u5230delta.tool_calls:", JSON.stringify(delta.tool_calls));
                                                    fullResponse = fullResponse || { tool_calls: [] };
                                                    fullResponse.tool_calls = fullResponse.tool_calls || [];
                                                    // 合并工具调用数据
                                                    delta.tool_calls.forEach(function (toolCall, index) {
                                                        var _a, _b, _c;
                                                        if (!fullResponse.tool_calls[index]) {
                                                            fullResponse.tool_calls[index] = {
                                                                id: toolCall.id,
                                                                type: toolCall.type,
                                                                "function": { name: ((_a = toolCall["function"]) === null || _a === void 0 ? void 0 : _a.name) || '', arguments: '' }
                                                            };
                                                            // 只在新工具调用时更新进度，避免重复输出
                                                            var now = Date.now();
                                                            if (now - lastProgressUpdate > progressUpdateInterval) {
                                                                progressCallback("\uD83D\uDD27 \u68C0\u6D4B\u5230\u5DE5\u5177\u8C03\u7528: ".concat(((_b = toolCall["function"]) === null || _b === void 0 ? void 0 : _b.name) || '未知工具'));
                                                                lastProgressUpdate = now;
                                                            }
                                                        }
                                                        if ((_c = toolCall["function"]) === null || _c === void 0 ? void 0 : _c.arguments) {
                                                            fullResponse.tool_calls[index]["function"].arguments += toolCall["function"].arguments;
                                                        }
                                                    });
                                                }
                                            }
                                            // 🔍 处理message格式（完整消息）
                                            if (choice.message) {
                                                var message = choice.message;
                                                if (STREAM_VERBOSE)
                                                    console.log("\uD83D\uDD27 [Stream-Debug] \u68C0\u6D4B\u5230message:", JSON.stringify(message).substring(0, 200));
                                                if (message.content) {
                                                    fullContent = message.content;
                                                }
                                                if ((allowTools || allowWeb) && message.tool_calls) {
                                                    if (STREAM_VERBOSE)
                                                        console.log("\uD83D\uDD27 [Stream-Debug] \u68C0\u6D4B\u5230message.tool_calls:", JSON.stringify(message.tool_calls));
                                                    fullResponse = fullResponse || { tool_calls: [] };
                                                    fullResponse.tool_calls = message.tool_calls;
                                                    progressCallback("\uD83D\uDD27 \u68C0\u6D4B\u5230\u5DE5\u5177\u8C03\u7528: ".concat(((_b = (_a = message.tool_calls[0]) === null || _a === void 0 ? void 0 : _a["function"]) === null || _b === void 0 ? void 0 : _b.name) || '未知工具'));
                                                }
                                            }
                                        }
                                    }
                                    catch (parseError) {
                                        console.warn('解析流式数据失败:', parseError);
                                    }
                                }
                            }
                        });
                        stream.on('end', function () {
                            var approxTokens = estimateTokens(fullContent || '');
                            console.log("\u2705 [Stream] \u63A5\u53D7\u5B8C\u6BD5\uFF1A\u8F93\u51FA\u2248".concat(approxTokens, " tokens\uFF0C\u6570\u636E\u5757=").concat(sseChunkCount, "\uFF0C\u957F\u5EA6=").concat(fullContent.length, " (\u7B2C").concat(iterationCount, "\u8F6E)"));
                            // 清理超时定时器
                            if (streamTimeout) {
                                clearTimeout(streamTimeout);
                            }
                            // 如果没有通过[DONE]结束，手动结束
                            var finalResponse = {
                                choices: [{
                                        message: {
                                            role: 'assistant',
                                            content: fullContent,
                                            tool_calls: (fullResponse === null || fullResponse === void 0 ? void 0 : fullResponse.tool_calls) || null
                                        }
                                    }]
                            };
                            resolve(finalResponse);
                        });
                        stream.on('error', function (error) {
                            console.error("\u274C \u6D41\u5F0F\u54CD\u5E94\u9519\u8BEF (\u7B2C".concat(iterationCount, "\u8F6E):"), error);
                            progressCallback("\u274C AI\u6D41\u5F0F\u54CD\u5E94\u9519\u8BEF");
                            // 清理超时定时器
                            if (streamTimeout) {
                                clearTimeout(streamTimeout);
                            }
                            reject(error);
                        });
                    })];
            });
        });
    };
    /**
     * 🆕 SSE流式处理用户请求 - 单次调用版本（用于前端多轮调用架构）
     * @param request 用户请求
     * @param res Express Response对象，用于SSE流式推送
     */
    UnifiedIntelligenceService.prototype.processUserRequestStreamSingleRound = function (request, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var sendSSE, isFirstRound, securityCheck, error_17;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('🎯 [单次调用] 开始流式处理用户请求（单次调用模式）');
                        console.log('📝 [单次调用] 请求内容:', request.content);
                        console.log('👤 [单次调用] 用户ID:', request.userId);
                        console.log('💬 [单次调用] 会话ID:', request.conversationId);
                        console.log('🔢 [单次调用] 当前轮次:', ((_a = request === null || request === void 0 ? void 0 : request.context) === null || _a === void 0 ? void 0 : _a.currentRound) || 1);
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        // 设置SSE响应头
                        res.writeHead(200, {
                            'Content-Type': 'text/event-stream',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                            'X-Accel-Buffering': 'no',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Cache-Control'
                        });
                        sendSSE = function (event, data) {
                            var _a;
                            var sseData = "event: ".concat(event, "\ndata: ").concat(JSON.stringify(data), "\n\n");
                            res.write(sseData);
                            (_a = res.flushHeaders) === null || _a === void 0 ? void 0 : _a.call(res); // 🔧 立即刷新响应头，确保事件立即发送
                            console.log("\uD83D\uDCE1 [SSE\u63A8\u9001] \u4E8B\u4EF6: ".concat(event), typeof data === 'string' ? data.substring(0, 100) : JSON.stringify(data).substring(0, 100));
                        };
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 5, 6, 7]);
                        // 1. 开始处理
                        sendSSE('start', { message: '🔗 正在连接AI服务...' });
                        isFirstRound = !((_b = request === null || request === void 0 ? void 0 : request.context) === null || _b === void 0 ? void 0 : _b.currentRound) || request.context.currentRound === 1;
                        if (!isFirstRound) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.performSecurityCheck(request)];
                    case 2:
                        securityCheck = _c.sent();
                        if (!securityCheck.allowed) {
                            sendSSE('error', {
                                message: '🚨 权限检查失败: ' + securityCheck.reason,
                                error: securityCheck
                            });
                            res.end();
                            return [2 /*return*/];
                        }
                        _c.label = 3;
                    case 3:
                        // 3. 发送思考开始状态
                        sendSSE('thinking_start', { message: '🤔 AI开始思考...' });
                        // 4. 调用单次AI调用 + 工具执行
                        return [4 /*yield*/, this.callDoubaoSingleRoundSSE(request, sendSSE)];
                    case 4:
                        // 4. 调用单次AI调用 + 工具执行
                        _c.sent();
                        // 5. 立即关闭SSE流
                        console.log('🔚 [单次调用] 立即关闭SSE流');
                        res.end();
                        return [3 /*break*/, 7];
                    case 5:
                        error_17 = _c.sent();
                        console.error('❌ [单次调用] 流式处理错误:', error_17);
                        sendSSE('error', {
                            message: '❌ 处理过程中出现错误: ' + error_17.message,
                            error: error_17.toString()
                        });
                        res.end();
                        return [3 /*break*/, 7];
                    case 6:
                        // 确保SSE流被关闭
                        if (!res.writableEnded) {
                            console.log('🔚 [单次调用] finally块关闭SSE流');
                            res.end();
                        }
                        return [7 /*endfinally*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * SSE流式处理用户请求 - 实时推送思考过程和工具调用
     * @param request 用户请求
     * @param res Express Response对象，用于SSE流式推送
     */
    UnifiedIntelligenceService.prototype.processUserRequestStream = function (request, res) {
        return __awaiter(this, void 0, void 0, function () {
            var sendSSE, enhancedProgressCallback, MessageService, MessageRole, messageService, savedUserMessage, savedAIMessage, aiResponseContent, _a, isAskingAboutSystem, generateSystemIntroduction, introduction, conversationId_1, saveError_1, securityCheck, enhancedSendSSE, err_1, emsg, error_18;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('🔄 [统一智能] 开始流式处理用户请求');
                        console.log('📝 [统一智能] 请求内容:', request.content);
                        console.log('👤 [统一智能] 用户ID:', request.userId);
                        console.log('💬 [统一智能] 会话ID:', request.conversationId);
                        console.log('🔧 [统一智能] 上下文:', JSON.stringify(request.context, null, 2));
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        // 设置SSE响应头
                        res.writeHead(200, {
                            'Content-Type': 'text/event-stream',
                            'Cache-Control': 'no-cache',
                            'Connection': 'keep-alive',
                            'X-Accel-Buffering': 'no',
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'Cache-Control'
                        });
                        sendSSE = function (event, data) {
                            var _a;
                            var sseData = "event: ".concat(event, "\ndata: ").concat(JSON.stringify(data), "\n\n");
                            res.write(sseData);
                            (_a = res.flushHeaders) === null || _a === void 0 ? void 0 : _a.call(res); // 🔧 立即刷新响应头，确保事件立即发送
                            console.log("\uD83D\uDCE1 [SSE\u63A8\u9001] \u4E8B\u4EF6: ".concat(event), typeof data === 'string' ? data.substring(0, 100) : JSON.stringify(data).substring(0, 100));
                        };
                        enhancedProgressCallback = function (status, details) {
                            // 如果是工作流步骤事件，发送特殊的 SSE 事件
                            if (status === 'workflow_step_start' || status === 'workflow_step_complete' || status === 'workflow_step_failed') {
                                sendSSE(status, details);
                            }
                            else {
                                // 普通进度消息
                                sendSSE('progress', { message: status, details: details });
                            }
                        };
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/message.service')); })];
                    case 1:
                        MessageService = (_b.sent()).MessageService;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
                    case 2:
                        MessageRole = (_b.sent()).MessageRole;
                        messageService = new MessageService();
                        savedUserMessage = null;
                        savedAIMessage = null;
                        aiResponseContent = '';
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 15, 16, 17]);
                        // 1. 开始处理
                        sendSSE('start', { message: '🔗 正在连接AI服务...' });
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/system-introduction.config')); })];
                    case 4:
                        _a = _b.sent(), isAskingAboutSystem = _a.isAskingAboutSystem, generateSystemIntroduction = _a.generateSystemIntroduction;
                        if (isAskingAboutSystem(request.content)) {
                            console.log('📖 [系统介绍] 检测到系统介绍问题，直接返回预设内容');
                            // 发送思考开始（保持UI一致性）
                            sendSSE('thinking_start', { message: '🤔 正在准备系统介绍...' });
                            introduction = generateSystemIntroduction();
                            aiResponseContent = introduction;
                            // 发送内容更新
                            sendSSE('content_update', {
                                content: introduction,
                                accumulated: introduction
                            });
                            // 发送最终答案
                            sendSSE('final_answer', {
                                content: introduction
                            });
                            // 发送完成事件
                            sendSSE('complete', {
                                message: '',
                                tokensUsed: 0,
                                source: 'system_introduction',
                                isComplete: true,
                                needsContinue: false // 🔧 修复：明确告诉前端不需要继续
                            });
                            console.log('✅ [系统介绍] 返回完成，tokens消耗: 0');
                            res.end();
                            return [2 /*return*/];
                        }
                        conversationId_1 = request.conversationId;
                        if (!(conversationId_1 && request.userId)) return [3 /*break*/, 8];
                        _b.label = 5;
                    case 5:
                        _b.trys.push([5, 7, , 8]);
                        console.log('💾 [SSE] 保存用户消息到数据库...');
                        return [4 /*yield*/, messageService.createMessage({
                                conversationId: conversationId_1,
                                userId: Number(request.userId),
                                role: MessageRole.USER,
                                content: request.content,
                                messageType: 'text',
                                tokens: Math.ceil(request.content.length / 4)
                            })];
                    case 6:
                        savedUserMessage = _b.sent();
                        console.log('✅ [SSE] 用户消息保存成功:', savedUserMessage.id);
                        return [3 /*break*/, 8];
                    case 7:
                        saveError_1 = _b.sent();
                        console.error('❌ [SSE] 保存用户消息失败:', saveError_1);
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, this.performSecurityCheck(request)];
                    case 9:
                        securityCheck = _b.sent();
                        if (!securityCheck.allowed) {
                            sendSSE('error', {
                                message: '🚨 权限检查失败: ' + securityCheck.reason,
                                error: securityCheck
                            });
                            res.end();
                            return [2 /*return*/];
                        }
                        // 3. 发送思考开始状态
                        sendSSE('thinking_start', { message: '🤔 AI开始思考...' });
                        enhancedSendSSE = function (event, data) {
                            // 捕获AI响应内容
                            if (event === 'message' && (data === null || data === void 0 ? void 0 : data.content)) {
                                aiResponseContent += data.content;
                            }
                            else if (event === 'complete' && (data === null || data === void 0 ? void 0 : data.message)) {
                                aiResponseContent = data.message;
                            }
                            // 调用原始sendSSE
                            sendSSE(event, data);
                        };
                        _b.label = 10;
                    case 10:
                        _b.trys.push([10, 12, , 14]);
                        return [4 /*yield*/, this.callDoubaoAfcLoopSSE(request, enhancedSendSSE)];
                    case 11:
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 12:
                        err_1 = _b.sent();
                        emsg = String((err_1 === null || err_1 === void 0 ? void 0 : err_1.message) || err_1 || '');
                        console.error('❌ [SSE] AFC循环失败，尝试回退到旧的流式实现:', emsg);
                        sendSSE('warn', { message: 'AFC循环异常，回退到上游流式实现' });
                        // 回退：尽力继续旧的流式逻辑
                        return [4 /*yield*/, this.callDoubaoStreamAPI(request, enhancedSendSSE)];
                    case 13:
                        // 回退：尽力继续旧的流式逻辑
                        _b.sent();
                        return [3 /*break*/, 14];
                    case 14:
                        // 5. 完成
                        sendSSE('complete', {
                            message: '',
                            isComplete: true,
                            needsContinue: false // 🔧 修复：明确告诉前端不需要继续
                        });
                        // ✅ 立即关闭SSE流，不等待数据库保存
                        console.log('🔚 [SSE] 立即关闭SSE流，提升前端响应速度');
                        res.end();
                        // 💾 异步保存AI回复消息（不阻塞前端响应）
                        if (conversationId_1 && request.userId && aiResponseContent) {
                            setImmediate(function () { return __awaiter(_this, void 0, void 0, function () {
                                var saveError_2;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            _a.trys.push([0, 2, , 3]);
                                            console.log('💾 [SSE] 异步保存AI回复到数据库...');
                                            return [4 /*yield*/, messageService.createMessage({
                                                    conversationId: conversationId_1,
                                                    userId: Number(request.userId),
                                                    role: MessageRole.ASSISTANT,
                                                    content: aiResponseContent,
                                                    messageType: 'text',
                                                    tokens: Math.ceil(aiResponseContent.length / 4),
                                                    metadata: {
                                                        source: 'unified-intelligence-stream',
                                                        timestamp: new Date().toISOString()
                                                    }
                                                })];
                                        case 1:
                                            savedAIMessage = _a.sent();
                                            console.log('✅ [SSE] AI回复异步保存成功:', savedAIMessage.id);
                                            return [3 /*break*/, 3];
                                        case 2:
                                            saveError_2 = _a.sent();
                                            console.error('❌ [SSE] AI回复异步保存失败:', saveError_2);
                                            return [3 /*break*/, 3];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        return [3 /*break*/, 17];
                    case 15:
                        error_18 = _b.sent();
                        console.error('❌ [SSE] 流式处理错误:', error_18);
                        sendSSE('error', {
                            message: '❌ 处理过程中出现错误: ' + error_18.message,
                            error: error_18.toString()
                        });
                        return [3 /*break*/, 17];
                    case 16:
                        // ✅ 确保SSE流被关闭（如果还没有关闭的话）
                        // Node.js的res.end()可以安全地多次调用，第二次调用会被忽略
                        if (!res.writableEnded) {
                            console.log('🔚 [SSE] finally块关闭SSE流');
                            res.end();
                        }
                        return [7 /*endfinally*/];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 过滤无效的thinking内容
     * @param content 原始thinking内容
     * @returns 过滤后的内容，如果无效则返回空字符串
     */
    UnifiedIntelligenceService.prototype.filterInvalidThinkingContent = function (content) {
        if (!content || typeof content !== 'string') {
            return '';
        }
        // 🔧 清理乱码字符和特殊字符
        var cleanedContent = content
            .replace(/�/g, '') // 移除菱形问号
            .replace(/[\uFFFD]/g, '') // 移除Unicode替换字符
            .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 移除控制字符
            .trim();
        // 过滤掉单个字符或过短的内容（可能是模型输出异常）
        if (cleanedContent.length <= 2 && !cleanedContent.match(/[。！？\n]/)) {
            console.log('🔧 [过滤] 跳过过短的thinking内容:', JSON.stringify(content));
            return '';
        }
        // 过滤掉只包含标点符号或特殊字符的内容
        if (cleanedContent.match(/^[。，！？、；：""''（）【】\s]*$/)) {
            console.log('🔧 [过滤] 跳过纯标点符号内容:', JSON.stringify(content));
            return '';
        }
        // 过滤掉看起来像调试信息的内容
        if (cleanedContent.match(/^(让|的|。|create|_list|简要|都是|可能|参数|制定|子|Todo)$/)) {
            console.log('🔧 [过滤] 跳过疑似调试信息:', JSON.stringify(content));
            return '';
        }
        // 过滤掉连续的句号或特殊字符
        if (cleanedContent.match(/^\.{2,}$/) || cleanedContent.match(/^。{2,}$/)) {
            console.log('🔧 [过滤] 跳过连续标点符号:', JSON.stringify(content));
            return '';
        }
        return cleanedContent;
    };
    /**
     * 将工具调用结果转换为前端可识别的组件标记
     */
    UnifiedIntelligenceService.prototype.enhanceContentWithComponentMarkers = function (content, toolExecutions) {
        var enhancedContent = content;
        console.log('🎨 [组件标记] 开始转换工具调用结果为组件标记');
        console.log('🎨 [组件标记] 工具执行结果:', toolExecutions);
        for (var _i = 0, toolExecutions_1 = toolExecutions; _i < toolExecutions_1.length; _i++) {
            var execution = toolExecutions_1[_i];
            if (!execution.success || !execution.result)
                continue;
            var toolName = execution.name;
            var result = execution.result;
            console.log("\uD83C\uDFA8 [\u7EC4\u4EF6\u6807\u8BB0] \u5904\u7406\u5DE5\u5177: ".concat(toolName), result);
            // 处理render_component工具
            if (toolName === 'render_component' && result.component) {
                var component = result.component;
                var componentType = component.type;
                var title = component.title || '数据展示';
                var componentMarker = '';
                if (componentType === 'chart') {
                    var chartType = component.chartType || 'bar';
                    componentMarker = "[COMPONENT:chart:".concat(chartType, ":").concat(title, "]");
                }
                else if (componentType === 'todo-list') {
                    componentMarker = "[COMPONENT:todo-list:".concat(title, "]");
                }
                else if (componentType === 'data-table') {
                    componentMarker = "[COMPONENT:data-table:".concat(title, "]");
                }
                else if (componentType === 'stat-card') {
                    componentMarker = "[COMPONENT:stat-card:".concat(title, "]");
                }
                if (componentMarker) {
                    enhancedContent += "\n\n".concat(componentMarker);
                    console.log("\u2705 [\u7EC4\u4EF6\u6807\u8BB0] \u6DFB\u52A0\u7EC4\u4EF6\u6807\u8BB0: ".concat(componentMarker));
                }
            }
            // 处理create_task_list工具
            if (toolName === 'create_task_list' && result.todoList) {
                var title = result.title || '任务清单';
                var componentMarker = "[COMPONENT:todo-list:".concat(title, "]");
                enhancedContent += "\n\n".concat(componentMarker);
                console.log("\u2705 [\u7EC4\u4EF6\u6807\u8BB0] \u6DFB\u52A0\u4EFB\u52A1\u6E05\u5355\u6807\u8BB0: ".concat(componentMarker));
            }
            // 处理query_data工具，如果请求图表显示
            if ((toolName === 'query_data' || toolName.includes('query')) && result.chartData) {
                var title = result.title || '数据图表';
                var componentMarker = "[COMPONENT:chart:bar:".concat(title, "]");
                enhancedContent += "\n\n".concat(componentMarker);
                console.log("\u2705 [\u7EC4\u4EF6\u6807\u8BB0] \u6DFB\u52A0\u6570\u636E\u56FE\u8868\u6807\u8BB0: ".concat(componentMarker));
            }
        }
        console.log('🎨 [组件标记] 转换完成，增强后的内容:', enhancedContent);
        return enhancedContent;
    };
    /**
     * 调用豆包流式API并实时推送数据
     */
    UnifiedIntelligenceService.prototype.callDoubaoStreamAPI = function (request, sendSSE) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z;
        return __awaiter(this, void 0, void 0, function () {
            var aiModelConfig, enableToolsFromFrontend, isSimpleGreeting, forceEnableTools, isAdmin, tools, toolManager, userRole, error_19, FUNCTION_TOOLS_STREAM, aiBridgeService, systemPrompt, aiBridgeMessages, shouldUseTools_1, finalTools, maxTokens, response, toolChoice, AIModelConfig_3, flashModelRecord, flashModel, nonStreamResp, choice, message, content, toolCalls, reasoningContent, toolExecutions_2, progressCallback, _i, toolCalls_1, toolCall, toolCallId, toolDescription, toolIntent, parsedArgs, thinkingContent_1, result, e_1, enhanced, toolCallError_1, err_2, emsg, reader_1, buffer_1, hasThinking_1, thinkingContent_2, finalContent_1, toolExecutions_3, hasUIInstruction_1, hasToolCallsObserved_1, noToolCallsTimer_1, enhancedContent, error_20;
            var _this = this;
            return __generator(this, function (_0) {
                switch (_0.label) {
                    case 0:
                        console.log('🔄 [Doubao] 开始调用豆包流式API');
                        _0.label = 1;
                    case 1:
                        _0.trys.push([1, 27, , 28]);
                        return [4 /*yield*/, this.getDoubaoModelConfig()];
                    case 2:
                        aiModelConfig = _0.sent();
                        if (!aiModelConfig) {
                            throw new Error('无法获取豆包模型配置');
                        }
                        enableToolsFromFrontend = (_b = (_a = request === null || request === void 0 ? void 0 : request.context) === null || _a === void 0 ? void 0 : _a.enableTools) !== null && _b !== void 0 ? _b : true;
                        isSimpleGreeting = this.isSimpleGreeting(request.content);
                        forceEnableTools = enableToolsFromFrontend && !isSimpleGreeting;
                        isAdmin = this.normalizeRole(((_c = request === null || request === void 0 ? void 0 : request.context) === null || _c === void 0 ? void 0 : _c.role) || 'parent') === rbac_middleware_1.Role.ADMIN;
                        console.log("\uD83D\uDD34 [StreamAPI] \u5DE5\u5177\u8C03\u7528\u914D\u7F6E: enableToolsFromFrontend=".concat(enableToolsFromFrontend, ", forceEnableTools=").concat(forceEnableTools, ", enableWebSearch=").concat((_d = request === null || request === void 0 ? void 0 : request.context) === null || _d === void 0 ? void 0 : _d.enableWebSearch, ", isAdmin=").concat(isAdmin, ", isSimpleGreeting=").concat(isSimpleGreeting));
                        tools = [];
                        if (!(forceEnableTools && isAdmin)) return [3 /*break*/, 6];
                        toolManager = new tool_manager_service_1.ToolManagerService();
                        userRole = this.normalizeRole(((_e = request === null || request === void 0 ? void 0 : request.context) === null || _e === void 0 ? void 0 : _e.role) || 'parent');
                        _0.label = 3;
                    case 3:
                        _0.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, toolManager.getToolsForQuery({
                                query: request.content,
                                userRole: userRole,
                                userId: parseInt(request.userId) || 0,
                                conversationId: request.conversationId,
                                maxTools: 3 // 限制最多3个工具
                            })];
                    case 4:
                        tools = _0.sent();
                        console.log("\u2705 [\u667A\u80FD\u5DE5\u5177\u9009\u62E9] \u6210\u529F\u9009\u62E9\u5DE5\u5177", {
                            query: request.content.substring(0, 50),
                            selectedCount: tools.length,
                            toolNames: tools.map(function (t) { var _a; return ((_a = t["function"]) === null || _a === void 0 ? void 0 : _a.name) || t.name; })
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_19 = _0.sent();
                        console.error('❌ [智能工具选择] 失败，使用降级工具集', error_19);
                        FUNCTION_TOOLS_STREAM = this.getFunctionToolsDefinition();
                        // 放宽：流式同样提供全部工具，支持多工具调用
                        tools = FUNCTION_TOOLS_STREAM;
                        return [3 /*break*/, 6];
                    case 6:
                        console.log("\uD83D\uDD27 [StreamAPI] \u6700\u7EC8\u5DE5\u5177\u6570\u91CF: ".concat(tools.length));
                        if (tools.length > 0) {
                            console.log("\uD83D\uDD27 [StreamAPI] \u5DE5\u5177\u5217\u8868:", tools.map(function (t) { var _a; return ((_a = t["function"]) === null || _a === void 0 ? void 0 : _a.name) || t.name; }));
                        }
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/bridge/ai-bridge.service')); })];
                    case 7:
                        aiBridgeService = (_0.sent()).aiBridgeService;
                        return [4 /*yield*/, this.buildSystemPrompt(((_f = request === null || request === void 0 ? void 0 : request.context) === null || _f === void 0 ? void 0 : _f.role) || 'user', request === null || request === void 0 ? void 0 : request.context)];
                    case 8:
                        systemPrompt = _0.sent();
                        aiBridgeMessages = [
                            {
                                role: 'system',
                                content: systemPrompt
                            },
                            {
                                role: 'user',
                                content: request.content
                            }
                        ];
                        shouldUseTools_1 = forceEnableTools && isAdmin;
                        finalTools = shouldUseTools_1
                            ? (((_g = request === null || request === void 0 ? void 0 : request.context) === null || _g === void 0 ? void 0 : _g.enableWebSearch)
                                ? tools
                                : tools.filter(function (t) {
                                    var _a;
                                    var toolName = ((_a = t === null || t === void 0 ? void 0 : t["function"]) === null || _a === void 0 ? void 0 : _a.name) || (t === null || t === void 0 ? void 0 : t.name);
                                    return toolName !== 'web_search';
                                }))
                            : [];
                        console.log("\uD83D\uDD27 [StreamAPI] \u6700\u7EC8\u5DE5\u5177\u914D\u7F6E: shouldUseTools=".concat(shouldUseTools_1, ", finalTools.length=").concat(finalTools.length));
                        if (finalTools.length > 0) {
                            console.log("\uD83D\uDD27 [StreamAPI] \u6700\u7EC8\u5DE5\u5177\u540D\u79F0:", finalTools.map(function (t) { var _a; return ((_a = t === null || t === void 0 ? void 0 : t["function"]) === null || _a === void 0 ? void 0 : _a.name) || (t === null || t === void 0 ? void 0 : t.name); }));
                        }
                        maxTokens = shouldUseTools_1 ? 10000 : 1500;
                        console.log("\uD83D\uDD27 [StreamAPI] Token\u914D\u7F6E: shouldUseTools=".concat(shouldUseTools_1, ", maxTokens=").concat(maxTokens));
                        response = void 0;
                        toolChoice = 'none';
                        if (shouldUseTools_1) {
                            if (enableToolsFromFrontend === true) {
                                // 'required' 强制AI必须调用至少一个工具
                                toolChoice = 'required';
                                console.log('🚀 [智能代理] 强制启用工具调用模式: required');
                            }
                            else {
                                // 'auto' 让模型自行决定是否调用工具
                                toolChoice = 'auto';
                                console.log('🔧 [工具调用] 自动模式: auto');
                            }
                        }
                        if (!(shouldUseTools_1 && finalTools.length > 0)) return [3 /*break*/, 21];
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('⚡ [工具调用模式] 使用非流式调用 + Flash模型');
                        console.log('📋 [原因] 避免前端显示未解析的JSON片段');
                        console.log('🚀 [优势] Flash模型响应快（0.5-2秒），返回完整JSON');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
                    case 9:
                        AIModelConfig_3 = (_0.sent()).AIModelConfig;
                        return [4 /*yield*/, AIModelConfig_3.findOne({
                                where: {
                                    name: 'doubao-seed-1-6-flash-250715',
                                    status: 'active'
                                }
                            })];
                    case 10:
                        flashModelRecord = _0.sent();
                        flashModel = flashModelRecord || aiModelConfig;
                        if (!flashModelRecord) {
                            console.warn('⚠️ [工具调用] 未找到Flash模型，使用默认模型');
                        }
                        _0.label = 11;
                    case 11:
                        _0.trys.push([11, 20, , 21]);
                        return [4 /*yield*/, aiBridgeService.generateChatCompletion({
                                model: flashModel.name,
                                messages: aiBridgeMessages,
                                tools: finalTools,
                                tool_choice: toolChoice,
                                temperature: 0.1,
                                max_tokens: maxTokens
                            }, {
                                endpointUrl: flashModel.endpointUrl,
                                apiKey: flashModel.apiKey
                            }, (_h = request === null || request === void 0 ? void 0 : request.context) === null || _h === void 0 ? void 0 : _h.userId)];
                    case 12:
                        nonStreamResp = _0.sent();
                        console.log('✅ [工具调用] 非流式调用成功，获取完整工具调用信息');
                        choice = (_j = nonStreamResp === null || nonStreamResp === void 0 ? void 0 : nonStreamResp.choices) === null || _j === void 0 ? void 0 : _j[0];
                        message = (choice === null || choice === void 0 ? void 0 : choice.message) || {};
                        content = (message === null || message === void 0 ? void 0 : message.content) || '';
                        toolCalls = (message === null || message === void 0 ? void 0 : message.tool_calls) || [];
                        reasoningContent = (message === null || message === void 0 ? void 0 : message.reasoning_content) || '';
                        // 🔍 如果有reasoning_content，先发送thinking_update事件
                        if (reasoningContent) {
                            console.log('✅ [工具调用-非流式] 检测到reasoning_content，发送thinking_update事件');
                            console.log('🔍 [工具调用-非流式] reasoning_content内容:', reasoningContent.substring(0, 100) + '...');
                            sendSSE('thinking_update', {
                                content: reasoningContent,
                                message: '🤔 AI正在思考...',
                                timestamp: new Date().toISOString()
                            });
                        }
                        if (content) {
                            sendSSE('content_update', { content: content, accumulated: content });
                        }
                        toolExecutions_2 = [];
                        if (!(shouldUseTools_1 && Array.isArray(toolCalls) && toolCalls.length > 0)) return [3 /*break*/, 19];
                        progressCallback = function (status, details) {
                            sendSSE('progress', { message: status, details: details });
                        };
                        _i = 0, toolCalls_1 = toolCalls;
                        _0.label = 13;
                    case 13:
                        if (!(_i < toolCalls_1.length)) return [3 /*break*/, 18];
                        toolCall = toolCalls_1[_i];
                        _0.label = 14;
                    case 14:
                        _0.trys.push([14, 16, , 17]);
                        toolCallId = "".concat((_k = toolCall["function"]) === null || _k === void 0 ? void 0 : _k.name, "-").concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                        console.log("\uD83C\uDD94 [\u5DE5\u5177\u8C03\u7528-\u975E\u6D41\u5F0F] \u751F\u6210\u5DE5\u5177\u8C03\u7528ID: ".concat(toolCallId));
                        toolDescription = '';
                        toolIntent = '';
                        try {
                            parsedArgs = typeof ((_l = toolCall["function"]) === null || _l === void 0 ? void 0 : _l.arguments) === 'string'
                                ? JSON.parse(toolCall["function"].arguments)
                                : (_m = toolCall["function"]) === null || _m === void 0 ? void 0 : _m.arguments;
                            toolDescription = (0, tool_description_generator_service_1.generateToolDescription)(((_o = toolCall["function"]) === null || _o === void 0 ? void 0 : _o.name) || '', parsedArgs);
                            toolIntent = (0, tool_description_generator_service_1.generateToolIntent)(((_p = toolCall["function"]) === null || _p === void 0 ? void 0 : _p.name) || '', parsedArgs);
                        }
                        catch (descError) {
                            console.warn('⚠️ 生成工具描述失败:', descError);
                            toolDescription = "\u6B63\u5728\u6267\u884C\u5DE5\u5177: ".concat((_q = toolCall["function"]) === null || _q === void 0 ? void 0 : _q.name);
                            toolIntent = "\u6211\u5C06\u6267\u884C\u5DE5\u5177: ".concat((_r = toolCall["function"]) === null || _r === void 0 ? void 0 : _r.name);
                        }
                        // 🎯 第1步：发送工具意图描述
                        sendSSE('tool_intent', {
                            message: toolIntent,
                            toolName: (_s = toolCall["function"]) === null || _s === void 0 ? void 0 : _s.name
                        });
                        thinkingContent_1 = reasoningContent || toolDescription;
                        console.log('🤔 [工具调用-非流式] 发送thinking (来自AI):', thinkingContent_1.substring(0, 200));
                        sendSSE('thinking', thinkingContent_1);
                        // 🎯 第3步：发送工具调用开始事件
                        sendSSE('tool_call_start', {
                            id: toolCallId,
                            name: (_t = toolCall["function"]) === null || _t === void 0 ? void 0 : _t.name,
                            arguments: (_u = toolCall["function"]) === null || _u === void 0 ? void 0 : _u.arguments,
                            intent: toolIntent,
                            description: toolDescription // 🎯 添加工具描述
                        });
                        return [4 /*yield*/, this.executeFunctionTool(toolCall, request, progressCallback)];
                    case 15:
                        result = _0.sent();
                        toolExecutions_2.push({ name: (_v = toolCall["function"]) === null || _v === void 0 ? void 0 : _v.name, arguments: (_w = toolCall["function"]) === null || _w === void 0 ? void 0 : _w.arguments, result: result, success: true });
                        sendSSE('tool_call_complete', {
                            id: toolCallId,
                            name: (_x = toolCall["function"]) === null || _x === void 0 ? void 0 : _x.name,
                            result: result,
                            success: true
                        });
                        return [3 /*break*/, 17];
                    case 16:
                        e_1 = _0.sent();
                        console.error('❌ [工具调用] 工具执行失败:', (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || e_1);
                        sendSSE('tool_call_error', { name: (_y = toolCall["function"]) === null || _y === void 0 ? void 0 : _y.name, error: (e_1 === null || e_1 === void 0 ? void 0 : e_1.message) || String(e_1) });
                        return [3 /*break*/, 17];
                    case 17:
                        _i++;
                        return [3 /*break*/, 13];
                    case 18:
                        sendSSE('tools_complete', { message: "\u2705 \u5B8C\u6210".concat(toolExecutions_2.length, "\u4E2A\u5DE5\u5177\u8C03\u7528"), executions: toolExecutions_2 });
                        _0.label = 19;
                    case 19:
                        if (content) {
                            enhanced = this.enhanceContentWithComponentMarkers(content, toolExecutions_2);
                            sendSSE('final_answer', { content: content, message: '💬 最终回答已生成' });
                            sendSSE('content_update', { content: '', accumulated: enhanced });
                        }
                        console.log('✅ [工具调用] 非流式调用完成，已推送所有事件');
                        return [2 /*return*/]; // 工具调用非流式路径已完成推送
                    case 20:
                        toolCallError_1 = _0.sent();
                        console.error('❌ [工具调用] 非流式调用失败:', (toolCallError_1 === null || toolCallError_1 === void 0 ? void 0 : toolCallError_1.message) || toolCallError_1);
                        // 如果非流式调用失败，继续使用流式调用作为降级方案
                        console.log('⚠️ [工具调用] 降级到流式调用模式');
                        return [3 /*break*/, 21];
                    case 21:
                        // 🔗 直连聊天模式或工具调用失败时，使用流式调用
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        console.log('🔗 [直连聊天模式] 使用流式调用');
                        console.log('📋 [说明] 直连聊天不涉及工具调用，使用流式提升响应速度');
                        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                        _0.label = 22;
                    case 22:
                        _0.trys.push([22, 24, , 25]);
                        return [4 /*yield*/, aiBridgeService.generateChatCompletionStream({
                                model: aiModelConfig.name,
                                messages: aiBridgeMessages,
                                tools: finalTools,
                                tool_choice: toolChoice,
                                temperature: 0.7,
                                max_tokens: maxTokens,
                                stream: true
                            }, {
                                endpointUrl: aiModelConfig.endpointUrl,
                                apiKey: aiModelConfig.apiKey
                            }, undefined, (_z = request === null || request === void 0 ? void 0 : request.context) === null || _z === void 0 ? void 0 : _z.userId)];
                    case 23:
                        response = _0.sent(); // 🚀 传递userId用于使用量统计
                        return [3 /*break*/, 25];
                    case 24:
                        err_2 = _0.sent();
                        emsg = String((err_2 === null || err_2 === void 0 ? void 0 : err_2.message) || err_2 || '');
                        console.error('❌ [StreamAPI] 流式调用失败:', emsg);
                        throw err_2;
                    case 25:
                        reader_1 = response;
                        if (!reader_1) {
                            throw new Error('无法获取流式响应读取器');
                        }
                        buffer_1 = '';
                        hasThinking_1 = false;
                        thinkingContent_2 = '';
                        finalContent_1 = '';
                        toolExecutions_3 = [];
                        hasUIInstruction_1 = false;
                        hasToolCallsObserved_1 = false;
                        noToolCallsTimer_1 = null;
                        if (shouldUseTools_1 && finalTools.length > 0) {
                            noToolCallsTimer_1 = setTimeout(function () {
                                try {
                                    console.warn('⏱️ [StreamAPI] 45s内未收到任何 tool_calls，可能仍在推理阶段，将继续等待');
                                    sendSSE('warn', { message: '模型仍在深度思考，尚未发出工具调用，继续等待…（如需立刻执行可手动停止重试）' });
                                }
                                catch (_) { }
                            }, 45000);
                        }
                        // 使用Promise包装流处理，确保异步完成
                        return [4 /*yield*/, new Promise(function (resolve, reject) {
                                reader_1.on('data', function (chunk) {
                                    buffer_1 += chunk.toString();
                                    var lines = buffer_1.split('\n');
                                    buffer_1 = lines.pop() || '';
                                    for (var _i = 0, lines_2 = lines; _i < lines_2.length; _i++) {
                                        var line = lines_2[_i];
                                        if (line.trim() === '' || line.trim() === 'data: [DONE]')
                                            continue;
                                        if (line.startsWith('data: ')) {
                                            try {
                                                var jsonStr = line.slice(6).trim();
                                                var data = JSON.parse(jsonStr);
                                                if (data.choices && data.choices[0] && data.choices[0].delta) {
                                                    var delta = data.choices[0].delta;
                                                    // 处理思考内容 - 批量发送以减少频率，并过滤无效内容
                                                    if (delta.reasoning_content) {
                                                        // 🔧 过滤无效的thinking内容
                                                        var cleanThinkingContent = _this.filterInvalidThinkingContent(delta.reasoning_content);
                                                        if (cleanThinkingContent) {
                                                            thinkingContent_2 += cleanThinkingContent;
                                                            if (!hasThinking_1) {
                                                                hasThinking_1 = true;
                                                                sendSSE('thinking_update', {
                                                                    message: '🤔 AI正在思考...',
                                                                    content: cleanThinkingContent
                                                                });
                                                            }
                                                            else {
                                                                // 每累积20个字符或遇到句号、换行符时发送一次
                                                                var shouldSend = thinkingContent_2.length % 20 === 0 ||
                                                                    cleanThinkingContent.includes('。') ||
                                                                    cleanThinkingContent.includes('\n') ||
                                                                    cleanThinkingContent.includes('！') ||
                                                                    cleanThinkingContent.includes('？');
                                                                if (shouldSend) {
                                                                    sendSSE('thinking_update', {
                                                                        content: cleanThinkingContent,
                                                                        append: true
                                                                    });
                                                                }
                                                            }
                                                        }
                                                    }
                                                    // 处理工具调用 - 🚀 修复：使用shouldUseTools而不是forceEnableTools
                                                    if (shouldUseTools_1 && delta.tool_calls) {
                                                        hasToolCallsObserved_1 = true;
                                                        if (noToolCallsTimer_1) {
                                                            clearTimeout(noToolCallsTimer_1);
                                                            noToolCallsTimer_1 = null;
                                                        }
                                                        var _loop_3 = function (toolCall) {
                                                            if (toolCall["function"] && toolCall["function"].name) {
                                                                try {
                                                                    // 工具描述已移除，直接跳过
                                                                    var parsedArgsDesc = toolCall["function"].arguments;
                                                                    try {
                                                                        parsedArgsDesc = typeof toolCall["function"].arguments === 'string' ? JSON.parse(toolCall["function"].arguments) : toolCall["function"].arguments;
                                                                    }
                                                                    catch (_c) { }
                                                                    // 注释掉工具描述相关代码
                                                                    // const desc = buildToolPreDescription([], 'brief');
                                                                    // sendSSE('tool_call_description', {
                                                                    //   name: toolCall.function.name,
                                                                    //   description: desc,
                                                                    //   arguments: parsedArgsDesc,
                                                                    //   source: 'rule'
                                                                    // });
                                                                }
                                                                catch (_d) { }
                                                                // 🆔 生成工具调用唯一ID
                                                                var toolCallId_1 = "".concat(toolCall["function"].name, "-").concat(Date.now(), "-").concat(Math.random().toString(36).substring(2, 11));
                                                                console.log("\uD83C\uDD94 [\u6D41\u5F0F] \u751F\u6210\u5DE5\u5177\u8C03\u7528ID: ".concat(toolCallId_1));
                                                                // 🎯 生成工具调用描述和意图描述
                                                                var toolDescription_1 = '';
                                                                var toolIntent = '';
                                                                try {
                                                                    var parsedArgs = typeof toolCall["function"].arguments === 'string'
                                                                        ? JSON.parse(toolCall["function"].arguments)
                                                                        : toolCall["function"].arguments;
                                                                    toolDescription_1 = (0, tool_description_generator_service_1.generateToolDescription)(toolCall["function"].name, parsedArgs);
                                                                    toolIntent = (0, tool_description_generator_service_1.generateToolIntent)(toolCall["function"].name, parsedArgs);
                                                                }
                                                                catch (descError) {
                                                                    console.warn('⚠️ 生成工具描述失败:', descError);
                                                                    toolDescription_1 = "\u6B63\u5728\u6267\u884C\u5DE5\u5177: ".concat(toolCall["function"].name);
                                                                    toolIntent = "\u6211\u5C06\u6267\u884C\u5DE5\u5177: ".concat(toolCall["function"].name);
                                                                }
                                                                // 🎯 第1步：发送工具意图描述
                                                                sendSSE('tool_intent', {
                                                                    message: toolIntent,
                                                                    toolName: toolCall["function"].name
                                                                });
                                                                // 🎯 第2步：发送thinking事件 - 使用AI的reasoning_content而不是生成的工具描述
                                                                var thinkingToSend = thinkingContent_2 || toolDescription_1;
                                                                console.log('🤔 [流式] 发送thinking (来自AI):', thinkingToSend.substring(0, 200));
                                                                sendSSE('thinking', thinkingToSend);
                                                                // 🎯 第3步：发送工具调用开始事件
                                                                sendSSE('tool_call_start', {
                                                                    id: toolCallId_1,
                                                                    name: toolCall["function"].name,
                                                                    arguments: toolCall["function"].arguments,
                                                                    intent: toolIntent,
                                                                    description: toolDescription_1 // 🎯 添加工具描述
                                                                });
                                                                // 执行工具
                                                                (function () { return __awaiter(_this, void 0, void 0, function () {
                                                                    var parsedArguments, argsStr, braceCount, firstJsonEnd, i, progressCallback, result, error_21;
                                                                    var _a;
                                                                    return __generator(this, function (_b) {
                                                                        switch (_b.label) {
                                                                            case 0:
                                                                                _b.trys.push([0, 2, , 3]);
                                                                                console.log("\uD83D\uDD27 [Function Calling] \u5F00\u59CB\u6267\u884C\u5DE5\u5177: ".concat(toolCall["function"].name));
                                                                                console.log("\uD83D\uDCCB [Function Calling] \u5DE5\u5177\u53C2\u6570: ".concat(toolCall["function"].arguments));
                                                                                console.log("\uD83D\uDCAC [Function Calling] \u5DE5\u5177\u63CF\u8FF0: ".concat(toolDescription_1));
                                                                                parsedArguments = void 0;
                                                                                try {
                                                                                    if (!toolCall["function"].arguments) {
                                                                                        parsedArguments = {};
                                                                                    }
                                                                                    else {
                                                                                        argsStr = toolCall["function"].arguments.trim();
                                                                                        // 🔧 修复：如果参数包含多个JSON对象（如 "{...}{...}"），只取第一个
                                                                                        if (argsStr.startsWith('{')) {
                                                                                            braceCount = 0;
                                                                                            firstJsonEnd = -1;
                                                                                            for (i = 0; i < argsStr.length; i++) {
                                                                                                if (argsStr[i] === '{')
                                                                                                    braceCount++;
                                                                                                else if (argsStr[i] === '}') {
                                                                                                    braceCount--;
                                                                                                    if (braceCount === 0) {
                                                                                                        firstJsonEnd = i + 1;
                                                                                                        break;
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                            if (firstJsonEnd > 0 && firstJsonEnd < argsStr.length) {
                                                                                                console.log("\uD83D\uDD27 [Fix] \u68C0\u6D4B\u5230\u591A\u4E2AJSON\u5BF9\u8C61\uFF0C\u53EA\u53D6\u7B2C\u4E00\u4E2A: ".concat(argsStr, " -> ").concat(argsStr.substring(0, firstJsonEnd)));
                                                                                                argsStr = argsStr.substring(0, firstJsonEnd);
                                                                                            }
                                                                                        }
                                                                                        parsedArguments = JSON.parse(argsStr);
                                                                                    }
                                                                                }
                                                                                catch (parseError) {
                                                                                    console.error("\u274C \u5DE5\u5177\u53C2\u6570JSON\u89E3\u6790\u5931\u8D25: ".concat(toolCall["function"].arguments), parseError);
                                                                                    throw new Error("\u5DE5\u5177\u53C2\u6570JSON\u89E3\u6790\u5931\u8D25: ".concat(parseError.message || '未知解析错误'));
                                                                                }
                                                                                console.log("\u2705 [Function Calling] \u53C2\u6570\u89E3\u6790\u6210\u529F:", parsedArguments);
                                                                                progressCallback = function (status, details) {
                                                                                    sendSSE('progress', { message: status, details: details });
                                                                                };
                                                                                return [4 /*yield*/, this.executeFunctionTool(toolCall, request, progressCallback)];
                                                                            case 1:
                                                                                result = _b.sent();
                                                                                console.log("\uD83C\uDFAF [Function Calling] \u5DE5\u5177\u6267\u884C\u5B8C\u6210:", result);
                                                                                toolExecutions_3.push({
                                                                                    name: toolCall["function"].name,
                                                                                    arguments: parsedArguments,
                                                                                    result: result,
                                                                                    success: true
                                                                                });
                                                                                sendSSE('tool_call_complete', {
                                                                                    id: toolCallId_1,
                                                                                    name: toolCall["function"].name,
                                                                                    result: result,
                                                                                    success: true
                                                                                });
                                                                                // 🎨 检测UI指令：如果工具返回了ui_instruction，标记需要提前结束
                                                                                if ((_a = result === null || result === void 0 ? void 0 : result.result) === null || _a === void 0 ? void 0 : _a.ui_instruction) {
                                                                                    console.log('🎨 [StreamAPI] 检测到UI指令，将跳过final_answer推送');
                                                                                    hasUIInstruction_1 = true;
                                                                                }
                                                                                return [3 /*break*/, 3];
                                                                            case 2:
                                                                                error_21 = _b.sent();
                                                                                console.error("\u274C \u5DE5\u5177\u8C03\u7528\u5931\u8D25: ".concat(toolCall["function"].name), error_21);
                                                                                sendSSE('tool_call_error', {
                                                                                    name: toolCall["function"].name,
                                                                                    error: error_21.message
                                                                                });
                                                                                return [3 /*break*/, 3];
                                                                            case 3: return [2 /*return*/];
                                                                        }
                                                                    });
                                                                }); })();
                                                            }
                                                        };
                                                        for (var _a = 0, _b = delta.tool_calls; _a < _b.length; _a++) {
                                                            var toolCall = _b[_a];
                                                            _loop_3(toolCall);
                                                        }
                                                    }
                                                    // 处理普通回答内容 - 批量发送以减少频率
                                                    if (delta.content) {
                                                        finalContent_1 += delta.content;
                                                        // 每累积10个字符或遇到句号、换行符时发送一次，减少发送频率
                                                        var shouldSend = finalContent_1.length % 10 === 0 ||
                                                            delta.content.includes('。') ||
                                                            delta.content.includes('\n') ||
                                                            delta.content.includes('！') ||
                                                            delta.content.includes('？');
                                                        if (shouldSend) {
                                                            sendSSE('content_update', {
                                                                content: delta.content,
                                                                accumulated: finalContent_1
                                                            });
                                                        }
                                                    }
                                                }
                                            }
                                            catch (parseError) {
                                                console.warn('❌ [SSE] JSON解析失败:', parseError, line);
                                            }
                                        }
                                    }
                                });
                                reader_1.on('end', function () {
                                    console.log('✅ [StreamAPI] 流结束');
                                    if (noToolCallsTimer_1) {
                                        clearTimeout(noToolCallsTimer_1);
                                        noToolCallsTimer_1 = null;
                                    }
                                    resolve();
                                });
                                reader_1.on('error', function (error) {
                                    console.error('❌ [StreamAPI] 流错误:', error);
                                    if (noToolCallsTimer_1) {
                                        clearTimeout(noToolCallsTimer_1);
                                        noToolCallsTimer_1 = null;
                                    }
                                    reject(error);
                                });
                            })];
                    case 26:
                        // 使用Promise包装流处理，确保异步完成
                        _0.sent();
                        // 发送最终状态
                        if (hasThinking_1 && thinkingContent_2) {
                            sendSSE('thinking_complete', {
                                message: '🤔 思考完成',
                                content: thinkingContent_2
                            });
                        }
                        if (toolExecutions_3.length > 0) {
                            sendSSE('tools_complete', {
                                message: "\u2705 \u5B8C\u6210".concat(toolExecutions_3.length, "\u4E2A\u5DE5\u5177\u8C03\u7528"),
                                executions: toolExecutions_3
                            });
                        }
                        // 🎯 如果有工具调用但没有最终内容，生成默认答案
                        console.log('🔍 [StreamAPI] 检查最终内容:', {
                            hasFinalContent: !!finalContent_1,
                            finalContentLength: (finalContent_1 === null || finalContent_1 === void 0 ? void 0 : finalContent_1.length) || 0,
                            toolExecutionsCount: toolExecutions_3.length,
                            hasUIInstruction: hasUIInstruction_1
                        });
                        // 🎨 如果检测到UI指令，跳过final_answer推送
                        if (hasUIInstruction_1) {
                            console.log('🎨 [StreamAPI] 检测到UI指令，跳过final_answer推送和默认答案生成');
                        }
                        else {
                            // 只有在没有UI指令时才生成默认答案
                            if (!finalContent_1 && toolExecutions_3.length > 0) {
                                console.log('🎯 [StreamAPI] 生成默认答案，因为有工具调用但没有最终内容');
                                finalContent_1 = "\u5DF2\u5B8C\u6210".concat(toolExecutions_3.length, "\u4E2A\u5DE5\u5177\u8C03\u7528\uFF0C\u8BF7\u67E5\u770B\u4E0A\u65B9\u6267\u884C\u7ED3\u679C\u3002");
                            }
                            console.log('🔍 [StreamAPI] 最终内容检查后:', {
                                hasFinalContent: !!finalContent_1,
                                finalContentLength: (finalContent_1 === null || finalContent_1 === void 0 ? void 0 : finalContent_1.length) || 0
                            });
                            if (finalContent_1) {
                                enhancedContent = this.enhanceContentWithComponentMarkers(finalContent_1, toolExecutions_3);
                                // 确保发送最终完整内容
                                sendSSE('content_update', {
                                    content: '',
                                    accumulated: enhancedContent
                                });
                                sendSSE('final_answer', {
                                    content: finalContent_1,
                                    message: '💬 最终回答已生成'
                                });
                            }
                        }
                        return [3 /*break*/, 28];
                    case 27:
                        error_20 = _0.sent();
                        console.error('❌ [Doubao] 豆包API调用错误:', error_20);
                        throw error_20;
                    case 28: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检索相关记忆（带优化统计）
     */
    UnifiedIntelligenceService.prototype.retrieveRelevantMemories = function (request, enableOptimization) {
        if (enableOptimization === void 0) { enableOptimization = false; }
        return __awaiter(this, void 0, void 0, function () {
            var memories_1, optimizationStats, searchResults, originalCount, totalMemories, filteredCount, relevanceThreshold, compressionRatio, error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        memories_1 = [];
                        optimizationStats = null;
                        return [4 /*yield*/, this.memoryService.activeRetrieval(request.content, { userId: request.userId, conversationId: request.conversationId })];
                    case 1:
                        searchResults = _a.sent();
                        originalCount = 0;
                        // 处理核心记忆
                        if (searchResults.core && searchResults.core.items.length > 0) {
                            originalCount += searchResults.core.items.length;
                            searchResults.core.items.forEach(function (item) {
                                memories_1.push({
                                    type: 'core',
                                    content: "\u7528\u6237\u753B\u50CF: ".concat(item.humanValue || item.content || '未设定')
                                });
                            });
                        }
                        // 处理情节记忆
                        if (searchResults.episodic && searchResults.episodic.items.length > 0) {
                            originalCount += searchResults.episodic.items.length;
                            searchResults.episodic.items.slice(0, 5).forEach(function (item) {
                                memories_1.push({
                                    type: 'episodic',
                                    content: "\u5386\u53F2\u4E8B\u4EF6: ".concat(item.summary || item.content, " (").concat(item.occurredAt ? new Date(item.occurredAt).toLocaleString('zh-CN') : '近期', ")")
                                });
                            });
                        }
                        // 处理语义记忆
                        if (searchResults.semantic && searchResults.semantic.items.length > 0) {
                            originalCount += searchResults.semantic.items.length;
                            searchResults.semantic.items.slice(0, 3).forEach(function (item) {
                                memories_1.push({
                                    type: 'semantic',
                                    content: "\u76F8\u5173\u6982\u5FF5: ".concat(item.name || item.content, " - ").concat(item.description || '')
                                });
                            });
                        }
                        // 处理过程记忆
                        if (searchResults.procedural && searchResults.procedural.items.length > 0) {
                            originalCount += searchResults.procedural.items.length;
                            searchResults.procedural.items.slice(0, 2).forEach(function (item) {
                                memories_1.push({
                                    type: 'procedural',
                                    content: "\u64CD\u4F5C\u6D41\u7A0B: ".concat(item.procedureName || item.content, " - ").concat(item.description || '')
                                });
                            });
                        }
                        // 处理资源记忆
                        if (searchResults.resource && searchResults.resource.items.length > 0) {
                            originalCount += searchResults.resource.items.length;
                            searchResults.resource.items.slice(0, 3).forEach(function (item) {
                                memories_1.push({
                                    type: 'resource',
                                    content: "\u76F8\u5173\u8D44\u6E90: ".concat(item.name || item.content, " (").concat(item.resourceType || 'document', ") - ").concat(item.summary || '')
                                });
                            });
                        }
                        // 处理知识库
                        if (searchResults.knowledge && searchResults.knowledge.items.length > 0) {
                            originalCount += searchResults.knowledge.items.length;
                            searchResults.knowledge.items.slice(0, 3).forEach(function (item) {
                                memories_1.push({
                                    type: 'knowledge',
                                    content: "\u9886\u57DF\u77E5\u8BC6[".concat(item.domain || '通用', "]: ").concat(item.content, " (\u7F6E\u4FE1\u5EA6: ").concat(item.confidence || 0.8, ")")
                                });
                            });
                        }
                        totalMemories = memories_1.length;
                        console.log("\uD83D\uDCDA [Memory] \u68C0\u7D22\u5230 ".concat(totalMemories, " \u6761\u76F8\u5173\u8BB0\u5FC6"));
                        // 计算优化统计信息
                        if (enableOptimization) {
                            filteredCount = memories_1.length;
                            relevanceThreshold = 60;
                            compressionRatio = originalCount > 0 ? Math.round(((originalCount - filteredCount) / originalCount) * 100) : 0;
                            optimizationStats = {
                                originalCount: originalCount,
                                filteredCount: filteredCount,
                                relevanceThreshold: relevanceThreshold,
                                compressionRatio: compressionRatio
                            };
                        }
                        return [2 /*return*/, { memories: memories_1, optimizationStats: optimizationStats }];
                    case 2:
                        error_22 = _a.sent();
                        console.error('❌ [Memory] 记忆检索失败:', error_22);
                        return [2 /*return*/, { memories: [] }]; // 失败时返回空数组，不影响主流程
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 存储新记忆
     */
    UnifiedIntelligenceService.prototype.storeNewMemory = function (request, aiResponse) {
        return __awaiter(this, void 0, void 0, function () {
            var userMessage, aiMessage, knowledge, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        userMessage = request.content;
                        aiMessage = typeof aiResponse === 'string' ? aiResponse : aiResponse.message || aiResponse.content || '';
                        // 使用learnFromConversation方法同时学习并存储到各个维度
                        return [4 /*yield*/, this.memoryService.learnFromConversation(request.userId, userMessage, aiMessage, {
                                conversationId: request.conversationId,
                                context: request.context,
                                timestamp: new Date().toISOString()
                            })];
                    case 1:
                        // 使用learnFromConversation方法同时学习并存储到各个维度
                        _a.sent();
                        if (!(aiMessage.length > 50)) return [3 /*break*/, 3];
                        knowledge = this.extractKnowledge(aiMessage);
                        if (!knowledge) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.memoryService.learnKnowledge(knowledge.domain || '通用', knowledge.topic || '对话知识', knowledge.content, 'ai_conversation', 0.8)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        console.log('✅ [Memory] 新记忆存储完成');
                        return [3 /*break*/, 5];
                    case 4:
                        error_23 = _a.sent();
                        console.error('❌ [Memory] 记忆存储失败:', error_23);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 提取概念（简单实现）
     */
    UnifiedIntelligenceService.prototype.extractConcepts = function (text) {
        // 简单的关键词提取逻辑
        var keywords = ['招生', '学生', '教师', '活动', '班级', '家长', '营销', '统计', '分析', '管理'];
        var concepts = [];
        for (var _i = 0, keywords_1 = keywords; _i < keywords_1.length; _i++) {
            var keyword = keywords_1[_i];
            if (text.includes(keyword)) {
                concepts.push(keyword);
            }
        }
        return concepts.slice(0, 3); // 最多返回3个概念
    };
    /**
     * 判断是否为过程性请求
     */
    UnifiedIntelligenceService.prototype.isProceduralRequest = function (text) {
        var proceduralKeywords = ['如何', '怎么', '步骤', '流程', '创建', '添加', '修改', '删除', '查询', '导出'];
        return proceduralKeywords.some(function (keyword) { return text.includes(keyword); });
    };
    /**
     * 从文本中提取知识
     */
    UnifiedIntelligenceService.prototype.extractKnowledge = function (text) {
        // 简单的知识提取逻辑
        if (text.length < 50)
            return null;
        // 尝试识别领域
        var domain = '通用';
        if (text.includes('招生') || text.includes('入园'))
            domain = '招生管理';
        else if (text.includes('教师') || text.includes('教学'))
            domain = '教学管理';
        else if (text.includes('学生') || text.includes('班级'))
            domain = '学生管理';
        else if (text.includes('营销') || text.includes('推广'))
            domain = '营销管理';
        // 提取主题（取前20个字作为主题）
        var topic = text.substring(0, 30).replace(/[，。！？]/g, '');
        // 提取核心内容（取前200个字）
        var content = text.substring(0, 200);
        return { domain: domain, topic: topic, content: content };
    };
    /**
     * 基于 Gemini 风格的 AFC 循环：非流式多轮 + SSE 工具事件
     * 确保连续多工具调用，直到不再返回 tool_calls 或达到上限
     */
    UnifiedIntelligenceService.prototype.callDoubaoAfcLoopSSE = function (request, sendSSE) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var aiModelConfig, isSimpleGreeting, isAdmin, enableToolsFromFrontend, shouldUseTools, savedUserMessage, messageService, MessageRole_1, saveError_3, systemPrompt, memoryContext, optimizationData, memoryResult, messages, memoryContent_2, ALL_TOOLS, tools, MAX_REMOTE_CALLS, remoteCalls, toolExecutions, aiBridgeService, resp, choice, message, content, toolCalls, reasoningContent, toolDescriptions, hasComplexityAnalysis, complexityExec, autoAction, toolNames, forceMessage, enhanced, messageService, MessageRole_2, aiContent, savedAIMessage, saveError_4, _loop_4, this_3, _i, toolCalls_2, tc, state_3, finalContent, messageService, MessageRole_3, savedAIMessage, saveError_5;
            var _this = this;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0: return [4 /*yield*/, this.getDoubaoModelConfig()];
                    case 1:
                        aiModelConfig = _m.sent();
                        isSimpleGreeting = this.isSimpleGreeting(request.content);
                        isAdmin = this.normalizeRole(((_a = request === null || request === void 0 ? void 0 : request.context) === null || _a === void 0 ? void 0 : _a.role) || 'parent') === rbac_middleware_1.Role.ADMIN;
                        enableToolsFromFrontend = (_c = (_b = request === null || request === void 0 ? void 0 : request.context) === null || _b === void 0 ? void 0 : _b.enableTools) !== null && _c !== void 0 ? _c : true;
                        shouldUseTools = enableToolsFromFrontend && isAdmin && !isSimpleGreeting;
                        savedUserMessage = null;
                        _m.label = 2;
                    case 2:
                        _m.trys.push([2, 7, , 8]);
                        if (!request.conversationId) return [3 /*break*/, 6];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/message.service')); })];
                    case 3:
                        messageService = (_m.sent())["default"];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
                    case 4:
                        MessageRole_1 = (_m.sent()).MessageRole;
                        console.log('💾 [AFC-SSE] 保存用户消息到数据库:', {
                            conversationId: request.conversationId,
                            userId: request.userId,
                            contentLength: request.content.length
                        });
                        return [4 /*yield*/, messageService.createMessage({
                                conversationId: request.conversationId,
                                userId: Number(request.userId),
                                role: MessageRole_1.USER,
                                content: request.content,
                                messageType: 'text',
                                tokens: Math.ceil(request.content.length / 4)
                            })];
                    case 5:
                        savedUserMessage = _m.sent();
                        console.log('✅ [AFC-SSE] 用户消息保存成功:', savedUserMessage.id);
                        _m.label = 6;
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        saveError_3 = _m.sent();
                        console.error('❌ [AFC-SSE] 用户消息保存失败:', saveError_3);
                        return [3 /*break*/, 8];
                    case 8: return [4 /*yield*/, this.buildSystemPrompt(((_d = request === null || request === void 0 ? void 0 : request.context) === null || _d === void 0 ? void 0 : _d.role) || 'user', request === null || request === void 0 ? void 0 : request.context)];
                    case 9:
                        systemPrompt = _m.sent();
                        memoryContext = request.memoryContext;
                        optimizationData = null;
                        if (!(!memoryContext && !isSimpleGreeting)) return [3 /*break*/, 11];
                        // 发送上下文优化开始事件
                        sendSSE('context_optimization_start', { message: '开始智能上下文优化...' });
                        // 模拟优化进度
                        sendSSE('context_optimization_progress', {
                            message: '正在分析记忆相关性...',
                            data: { percentage: 30, text: '正在分析记忆相关性...' }
                        });
                        return [4 /*yield*/, this.retrieveRelevantMemories(request, true)];
                    case 10:
                        memoryResult = _m.sent();
                        memoryContext = memoryResult.memories;
                        sendSSE('context_optimization_progress', {
                            message: '正在过滤低相关性记忆...',
                            data: { percentage: 60, text: '正在过滤低相关性记忆...' }
                        });
                        sendSSE('context_optimization_progress', {
                            message: '正在压缩上下文内容...',
                            data: { percentage: 90, text: '正在压缩上下文内容...' }
                        });
                        // 生成优化数据
                        if (memoryResult.optimizationStats) {
                            optimizationData = {
                                originalTokens: memoryResult.optimizationStats.originalCount * 50,
                                optimizedTokens: memoryResult.optimizationStats.filteredCount * 50,
                                tokensSaved: (memoryResult.optimizationStats.originalCount - memoryResult.optimizationStats.filteredCount) * 50,
                                compressionRatio: memoryResult.optimizationStats.compressionRatio,
                                memoryOptimization: {
                                    originalCount: memoryResult.optimizationStats.originalCount,
                                    filteredCount: memoryResult.optimizationStats.filteredCount,
                                    relevanceThreshold: memoryResult.optimizationStats.relevanceThreshold
                                },
                                contextLayers: [
                                    { name: '核心身份', tokens: 500, included: true },
                                    { name: '任务指导', tokens: 800, included: true },
                                    { name: '组织数据', tokens: 300, included: true },
                                    { name: '记忆上下文', tokens: memoryResult.optimizationStats.filteredCount * 50, included: true }
                                ],
                                strategies: ['记忆过滤', '相关性评分', '内容压缩', '智能去重'],
                                suggestions: [
                                    '当前记忆过滤效果良好，节省了大量token',
                                    '建议定期清理低相关性的历史记忆',
                                    '可以考虑增加记忆压缩算法以进一步优化'
                                ]
                            };
                            // 发送优化完成事件
                            sendSSE('context_optimization_complete', {
                                message: '上下文优化完成',
                                data: optimizationData
                            });
                        }
                        _m.label = 11;
                    case 11:
                        messages = [
                            { role: 'system', content: systemPrompt }
                        ];
                        // 🧠 如果有记忆上下文且不是简单问候语，作为单独的系统消息插入
                        if (memoryContext && memoryContext.length > 0 && !isSimpleGreeting) {
                            memoryContent_2 = '## 📚 相关记忆上下文\n';
                            memoryContent_2 += '基于用户的历史记忆，以下是相关的上下文信息：\n\n';
                            memoryContext.forEach(function (memory) {
                                memoryContent_2 += "- ".concat(memory.content, "\n");
                            });
                            memoryContent_2 += '\n请参考这些记忆信息，为用户提供更加个性化和连贯的服务。';
                            messages.push({
                                role: 'system',
                                content: memoryContent_2
                            });
                            console.log("\uD83E\uDDE0 [AFC-SSE] \u5DF2\u6DFB\u52A0 ".concat(memoryContext.length, " \u6761\u8BB0\u5FC6\u4E0A\u4E0B\u6587\uFF08\u4F5C\u4E3A\u5355\u72EC\u6D88\u606F\uFF09"));
                        }
                        else {
                            console.log('🧠 [AFC-SSE] 无六维记忆上下文或为简单问候语，跳过记忆添加');
                        }
                        // 添加用户消息
                        messages.push({
                            role: 'user',
                            content: request.content
                        });
                        ALL_TOOLS = this.getFunctionToolsDefinition();
                        tools = shouldUseTools
                            ? (((_e = request === null || request === void 0 ? void 0 : request.context) === null || _e === void 0 ? void 0 : _e.enableWebSearch) ? ALL_TOOLS : ALL_TOOLS.filter(function (t) { var _a; return ((_a = t["function"]) === null || _a === void 0 ? void 0 : _a.name) !== 'web_search'; }))
                            : [];
                        MAX_REMOTE_CALLS = ENV_MAX_ITERS;
                        remoteCalls = 0;
                        toolExecutions = [];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/bridge/ai-bridge.service')); })];
                    case 12:
                        aiBridgeService = (_m.sent()).aiBridgeService;
                        _m.label = 13;
                    case 13:
                        if (!(remoteCalls < MAX_REMOTE_CALLS)) return [3 /*break*/, 27];
                        console.log("\uD83D\uDD04 [AFC-Loop] \u5F00\u59CB\u7B2C ".concat(remoteCalls + 1, " \u8F6E\u5DE5\u5177\u8C03\u7528\u5FAA\u73AF"));
                        return [4 /*yield*/, aiBridgeService.generateChatCompletion({
                                model: aiModelConfig.name,
                                messages: messages,
                                tools: tools,
                                tool_choice: shouldUseTools ? 'auto' : 'none',
                                temperature: 0.7,
                                max_tokens: shouldUseTools ? 9000 : 1500
                            }, {
                                endpointUrl: aiModelConfig.endpointUrl,
                                apiKey: aiModelConfig.apiKey
                            }, (_f = request === null || request === void 0 ? void 0 : request.context) === null || _f === void 0 ? void 0 : _f.userId)];
                    case 14:
                        resp = _m.sent();
                        choice = (_g = resp === null || resp === void 0 ? void 0 : resp.choices) === null || _g === void 0 ? void 0 : _g[0];
                        message = (choice === null || choice === void 0 ? void 0 : choice.message) || {};
                        content = (message === null || message === void 0 ? void 0 : message.content) || '';
                        toolCalls = Array.isArray(message === null || message === void 0 ? void 0 : message.tool_calls) ? message.tool_calls : [];
                        reasoningContent = (message === null || message === void 0 ? void 0 : message.reasoning_content) || '';
                        // 🔍 详细日志：打印message对象的所有字段
                        console.log("\uD83D\uDD0D [AFC-Loop-".concat(remoteCalls + 1, "] Message\u5B57\u6BB5:"), Object.keys(message));
                        console.log("\uD83D\uDD0D [AFC-Loop-".concat(remoteCalls + 1, "] reasoning_content\u5B58\u5728:"), !!reasoningContent);
                        console.log("\uD83D\uDD0D [AFC-Loop-".concat(remoteCalls + 1, "] reasoning_content\u957F\u5EA6:"), reasoningContent.length);
                        console.log("\uD83D\uDD0D [AFC-Loop-".concat(remoteCalls + 1, "] content\u957F\u5EA6:"), content.length);
                        console.log("\uD83D\uDD0D [AFC-Loop-".concat(remoteCalls + 1, "] toolCalls\u6570\u91CF:"), toolCalls.length);
                        // 🔍 如果有reasoning_content，先发送thinking_update事件
                        if (reasoningContent) {
                            console.log("\u2705 [SSE-AFC-".concat(remoteCalls + 1, "] \u68C0\u6D4B\u5230reasoning_content\uFF0C\u53D1\u9001thinking_update\u4E8B\u4EF6"));
                            console.log("\uD83D\uDD0D [SSE-AFC-".concat(remoteCalls + 1, "] reasoning_content\u5185\u5BB9:"), reasoningContent.substring(0, 100) + '...');
                            sendSSE('thinking_update', {
                                content: reasoningContent,
                                message: '🤔 AI正在思考...',
                                timestamp: new Date().toISOString()
                            });
                        }
                        else {
                            console.log("\u26A0\uFE0F [SSE-AFC-".concat(remoteCalls + 1, "] \u672A\u68C0\u6D4B\u5230reasoning_content"));
                            // 🔧 如果没有reasoning_content，但有工具调用，使用工具调用描述作为thinking内容
                            if (toolCalls.length > 0) {
                                toolDescriptions = toolCalls.map(function (tc) {
                                    var _a;
                                    var toolName = ((_a = tc === null || tc === void 0 ? void 0 : tc["function"]) === null || _a === void 0 ? void 0 : _a.name) || '未知工具';
                                    return "\u6B63\u5728\u51C6\u5907\u8C03\u7528\u5DE5\u5177: ".concat(toolName);
                                }).join('\n');
                                console.log("\uD83D\uDD27 [SSE-AFC-".concat(remoteCalls + 1, "] \u4F7F\u7528\u5DE5\u5177\u8C03\u7528\u63CF\u8FF0\u4F5C\u4E3Athinking\u5185\u5BB9"));
                                sendSSE('thinking_update', {
                                    content: toolDescriptions,
                                    message: '🤔 AI正在思考下一步操作...',
                                    timestamp: new Date().toISOString()
                                });
                            }
                        }
                        if (content) {
                            sendSSE('content_update', { content: content, accumulated: content });
                        }
                        // 记录本轮assistant消息（包含 tool_calls），供下一轮上下文使用
                        messages.push({ role: 'assistant', content: content || null, tool_calls: (toolCalls === null || toolCalls === void 0 ? void 0 : toolCalls.length) ? toolCalls : null });
                        if (!(!shouldUseTools || toolCalls.length === 0)) return [3 /*break*/, 22];
                        hasComplexityAnalysis = toolExecutions.some(function (exec) { return exec.name === 'analyze_task_complexity'; });
                        if (hasComplexityAnalysis && remoteCalls === 1) {
                            complexityExec = toolExecutions.find(function (exec) { return exec.name === 'analyze_task_complexity'; });
                            autoAction = (_h = complexityExec === null || complexityExec === void 0 ? void 0 : complexityExec.result) === null || _h === void 0 ? void 0 : _h.auto_action;
                            if (autoAction && autoAction.mandatory && autoAction.next_tools && autoAction.next_tools.length > 0) {
                                // 需要强制执行后续工具，但AI没有调用
                                console.warn('⚠️ [AFC-SSE] AI应该调用工具但没有调用，自动提示AI继续');
                                console.log('🎯 [AFC-SSE] auto_action:', JSON.stringify(autoAction, null, 2));
                                toolNames = autoAction.next_tools.join('和');
                                forceMessage = "\u26A0\uFE0F \u91CD\u8981\u63D0\u793A\uFF1A\u6839\u636E\u4EFB\u52A1\u5206\u6790\u7ED3\u679C\uFF0C\u4F60\u5FC5\u987B\u7ACB\u5373\u8C03\u7528\u4EE5\u4E0B\u5DE5\u5177\uFF1A".concat(toolNames, "\u3002\u8FD9\u662F\u5F3A\u5236\u6027\u7684\uFF0C\u4E0D\u53EF\u8DF3\u8FC7\u3002\u8BF7\u7ACB\u5373\u6267\u884C\u5DE5\u5177\u8C03\u7528\uFF0C\u4E0D\u8981\u53EA\u8FD4\u56DE\u6587\u672C\u8BF4\u660E\u3002");
                                messages.push({
                                    role: 'system',
                                    content: forceMessage
                                });
                                sendSSE('warn', { message: "\u68C0\u6D4B\u5230AI\u672A\u6309\u8981\u6C42\u8C03\u7528\u5DE5\u5177\uFF0C\u6B63\u5728\u81EA\u52A8\u7EA0\u6B63..." });
                                // 继续下一轮，不结束AFC循环
                                remoteCalls++;
                                return [3 /*break*/, 13];
                            }
                        }
                        // 正常结束AFC循环
                        if (toolExecutions.length > 0) {
                            sendSSE('tools_complete', { message: "\u2705 \u5B8C\u6210".concat(toolExecutions.length, "\u4E2A\u5DE5\u5177\u8C03\u7528"), executions: toolExecutions });
                        }
                        enhanced = this.enhanceContentWithComponentMarkers(content || '处理完成', toolExecutions);
                        sendSSE('final_answer', { content: content || '处理完成' });
                        sendSSE('content_update', { content: '', accumulated: enhanced });
                        _m.label = 15;
                    case 15:
                        _m.trys.push([15, 20, , 21]);
                        if (!(request.conversationId && (content || toolExecutions.length > 0))) return [3 /*break*/, 19];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/message.service')); })];
                    case 16:
                        messageService = (_m.sent())["default"];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
                    case 17:
                        MessageRole_2 = (_m.sent()).MessageRole;
                        aiContent = content || "\u5DF2\u5B8C\u6210".concat(toolExecutions.length, "\u4E2A\u5DE5\u5177\u8C03\u7528\uFF0C\u8BF7\u67E5\u770B\u4E0A\u65B9\u6267\u884C\u7ED3\u679C\u3002");
                        console.log('💾 [AFC-SSE] 保存AI回复到数据库:', {
                            conversationId: request.conversationId,
                            userId: request.userId,
                            contentLength: aiContent.length
                        });
                        return [4 /*yield*/, messageService.createMessage({
                                conversationId: request.conversationId,
                                userId: Number(request.userId),
                                role: MessageRole_2.ASSISTANT,
                                content: aiContent,
                                messageType: 'text',
                                tokens: Math.ceil(aiContent.length / 4),
                                metadata: {
                                    toolExecutions: toolExecutions,
                                    approach: 'afc_loop',
                                    complexity: 'complex'
                                }
                            })];
                    case 18:
                        savedAIMessage = _m.sent();
                        console.log('✅ [AFC-SSE] AI回复保存成功:', savedAIMessage.id);
                        _m.label = 19;
                    case 19: return [3 /*break*/, 21];
                    case 20:
                        saveError_4 = _m.sent();
                        console.error('❌ [AFC-SSE] AI回复保存失败:', saveError_4);
                        return [3 /*break*/, 21];
                    case 21: return [2 /*return*/];
                    case 22:
                        _loop_4 = function (tc) {
                            var toolName, argStr, parsedArgs, toolDescription, toolIntent, thinkingToSend, result, aiContent_1, e_2, errMsg;
                            return __generator(this, function (_o) {
                                switch (_o.label) {
                                    case 0:
                                        toolName = (_j = tc === null || tc === void 0 ? void 0 : tc["function"]) === null || _j === void 0 ? void 0 : _j.name;
                                        argStr = ((_k = tc === null || tc === void 0 ? void 0 : tc["function"]) === null || _k === void 0 ? void 0 : _k.arguments) || '';
                                        parsedArgs = void 0;
                                        try {
                                            parsedArgs = typeof argStr === 'string' && argStr.trim() ? JSON.parse(argStr.trim()) : (argStr || {});
                                        }
                                        catch (_p) {
                                            parsedArgs = argStr;
                                        }
                                        toolDescription = '';
                                        toolIntent = '';
                                        try {
                                            toolDescription = (0, tool_description_generator_service_1.generateToolDescription)(toolName, parsedArgs);
                                            toolIntent = (0, tool_description_generator_service_1.generateToolIntent)(toolName, parsedArgs);
                                        }
                                        catch (descError) {
                                            console.warn('⚠️ 生成工具描述失败:', descError);
                                            toolDescription = "\u6B63\u5728\u6267\u884C\u5DE5\u5177: ".concat(toolName);
                                            toolIntent = "\u6211\u5C06\u6267\u884C\u5DE5\u5177: ".concat(toolName);
                                        }
                                        // 🎯 第1步：发送工具意图描述
                                        console.log("\uD83C\uDFAF [AFC-\u5DE5\u5177-".concat(remoteCalls, "] \u53D1\u9001tool_intent:"), toolIntent);
                                        sendSSE('tool_intent', {
                                            message: toolIntent,
                                            toolName: toolName
                                        });
                                        thinkingToSend = reasoningContent || toolDescription;
                                        console.log("\uD83E\uDD14 [AFC-\u5DE5\u5177-".concat(remoteCalls, "] \u53D1\u9001thinking (\u6765\u81EAAI):"), thinkingToSend.substring(0, 200));
                                        sendSSE('thinking', thinkingToSend);
                                        // 🎯 第3步：发送工具调用开始事件
                                        sendSSE('tool_call_start', {
                                            name: toolName,
                                            arguments: parsedArgs,
                                            intent: toolIntent,
                                            description: toolDescription // 🎯 添加工具描述
                                        });
                                        _o.label = 1;
                                    case 1:
                                        _o.trys.push([1, 3, , 4]);
                                        return [4 /*yield*/, this_3.executeFunctionTool(tc, request, function (status, details) { return sendSSE('progress', { message: status, details: details }); })];
                                    case 2:
                                        result = _o.sent();
                                        toolExecutions.push({ name: toolName, arguments: parsedArgs, result: result, success: true });
                                        sendSSE('tool_call_complete', { name: toolName, result: result, success: true });
                                        // 🎨 检测UI指令：如果工具返回了ui_instruction，直接结束流程
                                        if ((_l = result === null || result === void 0 ? void 0 : result.result) === null || _l === void 0 ? void 0 : _l.ui_instruction) {
                                            console.log('🎨 [AFC] 检测到UI指令，直接结束流程');
                                            // 发送工具完成事件
                                            sendSSE('tools_complete', {
                                                message: "\u2705 \u5B8C\u6210".concat(toolExecutions.length, "\u4E2A\u5DE5\u5177\u8C03\u7528"),
                                                executions: toolExecutions
                                            });
                                            // 发送完成事件，不再推送额外的content_update或final_answer
                                            sendSSE('complete', {
                                                message: '',
                                                hasUIInstruction: true,
                                                isComplete: true,
                                                needsContinue: false // 🔧 修复：明确告诉前端不需要继续
                                            });
                                            // 💾 异步保存AI回复到数据库（UI指令检测返回点，不阻塞响应）
                                            if (request.conversationId && (content || toolExecutions.length > 0)) {
                                                aiContent_1 = content || "\u5DF2\u5B8C\u6210".concat(toolExecutions.length, "\u4E2A\u5DE5\u5177\u8C03\u7528\uFF0C\u8BF7\u67E5\u770B\u4E0A\u65B9\u6267\u884C\u7ED3\u679C\u3002");
                                                setImmediate(function () { return __awaiter(_this, void 0, void 0, function () {
                                                    var messageService, MessageRole_4, savedAIMessage, saveError_6;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0:
                                                                _a.trys.push([0, 4, , 5]);
                                                                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/message.service')); })];
                                                            case 1:
                                                                messageService = (_a.sent())["default"];
                                                                return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
                                                            case 2:
                                                                MessageRole_4 = (_a.sent()).MessageRole;
                                                                console.log('💾 [AFC-SSE] 异步保存AI回复到数据库 (UI指令):', {
                                                                    conversationId: request.conversationId,
                                                                    userId: request.userId,
                                                                    contentLength: aiContent_1.length
                                                                });
                                                                return [4 /*yield*/, messageService.createMessage({
                                                                        conversationId: request.conversationId,
                                                                        userId: Number(request.userId),
                                                                        role: MessageRole_4.ASSISTANT,
                                                                        content: aiContent_1,
                                                                        messageType: 'text',
                                                                        tokens: Math.ceil(aiContent_1.length / 4),
                                                                        metadata: {
                                                                            toolExecutions: toolExecutions,
                                                                            approach: 'afc_loop_ui_instruction',
                                                                            complexity: 'complex'
                                                                        }
                                                                    })];
                                                            case 3:
                                                                savedAIMessage = _a.sent();
                                                                console.log('✅ [AFC-SSE] AI回复异步保存成功 (UI指令):', savedAIMessage.id);
                                                                return [3 /*break*/, 5];
                                                            case 4:
                                                                saveError_6 = _a.sent();
                                                                console.error('❌ [AFC-SSE] AI回复异步保存失败 (UI指令):', saveError_6);
                                                                return [3 /*break*/, 5];
                                                            case 5: return [2 /*return*/];
                                                        }
                                                    });
                                                }); });
                                            }
                                            return [2 /*return*/, { value: void 0 }];
                                        }
                                        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify(result) });
                                        return [3 /*break*/, 4];
                                    case 3:
                                        e_2 = _o.sent();
                                        errMsg = (e_2 === null || e_2 === void 0 ? void 0 : e_2.message) || String(e_2);
                                        toolExecutions.push({ name: toolName, arguments: parsedArgs, result: null, success: false, error: errMsg });
                                        sendSSE('tool_call_error', { name: toolName, error: errMsg });
                                        messages.push({ role: 'tool', tool_call_id: tc.id, content: JSON.stringify({ error: errMsg }) });
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_3 = this;
                        _i = 0, toolCalls_2 = toolCalls;
                        _m.label = 23;
                    case 23:
                        if (!(_i < toolCalls_2.length)) return [3 /*break*/, 26];
                        tc = toolCalls_2[_i];
                        return [5 /*yield**/, _loop_4(tc)];
                    case 24:
                        state_3 = _m.sent();
                        if (typeof state_3 === "object")
                            return [2 /*return*/, state_3.value];
                        _m.label = 25;
                    case 25:
                        _i++;
                        return [3 /*break*/, 23];
                    case 26:
                        remoteCalls += 1;
                        sendSSE('progress', { message: "\uD83D\uDCCB \u7B2C".concat(remoteCalls, "\u8F6E\u5DE5\u5177\u8C03\u7528\u5B8C\u6210\uFF0C\u7EE7\u7EED\u4E0B\u4E00\u8F6E\u2026") });
                        return [3 /*break*/, 13];
                    case 27:
                        // 达到最大轮次仍未结束
                        sendSSE('warn', { message: "\u26A0\uFE0F \u5DF2\u8FBE\u5230\u6700\u5927\u8FED\u4EE3\u6B21\u6570 ".concat(MAX_REMOTE_CALLS, "\uFF0C\u53EF\u80FD\u8FD8\u6709\u672A\u5B8C\u6210\u7684\u6B65\u9AA4") });
                        finalContent = '任务部分完成，已达到最大迭代次数限制';
                        sendSSE('final_answer', { content: finalContent });
                        if (toolExecutions.length > 0) {
                            sendSSE('tools_complete', { message: "\u2705 \u5B8C\u6210".concat(toolExecutions.length, "\u4E2A\u5DE5\u5177\u8C03\u7528"), executions: toolExecutions });
                        }
                        _m.label = 28;
                    case 28:
                        _m.trys.push([28, 33, , 34]);
                        if (!request.conversationId) return [3 /*break*/, 32];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/message.service')); })];
                    case 29:
                        messageService = (_m.sent())["default"];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
                    case 30:
                        MessageRole_3 = (_m.sent()).MessageRole;
                        console.log('💾 [AFC-SSE] 保存AI回复到数据库 (最大轮次):', {
                            conversationId: request.conversationId,
                            userId: request.userId,
                            contentLength: finalContent.length
                        });
                        return [4 /*yield*/, messageService.createMessage({
                                conversationId: request.conversationId,
                                userId: Number(request.userId),
                                role: MessageRole_3.ASSISTANT,
                                content: finalContent,
                                messageType: 'text',
                                tokens: Math.ceil(finalContent.length / 4),
                                metadata: {
                                    toolExecutions: toolExecutions,
                                    approach: 'afc_loop_max_iterations',
                                    complexity: 'complex'
                                }
                            })];
                    case 31:
                        savedAIMessage = _m.sent();
                        console.log('✅ [AFC-SSE] AI回复保存成功 (最大轮次):', savedAIMessage.id);
                        _m.label = 32;
                    case 32: return [3 /*break*/, 34];
                    case 33:
                        saveError_5 = _m.sent();
                        console.error('❌ [AFC-SSE] AI回复保存失败 (最大轮次):', saveError_5);
                        return [3 /*break*/, 34];
                    case 34: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🆕 单次AI调用 + 工具执行（用于前端多轮调用架构）
     * 只执行一次AI调用和工具执行，不进行循环
     * 返回工具调用结果和是否需要继续的标记
     */
    UnifiedIntelligenceService.prototype.callDoubaoSingleRoundSSE = function (request, sendSSE) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function () {
            var aiModelConfig, isSimpleGreeting, isAdmin, enableToolsFromFrontend, shouldUseTools, isFirstRound, messageService, MessageRole_5, saveError_7, messages, systemPrompt, memoryResult, memoryContent_3, ALL_TOOLS, tools, aiBridgeService, resp, choice, message, content, toolCalls, reasoningContent, toolExecutions, toolResults, ToolSelectionValidatorService, toolValidator, _i, toolCalls_3, tc, toolName, argStr, parsedArgs, validation, toolDescription, toolIntent, result, e_3, errMsg, hasContent, hasToolCalls, hasUITool, needsContinue, isComplete;
            return __generator(this, function (_m) {
                switch (_m.label) {
                    case 0:
                        console.log('🎯 [SingleRound] 开始单次AI调用 + 工具执行');
                        return [4 /*yield*/, this.getDoubaoModelConfig()];
                    case 1:
                        aiModelConfig = _m.sent();
                        isSimpleGreeting = this.isSimpleGreeting(request.content);
                        isAdmin = this.normalizeRole(((_a = request === null || request === void 0 ? void 0 : request.context) === null || _a === void 0 ? void 0 : _a.role) || 'parent') === rbac_middleware_1.Role.ADMIN;
                        enableToolsFromFrontend = (_c = (_b = request === null || request === void 0 ? void 0 : request.context) === null || _b === void 0 ? void 0 : _b.enableTools) !== null && _c !== void 0 ? _c : true;
                        shouldUseTools = enableToolsFromFrontend && isAdmin && !isSimpleGreeting;
                        isFirstRound = !((_d = request === null || request === void 0 ? void 0 : request.context) === null || _d === void 0 ? void 0 : _d.currentRound) || request.context.currentRound === 1;
                        if (!(isFirstRound && request.conversationId)) return [3 /*break*/, 7];
                        _m.label = 2;
                    case 2:
                        _m.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/message.service')); })];
                    case 3:
                        messageService = (_m.sent())["default"];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-message.model')); })];
                    case 4:
                        MessageRole_5 = (_m.sent()).MessageRole;
                        console.log('💾 [SingleRound] 保存用户消息到数据库');
                        return [4 /*yield*/, messageService.createMessage({
                                conversationId: request.conversationId,
                                userId: Number(request.userId),
                                role: MessageRole_5.USER,
                                content: request.content,
                                messageType: 'text',
                                tokens: Math.ceil(request.content.length / 4)
                            })];
                    case 5:
                        _m.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        saveError_7 = _m.sent();
                        console.error('❌ [SingleRound] 用户消息保存失败:', saveError_7);
                        return [3 /*break*/, 7];
                    case 7:
                        messages = ((_e = request === null || request === void 0 ? void 0 : request.context) === null || _e === void 0 ? void 0 : _e.messages) || [];
                        if (!(messages.length === 0)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.buildSystemPrompt(((_f = request === null || request === void 0 ? void 0 : request.context) === null || _f === void 0 ? void 0 : _f.role) || 'user', request === null || request === void 0 ? void 0 : request.context)];
                    case 8:
                        systemPrompt = _m.sent();
                        messages.push({ role: 'system', content: systemPrompt });
                        if (!!isSimpleGreeting) return [3 /*break*/, 10];
                        return [4 /*yield*/, this.retrieveRelevantMemories(request, true)];
                    case 9:
                        memoryResult = _m.sent();
                        if (memoryResult.memories && memoryResult.memories.length > 0) {
                            memoryContent_3 = '## 📚 相关记忆上下文\n';
                            memoryContent_3 += '基于用户的历史记忆，以下是相关的上下文信息：\n\n';
                            memoryResult.memories.forEach(function (memory) {
                                memoryContent_3 += "- ".concat(memory.content, "\n");
                            });
                            messages.push({ role: 'system', content: memoryContent_3 });
                            console.log("\uD83E\uDDE0 [SingleRound] \u5DF2\u6DFB\u52A0 ".concat(memoryResult.memories.length, " \u6761\u8BB0\u5FC6\u4E0A\u4E0B\u6587"));
                        }
                        _m.label = 10;
                    case 10:
                        messages.push({ role: 'user', content: request.content });
                        _m.label = 11;
                    case 11:
                        ALL_TOOLS = this.getFunctionToolsDefinition();
                        tools = shouldUseTools
                            ? (((_g = request === null || request === void 0 ? void 0 : request.context) === null || _g === void 0 ? void 0 : _g.enableWebSearch) ? ALL_TOOLS : ALL_TOOLS.filter(function (t) { var _a; return ((_a = t["function"]) === null || _a === void 0 ? void 0 : _a.name) !== 'web_search'; }))
                            : [];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/bridge/ai-bridge.service')); })];
                    case 12:
                        aiBridgeService = (_m.sent()).aiBridgeService;
                        console.log("\uD83D\uDD04 [SingleRound] \u8C03\u7528AI\u6A21\u578B\uFF0C\u5DE5\u5177\u6570\u91CF: ".concat(tools.length));
                        return [4 /*yield*/, aiBridgeService.generateChatCompletion({
                                model: aiModelConfig.name,
                                messages: messages,
                                tools: tools,
                                tool_choice: shouldUseTools ? 'auto' : 'none',
                                temperature: 0.7,
                                max_tokens: shouldUseTools ? 9000 : 1500
                            }, {
                                endpointUrl: aiModelConfig.endpointUrl,
                                apiKey: aiModelConfig.apiKey
                            }, (_h = request === null || request === void 0 ? void 0 : request.context) === null || _h === void 0 ? void 0 : _h.userId)];
                    case 13:
                        resp = _m.sent();
                        choice = (_j = resp === null || resp === void 0 ? void 0 : resp.choices) === null || _j === void 0 ? void 0 : _j[0];
                        message = (choice === null || choice === void 0 ? void 0 : choice.message) || {};
                        content = (message === null || message === void 0 ? void 0 : message.content) || '';
                        toolCalls = Array.isArray(message === null || message === void 0 ? void 0 : message.tool_calls) ? message.tool_calls : [];
                        reasoningContent = (message === null || message === void 0 ? void 0 : message.reasoning_content) || '';
                        console.log("\uD83D\uDD0D [SingleRound] AI\u54CD\u5E94 - content\u957F\u5EA6: ".concat(content.length, ", toolCalls\u6570\u91CF: ").concat(toolCalls.length));
                        // 2. 发送thinking事件
                        if (reasoningContent) {
                            console.log("\u2705 [SingleRound] \u53D1\u9001thinking_update\u4E8B\u4EF6");
                            sendSSE('thinking_update', {
                                content: reasoningContent,
                                message: '🤔 AI正在思考...',
                                timestamp: new Date().toISOString()
                            });
                        }
                        // 3. 发送content_update事件
                        if (content) {
                            sendSSE('content_update', { content: content, accumulated: content });
                        }
                        toolExecutions = [];
                        toolResults = [];
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/tools/core/tool-selection-validator.service')); })];
                    case 14:
                        ToolSelectionValidatorService = (_m.sent()).ToolSelectionValidatorService;
                        toolValidator = ToolSelectionValidatorService.getInstance();
                        _i = 0, toolCalls_3 = toolCalls;
                        _m.label = 15;
                    case 15:
                        if (!(_i < toolCalls_3.length)) return [3 /*break*/, 20];
                        tc = toolCalls_3[_i];
                        toolName = (_k = tc === null || tc === void 0 ? void 0 : tc["function"]) === null || _k === void 0 ? void 0 : _k.name;
                        argStr = ((_l = tc === null || tc === void 0 ? void 0 : tc["function"]) === null || _l === void 0 ? void 0 : _l.arguments) || '';
                        parsedArgs = void 0;
                        try {
                            parsedArgs = typeof argStr === 'string' && argStr.trim() ? JSON.parse(argStr.trim()) : (argStr || {});
                        }
                        catch (_o) {
                            parsedArgs = argStr;
                        }
                        validation = toolValidator.validateToolChoice(request.content, toolName);
                        if (!validation.valid) {
                            console.warn("\u26A0\uFE0F [\u5DE5\u5177\u9009\u62E9\u9A8C\u8BC1] \u5DE5\u5177\u9009\u62E9\u4E0D\u5F53:", {
                                selectedTool: toolName,
                                suggestedTool: validation.suggestedTool,
                                reason: validation.reason
                            });
                            // 发送验证失败警告
                            sendSSE('tool_validation_warning', {
                                selectedTool: toolName,
                                suggestedTool: validation.suggestedTool,
                                reason: validation.reason,
                                message: "\u26A0\uFE0F \u5DE5\u5177\u9009\u62E9\u53EF\u80FD\u4E0D\u5F53\uFF0C\u5EFA\u8BAE\u4F7F\u7528".concat(validation.suggestedTool, "\u5DE5\u5177")
                            });
                        }
                        else {
                            console.log("\u2705 [\u5DE5\u5177\u9009\u62E9\u9A8C\u8BC1] \u5DE5\u5177\u9009\u62E9\u6B63\u786E: ".concat(toolName));
                        }
                        toolDescription = '';
                        toolIntent = '';
                        try {
                            toolDescription = (0, tool_description_generator_service_1.generateToolDescription)(toolName, parsedArgs);
                            toolIntent = (0, tool_description_generator_service_1.generateToolIntent)(toolName, parsedArgs);
                        }
                        catch (descError) {
                            console.warn('⚠️ 生成工具描述失败:', descError);
                            toolDescription = "\u6B63\u5728\u6267\u884C\u5DE5\u5177: ".concat(toolName);
                            toolIntent = "\u6211\u5C06\u6267\u884C\u5DE5\u5177: ".concat(toolName);
                        }
                        // 发送工具调用开始事件
                        sendSSE('tool_call_start', {
                            name: toolName,
                            arguments: parsedArgs,
                            intent: toolIntent,
                            description: toolDescription
                        });
                        _m.label = 16;
                    case 16:
                        _m.trys.push([16, 18, , 19]);
                        return [4 /*yield*/, this.executeFunctionTool(tc, request, function (status, details) { return sendSSE('progress', { message: status, details: details }); })];
                    case 17:
                        result = _m.sent();
                        toolExecutions.push({ name: toolName, arguments: parsedArgs, result: result, success: true });
                        toolResults.push({
                            toolCallId: tc.id,
                            name: toolName,
                            result: result
                        });
                        sendSSE('tool_call_complete', { name: toolName, result: result, success: true });
                        return [3 /*break*/, 19];
                    case 18:
                        e_3 = _m.sent();
                        errMsg = (e_3 === null || e_3 === void 0 ? void 0 : e_3.message) || String(e_3);
                        toolExecutions.push({ name: toolName, arguments: parsedArgs, result: null, success: false, error: errMsg });
                        toolResults.push({
                            toolCallId: tc.id,
                            name: toolName,
                            result: { error: errMsg }
                        });
                        sendSSE('tool_call_error', { name: toolName, error: errMsg });
                        return [3 /*break*/, 19];
                    case 19:
                        _i++;
                        return [3 /*break*/, 15];
                    case 20:
                        hasContent = content && content.trim().length > 0;
                        hasToolCalls = toolCalls.length > 0;
                        hasUITool = toolResults.some(function (tr) {
                            var result = tr.result;
                            return (result === null || result === void 0 ? void 0 : result.ui_instruction) || (result === null || result === void 0 ? void 0 : result.preview_instruction) || tr.name === 'render_component';
                        });
                        needsContinue = hasToolCalls && !hasContent && !hasUITool;
                        isComplete = !needsContinue;
                        console.log("\uD83D\uDD0D [SingleRound] \u5224\u65AD\u662F\u5426\u7EE7\u7EED:", {
                            hasContent: hasContent,
                            hasToolCalls: hasToolCalls,
                            hasUITool: hasUITool,
                            needsContinue: needsContinue,
                            isComplete: isComplete,
                            toolNames: toolCalls.map(function (tc) { return tc["function"].name; })
                        });
                        if (toolExecutions.length > 0) {
                            sendSSE('tools_complete', {
                                message: "\u2705 \u5B8C\u6210".concat(toolExecutions.length, "\u4E2A\u5DE5\u5177\u8C03\u7528"),
                                executions: toolExecutions
                            });
                        }
                        sendSSE('complete', {
                            content: content,
                            toolCalls: toolCalls.map(function (tc) { return ({
                                id: tc.id,
                                name: tc["function"].name,
                                arguments: tc["function"].arguments
                            }); }),
                            toolResults: toolResults,
                            needsContinue: needsContinue,
                            isComplete: isComplete,
                            message: isComplete ? '✅ 处理完成' : '🔄 需要继续调用AI'
                        });
                        console.log("\uD83C\uDFAF [SingleRound] \u5355\u6B21\u8C03\u7528\u5B8C\u6210 - needsContinue: ".concat(needsContinue, ", isComplete: ").concat(isComplete));
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * AI分析快速查询结果
     */
    UnifiedIntelligenceService.prototype.analyzeQuickQueryResults = function (userQuery, quickQueryResults, request) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var systemPrompt, aiBridgeService, AIModelConfig_4, modelConfig, aiResponse, error_24;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        systemPrompt = "\u4F60\u662FYY-AI\u667A\u80FD\u52A9\u624B\u3002\u7528\u6237\u67E5\u8BE2\u4E86\u591A\u4E2A\u4E1A\u52A1\u6570\u636E\uFF0C\u7CFB\u7EDF\u5DF2\u7ECF\u5FEB\u901F\u67E5\u8BE2\u5E76\u8FD4\u56DE\u4E86\u7ED3\u679C\u3002\n\n\u4F60\u7684\u4EFB\u52A1\u662F:\n1. \u5206\u6790\u8FD9\u4E9B\u6570\u636E\n2. \u63D0\u53D6\u5173\u952E\u4FE1\u606F\n3. \u7528\u53CB\u597D\u7684\u81EA\u7136\u8BED\u8A00\u603B\u7ED3\n4. \u5982\u679C\u53D1\u73B0\u5F02\u5E38\u6216\u8D8B\u52BF\uFF0C\u7ED9\u51FA\u5EFA\u8BAE\n\n**\u7528\u6237\u67E5\u8BE2**: ".concat(userQuery, "\n\n**\u5FEB\u901F\u67E5\u8BE2\u7ED3\u679C**:\n").concat(quickQueryResults, "\n\n\u8BF7\u7528\u7B80\u6D01\u3001\u4E13\u4E1A\u3001\u53CB\u597D\u7684\u8BED\u8A00\u56DE\u590D\u7528\u6237\u3002");
                        _d.label = 1;
                    case 1:
                        _d.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/bridge/ai-bridge.service')); })];
                    case 2:
                        aiBridgeService = (_d.sent()).aiBridgeService;
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/ai-model-config.model')); })];
                    case 3:
                        AIModelConfig_4 = (_d.sent()).AIModelConfig;
                        return [4 /*yield*/, AIModelConfig_4.findOne({
                                where: { status: 'active', isDefault: true }
                            })];
                    case 4:
                        modelConfig = _d.sent();
                        if (!modelConfig) {
                            // 如果没有AI模型，直接返回格式化的结果
                            return [2 /*return*/, "\u67E5\u8BE2\u7ED3\u679C:\n\n".concat(quickQueryResults)];
                        }
                        return [4 /*yield*/, aiBridgeService.generateChatCompletion({
                                model: modelConfig.name,
                                messages: [
                                    { role: 'system', content: systemPrompt }
                                ],
                                temperature: 0.7,
                                max_tokens: 1000
                            }, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            }, (_a = request === null || request === void 0 ? void 0 : request.context) === null || _a === void 0 ? void 0 : _a.userId)];
                    case 5:
                        aiResponse = _d.sent();
                        return [2 /*return*/, ((_c = (_b = aiResponse.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '分析完成'];
                    case 6:
                        error_24 = _d.sent();
                        console.error('❌ [analyzeQuickQueryResults] AI分析失败:', error_24);
                        // 降级返回原始结果
                        return [2 /*return*/, "\u67E5\u8BE2\u7ED3\u679C:\n\n".concat(quickQueryResults)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🚀 新增：阶段化模型选择方法
     * 根据工具名称和执行阶段智能选择最优模型
     */
    UnifiedIntelligenceService.prototype.selectModelForToolExecution = function (toolName, userQuery, phase) {
        return __awaiter(this, void 0, void 0, function () {
            var executionPhase, result, error_25, defaultModel;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        executionPhase = phase;
                        if (!executionPhase) {
                            executionPhase = this.determineExecutionPhase(toolName, userQuery);
                        }
                        console.log("\uD83C\uDFAF [ModelSelection] \u5DE5\u5177: ".concat(toolName, ", \u9636\u6BB5: ").concat(executionPhase));
                        return [4 /*yield*/, this.smartModelRouter.selectModelForTool(toolName, executionPhase, userQuery)];
                    case 1:
                        result = _a.sent();
                        console.log("\u2705 [ModelSelection] \u9009\u62E9\u7ED3\u679C: ".concat(result.modelName, " (").concat(result.reason, ")"));
                        return [2 /*return*/, result];
                    case 2:
                        error_25 = _a.sent();
                        console.error('❌ [ModelSelection] 模型选择失败:', error_25);
                        return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                                modelType: ai_model_config_model_1.ModelType.TEXT
                            })];
                    case 3:
                        defaultModel = _a.sent();
                        return [2 /*return*/, {
                                modelName: defaultModel.model.name,
                                modelConfig: defaultModel.model,
                                reason: '选择失败，降级到默认模型',
                                estimatedTime: 2000
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🧠 判断工具的执行阶段
     */
    UnifiedIntelligenceService.prototype.determineExecutionPhase = function (toolName, userQuery) {
        // 规划阶段工具
        var planningTools = [
            'analyze_task_complexity',
            'create_todo_list',
            'generate_execution_plan',
            'workflow_analysis',
            'complex_reasoning'
        ];
        // 执行阶段工具
        var executionTools = [
            'get_student_list',
            'get_teacher_list',
            'get_class_list',
            'create_data_record',
            'update_data_record',
            'delete_data_record',
            'navigate_to_page',
            'render_component',
            'get_page_structure'
        ];
        if (planningTools.includes(toolName)) {
            return ai_smart_model_router_service_1.ExecutionPhase.PLANNING;
        }
        if (executionTools.includes(toolName)) {
            return ai_smart_model_router_service_1.ExecutionPhase.EXECUTION;
        }
        // 根据查询复杂度判断
        var complexityKeywords = ['分析', '策划', '规划', '设计', '复杂', '详细'];
        var isComplex = complexityKeywords.some(function (keyword) { return userQuery.includes(keyword); });
        return isComplex ? ai_smart_model_router_service_1.ExecutionPhase.PLANNING : ai_smart_model_router_service_1.ExecutionPhase.EXECUTION;
    };
    /**
     * 🔄 多轮工具调用的阶段切换逻辑
     * 在TodoList创建完成后，自动切换到执行阶段
     */
    UnifiedIntelligenceService.prototype.executeMultiRoundWithPhases = function (request, sendSSE) {
        return __awaiter(this, void 0, void 0, function () {
            var planningResult, executionResult, error_26;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('🚀 [PhaseExecution] 开始阶段化多轮执行');
                        // 第一阶段：规划阶段
                        console.log('🧠 [Phase1] 规划阶段开始 - 使用Thinking模型');
                        sendSSE('phase_change', {
                            phase: 'planning',
                            message: '🧠 进入规划阶段，使用Thinking模型进行深度分析...'
                        });
                        return [4 /*yield*/, this.executePlanningPhase(request, sendSSE)];
                    case 1:
                        planningResult = _a.sent();
                        // 第二阶段：执行阶段
                        console.log('⚡ [Phase2] 执行阶段开始 - 切换到Flash模型');
                        sendSSE('phase_change', {
                            phase: 'execution',
                            message: '⚡ 切换到执行阶段，使用Flash模型提升响应速度...'
                        });
                        return [4 /*yield*/, this.executeExecutionPhase(planningResult, sendSSE)];
                    case 2:
                        executionResult = _a.sent();
                        console.log('🎉 [PhaseExecution] 阶段化执行完成');
                        return [2 /*return*/, executionResult];
                    case 3:
                        error_26 = _a.sent();
                        console.error('❌ [PhaseExecution] 阶段化执行失败:', error_26);
                        throw error_26;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🧠 执行规划阶段
     */
    UnifiedIntelligenceService.prototype.executePlanningPhase = function (request, sendSSE) {
        return __awaiter(this, void 0, void 0, function () {
            var complexityResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 规划阶段的具体实现
                        // 这里可以调用复杂度分析、TodoList创建等工具
                        console.log('🧠 [PlanningPhase] 执行规划阶段任务');
                        return [4 /*yield*/, this.selectModelForToolExecution('analyze_task_complexity', request.content, ai_smart_model_router_service_1.ExecutionPhase.PLANNING)];
                    case 1:
                        complexityResult = _a.sent();
                        return [2 /*return*/, { phase: 'planning', result: complexityResult }];
                }
            });
        });
    };
    /**
     * ⚡ 执行执行阶段
     */
    UnifiedIntelligenceService.prototype.executeExecutionPhase = function (planningResult, sendSSE) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 执行阶段的具体实现
                // 这里可以调用具体的数据操作、页面导航等工具
                console.log('⚡ [ExecutionPhase] 执行执行阶段任务');
                return [2 /*return*/, { phase: 'execution', planningResult: planningResult, result: 'execution completed' }];
            });
        });
    };
    return UnifiedIntelligenceService;
}());
exports.UnifiedIntelligenceService = UnifiedIntelligenceService;
exports["default"] = new UnifiedIntelligenceService();
