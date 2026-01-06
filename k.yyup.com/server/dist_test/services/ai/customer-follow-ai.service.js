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
exports.CustomerFollowAIService = void 0;
var ai_bridge_service_1 = require("./bridge/ai-bridge.service");
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
/**
 * 客户跟进AI建议服务
 * 为教师提供个性化的客户跟进建议
 */
var CustomerFollowAIService = /** @class */ (function () {
    function CustomerFollowAIService() {
        // 使用单例实例
    }
    /**
     * 获取跟进阶段的AI建议
     */
    CustomerFollowAIService.prototype.getFollowUpSuggestions = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt_1, modelConfig, chatParams, response, suggestions, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        prompt_1 = this.buildPrompt(request);
                        return [4 /*yield*/, this.getDouBaoModelConfig()];
                    case 1:
                        modelConfig = _a.sent();
                        chatParams = {
                            model: modelConfig.name,
                            messages: [
                                {
                                    role: 'system',
                                    content: this.getSystemPrompt()
                                },
                                {
                                    role: 'user',
                                    content: prompt_1
                                }
                            ],
                            temperature: 0.7,
                            max_tokens: 2000
                        };
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion(chatParams, {
                                endpointUrl: modelConfig.endpointUrl,
                                apiKey: modelConfig.apiKey
                            })];
                    case 2:
                        response = _a.sent();
                        suggestions = this.parseAIResponse(response.choices[0].message.content);
                        return [2 /*return*/, {
                                suggestions: suggestions,
                                confidence: 0.85,
                                generatedAt: new Date()
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error('获取AI建议失败:', error_1);
                        // 返回默认建议
                        return [2 /*return*/, this.getDefaultSuggestions(request.stage)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取豆包模型配置
     */
    CustomerFollowAIService.prototype.getDouBaoModelConfig = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                            where: {
                                name: 'doubao-pro-4k',
                                status: 'active'
                            }
                        })];
                    case 1:
                        config = _a.sent();
                        if (!config) {
                            throw new Error('豆包模型配置未找到或未激活');
                        }
                        return [2 /*return*/, config];
                }
            });
        });
    };
    /**
     * 构建AI提示词
     */
    CustomerFollowAIService.prototype.buildPrompt = function (request) {
        var customerInfo = request.customerInfo, stage = request.stage, subStage = request.subStage, currentContent = request.currentContent;
        var stageNames = {
            1: '初期接触', 2: '需求挖掘', 3: '方案展示', 4: '实地体验',
            5: '异议处理', 6: '促成决策', 7: '缴费确认', 8: '入园准备'
        };
        return "\n\u4F5C\u4E3A\u5E7C\u513F\u56ED\u62DB\u751F\u4E13\u5BB6\uFF0C\u8BF7\u4E3A\u4EE5\u4E0B\u5BA2\u6237\u8DDF\u8FDB\u60C5\u51B5\u63D0\u4F9B\u4E13\u4E1A\u5EFA\u8BAE\uFF1A\n\n**\u5BA2\u6237\u4FE1\u606F\uFF1A**\n- \u5BB6\u957F\u59D3\u540D\uFF1A".concat(customerInfo.customerName, "\n- \u5B69\u5B50\u59D3\u540D\uFF1A").concat(customerInfo.childName, "\n- \u5B69\u5B50\u5E74\u9F84\uFF1A").concat(customerInfo.childAge, "\u5C81\n- \u8054\u7CFB\u7535\u8BDD\uFF1A").concat(customerInfo.contactPhone, "\n- \u6765\u6E90\u6E20\u9053\uFF1A").concat(customerInfo.source, "\n\n**\u5F53\u524D\u8DDF\u8FDB\u9636\u6BB5\uFF1A**\n- \u9636\u6BB5\uFF1A").concat(stage, ". ").concat(stageNames[stage], "\n- \u5B50\u9636\u6BB5\uFF1A").concat(subStage, "\n- \u5F53\u524D\u8DDF\u8FDB\u5185\u5BB9\uFF1A").concat(currentContent, "\n\n**\u5386\u53F2\u4E92\u52A8\uFF1A**\n").concat(customerInfo.previousInteractions.join('\n'), "\n\n").concat(customerInfo.customerFeedback ? "**\u5BA2\u6237\u53CD\u9988\uFF1A**\n".concat(customerInfo.customerFeedback) : '', "\n\n").concat(customerInfo.concerns ? "**\u5BA2\u6237\u987E\u8651\uFF1A**\n".concat(customerInfo.concerns.join(', ')) : '', "\n\n\u8BF7\u63D0\u4F9B\u4EE5\u4E0B\u65B9\u9762\u7684\u5EFA\u8BAE\uFF08\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\uFF09\uFF1A\n1. communicationStrategy: \u6C9F\u901A\u7B56\u7565\u5EFA\u8BAE\n2. recommendedActions: \u63A8\u8350\u7684\u5177\u4F53\u884C\u52A8\uFF08\u6570\u7EC4\uFF09\n3. talkingPoints: \u5173\u952E\u8BDD\u672F\u8981\u70B9\uFF08\u6570\u7EC4\uFF09\n4. nextStepTiming: \u4E0B\u4E00\u6B65\u884C\u52A8\u7684\u6700\u4F73\u65F6\u673A\n5. potentialConcerns: \u53EF\u80FD\u9047\u5230\u7684\u5BA2\u6237\u987E\u8651\uFF08\u6570\u7EC4\uFF09\n6. successTips: \u6210\u529F\u8F6C\u5316\u7684\u5173\u952E\u6280\u5DE7\uFF08\u6570\u7EC4\uFF09\n");
    };
    /**
     * 系统提示词
     */
    CustomerFollowAIService.prototype.getSystemPrompt = function () {
        return "\u4F60\u662F\u4E00\u4F4D\u7ECF\u9A8C\u4E30\u5BCC\u7684\u5E7C\u513F\u56ED\u62DB\u751F\u4E13\u5BB6\uFF0C\u5177\u670910\u5E74\u4EE5\u4E0A\u7684\u5BA2\u6237\u8DDF\u8FDB\u548C\u8F6C\u5316\u7ECF\u9A8C\u3002\n\u4F60\u7684\u4EFB\u52A1\u662F\u4E3A\u6559\u5E08\u63D0\u4F9B\u4E13\u4E1A\u3001\u5B9E\u7528\u3001\u4E2A\u6027\u5316\u7684\u5BA2\u6237\u8DDF\u8FDB\u5EFA\u8BAE\u3002\n\n\u8BF7\u9075\u5FAA\u4EE5\u4E0B\u539F\u5219\uFF1A\n1. \u5EFA\u8BAE\u8981\u5177\u4F53\u53EF\u6267\u884C\uFF0C\u907F\u514D\u7A7A\u6CDB\u7684\u7406\u8BBA\n2. \u8003\u8651\u5BA2\u6237\u7684\u5177\u4F53\u60C5\u51B5\u548C\u9700\u6C42\n3. \u63D0\u4F9B\u591A\u79CD\u6C9F\u901A\u7B56\u7565\u9009\u62E9\n4. \u9884\u6D4B\u53EF\u80FD\u7684\u5BA2\u6237\u53CD\u5E94\u548C\u5E94\u5BF9\u65B9\u6848\n5. \u5EFA\u8BAE\u8981\u7B26\u5408\u5E7C\u513F\u56ED\u884C\u4E1A\u7279\u70B9\n6. \u8BED\u8A00\u8981\u4E13\u4E1A\u4F46\u6613\u61C2\uFF0C\u9002\u5408\u6559\u5E08\u4F7F\u7528\n\n\u8BF7\u59CB\u7EC8\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u5EFA\u8BAE\uFF0C\u786E\u4FDD\u683C\u5F0F\u6B63\u786E\u3002";
    };
    /**
     * 解析AI响应
     */
    CustomerFollowAIService.prototype.parseAIResponse = function (content) {
        try {
            // 尝试解析JSON响应
            var parsed = JSON.parse(content);
            return {
                communicationStrategy: parsed.communicationStrategy || '建议采用温和友好的沟通方式',
                recommendedActions: parsed.recommendedActions || ['主动联系客户', '了解具体需求'],
                talkingPoints: parsed.talkingPoints || ['强调园所优势', '关注孩子成长'],
                nextStepTiming: parsed.nextStepTiming || '建议在3天内进行下次跟进',
                potentialConcerns: parsed.potentialConcerns || ['价格问题', '距离问题'],
                successTips: parsed.successTips || ['保持耐心', '建立信任关系']
            };
        }
        catch (error) {
            console.error('解析AI响应失败:', error);
            // 返回基于内容的简单解析
            return this.parseTextResponse(content);
        }
    };
    /**
     * 解析文本响应（备用方案）
     */
    CustomerFollowAIService.prototype.parseTextResponse = function (content) {
        return {
            communicationStrategy: content.substring(0, 200) + '...',
            recommendedActions: ['根据AI建议制定行动计划'],
            talkingPoints: ['参考AI提供的沟通要点'],
            nextStepTiming: '建议在适当时机进行跟进',
            potentialConcerns: ['关注客户可能的顾虑'],
            successTips: ['遵循AI建议的成功策略']
        };
    };
    /**
     * 获取默认建议（AI服务不可用时的备用方案）
     */
    CustomerFollowAIService.prototype.getDefaultSuggestions = function (stage) {
        var defaultSuggestions = {
            1: {
                communicationStrategy: '采用温和友好的方式建立初步联系，重点了解客户基本需求',
                recommendedActions: ['确认客户联系方式', '了解孩子基本情况', '介绍园所概况'],
                talkingPoints: ['欢迎咨询我们幼儿园', '我们很重视每个孩子的成长', '可以为您详细介绍我们的特色'],
                nextStepTiming: '建议在24小时内进行回访',
                potentialConcerns: ['对园所不了解', '担心孩子适应问题'],
                successTips: ['保持专业态度', '展现关爱之心', '提供准确信息']
            }
        };
        var suggestions = defaultSuggestions[stage] || defaultSuggestions[1];
        return {
            suggestions: suggestions,
            confidence: 0.6,
            generatedAt: new Date()
        };
    };
    return CustomerFollowAIService;
}());
exports.CustomerFollowAIService = CustomerFollowAIService;
exports["default"] = CustomerFollowAIService;
