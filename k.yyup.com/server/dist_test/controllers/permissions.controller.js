"use strict";
/**
 * 权限控制器
 * 处理权限相关的API请求，包括动态路由生成
 *
 * 版本: v2.0 - Redis缓存优化版
 * 更新日期: 2025-01-06
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.getAllRoutes = exports.checkPermission = exports.getUserPermissions = exports.getDynamicRoutes = exports.clearPermissionCache = exports.getCacheStats = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var route_cache_service_1 = require("../services/route-cache.service");
var permission_cache_service_1 = __importDefault(require("../services/permission-cache.service"));
// 全局缓存统计
var cacheStats = {
    totalRequests: 0,
    cacheHits: 0,
    cacheMisses: 0,
    cacheHitRate: 0,
    avgResponseTime: 0,
    avgCacheResponseTime: 0,
    avgDbResponseTime: 0
};
// 响应时间记录
var responseTimesCache = [];
var responseTimesDb = [];
/**
 * 更新缓存统计信息
 */
function updateCacheStats() {
    // 计算缓存命中率
    cacheStats.cacheHitRate = cacheStats.totalRequests > 0
        ? (cacheStats.cacheHits / cacheStats.totalRequests) * 100
        : 0;
    // 计算平均响应时间
    if (responseTimesCache.length > 0) {
        cacheStats.avgCacheResponseTime =
            responseTimesCache.reduce(function (a, b) { return a + b; }, 0) / responseTimesCache.length;
    }
    if (responseTimesDb.length > 0) {
        cacheStats.avgDbResponseTime =
            responseTimesDb.reduce(function (a, b) { return a + b; }, 0) / responseTimesDb.length;
    }
    // 计算总体平均响应时间
    var allTimes = __spreadArray(__spreadArray([], responseTimesCache, true), responseTimesDb, true);
    if (allTimes.length > 0) {
        cacheStats.avgResponseTime = allTimes.reduce(function (a, b) { return a + b; }, 0) / allTimes.length;
    }
    // 限制数组大小，只保留最近100次记录
    if (responseTimesCache.length > 100) {
        responseTimesCache.splice(0, responseTimesCache.length - 100);
    }
    if (responseTimesDb.length > 100) {
        responseTimesDb.splice(0, responseTimesDb.length - 100);
    }
}
/**
 * 获取缓存统计信息
 */
var getCacheStats = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var redisCacheStats, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                updateCacheStats();
                return [4 /*yield*/, permission_cache_service_1["default"].getCacheStats()];
            case 1:
                redisCacheStats = _a.sent();
                res.json({
                    success: true,
                    data: {
                        performance: {
                            totalRequests: cacheStats.totalRequests,
                            cacheHits: cacheStats.cacheHits,
                            cacheMisses: cacheStats.cacheMisses,
                            cacheHitRate: "".concat(cacheStats.cacheHitRate.toFixed(2), "%"),
                            avgResponseTime: "".concat(cacheStats.avgResponseTime.toFixed(2), "ms"),
                            avgCacheResponseTime: "".concat(cacheStats.avgCacheResponseTime.toFixed(2), "ms"),
                            avgDbResponseTime: "".concat(cacheStats.avgDbResponseTime.toFixed(2), "ms"),
                            performanceImprovement: cacheStats.avgDbResponseTime > 0
                                ? "".concat(((1 - cacheStats.avgCacheResponseTime / cacheStats.avgDbResponseTime) * 100).toFixed(2), "%")
                                : 'N/A'
                        },
                        redis: redisCacheStats,
                        timestamp: Date.now()
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('❌ 获取缓存统计失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: '获取缓存统计失败'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getCacheStats = getCacheStats;
/**
 * 清除权限缓存
 */
var clearPermissionCache = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, userId, roleCode, all, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                _a = req.body, userId = _a.userId, roleCode = _a.roleCode, all = _a.all;
                if (!all) return [3 /*break*/, 2];
                return [4 /*yield*/, permission_cache_service_1["default"].clearAllCache()];
            case 1:
                _b.sent();
                console.log('🗑️ 已清除所有权限缓存');
                return [3 /*break*/, 7];
            case 2:
                if (!userId) return [3 /*break*/, 4];
                return [4 /*yield*/, permission_cache_service_1["default"].clearUserCache(userId)];
            case 3:
                _b.sent();
                console.log("\uD83D\uDDD1\uFE0F \u5DF2\u6E05\u9664\u7528\u6237".concat(userId, "\u7684\u7F13\u5B58"));
                return [3 /*break*/, 7];
            case 4:
                if (!roleCode) return [3 /*break*/, 6];
                return [4 /*yield*/, permission_cache_service_1["default"].clearRoleCache(roleCode)];
            case 5:
                _b.sent();
                console.log("\uD83D\uDDD1\uFE0F \u5DF2\u6E05\u9664\u89D2\u8272".concat(roleCode, "\u7684\u7F13\u5B58"));
                return [3 /*break*/, 7];
            case 6:
                res.status(400).json({
                    success: false,
                    message: '请指定userId、roleCode或all参数'
                });
                return [2 /*return*/];
            case 7:
                res.json({
                    success: true,
                    message: '缓存清除成功'
                });
                return [3 /*break*/, 9];
            case 8:
                error_2 = _b.sent();
                console.error('❌ 清除缓存失败:', error_2);
                res.status(500).json({
                    success: false,
                    message: '清除缓存失败'
                });
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.clearPermissionCache = clearPermissionCache;
/**
 * 获取用户权限和动态路由 - Redis缓存优化版 v2.0
 */
var getDynamicRoutes = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var startTime, userId, userRole, permissions, fromCache, cacheTime, cacheError_1, dbTime, totalTime, error_3;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 9, , 10]);
                console.log('🚀 获取动态路由请求 (Redis缓存优化版 v2.0):', req.user);
                startTime = Date.now();
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        error: 'UNAUTHORIZED',
                        message: '用户未登录'
                    });
                    return [2 /*return*/];
                }
                // 更新统计
                cacheStats.totalRequests++;
                permissions = [];
                fromCache = false;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 8]);
                return [4 /*yield*/, permission_cache_service_1["default"].getDynamicRoutes(userId)];
            case 2:
                // 从Redis缓存获取
                permissions = _c.sent();
                fromCache = true;
                cacheTime = Date.now() - startTime;
                responseTimesCache.push(cacheTime);
                cacheStats.cacheHits++;
                console.log("\u2705 \u4ECERedis\u7F13\u5B58\u83B7\u53D6 ".concat(permissions.length, " \u6761\u8DEF\u7531\uFF0C\u8017\u65F6: ").concat(cacheTime, "ms"));
                return [3 /*break*/, 8];
            case 3:
                cacheError_1 = _c.sent();
                console.error('❌ Redis缓存获取失败，降级到数据库:', cacheError_1.message);
                // 降级：直接从数据库查询
                fromCache = false;
                cacheStats.cacheMisses++;
                if (!(userRole === 'admin' || userRole === 'super_admin')) return [3 /*break*/, 5];
                return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            p.id,\n            p.name,\n            p.chinese_name,\n            p.code,\n            p.type,\n            p.parent_id,\n            p.path,\n            p.component,\n            p.file_path,\n            p.permission,\n            p.icon,\n            p.sort,\n            p.status\n          FROM permissions p\n          WHERE p.status = 1\n          ORDER BY p.sort, p.id\n        ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 4:
                permissions = (_c.sent());
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, init_1.sequelize.query("\n          SELECT DISTINCT\n            p.id,\n            p.name,\n            p.chinese_name,\n            p.code,\n            p.type,\n            p.parent_id,\n            p.path,\n            p.component,\n            p.file_path,\n            p.permission,\n            p.icon,\n            p.sort,\n            p.status\n          FROM permissions p\n          INNER JOIN role_permissions rp ON p.id = rp.permission_id\n          INNER JOIN roles r ON rp.role_id = r.id\n          INNER JOIN user_roles ur ON r.id = ur.role_id\n          WHERE ur.user_id = :userId\n            AND p.status = 1\n            AND r.status = 1\n          ORDER BY p.sort, p.id\n        ", {
                    replacements: { userId: userId },
                    type: sequelize_1.QueryTypes.SELECT
                })];
            case 6:
                permissions = (_c.sent());
                _c.label = 7;
            case 7:
                dbTime = Date.now() - startTime;
                responseTimesDb.push(dbTime);
                console.log("\uD83D\uDCCA \u4ECE\u6570\u636E\u5E93\u83B7\u53D6 ".concat(permissions.length, " \u6761\u8DEF\u7531\uFF0C\u8017\u65F6: ").concat(dbTime, "ms"));
                return [3 /*break*/, 8];
            case 8:
                totalTime = Date.now() - startTime;
                // 更新平均响应时间
                updateCacheStats();
                console.log("\u26A1 \u52A8\u6001\u8DEF\u7531\u83B7\u53D6\u5B8C\u6210\uFF0C\u603B\u8017\u65F6: ".concat(totalTime, "ms, \u7F13\u5B58\u547D\u4E2D\u7387: ").concat(cacheStats.cacheHitRate.toFixed(2), "%"));
                res.json({
                    success: true,
                    data: {
                        permissions: permissions,
                        routes: buildDynamicRoutes(permissions)
                    },
                    meta: {
                        fromCache: fromCache,
                        responseTime: totalTime,
                        cacheHitRate: cacheStats.cacheHitRate,
                        cacheStats: {
                            totalRequests: cacheStats.totalRequests,
                            cacheHits: cacheStats.cacheHits,
                            cacheMisses: cacheStats.cacheMisses
                        },
                        timestamp: Date.now()
                    }
                });
                return [3 /*break*/, 10];
            case 9:
                error_3 = _c.sent();
                console.error('❌ 获取动态路由失败:', error_3);
                console.error('Error details:', error_3.message);
                console.error('Stack:', error_3.stack);
                next(new apiError_1.ApiError(500, '获取动态路由失败'));
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.getDynamicRoutes = getDynamicRoutes;
/**
 * 构建动态路由结构
 */
function buildDynamicRoutes(permissions) {
    var routes = [];
    var categoryMap = new Map();
    // 先创建所有分类（parent_id为空的是父级分类，包括category和menu类型）
    permissions.forEach(function (permission) {
        if ((permission.type === 'category' || permission.type === 'menu') && permission.parent_id === null) {
            var category = {
                id: permission.id,
                name: permission.name,
                code: permission.code,
                path: permission.path,
                icon: permission.icon,
                sort: permission.sort,
                children: []
            };
            categoryMap.set(permission.id, category);
            routes.push(category);
        }
    });
    // 然后添加菜单项到对应分类
    permissions.forEach(function (permission) {
        if (permission.type === 'menu' && permission.parent_id) {
            var parent_1 = categoryMap.get(permission.parent_id);
            if (parent_1) {
                parent_1.children.push({
                    id: permission.id,
                    name: permission.name,
                    code: permission.code,
                    path: permission.path,
                    component: permission.component,
                    file_path: permission.file_path,
                    permission: permission.permission,
                    icon: permission.icon,
                    sort: permission.sort,
                    type: permission.type
                });
            }
        }
    });
    // 对分类和子项进行排序
    routes.sort(function (a, b) { return a.sort - b.sort; });
    routes.forEach(function (route) {
        if (route.children) {
            route.children.sort(function (a, b) { return a.sort - b.sort; });
        }
    });
    return routes;
}
/**
 * 获取用户权限列表 - Redis缓存优化版 v2.0
 */
var getUserPermissions = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var startTime, userId, userRole, permissionCodes, fromCache, cacheTime, cacheError_2, permissions, permissions, dbTime, totalTime, isAdmin, error_4;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 9, , 10]);
                console.log('🚀 获取用户权限请求 (Redis缓存优化版 v2.0):', req.user);
                startTime = Date.now();
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        error: 'UNAUTHORIZED',
                        message: '用户未登录'
                    });
                    return [2 /*return*/];
                }
                // 更新统计
                cacheStats.totalRequests++;
                permissionCodes = [];
                fromCache = false;
                _c.label = 1;
            case 1:
                _c.trys.push([1, 3, , 8]);
                return [4 /*yield*/, permission_cache_service_1["default"].getUserPermissions(userId)];
            case 2:
                permissionCodes = _c.sent();
                fromCache = true;
                cacheTime = Date.now() - startTime;
                responseTimesCache.push(cacheTime);
                cacheStats.cacheHits++;
                console.log("\u2705 \u4ECERedis\u7F13\u5B58\u83B7\u53D6 ".concat(permissionCodes.length, " \u4E2A\u6743\u9650\uFF0C\u8017\u65F6: ").concat(cacheTime, "ms"));
                return [3 /*break*/, 8];
            case 3:
                cacheError_2 = _c.sent();
                console.error('❌ Redis缓存获取失败:', cacheError_2.message);
                fromCache = false;
                cacheStats.cacheMisses++;
                if (!(userRole === 'admin' || userRole === 'super_admin')) return [3 /*break*/, 5];
                return [4 /*yield*/, init_1.sequelize.query("\n          SELECT DISTINCT code\n          FROM permissions\n          WHERE status = 1 AND code IS NOT NULL AND code != ''\n          ORDER BY sort, id\n        ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 4:
                permissions = _c.sent();
                permissionCodes = permissions.map(function (p) { return p.code; });
                return [3 /*break*/, 7];
            case 5: return [4 /*yield*/, init_1.sequelize.query("\n          SELECT DISTINCT p.code\n          FROM permissions p\n          INNER JOIN role_permissions rp ON p.id = rp.permission_id\n          INNER JOIN roles r ON rp.role_id = r.id\n          INNER JOIN user_roles ur ON r.id = ur.role_id\n          WHERE ur.user_id = :userId\n            AND p.status = 1\n            AND r.status = 1\n            AND p.code IS NOT NULL\n            AND p.code != ''\n          ORDER BY p.sort, p.id\n        ", {
                    replacements: { userId: userId },
                    type: sequelize_1.QueryTypes.SELECT
                })];
            case 6:
                permissions = _c.sent();
                permissionCodes = permissions.map(function (p) { return p.code; });
                _c.label = 7;
            case 7:
                dbTime = Date.now() - startTime;
                responseTimesDb.push(dbTime);
                console.log("\uD83D\uDCCA \u4ECE\u6570\u636E\u5E93\u83B7\u53D6 ".concat(permissionCodes.length, " \u4E2A\u6743\u9650\uFF0C\u8017\u65F6: ").concat(dbTime, "ms"));
                return [3 /*break*/, 8];
            case 8:
                totalTime = Date.now() - startTime;
                isAdmin = userRole === 'admin' || userRole === 'super_admin';
                // 更新统计
                updateCacheStats();
                console.log("\u26A1 \u7528\u6237\u6743\u9650\u83B7\u53D6\u5B8C\u6210\uFF0C\u603B\u8017\u65F6: ".concat(totalTime, "ms, \u7F13\u5B58\u547D\u4E2D\u7387: ").concat(cacheStats.cacheHitRate.toFixed(2), "%"));
                res.json({
                    success: true,
                    data: permissionCodes || [],
                    meta: {
                        userId: userId,
                        userRole: userRole,
                        isAdmin: isAdmin,
                        fromCache: fromCache,
                        responseTime: totalTime,
                        cacheHitRate: cacheStats.cacheHitRate,
                        cacheStats: {
                            totalRequests: cacheStats.totalRequests,
                            cacheHits: cacheStats.cacheHits,
                            cacheMisses: cacheStats.cacheMisses
                        },
                        timestamp: Date.now()
                    }
                });
                return [3 /*break*/, 10];
            case 9:
                error_4 = _c.sent();
                console.error('❌ 获取用户权限失败:', error_4);
                res.status(500).json({
                    success: false,
                    error: '获取用户权限失败',
                    message: error_4.message,
                    timestamp: Date.now()
                });
                return [3 /*break*/, 10];
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.getUserPermissions = getUserPermissions;
/**
 * 检查用户是否有特定权限
 */
var checkPermission = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, _a, path, permission, whereCondition, replacements, results, hasPermission, error_5;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
                _a = req.body, path = _a.path, permission = _a.permission;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        error: 'UNAUTHORIZED',
                        message: '用户未登录'
                    });
                    return [2 /*return*/];
                }
                // 验证必要参数
                if (!path && !permission) {
                    res.status(400).json({
                        success: false,
                        error: 'BAD_REQUEST',
                        message: '缺少必要的权限检查参数'
                    });
                    return [2 /*return*/];
                }
                // 管理员拥有所有权限
                if (userRole === 'admin') {
                    res.json({
                        success: true,
                        data: {
                            hasPermission: true,
                            isAdmin: true
                        }
                    });
                    return [2 /*return*/];
                }
                // 特殊处理：允许教师访问创意课程页面及其子页面
                if (userRole === 'teacher' && (path === '/teacher-center/creative-curriculum' || path === '/teacher-center/creative-curriculum/interactive')) {
                    res.json({
                        success: true,
                        data: {
                            hasPermission: true,
                            isAdmin: false
                        }
                    });
                    return [2 /*return*/];
                }
                whereCondition = 'ur.user_id = :userId AND p.status = 1 AND r.status = 1';
                replacements = { userId: userId };
                if (path && permission) {
                    whereCondition += ' AND (p.path = :path OR p.code = :permission)';
                    replacements.path = path;
                    replacements.permission = permission;
                }
                else if (path) {
                    whereCondition += ' AND p.path = :path';
                    replacements.path = path;
                }
                else if (permission) {
                    whereCondition += ' AND p.code = :permission';
                    replacements.permission = permission;
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT COUNT(*) as count\n      FROM permissions p\n      INNER JOIN role_permissions rp ON p.id = rp.permission_id\n      INNER JOIN roles r ON rp.role_id = r.id\n      INNER JOIN user_roles ur ON r.id = ur.role_id\n      WHERE ".concat(whereCondition, "\n    "), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                results = _d.sent();
                hasPermission = results && results.length > 0 && results[0].count > 0;
                res.json({
                    success: true,
                    data: {
                        hasPermission: hasPermission,
                        isAdmin: false
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _d.sent();
                console.error('检查权限失败:', error_5);
                next(new apiError_1.ApiError(500, '检查权限失败'));
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.checkPermission = checkPermission;
/**
 * 获取所有可用的路由路径（用于路由表生成）- 优化版本（使用缓存）
 */
var getAllRoutes = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var startTime, routes, fromCache, allRoutes, cacheError_3, result, totalTime, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                console.log('🚀 获取所有路由请求 (缓存优化版)');
                startTime = Date.now();
                routes = [];
                fromCache = false;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 2, , 4]);
                if (route_cache_service_1.RouteCacheService.isHealthy()) {
                    console.log('✅ 路由缓存健康，从缓存获取数据');
                    allRoutes = route_cache_service_1.RouteCacheService.getCachedRoutes();
                    routes = allRoutes.filter(function (route) {
                        return route.status === 1 &&
                            ['menu', 'button'].includes(route.type) &&
                            route.path &&
                            route.component;
                    });
                    fromCache = true;
                    console.log("\uD83D\uDCCA \u4ECE\u7F13\u5B58\u83B7\u53D6\u5E76\u8FC7\u6EE4 ".concat(routes.length, " \u6761\u8DEF\u7531\uFF0C\u8017\u65F6: ").concat(Date.now() - startTime, "ms"));
                }
                else {
                    console.warn('⚠️ 路由缓存不健康，降级到数据库查询');
                    throw new Error('缓存不健康');
                }
                return [3 /*break*/, 4];
            case 2:
                cacheError_3 = _a.sent();
                console.warn('⚠️ 缓存获取失败，降级到数据库查询:', cacheError_3.message);
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          p.path,\n          p.component,\n          p.file_path,\n          p.name,\n          p.code,\n          p.type,\n          p.parent_id,\n          p.icon,\n          p.sort\n        FROM permissions p\n        WHERE p.status = 1\n          AND p.type IN ('menu', 'button')\n          AND p.path IS NOT NULL\n          AND p.component IS NOT NULL\n        ORDER BY p.sort, p.id\n      ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                result = _a.sent();
                routes = Array.isArray(result) ? result : [];
                console.log("\uD83D\uDCCA \u4ECE\u6570\u636E\u5E93\u83B7\u53D6 ".concat(routes.length, " \u6761\u8DEF\u7531\uFF0C\u8017\u65F6: ").concat(Date.now() - startTime, "ms"));
                return [3 /*break*/, 4];
            case 4:
                totalTime = Date.now() - startTime;
                console.log("\u26A1 \u6240\u6709\u8DEF\u7531\u83B7\u53D6\u5B8C\u6210\uFF0C\u603B\u8017\u65F6: ".concat(totalTime, "ms"));
                res.json({
                    success: true,
                    data: {
                        routes: routes.map(function (route) { return ({
                            path: route.path,
                            component: route.component,
                            file_path: route.file_path,
                            name: route.name,
                            code: route.code,
                            type: route.type,
                            parent_id: route.parent_id,
                            icon: route.icon,
                            sort: route.sort,
                            meta: {
                                title: route.name,
                                requiresAuth: true,
                                permission: route.code
                            }
                        }); })
                    },
                    meta: {
                        fromCache: fromCache,
                        responseTime: totalTime,
                        cacheStatus: route_cache_service_1.RouteCacheService.isHealthy() ? 'healthy' : 'unhealthy',
                        routeCount: routes.length,
                        timestamp: Date.now()
                    }
                });
                return [3 /*break*/, 6];
            case 5:
                error_6 = _a.sent();
                console.error('❌ 获取所有路由失败:', error_6);
                next(new apiError_1.ApiError(500, '获取所有路由失败'));
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getAllRoutes = getAllRoutes;
