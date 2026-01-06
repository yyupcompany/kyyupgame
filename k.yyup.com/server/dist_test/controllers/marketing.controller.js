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
exports.MarketingController = void 0;
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var poster_generation_service_1 = require("../services/poster-generation.service");
var MarketingController = /** @class */ (function () {
    function MarketingController() {
        var _this = this;
        /**
         * 获取营销分析数据
         * @param req 请求
         * @param res 响应
         */
        this.getAnalysis = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, timeRange, channelStats, monthlyTrends, activityStats, channelStatsArray, monthlyTrendsArray, activityStatsArray, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 4, , 5]);
                        _a = req.query.timeRange, timeRange = _a === void 0 ? 'month' : _a;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          COALESCE(ea.source_channel, '\u672A\u77E5\u6E20\u9053') as channel,\n          COUNT(*) as applicationCount,\n          COUNT(CASE WHEN ar.result_type = 1 THEN 1 END) as conversionCount,\n          ROUND(COUNT(CASE WHEN ar.result_type = 1 THEN 1 END) * 100.0 / COUNT(*), 2) as conversionRate\n        FROM enrollment_applications ea\n        LEFT JOIN admission_results ar ON ea.id = ar.application_id\n        WHERE ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)\n          AND ea.deleted_at IS NULL\n        GROUP BY ea.source_channel\n        ORDER BY applicationCount DESC\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        channelStats = (_c.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          DATE_FORMAT(ea.created_at, '%Y-%m') as month,\n          COUNT(*) as applications,\n          COUNT(CASE WHEN ar.result_type = 1 THEN 1 END) as conversions,\n          ROUND(AVG(CASE WHEN ar.result_type = 1 THEN 1 ELSE 0 END) * 100, 2) as conversionRate\n        FROM enrollment_applications ea\n        LEFT JOIN admission_results ar ON ea.id = ar.application_id\n        WHERE ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)\n          AND ea.deleted_at IS NULL\n        GROUP BY DATE_FORMAT(ea.created_at, '%Y-%m')\n        ORDER BY month ASC\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 2:
                        monthlyTrends = (_c.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          a.title as activityName,\n          a.activity_type as activityType,\n          COUNT(ar.id) as participantCount,\n          COUNT(ea.id) as generatedApplications,\n          ROUND(COUNT(ea.id) * 100.0 / NULLIF(COUNT(ar.id), 0), 2) as applicationRate\n        FROM activities a\n        LEFT JOIN activity_registrations ar ON a.id = ar.activity_id AND ar.deleted_at IS NULL\n        LEFT JOIN enrollment_applications ea ON ar.participant_phone = ea.phone AND ea.created_at >= a.start_time\n        WHERE a.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)\n          AND a.deleted_at IS NULL\n        GROUP BY a.id\n        HAVING participantCount > 0\n        ORDER BY applicationRate DESC\n        LIMIT 10\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 3:
                        activityStats = (_c.sent())[0];
                        channelStatsArray = Array.isArray(channelStats) ? channelStats : (channelStats ? [channelStats] : []);
                        monthlyTrendsArray = Array.isArray(monthlyTrends) ? monthlyTrends : (monthlyTrends ? [monthlyTrends] : []);
                        activityStatsArray = Array.isArray(activityStats) ? activityStats : (activityStats ? [activityStats] : []);
                        res.json({
                            success: true,
                            message: '获取营销分析数据成功',
                            data: {
                                channelAnalysis: channelStatsArray.map(function (channel) { return ({
                                    channel: channel.channel,
                                    applicationCount: parseInt(channel.applicationCount) || 0,
                                    conversionCount: parseInt(channel.conversionCount) || 0,
                                    conversionRate: parseFloat(channel.conversionRate) || 0
                                }); }),
                                monthlyTrends: monthlyTrendsArray.map(function (trend) { return ({
                                    month: trend.month,
                                    applications: parseInt(trend.applications) || 0,
                                    conversions: parseInt(trend.conversions) || 0,
                                    conversionRate: parseFloat(trend.conversionRate) || 0
                                }); }),
                                activityEffectiveness: activityStatsArray.map(function (activity) { return ({
                                    activityName: activity.activityName,
                                    activityType: activity.activityType,
                                    participantCount: parseInt(activity.participantCount) || 0,
                                    generatedApplications: parseInt(activity.generatedApplications) || 0,
                                    applicationRate: parseFloat(activity.applicationRate) || 0
                                }); }),
                                summary: {
                                    totalChannels: channelStatsArray.length,
                                    bestChannel: ((_b = channelStatsArray[0]) === null || _b === void 0 ? void 0 : _b.channel) || '未知',
                                    averageConversionRate: channelStatsArray.reduce(function (sum, channel) {
                                        return sum + (parseFloat(channel.conversionRate) || 0);
                                    }, 0) / Math.max(channelStatsArray.length, 1),
                                    totalActivities: activityStatsArray.length
                                }
                            }
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        this.handleError(res, error_1, '获取营销分析数据失败');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取营销活动ROI分析
         * @param req 请求
         * @param res 响应
         */
        this.getROIAnalysis = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var roiData;
            return __generator(this, function (_a) {
                try {
                    roiData = [
                        {
                            campaign: '春季招生活动',
                            investment: 5000,
                            leads: 120,
                            conversions: 25,
                            revenue: 37500,
                            roi: 650,
                            costPerLead: 41.67,
                            costPerConversion: 200
                        },
                        {
                            campaign: '线上推广',
                            investment: 3000,
                            leads: 80,
                            conversions: 15,
                            revenue: 22500,
                            roi: 650,
                            costPerLead: 37.5,
                            costPerConversion: 200
                        },
                        {
                            campaign: '社区活动',
                            investment: 2000,
                            leads: 60,
                            conversions: 18,
                            revenue: 27000,
                            roi: 1250,
                            costPerLead: 33.33,
                            costPerConversion: 111.11
                        }
                    ];
                    res.json({
                        success: true,
                        message: '获取营销ROI分析成功',
                        data: {
                            campaigns: roiData,
                            totalInvestment: roiData.reduce(function (sum, campaign) { return sum + campaign.investment; }, 0),
                            totalRevenue: roiData.reduce(function (sum, campaign) { return sum + campaign.revenue; }, 0),
                            averageROI: roiData.reduce(function (sum, campaign) { return sum + campaign.roi; }, 0) / roiData.length
                        }
                    });
                }
                catch (error) {
                    this.handleError(res, error, '获取营销ROI分析失败');
                }
                return [2 /*return*/];
            });
        }); };
        /**
         * 渠道：列表
         */
        this.getChannels = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, _d, keyword, _e, tag, _f, rows, count, total, error_2;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        _g.trys.push([0, 2, , 3]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, _d = _a.keyword, keyword = _d === void 0 ? '' : _d, _e = _a.tag, tag = _e === void 0 ? '' : _e;
                        return [4 /*yield*/, Promise.all([
                                init_1.sequelize.query("SELECT id, channel_name AS channelName, channel_type AS channelType, utm_source AS utmSource,\n                  visit_count AS visitCount, lead_count AS leadCount, conversion_count AS conversionCount,\n                  ROUND(COALESCE(conversion_rate, CASE WHEN lead_count > 0 THEN conversion_count * 100.0 / lead_count ELSE 0 END), 2) AS conversionRate,\n                  cost, revenue, roi, created_at AS createdAt\n           FROM channel_trackings\n           WHERE deleted_at IS NULL\n             ".concat(keyword ? "AND (channel_name LIKE :kw OR utm_source LIKE :kw)" : '', "\n           ORDER BY created_at DESC\n           LIMIT :limit OFFSET :offset"), {
                                    type: sequelize_1.QueryTypes.SELECT,
                                    replacements: {
                                        kw: "%".concat(keyword, "%"),
                                        limit: Number(pageSize),
                                        offset: (Number(page) - 1) * Number(pageSize)
                                    }
                                }),
                                init_1.sequelize.query("SELECT COUNT(*) AS cnt FROM channel_trackings WHERE deleted_at IS NULL ".concat(keyword ? "AND (channel_name LIKE :kw OR utm_source LIKE :kw)" : ''), { type: sequelize_1.QueryTypes.SELECT, replacements: { kw: "%".concat(keyword, "%") } })
                            ])];
                    case 1:
                        _f = _g.sent(), rows = _f[0], count = _f[1];
                        total = Array.isArray(count) ? Number(count[0].cnt || 0) : 0;
                        res.json({
                            success: true,
                            message: '获取渠道列表成功',
                            data: { items: rows, total: total, page: Number(page), pageSize: Number(pageSize) }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _g.sent();
                        this.handleError(res, error_2, '获取渠道列表失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /** 渠道：创建 */
        this.createChannel = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({ success: true, message: '创建渠道成功', data: __assign({ id: 0 }, req.body) });
                }
                catch (error) {
                    this.handleError(res, error, '创建渠道失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道：更新 */
        this.updateChannel = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var id;
            return __generator(this, function (_a) {
                try {
                    id = req.params.id;
                    res.json({ success: true, message: '更新渠道成功', data: __assign({ id: Number(id) }, req.body) });
                }
                catch (error) {
                    this.handleError(res, error, '更新渠道失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道：删除 */
        this.deleteChannel = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({ success: true, message: '删除渠道成功', data: null });
                }
                catch (error) {
                    this.handleError(res, error, '删除渠道失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道人：列表 */
        this.getChannelContacts = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({ success: true, message: '获取渠道人成功', data: { items: [], total: 0 } });
                }
                catch (error) {
                    this.handleError(res, error, '获取渠道人失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道人：新增 */
        this.addChannelContact = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({ success: true, message: '新增渠道人成功', data: __assign({ id: 0 }, req.body) });
                }
                catch (error) {
                    this.handleError(res, error, '新增渠道人失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道人：删除 */
        this.deleteChannelContact = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({ success: true, message: '删除渠道人成功', data: null });
                }
                catch (error) {
                    this.handleError(res, error, '删除渠道人失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 获取所有可用标签 */
        this.getAllChannelTags = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var availableTags;
            return __generator(this, function (_a) {
                try {
                    availableTags = [
                        '重要', '推荐', '热门', '新渠道', '高转化', '低成本',
                        '线上', '线下', '社交媒体', '搜索引擎', '合作伙伴', '直销',
                        '付费推广', '免费推广', '口碑营销', '内容营销'
                    ];
                    res.json({
                        success: true,
                        message: '获取可用标签成功',
                        data: { items: availableTags }
                    });
                }
                catch (error) {
                    this.handleError(res, error, '获取可用标签失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道标签：列表 */
        this.getChannelTags = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({ success: true, message: '获取渠道标签成功', data: { items: [] } });
                }
                catch (error) {
                    this.handleError(res, error, '获取渠道标签失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道标签：新增 */
        this.addChannelTags = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var tagIds;
            return __generator(this, function (_a) {
                try {
                    tagIds = (req.body && (req.body.tagIds || req.body.names)) || [];
                    res.json({ success: true, message: '添加渠道标签成功', data: { items: tagIds } });
                }
                catch (error) {
                    this.handleError(res, error, '添加渠道标签失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道标签：删除 */
        this.deleteChannelTag = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({ success: true, message: '删除渠道标签成功', data: null });
                }
                catch (error) {
                    this.handleError(res, error, '删除渠道标签失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 渠道指标 */
        this.getChannelMetrics = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({
                        success: true,
                        message: '获取渠道指标成功',
                        data: {
                            leads: 0,
                            visits: 0,
                            preEnroll: 0,
                            enroll: 0,
                            convRates: {
                                lead_to_visit: 0,
                                visit_to_aware: 0,
                                aware_to_pre_enroll: 0,
                                pre_enroll_to_enroll: 0
                            },
                            trend: []
                        }
                    });
                }
                catch (error) {
                    this.handleError(res, error, '获取渠道指标失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 老带新：列表 */
        this.getReferrals = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, _d, referrerName, _e, refereeName, _f, status_1, _g, activityId, _h, startDate, _j, endDate, offset, whereClause, params, queryResult, items, countQueryResult, countResult, itemsArray, total, formattedItems, error_3;
            var _k;
            return __generator(this, function (_l) {
                switch (_l.label) {
                    case 0:
                        _l.trys.push([0, 3, , 4]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 20 : _c, _d = _a.referrerName, referrerName = _d === void 0 ? '' : _d, _e = _a.refereeName, refereeName = _e === void 0 ? '' : _e, _f = _a.status, status_1 = _f === void 0 ? '' : _f, _g = _a.activityId, activityId = _g === void 0 ? '' : _g, _h = _a.startDate, startDate = _h === void 0 ? '' : _h, _j = _a.endDate, endDate = _j === void 0 ? '' : _j;
                        offset = (parseInt(page) - 1) * parseInt(pageSize);
                        whereClause = 'WHERE 1=1';
                        params = [];
                        if (referrerName) {
                            whereClause += ' AND r.referrer_id IN (SELECT id FROM users WHERE real_name LIKE ?)';
                            params.push("%".concat(referrerName, "%"));
                        }
                        if (refereeName) {
                            whereClause += ' AND r.referee_name LIKE ?';
                            params.push("%".concat(refereeName, "%"));
                        }
                        if (status_1) {
                            whereClause += ' AND r.status = ?';
                            params.push(status_1);
                        }
                        if (activityId) {
                            whereClause += ' AND r.activity_id = ?';
                            params.push(activityId);
                        }
                        // 日期过滤：只有当用户明确提供日期时才应用过滤
                        if (startDate && startDate.trim() !== '') {
                            whereClause += ' AND DATE(r.created_at) >= ?';
                            params.push(startDate);
                        }
                        if (endDate && endDate.trim() !== '') {
                            whereClause += ' AND DATE(r.created_at) <= ?';
                            params.push(endDate);
                        }
                        // 查询列表数据，关联用户和活动信息
                        console.log('🔍 [老带新查询] 执行查询，参数:', {
                            whereClause: whereClause,
                            params: params,
                            pageSize: parseInt(pageSize),
                            offset: offset
                        });
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          r.*,\n          u.real_name as referrer_name,\n          u.phone as referrer_phone,\n          a.title as activity_name\n        FROM referrals r\n        LEFT JOIN users u ON r.referrer_id = u.id\n        LEFT JOIN activities a ON r.activity_id = a.id\n        ".concat(whereClause, "\n        ORDER BY r.created_at DESC\n        LIMIT ? OFFSET ?\n      "), {
                                replacements: __spreadArray(__spreadArray([], params, true), [parseInt(pageSize), offset], false),
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        queryResult = _l.sent();
                        items = Array.isArray(queryResult) ? queryResult : [];
                        console.log('📊 [老带新查询] 查询结果:', {
                            queryResultType: typeof queryResult,
                            queryResultIsArray: Array.isArray(queryResult),
                            itemsType: typeof items,
                            itemsIsArray: Array.isArray(items),
                            itemsLength: Array.isArray(items) ? items.length : 'N/A',
                            firstItem: Array.isArray(items) && items.length > 0 ? items[0] : null
                        });
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total\n        FROM referrals r\n        LEFT JOIN users u ON r.referrer_id = u.id\n        ".concat(whereClause, "\n      "), {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        countQueryResult = _l.sent();
                        countResult = Array.isArray(countQueryResult) ? countQueryResult[0] : countQueryResult;
                        console.log('📊 [老带新查询] 总数查询结果:', {
                            countQueryResultType: typeof countQueryResult,
                            countQueryResultIsArray: Array.isArray(countQueryResult),
                            countResultType: typeof countResult,
                            countResultIsArray: Array.isArray(countResult),
                            countResult: countResult
                        });
                        itemsArray = Array.isArray(items) ? items : [];
                        total = Array.isArray(countResult) && countResult.length > 0 ? ((_k = countResult[0]) === null || _k === void 0 ? void 0 : _k.total) || 0 : (countResult === null || countResult === void 0 ? void 0 : countResult.total) || 0;
                        formattedItems = itemsArray.map(function (item) { return (__assign(__assign({}, item), { referrer: {
                                id: item.referrer_id,
                                name: item.referrer_name,
                                phone: item.referrer_phone,
                                type: item.referrer_type
                            }, referee: {
                                id: item.referee_id,
                                name: item.referee_name,
                                phone: item.referee_phone
                            }, activity: {
                                id: item.activity_id,
                                name: item.activity_name
                            } })); });
                        res.json({
                            success: true,
                            message: '获取老带新列表成功',
                            data: {
                                items: formattedItems,
                                total: total,
                                page: parseInt(page),
                                pageSize: parseInt(pageSize)
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _l.sent();
                        this.handleError(res, error_3, '获取老带新列表失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /** 老带新：统计 */
        this.getReferralStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, startDate, endDate, dateFilter, params, stats, topReferrersResult, statsData, topReferrersArray, topReferrer, rewardStats, totalReward, error_4;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        _a = req.query, startDate = _a.startDate, endDate = _a.endDate;
                        dateFilter = '';
                        params = [];
                        if (startDate && startDate.trim() !== '') {
                            dateFilter += ' AND DATE(r.created_at) >= ?';
                            params.push(startDate);
                        }
                        if (endDate && endDate.trim() !== '') {
                            dateFilter += ' AND DATE(r.created_at) <= ?';
                            params.push(endDate);
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) AS newCount,\n          SUM(CASE WHEN r.status = 'converted' THEN 1 ELSE 0 END) AS completedCount,\n          ROUND(SUM(CASE WHEN r.status = 'converted' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*),0), 2) AS convRate\n        FROM referrals r\n        WHERE 1=1 ".concat(dateFilter, "\n      "), {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        stats = (_b.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          r.referrer_id AS referrerId,\n          u.real_name AS referrerName,\n          COUNT(*) AS count\n        FROM referrals r\n        LEFT JOIN users u ON r.referrer_id = u.id\n        WHERE 1=1 ".concat(dateFilter, "\n        GROUP BY r.referrer_id, u.real_name\n        ORDER BY count DESC\n        LIMIT 10\n      "), {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        topReferrersResult = _b.sent();
                        statsData = stats;
                        topReferrersArray = Array.isArray(topReferrersResult) ? topReferrersResult : [];
                        topReferrer = topReferrersArray.length > 0 ? topReferrersArray[0] : null;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT SUM(reward) as totalReward\n        FROM referrals r\n        WHERE 1=1 ".concat(dateFilter, " AND r.reward_status = 'paid'\n      "), {
                                replacements: params,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        rewardStats = (_b.sent())[0];
                        totalReward = Number((rewardStats === null || rewardStats === void 0 ? void 0 : rewardStats.totalReward) || 0);
                        res.json({
                            success: true,
                            message: '获取老带新统计成功',
                            data: {
                                newCount: Number((statsData === null || statsData === void 0 ? void 0 : statsData.newCount) || 0),
                                completedCount: Number((statsData === null || statsData === void 0 ? void 0 : statsData.completedCount) || 0),
                                convRate: Number((statsData === null || statsData === void 0 ? void 0 : statsData.convRate) || 0),
                                totalReward: totalReward,
                                topReferrer: topReferrer ? {
                                    name: topReferrer.referrerName || '未知',
                                    count: Number(topReferrer.count || 0)
                                } : { name: '-', count: 0 },
                                topReferrers: topReferrersArray
                            }
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _b.sent();
                        this.handleError(res, error_4, '获取老带新统计失败');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /** 老带新：关系图 */
        this.getReferralGraph = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    res.json({ success: true, message: '获取老带新关系图成功', data: { nodes: [], edges: [] } });
                }
                catch (error) {
                    this.handleError(res, error, '获取老带新关系图失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 转换统计 */
        this.getConversionStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b, dimension, _c, period, summary, seriesSql, series, ranking, error_5;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 4, , 5]);
                        _a = req.query, _b = _a.dimension, dimension = _b === void 0 ? 'channel' : _b, _c = _a.period, period = _c === void 0 ? 'month' : _c;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          SUM(lead_count) AS `lead`,\n          SUM(visit_count) AS visit,\n          SUM(registration_count) AS aware,\n          SUM(CASE WHEN conversion_type = 3 THEN 1 ELSE 0 END) AS preEnroll,\n          SUM(CASE WHEN conversion_type = 4 THEN 1 ELSE 0 END) AS enroll\n        FROM (\n          SELECT id, lead_count, visit_count, registration_count, 0 AS conversion_type\n          FROM channel_trackings WHERE deleted_at IS NULL\n          UNION ALL\n          SELECT id, 0 AS lead_count, 0 AS visit_count, 0 AS registration_count, conversion_type\n          FROM conversion_trackings WHERE deleted_at IS NULL\n        ) t\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        summary = (_d.sent())[0];
                        seriesSql = '';
                        if (dimension === 'channel') {
                            seriesSql = "\n          SELECT ct.channel_name AS label,\n                 SUM(ct.lead_count) AS `lead`,\n                 SUM(ct.visit_count) AS visit,\n                 SUM(ct.registration_count) AS aware,\n                 SUM(CASE WHEN c.conversion_type = 3 THEN 1 ELSE 0 END) AS preEnroll,\n                 SUM(CASE WHEN c.conversion_type = 4 THEN 1 ELSE 0 END) AS enroll\n          FROM channel_trackings ct\n          LEFT JOIN conversion_trackings c ON c.channel_id = ct.id AND c.deleted_at IS NULL\n          WHERE ct.deleted_at IS NULL\n          GROUP BY ct.channel_name\n          ORDER BY `lead` DESC\n          LIMIT 50";
                        }
                        else if (dimension === 'campaign') {
                            seriesSql = "\n          SELECT mc.name AS label,\n                 SUM(ct.lead_count) AS `lead`,\n                 SUM(ct.visit_count) AS visit,\n                 SUM(ct.registration_count) AS aware,\n                 SUM(CASE WHEN c.conversion_type = 3 THEN 1 ELSE 0 END) AS preEnroll,\n                 SUM(CASE WHEN c.conversion_type = 4 THEN 1 ELSE 0 END) AS enroll\n          FROM marketing_campaigns mc\n          LEFT JOIN conversion_trackings c ON c.campaign_id = mc.id AND c.deleted_at IS NULL\n          LEFT JOIN channel_trackings ct ON ct.id = c.channel_id AND ct.deleted_at IS NULL\n          WHERE mc.deleted_at IS NULL\n          GROUP BY mc.id\n          ORDER BY `lead` DESC\n          LIMIT 50";
                        }
                        else {
                            // 默认按月份
                            seriesSql = "\n          SELECT DATE_FORMAT(event_time, '%Y-%m') AS label,\n                 SUM(CASE WHEN conversion_type = 1 THEN 1 ELSE 0 END) AS `lead`,\n                 SUM(CASE WHEN conversion_type = 2 THEN 1 ELSE 0 END) AS visit,\n                 SUM(CASE WHEN conversion_type = 3 THEN 1 ELSE 0 END) AS aware,\n                 SUM(CASE WHEN conversion_type = 3 THEN 1 ELSE 0 END) AS preEnroll,\n                 SUM(CASE WHEN conversion_type = 4 THEN 1 ELSE 0 END) AS enroll\n          FROM conversion_trackings\n          WHERE deleted_at IS NULL\n          GROUP BY DATE_FORMAT(event_time, '%Y-%m')\n          ORDER BY label ASC\n          LIMIT 24";
                        }
                        return [4 /*yield*/, init_1.sequelize.query(seriesSql, { type: sequelize_1.QueryTypes.SELECT })];
                    case 2:
                        series = _d.sent();
                        return [4 /*yield*/, init_1.sequelize.query("SELECT channel_name AS label, lead_count AS `lead`, visit_count AS visit, registration_count AS aware,\n                conversion_count AS enroll\n         FROM channel_trackings\n         WHERE deleted_at IS NULL\n         ORDER BY enroll DESC\n         LIMIT 10", { type: sequelize_1.QueryTypes.SELECT })];
                    case 3:
                        ranking = _d.sent();
                        res.json({ success: true, message: '获取转换统计成功', data: {
                                summary: {
                                    lead: Number((summary === null || summary === void 0 ? void 0 : summary.lead) || 0),
                                    visit: Number((summary === null || summary === void 0 ? void 0 : summary.visit) || 0),
                                    aware: Number((summary === null || summary === void 0 ? void 0 : summary.aware) || 0),
                                    preEnroll: Number((summary === null || summary === void 0 ? void 0 : summary.preEnroll) || 0),
                                    enroll: Number((summary === null || summary === void 0 ? void 0 : summary.enroll) || 0)
                                },
                                series: series,
                                ranking: ranking
                            } });
                        return [3 /*break*/, 5];
                    case 4:
                        error_5 = _d.sent();
                        this.handleError(res, error_5, '获取转换统计失败');
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        /** 销售漏斗 */
        this.getFunnelStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var stageCounts, preAndPaid, lead, visit, aware, pre_enroll, paid, safeRate, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          SUM(lead_count) AS `lead`,\n          SUM(visit_count) AS visit,\n          SUM(registration_count) AS aware\n        FROM channel_trackings\n        WHERE deleted_at IS NULL\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 1:
                        stageCounts = (_a.sent())[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          SUM(CASE WHEN conversion_type = 3 THEN 1 ELSE 0 END) AS pre_enroll,\n          SUM(CASE WHEN conversion_type = 4 THEN 1 ELSE 0 END) AS paid\n        FROM conversion_trackings\n        WHERE deleted_at IS NULL\n      ", { type: sequelize_1.QueryTypes.SELECT })];
                    case 2:
                        preAndPaid = (_a.sent())[0];
                        lead = Number((stageCounts === null || stageCounts === void 0 ? void 0 : stageCounts.lead) || 0);
                        visit = Number((stageCounts === null || stageCounts === void 0 ? void 0 : stageCounts.visit) || 0);
                        aware = Number((stageCounts === null || stageCounts === void 0 ? void 0 : stageCounts.aware) || 0);
                        pre_enroll = Number((preAndPaid === null || preAndPaid === void 0 ? void 0 : preAndPaid.pre_enroll) || 0);
                        paid = Number((preAndPaid === null || preAndPaid === void 0 ? void 0 : preAndPaid.paid) || 0);
                        safeRate = function (a, b) { return (b > 0 ? Math.round((a * 10000) / b) / 100 : 0); };
                        res.json({ success: true, message: '获取销售漏斗成功', data: {
                                stages: [
                                    { code: 'lead', name: '采集单', count: lead },
                                    { code: 'visit', name: '进店', count: visit },
                                    { code: 'aware', name: '了解园区', count: aware },
                                    { code: 'pre_enroll', name: '预报名', count: pre_enroll },
                                    { code: 'paid', name: '尾款', count: paid },
                                ],
                                rates: {
                                    lead_to_visit: safeRate(visit, lead),
                                    visit_to_aware: safeRate(aware, visit),
                                    aware_to_pre_enroll: safeRate(pre_enroll, aware),
                                    pre_enroll_to_paid: safeRate(paid, pre_enroll),
                                    overall: safeRate(paid, lead)
                                }
                            } });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        this.handleError(res, error_6, '获取销售漏斗失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /** 获取海报模板 */
        this.getPosterTemplates = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var templates;
            return __generator(this, function (_a) {
                try {
                    templates = this.posterService.getAvailableTemplates();
                    res.json({
                        success: true,
                        message: '获取海报模板成功',
                        data: templates.map(function (template) { return ({
                            id: template.id,
                            name: template.name,
                            width: template.width,
                            height: template.height,
                            backgroundColor: template.backgroundColor,
                            preview: "/images/poster-templates/template-".concat(template.id, ".jpg"),
                            isPremium: template.id === 3 // 第3个模板设为付费模板
                        }); })
                    });
                }
                catch (error) {
                    this.handleError(res, error, '获取海报模板失败');
                }
                return [2 /*return*/];
            });
        }); };
        /** 推广码：生成 */
        this.generateReferralCode = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, activity_id, title, description, validity_days, usage_limit, is_custom, userId, referralCode, expiresAt, result, referralId, error_7;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        _a = req.body, activity_id = _a.activity_id, title = _a.title, description = _a.description, validity_days = _a.validity_days, usage_limit = _a.usage_limit, is_custom = _a.is_custom;
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        if (!userId) {
                            res.status(401).json({ success: false, message: '用户未认证' });
                            return [2 /*return*/];
                        }
                        referralCode = this.generateUniqueReferralCode(userId);
                        expiresAt = new Date();
                        expiresAt.setDate(expiresAt.getDate() + (validity_days || 30));
                        // 调试参数
                        console.log('🔍 [推广码生成] 请求参数:', {
                            userId: userId,
                            activity_id: activity_id,
                            title: title,
                            description: description,
                            validity_days: validity_days,
                            usage_limit: usage_limit,
                            is_custom: is_custom
                        });
                        return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO referral_codes (\n          user_id, activity_id, referral_code, title, description,\n          validity_days, usage_limit, expires_at, is_custom, status,\n          created_at, updated_at\n        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())\n      ", {
                                replacements: [
                                    userId, activity_id || null, referralCode, title || '', description || '',
                                    validity_days || 30, usage_limit || 100, expiresAt, is_custom || false, 'active'
                                ],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 1:
                        result = (_c.sent())[0];
                        referralId = result.insertId;
                        res.json({
                            success: true,
                            message: '推广码生成成功',
                            data: {
                                id: referralId,
                                referral_code: referralCode,
                                expires_at: expiresAt.toISOString(),
                                usage_limit: usage_limit,
                                usage_count: 0
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _c.sent();
                        this.handleError(res, error_7, '生成推广码失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /** 推广海报：生成 */
        this.generateReferralPoster = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, template_id, main_title, sub_title, contact_phone, address, referral_code, referral_link, kindergarten_name, posterUrl, error_8;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        _a = req.body, template_id = _a.template_id, main_title = _a.main_title, sub_title = _a.sub_title, contact_phone = _a.contact_phone, address = _a.address, referral_code = _a.referral_code, referral_link = _a.referral_link, kindergarten_name = _a.kindergarten_name;
                        return [4 /*yield*/, this.posterService.generatePoster({
                                templateId: template_id,
                                mainTitle: main_title,
                                subTitle: sub_title,
                                contactPhone: contact_phone,
                                address: address,
                                referralCode: referral_code,
                                referralLink: referral_link,
                                kindergartenName: kindergarten_name
                            })];
                    case 1:
                        posterUrl = _b.sent();
                        res.json({
                            success: true,
                            message: '推广海报生成成功',
                            data: {
                                poster_url: posterUrl,
                                template_id: template_id,
                                generated_at: new Date().toISOString()
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _b.sent();
                        this.handleError(res, error_8, '生成推广海报失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /** 推广码：统计 */
        this.getReferralCodeStats = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var code, stats, statsData, clickStats, clickData, conversionRate, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        code = req.params.code;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          rc.*,\n          0 as total_referrals,\n          0 as converted_referrals,\n          0 as weekly_referrals,\n          0 as monthly_referrals\n        FROM referral_codes rc\n        WHERE rc.referral_code = ? AND rc.deleted_at IS NULL\n      ", {
                                replacements: [code],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        stats = (_a.sent())[0];
                        statsData = Array.isArray(stats) ? stats[0] : stats;
                        if (!statsData) {
                            res.status(404).json({ success: false, message: '推广码不存在' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          COUNT(*) as total_clicks,\n          COUNT(DISTINCT DATE(created_at)) as active_days,\n          COUNT(DISTINCT ip_address) as unique_visitors\n        FROM referral_clicks\n        WHERE referral_code = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)\n      ", {
                                replacements: [code],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        clickStats = (_a.sent())[0];
                        clickData = Array.isArray(clickStats) ? clickStats[0] : clickStats;
                        conversionRate = statsData.total_referrals > 0
                            ? (statsData.converted_referrals / statsData.total_referrals) * 100
                            : 0;
                        res.json({
                            success: true,
                            message: '获取推广码统计成功',
                            data: {
                                basic_info: {
                                    referral_code: statsData.referral_code,
                                    title: statsData.title,
                                    description: statsData.description,
                                    created_at: statsData.created_at,
                                    expires_at: statsData.expires_at,
                                    status: statsData.status,
                                    usage_limit: statsData.usage_limit,
                                    usage_count: statsData.usage_count
                                },
                                referral_stats: {
                                    total_referrals: Number(statsData.total_referrals) || 0,
                                    converted_referrals: Number(statsData.converted_referrals) || 0,
                                    weekly_referrals: Number(statsData.weekly_referrals) || 0,
                                    monthly_referrals: Number(statsData.monthly_referrals) || 0,
                                    conversion_rate: Number(conversionRate.toFixed(2))
                                },
                                click_stats: {
                                    total_clicks: Number(clickData === null || clickData === void 0 ? void 0 : clickData.total_clicks) || 0,
                                    active_days: Number(clickData === null || clickData === void 0 ? void 0 : clickData.active_days) || 0,
                                    unique_visitors: Number(clickData === null || clickData === void 0 ? void 0 : clickData.unique_visitors) || 0
                                }
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_9 = _a.sent();
                        this.handleError(res, error_9, '获取推广码统计失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /** 推广码：点击跟踪 */
        this.trackReferralClick = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var code, _a, ip_address, user_agent, referrer, error_10;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 3, , 4]);
                        code = req.params.code;
                        _a = req.body, ip_address = _a.ip_address, user_agent = _a.user_agent, referrer = _a.referrer;
                        // 记录点击
                        return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO referral_clicks (\n          referral_code, ip_address, user_agent, referrer, created_at\n        ) VALUES (?, ?, ?, ?, NOW())\n      ", {
                                replacements: [code, ip_address, user_agent, referrer],
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 1:
                        // 记录点击
                        _b.sent();
                        // 更新使用次数
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE referral_codes\n        SET usage_count = usage_count + 1, updated_at = NOW()\n        WHERE referral_code = ?\n      ", {
                                replacements: [code],
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 2:
                        // 更新使用次数
                        _b.sent();
                        res.json({
                            success: true,
                            message: '点击记录成功'
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_10 = _b.sent();
                        this.handleError(res, error_10, '记录点击失败');
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取我的推广码列表
         */
        this.getMyReferralCodes = function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var userId, referralCodes, codesArray, formattedCodes, error_11;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        if (!userId) {
                            res.status(401).json({ success: false, message: '用户未认证' });
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT\n          rc.*,\n          a.title as activity_name\n        FROM referral_codes rc\n        LEFT JOIN activities a ON rc.activity_id = a.id\n        WHERE rc.user_id = ? AND rc.deleted_at IS NULL\n        ORDER BY rc.created_at DESC\n      ", {
                                replacements: [userId],
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        referralCodes = (_b.sent())[0];
                        codesArray = Array.isArray(referralCodes) ? referralCodes : [];
                        formattedCodes = codesArray.map(function (code) { return ({
                            id: code.id,
                            referral_code: code.referral_code,
                            title: code.title,
                            description: code.description,
                            activity_name: code.activity_name || null,
                            status: code.status,
                            created_at: code.created_at,
                            expires_at: code.expires_at,
                            usage_limit: code.usage_limit,
                            usage_count: code.usage_count,
                            qr_code_url: code.qr_code_url,
                            poster_url: code.poster_url,
                            is_custom: code.is_custom,
                            stats: {
                                total_referrals: 0,
                                converted_referrals: 0,
                                weekly_referrals: 0,
                                conversion_rate: 0
                            }
                        }); });
                        res.json({
                            success: true,
                            message: '获取我的推广码成功',
                            data: {
                                items: formattedCodes,
                                total: formattedCodes.length
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _b.sent();
                        this.handleError(res, error_11, '获取我的推广码失败');
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.posterService = new poster_generation_service_1.PosterGenerationService();
    }
    /**
     * 生成唯一推荐码
     */
    MarketingController.prototype.generateUniqueReferralCode = function (userId) {
        var timestamp = Date.now().toString(36);
        var randomStr = Math.random().toString(36).substring(2, 8);
        var userHash = userId.toString(36);
        return "".concat(userHash).concat(timestamp).concat(randomStr).toUpperCase();
    };
    /**
     * 处理错误的私有方法
     */
    MarketingController.prototype.handleError = function (res, error, defaultMessage) {
        console.error(defaultMessage + ':', error);
        res.status(500).json({
            success: false,
            message: defaultMessage,
            error: {
                code: 'SERVER_ERROR',
                message: (error === null || error === void 0 ? void 0 : error.message) || '未知错误'
            }
        });
    };
    return MarketingController;
}());
exports.MarketingController = MarketingController;
