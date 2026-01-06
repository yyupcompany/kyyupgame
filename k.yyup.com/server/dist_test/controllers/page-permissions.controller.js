"use strict";
/**
 * 页面权限控制器 - Level 3: 页面操作权限管理
 * Page Permissions Controller - Level 3: Page Action Permissions Management
 *
 * 功能：
 * 1. 获取页面内的操作权限（button类型）
 * 2. 批量权限验证
 * 3. 页面权限缓存管理
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
exports.__esModule = true;
exports.batchCheckPermissions = exports.getPageActions = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var route_cache_service_1 = require("../services/route-cache.service");
/**
 * Level 3: 获取页面操作权限
 * GET /api/permissions/page-actions?pageId={pageId}
 */
var getPageActions = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, _a, pageId_1, pagePath_1, startTime, pagePermissions, fromCache, allRoutes, cacheError_1, whereCondition, replacements, totalTime, groupedPermissions, error_1;
    var _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 8, , 9]);
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                userRole = (_c = req.user) === null || _c === void 0 ? void 0 : _c.role;
                _a = req.query, pageId_1 = _a.pageId, pagePath_1 = _a.pagePath;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        error: 'UNAUTHORIZED',
                        message: '用户未登录'
                    });
                    return [2 /*return*/];
                }
                console.log("\uD83D\uDD0D Level 3: \u83B7\u53D6\u9875\u9762\u64CD\u4F5C\u6743\u9650 - \u9875\u9762ID: ".concat(pageId_1, ", \u8DEF\u5F84: ").concat(pagePath_1, ", \u7528\u6237: ").concat(userId));
                startTime = Date.now();
                pagePermissions = [];
                fromCache = false;
                _d.label = 1;
            case 1:
                _d.trys.push([1, 2, , 7]);
                // 🚀 优先使用缓存获取页面权限
                if (route_cache_service_1.RouteCacheService.isHealthy()) {
                    console.log('✅ Level 3: 路由缓存健康，从缓存获取页面权限');
                    allRoutes = route_cache_service_1.RouteCacheService.getCachedRoutes();
                    // 获取指定页面的子权限（button类型）
                    pagePermissions = allRoutes.filter(function (route) {
                        var _a;
                        var isButtonType = route.type === 'button';
                        var belongsToPage = pageId_1 ? route.parent_id == pageId_1 : (_a = route.path) === null || _a === void 0 ? void 0 : _a.includes(pagePath_1);
                        return route.status === 1 && isButtonType && belongsToPage;
                    });
                    fromCache = true;
                    console.log("\uD83D\uDCCA Level 3: \u4ECE\u7F13\u5B58\u83B7\u53D6\u9875\u9762\u6743\u9650 ".concat(pagePermissions.length, " \u6761\uFF0C\u8017\u65F6: ").concat(Date.now() - startTime, "ms"));
                }
                else {
                    console.warn('⚠️ Level 3: 路由缓存不健康，降级到数据库查询');
                    throw new Error('缓存不健康');
                }
                return [3 /*break*/, 7];
            case 2:
                cacheError_1 = _d.sent();
                console.warn('⚠️ Level 3: 缓存获取失败，使用数据库查询:', cacheError_1.message);
                whereCondition = '';
                replacements = { userId: userId };
                if (pageId_1) {
                    whereCondition = 'AND p.parent_id = :pageId';
                    replacements.pageId = pageId_1;
                }
                else if (pagePath_1) {
                    whereCondition = 'AND p.path LIKE :pagePath';
                    replacements.pagePath = "%".concat(pagePath_1, "%");
                }
                if (!(userRole === 'admin')) return [3 /*break*/, 4];
                return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            p.id,\n            p.name,\n            p.chinese_name,\n            p.code,\n            p.type,\n            p.parent_id,\n            p.path,\n            p.component,\n            p.permission,\n            p.icon,\n            p.sort,\n            p.status\n          FROM permissions p\n          WHERE p.status = 1\n            AND p.type = 'button'\n            ".concat(whereCondition, "\n          ORDER BY p.sort, p.id\n        "), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                // 管理员获取所有权限
                pagePermissions = (_d.sent());
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, init_1.sequelize.query("\n          SELECT DISTINCT\n            p.id,\n            p.name,\n            p.chinese_name,\n            p.code,\n            p.type,\n            p.parent_id,\n            p.path,\n            p.component,\n            p.permission,\n            p.icon,\n            p.sort,\n            p.status\n          FROM permissions p\n          INNER JOIN role_permissions rp ON p.id = rp.permission_id\n          INNER JOIN roles r ON rp.role_id = r.id\n          INNER JOIN user_roles ur ON r.id = ur.role_id\n          WHERE ur.user_id = :userId\n            AND p.status = 1\n            AND r.status = 1\n            AND p.type = 'button'\n            ".concat(whereCondition, "\n          ORDER BY p.sort, p.id\n        "), {
                    replacements: replacements,
                    type: sequelize_1.QueryTypes.SELECT
                })];
            case 5:
                // 普通用户只获取有权限的操作
                pagePermissions = (_d.sent());
                _d.label = 6;
            case 6:
                console.log("\uD83D\uDCCA Level 3: \u4ECE\u6570\u636E\u5E93\u83B7\u53D6\u9875\u9762\u6743\u9650 ".concat(pagePermissions.length, " \u6761\uFF0C\u8017\u65F6: ").concat(Date.now() - startTime, "ms"));
                return [3 /*break*/, 7];
            case 7:
                totalTime = Date.now() - startTime;
                console.log("\u26A1 Level 3: \u9875\u9762\u6743\u9650\u83B7\u53D6\u5B8C\u6210\uFF0C\u603B\u8017\u65F6: ".concat(totalTime, "ms"));
                groupedPermissions = {
                    actions: pagePermissions.filter(function (p) { var _a, _b, _c; return ((_a = p.permission) === null || _a === void 0 ? void 0 : _a.includes('_VIEW')) || ((_b = p.permission) === null || _b === void 0 ? void 0 : _b.includes('_EDIT')) || ((_c = p.permission) === null || _c === void 0 ? void 0 : _c.includes('_DELETE')); }),
                    navigation: pagePermissions.filter(function (p) { return p.path && !p.permission; }),
                    operations: pagePermissions.filter(function (p) { return p.permission && !p.permission.includes('_VIEW') && !p.permission.includes('_EDIT') && !p.permission.includes('_DELETE'); })
                };
                res.json({
                    success: true,
                    data: {
                        permissions: pagePermissions,
                        grouped: groupedPermissions,
                        summary: {
                            total: pagePermissions.length,
                            actions: groupedPermissions.actions.length,
                            navigation: groupedPermissions.navigation.length,
                            operations: groupedPermissions.operations.length
                        }
                    },
                    meta: {
                        userId: userId,
                        userRole: userRole,
                        pageId: pageId_1,
                        pagePath: pagePath_1,
                        fromCache: fromCache,
                        responseTime: totalTime,
                        level: 3,
                        description: '页面操作权限',
                        timestamp: Date.now()
                    }
                });
                return [3 /*break*/, 9];
            case 8:
                error_1 = _d.sent();
                console.error('❌ Level 3: 获取页面权限失败:', error_1);
                next(new apiError_1.ApiError(500, '获取页面权限失败'));
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); };
exports.getPageActions = getPageActions;
/**
 * Level 3: 批量权限验证
 * POST /api/permissions/batch-check
 */
var batchCheckPermissions = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, userRole, permissionsToCheck, startTime, results_1, permissionCodes, userPermissions, userPermissionCodes_1, totalTime, hasPermissionCount, error_2;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                permissionsToCheck = req.body.permissions;
                if (!userId) {
                    res.status(401).json({
                        success: false,
                        error: 'UNAUTHORIZED',
                        message: '用户未登录'
                    });
                    return [2 /*return*/];
                }
                if (!Array.isArray(permissionsToCheck) || permissionsToCheck.length === 0) {
                    res.status(400).json({
                        success: false,
                        error: 'INVALID_PARAMS',
                        message: '权限列表不能为空'
                    });
                    return [2 /*return*/];
                }
                console.log("\uD83D\uDD0D Level 3: \u6279\u91CF\u6743\u9650\u9A8C\u8BC1 - ".concat(permissionsToCheck.length, " \u4E2A\u6743\u9650\uFF0C\u7528\u6237: ").concat(userId));
                startTime = Date.now();
                results_1 = {};
                if (!(userRole === 'admin')) return [3 /*break*/, 1];
                permissionsToCheck.forEach(function (permission) {
                    results_1[permission] = true;
                });
                console.log("\u26A1 Level 3: \u7BA1\u7406\u5458\u6279\u91CF\u6743\u9650\u9A8C\u8BC1\u5B8C\u6210\uFF0C\u603B\u8017\u65F6: ".concat(Date.now() - startTime, "ms"));
                return [3 /*break*/, 3];
            case 1:
                permissionCodes = permissionsToCheck.map(function (p) { return "'".concat(p, "'"); }).join(',');
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT DISTINCT p.code, p.path\n        FROM permissions p\n        INNER JOIN role_permissions rp ON p.id = rp.permission_id\n        INNER JOIN roles r ON rp.role_id = r.id\n        INNER JOIN user_roles ur ON r.id = ur.role_id\n        WHERE ur.user_id = :userId \n          AND p.status = 1\n          AND r.status = 1\n          AND (p.code IN (".concat(permissionCodes, ") OR p.path IN (").concat(permissionCodes, "))\n      "), {
                        replacements: { userId: userId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                userPermissions = _c.sent();
                userPermissionCodes_1 = new Set(__spreadArray(__spreadArray([], userPermissions.map(function (p) { return p.code; }), true), userPermissions.map(function (p) { return p.path; }), true));
                permissionsToCheck.forEach(function (permission) {
                    results_1[permission] = userPermissionCodes_1.has(permission);
                });
                console.log("\u26A1 Level 3: \u6279\u91CF\u6743\u9650\u9A8C\u8BC1\u5B8C\u6210\uFF0C\u603B\u8017\u65F6: ".concat(Date.now() - startTime, "ms"));
                _c.label = 3;
            case 3:
                totalTime = Date.now() - startTime;
                hasPermissionCount = Object.values(results_1).filter(Boolean).length;
                res.json({
                    success: true,
                    data: {
                        results: results_1,
                        summary: {
                            total: permissionsToCheck.length,
                            granted: hasPermissionCount,
                            denied: permissionsToCheck.length - hasPermissionCount
                        }
                    },
                    meta: {
                        userId: userId,
                        userRole: userRole,
                        responseTime: totalTime,
                        level: 3,
                        description: '批量权限验证',
                        timestamp: Date.now()
                    }
                });
                return [3 /*break*/, 5];
            case 4:
                error_2 = _c.sent();
                console.error('❌ Level 3: 批量权限验证失败:', error_2);
                next(new apiError_1.ApiError(500, '批量权限验证失败'));
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.batchCheckPermissions = batchCheckPermissions;
