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
exports.ParentService = void 0;
/**
 * 家长管理服务
 * 处理与家长相关的业务逻辑
 */
var init_1 = require("../../init");
var parent_model_1 = require("../../models/parent.model");
var user_model_1 = require("../../models/user.model");
var student_model_1 = require("../../models/student.model");
var class_model_1 = require("../../models/class.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
var ParentService = /** @class */ (function () {
    function ParentService() {
    }
    /**
     * 创建家长与学生的关联关系
     * @param data 关联数据
     * @returns 创建的家长关联记录
     */
    ParentService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                        var userId, studentId, isPrimaryContact, isLegalGuardian, user, student, existingRelation, parentData;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    userId = data.userId, studentId = data.studentId, isPrimaryContact = data.isPrimaryContact, isLegalGuardian = data.isLegalGuardian;
                                    if (!userId || !studentId) {
                                        throw apiError_1.ApiError.badRequest('用户ID和学生ID不能为空');
                                    }
                                    return [4 /*yield*/, user_model_1.User.findByPk(userId, { transaction: transaction })];
                                case 1:
                                    user = _a.sent();
                                    if (!user) {
                                        throw apiError_1.ApiError.badRequest('用户不存在', 'USER_NOT_FOUND');
                                    }
                                    return [4 /*yield*/, student_model_1.Student.findByPk(studentId, { transaction: transaction })];
                                case 2:
                                    student = _a.sent();
                                    if (!student) {
                                        throw apiError_1.ApiError.badRequest('学生不存在', 'STUDENT_NOT_FOUND');
                                    }
                                    return [4 /*yield*/, parent_model_1.Parent.findOne({ where: { userId: userId, studentId: studentId }, transaction: transaction })];
                                case 3:
                                    existingRelation = _a.sent();
                                    if (existingRelation) {
                                        throw apiError_1.ApiError.badRequest('该用户已与此学生建立家长关系', 'PARENT_RELATION_EXISTS');
                                    }
                                    if (!isPrimaryContact) return [3 /*break*/, 5];
                                    return [4 /*yield*/, parent_model_1.Parent.update({ isPrimaryContact: 0 }, { where: { studentId: studentId, isPrimaryContact: 1 }, transaction: transaction })];
                                case 4:
                                    _a.sent();
                                    _a.label = 5;
                                case 5:
                                    if (!isLegalGuardian) return [3 /*break*/, 7];
                                    return [4 /*yield*/, parent_model_1.Parent.update({ isLegalGuardian: 0 }, { where: { studentId: studentId, isLegalGuardian: 1 }, transaction: transaction })];
                                case 6:
                                    _a.sent();
                                    _a.label = 7;
                                case 7:
                                    parentData = {
                                        userId: userId,
                                        studentId: studentId,
                                        relationship: data.relationship || '未指定',
                                        isPrimaryContact: data.isPrimaryContact || 0,
                                        isLegalGuardian: data.isLegalGuardian || 0,
                                        idCardNo: data.idCardNo,
                                        workUnit: data.workUnit,
                                        occupation: data.occupation,
                                        education: data.education,
                                        address: data.address,
                                        remark: data.remark,
                                        creatorId: data.creatorId,
                                        updaterId: data.updaterId
                                    };
                                    return [2 /*return*/, parent_model_1.Parent.create(parentData, { transaction: transaction })];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取家长列表
     * @param filters 过滤参数
     * @returns 家长列表和分页信息
     */
    ParentService.prototype.list = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, keyword, studentId, userId, relationship, isPrimaryContact, isLegalGuardian, _c, sortBy, _d, sortOrder, where, keywordCondition;
            var _e, _f;
            return __generator(this, function (_g) {
                _a = filters.page, page = _a === void 0 ? 1 : _a, _b = filters.pageSize, pageSize = _b === void 0 ? 10 : _b, keyword = filters.keyword, studentId = filters.studentId, userId = filters.userId, relationship = filters.relationship, isPrimaryContact = filters.isPrimaryContact, isLegalGuardian = filters.isLegalGuardian, _c = filters.sortBy, sortBy = _c === void 0 ? 'createdAt' : _c, _d = filters.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                where = {};
                if (keyword) {
                    keywordCondition = (_e = {}, _e[sequelize_1.Op.like] = "%".concat(keyword, "%"), _e);
                    where[sequelize_1.Op.or] = [
                        { relationship: keywordCondition },
                        { '$user.realName$': keywordCondition },
                        { '$user.phone$': keywordCondition },
                        { '$Students.name$': keywordCondition }
                    ];
                }
                if (studentId)
                    where.studentId = studentId;
                if (userId)
                    where.userId = userId;
                if (relationship)
                    where.relationship = (_f = {}, _f[sequelize_1.Op.like] = "%".concat(relationship, "%"), _f);
                if (isPrimaryContact !== undefined)
                    where.isPrimaryContact = isPrimaryContact;
                if (isLegalGuardian !== undefined)
                    where.isLegalGuardian = isLegalGuardian;
                return [2 /*return*/, parent_model_1.Parent.findAndCountAll({
                        where: where,
                        include: [
                            { model: user_model_1.User, as: 'user', attributes: ['id', 'username', 'realName', 'phone', 'email'] },
                            { model: student_model_1.Student, as: 'Students', attributes: ['id', 'name', 'studentNo'] }
                        ],
                        offset: (page - 1) * pageSize,
                        limit: pageSize,
                        order: [[sortBy, sortOrder]],
                        distinct: true
                    })];
            });
        });
    };
    /**
     * 获取家长详情
     * @param id 家长关联ID
     * @returns 家长详情
     */
    ParentService.prototype.detail = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var parent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parent_model_1.Parent.findByPk(id, {
                            include: [
                                { model: user_model_1.User, as: 'user' },
                                {
                                    model: student_model_1.Student,
                                    as: 'Students',
                                    include: [{ model: class_model_1.Class, as: 'class' }]
                                }
                            ]
                        })];
                    case 1:
                        parent = _a.sent();
                        if (!parent) {
                            throw apiError_1.ApiError.notFound('家长关联不存在', 'PARENT_NOT_FOUND');
                        }
                        return [2 /*return*/, parent];
                }
            });
        });
    };
    /**
     * 更新家长信息
     * @param id 家长关联ID
     * @param data 更新的家长数据
     * @returns 更新后的家长记录
     */
    ParentService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                        var parent, isPrimaryContact, isLegalGuardian;
                        var _a, _b;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0: return [4 /*yield*/, parent_model_1.Parent.findByPk(id, { transaction: transaction })];
                                case 1:
                                    parent = _c.sent();
                                    if (!parent) {
                                        throw apiError_1.ApiError.notFound('家长关联不存在', 'PARENT_NOT_FOUND');
                                    }
                                    isPrimaryContact = data.isPrimaryContact, isLegalGuardian = data.isLegalGuardian;
                                    if (!isPrimaryContact) return [3 /*break*/, 3];
                                    return [4 /*yield*/, parent_model_1.Parent.update({ isPrimaryContact: 0 }, { where: { studentId: parent.studentId, id: (_a = {}, _a[sequelize_1.Op.ne] = id, _a) }, transaction: transaction })];
                                case 2:
                                    _c.sent();
                                    _c.label = 3;
                                case 3:
                                    if (!isLegalGuardian) return [3 /*break*/, 5];
                                    return [4 /*yield*/, parent_model_1.Parent.update({ isLegalGuardian: 0 }, { where: { studentId: parent.studentId, id: (_b = {}, _b[sequelize_1.Op.ne] = id, _b) }, transaction: transaction })];
                                case 4:
                                    _c.sent();
                                    _c.label = 5;
                                case 5: return [4 /*yield*/, parent.update(data, { transaction: transaction })];
                                case 6:
                                    _c.sent();
                                    return [2 /*return*/, parent];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 删除家长关联
     * @param id 家长关联ID
     */
    ParentService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var parent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, parent_model_1.Parent.findByPk(id)];
                    case 1:
                        parent = _a.sent();
                        if (!parent) {
                            throw apiError_1.ApiError.notFound('家长关联不存在', 'PARENT_NOT_FOUND');
                        }
                        return [4 /*yield*/, parent.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 批量为学生设置家长
     * @param studentId 学生ID
     * @param parentUserIds 家长用户ID列表
     */
    ParentService.prototype.batchSetStudentParents = function (studentId, parentUserIds) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                            var student, _i, parentUserIds_1, userId, user;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, parent_model_1.Parent.destroy({ where: { studentId: studentId }, transaction: transaction })];
                                    case 1:
                                        _a.sent();
                                        if (!(parentUserIds.length > 0)) return [3 /*break*/, 7];
                                        return [4 /*yield*/, student_model_1.Student.findByPk(studentId, { transaction: transaction })];
                                    case 2:
                                        student = _a.sent();
                                        if (!student)
                                            throw apiError_1.ApiError.notFound('学生不存在');
                                        _i = 0, parentUserIds_1 = parentUserIds;
                                        _a.label = 3;
                                    case 3:
                                        if (!(_i < parentUserIds_1.length)) return [3 /*break*/, 7];
                                        userId = parentUserIds_1[_i];
                                        return [4 /*yield*/, user_model_1.User.findByPk(userId, { transaction: transaction })];
                                    case 4:
                                        user = _a.sent();
                                        if (!user)
                                            throw apiError_1.ApiError.badRequest("\u7528\u6237ID ".concat(userId, " \u4E0D\u5B58\u5728"));
                                        return [4 /*yield*/, parent_model_1.Parent.create({
                                                studentId: studentId,
                                                userId: userId,
                                                relationship: '未指定',
                                                isPrimaryContact: 0,
                                                isLegalGuardian: 0
                                            }, { transaction: transaction })];
                                    case 5:
                                        _a.sent();
                                        _a.label = 6;
                                    case 6:
                                        _i++;
                                        return [3 /*break*/, 3];
                                    case 7: return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return ParentService;
}());
exports.ParentService = ParentService;
