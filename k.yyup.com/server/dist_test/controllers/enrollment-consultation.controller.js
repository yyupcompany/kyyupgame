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
exports.__esModule = true;
exports.EnrollmentConsultationController = void 0;
var enrollment_1 = require("../services/enrollment");
var enrollment_consultation_validation_1 = require("../validations/enrollment-consultation.validation");
var validator_1 = require("../utils/validator");
var apiResponse_1 = require("../utils/apiResponse");
/**
 * 招生咨询控制器
 * 处理招生咨询相关的HTTP请求
 */
var EnrollmentConsultationController = /** @class */ (function () {
    function EnrollmentConsultationController() {
        var _this = this;
        /**
         * 创建招生咨询
         * @param req 请求对象
         * @param res 响应对象
         */
        this.createConsultation = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validatedData, userId, consultation, error_1;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, validator_1.validateRequest)(req.body, enrollment_consultation_validation_1.createEnrollmentConsultationSchema)];
                    case 1:
                        validatedData = _b.sent();
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, this.consultationService.createConsultation(validatedData, userId)];
                    case 2:
                        consultation = _b.sent();
                        apiResponse_1.ApiResponse.success(res, consultation, '招生咨询创建成功', 201);
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _b.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_1, '创建招生咨询失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取招生咨询详情
         * @param req 请求对象
         * @param res 响应对象
         */
        this.getConsultationById = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, consultation, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10) || 0;
                        if (isNaN(id)) {
                            apiResponse_1.ApiResponse.badRequest(res, '无效的咨询ID');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.consultationService.getConsultationById(id)];
                    case 1:
                        consultation = _a.sent();
                        apiResponse_1.ApiResponse.success(res, consultation, '获取招生咨询详情成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_2, '获取招生咨询详情失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 更新招生咨询
         * @param req 请求对象
         * @param res 响应对象
         */
        this.updateConsultation = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, validatedData, userId, consultation, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        id = parseInt(req.params.id, 10) || 0;
                        if (isNaN(id)) {
                            apiResponse_1.ApiResponse.badRequest(res, '无效的咨询ID');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, (0, validator_1.validateRequest)(__assign(__assign({}, req.body), { id: id }), enrollment_consultation_validation_1.updateEnrollmentConsultationSchema)];
                    case 1:
                        validatedData = _b.sent();
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, this.consultationService.updateConsultation(validatedData, userId)];
                    case 2:
                        consultation = _b.sent();
                        apiResponse_1.ApiResponse.success(res, consultation, '招生咨询更新成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _b.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_3, '更新招生咨询失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 删除招生咨询
         * @param req 请求对象
         * @param res 响应对象
         */
        this.deleteConsultation = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10) || 0;
                        if (isNaN(id)) {
                            apiResponse_1.ApiResponse.badRequest(res, '无效的咨询ID');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.consultationService.deleteConsultation(id)];
                    case 1:
                        _a.sent();
                        apiResponse_1.ApiResponse.success(res, null, '招生咨询删除成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_4, '删除招生咨询失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取招生咨询列表
         * @param req 请求对象
         * @param res 响应对象
         */
        this.getConsultationList = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validatedParams, userInfo, consultations, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, validator_1.validateRequest)(req.query, enrollment_consultation_validation_1.enrollmentConsultationFilterSchema)];
                    case 1:
                        validatedParams = _b.sent();
                        userInfo = req.user ? {
                            id: req.user.id,
                            role: ((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || 'admin'
                        } : undefined;
                        return [4 /*yield*/, this.consultationService.getConsultationList(validatedParams, userInfo)];
                    case 2:
                        consultations = _b.sent();
                        apiResponse_1.ApiResponse.success(res, consultations, '获取招生咨询列表成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _b.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_5, '获取招生咨询列表失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取招生咨询统计
         * @param req 请求对象
         * @param res 响应对象
         */
        this.getConsultationStatistics = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validatedParams, statistics, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, validator_1.validateRequest)(req.query, enrollment_consultation_validation_1.enrollmentConsultationFilterSchema)];
                    case 1:
                        validatedParams = _a.sent();
                        return [4 /*yield*/, this.consultationService.getConsultationStatistics(validatedParams)];
                    case 2:
                        statistics = _a.sent();
                        apiResponse_1.ApiResponse.success(res, statistics, '获取招生咨询统计成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_6, '获取招生咨询统计失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 创建招生咨询跟进记录
         * @param req 请求对象
         * @param res 响应对象
         */
        this.createFollowup = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validatedData, userId, followup, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, validator_1.validateRequest)(req.body, enrollment_consultation_validation_1.createEnrollmentConsultationFollowupSchema)];
                    case 1:
                        validatedData = _b.sent();
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        return [4 /*yield*/, this.followupService.createFollowup(validatedData, userId)];
                    case 2:
                        followup = _b.sent();
                        apiResponse_1.ApiResponse.success(res, followup, '招生咨询跟进记录创建成功', 201);
                        return [3 /*break*/, 4];
                    case 3:
                        error_7 = _b.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_7, '创建招生咨询跟进记录失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取招生咨询跟进记录详情
         * @param req 请求对象
         * @param res 响应对象
         */
        this.getFollowupById = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id, followup, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = parseInt(req.params.id, 10) || 0;
                        if (isNaN(id)) {
                            apiResponse_1.ApiResponse.badRequest(res, '无效的跟进记录ID');
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.followupService.getFollowupById(id)];
                    case 1:
                        followup = _a.sent();
                        apiResponse_1.ApiResponse.success(res, followup, '获取招生咨询跟进记录详情成功');
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_8, '获取招生咨询跟进记录详情失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取招生咨询跟进记录列表
         * @param req 请求对象
         * @param res 响应对象
         */
        this.getFollowupList = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var validatedParams, followups, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, (0, validator_1.validateRequest)(req.query, enrollment_consultation_validation_1.enrollmentConsultationFollowupFilterSchema)];
                    case 1:
                        validatedParams = _a.sent();
                        return [4 /*yield*/, this.followupService.getFollowupList(validatedParams)];
                    case 2:
                        followups = _a.sent();
                        apiResponse_1.ApiResponse.success(res, followups, '获取招生咨询跟进记录列表成功');
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        apiResponse_1.ApiResponse.handleError(res, error_9, '获取招生咨询跟进记录列表失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        this.consultationService = new enrollment_1.EnrollmentConsultationService();
        this.followupService = new enrollment_1.EnrollmentConsultationFollowupService();
    }
    return EnrollmentConsultationController;
}());
exports.EnrollmentConsultationController = EnrollmentConsultationController;
exports["default"] = new EnrollmentConsultationController();
