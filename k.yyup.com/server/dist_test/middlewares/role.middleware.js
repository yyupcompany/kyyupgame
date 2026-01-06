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
exports.requireFinance = exports.requireMarketing = exports.requireTeacher = exports.requirePrincipal = exports.requireAdmin = exports.requireRole = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
/**
 * 检查用户是否有指定角色的中间件
 * @param allowedRoles 允许的角色代码数组
 * @returns 中间件函数
 */
var requireRole = function (allowedRoles) {
    return function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
        var user, roleQuery, userRoles, userRoleCodes_1, hasPermission, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    user = req.user;
                    if (!user || !user.id) {
                        throw apiError_1.ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
                    }
                    roleQuery = "\n        SELECT DISTINCT r.code\n        FROM roles r\n        INNER JOIN user_roles ur ON r.id = ur.role_id\n        WHERE ur.user_id = :userId AND r.status = 1\n      ";
                    return [4 /*yield*/, init_1.sequelize.query(roleQuery, {
                            replacements: { userId: user.id },
                            type: sequelize_1.QueryTypes.SELECT
                        })];
                case 1:
                    userRoles = _a.sent();
                    userRoleCodes_1 = userRoles.map(function (role) { return role.code; });
                    hasPermission = allowedRoles.some(function (role) { return userRoleCodes_1.includes(role); });
                    if (!hasPermission) {
                        throw apiError_1.ApiError.forbidden("\u9700\u8981\u4EE5\u4E0B\u89D2\u8272\u4E4B\u4E00: ".concat(allowedRoles.join(', ')), 'INSUFFICIENT_ROLE');
                    }
                    // 将用户角色添加到请求对象中，方便后续使用
                    req.userRoles = userRoleCodes_1;
                    next();
                    return [3 /*break*/, 3];
                case 2:
                    error_1 = _a.sent();
                    if (error_1 instanceof apiError_1.ApiError) {
                        res.status(error_1.statusCode).json({
                            success: false,
                            message: error_1.message,
                            code: error_1.code
                        });
                        return [2 /*return*/];
                    }
                    res.status(500).json({
                        success: false,
                        message: '角色验证失败',
                        code: 'ROLE_CHECK_ERROR'
                    });
                    return [2 /*return*/];
                case 3: return [2 /*return*/];
            }
        });
    }); };
};
exports.requireRole = requireRole;
/**
 * 检查用户是否是管理员
 */
exports.requireAdmin = (0, exports.requireRole)(['admin', 'super_admin']);
/**
 * 检查用户是否是园长
 */
exports.requirePrincipal = (0, exports.requireRole)(['principal', 'admin', 'super_admin']);
/**
 * 检查用户是否是教师或更高权限
 */
exports.requireTeacher = (0, exports.requireRole)(['teacher', 'principal', 'admin', 'super_admin']);
/**
 * 检查用户是否是营销人员或更高权限
 */
exports.requireMarketing = (0, exports.requireRole)(['marketing', 'admin', 'super_admin']);
/**
 * 检查用户是否是财务人员或更高权限
 */
exports.requireFinance = (0, exports.requireRole)(['finance', 'admin', 'super_admin']);
