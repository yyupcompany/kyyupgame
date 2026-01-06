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
exports.activityController = exports.ActivityController = void 0;
var activity_service_1 = require("../services/activity/activity.service");
var apiResponse_1 = require("../utils/apiResponse");
var apiError_1 = require("../utils/apiError");
var activity_model_1 = require("../models/activity.model");
var ActivityController = /** @class */ (function () {
    function ActivityController() {
    }
    /**
     * 创建活动
     */
    ActivityController.prototype.create = function (req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var userId, kindergartenId, activityData, activity, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        kindergartenId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.kindergartenId;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (!kindergartenId) {
                            throw apiError_1.ApiError.badRequest('用户未关联幼儿园');
                        }
                        activityData = __assign(__assign({}, req.body), { kindergartenId: kindergartenId });
                        console.log('📝 创建活动，自动填充kindergartenId:', kindergartenId);
                        return [4 /*yield*/, activity_service_1.activityService.createActivity(activityData, userId)];
                    case 1:
                        activity = _c.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activity, '创建活动成功')];
                    case 2:
                        error_1 = _c.sent();
                        next(error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动列表
     */
    ActivityController.prototype.getList = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var filters, result, error_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        filters = {
                            page: parseInt(req.query.page) || 1,
                            pageSize: parseInt(req.query.pageSize) || 10,
                            keyword: req.query.keyword,
                            kindergartenId: req.query.kindergartenId ? parseInt(req.query.kindergartenId) : undefined,
                            planId: req.query.planId ? parseInt(req.query.planId) : undefined,
                            activityType: req.query.activityType && req.query.activityType !== 'undefined' ? parseInt(req.query.activityType) : undefined,
                            status: req.query.status && req.query.status !== 'undefined' ? parseInt(req.query.status) : undefined,
                            startDate: req.query.startDate,
                            endDate: req.query.endDate,
                            sortBy: req.query.sortBy || 'created_at',
                            sortOrder: ((_a = req.query.sortOrder) === null || _a === void 0 ? void 0 : _a.toUpperCase()) === 'ASC' ? 'ASC' : 'DESC'
                        };
                        return [4 /*yield*/, activity_service_1.activityService.getActivities(filters)];
                    case 1:
                        result = _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                                items: result.rows,
                                total: result.count,
                                page: filters.page,
                                pageSize: filters.pageSize,
                                totalPages: Math.ceil(result.count / filters.pageSize)
                            }, '获取活动列表成功')];
                    case 2:
                        error_2 = _b.sent();
                        next(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动详情
     */
    ActivityController.prototype.getById = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, activity, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, activity_service_1.activityService.getActivityById(parseInt(id, 10) || 0)];
                    case 1:
                        activity = _a.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activity, '获取活动详情成功')];
                    case 2:
                        error_3 = _a.sent();
                        next(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新活动信息
     */
    ActivityController.prototype.update = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, activity, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        return [4 /*yield*/, activity_service_1.activityService.updateActivity(parseInt(id, 10) || 0, req.body, userId)];
                    case 1:
                        activity = _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activity, '更新活动成功')];
                    case 2:
                        error_4 = _b.sent();
                        next(error_4);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除活动
     */
    ActivityController.prototype["delete"] = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, activity_service_1.activityService.deleteActivity(parseInt(id, 10) || 0)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, null, '删除活动成功')];
                    case 2:
                        error_5 = _a.sent();
                        next(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新活动状态
     */
    ActivityController.prototype.updateStatus = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, status_1, userId, activity, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        status_1 = req.body.status;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (status_1 === undefined || !Object.values(activity_model_1.ActivityStatus).includes(status_1)) {
                            throw apiError_1.ApiError.badRequest('无效的活动状态');
                        }
                        return [4 /*yield*/, activity_service_1.activityService.updateActivityStatus(parseInt(id, 10) || 0, status_1, userId)];
                    case 1:
                        activity = _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activity, '更新活动状态成功')];
                    case 2:
                        error_6 = _b.sent();
                        next(error_6);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动统计信息
     */
    ActivityController.prototype.getStatistics = function (req, res, next) {
        return __awaiter(this, void 0, void 0, function () {
            var kindergartenId, statistics, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        kindergartenId = req.query.kindergartenId;
                        return [4 /*yield*/, activity_service_1.activityService.getActivityStatistics(kindergartenId ? parseInt(kindergartenId, 10) || 0 : undefined)];
                    case 1:
                        statistics = _a.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, statistics, '获取活动统计成功')];
                    case 2:
                        error_7 = _a.sent();
                        next(error_7);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发布活动（将状态改为报名中）
     */
    ActivityController.prototype.publish = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, activity, updatedActivity, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        id = req.params.id;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        return [4 /*yield*/, activity_service_1.activityService.getActivityById(parseInt(id, 10) || 0)];
                    case 1:
                        activity = _b.sent();
                        // 如果已经是"报名中"状态，直接返回成功
                        if (activity.status === activity_model_1.ActivityStatus.REGISTRATION_OPEN) {
                            return [2 /*return*/, apiResponse_1.ApiResponse.success(res, activity, '活动已发布')];
                        }
                        return [4 /*yield*/, activity_service_1.activityService.updateActivityStatus(parseInt(id, 10) || 0, activity_model_1.ActivityStatus.REGISTRATION_OPEN, userId)];
                    case 2:
                        updatedActivity = _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, updatedActivity, '发布活动成功')];
                    case 3:
                        error_8 = _b.sent();
                        next(error_8);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 分享活动
     * 支持3级分享层级：
     * - 一级分享：直接分享活动
     * - 二级分享：通过一级分享者的链接分享
     * - 三级分享：通过二级分享者的链接分享
     */
    ActivityController.prototype.share = function (req, res, next) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function () {
            var id, _c, shareChannel, shareContent, posterId, parentSharerId, userId, userRole, shareIp, activity, shareLevel, actualParentSharerId, parentShare, baseUrl, shareUrl, shareData, shareRecord, qrcodeUrl, error_9;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 7, , 8]);
                        id = req.params.id;
                        _c = req.body, shareChannel = _c.shareChannel, shareContent = _c.shareContent, posterId = _c.posterId, parentSharerId = _c.parentSharerId;
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        userRole = (_b = req.user) === null || _b === void 0 ? void 0 : _b.role;
                        shareIp = req.ip || req.connection.remoteAddress;
                        if (!userId) {
                            throw apiError_1.ApiError.unauthorized('用户未登录');
                        }
                        if (!shareChannel) {
                            throw apiError_1.ApiError.badRequest('分享渠道不能为空');
                        }
                        return [4 /*yield*/, activity_service_1.activityService.getActivityById(parseInt(id, 10) || 0)];
                    case 1:
                        activity = _d.sent();
                        shareLevel = 1;
                        actualParentSharerId = parentSharerId;
                        if (!parentSharerId) return [3 /*break*/, 3];
                        return [4 /*yield*/, activity_service_1.activityService.getLatestShareByUser(activity.id, parentSharerId)];
                    case 2:
                        parentShare = _d.sent();
                        if (parentShare) {
                            shareLevel = Math.min(parentShare.shareLevel + 1, 3); // 最多3级
                            // 如果上级已经是3级，则不记录上级关系（不再继续分享链）
                            if (parentShare.shareLevel >= 3) {
                                actualParentSharerId = undefined;
                                shareLevel = 1; // 重新开始计算
                            }
                        }
                        _d.label = 3;
                    case 3:
                        baseUrl = process.env.FRONTEND_URL || 'https://k.yyup.cc';
                        shareUrl = "".concat(baseUrl, "/activity/register/").concat(activity.id, "?sharerId=").concat(userId);
                        shareData = {
                            activityId: activity.id,
                            posterId: posterId,
                            shareChannel: shareChannel,
                            shareUrl: shareUrl,
                            sharerId: userId,
                            parentSharerId: actualParentSharerId,
                            shareLevel: shareLevel,
                            shareIp: shareIp,
                            shareContent: shareContent || "\u5FEB\u6765\u53C2\u52A0\"".concat(activity.title, "\"\u6D3B\u52A8\u5427\uFF01")
                        };
                        return [4 /*yield*/, activity_service_1.activityService.createActivityShare(shareData)];
                    case 4:
                        shareRecord = _d.sent();
                        qrcodeUrl = null;
                        if (!(shareChannel === 'qrcode')) return [3 /*break*/, 6];
                        return [4 /*yield*/, activity_service_1.activityService.generateShareQrcode(shareUrl)];
                    case 5:
                        qrcodeUrl = _d.sent();
                        _d.label = 6;
                    case 6: return [2 /*return*/, apiResponse_1.ApiResponse.success(res, {
                            shareUrl: shareUrl,
                            shareContent: shareData.shareContent,
                            qrcodeUrl: qrcodeUrl,
                            shareId: shareRecord.id,
                            shareLevel: shareLevel,
                            parentSharerId: actualParentSharerId,
                            shareCount: activity.shareCount + 1
                        }, '分享成功')];
                    case 7:
                        error_9 = _d.sent();
                        next(error_9);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询分享层级关系
     * 返回指定用户的分享树（包含下级1-3级分享者）
     */
    ActivityController.prototype.getShareHierarchy = function (req, res, next) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var id, userId, currentUserId, targetUserId, activityId, hierarchy, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = req.query.userId;
                        currentUserId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        targetUserId = userId ? parseInt(userId, 10) : currentUserId;
                        if (!targetUserId) {
                            throw apiError_1.ApiError.badRequest('用户ID不能为空');
                        }
                        activityId = parseInt(id, 10);
                        return [4 /*yield*/, activity_service_1.activityService.getShareHierarchy(activityId, targetUserId)];
                    case 1:
                        hierarchy = _b.sent();
                        return [2 /*return*/, apiResponse_1.ApiResponse.success(res, hierarchy, '查询成功')];
                    case 2:
                        error_10 = _b.sent();
                        next(error_10);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ActivityController;
}());
exports.ActivityController = ActivityController;
exports.activityController = new ActivityController();
