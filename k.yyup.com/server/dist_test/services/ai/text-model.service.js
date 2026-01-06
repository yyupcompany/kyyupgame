"use strict";
/**
 * 文本模型服务
 * 负责处理文本生成和对话功能
 */
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
exports.__esModule = true;
exports.MessageRole = void 0;
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var uuid_1 = require("uuid");
/**
 * 消息角色类型
 */
var MessageRole;
(function (MessageRole) {
    MessageRole["SYSTEM"] = "system";
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["FUNCTION"] = "function";
})(MessageRole = exports.MessageRole || (exports.MessageRole = {}));
/**
 * 文本模型服务类
 */
var TextModelService = /** @class */ (function () {
    function TextModelService() {
    }
    /**
     * 生成文本
     * @param userId 用户ID
     * @param options 文本生成选项
     * @returns 生成的文本
     */
    TextModelService.prototype.generateText = function (userId, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r;
        return __awaiter(this, void 0, void 0, function () {
            var testQuery, dbError_1, errorMessage, modelConfig, anyActiveModel, requestId, modelId, requestBody, aiBridgeService, aiBridgeMessages, response, result, error_1;
            return __generator(this, function (_s) {
                switch (_s.label) {
                    case 0:
                        _s.trys.push([0, 12, , 13]);
                        console.log('🔍 查找AI模型配置:', options.model);
                        _s.label = 1;
                    case 1:
                        _s.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findAll({ limit: 1 })];
                    case 2:
                        testQuery = _s.sent();
                        console.log('✅ 数据库连接正常，表可访问');
                        return [3 /*break*/, 4];
                    case 3:
                        dbError_1 = _s.sent();
                        errorMessage = dbError_1 instanceof Error ? dbError_1.message : String(dbError_1);
                        console.error('❌ 数据库连接错误:', errorMessage);
                        throw new Error("\u6570\u636E\u5E93\u8FDE\u63A5\u5931\u8D25: ".concat(errorMessage));
                    case 4: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                            where: { name: options.model }
                        })];
                    case 5:
                        modelConfig = _s.sent();
                        if (!!modelConfig) return [3 /*break*/, 7];
                        console.log('🔄 按name查找失败，尝试查找默认模型...');
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    isDefault: true,
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 6:
                        modelConfig = _s.sent();
                        _s.label = 7;
                    case 7:
                        console.log('🔍 模型配置查找结果:', modelConfig ? '找到' : '未找到');
                        if (!!modelConfig) return [3 /*break*/, 9];
                        console.log('🚨 无法找到模型配置，尝试最后方案...');
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 8:
                        anyActiveModel = _s.sent();
                        if (anyActiveModel) {
                            console.log('✅ 找到活跃模型:', anyActiveModel.name);
                            modelConfig = anyActiveModel;
                        }
                        else {
                            console.log('❌ 数据库中没有活跃的AI模型配置');
                            throw new Error('数据库中没有可用的AI模型配置，请联系管理员配置AI模型');
                        }
                        _s.label = 9;
                    case 9:
                        console.log('✅ 使用模型配置:', {
                            name: modelConfig.name,
                            endpoint: modelConfig.endpointUrl,
                            status: modelConfig.status
                        });
                        requestId = (0, uuid_1.v4)();
                        // 创建使用记录 - 临时注释掉
                        // const usage = await AIModelUsage.create({
                        //   userId,
                        //   modelId: modelConfig.id,
                        //   requestId,
                        //   usageType: AIUsageType.TEXT,
                        //   status: AIUsageStatus.PENDING,
                        //   requestTimestamp: new Date()
                        // });
                        // 准备请求参数
                        // 对于豆包API，使用modelParameters中的model_id，否则使用options.model
                        console.log('🔍 模型配置详情:', {
                            name: modelConfig.name,
                            modelParameters: modelConfig.modelParameters,
                            hasModelId: !!((_a = modelConfig.modelParameters) === null || _a === void 0 ? void 0 : _a.model_id)
                        });
                        modelId = ((_b = modelConfig.modelParameters) === null || _b === void 0 ? void 0 : _b.model_id) || options.model;
                        console.log('🎯 使用模型ID:', modelId);
                        requestBody = {
                            model: modelId,
                            messages: options.messages,
                            temperature: (_c = options.temperature) !== null && _c !== void 0 ? _c : 0.7,
                            max_tokens: options.maxTokens,
                            top_p: (_d = options.topP) !== null && _d !== void 0 ? _d : 1,
                            frequency_penalty: (_e = options.frequencyPenalty) !== null && _e !== void 0 ? _e : 0,
                            presence_penalty: (_f = options.presencePenalty) !== null && _f !== void 0 ? _f : 0,
                            stop: options.stop,
                            functions: options.functions,
                            function_call: options.functionCall,
                            stream: (_g = options.stream) !== null && _g !== void 0 ? _g : false
                        };
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/bridge/ai-bridge.service')); })];
                    case 10:
                        aiBridgeService = (_s.sent()).aiBridgeService;
                        aiBridgeMessages = options.messages.map(function (msg) { return ({
                            role: msg.role,
                            content: msg.content
                        }); });
                        return [4 /*yield*/, aiBridgeService.generateChatCompletion({
                                model: String(modelId),
                                messages: aiBridgeMessages,
                                temperature: (_h = options.temperature) !== null && _h !== void 0 ? _h : 0.7,
                                max_tokens: options.maxTokens,
                                top_p: (_j = options.topP) !== null && _j !== void 0 ? _j : 1,
                                frequency_penalty: (_k = options.frequencyPenalty) !== null && _k !== void 0 ? _k : 0,
                                presence_penalty: (_l = options.presencePenalty) !== null && _l !== void 0 ? _l : 0,
                                stream: (_m = options.stream) !== null && _m !== void 0 ? _m : false
                            }, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 11:
                        response = _s.sent();
                        result = response;
                        // 更新使用记录
                        // await usage.update({
                        //   inputTokens: result.usage.prompt_tokens,
                        //   outputTokens: result.usage.completion_tokens,
                        //   totalTokens: result.usage.total_tokens,
                        //   status: AIUsageStatus.SUCCESS,
                        //   responseTimestamp: new Date(),
                        //   processingTime: new Date().getTime() - usage.requestTimestamp.getTime()
                        // });
                        // 格式化结果 - 根据模型类型处理不同的响应格式
                        if (modelConfig.provider === 'volcano_engine' && modelConfig.modelType === 'text') {
                            // 火山引擎搜索服务的响应格式
                            return [2 /*return*/, {
                                    id: result.id || 'search-' + Date.now(),
                                    model: modelConfig.name,
                                    choices: [{
                                            index: 0,
                                            message: {
                                                role: MessageRole.ASSISTANT,
                                                content: this.formatSearchResults(result),
                                                name: 'web_search'
                                            },
                                            finishReason: 'stop'
                                        }],
                                    usage: {
                                        promptTokens: 0,
                                        completionTokens: 0,
                                        totalTokens: 0
                                    }
                                }];
                        }
                        else {
                            // 标准AI模型的响应格式
                            return [2 /*return*/, {
                                    id: result.id,
                                    model: result.model,
                                    choices: ((_o = result.choices) === null || _o === void 0 ? void 0 : _o.map(function (choice) { return ({
                                        index: choice.index,
                                        message: {
                                            role: choice.message.role,
                                            content: choice.message.content,
                                            name: choice.message.name
                                        },
                                        finishReason: choice.finish_reason
                                    }); })) || [],
                                    usage: {
                                        promptTokens: ((_p = result.usage) === null || _p === void 0 ? void 0 : _p.prompt_tokens) || 0,
                                        completionTokens: ((_q = result.usage) === null || _q === void 0 ? void 0 : _q.completion_tokens) || 0,
                                        totalTokens: ((_r = result.usage) === null || _r === void 0 ? void 0 : _r.total_tokens) || 0
                                    }
                                }];
                        }
                        return [3 /*break*/, 13];
                    case 12:
                        error_1 = _s.sent();
                        console.error('文本生成失败:', error_1);
                        throw error_1;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 格式化搜索结果为文本
     */
    TextModelService.prototype.formatSearchResults = function (searchResult) {
        try {
            if (!searchResult) {
                return '搜索未返回结果';
            }
            // 处理火山引擎搜索结果格式
            var results = searchResult.results || searchResult.data || [];
            var query = searchResult.query || '网络搜索';
            if (!Array.isArray(results) || results.length === 0) {
                return "\uD83D\uDD0D \u7F51\u7EDC\u641C\u7D22 - \"".concat(query, "\"\n\n\u62B1\u6B49\uFF0C\u672A\u627E\u5230\u76F8\u5173\u4FE1\u606F\u3002");
            }
            var formatted_1 = "\uD83D\uDD0D \u7F51\u7EDC\u641C\u7D22\u7ED3\u679C - \"".concat(query, "\"\n");
            formatted_1 += "\uD83D\uDCCA \u627E\u5230 ".concat(results.length, " \u6761\u76F8\u5173\u4FE1\u606F\n\n");
            results.slice(0, 5).forEach(function (result, index) {
                var title = result.title || result.name || '无标题';
                var snippet = result.snippet || result.content || result.description || '无描述';
                var url = result.url || result.link || '';
                var source = result.source || result.domain || '网络';
                formatted_1 += "".concat(index + 1, ". **").concat(title, "**\n");
                formatted_1 += "   ".concat(snippet, "\n");
                formatted_1 += "   \uD83D\uDD17 \u6765\u6E90: ".concat(source, "\n");
                if (url) {
                    formatted_1 += "   \uD83D\uDCCE \u94FE\u63A5: ".concat(url, "\n");
                }
                formatted_1 += '\n';
            });
            // 添加搜索建议
            if (searchResult.suggestions && searchResult.suggestions.length > 0) {
                formatted_1 += "\uD83D\uDCA1 \u76F8\u5173\u5EFA\u8BAE: ".concat(searchResult.suggestions.join(', '), "\n");
            }
            return formatted_1;
        }
        catch (error) {
            console.error('格式化搜索结果失败:', error);
            return '搜索结果格式化失败，但搜索已完成。';
        }
    };
    /**
     * 流式生成文本
     * @param userId 用户ID
     * @param options 文本生成选项
     * @returns 生成的文本流
     */
    TextModelService.prototype.streamGenerateText = function (userId, options) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function () {
            var modelConfig, requestId, modelId, requestBody, aiBridgeService, aiBridgeMessages, response, error_2;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: { name: options.model }
                            })];
                    case 1:
                        modelConfig = _k.sent();
                        if (!modelConfig) {
                            throw new Error("\u627E\u4E0D\u5230\u6A21\u578B\u914D\u7F6E: ".concat(options.model));
                        }
                        requestId = (0, uuid_1.v4)();
                        modelId = ((_a = modelConfig.modelParameters) === null || _a === void 0 ? void 0 : _a.model_id) || options.model;
                        console.log('🎯 流式生成使用模型ID:', modelId);
                        requestBody = {
                            model: modelId,
                            messages: options.messages,
                            temperature: (_b = options.temperature) !== null && _b !== void 0 ? _b : 0.7,
                            max_tokens: options.maxTokens,
                            top_p: (_c = options.topP) !== null && _c !== void 0 ? _c : 1,
                            frequency_penalty: (_d = options.frequencyPenalty) !== null && _d !== void 0 ? _d : 0,
                            presence_penalty: (_e = options.presencePenalty) !== null && _e !== void 0 ? _e : 0,
                            stop: options.stop,
                            functions: options.functions,
                            function_call: options.functionCall,
                            stream: true
                        };
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../ai/bridge/ai-bridge.service')); })];
                    case 2:
                        aiBridgeService = (_k.sent()).aiBridgeService;
                        aiBridgeMessages = options.messages.map(function (msg) { return ({
                            role: msg.role,
                            content: msg.content
                        }); });
                        return [4 /*yield*/, aiBridgeService.generateChatCompletionStream({
                                model: String(modelId),
                                messages: aiBridgeMessages,
                                temperature: (_f = options.temperature) !== null && _f !== void 0 ? _f : 0.7,
                                max_tokens: options.maxTokens,
                                top_p: (_g = options.topP) !== null && _g !== void 0 ? _g : 1,
                                frequency_penalty: (_h = options.frequencyPenalty) !== null && _h !== void 0 ? _h : 0,
                                presence_penalty: (_j = options.presencePenalty) !== null && _j !== void 0 ? _j : 0,
                                stream: true
                            }, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 3:
                        response = _k.sent();
                        // 更新使用记录为成功
                        // await usage.update({
                        //   status: AIUsageStatus.SUCCESS,
                        //   responseTimestamp: new Date(),
                        //   processingTime: new Date().getTime() - usage.requestTimestamp.getTime()
                        // });
                        return [2 /*return*/, response];
                    case 4:
                        error_2 = _k.sent();
                        console.error('流式文本生成失败:', error_2);
                        throw error_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算文本中的token数量
     * @param text 文本内容
     * @returns token数量
     */
    TextModelService.prototype.countTokens = function (text) {
        // 简单估算：每4个字符约为1个token
        return Math.ceil(text.length / 4);
    };
    /**
     * 获取默认模型
     * @returns 默认模型配置
     */
    TextModelService.prototype.getDefaultModel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    isDefault: true,
                                    status: ai_model_config_model_1.ModelStatus.ACTIVE
                                }
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        console.error('获取默认模型失败:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return TextModelService;
}());
exports["default"] = new TextModelService();
