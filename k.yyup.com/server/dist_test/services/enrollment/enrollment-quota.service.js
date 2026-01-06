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
exports.EnrollmentQuotaService = void 0;
var sequelize_1 = require("sequelize");
var enrollment_quota_model_1 = require("../../models/enrollment-quota.model");
var enrollment_plan_model_1 = require("../../models/enrollment-plan.model");
var class_model_1 = require("../../models/class.model");
var init_1 = require("../../init");
/**
 * 招生名额状态枚举
 */
var QuotaStatus;
(function (QuotaStatus) {
    QuotaStatus[QuotaStatus["DISABLED"] = 0] = "DISABLED";
    QuotaStatus[QuotaStatus["ACTIVE"] = 1] = "ACTIVE";
    QuotaStatus[QuotaStatus["COMPLETED"] = 2] = "COMPLETED"; // 已结束
})(QuotaStatus || (QuotaStatus = {}));
/**
 * 班级类型枚举
 */
var ClassType;
(function (ClassType) {
    ClassType[ClassType["JUNIOR"] = 1] = "JUNIOR";
    ClassType[ClassType["MIDDLE"] = 2] = "MIDDLE";
    ClassType[ClassType["SENIOR"] = 3] = "SENIOR"; // 大班
})(ClassType || (ClassType = {}));
/**
 * 招生名额服务类
 * 处理招生名额的创建、查询、更新、删除以及名额分配、统计等操作
 */
var EnrollmentQuotaService = /** @class */ (function () {
    function EnrollmentQuotaService() {
    }
    /**
     * 创建招生名额
     * @param data 创建招生名额的数据传输对象
     * @returns 创建的招生名额
     */
    EnrollmentQuotaService.prototype.createQuota = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, plan, classEntity, existingQuota, quota;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            enrollment_plan_model_1.EnrollmentPlan.findByPk(data.planId),
                            class_model_1.Class.findByPk(data.classId)
                        ])];
                    case 1:
                        _a = _b.sent(), plan = _a[0], classEntity = _a[1];
                        if (!plan) {
                            throw new Error('招生计划不存在');
                        }
                        if (!classEntity) {
                            throw new Error('班级不存在');
                        }
                        return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findOne({
                                where: {
                                    planId: data.planId,
                                    classId: data.classId
                                }
                            })];
                    case 2:
                        existingQuota = _b.sent();
                        if (existingQuota) {
                            throw new Error('该班级在此招生计划中已有名额配置');
                        }
                        return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.create({
                                planId: data.planId,
                                classId: data.classId,
                                totalQuota: data.totalQuota,
                                usedQuota: data.usedQuota || 0,
                                reservedQuota: data.reservedQuota || 0,
                                remark: data.remark
                            })];
                    case 3:
                        quota = _b.sent();
                        return [2 /*return*/, this.formatQuotaResponse(quota)];
                }
            });
        });
    };
    /**
     * 获取招生名额详情
     * @param id 招生名额ID
     * @returns 招生名额详情
     */
    EnrollmentQuotaService.prototype.getQuotaById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var quota;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findByPk(id, {
                            include: [
                                { model: enrollment_plan_model_1.EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
                                { model: class_model_1.Class, as: 'class', attributes: ['id', 'name', 'grade'] }
                            ]
                        })];
                    case 1:
                        quota = _a.sent();
                        if (!quota) {
                            throw new Error('招生名额不存在');
                        }
                        return [2 /*return*/, this.formatQuotaResponse(quota)];
                }
            });
        });
    };
    /**
     * 更新招生名额
     * @param data 更新招生名额的数据传输对象
     * @returns 更新后的招生名额
     */
    EnrollmentQuotaService.prototype.updateQuota = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var quota, totalQuota, usedQuota, reservedQuota, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findByPk(data.id)];
                    case 1:
                        quota = _b.sent();
                        if (!quota) {
                            throw new Error('招生名额不存在');
                        }
                        totalQuota = data.totalQuota !== undefined ? data.totalQuota : quota.totalQuota;
                        usedQuota = data.usedQuota !== undefined ? data.usedQuota : quota.usedQuota;
                        reservedQuota = data.reservedQuota !== undefined ? data.reservedQuota : quota.reservedQuota;
                        if (usedQuota + reservedQuota > totalQuota) {
                            throw new Error('已使用名额和预留名额总和不能超过总名额');
                        }
                        // 更新名额
                        return [4 /*yield*/, quota.update({
                                totalQuota: totalQuota,
                                usedQuota: usedQuota,
                                reservedQuota: reservedQuota,
                                remark: data.remark !== undefined ? data.remark : quota.remark
                            })];
                    case 2:
                        // 更新名额
                        _b.sent();
                        _a = this.formatQuotaResponse;
                        return [4 /*yield*/, quota.reload({
                                include: [
                                    { model: enrollment_plan_model_1.EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
                                    { model: class_model_1.Class, as: 'class', attributes: ['id', 'name', 'grade'] }
                                ]
                            })];
                    case 3: return [2 /*return*/, _a.apply(this, [_b.sent()])];
                }
            });
        });
    };
    /**
     * 删除招生名额
     * @param id 招生名额ID
     * @returns 是否删除成功
     */
    EnrollmentQuotaService.prototype.deleteQuota = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var quota;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findByPk(id)];
                    case 1:
                        quota = _a.sent();
                        if (!quota) {
                            throw new Error('招生名额不存在');
                        }
                        // 检查是否有已使用的名额
                        if (quota.usedQuota > 0) {
                            throw new Error('该名额配置已被使用，无法删除');
                        }
                        return [4 /*yield*/, quota.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    /**
     * 获取招生名额列表
     * @param params 过滤参数
     * @returns 招生名额列表
     */
    EnrollmentQuotaService.prototype.getQuotaList = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, planId, classId, hasAvailable, _c, sortBy, _d, sortOrder, where, _e, count, rows, items;
            var _this = this;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = params.page, page = _a === void 0 ? 1 : _a, _b = params.pageSize, pageSize = _b === void 0 ? 10 : _b, planId = params.planId, classId = params.classId, hasAvailable = params.hasAvailable, _c = params.sortBy, sortBy = _c === void 0 ? 'id' : _c, _d = params.sortOrder, sortOrder = _d === void 0 ? 'ASC' : _d;
                        where = {};
                        if (planId !== undefined) {
                            where.planId = planId;
                        }
                        if (classId !== undefined) {
                            where.classId = classId;
                        }
                        if (hasAvailable === true) {
                            where[sequelize_1.Op.and] = init_1.sequelize.literal('total_quota > (used_quota + reserved_quota)');
                        }
                        return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findAndCountAll({
                                where: where,
                                include: [
                                    { model: enrollment_plan_model_1.EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
                                    { model: class_model_1.Class, as: 'class', attributes: ['id', 'name', 'grade'] }
                                ],
                                order: [[sortBy, sortOrder]],
                                limit: pageSize,
                                offset: (page - 1) * pageSize
                            })];
                    case 1:
                        _e = _f.sent(), count = _e.count, rows = _e.rows;
                        items = rows.map(function (quota) { return _this.formatQuotaResponse(quota); });
                        return [2 /*return*/, {
                                total: count,
                                items: items,
                                page: page,
                                pageSize: pageSize
                            }];
                }
            });
        });
    };
    /**
     * 分配招生名额
     * @param data 名额分配数据
     * @returns 更新后的招生名额
     */
    EnrollmentQuotaService.prototype.allocateQuota = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var quotaId, amount, type, applicantId, remark;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        quotaId = data.quotaId, amount = data.amount, type = data.type, applicantId = data.applicantId, remark = data.remark;
                        return [4 /*yield*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                var quota, _a, _b;
                                return __generator(this, function (_c) {
                                    switch (_c.label) {
                                        case 0: return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findByPk(quotaId, { transaction: transaction })];
                                        case 1:
                                            quota = _c.sent();
                                            if (!quota) {
                                                throw new Error('招生名额不存在');
                                            }
                                            _a = type;
                                            switch (_a) {
                                                case 'use': return [3 /*break*/, 2];
                                                case 'reserve': return [3 /*break*/, 4];
                                                case 'release': return [3 /*break*/, 6];
                                            }
                                            return [3 /*break*/, 8];
                                        case 2:
                                            if (quota.usedQuota + amount > quota.totalQuota - quota.reservedQuota) {
                                                throw new Error('可用名额不足');
                                            }
                                            return [4 /*yield*/, quota.update({
                                                    usedQuota: quota.usedQuota + amount
                                                }, { transaction: transaction })];
                                        case 3:
                                            _c.sent();
                                            return [3 /*break*/, 9];
                                        case 4:
                                            if (quota.reservedQuota + amount > quota.totalQuota - quota.usedQuota) {
                                                throw new Error('可预留名额不足');
                                            }
                                            return [4 /*yield*/, quota.update({
                                                    reservedQuota: quota.reservedQuota + amount
                                                }, { transaction: transaction })];
                                        case 5:
                                            _c.sent();
                                            return [3 /*break*/, 9];
                                        case 6:
                                            if (type === 'release' && amount > quota.reservedQuota) {
                                                throw new Error('释放的预留名额数量超过已预留数量');
                                            }
                                            return [4 /*yield*/, quota.update({
                                                    reservedQuota: quota.reservedQuota - amount
                                                }, { transaction: transaction })];
                                        case 7:
                                            _c.sent();
                                            return [3 /*break*/, 9];
                                        case 8: throw new Error('不支持的操作类型');
                                        case 9:
                                            _b = this.formatQuotaResponse;
                                            return [4 /*yield*/, quota.reload({
                                                    include: [
                                                        { model: enrollment_plan_model_1.EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
                                                        { model: class_model_1.Class, as: 'class', attributes: ['id', 'name', 'grade'] }
                                                    ],
                                                    transaction: transaction
                                                })];
                                        case 10: 
                                        // TODO: 记录名额操作日志，关联申请人等信息
                                        // 重新加载名额数据
                                        return [2 /*return*/, _b.apply(this, [_c.sent()])];
                                    }
                                });
                            }); })];
                    case 1: 
                    // 使用事务确保数据一致性
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 获取招生名额统计
     * @param planId 招生计划ID
     * @returns 招生名额统计信息
     */
    EnrollmentQuotaService.prototype.getQuotaStatistics = function (planId) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var plan, quotas, totalQuota, usedQuota, reservedQuota, classSummary, _i, quotas_1, quota, classData, availableQuota, utilizationRate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId)];
                    case 1:
                        plan = _b.sent();
                        if (!plan) {
                            throw new Error('招生计划不存在');
                        }
                        return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findAll({
                                where: { planId: planId },
                                include: [
                                    { model: class_model_1.Class, as: 'class', attributes: ['id', 'name', 'grade'] }
                                ]
                            })];
                    case 2:
                        quotas = _b.sent();
                        totalQuota = 0;
                        usedQuota = 0;
                        reservedQuota = 0;
                        classSummary = [];
                        // 处理每个班级的名额数据
                        for (_i = 0, quotas_1 = quotas; _i < quotas_1.length; _i++) {
                            quota = quotas_1[_i];
                            totalQuota += quota.totalQuota;
                            usedQuota += quota.usedQuota;
                            reservedQuota += quota.reservedQuota;
                            classData = {
                                classId: quota.classId,
                                className: ((_a = quota.get('class')) === null || _a === void 0 ? void 0 : _a.name) || '未知班级',
                                totalQuota: quota.totalQuota,
                                usedQuota: quota.usedQuota,
                                reservedQuota: quota.reservedQuota,
                                availableQuota: quota.totalQuota - quota.usedQuota - quota.reservedQuota,
                                utilizationRate: quota.totalQuota > 0 ? (quota.usedQuota / quota.totalQuota) * 100 : 0
                            };
                            classSummary.push(classData);
                        }
                        availableQuota = totalQuota - usedQuota - reservedQuota;
                        utilizationRate = totalQuota > 0 ? (usedQuota / totalQuota) * 100 : 0;
                        return [2 /*return*/, {
                                planId: planId,
                                planName: plan.title,
                                totalQuota: totalQuota,
                                usedQuota: usedQuota,
                                reservedQuota: reservedQuota,
                                availableQuota: availableQuota,
                                utilizationRate: utilizationRate,
                                classSummary: classSummary
                            }];
                }
            });
        });
    };
    /**
     * 批量调整招生名额
     * @param data 批量调整数据
     * @returns 是否调整成功
     */
    EnrollmentQuotaService.prototype.batchAdjustQuota = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, adjustments, remark;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        planId = data.planId, adjustments = data.adjustments, remark = data.remark;
                        return [4 /*yield*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                                var plan, _i, adjustments_1, adjustment, classId, amount, quota, classEntity, newTotal;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId, { transaction: transaction })];
                                        case 1:
                                            plan = _a.sent();
                                            if (!plan) {
                                                throw new Error('招生计划不存在');
                                            }
                                            _i = 0, adjustments_1 = adjustments;
                                            _a.label = 2;
                                        case 2:
                                            if (!(_i < adjustments_1.length)) return [3 /*break*/, 9];
                                            adjustment = adjustments_1[_i];
                                            classId = adjustment.classId, amount = adjustment.amount;
                                            return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findOne({
                                                    where: { planId: planId, classId: classId },
                                                    transaction: transaction
                                                })];
                                        case 3:
                                            quota = _a.sent();
                                            if (!!quota) return [3 /*break*/, 6];
                                            // 如果不存在，且调整量为正，则创建新记录
                                            if (amount <= 0) {
                                                throw new Error("\u73ED\u7EA7ID ".concat(classId, " \u6CA1\u6709\u540D\u989D\u914D\u7F6E\uFF0C\u65E0\u6CD5\u51CF\u5C11\u540D\u989D"));
                                            }
                                            return [4 /*yield*/, class_model_1.Class.findByPk(classId, { transaction: transaction })];
                                        case 4:
                                            classEntity = _a.sent();
                                            if (!classEntity) {
                                                throw new Error("\u73ED\u7EA7ID ".concat(classId, " \u4E0D\u5B58\u5728"));
                                            }
                                            // 创建新的名额记录
                                            return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.create({
                                                    planId: planId,
                                                    classId: classId,
                                                    totalQuota: amount,
                                                    usedQuota: 0,
                                                    reservedQuota: 0,
                                                    remark: remark
                                                }, { transaction: transaction })];
                                        case 5:
                                            // 创建新的名额记录
                                            _a.sent();
                                            return [3 /*break*/, 8];
                                        case 6:
                                            newTotal = quota.totalQuota + amount;
                                            // 检查调整后的总名额是否小于已使用和预留的名额
                                            if (newTotal < quota.usedQuota + quota.reservedQuota) {
                                                throw new Error("\u73ED\u7EA7ID ".concat(classId, " \u8C03\u6574\u540E\u7684\u603B\u540D\u989D\u5C0F\u4E8E\u5DF2\u4F7F\u7528\u548C\u9884\u7559\u7684\u540D\u989D\u603B\u548C"));
                                            }
                                            // 更新名额
                                            return [4 /*yield*/, quota.update({
                                                    totalQuota: newTotal,
                                                    remark: remark || quota.remark
                                                }, { transaction: transaction })];
                                        case 7:
                                            // 更新名额
                                            _a.sent();
                                            _a.label = 8;
                                        case 8:
                                            _i++;
                                            return [3 /*break*/, 2];
                                        case 9: 
                                        // TODO: 记录批量调整操作日志
                                        return [2 /*return*/, true];
                                    }
                                });
                            }); })];
                    case 1: 
                    // 使用事务确保数据一致性
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 按计划获取招生名额
     * @param planId 招生计划ID
     * @returns 该计划下的所有招生名额
     */
    EnrollmentQuotaService.prototype.getQuotasByPlan = function (planId) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, quotas;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId)];
                    case 1:
                        plan = _a.sent();
                        if (!plan) {
                            throw new Error('招生计划不存在');
                        }
                        return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findAll({
                                where: { planId: planId },
                                include: [
                                    { model: enrollment_plan_model_1.EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
                                    { model: class_model_1.Class, as: 'class', attributes: ['id', 'name', 'grade'] }
                                ],
                                order: [['classId', 'ASC']]
                            })];
                    case 2:
                        quotas = _a.sent();
                        return [2 /*return*/, quotas.map(function (quota) { return _this.formatQuotaResponse(quota); })];
                }
            });
        });
    };
    /**
     * 按班级获取招生名额
     * @param classId 班级ID
     * @returns 该班级的所有招生名额
     */
    EnrollmentQuotaService.prototype.getQuotasByClass = function (classId) {
        return __awaiter(this, void 0, void 0, function () {
            var classEntity, quotas;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, class_model_1.Class.findByPk(classId)];
                    case 1:
                        classEntity = _a.sent();
                        if (!classEntity) {
                            throw new Error('班级不存在');
                        }
                        return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findAll({
                                where: { classId: classId },
                                include: [
                                    { model: enrollment_plan_model_1.EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
                                    { model: class_model_1.Class, as: 'class', attributes: ['id', 'name', 'grade'] }
                                ],
                                order: [['planId', 'DESC']]
                            })];
                    case 2:
                        quotas = _a.sent();
                        return [2 /*return*/, quotas.map(function (quota) { return _this.formatQuotaResponse(quota); })];
                }
            });
        });
    };
    /**
     * 调整招生名额
     * @param id 名额ID
     * @param adjustment 调整数量（正数增加，负数减少）
     * @param reason 调整原因
     * @returns 调整后的招生名额
     */
    EnrollmentQuotaService.prototype.adjustQuota = function (id, adjustment, reason) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction(function (transaction) { return __awaiter(_this, void 0, void 0, function () {
                            var quota, newTotal, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0: return [4 /*yield*/, enrollment_quota_model_1.EnrollmentQuota.findByPk(id, { transaction: transaction })];
                                    case 1:
                                        quota = _b.sent();
                                        if (!quota) {
                                            throw new Error('招生名额不存在');
                                        }
                                        newTotal = quota.totalQuota + adjustment;
                                        // 检查调整后的总名额是否合理
                                        if (newTotal < 0) {
                                            throw new Error('调整后的总名额不能为负数');
                                        }
                                        if (newTotal < quota.usedQuota + quota.reservedQuota) {
                                            throw new Error('调整后的总名额不能小于已使用和预留的名额总和');
                                        }
                                        // 更新名额
                                        return [4 /*yield*/, quota.update({
                                                totalQuota: newTotal,
                                                remark: reason ? "".concat(quota.remark || '', "\n\u8C03\u6574\u539F\u56E0: ").concat(reason) : quota.remark
                                            }, { transaction: transaction })];
                                    case 2:
                                        // 更新名额
                                        _b.sent();
                                        _a = this.formatQuotaResponse;
                                        return [4 /*yield*/, quota.reload({
                                                include: [
                                                    { model: enrollment_plan_model_1.EnrollmentPlan, as: 'plan', attributes: ['id', 'title', 'year', 'semester'] },
                                                    { model: class_model_1.Class, as: 'class', attributes: ['id', 'name', 'grade'] }
                                                ],
                                                transaction: transaction
                                            })];
                                    case 3: 
                                    // TODO: 记录名额调整日志
                                    // 重新加载名额数据
                                    return [2 /*return*/, _a.apply(this, [_b.sent()])];
                                }
                            });
                        }); })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 格式化招生名额响应对象
     * @param quota 招生名额模型实例
     * @returns 格式化后的响应对象
     */
    EnrollmentQuotaService.prototype.formatQuotaResponse = function (quota) {
        var plan = quota.get('plan');
        var classEntity = quota.get('class');
        return {
            id: quota.id,
            planId: quota.planId,
            classId: quota.classId,
            totalQuota: quota.totalQuota,
            usedQuota: quota.usedQuota,
            reservedQuota: quota.reservedQuota,
            availableQuota: quota.totalQuota - quota.usedQuota - quota.reservedQuota,
            remark: quota.remark,
            createdAt: quota.createdAt.toISOString(),
            updatedAt: quota.updatedAt.toISOString(),
            plan: plan ? {
                id: plan.id,
                name: plan.title,
                year: plan.year,
                term: plan.semester === enrollment_plan_model_1.Semester.SPRING ? '春季' : '秋季'
            } : undefined,
            "class": classEntity ? {
                id: classEntity.id,
                name: classEntity.name,
                grade: classEntity.grade
            } : undefined
        };
    };
    return EnrollmentQuotaService;
}());
exports.EnrollmentQuotaService = EnrollmentQuotaService;
