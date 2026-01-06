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
exports.personnelCenterController = void 0;
var sequelize_1 = require("sequelize");
var teacher_model_1 = require("../models/teacher.model");
var class_teacher_model_1 = require("../models/class-teacher.model");
var class_model_1 = require("../models/class.model");
var student_model_1 = require("../models/student.model");
var parent_model_1 = require("../models/parent.model");
var user_model_1 = require("../models/user.model");
// 控制器
exports.personnelCenterController = {
    // 获取当前用户的教师信息
    getCurrentTeacher: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, teacher_model_1.Teacher.findOne({
                        where: { userId: userId },
                        raw: true // 返回普通对象而不是模型实例
                    })];
                case 1: return [2 /*return*/, _a.sent()];
            }
        });
    }); },
    // 获取教师相关的班级ID列表
    getTeacherClassIds: function (teacherId) { return __awaiter(void 0, void 0, void 0, function () {
        var classTeachers, headClasses, classIds;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, class_teacher_model_1.ClassTeacher.findAll({
                        where: { teacherId: teacherId },
                        attributes: ['classId']
                    })];
                case 1:
                    classTeachers = _b.sent();
                    return [4 /*yield*/, class_model_1.Class.findAll({
                            where: (_a = {},
                                _a[sequelize_1.Op.or] = [
                                    { headTeacherId: teacherId },
                                    { assistantTeacherId: teacherId }
                                ],
                                _a),
                            attributes: ['id']
                        })];
                case 2:
                    headClasses = _b.sent();
                    classIds = new Set(__spreadArray(__spreadArray([], classTeachers.map(function (ct) { return ct.classId; }), true), headClasses.map(function (c) { return c.id; }), true));
                    return [2 /*return*/, Array.from(classIds)];
            }
        });
    }); },
    // 获取概览数据
    getOverview: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, userRole, studentsCount, parentsCount, teachersCount, classesCount, teacher, classIds, students, studentIds, _a, stats, error_1;
        var _b, _c, _d;
        var _e, _f;
        return __generator(this, function (_g) {
            switch (_g.label) {
                case 0:
                    _g.trys.push([0, 18, , 19]);
                    userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e.id;
                    userRole = (_f = req.user) === null || _f === void 0 ? void 0 : _f.role;
                    studentsCount = void 0, parentsCount = void 0, teachersCount = void 0, classesCount = void 0;
                    if (!(userRole === 'teacher' && userId)) return [3 /*break*/, 12];
                    console.log('[概览API] 检测到教师角色，用户ID:', userId);
                    return [4 /*yield*/, exports.personnelCenterController.getCurrentTeacher(userId)];
                case 1:
                    teacher = _g.sent();
                    console.log('[概览API] 查找到的教师信息:', teacher);
                    if (!teacher) return [3 /*break*/, 10];
                    return [4 /*yield*/, exports.personnelCenterController.getTeacherClassIds(teacher.id)];
                case 2:
                    classIds = _g.sent();
                    console.log('[概览API] 教师相关班级ID:', classIds);
                    return [4 /*yield*/, student_model_1.Student.count({
                            where: classIds.length > 0 ? { classId: (_b = {}, _b[sequelize_1.Op["in"]] = classIds, _b) } : { id: -1 }
                        })];
                case 3:
                    // 只统计教师相关班级的学生
                    studentsCount = _g.sent();
                    if (!(classIds.length > 0)) return [3 /*break*/, 8];
                    return [4 /*yield*/, student_model_1.Student.findAll({
                            where: { classId: (_c = {}, _c[sequelize_1.Op["in"]] = classIds, _c) },
                            attributes: ['id']
                        })];
                case 4:
                    students = _g.sent();
                    studentIds = students.map(function (s) { return s.id; });
                    if (!(studentIds.length > 0)) return [3 /*break*/, 6];
                    return [4 /*yield*/, parent_model_1.Parent.count({
                            where: { studentId: (_d = {}, _d[sequelize_1.Op["in"]] = studentIds, _d) }
                        })];
                case 5:
                    _a = _g.sent();
                    return [3 /*break*/, 7];
                case 6:
                    _a = 0;
                    _g.label = 7;
                case 7:
                    parentsCount = _a;
                    return [3 /*break*/, 9];
                case 8:
                    parentsCount = 0;
                    _g.label = 9;
                case 9:
                    // 教师只能看到自己
                    teachersCount = 1;
                    // 只统计相关班级
                    classesCount = classIds.length;
                    return [3 /*break*/, 11];
                case 10:
                    // 如果找不到教师记录，返回0
                    studentsCount = parentsCount = teachersCount = classesCount = 0;
                    _g.label = 11;
                case 11: return [3 /*break*/, 17];
                case 12: return [4 /*yield*/, student_model_1.Student.count()];
                case 13:
                    // 管理员或其他角色，显示全部数据
                    studentsCount = _g.sent();
                    return [4 /*yield*/, parent_model_1.Parent.count()];
                case 14:
                    parentsCount = _g.sent();
                    return [4 /*yield*/, teacher_model_1.Teacher.count()];
                case 15:
                    teachersCount = _g.sent();
                    return [4 /*yield*/, class_model_1.Class.count()];
                case 16:
                    classesCount = _g.sent();
                    _g.label = 17;
                case 17:
                    stats = [
                        { key: 'students', title: '在校学生', value: studentsCount, unit: '人', trend: 12, trendText: '较上月', type: 'primary', icon: 'User' },
                        { key: 'parents', title: '注册家长', value: parentsCount, unit: '人', trend: 8, trendText: '较上月', type: 'success', icon: 'UserFilled' },
                        { key: 'teachers', title: '在职教师', value: teachersCount, unit: '人', trend: 2, trendText: '较上月', type: 'warning', icon: 'Avatar' },
                        { key: 'classes', title: '开设班级', value: classesCount, unit: '个', trend: 1, trendText: '较上月', type: 'info', icon: 'School' }
                    ];
                    res.json({
                        success: true,
                        data: { stats: stats },
                        message: '获取概览数据成功'
                    });
                    return [3 /*break*/, 19];
                case 18:
                    error_1 = _g.sent();
                    console.error('获取概览数据失败:', error_1);
                    res.status(500).json({
                        success: false,
                        message: '获取概览数据失败',
                        error: error_1 instanceof Error ? error_1.message : String(error_1)
                    });
                    return [3 /*break*/, 19];
                case 19: return [2 /*return*/];
            }
        });
    }); },
    // 获取人员分布统计
    getPersonnelDistribution: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var chartData;
        return __generator(this, function (_a) {
            try {
                chartData = {
                    title: { text: '人员分布统计' },
                    tooltip: { trigger: 'item' },
                    legend: { orient: 'vertical', left: 'left' },
                    series: [{
                            name: '人员分布',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: 456, name: '学生' },
                                { value: 328, name: '家长' },
                                { value: 45, name: '教师' },
                                { value: 18, name: '班级' }
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }]
                };
                res.json({
                    success: true,
                    data: chartData,
                    message: '获取人员分布统计成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '获取人员分布统计失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 获取人员趋势统计
    getPersonnelTrend: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var months, chartData;
        return __generator(this, function (_a) {
            try {
                months = ['1月', '2月', '3月', '4月', '5月', '6月'];
                chartData = {
                    title: { text: '人员增长趋势' },
                    tooltip: { trigger: 'axis' },
                    legend: { data: ['学生', '家长', '教师'] },
                    xAxis: {
                        type: 'category',
                        data: months
                    },
                    yAxis: { type: 'value' },
                    series: [
                        {
                            name: '学生',
                            type: 'line',
                            data: [420, 432, 441, 450, 456, 456]
                        },
                        {
                            name: '家长',
                            type: 'line',
                            data: [300, 310, 315, 320, 325, 328]
                        },
                        {
                            name: '教师',
                            type: 'line',
                            data: [40, 42, 43, 44, 45, 45]
                        }
                    ]
                };
                res.json({
                    success: true,
                    data: chartData,
                    message: '获取人员趋势统计成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '获取人员趋势统计失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 获取学生列表
    getStudents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, page, _c, pageSize, _d, keyword, _e, classId, _f, status_1, userId, userRole, whereConditions, teacher, teacherId, classIds, teacher, classIds, _g, count, rows, formattedStudents, error_2;
        var _h, _j, _k;
        var _l, _m;
        return __generator(this, function (_o) {
            switch (_o.label) {
                case 0:
                    _o.trys.push([0, 11, , 12]);
                    _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, _d = _a.keyword, keyword = _d === void 0 ? '' : _d, _e = _a.classId, classId = _e === void 0 ? '' : _e, _f = _a.status, status_1 = _f === void 0 ? '' : _f;
                    userId = (_l = req.user) === null || _l === void 0 ? void 0 : _l.id;
                    userRole = (_m = req.user) === null || _m === void 0 ? void 0 : _m.role;
                    console.log('[学生API] 用户信息调试:', {
                        userId: userId,
                        userRole: userRole,
                        user: req.user
                    });
                    whereConditions = {};
                    if (!(userRole === 'teacher' && userId)) return [3 /*break*/, 4];
                    console.log('[学生API] 检测到教师角色，用户ID:', userId);
                    return [4 /*yield*/, exports.personnelCenterController.getCurrentTeacher(userId)];
                case 1:
                    teacher = _o.sent();
                    console.log('[学生API] 查找到的教师信息:', teacher);
                    if (!teacher) return [3 /*break*/, 3];
                    teacherId = teacher.id;
                    console.log('[学生API] 使用教师ID:', teacherId, '类型:', typeof teacherId);
                    if (!teacherId) {
                        throw new Error('无法获取教师ID');
                    }
                    return [4 /*yield*/, exports.personnelCenterController.getTeacherClassIds(teacherId)];
                case 2:
                    classIds = _o.sent();
                    console.log('[学生API] 教师相关班级ID:', classIds);
                    if (classIds.length > 0) {
                        whereConditions.classId = (_h = {}, _h[sequelize_1.Op["in"]] = classIds, _h);
                    }
                    else {
                        // 如果教师没有任教班级，返回空结果
                        whereConditions.id = -1;
                    }
                    return [3 /*break*/, 4];
                case 3:
                    // 如果找不到教师记录，返回空结果
                    whereConditions.id = -1;
                    _o.label = 4;
                case 4:
                    if (keyword) {
                        whereConditions[sequelize_1.Op.or] = [
                            { name: (_j = {}, _j[sequelize_1.Op.like] = "%".concat(keyword, "%"), _j) },
                            { studentNo: (_k = {}, _k[sequelize_1.Op.like] = "%".concat(keyword, "%"), _k) }
                        ];
                    }
                    if (!classId) return [3 /*break*/, 9];
                    if (!(userRole === 'teacher' && userId)) return [3 /*break*/, 8];
                    return [4 /*yield*/, exports.personnelCenterController.getCurrentTeacher(userId)];
                case 5:
                    teacher = _o.sent();
                    if (!teacher) return [3 /*break*/, 7];
                    return [4 /*yield*/, exports.personnelCenterController.getTeacherClassIds(teacher.id)];
                case 6:
                    classIds = _o.sent();
                    if (classIds.includes(Number(classId))) {
                        whereConditions.classId = classId;
                    }
                    else {
                        // 教师无权查看该班级，返回空结果
                        whereConditions.id = -1;
                    }
                    _o.label = 7;
                case 7: return [3 /*break*/, 9];
                case 8:
                    whereConditions.classId = classId;
                    _o.label = 9;
                case 9:
                    if (status_1) {
                        whereConditions.status = status_1;
                    }
                    return [4 /*yield*/, student_model_1.Student.findAndCountAll({
                            where: whereConditions,
                            include: [
                                {
                                    model: class_model_1.Class,
                                    as: 'class',
                                    attributes: ['id', 'name', 'code']
                                }
                            ],
                            limit: Number(pageSize),
                            offset: (Number(page) - 1) * Number(pageSize),
                            order: [['createdAt', 'DESC']]
                        })];
                case 10:
                    _g = _o.sent(), count = _g.count, rows = _g.rows;
                    formattedStudents = rows.map(function (student) {
                        var _a;
                        return ({
                            id: student.id.toString(),
                            name: student.name,
                            studentId: student.studentNo,
                            className: ((_a = student["class"]) === null || _a === void 0 ? void 0 : _a.name) || '未分班',
                            gender: student.gender === 1 ? 'male' : 'female',
                            age: student.birthDate ? Math.floor((Date.now() - new Date(student.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
                            status: student.status === 1 ? 'active' : student.status === 0 ? 'suspended' : 'graduated',
                            enrollDate: student.createdAt.toISOString(),
                            parentName: '',
                            parentPhone: '' // 需要通过关联查询获取
                        });
                    });
                    res.json({
                        success: true,
                        data: {
                            items: formattedStudents,
                            total: count,
                            page: Number(page),
                            pageSize: Number(pageSize)
                        },
                        message: '获取学生列表成功'
                    });
                    return [3 /*break*/, 12];
                case 11:
                    error_2 = _o.sent();
                    console.error('获取学生列表失败:', error_2);
                    res.status(500).json({
                        success: false,
                        message: '获取学生列表失败',
                        error: error_2 instanceof Error ? error_2.message : String(error_2)
                    });
                    return [3 /*break*/, 12];
                case 12: return [2 /*return*/];
            }
        });
    }); },
    // 创建学生
    createStudent: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var studentData, newStudent;
        return __generator(this, function (_a) {
            try {
                studentData = req.body;
                newStudent = __assign(__assign({ id: "student_".concat(Date.now()) }, studentData), { enrollDate: new Date().toISOString() });
                res.json({
                    success: true,
                    data: newStudent,
                    message: '创建学生成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '创建学生失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 更新学生
    updateStudent: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, updateData, updatedStudent;
        return __generator(this, function (_a) {
            try {
                id = req.params.id;
                updateData = req.body;
                updatedStudent = __assign(__assign({ id: id }, updateData), { updatedAt: new Date().toISOString() });
                res.json({
                    success: true,
                    data: updatedStudent,
                    message: '更新学生成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '更新学生失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 删除学生
    deleteStudent: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            try {
                id = req.params.id;
                // 这里应该是数据库操作
                res.json({
                    success: true,
                    data: { id: id },
                    message: '删除学生成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '删除学生失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 获取学生详情
    getStudentDetail: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, student, formattedStudent, error_3;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, student_model_1.Student.findByPk(id, {
                            include: [
                                {
                                    model: class_model_1.Class,
                                    as: 'class',
                                    attributes: ['id', 'name', 'code']
                                }
                            ]
                        })];
                case 1:
                    student = _b.sent();
                    if (!student) {
                        return [2 /*return*/, res.status(404).json({
                                success: false,
                                message: '学生不存在'
                            })];
                    }
                    formattedStudent = {
                        id: student.id.toString(),
                        name: student.name,
                        studentId: student.studentNo,
                        className: ((_a = student["class"]) === null || _a === void 0 ? void 0 : _a.name) || '未分班',
                        gender: student.gender === 1 ? 'male' : 'female',
                        age: student.birthDate ? Math.floor((Date.now() - new Date(student.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0,
                        status: student.status === 1 ? 'active' : student.status === 0 ? 'suspended' : 'graduated',
                        enrollDate: student.createdAt.toISOString(),
                        parentName: '',
                        parentPhone: '' // 需要通过关联查询获取
                    };
                    res.json({
                        success: true,
                        data: formattedStudent,
                        message: '获取学生详情成功'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _b.sent();
                    console.error('获取学生详情失败:', error_3);
                    res.status(500).json({
                        success: false,
                        message: '获取学生详情失败',
                        error: error_3 instanceof Error ? error_3.message : String(error_3)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // 获取家长列表
    getParents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, page, _c, pageSize, _d, keyword, _e, status_2, userId, userRole, whereConditions, teacher, classIds, students, studentIds, userWhere, _f, count, rows, formattedParents, error_4;
        var _g, _h, _j, _k, _l;
        var _m, _o;
        return __generator(this, function (_p) {
            switch (_p.label) {
                case 0:
                    _p.trys.push([0, 9, , 10]);
                    _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, _d = _a.keyword, keyword = _d === void 0 ? '' : _d, _e = _a.status, status_2 = _e === void 0 ? '' : _e;
                    userId = (_m = req.user) === null || _m === void 0 ? void 0 : _m.id;
                    userRole = (_o = req.user) === null || _o === void 0 ? void 0 : _o.role;
                    whereConditions = {};
                    if (!(userRole === 'teacher' && userId)) return [3 /*break*/, 7];
                    return [4 /*yield*/, exports.personnelCenterController.getCurrentTeacher(userId)];
                case 1:
                    teacher = _p.sent();
                    if (!teacher) return [3 /*break*/, 6];
                    return [4 /*yield*/, exports.personnelCenterController.getTeacherClassIds(teacher.id)];
                case 2:
                    classIds = _p.sent();
                    if (!(classIds.length > 0)) return [3 /*break*/, 4];
                    return [4 /*yield*/, student_model_1.Student.findAll({
                            where: { classId: (_g = {}, _g[sequelize_1.Op["in"]] = classIds, _g) },
                            attributes: ['id']
                        })];
                case 3:
                    students = _p.sent();
                    studentIds = students.map(function (s) { return s.id; });
                    if (studentIds.length > 0) {
                        whereConditions.studentId = (_h = {}, _h[sequelize_1.Op["in"]] = studentIds, _h);
                    }
                    else {
                        whereConditions.id = -1; // 没有学生，返回空结果
                    }
                    return [3 /*break*/, 5];
                case 4:
                    whereConditions.id = -1; // 没有班级，返回空结果
                    _p.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    whereConditions.id = -1; // 找不到教师记录，返回空结果
                    _p.label = 7;
                case 7:
                    userWhere = {};
                    if (keyword) {
                        userWhere[sequelize_1.Op.or] = [
                            { username: (_j = {}, _j[sequelize_1.Op.like] = "%".concat(keyword, "%"), _j) },
                            { email: (_k = {}, _k[sequelize_1.Op.like] = "%".concat(keyword, "%"), _k) },
                            { phone: (_l = {}, _l[sequelize_1.Op.like] = "%".concat(keyword, "%"), _l) }
                        ];
                    }
                    if (status_2) {
                        // 根据用户状态过滤
                        userWhere.status = status_2 === 'active' ? 1 : 0;
                    }
                    return [4 /*yield*/, parent_model_1.Parent.findAndCountAll({
                            where: whereConditions,
                            include: [
                                {
                                    model: user_model_1.User,
                                    as: 'user',
                                    attributes: ['id', 'username', 'email', 'phone', 'status'],
                                    where: Object.keys(userWhere).length > 0 ? userWhere : undefined,
                                    required: true // 确保必须有用户记录
                                },
                            ],
                            limit: Number(pageSize),
                            offset: (Number(page) - 1) * Number(pageSize),
                            order: [['createdAt', 'DESC']]
                        })];
                case 8:
                    _f = _p.sent(), count = _f.count, rows = _f.rows;
                    formattedParents = rows.map(function (parent) {
                        var _a, _b, _c, _d;
                        return ({
                            id: parent.id.toString(),
                            name: ((_a = parent.user) === null || _a === void 0 ? void 0 : _a.username) || '未知',
                            phone: ((_b = parent.user) === null || _b === void 0 ? void 0 : _b.phone) || '',
                            email: ((_c = parent.user) === null || _c === void 0 ? void 0 : _c.email) || '',
                            status: ((_d = parent.user) === null || _d === void 0 ? void 0 : _d.status) ? 'active' : 'inactive',
                            registerDate: parent.createdAt.toISOString(),
                            children: [],
                            relationship: parent.relationship,
                            address: parent.address || ''
                        });
                    });
                    res.json({
                        success: true,
                        data: {
                            items: formattedParents,
                            total: count,
                            page: Number(page),
                            pageSize: Number(pageSize)
                        },
                        message: '获取家长列表成功'
                    });
                    return [3 /*break*/, 10];
                case 9:
                    error_4 = _p.sent();
                    console.error('获取家长列表失败:', error_4);
                    res.status(500).json({
                        success: false,
                        message: '获取家长列表失败',
                        error: error_4 instanceof Error ? error_4.message : String(error_4)
                    });
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); },
    // 创建家长
    createParent: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var parentData, newParent;
        return __generator(this, function (_a) {
            try {
                parentData = req.body;
                newParent = __assign(__assign({ id: "parent_".concat(Date.now()) }, parentData), { registerDate: new Date().toISOString() });
                res.json({
                    success: true,
                    data: newParent,
                    message: '创建家长成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '创建家长失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 更新家长
    updateParent: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, updateData, updatedParent;
        return __generator(this, function (_a) {
            try {
                id = req.params.id;
                updateData = req.body;
                updatedParent = __assign(__assign({ id: id }, updateData), { updatedAt: new Date().toISOString() });
                res.json({
                    success: true,
                    data: updatedParent,
                    message: '更新家长成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '更新家长失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 删除家长
    deleteParent: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            try {
                id = req.params.id;
                res.json({
                    success: true,
                    data: { id: id },
                    message: '删除家长成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '删除家长失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 获取家长详情
    getParentDetail: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, parent_1, formattedParent, error_5;
        var _a, _b, _c, _d;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    _e.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, parent_model_1.Parent.findByPk(id, {
                            include: [
                                {
                                    model: user_model_1.User,
                                    as: 'user',
                                    attributes: ['id', 'username', 'email', 'phone', 'status']
                                },
                                {
                                    model: student_model_1.Student,
                                    as: 'student',
                                    attributes: ['id', 'name', 'studentNo']
                                }
                            ]
                        })];
                case 1:
                    parent_1 = _e.sent();
                    if (!parent_1) {
                        return [2 /*return*/, res.status(404).json({
                                success: false,
                                message: '家长不存在'
                            })];
                    }
                    formattedParent = {
                        id: parent_1.id.toString(),
                        name: ((_a = parent_1.user) === null || _a === void 0 ? void 0 : _a.username) || '未知',
                        phone: ((_b = parent_1.user) === null || _b === void 0 ? void 0 : _b.phone) || '',
                        email: ((_c = parent_1.user) === null || _c === void 0 ? void 0 : _c.email) || '',
                        status: ((_d = parent_1.user) === null || _d === void 0 ? void 0 : _d.status) ? 'active' : 'inactive',
                        registerDate: parent_1.createdAt.toISOString(),
                        children: parent_1.student ? [{ id: parent_1.student.id.toString(), name: parent_1.student.name }] : [],
                        relationship: parent_1.relationship,
                        address: parent_1.address || ''
                    };
                    res.json({
                        success: true,
                        data: formattedParent,
                        message: '获取家长详情成功'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_5 = _e.sent();
                    console.error('获取家长详情失败:', error_5);
                    res.status(500).json({
                        success: false,
                        message: '获取家长详情失败',
                        error: error_5 instanceof Error ? error_5.message : String(error_5)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // 获取教师列表
    getTeachers: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, page, _c, pageSize, _d, keyword, _e, status_3, userId, userRole, whereConditions, _f, count, rows, formattedTeachers, error_6;
        var _g, _h;
        var _j, _k;
        return __generator(this, function (_l) {
            switch (_l.label) {
                case 0:
                    _l.trys.push([0, 2, , 3]);
                    _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, _d = _a.keyword, keyword = _d === void 0 ? '' : _d, _e = _a.status, status_3 = _e === void 0 ? '' : _e;
                    userId = (_j = req.user) === null || _j === void 0 ? void 0 : _j.id;
                    userRole = (_k = req.user) === null || _k === void 0 ? void 0 : _k.role;
                    whereConditions = {};
                    // 如果是教师角色，只能查看自己的信息
                    if (userRole === 'teacher' && userId) {
                        whereConditions.userId = userId;
                    }
                    if (keyword) {
                        whereConditions[sequelize_1.Op.or] = [
                            { name: (_g = {}, _g[sequelize_1.Op.like] = "%".concat(keyword, "%"), _g) },
                            { employeeNo: (_h = {}, _h[sequelize_1.Op.like] = "%".concat(keyword, "%"), _h) }
                        ];
                    }
                    if (status_3) {
                        whereConditions.status = status_3 === 'active' ? 1 : 0;
                    }
                    return [4 /*yield*/, teacher_model_1.Teacher.findAndCountAll({
                            where: whereConditions,
                            limit: Number(pageSize),
                            offset: (Number(page) - 1) * Number(pageSize),
                            order: [['createdAt', 'DESC']]
                        })];
                case 1:
                    _f = _l.sent(), count = _f.count, rows = _f.rows;
                    formattedTeachers = rows.map(function (teacher) { return ({
                        id: teacher.id.toString(),
                        name: teacher.name,
                        employeeId: teacher.employeeId || "T".concat(teacher.id.toString().padStart(4, '0')),
                        department: 'teaching',
                        position: teacher.position === 4 ? '班主任' : teacher.position === 5 ? '普通教师' : '其他',
                        phone: '',
                        email: '',
                        status: teacher.status === 1 ? 'active' : 'inactive',
                        hireDate: teacher.createdAt.toISOString(),
                        classes: [],
                        subjects: [] // 需要通过关联查询获取
                    }); });
                    res.json({
                        success: true,
                        data: {
                            items: formattedTeachers,
                            total: count,
                            page: Number(page),
                            pageSize: Number(pageSize)
                        },
                        message: '获取教师列表成功'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_6 = _l.sent();
                    console.error('获取教师列表失败:', error_6);
                    res.status(500).json({
                        success: false,
                        message: '获取教师列表失败',
                        error: error_6 instanceof Error ? error_6.message : String(error_6)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // 创建教师
    createTeacher: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var teacherData, newTeacher;
        return __generator(this, function (_a) {
            try {
                teacherData = req.body;
                newTeacher = __assign(__assign({ id: "teacher_".concat(Date.now()) }, teacherData), { hireDate: new Date().toISOString() });
                res.json({
                    success: true,
                    data: newTeacher,
                    message: '创建教师成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '创建教师失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 更新教师
    updateTeacher: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, updateData, updatedTeacher;
        return __generator(this, function (_a) {
            try {
                id = req.params.id;
                updateData = req.body;
                updatedTeacher = __assign(__assign({ id: id }, updateData), { updatedAt: new Date().toISOString() });
                res.json({
                    success: true,
                    data: updatedTeacher,
                    message: '更新教师成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '更新教师失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 删除教师
    deleteTeacher: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            try {
                id = req.params.id;
                res.json({
                    success: true,
                    data: { id: id },
                    message: '删除教师成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '删除教师失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 获取教师详情
    getTeacherDetail: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, teacher, formattedTeacher, error_7;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, teacher_model_1.Teacher.findByPk(id, {
                            include: [
                                {
                                    model: user_model_1.User,
                                    as: 'user',
                                    attributes: ['id', 'username', 'email', 'phone']
                                }
                            ]
                        })];
                case 1:
                    teacher = _c.sent();
                    if (!teacher) {
                        return [2 /*return*/, res.status(404).json({
                                success: false,
                                message: '教师不存在'
                            })];
                    }
                    formattedTeacher = {
                        id: teacher.id.toString(),
                        name: teacher.name,
                        employeeId: teacher.employeeId || "T".concat(teacher.id.toString().padStart(4, '0')),
                        department: 'teaching',
                        position: teacher.position === 4 ? '班主任' : teacher.position === 5 ? '普通教师' : '其他',
                        phone: ((_a = teacher.user) === null || _a === void 0 ? void 0 : _a.phone) || '',
                        email: ((_b = teacher.user) === null || _b === void 0 ? void 0 : _b.email) || '',
                        status: teacher.status === 1 ? 'active' : 'inactive',
                        hireDate: teacher.createdAt.toISOString(),
                        classes: [],
                        subjects: []
                    };
                    res.json({
                        success: true,
                        data: formattedTeacher,
                        message: '获取教师详情成功'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_7 = _c.sent();
                    console.error('获取教师详情失败:', error_7);
                    res.status(500).json({
                        success: false,
                        message: '获取教师详情失败',
                        error: error_7 instanceof Error ? error_7.message : String(error_7)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // 获取班级列表
    getClasses: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, _b, page, _c, pageSize, _d, keyword, _e, status_4, userId, userRole, whereConditions, teacher, classIds, _f, count, rows, formattedClasses, error_8;
        var _g, _h, _j;
        var _k, _l;
        return __generator(this, function (_m) {
            switch (_m.label) {
                case 0:
                    _m.trys.push([0, 6, , 7]);
                    _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, _d = _a.keyword, keyword = _d === void 0 ? '' : _d, _e = _a.status, status_4 = _e === void 0 ? '' : _e;
                    userId = (_k = req.user) === null || _k === void 0 ? void 0 : _k.id;
                    userRole = (_l = req.user) === null || _l === void 0 ? void 0 : _l.role;
                    whereConditions = {};
                    if (!(userRole === 'teacher' && userId)) return [3 /*break*/, 4];
                    return [4 /*yield*/, exports.personnelCenterController.getCurrentTeacher(userId)];
                case 1:
                    teacher = _m.sent();
                    if (!teacher) return [3 /*break*/, 3];
                    return [4 /*yield*/, exports.personnelCenterController.getTeacherClassIds(teacher.id)];
                case 2:
                    classIds = _m.sent();
                    if (classIds.length > 0) {
                        whereConditions.id = (_g = {}, _g[sequelize_1.Op["in"]] = classIds, _g);
                    }
                    else {
                        whereConditions.id = -1; // 没有班级，返回空结果
                    }
                    return [3 /*break*/, 4];
                case 3:
                    whereConditions.id = -1; // 找不到教师记录，返回空结果
                    _m.label = 4;
                case 4:
                    if (keyword) {
                        whereConditions[sequelize_1.Op.or] = [
                            { name: (_h = {}, _h[sequelize_1.Op.like] = "%".concat(keyword, "%"), _h) },
                            { code: (_j = {}, _j[sequelize_1.Op.like] = "%".concat(keyword, "%"), _j) }
                        ];
                    }
                    if (status_4) {
                        whereConditions.status = status_4 === 'active' ? 1 : 0;
                    }
                    return [4 /*yield*/, class_model_1.Class.findAndCountAll({
                            where: whereConditions,
                            limit: Number(pageSize),
                            offset: (Number(page) - 1) * Number(pageSize),
                            order: [['createdAt', 'DESC']]
                        })];
                case 5:
                    _f = _m.sent(), count = _f.count, rows = _f.rows;
                    formattedClasses = rows.map(function (classItem) { return ({
                        id: classItem.id.toString(),
                        name: classItem.name,
                        grade: classItem.type === 1 ? 'small' : classItem.type === 2 ? 'medium' : 'large',
                        maxCapacity: classItem.capacity,
                        currentStudents: classItem.currentStudentCount,
                        teacherName: '未分配',
                        assistantTeacher: '未分配',
                        room: "\u6559\u5BA4".concat(classItem.id),
                        status: classItem.status === 1 ? 'active' : 'inactive',
                        createDate: classItem.createdAt.toISOString(),
                        students: [] // 需要单独查询学生列表
                    }); });
                    res.json({
                        success: true,
                        data: {
                            items: formattedClasses,
                            total: count,
                            page: Number(page),
                            pageSize: Number(pageSize)
                        },
                        message: '获取班级列表成功'
                    });
                    return [3 /*break*/, 7];
                case 6:
                    error_8 = _m.sent();
                    console.error('获取班级列表失败:', error_8);
                    res.status(500).json({
                        success: false,
                        message: '获取班级列表失败',
                        error: error_8 instanceof Error ? error_8.message : String(error_8)
                    });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); },
    // 创建班级
    createClass: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var classData, newClass;
        return __generator(this, function (_a) {
            try {
                classData = req.body;
                newClass = __assign(__assign({ id: "class_".concat(Date.now()) }, classData), { currentStudents: 0, createDate: new Date().toISOString() });
                res.json({
                    success: true,
                    data: newClass,
                    message: '创建班级成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '创建班级失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 更新班级
    updateClass: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, updateData, updatedClass;
        return __generator(this, function (_a) {
            try {
                id = req.params.id;
                updateData = req.body;
                updatedClass = __assign(__assign({ id: id }, updateData), { updatedAt: new Date().toISOString() });
                res.json({
                    success: true,
                    data: updatedClass,
                    message: '更新班级成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '更新班级失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 删除班级
    deleteClass: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id;
        return __generator(this, function (_a) {
            try {
                id = req.params.id;
                res.json({
                    success: true,
                    data: { id: id },
                    message: '删除班级成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '删除班级失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 获取班级详情
    getClassDetail: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var id, classDetail, formattedClass, error_9;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 2, , 3]);
                    id = req.params.id;
                    return [4 /*yield*/, class_model_1.Class.findByPk(id, {
                            include: [
                                {
                                    model: teacher_model_1.Teacher,
                                    as: 'headTeacher',
                                    attributes: ['id', 'name']
                                },
                                {
                                    model: teacher_model_1.Teacher,
                                    as: 'assistantTeacher',
                                    attributes: ['id', 'name']
                                }
                            ]
                        })];
                case 1:
                    classDetail = _c.sent();
                    if (!classDetail) {
                        return [2 /*return*/, res.status(404).json({
                                success: false,
                                message: '班级不存在'
                            })];
                    }
                    formattedClass = {
                        id: classDetail.id.toString(),
                        name: classDetail.name,
                        grade: classDetail.type === 1 ? 'small' : classDetail.type === 2 ? 'medium' : 'large',
                        maxCapacity: classDetail.capacity,
                        currentStudents: classDetail.currentStudentCount,
                        teacherName: ((_a = classDetail.headTeacher) === null || _a === void 0 ? void 0 : _a.name) || '未分配',
                        assistantTeacher: ((_b = classDetail.assistantTeacher) === null || _b === void 0 ? void 0 : _b.name) || '未分配',
                        room: "\u6559\u5BA4".concat(classDetail.id),
                        status: classDetail.status === 1 ? 'active' : 'inactive',
                        createDate: classDetail.createdAt.toISOString(),
                        students: []
                    };
                    res.json({
                        success: true,
                        data: formattedClass,
                        message: '获取班级详情成功'
                    });
                    return [3 /*break*/, 3];
                case 2:
                    error_9 = _c.sent();
                    console.error('获取班级详情失败:', error_9);
                    res.status(500).json({
                        success: false,
                        message: '获取班级详情失败',
                        error: error_9 instanceof Error ? error_9.message : String(error_9)
                    });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    // 获取人员统计
    getPersonnelStatistics: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var statistics;
        return __generator(this, function (_a) {
            try {
                statistics = {
                    totalStudents: 456,
                    totalParents: 328,
                    totalTeachers: 45,
                    totalClasses: 18,
                    activeStudents: 420,
                    activeParents: 310,
                    activeTeachers: 42,
                    activeClasses: 16,
                    monthlyGrowth: {
                        students: 12,
                        parents: 8,
                        teachers: 2,
                        classes: 1
                    }
                };
                res.json({
                    success: true,
                    data: statistics,
                    message: '获取人员统计成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '获取人员统计失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 批量操作 - 学生
    batchUpdateStudents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ids, data;
        return __generator(this, function (_b) {
            try {
                _a = req.body, ids = _a.ids, data = _a.data;
                res.json({
                    success: true,
                    data: { updatedCount: ids.length },
                    message: "\u6279\u91CF\u66F4\u65B0".concat(ids.length, "\u4E2A\u5B66\u751F\u6210\u529F")
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量更新学生失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    batchDeleteStudents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var ids;
        return __generator(this, function (_a) {
            try {
                ids = req.body.ids;
                res.json({
                    success: true,
                    data: { deletedCount: ids.length },
                    message: "\u6279\u91CF\u5220\u9664".concat(ids.length, "\u4E2A\u5B66\u751F\u6210\u529F")
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量删除学生失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 批量操作 - 家长
    batchUpdateParents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ids, data;
        return __generator(this, function (_b) {
            try {
                _a = req.body, ids = _a.ids, data = _a.data;
                res.json({
                    success: true,
                    data: { updatedCount: ids.length },
                    message: "\u6279\u91CF\u66F4\u65B0".concat(ids.length, "\u4E2A\u5BB6\u957F\u6210\u529F")
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量更新家长失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    batchDeleteParents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var ids;
        return __generator(this, function (_a) {
            try {
                ids = req.body.ids;
                res.json({
                    success: true,
                    data: { deletedCount: ids.length },
                    message: "\u6279\u91CF\u5220\u9664".concat(ids.length, "\u4E2A\u5BB6\u957F\u6210\u529F")
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量删除家长失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 批量操作 - 教师
    batchUpdateTeachers: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ids, data;
        return __generator(this, function (_b) {
            try {
                _a = req.body, ids = _a.ids, data = _a.data;
                res.json({
                    success: true,
                    data: { updatedCount: ids.length },
                    message: "\u6279\u91CF\u66F4\u65B0".concat(ids.length, "\u4E2A\u6559\u5E08\u6210\u529F")
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量更新教师失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    batchDeleteTeachers: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var ids;
        return __generator(this, function (_a) {
            try {
                ids = req.body.ids;
                res.json({
                    success: true,
                    data: { deletedCount: ids.length },
                    message: "\u6279\u91CF\u5220\u9664".concat(ids.length, "\u4E2A\u6559\u5E08\u6210\u529F")
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量删除教师失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 批量操作 - 班级
    batchUpdateClasses: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var _a, ids, data;
        return __generator(this, function (_b) {
            try {
                _a = req.body, ids = _a.ids, data = _a.data;
                res.json({
                    success: true,
                    data: { updatedCount: ids.length },
                    message: "\u6279\u91CF\u66F4\u65B0".concat(ids.length, "\u4E2A\u73ED\u7EA7\u6210\u529F")
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量更新班级失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    batchDeleteClasses: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var ids;
        return __generator(this, function (_a) {
            try {
                ids = req.body.ids;
                res.json({
                    success: true,
                    data: { deletedCount: ids.length },
                    message: "\u6279\u91CF\u5220\u9664".concat(ids.length, "\u4E2A\u73ED\u7EA7\u6210\u529F")
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '批量删除班级失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 导出功能
    exportStudents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.json({
                    success: true,
                    data: { downloadUrl: '/downloads/students.xlsx' },
                    message: '学生数据导出成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '学生数据导出失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    exportParents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.json({
                    success: true,
                    data: { downloadUrl: '/downloads/parents.xlsx' },
                    message: '家长数据导出成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '家长数据导出失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    exportTeachers: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.json({
                    success: true,
                    data: { downloadUrl: '/downloads/teachers.xlsx' },
                    message: '教师数据导出成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '教师数据导出失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    exportClasses: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.json({
                    success: true,
                    data: { downloadUrl: '/downloads/classes.xlsx' },
                    message: '班级数据导出成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '班级数据导出失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 关联操作
    assignStudentToClass: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var studentId, classId;
        return __generator(this, function (_a) {
            try {
                studentId = req.params.studentId;
                classId = req.body.classId;
                res.json({
                    success: true,
                    data: { studentId: studentId, classId: classId },
                    message: '学生分配班级成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '学生分配班级失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    assignTeacherToClass: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var teacherId, classId;
        return __generator(this, function (_a) {
            try {
                teacherId = req.params.teacherId;
                classId = req.body.classId;
                res.json({
                    success: true,
                    data: { teacherId: teacherId, classId: classId },
                    message: '教师分配班级成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '教师分配班级失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    addChildToParent: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var parentId, studentId;
        return __generator(this, function (_a) {
            try {
                parentId = req.params.parentId;
                studentId = req.body.studentId;
                res.json({
                    success: true,
                    data: { parentId: parentId, studentId: studentId },
                    message: '添加孩子关联成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '添加孩子关联失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    // 搜索功能
    globalSearch: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        var keyword;
        return __generator(this, function (_a) {
            try {
                keyword = req.query.keyword;
                res.json({
                    success: true,
                    data: {
                        students: [],
                        parents: [],
                        teachers: [],
                        classes: []
                    },
                    message: '全局搜索成功'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '全局搜索失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    searchStudents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.json({
                    success: true,
                    data: [],
                    message: '搜索学生功能暂未实现'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '搜索学生失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    searchParents: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.json({
                    success: true,
                    data: [],
                    message: '搜索家长功能暂未实现'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '搜索家长失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    searchTeachers: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.json({
                    success: true,
                    data: [],
                    message: '搜索教师功能暂未实现'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '搜索教师失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); },
    searchClasses: function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                res.json({
                    success: true,
                    data: [],
                    message: '搜索班级功能暂未实现'
                });
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: '搜索班级失败',
                    error: error instanceof Error ? error.message : String(error)
                });
            }
            return [2 /*return*/];
        });
    }); }
};
