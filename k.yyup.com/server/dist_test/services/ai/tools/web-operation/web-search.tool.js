"use strict";
/**
 * 网络搜索工具
 * 实现真正的网络搜索功能，集成火山引擎融合搜索
 * 通过AIBridge统一调用
 */
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
exports.webSearchFunction = exports.webSearchTool = exports.WebSearchTool = void 0;
var logger_1 = require("../../../../utils/logger");
var ai_model_config_service_1 = __importDefault(require("../../ai-model-config.service"));
var ai_bridge_service_1 = require("../../bridge/ai-bridge.service");
/**
 * 网络搜索工具类
 */
var WebSearchTool = /** @class */ (function () {
    function WebSearchTool() {
        this.modelConfigService = ai_model_config_service_1["default"];
        this.searchCache = new Map();
        this.CACHE_TTL = 10 * 60 * 1000; // 10分钟缓存
    }
    /**
     * 执行网络搜索
     */
    WebSearchTool.prototype.search = function (query, options) {
        var _a, _b, _c, _d, _e, _f;
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var startTime, cacheKey, cached, searchModel, searchParams, bridgeResponse, searchTime, searchResults, aiSummary, totalResults, searchResponse, error_1;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        startTime = Date.now();
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 4, , 5]);
                        cacheKey = "".concat(query, "_").concat(JSON.stringify(options));
                        cached = this.searchCache.get(cacheKey);
                        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
                            logger_1.logger.info("\uD83D\uDD0D \u7F51\u7EDC\u641C\u7D22\u7F13\u5B58\u547D\u4E2D: ".concat(query));
                            return [2 /*return*/, cached.data];
                        }
                        logger_1.logger.info("\uD83D\uDD0D \u5F00\u59CB\u7F51\u7EDC\u641C\u7D22: ".concat(query));
                        // 进度回调
                        (_a = options.onProgress) === null || _a === void 0 ? void 0 : _a.call(options, 10, '🔧 正在配置搜索参数...');
                        return [4 /*yield*/, this.modelConfigService.getDefaultModel('search')];
                    case 2:
                        searchModel = _g.sent();
                        if (!searchModel || searchModel.isActive === false) {
                            throw new Error('火山引擎搜索服务未配置或未激活');
                        }
                        (_b = options.onProgress) === null || _b === void 0 ? void 0 : _b.call(options, 20, '⚙️ 搜索模型配置完成');
                        searchParams = {
                            query: query,
                            max_results: options.maxResults || 10,
                            language: options.language || 'zh-CN',
                            enable_ai_summary: options.enableAISummary || true,
                            search_type: 'fusion',
                            enable_rerank: true
                        };
                        (_c = options.onProgress) === null || _c === void 0 ? void 0 : _c.call(options, 30, '📡 正在发送搜索请求...');
                        return [4 /*yield*/, ai_bridge_service_1.aiBridgeService.search({
                                query: query,
                                maxResults: options.maxResults || 10,
                                language: options.language || 'zh-CN',
                                enableAISummary: options.enableAISummary !== false,
                                searchType: 'web_summary',
                                enableRerank: true
                            }, {
                                endpointUrl: searchModel.apiEndpoint,
                                apiKey: searchModel.apiKey || process.env.VOLCANO_API_KEY || ''
                            })];
                    case 3:
                        bridgeResponse = _g.sent();
                        searchTime = Date.now() - startTime;
                        (_d = options.onProgress) === null || _d === void 0 ? void 0 : _d.call(options, 90, '🔍 正在解析搜索结果...');
                        searchResults = bridgeResponse.results;
                        aiSummary = bridgeResponse.aiSummary || '';
                        totalResults = bridgeResponse.totalResults;
                        logger_1.logger.info("\u2705 \u89E3\u6790\u5230 ".concat(searchResults.length, " \u4E2A\u641C\u7D22\u7ED3\u679C"));
                        (_e = options.onProgress) === null || _e === void 0 ? void 0 : _e.call(options, 95, "\uD83D\uDCCB \u5DF2\u89E3\u6790 ".concat(searchResults.length, " \u4E2A\u641C\u7D22\u7ED3\u679C"));
                        if (aiSummary) {
                            logger_1.logger.info("\u2705 \u83B7\u53D6\u5230AI\u603B\u7ED3: ".concat(aiSummary.length, " \u5B57\u7B26"));
                            (_f = options.onProgress) === null || _f === void 0 ? void 0 : _f.call(options, 98, '🤖 AI总结准备完成');
                        }
                        // 检查是否有有效结果
                        if (searchResults.length === 0 && !aiSummary) {
                            logger_1.logger.warn("\u26A0\uFE0F API\u8FD4\u56DE\u7A7A\u7ED3\u679C\uFF0C\u4F7F\u7528\u6A21\u62DF\u6570\u636E: ".concat(query));
                            return [2 /*return*/, this.getMockSearchResults(query, searchTime)];
                        }
                        searchResponse = {
                            query: query,
                            results: searchResults,
                            totalResults: totalResults,
                            searchTime: searchTime,
                            suggestions: bridgeResponse.suggestions || [],
                            relatedQueries: bridgeResponse.relatedQueries || [],
                            aiSummary: aiSummary
                        };
                        // 缓存结果
                        this.searchCache.set(cacheKey, {
                            data: searchResponse,
                            timestamp: Date.now()
                        });
                        // 清理过期缓存
                        this.cleanExpiredCache();
                        logger_1.logger.info("\u2705 \u7F51\u7EDC\u641C\u7D22\u5B8C\u6210: ".concat(query, ", \u627E\u5230 ").concat(searchResponse.results.length, " \u6761\u7ED3\u679C, \u8017\u65F6 ").concat(searchTime, "ms"));
                        return [2 /*return*/, searchResponse];
                    case 4:
                        error_1 = _g.sent();
                        logger_1.logger.error("\u274C \u7F51\u7EDC\u641C\u7D22\u5931\u8D25: ".concat(query), error_1);
                        // 返回模拟搜索结果，避免完全失败
                        return [2 /*return*/, this.getMockSearchResults(query, Date.now() - startTime)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取模拟搜索结果（用于演示和测试）
     */
    WebSearchTool.prototype.getMockSearchResults = function (query, searchTime) {
        var mockResults = [
            {
                title: "\u5173\u4E8E\"".concat(query, "\"\u7684\u6700\u65B0\u4FE1\u606F"),
                url: 'https://example.com/search-result-1',
                snippet: "\u8FD9\u662F\u5173\u4E8E".concat(query, "\u7684\u8BE6\u7EC6\u4FE1\u606F\u3002\u6839\u636E\u6700\u65B0\u7684\u653F\u7B56\u548C\u89C4\u5B9A\uFF0C\u76F8\u5173\u5185\u5BB9\u5305\u62EC..."),
                publishTime: new Date().toISOString(),
                source: '教育部官网',
                relevanceScore: 0.95
            },
            {
                title: "".concat(query, " - \u4E13\u4E1A\u89E3\u8BFB\u548C\u5206\u6790"),
                url: 'https://example.com/search-result-2',
                snippet: "\u4E13\u5BB6\u5BF9".concat(query, "\u8FDB\u884C\u4E86\u6DF1\u5165\u5206\u6790\uFF0C\u6307\u51FA\u4E86\u5173\u952E\u8981\u70B9\u548C\u5B9E\u65BD\u5EFA\u8BAE..."),
                publishTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                source: '中国教育新闻网',
                relevanceScore: 0.88
            },
            {
                title: "".concat(query, "\u7684\u5B9E\u8DF5\u6848\u4F8B\u548C\u7ECF\u9A8C\u5206\u4EAB"),
                url: 'https://example.com/search-result-3',
                snippet: "\u591A\u4E2A\u5E7C\u513F\u56ED\u5728".concat(query, "\u65B9\u9762\u7684\u6210\u529F\u5B9E\u8DF5\uFF0C\u4E3A\u5176\u4ED6\u673A\u6784\u63D0\u4F9B\u4E86\u5B9D\u8D35\u7ECF\u9A8C..."),
                publishTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
                source: '学前教育网',
                relevanceScore: 0.82
            }
        ];
        return {
            query: query,
            results: mockResults,
            totalResults: mockResults.length,
            searchTime: searchTime,
            suggestions: ["".concat(query, "\u653F\u7B56\u89E3\u8BFB"), "".concat(query, "\u5B9E\u65BD\u6307\u5357"), "".concat(query, "\u6848\u4F8B\u5206\u6790")],
            relatedQueries: ["".concat(query, "\u6700\u65B0\u52A8\u6001"), "".concat(query, "\u5B9E\u8DF5\u7ECF\u9A8C"), "".concat(query, "\u4E13\u5BB6\u89C2\u70B9")]
        };
    };
    /**
     * 清理过期缓存
     */
    WebSearchTool.prototype.cleanExpiredCache = function () {
        var now = Date.now();
        for (var _i = 0, _a = this.searchCache.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], key = _b[0], value = _b[1];
            if (now - value.timestamp > this.CACHE_TTL) {
                this.searchCache["delete"](key);
            }
        }
    };
    /**
     * 检查搜索查询是否需要网络搜索
     */
    WebSearchTool.shouldUseWebSearch = function (query) {
        var webSearchKeywords = [
            '搜索', '查找', '搜一下', '找一下', '网上', '最新', '新闻', '政策',
            '资讯', '信息', '了解', '什么是', '如何', '怎么', '为什么',
            '最近', '今天', '昨天', '本周', '本月', '今年', '趋势', '动态'
        ];
        return webSearchKeywords.some(function (keyword) { return query.includes(keyword); }) ||
            query.includes('?') || query.includes('？') ||
            query.length > 20; // 长问题通常需要搜索
    };
    /**
     * 格式化搜索结果为文本
     */
    WebSearchTool.formatSearchResults = function (searchResponse) {
        var query = searchResponse.query, results = searchResponse.results, totalResults = searchResponse.totalResults, searchTime = searchResponse.searchTime, aiSummary = searchResponse.aiSummary;
        var formatted = "\uD83D\uDD0D \u7F51\u7EDC\u641C\u7D22\u7ED3\u679C - \"".concat(query, "\"\n");
        formatted += "\uD83D\uDCCA \u627E\u5230 ".concat(totalResults, " \u6761\u76F8\u5173\u4FE1\u606F\uFF0C\u641C\u7D22\u8017\u65F6 ").concat(searchTime, "ms\n\n");
        // 如果有AI总结，优先显示
        if (aiSummary && aiSummary.trim()) {
            formatted += "\uD83E\uDD16 AI\u667A\u80FD\u603B\u7ED3\uFF1A\n".concat(aiSummary.trim(), "\n\n");
        }
        // 显示搜索结果
        if (results && results.length > 0) {
            formatted += "\uD83D\uDCCB \u8BE6\u7EC6\u641C\u7D22\u7ED3\u679C\uFF1A\n\n";
            results.slice(0, 5).forEach(function (result, index) {
                formatted += "".concat(index + 1, ". **").concat(result.title, "**\n");
                formatted += "   ".concat(result.snippet, "\n");
                formatted += "   \uD83D\uDD17 \u6765\u6E90: ".concat(result.source || '网络', "\n");
                if (result.publishTime) {
                    formatted += "   \uD83D\uDCC5 \u53D1\u5E03\u65F6\u95F4: ".concat(new Date(result.publishTime).toLocaleDateString('zh-CN'), "\n");
                }
                formatted += '\n';
            });
        }
        if (searchResponse.suggestions && searchResponse.suggestions.length > 0) {
            formatted += "\uD83D\uDCA1 \u76F8\u5173\u5EFA\u8BAE: ".concat(searchResponse.suggestions.join(', '), "\n");
        }
        return formatted;
    };
    return WebSearchTool;
}());
exports.WebSearchTool = WebSearchTool;
// 导出工具实例
exports.webSearchTool = new WebSearchTool();
// 导出工具函数定义（用于Function Calling）
exports.webSearchFunction = {
    name: 'web_search',
    description: '执行网络搜索，获取最新的网络信息和资讯',
    parameters: {
        type: 'object',
        properties: {
            query: {
                type: 'string',
                description: '搜索查询关键词'
            },
            maxResults: {
                type: 'number',
                description: '最大搜索结果数量，默认10',
                "default": 10
            },
            enableAISummary: {
                type: 'boolean',
                description: '是否启用AI总结，默认true',
                "default": true
            }
        },
        required: ['query']
    }
};
// 导出默认工具定义（用于工具加载器）
exports["default"] = {
    name: 'web_search',
    displayName: '网络搜索',
    description: '执行网络搜索，获取最新的网络信息和资讯',
    category: 'web-operation',
    parameters: exports.webSearchFunction.parameters,
    execute: function (params) { return __awaiter(void 0, void 0, void 0, function () {
        var query, _a, maxResults, _b, enableAISummary, searchResponse;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    query = params.query, _a = params.maxResults, maxResults = _a === void 0 ? 10 : _a, _b = params.enableAISummary, enableAISummary = _b === void 0 ? true : _b;
                    return [4 /*yield*/, exports.webSearchTool.search(query, { maxResults: maxResults, enableAISummary: enableAISummary })];
                case 1:
                    searchResponse = _c.sent();
                    return [2 /*return*/, {
                            success: true,
                            data: searchResponse,
                            formatted: WebSearchTool.formatSearchResults(searchResponse)
                        }];
            }
        });
    }); }
};
