"use strict";
/**
 * 活动策划AI服务
 * 集成智能体调度、模型选择器和多模态AI能力
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var model_selector_service_1 = __importStar(require("./model-selector.service"));
var agent_dispatcher_service_1 = __importStar(require("./agent-dispatcher.service"));
var multimodal_service_1 = __importDefault(require("./multimodal.service"));
/**
 * 活动策划AI服务类
 */
var ActivityPlannerService = /** @class */ (function () {
    function ActivityPlannerService() {
    }
    /**
     * 生成活动策划方案
     * @param request 策划请求
     * @returns 策划结果
     */
    ActivityPlannerService.prototype.generateActivityPlan = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, planId, textPlan, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        planId = "plan_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                        console.log("\uD83C\uDFAF \u5F00\u59CB\u751F\u6210\u6D3B\u52A8\u7B56\u5212\u65B9\u6848: ".concat(planId));
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.generateTextPlan(request)];
                    case 2:
                        textPlan = _a.sent();
                        result = {
                            planId: planId,
                            title: textPlan.title,
                            description: textPlan.description,
                            detailedPlan: textPlan.detailedPlan,
                            generatedImages: [],
                            audioGuide: undefined,
                            modelsUsed: {
                                textModel: textPlan.modelUsed,
                                imageModel: undefined,
                                speechModel: undefined
                            },
                            processingTime: Date.now() - startTime
                        };
                        console.log("\u2705 \u6D3B\u52A8\u7B56\u5212\u65B9\u6848\u751F\u6210\u5B8C\u6210: ".concat(planId, ", \u8017\u65F6: ").concat(result.processingTime, "ms"));
                        return [2 /*return*/, result];
                    case 3:
                        error_1 = _a.sent();
                        console.error("\u274C \u6D3B\u52A8\u7B56\u5212\u65B9\u6848\u751F\u6210\u5931\u8D25: ".concat(planId), error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成文本策划方案
     * @param request 策划请求
     * @returns 文本方案
     */
    ActivityPlannerService.prototype.generateTextPlan = function (request) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, agentResponse, planningData, agentConfig, actualModelUsed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('📝 生成文本策划方案...');
                        prompt = this.buildPlanningPrompt(request);
                        return [4 /*yield*/, agent_dispatcher_service_1["default"].executeTask(request.userId, agent_dispatcher_service_1.AgentType.ACTIVITY_PLANNER, prompt)];
                    case 1:
                        agentResponse = _a.sent();
                        try {
                            planningData = JSON.parse(agentResponse);
                        }
                        catch (error) {
                            // 如果不是JSON格式，创建基本结构
                            planningData = {
                                title: "".concat(request.activityType, "\u6D3B\u52A8\u7B56\u5212"),
                                description: agentResponse,
                                detailedPlan: {
                                    overview: agentResponse,
                                    timeline: [
                                        { time: "09:00-09:30", activity: "活动准备", description: "准备活动所需材料和场地" },
                                        { time: "09:30-10:30", activity: "主要活动", description: request.activityType },
                                        { time: "10:30-11:00", activity: "总结分享", description: "分享活动体验和收获" }
                                    ],
                                    materials: ["基础材料", "安全用品"],
                                    budget: {
                                        total: request.budget || 0,
                                        breakdown: [
                                            { item: "材料费", cost: (request.budget || 0) * 0.7 },
                                            { item: "人工费", cost: (request.budget || 0) * 0.3 }
                                        ]
                                    },
                                    tips: ["确保活动安全", "注意儿童参与度"]
                                }
                            };
                        }
                        return [4 /*yield*/, agent_dispatcher_service_1["default"].getAgentConfig(agent_dispatcher_service_1.AgentType.ACTIVITY_PLANNER)];
                    case 2:
                        agentConfig = _a.sent();
                        actualModelUsed = (agentConfig === null || agentConfig === void 0 ? void 0 : agentConfig.model) || '未知模型';
                        return [2 /*return*/, {
                                title: planningData.title,
                                description: planningData.description,
                                detailedPlan: planningData.detailedPlan || planningData,
                                modelUsed: actualModelUsed,
                                imageUrl: '',
                                audioUrl: ''
                            }];
                }
            });
        });
    };
    /**
     * 生成配套图片
     * @param request 策划请求
     * @param textPlan 文本方案
     * @returns 生成的图片URL列表
     */
    ActivityPlannerService.prototype.generatePlanImages = function (request, textPlan) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var modelSelection, imagePrompts, imageResults, _i, imagePrompts_1, prompt_1, result, error_2, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        console.log('🖼️ 生成配套图片...');
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 9, , 10]);
                        return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                                modelType: ai_model_config_model_1.ModelType.IMAGE,
                                strategy: model_selector_service_1.ModelSelectionStrategy.PERFORMANCE,
                                userId: request.userId
                            })];
                    case 2:
                        modelSelection = _b.sent();
                        console.log("\uD83C\uDFA8 \u9009\u62E9\u56FE\u50CF\u6A21\u578B: ".concat(modelSelection.model.name, " (").concat(modelSelection.reason, ")"));
                        imagePrompts = this.generateImagePrompts(request, textPlan);
                        imageResults = [];
                        _i = 0, imagePrompts_1 = imagePrompts;
                        _b.label = 3;
                    case 3:
                        if (!(_i < imagePrompts_1.length)) return [3 /*break*/, 8];
                        prompt_1 = imagePrompts_1[_i];
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, multimodal_service_1["default"].generateImage(request.userId, {
                                model: modelSelection.model.name,
                                prompt: prompt_1,
                                n: 1,
                                size: '1024x1024',
                                quality: 'standard',
                                style: request.preferredStyle === 'creative' ? 'vivid' : 'natural'
                            })];
                    case 5:
                        result = _b.sent();
                        if (result.data && ((_a = result.data[0]) === null || _a === void 0 ? void 0 : _a.url)) {
                            imageResults.push(result.data[0].url);
                        }
                        return [3 /*break*/, 7];
                    case 6:
                        error_2 = _b.sent();
                        console.error('图片生成失败:', error_2);
                        return [3 /*break*/, 7];
                    case 7:
                        _i++;
                        return [3 /*break*/, 3];
                    case 8:
                        console.log("\u2705 \u6210\u529F\u751F\u6210 ".concat(imageResults.length, " \u5F20\u56FE\u7247"));
                        return [2 /*return*/, imageResults];
                    case 9:
                        error_3 = _b.sent();
                        console.error('图片生成过程失败:', error_3);
                        return [2 /*return*/, []];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成语音导览
     * @param request 策划请求
     * @param textPlan 文本方案
     * @returns 语音文件URL
     */
    ActivityPlannerService.prototype.generateAudioGuide = function (request, textPlan) {
        return __awaiter(this, void 0, void 0, function () {
            var modelSelection, audioScript, result, audioUrl, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔊 生成语音导览...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                                modelType: ai_model_config_model_1.ModelType.SPEECH,
                                strategy: model_selector_service_1.ModelSelectionStrategy.DEFAULT,
                                requireCapabilities: ['synthesis'],
                                userId: request.userId
                            })];
                    case 2:
                        modelSelection = _a.sent();
                        console.log("\uD83C\uDFA4 \u9009\u62E9\u8BED\u97F3\u6A21\u578B: ".concat(modelSelection.model.name, " (").concat(modelSelection.reason, ")"));
                        audioScript = this.generateAudioScript(textPlan);
                        return [4 /*yield*/, multimodal_service_1["default"].textToSpeech(request.userId, {
                                model: modelSelection.model.name,
                                input: audioScript,
                                voice: 'alloy',
                                speed: 1.0,
                                responseFormat: 'mp3'
                            })];
                    case 3:
                        result = _a.sent();
                        return [4 /*yield*/, this.saveAudioFile(result.audioData, "".concat(textPlan.title, "_guide.mp3"))];
                    case 4:
                        audioUrl = _a.sent();
                        console.log('✅ 语音导览生成完成');
                        return [2 /*return*/, audioUrl];
                    case 5:
                        error_4 = _a.sent();
                        console.error('语音导览生成失败:', error_4);
                        return [2 /*return*/, undefined];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 构建策划提示词
     * @param request 策划请求
     * @returns 提示词
     */
    ActivityPlannerService.prototype.buildPlanningPrompt = function (request) {
        var _a;
        return "\n\u8BF7\u4E3A\u4EE5\u4E0B\u6D3B\u52A8\u9700\u6C42\u5236\u5B9A\u8BE6\u7EC6\u7684\u7B56\u5212\u65B9\u6848\uFF1A\n\n\u6D3B\u52A8\u7C7B\u578B\uFF1A".concat(request.activityType, "\n\u76EE\u6807\u53D7\u4F17\uFF1A").concat(request.targetAudience, "\n\u9884\u7B97\u8303\u56F4\uFF1A").concat(request.budget ? "".concat(request.budget, "\u5143") : '待定', "\n\u6D3B\u52A8\u65F6\u957F\uFF1A").concat(request.duration || '待定', "\n\u6D3B\u52A8\u5730\u70B9\uFF1A").concat(request.location || '待定', "\n\u7279\u6B8A\u8981\u6C42\uFF1A").concat(((_a = request.requirements) === null || _a === void 0 ? void 0 : _a.join(', ')) || '无', "\n\n\u8BF7\u63D0\u4F9B\u4EE5\u4E0B\u683C\u5F0F\u7684JSON\u54CD\u5E94\uFF1A\n{\n  \"title\": \"\u6D3B\u52A8\u6807\u9898\",\n  \"description\": \"\u6D3B\u52A8\u7B80\u4ECB\",\n  \"detailedPlan\": {\n    \"overview\": \"\u6D3B\u52A8\u6982\u8FF0\",\n    \"timeline\": [\n      {\"time\": \"\u65F6\u95F4\", \"activity\": \"\u6D3B\u52A8\u9879\u76EE\", \"description\": \"\u8BE6\u7EC6\u8BF4\u660E\"}\n    ],\n    \"materials\": [\"\u6240\u9700\u7269\u6599\u6E05\u5355\"],\n    \"budget\": {\n      \"total\": \u603B\u9884\u7B97,\n      \"breakdown\": [\n        {\"item\": \"\u9879\u76EE\u540D\u79F0\", \"cost\": \u8D39\u7528}\n      ]\n    },\n    \"tips\": [\"\u6267\u884C\u5EFA\u8BAE\u548C\u6CE8\u610F\u4E8B\u9879\"]\n  }\n}\n\n\u8BF7\u786E\u4FDD\u65B9\u6848\u5177\u6709\u521B\u610F\u6027\u3001\u53EF\u6267\u884C\u6027\u548C\u6210\u672C\u6548\u76CA\u3002\n    ").trim();
    };
    /**
     * 生成图片提示词
     * @param request 策划请求
     * @param textPlan 文本方案
     * @returns 图片提示词列表
     */
    ActivityPlannerService.prototype.generateImagePrompts = function (request, textPlan) {
        var prompts = [];
        // 主场景图
        prompts.push("A vibrant ".concat(request.activityType, " event scene with ").concat(request.targetAudience, ", \n       professional photography, bright lighting, engaging atmosphere, \n       ").concat(request.location ? "at ".concat(request.location) : 'indoor setting'));
        // 活动细节图
        if (textPlan.detailedPlan.materials.length > 0) {
            prompts.push("Activity materials and setup for ".concat(request.activityType, ", \n         organized layout, professional presentation, clean background"));
        }
        return prompts.slice(0, 3); // 最多生成3张图片
    };
    /**
     * 生成语音导览脚本
     * @param textPlan 文本方案
     * @returns 语音脚本
     */
    ActivityPlannerService.prototype.generateAudioScript = function (textPlan) {
        return "\n\u6B22\u8FCE\u53C2\u52A0".concat(textPlan.title, "\uFF01\n\n").concat(textPlan.description, "\n\n\u8BA9\u6211\u4E3A\u60A8\u4ECB\u7ECD\u6D3B\u52A8\u7684\u8BE6\u7EC6\u5B89\u6392\uFF1A\n\n").concat(textPlan.detailedPlan.overview, "\n\n\u5E0C\u671B\u60A8\u80FD\u5728\u6D3B\u52A8\u4E2D\u6536\u83B7\u6EE1\u6EE1\uFF0C\u5EA6\u8FC7\u6109\u5FEB\u7684\u65F6\u5149\uFF01\n    ").trim();
    };
    /**
     * 保存音频文件
     * @param audioData 音频数据
     * @param filename 文件名
     * @returns 文件URL
     */
    ActivityPlannerService.prototype.saveAudioFile = function (audioData, filename) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里应该实现文件保存逻辑
                // 暂时返回模拟URL
                return [2 /*return*/, "/uploads/audio/".concat(filename)];
            });
        });
    };
    /**
     * 获取活动策划统计
     * @param userId 用户ID
     * @param days 统计天数
     * @returns 统计数据
     */
    ActivityPlannerService.prototype.getPlanningStats = function (userId, days) {
        if (days === void 0) { days = 30; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里可以实现统计逻辑
                return [2 /*return*/, {
                        totalPlans: 0,
                        successRate: 100,
                        averageProcessingTime: 0,
                        popularActivityTypes: []
                    }];
            });
        });
    };
    return ActivityPlannerService;
}());
exports["default"] = new ActivityPlannerService();
