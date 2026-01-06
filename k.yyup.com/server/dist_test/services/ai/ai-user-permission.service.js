"use strict";
/**
 * AI用户权限服务实现
 * 遵循项目规范，类型定义在本文件内，不从外部导入
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
// 导入AI用户权限模型和枚举
var ai_user_permission_model_1 = require("../../models/ai-user-permission.model");
var init_1 = require("../../init");
/**
 * AI用户权限服务类
 * 实现用户在AI系统中的权限管理功能
 */
var AIUserPermissionService = /** @class */ (function () {
    function AIUserPermissionService() {
    }
    /**
     * 检查用户是否拥有指定权限
     * @param userId 用户ID
     * @param permissionKey 权限键
     * @param requiredLevel 所需权限级别（默认为1，表示允许）
     * @returns 是否拥有权限
     */
    AIUserPermissionService.prototype.checkPermission = function (userId, permissionKey, requiredLevel) {
        if (requiredLevel === void 0) { requiredLevel = ai_user_permission_model_1.PermissionValue.ALLOWED; }
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_user_permission_model_1.AIUserPermission.checkUserPermission(userId, permissionKey, requiredLevel)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        console.error('检查用户权限失败:', error_1);
                        return [2 /*return*/, false]; // 出错时默认没有权限
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户所有权限
     * @param userId 用户ID
     * @returns 权限键值对
     */
    AIUserPermissionService.prototype.getUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_user_permission_model_1.AIUserPermission.getUserPermissions(userId)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取用户权限列表失败:', error_2);
                        return [2 /*return*/, {}]; // 出错时返回空对象
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置用户单个权限
     * @param userId 用户ID
     * @param permissionKey 权限键
     * @param value 权限值
     */
    AIUserPermissionService.prototype.setPermission = function (userId, permissionKey, value) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_user_permission_model_1.AIUserPermission.setPermission(userId, permissionKey, value)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('设置用户权限失败:', error_3);
                        throw new Error("\u8BBE\u7F6E\u7528\u6237\u6743\u9650\u5931\u8D25: ".concat(error_3.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量设置用户权限
     * @param userId 用户ID
     * @param permissions 权限键值对
     */
    AIUserPermissionService.prototype.setPermissions = function (userId, permissions) {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, ai_user_permission_model_1.AIUserPermission.setBulkPermissions(userId, permissions, init_1.sequelize)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('批量设置用户权限失败:', error_4);
                        throw new Error("\u6279\u91CF\u8BBE\u7F6E\u7528\u6237\u6743\u9650\u5931\u8D25: ".concat(error_4.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 移除用户权限
     * @param userId 用户ID
     * @param permissionKey 权限键
     */
    AIUserPermissionService.prototype.removePermission = function (userId, permissionKey) {
        return __awaiter(this, void 0, void 0, function () {
            var permission, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, ai_user_permission_model_1.AIUserPermission.findOne({
                                where: {
                                    userId: userId,
                                    permissionKey: permissionKey
                                }
                            })];
                    case 1:
                        permission = _a.sent();
                        if (!permission) return [3 /*break*/, 3];
                        return [4 /*yield*/, permission.destroy()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        console.error('移除用户权限失败:', error_5);
                        throw new Error("\u79FB\u9664\u7528\u6237\u6743\u9650\u5931\u8D25: ".concat(error_5.message));
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 初始化新用户默认权限
     * @param userId 用户ID
     */
    AIUserPermissionService.prototype.initializeUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultPermissions, error_6;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        defaultPermissions = (_a = {},
                            _a[ai_user_permission_model_1.PermissionKey.USE_TEXT_MODELS] = ai_user_permission_model_1.PermissionValue.ALLOWED,
                            _a[ai_user_permission_model_1.PermissionKey.USE_IMAGE_MODELS] = ai_user_permission_model_1.PermissionValue.ALLOWED,
                            _a[ai_user_permission_model_1.PermissionKey.USE_SPEECH_MODELS] = ai_user_permission_model_1.PermissionValue.DENIED,
                            _a[ai_user_permission_model_1.PermissionKey.USE_VIDEO_MODELS] = ai_user_permission_model_1.PermissionValue.DENIED,
                            _a[ai_user_permission_model_1.PermissionKey.CUSTOM_PROMPTS] = ai_user_permission_model_1.PermissionValue.ALLOWED,
                            _a[ai_user_permission_model_1.PermissionKey.ADVANCED_SETTINGS] = ai_user_permission_model_1.PermissionValue.DENIED,
                            _a[ai_user_permission_model_1.PermissionKey.EXPORT_DATA] = ai_user_permission_model_1.PermissionValue.ALLOWED,
                            _a[ai_user_permission_model_1.PermissionKey.VIEW_ANALYTICS] = ai_user_permission_model_1.PermissionValue.DENIED,
                            _a[ai_user_permission_model_1.PermissionKey.ADMIN_ACCESS] = ai_user_permission_model_1.PermissionValue.DENIED,
                            _a[ai_user_permission_model_1.PermissionKey.AI_ADMIN] = ai_user_permission_model_1.PermissionValue.DENIED,
                            _a);
                        return [4 /*yield*/, this.setPermissions(userId, defaultPermissions)];
                    case 1:
                        _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        console.error('初始化用户权限失败:', error_6);
                        throw new Error("\u521D\u59CB\u5316\u7528\u6237\u6743\u9650\u5931\u8D25: ".concat(error_6.message));
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AIUserPermissionService;
}());
// 导出服务实例
exports["default"] = new AIUserPermissionService();
