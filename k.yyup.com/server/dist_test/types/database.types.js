"use strict";
/**
 * 数据库实体类型定义
 * 根据数据库关系映射定义精确的TypeScript类型
 * 避免在代码中使用any类型
 */
exports.__esModule = true;
exports.NotificationStatus = exports.NotificationMethod = exports.AdmissionType = exports.AdmissionStatus = exports.MaterialType = exports.ApplicationStatus = void 0;
// 枚举类型定义
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["SUBMITTED"] = "submitted";
    ApplicationStatus["UNDER_REVIEW"] = "under_review";
    ApplicationStatus["APPROVED"] = "approved";
    ApplicationStatus["REJECTED"] = "rejected";
    ApplicationStatus["WAIT_LISTED"] = "wait_listed";
})(ApplicationStatus = exports.ApplicationStatus || (exports.ApplicationStatus = {}));
var MaterialType;
(function (MaterialType) {
    MaterialType["ID_CARD"] = "id_card";
    MaterialType["BIRTH_CERTIFICATE"] = "birth_certificate";
    MaterialType["HEALTH_RECORD"] = "health_record";
    MaterialType["VACCINATION"] = "vaccination";
    MaterialType["PHOTO"] = "photo";
    MaterialType["OTHER"] = "other";
})(MaterialType = exports.MaterialType || (exports.MaterialType = {}));
var AdmissionStatus;
(function (AdmissionStatus) {
    AdmissionStatus["PENDING"] = "pending";
    AdmissionStatus["ACCEPTED"] = "accepted";
    AdmissionStatus["REJECTED"] = "rejected";
    AdmissionStatus["WAIT_LISTED"] = "wait_listed";
})(AdmissionStatus = exports.AdmissionStatus || (exports.AdmissionStatus = {}));
var AdmissionType;
(function (AdmissionType) {
    AdmissionType["NORMAL"] = "normal";
    AdmissionType["PRIORITY"] = "priority";
    AdmissionType["SPECIAL"] = "special";
})(AdmissionType = exports.AdmissionType || (exports.AdmissionType = {}));
var NotificationMethod;
(function (NotificationMethod) {
    NotificationMethod["EMAIL"] = "email";
    NotificationMethod["SMS"] = "sms";
    NotificationMethod["APP"] = "app";
    NotificationMethod["WECHAT"] = "wechat";
})(NotificationMethod = exports.NotificationMethod || (exports.NotificationMethod = {}));
var NotificationStatus;
(function (NotificationStatus) {
    NotificationStatus["PENDING"] = "pending";
    NotificationStatus["SENT"] = "sent";
    NotificationStatus["DELIVERED"] = "delivered";
    NotificationStatus["READ"] = "read";
    NotificationStatus["FAILED"] = "failed";
})(NotificationStatus = exports.NotificationStatus || (exports.NotificationStatus = {}));
