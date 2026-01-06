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
exports.ActivityPosterController = void 0;
var activity_model_1 = require("../models/activity.model");
var activity_poster_model_1 = require("../models/activity-poster.model");
var activity_share_model_1 = require("../models/activity-share.model");
var poster_generation_model_1 = require("../models/poster-generation.model");
var response_handler_1 = require("../utils/response-handler");
/**
 * 活动海报管理控制器
 * 完善活动→海报→营销功能的业务链路
 */
var ActivityPosterController = /** @class */ (function () {
    function ActivityPosterController() {
    }
    /**
     * 为活动生成海报
     */
    ActivityPosterController.generatePoster = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var activityId, _a, _b, posterType, marketingConfig, templateId, customContent, activity, posterData, activityPoster, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        activityId = req.params.activityId;
                        _a = req.body, _b = _a.posterType, posterType = _b === void 0 ? 'main' : _b, marketingConfig = _a.marketingConfig, templateId = _a.templateId, customContent = _a.customContent;
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(activityId)];
                    case 1:
                        activity = _c.sent();
                        if (!activity) {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '活动不存在', 404)];
                        }
                        posterData = {
                            templateId: templateId,
                            content: __assign({ title: activity.title, description: activity.description, startTime: activity.startTime, endTime: activity.endTime, location: activity.location, capacity: activity.capacity, registeredCount: activity.registeredCount }, customContent),
                            marketingTools: marketingConfig || {},
                            activityId: parseInt(activityId)
                        };
                        return [4 /*yield*/, activity_poster_model_1.ActivityPoster.create({
                                activityId: parseInt(activityId),
                                posterId: 1,
                                posterType: posterType,
                                isActive: true
                            })];
                    case 2:
                        activityPoster = _c.sent();
                        if (!(posterType === 'main')) return [3 /*break*/, 4];
                        return [4 /*yield*/, activity.update({
                                posterId: 1,
                                posterUrl: '/api/posters/1/image',
                                marketingConfig: marketingConfig
                            })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4: return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                            activityPoster: activityPoster,
                            posterUrl: '/api/posters/1/image',
                            message: '海报生成成功'
                        })];
                    case 5:
                        error_1 = _c.sent();
                        console.error('生成活动海报失败:', error_1);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '生成海报失败')];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动的所有海报
     */
    ActivityPosterController.getActivityPosters = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var activityId, posters, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        activityId = req.params.activityId;
                        return [4 /*yield*/, activity_poster_model_1.ActivityPoster.findAll({
                                where: { activityId: activityId },
                                include: [
                                    {
                                        model: poster_generation_model_1.PosterGeneration,
                                        as: 'poster'
                                    }
                                ],
                                order: [['createdAt', 'DESC']]
                            })];
                    case 1:
                        posters = _a.sent();
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, posters)];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取活动海报失败:', error_2);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '获取海报失败')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 预览活动海报
     */
    ActivityPosterController.previewPoster = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var activityId, _a, posterType, activity, previewData, error_3;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        activityId = req.params.activityId;
                        _a = req.query.posterType, posterType = _a === void 0 ? 'main' : _a;
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(activityId)];
                    case 1:
                        activity = _b.sent();
                        if (!activity) {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '活动不存在', 404)];
                        }
                        previewData = {
                            activity: {
                                title: activity.title,
                                description: activity.description,
                                startTime: activity.startTime,
                                endTime: activity.endTime,
                                location: activity.location,
                                capacity: activity.capacity,
                                registeredCount: activity.registeredCount
                            },
                            marketingConfig: activity.marketingConfig,
                            posterType: posterType,
                            previewUrl: "/api/activities/".concat(activityId, "/poster/preview?type=").concat(posterType)
                        };
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, previewData)];
                    case 2:
                        error_3 = _b.sent();
                        console.error('预览活动海报失败:', error_3);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '预览失败')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 发布活动和海报
     */
    ActivityPosterController.publishActivity = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var activityId, _a, publishChannels, activity, publishResult, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        activityId = req.params.activityId;
                        _a = req.body.publishChannels, publishChannels = _a === void 0 ? ['wechat'] : _a;
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(activityId)];
                    case 1:
                        activity = _b.sent();
                        if (!activity) {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '活动不存在', 404)];
                        }
                        // 更新活动发布状态
                        return [4 /*yield*/, activity.update({
                                publishStatus: 1 // 已发布
                            })];
                    case 2:
                        // 更新活动发布状态
                        _b.sent();
                        publishResult = {
                            activityId: activityId,
                            publishChannels: publishChannels,
                            publishTime: new Date(),
                            shareUrl: "/activities/".concat(activityId),
                            qrCodeUrl: "/api/activities/".concat(activityId, "/qrcode")
                        };
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, __assign(__assign({}, publishResult), { message: '活动发布成功' }))];
                    case 3:
                        error_4 = _b.sent();
                        console.error('发布活动失败:', error_4);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '发布失败')];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 一键转发分享
     */
    ActivityPosterController.shareActivity = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var activityId, _b, shareChannel, posterId, customMessage, sharerId, shareIp, activity, shareUrl, activityShare, shareContent, error_5;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        activityId = req.params.activityId;
                        _b = req.body, shareChannel = _b.shareChannel, posterId = _b.posterId, customMessage = _b.customMessage;
                        sharerId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        shareIp = req.ip;
                        return [4 /*yield*/, activity_model_1.Activity.findByPk(activityId)];
                    case 1:
                        activity = _c.sent();
                        if (!activity) {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '活动不存在', 404)];
                        }
                        shareUrl = "".concat(process.env.FRONTEND_URL, "/activities/").concat(activityId, "?from=share&sharer=").concat(sharerId);
                        return [4 /*yield*/, activity_share_model_1.ActivityShare.create({
                                activityId: parseInt(activityId),
                                posterId: posterId,
                                shareChannel: shareChannel,
                                shareUrl: shareUrl,
                                sharerId: sharerId,
                                shareIp: shareIp
                            })];
                    case 2:
                        activityShare = _c.sent();
                        // 更新活动分享计数
                        return [4 /*yield*/, activity.increment('shareCount')];
                    case 3:
                        // 更新活动分享计数
                        _c.sent();
                        shareContent = {
                            title: activity.title,
                            description: activity.description || '精彩活动，不容错过！',
                            imageUrl: activity.posterUrl,
                            url: shareUrl,
                            customMessage: customMessage
                        };
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                shareContent: shareContent,
                                shareUrl: shareUrl,
                                shareId: activityShare.id,
                                message: '分享链接生成成功'
                            })];
                    case 4:
                        error_5 = _c.sent();
                        console.error('分享活动失败:', error_5);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '分享失败')];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动分享统计
     */
    ActivityPosterController.getShareStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var activityId, _a, activity, shareStats, error_6;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        activityId = req.params.activityId;
                        return [4 /*yield*/, Promise.all([
                                activity_model_1.Activity.findByPk(activityId, {
                                    attributes: ['id', 'title', 'shareCount', 'viewCount']
                                }),
                                activity_share_model_1.ActivityShare.findAll({
                                    where: { activityId: activityId },
                                    attributes: [
                                        'shareChannel',
                                        [activity_share_model_1.ActivityShare.sequelize.fn('COUNT', activity_share_model_1.ActivityShare.sequelize.col('id')), 'count']
                                    ],
                                    group: ['shareChannel'],
                                    raw: true
                                })
                            ])];
                    case 1:
                        _a = _b.sent(), activity = _a[0], shareStats = _a[1];
                        if (!activity) {
                            return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '活动不存在', 404)];
                        }
                        return [2 /*return*/, (0, response_handler_1.successResponse)(res, {
                                activity: activity,
                                shareStats: shareStats,
                                totalShares: activity.shareCount,
                                totalViews: activity.viewCount
                            })];
                    case 2:
                        error_6 = _b.sent();
                        console.error('获取分享统计失败:', error_6);
                        return [2 /*return*/, (0, response_handler_1.errorResponse)(res, '获取统计失败')];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ActivityPosterController;
}());
exports.ActivityPosterController = ActivityPosterController;
