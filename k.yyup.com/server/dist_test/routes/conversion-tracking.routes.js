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
var auth_middleware_1 = require("../middlewares/auth.middleware");
var init_1 = require("../init");
var sequelize_1 = require("sequelize");
// // import { ConversionTrackingController } from '../controllers/conversion-tracking.controller';
var router = (0, express_1.Router)();
// const conversionTrackingController = new ConversionTrackingController();
/**
 * @swagger
 * components:
 *   schemas:
 *     ConversionTracking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 转化跟踪记录ID
 *         kindergarten_id:
 *           type: integer
 *           description: 幼儿园ID
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: 家长ID
 *         campaign_id:
 *           type: integer
 *           nullable: true
 *           description: 营销活动ID
 *         channel_id:
 *           type: integer
 *           description: 营销渠道ID
 *         advertisement_id:
 *           type: integer
 *           nullable: true
 *           description: 广告ID
 *         conversion_type:
 *           type: integer
 *           description: 转化类型 (1-咨询, 2-报名, 3-付费)
 *         conversion_type_name:
 *           type: string
 *           description: 转化类型名称
 *         conversion_source:
 *           type: string
 *           description: 转化来源
 *         conversion_event:
 *           type: string
 *           description: 转化事件
 *         event_value:
 *           type: number
 *           format: float
 *           description: 事件价值
 *         event_time:
 *           type: string
 *           format: date-time
 *           description: 事件时间
 *         conversion_status:
 *           type: integer
 *           description: 转化状态 (0-未完成, 1-已完成)
 *         follow_up_status:
 *           type: integer
 *           description: 跟进状态 (0-未跟进, 1-已跟进)
 *         is_first_visit:
 *           type: integer
 *           description: 是否首次访问 (0-否, 1-是)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 删除时间
 *     ConversionTrackingInput:
 *       type: object
 *       required:
 *         - channelId
 *       properties:
 *         kindergartenId:
 *           type: integer
 *           default: 1
 *           description: 幼儿园ID
 *         parentId:
 *           type: integer
 *           nullable: true
 *           description: 家长ID
 *         campaignId:
 *           type: integer
 *           nullable: true
 *           description: 营销活动ID
 *         channelId:
 *           type: integer
 *           description: 营销渠道ID
 *         advertisementId:
 *           type: integer
 *           nullable: true
 *           description: 广告ID
 *         conversionType:
 *           type: integer
 *           default: 1
 *           description: 转化类型 (1-咨询, 2-报名, 3-付费)
 *         conversionSource:
 *           type: string
 *           default: "未知来源"
 *           description: 转化来源
 *         conversionEvent:
 *           type: string
 *           default: "未知事件"
 *           description: 转化事件
 *         eventValue:
 *           type: number
 *           format: float
 *           default: 0
 *           description: 事件价值
 *         conversionStatus:
 *           type: integer
 *           default: 0
 *           description: 转化状态 (0-未完成, 1-已完成)
 *         followUpStatus:
 *           type: integer
 *           default: 0
 *           description: 跟进状态 (0-未跟进, 1-已跟进)
 *         isFirstVisit:
 *           type: integer
 *           default: 0
 *           description: 是否首次访问 (0-否, 1-是)
 *     ConversionTrackingUpdate:
 *       type: object
 *       properties:
 *         conversionStatus:
 *           type: integer
 *           description: 转化状态 (0-未完成, 1-已完成)
 *         followUpStatus:
 *           type: integer
 *           description: 跟进状态 (0-未跟进, 1-已跟进)
 *         eventValue:
 *           type: number
 *           format: float
 *           description: 事件价值
 *     ConversionTrackingReport:
 *       type: object
 *       properties:
 *         total_conversions:
 *           type: integer
 *           description: 总转化数
 *         successful_conversions:
 *           type: integer
 *           description: 成功转化数
 *         avg_event_value:
 *           type: number
 *           format: float
 *           description: 平均事件价值
 *         total_event_value:
 *           type: number
 *           format: float
 *           description: 总事件价值
 *     PaginatedConversionTrackingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "获取转化跟踪列表成功"
 *         data:
 *           type: object
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConversionTracking'
 *             page:
 *               type: integer
 *               description: 当前页码
 *             limit:
 *               type: integer
 *               description: 每页数量
 *             total:
 *               type: integer
 *               description: 总记录数
 *             totalPages:
 *               type: integer
 *               description: 总页数
 * tags:
 *   name: Marketing - Conversion Tracking
 *   description: 营销活动转化跟踪管理
 */
/**
 * @swagger
 * /conversion-trackings/by-channel/{channelId}:
 *   get:
 *     summary: 按渠道获取转化跟踪列表
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销渠道ID
 *     responses:
 *       200:
 *         description: 按渠道获取转化跟踪列表成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "按渠道获取转化跟踪列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     channelId:
 *                       type: integer
 *                       description: 渠道ID
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ConversionTracking'
 *                     total:
 *                       type: integer
 *                       description: 记录总数
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/by-channel/:channelId', [auth_middleware_1.verifyToken], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var channelId, trackings, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                channelId = req.params.channelId;
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT ct.*, \n               CASE \n                 WHEN ct.conversion_type = 1 THEN '\u54A8\u8BE2'\n                 WHEN ct.conversion_type = 2 THEN '\u62A5\u540D'\n                 WHEN ct.conversion_type = 3 THEN '\u4ED8\u8D39'\n                 ELSE '\u5176\u4ED6'\n               END as conversion_type_name\n        FROM conversion_trackings ct\n        WHERE ct.channel_id = :channelId AND ct.deleted_at IS NULL\n        ORDER BY ct.created_at DESC\n      ", {
                        replacements: { channelId: Number(channelId) },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                trackings = _a.sent();
                res.json({
                    success: true,
                    message: '按渠道获取转化跟踪列表成功',
                    data: {
                        channelId: Number(channelId),
                        items: trackings,
                        total: trackings.length
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error('按渠道获取转化跟踪列表失败:', error_1);
                res.status(500).json({ success: false, message: '按渠道获取转化跟踪列表失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /conversion-trackings:
 *   get:
 *     summary: 获取转化跟踪列表
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取转化跟踪列表成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedConversionTrackingResponse'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.get('/', [auth_middleware_1.verifyToken], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b, page, _c, limit, offset, trackings, totalResults, total, error_2;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.query, _b = _a.page, page = _b === void 0 ? 1 : _b, _c = _a.limit, limit = _c === void 0 ? 10 : _c;
                offset = (Number(page) - 1) * Number(limit);
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT ct.*, \n               CASE \n                 WHEN ct.conversion_type = 1 THEN '\u54A8\u8BE2'\n                 WHEN ct.conversion_type = 2 THEN '\u62A5\u540D'\n                 WHEN ct.conversion_type = 3 THEN '\u4ED8\u8D39'\n                 ELSE '\u5176\u4ED6'\n               END as conversion_type_name\n        FROM conversion_trackings ct\n        WHERE ct.deleted_at IS NULL\n        ORDER BY ct.created_at DESC\n        LIMIT :limit OFFSET :offset\n      ", {
                        replacements: { limit: Number(limit), offset: offset },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                trackings = _d.sent();
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT COUNT(*) as total\n        FROM conversion_trackings ct\n        WHERE ct.deleted_at IS NULL\n      ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 2:
                totalResults = _d.sent();
                total = totalResults[0].total;
                res.json({
                    success: true,
                    message: '获取转化跟踪列表成功',
                    data: {
                        items: trackings,
                        page: Number(page),
                        limit: Number(limit),
                        total: Number(total),
                        totalPages: Math.ceil(Number(total) / Number(limit))
                    }
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _d.sent();
                console.error('获取转化跟踪列表失败:', error_2);
                res.status(500).json({ success: false, message: '获取转化跟踪列表失败' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /conversion-trackings/{id}:
 *   get:
 *     summary: 获取单个转化跟踪
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 转化跟踪记录ID
 *     responses:
 *       200:
 *         description: 获取转化跟踪详情成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取转化跟踪详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/ConversionTracking'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 转化跟踪记录不存在
 *       500:
 *         description: 服务器错误
 */
router.get('/:id', [auth_middleware_1.verifyToken], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, trackingResults, tracking, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT ct.*, \n               CASE \n                 WHEN ct.conversion_type = 1 THEN '\u54A8\u8BE2'\n                 WHEN ct.conversion_type = 2 THEN '\u62A5\u540D'\n                 WHEN ct.conversion_type = 3 THEN '\u4ED8\u8D39'\n                 ELSE '\u5176\u4ED6'\n               END as conversion_type_name\n        FROM conversion_trackings ct\n        WHERE ct.id = :id AND ct.deleted_at IS NULL\n      ", {
                        replacements: { id: Number(id) },
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                trackingResults = _a.sent();
                tracking = trackingResults[0];
                if (!tracking) {
                    res.status(404).json({ success: false, message: '转化跟踪记录不存在' });
                    return [2 /*return*/];
                }
                res.json({
                    success: true,
                    message: '获取转化跟踪详情成功',
                    data: tracking
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('获取转化跟踪详情失败:', error_3);
                res.status(500).json({ success: false, message: '获取转化跟踪详情失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /conversion-trackings:
 *   post:
 *     summary: 创建转化跟踪
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConversionTrackingInput'
 *           example:
 *             channelId: 1
 *             conversionType: 1
 *             conversionSource: "微信公众号"
 *             conversionEvent: "点击咨询按钮"
 *             eventValue: 100
 *     responses:
 *       201:
 *         description: 创建转化跟踪成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "创建转化跟踪成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 新创建的转化跟踪记录ID
 *                     conversionType:
 *                       type: integer
 *                       description: 转化类型
 *                     conversionSource:
 *                       type: string
 *                       description: 转化来源
 *                     conversionEvent:
 *                       type: string
 *                       description: 转化事件
 *                     createTime:
 *                       type: string
 *                       format: date-time
 *                       description: 创建时间
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/', [auth_middleware_1.verifyToken], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, _a, _b, kindergartenId, _c, parentId, _d, campaignId, channelId, _e, advertisementId, _f, conversionType, _g, conversionSource, _h, conversionEvent, _j, eventValue, _k, conversionStatus, _l, followUpStatus, _m, isFirstVisit, insertResults, error_4;
    var _o;
    return __generator(this, function (_p) {
        switch (_p.label) {
            case 0:
                _p.trys.push([0, 2, , 3]);
                userId = (_o = req.user) === null || _o === void 0 ? void 0 : _o.id;
                _a = req.body, _b = _a.kindergartenId, kindergartenId = _b === void 0 ? 1 : _b, _c = _a.parentId, parentId = _c === void 0 ? null : _c, _d = _a.campaignId, campaignId = _d === void 0 ? null : _d, channelId = _a.channelId, _e = _a.advertisementId, advertisementId = _e === void 0 ? null : _e, _f = _a.conversionType, conversionType = _f === void 0 ? 1 : _f, _g = _a.conversionSource, conversionSource = _g === void 0 ? '未知来源' : _g, _h = _a.conversionEvent, conversionEvent = _h === void 0 ? '未知事件' : _h, _j = _a.eventValue, eventValue = _j === void 0 ? 0 : _j, _k = _a.conversionStatus, conversionStatus = _k === void 0 ? 0 : _k, _l = _a.followUpStatus, followUpStatus = _l === void 0 ? 0 : _l, _m = _a.isFirstVisit, isFirstVisit = _m === void 0 ? 0 : _m;
                return [4 /*yield*/, init_1.sequelize.query("\n        INSERT INTO conversion_trackings (\n          kindergarten_id, parent_id, campaign_id, channel_id, advertisement_id,\n          conversion_type, conversion_source, conversion_event, event_value,\n          event_time, conversion_status, follow_up_status, is_first_visit,\n          created_at, updated_at\n        ) VALUES (\n          :kindergartenId, :parentId, :campaignId, :channelId, :advertisementId,\n          :conversionType, :conversionSource, :conversionEvent, :eventValue,\n          NOW(), :conversionStatus, :followUpStatus, :isFirstVisit,\n          NOW(), NOW()\n        )\n      ", {
                        replacements: {
                            kindergartenId: kindergartenId,
                            parentId: parentId,
                            campaignId: campaignId,
                            channelId: channelId,
                            advertisementId: advertisementId,
                            conversionType: conversionType,
                            conversionSource: conversionSource,
                            conversionEvent: conversionEvent,
                            eventValue: eventValue,
                            conversionStatus: conversionStatus,
                            followUpStatus: followUpStatus,
                            isFirstVisit: isFirstVisit
                        },
                        type: sequelize_1.QueryTypes.INSERT
                    })];
            case 1:
                insertResults = _p.sent();
                res.status(201).json({
                    success: true,
                    message: '创建转化跟踪成功',
                    data: {
                        id: insertResults[0],
                        conversionType: conversionType,
                        conversionSource: conversionSource,
                        conversionEvent: conversionEvent,
                        createTime: new Date()
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _p.sent();
                console.error('创建转化跟踪失败:', error_4);
                res.status(500).json({ success: false, message: '创建转化跟踪失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /conversion-trackings/{id}:
 *   put:
 *     summary: 更新转化跟踪
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 转化跟踪记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConversionTrackingUpdate'
 *           example:
 *             conversionStatus: 1
 *             followUpStatus: 1
 *             eventValue: 150
 *     responses:
 *       200:
 *         description: 更新转化跟踪成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "更新转化跟踪成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 转化跟踪记录ID
 *                     updateTime:
 *                       type: string
 *                       format: date-time
 *                       description: 更新时间
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 转化跟踪记录不存在
 *       500:
 *         description: 服务器错误
 */
router.put('/:id', [auth_middleware_1.verifyToken], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, _b, conversionStatus, _c, followUpStatus, _d, eventValue, replacements, setClause, query, error_5;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 2, , 3]);
                id = req.params.id;
                _a = req.body, _b = _a.conversionStatus, conversionStatus = _b === void 0 ? null : _b, _c = _a.followUpStatus, followUpStatus = _c === void 0 ? null : _c, _d = _a.eventValue, eventValue = _d === void 0 ? null : _d;
                replacements = { id: Number(id) };
                if (conversionStatus !== null)
                    replacements.conversionStatus = conversionStatus;
                if (followUpStatus !== null)
                    replacements.followUpStatus = followUpStatus;
                if (eventValue !== null)
                    replacements.eventValue = eventValue;
                setClause = [];
                if ('conversionStatus' in replacements)
                    setClause.push('conversion_status = :conversionStatus');
                if ('followUpStatus' in replacements)
                    setClause.push('follow_up_status = :followUpStatus');
                if ('eventValue' in replacements)
                    setClause.push('event_value = :eventValue');
                setClause.push('updated_at = NOW()');
                query = "\n        UPDATE conversion_trackings \n        SET ".concat(setClause.join(', '), "\n        WHERE id = :id AND deleted_at IS NULL\n      ");
                return [4 /*yield*/, init_1.sequelize.query(query, {
                        replacements: replacements,
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                _e.sent();
                res.json({
                    success: true,
                    message: '更新转化跟踪成功',
                    data: {
                        id: Number(id),
                        updateTime: new Date()
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_5 = _e.sent();
                console.error('更新转化跟踪失败:', error_5);
                res.status(500).json({ success: false, message: '更新转化跟踪失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /conversion-trackings/{id}:
 *   delete:
 *     summary: 删除转化跟踪
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 转化跟踪记录ID
 *     responses:
 *       200:
 *         description: 删除转化跟踪成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "删除转化跟踪成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 被删除的转化跟踪记录ID
 *       401:
 *         description: 未授权
 *       404:
 *         description: 转化跟踪记录不存在
 *       500:
 *         description: 服务器错误
 */
router["delete"]('/:id', [auth_middleware_1.verifyToken], function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                id = req.params.id;
                return [4 /*yield*/, init_1.sequelize.query("\n        UPDATE conversion_trackings \n        SET deleted_at = NOW()\n        WHERE id = :id AND deleted_at IS NULL\n      ", {
                        replacements: { id: Number(id) },
                        type: sequelize_1.QueryTypes.UPDATE
                    })];
            case 1:
                _a.sent();
                res.json({
                    success: true,
                    message: '删除转化跟踪成功',
                    data: {
                        id: Number(id)
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_6 = _a.sent();
                console.error('删除转化跟踪失败:', error_6);
                res.status(500).json({ success: false, message: '删除转化跟踪失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /conversion-trackings/report:
 *   get:
 *     summary: 获取转化跟踪报告
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取转化跟踪报告成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "获取转化跟踪报告成功"
 *                 data:
 *                   $ref: '#/components/schemas/ConversionTrackingReport'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
 */
router.get('/report', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('CONVERSION_TRACKING_MANAGE'), function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var statsResults, stats, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, init_1.sequelize.query("\n        SELECT \n          COUNT(*) as total_conversions,\n          SUM(CASE WHEN conversion_status = 1 THEN 1 ELSE 0 END) as successful_conversions,\n          AVG(event_value) as avg_event_value,\n          SUM(event_value) as total_event_value\n        FROM conversion_trackings \n        WHERE deleted_at IS NULL\n      ", {
                        type: sequelize_1.QueryTypes.SELECT
                    })];
            case 1:
                statsResults = _a.sent();
                stats = statsResults[0];
                res.json({
                    success: true,
                    message: '获取转化跟踪报告成功',
                    data: stats
                });
                return [3 /*break*/, 3];
            case 2:
                error_7 = _a.sent();
                console.error('获取转化跟踪报告失败:', error_7);
                res.status(500).json({ success: false, message: '获取转化跟踪报告失败' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
