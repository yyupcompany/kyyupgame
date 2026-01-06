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
exports.TeachingCenterController = void 0;
var teaching_center_service_1 = require("../services/teaching-center.service");
var semester_helper_1 = require("../utils/semester-helper");
var role_cache_service_1 = __importDefault(require("../services/role-cache.service"));
/**
 * 教学中心控制器
 */
var TeachingCenterController = /** @class */ (function () {
    function TeachingCenterController() {
    }
    /**
     * 获取课程进度统计数据
     */
    TeachingCenterController.getCourseProgressStats = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, semester, academic_year, class_id, userId, filters, cacheKey, cachedData, data, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        _b = req.query, semester = _b.semester, academic_year = _b.academic_year, class_id = _b.class_id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        filters = {
                            semester: semester,
                            academic_year: academic_year,
                            class_id: class_id ? parseInt(class_id) : undefined
                        };
                        cacheKey = "course_progress:".concat(JSON.stringify(filters));
                        return [4 /*yield*/, role_cache_service_1["default"].getTeacherData(userId, cacheKey)];
                    case 1:
                        cachedData = _c.sent();
                        if (cachedData) {
                            console.log('✅ 从缓存获取课程进度统计数据');
                            return [2 /*return*/, res.json({
                                    success: true,
                                    data: cachedData,
                                    cached: true
                                })];
                        }
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getCourseProgressStats(filters)];
                    case 2:
                        data = _c.sent();
                        // 缓存数据（5分钟）
                        return [4 /*yield*/, role_cache_service_1["default"].setTeacherData(userId, cacheKey, data, 300)];
                    case 3:
                        // 缓存数据（5分钟）
                        _c.sent();
                        res.json({
                            success: true,
                            data: data
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        console.error('获取课程进度统计失败:', error_1);
                        res.status(500).json({
                            success: false,
                            message: '获取课程进度统计失败',
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级详细达标情况
     */
    TeachingCenterController.getClassDetailedProgress = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, classId, coursePlanId, data, error_2, statusCode;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.params, classId = _a.classId, coursePlanId = _a.coursePlanId;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getClassDetailedProgress(parseInt(classId), parseInt(coursePlanId))];
                    case 1:
                        data = _b.sent();
                        res.json({
                            success: true,
                            data: data
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _b.sent();
                        console.error('获取班级详细进度失败:', error_2);
                        statusCode = error_2 instanceof Error && error_2.message.includes('不存在') ? 404 : 500;
                        res.status(statusCode).json({
                            success: false,
                            message: '获取班级详细进度失败',
                            error: error_2 instanceof Error ? error_2.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 教师确认完成课程
     */
    TeachingCenterController.confirmCourseCompletion = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var progressId, _b, attendance_count, target_achieved_count, session_content, notes, teacherId, data, error_3, statusCode;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        progressId = req.params.progressId;
                        _b = req.body, attendance_count = _b.attendance_count, target_achieved_count = _b.target_achieved_count, session_content = _b.session_content, notes = _b.notes;
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!teacherId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.confirmCourseCompletion(parseInt(progressId), teacherId, {
                                attendance_count: attendance_count,
                                target_achieved_count: target_achieved_count,
                                session_content: session_content,
                                notes: notes
                            })];
                    case 1:
                        data = _c.sent();
                        res.json({
                            success: true,
                            message: '课程完成确认成功',
                            data: data
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _c.sent();
                        console.error('确认课程完成失败:', error_3);
                        statusCode = error_3 instanceof Error && error_3.message.includes('不存在') ? 404 : 500;
                        res.status(statusCode).json({
                            success: false,
                            message: '确认课程完成失败',
                            error: error_3 instanceof Error ? error_3.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 户外训练相关API ====================
    /**
     * 获取户外训练统计数据
     */
    TeachingCenterController.getOutdoorTrainingStats = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var currentSemester, _c, _d, semester, _e, academicYear, userId, userRole, stats, error_4;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        currentSemester = (0, semester_helper_1.getCurrentSemester)();
                        _c = req.query, _d = _c.semester, semester = _d === void 0 ? currentSemester.semester : _d, _e = _c.academicYear, academicYear = _e === void 0 ? currentSemester.academicYear : _e;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getOutdoorTrainingStats(semester, academicYear, userId, userRole)];
                    case 1:
                        stats = _f.sent();
                        res.json({
                            success: true,
                            message: '获取户外训练统计成功',
                            data: stats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _f.sent();
                        console.error('获取户外训练统计失败:', error_4);
                        res.status(500).json({
                            success: false,
                            message: '获取户外训练统计失败',
                            error: error_4 instanceof Error ? error_4.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级户外训练详情
     */
    TeachingCenterController.getClassOutdoorTrainingDetails = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var classId, _a, _b, semester, _c, academicYear, details, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        classId = req.params.classId;
                        _a = req.query, _b = _a.semester, semester = _b === void 0 ? '2024春季' : _b, _c = _a.academicYear, academicYear = _c === void 0 ? '2024-2025' : _c;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getClassOutdoorTrainingDetails(parseInt(classId), semester, academicYear)];
                    case 1:
                        details = _d.sent();
                        res.json({
                            success: true,
                            message: '获取班级户外训练详情成功',
                            data: details
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _d.sent();
                        console.error('获取班级户外训练详情失败:', error_5);
                        res.status(500).json({
                            success: false,
                            message: '获取班级户外训练详情失败',
                            error: error_5 instanceof Error ? error_5.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录户外训练活动
     */
    TeachingCenterController.recordOutdoorTraining = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var trainingData, teacherId, result, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        trainingData = req.body;
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!teacherId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.recordOutdoorTraining(__assign(__assign({}, trainingData), { teacher_id: teacherId }))];
                    case 1:
                        result = _b.sent();
                        res.json({
                            success: true,
                            message: '户外训练记录成功',
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _b.sent();
                        console.error('记录户外训练失败:', error_6);
                        res.status(500).json({
                            success: false,
                            message: '记录户外训练失败',
                            error: error_6 instanceof Error ? error_6.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 校外展示相关API ====================
    /**
     * 获取校外展示统计数据
     */
    TeachingCenterController.getExternalDisplayStats = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var currentSemester, _c, _d, semester, _e, academicYear, userId, userRole, stats, error_7;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        currentSemester = (0, semester_helper_1.getCurrentSemester)();
                        _c = req.query, _d = _c.semester, semester = _d === void 0 ? currentSemester.semester : _d, _e = _c.academicYear, academicYear = _e === void 0 ? currentSemester.academicYear : _e;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getExternalDisplayStats(semester, academicYear, userId, userRole)];
                    case 1:
                        stats = _f.sent();
                        res.json({
                            success: true,
                            message: '获取校外展示统计成功',
                            data: stats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _f.sent();
                        console.error('获取校外展示统计失败:', error_7);
                        res.status(500).json({
                            success: false,
                            message: '获取校外展示统计失败',
                            error: error_7 instanceof Error ? error_7.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级校外展示详情
     */
    TeachingCenterController.getClassExternalDisplayDetails = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var classId, _a, _b, semester, _c, academicYear, details, error_8;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 2, , 3]);
                        classId = req.params.classId;
                        _a = req.query, _b = _a.semester, semester = _b === void 0 ? '2024春季' : _b, _c = _a.academicYear, academicYear = _c === void 0 ? '2024-2025' : _c;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getClassExternalDisplayDetails(parseInt(classId), semester, academicYear)];
                    case 1:
                        details = _d.sent();
                        res.json({
                            success: true,
                            message: '获取班级校外展示详情成功',
                            data: details
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _d.sent();
                        console.error('获取班级校外展示详情失败:', error_8);
                        res.status(500).json({
                            success: false,
                            message: '获取班级校外展示详情失败',
                            error: error_8 instanceof Error ? error_8.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录校外展示活动
     */
    TeachingCenterController.recordExternalDisplay = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var displayData, teacherId, result, error_9;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        displayData = req.body;
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!teacherId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.recordExternalDisplay(__assign(__assign({}, displayData), { teacher_id: teacherId }))];
                    case 1:
                        result = _b.sent();
                        res.json({
                            success: true,
                            message: '校外展示记录成功',
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _b.sent();
                        console.error('记录校外展示失败:', error_9);
                        res.status(500).json({
                            success: false,
                            message: '记录校外展示失败',
                            error: error_9 instanceof Error ? error_9.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 全员锦标赛相关API ====================
    /**
     * 获取锦标赛统计数据
     */
    TeachingCenterController.getChampionshipStats = function (req, res) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var currentSemester, _c, _d, semester, _e, academicYear, userId, userRole, stats, error_10;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        currentSemester = (0, semester_helper_1.getCurrentSemester)();
                        _c = req.query, _d = _c.semester, semester = _d === void 0 ? currentSemester.semester : _d, _e = _c.academicYear, academicYear = _e === void 0 ? currentSemester.academicYear : _e;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getChampionshipStats(semester, academicYear, userId, userRole)];
                    case 1:
                        stats = _f.sent();
                        res.json({
                            success: true,
                            message: '获取锦标赛统计成功',
                            data: stats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _f.sent();
                        console.error('获取锦标赛统计失败:', error_10);
                        res.status(500).json({
                            success: false,
                            message: '获取锦标赛统计失败',
                            error: error_10 instanceof Error ? error_10.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取锦标赛详情
     */
    TeachingCenterController.getChampionshipDetails = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var championshipId, details, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        championshipId = req.params.championshipId;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getChampionshipDetails(parseInt(championshipId))];
                    case 1:
                        details = _a.sent();
                        res.json({
                            success: true,
                            message: '获取锦标赛详情成功',
                            data: details
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        console.error('获取锦标赛详情失败:', error_11);
                        res.status(500).json({
                            success: false,
                            message: '获取锦标赛详情失败',
                            error: error_11 instanceof Error ? error_11.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建锦标赛
     */
    TeachingCenterController.createChampionship = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var championshipData, organizerId, result, error_12;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        championshipData = req.body;
                        organizerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!organizerId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.createChampionship(__assign(__assign({}, championshipData), { organizer_id: organizerId }))];
                    case 1:
                        result = _b.sent();
                        res.json({
                            success: true,
                            message: '锦标赛创建成功',
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_12 = _b.sent();
                        console.error('创建锦标赛失败:', error_12);
                        res.status(500).json({
                            success: false,
                            message: '创建锦标赛失败',
                            error: error_12 instanceof Error ? error_12.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新锦标赛状态
     */
    TeachingCenterController.updateChampionshipStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var championshipId, _a, status_1, achievementRates, result, error_13;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        championshipId = req.params.championshipId;
                        _a = req.body, status_1 = _a.status, achievementRates = _a.achievementRates;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.updateChampionshipStatus(parseInt(championshipId), status_1, achievementRates)];
                    case 1:
                        result = _b.sent();
                        res.json({
                            success: true,
                            message: '锦标赛状态更新成功',
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_13 = _b.sent();
                        console.error('更新锦标赛状态失败:', error_13);
                        res.status(500).json({
                            success: false,
                            message: '更新锦标赛状态失败',
                            error: error_13 instanceof Error ? error_13.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 媒体管理相关API ====================
    /**
     * 上传教学媒体文件
     */
    TeachingCenterController.uploadTeachingMedia = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var _b, recordType, recordId, mediaType, description, teacherId, result, error_14;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _b = req.body, recordType = _b.recordType, recordId = _b.recordId, mediaType = _b.mediaType, description = _b.description;
                        teacherId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!teacherId) {
                            return [2 /*return*/, res.status(401).json({
                                    success: false,
                                    message: '用户未认证'
                                })];
                        }
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.uploadTeachingMedia({
                                record_type: recordType,
                                record_id: recordId,
                                media_type: mediaType,
                                description: description,
                                uploader_id: teacherId
                            })];
                    case 1:
                        result = _c.sent();
                        res.json({
                            success: true,
                            message: '媒体文件上传成功',
                            data: result
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_14 = _c.sent();
                        console.error('上传媒体文件失败:', error_14);
                        res.status(500).json({
                            success: false,
                            message: '上传媒体文件失败',
                            error: error_14 instanceof Error ? error_14.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教学媒体列表
     */
    TeachingCenterController.getTeachingMediaList = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, recordType, recordId, mediaType, mediaList, error_15;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.query, recordType = _a.recordType, recordId = _a.recordId, mediaType = _a.mediaType;
                        return [4 /*yield*/, teaching_center_service_1.TeachingCenterService.getTeachingMediaList({
                                record_type: recordType,
                                record_id: recordId ? parseInt(recordId) : undefined,
                                media_type: mediaType
                            })];
                    case 1:
                        mediaList = _b.sent();
                        res.json({
                            success: true,
                            message: '获取媒体列表成功',
                            data: mediaList
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_15 = _b.sent();
                        console.error('获取媒体列表失败:', error_15);
                        res.status(500).json({
                            success: false,
                            message: '获取媒体列表失败',
                            error: error_15 instanceof Error ? error_15.message : '未知错误'
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return TeachingCenterController;
}());
exports.TeachingCenterController = TeachingCenterController;
