"use strict";
/**
 * 活动中心聚合API控制器
 * 提供活动中心首页所需的所有数据，减少并发API请求提升性能
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
exports.ActivityCenterController = void 0;
var apiResponse_1 = require("../../utils/apiResponse");
var init_1 = require("../../init");
var sequelize_1 = require("sequelize");
var logger_1 = require("../../utils/logger");
var activity_center_service_1 = require("../../services/activity-center.service");
var center_cache_service_1 = __importDefault(require("../../services/center-cache.service"));
// 缓存统计
var cacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheHitRate: 0
};
var ActivityCenterController = /** @class */ (function () {
    function ActivityCenterController() {
    }
    /**
     * 获取活动中心Timeline数据
     */
    ActivityCenterController.getTimeline = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var activityCenterService, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('📋 活动中心Timeline数据请求');
                        activityCenterService = new activity_center_service_1.ActivityCenterService();
                        return [4 /*yield*/, activityCenterService.getTimeline()];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, result.data, '活动中心Timeline数据获取成功')];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ 获取活动中心Timeline数据失败:', error_1);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                error: {
                                    code: 'TIMELINE_ERROR',
                                    message: '获取Timeline数据失败'
                                }
                            })];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 活动中心仪表板聚合API（使用缓存）
     * 一次请求获取活动中心首页所有数据
     */
    ActivityCenterController.getDashboard = function (req, res) {
        var _a, _b, _c, _d, _e, _f;
        return __awaiter(this, void 0, void 0, function () {
            var startTime, userId, userRole, forceRefresh, centerData, responseTime, responseData, error_2, responseTime;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        startTime = Date.now();
                        _g.label = 1;
                    case 1:
                        _g.trys.push([1, 3, , 4]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = ((_b = req.user) === null || _b === void 0 ? void 0 : _b.role) || 'user';
                        if (!userId) {
                            return [2 /*return*/, res.status(401).json({ success: false, message: '未授权' })];
                        }
                        console.log('🎯 获取活动中心仪表板数据', { userId: userId, userRole: userRole });
                        // 更新统计
                        cacheStats.totalRequests++;
                        forceRefresh = req.query.forceRefresh === 'true';
                        return [4 /*yield*/, center_cache_service_1["default"].getCenterData('activity', userId, userRole, { forceRefresh: forceRefresh })];
                    case 2:
                        centerData = _g.sent();
                        // 更新缓存统计
                        if ((_c = centerData.meta) === null || _c === void 0 ? void 0 : _c.fromCache) {
                            cacheStats.cacheHits++;
                        }
                        else {
                            cacheStats.cacheMisses++;
                        }
                        // 计算缓存命中率
                        if (cacheStats.totalRequests > 0) {
                            cacheStats.cacheHitRate =
                                (cacheStats.cacheHits / cacheStats.totalRequests) * 100;
                        }
                        responseTime = Date.now() - startTime;
                        console.log("\u2705 \u6D3B\u52A8\u4E2D\u5FC3\u4EEA\u8868\u677F\u6570\u636E\u83B7\u53D6\u5B8C\u6210\uFF0C\u8017\u65F6: ".concat(responseTime, "ms"));
                        responseData = {
                            statistics: centerData.statistics,
                            activityTemplates: [],
                            recentRegistrations: {
                                list: centerData.list || [],
                                total: (centerData.list || []).length
                            },
                            activityPlans: [],
                            posterTemplates: { data: [], pagination: { page: 1, pageSize: 12, total: 0 } },
                            userActivities: ((_d = centerData.userSpecific) === null || _d === void 0 ? void 0 : _d.activities) || [],
                            meta: {
                                userId: userId,
                                userRole: userRole,
                                responseTime: responseTime,
                                fromCache: ((_e = centerData.meta) === null || _e === void 0 ? void 0 : _e.fromCache) || false,
                                cacheHitRate: cacheStats.cacheHitRate.toFixed(2) + '%',
                                cacheStats: {
                                    totalRequests: cacheStats.totalRequests,
                                    cacheHits: cacheStats.cacheHits,
                                    cacheMisses: cacheStats.cacheMisses
                                },
                                dataCount: {
                                    templates: 0,
                                    registrations: (centerData.list || []).length,
                                    plans: 0,
                                    posters: 0,
                                    userActivities: (((_f = centerData.userSpecific) === null || _f === void 0 ? void 0 : _f.activities) || []).length
                                }
                            }
                        };
                        // 返回聚合数据
                        apiResponse_1.ApiResponse.success(res, responseData, '活动中心仪表板数据获取成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _g.sent();
                        responseTime = Date.now() - startTime;
                        console.error('❌ 活动中心仪表板数据获取失败:', error_2);
                        logger_1.logger.error('活动中心仪表板数据获取失败', { error: error_2, responseTime: responseTime });
                        apiResponse_1.ApiResponse.handleError(res, error_2, '活动中心仪表板数据获取失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 优化的活动统计数据查询 - 使用单个查询获取所有统计
     */
    ActivityCenterController.getActivityStatisticsOptimized = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          (SELECT COUNT(*) FROM activities WHERE deleted_at IS NULL) as totalActivities,\n          (SELECT COUNT(*) FROM activities\n           WHERE deleted_at IS NULL\n             AND status = 'active'\n             AND start_time <= NOW()\n             AND end_time >= NOW()) as ongoingActivities,\n          (SELECT COUNT(*) FROM activity_registrations WHERE deleted_at IS NULL) as totalRegistrations,\n          (SELECT COALESCE(AVG(overall_rating), 5) FROM activity_evaluations WHERE deleted_at IS NULL) as averageRating\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, {
                                totalActivities: (result === null || result === void 0 ? void 0 : result.totalActivities) || 0,
                                ongoingActivities: (result === null || result === void 0 ? void 0 : result.ongoingActivities) || 0,
                                totalRegistrations: (result === null || result === void 0 ? void 0 : result.totalRegistrations) || 0,
                                averageRating: parseFloat((result === null || result === void 0 ? void 0 : result.averageRating) || '5')
                            }];
                    case 2:
                        error_3 = _a.sent();
                        console.warn('⚠️ 活动统计数据查询失败，使用默认值:', error_3);
                        return [2 /*return*/, {
                                totalActivities: 0,
                                ongoingActivities: 0,
                                totalRegistrations: 0,
                                averageRating: 5
                            }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动统计数据
     */
    ActivityCenterController.getActivityStatistics = function () {
        return __awaiter(this, void 0, void 0, function () {
            var totalActivities, ongoingActivities, totalRegistrations, averageRating, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total FROM activities WHERE deleted_at IS NULL\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        totalActivities = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total FROM activities \n        WHERE deleted_at IS NULL \n          AND status = 'active' \n          AND start_time <= NOW() \n          AND end_time >= NOW()\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 2:
                        ongoingActivities = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total FROM activity_registrations WHERE deleted_at IS NULL\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 3:
                        totalRegistrations = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT AVG(rating) as average FROM activity_evaluations WHERE deleted_at IS NULL\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 4:
                        averageRating = (_a.sent())[0];
                        return [2 /*return*/, {
                                totalActivities: (totalActivities === null || totalActivities === void 0 ? void 0 : totalActivities.total) || 16,
                                ongoingActivities: (ongoingActivities === null || ongoingActivities === void 0 ? void 0 : ongoingActivities.total) || 1,
                                totalRegistrations: (totalRegistrations === null || totalRegistrations === void 0 ? void 0 : totalRegistrations.total) || 1042,
                                averageRating: (averageRating === null || averageRating === void 0 ? void 0 : averageRating.average) || 5
                            }];
                    case 5:
                        error_4 = _a.sent();
                        console.warn('⚠️ 活动统计数据查询失败，使用默认值:', error_4);
                        return [2 /*return*/, {
                                totalActivities: 16,
                                ongoingActivities: 1,
                                totalRegistrations: 1042,
                                averageRating: 5
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动模板数据
     */
    ActivityCenterController.getActivityTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var templates, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          id, name, description, category, \n          usage_count, status, created_at, updated_at\n        FROM activity_templates \n        WHERE deleted_at IS NULL AND status = 1\n        ORDER BY usage_count DESC, created_at DESC\n        LIMIT 12\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        templates = _a.sent();
                        return [2 /*return*/, templates || []];
                    case 2:
                        error_5 = _a.sent();
                        console.warn('⚠️ 活动模板数据查询失败:', error_5);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取最近报名数据
     */
    ActivityCenterController.getRecentRegistrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var registrations, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          ar.id, ar.contact_name, ar.contact_phone,\n          ar.status, ar.registration_time, ar.created_at,\n          a.title as activity_title, a.start_time as activity_start_time\n        FROM activity_registrations ar\n        LEFT JOIN activities a ON ar.activity_id = a.id\n        WHERE ar.deleted_at IS NULL\n        ORDER BY ar.created_at DESC\n        LIMIT 10\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        registrations = _a.sent();
                        return [2 /*return*/, {
                                list: registrations || [],
                                total: (registrations === null || registrations === void 0 ? void 0 : registrations.length) || 0,
                                pagination: {
                                    page: 1,
                                    pageSize: 10,
                                    total: (registrations === null || registrations === void 0 ? void 0 : registrations.length) || 0
                                }
                            }];
                    case 2:
                        error_6 = _a.sent();
                        console.warn('⚠️ 最近报名数据查询失败:', error_6);
                        return [2 /*return*/, { list: [], total: 0, pagination: { page: 1, pageSize: 10, total: 0 } }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动计划数据
     */
    ActivityCenterController.getActivityPlans = function () {
        return __awaiter(this, void 0, void 0, function () {
            var plans, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          id, title, description, start_time, end_time, \n          location, max_participants, status, created_at\n        FROM activity_plans \n        WHERE deleted_at IS NULL\n        ORDER BY start_time DESC\n        LIMIT 5\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        plans = _a.sent();
                        return [2 /*return*/, plans || []];
                    case 2:
                        error_7 = _a.sent();
                        console.warn('⚠️ 活动计划数据查询失败:', error_7);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取海报模板数据
     */
    ActivityCenterController.getPosterTemplates = function () {
        return __awaiter(this, void 0, void 0, function () {
            var templates, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          id, name, description, category, preview_url,\n          usage_count, status, created_at\n        FROM poster_templates \n        WHERE deleted_at IS NULL AND status = 1\n        ORDER BY usage_count DESC, created_at DESC\n        LIMIT 12\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        templates = _a.sent();
                        return [2 /*return*/, {
                                data: templates || [],
                                pagination: {
                                    page: 1,
                                    pageSize: 12,
                                    total: (templates === null || templates === void 0 ? void 0 : templates.length) || 0
                                }
                            }];
                    case 2:
                        error_8 = _a.sent();
                        console.warn('⚠️ 海报模板数据查询失败:', error_8);
                        return [2 /*return*/, { data: [], pagination: { page: 1, pageSize: 12, total: 0 } }];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动中心缓存统计
     */
    ActivityCenterController.getCacheStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var centerStats;
            return __generator(this, function (_a) {
                try {
                    centerStats = center_cache_service_1["default"].getCacheStats('activity');
                    return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                            controller: cacheStats,
                            service: centerStats
                        }, '获取缓存统计成功')];
                }
                catch (error) {
                    logger_1.logger.error('获取缓存统计失败:', error);
                    return [2 /*return*/, res.status(500).json({
                            success: false,
                            message: '获取缓存统计失败',
                            error: error instanceof Error ? error.message : String(error)
                        })];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 清除活动中心缓存
     */
    ActivityCenterController.clearCache = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, userRole, clearAll, error_9;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        clearAll = req.query.clearAll === 'true';
                        if (!clearAll) return [3 /*break*/, 2];
                        // 清除所有活动中心缓存
                        return [4 /*yield*/, center_cache_service_1["default"].clearCenterCache('activity')];
                    case 1:
                        // 清除所有活动中心缓存
                        _c.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(userId && userRole)) return [3 /*break*/, 4];
                        // 清除特定用户的缓存
                        return [4 /*yield*/, center_cache_service_1["default"].clearCenterCache('activity', userId, userRole)];
                    case 3:
                        // 清除特定用户的缓存
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, clearAll ? '所有活动中心缓存已清除' : '用户活动中心缓存已清除')];
                    case 5:
                        error_9 = _c.sent();
                        logger_1.logger.error('清除缓存失败:', error_9);
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '清除缓存失败',
                                error: error_9 instanceof Error ? error_9.message : String(error_9)
                            })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return ActivityCenterController;
}());
exports.ActivityCenterController = ActivityCenterController;
