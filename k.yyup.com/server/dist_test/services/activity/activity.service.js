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
exports.activityService = exports.ActivityService = void 0;
var activity_model_1 = require("../../models/activity.model");
var activity_share_model_1 = require("../../models/activity-share.model");
var init_1 = require("../../init");
var sequelize_1 = require("sequelize");
var apiError_1 = require("../../utils/apiError");
var kindergarten_model_1 = require("../../models/kindergarten.model");
var user_model_1 = require("../../models/user.model");
var ActivityService = /** @class */ (function () {
    function ActivityService() {
    }
    /**
     * 创建活动
     */
    ActivityService.prototype.createActivity = function (dto, creatorId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var transaction, kindergarten, startTime, endTime, regStartTime, regEndTime, activity, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, kindergarten_model_1.Kindergarten.findByPk(dto.kindergartenId, { transaction: transaction })];
                    case 3:
                        kindergarten = _c.sent();
                        if (!kindergarten) {
                            throw apiError_1.ApiError.notFound('指定的幼儿园不存在');
                        }
                        startTime = new Date(dto.startTime);
                        endTime = new Date(dto.endTime);
                        regStartTime = new Date(dto.registrationStartTime);
                        regEndTime = new Date(dto.registrationEndTime);
                        if (startTime >= endTime) {
                            throw apiError_1.ApiError.badRequest('活动结束时间必须晚于开始时间');
                        }
                        if (regStartTime >= regEndTime) {
                            throw apiError_1.ApiError.badRequest('报名结束时间必须晚于报名开始时间');
                        }
                        if (regEndTime > startTime) {
                            throw apiError_1.ApiError.badRequest('报名必须在活动开始前结束');
                        }
                        return [4 /*yield*/, activity_model_1.Activity.create(__assign(__assign({}, dto), { startTime: new Date(dto.startTime), endTime: new Date(dto.endTime), registrationStartTime: new Date(dto.registrationStartTime), registrationEndTime: new Date(dto.registrationEndTime), registeredCount: 0, checkedInCount: 0, fee: dto.fee || 0, needsApproval: (_a = dto.needsApproval) !== null && _a !== void 0 ? _a : false, status: (_b = dto.status) !== null && _b !== void 0 ? _b : activity_model_1.ActivityStatus.PLANNED, creatorId: creatorId, updaterId: creatorId }), { transaction: transaction })];
                    case 4:
                        activity = _c.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _c.sent();
                        return [2 /*return*/, this.getActivityById(activity.id)];
                    case 6:
                        error_1 = _c.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _c.sent();
                        throw error_1;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动列表
     */
    ActivityService.prototype.getActivities = function (filters) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, page, _b, pageSize, keyword, kindergartenId, planId, activityType, status, startDate, endDate, _c, sortBy, _d, sortOrder, safePage, safePageSize, conditions, replacements, whereClause, countQuery, countResult, total, offset, dataQuery, rows;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _a = filters.page, page = _a === void 0 ? 1 : _a, _b = filters.pageSize, pageSize = _b === void 0 ? 10 : _b, keyword = filters.keyword, kindergartenId = filters.kindergartenId, planId = filters.planId, activityType = filters.activityType, status = filters.status, startDate = filters.startDate, endDate = filters.endDate, _c = filters.sortBy, sortBy = _c === void 0 ? 'created_at' : _c, _d = filters.sortOrder, sortOrder = _d === void 0 ? 'DESC' : _d;
                        safePage = Math.max(1, parseInt(String(page), 10) || 1);
                        safePageSize = Math.max(1, Math.min(100, parseInt(String(pageSize), 10) || 10));
                        conditions = ['a.deleted_at IS NULL'];
                        replacements = {};
                        if (keyword) {
                            conditions.push('(a.title LIKE :keyword OR a.description LIKE :keyword)');
                            replacements.keyword = "%".concat(keyword, "%");
                        }
                        if (kindergartenId) {
                            conditions.push('a.kindergarten_id = :kindergartenId');
                            replacements.kindergartenId = kindergartenId;
                        }
                        if (planId !== undefined && !isNaN(planId)) {
                            conditions.push('a.plan_id = :planId');
                            replacements.planId = planId;
                        }
                        if (activityType !== undefined && !isNaN(activityType)) {
                            conditions.push('a.activity_type = :activityType');
                            replacements.activityType = activityType;
                        }
                        if (status !== undefined && !isNaN(status)) {
                            conditions.push('a.status = :status');
                            replacements.status = status;
                        }
                        if (startDate) {
                            conditions.push('DATE(a.start_time) >= :startDate');
                            replacements.startDate = startDate;
                        }
                        if (endDate) {
                            conditions.push('DATE(a.start_time) <= :endDate');
                            replacements.endDate = endDate;
                        }
                        whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                        countQuery = "\n      SELECT COUNT(*) as total\n      FROM activities a\n      ".concat(whereClause, "\n    ");
                        return [4 /*yield*/, init_1.sequelize.query(countQuery, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResult = (_e.sent())[0];
                        total = parseInt(countResult.total) || 0;
                        offset = (safePage - 1) * safePageSize;
                        dataQuery = "\n      SELECT \n        a.*,\n        k.name as kindergarten_name,\n        u.real_name as creator_name\n      FROM activities a\n      LEFT JOIN kindergartens k ON a.kindergarten_id = k.id\n      LEFT JOIN users u ON a.creator_id = u.id\n      ".concat(whereClause, "\n      ORDER BY a.").concat(sortBy, " ").concat(sortOrder, "\n      LIMIT :limit OFFSET :offset\n    ");
                        return [4 /*yield*/, init_1.sequelize.query(dataQuery, {
                                replacements: __assign(__assign({}, replacements), { limit: safePageSize, offset: offset }),
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        rows = _e.sent();
                        return [2 /*return*/, { rows: rows, count: total }];
                }
            });
        });
    };
    /**
     * 获取活动详情
     */
    ActivityService.prototype.getActivityById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var query, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        query = "\n      SELECT\n        a.id,\n        a.kindergarten_id,\n        a.plan_id,\n        a.title,\n        a.activity_type,\n        a.cover_image,\n        a.start_time as startTime,\n        a.end_time as endTime,\n        a.location,\n        a.capacity,\n        a.registered_count,\n        a.checked_in_count,\n        a.fee,\n        a.description,\n        a.agenda,\n        a.registration_start_time as registrationStartTime,\n        a.registration_end_time as registrationEndTime,\n        a.needs_approval,\n        a.status,\n        a.remark,\n        a.creator_id,\n        a.updater_id,\n        a.poster_id,\n        a.poster_url,\n        a.share_poster_url,\n        a.marketing_config,\n        a.publish_status,\n        a.share_count,\n        a.view_count,\n        a.created_at as createdAt,\n        a.updated_at as updatedAt,\n        a.deleted_at,\n        k.name as kindergarten_name,\n        u.real_name as creator_name\n      FROM activities a\n      LEFT JOIN kindergartens k ON a.kindergarten_id = k.id\n      LEFT JOIN users u ON a.creator_id = u.id\n      WHERE a.id = :id AND a.deleted_at IS NULL\n    ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        results = _a.sent();
                        if (results.length === 0) {
                            throw apiError_1.ApiError.notFound('活动不存在');
                        }
                        return [2 /*return*/, results[0]];
                }
            });
        });
    };
    /**
     * 更新活动信息
     */
    ActivityService.prototype.updateActivity = function (id, dto, updaterId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, activity, startTime, endTime, updateData, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(id, { transaction: transaction })];
                    case 3:
                        activity = _a.sent();
                        if (!activity || activity.deletedAt) {
                            throw apiError_1.ApiError.notFound('活动不存在');
                        }
                        // 验证时间逻辑（如果更新了时间字段）
                        if (dto.startTime || dto.endTime) {
                            startTime = new Date(dto.startTime || activity.startTime);
                            endTime = new Date(dto.endTime || activity.endTime);
                            if (startTime >= endTime) {
                                throw apiError_1.ApiError.badRequest('活动结束时间必须晚于开始时间');
                            }
                        }
                        updateData = {
                            updaterId: updaterId,
                            updatedAt: new Date()
                        };
                        // 只更新提供的字段
                        if (dto.title !== undefined)
                            updateData.title = dto.title;
                        if (dto.activityType !== undefined)
                            updateData.activityType = dto.activityType;
                        if (dto.startTime !== undefined)
                            updateData.startTime = new Date(dto.startTime);
                        if (dto.endTime !== undefined)
                            updateData.endTime = new Date(dto.endTime);
                        if (dto.location !== undefined)
                            updateData.location = dto.location;
                        if (dto.capacity !== undefined)
                            updateData.capacity = dto.capacity;
                        if (dto.fee !== undefined)
                            updateData.fee = dto.fee;
                        if (dto.description !== undefined)
                            updateData.description = dto.description;
                        if (dto.agenda !== undefined)
                            updateData.agenda = dto.agenda;
                        if (dto.registrationStartTime !== undefined)
                            updateData.registrationStartTime = new Date(dto.registrationStartTime);
                        if (dto.registrationEndTime !== undefined)
                            updateData.registrationEndTime = new Date(dto.registrationEndTime);
                        if (dto.needsApproval !== undefined)
                            updateData.needsApproval = dto.needsApproval;
                        if (dto.remark !== undefined)
                            updateData.remark = dto.remark;
                        // 更新活动
                        return [4 /*yield*/, activity.update(updateData, { transaction: transaction })];
                    case 4:
                        // 更新活动
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _a.sent();
                        return [2 /*return*/, this.getActivityById(id)];
                    case 6:
                        error_2 = _a.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _a.sent();
                        throw error_2;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除活动（软删除）
     */
    ActivityService.prototype.deleteActivity = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, activity, registrationCount, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 7, , 9]);
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(id, { transaction: transaction })];
                    case 3:
                        activity = _a.sent();
                        if (!activity || activity.deletedAt) {
                            throw apiError_1.ApiError.notFound('活动不存在');
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as count \n        FROM activity_registrations \n        WHERE activity_id = :activityId AND deleted_at IS NULL\n      ", {
                                replacements: { activityId: id },
                                type: sequelize_1.QueryTypes.SELECT,
                                transaction: transaction
                            })];
                    case 4:
                        registrationCount = (_a.sent())[0];
                        if (parseInt(registrationCount.count) > 0) {
                            throw apiError_1.ApiError.badRequest('该活动已有报名记录，无法删除');
                        }
                        // 软删除
                        return [4 /*yield*/, activity.update({
                                deletedAt: new Date()
                            }, { transaction: transaction })];
                    case 5:
                        // 软删除
                        _a.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 9];
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
     * 更新活动状态
     */
    ActivityService.prototype.updateActivityStatus = function (id, status, updaterId) {
        return __awaiter(this, void 0, void 0, function () {
            var transaction, activity, currentStatus, validTransitions, error_4;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, init_1.sequelize.transaction()];
                    case 1:
                        transaction = _b.sent();
                        _b.label = 2;
                    case 2:
                        _b.trys.push([2, 6, , 8]);
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(id, { transaction: transaction })];
                    case 3:
                        activity = _b.sent();
                        if (!activity || activity.deletedAt) {
                            throw apiError_1.ApiError.notFound('活动不存在');
                        }
                        currentStatus = activity.status;
                        validTransitions = (_a = {},
                            _a[activity_model_1.ActivityStatus.PLANNED] = [activity_model_1.ActivityStatus.REGISTRATION_OPEN, activity_model_1.ActivityStatus.CANCELLED],
                            _a[activity_model_1.ActivityStatus.REGISTRATION_OPEN] = [activity_model_1.ActivityStatus.FULL, activity_model_1.ActivityStatus.IN_PROGRESS, activity_model_1.ActivityStatus.CANCELLED],
                            _a[activity_model_1.ActivityStatus.FULL] = [activity_model_1.ActivityStatus.IN_PROGRESS, activity_model_1.ActivityStatus.CANCELLED],
                            _a[activity_model_1.ActivityStatus.IN_PROGRESS] = [activity_model_1.ActivityStatus.FINISHED],
                            _a[activity_model_1.ActivityStatus.FINISHED] = [],
                            _a[activity_model_1.ActivityStatus.CANCELLED] = [],
                            _a);
                        if (!validTransitions[currentStatus].includes(status)) {
                            throw apiError_1.ApiError.badRequest("\u65E0\u6CD5\u4ECE\u72B6\u6001 ".concat(currentStatus, " \u8F6C\u6362\u5230 ").concat(status));
                        }
                        return [4 /*yield*/, activity.update({
                                status: status,
                                updaterId: updaterId,
                                updatedAt: new Date()
                            }, { transaction: transaction })];
                    case 4:
                        _b.sent();
                        return [4 /*yield*/, transaction.commit()];
                    case 5:
                        _b.sent();
                        return [2 /*return*/, this.getActivityById(id)];
                    case 6:
                        error_4 = _b.sent();
                        return [4 /*yield*/, transaction.rollback()];
                    case 7:
                        _b.sent();
                        throw error_4;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动统计信息
     */
    ActivityService.prototype.getActivityStatistics = function (kindergartenId) {
        return __awaiter(this, void 0, void 0, function () {
            var conditions, replacements, whereClause, query, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conditions = ['deleted_at IS NULL'];
                        replacements = {};
                        if (kindergartenId) {
                            conditions.push('kindergarten_id = :kindergartenId');
                            replacements.kindergartenId = kindergartenId;
                        }
                        whereClause = conditions.length > 0 ? "WHERE ".concat(conditions.join(' AND ')) : '';
                        query = "\n      SELECT \n        COUNT(*) as total_activities,\n        SUM(CASE WHEN status = ".concat(activity_model_1.ActivityStatus.PLANNED, " THEN 1 ELSE 0 END) as planned,\n        SUM(CASE WHEN status = ").concat(activity_model_1.ActivityStatus.REGISTRATION_OPEN, " THEN 1 ELSE 0 END) as registration_open,\n        SUM(CASE WHEN status = ").concat(activity_model_1.ActivityStatus.FULL, " THEN 1 ELSE 0 END) as full,\n        SUM(CASE WHEN status = ").concat(activity_model_1.ActivityStatus.IN_PROGRESS, " THEN 1 ELSE 0 END) as in_progress,\n        SUM(CASE WHEN status = ").concat(activity_model_1.ActivityStatus.FINISHED, " THEN 1 ELSE 0 END) as finished,\n        SUM(CASE WHEN status = ").concat(activity_model_1.ActivityStatus.CANCELLED, " THEN 1 ELSE 0 END) as cancelled,\n        SUM(registered_count) as total_registrations,\n        SUM(checked_in_count) as total_check_ins,\n        AVG(CASE WHEN capacity > 0 THEN (registered_count * 100.0 / capacity) ELSE 0 END) as avg_registration_rate\n      FROM activities\n      ").concat(whereClause, "\n    ");
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        result = (_a.sent())[0];
                        return [2 /*return*/, {
                                totalActivities: parseInt(result.total_activities) || 0,
                                statusDistribution: {
                                    planned: parseInt(result.planned) || 0,
                                    registrationOpen: parseInt(result.registration_open) || 0,
                                    full: parseInt(result.full) || 0,
                                    inProgress: parseInt(result.in_progress) || 0,
                                    finished: parseInt(result.finished) || 0,
                                    cancelled: parseInt(result.cancelled) || 0
                                },
                                totalRegistrations: parseInt(result.total_registrations) || 0,
                                totalCheckIns: parseInt(result.total_check_ins) || 0,
                                avgRegistrationRate: parseFloat(result.avg_registration_rate) || 0
                            }];
                }
            });
        });
    };
    /**
     * 创建活动分享记录
     */
    ActivityService.prototype.createActivityShare = function (shareData) {
        return __awaiter(this, void 0, void 0, function () {
            var share;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, activity_share_model_1.ActivityShare.create({
                            activityId: shareData.activityId,
                            posterId: shareData.posterId,
                            shareChannel: shareData.shareChannel,
                            shareUrl: shareData.shareUrl,
                            sharerId: shareData.sharerId,
                            parentSharerId: shareData.parentSharerId,
                            shareLevel: shareData.shareLevel || 1,
                            shareIp: shareData.shareIp
                        })];
                    case 1:
                        share = _a.sent();
                        // 更新活动分享次数
                        return [4 /*yield*/, this.incrementShareCount(shareData.activityId)];
                    case 2:
                        // 更新活动分享次数
                        _a.sent();
                        return [2 /*return*/, share];
                }
            });
        });
    };
    /**
     * 获取用户对某活动的最新分享记录
     */
    ActivityService.prototype.getLatestShareByUser = function (activityId, userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, activity_share_model_1.ActivityShare.findOne({
                            where: {
                                activityId: activityId,
                                sharerId: userId
                            },
                            order: [['createdAt', 'DESC']]
                        })];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * 查询分享层级关系
     * 返回指定用户的分享树（包含下级1-3级分享者）
     */
    ActivityService.prototype.getShareHierarchy = function (activityId, userId) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userShare, level1Shares, level1SharerIds, level2Shares, _c, level2SharerIds, level3Shares, _d;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0: return [4 /*yield*/, activity_share_model_1.ActivityShare.findOne({
                            where: {
                                activityId: activityId,
                                sharerId: userId
                            },
                            include: [
                                {
                                    model: user_model_1.User,
                                    as: 'sharer',
                                    attributes: ['id', 'username', 'realName', 'phone']
                                }
                            ],
                            order: [['createdAt', 'DESC']]
                        })];
                    case 1:
                        userShare = _e.sent();
                        if (!userShare) {
                            return [2 /*return*/, {
                                    user: null,
                                    shareLevel: 0,
                                    totalShares: 0,
                                    level1Shares: [],
                                    level2Shares: [],
                                    level3Shares: []
                                }];
                        }
                        return [4 /*yield*/, activity_share_model_1.ActivityShare.findAll({
                                where: {
                                    activityId: activityId,
                                    parentSharerId: userId,
                                    shareLevel: userShare.shareLevel + 1
                                },
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'sharer',
                                        attributes: ['id', 'username', 'realName', 'phone']
                                    }
                                ],
                                order: [['createdAt', 'DESC']]
                            })];
                    case 2:
                        level1Shares = _e.sent();
                        level1SharerIds = level1Shares.map(function (s) { return s.sharerId; });
                        if (!(level1SharerIds.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, activity_share_model_1.ActivityShare.findAll({
                                where: {
                                    activityId: activityId,
                                    parentSharerId: level1SharerIds,
                                    shareLevel: userShare.shareLevel + 2
                                },
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'sharer',
                                        attributes: ['id', 'username', 'realName', 'phone']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'parentSharer',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ],
                                order: [['createdAt', 'DESC']]
                            })];
                    case 3:
                        _c = _e.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        _c = [];
                        _e.label = 5;
                    case 5:
                        level2Shares = _c;
                        level2SharerIds = level2Shares.map(function (s) { return s.sharerId; });
                        if (!(level2SharerIds.length > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, activity_share_model_1.ActivityShare.findAll({
                                where: {
                                    activityId: activityId,
                                    parentSharerId: level2SharerIds,
                                    shareLevel: userShare.shareLevel + 3
                                },
                                include: [
                                    {
                                        model: user_model_1.User,
                                        as: 'sharer',
                                        attributes: ['id', 'username', 'realName', 'phone']
                                    },
                                    {
                                        model: user_model_1.User,
                                        as: 'parentSharer',
                                        attributes: ['id', 'username', 'realName']
                                    }
                                ],
                                order: [['createdAt', 'DESC']]
                            })];
                    case 6:
                        _d = _e.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        _d = [];
                        _e.label = 8;
                    case 8:
                        level3Shares = _d;
                        return [2 /*return*/, {
                                user: {
                                    id: userShare.sharerId,
                                    username: (_a = userShare.sharer) === null || _a === void 0 ? void 0 : _a.username,
                                    realName: (_b = userShare.sharer) === null || _b === void 0 ? void 0 : _b.realName,
                                    shareLevel: userShare.shareLevel,
                                    shareTime: userShare.createdAt
                                },
                                shareLevel: userShare.shareLevel,
                                totalShares: level1Shares.length + level2Shares.length + level3Shares.length,
                                level1Shares: level1Shares.map(function (s) {
                                    var _a, _b, _c;
                                    return ({
                                        id: s.id,
                                        sharerId: s.sharerId,
                                        username: (_a = s.sharer) === null || _a === void 0 ? void 0 : _a.username,
                                        realName: (_b = s.sharer) === null || _b === void 0 ? void 0 : _b.realName,
                                        phone: (_c = s.sharer) === null || _c === void 0 ? void 0 : _c.phone,
                                        shareChannel: s.shareChannel,
                                        shareTime: s.createdAt,
                                        shareLevel: s.shareLevel
                                    });
                                }),
                                level2Shares: level2Shares.map(function (s) {
                                    var _a, _b, _c, _d, _e;
                                    return ({
                                        id: s.id,
                                        sharerId: s.sharerId,
                                        username: (_a = s.sharer) === null || _a === void 0 ? void 0 : _a.username,
                                        realName: (_b = s.sharer) === null || _b === void 0 ? void 0 : _b.realName,
                                        phone: (_c = s.sharer) === null || _c === void 0 ? void 0 : _c.phone,
                                        parentSharerId: s.parentSharerId,
                                        parentSharerName: ((_d = s.parentSharer) === null || _d === void 0 ? void 0 : _d.realName) || ((_e = s.parentSharer) === null || _e === void 0 ? void 0 : _e.username),
                                        shareChannel: s.shareChannel,
                                        shareTime: s.createdAt,
                                        shareLevel: s.shareLevel
                                    });
                                }),
                                level3Shares: level3Shares.map(function (s) {
                                    var _a, _b, _c, _d, _e;
                                    return ({
                                        id: s.id,
                                        sharerId: s.sharerId,
                                        username: (_a = s.sharer) === null || _a === void 0 ? void 0 : _a.username,
                                        realName: (_b = s.sharer) === null || _b === void 0 ? void 0 : _b.realName,
                                        phone: (_c = s.sharer) === null || _c === void 0 ? void 0 : _c.phone,
                                        parentSharerId: s.parentSharerId,
                                        parentSharerName: ((_d = s.parentSharer) === null || _d === void 0 ? void 0 : _d.realName) || ((_e = s.parentSharer) === null || _e === void 0 ? void 0 : _e.username),
                                        shareChannel: s.shareChannel,
                                        shareTime: s.createdAt,
                                        shareLevel: s.shareLevel
                                    });
                                })
                            }];
                }
            });
        });
    };
    /**
     * 增加活动分享次数
     */
    ActivityService.prototype.incrementShareCount = function (activityId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, activity_model_1.Activity.increment('shareCount', {
                            where: { id: activityId }
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成分享二维码
     */
    ActivityService.prototype.generateShareQrcode = function (shareUrl) {
        return __awaiter(this, void 0, void 0, function () {
            var QRCode, fs, path, qrCodeDataUrl, base64Data, fileName, filePath, dir, baseUrl, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        QRCode = require('qrcode');
                        fs = require('fs');
                        path = require('path');
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, QRCode.toDataURL(shareUrl, {
                                width: 200,
                                margin: 2,
                                color: {
                                    dark: '#000000',
                                    light: '#FFFFFF'
                                }
                            })];
                    case 2:
                        qrCodeDataUrl = _a.sent();
                        base64Data = qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
                        fileName = "qrcode_".concat(Date.now(), ".png");
                        filePath = path.join(process.cwd(), 'public', 'qrcodes', fileName);
                        dir = path.dirname(filePath);
                        if (!fs.existsSync(dir)) {
                            fs.mkdirSync(dir, { recursive: true });
                        }
                        // 保存文件
                        fs.writeFileSync(filePath, base64Data, 'base64');
                        baseUrl = process.env.FRONTEND_URL || 'http://k.yyup.cc';
                        return [2 /*return*/, "".concat(baseUrl, "/qrcodes/").concat(fileName)];
                    case 3:
                        error_5 = _a.sent();
                        console.error('生成二维码失败:', error_5);
                        throw new Error('生成二维码失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return ActivityService;
}());
exports.ActivityService = ActivityService;
exports.activityService = new ActivityService();
