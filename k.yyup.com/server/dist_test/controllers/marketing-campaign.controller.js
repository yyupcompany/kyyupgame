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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
exports.__esModule = true;
exports.end = exports.pause = exports.launch = exports.getPerformance = exports.getStats = exports.setRules = exports.deleteCampaign = exports.update = exports.findAll = exports.findOne = exports.create = exports.MarketingCampaignController = void 0;
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
// 定义状态枚举
var CampaignStatus;
(function (CampaignStatus) {
    CampaignStatus[CampaignStatus["DRAFT"] = 0] = "DRAFT";
    CampaignStatus[CampaignStatus["ACTIVE"] = 1] = "ACTIVE";
    CampaignStatus[CampaignStatus["PAUSED"] = 2] = "PAUSED";
    CampaignStatus[CampaignStatus["COMPLETED"] = 3] = "COMPLETED";
    CampaignStatus[CampaignStatus["CANCELLED"] = 4] = "CANCELLED";
})(CampaignStatus || (CampaignStatus = {}));
/**
 * 营销活动控制器
 * @description 处理营销活动相关的HTTP请求
 */
var MarketingCampaignController = /** @class */ (function () {
    function MarketingCampaignController() {
    }
    /**
     * 创建营销活动
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.create = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var userData, _a, kindergartenId, title, campaignType, startDate, endDate, targetAudience, budget, objective, description, rules, rewards, coverImage, bannerImage, _b, status_1, remark, insertQuery, insertResults, campaignId, selectQuery, campaignsResults, campaign, error_1, typedError;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 3, , 4]);
                        userData = req.user;
                        _a = req.body, kindergartenId = _a.kindergartenId, title = _a.title, campaignType = _a.campaignType, startDate = _a.startDate, endDate = _a.endDate, targetAudience = _a.targetAudience, budget = _a.budget, objective = _a.objective, description = _a.description, rules = _a.rules, rewards = _a.rewards, coverImage = _a.coverImage, bannerImage = _a.bannerImage, _b = _a.status, status_1 = _b === void 0 ? CampaignStatus.DRAFT : _b, remark = _a.remark;
                        // 验证必填字段
                        if (!kindergartenId || !title || !campaignType || !startDate || !endDate) {
                            res.status(400).json({
                                success: false,
                                error: {
                                    code: 'VALIDATION_ERROR',
                                    message: '缺少必填字段'
                                }
                            });
                            return [2 /*return*/];
                        }
                        insertQuery = "\n        INSERT INTO marketing_campaigns (\n          kindergarten_id, title, campaign_type, start_date, end_date,\n          target_audience, budget, objective, description, rules, rewards,\n          cover_image, banner_image, participant_count, conversion_count,\n          view_count, total_revenue, status, remark, creator_id, updater_id,\n          created_at, updated_at\n        ) VALUES (\n          :kindergartenId, :title, :campaignType, :startDate, :endDate,\n          :targetAudience, :budget, :objective, :description, :rules, :rewards,\n          :coverImage, :bannerImage, 0, 0, 0, 0, :status, :remark,\n          :creatorId, :creatorId, NOW(), NOW()\n        )\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(insertQuery, {
                                replacements: {
                                    kindergartenId: kindergartenId,
                                    title: title,
                                    campaignType: campaignType,
                                    startDate: startDate,
                                    endDate: endDate,
                                    targetAudience: targetAudience || null,
                                    budget: budget || null,
                                    objective: objective || null,
                                    description: description || null,
                                    rules: rules || null,
                                    rewards: rewards || null,
                                    coverImage: coverImage || null,
                                    bannerImage: bannerImage || null,
                                    status: status_1,
                                    remark: remark || null,
                                    creatorId: userData.id
                                },
                                type: sequelize_1.QueryTypes.INSERT
                            })];
                    case 1:
                        insertResults = _c.sent();
                        campaignId = insertResults[0].insertId || insertResults[0];
                        selectQuery = "\n        SELECT mc.*, k.name as kindergarten_name\n        FROM marketing_campaigns mc\n        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id\n        WHERE mc.id = :campaignId\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(selectQuery, {
                                replacements: { campaignId: campaignId },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        campaignsResults = _c.sent();
                        campaign = campaignsResults[0];
                        res.status(201).json({
                            success: true,
                            data: {
                                id: campaign.id,
                                kindergartenId: campaign.kindergarten_id,
                                title: campaign.title,
                                campaignType: campaign.campaign_type,
                                startDate: campaign.start_date,
                                endDate: campaign.end_date,
                                targetAudience: campaign.target_audience,
                                budget: campaign.budget,
                                objective: campaign.objective,
                                description: campaign.description,
                                rules: campaign.rules,
                                rewards: campaign.rewards,
                                coverImage: campaign.cover_image,
                                bannerImage: campaign.banner_image,
                                participantCount: campaign.participant_count,
                                conversionCount: campaign.conversion_count,
                                viewCount: campaign.view_count,
                                totalRevenue: campaign.total_revenue,
                                status: campaign.status,
                                statusText: this.getStatusText(campaign.status),
                                campaignTypeText: this.getCampaignTypeText(campaign.campaign_type),
                                remark: campaign.remark,
                                creatorId: campaign.creator_id,
                                updaterId: campaign.updater_id,
                                createdAt: campaign.created_at,
                                updatedAt: campaign.updated_at,
                                kindergarten: campaign.kindergarten_name ? {
                                    id: campaign.kindergarten_id,
                                    name: campaign.kindergarten_name
                                } : null
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _c.sent();
                        typedError = error_1;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动状态文本
     * @param status 状态码
     * @returns 状态文本
     */
    MarketingCampaignController.prototype.getStatusText = function (status) {
        var statusMap = {
            0: '草稿',
            1: '进行中',
            2: '已暂停',
            3: '已结束',
            4: '已取消'
        };
        return statusMap[status] || '未知状态';
    };
    /**
     * 获取活动类型文本
     * @param type 类型码
     * @returns 类型文本
     */
    MarketingCampaignController.prototype.getCampaignTypeText = function (type) {
        var typeMap = {
            1: '推广活动',
            2: '优惠活动',
            3: '品牌活动',
            4: '招生活动'
        };
        return typeMap[type] || '其他';
    };
    /**
     * 获取单个营销活动
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.findOne = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, query, campaigns, campaign, error_2, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        query = "\n        SELECT mc.*, k.name as kindergarten_name,\n               creator.real_name as creator_name,\n               updater.real_name as updater_name\n        FROM marketing_campaigns mc\n        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id\n        LEFT JOIN users creator ON mc.creator_id = creator.id\n        LEFT JOIN users updater ON mc.updater_id = updater.id\n        WHERE mc.id = :id AND mc.deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        campaigns = _a.sent();
                        campaign = campaigns[0];
                        if (!campaign) {
                            res.status(404).json({
                                success: false,
                                error: {
                                    code: 'NOT_FOUND',
                                    message: '营销活动不存在'
                                }
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            data: {
                                id: campaign.id,
                                kindergartenId: campaign.kindergarten_id,
                                title: campaign.title,
                                campaignType: campaign.campaign_type,
                                startDate: campaign.start_date,
                                endDate: campaign.end_date,
                                targetAudience: campaign.target_audience,
                                budget: campaign.budget,
                                objective: campaign.objective,
                                description: campaign.description,
                                rules: campaign.rules,
                                rewards: campaign.rewards,
                                coverImage: campaign.cover_image,
                                bannerImage: campaign.banner_image,
                                participantCount: campaign.participant_count,
                                conversionCount: campaign.conversion_count,
                                viewCount: campaign.view_count,
                                totalRevenue: campaign.total_revenue,
                                status: campaign.status,
                                statusText: this.getStatusText(campaign.status),
                                campaignTypeText: this.getCampaignTypeText(campaign.campaign_type),
                                remark: campaign.remark,
                                creatorId: campaign.creator_id,
                                updaterId: campaign.updater_id,
                                createdAt: campaign.created_at,
                                updatedAt: campaign.updated_at,
                                kindergarten: campaign.kindergarten_name ? {
                                    id: campaign.kindergarten_id,
                                    name: campaign.kindergarten_name
                                } : null,
                                creator: campaign.creator_name ? {
                                    id: campaign.creator_id,
                                    name: campaign.creator_name
                                } : null,
                                updater: campaign.updater_name ? {
                                    id: campaign.updater_id,
                                    name: campaign.updater_name
                                } : null
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        typedError = error_2;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取营销活动列表
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.findAll = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, page, _c, pageSize, filters, limit, offset, whereClause, replacements, countQuery, countResults, total, listQuery, campaigns, formattedCampaigns, error_3, typedError;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        _d.trys.push([0, 3, , 4]);
                        _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.pageSize, pageSize = _c === void 0 ? 10 : _c, filters = __rest(_a, ["page", "pageSize"]);
                        limit = Number(pageSize) || 10;
                        offset = (Number(page) || 1 - 1) * limit;
                        whereClause = 'mc.deleted_at IS NULL';
                        replacements = { limit: limit, offset: offset };
                        if (filters.kindergartenId) {
                            whereClause += ' AND mc.kindergarten_id = :kindergartenId';
                            replacements.kindergartenId = filters.kindergartenId;
                        }
                        if (filters.status !== undefined) {
                            whereClause += ' AND mc.status = :status';
                            replacements.status = filters.status;
                        }
                        if (filters.campaignType) {
                            whereClause += ' AND mc.campaign_type = :campaignType';
                            replacements.campaignType = filters.campaignType;
                        }
                        if (filters.title) {
                            whereClause += ' AND mc.title LIKE :title';
                            replacements.title = "%".concat(filters.title, "%");
                        }
                        countQuery = "\n        SELECT COUNT(*) as total\n        FROM marketing_campaigns mc\n        WHERE ".concat(whereClause, "\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(countQuery, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        countResults = _d.sent();
                        total = countResults[0].total;
                        listQuery = "\n        SELECT mc.*, k.name as kindergarten_name\n        FROM marketing_campaigns mc\n        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id\n        WHERE ".concat(whereClause, "\n        ORDER BY mc.created_at DESC\n        LIMIT :limit OFFSET :offset\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(listQuery, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 2:
                        campaigns = _d.sent();
                        formattedCampaigns = campaigns.map(function (campaign) { return ({
                            id: campaign.id,
                            kindergartenId: campaign.kindergarten_id,
                            title: campaign.title,
                            campaignType: campaign.campaign_type,
                            startDate: campaign.start_date,
                            endDate: campaign.end_date,
                            targetAudience: campaign.target_audience,
                            budget: campaign.budget,
                            participantCount: campaign.participant_count,
                            conversionCount: campaign.conversion_count,
                            viewCount: campaign.view_count,
                            totalRevenue: campaign.total_revenue,
                            status: campaign.status,
                            statusText: _this.getStatusText(campaign.status),
                            campaignTypeText: _this.getCampaignTypeText(campaign.campaign_type),
                            createdAt: campaign.created_at,
                            updatedAt: campaign.updated_at,
                            kindergarten: campaign.kindergarten_name ? {
                                id: campaign.kindergarten_id,
                                name: campaign.kindergarten_name
                            } : null
                        }); });
                        res.json({
                            success: true,
                            data: {
                                list: formattedCampaigns,
                                pagination: {
                                    page: Number(page) || 0,
                                    pageSize: limit,
                                    total: total,
                                    totalPages: Math.ceil(total / limit)
                                }
                            }
                        });
                        return [3 /*break*/, 4];
                    case 3:
                        error_3 = _d.sent();
                        typedError = error_3;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 更新营销活动
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.update = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userData, _a, kindergartenId, title, campaignType, startDate, endDate, targetAudience, budget, objective, description, rules, rewards, coverImage, bannerImage, status_2, remark, checkQuery, existingResults, existing, updateFields, replacements, updateQuery, selectQuery, campaignsResults, campaign, error_4, typedError;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 4, , 5]);
                        id = req.params.id;
                        userData = req.user;
                        _a = req.body, kindergartenId = _a.kindergartenId, title = _a.title, campaignType = _a.campaignType, startDate = _a.startDate, endDate = _a.endDate, targetAudience = _a.targetAudience, budget = _a.budget, objective = _a.objective, description = _a.description, rules = _a.rules, rewards = _a.rewards, coverImage = _a.coverImage, bannerImage = _a.bannerImage, status_2 = _a.status, remark = _a.remark;
                        checkQuery = "\n        SELECT id FROM marketing_campaigns \n        WHERE id = :id AND deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(checkQuery, {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        existingResults = _b.sent();
                        existing = existingResults[0];
                        if (!existing) {
                            res.status(404).json({
                                success: false,
                                error: {
                                    code: 'NOT_FOUND',
                                    message: '营销活动不存在'
                                }
                            });
                            return [2 /*return*/];
                        }
                        updateFields = [];
                        replacements = { id: id, updaterId: userData.id };
                        if (kindergartenId !== undefined) {
                            updateFields.push('kindergarten_id = :kindergartenId');
                            replacements.kindergartenId = kindergartenId;
                        }
                        if (title !== undefined) {
                            updateFields.push('title = :title');
                            replacements.title = title;
                        }
                        if (campaignType !== undefined) {
                            updateFields.push('campaign_type = :campaignType');
                            replacements.campaignType = campaignType;
                        }
                        if (startDate !== undefined) {
                            updateFields.push('start_date = :startDate');
                            replacements.startDate = startDate;
                        }
                        if (endDate !== undefined) {
                            updateFields.push('end_date = :endDate');
                            replacements.endDate = endDate;
                        }
                        if (targetAudience !== undefined) {
                            updateFields.push('target_audience = :targetAudience');
                            replacements.targetAudience = targetAudience;
                        }
                        if (budget !== undefined) {
                            updateFields.push('budget = :budget');
                            replacements.budget = budget;
                        }
                        if (objective !== undefined) {
                            updateFields.push('objective = :objective');
                            replacements.objective = objective;
                        }
                        if (description !== undefined) {
                            updateFields.push('description = :description');
                            replacements.description = description;
                        }
                        if (rules !== undefined) {
                            updateFields.push('rules = :rules');
                            replacements.rules = rules;
                        }
                        if (rewards !== undefined) {
                            updateFields.push('rewards = :rewards');
                            replacements.rewards = rewards;
                        }
                        if (coverImage !== undefined) {
                            updateFields.push('cover_image = :coverImage');
                            replacements.coverImage = coverImage;
                        }
                        if (bannerImage !== undefined) {
                            updateFields.push('banner_image = :bannerImage');
                            replacements.bannerImage = bannerImage;
                        }
                        if (status_2 !== undefined) {
                            updateFields.push('status = :status');
                            replacements.status = status_2;
                        }
                        if (remark !== undefined) {
                            updateFields.push('remark = :remark');
                            replacements.remark = remark;
                        }
                        if (updateFields.length === 0) {
                            res.status(400).json({
                                success: false,
                                error: {
                                    code: 'VALIDATION_ERROR',
                                    message: '没有提供要更新的字段'
                                }
                            });
                            return [2 /*return*/];
                        }
                        updateQuery = "\n        UPDATE marketing_campaigns \n        SET ".concat(updateFields.join(', '), ", updater_id = :updaterId, updated_at = NOW()\n        WHERE id = :id\n      ");
                        return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                                replacements: replacements,
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 2:
                        _b.sent();
                        selectQuery = "\n        SELECT mc.*, k.name as kindergarten_name\n        FROM marketing_campaigns mc\n        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id\n        WHERE mc.id = :id\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(selectQuery, {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 3:
                        campaignsResults = _b.sent();
                        campaign = campaignsResults[0];
                        res.json({
                            success: true,
                            data: {
                                id: campaign.id,
                                kindergartenId: campaign.kindergarten_id,
                                title: campaign.title,
                                campaignType: campaign.campaign_type,
                                startDate: campaign.start_date,
                                endDate: campaign.end_date,
                                targetAudience: campaign.target_audience,
                                budget: campaign.budget,
                                objective: campaign.objective,
                                description: campaign.description,
                                rules: campaign.rules,
                                rewards: campaign.rewards,
                                coverImage: campaign.cover_image,
                                bannerImage: campaign.banner_image,
                                participantCount: campaign.participant_count,
                                conversionCount: campaign.conversion_count,
                                viewCount: campaign.view_count,
                                totalRevenue: campaign.total_revenue,
                                status: campaign.status,
                                statusText: this.getStatusText(campaign.status),
                                campaignTypeText: this.getCampaignTypeText(campaign.campaign_type),
                                remark: campaign.remark,
                                updaterId: campaign.updater_id,
                                updatedAt: campaign.updated_at
                            }
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _b.sent();
                        typedError = error_4;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 删除营销活动
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype["delete"] = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userData, deleteQuery, deleteResults, error_5, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userData = req.user;
                        deleteQuery = "\n        UPDATE marketing_campaigns \n        SET deleted_at = NOW(), updater_id = :updaterId, updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(deleteQuery, {
                                replacements: { id: id, updaterId: userData.id },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        deleteResults = _a.sent();
                        if (deleteResults[1].affectedRows === 0) {
                            res.status(404).json({
                                success: false,
                                error: {
                                    code: 'NOT_FOUND',
                                    message: '营销活动不存在或已被删除'
                                }
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            message: '删除营销活动成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        typedError = error_5;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 设置活动规则
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.setRules = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, rules, userData, updateQuery, updateResults, error_6, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        rules = req.body.rules;
                        userData = req.user;
                        updateQuery = "\n        UPDATE marketing_campaigns \n        SET rules = :rules, updater_id = :updaterId, updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                                replacements: { id: id, rules: rules, updaterId: userData.id },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        updateResults = _a.sent();
                        if (updateResults[1].affectedRows === 0) {
                            res.status(404).json({
                                success: false,
                                error: {
                                    code: 'NOT_FOUND',
                                    message: '营销活动不存在'
                                }
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            message: '设置活动规则成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        typedError = error_6;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动统计
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.getStats = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, query, statsResults, result, error_7, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        query = "\n        SELECT \n          participant_count,\n          conversion_count,\n          view_count,\n          total_revenue,\n          CASE \n            WHEN participant_count > 0 THEN ROUND((conversion_count / participant_count) * 100, 2)\n            ELSE 0\n          END as conversion_rate\n        FROM marketing_campaigns\n        WHERE id = :id AND deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        statsResults = _a.sent();
                        result = statsResults[0];
                        if (!result) {
                            res.status(404).json({
                                success: false,
                                error: {
                                    code: 'NOT_FOUND',
                                    message: '营销活动不存在'
                                }
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            data: {
                                participantCount: result.participant_count,
                                conversionCount: result.conversion_count,
                                viewCount: result.view_count,
                                totalRevenue: result.total_revenue,
                                conversionRate: result.conversion_rate
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_7 = _a.sent();
                        typedError = error_7;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 获取活动性能数据
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.getPerformance = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, query, performanceResults, result, error_8, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        query = "\n        SELECT \n          participant_count,\n          conversion_count,\n          view_count,\n          total_revenue,\n          created_at,\n          start_date,\n          end_date\n        FROM marketing_campaigns\n        WHERE id = :id AND deleted_at IS NULL\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(query, {
                                replacements: { id: id },
                                type: sequelize_1.QueryTypes.SELECT
                            })];
                    case 1:
                        performanceResults = _a.sent();
                        result = performanceResults[0];
                        if (!result) {
                            res.status(404).json({
                                success: false,
                                error: {
                                    code: 'NOT_FOUND',
                                    message: '营销活动不存在'
                                }
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            data: {
                                participantCount: result.participant_count,
                                conversionCount: result.conversion_count,
                                viewCount: result.view_count,
                                totalRevenue: result.total_revenue,
                                startDate: result.start_date,
                                endDate: result.end_date,
                                createdAt: result.created_at
                            }
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_8 = _a.sent();
                        typedError = error_8;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 启动活动
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.launch = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userData, updateQuery, launchResults, error_9, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userData = req.user;
                        updateQuery = "\n        UPDATE marketing_campaigns \n        SET status = :status, updater_id = :updaterId, updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL AND status = :draftStatus\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                                replacements: {
                                    id: id,
                                    status: CampaignStatus.ACTIVE,
                                    draftStatus: CampaignStatus.DRAFT,
                                    updaterId: userData.id
                                },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        launchResults = _a.sent();
                        if (launchResults[1].affectedRows === 0) {
                            res.status(400).json({
                                success: false,
                                error: {
                                    code: 'INVALID_STATUS',
                                    message: '只能启动草稿状态的活动'
                                }
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            message: '启动活动成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        typedError = error_9;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 暂停活动
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.pause = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userData, updateQuery, pauseResults, error_10, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userData = req.user;
                        updateQuery = "\n        UPDATE marketing_campaigns \n        SET status = :status, updater_id = :updaterId, updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL AND status = :activeStatus\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                                replacements: {
                                    id: id,
                                    status: CampaignStatus.PAUSED,
                                    activeStatus: CampaignStatus.ACTIVE,
                                    updaterId: userData.id
                                },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        pauseResults = _a.sent();
                        if (pauseResults[1].affectedRows === 0) {
                            res.status(400).json({
                                success: false,
                                error: {
                                    code: 'INVALID_STATUS',
                                    message: '只能暂停进行中的活动'
                                }
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            message: '暂停活动成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_10 = _a.sent();
                        typedError = error_10;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * 结束活动
     * @param req 请求对象
     * @param res 响应对象
     */
    MarketingCampaignController.prototype.end = function (req, res) {
        return __awaiter(this, void 0, void 0, function () {
            var id, userData, updateQuery, endResults, error_11, typedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        id = req.params.id;
                        userData = req.user;
                        updateQuery = "\n        UPDATE marketing_campaigns \n        SET status = :status, updater_id = :updaterId, updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL AND status IN (:activeStatus, :pausedStatus)\n      ";
                        return [4 /*yield*/, init_1.sequelize.query(updateQuery, {
                                replacements: {
                                    id: id,
                                    status: CampaignStatus.COMPLETED,
                                    activeStatus: CampaignStatus.ACTIVE,
                                    pausedStatus: CampaignStatus.PAUSED,
                                    updaterId: userData.id
                                },
                                type: sequelize_1.QueryTypes.UPDATE
                            })];
                    case 1:
                        endResults = _a.sent();
                        if (endResults[1].affectedRows === 0) {
                            res.status(400).json({
                                success: false,
                                error: {
                                    code: 'INVALID_STATUS',
                                    message: '只能结束进行中或已暂停的活动'
                                }
                            });
                            return [2 /*return*/];
                        }
                        res.json({
                            success: true,
                            message: '结束活动成功'
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_11 = _a.sent();
                        typedError = error_11;
                        res.status(500).json({
                            success: false,
                            error: {
                                code: 'SERVER_ERROR',
                                message: typedError.message
                            }
                        });
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return MarketingCampaignController;
}());
exports.MarketingCampaignController = MarketingCampaignController;
// 创建控制器实例
var marketingCampaignController = new MarketingCampaignController();
// 导出控制器方法
exports.create = marketingCampaignController.create, exports.findOne = marketingCampaignController.findOne, exports.findAll = marketingCampaignController.findAll, exports.update = marketingCampaignController.update, exports.deleteCampaign = marketingCampaignController["delete"], exports.setRules = marketingCampaignController.setRules, exports.getStats = marketingCampaignController.getStats, exports.getPerformance = marketingCampaignController.getPerformance, exports.launch = marketingCampaignController.launch, exports.pause = marketingCampaignController.pause, exports.end = marketingCampaignController.end;
