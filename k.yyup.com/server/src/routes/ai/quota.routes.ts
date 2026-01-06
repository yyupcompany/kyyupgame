import { Router } from 'express';
import { QuotaController } from '../../controllers/ai/quota.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
// router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const quotaController = new QuotaController();

/**
* @swagger
* tags:
*   name: AI配额管理
*   description: 管理用户的AI使用配额，包括配额查询、使用历史、配额预警和配额调整等功能
*
* components:
*   securitySchemes:
*     bearerAuth:
*       type: http
*       scheme: bearer
*       bearerFormat: JWT
*
*   schemas:
*    AIQuotaInfo:
*      type: object
*      properties:
*        userId:
*          type: integer
*          description: 用户ID
*          example: 123
*        userType:
*          type: string
*          enum:
*            - teacher
*            - parent
*            - admin
*            - principal
*          description: 用户类型
*          example: "teacher"
*        quotaPeriod:
*          type: string
*          enum:
*            - daily
*            - weekly
*            - monthly
*            - yearly
*          description: 配额周期
*          example: "monthly"
*        currentPeriod:
*          type: object
*          properties:
*            startDate:
*              type: string
*              format: date
*              description: 当前周期开始日期
*              example: "2024-01-01"
*            endDate:
*              type: string
*              format: date
*              description: 当前周期结束日期
*              example: "2024-01-31"
*            daysRemaining:
*              type: integer
*              description: 周期剩余天数
*              example: 15
*        quotas:
*          type: object
*          properties:
*            totalQuota:
*              type: integer
*              description: 总配额(请求数或Token数)
*              example: 10000
*            usedQuota:
*              type: integer
*              description: 已使用配额
*              example: 3750
*            remainingQuota:
*              type: integer
*              description: 剩余配额
*              example: 6250
*            usagePercentage:
*              type: number
*              description: 使用百分比
*              example: 37.5
*            overageQuota:
*              type: integer
*              description: 超额使用配额(如有)
*              example: 0
*        quotaByModel:
*          type: object
*          additionalProperties:
*            type: object
*            properties:
*              modelId:
*                type: integer
*                example: 1
*              modelName:
*                type: string
*                example: "GPT-4"
*              limit:
*                type: integer
*                description: 该模型配额限制
*                example: 5000
*              used:
*                type: integer
*                description: 该模型已使用配额
*                example: 2100
*              remaining:
*                type: integer
*                description: 该模型剩余配额
*                example: 2900
*              percentage:
*                type: number
*                description: 使用百分比
*                example: 42.0
*        resetSchedule:
*          type: object
*          properties:
*            nextResetDate:
*              type: string
*              format: date-time
*              description: 下次重置时间
*              example: "2024-02-01T00:00:00Z"
*            resetFrequency:
*              type: string
*              description: 重置频率
*              example: "每月1号00:00"
*            autoReset:
*              type: boolean
*              description: 是否自动重置
*              example: true
*        warnings:
*          type: array
*          items:
*            type: object
*            properties:
*              type:
*                type: string
*                enum: [approaching_limit, exceeded, low_balance, warning]
*                description: 警告类型
*              message:
*                type: string
*                description: 警告信息
*                example: "配额使用已超过80%，请注意控制使用"
*              threshold:
*                type: number
*                description: 警告阈值
*                example: 80
*              triggeredAt:
*                type: string
*                format: date-time
*                description: 触发时间
*                example: "2024-01-15T10:30:00Z"
*        lastUpdated:
*          type: string
*          format: date-time
*          description: 最后更新时间
*          example: "2024-01-15T14:25:30Z"
*
*    QuotaUsageHistory:
*      type: object
*      properties:
*        userId:
*          type: integer
*          description: 用户ID
*          example: 123
*        period:
*          type: object
*          properties:
*            startDate:
*              type: string
*              format: date
*              example: "2024-01-01"
*            endDate:
*              type: string
*              format: date
*              example: "2024-01-31"
*            type:
*              type: string
*              enum: [custom, daily, weekly, monthly, yearly]
*              example: "monthly"
*        summary:
*          type: object
*          properties:
*            totalUsage:
*              type: integer
*              description: 总使用量
*              example: 8750
*            totalCost:
*              type: number
*              description: 总费用
*              example: 67.45
*            averageDailyUsage:
*              type: number
*              description: 日均使用量
*              example: 282.3
*            peakUsageDay:
*              type: string
*              format: date
*              description: 使用量最高的一天
*              example: "2024-01-15"
*            peakUsageValue:
*              type: integer
*              description: 最高使用量
*              example: 525
*        usageByDay:
*          type: array
*          items:
*            type: object
*            properties:
*              date:
*                type: string
*                format: date
*                description: 日期
*                example: "2024-01-15"
*              requests:
*                type: integer
*                description: 当日请求数
*                example: 48
*              tokens:
*                type: integer
*                description: 当日Token数
*                example: 125000
*              cost:
*                type: number
*                description: 当日费用
*                example: 3.75
*              models:
*                type: array
*                items:
*                  type: object
*                  properties:
*                    modelId:
*                      type: integer
*                      example: 1
*                    modelName:
*                      type: string
*                      example: "GPT-4"
*                    requests:
*                      type: integer
*                      example: 32
*                    tokens:
*                      type: integer
*                      example: 87000
*                    cost:
*                      type: number
*                      example: 2.85
*        usageByModel:
*          type: array
*          items:
*            type: object
*            properties:
*              modelId:
*                type: integer
*                example: 1
*              modelName:
*                type: string
*                example: "GPT-4"
*              totalRequests:
*                type: integer
*                description: 总请求数
*                example: 875
*              totalTokens:
*                type: integer
*                description: 总Token数
*                example: 2450000
*              totalCost:
*                type: number
*                description: 总费用
*                example: 45.75
*              averageTokensPerRequest:
*                type: number
*                description: 平均每请求Token数
*                example: 2800
*              successRate:
*                type: number
*                description: 成功率
*                example: 98.9
*        usageByFeature:
*          type: array
*          items:
*            type: object
*            properties:
*              feature:
*                type: string
*                description: 功能名称
*                example: "课程计划生成"
*              requests:
*                type: integer
*                description: 请求数
*                example: 156
*              tokens:
*                type: integer
*                description: Token数
*                example: 425000
*              cost:
*                type: number
*                description: 费用
*                example: 7.95
*              percentage:
*                type: number
*                description: 占总使用的百分比
*                example: 17.8
*        anomalies:
*          type: array
*          items:
*            type: object
*            properties:
*              date:
*                type: string
*                format: date
*                description: 异常日期
*                example: "2024-01-10"
*              type:
*                type: string
*                enum: [spike, drop, unusual_pattern]
*                description: 异常类型
*              description:
*                type: string
*                description: 异常描述
*                example: "使用量突增300%"
*              value:
*                type: number
*                description: 异常值
*                example: 875
*              expectedValue:
*                type: number
*                description: 期望值
*                example: 219
*        trends:
*          type: object
*          properties:
*            usageTrend:
*              type: string
*              enum: [increasing, decreasing, stable]
*              description: 使用趋势
*              example: "increasing"
*            growthRate:
*              type: number
*              description: 增长率
*              example: 15.2
*            forecast:
*              type: object
*              properties:
*                nextPeriodUsage:
*                  type: integer
*                  description: 下一周期预测使用量
*                  example: 10075
*                confidence:
*                  type: number
*                  description: 预测置信度
*                  example: 0.85
*
*    QuotaAlert:
*      type: object
*      properties:
*        alertId:
*          type: string
*          format: uuid
*          description: 警告ID
*          example: "550e8400-e29b-41d4-a716-446655440000"
*        userId:
*          type: integer
*          description: 用户ID
*          example: 123
*        type:
*          type: string
*          enum: [quota_warning, quota_exceeded, quota_depleted, reset_reminder]
*          description: 警告类型
*          example: "quota_warning"
*        severity:
*          type: string
*          enum: [low, medium, high, critical]
*          description: 严重程度
*          example: "medium"
*        title:
*          type: string
*          description: 警告标题
*          example: "AI使用配额警告"
*        message:
*          type: string
*          description: 警告详细信息
*          example: "您的月度AI使用配额已消耗80%，剩余配额2000次请求"
*        quotaInfo:
*          type: object
*          properties:
*            currentUsage:
*              type: integer
*              example: 8000
*            totalQuota:
*              type: integer
*              example: 10000
*            usagePercentage:
*              type: number
*              example: 80
*            remainingQuota:
*              type: integer
*              example: 2000
*        recommendedActions:
*          type: array
*          items:
*            type: string
*          description: 建议操作
*          example: ["升级套餐", "优化使用", "等待配额重置"]
*        triggeredAt:
*          type: string
*          format: date-time
*          description: 触发时间
*          example: "2024-01-15T10:30:00Z"
*        acknowledged:
*          type: boolean
*          description: 是否已确认
*          example: false
*        acknowledgedAt:
*          type: string
*          format: date-time
*          description: 确认时间
*          example: null
*        resolved:
*          type: boolean
*          description: 是否已解决
*          example: false
*        resolvedAt:
*          type: string
*          format: date-time
*          description: 解决时间
*          example: null
*
*    QuotaAdjustmentRequest:
*      type: object
*      properties:
*        userId:
*          type: integer
*          description: 用户ID
*          example: 123
*        adjustmentType:
*          type: string
*          enum: [increase, decrease, temporary_bonus, emergency_extension]
*          description: 调整类型
*          example: "temporary_bonus"
*        reason:
*          type: string
*          description: 调整原因
*          example: "重要项目需要额外的AI资源"
*        newQuota:
*          type: integer
*          minimum: 1
*          description: 新的配额数量
*          example: 15000
*        duration:
*          type: object
*          properties:
*            type:
*              type: string
*              enum: [permanent, temporary, one_time]
*              description: 持续时间类型
*              example: "temporary"
*            startDate:
*              type: string
*              format: date-time
*              description: 生效时间
*              example: "2024-01-15T00:00:00Z"
*            endDate:
*              type: string
*              format: date-time
*              description: 结束时间
*              example: "2024-01-31T23:59:59Z"
*            durationDays:
*              type: integer
*              description: 持续天数
*              example: 16
*        requestMetadata:
*          type: object
*          properties:
*            projectId:
*              type: string
*              description: 关联项目ID
*              example: "proj_001"
*            approverId:
*              type: integer
*              description: 审批人ID
*              example: 456
*            costCenter:
*              type: string
*              description: 成本中心
*              example: "EDUCATION_DEPT"
*            businessJustification:
*              type: string
*              description: 业务理由
*              example: "春季招生活动需要大量AI支持"
*      required:
*        - adjustmentType
*        - reason
*        - newQuota
*
*    QuotaAdjustmentResponse:
*      type: object
*      properties:
*        adjustmentId:
*          type: string
*          format: uuid
*          description: 调整请求ID
*          example: "550e8400-e29b-41d4-a716-446655440001"
*        userId:
*          type: integer
*          description: 用户ID
*          example: 123
*        status:
*          type: string
*          enum: [pending, approved, rejected, applied, expired]
*          description: 调整状态
*          example: "approved"
*        requestDetails:
*          $ref: '#/components/schemas/QuotaAdjustmentRequest'
*        approvalInfo:
*          type: object
*          properties:
*            approvedBy:
*              type: integer
*              description: 审批人ID
*              example: 456
*            approvedAt:
*              type: string
*              format: date-time
*              description: 审批时间
*              example: "2024-01-15T11:15:00Z"
*            approverComments:
*              type: string
*              description: 审批意见
*              example: "批准临时配额调整，请注意监控使用情况"
*        appliedAt:
*          type: string
*          format: date-time
*          description: 应用时间
*          example: "2024-01-15T11:20:00Z"
*        oldQuota:
*          type: integer
*          description: 原配额
*          example: 10000
*        newQuota:
*          type: integer
*          description: 新配额
*          example: 15000
*        effectivePeriod:
*          type: object
*          properties:
*            from:
*              type: string
*              format: date-time
*              example: "2024-01-15T11:20:00Z"
*            to:
*              type: string
*              format: date-time
*              example: "2024-01-31T23:59:59Z"
*        rollbackScheduled:
*          type: boolean
*          description: 是否计划回滚
*          example: true
*        rollbackAt:
*          type: string
*          format: date-time
*          description: 回滚时间
*          example: "2024-02-01T00:00:00Z"
*/

/**
* @swagger
* /api/ai/quota:
*  get:
*    summary: 获取用户AI使用配额信息
*    description: 获取当前用户的AI使用配额详细信息，包括总配额、已使用量、剩余量和各模型的分项配额
*    tags: [AI配额管理]
*    security:
*      - bearerAuth: []
*    parameters:
*      - in: query
*        name: includeModelBreakdown
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含各模型的详细配额信息
*      - in: query
*        name: includeHistoricalData
*        schema:
*          type: boolean
*          default: false
*        description: 是否包含历史使用数据
*      - in: query
*        name: includeWarnings
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含配额警告信息
*      - in: query
*        name: userId
*        schema:
*          type: integer
*          minimum: 1
*        description: 用户ID（可选，管理员可查询其他用户）
*        example: 123
*    responses:
*      200:
*        description: 成功获取用户AI配额信息
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
*                  example: "获取AI配额信息成功"
*                data:
*                  $ref: '#/components/schemas/AIQuotaInfo'
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
router.get(
  '/',
  verifyToken,
  quotaController.getUserQuota
);

/**
* @swagger
* /api/ai/quota/usage:
*  get:
*    summary: 获取AI配额使用历史记录
*    description: 获取用户在指定时间范围内的AI配额使用历史，包括每日使用明细、模型使用分布、功能使用统计和趋势分析
*    tags: [AI配额管理]
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
*        name: modelId
*        schema:
*          type: integer
*          minimum: 1
*        description: 按模型ID筛选（可选）
*        example: 1
*      - in: query
*        name: granularity
*        schema:
*          type: string
*          enum: [hour, day, week, month]
*          default: day
*        description: 数据粒度
*        example: "day"
*      - in: query
*        name: includeCostAnalysis
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含费用分析
*      - in: query
*        name: includeModelBreakdown
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含模型使用分解
*      - in: query
*        name: includeFeatureAnalysis
*        schema:
*          type: boolean
*          default: true
*        description: 是否包含功能使用分析
*      - in: query
*        name: includeAnomalyDetection
*        schema:
*          type: boolean
*          default: false
*        description: 是否包含异常检测
*      - in: query
*        name: userId
*        schema:
*          type: integer
*          minimum: 1
*        description: 用户ID（可选，管理员可查询其他用户）
*        example: 123
*      - in: query
*        name: page
*        schema:
*          type: integer
*          minimum: 1
*          default: 1
*        description: 页码（用于分页查询）
*      - in: query
*        name: limit
*        schema:
*          type: integer
*          minimum: 1
*          maximum: 1000
*          default: 100
*        description: 每页记录数
*    responses:
*      200:
*        description: 成功获取AI配额使用历史记录
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
*                  example: "获取AI配额使用历史成功"
*                data:
*                  $ref: '#/components/schemas/QuotaUsageHistory'
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
*      503:
*        description: 数据查询中，请稍后重试
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
*                  example: "配额使用历史查询中，请稍后重试"
*                retryAfter:
*                  type: integer
*                  description: 建议重试间隔（秒）
*                  example: 30
*/
router.get(
  '/usage',
  verifyToken,
  quotaController.getUsageHistory
);

export default router;