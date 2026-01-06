"use strict";
/**
 * AI招生功能路由配置
 *
 * 路由结构:
 * - /api/enrollment-plan/:id/smart-planning    智能规划
 * - /api/enrollment-plan/:id/forecast          招生预测
 * - /api/enrollment-plan/:id/strategy          招生策略
 * - /api/enrollment-plan/:id/optimization      容量优化
 * - /api/enrollment-plan/:id/simulation        招生仿真
 * - /api/enrollment-plan/:id/evaluation        计划评估
 * - /api/enrollment/trends                     趋势分析
 */
exports.__esModule = true;
var express_1 = require("express");
var enrollment_ai_controller_1 = require("../controllers/enrollment-ai.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var enrollmentAIController = new enrollment_ai_controller_1.EnrollmentAIController();
/**
 * @swagger
 * /api/enrollment-ai/ai-status:
 *   get:
 *     tags:
 *       - Enrollment AI
 *     summary: 检查AI服务状态
 *     description: 检查招生AI服务的运行状态和可用性
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: AI服务状态信息
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
 *                     status:
 *                       type: string
 *                       example: "running"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     modelStatus:
 *                       type: object
 *                       properties:
 *                         available:
 *                           type: boolean
 *                           example: true
 *                         models:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["gpt-3.5-turbo", "gpt-4"]
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// AI服务状态检查 (无需特殊权限)
router.get('/ai-status', auth_middleware_1.verifyToken, enrollmentAIController.checkAIStatus.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/trends:
 *   get:
 *     tags:
 *       - Enrollment AI
 *     summary: 生成招生趋势分析
 *     description: 生成全局招生趋势分析报告，包括历史数据分析和未来趋势预测
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: timeRange
 *         in: query
 *         description: 时间范围
 *         schema:
 *           type: string
 *           enum: [month, quarter, year, all]
 *           default: year
 *       - name: region
 *         in: query
 *         description: 地区筛选
 *         schema:
 *           type: string
 *       - name: includeCompetitors
 *         in: query
 *         description: 是否包含竞对分析
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: 趋势分析报告
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
 *                     trendData:
 *                       type: object
 *                       properties:
 *                         enrollmentTrend:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               period:
 *                                 type: string
 *                               enrollment:
 *                                 type: number
 *                               growth:
 *                                 type: number
 *                         prediction:
 *                           type: object
 *                           properties:
 *                             next6Months:
 *                               type: number
 *                             next12Months:
 *                               type: number
 *                             confidence:
 *                               type: number
 *                               example: 0.85
 *                     insights:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           impact:
 *                             type: string
 *                             enum: [high, medium, low]
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 全局趋势分析
router.get('/trends', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.generateTrendAnalysis.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/smart-planning:
 *   post:
 *     tags:
 *       - Enrollment AI
 *     summary: 生成智能招生规划
 *     description: 为指定招生计划生成AI智能规划建议，包括招生策略、时间安排和资源配置
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               preferences:
 *                 type: object
 *                 properties:
 *                   targetEnrollment:
 *                     type: number
 *                     description: 目标招生人数
 *                     example: 100
 *                   priority:
 *                     type: string
 *                     enum: [quality, quantity, balance]
 *                     description: 招生优先级
 *                     example: "balance"
 *                   budget:
 *                     type: number
 *                     description: 预算限制
 *                     example: 50000
 *               constraints:
 *                 type: object
 *                 properties:
 *                   timeLimit:
 *                     type: string
 *                     description: 时间限制
 *                     example: "2024-06-30"
 *                   resources:
 *                     type: array
 *                     items:
 *                       type: string
 *                     description: 可用资源
 *                     example: ["social_media", "open_day", "referral"]
 *     responses:
 *       200:
 *         description: 智能规划结果
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
 *                     planningId:
 *                       type: string
 *                       example: "planning_123456"
 *                     strategy:
 *                       type: object
 *                       properties:
 *                         overview:
 *                           type: string
 *                         phases:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               duration:
 *                                 type: string
 *                               activities:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               budget:
 *                                 type: number
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           milestone:
 *                             type: string
 *                           description:
 *                             type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           priority:
 *                             type: string
 *                           description:
 *                             type: string
 *                           expectedImpact:
 *                             type: string
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// 针对特定招生计划的AI功能
router.post('/plan/:id/smart-planning', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.generateSmartPlanning.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/forecast:
 *   post:
 *     tags:
 *       - Enrollment AI
 *     summary: 生成招生预测
 *     description: 为指定招生计划生成AI预测分析，包括招生数量预测和成功率分析
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               forecastPeriod:
 *                 type: string
 *                 enum: [monthly, quarterly, yearly]
 *                 description: 预测周期
 *                 example: "quarterly"
 *               includeScenarios:
 *                 type: boolean
 *                 description: 是否包含多情景分析
 *                 default: true
 *               factors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 影响因素
 *                 example: ["competition", "seasonality", "marketing"]
 *     responses:
 *       200:
 *         description: 预测分析结果
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
 *                     forecastId:
 *                       type: string
 *                       example: "forecast_123456"
 *                     predictions:
 *                       type: object
 *                       properties:
 *                         enrollment:
 *                           type: object
 *                           properties:
 *                             optimistic:
 *                               type: number
 *                               example: 120
 *                             realistic:
 *                               type: number
 *                               example: 100
 *                             pessimistic:
 *                               type: number
 *                               example: 80
 *                         timeline:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               period:
 *                                 type: string
 *                               projected:
 *                                 type: number
 *                               confidence:
 *                                 type: number
 *                     riskFactors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           factor:
 *                             type: string
 *                           impact:
 *                             type: string
 *                             enum: [high, medium, low]
 *                           probability:
 *                             type: number
 *                           mitigation:
 *                             type: string
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/plan/:id/forecast', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.generateForecast.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/strategy:
 *   post:
 *     tags:
 *       - Enrollment AI
 *     summary: 生成招生策略
 *     description: 为指定招生计划生成AI招生策略建议，包括渠道选择和营销策略
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               targetSegment:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 目标群体
 *                 example: ["young_parents", "working_families"]
 *               budget:
 *                 type: number
 *                 description: 营销预算
 *                 example: 30000
 *               channels:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 可用渠道
 *                 example: ["social_media", "word_of_mouth", "events"]
 *               goals:
 *                 type: object
 *                 properties:
 *                   primary:
 *                     type: string
 *                     example: "increase_enrollment"
 *                   secondary:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["brand_awareness", "lead_generation"]
 *     responses:
 *       200:
 *         description: 策略建议结果
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
 *                     strategyId:
 *                       type: string
 *                       example: "strategy_123456"
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           channel:
 *                             type: string
 *                           strategy:
 *                             type: string
 *                           budget:
 *                             type: number
 *                           expectedROI:
 *                             type: number
 *                           timeline:
 *                             type: string
 *                           kpis:
 *                             type: array
 *                             items:
 *                               type: string
 *                     implementation:
 *                       type: object
 *                       properties:
 *                         phases:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               duration:
 *                                 type: string
 *                               activities:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               budget:
 *                                 type: number
 *                         milestones:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                               date:
 *                                 type: string
 *                               metric:
 *                                 type: string
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/plan/:id/strategy', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.generateStrategy.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/optimization:
 *   post:
 *     tags:
 *       - Enrollment AI
 *     summary: 生成容量优化建议
 *     description: 为指定招生计划生成AI容量优化建议，包括资源配置和效率提升
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentCapacity:
 *                 type: number
 *                 description: 当前容量
 *                 example: 80
 *               targetCapacity:
 *                 type: number
 *                 description: 目标容量
 *                 example: 120
 *               constraints:
 *                 type: object
 *                 properties:
 *                   budget:
 *                     type: number
 *                     example: 50000
 *                   timeframe:
 *                     type: string
 *                     example: "6months"
 *                   resources:
 *                     type: array
 *                     items:
 *                       type: string
 *                     example: ["staff", "facilities", "equipment"]
 *               optimization_goals:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 优化目标
 *                 example: ["cost_efficiency", "quality_improvement", "capacity_increase"]
 *     responses:
 *       200:
 *         description: 优化建议结果
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
 *                     optimizationId:
 *                       type: string
 *                       example: "optimization_123456"
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           area:
 *                             type: string
 *                             example: "staffing"
 *                           current:
 *                             type: string
 *                           recommended:
 *                             type: string
 *                           impact:
 *                             type: string
 *                           cost:
 *                             type: number
 *                           implementation:
 *                             type: string
 *                     projections:
 *                       type: object
 *                       properties:
 *                         capacityIncrease:
 *                           type: number
 *                           example: 50
 *                         costSavings:
 *                           type: number
 *                           example: 15000
 *                         timeToImplement:
 *                           type: string
 *                           example: "3-4 months"
 *                         roi:
 *                           type: number
 *                           example: 2.5
 *                     implementation_plan:
 *                       type: object
 *                       properties:
 *                         phases:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               phase:
 *                                 type: string
 *                               duration:
 *                                 type: string
 *                               actions:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               budget:
 *                                 type: number
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/plan/:id/optimization', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.generateOptimization.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/simulation:
 *   post:
 *     tags:
 *       - Enrollment AI
 *     summary: 生成招生仿真
 *     description: 为指定招生计划生成AI仿真分析，模拟不同情景下的招生结果
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               scenarios:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "base_scenario"
 *                     parameters:
 *                       type: object
 *                       properties:
 *                         budget:
 *                           type: number
 *                         marketing_intensity:
 *                           type: string
 *                           enum: [low, medium, high]
 *                         competition_level:
 *                           type: string
 *                           enum: [low, medium, high]
 *                         seasonal_factor:
 *                           type: number
 *                 description: 仿真场景
 *               iterations:
 *                 type: number
 *                 description: 仿真迭代次数
 *                 example: 1000
 *                 minimum: 100
 *                 maximum: 10000
 *               time_horizon:
 *                 type: string
 *                 description: 仿真时间范围
 *                 example: "12months"
 *                 enum: ["3months", "6months", "12months", "24months"]
 *               confidence_level:
 *                 type: number
 *                 description: 置信水平
 *                 example: 0.95
 *                 minimum: 0.8
 *                 maximum: 0.99
 *     responses:
 *       200:
 *         description: 仿真分析结果
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
 *                     simulationId:
 *                       type: string
 *                       example: "simulation_123456"
 *                     results:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           scenario:
 *                             type: string
 *                           statistics:
 *                             type: object
 *                             properties:
 *                               mean:
 *                                 type: number
 *                               median:
 *                                 type: number
 *                               std_dev:
 *                                 type: number
 *                               min:
 *                                 type: number
 *                               max:
 *                                 type: number
 *                               confidence_interval:
 *                                 type: object
 *                                 properties:
 *                                   lower:
 *                                     type: number
 *                                   upper:
 *                                     type: number
 *                           probability_distributions:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 range:
 *                                   type: string
 *                                 probability:
 *                                   type: number
 *                     comparative_analysis:
 *                       type: object
 *                       properties:
 *                         best_scenario:
 *                           type: string
 *                         worst_scenario:
 *                           type: string
 *                         recommended_scenario:
 *                           type: string
 *                         risk_assessment:
 *                           type: object
 *                           properties:
 *                             high_risk_probability:
 *                               type: number
 *                             medium_risk_probability:
 *                               type: number
 *                             low_risk_probability:
 *                               type: number
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/plan/:id/simulation', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.generateSimulation.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/evaluation:
 *   post:
 *     tags:
 *       - Enrollment AI
 *     summary: 生成计划评估
 *     description: 为指定招生计划生成AI评估分析，评估计划效果和改进建议
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               evaluation_criteria:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 评估标准
 *                 example: ["enrollment_rate", "cost_effectiveness", "lead_quality", "conversion_rate"]
 *               comparison_baseline:
 *                 type: string
 *                 description: 对比基准
 *                 enum: ["previous_year", "industry_average", "target_goals", "competitor_benchmark"]
 *                 example: "previous_year"
 *               include_recommendations:
 *                 type: boolean
 *                 description: 是否包含改进建议
 *                 default: true
 *               detailed_analysis:
 *                 type: boolean
 *                 description: 是否生成详细分析
 *                 default: false
 *     responses:
 *       200:
 *         description: 评估分析结果
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
 *                     evaluationId:
 *                       type: string
 *                       example: "evaluation_123456"
 *                     overall_score:
 *                       type: number
 *                       description: 总体评分
 *                       example: 8.5
 *                       minimum: 0
 *                       maximum: 10
 *                     performance_metrics:
 *                       type: object
 *                       properties:
 *                         enrollment_rate:
 *                           type: object
 *                           properties:
 *                             current:
 *                               type: number
 *                             target:
 *                               type: number
 *                             achievement:
 *                               type: number
 *                             grade:
 *                               type: string
 *                               enum: [A+, A, B+, B, C+, C, D, F]
 *                         cost_per_enrollment:
 *                           type: object
 *                           properties:
 *                             current:
 *                               type: number
 *                             benchmark:
 *                               type: number
 *                             efficiency:
 *                               type: string
 *                         lead_quality:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: number
 *                             conversion_rate:
 *                               type: number
 *                             satisfaction:
 *                               type: number
 *                     strengths:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           area:
 *                             type: string
 *                           description:
 *                             type: string
 *                           impact:
 *                             type: string
 *                             enum: [high, medium, low]
 *                     weaknesses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           area:
 *                             type: string
 *                           description:
 *                             type: string
 *                           severity:
 *                             type: string
 *                             enum: [critical, high, medium, low]
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           priority:
 *                             type: string
 *                             enum: [high, medium, low]
 *                           category:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           expected_impact:
 *                             type: string
 *                           implementation_effort:
 *                             type: string
 *                             enum: [low, medium, high]
 *                           timeframe:
 *                             type: string
 *                     improvement_roadmap:
 *                       type: object
 *                       properties:
 *                         short_term:
 *                           type: array
 *                           items:
 *                             type: string
 *                         medium_term:
 *                           type: array
 *                           items:
 *                             type: string
 *                         long_term:
 *                           type: array
 *                           items:
 *                             type: string
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/plan/:id/evaluation', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.generateEvaluation.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/ai-history:
 *   get:
 *     tags:
 *       - Enrollment AI
 *     summary: 获取AI分析历史
 *     description: 获取指定招生计划的AI分析历史记录
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: type
 *         in: query
 *         description: 分析类型筛选
 *         schema:
 *           type: string
 *           enum: [planning, forecast, strategy, optimization, simulation, evaluation]
 *       - name: limit
 *         in: query
 *         description: 返回记录数量限制
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *       - name: offset
 *         in: query
 *         description: 记录偏移量
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *       - name: startDate
 *         in: query
 *         description: 开始日期
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: 结束日期
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: AI分析历史记录
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
 *                     total:
 *                       type: integer
 *                       description: 总记录数
 *                       example: 25
 *                     records:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "analysis_123456"
 *                           type:
 *                             type: string
 *                             enum: [planning, forecast, strategy, optimization, simulation, evaluation]
 *                             example: "forecast"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                             example: "2024-01-15T10:30:00Z"
 *                           status:
 *                             type: string
 *                             enum: [completed, processing, failed]
 *                             example: "completed"
 *                           parameters:
 *                             type: object
 *                             description: 分析参数
 *                           results_summary:
 *                             type: object
 *                             properties:
 *                               key_insights:
 *                                 type: array
 *                                 items:
 *                                   type: string
 *                               performance_score:
 *                                 type: number
 *                               recommendations_count:
 *                                 type: integer
 *                           metadata:
 *                             type: object
 *                             properties:
 *                               processing_time:
 *                                 type: number
 *                                 description: 处理时间(秒)
 *                               model_version:
 *                                 type: string
 *                               confidence_score:
 *                                 type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         current_page:
 *                           type: integer
 *                         total_pages:
 *                           type: integer
 *                         has_next:
 *                           type: boolean
 *                         has_previous:
 *                           type: boolean
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// AI分析历史和批量操作
router.get('/plan/:id/ai-history', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.getAIAnalysisHistory.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/batch-analysis:
 *   post:
 *     tags:
 *       - Enrollment AI
 *     summary: 批量AI分析
 *     description: 为指定招生计划执行批量AI分析，一次性生成多种类型的分析报告
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               analysis_types:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [planning, forecast, strategy, optimization, simulation, evaluation]
 *                 description: 要执行的分析类型
 *                 example: ["forecast", "strategy", "evaluation"]
 *               parameters:
 *                 type: object
 *                 description: 分析参数配置
 *                 properties:
 *                   global:
 *                     type: object
 *                     properties:
 *                       priority:
 *                         type: string
 *                         enum: [speed, accuracy, comprehensive]
 *                         default: accuracy
 *                       async_mode:
 *                         type: boolean
 *                         default: true
 *                   specific:
 *                     type: object
 *                     description: 特定分析类型的参数
 *                     additionalProperties: true
 *               notification:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: boolean
 *                     description: 完成后发送邮件通知
 *                     default: false
 *                   webhook:
 *                     type: string
 *                     description: 回调webhook URL
 *     responses:
 *       200:
 *         description: 批量分析任务创建成功
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
 *                     batch_id:
 *                       type: string
 *                       example: "batch_123456"
 *                     status:
 *                       type: string
 *                       enum: [queued, processing, completed, failed]
 *                       example: "queued"
 *                     tasks:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           task_id:
 *                             type: string
 *                           analysis_type:
 *                             type: string
 *                           status:
 *                             type: string
 *                             enum: [pending, processing, completed, failed]
 *                           estimated_completion:
 *                             type: string
 *                             format: date-time
 *                     estimated_total_time:
 *                       type: number
 *                       description: 预计总完成时间(分钟)
 *                       example: 15
 *                     progress_url:
 *                       type: string
 *                       description: 进度查询URL
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/plan/:id/batch-analysis', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.batchAnalysis.bind(enrollmentAIController));
/**
 * @swagger
 * /api/enrollment-ai/plan/{id}/export-ai-report:
 *   get:
 *     tags:
 *       - Enrollment AI
 *     summary: 导出AI分析报告
 *     description: 导出指定招生计划的AI分析报告，支持多种格式
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: 招生计划ID
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: format
 *         in: query
 *         description: 导出格式
 *         schema:
 *           type: string
 *           enum: [pdf, excel, word, json]
 *           default: pdf
 *       - name: include_types
 *         in: query
 *         description: 包含的分析类型
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *             enum: [planning, forecast, strategy, optimization, simulation, evaluation]
 *         style: form
 *         explode: false
 *       - name: date_range
 *         in: query
 *         description: 日期范围
 *         schema:
 *           type: string
 *           enum: [last_week, last_month, last_quarter, last_year, all_time]
 *           default: last_month
 *       - name: include_charts
 *         in: query
 *         description: 是否包含图表
 *         schema:
 *           type: boolean
 *           default: true
 *       - name: template
 *         in: query
 *         description: 报告模板
 *         schema:
 *           type: string
 *           enum: [executive_summary, detailed_analysis, technical_report, presentation]
 *           default: detailed_analysis
 *       - name: language
 *         in: query
 *         description: 报告语言
 *         schema:
 *           type: string
 *           enum: [zh-CN, en-US]
 *           default: zh-CN
 *     responses:
 *       200:
 *         description: 报告导出成功
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *           application/vnd.openxmlformats-officedocument.wordprocessingml.document:
 *             schema:
 *               type: string
 *               format: binary
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
 *                     report_id:
 *                       type: string
 *                       example: "report_123456"
 *                     title:
 *                       type: string
 *                       example: "招生计划AI分析报告"
 *                     generated_at:
 *                       type: string
 *                       format: date-time
 *                     summary:
 *                       type: object
 *                       properties:
 *                         total_analyses:
 *                           type: integer
 *                         date_range:
 *                           type: string
 *                         key_insights:
 *                           type: array
 *                           items:
 *                             type: string
 *                     sections:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                           title:
 *                             type: string
 *                           content:
 *                             type: object
 *                           charts:
 *                             type: array
 *                             items:
 *                               type: object
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 招生计划不存在或无可用数据
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/plan/:id/export-ai-report', auth_middleware_1.verifyToken, (0, auth_middleware_1.checkPermission)('ENROLLMENT_PLAN_MANAGE'), enrollmentAIController.exportAIReport.bind(enrollmentAIController));
exports["default"] = router;
