"use strict";
/**
 * 中心页面缓存服务
 *
 * 功能：
 * 1. 统一管理15个中心页面的缓存
 * 2. 混合缓存策略（公共统计 + 角色列表 + 用户数据）
 * 3. 智能缓存失效
 * 4. 性能监控
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var redis_service_1 = __importDefault(require("./redis.service"));
var redis_config_1 = require("../config/redis.config");
var database_1 = require("../database");
var sequelize_1 = require("sequelize");
/**
 * 中心缓存服务类
 */
var CenterCacheService = /** @class */ (function () {
    function CenterCacheService() {
        // 缓存Key前缀
        this.CENTER_STATS_PREFIX = 'center:stats:'; // 公共统计数据
        this.CENTER_ROLE_PREFIX = 'center:role:'; // 角色列表数据
        this.CENTER_USER_PREFIX = 'center:user:'; // 用户专属数据
        // 缓存统计
        this.stats = {};
    }
    /**
     * 获取中心数据（混合缓存策略）
     *
     * @param centerName 中心名称
     * @param userId 用户ID
     * @param userRole 用户角色
     * @param options 选项
     * @returns 中心数据
     */
    CenterCacheService.prototype.getCenterData = function (centerName, userId, userRole, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var startTime, data_1, cachedData, data, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        // 初始化统计
                        if (!this.stats[centerName]) {
                            this.stats[centerName] = {
                                totalRequests: 0,
                                cacheHits: 0,
                                cacheMisses: 0,
                                cacheHitRate: 0
                            };
                        }
                        this.stats[centerName].totalRequests++;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        if (!options.forceRefresh) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.loadCenterDataFromDB(centerName, userId, userRole, options)];
                    case 2:
                        data_1 = _a.sent();
                        this.stats[centerName].cacheMisses++;
                        this.updateCacheHitRate(centerName);
                        // 更新缓存
                        return [4 /*yield*/, this.setCenterCache(centerName, userId, userRole, data_1)];
                    case 3:
                        // 更新缓存
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, data_1), { meta: {
                                    fromCache: false,
                                    responseTime: Date.now() - startTime,
                                    userId: userId,
                                    userRole: userRole
                                } })];
                    case 4: return [4 /*yield*/, this.getCenterCache(centerName, userId, userRole)];
                    case 5:
                        cachedData = _a.sent();
                        if (cachedData) {
                            this.stats[centerName].cacheHits++;
                            this.updateCacheHitRate(centerName);
                            return [2 /*return*/, __assign(__assign({}, cachedData), { meta: {
                                        fromCache: true,
                                        responseTime: Date.now() - startTime,
                                        userId: userId,
                                        userRole: userRole
                                    } })];
                        }
                        return [4 /*yield*/, this.loadCenterDataFromDB(centerName, userId, userRole, options)];
                    case 6:
                        data = _a.sent();
                        this.stats[centerName].cacheMisses++;
                        this.updateCacheHitRate(centerName);
                        // 设置缓存
                        return [4 /*yield*/, this.setCenterCache(centerName, userId, userRole, data)];
                    case 7:
                        // 设置缓存
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, data), { meta: {
                                    fromCache: false,
                                    responseTime: Date.now() - startTime,
                                    userId: userId,
                                    userRole: userRole
                                } })];
                    case 8:
                        error_1 = _a.sent();
                        console.error("\u274C \u83B7\u53D6\u4E2D\u5FC3\u6570\u636E\u5931\u8D25 [".concat(centerName, "]:"), error_1);
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从缓存获取中心数据
     */
    CenterCacheService.prototype.getCenterCache = function (centerName, userId, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var statsKey, statistics, roleKey, list, userKey, userSpecific, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        statsKey = "".concat(this.CENTER_STATS_PREFIX).concat(centerName);
                        return [4 /*yield*/, redis_service_1["default"].get(statsKey)];
                    case 1:
                        statistics = _a.sent();
                        roleKey = "".concat(this.CENTER_ROLE_PREFIX).concat(centerName, ":").concat(userRole);
                        return [4 /*yield*/, redis_service_1["default"].get(roleKey)];
                    case 2:
                        list = _a.sent();
                        userKey = "".concat(this.CENTER_USER_PREFIX).concat(centerName, ":").concat(userId);
                        return [4 /*yield*/, redis_service_1["default"].get(userKey)];
                    case 3:
                        userSpecific = _a.sent();
                        // 如果任何一个缓存不存在，返回null（需要完整重新加载）
                        if (!statistics && !list && !userSpecific) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, {
                                statistics: statistics || undefined,
                                list: list || undefined,
                                userSpecific: userSpecific || undefined
                            }];
                    case 4:
                        error_2 = _a.sent();
                        console.error("\u274C \u83B7\u53D6\u4E2D\u5FC3\u7F13\u5B58\u5931\u8D25 [".concat(centerName, "]:"), error_2);
                        return [2 /*return*/, null];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置中心缓存
     */
    CenterCacheService.prototype.setCenterCache = function (centerName, userId, userRole, data) {
        return __awaiter(this, void 0, void 0, function () {
            var ttl, statsKey, roleKey, userKey, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        ttl = this.getCenterTTL(centerName);
                        if (!data.statistics) return [3 /*break*/, 2];
                        statsKey = "".concat(this.CENTER_STATS_PREFIX).concat(centerName);
                        return [4 /*yield*/, redis_service_1["default"].set(statsKey, data.statistics, ttl)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!data.list) return [3 /*break*/, 4];
                        roleKey = "".concat(this.CENTER_ROLE_PREFIX).concat(centerName, ":").concat(userRole);
                        return [4 /*yield*/, redis_service_1["default"].set(roleKey, data.list, ttl)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        if (!data.userSpecific) return [3 /*break*/, 6];
                        userKey = "".concat(this.CENTER_USER_PREFIX).concat(centerName, ":").concat(userId);
                        return [4 /*yield*/, redis_service_1["default"].set(userKey, data.userSpecific, ttl)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        console.log("\u2705 \u4E2D\u5FC3\u7F13\u5B58\u5DF2\u8BBE\u7F6E [".concat(centerName, "], TTL=").concat(ttl, "\u79D2"));
                        return [3 /*break*/, 8];
                    case 7:
                        error_3 = _a.sent();
                        console.error("\u274C \u8BBE\u7F6E\u4E2D\u5FC3\u7F13\u5B58\u5931\u8D25 [".concat(centerName, "]:"), error_3);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从数据库加载中心数据
     */
    CenterCacheService.prototype.loadCenterDataFromDB = function (centerName, userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = centerName;
                        switch (_a) {
                            case 'dashboard': return [3 /*break*/, 1];
                            case 'activity': return [3 /*break*/, 3];
                            case 'enrollment': return [3 /*break*/, 5];
                            case 'personnel': return [3 /*break*/, 7];
                            case 'marketing': return [3 /*break*/, 9];
                            case 'customer-pool': return [3 /*break*/, 11];
                            case 'task': return [3 /*break*/, 13];
                            case 'system': return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 17];
                    case 1: return [4 /*yield*/, this.loadDashboardData(userId, userRole, options)];
                    case 2: return [2 /*return*/, _b.sent()];
                    case 3: return [4 /*yield*/, this.loadActivityCenterData(userId, userRole, options)];
                    case 4: return [2 /*return*/, _b.sent()];
                    case 5: return [4 /*yield*/, this.loadEnrollmentCenterData(userId, userRole, options)];
                    case 6: return [2 /*return*/, _b.sent()];
                    case 7: return [4 /*yield*/, this.loadPersonnelCenterData(userId, userRole, options)];
                    case 8: return [2 /*return*/, _b.sent()];
                    case 9: return [4 /*yield*/, this.loadMarketingCenterData(userId, userRole, options)];
                    case 10: return [2 /*return*/, _b.sent()];
                    case 11: return [4 /*yield*/, this.loadCustomerPoolCenterData(userId, userRole, options)];
                    case 12: return [2 /*return*/, _b.sent()];
                    case 13: return [4 /*yield*/, this.loadTaskCenterData(userId, userRole, options)];
                    case 14: return [2 /*return*/, _b.sent()];
                    case 15: return [4 /*yield*/, this.loadSystemCenterData(userId, userRole, options)];
                    case 16: return [2 /*return*/, _b.sent()];
                    case 17: throw new Error("\u672A\u77E5\u7684\u4E2D\u5FC3: ".concat(centerName));
                }
            });
        });
    };
    /**
     * 加载Dashboard数据
     */
    CenterCacheService.prototype.loadDashboardData = function (userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            var statsResult, userTodos, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT\n          (SELECT COUNT(*) FROM users) as userCount,\n          (SELECT COUNT(*) FROM students) as studentCount,\n          (SELECT COUNT(*) FROM teachers) as teacherCount,\n          (SELECT COUNT(*) FROM classes) as classCount,\n          (SELECT COUNT(*) FROM activities) as activityCount\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        statsResult = (_a.sent())[0];
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT id, title, status, due_date, priority\n        FROM todos\n        WHERE user_id = ?\n        ORDER BY due_date ASC\n        LIMIT 10\n      ", {
                                replacements: [userId],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        userTodos = _a.sent();
                        return [2 /*return*/, {
                                statistics: statsResult,
                                userSpecific: {
                                    todos: userTodos
                                }
                            }];
                    case 3:
                        error_4 = _a.sent();
                        console.error('❌ 加载Dashboard数据失败:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载活动中心数据
     */
    CenterCacheService.prototype.loadActivityCenterData = function (userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            var statsResult, recentRegistrations, userActivities, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT\n          (SELECT COUNT(*) FROM activities) as totalActivities,\n          (SELECT COUNT(*) FROM activities WHERE status = 'ongoing') as ongoingActivities,\n          (SELECT COUNT(*) FROM activity_registrations) as totalRegistrations,\n          (SELECT AVG(overall_rating) FROM activity_evaluations) as averageRating\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        statsResult = (_a.sent())[0];
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT\n          ar.id,\n          ar.activity_id,\n          ar.student_id,\n          ar.registration_time,\n          ar.status,\n          a.title as activity_name,\n          s.name as student_name\n        FROM activity_registrations ar\n        LEFT JOIN activities a ON ar.activity_id = a.id\n        LEFT JOIN students s ON ar.student_id = s.id\n        ORDER BY ar.registration_time DESC\n        LIMIT 10\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 2:
                        recentRegistrations = _a.sent();
                        userActivities = [];
                        if (!(userRole === 'teacher')) return [3 /*break*/, 4];
                        return [4 /*yield*/, database_1.sequelize.query("\n          SELECT\n            a.id,\n            a.name,\n            a.status,\n            a.start_date,\n            a.end_date,\n            COUNT(ar.id) as registration_count\n          FROM activities a\n          LEFT JOIN activity_registrations ar ON a.id = ar.activity_id\n          WHERE a.teacher_id = ?\n          GROUP BY a.id\n          ORDER BY a.start_date DESC\n          LIMIT 10\n        ", {
                                replacements: [userId],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        userActivities = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, {
                            statistics: statsResult,
                            list: recentRegistrations,
                            userSpecific: {
                                activities: userActivities
                            }
                        }];
                    case 5:
                        error_5 = _a.sent();
                        console.error('❌ 加载活动中心数据失败:', error_5);
                        throw error_5;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载招生中心数据
     */
    CenterCacheService.prototype.loadEnrollmentCenterData = function (userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 实现招生中心数据加载逻辑
                return [2 /*return*/, {
                        statistics: {},
                        list: [],
                        userSpecific: {}
                    }];
            });
        });
    };
    // ... 其他中心的加载方法（后续实现）
    CenterCacheService.prototype.loadPersonnelCenterData = function (userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { statistics: {}, list: [], userSpecific: {} }];
            });
        });
    };
    CenterCacheService.prototype.loadMarketingCenterData = function (userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { statistics: {}, list: [], userSpecific: {} }];
            });
        });
    };
    CenterCacheService.prototype.loadCustomerPoolCenterData = function (userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { statistics: {}, list: [], userSpecific: {} }];
            });
        });
    };
    CenterCacheService.prototype.loadTaskCenterData = function (userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { statistics: {}, list: [], userSpecific: {} }];
            });
        });
    };
    CenterCacheService.prototype.loadSystemCenterData = function (userId, userRole, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, { statistics: {}, list: [], userSpecific: {} }];
            });
        });
    };
    /**
     * 获取中心的TTL
     */
    CenterCacheService.prototype.getCenterTTL = function (centerName) {
        var ttlMap = {
            'dashboard': redis_config_1.RedisTTL.DASHBOARD_CENTER,
            'task': redis_config_1.RedisTTL.TASK_CENTER,
            'activity': redis_config_1.RedisTTL.ACTIVITY_CENTER,
            'personnel': redis_config_1.RedisTTL.PERSONNEL_CENTER,
            'marketing': redis_config_1.RedisTTL.MARKETING_CENTER,
            'enrollment': redis_config_1.RedisTTL.ENROLLMENT_CENTER,
            'customer-pool': redis_config_1.RedisTTL.CUSTOMER_POOL_CENTER,
            'system': redis_config_1.RedisTTL.SYSTEM_CENTER
        };
        return ttlMap[centerName] || redis_config_1.RedisTTL.DEFAULT_CENTER;
    };
    /**
     * 清除中心缓存
     */
    CenterCacheService.prototype.clearCenterCache = function (centerName, userId, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var userKey, roleKey, statsKey, rolePattern, roleKeys, _i, roleKeys_1, key, userPattern, userKeys, _a, userKeys_1, key, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 16, , 17]);
                        if (!(userId && userRole)) return [3 /*break*/, 2];
                        userKey = "".concat(this.CENTER_USER_PREFIX).concat(centerName, ":").concat(userId);
                        return [4 /*yield*/, redis_service_1["default"].del(userKey)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 2:
                        if (!userRole) return [3 /*break*/, 4];
                        roleKey = "".concat(this.CENTER_ROLE_PREFIX).concat(centerName, ":").concat(userRole);
                        return [4 /*yield*/, redis_service_1["default"].del(roleKey)];
                    case 3:
                        _b.sent();
                        return [3 /*break*/, 15];
                    case 4:
                        statsKey = "".concat(this.CENTER_STATS_PREFIX).concat(centerName);
                        return [4 /*yield*/, redis_service_1["default"].del(statsKey)];
                    case 5:
                        _b.sent();
                        rolePattern = "".concat(this.CENTER_ROLE_PREFIX).concat(centerName, ":*");
                        return [4 /*yield*/, redis_service_1["default"].keys(rolePattern)];
                    case 6:
                        roleKeys = _b.sent();
                        _i = 0, roleKeys_1 = roleKeys;
                        _b.label = 7;
                    case 7:
                        if (!(_i < roleKeys_1.length)) return [3 /*break*/, 10];
                        key = roleKeys_1[_i];
                        return [4 /*yield*/, redis_service_1["default"].del(key)];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 7];
                    case 10:
                        userPattern = "".concat(this.CENTER_USER_PREFIX).concat(centerName, ":*");
                        return [4 /*yield*/, redis_service_1["default"].keys(userPattern)];
                    case 11:
                        userKeys = _b.sent();
                        _a = 0, userKeys_1 = userKeys;
                        _b.label = 12;
                    case 12:
                        if (!(_a < userKeys_1.length)) return [3 /*break*/, 15];
                        key = userKeys_1[_a];
                        return [4 /*yield*/, redis_service_1["default"].del(key)];
                    case 13:
                        _b.sent();
                        _b.label = 14;
                    case 14:
                        _a++;
                        return [3 /*break*/, 12];
                    case 15:
                        console.log("\u2705 \u4E2D\u5FC3\u7F13\u5B58\u5DF2\u6E05\u9664 [".concat(centerName, "]"));
                        return [3 /*break*/, 17];
                    case 16:
                        error_6 = _b.sent();
                        console.error("\u274C \u6E05\u9664\u4E2D\u5FC3\u7F13\u5B58\u5931\u8D25 [".concat(centerName, "]:"), error_6);
                        return [3 /*break*/, 17];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取缓存统计
     */
    CenterCacheService.prototype.getCacheStats = function (centerName) {
        if (centerName) {
            return this.stats[centerName] || {
                totalRequests: 0,
                cacheHits: 0,
                cacheMisses: 0,
                cacheHitRate: 0
            };
        }
        return this.stats;
    };
    /**
     * 更新缓存命中率
     */
    CenterCacheService.prototype.updateCacheHitRate = function (centerName) {
        var stats = this.stats[centerName];
        if (stats.totalRequests > 0) {
            stats.cacheHitRate = (stats.cacheHits / stats.totalRequests) * 100;
        }
    };
    return CenterCacheService;
}());
// 导出单例
exports["default"] = new CenterCacheService();
