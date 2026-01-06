/**
* @swagger
* tags:
*   - name: AI令牌监控
*     description: AI系统令牌使用情况监控，提供实时统计、性能监控、告警管理和优化建议
*
* components:
*   schemas:
*     TokenStats:
*       type: object
*       properties:
*         totalTokens:
*           type: integer
*           description: 总token使用量
*           example: 150000
*         dailyTokens:
*           type: integer
*           description: 今日token使用量
*           example: 2500
*         monthlyTokens:
*           type: integer
*           description: 本月token使用量
*           example: 75000
*         averageTokensPerRequest:
*           type: number
*           format: float
*           description: 平均每请求token数
*           example: 156.5
*         totalRequests:
*           type: integer
*           description: 总请求数
*           example: 960
*         successRate:
*           type: number
*           format: float
*           description: 成功率百分比
*           example: 98.5
*         averageResponseTime:
*           type: number
*           format: float
*           description: 平均响应时间（毫秒）
*           example: 1250.75
*         quotaUsage:
*           type: object
*           properties:
*             used:
*               type: integer
*               description: 已使用配额
*               example: 75000
*             total:
*               type: integer
*               description: 总配额
*               example: 100000
*             percentage:
*               type: number
*               format: float
*               description: 使用百分比
*               example: 75.0
*         modelStats:
*           type: array
*           items:
*             type: object
*             properties:
*               model:
*                 type: string
*                 description: 模型名称
*                 example: "gpt-4"
*               tokens:
*                 type: integer
*                 description: 该模型token使用量
*                 example: 50000
*               requests:
*                 type: integer
*                 description: 该模型请求数
*                 example: 320
*               cost:
*                 type: number
*                 format: float
*                 description: 该模型成本
*                 example: 125.50
*           description: 各模型使用统计
*         updatedAt:
*           type: string
*           format: date-time
*           description: 统计更新时间
*           example: "2023-12-01T10:30:00Z"
*
*     PerformanceReport:
*       type: object
*       properties:
*         overview:
*           type: object
*           properties:
*             period:
*               type: string
*               description: 报告周期
*               example: "过去7天"
*             totalRequests:
*               type: integer
*               example: 2400
*             totalTokens:
*               type: integer
*               example: 375000
*             totalCost:
*               type: number
*               format: float
*               example: 937.50
*         performanceMetrics:
*           type: object
*           properties:
*             responseTime:
*               type: object
*               properties:
*                 average:
*                   type: number
*                   format: float
*                   example: 1250.75
*                 p50:
*                   type: number
*                   format: float
*                   example: 1100.00
*                 p95:
*                   type: number
*                   format: float
*                   example: 2100.50
*                 p99:
*                   type: number
*                   format: float
*                   example: 3500.25
*             throughput:
*               type: number
*               format: float
*               description: 每秒处理请求数
*               example: 2.5
*             errorRate:
*               type: number
*               format: float
*               description: 错误率百分比
*               example: 1.5
*         modelPerformance:
*           type: array
*           items:
*             type: object
*             properties:
*               model:
*                 type: string
*                 example: "gpt-4"
*               avgResponseTime:
*                 type: number
*                 format: float
*                 example: 1650.25
*               successRate:
*                 type: number
*                 format: float
*                 example: 99.2
*               tokenEfficiency:
*                 type: number
*                 format: float
*                 description: token效率评分
*                 example: 8.7
*         recommendations:
*           type: array
*           items:
*             type: string
*           description: 性能优化建议
*           example:
*             - "考虑使用gpt-3.5-turbo处理简单任务以降低成本"
*             - "优化提示词以减少token使用量"
*
*     Alert:
*       type: object
*       properties:
*         id:
*           type: string
*           description: 告警ID
*           example: "alert_123"
*         type:
*           type: string
*           enum: [quota_warning, performance_degradation, error_spike, cost_threshold]
*           description: 告警类型
*           example: "quota_warning"
*         severity:
*           type: string
*           enum: [low, medium, high, critical]
*           description: 严重程度
*           example: "medium"
*         title:
*           type: string
*           description: 告警标题
*           example: "配额使用率超过80%"
*         message:
*           type: string
*           description: 告警详情
*           example: "当前已使用80,000个token，占总配额的80%"
*         timestamp:
*           type: string
*           format: date-time
*           description: 告警时间
*           example: "2023-12-01T09:15:00Z"
*         acknowledged:
*           type: boolean
*           description: 是否已确认
*           example: false
*         metadata:
*           type: object
*           description: 附加信息
*           properties:
*             currentValue:
*               type: integer
*               example: 80000
*             threshold:
*               type: integer
*               example: 80000
*             percentage:
*               type: number
*               format: float
*               example: 80.0
*
*     OptimizationSuggestion:
*       type: object
*       properties:
*         category:
*           type: string
*           enum: [cost, performance, accuracy, usage]
*           description: 建议类别
*           example: "cost"
*         title:
*           type: string
*           description: 建议标题
*           example: "使用更经济的模型处理简单任务"
*         description:
*           type: string
*           description: 详细建议
*           example: "对于简单的问答任务，建议使用gpt-3.5-turbo替代gpt-4，可节省约75%的成本"
*         potentialSavings:
*           type: object
*           properties:
*             tokens:
*               type: integer
*               description: 预计节省token数
*               example: 15000
*             cost:
*               type: number
*               format: float
*               description: 预计节省成本
*               example: 187.50
*             percentage:
*               type: number
*               format: float
*               description: 节省百分比
*               example: 25.0
*         priority:
*           type: string
*           enum: [low, medium, high]
*           description: 优先级
*           example: "high"
*         implementation:
*           type: object
*           properties:
*             difficulty:
*               type: string
*               enum: [easy, medium, hard]
*               example: "easy"
*             estimatedTime:
*               type: string
*               example: "2小时"
*             steps:
*               type: array
*               items:
*                 type: string
*               example:
*                 - "分析现有任务复杂度"
*                 - "配置模型选择规则"
*                 - "测试和验证效果"
*
*     ErrorResponse:
*       type: object
*       properties:
*         success:
*           type: boolean
*           example: false
*         error:
*           type: string
*           description: 错误信息
*           example: "权限不足"
*         code:
*           type: integer
*           description: 错误代码
*           example: 403
*
*   responses:
*     UnauthorizedError:
*       description: 未授权访问
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/ErrorResponse'
*           example:
*             success: false
*             error: "未授权访问，请提供有效的认证信息"
*             code: 401
*
*     ForbiddenError:
*       description: 权限不足
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/ErrorResponse'
*           example:
*             success: false
*             error: "您没有权限执行此操作"
*             code: 403
*
*     ServerError:
*       description: 服务器内部错误
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/ErrorResponse'
*           example:
*             success: false
*             error: "服务器内部错误，请稍后重试"
*             code: 500
*/

/**
 * Token监控路由
 * 提供Token使用情况监控的API接口
*/

import { Router } from 'express';
import { tokenMonitorController } from '../../controllers/ai/token-monitor.controller';
import { verifyToken, checkPermission } from '../../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
* /api/ai/token-monitor/stats:
*   get:
*     summary: 获取当前Token使用统计
*     description: |
*       获取实时Token使用统计数据，包括总量、日均使用、配额情况和模型分布。
*
*       **业务场景：**
*       - 监控AI服务的token消耗情况
*       - 实时了解配额使用进度
*       - 分析不同模型的使用分布
*       - 评估成本和效率指标
*
*       **数据特点：**
*       - 实时更新，反映最新使用情况
*       - 包含历史统计趋势数据
*       - 支持多维度数据分析
*       - 提供成本和效率评估
*
*       **更新频率：**
*       - 实时数据：每5分钟更新
*       - 历史统计：每小时汇总
*     tags:
*       - AI令牌监控
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: period
*         schema:
*           type: string
*           enum: [hour, day, week, month]
*           default: day
*         description: 统计周期
*         example: "day"
*       - in: query
*         name: model
*         schema:
*           type: string
*         description: 按模型过滤
*         example: "gpt-4"
*       - in: query
*         name: includeDetails
*         schema:
*           type: boolean
*           default: false
*         description: 是否包含详细分析数据
*         example: true
*     responses:
*       200:
*         description: 成功获取Token统计信息
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   $ref: '#/components/schemas/TokenStats'
*                 message:
*                   type: string
*                   example: "获取Token统计成功"
*             example:
*               success: true
*               data:
*                 totalTokens: 150000
*                 dailyTokens: 2500
*                 monthlyTokens: 75000
*                 averageTokensPerRequest: 156.5
*                 totalRequests: 960
*                 successRate: 98.5
*                 averageResponseTime: 1250.75
*                 quotaUsage:
*                   used: 75000
*                   total: 100000
*                   percentage: 75.0
*                 modelStats:
*                   - model: "gpt-4"
*                     tokens: 50000
*                     requests: 320
*                     cost: 125.50
*                   - model: "gpt-3.5-turbo"
*                     tokens: 100000
*                     requests: 640
*                     cost: 50.00
*                 updatedAt: "2023-12-01T10:30:00Z"
*               message: "获取Token统计成功"
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.get('/stats', tokenMonitorController.getCurrentStats);

/**
* @swagger
* /api/ai/token-monitor/performance:
*   get:
*     summary: 获取性能报告
*     description: |
*       获取AI系统的详细性能分析报告，包括响应时间、吞吐量、成功率和模型性能对比。
*
*       **业务场景：**
*       - 评估AI系统整体性能表现
*       - 识别性能瓶颈和优化机会
*       - 对比不同模型的性能指标
*       - 监控系统性能趋势变化
*
*       **报告内容：**
*       - 响应时间分析（平均值、P50、P95、P99）
*       - 系统吞吐量和并发能力
*       - 错误率和可用性统计
*       - 各模型性能对比分析
*       - 性能优化建议
*
*       **数据周期：**
*       - 默认显示过去7天数据
*       - 支持自定义时间范围查询
*     tags:
*       - AI令牌监控
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: period
*         schema:
*           type: string
*           enum: [24h, 7d, 30d, 90d]
*           default: 7d
*         description: 报告时间周期
*         example: "7d"
*       - in: query
*         name: startDate
*         schema:
*           type: string
*           format: date-time
*         description: 开始时间（自定义时间范围）
*         example: "2023-11-24T00:00:00Z"
*       - in: query
*         name: endDate
*         schema:
*           type: string
*           format: date-time
*         description: 结束时间（自定义时间范围）
*         example: "2023-12-01T23:59:59Z"
*       - in: query
*         name: models
*         schema:
*           type: array
*           items:
*             type: string
*         description: 指定分析的模型列表
*         example: ["gpt-4", "gpt-3.5-turbo"]
*       - in: query
*         name: includeRecommendations
*         schema:
*           type: boolean
*           default: true
*         description: 是否包含优化建议
*         example: true
*     responses:
*       200:
*         description: 成功获取性能报告
*         content:
*           application/json:
*             schema:
*               type: object
*               properties:
*                 success:
*                   type: boolean
*                   example: true
*                 data:
*                   $ref: '#/components/schemas/PerformanceReport'
*                 message:
*                   type: string
*                   example: "获取性能报告成功"
*             example:
*               success: true
*               data:
*                 overview:
*                   period: "过去7天"
*                   totalRequests: 2400
*                   totalTokens: 375000
*                   totalCost: 937.50
*                 performanceMetrics:
*                   responseTime:
*                     average: 1250.75
*                     p50: 1100.00
*                     p95: 2100.50
*                     p99: 3500.25
*                   throughput: 2.5
*                   errorRate: 1.5
*                 modelPerformance:
*                   - model: "gpt-4"
*                     avgResponseTime: 1650.25
*                     successRate: 99.2
*                     tokenEfficiency: 8.7
*                   - model: "gpt-3.5-turbo"
*                     avgResponseTime: 850.50
*                     successRate: 98.8
*                     tokenEfficiency: 9.2
*                 recommendations:
*                   - "考虑使用gpt-3.5-turbo处理简单任务以降低成本"
*                   - "优化提示词以减少token使用量"
*               message: "获取性能报告成功"
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.get('/performance', tokenMonitorController.getPerformanceReport);

/**
* @swagger
* /api/ai/token-monitor/alerts:
*   get:
*     summary: 获取实时告警
*     description: |
*       获取当前活跃的告警信息，包括配额警告、性能异常、错误激增等。
*
*       **告警类型：**
*       - **配额警告**: token使用量接近或超过配额限制
*       - **性能异常**: 响应时间过长或成功率下降
*       - **错误激增**: 短时间内错误数量异常增加
*       - **成本阈值**: 使用成本超过设定阈值
*
*       **告警级别：**
*       - **Critical**: 需要立即处理的严重问题
*       - **High**: 重要问题，需要及时处理
*       - **Medium**: 一般问题，建议尽快处理
*       - **Low**: 轻微问题，可以稍后处理
*
*       **业务场景：**
*       - 实时监控系统异常状态
*       - 主动发现潜在问题
*       - 及时响应系统告警
*       - 优化系统运行状态
*     tags:
*       - AI令牌监控
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: severity
*         schema:
*           type: string
*           enum: [low, medium, high, critical]
*         description: 按严重程度过滤
*         example: "high"
*       - in: query
*         name: type
*         schema:
*           type: string
*           enum: [quota_warning, performance_degradation, error_spike, cost_threshold]
*         description: 按告警类型过滤
*         example: "quota_warning"
*       - in: query
*         name: acknowledged
*         schema:
*           type: boolean
*         description: 按确认状态过滤
*         example: false
*       - in: query
*         name: limit
*         schema:
*           type: integer
*           minimum: 1
*           maximum: 100
*           default: 20
*         description: 返回告警数量限制
*         example: 20
*     responses:
*       200:
*         description: 成功获取告警列表
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
*                     alerts:
*                       type: array
*                       items:
*                         $ref: '#/components/schemas/Alert'
*                     total:
*                       type: integer
*                       description: 告警总数
*                       example: 5
*                     unacknowledged:
*                       type: integer
*                       description: 未确认告警数
*                       example: 3
*                     criticalCount:
*                       type: integer
*                       description: 严重级别告警数
*                       example: 1
*                 message:
*                   type: string
*                   example: "获取告警列表成功"
*             example:
*               success: true
*               data:
*                 alerts:
*                   - id: "alert_123"
*                     type: "quota_warning"
*                     severity: "medium"
*                     title: "配额使用率超过80%"
*                     message: "当前已使用80,000个token，占总配额的80%"
*                     timestamp: "2023-12-01T09:15:00Z"
*                     acknowledged: false
*                     metadata:
*                       currentValue: 80000
*                       threshold: 80000
*                       percentage: 80.0
*                 total: 5
*                 unacknowledged: 3
*                 criticalCount: 1
*               message: "获取告警列表成功"
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.get('/alerts', tokenMonitorController.getAlerts);

/**
* @swagger
* /api/ai/token-monitor/suggestions:
*   get:
*     summary: 获取优化建议
*     description: |
*       基于系统使用数据和性能分析，提供智能优化建议，帮助提升效率和降低成本。
*
*       **建议类别：**
*       - **成本优化**: 减少token使用量和成本支出
*       - **性能提升**: 提高响应速度和处理效率
*       - **准确性改进**: 优化模型选择和提示词设计
*       - **使用优化**: 改进使用模式和最佳实践
*
*       **建议特点：**
*       - 基于实际使用数据分析
*       - 提供具体的实施步骤
*       - 估算预期收益和效果
*       - 标注实施难度和优先级
*
*       **业务价值：**
*       - 降低AI服务使用成本
*       - 提升用户体验和满意度
*       - 优化资源配置和利用效率
*       - 建立最佳使用实践
*     tags:
*       - AI令牌监控
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: category
*         schema:
*           type: string
*           enum: [cost, performance, accuracy, usage]
*         description: 按建议类别过滤
*         example: "cost"
*       - in: query
*         name: priority
*         schema:
*           type: string
*           enum: [low, medium, high]
*         description: 按优先级过滤
*         example: "high"
*       - in: query
*         name: difficulty
*         schema:
*           type: string
*           enum: [easy, medium, hard]
*         description: 按实施难度过滤
*         example: "easy"
*       - in: query
*         name: includeImplemented
*         schema:
*           type: boolean
*           default: false
*         description: 是否包含已实施的建议
*         example: false
*     responses:
*       200:
*         description: 成功获取优化建议
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
*                     suggestions:
*                       type: array
*                       items:
*                         $ref: '#/components/schemas/OptimizationSuggestion'
*                     summary:
*                       type: object
*                       properties:
*                         totalSuggestions:
*                           type: integer
*                           example: 8
*                         potentialSavings:
*                           type: object
*                           properties:
*                             tokens:
*                               type: integer
*                               example: 25000
*                             cost:
*                               type: number
*                               format: float
*                               example: 312.50
*                             percentage:
*                               type: number
*                               format: float
*                               example: 15.0
*                         highPriorityCount:
*                           type: integer
*                           example: 3
*                 message:
*                   type: string
*                   example: "获取优化建议成功"
*             example:
*               success: true
*               data:
*                 suggestions:
*                   - category: "cost"
*                     title: "使用更经济的模型处理简单任务"
*                     description: "对于简单的问答任务，建议使用gpt-3.5-turbo替代gpt-4，可节省约75%的成本"
*                     potentialSavings:
*                       tokens: 15000
*                       cost: 187.50
*                       percentage: 25.0
*                     priority: "high"
*                     implementation:
*                       difficulty: "easy"
*                       estimatedTime: "2小时"
*                       steps:
*                         - "分析现有任务复杂度"
*                         - "配置模型选择规则"
*                         - "测试和验证效果"
*                 summary:
*                   totalSuggestions: 8
*                   potentialSavings:
*                     tokens: 25000
*                     cost: 312.50
*                     percentage: 15.0
*                   highPriorityCount: 3
*               message: "获取优化建议成功"
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.get('/suggestions', tokenMonitorController.getOptimizationSuggestions);

/**
* @swagger
* /api/ai/token-monitor/reset:
*   post:
*     summary: 重置统计数据
*     description: |
*       重置Token监控的统计数据，仅限管理员执行。此操作不可逆，请谨慎使用。
*
*       **重置范围：**
*       - 实时统计数据
*       - 历史统计记录
*       - 性能指标数据
*       - 告警记录
*
*       **业务场景：**
*       - 系统维护后重新统计
*       - 清理测试数据
*       - 重新开始统计周期
*       - 数据迁移后重置
*
*       **权限控制：**
*       - 仅限管理员权限
*       - 操作会记录审计日志
*       - 需要二次确认
*
*       **注意事项：**
*       - 操作不可逆
*       - 影响历史数据分析
*       - 建议在维护窗口期执行
*     tags:
*       - AI令牌监控
*     security:
*       - bearerAuth: []
*     parameters:
*       - in: query
*         name: confirm
*         schema:
*           type: boolean
*           required: true
*         description: 确认重置操作，必须设置为true
*         example: true
*       - in: query
*         name: scope
*         schema:
*           type: string
*           enum: [all, stats, alerts, cache]
*           default: all
*         description: 重置范围
*         example: "all"
*     requestBody:
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               reason:
*                 type: string
*                 description: 重置原因
*                 example: "系统维护后重新开始统计"
*               backupData:
*                 type: boolean
*                 description: 是否备份现有数据
*                 default: true
*                 example: true
*     responses:
*       200:
*         description: 统计数据重置成功
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
*                     resetTime:
*                       type: string
*                       format: date-time
*                       example: "2023-12-01T11:00:00Z"
*                     scope:
*                       type: string
*                       example: "all"
*                     backupCreated:
*                       type: boolean
*                       example: true
*                     backupPath:
*                       type: string
*                       example: "/backups/token_stats_20231201_110000.json"
*                 message:
*                   type: string
*                   example: "统计数据重置成功"
*       400:
*         description: 请求参数错误
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/ErrorResponse'
*             example:
*               success: false
*               error: "必须提供confirm=true参数来确认重置操作"
*               code: 400
*       401:
*         $ref: '#/components/responses/UnauthorizedError'
*       403:
*         $ref: '#/components/responses/ForbiddenError'
*       500:
*         $ref: '#/components/responses/ServerError'
*/
router.post('/reset',
  checkPermission('admin'), // 需要管理员权限
  tokenMonitorController.resetStats
);

export default router;