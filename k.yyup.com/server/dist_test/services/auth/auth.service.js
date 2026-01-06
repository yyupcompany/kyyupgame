"use strict";
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
exports.AuthService = void 0;
var jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
var bcrypt_1 = __importDefault(require("bcrypt"));
var sequelize_1 = require("sequelize");
var user_model_1 = require("../../models/user.model");
var role_model_1 = require("../../models/role.model");
var permission_model_1 = require("../../models/permission.model");
var user_role_model_1 = require("../../models/user-role.model");
var role_permission_model_1 = require("../../models/role-permission.model");
var jwt_config_1 = require("../../config/jwt.config");
var password_helper_1 = require("../../utils/password-helper");
/**
 * 用户认证服务实现
 * @description 实现用户认证相关的业务逻辑
 */
var AuthService = /** @class */ (function () {
    function AuthService() {
    }
    /**
     * 用户登录
     * @param username 用户名
     * @param password 密码
     * @returns 登录结果，包含用户信息和令牌
     */
    AuthService.prototype.login = function (username, password) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isPasswordValid, _a, token, refreshToken, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: (_b = {},
                                    _b[sequelize_1.Op.or] = [
                                        { username: username },
                                        { email: username }
                                    ],
                                    _b.status = user_model_1.UserStatus.ACTIVE,
                                    _b)
                            })];
                    case 1:
                        user = _c.sent();
                        // 用户不存在或被禁用
                        if (!user) {
                            throw new Error('用户不存在或已被禁用');
                        }
                        // 验证密码 - 支持MD5和bcrypt
                        if (!user.password) {
                            throw new Error('用户密码数据异常');
                        }
                        return [4 /*yield*/, (0, password_helper_1.verifyPassword)(password, user.password)];
                    case 2:
                        isPasswordValid = _c.sent();
                        if (!isPasswordValid) {
                            throw new Error('密码错误');
                        }
                        return [4 /*yield*/, this.generateTokens(user.id, user.username)];
                    case 3:
                        _a = _c.sent(), token = _a.token, refreshToken = _a.refreshToken;
                        // 返回用户信息和令牌
                        return [2 /*return*/, {
                                user: {
                                    id: user.id,
                                    username: user.username,
                                    email: user.email,
                                    realName: user.realName,
                                    status: user.status
                                },
                                token: token,
                                refreshToken: refreshToken
                            }];
                    case 4:
                        error_1 = _c.sent();
                        console.error('用户登录失败:', error_1);
                        throw error_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 用户登出
     * @param userId 用户ID
     * @param token 当前令牌
     * @returns 是否登出成功
     */
    AuthService.prototype.logout = function (userId, token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // TODO: 将令牌添加到黑名单，实现令牌失效
                    // 这里简单返回成功
                    return [2 /*return*/, true];
                }
                catch (error) {
                    console.error('用户登出失败:', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 刷新令牌
     * @param refreshToken 刷新令牌
     * @returns 新的访问令牌和刷新令牌
     */
    AuthService.prototype.refreshToken = function (refreshToken) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, user, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        decoded = jsonwebtoken_1["default"].verify(refreshToken, jwt_config_1.JWT_SECRET);
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: {
                                    id: decoded.userId,
                                    status: user_model_1.UserStatus.ACTIVE
                                }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('用户不存在或已被禁用');
                        }
                        return [4 /*yield*/, this.generateTokens(user.id, user.username)];
                    case 2: 
                    // 生成新的令牌
                    return [2 /*return*/, _a.sent()];
                    case 3:
                        error_2 = _a.sent();
                        console.error('刷新令牌失败:', error_2);
                        throw new Error('无效的刷新令牌');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证令牌
     * @param token 访问令牌
     * @returns 令牌中包含的用户信息
     */
    AuthService.prototype.verifyToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, user, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        decoded = jsonwebtoken_1["default"].verify(token, jwt_config_1.JWT_SECRET);
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: {
                                    id: decoded.userId,
                                    status: user_model_1.UserStatus.ACTIVE
                                }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('用户不存在或已被禁用');
                        }
                        return [2 /*return*/, {
                                userId: decoded.userId,
                                username: decoded.username
                            }];
                    case 2:
                        error_3 = _a.sent();
                        console.error('验证令牌失败:', error_3);
                        throw new Error('无效的令牌');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 修改密码
     * @param userId 用户ID
     * @param oldPassword 旧密码
     * @param newPassword 新密码
     * @returns 是否修改成功
     */
    AuthService.prototype.changePassword = function (userId, oldPassword, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var user, isPasswordValid, hashedPassword, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, user_model_1.User.findByPk(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('用户不存在');
                        }
                        // 验证旧密码
                        if (!user.password) {
                            throw new Error('用户密码数据异常');
                        }
                        return [4 /*yield*/, bcrypt_1["default"].compare(oldPassword, user.password)];
                    case 2:
                        isPasswordValid = _a.sent();
                        if (!isPasswordValid) {
                            throw new Error('旧密码错误');
                        }
                        return [4 /*yield*/, bcrypt_1["default"].hash(newPassword, 10)];
                    case 3:
                        hashedPassword = _a.sent();
                        // 更新密码
                        return [4 /*yield*/, user.update({ password: hashedPassword })];
                    case 4:
                        // 更新密码
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5:
                        error_4 = _a.sent();
                        console.error('修改密码失败:', error_4);
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 重置密码
     * @param userId 用户ID
     * @param newPassword 新密码
     * @returns 是否重置成功
     */
    AuthService.prototype.resetPassword = function (userId, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var user, hashedPassword, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, user_model_1.User.findByPk(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('用户不存在');
                        }
                        return [4 /*yield*/, bcrypt_1["default"].hash(newPassword, 10)];
                    case 2:
                        hashedPassword = _a.sent();
                        // 更新密码
                        return [4 /*yield*/, user.update({ password: hashedPassword })];
                    case 3:
                        // 更新密码
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_5 = _a.sent();
                        console.error('重置密码失败:', error_5);
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发送重置密码邮件
     * @param email 用户邮箱
     * @returns 是否发送成功
     */
    AuthService.prototype.sendResetPasswordEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user, resetToken, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: { email: email }
                            })];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('用户不存在');
                        }
                        resetToken = jsonwebtoken_1["default"].sign({ userId: user.id, type: 'reset-password' }, jwt_config_1.JWT_SECRET, { expiresIn: '1h' });
                        // TODO: 实现邮件发送功能
                        console.log("\u91CD\u7F6E\u5BC6\u7801\u94FE\u63A5: /reset-password?token=".concat(resetToken));
                        return [2 /*return*/, true];
                    case 2:
                        error_6 = _a.sent();
                        console.error('发送重置密码邮件失败:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证重置密码令牌
     * @param token 重置密码令牌
     * @returns 令牌是否有效
     */
    AuthService.prototype.verifyResetPasswordToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, user, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        decoded = jsonwebtoken_1["default"].verify(token, jwt_config_1.JWT_SECRET);
                        // 检查令牌类型和用户是否存在
                        if (decoded.type !== 'reset-password') {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, user_model_1.User.findByPk(decoded.userId)];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, !!user];
                    case 2:
                        error_7 = _a.sent();
                        console.error('验证重置密码令牌失败:', error_7);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 通过重置密码令牌设置新密码
     * @param token 重置密码令牌
     * @param newPassword 新密码
     * @returns 是否设置成功
     */
    AuthService.prototype.resetPasswordByToken = function (token, newPassword) {
        return __awaiter(this, void 0, void 0, function () {
            var decoded, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        decoded = jsonwebtoken_1["default"].verify(token, jwt_config_1.JWT_SECRET);
                        // 检查令牌类型
                        if (decoded.type !== 'reset-password') {
                            throw new Error('无效的重置密码令牌');
                        }
                        return [4 /*yield*/, this.resetPassword(decoded.userId, newPassword)];
                    case 1: 
                    // 重置密码
                    return [2 /*return*/, _a.sent()];
                    case 2:
                        error_8 = _a.sent();
                        console.error('通过令牌重置密码失败:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户权限列表
     * @param userId 用户ID
     * @returns 用户权限列表
     */
    AuthService.prototype.getUserPermissions = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles, roleIds, rolePermissions, permissionIds, permissions, error_9;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, user_role_model_1.UserRole.findAll({
                                where: { userId: userId }
                            })];
                    case 1:
                        userRoles = _c.sent();
                        if (userRoles.length === 0) {
                            return [2 /*return*/, []];
                        }
                        roleIds = userRoles.map(function (ur) { return ur.get('roleId'); });
                        return [4 /*yield*/, role_permission_model_1.RolePermission.findAll({
                                where: {
                                    roleId: (_a = {},
                                        _a[sequelize_1.Op["in"]] = roleIds,
                                        _a)
                                }
                            })];
                    case 2:
                        rolePermissions = _c.sent();
                        if (rolePermissions.length === 0) {
                            return [2 /*return*/, []];
                        }
                        permissionIds = rolePermissions.map(function (rp) { return rp.get('permissionId'); });
                        return [4 /*yield*/, permission_model_1.Permission.findAll({
                                where: {
                                    id: (_b = {},
                                        _b[sequelize_1.Op["in"]] = permissionIds,
                                        _b),
                                    status: 1
                                }
                            })];
                    case 3:
                        permissions = _c.sent();
                        // 提取权限标识
                        return [2 /*return*/, permissions
                                .map(function (p) { return p.permission; })
                                .filter(function (p) { return p !== null; })];
                    case 4:
                        error_9 = _c.sent();
                        console.error('获取用户权限列表失败:', error_9);
                        throw error_9;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户角色列表
     * @param userId 用户ID
     * @returns 用户角色列表
     */
    AuthService.prototype.getUserRoles = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_role_model_1.UserRole.findAll({
                                where: { userId: userId },
                                include: [
                                    {
                                        model: role_model_1.Role,
                                        as: 'role',
                                        where: { status: 1 }
                                    }
                                ]
                            })];
                    case 1:
                        userRoles = _a.sent();
                        // 提取角色信息
                        return [2 /*return*/, userRoles.map(function (ur) {
                                var role = ur.get('role');
                                if (!role) {
                                    return {
                                        id: 0,
                                        name: '未知角色',
                                        code: 'unknown',
                                        isPrimary: ur.get('isPrimary') === 1
                                    };
                                }
                                return {
                                    id: role.id,
                                    name: role.name,
                                    code: role.code,
                                    isPrimary: ur.get('isPrimary') === 1
                                };
                            })];
                    case 2:
                        error_10 = _a.sent();
                        console.error('获取用户角色列表失败:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查用户是否有特定权限
     * @param userId 用户ID
     * @param permission 权限标识
     * @returns 是否有权限
     */
    AuthService.prototype.hasPermission = function (userId, permission) {
        return __awaiter(this, void 0, void 0, function () {
            var permissions, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getUserPermissions(userId)];
                    case 1:
                        permissions = _a.sent();
                        return [2 /*return*/, permissions.includes(permission)];
                    case 2:
                        error_11 = _a.sent();
                        console.error('检查用户权限失败:', error_11);
                        throw error_11;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查用户是否具有特定角色
     * @param userId 用户ID
     * @param role 角色标识
     * @returns 是否有角色
     */
    AuthService.prototype.hasRole = function (userId, role) {
        return __awaiter(this, void 0, void 0, function () {
            var userRoles, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_role_model_1.UserRole.findAll({
                                where: { userId: userId },
                                include: [
                                    {
                                        model: role_model_1.Role,
                                        as: 'role',
                                        where: {
                                            code: role,
                                            status: 1
                                        }
                                    }
                                ]
                            })];
                    case 1:
                        userRoles = _a.sent();
                        return [2 /*return*/, userRoles.length > 0];
                    case 2:
                        error_12 = _a.sent();
                        console.error('检查用户角色失败:', error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成访问令牌和刷新令牌
     * @param userId 用户ID
     * @param username 用户名
     * @returns 访问令牌和刷新令牌
     */
    AuthService.prototype.generateTokens = function (userId, username) {
        return __awaiter(this, void 0, void 0, function () {
            var tokenExpire, tokenOptions, token, refreshTokenOptions, refreshToken;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, jwt_config_1.getDynamicTokenExpire)()];
                    case 1:
                        tokenExpire = _a.sent();
                        console.log("\uD83D\uDD11 \u751F\u6210\u4EE4\u724C\uFF0C\u4F7F\u7528\u8FC7\u671F\u65F6\u95F4: ".concat(tokenExpire));
                        tokenOptions = { expiresIn: tokenExpire };
                        token = jsonwebtoken_1["default"].sign({ userId: userId, username: username, type: jwt_config_1.TOKEN_TYPES.ACCESS }, jwt_config_1.JWT_SECRET, tokenOptions);
                        refreshTokenOptions = { expiresIn: jwt_config_1.REFRESH_TOKEN_EXPIRE };
                        refreshToken = jsonwebtoken_1["default"].sign({ userId: userId, username: username, type: jwt_config_1.TOKEN_TYPES.REFRESH }, jwt_config_1.JWT_SECRET, refreshTokenOptions);
                        return [2 /*return*/, { token: token, refreshToken: refreshToken }];
                }
            });
        });
    };
    return AuthService;
}());
exports.AuthService = AuthService;
exports["default"] = new AuthService();
