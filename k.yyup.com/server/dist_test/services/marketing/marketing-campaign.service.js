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
exports.MarketingCampaignService = void 0;
var sequelize_1 = require("sequelize");
var marketing_campaign_model_1 = require("../../models/marketing-campaign.model");
var advertisement_model_1 = require("../../models/advertisement.model");
/**
 * 营销活动服务实现
 * @description 实现营销活动管理相关的业务逻辑
 */
var MarketingCampaignService = /** @class */ (function () {
    function MarketingCampaignService() {
    }
    /**
     * 创建营销活动
     * @param data 营销活动创建数据
     * @returns 创建的营销活动实例
     */
    MarketingCampaignService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.create(data)];
                    case 1:
                        campaign = _a.sent();
                        return [2 /*return*/, campaign];
                    case 2:
                        error_1 = _a.sent();
                        console.error('创建营销活动失败:', error_1);
                        throw new Error('创建营销活动失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID查找营销活动
     * @param id 营销活动ID
     * @returns 营销活动实例或null
     */
    MarketingCampaignService.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.findByPk(id)];
                    case 1:
                        campaign = _a.sent();
                        return [2 /*return*/, campaign];
                    case 2:
                        error_2 = _a.sent();
                        console.error('查询营销活动失败:', error_2);
                        throw new Error('查询营销活动失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询所有符合条件的营销活动
     * @param options 查询选项
     * @returns 营销活动数组
     */
    MarketingCampaignService.prototype.findAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var campaigns, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.findAll(options)];
                    case 1:
                        campaigns = _a.sent();
                        return [2 /*return*/, campaigns];
                    case 2:
                        error_3 = _a.sent();
                        console.error('查询营销活动列表失败:', error_3);
                        throw new Error('查询营销活动列表失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新营销活动信息
     * @param id 营销活动ID
     * @param data 更新数据
     * @returns 是否更新成功
     */
    MarketingCampaignService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.update(data, {
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = (_a.sent())[0];
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_4 = _a.sent();
                        console.error('更新营销活动失败:', error_4);
                        throw new Error('更新营销活动失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除营销活动
     * @param id 营销活动ID
     * @returns 是否删除成功
     */
    MarketingCampaignService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.destroy({
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = _a.sent();
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_5 = _a.sent();
                        console.error('删除营销活动失败:', error_5);
                        throw new Error('删除营销活动失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启动营销活动
     * @param id 营销活动ID
     * @returns 是否启动成功
     */
    MarketingCampaignService.prototype.launch = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, status_1, now, updated, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        campaign = _a.sent();
                        if (!campaign) {
                            throw new Error('营销活动不存在');
                        }
                        status_1 = campaign.get('status');
                        if (status_1 === marketing_campaign_model_1.CampaignStatus.ONGOING) {
                            return [2 /*return*/, true]; // 已经是活跃状态，无需操作
                        }
                        now = new Date();
                        return [4 /*yield*/, this.update(id, {
                                status: marketing_campaign_model_1.CampaignStatus.ONGOING,
                                startDate: campaign.get('startDate') || now,
                                launchedAt: now
                            })];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 3:
                        error_6 = _a.sent();
                        console.error('启动营销活动失败:', error_6);
                        throw new Error('启动营销活动失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 暂停营销活动
     * @param id 营销活动ID
     * @returns 是否暂停成功
     */
    MarketingCampaignService.prototype.pause = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, status_2, updated, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        campaign = _a.sent();
                        if (!campaign) {
                            throw new Error('营销活动不存在');
                        }
                        status_2 = campaign.get('status');
                        if (status_2 === marketing_campaign_model_1.CampaignStatus.PAUSED) {
                            return [2 /*return*/, true]; // 已经是暂停状态，无需操作
                        }
                        if (status_2 === marketing_campaign_model_1.CampaignStatus.ENDED || status_2 === marketing_campaign_model_1.CampaignStatus.CANCELLED) {
                            throw new Error('已结束或已取消的营销活动不能暂停');
                        }
                        return [4 /*yield*/, this.update(id, {
                                status: marketing_campaign_model_1.CampaignStatus.PAUSED,
                                pausedAt: new Date()
                            })];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 3:
                        error_7 = _a.sent();
                        console.error('暂停营销活动失败:', error_7);
                        throw new Error('暂停营销活动失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 结束营销活动
     * @param id 营销活动ID
     * @returns 是否结束成功
     */
    MarketingCampaignService.prototype.end = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, status_3, updated, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        campaign = _a.sent();
                        if (!campaign) {
                            throw new Error('营销活动不存在');
                        }
                        status_3 = campaign.get('status');
                        if (status_3 === marketing_campaign_model_1.CampaignStatus.ENDED || status_3 === marketing_campaign_model_1.CampaignStatus.CANCELLED) {
                            return [2 /*return*/, true]; // 已经是结束状态，无需操作
                        }
                        return [4 /*yield*/, this.update(id, {
                                status: marketing_campaign_model_1.CampaignStatus.ENDED,
                                endDate: campaign.get('endDate') || new Date(),
                                completedAt: new Date()
                            })];
                    case 2:
                        updated = _a.sent();
                        return [2 /*return*/, updated];
                    case 3:
                        error_8 = _a.sent();
                        console.error('结束营销活动失败:', error_8);
                        throw new Error('结束营销活动失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取营销活动统计信息
     * @param kindergartenId 幼儿园ID
     * @returns 统计信息
     */
    MarketingCampaignService.prototype.getStats = function (kindergartenId) {
        return __awaiter(this, void 0, void 0, function () {
            var now, total, activeCount, completedCount, upcomingCount, statusDistribution, _a, typeDistribution, topParticipants, topConversions, monthlyStats, error_9;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 6, , 7]);
                        now = new Date();
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.count({
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 1:
                        total = _f.sent();
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: marketing_campaign_model_1.CampaignStatus.ONGOING,
                                    startDate: (_b = {}, _b[sequelize_1.Op.lte] = now, _b),
                                    endDate: (_c = {}, _c[sequelize_1.Op.gt] = now, _c)
                                }
                            })];
                    case 2:
                        activeCount = _f.sent();
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: [marketing_campaign_model_1.CampaignStatus.ENDED, marketing_campaign_model_1.CampaignStatus.CANCELLED]
                                }
                            })];
                    case 3:
                        completedCount = _f.sent();
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: [marketing_campaign_model_1.CampaignStatus.DRAFT, marketing_campaign_model_1.CampaignStatus.ONGOING],
                                    startDate: (_d = {}, _d[sequelize_1.Op.gt] = now, _d)
                                }
                            })];
                    case 4:
                        upcomingCount = _f.sent();
                        _e = {
                            "活跃": activeCount,
                            "已完成": completedCount,
                            "即将开始": upcomingCount
                        };
                        _a = "草稿";
                        return [4 /*yield*/, marketing_campaign_model_1.MarketingCampaign.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: marketing_campaign_model_1.CampaignStatus.DRAFT
                                }
                            })];
                    case 5:
                        statusDistribution = (_e[_a] = _f.sent(),
                            _e);
                        typeDistribution = {
                            "线上": 0,
                            "线下": 0,
                            "混合": 0
                        };
                        topParticipants = [];
                        topConversions = [];
                        monthlyStats = [];
                        return [2 /*return*/, {
                                total: total,
                                statusDistribution: statusDistribution,
                                typeDistribution: typeDistribution,
                                topParticipants: topParticipants,
                                topConversions: topConversions,
                                monthlyStats: monthlyStats
                            }];
                    case 6:
                        error_9 = _f.sent();
                        console.error('获取营销活动统计失败:', error_9);
                        throw new Error('获取营销活动统计失败');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取营销活动成效
     * @param id 营销活动ID
     * @returns 营销活动成效数据
     */
    MarketingCampaignService.prototype.getPerformance = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.findById(id)];
                    case 1:
                        campaign = _a.sent();
                        if (!campaign) {
                            throw new Error('营销活动不存在');
                        }
                        // 这里仅返回示例数据，实际项目中应当从数据库聚合查询
                        return [2 /*return*/, {
                                campaignInfo: {
                                    id: campaign.get('id'),
                                    title: campaign.get('title'),
                                    campaignType: campaign.get('type') || 0,
                                    campaignTypeText: this.getCampaignTypeText(campaign.get('type') || 0),
                                    startDate: campaign.get('startDate'),
                                    endDate: campaign.get('endDate'),
                                    status: campaign.get('status'),
                                    statusText: this.getStatusText(campaign.get('status')),
                                    duration: this.calculateDuration(campaign.get('startDate'), campaign.get('endDate'))
                                },
                                metrics: {
                                    views: 0,
                                    participants: 0,
                                    conversions: 0,
                                    conversionRate: 0,
                                    revenue: 0,
                                    costPerConversion: 0,
                                    roi: 0
                                },
                                dailyTrends: [],
                                adPerformance: [],
                                channelPerformance: []
                            }];
                    case 2:
                        error_10 = _a.sent();
                        console.error('获取营销活动成效失败:', error_10);
                        throw new Error('获取营销活动成效失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动类型文本
     * @param type 活动类型编号
     * @returns 活动类型文本
     */
    MarketingCampaignService.prototype.getCampaignTypeText = function (type) {
        var typeMap = {
            0: '未知',
            1: '线上活动',
            2: '线下活动',
            3: '混合活动'
        };
        return typeMap[type] || '未知';
    };
    /**
     * 获取状态文本
     * @param status 状态编号
     * @returns 状态文本
     */
    MarketingCampaignService.prototype.getStatusText = function (status) {
        var statusMap = {
            0: '草稿',
            1: '活跃',
            2: '已暂停',
            3: '已完成',
            4: '已取消'
        };
        return statusMap[status] || '未知状态';
    };
    /**
     * 计算活动持续时间（天数）
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 持续天数
     */
    MarketingCampaignService.prototype.calculateDuration = function (startDate, endDate) {
        if (!startDate || !endDate)
            return 0;
        var diffTime = endDate.getTime() - startDate.getTime();
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    };
    /**
     * 关联营销活动与广告
     * @param campaignId 营销活动ID
     * @param advertisementId 广告ID
     * @returns 是否关联成功
     */
    MarketingCampaignService.prototype.linkAdvertisement = function (campaignId, advertisementId) {
        return __awaiter(this, void 0, void 0, function () {
            var campaign, advertisement, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.findById(campaignId)];
                    case 1:
                        campaign = _a.sent();
                        if (!campaign) {
                            throw new Error('营销活动不存在');
                        }
                        return [4 /*yield*/, advertisement_model_1.Advertisement.findByPk(advertisementId)];
                    case 2:
                        advertisement = _a.sent();
                        if (!advertisement) {
                            throw new Error('广告不存在');
                        }
                        // 更新广告的campaignId
                        return [4 /*yield*/, advertisement.update({ campaignId: campaignId })];
                    case 3:
                        // 更新广告的campaignId
                        _a.sent();
                        return [2 /*return*/, true];
                    case 4:
                        error_11 = _a.sent();
                        console.error('关联营销活动与广告失败:', error_11);
                        throw new Error('关联营销活动与广告失败');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取营销活动关联的所有广告
     * @param campaignId 营销活动ID
     * @returns 广告列表
     */
    MarketingCampaignService.prototype.getLinkedAdvertisements = function (campaignId) {
        return __awaiter(this, void 0, void 0, function () {
            var advertisements, error_12;
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
                        error_12 = _a.sent();
                        console.error('获取营销活动关联广告失败:', error_12);
                        throw new Error('获取营销活动关联广告失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return MarketingCampaignService;
}());
exports.MarketingCampaignService = MarketingCampaignService;
exports["default"] = new MarketingCampaignService();
