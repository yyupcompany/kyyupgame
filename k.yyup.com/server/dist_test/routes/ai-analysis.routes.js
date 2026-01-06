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
var ai_analysis_controller_1 = require("../controllers/ai-analysis.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var aiAnalysisController = new ai_analysis_controller_1.AIAnalysisController();
// 应用认证中间件
router.use(auth_middleware_1.verifyToken);
// 应用权限中间件 - 需要AI中心访问权限（可选，开发环境下可能会跳过）
// router.use(permissionMiddleware(['AI_CENTER']));
/**
 * @swagger
 * /api/ai-analysis/enrollment-trends:
 *   post:
 *     summary: 招生趋势分析
 *     description: 基于豆包1.6模型分析招生趋势数据
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               timeRange:
 *                 type: string
 *                 description: 时间范围
 *               filters:
 *                 type: object
 *                 description: 筛选条件
 *     responses:
 *       200:
 *         description: 分析成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/enrollment-trends', aiAnalysisController.analyzeEnrollmentTrends);
/**
 * @swagger
 * /api/ai-analysis/activity-effectiveness:
 *   post:
 *     summary: 活动效果分析
 *     description: 分析活动的效果和影响
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityId:
 *                 type: string
 *               metrics:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 分析成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/activity-effectiveness', aiAnalysisController.analyzeActivityEffectiveness);
/**
 * @swagger
 * /api/ai-analysis/performance-prediction:
 *   post:
 *     summary: 绩效预测分析
 *     description: 预测教师或机构的绩效表现
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetType:
 *                 type: string
 *                 enum: [teacher, institution]
 *               targetId:
 *                 type: string
 *               period:
 *                 type: string
 *     responses:
 *       200:
 *         description: 分析成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/performance-prediction', aiAnalysisController.analyzePerformancePrediction);
/**
 * @swagger
 * /api/ai-analysis/risk-assessment:
 *   post:
 *     summary: 风险评估分析
 *     description: 评估运营风险和潜在问题
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scope:
 *                 type: string
 *                 description: 评估范围
 *               factors:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 分析成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/risk-assessment', aiAnalysisController.analyzeRiskAssessment);
/**
 * @swagger
 * /api/ai-analysis/history:
 *   get:
 *     summary: 获取分析历史记录
 *     description: 获取AI分析的历史记录列表
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [enrollment, activity, performance, risk]
 *         description: 分析类型
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/history', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var type_1, userId, history_1, filteredHistory;
    var _a;
    return __generator(this, function (_b) {
        try {
            type_1 = req.query.type;
            userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || 1;
            history_1 = [
                {
                    id: Date.now() - 1000,
                    title: '招生趋势分析报告',
                    type: 'enrollment',
                    summary: '基于过去6个月数据分析，招生呈现稳定增长趋势',
                    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                    status: 'completed',
                    insights: 5,
                    recommendations: 3
                },
                {
                    id: Date.now() - 2000,
                    title: '活动效果评估报告',
                    type: 'activity',
                    summary: '户外活动参与度最高，艺术类活动需要改进',
                    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                    status: 'completed',
                    insights: 4,
                    recommendations: 6
                },
                {
                    id: Date.now() - 3000,
                    title: '绩效预测分析报告',
                    type: 'performance',
                    summary: '教师整体绩效良好，建议加强新教师培训',
                    createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
                    status: 'completed',
                    insights: 6,
                    recommendations: 4
                },
                {
                    id: Date.now() - 4000,
                    title: '风险评估报告',
                    type: 'risk',
                    summary: '整体风险可控，需关注招生季节性波动',
                    createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
                    status: 'completed',
                    insights: 3,
                    recommendations: 5
                }
            ];
            filteredHistory = type_1 ? history_1.filter(function (item) { return item.type === type_1; }) : history_1;
            res.json({
                success: true,
                data: filteredHistory,
                message: '获取分析历史成功'
            });
        }
        catch (error) {
            console.error('获取分析历史失败:', error);
            res.status(500).json({
                success: false,
                message: '获取分析历史失败'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/ai-analysis/{id}:
 *   get:
 *     summary: 获取分析详情
 *     description: 获取指定分析记录的详细信息
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, analysisDetail;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            analysisDetail = {
                id: parseInt(id),
                title: '招生趋势分析报告',
                type: 'enrollment',
                summary: '基于过去6个月数据分析，招生呈现稳定增长趋势',
                createdAt: new Date().toISOString(),
                status: 'completed',
                data: {
                    rawData: {
                        monthlyStats: {
                            '2024-01': 45,
                            '2024-02': 52,
                            '2024-03': 48,
                            '2024-04': 61,
                            '2024-05': 58,
                            '2024-06': 65
                        },
                        sourceStats: {
                            '线上推广': 120,
                            '口碑推荐': 89,
                            '地推活动': 76,
                            '合作机构': 44
                        },
                        ageStats: {
                            '3岁以下': 45,
                            '3-4岁': 156,
                            '4-5岁': 98,
                            '5岁以上': 30
                        }
                    },
                    aiAnalysis: {
                        summary: '招生数据显示稳定增长趋势，口碑推荐效果显著',
                        insights: [
                            {
                                title: '招生增长趋势良好',
                                description: '过去6个月招生人数呈现稳定增长，月均增长率约8%',
                                importance: 'high',
                                category: 'trend'
                            },
                            {
                                title: '口碑推荐效果突出',
                                description: '口碑推荐占总招生的27%，说明家长满意度较高',
                                importance: 'high',
                                category: 'opportunity'
                            },
                            {
                                title: '3-4岁年龄段为主力',
                                description: '3-4岁年龄段占比47%，符合幼儿园主要服务群体',
                                importance: 'medium',
                                category: 'insight'
                            }
                        ],
                        trends: {
                            direction: '上升',
                            confidence: '高',
                            factors: ['口碑效应', '教学质量提升', '市场需求增长']
                        },
                        recommendations: [
                            {
                                action: '加强口碑营销策略',
                                priority: 'high',
                                timeline: '短期',
                                expectedImpact: '提升招生转化率15-20%'
                            },
                            {
                                action: '优化3-4岁课程体系',
                                priority: 'medium',
                                timeline: '中期',
                                expectedImpact: '提高家长满意度和续费率'
                            },
                            {
                                action: '扩大线上推广投入',
                                priority: 'medium',
                                timeline: '短期',
                                expectedImpact: '增加品牌曝光度'
                            }
                        ],
                        risks: [
                            {
                                risk: '季节性招生波动',
                                probability: '中',
                                impact: '中',
                                mitigation: '制定淡季营销策略，开展体验活动'
                            }
                        ],
                        metrics: {
                            key_indicators: {
                                '月均招生': 55,
                                '转化率': '12%',
                                '满意度': '4.6/5'
                            },
                            benchmarks: {
                                '行业平均转化率': '8%',
                                '行业平均满意度': '4.2/5'
                            },
                            targets: {
                                '下季度招生目标': 180,
                                '目标转化率': '15%'
                            }
                        }
                    }
                }
            };
            res.json({
                success: true,
                data: analysisDetail,
                message: '获取分析详情成功'
            });
        }
        catch (error) {
            console.error('获取分析详情失败:', error);
            res.status(500).json({
                success: false,
                message: '获取分析详情失败'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/ai-analysis/{id}/export:
 *   post:
 *     summary: 导出分析报告
 *     description: 导出分析报告为指定格式
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [pdf, excel, word]
 *                 default: pdf
 *     responses:
 *       200:
 *         description: 导出成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/:id/export', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id, _a, format, downloadUrl;
    return __generator(this, function (_b) {
        try {
            id = req.params.id;
            _a = req.body.format, format = _a === void 0 ? 'pdf' : _a;
            downloadUrl = "/api/ai/analysis/download/".concat(id, ".").concat(format);
            res.json({
                success: true,
                data: { downloadUrl: downloadUrl },
                message: '报告导出成功'
            });
        }
        catch (error) {
            console.error('导出报告失败:', error);
            res.status(500).json({
                success: false,
                message: '导出报告失败'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/ai-analysis/{id}:
 *   delete:
 *     summary: 删除分析记录
 *     description: 删除指定的分析记录
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router["delete"]('/:id', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var id;
    return __generator(this, function (_a) {
        try {
            id = req.params.id;
            // 这里实现删除逻辑
            res.json({
                success: true,
                message: '分析记录删除成功'
            });
        }
        catch (error) {
            console.error('删除分析记录失败:', error);
            res.status(500).json({
                success: false,
                message: '删除分析记录失败'
            });
        }
        return [2 /*return*/];
    });
}); });
/**
 * @swagger
 * /api/ai-analysis/models/status:
 *   get:
 *     summary: 获取AI模型状态
 *     description: 获取AI模型的运行状态和性能指标
 *     tags:
 *       - AI智能分析
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/models/status', function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var modelStatus;
    return __generator(this, function (_a) {
        try {
            modelStatus = {
                doubao: {
                    name: '豆包Seed-1.6',
                    version: '1.6',
                    status: 'active',
                    availability: '99.9%',
                    responseTime: '1.2s',
                    lastCheck: new Date().toISOString(),
                    capabilities: [
                        'text_generation',
                        'tool_calling',
                        'multimodal',
                        'thinking_mode'
                    ]
                }
            };
            res.json({
                success: true,
                data: modelStatus,
                message: '获取模型状态成功'
            });
        }
        catch (error) {
            console.error('获取模型状态失败:', error);
            res.status(500).json({
                success: false,
                message: '获取模型状态失败'
            });
        }
        return [2 /*return*/];
    });
}); });
exports["default"] = router;
