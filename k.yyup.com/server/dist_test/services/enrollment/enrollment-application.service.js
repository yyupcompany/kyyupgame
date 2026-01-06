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
exports.EnrollmentApplicationService = void 0;
/**
 * 报名申请服务
 */
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var enrollment_application_model_1 = require("../../models/enrollment-application.model");
var enrollment_application_material_model_1 = require("../../models/enrollment-application-material.model");
var file_storage_model_1 = require("../../models/file-storage.model");
var parent_student_relation_model_1 = require("../../models/parent-student-relation.model");
var user_model_1 = require("../../models/user.model");
var enrollment_plan_model_1 = require("../../models/enrollment-plan.model");
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
 * 报名申请服务类
 */
var EnrollmentApplicationService = /** @class */ (function () {
    function EnrollmentApplicationService() {
    }
    /**
     * 创建报名申请
     * @param applicationData 报名申请数据
     * @param userId 当前用户ID
     * @returns 创建的报名申请
     */
    EnrollmentApplicationService.prototype.createApplication = function (applicationData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, parent_1, plan, application, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findByPk(applicationData.parentId)];
                    case 3:
                        parent_1 = _a.sent();
                        if (!parent_1) {
                            throw new apiError_1.ApiError(404, '家长不存在');
                        }
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(applicationData.planId)];
                    case 4:
                        plan = _a.sent();
                        if (!plan) {
                            throw new apiError_1.ApiError(404, '招生计划不存在');
                        }
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.create(__assign(__assign({}, applicationData), { createdBy: userId, status: enrollment_application_model_1.ApplicationStatus.PENDING }), { transaction: transaction })];
                    case 5:
                        application = _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, application];
                    case 7:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取报名申请详情
     * @param id 报名申请ID
     * @returns 报名申请详情
     */
    EnrollmentApplicationService.prototype.getApplicationById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var application;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findByPk(id, {
                            include: [
                                {
                                    model: parent_student_relation_model_1.ParentStudentRelation,
                                    as: 'parent',
                                    attributes: ['id', 'relationship'],
                                    include: [{
                                            model: user_model_1.User,
                                            as: 'user',
                                            attributes: ['id', 'realName', 'phone', 'email']
                                        }]
                                },
                                {
                                    model: enrollment_plan_model_1.EnrollmentPlan,
                                    as: 'plan',
                                    attributes: ['id', 'title', 'year', 'semester', 'status']
                                },
                                {
                                    model: user_model_1.User,
                                    as: 'reviewer',
                                    attributes: ['id', 'username', 'realName']
                                },
                                {
                                    model: enrollment_application_material_model_1.EnrollmentApplicationMaterial,
                                    as: 'materials',
                                    include: [
                                        {
                                            model: file_storage_model_1.FileStorage,
                                            as: 'file',
                                            attributes: ['id', 'filename', 'url', 'size', 'type']
                                        },
                                        {
                                            model: user_model_1.User,
                                            as: 'uploader',
                                            attributes: ['id', 'username', 'realName']
                                        },
                                        {
                                            model: user_model_1.User,
                                            as: 'verifier',
                                            attributes: ['id', 'username', 'realName']
                                        },
                                    ]
                                },
                            ]
                        })];
                    case 1:
                        application = _a.sent();
                        if (!application) {
                            throw new apiError_1.ApiError(404, '报名申请不存在');
                        }
                        return [2 /*return*/, application];
                }
            });
        });
    };
    /**
     * 更新报名申请
     * @param id 报名申请ID
     * @param applicationData 报名申请数据
     * @param userId 当前用户ID
     * @returns 更新后的报名申请
     */
    EnrollmentApplicationService.prototype.updateApplication = function (id, applicationData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, application, parent_2, plan, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 12]);
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findByPk(id)];
                    case 3:
                        application = _a.sent();
                        if (!application) {
                            throw new apiError_1.ApiError(404, '报名申请不存在');
                        }
                        if (!(applicationData.parentId && applicationData.parentId !== application.parentId)) return [3 /*break*/, 5];
                        return [4 /*yield*/, parent_student_relation_model_1.ParentStudentRelation.findByPk(applicationData.parentId)];
                    case 4:
                        parent_2 = _a.sent();
                        if (!parent_2) {
                            throw new apiError_1.ApiError(404, '家长不存在');
                        }
                        _a.label = 5;
                    case 5:
                        if (!(applicationData.planId && applicationData.planId !== application.planId)) return [3 /*break*/, 7];
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(applicationData.planId)];
                    case 6:
                        plan = _a.sent();
                        if (!plan) {
                            throw new apiError_1.ApiError(404, '招生计划不存在');
                        }
                        _a.label = 7;
                    case 7: 
                    // 更新报名申请 (移除 updatedBy)
                    return [4 /*yield*/, application.update(applicationData, { transaction: transaction })];
                    case 8:
                        // 更新报名申请 (移除 updatedBy)
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, this.getApplicationById(id)];
                    case 10:
                        error_2 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 11:
                        _a.sent();
                        throw error_2;
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除报名申请
     * @param id 报名申请ID
     * @returns 是否删除成功
     */
    EnrollmentApplicationService.prototype.deleteApplication = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, application, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findByPk(id)];
                    case 3:
                        application = _a.sent();
                        if (!application) {
                            throw new apiError_1.ApiError(404, '报名申请不存在');
                        }
                        // 直接删除记录（因为表中没有deletedAt字段）
                        return [4 /*yield*/, application.destroy({ transaction: transaction })];
                    case 4:
                        // 直接删除记录（因为表中没有deletedAt字段）
                        _a.sent();
                        // 级联删除关联的申请材料
                        return [4 /*yield*/, enrollment_application_material_model_1.EnrollmentApplicationMaterial.destroy({
                                where: { applicationId: id },
                                transaction: transaction
                            })];
                    case 5:
                        // 级联删除关联的申请材料
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 7:
                        error_3 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        throw error_3;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取报名申请列表
     * @param filters 过滤条件
     * @param page 页码
     * @param size 每页大小
     * @returns 报名申请列表
     */
    EnrollmentApplicationService.prototype.getApplications = function (filters, page, size) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, limit, offset, condition, _b, count, rows;
            var _c, _d, _e, _f, _g;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _a = getPagination(page, size), limit = _a.limit, offset = _a.offset;
                        condition = {
                            deletedAt: (_c = {}, _c[sequelize_1.Op.eq] = null, _c) // 只查询未删除的记录
                        };
                        // 添加过滤条件
                        if (filters.studentName) {
                            condition.studentName = (_d = {}, _d[sequelize_1.Op.like] = "%".concat(filters.studentName, "%"), _d);
                        }
                        if (filters.status !== undefined) {
                            condition.status = filters.status;
                        }
                        if (filters.planId) {
                            condition.planId = filters.planId;
                        }
                        if (filters.parentId) {
                            condition.parentId = filters.parentId;
                        }
                        if (filters.applyDateStart && filters.applyDateEnd) {
                            condition.applyDate = (_e = {},
                                _e[sequelize_1.Op.between] = [filters.applyDateStart, filters.applyDateEnd],
                                _e);
                        }
                        else if (filters.applyDateStart) {
                            condition.applyDate = (_f = {}, _f[sequelize_1.Op.gte] = filters.applyDateStart, _f);
                        }
                        else if (filters.applyDateEnd) {
                            condition.applyDate = (_g = {}, _g[sequelize_1.Op.lte] = filters.applyDateEnd, _g);
                        }
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findAndCountAll({
                                where: condition,
                                limit: limit,
                                offset: offset,
                                order: [['applyDate', 'DESC']],
                                include: [
                                    {
                                        model: parent_student_relation_model_1.ParentStudentRelation,
                                        as: 'parent',
                                        attributes: ['id', 'relationship'],
                                        include: [{
                                                model: user_model_1.User,
                                                as: 'user',
                                                attributes: ['id', 'realName', 'phone']
                                            }]
                                    },
                                    {
                                        model: enrollment_plan_model_1.EnrollmentPlan,
                                        as: 'plan',
                                        attributes: ['id', 'title', 'year', 'semester']
                                    },
                                ]
                            })];
                    case 1:
                        _b = _h.sent(), count = _b.count, rows = _b.rows;
                        return [2 /*return*/, getPagingData(rows, count, page, limit)];
                }
            });
        });
    };
    /**
     * 审核报名申请
     * @param id 报名申请ID
     * @param reviewData 审核数据
     * @param userId 当前用户ID
     * @returns 审核后的报名申请
     */
    EnrollmentApplicationService.prototype.reviewApplication = function (id, reviewData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, application, status_1, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findByPk(id)];
                    case 3:
                        application = _a.sent();
                        if (!application) {
                            throw new apiError_1.ApiError(404, '报名申请不存在');
                        }
                        status_1 = reviewData.status;
                        // 更新审核信息（只更新状态，因为表中没有审核相关字段）
                        return [4 /*yield*/, application.update({
                                status: status_1
                            }, { transaction: transaction })];
                    case 4:
                        // 更新审核信息（只更新状态，因为表中没有审核相关字段）
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, this.getApplicationById(id)];
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
     * 添加报名申请材料
     * @param applicationId 报名申请ID
     * @param materialData 材料数据
     * @param userId 当前用户ID
     * @returns 创建的材料记录
     */
    EnrollmentApplicationService.prototype.addApplicationMaterial = function (applicationId, materialData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, application, file, material, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, this.getApplicationById(applicationId)];
                    case 3:
                        application = _a.sent();
                        return [4 /*yield*/, file_storage_model_1.FileStorage.findByPk(materialData.fileId)];
                    case 4:
                        file = _a.sent();
                        if (!file) {
                            throw new apiError_1.ApiError(404, '文件不存在');
                        }
                        return [4 /*yield*/, enrollment_application_material_model_1.EnrollmentApplicationMaterial.create({
                                applicationId: applicationId,
                                materialType: materialData.type,
                                materialName: materialData.name,
                                fileUrl: file.accessUrl,
                                fileSize: file.fileSize,
                                fileType: file.fileType,
                                uploadDate: new Date(),
                                uploaderId: userId,
                                status: enrollment_application_material_model_1.MaterialStatus.PENDING,
                                createdBy: userId
                            }, { transaction: transaction })];
                    case 5:
                        material = _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/, material];
                    case 7:
                        error_5 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 8:
                        _a.sent();
                        throw error_5;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 验证报名申请材料
     * @param materialId 材料ID
     * @param verifyData 验证数据
     * @param userId 当前用户ID
     * @returns 验证后的材料
     */
    EnrollmentApplicationService.prototype.verifyMaterial = function (materialId, verifyData, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, material, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, enrollment_application_material_model_1.EnrollmentApplicationMaterial.findByPk(materialId)];
                    case 3:
                        material = _a.sent();
                        if (!material) {
                            throw new apiError_1.ApiError(404, '材料不存在');
                        }
                        // 更新材料状态
                        return [4 /*yield*/, material.update({
                                status: verifyData.status,
                                verificationTime: new Date(),
                                verifierId: userId,
                                verificationComment: verifyData.comments,
                                updatedBy: userId
                            }, { transaction: transaction })];
                    case 4:
                        // 更新材料状态
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, material];
                    case 6:
                        error_6 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_6;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除报名申请材料
     * @param materialId 材料ID
     * @returns 是否删除成功
     */
    EnrollmentApplicationService.prototype.deleteMaterial = function (materialId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, material, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, enrollment_application_material_model_1.EnrollmentApplicationMaterial.findByPk(materialId)];
                    case 3:
                        material = _a.sent();
                        if (!material) {
                            throw new apiError_1.ApiError(404, '材料不存在');
                        }
                        // 删除材料
                        return [4 /*yield*/, material.destroy({ transaction: transaction })];
                    case 4:
                        // 删除材料
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 6:
                        error_7 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_7;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取报名申请材料列表
     * @param applicationId 报名申请ID
     * @returns 材料列表
     */
    EnrollmentApplicationService.prototype.getMaterials = function (applicationId) {
        return __awaiter(this, void 0, void 0, function () {
            var application, materials;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_application_model_1.EnrollmentApplication.findByPk(applicationId)];
                    case 1:
                        application = _a.sent();
                        if (!application) {
                            throw new apiError_1.ApiError(404, '报名申请不存在');
                        }
                        return [4 /*yield*/, enrollment_application_material_model_1.EnrollmentApplicationMaterial.findAll({
                                where: { applicationId: applicationId },
                                include: [
                                    {
                                        model: file_storage_model_1.FileStorage,
                                        as: 'file',
                                        attributes: ['id', 'filename', 'url', 'size', 'type']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'uploader',
                                        attributes: ['id', 'username', 'realName']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'verifier',
                                        attributes: ['id', 'username', 'realName']
                                    },
                                ]
                            })];
                    case 2:
                        materials = _a.sent();
                        return [2 /*return*/, materials];
                }
            });
        });
    };
    return EnrollmentApplicationService;
}());
exports.EnrollmentApplicationService = EnrollmentApplicationService;
// 导出服务实例
exports["default"] = new EnrollmentApplicationService();
