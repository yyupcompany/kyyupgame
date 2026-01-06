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
exports.resumeAdvertisement = exports.pauseAdvertisement = exports.getAdvertisementsByStatus = exports.getAdvertisementsByType = exports.getAllAdvertisementStatistics = exports.getAdvertisementStatistics = exports.deleteAdvertisement = exports.updateAdvertisement = exports.getAdvertisement = exports.getAdvertisements = exports.createAdvertisement = exports.AdvertisementController = void 0;
var sequelize_1 = require("sequelize");
var init_1 = require("../init");
var Joi = require('joi');
/**
 * 广告状态枚举
 */
var AdvertisementStatus;
(function (AdvertisementStatus) {
    AdvertisementStatus[AdvertisementStatus["DRAFT"] = 0] = "DRAFT";
    AdvertisementStatus[AdvertisementStatus["ACTIVE"] = 1] = "ACTIVE";
    AdvertisementStatus[AdvertisementStatus["PAUSED"] = 2] = "PAUSED";
    AdvertisementStatus[AdvertisementStatus["ENDED"] = 3] = "ENDED";
    AdvertisementStatus[AdvertisementStatus["CANCELLED"] = 4] = "CANCELLED";
})(AdvertisementStatus || (AdvertisementStatus = {}));
/**
 * 广告类型枚举
 */
var AdvertisementType;
(function (AdvertisementType) {
    AdvertisementType[AdvertisementType["IMAGE"] = 1] = "IMAGE";
    AdvertisementType[AdvertisementType["VIDEO"] = 2] = "VIDEO";
    AdvertisementType[AdvertisementType["TEXT"] = 3] = "TEXT";
    AdvertisementType[AdvertisementType["BANNER"] = 4] = "BANNER";
    AdvertisementType[AdvertisementType["POPUP"] = 5] = "POPUP";
    AdvertisementType[AdvertisementType["FEED"] = 6] = "FEED";
    AdvertisementType[AdvertisementType["SEARCH"] = 7] = "SEARCH";
    AdvertisementType[AdvertisementType["OTHER"] = 8] = "OTHER";
})(AdvertisementType || (AdvertisementType = {}));
/**
 * 广告控制器
 * @description 处理广告相关的HTTP请求
 */
var AdvertisementController = /** @class */ (function () {
    function AdvertisementController() {
        var _this = this;
        /**
         * 更新广告
         * @param req 请求对象
         * @param res 响应对象
         */
        this.update = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, userId, _a, title, adType, type, platform, position, targetAudience, content, imageUrl, videoUrl, landingPage, startDate, endDate, budget, status_1, remark, finalAdType, finalStatus, statusMap, replacements, setClause, query, error_1;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userId = (_b = req.user) === null || _b === void 0 ? void 0 : _b.id;
                        _a = req.body, title = _a.title, adType = _a.adType, type = _a.type, platform = _a.platform, position = _a.position, targetAudience = _a.targetAudience, content = _a.content, imageUrl = _a.imageUrl, videoUrl = _a.videoUrl, landingPage = _a.landingPage, startDate = _a.startDate, endDate = _a.endDate, budget = _a.budget, status_1 = _a.status, remark = _a.remark;
                        console.log('广告更新请求参数:', req.body);
                        finalAdType = adType || (type === 'banner' ? AdvertisementType.BANNER : undefined);
                        finalStatus = status_1;
                        if (typeof status_1 === 'string') {
                            statusMap = {
                                'draft': AdvertisementStatus.DRAFT,
                                'active': AdvertisementStatus.ACTIVE,
                                'paused': AdvertisementStatus.PAUSED,
                                'ended': AdvertisementStatus.ENDED,
                                'cancelled': AdvertisementStatus.CANCELLED
                            };
                            finalStatus = statusMap[status_1.toLowerCase()] || undefined;
                        }
                        replacements = { id: Number(id) || 0, userId: userId };
                        if (title !== undefined)
                            replacements.title = title;
                        if (finalAdType !== undefined)
                            replacements.adType = finalAdType;
                        if (platform !== undefined)
                            replacements.platform = platform;
                        if (position !== undefined)
                            replacements.position = position;
                        if (targetAudience !== undefined)
                            replacements.targetAudience = targetAudience;
                        if (content !== undefined)
                            replacements.content = content;
                        if (imageUrl !== undefined)
                            replacements.imageUrl = imageUrl;
                        if (videoUrl !== undefined)
                            replacements.videoUrl = videoUrl;
                        if (landingPage !== undefined)
                            replacements.landingPage = landingPage;
                        if (startDate !== undefined)
                            replacements.startDate = startDate;
                        if (endDate !== undefined)
                            replacements.endDate = endDate;
                        if (budget !== undefined)
                            replacements.budget = budget;
                        if (finalStatus !== undefined)
                            replacements.status = finalStatus;
                        if (remark !== undefined)
                            replacements.remark = remark;
                        console.log('广告更新替换参数:', replacements);
                        setClause = Object.keys(replacements)
                            .filter(function (key) { return key !== 'id' && key !== 'userId'; })
                            .map(function (key) {
                            var columnName = key === 'adType' ? 'ad_type' :
                                key === 'imageUrl' ? 'image_url' :
                                    key === 'videoUrl' ? 'video_url' :
                                        key === 'landingPage' ? 'landing_page' :
                                            key === 'targetAudience' ? 'target_audience' :
                                                key === 'startDate' ? 'start_date' :
                                                    key === 'endDate' ? 'end_date' :
                                                        key;
                            return "".concat(columnName.replace(/([A-Z])/g, '_$1').toLowerCase(), " = :").concat(key);
                        })
                            .concat(['updater_id = :userId', 'updated_at = NOW()'])
                            .join(', ');
                        query = "\n        UPDATE advertisements \n        SET ".concat(setClause, "\n        WHERE id = :id AND deleted_at IS NULL\n      ");
                        console.log('广告更新SQL:', query);
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        _c.sent();
                        res.json({
                            success: true,
                            message: '更新广告成功',
                            data: {
                                id: Number(id) || 0,
                                updateTime: new Date()
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _c.sent();
                        console.error('更新广告失败:', error_1);
                        res.status(500).json({ success: false, message: '更新广告失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 删除广告
         * @param req 请求对象
         * @param res 响应对象
         */
        this["delete"] = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE advertisements \n        SET deleted_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL\n      ", {
                                replacements: { id: Number(id) || 0 },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        _a.sent();
                        res.json({
                            success: true,
                            message: '删除广告成功',
                            data: {
                                id: Number(id) || 0
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.error('删除广告失败:', error_2);
                        res.status(500).json({ success: false, message: '删除广告失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取广告统计数据
         * @param req 请求对象
         * @param res 响应对象
         */
        this.getStatistics = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var id, statsResults, stats, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          impressions,\n          clicks,\n          conversions,\n          spent,\n          budget,\n          CASE WHEN impressions > 0 THEN ROUND(clicks / impressions * 100, 2) ELSE 0 END as ctr,\n          CASE WHEN clicks > 0 THEN ROUND(conversions / clicks * 100, 2) ELSE 0 END as conversion_rate,\n          CASE WHEN clicks > 0 THEN ROUND(spent / clicks, 2) ELSE 0 END as cost_per_click,\n          CASE WHEN conversions > 0 THEN ROUND(spent / conversions, 2) ELSE 0 END as cost_per_conversion\n        FROM advertisements \n        WHERE id = :id AND deleted_at IS NULL\n      ", {
                                replacements: { id: Number(id) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        statsResults = _a.sent();
                        stats = statsResults[0];
                        if (!stats) {
                            res.status(404).json({ success: false, message: '广告不存在' });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            message: '获取广告统计数据成功',
                            data: stats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        console.error('获取广告统计数据失败:', error_3);
                        res.status(500).json({ success: false, message: '获取广告统计数据失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * 获取全部广告统计数据
         * @param req 请求对象
         * @param res 响应对象
         */
        this.getAllStatistics = function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
            var statsResults, stats, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          COUNT(*) as total_ads,\n          SUM(COALESCE(impressions, 0)) as total_impressions,\n          SUM(COALESCE(clicks, 0)) as total_clicks,\n          SUM(COALESCE(conversions, 0)) as total_conversions,\n          SUM(COALESCE(spent, 0)) as total_spent,\n          SUM(COALESCE(budget, 0)) as total_budget,\n          CASE WHEN SUM(COALESCE(impressions, 0)) > 0 THEN ROUND(SUM(COALESCE(clicks, 0)) / SUM(COALESCE(impressions, 0)) * 100, 2) ELSE 0 END as avg_ctr,\n          CASE WHEN SUM(COALESCE(clicks, 0)) > 0 THEN ROUND(SUM(COALESCE(conversions, 0)) / SUM(COALESCE(clicks, 0)) * 100, 2) ELSE 0 END as avg_conversion_rate,\n          CASE WHEN SUM(COALESCE(clicks, 0)) > 0 THEN ROUND(SUM(COALESCE(spent, 0)) / SUM(COALESCE(clicks, 0)), 2) ELSE 0 END as avg_cost_per_click,\n          CASE WHEN SUM(COALESCE(conversions, 0)) > 0 THEN ROUND(SUM(COALESCE(spent, 0)) / SUM(COALESCE(conversions, 0)), 2) ELSE 0 END as avg_cost_per_conversion\n        FROM advertisements \n        WHERE deleted_at IS NULL\n      ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        statsResults = _a.sent();
                        stats = statsResults[0];
                        res.json({
                            success: true,
                            message: '获取全部广告统计数据成功',
                            data: stats
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        console.error('获取全部广告统计数据失败:', error_4);
                        res.status(500).json({ success: false, message: '获取全部广告统计数据失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
    }
    /**
     * 创建广告
     * @param req 请求对象
     * @param res 响应对象
     */
    AdvertisementController.prototype.create = function (req, res) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var userId, _b, _c, kindergartenId, campaignId, title, _d, adType, type, platform, position, targetAudience, content, imageUrl, videoUrl, landingPage, startDate, endDate, budget, _e, status_2, remark, finalAdType, finalStartDate, finalEndDate, result, insertId, error_5, errorMessage, errorStack;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _f.trys.push([0, 2, , 3]);
                        userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                        _b = req.body, _c = _b.kindergartenId, kindergartenId = _c === void 0 ? 1 : _c, campaignId = _b.campaignId, title = _b.title, _d = _b.adType, adType = _d === void 0 ? 1 : _d, type = _b.type, platform = _b.platform, position = _b.position, targetAudience = _b.targetAudience, content = _b.content, imageUrl = _b.imageUrl, videoUrl = _b.videoUrl, landingPage = _b.landingPage, startDate = _b.startDate, endDate = _b.endDate, budget = _b.budget, _e = _b.status, status_2 = _e === void 0 ? AdvertisementStatus.DRAFT : _e, remark = _b.remark;
                        finalAdType = adType || (type === 'banner' ? AdvertisementType.BANNER : 1);
                        finalStartDate = startDate || new Date().toISOString().split('T')[0];
                        finalEndDate = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
                        return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO advertisements (\n          kindergarten_id, title, ad_type, platform, start_date, end_date, \n          status, creator_id, updater_id, created_at, updated_at\n        ) VALUES (\n          :kindergartenId, :title, :adType, :platform, :startDate, :endDate,\n          :status, :userId, :userId, NOW(), NOW()\n        )\n      ", {
                                replacements: {
                                    kindergartenId: kindergartenId,
                                    title: title,
                                    adType: finalAdType,
                                    platform: platform,
                                    startDate: finalStartDate, endDate: finalEndDate,
                                    status: status_2,
                                    userId: userId
                                },
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 1:
                        result = _f.sent();
                        insertId = Array.isArray(result) && result.length > 0 ?
                            result[0].insertId || result[0] : null;
                        res.json({
                            success: true,
                            message: '创建广告成功',
                            data: {
                                id: insertId,
                                title: title,
                                adType: finalAdType,
                                platform: platform,
                                status: status_2,
                                createTime: new Date()
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _f.sent();
                        console.error('创建广告失败:', error_5);
                        errorMessage = error_5 instanceof Error ? error_5.message : String(error_5);
                        errorStack = error_5 instanceof Error ? error_5.stack : undefined;
                        console.error('错误详情:', errorMessage);
                        console.error('错误堆栈:', errorStack);
                        res.status(500).json({
                            success: false,
                            message: '创建广告失败',
                            error: process.env.NODE_ENV === 'development' ? errorMessage : undefined
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取广告列表
     * @param req 请求对象
     * @param res 响应对象
     */
    AdvertisementController.prototype.findAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, limit, offset, advertisements, totalResults, total, error_6;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                        offset = ((Number(page) - 1) || 0) * Number(limit) || 0;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT a.*, k.name as kindergarten_name\n        FROM advertisements a\n        LEFT JOIN kindergartens k ON a.kindergarten_id = k.id\n        WHERE a.deleted_at IS NULL\n        ORDER BY a.created_at DESC\n        LIMIT :limit OFFSET :offset\n      ", {
                                replacements: { limit: Number(limit) || 0, offset: offset },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        advertisements = _d.sent();
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total\n        FROM advertisements a\n        WHERE a.deleted_at IS NULL\n      ", {
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        totalResults = _d.sent();
                        total = totalResults[0].total;
                        res.json({
                            success: true,
                            message: '获取广告列表成功',
                            data: {
                                items: advertisements,
                                page: Number(page) || 0,
                                limit: Number(limit) || 0,
                                total: Number(total) || 0,
                                totalPages: Math.ceil(Number(total) || 0 / Number(limit) || 0)
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _d.sent();
                        console.error('获取广告列表失败:', error_6);
                        res.status(500).json({ success: false, message: '获取广告列表失败' });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取单个广告详情
     * @param req 请求对象
     * @param res 响应对象
     */
    AdvertisementController.prototype.findOne = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, advertisements, advertisement, error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT a.*, k.name as kindergarten_name\n        FROM advertisements a\n        LEFT JOIN kindergartens k ON a.kindergarten_id = k.id\n        WHERE a.id = :id AND a.deleted_at IS NULL\n      ", {
                                replacements: { id: Number(id) || 0 },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        advertisements = _a.sent();
                        advertisement = advertisements[0];
                        if (!advertisement) {
                            res.status(404).json({ success: false, message: '广告不存在' });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            message: '获取广告详情成功',
                            data: advertisement
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        console.error('获取广告详情失败:', error_7);
                        res.status(500).json({ success: false, message: '获取广告详情失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 按类型获取广告
     * @param req 请求对象
     * @param res 响应对象
     */
    AdvertisementController.prototype.findByType = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var type, adType, typeMap, advertisements, error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        type = req.params.type;
                        adType = Number(type) || 0;
                        if (isNaN(adType)) {
                            typeMap = {
                                'banner': AdvertisementType.BANNER,
                                'image': AdvertisementType.IMAGE,
                                'video': AdvertisementType.VIDEO,
                                'text': AdvertisementType.TEXT,
                                'popup': AdvertisementType.POPUP,
                                'feed': AdvertisementType.FEED,
                                'search': AdvertisementType.SEARCH,
                                'other': AdvertisementType.OTHER
                            };
                            adType = typeMap[String(type).toLowerCase()] || 1;
                        }
                        console.log('按类型获取广告，类型:', type, '映射后类型:', adType);
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT a.*, k.name as kindergarten_name\n        FROM advertisements a\n        LEFT JOIN kindergartens k ON a.kindergarten_id = k.id\n        WHERE a.ad_type = :type AND a.deleted_at IS NULL\n        ORDER BY a.created_at DESC\n      ", {
                                replacements: { type: adType },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        advertisements = _a.sent();
                        res.json({
                            success: true,
                            message: '按类型获取广告成功',
                            data: {
                                type: Number(type) || 0,
                                items: advertisements,
                                total: advertisements.length
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        console.error('按类型获取广告失败:', error_8);
                        res.status(500).json({ success: false, message: '按类型获取广告失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 按状态获取广告
     * @param req 请求对象
     * @param res 响应对象
     */
    AdvertisementController.prototype.findByStatus = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var status_3, adStatus, statusMap, advertisements, error_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        status_3 = req.params.status;
                        adStatus = Number(status_3) || 0;
                        if (isNaN(adStatus)) {
                            statusMap = {
                                'draft': AdvertisementStatus.DRAFT,
                                'active': AdvertisementStatus.ACTIVE,
                                'paused': AdvertisementStatus.PAUSED,
                                'ended': AdvertisementStatus.ENDED,
                                'cancelled': AdvertisementStatus.CANCELLED
                            };
                            adStatus = statusMap[String(status_3).toLowerCase()] || 0;
                        }
                        console.log('按状态获取广告，状态:', status_3, '映射后状态:', adStatus);
                        // 特殊处理banner和active等字符串值
                        if (status_3 === 'banner') {
                            req.params.type = 'banner';
                            return [2 /*return*/, this.findByType(req, res)];
                        }
                        return [4 /*yield*/, init_1.sequelize.query("\n        SELECT a.*, k.name as kindergarten_name\n        FROM advertisements a\n        LEFT JOIN kindergartens k ON a.kindergarten_id = k.id\n        WHERE a.status = :status AND a.deleted_at IS NULL\n        ORDER BY a.created_at DESC\n      ", {
                                replacements: { status: adStatus },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        advertisements = _a.sent();
                        res.json({
                            success: true,
                            message: '按状态获取广告成功',
                            data: {
                                status: Number(status_3) || 0,
                                items: advertisements,
                                total: advertisements.length
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        console.error('按状态获取广告失败:', error_9);
                        res.status(500).json({ success: false, message: '按状态获取广告失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 暂停广告
     * @param req 请求对象
     * @param res 响应对象
     */
    AdvertisementController.prototype.pauseAdvertisement = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE advertisements \n        SET status = :pausedStatus, updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL\n      ", {
                                replacements: {
                                    id: Number(id) || 0,
                                    pausedStatus: AdvertisementStatus.PAUSED
                                },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        _a.sent();
                        res.json({
                            success: true,
                            message: '暂停广告成功',
                            data: {
                                id: Number(id) || 0,
                                status: AdvertisementStatus.PAUSED
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        console.error('暂停广告失败:', error_10);
                        res.status(500).json({ success: false, message: '暂停广告失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 恢复广告
     * @param req 请求对象
     * @param res 响应对象
     */
    AdvertisementController.prototype.resumeAdvertisement = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, error_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE advertisements \n        SET status = :activeStatus, updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL\n      ", {
                                replacements: {
                                    id: Number(id) || 0,
                                    activeStatus: AdvertisementStatus.ACTIVE
                                },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        _a.sent();
                        res.json({
                            success: true,
                            message: '恢复广告成功',
                            data: {
                                id: Number(id) || 0,
                                status: AdvertisementStatus.ACTIVE
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        console.error('恢复广告失败:', error_11);
                        res.status(500).json({ success: false, message: '恢复广告失败' });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return AdvertisementController;
}());
exports.AdvertisementController = AdvertisementController;
// 创建控制器实例
var advertisementController = new AdvertisementController();
// 导出控制器方法
exports.createAdvertisement = advertisementController.create.bind(advertisementController);
exports.getAdvertisements = advertisementController.findAll.bind(advertisementController);
exports.getAdvertisement = advertisementController.findOne.bind(advertisementController);
exports.updateAdvertisement = advertisementController.update.bind(advertisementController);
exports.deleteAdvertisement = advertisementController["delete"].bind(advertisementController);
exports.getAdvertisementStatistics = advertisementController.getStatistics.bind(advertisementController);
exports.getAllAdvertisementStatistics = advertisementController.getAllStatistics.bind(advertisementController);
exports.getAdvertisementsByType = advertisementController.findByType.bind(advertisementController);
exports.getAdvertisementsByStatus = advertisementController.findByStatus.bind(advertisementController);
exports.pauseAdvertisement = advertisementController.pauseAdvertisement.bind(advertisementController);
exports.resumeAdvertisement = advertisementController.resumeAdvertisement.bind(advertisementController);
