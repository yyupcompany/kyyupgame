"use strict";
/**
 * AI用户管理中间层
 * 负责AI用户权限管理和用户设置管理，封装用户服务层逻辑
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.aiUserMiddleware = void 0;
var ai_1 = require("../../services/ai");
var ai_user_permission_model_1 = require("../../models/ai-user-permission.model");
var base_middleware_1 = require("./base.middleware");
/**
 * AI用户中间层实现
 */
var AiUserMiddleware = /** @class */ (function (_super) {
    __extends(AiUserMiddleware, _super);
    function AiUserMiddleware() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * 检查用户是否拥有指定权限
     * @param userId 用户ID
     * @param permissionKey 权限键
     * @param requiredLevel 所需权限级别
     * @returns 是否拥有权限
     */
    AiUserMiddleware.prototype.checkPermission = function (userId, permissionKey, requiredLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var isAdmin, hasPermission, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        if (!permissionKey.startsWith('ai:permission:')) return [3 /*break*/, 2];
                        return [4 /*yield*/, ai_1.aiUserPermissionService.checkPermission(userId, ai_user_permission_model_1.PermissionKey.AI_ADMIN, 1)];
                    case 1:
                        isAdmin = _a.sent();
                        if (!isAdmin) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '需要管理员权限执行此操作', { userId: userId, permissionKey: permissionKey });
                        }
                        _a.label = 2;
                    case 2: return [4 /*yield*/, ai_1.aiUserPermissionService.checkPermission(userId, permissionKey, requiredLevel)];
                    case 3:
                        hasPermission = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(hasPermission)];
                    case 4:
                        error_1 = _a.sent();
                        return [2 /*return*/, this.handleError(error_1)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户所有权限
     * @param userId 用户ID
     * @returns 权限键值对
     */
    AiUserMiddleware.prototype.getUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var isSelfOrAdmin, permissions, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:permission:read'])];
                    case 1:
                        isSelfOrAdmin = _a.sent();
                        if (!isSelfOrAdmin) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看权限列表的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiUserPermissionService.getUserPermissions(userId)];
                    case 2:
                        permissions = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(permissions)];
                    case 3:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.handleError(error_2)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置用户单个权限
     * @param userId 用户ID
     * @param permissionKey 权限键
     * @param value 权限值
     * @returns 操作结果
     */
    AiUserMiddleware.prototype.setPermission = function (userId, permissionKey, value) {
        return __awaiter(this, void 0, void 0, function () {
            var isAdmin, hasAdminPermission, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:permission:write'])];
                    case 1:
                        isAdmin = _a.sent();
                        if (!isAdmin) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有设置权限的权限', { userId: userId, permissionKey: permissionKey });
                        }
                        if (!(permissionKey === 'ai:admin')) return [3 /*break*/, 3];
                        return [4 /*yield*/, ai_1.aiUserPermissionService.checkPermission(userId, ai_user_permission_model_1.PermissionKey.AI_ADMIN, 1)];
                    case 2:
                        hasAdminPermission = _a.sent();
                        if (!hasAdminPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '不能设置管理员权限', { userId: userId, permissionKey: permissionKey });
                        }
                        _a.label = 3;
                    case 3: 
                    // 设置权限
                    return [4 /*yield*/, ai_1.aiUserPermissionService.setPermission(userId, permissionKey, value)];
                    case 4:
                        // 设置权限
                        _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'SET_PERMISSION', {
                                targetUserId: userId,
                                permissionKey: permissionKey,
                                value: value
                            })];
                    case 5:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(true)];
                    case 6:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.handleError(error_3)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量设置用户权限
     * @param userId 用户ID
     * @param permissions 权限键值对
     * @returns 操作结果
     */
    AiUserMiddleware.prototype.setPermissions = function (userId, permissions) {
        return __awaiter(this, void 0, void 0, function () {
            var isAdmin, hasAdminPermission, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:permission:write'])];
                    case 1:
                        isAdmin = _a.sent();
                        if (!isAdmin) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有设置权限的权限', { userId: userId });
                        }
                        if (!('ai:admin' in permissions)) return [3 /*break*/, 3];
                        return [4 /*yield*/, ai_1.aiUserPermissionService.checkPermission(userId, ai_user_permission_model_1.PermissionKey.AI_ADMIN, 1)];
                    case 2:
                        hasAdminPermission = _a.sent();
                        if (!hasAdminPermission) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '不能设置管理员权限', { userId: userId });
                        }
                        _a.label = 3;
                    case 3: 
                    // 设置权限
                    return [4 /*yield*/, ai_1.aiUserPermissionService.setPermissions(userId, permissions)];
                    case 4:
                        // 设置权限
                        _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'SET_BULK_PERMISSIONS', {
                                targetUserId: userId,
                                permissionCount: Object.keys(permissions).length
                            })];
                    case 5:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(true)];
                    case 6:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.handleError(error_4)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 移除用户权限
     * @param userId 用户ID
     * @param permissionKey 权限键
     * @returns 操作结果
     */
    AiUserMiddleware.prototype.removePermission = function (userId, permissionKey) {
        return __awaiter(this, void 0, void 0, function () {
            var isAdmin, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:permission:write'])];
                    case 1:
                        isAdmin = _a.sent();
                        if (!isAdmin) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有移除权限的权限', { userId: userId, permissionKey: permissionKey });
                        }
                        // 移除权限
                        return [4 /*yield*/, ai_1.aiUserPermissionService.removePermission(userId, permissionKey)];
                    case 2:
                        // 移除权限
                        _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'REMOVE_PERMISSION', {
                                targetUserId: userId,
                                permissionKey: permissionKey
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(true)];
                    case 4:
                        error_5 = _a.sent();
                        return [2 /*return*/, this.handleError(error_5)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化用户默认权限
     * @param userId 用户ID
     * @returns 操作结果
     */
    AiUserMiddleware.prototype.initializeUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var canInitialize, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:permission:initialize'])];
                    case 1:
                        canInitialize = _a.sent();
                        if (!canInitialize) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有初始化权限的权限', { userId: userId });
                        }
                        // 初始化权限
                        return [4 /*yield*/, ai_1.aiUserPermissionService.initializeUserPermissions(userId)];
                    case 2:
                        // 初始化权限
                        _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'INITIALIZE_PERMISSIONS', {
                                targetUserId: userId
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(true)];
                    case 4:
                        error_6 = _a.sent();
                        return [2 /*return*/, this.handleError(error_6)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户设置
     * @param userId 用户ID
     * @returns 用户设置
     */
    AiUserMiddleware.prototype.getUserSettings = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var canAccess, userRelation, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:user:read'])];
                    case 1:
                        canAccess = _a.sent();
                        if (!canAccess) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看用户设置的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiUserRelationService.getUserRelation(userId)];
                    case 2:
                        userRelation = _a.sent();
                        if (!userRelation) {
                            return [2 /*return*/, this.createSuccessResponse(null)];
                        }
                        return [2 /*return*/, this.createSuccessResponse(userRelation.settings)];
                    case 3:
                        error_7 = _a.sent();
                        return [2 /*return*/, this.handleError(error_7)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新用户设置
     * @param userId 用户ID
     * @param settings 新设置
     * @returns 更新后的用户关系
     */
    AiUserMiddleware.prototype.updateUserSettings = function (userId, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var canUpdate, userRelation, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:user:write'])];
                    case 1:
                        canUpdate = _a.sent();
                        if (!canUpdate) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有更新用户设置的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiUserRelationService.updateUserSettings(userId, settings)];
                    case 2:
                        userRelation = _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'UPDATE_USER_SETTINGS', {
                                targetUserId: userId,
                                settingsUpdated: Object.keys(settings)
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(userRelation ? {
                                id: userRelation.id,
                                externalUserId: userRelation.externalUserId,
                                settings: userRelation.settings,
                                lastActivity: userRelation.lastActivity,
                                createdAt: userRelation.createdAt,
                                updatedAt: userRelation.updatedAt
                            } : null)];
                    case 4:
                        error_8 = _a.sent();
                        return [2 /*return*/, this.handleError(error_8)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户关系
     * @param userId 用户ID
     * @returns 用户关系
     */
    AiUserMiddleware.prototype.getUserRelation = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var canAccess, userRelation, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:user:read'])];
                    case 1:
                        canAccess = _a.sent();
                        if (!canAccess) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有查看用户关系的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiUserRelationService.getUserRelation(userId)];
                    case 2:
                        userRelation = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(userRelation ? {
                                id: userRelation.id,
                                externalUserId: userRelation.externalUserId,
                                settings: userRelation.settings,
                                lastActivity: userRelation.lastActivity,
                                createdAt: userRelation.createdAt,
                                updatedAt: userRelation.updatedAt
                            } : null)];
                    case 3:
                        error_9 = _a.sent();
                        return [2 /*return*/, this.handleError(error_9)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建用户关系
     * @param userId 用户ID
     * @param settings 初始设置
     * @returns 创建的用户关系
     */
    AiUserMiddleware.prototype.createUserRelation = function (userId, settings) {
        return __awaiter(this, void 0, void 0, function () {
            var canCreate, userRelation, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.validatePermissions(userId, ['ai:user:create'])];
                    case 1:
                        canCreate = _a.sent();
                        if (!canCreate) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '没有创建用户关系的权限', { userId: userId });
                        }
                        return [4 /*yield*/, ai_1.aiUserRelationService.getOrCreateUserRelation(userId, settings)];
                    case 2:
                        userRelation = _a.sent();
                        // 记录操作
                        return [4 /*yield*/, this.logOperation(userId, 'CREATE_USER_RELATION', {
                                targetUserId: userId
                            })];
                    case 3:
                        // 记录操作
                        _a.sent();
                        return [2 /*return*/, this.createSuccessResponse({
                                id: userRelation.id,
                                externalUserId: userRelation.externalUserId,
                                settings: userRelation.settings,
                                lastActivity: userRelation.lastActivity,
                                createdAt: userRelation.createdAt,
                                updatedAt: userRelation.updatedAt
                            })];
                    case 4:
                        error_10 = _a.sent();
                        return [2 /*return*/, this.handleError(error_10)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新用户最后活动时间
     * @param userId 用户ID
     * @returns 操作结果
     */
    AiUserMiddleware.prototype.updateLastActivity = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var success, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_1.aiUserRelationService.updateLastActivity(userId)];
                    case 1:
                        success = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(success)];
                    case 2:
                        error_11 = _a.sent();
                        return [2 /*return*/, this.handleError(error_11)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取最近活动用户
     * @param limit 数量限制
     * @returns 用户关系列表
     */
    AiUserMiddleware.prototype.getRecentActiveUsers = function (limit) {
        if (limit === void 0) { limit = 10; }
        return __awaiter(this, void 0, void 0, function () {
            var isAdmin, users, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.validatePermissions(0, ['ai:admin'])];
                    case 1:
                        isAdmin = _a.sent();
                        if (!isAdmin) {
                            throw new base_middleware_1.MiddlewareError(base_middleware_1.ERROR_CODES.FORBIDDEN, '需要管理员权限查看最近活动用户', { limit: limit });
                        }
                        return [4 /*yield*/, ai_1.aiUserRelationService.getRecentActiveUsers(limit)];
                    case 2:
                        users = _a.sent();
                        return [2 /*return*/, this.createSuccessResponse(users.map(function (user) { return ({
                                id: user.id,
                                externalUserId: user.externalUserId,
                                settings: user.settings,
                                lastActivity: user.lastActivity,
                                createdAt: user.createdAt,
                                updatedAt: user.updatedAt
                            }); }))];
                    case 3:
                        error_12 = _a.sent();
                        return [2 /*return*/, this.handleError(error_12)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return AiUserMiddleware;
}(base_middleware_1.BaseMiddleware));
// 导出中间层实例
var aiUserMiddleware = new AiUserMiddleware();
exports.aiUserMiddleware = aiUserMiddleware;
