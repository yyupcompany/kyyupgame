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
exports.EnrollmentPlanService = void 0;
/**
 * 招生计划服务
 * 处理与招生计划相关的业务逻辑
 */
var enrollment_plan_model_1 = require("../../models/enrollment-plan.model");
var enrollment_plan_class_model_1 = require("../../models/enrollment-plan-class.model");
var enrollment_plan_assignee_model_1 = require("../../models/enrollment-plan-assignee.model");
var enrollment_plan_tracking_model_1 = require("../../models/enrollment-plan-tracking.model");
var user_model_1 = require("../../models/user.model");
var class_model_1 = require("../../models/class.model");
var apiError_1 = require("../../utils/apiError");
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var EnrollmentPlanService = /** @class */ (function () {
    function EnrollmentPlanService() {
    }
    /**
     * 创建招生计划
     * @param data 招生计划数据
     * @param userId 当前用户ID
     * @returns 创建的招生计划
     */
    EnrollmentPlanService.prototype.create = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, existingPlan, plan_1, classIds_1, classAssociations, assigneeAssociations, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 10, , 12]);
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findOne({
                                where: {
                                    year: data.year,
                                    semester: data.term === '春季' ? enrollment_plan_model_1.Semester.SPRING : enrollment_plan_model_1.Semester.AUTUMN // 将term转换为semester
                                },
                                transaction: transaction
                            })];
                    case 3:
                        existingPlan = _a.sent();
                        if (existingPlan) {
                            throw apiError_1.ApiError.badRequest("".concat(data.year, "\u5E74").concat(data.term, "\u5DF2\u6709\u62DB\u751F\u8BA1\u5212"), 'PLAN_EXISTS');
                        }
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.create({
                                title: data.name,
                                year: data.year,
                                semester: data.term === '春季' ? enrollment_plan_model_1.Semester.SPRING : enrollment_plan_model_1.Semester.AUTUMN,
                                startDate: new Date(data.startDate),
                                endDate: new Date(data.endDate),
                                targetCount: data.targetCount,
                                status: data.status === 'draft' ? enrollment_plan_model_1.EnrollmentPlanStatus.DRAFT :
                                    (data.status === 'active' ? enrollment_plan_model_1.EnrollmentPlanStatus.IN_PROGRESS :
                                        (data.status === 'completed' ? enrollment_plan_model_1.EnrollmentPlanStatus.FINISHED : enrollment_plan_model_1.EnrollmentPlanStatus.CANCELLED)),
                                description: data.description,
                                creatorId: userId,
                                kindergartenId: 1 // 默认值，实际应从上下文获取
                            }, { transaction: transaction })];
                    case 4:
                        plan_1 = _a.sent();
                        classIds_1 = data.classIds || [];
                        if (!(classIds_1.length > 0)) return [3 /*break*/, 6];
                        classAssociations = classIds_1.map(function (classId) { return ({
                            planId: plan_1.id,
                            classId: classId,
                            quota: Math.floor(data.targetCount / classIds_1.length) // 平均分配名额
                        }); });
                        return [4 /*yield*/, enrollment_plan_class_model_1.EnrollmentPlanClass.bulkCreate(classAssociations, { transaction: transaction })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!(data.assigneeIds && data.assigneeIds.length > 0)) return [3 /*break*/, 8];
                        assigneeAssociations = data.assigneeIds.map(function (assigneeId, index) { return ({
                            planId: plan_1.id,
                            assigneeId: assigneeId,
                            role: index === 0 ? 'primary' : 'secondary' // 第一个为主负责人
                        }); });
                        return [4 /*yield*/, enrollment_plan_assignee_model_1.EnrollmentPlanAssignee.bulkCreate(assigneeAssociations, { transaction: transaction })];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [4 /*yield*/, transaction.commit()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/, plan_1];
                    case 10:
                        error_1 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 11:
                        _a.sent();
                        if (error_1 instanceof apiError_1.ApiError) {
                            throw error_1;
                        }
                        throw apiError_1.ApiError.serverError('创建招生计划失败', 'PLAN_CREATE_ERROR');
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生计划列表
     * @param filters 过滤参数
     * @returns 招生计划列表和分页信息
     */
    EnrollmentPlanService.prototype.list = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, keyword, year, term, status, startDateFrom, startDateTo, endDateFrom, endDateTo, _c, sortBy, _d, sortOrder, offset, limit, where, order, _e, count, rows, items;
            var _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _a = filters.page, page = _a === void 0 ? 1 : _a, _b = filters.pageSize, pageSize = _b === void 0 ? 10 : _b, keyword = filters.keyword, year = filters.year, term = filters.term, status = filters.status, startDateFrom = filters.startDateFrom, startDateTo = filters.startDateTo, endDateFrom = filters.endDateFrom, endDateTo = filters.endDateTo, _c = filters.sortBy, sortBy = _c === void 0 ? 'createdAt' : _c, _d = filters.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        where = {
                            deletedAt: null // 只查询未删除的记录
                        };
                        if (keyword) {
                            where.title = (_f = {}, _f[sequelize_1.Op.like] = "%".concat(keyword, "%"), _f);
                        }
                        if (year) {
                            where.year = year;
                        }
                        if (term) {
                            where.semester = term === '春季' ? enrollment_plan_model_1.Semester.SPRING : enrollment_plan_model_1.Semester.AUTUMN; // 将term转换为semester
                        }
                        if (status) {
                            where.status = status === 'draft' ? enrollment_plan_model_1.EnrollmentPlanStatus.DRAFT :
                                (status === 'active' ? enrollment_plan_model_1.EnrollmentPlanStatus.IN_PROGRESS :
                                    (status === 'completed' ? enrollment_plan_model_1.EnrollmentPlanStatus.FINISHED : enrollment_plan_model_1.EnrollmentPlanStatus.CANCELLED)); // 状态转换
                        }
                        // 开始日期范围查询
                        if (startDateFrom || startDateTo) {
                            where.startDate = {};
                            if (startDateFrom) {
                                where.startDate[sequelize_1.Op.gte] = startDateFrom;
                            }
                            if (startDateTo) {
                                where.startDate[sequelize_1.Op.lte] = startDateTo;
                            }
                        }
                        // 结束日期范围查询
                        if (endDateFrom || endDateTo) {
                            where.endDate = {};
                            if (endDateFrom) {
                                where.endDate[sequelize_1.Op.gte] = endDateFrom;
                            }
                            if (endDateTo) {
                                where.endDate[sequelize_1.Op.lte] = endDateTo;
                            }
                        }
                        order = [[sortBy, sortOrder]];
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findAndCountAll({
                                where: where,
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'name']
                                    }
                                ],
                                offset: offset,
                                limit: limit,
                                order: order,
                                distinct: true
                            })];
                    case 1:
                        _e = _g.sent(), count = _e.count, rows = _e.rows;
                        items = rows.map(function (item) {
                            var planItem = item.get({ plain: true });
                            // 计算完成率 - 这里需要从跟踪记录中获取实际招生人数
                            var completionRate = planItem.targetCount > 0
                                ? 0 // 暂时设为0，实际应从跟踪记录计算
                                : 0;
                            return __assign(__assign({}, planItem), { name: planItem.title, term: planItem.semester === enrollment_plan_model_1.Semester.SPRING ? '春季' : '秋季', status: planItem.status === enrollment_plan_model_1.EnrollmentPlanStatus.DRAFT ? 'draft' :
                                    (planItem.status === enrollment_plan_model_1.EnrollmentPlanStatus.IN_PROGRESS ? 'active' :
                                        (planItem.status === enrollment_plan_model_1.EnrollmentPlanStatus.FINISHED ? 'completed' : 'cancelled')), startDate: planItem.startDate.toISOString().split('T')[0], endDate: planItem.endDate.toISOString().split('T')[0], actualCount: 0, // 暂时设为0，实际应从跟踪记录计算
                                completionRate: completionRate, createdAt: planItem.createdAt ? planItem.createdAt.toISOString() : '', updatedAt: planItem.updatedAt ? planItem.updatedAt.toISOString() : '' });
                        });
                        return [2 /*return*/, {
                                total: count,
                                items: items,
                                page: Number(page),
                                pageSize: Number(pageSize)
                            }];
                }
            });
        });
    };
    /**
     * 获取招生计划详情
     * @param id 招生计划ID
     * @returns 招生计划详情
     */
    EnrollmentPlanService.prototype.detail = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, planData, actualCount, completionRate, statistics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(id, {
                            include: [
                                {
                                    model: user_model_1.User,
                                    as: 'creator',
                                    attributes: ['id', 'name']
                                },
                                {
                                    model: class_model_1.Class,
                                    as: 'classes',
                                    attributes: ['id', 'name'],
                                    through: { attributes: [] }
                                },
                                {
                                    model: user_model_1.User,
                                    as: 'assignees',
                                    attributes: ['id', 'name'],
                                    through: { attributes: [] }
                                }
                            ]
                        })];
                    case 1:
                        plan = _a.sent();
                        if (!plan) {
                            throw apiError_1.ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
                        }
                        planData = plan.get({ plain: true });
                        actualCount = 0;
                        completionRate = planData.targetCount > 0
                            ? Math.round((actualCount / planData.targetCount) * 100)
                            : 0;
                        statistics = {
                            totalApplications: 0,
                            approvedApplications: 0,
                            rejectedApplications: 0,
                            pendingApplications: 0,
                            conversionRate: 0
                        };
                        return [2 /*return*/, __assign(__assign({}, planData), { name: planData.title, term: planData.semester === enrollment_plan_model_1.Semester.SPRING ? '春季' : '秋季', status: planData.status === enrollment_plan_model_1.EnrollmentPlanStatus.DRAFT ? 'draft' :
                                    (planData.status === enrollment_plan_model_1.EnrollmentPlanStatus.IN_PROGRESS ? 'active' :
                                        (planData.status === enrollment_plan_model_1.EnrollmentPlanStatus.FINISHED ? 'completed' : 'cancelled')), startDate: planData.startDate.toISOString().split('T')[0], endDate: planData.endDate.toISOString().split('T')[0], actualCount: actualCount, completionRate: completionRate, statistics: statistics, createdAt: planData.createdAt ? planData.createdAt.toISOString() : '', updatedAt: planData.updatedAt ? planData.updatedAt.toISOString() : '', classIds: plan.classes ? plan.classes.map(function (c) { return c.id; }) : [], assigneeIds: plan.assignees ? plan.assignees.map(function (a) { return a.id; }) : [] })];
                }
            });
        });
    };
    /**
     * 更新招生计划
     * @param id 招生计划ID
     * @param data 更新的招生计划数据
     * @returns 更新后的招生计划
     */
    EnrollmentPlanService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, plan_2, existingPlan, updateData, classIds_2, classAssociations, assigneeAssociations, error_2;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 14, , 16]);
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(id, { transaction: transaction })];
                    case 3:
                        plan_2 = _b.sent();
                        if (!plan_2) {
                            throw apiError_1.ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
                        }
                        // 如果计划已完成或已取消，不允许修改
                        if (plan_2.status === enrollment_plan_model_1.EnrollmentPlanStatus.FINISHED || plan_2.status === enrollment_plan_model_1.EnrollmentPlanStatus.CANCELLED) {
                            throw apiError_1.ApiError.badRequest('已完成或已取消的计划不能修改', 'PLAN_NOT_EDITABLE');
                        }
                        if (!((data.year && data.year !== plan_2.year) || (data.term && (data.term === '春季' ? enrollment_plan_model_1.Semester.SPRING : enrollment_plan_model_1.Semester.AUTUMN) !== plan_2.semester))) return [3 /*break*/, 5];
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findOne({
                                where: {
                                    year: data.year || plan_2.year,
                                    semester: data.term ? (data.term === '春季' ? enrollment_plan_model_1.Semester.SPRING : enrollment_plan_model_1.Semester.AUTUMN) : plan_2.semester,
                                    id: (_a = {}, _a[sequelize_1.Op.ne] = id, _a)
                                },
                                transaction: transaction
                            })];
                    case 4:
                        existingPlan = _b.sent();
                        if (existingPlan) {
                            throw apiError_1.ApiError.badRequest("".concat(data.year || plan_2.year, "\u5E74").concat(data.term || (plan_2.semester === enrollment_plan_model_1.Semester.SPRING ? '春季' : '秋季'), "\u5DF2\u6709\u62DB\u751F\u8BA1\u5212"), 'PLAN_EXISTS');
                        }
                        _b.label = 5;
                    case 5:
                        updateData = {};
                        if (data.name !== undefined)
                            updateData.title = data.name;
                        if (data.year !== undefined)
                            updateData.year = data.year;
                        if (data.term !== undefined)
                            updateData.semester = data.term === '春季' ? enrollment_plan_model_1.Semester.SPRING : enrollment_plan_model_1.Semester.AUTUMN;
                        if (data.startDate !== undefined)
                            updateData.startDate = new Date(data.startDate);
                        if (data.endDate !== undefined)
                            updateData.endDate = new Date(data.endDate);
                        if (data.targetCount !== undefined)
                            updateData.targetCount = data.targetCount;
                        if (data.status !== undefined) {
                            updateData.status = data.status === 'draft' ? enrollment_plan_model_1.EnrollmentPlanStatus.DRAFT :
                                (data.status === 'active' ? enrollment_plan_model_1.EnrollmentPlanStatus.IN_PROGRESS :
                                    (data.status === 'completed' ? enrollment_plan_model_1.EnrollmentPlanStatus.FINISHED : enrollment_plan_model_1.EnrollmentPlanStatus.CANCELLED));
                        }
                        if (data.description !== undefined)
                            updateData.description = data.description;
                        return [4 /*yield*/, plan_2.update(updateData, { transaction: transaction })];
                    case 6:
                        _b.sent();
                        if (!data.classIds) return [3 /*break*/, 9];
                        // 删除原有关联
                        return [4 /*yield*/, enrollment_plan_class_model_1.EnrollmentPlanClass.destroy({
                                where: { planId: id },
                                transaction: transaction
                            })];
                    case 7:
                        // 删除原有关联
                        _b.sent();
                        classIds_2 = data.classIds || [];
                        if (!(classIds_2.length > 0)) return [3 /*break*/, 9];
                        classAssociations = classIds_2.map(function (classId) { return ({
                            planId: id,
                            classId: classId,
                            quota: Math.floor((data.targetCount || plan_2.targetCount) / classIds_2.length) // 平均分配名额
                        }); });
                        return [4 /*yield*/, enrollment_plan_class_model_1.EnrollmentPlanClass.bulkCreate(classAssociations, { transaction: transaction })];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        if (!data.assigneeIds) return [3 /*break*/, 12];
                        // 删除原有关联
                        return [4 /*yield*/, enrollment_plan_assignee_model_1.EnrollmentPlanAssignee.destroy({
                                where: { planId: id },
                                transaction: transaction
                            })];
                    case 10:
                        // 删除原有关联
                        _b.sent();
                        if (!(data.assigneeIds.length > 0)) return [3 /*break*/, 12];
                        assigneeAssociations = data.assigneeIds.map(function (assigneeId, index) { return ({
                            planId: id,
                            assigneeId: assigneeId,
                            role: index === 0 ? 'primary' : 'secondary' // 第一个为主负责人
                        }); });
                        return [4 /*yield*/, enrollment_plan_assignee_model_1.EnrollmentPlanAssignee.bulkCreate(assigneeAssociations, { transaction: transaction })];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12: return [4 /*yield*/, transaction.commit()];
                    case 13:
                        _b.sent();
                        return [2 /*return*/, plan_2];
                    case 14:
                        error_2 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 15:
                        _b.sent();
                        if (error_2 instanceof apiError_1.ApiError) {
                            throw error_2;
                        }
                        throw apiError_1.ApiError.serverError('更新招生计划失败', 'PLAN_UPDATE_ERROR');
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除招生计划
     * @param id 招生计划ID
     * @returns 是否删除成功
     */
    EnrollmentPlanService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 7]);
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.destroy({ where: { id: id }, transaction: transaction })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 5:
                        error_3 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 6:
                        _a.sent();
                        throw apiError_1.ApiError.serverError('删除招生计划失败', 'PLAN_DELETE_ERROR');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置招生计划班级
     * @param data 班级关联数据
     * @returns 是否设置成功
     */
    EnrollmentPlanService.prototype.setClasses = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, planId_1, classIds_3, plan_3, classCount, classAssociations, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 10]);
                        planId_1 = data.planId, classIds_3 = data.classIds;
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId_1, { transaction: transaction })];
                    case 3:
                        plan_3 = _b.sent();
                        if (!plan_3) {
                            throw apiError_1.ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
                        }
                        return [4 /*yield*/, class_model_1.Class.count({
                                where: { id: (_a = {}, _a[sequelize_1.Op["in"]] = classIds_3, _a) },
                                transaction: transaction
                            })];
                    case 4:
                        classCount = _b.sent();
                        if (classCount !== classIds_3.length) {
                            throw apiError_1.ApiError.badRequest('部分班级不存在', 'CLASS_NOT_FOUND');
                        }
                        // 删除原有关联
                        return [4 /*yield*/, enrollment_plan_class_model_1.EnrollmentPlanClass.destroy({
                                where: { planId: planId_1 },
                                transaction: transaction
                            })];
                    case 5:
                        // 删除原有关联
                        _b.sent();
                        classAssociations = classIds_3.map(function (classId) { return ({
                            planId: planId_1,
                            classId: classId,
                            quota: Math.floor(plan_3.targetCount / classIds_3.length) // 平均分配名额
                        }); });
                        return [4 /*yield*/, enrollment_plan_class_model_1.EnrollmentPlanClass.bulkCreate(classAssociations, { transaction: transaction })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 8:
                        error_4 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 9:
                        _b.sent();
                        if (error_4 instanceof apiError_1.ApiError) {
                            throw error_4;
                        }
                        throw apiError_1.ApiError.serverError('设置招生计划班级失败', 'SET_CLASSES_ERROR');
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置招生计划负责人
     * @param data 负责人关联数据
     * @returns 是否设置成功
     */
    EnrollmentPlanService.prototype.setAssignees = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, planId_2, assigneeIds, plan, userCount, assigneeAssociations, error_5;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 8, , 10]);
                        planId_2 = data.planId, assigneeIds = data.assigneeIds;
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId_2, { transaction: transaction })];
                    case 3:
                        plan = _b.sent();
                        if (!plan) {
                            throw apiError_1.ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
                        }
                        return [4 /*yield*/, user_model_1.User.count({
                                where: { id: (_a = {}, _a[sequelize_1.Op["in"]] = assigneeIds, _a) },
                                transaction: transaction
                            })];
                    case 4:
                        userCount = _b.sent();
                        if (userCount !== assigneeIds.length) {
                            throw apiError_1.ApiError.badRequest('部分用户不存在', 'USER_NOT_FOUND');
                        }
                        // 删除原有关联
                        return [4 /*yield*/, enrollment_plan_assignee_model_1.EnrollmentPlanAssignee.destroy({
                                where: { planId: planId_2 },
                                transaction: transaction
                            })];
                    case 5:
                        // 删除原有关联
                        _b.sent();
                        assigneeAssociations = assigneeIds.map(function (assigneeId, index) { return ({
                            planId: planId_2,
                            assigneeId: assigneeId,
                            role: index === 0 ? 'primary' : 'secondary' // 第一个为主负责人
                        }); });
                        return [4 /*yield*/, enrollment_plan_assignee_model_1.EnrollmentPlanAssignee.bulkCreate(assigneeAssociations, { transaction: transaction })];
                    case 6:
                        _b.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 7:
                        _b.sent();
                        return [2 /*return*/, true];
                    case 8:
                        error_5 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 9:
                        _b.sent();
                        if (error_5 instanceof apiError_1.ApiError) {
                            throw error_5;
                        }
                        throw apiError_1.ApiError.serverError('设置招生计划负责人失败', 'SET_ASSIGNEES_ERROR');
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生计划完成统计
     * @param id 招生计划ID
     * @returns 招生计划统计数据
     */
    EnrollmentPlanService.prototype.getStatistics = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var plan, trackings, dailyMap_1, sourceMap_1, totalCount_1, dailyStatistics, accumulatedCount, _i, _a, _b, date, count, weeklyMap_1, weeklyStatistics, _c, _d, weekData, sourceStatistics, _e, _f, _g, source, count, completionRate, error_6;
            return __generator(this, function (_h) {
                switch (_h.label) {
                    case 0:
                        _h.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(id)];
                    case 1:
                        plan = _h.sent();
                        if (!plan) {
                            throw apiError_1.ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
                        }
                        return [4 /*yield*/, enrollment_plan_tracking_model_1.EnrollmentPlanTracking.findAll({
                                where: { planId: id },
                                order: [['date', 'ASC']]
                            })];
                    case 2:
                        trackings = _h.sent();
                        dailyMap_1 = new Map();
                        sourceMap_1 = new Map();
                        totalCount_1 = 0;
                        trackings.forEach(function (tracking) {
                            var dateStr = tracking.date.toISOString().split('T')[0];
                            var count = tracking.count;
                            // 累计每日数据
                            totalCount_1 += count;
                            // 累计日统计
                            if (dailyMap_1.has(dateStr)) {
                                dailyMap_1.set(dateStr, dailyMap_1.get(dateStr) + count);
                            }
                            else {
                                dailyMap_1.set(dateStr, count);
                            }
                            // 累计来源统计
                            if (sourceMap_1.has(tracking.source)) {
                                sourceMap_1.set(tracking.source, sourceMap_1.get(tracking.source) + count);
                            }
                            else {
                                sourceMap_1.set(tracking.source, count);
                            }
                        });
                        dailyStatistics = [];
                        accumulatedCount = 0;
                        for (_i = 0, _a = dailyMap_1.entries(); _i < _a.length; _i++) {
                            _b = _a[_i], date = _b[0], count = _b[1];
                            accumulatedCount += count;
                            dailyStatistics.push({
                                date: date,
                                count: count,
                                accumulatedCount: accumulatedCount
                            });
                        }
                        weeklyMap_1 = new Map();
                        dailyStatistics.forEach(function (daily) {
                            var date = new Date(daily.date);
                            var weekStart = new Date(date);
                            weekStart.setDate(date.getDate() - date.getDay()); // 获取周日
                            var weekEnd = new Date(weekStart);
                            weekEnd.setDate(weekStart.getDate() + 6); // 获取周六
                            var weekKey = "".concat(weekStart.toISOString().split('T')[0], "~").concat(weekEnd.toISOString().split('T')[0]);
                            if (weeklyMap_1.has(weekKey)) {
                                var weekData = weeklyMap_1.get(weekKey);
                                weekData.count += daily.count;
                            }
                            else {
                                weeklyMap_1.set(weekKey, {
                                    weekStart: weekStart.toISOString().split('T')[0],
                                    weekEnd: weekEnd.toISOString().split('T')[0],
                                    count: daily.count
                                });
                            }
                        });
                        weeklyStatistics = [];
                        accumulatedCount = 0;
                        for (_c = 0, _d = weeklyMap_1.values(); _c < _d.length; _c++) {
                            weekData = _d[_c];
                            accumulatedCount += weekData.count;
                            weeklyStatistics.push(__assign(__assign({}, weekData), { accumulatedCount: accumulatedCount }));
                        }
                        sourceStatistics = [];
                        for (_e = 0, _f = sourceMap_1.entries(); _e < _f.length; _e++) {
                            _g = _f[_e], source = _g[0], count = _g[1];
                            sourceStatistics.push({
                                source: source,
                                count: count,
                                percentage: totalCount_1 > 0 ? Math.round((count / totalCount_1) * 100) : 0
                            });
                        }
                        completionRate = plan.targetCount > 0
                            ? Math.round((totalCount_1 / plan.targetCount) * 100)
                            : 0;
                        return [2 /*return*/, {
                                planId: id,
                                planName: plan.title,
                                targetCount: plan.targetCount,
                                actualCount: totalCount_1,
                                completionRate: completionRate,
                                dailyStatistics: dailyStatistics,
                                weeklyStatistics: weeklyStatistics,
                                sourceStatistics: sourceStatistics
                            }];
                    case 3:
                        error_6 = _h.sent();
                        if (error_6 instanceof apiError_1.ApiError) {
                            throw error_6;
                        }
                        throw apiError_1.ApiError.serverError('获取招生计划统计失败', 'GET_STATISTICS_ERROR');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取招生计划执行跟踪记录
     * @param filters 过滤参数
     * @returns 执行跟踪记录列表
     */
    EnrollmentPlanService.prototype.getTrackings = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var planId, _a, page, _b, pageSize, startDate, endDate, assigneeId, _c, sortBy, _d, sortOrder, offset, limit, where, order, _e, count, rows, items;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        planId = filters.planId, _a = filters.page, page = _a === void 0 ? 1 : _a, _b = filters.pageSize, pageSize = _b === void 0 ? 10 : _b, startDate = filters.startDate, endDate = filters.endDate, assigneeId = filters.assigneeId, _c = filters.sortBy, sortBy = _c === void 0 ? 'date' : _c, _d = filters.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                        offset = (Number(page) - 1) * Number(pageSize);
                        limit = Number(pageSize);
                        where = { planId: planId };
                        // 日期范围查询
                        if (startDate || endDate) {
                            where.date = {};
                            if (startDate) {
                                where.date[sequelize_1.Op.gte] = startDate;
                            }
                            if (endDate) {
                                where.date[sequelize_1.Op.lte] = endDate;
                            }
                        }
                        if (assigneeId) {
                            where.assigneeId = assigneeId;
                        }
                        order = [[sortBy, sortOrder]];
                        return [4 /*yield*/, enrollment_plan_tracking_model_1.EnrollmentPlanTracking.findAndCountAll({
                                where: where,
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'assignee',
                                        attributes: ['id', 'name']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'creator',
                                        attributes: ['id', 'name']
                                    }
                                ],
                                offset: offset,
                                limit: limit,
                                order: order
                            })];
                    case 1:
                        _e = _f.sent(), count = _e.count, rows = _e.rows;
                        items = rows.map(function (item) {
                            var trackingItem = item.get({ plain: true });
                            return __assign(__assign({}, trackingItem), { date: trackingItem.date.toISOString().split('T')[0], createdAt: trackingItem.createdAt.toISOString(), updatedAt: trackingItem.updatedAt.toISOString() });
                        });
                        return [2 /*return*/, {
                                total: count,
                                items: items,
                                page: Number(page),
                                pageSize: Number(pageSize)
                            }];
                }
            });
        });
    };
    /**
     * 添加招生计划执行跟踪记录
     * @param planId 招生计划ID
     * @param data 跟踪记录数据
     * @param userId 当前用户ID
     * @returns 添加的跟踪记录
     */
    EnrollmentPlanService.prototype.addTracking = function (planId, data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, plan, tracking, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, enrollment_plan_model_1.EnrollmentPlan.findByPk(planId, { transaction: transaction })];
                    case 3:
                        plan = _a.sent();
                        if (!plan) {
                            throw apiError_1.ApiError.notFound('招生计划不存在', 'PLAN_NOT_FOUND');
                        }
                        // 检查招生计划状态
                        if (plan.status !== enrollment_plan_model_1.EnrollmentPlanStatus.IN_PROGRESS) { // 1表示'active'状态
                            throw apiError_1.ApiError.badRequest('只有进行中的招生计划才能添加跟踪记录', 'PLAN_NOT_ACTIVE');
                        }
                        return [4 /*yield*/, enrollment_plan_tracking_model_1.EnrollmentPlanTracking.create({
                                planId: planId,
                                date: data.date,
                                count: data.count,
                                source: data.source,
                                assigneeId: data.assigneeId,
                                remark: data.remark,
                                createdBy: userId
                            }, { transaction: transaction })];
                    case 4:
                        tracking = _a.sent();
                        // 注意：不再维护appliedCount字段，通过关联查询获取申请数量
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        // 注意：不再维护appliedCount字段，通过关联查询获取申请数量
                        _a.sent();
                        return [2 /*return*/, tracking];
                    case 6:
                        error_7 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        if (error_7 instanceof apiError_1.ApiError) {
                            throw error_7;
                        }
                        throw apiError_1.ApiError.serverError('添加跟踪记录失败', 'ADD_TRACKING_ERROR');
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return EnrollmentPlanService;
}());
exports.EnrollmentPlanService = EnrollmentPlanService;
