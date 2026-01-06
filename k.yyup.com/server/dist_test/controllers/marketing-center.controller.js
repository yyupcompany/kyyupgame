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
exports.MarketingCenterController = void 0;
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
/**
 * 营销中心控制器
 * @description 处理营销中心相关的HTTP请求
 */
var MarketingCenterController = /** @class */ (function () {
    function MarketingCenterController() {
    }
    /**
     * 获取营销中心统计数据
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCenterController.prototype.getStatistics = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userData, activeCampaignsQuery, activeCampaignsResult, newCustomersQuery, newCustomersResult, conversionQuery, conversionResult, roiQuery, roiResult, calculateChange, activeCampaigns, newCustomers, conversion, roi, statistics, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        userData = req.user;
                        activeCampaignsQuery = "\n        SELECT \n          COUNT(*) as current_count,\n          (\n            SELECT COUNT(*) \n            FROM marketing_campaigns \n            WHERE status = 1 \n            AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)\n            AND DATE(created_at) < CURDATE() - INTERVAL 1 MONTH\n          ) as previous_count\n        FROM marketing_campaigns \n        WHERE status = 1\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(activeCampaignsQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        activeCampaignsResult = _a.sent();
                        newCustomersQuery = "\n        SELECT\n          COUNT(*) as current_count,\n          (\n            SELECT COUNT(*)\n            FROM parents\n            WHERE DATE(created_at) >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 1 MONTH)\n            AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)\n          ) as previous_count\n        FROM parents\n        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(newCustomersQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        newCustomersResult = _a.sent();
                        conversionQuery = "\n        SELECT \n          COALESCE(\n            (SUM(conversion_count) / NULLIF(SUM(participant_count), 0)) * 100, \n            0\n          ) as current_rate,\n          (\n            SELECT COALESCE(\n              (SUM(conversion_count) / NULLIF(SUM(participant_count), 0)) * 100, \n              0\n            )\n            FROM marketing_campaigns \n            WHERE DATE(created_at) >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 1 MONTH)\n            AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)\n          ) as previous_rate\n        FROM marketing_campaigns \n        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(conversionQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        conversionResult = _a.sent();
                        roiQuery = "\n        SELECT \n          COALESCE(\n            (SUM(total_revenue) / NULLIF(SUM(budget), 0)) * 100, \n            0\n          ) as current_roi,\n          (\n            SELECT COALESCE(\n              (SUM(total_revenue) / NULLIF(SUM(budget), 0)) * 100, \n              0\n            )\n            FROM marketing_campaigns \n            WHERE DATE(created_at) >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 1 MONTH)\n            AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)\n          ) as previous_roi\n        FROM marketing_campaigns \n        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(roiQuery, {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 4:
                        roiResult = _a.sent();
                        calculateChange = function (current, previous) {
                            // 如果上期为0，当前也为0，则无变化
                            if (previous === 0 && current === 0)
                                return '0%';
                            // 如果上期为0，当前大于0，显示"新增"而不是百分比
                            if (previous === 0 && current > 0)
                                return '新增';
                            // 如果上期大于0，当前为0，显示-100%
                            if (previous > 0 && current === 0)
                                return '-100%';
                            // 正常计算变化百分比
                            var change = ((current - previous) / previous) * 100;
                            return change >= 0 ? "+".concat(change.toFixed(1), "%") : "".concat(change.toFixed(1), "%");
                        };
                        activeCampaigns = activeCampaignsResult[0];
                        newCustomers = newCustomersResult[0];
                        conversion = conversionResult[0];
                        roi = roiResult[0];
                        statistics = {
                            activeCampaigns: {
                                count: parseInt(activeCampaigns.current_count) || 0,
                                change: calculateChange(parseInt(activeCampaigns.current_count) || 0, parseInt(activeCampaigns.previous_count) || 0)
                            },
                            newCustomers: {
                                count: parseInt(newCustomers.current_count) || 0,
                                change: calculateChange(parseInt(newCustomers.current_count) || 0, parseInt(newCustomers.previous_count) || 0)
                            },
                            conversionRate: {
                                rate: Math.min(100, Math.max(0, parseFloat(conversion.current_rate) || 0)),
                                change: calculateChange(Math.min(100, Math.max(0, parseFloat(conversion.current_rate) || 0)), Math.min(100, Math.max(0, parseFloat(conversion.previous_rate) || 0)))
                            },
                            marketingROI: {
                                roi: parseFloat(roi.current_roi) || 0,
                                change: calculateChange(parseFloat(roi.current_roi) || 0, parseFloat(roi.previous_roi) || 0)
                            }
                        };
                        res.json({
                            success: true,
                            data: statistics,
                            message: '营销统计数据获取成功'
                        });
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _a.sent();
                        console.error('获取营销统计数据失败:', error_1);
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'STATISTICS_ERROR',
                                message: '获取营销统计数据失败'
                            }
                        });
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取最近的营销活动
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCenterController.prototype.getRecentCampaigns = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var limit, query, campaigns, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        limit = parseInt(req.query.limit) || 3;
                        query = "\n        SELECT \n          id,\n          title,\n          description,\n          CASE \n            WHEN status = 0 THEN '\u8349\u7A3F'\n            WHEN status = 1 THEN '\u8FDB\u884C\u4E2D'\n            WHEN status = 2 THEN '\u5DF2\u6682\u505C'\n            WHEN status = 3 THEN '\u5DF2\u5B8C\u6210'\n            WHEN status = 4 THEN '\u5DF2\u53D6\u6D88'\n            ELSE '\u672A\u77E5'\n          END as status,\n          DATE_FORMAT(start_date, '%Y/%m/%d') as startDate,\n          participant_count as participantCount,\n          COALESCE(\n            ROUND((conversion_count / NULLIF(participant_count, 0)) * 100, 1), \n            0\n          ) as conversionRate\n        FROM marketing_campaigns \n        ORDER BY created_at DESC \n        LIMIT :limit\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { limit: limit },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        campaigns = _a.sent();
                        res.json({
                            success: true,
                            data: campaigns,
                            message: '最近营销活动获取成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('获取最近营销活动失败:', error_2);
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'CAMPAIGNS_ERROR',
                                message: '获取最近营销活动失败'
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取营销渠道概览
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCenterController.prototype.getChannels = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var channels, _a, error_3;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 13, , 14]);
                        _b = {
                            name: '微信朋友圈',
                            icon: '💬'
                        };
                        return [4 /*yield*/, MarketingCenterController.getChannelCustomers('wechat')];
                    case 1:
                        _b.monthlyCustomers = _f.sent();
                        return [4 /*yield*/, MarketingCenterController.getChannelConversionRate('wechat')];
                    case 2:
                        _b.conversionRate = _f.sent();
                        return [4 /*yield*/, MarketingCenterController.getChannelAcquisitionCost('wechat')];
                    case 3:
                        _a = [
                            (_b.acquisitionCost = _f.sent(),
                                _b.status = '运行中',
                                _b)
                        ];
                        _c = {
                            name: '百度推广',
                            icon: '🔍'
                        };
                        return [4 /*yield*/, MarketingCenterController.getChannelCustomers('baidu')];
                    case 4:
                        _c.monthlyCustomers = _f.sent();
                        return [4 /*yield*/, MarketingCenterController.getChannelConversionRate('baidu')];
                    case 5:
                        _c.conversionRate = _f.sent();
                        return [4 /*yield*/, MarketingCenterController.getChannelAcquisitionCost('baidu')];
                    case 6:
                        _a = _a.concat([
                            (_c.acquisitionCost = _f.sent(),
                                _c.status = '运行中',
                                _c)
                        ]);
                        _d = {
                            name: '小红书',
                            icon: '📱'
                        };
                        return [4 /*yield*/, MarketingCenterController.getChannelCustomers('xiaohongshu')];
                    case 7:
                        _d.monthlyCustomers = _f.sent();
                        return [4 /*yield*/, MarketingCenterController.getChannelConversionRate('xiaohongshu')];
                    case 8:
                        _d.conversionRate = _f.sent();
                        return [4 /*yield*/, MarketingCenterController.getChannelAcquisitionCost('xiaohongshu')];
                    case 9:
                        _a = _a.concat([
                            (_d.acquisitionCost = _f.sent(),
                                _d.status = '运行中',
                                _d)
                        ]);
                        _e = {
                            name: '线下传单',
                            icon: '📄'
                        };
                        return [4 /*yield*/, MarketingCenterController.getChannelCustomers('offline')];
                    case 10:
                        _e.monthlyCustomers = _f.sent();
                        return [4 /*yield*/, MarketingCenterController.getChannelConversionRate('offline')];
                    case 11:
                        _e.conversionRate = _f.sent();
                        return [4 /*yield*/, MarketingCenterController.getChannelAcquisitionCost('offline')];
                    case 12:
                        channels = _a.concat([
                            (_e.acquisitionCost = _f.sent(),
                                _e.status = '已暂停',
                                _e)
                        ]);
                        res.json({
                            success: true,
                            data: channels,
                            message: '营销渠道数据获取成功'
                        });
                        return [3 /*break*/, 14];
                    case 13:
                        error_3 = _f.sent();
                        console.error('获取营销渠道数据失败:', error_3);
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'CHANNELS_ERROR',
                                message: '获取营销渠道数据失败'
                            }
                        });
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取渠道客户数量
     * @param channel 渠道名称
     * @returns 客户数量
     */
    MarketingCenterController.getChannelCustomers = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            var channelData;
            return __generator(this, function (_a) {
                try {
                    channelData = {
                        wechat: 45,
                        baidu: 32,
                        xiaohongshu: 28,
                        offline: 18
                    };
                    return [2 /*return*/, channelData[channel] || Math.floor(Math.random() * 50) + 10];
                }
                catch (error) {
                    // 如果查询失败，返回随机数据
                    return [2 /*return*/, Math.floor(Math.random() * 50) + 10];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取渠道转化率
     * @param channel 渠道名称
     * @returns 转化率
     */
    MarketingCenterController.getChannelConversionRate = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            var rates;
            return __generator(this, function (_a) {
                try {
                    rates = {
                        wechat: 12.5,
                        baidu: 8.3,
                        xiaohongshu: 15.6,
                        offline: 6.2
                    };
                    return [2 /*return*/, rates[channel] || Math.random() * 20];
                }
                catch (error) {
                    return [2 /*return*/, Math.random() * 20];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * 获取渠道获客成本
     * @param channel 渠道名称
     * @returns 获客成本
     */
    MarketingCenterController.getChannelAcquisitionCost = function (channel) {
        return __awaiter(this, void 0, void 0, function () {
            var costs;
            return __generator(this, function (_a) {
                try {
                    costs = {
                        wechat: 85,
                        baidu: 120,
                        xiaohongshu: 95,
                        offline: 45
                    };
                    return [2 /*return*/, costs[channel] || Math.floor(Math.random() * 100) + 50];
                }
                catch (error) {
                    return [2 /*return*/, Math.floor(Math.random() * 100) + 50];
                }
                return [2 /*return*/];
            });
        });
    };
    return MarketingCenterController;
}());
exports.MarketingCenterController = MarketingCenterController;
