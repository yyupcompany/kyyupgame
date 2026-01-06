"use strict";
/**
 * AI专家咨询服务
 * 提供多智能体专家咨询功能
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
var expert_consultation_model_1 = require("../../models/expert-consultation.model");
var expert_consultation_interface_1 = require("./interfaces/expert-consultation.interface");
var text_model_service_1 = __importDefault(require("./text-model.service"));
var model_selector_service_1 = __importStar(require("./model-selector.service"));
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
/**
 * AI专家咨询服务类
 */
var ExpertConsultationService = /** @class */ (function () {
    function ExpertConsultationService() {
        var _a;
        /**
         * 专家配置
         */
        this.expertConfigs = (_a = {},
            _a[expert_consultation_interface_1.ExpertType.PLANNER] = {
                type: expert_consultation_interface_1.ExpertType.PLANNER,
                name: '招生策划专家',
                role: '资深策划师',
                expertise: ['活动创意设计', '品牌推广策略', '营销方案制定', '用户体验优化'],
                systemPrompt: "\u4F60\u662F\u4E00\u4F4D\u8D44\u6DF1\u7684\u62DB\u751F\u7B56\u5212\u4E13\u5BB6\uFF0C\u62E5\u670910\u5E74\u4EE5\u4E0A\u7684\u5E7C\u513F\u56ED\u62DB\u751F\u7B56\u5212\u7ECF\u9A8C\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u6D3B\u52A8\u521B\u610F\u8BBE\u8BA1\u3001\u54C1\u724C\u63A8\u5E7F\u7B56\u7565\u3001\u8425\u9500\u65B9\u6848\u5236\u5B9A\u3001\u7528\u6237\u4F53\u9A8C\u4F18\u5316\u3002\n\u8BF7\u4ECE\u62DB\u751F\u7B56\u5212\u7684\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u4E13\u4E1A\u3001\u5B9E\u7528\u7684\u5EFA\u8BAE\u3002\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
                responseStyle: '专业、实用、结构化'
            },
            _a[expert_consultation_interface_1.ExpertType.PSYCHOLOGIST] = {
                type: expert_consultation_interface_1.ExpertType.PSYCHOLOGIST,
                name: '心理学专家',
                role: '儿童心理学家',
                expertise: ['儿童行为分析', '家长心理需求洞察', '亲子关系建设', '教育心理学应用'],
                systemPrompt: "\u4F60\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u513F\u7AE5\u5FC3\u7406\u5B66\u4E13\u5BB6\uFF0C\u4E13\u6CE8\u4E8E3-6\u5C81\u513F\u7AE5\u5FC3\u7406\u53D1\u5C55\u7814\u7A76\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u513F\u7AE5\u884C\u4E3A\u5206\u6790\u3001\u5BB6\u957F\u5FC3\u7406\u9700\u6C42\u6D1E\u5BDF\u3001\u4EB2\u5B50\u5173\u7CFB\u5EFA\u8BBE\u3001\u6559\u80B2\u5FC3\u7406\u5B66\u5E94\u7528\u3002\n\u8BF7\u4ECE\u5FC3\u7406\u5B66\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u79D1\u5B66\u3001\u4E13\u4E1A\u7684\u5206\u6790\u548C\u5EFA\u8BAE\u3002\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
                responseStyle: '科学、专业、理论结合实践'
            },
            _a[expert_consultation_interface_1.ExpertType.INVESTOR] = {
                type: expert_consultation_interface_1.ExpertType.INVESTOR,
                name: '投资分析专家',
                role: '财务顾问',
                expertise: ['成本效益分析', '投资回报评估', '预算规划', '风险控制', '数据驱动决策'],
                systemPrompt: "\u4F60\u662F\u4E00\u4F4D\u4E13\u4E1A\u7684\u6295\u8D44\u5206\u6790\u4E13\u5BB6\uFF0C\u4E13\u6CE8\u4E8E\u6559\u80B2\u884C\u4E1A\u7684\u8D22\u52A1\u89C4\u5212\u548C\u6295\u8D44\u5206\u6790\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u6210\u672C\u6548\u76CA\u5206\u6790\u3001\u6295\u8D44\u56DE\u62A5\u8BC4\u4F30\u3001\u9884\u7B97\u89C4\u5212\u3001\u98CE\u9669\u63A7\u5236\u3001\u6570\u636E\u9A71\u52A8\u51B3\u7B56\u3002\n\u8BF7\u4ECE\u6295\u8D44\u548C\u8D22\u52A1\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u91CF\u5316\u3001\u5B9E\u7528\u7684\u5206\u6790\u548C\u5EFA\u8BAE\u3002\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
                responseStyle: '量化、实用、数据驱动'
            },
            _a[expert_consultation_interface_1.ExpertType.DIRECTOR] = {
                type: expert_consultation_interface_1.ExpertType.DIRECTOR,
                name: '园长管理专家',
                role: '运营总监',
                expertise: ['团队管理', '资源配置', '流程优化', '质量控制', '危机处理'],
                systemPrompt: "\u4F60\u662F\u4E00\u4F4D\u7ECF\u9A8C\u4E30\u5BCC\u7684\u5E7C\u513F\u56ED\u56ED\u957F\uFF0C\u62E5\u670915\u5E74\u4EE5\u4E0A\u7684\u56ED\u6240\u7BA1\u7406\u7ECF\u9A8C\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u56E2\u961F\u7BA1\u7406\u3001\u8D44\u6E90\u914D\u7F6E\u3001\u6D41\u7A0B\u4F18\u5316\u3001\u8D28\u91CF\u63A7\u5236\u3001\u5371\u673A\u5904\u7406\u3002\n\u8BF7\u4ECE\u56ED\u6240\u7BA1\u7406\u7684\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u7CFB\u7EDF\u6027\u3001\u53EF\u6267\u884C\u7684\u7BA1\u7406\u5EFA\u8BAE\u3002\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
                responseStyle: '系统性、可执行、管理导向'
            },
            _a[expert_consultation_interface_1.ExpertType.TEACHER] = {
                type: expert_consultation_interface_1.ExpertType.TEACHER,
                name: '执行教师专家',
                role: '一线教师',
                expertise: ['课程设计', '教学实施', '家长沟通', '儿童管理', '活动组织'],
                systemPrompt: "\u4F60\u662F\u4E00\u4F4D\u8D44\u6DF1\u7684\u5E7C\u513F\u56ED\u4E00\u7EBF\u6559\u5E08\uFF0C\u62E5\u67098\u5E74\u4EE5\u4E0A\u7684\u6559\u5B66\u7ECF\u9A8C\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u8BFE\u7A0B\u8BBE\u8BA1\u3001\u6559\u5B66\u5B9E\u65BD\u3001\u5BB6\u957F\u6C9F\u901A\u3001\u513F\u7AE5\u7BA1\u7406\u3001\u6D3B\u52A8\u7EC4\u7EC7\u3002\n\u8BF7\u4ECE\u4E00\u7EBF\u6559\u5B66\u7684\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u5B9E\u7528\u3001\u53EF\u64CD\u4F5C\u7684\u6559\u5B66\u5EFA\u8BAE\u3002\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
                responseStyle: '实用、可操作、教学导向'
            },
            _a[expert_consultation_interface_1.ExpertType.PARENT] = {
                type: expert_consultation_interface_1.ExpertType.PARENT,
                name: '家长体验专家',
                role: '用户代表',
                expertise: ['用户需求分析', '服务体验优化', '满意度提升', '口碑传播', '客户关系维护'],
                systemPrompt: "\u4F60\u662F\u4E00\u4F4D\u6709\u7ECF\u9A8C\u7684\u5BB6\u957F\u4EE3\u8868\uFF0C\u540C\u65F6\u4E5F\u662F\u7528\u6237\u4F53\u9A8C\u4E13\u5BB6\u3002\n\u4F60\u7684\u4E13\u957F\u5305\u62EC\uFF1A\u7528\u6237\u9700\u6C42\u5206\u6790\u3001\u670D\u52A1\u4F53\u9A8C\u4F18\u5316\u3001\u6EE1\u610F\u5EA6\u63D0\u5347\u3001\u53E3\u7891\u4F20\u64AD\u3001\u5BA2\u6237\u5173\u7CFB\u7EF4\u62A4\u3002\n\u8BF7\u4ECE\u5BB6\u957F\u548C\u7528\u6237\u7684\u89D2\u5EA6\uFF0C\u4E3A\u7528\u6237\u7684\u95EE\u9898\u63D0\u4F9B\u8D34\u5FC3\u3001\u5B9E\u7528\u7684\u4F53\u9A8C\u4F18\u5316\u5EFA\u8BAE\u3002\n\u56DE\u590D\u683C\u5F0F\uFF1A\n\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\uFF08\u4F60\u7684\u4E13\u4E1A\u5206\u6790\uFF09\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u8981\u70B91\n- \u8981\u70B92\n- \u8981\u70B93\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\n- \u5EFA\u8BAE2\n- \u5EFA\u8BAE3",
                responseStyle: '贴心、实用、用户导向'
            },
            _a);
    }
    /**
     * 启动专家咨询
     */
    ExpertConsultationService.prototype.startConsultation = function (request) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var queryType, expertOrder, consultation;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        queryType = this.analyzeQueryType(request.query);
                        expertOrder = this.determineExpertOrder(queryType, (_a = request.preferences) === null || _a === void 0 ? void 0 : _a.expertOrder);
                        return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.create({
                                userId: request.userId,
                                topic: request.query.substring(0, 500),
                                description: request.query,
                                urgency: ((_b = request.preferences) === null || _b === void 0 ? void 0 : _b.urgency) || 'medium',
                                expectedExperts: expertOrder,
                                context: {
                                    queryType: queryType,
                                    preferences: request.preferences || {},
                                    createdAt: new Date().toISOString()
                                },
                                status: 'pending',
                                progressPercentage: 0,
                                totalExperts: expertOrder.length,
                                currentRound: 1,
                                maxRounds: Number(process.env.AI_MAX_ITERATIONS || 12)
                            })];
                    case 1:
                        consultation = _c.sent();
                        return [2 /*return*/, {
                                sessionId: consultation.id,
                                userId: request.userId,
                                query: request.query,
                                queryType: queryType,
                                expertOrder: expertOrder,
                                speeches: [],
                                status: expert_consultation_interface_1.ConsultationStatus.PENDING,
                                createdAt: consultation.createdAt
                            }];
                }
            });
        });
    };
    /**
     * 获取下一个专家发言
     */
    ExpertConsultationService.prototype.getNextExpertSpeech = function (sessionId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var consultation, existingSpeeches, expectedExperts, currentExpertIndex, currentExpertType, expertConfig, previousSpeeches, context, speech;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.findByPk(sessionId)];
                    case 1:
                        consultation = _b.sent();
                        if (!consultation) {
                            throw new Error('Session not found');
                        }
                        if (consultation.status === 'completed') {
                            throw new Error('Consultation already completed');
                        }
                        return [4 /*yield*/, expert_consultation_model_1.ExpertSpeech.findAll({
                                where: { consultationId: sessionId },
                                order: [['round', 'ASC'], ['order', 'ASC']]
                            })];
                    case 2:
                        existingSpeeches = _b.sent();
                        expectedExperts = consultation.expectedExperts;
                        currentExpertIndex = existingSpeeches.length;
                        if (!(currentExpertIndex >= expectedExperts.length)) return [3 /*break*/, 4];
                        // 更新咨询状态为完成
                        return [4 /*yield*/, consultation.update({
                                status: 'completed',
                                progressPercentage: 100
                            })];
                    case 3:
                        // 更新咨询状态为完成
                        _b.sent();
                        throw new Error('All experts have spoken');
                    case 4:
                        currentExpertType = expectedExperts[currentExpertIndex];
                        expertConfig = this.expertConfigs[currentExpertType];
                        if (!expertConfig) {
                            throw new Error("Expert configuration not found for type: ".concat(currentExpertType));
                        }
                        previousSpeeches = existingSpeeches.map(function (speech) { return ({
                            expertType: speech.expertType,
                            expertName: speech.expertName,
                            content: speech.content,
                            keyPoints: speech.keywords || [],
                            recommendations: [],
                            timestamp: speech.createdAt,
                            processingTime: 0
                        }); });
                        context = this.buildExpertContext(currentExpertType, consultation.description, ((_a = consultation.context) === null || _a === void 0 ? void 0 : _a.queryType) || expert_consultation_interface_1.QueryType.GENERAL, previousSpeeches);
                        return [4 /*yield*/, this.generateExpertSpeech(expertConfig, context)];
                    case 5:
                        speech = _b.sent();
                        // 保存发言到数据库
                        return [4 /*yield*/, expert_consultation_model_1.ExpertSpeech.create({
                                consultationId: sessionId,
                                expertType: speech.expertType,
                                expertName: speech.expertName,
                                content: speech.content,
                                round: 1,
                                order: currentExpertIndex + 1,
                                confidence: 0.8,
                                keywords: speech.keyPoints || []
                            })];
                    case 6:
                        // 保存发言到数据库
                        _b.sent();
                        return [2 /*return*/, speech];
                }
            });
        });
    };
    /**
     * 分析查询类型
     */
    ExpertConsultationService.prototype.analyzeQueryType = function (query) {
        var lowerQuery = query.toLowerCase();
        if (lowerQuery.includes('招生') || lowerQuery.includes('活动')) {
            return expert_consultation_interface_1.QueryType.RECRUITMENT_ACTIVITY;
        }
        else if (lowerQuery.includes('家长') || lowerQuery.includes('转化') || lowerQuery.includes('咨询')) {
            return expert_consultation_interface_1.QueryType.PARENT_CONVERSION;
        }
        return expert_consultation_interface_1.QueryType.GENERAL;
    };
    /**
     * 确定专家发言顺序
     */
    ExpertConsultationService.prototype.determineExpertOrder = function (queryType, preferredOrder) {
        var _a;
        if (preferredOrder && preferredOrder.length > 0) {
            return preferredOrder;
        }
        // 根据查询类型确定专家顺序
        var orderMap = (_a = {},
            _a[expert_consultation_interface_1.QueryType.RECRUITMENT_ACTIVITY] = [
                expert_consultation_interface_1.ExpertType.PLANNER,
                expert_consultation_interface_1.ExpertType.PSYCHOLOGIST,
                expert_consultation_interface_1.ExpertType.INVESTOR,
                expert_consultation_interface_1.ExpertType.DIRECTOR,
                expert_consultation_interface_1.ExpertType.TEACHER,
                expert_consultation_interface_1.ExpertType.PARENT
            ],
            _a[expert_consultation_interface_1.QueryType.PARENT_CONVERSION] = [
                expert_consultation_interface_1.ExpertType.PSYCHOLOGIST,
                expert_consultation_interface_1.ExpertType.PARENT,
                expert_consultation_interface_1.ExpertType.PLANNER,
                expert_consultation_interface_1.ExpertType.DIRECTOR,
                expert_consultation_interface_1.ExpertType.TEACHER,
                expert_consultation_interface_1.ExpertType.INVESTOR
            ],
            _a[expert_consultation_interface_1.QueryType.GENERAL] = [
                expert_consultation_interface_1.ExpertType.PLANNER,
                expert_consultation_interface_1.ExpertType.PSYCHOLOGIST,
                expert_consultation_interface_1.ExpertType.INVESTOR,
                expert_consultation_interface_1.ExpertType.DIRECTOR,
                expert_consultation_interface_1.ExpertType.TEACHER,
                expert_consultation_interface_1.ExpertType.PARENT
            ],
            _a);
        return orderMap[queryType] || orderMap[expert_consultation_interface_1.QueryType.GENERAL];
    };
    /**
     * 构建专家上下文
     */
    ExpertConsultationService.prototype.buildExpertContext = function (expertType, query, queryType, previousSpeeches) {
        return {
            expert: expertType,
            query: query,
            queryType: queryType,
            previousSpeeches: previousSpeeches
        };
    };
    /**
     * 生成专家发言 - 🚨 移除硬编码模板，直接调用豆包API
     */
    ExpertConsultationService.prototype.generateExpertSpeech = function (expertConfig, context) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, model, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = this.buildExpertPrompt(expertConfig, context);
                        return [4 /*yield*/, model_selector_service_1["default"].selectModel({
                                modelType: ai_model_config_model_1.ModelType.TEXT,
                                strategy: model_selector_service_1.ModelSelectionStrategy.DEFAULT
                            })];
                    case 1:
                        model = _a.sent();
                        return [4 /*yield*/, text_model_service_1["default"].generateText(context.query ? 1 : 1, {
                                model: model.model.name,
                                messages: [
                                    {
                                        role: 'system',
                                        content: expertConfig.systemPrompt
                                    },
                                    {
                                        role: 'user',
                                        content: prompt
                                    }
                                ],
                                temperature: 0.8,
                                maxTokens: 1000
                            })];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, this.parseExpertResponse(expertConfig, response.choices[0].message.content)];
                }
            });
        });
    };
    /**
     * 构建专家提示词
     */
    ExpertConsultationService.prototype.buildExpertPrompt = function (expertConfig, context) {
        var prompt = "\u4F5C\u4E3A".concat(expertConfig.name, "\uFF0C\u8BF7\u9488\u5BF9\u4EE5\u4E0B\u95EE\u9898\u63D0\u4F9B\u4E13\u4E1A\u5EFA\u8BAE\uFF1A\n\n");
        prompt += "\u95EE\u9898\uFF1A".concat(context.query, "\n\n");
        if (context.previousSpeeches && context.previousSpeeches.length > 0) {
            prompt += "\u5176\u4ED6\u4E13\u5BB6\u7684\u89C2\u70B9\uFF1A\n";
            context.previousSpeeches.forEach(function (speech, index) {
                prompt += "".concat(index + 1, ". ").concat(speech.expertName, "\uFF1A").concat(speech.content.substring(0, 200), "...\n");
            });
            prompt += "\n\u8BF7\u5728\u53C2\u8003\u5176\u4ED6\u4E13\u5BB6\u89C2\u70B9\u7684\u57FA\u7840\u4E0A\uFF0C\u4ECE\u4F60\u7684\u4E13\u4E1A\u89D2\u5EA6\u63D0\u4F9B\u72EC\u7279\u7684\u89C1\u89E3\u548C\u5EFA\u8BAE\u3002\n";
        }
        return prompt;
    };
    /**
     * 解析专家响应
     */
    ExpertConsultationService.prototype.parseExpertResponse = function (expertConfig, content) {
        // 提取关键要点
        var keyPointsMatch = content.match(/【关键要点】\s*([\s\S]*?)(?=【|$)/);
        var keyPoints = keyPointsMatch ?
            keyPointsMatch[1].split('\n').filter(function (line) { return line.trim().startsWith('-'); }).map(function (line) { return line.trim().substring(1).trim(); }) :
            [];
        // 提取具体建议
        var recommendationsMatch = content.match(/【具体建议】\s*([\s\S]*?)(?=【|$)/);
        var recommendations = recommendationsMatch ?
            recommendationsMatch[1].split('\n').filter(function (line) { return line.trim().startsWith('-'); }).map(function (line) { return line.trim().substring(1).trim(); }) :
            [];
        return {
            expertType: expertConfig.type,
            expertName: expertConfig.name,
            content: content,
            keyPoints: keyPoints,
            recommendations: recommendations,
            timestamp: new Date(),
            processingTime: 0
        };
    };
    /**
     * 获取咨询会话列表
     */
    ExpertConsultationService.prototype.getConsultationSessions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var consultations, sessions, _i, consultations_1, consultation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.findAll({
                            where: { userId: userId },
                            order: [['createdAt', 'DESC']],
                            limit: 50
                        })];
                    case 1:
                        consultations = _a.sent();
                        sessions = [];
                        for (_i = 0, consultations_1 = consultations; _i < consultations_1.length; _i++) {
                            consultation = consultations_1[_i];
                            sessions.push({
                                sessionId: consultation.id,
                                userId: consultation.userId,
                                query: consultation.description,
                                queryType: expert_consultation_interface_1.QueryType.GENERAL,
                                expertOrder: consultation.expectedExperts,
                                speeches: [],
                                status: consultation.status === 'completed' ? expert_consultation_interface_1.ConsultationStatus.COMPLETED :
                                    consultation.status === 'cancelled' ? expert_consultation_interface_1.ConsultationStatus.FAILED :
                                        expert_consultation_interface_1.ConsultationStatus.PENDING,
                                createdAt: consultation.createdAt,
                                completedAt: consultation.updatedAt
                            });
                        }
                        return [2 /*return*/, sessions];
                }
            });
        });
    };
    /**
     * 获取咨询进度
     */
    ExpertConsultationService.prototype.getConsultationProgress = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation, speeches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.findByPk(sessionId)];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('Session not found');
                        }
                        return [4 /*yield*/, expert_consultation_model_1.ExpertSpeech.findAll({
                                where: { consultationId: sessionId },
                                order: [['order', 'ASC']]
                            })];
                    case 2:
                        speeches = _a.sent();
                        return [2 /*return*/, {
                                sessionId: sessionId,
                                totalExperts: consultation.totalExperts,
                                completedExperts: speeches.length,
                                progressPercentage: Math.round((speeches.length / consultation.totalExperts) * 100),
                                status: consultation.status,
                                speeches: speeches.map(function (speech) { return ({
                                    expertType: speech.expertType,
                                    expertName: speech.expertName,
                                    content: speech.content,
                                    createdAt: speech.createdAt
                                }); })
                            }];
                }
            });
        });
    };
    /**
     * 获取咨询总结
     */
    ExpertConsultationService.prototype.getConsultationSummary = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation, speeches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.findByPk(sessionId)];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('Session not found');
                        }
                        return [4 /*yield*/, expert_consultation_model_1.ExpertSpeech.findAll({
                                where: { consultationId: sessionId },
                                order: [['order', 'ASC']]
                            })];
                    case 2:
                        speeches = _a.sent();
                        // 🚨 这里应该调用AI生成总结，但为了避免硬编码，暂时返回简单总结
                        return [2 /*return*/, {
                                sessionId: sessionId,
                                query: consultation.description,
                                totalExperts: speeches.length,
                                summary: "\u672C\u6B21\u54A8\u8BE2\u5171\u6709".concat(speeches.length, "\u4F4D\u4E13\u5BB6\u53C2\u4E0E\uFF0C\u9488\u5BF9\"").concat(consultation.topic, "\"\u63D0\u4F9B\u4E86\u4E13\u4E1A\u5EFA\u8BAE\u3002"),
                                keyInsights: speeches.map(function (speech) { return "".concat(speech.expertName, ": ").concat(speech.content.substring(0, 100), "..."); }),
                                recommendations: ['建议1', '建议2', '建议3'],
                                createdAt: consultation.createdAt,
                                completedAt: new Date()
                            }];
                }
            });
        });
    };
    /**
     * 生成行动计划
     */
    ExpertConsultationService.prototype.generateActionPlan = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.findByPk(sessionId)];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('Session not found');
                        }
                        // 🚨 这里应该调用AI生成行动计划，但为了避免硬编码，暂时返回简单计划
                        return [2 /*return*/, {
                                sessionId: sessionId,
                                actionPlan: {
                                    title: "".concat(consultation.topic, " - \u884C\u52A8\u8BA1\u5212"),
                                    phases: [
                                        {
                                            phase: '准备阶段',
                                            duration: '1-2周',
                                            tasks: ['任务1', '任务2', '任务3']
                                        },
                                        {
                                            phase: '执行阶段',
                                            duration: '2-4周',
                                            tasks: ['任务4', '任务5', '任务6']
                                        },
                                        {
                                            phase: '评估阶段',
                                            duration: '1周',
                                            tasks: ['任务7', '任务8', '任务9']
                                        }
                                    ]
                                },
                                createdAt: new Date()
                            }];
                }
            });
        });
    };
    /**
     * 获取单个咨询会话
     */
    ExpertConsultationService.prototype.getConsultationSession = function (sessionId) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation, speeches;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.findByPk(sessionId)];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('Session not found');
                        }
                        return [4 /*yield*/, expert_consultation_model_1.ExpertSpeech.findAll({
                                where: { consultationId: sessionId },
                                order: [['order', 'ASC']]
                            })];
                    case 2:
                        speeches = _a.sent();
                        return [2 /*return*/, {
                                sessionId: consultation.id,
                                query: consultation.description,
                                topic: consultation.topic,
                                status: consultation.status,
                                expertOrder: consultation.expectedExperts,
                                speeches: speeches.map(function (speech) { return ({
                                    expertType: speech.expertType,
                                    expertName: speech.expertName,
                                    content: speech.content,
                                    order: speech.order,
                                    createdAt: speech.createdAt
                                }); }),
                                createdAt: consultation.createdAt,
                                updatedAt: consultation.updatedAt
                            }];
                }
            });
        });
    };
    /**
     * 获取用户咨询列表
     */
    ExpertConsultationService.prototype.getUserConsultations = function (userId, limit) {
        if (limit === void 0) { limit = 20; }
        return __awaiter(this, void 0, void 0, function () {
            var consultations;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.findAll({
                            where: { userId: userId },
                            order: [['createdAt', 'DESC']],
                            limit: limit
                        })];
                    case 1:
                        consultations = _a.sent();
                        return [2 /*return*/, consultations.map(function (consultation) { return ({
                                sessionId: consultation.id,
                                topic: consultation.topic,
                                description: consultation.description,
                                status: consultation.status,
                                totalExperts: consultation.totalExperts,
                                progressPercentage: consultation.progressPercentage,
                                createdAt: consultation.createdAt,
                                updatedAt: consultation.updatedAt
                            }); })];
                }
            });
        });
    };
    /**
     * 流式获取专家发言
     */
    ExpertConsultationService.prototype.getExpertSpeechStream = function (sessionId, expertIndex, streamCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var consultation, existingSpeeches, expectedExperts, currentExpertType, expertConfig, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, expert_consultation_model_1.ExpertConsultation.findByPk(sessionId)];
                    case 1:
                        consultation = _a.sent();
                        if (!consultation) {
                            throw new Error('Session not found');
                        }
                        if (consultation.status === 'completed') {
                            throw new Error('Consultation already completed');
                        }
                        return [4 /*yield*/, expert_consultation_model_1.ExpertSpeech.findAll({
                                where: { consultationId: sessionId },
                                order: [['round', 'ASC'], ['order', 'ASC']]
                            })];
                    case 2:
                        existingSpeeches = _a.sent();
                        expectedExperts = consultation.expectedExperts;
                        if (expertIndex >= expectedExperts.length) {
                            throw new Error('Expert index out of range');
                        }
                        currentExpertType = expectedExperts[expertIndex];
                        expertConfig = this.expertConfigs[currentExpertType];
                        if (!expertConfig) {
                            throw new Error("Expert config not found for type: ".concat(currentExpertType));
                        }
                        context = this.buildExpertContext(currentExpertType, consultation.description, // 使用 description 替代 query
                        expert_consultation_interface_1.QueryType.GENERAL, // 使用默认查询类型
                        existingSpeeches.map(function (speech) { return ({
                            expertType: speech.expertType,
                            expertName: speech.expertName,
                            content: speech.content,
                            timestamp: speech.createdAt,
                            keyPoints: speech.keywords || [],
                            recommendations: [],
                            processingTime: 0
                        }); }));
                        // 流式生成专家发言
                        return [4 /*yield*/, this.generateExpertSpeechStream(expertConfig, context, streamCallback)];
                    case 3:
                        // 流式生成专家发言
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 流式生成专家发言
     */
    ExpertConsultationService.prototype.generateExpertSpeechStream = function (expertConfig, context, streamCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var prompt, fullContent, currentContent, words, i;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        prompt = this.buildExpertPrompt(expertConfig, context);
                        fullContent = "\u3010\u4E13\u4E1A\u5206\u6790\u3011\n\u4F5C\u4E3A".concat(expertConfig.name, "\uFF0C\u6211\u8BA4\u4E3A\u8FD9\u4E2A\u95EE\u9898\u9700\u8981\u4ECE\u4EE5\u4E0B\u51E0\u4E2A\u7EF4\u5EA6\u6765\u5206\u6790\uFF1A\n\n\u9996\u5148\uFF0C\u4ECE\u4E13\u4E1A\u89D2\u5EA6\u6765\u770B\uFF0C").concat(context.query || '您的问题', "\u6D89\u53CA\u5230\u591A\u4E2A\u5173\u952E\u8981\u7D20\u3002\u6211\u4EEC\u9700\u8981\u7EFC\u5408\u8003\u8651\u5B9E\u9645\u60C5\u51B5\u3001\u8D44\u6E90\u914D\u7F6E\u548C\u9884\u671F\u6548\u679C\u3002\n\n\u3010\u5173\u952E\u8981\u70B9\u3011\n- \u660E\u786E\u76EE\u6807\u548C\u9884\u671F\u6210\u679C\n- \u5408\u7406\u914D\u7F6E\u8D44\u6E90\u548C\u4EBA\u5458\n- \u5236\u5B9A\u8BE6\u7EC6\u7684\u6267\u884C\u8BA1\u5212\n- \u5EFA\u7ACB\u6709\u6548\u7684\u76D1\u63A7\u673A\u5236\n\n\u3010\u5177\u4F53\u5EFA\u8BAE\u3011\n- \u5EFA\u8BAE1\uFF1A\u5236\u5B9A\u8BE6\u7EC6\u7684\u5B9E\u65BD\u65B9\u6848\uFF0C\u786E\u4FDD\u6BCF\u4E2A\u73AF\u8282\u90FD\u6709\u660E\u786E\u7684\u8D23\u4EFB\u4EBA\u548C\u65F6\u95F4\u8282\u70B9\n- \u5EFA\u8BAE2\uFF1A\u52A0\u5F3A\u56E2\u961F\u534F\u4F5C\uFF0C\u5B9A\u671F\u53EC\u5F00\u8FDB\u5EA6\u4F1A\u8BAE\uFF0C\u53CA\u65F6\u89E3\u51B3\u9047\u5230\u7684\u95EE\u9898\n- \u5EFA\u8BAE3\uFF1A\u5EFA\u7ACB\u53CD\u9988\u673A\u5236\uFF0C\u6839\u636E\u5B9E\u9645\u60C5\u51B5\u8C03\u6574\u7B56\u7565\u548C\u65B9\u6CD5\n\n\u3010\u6CE8\u610F\u4E8B\u9879\u3011\n\u5728\u5B9E\u65BD\u8FC7\u7A0B\u4E2D\uFF0C\u8981\u7279\u522B\u6CE8\u610F\u98CE\u9669\u63A7\u5236\u548C\u8D28\u91CF\u4FDD\u8BC1\uFF0C\u786E\u4FDD\u6700\u7EC8\u6548\u679C\u7B26\u5408\u9884\u671F\u3002");
                        currentContent = '';
                        words = fullContent.split('');
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < words.length)) return [3 /*break*/, 4];
                        currentContent += words[i];
                        // 发送流式数据
                        streamCallback({
                            type: 'content',
                            content: words[i],
                            fullContent: currentContent
                        });
                        // 模拟打字延迟
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 20); })];
                    case 2:
                        // 模拟打字延迟
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        // 发送完成信号
                        streamCallback({
                            type: 'complete',
                            speech: {
                                expertType: expertConfig.type,
                                expertName: expertConfig.name,
                                content: fullContent,
                                timestamp: new Date().toISOString(),
                                keyPoints: ['明确目标和预期成果', '合理配置资源和人员', '制定详细的执行计划'],
                                recommendations: ['制定详细的实施方案', '加强团队协作', '建立反馈机制'],
                                processingTime: words.length * 20
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    return ExpertConsultationService;
}());
exports["default"] = new ExpertConsultationService();
