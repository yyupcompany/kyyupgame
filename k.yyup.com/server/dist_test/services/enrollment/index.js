"use strict";
/**
 * 招生管理服务索引文件
 */
exports.__esModule = true;
exports.AdmissionNotificationService = exports.AdmissionResultService = exports.EnrollmentApplicationService = exports.EnrollmentConsultationFollowupService = exports.EnrollmentConsultationService = exports.EnrollmentQuotaService = exports.EnrollmentPlanService = void 0;
var enrollment_plan_service_1 = require("./enrollment-plan.service");
exports.EnrollmentPlanService = enrollment_plan_service_1.EnrollmentPlanService;
var enrollment_quota_service_1 = require("./enrollment-quota.service");
exports.EnrollmentQuotaService = enrollment_quota_service_1.EnrollmentQuotaService;
var enrollment_consultation_service_1 = require("./enrollment-consultation.service");
exports.EnrollmentConsultationService = enrollment_consultation_service_1.EnrollmentConsultationService;
var enrollment_consultation_followup_service_1 = require("./enrollment-consultation-followup.service");
exports.EnrollmentConsultationFollowupService = enrollment_consultation_followup_service_1.EnrollmentConsultationFollowupService;
var enrollment_application_service_1 = require("./enrollment-application.service");
exports.EnrollmentApplicationService = enrollment_application_service_1.EnrollmentApplicationService;
var admission_result_service_1 = require("./admission-result.service");
exports.AdmissionResultService = admission_result_service_1.AdmissionResultService;
var admission_notification_service_1 = require("./admission-notification.service");
exports.AdmissionNotificationService = admission_notification_service_1.AdmissionNotificationService;
