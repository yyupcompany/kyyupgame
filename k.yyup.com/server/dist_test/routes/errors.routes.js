"use strict";
/**
 * 错误收集路由
 * 用于处理前端错误报告
 */
exports.__esModule = true;
var express_1 = require("express");
var errors_controller_1 = require("../controllers/errors.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
/**
 * @swagger
 * /api/errors/critical:
 *   post:
 *     tags:
 *       - Errors
 *     summary: 报告关键错误
 *     description: 报告系统中的关键错误信息，用于错误监控和分析
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *               - stack
 *               - url
 *             properties:
 *               message:
 *                 type: string
 *                 description: 错误消息
 *                 example: "Uncaught TypeError: Cannot read property 'id' of undefined"
 *               stack:
 *                 type: string
 *                 description: 错误堆栈信息
 *                 example: "TypeError: Cannot read property 'id' of undefined\n    at Object.getUser (app.js:123:45)"
 *               url:
 *                 type: string
 *                 description: 发生错误的页面URL
 *                 example: "https://k.yyup.cc/dashboard"
 *               userAgent:
 *                 type: string
 *                 description: 用户代理信息
 *                 example: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
 *               userId:
 *                 type: integer
 *                 description: 用户ID（如果已登录）
 *                 example: 123
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: 错误发生时间
 *                 example: "2025-01-15T10:30:00Z"
 *               errorType:
 *                 type: string
 *                 description: 错误类型
 *                 enum: [javascript, network, syntax, runtime, security]
 *                 example: "runtime"
 *               severity:
 *                 type: string
 *                 description: 错误严重程度
 *                 enum: [low, medium, high, critical]
 *                 example: "critical"
 *     responses:
 *       200:
 *         description: 错误报告成功
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
 *                   example: "关键错误已记录"
 *                 errorId:
 *                   type: string
 *                   description: 错误记录ID
 *                   example: "error_1737891000123"
 *       400:
 *         description: 请求参数错误
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
router.post('/critical', errors_controller_1.ErrorsController.reportCriticalError);
/**
 * @swagger
 * /api/errors/report:
 *   post:
 *     tags:
 *       - Errors
 *     summary: 批量报告错误
 *     description: 批量提交多个错误报告，用于前端错误收集和分析
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - errors
 *             properties:
 *               errors:
 *                 type: array
 *                 description: 错误列表
 *                 minItems: 1
 *                 maxItems: 50
 *                 items:
 *                   type: object
 *                   required:
 *                     - message
 *                     - stack
 *                     - url
 *                   properties:
 *                     message:
 *                       type: string
 *                       description: 错误消息
 *                       example: "Network error: Failed to fetch"
 *                     stack:
 *                       type: string
 *                       description: 错误堆栈信息
 *                       example: "Error: Network error\n    at fetch (utils.js:45:12)"
 *                     url:
 *                       type: string
 *                       description: 发生错误的页面URL
 *                       example: "https://k.yyup.cc/students"
 *                     userAgent:
 *                       type: string
 *                       description: 用户代理信息
 *                       example: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
 *                     userId:
 *                       type: integer
 *                       description: 用户ID（如果已登录）
 *                       example: 456
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       description: 错误发生时间
 *                       example: "2025-01-15T10:45:00Z"
 *                     errorType:
 *                       type: string
 *                       description: 错误类型
 *                       enum: [javascript, network, syntax, runtime, security]
 *                       example: "network"
 *                     severity:
 *                       type: string
 *                       description: 错误严重程度
 *                       enum: [low, medium, high, critical]
 *                       example: "medium"
 *                     context:
 *                       type: object
 *                       description: 错误上下文信息
 *                       additionalProperties: true
 *                       example:
 *                         component: "StudentList"
 *                         action: "loadData"
 *               sessionId:
 *                 type: string
 *                 description: 会话ID，用于关联错误
 *                 example: "session_1737891000123"
 *               source:
 *                 type: string
 *                 description: 错误来源
 *                 enum: [frontend, mobile, extension]
 *                 example: "frontend"
 *     responses:
 *       200:
 *         description: 批量错误报告成功
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
 *                   example: "批量错误已记录"
 *                 processedCount:
 *                   type: integer
 *                   description: 成功处理的错误数量
 *                   example: 5
 *                 errorIds:
 *                   type: array
 *                   description: 生成的错误记录ID列表
 *                   items:
 *                     type: string
 *                   example: ["error_1737891000124", "error_1737891000125"]
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       413:
 *         description: 错误数量超过限制
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
router.post('/report', errors_controller_1.ErrorsController.reportErrorBatch);
/**
 * @swagger
 * /api/errors/statistics:
 *   get:
 *     tags:
 *       - Errors
 *     summary: 获取错误统计
 *     description: 获取系统错误统计信息，包括错误数量、类型分布、趋势分析等
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: 统计开始日期
 *         example: "2025-01-01"
 *       - in: query
 *         name: endDate
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *         description: 统计结束日期
 *         example: "2025-01-31"
 *       - in: query
 *         name: errorType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [javascript, network, syntax, runtime, security]
 *         description: 错误类型过滤
 *         example: "javascript"
 *       - in: query
 *         name: severity
 *         required: false
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: 错误严重程度过滤
 *         example: "critical"
 *       - in: query
 *         name: groupBy
 *         required: false
 *         schema:
 *           type: string
 *           enum: [day, week, month, type, severity, url]
 *         description: 分组统计方式
 *         example: "day"
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: 返回结果数量限制
 *         example: 50
 *     responses:
 *       200:
 *         description: 错误统计信息获取成功
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
 *                     summary:
 *                       type: object
 *                       description: 总体统计信息
 *                       properties:
 *                         totalErrors:
 *                           type: integer
 *                           description: 错误总数
 *                           example: 1250
 *                         criticalErrors:
 *                           type: integer
 *                           description: 关键错误数量
 *                           example: 25
 *                         recentErrors:
 *                           type: integer
 *                           description: 最近24小时错误数
 *                           example: 45
 *                         errorRate:
 *                           type: number
 *                           description: 错误率（百分比）
 *                           example: 2.5
 *                     typeDistribution:
 *                       type: array
 *                       description: 错误类型分布
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "javascript"
 *                           count:
 *                             type: integer
 *                             example: 580
 *                           percentage:
 *                             type: number
 *                             example: 46.4
 *                     severityDistribution:
 *                       type: array
 *                       description: 严重程度分布
 *                       items:
 *                         type: object
 *                         properties:
 *                           severity:
 *                             type: string
 *                             example: "high"
 *                           count:
 *                             type: integer
 *                             example: 125
 *                           percentage:
 *                             type: number
 *                             example: 10.0
 *                     trends:
 *                       type: array
 *                       description: 错误趋势数据
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                             example: "2025-01-15"
 *                           count:
 *                             type: integer
 *                             example: 42
 *                     topUrls:
 *                       type: array
 *                       description: 错误最多的页面
 *                       items:
 *                         type: object
 *                         properties:
 *                           url:
 *                             type: string
 *                             example: "https://k.yyup.cc/dashboard"
 *                           count:
 *                             type: integer
 *                             example: 88
 *                           lastOccurred:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-01-15T14:30:00Z"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 未认证
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 无权限访问
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
router.get('/statistics', auth_middleware_1.authMiddleware, errors_controller_1.ErrorsController.getErrorStatistics);
/**
 * @swagger
 * /api/errors/health:
 *   get:
 *     tags:
 *       - Errors
 *     summary: 健康检查
 *     description: 检查错误收集系统的健康状态，包括服务可用性和系统运行状况
 *     responses:
 *       200:
 *         description: 系统健康状态正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 status:
 *                   type: string
 *                   enum: [healthy, degraded, unhealthy]
 *                   example: "healthy"
 *                 message:
 *                   type: string
 *                   example: "错误收集系统运行正常"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: 检查时间
 *                   example: "2025-01-15T10:30:00Z"
 *                 uptime:
 *                   type: number
 *                   description: 系统运行时间（秒）
 *                   example: 86400
 *                 version:
 *                   type: string
 *                   description: 系统版本
 *                   example: "1.0.0"
 *                 checks:
 *                   type: object
 *                   description: 详细健康检查项
 *                   properties:
 *                     database:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [ok, error]
 *                           example: "ok"
 *                         responseTime:
 *                           type: number
 *                           description: 数据库响应时间（毫秒）
 *                           example: 25
 *                     storage:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [ok, error]
 *                           example: "ok"
 *                         freeSpace:
 *                           type: string
 *                           description: 可用存储空间
 *                           example: "85%"
 *                     memory:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [ok, warning, critical]
 *                           example: "ok"
 *                         usage:
 *                           type: string
 *                           description: 内存使用率
 *                           example: "68%"
 *                 metrics:
 *                   type: object
 *                   description: 系统指标
 *                   properties:
 *                     errorsProcessedToday:
 *                       type: integer
 *                       description: 今日处理的错误数量
 *                       example: 145
 *                     averageResponseTime:
 *                       type: number
 *                       description: 平均响应时间（毫秒）
 *                       example: 120
 *                     successRate:
 *                       type: number
 *                       description: 成功率（百分比）
 *                       example: 99.8
 *       503:
 *         description: 服务不可用
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 message:
 *                   type: string
 *                   example: "错误收集系统异常"
 *                 errors:
 *                   type: array
 *                   description: 检测到的错误列表
 *                   items:
 *                     type: string
 *                   example: ["数据库连接失败", "存储空间不足"]
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/health', errors_controller_1.ErrorsController.healthCheck);
exports["default"] = router;
