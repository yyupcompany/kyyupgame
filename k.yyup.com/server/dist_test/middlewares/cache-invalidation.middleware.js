"use strict";
/**
 * 缓存失效中间件
 *
 * 在数据更新操作后自动清除相关缓存
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
exports.invalidateBatchUserCache = exports.invalidateAllCache = exports.invalidateRolePermissionCache = exports.invalidateUserRoleCache = exports.invalidatePermissionCache = exports.invalidateRoleCache = exports.invalidateUserCache = exports.createCacheInvalidationMiddleware = exports.CacheInvalidationType = void 0;
var permission_cache_service_1 = __importDefault(require("../services/permission-cache.service"));
/**
 * 缓存失效操作类型
 */
var CacheInvalidationType;
(function (CacheInvalidationType) {
    CacheInvalidationType["USER"] = "user";
    CacheInvalidationType["ROLE"] = "role";
    CacheInvalidationType["PERMISSION"] = "permission";
    CacheInvalidationType["USER_ROLE"] = "user_role";
    CacheInvalidationType["ROLE_PERMISSION"] = "role_permission";
    CacheInvalidationType["ALL"] = "all";
})(CacheInvalidationType = exports.CacheInvalidationType || (exports.CacheInvalidationType = {}));
/**
 * 创建缓存失效中间件
 *
 * @param config 缓存失效配置
 * @returns Express中间件
 */
function createCacheInvalidationMiddleware(config) {
    var _this = this;
    return function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
        var originalJson;
        return __generator(this, function (_a) {
            originalJson = res.json.bind(res);
            // 重写res.json方法
            res.json = function (body) {
                var _this = this;
                // 只在成功响应时清除缓存
                if (body && body.success) {
                    // 异步清除缓存，不阻塞响应
                    setImmediate(function () { return __awaiter(_this, void 0, void 0, function () {
                        var error_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 2, , 3]);
                                    return [4 /*yield*/, invalidateCache(config, req)];
                                case 1:
                                    _a.sent();
                                    return [3 /*break*/, 3];
                                case 2:
                                    error_1 = _a.sent();
                                    console.error('❌ 缓存失效失败:', error_1);
                                    return [3 /*break*/, 3];
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); });
                }
                // 调用原始的json方法
                return originalJson(body);
            };
            next();
            return [2 /*return*/];
        });
    }); };
}
exports.createCacheInvalidationMiddleware = createCacheInvalidationMiddleware;
/**
 * 执行缓存失效
 */
function invalidateCache(config, req) {
    return __awaiter(this, void 0, void 0, function () {
        var type, getUserId, getRoleCode, clearAll, _a, userIds, ids, _i, ids_1, userId, roleCodes, codes, _b, codes_1, roleCode, userIds, ids, _c, ids_2, userId, roleCodes, codes, _d, codes_2, roleCode, error_2;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    type = config.type, getUserId = config.getUserId, getRoleCode = config.getRoleCode, clearAll = config.clearAll;
                    console.log("\uD83D\uDDD1\uFE0F \u5F00\u59CB\u7F13\u5B58\u5931\u6548: \u7C7B\u578B=".concat(type));
                    _e.label = 1;
                case 1:
                    _e.trys.push([1, 31, , 32]);
                    if (!clearAll) return [3 /*break*/, 3];
                    return [4 /*yield*/, permission_cache_service_1["default"].clearAllCache()];
                case 2:
                    _e.sent();
                    console.log('✅ 已清除所有权限缓存');
                    return [2 /*return*/];
                case 3:
                    _a = type;
                    switch (_a) {
                        case CacheInvalidationType.USER: return [3 /*break*/, 4];
                        case CacheInvalidationType.ROLE: return [3 /*break*/, 9];
                        case CacheInvalidationType.PERMISSION: return [3 /*break*/, 15];
                        case CacheInvalidationType.USER_ROLE: return [3 /*break*/, 17];
                        case CacheInvalidationType.ROLE_PERMISSION: return [3 /*break*/, 22];
                        case CacheInvalidationType.ALL: return [3 /*break*/, 28];
                    }
                    return [3 /*break*/, 30];
                case 4:
                    if (!getUserId) return [3 /*break*/, 8];
                    userIds = getUserId(req);
                    ids = Array.isArray(userIds) ? userIds : [userIds];
                    _i = 0, ids_1 = ids;
                    _e.label = 5;
                case 5:
                    if (!(_i < ids_1.length)) return [3 /*break*/, 8];
                    userId = ids_1[_i];
                    return [4 /*yield*/, permission_cache_service_1["default"].clearUserCache(userId)];
                case 6:
                    _e.sent();
                    console.log("\u2705 \u5DF2\u6E05\u9664\u7528\u6237".concat(userId, "\u7684\u7F13\u5B58"));
                    _e.label = 7;
                case 7:
                    _i++;
                    return [3 /*break*/, 5];
                case 8: return [3 /*break*/, 30];
                case 9:
                    if (!getRoleCode) return [3 /*break*/, 13];
                    roleCodes = getRoleCode(req);
                    codes = Array.isArray(roleCodes) ? roleCodes : [roleCodes];
                    _b = 0, codes_1 = codes;
                    _e.label = 10;
                case 10:
                    if (!(_b < codes_1.length)) return [3 /*break*/, 13];
                    roleCode = codes_1[_b];
                    return [4 /*yield*/, permission_cache_service_1["default"].clearRoleCache(roleCode)];
                case 11:
                    _e.sent();
                    console.log("\u2705 \u5DF2\u6E05\u9664\u89D2\u8272".concat(roleCode, "\u7684\u7F13\u5B58"));
                    _e.label = 12;
                case 12:
                    _b++;
                    return [3 /*break*/, 10];
                case 13: 
                // 角色变更影响所有用户，清除所有用户缓存
                return [4 /*yield*/, permission_cache_service_1["default"].clearAllCache()];
                case 14:
                    // 角色变更影响所有用户，清除所有用户缓存
                    _e.sent();
                    console.log('✅ 角色变更，已清除所有缓存');
                    return [3 /*break*/, 30];
                case 15: 
                // 权限变更影响所有用户和角色
                return [4 /*yield*/, permission_cache_service_1["default"].clearAllCache()];
                case 16:
                    // 权限变更影响所有用户和角色
                    _e.sent();
                    console.log('✅ 权限变更，已清除所有缓存');
                    return [3 /*break*/, 30];
                case 17:
                    if (!getUserId) return [3 /*break*/, 21];
                    userIds = getUserId(req);
                    ids = Array.isArray(userIds) ? userIds : [userIds];
                    _c = 0, ids_2 = ids;
                    _e.label = 18;
                case 18:
                    if (!(_c < ids_2.length)) return [3 /*break*/, 21];
                    userId = ids_2[_c];
                    return [4 /*yield*/, permission_cache_service_1["default"].clearUserCache(userId)];
                case 19:
                    _e.sent();
                    console.log("\u2705 \u7528\u6237\u89D2\u8272\u53D8\u66F4\uFF0C\u5DF2\u6E05\u9664\u7528\u6237".concat(userId, "\u7684\u7F13\u5B58"));
                    _e.label = 20;
                case 20:
                    _c++;
                    return [3 /*break*/, 18];
                case 21: return [3 /*break*/, 30];
                case 22:
                    if (!getRoleCode) return [3 /*break*/, 26];
                    roleCodes = getRoleCode(req);
                    codes = Array.isArray(roleCodes) ? roleCodes : [roleCodes];
                    _d = 0, codes_2 = codes;
                    _e.label = 23;
                case 23:
                    if (!(_d < codes_2.length)) return [3 /*break*/, 26];
                    roleCode = codes_2[_d];
                    return [4 /*yield*/, permission_cache_service_1["default"].clearRoleCache(roleCode)];
                case 24:
                    _e.sent();
                    console.log("\u2705 \u89D2\u8272\u6743\u9650\u53D8\u66F4\uFF0C\u5DF2\u6E05\u9664\u89D2\u8272".concat(roleCode, "\u7684\u7F13\u5B58"));
                    _e.label = 25;
                case 25:
                    _d++;
                    return [3 /*break*/, 23];
                case 26: 
                // 清除所有用户缓存，因为角色权限变更会影响所有拥有该角色的用户
                return [4 /*yield*/, permission_cache_service_1["default"].clearAllCache()];
                case 27:
                    // 清除所有用户缓存，因为角色权限变更会影响所有拥有该角色的用户
                    _e.sent();
                    console.log('✅ 角色权限变更，已清除所有用户缓存');
                    return [3 /*break*/, 30];
                case 28: return [4 /*yield*/, permission_cache_service_1["default"].clearAllCache()];
                case 29:
                    _e.sent();
                    console.log('✅ 已清除所有权限缓存');
                    return [3 /*break*/, 30];
                case 30: return [3 /*break*/, 32];
                case 31:
                    error_2 = _e.sent();
                    console.error('❌ 缓存失效执行失败:', error_2);
                    throw error_2;
                case 32: return [2 /*return*/];
            }
        });
    });
}
/**
 * 预定义的缓存失效中间件
 */
// 用户创建/更新/删除后清除用户缓存
exports.invalidateUserCache = createCacheInvalidationMiddleware({
    type: CacheInvalidationType.USER,
    getUserId: function (req) { return Number(req.params.id) || Number(req.body.id); }
});
// 角色创建/更新/删除后清除所有缓存
exports.invalidateRoleCache = createCacheInvalidationMiddleware({
    type: CacheInvalidationType.ROLE,
    getRoleCode: function (req) { return req.body.code || req.params.code; }
});
// 权限创建/更新/删除后清除所有缓存
exports.invalidatePermissionCache = createCacheInvalidationMiddleware({
    type: CacheInvalidationType.PERMISSION
});
// 用户角色关联变更后清除用户缓存
exports.invalidateUserRoleCache = createCacheInvalidationMiddleware({
    type: CacheInvalidationType.USER_ROLE,
    getUserId: function (req) {
        // 支持单个用户ID或用户ID数组
        if (req.body.userId) {
            return Number(req.body.userId);
        }
        if (req.body.userIds && Array.isArray(req.body.userIds)) {
            return req.body.userIds.map(function (id) { return Number(id); });
        }
        if (req.params.userId) {
            return Number(req.params.userId);
        }
        return 0;
    }
});
// 角色权限关联变更后清除角色和所有用户缓存
exports.invalidateRolePermissionCache = createCacheInvalidationMiddleware({
    type: CacheInvalidationType.ROLE_PERMISSION,
    getRoleCode: function (req) {
        if (req.body.roleCode) {
            return req.body.roleCode;
        }
        if (req.params.roleCode) {
            return req.params.roleCode;
        }
        // 如果有roleId，需要查询roleCode（这里简化处理）
        return '';
    }
});
// 清除所有缓存
exports.invalidateAllCache = createCacheInvalidationMiddleware({
    type: CacheInvalidationType.ALL,
    clearAll: true
});
/**
 * 批量缓存失效中间件
 * 用于批量操作后清除多个用户的缓存
 */
exports.invalidateBatchUserCache = createCacheInvalidationMiddleware({
    type: CacheInvalidationType.USER,
    getUserId: function (req) {
        // 从请求体中获取用户ID数组
        if (req.body.userIds && Array.isArray(req.body.userIds)) {
            return req.body.userIds.map(function (id) { return Number(id); });
        }
        // 从响应数据中获取（需要在响应后处理）
        return [];
    }
});
exports["default"] = {
    createCacheInvalidationMiddleware: createCacheInvalidationMiddleware,
    invalidateUserCache: exports.invalidateUserCache,
    invalidateRoleCache: exports.invalidateRoleCache,
    invalidatePermissionCache: exports.invalidatePermissionCache,
    invalidateUserRoleCache: exports.invalidateUserRoleCache,
    invalidateRolePermissionCache: exports.invalidateRolePermissionCache,
    invalidateAllCache: exports.invalidateAllCache,
    invalidateBatchUserCache: exports.invalidateBatchUserCache
};
