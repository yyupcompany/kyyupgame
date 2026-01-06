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
exports.changePassword = exports.getUserProfile = exports.deleteUser = exports.updateUser = exports.getUserById = exports.getUsers = exports.createUser = void 0;
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
var password_1 = require("../utils/password");
// 检查用户是否有重要关联数据的辅助函数
var checkUserImportantData = function (db, userId, transaction) { return __awaiter(void 0, void 0, void 0, function () {
    var reasons, tableChecks, _i, tableChecks_1, check, results, count, error_1, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                reasons = [];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 8, , 9]);
                tableChecks = [
                    { table: 'activities', column: 'creator_id', reason: '创建的活动' },
                    { table: 'enrollment_consultations', column: 'consultant_id', reason: '咨询记录' },
                    { table: 'marketing_campaigns', column: 'creator_id', reason: '营销活动' },
                    { table: 'system_logs', column: 'user_id', reason: '系统日志' },
                    { table: 'operation_logs', column: 'user_id', reason: '操作日志' }
                ];
                _i = 0, tableChecks_1 = tableChecks;
                _a.label = 2;
            case 2:
                if (!(_i < tableChecks_1.length)) return [3 /*break*/, 7];
                check = tableChecks_1[_i];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 5, , 6]);
                return [4 /*yield*/, db.query("SELECT COUNT(*) as count FROM ".concat(check.table, " WHERE ").concat(check.column, " = :userId"), {
                        replacements: { userId: userId },
                        type: 'SELECT',
                        transaction: transaction
                    })];
            case 4:
                results = _a.sent();
                count = Array.isArray(results) && results.length > 0 ? results[0].count : 0;
                if (count > 0) {
                    reasons.push("".concat(check.reason, "(").concat(count, "\u6761)"));
                }
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                // 表可能不存在，继续检查其他表
                console.log("\u68C0\u67E5\u8868 ".concat(check.table, " \u65F6\u51FA\u9519\uFF08\u53EF\u80FD\u662F\u8868\u4E0D\u5B58\u5728\uFF09:"), error_1);
                return [3 /*break*/, 6];
            case 6:
                _i++;
                return [3 /*break*/, 2];
            case 7: return [3 /*break*/, 9];
            case 8:
                error_2 = _a.sent();
                console.error('检查用户重要数据时出错:', error_2);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/, {
                    hasData: reasons.length > 0,
                    reasons: reasons
                }];
        }
    });
}); };
// 添加sequelize实例检查函数
var getSequelizeInstance = function () {
    if (!init_1.sequelize) {
        throw new Error('Sequelize实例未初始化，请检查数据库连接');
    }
    return init_1.sequelize;
};
/**
 * 创建用户
 */
var createUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, userData, existingUsersResult, existingUsers, existingEmailsResult, existingEmails, hashedPassword, insertResult, userId, validRoleResults, validRoles, validRoleIds_1, invalidRoleIds, _i, _a, roleId, error_3, newUserResult, users, insertError_1, error_4, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                db = getSequelizeInstance();
                return [4 /*yield*/, db.transaction()];
            case 1:
                transaction = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 24, , 27]);
                userData = req.body;
                console.log('创建用户数据:', userData);
                return [4 /*yield*/, db.query("SELECT id FROM users WHERE username = :username", {
                        replacements: { username: userData.username },
                        type: 'SELECT',
                        transaction: transaction
                    })];
            case 3:
                existingUsersResult = _b.sent();
                existingUsers = Array.isArray(existingUsersResult) ? existingUsersResult : [];
                if (!(existingUsers && existingUsers.length > 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, transaction.rollback()];
            case 4:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户名已存在', 'USER_USERNAME_EXISTS', 400)];
            case 5: return [4 /*yield*/, db.query("SELECT id FROM users WHERE email = :email", {
                    replacements: { email: userData.email },
                    type: 'SELECT',
                    transaction: transaction
                })];
            case 6:
                existingEmailsResult = _b.sent();
                existingEmails = Array.isArray(existingEmailsResult) ? existingEmailsResult : [];
                if (!(existingEmails && existingEmails.length > 0)) return [3 /*break*/, 8];
                return [4 /*yield*/, transaction.rollback()];
            case 7:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '邮箱已存在', 'USER_EMAIL_EXISTS', 400)];
            case 8: return [4 /*yield*/, (0, password_1.hashPassword)(userData.password)];
            case 9:
                hashedPassword = _b.sent();
                _b.label = 10;
            case 10:
                _b.trys.push([10, 22, , 23]);
                return [4 /*yield*/, db.query("INSERT INTO users \n        (username, email, password, real_name, phone, status, created_at, updated_at) \n        VALUES \n        (:username, :email, :password, :realName, :phone, :status, NOW(), NOW())", {
                        replacements: {
                            username: userData.username,
                            email: userData.email,
                            password: hashedPassword,
                            realName: userData.realName || '',
                            phone: userData.phone || '',
                            status: userData.status || 1
                        },
                        type: 'INSERT',
                        transaction: transaction
                    })];
            case 11:
                insertResult = _b.sent();
                console.log('用户插入结果:', insertResult);
                userId = null;
                if (insertResult && Array.isArray(insertResult) && insertResult.length > 0) {
                    userId = Number(insertResult[0]);
                }
                if (!userId) {
                    throw new Error('创建用户失败，未获取到用户ID');
                }
                console.log('用户创建成功，ID:', userId);
                if (!(userData.roleIds && Array.isArray(userData.roleIds) && userData.roleIds.length > 0)) return [3 /*break*/, 19];
                _b.label = 12;
            case 12:
                _b.trys.push([12, 18, , 19]);
                return [4 /*yield*/, db.query("SELECT id FROM roles WHERE id IN (:roleIds)", {
                        replacements: { roleIds: userData.roleIds },
                        type: 'SELECT',
                        transaction: transaction
                    })];
            case 13:
                validRoleResults = _b.sent();
                validRoles = Array.isArray(validRoleResults) ? validRoleResults : [];
                validRoleIds_1 = validRoles.map(function (role) { return role.id; });
                if (validRoleIds_1.length !== userData.roleIds.length) {
                    invalidRoleIds = userData.roleIds.filter(function (id) { return !validRoleIds_1.includes(id); });
                    throw new Error("\u65E0\u6548\u7684\u89D2\u8272ID: ".concat(invalidRoleIds.join(', ')));
                }
                _i = 0, _a = userData.roleIds;
                _b.label = 14;
            case 14:
                if (!(_i < _a.length)) return [3 /*break*/, 17];
                roleId = _a[_i];
                return [4 /*yield*/, db.query("INSERT INTO user_roles (user_id, role_id, created_at, updated_at) \n               VALUES (:userId, :roleId, NOW(), NOW())", {
                        replacements: { userId: userId, roleId: roleId },
                        transaction: transaction
                    })];
            case 15:
                _b.sent();
                _b.label = 16;
            case 16:
                _i++;
                return [3 /*break*/, 14];
            case 17:
                console.log('用户角色关联成功');
                return [3 /*break*/, 19];
            case 18:
                error_3 = _b.sent();
                console.error('角色关联失败:', error_3);
                throw error_3;
            case 19: return [4 /*yield*/, transaction.commit()];
            case 20:
                _b.sent();
                console.log('事务提交成功');
                return [4 /*yield*/, db.query("SELECT id, username, email, real_name as realName, phone, status, created_at as createdAt, updated_at as updatedAt \n         FROM users WHERE id = :userId", {
                        replacements: { userId: userId },
                        type: 'SELECT'
                    })];
            case 21:
                newUserResult = _b.sent();
                users = Array.isArray(newUserResult) ? newUserResult : [];
                if (!users || users.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u521B\u5EFA\u7528\u6237\u6210\u529F\u4F46\u65E0\u6CD5\u67E5\u8BE2\u5230\u7528\u6237\u4FE1\u606F\uFF0CID: ".concat(userId), 'USER_QUERY_ERROR', 500)];
                }
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, users[0], '创建用户成功')];
            case 22:
                insertError_1 = _b.sent();
                console.error('插入用户时出错:', insertError_1);
                throw insertError_1;
            case 23: return [3 /*break*/, 27];
            case 24:
                error_4 = _b.sent();
                if (!transaction) return [3 /*break*/, 26];
                return [4 /*yield*/, transaction.rollback()["catch"](function (rollbackError) {
                        console.error('回滚事务失败:', rollbackError);
                    })];
            case 25:
                _b.sent();
                _b.label = 26;
            case 26:
                console.error('创建用户失败:', error_4);
                if (error_4 instanceof apiError_1.ApiError) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, error_4.message, error_4.code, error_4.statusCode)];
                }
                else {
                    errorMessage = error_4 instanceof Error ? error_4.message : '未知错误';
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u521B\u5EFA\u7528\u6237\u5931\u8D25: ".concat(errorMessage), 'USER_CREATE_ERROR', 500)];
                }
                return [3 /*break*/, 27];
            case 27: return [2 /*return*/];
        }
    });
}); };
exports.createUser = createUser;
/**
 * 获取用户列表
 */
var getUsers = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, page, pageSize, limit, offset, countResults, countResult, total, query, usersResults, usersList, userIds, rolesResults, rolesByUserId_1, roles, error_5, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('🔍 [DEBUG] getUsers函数开始执行');
                console.log('🔍 [DEBUG] 请求参数:', req.query);
                console.log('🔍 [DEBUG] 用户信息:', req.user);
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                db = getSequelizeInstance();
                page = req.query.page ? Number(req.query.page) : 1;
                pageSize = req.query.pageSize ? Number(req.query.pageSize) : 10;
                limit = Math.min(100, Math.max(1, pageSize));
                offset = (page - 1) * limit;
                return [4 /*yield*/, db.query("SELECT COUNT(*) as total FROM users", { type: 'SELECT' })];
            case 2:
                countResults = _a.sent();
                countResult = Array.isArray(countResults) && countResults.length > 0
                    ? countResults[0]
                    : { total: 0 };
                total = typeof countResult === 'object' && countResult !== null && 'total' in countResult
                    ? Number(countResult.total)
                    : 0;
                query = "\n      SELECT \n        id, username, email, real_name as realName, phone, status, \n        created_at as createdAt, updated_at as updatedAt\n      FROM users\n      ORDER BY created_at DESC\n      LIMIT ".concat(limit, " OFFSET ").concat(offset);
                console.log('执行简化SQL查询:', query);
                return [4 /*yield*/, db.query(query, {
                        type: 'SELECT'
                    })];
            case 3:
                usersResults = _a.sent();
                usersList = Array.isArray(usersResults) ? usersResults : [];
                console.log('用户列表查询结果:', {
                    isArray: Array.isArray(usersList),
                    length: usersList.length,
                    sampleUser: usersList.length > 0 ? JSON.stringify(usersList[0]) : 'none'
                });
                if (!(usersList.length > 0)) return [3 /*break*/, 5];
                userIds = usersList.map(function (user) { return user.id; });
                return [4 /*yield*/, db.query("SELECT ur.user_id as userId, r.id, r.name, r.code\n         FROM roles r\n         JOIN user_roles ur ON r.id = ur.role_id\n         WHERE ur.user_id IN (:userIds)", {
                        replacements: { userIds: userIds },
                        type: 'SELECT'
                    })];
            case 4:
                rolesResults = _a.sent();
                rolesByUserId_1 = {};
                roles = Array.isArray(rolesResults) ? rolesResults : [];
                if (roles.length > 0) {
                    roles.forEach(function (role) {
                        var roleObj = role;
                        var userId = roleObj.userId;
                        if (!rolesByUserId_1[userId]) {
                            rolesByUserId_1[userId] = [];
                        }
                        rolesByUserId_1[userId].push({
                            id: roleObj.id,
                            name: roleObj.name,
                            code: roleObj.code
                        });
                    });
                }
                // 为每个用户添加角色
                usersList.forEach(function (user) {
                    var userObj = user;
                    userObj.roles = rolesByUserId_1[userObj.id] || [];
                });
                _a.label = 5;
            case 5: 
            // 返回结果，保持原有的list字段格式
            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                    total: total,
                    page: page,
                    pageSize: limit,
                    items: usersList
                }, '获取用户列表成功')];
            case 6:
                error_5 = _a.sent();
                console.error('获取用户列表失败:', error_5);
                if (error_5 instanceof apiError_1.ApiError) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, error_5.message, error_5.code, error_5.statusCode)];
                }
                else {
                    errorMessage = error_5 instanceof Error ? error_5.message : '未知错误';
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u83B7\u53D6\u7528\u6237\u5217\u8868\u5931\u8D25: ".concat(errorMessage), 'USER_QUERY_ERROR', 500)];
                }
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getUsers = getUsers;
/**
 * 获取用户详情
 */
var getUserById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, userId, userResults, users, rolesResults, user, roles, error_6, errorMessage;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                db = getSequelizeInstance();
                userId = Number(req.params.id);
                if (isNaN(userId)) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400)];
                }
                return [4 /*yield*/, db.query("SELECT \n        u.id, u.username, u.email, u.real_name as realName, u.phone, u.status,\n        u.created_at as createdAt, u.updated_at as updatedAt\n       FROM users u\n       WHERE u.id = :userId", {
                        replacements: { userId: userId },
                        type: 'SELECT'
                    })];
            case 1:
                userResults = _a.sent();
                users = Array.isArray(userResults) ? userResults : [];
                if (!users || users.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户不存在', 'USER_NOT_FOUND', 404)];
                }
                return [4 /*yield*/, db.query("SELECT r.id, r.name, r.code\n       FROM roles r\n       JOIN user_roles ur ON r.id = ur.role_id\n       WHERE ur.user_id = :userId", {
                        replacements: { userId: userId },
                        type: 'SELECT'
                    })];
            case 2:
                rolesResults = _a.sent();
                user = users[0];
                roles = Array.isArray(rolesResults) ? rolesResults : [];
                user.roles = roles;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, user)];
            case 3:
                error_6 = _a.sent();
                console.error('获取用户详情失败:', error_6);
                if (error_6 instanceof apiError_1.ApiError) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, error_6.message, error_6.code, error_6.statusCode)];
                }
                else {
                    errorMessage = error_6 instanceof Error ? error_6.message : '未知错误';
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u83B7\u53D6\u7528\u6237\u8BE6\u60C5\u5931\u8D25: ".concat(errorMessage), 'USER_QUERY_ERROR', 500)];
                }
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.getUserById = getUserById;
/**
 * 更新用户信息
 */
var updateUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, userId, updateData, userResults, users, emailResults, existingUsers, emailResults, existingEmails, updateFields, updateValues, validRoleResults, validRoles, validRoleIds_2, invalidRoleIds, _i, _a, roleId, updatedUserResults, updatedUsers, rolesResults, updatedUser, roles, error_7, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                db = getSequelizeInstance();
                return [4 /*yield*/, db.transaction()];
            case 1:
                transaction = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 28, , 31]);
                userId = Number(req.params.id);
                updateData = req.body;
                if (!isNaN(userId)) return [3 /*break*/, 4];
                return [4 /*yield*/, transaction.rollback()];
            case 3:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400)];
            case 4: return [4 /*yield*/, db.query("SELECT id FROM users WHERE id = :userId", {
                    replacements: { userId: userId },
                    type: 'SELECT',
                    transaction: transaction
                })];
            case 5:
                userResults = _b.sent();
                users = Array.isArray(userResults) ? userResults : [];
                if (!(!users || users.length === 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, transaction.rollback()];
            case 6:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户不存在', 'USER_NOT_FOUND', 404)];
            case 7:
                if (!updateData.username) return [3 /*break*/, 10];
                return [4 /*yield*/, db.query("SELECT id FROM users WHERE username = :username AND id != :userId", {
                        replacements: { username: updateData.username, userId: userId },
                        type: 'SELECT',
                        transaction: transaction
                    })];
            case 8:
                emailResults = _b.sent();
                existingUsers = Array.isArray(emailResults) ? emailResults : [];
                if (!(existingUsers && existingUsers.length > 0)) return [3 /*break*/, 10];
                return [4 /*yield*/, transaction.rollback()];
            case 9:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户名已被其他用户使用', 'USER_USERNAME_EXISTS', 400)];
            case 10:
                if (!updateData.email) return [3 /*break*/, 13];
                return [4 /*yield*/, db.query("SELECT id FROM users WHERE email = :email AND id != :userId", {
                        replacements: { email: updateData.email, userId: userId },
                        type: 'SELECT',
                        transaction: transaction
                    })];
            case 11:
                emailResults = _b.sent();
                existingEmails = Array.isArray(emailResults) ? emailResults : [];
                if (!(existingEmails && existingEmails.length > 0)) return [3 /*break*/, 13];
                return [4 /*yield*/, transaction.rollback()];
            case 12:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '邮箱已被其他用户使用', 'USER_EMAIL_EXISTS', 400)];
            case 13:
                updateFields = [];
                updateValues = { userId: userId };
                if (updateData.username !== undefined) {
                    updateFields.push('username = :username');
                    updateValues.username = updateData.username;
                }
                if (updateData.email !== undefined) {
                    updateFields.push('email = :email');
                    updateValues.email = updateData.email;
                }
                if (updateData.realName !== undefined) {
                    updateFields.push('real_name = :realName');
                    updateValues.realName = updateData.realName;
                }
                if (updateData.phone !== undefined) {
                    updateFields.push('phone = :phone');
                    updateValues.phone = updateData.phone;
                }
                if (updateData.status !== undefined) {
                    updateFields.push('status = :status');
                    updateValues.status = updateData.status;
                }
                // 添加更新时间
                updateFields.push('updated_at = NOW()');
                if (!(updateFields.length === 1)) return [3 /*break*/, 15];
                return [4 /*yield*/, transaction.rollback()];
            case 14:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '没有需要更新的字段', 'NO_UPDATE_FIELDS', 400)];
            case 15: 
            // 更新用户信息
            return [4 /*yield*/, db.query("UPDATE users SET ".concat(updateFields.join(', '), " WHERE id = :userId"), {
                    replacements: updateValues,
                    transaction: transaction
                })];
            case 16:
                // 更新用户信息
                _b.sent();
                if (!(updateData.roleIds && Array.isArray(updateData.roleIds))) return [3 /*break*/, 24];
                if (!(updateData.roleIds.length > 0)) return [3 /*break*/, 19];
                return [4 /*yield*/, db.query("SELECT id FROM roles WHERE id IN (:roleIds)", {
                        replacements: { roleIds: updateData.roleIds },
                        type: 'SELECT',
                        transaction: transaction
                    })];
            case 17:
                validRoleResults = _b.sent();
                validRoles = Array.isArray(validRoleResults) ? validRoleResults : [];
                validRoleIds_2 = validRoles.map(function (role) { return role.id; });
                if (!(validRoleIds_2.length !== updateData.roleIds.length)) return [3 /*break*/, 19];
                invalidRoleIds = updateData.roleIds.filter(function (id) { return !validRoleIds_2.includes(id); });
                return [4 /*yield*/, transaction.rollback()];
            case 18:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u65E0\u6548\u7684\u89D2\u8272ID: ".concat(invalidRoleIds.join(', ')), 'INVALID_ROLE_IDS', 400)];
            case 19: 
            // 删除现有角色关联
            return [4 /*yield*/, db.query("DELETE FROM user_roles WHERE user_id = :userId", {
                    replacements: { userId: userId },
                    transaction: transaction
                })];
            case 20:
                // 删除现有角色关联
                _b.sent();
                if (!(updateData.roleIds.length > 0)) return [3 /*break*/, 24];
                _i = 0, _a = updateData.roleIds;
                _b.label = 21;
            case 21:
                if (!(_i < _a.length)) return [3 /*break*/, 24];
                roleId = _a[_i];
                return [4 /*yield*/, db.query("INSERT INTO user_roles (user_id, role_id, created_at, updated_at) \n             VALUES (:userId, :roleId, NOW(), NOW())", {
                        replacements: { userId: userId, roleId: roleId },
                        transaction: transaction
                    })];
            case 22:
                _b.sent();
                _b.label = 23;
            case 23:
                _i++;
                return [3 /*break*/, 21];
            case 24: return [4 /*yield*/, transaction.commit()];
            case 25:
                _b.sent();
                return [4 /*yield*/, db.query("SELECT id, username, email, real_name as realName, phone, status, created_at as createdAt, updated_at as updatedAt \n       FROM users WHERE id = :userId", {
                        replacements: { userId: userId },
                        type: 'SELECT'
                    })];
            case 26:
                updatedUserResults = _b.sent();
                updatedUsers = Array.isArray(updatedUserResults) ? updatedUserResults : [];
                if (!updatedUsers || updatedUsers.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '更新用户成功但无法查询到用户信息', 'USER_QUERY_ERROR', 500)];
                }
                return [4 /*yield*/, db.query("SELECT r.id, r.name, r.code\n       FROM roles r\n       JOIN user_roles ur ON r.id = ur.role_id\n       WHERE ur.user_id = :userId", {
                        replacements: { userId: userId },
                        type: 'SELECT'
                    })];
            case 27:
                rolesResults = _b.sent();
                updatedUser = updatedUsers[0];
                roles = Array.isArray(rolesResults) ? rolesResults : [];
                updatedUser.roles = roles;
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, updatedUser, '更新用户成功')];
            case 28:
                error_7 = _b.sent();
                if (!transaction) return [3 /*break*/, 30];
                return [4 /*yield*/, transaction.rollback()["catch"](function (rollbackError) {
                        console.error('回滚事务失败:', rollbackError);
                    })];
            case 29:
                _b.sent();
                _b.label = 30;
            case 30:
                console.error('更新用户失败:', error_7);
                if (error_7 instanceof apiError_1.ApiError) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, error_7.message, error_7.code, error_7.statusCode)];
                }
                else {
                    errorMessage = error_7 instanceof Error ? error_7.message : '未知错误';
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u66F4\u65B0\u7528\u6237\u5931\u8D25: ".concat(errorMessage), 'USER_UPDATE_ERROR', 500)];
                }
                return [3 /*break*/, 31];
            case 31: return [2 /*return*/];
        }
    });
}); };
exports.updateUser = updateUser;
/**
 * 删除用户
 */
var deleteUser = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, userId, userResults, users, user, currentUserId, hasImportantData, error_8, error_9, error_10, errorMessage;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                db = getSequelizeInstance();
                return [4 /*yield*/, db.transaction()];
            case 1:
                transaction = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 25, , 28]);
                userId = Number(req.params.id);
                if (!isNaN(userId)) return [3 /*break*/, 4];
                return [4 /*yield*/, transaction.rollback()];
            case 3:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400)];
            case 4: return [4 /*yield*/, db.query("SELECT id, username FROM users WHERE id = :userId", {
                    replacements: { userId: userId },
                    type: 'SELECT',
                    transaction: transaction
                })];
            case 5:
                userResults = _b.sent();
                users = Array.isArray(userResults) ? userResults : [];
                if (!(!users || users.length === 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, transaction.rollback()];
            case 6:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '用户不存在或已删除')];
            case 7:
                user = users[0];
                if (!(user.username === 'admin')) return [3 /*break*/, 9];
                return [4 /*yield*/, transaction.rollback()];
            case 8:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '不能删除系统管理员账户', 'CANNOT_DELETE_ADMIN', 403)];
            case 9:
                currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!(currentUserId && currentUserId === userId)) return [3 /*break*/, 11];
                return [4 /*yield*/, transaction.rollback()];
            case 10:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '不能删除自己的账户', 'CANNOT_DELETE_SELF', 403)];
            case 11: return [4 /*yield*/, checkUserImportantData(db, userId, transaction)];
            case 12:
                hasImportantData = _b.sent();
                if (!hasImportantData.hasData) return [3 /*break*/, 14];
                return [4 /*yield*/, transaction.rollback()];
            case 13:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u7528\u6237\u5B58\u5728\u91CD\u8981\u5173\u8054\u6570\u636E\uFF0C\u65E0\u6CD5\u5220\u9664: ".concat(hasImportantData.reasons.join(', ')), 'USER_HAS_IMPORTANT_DATA', 400)];
            case 14: 
            // 删除所有相关的外键引用（按依赖顺序）
            // 1. 删除用户角色关联
            return [4 /*yield*/, db.query("DELETE FROM user_roles WHERE user_id = :userId", {
                    replacements: { userId: userId },
                    transaction: transaction
                })];
            case 15:
                // 删除所有相关的外键引用（按依赖顺序）
                // 1. 删除用户角色关联
                _b.sent();
                _b.label = 16;
            case 16:
                _b.trys.push([16, 18, , 19]);
                return [4 /*yield*/, db.query("DELETE FROM user_profiles WHERE user_id = :userId", {
                        replacements: { userId: userId },
                        transaction: transaction
                    })];
            case 17:
                _b.sent();
                return [3 /*break*/, 19];
            case 18:
                error_8 = _b.sent();
                // user_profiles表可能不存在，忽略错误
                console.log('删除用户配置文件时出错（可能是表不存在）:', error_8);
                return [3 /*break*/, 19];
            case 19:
                _b.trys.push([19, 21, , 22]);
                return [4 /*yield*/, db.query("DELETE FROM ai_user_permissions WHERE user_id = :userId", {
                        replacements: { userId: userId },
                        transaction: transaction
                    })];
            case 20:
                _b.sent();
                return [3 /*break*/, 22];
            case 21:
                error_9 = _b.sent();
                // 表可能不存在，忽略错误
                console.log('删除AI用户权限时出错（可能是表不存在）:', error_9);
                return [3 /*break*/, 22];
            case 22: 
            // 4. 最后删除用户
            return [4 /*yield*/, db.query("DELETE FROM users WHERE id = :userId", {
                    replacements: { userId: userId },
                    transaction: transaction
                })];
            case 23:
                // 4. 最后删除用户
                _b.sent();
                return [4 /*yield*/, transaction.commit()];
            case 24:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '删除用户成功')];
            case 25:
                error_10 = _b.sent();
                if (!transaction) return [3 /*break*/, 27];
                return [4 /*yield*/, transaction.rollback()["catch"](function (rollbackError) {
                        console.error('回滚事务失败:', rollbackError);
                    })];
            case 26:
                _b.sent();
                _b.label = 27;
            case 27:
                console.error('删除用户失败:', error_10);
                if (error_10 instanceof apiError_1.ApiError) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, error_10.message, error_10.code, error_10.statusCode)];
                }
                else {
                    errorMessage = error_10 instanceof Error ? error_10.message : '未知错误';
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u5220\u9664\u7528\u6237\u5931\u8D25: ".concat(errorMessage), 'USER_DELETE_ERROR', 500)];
                }
                return [3 /*break*/, 28];
            case 28: return [2 /*return*/];
        }
    });
}); };
exports.deleteUser = deleteUser;
/**
 * 修改密码
 */
/**
 * 获取用户资料
 */
var getUserProfile = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, db, userResults, users, user, roleResults, roles, primaryRole, kindergartenId, kindergartenResults, kindergartens, profileData, error_11, errorMessage;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400)];
                }
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT id, username, email, real_name as realName, phone, status, created_at as createdAt, updated_at as updatedAt \n       FROM users WHERE id = :userId AND status = 'active'", {
                        replacements: { userId: userId },
                        type: 'SELECT'
                    })];
            case 1:
                userResults = _b.sent();
                users = Array.isArray(userResults) ? userResults : [];
                if (!users || users.length === 0) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户不存在', 'USER_NOT_FOUND', 404)];
                }
                user = users[0];
                return [4 /*yield*/, db.query("SELECT r.code as roleCode, r.name as roleName\n       FROM user_roles ur\n       INNER JOIN roles r ON ur.role_id = r.id\n       WHERE ur.user_id = :userId\n       ORDER BY \n         CASE \n           WHEN r.code = 'super_admin' THEN 1\n           WHEN r.code = 'admin' THEN 2\n           ELSE 3\n         END\n       LIMIT 1", {
                        replacements: { userId: userId },
                        type: 'SELECT'
                    })];
            case 2:
                roleResults = _b.sent();
                roles = Array.isArray(roleResults) ? roleResults : [];
                primaryRole = roles.length > 0 ? roles[0] : null;
                kindergartenId = null;
                if (!(primaryRole && ['admin', 'super_admin'].includes(primaryRole.roleCode))) return [3 /*break*/, 4];
                return [4 /*yield*/, db.query("SELECT id FROM kindergartens ORDER BY id LIMIT 1", { type: 'SELECT' })];
            case 3:
                kindergartenResults = _b.sent();
                kindergartens = Array.isArray(kindergartenResults) ? kindergartenResults : [];
                if (kindergartens.length > 0) {
                    kindergartenId = kindergartens[0].id;
                }
                _b.label = 4;
            case 4:
                profileData = __assign(__assign({}, user), { role: (primaryRole === null || primaryRole === void 0 ? void 0 : primaryRole.roleCode) || 'user', roleName: (primaryRole === null || primaryRole === void 0 ? void 0 : primaryRole.roleName) || '普通用户', isAdmin: primaryRole ? ['admin', 'super_admin'].includes(primaryRole.roleCode) : false, kindergartenId: kindergartenId });
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, profileData, '获取用户资料成功')];
            case 5:
                error_11 = _b.sent();
                console.error('获取用户资料失败:', error_11);
                errorMessage = error_11 instanceof Error ? error_11.message : '未知错误';
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u83B7\u53D6\u7528\u6237\u8D44\u6599\u5931\u8D25: ".concat(errorMessage), 'USER_PROFILE_ERROR', 500)];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getUserProfile = getUserProfile;
var changePassword = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var db, transaction, userId, _a, oldPassword, newPassword, userResults, users, user, isOldPasswordValid, currentUser, isAdmin, hashedNewPassword, error_12, errorMessage;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                db = getSequelizeInstance();
                return [4 /*yield*/, db.transaction()];
            case 1:
                transaction = _b.sent();
                _b.label = 2;
            case 2:
                _b.trys.push([2, 17, , 20]);
                userId = Number(req.params.id);
                _a = req.body, oldPassword = _a.oldPassword, newPassword = _a.newPassword;
                if (!isNaN(userId)) return [3 /*break*/, 4];
                return [4 /*yield*/, transaction.rollback()];
            case 3:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '无效的用户ID', 'USER_INVALID_ID', 400)];
            case 4: return [4 /*yield*/, db.query("SELECT id, password FROM users WHERE id = :userId", {
                    replacements: { userId: userId },
                    type: 'SELECT',
                    transaction: transaction
                })];
            case 5:
                userResults = _b.sent();
                users = Array.isArray(userResults) ? userResults : [];
                if (!(!users || users.length === 0)) return [3 /*break*/, 7];
                return [4 /*yield*/, transaction.rollback()];
            case 6:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '用户不存在', 'USER_NOT_FOUND', 404)];
            case 7:
                user = users[0];
                if (!oldPassword) return [3 /*break*/, 11];
                return [4 /*yield*/, (0, password_1.verifyPassword)(oldPassword, user.password)];
            case 8:
                isOldPasswordValid = _b.sent();
                if (!!isOldPasswordValid) return [3 /*break*/, 10];
                return [4 /*yield*/, transaction.rollback()];
            case 9:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '旧密码不正确', 'OLD_PASSWORD_INCORRECT', 400)];
            case 10: return [3 /*break*/, 13];
            case 11:
                currentUser = req.user;
                isAdmin = (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'admin' || (currentUser === null || currentUser === void 0 ? void 0 : currentUser.role) === 'super_admin';
                if (!!isAdmin) return [3 /*break*/, 13];
                return [4 /*yield*/, transaction.rollback()];
            case 12:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '修改密码需要提供旧密码', 'OLD_PASSWORD_REQUIRED', 400)];
            case 13: return [4 /*yield*/, (0, password_1.hashPassword)(newPassword)];
            case 14:
                hashedNewPassword = _b.sent();
                // 更新密码
                return [4 /*yield*/, db.query("UPDATE users SET password = :password, updated_at = NOW() WHERE id = :userId", {
                        replacements: { password: hashedNewPassword, userId: userId },
                        transaction: transaction
                    })];
            case 15:
                // 更新密码
                _b.sent();
                return [4 /*yield*/, transaction.commit()];
            case 16:
                _b.sent();
                return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '修改密码成功')];
            case 17:
                error_12 = _b.sent();
                if (!transaction) return [3 /*break*/, 19];
                return [4 /*yield*/, transaction.rollback()["catch"](function (rollbackError) {
                        console.error('回滚事务失败:', rollbackError);
                    })];
            case 18:
                _b.sent();
                _b.label = 19;
            case 19:
                console.error('修改密码失败:', error_12);
                if (error_12 instanceof apiError_1.ApiError) {
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, error_12.message, error_12.code, error_12.statusCode)];
                }
                else {
                    errorMessage = error_12 instanceof Error ? error_12.message : '未知错误';
                    return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u4FEE\u6539\u5BC6\u7801\u5931\u8D25: ".concat(errorMessage), 'PASSWORD_CHANGE_ERROR', 500)];
                }
                return [3 /*break*/, 20];
            case 20: return [2 /*return*/];
        }
    });
}); };
exports.changePassword = changePassword;
// 导出默认对象，方便导入
exports["default"] = {
    createUser: exports.createUser,
    getUsers: exports.getUsers,
    getUserById: exports.getUserById,
    getUserProfile: exports.getUserProfile,
    updateUser: exports.updateUser,
    deleteUser: exports.deleteUser,
    changePassword: exports.changePassword
};
