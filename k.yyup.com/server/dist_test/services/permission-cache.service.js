"use strict";
/**
 * 权限缓存服务
 *
 * 提供权限相关的缓存功能：
 * - 用户权限缓存
 * - 角色权限缓存
 * - 动态路由缓存
 * - 权限检查缓存
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
var redis_service_1 = __importDefault(require("./redis.service"));
var redis_config_1 = require("../config/redis.config");
var database_1 = require("../database");
var sequelize_1 = require("sequelize");
var PermissionCacheService = /** @class */ (function () {
    function PermissionCacheService() {
    }
    /**
     * 获取用户权限列表（带缓存）
     * @param userId 用户ID
     * @returns 权限代码数组
     */
    PermissionCacheService.getUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, startTime, userRoles, roleCodes, isAdmin, permissions, allPermissions, userPermissions, queryTime, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(redis_config_1.RedisKeyPrefix.USER_PERMISSIONS).concat(userId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        return [4 /*yield*/, redis_service_1["default"].get(cacheKey)];
                    case 2:
                        cached = _a.sent();
                        if (cached && Array.isArray(cached)) {
                            console.log("\u2705 \u547D\u4E2D\u6743\u9650\u7F13\u5B58: \u7528\u6237".concat(userId, ", ").concat(cached.length, "\u4E2A\u6743\u9650"));
                            return [2 /*return*/, cached];
                        }
                        // 2. 从数据库查询
                        console.log("\uD83D\uDD0D \u4ECE\u6570\u636E\u5E93\u67E5\u8BE2\u7528\u6237\u6743\u9650: \u7528\u6237".concat(userId));
                        startTime = Date.now();
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT DISTINCT r.code\n        FROM roles r\n        INNER JOIN user_roles ur ON r.id = ur.role_id\n        WHERE ur.user_id = :userId AND r.status = 1\n      ", {
                                replacements: { userId: userId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        userRoles = _a.sent();
                        if (userRoles.length === 0) {
                            console.warn("\u26A0\uFE0F \u7528\u6237\u6CA1\u6709\u89D2\u8272: ".concat(userId));
                            return [2 /*return*/, []];
                        }
                        roleCodes = userRoles.map(function (r) { return r.code; });
                        isAdmin = roleCodes.some(function (code) { return code === 'admin' || code === 'super_admin'; });
                        permissions = [];
                        if (!isAdmin) return [3 /*break*/, 5];
                        return [4 /*yield*/, database_1.sequelize.query("\n          SELECT DISTINCT code\n          FROM permissions\n          WHERE status = 1 AND code IS NOT NULL AND code != ''\n          ORDER BY sort, id\n        ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 4:
                        allPermissions = _a.sent();
                        permissions = allPermissions.map(function (p) { return p.code; });
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database_1.sequelize.query("\n          SELECT DISTINCT p.code\n          FROM permissions p\n          INNER JOIN role_permissions rp ON p.id = rp.permission_id\n          INNER JOIN roles r ON rp.role_id = r.id\n          INNER JOIN user_roles ur ON r.id = ur.role_id\n          WHERE ur.user_id = :userId\n            AND p.status = 1\n            AND r.status = 1\n            AND p.code IS NOT NULL\n            AND p.code != ''\n          ORDER BY p.sort, p.id\n        ", {
                            replacements: { userId: userId },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                    case 6:
                        userPermissions = _a.sent();
                        permissions = userPermissions.map(function (p) { return p.code; });
                        _a.label = 7;
                    case 7:
                        queryTime = Date.now() - startTime;
                        console.log("\uD83D\uDCCA \u6570\u636E\u5E93\u67E5\u8BE2\u5B8C\u6210: \u7528\u6237".concat(userId, ", ").concat(permissions.length, "\u4E2A\u6743\u9650, \u8017\u65F6").concat(queryTime, "ms"));
                        if (!(permissions.length > 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, redis_service_1["default"].set(cacheKey, permissions, redis_config_1.RedisTTL.USER_PERMISSIONS)];
                    case 8:
                        _a.sent();
                        console.log("\uD83D\uDCBE \u6743\u9650\u5DF2\u7F13\u5B58: \u7528\u6237".concat(userId, ", TTL=").concat(redis_config_1.RedisTTL.USER_PERMISSIONS, "\u79D2"));
                        _a.label = 9;
                    case 9: return [2 /*return*/, permissions];
                    case 10:
                        error_1 = _a.sent();
                        console.error("\u274C \u83B7\u53D6\u7528\u6237\u6743\u9650\u5931\u8D25: \u7528\u6237".concat(userId), error_1);
                        return [2 /*return*/, []];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取角色权限列表（带缓存）
     * @param roleCode 角色代码
     * @returns 权限代码数组
     */
    PermissionCacheService.getRolePermissions = function (roleCode) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, startTime, rolePermissions, permissions, queryTime, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(redis_config_1.RedisKeyPrefix.ROLE_PERMISSIONS).concat(roleCode);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, redis_service_1["default"].get(cacheKey)];
                    case 2:
                        cached = _a.sent();
                        if (cached && Array.isArray(cached)) {
                            console.log("\u2705 \u547D\u4E2D\u89D2\u8272\u6743\u9650\u7F13\u5B58: ".concat(roleCode, ", ").concat(cached.length, "\u4E2A\u6743\u9650"));
                            return [2 /*return*/, cached];
                        }
                        // 2. 从数据库查询
                        console.log("\uD83D\uDD0D \u4ECE\u6570\u636E\u5E93\u67E5\u8BE2\u89D2\u8272\u6743\u9650: ".concat(roleCode));
                        startTime = Date.now();
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT DISTINCT p.code\n        FROM permissions p\n        INNER JOIN role_permissions rp ON p.id = rp.permission_id\n        INNER JOIN roles r ON rp.role_id = r.id\n        WHERE r.code = :roleCode\n          AND p.status = 1\n          AND r.status = 1\n          AND p.code IS NOT NULL\n          AND p.code != ''\n        ORDER BY p.sort, p.id\n      ", {
                                replacements: { roleCode: roleCode },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        rolePermissions = _a.sent();
                        permissions = rolePermissions.map(function (p) { return p.code; });
                        queryTime = Date.now() - startTime;
                        console.log("\uD83D\uDCCA \u6570\u636E\u5E93\u67E5\u8BE2\u5B8C\u6210: \u89D2\u8272".concat(roleCode, ", ").concat(permissions.length, "\u4E2A\u6743\u9650, \u8017\u65F6").concat(queryTime, "ms"));
                        if (!(permissions.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, redis_service_1["default"].set(cacheKey, permissions, redis_config_1.RedisTTL.ROLE_PERMISSIONS)];
                    case 4:
                        _a.sent();
                        console.log("\uD83D\uDCBE \u89D2\u8272\u6743\u9650\u5DF2\u7F13\u5B58: ".concat(roleCode, ", TTL=").concat(redis_config_1.RedisTTL.ROLE_PERMISSIONS, "\u79D2"));
                        _a.label = 5;
                    case 5: return [2 /*return*/, permissions];
                    case 6:
                        error_2 = _a.sent();
                        console.error("\u274C \u83B7\u53D6\u89D2\u8272\u6743\u9650\u5931\u8D25: ".concat(roleCode), error_2);
                        return [2 /*return*/, []];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户动态路由（带缓存）
     * @param userId 用户ID
     * @returns 权限数据数组
     */
    PermissionCacheService.getDynamicRoutes = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, startTime, userRoles, roleCodes, isAdmin, routes, queryTime, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(redis_config_1.RedisKeyPrefix.DYNAMIC_ROUTES).concat(userId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 10, , 11]);
                        return [4 /*yield*/, redis_service_1["default"].get(cacheKey)];
                    case 2:
                        cached = _a.sent();
                        if (cached && Array.isArray(cached)) {
                            console.log("\u2705 \u547D\u4E2D\u52A8\u6001\u8DEF\u7531\u7F13\u5B58: \u7528\u6237".concat(userId, ", ").concat(cached.length, "\u6761\u8DEF\u7531"));
                            return [2 /*return*/, cached];
                        }
                        // 2. 从数据库查询
                        console.log("\uD83D\uDD0D \u4ECE\u6570\u636E\u5E93\u67E5\u8BE2\u52A8\u6001\u8DEF\u7531: \u7528\u6237".concat(userId));
                        startTime = Date.now();
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT DISTINCT r.code\n        FROM roles r\n        INNER JOIN user_roles ur ON r.id = ur.role_id\n        WHERE ur.user_id = :userId AND r.status = 1\n      ", {
                                replacements: { userId: userId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        userRoles = _a.sent();
                        if (userRoles.length === 0) {
                            console.warn("\u26A0\uFE0F \u7528\u6237\u6CA1\u6709\u89D2\u8272: ".concat(userId));
                            return [2 /*return*/, []];
                        }
                        roleCodes = userRoles.map(function (r) { return r.code; });
                        isAdmin = roleCodes.some(function (code) { return code === 'admin' || code === 'super_admin'; });
                        routes = [];
                        if (!isAdmin) return [3 /*break*/, 5];
                        return [4 /*yield*/, database_1.sequelize.query("\n          SELECT\n            p.id,\n            p.name,\n            p.chinese_name,\n            p.code,\n            p.type,\n            p.parent_id,\n            p.path,\n            p.component,\n            p.file_path,\n            p.permission,\n            p.icon,\n            p.sort,\n            p.status\n          FROM permissions p\n          WHERE p.status = 1\n          ORDER BY p.sort, p.id\n        ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 4:
                        // 管理员获取所有路由
                        routes = _a.sent();
                        return [3 /*break*/, 7];
                    case 5: return [4 /*yield*/, database_1.sequelize.query("\n          SELECT DISTINCT\n            p.id,\n            p.name,\n            p.chinese_name,\n            p.code,\n            p.type,\n            p.parent_id,\n            p.path,\n            p.component,\n            p.file_path,\n            p.permission,\n            p.icon,\n            p.sort,\n            p.status\n          FROM permissions p\n          INNER JOIN role_permissions rp ON p.id = rp.permission_id\n          INNER JOIN roles r ON rp.role_id = r.id\n          INNER JOIN user_roles ur ON r.id = ur.role_id\n          WHERE ur.user_id = :userId\n            AND p.status = 1\n            AND r.status = 1\n          ORDER BY p.sort, p.id\n        ", {
                            replacements: { userId: userId },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                    case 6:
                        // 普通用户查询路由
                        routes = _a.sent();
                        _a.label = 7;
                    case 7:
                        queryTime = Date.now() - startTime;
                        console.log("\uD83D\uDCCA \u6570\u636E\u5E93\u67E5\u8BE2\u5B8C\u6210: \u7528\u6237".concat(userId, ", ").concat(routes.length, "\u6761\u8DEF\u7531, \u8017\u65F6").concat(queryTime, "ms"));
                        if (!(routes.length > 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, redis_service_1["default"].set(cacheKey, routes, redis_config_1.RedisTTL.DYNAMIC_ROUTES)];
                    case 8:
                        _a.sent();
                        console.log("\uD83D\uDCBE \u52A8\u6001\u8DEF\u7531\u5DF2\u7F13\u5B58: \u7528\u6237".concat(userId, ", TTL=").concat(redis_config_1.RedisTTL.DYNAMIC_ROUTES, "\u79D2"));
                        _a.label = 9;
                    case 9: return [2 /*return*/, routes];
                    case 10:
                        error_3 = _a.sent();
                        console.error("\u274C \u83B7\u53D6\u52A8\u6001\u8DEF\u7531\u5931\u8D25: \u7528\u6237".concat(userId), error_3);
                        return [2 /*return*/, []];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查用户是否有指定权限（带缓存）
     * @param userId 用户ID
     * @param permissionCode 权限代码
     * @returns 是否有权限
     */
    PermissionCacheService.checkPermission = function (userId, permissionCode) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, permissions, hasPermission, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(redis_config_1.RedisKeyPrefix.PERMISSION_CHECK).concat(userId, ":").concat(permissionCode);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, redis_service_1["default"].get(cacheKey)];
                    case 2:
                        cached = _a.sent();
                        if (cached !== null) {
                            console.log("\u2705 \u547D\u4E2D\u6743\u9650\u68C0\u67E5\u7F13\u5B58: \u7528\u6237".concat(userId, ", \u6743\u9650").concat(permissionCode, ", \u7ED3\u679C=").concat(cached));
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, this.getUserPermissions(userId)];
                    case 3:
                        permissions = _a.sent();
                        hasPermission = permissions.includes(permissionCode);
                        console.log("\uD83D\uDD0D \u6743\u9650\u68C0\u67E5: \u7528\u6237".concat(userId, ", \u6743\u9650").concat(permissionCode, ", \u7ED3\u679C=").concat(hasPermission));
                        // 3. 写入缓存
                        return [4 /*yield*/, redis_service_1["default"].set(cacheKey, hasPermission, redis_config_1.RedisTTL.PERMISSION_CHECK)];
                    case 4:
                        // 3. 写入缓存
                        _a.sent();
                        return [2 /*return*/, hasPermission];
                    case 5:
                        error_4 = _a.sent();
                        console.error("\u274C \u6743\u9650\u68C0\u67E5\u5931\u8D25: \u7528\u6237".concat(userId, ", \u6743\u9650").concat(permissionCode), error_4);
                        return [2 /*return*/, false];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量检查用户权限（带缓存）
     * @param userId 用户ID
     * @param permissionCodes 权限代码数组
     * @returns 权限检查结果对象
     */
    PermissionCacheService.checkPermissions = function (userId, permissionCodes) {
        return __awaiter(this, void 0, void 0, function () {
            var permissions, permissionSet, results, _i, permissionCodes_1, code, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getUserPermissions(userId)];
                    case 1:
                        permissions = _a.sent();
                        permissionSet = new Set(permissions);
                        results = {};
                        for (_i = 0, permissionCodes_1 = permissionCodes; _i < permissionCodes_1.length; _i++) {
                            code = permissionCodes_1[_i];
                            results[code] = permissionSet.has(code);
                        }
                        console.log("\uD83D\uDD0D \u6279\u91CF\u6743\u9650\u68C0\u67E5: \u7528\u6237".concat(userId, ", ").concat(permissionCodes.length, "\u4E2A\u6743\u9650"));
                        return [2 /*return*/, results];
                    case 2:
                        error_5 = _a.sent();
                        console.error("\u274C \u6279\u91CF\u6743\u9650\u68C0\u67E5\u5931\u8D25: \u7528\u6237".concat(userId), error_5);
                        return [2 /*return*/, {}];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查用户是否有访问路径的权限（带缓存）
     * @param userId 用户ID
     * @param path 路径
     * @returns 是否有权限
     */
    PermissionCacheService.checkPathPermission = function (userId, path) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, permissions, hasPermission, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(redis_config_1.RedisKeyPrefix.PATH_PERMISSION).concat(userId, ":").concat(path);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 8, , 9]);
                        return [4 /*yield*/, redis_service_1["default"].get(cacheKey)];
                    case 2:
                        cached = _a.sent();
                        if (cached !== null) {
                            console.log("\u2705 \u547D\u4E2D\u8DEF\u5F84\u6743\u9650\u7F13\u5B58: \u7528\u6237".concat(userId, ", \u8DEF\u5F84").concat(path, ", \u7ED3\u679C=").concat(cached));
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT code\n        FROM permissions\n        WHERE status = 1 AND path = :path\n        LIMIT 1\n      ", {
                                replacements: { path: path },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        permissions = _a.sent();
                        if (!(permissions.length === 0)) return [3 /*break*/, 5];
                        console.warn("\u26A0\uFE0F \u8DEF\u5F84\u6743\u9650\u4E0D\u5B58\u5728: ".concat(path));
                        return [4 /*yield*/, redis_service_1["default"].set(cacheKey, false, redis_config_1.RedisTTL.PATH_PERMISSION)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, false];
                    case 5: return [4 /*yield*/, this.checkPermission(userId, permissions[0].code)];
                    case 6:
                        hasPermission = _a.sent();
                        // 4. 写入缓存
                        return [4 /*yield*/, redis_service_1["default"].set(cacheKey, hasPermission, redis_config_1.RedisTTL.PATH_PERMISSION)];
                    case 7:
                        // 4. 写入缓存
                        _a.sent();
                        return [2 /*return*/, hasPermission];
                    case 8:
                        error_6 = _a.sent();
                        console.error("\u274C \u8DEF\u5F84\u6743\u9650\u68C0\u67E5\u5931\u8D25: \u7528\u6237".concat(userId, ", \u8DEF\u5F84").concat(path), error_6);
                        return [2 /*return*/, false];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户完整权限信息（带缓存）
     * @param userId 用户ID
     * @returns 用户权限信息
     */
    PermissionCacheService.getUserPermissionInfo = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, cached, userRoles, roleCodes, isAdmin, permissions, info, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cacheKey = "".concat(redis_config_1.RedisKeyPrefix.USER_PERMISSION_INFO).concat(userId);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 7]);
                        return [4 /*yield*/, redis_service_1["default"].get(cacheKey)];
                    case 2:
                        cached = _a.sent();
                        if (cached) {
                            console.log("\u2705 \u547D\u4E2D\u7528\u6237\u6743\u9650\u4FE1\u606F\u7F13\u5B58: \u7528\u6237".concat(userId));
                            return [2 /*return*/, cached];
                        }
                        return [4 /*yield*/, database_1.sequelize.query("\n        SELECT DISTINCT r.code\n        FROM roles r\n        INNER JOIN user_roles ur ON r.id = ur.role_id\n        WHERE ur.user_id = :userId AND r.status = 1\n      ", {
                                replacements: { userId: userId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        userRoles = _a.sent();
                        if (userRoles.length === 0) {
                            console.warn("\u26A0\uFE0F \u7528\u6237\u6CA1\u6709\u89D2\u8272: ".concat(userId));
                            return [2 /*return*/, { permissions: [], roles: [], isAdmin: false }];
                        }
                        roleCodes = userRoles.map(function (r) { return r.code; });
                        isAdmin = roleCodes.some(function (code) { return code === 'admin' || code === 'super_admin'; });
                        return [4 /*yield*/, this.getUserPermissions(userId)];
                    case 4:
                        permissions = _a.sent();
                        info = {
                            permissions: permissions,
                            roles: roleCodes,
                            isAdmin: isAdmin
                        };
                        // 3. 写入缓存
                        return [4 /*yield*/, redis_service_1["default"].set(cacheKey, info, redis_config_1.RedisTTL.USER_PERMISSION_INFO)];
                    case 5:
                        // 3. 写入缓存
                        _a.sent();
                        console.log("\uD83D\uDCBE \u7528\u6237\u6743\u9650\u4FE1\u606F\u5DF2\u7F13\u5B58: \u7528\u6237".concat(userId));
                        return [2 /*return*/, info];
                    case 6:
                        error_7 = _a.sent();
                        console.error("\u274C \u83B7\u53D6\u7528\u6237\u6743\u9650\u4FE1\u606F\u5931\u8D25: \u7528\u6237".concat(userId), error_7);
                        return [2 /*return*/, { permissions: [], roles: [], isAdmin: false }];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除用户权限缓存
     * @param userId 用户ID
     */
    PermissionCacheService.clearUserCache = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, _i, patterns_1, pattern, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        patterns = [
                            "".concat(redis_config_1.RedisKeyPrefix.USER_PERMISSIONS).concat(userId),
                            "".concat(redis_config_1.RedisKeyPrefix.DYNAMIC_ROUTES).concat(userId),
                            "".concat(redis_config_1.RedisKeyPrefix.USER_PERMISSION_INFO).concat(userId),
                            "".concat(redis_config_1.RedisKeyPrefix.PERMISSION_CHECK).concat(userId, ":*"),
                            "".concat(redis_config_1.RedisKeyPrefix.PATH_PERMISSION).concat(userId, ":*")
                        ];
                        _i = 0, patterns_1 = patterns;
                        _a.label = 1;
                    case 1:
                        if (!(_i < patterns_1.length)) return [3 /*break*/, 6];
                        pattern = patterns_1[_i];
                        if (!pattern.includes('*')) return [3 /*break*/, 3];
                        return [4 /*yield*/, redis_service_1["default"].delPattern(pattern)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, redis_service_1["default"].del(pattern)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6:
                        console.log("\uD83D\uDDD1\uFE0F \u5DF2\u6E05\u9664\u7528\u6237\u7F13\u5B58: \u7528\u6237".concat(userId));
                        return [3 /*break*/, 8];
                    case 7:
                        error_8 = _a.sent();
                        console.error("\u274C \u6E05\u9664\u7528\u6237\u7F13\u5B58\u5931\u8D25: \u7528\u6237".concat(userId), error_8);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除角色权限缓存
     * @param roleCode 角色代码
     */
    PermissionCacheService.clearRoleCache = function (roleCode) {
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cacheKey = "".concat(redis_config_1.RedisKeyPrefix.ROLE_PERMISSIONS).concat(roleCode);
                        return [4 /*yield*/, redis_service_1["default"].del(cacheKey)];
                    case 1:
                        _a.sent();
                        console.log("\uD83D\uDDD1\uFE0F \u5DF2\u6E05\u9664\u89D2\u8272\u7F13\u5B58: ".concat(roleCode));
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        console.error("\u274C \u6E05\u9664\u89D2\u8272\u7F13\u5B58\u5931\u8D25: ".concat(roleCode), error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 清除所有权限相关缓存
     */
    PermissionCacheService.clearAllCache = function () {
        return __awaiter(this, void 0, void 0, function () {
            var patterns, _i, patterns_2, pattern, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        patterns = [
                            "".concat(redis_config_1.RedisKeyPrefix.USER_PERMISSIONS, "*"),
                            "".concat(redis_config_1.RedisKeyPrefix.ROLE_PERMISSIONS, "*"),
                            "".concat(redis_config_1.RedisKeyPrefix.DYNAMIC_ROUTES, "*"),
                            "".concat(redis_config_1.RedisKeyPrefix.USER_PERMISSION_INFO, "*"),
                            "".concat(redis_config_1.RedisKeyPrefix.PERMISSION_CHECK, "*"),
                            "".concat(redis_config_1.RedisKeyPrefix.PATH_PERMISSION, "*")
                        ];
                        _i = 0, patterns_2 = patterns;
                        _a.label = 1;
                    case 1:
                        if (!(_i < patterns_2.length)) return [3 /*break*/, 4];
                        pattern = patterns_2[_i];
                        return [4 /*yield*/, redis_service_1["default"].delPattern(pattern)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log("\uD83D\uDDD1\uFE0F \u5DF2\u6E05\u9664\u6240\u6709\u6743\u9650\u7F13\u5B58");
                        return [3 /*break*/, 6];
                    case 5:
                        error_10 = _a.sent();
                        console.error("\u274C \u6E05\u9664\u6240\u6709\u6743\u9650\u7F13\u5B58\u5931\u8D25", error_10);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取缓存统计信息
     */
    PermissionCacheService.getCacheStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var stats, patterns, _i, patterns_3, _a, key, pattern, keys, error_11;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 6]);
                        stats = {
                            userPermissions: 0,
                            rolePermissions: 0,
                            dynamicRoutes: 0,
                            permissionChecks: 0,
                            pathPermissions: 0
                        };
                        patterns = [
                            { key: 'userPermissions', pattern: "".concat(redis_config_1.RedisKeyPrefix.USER_PERMISSIONS, "*") },
                            { key: 'rolePermissions', pattern: "".concat(redis_config_1.RedisKeyPrefix.ROLE_PERMISSIONS, "*") },
                            { key: 'dynamicRoutes', pattern: "".concat(redis_config_1.RedisKeyPrefix.DYNAMIC_ROUTES, "*") },
                            { key: 'permissionChecks', pattern: "".concat(redis_config_1.RedisKeyPrefix.PERMISSION_CHECK, "*") },
                            { key: 'pathPermissions', pattern: "".concat(redis_config_1.RedisKeyPrefix.PATH_PERMISSION, "*") }
                        ];
                        _i = 0, patterns_3 = patterns;
                        _b.label = 1;
                    case 1:
                        if (!(_i < patterns_3.length)) return [3 /*break*/, 4];
                        _a = patterns_3[_i], key = _a.key, pattern = _a.pattern;
                        return [4 /*yield*/, redis_service_1["default"].keys(pattern)];
                    case 2:
                        keys = _b.sent();
                        stats[key] = keys.length;
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, stats];
                    case 5:
                        error_11 = _b.sent();
                        console.error("\u274C \u83B7\u53D6\u7F13\u5B58\u7EDF\u8BA1\u5931\u8D25", error_11);
                        return [2 /*return*/, {
                                userPermissions: 0,
                                rolePermissions: 0,
                                dynamicRoutes: 0,
                                permissionChecks: 0,
                                pathPermissions: 0
                            }];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return PermissionCacheService;
}());
exports["default"] = PermissionCacheService;
