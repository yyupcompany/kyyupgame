"use strict";
/**
 * 会话管理服务
 *
 * 功能：
 * 1. Token黑名单管理
 * 2. 在线用户管理
 * 3. 单点登录支持
 * 4. 会话统计和监控
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
/**
 * 会话管理服务类
 */
var SessionService = /** @class */ (function () {
    function SessionService() {
        // Redis Key前缀
        this.TOKEN_BLACKLIST_PREFIX = 'token:blacklist:';
        this.USER_SESSION_PREFIX = 'user:session:';
        this.ONLINE_USERS_SET = 'online:users';
        this.SESSION_TOKEN_PREFIX = 'session:token:';
    }
    /**
     * 将Token加入黑名单
     *
     * @param token JWT Token
     * @param expiresIn Token过期时间（秒）
     * @returns 是否成功
     */
    SessionService.prototype.addToBlacklist = function (token, expiresIn) {
        if (expiresIn === void 0) { expiresIn = redis_config_1.RedisTTL.TOKEN_BLACKLIST; }
        return __awaiter(this, void 0, void 0, function () {
            var key, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        key = "".concat(this.TOKEN_BLACKLIST_PREFIX).concat(token);
                        return [4 /*yield*/, redis_service_1["default"].set(key, '1', expiresIn)];
                    case 1:
                        _a.sent();
                        console.log("\uD83D\uDEAB Token\u5DF2\u52A0\u5165\u9ED1\u540D\u5355: ".concat(token.substring(0, 20), "..., TTL=").concat(expiresIn, "\u79D2"));
                        return [2 /*return*/, true];
                    case 2:
                        error_1 = _a.sent();
                        console.error('❌ 添加Token到黑名单失败:', error_1);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查Token是否在黑名单中
     *
     * @param token JWT Token
     * @returns 是否在黑名单中
     */
    SessionService.prototype.isBlacklisted = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            var key, result, isBlacklisted, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        key = "".concat(this.TOKEN_BLACKLIST_PREFIX).concat(token);
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 1:
                        result = _a.sent();
                        isBlacklisted = result !== null;
                        if (isBlacklisted) {
                            console.log("\uD83D\uDEAB Token\u5728\u9ED1\u540D\u5355\u4E2D: ".concat(token.substring(0, 20), "..."));
                        }
                        return [2 /*return*/, isBlacklisted];
                    case 2:
                        error_2 = _a.sent();
                        console.error('❌ 检查Token黑名单失败:', error_2);
                        return [2 /*return*/, false];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建用户会话
     *
     * @param session 会话信息
     * @param enableSSO 是否启用单点登录（踢出其他设备）
     * @returns 是否成功
     */
    SessionService.prototype.createSession = function (session, enableSSO) {
        if (enableSSO === void 0) { enableSSO = false; }
        return __awaiter(this, void 0, void 0, function () {
            var userId, token, sessionKey, redisError_1, tokenKey, redisError_2, redisError_3, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 14, , 15]);
                        userId = session.userId, token = session.token;
                        if (!enableSSO) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.kickoutUserSessions(userId, token)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        sessionKey = "".concat(this.USER_SESSION_PREFIX).concat(userId, ":").concat(token);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, redis_service_1["default"].set(sessionKey, session, redis_config_1.RedisTTL.USER_SESSION)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        redisError_1 = _a.sent();
                        console.warn("\u26A0\uFE0F \u4F1A\u8BDD\u4FDD\u5B58\u5230Redis\u5931\u8D25\uFF0C\u4F46\u7EE7\u7EED\u5904\u7406: ".concat(redisError_1));
                        return [3 /*break*/, 6];
                    case 6:
                        tokenKey = "".concat(this.SESSION_TOKEN_PREFIX).concat(token);
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, redis_service_1["default"].set(tokenKey, userId, redis_config_1.RedisTTL.USER_SESSION)];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        redisError_2 = _a.sent();
                        console.warn("\u26A0\uFE0F Token\u6620\u5C04\u4FDD\u5B58\u5230Redis\u5931\u8D25\uFF0C\u4F46\u7EE7\u7EED\u5904\u7406: ".concat(redisError_2));
                        return [3 /*break*/, 10];
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, redis_service_1["default"].sadd(this.ONLINE_USERS_SET, userId.toString())];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        redisError_3 = _a.sent();
                        console.warn("\u26A0\uFE0F \u5728\u7EBF\u7528\u6237\u96C6\u5408\u66F4\u65B0\u5931\u8D25\uFF0C\u4F46\u7EE7\u7EED\u5904\u7406: ".concat(redisError_3));
                        return [3 /*break*/, 13];
                    case 13:
                        console.log("\u2705 \u7528\u6237\u4F1A\u8BDD\u5DF2\u521B\u5EFA: \u7528\u6237".concat(userId, ", Token=").concat(token.substring(0, 20), "..., SSO=").concat(enableSSO));
                        return [2 /*return*/, true];
                    case 14:
                        error_3 = _a.sent();
                        console.error('❌ 创建用户会话失败:', error_3);
                        // 即使出错也返回true，因为JWT token已经生成，用户可以继续使用
                        return [2 /*return*/, true];
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户会话
     *
     * @param userId 用户ID
     * @param token Token（可选，不提供则返回所有会话）
     * @returns 会话信息
     */
    SessionService.prototype.getUserSession = function (userId, token) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionKey, sessionData, pattern, keys, sessions, _i, keys_1, key, sessionData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        if (!token) return [3 /*break*/, 2];
                        sessionKey = "".concat(this.USER_SESSION_PREFIX).concat(userId, ":").concat(token);
                        return [4 /*yield*/, redis_service_1["default"].get(sessionKey)];
                    case 1:
                        sessionData = _a.sent();
                        if (!sessionData) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, sessionData];
                    case 2:
                        pattern = "".concat(this.USER_SESSION_PREFIX).concat(userId, ":*");
                        return [4 /*yield*/, redis_service_1["default"].keys(pattern)];
                    case 3:
                        keys = _a.sent();
                        if (keys.length === 0) {
                            return [2 /*return*/, []];
                        }
                        sessions = [];
                        _i = 0, keys_1 = keys;
                        _a.label = 4;
                    case 4:
                        if (!(_i < keys_1.length)) return [3 /*break*/, 7];
                        key = keys_1[_i];
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 5:
                        sessionData = _a.sent();
                        if (sessionData) {
                            sessions.push(sessionData);
                        }
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, sessions];
                    case 8: return [3 /*break*/, 10];
                    case 9:
                        error_4 = _a.sent();
                        console.error('❌ 获取用户会话失败:', error_4);
                        return [2 /*return*/, null];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新会话活跃时间
     *
     * @param userId 用户ID
     * @param token Token
     * @returns 是否成功
     */
    SessionService.prototype.updateSessionActivity = function (userId, token) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionKey, session, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sessionKey = "".concat(this.USER_SESSION_PREFIX).concat(userId, ":").concat(token);
                        return [4 /*yield*/, redis_service_1["default"].get(sessionKey)];
                    case 1:
                        session = _a.sent();
                        if (!session) {
                            return [2 /*return*/, false];
                        }
                        session.lastActiveTime = Date.now();
                        return [4 /*yield*/, redis_service_1["default"].set(sessionKey, session, redis_config_1.RedisTTL.USER_SESSION)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_5 = _a.sent();
                        console.error('❌ 更新会话活跃时间失败:', error_5);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除用户会话（登出）
     *
     * @param userId 用户ID
     * @param token Token
     * @returns 是否成功
     */
    SessionService.prototype.deleteSession = function (userId, token) {
        return __awaiter(this, void 0, void 0, function () {
            var sessionKey, tokenKey, pattern, keys, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        sessionKey = "".concat(this.USER_SESSION_PREFIX).concat(userId, ":").concat(token);
                        return [4 /*yield*/, redis_service_1["default"].del(sessionKey)];
                    case 1:
                        _a.sent();
                        tokenKey = "".concat(this.SESSION_TOKEN_PREFIX).concat(token);
                        return [4 /*yield*/, redis_service_1["default"].del(tokenKey)];
                    case 2:
                        _a.sent();
                        pattern = "".concat(this.USER_SESSION_PREFIX).concat(userId, ":*");
                        return [4 /*yield*/, redis_service_1["default"].keys(pattern)];
                    case 3:
                        keys = _a.sent();
                        if (!(keys.length === 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, redis_service_1["default"].srem(this.ONLINE_USERS_SET, userId.toString())];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        console.log("\u2705 \u7528\u6237\u4F1A\u8BDD\u5DF2\u5220\u9664: \u7528\u6237".concat(userId, ", Token=").concat(token.substring(0, 20), "..."));
                        return [2 /*return*/, true];
                    case 6:
                        error_6 = _a.sent();
                        console.error('❌ 删除用户会话失败:', error_6);
                        return [2 /*return*/, false];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 踢出用户的所有会话（除了当前Token）
     *
     * @param userId 用户ID
     * @param currentToken 当前Token（保留）
     * @returns 踢出的会话数量
     */
    SessionService.prototype.kickoutUserSessions = function (userId, currentToken) {
        return __awaiter(this, void 0, void 0, function () {
            var pattern, keys, kickedCount, _i, keys_2, key, token, tokenKey, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 9, , 10]);
                        pattern = "".concat(this.USER_SESSION_PREFIX).concat(userId, ":*");
                        return [4 /*yield*/, redis_service_1["default"].keys(pattern)];
                    case 1:
                        keys = _a.sent();
                        kickedCount = 0;
                        _i = 0, keys_2 = keys;
                        _a.label = 2;
                    case 2:
                        if (!(_i < keys_2.length)) return [3 /*break*/, 8];
                        key = keys_2[_i];
                        token = key.split(':').pop();
                        // 跳过当前Token
                        if (currentToken && token === currentToken) {
                            return [3 /*break*/, 7];
                        }
                        // 删除会话
                        return [4 /*yield*/, redis_service_1["default"].del(key)];
                    case 3:
                        // 删除会话
                        _a.sent();
                        if (!token) return [3 /*break*/, 6];
                        tokenKey = "".concat(this.SESSION_TOKEN_PREFIX).concat(token);
                        return [4 /*yield*/, redis_service_1["default"].del(tokenKey)];
                    case 4:
                        _a.sent();
                        // 将Token加入黑名单
                        return [4 /*yield*/, this.addToBlacklist(token)];
                    case 5:
                        // 将Token加入黑名单
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        kickedCount++;
                        _a.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 2];
                    case 8:
                        console.log("\u2705 \u5DF2\u8E22\u51FA\u7528\u6237".concat(userId, "\u7684").concat(kickedCount, "\u4E2A\u4F1A\u8BDD"));
                        return [2 /*return*/, kickedCount];
                    case 9:
                        error_7 = _a.sent();
                        console.error('❌ 踢出用户会话失败:', error_7);
                        return [2 /*return*/, 0];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取在线用户列表
     *
     * @returns 在线用户ID列表
     */
    SessionService.prototype.getOnlineUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userIds, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, redis_service_1["default"].smembers(this.ONLINE_USERS_SET)];
                    case 1:
                        userIds = _a.sent();
                        return [2 /*return*/, userIds.map(function (id) { return parseInt(id); })];
                    case 2:
                        error_8 = _a.sent();
                        console.error('❌ 获取在线用户列表失败:', error_8);
                        return [2 /*return*/, []];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取会话统计信息
     *
     * @returns 会话统计
     */
    SessionService.prototype.getSessionStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var onlineUsers, totalOnlineUsers, sessionPattern, sessionKeys, totalSessions, blacklistPattern, blacklistKeys, blacklistedTokens, sessionsByRole, _i, sessionKeys_1, key, session, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        return [4 /*yield*/, this.getOnlineUsers()];
                    case 1:
                        onlineUsers = _a.sent();
                        totalOnlineUsers = onlineUsers.length;
                        sessionPattern = "".concat(this.USER_SESSION_PREFIX, "*");
                        return [4 /*yield*/, redis_service_1["default"].keys(sessionPattern)];
                    case 2:
                        sessionKeys = _a.sent();
                        totalSessions = sessionKeys.length;
                        blacklistPattern = "".concat(this.TOKEN_BLACKLIST_PREFIX, "*");
                        return [4 /*yield*/, redis_service_1["default"].keys(blacklistPattern)];
                    case 3:
                        blacklistKeys = _a.sent();
                        blacklistedTokens = blacklistKeys.length;
                        sessionsByRole = {};
                        _i = 0, sessionKeys_1 = sessionKeys;
                        _a.label = 4;
                    case 4:
                        if (!(_i < sessionKeys_1.length)) return [3 /*break*/, 7];
                        key = sessionKeys_1[_i];
                        return [4 /*yield*/, redis_service_1["default"].get(key)];
                    case 5:
                        session = _a.sent();
                        if (session) {
                            sessionsByRole[session.role] = (sessionsByRole[session.role] || 0) + 1;
                        }
                        _a.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [2 /*return*/, {
                            totalOnlineUsers: totalOnlineUsers,
                            totalSessions: totalSessions,
                            blacklistedTokens: blacklistedTokens,
                            sessionsByRole: sessionsByRole
                        }];
                    case 8:
                        error_9 = _a.sent();
                        console.error('❌ 获取会话统计失败:', error_9);
                        return [2 /*return*/, {
                                totalOnlineUsers: 0,
                                totalSessions: 0,
                                blacklistedTokens: 0,
                                sessionsByRole: {}
                            }];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    return SessionService;
}());
// 导出单例
exports["default"] = new SessionService();
