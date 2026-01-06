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
exports.AdvertisementService = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var advertisement_model_1 = require("../../models/advertisement.model");
var conversion_tracking_model_1 = require("../../models/conversion-tracking.model");
var marketing_campaign_model_1 = require("../../models/marketing-campaign.model");
/**
 * 广告状态枚举
 */
var AdStatus;
(function (AdStatus) {
    AdStatus[AdStatus["DRAFT"] = 0] = "DRAFT";
    AdStatus[AdStatus["ACTIVE"] = 1] = "ACTIVE";
    AdStatus[AdStatus["PAUSED"] = 2] = "PAUSED";
    AdStatus[AdStatus["COMPLETED"] = 3] = "COMPLETED";
    AdStatus[AdStatus["CANCELLED"] = 4] = "CANCELLED";
})(AdStatus || (AdStatus = {}));
/**
 * 获取广告类型文本
 * @param adType 广告类型编号
 * @returns 广告类型文本
 */
function getAdTypeText(adType) {
    switch (adType) {
        case advertisement_model_1.AdType.IMAGE: return '图片广告';
        case advertisement_model_1.AdType.VIDEO: return '视频广告';
        case advertisement_model_1.AdType.TEXT: return '文字广告';
        case advertisement_model_1.AdType.BANNER: return '横幅广告';
        case advertisement_model_1.AdType.POPUP: return '弹窗广告';
        case advertisement_model_1.AdType.FEED: return '信息流广告';
        case advertisement_model_1.AdType.SEARCH: return '搜索广告';
        default: return '其他广告';
    }
}
/**
 * 广告投放服务实现
 * @description 实现广告投放管理相关的业务逻辑
 */
var AdvertisementService = /** @class */ (function () {
    function AdvertisementService() {
    }
    /**
     * 创建广告
     * @param data 广告创建数据
     * @returns 创建的广告实例
     */
    AdvertisementService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, advertisement_model_1.Advertisement.create(data)];
                    case 1:
                        advertisement = _a.sent();
                        return [2 /*return*/, advertisement];
                    case 2:
                        error_1 = _a.sent();
                        console.error('创建广告失败:', error_1);
                        throw new Error('创建广告失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID查找广告
     * @param id 广告ID
     * @returns 广告实例或null
     */
    AdvertisementService.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, advertisement_model_1.Advertisement.findByPk(id)];
                    case 1:
                        advertisement = _a.sent();
                        return [2 /*return*/, advertisement];
                    case 2:
                        error_2 = _a.sent();
                        console.error('查询广告失败:', error_2);
                        throw new Error('查询广告失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询所有符合条件的广告
     * @param options 查询选项
     * @returns 广告数组
     */
    AdvertisementService.prototype.findAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisements, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, advertisement_model_1.Advertisement.findAll(options)];
                    case 1:
                        advertisements = _a.sent();
                        return [2 /*return*/, advertisements];
                    case 2:
                        error_3 = _a.sent();
                        console.error('查询广告列表失败:', error_3);
                        throw new Error('查询广告列表失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新广告信息
     * @param id 广告ID
     * @param data 更新数据
     * @returns 是否更新成功
     */
    AdvertisementService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, advertisement_model_1.Advertisement.update(data, {
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = (_a.sent())[0];
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_4 = _a.sent();
                        console.error('更新广告失败:', error_4);
                        throw new Error('更新广告失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除广告
     * @param id 广告ID
     * @returns 是否删除成功
     */
    AdvertisementService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, advertisement_model_1.Advertisement.destroy({
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = _a.sent();
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_5 = _a.sent();
                        console.error('删除广告失败:', error_5);
                        throw new Error('删除广告失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 激活广告
     * @param id 广告ID
     * @returns 是否激活成功
     */
    AdvertisementService.prototype.activate = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, status_1, updated, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        status_1 = advertisement.get('status');
                        if (status_1 === AdStatus.ACTIVE) {
                            return [2 /*return*/, true]; // 已经是活跃状态，无需操作
                        }
                        return [4 /*yield*/, this.update(id, {
                                status: AdStatus.ACTIVE
                            })];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 3:
                        error_6 = _a.sent();
                        console.error('激活广告失败:', error_6);
                        throw new Error('激活广告失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 暂停广告
     * @param id 广告ID
     * @returns 是否暂停成功
     */
    AdvertisementService.prototype.pause = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, status_2, updated, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        status_2 = advertisement.get('status');
                        if (status_2 === AdStatus.PAUSED) {
                            return [2 /*return*/, true]; // 已经是暂停状态，无需操作
                        }
                        if (status_2 === AdStatus.COMPLETED || status_2 === AdStatus.CANCELLED) {
                            throw new Error('已结束或已取消的广告不能暂停');
                        }
                        return [4 /*yield*/, this.update(id, {
                                status: AdStatus.PAUSED
                            })];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 3:
                        error_7 = _a.sent();
                        console.error('暂停广告失败:', error_7);
                        throw new Error('暂停广告失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 结束广告
     * @param id 广告ID
     * @returns 是否结束成功
     */
    AdvertisementService.prototype.end = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, status_3, updated, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        status_3 = advertisement.get('status');
                        if (status_3 === AdStatus.COMPLETED || status_3 === AdStatus.CANCELLED) {
                            return [2 /*return*/, true]; // 已经是结束状态，无需操作
                        }
                        return [4 /*yield*/, this.update(id, {
                                status: AdStatus.COMPLETED,
                                endDate: new Date()
                            })];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 3:
                        error_8 = _a.sent();
                        console.error('结束广告失败:', error_8);
                        throw new Error('结束广告失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取广告统计信息
     * @param kindergartenId 幼儿园ID
     * @returns 统计信息
     */
    AdvertisementService.prototype.getStats = function (kindergartenId) {
        return __awaiter(this, void 0, void 0, function () {
            var total, active, adsByType, byType_1, totalImpressions, totalClicks, ctr, error_9;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, advertisement_model_1.Advertisement.count({
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 1:
                        total = _c.sent();
                        return [4 /*yield*/, advertisement_model_1.Advertisement.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: AdStatus.ACTIVE,
                                    startDate: (_a = {}, _a[sequelize_1.Op.lte] = new Date(), _a),
                                    endDate: (_b = {}, _b[sequelize_1.Op.gte] = new Date(), _b)
                                }
                            })];
                    case 2:
                        active = _c.sent();
                        return [4 /*yield*/, advertisement_model_1.Advertisement.findAll({
                                where: { kindergartenId: kindergartenId },
                                attributes: ['adType', [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']],
                                group: ['adType'],
                                raw: true
                            })];
                    case 3:
                        adsByType = _c.sent();
                        byType_1 = {};
                        adsByType.forEach(function (ad) {
                            var adType = getAdTypeText(ad.adType);
                            byType_1[adType] = ad.count;
                        });
                        return [4 /*yield*/, advertisement_model_1.Advertisement.sum('impressions', {
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 4:
                        totalImpressions = (_c.sent()) || 0;
                        return [4 /*yield*/, advertisement_model_1.Advertisement.sum('clicks', {
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 5:
                        totalClicks = (_c.sent()) || 0;
                        ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
                        return [2 /*return*/, {
                                total: total,
                                active: active,
                                byType: byType_1,
                                impressions: totalImpressions,
                                clicks: totalClicks,
                                ctr: ctr
                            }];
                    case 6:
                        error_9 = _c.sent();
                        console.error('获取广告统计信息失败:', error_9);
                        throw new Error('获取广告统计信息失败');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取广告效果分析
     * @param id 广告ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 广告效果数据
     */
    AdvertisementService.prototype.getPerformance = function (id, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, conversions, impressions, clicks, cost, ctr, conversionRate, cpc, cpm, cpa, engagementRate, error_10;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _b.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.count({
                                where: {
                                    advertisementId: id,
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.between] = [startDate, endDate],
                                        _a)
                                }
                            })];
                    case 2:
                        conversions = _b.sent();
                        impressions = advertisement.get('impressions');
                        clicks = advertisement.get('clicks');
                        cost = advertisement.get('spent') || 0;
                        ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
                        conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
                        cpc = clicks > 0 ? cost / clicks : 0;
                        cpm = impressions > 0 ? (cost / impressions) * 1000 : 0;
                        cpa = conversions > 0 ? cost / conversions : 0;
                        engagementRate = clicks > 0 ? Math.min(90, ctr * 1.5) : 0;
                        return [2 /*return*/, {
                                impressions: impressions,
                                clicks: clicks,
                                ctr: ctr,
                                conversions: conversions,
                                conversionRate: conversionRate,
                                cost: cost,
                                cpc: cpc,
                                cpm: cpm,
                                cpa: cpa,
                                engagementRate: engagementRate
                            }];
                    case 3:
                        error_10 = _b.sent();
                        console.error('获取广告效果分析失败:', error_10);
                        throw new Error('获取广告效果分析失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录广告展示
     * @param id 广告ID
     * @param userId 用户ID (可选)
     * @param metadata 元数据 (可选)
     * @returns 是否记录成功
     */
    AdvertisementService.prototype.recordImpression = function (id, userId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        return [4 /*yield*/, advertisement.increment('impressions', { by: 1 })];
                    case 2:
                        _a.sent();
                        // TODO: 记录展示详情到展示日志表
                        // 这里可以记录userId和metadata到一个单独的展示日志表中
                        return [2 /*return*/, true];
                    case 3:
                        error_11 = _a.sent();
                        console.error('记录广告展示失败:', error_11);
                        throw new Error('记录广告展示失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录广告点击
     * @param id 广告ID
     * @param userId 用户ID (可选)
     * @param metadata 元数据 (可选)
     * @returns 是否记录成功
     */
    AdvertisementService.prototype.recordClick = function (id, userId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, error_12;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        return [4 /*yield*/, advertisement.increment('clicks', { by: 1 })];
                    case 2:
                        _a.sent();
                        // TODO: 记录点击详情到点击日志表
                        // 这里可以记录userId和metadata到一个单独的点击日志表中
                        return [2 /*return*/, true];
                    case 3:
                        error_12 = _a.sent();
                        console.error('记录广告点击失败:', error_12);
                        throw new Error('记录广告点击失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录广告转化
     * @param id 广告ID
     * @param userId 用户ID
     * @param value 转化价值
     * @param metadata 元数据 (可选)
     * @returns 是否记录成功
     */
    AdvertisementService.prototype.recordConversion = function (id, userId, value, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, error_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        // 直接更新记录，而不是使用不存在的incrementConversions方法
                        return [4 /*yield*/, advertisement.increment('conversions', { by: 1 })];
                    case 2:
                        // 直接更新记录，而不是使用不存在的incrementConversions方法
                        _a.sent();
                        // 创建转化记录
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.create({
                                kindergartenId: advertisement.get('kindergartenId'),
                                advertisementId: id,
                                parentId: userId,
                                conversionType: 4,
                                conversionSource: 'advertisement',
                                conversionEvent: 'ad_conversion',
                                eventValue: value,
                                eventTime: new Date(),
                                isFirstVisit: false,
                                conversionStatus: 1,
                                followUpStatus: 0 // 默认状态：未跟进
                            })];
                    case 3:
                        // 创建转化记录
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_13 = _a.sent();
                        console.error('记录广告转化失败:', error_13);
                        throw new Error('记录广告转化失败');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取指定营销活动关联的广告
     * @param campaignId 营销活动ID
     * @returns 广告列表
     */
    AdvertisementService.prototype.findByCampaignId = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisements, error_14;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, advertisement_model_1.Advertisement.findAll({
                                where: { campaignId: campaignId }
                            })];
                    case 1:
                        advertisements = _a.sent();
                        return [2 /*return*/, advertisements];
                    case 2:
                        error_14 = _a.sent();
                        console.error('获取活动关联广告失败:', error_14);
                        throw new Error('获取活动关联广告失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 关联广告到营销活动
     * @param id 广告ID
     * @param campaignId 营销活动ID
     * @returns 是否关联成功
     */
    AdvertisementService.prototype.linkToCampaign = function (id, campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, campaign, updated, error_15;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.findByPk(campaignId)];
                    case 2:
                        campaign = _a.sent();
                        if (!campaign) {
                            throw new Error('营销活动不存在');
                        }
                        return [4 /*yield*/, this.update(id, { campaignId: campaignId })];
                    case 3:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 4:
                        error_15 = _a.sent();
                        console.error('关联广告到营销活动失败:', error_15);
                        throw new Error('关联广告到营销活动失败');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 解除广告与营销活动的关联
     * @param id 广告ID
     * @returns 是否解除关联成功
     */
    AdvertisementService.prototype.unlinkFromCampaign = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisement, updated, error_16;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        return [4 /*yield*/, this.update(id, { campaignId: null })];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 3:
                        error_16 = _a.sent();
                        console.error('解除广告与营销活动的关联失败:', error_16);
                        throw new Error('解除广告与营销活动的关联失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 比较多个广告的效果
     * @param ids 广告ID数组
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 各广告效果数据
     */
    AdvertisementService.prototype.compareAds = function (ids, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, ids_1, id, performance_1, error_17;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        results = {};
                        _i = 0, ids_1 = ids;
                        _a.label = 1;
                    case 1:
                        if (!(_i < ids_1.length)) return [3 /*break*/, 4];
                        id = ids_1[_i];
                        return [4 /*yield*/, this.getPerformance(id, startDate, endDate)];
                    case 2:
                        performance_1 = _a.sent();
                        results[id] = performance_1;
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                    case 5:
                        error_17 = _a.sent();
                        console.error('比较广告效果失败:', error_17);
                        throw new Error('比较广告效果失败');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return AdvertisementService;
}());
exports.AdvertisementService = AdvertisementService;
exports["default"] = new AdvertisementService();
