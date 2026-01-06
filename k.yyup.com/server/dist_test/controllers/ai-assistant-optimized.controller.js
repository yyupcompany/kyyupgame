"use strict";
/**
 * 优化后的AI助手控制器
 * 实现三级分层处理，降低70-80%的Token消耗
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
exports.aiAssistantOptimizedController = exports.AIAssistantOptimizedController = void 0;
var logger_1 = require("../utils/logger");
var query_router_service_1 = require("../services/ai/query-router.service");
var direct_response_service_1 = require("../services/ai/direct-response.service");
var semantic_search_service_1 = require("../services/ai/semantic-search.service");
var vector_index_service_1 = require("../services/ai/vector-index.service");
var complexity_evaluator_service_1 = require("../services/ai/complexity-evaluator.service");
var dynamic_context_service_1 = require("../services/ai/dynamic-context.service");
var message_service_1 = require("../services/ai/message.service");
var tool_manager_service_1 = require("../services/ai/tools/core/tool-manager.service");
/**
 * 优化后的AI助手控制器
 */
var AIAssistantOptimizedController = /** @class */ (function () {
    function AIAssistantOptimizedController() {
        this.messageService = new message_service_1.MessageService();
        this.toolManager = new tool_manager_service_1.ToolManagerService();
        this.performanceStats = {
            totalQueries: 0,
            directQueries: 0,
            semanticQueries: 0,
            complexQueries: 0,
            fallbackToComplex: 0,
            totalTokensSaved: 0,
            averageResponseTime: 0
        };
    }
    /**
     * 处理优化后的AI查询
     */
    AIAssistantOptimizedController.prototype.handleOptimizedQuery = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, _c, query, conversationId, userId, complexityEvaluation, isStatusQuery, statusResponse, error_1, routeResult, meta, allowTools, allowWebSearch, userRole, response, actualTokensUsed, _d, isValid, totalTime, error_2;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        startTime = Date.now();
                        _c = req.body, query = _c.query, conversationId = _c.conversationId;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!query || !conversationId) {
                            res.status(400).json({
                                success: false,
                                error: '缺少必要参数: query, conversationId'
                            });
                            return [2 /*return*/];
                        }
                        if (!userId) {
                            res.status(401).json({ success: false, error: '用户未认证' });
                            return [2 /*return*/];
                        }
                        // 🚀 添加明显的调试日志
                        console.log('🚀🚀🚀 [AI助手优化] 控制器方法被调用！', {
                            query: query,
                            conversationId: conversationId,
                            userId: userId,
                            timestamp: new Date().toISOString()
                        });
                        logger_1.logger.info('🚀 [AI助手优化] 开始处理查询', {
                            query: query,
                            conversationId: conversationId,
                            userId: userId,
                            timestamp: new Date().toISOString()
                        });
                        _e.label = 1;
                    case 1:
                        _e.trys.push([1, 16, , 17]);
                        // 🔍 调试：确认代码执行到这里
                        logger_1.logger.info('🔍 [调试] 开始分级处理逻辑', { query: query });
                        // 第一步：复杂度评估
                        logger_1.logger.info('🔍 [调试] 准备调用复杂度评估服务', {
                            serviceExists: !!complexity_evaluator_service_1.complexityEvaluatorService,
                            serviceType: typeof complexity_evaluator_service_1.complexityEvaluatorService
                        });
                        complexityEvaluation = complexity_evaluator_service_1.complexityEvaluatorService.evaluateComplexity(query);
                        logger_1.logger.info('🔍 [调试] 复杂度评估完成', {
                            evaluationExists: !!complexityEvaluation,
                            evaluationType: typeof complexityEvaluation
                        });
                        logger_1.logger.info('🧠 [复杂度评估] 评估结果', {
                            score: complexityEvaluation.score,
                            level: complexityEvaluation.level,
                            estimatedTokens: complexityEvaluation.estimatedTokens,
                            confidence: complexityEvaluation.confidence
                        });
                        // 🚀 特殊处理：现状报表查询（绕过工具调用问题）
                        console.log('🔍 [特殊处理调试] 检查查询:', query);
                        isStatusQuery = this.isStatusReportQuery(query);
                        console.log('🔍 [特殊处理调试] 是否为现状查询:', isStatusQuery);
                        if (!isStatusQuery) return [3 /*break*/, 5];
                        console.log('🎯 [特殊处理] 检测到现状报表查询，直接处理');
                        logger_1.logger.info('🎯 [特殊处理] 检测到现状报表查询，直接处理');
                        _e.label = 2;
                    case 2:
                        _e.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.handleStatusReportQuery(query, userId, req)];
                    case 3:
                        statusResponse = _e.sent();
                        console.log('✅ [特殊处理] 现状报表数据获取成功:', {
                            hasResponse: !!statusResponse.response,
                            hasUIInstruction: !!statusResponse.ui_instruction,
                            hasData: !!statusResponse.data
                        });
                        res.json({
                            success: true,
                            data: {
                                response: statusResponse.response,
                                level: query_router_service_1.ProcessingLevel.DIRECT,
                                confidence: 1.0,
                                tokensUsed: 0,
                                estimatedTokens: 0,
                                tokensSaved: 3000,
                                processingTime: Date.now() - startTime,
                                ui_instruction: statusResponse.ui_instruction,
                                additionalData: statusResponse.data
                            }
                        });
                        logger_1.logger.info('✅ [特殊处理] 现状报表查询处理完成');
                        return [2 /*return*/];
                    case 4:
                        error_1 = _e.sent();
                        console.error('❌ [特殊处理] 现状报表处理失败:', error_1);
                        logger_1.logger.error('❌ [特殊处理] 现状报表处理失败', { error: error_1 });
                        return [3 /*break*/, 5];
                    case 5: return [4 /*yield*/, query_router_service_1.queryRouterService.routeQuery(query)];
                    case 6:
                        routeResult = _e.sent();
                        // 🎯 修复：如果是直接匹配，不允许复杂度评估覆盖路由结果
                        if (routeResult.level === query_router_service_1.ProcessingLevel.DIRECT) {
                            logger_1.logger.info('🔒 [查询路由] 直接匹配优先，跳过复杂度评估调整', {
                                query: query,
                                directResponse: routeResult.directResponse,
                                level: query_router_service_1.ProcessingLevel.DIRECT
                            });
                        }
                        else if (complexityEvaluation.recommendedStrategy.level === 'ai_full' &&
                            routeResult.level !== query_router_service_1.ProcessingLevel.COMPLEX) {
                            routeResult.level = query_router_service_1.ProcessingLevel.COMPLEX;
                            routeResult.estimatedTokens = complexityEvaluation.estimatedTokens;
                            logger_1.logger.info('🔄 [查询路由] 根据复杂度评估调整路由级别', {
                                originalLevel: routeResult.level,
                                adjustedLevel: query_router_service_1.ProcessingLevel.COMPLEX
                            });
                        }
                        logger_1.logger.info('📊 [查询路由] 最终路由结果', {
                            level: routeResult.level,
                            confidence: routeResult.confidence,
                            estimatedTokens: routeResult.estimatedTokens,
                            processingTime: routeResult.processingTime
                        });
                        meta = (req.body && (req.body.metadata || req.body.meta)) || {};
                        allowTools = !!meta.enableTools;
                        allowWebSearch = !!meta.enableWebSearch;
                        userRole = (meta.userRole || ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'user');
                        logger_1.logger.info('🔍 [参数调试] 前端传入的参数', {
                            meta: meta,
                            allowTools: allowTools,
                            allowWebSearch: allowWebSearch,
                            userRole: userRole,
                            'meta.enableTools': meta.enableTools,
                            'meta.userRole': meta.userRole
                        });
                        response = void 0;
                        actualTokensUsed = 0;
                        // 添加路由结果调试信息
                        logger_1.logger.info('🔍 [路由结果] 详细信息', {
                            routeResult: JSON.stringify(routeResult, null, 2)
                        });
                        _d = routeResult.level;
                        switch (_d) {
                            case query_router_service_1.ProcessingLevel.DIRECT: return [3 /*break*/, 7];
                            case query_router_service_1.ProcessingLevel.COMPLEX: return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 7: return [4 /*yield*/, this.handleDirectQuery(query, routeResult)];
                    case 8:
                        response = _e.sent();
                        actualTokensUsed = response.tokensUsed || 0;
                        this.performanceStats.directQueries++;
                        logger_1.logger.info('✅ [DIRECT级别] 直接查询完成', {
                            hasResponse: !!(response === null || response === void 0 ? void 0 : response.response),
                            tokensUsed: response === null || response === void 0 ? void 0 : response.tokensUsed
                        });
                        isValid = this.isValidResponse(response);
                        if (!!isValid) return [3 /*break*/, 10];
                        logger_1.logger.info('🔄 [兜底机制] DIRECT级别无结果，升级到COMPLEX级别', { query: query });
                        return [4 /*yield*/, this.handleComplexQuery(query, routeResult, conversationId, userId, { allowTools: allowTools, allowWebSearch: allowWebSearch, userRole: userRole })];
                    case 9:
                        response = _e.sent();
                        actualTokensUsed = response.tokensUsed || routeResult.estimatedTokens;
                        this.performanceStats.complexQueries++;
                        this.performanceStats.fallbackToComplex++;
                        _e.label = 10;
                    case 10: return [3 /*break*/, 15];
                    case 11: return [4 /*yield*/, this.handleComplexQuery(query, routeResult, conversationId, userId, { allowTools: allowTools, allowWebSearch: allowWebSearch, userRole: userRole })];
                    case 12:
                        response = _e.sent();
                        actualTokensUsed = response.tokensUsed || routeResult.estimatedTokens;
                        this.performanceStats.complexQueries++;
                        logger_1.logger.info('✅ [COMPLEX级别] 复杂查询完成', {
                            tokensUsed: actualTokensUsed
                        });
                        return [3 /*break*/, 15];
                    case 13:
                        // 未知级别，默认使用COMPLEX级别
                        logger_1.logger.warn('⚠️ [查询路由] 未知的处理级别，默认使用COMPLEX', { level: routeResult.level });
                        return [4 /*yield*/, this.handleComplexQuery(query, routeResult, conversationId, userId, { allowTools: allowTools, allowWebSearch: allowWebSearch, userRole: userRole })];
                    case 14:
                        response = _e.sent();
                        actualTokensUsed = response.tokensUsed || routeResult.estimatedTokens;
                        this.performanceStats.complexQueries++;
                        return [3 /*break*/, 15];
                    case 15:
                        // 更新性能统计
                        this.updatePerformanceStats(startTime, actualTokensUsed, routeResult.estimatedTokens);
                        totalTime = Date.now() - startTime;
                        res.json({
                            success: true,
                            data: {
                                response: response.response,
                                level: routeResult.level,
                                confidence: routeResult.confidence,
                                tokensUsed: actualTokensUsed,
                                estimatedTokens: routeResult.estimatedTokens,
                                tokensSaved: Math.max(0, 3000 - actualTokensUsed),
                                processingTime: totalTime,
                                navigationPath: response.navigationPath,
                                additionalData: response.data
                            }
                        });
                        logger_1.logger.info('✅ [AI助手优化] 查询处理完成', {
                            level: routeResult.level,
                            tokensUsed: actualTokensUsed,
                            tokensSaved: Math.max(0, 3000 - actualTokensUsed),
                            processingTime: totalTime
                        });
                        return [3 /*break*/, 17];
                    case 16:
                        error_2 = _e.sent();
                        logger_1.logger.error('❌ [AI助手优化] 处理失败', {
                            query: query,
                            error: error_2 instanceof Error ? error_2.message : '未知错误',
                            stack: error_2 instanceof Error ? error_2.stack : undefined
                        });
                        res.status(500).json({
                            success: false,
                            error: '查询处理失败',
                            message: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        return [3 /*break*/, 17];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理第一级：直接查询
     */
    AIAssistantOptimizedController.prototype.handleDirectQuery = function (query, routeResult) {
        return __awaiter(this, void 0, void 0, function () {
            var directMatch, result, extractedAction, result, fallbackResult, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info('⚡ [直接查询] 开始处理', { query: query });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        directMatch = query_router_service_1.queryRouterService.checkDirectMatch(query);
                        logger_1.logger.info('🔍 [直接查询] 检查直接匹配结果', {
                            query: query,
                            directMatch: directMatch ? {
                                response: directMatch.response,
                                action: directMatch.action,
                                tokens: directMatch.tokens
                            } : null
                        });
                        if (!(directMatch && directMatch.action)) return [3 /*break*/, 3];
                        return [4 /*yield*/, direct_response_service_1.directResponseService.executeDirectAction(directMatch.action, query)];
                    case 2:
                        result = _a.sent();
                        logger_1.logger.info('✅ [直接查询] 使用action字段处理完成', {
                            action: directMatch.action,
                            tokensUsed: result.tokensUsed,
                            processingTime: result.processingTime,
                            success: result.success
                        });
                        return [2 /*return*/, result];
                    case 3:
                        extractedAction = this.extractActionFromDirectResponse(routeResult.directResponse);
                        if (!extractedAction) return [3 /*break*/, 5];
                        return [4 /*yield*/, direct_response_service_1.directResponseService.executeDirectAction(extractedAction, query)];
                    case 4:
                        result = _a.sent();
                        logger_1.logger.info('✅ [直接查询] 使用提取动作处理完成', {
                            extractedAction: extractedAction,
                            tokensUsed: result.tokensUsed,
                            processingTime: result.processingTime,
                            success: result.success
                        });
                        return [2 /*return*/, result];
                    case 5:
                        fallbackResult = {
                            success: true,
                            response: routeResult.directResponse,
                            tokensUsed: routeResult.estimatedTokens,
                            processingTime: routeResult.processingTime
                        };
                        logger_1.logger.info('✅ [直接查询] 返回兜底响应', {
                            fallbackResult: JSON.stringify(fallbackResult, null, 2)
                        });
                        return [2 /*return*/, fallbackResult];
                    case 6:
                        error_3 = _a.sent();
                        logger_1.logger.error('❌ [直接查询] 处理失败', {
                            query: query,
                            error: error_3 instanceof Error ? error_3.message : '未知错误',
                            stack: error_3 instanceof Error ? error_3.stack : undefined
                        });
                        // 返回一个表示失败的响应，让兜底机制处理
                        return [2 /*return*/, {
                                success: false,
                                response: '直接查询处理失败',
                                error: error_3 instanceof Error ? error_3.message : '未知错误',
                                tokensUsed: 0,
                                processingTime: 0
                            }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理第二级：语义查询
     */
    AIAssistantOptimizedController.prototype.handleSemanticQuery = function (query, routeResult, conversationId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var semanticMatches, topMatch, directResult, enhancedContext, simplifiedSystemPrompt, aiResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info('📊 [语义查询] 开始处理', {
                            query: query,
                            matchedKeywords: routeResult.matchedKeywords
                        });
                        return [4 /*yield*/, semantic_search_service_1.semanticSearchService.performSemanticSearch(query, 3)];
                    case 1:
                        semanticMatches = _a.sent();
                        if (!(semanticMatches.length > 0 && semanticMatches[0].confidence > 0.8)) return [3 /*break*/, 3];
                        topMatch = semanticMatches[0];
                        if (!topMatch.suggestedAction) return [3 /*break*/, 3];
                        logger_1.logger.info('🎯 [语义查询] 高置信度匹配，执行直接动作', {
                            entity: topMatch.entity,
                            confidence: topMatch.confidence,
                            action: topMatch.suggestedAction
                        });
                        return [4 /*yield*/, direct_response_service_1.directResponseService.executeDirectAction(topMatch.suggestedAction, query)];
                    case 2:
                        directResult = _a.sent();
                        if (directResult.success) {
                            return [2 /*return*/, {
                                    response: directResult.response,
                                    tokensUsed: directResult.tokensUsed + 50,
                                    processingTime: directResult.processingTime,
                                    semanticMatches: semanticMatches.slice(0, 2),
                                    method: 'semantic_direct'
                                }];
                        }
                        _a.label = 3;
                    case 3:
                        enhancedContext = this.buildEnhancedContext(routeResult.matchedKeywords, semanticMatches);
                        simplifiedSystemPrompt = this.buildSimplifiedSystemPrompt(enhancedContext);
                        return [4 /*yield*/, this.callAIWithLimitedContext(query, simplifiedSystemPrompt, userId, routeResult.estimatedTokens)];
                    case 4:
                        aiResponse = _a.sent();
                        logger_1.logger.info('✅ [语义查询] 处理完成', {
                            tokensUsed: aiResponse.tokensUsed,
                            processingTime: aiResponse.processingTime,
                            semanticMatchCount: semanticMatches.length
                        });
                        return [2 /*return*/, __assign(__assign({}, aiResponse), { semanticMatches: semanticMatches.slice(0, 2), method: 'semantic_ai' })];
                }
            });
        });
    };
    /**
     * 处理第三级：复杂查询
     */
    AIAssistantOptimizedController.prototype.handleComplexQuery = function (query, routeResult, conversationId, userId, options) {
        return __awaiter(this, void 0, void 0, function () {
            var startedAt, complexityEvaluation, contextConfig, conversationHistory, userMemory, dynamicContext, allowTools, allowWebSearch, userRole, selectedTools, toolSelectionContext, startToolSelect, startSend, aiMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info('🧠 [复杂查询] 开始处理', { query: query });
                        startedAt = Date.now();
                        complexityEvaluation = complexity_evaluator_service_1.complexityEvaluatorService.evaluateComplexity(query);
                        contextConfig = {
                            size: complexityEvaluation.recommendedStrategy.contextSize,
                            includeHistory: complexityEvaluation.recommendedStrategy.useHistory,
                            includeMemory: complexityEvaluation.recommendedStrategy.useMemory,
                            includePageContext: true,
                            includeUserProfile: true,
                            maxTokens: complexityEvaluation.recommendedStrategy.maxTokens
                        };
                        return [4 /*yield*/, this.getConversationHistory(conversationId, 10)];
                    case 1:
                        conversationHistory = _a.sent();
                        return [4 /*yield*/, this.getUserMemory(userId, 5)];
                    case 2:
                        userMemory = _a.sent();
                        dynamicContext = dynamic_context_service_1.dynamicContextService.buildDynamicContext(contextConfig, query, userId, conversationHistory, { currentPage: 'ai-assistant' }, userMemory);
                        logger_1.logger.info('📝 [复杂查询] 动态上下文构建完成', {
                            totalTokens: dynamicContext.totalTokens,
                            componentCount: dynamicContext.components.length,
                            truncated: dynamicContext.truncated,
                            systemPromptLength: dynamicContext.systemPrompt.length,
                            contextSize: contextConfig.size
                        });
                        // 记录系统提示词内容（用于调试）
                        console.log('🔍 [调试] 复杂查询系统提示词:', dynamicContext.systemPrompt.substring(0, 500) + '...');
                        allowTools = options.allowTools, allowWebSearch = options.allowWebSearch, userRole = options.userRole;
                        selectedTools = [];
                        if (!(allowTools && (userRole === null || userRole === void 0 ? void 0 : userRole.toLowerCase()) === 'admin')) return [3 /*break*/, 4];
                        logger_1.logger.info('🔧 [工具选择] 开始智能选择工具');
                        toolSelectionContext = {
                            query: query,
                            userRole: userRole,
                            userId: userId,
                            conversationId: conversationId,
                            maxTools: 3 // 严格限制数量，减小请求体
                        };
                        startToolSelect = Date.now();
                        return [4 /*yield*/, this.toolManager.getToolsForQuery(toolSelectionContext)];
                    case 3:
                        selectedTools = _a.sent();
                        logger_1.logger.info('✅ [工具选择] 完成', {
                            toolCount: selectedTools.length,
                            tools: selectedTools.map(function (t) { return t.name; }),
                            estimatedSize: JSON.stringify(selectedTools).length,
                            elapsed: Date.now() - startToolSelect
                        });
                        // 记录工具详细信息（用于调试）
                        console.log('🔧 [调试] 选择的工具详情:', selectedTools.map(function (t) {
                            var _a, _b;
                            return ({
                                name: t.name,
                                description: ((_a = t.description) === null || _a === void 0 ? void 0 : _a.substring(0, 100)) + '...',
                                parametersCount: Object.keys(((_b = t.parameters) === null || _b === void 0 ? void 0 : _b.properties) || {}).length
                            });
                        }));
                        // 如未启用网页搜索，从集合剔除 web_search
                        if (!allowWebSearch) {
                            selectedTools = selectedTools.filter(function (t) { return t.name !== 'web_search'; });
                        }
                        // 兜底：不超过3个
                        if (selectedTools.length > 3) {
                            selectedTools = selectedTools.slice(0, 3);
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        if (allowWebSearch) {
                            // 即使未启用常规工具，如果启用了网页搜索，也要注入web_search工具
                            logger_1.logger.info('🌐 [网页搜索] 单独启用网页搜索工具');
                            selectedTools = [{
                                    type: 'function',
                                    "function": {
                                        name: 'web_search',
                                        description: '搜索网络信息，获取最新的政策、新闻、资讯等内容',
                                        parameters: {
                                            type: 'object',
                                            properties: {
                                                query: {
                                                    type: 'string',
                                                    description: '搜索关键词或问题'
                                                },
                                                searchType: {
                                                    type: 'string',
                                                    "enum": ['general', 'news', 'policy', 'academic'],
                                                    description: '搜索类型：general-综合搜索，news-新闻搜索，policy-政策搜索，academic-学术搜索',
                                                    "default": 'general'
                                                }
                                            },
                                            required: ['query']
                                        }
                                    }
                                }];
                        }
                        else {
                            logger_1.logger.info('🚫 [工具选择] 未启用工具或网页搜索，跳过工具注入', { allowTools: allowTools, allowWebSearch: allowWebSearch, userRole: userRole });
                        }
                        _a.label = 5;
                    case 5:
                        startSend = Date.now();
                        return [4 /*yield*/, this.messageService.sendMessage({
                                conversationId: conversationId,
                                userId: userId,
                                content: query,
                                metadata: {
                                    optimizationLevel: 'complex',
                                    estimatedTokens: routeResult.estimatedTokens,
                                    complexityScore: complexityEvaluation.score,
                                    contextTokens: dynamicContext.totalTokens,
                                    systemPrompt: dynamicContext.systemPrompt,
                                    enableTools: allowTools && (userRole === null || userRole === void 0 ? void 0 : userRole.toLowerCase()) === 'admin',
                                    enableWebSearch: allowWebSearch,
                                    selectedTools: selectedTools,
                                    // 🚀 修复：确保角色正确传递
                                    userRole: userRole || 'user'
                                }
                            })];
                    case 6:
                        aiMessage = _a.sent();
                        logger_1.logger.info('⏱️ [消息发送] 完成', { elapsed: Date.now() - startSend });
                        logger_1.logger.info('✅ [复杂查询] 处理完成', {
                            messageId: aiMessage.id,
                            tokensUsed: routeResult.estimatedTokens,
                            complexityScore: complexityEvaluation.score
                        });
                        return [2 /*return*/, {
                                response: aiMessage.content,
                                tokensUsed: routeResult.estimatedTokens,
                                processingTime: Date.now() - startedAt,
                                complexityEvaluation: {
                                    score: complexityEvaluation.score,
                                    level: complexityEvaluation.level,
                                    confidence: complexityEvaluation.confidence
                                },
                                contextInfo: {
                                    totalTokens: dynamicContext.totalTokens,
                                    componentCount: dynamicContext.components.length,
                                    truncated: dynamicContext.truncated
                                },
                                method: 'complex_ai'
                            }];
                }
            });
        });
    };
    /**
     * 从直接响应中提取动作
     */
    AIAssistantOptimizedController.prototype.extractActionFromDirectResponse = function (directResponse) {
        // 添加调试日志
        logger_1.logger.info('🔍 [动作提取] 分析直接响应', {
            directResponse: directResponse,
            includes学生总数: directResponse === null || directResponse === void 0 ? void 0 : directResponse.includes('学生总数')
        });
        // 原有功能
        if (directResponse.includes('学生总数'))
            return 'count_students';
        if (directResponse.includes('教师总数'))
            return 'count_teachers';
        if (directResponse.includes('今日活动'))
            return 'get_today_activities';
        if (directResponse.includes('学生添加'))
            return 'navigate_to_student_create';
        if (directResponse.includes('学生列表'))
            return 'navigate_to_student_list';
        if (directResponse.includes('班级管理'))
            return 'navigate_to_class_management';
        if (directResponse.includes('考勤统计'))
            return 'get_attendance_stats';
        if (directResponse.includes('费用统计'))
            return 'get_fee_stats';
        if (directResponse.includes('活动列表'))
            return 'get_activity_list';
        // 家长管理
        if (directResponse.includes('家长总数'))
            return 'count_parents';
        if (directResponse.includes('家长列表'))
            return 'navigate_to_parent_list';
        if (directResponse.includes('家长添加'))
            return 'navigate_to_parent_create';
        // 班级管理扩展
        if (directResponse.includes('班级总数'))
            return 'count_classes';
        if (directResponse.includes('班级列表'))
            return 'navigate_to_class_list';
        if (directResponse.includes('班级添加'))
            return 'navigate_to_class_create';
        // 招生管理
        if (directResponse.includes('招生统计'))
            return 'get_enrollment_stats';
        if (directResponse.includes('招生计划'))
            return 'navigate_to_enrollment_plans';
        if (directResponse.includes('招生申请'))
            return 'navigate_to_enrollment_applications';
        if (directResponse.includes('招生咨询'))
            return 'navigate_to_enrollment_consultations';
        // 用户权限管理
        if (directResponse.includes('用户总数'))
            return 'count_users';
        if (directResponse.includes('用户列表'))
            return 'navigate_to_user_list';
        if (directResponse.includes('角色管理'))
            return 'navigate_to_role_management';
        if (directResponse.includes('权限设置'))
            return 'navigate_to_permission_settings';
        // 营销管理
        if (directResponse.includes('客户统计'))
            return 'get_customer_stats';
        if (directResponse.includes('营销活动'))
            return 'navigate_to_marketing_campaigns';
        if (directResponse.includes('客户池'))
            return 'navigate_to_customer_pool';
        // 系统管理
        if (directResponse.includes('系统设置'))
            return 'navigate_to_system_settings';
        if (directResponse.includes('操作日志'))
            return 'navigate_to_operation_logs';
        if (directResponse.includes('系统状态'))
            return 'get_system_status';
        return null;
    };
    /**
     * 构建轻量级上下文
     */
    AIAssistantOptimizedController.prototype.buildLightContext = function (matchedKeywords) {
        var contextParts = [];
        if (matchedKeywords.some(function (k) { return k.includes('student'); })) {
            contextParts.push('学生管理相关功能');
        }
        if (matchedKeywords.some(function (k) { return k.includes('teacher'); })) {
            contextParts.push('教师管理相关功能');
        }
        if (matchedKeywords.some(function (k) { return k.includes('activity'); })) {
            contextParts.push('活动管理相关功能');
        }
        if (matchedKeywords.some(function (k) { return k.includes('attendance'); })) {
            contextParts.push('考勤管理相关功能');
        }
        return contextParts.join('、');
    };
    /**
     * 构建增强上下文（包含语义匹配信息）
     */
    AIAssistantOptimizedController.prototype.buildEnhancedContext = function (matchedKeywords, semanticMatches) {
        var baseContext = this.buildLightContext(matchedKeywords);
        if (semanticMatches.length === 0) {
            return baseContext;
        }
        var semanticInfo = semanticMatches.map(function (match) {
            return "".concat(match.entity, "(\u7F6E\u4FE1\u5EA6:").concat((match.confidence * 100).toFixed(1), "%)");
        }).join('、');
        return "".concat(baseContext, "\u3002\u76F8\u5173\u5B9E\u4F53\uFF1A").concat(semanticInfo);
    };
    /**
     * 构建简化的系统提示词
     */
    AIAssistantOptimizedController.prototype.buildSimplifiedSystemPrompt = function (lightContext) {
        return "\u4F60\u662F\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u7684AI\u52A9\u624B\u3002\u5F53\u524D\u4E0A\u4E0B\u6587\uFF1A".concat(lightContext, "\u3002\n\u8BF7\u7B80\u6D01\u3001\u51C6\u786E\u5730\u56DE\u7B54\u7528\u6237\u95EE\u9898\uFF0C\u907F\u514D\u5197\u957F\u7684\u89E3\u91CA\u3002\u5982\u679C\u9700\u8981\u8DF3\u8F6C\u9875\u9762\uFF0C\u8BF7\u660E\u786E\u8BF4\u660E\u3002");
    };
    /**
     * 使用限制上下文调用AI
     */
    AIAssistantOptimizedController.prototype.callAIWithLimitedContext = function (query, systemPrompt, userId, maxTokens) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里应该调用简化的AI服务
                // 暂时返回模拟响应
                return [2 /*return*/, {
                        response: "\u57FA\u4E8E\u8BED\u4E49\u5206\u6790\u7684\u56DE\u7B54\uFF1A".concat(query),
                        tokensUsed: Math.min(maxTokens, 500),
                        processingTime: 1500
                    }];
            });
        });
    };
    /**
     * 获取对话历史
     */
    AIAssistantOptimizedController.prototype.getConversationHistory = function (conversationId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 简化实现，实际应该从数据库获取
                return [2 /*return*/, []];
            });
        });
    };
    /**
     * 获取用户记忆
     */
    AIAssistantOptimizedController.prototype.getUserMemory = function (userId, limit) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 简化实现，实际应该从记忆系统获取
                return [2 /*return*/, []];
            });
        });
    };
    /**
     * 检查响应是否有效（兜底机制判断条件）
     */
    AIAssistantOptimizedController.prototype.isValidResponse = function (response) {
        // 安全的调试日志
        logger_1.logger.info('🔍 [兜底检查] 开始验证响应 - 安全版');
        logger_1.logger.info('🔍 [兜底检查] 响应存在:', !!response);
        logger_1.logger.info('🔍 [兜底检查] 响应类型:', typeof response);
        if (response) {
            logger_1.logger.info('🔍 [兜底检查] 响应属性检查:');
            logger_1.logger.info('  - hasResponse:', !!response.response);
            logger_1.logger.info('  - hasSuccess:', 'success' in response);
            logger_1.logger.info('  - hasTokensUsed:', 'tokensUsed' in response);
            logger_1.logger.info('  - hasData:', !!response.data);
            if (response.response) {
                logger_1.logger.info('  - responseContent:', response.response);
                logger_1.logger.info('  - responseLength:', response.response.length);
            }
            if ('success' in response) {
                logger_1.logger.info('  - successValue:', response.success);
            }
            if ('tokensUsed' in response) {
                logger_1.logger.info('  - tokensUsedValue:', response.tokensUsed);
            }
            if (response.data) {
                logger_1.logger.info('  - dataContent:', response.data);
            }
        }
        // 检查响应是否存在且成功
        if (!response) {
            logger_1.logger.warn('🔍 [兜底检查] 响应为空');
            return false;
        }
        // 检查是否明确失败
        if (response.success === false) {
            logger_1.logger.warn('🔍 [兜底检查] 响应标记为失败', { response: response });
            return false;
        }
        // 检查是否有实际内容
        if (!response.response && !response.data) {
            logger_1.logger.warn('🔍 [兜底检查] 响应无内容');
            return false;
        }
        // 检查是否是无效的默认响应
        var invalidResponses = [
            '暂不支持此类查询',
            '无法处理该请求',
            '查询失败',
            '未找到相关信息'
        ];
        // 详细检查每个无效响应（排除空字符串检查，避免误判）
        for (var _i = 0, invalidResponses_1 = invalidResponses; _i < invalidResponses_1.length; _i++) {
            var invalid = invalidResponses_1[_i];
            if (typeof response.response === 'string' && invalid.length > 0 && response.response.includes(invalid)) {
                logger_1.logger.warn('🔍 [兜底检查] 响应为无效默认内容', {
                    response: response.response,
                    matchedInvalid: invalid,
                    invalidResponsesList: invalidResponses
                });
                return false;
            }
        }
        // 单独检查空响应
        if (typeof response.response === 'string' && response.response.trim() === '') {
            logger_1.logger.warn('🔍 [兜底检查] 响应为空字符串');
            return false;
        }
        // 如果通过了所有检查，记录成功信息
        logger_1.logger.info('✅ [兜底检查] 响应验证通过', {
            response: response.response,
            hasData: !!response.data
        });
        // 检查Token使用量是否为0（可能表示处理失败）
        if (response.tokensUsed === 0 && response.response && response.response.length > 10) {
            logger_1.logger.warn('🔍 [兜底检查] Token使用量为0但有响应内容，可能处理异常');
            return false;
        }
        logger_1.logger.info('✅ [兜底检查] 响应有效', {
            hasResponse: !!response.response,
            hasData: !!response.data,
            tokensUsed: response.tokensUsed
        });
        return true;
    };
    /**
     * 更新性能统计
     */
    AIAssistantOptimizedController.prototype.updatePerformanceStats = function (startTime, actualTokens, estimatedTokens) {
        this.performanceStats.totalQueries++;
        this.performanceStats.totalTokensSaved += Math.max(0, 3000 - actualTokens);
        var responseTime = Date.now() - startTime;
        this.performanceStats.averageResponseTime =
            (this.performanceStats.averageResponseTime * (this.performanceStats.totalQueries - 1) + responseTime)
                / this.performanceStats.totalQueries;
    };
    /**
     * 获取性能统计
     */
    AIAssistantOptimizedController.prototype.getPerformanceStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var routerStats, directServiceStats, semanticCacheStats, vectorIndexStats, complexityStats, contextStats;
            return __generator(this, function (_a) {
                routerStats = query_router_service_1.queryRouterService.getStats();
                directServiceStats = direct_response_service_1.directResponseService.getServiceStats();
                semanticCacheStats = semantic_search_service_1.semanticSearchService.getCacheStats();
                vectorIndexStats = vector_index_service_1.vectorIndexService.getIndexStats();
                complexityStats = complexity_evaluator_service_1.complexityEvaluatorService.getEvaluationStats();
                contextStats = dynamic_context_service_1.dynamicContextService.getContextStats();
                res.json({
                    success: true,
                    data: {
                        performance: this.performanceStats,
                        router: routerStats,
                        directService: directServiceStats,
                        semanticSearch: {
                            cache: semanticCacheStats,
                            entityStats: semantic_search_service_1.semanticSearchService.getEntityStats()
                        },
                        vectorIndex: vectorIndexStats,
                        complexityEvaluator: complexityStats,
                        dynamicContext: contextStats,
                        optimization: {
                            tokenSavingRate: this.performanceStats.totalQueries > 0
                                ? ((this.performanceStats.totalTokensSaved / (this.performanceStats.totalQueries * 3000)) * 100).toFixed(1) + '%'
                                : '0%',
                            directQueryRate: this.performanceStats.totalQueries > 0
                                ? ((this.performanceStats.directQueries / this.performanceStats.totalQueries) * 100).toFixed(1) + '%'
                                : '0%',
                            semanticQueryRate: this.performanceStats.totalQueries > 0
                                ? ((this.performanceStats.semanticQueries / this.performanceStats.totalQueries) * 100).toFixed(1) + '%'
                                : '0%',
                            complexQueryRate: this.performanceStats.totalQueries > 0
                                ? ((this.performanceStats.complexQueries / this.performanceStats.totalQueries) * 100).toFixed(1) + '%'
                                : '0%'
                        }
                    }
                });
                return [2 /*return*/];
            });
        });
    };
    /**
     * 检测是否为现状报表查询
     */
    AIAssistantOptimizedController.prototype.isStatusReportQuery = function (query) {
        var statusKeywords = ['现状', '状态', '情况', '概况'];
        var reportKeywords = ['报表', '图表', '统计', '数据', '显示', '展示'];
        var hasStatusKeyword = statusKeywords.some(function (keyword) { return query.includes(keyword); });
        var hasReportKeyword = reportKeywords.some(function (keyword) { return query.includes(keyword); });
        return hasStatusKeyword && hasReportKeyword;
    };
    /**
     * 处理现状报表查询
     */
    AIAssistantOptimizedController.prototype.handleStatusReportQuery = function (query, userId, req) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
        return __awaiter(this, void 0, void 0, function () {
            var axios, response, statusData, componentData, ui_instruction, innerError_1, error_4;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 5, , 6]);
                        logger_1.logger.info('🔍 [现状报表] 开始获取机构现状数据');
                        _l.label = 1;
                    case 1:
                        _l.trys.push([1, 3, , 4]);
                        axios = require('axios');
                        return [4 /*yield*/, axios.get('http://localhost:3000/api/organization-status/1/ai-format', {
                                headers: {
                                    'Authorization': "Bearer ".concat((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', ''))
                                }
                            })];
                    case 2:
                        response = _l.sent();
                        if (!response.data || response.data.code !== 200) {
                            throw new Error('机构现状API返回异常');
                        }
                        statusData = response.data;
                        if (!statusData || !statusData.data) {
                            throw new Error('无法获取机构现状数据');
                        }
                        logger_1.logger.info('✅ [现状报表] 机构现状数据获取成功', {
                            hasText: !!statusData.data.text,
                            hasRawData: !!statusData.data.rawData,
                            textLength: ((_b = statusData.data.text) === null || _b === void 0 ? void 0 : _b.length) || 0
                        });
                        componentData = {
                            type: 'stat-card',
                            title: '机构现状报表',
                            data: {
                                totalClasses: ((_c = statusData.data.rawData) === null || _c === void 0 ? void 0 : _c.totalClasses) || 0,
                                totalStudents: ((_d = statusData.data.rawData) === null || _d === void 0 ? void 0 : _d.totalStudents) || 0,
                                totalTeachers: ((_e = statusData.data.rawData) === null || _e === void 0 ? void 0 : _e.totalTeachers) || 0,
                                enrollmentRate: parseFloat(String(((_f = statusData.data.rawData) === null || _f === void 0 ? void 0 : _f.enrollmentRate) || '0')),
                                // 添加更多统计数据
                                activeStudents: ((_g = statusData.data.rawData) === null || _g === void 0 ? void 0 : _g.totalStudents) || 0,
                                teacherStudentRatio: ((_h = statusData.data.rawData) === null || _h === void 0 ? void 0 : _h.totalTeachers) && ((_j = statusData.data.rawData) === null || _j === void 0 ? void 0 : _j.totalStudents)
                                    ? (statusData.data.rawData.totalStudents / statusData.data.rawData.totalTeachers).toFixed(1)
                                    : '0',
                                capacityUtilization: ((_k = statusData.data.rawData) === null || _k === void 0 ? void 0 : _k.enrollmentRate) || '0'
                            }
                        };
                        ui_instruction = {
                            type: 'render_component',
                            component: componentData
                        };
                        logger_1.logger.info('✅ [现状报表] 组件数据构造完成', {
                            componentType: componentData.type,
                            dataKeys: Object.keys(componentData.data),
                            uiInstructionType: ui_instruction.type
                        });
                        return [2 /*return*/, {
                                response: '为您展示机构现状报表，包含班级、学生、教师等关键指标数据：',
                                ui_instruction: ui_instruction,
                                data: componentData
                            }];
                    case 3:
                        innerError_1 = _l.sent();
                        logger_1.logger.error('❌ [现状报表] 内部API调用失败', {
                            error: innerError_1 instanceof Error ? innerError_1.message : '未知错误'
                        });
                        throw innerError_1;
                    case 4: return [3 /*break*/, 6];
                    case 5:
                        error_4 = _l.sent();
                        logger_1.logger.error('❌ [现状报表] 处理失败', {
                            error: error_4 instanceof Error ? error_4.message : '未知错误',
                            stack: error_4 instanceof Error ? error_4.stack : undefined
                        });
                        // 返回降级响应
                        return [2 /*return*/, {
                                response: '抱歉，暂时无法获取机构现状数据，请稍后重试。',
                                ui_instruction: null,
                                data: null
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return AIAssistantOptimizedController;
}());
exports.AIAssistantOptimizedController = AIAssistantOptimizedController;
// 导出控制器实例
exports.aiAssistantOptimizedController = new AIAssistantOptimizedController();
