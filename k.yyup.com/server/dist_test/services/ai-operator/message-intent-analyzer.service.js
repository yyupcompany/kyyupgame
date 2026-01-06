"use strict";
/**
 * 消息意图分析服务
 * 负责分析用户消息的意图，自动决定是否需要启用工具调用
 * 采用三层分析策略：关键词匹配 → 轻量级模型 → 完整AI分析
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
exports.__esModule = true;
exports.messageIntentAnalyzer = exports.MessageIntentAnalyzerService = void 0;
var logger_1 = require("../../utils/logger");
var intent_recognition_service_1 = require("./core/intent-recognition.service");
/**
 * 意图关键词库
 */
var INTENT_KEYWORDS = {
    greeting: {
        keywords: ['你好', 'hello', 'hi', '早上好', '下午好', '晚上好', '嗨', '你好啊'],
        patterns: [/^(你好|hello|hi|早上好|下午好|晚上好|嗨)[!！。\.\s]*$/i],
        confidence: 0.95,
        requiresTools: false
    },
    query: {
        keywords: ['查询', '查看', '显示', '列出', '有多少', '统计', '多少个', '几个', '有哪些'],
        patterns: [/^(查询|查看|显示|列出|统计).*/, /.*有多少.*/, /.*统计.*$/, /.*几个.*$/],
        confidence: 0.85,
        requiresTools: true,
        tools: ['query_students', 'query_teachers', 'get_statistics']
    },
    operation: {
        keywords: ['创建', '添加', '删除', '修改', '更新', '编辑', '新建', '增加'],
        patterns: [/^(创建|添加|删除|修改|更新|编辑|新建).*/, /.*请(创建|添加|删除).*$/],
        confidence: 0.8,
        requiresTools: true,
        tools: ['create_record', 'update_record', 'delete_record']
    },
    search: {
        keywords: ['搜索', '查找', '搜一下', '找一下', '最新', '新闻'],
        patterns: [/^(搜索|查找|搜一下).*/, /.*最新.*/, /.*新闻.*$/],
        confidence: 0.75,
        requiresTools: true,
        tools: ['web_search']
    },
    analysis: {
        keywords: ['分析', '趋势', '对比', '统计', '报告', '数据', '比较'],
        patterns: [/^(分析|生成.*报告|.*趋势分析).*/, /.*数据分析.*$/, /.*对比.*$/],
        confidence: 0.8,
        requiresTools: true,
        tools: ['analyze_trends', 'generate_report']
    },
    generation: {
        keywords: ['生成', '制作', '生成报告', '生成方案', '制定', '规划'],
        patterns: [/^(生成|制作|制定).*/, /.*生成(报告|方案|计划).*$/],
        confidence: 0.8,
        requiresTools: true,
        tools: ['generate_report', 'create_plan']
    }
};
/**
 * 消息意图分析服务类
 */
var MessageIntentAnalyzerService = /** @class */ (function () {
    function MessageIntentAnalyzerService() {
        this.cache = new Map();
        this.CACHE_TIMEOUT = 5 * 60 * 1000; // 5分钟缓存
        logger_1.logger.info('✅ [消息意图分析] 服务初始化完成');
    }
    /**
     * 获取单例实例
     */
    MessageIntentAnalyzerService.getInstance = function () {
        if (!MessageIntentAnalyzerService.instance) {
            MessageIntentAnalyzerService.instance = new MessageIntentAnalyzerService();
        }
        return MessageIntentAnalyzerService.instance;
    };
    /**
     * 分析消息意图
     */
    MessageIntentAnalyzerService.prototype.analyzeIntent = function (message, context) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, keywordMatch, result, intentResult, analysis, error_1, defaultAnalysis;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = this.getCacheKey(message);
                        cached = this.cache.get(cacheKey);
                        if (cached && Date.now() - cached.timestamp < this.CACHE_TIMEOUT) {
                            logger_1.logger.info('📊 [消息意图分析] 使用缓存结果', { message: message.substring(0, 50) });
                            return [2 /*return*/, __assign(__assign({}, cached.result), { analysisMethod: 'cache' })];
                        }
                        keywordMatch = this.matchKeywords(message);
                        if (keywordMatch && keywordMatch.confidence > 0.8) {
                            logger_1.logger.info('📊 [消息意图分析] 关键词匹配成功', {
                                message: message.substring(0, 50),
                                intent: keywordMatch.intent,
                                confidence: keywordMatch.confidence
                            });
                            result = this.buildAnalysis(keywordMatch, 'keyword');
                            this.cache.set(cacheKey, { result: result, timestamp: Date.now() });
                            return [2 /*return*/, result];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, intent_recognition_service_1.intentRecognitionService.recognizeIntent(message, context)];
                    case 2:
                        intentResult = _a.sent();
                        logger_1.logger.info('📊 [消息意图分析] AI分析完成', {
                            message: message.substring(0, 50),
                            intent: intentResult.intent,
                            confidence: intentResult.confidence,
                            complexity: intentResult.complexity
                        });
                        analysis = this.convertIntentResult(intentResult);
                        this.cache.set(cacheKey, { result: analysis, timestamp: Date.now() });
                        return [2 /*return*/, analysis];
                    case 3:
                        error_1 = _a.sent();
                        logger_1.logger.error('❌ [消息意图分析] AI分析失败，使用默认分析', error_1);
                        defaultAnalysis = {
                            intent: 'query',
                            confidence: 0.5,
                            complexity: 'simple',
                            requiresTools: false,
                            suggestedTools: [],
                            reasoning: '默认分析（AI分析失败）',
                            keywords: [],
                            estimatedTokens: 100,
                            analysisMethod: 'keyword'
                        };
                        this.cache.set(cacheKey, { result: defaultAnalysis, timestamp: Date.now() });
                        return [2 /*return*/, defaultAnalysis];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 关键词匹配
     */
    MessageIntentAnalyzerService.prototype.matchKeywords = function (message) {
        var lowerMessage = message.toLowerCase();
        var bestMatch = null;
        var bestConfidence = 0;
        for (var _i = 0, _a = Object.entries(INTENT_KEYWORDS); _i < _a.length; _i++) {
            var _b = _a[_i], intentName = _b[0], config = _b[1];
            // 检查关键词
            for (var _c = 0, _d = config.keywords; _c < _d.length; _c++) {
                var keyword = _d[_c];
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    if (config.confidence > bestConfidence) {
                        bestMatch = __assign({ intent: intentName }, config);
                        bestConfidence = config.confidence;
                    }
                }
            }
            // 检查正则模式
            for (var _e = 0, _f = config.patterns; _e < _f.length; _e++) {
                var pattern = _f[_e];
                if (pattern.test(message)) {
                    if (config.confidence > bestConfidence) {
                        bestMatch = __assign({ intent: intentName }, config);
                        bestConfidence = config.confidence;
                    }
                }
            }
        }
        return bestMatch;
    };
    /**
     * 构建分析结果
     */
    MessageIntentAnalyzerService.prototype.buildAnalysis = function (match, method) {
        return {
            intent: match.intent,
            confidence: match.confidence,
            complexity: this.estimateComplexity(match.intent),
            requiresTools: match.requiresTools !== false,
            suggestedTools: match.tools || [],
            reasoning: "\u57FA\u4E8E".concat(method === 'keyword' ? '关键词' : 'AI', "\u5339\u914D\u8BC6\u522B\u4E3A").concat(match.intent),
            keywords: match.keywords || [],
            estimatedTokens: 100,
            analysisMethod: method
        };
    };
    /**
     * 转换意图识别结果
     */
    MessageIntentAnalyzerService.prototype.convertIntentResult = function (intentResult) {
        var _a;
        var intentMap = (_a = {},
            _a[intent_recognition_service_1.IntentType.CONVERSATION] = 'greeting',
            _a[intent_recognition_service_1.IntentType.QUERY] = 'query',
            _a[intent_recognition_service_1.IntentType.OPERATION] = 'operation',
            _a[intent_recognition_service_1.IntentType.ANALYSIS] = 'analysis',
            _a[intent_recognition_service_1.IntentType.CREATION] = 'generation',
            _a[intent_recognition_service_1.IntentType.MODIFICATION] = 'operation',
            _a[intent_recognition_service_1.IntentType.DELETION] = 'operation',
            _a[intent_recognition_service_1.IntentType.NAVIGATION] = 'query',
            _a);
        var mappedIntent = intentMap[intentResult.intent] || 'query';
        var requiresTools = intent_recognition_service_1.intentRecognitionService.requiresTools(intentResult);
        return {
            intent: mappedIntent,
            confidence: intentResult.confidence,
            complexity: intentResult.complexity,
            requiresTools: requiresTools,
            suggestedTools: this.mapToolCapabilities(intentResult.requiredCapabilities),
            reasoning: "\u57FA\u4E8EAI\u5206\u6790\u8BC6\u522B\u4E3A".concat(mappedIntent),
            keywords: intentResult.keywords,
            estimatedTokens: 150,
            analysisMethod: 'ai'
        };
    };
    /**
     * 映射工具能力
     */
    MessageIntentAnalyzerService.prototype.mapToolCapabilities = function (capabilities) {
        var toolMap = {
            'database_query': 'query_students',
            'data_analysis': 'analyze_trends',
            'chart_generation': 'generate_report',
            'file_operation': 'file_operation'
        };
        return capabilities
            .map(function (cap) { return toolMap[cap] || cap; })
            .filter(Boolean);
    };
    /**
     * 估计任务复杂度
     */
    MessageIntentAnalyzerService.prototype.estimateComplexity = function (intent) {
        var complexityMap = {
            greeting: 'simple',
            query: 'simple',
            operation: 'moderate',
            search: 'moderate',
            analysis: 'complex',
            generation: 'complex'
        };
        return complexityMap[intent] || 'moderate';
    };
    /**
     * 生成缓存键
     */
    MessageIntentAnalyzerService.prototype.getCacheKey = function (message) {
        return "intent_".concat(message.substring(0, 50));
    };
    /**
     * 清理过期缓存
     */
    MessageIntentAnalyzerService.prototype.cleanupExpiredCache = function () {
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
            logger_1.logger.info("\uD83E\uDDF9 [\u6D88\u606F\u610F\u56FE\u5206\u6790] \u6E05\u7406\u4E86 ".concat(cleaned, " \u4E2A\u8FC7\u671F\u7F13\u5B58"));
        }
        return cleaned;
    };
    /**
     * 获取缓存统计
     */
    MessageIntentAnalyzerService.prototype.getCacheStats = function () {
        return {
            size: this.cache.size,
            timeout: this.CACHE_TIMEOUT
        };
    };
    return MessageIntentAnalyzerService;
}());
exports.MessageIntentAnalyzerService = MessageIntentAnalyzerService;
// 导出单例
exports.messageIntentAnalyzer = MessageIntentAnalyzerService.getInstance();
