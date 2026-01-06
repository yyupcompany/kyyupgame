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
exports.ConversionTrackingService = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var conversion_tracking_model_1 = require("../../models/conversion-tracking.model");
var marketing_campaign_model_1 = require("../../models/marketing-campaign.model");
var channel_tracking_model_1 = require("../../models/channel-tracking.model");
/**
 * 跟进状态枚举
 */
var FollowUpStatus;
(function (FollowUpStatus) {
    FollowUpStatus[FollowUpStatus["NOT_FOLLOWED"] = 0] = "NOT_FOLLOWED";
    FollowUpStatus[FollowUpStatus["CONTACTED"] = 1] = "CONTACTED";
    FollowUpStatus[FollowUpStatus["REVISITED"] = 2] = "REVISITED";
    FollowUpStatus[FollowUpStatus["NEED_CONTACT"] = 3] = "NEED_CONTACT";
    FollowUpStatus[FollowUpStatus["CONFIRMED_INTENT"] = 4] = "CONFIRMED_INTENT";
    FollowUpStatus[FollowUpStatus["NO_INTENT"] = 5] = "NO_INTENT";
    FollowUpStatus[FollowUpStatus["CONVERTED"] = 6] = "CONVERTED";
    FollowUpStatus[FollowUpStatus["ABANDONED"] = 7] = "ABANDONED";
})(FollowUpStatus || (FollowUpStatus = {}));
/**
 * 转化跟踪服务实现
 * @description 实现转化跟踪管理相关的业务逻辑
 */
var ConversionTrackingService = /** @class */ (function () {
    function ConversionTrackingService() {
    }
    /**
     * 创建转化跟踪记录
     * @param data 转化跟踪创建数据
     * @returns 创建的转化跟踪实例
     */
    ConversionTrackingService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var conversion, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.create(data)];
                    case 1:
                        conversion = _a.sent();
                        return [2 /*return*/, conversion];
                    case 2:
                        error_1 = _a.sent();
                        console.error('创建转化跟踪记录失败:', error_1);
                        throw new Error('创建转化跟踪记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID查找转化跟踪记录
     * @param id 转化跟踪ID
     * @returns 转化跟踪实例或null
     */
    ConversionTrackingService.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var conversion, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findByPk(id)];
                    case 1:
                        conversion = _a.sent();
                        return [2 /*return*/, conversion];
                    case 2:
                        error_2 = _a.sent();
                        console.error('查询转化跟踪记录失败:', error_2);
                        throw new Error('查询转化跟踪记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询所有符合条件的转化跟踪记录
     * @param options 查询选项
     * @returns 转化跟踪数组
     */
    ConversionTrackingService.prototype.findAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var conversions, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll(options)];
                    case 1:
                        conversions = _a.sent();
                        return [2 /*return*/, conversions];
                    case 2:
                        error_3 = _a.sent();
                        console.error('查询转化跟踪列表失败:', error_3);
                        throw new Error('查询转化跟踪列表失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新转化跟踪信息
     * @param id 转化跟踪ID
     * @param data 更新数据
     * @returns 是否更新成功
     */
    ConversionTrackingService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.update(data, {
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = (_a.sent())[0];
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_4 = _a.sent();
                        console.error('更新转化跟踪记录失败:', error_4);
                        throw new Error('更新转化跟踪记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除转化跟踪记录
     * @param id 转化跟踪ID
     * @returns 是否删除成功
     */
    ConversionTrackingService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.destroy({
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = _a.sent();
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_5 = _a.sent();
                        console.error('删除转化跟踪记录失败:', error_5);
                        throw new Error('删除转化跟踪记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取转化统计信息
     * @param kindergartenId 幼儿园ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 统计信息
     */
    ConversionTrackingService.prototype.getStats = function (kindergartenId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var total, conversionsByType, byType_1, conversionsBySource, bySource_1, totalValue, averageValue, totalClicks, conversionRate, error_6;
            var _a, _b, _c, _d;
            var _this = this;
            return __generator(this, function (_e) {
                switch (_e.label) {
                    case 0:
                        _e.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    eventTime: (_a = {}, _a[sequelize_1.Op.between] = [startDate, endDate], _a)
                                }
                            })];
                    case 1:
                        total = _e.sent();
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: {
                                    kindergartenId: kindergartenId,
                                    eventTime: (_b = {}, _b[sequelize_1.Op.between] = [startDate, endDate], _b)
                                },
                                attributes: ['conversionType', [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']],
                                group: ['conversionType'],
                                raw: true
                            })];
                    case 2:
                        conversionsByType = _e.sent();
                        byType_1 = {};
                        conversionsByType.forEach(function (conv) {
                            var typeText = _this.getConversionTypeText(conv.conversionType);
                            byType_1[typeText] = conv.count;
                        });
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: {
                                    kindergartenId: kindergartenId,
                                    eventTime: (_c = {}, _c[sequelize_1.Op.between] = [startDate, endDate], _c)
                                },
                                attributes: ['conversionSource', [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']],
                                group: ['conversionSource'],
                                raw: true
                            })];
                    case 3:
                        conversionsBySource = _e.sent();
                        bySource_1 = {};
                        conversionsBySource.forEach(function (conv) {
                            bySource_1[conv.conversionSource] = conv.count;
                        });
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.sum('eventValue', {
                                where: {
                                    kindergartenId: kindergartenId,
                                    eventTime: (_d = {}, _d[sequelize_1.Op.between] = [startDate, endDate], _d)
                                }
                            })];
                    case 4:
                        totalValue = (_e.sent()) || 0;
                        averageValue = total > 0 ? totalValue / total : 0;
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.sum('clicks', {
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 5:
                        totalClicks = (_e.sent()) || 0;
                        conversionRate = totalClicks > 0 ? (total / totalClicks) * 100 : 0;
                        return [2 /*return*/, {
                                total: total,
                                byType: byType_1,
                                bySource: bySource_1,
                                conversionRate: conversionRate,
                                averageValue: averageValue
                            }];
                    case 6:
                        error_6 = _e.sent();
                        console.error('获取转化统计信息失败:', error_6);
                        throw new Error('获取转化统计信息失败');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取转化跟进状态摘要
     * @param kindergartenId 幼儿园ID
     * @returns 跟进状态摘要
     */
    ConversionTrackingService.prototype.getFollowUpSummary = function (kindergartenId) {
        return __awaiter(this, void 0, void 0, function () {
            var followUpStats, summary_1, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: { kindergartenId: kindergartenId },
                                attributes: ['followUpStatus', [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']],
                                group: ['followUpStatus'],
                                raw: true
                            })];
                    case 1:
                        followUpStats = _a.sent();
                        summary_1 = {
                            notFollowed: 0,
                            contacted: 0,
                            revisited: 0,
                            needContact: 0,
                            confirmedIntent: 0,
                            noIntent: 0,
                            converted: 0,
                            abandoned: 0
                        };
                        // 填充有数据的状态计数
                        followUpStats.forEach(function (stat) {
                            switch (stat.followUpStatus) {
                                case FollowUpStatus.NOT_FOLLOWED:
                                    summary_1.notFollowed = stat.count;
                                    break;
                                case FollowUpStatus.CONTACTED:
                                    summary_1.contacted = stat.count;
                                    break;
                                case FollowUpStatus.REVISITED:
                                    summary_1.revisited = stat.count;
                                    break;
                                case FollowUpStatus.NEED_CONTACT:
                                    summary_1.needContact = stat.count;
                                    break;
                                case FollowUpStatus.CONFIRMED_INTENT:
                                    summary_1.confirmedIntent = stat.count;
                                    break;
                                case FollowUpStatus.NO_INTENT:
                                    summary_1.noIntent = stat.count;
                                    break;
                                case FollowUpStatus.CONVERTED:
                                    summary_1.converted = stat.count;
                                    break;
                                case FollowUpStatus.ABANDONED:
                                    summary_1.abandoned = stat.count;
                                    break;
                            }
                        });
                        return [2 /*return*/, summary_1];
                    case 2:
                        error_7 = _a.sent();
                        console.error('获取转化跟进状态摘要失败:', error_7);
                        throw new Error('获取转化跟进状态摘要失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录转化事件
     * @param data 转化数据
     * @returns 创建的转化跟踪实例
     */
    ConversionTrackingService.prototype.recordConversion = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var conversion, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // 确保必要字段存在
                        if (!data.eventTime) {
                            data.eventTime = new Date();
                        }
                        // 确保conversionStatus字段存在
                        if (data.conversionStatus === undefined) {
                            data.conversionStatus = 1; // 有效转化
                        }
                        // 确保followUpStatus字段存在
                        if (data.followUpStatus === undefined) {
                            data.followUpStatus = FollowUpStatus.NOT_FOLLOWED;
                        }
                        // 确保isFirstVisit字段存在
                        if (data.isFirstVisit === undefined) {
                            data.isFirstVisit = 0; // 非首次访问
                        }
                        return [4 /*yield*/, this.create(data)];
                    case 1:
                        conversion = _a.sent();
                        return [2 /*return*/, conversion];
                    case 2:
                        error_8 = _a.sent();
                        console.error('记录转化事件失败:', error_8);
                        throw new Error('记录转化事件失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新转化跟进状态
     * @param id 转化跟踪ID
     * @param status 跟进状态
     * @param userId 跟进人ID
     * @param remark 备注信息
     * @returns 是否更新成功
     */
    ConversionTrackingService.prototype.updateFollowUpStatus = function (id, status, userId, remark) {
        return __awaiter(this, void 0, void 0, function () {
            var conversion, updateData, updated, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        conversion = _a.sent();
                        if (!conversion) {
                            throw new Error('转化记录不存在');
                        }
                        updateData = {
                            followUpStatus: status,
                            followUpUserId: userId,
                            lastFollowUpTime: new Date()
                        };
                        if (remark) {
                            updateData.followUpRemark = remark;
                        }
                        // 如果状态是"已转化"，则自动设置转化状态为有效
                        if (status === FollowUpStatus.CONVERTED) {
                            updateData.conversionStatus = 1; // 有效转化
                        }
                        // 如果状态是"已放弃"，则自动设置转化状态为无效
                        if (status === FollowUpStatus.ABANDONED) {
                            updateData.conversionStatus = 0; // 无效转化
                        }
                        return [4 /*yield*/, this.update(id, updateData)];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 3:
                        error_9 = _a.sent();
                        console.error('更新转化跟进状态失败:', error_9);
                        throw new Error('更新转化跟进状态失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取指定营销活动的转化记录
     * @param campaignId 营销活动ID
     * @returns 转化跟踪数组
     */
    ConversionTrackingService.prototype.findByCampaignId = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversions, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: { campaignId: campaignId }
                            })];
                    case 1:
                        conversions = _a.sent();
                        return [2 /*return*/, conversions];
                    case 2:
                        error_10 = _a.sent();
                        console.error('获取营销活动转化记录失败:', error_10);
                        throw new Error('获取营销活动转化记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取指定渠道的转化记录
     * @param channelId 渠道ID
     * @returns 转化跟踪数组
     */
    ConversionTrackingService.prototype.findByChannelId = function (channelId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversions, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: { channelId: channelId }
                            })];
                    case 1:
                        conversions = _a.sent();
                        return [2 /*return*/, conversions];
                    case 2:
                        error_11 = _a.sent();
                        console.error('获取渠道转化记录失败:', error_11);
                        throw new Error('获取渠道转化记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取指定广告的转化记录
     * @param advertisementId 广告ID
     * @returns 转化跟踪数组
     */
    ConversionTrackingService.prototype.findByAdvertisementId = function (advertisementId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversions, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: { advertisementId: advertisementId }
                            })];
                    case 1:
                        conversions = _a.sent();
                        return [2 /*return*/, conversions];
                    case 2:
                        error_12 = _a.sent();
                        console.error('获取广告转化记录失败:', error_12);
                        throw new Error('获取广告转化记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取指定家长的转化记录
     * @param parentId 家长ID
     * @returns 转化跟踪数组
     */
    ConversionTrackingService.prototype.findByParentId = function (parentId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversions, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: { parentId: parentId }
                            })];
                    case 1:
                        conversions = _a.sent();
                        return [2 /*return*/, conversions];
                    case 2:
                        error_13 = _a.sent();
                        console.error('获取家长转化记录失败:', error_13);
                        throw new Error('获取家长转化记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取转化分析
     * @param kindergartenId 幼儿园ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 转化分析结果
     */
    ConversionTrackingService.prototype.getAnalysis = function (kindergartenId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var conversionsByDay, conversionByDay_1, conversionsByHour, conversionByHour_1, conversionsByDevice, conversionByDevice_1, valueRanges, valueDistribution, _i, valueRanges_1, range, whereClause, count, topSourcesData, topSources, topCampaignsData, topCampaigns, _a, topCampaignsData_1, item, campaign, error_14;
            var _b, _c, _d, _e, _f, _g, _h;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        _j.trys.push([0, 14, , 15]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: {
                                    kindergartenId: kindergartenId,
                                    eventTime: (_b = {}, _b[sequelize_1.Op.between] = [startDate, endDate], _b)
                                },
                                attributes: [
                                    [init_1.sequelize.fn('DATE', init_1.sequelize.col('eventTime')), 'day'],
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']
                                ],
                                group: [init_1.sequelize.fn('DATE', init_1.sequelize.col('eventTime'))],
                                raw: true
                            })];
                    case 1:
                        conversionsByDay = _j.sent();
                        conversionByDay_1 = {};
                        conversionsByDay.forEach(function (item) {
                            conversionByDay_1[item.day] = item.count;
                        });
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: {
                                    kindergartenId: kindergartenId,
                                    eventTime: (_c = {}, _c[sequelize_1.Op.between] = [startDate, endDate], _c)
                                },
                                attributes: [
                                    [init_1.sequelize.fn('HOUR', init_1.sequelize.col('eventTime')), 'hour'],
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']
                                ],
                                group: [init_1.sequelize.fn('HOUR', init_1.sequelize.col('eventTime'))],
                                raw: true
                            })];
                    case 2:
                        conversionsByHour = _j.sent();
                        conversionByHour_1 = {};
                        conversionsByHour.forEach(function (item) {
                            conversionByHour_1[item.hour] = item.count;
                        });
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: {
                                    kindergartenId: kindergartenId,
                                    eventTime: (_d = {}, _d[sequelize_1.Op.between] = [startDate, endDate], _d)
                                },
                                attributes: [
                                    'deviceType',
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']
                                ],
                                group: ['deviceType'],
                                raw: true
                            })];
                    case 3:
                        conversionsByDevice = _j.sent();
                        conversionByDevice_1 = {};
                        conversionsByDevice.forEach(function (item) {
                            conversionByDevice_1[item.deviceType || '未知'] = item.count;
                        });
                        valueRanges = [
                            { min: 0, max: 100, label: '0-100' },
                            { min: 100, max: 500, label: '100-500' },
                            { min: 500, max: 1000, label: '500-1000' },
                            { min: 1000, max: 5000, label: '1000-5000' },
                            { min: 5000, max: null, label: '5000+' }
                        ];
                        valueDistribution = {};
                        _i = 0, valueRanges_1 = valueRanges;
                        _j.label = 4;
                    case 4:
                        if (!(_i < valueRanges_1.length)) return [3 /*break*/, 7];
                        range = valueRanges_1[_i];
                        whereClause = {
                            kindergartenId: kindergartenId,
                            eventTime: (_e = {}, _e[sequelize_1.Op.between] = [startDate, endDate], _e),
                            eventValue: {}
                        };
                        if (range.min !== null) {
                            whereClause.eventValue[sequelize_1.Op.gte] = range.min;
                        }
                        if (range.max !== null) {
                            whereClause.eventValue[sequelize_1.Op.lt] = range.max;
                        }
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.count({ where: whereClause })];
                    case 5:
                        count = _j.sent();
                        valueDistribution[range.label] = count;
                        _j.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 4];
                    case 7: return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                            where: {
                                kindergartenId: kindergartenId,
                                eventTime: (_f = {}, _f[sequelize_1.Op.between] = [startDate, endDate], _f)
                            },
                            attributes: [
                                'conversionSource',
                                [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']
                            ],
                            group: ['conversionSource'],
                            order: [[init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'DESC']],
                            limit: 5,
                            raw: true
                        })];
                    case 8:
                        topSourcesData = _j.sent();
                        topSources = topSourcesData.map(function (item) { return ({
                            source: item.conversionSource,
                            count: item.count
                        }); });
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: {
                                    kindergartenId: kindergartenId,
                                    campaignId: (_g = {}, _g[sequelize_1.Op.not] = null, _g),
                                    eventTime: (_h = {}, _h[sequelize_1.Op.between] = [startDate, endDate], _h)
                                },
                                attributes: [
                                    'campaignId',
                                    [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']
                                ],
                                group: ['campaignId'],
                                order: [[init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'DESC']],
                                limit: 5,
                                raw: true
                            })];
                    case 9:
                        topCampaignsData = _j.sent();
                        topCampaigns = [];
                        _a = 0, topCampaignsData_1 = topCampaignsData;
                        _j.label = 10;
                    case 10:
                        if (!(_a < topCampaignsData_1.length)) return [3 /*break*/, 13];
                        item = topCampaignsData_1[_a];
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.findByPk(item.campaignId)];
                    case 11:
                        campaign = _j.sent();
                        topCampaigns.push({
                            campaign: campaign ? campaign.get('name') : "\u6D3B\u52A8ID:".concat(item.campaignId),
                            count: item.count
                        });
                        _j.label = 12;
                    case 12:
                        _a++;
                        return [3 /*break*/, 10];
                    case 13: return [2 /*return*/, {
                            conversionByDay: conversionByDay_1,
                            conversionByHour: conversionByHour_1,
                            conversionByDevice: conversionByDevice_1,
                            valueDistribution: valueDistribution,
                            topSources: topSources,
                            topCampaigns: topCampaigns
                        }];
                    case 14:
                        error_14 = _j.sent();
                        console.error('获取转化分析失败:', error_14);
                        throw new Error('获取转化分析失败');
                    case 15: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 导出转化数据
     * @param kindergartenId 幼儿园ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 导出的数据数组
     */
    ConversionTrackingService.prototype.exportData = function (kindergartenId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var conversions, exportData, error_15;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: {
                                    kindergartenId: kindergartenId,
                                    eventTime: (_a = {}, _a[sequelize_1.Op.between] = [startDate, endDate], _a)
                                },
                                raw: true
                            })];
                    case 1:
                        conversions = _b.sent();
                        exportData = conversions.map(function (conversion) {
                            return {
                                转化ID: conversion.id,
                                转化类型: _this.getConversionTypeText(conversion.conversionType),
                                转化来源: conversion.conversionSource,
                                转化事件: conversion.conversionEvent,
                                转化价值: conversion.eventValue,
                                转化时间: conversion.eventTime,
                                是否首次访问: conversion.isFirstVisit ? '是' : '否',
                                转化状态: conversion.conversionStatus ? '有效' : '无效',
                                跟进状态: _this.getFollowUpStatusText(conversion.followUpStatus),
                                最后跟进时间: conversion.updatedAt || null,
                                跟进备注: ''
                            };
                        });
                        return [2 /*return*/, exportData];
                    case 2:
                        error_15 = _b.sent();
                        console.error('导出转化数据失败:', error_15);
                        throw new Error('导出转化数据失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 计算转化归因
     * @param parentId 家长ID
     * @returns 归因结果
     */
    ConversionTrackingService.prototype.calculateAttribution = function (parentId) {
        return __awaiter(this, void 0, void 0, function () {
            var conversions, attribution, sortedConversions, latestConversion, source, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.findByParentId(parentId)];
                    case 1:
                        conversions = _a.sent();
                        // 如果没有转化记录，返回空结果
                        if (conversions.length === 0) {
                            return [2 /*return*/, {}];
                        }
                        attribution = {};
                        sortedConversions = __spreadArray([], conversions, true).sort(function (a, b) {
                            var aTime = a.get('eventTime');
                            var bTime = b.get('eventTime');
                            return bTime.getTime() - aTime.getTime();
                        });
                        latestConversion = sortedConversions[0];
                        source = latestConversion.get('conversionSource');
                        attribution[source] = 100;
                        return [2 /*return*/, attribution];
                    case 2:
                        error_16 = _a.sent();
                        console.error('计算转化归因失败:', error_16);
                        throw new Error('计算转化归因失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取转化类型文本
     * @param type 转化类型ID
     * @returns 转化类型文本
     */
    ConversionTrackingService.prototype.getConversionTypeText = function (type) {
        switch (type) {
            case 1:
                return '咨询';
            case 2:
                return '预约';
            case 3:
                return '报名';
            case 4:
                return '其他';
            default:
                return '未知';
        }
    };
    /**
     * 获取跟进状态文本
     * @param status 跟进状态ID
     * @returns 跟进状态文本
     */
    ConversionTrackingService.prototype.getFollowUpStatusText = function (status) {
        switch (status) {
            case FollowUpStatus.NOT_FOLLOWED:
                return '未跟进';
            case FollowUpStatus.CONTACTED:
                return '已联系';
            case FollowUpStatus.REVISITED:
                return '已回访';
            case FollowUpStatus.NEED_CONTACT:
                return '需再次联系';
            case FollowUpStatus.CONFIRMED_INTENT:
                return '已确认意向';
            case FollowUpStatus.NO_INTENT:
                return '无意向';
            case FollowUpStatus.CONVERTED:
                return '已转化';
            case FollowUpStatus.ABANDONED:
                return '已放弃';
            default:
                return '未知';
        }
    };
    return ConversionTrackingService;
}());
exports.ConversionTrackingService = ConversionTrackingService;
exports["default"] = new ConversionTrackingService();
