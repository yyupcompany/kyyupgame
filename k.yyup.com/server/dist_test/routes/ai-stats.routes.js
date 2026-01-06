"use strict";
exports.__esModule = true;
var express_1 = require("express");
var ai_stats_controller_1 = require("../controllers/ai-stats.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/ai-stats/overview:
 *   get:
 *     summary: 获取AI中心概览统计
 *     description: 获取AI中心的概览统计数据
 *     tags:
 *       - AI统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/overview', auth_middleware_1.verifyToken, ai_stats_controller_1.aiStatsController.getOverviewStats);
/**
 * @swagger
 * /api/ai-stats/recent-tasks:
 *   get:
 *     summary: 获取最近的AI任务
 *     description: 获取最近执行的AI任务列表
 *     tags:
 *       - AI统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/recent-tasks', auth_middleware_1.verifyToken, ai_stats_controller_1.aiStatsController.getRecentTasks);
/**
 * @swagger
 * /api/ai-stats/models:
 *   get:
 *     summary: 获取AI模型列表
 *     description: 获取系统中可用的AI模型列表
 *     tags:
 *       - AI统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/models', auth_middleware_1.verifyToken, ai_stats_controller_1.aiStatsController.getAIModels);
/**
 * @swagger
 * /api/ai-stats/analysis-history:
 *   get:
 *     summary: 获取分析历史
 *     description: 获取AI分析的历史记录
 *     tags:
 *       - AI统计
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/analysis-history', auth_middleware_1.verifyToken, ai_stats_controller_1.aiStatsController.getAnalysisHistory);
exports["default"] = router;
