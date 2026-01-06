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
exports.__esModule = true;
exports.mockPermissionMiddleware = exports.permissionMiddleware = void 0;
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
/**
 * 权限验证中间件
 * 用于验证用户是否具有特定权限
 * @param requiredPermissions 必需的权限标识符列表
 * @returns 中间件函数
 */
var permissionMiddleware = function (requiredPermissions) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, userRole, permissionQuery, result, hasPermission, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('🔍 权限中间件被调用');
                    console.log('需要的权限:', requiredPermissions);
                    console.log('用户信息:', req.user);
                    // 确保用户已登录
                    if (!req.user) {
                        console.log('❌ 用户未登录');
                        res.status(401).json({
                            success: false,
                            message: '未授权访问'
                        });
                        return [2 /*return*/];
                    }
                    userId = req.user.id;
                    userRole = req.user.role;
                    console.log('用户ID:', userId, '用户角色:', userRole);
                    // 管理员拥有所有权限
                    if (req.user.isAdmin) {
                        console.log('✅ 管理员用户，允许通过');
                        return [2 /*return*/, next()];
                    }
                    // 如果没有指定权限要求，直接通过
                    if (!requiredPermissions || requiredPermissions.length === 0) {
                        console.log('✅ 无权限要求，允许通过');
                        return [2 /*return*/, next()];
                    }
                    permissionQuery = "\n        SELECT COUNT(*) as count\n        FROM role_permissions rp\n        INNER JOIN permissions p ON rp.permission_id = p.id\n        INNER JOIN user_roles ur ON rp.role_id = ur.role_id\n        WHERE ur.user_id = :userId \n          AND p.code IN (:permissionCodes) \n          AND p.status = 1\n      ";
                    return [4 /*yield*/, init_1.sequelize.query(permissionQuery, {
                            replacements: {
                                userId: userId,
                                permissionCodes: requiredPermissions
                            },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                case 1:
                    result = (_a.sent())[0];
                    hasPermission = result.count > 0;
                    if (!hasPermission) {
                        console.log('❌ 权限不足，需要权限:', requiredPermissions);
                        res.status(403).json({
                            success: false,
                            message: '权限不足',
                            requiredPermissions: requiredPermissions
                        });
                        return [2 /*return*/];
                    }
                    console.log('✅ 权限验证通过');
                    next();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ 权限验证失败:', error_1);
                    res.status(500).json({
                        success: false,
                        message: '服务器错误'
                    });
                    return [2 /*return*/];
                case 3: return [2 /*return*/];
            }
        });
    }); };
};
exports.permissionMiddleware = permissionMiddleware;
/**
 * 模拟权限中间件(用于开发测试)
 * 不执行实际权限检查，直接放行所有请求
 */
var mockPermissionMiddleware = function (requiredPermissions) {
    return function (_req, _res, next) {
        next();
    };
};
exports.mockPermissionMiddleware = mockPermissionMiddleware;
