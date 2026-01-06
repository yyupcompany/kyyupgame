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
exports.checkPermissionConflicts = exports.getRolePermissionHistory = exports.getPermissionInheritance = exports.getRolePermissions = exports.removePermissionsFromRole = exports.assignPermissionsToRole = void 0;
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
var init_1 = require("../init");
var Joi = require('joi');
var role_model_1 = require("../models/role.model");
var permission_model_1 = require("../models/permission.model");
var role_permission_model_1 = require("../models/role-permission.model");
var user_model_1 = require("../models/user.model");
/**
 * 为角色分配权限
 */
var assignPermissionsToRole = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transaction, schema, _a, error, value, roleId, permissionIds, _b, isInherit, grantorId, role, permissions, existingPermissions, now, newPermissions, _loop_1, _i, permissionIds_1, permissionId, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
            case 1:
                transaction = _c.sent();
                _c.label = 2;
            case 2:
                _c.trys.push([2, 15, , 17]);
                schema = Joi.object({
                    roleId: Joi.number().required(),
                    permissionIds: Joi.array().items(Joi.number()).min(1).required(),
                    isInherit: Joi.number().valid(0, 1),
                    grantorId: Joi.number()
                });
                _a = schema.validate(__assign(__assign({}, req.params), req.body)), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                roleId = value.roleId, permissionIds = value.permissionIds, _b = value.isInherit, isInherit = _b === void 0 ? 1 : _b, grantorId = value.grantorId;
                return [4 /*yield*/, role_model_1.Role.findByPk(roleId, { transaction: transaction })];
            case 3:
                role = _c.sent();
                if (!!role) return [3 /*break*/, 5];
                return [4 /*yield*/, transaction.rollback()];
            case 4:
                _c.sent();
                throw apiError_1.ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
            case 5:
                if (!(!Array.isArray(permissionIds) || permissionIds.length === 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, transaction.rollback()];
            case 6:
                _c.sent();
                throw apiError_1.ApiError.badRequest('权限ID列表不能为空', 'PERMISSION_IDS_REQUIRED');
            case 7: return [4 /*yield*/, permission_model_1.Permission.findAll({
                    where: { id: permissionIds },
                    transaction: transaction
                })];
            case 8:
                permissions = _c.sent();
                if (!(permissions.length !== permissionIds.length)) return [3 /*break*/, 10];
                return [4 /*yield*/, transaction.rollback()];
            case 9:
                _c.sent();
                throw apiError_1.ApiError.badRequest('部分权限不存在', 'SOME_PERMISSIONS_NOT_FOUND');
            case 10: return [4 /*yield*/, role_permission_model_1.RolePermission.findAll({
                    where: { roleId: roleId },
                    transaction: transaction
                })];
            case 11:
                existingPermissions = _c.sent();
                now = new Date();
                newPermissions = [];
                _loop_1 = function (permissionId) {
                    // 检查是否已存在该权限分配
                    var existingPermission = existingPermissions.find(function (p) { return p.permissionId === Number(permissionId) || 0; });
                    if (!existingPermission) {
                        newPermissions.push({
                            roleId: Number(roleId) || 0,
                            permissionId: Number(permissionId) || 0,
                            isInherit: Number(isInherit) || 0,
                            grantTime: now,
                            grantorId: grantorId || null
                        });
                    }
                };
                for (_i = 0, permissionIds_1 = permissionIds; _i < permissionIds_1.length; _i++) {
                    permissionId = permissionIds_1[_i];
                    _loop_1(permissionId);
                }
                if (!(newPermissions.length > 0)) return [3 /*break*/, 13];
                return [4 /*yield*/, role_permission_model_1.RolePermission.bulkCreate(newPermissions, { transaction: transaction })];
            case 12:
                _c.sent();
                _c.label = 13;
            case 13: return [4 /*yield*/, transaction.commit()];
            case 14:
                _c.sent();
                apiResponse_1.ApiResponse.success(res, {
                    roleId: roleId,
                    permissionCount: permissions.length,
                    newlyAssigned: newPermissions.length
                }, '权限分配成功');
                return [3 /*break*/, 17];
            case 15:
                error_1 = _c.sent();
                return [4 /*yield*/, transaction.rollback()];
            case 16:
                _c.sent();
                if (error_1 instanceof apiError_1.ApiError) {
                    throw error_1;
                }
                throw apiError_1.ApiError.serverError('权限分配失败', 'PERMISSION_ASSIGN_ERROR');
            case 17: return [2 /*return*/];
        }
    });
}); };
exports.assignPermissionsToRole = assignPermissionsToRole;
/**
 * 移除角色的权限
 */
var removePermissionsFromRole = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transaction, schema, _a, error, value, roleId, permissionIds, role, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
            case 1:
                transaction = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 8, , 10]);
                schema = Joi.object({
                    roleId: Joi.number().required(),
                    permissionIds: Joi.array().items(Joi.number()).min(1).required()
                });
                _a = schema.validate(__assign(__assign({}, req.params), req.body)), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                roleId = value.roleId, permissionIds = value.permissionIds;
                return [4 /*yield*/, role_model_1.Role.findByPk(roleId, { transaction: transaction })];
            case 3:
                role = _b.sent();
                if (!!role) return [3 /*break*/, 5];
                return [4 /*yield*/, transaction.rollback()];
            case 4:
                _b.sent();
                throw apiError_1.ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
            case 5: return [4 /*yield*/, role_permission_model_1.RolePermission.destroy({
                    where: {
                        roleId: roleId,
                        permissionId: permissionIds
                    },
                    transaction: transaction
                })];
            case 6:
                result = _b.sent();
                return [4 /*yield*/, transaction.commit()];
            case 7:
                _b.sent();
                apiResponse_1.ApiResponse.success(res, {
                    roleId: roleId,
                    removedCount: result
                }, '权限移除成功');
                return [3 /*break*/, 10];
            case 8:
                error_2 = _b.sent();
                return [4 /*yield*/, transaction.rollback()];
            case 9:
                _b.sent();
                if (error_2 instanceof apiError_1.ApiError) {
                    throw error_2;
                }
                throw apiError_1.ApiError.serverError('权限移除失败', 'PERMISSION_REMOVE_ERROR');
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.removePermissionsFromRole = removePermissionsFromRole;
/**
 * 获取角色的所有权限
 */
var getRolePermissions = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var schema, _a, error, value, roleId, role, rolePermissions, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                schema = Joi.object({
                    roleId: Joi.number().required()
                });
                _a = schema.validate(req.params), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                roleId = value.roleId;
                return [4 /*yield*/, role_model_1.Role.findByPk(roleId)];
            case 1:
                role = _b.sent();
                if (!role) {
                    throw apiError_1.ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
                }
                return [4 /*yield*/, role_permission_model_1.RolePermission.findAll({
                        where: { roleId: roleId },
                        include: [
                            {
                                model: permission_model_1.Permission,
                                attributes: ['id', 'name', 'code', 'type', 'parentId', 'path', 'component', 'icon']
                            }
                        ]
                    })];
            case 2:
                rolePermissions = _b.sent();
                apiResponse_1.ApiResponse.success(res, {
                    roleId: roleId,
                    permissions: rolePermissions.map(function (rp) { return (__assign(__assign({}, rp.get()), { permission: rp.permission })); })
                }, '获取角色权限成功');
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                if (error_3 instanceof apiError_1.ApiError) {
                    throw error_3;
                }
                throw apiError_1.ApiError.serverError('获取角色权限失败', 'GET_ROLE_PERMISSIONS_ERROR');
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getRolePermissions = getRolePermissions;
/**
 * 获取权限继承结构
 */
var getPermissionInheritance = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var schema, _a, error, value, permissionId, permission, childPermissions, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                schema = Joi.object({
                    permissionId: Joi.number().required()
                });
                _a = schema.validate(req.params), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                permissionId = value.permissionId;
                return [4 /*yield*/, permission_model_1.Permission.findByPk(permissionId)];
            case 1:
                permission = _b.sent();
                if (!permission) {
                    throw apiError_1.ApiError.notFound('权限不存在', 'PERMISSION_NOT_FOUND');
                }
                return [4 /*yield*/, findChildPermissions(Number(permissionId) || 0)];
            case 2:
                childPermissions = _b.sent();
                apiResponse_1.ApiResponse.success(res, {
                    permission: permission,
                    childPermissions: childPermissions
                }, '获取权限继承结构成功');
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                if (error_4 instanceof apiError_1.ApiError) {
                    throw error_4;
                }
                throw apiError_1.ApiError.serverError('获取权限继承结构失败', 'GET_PERMISSION_INHERITANCE_ERROR');
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getPermissionInheritance = getPermissionInheritance;
/**
 * 递归查找子权限
 */
var findChildPermissions = function (parentId) { return __awaiter(void 0, void 0, void 0, function () {
    var children, result, _i, children_1, child, grandchildren;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, permission_model_1.Permission.findAll({
                    where: { parentId: parentId }
                })];
            case 1:
                children = _a.sent();
                result = __spreadArray([], children, true);
                _i = 0, children_1 = children;
                _a.label = 2;
            case 2:
                if (!(_i < children_1.length)) return [3 /*break*/, 5];
                child = children_1[_i];
                return [4 /*yield*/, findChildPermissions(child.id)];
            case 3:
                grandchildren = _a.sent();
                result.push.apply(result, grandchildren);
                _a.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, result];
        }
    });
}); };
/**
 * 获取权限分配历史
 */
var getRolePermissionHistory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var schema, _a, error, value, roleId, _b, page, _c, pageSize, role, _d, count, rows, error_5;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                schema = Joi.object({
                    roleId: Joi.number().required(),
                    page: Joi.number().min(1),
                    pageSize: Joi.number().min(1).max(100)
                });
                _a = schema.validate(__assign(__assign({}, req.params), req.query)), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                roleId = value.roleId, _b = value.page, page = _b === void 0 ? 1 : _b, _c = value.pageSize, pageSize = _c === void 0 ? 10 : _c;
                return [4 /*yield*/, role_model_1.Role.findByPk(roleId)];
            case 1:
                role = _e.sent();
                if (!role) {
                    throw apiError_1.ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
                }
                return [4 /*yield*/, role_permission_model_1.RolePermission.findAndCountAll({
                        where: { roleId: roleId },
                        include: [
                            {
                                model: permission_model_1.Permission,
                                attributes: ['id', 'name', 'code']
                            },
                            {
                                model: user_model_1.User,
                                as: 'grantor',
                                attributes: ['id', 'username', 'realName'],
                                required: false
                            }
                        ],
                        paranoid: false,
                        order: [['createdAt', 'DESC']],
                        limit: pageSize,
                        offset: (page - 1) * pageSize
                    })];
            case 2:
                _d = _e.sent(), count = _d.count, rows = _d.rows;
                apiResponse_1.ApiResponse.success(res, {
                    total: count,
                    page: Number(page) || 0,
                    pageSize: Number(pageSize) || 0,
                    list: rows
                }, '获取权限分配历史成功');
                return [3 /*break*/, 4];
            case 3:
                error_5 = _e.sent();
                if (error_5 instanceof apiError_1.ApiError) {
                    throw error_5;
                }
                throw apiError_1.ApiError.serverError('获取权限分配历史失败', 'GET_PERMISSION_HISTORY_ERROR');
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getRolePermissionHistory = getRolePermissionHistory;
/**
 * 检测权限冲突
 */
var checkPermissionConflicts = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, roleId, permissionIds, role, checkingPermissions, rolePermissions, currentPermissionIds_1, allPermissions, conflicts, _i, checkingPermissions_1, checkingPermission, conflictPermissionCodes, _loop_2, _b, conflictPermissionCodes_1, code, parentIds, childIds, error_6;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 10, , 11]);
                _a = req.body, roleId = _a.roleId, permissionIds = _a.permissionIds;
                return [4 /*yield*/, role_model_1.Role.findByPk(roleId)];
            case 1:
                role = _c.sent();
                if (!role) {
                    throw apiError_1.ApiError.notFound('角色不存在', 'ROLE_NOT_FOUND');
                }
                return [4 /*yield*/, permission_model_1.Permission.findAll({
                        where: { id: permissionIds }
                    })];
            case 2:
                checkingPermissions = _c.sent();
                if (checkingPermissions.length !== permissionIds.length) {
                    throw apiError_1.ApiError.badRequest('部分权限不存在');
                }
                return [4 /*yield*/, role_permission_model_1.RolePermission.findAll({
                        where: { roleId: roleId }
                    })];
            case 3:
                rolePermissions = _c.sent();
                currentPermissionIds_1 = rolePermissions.map(function (rp) { return rp.permissionId; });
                return [4 /*yield*/, permission_model_1.Permission.findAll()];
            case 4:
                allPermissions = _c.sent();
                conflicts = [];
                _i = 0, checkingPermissions_1 = checkingPermissions;
                _c.label = 5;
            case 5:
                if (!(_i < checkingPermissions_1.length)) return [3 /*break*/, 9];
                checkingPermission = checkingPermissions_1[_i];
                if (currentPermissionIds_1.includes(checkingPermission.id)) {
                    return [3 /*break*/, 8]; // 权限已存在，不检查冲突
                }
                conflictPermissionCodes = checkingPermission.conflictCodes || [];
                _loop_2 = function (code) {
                    var conflictPermission = allPermissions.find(function (p) { return p.code === code; });
                    if (conflictPermission && currentPermissionIds_1.includes(conflictPermission.id)) {
                        conflicts.push({
                            checkingPermission: checkingPermission.name,
                            conflictPermission: conflictPermission.name,
                            reason: "\u6743\u9650'".concat(checkingPermission.name, "'\u4E0E\u5DF2\u5206\u914D\u7684\u6743\u9650'").concat(conflictPermission.name, "'\u4E92\u65A5")
                        });
                    }
                };
                for (_b = 0, conflictPermissionCodes_1 = conflictPermissionCodes; _b < conflictPermissionCodes_1.length; _b++) {
                    code = conflictPermissionCodes_1[_b];
                    _loop_2(code);
                }
                return [4 /*yield*/, getParentPermissionIds(checkingPermission.id, allPermissions)];
            case 6:
                parentIds = _c.sent();
                return [4 /*yield*/, findChildPermissions(checkingPermission.id)];
            case 7:
                childIds = (_c.sent()).map(function (p) { return p.id; });
                // 如果父级权限已存在，则子权限无需重复分配
                if (parentIds.some(function (id) { return currentPermissionIds_1.includes(id); })) {
                    conflicts.push({
                        checkingPermission: checkingPermission.name,
                        reason: "\u6743\u9650'".concat(checkingPermission.name, "'\u7684\u7236\u7EA7\u6743\u9650\u5DF2\u5206\u914D\uFF0C\u65E0\u9700\u91CD\u590D\u5206\u914D")
                    });
                }
                // 如果子级权限已存在，则分配父级权限是冗余的
                if (childIds.some(function (id) { return currentPermissionIds_1.includes(id); })) {
                    conflicts.push({
                        checkingPermission: checkingPermission.name,
                        reason: "\u6743\u9650'".concat(checkingPermission.name, "'\u7684\u5B50\u7EA7\u6743\u9650\u5DF2\u5206\u914D\uFF0C\u5206\u914D\u7236\u7EA7\u6743\u9650\u662F\u591A\u4F59\u7684")
                    });
                }
                _c.label = 8;
            case 8:
                _i++;
                return [3 /*break*/, 5];
            case 9:
                apiResponse_1.ApiResponse.success(res, { conflicts: conflicts });
                return [3 /*break*/, 11];
            case 10:
                error_6 = _c.sent();
                if (error_6 instanceof apiError_1.ApiError) {
                    throw error_6;
                }
                throw apiError_1.ApiError.serverError('检查权限冲突失败');
            case 11: return [2 /*return*/];
        }
    });
}); };
exports.checkPermissionConflicts = checkPermissionConflicts;
/**
 * 递归获取父权限ID列表
 */
var getParentPermissionIds = function (permissionId, allPermissions) { return __awaiter(void 0, void 0, void 0, function () {
    var permission, parentIds, grandParentIds;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                permission = allPermissions.find(function (p) { return p.id === permissionId; });
                if (!permission || !permission.parentId) {
                    return [2 /*return*/, []];
                }
                parentIds = [permission.parentId];
                return [4 /*yield*/, getParentPermissionIds(permission.parentId, allPermissions)];
            case 1:
                grandParentIds = _a.sent();
                return [2 /*return*/, __spreadArray(__spreadArray([], parentIds, true), grandParentIds, true)];
        }
    });
}); };
exports["default"] = {
    assignPermissionsToRole: exports.assignPermissionsToRole,
    removePermissionsFromRole: exports.removePermissionsFromRole,
    getRolePermissions: exports.getRolePermissions,
    getPermissionInheritance: exports.getPermissionInheritance,
    getRolePermissionHistory: exports.getRolePermissionHistory,
    checkPermissionConflicts: exports.checkPermissionConflicts
};
