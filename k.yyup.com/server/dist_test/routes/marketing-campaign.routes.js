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
var express_1 = require("express");
var marketing_campaign_controller_1 = require("../controllers/marketing-campaign.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
var router = (0, express_1.Router)();
var marketingCampaignController = new marketing_campaign_controller_1.MarketingCampaignController();
/**
 * @swagger
 * tags:
 *   name: MarketingCampaigns
 *   description: 营销活动管理API
 */
/**
 * @swagger
 * components:
 *   schemas:
 *     MarketingCampaign:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 营销活动ID
 *         name:
 *           type: string
 *           description: 活动名称
 *         description:
 *           type: string
 *           description: 活动描述
 *         campaign_type:
 *           type: string
 *           enum: [online, offline, hybrid]
 *           description: 活动类型
 *         status:
 *           type: string
 *           enum: [draft, active, paused, ended]
 *           description: 活动状态
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: 开始日期
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: 结束日期
 *         budget:
 *           type: number
 *           description: 预算金额
 *         target_audience:
 *           type: string
 *           description: 目标受众
 *         kindergarten_id:
 *           type: integer
 *           description: 幼儿园ID
 *         kindergarten_name:
 *           type: string
 *           description: 幼儿园名称
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *
 *     MarketingCampaignROI:
 *       type: object
 *       properties:
 *         budget:
 *           type: number
 *           description: 预算金额
 *         spent:
 *           type: number
 *           description: 已花费金额
 *         total_revenue:
 *           type: number
 *           description: 总收入
 *         roi_percentage:
 *           type: number
 *           description: ROI百分比
 *
 *     MarketingCampaignCreate:
 *       type: object
 *       required:
 *         - name
 *         - campaign_type
 *         - kindergarten_id
 *       properties:
 *         name:
 *           type: string
 *           description: 活动名称
 *         description:
 *           type: string
 *           description: 活动描述
 *         campaign_type:
 *           type: string
 *           enum: [online, offline, hybrid]
 *           description: 活动类型
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: 开始日期
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: 结束日期
 *         budget:
 *           type: number
 *           description: 预算金额
 *         target_audience:
 *           type: string
 *           description: 目标受众
 *         kindergarten_id:
 *           type: integer
 *           description: 幼儿园ID
 */
/**
 * @swagger
 * /api/marketing-campaigns/by-type/{type}:
 *   get:
 *     summary: 按类型获取营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [online, offline, hybrid]
 *         description: 活动类型
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MarketingCampaign'
 *                     total:
 *                       type: integer
 *       500:
 *         description: 服务器错误
 */
router.get('/by-type/:type', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var type, campaigns, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                type = req.params.type;
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT mc.*, k.name as kindergarten_name\n        FROM marketing_campaigns mc\n        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id\n        WHERE mc.campaign_type = :type AND mc.deleted_at IS NULL\n        ORDER BY mc.created_at DESC\n      ", {
                        replacements: { type: type },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                campaigns = _a.sent();
                res.json({
                    success: true,
                    message: '按类型获取营销活动成功',
                    data: {
                        type: type,
                        items: campaigns,
                        total: campaigns.length
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('按类型获取营销活动失败:', error_1);
                res.status(500).json({ success: false, message: '按类型获取营销活动失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/marketing-campaigns/by-status/{status}:
 *   get:
 *     summary: 按状态获取营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [draft, active, paused, ended]
 *         description: 活动状态
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MarketingCampaign'
 *                     total:
 *                       type: integer
 *       500:
 *         description: 服务器错误
 */
router.get('/by-status/:status', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var status_1, campaigns, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                status_1 = req.params.status;
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT mc.*, k.name as kindergarten_name\n        FROM marketing_campaigns mc\n        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id\n        WHERE mc.status = :status AND mc.deleted_at IS NULL\n        ORDER BY mc.created_at DESC\n      ", {
                        replacements: { status: status_1 },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                campaigns = _a.sent();
                res.json({
                    success: true,
                    message: '按状态获取营销活动成功',
                    data: {
                        status: status_1,
                        items: campaigns,
                        total: campaigns.length
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('按状态获取营销活动失败:', error_2);
                res.status(500).json({ success: false, message: '按状态获取营销活动失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/marketing-campaigns/{id}/roi:
 *   get:
 *     summary: 获取营销活动ROI
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/MarketingCampaignROI'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id/roi', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, roiResults, roi, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          mc.budget,\n          mc.budget as spent,\n          COALESCE(SUM(ct.event_value), 0) as total_revenue,\n          CASE \n            WHEN mc.budget > 0 THEN ROUND((COALESCE(SUM(ct.event_value), 0) - mc.budget) / mc.budget * 100, 2)\n            ELSE 0 \n          END as roi_percentage\n        FROM marketing_campaigns mc\n        LEFT JOIN conversion_trackings ct ON mc.id = ct.campaign_id\n        WHERE mc.id = :id AND mc.deleted_at IS NULL\n        GROUP BY mc.id, mc.budget\n      ", {
                        replacements: { id: Number(id) },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                roiResults = _a.sent();
                roi = roiResults[0];
                if (!roi) {
                    res.status(404).json({ success: false, message: '营销活动不存在' });
                    return [2 /*return*/];
                }
                res.json({
                    success: true,
                    message: '获取营销活动ROI成功',
                    data: roi
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('获取营销活动ROI失败:', error_3);
                res.status(500).json({ success: false, message: '获取营销活动ROI失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/marketing-campaigns/{id}/performance:
 *   get:
 *     summary: 获取营销活动效果分析
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id/performance', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.getPerformance.bind(marketingCampaignController));
/**
 * @swagger
 * /api/marketing-campaigns/{id}/launch:
 *   post:
 *     summary: 启动营销活动（POST方式）
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 启动成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [active]
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/launch', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                // 使用全局sequelize实例
                return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE marketing_campaigns \n        SET status = 'active', updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL\n      ", {
                        replacements: { id: Number(id) },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                // 使用全局sequelize实例
                _a.sent();
                res.json({
                    success: true,
                    message: '启动营销活动成功',
                    data: {
                        id: Number(id),
                        status: 'active'
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('启动营销活动失败:', error_4);
                res.status(500).json({ success: false, message: '启动营销活动失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/marketing-campaigns/{id}/pause:
 *   post:
 *     summary: 暂停营销活动（POST方式）
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 暂停成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [paused]
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.post('/:id/pause', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                // 使用全局sequelize实例
                return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE marketing_campaigns \n        SET status = 'paused', updated_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL\n      ", {
                        replacements: { id: Number(id) },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                // 使用全局sequelize实例
                _a.sent();
                res.json({
                    success: true,
                    message: '暂停营销活动成功',
                    data: {
                        id: Number(id),
                        status: 'paused'
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                console.error('暂停营销活动失败:', error_5);
                res.status(500).json({ success: false, message: '暂停营销活动失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/marketing-campaigns:
 *   get:
 *     summary: 获取营销活动列表
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 每页数量
 *       - in: query
 *         name: kindergarten_id
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MarketingCampaign'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: 服务器错误
 *   post:
 *     summary: 创建营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarketingCampaignCreate'
 *     responses:
 *       201:
 *         description: 创建成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
 */
router.get('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.findAll.bind(marketingCampaignController));
router.post('/', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.create.bind(marketingCampaignController));
/**
 * @swagger
 * /api/marketing-campaigns/{id}:
 *   get:
 *     summary: 获取单个营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 *   put:
 *     summary: 更新营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarketingCampaignCreate'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 *   delete:
 *     summary: 删除营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.findOne.bind(marketingCampaignController));
/**
 * @swagger
 * /api/marketing-campaigns/{id}:
 *   put:
 *     summary: 更新营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarketingCampaignInput'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketingCampaignResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.update.bind(marketingCampaignController));
router["delete"]('/:id', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController["delete"].bind(marketingCampaignController));
/**
 * @swagger
 * /api/marketing-campaigns/{id}/rules:
 *   put:
 *     summary: 设置营销活动规则
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: object
 *                 description: 活动规则配置
 *     responses:
 *       200:
 *         description: 设置成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/rules', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.setRules.bind(marketingCampaignController));
/**
 * @swagger
 * /api/marketing-campaigns/stats/{kindergartenId}:
 *   get:
 *     summary: 获取营销活动统计数据
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalCampaigns:
 *                       type: integer
 *                       description: 总活动数
 *                     activeCampaigns:
 *                       type: integer
 *                       description: 活跃活动数
 *                     totalBudget:
 *                       type: number
 *                       description: 总预算
 *                     totalRevenue:
 *                       type: number
 *                       description: 总收入
 *                     averageROI:
 *                       type: number
 *                       description: 平均ROI
 *       404:
 *         description: 幼儿园不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/stats/:kindergartenId', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.getStats.bind(marketingCampaignController));
/**
 * @swagger
 * /api/marketing-campaigns/{id}/launch:
 *   put:
 *     summary: 启动营销活动（PUT方式，保持兼容性）
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 启动成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/launch', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.launch.bind(marketingCampaignController));
/**
 * @swagger
 * /api/marketing-campaigns/{id}/pause:
 *   put:
 *     summary: 暂停营销活动（PUT方式，保持兼容性）
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 暂停成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/pause', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.pause.bind(marketingCampaignController));
/**
 * @swagger
 * /api/marketing-campaigns/{id}/end:
 *   put:
 *     summary: 结束营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 结束成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id/end', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('MARKETING_CAMPAIGN_MANAGE'), marketingCampaignController.end.bind(marketingCampaignController));
exports["default"] = router;
