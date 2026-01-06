"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.roleController = exports.RoleController = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
// 获取数据库实例
var getSequelizeInstance = function () {
    return init_1.sequelize;
};
/**
 * 角色控制器 - 简化版本，只处理角色信息
 */
var RoleController = /** @class */ (function () {
    function RoleController() {
    }
    /**
     * 获取用户角色列表
     * @param req 请求对象
     * @param res 响应对象
     */
    RoleController.prototype.getUserRoles = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, roleQuery, db, roles, rolesList, responseData, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('[角色调试] 开始获取用户角色');
                        user = req.user;
                        console.log('[角色调试] 用户信息:', user);
                        if (!user || !user.id) {
                            console.log('[角色调试] 用户未登录');
                            throw apiError_1.ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
                        }
                        console.log('[角色调试] 用户ID:', user.id);
                        roleQuery = "\n        SELECT DISTINCT r.id, r.name, r.code, r.description\n        FROM roles r\n        INNER JOIN user_roles ur ON r.id = ur.role_id\n        WHERE ur.user_id = :userId AND r.status = 1\n        ORDER BY r.id\n      ";
                        console.log('[角色调试] 执行SQL查询:', roleQuery);
                        console.log('[角色调试] 查询参数:', { userId: user.id });
                        db = getSequelizeInstance();
                        return [4 /*yield*/, db.query(roleQuery, {
                                replacements: { userId: user.id },
                                type: 'SELECT'
                            })];
                    case 1:
                        roles = _a.sent();
                        rolesList = Array.isArray(roles) ? roles : [];
                        console.log('[角色调试] 查询结果:', roles);
                        responseData = {
                            userId: user.id,
                            username: user.username,
                            roles: rolesList
                        };
                        console.log('[角色调试] 响应数据:', responseData);
                        apiResponse_1.ApiResponse.success(res, responseData, '获取用户角色成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('[角色调试] 错误:', error_1);
                        if (error_1 instanceof apiError_1.ApiError) {
                            throw error_1;
                        }
                        throw apiError_1.ApiError.serverError('获取用户角色失败', 'GET_USER_ROLES_ERROR');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取所有角色列表（管理员用）
     * @param req 请求对象
     * @param res 响应对象
     */
    RoleController.prototype.getAllRoles = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, _d, search, _e, sortBy, _f, sortOrder, _g, status_1, pageNum, pageSizeNum, offset, whereConditions, replacements, whereClause, validSortFields, sortField, sortDirection, db, countQuery, countResult, countList, total, roleQuery, roles, rolesList, error_2;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 3, , 4]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, _d = _a.search, search = _d === void 0 ? '' : _d, _e = _a.sortBy, sortBy = _e === void 0 ? 'id' : _e, _f = _a.sortOrder, sortOrder = _f === void 0 ? 'asc' : _f, _g = _a.status, status_1 = _g === void 0 ? '1' : _g;
                        pageNum = Math.max(1, Number(page) || 1);
                        pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 20));
                        offset = Math.max(0, (pageNum - 1) * pageSizeNum);
                        whereConditions = ['status = :status'];
                        replacements = { status: Number(status_1) || 1 };
                        // 添加搜索条件
                        if (search && typeof search === 'string' && search.trim()) {
                            whereConditions.push('(name LIKE :search OR code LIKE :search OR description LIKE :search)');
                            replacements.search = "%".concat(search.trim(), "%");
                        }
                        whereClause = whereConditions.join(' AND ');
                        validSortFields = ['id', 'name', 'code', 'created_at', 'updated_at'];
                        sortField = validSortFields.includes(sortBy) ? sortBy : 'id';
                        sortDirection = (sortOrder === null || sortOrder === void 0 ? void 0 : sortOrder.toLowerCase()) === 'desc' ? 'DESC' : 'ASC';
                        db = getSequelizeInstance();
                        countQuery = "SELECT COUNT(*) as total FROM roles WHERE ".concat(whereClause);
                        return [4 /*yield*/, db.query(countQuery, {
                                replacements: replacements,
                                type: 'SELECT'
                            })];
                    case 1:
                        countResult = _h.sent();
                        countList = Array.isArray(countResult) ? countResult : [];
                        total = countList.length > 0 ? countList[0].total : 0;
                        roleQuery = "\n        SELECT id, name, code, description, status, created_at, updated_at\n        FROM roles\n        WHERE ".concat(whereClause, "\n        ORDER BY ").concat(sortField, " ").concat(sortDirection, "\n        LIMIT :limit OFFSET :offset\n      ");
                        return [4 /*yield*/, db.query(roleQuery, {
                                replacements: __assign(__assign({}, replacements), { limit: pageSizeNum, offset: offset }),
                                type: 'SELECT'
                            })];
                    case 2:
                        roles = _h.sent();
                        rolesList = Array.isArray(roles) ? roles : [];
                        apiResponse_1.ApiResponse.success(res, {
                            total: total,
                            items: rolesList,
                            page: pageNum,
                            pageSize: pageSizeNum
                        }, '获取角色列表成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _h.sent();
                        if (error_2 instanceof apiError_1.ApiError) {
                            throw error_2;
                        }
                        throw apiError_1.ApiError.serverError('获取角色列表失败', 'GET_ROLES_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 检查用户是否有指定角色
     * @param req 请求对象
     * @param res 响应对象
     */
    RoleController.prototype.checkUserRole = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var user, roleCode, checkQuery, db, result, resultList, hasRole, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        user = req.user;
                        roleCode = req.params.roleCode;
                        if (!user || !user.id) {
                            throw apiError_1.ApiError.unauthorized('用户未登录', 'USER_NOT_LOGGED_IN');
                        }
                        if (!roleCode) {
                            throw apiError_1.ApiError.badRequest('角色代码不能为空', 'ROLE_CODE_REQUIRED');
                        }
                        checkQuery = "\n        SELECT COUNT(*) as count\n        FROM user_roles ur\n        INNER JOIN roles r ON ur.role_id = r.id\n        WHERE ur.user_id = :userId AND r.code = :roleCode AND r.status = 1\n      ";
                        db = getSequelizeInstance();
                        return [4 /*yield*/, db.query(checkQuery, {
                                replacements: { userId: user.id, roleCode: roleCode },
                                type: 'SELECT'
                            })];
                    case 1:
                        result = _a.sent();
                        resultList = Array.isArray(result) ? result : [];
                        hasRole = resultList.length > 0 ? resultList[0].count > 0 : false;
                        apiResponse_1.ApiResponse.success(res, {
                            userId: user.id,
                            roleCode: roleCode,
                            hasRole: hasRole
                        }, hasRole ? '用户拥有该角色' : '用户没有该角色');
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof apiError_1.ApiError) {
                            throw error_3;
                        }
                        throw apiError_1.ApiError.serverError('检查用户角色失败', 'CHECK_USER_ROLE_ERROR');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建角色
     * @param req 请求对象
     * @param res 响应对象
     */
    RoleController.prototype.createRole = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, name_1, code, description, user, existQuery, existResult, createQuery, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        console.log('[角色创建] 开始处理请求');
                        console.log('[角色创建] 请求体:', req.body);
                        _a = req.body, name_1 = _a.name, code = _a.code, description = _a.description;
                        user = req.user;
                        console.log('[角色创建] 解析参数:', { name: name_1, code: code, description: description });
                        if (!name_1 || !code) {
                            console.log('[角色创建] 参数验证失败');
                            throw apiError_1.ApiError.badRequest('角色名称和代码不能为空', 'ROLE_NAME_CODE_REQUIRED');
                        }
                        existQuery = 'SELECT COUNT(*) as count FROM roles WHERE code = :code';
                        return [4 /*yield*/, init_1.sequelize.query(existQuery, {
                                replacements: { code: code },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        existResult = (_b.sent())[0];
                        if (existResult.count > 0) {
                            throw apiError_1.ApiError.badRequest('角色代码已存在', 'ROLE_CODE_EXISTS');
                        }
                        createQuery = "\n        INSERT INTO roles (name, code, description, status, created_at, updated_at)\n        VALUES (:name, :code, :description, 1, NOW(), NOW())\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(createQuery, {
                                replacements: {
                                    name: name_1,
                                    code: code,
                                    description: description || ''
                                },
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 2:
                        _b.sent();
                        // 暂时返回基本信息，避免查询问题
                        console.log('[角色创建] 角色创建成功，代码:', code);
                        return [2 /*return*/, res.status(200).json({
                                success: true,
                                data: {
                                    name: name_1,
                                    code: code,
                                    description: description || '',
                                    status: 1,
                                    message: '角色创建成功，但暂时无法返回完整信息'
                                },
                                message: '创建角色成功'
                            })];
                    case 3:
                        error_4 = _b.sent();
                        console.log('[角色创建] 发生错误:', error_4);
                        if (error_4 instanceof apiError_1.ApiError) {
                            return [2 /*return*/, res.status(error_4.statusCode).json({
                                    success: false,
                                    message: error_4.message,
                                    code: error_4.code
                                })];
                        }
                        return [2 /*return*/, res.status(500).json({
                                success: false,
                                message: '创建角色失败',
                                code: 'CREATE_ROLE_ERROR'
                            })];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新角色
     * @param req 请求对象
     * @param res 响应对象
     */
    RoleController.prototype.updateRole = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, _a, name_2, description, user, existQuery, existResult, updateQuery, roleQuery, roleResults, updatedRole, error_5;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        id = req.params.id;
                        _a = req.body, name_2 = _a.name, description = _a.description;
                        user = req.user;
                        if (!id || isNaN(Number(id) || 0)) {
                            throw apiError_1.ApiError.badRequest('无效的角色ID', 'INVALID_ROLE_ID');
                        }
                        existQuery = 'SELECT id FROM roles WHERE id = :id AND status = 1';
                        return [4 /*yield*/, init_1.sequelize.query(existQuery, {
                                replacements: { id: Number(id) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        existResult = (_b.sent())[0];
                        if (!existResult || existResult.length === 0) {
                            throw apiError_1.ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
                        }
                        updateQuery = "\n        UPDATE roles \n        SET name = :name, description = :description, updated_at = NOW()\n        WHERE id = :id\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                                replacements: {
                                    id: Number(id) || 0,
                                    name: name_2,
                                    description: description || ''
                                },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 2:
                        _b.sent();
                        roleQuery = 'SELECT id, name, code, description, status, updated_at FROM roles WHERE id = :id';
                        return [4 /*yield*/, init_1.sequelize.query(roleQuery, {
                                replacements: { id: Number(id) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        roleResults = (_b.sent())[0];
                        if (!roleResults || roleResults.length === 0) {
                            throw apiError_1.ApiError.serverError('更新角色成功但无法查询到角色信息', 'ROLE_QUERY_ERROR');
                        }
                        updatedRole = roleResults[0];
                        apiResponse_1.ApiResponse.success(res, updatedRole, '更新角色成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _b.sent();
                        if (error_5 instanceof apiError_1.ApiError) {
                            throw error_5;
                        }
                        throw apiError_1.ApiError.serverError('更新角色失败', 'UPDATE_ROLE_ERROR');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除角色
     * @param req 请求对象
     * @param res 响应对象
     */
    RoleController.prototype.deleteRole = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, user, existQuery, existResult, role, userRoleQuery, userRoleResult, count, deleteQuery, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        id = req.params.id;
                        user = req.user;
                        console.log('[角色删除] 开始删除角色，ID:', id);
                        if (!id || isNaN(Number(id) || 0)) {
                            throw apiError_1.ApiError.badRequest('无效的角色ID', 'INVALID_ROLE_ID');
                        }
                        existQuery = 'SELECT id, code FROM roles WHERE id = :id AND status = 1';
                        console.log('[角色删除] 执行存在性查询:', existQuery);
                        return [4 /*yield*/, init_1.sequelize.query(existQuery, {
                                replacements: { id: Number(id) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        existResult = _b.sent();
                        console.log('[角色删除] 存在性查询结果:', existResult);
                        // 如果角色不存在或已被删除，也返回成功（幂等性）
                        if (!existResult || existResult.length === 0) {
                            console.log('[角色删除] 角色不存在，返回成功');
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { id: Number(id) || 0 }, '删除角色成功')];
                        }
                        role = existResult[0];
                        // 检查是否为系统角色（不允许删除）
                        console.log('[角色删除] 检查系统角色，角色代码:', role.code);
                        if (role.code === 'admin' || role.code === 'user') {
                            console.log('[角色删除] 系统角色不允许删除');
                            throw apiError_1.ApiError.badRequest('系统角色不允许删除', 'SYSTEM_ROLE_CANNOT_DELETE');
                        }
                        userRoleQuery = 'SELECT COUNT(*) as count FROM user_roles WHERE role_id = :roleId';
                        console.log('[角色删除] 执行用户角色查询:', userRoleQuery);
                        return [4 /*yield*/, init_1.sequelize.query(userRoleQuery, {
                                replacements: { roleId: Number(id) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        userRoleResult = _b.sent();
                        console.log('[角色删除] 用户角色查询结果:', userRoleResult);
                        count = ((_a = userRoleResult[0]) === null || _a === void 0 ? void 0 : _a.count) || 0;
                        console.log('[角色删除] 使用该角色的用户数量:', count);
                        if (count > 0) {
                            console.log('[角色删除] 角色正在被用户使用，无法删除');
                            throw apiError_1.ApiError.badRequest('该角色正在被用户使用，无法删除', 'ROLE_IN_USE');
                        }
                        deleteQuery = "\n        UPDATE roles\n        SET status = 0, updated_at = NOW(), deleted_at = NOW()\n        WHERE id = :id\n      ";
                        console.log('[角色删除] 执行删除查询:', deleteQuery);
                        return [4 /*yield*/, init_1.sequelize.query(deleteQuery, {
                                replacements: {
                                    id: Number(id) || 0
                                },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 3:
                        _b.sent();
                        console.log('[角色删除] 删除成功');
                        apiResponse_1.ApiResponse.success(res, { id: Number(id) || 0 }, '删除角色成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_6 = _b.sent();
                        console.error('[角色删除] 删除失败:', error_6);
                        if (error_6 instanceof apiError_1.ApiError) {
                            throw error_6;
                        }
                        throw apiError_1.ApiError.serverError('删除角色失败', 'DELETE_ROLE_ERROR');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return RoleController;
}());
exports.RoleController = RoleController;
exports.roleController = new RoleController();
