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
exports.AdmissionResultService = void 0;
var init_1 = require("../../init");
var admission_result_model_1 = require("../../models/admission-result.model");
var enrollment_application_model_1 = require("../../models/enrollment-application.model");
var parent_student_relation_model_1 = require("../../models/parent-student-relation.model");
var user_model_1 = require("../../models/user.model");
var enrollment_plan_model_1 = require("../../models/enrollment-plan.model");
var class_model_1 = require("../../models/class.model");
var apiError_1 = require("../../utils/apiError");
// 分页工具函数
var getPagination = function (page, size) {
    var limit = size ? +size : 10;
    var offset = page ? (page - 1) * limit : 0;
    return { limit: limit, offset: offset };
};
var getPagingData = function (data, count, page, limit) {
    var totalItems = count;
    var currentPage = page ? +page : 0;
    var totalPages = Math.ceil(totalItems / limit);
    return {
        totalItems: totalItems,
        data: data,
        totalPages: totalPages,
        currentPage: currentPage
    };
};
/**
 * 录取结果服务类
 */
var AdmissionResultService = /** @class */ (function () {
    function AdmissionResultService() {
    }
    /**
     * 创建录取结果
     * @param resultData 录取结果数据
     * @param userId 当前用户ID
     * @returns 创建的录取结果
     */
    AdmissionResultService.prototype.createResult = function (resultData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, application, existingResult, parentRelation, plan, classEntity, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 11, , 13]);
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findByPk(resultData.applicationId)];
                    case 3:
                        application = _a.sent();
                        if (!application) {
                            throw new apiError_1.ApiError(404, '报名申请不存在');
                        }
                        return [4 /*yield*/, admission_result_model_1.AdmissionResult.findOne({
                                where: { applicationId: resultData.applicationId }
                            })];
                    case 4:
                        existingResult = _a.sent();
                        if (existingResult) {
                            throw new apiError_1.ApiError(400, '该报名申请已有录取结果');
                        }
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findByPk(resultData.parentId)];
                    case 5:
                        parentRelation = _a.sent();
                        if (!parentRelation) {
                            throw new apiError_1.ApiError(404, '家长关系不存在');
                        }
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(resultData.planId)];
                    case 6:
                        plan = _a.sent();
                        if (!plan) {
                            throw new apiError_1.ApiError(404, '招生计划不存在');
                        }
                        if (!resultData.classId) return [3 /*break*/, 8];
                        return [4 /*yield*/, class_model_1.Class.findByPk(resultData.classId)];
                    case 7:
                        classEntity = _a.sent();
                        if (!classEntity) {
                            throw new apiError_1.ApiError(404, '班级不存在');
                        }
                        _a.label = 8;
                    case 8: return [4 /*yield*/, admission_result_model_1.AdmissionResult.create(__assign(__assign({}, resultData), { createdBy: userId, updatedBy: userId }), { transaction: transaction })];
                    case 9:
                        result = _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 10:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 11:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 12:
                        _a.sent();
                        throw error_1;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取录取结果详情
     * @param id 录取结果ID
     * @returns 录取结果详情
     */
    AdmissionResultService.prototype.getResultById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, admission_result_model_1.AdmissionResult.findByPk(id, {
                            include: [
                                {
                                    model: enrollment_application_model_1.EnrollmentApplication,
                                    as: 'application'
                                },
                                {
                                    model: parent_student_relation_model_1.ParentStudentRelation,
                                    as: 'parent',
                                    attributes: ['id']
                                },
                                {
                                    model: enrollment_plan_model_1.EnrollmentPlan,
                                    as: 'plan'
                                },
                                {
                                    model: class_model_1.Class,
                                    as: 'class'
                                },
                                {
                                    model: user_model_1.User,
                                    as: 'creator'
                                },
                                {
                                    model: user_model_1.User,
                                    as: 'updater'
                                },
                            ]
                        })];
                    case 1:
                        result = _a.sent();
                        if (!result) {
                            throw new apiError_1.ApiError(404, '录取结果不存在');
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    /**
     * 更新录取结果
     * @param id 录取结果ID
     * @param resultData 录取结果数据
     * @param userId 当前用户ID
     * @returns 更新后的录取结果
     */
    AdmissionResultService.prototype.updateResult = function (id, resultData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, parentRelation, plan, classEntity, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 12, , 14]);
                        return [4 /*yield*/, admission_result_model_1.AdmissionResult.findByPk(id)];
                    case 3:
                        result = _a.sent();
                        if (!result) {
                            throw new apiError_1.ApiError(404, '录取结果不存在');
                        }
                        if (!(resultData.parentId && resultData.parentId !== result.parentId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findByPk(resultData.parentId)];
                    case 4:
                        parentRelation = _a.sent();
                        if (!parentRelation) {
                            throw new apiError_1.ApiError(404, '家长关系不存在');
                        }
                        _a.label = 5;
                    case 5:
                        if (!(resultData.planId && resultData.planId !== result.planId)) return [3 /*break*/, 7];
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(resultData.planId)];
                    case 6:
                        plan = _a.sent();
                        if (!plan) {
                            throw new apiError_1.ApiError(404, '招生计划不存在');
                        }
                        _a.label = 7;
                    case 7:
                        if (!(resultData.classId && resultData.classId !== result.classId)) return [3 /*break*/, 9];
                        return [4 /*yield*/, class_model_1.Class.findByPk(resultData.classId)];
                    case 8:
                        classEntity = _a.sent();
                        if (!classEntity) {
                            throw new apiError_1.ApiError(404, '班级不存在');
                        }
                        _a.label = 9;
                    case 9: 
                    // 更新录取结果
                    return [4 /*yield*/, result.update(__assign(__assign({}, resultData), { updatedBy: userId }), { transaction: transaction })];
                    case 10:
                        // 更新录取结果
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 11:
                        _a.sent();
                        return [2 /*return*/, this.getResultById(id)];
                    case 12:
                        error_2 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 13:
                        _a.sent();
                        throw error_2;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除录取结果
     * @param id 录取结果ID
     * @returns 是否删除成功
     */
    AdmissionResultService.prototype.deleteResult = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, admission_result_model_1.AdmissionResult.findByPk(id)];
                    case 3:
                        result = _a.sent();
                        if (!result) {
                            throw new apiError_1.ApiError(404, '录取结果不存在');
                        }
                        // 删除录取结果
                        return [4 /*yield*/, result.destroy({ transaction: transaction })];
                    case 4:
                        // 删除录取结果
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_3 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_3;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取录取结果列表
     * @param filters 过滤条件
     * @param page 页码
     * @param size 每页大小
     * @returns 录取结果列表
     */
    AdmissionResultService.prototype.getResults = function (filters, page, size) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, offset, condition, _b, count, rows;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = getPagination(page, size), limit = _a.limit, offset = _a.offset;
                        condition = {};
                        // 添加过滤条件（基于实际数据库字段）
                        if (filters.resultType) {
                            condition.resultType = filters.resultType;
                        }
                        if (filters.classId) {
                            condition.classId = filters.classId;
                        }
                        if (filters.kindergartenId) {
                            condition.kindergartenId = filters.kindergartenId;
                        }
                        if (filters.studentId) {
                            condition.studentId = filters.studentId;
                        }
                        return [4 /*yield*/, admission_result_model_1.AdmissionResult.findAndCountAll({
                                where: condition,
                                limit: limit,
                                offset: offset,
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        _b = _c.sent(), count = _b.count, rows = _b.rows;
                        return [2 /*return*/, getPagingData(rows, count, page, limit)];
                }
            });
        });
    };
    /**
     * 更新录取状态
     * @param id 录取结果ID
     * @param status 新状态
     * @param userId 当前用户ID
     * @returns 更新后的录取结果
     */
    AdmissionResultService.prototype.updateStatus = function (id, status, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.getResultById(id)];
                    case 3:
                        result = _a.sent();
                        return [4 /*yield*/, result.update({
                                status: status,
                                updatedBy: userId
                            }, { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_4 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 确认入学
     * @param id 录取结果ID
     * @param confirmData 确认数据
     * @param userId 当前用户ID
     * @returns 更新后的录取结果
     */
    AdmissionResultService.prototype.confirmEnrollment = function (id, confirmData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, result, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, this.getResultById(id)];
                    case 3:
                        result = _a.sent();
                        if (result.status !== admission_result_model_1.AdmissionStatus.ADMITTED) {
                            throw new apiError_1.ApiError(400, '只有已录取状态才能确认入学');
                        }
                        return [4 /*yield*/, result.update(__assign(__assign({}, confirmData), { status: admission_result_model_1.AdmissionStatus.CONFIRMED, confirmationDate: new Date(), updatedBy: userId }), { transaction: transaction })];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, result];
                    case 6:
                        error_5 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_5;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取录取统计数据
     * @param filters 过滤条件
     * @returns 统计数据
     */
    AdmissionResultService.prototype.getStatistics = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var condition, stats;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        condition = {};
                        if (filters.planId) {
                            condition.planId = filters.planId;
                        }
                        if (filters.kindergartenId) {
                            condition.kindergartenId = filters.kindergartenId;
                        }
                        return [4 /*yield*/, admission_result_model_1.AdmissionResult.findAll({
                                where: condition,
                                attributes: [
                                    'status',
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.col('status')), 'count'],
                                ],
                                group: ['status']
                            })];
                    case 1:
                        stats = _a.sent();
                        return [2 /*return*/, stats];
                }
            });
        });
    };
    return AdmissionResultService;
}());
exports.AdmissionResultService = AdmissionResultService;
// 导出服务实例
exports["default"] = new AdmissionResultService();
