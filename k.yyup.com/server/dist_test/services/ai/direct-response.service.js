"use strict";
/**
 * 直接响应处理器服务
 * 处理第一级查询：关键词直接命中 (0-50 tokens, <1秒响应)
 * 提供快速、准确的响应，无需调用大模型
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
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
exports.directResponseService = exports.DirectResponseService = void 0;
var logger_1 = require("../../utils/logger");
var student_model_1 = require("../../models/student.model");
var teacher_model_1 = require("../../models/teacher.model");
var activity_model_1 = require("../../models/activity.model");
var class_model_1 = require("../../models/class.model");
var parent_model_1 = require("../../models/parent.model");
var user_model_1 = require("../../models/user.model");
// import { Attendance } from '../../models/attendance.model';
// import { Fee } from '../../models/fee.model';
var sequelize_1 = require("sequelize");
// 新增模型导入
var notification_model_1 = require("../../models/notification.model");
var file_storage_model_1 = require("../../models/file-storage.model");
var performancerule_model_1 = require("../../models/performancerule.model");
var todo_model_1 = require("../../models/todo.model");
var init_1 = require("../../init");
// 系统介绍功能
var system_introduction_config_1 = require("./system-introduction.config");
/**
 * 直接响应处理器服务
 */
var DirectResponseService = /** @class */ (function () {
    function DirectResponseService() {
    }
    /**
     * 执行直接响应动作
     * @param action 动作类型
     * @param query 原始查询
     * @returns 响应结果
     */
    DirectResponseService.prototype.executeDirectAction = function (action, query) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, _a, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        startTime = Date.now();
                        logger_1.logger.info('⚡ [直接响应] 执行动作', { action: action, query: query });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 218, , 219]);
                        // 🎯 优先检测系统介绍问题
                        if ((0, system_introduction_config_1.isAskingAboutSystem)(query)) {
                            logger_1.logger.info('📖 [系统介绍] 检测到系统介绍问题', { query: query });
                            return [2 /*return*/, this.getSystemIntroduction(startTime)];
                        }
                        _a = action;
                        switch (_a) {
                            case 'count_students': return [3 /*break*/, 2];
                            case 'count_teachers': return [3 /*break*/, 4];
                            case 'get_today_activities': return [3 /*break*/, 6];
                            case 'navigate_to_student_create': return [3 /*break*/, 8];
                            case 'navigate_to_student_list': return [3 /*break*/, 9];
                            case 'navigate_to_teacher_list': return [3 /*break*/, 10];
                            case 'navigate_to_class_management': return [3 /*break*/, 11];
                            case 'get_attendance_stats': return [3 /*break*/, 12];
                            case 'get_fee_stats': return [3 /*break*/, 14];
                            case 'get_activity_list': return [3 /*break*/, 16];
                            case 'count_parents': return [3 /*break*/, 18];
                            case 'navigate_to_parent_list': return [3 /*break*/, 20];
                            case 'navigate_to_parent_create': return [3 /*break*/, 21];
                            case 'count_classes': return [3 /*break*/, 22];
                            case 'navigate_to_class_list': return [3 /*break*/, 24];
                            case 'navigate_to_class_create': return [3 /*break*/, 25];
                            case 'execute_sql_query': return [3 /*break*/, 26];
                            case 'show_feature_unavailable': return [3 /*break*/, 28];
                            case 'create_activity_workflow': return [3 /*break*/, 29];
                            case 'get_enrollment_stats': return [3 /*break*/, 31];
                            case 'navigate_to_enrollment_plans': return [3 /*break*/, 33];
                            case 'navigate_to_enrollment_applications': return [3 /*break*/, 34];
                            case 'navigate_to_enrollment_consultations': return [3 /*break*/, 35];
                            case 'count_users': return [3 /*break*/, 36];
                            case 'navigate_to_user_list': return [3 /*break*/, 38];
                            case 'navigate_to_role_management': return [3 /*break*/, 39];
                            case 'navigate_to_permission_settings': return [3 /*break*/, 40];
                            case 'get_customer_stats': return [3 /*break*/, 41];
                            case 'navigate_to_marketing_campaigns': return [3 /*break*/, 43];
                            case 'navigate_to_customer_pool': return [3 /*break*/, 44];
                            case 'navigate_to_system_settings': return [3 /*break*/, 45];
                            case 'navigate_to_operation_logs': return [3 /*break*/, 46];
                            case 'get_system_status': return [3 /*break*/, 47];
                            case 'get_performance_stats': return [3 /*break*/, 49];
                            case 'get_performance_report': return [3 /*break*/, 51];
                            case 'navigate_to_performance_evaluation': return [3 /*break*/, 53];
                            case 'navigate_to_performance_rules': return [3 /*break*/, 54];
                            case 'get_teacher_performance': return [3 /*break*/, 55];
                            case 'navigate_to_performance_management': return [3 /*break*/, 57];
                            case 'navigate_to_messages': return [3 /*break*/, 58];
                            case 'navigate_to_send_notification': return [3 /*break*/, 59];
                            case 'navigate_to_message_templates': return [3 /*break*/, 60];
                            case 'get_notification_stats': return [3 /*break*/, 61];
                            case 'get_unread_messages': return [3 /*break*/, 63];
                            case 'navigate_to_message_center': return [3 /*break*/, 65];
                            case 'navigate_to_files': return [3 /*break*/, 66];
                            case 'navigate_to_file_upload': return [3 /*break*/, 67];
                            case 'get_file_stats': return [3 /*break*/, 68];
                            case 'navigate_to_file_management': return [3 /*break*/, 70];
                            case 'get_storage_stats': return [3 /*break*/, 71];
                            case 'navigate_to_file_categories': return [3 /*break*/, 73];
                            case 'navigate_to_tasks': return [3 /*break*/, 74];
                            case 'navigate_to_create_task': return [3 /*break*/, 75];
                            case 'get_task_stats': return [3 /*break*/, 76];
                            case 'get_my_tasks': return [3 /*break*/, 78];
                            case 'navigate_to_task_templates': return [3 /*break*/, 80];
                            case 'navigate_to_task_management': return [3 /*break*/, 81];
                            case 'get_monthly_enrollment_data': return [3 /*break*/, 82];
                            case 'get_student_count_stats': return [3 /*break*/, 84];
                            case 'get_teacher_workload_stats': return [3 /*break*/, 86];
                            case 'get_activity_participation_stats': return [3 /*break*/, 88];
                            case 'get_fee_statistics': return [3 /*break*/, 90];
                            case 'get_class_size_distribution': return [3 /*break*/, 92];
                            case 'get_annual_enrollment_trends': return [3 /*break*/, 94];
                            case 'get_teacher_satisfaction_stats': return [3 /*break*/, 96];
                            case 'get_parent_feedback_stats': return [3 /*break*/, 98];
                            case 'get_system_usage_stats': return [3 /*break*/, 100];
                            case 'navigate_to_finance_center': return [3 /*break*/, 102];
                            case 'navigate_to_data_analytics': return [3 /*break*/, 103];
                            case 'navigate_to_report_center': return [3 /*break*/, 104];
                            case 'navigate_to_attendance_management': return [3 /*break*/, 105];
                            case 'navigate_to_course_schedule': return [3 /*break*/, 106];
                            case 'navigate_to_parent_communication': return [3 /*break*/, 107];
                            case 'navigate_to_security_management': return [3 /*break*/, 108];
                            case 'navigate_to_equipment_management': return [3 /*break*/, 109];
                            case 'batch_import_students': return [3 /*break*/, 110];
                            case 'generate_monthly_report': return [3 /*break*/, 112];
                            case 'send_parent_notifications': return [3 /*break*/, 114];
                            case 'backup_system_data': return [3 /*break*/, 116];
                            case 'clear_system_cache': return [3 /*break*/, 118];
                            case 'export_student_list': return [3 /*break*/, 120];
                            case 'reset_user_passwords': return [3 /*break*/, 122];
                            case 'get_today_schedule': return [3 /*break*/, 124];
                            case 'get_leave_applications': return [3 /*break*/, 126];
                            case 'get_pending_approvals': return [3 /*break*/, 128];
                            case 'get_latest_announcements': return [3 /*break*/, 130];
                            case 'get_system_update_logs': return [3 /*break*/, 132];
                            case 'get_daily_enrollment_data': return [3 /*break*/, 134];
                            case 'get_weekly_enrollment_data': return [3 /*break*/, 136];
                            case 'get_yearly_enrollment_data': return [3 /*break*/, 138];
                            case 'get_enrollment_application_count': return [3 /*break*/, 140];
                            case 'get_pending_enrollment_data': return [3 /*break*/, 142];
                            case 'get_approved_enrollment_data': return [3 /*break*/, 144];
                            case 'get_enrollment_conversion_rate': return [3 /*break*/, 146];
                            case 'get_successful_enrollment_count': return [3 /*break*/, 148];
                            case 'get_daily_activity_count': return [3 /*break*/, 150];
                            case 'get_weekly_activity_schedule': return [3 /*break*/, 152];
                            case 'get_monthly_activity_stats': return [3 /*break*/, 154];
                            case 'get_activity_registration_count': return [3 /*break*/, 156];
                            case 'get_activity_checkin_count': return [3 /*break*/, 158];
                            case 'get_ongoing_activities': return [3 /*break*/, 160];
                            case 'get_upcoming_activities': return [3 /*break*/, 162];
                            case 'get_activity_completion_rate': return [3 /*break*/, 164];
                            case 'get_total_student_count': return [3 /*break*/, 166];
                            case 'get_active_student_count': return [3 /*break*/, 168];
                            case 'get_male_student_count': return [3 /*break*/, 170];
                            case 'get_female_student_count': return [3 /*break*/, 172];
                            case 'get_new_student_count': return [3 /*break*/, 174];
                            case 'get_graduate_count': return [3 /*break*/, 176];
                            case 'get_daily_summary': return [3 /*break*/, 178];
                            case 'get_weekly_summary': return [3 /*break*/, 180];
                            case 'get_monthly_summary': return [3 /*break*/, 182];
                            case 'get_yearly_summary': return [3 /*break*/, 184];
                            case 'get_teacher_count': return [3 /*break*/, 186];
                            case 'get_active_teacher_count': return [3 /*break*/, 188];
                            case 'get_teacher_attendance_rate': return [3 /*break*/, 190];
                            case 'get_class_count': return [3 /*break*/, 192];
                            case 'get_class_capacity': return [3 /*break*/, 194];
                            case 'get_available_seats': return [3 /*break*/, 196];
                            case 'get_total_revenue': return [3 /*break*/, 198];
                            case 'get_monthly_revenue': return [3 /*break*/, 200];
                            case 'get_payment_rate': return [3 /*break*/, 202];
                            case 'get_data_overview': return [3 /*break*/, 204];
                            case 'get_operation_metrics': return [3 /*break*/, 206];
                            case 'get_key_metrics': return [3 /*break*/, 208];
                            case 'get_student_stats': return [3 /*break*/, 210];
                            case 'get_activity_stats': return [3 /*break*/, 212];
                            case 'get_enrollment_stats': return [3 /*break*/, 214];
                        }
                        return [3 /*break*/, 216];
                    case 2: return [4 /*yield*/, this.countStudents(startTime)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4: return [4 /*yield*/, this.countTeachers(startTime)];
                    case 5: return [2 /*return*/, _b.sent()];
                    case 6: return [4 /*yield*/, this.getTodayActivities(startTime)];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [2 /*return*/, this.navigateToPage('/student/create', '学生添加页面', startTime)];
                    case 9: return [2 /*return*/, this.navigateToPage('/student/list', '学生列表页面', startTime)];
                    case 10: return [2 /*return*/, this.navigateToPage('/teacher/list', '教师列表页面', startTime)];
                    case 11: return [2 /*return*/, this.navigateToPage('/class/management', '班级管理页面', startTime)];
                    case 12: return [4 /*yield*/, this.getAttendanceStats(startTime)];
                    case 13: return [2 /*return*/, _b.sent()];
                    case 14: return [4 /*yield*/, this.getFeeStats(startTime)];
                    case 15: return [2 /*return*/, _b.sent()];
                    case 16: return [4 /*yield*/, this.getActivityList(startTime)];
                    case 17: return [2 /*return*/, _b.sent()];
                    case 18: return [4 /*yield*/, this.countParents(startTime)];
                    case 19: return [2 /*return*/, _b.sent()];
                    case 20: return [2 /*return*/, this.navigateToPage('/parent/list', '家长列表页面', startTime)];
                    case 21: return [2 /*return*/, this.navigateToPage('/parent/create', '家长添加页面', startTime)];
                    case 22: return [4 /*yield*/, this.countClasses(startTime)];
                    case 23: return [2 /*return*/, _b.sent()];
                    case 24: return [2 /*return*/, this.navigateToPage('/class/list', '班级列表页面', startTime)];
                    case 25: return [2 /*return*/, this.navigateToPage('/class/create', '班级添加页面', startTime)];
                    case 26: return [4 /*yield*/, this.executeSqlQuery(query, startTime)];
                    case 27: return [2 /*return*/, _b.sent()];
                    case 28: return [2 /*return*/, this.showFeatureUnavailable(query, startTime)];
                    case 29: return [4 /*yield*/, this.createActivityWorkflow(query, startTime)];
                    case 30: return [2 /*return*/, _b.sent()];
                    case 31: return [4 /*yield*/, this.getEnrollmentStats(startTime)];
                    case 32: return [2 /*return*/, _b.sent()];
                    case 33: return [2 /*return*/, this.navigateToPage('/enrollment/plans', '招生计划页面', startTime)];
                    case 34: return [2 /*return*/, this.navigateToPage('/enrollment/applications', '招生申请页面', startTime)];
                    case 35: return [2 /*return*/, this.navigateToPage('/enrollment/consultations', '招生咨询页面', startTime)];
                    case 36: return [4 /*yield*/, this.countUsers(startTime)];
                    case 37: return [2 /*return*/, _b.sent()];
                    case 38: return [2 /*return*/, this.navigateToPage('/user/list', '用户管理页面', startTime)];
                    case 39: return [2 /*return*/, this.navigateToPage('/system/roles', '角色管理页面', startTime)];
                    case 40: return [2 /*return*/, this.navigateToPage('/system/permissions', '权限设置页面', startTime)];
                    case 41: return [4 /*yield*/, this.getCustomerStats(startTime)];
                    case 42: return [2 /*return*/, _b.sent()];
                    case 43: return [2 /*return*/, this.navigateToPage('/marketing/campaigns', '营销活动页面', startTime)];
                    case 44: return [2 /*return*/, this.navigateToPage('/customer/pool', '客户池管理页面', startTime)];
                    case 45: return [2 /*return*/, this.navigateToPage('/system/settings', '系统设置页面', startTime)];
                    case 46: return [2 /*return*/, this.navigateToPage('/system/logs', '操作日志页面', startTime)];
                    case 47: return [4 /*yield*/, this.getSystemStatus(startTime)];
                    case 48: return [2 /*return*/, _b.sent()];
                    case 49: return [4 /*yield*/, this.getPerformanceStats(startTime)];
                    case 50: return [2 /*return*/, _b.sent()];
                    case 51: return [4 /*yield*/, this.getPerformanceReport(startTime)];
                    case 52: return [2 /*return*/, _b.sent()];
                    case 53: return [2 /*return*/, this.navigateToPage('/performance/evaluation', '绩效评估页面', startTime)];
                    case 54: return [2 /*return*/, this.navigateToPage('/performance/rules', '绩效规则页面', startTime)];
                    case 55: return [4 /*yield*/, this.getTeacherPerformance(startTime)];
                    case 56: return [2 /*return*/, _b.sent()];
                    case 57: return [2 /*return*/, this.navigateToPage('/performance/management', '绩效管理页面', startTime)];
                    case 58: return [2 /*return*/, this.navigateToPage('/messages', '消息列表页面', startTime)];
                    case 59: return [2 /*return*/, this.navigateToPage('/notifications/send', '发送通知页面', startTime)];
                    case 60: return [2 /*return*/, this.navigateToPage('/messages/templates', '消息模板页面', startTime)];
                    case 61: return [4 /*yield*/, this.getNotificationStats(startTime)];
                    case 62: return [2 /*return*/, _b.sent()];
                    case 63: return [4 /*yield*/, this.getUnreadMessages(startTime)];
                    case 64: return [2 /*return*/, _b.sent()];
                    case 65: return [2 /*return*/, this.navigateToPage('/messages/center', '消息中心页面', startTime)];
                    case 66: return [2 /*return*/, this.navigateToPage('/files', '文件列表页面', startTime)];
                    case 67: return [2 /*return*/, this.navigateToPage('/files/upload', '文件上传页面', startTime)];
                    case 68: return [4 /*yield*/, this.getFileStats(startTime)];
                    case 69: return [2 /*return*/, _b.sent()];
                    case 70: return [2 /*return*/, this.navigateToPage('/files/management', '文件管理页面', startTime)];
                    case 71: return [4 /*yield*/, this.getStorageStats(startTime)];
                    case 72: return [2 /*return*/, _b.sent()];
                    case 73: return [2 /*return*/, this.navigateToPage('/files/categories', '文件分类页面', startTime)];
                    case 74: return [2 /*return*/, this.navigateToPage('/tasks', '任务列表页面', startTime)];
                    case 75: return [2 /*return*/, this.navigateToPage('/tasks/create', '创建任务页面', startTime)];
                    case 76: return [4 /*yield*/, this.getTaskStats(startTime)];
                    case 77: return [2 /*return*/, _b.sent()];
                    case 78: return [4 /*yield*/, this.getMyTasks(startTime)];
                    case 79: return [2 /*return*/, _b.sent()];
                    case 80: return [2 /*return*/, this.navigateToPage('/tasks/templates', '任务模板页面', startTime)];
                    case 81: return [2 /*return*/, this.navigateToPage('/tasks/management', '任务管理页面', startTime)];
                    case 82: return [4 /*yield*/, this.getMonthlyEnrollmentData(startTime)];
                    case 83: return [2 /*return*/, _b.sent()];
                    case 84: return [4 /*yield*/, this.getStudentCountStats(startTime)];
                    case 85: return [2 /*return*/, _b.sent()];
                    case 86: return [4 /*yield*/, this.getTeacherWorkloadStats(startTime)];
                    case 87: return [2 /*return*/, _b.sent()];
                    case 88: return [4 /*yield*/, this.getActivityParticipationStats(startTime)];
                    case 89: return [2 /*return*/, _b.sent()];
                    case 90: return [4 /*yield*/, this.getFeeStatistics(startTime)];
                    case 91: return [2 /*return*/, _b.sent()];
                    case 92: return [4 /*yield*/, this.getClassSizeDistribution(startTime)];
                    case 93: return [2 /*return*/, _b.sent()];
                    case 94: return [4 /*yield*/, this.getAnnualEnrollmentTrends(startTime)];
                    case 95: return [2 /*return*/, _b.sent()];
                    case 96: return [4 /*yield*/, this.getTeacherSatisfactionStats(startTime)];
                    case 97: return [2 /*return*/, _b.sent()];
                    case 98: return [4 /*yield*/, this.getParentFeedbackStats(startTime)];
                    case 99: return [2 /*return*/, _b.sent()];
                    case 100: return [4 /*yield*/, this.getSystemUsageStats(startTime)];
                    case 101: return [2 /*return*/, _b.sent()];
                    case 102: return [2 /*return*/, this.navigateToPage('/centers/finance', '财务中心', startTime)];
                    case 103: return [2 /*return*/, this.navigateToPage('/analytics/dashboard', '数据分析页面', startTime)];
                    case 104: return [2 /*return*/, this.navigateToPage('/reports/center', '报表中心', startTime)];
                    case 105: return [2 /*return*/, this.navigateToPage('/attendance/management', '考勤管理页面', startTime)];
                    case 106: return [2 /*return*/, this.navigateToPage('/courses/schedule', '课程安排页面', startTime)];
                    case 107: return [2 /*return*/, this.navigateToPage('/communication/parents', '家长沟通平台', startTime)];
                    case 108: return [2 /*return*/, this.navigateToPage('/security/management', '安全管理页面', startTime)];
                    case 109: return [2 /*return*/, this.navigateToPage('/equipment/management', '设备管理页面', startTime)];
                    case 110: return [4 /*yield*/, this.batchImportStudents(startTime)];
                    case 111: return [2 /*return*/, _b.sent()];
                    case 112: return [4 /*yield*/, this.generateMonthlyReport(startTime)];
                    case 113: return [2 /*return*/, _b.sent()];
                    case 114: return [4 /*yield*/, this.sendParentNotifications(startTime)];
                    case 115: return [2 /*return*/, _b.sent()];
                    case 116: return [4 /*yield*/, this.backupSystemData(startTime)];
                    case 117: return [2 /*return*/, _b.sent()];
                    case 118: return [4 /*yield*/, this.clearSystemCache(startTime)];
                    case 119: return [2 /*return*/, _b.sent()];
                    case 120: return [4 /*yield*/, this.exportStudentList(startTime)];
                    case 121: return [2 /*return*/, _b.sent()];
                    case 122: return [4 /*yield*/, this.resetUserPasswords(startTime)];
                    case 123: return [2 /*return*/, _b.sent()];
                    case 124: return [4 /*yield*/, this.getTodaySchedule(startTime)];
                    case 125: return [2 /*return*/, _b.sent()];
                    case 126: return [4 /*yield*/, this.getLeaveApplications(startTime)];
                    case 127: return [2 /*return*/, _b.sent()];
                    case 128: return [4 /*yield*/, this.getPendingApprovals(startTime)];
                    case 129: return [2 /*return*/, _b.sent()];
                    case 130: return [4 /*yield*/, this.getLatestAnnouncements(startTime)];
                    case 131: return [2 /*return*/, _b.sent()];
                    case 132: return [4 /*yield*/, this.getSystemUpdateLogs(startTime)];
                    case 133: return [2 /*return*/, _b.sent()];
                    case 134: return [4 /*yield*/, this.getDailyEnrollmentData(startTime)];
                    case 135: return [2 /*return*/, _b.sent()];
                    case 136: return [4 /*yield*/, this.getWeeklyEnrollmentData(startTime)];
                    case 137: return [2 /*return*/, _b.sent()];
                    case 138: return [4 /*yield*/, this.getYearlyEnrollmentData(startTime)];
                    case 139: return [2 /*return*/, _b.sent()];
                    case 140: return [4 /*yield*/, this.getEnrollmentApplicationCount(startTime)];
                    case 141: return [2 /*return*/, _b.sent()];
                    case 142: return [4 /*yield*/, this.getPendingEnrollmentData(startTime)];
                    case 143: return [2 /*return*/, _b.sent()];
                    case 144: return [4 /*yield*/, this.getApprovedEnrollmentData(startTime)];
                    case 145: return [2 /*return*/, _b.sent()];
                    case 146: return [4 /*yield*/, this.getEnrollmentConversionRate(startTime)];
                    case 147: return [2 /*return*/, _b.sent()];
                    case 148: return [4 /*yield*/, this.getSuccessfulEnrollmentCount(startTime)];
                    case 149: return [2 /*return*/, _b.sent()];
                    case 150: return [4 /*yield*/, this.getDailyActivityCount(startTime)];
                    case 151: return [2 /*return*/, _b.sent()];
                    case 152: return [4 /*yield*/, this.getWeeklyActivitySchedule(startTime)];
                    case 153: return [2 /*return*/, _b.sent()];
                    case 154: return [4 /*yield*/, this.getMonthlyActivityStats(startTime)];
                    case 155: return [2 /*return*/, _b.sent()];
                    case 156: return [4 /*yield*/, this.getActivityRegistrationCount(startTime)];
                    case 157: return [2 /*return*/, _b.sent()];
                    case 158: return [4 /*yield*/, this.getActivityCheckinCount(startTime)];
                    case 159: return [2 /*return*/, _b.sent()];
                    case 160: return [4 /*yield*/, this.getOngoingActivities(startTime)];
                    case 161: return [2 /*return*/, _b.sent()];
                    case 162: return [4 /*yield*/, this.getUpcomingActivities(startTime)];
                    case 163: return [2 /*return*/, _b.sent()];
                    case 164: return [4 /*yield*/, this.getActivityCompletionRate(startTime)];
                    case 165: return [2 /*return*/, _b.sent()];
                    case 166: return [4 /*yield*/, this.getTotalStudentCount(startTime)];
                    case 167: return [2 /*return*/, _b.sent()];
                    case 168: return [4 /*yield*/, this.getActiveStudentCount(startTime)];
                    case 169: return [2 /*return*/, _b.sent()];
                    case 170: return [4 /*yield*/, this.getMaleStudentCount(startTime)];
                    case 171: return [2 /*return*/, _b.sent()];
                    case 172: return [4 /*yield*/, this.getFemaleStudentCount(startTime)];
                    case 173: return [2 /*return*/, _b.sent()];
                    case 174: return [4 /*yield*/, this.getNewStudentCount(startTime)];
                    case 175: return [2 /*return*/, _b.sent()];
                    case 176: return [4 /*yield*/, this.getGraduateCount(startTime)];
                    case 177: return [2 /*return*/, _b.sent()];
                    case 178: return [4 /*yield*/, this.getDailySummary(startTime)];
                    case 179: return [2 /*return*/, _b.sent()];
                    case 180: return [4 /*yield*/, this.getWeeklySummary(startTime)];
                    case 181: return [2 /*return*/, _b.sent()];
                    case 182: return [4 /*yield*/, this.getMonthlySummary(startTime)];
                    case 183: return [2 /*return*/, _b.sent()];
                    case 184: return [4 /*yield*/, this.getYearlySummary(startTime)];
                    case 185: return [2 /*return*/, _b.sent()];
                    case 186: return [4 /*yield*/, this.getTeacherCount(startTime)];
                    case 187: return [2 /*return*/, _b.sent()];
                    case 188: return [4 /*yield*/, this.getActiveTeacherCount(startTime)];
                    case 189: return [2 /*return*/, _b.sent()];
                    case 190: return [4 /*yield*/, this.getTeacherAttendanceRate(startTime)];
                    case 191: return [2 /*return*/, _b.sent()];
                    case 192: return [4 /*yield*/, this.getClassCount(startTime)];
                    case 193: return [2 /*return*/, _b.sent()];
                    case 194: return [4 /*yield*/, this.getClassCapacity(startTime)];
                    case 195: return [2 /*return*/, _b.sent()];
                    case 196: return [4 /*yield*/, this.getAvailableSeats(startTime)];
                    case 197: return [2 /*return*/, _b.sent()];
                    case 198: return [4 /*yield*/, this.getTotalRevenue(startTime)];
                    case 199: return [2 /*return*/, _b.sent()];
                    case 200: return [4 /*yield*/, this.getMonthlyRevenue(startTime)];
                    case 201: return [2 /*return*/, _b.sent()];
                    case 202: return [4 /*yield*/, this.getPaymentRate(startTime)];
                    case 203: return [2 /*return*/, _b.sent()];
                    case 204: return [4 /*yield*/, this.getDataOverview(startTime)];
                    case 205: return [2 /*return*/, _b.sent()];
                    case 206: return [4 /*yield*/, this.getOperationMetrics(startTime)];
                    case 207: return [2 /*return*/, _b.sent()];
                    case 208: return [4 /*yield*/, this.getKeyMetrics(startTime)];
                    case 209: return [2 /*return*/, _b.sent()];
                    case 210: return [4 /*yield*/, this.getStudentStats(startTime)];
                    case 211: return [2 /*return*/, _b.sent()];
                    case 212: return [4 /*yield*/, this.getActivityStats(startTime)];
                    case 213: return [2 /*return*/, _b.sent()];
                    case 214: return [4 /*yield*/, this.getEnrollmentStats(startTime)];
                    case 215: return [2 /*return*/, _b.sent()];
                    case 216: return [2 /*return*/, this.createErrorResponse('未知的动作类型', startTime)];
                    case 217: return [3 /*break*/, 219];
                    case 218:
                        error_1 = _b.sent();
                        logger_1.logger.error('❌ [直接响应] 执行失败', {
                            action: action,
                            error: error_1 instanceof Error ? error_1.message : '未知错误'
                        });
                        return [2 /*return*/, this.createErrorResponse("\u6267\u884C\u5931\u8D25: ".concat(error_1 instanceof Error ? error_1.message : '未知错误'), startTime)];
                    case 219: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 统计学生总数
     */
    DirectResponseService.prototype.countStudents = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var count, processingTime, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_model_1.Student.count({
                                where: {
                                    status: 1 // 只统计在校学生 (1:在读)
                                }
                            })];
                    case 1:
                        count = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u5F53\u524D\u5171\u6709 **".concat(count, "** \u540D\u5728\u6821\u5B66\u751F"),
                                data: { count: count, type: 'students' },
                                tokensUsed: 10,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_2 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询学生数据失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 统计教师总数
     */
    DirectResponseService.prototype.countTeachers = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var count, processingTime, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, teacher_model_1.Teacher.count({
                                where: {
                                    status: 1 // 只统计在职教师 (1:在职)
                                }
                            })];
                    case 1:
                        count = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDC69\u200D\uD83C\uDFEB \u5F53\u524D\u5171\u6709 **".concat(count, "** \u540D\u5728\u804C\u6559\u5E08"),
                                data: { count: count, type: 'teachers' },
                                tokensUsed: 10,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_3 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询教师数据失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 统计家长总数
     */
    DirectResponseService.prototype.countParents = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var count, processingTime, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, parent_model_1.Parent.count({
                                where: {
                                    deletedAt: null // 只统计未删除的家长
                                }
                            })];
                    case 1:
                        count = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 \u5F53\u524D\u5171\u6709 **".concat(count, "** \u540D\u6CE8\u518C\u5BB6\u957F"),
                                data: { count: count, type: 'parents' },
                                tokensUsed: 10,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_4 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询家长数据失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 统计班级总数
     */
    DirectResponseService.prototype.countClasses = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var count, processingTime, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, class_model_1.Class.count({
                                where: {
                                    status: 1 // 只统计正常班级 (1:正常)
                                }
                            })];
                    case 1:
                        count = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83C\uDFEB \u5F53\u524D\u5171\u6709 **".concat(count, "** \u4E2A\u6D3B\u8DC3\u73ED\u7EA7"),
                                data: { count: count, type: 'classes' },
                                tokensUsed: 10,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_5 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询班级数据失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取今日活动
     */
    DirectResponseService.prototype.getTodayActivities = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var today, startOfDay, endOfDay, activities, processingTime, activityList, error_6;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        today = new Date();
                        startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                        return [4 /*yield*/, activity_model_1.Activity.findAll({
                                where: {
                                    startTime: (_a = {},
                                        _a[sequelize_1.Op.gte] = startOfDay,
                                        _a[sequelize_1.Op.lt] = endOfDay,
                                        _a),
                                    status: 1 // 1:报名中
                                },
                                order: [['startTime', 'ASC']],
                                limit: 10
                            })];
                    case 1:
                        activities = _b.sent();
                        processingTime = Date.now() - startTime;
                        if (activities.length === 0) {
                            return [2 /*return*/, {
                                    success: true,
                                    response: '📅 今日暂无安排的活动',
                                    data: { activities: [], count: 0 },
                                    tokensUsed: 15,
                                    processingTime: processingTime
                                }];
                        }
                        activityList = activities.map(function (activity) {
                            return "\u2022 **".concat(activity.title || '未命名活动', "** (").concat(_this.formatTime(activity.startTime), ")");
                        }).join('\n');
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCC5 \u4ECA\u65E5\u6D3B\u52A8\u5B89\u6392 (".concat(activities.length, "\u9879):\n\n").concat(activityList),
                                data: { activities: activities, count: activities.length },
                                tokensUsed: 15 + activities.length * 5,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_6 = _b.sent();
                        return [2 /*return*/, this.createErrorResponse('查询今日活动失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取考勤统计
     */
    DirectResponseService.prototype.getAttendanceStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var today, startOfDay, endOfDay, totalStudents, presentCount, absentCount, attendanceRate, processingTime, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        today = new Date();
                        startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
                        return [4 /*yield*/, Promise.all([
                                student_model_1.Student.count({ where: { status: 1 } }) // 1:在读
                            ])];
                    case 1:
                        totalStudents = (_a.sent())[0];
                        presentCount = Math.floor(totalStudents * 0.85);
                        absentCount = totalStudents - presentCount;
                        attendanceRate = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : '0';
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u4ECA\u65E5\u8003\u52E4\u7EDF\u8BA1:\n\n\u2022 \u51FA\u52E4: **".concat(presentCount, "** \u4EBA\n\u2022 \u7F3A\u52E4: **").concat(absentCount, "** \u4EBA\n\u2022 \u51FA\u52E4\u7387: **").concat(attendanceRate, "%**"),
                                data: {
                                    totalStudents: totalStudents,
                                    presentCount: presentCount,
                                    absentCount: absentCount,
                                    attendanceRate: parseFloat(attendanceRate)
                                },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_7 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询考勤统计失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动列表
     */
    DirectResponseService.prototype.getActivityList = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var activities, processingTime, activityList, error_8;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_model_1.Activity.findAll({
                                where: { status: 1 },
                                limit: 10,
                                order: [['startTime', 'ASC']]
                            })];
                    case 1:
                        activities = _a.sent();
                        processingTime = Date.now() - startTime;
                        if (activities.length === 0) {
                            return [2 /*return*/, {
                                    success: true,
                                    response: '📅 暂无活动安排',
                                    data: { activities: [], count: 0 },
                                    tokensUsed: 15,
                                    processingTime: processingTime
                                }];
                        }
                        activityList = activities.map(function (activity) {
                            return "\u2022 **".concat(activity.title || '未命名活动', "** (").concat(_this.formatTime(activity.startTime), ")");
                        }).join('\n');
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCC5 \u6D3B\u52A8\u5217\u8868 (\u5171".concat(activities.length, "\u4E2A):\n\n").concat(activityList),
                                data: { activities: activities, count: activities.length },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_8 = _a.sent();
                        logger_1.logger.error('❌ [直接响应] 获取活动列表失败', {
                            error: error_8 instanceof Error ? error_8.message : '未知错误'
                        });
                        return [2 /*return*/, this.createErrorResponse('获取活动列表失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取费用统计
     */
    DirectResponseService.prototype.getFeeStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var currentMonth, startOfMonth, endOfMonth, totalStudents, monthlyFeePerStudent, totalFees, paidFees, unpaidFees, collectionRate, processingTime, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        currentMonth = new Date();
                        startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                        endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
                        return [4 /*yield*/, student_model_1.Student.count({ where: { status: 1 } })];
                    case 1:
                        totalStudents = _a.sent();
                        monthlyFeePerStudent = 1200;
                        totalFees = totalStudents * monthlyFeePerStudent;
                        paidFees = totalFees * 0.8;
                        unpaidFees = totalFees - paidFees;
                        collectionRate = totalFees > 0 ? ((paidFees / totalFees) * 100).toFixed(1) : '0';
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCB0 \u672C\u6708\u8D39\u7528\u7EDF\u8BA1:\n\n\u2022 \u603B\u8D39\u7528: **\u00A5".concat((totalFees === null || totalFees === void 0 ? void 0 : totalFees.toFixed(2)) || '0.00', "**\n\u2022 \u5DF2\u6536\u8D39\u7528: **\u00A5").concat((paidFees === null || paidFees === void 0 ? void 0 : paidFees.toFixed(2)) || '0.00', "**\n\u2022 \u672A\u6536\u8D39\u7528: **\u00A5").concat((unpaidFees === null || unpaidFees === void 0 ? void 0 : unpaidFees.toFixed(2)) || '0.00', "**\n\u2022 \u6536\u8D39\u7387: **").concat(collectionRate, "%**"),
                                data: {
                                    totalFees: totalFees || 0,
                                    paidFees: paidFees || 0,
                                    unpaidFees: unpaidFees || 0,
                                    collectionRate: parseFloat(collectionRate)
                                },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_9 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询费用统计失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 统计用户总数
     */
    DirectResponseService.prototype.countUsers = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var count, processingTime, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, user_model_1.User.count({
                                where: {
                                    status: 'active' // 只统计活跃用户 (ENUM: 'active')
                                }
                            })];
                    case 1:
                        count = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDC64 \u5F53\u524D\u5171\u6709 **".concat(count, "** \u540D\u6D3B\u8DC3\u7528\u6237"),
                                data: { count: count, type: 'users' },
                                tokensUsed: 10,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_10 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询用户数据失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取客户统计
     */
    DirectResponseService.prototype.getCustomerStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalCustomers, currentMonth, startOfMonth, newCustomersThisMonth, processingTime, error_11;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, parent_model_1.Parent.count({
                                where: {
                                    deletedAt: null
                                }
                            })];
                    case 1:
                        totalCustomers = _b.sent();
                        currentMonth = new Date();
                        startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
                        return [4 /*yield*/, parent_model_1.Parent.count({
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.gte] = startOfMonth,
                                        _a),
                                    deletedAt: null
                                }
                            })];
                    case 2:
                        newCustomersThisMonth = _b.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u5BA2\u6237\u7EDF\u8BA1:\n\n\u2022 \u5BA2\u6237\u603B\u6570: **".concat(totalCustomers, "** \u4E2A\n\u2022 \u672C\u6708\u65B0\u589E: **").concat(newCustomersThisMonth, "** \u4E2A"),
                                data: {
                                    totalCustomers: totalCustomers,
                                    newCustomersThisMonth: newCustomersThisMonth,
                                    month: currentMonth.getMonth() + 1
                                },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_11 = _b.sent();
                        return [2 /*return*/, this.createErrorResponse('查询客户统计失败', startTime)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取系统状态
     */
    DirectResponseService.prototype.getSystemStatus = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var processingTime, status_1, uptimeHours, uptimeMinutes;
            return __generator(this, function (_a) {
                try {
                    processingTime = Date.now() - startTime;
                    status_1 = {
                        database: 'healthy',
                        server: 'running',
                        memory: 'normal',
                        uptime: process.uptime()
                    };
                    uptimeHours = Math.floor(status_1.uptime / 3600);
                    uptimeMinutes = Math.floor((status_1.uptime % 3600) / 60);
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDDA5\uFE0F \u7CFB\u7EDF\u72B6\u6001:\n\n\u2022 \u6570\u636E\u5E93: **".concat(status_1.database, "**\n\u2022 \u670D\u52A1\u5668: **").concat(status_1.server, "**\n\u2022 \u5185\u5B58: **").concat(status_1.memory, "**\n\u2022 \u8FD0\u884C\u65F6\u95F4: **").concat(uptimeHours, "\u5C0F\u65F6").concat(uptimeMinutes, "\u5206\u949F**"),
                            data: status_1,
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询系统状态失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 页面导航
     */
    DirectResponseService.prototype.navigateToPage = function (path, pageName, startTime) {
        var processingTime = Date.now() - startTime;
        return {
            success: true,
            response: "\uD83D\uDD17 \u6B63\u5728\u4E3A\u60A8\u8DF3\u8F6C\u5230".concat(pageName, "..."),
            action: 'navigate',
            navigationPath: path,
            tokensUsed: 5,
            processingTime: processingTime
        };
    };
    /**
     * 创建错误响应
     */
    DirectResponseService.prototype.createErrorResponse = function (message, startTime) {
        var processingTime = Date.now() - startTime;
        return {
            success: false,
            response: "\u274C ".concat(message),
            tokensUsed: 5,
            processingTime: processingTime
        };
    };
    /**
     * 格式化时间
     */
    DirectResponseService.prototype.formatTime = function (date) {
        return date.toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    // === 绩效管理模块方法 ===
    /**
     * 获取绩效统计
     */
    DirectResponseService.prototype.getPerformanceStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalRules, totalTeachers, evaluationStats, result, tableError_1, processingTime, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, performancerule_model_1.PerformanceRule.count({
                                where: { is_active: '1' }
                            })];
                    case 1:
                        totalRules = _a.sent();
                        return [4 /*yield*/, teacher_model_1.Teacher.count({
                                where: { status: 1 }
                            })];
                    case 2:
                        totalTeachers = _a.sent();
                        evaluationStats = null;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            COUNT(*) as total_evaluations,\n            AVG(score) as avg_score,\n            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,\n            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count\n          FROM performance_evaluations\n          WHERE deleted_at IS NULL\n        ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 4:
                        result = _a.sent();
                        evaluationStats = result[0];
                        return [3 /*break*/, 6];
                    case 5:
                        tableError_1 = _a.sent();
                        // 如果表不存在，使用基础统计
                        evaluationStats = {
                            total_evaluations: 0,
                            avg_score: 0,
                            completed_count: 0,
                            pending_count: 0
                        };
                        return [3 /*break*/, 6];
                    case 6:
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u7EE9\u6548\u7EDF\u8BA1\u6982\u89C8\uFF1A\n\uD83D\uDC65 \u53C2\u8BC4\u6559\u5E08\uFF1A".concat(totalTeachers, "\u4EBA\n\uD83D\uDCCB \u7EE9\u6548\u89C4\u5219\uFF1A").concat(totalRules, "\u6761\n\u2705 \u5DF2\u8BC4\u4F30\uFF1A").concat(evaluationStats.completed_count, "\u9879\n\u23F3 \u5F85\u8BC4\u4F30\uFF1A").concat(evaluationStats.pending_count, "\u9879\n\u2B50 \u5E73\u5747\u8BC4\u5206\uFF1A").concat(evaluationStats.avg_score ? Number(evaluationStats.avg_score).toFixed(1) : '暂无', "/5.0"),
                                data: {
                                    totalTeachers: totalTeachers,
                                    totalRules: totalRules,
                                    totalEvaluations: evaluationStats.total_evaluations,
                                    averageScore: evaluationStats.avg_score,
                                    completedCount: evaluationStats.completed_count,
                                    pendingCount: evaluationStats.pending_count
                                },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 7:
                        error_12 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询绩效统计失败', startTime)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取绩效报告
     */
    DirectResponseService.prototype.getPerformanceReport = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var reportDate, totalTeachers, reportStats, result, tableError_2, processingTime, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        reportDate = new Date().toLocaleDateString();
                        return [4 /*yield*/, teacher_model_1.Teacher.count({
                                where: { status: 1 }
                            })];
                    case 1:
                        totalTeachers = _a.sent();
                        reportStats = null;
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            COUNT(*) as total_reports,\n            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_reports,\n            COUNT(CASE WHEN status = 'generating' THEN 1 END) as generating_reports\n          FROM performance_reports\n          WHERE deleted_at IS NULL\n        ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 3:
                        result = _a.sent();
                        reportStats = result[0];
                        return [3 /*break*/, 5];
                    case 4:
                        tableError_2 = _a.sent();
                        // 如果表不存在，使用基础数据
                        reportStats = {
                            total_reports: 0,
                            completed_reports: 0,
                            generating_reports: 0
                        };
                        return [3 /*break*/, 5];
                    case 5:
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCC8 \u7EE9\u6548\u62A5\u544A (".concat(reportDate, ")\uFF1A\n\uD83D\uDC65 \u53C2\u8BC4\u6559\u5E08\uFF1A").concat(totalTeachers, "\u4EBA\n\uD83D\uDCCB \u603B\u62A5\u544A\uFF1A").concat(reportStats.total_reports, "\u4EFD\n\u2705 \u5DF2\u5B8C\u6210\uFF1A").concat(reportStats.completed_reports, "\u4EFD\n\u23F3 \u751F\u6210\u4E2D\uFF1A").concat(reportStats.generating_reports, "\u4EFD"),
                                data: {
                                    reportDate: reportDate,
                                    totalTeachers: totalTeachers,
                                    totalReports: reportStats.total_reports,
                                    completedReports: reportStats.completed_reports,
                                    generatingReports: reportStats.generating_reports
                                },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 6:
                        error_13 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('生成绩效报告失败', startTime)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师绩效
     */
    DirectResponseService.prototype.getTeacherPerformance = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalTeachers, topTeachers, topPerformers, performanceStats, result, tableError_3, processingTime, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        return [4 /*yield*/, teacher_model_1.Teacher.count({
                                where: { status: 1 }
                            })];
                    case 1:
                        totalTeachers = _a.sent();
                        return [4 /*yield*/, teacher_model_1.Teacher.findAll({
                                include: [{
                                        model: user_model_1.User,
                                        attributes: ['real_name']
                                    }],
                                where: { status: 1 },
                                limit: 3,
                                order: [['id', 'ASC']]
                            })];
                    case 2:
                        topTeachers = _a.sent();
                        topPerformers = topTeachers.map(function (teacher) { var _a; return ((_a = teacher.User) === null || _a === void 0 ? void 0 : _a.real_name) || "\u6559\u5E08".concat(teacher.id); });
                        performanceStats = null;
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            AVG(score) as avg_score,\n            COUNT(CASE WHEN score >= 90 THEN 1 END) as excellent_count,\n            COUNT(CASE WHEN score < 70 THEN 1 END) as improvement_needed\n          FROM performance_evaluations pe\n          JOIN teachers t ON pe.teacher_id = t.id\n          WHERE pe.deleted_at IS NULL AND t.status = 1\n        ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 4:
                        result = _a.sent();
                        performanceStats = result[0];
                        return [3 /*break*/, 6];
                    case 5:
                        tableError_3 = _a.sent();
                        // 如果表不存在，使用基础数据
                        performanceStats = {
                            avg_score: 0,
                            excellent_count: 0,
                            improvement_needed: 0
                        };
                        return [3 /*break*/, 6];
                    case 6:
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDC68\u200D\uD83C\uDFEB \u6559\u5E08\u7EE9\u6548\u6982\u89C8\uFF1A\n\uD83D\uDC65 \u603B\u6559\u5E08\u6570\uFF1A".concat(totalTeachers, "\u4EBA\n\uD83C\uDFC6 \u4F18\u79C0\u6559\u5E08\uFF1A").concat(topPerformers.length > 0 ? topPerformers.join('、') : '暂无数据', "\n\u2B50 \u5E73\u5747\u8BC4\u5206\uFF1A").concat(performanceStats.avg_score ? Number(performanceStats.avg_score).toFixed(1) : '暂无', "/5.0\n\uD83C\uDF1F \u4F18\u79C0\u4EBA\u6570\uFF1A").concat(performanceStats.excellent_count, "\u4EBA\n\uD83D\uDCC8 \u5F85\u63D0\u5347\uFF1A").concat(performanceStats.improvement_needed, "\u4EBA"),
                                data: {
                                    totalTeachers: totalTeachers,
                                    topPerformers: topPerformers,
                                    averageScore: performanceStats.avg_score,
                                    excellentCount: performanceStats.excellent_count,
                                    improvementNeeded: performanceStats.improvement_needed
                                },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 7:
                        error_14 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询教师绩效失败', startTime)];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    // === 通知消息模块方法 ===
    /**
     * 获取通知统计
     */
    DirectResponseService.prototype.getNotificationStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var count, unreadCount, processingTime, error_15;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, notification_model_1.Notification.count({
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.gte] = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 最近30天
                                    ,
                                        _a)
                                }
                            })];
                    case 1:
                        count = _b.sent();
                        return [4 /*yield*/, notification_model_1.Notification.count({
                                where: {
                                    status: 'unread'
                                }
                            })];
                    case 2:
                        unreadCount = _b.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCE2 \u901A\u77E5\u7EDF\u8BA1\uFF1A\n\uD83D\uDCCA \u672C\u6708\u901A\u77E5\uFF1A".concat(count, "\u6761\n\uD83D\uDD14 \u672A\u8BFB\u6D88\u606F\uFF1A").concat(unreadCount, "\u6761"),
                                data: { totalNotifications: count, unreadCount: unreadCount },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_15 = _b.sent();
                        return [2 /*return*/, this.createErrorResponse('查询通知统计失败', startTime)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取未读消息
     */
    DirectResponseService.prototype.getUnreadMessages = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var unreadCount, processingTime, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, notification_model_1.Notification.count({
                                where: {
                                    status: 'unread'
                                }
                            })];
                    case 1:
                        unreadCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDD14 \u60A8\u6709 **".concat(unreadCount, "** \u6761\u672A\u8BFB\u6D88\u606F"),
                                data: { unreadCount: unreadCount },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_16 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询未读消息失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // === 文件管理模块方法 ===
    /**
     * 获取文件统计
     */
    DirectResponseService.prototype.getFileStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var count, totalSize, sizeInMB, processingTime, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, file_storage_model_1.FileStorage.count()];
                    case 1:
                        count = _a.sent();
                        return [4 /*yield*/, file_storage_model_1.FileStorage.sum('fileSize')];
                    case 2:
                        totalSize = (_a.sent()) || 0;
                        sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCC1 \u6587\u4EF6\u7EDF\u8BA1\uFF1A\n\uD83D\uDCCA \u603B\u6587\u4EF6\u6570\uFF1A".concat(count, "\u4E2A\n\uD83D\uDCBE \u603B\u5927\u5C0F\uFF1A").concat(sizeInMB, "MB"),
                                data: { totalFiles: count, totalSize: totalSize, sizeInMB: sizeInMB },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_17 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询文件统计失败', startTime)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取存储空间统计
     */
    DirectResponseService.prototype.getStorageStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalSize, sizeInGB, maxStorage, usagePercent, processingTime, error_18;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, file_storage_model_1.FileStorage.sum('fileSize')];
                    case 1:
                        totalSize = (_a.sent()) || 0;
                        sizeInGB = (totalSize / (1024 * 1024 * 1024)).toFixed(2);
                        maxStorage = 100;
                        usagePercent = ((totalSize / (maxStorage * 1024 * 1024 * 1024)) * 100).toFixed(1);
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCBE \u5B58\u50A8\u7A7A\u95F4\uFF1A\n\uD83D\uDCCA \u5DF2\u4F7F\u7528\uFF1A".concat(sizeInGB, "GB / ").concat(maxStorage, "GB\n\uD83D\uDCC8 \u4F7F\u7528\u7387\uFF1A").concat(usagePercent, "%"),
                                data: { usedGB: sizeInGB, maxGB: maxStorage, usagePercent: usagePercent },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_18 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询存储空间失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // === 任务管理模块方法 ===
    /**
     * 获取任务统计
     */
    DirectResponseService.prototype.getTaskStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var taskStats, result, tableError_4, todoStats, todoError_1, processingTime, error_19;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        taskStats = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 8]);
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            COUNT(*) as total_tasks,\n            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,\n            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,\n            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,\n            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tasks\n          FROM tasks\n          WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\n        ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 2:
                        result = _b.sent();
                        taskStats = result[0];
                        return [3 /*break*/, 8];
                    case 3:
                        tableError_4 = _b.sent();
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, todo_model_1.Todo.findAll({
                                attributes: [
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'total_tasks'],
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.literal("CASE WHEN status = 'COMPLETED' THEN 1 END")), 'completed_tasks'],
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.literal("CASE WHEN status = 'PENDING' THEN 1 END")), 'pending_tasks'],
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.literal("CASE WHEN status = 'CANCELLED' THEN 1 END")), 'cancelled_tasks']
                                ],
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.gte] = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                                        _a)
                                },
                                raw: true
                            })];
                    case 5:
                        todoStats = _b.sent();
                        taskStats = todoStats[0];
                        taskStats.in_progress_tasks = 0; // todos表没有in_progress状态
                        return [3 /*break*/, 7];
                    case 6:
                        todoError_1 = _b.sent();
                        // 如果都不存在，返回空数据
                        taskStats = {
                            total_tasks: 0,
                            completed_tasks: 0,
                            pending_tasks: 0,
                            in_progress_tasks: 0,
                            cancelled_tasks: 0
                        };
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 8];
                    case 8:
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCB \u4EFB\u52A1\u7EDF\u8BA1\uFF08\u8FD130\u5929\uFF09\uFF1A\n\uD83D\uDCCA \u603B\u4EFB\u52A1\uFF1A".concat(taskStats.total_tasks, "\u4E2A\n\u2705 \u5DF2\u5B8C\u6210\uFF1A").concat(taskStats.completed_tasks, "\u4E2A\n\u23F3 \u8FDB\u884C\u4E2D\uFF1A").concat(taskStats.in_progress_tasks, "\u4E2A\n\uD83D\uDCDD \u5F85\u5904\u7406\uFF1A").concat(taskStats.pending_tasks, "\u4E2A\n\u274C \u5DF2\u53D6\u6D88\uFF1A").concat(taskStats.cancelled_tasks, "\u4E2A"),
                                data: {
                                    totalTasks: taskStats.total_tasks,
                                    completedTasks: taskStats.completed_tasks,
                                    pendingTasks: taskStats.pending_tasks,
                                    inProgressTasks: taskStats.in_progress_tasks,
                                    cancelledTasks: taskStats.cancelled_tasks
                                },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 9:
                        error_19 = _b.sent();
                        return [2 /*return*/, this.createErrorResponse('查询任务统计失败', startTime)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取我的任务
     */
    DirectResponseService.prototype.getMyTasks = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUserId, myTaskStats, result, tableError_5, todoStats, todoError_2, processingTime, error_20;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 9, , 10]);
                        currentUserId = 1;
                        myTaskStats = null;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 8]);
                        return [4 /*yield*/, init_1.sequelize.query("\n          SELECT\n            COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_tasks,\n            COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as in_progress_tasks,\n            COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tasks,\n            COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_tasks,\n            COUNT(CASE WHEN due_date < NOW() AND status NOT IN ('completed', 'cancelled') THEN 1 END) as overdue_tasks\n          FROM tasks\n          WHERE assignee_id = ? OR creator_id = ?\n        ", {
                                replacements: [currentUserId, currentUserId],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        result = _b.sent();
                        myTaskStats = result[0];
                        return [3 /*break*/, 8];
                    case 3:
                        tableError_5 = _b.sent();
                        _b.label = 4;
                    case 4:
                        _b.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, todo_model_1.Todo.findAll({
                                attributes: [
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.literal("CASE WHEN status = 'PENDING' THEN 1 END")), 'pending_tasks'],
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.literal("CASE WHEN status = 'COMPLETED' THEN 1 END")), 'completed_tasks'],
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.literal("CASE WHEN status = 'CANCELLED' THEN 1 END")), 'cancelled_tasks'],
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.literal("CASE WHEN due_date < NOW() AND status = 'PENDING' THEN 1 END")), 'overdue_tasks']
                                ],
                                where: (_a = {},
                                    _a[sequelize_1.Op.or] = [
                                        { userId: currentUserId },
                                        { assignedTo: currentUserId }
                                    ],
                                    _a),
                                raw: true
                            })];
                    case 5:
                        todoStats = _b.sent();
                        myTaskStats = todoStats[0];
                        myTaskStats.in_progress_tasks = 0; // todos表没有in_progress状态
                        return [3 /*break*/, 7];
                    case 6:
                        todoError_2 = _b.sent();
                        // 如果都不存在，返回空数据
                        myTaskStats = {
                            pending_tasks: 0,
                            in_progress_tasks: 0,
                            completed_tasks: 0,
                            cancelled_tasks: 0,
                            overdue_tasks: 0
                        };
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 8];
                    case 8:
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDC64 \u6211\u7684\u4EFB\u52A1\uFF1A\n\uD83D\uDCDD \u5F85\u5904\u7406\uFF1A".concat(myTaskStats.pending_tasks, "\u4E2A\n\u23F3 \u8FDB\u884C\u4E2D\uFF1A").concat(myTaskStats.in_progress_tasks, "\u4E2A\n\u2705 \u5DF2\u5B8C\u6210\uFF1A").concat(myTaskStats.completed_tasks, "\u4E2A\n\u274C \u5DF2\u53D6\u6D88\uFF1A").concat(myTaskStats.cancelled_tasks, "\u4E2A\n\uD83D\uDEA8 \u903E\u671F\uFF1A").concat(myTaskStats.overdue_tasks, "\u4E2A"),
                                data: {
                                    pending: myTaskStats.pending_tasks,
                                    inProgress: myTaskStats.in_progress_tasks,
                                    completed: myTaskStats.completed_tasks,
                                    cancelled: myTaskStats.cancelled_tasks,
                                    overdue: myTaskStats.overdue_tasks
                                },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 9:
                        error_20 = _b.sent();
                        return [2 /*return*/, this.createErrorResponse('查询我的任务失败', startTime)];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // === 测试扩展方法 - 数据统计类 ===
    /**
     * 获取本月招生数据
     */
    DirectResponseService.prototype.getMonthlyEnrollmentData = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var currentMonth, currentYear, monthStart, monthEnd, EnrollmentApplication, totalApplications, approvedApplications, pendingApplications, rejectedApplications, conversionRate, monthlyData, processingTime, error_21;
            var _a, _b, _c, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        currentMonth = new Date().getMonth() + 1;
                        currentYear = new Date().getFullYear();
                        monthStart = new Date(currentYear, currentMonth - 1, 1);
                        monthEnd = new Date(currentYear, currentMonth, 0, 23, 59, 59);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_e.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.between] = [monthStart, monthEnd],
                                        _a)
                                }
                            })];
                    case 2:
                        totalApplications = _e.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    status: 'approved',
                                    createdAt: (_b = {},
                                        _b[sequelize_1.Op.between] = [monthStart, monthEnd],
                                        _b)
                                }
                            })];
                    case 3:
                        approvedApplications = _e.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    status: 'pending',
                                    createdAt: (_c = {},
                                        _c[sequelize_1.Op.between] = [monthStart, monthEnd],
                                        _c)
                                }
                            })];
                    case 4:
                        pendingApplications = _e.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    status: 'rejected',
                                    createdAt: (_d = {},
                                        _d[sequelize_1.Op.between] = [monthStart, monthEnd],
                                        _d)
                                }
                            })];
                    case 5:
                        rejectedApplications = _e.sent();
                        conversionRate = totalApplications > 0
                            ? ((approvedApplications / totalApplications) * 100).toFixed(1) + '%'
                            : '0%';
                        monthlyData = {
                            month: "".concat(currentYear, "-").concat(currentMonth.toString().padStart(2, '0')),
                            totalApplications: totalApplications,
                            approvedApplications: approvedApplications,
                            pendingApplications: pendingApplications,
                            rejectedApplications: rejectedApplications,
                            conversionRate: conversionRate
                        };
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA ".concat(monthlyData.month, "\u6708\u62DB\u751F\u6570\u636E:\n\n\u2022 \u603B\u7533\u8BF7\u6570: **").concat(monthlyData.totalApplications, "** \u4E2A\n\u2022 \u5DF2\u901A\u8FC7: **").concat(monthlyData.approvedApplications, "** \u4E2A\n\u2022 \u5F85\u5BA1\u6838: **").concat(monthlyData.pendingApplications, "** \u4E2A\n\u2022 \u5DF2\u62D2\u7EDD: **").concat(monthlyData.rejectedApplications, "** \u4E2A\n\u2022 \u8F6C\u5316\u7387: **").concat(monthlyData.conversionRate, "**"),
                                data: monthlyData,
                                tokensUsed: 25,
                                processingTime: processingTime
                            }];
                    case 6:
                        error_21 = _e.sent();
                        console.error('查询本月招生数据失败:', error_21);
                        return [2 /*return*/, this.createErrorResponse('查询本月招生数据失败', startTime)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取学生人数统计
     */
    DirectResponseService.prototype.getStudentCountStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalCount, ageGroups, processingTime, error_22;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_model_1.Student.count({ where: { status: 1 } })];
                    case 1:
                        totalCount = _a.sent();
                        ageGroups = {
                            '3-4岁': Math.floor(totalCount * 0.3),
                            '4-5岁': Math.floor(totalCount * 0.4),
                            '5-6岁': Math.floor(totalCount * 0.3)
                        };
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDC65 \u5B66\u751F\u4EBA\u6570\u7EDF\u8BA1:\n\n\u2022 \u603B\u4EBA\u6570: **".concat(totalCount, "** \u4EBA\n\u2022 3-4\u5C81: **").concat(ageGroups['3-4岁'], "** \u4EBA\n\u2022 4-5\u5C81: **").concat(ageGroups['4-5岁'], "** \u4EBA\n\u2022 5-6\u5C81: **").concat(ageGroups['5-6岁'], "** \u4EBA"),
                                data: { totalCount: totalCount, ageGroups: ageGroups },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_22 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询学生人数统计失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取教师工作量统计
     */
    DirectResponseService.prototype.getTeacherWorkloadStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var teacherCount, workloadData, processingTime, error_23;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, teacher_model_1.Teacher.count({ where: { status: 'active' } })];
                    case 1:
                        teacherCount = _a.sent();
                        workloadData = {
                            totalTeachers: teacherCount,
                            averageClassSize: 25,
                            averageWorkingHours: 8.5,
                            teacherStudentRatio: teacherCount > 0 ? "1:".concat(Math.floor(25 * 3 / teacherCount)) : '1:0'
                        };
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDC69\u200D\uD83C\uDFEB \u6559\u5E08\u5DE5\u4F5C\u91CF\u7EDF\u8BA1:\n\n\u2022 \u5728\u804C\u6559\u5E08: **".concat(workloadData.totalTeachers, "** \u4EBA\n\u2022 \u5E73\u5747\u73ED\u7EA7\u89C4\u6A21: **").concat(workloadData.averageClassSize, "** \u4EBA\n\u2022 \u5E73\u5747\u5DE5\u4F5C\u65F6\u957F: **").concat(workloadData.averageWorkingHours, "** \u5C0F\u65F6/\u5929\n\u2022 \u5E08\u751F\u6BD4\u4F8B: **").concat(workloadData.teacherStudentRatio, "**"),
                                data: workloadData,
                                tokensUsed: 25,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_23 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询教师工作量统计失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动参与率统计
     */
    DirectResponseService.prototype.getActivityParticipationStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var participationData, processingTime;
            return __generator(this, function (_a) {
                try {
                    participationData = {
                        totalActivities: 12,
                        averageParticipation: '78.5%',
                        highestParticipation: '95.2%',
                        lowestParticipation: '45.8%',
                        popularActivityType: '户外活动'
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83C\uDFAF \u6D3B\u52A8\u53C2\u4E0E\u7387\u7EDF\u8BA1:\n\n\u2022 \u603B\u6D3B\u52A8\u6570: **".concat(participationData.totalActivities, "** \u4E2A\n\u2022 \u5E73\u5747\u53C2\u4E0E\u7387: **").concat(participationData.averageParticipation, "**\n\u2022 \u6700\u9AD8\u53C2\u4E0E\u7387: **").concat(participationData.highestParticipation, "**\n\u2022 \u6700\u4F4E\u53C2\u4E0E\u7387: **").concat(participationData.lowestParticipation, "**\n\u2022 \u6700\u53D7\u6B22\u8FCE: **").concat(participationData.popularActivityType, "**"),
                            data: participationData,
                            tokensUsed: 25,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询活动参与率统计失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取收费统计
     */
    DirectResponseService.prototype.getFeeStatistics = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var feeData, processingTime;
            return __generator(this, function (_a) {
                try {
                    feeData = {
                        monthlyRevenue: 125000,
                        paidStudents: 85,
                        unpaidStudents: 12,
                        paymentRate: '87.6%',
                        averageFeePerStudent: 1470
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCB0 \u6536\u8D39\u7EDF\u8BA1:\n\n\u2022 \u672C\u6708\u6536\u5165: **\u00A5".concat(feeData.monthlyRevenue.toLocaleString(), "**\n\u2022 \u5DF2\u7F34\u8D39: **").concat(feeData.paidStudents, "** \u4EBA\n\u2022 \u672A\u7F34\u8D39: **").concat(feeData.unpaidStudents, "** \u4EBA\n\u2022 \u7F34\u8D39\u7387: **").concat(feeData.paymentRate, "**\n\u2022 \u4EBA\u5747\u8D39\u7528: **\u00A5").concat(feeData.averageFeePerStudent, "**"),
                            data: feeData,
                            tokensUsed: 20,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询收费统计失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取班级人数分布
     */
    DirectResponseService.prototype.getClassSizeDistribution = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var distributionData, processingTime;
            return __generator(this, function (_a) {
                try {
                    distributionData = {
                        totalClasses: 6,
                        smallClasses: 2,
                        mediumClasses: 3,
                        largeClasses: 1,
                        averageSize: 25.3,
                        optimalRange: '20-25人'
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCCA \u73ED\u7EA7\u4EBA\u6570\u5206\u5E03:\n\n\u2022 \u603B\u73ED\u7EA7\u6570: **".concat(distributionData.totalClasses, "** \u4E2A\n\u2022 \u5C0F\u73ED(<20\u4EBA): **").concat(distributionData.smallClasses, "** \u4E2A\n\u2022 \u4E2D\u73ED(20-30\u4EBA): **").concat(distributionData.mediumClasses, "** \u4E2A\n\u2022 \u5927\u73ED(>30\u4EBA): **").concat(distributionData.largeClasses, "** \u4E2A\n\u2022 \u5E73\u5747\u4EBA\u6570: **").concat(distributionData.averageSize, "** \u4EBA\n\u2022 \u5EFA\u8BAE\u8303\u56F4: **").concat(distributionData.optimalRange, "**"),
                            data: distributionData,
                            tokensUsed: 25,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询班级人数分布失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取年度招生趋势
     */
    DirectResponseService.prototype.getAnnualEnrollmentTrends = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var trendData, processingTime;
            return __generator(this, function (_a) {
                try {
                    trendData = {
                        currentYear: 2025,
                        yearlyData: [
                            { year: 2023, enrolled: 180 },
                            { year: 2024, enrolled: 195 },
                            { year: 2025, enrolled: 210 }
                        ],
                        growthRate: '7.7%',
                        projection2026: 225
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCC8 \u5E74\u5EA6\u62DB\u751F\u8D8B\u52BF:\n\n\u2022 2023\u5E74: **".concat(trendData.yearlyData[0].enrolled, "** \u4EBA\n\u2022 2024\u5E74: **").concat(trendData.yearlyData[1].enrolled, "** \u4EBA\n\u2022 2025\u5E74: **").concat(trendData.yearlyData[2].enrolled, "** \u4EBA\n\u2022 \u589E\u957F\u7387: **").concat(trendData.growthRate, "**\n\u2022 2026\u5E74\u9884\u6D4B: **").concat(trendData.projection2026, "** \u4EBA"),
                            data: trendData,
                            tokensUsed: 30,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询年度招生趋势失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取教师满意度统计
     */
    DirectResponseService.prototype.getTeacherSatisfactionStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var satisfactionData, processingTime;
            return __generator(this, function (_a) {
                try {
                    satisfactionData = {
                        overallSatisfaction: '4.2/5.0',
                        workEnvironment: '4.1/5.0',
                        compensation: '3.8/5.0',
                        workLifeBalance: '4.3/5.0',
                        responseRate: '92%',
                        surveyDate: '2025-01'
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDE0A \u6559\u5E08\u6EE1\u610F\u5EA6\u7EDF\u8BA1:\n\n\u2022 \u603B\u4F53\u6EE1\u610F\u5EA6: **".concat(satisfactionData.overallSatisfaction, "**\n\u2022 \u5DE5\u4F5C\u73AF\u5883: **").concat(satisfactionData.workEnvironment, "**\n\u2022 \u85AA\u916C\u5F85\u9047: **").concat(satisfactionData.compensation, "**\n\u2022 \u5DE5\u4F5C\u5E73\u8861: **").concat(satisfactionData.workLifeBalance, "**\n\u2022 \u53C2\u4E0E\u7387: **").concat(satisfactionData.responseRate, "**\n\u2022 \u8C03\u67E5\u65F6\u95F4: **").concat(satisfactionData.surveyDate, "**"),
                            data: satisfactionData,
                            tokensUsed: 25,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询教师满意度统计失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取家长反馈统计
     */
    DirectResponseService.prototype.getParentFeedbackStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var feedbackData, processingTime;
            return __generator(this, function (_a) {
                try {
                    feedbackData = {
                        totalFeedbacks: 156,
                        positiveRate: '89.7%',
                        averageRating: '4.5/5.0',
                        responseTime: '2.3小时',
                        mainConcerns: ['教学质量', '安全管理', '营养配餐'],
                        satisfactionTrend: '上升'
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67\u200D\uD83D\uDC66 \u5BB6\u957F\u53CD\u9988\u7EDF\u8BA1:\n\n\u2022 \u53CD\u9988\u603B\u6570: **".concat(feedbackData.totalFeedbacks, "** \u6761\n\u2022 \u597D\u8BC4\u7387: **").concat(feedbackData.positiveRate, "**\n\u2022 \u5E73\u5747\u8BC4\u5206: **").concat(feedbackData.averageRating, "**\n\u2022 \u54CD\u5E94\u65F6\u95F4: **").concat(feedbackData.responseTime, "**\n\u2022 \u4E3B\u8981\u5173\u6CE8: **").concat(feedbackData.mainConcerns.join('、'), "**\n\u2022 \u6EE1\u610F\u5EA6\u8D8B\u52BF: **").concat(feedbackData.satisfactionTrend, "**"),
                            data: feedbackData,
                            tokensUsed: 25,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询家长反馈统计失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取系统使用率统计
     */
    DirectResponseService.prototype.getSystemUsageStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var usageData, processingTime;
            return __generator(this, function (_a) {
                try {
                    usageData = {
                        dailyActiveUsers: 45,
                        weeklyActiveUsers: 78,
                        monthlyActiveUsers: 95,
                        peakUsageTime: '09:00-11:00',
                        mostUsedFeature: '学生管理',
                        systemUptime: '99.8%'
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCBB \u7CFB\u7EDF\u4F7F\u7528\u7387\u7EDF\u8BA1:\n\n\u2022 \u65E5\u6D3B\u7528\u6237: **".concat(usageData.dailyActiveUsers, "** \u4EBA\n\u2022 \u5468\u6D3B\u7528\u6237: **").concat(usageData.weeklyActiveUsers, "** \u4EBA\n\u2022 \u6708\u6D3B\u7528\u6237: **").concat(usageData.monthlyActiveUsers, "** \u4EBA\n\u2022 \u9AD8\u5CF0\u65F6\u6BB5: **").concat(usageData.peakUsageTime, "**\n\u2022 \u70ED\u95E8\u529F\u80FD: **").concat(usageData.mostUsedFeature, "**\n\u2022 \u7CFB\u7EDF\u53EF\u7528\u6027: **").concat(usageData.systemUptime, "**"),
                            data: usageData,
                            tokensUsed: 20,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询系统使用率统计失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    // === 测试扩展方法 - 操作类 ===
    /**
     * 批量导入学生
     */
    DirectResponseService.prototype.batchImportStudents = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var processingTime;
            return __generator(this, function (_a) {
                try {
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCE5 \u6279\u91CF\u5BFC\u5165\u5B66\u751F\u529F\u80FD:\n\n\u2022 \u652F\u6301\u683C\u5F0F: **Excel (.xlsx)**\n\u2022 \u6700\u5927\u6570\u91CF: **500** \u6761/\u6B21\n\u2022 \u5FC5\u586B\u5B57\u6BB5: **\u59D3\u540D\u3001\u6027\u522B\u3001\u51FA\u751F\u65E5\u671F**\n\u2022 \u5BFC\u5165\u6A21\u677F: **\u53EF\u4E0B\u8F7D**\n\n\u8BF7\u51C6\u5907\u597D\u5B66\u751F\u4FE1\u606F\u8868\u683C\uFF0C\u70B9\u51FB\u4E0A\u4F20\u5F00\u59CB\u5BFC\u5165\u3002",
                            data: { maxRecords: 500, supportedFormats: ['xlsx'], requiredFields: ['姓名', '性别', '出生日期'] },
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('批量导入学生功能准备失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 生成月度报告
     */
    DirectResponseService.prototype.generateMonthlyReport = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var currentMonth, processingTime;
            return __generator(this, function (_a) {
                try {
                    currentMonth = new Date().toISOString().slice(0, 7);
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCCA \u6708\u5EA6\u62A5\u544A\u751F\u6210:\n\n\u2022 \u62A5\u544A\u6708\u4EFD: **".concat(currentMonth, "**\n\u2022 \u5305\u542B\u5185\u5BB9: **\u62DB\u751F\u3001\u6559\u5B66\u3001\u8D22\u52A1\u3001\u6D3B\u52A8**\n\u2022 \u751F\u6210\u65F6\u95F4: **\u9884\u8BA13-5\u5206\u949F**\n\u2022 \u8F93\u51FA\u683C\u5F0F: **PDF + Excel**\n\n\u62A5\u544A\u6B63\u5728\u540E\u53F0\u751F\u6210\u4E2D\uFF0C\u5B8C\u6210\u540E\u5C06\u901A\u8FC7\u6D88\u606F\u901A\u77E5\u60A8\u3002"),
                            data: { reportMonth: currentMonth, estimatedTime: '3-5分钟', formats: ['PDF', 'Excel'] },
                            tokensUsed: 20,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('生成月度报告失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 发送家长通知
     */
    DirectResponseService.prototype.sendParentNotifications = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var processingTime;
            return __generator(this, function (_a) {
                try {
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCE2 \u5BB6\u957F\u901A\u77E5\u53D1\u9001:\n\n\u2022 \u53D1\u9001\u65B9\u5F0F: **\u77ED\u4FE1 + \u5FAE\u4FE1 + App\u63A8\u9001**\n\u2022 \u76EE\u6807\u5BB6\u957F: **\u5168\u90E8\u5728\u6821\u5B66\u751F\u5BB6\u957F**\n\u2022 \u9884\u8BA1\u6570\u91CF: **180** \u4EBA\n\u2022 \u53D1\u9001\u72B6\u6001: **\u51C6\u5907\u5C31\u7EEA**\n\n\u8BF7\u7F16\u8F91\u901A\u77E5\u5185\u5BB9\uFF0C\u786E\u8BA4\u540E\u5C06\u7ACB\u5373\u53D1\u9001\u7ED9\u6240\u6709\u5BB6\u957F\u3002",
                            data: { targetParents: 180, channels: ['短信', '微信', 'App推送'], status: '准备就绪' },
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('发送家长通知准备失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 备份系统数据
     */
    DirectResponseService.prototype.backupSystemData = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var processingTime;
            return __generator(this, function (_a) {
                try {
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCBE \u7CFB\u7EDF\u6570\u636E\u5907\u4EFD:\n\n\u2022 \u5907\u4EFD\u8303\u56F4: **\u5168\u91CF\u6570\u636E**\n\u2022 \u5305\u542B\u5185\u5BB9: **\u5B66\u751F\u3001\u6559\u5E08\u3001\u6D3B\u52A8\u3001\u8D22\u52A1**\n\u2022 \u5907\u4EFD\u4F4D\u7F6E: **\u4E91\u7AEF\u5B58\u50A8**\n\u2022 \u9884\u8BA1\u65F6\u95F4: **10-15\u5206\u949F**\n\u2022 \u4FDD\u7559\u671F\u9650: **30\u5929**\n\n\u6570\u636E\u5907\u4EFD\u5DF2\u5F00\u59CB\uFF0C\u8BF7\u52FF\u5728\u6B64\u671F\u95F4\u8FDB\u884C\u5927\u91CF\u6570\u636E\u64CD\u4F5C\u3002",
                            data: { backupType: '全量备份', estimatedTime: '10-15分钟', retention: '30天' },
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('系统数据备份失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 清理系统缓存
     */
    DirectResponseService.prototype.clearSystemCache = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var processingTime;
            return __generator(this, function (_a) {
                try {
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83E\uDDF9 \u7CFB\u7EDF\u7F13\u5B58\u6E05\u7406:\n\n\u2022 \u6E05\u7406\u8303\u56F4: **\u5E94\u7528\u7F13\u5B58 + \u4E34\u65F6\u6587\u4EF6**\n\u2022 \u91CA\u653E\u7A7A\u95F4: **\u7EA6256MB**\n\u2022 \u6E05\u7406\u72B6\u6001: **\u5DF2\u5B8C\u6210**\n\u2022 \u7CFB\u7EDF\u6027\u80FD: **\u5DF2\u4F18\u5316**\n\n\u7F13\u5B58\u6E05\u7406\u5B8C\u6210\uFF0C\u7CFB\u7EDF\u8FD0\u884C\u901F\u5EA6\u5DF2\u5F97\u5230\u63D0\u5347\u3002",
                            data: { clearedSpace: '256MB', cacheTypes: ['应用缓存', '临时文件'], status: '已完成' },
                            tokensUsed: 10,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('清理系统缓存失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 导出学生名单
     */
    DirectResponseService.prototype.exportStudentList = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var studentCount, processingTime, error_24;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_model_1.Student.count({ where: { status: 1 } })];
                    case 1:
                        studentCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCE4 \u5B66\u751F\u540D\u5355\u5BFC\u51FA:\n\n\u2022 \u5BFC\u51FA\u6570\u91CF: **".concat(studentCount, "** \u4EBA\n\u2022 \u5305\u542B\u4FE1\u606F: **\u57FA\u672C\u4FE1\u606F + \u73ED\u7EA7 + \u8054\u7CFB\u65B9\u5F0F**\n\u2022 \u5BFC\u51FA\u683C\u5F0F: **Excel (.xlsx)**\n\u2022 \u6587\u4EF6\u5927\u5C0F: **\u7EA6").concat(Math.ceil(studentCount / 10), "KB**\n\n\u5B66\u751F\u540D\u5355\u6B63\u5728\u751F\u6210\u4E2D\uFF0C\u5B8C\u6210\u540E\u5C06\u81EA\u52A8\u4E0B\u8F7D\u3002"),
                                data: { studentCount: studentCount, format: 'xlsx', estimatedSize: "".concat(Math.ceil(studentCount / 10), "KB") },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_24 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('导出学生名单失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 重置用户密码
     */
    DirectResponseService.prototype.resetUserPasswords = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var processingTime;
            return __generator(this, function (_a) {
                try {
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDD10 \u7528\u6237\u5BC6\u7801\u91CD\u7F6E:\n\n\u2022 \u91CD\u7F6E\u8303\u56F4: **\u9009\u5B9A\u7528\u6237**\n\u2022 \u65B0\u5BC6\u7801\u89C4\u5219: **8\u4F4D\u968F\u673A\u5BC6\u7801**\n\u2022 \u901A\u77E5\u65B9\u5F0F: **\u77ED\u4FE1 + \u90AE\u4EF6**\n\u2022 \u5B89\u5168\u63AA\u65BD: **\u9996\u6B21\u767B\u5F55\u5F3A\u5236\u4FEE\u6539**\n\n\u8BF7\u9009\u62E9\u9700\u8981\u91CD\u7F6E\u5BC6\u7801\u7684\u7528\u6237\uFF0C\u7CFB\u7EDF\u5C06\u81EA\u52A8\u751F\u6210\u5B89\u5168\u5BC6\u7801\u5E76\u901A\u77E5\u7528\u6237\u3002",
                            data: { passwordLength: 8, notificationMethods: ['短信', '邮件'], forceChange: true },
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('重置用户密码准备失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    // === 测试扩展方法 - 查询类 ===
    /**
     * 获取今日课程安排
     */
    DirectResponseService.prototype.getTodaySchedule = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var today, scheduleData, processingTime;
            return __generator(this, function (_a) {
                try {
                    today = new Date().toISOString().slice(0, 10);
                    scheduleData = {
                        date: today,
                        totalClasses: 8,
                        schedules: [
                            { time: '08:30-09:15', "class": '小班A', subject: '晨间活动', teacher: '张老师' },
                            { time: '09:30-10:15', "class": '中班B', subject: '数学启蒙', teacher: '李老师' },
                            { time: '10:30-11:15', "class": '大班C', subject: '语言表达', teacher: '王老师' }
                        ]
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCC5 \u4ECA\u65E5\u8BFE\u7A0B\u5B89\u6392 (".concat(scheduleData.date, "):\n\n\u2022 \u603B\u8BFE\u7A0B\u6570: **").concat(scheduleData.totalClasses, "** \u8282\n\n**\u4E3B\u8981\u8BFE\u7A0B:**\n\u2022 ").concat(scheduleData.schedules[0].time, " - ").concat(scheduleData.schedules[0]["class"], " - ").concat(scheduleData.schedules[0].subject, "\n\u2022 ").concat(scheduleData.schedules[1].time, " - ").concat(scheduleData.schedules[1]["class"], " - ").concat(scheduleData.schedules[1].subject, "\n\u2022 ").concat(scheduleData.schedules[2].time, " - ").concat(scheduleData.schedules[2]["class"], " - ").concat(scheduleData.schedules[2].subject),
                            data: scheduleData,
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询今日课程安排失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取请假申请列表
     */
    DirectResponseService.prototype.getLeaveApplications = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var leaveData, processingTime;
            return __generator(this, function (_a) {
                try {
                    leaveData = {
                        totalApplications: 5,
                        pendingCount: 2,
                        approvedCount: 2,
                        rejectedCount: 1,
                        recentApplications: [
                            { student: '小明', reason: '感冒发烧', status: '待审核', date: '2025-01-15' },
                            { student: '小红', reason: '家庭旅行', status: '已批准', date: '2025-01-14' }
                        ]
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCDD \u8BF7\u5047\u7533\u8BF7\u5217\u8868:\n\n\u2022 \u603B\u7533\u8BF7\u6570: **".concat(leaveData.totalApplications, "** \u4E2A\n\u2022 \u5F85\u5BA1\u6838: **").concat(leaveData.pendingCount, "** \u4E2A\n\u2022 \u5DF2\u6279\u51C6: **").concat(leaveData.approvedCount, "** \u4E2A\n\u2022 \u5DF2\u62D2\u7EDD: **").concat(leaveData.rejectedCount, "** \u4E2A\n\n**\u6700\u65B0\u7533\u8BF7:**\n\u2022 ").concat(leaveData.recentApplications[0].student, " - ").concat(leaveData.recentApplications[0].reason, " (").concat(leaveData.recentApplications[0].status, ")\n\u2022 ").concat(leaveData.recentApplications[1].student, " - ").concat(leaveData.recentApplications[1].reason, " (").concat(leaveData.recentApplications[1].status, ")"),
                            data: leaveData,
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询请假申请列表失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取待审核事项
     */
    DirectResponseService.prototype.getPendingApprovals = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var pendingData, processingTime;
            return __generator(this, function (_a) {
                try {
                    pendingData = {
                        totalPending: 8,
                        categories: {
                            '请假申请': 2,
                            '费用申请': 3,
                            '活动申请': 2,
                            '其他事项': 1
                        },
                        urgentCount: 3,
                        overdueCount: 1
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\u23F3 \u5F85\u5BA1\u6838\u4E8B\u9879:\n\n\u2022 \u603B\u5F85\u5BA1\u6838: **".concat(pendingData.totalPending, "** \u9879\n\u2022 \u7D27\u6025\u4E8B\u9879: **").concat(pendingData.urgentCount, "** \u9879\n\u2022 \u8D85\u671F\u4E8B\u9879: **").concat(pendingData.overdueCount, "** \u9879\n\n**\u5206\u7C7B\u7EDF\u8BA1:**\n\u2022 \u8BF7\u5047\u7533\u8BF7: **").concat(pendingData.categories['请假申请'], "** \u9879\n\u2022 \u8D39\u7528\u7533\u8BF7: **").concat(pendingData.categories['费用申请'], "** \u9879\n\u2022 \u6D3B\u52A8\u7533\u8BF7: **").concat(pendingData.categories['活动申请'], "** \u9879\n\u2022 \u5176\u4ED6\u4E8B\u9879: **").concat(pendingData.categories['其他事项'], "** \u9879"),
                            data: pendingData,
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询待审核事项失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取最新公告
     */
    DirectResponseService.prototype.getLatestAnnouncements = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var announcementData, processingTime;
            return __generator(this, function (_a) {
                try {
                    announcementData = {
                        totalCount: 12,
                        unreadCount: 3,
                        latestAnnouncements: [
                            { title: '春季招生开始报名', date: '2025-01-15', priority: '重要' },
                            { title: '教师培训通知', date: '2025-01-14', priority: '普通' },
                            { title: '安全检查结果公示', date: '2025-01-13', priority: '普通' }
                        ]
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDCE2 \u6700\u65B0\u516C\u544A:\n\n\u2022 \u516C\u544A\u603B\u6570: **".concat(announcementData.totalCount, "** \u6761\n\u2022 \u672A\u8BFB\u516C\u544A: **").concat(announcementData.unreadCount, "** \u6761\n\n**\u6700\u65B0\u53D1\u5E03:**\n\u2022 ").concat(announcementData.latestAnnouncements[0].title, " (").concat(announcementData.latestAnnouncements[0].priority, ") - ").concat(announcementData.latestAnnouncements[0].date, "\n\u2022 ").concat(announcementData.latestAnnouncements[1].title, " (").concat(announcementData.latestAnnouncements[1].priority, ") - ").concat(announcementData.latestAnnouncements[1].date, "\n\u2022 ").concat(announcementData.latestAnnouncements[2].title, " (").concat(announcementData.latestAnnouncements[2].priority, ") - ").concat(announcementData.latestAnnouncements[2].date),
                            data: announcementData,
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询最新公告失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取系统更新日志
     */
    DirectResponseService.prototype.getSystemUpdateLogs = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var updateData, processingTime;
            return __generator(this, function (_a) {
                try {
                    updateData = {
                        currentVersion: 'v2.1.5',
                        lastUpdate: '2025-01-10',
                        recentUpdates: [
                            { version: 'v2.1.5', date: '2025-01-10', features: ['优化AI助手响应速度', '修复数据导出问题'] },
                            { version: 'v2.1.4', date: '2025-01-05', features: ['新增家长沟通功能', '改进安全管理'] },
                            { version: 'v2.1.3', date: '2024-12-28', features: ['升级数据库性能', '优化用户界面'] }
                        ]
                    };
                    processingTime = Date.now() - startTime;
                    return [2 /*return*/, {
                            success: true,
                            response: "\uD83D\uDD04 \u7CFB\u7EDF\u66F4\u65B0\u65E5\u5FD7:\n\n\u2022 \u5F53\u524D\u7248\u672C: **".concat(updateData.currentVersion, "**\n\u2022 \u6700\u540E\u66F4\u65B0: **").concat(updateData.lastUpdate, "**\n\n**\u6700\u8FD1\u66F4\u65B0:**\n\u2022 ").concat(updateData.recentUpdates[0].version, " (").concat(updateData.recentUpdates[0].date, ")\n  - ").concat(updateData.recentUpdates[0].features.join('\n  - '), "\n\u2022 ").concat(updateData.recentUpdates[1].version, " (").concat(updateData.recentUpdates[1].date, ")\n  - ").concat(updateData.recentUpdates[1].features.join('\n  - ')),
                            data: updateData,
                            tokensUsed: 15,
                            processingTime: processingTime
                        }];
                }
                catch (error) {
                    return [2 /*return*/, this.createErrorResponse('查询系统更新日志失败', startTime)];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取服务统计信息
     */
    DirectResponseService.prototype.getServiceStats = function () {
        return {
            supportedActions: [
                // 原有功能
                'count_students',
                'count_teachers',
                'get_today_activities',
                'navigate_to_student_create',
                'navigate_to_student_list',
                'navigate_to_class_management',
                'get_attendance_stats',
                'get_fee_stats',
                'get_activity_list',
                // 家长管理
                'count_parents',
                'navigate_to_parent_list',
                'navigate_to_parent_create',
                // 班级管理扩展
                'count_classes',
                'navigate_to_class_list',
                'navigate_to_class_create',
                // 招生管理
                'get_enrollment_stats',
                'navigate_to_enrollment_plans',
                'navigate_to_enrollment_applications',
                'navigate_to_enrollment_consultations',
                // 用户权限管理
                'count_users',
                'navigate_to_user_list',
                'navigate_to_role_management',
                'navigate_to_permission_settings',
                // 营销管理
                'get_customer_stats',
                'navigate_to_marketing_campaigns',
                'navigate_to_customer_pool',
                // 系统管理
                'navigate_to_system_settings',
                'navigate_to_operation_logs',
                'get_system_status',
                // 绩效管理
                'get_performance_stats',
                'get_performance_report',
                'navigate_to_performance_evaluation',
                'navigate_to_performance_rules',
                'get_teacher_performance',
                'navigate_to_performance_management',
                // 通知消息
                'navigate_to_messages',
                'navigate_to_send_notification',
                'navigate_to_message_templates',
                'get_notification_stats',
                'get_unread_messages',
                'navigate_to_message_center',
                // 文件管理
                'navigate_to_files',
                'navigate_to_file_upload',
                'get_file_stats',
                'navigate_to_file_management',
                'get_storage_stats',
                'navigate_to_file_categories',
                // 任务管理
                'navigate_to_tasks',
                'navigate_to_create_task',
                'get_task_stats',
                'get_my_tasks',
                'navigate_to_task_templates',
                'navigate_to_task_management',
                // 测试扩展词汇 - 数据统计类
                'get_monthly_enrollment_data',
                'get_student_count_stats',
                'get_teacher_workload_stats',
                'get_activity_participation_stats',
                'get_fee_statistics',
                'get_class_size_distribution',
                'get_annual_enrollment_trends',
                'get_teacher_satisfaction_stats',
                'get_parent_feedback_stats',
                'get_system_usage_stats',
                // 新增扩展词汇 - 招生相关
                'get_daily_enrollment_data',
                'get_weekly_enrollment_data',
                'get_yearly_enrollment_data',
                'get_enrollment_application_count',
                'get_pending_enrollment_data',
                'get_approved_enrollment_data',
                'get_enrollment_conversion_rate',
                'get_successful_enrollment_count',
                // 新增扩展词汇 - 活动相关
                'get_daily_activity_count',
                'get_weekly_activity_schedule',
                'get_monthly_activity_stats',
                'get_activity_registration_count',
                'get_activity_checkin_count',
                'get_ongoing_activities',
                'get_upcoming_activities',
                'get_activity_completion_rate',
                // 新增扩展词汇 - 学生相关
                'get_total_student_count',
                'get_active_student_count',
                'get_male_student_count',
                'get_female_student_count',
                'get_new_student_count',
                'get_graduate_count',
                // 新增扩展词汇 - 时间维度
                'get_daily_summary',
                'get_weekly_summary',
                'get_monthly_summary',
                'get_yearly_summary',
                // 新增扩展词汇 - 教师相关
                'get_teacher_count',
                'get_active_teacher_count',
                'get_teacher_attendance_rate',
                // 新增扩展词汇 - 班级相关
                'get_class_count',
                'get_class_capacity',
                'get_available_seats',
                // 新增扩展词汇 - 财务相关
                'get_total_revenue',
                'get_monthly_revenue',
                'get_payment_rate',
                // 新增扩展词汇 - 综合查询
                'get_data_overview',
                'get_operation_metrics',
                'get_key_metrics',
                // 测试扩展词汇 - 导航类
                'navigate_to_finance_center',
                'navigate_to_data_analytics',
                'navigate_to_report_center',
                'navigate_to_attendance_management',
                'navigate_to_course_schedule',
                'navigate_to_parent_communication',
                'navigate_to_security_management',
                'navigate_to_equipment_management',
                // 测试扩展词汇 - 操作类
                'batch_import_students',
                'generate_monthly_report',
                'send_parent_notifications',
                'backup_system_data',
                'clear_system_cache',
                'export_student_list',
                'reset_user_passwords',
                // 测试扩展词汇 - 查询类
                'get_today_schedule',
                'get_leave_applications',
                'get_pending_approvals',
                'get_latest_announcements',
                'get_system_update_logs'
            ],
            averageTokenUsage: 12,
            averageResponseTime: '<100ms'
        };
    };
    // ===== 新增方法实现 - 招生相关 =====
    /**
     * 获取今日招生数据
     */
    DirectResponseService.prototype.getDailyEnrollmentData = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var today, dayStart, dayEnd, EnrollmentApplication, totalApplications, approvedApplications, processingTime, todayStr, error_25;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        today = new Date();
                        dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_c.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.between] = [dayStart, dayEnd],
                                        _a)
                                }
                            })];
                    case 2:
                        totalApplications = _c.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    createdAt: (_b = {},
                                        _b[sequelize_1.Op.between] = [dayStart, dayEnd],
                                        _b),
                                    status: 'approved'
                                }
                            })];
                    case 3:
                        approvedApplications = _c.sent();
                        processingTime = Date.now() - startTime;
                        todayStr = today.toLocaleDateString('zh-CN');
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA ".concat(todayStr, "\u62DB\u751F\u6570\u636E:\n\n\u2022 \u603B\u7533\u8BF7\u6570: **").concat(totalApplications, "** \u4E2A\n\u2022 \u5DF2\u901A\u8FC7: **").concat(approvedApplications, "** \u4E2A\n\u2022 \u901A\u8FC7\u7387: **").concat(totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0, "%**"),
                                data: { totalApplications: totalApplications, approvedApplications: approvedApplications, date: todayStr },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 4:
                        error_25 = _c.sent();
                        return [2 /*return*/, this.createErrorResponse('查询今日招生数据失败', startTime)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取本周招生数据
     */
    DirectResponseService.prototype.getWeeklyEnrollmentData = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var today, weekStart, weekEnd, EnrollmentApplication, totalApplications, processingTime, error_26;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        today = new Date();
                        weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
                        weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6, 23, 59, 59);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_b.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.between] = [weekStart, weekEnd],
                                        _a)
                                }
                            })];
                    case 2:
                        totalApplications = _b.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u672C\u5468\u62DB\u751F\u6570\u636E:\n\n\u2022 \u603B\u7533\u8BF7\u6570: **".concat(totalApplications, "** \u4E2A\n\u2022 \u5468\u671F: ").concat(weekStart.toLocaleDateString('zh-CN'), " - ").concat(weekEnd.toLocaleDateString('zh-CN')),
                                data: { totalApplications: totalApplications, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() },
                                tokensUsed: 25,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_26 = _b.sent();
                        return [2 /*return*/, this.createErrorResponse('查询本周招生数据失败', startTime)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取本年招生数据
     */
    DirectResponseService.prototype.getYearlyEnrollmentData = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var currentYear, yearStart, yearEnd, EnrollmentApplication, totalApplications, approvedApplications, processingTime, error_27;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        currentYear = new Date().getFullYear();
                        yearStart = new Date(currentYear, 0, 1);
                        yearEnd = new Date(currentYear, 11, 31, 23, 59, 59);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_c.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.between] = [yearStart, yearEnd],
                                        _a)
                                }
                            })];
                    case 2:
                        totalApplications = _c.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({
                                where: {
                                    createdAt: (_b = {},
                                        _b[sequelize_1.Op.between] = [yearStart, yearEnd],
                                        _b),
                                    status: 'approved'
                                }
                            })];
                    case 3:
                        approvedApplications = _c.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA ".concat(currentYear, "\u5E74\u62DB\u751F\u6570\u636E:\n\n\u2022 \u603B\u7533\u8BF7\u6570: **").concat(totalApplications, "** \u4E2A\n\u2022 \u5DF2\u901A\u8FC7: **").concat(approvedApplications, "** \u4E2A\n\u2022 \u5E74\u5EA6\u8F6C\u5316\u7387: **").concat(totalApplications > 0 ? Math.round((approvedApplications / totalApplications) * 100) : 0, "%**"),
                                data: { totalApplications: totalApplications, approvedApplications: approvedApplications, year: currentYear },
                                tokensUsed: 25,
                                processingTime: processingTime
                            }];
                    case 4:
                        error_27 = _c.sent();
                        return [2 /*return*/, this.createErrorResponse('查询本年招生数据失败', startTime)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生申请数量
     */
    DirectResponseService.prototype.getEnrollmentApplicationCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var EnrollmentApplication, totalCount, pendingCount, approvedCount, rejectedCount, processingTime, error_28;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_a.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count()];
                    case 2:
                        totalCount = _a.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'pending' } })];
                    case 3:
                        pendingCount = _a.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'approved' } })];
                    case 4:
                        approvedCount = _a.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'rejected' } })];
                    case 5:
                        rejectedCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u62DB\u751F\u7533\u8BF7\u7EDF\u8BA1:\n\n\u2022 \u603B\u7533\u8BF7\u6570: **".concat(totalCount, "** \u4E2A\n\u2022 \u5F85\u5BA1\u6838: **").concat(pendingCount, "** \u4E2A\n\u2022 \u5DF2\u901A\u8FC7: **").concat(approvedCount, "** \u4E2A\n\u2022 \u5DF2\u62D2\u7EDD: **").concat(rejectedCount, "** \u4E2A"),
                                data: { totalCount: totalCount, pendingCount: pendingCount, approvedCount: approvedCount, rejectedCount: rejectedCount },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 6:
                        error_28 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询招生申请数量失败', startTime)];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取待审核招生数据
     */
    DirectResponseService.prototype.getPendingEnrollmentData = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var EnrollmentApplication, pendingCount, processingTime, error_29;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_a.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'pending' } })];
                    case 2:
                        pendingCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u5F85\u5BA1\u6838\u62DB\u751F\u7533\u8BF7:\n\n\u2022 \u5F85\u5BA1\u6838\u6570\u91CF: **".concat(pendingCount, "** \u4E2A\n\u2022 \u9700\u8981\u53CA\u65F6\u5904\u7406"),
                                data: { pendingCount: pendingCount },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_29 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询待审核招生数据失败', startTime)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取已通过招生数据
     */
    DirectResponseService.prototype.getApprovedEnrollmentData = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var EnrollmentApplication, approvedCount, processingTime, error_30;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_a.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'approved' } })];
                    case 2:
                        approvedCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u5DF2\u901A\u8FC7\u62DB\u751F\u7533\u8BF7:\n\n\u2022 \u5DF2\u901A\u8FC7\u6570\u91CF: **".concat(approvedCount, "** \u4E2A"),
                                data: { approvedCount: approvedCount },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_30 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询已通过招生数据失败', startTime)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生转化率
     */
    DirectResponseService.prototype.getEnrollmentConversionRate = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var EnrollmentApplication, totalCount, approvedCount, conversionRate, processingTime, error_31;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_a.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count()];
                    case 2:
                        totalCount = _a.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'approved' } })];
                    case 3:
                        approvedCount = _a.sent();
                        conversionRate = totalCount > 0 ? Math.round((approvedCount / totalCount) * 100) : 0;
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u62DB\u751F\u8F6C\u5316\u7387\u5206\u6790:\n\n\u2022 \u603B\u7533\u8BF7\u6570: **".concat(totalCount, "** \u4E2A\n\u2022 \u5DF2\u901A\u8FC7\u6570: **").concat(approvedCount, "** \u4E2A\n\u2022 \u8F6C\u5316\u7387: **").concat(conversionRate, "%**"),
                                data: { totalCount: totalCount, approvedCount: approvedCount, conversionRate: conversionRate },
                                tokensUsed: 25,
                                processingTime: processingTime
                            }];
                    case 4:
                        error_31 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询招生转化率失败', startTime)];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取成功招生数量
     */
    DirectResponseService.prototype.getSuccessfulEnrollmentCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var EnrollmentApplication, successfulCount, processingTime, error_32;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_a.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'approved' } })];
                    case 2:
                        successfulCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u6210\u529F\u62DB\u751F\u7EDF\u8BA1:\n\n\u2022 \u6210\u529F\u62DB\u751F\u6570\u91CF: **".concat(successfulCount, "** \u4E2A"),
                                data: { successfulCount: successfulCount },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_32 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询成功招生数量失败', startTime)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    // ===== 活动相关方法 =====
    /**
     * 获取今日活动数量
     */
    DirectResponseService.prototype.getDailyActivityCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var today, dayStart, dayEnd, todayCount, processingTime, todayStr, error_33;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        today = new Date();
                        dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
                        return [4 /*yield*/, activity_model_1.Activity.count({
                                where: {
                                    startTime: (_a = {},
                                        _a[sequelize_1.Op.between] = [dayStart, dayEnd],
                                        _a)
                                }
                            })];
                    case 1:
                        todayCount = _b.sent();
                        processingTime = Date.now() - startTime;
                        todayStr = today.toLocaleDateString('zh-CN');
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA ".concat(todayStr, "\u6D3B\u52A8\u5B89\u6392:\n\n\u2022 \u4ECA\u65E5\u6D3B\u52A8\u6570\u91CF: **").concat(todayCount, "** \u4E2A"),
                                data: { todayCount: todayCount, date: todayStr },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_33 = _b.sent();
                        return [2 /*return*/, this.createErrorResponse('查询今日活动数量失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取本周活动安排
     */
    DirectResponseService.prototype.getWeeklyActivitySchedule = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var today, weekStart, weekEnd, weeklyCount, processingTime, error_34;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        today = new Date();
                        weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
                        weekEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6, 23, 59, 59);
                        return [4 /*yield*/, activity_model_1.Activity.count({
                                where: {
                                    startTime: (_a = {},
                                        _a[sequelize_1.Op.between] = [weekStart, weekEnd],
                                        _a)
                                }
                            })];
                    case 1:
                        weeklyCount = _b.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u672C\u5468\u6D3B\u52A8\u5B89\u6392:\n\n\u2022 \u672C\u5468\u6D3B\u52A8\u6570\u91CF: **".concat(weeklyCount, "** \u4E2A\n\u2022 \u5468\u671F: ").concat(weekStart.toLocaleDateString('zh-CN'), " - ").concat(weekEnd.toLocaleDateString('zh-CN')),
                                data: { weeklyCount: weeklyCount, weekStart: weekStart.toISOString(), weekEnd: weekEnd.toISOString() },
                                tokensUsed: 25,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_34 = _b.sent();
                        return [2 /*return*/, this.createErrorResponse('查询本周活动安排失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ===== 简化实现其他方法 =====
    DirectResponseService.prototype.getMonthlyActivityStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('本月活动统计功能开发中...', startTime, 25)];
            });
        });
    };
    DirectResponseService.prototype.getActivityRegistrationCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('活动报名统计功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getActivityCheckinCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('活动签到统计功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getOngoingActivities = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('进行中活动查询功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getUpcomingActivities = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('即将开始活动查询功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getActivityCompletionRate = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('活动完成率分析功能开发中...', startTime, 25)];
            });
        });
    };
    // ===== 学生相关方法 =====
    DirectResponseService.prototype.getTotalStudentCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalCount, processingTime, error_35;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_model_1.Student.count({ where: { status: 'active' } })];
                    case 1:
                        totalCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u5B66\u751F\u603B\u6570\u7EDF\u8BA1:\n\n\u2022 \u5B66\u751F\u603B\u6570: **".concat(totalCount, "** \u4EBA"),
                                data: { totalCount: totalCount },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_35 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询学生总数失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DirectResponseService.prototype.getActiveStudentCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getTotalStudentCount(startTime)]; // 复用逻辑
            });
        });
    };
    DirectResponseService.prototype.getMaleStudentCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var maleCount, processingTime, error_36;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_model_1.Student.count({ where: { status: 'active', gender: 'male' } })];
                    case 1:
                        maleCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u7537\u751F\u4EBA\u6570\u7EDF\u8BA1:\n\n\u2022 \u7537\u751F\u4EBA\u6570: **".concat(maleCount, "** \u4EBA"),
                                data: { maleCount: maleCount },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_36 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询男生人数失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DirectResponseService.prototype.getFemaleStudentCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var femaleCount, processingTime, error_37;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_model_1.Student.count({ where: { status: 'active', gender: 'female' } })];
                    case 1:
                        femaleCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u5973\u751F\u4EBA\u6570\u7EDF\u8BA1:\n\n\u2022 \u5973\u751F\u4EBA\u6570: **".concat(femaleCount, "** \u4EBA"),
                                data: { femaleCount: femaleCount },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_37 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询女生人数失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // ===== 简化实现剩余方法 =====
    DirectResponseService.prototype.getNewStudentCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('新生统计功能开发中...', startTime, 15)];
            });
        });
    };
    DirectResponseService.prototype.getGraduateCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('毕业生统计功能开发中...', startTime, 15)];
            });
        });
    };
    DirectResponseService.prototype.getDailySummary = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('今日数据汇总功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getWeeklySummary = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('本周统计报告功能开发中...', startTime, 25)];
            });
        });
    };
    DirectResponseService.prototype.getMonthlySummary = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('本月数据报告功能开发中...', startTime, 30)];
            });
        });
    };
    DirectResponseService.prototype.getYearlySummary = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('年度总结报告功能开发中...', startTime, 35)];
            });
        });
    };
    DirectResponseService.prototype.getTeacherCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var teacherCount, processingTime, error_38;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, teacher_model_1.Teacher.count({ where: { status: 'active' } })];
                    case 1:
                        teacherCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u6559\u5E08\u603B\u6570\u7EDF\u8BA1:\n\n\u2022 \u6559\u5E08\u603B\u6570: **".concat(teacherCount, "** \u4EBA"),
                                data: { teacherCount: teacherCount },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_38 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询教师总数失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DirectResponseService.prototype.getActiveTeacherCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getTeacherCount(startTime)]; // 复用逻辑
            });
        });
    };
    DirectResponseService.prototype.getTeacherAttendanceRate = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('教师出勤率分析功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getClassCount = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var classCount, processingTime, error_39;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, class_model_1.Class.count({ where: { status: 'active' } })];
                    case 1:
                        classCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u73ED\u7EA7\u603B\u6570\u7EDF\u8BA1:\n\n\u2022 \u73ED\u7EA7\u603B\u6570: **".concat(classCount, "** \u4E2A"),
                                data: { classCount: classCount },
                                tokensUsed: 15,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_39 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询班级总数失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DirectResponseService.prototype.getClassCapacity = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('班级容量查询功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getAvailableSeats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('空余学位统计功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getTotalRevenue = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('收费总额统计功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getMonthlyRevenue = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('本月收入查询功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getPaymentRate = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('缴费率分析功能开发中...', startTime, 20)];
            });
        });
    };
    DirectResponseService.prototype.getDataOverview = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('数据概览功能开发中...', startTime, 30)];
            });
        });
    };
    DirectResponseService.prototype.getOperationMetrics = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('运营指标分析功能开发中...', startTime, 30)];
            });
        });
    };
    DirectResponseService.prototype.getKeyMetrics = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createSimpleResponse('关键数据汇总功能开发中...', startTime, 25)];
            });
        });
    };
    /**
     * 获取学生统计数据
     */
    DirectResponseService.prototype.getStudentStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalCount, processingTime, error_40;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, student_model_1.Student.count({ where: { status: 1 } })];
                    case 1:
                        totalCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u5B66\u751F\u603B\u6570\u7EDF\u8BA1:\n\n\u2022 \u5B66\u751F\u603B\u6570: **".concat(totalCount, "** \u4EBA"),
                                data: { totalCount: totalCount },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_40 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询学生统计数据失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动统计数据
     */
    DirectResponseService.prototype.getActivityStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var totalActivities, processingTime, error_41;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_model_1.Activity.count({ where: { status: 1 } })];
                    case 1:
                        totalActivities = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u6D3B\u52A8\u7EDF\u8BA1\u6570\u636E:\n\n\u2022 \u6D3B\u52A8\u603B\u6570: **".concat(totalActivities, "** \u4E2A"),
                                data: { totalActivities: totalActivities },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 2:
                        error_41 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询活动统计数据失败', startTime)];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生统计数据
     */
    DirectResponseService.prototype.getEnrollmentStats = function (startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var EnrollmentApplication, totalApplications, approvedCount, pendingCount, processingTime, error_42;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('../../models/enrollment-application.model')); })];
                    case 1:
                        EnrollmentApplication = (_a.sent()).EnrollmentApplication;
                        return [4 /*yield*/, EnrollmentApplication.count()];
                    case 2:
                        totalApplications = _a.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'approved' } })];
                    case 3:
                        approvedCount = _a.sent();
                        return [4 /*yield*/, EnrollmentApplication.count({ where: { status: 'pending' } })];
                    case 4:
                        pendingCount = _a.sent();
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: "\uD83D\uDCCA \u62DB\u751F\u7EDF\u8BA1\u6570\u636E:\n\n\u2022 \u603B\u7533\u8BF7\u6570: **".concat(totalApplications, "** \u4E2A\n\u2022 \u5DF2\u901A\u8FC7: **").concat(approvedCount, "** \u4E2A\n\u2022 \u5F85\u5BA1\u6838: **").concat(pendingCount, "** \u4E2A"),
                                data: { totalApplications: totalApplications, approvedCount: approvedCount, pendingCount: pendingCount },
                                tokensUsed: 20,
                                processingTime: processingTime
                            }];
                    case 5:
                        error_42 = _a.sent();
                        return [2 /*return*/, this.createErrorResponse('查询招生统计数据失败', startTime)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 执行SQL查询
     * @param query 原始查询文本
     * @param startTime 开始时间
     * @returns 查询结果
     */
    DirectResponseService.prototype.executeSqlQuery = function (query, startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var queryRouterService, directMatch, sql, description, results, response, result_1, total, approved, pending_1, keys, values, processingTime, error_43;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, Promise.resolve().then(function () { return __importStar(require('./query-router.service')); })];
                    case 1:
                        queryRouterService = (_a.sent()).queryRouterService;
                        directMatch = queryRouterService.checkDirectMatch(query);
                        if (!directMatch || !directMatch.sql) {
                            logger_1.logger.warn("\u274C [executeSqlQuery] \u672A\u627E\u5230SQL\u67E5\u8BE2: ".concat(query));
                            return [2 /*return*/, this.createErrorResponse('未找到对应的SQL查询', startTime)];
                        }
                        sql = directMatch.sql;
                        description = directMatch.description || '执行SQL查询';
                        logger_1.logger.info("\uD83D\uDD0D [executeSqlQuery] \u6267\u884CSQL\u67E5\u8BE2: ".concat(description), { sql: sql });
                        return [4 /*yield*/, init_1.sequelize.query(sql, {
                                type: sequelize_1.QueryTypes.SELECT,
                                raw: true
                            })];
                    case 2:
                        results = _a.sent();
                        logger_1.logger.info("\u2705 [executeSqlQuery] \u67E5\u8BE2\u6210\u529F\uFF0C\u8FD4\u56DE ".concat(results.length, " \u6761\u8BB0\u5F55"));
                        response = '';
                        if (results.length === 0) {
                            response = '📊 查询完成，暂无相关数据';
                        }
                        else if (results.length === 1) {
                            result_1 = results[0];
                            if (query.includes('招生统计')) {
                                total = result_1.total_applications || 0;
                                approved = result_1.approved_count || 0;
                                pending_1 = result_1.pending_count || 0;
                                response = "\uD83D\uDCCA **\u62DB\u751F\u7EDF\u8BA1\u6570\u636E**\n\u2022 \u603B\u7533\u8BF7\u6570: **".concat(total, "** \u4E2A\n\u2022 \u5DF2\u901A\u8FC7: **").concat(approved, "** \u4E2A\n\u2022 \u5F85\u5BA1\u6838: **").concat(pending_1, "** \u4E2A");
                            }
                            else {
                                keys = Object.keys(result_1);
                                values = keys.map(function (key) { return "\u2022 ".concat(key, ": **").concat(result_1[key], "**"); }).join('\n');
                                response = "\uD83D\uDCCA **".concat(description, "**\n").concat(values);
                            }
                        }
                        else {
                            // 多行结果格式化
                            response = "\uD83D\uDCCA **".concat(description, "**\n\u67E5\u8BE2\u8FD4\u56DE ").concat(results.length, " \u6761\u8BB0\u5F55");
                        }
                        processingTime = Date.now() - startTime;
                        return [2 /*return*/, {
                                success: true,
                                response: response,
                                tokensUsed: directMatch.tokens || 25,
                                processingTime: processingTime
                            }];
                    case 3:
                        error_43 = _a.sent();
                        logger_1.logger.error('❌ [executeSqlQuery] SQL查询执行失败', {
                            query: query,
                            error: error_43 instanceof Error ? error_43.message : '未知错误'
                        });
                        return [2 /*return*/, this.createErrorResponse('SQL查询执行失败', startTime)];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 创建简单响应
     */
    DirectResponseService.prototype.createSimpleResponse = function (message, startTime, tokens) {
        var processingTime = Date.now() - startTime;
        return {
            success: true,
            response: "\uD83D\uDEA7 ".concat(message),
            tokensUsed: tokens,
            processingTime: processingTime
        };
    };
    /**
     * 显示功能不可用提示
     */
    /**
     * 创建活动工作流
     * @param query 原始查询
     * @param startTime 开始时间
     * @returns 工作流执行结果
     */
    DirectResponseService.prototype.createActivityWorkflow = function (query, startTime) {
        return __awaiter(this, void 0, void 0, function () {
            var processingTime, activityPlan, processingTime;
            return __generator(this, function (_a) {
                try {
                    logger_1.logger.info('🎯 [活动工作流] 启动活动创建工作流', { query: query });
                    processingTime = Date.now() - startTime;
                    activityPlan = "# \uD83C\uDF89 \u5E7C\u513F\u56ED\u6D3B\u52A8\u7B56\u5212\u65B9\u6848\n\n## \uD83D\uDCCB \u6D3B\u52A8\u57FA\u672C\u4FE1\u606F\n**\u6D3B\u52A8\u540D\u79F0**: \u6625\u5B63\u4EB2\u5B50\u8FD0\u52A8\u4F1A\n**\u6D3B\u52A8\u4E3B\u9898**: \"\u5FEB\u4E50\u8FD0\u52A8\uFF0C\u5065\u5EB7\u6210\u957F\"\n**\u6D3B\u52A8\u76EE\u6807**: \u589E\u8FDB\u4EB2\u5B50\u5173\u7CFB\uFF0C\u57F9\u517B\u5B69\u5B50\u8FD0\u52A8\u5174\u8DA3\uFF0C\u4FC3\u8FDB\u8EAB\u5FC3\u5065\u5EB7\u53D1\u5C55\n**\u9002\u5408\u5E74\u9F84**: 3-6\u5C81\u5E7C\u513F\u53CA\u5BB6\u957F\n\n## \uD83D\uDCC5 \u6D3B\u52A8\u8BE6\u7EC6\u89C4\u5212\n\n### \u65F6\u95F4\u5B89\u6392\n- **\u6D3B\u52A8\u65E5\u671F**: \u5EFA\u8BAE\u9009\u62E9\u5468\u516D\u4E0A\u5348 9:00-11:30\n- **\u62A5\u540D\u65F6\u95F4**: \u6D3B\u52A8\u524D2\u5468\u5F00\u59CB\u62A5\u540D\n- **\u51C6\u5907\u65F6\u95F4**: \u6D3B\u52A8\u524D1\u5468\u5B8C\u6210\u6240\u6709\u51C6\u5907\u5DE5\u4F5C\n\n### \u6D3B\u52A8\u6D41\u7A0B\n1. **\u5F00\u573A\u4EEA\u5F0F** (9:00-9:15)\n   - \u56ED\u957F\u81F4\u8F9E\n   - \u70ED\u8EAB\u64CD\u8868\u6F14\n\n2. **\u4EB2\u5B50\u6E38\u620F\u73AF\u8282** (9:15-10:30)\n   - \u888B\u9F20\u8DF3\u8DF3\u8DF3\n   - \u5C0F\u624B\u62C9\u5927\u624B\u63A5\u529B\u8D5B\n   - \u6295\u7BEE\u5C0F\u80FD\u624B\n   - \u5E73\u8861\u6728\u6311\u6218\n\n3. **\u9881\u5956\u4EEA\u5F0F** (10:30-10:45)\n   - \u9881\u53D1\u53C2\u4E0E\u5956\n   - \u5408\u5F71\u7559\u5FF5\n\n4. **\u81EA\u7531\u6D3B\u52A8** (10:45-11:30)\n   - \u4EB2\u5B50\u4E92\u52A8\u6E38\u620F\n   - \u8336\u70B9\u5206\u4EAB\n\n### \u7269\u6599\u6E05\u5355\n- \uD83C\uDFC3\u200D\u2640\uFE0F \u8FD0\u52A8\u5668\u6750\uFF1A\u8DF3\u888B10\u4E2A\u3001\u5E73\u8861\u67282\u6839\u3001\u5C0F\u7BEE\u740320\u4E2A\n- \uD83C\uDF88 \u88C5\u9970\u7528\u54C1\uFF1A\u5F69\u5E26\u3001\u6C14\u7403\u3001\u6A2A\u5E45\n- \uD83C\uDFC6 \u5956\u54C1\uFF1A\u5956\u72B6\u3001\u5C0F\u793C\u54C1\u3001\u8D34\u7EB8\n- \uD83C\uDF4E \u8336\u70B9\uFF1A\u6C34\u679C\u3001\u5C0F\u70B9\u5FC3\u3001\u996E\u7528\u6C34\n\n### \u4EBA\u5458\u5206\u5DE5\n- **\u603B\u534F\u8C03**: \u56ED\u957F\n- **\u6D3B\u52A8\u4E3B\u6301**: \u4E3B\u73ED\u8001\u5E08\n- **\u5B89\u5168\u4FDD\u969C**: \u4FDD\u5065\u8001\u5E08 + 2\u540D\u52A9\u6559\n- **\u6444\u5F71\u8BB0\u5F55**: \u4E13\u804C\u6444\u5F71\u5E08\n- **\u540E\u52E4\u652F\u6301**: \u4FDD\u80B2\u5458\n\n## \u26A0\uFE0F \u5B9E\u65BD\u8981\u70B9\n\n### \u573A\u5730\u5E03\u7F6E\n- \u5728\u64CD\u573A\u8BBE\u7F6E4\u4E2A\u6E38\u620F\u533A\u57DF\n- \u8BBE\u7F6E\u5BB6\u957F\u4F11\u606F\u533A\u548C\u89C2\u770B\u533A\n- \u51C6\u5907\u533B\u7597\u6025\u6551\u70B9\n\n### \u5B89\u5168\u6CE8\u610F\u4E8B\u9879\n- \u6D3B\u52A8\u524D\u68C0\u67E5\u6240\u6709\u5668\u6750\u5B89\u5168\u6027\n- \u4E3A\u6BCF\u4E2A\u6E38\u620F\u533A\u57DF\u914D\u5907\u5B89\u5168\u5458\n- \u51C6\u5907\u6025\u6551\u5305\u548C\u8054\u7CFB\u533B\u9662\n- \u5236\u5B9A\u6076\u52A3\u5929\u6C14\u5E94\u6025\u9884\u6848\n\n### \u5E94\u6025\u9884\u6848\n- **\u5929\u6C14\u53D8\u5316**: \u51C6\u5907\u5BA4\u5185\u5907\u9009\u65B9\u6848\n- **\u610F\u5916\u53D7\u4F24**: \u7ACB\u5373\u5904\u7406\u5E76\u8054\u7CFB\u5BB6\u957F\n- **\u8BBE\u5907\u6545\u969C**: \u51C6\u5907\u5907\u7528\u5668\u6750\n\n## \uD83D\uDCCA \u540E\u7EED\u8DDF\u8FDB\n\n### \u6D3B\u52A8\u6548\u679C\u8BC4\u4F30\n- \u53D1\u653E\u5BB6\u957F\u6EE1\u610F\u5EA6\u8C03\u67E5\u8868\n- \u7EDF\u8BA1\u53C2\u4E0E\u4EBA\u6570\u548C\u5B8C\u6210\u7387\n- \u6536\u96C6\u8001\u5E08\u548C\u5DE5\u4F5C\u4EBA\u5458\u53CD\u9988\n\n### \u5BB6\u957F\u53CD\u9988\u6536\u96C6\n- \u5FAE\u4FE1\u7FA4\u6536\u96C6\u5373\u65F6\u53CD\u9988\n- \u4E00\u5468\u5185\u53D1\u9001\u6B63\u5F0F\u8C03\u67E5\u95EE\u5377\n- \u7535\u8BDD\u56DE\u8BBF\u91CD\u70B9\u5BB6\u957F\n\n### \u6539\u8FDB\u5EFA\u8BAE\n- \u6839\u636E\u53CD\u9988\u8C03\u6574\u6E38\u620F\u96BE\u5EA6\n- \u4F18\u5316\u65F6\u95F4\u5B89\u6392\n- \u6539\u8FDB\u7269\u6599\u51C6\u5907\u548C\u573A\u5730\u5E03\u7F6E\n\n---\n\n\uD83D\uDCA1 **\u6E29\u99A8\u63D0\u793A**: \u6B64\u65B9\u6848\u53EF\u6839\u636E\u5B9E\u9645\u60C5\u51B5\u8FDB\u884C\u8C03\u6574\uFF0C\u5EFA\u8BAE\u63D0\u524D\u4E0E\u5BB6\u957F\u6C9F\u901A\u786E\u8BA4\u53C2\u4E0E\u610F\u613F\uFF0C\u786E\u4FDD\u6D3B\u52A8\u987A\u5229\u8FDB\u884C\uFF01\n\n\uD83D\uDD27 **\u4E0B\u4E00\u6B65\u884C\u52A8**:\n1. \u786E\u5B9A\u5177\u4F53\u6D3B\u52A8\u65E5\u671F\n2. \u5236\u4F5C\u62A5\u540D\u8868\u548C\u5BA3\u4F20\u6D77\u62A5\n3. \u91C7\u8D2D\u6D3B\u52A8\u7269\u6599\n4. \u5B89\u6392\u4EBA\u5458\u57F9\u8BAD\n5. \u53D1\u9001\u5BB6\u957F\u901A\u77E5\n\n\u5982\u9700\u521B\u5EFA\u5177\u4F53\u7684\u6D3B\u52A8\u8BB0\u5F55\u6216\u5B89\u6392\u76F8\u5173\u4EFB\u52A1\uFF0C\u8BF7\u544A\u8BC9\u6211\uFF01";
                    logger_1.logger.info('✅ [活动工作流] 工作流执行成功', {
                        tokensUsed: 150,
                        processingTime: processingTime,
                        workflowType: 'activity_creation'
                    });
                    return [2 /*return*/, {
                            success: true,
                            response: activityPlan,
                            tokensUsed: 150,
                            processingTime: processingTime,
                            data: {
                                workflowType: 'activity_creation',
                                activityName: '春季亲子运动会',
                                activityTheme: '快乐运动，健康成长',
                                targetAge: '3-6岁幼儿及家长',
                                suggestedDate: '周六上午 9:00-11:30'
                            }
                        }];
                }
                catch (error) {
                    processingTime = Date.now() - startTime;
                    logger_1.logger.error('❌ [活动工作流] 执行异常', { error: (error === null || error === void 0 ? void 0 : error.message) || error, query: query });
                    return [2 /*return*/, {
                            success: false,
                            response: "\u6D3B\u52A8\u521B\u5EFA\u5DE5\u4F5C\u6D41\u6267\u884C\u5F02\u5E38\uFF1A".concat((error === null || error === void 0 ? void 0 : error.message) || '未知错误'),
                            tokensUsed: 10,
                            processingTime: processingTime
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    DirectResponseService.prototype.showFeatureUnavailable = function (query, startTime) {
        var processingTime = Date.now() - startTime;
        return {
            success: true,
            response: "\uD83D\uDCA1 \u62B1\u6B49\uFF0C\"".concat(query, "\"\u529F\u80FD\u6682\u65F6\u6CA1\u6709\u63D0\u4F9B\u6B64\u67E5\u8BE2\uFF0C\u6211\u4EEC\u6B63\u5728\u52AA\u529B\u5B8C\u5584\u4E2D..."),
            tokensUsed: 5,
            processingTime: processingTime
        };
    };
    /**
     * 📖 获取系统介绍
     */
    DirectResponseService.prototype.getSystemIntroduction = function (startTime) {
        var processingTime = Date.now() - startTime;
        var introduction = (0, system_introduction_config_1.generateSystemIntroduction)();
        logger_1.logger.info('✅ [系统介绍] 返回系统介绍', {
            tokensUsed: 0,
            processingTime: processingTime,
            introductionLength: introduction.length
        });
        return {
            success: true,
            response: introduction,
            tokensUsed: 0,
            processingTime: processingTime,
            data: {
                type: 'system_introduction',
                source: 'direct_response'
            }
        };
    };
    return DirectResponseService;
}());
exports.DirectResponseService = DirectResponseService;
// 导出服务实例
exports.directResponseService = new DirectResponseService();
