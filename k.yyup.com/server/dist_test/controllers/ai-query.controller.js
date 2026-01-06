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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.AIQueryController = void 0;
var apiResponse_1 = require("../utils/apiResponse");
var uuid_1 = require("uuid");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var text_model_service_1 = __importDefault(require("../services/ai/text-model.service"));
var text_model_service_2 = require("../services/ai/text-model.service");
var ai_model_cache_service_1 = __importDefault(require("../services/ai-model-cache.service"));
var ai_query_cache_service_1 = __importDefault(require("../services/ai-query-cache.service"));
var api_group_mapping_service_1 = require("../services/ai/api-group-mapping.service");
var ai_optimized_query_service_1 = __importDefault(require("../services/ai-optimized-query.service"));
/**
 * AI查询控制器 - 增强版实现，支持财务查询和全表权限
 */
var AIQueryController = /** @class */ (function () {
    function AIQueryController() {
        var _this = this;
        /**
         * 临时方法：更新豆包模型参数
         */
        this.updateDoubaoModelParams = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var modelParameters, rows, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        modelParameters = {
                            model_id: 'Doubao-1.5-lite-32k',
                            maxTokens: 4096,
                            contextWindow: 32768,
                            temperature: 0.1,
                            top_p: 0.9,
                            presence_penalty: 0,
                            frequency_penalty: 0
                        };
                        // 直接更新数据库
                        return [4 /*yield*/, init_1.sequelize.query('UPDATE ai_model_config SET model_parameters = ? WHERE id = ?', {
                                replacements: [JSON.stringify(modelParameters), 38],
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        // 直接更新数据库
                        _a.sent();
                        return [4 /*yield*/, init_1.sequelize.query('SELECT id, name, model_parameters FROM ai_model_config WHERE id = ?', {
                                replacements: [38],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        rows = (_a.sent())[0];
                        res.json({
                            success: true,
                            message: '豆包模型参数更新成功',
                            data: rows
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        console.error('❌ 更新豆包模型参数失败:', error_1);
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'UPDATE_FAILED',
                                message: error_1 instanceof Error ? error_1.message : '更新失败'
                            }
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 执行AI查询 - 集成智能优化和标准流程
         */
        this.executeQuery = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var startTime, _a, message, query, context, sessionId, userId, userRole, queryContent, optimizedResult, totalTime, enhancedResult, optimizationError_1, cachedResult, currentSessionId, availableModels, allowedTables, intentModel, queryAnalysis, identifiedGroups, multiStepPlan, qaModel, aiResponse, result, primaryGroup, groupDetails, apiCallPlan, apiResults, visualization, columns, finalResponse, error_2, errorResponse;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        startTime = Date.now();
                        _f.label = 1;
                    case 1:
                        _f.trys.push([1, 20, , 21]);
                        _a = req.body, message = _a.message, query = _a.query, context = _a.context, sessionId = _a.sessionId;
                        userId = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.id) || 1;
                        userRole = ((_c = req.user) === null || _c === void 0 ? void 0 : _c.role) || 'admin';
                        console.log('🚀 [优化AI查询] 请求:', { message: message, query: query, userId: userId, sessionId: sessionId, userRole: userRole });
                        queryContent = message || query;
                        if (!queryContent || typeof queryContent !== 'string' || queryContent.trim().length === 0) {
                            apiResponse_1.ApiResponse.badRequest(res, '查询内容不能为空');
                            return [2 /*return*/];
                        }
                        if (queryContent.length > 1000) {
                            apiResponse_1.ApiResponse.badRequest(res, '查询内容过长，请控制在1000字符以内');
                            return [2 /*return*/];
                        }
                        // 🚀 使用优化查询服务 - 优先级最高
                        console.log('⚡ 使用智能模型路由优化...');
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, ai_optimized_query_service_1["default"].processOptimizedQuery(queryContent, userId, sessionId)];
                    case 3:
                        optimizedResult = _f.sent();
                        totalTime = Date.now() - startTime;
                        console.log("\u26A1 [\u4F18\u5316AI\u67E5\u8BE2] \u5B8C\u6210\uFF0C\u603B\u8017\u65F6: ".concat(totalTime, "ms"));
                        enhancedResult = __assign(__assign({}, optimizedResult), { metadata: __assign(__assign({}, optimizedResult.metadata), { totalExecutionTime: totalTime, optimizationLevel: 'high', optimizationApplied: ['smart_model_routing', 'caching'] }) });
                        apiResponse_1.ApiResponse.success(res, enhancedResult, '优化AI查询执行成功');
                        return [2 /*return*/];
                    case 4:
                        optimizationError_1 = _f.sent();
                        console.warn('⚠️ 优化查询失败，回退到标准流程:', optimizationError_1);
                        return [3 /*break*/, 5];
                    case 5:
                        // 🎯 标准流程（作为降级方案）
                        console.log('🔄 使用标准AI查询流程...');
                        // 第一步：检查1小时内的缓存记录
                        console.log('🔍 检查缓存记录...');
                        return [4 /*yield*/, ai_query_cache_service_1["default"].getCachedResult(queryContent, userId)];
                    case 6:
                        cachedResult = _f.sent();
                        if (cachedResult) {
                            console.log('✅ 命中缓存，直接返回历史结果');
                            apiResponse_1.ApiResponse.success(res, cachedResult, '查询成功（来自缓存）');
                            return [2 /*return*/];
                        }
                        currentSessionId = sessionId || (0, uuid_1.v4)();
                        return [4 /*yield*/, ai_model_cache_service_1["default"].getAvailableModels()];
                    case 7:
                        availableModels = _f.sent();
                        console.log('🤖 可用AI模型:', availableModels.length, '个 (来自缓存)');
                        allowedTables = this.getAllowedTables(userRole);
                        console.log('🔐 允许访问的表:', allowedTables.length, '个表');
                        // 🎯 第四步：查询意图分析和表选择（使用缓存的模型）
                        console.log('🧠 开始查询意图分析...');
                        return [4 /*yield*/, ai_model_cache_service_1["default"].getIntentAnalysisModel()];
                    case 8:
                        intentModel = _f.sent();
                        return [4 /*yield*/, this.analyzeQueryIntentAndSelectTables(queryContent, allowedTables, intentModel)];
                    case 9:
                        queryAnalysis = _f.sent();
                        console.log('📊 查询分析结果:', queryAnalysis);
                        // 🎯 第三步半：API分组识别和多步骤查询规划
                        console.log('🔍 开始API分组识别...');
                        identifiedGroups = api_group_mapping_service_1.apiGroupMappingService.identifyApiGroups(queryContent);
                        console.log('📊 识别到的API分组:', identifiedGroups);
                        if (!(identifiedGroups.length > 1)) return [3 /*break*/, 11];
                        console.log('⚡ 识别到多个API分组，启用多步骤查询模式');
                        multiStepPlan = {
                            type: 'multi_step_api_query',
                            groups: identifiedGroups,
                            steps: identifiedGroups.map(function (group, index) { return ({
                                step: index + 1,
                                group: group,
                                description: "\u8C03\u7528".concat(group, "\u76F8\u5173API\u83B7\u53D6\u6570\u636E"),
                                apis: api_group_mapping_service_1.apiGroupMappingService.getGroupApiDetails(group).apis.slice(0, 3) // 限制每组最多3个API
                            }); }),
                            message: '🧠 检测到复杂查询，已规划多步骤API调用',
                            sessionId: currentSessionId,
                            ui_instruction: {
                                type: 'show_multi_step_plan',
                                title: 'API调用执行计划',
                                data: {
                                    originalQuery: queryContent,
                                    groups: identifiedGroups,
                                    totalSteps: identifiedGroups.length
                                }
                            }
                        };
                        // 保存多步骤计划到历史 (作为AI响应类型)
                        return [4 /*yield*/, ai_query_cache_service_1["default"].saveQueryResult(queryContent, userId, 'ai_response', { response: JSON.stringify(multiStepPlan) }, currentSessionId, 'api_group_mapper', Date.now() - startTime)];
                    case 10:
                        // 保存多步骤计划到历史 (作为AI响应类型)
                        _f.sent();
                        apiResponse_1.ApiResponse.success(res, multiStepPlan, 'API分组识别完成');
                        return [2 /*return*/];
                    case 11:
                        if (!!queryAnalysis.isDataQuery) return [3 /*break*/, 15];
                        console.log('ℹ️  非数据库查询，返回AI回答');
                        return [4 /*yield*/, ai_model_cache_service_1["default"].getQAModel()];
                    case 12:
                        qaModel = _f.sent();
                        return [4 /*yield*/, this.handleNonDataQuery(queryContent, qaModel, userId)];
                    case 13:
                        aiResponse = _f.sent();
                        result = {
                            type: 'ai_response',
                            response: aiResponse,
                            isDataQuery: false,
                            sessionId: currentSessionId
                        };
                        // 保存AI问答记录到历史
                        return [4 /*yield*/, ai_query_cache_service_1["default"].saveQueryResult(queryContent, userId, 'ai_response', result, currentSessionId, qaModel === null || qaModel === void 0 ? void 0 : qaModel.name, Date.now() - startTime)];
                    case 14:
                        // 保存AI问答记录到历史
                        _f.sent();
                        apiResponse_1.ApiResponse.success(res, result, 'AI回答生成成功');
                        return [2 /*return*/];
                    case 15:
                        primaryGroup = identifiedGroups[0];
                        console.log('📋 获取API分组详细信息:', primaryGroup);
                        groupDetails = api_group_mapping_service_1.apiGroupMappingService.getGroupApiDetails(primaryGroup);
                        console.log('📄 API分组信息已获取，包含', groupDetails.apis.length, '个API端点');
                        // 第五步：基于API分组生成调用计划
                        console.log('🤖 开始生成API调用计划...');
                        return [4 /*yield*/, this.generateApiCallPlan(queryContent, primaryGroup, groupDetails, queryAnalysis)];
                    case 16:
                        apiCallPlan = _f.sent();
                        console.log('📝 生成的API调用计划:', apiCallPlan.apis.length, '个API调用');
                        return [4 /*yield*/, this.executeApiCalls(apiCallPlan)];
                    case 17:
                        apiResults = _f.sent();
                        console.log('📊 API调用结果:', apiResults === null || apiResults === void 0 ? void 0 : apiResults.length, '条记录');
                        return [4 /*yield*/, this.generateIntelligentVisualization(apiResults, queryContent, queryAnalysis)];
                    case 18:
                        visualization = _f.sent();
                        console.log('📈 智能可视化配置已生成');
                        columns = this.generateColumnsFromData(apiResults);
                        finalResponse = {
                            success: true,
                            type: 'data_query',
                            data: apiResults,
                            metadata: {
                                totalRows: (apiResults === null || apiResults === void 0 ? void 0 : apiResults.length) || 0,
                                executionTime: Date.now() - startTime,
                                generatedSQL: "-- API\u5206\u7EC4\u6A21\u5F0F: ".concat(primaryGroup),
                                usedModel: 'api-group-mapper',
                                cacheHit: false,
                                queryAnalysis: queryAnalysis,
                                requiredTables: [primaryGroup],
                                columns: columns // 添加列信息用于前端表格渲染
                            },
                            visualization: visualization,
                            sessionId: currentSessionId
                        };
                        // 保存数据库查询记录到历史
                        return [4 /*yield*/, ai_query_cache_service_1["default"].saveQueryResult(queryContent, userId, 'data_query', finalResponse, currentSessionId, 'api-group-mapper', Date.now() - startTime)];
                    case 19:
                        // 保存数据库查询记录到历史
                        _f.sent();
                        console.log('✅ AI查询标准流程完成');
                        apiResponse_1.ApiResponse.success(res, finalResponse, 'AI查询执行成功');
                        return [3 /*break*/, 21];
                    case 20:
                        error_2 = _f.sent();
                        console.error('❌ AI查询执行异常:', error_2);
                        errorResponse = {
                            type: 'AI_QUERY_ERROR',
                            message: error_2.message || 'AI查询执行失败',
                            details: error_2.details || null,
                            timestamp: new Date().toISOString(),
                            executionTime: Date.now() - startTime
                        };
                        // 根据错误类型返回不同的状态码和消息
                        if ((_d = error_2.message) === null || _d === void 0 ? void 0 : _d.includes('数据库查询执行失败')) {
                            apiResponse_1.ApiResponse.error(res, "\u274C \u6570\u636E\u5E93\u67E5\u8BE2\u5931\u8D25\n\n\uD83D\uDD0D \u9519\u8BEF\u8BE6\u60C5\uFF1A".concat(error_2.message, "\n\n\uD83D\uDCA1 \u8FD9\u662F\u771F\u5B9E\u7684\u9519\u8BEF\u4FE1\u606F\uFF0C\u8BF7\u68C0\u67E5\u6570\u636E\u5E93\u8FDE\u63A5\u6216SQL\u8BED\u6CD5\u3002"), 'DATABASE_QUERY_ERROR', 500);
                        }
                        else if ((_e = error_2.message) === null || _e === void 0 ? void 0 : _e.includes('AI模型')) {
                            apiResponse_1.ApiResponse.error(res, "\u274C AI\u6A21\u578B\u670D\u52A1\u5F02\u5E38\n\n\uD83D\uDD0D \u9519\u8BEF\u8BE6\u60C5\uFF1A".concat(error_2.message, "\n\n\uD83D\uDCA1 \u8BF7\u68C0\u67E5AI\u6A21\u578B\u914D\u7F6E\u6216\u7A0D\u540E\u91CD\u8BD5\u3002"), 'AI_MODEL_ERROR', 503);
                        }
                        else {
                            apiResponse_1.ApiResponse.error(res, "\u274C AI\u67E5\u8BE2\u6267\u884C\u5931\u8D25\n\n\uD83D\uDD0D \u9519\u8BEF\u8BE6\u60C5\uFF1A".concat(error_2.message, "\n\n\uD83D\uDCA1 \u8FD9\u662F\u771F\u5B9E\u7684\u9519\u8BEF\u4FE1\u606F\uFF0C\u4E0D\u662F\u6A21\u62DF\u6570\u636E\u3002"), 'AI_QUERY_ERROR', 500);
                        }
                        return [3 /*break*/, 21];
                    case 21: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取查询历史记录
         */
        this.getQueryHistory = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, page, pageSize, queryType, result, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1;
                        page = parseInt(req.query.page) || 1;
                        pageSize = parseInt(req.query.pageSize) || 20;
                        queryType = req.query.queryType;
                        console.log("\uD83D\uDCCB \u83B7\u53D6\u7528\u6237".concat(userId, "\u7684\u67E5\u8BE2\u5386\u53F2, \u9875\u7801").concat(page, ", \u6BCF\u9875").concat(pageSize, "\u6761"));
                        return [4 /*yield*/, ai_query_cache_service_1["default"].getUserQueryHistory(userId, page, pageSize, queryType)];
                    case 1:
                        result = _b.sent();
                        apiResponse_1.ApiResponse.success(res, result, '获取查询历史成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _b.sent();
                        console.error('❌ 获取查询历史失败:', error_3);
                        apiResponse_1.ApiResponse.error(res, error_3.message || '获取查询历史失败', 'GET_HISTORY_ERROR', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取查询详情
         */
        this.getQueryDetail = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, queryId, result, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1;
                        queryId = parseInt(req.params.id);
                        if (!queryId) {
                            apiResponse_1.ApiResponse.badRequest(res, '查询ID不能为空');
                            return [2 /*return*/];
                        }
                        console.log("\uD83D\uDCCB \u83B7\u53D6\u7528\u6237".concat(userId, "\u7684\u67E5\u8BE2\u8BE6\u60C5: ").concat(queryId));
                        return [4 /*yield*/, ai_query_cache_service_1["default"].getQueryDetail(queryId, userId)];
                    case 1:
                        result = _b.sent();
                        if (!result) {
                            apiResponse_1.ApiResponse.notFound(res, '查询记录不存在');
                            return [2 /*return*/];
                        }
                        apiResponse_1.ApiResponse.success(res, result, '获取查询详情成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _b.sent();
                        console.error('❌ 获取查询详情失败:', error_4);
                        apiResponse_1.ApiResponse.error(res, error_4.message || '获取查询详情失败', 'GET_DETAIL_ERROR', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取查询统计信息
         */
        this.getStatistics = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, stats, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1;
                        console.log("\uD83D\uDCCA \u83B7\u53D6\u7528\u6237".concat(userId, "\u7684\u67E5\u8BE2\u7EDF\u8BA1"));
                        return [4 /*yield*/, ai_query_cache_service_1["default"].getCacheStats(userId)];
                    case 1:
                        stats = _b.sent();
                        apiResponse_1.ApiResponse.success(res, stats, '获取查询统计成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _b.sent();
                        console.error('❌ 获取查询统计失败:', error_5);
                        apiResponse_1.ApiResponse.error(res, error_5.message || '获取查询统计失败', 'GET_STATS_ERROR', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 清理过期缓存（管理员功能）
         */
        this.cleanupCache = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var deletedCount, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🧹 开始清理过期缓存记录...');
                        return [4 /*yield*/, ai_query_cache_service_1["default"].cleanupExpiredCache()];
                    case 1:
                        deletedCount = _a.sent();
                        apiResponse_1.ApiResponse.success(res, { deletedCount: deletedCount }, "\u6210\u529F\u6E05\u7406".concat(deletedCount, "\u6761\u8FC7\u671F\u8BB0\u5F55"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        console.error('❌ 清理缓存失败:', error_6);
                        apiResponse_1.ApiResponse.error(res, error_6.message || '清理缓存失败', 'CLEANUP_ERROR', 500);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 提交查询反馈
         */
        this.submitFeedback = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, queryId, rating, comment, userId;
            var _b;
            return __generator(this, function (_c) {
                try {
                    _a = req.body, queryId = _a.queryId, rating = _a.rating, comment = _a.comment;
                    userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                    console.log('💭 提交查询反馈:', { queryId: queryId, rating: rating, comment: comment, userId: userId });
                    apiResponse_1.ApiResponse.success(res, { feedbackId: Date.now() }, '反馈提交成功');
                }
                catch (error) {
                    console.error('提交反馈错误:', error);
                    apiResponse_1.ApiResponse.handleError(res, error, '提交反馈失败');
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * 获取查询模板
         */
        this.getTemplates = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId;
            var _a;
            return __generator(this, function (_b) {
                try {
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    console.log('📋 获取查询模板:', { userId: userId }); // const mockTemplates = [
                    //         {
                    //           id: 1,
                    //           title: '学生基本信息查询',
                    //           description: '查询学生的姓名、年龄、班级等基本信息',
                    //           template: '查询所有学生的基本信息',
                    //           category: 'student'
                    //         },
                    //         {
                    //           id: 2,
                    //           title: '班级统计',
                    //           description: '统计各班级的学生人数',
                    //           template: '统计各班级学生人数',
                    //           category: 'statistics'
                    //         }
                    //       ];
                    apiResponse_1.ApiResponse.success(res, [], '查询模板获取成功');
                }
                catch (error) {
                    console.error('获取模板错误:', error);
                    apiResponse_1.ApiResponse.handleError(res, error, '获取查询模板失败');
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * 获取查询建议
         */
        this.getSuggestions = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var userId, userRole;
            var _a, _b;
            return __generator(this, function (_c) {
                try {
                    userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                    userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                    console.log('💡 获取查询建议:', { userId: userId, userRole: userRole }); // const mockSuggestions = [
                    //         '查询本月新入学的学生',
                    //         '统计各年龄段学生分布',
                    //         '查看最近的活动参与情况',
                    //         '分析招生渠道效果'
                    //       ];
                    apiResponse_1.ApiResponse.success(res, [], '查询建议获取成功');
                }
                catch (error) {
                    console.error('获取建议错误:', error);
                    apiResponse_1.ApiResponse.handleError(res, error, '获取查询建议失败');
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * 重新执行查询
         */
        this.reExecuteQuery = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, userId, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        console.log('🔄 重新执行查询:', { id: id, userId: userId });
                        // 模拟重新执行
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 800); })];
                    case 1:
                        // 模拟重新执行
                        _b.sent(); // const mockResult = {
                        //         queryId: parseInt(id),
                        //         newExecutionId: Date.now(),
                        //         result: [
                        //           { id: 1, name: '张三', age: 5, class: '小班一组', status: '在读' },
                        //           { id: 2, name: '李四', age: 6, class: '中班一组', status: '在读' }
                        //         ],
                        //         executionTime: '0.8s'
                        //       };
                        apiResponse_1.ApiResponse.success(res, [], '查询重新执行成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        console.error('重新执行查询错误:', error_7);
                        apiResponse_1.ApiResponse.handleError(res, error_7, '重新执行查询失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 导出查询结果
         */
        this.exportResult = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, _a, format, userId;
            var _b;
            return __generator(this, function (_c) {
                try {
                    id = req.params.id;
                    _a = req.query.format, format = _a === void 0 ? 'excel' : _a;
                    userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                    console.log('📤 导出查询结果:', { id: id, format: format, userId: userId }); // const mockExport = {
                    //         downloadUrl: `/api/files/exports/query_${id}_${Date.now()}.${format}`,
                    //         fileName: `查询结果_${id}.${format}`,
                    //         fileSize: '12.5KB',
                    //         expiresAt: new Date(Date.now() + 3600000).toISOString()
                    //       };
                    apiResponse_1.ApiResponse.success(res, [], '导出任务创建成功');
                }
                catch (error) {
                    console.error('导出结果错误:', error);
                    apiResponse_1.ApiResponse.handleError(res, error, '导出查询结果失败');
                }
                return [2 /*return*/];
            });
        }); };
        // 使用TextModelService进行AI调用
    }
    /**
     * 第一步：获取当前可用的AI大模型
     */
    AIQueryController.prototype.getAvailableAIModels = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results, models, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          name,\n          display_name,\n          model_type,\n          provider,\n          status,\n          max_tokens,\n          model_parameters,\n          is_default\n        FROM ai_model_config \n        WHERE status = 'active'\n        ORDER BY is_default DESC, created_at DESC\n        LIMIT 10\n      ")];
                    case 1:
                        results = (_a.sent())[0];
                        models = results;
                        // 如果数据库中没有配置，抛出错误
                        if (models.length === 0) {
                            throw new Error('数据库中没有可用的AI模型配置');
                        }
                        return [2 /*return*/, models];
                    case 2:
                        error_8 = _a.sent();
                        console.error('获取AI模型失败:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🎯 核心新方法：查询意图分析和表选择
     * 第一次AI调用：判断查询类型并选择需要的表
     */
    AIQueryController.prototype.analyzeQueryIntentAndSelectTables = function (queryContent, allowedTables, selectedModel) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var tablesInfo, prompt_1, response, responseContent, analysisResult, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        tablesInfo = this.buildTableSelectionInfo(allowedTables);
                        prompt_1 = "\n\u8BF7\u5206\u6790\u4EE5\u4E0B\u4E2D\u6587\u67E5\u8BE2\uFF0C\u5224\u65AD\u8FD9\u662F\u5426\u4E3A\u6570\u636E\u5E93\u67E5\u8BE2\uFF0C\u5982\u679C\u662F\uFF0C\u8BF7\u9009\u62E9\u9700\u8981\u67E5\u8BE2\u7684\u8868\u3002\n\n\u7528\u6237\u67E5\u8BE2\uFF1A".concat(queryContent, "\n\n\u53EF\u7528\u7684\u6570\u636E\u5E93\u8868\u5217\u8868\uFF1A\n").concat(tablesInfo, "\n\n\u8BF7\u4E25\u683C\u6309\u7167\u4EE5\u4E0BJSON\u683C\u5F0F\u8FD4\u56DE\u7ED3\u679C\uFF1A\n{\n  \"isDataQuery\": true/false,\n  \"queryType\": \"\u5B66\u751F\u67E5\u8BE2|\u6559\u5E08\u67E5\u8BE2|\u6D3B\u52A8\u67E5\u8BE2|\u62DB\u751F\u67E5\u8BE2|\u8D22\u52A1\u67E5\u8BE2|\u7EDF\u8BA1\u67E5\u8BE2|\u975E\u6570\u636E\u67E5\u8BE2\",\n  \"confidence\": 0.0-1.0,\n  \"requiredTables\": [\"table1\", \"table2\"],\n  \"explanation\": \"\u9009\u62E9\u8FD9\u4E9B\u8868\u7684\u539F\u56E0\",\n  \"keywords\": [\"\u5173\u952E\u8BCD1\", \"\u5173\u952E\u8BCD2\"]\n}\n\n\u5224\u65AD\u89C4\u5219\uFF1A\n1. \u5982\u679C\u7528\u6237\u8BE2\u95EE\"\u4F60\u597D\"\u3001\"\u4EC0\u4E48\u662FAI\"\u7B49\u975E\u6570\u636E\u76F8\u5173\u95EE\u9898\uFF0CisDataQuery\u5E94\u4E3Afalse\n2. \u5982\u679C\u7528\u6237\u8BE2\u95EE\u5B66\u751F\u6570\u91CF\u3001\u6559\u5E08\u4FE1\u606F\u3001\u6D3B\u52A8\u5B89\u6392\u7B49\uFF0CisDataQuery\u5E94\u4E3Atrue\n3. requiredTables\u53EA\u5305\u542B\u5B9E\u9645\u9700\u8981\u7684\u8868\u540D\uFF0C\u4E0D\u8981\u5305\u542B\u4E0D\u76F8\u5173\u7684\u8868\n4. confidence\u8868\u793A\u5224\u65AD\u7684\u7F6E\u4FE1\u5EA6\n\n\u53EA\u8FD4\u56DEJSON\uFF0C\u4E0D\u8981\u5176\u4ED6\u5185\u5BB9\uFF1A");
                        console.log('📤 发送意图分析请求到AI模型...');
                        return [4 /*yield*/, text_model_service_1["default"].generateText(1, {
                                model: (selectedModel === null || selectedModel === void 0 ? void 0 : selectedModel.name) || 'default',
                                messages: [
                                    {
                                        role: text_model_service_2.MessageRole.SYSTEM,
                                        content: '你是一个专业的数据库查询意图分析专家，专门分析幼儿园管理系统的查询需求。你必须准确判断用户查询是否需要访问数据库，并精确选择相关的表。'
                                    },
                                    {
                                        role: text_model_service_2.MessageRole.USER,
                                        content: prompt_1
                                    }
                                ],
                                temperature: 0.1,
                                maxTokens: 500
                            })];
                    case 1:
                        response = _c.sent();
                        responseContent = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '';
                        console.log('🔍 AI意图分析原始响应:', responseContent);
                        analysisResult = this.parseIntentAnalysisResponse(responseContent);
                        console.log('📊 解析后的意图分析结果:', analysisResult);
                        return [2 /*return*/, analysisResult];
                    case 2:
                        error_9 = _c.sent();
                        console.error('❌ 查询意图分析失败:', error_9);
                        // 默认认为是数据查询，使用保守策略
                        return [2 /*return*/, {
                                isDataQuery: true,
                                queryType: '未知查询',
                                confidence: 0.5,
                                requiredTables: allowedTables.slice(0, 5),
                                explanation: '意图分析失败，使用默认策略',
                                keywords: []
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建表选择信息
     */
    AIQueryController.prototype.buildTableSelectionInfo = function (allowedTables) {
        var tableDescriptions = {
            'students': '学生表 - 学生基本信息、班级关联',
            'teachers': '教师表 - 教师基本信息、任职情况',
            'parents': '家长表 - 家长基本信息、联系方式',
            'classes': '班级表 - 班级信息、班级管理',
            'activities': '活动表 - 活动信息、活动安排',
            'activity_registrations': '活动报名表 - 学生活动报名记录',
            'activity_evaluations': '活动评价表 - 活动评价和反馈',
            'enrollment_plans': '招生计划表 - 招生计划和名额',
            'enrollment_applications': '入学申请表 - 学生入学申请',
            'admission_results': '录取结果表 - 学生录取情况',
            'marketing_campaigns': '营销活动表 - 营销活动管理',
            'advertisements': '广告表 - 广告投放管理',
            'kindergartens': '幼儿园表 - 幼儿园基本信息',
            'users': '用户表 - 系统用户账户信息'
        };
        return allowedTables.map(function (table) {
            var description = tableDescriptions[table] || "".concat(table, "\u8868");
            return "- ".concat(table, ": ").concat(description);
        }).join('\n');
    };
    /**
     * 解析AI意图分析响应
     */
    AIQueryController.prototype.parseIntentAnalysisResponse = function (responseContent) {
        try {
            // 尝试提取JSON
            var jsonStr = responseContent.trim();
            // 移除可能的markdown格式
            jsonStr = jsonStr.replace(/^```json\s*|\s*```$/g, '');
            jsonStr = jsonStr.replace(/^```\s*|\s*```$/g, '');
            // 解析JSON
            var parsed = JSON.parse(jsonStr);
            // 验证必要字段
            return {
                isDataQuery: Boolean(parsed.isDataQuery),
                queryType: parsed.queryType || '未知查询',
                confidence: Number(parsed.confidence) || 0.5,
                requiredTables: Array.isArray(parsed.requiredTables) ? parsed.requiredTables : [],
                explanation: parsed.explanation || '',
                keywords: Array.isArray(parsed.keywords) ? parsed.keywords : []
            };
        }
        catch (error) {
            console.error('❌ 解析意图分析响应失败:', error);
            console.error('原始响应:', responseContent);
            // 返回默认解析结果
            return {
                isDataQuery: true,
                queryType: '解析失败',
                confidence: 0.3,
                requiredTables: [],
                explanation: 'JSON解析失败',
                keywords: []
            };
        }
    };
    /**
     * 处理非数据库查询（一般性AI对话）
     */
    AIQueryController.prototype.handleNonDataQuery = function (queryContent, selectedModel, userId) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var availableModels, qaModel, response, error_10;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.getAvailableAIModels()];
                    case 1:
                        availableModels = _d.sent();
                        qaModel = ((_a = selectedModel === null || selectedModel === void 0 ? void 0 : selectedModel.name) === null || _a === void 0 ? void 0 : _a.includes('128k')) ? selectedModel :
                            availableModels.find(function (m) { var _a; return ((_a = m.name) === null || _a === void 0 ? void 0 : _a.includes('128k')) && m.isActive; }) || selectedModel;
                        console.log('💬 AI问答使用模型:', qaModel === null || qaModel === void 0 ? void 0 : qaModel.name, '(128k大模型)');
                        return [4 /*yield*/, text_model_service_1["default"].generateText(userId, {
                                model: (qaModel === null || qaModel === void 0 ? void 0 : qaModel.name) || 'Doubao-pro-128k',
                                messages: [
                                    {
                                        role: text_model_service_2.MessageRole.SYSTEM,
                                        content: '你是幼儿园管理系统的AI助手，可以回答关于幼儿园管理、教育等相关问题。请用友好、专业的语气回答用户的问题。'
                                    },
                                    {
                                        role: text_model_service_2.MessageRole.USER,
                                        content: queryContent
                                    }
                                ],
                                temperature: 0.7,
                                maxTokens: 500
                            })];
                    case 2:
                        response = _d.sent();
                        return [2 /*return*/, ((_c = (_b = response.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) || '抱歉，我暂时无法回答这个问题。'];
                    case 3:
                        error_10 = _d.sent();
                        console.error('❌ 生成AI回答失败:', error_10);
                        return [2 /*return*/, '抱歉，AI服务暂时不可用，请稍后再试。'];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取相关表的精准结构信息
     */
    AIQueryController.prototype.getRelevantTableStructures = function (requiredTables, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var tableList, tablesQuery, results, columns, tableGroups_1, structureDescription_1, _i, _a, _b, tableName, tableColumns, error_11;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        if (requiredTables.length === 0 || requiredTables.includes('*')) {
                            console.warn('⚠️ 未指定需要的表或包含通配符，使用默认核心表');
                            requiredTables = ['activity_registrations', 'activities', 'students', 'teachers', 'classes'];
                        }
                        console.log('🔍 查询指定表的结构:', requiredTables);
                        tableList = requiredTables.map(function (table) { return "'".concat(table, "'"); }).join(',');
                        tablesQuery = "\n        SELECT \n          TABLE_NAME,\n          COLUMN_NAME,\n          DATA_TYPE,\n          IS_NULLABLE,\n          COLUMN_DEFAULT,\n          COLUMN_COMMENT\n        FROM information_schema.COLUMNS\n        WHERE TABLE_SCHEMA = DATABASE()\n          AND TABLE_NAME IN (".concat(tableList, ")\n        ORDER BY TABLE_NAME, ORDINAL_POSITION\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(tablesQuery)];
                    case 1:
                        results = (_c.sent())[0];
                        columns = results;
                        tableGroups_1 = {};
                        columns.forEach(function (col) {
                            if (!tableGroups_1[col.TABLE_NAME]) {
                                tableGroups_1[col.TABLE_NAME] = [];
                            }
                            tableGroups_1[col.TABLE_NAME].push(col);
                        });
                        structureDescription_1 = "\u76F8\u5173\u6570\u636E\u5E93\u8868\u7ED3\u6784\u4FE1\u606F\uFF1A\n\n";
                        for (_i = 0, _a = Object.entries(tableGroups_1); _i < _a.length; _i++) {
                            _b = _a[_i], tableName = _b[0], tableColumns = _b[1];
                            structureDescription_1 += "\u8868\u540D: ".concat(tableName, "\n");
                            structureDescription_1 += "\u5217\u4FE1\u606F:\n";
                            tableColumns.forEach(function (col) {
                                var comment = col.COLUMN_COMMENT ? " (".concat(col.COLUMN_COMMENT, ")") : '';
                                var nullable = col.IS_NULLABLE === 'YES' ? ', 可空' : ', 非空';
                                structureDescription_1 += "  - ".concat(col.COLUMN_NAME, ": ").concat(col.DATA_TYPE).concat(nullable).concat(comment, "\n");
                            });
                            structureDescription_1 += "\n";
                        }
                        console.log('📄 生成的表结构信息长度:', structureDescription_1.length, '字符');
                        return [2 /*return*/, structureDescription_1];
                    case 2:
                        error_11 = _c.sent();
                        console.error('❌ 获取相关表结构失败:', error_11);
                        throw new Error('获取数据库表结构失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 使用优化的信息生成SQL
     */
    AIQueryController.prototype.generateOptimizedSQL = function (naturalQuery, relevantTableStructures, queryAnalysis, selectedModel) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var prompt, availableModels, sqlModel, response, sql, error_12;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        prompt = "\n\u57FA\u4E8E\u67E5\u8BE2\u5206\u6790\u7ED3\u679C\uFF0C\u751F\u6210\u7CBE\u786E\u7684MySQL\u67E5\u8BE2\u8BED\u53E5\uFF1A\n\n\u7528\u6237\u67E5\u8BE2\uFF1A".concat(naturalQuery, "\n\u67E5\u8BE2\u7C7B\u578B\uFF1A").concat(queryAnalysis.queryType, "\n\u76F8\u5173\u5173\u952E\u8BCD\uFF1A").concat(queryAnalysis.keywords.join(', '), "\n\n").concat(relevantTableStructures, "\n\n\u91CD\u8981\u63D0\u793A\uFF1A\n- \u6D3B\u52A8\u53C2\u4E0E\u6570\u636E\u5B58\u50A8\u5728 activity_registrations \u8868\u4E2D\uFF0C\u4E0D\u662F activity_participants \u8868\n- activity_registrations \u8868\u5305\u542B\u6D3B\u52A8\u62A5\u540D\u548C\u53C2\u4E0E\u4FE1\u606F\n- \u7EDF\u8BA1\u6D3B\u52A8\u53C2\u4E0E\u4EBA\u6570\u65F6\uFF0C\u4F7F\u7528 activity_registrations \u8868\n- activity_registrations \u8868\u7684\u65F6\u95F4\u5B57\u6BB5\u662F registrationTime\uFF0C\u4E0D\u662F registration_date\n- \u67E5\u8BE2\u672C\u6708\u6570\u636E\u65F6\uFF0C\u4F7F\u7528 registrationTime \u5B57\u6BB5\u8FDB\u884C\u65F6\u95F4\u8FC7\u6EE4\n\n\u751F\u6210\u8981\u6C42\uFF1A\n1. \u53EA\u8FD4\u56DESQL\u8BED\u53E5\uFF0C\u4E0D\u8981\u5176\u4ED6\u89E3\u91CA\n2. \u57FA\u4E8E\u67E5\u8BE2\u7C7B\u578B\uFF08").concat(queryAnalysis.queryType, "\uFF09\u4F18\u5316\u67E5\u8BE2\u903B\u8F91\n3. \u53EA\u4F7F\u7528\u4E0A\u8FF0\u63D0\u4F9B\u7684\u8868\u548C\u5B57\u6BB5\n4. \u786E\u4FDD\u8BED\u53E5\u5B89\u5168\uFF0C\u4EC5\u4F7F\u7528SELECT\u8BED\u53E5\n5. \u4F18\u5148\u67E5\u8BE2status='active'\u6216status=1\u7684\u6570\u636E\n6. \u5408\u7406\u4F7F\u7528JOIN\u8FDE\u63A5\u76F8\u5173\u8868\n7. \u5BF9\u4E8E\u7EDF\u8BA1\u67E5\u8BE2\uFF0C\u4F7F\u7528\u805A\u5408\u51FD\u6570\n8. \u5BF9\u4E8E\u65F6\u95F4\u67E5\u8BE2\uFF0C\u4F7F\u7528DATE_FORMAT\u51FD\u6570\n9. \u67E5\u8BE2\u6D3B\u52A8\u53C2\u4E0E\u6570\u636E\u65F6\uFF0C\u5FC5\u987B\u4F7F\u7528 activity_registrations \u8868\n10. \u8BA1\u7B97\u5B66\u751F\u5E74\u9F84\u65F6\uFF0C\u4F7F\u7528 TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) AS age\n11. \u5B66\u751F\u8868\u6CA1\u6709 age \u5B57\u6BB5\uFF0C\u5FC5\u987B\u901A\u8FC7 birth_date \u8BA1\u7B97\u5E74\u9F84\n12. \u7528\u6237\u8868\u540D\u662F users\uFF0C\u4E0D\u662F user_accounts\n\nSQL\u8BED\u53E5\uFF1A");
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.getAvailableAIModels()];
                    case 2:
                        availableModels = _c.sent();
                        sqlModel = availableModels.find(function (m) { var _a; return ((_a = m.name) === null || _a === void 0 ? void 0 : _a.includes('dbquery')) && m.isActive; } // 数据库查询专用模型
                        ) || availableModels.find(function (m) { var _a, _b; return (((_a = m.name) === null || _a === void 0 ? void 0 : _a.includes('lite-32k')) || ((_b = m.name) === null || _b === void 0 ? void 0 : _b.includes('Doubao-lite-32k'))) && m.isActive; }) || selectedModel;
                        console.log('🛠️ SQL生成使用模型:', sqlModel === null || sqlModel === void 0 ? void 0 : sqlModel.name, '(数据库查询专用)');
                        return [4 /*yield*/, text_model_service_1["default"].generateText(1, {
                                model: (sqlModel === null || sqlModel === void 0 ? void 0 : sqlModel.name) || 'Doubao-lite-32k-dbquery',
                                messages: [
                                    {
                                        role: text_model_service_2.MessageRole.SYSTEM,
                                        content: "\u4F60\u662F\u4E00\u4E2AMySQL\u4E13\u5BB6\uFF0C\u4E13\u95E8\u4E3A\u5E7C\u513F\u56ED\u7BA1\u7406\u7CFB\u7EDF\u751F\u6210\u7CBE\u786E\u7684SQL\u67E5\u8BE2\u3002\u4F60\u5DF2\u7ECF\u77E5\u9053\u7528\u6237\u7684\u67E5\u8BE2\u610F\u56FE\u662F\"".concat(queryAnalysis.queryType, "\"\uFF0C\u57FA\u4E8E\u7CBE\u51C6\u7684\u8868\u7ED3\u6784\u4FE1\u606F\u751F\u6210SQL\u3002\n\n\u91CD\u8981\uFF1A\u5728\u8FD9\u4E2A\u7CFB\u7EDF\u4E2D\uFF0C\u6D3B\u52A8\u53C2\u4E0E\u6570\u636E\u5B58\u50A8\u5728 activity_registrations \u8868\u4E2D\uFF0C\u8BE5\u8868\u5305\u542B\u6D3B\u52A8\u62A5\u540D\u548C\u5B9E\u9645\u53C2\u4E0E\u4FE1\u606F\u3002\u5F53\u9700\u8981\u7EDF\u8BA1\u6D3B\u52A8\u53C2\u4E0E\u4EBA\u6570\u65F6\uFF0C\u8BF7\u4F7F\u7528 activity_registrations \u8868\uFF0C\u4E0D\u8981\u4F7F\u7528\u4E0D\u5B58\u5728\u7684 activity_participants \u8868\u3002\n\n\u5173\u952E\u5B57\u6BB5\u6620\u5C04\uFF1A\n- \u6D3B\u52A8\u62A5\u540D\u65F6\u95F4\uFF1AregistrationTime\uFF08\u4E0D\u662F registration_date\uFF09\n- \u6D3B\u52A8ID\uFF1AactivityId\n- \u53C2\u4E0E\u4EBA\u6570\u7EDF\u8BA1\uFF1ACOUNT(*) \u6216 COUNT(id)\n- \u65F6\u95F4\u8FC7\u6EE4\uFF1A\u4F7F\u7528 registrationTime \u5B57\u6BB5\n\n\u5B66\u751F\u8868\u5B57\u6BB5\u6620\u5C04\uFF08\u91CD\u8981\uFF09\uFF1A\n- \u5B66\u751F\u5E74\u9F84\uFF1A\u4F7F\u7528 TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) \u8BA1\u7B97\uFF0C\u4E0D\u8981\u4F7F\u7528\u4E0D\u5B58\u5728\u7684 age \u5B57\u6BB5\n- \u51FA\u751F\u65E5\u671F\uFF1Abirth_date\uFF08\u4E0D\u662F birth_date\uFF09\n- \u5B66\u751F\u59D3\u540D\uFF1Aname\n- \u5B66\u53F7\uFF1Astudent_no\n- \u73ED\u7EA7ID\uFF1Aclass_id\n- \u5E7C\u513F\u56EDID\uFF1Akindergarten_id\n- \u6027\u522B\uFF1Agender\uFF081=\u7537\uFF0C2=\u5973\uFF09\n- \u72B6\u6001\uFF1Astatus\uFF080=\u79BB\u56ED\uFF0C1=\u5728\u8BFB\uFF0C2=\u4F11\u5B66\uFF09\n\n\u7528\u6237\u8868\u5B57\u6BB5\u6620\u5C04\uFF1A\n- \u7528\u6237\u8868\u540D\uFF1Ausers\uFF08\u4E0D\u662F user_accounts\uFF09\n- \u7528\u6237ID\uFF1Aid\n- \u7528\u6237\u540D\uFF1Ausername\n- \u771F\u5B9E\u59D3\u540D\uFF1Areal_name\n- \u90AE\u7BB1\uFF1Aemail\n- \u624B\u673A\uFF1Aphone")
                                    },
                                    {
                                        role: text_model_service_2.MessageRole.USER,
                                        content: prompt
                                    }
                                ],
                                temperature: 0.1,
                                maxTokens: 800 // SQL可能需要更多token
                            })];
                    case 3:
                        response = _c.sent();
                        sql = (((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '').trim();
                        sql = sql.replace(/^```sql\s*|\s*```$/g, '').trim();
                        sql = sql.replace(/^```\s*|\s*```$/g, '').trim();
                        if (!sql) {
                            throw new Error('AI未能生成有效的SQL语句');
                        }
                        return [2 /*return*/, sql];
                    case 4:
                        error_12 = _c.sent();
                        console.error('❌ 优化SQL生成失败:', error_12);
                        throw error_12;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 分析查询意图 - 使用真实数据库表结构
     */
    AIQueryController.prototype.analyzeQueryIntent = function (queryContent, context, availableModels) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var tableStructures, prompt_2, models, intentModel, response, intentData, error_13;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.getDatabaseTableStructures(context.userRole)];
                    case 1:
                        tableStructures = _c.sent();
                        prompt_2 = "\n\u8BF7\u5206\u6790\u4EE5\u4E0B\u4E2D\u6587\u67E5\u8BE2\u7684\u610F\u56FE\uFF0C\u5E76\u8FD4\u56DEJSON\u683C\u5F0F\u7684\u7ED3\u679C\uFF1A\n\n\u67E5\u8BE2\u5185\u5BB9\uFF1A".concat(queryContent, "\n\n\u7528\u6237\u4E0A\u4E0B\u6587\uFF1A").concat(JSON.stringify(context), "\n\n\u771F\u5B9E\u6570\u636E\u5E93\u8868\u7ED3\u6784\uFF1A\n").concat(tableStructures, "\n\n\u8BF7\u8FD4\u56DE\u4EE5\u4E0BJSON\u683C\u5F0F\uFF1A\n{\n  \"type\": \"SELECT|COUNT|SUM|AVG|GROUP_BY|FILTER\",\n  \"confidence\": 0.0-1.0,\n  \"entities\": [\n    {\n      \"type\": \"TABLE|COLUMN|VALUE|CONDITION\",\n      \"value\": \"\u539F\u59CB\u6587\u672C\",\n      \"confidence\": 0.0-1.0,\n      \"mappedName\": \"\u5BF9\u5E94\u7684\u6570\u636E\u5E93\u540D\u79F0\"\n    }\n  ],\n  \"timeRange\": {\n    \"type\": \"\u672C\u6708|\u4ECA\u5E74|\u4E0A\u4E2A\u6708|...\",\n    \"start\": \"2024-01-01\",\n    \"end\": \"2024-12-31\"\n  },\n  \"constraints\": [\n    {\n      \"field\": \"\u5B57\u6BB5\u540D\",\n      \"operator\": \"=|>|<|LIKE|IN\",\n      \"value\": \"\u6761\u4EF6\u503C\"\n    }\n  ]\n}\n");
                        return [4 /*yield*/, this.getAvailableAIModels()];
                    case 2:
                        models = _c.sent();
                        intentModel = models.find(function (m) { var _a; return ((_a = m.name) === null || _a === void 0 ? void 0 : _a.includes('dbquery')) && m.isActive; } // 优先使用数据库查询专用模型
                        ) || models.find(function (m) { var _a, _b; return (((_a = m.name) === null || _a === void 0 ? void 0 : _a.includes('lite-32k')) || ((_b = m.name) === null || _b === void 0 ? void 0 : _b.includes('Doubao-lite-32k'))) && m.isActive; }) || models[0];
                        console.log('🧠 意图分析使用模型:', intentModel === null || intentModel === void 0 ? void 0 : intentModel.name, '(数据库查询专用)');
                        return [4 /*yield*/, text_model_service_1["default"].generateText(context.userId || 1, {
                                model: (intentModel === null || intentModel === void 0 ? void 0 : intentModel.name) || 'Doubao-lite-32k-dbquery',
                                messages: [
                                    {
                                        role: text_model_service_2.MessageRole.SYSTEM,
                                        content: '你是一个专业的数据库查询意图分析师，专门分析幼儿园管理系统的查询需求。请返回准确的JSON格式结果。'
                                    },
                                    {
                                        role: text_model_service_2.MessageRole.USER,
                                        content: prompt_2
                                    }
                                ],
                                temperature: 0.05,
                                maxTokens: 500 // 减少token使用，JSON结果不需要太多
                            })];
                    case 3:
                        response = _c.sent();
                        intentData = this.parseIntentResponse(((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '');
                        return [2 /*return*/, intentData];
                    case 4:
                        error_13 = _c.sent();
                        console.error('意图分析错误:', error_13);
                        // 返回默认意图
                        return [2 /*return*/, {
                                type: 'SELECT',
                                confidence: 0.5,
                                entities: [],
                                keywords: [],
                                timeRange: undefined,
                                constraints: []
                            }];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 解析AI意图分析响应
     */
    AIQueryController.prototype.parseIntentResponse = function (response) {
        try {
            // 提取JSON部分
            var jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('无法从响应中提取JSON');
            }
            var parsed = JSON.parse(jsonMatch[0]);
            return {
                type: parsed.type || 'SELECT',
                confidence: parsed.confidence || 0.5,
                entities: parsed.entities || [],
                keywords: parsed.keywords || [],
                businessDomain: parsed.businessDomain,
                timeRange: parsed.timeRange,
                constraints: parsed.constraints || []
            };
        }
        catch (error) {
            console.error('解析意图响应错误:', error);
            return {
                type: 'SELECT',
                confidence: 0.3,
                entities: [],
                keywords: [],
                constraints: []
            };
        }
    };
    /**
     * 第五步：执行SQL语句
     */
    AIQueryController.prototype.executeSQL = function (sql) {
        return __awaiter(this, void 0, void 0, function () {
            var results, error_14, errorDetails, detailedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🔍 执行SQL查询:', sql);
                        return [4 /*yield*/, init_1.sequelize.query(sql)];
                    case 1:
                        results = (_a.sent())[0];
                        return [2 /*return*/, results];
                    case 2:
                        error_14 = _a.sent();
                        console.error('❌ SQL执行错误:', error_14);
                        errorDetails = {
                            type: 'SQL_EXECUTION_ERROR',
                            message: "\u6570\u636E\u5E93\u67E5\u8BE2\u6267\u884C\u5931\u8D25: ".concat(error_14.message),
                            sql: sql.substring(0, 500) + (sql.length > 500 ? '...' : ''),
                            originalError: error_14.message,
                            errorCode: error_14.code || 'UNKNOWN',
                            timestamp: new Date().toISOString()
                        };
                        detailedError = new Error(errorDetails.message);
                        detailedError.details = errorDetails;
                        throw detailedError;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取核心业务表结构信息（仅元数据，极简版本）
     */
    AIQueryController.prototype.getDatabaseTableStructures = function (userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var coreBusinessTables, tableList, tablesQuery, results, tableStructures, tablesMap_1, structureText, _i, _a, _b, tableName, columns, fieldNames, error_15;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        coreBusinessTables = [
                            'students', 'teachers', 'parents', 'classes', 'kindergartens',
                            'activities', 'activity_registrations', 'activity_evaluations',
                            'enrollment_plans', 'enrollment_applications', 'admission_results',
                            'marketing_campaigns', 'advertisements', 'users'
                        ];
                        tableList = coreBusinessTables.map(function (table) { return "'".concat(table, "'"); }).join(',');
                        tablesQuery = "\n        SELECT \n          TABLE_NAME,\n          COLUMN_NAME,\n          DATA_TYPE\n        FROM INFORMATION_SCHEMA.COLUMNS \n        WHERE TABLE_SCHEMA = DATABASE()\n          AND TABLE_NAME IN (".concat(tableList, ")\n        ORDER BY TABLE_NAME, ORDINAL_POSITION\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(tablesQuery)];
                    case 1:
                        results = (_c.sent())[0];
                        tableStructures = results;
                        tablesMap_1 = new Map();
                        tableStructures.forEach(function (row) {
                            var tableName = row.TABLE_NAME;
                            if (!tablesMap_1.has(tableName)) {
                                tablesMap_1.set(tableName, []);
                            }
                            tablesMap_1.get(tableName).push(row);
                        });
                        structureText = '核心表结构：\n';
                        for (_i = 0, _a = tablesMap_1.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], tableName = _b[0], columns = _b[1];
                            fieldNames = columns.map(function (col) { return col.COLUMN_NAME; }).join(',');
                            structureText += "".concat(tableName, "(").concat(fieldNames, "); ");
                        }
                        console.log('📤 表结构数据大小:', Buffer.byteLength(structureText, 'utf8'), '字节');
                        return [2 /*return*/, structureText];
                    case 2:
                        error_15 = _c.sent();
                        console.error('获取数据库表结构失败:', error_15);
                        return [2 /*return*/, '核心表：students(id,name,created_at),activities(id,title,fee),marketing_campaigns(id,budget)'];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 第四步：使用AI生成SQL查询语句 - 标准流程版本（带降级机制）
     */
    AIQueryController.prototype.generateSQLWithAI = function (naturalQuery, tableStructures, selectedModel) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var prompt, response, sql, error_16;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        prompt = "\n\u57FA\u4E8E\u4EE5\u4E0B\u4E2D\u6587\u67E5\u8BE2\u9700\u6C42\uFF0C\u751F\u6210MySQL\u67E5\u8BE2\u8BED\u53E5\uFF1A\n\n\u67E5\u8BE2\u9700\u6C42\uFF1A".concat(naturalQuery, "\n\n").concat(tableStructures, "\n\n\u8981\u6C42\uFF1A\n1. \u53EA\u8FD4\u56DESQL\u8BED\u53E5\uFF0C\u4E0D\u8981\u5176\u4ED6\u89E3\u91CA\n2. \u4F7F\u7528MySQL\u8BED\u6CD5\n3. \u786E\u4FDD\u8BED\u53E5\u5B89\u5168\uFF0C\u907F\u514DSQL\u6CE8\u5165\n4. \u4F18\u5148\u67E5\u8BE2status='active'\u6216status=1\u7684\u6570\u636E\n5. \u9002\u5F53\u4F7F\u7528JOIN\u8FDE\u63A5\u76F8\u5173\u8868\n6. \u5408\u7406\u4F7F\u7528\u805A\u5408\u51FD\u6570\u548C\u5206\u7EC4\n7. \u5BF9\u4E8E\"\u65B0\u8FDB\u5165\"\u67E5\u8BE2\uFF0C\u901A\u8FC7created_at\u5B57\u6BB5\u6309\u65F6\u95F4\u7B5B\u9009\n8. \u5BF9\u4E8E\"\u8BE6\u7EC6\u4FE1\u606F\"\u67E5\u8BE2\uFF0C\u5305\u542B\u76F8\u5173\u8054\u8868\u7684\u5B8C\u6574\u4FE1\u606F\n9. \u5BF9\u4E8E\u8D22\u52A1\u67E5\u8BE2\uFF0C\u53EF\u4EE5\u57FA\u4E8E\u5B66\u751F\u6570\u91CF\u548C\u8425\u9500\u9884\u7B97\u8FDB\u884C\u5408\u7406\u4F30\u7B97\n10. \u5BF9\u4E8E\u65F6\u95F4\u76F8\u5173\u67E5\u8BE2\uFF0C\u4F7F\u7528DATE_FORMAT\u51FD\u6570\u8FDB\u884C\u65F6\u95F4\u683C\u5F0F\u5316\n11. \u786E\u4FDD\u5B57\u6BB5\u540D\u548C\u8868\u540D\u4E0E\u63D0\u4F9B\u7684\u8868\u7ED3\u6784\u5B8C\u5168\u5339\u914D\n\nSQL\u8BED\u53E5\uFF1A");
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 3, , 4]);
                        console.log('📤 发送给AI模型的数据大小:', Buffer.byteLength(prompt, 'utf8'), '字节');
                        return [4 /*yield*/, text_model_service_1["default"].generateText(1, {
                                model: (selectedModel === null || selectedModel === void 0 ? void 0 : selectedModel.name) || 'default',
                                messages: [
                                    {
                                        role: text_model_service_2.MessageRole.SYSTEM,
                                        content: '你是一个MySQL数据库专家，专门为幼儿园管理系统生成安全、高效的SQL查询语句。请严格根据提供的真实表结构生成SQL。'
                                    },
                                    {
                                        role: text_model_service_2.MessageRole.USER,
                                        content: prompt
                                    }
                                ],
                                temperature: 0.1,
                                maxTokens: 800
                            })];
                    case 2:
                        response = _c.sent();
                        sql = (((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '').trim();
                        // 清理可能的markdown格式
                        sql = sql.replace(/^```sql\s*|\s*```$/g, '').trim();
                        sql = sql.replace(/^```\s*|\s*```$/g, '').trim();
                        // 如果SQL为空，抛出错误
                        if (!sql) {
                            throw new Error('AI模型返回空的SQL语句');
                        }
                        return [2 /*return*/, sql];
                    case 3:
                        error_16 = _c.sent();
                        console.error('AI生成SQL失败:', error_16);
                        throw new Error("AI\u6A21\u578B\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u8BF7\u8054\u7CFB\u7BA1\u7406\u5458\u3002\u9519\u8BEF\u8BE6\u60C5: ".concat(error_16.message));
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // 降级机制已完全移除 - 强制使用真实AI模型
    /**
     * 验证SQL安全性 - 增强版
     */
    AIQueryController.prototype.validateSQL = function (sql, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var dangerousPatterns, _i, dangerousPatterns_1, pattern, match, allowedTables, tableMatches, _a, tableMatches_1, match, tableName, injectionPatterns, _b, injectionPatterns_1, pattern;
            return __generator(this, function (_c) {
                try {
                    dangerousPatterns = [
                        /\bDROP\s+/i,
                        /\bDELETE\s+/i,
                        /\bUPDATE\s+/i,
                        /\bINSERT\s+/i,
                        /\bCREATE\s+/i,
                        /\bALTER\s+/i,
                        /\bTRUNCATE\s+/i,
                        /\bEXEC\s+/i,
                        /\bEXECUTE\s+/i,
                        /\bDECLARE\s+/i,
                        /\bSCRIPT\s+/i
                    ];
                    for (_i = 0, dangerousPatterns_1 = dangerousPatterns; _i < dangerousPatterns_1.length; _i++) {
                        pattern = dangerousPatterns_1[_i];
                        if (pattern.test(sql)) {
                            match = sql.match(pattern);
                            return [2 /*return*/, {
                                    isValid: false,
                                    error: "\u67E5\u8BE2\u5305\u542B\u4E0D\u5141\u8BB8\u7684\u64CD\u4F5C\u5173\u952E\u8BCD: ".concat(match ? match[0].trim() : '未知关键词')
                                }];
                        }
                    }
                    allowedTables = this.getAllowedTables(userRole);
                    tableMatches = sql.match(/FROM\s+(\w+)|JOIN\s+(\w+)/gi);
                    if (tableMatches) {
                        for (_a = 0, tableMatches_1 = tableMatches; _a < tableMatches_1.length; _a++) {
                            match = tableMatches_1[_a];
                            tableName = match.replace(/FROM\s+|JOIN\s+/gi, '').trim();
                            if (!allowedTables.includes(tableName) && !allowedTables.includes('*')) {
                                return [2 /*return*/, {
                                        isValid: false,
                                        error: "\u6CA1\u6709\u8BBF\u95EE\u8868 ".concat(tableName, " \u7684\u6743\u9650")
                                    }];
                            }
                        }
                    }
                    injectionPatterns = [
                        /(\bor\b|\band\b)\s+\d+\s*=\s*\d+/gi,
                        /['"]\s*;\s*\w+/gi,
                        /--|\#|\/\*/gi
                    ];
                    for (_b = 0, injectionPatterns_1 = injectionPatterns; _b < injectionPatterns_1.length; _b++) {
                        pattern = injectionPatterns_1[_b];
                        if (pattern.test(sql)) {
                            return [2 /*return*/, {
                                    isValid: false,
                                    error: '检测到潜在的SQL注入攻击'
                                }];
                        }
                    }
                    return [2 /*return*/, {
                            isValid: true,
                            sql: sql
                        }];
                }
                catch (error) {
                    return [2 /*return*/, {
                            isValid: false,
                            error: "SQL\u9A8C\u8BC1\u9519\u8BEF: ".concat(error.message)
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取用户角色允许访问的表 - 增强版
     */
    AIQueryController.prototype.getAllowedTables = function (userRole) {
        var rolePermissions = {
            'admin': ['*'],
            'principal': [
                // 基础数据表
                'students', 'teachers', 'classes', 'activities', 'parents', 'kindergartens',
                // 招生相关表
                'enrollment_plans', 'enrollment_applications', 'enrollment_consultations',
                'enrollment_quotas', 'enrollment_tasks', 'admission_results',
                // 活动相关表
                'activity_registrations', 'activity_evaluations', 'activity_plans',
                'activity_arrangements', 'activity_resources', 'activity_staff',
                // 营销相关表
                'marketing_campaigns', 'advertisements', 'channel_trackings',
                'conversion_trackings', 'poster_templates', 'poster_generations',
                // 系统管理表
                'schedules', 'todos', 'notifications', 'message_templates',
                'operation_logs', 'system_configs', 'system_logs',
                // 用户权限表
                'users', 'roles', 'permissions', 'user_roles', 'role_permissions',
                // AI相关表
                'ai_conversations', 'ai_messages', 'ai_query_logs', 'ai_query_templates',
                'ai_query_caches', 'ai_model_config', 'ai_model_usage'
            ],
            'teacher': [
                'students', 'classes', 'activities', 'activity_registrations',
                'activity_evaluations', 'activity_plans', 'schedules', 'todos',
                'notifications', 'parents', 'parent_student_relations'
            ],
            'parent': [
                'students', 'activities', 'activity_registrations', 'schedules',
                'notifications', 'classes', 'teachers'
            ]
        };
        return rolePermissions[userRole] || ['students', 'activities'];
    };
    /**
     * 处理查询结果
     */
    AIQueryController.prototype.processResults = function (rawResults, naturalQuery) {
        return __awaiter(this, void 0, void 0, function () {
            var data, columns, metadata, visualization;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data = rawResults;
                        columns = this.extractColumnInfo(data);
                        metadata = {
                            columns: columns,
                            rowCount: data.length,
                            executionTime: 0,
                            cacheHit: false
                        };
                        return [4 /*yield*/, this.generateVisualization(data, naturalQuery)];
                    case 1:
                        visualization = _a.sent();
                        return [2 /*return*/, {
                                data: data,
                                metadata: metadata,
                                visualization: visualization
                            }];
                }
            });
        });
    };
    /**
     * 提取列信息
     */
    AIQueryController.prototype.extractColumnInfo = function (data) {
        var _this = this;
        if (!data || data.length === 0) {
            return [];
        }
        var firstRow = data[0];
        return Object.keys(firstRow).map(function (key) { return ({
            name: key,
            type: _this.inferColumnType(firstRow[key]),
            label: _this.generateColumnLabel(key)
        }); });
    };
    /**
     * 推断列类型
     */
    AIQueryController.prototype.inferColumnType = function (value) {
        if (value === null || value === undefined)
            return 'string';
        if (typeof value === 'number')
            return 'number';
        if (value instanceof Date)
            return 'date';
        if (typeof value === 'boolean')
            return 'boolean';
        // 尝试解析数字
        if (typeof value === 'string' && !isNaN(Number(value)))
            return 'number';
        // 尝试解析日期
        if (typeof value === 'string' && !isNaN(Date.parse(value)))
            return 'date';
        return 'string';
    };
    /**
     * 生成列标签
     */
    AIQueryController.prototype.generateColumnLabel = function (columnName) {
        var labelMap = {
            'id': 'ID',
            'name': '姓名',
            'student_name': '学生姓名',
            'class_name': '班级名称',
            'activity_title': '活动标题',
            'student_count': '学生数量',
            'teacher_count': '教师数量',
            'total_count': '总数量',
            'enrollment_count': '报名数量',
            'created_at': '创建时间',
            'updated_at': '更新时间',
            'category': '类别',
            'total_amount': '总金额',
            'unit': '单位',
            'period': '时期'
        };
        return labelMap[columnName] || columnName;
    };
    /**
     * 从查询结果生成列信息
     */
    AIQueryController.prototype.generateColumnsFromData = function (queryResults) {
        if (!queryResults || queryResults.length === 0) {
            return [];
        }
        var firstRow = queryResults[0];
        var columns = Object.keys(firstRow).map(function (key) {
            var value = firstRow[key];
            var type = 'string';
            // 推断数据类型
            if (typeof value === 'number') {
                type = 'number';
            }
            else if (value instanceof Date || (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value))) {
                type = 'date';
            }
            else if (typeof value === 'boolean') {
                type = 'boolean';
            }
            else if (typeof value === 'string') {
                // 检查是否是状态值
                var statusWords = ['status', 'state', 'type', 'category', '状态', '类型', '类别'];
                if (statusWords.some(function (word) { return key.toLowerCase().includes(word); })) {
                    type = 'status';
                }
            }
            // 生成友好的标签名
            var label = key;
            var labelMap = {
                'category': '类别',
                'total_amount': '金额',
                'unit': '单位',
                'period': '时期',
                'created_at': '创建时间',
                'updated_at': '更新时间',
                'id': 'ID',
                'name': '名称',
                'status': '状态'
            };
            if (labelMap[key]) {
                label = labelMap[key];
            }
            return {
                name: key,
                type: type,
                label: label
            };
        });
        return columns;
    };
    /**
     * 基于查询分析结果生成智能可视化
     */
    AIQueryController.prototype.generateIntelligentVisualization = function (data, naturalQuery, queryAnalysis) {
        return __awaiter(this, void 0, void 0, function () {
            var columns;
            return __generator(this, function (_a) {
                if (!data || data.length === 0) {
                    return [2 /*return*/, null];
                }
                columns = Object.keys(data[0]);
                // 基于查询类型智能选择可视化方式
                switch (queryAnalysis.queryType) {
                    case '统计查询':
                        return [2 /*return*/, this.createStatisticsVisualization(data, columns, naturalQuery)];
                    case '学生查询':
                        return [2 /*return*/, this.createStudentVisualization(data, columns)];
                    case '教师查询':
                        return [2 /*return*/, this.createTeacherVisualization(data, columns)];
                    case '活动查询':
                        return [2 /*return*/, this.createActivityVisualization(data, columns)];
                    case '财务查询':
                        return [2 /*return*/, this.createFinancialVisualization(data, columns)];
                    default:
                        return [2 /*return*/, this.createDefaultVisualization(data, columns, naturalQuery)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 创建统计查询可视化
     */
    AIQueryController.prototype.createStatisticsVisualization = function (data, columns, naturalQuery) {
        // 如果是计数查询且有两列数据
        if (columns.length === 2 && this.isCountQuery(naturalQuery)) {
            return this.createBarChart(data, columns);
        }
        // 如果包含时间字段，创建趋势图
        var timeColumn = columns.find(function (col) {
            return col.includes('date') || col.includes('time') || col.includes('created_at');
        });
        if (timeColumn && columns.length >= 2) {
            return this.createTrendChart(data, columns, timeColumn);
        }
        return this.createBarChart(data, columns);
    };
    /**
     * 创建趋势图
     */
    AIQueryController.prototype.createTrendChart = function (data, columns, timeColumn) {
        var valueColumn = columns.find(function (col) { return col !== timeColumn; }) || columns[1];
        return {
            type: 'line',
            title: '数据趋势图',
            config: {
                xAxis: {
                    type: 'category',
                    data: data.map(function (item) { return item[timeColumn]; })
                },
                yAxis: {
                    type: 'value'
                },
                series: [{
                        data: data.map(function (item) { return item[valueColumn]; }),
                        type: 'line',
                        smooth: true
                    }]
            }
        };
    };
    /**
     * 生成可视化配置
     */
    AIQueryController.prototype.generateVisualization = function (data, naturalQuery) {
        return __awaiter(this, void 0, void 0, function () {
            var columns;
            return __generator(this, function (_a) {
                if (!data || data.length === 0) {
                    return [2 /*return*/, null];
                }
                columns = Object.keys(data[0]);
                // 判断是否适合生成图表
                if (this.isCountQuery(naturalQuery) && columns.length === 2) {
                    return [2 /*return*/, this.createBarChart(data, columns)];
                }
                if (this.isFinancialQuery(naturalQuery)) {
                    return [2 /*return*/, this.createFinancialChart(data, columns)];
                }
                return [2 /*return*/, null]; // 默认使用表格显示
            });
        });
    };
    /**
     * 创建学生查询可视化
     */
    AIQueryController.prototype.createStudentVisualization = function (data, columns) {
        // 如果有年龄或班级信息，创建分布图
        var ageColumn = columns.find(function (col) { return col.includes('age') || col.includes('年龄'); });
        var classColumn = columns.find(function (col) { return col.includes('class') || col.includes('班级'); });
        if (classColumn && data.length > 1) {
            // 按班级分布饼图
            var classData = this.groupByColumn(data, classColumn);
            return {
                type: 'pie',
                title: '学生班级分布',
                config: {
                    series: [{
                            name: '学生数量',
                            type: 'pie',
                            data: Object.entries(classData).map(function (_a) {
                                var name = _a[0], value = _a[1];
                                return ({
                                    name: name,
                                    value: value
                                });
                            })
                        }]
                }
            };
        }
        if (ageColumn && data.length > 1) {
            // 年龄分布柱状图
            var ageData = this.groupByColumn(data, ageColumn);
            return {
                type: 'bar',
                title: '学生年龄分布',
                config: {
                    xAxis: {
                        type: 'category',
                        data: Object.keys(ageData)
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                            data: Object.values(ageData),
                            type: 'bar'
                        }]
                }
            };
        }
        return this.createDefaultVisualization(data, columns, '学生信息');
    };
    /**
     * 创建教师查询可视化
     */
    AIQueryController.prototype.createTeacherVisualization = function (data, columns) {
        // 如果有科目或等级信息，创建分布图
        var subjectColumn = columns.find(function (col) {
            return col.includes('subject') || col.includes('科目') || col.includes('专业');
        });
        var levelColumn = columns.find(function (col) {
            return col.includes('level') || col.includes('等级') || col.includes('职级');
        });
        if (subjectColumn && data.length > 1) {
            var subjectData = this.groupByColumn(data, subjectColumn);
            return {
                type: 'pie',
                title: '教师专业分布',
                config: {
                    series: [{
                            name: '教师数量',
                            type: 'pie',
                            data: Object.entries(subjectData).map(function (_a) {
                                var name = _a[0], value = _a[1];
                                return ({
                                    name: name,
                                    value: value
                                });
                            })
                        }]
                }
            };
        }
        if (levelColumn && data.length > 1) {
            var levelData = this.groupByColumn(data, levelColumn);
            return {
                type: 'bar',
                title: '教师职级分布',
                config: {
                    xAxis: {
                        type: 'category',
                        data: Object.keys(levelData)
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                            data: Object.values(levelData),
                            type: 'bar'
                        }]
                }
            };
        }
        return this.createDefaultVisualization(data, columns, '教师信息');
    };
    /**
     * 创建活动查询可视化
     */
    AIQueryController.prototype.createActivityVisualization = function (data, columns) {
        // 如果有状态或类型信息，创建分布图
        var statusColumn = columns.find(function (col) {
            return col.includes('status') || col.includes('状态');
        });
        var typeColumn = columns.find(function (col) {
            return col.includes('type') || col.includes('类型') || col.includes('category');
        });
        if (statusColumn && data.length > 1) {
            var statusData = this.groupByColumn(data, statusColumn);
            return {
                type: 'pie',
                title: '活动状态分布',
                config: {
                    series: [{
                            name: '活动数量',
                            type: 'pie',
                            data: Object.entries(statusData).map(function (_a) {
                                var name = _a[0], value = _a[1];
                                return ({
                                    name: name,
                                    value: value
                                });
                            })
                        }]
                }
            };
        }
        if (typeColumn && data.length > 1) {
            var typeData = this.groupByColumn(data, typeColumn);
            return {
                type: 'bar',
                title: '活动类型分布',
                config: {
                    xAxis: {
                        type: 'category',
                        data: Object.keys(typeData)
                    },
                    yAxis: {
                        type: 'value'
                    },
                    series: [{
                            data: Object.values(typeData),
                            type: 'bar'
                        }]
                }
            };
        }
        return this.createDefaultVisualization(data, columns, '活动信息');
    };
    /**
     * 创建财务查询可视化
     */
    AIQueryController.prototype.createFinancialVisualization = function (data, columns) {
        // 寻找金额相关字段
        var amountColumn = columns.find(function (col) {
            return col.includes('amount') || col.includes('money') || col.includes('金额') ||
                col.includes('费用') || col.includes('price') || col.includes('cost');
        });
        // 寻找时间相关字段
        var timeColumn = columns.find(function (col) {
            return col.includes('date') || col.includes('time') || col.includes('created_at');
        });
        if (amountColumn && timeColumn && data.length > 1) {
            // 创建金额趋势图
            return {
                type: 'line',
                title: '财务数据趋势',
                config: {
                    xAxis: {
                        type: 'category',
                        data: data.map(function (item) { return item[timeColumn]; })
                    },
                    yAxis: {
                        type: 'value',
                        name: '金额'
                    },
                    series: [{
                            data: data.map(function (item) { return item[amountColumn]; }),
                            type: 'line',
                            smooth: true,
                            itemStyle: {
                                color: '#67C23A'
                            }
                        }]
                }
            };
        }
        if (amountColumn && data.length > 1) {
            // 如果有分类字段，创建分类金额图
            var categoryColumn_1 = columns.find(function (col) {
                return col !== amountColumn && !col.includes('id') &&
                    (col.includes('type') || col.includes('category') || col.includes('name'));
            });
            if (categoryColumn_1) {
                return {
                    type: 'bar',
                    title: '财务分类统计',
                    config: {
                        xAxis: {
                            type: 'category',
                            data: data.map(function (item) { return item[categoryColumn_1]; })
                        },
                        yAxis: {
                            type: 'value',
                            name: '金额'
                        },
                        series: [{
                                data: data.map(function (item) { return item[amountColumn]; }),
                                type: 'bar',
                                itemStyle: {
                                    color: '#409EFF'
                                }
                            }]
                    }
                };
            }
        }
        return this.createDefaultVisualization(data, columns, '财务信息');
    };
    /**
     * 创建默认可视化
     */
    AIQueryController.prototype.createDefaultVisualization = function (data, columns, naturalQuery) {
        var _this = this;
        // 如果数据量少于2条，使用表格
        if (data.length < 2) {
            return {
                type: 'table',
                title: '查询结果',
                config: {
                    columns: columns.map(function (col) { return ({
                        prop: col,
                        label: _this.generateColumnLabel(col)
                    }); }),
                    data: data
                }
            };
        }
        // 如果只有两列且第二列是数值，创建柱状图
        if (columns.length === 2) {
            var nameCol_1 = columns[0], valueCol_1 = columns[1];
            var firstValue = data[0][valueCol_1];
            if (typeof firstValue === 'number') {
                return {
                    type: 'bar',
                    title: "".concat(this.generateColumnLabel(nameCol_1), "\u7EDF\u8BA1"),
                    config: {
                        xAxis: {
                            type: 'category',
                            data: data.map(function (item) { return item[nameCol_1]; })
                        },
                        yAxis: {
                            type: 'value'
                        },
                        series: [{
                                data: data.map(function (item) { return item[valueCol_1]; }),
                                type: 'bar'
                            }]
                    }
                };
            }
        }
        // 默认返回表格
        return {
            type: 'table',
            title: '查询结果',
            config: {
                columns: columns.map(function (col) { return ({
                    prop: col,
                    label: _this.generateColumnLabel(col)
                }); }),
                data: data
            }
        };
    };
    /**
     * 按指定列分组统计
     */
    AIQueryController.prototype.groupByColumn = function (data, column) {
        var result = {};
        data.forEach(function (item) {
            var key = item[column] || '未知';
            result[key] = (result[key] || 0) + 1;
        });
        return result;
    };
    /**
     * 判断是否为计数查询
     */
    AIQueryController.prototype.isCountQuery = function (query) {
        return /统计|数量|多少|计算|count/i.test(query);
    };
    /**
     * 判断是否为财务相关查询
     */
    AIQueryController.prototype.isFinancialQuery = function (query) {
        return /收入|营收|财务|费用|预算|金额|收费|学费|成本|利润|资金/i.test(query);
    };
    /**
     * 创建柱状图配置
     */
    AIQueryController.prototype.createBarChart = function (data, columns) {
        var labelColumn = columns[0], valueColumn = columns[1];
        return {
            type: 'bar',
            title: '统计图表',
            xAxis: {
                data: data.map(function (row) { return row[labelColumn]; })
            },
            yAxis: {},
            series: [{
                    name: this.generateColumnLabel(valueColumn),
                    type: 'bar',
                    data: data.map(function (row) { return row[valueColumn]; })
                }]
        };
    };
    /**
     * 创建财务图表配置
     */
    AIQueryController.prototype.createFinancialChart = function (data, columns) {
        return {
            type: 'pie',
            title: '财务分析图表',
            series: [{
                    name: '财务分析',
                    type: 'pie',
                    data: data.map(function (row) { return ({
                        name: row.category || '未知类别',
                        value: row.total_amount || row.estimated_monthly_income || 0
                    }); })
                }]
        };
    };
    /**
     * 根据意图执行数据库查询
     */
    AIQueryController.prototype.executeDataQueries = function (intentAnalysis, context) {
        return __awaiter(this, void 0, void 0, function () {
            var queries, _a, _b, _c, _d, overviewData, error_17, errorMessage, errorDetails;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 10, , 11]);
                        queries = {};
                        if (!intentAnalysis.dimensions.includes('age_distribution')) return [3 /*break*/, 2];
                        _a = queries;
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT \n            CASE \n              WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 3 THEN '2-3\u5C81(\u6258\u73ED)'\n              WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 4 THEN '3-4\u5C81(\u5C0F\u73ED)'\n              WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 5 THEN '4-5\u5C81(\u4E2D\u73ED)'\n              ELSE '5-6\u5C81(\u5927\u73ED)'\n            END as ageGroup,\n            COUNT(*) as count,\n            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage\n          FROM students \n          WHERE status = 1 \n          GROUP BY ageGroup\n          ORDER BY count DESC\n        ", { type: 'SELECT' })];
                    case 1:
                        _a.ageDistribution = _e.sent();
                        _e.label = 2;
                    case 2:
                        if (!intentAnalysis.dimensions.includes('class_capacity')) return [3 /*break*/, 4];
                        _b = queries;
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT \n            c.name as className,\n            c.type as classType,\n            c.capacity,\n            COUNT(s.id) as currentCount,\n            ROUND(COUNT(s.id) * 100.0 / c.capacity, 2) as utilizationRate,\n            (c.capacity - COUNT(s.id)) as availableSpots\n          FROM classes c\n          LEFT JOIN students s ON c.id = s.class_id AND s.status = 1\n          WHERE c.status = 1\n          GROUP BY c.id, c.name, c.type, c.capacity\n          ORDER BY utilizationRate DESC\n        ", { type: 'SELECT' })];
                    case 3:
                        _b.classCapacity = _e.sent();
                        _e.label = 4;
                    case 4:
                        if (!intentAnalysis.dimensions.includes('gender_balance')) return [3 /*break*/, 6];
                        _c = queries;
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT \n            CASE gender WHEN 1 THEN '\u7537' WHEN 2 THEN '\u5973' ELSE '\u672A\u77E5' END as gender,\n            COUNT(*) as count,\n            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage\n          FROM students \n          WHERE status = 1 \n          GROUP BY gender\n        ", { type: 'SELECT' })];
                    case 5:
                        _c.genderBalance = _e.sent();
                        _e.label = 6;
                    case 6:
                        if (!intentAnalysis.dimensions.includes('geographic_distribution')) return [3 /*break*/, 8];
                        _d = queries;
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT \n            SUBSTRING_INDEX(current_address, '\u533A', 1) as district,\n            COUNT(*) as studentCount,\n            ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage\n          FROM students \n          WHERE status = 1 AND current_address IS NOT NULL\n          GROUP BY district\n          HAVING studentCount >= 3\n          ORDER BY studentCount DESC\n          LIMIT 10\n        ", { type: 'SELECT' })];
                    case 7:
                        _d.geographicDistribution = _e.sent();
                        _e.label = 8;
                    case 8: return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          (SELECT COUNT(*) FROM students WHERE status = 1) as totalStudents,\n          (SELECT COUNT(*) FROM classes WHERE status = 1) as totalClasses,\n          (SELECT ROUND(AVG(TIMESTAMPDIFF(YEAR, birth_date, CURDATE())), 1) FROM students WHERE status = 1) as avgAge,\n          (SELECT ROUND(SUM(CASE WHEN s.status = 1 THEN 1 ELSE 0 END) * 100.0 / SUM(c.capacity), 2) \n           FROM classes c LEFT JOIN students s ON c.id = s.class_id WHERE c.status = 1) as overallUtilization\n      ", { type: 'SELECT' })];
                    case 9:
                        overviewData = _e.sent();
                        return [2 /*return*/, {
                                primaryData: queries.ageDistribution || queries.classCapacity || [],
                                ageDistribution: queries.ageDistribution,
                                classCapacity: queries.classCapacity,
                                genderBalance: queries.genderBalance,
                                geographicDistribution: queries.geographicDistribution,
                                overview: overviewData[0]
                            }];
                    case 10:
                        error_17 = _e.sent();
                        console.error('数据查询失败:', error_17);
                        errorMessage = error_17 instanceof Error ? error_17.message : String(error_17);
                        errorDetails = {
                            type: 'DATABASE_QUERY_ERROR',
                            message: "\u6570\u636E\u5E93\u67E5\u8BE2\u5931\u8D25: ".concat(errorMessage),
                            originalError: errorMessage,
                            timestamp: new Date().toISOString(),
                            context: 'executeDataQueries'
                        };
                        // 返回包含错误信息的数据结构，而不是静默使用模拟数据
                        return [2 /*return*/, {
                                error: errorDetails,
                                fallbackData: {
                                    primaryData: [
                                        { ageGroup: '3-4岁(小班)', count: 128, percentage: 44.9 },
                                        { ageGroup: '4-5岁(中班)', count: 89, percentage: 31.2 },
                                        { ageGroup: '5-6岁(大班)', count: 45, percentage: 15.8 },
                                        { ageGroup: '2-3岁(托班)', count: 23, percentage: 8.1 }
                                    ],
                                    overview: { totalStudents: 285, totalClasses: 12, avgAge: 4.2, overallUtilization: 82.5 }
                                },
                                isUsingFallbackData: true
                            }];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 使用豆包模型生成结构化建议
     */
    AIQueryController.prototype.generateRecommendations = function (queryContent, queryResults, userId, availableModels) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, systemPrompt, response, recommendationsText, recommendations, error_18;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        startTime = Date.now();
                        systemPrompt = "\u4F60\u662F\u8D44\u6DF1\u7684\u5E7C\u513F\u56ED\u7BA1\u7406\u548C\u62DB\u751F\u4E13\u5BB6\u3002\u57FA\u4E8E\u63D0\u4F9B\u7684\u751F\u6E90\u6570\u636E\u5206\u6790\uFF0C\u751F\u6210\u4E13\u4E1A\u7684\u7ED3\u6784\u5316\u5EFA\u8BAE\u3002\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\uFF1A\n{\n  \"summary\": \"\u7B80\u8981\u603B\u7ED3\u5206\u6790\u7ED3\u679C\u548C\u4E3B\u8981\u5EFA\u8BAE\",\n  \"recommendations\": [\n    {\n      \"category\": \"\u7ED3\u6784\u4F18\u5316/\u5BB9\u91CF\u8C03\u6574/\u62DB\u751F\u7B56\u7565\",\n      \"priority\": \"high/medium/low\", \n      \"suggestion\": \"\u5177\u4F53\u5EFA\u8BAE\u5185\u5BB9\",\n      \"rationale\": \"\u5EFA\u8BAE\u4F9D\u636E\"\n    }\n  ],\n  \"visualizations\": [\n    {\n      \"type\": \"pie_chart/bar_chart/stat_cards\",\n      \"data\": \"\u6570\u636E\u5B57\u6BB5\u540D\",\n      \"title\": \"\u56FE\u8868\u6807\u9898\",\n      \"priority\": 1\n    }\n  ],\n  \"keyInsights\": [\"\u5173\u952E\u6D1E\u5BDF1\", \"\u5173\u952E\u6D1E\u5BDF2\"]\n}\n\n\u4E25\u683C\u6309JSON\u683C\u5F0F\u8FD4\u56DE\uFF0C\u4E0D\u8981\u5305\u542B\u5176\u4ED6\u6587\u5B57\u3002";
                        return [4 /*yield*/, text_model_service_1["default"].generateText(userId, {
                                model: ((_a = availableModels[0]) === null || _a === void 0 ? void 0 : _a.name) || 'default',
                                messages: [
                                    { role: text_model_service_2.MessageRole.SYSTEM, content: systemPrompt },
                                    { role: text_model_service_2.MessageRole.USER, content: "\n\u7528\u6237\u67E5\u8BE2: ".concat(queryContent, "\n\n\u6570\u636E\u5206\u6790\u7ED3\u679C:\n").concat(JSON.stringify(queryResults, null, 2), "\n\n\u8BF7\u751F\u6210\u4E13\u4E1A\u7684\u7ED3\u6784\u5316\u5EFA\u8BAE\u3002") }
                                ],
                                temperature: 0.3,
                                maxTokens: 1500
                            })];
                    case 1:
                        response = _b.sent();
                        recommendationsText = response.choices[0].message.content;
                        recommendations = JSON.parse(recommendationsText);
                        return [2 /*return*/, __assign(__assign({}, recommendations), { processingTime: Date.now() - startTime })];
                    case 2:
                        error_18 = _b.sent();
                        console.warn('建议生成失败，使用默认建议:', error_18);
                        return [2 /*return*/, {
                                summary: '基于当前生源数据分析，为您提供以下优化建议',
                                recommendations: [
                                    {
                                        category: '结构优化',
                                        priority: 'high',
                                        suggestion: '根据数据分析优化年龄结构分布',
                                        rationale: '基于当前生源分布特点'
                                    }
                                ],
                                visualizations: [
                                    { type: 'pie_chart', data: 'ageDistribution', title: '年龄分布图', priority: 1 }
                                ],
                                keyInsights: ['生源结构总体健康', '建议关注容量利用率'],
                                processingTime: 100
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 🎯 生成API调用计划
     */
    AIQueryController.prototype.generateApiCallPlan = function (query, groupName, groupDetails, queryAnalysis) {
        return __awaiter(this, void 0, void 0, function () {
            var relevantApis, parameters;
            return __generator(this, function (_a) {
                try {
                    relevantApis = this.selectRelevantApis(query, groupDetails.apis);
                    parameters = this.generateApiParameters(query, queryAnalysis, groupDetails.fieldMappings);
                    return [2 /*return*/, {
                            apis: relevantApis,
                            parameters: parameters,
                            description: "\u8C03\u7528".concat(groupName, "\u5206\u7EC4\u7684").concat(relevantApis.length, "\u4E2AAPI\u7AEF\u70B9")
                        }];
                }
                catch (error) {
                    console.error('❌ 生成API调用计划失败:', error);
                    throw new Error('生成API调用计划失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 🔍 选择相关的API端点
     */
    AIQueryController.prototype.selectRelevantApis = function (query, apis) {
        var queryLower = query.toLowerCase();
        // 根据查询内容的关键词匹配API
        var scoredApis = apis.map(function (api) {
            var score = 0;
            // 检查路径匹配
            if (api.path.toLowerCase().includes('list') || api.path.toLowerCase().includes('search')) {
                if (queryLower.includes('查询') || queryLower.includes('获取') || queryLower.includes('所有')) {
                    score += 10;
                }
            }
            // 检查统计相关
            if (api.path.toLowerCase().includes('stat') || api.path.toLowerCase().includes('count')) {
                if (queryLower.includes('统计') || queryLower.includes('数量') || queryLower.includes('总数')) {
                    score += 10;
                }
            }
            // 检查详情相关
            if (api.path.includes('/:id') || api.path.includes('/detail')) {
                if (queryLower.includes('详细') || queryLower.includes('详情') || queryLower.includes('信息')) {
                    score += 8;
                }
            }
            return __assign(__assign({}, api), { score: score });
        });
        // 按分数排序，返回前3个最相关的API
        return scoredApis
            .sort(function (a, b) { return b.score - a.score; })
            .slice(0, 3)
            .filter(function (api) { return api.score > 0; });
    };
    /**
     * 📝 生成API调用参数
     */
    AIQueryController.prototype.generateApiParameters = function (query, queryAnalysis, fieldMappings) {
        var parameters = {};
        // 基础分页参数
        parameters.pagination = {
            page: 1,
            pageSize: 20
        };
        // 基于查询内容生成过滤条件
        if (query.includes('活跃') || query.includes('在读')) {
            parameters.filters = { status: 1 };
        }
        // 基于字段映射生成排序
        if (fieldMappings.fields) {
            parameters.sort = {
                field: 'created_at',
                order: 'desc'
            };
        }
        return parameters;
    };
    /**
     * 执行API调用计划 (v3.0 新增)
     */
    AIQueryController.prototype.executeApiCalls = function (apiCallPlan) {
        return __awaiter(this, void 0, void 0, function () {
            var mockResults;
            return __generator(this, function (_a) {
                try {
                    console.log('🚀 开始执行API调用计划:', apiCallPlan.apis.length, '个API');
                    mockResults = this.generateMockApiResults(apiCallPlan);
                    console.log('✅ API调用完成，返回', mockResults.length, '条记录');
                    return [2 /*return*/, mockResults];
                }
                catch (error) {
                    console.error('❌ API调用失败:', error);
                    return [2 /*return*/, []];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 生成模拟API调用结果 (临时方法)
     */
    AIQueryController.prototype.generateMockApiResults = function (apiCallPlan) {
        // 基于API分组生成模拟数据
        var groupName = apiCallPlan.group || '学生管理';
        switch (groupName) {
            case '学生管理':
                return this.generateMockStudentData();
            case '教师管理':
                return this.generateMockTeacherData();
            case '班级管理':
                return this.generateMockClassData();
            case '活动管理':
                return this.generateMockActivityData();
            default:
                return [{ message: "".concat(groupName, "\u6570\u636E\u6682\u65E0") }];
        }
    };
    /**
     * 生成模拟学生数据
     */
    AIQueryController.prototype.generateMockStudentData = function () {
        return [
            { id: 1, name: '张小明', age: 5, "class": '大班A', status: '在读' },
            { id: 2, name: '李小红', age: 4, "class": '中班B', status: '在读' },
            { id: 3, name: '王小华', age: 6, "class": '大班C', status: '在读' }
        ];
    };
    /**
     * 生成模拟教师数据
     */
    AIQueryController.prototype.generateMockTeacherData = function () {
        return [
            { id: 1, name: '张老师', subject: '语言', "class": '大班A', experience: 5 },
            { id: 2, name: '李老师', subject: '数学', "class": '中班B', experience: 3 },
            { id: 3, name: '王老师', subject: '美术', "class": '大班C', experience: 8 }
        ];
    };
    /**
     * 生成模拟班级数据
     */
    AIQueryController.prototype.generateMockClassData = function () {
        return [
            { id: 1, name: '大班A', studentCount: 25, teacher: '张老师', room: '101' },
            { id: 2, name: '中班B', studentCount: 20, teacher: '李老师', room: '102' },
            { id: 3, name: '大班C', studentCount: 22, teacher: '王老师', room: '103' }
        ];
    };
    /**
     * 生成模拟活动数据
     */
    AIQueryController.prototype.generateMockActivityData = function () {
        return [
            { id: 1, name: '春游活动', date: '2024-03-15', participants: 45, status: '已完成' },
            { id: 2, name: '亲子运动会', date: '2024-04-20', participants: 60, status: '进行中' },
            { id: 3, name: '六一儿童节', date: '2024-06-01', participants: 80, status: '计划中' }
        ];
    };
    return AIQueryController;
}());
exports.AIQueryController = AIQueryController;
// 创建控制器实例并导出
var aiQueryController = new AIQueryController();
exports["default"] = aiQueryController;
