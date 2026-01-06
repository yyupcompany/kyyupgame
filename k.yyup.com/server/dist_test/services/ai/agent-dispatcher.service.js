"use strict";
/**
 * 智能体调度服务
 * 负责管理和调度不同类型的AI智能体
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.AgentType = void 0;
var text_model_service_1 = __importDefault(require("./text-model.service"));
var model_config_service_1 = __importDefault(require("./model-config.service"));
var text_model_service_2 = require("./text-model.service");
/**
 * 智能体类型枚举
 */
var AgentType;
(function (AgentType) {
    AgentType["CONVERSATION"] = "conversation";
    AgentType["ACTIVITY_PLANNER"] = "activity_planner";
    AgentType["CONTENT_CREATOR"] = "content_creator";
    AgentType["DATA_ANALYST"] = "data_analyst";
    AgentType["CUSTOMER_SERVICE"] = "customer_service";
})(AgentType = exports.AgentType || (exports.AgentType = {}));
/**
 * 智能体调度服务类
 */
var AgentDispatcherService = /** @class */ (function () {
    function AgentDispatcherService() {
        // 预定义智能体配置模板（不包含具体模型名称）
        this.agentConfigTemplates = new Map([
            [AgentType.CONVERSATION, {
                    type: AgentType.CONVERSATION,
                    name: '对话助手',
                    description: '通用对话助手，可以回答各种问题',
                    systemPrompt: '你是一个友好、有帮助的AI助手。你会提供准确、有用的信息，并尽可能地帮助用户解决问题。',
                    temperature: 0.7,
                    maxTokens: 2000
                }],
            [AgentType.ACTIVITY_PLANNER, {
                    type: AgentType.ACTIVITY_PLANNER,
                    name: '活动策划师',
                    description: '专门帮助策划各种活动的智能体',
                    systemPrompt: '你是一个专业的活动策划师，擅长为幼儿园、学校和社区设计各种有趣且有教育意义的活动。你会考虑活动的目标受众、预算、场地和时间限制，提供详细的活动流程、所需材料和人员安排。',
                    temperature: 0.8,
                    maxTokens: 3000
                }],
            [AgentType.CONTENT_CREATOR, {
                    type: AgentType.CONTENT_CREATOR,
                    name: '内容创作者',
                    description: '帮助创作各种内容的智能体',
                    systemPrompt: '你是一个专业的内容创作者，擅长撰写各种类型的文案、文章和教育内容。你会根据用户的需求和目标受众，创作出吸引人、信息丰富且符合品牌调性的内容。',
                    temperature: 0.9,
                    maxTokens: 4000
                }],
            [AgentType.DATA_ANALYST, {
                    type: AgentType.DATA_ANALYST,
                    name: '数据分析师',
                    description: '帮助分析数据并提供洞察的智能体',
                    systemPrompt: '你是一个专业的数据分析师，擅长分析各种数据并提取有价值的洞察。你会帮助用户理解数据趋势、找出关键指标，并提供基于数据的决策建议。',
                    temperature: 0.5,
                    maxTokens: 2500
                }],
            [AgentType.CUSTOMER_SERVICE, {
                    type: AgentType.CUSTOMER_SERVICE,
                    name: '客户服务代表',
                    description: '提供专业客户服务的智能体',
                    systemPrompt: '你是一个专业、耐心的客户服务代表，擅长解答用户问题、处理投诉和提供支持。你会使用友好、专业的语气，确保用户得到满意的解决方案。',
                    temperature: 0.6,
                    maxTokens: 2000
                }]
        ]);
        // 动态生成的智能体配置缓存
        this.agentConfigs = new Map();
        this.lastConfigUpdate = 0;
        this.CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存
        // 会话存储（实际应用中应该使用数据库）
        this.sessions = new Map();
    }
    /**
     * 动态构建智能体配置（使用数据库中的模型）
     */
    AgentDispatcherService.prototype.buildAgentConfigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            var defaultModel, _i, _a, _b, agentType, template, agentConfig, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        // 检查缓存是否有效
                        if (this.agentConfigs.size > 0 && Date.now() - this.lastConfigUpdate < this.CONFIG_CACHE_TTL) {
                            return [2 /*return*/];
                        }
                        console.log('🔄 动态构建智能体配置...');
                        return [4 /*yield*/, model_config_service_1["default"].getDefaultTextModelName()];
                    case 1:
                        defaultModel = _c.sent();
                        console.log("\uD83D\uDCDD \u4F7F\u7528\u9ED8\u8BA4\u6A21\u578B: ".concat(defaultModel));
                        // 清空旧配置
                        this.agentConfigs.clear();
                        // 为每个智能体类型生成配置
                        for (_i = 0, _a = this.agentConfigTemplates; _i < _a.length; _i++) {
                            _b = _a[_i], agentType = _b[0], template = _b[1];
                            agentConfig = __assign(__assign({}, template), { model: defaultModel // 使用数据库配置的模型
                             });
                            this.agentConfigs.set(agentType, agentConfig);
                        }
                        this.lastConfigUpdate = Date.now();
                        console.log("\u2705 \u6210\u529F\u6784\u5EFA ".concat(this.agentConfigs.size, " \u4E2A\u667A\u80FD\u4F53\u914D\u7F6E"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        console.error('❌ 构建智能体配置失败:', error_1);
                        throw new Error('无法初始化智能体配置');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有可用的智能体类型
     * @returns 智能体类型列表
     */
    AgentDispatcherService.prototype.getAvailableAgentTypes = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.buildAgentConfigs()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, Array.from(this.agentConfigs.keys())];
                }
            });
        });
    };
    /**
     * 获取智能体配置
     * @param type 智能体类型
     * @returns 智能体配置
     */
    AgentDispatcherService.prototype.getAgentConfig = function (type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.buildAgentConfigs()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.agentConfigs.get(type)];
                }
            });
        });
    };
    /**
     * 获取所有智能体配置
     * @returns 智能体配置列表
     */
    AgentDispatcherService.prototype.getAllAgentConfigs = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.buildAgentConfigs()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, Array.from(this.agentConfigs.values())];
                }
            });
        });
    };
    /**
     * 创建智能体会话
     * @param userId 用户ID
     * @param agentType 智能体类型
     * @returns 会话ID
     */
    AgentDispatcherService.prototype.createSession = function (userId, agentType) {
        return __awaiter(this, void 0, void 0, function () {
            var agentConfig, sessionId, session;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.buildAgentConfigs()];
                    case 1:
                        _a.sent();
                        agentConfig = this.agentConfigs.get(agentType);
                        if (!agentConfig) {
                            throw new Error("\u672A\u77E5\u7684\u667A\u80FD\u4F53\u7C7B\u578B: ".concat(agentType));
                        }
                        sessionId = "session_".concat(Date.now(), "_").concat(Math.floor(Math.random() * 1000));
                        session = {
                            id: sessionId,
                            agentType: agentType,
                            userId: userId,
                            messages: [
                                {
                                    role: text_model_service_2.MessageRole.SYSTEM,
                                    content: agentConfig.systemPrompt
                                }
                            ],
                            createdAt: new Date(),
                            updatedAt: new Date()
                        };
                        this.sessions.set(sessionId, session);
                        return [2 /*return*/, sessionId];
                }
            });
        });
    };
    /**
     * 向智能体发送消息
     * @param sessionId 会话ID
     * @param message 用户消息
     * @returns 智能体回复
     */
    AgentDispatcherService.prototype.sendMessage = function (sessionId, message) {
        return __awaiter(this, void 0, void 0, function () {
            var session, agentConfig, response, assistantMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        session = this.sessions.get(sessionId);
                        if (!session) {
                            throw new Error("\u4F1A\u8BDD\u4E0D\u5B58\u5728: ".concat(sessionId));
                        }
                        return [4 /*yield*/, this.buildAgentConfigs()];
                    case 1:
                        _a.sent();
                        agentConfig = this.agentConfigs.get(session.agentType);
                        if (!agentConfig) {
                            throw new Error("\u672A\u77E5\u7684\u667A\u80FD\u4F53\u7C7B\u578B: ".concat(session.agentType));
                        }
                        // 添加用户消息
                        session.messages.push({
                            role: text_model_service_2.MessageRole.USER,
                            content: message
                        });
                        return [4 /*yield*/, text_model_service_1["default"].generateText(session.userId, {
                                model: agentConfig.model,
                                messages: session.messages,
                                temperature: agentConfig.temperature,
                                maxTokens: agentConfig.maxTokens
                            })];
                    case 2:
                        response = _a.sent();
                        assistantMessage = response.choices[0].message;
                        // 添加助手消息到会话
                        session.messages.push(assistantMessage);
                        // 更新会话时间
                        session.updatedAt = new Date();
                        return [2 /*return*/, assistantMessage.content];
                }
            });
        });
    };
    /**
     * 获取会话历史
     * @param sessionId 会话ID
     * @returns 会话历史
     */
    AgentDispatcherService.prototype.getSessionHistory = function (sessionId) {
        var session = this.sessions.get(sessionId);
        if (!session) {
            throw new Error("\u4F1A\u8BDD\u4E0D\u5B58\u5728: ".concat(sessionId));
        }
        // 返回除系统消息外的所有消息
        return session.messages.filter(function (msg) { return msg.role !== text_model_service_2.MessageRole.SYSTEM; });
    };
    /**
     * 获取用户的所有会话
     * @param userId 用户ID
     * @returns 会话列表
     */
    AgentDispatcherService.prototype.getUserSessions = function (userId) {
        return Array.from(this.sessions.values())
            .filter(function (session) { return session.userId === userId; });
    };
    /**
     * 删除会话
     * @param sessionId 会话ID
     * @returns 是否成功删除
     */
    AgentDispatcherService.prototype.deleteSession = function (sessionId) {
        return this.sessions["delete"](sessionId);
    };
    /**
     * 创建自定义智能体
     * @param config 智能体配置
     * @returns 智能体类型
     */
    AgentDispatcherService.prototype.createCustomAgent = function (config) {
        var customType = "custom_".concat(Date.now());
        this.agentConfigs.set(customType, __assign(__assign({}, config), { type: customType }));
        return customType;
    };
    /**
     * 执行特定任务
     * @param userId 用户ID
     * @param agentType 智能体类型
     * @param task 任务描述
     * @returns 任务结果
     */
    AgentDispatcherService.prototype.executeTask = function (userId, agentType, task) {
        return __awaiter(this, void 0, void 0, function () {
            var agentConfig, messages, response, assistantMessage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.buildAgentConfigs()];
                    case 1:
                        _a.sent();
                        agentConfig = this.agentConfigs.get(agentType);
                        if (!agentConfig) {
                            throw new Error("\u672A\u77E5\u7684\u667A\u80FD\u4F53\u7C7B\u578B: ".concat(agentType));
                        }
                        messages = [
                            {
                                role: text_model_service_2.MessageRole.SYSTEM,
                                content: agentConfig.systemPrompt
                            },
                            {
                                role: text_model_service_2.MessageRole.USER,
                                content: task
                            }
                        ];
                        return [4 /*yield*/, text_model_service_1["default"].generateText(userId, {
                                model: agentConfig.model,
                                messages: messages,
                                temperature: agentConfig.temperature,
                                maxTokens: agentConfig.maxTokens
                            })];
                    case 2:
                        response = _a.sent();
                        assistantMessage = response.choices[0].message;
                        return [2 /*return*/, assistantMessage.content];
                }
            });
        });
    };
    return AgentDispatcherService;
}());
exports["default"] = new AgentDispatcherService();
