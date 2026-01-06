"use strict";
/**
 * 权限缓存控制器 - 管理员缓存管理接口
 * Permission Cache Controller - Admin Cache Management API
 *
 * 功能：
 * 1. 手动刷新权限缓存
 * 2. 查看缓存状态和统计
 * 3. 获取权限变更历史
 * 4. 缓存健康检查和诊断
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
exports.__esModule = true;
exports.PermissionCacheController = void 0;
var route_cache_service_1 = require("../services/route-cache.service");
var permission_watcher_service_1 = require("../services/permission-watcher.service");
var PermissionCacheController = /** @class */ (function () {
    function PermissionCacheController() {
    }
    /**
     * 手动刷新权限缓存
     * POST /api/admin/refresh-permission-cache
     */
    PermissionCacheController.refreshPermissionCache = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, beforeStatus, afterStatus, refreshTime, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        console.log('🔄 管理员触发权限缓存刷新...');
                        console.log("\uD83D\uDC64 \u64CD\u4F5C\u7528\u6237: ".concat(((_a = req.user) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', " (ID: ").concat((_b = req.user) === null || _b === void 0 ? void 0 : _b.id, ")"));
                        startTime = Date.now();
                        beforeStatus = route_cache_service_1.RouteCacheService.getCacheStatus();
                        // 执行缓存刷新
                        return [4 /*yield*/, route_cache_service_1.RouteCacheService.refreshCache()
                            // 获取刷新后的缓存状态
                        ];
                    case 1:
                        // 执行缓存刷新
                        _c.sent();
                        afterStatus = route_cache_service_1.RouteCacheService.getCacheStatus();
                        refreshTime = Date.now() - startTime;
                        // TODO: 记录操作日志
                        // await OperationLogService.log({
                        //   userId: req.user.id,
                        //   action: 'REFRESH_PERMISSION_CACHE',
                        //   details: '管理员手动刷新了权限缓存',
                        //   timestamp: new Date()
                        // })
                        // TODO: 通知所有在线用户权限已更新
                        // await NotificationService.broadcastPermissionUpdate()
                        console.log("\u2705 \u6743\u9650\u7F13\u5B58\u5237\u65B0\u5B8C\u6210\uFF0C\u8017\u65F6: ".concat(refreshTime, "ms"));
                        res.json({
                            success: true,
                            message: '权限缓存已成功刷新',
                            data: {
                                refreshTime: refreshTime,
                                before: {
                                    routeCount: beforeStatus.routeCount,
                                    lastLoadTime: beforeStatus.lastLoadTime,
                                    isHealthy: beforeStatus.isHealthy
                                },
                                after: {
                                    routeCount: afterStatus.routeCount,
                                    lastLoadTime: afterStatus.lastLoadTime,
                                    isHealthy: afterStatus.isHealthy
                                },
                                changes: {
                                    routeCountDiff: afterStatus.routeCount - beforeStatus.routeCount,
                                    timeDiff: afterStatus.lastLoadTime - beforeStatus.lastLoadTime
                                }
                            },
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        console.error('❌ 权限缓存刷新失败:', error_1);
                        res.status(500).json({
                            success: false,
                            error: '权限缓存刷新失败',
                            message: error_1.message,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取权限缓存状态
     * GET /api/admin/permission-cache-status
     */
    PermissionCacheController.getCacheStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheStatus, watcherStatus, metrics, cacheAge, cacheAgeHuman, healthScore;
            return __generator(this, function (_a) {
                try {
                    cacheStatus = route_cache_service_1.RouteCacheService.getCacheStatus();
                    watcherStatus = permission_watcher_service_1.PermissionWatcherService.getWatcherStatus();
                    metrics = route_cache_service_1.RouteCacheService.getMetrics();
                    cacheAge = Date.now() - cacheStatus.lastLoadTime;
                    cacheAgeHuman = formatDuration(cacheAge);
                    healthScore = calculateHealthScore(cacheStatus, metrics);
                    res.json({
                        success: true,
                        data: {
                            // 基本状态
                            cache: {
                                routeCount: cacheStatus.routeCount,
                                roleCount: Object.keys(cacheStatus.routesByRole).length,
                                lastLoadTime: cacheStatus.lastLoadTime,
                                cacheAge: cacheAge,
                                cacheAgeHuman: cacheAgeHuman,
                                version: cacheStatus.version,
                                isHealthy: cacheStatus.isHealthy
                            },
                            // 性能指标
                            metrics: {
                                loadTime: metrics.loadTime,
                                queryTime: metrics.queryTime,
                                processingTime: metrics.processingTime,
                                errorCount: metrics.errorCount
                            },
                            // 监听状态
                            watcher: {
                                isWatching: watcherStatus.isWatching,
                                eventCount: watcherStatus.eventCount,
                                lastEventTime: watcherStatus.lastEventTime,
                                refreshScheduled: watcherStatus.refreshScheduled
                            },
                            // 健康评分
                            health: {
                                score: healthScore,
                                status: getHealthStatus(healthScore),
                                recommendations: getHealthRecommendations(healthScore, cacheStatus, metrics)
                            }
                        },
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    console.error('❌ 获取缓存状态失败:', error);
                    res.status(500).json({
                        success: false,
                        error: '获取缓存状态失败',
                        message: error.message,
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取权限变更历史
     * GET /api/admin/permission-change-history
     */
    PermissionCacheController.getChangeHistory = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var limit, changeEvents;
            return __generator(this, function (_a) {
                try {
                    limit = parseInt(req.query.limit) || 50;
                    changeEvents = permission_watcher_service_1.PermissionWatcherService.getChangeEvents(limit);
                    res.json({
                        success: true,
                        data: {
                            events: changeEvents,
                            totalCount: changeEvents.length,
                            limit: limit
                        },
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    console.error('❌ 获取变更历史失败:', error);
                    res.status(500).json({
                        success: false,
                        error: '获取变更历史失败',
                        message: error.message,
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 强制刷新缓存 (紧急情况)
     * POST /api/admin/force-refresh-cache
     */
    PermissionCacheController.forceRefreshCache = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, watcherStatus, refreshTime, finalWatcherStatus, error_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        console.log('⚡ 管理员触发强制刷新缓存...');
                        console.log("\uD83D\uDC64 \u64CD\u4F5C\u7528\u6237: ".concat(((_a = req.user) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', " (ID: ").concat((_b = req.user) === null || _b === void 0 ? void 0 : _b.id, ")"));
                        startTime = Date.now();
                        // 执行强制刷新
                        return [4 /*yield*/, permission_watcher_service_1.PermissionWatcherService.forceRefresh()
                            // 尝试启动监听服务（如果未启动）
                        ];
                    case 1:
                        // 执行强制刷新
                        _c.sent();
                        watcherStatus = permission_watcher_service_1.PermissionWatcherService.getWatcherStatus();
                        if (!watcherStatus.isWatching) {
                            try {
                                console.log('🔄 检测到监听服务未启动，正在启动...');
                                permission_watcher_service_1.PermissionWatcherService.startWatching();
                                console.log('✅ 权限变更监听服务已启动');
                            }
                            catch (watcherError) {
                                console.warn('⚠️  启动监听服务失败:', watcherError);
                            }
                        }
                        refreshTime = Date.now() - startTime;
                        finalWatcherStatus = permission_watcher_service_1.PermissionWatcherService.getWatcherStatus();
                        console.log("\u2705 \u5F3A\u5236\u5237\u65B0\u5B8C\u6210\uFF0C\u8017\u65F6: ".concat(refreshTime, "ms"));
                        res.json({
                            success: true,
                            message: '缓存已强制刷新',
                            data: {
                                refreshTime: refreshTime,
                                forced: true,
                                watcherStarted: finalWatcherStatus.isWatching
                            },
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        console.error('❌ 强制刷新失败:', error_2);
                        res.status(500).json({
                            success: false,
                            error: '强制刷新失败',
                            message: error_2.message,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清空变更历史
     * DELETE /api/admin/permission-change-history
     */
    PermissionCacheController.clearChangeHistory = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_c) {
                try {
                    console.log('🗑️ 管理员清空权限变更历史...');
                    console.log("\uD83D\uDC64 \u64CD\u4F5C\u7528\u6237: ".concat(((_a = req.user) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', " (ID: ").concat((_b = req.user) === null || _b === void 0 ? void 0 : _b.id, ")"));
                    permission_watcher_service_1.PermissionWatcherService.clearChangeEvents();
                    res.json({
                        success: true,
                        message: '变更历史已清空',
                        timestamp: Date.now()
                    });
                }
                catch (error) {
                    console.error('❌ 清空变更历史失败:', error);
                    res.status(500).json({
                        success: false,
                        error: '清空变更历史失败',
                        message: error.message,
                        timestamp: Date.now()
                    });
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 缓存预热
     * POST /api/admin/warmup-cache
     */
    PermissionCacheController.warmupCache = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, warmupTime, error_3;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        console.log('🔥 管理员触发缓存预热...');
                        console.log("\uD83D\uDC64 \u64CD\u4F5C\u7528\u6237: ".concat(((_a = req.user) === null || _a === void 0 ? void 0 : _a.username) || 'Unknown', " (ID: ").concat((_b = req.user) === null || _b === void 0 ? void 0 : _b.id, ")"));
                        startTime = Date.now();
                        return [4 /*yield*/, route_cache_service_1.RouteCacheService.warmupCache()];
                    case 1:
                        _c.sent();
                        warmupTime = Date.now() - startTime;
                        console.log("\u2705 \u7F13\u5B58\u9884\u70ED\u5B8C\u6210\uFF0C\u8017\u65F6: ".concat(warmupTime, "ms"));
                        res.json({
                            success: true,
                            message: '缓存预热完成',
                            data: {
                                warmupTime: warmupTime
                            },
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _c.sent();
                        console.error('❌ 缓存预热失败:', error_3);
                        res.status(500).json({
                            success: false,
                            error: '缓存预热失败',
                            message: error_3.message,
                            timestamp: Date.now()
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return PermissionCacheController;
}());
exports.PermissionCacheController = PermissionCacheController;
/**
 * 格式化时间差
 */
function formatDuration(ms) {
    var seconds = Math.floor(ms / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);
    if (days > 0)
        return "".concat(days, "\u5929").concat(hours % 24, "\u5C0F\u65F6");
    if (hours > 0)
        return "".concat(hours, "\u5C0F\u65F6").concat(minutes % 60, "\u5206\u949F");
    if (minutes > 0)
        return "".concat(minutes, "\u5206\u949F").concat(seconds % 60, "\u79D2");
    return "".concat(seconds, "\u79D2");
}
/**
 * 计算健康评分 (0-100)
 */
function calculateHealthScore(cacheStatus, metrics) {
    var score = 100;
    // 基础健康检查
    if (!cacheStatus.isHealthy)
        score -= 30;
    if (cacheStatus.routeCount === 0)
        score -= 20;
    // 性能指标检查
    if (metrics.loadTime > 5000)
        score -= 15; // 加载时间超过5秒
    if (metrics.queryTime > 1000)
        score -= 10; // 查询时间超过1秒
    if (metrics.errorCount > 0)
        score -= 10 * metrics.errorCount; // 每个错误扣10分
    // 缓存年龄检查
    var cacheAge = Date.now() - cacheStatus.lastLoadTime;
    if (cacheAge > 24 * 60 * 60 * 1000)
        score -= 15; // 超过24小时
    return Math.max(0, score);
}
/**
 * 获取健康状态描述
 */
function getHealthStatus(score) {
    if (score >= 90)
        return 'excellent';
    if (score >= 75)
        return 'good';
    if (score >= 60)
        return 'fair';
    if (score >= 40)
        return 'poor';
    return 'critical';
}
/**
 * 获取健康建议
 */
function getHealthRecommendations(score, cacheStatus, metrics) {
    var recommendations = [];
    if (!cacheStatus.isHealthy) {
        recommendations.push('缓存状态异常，建议立即刷新缓存');
    }
    if (cacheStatus.routeCount === 0) {
        recommendations.push('缓存中没有路由数据，请检查数据库连接');
    }
    if (metrics.loadTime > 5000) {
        recommendations.push('缓存加载时间较长，建议检查数据库性能');
    }
    if (metrics.errorCount > 0) {
        recommendations.push('存在缓存错误，建议查看日志并修复');
    }
    var cacheAge = Date.now() - cacheStatus.lastLoadTime;
    if (cacheAge > 24 * 60 * 60 * 1000) {
        recommendations.push('缓存数据较旧，建议刷新缓存');
    }
    if (recommendations.length === 0) {
        recommendations.push('缓存状态良好，无需特殊操作');
    }
    return recommendations;
}
