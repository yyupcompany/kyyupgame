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
exports.OrganizationStatusService = void 0;
var organization_status_model_1 = require("../models/organization-status.model");
var kindergarten_model_1 = require("../models/kindergarten.model");
var student_model_1 = require("../models/student.model");
var teacher_model_1 = require("../models/teacher.model");
var class_model_1 = require("../models/class.model");
var enrollment_application_model_1 = require("../models/enrollment-application.model");
var enrollment_consultation_model_1 = require("../models/enrollment-consultation.model");
var customer_follow_record_enhanced_model_1 = require("../models/customer-follow-record-enhanced.model");
var sequelize_1 = require("sequelize");
/**
 * 机构现状服务
 * 负责计算和更新机构的实时运营数据
 */
var OrganizationStatusService = /** @class */ (function () {
    function OrganizationStatusService() {
    }
    /**
     * 获取或创建机构现状数据
     */
    OrganizationStatusService.getOrCreateStatus = function (kindergartenId) {
        return __awaiter(this, void 0, void 0, function () {
            var status;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, organization_status_model_1.OrganizationStatus.findOne({
                            where: { kindergartenId: kindergartenId },
                            include: [{ model: kindergarten_model_1.Kindergarten, as: 'kindergarten' }]
                        })];
                    case 1:
                        status = _a.sent();
                        if (!!status) return [3 /*break*/, 3];
                        return [4 /*yield*/, organization_status_model_1.OrganizationStatus.create({
                                kindergartenId: kindergartenId,
                                totalClasses: 0,
                                totalStudents: 0,
                                totalTeachers: 0,
                                teacherStudentRatio: 0,
                                currentEnrollment: 0,
                                enrollmentCapacity: 0,
                                enrollmentRate: 0,
                                waitingListCount: 0,
                                fullTimeTeachers: 0,
                                partTimeTeachers: 0,
                                seniorTeachers: 0,
                                averageTeachingYears: 0,
                                monthlyEnrollmentFrequency: 0,
                                quarterlyEnrollmentFrequency: 0,
                                yearlyEnrollmentFrequency: 0,
                                enrollmentConversionRate: 0,
                                averageEnrollmentCycle: 0,
                                totalLeads: 0,
                                activeLeads: 0,
                                convertedLeads: 0,
                                averageFollowupCount: 0,
                                averageResponseTime: 0,
                                teacherFollowupLoad: 0,
                                dataUpdatedAt: new Date()
                            })];
                    case 2:
                        // 创建初始状态
                        status = _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, status];
                }
            });
        });
    };
    /**
     * 刷新机构现状数据
     * 从数据库实时计算最新数据
     */
    OrganizationStatusService.refreshStatus = function (kindergartenId) {
        return __awaiter(this, void 0, void 0, function () {
            var status, totalClasses, totalStudents, totalTeachers, teacherStudentRatio, kindergarten, enrollmentCapacity, currentEnrollment, enrollmentRate, waitingListCount, teachers, fullTimeTeachers, partTimeTeachers, seniorTeachers, averageTeachingYears, now, oneMonthAgo, threeMonthsAgo, oneYearAgo, monthlyEnrollmentFrequency, quarterlyEnrollmentFrequency, yearlyEnrollmentFrequency, totalApplications, convertedApplications, enrollmentConversionRate, averageEnrollmentCycle, totalLeads, activeLeads, convertedLeads, followupRecords, averageFollowupCount, averageResponseTime, teacherFollowupLoad;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, this.getOrCreateStatus(kindergartenId)];
                    case 1:
                        status = _e.sent();
                        return [4 /*yield*/, class_model_1.Class.count({ where: { kindergartenId: kindergartenId } })];
                    case 2:
                        totalClasses = _e.sent();
                        return [4 /*yield*/, student_model_1.Student.count({ where: { kindergartenId: kindergartenId, status: 1 } })];
                    case 3:
                        totalStudents = _e.sent();
                        return [4 /*yield*/, teacher_model_1.Teacher.count({ where: { kindergartenId: kindergartenId, status: 1 } })];
                    case 4:
                        totalTeachers = _e.sent();
                        teacherStudentRatio = totalStudents > 0 ? totalTeachers / totalStudents : 0;
                        return [4 /*yield*/, kindergarten_model_1.Kindergarten.findByPk(kindergartenId)];
                    case 5:
                        kindergarten = _e.sent();
                        enrollmentCapacity = (kindergarten === null || kindergarten === void 0 ? void 0 : kindergarten.studentCount) || 0;
                        currentEnrollment = totalStudents;
                        enrollmentRate = enrollmentCapacity > 0 ? (currentEnrollment / enrollmentCapacity) * 100 : 0;
                        return [4 /*yield*/, student_model_1.Student.count({
                                where: { kindergartenId: kindergartenId, status: 4 }
                            })];
                    case 6:
                        waitingListCount = _e.sent();
                        return [4 /*yield*/, teacher_model_1.Teacher.findAll({
                                where: { kindergartenId: kindergartenId, status: 1 },
                                attributes: ['position', 'teachingAge']
                            })];
                    case 7:
                        teachers = _e.sent();
                        fullTimeTeachers = teachers.filter(function (t) { return [1, 2, 3, 4, 5].includes(t.position); }).length;
                        partTimeTeachers = teachers.filter(function (t) { return t.position === 6; }).length;
                        seniorTeachers = teachers.filter(function (t) { return (t.teachingAge || 0) >= 5; }).length;
                        averageTeachingYears = teachers.length > 0
                            ? teachers.reduce(function (sum, t) { return sum + (t.teachingAge || 0); }, 0) / teachers.length
                            : 0;
                        now = new Date();
                        oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                        threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                        oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    createdAt: (_a = {}, _a[sequelize_1.Op.gte] = oneMonthAgo, _a)
                                }
                            })];
                    case 8:
                        monthlyEnrollmentFrequency = _e.sent();
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    createdAt: (_b = {}, _b[sequelize_1.Op.gte] = threeMonthsAgo, _b)
                                }
                            })];
                    case 9:
                        quarterlyEnrollmentFrequency = _e.sent();
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    createdAt: (_c = {}, _c[sequelize_1.Op.gte] = oneYearAgo, _c)
                                }
                            })];
                    case 10:
                        yearlyEnrollmentFrequency = _e.sent();
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({ where: { kindergartenId: kindergartenId } })];
                    case 11:
                        totalApplications = _e.sent();
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.count({
                                where: { kindergartenId: kindergartenId, status: 'approved' }
                            })];
                    case 12:
                        convertedApplications = _e.sent();
                        enrollmentConversionRate = totalApplications > 0
                            ? (convertedApplications / totalApplications) * 100
                            : 0;
                        averageEnrollmentCycle = 30;
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({ where: { kindergartenId: kindergartenId } })];
                    case 13:
                        totalLeads = _e.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: (_d = {}, _d[sequelize_1.Op["in"]] = ['pending', 'in_progress'], _d)
                                }
                            })];
                    case 14:
                        activeLeads = _e.sent();
                        return [4 /*yield*/, enrollment_consultation_model_1.EnrollmentConsultation.count({
                                where: { kindergartenId: kindergartenId, status: 'converted' }
                            })];
                    case 15:
                        convertedLeads = _e.sent();
                        return [4 /*yield*/, customer_follow_record_enhanced_model_1.CustomerFollowRecordEnhanced.findAll({
                                where: { kindergartenId: kindergartenId },
                                attributes: ['customerId']
                            })];
                    case 16:
                        followupRecords = _e.sent();
                        averageFollowupCount = totalLeads > 0
                            ? followupRecords.length / totalLeads
                            : 0;
                        averageResponseTime = 2.5;
                        teacherFollowupLoad = totalTeachers > 0
                            ? activeLeads / totalTeachers
                            : 0;
                        // 6. 更新数据
                        return [4 /*yield*/, status.update({
                                totalClasses: totalClasses,
                                totalStudents: totalStudents,
                                totalTeachers: totalTeachers,
                                teacherStudentRatio: Number(teacherStudentRatio.toFixed(2)),
                                currentEnrollment: currentEnrollment,
                                enrollmentCapacity: enrollmentCapacity,
                                enrollmentRate: Number(enrollmentRate.toFixed(2)),
                                waitingListCount: waitingListCount,
                                fullTimeTeachers: fullTimeTeachers,
                                partTimeTeachers: partTimeTeachers,
                                seniorTeachers: seniorTeachers,
                                averageTeachingYears: Number(averageTeachingYears.toFixed(2)),
                                monthlyEnrollmentFrequency: monthlyEnrollmentFrequency,
                                quarterlyEnrollmentFrequency: quarterlyEnrollmentFrequency,
                                yearlyEnrollmentFrequency: yearlyEnrollmentFrequency,
                                enrollmentConversionRate: Number(enrollmentConversionRate.toFixed(2)),
                                averageEnrollmentCycle: averageEnrollmentCycle,
                                totalLeads: totalLeads,
                                activeLeads: activeLeads,
                                convertedLeads: convertedLeads,
                                averageFollowupCount: Number(averageFollowupCount.toFixed(2)),
                                averageResponseTime: Number(averageResponseTime.toFixed(2)),
                                teacherFollowupLoad: Number(teacherFollowupLoad.toFixed(2)),
                                dataUpdatedAt: new Date()
                            })];
                    case 17:
                        // 6. 更新数据
                        _e.sent();
                        return [2 /*return*/, status];
                }
            });
        });
    };
    /**
     * 格式化机构现状为文本描述
     * 用于注入AI系统提示词
     */
    OrganizationStatusService.formatStatusForAI = function (status) {
        return "\n\u3010\u5E7C\u513F\u56ED\u673A\u6784\u73B0\u72B6\u6570\u636E\u3011\n\n\uD83D\uDCCA \u57FA\u672C\u60C5\u51B5:\n- \u603B\u73ED\u7EA7\u6570: ".concat(status.totalClasses, "\u4E2A\n- \u5728\u56ED\u5B66\u751F: ").concat(status.totalStudents, "\u4EBA\n- \u6559\u5E08\u603B\u6570: ").concat(status.totalTeachers, "\u4EBA\n- \u5E08\u751F\u6BD4: 1:").concat((1 / status.teacherStudentRatio).toFixed(1), "\n\n\uD83D\uDC76 \u751F\u6E90\u60C5\u51B5:\n- \u5F53\u524D\u5728\u56ED: ").concat(status.currentEnrollment, "\u4EBA\n- \u62DB\u751F\u5BB9\u91CF: ").concat(status.enrollmentCapacity, "\u4EBA\n- \u62DB\u751F\u7387: ").concat(status.enrollmentRate, "%\n- \u7B49\u5F85\u540D\u5355: ").concat(status.waitingListCount, "\u4EBA\n\n\uD83D\uDC68\u200D\uD83C\uDFEB \u5E08\u8D44\u60C5\u51B5:\n- \u5168\u804C\u6559\u5E08: ").concat(status.fullTimeTeachers, "\u4EBA\n- \u517C\u804C\u6559\u5E08: ").concat(status.partTimeTeachers, "\u4EBA\n- \u9AD8\u7EA7\u6559\u5E08: ").concat(status.seniorTeachers, "\u4EBA\n- \u5E73\u5747\u6559\u9F84: ").concat(status.averageTeachingYears, "\u5E74\n\n\uD83D\uDCC8 \u62DB\u751F\u60C5\u51B5:\n- \u6708\u62DB\u751F\u9891\u6B21: ").concat(status.monthlyEnrollmentFrequency, "\u6B21\n- \u5B63\u5EA6\u62DB\u751F\u9891\u6B21: ").concat(status.quarterlyEnrollmentFrequency, "\u6B21\n- \u5E74\u5EA6\u62DB\u751F\u9891\u6B21: ").concat(status.yearlyEnrollmentFrequency, "\u6B21\n- \u62DB\u751F\u8F6C\u5316\u7387: ").concat(status.enrollmentConversionRate, "%\n- \u5E73\u5747\u62DB\u751F\u5468\u671F: ").concat(status.averageEnrollmentCycle, "\u5929\n\n\uD83D\uDCDE \u5BA2\u6237\u8DDF\u8FDB\u73B0\u72B6:\n- \u603B\u7EBF\u7D22\u6570: ").concat(status.totalLeads, "\u4E2A\n- \u6D3B\u8DC3\u7EBF\u7D22: ").concat(status.activeLeads, "\u4E2A\n- \u5DF2\u8F6C\u5316: ").concat(status.convertedLeads, "\u4E2A\n- \u5E73\u5747\u8DDF\u8FDB\u6B21\u6570: ").concat(status.averageFollowupCount, "\u6B21\n- \u5E73\u5747\u54CD\u5E94\u65F6\u95F4: ").concat(status.averageResponseTime, "\u5C0F\u65F6\n- \u6559\u5E08\u8DDF\u8FDB\u8D1F\u8F7D: ").concat(status.teacherFollowupLoad, "\u4E2A/\u4EBA\n\n\uD83D\uDCC5 \u6570\u636E\u66F4\u65B0\u65F6\u95F4: ").concat(status.dataUpdatedAt.toLocaleString('zh-CN'), "\n").trim();
    };
    return OrganizationStatusService;
}());
exports.OrganizationStatusService = OrganizationStatusService;
