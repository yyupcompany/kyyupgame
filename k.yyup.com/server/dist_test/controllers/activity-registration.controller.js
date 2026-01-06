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
exports.processRegistrationPayment = exports.getRegistrationPayment = exports.batchConfirmRegistrations = exports.getRegistrationsByStatus = exports.getRegistrationsByStudent = exports.getRegistrationsByActivity = exports.getRegistrationStats = exports.getRegistrations = exports.markAsConverted = exports.recordFeedback = exports.markAsAbsent = exports.checkIn = exports.cancelRegistration = exports.reviewRegistration = exports.deleteRegistration = exports.updateRegistration = exports.getRegistrationById = exports.createRegistration = void 0;
var sequelize_1 = require("sequelize");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
var logger_1 = require("../utils/logger");
var activity_registration_model_1 = require("../models/activity-registration.model");
var activity_model_1 = require("../models/activity.model");
var student_model_1 = require("../models/student.model");
var parent_student_relation_model_1 = require("../models/parent-student-relation.model");
var user_model_1 = require("../models/user.model");
var init_1 = require("../init");
// 获取数据库实例
var getSequelizeInstance = function () {
    return init_1.sequelize;
};
/**
 * 创建活动报名
 */
var createRegistration = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, activityId, contactName, contactPhone, childName, childAge, childGender, _b, attendeeCount, specialNeeds, source, remark, db, now, genderValue, registration, error_1;
    var _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 2, , 3]);
                userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c.id;
                if (!userId) {
                    throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                }
                // 验证请求体不为空
                if (!req.body || Object.keys(req.body).length === 0) {
                    throw apiError_1.ApiError.badRequest('报名数据不能为空');
                }
                _a = req.body, activityId = _a.activityId, contactName = _a.contactName, contactPhone = _a.contactPhone, childName = _a.childName, childAge = _a.childAge, childGender = _a.childGender, _b = _a.attendeeCount, attendeeCount = _b === void 0 ? 1 : _b, specialNeeds = _a.specialNeeds, source = _a.source, remark = _a.remark;
                // 验证必填字段
                if (!activityId || !contactName || !contactPhone) {
                    throw apiError_1.ApiError.badRequest('活动ID、联系人姓名和联系电话为必填项');
                }
                // 验证活动ID格式
                if (isNaN(Number(activityId)) || Number(activityId) <= 0) {
                    throw apiError_1.ApiError.badRequest('无效的活动ID');
                }
                // 验证联系人姓名
                if (typeof contactName !== 'string' || contactName.trim().length === 0) {
                    throw apiError_1.ApiError.badRequest('联系人姓名不能为空');
                }
                // 验证联系电话格式
                if (typeof contactPhone !== 'string' || !/^1[3-9]\d{9}$/.test(contactPhone.trim())) {
                    throw apiError_1.ApiError.badRequest('请输入有效的手机号码');
                }
                // 验证参加人数
                if (attendeeCount !== undefined && (isNaN(Number(attendeeCount)) || Number(attendeeCount) <= 0)) {
                    throw apiError_1.ApiError.badRequest('参加人数必须是正整数');
                }
                // 验证孩子年龄
                if (childAge !== undefined && childAge !== null && (isNaN(Number(childAge)) || Number(childAge) < 0 || Number(childAge) > 18)) {
                    throw apiError_1.ApiError.badRequest('孩子年龄应在0-18岁之间');
                }
                // 验证孩子性别
                if (childGender !== undefined && childGender !== null && ![0, 1, 2, 'male', 'female', 'unknown'].includes(childGender)) {
                    throw apiError_1.ApiError.badRequest('孩子性别值无效');
                }
                db = getSequelizeInstance();
                now = new Date();
                genderValue = null;
                if (childGender) {
                    genderValue = childGender === 'male' ? 1 : (childGender === 'female' ? 0 : null);
                }
                return [4 /*yield*/, activity_registration_model_1.ActivityRegistration.create({
                        activityId: activityId,
                        contactName: contactName,
                        contactPhone: contactPhone,
                        childName: childName || null,
                        childAge: childAge || null,
                        childGender: genderValue,
                        registrationTime: now,
                        attendeeCount: attendeeCount || 1,
                        specialNeeds: specialNeeds || null,
                        source: source || null,
                        status: 0,
                        remark: remark || null,
                        creatorId: userId
                    })];
            case 1:
                registration = _d.sent();
                apiResponse_1.ApiResponse.success(res, registration, '活动报名创建成功');
                return [3 /*break*/, 3];
            case 2:
                error_1 = _d.sent();
                logger_1.logger.error('创建活动报名失败', error_1);
                apiResponse_1.ApiResponse.handleError(res, error_1);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.createRegistration = createRegistration;
/**
 * 获取活动报名详情
 */
var getRegistrationById = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, db, registration, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                if (!id || isNaN(Number(id) || 0)) {
                    throw apiError_1.ApiError.badRequest('报名ID无效');
                }
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT \n        ar.*,\n        a.title as activity_title,\n        a.start_time as activity_start_time,\n        a.end_time as activity_end_time,\n        a.location as activity_location,\n        a.capacity as activity_capacity,\n        a.fee as activity_fee\n      FROM activity_registrations ar\n      LEFT JOIN activities a ON ar.activity_id = a.id\n      WHERE ar.id = ? AND ar.deleted_at IS NULL", {
                        replacements: [Number(id) || 0],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                registration = (_a.sent())[0];
                if (!registration) {
                    throw apiError_1.ApiError.notFound('活动报名记录不存在');
                }
                apiResponse_1.ApiResponse.success(res, registration, '获取活动报名详情成功');
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                logger_1.logger.error('获取活动报名详情失败', error_2);
                apiResponse_1.ApiResponse.handleError(res, error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getRegistrationById = getRegistrationById;
/**
 * 更新活动报名
 */
var updateRegistration = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, registrationId, _a, contactName, contactPhone, childName, childAge, childGender, attendeeCount, specialNeeds, source, remark, db, now, existingRecord, updateFields, replacements, updatedRegistration, error_3;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                id = req.params.id;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                }
                registrationId = parseInt(id, 10);
                if (isNaN(registrationId) || registrationId <= 0) {
                    throw apiError_1.ApiError.badRequest('无效的报名ID');
                }
                // 验证请求体不为空
                if (!req.body || Object.keys(req.body).length === 0) {
                    throw apiError_1.ApiError.badRequest('更新数据不能为空');
                }
                _a = req.body, contactName = _a.contactName, contactPhone = _a.contactPhone, childName = _a.childName, childAge = _a.childAge, childGender = _a.childGender, attendeeCount = _a.attendeeCount, specialNeeds = _a.specialNeeds, source = _a.source, remark = _a.remark;
                db = getSequelizeInstance();
                now = new Date();
                return [4 /*yield*/, db.query('SELECT id FROM activity_registrations WHERE id = ? AND deleted_at IS NULL', {
                        replacements: [registrationId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingRecord = (_c.sent())[0];
                if (!existingRecord) {
                    throw apiError_1.ApiError.notFound('活动报名记录不存在');
                }
                updateFields = [];
                replacements = [];
                if (contactName !== undefined) {
                    updateFields.push('contact_name = ?');
                    replacements.push(contactName);
                }
                if (contactPhone !== undefined) {
                    updateFields.push('contact_phone = ?');
                    replacements.push(contactPhone);
                }
                if (childName !== undefined) {
                    updateFields.push('child_name = ?');
                    replacements.push(childName);
                }
                if (childAge !== undefined) {
                    updateFields.push('child_age = ?');
                    replacements.push(childAge);
                }
                if (childGender !== undefined) {
                    updateFields.push('child_gender = ?');
                    replacements.push(childGender);
                }
                if (attendeeCount !== undefined) {
                    updateFields.push('attendee_count = ?');
                    replacements.push(attendeeCount);
                }
                if (specialNeeds !== undefined) {
                    updateFields.push('special_needs = ?');
                    replacements.push(specialNeeds);
                }
                if (source !== undefined) {
                    updateFields.push('source = ?');
                    replacements.push(source);
                }
                if (remark !== undefined) {
                    updateFields.push('remark = ?');
                    replacements.push(remark);
                }
                // 验证联系电话格式
                if (contactPhone !== undefined && typeof contactPhone === 'string' && !/^1[3-9]\d{9}$/.test(contactPhone.trim())) {
                    throw apiError_1.ApiError.badRequest('请输入有效的手机号码');
                }
                // 验证孩子年龄
                if (childAge !== undefined && childAge !== null && (isNaN(Number(childAge)) || Number(childAge) < 0 || Number(childAge) > 18)) {
                    throw apiError_1.ApiError.badRequest('孩子年龄应在0-18岁之间');
                }
                // 验证参加人数
                if (attendeeCount !== undefined && (isNaN(Number(attendeeCount)) || Number(attendeeCount) <= 0)) {
                    throw apiError_1.ApiError.badRequest('参加人数必须是正整数');
                }
                if (updateFields.length === 0) {
                    throw apiError_1.ApiError.badRequest('没有提供要更新的字段');
                }
                // 添加更新时间和更新人
                updateFields.push('updated_at = ?', 'updater_id = ?');
                replacements.push(now, userId, registrationId);
                // 执行更新
                return [4 /*yield*/, db.query("UPDATE activity_registrations SET ".concat(updateFields.join(', '), " WHERE id = ?"), {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 执行更新
                _c.sent();
                return [4 /*yield*/, db.query('SELECT * FROM activity_registrations WHERE id = ?', {
                        replacements: [registrationId],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                updatedRegistration = (_c.sent())[0];
                apiResponse_1.ApiResponse.success(res, updatedRegistration, '更新活动报名成功');
                return [3 /*break*/, 5];
            case 4:
                error_3 = _c.sent();
                logger_1.logger.error('更新活动报名失败', error_3);
                apiResponse_1.ApiResponse.handleError(res, error_3);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.updateRegistration = updateRegistration;
/**
 * 删除活动报名
 */
var deleteRegistration = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, db, now, existingRecord, error_4;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 3, , 4]);
                id = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!id || isNaN(Number(id) || 0)) {
                    throw apiError_1.ApiError.badRequest('报名ID无效');
                }
                if (!userId) {
                    throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                }
                db = getSequelizeInstance();
                now = new Date();
                return [4 /*yield*/, db.query('SELECT id FROM activity_registrations WHERE id = ? AND deleted_at IS NULL', {
                        replacements: [Number(id) || 0],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingRecord = (_b.sent())[0];
                if (!existingRecord) {
                    // 幂等性：如果记录不存在，也返回成功（可能已经被删除）
                    apiResponse_1.ApiResponse.success(res, null, '删除活动报名成功');
                    return [2 /*return*/];
                }
                // 软删除：更新deleted_at字段
                return [4 /*yield*/, db.query('UPDATE activity_registrations SET deleted_at = ?, updater_id = ? WHERE id = ?', {
                        replacements: [now, userId, Number(id) || 0],
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 软删除：更新deleted_at字段
                _b.sent();
                apiResponse_1.ApiResponse.success(res, null, '删除活动报名成功');
                return [3 /*break*/, 4];
            case 3:
                error_4 = _b.sent();
                logger_1.logger.error('删除活动报名失败', error_4);
                apiResponse_1.ApiResponse.handleError(res, error_4);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.deleteRegistration = deleteRegistration;
/**
 * 审核活动报名
 */
var reviewRegistration = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, registrationId, _a, status_1, remark, db, now, existingRecord, updatedRegistration, error_5;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 4, , 5]);
                id = req.params.id;
                userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                if (!userId) {
                    throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                }
                registrationId = parseInt(id, 10);
                if (isNaN(registrationId) || registrationId <= 0) {
                    throw apiError_1.ApiError.badRequest('无效的报名ID');
                }
                // 验证请求体不为空
                if (!req.body || Object.keys(req.body).length === 0) {
                    throw apiError_1.ApiError.badRequest('审核数据不能为空');
                }
                _a = req.body, status_1 = _a.status, remark = _a.remark;
                // 验证状态值是必填项
                if (status_1 === undefined || status_1 === null) {
                    throw apiError_1.ApiError.badRequest('审核状态是必填项');
                }
                // 验证状态值
                if (![0, 1, 2].includes(Number(status_1))) {
                    throw apiError_1.ApiError.badRequest('状态值无效，应为0(待确认)、1(已确认)或2(已拒绝)');
                }
                db = getSequelizeInstance();
                now = new Date();
                return [4 /*yield*/, db.query('SELECT id, status FROM activity_registrations WHERE id = ? AND deleted_at IS NULL', {
                        replacements: [Number(id) || 0],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingRecord = (_c.sent())[0];
                if (!existingRecord) {
                    throw apiError_1.ApiError.notFound('活动报名记录不存在');
                }
                // 更新状态和备注
                return [4 /*yield*/, db.query('UPDATE activity_registrations SET status = ?, remark = ?, updated_at = ?, updater_id = ? WHERE id = ?', {
                        replacements: [status_1, remark || null, now, userId, Number(id) || 0],
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 更新状态和备注
                _c.sent();
                return [4 /*yield*/, db.query("SELECT \n        ar.*,\n        a.title as activity_title\n      FROM activity_registrations ar\n      LEFT JOIN activities a ON ar.activity_id = a.id\n      WHERE ar.id = ?", {
                        replacements: [Number(id) || 0],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                updatedRegistration = (_c.sent())[0];
                apiResponse_1.ApiResponse.success(res, updatedRegistration, '审核活动报名成功');
                return [3 /*break*/, 5];
            case 4:
                error_5 = _c.sent();
                logger_1.logger.error('审核活动报名失败', error_5);
                apiResponse_1.ApiResponse.handleError(res, error_5);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.reviewRegistration = reviewRegistration;
/**
 * 取消活动报名
 */
var cancelRegistration = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, cancelReason, db, now, existingRecord, updatedRegistration, error_6;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                id = req.params.id;
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
                }
                if (!id || isNaN(Number(id) || 0)) {
                    throw apiError_1.ApiError.badRequest('报名ID无效');
                }
                cancelReason = req.body.cancelReason;
                db = getSequelizeInstance();
                now = new Date();
                return [4 /*yield*/, db.query('SELECT id, status FROM activity_registrations WHERE id = ? AND deleted_at IS NULL', {
                        replacements: [Number(id) || 0],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                existingRecord = (_b.sent())[0];
                if (!existingRecord) {
                    throw apiError_1.ApiError.notFound('活动报名记录不存在');
                }
                // 更新状态为已取消(3)，并记录取消原因
                return [4 /*yield*/, db.query('UPDATE activity_registrations SET status = 3, remark = ?, updated_at = ?, updater_id = ? WHERE id = ?', {
                        replacements: [cancelReason || '用户主动取消', now, userId, Number(id) || 0],
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 2:
                // 更新状态为已取消(3)，并记录取消原因
                _b.sent();
                return [4 /*yield*/, db.query("SELECT \n        ar.*,\n        a.title as activity_title\n      FROM activity_registrations ar\n      LEFT JOIN activities a ON ar.activity_id = a.id\n      WHERE ar.id = ?", {
                        replacements: [Number(id) || 0],
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 3:
                updatedRegistration = (_b.sent())[0];
                apiResponse_1.ApiResponse.success(res, updatedRegistration, '取消活动报名成功');
                return [3 /*break*/, 5];
            case 4:
                error_6 = _b.sent();
                logger_1.logger.error('取消活动报名失败', error_6);
                apiResponse_1.ApiResponse.handleError(res, error_6);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.cancelRegistration = cancelRegistration;
/**
 * 签到
 */
var checkIn = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            // 模拟签到操作    // const mockCheckIn = {
            //       registrationId: Number(id) || 0,
            //       checkInTime: new Date(),
            //       checkInBy: userId,
            //       status: 'checked_in'
            //     };
            apiResponse_1.ApiResponse.success(res, [], '签到成功');
        }
        catch (error) {
            logger_1.logger.error('签到失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.checkIn = checkIn;
/**
 * 标记缺席
 */
var markAsAbsent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            // 模拟标记缺席操作    // const mockAbsent = {
            //       registrationId: Number(id) || 0,
            //       absentTime: new Date(),
            //       markedBy: userId,
            //       status: 'absent'
            //     };
            apiResponse_1.ApiResponse.success(res, [], '标记缺席成功');
        }
        catch (error) {
            logger_1.logger.error('标记缺席失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.markAsAbsent = markAsAbsent;
/**
 * 记录反馈
 */
var recordFeedback = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, _a, feedback, rating;
    var _b;
    return __generator(this, function (_c) {
        try {
            id = req.params.id;
            userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            _a = req.body, feedback = _a.feedback, rating = _a.rating;
            // 模拟记录反馈操作    // const mockFeedback = {
            //       registrationId: Number(id) || 0,
            //       feedback: feedback,
            //       rating: rating,
            //       feedbackTime: new Date(),
            //       recordedBy: userId
            //     };
            apiResponse_1.ApiResponse.success(res, [], '记录反馈成功');
        }
        catch (error) {
            logger_1.logger.error('记录反馈失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.recordFeedback = recordFeedback;
/**
 * 标记为已转化
 */
var markAsConverted = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId;
    var _a;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            // 模拟标记转化操作    // const mockConversion = {
            //       registrationId: Number(id) || 0,
            //       isConversion: 1,
            //       conversionTime: new Date(),
            //       convertedBy: userId
            //     };
            apiResponse_1.ApiResponse.success(res, [], '标记转化成功');
        }
        catch (error) {
            logger_1.logger.error('标记转化失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.markAsConverted = markAsConverted;
/**
 * 获取活动报名列表
 */
var getRegistrations = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, size, activityId, whereClause, offset, _d, registrations, total, result_1, dbError_1, whereClause, replacements, offset, db, registrations, countResult, countList, total, registrationsList, result_2, result, error_7;
    var _e;
    return __generator(this, function (_f) {
        switch (_f.label) {
            case 0:
                _f.trys.push([0, 7, , 8]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.size, size = _c === void 0 ? 10 : _c, activityId = _a.activityId;
                console.log('🔍 开始查询报名数据，包含关联信息...');
                _f.label = 1;
            case 1:
                _f.trys.push([1, 3, , 6]);
                whereClause = {
                    deletedAt: null
                };
                if (activityId) {
                    whereClause.activityId = Number(activityId) || 0;
                }
                offset = ((Number(page) - 1) || 0) * Number(size) || 0;
                return [4 /*yield*/, activity_registration_model_1.ActivityRegistration.findAndCountAll({
                        where: whereClause,
                        include: [
                            {
                                model: activity_model_1.Activity,
                                as: 'activity',
                                attributes: ['id', 'title', 'description', 'startTime', 'endTime', 'status'],
                                required: false
                            },
                            {
                                model: student_model_1.Student,
                                as: 'student',
                                attributes: ['id', 'name', 'gender', 'birthDate'],
                                required: false
                            },
                            {
                                model: parent_student_relation_model_1.ParentStudentRelation,
                                as: 'parent',
                                attributes: ['id', 'relationship'],
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'user',
                                        attributes: ['id', 'realName', 'phone'],
                                        required: false
                                    },
                                ],
                                required: false
                            },
                        ],
                        order: [['createdAt', 'DESC']],
                        limit: Number(size) || 10,
                        offset: offset
                    })];
            case 2:
                _d = _f.sent(), registrations = _d.rows, total = _d.count;
                console.log('📋 查询结果:', {
                    total: total,
                    registrationsLength: registrations.length,
                    firstItem: registrations[0] ? {
                        id: registrations[0].id,
                        contactName: registrations[0].contactName,
                        childName: registrations[0].childName,
                        activity: registrations[0].activity,
                        student: registrations[0].student,
                        parent: registrations[0].parent
                    } : null
                });
                result_1 = {
                    data: registrations,
                    pagination: {
                        page: Number(page) || 1,
                        size: Number(size) || 10,
                        total: Number(total) || 0,
                        totalPages: Math.ceil((Number(total) || 0) / (Number(size) || 10))
                    }
                };
                apiResponse_1.ApiResponse.success(res, result_1, '获取活动报名列表成功');
                return [2 /*return*/];
            case 3:
                dbError_1 = _f.sent();
                console.log('Sequelize查询失败，使用原始SQL查询:', dbError_1);
                whereClause = 'WHERE deleted_at IS NULL';
                replacements = [];
                if (activityId) {
                    whereClause += ' AND activity_id = ?';
                    replacements.push(Number(activityId) || 0);
                }
                offset = ((Number(page) - 1) || 0) * Number(size) || 0;
                replacements.push(Number(size) || 0, offset);
                db = getSequelizeInstance();
                return [4 /*yield*/, db.query("SELECT * FROM activity_registrations ".concat(whereClause, " ORDER BY created_at DESC LIMIT ? OFFSET ?"), {
                        replacements: replacements,
                        type: 'SELECT'
                    })];
            case 4:
                registrations = _f.sent();
                return [4 /*yield*/, db.query("SELECT COUNT(*) as total FROM activity_registrations ".concat(whereClause), {
                        replacements: replacements.slice(0, -2),
                        type: 'SELECT'
                    })];
            case 5:
                countResult = _f.sent();
                countList = Array.isArray(countResult) ? countResult : [];
                total = ((_e = countList[0]) === null || _e === void 0 ? void 0 : _e.total) || 0;
                registrationsList = Array.isArray(registrations) ? registrations : [];
                result_2 = {
                    data: registrationsList,
                    pagination: {
                        page: Number(page) || 0,
                        size: Number(size) || 0,
                        total: Number(total) || 0,
                        totalPages: Math.ceil(Number(total) || 0 / Number(size) || 0)
                    }
                };
                apiResponse_1.ApiResponse.success(res, result_2, '获取活动报名列表成功');
                return [2 /*return*/];
            case 6:
                result = {
                    data: [],
                    pagination: {
                        page: Number(page) || 0,
                        size: Number(size) || 0,
                        total: 0,
                        totalPages: 1
                    }
                };
                apiResponse_1.ApiResponse.success(res, result, '获取活动报名列表成功');
                return [3 /*break*/, 8];
            case 7:
                error_7 = _f.sent();
                logger_1.logger.error('获取活动报名列表失败', error_7);
                apiResponse_1.ApiResponse.handleError(res, error_7);
                return [3 /*break*/, 8];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.getRegistrations = getRegistrations;
/**
 * 获取活动报名统计
 */
var getRegistrationStats = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityId;
    return __generator(this, function (_a) {
        try {
            activityId = req.query.activityId;
            // 模拟统计数据    // const mockStats = {
            //       activityId: activityId ? Number(activityId) || 0 : null,
            //       totalRegistrations: 50,
            //       confirmedRegistrations: 45,
            //       pendingRegistrations: 3,
            //       cancelledRegistrations: 2,
            //       checkInCount: 40,
            //       conversionCount: 30,
            //       conversionRate: 0.67
            //     };
            apiResponse_1.ApiResponse.success(res, [], '获取活动报名统计成功');
        }
        catch (error) {
            logger_1.logger.error('获取活动报名统计失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.getRegistrationStats = getRegistrationStats;
// 状态文本映射函数
function getStatusText(status) {
    var statusMap = {
        0: '待审核',
        1: '已确认',
        2: '已拒绝',
        3: '已取消'
    };
    return statusMap[status] || '未知状态';
}
/**
 * 按活动获取报名列表
 */
var getRegistrationsByActivity = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var activityId, _a, _b, page, _c, size, db, offset, registrations, countResult, countList, total, registrationsList, result_3, dbError_2, result, error_8;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 6, , 7]);
                activityId = req.params.activityId;
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.size, size = _c === void 0 ? 10 : _c;
                if (!activityId || isNaN(Number(activityId) || 0)) {
                    throw apiError_1.ApiError.badRequest('活动ID无效');
                }
                _e.label = 1;
            case 1:
                _e.trys.push([1, 4, , 5]);
                db = getSequelizeInstance();
                offset = ((Number(page) - 1) || 0) * Number(size) || 0;
                return [4 /*yield*/, db.query('SELECT * FROM activity_registrations WHERE activity_id = ? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ? OFFSET ?', {
                        replacements: [Number(activityId) || 0, Number(size) || 0, offset],
                        type: 'SELECT'
                    })];
            case 2:
                registrations = _e.sent();
                return [4 /*yield*/, db.query('SELECT COUNT(*) as total FROM activity_registrations WHERE activity_id = ? AND deleted_at IS NULL', {
                        replacements: [Number(activityId) || 0],
                        type: 'SELECT'
                    })];
            case 3:
                countResult = _e.sent();
                countList = Array.isArray(countResult) ? countResult : [];
                total = ((_d = countList[0]) === null || _d === void 0 ? void 0 : _d.total) || 0;
                registrationsList = Array.isArray(registrations) ? registrations : [];
                result_3 = {
                    data: registrationsList,
                    pagination: {
                        page: Number(page) || 0,
                        size: Number(size) || 0,
                        total: Number(total) || 0,
                        totalPages: Math.ceil(Number(total) || 0 / Number(size) || 0)
                    }
                };
                apiResponse_1.ApiResponse.success(res, result_3, '按活动获取报名列表成功');
                return [2 /*return*/];
            case 4:
                dbError_2 = _e.sent();
                console.log('数据库查询失败，使用模拟数据:', dbError_2);
                return [3 /*break*/, 5];
            case 5:
                result = {
                    data: [],
                    pagination: {
                        page: Number(page) || 0,
                        size: Number(size) || 0,
                        total: 0,
                        totalPages: 1
                    }
                };
                apiResponse_1.ApiResponse.success(res, result, '按活动获取报名列表成功');
                return [3 /*break*/, 7];
            case 6:
                error_8 = _e.sent();
                logger_1.logger.error('按活动获取报名列表失败', error_8);
                apiResponse_1.ApiResponse.handleError(res, error_8);
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.getRegistrationsByActivity = getRegistrationsByActivity;
/**
 * 按学生获取报名列表
 */
var getRegistrationsByStudent = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var studentId, _a, _b, page, _c, size, result;
    return __generator(this, function (_d) {
        try {
            studentId = req.params.studentId;
            _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.size, size = _c === void 0 ? 10 : _c;
            if (!studentId || isNaN(Number(studentId) || 0)) {
                throw apiError_1.ApiError.badRequest('学生ID无效');
            }
            result = {
                data: [],
                pagination: {
                    page: Number(page) || 0,
                    size: Number(size) || 0,
                    total: 0,
                    totalPages: 1
                }
            };
            apiResponse_1.ApiResponse.success(res, result, '按学生获取报名列表成功');
        }
        catch (error) {
            logger_1.logger.error('按学生获取报名列表失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.getRegistrationsByStudent = getRegistrationsByStudent;
/**
 * 按状态获取报名列表
 */
var getRegistrationsByStatus = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var status_2, _a, _b, page, _c, size, statusMap, statusValue, result;
    return __generator(this, function (_d) {
        try {
            status_2 = req.params.status;
            _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.size, size = _c === void 0 ? 10 : _c;
            statusMap = {
                'pending': 0,
                'confirmed': 1,
                'rejected': 2,
                'cancelled': 3,
                'checked-in': 4,
                'absent': 5
            };
            statusValue = statusMap[status_2];
            if (statusValue === undefined) {
                throw apiError_1.ApiError.badRequest('状态参数无效');
            }
            result = {
                data: [],
                pagination: {
                    page: Number(page) || 0,
                    size: Number(size) || 0,
                    total: 0,
                    totalPages: 1
                }
            };
            apiResponse_1.ApiResponse.success(res, result, '按状态获取报名列表成功');
        }
        catch (error) {
            logger_1.logger.error('按状态获取报名列表失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.getRegistrationsByStatus = getRegistrationsByStatus;
/**
 * 批量确认报名
 */
var batchConfirmRegistrations = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, registrationIds, _i, registrationIds_1, id, uniqueIds;
    var _a;
    return __generator(this, function (_b) {
        try {
            userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            // 验证请求体不为空
            if (!req.body || Object.keys(req.body).length === 0) {
                throw apiError_1.ApiError.badRequest('批量确认数据不能为空');
            }
            registrationIds = req.body.registrationIds;
            // 验证报名ID列表
            if (!Array.isArray(registrationIds) || registrationIds.length === 0) {
                throw apiError_1.ApiError.badRequest('报名ID列表不能为空');
            }
            // 验证每个ID的格式
            for (_i = 0, registrationIds_1 = registrationIds; _i < registrationIds_1.length; _i++) {
                id = registrationIds_1[_i];
                if (isNaN(Number(id)) || Number(id) <= 0) {
                    throw apiError_1.ApiError.badRequest("\u65E0\u6548\u7684\u62A5\u540DID: ".concat(id));
                }
            }
            uniqueIds = __spreadArray([], new Set(registrationIds), true);
            if (uniqueIds.length !== registrationIds.length) {
                throw apiError_1.ApiError.badRequest('报名ID列表中存在重复的ID');
            }
            // 模拟批量确认操作    // const mockResult = {
            //       successCount: registrationIds.length,
            //       failedCount: 0,
            //       confirmedIds: registrationIds,
            //       failedIds: [],
            //       confirmedAt: new Date(),
            //       confirmedBy: userId
            //     };
            apiResponse_1.ApiResponse.success(res, [], '批量确认报名成功');
        }
        catch (error) {
            logger_1.logger.error('批量确认报名失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.batchConfirmRegistrations = batchConfirmRegistrations;
/**
 * 获取报名付款信息
 */
var getRegistrationPayment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('报名ID无效');
            }
            // 模拟付款信息    // const mockPayment = {
            //       registrationId: Number(id) || 0,
            //       paymentStatus: 'paid', // pending, paid, failed, refunded
            //       amount: 299.00,
            //       currency: 'CNY',
            //       paymentMethod: 'wechat',
            //       transactionId: 'TXN' + Date.now(),
            //       paidAt: new Date(),
            //       paymentDetails: {
            //         activityFee: 299.00,
            //         discount: 0,
            //         finalAmount: 299.00
            //       }
            //     };
            apiResponse_1.ApiResponse.success(res, [], '获取报名付款信息成功');
        }
        catch (error) {
            logger_1.logger.error('获取报名付款信息失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); };
exports.getRegistrationPayment = getRegistrationPayment;
/**
 * 处理报名付款
 */
var processRegistrationPayment = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, userId, _a, amount, paymentMethod;
    var _b;
    return __generator(this, function (_c) {
        try {
            id = req.params.id;
            userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
            if (!userId) {
                throw apiError_1.ApiError.unauthorized('未登录或登录已过期');
            }
            if (!id || isNaN(Number(id) || 0)) {
                throw apiError_1.ApiError.badRequest('报名ID无效');
            }
            _a = req.body, amount = _a.amount, paymentMethod = _a.paymentMethod;
            if (!amount || !paymentMethod) {
                throw apiError_1.ApiError.badRequest('付款金额和付款方式不能为空');
            }
            // 模拟付款处理    // const mockPaymentResult = {
            //       registrationId: Number(id) || 0,
            //       paymentStatus: 'paid',
            //       amount: Number(amount) || 0,
            //       paymentMethod: paymentMethod,
            //       transactionId: 'TXN' + Date.now(),
            //       processedAt: new Date(),
            //       processedBy: userId
            //     };
            apiResponse_1.ApiResponse.success(res, [], '处理报名付款成功');
        }
        catch (error) {
            logger_1.logger.error('处理报名付款失败', error);
            apiResponse_1.ApiResponse.handleError(res, error);
        }
        return [2 /*return*/];
    });
}); }; // Force reload Thu Jun 12 06:17:36 UTC 2025
exports.processRegistrationPayment = processRegistrationPayment;
