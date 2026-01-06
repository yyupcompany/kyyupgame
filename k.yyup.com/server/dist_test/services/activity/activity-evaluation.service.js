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
exports.ActivityEvaluationService = void 0;
var sequelize_1 = require("sequelize");
var activity_evaluation_model_1 = require("../../models/activity-evaluation.model");
var activity_model_1 = require("../../models/activity.model");
var activity_registration_model_1 = require("../../models/activity-registration.model");
var parent_model_1 = require("../../models/parent.model");
var teacher_model_1 = require("../../models/teacher.model");
var logger_1 = require("../../utils/logger");
/**
 * 活动评价服务类
 *
 * 提供活动评价相关的业务逻辑处理
 */
var ActivityEvaluationService = /** @class */ (function () {
    function ActivityEvaluationService() {
    }
    /**
     * 创建活动评价
     * @param {Object} data - 评价数据
     * @param {number} userId - 创建用户ID
     * @returns {Promise<ActivityEvaluation>} 创建的评价对象
     */
    ActivityEvaluationService.prototype.createEvaluation = function (data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var activity, registration, existingEvaluation, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(data.activityId)];
                    case 1:
                        activity = _a.sent();
                        if (!activity) {
                            throw new Error('活动不存在');
                        }
                        if (!data.registrationId) return [3 /*break*/, 4];
                        return [4 /*yield*/, activity_registration_model_1.ActivityRegistration.findByPk(data.registrationId)];
                    case 2:
                        registration = _a.sent();
                        if (!registration) {
                            throw new Error('报名记录不存在');
                        }
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findOne({
                                where: { registrationId: data.registrationId }
                            })];
                    case 3:
                        existingEvaluation = _a.sent();
                        if (existingEvaluation) {
                            throw new Error('该报名记录已有评价，不能重复评价');
                        }
                        _a.label = 4;
                    case 4: return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.create(__assign(__assign({}, data), { evaluationTime: new Date(), status: 1, creatorId: userId, updaterId: userId }))];
                    case 5: 
                    // 创建评价记录
                    return [2 /*return*/, _a.sent()];
                    case 6:
                        error_1 = _a.sent();
                        logger_1.logger.error("\u521B\u5EFA\u6D3B\u52A8\u8BC4\u4EF7\u5931\u8D25: ".concat(error_1.message), { userId: userId, data: data });
                        throw error_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取评价详情
     * @param {number} id - 评价ID
     * @returns {Promise<ActivityEvaluation>} 评价对象
     */
    ActivityEvaluationService.prototype.getEvaluationById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var evaluation, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findByPk(id, {
                                include: [
                                    { model: activity_model_1.Activity, as: 'activity' },
                                    { model: activity_registration_model_1.ActivityRegistration, as: 'registration' },
                                    { model: parent_model_1.Parent, as: 'parent' },
                                    { model: teacher_model_1.Teacher, as: 'teacher' }
                                ]
                            })];
                    case 1:
                        evaluation = _a.sent();
                        if (!evaluation) {
                            throw new Error('评价不存在');
                        }
                        return [2 /*return*/, evaluation];
                    case 2:
                        error_2 = _a.sent();
                        logger_1.logger.error("\u83B7\u53D6\u8BC4\u4EF7\u8BE6\u60C5\u5931\u8D25: ".concat(error_2.message), { id: id });
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新评价
     * @param {number} id - 评价ID
     * @param {Object} data - 更新数据
     * @param {number} userId - 更新用户ID
     * @returns {Promise<ActivityEvaluation>} 更新后的评价对象
     */
    ActivityEvaluationService.prototype.updateEvaluation = function (id, data, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var evaluation, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findByPk(id)];
                    case 1:
                        evaluation = _a.sent();
                        if (!evaluation) {
                            throw new Error('评价不存在');
                        }
                        // 检查是否有权限更新
                        if (evaluation.creatorId !== userId && !data.isAdmin) {
                            throw new Error('无权限更新此评价');
                        }
                        // 更新评价
                        return [4 /*yield*/, evaluation.update(__assign(__assign({}, data), { updaterId: userId }))];
                    case 2:
                        // 更新评价
                        _a.sent();
                        return [4 /*yield*/, this.getEvaluationById(id)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_3 = _a.sent();
                        logger_1.logger.error("\u66F4\u65B0\u8BC4\u4EF7\u5931\u8D25: ".concat(error_3.message), { id: id, userId: userId, data: data });
                        throw error_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除评价
     * @param {number} id - 评价ID
     * @param {number} userId - 删除用户ID
     * @param {boolean} isAdmin - 是否为管理员
     * @returns {Promise<boolean>} 删除结果
     */
    ActivityEvaluationService.prototype.deleteEvaluation = function (id, userId, isAdmin) {
        if (isAdmin === void 0) { isAdmin = false; }
        return __awaiter(this, void 0, void 0, function () {
            var evaluation, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findByPk(id)];
                    case 1:
                        evaluation = _a.sent();
                        if (!evaluation) {
                            throw new Error('评价不存在');
                        }
                        // 检查是否有权限删除
                        if (evaluation.creatorId !== userId && !isAdmin) {
                            throw new Error('无权限删除此评价');
                        }
                        return [4 /*yield*/, evaluation.destroy()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_4 = _a.sent();
                        logger_1.logger.error("\u5220\u9664\u8BC4\u4EF7\u5931\u8D25: ".concat(error_4.message), { id: id, userId: userId });
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 回复评价
     * @param {number} id - 评价ID
     * @param {string} content - 回复内容
     * @param {number} userId - 回复用户ID
     * @returns {Promise<ActivityEvaluation>} 更新后的评价对象
     */
    ActivityEvaluationService.prototype.replyEvaluation = function (id, content, userId) {
        return __awaiter(this, void 0, void 0, function () {
            var evaluation, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findByPk(id)];
                    case 1:
                        evaluation = _a.sent();
                        if (!evaluation) {
                            throw new Error('评价不存在');
                        }
                        return [4 /*yield*/, evaluation.reply(content, userId)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getEvaluationById(id)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        error_5 = _a.sent();
                        logger_1.logger.error("\u56DE\u590D\u8BC4\u4EF7\u5931\u8D25: ".concat(error_5.message), { id: id, userId: userId });
                        throw error_5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取评价列表
     * @param {Object} query - 查询条件
     * @returns {Promise<{rows: ActivityEvaluation[], count: number}>} 评价列表和总数
     */
    ActivityEvaluationService.prototype.getEvaluations = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, limit, activityId, parentId, teacherId, registrationId, evaluatorType, minRating, maxRating, status_1, isPublic, startDate, endDate, _c, sortBy, _d, sortOrder, offset, where, endDateTime, _e, rows, count, error_6;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        _a = query.page, page = _a === void 0 ? 1 : _a, _b = query.limit, limit = _b === void 0 ? 10 : _b, activityId = query.activityId, parentId = query.parentId, teacherId = query.teacherId, registrationId = query.registrationId, evaluatorType = query.evaluatorType, minRating = query.minRating, maxRating = query.maxRating, status_1 = query.status, isPublic = query.isPublic, startDate = query.startDate, endDate = query.endDate, _c = query.sortBy, sortBy = _c === void 0 ? 'createdAt' : _c, _d = query.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                        offset = (page - 1) * limit;
                        where = {};
                        if (activityId)
                            where.activityId = activityId;
                        if (parentId)
                            where.parentId = parentId;
                        if (teacherId)
                            where.teacherId = teacherId;
                        if (registrationId)
                            where.registrationId = registrationId;
                        if (evaluatorType)
                            where.evaluatorType = evaluatorType;
                        if (status_1)
                            where.status = status_1;
                        if (isPublic !== undefined)
                            where.isPublic = isPublic;
                        // 评分范围过滤
                        if (minRating !== undefined || maxRating !== undefined) {
                            where.overallRating = {};
                            if (minRating !== undefined)
                                where.overallRating[sequelize_1.Op.gte] = minRating;
                            if (maxRating !== undefined)
                                where.overallRating[sequelize_1.Op.lte] = maxRating;
                        }
                        // 日期范围过滤
                        if (startDate || endDate) {
                            where.evaluationTime = {};
                            if (startDate)
                                where.evaluationTime[sequelize_1.Op.gte] = new Date(startDate);
                            if (endDate) {
                                endDateTime = new Date(endDate);
                                endDateTime.setHours(23, 59, 59, 999);
                                where.evaluationTime[sequelize_1.Op.lte] = endDateTime;
                            }
                        }
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findAndCountAll({
                                where: where,
                                include: [
                                    { model: activity_model_1.Activity, as: 'activity' },
                                    { model: activity_registration_model_1.ActivityRegistration, as: 'registration' }
                                ],
                                order: [[sortBy, sortOrder]],
                                limit: limit,
                                offset: offset,
                                distinct: true
                            })];
                    case 1:
                        _e = _f.sent(), rows = _e.rows, count = _e.count;
                        return [2 /*return*/, { rows: rows, count: count }];
                    case 2:
                        error_6 = _f.sent();
                        logger_1.logger.error("\u83B7\u53D6\u8BC4\u4EF7\u5217\u8868\u5931\u8D25: ".concat(error_6.message), { query: query });
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动评价统计
     * @param {number} activityId - 活动ID
     * @returns {Promise<Object>} 统计结果
     */
    ActivityEvaluationService.prototype.getEvaluationStatistics = function (activityId) {
        return __awaiter(this, void 0, void 0, function () {
            var activity, evaluations, totalCount_1, overallRatingSum_1, contentRatingSum_1, organizationRatingSum_1, environmentRatingSum_1, serviceRatingSum_1, contentRatingCount_1, organizationRatingCount_1, environmentRatingCount_1, serviceRatingCount_1, ratingDistribution_1, averageOverallRating, averageContentRating, averageOrganizationRating, averageEnvironmentRating, averageServiceRating, ratingPercentages_1, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(activityId)];
                    case 1:
                        activity = _a.sent();
                        if (!activity) {
                            throw new Error('活动不存在');
                        }
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findAll({
                                where: { activityId: activityId }
                            })];
                    case 2:
                        evaluations = _a.sent();
                        totalCount_1 = evaluations.length;
                        overallRatingSum_1 = 0;
                        contentRatingSum_1 = 0;
                        organizationRatingSum_1 = 0;
                        environmentRatingSum_1 = 0;
                        serviceRatingSum_1 = 0;
                        contentRatingCount_1 = 0;
                        organizationRatingCount_1 = 0;
                        environmentRatingCount_1 = 0;
                        serviceRatingCount_1 = 0;
                        ratingDistribution_1 = {
                            5: 0,
                            4: 0,
                            3: 0,
                            2: 0,
                            1: 0 // 1星
                        };
                        evaluations.forEach(function (evaluation) {
                            // 总体评分
                            overallRatingSum_1 += evaluation.overallRating;
                            var rating = evaluation.overallRating;
                            if (rating >= 1 && rating <= 5) {
                                ratingDistribution_1[rating] = (ratingDistribution_1[rating] || 0) + 1;
                            }
                            // 内容评分
                            if (evaluation.contentRating !== null) {
                                contentRatingSum_1 += evaluation.contentRating;
                                contentRatingCount_1++;
                            }
                            // 组织评分
                            if (evaluation.organizationRating !== null) {
                                organizationRatingSum_1 += evaluation.organizationRating;
                                organizationRatingCount_1++;
                            }
                            // 环境评分
                            if (evaluation.environmentRating !== null) {
                                environmentRatingSum_1 += evaluation.environmentRating;
                                environmentRatingCount_1++;
                            }
                            // 服务评分
                            if (evaluation.serviceRating !== null) {
                                serviceRatingSum_1 += evaluation.serviceRating;
                                serviceRatingCount_1++;
                            }
                        });
                        averageOverallRating = totalCount_1 > 0 ? Math.round((overallRatingSum_1 / totalCount_1) * 10) / 10 : 0;
                        averageContentRating = contentRatingCount_1 > 0 ? Math.round((contentRatingSum_1 / contentRatingCount_1) * 10) / 10 : 0;
                        averageOrganizationRating = organizationRatingCount_1 > 0 ? Math.round((organizationRatingSum_1 / organizationRatingCount_1) * 10) / 10 : 0;
                        averageEnvironmentRating = environmentRatingCount_1 > 0 ? Math.round((environmentRatingSum_1 / environmentRatingCount_1) * 10) / 10 : 0;
                        averageServiceRating = serviceRatingCount_1 > 0 ? Math.round((serviceRatingSum_1 / serviceRatingCount_1) * 10) / 10 : 0;
                        ratingPercentages_1 = {};
                        Object.keys(ratingDistribution_1).forEach(function (rating) {
                            var ratingKey = rating;
                            ratingPercentages_1[rating] = totalCount_1 > 0
                                ? Math.round((ratingDistribution_1[ratingKey] / totalCount_1) * 1000) / 10
                                : 0;
                        });
                        return [2 /*return*/, {
                                totalCount: totalCount_1,
                                averageRatings: {
                                    overall: averageOverallRating,
                                    content: averageContentRating,
                                    organization: averageOrganizationRating,
                                    environment: averageEnvironmentRating,
                                    service: averageServiceRating
                                },
                                ratingDistribution: ratingDistribution_1,
                                ratingPercentages: ratingPercentages_1
                            }];
                    case 3:
                        error_7 = _a.sent();
                        logger_1.logger.error("\u83B7\u53D6\u6D3B\u52A8\u8BC4\u4EF7\u7EDF\u8BA1\u5931\u8D25: ".concat(error_7.message), { activityId: activityId });
                        throw error_7;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成满意度报表
     * @param {Object} query - 查询条件
     * @returns {Promise<Object>} 满意度报表数据
     */
    ActivityEvaluationService.prototype.generateSatisfactionReport = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var startDate, endDate, kindergartenId, where, endDateTime, include, evaluations, monthlySatisfaction, activityTypeSatisfaction, _i, evaluations_1, evaluation, activity, month, activityType, totalCount, totalRating, overallAverage, ratingDistribution_2, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 7, , 8]);
                        startDate = query.startDate, endDate = query.endDate, kindergartenId = query.kindergartenId;
                        where = {};
                        // 日期范围过滤
                        if (startDate || endDate) {
                            where.evaluationTime = {};
                            if (startDate)
                                where.evaluationTime[sequelize_1.Op.gte] = new Date(startDate);
                            if (endDate) {
                                endDateTime = new Date(endDate);
                                endDateTime.setHours(23, 59, 59, 999);
                                where.evaluationTime[sequelize_1.Op.lte] = endDateTime;
                            }
                        }
                        include = [
                            {
                                model: activity_model_1.Activity,
                                as: 'activity',
                                where: kindergartenId ? { kindergartenId: kindergartenId } : {}
                            }
                        ];
                        return [4 /*yield*/, activity_evaluation_model_1.ActivityEvaluation.findAll({
                                where: where,
                                include: include
                            })];
                    case 1:
                        evaluations = _a.sent();
                        monthlySatisfaction = {};
                        activityTypeSatisfaction = {};
                        _i = 0, evaluations_1 = evaluations;
                        _a.label = 2;
                    case 2:
                        if (!(_i < evaluations_1.length)) return [3 /*break*/, 6];
                        evaluation = evaluations_1[_i];
                        if (!!evaluation.activity) return [3 /*break*/, 4];
                        return [4 /*yield*/, evaluation.reload({ include: [{ model: activity_model_1.Activity, as: 'activity' }] })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        activity = evaluation.activity;
                        if (!activity)
                            return [3 /*break*/, 5];
                        month = "".concat(evaluation.evaluationTime.getFullYear(), "-").concat(String(evaluation.evaluationTime.getMonth() + 1).padStart(2, '0'));
                        if (!monthlySatisfaction[month]) {
                            monthlySatisfaction[month] = {
                                totalRating: 0,
                                count: 0,
                                average: 0
                            };
                        }
                        monthlySatisfaction[month].totalRating += evaluation.overallRating;
                        monthlySatisfaction[month].count += 1;
                        monthlySatisfaction[month].average = Math.round((monthlySatisfaction[month].totalRating / monthlySatisfaction[month].count) * 10) / 10;
                        activityType = activity.activityType;
                        if (!activityTypeSatisfaction[activityType]) {
                            activityTypeSatisfaction[activityType] = {
                                totalRating: 0,
                                count: 0,
                                average: 0
                            };
                        }
                        activityTypeSatisfaction[activityType].totalRating += evaluation.overallRating;
                        activityTypeSatisfaction[activityType].count += 1;
                        activityTypeSatisfaction[activityType].average = Math.round((activityTypeSatisfaction[activityType].totalRating / activityTypeSatisfaction[activityType].count) * 10) / 10;
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 2];
                    case 6:
                        totalCount = evaluations.length;
                        totalRating = evaluations.reduce(function (sum, evaluation) { return sum + evaluation.overallRating; }, 0);
                        overallAverage = totalCount > 0 ? Math.round((totalRating / totalCount) * 10) / 10 : 0;
                        ratingDistribution_2 = {
                            5: 0,
                            4: 0,
                            3: 0,
                            2: 0,
                            1: 0 // 1星
                        };
                        evaluations.forEach(function (evaluation) {
                            var rating = evaluation.overallRating;
                            if (rating >= 1 && rating <= 5) {
                                ratingDistribution_2[rating] = (ratingDistribution_2[rating] || 0) + 1;
                            }
                        });
                        return [2 /*return*/, {
                                overallSatisfaction: {
                                    average: overallAverage,
                                    totalCount: totalCount
                                },
                                monthlySatisfaction: monthlySatisfaction,
                                activityTypeSatisfaction: activityTypeSatisfaction,
                                ratingDistribution: ratingDistribution_2
                            }];
                    case 7:
                        error_8 = _a.sent();
                        logger_1.logger.error("\u751F\u6210\u6EE1\u610F\u5EA6\u62A5\u8868\u5931\u8D25: ".concat(error_8.message), { query: query });
                        throw error_8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    return ActivityEvaluationService;
}());
exports.ActivityEvaluationService = ActivityEvaluationService;
// 默认导出活动评价服务实例
exports["default"] = new ActivityEvaluationService();
