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
exports.ChannelTrackingService = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../../init");
var channel_tracking_model_1 = require("../../models/channel-tracking.model");
var conversion_tracking_model_1 = require("../../models/conversion-tracking.model");
/**
 * 渠道跟踪服务实现
 * @description 实现渠道跟踪管理相关的业务逻辑
 */
var ChannelTrackingService = /** @class */ (function () {
    function ChannelTrackingService() {
    }
    /**
     * 创建渠道跟踪记录
     * @param data 渠道跟踪创建数据
     * @returns 创建的渠道跟踪实例
     */
    ChannelTrackingService.prototype.create = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.create(data)];
                    case 1:
                        channel = _a.sent();
                        return [2 /*return*/, channel];
                    case 2:
                        error_1 = _a.sent();
                        console.error('创建渠道跟踪记录失败:', error_1);
                        throw new Error('创建渠道跟踪记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 根据ID查找渠道跟踪记录
     * @param id 渠道跟踪ID
     * @returns 渠道跟踪实例或null
     */
    ChannelTrackingService.prototype.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.findByPk(id)];
                    case 1:
                        channel = _a.sent();
                        return [2 /*return*/, channel];
                    case 2:
                        error_2 = _a.sent();
                        console.error('查询渠道跟踪记录失败:', error_2);
                        throw new Error('查询渠道跟踪记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 查询所有符合条件的渠道跟踪记录
     * @param options 查询选项
     * @returns 渠道跟踪数组
     */
    ChannelTrackingService.prototype.findAll = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var channels, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.findAll(options)];
                    case 1:
                        channels = _a.sent();
                        return [2 /*return*/, channels];
                    case 2:
                        error_3 = _a.sent();
                        console.error('查询渠道跟踪列表失败:', error_3);
                        throw new Error('查询渠道跟踪列表失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新渠道跟踪信息
     * @param id 渠道跟踪ID
     * @param data 更新数据
     * @returns 是否更新成功
     */
    ChannelTrackingService.prototype.update = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.update(data, {
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = (_a.sent())[0];
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_4 = _a.sent();
                        console.error('更新渠道跟踪记录失败:', error_4);
                        throw new Error('更新渠道跟踪记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除渠道跟踪记录
     * @param id 渠道跟踪ID
     * @returns 是否删除成功
     */
    ChannelTrackingService.prototype["delete"] = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var affectedCount, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.destroy({
                                where: { id: id }
                            })];
                    case 1:
                        affectedCount = _a.sent();
                        return [2 /*return*/, affectedCount > 0];
                    case 2:
                        error_5 = _a.sent();
                        console.error('删除渠道跟踪记录失败:', error_5);
                        throw new Error('删除渠道跟踪记录失败');
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取渠道统计信息
     * @param kindergartenId 幼儿园ID
     * @returns 统计信息
     */
    ChannelTrackingService.prototype.getStats = function (kindergartenId) {
        return __awaiter(this, void 0, void 0, function () {
            var total, active, channels, bySource_1, topChannels, totalVisits, totalConversions, conversionRate, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, , 7]);
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.count({
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 1:
                        total = _a.sent();
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.count({
                                where: {
                                    kindergartenId: kindergartenId,
                                    status: 1
                                }
                            })];
                    case 2:
                        active = _a.sent();
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.findAll({
                                where: { kindergartenId: kindergartenId },
                                attributes: ['utmSource', [init_1.sequelize.fn('COUNT', init_1.sequelize.col('id')), 'count']],
                                group: ['utmSource'],
                                raw: true
                            })];
                    case 3:
                        channels = _a.sent();
                        bySource_1 = {};
                        channels.forEach(function (channel) {
                            if (channel.utmSource) {
                                bySource_1[channel.utmSource] = channel.count;
                            }
                            else {
                                bySource_1['未知'] = (bySource_1['未知'] || 0) + channel.count;
                            }
                        });
                        topChannels = __spreadArray([], channels, true).filter(function (channel) { return channel.utmSource; })
                            .sort(function (a, b) { return b.count - a.count; })
                            .slice(0, 5)
                            .map(function (channel) { return ({ name: channel.utmSource || '未知', count: channel.count }); });
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.sum('visitCount', {
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 4:
                        totalVisits = (_a.sent()) || 0;
                        return [4 /*yield*/, channel_tracking_model_1.ChannelTracking.sum('conversionCount', {
                                where: { kindergartenId: kindergartenId }
                            })];
                    case 5:
                        totalConversions = (_a.sent()) || 0;
                        conversionRate = totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;
                        return [2 /*return*/, {
                                total: total,
                                active: active,
                                bySource: bySource_1,
                                topChannels: topChannels,
                                conversionRate: conversionRate
                            }];
                    case 6:
                        error_6 = _a.sent();
                        console.error('获取渠道统计信息失败:', error_6);
                        throw new Error('获取渠道统计信息失败');
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取渠道性能数据
     * @param channelId 渠道ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 渠道性能数据
     */
    ChannelTrackingService.prototype.getPerformance = function (channelId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, conversions, totalConversions, totalValue, views, clicks, leads, cost, conversionRate, cpl, cpa, roi, error_7;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(channelId)];
                    case 1:
                        channel = _b.sent();
                        if (!channel) {
                            throw new Error('渠道不存在');
                        }
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.findAll({
                                where: {
                                    channelId: channelId,
                                    createdAt: (_a = {},
                                        _a[sequelize_1.Op.between] = [startDate, endDate],
                                        _a)
                                }
                            })];
                    case 2:
                        conversions = _b.sent();
                        totalConversions = conversions.length;
                        totalValue = conversions.reduce(function (sum, conv) { return sum + conv.get('value'); }, 0);
                        views = channel.get('visitCount');
                        clicks = views;
                        leads = channel.get('leadCount');
                        cost = channel.get('cost') || 0;
                        conversionRate = clicks > 0 ? (totalConversions / clicks) * 100 : 0;
                        cpl = leads > 0 ? cost / leads : 0;
                        cpa = totalConversions > 0 ? cost / totalConversions : 0;
                        roi = cost > 0 ? ((totalValue - cost) / cost) * 100 : 0;
                        return [2 /*return*/, {
                                views: views,
                                clicks: clicks,
                                leads: leads,
                                conversions: totalConversions,
                                conversionRate: conversionRate,
                                cost: cost,
                                cpl: cpl,
                                cpa: cpa,
                                roi: roi
                            }];
                    case 3:
                        error_7 = _b.sent();
                        console.error('获取渠道性能数据失败:', error_7);
                        throw new Error('获取渠道性能数据失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录渠道点击
     * @param channelId 渠道ID
     * @param userId 用户ID (可选)
     * @param metadata 元数据 (可选)
     * @returns 是否记录成功
     */
    ChannelTrackingService.prototype.recordClick = function (channelId, userId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(channelId)];
                    case 1:
                        channel = _a.sent();
                        if (!channel) {
                            throw new Error('渠道不存在');
                        }
                        // 使用标准的 increment 方法替代自定义方法
                        return [4 /*yield*/, channel.increment('visitCount', { by: 1 })];
                    case 2:
                        // 使用标准的 increment 方法替代自定义方法
                        _a.sent();
                        // TODO: 记录点击详情到点击日志表
                        // 这里可以记录userId和metadata到一个单独的点击日志表中
                        return [2 /*return*/, true];
                    case 3:
                        error_8 = _a.sent();
                        console.error('记录渠道点击失败:', error_8);
                        throw new Error('记录渠道点击失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录潜在客户
     * @param channelId 渠道ID
     * @param userId 用户ID
     * @param metadata 元数据 (可选)
     * @returns 是否记录成功
     */
    ChannelTrackingService.prototype.recordLead = function (channelId, userId, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.findById(channelId)];
                    case 1:
                        channel = _a.sent();
                        if (!channel) {
                            throw new Error('渠道不存在');
                        }
                        // 使用标准的 increment 方法替代自定义方法
                        return [4 /*yield*/, channel.increment('leadCount', { by: 1 })];
                    case 2:
                        // 使用标准的 increment 方法替代自定义方法
                        _a.sent();
                        // TODO: 记录潜在客户详情到潜在客户日志表
                        // 这里可以记录userId和metadata到一个单独的潜在客户日志表中
                        return [2 /*return*/, true];
                    case 3:
                        error_9 = _a.sent();
                        console.error('记录渠道潜在客户失败:', error_9);
                        throw new Error('记录渠道潜在客户失败');
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 记录渠道转化
     * @param channelId 渠道ID
     * @param userId 用户ID
     * @param value 转化价值
     * @param metadata 元数据 (可选)
     * @returns 是否记录成功
     */
    ChannelTrackingService.prototype.recordConversion = function (channelId, userId, value, metadata) {
        return __awaiter(this, void 0, void 0, function () {
            var channel, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, this.findById(channelId)];
                    case 1:
                        channel = _a.sent();
                        if (!channel) {
                            throw new Error('渠道不存在');
                        }
                        // 使用标准的 increment 方法替代自定义方法
                        return [4 /*yield*/, channel.increment('conversionCount', { by: 1 })];
                    case 2:
                        // 使用标准的 increment 方法替代自定义方法
                        _a.sent();
                        // 创建转化记录
                        return [4 /*yield*/, conversion_tracking_model_1.ConversionTracking.create({
                                kindergartenId: channel.get('kindergartenId'),
                                channelId: channelId,
                                parentId: userId,
                                conversionType: 4,
                                conversionSource: 'channel',
                                conversionEvent: 'channel_conversion',
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
                        error_10 = _a.sent();
                        console.error('记录渠道转化失败:', error_10);
                        throw new Error('记录渠道转化失败');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 生成UTM跟踪链接
     * @param baseUrl 基础URL
     * @param channel 渠道信息
     * @returns 跟踪链接
     */
    ChannelTrackingService.prototype.generateTrackingUrl = function (baseUrl, channel) {
        var url = new URL(baseUrl);
        // 添加UTM参数
        url.searchParams.append('utm_source', channel.source);
        url.searchParams.append('utm_medium', channel.medium);
        url.searchParams.append('utm_campaign', channel.campaign);
        if (channel.term) {
            url.searchParams.append('utm_term', channel.term);
        }
        if (channel.content) {
            url.searchParams.append('utm_content', channel.content);
        }
        return url.toString();
    };
    /**
     * 获取渠道归因分析
     * @param kindergartenId 幼儿园ID
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 归因分析结果
     */
    ChannelTrackingService.prototype.getAttributionAnalysis = function (kindergartenId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // 这里应该实现实际的归因分析逻辑
                    // 需要查询用户接触点和转化数据
                    // 示例数据
                    return [2 /*return*/, {
                            firstTouch: {
                                "搜索引擎": 35,
                                "社交媒体": 25,
                                "直接访问": 20,
                                "邮件营销": 15,
                                "其他": 5
                            },
                            lastTouch: {
                                "搜索引擎": 30,
                                "社交媒体": 20,
                                "直接访问": 25,
                                "邮件营销": 20,
                                "其他": 5
                            },
                            linearAttribution: {
                                "搜索引擎": 32,
                                "社交媒体": 23,
                                "直接访问": 22,
                                "邮件营销": 18,
                                "其他": 5
                            },
                            timeDecay: {
                                "搜索引擎": 31,
                                "社交媒体": 21,
                                "直接访问": 24,
                                "邮件营销": 19,
                                "其他": 5
                            }
                        }];
                }
                catch (error) {
                    console.error('获取渠道归因分析失败:', error);
                    throw new Error('获取渠道归因分析失败');
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 比较多个渠道的性能
     * @param channelIds 渠道ID数组
     * @param startDate 开始日期
     * @param endDate 结束日期
     * @returns 各渠道性能数据
     */
    ChannelTrackingService.prototype.compareChannels = function (channelIds, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function () {
            var results, _i, channelIds_1, channelId, performance_1, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        results = {};
                        _i = 0, channelIds_1 = channelIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < channelIds_1.length)) return [3 /*break*/, 4];
                        channelId = channelIds_1[_i];
                        return [4 /*yield*/, this.getPerformance(channelId, startDate, endDate)];
                    case 2:
                        performance_1 = _a.sent();
                        results[channelId] = performance_1;
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, results];
                    case 5:
                        error_11 = _a.sent();
                        console.error('比较渠道性能失败:', error_11);
                        throw new Error('比较渠道性能失败');
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return ChannelTrackingService;
}());
exports.ChannelTrackingService = ChannelTrackingService;
exports["default"] = new ChannelTrackingService();
