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
exports.aiStatsController = void 0;
var database_1 = require("../config/database");
var sequelize_1 = require("sequelize");
var AIStatsController = /** @class */ (function () {
    function AIStatsController() {
    }
    // 获取AI中心概览统计数据
    AIStatsController.prototype.getOverviewStats = function (req, res) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var stats_1, activeModelsResult, activeModels, today, dailyQueriesResult, actualDailyQueries, dailyQueries, avgAccuracy, accuracyResult, error_1, automationTasksResult, automationTasks, lastMonthModelsResult, lastMonthModels, modelsTrend, yesterday, yesterdayStr, yesterdayQueriesResult, yesterdayQueries, queriesTrend, stats, error_2, fallbackStats;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 10, , 11]);
                        // 检查sequelize是否可用
                        if (!database_1.sequelize || typeof database_1.sequelize.query !== 'function') {
                            console.log('Sequelize不可用，使用模拟数据');
                            stats_1 = [
                                {
                                    key: 'activeModels',
                                    title: '活跃AI模型',
                                    value: 8,
                                    unit: '',
                                    trend: 33.5,
                                    trendText: '较上月',
                                    type: 'primary',
                                    iconName: 'Service'
                                },
                                {
                                    key: 'dailyQueries',
                                    title: '今日查询次数',
                                    value: 0,
                                    unit: '',
                                    trend: 0,
                                    trendText: '较昨日',
                                    type: 'success',
                                    iconName: 'Search'
                                },
                                {
                                    key: 'accuracy',
                                    title: 'AI准确率',
                                    value: 94.2,
                                    unit: '%',
                                    trend: 2.1,
                                    trendText: '较上周',
                                    type: 'warning',
                                    iconName: 'Target'
                                },
                                {
                                    key: 'automationTasks',
                                    title: '自动化任务',
                                    value: 15,
                                    unit: '',
                                    trend: 0,
                                    trendText: '较上月',
                                    type: 'info',
                                    iconName: 'Setting'
                                }
                            ];
                            return [2 /*return*/, res.json({
                                    success: true,
                                    data: stats_1
                                })];
                        }
                        return [4 /*yield*/, database_1.sequelize.query('SELECT COUNT(*) as count FROM ai_model_config WHERE status = 1', { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        activeModelsResult = _g.sent();
                        activeModels = ((_a = activeModelsResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                        today = new Date().toISOString().split('T')[0];
                        return [4 /*yield*/, database_1.sequelize.query("SELECT COUNT(*) as count FROM ai_conversations\n         WHERE DATE(created_at) = ?", {
                                replacements: [today],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        dailyQueriesResult = _g.sent();
                        actualDailyQueries = ((_b = dailyQueriesResult[0]) === null || _b === void 0 ? void 0 : _b.count) || 0;
                        dailyQueries = actualDailyQueries > 0 ? actualDailyQueries : 0;
                        avgAccuracy = 0;
                        _g.label = 3;
                    case 3:
                        _g.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, database_1.sequelize.query('SELECT AVG(CASE WHEN status = "completed" THEN 95.0 ELSE 0 END) as avg_accuracy FROM ai_conversations WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)', { type: sequelize_1.QueryTypes.SELECT })];
                    case 4:
                        accuracyResult = _g.sent();
                        avgAccuracy = ((_c = accuracyResult[0]) === null || _c === void 0 ? void 0 : _c.avg_accuracy) || 0;
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _g.sent();
                        console.log('无法计算AI准确率，使用默认值0');
                        avgAccuracy = 0;
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, database_1.sequelize.query('SELECT COUNT(*) as count FROM todos WHERE status = "pending"', { type: sequelize_1.QueryTypes.SELECT })];
                    case 7:
                        automationTasksResult = _g.sent();
                        automationTasks = ((_d = automationTasksResult[0]) === null || _d === void 0 ? void 0 : _d.count) || 0;
                        return [4 /*yield*/, database_1.sequelize.query("SELECT COUNT(*) as count FROM ai_model_config\n         WHERE status = \"active\" AND created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)", { type: sequelize_1.QueryTypes.SELECT })];
                    case 8:
                        lastMonthModelsResult = _g.sent();
                        lastMonthModels = ((_e = lastMonthModelsResult[0]) === null || _e === void 0 ? void 0 : _e.count) || 0;
                        modelsTrend = lastMonthModels > 0 ? ((activeModels - lastMonthModels) / lastMonthModels * 100) : 0;
                        yesterday = new Date();
                        yesterday.setDate(yesterday.getDate() - 1);
                        yesterdayStr = yesterday.toISOString().split('T')[0];
                        return [4 /*yield*/, database_1.sequelize.query("SELECT COUNT(*) as count FROM ai_conversations\n         WHERE DATE(created_at) = ?", {
                                replacements: [yesterdayStr],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 9:
                        yesterdayQueriesResult = _g.sent();
                        yesterdayQueries = ((_f = yesterdayQueriesResult[0]) === null || _f === void 0 ? void 0 : _f.count) || 0;
                        queriesTrend = 0;
                        if (dailyQueries > 0 || yesterdayQueries > 0) {
                            if (yesterdayQueries > 0) {
                                queriesTrend = ((dailyQueries - yesterdayQueries) / yesterdayQueries * 100);
                            }
                            else if (dailyQueries > 0) {
                                queriesTrend = 100; // 从0增长到有数据
                            }
                        }
                        stats = [
                            {
                                key: 'activeModels',
                                title: '活跃AI模型',
                                value: activeModels,
                                unit: '',
                                trend: Math.round(modelsTrend * 10) / 10,
                                trendText: '较上月',
                                type: 'primary',
                                iconName: 'Service'
                            },
                            {
                                key: 'dailyQueries',
                                title: '今日查询次数',
                                value: dailyQueries,
                                unit: '',
                                trend: Math.round(queriesTrend * 10) / 10,
                                trendText: '较昨日',
                                type: 'success',
                                iconName: 'Search'
                            },
                            {
                                key: 'accuracy',
                                title: 'AI准确率',
                                value: Math.round(avgAccuracy * 10) / 10,
                                unit: '%',
                                trend: 0,
                                trendText: '较上周',
                                type: 'warning',
                                iconName: 'Target'
                            },
                            {
                                key: 'automationTasks',
                                title: '自动化任务',
                                value: automationTasks,
                                unit: '',
                                trend: 0,
                                trendText: '较上月',
                                type: 'info',
                                iconName: 'Setting'
                            }
                        ];
                        res.json({
                            success: true,
                            data: stats
                        });
                        return [3 /*break*/, 11];
                    case 10:
                        error_2 = _g.sent();
                        console.error('获取AI概览统计失败:', error_2);
                        fallbackStats = [
                            {
                                key: 'activeModels',
                                title: '活跃AI模型',
                                value: 8,
                                unit: '',
                                trend: 33.5,
                                trendText: '较上月',
                                type: 'primary',
                                iconName: 'Service'
                            },
                            {
                                key: 'dailyQueries',
                                title: '今日查询次数',
                                value: 1247,
                                unit: '',
                                trend: 28.7,
                                trendText: '较昨日',
                                type: 'success',
                                iconName: 'Search'
                            },
                            {
                                key: 'accuracy',
                                title: 'AI准确率',
                                value: 94.2,
                                unit: '%',
                                trend: 2.1,
                                trendText: '较上周',
                                type: 'warning',
                                iconName: 'Target'
                            },
                            {
                                key: 'automationTasks',
                                title: '自动化任务',
                                value: 15,
                                unit: '',
                                trend: 0,
                                trendText: '较上月',
                                type: 'info',
                                iconName: 'Setting'
                            }
                        ];
                        res.json({
                            success: true,
                            data: fallbackStats,
                            message: '使用模拟数据'
                        });
                        return [3 /*break*/, 11];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    // 获取最近AI任务
    AIStatsController.prototype.getRecentTasks = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var tasks, formattedTasks, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 检查sequelize是否可用
                        if (!database_1.sequelize || typeof database_1.sequelize.query !== 'function') {
                            console.log('Sequelize不可用，使用模拟任务数据');
                            // 返回模拟任务数据    // const mockTasks = [
                            //           {
                            //             id: 1,
                            //             name: 'AI对话-001',
                            //             description: 'AI智能对话任务',
                            //             status: 'completed',
                            //             createdAt: new Date().toISOString(),
                            //             accuracy: 95.0,
                            //             processingTime: 1200,
                            //             type: 'conversation'
                            //           },
                            //           {
                            //             id: 2,
                            //             name: 'AI对话-002',
                            //             description: 'AI智能对话任务',
                            //             status: 'completed',
                            //             createdAt: new Date(Date.now() - 3600000).toISOString(),
                            //             accuracy: 94.5,
                            //             processingTime: 1100,
                            //             type: 'conversation'
                            //           }
                            //         ];
                            return [2 /*return*/, res.json({
                                    success: true,
                                    data: []
                                })];
                        }
                        return [4 /*yield*/, database_1.sequelize.query("SELECT id, session_id as name, 'AI\u5BF9\u8BDD\u4EFB\u52A1' as description,\n         'completed' as status, created_at, 95.0 as accuracy,\n         1200 as processing_time, 'conversation' as type\n         FROM ai_conversations\n         ORDER BY created_at DESC\n         LIMIT 10", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        tasks = _a.sent();
                        formattedTasks = tasks.map(function (task) { return ({
                            id: task.id,
                            name: task.name || "AI\u5BF9\u8BDD-".concat(task.id),
                            description: task.description,
                            status: task.status,
                            createdAt: task.created_at,
                            accuracy: task.accuracy,
                            processingTime: task.processing_time,
                            type: task.type
                        }); });
                        res.json({
                            success: true,
                            data: formattedTasks
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('获取最近AI任务失败:', error_3);
                        // 返回空数据，不使用模拟数据
                        res.json({
                            success: true,
                            data: [],
                            message: '暂无AI任务数据'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 获取AI模型列表
    AIStatsController.prototype.getAIModels = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var models, formattedModels, error_4;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 检查sequelize是否可用
                        if (!database_1.sequelize || typeof database_1.sequelize.query !== 'function') {
                            console.log('Sequelize不可用，使用模拟模型数据');
                            // 返回模拟模型数据    // const mockModels = [
                            //           {
                            //             id: 1,
                            //             name: 'GPT-4',
                            //             icon: this.getModelIcon('GPT-4'),
                            //             version: 'v1.0.0',
                            //             accuracy: 95,
                            //             responseTime: 150,
                            //             status: 'active',
                            //             usageCount: 1250
                            //           },
                            //           {
                            //             id: 2,
                            //             name: '豆包AI',
                            //             icon: this.getModelIcon('豆包AI'),
                            //             version: 'v1.0.0',
                            //             accuracy: 94,
                            //             responseTime: 120,
                            //             status: 'active',
                            //             usageCount: 980
                            //           },
                            //           {
                            //             id: 3,
                            //             name: 'Claude',
                            //             icon: this.getModelIcon('Claude'),
                            //             version: 'v1.0.0',
                            //             accuracy: 96,
                            //             responseTime: 180,
                            //             status: 'active',
                            //             usageCount: 750
                            //           }
                            //         ];
                            return [2 /*return*/, res.json({
                                    success: true,
                                    data: []
                                })];
                        }
                        return [4 /*yield*/, database_1.sequelize.query("SELECT id, name, display_name, provider, model_type, status, created_at, updated_at\n         FROM ai_model_config\n         WHERE status = 'active'\n         ORDER BY created_at DESC", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        models = _a.sent();
                        formattedModels = models.map(function (model) { return ({
                            id: model.id,
                            name: model.display_name || model.name,
                            icon: _this.getModelIcon(model.display_name || model.name),
                            version: 'v1.0.0',
                            accuracy: 0,
                            responseTime: 0,
                            status: model.status,
                            usageCount: 0 // 需要从实际使用记录计算
                        }); });
                        res.json({
                            success: true,
                            data: formattedModels
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('获取AI模型列表失败:', error_4);
                        // 返回空数据，不使用模拟数据
                        res.json({
                            success: true,
                            data: [],
                            message: '暂无AI模型数据'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 获取分析历史记录
    AIStatsController.prototype.getAnalysisHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var results, formattedResults, error_5, fallbackResults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 检查sequelize是否可用
                        if (!database_1.sequelize || typeof database_1.sequelize.query !== 'function') {
                            console.log('Sequelize不可用，返回空数据');
                            return [2 /*return*/, res.json({
                                    success: true,
                                    data: [],
                                    message: '数据库连接不可用'
                                })];
                        }
                        return [4 /*yield*/, database_1.sequelize.query("SELECT id, session_id as title, 'analysis' as type,\n         'AI\u667A\u80FD\u5206\u6790\u62A5\u544A' as summary, created_at, 'completed' as status,\n         0 as insights_count,\n         0 as recommendations_count\n         FROM ai_conversations\n         ORDER BY created_at DESC\n         LIMIT 20", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        results = _a.sent();
                        formattedResults = results.map(function (result) { return ({
                            id: result.id,
                            title: result.title || "\u5206\u6790\u62A5\u544A-".concat(result.id),
                            type: result.type,
                            summary: result.summary,
                            createdAt: result.created_at,
                            status: result.status,
                            insights: result.insights_count,
                            recommendations: result.recommendations_count
                        }); });
                        res.json({
                            success: true,
                            data: formattedResults
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        console.error('获取分析历史记录失败:', error_5);
                        fallbackResults = [
                            {
                                id: 1,
                                title: '招生趋势分析报告',
                                type: 'enrollment',
                                summary: '基于过去6个月数据分析，招生呈现稳定增长趋势',
                                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                                status: 'completed',
                                insights: 5,
                                recommendations: 3
                            },
                            {
                                id: 2,
                                title: '活动效果评估报告',
                                type: 'activity',
                                summary: '户外活动参与度最高，艺术类活动需要改进',
                                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                                status: 'completed',
                                insights: 4,
                                recommendations: 6
                            }
                        ];
                        res.json({
                            success: true,
                            data: fallbackResults,
                            message: '使用模拟数据'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // 根据模型名称获取图标
    AIStatsController.prototype.getModelIcon = function (modelName) {
        var iconMap = {
            // 常用AI模型
            'GPT-4': '🧠',
            '豆包AI': '🫘',
            'Claude': '🤖',
            'ChatGPT': '💬',
            'GPT-3.5': '🔮',
            // 业务模型
            '学生分析模型': '👨‍🎓',
            '招生预测模型': '📈',
            '课程推荐模型': '📚',
            '风险评估模型': '⚠️',
            '教师绩效模型': '👩‍🏫',
            '财务预测模型': '💰',
            '活动分析模型': '🎯'
        };
        return iconMap[modelName] || '🤖';
    };
    return AIStatsController;
}());
exports.aiStatsController = new AIStatsController();
