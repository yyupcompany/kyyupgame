"use strict";
/**
 * 路由缓存服务 - 核心性能优化
 * Route Cache Service - Core Performance Optimization
 *
 * 功能：
 * 1. 服务器启动时一次性从数据库加载所有路由到内存
 * 2. 提供毫秒级的路由数据访问
 * 3. 支持缓存刷新和状态监控
 * 4. 按用户角色优化的路由分组
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
exports.RouteCacheService = void 0;
var permission_model_1 = require("../models/permission.model");
var role_model_1 = require("../models/role.model");
var role_permission_model_1 = require("../models/role-permission.model");
var sequelize_1 = require("sequelize");
var RouteCacheService = /** @class */ (function () {
    function RouteCacheService() {
    }
    /**
     * 服务器启动时初始化路由缓存
     */
    RouteCacheService.initializeRouteCache = function (retries) {
        if (retries === void 0) { retries = 3; }
        return __awaiter(this, void 0, void 0, function () {
            var startTime, _loop_1, this_1, attempt, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        startTime = Date.now();
                        console.log('🔄 正在初始化路由缓存系统...');
                        _loop_1 = function (attempt) {
                            var error_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 6]);
                                        // 从数据库加载路由数据
                                        return [4 /*yield*/, this_1.loadRoutesFromDatabase()
                                            // 计算加载时间
                                        ];
                                    case 1:
                                        // 从数据库加载路由数据
                                        _b.sent();
                                        // 计算加载时间
                                        this_1.metrics.loadTime = Date.now() - startTime;
                                        console.log("\u2705 \u8DEF\u7531\u7F13\u5B58\u521D\u59CB\u5316\u5B8C\u6210");
                                        console.log("\uD83D\uDCCA \u7F13\u5B58\u7EDF\u8BA1:");
                                        console.log("   - \u8DEF\u7531\u603B\u6570: ".concat(this_1.cache.routeCount));
                                        console.log("   - \u89D2\u8272\u5206\u7EC4: ".concat(Object.keys(this_1.cache.routesByRole).length));
                                        console.log("   - \u52A0\u8F7D\u8017\u65F6: ".concat(this_1.metrics.loadTime, "ms"));
                                        console.log("   - \u7F13\u5B58\u72B6\u6001: ".concat(this_1.cache.isHealthy ? '健康' : '异常'));
                                        return [2 /*return*/, { value: void 0 }];
                                    case 2:
                                        error_1 = _b.sent();
                                        this_1.metrics.errorCount++;
                                        this_1.cache.isHealthy = false;
                                        if (!(attempt < retries)) return [3 /*break*/, 4];
                                        console.warn("\u26A0\uFE0F \u8DEF\u7531\u7F13\u5B58\u521D\u59CB\u5316\u5931\u8D25 (\u5C1D\u8BD5 ".concat(attempt, "/").concat(retries, "):"), error_1);
                                        console.log("\uD83D\uDD04 \u7B49\u5F85 ".concat(attempt * 1000, "ms \u540E\u91CD\u8BD5..."));
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, attempt * 1000); })];
                                    case 3:
                                        _b.sent();
                                        return [3 /*break*/, 5];
                                    case 4:
                                        console.error('❌ 路由缓存初始化最终失败:', error_1);
                                        console.error('💡 可能的原因:');
                                        console.error('   1. 数据库连接问题');
                                        console.error('   2. 模型关联未正确初始化 (RolePermission.initAssociations)');
                                        console.error('   3. 权限表数据损坏或缺失');
                                        console.error('🔧 解决方案: 手动调用 POST /api/admin/refresh-permission-cache');
                                        throw error_1;
                                    case 5: return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        attempt = 1;
                        _a.label = 1;
                    case 1:
                        if (!(attempt <= retries)) return [3 /*break*/, 4];
                        return [5 /*yield**/, _loop_1(attempt)];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        _a.label = 3;
                    case 3:
                        attempt++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从数据库加载路由数据
     */
    RouteCacheService.loadRoutesFromDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryStartTime, routes, routesData, rolePermissions, processingStartTime, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        queryStartTime = Date.now();
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, permission_model_1.Permission.findAll({
                                where: {
                                    status: 1,
                                    type: (_a = {}, _a[sequelize_1.Op["in"]] = ['category', 'menu', 'page', 'button'], _a)
                                },
                                order: [
                                    ['parent_id', 'ASC'],
                                    ['sort', 'ASC'],
                                    ['id', 'ASC']
                                ],
                                raw: false // 改为false以获取模型属性名（chineseName）而不是数据库字段名（chinese_name）
                            })
                            // 转换为普通对象，确保包含chineseName字段
                        ];
                    case 2:
                        routes = _b.sent();
                        routesData = routes.map(function (route) { return ({
                            id: route.id,
                            name: route.name,
                            chineseName: route.chineseName,
                            chinese_name: route.chineseName,
                            code: route.code,
                            type: route.type,
                            parentId: route.parentId,
                            parent_id: route.parentId,
                            path: route.path,
                            component: route.component,
                            icon: route.icon,
                            sort: route.sort,
                            status: route.status,
                            permission: route.permission
                        }); });
                        this.metrics.queryTime = Date.now() - queryStartTime;
                        console.log("\uD83D\uDD0D \u4ECE\u6570\u636E\u5E93\u67E5\u8BE2\u5230 ".concat(routesData.length, " \u6761\u8DEF\u7531\u8BB0\u5F55"));
                        console.log("\uD83D\uDD0D \u793A\u4F8B\u8DEF\u7531\u6570\u636E:", routesData.slice(0, 2).map(function (r) { return ({
                            name: r.name,
                            chineseName: r.chineseName,
                            chinese_name: r.chinese_name
                        }); }));
                        return [4 /*yield*/, this.loadRolePermissions()
                            // 处理和缓存数据
                        ];
                    case 3:
                        rolePermissions = _b.sent();
                        processingStartTime = Date.now();
                        return [4 /*yield*/, this.cacheRoutes(routesData, rolePermissions)];
                    case 4:
                        _b.sent();
                        this.metrics.processingTime = Date.now() - processingStartTime;
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _b.sent();
                        console.error('❌ 数据库查询失败:', error_2);
                        throw error_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 加载角色权限关系
     */
    RouteCacheService.loadRolePermissions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rolePermissions, permissionsByRole, _i, rolePermissions_1, rp, role, permission, roleKey, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, role_permission_model_1.RolePermission.findAll({
                                include: [
                                    { model: role_model_1.Role, as: 'role', attributes: ['id', 'name', 'code'] },
                                    { model: permission_model_1.Permission, as: 'permission', attributes: ['id', 'code', 'path'] }
                                ],
                                raw: false
                            })];
                    case 1:
                        rolePermissions = _a.sent();
                        permissionsByRole = {};
                        for (_i = 0, rolePermissions_1 = rolePermissions; _i < rolePermissions_1.length; _i++) {
                            rp = rolePermissions_1[_i];
                            role = rp.role;
                            permission = rp.permission;
                            if (role && permission) {
                                roleKey = role.code || role.name;
                                if (!permissionsByRole[roleKey]) {
                                    permissionsByRole[roleKey] = [];
                                }
                                permissionsByRole[roleKey].push(permission.code || permission.path);
                            }
                        }
                        console.log("\uD83D\uDD11 \u52A0\u8F7D\u4E86 ".concat(Object.keys(permissionsByRole).length, " \u4E2A\u89D2\u8272\u7684\u6743\u9650\u6620\u5C04"));
                        return [2 /*return*/, permissionsByRole];
                    case 2:
                        error_3 = _a.sent();
                        console.warn('⚠️ 角色权限加载失败，将使用基础权限检查:', error_3);
                        console.warn('💡 提示: 这可能是由于模型关联未正确初始化导致的');
                        console.warn('🔧 解决方案: 确保 RolePermission.initAssociations() 已被调用');
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 缓存路由数据
     */
    RouteCacheService.cacheRoutes = function (routes, rolePermissions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // 更新缓存数据
                this.cache.allRoutes = routes;
                this.cache.permissionsByRole = rolePermissions;
                this.cache.routeCount = routes.length;
                this.cache.lastLoadTime = Date.now();
                this.cache.version = "".concat(Date.now());
                this.cache.isHealthy = true;
                // 按角色分组路由
                this.cache.routesByRole = this.groupRoutesByRole(routes, rolePermissions);
                console.log('📦 路由数据已缓存到内存');
                return [2 /*return*/];
            });
        });
    };
    /**
     * 按角色分组路由
     */
    RouteCacheService.groupRoutesByRole = function (routes, rolePermissions) {
        var routesByRole = {};
        var _loop_2 = function (roleCode, permissions) {
            routesByRole[roleCode] = routes.filter(function (route) {
                // 检查路由是否在该角色的权限范围内
                return permissions.includes(route.code) ||
                    permissions.includes(route.path) ||
                    permissions.includes('*'); // 超级管理员权限
            });
        };
        // 为每个角色创建路由列表
        for (var _i = 0, _a = Object.entries(rolePermissions); _i < _a.length; _i++) {
            var _b = _a[_i], roleCode = _b[0], permissions = _b[1];
            _loop_2(roleCode, permissions);
        }
        // 添加默认分组
        routesByRole['default'] = routes.filter(function (route) { return !route.permission || route.permission === ''; });
        routesByRole['admin'] = routes; // 管理员拥有所有路由
        return routesByRole;
    };
    /**
     * 获取缓存的路由数据
     */
    RouteCacheService.getCachedRoutes = function (userRole) {
        if (!this.cache.isHealthy) {
            console.warn('⚠️ 路由缓存状态异常，返回空数组');
            return [];
        }
        if (userRole) {
            // 返回特定角色的路由
            var roleRoutes = this.cache.routesByRole[userRole] || this.cache.routesByRole['default'] || [];
            console.log("\uD83D\uDCCB \u8FD4\u56DE\u89D2\u8272 \"".concat(userRole, "\" \u7684\u8DEF\u7531: ").concat(roleRoutes.length, " \u6761"));
            return roleRoutes;
        }
        // 返回所有路由
        console.log("\uD83D\uDCCB \u8FD4\u56DE\u6240\u6709\u8DEF\u7531: ".concat(this.cache.allRoutes.length, " \u6761"));
        return this.cache.allRoutes;
    };
    /**
     * 获取用户权限列表
     */
    RouteCacheService.getUserPermissions = function (userRole) {
        return this.cache.permissionsByRole[userRole] || [];
    };
    /**
     * 刷新缓存
     */
    RouteCacheService.refreshCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var oldRouteCount, newRouteCount, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('🔄 开始刷新路由缓存...');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        oldRouteCount = this.cache.routeCount;
                        return [4 /*yield*/, this.loadRoutesFromDatabase()];
                    case 2:
                        _a.sent();
                        newRouteCount = this.cache.routeCount;
                        console.log("\u2705 \u8DEF\u7531\u7F13\u5B58\u5237\u65B0\u5B8C\u6210: ".concat(oldRouteCount, " \u2192 ").concat(newRouteCount, " \u6761\u8DEF\u7531"));
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        this.metrics.errorCount++;
                        console.error('❌ 路由缓存刷新失败:', error_4);
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取缓存状态信息
     */
    RouteCacheService.getCacheStatus = function () {
        return __assign(__assign(__assign({}, this.cache), this.metrics), { cacheAge: Date.now() - this.cache.lastLoadTime });
    };
    /**
     * 获取最后加载时间
     */
    RouteCacheService.getLastLoadTime = function () {
        return this.cache.lastLoadTime;
    };
    /**
     * 检查缓存健康状态
     */
    RouteCacheService.isHealthy = function () {
        return this.cache.isHealthy && this.cache.routeCount > 0;
    };
    /**
     * 清空缓存 (仅用于测试)
     */
    RouteCacheService.clearCache = function () {
        console.log('🗑️ 清空路由缓存');
        this.cache = {
            allRoutes: [],
            routesByRole: {},
            permissionsByRole: {},
            lastLoadTime: 0,
            version: '1.0.0',
            routeCount: 0,
            isHealthy: false
        };
    };
    /**
     * 获取性能指标
     */
    RouteCacheService.getMetrics = function () {
        return __assign({}, this.metrics);
    };
    /**
     * 缓存预热 (可选功能)
     */
    RouteCacheService.warmupCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var commonRoles, _i, commonRoles_1, role, routes;
            return __generator(this, function (_a) {
                console.log('🔥 开始缓存预热...');
                commonRoles = ['admin', 'principal', 'teacher', 'parent'];
                for (_i = 0, commonRoles_1 = commonRoles; _i < commonRoles_1.length; _i++) {
                    role = commonRoles_1[_i];
                    routes = this.getCachedRoutes(role);
                    console.log("\uD83D\uDD25 \u9884\u70ED\u89D2\u8272 \"".concat(role, "\": ").concat(routes.length, " \u6761\u8DEF\u7531"));
                }
                console.log('✅ 缓存预热完成');
                return [2 /*return*/];
            });
        });
    };
    RouteCacheService.cache = {
        allRoutes: [],
        routesByRole: {},
        permissionsByRole: {},
        lastLoadTime: 0,
        version: '1.0.0',
        routeCount: 0,
        isHealthy: false
    };
    RouteCacheService.metrics = {
        loadTime: 0,
        queryTime: 0,
        processingTime: 0,
        errorCount: 0
    };
    return RouteCacheService;
}());
exports.RouteCacheService = RouteCacheService;
