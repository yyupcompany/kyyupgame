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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.UserService = void 0;
var sequelize_1 = require("sequelize");
var bcrypt_1 = __importDefault(require("bcrypt"));
var init_1 = require("../../init");
var user_model_1 = require("../../models/user.model");
var role_model_1 = require("../../models/role.model");
var user_role_model_1 = require("../../models/user-role.model");
/**
 * 用户管理服务实现
 * @description 实现用户管理相关的业务逻辑
 */
var UserService = /** @class */ (function () {
    function UserService() {
    }
    /**
     * 创建用户
     * @param data 用户创建数据
     * @returns 创建的用户实例
     */
    UserService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, existingUser, hashedPassword, user, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 9, , 11]);
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: (_a = {},
                                    _a[sequelize_1.Op.or] = [
                                        { username: data.username },
                                        { email: data.email }
                                    ],
                                    _a),
                                transaction: transaction
                            })];
                    case 3:
                        existingUser = _b.sent();
                        if (existingUser) {
                            throw new Error('用户名或邮箱已存在');
                        }
                        return [4 /*yield*/, bcrypt_1["default"].hash(data.password, 10)];
                    case 4:
                        hashedPassword = _b.sent();
                        return [4 /*yield*/, user_model_1.User.create({
                                username: data.username,
                                password: hashedPassword,
                                email: data.email,
                                realName: data.realName,
                                phone: data.phone || '',
                                status: data.status !== undefined ? data.status : user_model_1.UserStatus.ACTIVE
                            }, { transaction: transaction })];
                    case 5:
                        user = _b.sent();
                        if (!(data.roleIds && data.roleIds.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.assignRolesInternal(user.id, data.roleIds, {
                                primaryRoleId: data.roleIds[0],
                                transaction: transaction
                            })];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [4 /*yield*/, transaction.commit()];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, user];
                    case 9:
                        error_1 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 10:
                        _b.sent();
                        console.error('创建用户失败:', error_1);
                        throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID查找用户
     * @param id 用户ID
     * @returns 用户实例或null
     */
    UserService.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_model_1.User.findByPk(id)];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, user];
                    case 2:
                        error_2 = _a.sent();
                        console.error('查询用户失败:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询所有符合条件的用户
     * @param options 查询选项
     * @returns 用户数组
     */
    UserService.prototype.findAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var users, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_model_1.User.findAll(options)];
                    case 1:
                        users = _a.sent();
                        return [2 /*return*/, users];
                    case 2:
                        error_3 = _a.sent();
                        console.error('查询用户列表失败:', error_3);
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新用户信息
     * @param id 用户ID
     * @param data 更新数据
     * @returns 是否更新成功
     */
    UserService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, user, existingUser, updateData, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 11, , 13]);
                        return [4 /*yield*/, user_model_1.User.findByPk(id, { transaction: transaction })];
                    case 3:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('用户不存在');
                        }
                        if (!(data.email && data.email !== user.email)) return [3 /*break*/, 5];
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: { email: data.email },
                                transaction: transaction
                            })];
                    case 4:
                        existingUser = _a.sent();
                        if (existingUser) {
                            throw new Error('邮箱已存在');
                        }
                        _a.label = 5;
                    case 5:
                        updateData = {};
                        if (data.email)
                            updateData.email = data.email;
                        if (data.realName)
                            updateData.realName = data.realName;
                        if (data.phone !== undefined)
                            updateData.phone = data.phone;
                        if (data.status !== undefined)
                            updateData.status = data.status;
                        return [4 /*yield*/, user.update(updateData, { transaction: transaction })];
                    case 6:
                        _a.sent();
                        if (!data.roleIds) return [3 /*break*/, 9];
                        // 先删除原有角色
                        return [4 /*yield*/, user_role_model_1.UserRole.destroy({
                                where: { userId: id },
                                transaction: transaction
                            })];
                    case 7:
                        // 先删除原有角色
                        _a.sent();
                        if (!(data.roleIds.length > 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.assignRolesInternal(id, data.roleIds, {
                                primaryRoleId: data.roleIds[0],
                                transaction: transaction
                            })];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9: return [4 /*yield*/, transaction.commit()];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 11:
                        error_4 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 12:
                        _a.sent();
                        console.error('更新用户失败:', error_4);
                        throw error_4;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除用户
     * @param id 用户ID
     * @returns 是否删除成功
     */
    UserService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        // 删除用户角色关联
                        return [4 /*yield*/, user_role_model_1.UserRole.destroy({
                                where: { userId: id },
                                transaction: transaction
                            })];
                    case 3:
                        // 删除用户角色关联
                        _a.sent();
                        return [4 /*yield*/, user_model_1.User.destroy({
                                where: { id: id },
                                transaction: transaction
                            })];
                    case 4:
                        result = _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result > 0];
                    case 6:
                        error_5 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        console.error('删除用户失败:', error_5);
                        throw error_5;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据用户名查找用户
     * @param username 用户名
     * @returns 用户实例或null
     */
    UserService.prototype.findByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: { username: username }
                            })];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, user];
                    case 2:
                        error_6 = _a.sent();
                        console.error('根据用户名查询用户失败:', error_6);
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据邮箱查找用户
     * @param email 邮箱
     * @returns 用户实例或null
     */
    UserService.prototype.findByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var user, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_model_1.User.findOne({
                                where: { email: email }
                            })];
                    case 1:
                        user = _a.sent();
                        return [2 /*return*/, user];
                    case 2:
                        error_7 = _a.sent();
                        console.error('根据邮箱查询用户失败:', error_7);
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 分页查询用户
     * @param params 查询参数
     * @returns 分页结果
     */
    UserService.prototype.findByPage = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var keyword, status_1, roleId, startTime, endTime, _a, page, _b, pageSize, where, queryOptions, _c, count, rows, totalPages, error_8;
            var _d, _e, _f, _g, _h, _j, _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 2, , 3]);
                        keyword = params.keyword, status_1 = params.status, roleId = params.roleId, startTime = params.startTime, endTime = params.endTime, _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 10 : _b;
                        where = {};
                        // 关键字搜索
                        if (keyword) {
                            where[sequelize_1.Op.or] = [
                                { username: (_d = {}, _d[sequelize_1.Op.like] = "%".concat(keyword, "%"), _d) },
                                { email: (_e = {}, _e[sequelize_1.Op.like] = "%".concat(keyword, "%"), _e) },
                                { realName: (_f = {}, _f[sequelize_1.Op.like] = "%".concat(keyword, "%"), _f) },
                                { phone: (_g = {}, _g[sequelize_1.Op.like] = "%".concat(keyword, "%"), _g) }
                            ];
                        }
                        // 状态筛选
                        if (status_1 !== undefined) {
                            where.status = status_1;
                        }
                        // 时间范围筛选
                        if (startTime && endTime) {
                            where.createdAt = (_h = {},
                                _h[sequelize_1.Op.between] = [startTime, endTime],
                                _h);
                        }
                        else if (startTime) {
                            where.createdAt = (_j = {},
                                _j[sequelize_1.Op.gte] = startTime,
                                _j);
                        }
                        else if (endTime) {
                            where.createdAt = (_k = {},
                                _k[sequelize_1.Op.lte] = endTime,
                                _k);
                        }
                        queryOptions = {
                            where: where,
                            order: [['createdAt', 'DESC']],
                            limit: pageSize,
                            offset: (page - 1) * pageSize
                        };
                        // 如果有角色ID筛选，需要使用include
                        if (roleId) {
                            queryOptions.include = [
                                {
                                    model: role_model_1.Role,
                                    as: 'roles',
                                    through: {
                                        where: { roleId: roleId }
                                    }
                                }
                            ];
                        }
                        return [4 /*yield*/, user_model_1.User.findAndCountAll(queryOptions)];
                    case 1:
                        _c = _l.sent(), count = _c.count, rows = _c.rows;
                        totalPages = Math.ceil(count / pageSize);
                        return [2 /*return*/, {
                                items: rows,
                                total: count,
                                page: page,
                                pageSize: pageSize,
                                totalPages: totalPages
                            }];
                    case 2:
                        error_8 = _l.sent();
                        console.error('分页查询用户失败:', error_8);
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启用用户
     * @param id 用户ID
     * @returns 是否启用成功
     */
    UserService.prototype.enable = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_model_1.User.update({ status: user_model_1.UserStatus.ACTIVE }, { where: { id: id } })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0] > 0];
                }
            });
        });
    };
    /**
     * 禁用用户
     * @param id 用户ID
     * @returns 是否禁用成功
     */
    UserService.prototype.disable = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_model_1.User.update({ status: user_model_1.UserStatus.INACTIVE }, { where: { id: id } })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0] > 0];
                }
            });
        });
    };
    /**
     * 锁定用户
     * @param id 用户ID
     * @returns 是否锁定成功
     */
    UserService.prototype.lock = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_model_1.User.update({ status: user_model_1.UserStatus.LOCKED }, { where: { id: id } })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0] > 0];
                }
            });
        });
    };
    /**
     * 解锁用户
     * @param id 用户ID
     * @returns 是否解锁成功
     */
    UserService.prototype.unlock = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, user_model_1.User.update({ status: user_model_1.UserStatus.ACTIVE }, { where: { id: id } })];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0] > 0];
                }
            });
        });
    };
    /**
     * 分配角色给用户
     * @param userId 用户ID
     * @param roleIds 角色ID数组
     * @param options 选项，如是否设置为主要角色、授权人ID等
     * @returns 是否分配成功
     */
    UserService.prototype.assignRoles = function (userId, roleIds, options) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 7]);
                        return [4 /*yield*/, this.assignRolesInternal(userId, roleIds, __assign(__assign({}, options), { transaction: transaction }))];
                    case 3:
                        result = _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        error_9 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 6:
                        _a.sent();
                        console.error('分配角色失败:', error_9);
                        throw error_9;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 内部方法：分配角色给用户
     * @param userId 用户ID
     * @param roleIds 角色ID数组
     * @param options 选项，如是否设置为主要角色、授权人ID等
     * @returns 是否分配成功
     */
    UserService.prototype.assignRolesInternal = function (userId, roleIds, options) {
        return __awaiter(this, void 0, void 0, function () {
            var user, roles, userRoles;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, user_model_1.User.findByPk(userId, {
                            transaction: options === null || options === void 0 ? void 0 : options.transaction
                        })];
                    case 1:
                        user = _b.sent();
                        if (!user) {
                            throw new Error('用户不存在');
                        }
                        return [4 /*yield*/, role_model_1.Role.findAll({
                                where: {
                                    id: (_a = {}, _a[sequelize_1.Op["in"]] = roleIds, _a),
                                    status: 1
                                },
                                transaction: options === null || options === void 0 ? void 0 : options.transaction
                            })];
                    case 2:
                        roles = _b.sent();
                        if (roles.length !== roleIds.length) {
                            throw new Error('部分角色不存在或已被禁用');
                        }
                        userRoles = roleIds.map(function (roleId) { return ({
                            userId: userId,
                            roleId: roleId,
                            isPrimary: (options === null || options === void 0 ? void 0 : options.primaryRoleId) === roleId ? 1 : 0,
                            grantorId: (options === null || options === void 0 ? void 0 : options.grantorId) || null,
                            startTime: (options === null || options === void 0 ? void 0 : options.startTime) || new Date(),
                            endTime: (options === null || options === void 0 ? void 0 : options.endTime) || null
                        }); });
                        return [4 /*yield*/, user_role_model_1.UserRole.bulkCreate(userRoles, {
                                transaction: options === null || options === void 0 ? void 0 : options.transaction
                            })];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 移除用户的角色
     * @param userId 用户ID
     * @param roleIds 角色ID数组
     * @returns 是否移除成功
     */
    UserService.prototype.removeRoles = function (userId, roleIds) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_10;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_role_model_1.UserRole.destroy({
                                where: {
                                    userId: userId,
                                    roleId: (_a = {}, _a[sequelize_1.Op["in"]] = roleIds, _a)
                                }
                            })];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, result > 0];
                    case 2:
                        error_10 = _b.sent();
                        console.error('移除角色失败:', error_10);
                        throw error_10;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置用户主要角色
     * @param userId 用户ID
     * @param roleId 角色ID
     * @returns 是否设置成功
     */
    UserService.prototype.setPrimaryRole = function (userId, roleId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, user, userRole, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 10]);
                        return [4 /*yield*/, user_model_1.User.findByPk(userId, { transaction: transaction })];
                    case 3:
                        user = _a.sent();
                        if (!user) {
                            throw new Error('用户不存在');
                        }
                        return [4 /*yield*/, user_role_model_1.UserRole.findOne({
                                where: {
                                    userId: userId,
                                    roleId: roleId
                                },
                                transaction: transaction
                            })];
                    case 4:
                        userRole = _a.sent();
                        if (!userRole) {
                            throw new Error('角色不存在或未分配给用户');
                        }
                        // 将所有用户角色设置为非主要角色
                        return [4 /*yield*/, user_role_model_1.UserRole.update({ isPrimary: 0 }, {
                                where: { userId: userId },
                                transaction: transaction
                            })];
                    case 5:
                        // 将所有用户角色设置为非主要角色
                        _a.sent();
                        // 设置指定角色为主要角色
                        return [4 /*yield*/, userRole.update({ isPrimary: 1 }, { transaction: transaction })];
                    case 6:
                        // 设置指定角色为主要角色
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 7:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 8:
                        error_11 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 9:
                        _a.sent();
                        console.error('设置主要角色失败:', error_11);
                        throw error_11;
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取用户与角色关联信息
     * @param userId 用户ID
     * @returns 用户角色关联数组
     */
    UserService.prototype.getUserRoleRelations = function (userId) {
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
                                        as: 'role'
                                    }
                                ]
                            })];
                    case 1:
                        userRoles = _a.sent();
                        return [2 /*return*/, userRoles.map(function (ur) {
                                var role = ur.get('role');
                                return {
                                    id: ur.id,
                                    userId: ur.userId,
                                    roleId: ur.roleId,
                                    roleName: role ? role.name : '未知角色',
                                    roleCode: role ? role.code : 'unknown',
                                    isPrimary: ur.isPrimary === 1,
                                    startTime: ur.startTime,
                                    endTime: ur.endTime,
                                    grantorId: ur.grantorId,
                                    createdAt: ur.createdAt
                                };
                            })];
                    case 2:
                        error_12 = _a.sent();
                        console.error('获取用户角色关联信息失败:', error_12);
                        throw error_12;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return UserService;
}());
exports.UserService = UserService;
exports["default"] = new UserService();
