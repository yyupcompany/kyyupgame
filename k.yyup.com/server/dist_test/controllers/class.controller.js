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
exports.ClassController = void 0;
var index_1 = require("../models/index");
var apiError_1 = require("../utils/apiError");
var apiResponse_1 = require("../utils/apiResponse");
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var data_formatter_1 = require("../utils/data-formatter");
var sqlHelper_1 = require("../utils/sqlHelper");
/**
 * 班级控制器
 * 处理与班级相关的所有请求
 */
var ClassController = /** @class */ (function () {
    function ClassController() {
    }
    /**
     * 创建班级
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype.create = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, classData, userId_1, capacity, kindergartenExists, classExists, now, classCode, newClass, classId_1, teacherClassValues, teacherClassData, classQuery, classes, teachersQuery, teachers, classInfo, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 23, , 25]);
                        classData = req.body;
                        userId_1 = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!(!classData.name || !classData.kindergartenId)) return [3 /*break*/, 4];
                        return [4 /*yield*/, transaction.rollback()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '缺少必填字段', 'MISSING_REQUIRED_FIELDS', 400)];
                    case 4:
                        if (!(classData.capacity !== undefined)) return [3 /*break*/, 6];
                        capacity = Number(classData.capacity);
                        if (!(isNaN(capacity) || capacity < 1 || capacity > 50)) return [3 /*break*/, 6];
                        return [4 /*yield*/, transaction.rollback()];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级容量必须在1-50之间', 'INVALID_CAPACITY', 400)];
                    case 6:
                        if (!(classData.name && (typeof classData.name !== 'string' || classData.name.length > 50))) return [3 /*break*/, 8];
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级名称长度不能超过50字符', 'NAME_TOO_LONG', 400)];
                    case 8: return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('kindergartens', 'id', classData.kindergartenId, {
                            whereAddition: 'deleted_at IS NULL',
                            transaction: transaction
                        })];
                    case 9:
                        kindergartenExists = _b.sent();
                        if (!!kindergartenExists) return [3 /*break*/, 11];
                        return [4 /*yield*/, transaction.rollback()];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '幼儿园不存在', 'KINDERGARTEN_NOT_FOUND', 400)];
                    case 11: return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('classes', 'name', classData.name, {
                            whereAddition: 'kindergarten_id = :kindergartenId AND deleted_at IS NULL',
                            replacements: { kindergartenId: classData.kindergartenId },
                            transaction: transaction
                        })];
                    case 12:
                        classExists = _b.sent();
                        if (!classExists) return [3 /*break*/, 14];
                        return [4 /*yield*/, transaction.rollback()];
                    case 13:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级名称已存在', 'CLASS_NAME_EXISTS', 400)];
                    case 14:
                        now = new Date();
                        classCode = classData.code || "CLASS_".concat(Date.now());
                        return [4 /*yield*/, index_1.Class.create({
                                name: classData.name,
                                code: classCode,
                                kindergartenId: classData.kindergartenId,
                                type: classData.type || 1,
                                grade: classData.grade || null,
                                headTeacherId: classData.headTeacherId || classData.teacherId || null,
                                assistantTeacherId: classData.assistantTeacherId || null,
                                capacity: classData.capacity || 30,
                                currentStudentCount: 0,
                                classroom: classData.classroom || null,
                                description: classData.description || null,
                                imageUrl: classData.imageUrl || null,
                                status: classData.status || 1,
                                creatorId: userId_1 || null,
                                updaterId: userId_1 || null,
                                isSystem: 0
                            }, { transaction: transaction })];
                    case 15:
                        newClass = _b.sent();
                        classId_1 = newClass.id;
                        if (!(classData.teacherIds && classData.teacherIds.length > 0)) return [3 /*break*/, 17];
                        teacherClassValues = classData.teacherIds.map(function (teacherId, index) { return [
                            classId_1,
                            teacherId,
                            index === 0 ? 1 : 0,
                            null,
                            new Date().toISOString().split('T')[0],
                            null,
                            1,
                            null,
                            userId_1 || null,
                            userId_1 || null,
                            new Date(),
                            new Date() // updated_at
                        ]; });
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.batchInsert('class_teachers', ['class_id', 'teacher_id', 'is_main_teacher', 'subject', 'start_date', 'end_date', 'status', 'remark', 'creator_id', 'updater_id', 'created_at', 'updated_at'], teacherClassValues, transaction)];
                    case 16:
                        _b.sent();
                        return [3 /*break*/, 19];
                    case 17:
                        if (!classData.teacherId) return [3 /*break*/, 19];
                        teacherClassData = sqlHelper_1.SqlHelper.camelToSnake({
                            classId: classId_1,
                            teacherId: classData.teacherId,
                            isMainTeacher: 1,
                            subject: null,
                            startDate: new Date().toISOString().split('T')[0],
                            endDate: null,
                            status: 1,
                            remark: null,
                            creatorId: userId_1 || null,
                            updaterId: userId_1 || null
                        });
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.insert('class_teachers', teacherClassData, { transaction: transaction })];
                    case 18:
                        _b.sent();
                        _b.label = 19;
                    case 19:
                        classQuery = "\n        SELECT \n          c.*, \n          k.name AS kindergarten_name\n        FROM classes c\n        JOIN kindergartens k ON c.kindergarten_id = k.id\n        WHERE c.id = :classId\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(classQuery, {
                                replacements: { classId: classId_1 },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 20:
                        classes = _b.sent();
                        teachersQuery = "\n        SELECT \n          ct.id, ct.teacher_id, ct.is_main_teacher, ct.subject,\n          u.real_name AS teacher_name, t.position, t.teacher_no\n        FROM class_teachers ct\n        JOIN teachers t ON ct.teacher_id = t.id\n        JOIN users u ON t.user_id = u.id\n        WHERE ct.class_id = :classId AND ct.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(teachersQuery, {
                                replacements: { classId: classId_1 },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 21:
                        teachers = _b.sent();
                        classInfo = null;
                        if (classes && classes.length > 0) {
                            classInfo = sqlHelper_1.SqlHelper.snakeToCamel(classes[0]);
                            classInfo.teachers = teachers.map(function (teacher) { return ({
                                id: teacher.id,
                                name: teacher.teacher_name,
                                position: teacher.position,
                                teacherNo: teacher.teacher_no,
                                isMainTeacher: teacher.is_main_teacher === 1,
                                subject: teacher.subject
                            }); });
                        }
                        return [4 /*yield*/, transaction.commit()];
                    case 22:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, classInfo, '创建班级成功')];
                    case 23:
                        error_1 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 24:
                        _b.sent();
                        console.error('创建班级详细错误:', {
                            message: error_1 === null || error_1 === void 0 ? void 0 : error_1.message,
                            name: error_1 === null || error_1 === void 0 ? void 0 : error_1.name,
                            sql: error_1 === null || error_1 === void 0 ? void 0 : error_1.sql,
                            parameters: error_1 === null || error_1 === void 0 ? void 0 : error_1.parameters,
                            stack: error_1 === null || error_1 === void 0 ? void 0 : error_1.stack
                        });
                        // 返回更具体的错误信息
                        if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.name) === 'SequelizeUniqueConstraintError') {
                            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级代码已存在', 'CLASS_CODE_EXISTS', 400)];
                        }
                        if ((error_1 === null || error_1 === void 0 ? void 0 : error_1.name) === 'SequelizeForeignKeyConstraintError') {
                            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '关联数据不存在', 'FOREIGN_KEY_ERROR', 400)];
                        }
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u521B\u5EFA\u73ED\u7EA7\u5931\u8D25: ".concat((error_1 === null || error_1 === void 0 ? void 0 : error_1.message) || '未知错误'), 'CLASS_CREATE_ERROR', 500)];
                    case 25: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级列表
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype.list = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, keyword, kindergartenId, status_1, pageNum, pageSizeNum, offset, limit, whereClause, replacements, user, statusStr, statusNum, statusMap, lowerStatus, countResult, rows, rowsArray, formattedClasses, total, totalPages, error_2;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        console.log('=== 班级列表查询开始 ===');
                        console.log('查询参数:', req.query);
                        console.log('用户信息:', req.user);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, keyword = _a.keyword, kindergartenId = _a.kindergartenId, status_1 = _a.status;
                        pageNum = Math.max(1, Number(page) || 1);
                        pageSizeNum = Math.max(1, Math.min(100, Number(pageSize) || 10));
                        offset = Math.max(0, (pageNum - 1) * pageSizeNum);
                        limit = pageSizeNum;
                        whereClause = 'c.deleted_at IS NULL';
                        replacements = { limit: limit, offset: offset };
                        user = req.user;
                        console.log('用户权限信息:', {
                            isAdmin: user.isAdmin,
                            role: user.role,
                            kindergartenId: user.kindergartenId
                        });
                        // 如果不是超级管理员且指定了幼儿园，则过滤
                        if (!user.isAdmin && user.kindergartenId) {
                            whereClause += ' AND c.kindergarten_id = :userKindergartenId';
                            replacements.userKindergartenId = user.kindergartenId;
                            console.log('添加用户幼儿园过滤:', user.kindergartenId);
                        }
                        else {
                            console.log('超级管理员，可以查看所有班级');
                        }
                        if (keyword) {
                            whereClause += ' AND c.name LIKE :keyword';
                            replacements.keyword = "%".concat(String(keyword), "%");
                        }
                        if (kindergartenId && !isNaN(Number(kindergartenId))) {
                            whereClause += ' AND c.kindergarten_id = :kindergartenId';
                            replacements.kindergartenId = Number(kindergartenId);
                        }
                        if (status_1 !== undefined && status_1 !== null && status_1 !== '') {
                            statusStr = String(status_1).trim();
                            statusNum = Number(statusStr);
                            if (!isNaN(statusNum) && isFinite(statusNum)) {
                                // 有效的数字状态
                                whereClause += ' AND c.status = :status';
                                replacements.status = statusNum;
                            }
                            else if (typeof statusStr === 'string' && statusStr.length > 0) {
                                statusMap = {
                                    'active': 1,
                                    'inactive': 0,
                                    'disabled': 2
                                };
                                lowerStatus = statusStr.toLowerCase();
                                if (statusMap.hasOwnProperty(lowerStatus)) {
                                    whereClause += ' AND c.status = :status';
                                    replacements.status = statusMap[lowerStatus];
                                }
                                // 如果是无效的字符串状态，忽略该参数，不添加到查询条件中
                            }
                            // 如果status参数无效，忽略该参数，不添加到查询条件中
                        }
                        // 获取总数
                        console.log('执行总数查询:', "SELECT COUNT(*) as total FROM classes c WHERE ".concat(whereClause));
                        console.log('查询参数:', replacements);
                        return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as total FROM classes c WHERE ".concat(whereClause), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResult = _d.sent();
                        console.log('总数查询结果:', countResult);
                        // 查询班级列表
                        console.log('执行列表查询:', "SELECT c.id, c.name, c.code FROM classes c WHERE ".concat(whereClause, " ORDER BY c.created_at DESC LIMIT ").concat(limit, " OFFSET ").concat(offset));
                        return [4 /*yield*/, init_1.sequelize.query("SELECT \n          c.id, c.name, c.code, c.kindergarten_id, k.name as kindergarten_name,\n          c.type, c.grade, c.head_teacher_id, htu.real_name as head_teacher_name,\n          c.assistant_teacher_id, atu.real_name as assistant_teacher_name,\n          c.capacity, c.current_student_count, c.classroom,\n          c.description, c.image_url, c.status, c.created_at, c.updated_at\n        FROM \n          classes c\n          LEFT JOIN kindergartens k ON c.kindergarten_id = k.id\n          LEFT JOIN teachers ht ON c.head_teacher_id = ht.id\n          LEFT JOIN users htu ON ht.user_id = htu.id\n          LEFT JOIN teachers at ON c.assistant_teacher_id = at.id\n          LEFT JOIN users atu ON at.user_id = atu.id\n        WHERE \n          ".concat(whereClause, "\n        ORDER BY \n          c.created_at DESC\n        LIMIT :limit OFFSET :offset"), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        rows = _d.sent();
                        console.log('=== 列表查询结果 ===');
                        console.log('rows:', rows);
                        console.log('类型:', typeof rows, 'isArray:', Array.isArray(rows));
                        console.log('长度:', Array.isArray(rows) ? rows.length : 'N/A');
                        rowsArray = Array.isArray(rows) ? rows : (Array.isArray(rows[0]) ? rows[0] : []);
                        formattedClasses = rowsArray.map(function (row) { return ({
                            id: row.id,
                            name: row.name,
                            code: row.code,
                            kindergartenId: row.kindergarten_id,
                            kindergarten: {
                                id: row.kindergarten_id,
                                name: row.kindergarten_name
                            },
                            type: row.type,
                            grade: row.grade,
                            headTeacherId: row.head_teacher_id,
                            assistantTeacherId: row.assistant_teacher_id,
                            capacity: row.capacity,
                            currentStudentCount: row.current_student_count,
                            classroom: row.classroom,
                            description: row.description,
                            imageUrl: row.image_url,
                            status: row.status,
                            createdAt: row.created_at,
                            updatedAt: row.updated_at
                        }); });
                        total = Array.isArray(countResult) && countResult.length > 0 ? countResult[0].total : 0;
                        totalPages = Math.ceil(total / limit);
                        // 临时调试：直接返回原始数据
                        if (req.query.debug === '1') {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                                    debug: true,
                                    whereClause: whereClause,
                                    replacements: replacements,
                                    countResult: countResult,
                                    rawRows: rows,
                                    rowsLength: Array.isArray(rows) ? rows.length : 0,
                                    rowsType: typeof rows,
                                    isArray: Array.isArray(rows),
                                    firstRow: Array.isArray(rows) ? rows[0] || null : null,
                                    rowsStructure: rows,
                                    rowsArrayLength: rowsArray.length,
                                    rowsArrayType: typeof rowsArray,
                                    formattedLength: formattedClasses.length
                                }, '调试信息')];
                        }
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                                items: formattedClasses,
                                total: total,
                                page: Number(page),
                                pageSize: limit,
                                totalPages: totalPages
                            }, '获取班级列表成功')];
                    case 3:
                        error_2 = _d.sent();
                        console.error('班级列表查询错误:', error_2);
                        return [2 /*return*/, apiResponse_1.ApiResponse.handleError(res, error_2, '获取班级列表失败')];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级详情
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype.detail = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, classId, classResults, classInfo, students, teachers, classDetail, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        id = req.params.id;
                        classId = parseInt(id);
                        if (!classId || isNaN(classId) || classId <= 0) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '无效的班级ID', 'INVALID_CLASS_ID', 400)];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT \n          c.*,\n          k.name AS kindergarten_name\n        FROM classes c\n        LEFT JOIN kindergartens k ON c.kindergarten_id = k.id\n        WHERE c.id = :id AND c.deleted_at IS NULL", {
                                replacements: { id: classId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        classResults = _a.sent();
                        if (classResults.length === 0) {
                            throw apiError_1.ApiError.notFound('班级不存在', 'CLASS_NOT_FOUND');
                        }
                        classInfo = classResults[0];
                        if (!classInfo) {
                            throw apiError_1.ApiError.notFound('班级不存在', 'CLASS_NOT_FOUND');
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT \n          s.id, s.name, s.student_no AS studentNo, \n          s.birth_date as birthday, s.gender, s.status\n        FROM students s\n        WHERE s.class_id = :classId AND s.deleted_at IS NULL", {
                                replacements: { classId: classId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        students = _a.sent();
                        return [4 /*yield*/, init_1.sequelize.query("SELECT \n          t.id, u.real_name as name, t.position, t.teacher_no AS teacherNo,\n          ct.is_main_teacher AS isMainTeacher, ct.subject\n        FROM teachers t\n        JOIN class_teachers ct ON t.id = ct.teacher_id\n        JOIN users u ON t.user_id = u.id\n        WHERE ct.class_id = :classId AND ct.deleted_at IS NULL AND t.deleted_at IS NULL", {
                                replacements: { classId: classId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        teachers = _a.sent();
                        classDetail = {
                            id: classInfo.id,
                            name: classInfo.name,
                            code: classInfo.code,
                            kindergartenId: classInfo.kindergarten_id,
                            kindergarten: {
                                id: classInfo.kindergarten_id,
                                name: classInfo.kindergarten_name
                            },
                            type: classInfo.type,
                            grade: classInfo.grade,
                            headTeacherId: classInfo.head_teacher_id,
                            assistantTeacherId: classInfo.assistant_teacher_id,
                            capacity: classInfo.capacity,
                            currentStudentCount: classInfo.current_student_count,
                            classroom: classInfo.classroom,
                            description: classInfo.description,
                            imageUrl: classInfo.image_url,
                            status: classInfo.status,
                            students: students,
                            teachers: teachers.map(function (teacher) { return ({
                                id: teacher.id,
                                name: teacher.name,
                                position: teacher.position,
                                teacherNo: teacher.teacherNo,
                                isMainTeacher: teacher.isMainTeacher === 1,
                                subject: teacher.subject
                            }); }),
                            createdAt: classInfo.created_at,
                            updatedAt: classInfo.updated_at
                        };
                        apiResponse_1.ApiResponse.success(res, classDetail, '获取班级详情成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_3 = _a.sent();
                        if (error_3 instanceof apiError_1.ApiError) {
                            throw error_3;
                        }
                        throw apiError_1.ApiError.serverError('获取班级详情失败', 'CLASS_DETAIL_ERROR');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新班级信息
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype.update = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, id_1, updateData, userId_2, classId, classResults, classInfoArray, classInfo, existingClasses, kindergartens, updateFields, replacements, teacherValues, updatedClass, classTeachers, updatedClassArray, classData, formattedClass, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 26, , 28]);
                        id_1 = req.params.id;
                        updateData = req.body;
                        userId_2 = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        classId = parseInt(id_1);
                        if (!(!classId || isNaN(classId) || classId <= 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, transaction.rollback()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '无效的班级ID', 'INVALID_CLASS_ID', 400)];
                    case 4: return [4 /*yield*/, init_1.sequelize.query("SELECT * FROM classes WHERE id = :id AND deleted_at IS NULL", {
                            replacements: { id: classId },
                            type: sequelize_1.QueryTypes.SELECT,
                            transaction: transaction
                        })];
                    case 5:
                        classResults = _b.sent();
                        if (!(classResults.length === 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, transaction.rollback()];
                    case 6:
                        _b.sent();
                        throw apiError_1.ApiError.notFound('班级不存在', 'CLASS_NOT_FOUND');
                    case 7:
                        classInfoArray = classResults;
                        classInfo = classInfoArray[0];
                        if (!!classInfo) return [3 /*break*/, 9];
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _b.sent();
                        throw apiError_1.ApiError.notFound('班级不存在', 'CLASS_NOT_FOUND');
                    case 9:
                        if (!(updateData.name && updateData.name !== classInfo.name)) return [3 /*break*/, 12];
                        return [4 /*yield*/, init_1.sequelize.query("SELECT id FROM classes \n           WHERE name = :name \n           AND kindergarten_id = :kindergartenId \n           AND id != :id \n           AND deleted_at IS NULL", {
                                replacements: {
                                    name: updateData.name,
                                    kindergartenId: updateData.kindergartenId || classInfo.kindergarten_id,
                                    id: id_1
                                },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 10:
                        existingClasses = _b.sent();
                        if (!(Array.isArray(existingClasses) && existingClasses.length > 0)) return [3 /*break*/, 12];
                        return [4 /*yield*/, transaction.rollback()];
                    case 11:
                        _b.sent();
                        throw apiError_1.ApiError.badRequest('班级名称已存在', 'CLASS_NAME_EXISTS');
                    case 12:
                        if (!(updateData.kindergartenId && updateData.kindergartenId !== classInfo.kindergarten_id)) return [3 /*break*/, 15];
                        return [4 /*yield*/, init_1.sequelize.query("SELECT id FROM kindergartens WHERE id = :kindergartenId AND deleted_at IS NULL", {
                                replacements: { kindergartenId: updateData.kindergartenId },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 13:
                        kindergartens = _b.sent();
                        if (!(!Array.isArray(kindergartens) || kindergartens.length === 0)) return [3 /*break*/, 15];
                        return [4 /*yield*/, transaction.rollback()];
                    case 14:
                        _b.sent();
                        throw apiError_1.ApiError.badRequest('幼儿园不存在', 'KINDERGARTEN_NOT_FOUND');
                    case 15:
                        updateFields = [];
                        replacements = { id: classId, updatedBy: userId_2 };
                        if (updateData.name !== undefined) {
                            updateFields.push('name = :name');
                            replacements.name = updateData.name;
                        }
                        if (updateData.code !== undefined) {
                            updateFields.push('code = :code');
                            replacements.code = updateData.code;
                        }
                        if (updateData.kindergartenId !== undefined) {
                            updateFields.push('kindergarten_id = :kindergartenId');
                            replacements.kindergartenId = updateData.kindergartenId;
                        }
                        if (updateData.type !== undefined) {
                            updateFields.push('type = :type');
                            replacements.type = updateData.type;
                        }
                        if (updateData.grade !== undefined) {
                            updateFields.push('grade = :grade');
                            replacements.grade = updateData.grade;
                        }
                        if (updateData.teacherId !== undefined) {
                            updateFields.push('head_teacher_id = :headTeacherId');
                            replacements.headTeacherId = updateData.teacherId;
                        }
                        if (updateData.headTeacherId !== undefined) {
                            updateFields.push('head_teacher_id = :headTeacherId');
                            replacements.headTeacherId = updateData.headTeacherId;
                        }
                        if (updateData.assistantTeacherId !== undefined) {
                            updateFields.push('assistant_teacher_id = :assistantTeacherId');
                            replacements.assistantTeacherId = updateData.assistantTeacherId;
                        }
                        if (updateData.capacity !== undefined) {
                            updateFields.push('capacity = :capacity');
                            replacements.capacity = updateData.capacity;
                        }
                        if (updateData.classroom !== undefined) {
                            updateFields.push('classroom = :classroom');
                            replacements.classroom = updateData.classroom;
                        }
                        if (updateData.description !== undefined) {
                            updateFields.push('description = :description');
                            replacements.description = updateData.description;
                        }
                        if (updateData.imageUrl !== undefined) {
                            updateFields.push('image_url = :imageUrl');
                            replacements.imageUrl = updateData.imageUrl;
                        }
                        if (updateData.status !== undefined) {
                            updateFields.push('status = :status');
                            replacements.status = updateData.status;
                        }
                        // 添加更新时间和更新人
                        updateFields.push('updated_at = NOW()');
                        updateFields.push('updater_id = :updatedBy');
                        if (!(updateFields.length > 0)) return [3 /*break*/, 17];
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE classes SET ".concat(updateFields.join(', '), " WHERE id = :id"), {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 16:
                        _b.sent();
                        _b.label = 17;
                    case 17:
                        if (!(updateData.teacherIds && updateData.teacherIds.length > 0)) return [3 /*break*/, 20];
                        // 先删除现有关联
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE class_teachers SET deleted_at = NOW() WHERE class_id = :classId AND deleted_at IS NULL", {
                                replacements: { classId: id_1 },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 18:
                        // 先删除现有关联
                        _b.sent();
                        teacherValues = updateData.teacherIds.map(function (teacherId, index) {
                            return "(".concat(id_1, ", ").concat(teacherId, ", ").concat(index === 0 ? 1 : 0, ", NULL, CURDATE(), NULL, 1, NULL, ").concat(userId_2 || 'NULL', ", ").concat(userId_2 || 'NULL', ", NOW(), NOW())");
                        }).join(',');
                        if (!teacherValues) return [3 /*break*/, 20];
                        return [4 /*yield*/, init_1.sequelize.query("INSERT INTO class_teachers (\n              class_id, teacher_id, is_main_teacher, subject, start_date, \n              end_date, status, remark, creator_id, updater_id, created_at, updated_at\n            ) VALUES ".concat(teacherValues), {
                                type: sequelize_1.QueryTypes.INSERT,
                                transaction: transaction
                            })];
                    case 19:
                        _b.sent();
                        _b.label = 20;
                    case 20: return [4 /*yield*/, init_1.sequelize.query("SELECT \n          c.*, \n          k.name AS kindergarten_name\n        FROM classes c\n        JOIN kindergartens k ON c.kindergarten_id = k.id\n        WHERE c.id = :id", {
                            replacements: { id: id_1 },
                            type: sequelize_1.QueryTypes.SELECT,
                            transaction: transaction
                        })];
                    case 21:
                        updatedClass = _b.sent();
                        return [4 /*yield*/, init_1.sequelize.query("SELECT \n          ct.id, ct.teacher_id, ct.is_main_teacher, ct.subject,\n          u.real_name AS teacher_name, t.position, t.teacher_no\n        FROM class_teachers ct\n        JOIN teachers t ON ct.teacher_id = t.id\n        JOIN users u ON t.user_id = u.id\n        WHERE ct.class_id = :classId AND ct.deleted_at IS NULL", {
                                replacements: { classId: id_1 },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 22:
                        classTeachers = _b.sent();
                        updatedClassArray = Array.isArray(updatedClass) ? updatedClass : [];
                        classData = updatedClassArray.length > 0 ? updatedClassArray[0] : null;
                        if (!!classData) return [3 /*break*/, 24];
                        return [4 /*yield*/, transaction.rollback()];
                    case 23:
                        _b.sent();
                        throw apiError_1.ApiError.notFound('更新后的班级数据未找到', 'CLASS_NOT_FOUND');
                    case 24:
                        formattedClass = {
                            id: classData.id,
                            name: classData.name,
                            code: classData.code,
                            kindergartenId: classData.kindergarten_id,
                            kindergarten: {
                                id: classData.kindergarten_id,
                                name: classData.kindergarten_name
                            },
                            type: classData.type,
                            grade: classData.grade,
                            headTeacherId: classData.head_teacher_id,
                            assistantTeacherId: classData.assistant_teacher_id,
                            capacity: classData.capacity,
                            currentStudentCount: classData.current_student_count,
                            classroom: classData.classroom,
                            description: classData.description,
                            imageUrl: classData.image_url,
                            status: classData.status,
                            teachers: Array.isArray(classTeachers) ? classTeachers.map(function (teacher) { return ({
                                id: teacher.teacher_id,
                                name: teacher.teacher_name,
                                position: teacher.position,
                                teacherNo: teacher.teacher_no,
                                isMainTeacher: teacher.is_main_teacher === 1,
                                subject: teacher.subject
                            }); }) : [],
                            createdAt: classData.created_at,
                            updatedAt: classData.updated_at
                        };
                        return [4 /*yield*/, transaction.commit()];
                    case 25:
                        _b.sent();
                        apiResponse_1.ApiResponse.success(res, formattedClass, '更新班级信息成功');
                        return [3 /*break*/, 28];
                    case 26:
                        error_4 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 27:
                        _b.sent();
                        console.error('更新班级错误:', error_4);
                        if (error_4 instanceof apiError_1.ApiError) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, error_4.message, error_4.code, error_4.statusCode)];
                        }
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '更新班级信息失败', 'CLASS_UPDATE_ERROR', 500)];
                    case 28: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除班级
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype["delete"] = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, classId, classResults, transaction, studentResults, studentCountObj, teacherResults, teacherCountObj, error_5, rollbackError_1, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 18, , 19]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        classId = parseInt(id);
                        if (!classId || isNaN(classId) || classId <= 0) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '无效的班级ID', 'INVALID_CLASS_ID', 400)];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("SELECT id FROM classes WHERE id = :id AND deleted_at IS NULL", {
                                replacements: { id: classId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        classResults = _b.sent();
                        if (classResults.length === 0) {
                            res.status(404).json({
                                success: false,
                                message: '班级不存在'
                            });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 2:
                        transaction = _b.sent();
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 12, , 17]);
                        return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as count FROM students WHERE class_id = :classId AND deleted_at IS NULL", {
                                replacements: { classId: classId },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 4:
                        studentResults = _b.sent();
                        studentCountObj = studentResults[0];
                        if (!(studentCountObj.count > 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, transaction.rollback()];
                    case 5:
                        _b.sent();
                        res.status(400).json({
                            success: false,
                            message: '该班级有关联的学生，无法删除'
                        });
                        return [2 /*return*/];
                    case 6: return [4 /*yield*/, init_1.sequelize.query("SELECT COUNT(*) as count FROM class_teachers WHERE class_id = :classId AND deleted_at IS NULL", {
                            replacements: { classId: classId },
                            type: sequelize_1.QueryTypes.SELECT,
                            transaction: transaction
                        })];
                    case 7:
                        teacherResults = _b.sent();
                        teacherCountObj = teacherResults[0];
                        if (!(teacherCountObj.count > 0)) return [3 /*break*/, 9];
                        // 软删除班级与教师的关联关系
                        return [4 /*yield*/, init_1.sequelize.query("UPDATE class_teachers SET deleted_at = NOW(), updater_id = :userId WHERE class_id = :classId AND deleted_at IS NULL", {
                                replacements: { classId: classId, userId: userId || null },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 8:
                        // 软删除班级与教师的关联关系
                        _b.sent();
                        _b.label = 9;
                    case 9: 
                    // 软删除班级
                    return [4 /*yield*/, init_1.sequelize.query("UPDATE classes SET deleted_at = NOW(), updater_id = :userId WHERE id = :id", {
                            replacements: { id: classId, userId: userId || null },
                            type: sequelize_1.QueryTypes.UPDATE,
                            transaction: transaction
                        })];
                    case 10:
                        // 软删除班级
                        _b.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 11:
                        _b.sent();
                        apiResponse_1.ApiResponse.success(res, { message: '删除班级成功' });
                        return [3 /*break*/, 17];
                    case 12:
                        error_5 = _b.sent();
                        _b.label = 13;
                    case 13:
                        _b.trys.push([13, 15, , 16]);
                        return [4 /*yield*/, transaction.rollback()];
                    case 14:
                        _b.sent();
                        return [3 /*break*/, 16];
                    case 15:
                        rollbackError_1 = _b.sent();
                        console.log('事务回滚错误（可能已回滚）:', rollbackError_1);
                        return [3 /*break*/, 16];
                    case 16: throw error_5;
                    case 17: return [3 /*break*/, 19];
                    case 18:
                        error_6 = _b.sent();
                        console.error('删除班级失败:', error_6);
                        throw apiError_1.ApiError.serverError('删除班级失败', 'CLASS_DELETE_ERROR');
                    case 19: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级统计数据
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype.getStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var basicStats, typeStats, gradeStats, stats, statsData, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          COUNT(*) as total,\n          SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as active,\n          SUM(CASE WHEN status = 0 THEN 1 ELSE 0 END) as inactive,\n          SUM(current_student_count) as totalStudents,\n          SUM(capacity) as totalCapacity,\n          AVG(current_student_count) as avgStudentsPerClass\n        FROM classes \n        WHERE deleted_at IS NULL\n      ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        basicStats = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          type,\n          COUNT(*) as count\n        FROM classes \n        WHERE deleted_at IS NULL\n        GROUP BY type\n        ORDER BY type\n      ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        typeStats = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          grade,\n          COUNT(*) as count\n        FROM classes \n        WHERE deleted_at IS NULL AND grade IS NOT NULL\n        GROUP BY grade\n        ORDER BY grade\n      ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        gradeStats = (_a.sent())[0];
                        stats = Array.isArray(basicStats) ? basicStats[0] : basicStats;
                        statsData = stats;
                        apiResponse_1.ApiResponse.success(res, {
                            total: Number(statsData.total) || 0,
                            active: Number(statsData.active) || 0,
                            inactive: Number(statsData.inactive) || 0,
                            totalStudents: Number(statsData.totalStudents) || 0,
                            totalCapacity: Number(statsData.totalCapacity) || 0,
                            avgStudentsPerClass: Number(statsData.avgStudentsPerClass) || 0,
                            utilizationRate: statsData.totalCapacity > 0 ?
                                ((Number(statsData.totalStudents) / Number(statsData.totalCapacity)) * 100).toFixed(2) : '0.00',
                            byType: typeStats || [],
                            byGrade: gradeStats || []
                        }, '获取班级统计成功');
                        return [3 /*break*/, 5];
                    case 4:
                        error_7 = _a.sent();
                        console.error('获取班级统计失败:', error_7);
                        throw apiError_1.ApiError.serverError('获取班级统计失败', 'CLASS_STATS_ERROR');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级学生列表
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype.getStudents = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var classId, page, limit, offset, classExists, studentsQuery, countQuery, _b, students, countResult, total, formattedStudents, paginationData, error_8;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        classId = parseInt(req.params.id);
                        page = parseInt(req.query.page) || 1;
                        limit = parseInt(req.query.limit) || 10;
                        offset = (page - 1) * limit;
                        if (!classId || isNaN(classId)) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级ID无效', 'INVALID_CLASS_ID', 400)];
                        }
                        return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('classes', 'id', classId, {
                                whereAddition: 'deleted_at IS NULL'
                            })];
                    case 1:
                        classExists = _c.sent();
                        if (!classExists) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级不存在', 'CLASS_NOT_FOUND', 404)];
                        }
                        studentsQuery = "\n        SELECT \n          s.id,\n          s.student_no,\n          s.name,\n          s.gender,\n          s.birth_date,\n          s.enrollment_date,\n          s.status,\n          s.avatar_url,\n          p.name AS parent_name,\n          p.phone AS parent_phone\n        FROM students s\n        LEFT JOIN parent_student_relations psr ON s.id = psr.student_id AND psr.deleted_at IS NULL\n        LEFT JOIN parents p ON psr.parent_id = p.id AND p.deleted_at IS NULL\n        WHERE s.class_id = :classId AND s.deleted_at IS NULL\n        ORDER BY s.student_no ASC\n        LIMIT :limit OFFSET :offset\n      ";
                        countQuery = "\n        SELECT COUNT(*) as total\n        FROM students s\n        WHERE s.class_id = :classId AND s.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, Promise.all([
                                init_1.sequelize.query(studentsQuery, {
                                    replacements: { classId: classId, limit: limit, offset: offset },
                                    type: sequelize_1.QueryTypes.SELECT
                                }),
                                init_1.sequelize.query(countQuery, {
                                    replacements: { classId: classId },
                                    type: sequelize_1.QueryTypes.SELECT
                                })
                            ])];
                    case 2:
                        _b = _c.sent(), students = _b[0], countResult = _b[1];
                        total = ((_a = countResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
                        formattedStudents = students.map(function (student) { return sqlHelper_1.SqlHelper.snakeToCamel(student); });
                        paginationData = (0, data_formatter_1.formatPaginationResponse)(total, page, limit, formattedStudents);
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, paginationData, '获取班级学生列表成功')];
                    case 3:
                        error_8 = _c.sent();
                        console.error('获取班级学生列表错误:', error_8);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '获取班级学生列表失败', 'GET_CLASS_STUDENTS_ERROR', 500)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 向班级添加学生
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype.addStudent = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, classId, studentIds, userId, classInfo, currentClass, availableCapacity, studentsQuery, students, studentsWithClass, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 20, , 22]);
                        classId = parseInt(req.params.id);
                        studentIds = req.body.studentIds;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!(!classId || isNaN(classId))) return [3 /*break*/, 4];
                        return [4 /*yield*/, transaction.rollback()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级ID无效', 'INVALID_CLASS_ID', 400)];
                    case 4:
                        if (!(!studentIds || !Array.isArray(studentIds) || studentIds.length === 0)) return [3 /*break*/, 6];
                        return [4 /*yield*/, transaction.rollback()];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '学生ID列表不能为空', 'MISSING_STUDENT_IDS', 400)];
                    case 6: return [4 /*yield*/, init_1.sequelize.query('SELECT id, capacity, current_student_count FROM classes WHERE id = :classId AND deleted_at IS NULL', {
                            replacements: { classId: classId },
                            type: sequelize_1.QueryTypes.SELECT,
                            transaction: transaction
                        })];
                    case 7:
                        classInfo = _b.sent();
                        if (!(!classInfo || classInfo.length === 0)) return [3 /*break*/, 9];
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级不存在', 'CLASS_NOT_FOUND', 404)];
                    case 9:
                        currentClass = classInfo[0];
                        availableCapacity = currentClass.capacity - currentClass.current_student_count;
                        if (!(studentIds.length > availableCapacity)) return [3 /*break*/, 11];
                        return [4 /*yield*/, transaction.rollback()];
                    case 10:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, "\u73ED\u7EA7\u5BB9\u91CF\u4E0D\u8DB3\uFF0C\u6700\u591A\u8FD8\u80FD\u6DFB\u52A0 ".concat(availableCapacity, " \u540D\u5B66\u751F"), 'INSUFFICIENT_CAPACITY', 400)];
                    case 11:
                        studentsQuery = "\n        SELECT id, name, class_id \n        FROM students \n        WHERE id IN (".concat(studentIds.map(function () { return '?'; }).join(','), ") AND deleted_at IS NULL\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(studentsQuery, {
                                replacements: studentIds,
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 12:
                        students = _b.sent();
                        if (!(students.length !== studentIds.length)) return [3 /*break*/, 14];
                        return [4 /*yield*/, transaction.rollback()];
                    case 13:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '部分学生不存在', 'STUDENTS_NOT_FOUND', 400)];
                    case 14:
                        studentsWithClass = students.filter(function (s) { return s.class_id; });
                        if (!(studentsWithClass.length > 0)) return [3 /*break*/, 16];
                        return [4 /*yield*/, transaction.rollback()];
                    case 15:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '部分学生已分配班级', 'STUDENTS_ALREADY_ASSIGNED', 400)];
                    case 16: 
                    // 更新学生的班级信息
                    return [4 /*yield*/, init_1.sequelize.query("UPDATE students SET class_id = :classId, updater_id = :userId, updated_at = NOW() \n         WHERE id IN (".concat(studentIds.map(function () { return '?'; }).join(','), ")"), {
                            replacements: __spreadArray([classId, userId], studentIds, true),
                            type: sequelize_1.QueryTypes.UPDATE,
                            transaction: transaction
                        })];
                    case 17:
                        // 更新学生的班级信息
                        _b.sent();
                        // 更新班级的学生数量
                        return [4 /*yield*/, init_1.sequelize.query('UPDATE classes SET current_student_count = current_student_count + :count, updated_at = NOW() WHERE id = :classId', {
                                replacements: { count: studentIds.length, classId: classId },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 18:
                        // 更新班级的学生数量
                        _b.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 19:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { addedCount: studentIds.length }, '学生添加到班级成功')];
                    case 20:
                        error_9 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 21:
                        _b.sent();
                        console.error('添加学生到班级错误:', error_9);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '添加学生到班级失败', 'ADD_STUDENT_TO_CLASS_ERROR', 500)];
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 从班级移除学生
     * @param req 请求对象
     * @param res 响应对象
     */
    ClassController.prototype.removeStudent = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, classId, studentId, userId, classExists, studentQuery, students, student, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 18, , 20]);
                        classId = parseInt(req.params.id);
                        studentId = parseInt(req.params.studentId);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!(!classId || isNaN(classId))) return [3 /*break*/, 4];
                        return [4 /*yield*/, transaction.rollback()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级ID无效', 'INVALID_CLASS_ID', 400)];
                    case 4:
                        if (!(!studentId || isNaN(studentId))) return [3 /*break*/, 6];
                        return [4 /*yield*/, transaction.rollback()];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '学生ID无效', 'INVALID_STUDENT_ID', 400)];
                    case 6: return [4 /*yield*/, sqlHelper_1.SqlHelper.recordExists('classes', 'id', classId, {
                            whereAddition: 'deleted_at IS NULL',
                            transaction: transaction
                        })];
                    case 7:
                        classExists = _b.sent();
                        if (!!classExists) return [3 /*break*/, 9];
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '班级不存在', 'CLASS_NOT_FOUND', 404)];
                    case 9:
                        studentQuery = "\n        SELECT id, name, class_id \n        FROM students \n        WHERE id = :studentId AND deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(studentQuery, {
                                replacements: { studentId: studentId },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 10:
                        students = _b.sent();
                        if (!(!students || students.length === 0)) return [3 /*break*/, 12];
                        return [4 /*yield*/, transaction.rollback()];
                    case 11:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '学生不存在', 'STUDENT_NOT_FOUND', 404)];
                    case 12:
                        student = students[0];
                        if (!(student.class_id !== classId)) return [3 /*break*/, 14];
                        return [4 /*yield*/, transaction.rollback()];
                    case 13:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '学生不在该班级中', 'STUDENT_NOT_IN_CLASS', 400)];
                    case 14: 
                    // 从班级中移除学生
                    return [4 /*yield*/, init_1.sequelize.query('UPDATE students SET class_id = NULL, updater_id = :userId, updated_at = NOW() WHERE id = :studentId', {
                            replacements: { studentId: studentId, userId: userId },
                            type: sequelize_1.QueryTypes.UPDATE,
                            transaction: transaction
                        })];
                    case 15:
                        // 从班级中移除学生
                        _b.sent();
                        // 更新班级的学生数量
                        return [4 /*yield*/, init_1.sequelize.query('UPDATE classes SET current_student_count = current_student_count - 1, updated_at = NOW() WHERE id = :classId', {
                                replacements: { classId: classId },
                                type: sequelize_1.QueryTypes.UPDATE,
                                transaction: transaction
                            })];
                    case 16:
                        // 更新班级的学生数量
                        _b.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 17:
                        _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, { studentName: student.name }, '学生从班级移除成功')];
                    case 18:
                        error_10 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 19:
                        _b.sent();
                        console.error('从班级移除学生错误:', error_10);
                        return [2 /*return*/, apiResponse_1.ApiResponse.error(res, '从班级移除学生失败', 'REMOVE_STUDENT_FROM_CLASS_ERROR', 500)];
                    case 20: return [2 /*return*/];
                }
            });
        });
    };
    return ClassController;
}());
exports.ClassController = ClassController;
