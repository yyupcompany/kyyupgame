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
exports.permissionController = exports.PermissionController = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
/**
 * 权限控制器 - 简化版本，只处理页面权限
 */
var PermissionController = /** @class */ (function () {
    function PermissionController() {
    }
    /**
     * 获取所有页面权限列表
     * @param req 请求对象
     * @param res 响应对象
     */
    PermissionController.prototype.getPagePermissions = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, pageNum, pageSizeNum, offset, countQuery, countResults, total, permissionQuery, permissions, error_1;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 50 : _c;
                        pageNum = Math.max(1, Number(page) || 1);
                        pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 10));
                        offset = Math.max(0, (pageNum - 1) * pageSizeNum);
                        countQuery = 'SELECT COUNT(*) as total FROM permissions WHERE status = 1';
                        return [4 /*yield*/, init_1.sequelize.query(countQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResults = (_d.sent())[0];
                        total = countResults && countResults.length > 0 ? countResults[0].total : 0;
                        permissionQuery = "\n        SELECT id, name, code, path, icon, status, created_at, updated_at\n        FROM permissions \n        WHERE status = 1\n        ORDER BY id\n        LIMIT :limit OFFSET :offset\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(permissionQuery, {
                                replacements: {
                                    limit: Number(pageSize) || 0,
                                    offset: offset
                                },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        permissions = _d.sent();
                        apiResponse_1.ApiResponse.success(res, {
                            total: total,
                            items: permissions,
                            page: Number(page) || 0,
                            pageSize: Number(pageSize) || 0
                        }, '获取页面权限列表成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _d.sent();
                        if (error_1 instanceof apiError_1.ApiError) {
                            throw error_1;
                        }
                        throw apiError_1.ApiError.serverError('获取页面权限列表失败', 'GET_PAGE_PERMISSIONS_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户可访问的页面列表
     * @param req 请求对象
     * @param res 响应对象
     */
    PermissionController.prototype.getUserPagePermissions = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, pageQuery, pages, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = req.user;
                        if (!user || !user.id) {
                            throw apiError_1.ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
                        }
                        pageQuery = "\n        SELECT DISTINCT p.id, p.name, p.code, p.path, p.icon\n        FROM permissions p\n        INNER JOIN role_permissions rp ON p.id = rp.permission_id\n        INNER JOIN user_roles ur ON rp.role_id = ur.role_id\n        WHERE ur.user_id = :userId AND p.status = 1\n        ORDER BY p.id\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(pageQuery, {
                                replacements: { userId: user.id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        pages = _a.sent();
                        apiResponse_1.ApiResponse.success(res, {
                            userId: user.id,
                            pages: pages
                        }, '获取用户页面权限成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        if (error_2 instanceof apiError_1.ApiError) {
                            throw error_2;
                        }
                        throw apiError_1.ApiError.serverError('获取用户页面权限失败', 'GET_USER_PAGE_PERMISSIONS_ERROR');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查用户是否可以访问指定页面
     * @param req 请求对象
     * @param res 响应对象
     */
    PermissionController.prototype.checkPageAccess = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, pagePath, checkQuery, resultRows, result, hasAccess, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = req.user;
                        pagePath = req.params.pagePath;
                        if (!user || !user.id) {
                            throw apiError_1.ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
                        }
                        if (!pagePath) {
                            throw apiError_1.ApiError.badRequest('页面路径不能为空', 'PAGE_PATH_REQUIRED');
                        }
                        checkQuery = "\n        SELECT COUNT(*) as count\n        FROM permissions p\n        INNER JOIN role_permissions rp ON p.id = rp.permission_id\n        INNER JOIN user_roles ur ON rp.role_id = ur.role_id\n        WHERE ur.user_id = :userId AND p.path = :pagePath AND p.status = 1\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(checkQuery, {
                                replacements: { userId: user.id, pagePath: "/".concat(pagePath) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        resultRows = (_a.sent())[0];
                        result = resultRows && resultRows.length > 0 ? resultRows[0] : { count: 0 };
                        hasAccess = result.count > 0;
                        apiResponse_1.ApiResponse.success(res, {
                            userId: user.id,
                            pagePath: pagePath,
                            hasAccess: hasAccess
                        }, hasAccess ? '用户可以访问该页面' : '用户无权访问该页面');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof apiError_1.ApiError) {
                            throw error_3;
                        }
                        throw apiError_1.ApiError.serverError('检查页面访问权限失败', 'CHECK_PAGE_ACCESS_ERROR');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取角色的页面权限
     * @param req 请求对象
     * @param res 响应对象
     */
    PermissionController.prototype.getRolePagePermissions = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var roleId, roleQuery, roleResults, role, pageQuery, pages, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        roleId = req.params.roleId;
                        if (!roleId || isNaN(Number(roleId) || 0)) {
                            throw apiError_1.ApiError.badRequest('无效的角色ID', 'INVALID_ROLE_ID');
                        }
                        roleQuery = 'SELECT id, name, code FROM roles WHERE id = :roleId AND status = 1';
                        return [4 /*yield*/, init_1.sequelize.query(roleQuery, {
                                replacements: { roleId: Number(roleId) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        roleResults = (_a.sent())[0];
                        if (!roleResults || roleResults.length === 0) {
                            throw apiError_1.ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
                        }
                        role = roleResults[0];
                        pageQuery = "\n        SELECT p.id, p.name, p.code, p.path, p.icon\n        FROM permissions p\n        INNER JOIN role_permissions rp ON p.id = rp.permission_id\n        WHERE rp.role_id = :roleId AND p.status = 1\n        ORDER BY p.id\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(pageQuery, {
                                replacements: { roleId: Number(roleId) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        pages = _a.sent();
                        apiResponse_1.ApiResponse.success(res, {
                            role: role,
                            pages: pages
                        }, '获取角色页面权限成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        if (error_4 instanceof apiError_1.ApiError) {
                            throw error_4;
                        }
                        throw apiError_1.ApiError.serverError('获取角色页面权限失败', 'GET_ROLE_PAGE_PERMISSIONS_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新角色的页面权限
     * @param req 请求对象
     * @param res 响应对象
     */
    PermissionController.prototype.updateRolePagePermissions = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var roleId_1, permissionIds, roleQuery, roleResults, permissionQuery, permissionResults, permissionResult, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        roleId_1 = req.params.roleId;
                        permissionIds = req.body.permissionIds;
                        if (!roleId_1 || isNaN(Number(roleId_1) || 0)) {
                            throw apiError_1.ApiError.badRequest('无效的角色ID', 'INVALID_ROLE_ID');
                        }
                        if (!Array.isArray(permissionIds)) {
                            throw apiError_1.ApiError.badRequest('权限ID列表格式错误', 'INVALID_PERMISSION_IDS');
                        }
                        roleQuery = 'SELECT id FROM roles WHERE id = :roleId AND status = 1';
                        return [4 /*yield*/, init_1.sequelize.query(roleQuery, {
                                replacements: { roleId: Number(roleId_1) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        roleResults = (_a.sent())[0];
                        if (!roleResults || roleResults.length === 0) {
                            throw apiError_1.ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
                        }
                        if (!(permissionIds.length > 0)) return [3 /*break*/, 3];
                        permissionQuery = "\n          SELECT COUNT(*) as count \n          FROM permissions \n          WHERE id IN (".concat(permissionIds.join(','), ") AND status = 1\n        ");
                        return [4 /*yield*/, init_1.sequelize.query(permissionQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        permissionResults = (_a.sent())[0];
                        permissionResult = permissionResults && permissionResults.length > 0 ? permissionResults[0] : { count: 0 };
                        if (permissionResult.count !== permissionIds.length) {
                            throw apiError_1.ApiError.badRequest('部分权限ID无效', 'INVALID_PERMISSION_IDS');
                        }
                        _a.label = 3;
                    case 3:
                        // 这里应该在事务中执行，但由于只读限制，我们返回操作指令
                        apiResponse_1.ApiResponse.success(res, {
                            message: '权限更新操作准备就绪',
                            operations: __spreadArray([
                                "DELETE FROM role_permissions WHERE role_id = ".concat(roleId_1)
                            ], permissionIds.map(function (permId) {
                                return "INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at) VALUES (".concat(roleId_1, ", ").concat(permId, ", NOW(), NOW())");
                            }), true)
                        }, '角色页面权限更新准备完成');
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _a.sent();
                        if (error_5 instanceof apiError_1.ApiError) {
                            throw error_5;
                        }
                        throw apiError_1.ApiError.serverError('更新角色页面权限失败', 'UPDATE_ROLE_PAGE_PERMISSIONS_ERROR');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return PermissionController;
}());
exports.PermissionController = PermissionController;
exports.permissionController = new PermissionController();
