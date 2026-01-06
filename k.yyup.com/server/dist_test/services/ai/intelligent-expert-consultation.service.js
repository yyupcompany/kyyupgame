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
exports.__esModule = true;
exports.IntelligentExpertConsultationService = void 0;
var ai_bridge_service_1 = require("./bridge/ai-bridge.service");
var uuid_1 = require("uuid");
var ai_model_cache_service_1 = require("../ai-model-cache.service");
var IntelligentExpertConsultationService = /** @class */ (function () {
    function IntelligentExpertConsultationService() {
        this.activeSessions = new Map();
        // 思考过程监听器
        this.thinkingListeners = new Map();
        this.expertStatusListeners = new Map();
        this.completionListeners = new Map();
        // 使用导出的实例
    }
    // 监听器管理方法
    IntelligentExpertConsultationService.prototype.addThinkingListener = function (sessionId, listener) {
        if (!this.thinkingListeners.has(sessionId)) {
            this.thinkingListeners.set(sessionId, []);
        }
        this.thinkingListeners.get(sessionId).push(listener);
    };
    IntelligentExpertConsultationService.prototype.removeThinkingListener = function (sessionId, listener) {
        var listeners = this.thinkingListeners.get(sessionId);
        if (listeners) {
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    };
    IntelligentExpertConsultationService.prototype.addExpertStatusListener = function (sessionId, listener) {
        if (!this.expertStatusListeners.has(sessionId)) {
            this.expertStatusListeners.set(sessionId, []);
        }
        this.expertStatusListeners.get(sessionId).push(listener);
    };
    IntelligentExpertConsultationService.prototype.removeExpertStatusListener = function (sessionId, listener) {
        var listeners = this.expertStatusListeners.get(sessionId);
        if (listeners) {
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    };
    IntelligentExpertConsultationService.prototype.addCompletionListener = function (sessionId, listener) {
        if (!this.completionListeners.has(sessionId)) {
            this.completionListeners.set(sessionId, []);
        }
        this.completionListeners.get(sessionId).push(listener);
    };
    IntelligentExpertConsultationService.prototype.removeCompletionListener = function (sessionId, listener) {
        var listeners = this.completionListeners.get(sessionId);
        if (listeners) {
            var index = listeners.indexOf(listener);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    };
    // 事件推送方法
    IntelligentExpertConsultationService.prototype.emitThinking = function (sessionId, data) {
        var listeners = this.thinkingListeners.get(sessionId);
        if (listeners) {
            listeners.forEach(function (listener) { return listener(data); });
        }
    };
    IntelligentExpertConsultationService.prototype.emitExpertStatus = function (sessionId, data) {
        var listeners = this.expertStatusListeners.get(sessionId);
        if (listeners) {
            listeners.forEach(function (listener) { return listener(data); });
        }
    };
    IntelligentExpertConsultationService.prototype.emitCompletion = function (sessionId, data) {
        var listeners = this.completionListeners.get(sessionId);
        if (listeners) {
            listeners.forEach(function (listener) { return listener(data); });
        }
    };
    // 根据function名称获取专家名称
    IntelligentExpertConsultationService.prototype.getExpertNameByFunction = function (functionName) {
        var expertMap = {
            'consult_recruitment_planner': '招生策划专家',
            'consult_psychologist': '心理学专家',
            'consult_investor': '投资分析专家',
            'consult_director': '园长管理专家',
            'consult_teacher': '执行教师专家',
            'consult_parent_representative': '家长代表专家'
        };
        return expertMap[functionName] || '专家';
    };
    /**
     * 定义专家function calls
     */
    IntelligentExpertConsultationService.prototype.getExpertFunctionCalls = function () {
        return [
            {
                name: 'consult_recruitment_planner',
                description: '咨询招生策划专家',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '咨询问题'
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'consult_psychologist',
                description: '咨询心理学专家',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '咨询问题'
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'consult_investor',
                description: '咨询投资分析专家',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '咨询问题'
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'consult_director',
                description: '咨询园长管理专家',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '咨询问题'
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'consult_teacher',
                description: '咨询执行教师专家',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '咨询问题'
                        }
                    },
                    required: ['query']
                }
            },
            {
                name: 'consult_parent_representative',
                description: '咨询家长代表专家',
                parameters: {
                    type: 'object',
                    properties: {
                        query: {
                            type: 'string',
                            description: '咨询问题'
                        }
                    },
                    required: ['query']
                }
            }
        ];
    };
    /**
     * 开始智能专家咨询
     */
    IntelligentExpertConsultationService.prototype.startIntelligentConsultation = function (userId, query, maxRounds) {
        if (maxRounds === void 0) { maxRounds = Number(process.env.AI_MAX_ITERATIONS || 12); }
        return __awaiter(this, void 0, void 0, function () {
            var sessionId, session, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        sessionId = (0, uuid_1.v4)();
                        session = {
                            sessionId: sessionId,
                            userId: userId,
                            originalQuery: query,
                            conversationRounds: [],
                            status: 'active',
                            maxRounds: maxRounds,
                            currentRound: 1,
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        this.activeSessions.set(sessionId, session);
                        return [4 /*yield*/, this.processRound(sessionId, query, userId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                sessionId: sessionId,
                                initialResponse: result.aiResponse,
                                expertsCalled: result.expertsCalled,
                                status: session.status
                            }];
                    case 2:
                        error_1 = _a.sent();
                        console.error('开始智能专家咨询失败:', error_1);
                        throw new Error('开始智能专家咨询失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 继续对话
     */
    IntelligentExpertConsultationService.prototype.continueConsultation = function (sessionId, userInput) {
        return __awaiter(this, void 0, void 0, function () {
            var session, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        session = this.activeSessions.get(sessionId);
                        if (!session) {
                            throw new Error('会话不存在');
                        }
                        if (session.status !== 'active') {
                            throw new Error('会话已结束');
                        }
                        if (session.currentRound >= session.maxRounds) {
                            session.status = 'completed';
                            return [2 /*return*/, {
                                    response: '已达到最大对话轮数，咨询结束。',
                                    expertsCalled: [],
                                    status: session.status,
                                    roundNumber: session.currentRound,
                                    isCompleted: true
                                }];
                        }
                        session.currentRound++;
                        return [4 /*yield*/, this.processRound(sessionId, userInput, session.userId)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, {
                                response: result.aiResponse,
                                expertsCalled: result.expertsCalled,
                                status: session.status,
                                roundNumber: session.currentRound,
                                isCompleted: session.status !== 'active'
                            }];
                    case 2:
                        error_2 = _a.sent();
                        console.error('继续对话失败:', error_2);
                        throw new Error('继续对话失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 处理一轮对话
     */
    IntelligentExpertConsultationService.prototype.processRound = function (sessionId, userQuery, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var session, conversationHistory, systemPrompt, aiResponse, round;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.activeSessions.get(sessionId);
                        if (!session) {
                            throw new Error('会话不存在');
                        }
                        // 推送思考开始状态
                        this.emitThinking(sessionId, {
                            step: 'analyzing_query',
                            message: '🤔 正在分析您的问题...',
                            progress: 10
                        });
                        conversationHistory = this.buildConversationHistory(session);
                        // 推送构建历史完成
                        this.emitThinking(sessionId, {
                            step: 'building_context',
                            message: '📚 正在构建对话上下文...',
                            progress: 30
                        });
                        systemPrompt = this.buildSystemPrompt();
                        // 推送专家选择阶段
                        this.emitThinking(sessionId, {
                            step: 'selecting_experts',
                            message: '🎯 正在智能选择合适的专家...',
                            progress: 50
                        });
                        return [4 /*yield*/, this.callAIWithFunctionCalls(sessionId, systemPrompt, conversationHistory, userQuery, userId)];
                    case 1:
                        aiResponse = _a.sent();
                        round = {
                            roundNumber: session.currentRound,
                            userQuery: userQuery,
                            aiResponse: aiResponse.response,
                            expertsCalled: aiResponse.expertsCalled,
                            expertResponses: aiResponse.expertResponses,
                            timestamp: new Date()
                        };
                        session.conversationRounds.push(round);
                        session.updatedAt = new Date();
                        // 检查是否应该结束对话
                        if (aiResponse.shouldComplete) {
                            session.status = 'completed';
                        }
                        return [2 /*return*/, {
                                aiResponse: aiResponse.response,
                                expertsCalled: aiResponse.expertsCalled
                            }];
                }
            });
        });
    };
    /**
     * 构建对话历史
     */
    IntelligentExpertConsultationService.prototype.buildConversationHistory = function (session) {
        if (session.conversationRounds.length === 0) {
            return "\u7528\u6237\u7684\u539F\u59CB\u95EE\u9898\uFF1A".concat(session.originalQuery);
        }
        var history = "\u7528\u6237\u7684\u539F\u59CB\u95EE\u9898\uFF1A".concat(session.originalQuery, "\n\n");
        session.conversationRounds.forEach(function (round, index) {
            history += "\u7B2C".concat(round.roundNumber, "\u8F6E\u5BF9\u8BDD\uFF1A\n");
            history += "\u7528\u6237\uFF1A".concat(round.userQuery, "\n");
            if (round.expertResponses.length > 0) {
                history += "\u4E13\u5BB6\u54A8\u8BE2\u7ED3\u679C\uFF1A\n";
                round.expertResponses.forEach(function (expert) {
                    history += "- ".concat(expert.expertName, "\uFF1A").concat(expert.response, "\n");
                });
            }
            history += "AI\u56DE\u590D\uFF1A".concat(round.aiResponse, "\n\n");
        });
        return history;
    };
    /**
     * 构建系统提示词
     */
    IntelligentExpertConsultationService.prototype.buildSystemPrompt = function () {
        return "\u4F60\u662F\u5E7C\u513F\u56ED\u62DB\u751F\u54A8\u8BE2\u52A9\u624B\uFF0C\u4E13\u95E8\u4E3A\u7528\u6237\u63D0\u4F9B\u4E13\u4E1A\u7684\u62DB\u751F\u54A8\u8BE2\u670D\u52A1\u3002\u4F60\u62E5\u6709\u4E00\u4E2A\u4E13\u4E1A\u7684\u4E13\u5BB6\u56E2\u961F\uFF0C\u53EF\u4EE5\u6839\u636E\u7528\u6237\u7684\u95EE\u9898\u8C03\u7528\u76F8\u5E94\u7684\u4E13\u5BB6\u8FDB\u884C\u54A8\u8BE2\u3002\n\n## \u53EF\u7528\u4E13\u5BB6\u56E2\u961F\uFF1A\n1. **\u62DB\u751F\u7B56\u5212\u4E13\u5BB6** (consult_recruitment_planner) - \u6D3B\u52A8\u7B56\u5212\u3001\u8425\u9500\u63A8\u5E7F\u3001\u54C1\u724C\u5EFA\u8BBE\n2. **\u5FC3\u7406\u5B66\u4E13\u5BB6** (consult_psychologist) - \u513F\u7AE5\u5FC3\u7406\u3001\u5BB6\u957F\u6C9F\u901A\u3001\u884C\u4E3A\u5206\u6790\n3. **\u6295\u8D44\u5206\u6790\u4E13\u5BB6** (consult_investor) - \u9884\u7B97\u89C4\u5212\u3001\u6210\u672C\u63A7\u5236\u3001\u6295\u8D44\u56DE\u62A5\u5206\u6790\n4. **\u56ED\u957F\u7BA1\u7406\u4E13\u5BB6** (consult_director) - \u7EC4\u7EC7\u7BA1\u7406\u3001\u8D44\u6E90\u534F\u8C03\u3001\u51B3\u7B56\u652F\u6301\n5. **\u6267\u884C\u6559\u5E08\u4E13\u5BB6** (consult_teacher) - \u6D3B\u52A8\u6267\u884C\u3001\u6559\u5B66\u5B9E\u65BD\u3001\u5B89\u5168\u7BA1\u7406\n6. **\u5BB6\u957F\u4EE3\u8868\u4E13\u5BB6** (consult_parent_representative) - \u7528\u6237\u4F53\u9A8C\u3001\u9700\u6C42\u5206\u6790\u3001\u6EE1\u610F\u5EA6\u63D0\u5347\n\n## \u5DE5\u4F5C\u6D41\u7A0B\uFF1A\n1. **\u5206\u6790\u7528\u6237\u95EE\u9898**\uFF1A\u4ED4\u7EC6\u7406\u89E3\u7528\u6237\u7684\u5177\u4F53\u9700\u6C42\u548C\u95EE\u9898\u80CC\u666F\n2. **\u9009\u62E9\u5408\u9002\u4E13\u5BB6**\uFF1A\u6839\u636E\u95EE\u9898\u7C7B\u578B\uFF0C\u9009\u62E91-3\u4E2A\u6700\u76F8\u5173\u7684\u4E13\u5BB6\u8FDB\u884C\u54A8\u8BE2\n3. **\u8C03\u7528\u4E13\u5BB6\u51FD\u6570**\uFF1A\u4F7F\u7528\u76F8\u5E94\u7684function call\u83B7\u53D6\u4E13\u5BB6\u5EFA\u8BAE\n4. **\u6574\u5408\u4E13\u4E1A\u5EFA\u8BAE**\uFF1A\u5C06\u4E13\u5BB6\u7684\u5EFA\u8BAE\u6574\u5408\u6210\u5B8C\u6574\u3001\u5B9E\u7528\u7684\u89E3\u51B3\u65B9\u6848\n\n## \u91CD\u8981\u89C4\u5219\uFF1A\n- **\u5FC5\u987B\u8C03\u7528\u4E13\u5BB6\u51FD\u6570**\uFF1A\u5BF9\u4E8E\u4EFB\u4F55\u5177\u4F53\u7684\u54A8\u8BE2\u95EE\u9898\uFF0C\u90FD\u5E94\u8BE5\u8C03\u7528\u76F8\u5173\u7684\u4E13\u5BB6\u51FD\u6570\u83B7\u53D6\u4E13\u4E1A\u5EFA\u8BAE\n- **\u9009\u62E9\u5408\u9002\u4E13\u5BB6**\uFF1A\u6839\u636E\u95EE\u9898\u7684\u6838\u5FC3\u5185\u5BB9\u9009\u62E9\u6700\u76F8\u5173\u7684\u4E13\u5BB6\uFF0C\u901A\u5E38\u9009\u62E91-3\u4E2A\u4E13\u5BB6\n- **\u63D0\u4F9B\u5B8C\u6574\u65B9\u6848**\uFF1A\u6574\u5408\u4E13\u5BB6\u5EFA\u8BAE\uFF0C\u7ED9\u51FA\u5177\u4F53\u53EF\u884C\u7684\u89E3\u51B3\u65B9\u6848\n\n\u73B0\u5728\u8BF7\u5206\u6790\u7528\u6237\u7684\u95EE\u9898\uFF0C\u9009\u62E9\u5408\u9002\u7684\u4E13\u5BB6\u8FDB\u884C\u54A8\u8BE2\u3002";
    };
    /**
     * 调用AI进行智能分析和专家选择
     */
    IntelligentExpertConsultationService.prototype.callAIWithFunctionCalls = function (sessionId, systemPrompt, conversationHistory, userQuery, userId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var modelCacheService, doubaoModel, messages, aiBridgeMessages, response, expertsCalled, expertResponses, choice, message, i, toolCall, expertName, expertResponse, aiContent, shouldComplete, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 9, , 10]);
                        modelCacheService = ai_model_cache_service_1.AIModelCacheService.getInstance();
                        return [4 /*yield*/, modelCacheService.getModelByName('doubao-seed-1-6-flash-250715')];
                    case 1:
                        doubaoModel = _c.sent();
                        if (!doubaoModel) {
                            throw new Error('豆包1.6 Flash模型配置未找到，请检查AI模型配置');
                        }
                        messages = [
                            {
                                role: 'system',
                                content: systemPrompt
                            },
                            {
                                role: 'user',
                                content: "".concat(conversationHistory, "\n\n\u5F53\u524D\u7528\u6237\u95EE\u9898\uFF1A").concat(userQuery)
                            }
                        ];
                        console.log('🤖 开始调用AI模型进行专家选择...');
                        console.log('📝 用户问题:', userQuery);
                        // 推送AI思考状态
                        this.emitThinking(sessionId, {
                            step: 'ai_thinking',
                            message: '🧠 AI正在深度思考和分析...',
                            progress: 70
                        });
                        aiBridgeMessages = messages.map(function (msg) { return ({
                            role: msg.role,
                            content: msg.content
                        }); });
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: doubaoModel.name,
                                messages: aiBridgeMessages,
                                tools: this.getExpertFunctionCalls().map(function (func) { return ({
                                    type: 'function',
                                    "function": func
                                }); }),
                                tool_choice: 'auto',
                                temperature: 0.1,
                                max_tokens: ((_a = doubaoModel.modelParameters) === null || _a === void 0 ? void 0 : _a.maxTokens) || 2000,
                                top_p: ((_b = doubaoModel.modelParameters) === null || _b === void 0 ? void 0 : _b.topP) || 0.9,
                                frequency_penalty: 0,
                                presence_penalty: 0
                            }, {
                                endpointUrl: doubaoModel.endpointUrl,
                                apiKey: doubaoModel.apiKey
                            }, userId)];
                    case 2:
                        response = _c.sent();
                        console.log('✅ AI模型调用成功');
                        expertsCalled = [];
                        expertResponses = [];
                        choice = response.choices[0];
                        message = choice === null || choice === void 0 ? void 0 : choice.message;
                        if (!((message === null || message === void 0 ? void 0 : message.tool_calls) && message.tool_calls.length > 0)) return [3 /*break*/, 7];
                        console.log("\uD83C\uDFAF AI\u9009\u62E9\u4E86 ".concat(message.tool_calls.length, " \u4E2A\u4E13\u5BB6"));
                        // 推送专家选择完成
                        this.emitThinking(sessionId, {
                            step: 'experts_selected',
                            message: "\uD83C\uDFAF \u5DF2\u9009\u62E9 ".concat(message.tool_calls.length, " \u4F4D\u4E13\u5BB6\u8FDB\u884C\u54A8\u8BE2"),
                            progress: 80
                        });
                        i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(i < message.tool_calls.length)) return [3 /*break*/, 6];
                        toolCall = message.tool_calls[i];
                        if (!(toolCall.type === 'function')) return [3 /*break*/, 5];
                        expertName = this.getExpertNameByFunction(toolCall["function"].name);
                        console.log("\uD83D\uDC68\u200D\uD83D\uDCBC \u6B63\u5728\u54A8\u8BE2\u4E13\u5BB6: ".concat(toolCall["function"].name));
                        // 推送专家开始咨询状态
                        this.emitExpertStatus(sessionId, {
                            expertName: expertName,
                            status: 'thinking',
                            message: "".concat(expertName, " \u6B63\u5728\u6DF1\u5EA6\u5206\u6790\u60A8\u7684\u95EE\u9898..."),
                            progress: Math.round(80 + (i / message.tool_calls.length) * 15)
                        });
                        return [4 /*yield*/, this.executeExpertFunction(sessionId, toolCall["function"].name, JSON.parse(toolCall["function"].arguments))];
                    case 4:
                        expertResponse = _c.sent();
                        expertsCalled.push(toolCall["function"].name);
                        expertResponses.push(expertResponse);
                        // 推送专家完成状态
                        this.emitExpertStatus(sessionId, {
                            expertName: expertName,
                            status: 'completed',
                            message: "".concat(expertResponse.expertName, " \u5206\u6790\u5B8C\u6210"),
                            progress: Math.round(80 + ((i + 1) / message.tool_calls.length) * 15)
                        });
                        console.log("\u2705 ".concat(expertResponse.expertName, " \u54A8\u8BE2\u5B8C\u6210"));
                        _c.label = 5;
                    case 5:
                        i++;
                        return [3 /*break*/, 3];
                    case 6: return [3 /*break*/, 8];
                    case 7:
                        console.log('⚠️ AI没有选择任何专家，可能是问题不需要专家咨询');
                        _c.label = 8;
                    case 8:
                        aiContent = (message === null || message === void 0 ? void 0 : message.content) || '';
                        shouldComplete = this.shouldCompleteConsultation(aiContent);
                        console.log('🎉 专家咨询轮次完成');
                        // 推送咨询完成状态
                        this.emitThinking(sessionId, {
                            step: 'consultation_completed',
                            message: '✅ 专家咨询完成，正在整理建议...',
                            progress: 100
                        });
                        // 如果咨询应该结束，推送完成事件
                        if (shouldComplete) {
                            this.emitCompletion(sessionId, {
                                message: '🎉 专家咨询已完成',
                                expertsCalled: expertsCalled,
                                totalExperts: expertsCalled.length
                            });
                        }
                        return [2 /*return*/, {
                                response: aiContent,
                                expertsCalled: expertsCalled,
                                expertResponses: expertResponses,
                                shouldComplete: shouldComplete
                            }];
                    case 9:
                        error_3 = _c.sent();
                        console.error('❌ AI调用失败:', error_3);
                        // 提供更详细的错误信息
                        if (error_3.response) {
                            console.error('API响应错误:', error_3.response.status, error_3.response.data);
                            throw new Error("AI\u6A21\u578B\u8C03\u7528\u5931\u8D25: ".concat(error_3.response.status, " - ").concat(JSON.stringify(error_3.response.data)));
                        }
                        else if (error_3.request) {
                            console.error('网络请求失败:', error_3.message);
                            throw new Error('AI模型网络连接失败，请稍后重试');
                        }
                        else {
                            console.error('未知错误:', error_3.message);
                            throw new Error("AI\u6A21\u578B\u8C03\u7528\u5F02\u5E38: ".concat(error_3.message));
                        }
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行专家function call
     */
    IntelligentExpertConsultationService.prototype.executeExpertFunction = function (sessionId, functionName, args) {
        return __awaiter(this, void 0, void 0, function () {
            var query, expertMapping, expert, response, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = args.query;
                        expertMapping = {
                            'consult_recruitment_planner': { type: 'planner', name: '招生策划专家' },
                            'consult_psychologist': { type: 'psychologist', name: '心理学专家' },
                            'consult_investor': { type: 'investor', name: '投资分析专家' },
                            'consult_director': { type: 'director', name: '园长管理专家' },
                            'consult_teacher': { type: 'teacher', name: '执行教师专家' },
                            'consult_parent_representative': { type: 'parent', name: '家长代表专家' }
                        };
                        expert = expertMapping[functionName];
                        if (!expert) {
                            throw new Error("\u672A\u77E5\u7684\u4E13\u5BB6\u7C7B\u578B: ".concat(functionName));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.consultSpecificExpert(expert.type, expert.name, query)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, {
                                expertType: expert.type,
                                expertName: expert.name,
                                response: response
                            }];
                    case 3:
                        error_4 = _a.sent();
                        console.error("\u6267\u884C\u4E13\u5BB6function call\u5931\u8D25 (".concat(expert.name, "):"), error_4);
                        // 返回明确的错误信息而不是降级回复
                        return [2 /*return*/, {
                                expertType: expert.type,
                                expertName: expert.name,
                                response: "\u3010\u7CFB\u7EDF\u63D0\u793A\u3011".concat(expert.name, "\u6682\u65F6\u4E0D\u53EF\u7528\uFF1A").concat(error_4.message, "\u3002\u8BF7\u7A0D\u540E\u91CD\u8BD5\u6216\u8054\u7CFB\u6280\u672F\u652F\u6301\u3002")
                            }];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 咨询具体专家
     */
    IntelligentExpertConsultationService.prototype.consultSpecificExpert = function (expertType, expertName, query) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var modelCacheService, doubaoModel, expertSystemPrompt, messages, maxRetries, lastError, _loop_1, attempt, state_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        modelCacheService = ai_model_cache_service_1.AIModelCacheService.getInstance();
                        return [4 /*yield*/, modelCacheService.getModelByName('doubao-seed-1-6-flash-250715')];
                    case 1:
                        doubaoModel = _c.sent();
                        if (!doubaoModel) {
                            console.error("\u274C ".concat(expertName, ": Flash\u6A21\u578B\u914D\u7F6E\u672A\u627E\u5230"));
                            throw new Error("".concat(expertName, "\u6682\u65F6\u4E0D\u53EF\u7528\uFF0CAI\u6A21\u578B\u914D\u7F6E\u672A\u627E\u5230"));
                        }
                        expertSystemPrompt = this.getExpertSystemPrompt(expertType);
                        messages = [
                            {
                                role: 'system',
                                content: expertSystemPrompt
                            },
                            {
                                role: 'user',
                                content: query
                            }
                        ];
                        maxRetries = 3;
                        _loop_1 = function (attempt) {
                            var aiBridgeMessages, response, expertResponse, error_5, waitTime_1;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _d.trys.push([0, 2, , 5]);
                                        console.log("\uD83E\uDD16 ".concat(expertName, " \u5F00\u59CB\u5206\u6790\u95EE\u9898... (\u5C1D\u8BD5 ").concat(attempt, "/").concat(maxRetries, ")"));
                                        aiBridgeMessages = messages.map(function (msg) { return ({
                                            role: msg.role,
                                            content: msg.content
                                        }); });
                                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                                model: doubaoModel.name,
                                                messages: aiBridgeMessages,
                                                temperature: 0.1,
                                                max_tokens: 1500,
                                                top_p: 0.9,
                                                frequency_penalty: 0,
                                                presence_penalty: 0,
                                                stream: false
                                            }, {
                                                endpointUrl: doubaoModel.endpointUrl,
                                                apiKey: doubaoModel.apiKey
                                            })];
                                    case 1:
                                        response = _d.sent();
                                        expertResponse = (_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content;
                                        if (!expertResponse || expertResponse.trim().length === 0) {
                                            console.error("\u274C ".concat(expertName, ": \u8FD4\u56DE\u7A7A\u54CD\u5E94 (\u5C1D\u8BD5 ").concat(attempt, ")"));
                                            throw new Error("".concat(expertName, "\u8FD4\u56DE\u7A7A\u54CD\u5E94"));
                                        }
                                        console.log("\u2705 ".concat(expertName, " \u5206\u6790\u5B8C\u6210\uFF0C\u56DE\u590D\u957F\u5EA6: ").concat(expertResponse.length, " \u5B57\u7B26"));
                                        return [2 /*return*/, { value: expertResponse }];
                                    case 2:
                                        error_5 = _d.sent();
                                        lastError = error_5;
                                        console.error("\u274C \u54A8\u8BE2".concat(expertName, "\u5931\u8D25 (\u5C1D\u8BD5 ").concat(attempt, "/").concat(maxRetries, "):"), error_5.code || error_5.message);
                                        if (!(attempt < maxRetries)) return [3 /*break*/, 4];
                                        waitTime_1 = attempt * 2000;
                                        console.log("\u23F3 \u7B49\u5F85 ".concat(waitTime_1, "ms \u540E\u91CD\u8BD5..."));
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, waitTime_1); })];
                                    case 3:
                                        _d.sent();
                                        _d.label = 4;
                                    case 4: return [3 /*break*/, 5];
                                    case 5: return [2 /*return*/];
                                }
                            });
                        };
                        attempt = 1;
                        _c.label = 2;
                    case 2:
                        if (!(attempt <= maxRetries)) return [3 /*break*/, 5];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 3:
                        state_1 = _c.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _c.label = 4;
                    case 4:
                        attempt++;
                        return [3 /*break*/, 2];
                    case 5:
                        // 所有重试都失败了，抛出最后的错误
                        console.error("\u274C ".concat(expertName, " \u6240\u6709\u91CD\u8BD5\u90FD\u5931\u8D25\u4E86"));
                        // 根据错误类型提供不同的错误信息
                        if (lastError.response) {
                            console.error("".concat(expertName, " API\u9519\u8BEF:"), lastError.response.status, lastError.response.data);
                            throw new Error("".concat(expertName, "\u6682\u65F6\u4E0D\u53EF\u7528\uFF0CAPI\u8C03\u7528\u5931\u8D25: ").concat(lastError.response.status));
                        }
                        else if (lastError.request) {
                            console.error("".concat(expertName, " \u7F51\u7EDC\u9519\u8BEF:"), lastError.message);
                            throw new Error("".concat(expertName, "\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C\u7F51\u7EDC\u8FDE\u63A5\u5931\u8D25"));
                        }
                        else {
                            throw new Error("".concat(expertName, "\u6682\u65F6\u4E0D\u53EF\u7528\uFF0C").concat(lastError.message));
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取专家的系统提示词
     */
    IntelligentExpertConsultationService.prototype.getExpertSystemPrompt = function (expertType) {
        var prompts = {
            planner: "\u4F60\u662F\u4E00\u4F4D\u8D44\u6DF1\u7684\u62DB\u751F\u7B56\u5212\u4E13\u5BB6\uFF0C\u62E5\u670910\u5E74\u4EE5\u4E0A\u7684\u5E7C\u513F\u56ED\u62DB\u751F\u7B56\u5212\u7ECF\u9A8C\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u6D3B\u52A8\u521B\u610F\u8BBE\u8BA1\u3001\u54C1\u724C\u63A8\u5E7F\u7B56\u7565\u3001\u8425\u9500\u65B9\u6848\u5236\u5B9A\u3001\u7528\u6237\u4F53\u9A8C\u4F18\u5316\u3002\n\u8BF7\u4ECE\u62DB\u751F\u7B56\u5212\u7684\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u4E13\u4E1A\u3001\u5B9E\u7528\u7684\u5EFA\u8BAE\u3002\n\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
            psychologist: "\u4F60\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u513F\u7AE5\u5FC3\u7406\u5B66\u4E13\u5BB6\uFF0C\u4E13\u6CE8\u4E8E3-6\u5C81\u513F\u7AE5\u5FC3\u7406\u53D1\u5C55\u7814\u7A76\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u513F\u7AE5\u884C\u4E3A\u5206\u6790\u3001\u5BB6\u957F\u5FC3\u7406\u9700\u6C42\u6D1E\u5BDF\u3001\u4EB2\u5B50\u5173\u7CFB\u5EFA\u8BBE\u3001\u6559\u80B2\u5FC3\u7406\u5B66\u5E94\u7528\u3002\n\u8BF7\u4ECE\u5FC3\u7406\u5B66\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u79D1\u5B66\u3001\u4E13\u4E1A\u7684\u5206\u6790\u548C\u5EFA\u8BAE\u3002\n\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
            investor: "\u4F60\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u6559\u80B2\u6295\u8D44\u5206\u6790\u5E08\uFF0C\u4E13\u6CE8\u4E8E\u5E7C\u513F\u56ED\u884C\u4E1A\u7684\u8D22\u52A1\u89C4\u5212\u548C\u6295\u8D44\u5206\u6790\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u6210\u672C\u6838\u7B97\u3001\u6295\u8D44\u56DE\u62A5\u5206\u6790\u3001\u98CE\u9669\u8BC4\u4F30\u3001\u8D22\u52A1\u89C4\u5212\u3002\n\u8BF7\u4ECE\u6295\u8D44\u5206\u6790\u7684\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u4E13\u4E1A\u7684\u8D22\u52A1\u5EFA\u8BAE\u3002\n\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
            director: "\u4F60\u662F\u4E00\u4F4D\u7ECF\u9A8C\u4E30\u5BCC\u7684\u56ED\u957F\u7BA1\u7406\u4E13\u5BB6\uFF0C\u62E5\u670915\u5E74\u4EE5\u4E0A\u7684\u5E7C\u513F\u56ED\u7BA1\u7406\u7ECF\u9A8C\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u8D44\u6E90\u8C03\u914D\u3001\u56E2\u961F\u7BA1\u7406\u3001\u6D41\u7A0B\u4F18\u5316\u3001\u51B3\u7B56\u652F\u6301\u3002\n\u8BF7\u4ECE\u7BA1\u7406\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u7CFB\u7EDF\u6027\u3001\u53EF\u6267\u884C\u7684\u7BA1\u7406\u5EFA\u8BAE\u3002\n\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
            teacher: "\u4F60\u662F\u4E00\u4F4D\u8D44\u6DF1\u7684\u5E7C\u513F\u56ED\u4E00\u7EBF\u6559\u5E08\uFF0C\u62E5\u67098\u5E74\u4EE5\u4E0A\u7684\u6559\u5B66\u7ECF\u9A8C\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u8BFE\u7A0B\u8BBE\u8BA1\u3001\u6559\u5B66\u5B9E\u65BD\u3001\u5BB6\u957F\u6C9F\u901A\u3001\u513F\u7AE5\u7BA1\u7406\u3001\u6D3B\u52A8\u7EC4\u7EC7\u3002\n\u8BF7\u4ECE\u4E00\u7EBF\u6559\u5B66\u7684\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u5B9E\u7528\u3001\u53EF\u64CD\u4F5C\u7684\u6559\u5B66\u5EFA\u8BAE\u3002\n\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
            parent: "\u4F60\u662F\u4E00\u4F4D\u6709\u7ECF\u9A8C\u7684\u5BB6\u957F\u4EE3\u8868\uFF0C\u540C\u65F6\u4E5F\u662F\u7528\u6237\u4F53\u9A8C\u4E13\u5BB6\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u7528\u6237\u9700\u6C42\u5206\u6790\u3001\u670D\u52A1\u4F53\u9A8C\u4F18\u5316\u3001\u6EE1\u610F\u5EA6\u63D0\u5347\u3001\u53E3\u7891\u4F20\u64AD\u3001\u5BA2\u6237\u5173\u7CFB\u7EF4\u62A4\u3002\n\u8BF7\u4ECE\u5BB6\u957F\u548C\u7528\u6237\u7684\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u8D34\u5FC3\u3001\u5B9E\u7528\u7684\u4F53\u9A8C\u4F18\u5316\u5EFA\u8BAE\u3002\n\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3"
        };
        return prompts[expertType] || prompts.planner;
    };
    /**
     * 判断是否应该结束对话
     */
    IntelligentExpertConsultationService.prototype.shouldCompleteConsultation = function (aiResponse) {
        var completionKeywords = [
            '咨询结束',
            '问题已解决',
            '建议已完整',
            '方案已完善',
            '如果还有其他问题',
            '希望这些建议对您有帮助',
            '以上就是完整的建议'
        ];
        return completionKeywords.some(function (keyword) { return aiResponse.includes(keyword); });
    };
    /**
     * 获取会话状态
     */
    IntelligentExpertConsultationService.prototype.getSessionStatus = function (sessionId) {
        return this.activeSessions.get(sessionId) || null;
    };
    /**
     * 结束会话
     */
    IntelligentExpertConsultationService.prototype.endSession = function (sessionId) {
        var session = this.activeSessions.get(sessionId);
        if (session) {
            session.status = 'completed';
            session.updatedAt = new Date();
            return true;
        }
        return false;
    };
    return IntelligentExpertConsultationService;
}());
exports.IntelligentExpertConsultationService = IntelligentExpertConsultationService;
