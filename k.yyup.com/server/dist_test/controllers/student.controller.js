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
exports.StudentController = void 0;
var student_service_1 = require("../services/student/student.service");
var apiError_1 = require("../utils/apiError");
/**
 * 学生控制器
 * 负责处理与学生相关的HTTP请求，并将业务逻辑委托给StudentService。
 */
var StudentController = /** @class */ (function () {
    function StudentController() {
        var _this = this;
        this.studentService = new student_service_1.StudentService();
        /**
         * 创建新学生
         */
        this.create = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var createStudentDto, userId, student, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        createStudentDto = req.body;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('无法获取用户ID');
                        }
                        return [4 /*yield*/, this.studentService.createStudent(createStudentDto, userId)];
                    case 1:
                        student = _b.sent();
                        res.status(201).json(student);
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _b.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取学生列表（分页和过滤）
         */
        this.list = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.studentService.getStudents(req.query)];
                    case 1:
                        result = _a.sent();
                        res.status(200).json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 搜索学生
         */
        this.search = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.studentService.searchStudents(req.query)];
                    case 1:
                        result = _a.sent();
                        res.status(200).json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取可用学生列表（未分配班级的学生）
         */
        this.getAvailableStudents = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.studentService.getAvailableStudents(req.query)];
                    case 1:
                        result = _a.sent();
                        res.status(200).json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        next(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取学生详情
         */
        this.detail = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, studentId, student, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        studentId = parseInt(id, 10);
                        if (isNaN(studentId) || studentId <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的学生ID');
                        }
                        return [4 /*yield*/, this.studentService.getStudentById(studentId)];
                    case 1:
                        student = _a.sent();
                        res.status(200).json(student);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        next(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取学生的家长列表
         */
        this.getParents = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, studentId, parents, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        studentId = parseInt(id, 10);
                        if (isNaN(studentId) || studentId <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的学生ID');
                        }
                        return [4 /*yield*/, this.studentService.getStudentParents(studentId)];
                    case 1:
                        parents = _a.sent();
                        res.status(200).json(parents);
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        next(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 更新学生信息
         */
        this.update = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, updateStudentDto, studentId, userId, updatedStudent, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        updateStudentDto = req.body;
                        studentId = parseInt(id, 10);
                        if (isNaN(studentId) || studentId <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的学生ID');
                        }
                        // 验证请求体不为空
                        if (!req.body || Object.keys(req.body).length === 0) {
                            throw apiError_1.ApiError.badRequest('更新数据不能为空');
                        }
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('无法获取用户ID');
                        }
                        return [4 /*yield*/, this.studentService.updateStudent(studentId, updateStudentDto, userId)];
                    case 1:
                        updatedStudent = _b.sent();
                        res.status(200).json(updatedStudent);
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _b.sent();
                        next(error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 删除学生
         */
        this["delete"] = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, studentId, userId, error_8;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        studentId = parseInt(id, 10);
                        if (isNaN(studentId) || studentId <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的学生ID');
                        }
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('无法获取用户ID');
                        }
                        return [4 /*yield*/, this.studentService.deleteStudent(studentId, userId)];
                    case 1:
                        _b.sent();
                        res.status(204).send();
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        next(error_8);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 为单个学生分配班级
         */
        this.assignClass = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var assignClassDto, userId, result, error_9;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        assignClassDto = req.body;
                        // 验证请求体
                        if (!req.body || Object.keys(req.body).length === 0) {
                            throw apiError_1.ApiError.badRequest('分配班级数据不能为空');
                        }
                        // 验证必填字段
                        if (!assignClassDto.studentId || !assignClassDto.classId) {
                            throw apiError_1.ApiError.badRequest('学生ID和班级ID都是必填项');
                        }
                        // 验证ID格式
                        if (isNaN(Number(assignClassDto.studentId)) || Number(assignClassDto.studentId) <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的学生ID');
                        }
                        if (isNaN(Number(assignClassDto.classId)) || Number(assignClassDto.classId) <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的班级ID');
                        }
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('无法获取用户ID');
                        }
                        return [4 /*yield*/, this.studentService.assignStudentToClass(assignClassDto, userId)];
                    case 1:
                        result = _b.sent();
                        res.status(200).json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        next(error_9);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 批量为学生分配班级
         */
        this.batchAssignClass = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var batchAssignClassDto, _i, _a, studentId, uniqueStudentIds, userId, result, error_10;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        batchAssignClassDto = req.body;
                        // 验证请求体
                        if (!req.body || Object.keys(req.body).length === 0) {
                            throw apiError_1.ApiError.badRequest('批量分配班级数据不能为空');
                        }
                        // 验证必填字段
                        if (!batchAssignClassDto.studentIds || !batchAssignClassDto.classId) {
                            throw apiError_1.ApiError.badRequest('学生ID列表和班级ID都是必填项');
                        }
                        // 验证学生ID列表
                        if (!Array.isArray(batchAssignClassDto.studentIds) || batchAssignClassDto.studentIds.length === 0) {
                            throw apiError_1.ApiError.badRequest('学生ID列表必须是非空数组');
                        }
                        // 验证学生ID格式
                        for (_i = 0, _a = batchAssignClassDto.studentIds; _i < _a.length; _i++) {
                            studentId = _a[_i];
                            if (isNaN(Number(studentId)) || Number(studentId) <= 0) {
                                throw apiError_1.ApiError.badRequest("\u65E0\u6548\u7684\u5B66\u751FID: ".concat(studentId));
                            }
                        }
                        // 验证班级ID格式
                        if (isNaN(Number(batchAssignClassDto.classId)) || Number(batchAssignClassDto.classId) <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的班级ID');
                        }
                        uniqueStudentIds = __spreadArray([], new Set(batchAssignClassDto.studentIds), true);
                        if (uniqueStudentIds.length !== batchAssignClassDto.studentIds.length) {
                            throw apiError_1.ApiError.badRequest('学生ID列表中存在重复的ID');
                        }
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('无法获取用户ID');
                        }
                        return [4 /*yield*/, this.studentService.batchAssignStudentsToClass(batchAssignClassDto, userId)];
                    case 1:
                        result = _c.sent();
                        res.status(200).json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _c.sent();
                        next(error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 更新学生状态
         */
        this.updateStatus = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var updateStudentStatusDto, validStatuses, userId, result, error_11;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        updateStudentStatusDto = req.body;
                        // 验证请求体
                        if (!req.body || Object.keys(req.body).length === 0) {
                            throw apiError_1.ApiError.badRequest('更新状态数据不能为空');
                        }
                        // 验证必填字段
                        if (!updateStudentStatusDto.studentId || updateStudentStatusDto.status === undefined) {
                            throw apiError_1.ApiError.badRequest('学生ID和状态都是必填项');
                        }
                        // 验证学生ID格式
                        if (isNaN(Number(updateStudentStatusDto.studentId)) || Number(updateStudentStatusDto.studentId) <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的学生ID');
                        }
                        validStatuses = [0, 1, 2];
                        if (!validStatuses.includes(updateStudentStatusDto.status)) {
                            throw apiError_1.ApiError.badRequest('状态值只能是0(离园)、1(在读)或2(休学)');
                        }
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('无法获取用户ID');
                        }
                        return [4 /*yield*/, this.studentService.updateStudentStatus(updateStudentStatusDto, userId)];
                    case 1:
                        result = _b.sent();
                        res.status(200).json(result);
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _b.sent();
                        next(error_11);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取学生统计数据
         */
        this.getStats = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var stats, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.studentService.getStudentStats()];
                    case 1:
                        stats = _a.sent();
                        res.status(200).json(stats);
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _a.sent();
                        next(error_12);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 按班级获取学生列表
         */
        this.getStudentsByClass = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var _a, classId, _b, page, _c, pageSize, keyword, result, error_13;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        _a = req.query, classId = _a.classId, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, keyword = _a.keyword;
                        if (!classId) {
                            throw apiError_1.ApiError.badRequest('班级ID是必填项');
                        }
                        return [4 /*yield*/, this.studentService.getStudentsByClass({
                                classId: classId,
                                page: parseInt(page, 10),
                                pageSize: parseInt(pageSize, 10),
                                keyword: keyword
                            })];
                    case 1:
                        result = _d.sent();
                        res.status(200).json({
                            success: true,
                            message: '获取班级学生列表成功',
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _d.sent();
                        next(error_13);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 添加学生到班级
         */
        this.addToClass = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var studentData, userId, student, error_14;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        studentData = req.body;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('无法获取用户ID');
                        }
                        if (!studentData.classId) {
                            throw apiError_1.ApiError.badRequest('班级ID是必填项');
                        }
                        return [4 /*yield*/, this.studentService.addToClass(studentData, userId)];
                    case 1:
                        student = _b.sent();
                        res.status(201).json({
                            success: true,
                            message: '学生已添加到班级',
                            data: student
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _b.sent();
                        next(error_14);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 从班级移除学生
         */
        this.removeFromClass = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, classId, userId, studentId, result, error_15;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        classId = req.body.classId;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('无法获取用户ID');
                        }
                        studentId = parseInt(id, 10);
                        if (isNaN(studentId) || studentId <= 0) {
                            throw apiError_1.ApiError.badRequest('无效的学生ID');
                        }
                        if (!classId) {
                            throw apiError_1.ApiError.badRequest('班级ID是必填项');
                        }
                        return [4 /*yield*/, this.studentService.removeFromClass(studentId, classId, userId)];
                    case 1:
                        result = _b.sent();
                        res.status(200).json({
                            success: true,
                            message: '学生已从班级移除',
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_15 = _b.sent();
                        next(error_15);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    return StudentController;
}());
exports.StudentController = StudentController;
