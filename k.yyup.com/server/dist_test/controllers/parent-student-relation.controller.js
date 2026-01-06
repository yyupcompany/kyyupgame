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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.ParentStudentRelationController = void 0;
var parent_student_relation_model_1 = require("../models/parent-student-relation.model");
var user_model_1 = require("../models/user.model");
var student_model_1 = require("../models/student.model");
/**
 * 亲子关系控制器
 * 管理家长与学生的关联关系
 */
var ParentStudentRelationController = /** @class */ (function () {
    function ParentStudentRelationController() {
        var _this = this;
        /**
         * 获取指定家长的所有学生
         * GET /api/parents/:id/students
         */
        this.getParentStudents = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var parentId, relations, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        parentId = Number(req.params.id);
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findAll({
                                where: { userId: parentId },
                                include: [
                                    {
                                        model: student_model_1.Student,
                                        as: 'student',
                                        attributes: ['id', 'name', 'gender', 'birthDate', 'studentNumber', 'enrollmentDate', 'status']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'user',
                                        attributes: ['id', 'username', 'realName', 'phone', 'email']
                                    }
                                ]
                            })];
                    case 1:
                        relations = _a.sent();
                        res.status(200).json({
                            success: true,
                            message: '获取家长学生列表成功',
                            data: relations
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 为指定家长添加学生关系
         * POST /api/parents/:id/students
         */
        this.addParentStudent = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var parentId, _a, studentId, relationship, isPrimaryContact, isLegalGuardian, otherData, existingRelation, relation, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        parentId = Number(req.params.id);
                        _a = req.body, studentId = _a.studentId, relationship = _a.relationship, isPrimaryContact = _a.isPrimaryContact, isLegalGuardian = _a.isLegalGuardian, otherData = __rest(_a, ["studentId", "relationship", "isPrimaryContact", "isLegalGuardian"]);
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findOne({
                                where: {
                                    userId: parentId,
                                    studentId: studentId
                                }
                            })];
                    case 1:
                        existingRelation = _b.sent();
                        if (existingRelation) {
                            res.status(400).json({
                                success: false,
                                message: '该家长与学生的关系已存在'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.create(__assign({ userId: parentId, studentId: studentId, relationship: relationship, isPrimaryContact: isPrimaryContact ? 1 : 0, isLegalGuardian: isLegalGuardian ? 1 : 0 }, otherData))];
                    case 2:
                        relation = _b.sent();
                        res.status(201).json({
                            success: true,
                            message: '添加家长学生关系成功',
                            data: relation
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _b.sent();
                        next(error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 删除指定家长的学生关系
         * DELETE /api/parents/:parentId/students/:studentId
         */
        this.removeParentStudent = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var parentId, studentId, relation, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        parentId = Number(req.params.parentId);
                        studentId = Number(req.params.studentId);
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findOne({
                                where: {
                                    userId: parentId,
                                    studentId: studentId
                                }
                            })];
                    case 1:
                        relation = _a.sent();
                        if (!relation) {
                            res.status(404).json({
                                success: false,
                                message: '未找到该家长与学生的关系'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, relation.destroy()];
                    case 2:
                        _a.sent();
                        res.status(200).json({
                            success: true,
                            message: '删除家长学生关系成功',
                            data: { parentId: parentId, studentId: studentId }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        next(error_3);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取所有亲子关系
         * GET /api/parent-student-relations
         */
        this.getAllRelations = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, parentId, studentId, offset, whereCondition, _d, count, rows, error_4;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, parentId = _a.parentId, studentId = _a.studentId;
                        offset = (Number(page) - 1) * Number(pageSize);
                        whereCondition = {};
                        if (parentId)
                            whereCondition.userId = parentId;
                        if (studentId)
                            whereCondition.studentId = studentId;
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findAndCountAll({
                                where: whereCondition,
                                limit: Number(pageSize),
                                offset: offset,
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        _d = _e.sent(), count = _d.count, rows = _d.rows;
                        res.status(200).json({
                            success: true,
                            message: '获取亲子关系列表成功',
                            data: {
                                list: rows,
                                pagination: {
                                    total: count,
                                    page: Number(page),
                                    pageSize: Number(pageSize),
                                    totalPages: Math.ceil(count / Number(pageSize))
                                }
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _e.sent();
                        next(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 更新亲子关系信息
         * PUT /api/parent-student-relations/:id
         */
        this.updateRelation = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var relationId, updateData, relation, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        relationId = Number(req.params.id);
                        updateData = req.body;
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findByPk(relationId)];
                    case 1:
                        relation = _a.sent();
                        if (!relation) {
                            res.status(404).json({
                                success: false,
                                message: '未找到该亲子关系'
                            });
                            return [2 /*return*/];
                        }
                        // 处理布尔值转换
                        if (updateData.isPrimaryContact !== undefined) {
                            updateData.isPrimaryContact = updateData.isPrimaryContact ? 1 : 0;
                        }
                        if (updateData.isLegalGuardian !== undefined) {
                            updateData.isLegalGuardian = updateData.isLegalGuardian ? 1 : 0;
                        }
                        return [4 /*yield*/, relation.update(updateData)];
                    case 2:
                        _a.sent();
                        res.status(200).json({
                            success: true,
                            message: '更新亲子关系成功',
                            data: relation
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        next(error_5);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取指定学生的所有家长
         * GET /api/students/:id/parents
         */
        this.getStudentParents = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var studentId, relations, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        studentId = Number(req.params.id);
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findAll({
                                where: { studentId: studentId },
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'user',
                                        attributes: ['id', 'username', 'realName', 'phone', 'email']
                                    },
                                    {
                                        model: student_model_1.Student,
                                        as: 'student',
                                        attributes: ['id', 'name', 'gender', 'birthDate', 'studentNumber']
                                    }
                                ]
                            })];
                    case 1:
                        relations = _a.sent();
                        res.status(200).json({
                            success: true,
                            message: '获取学生家长列表成功',
                            data: relations
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        next(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return ParentStudentRelationController;
}());
exports.ParentStudentRelationController = ParentStudentRelationController;
