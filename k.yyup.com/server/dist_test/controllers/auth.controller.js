"use strict";
/**
 * 认证控制器
 * 处理用户登录、登出和令牌刷新
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
exports.getCurrentUser = exports.verifyTokenEndpoint = exports.logout = exports.refreshToken = exports.login = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
var jwt_1 = require("../utils/jwt");
var password_1 = require("../utils/password");
var jwt_config_1 = require("../config/jwt.config");
var index_1 = require("../models/index");
var session_service_1 = __importDefault(require("../services/session.service"));
var permission_cache_service_1 = __importDefault(require("../services/permission-cache.service"));
/**
 * 用户登录
 */
var login = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, email, password, emailRegex, query, replacements, queryResult, dbError_1, userRows, user_1, isPasswordValid, userStatus, roleRows, userRole, kindergartenId, kindergartenRows, token, refreshToken_1, session, enableSSO, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 13, , 14]);
                console.log('登录请求:', req.body);
                _a = req.body, username = _a.username, email = _a.email, password = _a.password;
                // 参数验证
                if ((!username || username === null) && (!email || email === null)) {
                    res.status(400).json({
                        success: false,
                        error: 'MISSING_REQUIRED_FIELDS',
                        message: '用户名或邮箱不能为空'
                    });
                    return [2 /*return*/];
                }
                if (!password || password === null) {
                    res.status(400).json({
                        success: false,
                        error: 'MISSING_REQUIRED_FIELDS',
                        message: '密码不能为空'
                    });
                    return [2 /*return*/];
                }
                // 邮箱格式验证
                if (email && email !== null) {
                    emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        res.status(400).json({
                            success: false,
                            error: 'INVALID_EMAIL_FORMAT',
                            message: '邮箱格式无效'
                        });
                        return [2 /*return*/];
                    }
                }
                // 密码长度验证
                if (password.length < 6) {
                    res.status(400).json({
                        success: false,
                        error: 'PASSWORD_TOO_SHORT',
                        message: '密码至少6位'
                    });
                    return [2 /*return*/];
                }
                // 用户名长度验证
                if (username && (username.length < 1 || username.length > 50)) {
                    res.status(400).json({
                        success: false,
                        error: 'INVALID_USERNAME_LENGTH',
                        message: '用户名长度必须在1-50字符之间'
                    });
                    return [2 /*return*/];
                }
                query = '';
                replacements = {};
                if (username && username !== null) {
                    query = 'SELECT id, username, password, email, real_name as realName, phone, status FROM users WHERE username = :username';
                    replacements = { username: username };
                    console.log('使用用户名查询:', username);
                }
                else if (email && email !== null) {
                    query = 'SELECT id, username, password, email, real_name as realName, phone, status FROM users WHERE email = :email';
                    replacements = { email: email };
                    console.log('使用邮箱查询:', email);
                }
                console.log('执行查询:', query);
                console.log('查询参数:', replacements);
                queryResult = void 0;
                _b.label = 1;
            case 1:
                _b.trys.push([1, 3, , 4]);
                return [4 /*yield*/, init_1.sequelize.query(query, {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                queryResult = _b.sent();
                console.log('原始查询结果:', queryResult);
                return [3 /*break*/, 4];
            case 3:
                dbError_1 = _b.sent();
                console.log('数据库查询失败:', dbError_1.message);
                res.status(500).json({
                    success: false,
                    error: 'DATABASE_ERROR',
                    message: '数据库连接失败，请稍后重试'
                });
                return [2 /*return*/];
            case 4:
                userRows = Array.isArray(queryResult) ? queryResult : [];
                console.log('处理后的结果:', userRows);
                console.log('结果长度:', userRows.length);
                if (!userRows || userRows.length === 0) {
                    console.log('用户不存在:', username || email);
                    // 测试模式已禁用 - 使用真实数据库验证
                    // if ((username === 'admin' && password === '123456') ||
                    //     (username === 'test' && password === '123456')) {
                    //   console.log('启用测试模式，使用模拟用户登录');
                    //   // 模拟登录逻辑已移除
                    // }
                    res.status(401).json({
                        success: false,
                        error: 'INVALID_CREDENTIALS',
                        message: '用户名或密码错误'
                    });
                    return [2 /*return*/];
                }
                user_1 = userRows[0];
                console.log('找到用户:', user_1.id, user_1.username, user_1.email);
                // 验证密码
                console.log('验证密码, 输入:', password, '存储哈希:', user_1.password);
                return [4 /*yield*/, (0, password_1.verifyPassword)(password, user_1.password)];
            case 5:
                isPasswordValid = _b.sent();
                console.log('密码验证结果:', isPasswordValid);
                if (!isPasswordValid) {
                    console.log('密码不正确:', username || email);
                    res.status(401).json({
                        success: false,
                        error: 'INVALID_CREDENTIALS',
                        message: '用户名或密码错误'
                    });
                    return [2 /*return*/];
                }
                userStatus = String(user_1.status).toLowerCase();
                if (user_1.username !== 'admin' && userStatus !== index_1.UserStatus.ACTIVE.toLowerCase() && userStatus !== '1') {
                    console.log('账号已禁用:', username || email);
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '账号已被禁用，请联系管理员', 'ACCOUNT_DISABLED', 200)];
                }
                console.log('用户状态检查通过:', user_1.username, userStatus);
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT r.code as role_code, r.name as role_name\n      FROM user_roles ur\n      INNER JOIN roles r ON ur.role_id = r.id\n      WHERE ur.user_id = ?\n      ORDER BY \n        CASE \n          WHEN r.code = 'super_admin' THEN 1\n          WHEN r.code = 'admin' THEN 2\n          ELSE 3\n        END\n      LIMIT 1\n    ", {
                        replacements: [user_1.id],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 6:
                roleRows = _b.sent();
                userRole = roleRows.length > 0 ? roleRows[0] : null;
                kindergartenId = null;
                console.log('🔍 检查用户角色:', userRole === null || userRole === void 0 ? void 0 : userRole.role_code);
                if (!((userRole === null || userRole === void 0 ? void 0 : userRole.role_code) === 'admin' || (userRole === null || userRole === void 0 ? void 0 : userRole.role_code) === 'super_admin')) return [3 /*break*/, 8];
                console.log('✅ 用户是管理员，查询幼儿园ID...');
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT id FROM kindergartens ORDER BY id LIMIT 1\n      ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 7:
                kindergartenRows = _b.sent();
                console.log('🏢 查询到的幼儿园:', kindergartenRows);
                if (kindergartenRows && kindergartenRows.length > 0) {
                    kindergartenId = kindergartenRows[0].id;
                    console.log('✅ 分配kindergartenId:', kindergartenId);
                }
                else {
                    console.log('❌ 没有找到幼儿园数据');
                }
                return [3 /*break*/, 9];
            case 8:
                console.log('❌ 用户不是管理员，不分配kindergartenId');
                _b.label = 9;
            case 9: return [4 /*yield*/, (0, jwt_1.generateDynamicToken)({
                    userId: user_1.id,
                    username: user_1.username,
                    type: jwt_config_1.TOKEN_TYPES.ACCESS
                })];
            case 10:
                token = _b.sent();
                return [4 /*yield*/, (0, jwt_1.generateDynamicToken)({
                        userId: user_1.id,
                        username: user_1.username,
                        type: jwt_config_1.TOKEN_TYPES.REFRESH,
                        isRefreshToken: true
                    })];
            case 11:
                refreshToken_1 = _b.sent();
                session = {
                    userId: user_1.id,
                    username: user_1.username,
                    role: (userRole === null || userRole === void 0 ? void 0 : userRole.role_code) || 'user',
                    token: token,
                    loginTime: Date.now(),
                    lastActiveTime: Date.now(),
                    ip: req.ip || req.socket.remoteAddress,
                    userAgent: req.get('user-agent'),
                    deviceId: req.get('x-device-id')
                };
                enableSSO = req.body.enableSSO === true;
                return [4 /*yield*/, session_service_1["default"].createSession(session, enableSSO)];
            case 12:
                _b.sent();
                // 🔥 登录成功后，主动缓存用户权限到Redis
                console.log("\uD83D\uDD04 \u5F00\u59CB\u7F13\u5B58\u7528\u6237\u6743\u9650: \u7528\u6237".concat(user_1.id));
                try {
                    // 异步缓存权限，不阻塞登录响应
                    permission_cache_service_1["default"].getUserPermissions(user_1.id)
                        .then(function () {
                        console.log("\u2705 \u7528\u6237\u6743\u9650\u5DF2\u7F13\u5B58: \u7528\u6237".concat(user_1.id));
                    })["catch"](function (error) {
                        console.error("\u26A0\uFE0F \u6743\u9650\u7F13\u5B58\u5931\u8D25: \u7528\u6237".concat(user_1.id), error);
                    });
                }
                catch (cacheError) {
                    console.error("\u26A0\uFE0F \u6743\u9650\u7F13\u5B58\u5F02\u5E38: \u7528\u6237".concat(user_1.id), cacheError);
                    // 不影响登录流程
                }
                console.log('登录成功:', username || email, ', SSO:', enableSSO);
                apiResponse_1.ApiResponse.success(res, {
                    token: token,
                    refreshToken: refreshToken_1,
                    user: {
                        id: user_1.id,
                        username: user_1.username,
                        email: user_1.email || '',
                        realName: user_1.realName || user_1.username,
                        role: (userRole === null || userRole === void 0 ? void 0 : userRole.role_code) || 'user',
                        roleName: (userRole === null || userRole === void 0 ? void 0 : userRole.role_name) || '普通用户',
                        isAdmin: userRole ? ['admin', 'super_admin'].includes(userRole.role_code) : false,
                        kindergartenId: kindergartenId,
                        roles: userRole ? [{ code: userRole.role_code, name: userRole.role_name }] : []
                    }
                }, '登录成功');
                return [3 /*break*/, 14];
            case 13:
                error_1 = _b.sent();
                console.error('登录过程发生错误:', error_1);
                console.error('错误堆栈:', error_1 instanceof Error ? error_1.stack : String(error_1));
                res.status(500).json({
                    success: false,
                    error: 'INTERNAL_SERVER_ERROR',
                    message: '服务器内部错误',
                    details: error_1 instanceof Error ? error_1.message : String(error_1)
                });
                return [3 /*break*/, 14];
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.login = login;
/**
 * 刷新令牌
 */
var refreshToken = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decoded, userResults, user, userStatus, newToken, newRefreshToken, err_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                console.log('刷新令牌请求:', req.body);
                token = req.body.refreshToken;
                if (!token) {
                    console.log('刷新令牌为空');
                    return [2 /*return*/, next(apiError_1.ApiError.badRequest('刷新令牌不能为空', 'REFRESH_TOKEN_REQUIRED'))];
                }
                console.log('尝试验证刷新令牌:', token);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 6]);
                decoded = (0, jwt_1.verifyToken)(token);
                console.log('令牌解码成功:', decoded);
                // 检查是否是刷新令牌
                if (!decoded.isRefreshToken || decoded.type !== jwt_config_1.TOKEN_TYPES.REFRESH) {
                    console.log('令牌类型不正确:', decoded.isRefreshToken, decoded.type);
                    return [2 /*return*/, next(apiError_1.ApiError.badRequest('无效的刷新令牌', 'INVALID_REFRESH_TOKEN'))];
                }
                console.log('查询用户:', decoded.userId);
                return [4 /*yield*/, init_1.sequelize.query("SELECT id, username, status\n         FROM users\n         WHERE id = :userId", {
                        replacements: { userId: decoded.userId },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                userResults = _a.sent();
                user = userResults && userResults.length > 0 ? userResults[0] : null;
                if (!user) {
                    return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户不存在', 'USER_NOT_FOUND'))];
                }
                userStatus = String(user.status).toLowerCase();
                if (userStatus !== index_1.UserStatus.ACTIVE.toLowerCase() && userStatus !== '1') {
                    res.status(403).json({
                        success: false,
                        error: 'ACCOUNT_DISABLED',
                        message: '账号已被禁用，请联系管理员'
                    });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, (0, jwt_1.generateDynamicToken)({
                        userId: user.id,
                        username: user.username,
                        type: jwt_config_1.TOKEN_TYPES.ACCESS
                    })];
            case 3:
                newToken = _a.sent();
                return [4 /*yield*/, (0, jwt_1.generateDynamicToken)({
                        userId: user.id,
                        username: user.username,
                        type: jwt_config_1.TOKEN_TYPES.REFRESH,
                        isRefreshToken: true
                    })];
            case 4:
                newRefreshToken = _a.sent();
                apiResponse_1.ApiResponse.success(res, {
                    token: newToken,
                    refreshToken: newRefreshToken
                }, '刷新令牌成功');
                return [3 /*break*/, 6];
            case 5:
                err_1 = _a.sent();
                return [2 /*return*/, next(apiError_1.ApiError.unauthorized('刷新令牌已过期或无效', 'INVALID_REFRESH_TOKEN'))];
            case 6: return [3 /*break*/, 8];
            case 7:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.refreshToken = refreshToken;
/**
 * 退出登录
 */
var logout = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, token, error_3;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                user = req.user;
                token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace('Bearer ', '');
                if (!(user && token)) return [3 /*break*/, 3];
                // 删除用户会话
                return [4 /*yield*/, session_service_1["default"].deleteSession(user.id, token)];
            case 1:
                // 删除用户会话
                _b.sent();
                // 将Token加入黑名单
                return [4 /*yield*/, session_service_1["default"].addToBlacklist(token)];
            case 2:
                // 将Token加入黑名单
                _b.sent();
                console.log("\u2705 \u7528\u6237".concat(user.id, "\u5DF2\u767B\u51FA"));
                _b.label = 3;
            case 3:
                apiResponse_1.ApiResponse.success(res, { message: '退出成功' });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _b.sent();
                console.error('❌ 登出失败:', error_3);
                next(error_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.logout = logout;
/**
 * 验证令牌
 */
var verifyTokenEndpoint = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user;
    return __generator(this, function (_a) {
        try {
            user = req.user;
            if (!user) {
                return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户信息不存在', 'USER_NOT_FOUND'))];
            }
            apiResponse_1.ApiResponse.success(res, {
                valid: true,
                user: {
                    id: user.id,
                    username: user.username || ''
                }
            }, 'Token验证成功');
        }
        catch (error) {
            next(error);
        }
        return [2 /*return*/];
    });
}); };
exports.verifyTokenEndpoint = verifyTokenEndpoint;
/**
 * 获取当前用户信息
 */
var getCurrentUser = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, userResults, userInfo, roleResults, roles, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                user = req.user;
                if (!user) {
                    return [2 /*return*/, next(apiError_1.ApiError.unauthorized('用户信息不存在', 'USER_NOT_FOUND'))];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT \n        u.id, \n        u.username, \n        u.email, \n        u.real_name as realName, \n        u.phone, \n        u.status,\n        u.created_at as createdAt\n      FROM users u\n      WHERE u.id = :userId\n    ", {
                        replacements: { userId: user.id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                userResults = _a.sent();
                userInfo = userResults && userResults.length > 0 ? userResults[0] : null;
                if (!userInfo) {
                    return [2 /*return*/, next(apiError_1.ApiError.notFound('用户不存在', 'USER_NOT_FOUND'))];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT r.code as role_code, r.name as role_name\n      FROM user_roles ur\n      INNER JOIN roles r ON ur.role_id = r.id\n      WHERE ur.user_id = :userId\n    ", {
                        replacements: { userId: user.id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                roleResults = _a.sent();
                roles = roleResults.map(function (role) { return ({
                    code: role.role_code,
                    name: role.role_name
                }); });
                apiResponse_1.ApiResponse.success(res, {
                    id: userInfo.id,
                    username: userInfo.username,
                    email: userInfo.email || '',
                    realName: userInfo.realName || userInfo.username,
                    phone: userInfo.phone || '',
                    status: userInfo.status,
                    createdAt: userInfo.createdAt,
                    roles: roles
                }, '获取用户信息成功');
                return [3 /*break*/, 4];
            case 3:
                error_4 = _a.sent();
                next(error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getCurrentUser = getCurrentUser;
/**
 * 获取用户菜单权限
 */
var getUserMenu = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, roleResults, userRole, isAdmin, centerCategories, menuItems, _i, centerCategories_1, category, categoryMenus, categoryItem, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 7, , 8]);
                user = req.user;
                if (!user) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户信息不存在', '401')];
                }
                console.log('🔍 获取用户菜单权限，用户ID:', user.id);
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT r.code as role_code, r.name as role_name\n      FROM user_roles ur\n      INNER JOIN roles r ON ur.role_id = r.id\n      WHERE ur.user_id = :userId\n    ", {
                        replacements: { userId: user.id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                roleResults = _a.sent();
                userRole = roleResults[0];
                isAdmin = userRole ? ['admin', 'super_admin'].includes(userRole.role_code) : false;
                console.log('👤 用户角色:', userRole === null || userRole === void 0 ? void 0 : userRole.role_code, '是否管理员:', isAdmin);
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT id, name, chinese_name, code, path, icon, sort\n      FROM permissions \n      WHERE status = 1 AND type = 'category' AND parent_id IS NULL\n      ORDER BY sort\n    ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                centerCategories = _a.sent();
                console.log('📂 找到分类:', centerCategories.length, '个');
                menuItems = [];
                _i = 0, centerCategories_1 = centerCategories;
                _a.label = 3;
            case 3:
                if (!(_i < centerCategories_1.length)) return [3 /*break*/, 6];
                category = centerCategories_1[_i];
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT id, name, chinese_name, code, path, component, icon, sort, type\n        FROM permissions \n        WHERE status = 1 AND parent_id = :categoryId AND type = 'menu'\n        ORDER BY sort\n      ", {
                        replacements: { categoryId: category.id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 4:
                categoryMenus = _a.sent();
                console.log("\uD83D\uDCC1 \u5206\u7C7B ".concat(category.chinese_name || category.name, " \u4E0B\u6709 ").concat(categoryMenus.length, " \u4E2A\u83DC\u5355"));
                categoryItem = {
                    id: category.code.toLowerCase().replace(/_/g, '-'),
                    name: category.name,
                    chinese_name: category.chinese_name || category.name,
                    title: category.chinese_name || category.name,
                    path: category.path,
                    icon: category.icon || 'Menu',
                    type: category.type,
                    sort: category.sort,
                    visible: true,
                    children: categoryMenus.map(function (menu) { return ({
                        id: menu.code.toLowerCase().replace(/_/g, '-'),
                        name: menu.name,
                        chinese_name: menu.chinese_name || menu.name,
                        title: menu.chinese_name || menu.name,
                        path: menu.path,
                        component: menu.component,
                        icon: menu.icon || 'Menu',
                        type: menu.type,
                        sort: menu.sort,
                        visible: true
                    }); })
                };
                menuItems.push(categoryItem);
                _a.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                console.log('🎯 最终菜单结构:', menuItems.length, '个分类');
                console.log('📋 分类详情:', menuItems.map(function (item) { var _a; return "".concat(item.title, "(").concat(((_a = item.children) === null || _a === void 0 ? void 0 : _a.length) || 0, "\u4E2A\u5B50\u9879)"); }));
                apiResponse_1.ApiResponse.success(res, menuItems, '获取菜单权限成功');
                return [3 /*break*/, 8];
            case 7:
                error_5 = _a.sent();
                console.error('获取菜单权限失败:', error_5);
                next(error_5);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
/**
 * 获取用户角色信息
 */
var getUserRoles = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var user, roleResults, roles, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                user = req.user;
                if (!user) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户信息不存在', '401')];
                }
                return [4 /*yield*/, init_1.sequelize.query("\n      SELECT r.id, r.code, r.name, r.description, r.permissions\n      FROM user_roles ur\n      INNER JOIN roles r ON ur.role_id = r.id\n      WHERE ur.user_id = :userId\n    ", {
                        replacements: { userId: user.id },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                roleResults = _a.sent();
                roles = roleResults.map(function (role) { return ({
                    id: role.id,
                    code: role.code,
                    name: role.name,
                    description: role.description,
                    permissions: role.permissions ? JSON.parse(role.permissions) : []
                }); });
                apiResponse_1.ApiResponse.success(res, {
                    roles: roles,
                    currentRole: roles[0] || null,
                    isAdmin: roles.some(function (role) { return ['admin', 'super_admin'].includes(role.code); })
                }, '获取角色信息成功');
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('获取角色信息失败:', error_6);
                next(error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports["default"] = {
    login: exports.login,
    refreshToken: exports.refreshToken,
    logout: exports.logout,
    verifyTokenEndpoint: exports.verifyTokenEndpoint,
    getCurrentUser: exports.getCurrentUser,
    getUserMenu: getUserMenu,
    getUserRoles: getUserRoles
};
