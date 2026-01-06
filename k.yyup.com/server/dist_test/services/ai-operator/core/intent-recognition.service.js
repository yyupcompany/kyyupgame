"use strict";
/**
 * 意图识别服务
 * 负责分析用户请求，识别意图和复杂度
 * 支持AI模型集成、缓存机制、准确率优化
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
exports.__esModule = true;
exports.intentRecognitionService = exports.IntentRecognitionService = exports.ToolCapability = exports.TaskComplexity = exports.IntentType = void 0;
var logger_1 = require("../../../utils/logger");
var ai_bridge_service_1 = require("../../ai/bridge/ai-bridge.service");
var ai_model_cache_service_1 = require("../../ai-model-cache.service");
var IntentType;
(function (IntentType) {
    IntentType["NAVIGATION"] = "navigation";
    IntentType["QUERY"] = "query";
    IntentType["OPERATION"] = "operation";
    IntentType["ANALYSIS"] = "analysis";
    IntentType["CREATION"] = "creation";
    IntentType["MODIFICATION"] = "modification";
    IntentType["DELETION"] = "deletion";
    IntentType["CONVERSATION"] = "conversation";
    IntentType["UNKNOWN"] = "unknown";
})(IntentType = exports.IntentType || (exports.IntentType = {}));
var TaskComplexity;
(function (TaskComplexity) {
    TaskComplexity["SIMPLE"] = "simple";
    TaskComplexity["MODERATE"] = "moderate";
    TaskComplexity["COMPLEX"] = "complex";
})(TaskComplexity = exports.TaskComplexity || (exports.TaskComplexity = {}));
var ToolCapability;
(function (ToolCapability) {
    ToolCapability["DATABASE_QUERY"] = "database_query";
    ToolCapability["DATA_ANALYSIS"] = "data_analysis";
    ToolCapability["CHART_GENERATION"] = "chart_generation";
    ToolCapability["NAVIGATION"] = "navigation";
    ToolCapability["FORM_FILLING"] = "form_filling";
    ToolCapability["FILE_OPERATION"] = "file_operation";
    ToolCapability["CALCULATION"] = "calculation";
    ToolCapability["TEXT_PROCESSING"] = "text_processing";
})(ToolCapability = exports.ToolCapability || (exports.ToolCapability = {}));
/**
 * 意图识别服务类
 */
var IntentRecognitionService = /** @class */ (function () {
    function IntentRecognitionService() {
        this.cache = new Map();
        this.CACHE_TIMEOUT = 5 * 60 * 1000; // 5分钟缓存
        this.useAI = false; // 是否启用AI模型
        this.modelCacheService = ai_model_cache_service_1.AIModelCacheService.getInstance();
        logger_1.logger.info('✅ [意图识别] 意图识别服务初始化完成');
    }
    /**
     * 获取单例实例
     */
    IntentRecognitionService.getInstance = function () {
        if (!IntentRecognitionService.instance) {
            IntentRecognitionService.instance = new IntentRecognitionService();
        }
        return IntentRecognitionService.instance;
    };
    /**
     * 启用AI模型
     */
    IntentRecognitionService.prototype.enableAI = function () {
        this.useAI = true;
        logger_1.logger.info('✅ [意图识别] AI模型已启用');
    };
    /**
     * 禁用AI模型
     */
    IntentRecognitionService.prototype.disableAI = function () {
        this.useAI = false;
        logger_1.logger.info('✅ [意图识别] AI模型已禁用');
    };
    /**
     * 识别用户意图
     */
    IntentRecognitionService.prototype.recognizeIntent = function (query, context) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, aiResult, error_1, lowerQuery, intent, complexity, requiredCapabilities, keywords, entities, confidence, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = this.getCacheKey(query, context);
                        cached = this.cache.get(cacheKey);
                        if (cached && Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
                            logger_1.logger.info('✅ [意图识别] 使用缓存结果');
                            return [2 /*return*/, __assign(__assign({}, cached.result), { cacheHit: true })];
                        }
                        if (!this.useAI) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.recognizeIntentWithAI(query, context)];
                    case 2:
                        aiResult = _a.sent();
                        this.cache.set(cacheKey, { result: aiResult, timestamp: Date.now() });
                        return [2 /*return*/, __assign(__assign({}, aiResult), { usedAI: true, cacheHit: false })];
                    case 3:
                        error_1 = _a.sent();
                        logger_1.logger.warn('⚠️ [意图识别] AI识别失败，使用规则识别:', error_1);
                        return [3 /*break*/, 4];
                    case 4:
                        lowerQuery = query.toLowerCase().trim();
                        intent = this.detectIntentType(lowerQuery);
                        complexity = this.evaluateComplexity(lowerQuery, intent);
                        requiredCapabilities = this.identifyRequiredCapabilities(lowerQuery, intent);
                        keywords = this.extractKeywords(lowerQuery);
                        entities = this.extractEntities(lowerQuery);
                        confidence = this.calculateConfidence(intent, keywords, entities);
                        result = {
                            intent: intent,
                            complexity: complexity,
                            requiredCapabilities: requiredCapabilities,
                            confidence: confidence,
                            keywords: keywords,
                            entities: entities,
                            usedAI: false,
                            cacheHit: false
                        };
                        // 缓存结果
                        this.cache.set(cacheKey, { result: result, timestamp: Date.now() });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 使用AI模型识别意图
     */
    IntentRecognitionService.prototype.recognizeIntentWithAI = function (query, context) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var model, systemPrompt, userPrompt, messages, response, content, aiResult;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        logger_1.logger.info('🤖 [意图识别] 使用AI模型识别意图');
                        return [4 /*yield*/, this.modelCacheService.getDefaultModel()];
                    case 1:
                        model = _c.sent();
                        if (!model) {
                            throw new Error('未找到可用的AI模型');
                        }
                        systemPrompt = "\u4F60\u662F\u4E00\u4E2A\u610F\u56FE\u8BC6\u522B\u4E13\u5BB6\u3002\u8BF7\u5206\u6790\u7528\u6237\u7684\u67E5\u8BE2\uFF0C\u8BC6\u522B\u5176\u610F\u56FE\u7C7B\u578B\u3001\u590D\u6742\u5EA6\u548C\u6240\u9700\u80FD\u529B\u3002\n\n\u610F\u56FE\u7C7B\u578B\u5305\u62EC\uFF1A\n- navigation: \u5BFC\u822A\n- query: \u67E5\u8BE2\n- operation: \u64CD\u4F5C\n- analysis: \u5206\u6790\n- creation: \u521B\u5EFA\n- modification: \u4FEE\u6539\n- deletion: \u5220\u9664\n- conversation: \u5BF9\u8BDD\n- unknown: \u672A\u77E5\n\n\u590D\u6742\u5EA6\u5305\u62EC\uFF1A\n- simple: \u7B80\u5355\n- moderate: \u4E2D\u7B49\n- complex: \u590D\u6742\n\n\u8BF7\u4EE5JSON\u683C\u5F0F\u8FD4\u56DE\u7ED3\u679C\uFF0C\u5305\u542B\uFF1Aintent, complexity, requiredCapabilities, confidence, keywords, entities";
                        userPrompt = "\u7528\u6237\u67E5\u8BE2: ".concat(query).concat(context ? "\n\u4E0A\u4E0B\u6587: ".concat(JSON.stringify(context)) : '');
                        messages = [
                            { role: 'system', content: systemPrompt },
                            { role: 'user', content: userPrompt }
                        ];
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.generateChatCompletion({
                                model: model.name,
                                messages: messages,
                                temperature: 0.3,
                                max_tokens: 500
                            }, {
                                endpointUrl: model.endpointUrl,
                                apiKey: model.apiKey
                            })];
                    case 2:
                        response = _c.sent();
                        content = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || '{}';
                        try {
                            aiResult = JSON.parse(content);
                            // 验证和规范化结果
                            return [2 /*return*/, {
                                    intent: aiResult.intent || IntentType.UNKNOWN,
                                    complexity: aiResult.complexity || TaskComplexity.MODERATE,
                                    requiredCapabilities: aiResult.requiredCapabilities || [],
                                    confidence: aiResult.confidence || 0.7,
                                    keywords: aiResult.keywords || [],
                                    entities: aiResult.entities || []
                                }];
                        }
                        catch (error) {
                            logger_1.logger.error('❌ [意图识别] AI结果解析失败:', error);
                            throw new Error('AI识别结果解析失败');
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成缓存键
     */
    IntentRecognitionService.prototype.getCacheKey = function (query, context) {
        var contextStr = context ? JSON.stringify(context) : '';
        return "".concat(query, ":").concat(contextStr);
    };
    /**
     * 检测意图类型
     */
    IntentRecognitionService.prototype.detectIntentType = function (query) {
        // 导航意图
        if (/打开|跳转|进入|导航|前往|访问/.test(query)) {
            return IntentType.NAVIGATION;
        }
        // 查询意图
        if (/查询|查看|显示|列出|统计|多少|有哪些|什么/.test(query)) {
            return IntentType.QUERY;
        }
        // 创建意图
        if (/创建|新建|添加|增加|生成/.test(query)) {
            return IntentType.CREATION;
        }
        // 修改意图
        if (/修改|更新|编辑|改变|调整/.test(query)) {
            return IntentType.MODIFICATION;
        }
        // 删除意图
        if (/删除|移除|清除|取消/.test(query)) {
            return IntentType.DELETION;
        }
        // 分析意图
        if (/分析|对比|比较|趋势|预测/.test(query)) {
            return IntentType.ANALYSIS;
        }
        // 操作意图
        if (/执行|运行|处理|操作/.test(query)) {
            return IntentType.OPERATION;
        }
        // 对话意图（默认）
        if (/你好|谢谢|再见|帮助/.test(query) || query.length < 10) {
            return IntentType.CONVERSATION;
        }
        return IntentType.UNKNOWN;
    };
    /**
     * 评估任务复杂度
     */
    IntentRecognitionService.prototype.evaluateComplexity = function (query, intent) {
        var _a;
        var score = 0;
        // 基于意图的基础分数
        var intentScores = (_a = {},
            _a[IntentType.CONVERSATION] = 1,
            _a[IntentType.QUERY] = 2,
            _a[IntentType.NAVIGATION] = 2,
            _a[IntentType.CREATION] = 3,
            _a[IntentType.MODIFICATION] = 3,
            _a[IntentType.DELETION] = 3,
            _a[IntentType.OPERATION] = 4,
            _a[IntentType.ANALYSIS] = 5,
            _a[IntentType.UNKNOWN] = 2,
            _a);
        score += intentScores[intent] || 2;
        // 基于查询长度
        if (query.length > 100)
            score += 2;
        else if (query.length > 50)
            score += 1;
        // 基于关键词复杂度
        if (/并且|同时|然后|接着|之后/.test(query))
            score += 2; // 多步骤
        if (/所有|全部|批量/.test(query))
            score += 1; // 批量操作
        if (/如果|当|满足|条件/.test(query))
            score += 1; // 条件判断
        // 判断复杂度等级
        if (score <= 3)
            return TaskComplexity.SIMPLE;
        if (score <= 6)
            return TaskComplexity.MODERATE;
        return TaskComplexity.COMPLEX;
    };
    /**
     * 识别所需能力
     */
    IntentRecognitionService.prototype.identifyRequiredCapabilities = function (query, intent) {
        var capabilities = [];
        // 基于意图添加能力
        switch (intent) {
            case IntentType.NAVIGATION:
                capabilities.push(ToolCapability.NAVIGATION);
                break;
            case IntentType.QUERY:
                capabilities.push(ToolCapability.DATABASE_QUERY);
                break;
            case IntentType.ANALYSIS:
                capabilities.push(ToolCapability.DATA_ANALYSIS);
                if (/图表|图形|可视化/.test(query)) {
                    capabilities.push(ToolCapability.CHART_GENERATION);
                }
                break;
            case IntentType.CREATION:
            case IntentType.MODIFICATION:
            case IntentType.DELETION:
                capabilities.push(ToolCapability.DATABASE_QUERY);
                if (/表单|填写/.test(query)) {
                    capabilities.push(ToolCapability.FORM_FILLING);
                }
                break;
        }
        // 基于关键词添加能力
        if (/文件|上传|下载/.test(query)) {
            capabilities.push(ToolCapability.FILE_OPERATION);
        }
        if (/计算|求和|平均|总计/.test(query)) {
            capabilities.push(ToolCapability.CALCULATION);
        }
        if (/文本|内容|描述/.test(query)) {
            capabilities.push(ToolCapability.TEXT_PROCESSING);
        }
        return __spreadArray([], new Set(capabilities), true); // 去重
    };
    /**
     * 提取关键词
     */
    IntentRecognitionService.prototype.extractKeywords = function (query) {
        // 简单的关键词提取（实际应用中可以使用NLP库）
        var stopWords = ['的', '了', '是', '在', '有', '和', '就', '不', '人', '都', '一', '我', '你', '他'];
        var words = query.split(/[\s,，。！？；：、]+/);
        return words
            .filter(function (word) { return word.length > 1 && !stopWords.includes(word); })
            .slice(0, 10); // 最多10个关键词
    };
    /**
     * 提取实体
     */
    IntentRecognitionService.prototype.extractEntities = function (query) {
        var entities = [];
        // 提取数字
        var numbers = query.match(/\d+/g);
        if (numbers) {
            numbers.forEach(function (num) {
                entities.push({ type: 'number', value: parseInt(num) });
            });
        }
        // 提取日期
        var datePatterns = [
            /(\d{4})年(\d{1,2})月(\d{1,2})日/,
            /(\d{4})-(\d{1,2})-(\d{1,2})/,
            /今天|昨天|明天|本周|上周|下周|本月|上月|下月/
        ];
        datePatterns.forEach(function (pattern) {
            var match = query.match(pattern);
            if (match) {
                entities.push({ type: 'date', value: match[0] });
            }
        });
        return entities;
    };
    /**
     * 计算置信度
     */
    IntentRecognitionService.prototype.calculateConfidence = function (intent, keywords, entities) {
        var confidence = 0.5; // 基础置信度
        // 意图明确性
        if (intent !== IntentType.UNKNOWN) {
            confidence += 0.2;
        }
        // 关键词数量
        if (keywords.length > 0) {
            confidence += Math.min(keywords.length * 0.05, 0.2);
        }
        // 实体数量
        if (entities.length > 0) {
            confidence += Math.min(entities.length * 0.05, 0.1);
        }
        return Math.min(confidence, 1.0);
    };
    /**
     * 判断是否需要工具调用
     */
    IntentRecognitionService.prototype.requiresTools = function (analysis) {
        // 简单对话不需要工具
        if (analysis.intent === IntentType.CONVERSATION && analysis.complexity === TaskComplexity.SIMPLE) {
            return false;
        }
        // 有明确能力需求的需要工具
        if (analysis.requiredCapabilities.length > 0) {
            return true;
        }
        // 复杂任务需要工具
        if (analysis.complexity === TaskComplexity.COMPLEX) {
            return true;
        }
        return false;
    };
    /**
     * 清理过期缓存
     */
    IntentRecognitionService.prototype.cleanupExpiredCache = function () {
        var now = Date.now();
        var cleaned = 0;
        for (var _i = 0, _a = this.cache.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (now - value.timestamp > this.CACHE_TIMEOUT) {
                this.cache["delete"](key);
                cleaned++;
            }
        }
        if (cleaned > 0) {
            logger_1.logger.info("\uD83E\uDDF9 [\u610F\u56FE\u8BC6\u522B] \u6E05\u7406\u4E86 ".concat(cleaned, " \u4E2A\u8FC7\u671F\u7F13\u5B58"));
        }
        return cleaned;
    };
    /**
     * 清空所有缓存
     */
    IntentRecognitionService.prototype.clearAllCache = function () {
        var count = this.cache.size;
        this.cache.clear();
        logger_1.logger.info("\uD83E\uDDF9 [\u610F\u56FE\u8BC6\u522B] \u6E05\u7A7A\u6240\u6709\u7F13\u5B58: ".concat(count, " \u4E2A"));
    };
    /**
     * 获取缓存统计
     */
    IntentRecognitionService.prototype.getCacheStats = function () {
        return {
            size: this.cache.size,
            timeout: this.CACHE_TIMEOUT
        };
    };
    /**
     * 获取服务统计
     */
    IntentRecognitionService.prototype.getStats = function () {
        return {
            cacheSize: this.cache.size,
            aiEnabled: this.useAI
        };
    };
    /**
     * 批量识别意图
     */
    IntentRecognitionService.prototype.recognizeIntentBatch = function (queries, context) {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        logger_1.logger.info("\uD83D\uDD04 [\u610F\u56FE\u8BC6\u522B] \u6279\u91CF\u8BC6\u522B: ".concat(queries.length, " \u4E2A\u67E5\u8BE2"));
                        return [4 /*yield*/, Promise.all(queries.map(function (query) { return _this.recognizeIntent(query, context); }))];
                    case 1:
                        results = _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    /**
     * 验证意图识别结果
     */
    IntentRecognitionService.prototype.validateResult = function (result) {
        // 检查必填字段
        if (!result.intent || !result.complexity) {
            return false;
        }
        // 检查置信度范围
        if (result.confidence < 0 || result.confidence > 1) {
            return false;
        }
        // 检查数组字段
        if (!Array.isArray(result.requiredCapabilities) ||
            !Array.isArray(result.keywords) ||
            !Array.isArray(result.entities)) {
            return false;
        }
        return true;
    };
    return IntentRecognitionService;
}());
exports.IntentRecognitionService = IntentRecognitionService;
// 导出单例
exports.intentRecognitionService = IntentRecognitionService.getInstance();
