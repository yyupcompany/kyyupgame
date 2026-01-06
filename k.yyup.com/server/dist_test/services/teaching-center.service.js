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
exports.TeachingCenterService = void 0;
var sequelize_1 = require("sequelize");
var course_plan_model_1 = __importDefault(require("../models/course-plan.model"));
var brain_science_course_model_1 = __importDefault(require("../models/brain-science-course.model"));
var course_progress_model_1 = __importDefault(require("../models/course-progress.model"));
var teaching_media_record_model_1 = __importDefault(require("../models/teaching-media-record.model"));
var outdoor_training_record_model_1 = __importDefault(require("../models/outdoor-training-record.model"));
var external_display_record_model_1 = __importDefault(require("../models/external-display-record.model"));
var championship_record_model_1 = __importDefault(require("../models/championship-record.model"));
var class_model_1 = require("../models/class.model");
var student_model_1 = require("../models/student.model");
var teacher_model_1 = require("../models/teacher.model");
var file_storage_model_1 = require("../models/file-storage.model");
/**
 * 教学中心服务类
 */
var TeachingCenterService = /** @class */ (function () {
    function TeachingCenterService() {
    }
    /**
     * 获取课程进度统计数据
     */
    TeachingCenterService.getCourseProgressStats = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var whereCondition, coursePlans, totalSessions_1, completedSessions_1, confirmedSessions_1, totalAchievementRate_1, plansWithMedia_1, coursePlanStats, activePlans, completedPlans, overallCompletionRate, overallConfirmationRate, overallAchievementRate, error_1;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        // 检查输入参数
                        if (!filters || typeof filters !== 'object') {
                            filters = {};
                        }
                        whereCondition = {};
                        if (filters.semester)
                            whereCondition.semester = filters.semester;
                        if (filters.academic_year)
                            whereCondition.academic_year = filters.academic_year;
                        if (filters.class_id)
                            whereCondition.class_id = filters.class_id;
                        console.log('📚 获取课程进度统计数据，过滤条件:', filters);
                        return [4 /*yield*/, course_plan_model_1["default"].findAll({
                                where: whereCondition,
                                include: [
                                    {
                                        model: brain_science_course_model_1["default"],
                                        as: 'course',
                                        attributes: ['id', 'course_name', 'course_type', 'difficulty_level']
                                    },
                                    {
                                        model: class_model_1.Class,
                                        as: 'class',
                                        attributes: ['id', 'name', 'current_student_count']
                                    }
                                ]
                            })];
                    case 1:
                        coursePlans = _a.sent();
                        totalSessions_1 = 0;
                        completedSessions_1 = 0;
                        confirmedSessions_1 = 0;
                        totalAchievementRate_1 = 0;
                        plansWithMedia_1 = 0;
                        return [4 /*yield*/, Promise.all(coursePlans.map(function (plan) { return __awaiter(_this, void 0, void 0, function () {
                                var progressRecords, completed, confirmed, avgAchievement, hasMedia;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, course_progress_model_1["default"].findAll({
                                                where: { course_plan_id: plan.id }
                                            })];
                                        case 1:
                                            progressRecords = _a.sent();
                                            completed = progressRecords.filter(function (p) { return p.completion_status === 'completed'; }).length;
                                            confirmed = progressRecords.filter(function (p) { return p.teacher_confirmed; }).length;
                                            avgAchievement = progressRecords.length > 0
                                                ? Math.round(progressRecords.reduce(function (sum, p) { return sum + (p.achievement_rate || 0); }, 0) / progressRecords.length)
                                                : 0;
                                            totalSessions_1 += plan.total_sessions || 0;
                                            completedSessions_1 += completed;
                                            confirmedSessions_1 += confirmed;
                                            totalAchievementRate_1 += avgAchievement;
                                            hasMedia = progressRecords.some(function (p) { return p.has_class_media || p.has_student_media; });
                                            if (hasMedia)
                                                plansWithMedia_1++;
                                            return [2 /*return*/, {
                                                    plan_id: plan.id,
                                                    course: plan.course,
                                                    "class": plan["class"],
                                                    semester: plan.semester,
                                                    academic_year: plan.academic_year,
                                                    total_sessions: plan.total_sessions,
                                                    completed_sessions: completed,
                                                    confirmed_sessions: confirmed,
                                                    completion_rate: plan.total_sessions > 0 ? Math.round((completed / plan.total_sessions) * 100) : 0,
                                                    confirmation_rate: plan.total_sessions > 0 ? Math.round((confirmed / plan.total_sessions) * 100) : 0,
                                                    avg_achievement_rate: avgAchievement,
                                                    plan_status: plan.plan_status,
                                                    has_media: hasMedia,
                                                    media_stats: {
                                                        class_photo: progressRecords.reduce(function (sum, p) { return sum + (p.class_media_count || 0); }, 0),
                                                        class_video: 0,
                                                        student_photo: progressRecords.reduce(function (sum, p) { return sum + (p.student_media_count || 0); }, 0),
                                                        student_video: 0
                                                    }
                                                }];
                                    }
                                });
                            }); }))];
                    case 2:
                        coursePlanStats = _a.sent();
                        activePlans = coursePlans.filter(function (p) { return p.plan_status === 'active'; }).length;
                        completedPlans = coursePlans.filter(function (p) { return p.plan_status === 'completed'; }).length;
                        overallCompletionRate = totalSessions_1 > 0 ? Math.round((completedSessions_1 / totalSessions_1) * 100) : 0;
                        overallConfirmationRate = totalSessions_1 > 0 ? Math.round((confirmedSessions_1 / totalSessions_1) * 100) : 0;
                        overallAchievementRate = coursePlans.length > 0 ? Math.round(totalAchievementRate_1 / coursePlans.length) : 0;
                        return [2 /*return*/, {
                                overall_stats: {
                                    total_plans: coursePlans.length,
                                    active_plans: activePlans,
                                    completed_plans: completedPlans,
                                    total_sessions: totalSessions_1,
                                    completed_sessions: completedSessions_1,
                                    confirmed_sessions: confirmedSessions_1,
                                    overall_completion_rate: overallCompletionRate,
                                    overall_confirmation_rate: overallConfirmationRate,
                                    overall_achievement_rate: overallAchievementRate,
                                    plans_with_media: plansWithMedia_1
                                },
                                course_plans: coursePlanStats
                            }];
                    case 3:
                        error_1 = _a.sent();
                        console.error('Error in getCourseProgressStats:', error_1);
                        throw error_1;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取单个课程计划的进度统计
     */
    TeachingCenterService.getCoursePlanProgress = function (plan) {
        return __awaiter(this, void 0, void 0, function () {
            var progressRecords, totalSessions, completedSessions, confirmedSessions, totalAttendance, totalAchieved, avgAchievementRate, mediaStats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // 检查输入参数
                        if (!plan || !plan.id) {
                            throw new Error('Invalid course plan provided');
                        }
                        return [4 /*yield*/, course_progress_model_1["default"].findAll({
                                where: { course_plan_id: plan.id },
                                include: [
                                    {
                                        model: teacher_model_1.Teacher,
                                        as: 'teacher',
                                        attributes: ['id', 'name']
                                    }
                                ]
                            })];
                    case 1:
                        progressRecords = _a.sent();
                        totalSessions = plan.total_sessions || 0;
                        completedSessions = progressRecords.filter(function (p) { return p.completion_status === 'completed'; }).length;
                        confirmedSessions = progressRecords.filter(function (p) { return p.teacher_confirmed; }).length;
                        totalAttendance = progressRecords.reduce(function (sum, p) { return sum + (p.attendance_count || 0); }, 0);
                        totalAchieved = progressRecords.reduce(function (sum, p) { return sum + (p.target_achieved_count || 0); }, 0);
                        avgAchievementRate = totalAttendance > 0 ? (totalAchieved / totalAttendance) * 100 : 0;
                        return [4 /*yield*/, this.getMediaStats(progressRecords.map(function (p) { return p.id; }))];
                    case 2:
                        mediaStats = _a.sent();
                        return [2 /*return*/, {
                                plan_id: plan.id,
                                course: plan.course,
                                "class": plan["class"],
                                semester: plan.semester,
                                academic_year: plan.academic_year,
                                total_sessions: totalSessions,
                                completed_sessions: completedSessions,
                                confirmed_sessions: confirmedSessions,
                                completion_rate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
                                confirmation_rate: totalSessions > 0 ? Math.round((confirmedSessions / totalSessions) * 100) : 0,
                                avg_achievement_rate: Math.round(avgAchievementRate * 100) / 100,
                                target_achievement_rate: plan.target_achievement_rate,
                                actual_achievement_rate: plan.actual_achievement_rate,
                                media_count: mediaStats || { class_photo: 0, class_video: 0, student_photo: 0, student_video: 0 },
                                has_media: mediaStats ? Object.values(mediaStats).some(function (count) { return count > 0; }) : false,
                                plan_status: plan.plan_status,
                                progress_records: progressRecords.map(function (record) { return ({
                                    id: record.id,
                                    session_number: record.session_number,
                                    session_date: record.session_date,
                                    completion_status: record.completion_status,
                                    teacher_confirmed: record.teacher_confirmed,
                                    attendance_count: record.attendance_count,
                                    target_achieved_count: record.target_achieved_count,
                                    achievement_rate: record.achievement_rate,
                                    has_class_media: record.has_class_media,
                                    class_media_count: record.class_media_count,
                                    has_student_media: record.has_student_media,
                                    student_media_count: record.student_media_count,
                                    teacher: record.teacher,
                                    confirmed_at: record.confirmed_at
                                }); })
                            }];
                }
            });
        });
    };
    /**
     * 获取媒体统计数据
     */
    TeachingCenterService.getMediaStats = function (progressIds) {
        return __awaiter(this, void 0, void 0, function () {
            var mediaStats, mediaCount;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (progressIds.length === 0) {
                            return [2 /*return*/, {
                                    class_photo: 0,
                                    class_video: 0,
                                    student_photo: 0,
                                    student_video: 0
                                }];
                        }
                        return [4 /*yield*/, teaching_media_record_model_1["default"].findAll({
                                where: {
                                    course_progress_id: (_a = {}, _a[sequelize_1.Op["in"]] = progressIds, _a),
                                    status: 'active'
                                },
                                attributes: [
                                    'media_type',
                                    [teaching_media_record_model_1["default"].sequelize.fn('COUNT', teaching_media_record_model_1["default"].sequelize.col('id')), 'count']
                                ],
                                group: ['media_type'],
                                raw: true
                            })];
                    case 1:
                        mediaStats = _b.sent();
                        mediaCount = {
                            class_photo: 0,
                            class_video: 0,
                            student_photo: 0,
                            student_video: 0
                        };
                        mediaStats.forEach(function (stat) {
                            mediaCount[stat.media_type] = parseInt(stat.count);
                        });
                        return [2 /*return*/, mediaCount];
                }
            });
        });
    };
    /**
     * 计算整体统计数据
     */
    TeachingCenterService.calculateOverallStats = function (progressStats) {
        // 检查输入参数
        if (!Array.isArray(progressStats)) {
            progressStats = [];
        }
        var overallStats = {
            total_plans: progressStats.length,
            active_plans: progressStats.filter(function (p) { return p && p.plan_status === 'active'; }).length,
            completed_plans: progressStats.filter(function (p) { return p && p.plan_status === 'completed'; }).length,
            total_sessions: progressStats.reduce(function (sum, p) { return sum + ((p === null || p === void 0 ? void 0 : p.total_sessions) || 0); }, 0),
            completed_sessions: progressStats.reduce(function (sum, p) { return sum + ((p === null || p === void 0 ? void 0 : p.completed_sessions) || 0); }, 0),
            confirmed_sessions: progressStats.reduce(function (sum, p) { return sum + ((p === null || p === void 0 ? void 0 : p.confirmed_sessions) || 0); }, 0),
            overall_completion_rate: 0,
            overall_confirmation_rate: 0,
            overall_achievement_rate: 0,
            plans_with_media: progressStats.filter(function (p) { return p && p.has_media; }).length
        };
        if (overallStats.total_sessions > 0) {
            overallStats.overall_completion_rate = Math.round((overallStats.completed_sessions / overallStats.total_sessions) * 100);
            overallStats.overall_confirmation_rate = Math.round((overallStats.confirmed_sessions / overallStats.total_sessions) * 100);
        }
        if (progressStats.length > 0) {
            overallStats.overall_achievement_rate = Math.round(progressStats.reduce(function (sum, p) { return sum + ((p === null || p === void 0 ? void 0 : p.avg_achievement_rate) || 0); }, 0) / progressStats.length);
        }
        return overallStats;
    };
    /**
     * 获取班级详细达标情况
     */
    TeachingCenterService.getClassDetailedProgress = function (classId, coursePlanId) {
        return __awaiter(this, void 0, void 0, function () {
            var classInfo, coursePlan, progressRecords, studentProgress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, class_model_1.Class.findByPk(classId, {
                            include: [
                                {
                                    model: student_model_1.Student,
                                    as: 'students',
                                    attributes: ['id', 'name', 'student_no', 'photo_url']
                                }
                            ]
                        })];
                    case 1:
                        classInfo = _a.sent();
                        if (!classInfo) {
                            throw new Error('班级不存在');
                        }
                        return [4 /*yield*/, course_plan_model_1["default"].findByPk(coursePlanId, {
                                include: [
                                    {
                                        model: brain_science_course_model_1["default"],
                                        as: 'course',
                                        attributes: ['id', 'course_name', 'course_description']
                                    }
                                ]
                            })];
                    case 2:
                        coursePlan = _a.sent();
                        if (!coursePlan) {
                            throw new Error('课程计划不存在');
                        }
                        return [4 /*yield*/, course_progress_model_1["default"].findAll({
                                where: {
                                    course_plan_id: coursePlanId,
                                    class_id: classId
                                },
                                order: [['session_number', 'ASC']]
                            })];
                    case 3:
                        progressRecords = _a.sent();
                        studentProgress = this.calculateStudentProgress(classInfo.students || [], progressRecords, coursePlan);
                        return [2 /*return*/, {
                                class_info: {
                                    id: classInfo.id,
                                    name: classInfo.name,
                                    student_count: classInfo.currentStudentCount
                                },
                                course_plan: {
                                    id: coursePlan.id,
                                    course: coursePlan.course,
                                    semester: coursePlan.semester,
                                    academic_year: coursePlan.academic_year,
                                    target_achievement_rate: coursePlan.target_achievement_rate,
                                    total_sessions: coursePlan.total_sessions,
                                    completed_sessions: coursePlan.completed_sessions
                                },
                                student_progress: studentProgress,
                                summary: {
                                    total_students: studentProgress.length,
                                    achieved_students: studentProgress.filter(function (s) { return s.is_target_achieved; }).length,
                                    class_achievement_rate: studentProgress.length > 0
                                        ? Math.round((studentProgress.filter(function (s) { return s.is_target_achieved; }).length / studentProgress.length) * 100)
                                        : 0
                                }
                            }];
                }
            });
        });
    };
    /**
     * 计算学生进度
     */
    TeachingCenterService.calculateStudentProgress = function (students, progressRecords, coursePlan) {
        return students.map(function (student) {
            // 计算该学生的总体达标情况
            var attendedSessions = progressRecords.filter(function (record) {
                return record.attendance_count > 0;
            } // 简化逻辑，实际需要更详细的学生出勤记录
            ).length;
            var achievedSessions = Math.floor(attendedSessions * 0.8); // 假设80%的出勤课时达标
            var achievementRate = attendedSessions > 0 ? (achievedSessions / attendedSessions) * 100 : 0;
            return {
                student_id: student.id,
                student_name: student.name,
                student_no: student.studentNo,
                photo_url: student.photoUrl,
                attended_sessions: attendedSessions,
                achieved_sessions: achievedSessions,
                achievement_rate: Math.round(achievementRate),
                is_target_achieved: achievementRate >= coursePlan.target_achievement_rate
            };
        });
    };
    /**
     * 教师确认完成课程
     */
    TeachingCenterService.confirmCourseCompletion = function (progressId, teacherId, data) {
        return __awaiter(this, void 0, void 0, function () {
            var progress, achievementRate, coursePlan, completedCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, course_progress_model_1["default"].findByPk(progressId)];
                    case 1:
                        progress = _a.sent();
                        if (!progress) {
                            throw new Error('课程进度记录不存在');
                        }
                        achievementRate = data.attendance_count > 0
                            ? Math.round((data.target_achieved_count / data.attendance_count) * 100)
                            : 0;
                        // 更新进度记录
                        return [4 /*yield*/, progress.update({
                                completion_status: 'completed',
                                teacher_confirmed: true,
                                teacher_id: teacherId,
                                attendance_count: data.attendance_count,
                                target_achieved_count: data.target_achieved_count,
                                achievement_rate: achievementRate,
                                session_content: data.session_content,
                                notes: data.notes,
                                confirmed_at: new Date()
                            })];
                    case 2:
                        // 更新进度记录
                        _a.sent();
                        return [4 /*yield*/, course_plan_model_1["default"].findByPk(progress.course_plan_id)];
                    case 3:
                        coursePlan = _a.sent();
                        if (!coursePlan) return [3 /*break*/, 6];
                        return [4 /*yield*/, course_progress_model_1["default"].count({
                                where: {
                                    course_plan_id: coursePlan.id,
                                    completion_status: 'completed'
                                }
                            })];
                    case 4:
                        completedCount = _a.sent();
                        return [4 /*yield*/, coursePlan.update({
                                completed_sessions: completedCount
                            })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/, {
                            progress_id: progress.id,
                            completion_status: progress.completion_status,
                            achievement_rate: achievementRate,
                            confirmed_at: progress.confirmed_at
                        }];
                }
            });
        });
    };
    /**
     * 更新媒体统计缓存
     */
    TeachingCenterService.updateMediaCache = function (courseProgressId) {
        return __awaiter(this, void 0, void 0, function () {
            var mediaCount, progress;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, teaching_media_record_model_1["default"].countByMediaType(0, courseProgressId)];
                    case 1:
                        mediaCount = _a.sent();
                        return [4 /*yield*/, course_progress_model_1["default"].findByPk(courseProgressId)];
                    case 2:
                        progress = _a.sent();
                        if (!progress) return [3 /*break*/, 4];
                        return [4 /*yield*/, progress.update({
                                has_class_media: (mediaCount.class_photo + mediaCount.class_video) > 0,
                                class_media_count: mediaCount.class_photo + mediaCount.class_video,
                                has_student_media: (mediaCount.student_photo + mediaCount.student_video) > 0,
                                student_media_count: mediaCount.student_photo + mediaCount.student_video
                            })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ==================== 户外训练相关方法 ====================
    /**
     * 获取户外训练统计数据
     */
    TeachingCenterService.getOutdoorTrainingStats = function (semester, academicYear, userId, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, records_1, classStatsMap_1, classStatistics, totalOutdoorCompleted, totalDepartureCompleted, avgOutdoorRate, avgDepartureRate, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        console.log('🏃 获取户外训练统计数据，参数:', { semester: semester, academicYear: academicYear, userId: userId, userRole: userRole });
                        whereClause = { semester: semester, academic_year: academicYear };
                        return [4 /*yield*/, outdoor_training_record_model_1["default"].findAll({
                                where: whereClause,
                                include: [
                                    {
                                        model: class_model_1.Class,
                                        as: 'class',
                                        attributes: ['id', 'name', 'current_student_count', 'head_teacher_id', 'assistant_teacher_id']
                                    }
                                ]
                            })];
                    case 1:
                        records_1 = _a.sent();
                        classStatsMap_1 = new Map();
                        records_1.forEach(function (record) {
                            var _a;
                            var classId = record.class_id;
                            if (!classStatsMap_1.has(classId)) {
                                classStatsMap_1.set(classId, {
                                    class_id: classId,
                                    class_name: ((_a = record["class"]) === null || _a === void 0 ? void 0 : _a.name) || '未知班级',
                                    outdoor_training_completed: 0,
                                    departure_display_completed: 0,
                                    outdoor_training_total_rate: 0,
                                    departure_display_total_rate: 0,
                                    outdoor_training_count: 0,
                                    departure_display_count: 0
                                });
                            }
                            var stats = classStatsMap_1.get(classId);
                            if (record.completion_status === 'completed') {
                                if (record.training_type === 'outdoor_training') {
                                    stats.outdoor_training_completed++;
                                    stats.outdoor_training_total_rate += record.achievement_rate || 0;
                                    stats.outdoor_training_count++;
                                }
                                else if (record.training_type === 'departure_display') {
                                    stats.departure_display_completed++;
                                    stats.departure_display_total_rate += record.achievement_rate || 0;
                                    stats.departure_display_count++;
                                }
                            }
                        });
                        classStatistics = Array.from(classStatsMap_1.values()).map(function (stats) { return ({
                            class_id: stats.class_id,
                            class_name: stats.class_name,
                            outdoor_training_completed: stats.outdoor_training_completed,
                            departure_display_completed: stats.departure_display_completed,
                            outdoor_training_rate: stats.outdoor_training_count > 0
                                ? Math.round(stats.outdoor_training_total_rate / stats.outdoor_training_count)
                                : 0,
                            departure_display_rate: stats.departure_display_count > 0
                                ? Math.round(stats.departure_display_total_rate / stats.departure_display_count)
                                : 0,
                            total_completed: stats.outdoor_training_completed + stats.departure_display_completed,
                            total_rate: (stats.outdoor_training_count + stats.departure_display_count) > 0
                                ? Math.round((stats.outdoor_training_total_rate + stats.departure_display_total_rate) /
                                    (stats.outdoor_training_count + stats.departure_display_count))
                                : 0,
                            has_media: false,
                            media_count: 0
                        }); });
                        // 🔒 角色过滤：教师只能看到自己负责的班级
                        if (userRole === 'teacher' && userId) {
                            console.log("\uD83D\uDD12 \u6559\u5E08\u89D2\u8272\u8FC7\u6EE4\uFF0C\u6559\u5E08ID: ".concat(userId));
                            classStatistics = classStatistics.filter(function (classItem) {
                                var _a;
                                var classData = (_a = records_1.find(function (r) { return r.class_id === classItem.class_id; })) === null || _a === void 0 ? void 0 : _a["class"];
                                if (!classData)
                                    return false;
                                var isHeadTeacher = classData.head_teacher_id === userId;
                                var isAssistantTeacher = classData.assistant_teacher_id === userId;
                                return isHeadTeacher || isAssistantTeacher;
                            });
                            console.log("\uD83D\uDD12 \u8FC7\u6EE4\u540E\u73ED\u7EA7\u6570\u91CF: ".concat(classStatistics.length));
                        }
                        else {
                            console.log("\uD83D\uDC51 \u56ED\u957F/\u7BA1\u7406\u5458\u89D2\u8272\uFF0C\u663E\u793A\u6240\u6709\u73ED\u7EA7: ".concat(classStatistics.length));
                        }
                        totalOutdoorCompleted = classStatistics.reduce(function (sum, s) { return sum + s.outdoor_training_completed; }, 0);
                        totalDepartureCompleted = classStatistics.reduce(function (sum, s) { return sum + s.departure_display_completed; }, 0);
                        avgOutdoorRate = classStatistics.length > 0
                            ? Math.round(classStatistics.reduce(function (sum, s) { return sum + s.outdoor_training_rate; }, 0) / classStatistics.length)
                            : 0;
                        avgDepartureRate = classStatistics.length > 0
                            ? Math.round(classStatistics.reduce(function (sum, s) { return sum + s.departure_display_rate; }, 0) / classStatistics.length)
                            : 0;
                        return [2 /*return*/, {
                                overview: {
                                    total_weeks: 16,
                                    outdoor_training: {
                                        completed_weeks: Math.round(totalOutdoorCompleted / Math.max(classStatistics.length, 1)),
                                        average_rate: avgOutdoorRate
                                    },
                                    departure_display: {
                                        completed_weeks: Math.round(totalDepartureCompleted / Math.max(classStatistics.length, 1)),
                                        average_rate: avgDepartureRate
                                    }
                                },
                                class_statistics: classStatistics
                            }];
                    case 2:
                        error_2 = _a.sent();
                        console.error('Error in getOutdoorTrainingStats:', error_2);
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级户外训练详情
     */
    TeachingCenterService.getClassOutdoorTrainingDetails = function (classId, semester, academicYear) {
        return __awaiter(this, void 0, void 0, function () {
            var classInfo, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, class_model_1.Class.findByPk(classId)];
                    case 1:
                        classInfo = _a.sent();
                        if (!classInfo) {
                            throw new Error('班级不存在');
                        }
                        return [4 /*yield*/, outdoor_training_record_model_1["default"].findAll({
                                where: {
                                    class_id: classId,
                                    semester: semester,
                                    academic_year: academicYear
                                },
                                include: [{
                                        model: teacher_model_1.Teacher,
                                        as: 'teacher',
                                        attributes: ['id', 'name']
                                    }],
                                order: [['week_number', 'ASC']]
                            })];
                    case 2:
                        records = _a.sent();
                        return [2 /*return*/, {
                                class_info: {
                                    id: classInfo.id,
                                    name: classInfo.name
                                },
                                training_records: records.map(function (record) { return ({
                                    id: record.id,
                                    week_number: record.week_number,
                                    training_type: record.training_type,
                                    training_date: record.training_date,
                                    completion_status: record.completion_status,
                                    attendance_count: record.attendance_count,
                                    target_achieved_count: record.target_achieved_count,
                                    achievement_rate: record.achievement_rate,
                                    location: record.location,
                                    weather_condition: record.weather_condition,
                                    duration_minutes: record.duration_minutes,
                                    activities_content: record.activities_content,
                                    notes: record.notes,
                                    teacher: record.teacher ? {
                                        id: record.teacher.id,
                                        name: record.teacher.name
                                    } : null,
                                    confirmed_at: record.confirmed_at
                                }); })
                            }];
                }
            });
        });
    };
    /**
     * 记录户外训练活动
     */
    TeachingCenterService.recordOutdoorTraining = function (trainingData) {
        return __awaiter(this, void 0, void 0, function () {
            var achievementRate, record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        achievementRate = trainingData.attendance_count > 0
                            ? Math.round((trainingData.target_achieved_count / trainingData.attendance_count) * 100)
                            : 0;
                        return [4 /*yield*/, outdoor_training_record_model_1["default"].create(__assign(__assign({}, trainingData), { achievement_rate: achievementRate, confirmed_at: new Date() }))];
                    case 1:
                        record = _a.sent();
                        return [2 /*return*/, {
                                id: record.id,
                                training_type: record.training_type,
                                completion_status: record.completion_status,
                                achievement_rate: record.achievement_rate,
                                created_at: record.created_at
                            }];
                }
            });
        });
    };
    // ==================== 校外展示相关方法 ====================
    /**
     * 获取校外展示统计数据
     */
    TeachingCenterService.getExternalDisplayStats = function (semester, academicYear, userId, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var semesterRecords_1, allRecords, classStatsMap_2, classStatistics, completedActivities, totalActivities, completionRate, avgAchievementRate, semesterTotalOutings, allTimeTotalOutings, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        console.log('🎭 获取校外展示统计数据，参数:', { semester: semester, academicYear: academicYear, userId: userId, userRole: userRole });
                        return [4 /*yield*/, external_display_record_model_1["default"].findAll({
                                where: { semester: semester, academic_year: academicYear },
                                include: [
                                    {
                                        model: class_model_1.Class,
                                        as: 'class',
                                        attributes: ['id', 'name', 'head_teacher_id', 'assistant_teacher_id']
                                    }
                                ]
                            })];
                    case 1:
                        semesterRecords_1 = _a.sent();
                        return [4 /*yield*/, external_display_record_model_1["default"].findAll({
                                include: [
                                    {
                                        model: class_model_1.Class,
                                        as: 'class',
                                        attributes: ['id', 'name', 'head_teacher_id', 'assistant_teacher_id']
                                    }
                                ]
                            })];
                    case 2:
                        allRecords = _a.sent();
                        classStatsMap_2 = new Map();
                        // 统计本学期数据
                        semesterRecords_1.forEach(function (record) {
                            var _a;
                            var classId = record.class_id;
                            if (!classStatsMap_2.has(classId)) {
                                classStatsMap_2.set(classId, {
                                    class_id: classId,
                                    class_name: ((_a = record["class"]) === null || _a === void 0 ? void 0 : _a.name) || '未知班级',
                                    semester_outings: 0,
                                    total_outings: 0,
                                    total_achievement_rate: 0,
                                    achievement_count: 0
                                });
                            }
                            var stats = classStatsMap_2.get(classId);
                            if (record.completion_status === 'completed') {
                                stats.semester_outings++;
                                stats.total_achievement_rate += record.achievement_rate || 0;
                                stats.achievement_count++;
                            }
                        });
                        // 统计累计数据
                        allRecords.forEach(function (record) {
                            var classId = record.class_id;
                            if (classStatsMap_2.has(classId)) {
                                var stats = classStatsMap_2.get(classId);
                                if (record.completion_status === 'completed') {
                                    stats.total_outings++;
                                }
                            }
                        });
                        classStatistics = Array.from(classStatsMap_2.values()).map(function (stats) { return ({
                            class_id: stats.class_id,
                            class_name: stats.class_name,
                            semester_outings: stats.semester_outings,
                            total_outings: stats.total_outings,
                            achievement_rate: stats.achievement_count > 0
                                ? Math.round(stats.total_achievement_rate / stats.achievement_count)
                                : 0,
                            has_media: false,
                            media_count: 0
                        }); });
                        // 🔒 角色过滤：教师只能看到自己负责的班级
                        if (userRole === 'teacher' && userId) {
                            console.log("\uD83D\uDD12 \u6559\u5E08\u89D2\u8272\u8FC7\u6EE4\uFF0C\u6559\u5E08ID: ".concat(userId));
                            classStatistics = classStatistics.filter(function (classItem) {
                                var _a;
                                var classData = (_a = semesterRecords_1.find(function (r) { return r.class_id === classItem.class_id; })) === null || _a === void 0 ? void 0 : _a["class"];
                                if (!classData)
                                    return false;
                                var isHeadTeacher = classData.head_teacher_id === userId;
                                var isAssistantTeacher = classData.assistant_teacher_id === userId;
                                return isHeadTeacher || isAssistantTeacher;
                            });
                            console.log("\uD83D\uDD12 \u8FC7\u6EE4\u540E\u73ED\u7EA7\u6570\u91CF: ".concat(classStatistics.length));
                        }
                        else {
                            console.log("\uD83D\uDC51 \u56ED\u957F/\u7BA1\u7406\u5458\u89D2\u8272\uFF0C\u663E\u793A\u6240\u6709\u73ED\u7EA7: ".concat(classStatistics.length));
                        }
                        completedActivities = semesterRecords_1.filter(function (r) { return r.completion_status === 'completed'; }).length;
                        totalActivities = semesterRecords_1.length;
                        completionRate = totalActivities > 0 ? Math.round((completedActivities / totalActivities) * 100) : 0;
                        avgAchievementRate = classStatistics.length > 0
                            ? Math.round(classStatistics.reduce(function (sum, s) { return sum + s.achievement_rate; }, 0) / classStatistics.length)
                            : 0;
                        semesterTotalOutings = classStatistics.reduce(function (sum, s) { return sum + s.semester_outings; }, 0);
                        allTimeTotalOutings = classStatistics.reduce(function (sum, s) { return sum + s.total_outings; }, 0);
                        return [2 /*return*/, {
                                overview: {
                                    total_activities: totalActivities,
                                    completed_activities: completedActivities,
                                    completion_rate: completionRate,
                                    average_achievement_rate: avgAchievementRate,
                                    semester_total_outings: semesterTotalOutings,
                                    all_time_total_outings: allTimeTotalOutings
                                },
                                class_statistics: classStatistics
                            }];
                    case 3:
                        error_3 = _a.sent();
                        console.error('Error in getExternalDisplayStats:', error_3);
                        throw error_3;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取班级校外展示详情
     */
    TeachingCenterService.getClassExternalDisplayDetails = function (classId, semester, academicYear) {
        return __awaiter(this, void 0, void 0, function () {
            var classInfo, records;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, class_model_1.Class.findByPk(classId)];
                    case 1:
                        classInfo = _a.sent();
                        if (!classInfo) {
                            throw new Error('班级不存在');
                        }
                        return [4 /*yield*/, external_display_record_model_1["default"].findAll({
                                where: {
                                    class_id: classId,
                                    semester: semester,
                                    academic_year: academicYear
                                },
                                include: [{
                                        model: teacher_model_1.Teacher,
                                        as: 'teacher',
                                        attributes: ['id', 'name']
                                    }],
                                order: [['activity_date', 'DESC']]
                            })];
                    case 2:
                        records = _a.sent();
                        return [2 /*return*/, {
                                class_info: {
                                    id: classInfo.id,
                                    name: classInfo.name
                                },
                                display_records: records.map(function (record) { return ({
                                    id: record.id,
                                    activity_name: record.activity_name,
                                    activity_type: record.activity_type,
                                    activity_date: record.activity_date,
                                    location: record.location,
                                    completion_status: record.completion_status,
                                    participant_count: record.participant_count,
                                    achievement_level: record.achievement_level,
                                    achievement_rate: record.achievement_rate,
                                    budget_amount: record.budget_amount,
                                    actual_cost: record.actual_cost,
                                    transportation_method: record.transportation_method,
                                    safety_measures: record.safety_measures,
                                    activity_description: record.activity_description,
                                    results_summary: record.results_summary,
                                    notes: record.notes,
                                    teacher: record.teacher ? {
                                        id: record.teacher.id,
                                        name: record.teacher.name
                                    } : null,
                                    confirmed_at: record.confirmed_at
                                }); })
                            }];
                }
            });
        });
    };
    /**
     * 记录校外展示活动
     */
    TeachingCenterService.recordExternalDisplay = function (displayData) {
        return __awaiter(this, void 0, void 0, function () {
            var record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, external_display_record_model_1["default"].create(__assign(__assign({}, displayData), { confirmed_at: new Date() }))];
                    case 1:
                        record = _a.sent();
                        return [2 /*return*/, {
                                id: record.id,
                                display_location: record.display_location,
                                display_type: record.display_type,
                                display_date: record.display_date,
                                achievement_level: record.achievement_level,
                                created_at: record.created_at
                            }];
                }
            });
        });
    };
    // ==================== 全员锦标赛相关方法 ====================
    /**
     * 获取锦标赛统计数据
     */
    TeachingCenterService.getChampionshipStats = function (semester, academicYear, userId, userRole) {
        return __awaiter(this, void 0, void 0, function () {
            var semesterRecords, allRecords, totalClasses, totalStudents, completedRecords, completionRate, avgBrainScience, avgCourseContent, avgOutdoorTraining, avgExternalDisplay, avgClassParticipationRate, avgStudentParticipationRate, avgParticipatingClassCount, avgParticipantCount, championshipList, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        console.log('🏆 获取锦标赛统计数据，参数:', { semester: semester, academicYear: academicYear, userId: userId, userRole: userRole });
                        return [4 /*yield*/, championship_record_model_1["default"].findAll({
                                where: { semester: semester, academic_year: academicYear }
                            })];
                    case 1:
                        semesterRecords = _a.sent();
                        return [4 /*yield*/, championship_record_model_1["default"].findAll()];
                    case 2:
                        allRecords = _a.sent();
                        return [4 /*yield*/, class_model_1.Class.count()];
                    case 3:
                        totalClasses = _a.sent();
                        return [4 /*yield*/, student_model_1.Student.count()];
                    case 4:
                        totalStudents = _a.sent();
                        completedRecords = semesterRecords.filter(function (r) { return r.completion_status === 'completed'; });
                        completionRate = semesterRecords.length > 0
                            ? Math.round((completedRecords.length / semesterRecords.length) * 100)
                            : 0;
                        avgBrainScience = completedRecords.length > 0
                            ? Math.round(completedRecords.reduce(function (sum, r) { return sum + (r.brain_science_achievement_rate || 0); }, 0) / completedRecords.length)
                            : 0;
                        avgCourseContent = completedRecords.length > 0
                            ? Math.round(completedRecords.reduce(function (sum, r) { return sum + (r.course_content_achievement_rate || 0); }, 0) / completedRecords.length)
                            : 0;
                        avgOutdoorTraining = completedRecords.length > 0
                            ? Math.round(completedRecords.reduce(function (sum, r) { return sum + (r.outdoor_training_achievement_rate || 0); }, 0) / completedRecords.length)
                            : 0;
                        avgExternalDisplay = completedRecords.length > 0
                            ? Math.round(completedRecords.reduce(function (sum, r) { return sum + (r.external_display_achievement_rate || 0); }, 0) / completedRecords.length)
                            : 0;
                        avgClassParticipationRate = completedRecords.length > 0
                            ? Math.round(completedRecords.reduce(function (sum, r) { return sum + (r.class_participation_rate || 0); }, 0) / completedRecords.length)
                            : 0;
                        avgStudentParticipationRate = completedRecords.length > 0
                            ? Math.round(completedRecords.reduce(function (sum, r) { return sum + (r.student_participation_rate || 0); }, 0) / completedRecords.length)
                            : 0;
                        avgParticipatingClassCount = completedRecords.length > 0
                            ? Math.round(completedRecords.reduce(function (sum, r) { return sum + (r.participating_class_count || 0); }, 0) / completedRecords.length)
                            : 0;
                        avgParticipantCount = completedRecords.length > 0
                            ? Math.round(completedRecords.reduce(function (sum, r) { return sum + (r.total_participants || 0); }, 0) / completedRecords.length)
                            : 0;
                        championshipList = semesterRecords.map(function (record) { return ({
                            id: record.id,
                            championship_name: record.championship_name,
                            championship_date: record.championship_date,
                            completion_status: record.completion_status,
                            participant_count: record.total_participants,
                            participating_class_count: record.participating_class_count,
                            class_participation_rate: record.class_participation_rate,
                            student_participation_rate: record.student_participation_rate,
                            brain_science_achievement_rate: record.brain_science_achievement_rate,
                            course_content_achievement_rate: record.course_content_achievement_rate,
                            outdoor_training_achievement_rate: record.outdoor_training_achievement_rate,
                            external_display_achievement_rate: record.external_display_achievement_rate,
                            overall_achievement_rate: record.overall_achievement_rate,
                            has_media: record.has_media,
                            media_count: record.media_count
                        }); });
                        // 🔒 角色过滤：锦标赛是全园性活动，教师可以查看但不能修改
                        // 园长和教师都可以看到锦标赛数据，因为这是全员参与的活动
                        if (userRole === 'teacher' && userId) {
                            console.log("\uD83D\uDC68\u200D\uD83C\uDFEB \u6559\u5E08\u89D2\u8272\uFF0C\u53EF\u4EE5\u67E5\u770B\u9526\u6807\u8D5B\u6570\u636E\uFF08\u5168\u5458\u6D3B\u52A8\uFF09");
                        }
                        else {
                            console.log("\uD83D\uDC51 \u56ED\u957F/\u7BA1\u7406\u5458\u89D2\u8272\uFF0C\u53EF\u4EE5\u67E5\u770B\u548C\u7BA1\u7406\u9526\u6807\u8D5B\u6570\u636E");
                        }
                        return [2 /*return*/, {
                                overview: {
                                    semester_championships: semesterRecords.length,
                                    total_championships: allRecords.length,
                                    completed_championships: completedRecords.length,
                                    completion_rate: completionRate,
                                    total_classes: totalClasses,
                                    total_students: totalStudents,
                                    avg_participating_class_count: avgParticipatingClassCount,
                                    avg_participant_count: avgParticipantCount,
                                    avg_class_participation_rate: avgClassParticipationRate,
                                    avg_student_participation_rate: avgStudentParticipationRate
                                },
                                achievement_rates: {
                                    brain_science_plan: avgBrainScience,
                                    course_content: avgCourseContent,
                                    outdoor_training_display: avgOutdoorTraining,
                                    external_display: avgExternalDisplay
                                },
                                championship_list: championshipList
                            }];
                    case 5:
                        error_4 = _a.sent();
                        console.error('Error in getChampionshipStats:', error_4);
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取锦标赛详情
     */
    TeachingCenterService.getChampionshipDetails = function (championshipId) {
        return __awaiter(this, void 0, void 0, function () {
            var championship;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, championship_record_model_1["default"].findByPk(championshipId, {
                            include: [{
                                    model: teacher_model_1.Teacher,
                                    as: 'organizer',
                                    attributes: ['id', 'name']
                                }]
                        })];
                    case 1:
                        championship = _a.sent();
                        if (!championship) {
                            throw new Error('锦标赛记录不存在');
                        }
                        return [2 /*return*/, {
                                id: championship.id,
                                championship_name: championship.championship_name,
                                championship_type: championship.championship_type,
                                championship_date: championship.championship_date,
                                completion_status: championship.completion_status,
                                total_participants: championship.total_participants,
                                brain_science_achievement_rate: championship.brain_science_achievement_rate,
                                course_content_achievement_rate: championship.course_content_achievement_rate,
                                outdoor_training_achievement_rate: championship.outdoor_training_achievement_rate,
                                external_display_achievement_rate: championship.external_display_achievement_rate,
                                overall_achievement_rate: championship.overall_achievement_rate,
                                has_media: championship.has_media,
                                media_count: championship.media_count,
                                awards: championship.awards,
                                winners: championship.winners,
                                summary: championship.summary,
                                notes: championship.notes,
                                organizer: championship.organizer ? {
                                    id: championship.organizer.id,
                                    name: championship.organizer.name
                                } : null,
                                created_at: championship.created_at,
                                updated_at: championship.updated_at
                            }];
                }
            });
        });
    };
    /**
     * 创建锦标赛
     */
    TeachingCenterService.createChampionship = function (championshipData) {
        return __awaiter(this, void 0, void 0, function () {
            var championship;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, championship_record_model_1["default"].create(championshipData)];
                    case 1:
                        championship = _a.sent();
                        return [2 /*return*/, {
                                id: championship.id,
                                championship_name: championship.championship_name,
                                championship_type: championship.championship_type,
                                championship_date: championship.championship_date,
                                completion_status: championship.completion_status,
                                created_at: championship.created_at
                            }];
                }
            });
        });
    };
    /**
     * 更新锦标赛状态
     */
    TeachingCenterService.updateChampionshipStatus = function (championshipId, status, achievementRates) {
        return __awaiter(this, void 0, void 0, function () {
            var championship;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, championship_record_model_1["default"].findByPk(championshipId)];
                    case 1:
                        championship = _a.sent();
                        if (!championship) {
                            throw new Error('锦标赛记录不存在');
                        }
                        return [4 /*yield*/, championship.update({
                                completion_status: status,
                                brain_science_achievement_rate: achievementRates.brain_science || championship.brain_science_achievement_rate,
                                course_content_achievement_rate: achievementRates.course_content || championship.course_content_achievement_rate,
                                outdoor_training_achievement_rate: achievementRates.outdoor_training || championship.outdoor_training_achievement_rate,
                                external_display_achievement_rate: achievementRates.external_display || championship.external_display_achievement_rate,
                                updated_at: new Date()
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                id: championship.id,
                                completion_status: championship.completion_status,
                                updated_at: championship.updated_at
                            }];
                }
            });
        });
    };
    // ==================== 媒体管理相关方法 ====================
    /**
     * 上传教学媒体文件
     */
    TeachingCenterService.uploadTeachingMedia = function (mediaData) {
        return __awaiter(this, void 0, void 0, function () {
            var media;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, teaching_media_record_model_1["default"].create(__assign(__assign({}, mediaData), { upload_time: new Date(), status: 'active' }))];
                    case 1:
                        media = _a.sent();
                        return [2 /*return*/, {
                                id: media.id,
                                media_type: media.media_type,
                                status: media.status,
                                upload_time: media.upload_time
                            }];
                }
            });
        });
    };
    /**
     * 获取教学媒体列表
     */
    TeachingCenterService.getTeachingMediaList = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, mediaList;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = {
                            status: 'active'
                        };
                        if (filters.record_type) {
                            whereClause.record_type = filters.record_type;
                        }
                        if (filters.record_id) {
                            whereClause.record_id = filters.record_id;
                        }
                        if (filters.media_type) {
                            whereClause.media_type = filters.media_type;
                        }
                        return [4 /*yield*/, teaching_media_record_model_1["default"].findAll({
                                where: whereClause,
                                include: [{
                                        model: file_storage_model_1.FileStorage,
                                        as: 'file',
                                        attributes: ['id', 'filename', 'originalName', 'mimeType', 'size', 'url']
                                    }],
                                order: [['upload_date', 'DESC']]
                            })];
                    case 1:
                        mediaList = _a.sent();
                        return [2 /*return*/, mediaList.map(function (media) { return ({
                                id: media.id,
                                record_type: media.record_type,
                                record_id: media.record_id,
                                media_type: media.media_type,
                                description: media.description,
                                upload_date: media.upload_date,
                                file: media.file ? {
                                    id: media.file.id,
                                    filename: media.file.filename,
                                    original_name: media.file.originalName,
                                    mime_type: media.file.mimeType,
                                    size: media.file.size,
                                    url: media.file.url
                                } : null
                            }); })];
                }
            });
        });
    };
    /**
     * 删除教学媒体文件
     */
    TeachingCenterService.deleteTeachingMedia = function (mediaId) {
        return __awaiter(this, void 0, void 0, function () {
            var media;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, teaching_media_record_model_1["default"].findByPk(mediaId)];
                    case 1:
                        media = _a.sent();
                        if (!media) {
                            throw new Error('媒体文件不存在');
                        }
                        return [4 /*yield*/, media.update({
                                status: 'deleted',
                                updated_at: new Date()
                            })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                id: media.id,
                                status: media.status,
                                updated_at: media.updated_at
                            }];
                }
            });
        });
    };
    /**
     * 获取媒体统计信息
     */
    TeachingCenterService.getMediaStatistics = function (recordType, recordId) {
        return __awaiter(this, void 0, void 0, function () {
            var whereClause, stats, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        whereClause = {
                            record_type: recordType,
                            status: 'active'
                        };
                        if (recordId) {
                            whereClause.record_id = recordId;
                        }
                        return [4 /*yield*/, teaching_media_record_model_1["default"].findAll({
                                where: whereClause,
                                attributes: [
                                    'media_type',
                                    [(0, sequelize_1.fn)('COUNT', (0, sequelize_1.col)('id')), 'count']
                                ],
                                group: ['media_type'],
                                raw: true
                            })];
                    case 1:
                        stats = _a.sent();
                        result = {
                            class_photo: 0,
                            class_video: 0,
                            student_photo: 0,
                            student_video: 0,
                            total: 0
                        };
                        stats.forEach(function (stat) {
                            result[stat.media_type] = parseInt(stat.count);
                            result.total += parseInt(stat.count);
                        });
                        return [2 /*return*/, result];
                }
            });
        });
    };
    return TeachingCenterService;
}());
exports.TeachingCenterService = TeachingCenterService;
