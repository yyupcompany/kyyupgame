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
exports.getUserRoleHistory = exports.updateRoleValidity = exports.setPrimaryRole = exports.getUserRoles = exports.removeRolesFromUser = exports.assignRolesToUser = void 0;
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
var database_1 = require("../config/database");
var Joi = require('joi');
var user_model_1 = require("../models/user.model");
var role_model_1 = require("../models/role.model");
var user_role_model_1 = require("../models/user-role.model");
/**
 * 为用户分配角色
 */
var assignRolesToUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transaction, schema, _a, error, value, userId, roleIds, _b, isPrimary, _c, startTime, _d, endTime, grantorId, user, roles, existingUserRoles, now, newUserRoles, _loop_1, _i, roleIds_1, roleId, error_1;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0: return [4 /*yield*/, database_1.sequelize.transaction()];
            case 1:
                transaction = _e.sent();
                _e.label = 2;
            case 2:
                _e.trys.push([2, 15, , 17]);
                schema = Joi.object({
                    userId: Joi.number().required(),
                    roleIds: Joi.array().items(Joi.number()).min(1).required(),
                    isPrimary: Joi.number().valid(0, 1),
                    startTime: Joi.date().iso(),
                    endTime: Joi.date().iso().greater(Joi.ref('startTime')),
                    grantorId: Joi.number()
                });
                _a = schema.validate(__assign(__assign({}, req.params), req.body)), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                userId = value.userId, roleIds = value.roleIds, _b = value.isPrimary, isPrimary = _b === void 0 ? 0 : _b, _c = value.startTime, startTime = _c === void 0 ? null : _c, _d = value.endTime, endTime = _d === void 0 ? null : _d, grantorId = value.grantorId;
                return [4 /*yield*/, user_model_1.User.findByPk(userId, { transaction: transaction })];
            case 3:
                user = _e.sent();
                if (!!user) return [3 /*break*/, 5];
                return [4 /*yield*/, transaction.rollback()];
            case 4:
                _e.sent();
                throw apiError_1.ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
            case 5: return [4 /*yield*/, role_model_1.Role.findAll({
                    where: { id: roleIds },
                    transaction: transaction
                })];
            case 6:
                roles = _e.sent();
                if (!(roles.length !== roleIds.length)) return [3 /*break*/, 8];
                return [4 /*yield*/, transaction.rollback()];
            case 7:
                _e.sent();
                throw apiError_1.ApiError.badRequest('部分角色不存在', 'SOME_ROLES_NOT_FOUND');
            case 8: return [4 /*yield*/, user_role_model_1.UserRole.findAll({
                    where: { userId: userId },
                    transaction: transaction
                })];
            case 9:
                existingUserRoles = _e.sent();
                if (!(isPrimary === 1)) return [3 /*break*/, 11];
                return [4 /*yield*/, user_role_model_1.UserRole.update({ isPrimary: 0 }, {
                        where: { userId: userId },
                        transaction: transaction
                    })];
            case 10:
                _e.sent();
                _e.label = 11;
            case 11:
                now = new Date();
                newUserRoles = [];
                _loop_1 = function (roleId) {
                    // 检查是否已存在该角色分配
                    var existingUserRole = existingUserRoles.find(function (ur) { return ur.roleId === roleId; });
                    if (!existingUserRole) {
                        newUserRoles.push({
                            userId: userId,
                            roleId: roleId,
                            isPrimary: isPrimary,
                            startTime: startTime ? new Date(startTime) : null,
                            endTime: endTime ? new Date(endTime) : null,
                            grantorId: grantorId || null
                        });
                    }
                };
                for (_i = 0, roleIds_1 = roleIds; _i < roleIds_1.length; _i++) {
                    roleId = roleIds_1[_i];
                    _loop_1(roleId);
                }
                if (!(newUserRoles.length > 0)) return [3 /*break*/, 13];
                return [4 /*yield*/, user_role_model_1.UserRole.bulkCreate(newUserRoles, { transaction: transaction })];
            case 12:
                _e.sent();
                _e.label = 13;
            case 13: return [4 /*yield*/, transaction.commit()];
            case 14:
                _e.sent();
                apiResponse_1.ApiResponse.success(res, {
                    userId: userId,
                    roleCount: roles.length,
                    newlyAssigned: newUserRoles.length
                }, '角色分配成功');
                return [3 /*break*/, 17];
            case 15:
                error_1 = _e.sent();
                return [4 /*yield*/, transaction.rollback()];
            case 16:
                _e.sent();
                if (error_1 instanceof apiError_1.ApiError) {
                    throw error_1;
                }
                throw apiError_1.ApiError.serverError('角色分配失败', 'ROLE_ASSIGN_ERROR');
            case 17: return [2 /*return*/];
        }
    });
}); };
exports.assignRolesToUser = assignRolesToUser;
/**
 * 移除用户的角色
 */
var removeRolesFromUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transaction, schema, _a, error, value, userId, roleIds, user, result, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, database_1.sequelize.transaction()];
            case 1:
                transaction = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 8, , 10]);
                schema = Joi.object({
                    userId: Joi.number().required(),
                    roleIds: Joi.array().items(Joi.number()).min(1).required()
                });
                _a = schema.validate(__assign(__assign({}, req.params), req.body)), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                userId = value.userId, roleIds = value.roleIds;
                return [4 /*yield*/, user_model_1.User.findByPk(userId, { transaction: transaction })];
            case 3:
                user = _b.sent();
                if (!!user) return [3 /*break*/, 5];
                return [4 /*yield*/, transaction.rollback()];
            case 4:
                _b.sent();
                throw apiError_1.ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
            case 5: return [4 /*yield*/, user_role_model_1.UserRole.destroy({
                    where: {
                        userId: userId,
                        roleId: roleIds
                    },
                    transaction: transaction
                })];
            case 6:
                result = _b.sent();
                return [4 /*yield*/, transaction.commit()];
            case 7:
                _b.sent();
                apiResponse_1.ApiResponse.success(res, {
                    userId: userId,
                    removedCount: result
                }, '角色移除成功');
                return [3 /*break*/, 10];
            case 8:
                error_2 = _b.sent();
                return [4 /*yield*/, transaction.rollback()];
            case 9:
                _b.sent();
                if (error_2 instanceof apiError_1.ApiError) {
                    throw error_2;
                }
                throw apiError_1.ApiError.serverError('角色移除失败', 'ROLE_REMOVE_ERROR');
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.removeRolesFromUser = removeRolesFromUser;
/**
 * 获取用户的所有角色
 */
var getUserRoles = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var schema, _a, error, value, userId, user, userRoles, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                schema = Joi.object({
                    userId: Joi.number().required()
                });
                _a = schema.validate(req.params), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                userId = value.userId;
                return [4 /*yield*/, user_model_1.User.findByPk(userId)];
            case 1:
                user = _b.sent();
                if (!user) {
                    throw apiError_1.ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
                }
                return [4 /*yield*/, user_role_model_1.UserRole.findAll({
                        where: { userId: userId },
                        include: [
                            {
                                model: role_model_1.Role,
                                attributes: ['id', 'name', 'code', 'description', 'status']
                            },
                            {
                                model: user_model_1.User,
                                as: 'grantor',
                                attributes: ['id', 'username', 'realName'],
                                required: false
                            }
                        ]
                    })];
            case 2:
                userRoles = _b.sent();
                apiResponse_1.ApiResponse.success(res, {
                    userId: userId,
                    roles: userRoles.map(function (ur) { return (__assign(__assign({}, ur.get()), { role: ur.role })); })
                }, '获取用户角色成功');
                return [3 /*break*/, 4];
            case 3:
                error_3 = _b.sent();
                if (error_3 instanceof apiError_1.ApiError) {
                    throw error_3;
                }
                throw apiError_1.ApiError.serverError('获取用户角色失败', 'GET_USER_ROLES_ERROR');
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUserRoles = getUserRoles;
/**
 * 设置用户主要角色
 */
var setPrimaryRole = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transaction, schema, _a, error, value, userId, roleId, user, userRole, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, database_1.sequelize.transaction()];
            case 1:
                transaction = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 12, , 14]);
                schema = Joi.object({
                    userId: Joi.number().required(),
                    roleId: Joi.number().required()
                });
                _a = schema.validate(__assign(__assign({}, req.params), req.body)), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                userId = value.userId, roleId = value.roleId;
                return [4 /*yield*/, user_model_1.User.findByPk(userId, { transaction: transaction })];
            case 3:
                user = _b.sent();
                if (!!user) return [3 /*break*/, 5];
                return [4 /*yield*/, transaction.rollback()];
            case 4:
                _b.sent();
                throw apiError_1.ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
            case 5: return [4 /*yield*/, user_role_model_1.UserRole.findOne({
                    where: {
                        userId: userId,
                        roleId: roleId
                    },
                    transaction: transaction
                })];
            case 6:
                userRole = _b.sent();
                if (!!userRole) return [3 /*break*/, 8];
                return [4 /*yield*/, transaction.rollback()];
            case 7:
                _b.sent();
                throw apiError_1.ApiError.badRequest('用户未分配该角色', 'USER_ROLE_NOT_FOUND');
            case 8: 
            // 先将所有角色设为非主要
            return [4 /*yield*/, user_role_model_1.UserRole.update({ isPrimary: 0 }, {
                    where: { userId: userId },
                    transaction: transaction
                })];
            case 9:
                // 先将所有角色设为非主要
                _b.sent();
                // 设置主要角色
                return [4 /*yield*/, userRole.update({ isPrimary: 1 }, { transaction: transaction })];
            case 10:
                // 设置主要角色
                _b.sent();
                return [4 /*yield*/, transaction.commit()];
            case 11:
                _b.sent();
                apiResponse_1.ApiResponse.success(res, {
                    userId: userId,
                    roleId: roleId,
                    isPrimary: 1
                }, '设置主要角色成功');
                return [3 /*break*/, 14];
            case 12:
                error_4 = _b.sent();
                return [4 /*yield*/, transaction.rollback()];
            case 13:
                _b.sent();
                if (error_4 instanceof apiError_1.ApiError) {
                    throw error_4;
                }
                throw apiError_1.ApiError.serverError('设置主要角色失败', 'SET_PRIMARY_ROLE_ERROR');
            case 14: return [2 /*return*/];
        }
    });
}); };
exports.setPrimaryRole = setPrimaryRole;
/**
 * 更新用户角色的有效期
 */
var updateRoleValidity = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var transaction, schema, _a, error, value, userRoleId, startTime, endTime, userRole, error_5;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, database_1.sequelize.transaction()];
            case 1:
                transaction = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 8, , 10]);
                schema = Joi.object({
                    userRoleId: Joi.number().required(),
                    startTime: Joi.date().iso(),
                    endTime: Joi.date().iso().greater(Joi.ref('startTime'))
                });
                _a = schema.validate(__assign(__assign({}, req.params), req.body)), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                userRoleId = value.userRoleId, startTime = value.startTime, endTime = value.endTime;
                return [4 /*yield*/, user_role_model_1.UserRole.findByPk(userRoleId, { transaction: transaction })];
            case 3:
                userRole = _b.sent();
                if (!!userRole) return [3 /*break*/, 5];
                return [4 /*yield*/, transaction.rollback()];
            case 4:
                _b.sent();
                throw apiError_1.ApiError.notFound('用户角色记录不存在', 'USER_ROLE_NOT_FOUND');
            case 5: 
            // 更新有效期
            return [4 /*yield*/, userRole.update({
                    startTime: startTime ? new Date(startTime) : null,
                    endTime: endTime ? new Date(endTime) : null
                }, { transaction: transaction })];
            case 6:
                // 更新有效期
                _b.sent();
                return [4 /*yield*/, transaction.commit()];
            case 7:
                _b.sent();
                apiResponse_1.ApiResponse.success(res, userRole, '用户角色有效期更新成功');
                return [3 /*break*/, 10];
            case 8:
                error_5 = _b.sent();
                return [4 /*yield*/, transaction.rollback()];
            case 9:
                _b.sent();
                if (error_5 instanceof apiError_1.ApiError) {
                    throw error_5;
                }
                throw apiError_1.ApiError.serverError('更新有效期失败', 'UPDATE_VALIDITY_ERROR');
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.updateRoleValidity = updateRoleValidity;
/**
 * 获取用户的角色分配历史
 */
var getUserRoleHistory = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var schema, _a, error, value, userId, _b, page, _c, pageSize, user, _d, count, rows, error_6;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                schema = Joi.object({
                    userId: Joi.number().required(),
                    page: Joi.number().min(1),
                    pageSize: Joi.number().min(1).max(100)
                });
                _a = schema.validate(__assign(__assign({}, req.params), req.query)), error = _a.error, value = _a.value;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.details[0].message);
                }
                userId = value.userId, _b = value.page, page = _b === void 0 ? 1 : _b, _c = value.pageSize, pageSize = _c === void 0 ? 10 : _c;
                return [4 /*yield*/, user_model_1.User.findByPk(userId)];
            case 1:
                user = _e.sent();
                if (!user) {
                    throw apiError_1.ApiError.notFound('用户不存在', 'USER_NOT_FOUND');
                }
                return [4 /*yield*/, user_role_model_1.UserRole.findAndCountAll({
                        where: { userId: userId },
                        include: [
                            {
                                model: role_model_1.Role,
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
                    page: page,
                    pageSize: pageSize,
                    history: rows
                }, '获取用户角色历史成功');
                return [3 /*break*/, 4];
            case 3:
                error_6 = _e.sent();
                if (error_6 instanceof apiError_1.ApiError) {
                    throw error_6;
                }
                throw apiError_1.ApiError.serverError('获取用户角色历史失败', 'GET_USER_ROLE_HISTORY_ERROR');
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUserRoleHistory = getUserRoleHistory;
exports["default"] = {
    assignRolesToUser: exports.assignRolesToUser,
    removeRolesFromUser: exports.removeRolesFromUser,
    getUserRoles: exports.getUserRoles,
    setPrimaryRole: exports.setPrimaryRole,
    updateRoleValidity: exports.updateRoleValidity,
    getUserRoleHistory: exports.getUserRoleHistory
};
