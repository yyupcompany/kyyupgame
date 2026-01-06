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
exports.MessageService = void 0;
var ai_message_model_1 = require("../../models/ai-message.model");
var ai_conversation_model_1 = require("../../models/ai-conversation.model");
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
var ai_bridge_service_1 = require("./bridge/ai-bridge.service");
var logger_1 = require("../../utils/logger");
var tool_calling_service_1 = __importDefault(require("./tool-calling.service"));
// FunctionToolsService removed - replaced by six-dimensional memory system
var page_guide_model_1 = require("../../models/page-guide.model");
var operation_log_model_1 = require("../../models/operation-log.model");
var message_intent_analyzer_service_1 = require("../ai-operator/message-intent-analyzer.service");
/**
 * AI消息服务
 * 负责处理消息相关的业务逻辑
 */
var MessageService = /** @class */ (function () {
    function MessageService() {
    }
    /**
     * @description 获取指定会话的消息列表（分页）
     * @param conversationId 会话ID
     * @param userId 用户ID，用于权限验证
     * @param options 分页选项
     * @returns 分页消息列表
     * @throws ApiError 如会话不存在或用户无权访问
     */
    MessageService.prototype.getConversationMessages = function (conversationId, userId, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var conversation, _a, page, _b, pageSize, findOptions, _c, count, rows;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({ where: { id: conversationId, userId: userId } })];
                    case 1:
                        conversation = _d.sent();
                        if (!conversation) {
                            throw apiError_1.ApiError.notFound('会话不存在或无权访问');
                        }
                        _a = options.page, page = _a === void 0 ? 1 : _a, _b = options.pageSize, pageSize = _b === void 0 ? 20 : _b;
                        findOptions = {
                            where: { conversationId: conversationId },
                            order: [['createdAt', 'ASC']],
                            limit: pageSize,
                            offset: (page - 1) * pageSize
                        };
                        return [4 /*yield*/, ai_message_model_1.AIMessage.findAndCountAll(findOptions)];
                    case 2:
                        _c = _d.sent(), count = _c.count, rows = _c.rows;
                        // 3. 返回格式化的分页结果
                        return [2 /*return*/, {
                                data: rows,
                                meta: {
                                    page: page,
                                    pageSize: pageSize,
                                    totalItems: count,
                                    totalPages: Math.ceil(count / pageSize)
                                }
                            }];
                }
            });
        });
    };
    /**
     * @description 创建一条新消息，并更新会话的元数据
     * @param dto 包含创建消息所需数据的对象
     * @returns 创建的消息实体
     * @throws ApiError 如会话不存在或用户无权访问
     */
    MessageService.prototype.createMessage = function (dto) {
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, userId, role, content, messageType, mediaUrl, metadata, tokens, status, conversation, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conversationId = dto.conversationId, userId = dto.userId, role = dto.role, content = dto.content, messageType = dto.messageType, mediaUrl = dto.mediaUrl, metadata = dto.metadata, tokens = dto.tokens, status = dto.status;
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({ where: { id: conversationId, userId: userId } })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw apiError_1.ApiError.notFound('会话不存在或无权访问');
                        }
                        return [4 /*yield*/, ai_message_model_1.AIMessage.create({
                                conversationId: conversationId,
                                userId: userId,
                                role: role,
                                content: content,
                                messageType: messageType || ai_message_model_1.MessageType.TEXT,
                                mediaUrl: mediaUrl || null,
                                metadata: metadata || {},
                                tokens: tokens || 0,
                                status: status || ai_message_model_1.MessageStatus.DELIVERED
                            })];
                    case 2:
                        message = _a.sent();
                        // 3. 原子地更新会话的最后消息时间和消息总数
                        conversation.lastMessageAt = new Date();
                        return [4 /*yield*/, conversation.increment('messageCount', { by: 1 })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, message];
                }
            });
        });
    };
    /**
     * @description 发送消息并生成AI回复
     * @param dto 发送消息的数据
     * @param stream 是否使用流式输出
     * @returns AI回复消息或流
     * @throws ApiError 如会话不存在或AI调用失败
     */
    MessageService.prototype.sendMessage = function (dto, stream) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (stream === void 0) { stream = false; }
        return __awaiter(this, void 0, void 0, function () {
            var conversationId, userId, content, metadata, conversation, userMessage, enrichedMetadata, analysis, error_1, defaultTitles, needAuto, clean, newTitle, newSummary, e_1, aiResponse, aiContent, usedLocalFallback, modelConfig, relevantMemories, recentMessages, usedMemoryIds, isHistoryQuery, memoryContext, pageContext_1, now, cacheValidDuration, pageGuide, error_2, aiBridgeMessages, lastMessage, isDuplicate, organizationContext, conversationMetadata, hasLoadedOrgStatus, orgStatusResult, baseSystemContent, allDefaultModels, requestParams, supportsTools, selectedToolsApi, ToolManagerService, toolManager, minimalTools, e_2, role, getToolName_1, isDbTool_1, isSystemTool_1, filteredTools, validatedTools, i, tool, toolName, toolDescription, toolParameters, validatedTool, customConfig, choice, message, thinkingContent, responseData, messageAny, choiceAny, toolResults, _i, _r, toolCall, functionCall, toolResult, uiToolNames, operationToolNames, ToolLoaderService, loader, toolDefs, toolDef, args, result, loadError_1, errorMessage, i, finalRequestParams, finalResponse, finalChoice, finalMessage, finalThinkingContent, finalMessageAny, finalChoiceAny, componentResults, uiComponents, aiEnhanced, aiEnhanced, modelError_1, error_3, aiMessage, currentUsedMemoryIds, newMemoryIds, updatedUsedMemoryIds, tokenOptimizationInfo;
            var _s;
            var _this = this;
            return __generator(this, function (_t) {
                switch (_t.label) {
                    case 0:
                        conversationId = dto.conversationId, userId = dto.userId, content = dto.content, metadata = dto.metadata;
                        logger_1.logger.info('处理用户消息', { conversationId: conversationId, userId: userId, contentLength: content.length });
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({
                                where: { id: conversationId, userId: userId }
                            })];
                    case 1:
                        conversation = _t.sent();
                        if (!!conversation) return [3 /*break*/, 3];
                        // 自动创建会话
                        logger_1.logger.info('会话不存在，自动创建新会话', { conversationId: conversationId, userId: userId });
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.create({
                                id: conversationId,
                                userId: userId,
                                title: '新对话',
                                summary: '',
                                messageCount: 0,
                                isArchived: false,
                                lastMessageAt: new Date(),
                                lastPagePath: '',
                                pageContext: '{}',
                                lastPageUpdateAt: new Date(),
                                usedMemoryIds: []
                            })];
                    case 2:
                        conversation = _t.sent();
                        _t.label = 3;
                    case 3: return [4 /*yield*/, ai_message_model_1.AIMessage.create({
                            conversationId: conversationId,
                            userId: userId,
                            role: 'user',
                            content: content,
                            isDeleted: false,
                            messageType: ai_message_model_1.MessageType.TEXT,
                            status: ai_message_model_1.MessageStatus.DELIVERED,
                            tokens: 0,
                            metadata: metadata || {}
                        })];
                    case 4:
                        userMessage = _t.sent();
                        enrichedMetadata = metadata || {};
                        _t.label = 5;
                    case 5:
                        _t.trys.push([5, 8, , 9]);
                        logger_1.logger.info('🔍 [消息意图分析] 开始分析消息意图', {
                            messageId: userMessage.id,
                            contentLength: content.length
                        });
                        return [4 /*yield*/, message_intent_analyzer_service_1.messageIntentAnalyzer.analyzeIntent(content, {
                                userId: userId,
                                conversationId: conversationId,
                                pagePath: dto.pagePath,
                                userRole: metadata === null || metadata === void 0 ? void 0 : metadata.userRole
                            })];
                    case 6:
                        analysis = _t.sent();
                        logger_1.logger.info('✅ [消息意图分析] 分析完成', {
                            intent: analysis.intent,
                            confidence: analysis.confidence,
                            complexity: analysis.complexity,
                            requiresTools: analysis.requiresTools,
                            analysisMethod: analysis.analysisMethod
                        });
                        // 自动设置enableTools
                        enrichedMetadata = __assign(__assign({}, enrichedMetadata), { enableTools: analysis.requiresTools && analysis.confidence > 0.7, messageAnalysis: analysis, autoDetected: true });
                        // 更新用户消息的metadata
                        return [4 /*yield*/, userMessage.update({ metadata: enrichedMetadata })];
                    case 7:
                        // 更新用户消息的metadata
                        _t.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_1 = _t.sent();
                        logger_1.logger.error('❌ [消息意图分析] 分析失败，使用默认设置', { error: error_1.message });
                        // 降级处理：保持原有的metadata
                        enrichedMetadata = metadata || {};
                        return [3 /*break*/, 9];
                    case 9:
                        _t.trys.push([9, 12, , 13]);
                        defaultTitles = new Set(['新对话', '新的会话', 'AI 助手对话', 'AI 助手对话', '未命名会话', '新会话']);
                        needAuto = (!conversation.title || defaultTitles.has(conversation.title)) && (conversation.messageCount === 0);
                        if (!needAuto) return [3 /*break*/, 11];
                        clean = (content || '').replace(/\s+/g, ' ').trim();
                        newTitle = clean.slice(0, 14) || '新对话';
                        newSummary = clean.slice(0, 50);
                        conversation.title = newTitle;
                        if (!conversation.summary)
                            conversation.summary = newSummary;
                        return [4 /*yield*/, conversation.save()];
                    case 10:
                        _t.sent();
                        _t.label = 11;
                    case 11: return [3 /*break*/, 13];
                    case 12:
                        e_1 = _t.sent();
                        logger_1.logger.warn('自动命名失败（不影响主流程）', e_1);
                        return [3 /*break*/, 13];
                    case 13:
                        // 异步记录操作日志（不影响主流程）
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, operation_log_model_1.OperationLog.create({
                                                userId: userId,
                                                module: 'ai-conversation',
                                                action: 'ai:user_message',
                                                operationType: operation_log_model_1.OperationType.CREATE,
                                                resourceType: 'message',
                                                resourceId: String(userMessage.id),
                                                description: null,
                                                requestMethod: null,
                                                requestUrl: null,
                                                requestParams: null,
                                                requestIp: null,
                                                userAgent: null,
                                                deviceInfo: null,
                                                operationResult: operation_log_model_1.OperationResult.SUCCESS,
                                                resultMessage: null,
                                                executionTime: null
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_3 = _a.sent();
                                        logger_1.logger.warn('记录用户消息操作日志失败', { error: e_3.message });
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })();
                        logger_1.logger.info('用户消息已保存', { messageId: userMessage.id });
                        aiResponse = null;
                        aiContent = '';
                        usedLocalFallback = false;
                        modelConfig = null;
                        relevantMemories = [];
                        _t.label = 14;
                    case 14:
                        _t.trys.push([14, 60, , 61]);
                        return [4 /*yield*/, ai_message_model_1.AIMessage.findAll({
                                where: {
                                    conversationId: conversationId,
                                    id: (_s = {}, _s[sequelize_1.Op.ne] = userMessage.id, _s) // 排除当前用户消息
                                },
                                order: [['createdAt', 'DESC']],
                                limit: 10
                            })];
                    case 15:
                        recentMessages = _t.sent();
                        // 3.5. 使用向量检索相关记忆来优化上下文（TOKEN优化：避免重复记忆）
                        logger_1.logger.info('开始检索相关记忆', { userId: userId, query: content });
                        usedMemoryIds = Array.isArray(conversation.usedMemoryIds) ? conversation.usedMemoryIds : [];
                        logger_1.logger.info('已使用的记忆ID', { usedMemoryIds: usedMemoryIds, count: usedMemoryIds.length });
                        isHistoryQuery = /上个月|上月|之前|历史|以前|聊了什么|说了什么|讨论了什么/.test(content);
                        if (isHistoryQuery) {
                            logger_1.logger.info('🕒 检测到历史查询，使用时间范围搜索', { query: content });
                            try {
                                // 历史记忆搜索已由六维记忆系统处理
                                logger_1.logger.info('历史记忆搜索由六维记忆系统处理', { userId: userId, query: content });
                                relevantMemories = [];
                                logger_1.logger.info('✅ 历史记忆检索成功', {
                                    count: relevantMemories.length,
                                    avgSimilarity: relevantMemories.length > 0
                                        ? relevantMemories.reduce(function (sum, m) { return sum + (m.similarity || 0); }, 0) / relevantMemories.length
                                        : 0
                                });
                            }
                            catch (error) {
                                logger_1.logger.error('❌ 历史记忆检索失败，回退到常规搜索', error);
                                // 回退到六维记忆系统
                                try {
                                    logger_1.logger.info('回退到六维记忆系统处理', { userId: userId, query: content });
                                    relevantMemories = [];
                                }
                                catch (fallbackError) {
                                    logger_1.logger.error('❌ 回退记忆搜索也失败，跳过记忆检索', fallbackError);
                                    relevantMemories = []; // 使用空数组继续处理
                                }
                            }
                        }
                        else {
                            // 常规记忆搜索 - 由六维记忆系统处理
                            try {
                                logger_1.logger.info('常规记忆搜索由六维记忆系统处理', { userId: userId, query: content });
                                relevantMemories = [];
                            }
                            catch (error) {
                                logger_1.logger.error('常规记忆搜索失败，跳过记忆检索', error);
                                relevantMemories = []; // 使用空数组继续处理
                            }
                        }
                        // 限制最终使用的记忆数量
                        relevantMemories = relevantMemories.slice(0, 5);
                        memoryContext = '';
                        if (relevantMemories.length > 0) {
                            memoryContext = '\n\n[相关记忆上下文]:\n' +
                                relevantMemories.map(function (memory, index) {
                                    return "".concat(index + 1, ". ").concat(memory.content, " (\u91CD\u8981\u6027: ").concat(memory.importance, ")");
                                }).join('\n') + '\n[记忆上下文结束]\n';
                            logger_1.logger.info('检索到相关记忆', {
                                memoryCount: relevantMemories.length,
                                avgSimilarity: relevantMemories.reduce(function (sum, m) { return sum + m.similarity; }, 0) / relevantMemories.length
                            });
                        }
                        pageContext_1 = '';
                        if (!dto.pagePath) return [3 /*break*/, 23];
                        _t.label = 16;
                    case 16:
                        _t.trys.push([16, 22, , 23]);
                        now = new Date();
                        cacheValidDuration = 5 * 60 * 1000;
                        if (!(conversation.lastPagePath === dto.pagePath &&
                            conversation.pageContext &&
                            conversation.lastPageUpdateAt &&
                            (now.getTime() - conversation.lastPageUpdateAt.getTime()) < cacheValidDuration)) return [3 /*break*/, 17];
                        // 使用缓存的页面上下文
                        pageContext_1 = conversation.pageContext;
                        logger_1.logger.info('使用缓存的页面上下文', {
                            pagePath: dto.pagePath,
                            cacheAge: Math.round((now.getTime() - conversation.lastPageUpdateAt.getTime()) / 1000),
                            tokensSaved: '约200-500 tokens'
                        });
                        return [3 /*break*/, 21];
                    case 17:
                        // 重新获取页面上下文
                        logger_1.logger.info('重新获取页面上下文', { pagePath: dto.pagePath });
                        return [4 /*yield*/, page_guide_model_1.PageGuide.findOne({
                                where: {
                                    pagePath: dto.pagePath,
                                    isActive: true
                                },
                                include: [
                                    {
                                        model: page_guide_model_1.PageGuideSection,
                                        as: 'sections',
                                        where: { isActive: true },
                                        required: false,
                                        order: [['sortOrder', 'ASC']]
                                    }
                                ]
                            })];
                    case 18:
                        pageGuide = _t.sent();
                        if (!pageGuide) return [3 /*break*/, 20];
                        // 构建页面上下文
                        pageContext_1 = "\n\n[\u5F53\u524D\u9875\u9762\u4E0A\u4E0B\u6587]:\n";
                        pageContext_1 += "\u9875\u9762: ".concat(pageGuide.pageName, " (").concat(pageGuide.pagePath, ")\n");
                        pageContext_1 += "\u63CF\u8FF0: ".concat(pageGuide.pageDescription, "\n");
                        if (pageGuide.sections && pageGuide.sections.length > 0) {
                            pageContext_1 += "\u529F\u80FD\u677F\u5757:\n";
                            pageGuide.sections.forEach(function (section, index) {
                                pageContext_1 += "".concat(index + 1, ". ").concat(section.sectionName, ": ").concat(section.sectionDescription, "\n");
                                if (section.features && section.features.length > 0) {
                                    pageContext_1 += "   \u7279\u6027: ".concat(section.features.join(', '), "\n");
                                }
                            });
                        }
                        if (pageGuide.relatedTables && pageGuide.relatedTables.length > 0) {
                            pageContext_1 += "\u76F8\u5173\u6570\u636E\u8868: ".concat(pageGuide.relatedTables.join(', '), "\n");
                        }
                        if (pageGuide.contextPrompt) {
                            pageContext_1 += "\u4E0A\u4E0B\u6587\u63D0\u793A: ".concat(pageGuide.contextPrompt, "\n");
                        }
                        pageContext_1 += "[\u9875\u9762\u4E0A\u4E0B\u6587\u7ED3\u675F]\n";
                        // TOKEN优化：缓存页面上下文
                        return [4 /*yield*/, conversation.update({
                                lastPagePath: dto.pagePath,
                                pageContext: pageContext_1,
                                lastPageUpdateAt: now
                            })];
                    case 19:
                        // TOKEN优化：缓存页面上下文
                        _t.sent();
                        logger_1.logger.info('获取页面上下文成功并已缓存', {
                            pageName: pageGuide.pageName,
                            sectionsCount: ((_a = pageGuide.sections) === null || _a === void 0 ? void 0 : _a.length) || 0,
                            contextLength: pageContext_1.length
                        });
                        return [3 /*break*/, 21];
                    case 20:
                        logger_1.logger.warn('未找到页面说明文档', { pagePath: dto.pagePath });
                        _t.label = 21;
                    case 21: return [3 /*break*/, 23];
                    case 22:
                        error_2 = _t.sent();
                        logger_1.logger.error('获取页面上下文失败', { error: error_2.message, pagePath: dto.pagePath });
                        return [3 /*break*/, 23];
                    case 23:
                        aiBridgeMessages = recentMessages
                            .reverse() // 按时间顺序排列
                            .map(function (msg) { return ({
                            role: msg.role,
                            content: msg.content
                        }); });
                        lastMessage = aiBridgeMessages[aiBridgeMessages.length - 1];
                        isDuplicate = lastMessage &&
                            lastMessage.role === 'user' &&
                            lastMessage.content === content;
                        if (!isDuplicate) {
                            aiBridgeMessages.push({
                                role: 'user',
                                content: content
                            });
                        }
                        else {
                            logger_1.logger.warn('检测到重复的用户消息，跳过添加', { content: content.substring(0, 50) });
                        }
                        organizationContext = '';
                        try {
                            conversationMetadata = conversation.metadata || {};
                            hasLoadedOrgStatus = conversationMetadata.organizationStatusLoaded === true;
                            if (!hasLoadedOrgStatus) {
                                logger_1.logger.info('🏢 首次对话，自动加载机构现状数据');
                                orgStatusResult = { status: 'error', error: 'FunctionToolsService已被六维记忆系统替代' };
                                // FunctionToolsService已被六维记忆系统替代，跳过机构现状加载
                                logger_1.logger.warn('⚠️ 机构现状数据加载已被六维记忆系统替代，跳过');
                            }
                            else {
                                logger_1.logger.info('✅ 机构现状已在之前加载，跳过重复调用');
                            }
                        }
                        catch (error) {
                            logger_1.logger.error('❌ 加载机构现状失败（不影响主流程）', {
                                error: error.message
                            });
                        }
                        baseSystemContent = "\u4F60\u662F\u4E13\u4E1A\u7684\u5E7C\u513F\u56ED\u7BA1\u7406AI\u52A9\u624B\u3002\n\n**\u3010\u56DE\u590D\u683C\u5F0F\u8981\u6C42\u3011**\n- \u4F7F\u7528Markdown\u683C\u5F0F\n- \u57FA\u4E8E\u771F\u5B9E\u6570\u636E\u56DE\u7B54\uFF0C\u907F\u514D\u6A21\u62DF\u6570\u636E\n- \u68C0\u6D4B\u5230\u5173\u952E\u8BCD\u65F6\u6DFB\u52A0\u7EC4\u4EF6\u6807\u8BB0\uFF1A\n  * \u56FE\u8868\u7C7B \u2192 [COMPONENT:chart:bar:\u6570\u636E\u7EDF\u8BA1]\n  * \u8868\u683C\u7C7B \u2192 [COMPONENT:data-table:\u6570\u636E\u5217\u8868]\n  * \u6E05\u5355\u7C7B \u2192 [COMPONENT:todo-list:\u5DE5\u4F5C\u6E05\u5355]\n  * \u7EDF\u8BA1\u7C7B \u2192 [COMPONENT:stat-card:\u7EDF\u8BA1\u6570\u636E:100:\u4E2A]\n\n**\u3010\u5DE5\u5177\u4F7F\u7528\u6307\u5BFC\u3011**\n- \u6570\u636E\u67E5\u8BE2\uFF1A\u4F7F\u7528 query_data \u5DE5\u5177\u83B7\u53D6\u51C6\u786E\u4FE1\u606F\n- \u754C\u9762\u5C55\u793A\uFF1A\u4F7F\u7528 render_component \u5DE5\u5177\u751F\u6210\u7EC4\u4EF6\n- \u590D\u6742\u64CD\u4F5C\uFF1A\u9009\u62E9\u5408\u9002\u7684\u64CD\u4F5C\u5DE5\u5177\u6267\u884C\u4EFB\u52A1";
                        // 添加机构现状上下文（优先级最高）
                        if (organizationContext) {
                            baseSystemContent += organizationContext;
                        }
                        // 添加页面上下文
                        if (pageContext_1) {
                            baseSystemContent += pageContext_1;
                        }
                        // 添加记忆上下文
                        if (memoryContext) {
                            baseSystemContent += "\n\u4EE5\u4E0B\u662F\u4E0E\u5F53\u524D\u5BF9\u8BDD\u76F8\u5173\u7684\u5386\u53F2\u8BB0\u5FC6\uFF0C\u8BF7\u53C2\u8003\u8FD9\u4E9B\u4FE1\u606F\u6765\u63D0\u4F9B\u66F4\u51C6\u786E\u548C\u4E2A\u6027\u5316\u7684\u56DE\u590D\uFF1A".concat(memoryContext);
                        }
                        baseSystemContent += '\n请根据当前页面的功能和用户的历史记忆，提供专业、准确、有针对性的建议和帮助。';
                        _t.label = 24;
                    case 24:
                        _t.trys.push([24, 58, , 59]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findAll({
                                where: {
                                    isDefault: true,
                                    modelType: 'text',
                                    status: 'active' // 只选择激活状态的模型
                                }
                            })];
                    case 25:
                        allDefaultModels = _t.sent();
                        console.log('🔍 查找到的文本类型默认模型:', allDefaultModels.map(function (m) { return ({
                            id: m.id,
                            name: m.name,
                            modelType: m.modelType,
                            status: m.status,
                            isDefault: m.isDefault
                        }); }));
                        // 选择第一个符合条件的模型
                        modelConfig = allDefaultModels[0];
                        console.log('🔍 查询模型配置结果:', {
                            found: !!modelConfig,
                            modelId: modelConfig === null || modelConfig === void 0 ? void 0 : modelConfig.id,
                            modelName: modelConfig === null || modelConfig === void 0 ? void 0 : modelConfig.name,
                            status: modelConfig === null || modelConfig === void 0 ? void 0 : modelConfig.status,
                            isDefault: modelConfig === null || modelConfig === void 0 ? void 0 : modelConfig.isDefault,
                            hasApiKey: !!(modelConfig === null || modelConfig === void 0 ? void 0 : modelConfig.apiKey),
                            apiKeyLength: (_b = modelConfig === null || modelConfig === void 0 ? void 0 : modelConfig.apiKey) === null || _b === void 0 ? void 0 : _b.length,
                            endpointUrl: modelConfig === null || modelConfig === void 0 ? void 0 : modelConfig.endpointUrl
                        });
                        if (!(modelConfig && modelConfig.apiKey && modelConfig.apiKey !== 'sk-test-key-please-replace-with-real-key')) return [3 /*break*/, 56];
                        console.log('\x1b[31m[消息服务] 准备调用真实AI模型\x1b[0m');
                        console.log('\x1b[31m[消息服务] 模型名称:', modelConfig.name, '\x1b[0m');
                        console.log('\x1b[31m[消息服务] 端点URL:', modelConfig.endpointUrl, '\x1b[0m');
                        console.log('\x1b[31m[消息服务] API密钥:', ((_c = modelConfig.apiKey) === null || _c === void 0 ? void 0 : _c.substring(0, 15)) + '...', '\x1b[0m');
                        console.log('\x1b[31m[消息服务] 消息数量:', aiBridgeMessages.length, '\x1b[0m');
                        console.log('\x1b[31m[消息服务] 最大令牌数:', (_f = (_e = (_d = modelConfig.modelParameters) === null || _d === void 0 ? void 0 : _d.maxTokens) !== null && _e !== void 0 ? _e : modelConfig.maxTokens) !== null && _f !== void 0 ? _f : 2000, '\x1b[0m');
                        // 详细打印模型配置
                        console.log('\x1b[36m[消息服务] 完整模型配置:\x1b[0m', JSON.stringify({
                            id: modelConfig.id,
                            name: modelConfig.name,
                            provider: modelConfig.provider,
                            modelType: modelConfig.modelType,
                            endpointUrl: modelConfig.endpointUrl,
                            maxTokens: modelConfig.maxTokens,
                            modelParameters: modelConfig.modelParameters,
                            status: modelConfig.status,
                            isDefault: modelConfig.isDefault
                        }, null, 2));
                        // 详细打印消息内容
                        console.log('\x1b[36m[消息服务] 发送的消息:\x1b[0m', JSON.stringify(aiBridgeMessages, null, 2));
                        requestParams = {
                            model: modelConfig.name,
                            messages: aiBridgeMessages,
                            max_tokens: (_j = (_h = (_g = modelConfig.modelParameters) === null || _g === void 0 ? void 0 : _g.maxTokens) !== null && _h !== void 0 ? _h : modelConfig.maxTokens) !== null && _j !== void 0 ? _j : 2048,
                            temperature: ((_k = modelConfig.modelParameters) === null || _k === void 0 ? void 0 : _k.temperature) || 0.7,
                            stream: false
                        };
                        supportsTools = ((_l = modelConfig.modelParameters) === null || _l === void 0 ? void 0 : _l.supports_tools) === true;
                        if (!(supportsTools && (enrichedMetadata === null || enrichedMetadata === void 0 ? void 0 : enrichedMetadata.enableTools) === true)) return [3 /*break*/, 31];
                        selectedToolsApi = [];
                        if (!((enrichedMetadata === null || enrichedMetadata === void 0 ? void 0 : enrichedMetadata.selectedTools) && Array.isArray(enrichedMetadata.selectedTools) && enrichedMetadata.selectedTools.length > 0)) return [3 /*break*/, 26];
                        console.log('🎯 [工具优化] 使用智能选择的工具', {
                            toolCount: enrichedMetadata.selectedTools.length,
                            tools: enrichedMetadata.selectedTools.map(function (t) { return t.name; })
                        });
                        selectedToolsApi = enrichedMetadata.selectedTools;
                        return [3 /*break*/, 30];
                    case 26:
                        _t.trys.push([26, 29, , 30]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./tools/core/tool-manager.service')); })];
                    case 27:
                        ToolManagerService = (_t.sent()).ToolManagerService;
                        toolManager = new ToolManagerService();
                        return [4 /*yield*/, toolManager.getToolsForQuery({
                                query: content,
                                userRole: (enrichedMetadata === null || enrichedMetadata === void 0 ? void 0 : enrichedMetadata.userRole) || 'user',
                                userId: userId,
                                conversationId: conversationId,
                                maxTools: 3
                            })];
                    case 28:
                        minimalTools = _t.sent();
                        selectedToolsApi = minimalTools || [];
                        return [3 /*break*/, 30];
                    case 29:
                        e_2 = _t.sent();
                        logger_1.logger.warn('最小工具集选择失败，跳过工具注入', { error: e_2.message });
                        selectedToolsApi = [];
                        return [3 /*break*/, 30];
                    case 30:
                        role = ((enrichedMetadata === null || enrichedMetadata === void 0 ? void 0 : enrichedMetadata.userRole) || 'user').toLowerCase();
                        getToolName_1 = function (tool) { var _a; return ((tool === null || tool === void 0 ? void 0 : tool.name) || ((_a = tool === null || tool === void 0 ? void 0 : tool["function"]) === null || _a === void 0 ? void 0 : _a.name) || '').toString(); };
                        isDbTool_1 = function (tool) {
                            var n = getToolName_1(tool);
                            return ['query_past_activities', 'get_activity_statistics', 'query_enrollment_history', 'analyze_business_trends', 'query_data', 'any_query'].includes(n);
                        };
                        isSystemTool_1 = function (tool) { return /model|apikey|system|config|settings/i.test(getToolName_1(tool)); };
                        // 🔍 调试角色过滤逻辑
                        console.log('🔍 [角色过滤] 调试信息:', {
                            role: role,
                            originalRole: enrichedMetadata === null || enrichedMetadata === void 0 ? void 0 : enrichedMetadata.userRole,
                            selectedToolsCount: selectedToolsApi.length,
                            selectedToolNames: selectedToolsApi.map(function (t) { return getToolName_1(t); })
                        });
                        filteredTools = __spreadArray([], selectedToolsApi, true);
                        if (role === 'user' || role === 'normal' || role === 'guest') {
                            // 普通用户：不允许数据库查询
                            filteredTools = filteredTools.filter(function (t) { return !isDbTool_1(t); });
                            console.log('🔍 [角色过滤] 普通用户，过滤数据库工具');
                        }
                        else if (role === 'principal' || role === '园长') {
                            // 园长：允许业务查询，不允许系统设置相关
                            filteredTools = filteredTools.filter(function (t) { return !isSystemTool_1(t); });
                            console.log('🔍 [角色过滤] 园长用户，过滤系统工具');
                        }
                        else if (role === 'teacher' || role === 'parent' || role === '教师' || role === '家长') {
                            // 教师/家长：允许与自身相关的查询（后端会基于 userId 进一步过滤权限）
                            filteredTools = filteredTools.filter(function (t) { return !isSystemTool_1(t); });
                            console.log('🔍 [角色过滤] 教师/家长用户，过滤系统工具');
                            // 注：数据库工具保留，由后端根据 userId/角色做行级/域过滤
                        }
                        else if (role === 'admin' || role === '管理员') {
                            // 管理员：不限制
                            console.log('🔍 [角色过滤] 管理员用户，不限制工具');
                        }
                        else {
                            // 未知角色：保守策略，不允许数据库查询
                            filteredTools = filteredTools.filter(function (t) { return !isDbTool_1(t); });
                            console.log('🔍 [角色过滤] 未知角色，过滤数据库工具');
                        }
                        console.log('🔍 [角色过滤] 过滤结果:', {
                            beforeCount: selectedToolsApi.length,
                            afterCount: filteredTools.length,
                            filteredToolNames: filteredTools.map(function (t) { return getToolName_1(t); })
                        });
                        if (filteredTools.length > 0) {
                            validatedTools = [];
                            for (i = 0; i < filteredTools.length; i++) {
                                tool = filteredTools[i];
                                console.log("\uD83D\uDD0D [\u5DE5\u5177\u9A8C\u8BC1 ".concat(i, "] \u539F\u59CB\u5DE5\u5177:"), JSON.stringify(tool, null, 2));
                                toolName = void 0, toolDescription = void 0, toolParameters = void 0;
                                if (tool.type === 'function' && tool["function"]) {
                                    // 已经是OpenAI格式
                                    toolName = tool["function"].name;
                                    toolDescription = tool["function"].description;
                                    toolParameters = tool["function"].parameters;
                                }
                                else {
                                    // 内部格式，需要转换
                                    toolName = tool.name;
                                    toolDescription = tool.description;
                                    toolParameters = tool.parameters;
                                }
                                // 验证必需字段
                                if (!toolName || typeof toolName !== 'string') {
                                    console.error("\u274C [\u5DE5\u5177\u9A8C\u8BC1 ".concat(i, "] \u5DE5\u5177\u540D\u79F0\u65E0\u6548:"), toolName);
                                    continue;
                                }
                                if (!toolDescription || typeof toolDescription !== 'string') {
                                    console.error("\u274C [\u5DE5\u5177\u9A8C\u8BC1 ".concat(i, "] \u5DE5\u5177\u63CF\u8FF0\u65E0\u6548:"), toolDescription);
                                    continue;
                                }
                                if (!toolParameters || typeof toolParameters !== 'object') {
                                    console.error("\u274C [\u5DE5\u5177\u9A8C\u8BC1 ".concat(i, "] \u5DE5\u5177\u53C2\u6570\u65E0\u6548:"), toolParameters);
                                    continue;
                                }
                                validatedTool = {
                                    type: 'function',
                                    "function": {
                                        name: toolName,
                                        description: toolDescription,
                                        parameters: toolParameters
                                    }
                                };
                                // 最终验证
                                if (validatedTool["function"].name && validatedTool["function"].description && validatedTool["function"].parameters) {
                                    validatedTools.push(validatedTool);
                                    console.log("\u2705 [\u5DE5\u5177\u9A8C\u8BC1 ".concat(i, "] \u5DE5\u5177\u9A8C\u8BC1\u901A\u8FC7: ").concat(toolName));
                                }
                                else {
                                    console.error("\u274C [\u5DE5\u5177\u9A8C\u8BC1 ".concat(i, "] \u6700\u7EC8\u9A8C\u8BC1\u5931\u8D25:"), validatedTool);
                                }
                            }
                            if (validatedTools.length > 0) {
                                requestParams.tools = validatedTools;
                                requestParams.tool_choice = 'auto';
                                console.log("\u2705 [\u5DE5\u5177\u683C\u5F0F] \u6210\u529F\u9A8C\u8BC1 ".concat(validatedTools.length, " \u4E2A\u5DE5\u5177"));
                                console.log('🔍 [最终工具] 工具名称列表:', validatedTools.map(function (t) { return t["function"].name; }));
                            }
                            else {
                                console.warn('⚠️ [工具格式] 没有有效的工具，禁用工具调用');
                                requestParams.tool_choice = 'none';
                            }
                        }
                        console.log('📊 [工具统计] 最终使用的工具数量:', filteredTools.length);
                        console.log('🔧 [调试] 工具详细信息:', filteredTools.map(function (t) {
                            var _a;
                            return ({
                                name: t.name,
                                description: ((_a = t.description) === null || _a === void 0 ? void 0 : _a.substring(0, 80)) + '...',
                                hasParameters: !!t.parameters
                            });
                        }));
                        // 精简系统提示词，不再拼接冗长的“工具使用原则”
                        logger_1.logger.info('启用工具调用功能', {
                            modelName: modelConfig.name,
                            totalToolsCount: filteredTools.length,
                            toolNames: (filteredTools || []).map(function (t) { var _a; return t.name || ((_a = t["function"]) === null || _a === void 0 ? void 0 : _a.name); }),
                            systemPromptLength: baseSystemContent.length
                        });
                        return [3 /*break*/, 32];
                    case 31:
                        // 工具不开启或模型不支持：显式禁用工具
                        requestParams.tool_choice = 'none';
                        logger_1.logger.info('已禁用工具调用', {
                            supportsTools: supportsTools,
                            enableTools: (metadata === null || metadata === void 0 ? void 0 : metadata.enableTools) === true
                        });
                        _t.label = 32;
                    case 32:
                        // 添加统一的系统消息（只添加一次，避免重复）
                        aiBridgeMessages.unshift({
                            role: 'system',
                            content: baseSystemContent
                        });
                        // 详细打印请求参数
                        console.log('\x1b[36m[消息服务] 完整请求参数:\x1b[0m', JSON.stringify(requestParams, null, 2));
                        customConfig = {
                            endpointUrl: modelConfig.endpointUrl,
                            apiKey: modelConfig.apiKey
                        };
                        // 详细打印自定义配置
                        console.log('\x1b[36m[消息服务] 自定义配置:\x1b[0m', JSON.stringify({
                            endpointUrl: customConfig.endpointUrl,
                            apiKey: ((_m = customConfig.apiKey) === null || _m === void 0 ? void 0 : _m.substring(0, 15)) + '...'
                        }, null, 2));
                        logger_1.logger.info('调用真实AI模型', {
                            modelName: modelConfig.name,
                            messagesCount: aiBridgeMessages.length
                        });
                        if (!stream) return [3 /*break*/, 34];
                        // 流式输出模式
                        requestParams.stream = true;
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletionStream(requestParams, customConfig, conversationId, userId)];
                    case 33: return [2 /*return*/, _t.sent()];
                    case 34: return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion(requestParams, customConfig, userId)];
                    case 35:
                        // 非流式输出模式
                        aiResponse = _t.sent();
                        if (!((aiResponse === null || aiResponse === void 0 ? void 0 : aiResponse.choices) && aiResponse.choices.length > 0)) return [3 /*break*/, 54];
                        choice = aiResponse.choices[0];
                        message = choice.message;
                        // 🔍 [调试] 完整响应结构分析
                        console.log('🔍 [豆包API] 完整响应结构:', JSON.stringify({
                            hasChoices: !!aiResponse.choices,
                            choicesLength: (_o = aiResponse.choices) === null || _o === void 0 ? void 0 : _o.length,
                            firstChoiceKeys: ((_p = aiResponse.choices) === null || _p === void 0 ? void 0 : _p[0]) ? Object.keys(aiResponse.choices[0]) : [],
                            messageKeys: message ? Object.keys(message) : [],
                            rootKeys: Object.keys(aiResponse),
                            hasThinking: !!aiResponse.thinking,
                            hasThoughts: !!aiResponse.thoughts,
                            hasReasoning: !!aiResponse.reasoning
                        }, null, 2));
                        thinkingContent = null;
                        responseData = aiResponse;
                        messageAny = message;
                        choiceAny = choice;
                        // 🎯 豆包模型的思考内容在 reasoning_content 字段中
                        thinkingContent = messageAny.reasoning_content;
                        if (thinkingContent && typeof thinkingContent === 'string') {
                            console.log('🤔 [思考内容] 提取到AI思考过程:', thinkingContent.substring(0, 100) + '...');
                        }
                        else {
                            console.log('🤔 [思考内容] 未找到思考内容，检查的字段:', {
                                'messageAny.reasoning_content': !!messageAny.reasoning_content,
                                'messageAny.content': !!messageAny.content,
                                'messageAny.role': messageAny.role
                            });
                        }
                        if (!(message.tool_calls && message.tool_calls.length > 0)) return [3 /*break*/, 52];
                        logger_1.logger.info('检测到工具调用', { toolCallsCount: message.tool_calls.length });
                        toolResults = [];
                        _i = 0, _r = message.tool_calls;
                        _t.label = 36;
                    case 36:
                        if (!(_i < _r.length)) return [3 /*break*/, 50];
                        toolCall = _r[_i];
                        functionCall = {
                            name: toolCall["function"].name,
                            arguments: toolCall["function"].arguments
                        };
                        toolResult = void 0;
                        uiToolNames = ['render_component', 'query_data', 'create_task_list'];
                        operationToolNames = ['navigate_to_page', 'capture_screen', 'query_past_activities', 'get_activity_statistics', 'create_activity', 'fill_form', 'any_query'];
                        console.log("[\u6D88\u606F\u670D\u52A1] \u5DE5\u5177\u8C03\u7528: ".concat(functionCall.name));
                        console.log("[\u6D88\u606F\u670D\u52A1] UI\u5DE5\u5177\u5217\u8868:", uiToolNames);
                        console.log("[\u6D88\u606F\u670D\u52A1] \u64CD\u4F5C\u5DE5\u5177\u5217\u8868:", operationToolNames);
                        console.log("[\u6D88\u606F\u670D\u52A1] \u662F\u5426\u4E3AUI\u5DE5\u5177:", uiToolNames.includes(functionCall.name));
                        console.log("[\u6D88\u606F\u670D\u52A1] \u662F\u5426\u4E3A\u64CD\u4F5C\u5DE5\u5177:", operationToolNames.includes(functionCall.name));
                        if (!uiToolNames.includes(functionCall.name)) return [3 /*break*/, 38];
                        // 使用UI工具服务
                        console.log("[\u6D88\u606F\u670D\u52A1] \u4F7F\u7528UI\u5DE5\u5177\u670D\u52A1\u6267\u884C: ".concat(functionCall.name));
                        return [4 /*yield*/, tool_calling_service_1["default"].executeTool(functionCall)];
                    case 37:
                        toolResult = _t.sent();
                        return [3 /*break*/, 48];
                    case 38:
                        if (!operationToolNames.includes(functionCall.name)) return [3 /*break*/, 47];
                        // 使用页面操作工具服务
                        console.log("[\u6D88\u606F\u670D\u52A1] \u4F7F\u7528\u9875\u9762\u64CD\u4F5C\u5DE5\u5177\u670D\u52A1\u6267\u884C: ".concat(functionCall.name));
                        _t.label = 39;
                    case 39:
                        _t.trys.push([39, 45, , 46]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/tools/core/tool-loader.service')); })];
                    case 40:
                        ToolLoaderService = (_t.sent()).ToolLoaderService;
                        loader = new ToolLoaderService();
                        return [4 /*yield*/, loader.loadTools([functionCall.name])];
                    case 41:
                        toolDefs = _t.sent();
                        toolDef = toolDefs[0];
                        if (!(toolDef && typeof toolDef.implementation === 'function')) return [3 /*break*/, 43];
                        console.log("\u2705 [\u6D88\u606F\u670D\u52A1] \u901A\u8FC7\u65B0\u5DE5\u5177\u7CFB\u7EDF\u627E\u5230\u5DE5\u5177: ".concat(functionCall.name));
                        args = JSON.parse(functionCall.arguments);
                        return [4 /*yield*/, toolDef.implementation(args)];
                    case 42:
                        result = _t.sent();
                        toolResult = result;
                        return [3 /*break*/, 44];
                    case 43:
                        console.warn("\u26A0\uFE0F [\u6D88\u606F\u670D\u52A1] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5DE5\u5177: ".concat(functionCall.name));
                        toolResult = { status: 'error', error: "\u5DE5\u5177 ".concat(functionCall.name, " \u5728\u65B0\u5DE5\u5177\u7CFB\u7EDF\u4E2D\u672A\u627E\u5230\u5B9E\u73B0") };
                        _t.label = 44;
                    case 44: return [3 /*break*/, 46];
                    case 45:
                        loadError_1 = _t.sent();
                        console.error("\u274C [\u6D88\u606F\u670D\u52A1] \u65B0\u5DE5\u5177\u7CFB\u7EDF\u6267\u884C\u5931\u8D25: ".concat(functionCall.name), loadError_1);
                        errorMessage = loadError_1 instanceof Error ? loadError_1.message : '未知错误';
                        toolResult = { status: 'error', error: "\u5DE5\u5177 ".concat(functionCall.name, " \u6267\u884C\u5931\u8D25: ").concat(errorMessage) };
                        return [3 /*break*/, 46];
                    case 46: return [3 /*break*/, 48];
                    case 47:
                        // 未知工具
                        console.log("[\u6D88\u606F\u670D\u52A1] \u672A\u77E5\u5DE5\u5177: ".concat(functionCall.name));
                        toolResult = {
                            name: functionCall.name,
                            status: "error",
                            result: null,
                            error: "\u672A\u77E5\u5DE5\u5177: ".concat(functionCall.name)
                        };
                        _t.label = 48;
                    case 48:
                        toolResults.push(toolResult);
                        logger_1.logger.info('工具调用执行完成', {
                            toolName: functionCall.name,
                            status: toolResult.status || (toolResult.success ? 'success' : 'error'),
                            service: uiToolNames.includes(functionCall.name) ? 'UI工具服务' :
                                operationToolNames.includes(functionCall.name) ? '页面操作服务' : '未知服务'
                        });
                        _t.label = 49;
                    case 49:
                        _i++;
                        return [3 /*break*/, 36];
                    case 50:
                        // 将工具结果添加到消息历史中，再次调用模型生成最终回复
                        aiBridgeMessages.push({
                            role: 'assistant',
                            content: message.content || null,
                            tool_calls: message.tool_calls
                        });
                        // 添加工具结果消息
                        for (i = 0; i < message.tool_calls.length; i++) {
                            aiBridgeMessages.push({
                                role: 'tool',
                                content: JSON.stringify(toolResults[i]),
                                tool_call_id: message.tool_calls[i].id
                            });
                        }
                        finalRequestParams = __assign(__assign({}, requestParams), { messages: aiBridgeMessages });
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion(finalRequestParams, customConfig)];
                    case 51:
                        finalResponse = _t.sent();
                        if ((finalResponse === null || finalResponse === void 0 ? void 0 : finalResponse.choices) && finalResponse.choices.length > 0) {
                            finalChoice = finalResponse.choices[0];
                            finalMessage = finalChoice.message;
                            aiContent = finalMessage.content;
                            finalThinkingContent = thinkingContent;
                            finalMessageAny = finalMessage;
                            finalChoiceAny = finalChoice;
                            if (finalMessageAny.thoughts || finalMessageAny.thinking || finalChoiceAny.thoughts || finalChoiceAny.thinking) {
                                finalThinkingContent = finalMessageAny.thoughts || finalMessageAny.thinking || finalChoiceAny.thoughts || finalChoiceAny.thinking;
                                console.log('🤔 [最终思考] 提取到最终AI思考过程:', (finalThinkingContent === null || finalThinkingContent === void 0 ? void 0 : finalThinkingContent.substring(0, 100)) + '...');
                            }
                            componentResults = toolResults.filter(function (r) { return r.name === 'render_component' && r.status === 'success'; });
                            uiComponents = componentResults.map(function (r) { return r.result; });
                            aiEnhanced = {
                                toolResults: toolResults,
                                uiComponents: uiComponents,
                                // 🧠 添加思考过程到增强数据
                                thinkingProcess: finalThinkingContent ? {
                                    content: finalThinkingContent,
                                    collapsed: false
                                } : null
                            };
                            // 将增强数据合并到 metadata 中，供消息保存
                            Object.assign(dto, { metadata: __assign(__assign({}, (metadata || {})), { aiEnhanced: aiEnhanced }) });
                            logger_1.logger.info('工具调用最终回复生成成功', {
                                responseLength: aiContent.length,
                                componentsCount: uiComponents.length
                            });
                        }
                        else {
                            throw new Error('工具调用后AI模型返回空响应');
                        }
                        return [3 /*break*/, 53];
                    case 52:
                        // 普通回复
                        aiContent = message.content;
                        // 🧠 对于普通回复，也要保存思考过程
                        if (thinkingContent) {
                            aiEnhanced = {
                                thinkingProcess: {
                                    content: thinkingContent,
                                    collapsed: false
                                }
                            };
                            // 将思考过程合并到 metadata 中
                            Object.assign(dto, { metadata: __assign(__assign({}, (metadata || {})), { aiEnhanced: aiEnhanced }) });
                            console.log('🧠 [普通回复] 已保存思考过程到metadata');
                        }
                        logger_1.logger.info('真实AI回复生成成功', {
                            responseLength: (aiContent === null || aiContent === void 0 ? void 0 : aiContent.length) || 0,
                            tokensUsed: (_q = aiResponse.usage) === null || _q === void 0 ? void 0 : _q.total_tokens,
                            hasThinking: !!thinkingContent
                        });
                        _t.label = 53;
                    case 53: return [3 /*break*/, 55];
                    case 54: throw new Error('AI模型返回空响应');
                    case 55: return [3 /*break*/, 57];
                    case 56: throw new Error('没有有效的AI模型配置');
                    case 57: return [3 /*break*/, 59];
                    case 58:
                        modelError_1 = _t.sent();
                        logger_1.logger.error('真实AI调用失败', modelError_1);
                        // 直接抛出AI桥接服务的错误，它已经包含了具体的错误信息
                        throw modelError_1;
                    case 59: return [3 /*break*/, 61];
                    case 60:
                        error_3 = _t.sent();
                        logger_1.logger.error('AI服务调用失败', error_3);
                        // 直接抛出内层的错误信息，不要再包装一层
                        throw error_3;
                    case 61: return [4 /*yield*/, ai_message_model_1.AIMessage.create({
                            conversationId: conversationId,
                            userId: userId,
                            role: 'assistant',
                            content: aiContent,
                            isDeleted: false,
                            messageType: ai_message_model_1.MessageType.TEXT,
                            status: ai_message_model_1.MessageStatus.DELIVERED,
                            tokens: 0,
                            metadata: (metadata || {})
                        })];
                    case 62:
                        aiMessage = _t.sent();
                        // 异步记录AI回复日志（不影响主流程）
                        (function () { return __awaiter(_this, void 0, void 0, function () {
                            var e_4;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, operation_log_model_1.OperationLog.create({
                                                userId: userId,
                                                module: 'ai-conversation',
                                                action: 'ai:assistant_reply',
                                                operationType: operation_log_model_1.OperationType.CREATE,
                                                resourceType: 'message',
                                                resourceId: String(aiMessage.id),
                                                description: null,
                                                requestMethod: null,
                                                requestUrl: null,
                                                requestParams: null,
                                                requestIp: null,
                                                userAgent: null,
                                                deviceInfo: null,
                                                operationResult: operation_log_model_1.OperationResult.SUCCESS,
                                                resultMessage: null,
                                                executionTime: null
                                            })];
                                    case 1:
                                        _a.sent();
                                        return [3 /*break*/, 3];
                                    case 2:
                                        e_4 = _a.sent();
                                        logger_1.logger.warn('记录AI回复操作日志失败', { error: e_4.message });
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); })();
                        // 8. 记忆管理已由六维记忆系统处理
                        // 六维记忆系统在统一智能协调器中自动处理记忆存储和检索
                        logger_1.logger.info('记忆管理由六维记忆系统处理', { userId: userId, conversationId: conversationId });
                        if (!(relevantMemories && relevantMemories.length > 0)) return [3 /*break*/, 64];
                        currentUsedMemoryIds = conversation.usedMemoryIds || [];
                        newMemoryIds = relevantMemories.map(function (m) { return m.id; });
                        updatedUsedMemoryIds = __spreadArray(__spreadArray([], currentUsedMemoryIds, true), newMemoryIds, true).slice(-30);
                        return [4 /*yield*/, conversation.update({
                                usedMemoryIds: updatedUsedMemoryIds
                            })];
                    case 63:
                        _t.sent();
                        logger_1.logger.info('已更新使用的记忆ID列表', {
                            newMemoryIds: newMemoryIds,
                            totalUsedMemories: updatedUsedMemoryIds.length
                        });
                        _t.label = 64;
                    case 64:
                        // 10. 更新会话的最后消息时间和消息总数
                        conversation.lastMessageAt = new Date();
                        return [4 /*yield*/, conversation.increment('messageCount', { by: 2 })];
                    case 65:
                        _t.sent(); // 用户消息 + AI回复
                        tokenOptimizationInfo = {
                            pageContextCached: conversation.lastPagePath === dto.pagePath && conversation.pageContext,
                            memoriesFiltered: (conversation.usedMemoryIds || []).length > 0,
                            estimatedTokensSaved: 0
                        };
                        if (tokenOptimizationInfo.pageContextCached) {
                            tokenOptimizationInfo.estimatedTokensSaved += 250; // 页面上下文缓存节省
                        }
                        if (tokenOptimizationInfo.memoriesFiltered) {
                            tokenOptimizationInfo.estimatedTokensSaved += 100; // 记忆去重节省
                        }
                        logger_1.logger.info('AI消息处理完成', {
                            userMessageId: userMessage.id,
                            aiMessageId: aiMessage.id,
                            usedFallback: usedLocalFallback,
                            relevantMemoriesCount: (relevantMemories === null || relevantMemories === void 0 ? void 0 : relevantMemories.length) || 0,
                            tokenOptimization: tokenOptimizationInfo
                        });
                        return [2 /*return*/, aiMessage];
                }
            });
        });
    };
    /**
     * @description 获取会话的消息列表
     * @param conversationId 会话ID
     * @param userId 用户ID
     * @param page 页码
     * @param pageSize 每页大小
     * @returns 分页的消息列表
     */
    MessageService.prototype.getMessages = function (conversationId, userId, page, pageSize) {
        if (page === void 0) { page = 1; }
        if (pageSize === void 0) { pageSize = 20; }
        return __awaiter(this, void 0, void 0, function () {
            var conversation, offset, _a, count, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({ where: { id: conversationId, userId: userId } })];
                    case 1:
                        conversation = _b.sent();
                        if (!conversation) {
                            throw apiError_1.ApiError.notFound('会话不存在或无权访问');
                        }
                        offset = (page - 1) * pageSize;
                        return [4 /*yield*/, ai_message_model_1.AIMessage.findAndCountAll({
                                where: { conversationId: conversationId, userId: userId },
                                order: [['createdAt', 'ASC']],
                                limit: pageSize,
                                offset: offset
                            })];
                    case 2:
                        _a = _b.sent(), count = _a.count, rows = _a.rows;
                        return [2 /*return*/, {
                                messages: rows,
                                pagination: {
                                    page: page,
                                    pageSize: pageSize,
                                    totalItems: count,
                                    totalPages: Math.ceil(count / pageSize)
                                }
                            }];
                }
            });
        });
    };
    /**
     * @description 获取单个消息
     * @param userId 用户ID
     * @param messageId 消息ID
     * @returns 消息实体
     */
    MessageService.prototype.getMessage = function (userId, messageId) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_message_model_1.AIMessage.findOne({
                            where: { id: messageId, userId: userId }
                        })];
                    case 1:
                        message = _a.sent();
                        if (!message) {
                            throw apiError_1.ApiError.notFound('消息不存在或无权访问');
                        }
                        return [2 /*return*/, message];
                }
            });
        });
    };
    /**
     * @description 更新消息状态
     * @param userId 用户ID
     * @param messageId 消息ID
     * @param status 新状态
     * @returns 更新后的消息
     */
    MessageService.prototype.updateMessageStatus = function (userId, messageId, status) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_message_model_1.AIMessage.findOne({
                            where: { id: messageId, userId: userId }
                        })];
                    case 1:
                        message = _a.sent();
                        if (!message) {
                            throw apiError_1.ApiError.notFound('消息不存在或无权访问');
                        }
                        // 注意：当前AIMessage模型没有status字段，这里只是验证消息存在
                        // 如果需要状态功能，需要在模型中添加status字段
                        return [2 /*return*/, message];
                }
            });
        });
    };
    /**
     * @description 删除指定ID的消息
     * @param messageId 消息ID
     * @param userId 用户ID，用于权限验证
     * @throws ApiError 如消息不存在或用户无权删除
     */
    MessageService.prototype.deleteMessage = function (messageId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_message_model_1.AIMessage.findOne({
                            where: { id: Number(messageId), userId: userId }
                        })];
                    case 1:
                        message = _a.sent();
                        if (!message) {
                            throw apiError_1.ApiError.notFound('消息不存在或无权删除');
                        }
                        // 2. 删除消息（也可选择更新会话计数）
                        return [4 /*yield*/, message.destroy()];
                    case 2:
                        // 2. 删除消息（也可选择更新会话计数）
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新消息的元数据（合并更新）
     */
    MessageService.prototype.updateMessageMetadata = function (conversationId, userId, messageId, metadataPatch) {
        return __awaiter(this, void 0, void 0, function () {
            var conversation, message, current, mergedAiEnhanced, patchAi, merged;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_conversation_model_1.AIConversation.findOne({ where: { id: conversationId, userId: userId } })];
                    case 1:
                        conversation = _a.sent();
                        if (!conversation) {
                            throw apiError_1.ApiError.notFound('会话不存在或无权访问');
                        }
                        return [4 /*yield*/, ai_message_model_1.AIMessage.findOne({ where: { id: Number(messageId), conversationId: conversationId, userId: userId } })];
                    case 2:
                        message = _a.sent();
                        if (!message) {
                            throw apiError_1.ApiError.notFound('消息不存在');
                        }
                        current = message.metadata || {};
                        mergedAiEnhanced = current.aiEnhanced || {};
                        if (metadataPatch && typeof metadataPatch === 'object' && metadataPatch.aiEnhanced) {
                            patchAi = metadataPatch.aiEnhanced || {};
                            mergedAiEnhanced = __assign(__assign(__assign({}, mergedAiEnhanced), patchAi), { thinkingProcess: __assign(__assign({}, (mergedAiEnhanced.thinkingProcess || {})), (patchAi.thinkingProcess || {})) });
                        }
                        merged = __assign(__assign(__assign({}, current), metadataPatch), { aiEnhanced: mergedAiEnhanced });
                        message.metadata = merged;
                        return [4 /*yield*/, message.save()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, message];
                }
            });
        });
    };
    return MessageService;
}());
exports.MessageService = MessageService;
// 导出服务实例
exports["default"] = new MessageService();
