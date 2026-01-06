"use strict";
/**
 * 活动策划API路由
 * 提供活动策划相关的API接口
 */
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var activity_planner_service_1 = __importDefault(require("../services/ai/activity-planner.service"));
var auth_middleware_1 = require("../middlewares/auth.middleware");
var express_validator_1 = require("express-validator");
var router = (0, express_1.Router)();
// 验证中间件
var validateRequest = function (req, res, next) {
    var errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: {
                code: 'VALIDATION_ERROR',
                message: '请求参数验证失败',
                details: errors.array()
            }
        });
    }
    next();
};
/**
 * @swagger
 * /api/activity-planner/generate:
 *   post:
 *     tags:
 *       - Activity Planner
 *     summary: 生成活动策划方案
 *     description: 使用AI智能体生成详细的活动策划方案，包括文本、图片和语音内容
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityType
 *               - targetAudience
 *             properties:
 *               activityType:
 *                 type: string
 *                 description: 活动类型
 *                 example: "儿童生日派对"
 *               targetAudience:
 *                 type: string
 *                 description: 目标受众
 *                 example: "3-6岁儿童"
 *               budget:
 *                 type: number
 *                 description: 预算（元）
 *                 example: 5000
 *               duration:
 *                 type: string
 *                 description: 活动时长
 *                 example: "2小时"
 *               location:
 *                 type: string
 *                 description: 活动地点
 *                 example: "室内游乐场"
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 特殊要求
 *                 example: ["需要摄影", "准备生日蛋糕"]
 *               preferredStyle:
 *                 type: string
 *                 enum: [professional, creative, fun, educational]
 *                 description: 偏好风格
 *                 example: "fun"
 *     responses:
 *       200:
 *         description: 策划方案生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     planId:
 *                       type: string
 *                       example: "plan_1703123456789_abc123"
 *                     title:
 *                       type: string
 *                       example: "梦幻儿童生日派对"
 *                     description:
 *                       type: string
 *                       example: "为3-6岁儿童精心设计的生日派对活动"
 *                     detailedPlan:
 *                       type: object
 *                     generatedImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["/uploads/image1.png"]
 *                     audioGuide:
 *                       type: string
 *                       example: "/uploads/audio/guide.mp3"
 *                     modelsUsed:
 *                       type: object
 *                     processingTime:
 *                       type: number
 *                       example: 15000
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/generate', auth_middleware_1.verifyToken, [
    (0, express_validator_1.body)('activityType').notEmpty().withMessage('活动类型不能为空'),
    (0, express_validator_1.body)('targetAudience').notEmpty().withMessage('目标受众不能为空'),
    (0, express_validator_1.body)('budget').optional().isNumeric().withMessage('预算必须是数字'),
    (0, express_validator_1.body)('duration').optional().isString(),
    (0, express_validator_1.body)('location').optional().isString(),
    (0, express_validator_1.body)('requirements').optional().isArray(),
    (0, express_validator_1.body)('preferredStyle').optional().isIn(['professional', 'creative', 'fun', 'educational'])
], validateRequest, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, planningRequest, result, error_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: '用户未认证'
                        })];
                }
                planningRequest = {
                    userId: userId,
                    activityType: req.body.activityType,
                    targetAudience: req.body.targetAudience,
                    budget: req.body.budget,
                    duration: req.body.duration,
                    location: req.body.location,
                    requirements: req.body.requirements,
                    preferredStyle: req.body.preferredStyle || 'professional'
                };
                console.log("\uD83C\uDFAF \u7528\u6237 ".concat(userId, " \u8BF7\u6C42\u751F\u6210\u6D3B\u52A8\u7B56\u5212: ").concat(planningRequest.activityType));
                return [4 /*yield*/, activity_planner_service_1["default"].generateActivityPlan(planningRequest)];
            case 1:
                result = _b.sent();
                res.json({
                    success: true,
                    message: '活动策划方案生成成功',
                    data: result
                });
                return [3 /*break*/, 3];
            case 2:
                error_1 = _b.sent();
                console.error('活动策划生成失败:', error_1);
                res.status(500).json({
                    success: false,
                    message: '活动策划生成失败',
                    error: error_1 instanceof Error ? error_1.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/activity-planner/stats:
 *   get:
 *     tags:
 *       - Activity Planner
 *     summary: 获取活动策划统计
 *     description: 获取用户的活动策划使用统计信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: 统计天数
 *     responses:
 *       200:
 *         description: 统计信息获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPlans:
 *                       type: number
 *                       example: 15
 *                     successRate:
 *                       type: number
 *                       example: 95.5
 *                     averageProcessingTime:
 *                       type: number
 *                       example: 12000
 *                     popularActivityTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["生日派对", "团建活动"]
 */
router.get('/stats', auth_middleware_1.verifyToken, [
    (0, express_validator_1.query)('days').optional().isInt({ min: 1, max: 365 }).withMessage('天数必须在1-365之间')
], validateRequest, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, days, stats, error_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return [2 /*return*/, res.status(401).json({
                            success: false,
                            message: '用户未认证'
                        })];
                }
                days = parseInt(req.query.days) || 30;
                return [4 /*yield*/, activity_planner_service_1["default"].getPlanningStats(userId, days)];
            case 1:
                stats = _b.sent();
                res.json({
                    success: true,
                    data: stats
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _b.sent();
                console.error('获取活动策划统计失败:', error_2);
                res.status(500).json({
                    success: false,
                    message: '获取统计信息失败',
                    error: error_2 instanceof Error ? error_2.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
/**
 * @swagger
 * /api/activity-planner/models:
 *   get:
 *     tags:
 *       - Activity Planner
 *     summary: 获取可用AI模型
 *     description: 获取活动策划可用的AI模型列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 模型列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     textModels:
 *                       type: array
 *                       items:
 *                         type: object
 *                     imageModels:
 *                       type: array
 *                       items:
 *                         type: object
 *                     speechModels:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/models', auth_middleware_1.verifyToken, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var modelCacheService, _a, textModels, imageModels, speechModels, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                modelCacheService = require('../services/ai/model-cache.service')["default"];
                return [4 /*yield*/, Promise.all([
                        modelCacheService.getModels('text'),
                        modelCacheService.getModels('image'),
                        modelCacheService.getModels('speech')
                    ])];
            case 1:
                _a = _b.sent(), textModels = _a[0], imageModels = _a[1], speechModels = _a[2];
                res.json({
                    success: true,
                    data: {
                        textModels: textModels.map(function (m) { return ({
                            id: m.id,
                            name: m.name,
                            displayName: m.displayName,
                            provider: m.provider,
                            isDefault: m.isDefault
                        }); }),
                        imageModels: imageModels.map(function (m) { return ({
                            id: m.id,
                            name: m.name,
                            displayName: m.displayName,
                            provider: m.provider,
                            isDefault: m.isDefault
                        }); }),
                        speechModels: speechModels.map(function (m) { return ({
                            id: m.id,
                            name: m.name,
                            displayName: m.displayName,
                            provider: m.provider,
                            isDefault: m.isDefault
                        }); })
                    }
                });
                return [3 /*break*/, 3];
            case 2:
                error_3 = _b.sent();
                console.error('获取AI模型列表失败:', error_3);
                res.status(500).json({
                    success: false,
                    message: '获取模型列表失败',
                    error: error_3 instanceof Error ? error_3.message : '未知错误'
                });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports["default"] = router;
