"use strict";
/**
 * AI专家咨询服务接口定义
 */
exports.__esModule = true;
exports.ConsultationStatus = exports.QueryType = exports.ExpertType = void 0;
// 专家类型枚举
var ExpertType;
(function (ExpertType) {
    ExpertType["INVESTOR"] = "investor";
    ExpertType["DIRECTOR"] = "director";
    ExpertType["PLANNER"] = "planner";
    ExpertType["TEACHER"] = "teacher";
    ExpertType["PARENT"] = "parent";
    ExpertType["PSYCHOLOGIST"] = "psychologist";
})(ExpertType = exports.ExpertType || (exports.ExpertType = {}));
// 问题类型枚举
var QueryType;
(function (QueryType) {
    QueryType["RECRUITMENT_ACTIVITY"] = "recruitment_activity";
    QueryType["PARENT_CONVERSION"] = "parent_conversion";
    QueryType["GENERAL"] = "general";
})(QueryType = exports.QueryType || (exports.QueryType = {}));
// 咨询会话状态
var ConsultationStatus;
(function (ConsultationStatus) {
    ConsultationStatus["PENDING"] = "pending";
    ConsultationStatus["IN_PROGRESS"] = "in_progress";
    ConsultationStatus["COMPLETED"] = "completed";
    ConsultationStatus["FAILED"] = "failed";
})(ConsultationStatus = exports.ConsultationStatus || (exports.ConsultationStatus = {}));
