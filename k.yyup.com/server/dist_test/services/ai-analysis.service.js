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
exports.AIAnalysisService = void 0;
var ai_model_config_model_1 = require("../models/ai-model-config.model");
var ai_bridge_service_1 = require("./ai/bridge/ai-bridge.service");
/**
 * AI分析服务
 * 基于豆包1.6模型进行智能分析
 */
var AIAnalysisService = /** @class */ (function () {
    function AIAnalysisService() {
    }
    /**
     * 使用豆包模型进行分析
     */
    AIAnalysisService.prototype.analyzeWithDoubao = function (prompt, options, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var modelName, messages, requestBody, aiBridgeMessages, response, content, parsedContent, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        modelName = 'doubao-seed-1-6-thinking-250615';
                        messages = [
                            {
                                role: 'system',
                                content: "\u4F60\u662F\u4E00\u4E2A\u4E13\u4E1A\u7684\u5E7C\u513F\u56ED\u6570\u636E\u5206\u6790\u4E13\u5BB6\uFF0C\u5177\u6709\u4E30\u5BCC\u7684\u6559\u80B2\u884C\u4E1A\u7ECF\u9A8C\u548C\u6570\u636E\u5206\u6790\u80FD\u529B\u3002\n\u4F60\u9700\u8981\u57FA\u4E8E\u63D0\u4F9B\u7684\u771F\u5B9E\u6570\u636E\u8FDB\u884C\u6DF1\u5EA6\u5206\u6790\uFF0C\u5E76\u63D0\u4F9B\u4E13\u4E1A\u3001\u5B9E\u7528\u7684\u6D1E\u5BDF\u548C\u5EFA\u8BAE\u3002\n\n\u5206\u6790\u7C7B\u578B\uFF1A".concat(options.type, "\n\u4E1A\u52A1\u4E0A\u4E0B\u6587\uFF1A").concat(options.context, "\n\n").concat(options.requireStructured ? "\n\u8BF7\u4E25\u683C\u6309\u7167\u4EE5\u4E0BJSON\u683C\u5F0F\u8FD4\u56DE\u5206\u6790\u7ED3\u679C\uFF1A\n{\n  \"summary\": \"\u5206\u6790\u6458\u8981\",\n  \"insights\": [\n    {\n      \"title\": \"\u6D1E\u5BDF\u6807\u9898\",\n      \"description\": \"\u8BE6\u7EC6\u63CF\u8FF0\",\n      \"importance\": \"high|medium|low\",\n      \"category\": \"trend|risk|opportunity|recommendation\"\n    }\n  ],\n  \"trends\": {\n    \"direction\": \"\u4E0A\u5347|\u4E0B\u964D|\u7A33\u5B9A\",\n    \"confidence\": \"\u9AD8|\u4E2D|\u4F4E\",\n    \"factors\": [\"\u5F71\u54CD\u56E0\u7D201\", \"\u5F71\u54CD\u56E0\u7D202\"]\n  },\n  \"recommendations\": [\n    {\n      \"action\": \"\u5EFA\u8BAE\u884C\u52A8\",\n      \"priority\": \"high|medium|low\",\n      \"timeline\": \"\u77ED\u671F|\u4E2D\u671F|\u957F\u671F\",\n      \"expectedImpact\": \"\u9884\u671F\u5F71\u54CD\"\n    }\n  ],\n  \"risks\": [\n    {\n      \"risk\": \"\u98CE\u9669\u63CF\u8FF0\",\n      \"probability\": \"\u9AD8|\u4E2D|\u4F4E\",\n      \"impact\": \"\u9AD8|\u4E2D|\u4F4E\",\n      \"mitigation\": \"\u7F13\u89E3\u63AA\u65BD\"\n    }\n  ],\n  \"metrics\": {\n    \"key_indicators\": {},\n    \"benchmarks\": {},\n    \"targets\": {}\n  }\n}\n" : '请提供详细的分析报告，包含数据洞察、趋势分析、风险评估和改进建议。')
                            },
                            {
                                role: 'user',
                                content: prompt
                            }
                        ];
                        requestBody = {
                            model: modelName,
                            messages: messages,
                            temperature: 0.7,
                            max_tokens: 4000,
                            top_p: 0.9,
                            frequency_penalty: 0,
                            presence_penalty: 0,
                            stream: true // 不使用Function Call时使用流式输出
                        };
                        console.log('🤖 调用豆包1.6模型进行AI分析...');
                        console.log('📤 请求参数:', JSON.stringify(requestBody, null, 2));
                        aiBridgeMessages = requestBody.messages.map(function (msg) { return ({
                            role: msg.role,
                            content: msg.content
                        }); });
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: modelName,
                                messages: aiBridgeMessages,
                                temperature: requestBody.temperature,
                                max_tokens: requestBody.max_tokens,
                                top_p: requestBody.top_p,
                                frequency_penalty: requestBody.frequency_penalty,
                                presence_penalty: requestBody.presence_penalty,
                                stream: false // 改为非流式，便于处理响应
                            }, undefined, userId)];
                    case 1:
                        response = _a.sent();
                        console.log('📥 豆包模型响应成功');
                        if (response && response.choices && response.choices[0]) {
                            content = response.choices[0].message.content;
                            console.log('✅ 豆包分析完成，内容长度:', content.length);
                            // 4. 解析结构化响应
                            if (options.requireStructured) {
                                try {
                                    parsedContent = this.parseStructuredResponse(content);
                                    return [2 /*return*/, parsedContent];
                                }
                                catch (parseError) {
                                    console.warn('⚠️ 结构化解析失败，返回原始内容:', parseError);
                                    return [2 /*return*/, {
                                            summary: '分析完成',
                                            content: content,
                                            raw: true
                                        }];
                                }
                            }
                            return [2 /*return*/, {
                                    summary: '分析完成',
                                    content: content,
                                    usage: response.usage
                                }];
                        }
                        else {
                            throw new Error('豆包模型响应格式异常');
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ 豆包AI分析失败:', error_1);
                        console.warn('🔄 AI服务不可用，生成fallback响应...');
                        // 直接在服务层生成fallback响应，避免向上抛出错误
                        return [2 /*return*/, this.generateServiceFallbackResponse(options)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成服务级fallback响应
     * @param options 分析选项
     * @returns fallback分析结果
     */
    AIAnalysisService.prototype.generateServiceFallbackResponse = function (options) {
        var analysisType = options.type || 'general';
        console.log('✅ 生成fallback响应，类型:', analysisType);
        switch (analysisType) {
            case 'enrollment_trends':
                return {
                    summary: '基于现有数据进行基础招生趋势分析。由于AI分析服务暂时不可用，提供基础分析结果。',
                    insights: [
                        {
                            title: '招生数据概览',
                            description: '当前数据显示一定的招生活动，建议持续跟踪和分析',
                            importance: 'high',
                            category: 'trend'
                        },
                        {
                            title: '数据收集建议',
                            description: '建议完善数据收集机制，以便进行更准确的趋势分析',
                            importance: 'medium',
                            category: 'recommendation'
                        }
                    ],
                    trends: {
                        direction: '稳定',
                        confidence: '中',
                        factors: ['数据量有限', '需要更多历史数据']
                    },
                    recommendations: [
                        {
                            action: '建立完善的招生数据跟踪体系',
                            priority: 'high',
                            timeline: '短期',
                            expectedImpact: '提高数据分析准确性'
                        }
                    ],
                    risks: [
                        {
                            risk: '数据不足导致分析偏差',
                            probability: '中',
                            impact: '中',
                            mitigation: '扩充数据来源，定期数据质量检查'
                        }
                    ],
                    metrics: {
                        key_indicators: { '数据覆盖度': '基础' },
                        benchmarks: { '行业标准': '待对比' },
                        targets: { '数据完整度目标': '90%+' }
                    },
                    fallback: true
                };
            case 'activity_effectiveness':
                return {
                    summary: '基于现有活动数据进行效果评估。由于AI分析服务暂时不可用，提供基础分析结果。',
                    insights: [
                        {
                            title: '活动开展情况',
                            description: '活动管理体系正在运行，建议建立效果评估机制',
                            importance: 'high',
                            category: 'recommendation'
                        }
                    ],
                    trends: {
                        direction: '稳定',
                        confidence: '中',
                        factors: ['活动数据待完善', '评估体系待建立']
                    },
                    recommendations: [
                        {
                            action: '建立活动效果评估体系',
                            priority: 'high',
                            timeline: '短期',
                            expectedImpact: '提升活动质量和参与度'
                        }
                    ],
                    risks: [
                        {
                            risk: '活动效果难以量化',
                            probability: '中',
                            impact: '中',
                            mitigation: '建立标准化的活动评估指标'
                        }
                    ],
                    metrics: {
                        key_indicators: { '活动评估': '待建立' },
                        benchmarks: { '参与度标准': '待制定' },
                        targets: { '活动满意度': '85%+' }
                    },
                    fallback: true
                };
            case 'performance_prediction':
                return {
                    summary: '基于基础数据进行绩效分析。由于AI分析服务暂时不可用，提供基础分析框架。',
                    insights: [
                        {
                            title: '绩效管理体系',
                            description: '建议建立完整的绩效评估和预测体系',
                            importance: 'high',
                            category: 'recommendation'
                        }
                    ],
                    trends: {
                        direction: '稳定',
                        confidence: '低',
                        factors: ['缺少历史绩效数据', '评估标准待完善']
                    },
                    recommendations: [
                        {
                            action: '建立绩效评估标准和流程',
                            priority: 'high',
                            timeline: '中期',
                            expectedImpact: '改善整体绩效管理'
                        }
                    ],
                    risks: [
                        {
                            risk: '绩效评估标准不统一',
                            probability: '高',
                            impact: '中',
                            mitigation: '制定标准化绩效评估体系'
                        }
                    ],
                    metrics: {
                        key_indicators: { '绩效覆盖率': '待统计' },
                        benchmarks: { '行业标准': '待建立' },
                        targets: { '评估完成度': '100%' }
                    },
                    fallback: true
                };
            case 'risk_assessment':
                return {
                    summary: '基于风险管理最佳实践进行评估。由于AI分析服务暂时不可用，提供基础风险分析框架。',
                    insights: [
                        {
                            title: '风险管理重要性',
                            description: '建议建立全面的风险识别和管理体系',
                            importance: 'high',
                            category: 'recommendation'
                        }
                    ],
                    trends: {
                        direction: '稳定',
                        confidence: '中',
                        factors: ['基础风险控制措施', '定期评估机制']
                    },
                    recommendations: [
                        {
                            action: '完善风险识别和预警机制',
                            priority: 'high',
                            timeline: '短期',
                            expectedImpact: '降低运营风险'
                        }
                    ],
                    risks: [
                        {
                            risk: '运营风险',
                            probability: '中',
                            impact: '中',
                            mitigation: '建立风险监控和应急预案'
                        },
                        {
                            risk: '数据安全风险',
                            probability: '低',
                            impact: '高',
                            mitigation: '加强数据安全防护措施'
                        }
                    ],
                    metrics: {
                        key_indicators: { '风险控制率': '85%' },
                        benchmarks: { '行业风险标准': '<5%' },
                        targets: { '风险控制目标': '>90%' }
                    },
                    fallback: true
                };
            default:
                return {
                    summary: '由于AI分析服务暂时不可用，提供基础分析结果。',
                    insights: [
                        {
                            title: '服务状态',
                            description: 'AI分析服务正在恢复中，请稍后重试或查看基础分析结果',
                            importance: 'medium',
                            category: 'info'
                        }
                    ],
                    trends: {
                        direction: '稳定',
                        confidence: '低',
                        factors: ['服务不可用', '数据有限']
                    },
                    recommendations: [
                        {
                            action: '稍后重试AI分析功能',
                            priority: 'low',
                            timeline: '短期',
                            expectedImpact: '获得更详细的分析结果'
                        }
                    ],
                    risks: [],
                    metrics: {
                        key_indicators: {},
                        benchmarks: {},
                        targets: {}
                    },
                    fallback: true
                };
        }
    };
    /**
     * 解析结构化响应
     */
    AIAnalysisService.prototype.parseStructuredResponse = function (content) {
        try {
            // 尝试提取JSON内容
            var jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            // 如果没有找到JSON，尝试解析markdown格式的结构化内容
            return this.parseMarkdownStructure(content);
        }
        catch (error) {
            console.warn('JSON解析失败，尝试文本解析:', error);
            return this.parseTextStructure(content);
        }
    };
    /**
     * 解析Markdown格式的结构化内容
     */
    AIAnalysisService.prototype.parseMarkdownStructure = function (content) {
        var result = {
            summary: '',
            insights: [],
            trends: {},
            recommendations: [],
            risks: [],
            metrics: {}
        };
        var lines = content.split('\n');
        var currentSection = '';
        var currentItem = {};
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var trimmedLine = line.trim();
            if (trimmedLine.startsWith('# ') || trimmedLine.startsWith('## ')) {
                currentSection = trimmedLine.replace(/^#+\s*/, '').toLowerCase();
                continue;
            }
            if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
                var itemText = trimmedLine.replace(/^[-*]\s*/, '');
                switch (currentSection) {
                    case '洞察':
                    case 'insights':
                        result.insights.push({
                            title: itemText,
                            description: itemText,
                            importance: 'medium',
                            category: 'insight'
                        });
                        break;
                    case '建议':
                    case 'recommendations':
                        result.recommendations.push({
                            action: itemText,
                            priority: 'medium',
                            timeline: '中期',
                            expectedImpact: '待评估'
                        });
                        break;
                    case '风险':
                    case 'risks':
                        result.risks.push({
                            risk: itemText,
                            probability: '中',
                            impact: '中',
                            mitigation: '待制定'
                        });
                        break;
                }
            }
            else if (trimmedLine && !trimmedLine.startsWith('#')) {
                if (!result.summary && currentSection === '') {
                    result.summary = trimmedLine;
                }
            }
        }
        return result;
    };
    /**
     * 解析纯文本结构
     */
    AIAnalysisService.prototype.parseTextStructure = function (content) {
        return {
            summary: content.substring(0, 200) + (content.length > 200 ? '...' : ''),
            content: content,
            insights: [
                {
                    title: '分析完成',
                    description: '已完成数据分析，请查看详细内容',
                    importance: 'medium',
                    category: 'insight'
                }
            ],
            trends: {
                direction: '待分析',
                confidence: '中',
                factors: ['数据分析中']
            },
            recommendations: [
                {
                    action: '查看详细分析报告',
                    priority: 'high',
                    timeline: '即时',
                    expectedImpact: '获得数据洞察'
                }
            ],
            risks: [],
            metrics: {}
        };
    };
    /**
     * 获取分析历史
     */
    AIAnalysisService.prototype.getAnalysisHistory = function (userId, type) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里可以从数据库获取历史分析记录
                // 暂时返回模拟数据
                return [2 /*return*/, [
                        {
                            id: 1,
                            title: '招生趋势分析',
                            type: 'enrollment',
                            summary: '基于过去6个月数据的招生趋势分析',
                            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                            status: 'completed'
                        },
                        {
                            id: 2,
                            title: '活动效果评估',
                            type: 'activity',
                            summary: '幼儿园活动参与度和效果分析',
                            createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                            status: 'completed'
                        }
                    ]];
            });
        });
    };
    /**
     * 导出分析报告
     */
    AIAnalysisService.prototype.exportAnalysisReport = function (analysisId, format) {
        if (format === void 0) { format = 'pdf'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 这里实现报告导出逻辑
                // 返回下载链接
                return [2 /*return*/, "/api/ai/analysis/export/".concat(analysisId, ".").concat(format)];
            });
        });
    };
    /**
     * 验证豆包模型可用性
     */
    AIAnalysisService.prototype.validateDoubaoModel = function () {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var model, testResponse, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, ai_model_config_model_1.AIModelConfig.findOne({
                                where: {
                                    name: 'doubao-seed-1.6-250615',
                                    status: 'active'
                                }
                            })];
                    case 1:
                        model = _d.sent();
                        if (!model) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: model.name,
                                messages: [
                                    {
                                        role: 'user',
                                        content: '测试连接'
                                    }
                                ],
                                temperature: 0.7,
                                max_tokens: (_c = (_b = (_a = model.modelParameters) === null || _a === void 0 ? void 0 : _a.maxTokens) !== null && _b !== void 0 ? _b : model.maxTokens) !== null && _c !== void 0 ? _c : 10,
                                top_p: 0.9,
                                frequency_penalty: 0,
                                presence_penalty: 0,
                                stream: false
                            }, {
                                endpointUrl: model.endpointUrl,
                                apiKey: model.apiKey
                            })];
                    case 2:
                        testResponse = _d.sent();
                        return [2 /*return*/, !!testResponse]; // AIBridgeService成功返回响应即表示连接正常
                    case 3:
                        error_2 = _d.sent();
                        console.error('豆包模型验证失败:', error_2);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AIAnalysisService;
}());
exports.AIAnalysisService = AIAnalysisService;
