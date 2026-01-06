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
exports.teacherController = exports.TeacherController = void 0;
var init_1 = require("../init");
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
var sqlHelper_1 = require("../utils/sqlHelper");
var search_helper_1 = require("../utils/search-helper");
var sequelize_1 = require("sequelize");
/**
 * 教师控制器
 * 处理与教师相关的所有请求
 */
var TeacherController = /** @class */ (function () {
    function TeacherController() {
    }
    /**
     * 创建教师
     * @param req 请求对象
     * @param res 响应对象
     */
    TeacherController.prototype.create = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, teacherData, kindergartenId, userId, userResult, _b, _c, _d, kindergartenExists, userExists, existingTeacher, kindergartenInfo, groupId, teacherDataObj, teacherDataToInsert, result, teacherId_1, classesCount, teacherClassValues, teacherQuery, teachers, responseData, teacherRecord, classesQuery, classes, error_1;
            var _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _f.sent();
                        _f.label = 2;
                    case 2:
                        _f.trys.push([2, 20, , 22]);
                        teacherData = req.body;
                        kindergartenId = teacherData.kindergartenId || ((_a = req.user) === null || _a === void 0 ? void 0 : _a.kindergartenId);
                        // 🔍 调试日志
                        console.log('📋 [教师创建] 接收到的请求数据:', {
                            kindergartenId: kindergartenId,
                            userId: teacherData.userId,
                            realName: teacherData.realName,
                            phone: teacherData.phone,
                            position: teacherData.position,
                            roleId: teacherData.roleId
                        });
                        userId = teacherData.userId;
                        if (!(!userId && teacherData.realName && teacherData.phone)) return [3 /*break*/, 6];
                        console.log('📝 场景1：从人员中心创建教师，需要先创建用户');
                        _c = (_b = sqlHelper_1.SqlHelper).insert;
                        _d = ['users'];
                        _e = {
                            username: teacherData.phone
                        };
                        return [4 /*yield*/, require('bcrypt').hash('123456', 10)];
                    case 3: return [4 /*yield*/, _c.apply(_b, _d.concat([(_e.password = _f.sent(),
                                _e.real_name = teacherData.realName,
                                _e.phone = teacherData.phone,
                                _e.email = teacherData.email || '',
                                _e.role = 'teacher',
                                _e.status = 'active',
                                _e), { transaction: transaction }]))];
                    case 4:
                        userResult = _f.sent();
                        userId = userResult.insertId;
                        console.log('✅ 用户创建成功, ID:', userId);
                        if (!teacherData.roleId) return [3 /*break*/, 6];
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.insert('user_roles', {
                                user_id: userId,
                                role_id: teacherData.roleId,
                                created_at: new Date(),
                                updated_at: new Date()
                            }, { transaction: transaction })];
                    case 5:
                        _f.sent();
                        console.log('✅ user_roles 创建成功, roleId:', teacherData.roleId);
                        _f.label = 6;
                    case 6:
                        // 🔍 验证前的调试日志
                        console.log('🔍 [教师创建] 验证前的数据:', {
                            userId: userId,
                            kindergartenId: kindergartenId,
                            position: teacherData.position,
                            positionType: typeof teacherData.position
                        });
                        // 验证必填字段
                        if (!userId || !kindergartenId || !teacherData.position) {
                            console.log('❌ [教师创建] 验证失败:', {
                                userIdValid: !!userId,
                                kindergartenIdValid: !!kindergartenId,
                                positionValid: !!teacherData.position
                            });
                            throw apiError_1.ApiError.badRequest('缺少必填字段', 'MISSING_REQUIRED_FIELDS');
                        }
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('kindergartens', 'id', kindergartenId, { transaction: transaction })];
                    case 7:
                        kindergartenExists = _f.sent();
                        if (!kindergartenExists) {
                            throw apiError_1.ApiError.badRequest('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
                        }
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('users', 'id', userId, { transaction: transaction })];
                    case 8:
                        userExists = _f.sent();
                        if (!userExists) {
                            throw apiError_1.ApiError.badRequest('用户不存在', 'USER_NOT_FOUND');
                        }
                        if (!teacherData.teacherNo) return [3 /*break*/, 10];
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('teachers', 'teacher_no', teacherData.teacherNo, { transaction: transaction })];
                    case 9:
                        existingTeacher = _f.sent();
                        if (existingTeacher) {
                            throw apiError_1.ApiError.badRequest('教师编号已存在', 'TEACHER_NO_EXISTS');
                        }
                        _f.label = 10;
                    case 10: return [4 /*yield*/, sqlHelper_1.SqlHelper.getRecord('kindergartens', 'id', kindergartenId, { transaction: transaction })];
                    case 11:
                        kindergartenInfo = _f.sent();
                        groupId = kindergartenInfo === null || kindergartenInfo === void 0 ? void 0 : kindergartenInfo.group_id;
                        teacherDataObj = {
                            userId: userId,
                            kindergartenId: kindergartenId,
                            groupId: groupId,
                            teacherNo: teacherData.teacherNo || '',
                            position: Number(teacherData.position),
                            status: teacherData.status || 1
                        };
                        // 只添加有值的可选字段
                        if (teacherData.remark) {
                            teacherDataObj.remark = teacherData.remark;
                        }
                        if (teacherData.hireDate) {
                            teacherDataObj.hireDate = teacherData.hireDate;
                        }
                        if (teacherData.education) {
                            teacherDataObj.education = teacherData.education;
                        }
                        if (teacherData.major) {
                            teacherDataObj.major = teacherData.major;
                        }
                        teacherDataToInsert = sqlHelper_1.SqlHelper.camelToSnake(teacherDataObj);
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.insert('teachers', teacherDataToInsert, { transaction: transaction })];
                    case 12:
                        result = _f.sent();
                        teacherId_1 = result.insertId;
                        if (!(teacherData.classIds && teacherData.classIds.length > 0)) return [3 /*break*/, 15];
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.getCount('classes', {
                                where: "id IN (".concat(teacherData.classIds.join(','), ")"),
                                transaction: transaction
                            })];
                    case 13:
                        classesCount = _f.sent();
                        if (!(classesCount > 0)) return [3 /*break*/, 15];
                        teacherClassValues = teacherData.classIds.map(function (classId) { return [
                            teacherId_1,
                            classId,
                            new Date(),
                            new Date()
                        ]; });
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.batchInsert('class_teachers', ['teacher_id', 'class_id', 'created_at', 'updated_at'], teacherClassValues, transaction)];
                    case 14:
                        _f.sent();
                        _f.label = 15;
                    case 15:
                        teacherQuery = "\n        SELECT t.*,\n               u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email,\n               k.id AS kindergarten_id, k.name AS kindergarten_name,\n               g.id AS group_id, g.name AS group_name\n        FROM teachers t\n        JOIN users u ON t.user_id = u.id\n        JOIN kindergartens k ON t.kindergarten_id = k.id\n        LEFT JOIN `groups` g ON t.group_id = g.id\n        WHERE t.id = :teacherId\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(teacherQuery, {
                                replacements: { teacherId: teacherId_1 },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 16:
                        teachers = _f.sent();
                        responseData = null;
                        if (!(teachers && teachers.length > 0)) return [3 /*break*/, 18];
                        teacherRecord = teachers[0];
                        // ✅ 返回完整的用户和教师信息
                        responseData = {
                            user: {
                                id: teacherRecord.user_id,
                                username: teacherRecord.username,
                                realName: teacherRecord.user_name,
                                phone: teacherRecord.phone,
                                email: teacherRecord.email,
                                role: 'teacher',
                                status: 'active'
                            },
                            teacher: {
                                id: teacherRecord.id,
                                userId: teacherRecord.user_id,
                                kindergartenId: teacherRecord.kindergarten_id,
                                kindergartenName: teacherRecord.kindergarten_name,
                                groupId: teacherRecord.group_id,
                                groupName: teacherRecord.group_name,
                                teacherNo: teacherRecord.teacher_no,
                                position: teacherRecord.position,
                                status: teacherRecord.status
                            }
                        };
                        if (!(teacherData.classIds && teacherData.classIds.length > 0)) return [3 /*break*/, 18];
                        classesQuery = "\n            SELECT c.*\n            FROM classes c\n            JOIN class_teachers ct ON c.id = ct.class_id\n            WHERE ct.teacher_id = :teacherId\n          ";
                        return [4 /*yield*/, init_1.sequelize.query(classesQuery, {
                                replacements: { teacherId: teacherId_1 },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 17:
                        classes = _f.sent();
                        responseData.teacher.classes = classes.map(function (c) { return sqlHelper_1.SqlHelper.snakeToCamel(c); });
                        _f.label = 18;
                    case 18: return [4 /*yield*/, transaction.commit()];
                    case 19:
                        _f.sent();
                        apiResponse_1.ApiResponse.success(res, responseData, '创建教师成功');
                        return [3 /*break*/, 22];
                    case 20:
                        error_1 = _f.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 21:
                        _f.sent();
                        if (error_1 instanceof apiError_1.ApiError) {
                            throw error_1;
                        }
                        console.error('创建教师错误详情:', error_1);
                        throw apiError_1.ApiError.serverError('创建教师失败: ' + error_1.message, 'TEACHER_CREATE_ERROR');
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师列表
     * @param req 请求对象
     * @param res 响应对象
     */
    TeacherController.prototype.list = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var searchParams, searchConfig, queryResult, countQuery, countResult, total, paginationResponse_1, teachersQuery, teachers, teacherIds, teacherClassesMap_1, formattedTeachers, paginationResponse, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        searchParams = {
                            keyword: req.query.keyword,
                            page: req.query.page ? Number(req.query.page) : 1,
                            pageSize: req.query.pageSize ? Number(req.query.pageSize) : 10,
                            sortBy: req.query.sortBy,
                            sortOrder: req.query.sortOrder,
                            kindergartenId: req.query.kindergartenId ? Number(req.query.kindergartenId) : undefined,
                            status: req.query.status
                        };
                        searchConfig = search_helper_1.SearchHelper.configs.teacher;
                        queryResult = search_helper_1.SearchHelper.buildSearchQuery(searchParams, searchConfig, 't');
                        countQuery = "\n        SELECT COUNT(*) AS total\n        FROM teachers t\n        LEFT JOIN users u ON t.user_id = u.id\n        LEFT JOIN kindergartens k ON t.kindergarten_id = k.id\n        WHERE ".concat(queryResult.whereClause, "\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(countQuery, {
                                replacements: queryResult.replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResult = _a.sent();
                        total = countResult && countResult.length > 0 ? Number(countResult[0].total) : 0;
                        // 如果没有记录，直接返回空数组
                        if (total === 0) {
                            paginationResponse_1 = search_helper_1.PaginationHelper.buildResponse([], 0, searchParams.page, searchParams.pageSize);
                            apiResponse_1.ApiResponse.success(res, paginationResponse_1, '获取教师列表成功');
                            return [2 /*return*/];
                        }
                        teachersQuery = "\n        SELECT \n          t.*,\n          u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email,\n          k.id AS kindergarten_id, k.name AS kindergarten_name\n        FROM teachers t\n        LEFT JOIN users u ON t.user_id = u.id\n        LEFT JOIN kindergartens k ON t.kindergarten_id = k.id\n        WHERE ".concat(queryResult.whereClause, "\n        ").concat(queryResult.orderBy, "\n        LIMIT ").concat(queryResult.limit, " OFFSET ").concat(queryResult.offset, "\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(teachersQuery, {
                                replacements: queryResult.replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        teachers = _a.sent();
                        teacherIds = teachers.map(function (t) { return t.id; });
                        teacherClassesMap_1 = {};
                        formattedTeachers = teachers.map(function (teacher) {
                            var teacherId = teacher.id;
                            var formattedTeacher = sqlHelper_1.SqlHelper.snakeToCamel(teacher);
                            // 组织返回数据结构
                            return __assign(__assign({}, formattedTeacher), { user: {
                                    id: teacher.user_id,
                                    username: teacher.username,
                                    name: teacher.user_name,
                                    phone: teacher.phone,
                                    email: teacher.email
                                }, kindergarten: {
                                    id: teacher.kindergarten_id,
                                    name: teacher.kindergarten_name
                                }, classes: teacherClassesMap_1[teacherId] || [] });
                        });
                        paginationResponse = search_helper_1.PaginationHelper.buildResponse(formattedTeachers, total, searchParams.page, searchParams.pageSize);
                        apiResponse_1.ApiResponse.success(res, paginationResponse, '获取教师列表成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        console.error('教师列表API出错:', error_2);
                        if (error_2 instanceof apiError_1.ApiError) {
                            throw error_2;
                        }
                        throw apiError_1.ApiError.serverError('获取教师列表失败', 'TEACHER_LIST_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师详情
     * @param req 请求对象
     * @param res 响应对象
     */
    TeacherController.prototype.detail = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, teacherQuery, teachers, teacher, formattedTeacher, classesQuery, classes, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        if (!id || isNaN(Number(id))) {
                            throw apiError_1.ApiError.badRequest('无效的教师ID', 'INVALID_TEACHER_ID');
                        }
                        teacherQuery = "\n        SELECT \n          t.*,\n          u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email,\n          k.id AS kindergarten_id, k.name AS kindergarten_name\n        FROM teachers t\n        LEFT JOIN users u ON t.user_id = u.id\n        LEFT JOIN kindergartens k ON t.kindergarten_id = k.id\n        WHERE t.id = :id AND t.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(teacherQuery, {
                                replacements: { id: Number(id) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        teachers = _a.sent();
                        if (!teachers || teachers.length === 0) {
                            throw apiError_1.ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
                        }
                        teacher = teachers[0];
                        formattedTeacher = sqlHelper_1.SqlHelper.snakeToCamel(teacher);
                        classesQuery = "\n        SELECT \n          c.id, c.name, c.code, c.type, c.grade, c.status,\n          c.capacity, c.current_student_count, c.classroom, c.description, c.image_url\n        FROM classes c\n        JOIN class_teachers ct ON c.id = ct.class_id\n        WHERE ct.teacher_id = :teacherId\n        AND ct.deleted_at IS NULL\n        AND c.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(classesQuery, {
                                replacements: { teacherId: Number(id) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        classes = _a.sent();
                        result = __assign(__assign({}, formattedTeacher), { user: {
                                id: teacher.user_id,
                                username: teacher.username,
                                name: teacher.user_name,
                                phone: teacher.phone,
                                email: teacher.email
                            }, kindergarten: {
                                id: teacher.kindergarten_id,
                                name: teacher.kindergarten_name
                            }, classes: classes.map(function (c) { return sqlHelper_1.SqlHelper.snakeToCamel(c); }) });
                        apiResponse_1.ApiResponse.success(res, result, '获取教师详情成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _a.sent();
                        if (error_3 instanceof apiError_1.ApiError) {
                            throw error_3;
                        }
                        throw apiError_1.ApiError.serverError('获取教师详情失败', 'TEACHER_DETAIL_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据用户ID获取教师信息
     * @param req 请求对象
     * @param res 响应对象
     */
    TeacherController.prototype.getByUserId = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userId, teacherQuery, teachers, teacher, formattedTeacher, classesQuery, classes, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        userId = req.params.userId;
                        if (!userId || isNaN(Number(userId))) {
                            throw apiError_1.ApiError.badRequest('无效的用户ID', 'INVALID_USER_ID');
                        }
                        teacherQuery = "\n        SELECT \n          t.*,\n          u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email,\n          k.id AS kindergarten_id, k.name AS kindergarten_name\n        FROM teachers t\n        LEFT JOIN users u ON t.user_id = u.id\n        LEFT JOIN kindergartens k ON t.kindergarten_id = k.id\n        WHERE t.user_id = :userId AND t.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(teacherQuery, {
                                replacements: { userId: Number(userId) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        teachers = _a.sent();
                        if (!teachers || teachers.length === 0) {
                            throw apiError_1.ApiError.notFound('未找到该用户对应的教师信息', 'TEACHER_NOT_FOUND_FOR_USER');
                        }
                        teacher = teachers[0];
                        formattedTeacher = sqlHelper_1.SqlHelper.snakeToCamel(teacher);
                        classesQuery = "\n        SELECT \n          c.id, c.name, c.code, c.type, c.grade, c.status,\n          c.capacity, c.current_student_count, c.classroom, c.description, c.image_url\n        FROM classes c\n        JOIN class_teachers ct ON c.id = ct.class_id\n        WHERE ct.teacher_id = :teacherId \n        AND ct.deleted_at IS NULL\n        AND c.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(classesQuery, {
                                replacements: { teacherId: teacher.id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        classes = _a.sent();
                        result = __assign(__assign({}, formattedTeacher), { user: {
                                id: teacher.user_id,
                                username: teacher.username,
                                name: teacher.user_name,
                                phone: teacher.phone,
                                email: teacher.email
                            }, kindergarten: {
                                id: teacher.kindergarten_id,
                                name: teacher.kindergarten_name
                            }, classes: classes.map(function (c) { return sqlHelper_1.SqlHelper.snakeToCamel(c); }) });
                        apiResponse_1.ApiResponse.success(res, result, '获取教师信息成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        if (error_4 instanceof apiError_1.ApiError) {
                            throw error_4;
                        }
                        throw apiError_1.ApiError.serverError('获取教师信息失败', 'TEACHER_GET_BY_USER_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新教师信息
     * @param req 请求对象
     * @param res 响应对象
     */
    TeacherController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, id_1, teacherData, teacherExists, teacher, existingTeacherExists, kindergartenExists, userExists, updateData, classesCount, teacherClassValues, teacherQuery, teachers, updatedTeacher, formattedTeacher, classesQuery, classes, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 19, , 21]);
                        id_1 = req.params.id;
                        teacherData = req.body;
                        if (!id_1 || isNaN(Number(id_1))) {
                            throw apiError_1.ApiError.badRequest('无效的教师ID', 'INVALID_TEACHER_ID');
                        }
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('teachers', 'id', Number(id_1), { transaction: transaction })];
                    case 3:
                        teacherExists = _a.sent();
                        if (!teacherExists) {
                            throw apiError_1.ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
                        }
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.getRecord('teachers', 'id', Number(id_1), { transaction: transaction })];
                    case 4:
                        teacher = _a.sent();
                        if (!teacher) {
                            throw apiError_1.ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
                        }
                        if (!(teacherData.teacherNo && teacherData.teacherNo !== teacher.teacher_no)) return [3 /*break*/, 6];
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('teachers', 'teacher_no', teacherData.teacherNo, {
                                whereAddition: "id <> ".concat(Number(id_1)),
                                transaction: transaction
                            })];
                    case 5:
                        existingTeacherExists = _a.sent();
                        if (existingTeacherExists) {
                            throw apiError_1.ApiError.badRequest('教师编号已存在', 'TEACHER_NO_EXISTS');
                        }
                        _a.label = 6;
                    case 6:
                        if (!(teacherData.kindergartenId && teacherData.kindergartenId !== teacher.kindergarten_id)) return [3 /*break*/, 8];
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('kindergartens', 'id', teacherData.kindergartenId, { transaction: transaction })];
                    case 7:
                        kindergartenExists = _a.sent();
                        if (!kindergartenExists) {
                            throw apiError_1.ApiError.badRequest('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
                        }
                        _a.label = 8;
                    case 8:
                        if (!(teacherData.userId && teacherData.userId !== teacher.user_id)) return [3 /*break*/, 10];
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('users', 'id', teacherData.userId, { transaction: transaction })];
                    case 9:
                        userExists = _a.sent();
                        if (!userExists) {
                            throw apiError_1.ApiError.badRequest('用户不存在', 'USER_NOT_FOUND');
                        }
                        _a.label = 10;
                    case 10:
                        updateData = {};
                        if (teacherData.userId !== undefined)
                            updateData.user_id = teacherData.userId;
                        if (teacherData.kindergartenId !== undefined)
                            updateData.kindergarten_id = teacherData.kindergartenId;
                        if (teacherData.teacherNo !== undefined)
                            updateData.teacher_no = teacherData.teacherNo;
                        if (teacherData.position !== undefined)
                            updateData.position = Number(teacherData.position);
                        if (teacherData.status !== undefined)
                            updateData.status = teacherData.status;
                        if (teacherData.remark !== undefined)
                            updateData.remark = teacherData.remark;
                        updateData.updated_at = new Date();
                        // 更新教师信息
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.update('teachers', updateData, "id = ".concat(Number(id_1)), { transaction: transaction })];
                    case 11:
                        // 更新教师信息
                        _a.sent();
                        if (!teacherData.classIds) return [3 /*break*/, 15];
                        // 首先软删除现有的班级关联
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE class_teachers SET deleted_at = NOW() WHERE teacher_id = :teacherId", {
                                replacements: { teacherId: Number(id_1) },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 12:
                        // 首先软删除现有的班级关联
                        _a.sent();
                        if (!(teacherData.classIds.length > 0)) return [3 /*break*/, 15];
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.getCount('classes', {
                                where: "id IN (".concat(teacherData.classIds.join(','), ")"),
                                transaction: transaction
                            })];
                    case 13:
                        classesCount = _a.sent();
                        if (!(classesCount > 0)) return [3 /*break*/, 15];
                        teacherClassValues = teacherData.classIds.map(function (classId) { return [
                            Number(id_1),
                            classId,
                            new Date(),
                            new Date()
                        ]; });
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.batchInsert('class_teachers', ['teacher_id', 'class_id', 'created_at', 'updated_at'], teacherClassValues, transaction)];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15:
                        teacherQuery = "\n        SELECT \n          t.*,\n          u.id AS user_id, u.username, u.real_name AS user_name, u.phone, u.email, u.avatar,\n          k.id AS kindergarten_id, k.name AS kindergarten_name\n        FROM teachers t\n        LEFT JOIN users u ON t.user_id = u.id\n        LEFT JOIN kindergartens k ON t.kindergarten_id = k.id\n        WHERE t.id = :id AND t.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(teacherQuery, {
                                replacements: { id: Number(id_1) },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 16:
                        teachers = _a.sent();
                        if (!teachers || teachers.length === 0) {
                            throw apiError_1.ApiError.serverError('获取更新后的教师信息失败', 'TEACHER_UPDATE_ERROR');
                        }
                        updatedTeacher = teachers[0];
                        formattedTeacher = sqlHelper_1.SqlHelper.snakeToCamel(updatedTeacher);
                        classesQuery = "\n        SELECT \n          c.id, c.name, c.code, c.type, c.grade, c.status\n        FROM classes c\n        JOIN class_teachers ct ON c.id = ct.class_id\n        WHERE ct.teacher_id = :teacherId\n        AND ct.deleted_at IS NULL\n        AND c.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(classesQuery, {
                                replacements: { teacherId: Number(id_1) },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 17:
                        classes = _a.sent();
                        result = __assign(__assign({}, formattedTeacher), { user: {
                                id: updatedTeacher.user_id,
                                username: updatedTeacher.username,
                                name: updatedTeacher.user_name,
                                phone: updatedTeacher.phone,
                                email: updatedTeacher.email,
                                avatar: updatedTeacher.avatar
                            }, kindergarten: {
                                id: updatedTeacher.kindergarten_id,
                                name: updatedTeacher.kindergarten_name
                            }, classes: classes.map(function (c) { return sqlHelper_1.SqlHelper.snakeToCamel(c); }) });
                        return [4 /*yield*/, transaction.commit()];
                    case 18:
                        _a.sent();
                        apiResponse_1.ApiResponse.success(res, result, '更新教师信息成功');
                        return [3 /*break*/, 21];
                    case 19:
                        error_5 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 20:
                        _a.sent();
                        if (error_5 instanceof apiError_1.ApiError) {
                            throw error_5;
                        }
                        console.error('教师更新错误:', error_5);
                        throw apiError_1.ApiError.serverError('更新教师信息失败', 'TEACHER_UPDATE_ERROR');
                    case 21: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除教师
     * @param req 请求对象
     * @param res 响应对象
     */
    TeacherController.prototype["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, id, teacherExists, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        id = req.params.id;
                        if (!id || isNaN(Number(id))) {
                            throw apiError_1.ApiError.badRequest('无效的教师ID', 'INVALID_TEACHER_ID');
                        }
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('teachers', 'id', Number(id), { transaction: transaction })];
                    case 3:
                        teacherExists = _a.sent();
                        if (!teacherExists) {
                            throw apiError_1.ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
                        }
                        // 软删除教师-班级关联
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE class_teachers SET deleted_at = NOW() WHERE teacher_id = :teacherId", {
                                replacements: { teacherId: Number(id) },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 4:
                        // 软删除教师-班级关联
                        _a.sent();
                        // 软删除教师记录
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.softDelete('teachers', 'id', Number(id), { transaction: transaction })];
                    case 5:
                        // 软删除教师记录
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        apiResponse_1.ApiResponse.success(res, { message: '删除教师成功' });
                        return [3 /*break*/, 9];
                    case 7:
                        error_6 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        if (error_6 instanceof apiError_1.ApiError) {
                            throw error_6;
                        }
                        throw apiError_1.ApiError.serverError('删除教师失败', 'TEACHER_DELETE_ERROR');
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师统计信息
     * @param req 请求对象
     * @param res 响应对象
     */
    TeacherController.prototype.stats = function (req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j;
        return __awaiter(this, void 0, void 0, function () {
            var id, teacherExists, teacherQuery, teachers, teacher, classStatsQuery, classStats, studentStatsQuery, studentStats, subjectStatsQuery, subjectStats, activityStats, activityStatsQuery, activityResults, error_7, stats, error_8;
            return __generator(this, function (_k) {
                switch (_k.label) {
                    case 0:
                        _k.trys.push([0, 10, , 11]);
                        id = req.params.id;
                        if (!id || isNaN(Number(id))) {
                            throw apiError_1.ApiError.badRequest('无效的教师ID', 'INVALID_TEACHER_ID');
                        }
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('teachers', 'id', Number(id))];
                    case 1:
                        teacherExists = _k.sent();
                        if (!teacherExists) {
                            throw apiError_1.ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
                        }
                        teacherQuery = "\n        SELECT \n          t.id, t.teacher_no, t.position, t.status,\n          u.real_name as teacher_name, u.phone, u.email,\n          k.name as kindergarten_name\n        FROM teachers t\n        LEFT JOIN users u ON t.user_id = u.id\n        LEFT JOIN kindergartens k ON t.kindergarten_id = k.id\n        WHERE t.id = :id AND t.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(teacherQuery, {
                                replacements: { id: Number(id) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        teachers = _k.sent();
                        if (!teachers || teachers.length === 0) {
                            throw apiError_1.ApiError.notFound('教师不存在', 'TEACHER_NOT_FOUND');
                        }
                        teacher = teachers[0];
                        classStatsQuery = "\n        SELECT \n          COUNT(*) as total_classes,\n          SUM(CASE WHEN ct.is_main_teacher = 1 THEN 1 ELSE 0 END) as main_classes,\n          COUNT(DISTINCT ct.subject) as subjects_count\n        FROM class_teachers ct\n        WHERE ct.teacher_id = :teacherId AND ct.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(classStatsQuery, {
                                replacements: { teacherId: Number(id) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        classStats = _k.sent();
                        studentStatsQuery = "\n        SELECT \n          COUNT(DISTINCT s.id) as total_students,\n          AVG(YEAR(CURDATE()) - YEAR(s.birth_date)) as average_age,\n          COUNT(DISTINCT s.class_id) as classes_with_students\n        FROM students s\n        JOIN classes c ON s.class_id = c.id\n        JOIN class_teachers ct ON c.id = ct.class_id\n        WHERE ct.teacher_id = :teacherId \n        AND ct.deleted_at IS NULL \n        AND s.deleted_at IS NULL\n        AND c.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(studentStatsQuery, {
                                replacements: { teacherId: Number(id) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 4:
                        studentStats = _k.sent();
                        subjectStatsQuery = "\n        SELECT \n          ct.subject,\n          COUNT(*) as class_count,\n          SUM(CASE WHEN ct.is_main_teacher = 1 THEN 1 ELSE 0 END) as main_teacher_count\n        FROM class_teachers ct\n        WHERE ct.teacher_id = :teacherId AND ct.deleted_at IS NULL\n        GROUP BY ct.subject\n        ORDER BY class_count DESC\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(subjectStatsQuery, {
                                replacements: { teacherId: Number(id) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 5:
                        subjectStats = _k.sent();
                        activityStats = [];
                        _k.label = 6;
                    case 6:
                        _k.trys.push([6, 8, , 9]);
                        activityStatsQuery = "\n          SELECT \n            COUNT(*) as total_activities,\n            SUM(CASE WHEN a.status = 'active' THEN 1 ELSE 0 END) as active_activities,\n            SUM(CASE WHEN a.status = 'completed' THEN 1 ELSE 0 END) as completed_activities\n          FROM activities a\n          WHERE a.teacher_id = :teacherId AND a.deleted_at IS NULL\n        ";
                        return [4 /*yield*/, init_1.sequelize.query(activityStatsQuery, {
                                replacements: { teacherId: Number(id) },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 7:
                        activityResults = _k.sent();
                        activityStats = activityResults;
                        return [3 /*break*/, 9];
                    case 8:
                        error_7 = _k.sent();
                        // 如果活动表不存在或查询失败，使用默认值
                        activityStats = [{ total_activities: 0, active_activities: 0, completed_activities: 0 }];
                        return [3 /*break*/, 9];
                    case 9:
                        stats = {
                            teacher: {
                                id: teacher.id,
                                name: teacher.teacher_name || '未知教师',
                                teacherNo: teacher.teacher_no,
                                position: teacher.position,
                                kindergartenName: teacher.kindergarten_name,
                                phone: teacher.phone,
                                email: teacher.email
                            },
                            "class": {
                                totalClasses: Number(((_a = classStats[0]) === null || _a === void 0 ? void 0 : _a.total_classes) || 0),
                                mainClasses: Number(((_b = classStats[0]) === null || _b === void 0 ? void 0 : _b.main_classes) || 0),
                                subjectsCount: Number(((_c = classStats[0]) === null || _c === void 0 ? void 0 : _c.subjects_count) || 0)
                            },
                            student: {
                                totalStudents: Number(((_d = studentStats[0]) === null || _d === void 0 ? void 0 : _d.total_students) || 0),
                                averageAge: Number(((_e = studentStats[0]) === null || _e === void 0 ? void 0 : _e.average_age) || 0),
                                classesWithStudents: Number(((_f = studentStats[0]) === null || _f === void 0 ? void 0 : _f.classes_with_students) || 0)
                            },
                            subjects: subjectStats.map(function (subject) { return ({
                                name: subject.subject,
                                classCount: Number(subject.class_count),
                                isMainTeacher: Number(subject.main_teacher_count) > 0
                            }); }),
                            activities: {
                                total: Number(((_g = activityStats[0]) === null || _g === void 0 ? void 0 : _g.total_activities) || 0),
                                active: Number(((_h = activityStats[0]) === null || _h === void 0 ? void 0 : _h.active_activities) || 0),
                                completed: Number(((_j = activityStats[0]) === null || _j === void 0 ? void 0 : _j.completed_activities) || 0)
                            }
                        };
                        apiResponse_1.ApiResponse.success(res, stats, '获取教师统计信息成功');
                        return [3 /*break*/, 11];
                    case 10:
                        error_8 = _k.sent();
                        console.error('获取教师统计信息错误:', error_8);
                        if (error_8 instanceof apiError_1.ApiError) {
                            throw error_8;
                        }
                        throw apiError_1.ApiError.serverError('获取教师统计信息失败', 'TEACHER_STATS_ERROR');
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取全局教师统计信息
     * @param req 请求对象
     * @param res 响应对象
     */
    TeacherController.prototype.globalStats = function (req, res) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        return __awaiter(this, void 0, void 0, function () {
            var teacherStatsQuery, teacherStats, positionStatsQuery, positionStats, classStatsQuery, classStats, stats, error_9;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 4, , 5]);
                        teacherStatsQuery = "\n        SELECT \n          COUNT(*) as total,\n          SUM(CASE WHEN t.status = 1 THEN 1 ELSE 0 END) as active,\n          SUM(CASE WHEN t.status = 0 THEN 1 ELSE 0 END) as inactive,\n          COUNT(DISTINCT t.kindergarten_id) as kindergartens,\n          COUNT(DISTINCT t.position) as positions\n        FROM teachers t\n        WHERE t.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(teacherStatsQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        teacherStats = _j.sent();
                        positionStatsQuery = "\n        SELECT \n          t.position,\n          COUNT(*) as count\n        FROM teachers t\n        WHERE t.deleted_at IS NULL AND t.position IS NOT NULL\n        GROUP BY t.position\n        ORDER BY count DESC\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(positionStatsQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        positionStats = _j.sent();
                        classStatsQuery = "\n        SELECT \n          COUNT(DISTINCT ct.teacher_id) as teachers_with_classes,\n          COUNT(DISTINCT ct.class_id) as total_class_assignments,\n          AVG(teacher_class_count.class_count) as avg_classes_per_teacher\n        FROM class_teachers ct\n        LEFT JOIN (\n          SELECT teacher_id, COUNT(*) as class_count\n          FROM class_teachers\n          WHERE deleted_at IS NULL\n          GROUP BY teacher_id\n        ) teacher_class_count ON ct.teacher_id = teacher_class_count.teacher_id\n        WHERE ct.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(classStatsQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        classStats = _j.sent();
                        stats = {
                            total: Number(((_a = teacherStats[0]) === null || _a === void 0 ? void 0 : _a.total) || 0),
                            active: Number(((_b = teacherStats[0]) === null || _b === void 0 ? void 0 : _b.active) || 0),
                            inactive: Number(((_c = teacherStats[0]) === null || _c === void 0 ? void 0 : _c.inactive) || 0),
                            kindergartens: Number(((_d = teacherStats[0]) === null || _d === void 0 ? void 0 : _d.kindergartens) || 0),
                            positions: Number(((_e = teacherStats[0]) === null || _e === void 0 ? void 0 : _e.positions) || 0),
                            positionDistribution: positionStats || [],
                            classAssignments: {
                                teachersWithClasses: Number(((_f = classStats[0]) === null || _f === void 0 ? void 0 : _f.teachers_with_classes) || 0),
                                totalAssignments: Number(((_g = classStats[0]) === null || _g === void 0 ? void 0 : _g.total_class_assignments) || 0),
                                avgClassesPerTeacher: Number(((_h = classStats[0]) === null || _h === void 0 ? void 0 : _h.avg_classes_per_teacher) || 0)
                            }
                        };
                        apiResponse_1.ApiResponse.success(res, stats, '获取教师统计信息成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_9 = _j.sent();
                        console.error('获取全局教师统计信息错误:', error_9);
                        if (error_9 instanceof apiError_1.ApiError) {
                            throw error_9;
                        }
                        throw apiResponse_1.ApiResponse.error(res, '获取教师统计信息失败', 'INTERNAL_ERROR', 500);
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    return TeacherController;
}());
exports.TeacherController = TeacherController;
exports.teacherController = new TeacherController();
