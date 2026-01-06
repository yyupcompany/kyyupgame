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
var ai_model_usage_model_1 = require("../../models/ai-model-usage.model");
var ai_model_config_model_1 = require("../../models/ai-model-config.model");
var user_model_1 = require("../../models/user.model");
var sequelize_1 = require("sequelize");
var ai_message_model_1 = require("../../models/ai-message.model");
var ai_conversation_model_1 = require("../../models/ai-conversation.model");
/**
 * AI数据分析服务
 * 负责处理数据分析相关的业务逻辑
 */
var AnalyticsService = /** @class */ (function () {
    function AnalyticsService() {
    }
    /**
     * 获取AI使用概览
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 使用概览数据
     */
    AnalyticsService.prototype.getUsageOverview = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var activeUsers, totalConversations, totalMessages, usageStats, stats, totalTokens, totalCost, avgMessagesPerConversation, avgTokensPerMessage;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, user_model_1.User.count({
                            where: {
                                createdAt: (_a = {},
                                    _a[sequelize_1.Op.between] = [startDate, endDate],
                                    _a)
                            }
                        })];
                    case 1:
                        activeUsers = _e.sent();
                        return [4 /*yield*/, ai_conversation_model_1.AIConversation.count({
                                where: {
                                    createdAt: (_b = {},
                                        _b[sequelize_1.Op.between] = [startDate, endDate],
                                        _b)
                                }
                            })];
                    case 2:
                        totalConversations = _e.sent();
                        return [4 /*yield*/, ai_message_model_1.AIMessage.count({
                                where: {
                                    createdAt: (_c = {},
                                        _c[sequelize_1.Op.between] = [startDate, endDate],
                                        _c)
                                }
                            })];
                    case 3:
                        totalMessages = _e.sent();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findAll({
                                where: {
                                    createdAt: (_d = {},
                                        _d[sequelize_1.Op.between] = [startDate, endDate],
                                        _d)
                                },
                                attributes: [
                                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('inputTokens')), 'inputTokens'],
                                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('outputTokens')), 'outputTokens'],
                                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('totalTokens')), 'totalTokens'],
                                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('cost')), 'totalCost'],
                                ],
                                raw: true
                            })];
                    case 4:
                        usageStats = _e.sent();
                        stats = usageStats[0];
                        totalTokens = Number((stats === null || stats === void 0 ? void 0 : stats.totalTokens) || 0);
                        totalCost = Number((stats === null || stats === void 0 ? void 0 : stats.totalCost) || 0);
                        avgMessagesPerConversation = totalConversations > 0
                            ? totalMessages / totalConversations
                            : 0;
                        avgTokensPerMessage = totalMessages > 0
                            ? totalTokens / totalMessages
                            : 0;
                        return [2 /*return*/, {
                                totalUsers: Number(activeUsers),
                                totalConversations: totalConversations,
                                totalMessages: totalMessages,
                                totalTokens: totalTokens,
                                totalCost: totalCost,
                                activeUsersCount: Number(activeUsers),
                                avgMessagesPerConversation: avgMessagesPerConversation,
                                avgTokensPerMessage: avgTokensPerMessage
                            }];
                }
            });
        });
    };
    /**
     * 获取模型使用分布
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 模型使用分布数据
     */
    AnalyticsService.prototype.getModelUsageDistribution = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var distribution, totalTokens;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findAll({
                            where: {
                                createdAt: (_a = {},
                                    _a[sequelize_1.Op.between] = [startDate, endDate],
                                    _a)
                            },
                            include: [
                                {
                                    model: ai_model_config_model_1.AIModelConfig,
                                    as: 'modelConfig',
                                    attributes: ['name']
                                },
                            ],
                            attributes: [
                                'modelId',
                                [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'requestCount'],
                                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('totalTokens')), 'tokenCount'],
                                [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('cost')), 'costAmount'],
                            ],
                            group: ['modelId', 'modelConfig.id'],
                            raw: true
                        })];
                    case 1:
                        distribution = _b.sent();
                        totalTokens = distribution.reduce(function (sum, item) { return sum + Number(item.tokenCount || 0); }, 0);
                        // 格式化并计算百分比
                        return [2 /*return*/, distribution.map(function (item) {
                                var tokenCount = Number(item.tokenCount || 0);
                                var percentage = totalTokens > 0
                                    ? (tokenCount / totalTokens) * 100
                                    : 0;
                                return {
                                    modelId: item.modelId,
                                    modelName: item['modelConfig.name'] || 'Unknown',
                                    requestCount: Number(item.requestCount || 0),
                                    tokenCount: tokenCount,
                                    costAmount: Number(item.costAmount || 0),
                                    percentage: Math.round(percentage * 100) / 100
                                };
                            })];
                }
            });
        });
    };
    /**
     * 获取用户活跃度趋势
     * @param timeRange 时间范围
     * @param limit 限制数量
     * @returns 活跃度趋势数据
     */
    AnalyticsService.prototype.getUserActivityTrend = function (timeRange, limit) {
        if (limit === void 0) { limit = 30; }
        return __awaiter(this, void 0, void 0, function () {
            var trends, i, date;
            return __generator(this, function (_a) {
                trends = [];
                // 返回模拟数据，实际项目中应该实现真实的数据查询
                for (i = 0; i < limit; i++) {
                    date = new Date();
                    date.setDate(date.getDate() - i);
                    trends.push({
                        date: date.toISOString().split('T')[0],
                        value: Math.floor(Math.random() * 100)
                    });
                }
                return [2 /*return*/, trends.reverse()];
            });
        });
    };
    /**
     * 获取特定用户分析
     * @param userId 用户ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 用户分析数据
     */
    AnalyticsService.prototype.getUserAnalytics = function (userId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var conversationCount, messageCount, usageStats, mostUsedModel, stats, totalTokens, totalCost, mostUsedModelInfo, mostUsedModelId, mostUsedModelName, activeTimeDistribution, i;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, ai_conversation_model_1.AIConversation.count({
                            where: {
                                userId: userId,
                                createdAt: (_a = {},
                                    _a[sequelize_1.Op.between] = [startDate, endDate],
                                    _a)
                            }
                        })];
                    case 1:
                        conversationCount = _e.sent();
                        return [4 /*yield*/, ai_message_model_1.AIMessage.count({
                                where: {
                                    userId: userId,
                                    createdAt: (_b = {},
                                        _b[sequelize_1.Op.between] = [startDate, endDate],
                                        _b)
                                }
                            })];
                    case 2:
                        messageCount = _e.sent();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findAll({
                                where: {
                                    userId: userId,
                                    createdAt: (_c = {},
                                        _c[sequelize_1.Op.between] = [startDate, endDate],
                                        _c)
                                },
                                attributes: [
                                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('totalTokens')), 'totalTokens'],
                                    [(0, sequelize_1.fn)('SUM', (0, sequelize_1.col)('cost')), 'totalCost'],
                                ],
                                raw: true
                            })];
                    case 3:
                        usageStats = _e.sent();
                        return [4 /*yield*/, ai_model_usage_model_1.AIModelUsage.findAll({
                                where: {
                                    userId: userId,
                                    createdAt: (_d = {},
                                        _d[sequelize_1.Op.between] = [startDate, endDate],
                                        _d)
                                },
                                include: [
                                    {
                                        model: ai_model_config_model_1.AIModelConfig,
                                        as: 'modelConfig',
                                        attributes: ['name']
                                    },
                                ],
                                attributes: [
                                    'modelId',
                                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'useCount'],
                                ],
                                group: ['modelId', 'modelConfig.id'],
                                order: [[(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'DESC']],
                                limit: 1,
                                raw: true
                            })];
                    case 4:
                        mostUsedModel = _e.sent();
                        stats = usageStats[0];
                        totalTokens = Number((stats === null || stats === void 0 ? void 0 : stats.totalTokens) || 0);
                        totalCost = Number((stats === null || stats === void 0 ? void 0 : stats.totalCost) || 0);
                        mostUsedModelInfo = mostUsedModel[0];
                        mostUsedModelId = (mostUsedModelInfo === null || mostUsedModelInfo === void 0 ? void 0 : mostUsedModelInfo.modelId) || 0;
                        mostUsedModelName = (mostUsedModelInfo === null || mostUsedModelInfo === void 0 ? void 0 : mostUsedModelInfo['modelConfig.name']) || 'Unknown';
                        activeTimeDistribution = {};
                        for (i = 0; i < 24; i++) {
                            activeTimeDistribution[i.toString()] = Math.floor(Math.random() * 10);
                        }
                        return [2 /*return*/, {
                                conversationCount: conversationCount,
                                messageCount: messageCount,
                                totalTokens: totalTokens,
                                totalCost: totalCost,
                                averageResponseTime: 2.5,
                                mostUsedModelId: mostUsedModelId,
                                mostUsedModelName: mostUsedModelName,
                                activeTimeDistribution: activeTimeDistribution
                            }];
                }
            });
        });
    };
    /**
     * 获取内容分析
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 内容分析数据
     */
    AnalyticsService.prototype.getContentAnalytics = function (startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 模拟内容分析数据
                // 实际项目中应该实现真实的内容分析逻辑
                return [2 /*return*/, {
                        averageMessageLength: 250,
                        averageResponseLength: 350,
                        commonTopics: [
                            { topic: '招生信息', count: 150 },
                            { topic: '课程安排', count: 120 },
                            { topic: '学费咨询', count: 100 },
                            { topic: '师资力量', count: 80 },
                            { topic: '入学要求', count: 75 }
                        ],
                        sentimentDistribution: {
                            'positive': 65,
                            'neutral': 25,
                            'negative': 10
                        }
                    }];
            });
        });
    };
    /**
     * 生成分析报表
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @param includeUserDetails 是否包含用户详情
     * @param selectedMetrics 选定的指标
     * @returns 报表信息
     */
    AnalyticsService.prototype.generateAnalyticsReport = function (startDate, endDate, includeUserDetails, selectedMetrics) {
        if (includeUserDetails === void 0) { includeUserDetails = false; }
        if (selectedMetrics === void 0) { selectedMetrics = []; }
        return __awaiter(this, void 0, void 0, function () {
            var reportId, generatedAt;
            return __generator(this, function (_a) {
                reportId = "report-".concat(Date.now());
                generatedAt = new Date();
                // 模拟报表生成
                // 实际项目中应该实现真实的报表生成逻辑
                return [2 /*return*/, {
                        reportId: reportId,
                        generatedAt: generatedAt,
                        downloadUrl: "/api/analytics/reports/".concat(reportId)
                    }];
            });
        });
    };
    return AnalyticsService;
}());
exports["default"] = new AnalyticsService();
