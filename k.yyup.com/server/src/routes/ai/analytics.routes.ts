import { Router } from 'express';
import analyticsController from '../../controllers/ai/analytics.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
* tags:
*   name: AI分析统计
*   description: AI功能的使用分析、统计和预测相关接口
*
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*
*   schemas:
*    AnalyticsOverview:
*      type: object
*      properties:
*        totalUsage:
*          type: object
*          properties:
*            totalRequests:
*              type: integer
*              description: 总请求数
*              example: 15000
*            totalTokens:
*              type: integer
*              description: 总Token使用量
*              example: 2500000
*            totalCost:
*              type: number
*              description: 总费用
*              example: 125.50
*            activeUsers:
*              type: integer
*              description: 活跃用户数
*              example: 250
*        modelUsage:
*          type: array
*          items:
*            type: object
*            properties:
*              modelId:
*                type: integer
*                description: 模型ID
*              modelName:
*                type: string
*                description: 模型名称
*              usage:
*                type: object
*                properties:
*                  requests:
*                    type: integer
*                  tokens:
*                    type: integer
*                  cost:
*                    type: number
*        trends:
*          type: object
*          properties:
*            dailyUsage:
*              type: array
*              items:
*                type: object
*                properties:
*                  date:
*                    type: string
*                    format: date
*                  requests:
*                    type: integer
*                  tokens:
*                    type: integer
*            userGrowth:
*              type: array
*              items:
*                type: object
*                properties:
*                  date:
*                    type: string
*                    format: date
*                  newUsers:
*                    type: integer
*                  activeUsers:
*                    type: integer
*        performance:
*          type: object
*          properties:
*            averageResponseTime:
*              type: number
*              description: 平均响应时间(毫秒)
*              example: 1250
*            successRate:
*              type: number
*              description: 成功率
*              example: 98.5
*            errorRate:
*              type: number
*              description: 错误率
*              example: 1.5
*
*    ModelUsageDistribution:
*      type: object
*      properties:
*        models:
*          type: array
*          items:
*            type: object
*            properties:
*              modelId:
*                type: integer
*              modelName:
*                type: string
*              provider:
*                type: string
*              usageStats:
*                type: object
*                properties:
*                  requests:
*                    type: integer
*                  tokens:
*                    type: object
*                    properties:
*                      input:
*                        type: integer
*                      output:
*                        type: integer
*                      total:
*                        type: integer
*                  cost:
*                    type: number
*                  averageLatency:
*                    type: number
*                  successRate:
*                    type: number
*              userDistribution:
*                type: array
*                items:
*                  type: object
*                  properties:
*                    userRole:
*                      type: string
*                    usageCount:
*                      type: integer
*                    costShare:
*                      type: number
*        summary:
*          type: object
*          properties:
*            totalModels:
*              type: integer
*            mostUsedModel:
*              type: object
*              properties:
*                modelName:
*                  type: string
*                usagePercentage:
*                  type: number
*            costDistribution:
*              type: object
*              additionalProperties:
*                type: number
*
*    UserActivityTrend:
*      type: object
*      properties:
*        timeRange:
*          type: string
*          enum: [day, week, month, quarter, year]
*          description: 时间范围
*        trends:
*          type: array
*          items:
*            type: object
*            properties:
*              period:
*                type: string
*                description: 时间周期
*              metrics:
*                type: object
*                properties:
*                  activeUsers:
*                    type: integer
*                  newUsers:
*                    type: integer
*                  totalSessions:
*                    type: integer
*                  averageSessionDuration:
*                    type: number
*                  bounceRate:
*                    type: number
*              topFeatures:
*                type: array
*                items:
*                  type: object
*                  properties:
*                    feature:
*                      type: string
*                    usageCount:
*                      type: integer
*                    growthRate:
*                      type: number
*        insights:
*          type: array
*          items:
*            type: object
*            properties:
*              type:
*                type: string
*                enum: [growth, decline, anomaly, opportunity]
*              title:
*                type: string
*              description:
*                type: string
*              impact:
*                type: string
*                enum: [high, medium, low]
*
*    UserAnalytics:
*      type: object
*      properties:
*        userId:
*          type: integer
*          description: 用户ID
*        profile:
*          type: object
*          properties:
*            role:
*              type: string
*              enum: [teacher, parent, admin, principal]
*            department:
*              type: string
*            joinDate:
*              type: string
*              format: date-time
*        usageMetrics:
*          type: object
*          properties:
*            totalRequests:
*              type: integer
*            totalTokens:
*              type: integer
*            totalCost:
*              type: number
*            averageRequestsPerDay:
*              type: number
*            mostUsedModels:
*              type: array
*              items:
*                type: object
*                properties:
*                  modelName:
*                    type: string
*                  usageCount:
*                    type: integer
*                  percentage:
*                    type: number
*            favoriteFeatures:
*              type: array
*              items:
*                type: object
*                properties:
*                  feature:
*                    type: string
*                  usageCount:
*                    type: integer
*        activityTimeline:
*          type: array
*          items:
*            type: object
*            properties:
*              date:
*                type: string
*                format: date
*              requests:
*                type: integer
*              tokens:
*                type: integer
*              cost:
*                type: number
*              topFeatures:
*                type: array
*                items:
*                  type: string
*        behaviorAnalysis:
*          type: object
*          properties:
*            usagePattern:
*              type: string
*              enum: [daily, weekly, monthly, sporadic]
*            peakHours:
*              type: array
*              items:
*                type: integer
*            preferredModelTypes:
*              type: array
*              items:
*                type: string
*            efficiency:
*              type: object
*              properties:
*                tokensPerRequest:
*                  type: number
*                costEfficiency:
*                  type: number
*                successRate:
*                  type: number
*
*    ContentAnalytics:
*      type: object
*      properties:
*        contentTypes:
*          type: array
*          items:
*            type: object
*            properties:
*              type:
*                type: string
*                enum: [activity_planning, lesson_preparation, parent_communication, assessment, administrative]
*              count:
*                type: integer
*              percentage:
*                type: number
*              averageTokens:
*                type: number
*        contentQuality:
*          type: object
*          properties:
*            averageLength:
*              type: number
*            complexity:
*              type: object
*              properties:
*                simple:
*                  type: number
*                medium:
*                  type: number
*                complex:
*                  type: number
*            engagement:
*              type: object
*              properties:
*                averageRating:
*                  type: number
*                feedbackCount:
*                  type: integer
*                improvementSuggestions:
*                  type: integer
*        trendingTopics:
*          type: array
*          items:
*            type: object
*            properties:
*              topic:
*                type: string
*              frequency:
*                type: integer
*              growth:
*                type: number
*              relatedModels:
*                type: array
*                items:
*                  type: string
*        effectiveness:
*          type: object
*          properties:
*            taskCompletionRate:
*              type: number
*            userSatisfaction:
*              type: number
*            timeSavings:
*              type: object
*              properties:
*                averageMinutes:
*                  type: number
*                totalHours:
*                  type: number
*
*    AnalyticsReportRequest:
*      type: object
*      properties:
*        startDate:
*          type: string
*          format: date
*          description: 开始日期
*          example: "2024-01-01"
*        endDate:
*          type: string
*          format: date
*          description: 结束日期
*          example: "2024-01-31"
*        includeUserDetails:
*          type: boolean
*          description: 是否包含用户详情
*          default: false
*        selectedMetrics:
*          type: array
*          items:
*            type: string
*            enum: [usage, models, users, content, performance, costs]
*          description: 选定的指标类型
*        reportFormat:
*          type: string
*          enum: [json, excel, pdf]
*          description: 报告格式
*          default: json
*        includeCharts:
*          type: boolean
*          description: 是否包含图表
*          default: true
*      required:
*        - startDate
*        - endDate
*
*    AnalyticsReport:
*      type: object
*      properties:
*        reportId:
*          type: string
*          format: uuid
*          description: 报告ID
*        generatedAt:
*          type: string
*          format: date-time
*          description: 生成时间
*        period:
*          type: object
*          properties:
*            startDate:
*              type: string
*              format: date
*            endDate:
*              type: string
*              format: date
*        summary:
*          type: object
*          properties:
*            totalRequests:
*              type: integer
*            totalUsers:
*              type: integer
*            totalCost:
*              type: number
*            averageResponseTime:
*              type: number
*        sections:
*          type: array
*          items:
*            type: object
*            properties:
*              section:
*                type: string
*              data:
*                type: object
*              charts:
*                type: array
*                items:
*                  type: object
*                  properties:
*                    type:
*                      type: string
*                      enum: [line, bar, pie, area]
*                    title:
*                      type: string
*                    data:
*                      type: object
*        downloadLinks:
*          type: object
*          properties:
*            json:
*              type: string
*            excel:
*              type: string
*            pdf:
*              type: string
*
*    DashboardData:
*      type: object
*      properties:
*        overview:
*          type: object
*          properties:
*            todayStats:
*              type: object
*              properties:
*                requests:
*                  type: integer
*                users:
*                  type: integer
*                cost:
*                  type: number
*                averageResponseTime:
*                  type: number
*            thisWeek:
*              type: object
*              properties:
*                requests:
*                  type: integer
*                growth:
*                  type: number
*                users:
*                  type: integer
*                cost:
*                  type: number
*            thisMonth:
*              type: object
*              properties:
*                requests:
*                  type: integer
*                growth:
*                  type: number
*                users:
*                  type: integer
*                cost:
*                  type: number
*        charts:
*          type: object
*          properties:
*            usageTrend:
*              type: array
*              items:
*                type: object
*                properties:
*                  date:
*                    type: string
*                    format: date
*                  requests:
*                    type: integer
*                  users:
*                    type: integer
*            modelDistribution:
*              type: array
*              items:
*                type: object
*                properties:
*                  model:
*                    type: string
*                  percentage:
*                    type: number
*                  count:
*                    type: integer
*            userActivity:
*              type: array
*              items:
*                type: object
*                properties:
*                  hour:
*                    type: integer
*                  activity:
*                    type: number
*        alerts:
*          type: array
*          items:
*            type: object
*            properties:
*              type:
*                type: string
*                enum: [warning, error, info, success]
*              title:
*                type: string
*              description:
*                type: string
*              timestamp:
*                type: string
*                format: date-time
*              actionRequired:
*                type: boolean
*
*    PredictiveAnalytics:
*      type: object
*      properties:
*        predictionType:
*          type: string
*          enum: [enrollment, revenue, churn, satisfaction]
*          description: 预测类型
*        timeRange:
*          type: string
*          enum: [month, quarter, year]
*          description: 预测时间范围
*        generatedAt:
*          type: string
*          format: date-time
*          description: 生成时间
*        predictions:
*          type: object
*          properties:
*            enrollment:
*              type: object
*              properties:
*                predictedValue:
*                  type: number
*                  description: 预测招生数
*                confidence:
*                  type: number
*                  minimum: 0
*                  maximum: 1
*                  description: 置信度
*                trend:
*                  type: string
*                  enum: [increasing, decreasing, stable]
*                  description: 趋势
*                factors:
*                  type: array
*                  items:
*                    type: object
*                    properties:
*                      factor:
*                        type: string
*                      impact:
*                        type: string
*                      weight:
*                        type: number
*            revenue:
*              type: object
*              properties:
*                predictedValue:
*                  type: number
*                  description: 预测收入
*                confidence:
*                  type: number
*                  minimum: 0
*                  maximum: 1
*                trend:
*                  type: string
*                  enum: [increasing, decreasing, stable]
*                growthRate:
*                  type: number
*                  description: 增长率
*            churn:
*              type: object
*              properties:
*                predictedValue:
*                  type: number
*                  description: 预测流失率
*                confidence:
*                  type: number
*                  minimum: 0
*                  maximum: 1
*                trend:
*                  type: string
*                  enum: [increasing, decreasing, stable]
*                riskFactors:
*                  type: array
*                  items:
*                    type: object
*                    properties:
*                      factor:
*                        type: string
*                      probability:
*                        type: number
*            satisfaction:
*              type: object
*              properties:
*                predictedValue:
*                  type: number
*                  description: 预测满意度评分
*                confidence:
*                  type: number
*                  minimum: 0
*                  maximum: 1
*                trend:
*                  type: string
*                  enum: [increasing, decreasing, stable]
*                keyDrivers:
*                  type: array
*                  items:
*                    type: object
*                    properties:
*                      driver:
*                        type: string
*                      impact:
*                        type: number
*                      sentiment:
*                        type: string
*        insights:
*          type: array
*          items:
*            type: object
*            properties:
*              title:
*                type: string
*              description:
*                type: string
*              confidence:
*                type: number
*                minimum: 0
*                maximum: 1
*              impact:
*                type: string
*                enum: [high, medium, low]
*              type:
*                type: string
*                enum: [opportunity, risk, trend, recommendation]
*              actionable:
*                type: boolean
*                description: 是否可执行
*        recommendations:
*          type: array
*          items:
*            type: object
*            properties:
*              category:
*                type: string
*                enum: [marketing, operations, curriculum, technology]
*              priority:
*                type: string
*                enum: [high, medium, low]
*              title:
*                type: string
*              description:
*                type: string
*              expectedImpact:
*                type: string
*              implementation:
*                type: object
*                properties:
*                  complexity:
*                    type: string
*                    enum: [easy, moderate, complex]
*                  timeline:
*                    type: string
*                  resources:
*                    type: array
*                    items:
*                      type: string
*        accuracyMetrics:
*          type: object
*          properties:
*            modelAccuracy:
*              type: number
*              description: 模型准确率
*            lastValidated:
*              type: string
*              format: date-time
*              description: 最后验证时间
*            dataQuality:
*              type: number
*              description: 数据质量评分
*            historicalAccuracy:
*              type: array
*              items:
*                type: object
*                properties:
*                  date:
*                    type: string
*                    format: date
*                  predicted:
*                    type: number
*                  actual:
*                    type: number
*                  accuracy:
*                    type: number
*/

/**
* @swagger
* /api/ai/analytics/overview:
*  get:
*    summary: 获取AI使用概览
*    description: 获取指定时间范围内的AI使用总览数据，包括请求数、Token使用量、费用和用户活跃度等关键指标
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: query
*        name: startDate
*        schema:
*          type: string
*          format: date
*        description: 开始日期 (YYYY-MM-DD格式)
*        example: "2024-01-01"
*      - in: query
*        name: endDate
*        schema:
*          type: string
*          format: date
*        description: 结束日期 (YYYY-MM-DD格式)
*        example: "2024-01-31"
*      - in: query
*        name: includeUserDetails
*        schema:
*          type: boolean
*          default: false
*        description: 是否包含用户级别的详细数据
*      - in: query
*        name: granularity
*        schema:
*          type: string
*          enum: [hour, day, week, month]
*          default: day
*        description: 数据粒度
*    responses:
*      200:
*        description: 成功获取AI使用概览数据
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "获取AI使用概览成功"
*                data:
*                  $ref: '#/components/schemas/AnalyticsOverview'
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.get('/overview', analyticsController.getUsageOverview);

/**
* @swagger
* /api/ai/analytics/models/distribution:
*  get:
*    summary: 获取AI模型使用分布
*    description: 获取指定时间范围内各AI模型的使用分布统计，包括请求次数、Token消耗、费用分析和用户使用模式
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: query
*        name: startDate
*        schema:
*          type: string
*          format: date
*        description: 开始日期 (YYYY-MM-DD格式)
*        example: "2024-01-01"
*      - in: query
*        name: endDate
*        schema:
*          type: string
*          format: date
*        description: 结束日期 (YYYY-MM-DD格式)
*        example: "2024-01-31"
*      - in: query
*        name: provider
*        schema:
*          type: string
*          enum: [all, openai, anthropic, doubao, zhipu]
*          default: all
*        description: 按AI提供商筛选
*      - in: query
*        name: groupBy
*        schema:
*          type: string
*          enum: [model, provider, userRole, department]
*          default: model
*        description: 分组方式
*    responses:
*      200:
*        description: 成功获取模型使用分布数据
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "获取模型使用分布成功"
*                data:
*                  $ref: '#/components/schemas/ModelUsageDistribution'
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.get('/models/distribution', analyticsController.getModelUsageDistribution);

/**
* @swagger
* /api/ai/analytics/activity/trend:
*  get:
*    summary: 获取用户活跃度趋势
*    description: 分析指定时间范围内用户对AI功能的使用活跃度趋势，包括新增用户、活跃用户、会话时长等关键指标
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: query
*        name: timeRange
*        schema:
*          type: string
*          enum: [day, week, month, quarter, year]
*        description: 时间范围类型
*        example: "month"
*      - in: query
*        name: limit
*        schema:
*          type: integer
*          minimum: 1
*          maximum: 365
*          default: 30
*        description: 返回的数据点数量限制
*        example: 30
*      - in: query
*        name: userRole
*        schema:
*          type: string
*          enum: [all, teacher, parent, admin, principal]
*          default: all
*        description: 按用户角色筛选
*      - in: query
*        name: includePredictions
*        schema:
*          type: boolean
*          default: false
*        description: 是否包含预测数据
*    responses:
*      200:
*        description: 成功获取用户活跃度趋势数据
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "获取用户活跃度趋势成功"
*                data:
*                  $ref: '#/components/schemas/UserActivityTrend'
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.get('/activity/trend', analyticsController.getUserActivityTrend);

/**
* @swagger
* /api/ai/analytics/user/{userId}:
*  get:
*    summary: 获取特定用户AI使用分析
*    description: 获取指定用户的详细AI使用分析，包括使用模式、偏好模型、行为特征和效率指标等个人化数据
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: path
*        name: userId
*        required: true
*        schema:
*          type: integer
*          minimum: 1
*        description: 目标用户ID
*        example: 123
*      - in: query
*        name: startDate
*        schema:
*          type: string
*          format: date
*        description: 开始日期 (YYYY-MM-DD格式)
*        example: "2024-01-01"
*      - in: query
*        name: endDate
*        schema:
*          type: string
*          format: date
*        description: 结束日期 (YYYY-MM-DD格式)
*        example: "2024-01-31"
*      - in: query
*        name: includeTimeline
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含详细的时间线数据
*      - in: query
*        name: includeComparison
*        schema:
*          type: boolean
*          default: false
*        description: 是否包含与同类型用户的对比数据
*    responses:
*      200:
*        description: 成功获取用户AI使用分析数据
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "获取用户AI使用分析成功"
*                data:
*                  $ref: '#/components/schemas/UserAnalytics'
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      403:
*        $ref: '#/components/responses/Forbidden'
*      404:
*        $ref: '#/components/responses/NotFound'
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.get('/user/:userId', analyticsController.getUserAnalytics);

/**
* @swagger
* /api/ai/analytics/content:
*  get:
*    summary: 获取AI内容生成分析
*    description: 分析AI生成的内容数据，包括内容类型分布、质量评估、热门话题和效果评估等维度
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: query
*        name: startDate
*        schema:
*          type: string
*          format: date
*        description: 开始日期 (YYYY-MM-DD格式)
*        example: "2024-01-01"
*      - in: query
*        name: endDate
*        schema:
*          type: string
*          format: date
*        description: 结束日期 (YYYY-MM-DD格式)
*        example: "2024-01-31"
*      - in: query
*        name: contentType
*        schema:
*          type: string
*          enum: [all, activity_planning, lesson_preparation, parent_communication, assessment, administrative]
*          default: all
*        description: 内容类型筛选
*      - in: query
*        name: includeQualityMetrics
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含质量指标
*      - in: query
*        name: includeTrendingTopics
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含热门话题分析
*    responses:
*      200:
*        description: 成功获取内容分析数据
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "获取AI内容分析成功"
*                data:
*                  $ref: '#/components/schemas/ContentAnalytics'
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.get('/content', analyticsController.getContentAnalytics);

/**
* @swagger
* /api/ai/analytics/report:
*  post:
*    summary: 生成AI分析报表
*    description: 根据指定参数生成综合性的AI使用分析报表，支持多种格式和自定义指标
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            $ref: '#/components/schemas/AnalyticsReportRequest'
*    responses:
*      200:
*        description: 成功生成AI分析报表
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "AI分析报表生成成功"
*                data:
*                  $ref: '#/components/schemas/AnalyticsReport'
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.post('/report', analyticsController.generateAnalyticsReport);

/**
* @swagger
* /api/ai/analytics/dashboard:
*  get:
*    summary: 获取AI分析仪表板数据
*    description: 获取AI功能使用情况的仪表板数据，包含今日概览、本周统计、本月趋势和关键图表
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: query
*        name: timeRange
*        schema:
*          type: string
*          enum: [today, week, month, quarter]
*          default: week
*        description: 时间范围
*        example: "week"
*      - in: query
*        name: refreshRate
*        schema:
*          type: integer
*          enum: [0, 5, 15, 30, 60]
*          default: 0
*        description: 数据刷新频率(分钟)，0表示手动刷新
*      - in: query
*        name: includeAlerts
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含系统告警信息
*    responses:
*      200:
*        description: 成功获取仪表板数据
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "获取仪表板数据成功"
*                data:
*                  $ref: '#/components/schemas/DashboardData'
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.get('/dashboard', analyticsController.getDashboardData);

/**
* @swagger
* /api/ai/analytics/predictive-analytics:
*  get:
*    summary: 获取AI预测分析数据
*    description: 基于历史数据和机器学习模型生成预测分析，包括招生预测、收入预测、流失预测和满意度预测等
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: query
*        name: type
*        schema:
*          type: string
*          enum: [all, enrollment, revenue, churn, satisfaction]
*          default: all
*        description: 预测类型
*        example: "all"
*      - in: query
*        name: timeRange
*        schema:
*          type: string
*          enum: [month, quarter, year]
*          default: quarter
*        description: 预测时间范围
*        example: "quarter"
*      - in: query
*        name: confidence
*        schema:
*          type: number
*          minimum: 0
*          maximum: 1
*          default: 0.8
*        description: 最小置信度阈值
*      - in: query
*        name: includeRecommendations
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含AI生成的建议
*    responses:
*      200:
*        description: 成功获取预测分析数据
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "获取预测分析数据成功"
*                data:
*                  $ref: '#/components/schemas/PredictiveAnalytics'
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.get('/predictive-analytics', analyticsController.getPredictiveAnalytics);

/**
* @swagger
* /api/ai/analytics/predictive-analytics/refresh:
*  post:
*    summary: 刷新AI预测分析数据
*    description: 手动触发预测模型重新训练和数据刷新，获取最新的预测结果
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    requestBody:
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              forceRetraining:
*                type: boolean
*                default: false
*                description: 是否强制重新训练模型
*              predictionTypes:
*                type: array
*                items:
*                  type: string
*                  enum: [enrollment, revenue, churn, satisfaction]
*                description: 指定要刷新的预测类型
*              lookbackPeriod:
*                type: integer
*                minimum: 30
*                maximum: 365
*                default: 90
*                description: 历史数据回溯天数
*    responses:
*      200:
*        description: 预测分析数据刷新成功
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "预测分析数据刷新成功"
*                data:
*                  type: object
*                  properties:
*                    refreshedAt:
*                      type: string
*                      format: date-time
*                      description: 刷新时间
*                    updatedModels:
*                      type: array
*                      items:
*                        type: string
*                      description: 已更新的预测模型列表
*                    nextAutoRefresh:
*                      type: string
*                      format: date-time
*                      description: 下次自动刷新时间
*                    modelAccuracy:
*                      type: object
*                      additionalProperties:
*                        type: number
*                        description: 各模型的准确率
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      503:
*        description: 预测模型训练中，请稍后重试
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 503
*                message:
*                  type: string
*                  example: "预测模型正在训练中"
*                retryAfter:
*                  type: integer
*                  description: 建议重试间隔（秒）
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.post('/predictive-analytics/refresh', analyticsController.refreshPredictiveAnalytics);

/**
* @swagger
* /api/ai/analytics/predictive-analytics/export:
*  post:
*    summary: 导出AI预测分析报告
*    description: 将预测分析结果导出为不同格式的专业报告，支持数据可视化和详细分析说明
*    tags: [AI分析统计]
*    security:
*      - bearerAuth: []
*    requestBody:
*      required: true
*      content:
*        application/json:
*          schema:
*            type: object
*            properties:
*              format:
*                type: string
*                enum: [json, excel, pdf]
*                default: pdf
*                description: 导出格式
*              includeCharts:
*                type: boolean
*                default: true
*                description: 是否包含图表
*              includeRawData:
*                type: boolean
*                default: false
*                description: 是否包含原始数据
*              predictionTypes:
*                type: array
*                items:
*                  type: string
*                  enum: [enrollment, revenue, churn, satisfaction]
*                description: 要导出的预测类型
*              timeRange:
*                type: string
*                enum: [month, quarter, year]
*                default: quarter
*                description: 预测时间范围
*              language:
*                type: string
*                enum: [zh, en]
*                default: zh
*                description: 报告语言
*            required:
*              - format
*    responses:
*      200:
*        description: 预测分析报告导出成功
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 200
*                message:
*                  type: string
*                  example: "预测分析报告导出成功"
*                data:
*                  type: object
*                  properties:
*                    exportId:
*                      type: string
*                      format: uuid
*                      description: 导出任务ID
*                    downloadUrl:
*                      type: string
*                      format: uri
*                      description: 下载链接
*                    expiresAt:
*                      type: string
*                      format: date-time
*                      description: 链接过期时间
*                    fileSize:
*                      type: integer
*                      description: 文件大小（字节）
*                    format:
*                      type: string
*                      description: 文件格式
*                    generatedAt:
*                      type: string
*                      format: date-time
*                      description: 生成时间
*      400:
*        $ref: '#/components/responses/BadRequest'
*      401:
*        $ref: '#/components/responses/UnauthorizedError'
*      429:
*        description: 导出请求过于频繁
*        content:
*          application/json:
*            schema:
*              type: object
*              properties:
*                code:
*                  type: integer
*                  example: 429
*                message:
*                  type: string
*                  example: "导出请求过于频繁，请稍后重试"
*                retryAfter:
*                  type: integer
*                  description: 建议重试间隔（秒）
*      500:
*        $ref: '#/components/responses/InternalServerError'
*/
router.post('/predictive-analytics/export', analyticsController.exportPredictiveReport);

export default router;