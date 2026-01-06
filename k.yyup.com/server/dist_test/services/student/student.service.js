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
exports.StudentService = void 0;
/**
 * 学生管理服务
 * 处理与学生相关的业务逻辑
 */
var student_model_1 = require("../../models/student.model");
var kindergarten_model_1 = require("../../models/kindergarten.model");
var class_model_1 = require("../../models/class.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var search_helper_1 = require("../../utils/search-helper");
var student_validation_1 = require("../../validations/student.validation");
var StudentService = /** @class */ (function () {
    function StudentService() {
    }
    /**
     * 创建新学生
     */
    StudentService.prototype.createStudent = function (dto, creatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            var _this = this;
            return __generator(this, function (_a) {
                error = student_validation_1.createStudentSchema.validate(dto).error;
                if (error) {
                    throw apiError_1.ApiError.badRequest(error.message);
                }
                return [2 /*return*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                        var existingStudent, kindergarten, classExists, studentData, student;
                        var _a;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, student_model_1.Student.findOne({
                                        where: { studentNo: dto.studentNo },
                                        transaction: transaction
                                    })];
                                case 1:
                                    existingStudent = _b.sent();
                                    if (existingStudent) {
                                        throw apiError_1.ApiError.badRequest('学号已存在');
                                    }
                                    return [4 /*yield*/, kindergarten_model_1.Kindergarten.findByPk(dto.kindergartenId, {
                                            transaction: transaction
                                        })];
                                case 2:
                                    kindergarten = _b.sent();
                                    if (!kindergarten) {
                                        throw apiError_1.ApiError.notFound('指定的幼儿园不存在');
                                    }
                                    if (!dto.classId) return [3 /*break*/, 4];
                                    return [4 /*yield*/, class_model_1.Class.findByPk(dto.classId, { transaction: transaction })];
                                case 3:
                                    classExists = _b.sent();
                                    if (!classExists) {
                                        throw apiError_1.ApiError.notFound('指定的班级不存在');
                                    }
                                    _b.label = 4;
                                case 4:
                                    studentData = __assign(__assign({}, dto), { status: (_a = dto.status) !== null && _a !== void 0 ? _a : 1, birthDate: dto.birthDate ? new Date(dto.birthDate) : new Date(), enrollmentDate: dto.enrollmentDate ? new Date(dto.enrollmentDate) : new Date(), interests: (Array.isArray(dto.interests) ? dto.interests.join(',') : dto.interests) || null, tags: (Array.isArray(dto.tags) ? dto.tags.join(',') : dto.tags) || null, creatorId: creatorId, updaterId: creatorId });
                                    return [4 /*yield*/, student_model_1.Student.create(studentData, { transaction: transaction })];
                                case 5:
                                    student = _b.sent();
                                    return [2 /*return*/, this.getStudentById(student.id, transaction)];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 获取学生列表（分页和过滤）
     */
    StudentService.prototype.getStudents = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var sequelize, searchParams, searchConfig, queryResult, countQuery, dataQuery, _a, countResult, dataResult, countList, count, dataList, rows;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sequelize = student_model_1.Student.sequelize;
                        if (!sequelize) {
                            throw apiError_1.ApiError.serverError('数据库连接不可用');
                        }
                        searchParams = {
                            keyword: filters.keyword,
                            page: filters.page ? Number(filters.page) : 1,
                            pageSize: filters.pageSize ? Number(filters.pageSize) : 10,
                            sortBy: filters.sortBy || 'created_at',
                            sortOrder: filters.sortOrder || 'DESC',
                            status: filters.status,
                            grade: filters.grade,
                            classId: filters.classId ? Number(filters.classId) : undefined,
                            kindergartenId: filters.kindergartenId ? Number(filters.kindergartenId) : undefined,
                            gender: filters.gender,
                            ageStart: filters.ageStart,
                            ageEnd: filters.ageEnd,
                            enrollmentDateStart: filters.enrollmentDateStart,
                            enrollmentDateEnd: filters.enrollmentDateEnd,
                            tags: filters.tags
                        };
                        searchConfig = search_helper_1.SearchHelper.configs.student;
                        queryResult = search_helper_1.SearchHelper.buildSearchQuery(searchParams, searchConfig, 's');
                        countQuery = "\n      SELECT COUNT(*) as total\n      FROM students s\n      LEFT JOIN users p ON s.id = p.id  \n      WHERE ".concat(queryResult.whereClause, "\n    ");
                        dataQuery = "\n      SELECT \n        s.*,\n        k.id as kindergarten_id,\n        k.name as kindergarten_name,\n        c.id as class_id,\n        c.name as class_name\n      FROM students s\n      LEFT JOIN kindergartens k ON s.kindergarten_id = k.id\n      LEFT JOIN classes c ON s.class_id = c.id\n      LEFT JOIN users p ON s.id = p.id\n      WHERE ".concat(queryResult.whereClause, "\n      ").concat(queryResult.orderBy, "\n      LIMIT ").concat(queryResult.limit, " OFFSET ").concat(queryResult.offset, "\n    ");
                        return [4 /*yield*/, Promise.all([
                                sequelize.query(countQuery, {
                                    replacements: queryResult.replacements,
                                    type: 'SELECT'
                                }),
                                sequelize.query(dataQuery, {
                                    replacements: queryResult.replacements,
                                    type: 'SELECT'
                                })
                            ])];
                    case 1:
                        _a = _b.sent(), countResult = _a[0], dataResult = _a[1];
                        countList = Array.isArray(countResult) ? countResult : [];
                        count = countList.length > 0 ? countList[0].total : 0;
                        dataList = Array.isArray(dataResult) ? dataResult : [];
                        rows = dataList.map(function (item) { return (__assign(__assign({}, item), { kindergarten: item.kindergarten_id ? {
                                id: item.kindergarten_id,
                                name: item.kindergarten_name
                            } : null, "class": item.class_id ? {
                                id: item.class_id,
                                name: item.class_name
                            } : null })); });
                        return [2 /*return*/, { rows: rows, count: Number(count) }];
                }
            });
        });
    };
    /**
     * 搜索学生
     */
    StudentService.prototype.searchStudents = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var searchFilters;
            return __generator(this, function (_a) {
                searchFilters = __assign(__assign({}, filters), { status: 1 // 只搜索正常状态的学生
                 });
                return [2 /*return*/, this.getStudents(searchFilters)];
            });
        });
    };
    /**
     * 获取可用学生列表（未分配班级的学生）
     */
    StudentService.prototype.getAvailableStudents = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var availableFilters;
            return __generator(this, function (_a) {
                availableFilters = __assign(__assign({}, filters), { status: 1, classId: null // 未分配班级的学生
                 });
                return [2 /*return*/, this.getStudents(availableFilters)];
            });
        });
    };
    /**
     * 获取学生详情
     */
    StudentService.prototype.getStudentById = function (id, transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var sequelize, query, results, resultList, studentData, student;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sequelize = student_model_1.Student.sequelize;
                        if (!sequelize) {
                            throw apiError_1.ApiError.serverError('数据库连接不可用');
                        }
                        query = "\n      SELECT \n        s.*,\n        k.id as kindergarten_id,\n        k.name as kindergarten_name,\n        c.id as class_id,\n        c.name as class_name\n      FROM students s\n      LEFT JOIN kindergartens k ON s.kindergarten_id = k.id\n      LEFT JOIN classes c ON s.class_id = c.id\n      WHERE s.id = :studentId AND s.deleted_at IS NULL\n    ";
                        return [4 /*yield*/, sequelize.query(query, {
                                replacements: { studentId: id },
                                type: 'SELECT',
                                transaction: transaction
                            })];
                    case 1:
                        results = _a.sent();
                        resultList = Array.isArray(results) ? results : [];
                        studentData = resultList.length > 0 ? resultList[0] : null;
                        if (!studentData) {
                            throw apiError_1.ApiError.notFound('学生不存在');
                        }
                        student = __assign(__assign({}, studentData), { kindergarten: studentData.kindergarten_id ? {
                                id: studentData.kindergarten_id,
                                name: studentData.kindergarten_name
                            } : null, "class": studentData.class_id ? {
                                id: studentData.class_id,
                                name: studentData.class_name
                            } : null });
                        return [2 /*return*/, student];
                }
            });
        });
    };
    /**
     * 获取学生的家长列表
     */
    StudentService.prototype.getStudentParents = function (studentId) {
        return __awaiter(this, void 0, void 0, function () {
            var student, sequelize, query, results, resultList, parents;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getStudentById(studentId)];
                    case 1:
                        student = _a.sent();
                        if (!student) {
                            throw apiError_1.ApiError.notFound('学生不存在');
                        }
                        sequelize = student_model_1.Student.sequelize;
                        if (!sequelize) {
                            throw apiError_1.ApiError.serverError('数据库连接不可用');
                        }
                        query = "\n      SELECT \n        psr.*,\n        u.id as user_id,\n        u.username,\n        u.email,\n        u.real_name\n      FROM parent_student_relations psr\n      LEFT JOIN users u ON psr.user_id = u.id\n      WHERE psr.student_id = :studentId AND psr.deleted_at IS NULL\n    ";
                        return [4 /*yield*/, sequelize.query(query, {
                                replacements: { studentId: studentId },
                                type: 'SELECT'
                            })];
                    case 2:
                        results = _a.sent();
                        resultList = Array.isArray(results) ? results : [];
                        parents = resultList.map(function (item) { return (__assign(__assign({}, item), { user: item.user_id ? {
                                id: item.user_id,
                                username: item.username,
                                email: item.email,
                                realName: item.real_name
                            } : null })); });
                        return [2 /*return*/, parents];
                }
            });
        });
    };
    /**
     * 更新学生信息
     */
    StudentService.prototype.updateStudent = function (id, dto, updaterId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, existingStudent, interests, tags, restDto, updateData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = student_validation_1.updateStudentSchema.validate(dto).error;
                        if (error) {
                            throw apiError_1.ApiError.badRequest(error.message);
                        }
                        return [4 /*yield*/, this.getStudentById(id)];
                    case 1:
                        existingStudent = _a.sent();
                        if (!existingStudent) {
                            throw apiError_1.ApiError.notFound('学生不存在');
                        }
                        interests = dto.interests, tags = dto.tags, restDto = __rest(dto, ["interests", "tags"]);
                        updateData = __assign(__assign({}, restDto), { updaterId: updaterId });
                        if (interests !== undefined) {
                            updateData.interests = Array.isArray(interests) ? interests.join(',') : interests;
                        }
                        if (tags !== undefined) {
                            updateData.tags = Array.isArray(tags) ? tags.join(',') : tags;
                        }
                        // 使用Sequelize模型的update方法
                        return [4 /*yield*/, student_model_1.Student.update(updateData, {
                                where: { id: id }
                            })];
                    case 2:
                        // 使用Sequelize模型的update方法
                        _a.sent();
                        return [2 /*return*/, this.getStudentById(id)];
                }
            });
        });
    };
    /**
     * 删除学生
     */
    StudentService.prototype.deleteStudent = function (id, deleterId) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getStudentById(id)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1 instanceof apiError_1.ApiError && error_1.statusCode === 404) {
                            // 学生不存在，删除操作视为成功（幂等性）
                            return [2 /*return*/];
                        }
                        throw error_1;
                    case 3: 
                    // 使用Sequelize模型的update和destroy方法
                    return [4 /*yield*/, student_model_1.Student.update({ updaterId: deleterId }, { where: { id: id } })];
                    case 4:
                        // 使用Sequelize模型的update和destroy方法
                        _a.sent();
                        return [4 /*yield*/, student_model_1.Student.destroy({ where: { id: id } })];
                    case 5:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 为学生分配班级
     */
    StudentService.prototype.assignStudentToClass = function (dto, updaterId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, studentId, classId, existingStudent, classItem;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = student_validation_1.assignClassSchema.validate(dto).error;
                        if (error) {
                            throw apiError_1.ApiError.badRequest(error.message);
                        }
                        studentId = dto.studentId, classId = dto.classId;
                        return [4 /*yield*/, this.getStudentById(studentId)];
                    case 1:
                        existingStudent = _a.sent();
                        if (!existingStudent) {
                            throw apiError_1.ApiError.notFound('学生不存在');
                        }
                        return [4 /*yield*/, class_model_1.Class.findByPk(classId)];
                    case 2:
                        classItem = _a.sent();
                        if (!classItem) {
                            throw apiError_1.ApiError.notFound('班级不存在');
                        }
                        return [4 /*yield*/, student_model_1.Student.update({ classId: classId, updaterId: updaterId }, { where: { id: studentId } })];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.getStudentById(studentId)];
                }
            });
        });
    };
    /**
     * 批量分配班级
     */
    StudentService.prototype.batchAssignStudentsToClass = function (dto, updaterId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, studentIds, classId, classItem, updatedCount;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        error = student_validation_1.batchAssignClassSchema.validate(dto).error;
                        if (error) {
                            throw apiError_1.ApiError.badRequest(error.message);
                        }
                        studentIds = dto.studentIds, classId = dto.classId;
                        return [4 /*yield*/, class_model_1.Class.findByPk(classId)];
                    case 1:
                        classItem = _b.sent();
                        if (!classItem) {
                            throw apiError_1.ApiError.notFound('班级不存在');
                        }
                        return [4 /*yield*/, student_model_1.Student.update({ classId: classId, updaterId: updaterId }, { where: { id: (_a = {}, _a[sequelize_1.Op["in"]] = studentIds, _a) } })];
                    case 2:
                        updatedCount = (_b.sent())[0];
                        return [2 /*return*/, { updatedCount: updatedCount }];
                }
            });
        });
    };
    /**
     * 更新学生状态
     */
    StudentService.prototype.updateStudentStatus = function (dto, updaterId) {
        return __awaiter(this, void 0, void 0, function () {
            var error, studentId, status, existingStudent;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = student_validation_1.updateStudentStatusSchema.validate(dto).error;
                        if (error) {
                            throw apiError_1.ApiError.badRequest(error.message);
                        }
                        studentId = dto.studentId, status = dto.status;
                        return [4 /*yield*/, this.getStudentById(studentId)];
                    case 1:
                        existingStudent = _a.sent();
                        if (!existingStudent) {
                            throw apiError_1.ApiError.notFound('学生不存在');
                        }
                        return [4 /*yield*/, student_model_1.Student.update({ status: status, updaterId: updaterId }, { where: { id: studentId } })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, { success: true }];
                }
            });
        });
    };
    /**
     * 获取学生统计数据
     */
    StudentService.prototype.getStudentStats = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sequelizeInstance, basicStats, ageStats, stats, statsData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        sequelizeInstance = student_model_1.Student.sequelize;
                        if (!sequelizeInstance) {
                            throw apiError_1.ApiError.serverError('数据库连接不可用');
                        }
                        return [4 /*yield*/, sequelizeInstance.query("\n        SELECT \n          COUNT(*) as total,\n          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,\n          SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive,\n          SUM(CASE WHEN gender = 1 THEN 1 ELSE 0 END) as male,\n          SUM(CASE WHEN gender = 0 THEN 1 ELSE 0 END) as female,\n          SUM(CASE WHEN class_id IS NOT NULL AND class_id > 0 THEN 1 ELSE 0 END) as assigned,\n          SUM(CASE WHEN class_id IS NULL OR class_id = 0 THEN 1 ELSE 0 END) as unassigned\n        FROM students \n        WHERE deleted_at IS NULL\n      ")];
                    case 1:
                        basicStats = (_a.sent())[0];
                        return [4 /*yield*/, sequelizeInstance.query("\n        SELECT \n          CASE \n            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 3 THEN '0-3\u5C81'\n            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 4 THEN '3-4\u5C81'\n            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 5 THEN '4-5\u5C81'\n            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 6 THEN '5-6\u5C81'\n            ELSE '6\u5C81\u4EE5\u4E0A'\n          END as ageGroup,\n          COUNT(*) as count\n        FROM students \n        WHERE deleted_at IS NULL\n        GROUP BY \n          CASE \n            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 3 THEN '0-3\u5C81'\n            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 4 THEN '3-4\u5C81'\n            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 5 THEN '4-5\u5C81'\n            WHEN TIMESTAMPDIFF(YEAR, birth_date, CURDATE()) < 6 THEN '5-6\u5C81'\n            ELSE '6\u5C81\u4EE5\u4E0A'\n          END\n        ORDER BY ageGroup\n      ")];
                    case 2:
                        ageStats = (_a.sent())[0];
                        stats = Array.isArray(basicStats) ? basicStats[0] : basicStats;
                        statsData = stats;
                        return [2 /*return*/, {
                                success: true,
                                message: '获取学生统计成功',
                                data: {
                                    total: Number(statsData.total) || 0,
                                    active: Number(statsData.active) || 0,
                                    inactive: Number(statsData.inactive) || 0,
                                    male: Number(statsData.male) || 0,
                                    female: Number(statsData.female) || 0,
                                    assigned: Number(statsData.assigned) || 0,
                                    unassigned: Number(statsData.unassigned) || 0,
                                    ageDistribution: ageStats || []
                                }
                            }];
                    case 3:
                        error_2 = _a.sent();
                        console.error('获取学生统计失败:', error_2);
                        throw apiError_1.ApiError.serverError('获取学生统计失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 按班级获取学生列表
     */
    StudentService.prototype.getStudentsByClass = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var sequelizeInstance, classId, page, pageSize, keyword, offset, whereClause, replacements, countQuery, dataQuery, _a, countResult, dataResult, countList, total, dataList, list;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        sequelizeInstance = student_model_1.Student.sequelize;
                        if (!sequelizeInstance) {
                            throw apiError_1.ApiError.serverError('数据库连接不可用');
                        }
                        classId = params.classId, page = params.page, pageSize = params.pageSize, keyword = params.keyword;
                        offset = (page - 1) * pageSize;
                        whereClause = 'WHERE s.class_id = :classId AND s.deleted_at IS NULL';
                        replacements = { classId: parseInt(classId, 10) };
                        if (keyword) {
                            whereClause += ' AND (s.name LIKE :keyword OR s.student_no LIKE :keyword)';
                            replacements.keyword = "%".concat(keyword, "%");
                        }
                        countQuery = "\n      SELECT COUNT(*) as total\n      FROM students s\n      ".concat(whereClause, "\n    ");
                        dataQuery = "\n      SELECT\n        s.id,\n        s.student_no as studentId,\n        s.name,\n        s.gender,\n        TIMESTAMPDIFF(YEAR, s.birth_date, CURDATE()) as age,\n        DATE_FORMAT(s.birth_date, '%Y-%m-%d') as birthDate,\n        '' as parentName,\n        '' as parentPhone,\n        DATE_FORMAT(s.enrollment_date, '%Y-%m-%d') as enrollDate,\n        CASE\n          WHEN s.status = 1 THEN '\u5728\u8BFB'\n          WHEN s.status = 0 THEN '\u9000\u5B66'\n          WHEN s.status = 2 THEN '\u4F11\u5B66'\n          ELSE '\u8BF7\u5047'\n        END as status,\n        s.household_address as address,\n        s.allergy_history as healthStatus,\n        s.remark as remarks,\n        c.name as className\n      FROM students s\n      LEFT JOIN classes c ON s.class_id = c.id\n      ".concat(whereClause, "\n      ORDER BY s.created_at DESC\n      LIMIT :limit OFFSET :offset\n    ");
                        replacements.limit = pageSize;
                        replacements.offset = offset;
                        return [4 /*yield*/, Promise.all([
                                sequelizeInstance.query(countQuery, {
                                    replacements: replacements,
                                    type: 'SELECT'
                                }),
                                sequelizeInstance.query(dataQuery, {
                                    replacements: replacements,
                                    type: 'SELECT'
                                })
                            ])];
                    case 1:
                        _a = _b.sent(), countResult = _a[0], dataResult = _a[1];
                        countList = Array.isArray(countResult) ? countResult : [];
                        total = countList.length > 0 ? countList[0].total : 0;
                        dataList = Array.isArray(dataResult) ? dataResult : [];
                        list = dataList.map(function (item) { return (__assign(__assign({}, item), { gender: item.gender === 1 ? '男' : '女', healthStatus: item.healthStatus ? item.healthStatus.split(',') : ['healthy'] })); });
                        return [2 /*return*/, {
                                list: list,
                                total: Number(total),
                                page: page,
                                pageSize: pageSize
                            }];
                }
            });
        });
    };
    /**
     * 添加学生到班级
     */
    StudentService.prototype.addToClass = function (studentData, creatorId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                        var classItem, existingStudent, newStudentData, student;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, class_model_1.Class.findByPk(studentData.classId, { transaction: transaction })];
                                case 1:
                                    classItem = _a.sent();
                                    if (!classItem) {
                                        throw apiError_1.ApiError.notFound('班级不存在');
                                    }
                                    return [4 /*yield*/, student_model_1.Student.findOne({
                                            where: { studentNo: studentData.studentId },
                                            transaction: transaction
                                        })];
                                case 2:
                                    existingStudent = _a.sent();
                                    if (existingStudent) {
                                        throw apiError_1.ApiError.badRequest('学号已存在');
                                    }
                                    newStudentData = {
                                        name: studentData.name,
                                        studentNo: studentData.studentId,
                                        classId: parseInt(studentData.classId, 10),
                                        kindergartenId: 1,
                                        status: 1,
                                        birthDate: new Date(studentData.birthDate),
                                        enrollmentDate: new Date(studentData.enrollDate || new Date()),
                                        gender: studentData.gender === '男' ? 1 : 2,
                                        allergyHistory: Array.isArray(studentData.healthStatus) ? studentData.healthStatus.join(',') : 'healthy',
                                        remark: studentData.remarks,
                                        householdAddress: studentData.address,
                                        creatorId: creatorId,
                                        updaterId: creatorId
                                    };
                                    return [4 /*yield*/, student_model_1.Student.create(newStudentData, { transaction: transaction })];
                                case 3:
                                    student = _a.sent();
                                    return [2 /*return*/, this.getStudentById(student.id, transaction)];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * 从班级移除学生
     */
    StudentService.prototype.removeFromClass = function (studentId, classId, updaterId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                        var student;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, student_model_1.Student.findByPk(studentId, { transaction: transaction })];
                                case 1:
                                    student = _a.sent();
                                    if (!student) {
                                        throw apiError_1.ApiError.notFound('学生不存在');
                                    }
                                    // 检查学生是否在指定班级中
                                    if (student.classId !== parseInt(classId, 10)) {
                                        throw apiError_1.ApiError.badRequest('学生不在指定班级中');
                                    }
                                    // 将学生的班级ID设为null，表示从班级中移除
                                    return [4 /*yield*/, student_model_1.Student.update({ classId: null, updaterId: updaterId }, { where: { id: studentId }, transaction: transaction })];
                                case 2:
                                    // 将学生的班级ID设为null，表示从班级中移除
                                    _a.sent();
                                    return [2 /*return*/, true];
                            }
                        });
                    }); })];
            });
        });
    };
    return StudentService;
}());
exports.StudentService = StudentService;
exports["default"] = StudentService;
