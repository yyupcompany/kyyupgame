/**
 * @swagger
 * tags:
 *   - name: 活动中心
 *     description: 活动管理中心，提供活动统计、仪表板数据、时间线和缓存管理功能
 *
 * components:
 *   schemas:
 *     ActivityStatistics:
 *       type: object
 *       properties:
 *         totalActivities:
 *           type: integer
 *           description: 总活动数量
 *           example: 150
 *         ongoingActivities:
 *           type: integer
 *           description: 进行中的活动数量
 *           example: 12
 *         completedActivities:
 *           type: integer
 *           description: 已完成的活动数量
 *           example: 120
 *         cancelledActivities:
 *           type: integer
 *           description: 已取消的活动数量
 *           example: 18
 *         totalRegistrations:
 *           type: integer
 *           description: 总报名数量
 *           example: 2850
 *         activeRegistrations:
 *           type: integer
 *           description: 活跃报名数量
 *           example: 450
 *         averageRating:
 *           type: number
 *           format: float
 *           description: 平均活动评分
 *           example: 4.6
 *         totalParticipants:
 *           type: integer
 *           description: 总参与人数
 *           example: 3200
 *         monthlyGrowth:
 *           type: number
 *           format: float
 *           description: 月度增长率
 *           example: 15.5
 *
 *     ActivityTemplate:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 模板ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 模板名称
 *           example: "户外探索活动模板"
 *         category:
 *           type: string
 *           description: 活动类别
 *           example: "户外活动"
 *         description:
 *           type: string
 *           description: 模板描述
 *           example: "适合幼儿园的户外探索和自然学习活动"
 *         duration:
 *           type: integer
 *           description: 建议时长（分钟）
 *           example: 120
 *         maxParticipants:
 *           type: integer
 *           description: 最大参与人数
 *           example: 30
 *         ageRange:
 *           type: object
 *           properties:
 *             min:
 *               type: integer
 *               example: 3
 *             max:
 *               type: integer
 *               example: 6
 *           description: 适合年龄范围
 *         materials:
 *           type: array
 *           items:
 *             type: string
 *           description: 所需材料清单
 *           example: ["放大镜", "收集袋", "记录本", "彩色笔"]
 *         objectives:
 *           type: array
 *           items:
 *             type: string
 *           description: 活动目标
 *           example: ["培养观察力", "增强团队协作", "学习自然知识"]
 *         usageCount:
 *           type: integer
 *           description: 使用次数
 *           example: 45
 *         averageRating:
 *           type: number
 *           format: float
 *           description: 平均评分
 *           example: 4.8
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2023-10-01T08:00:00Z"
 *
 *     RecentRegistration:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 123
 *         activityId:
 *           type: integer
 *           description: 活动ID
 *           example: 45
 *         activityTitle:
 *           type: string
 *           description: 活动标题
 *           example: "春季科学探索营"
 *         participantName:
 *           type: string
 *           description: 参与者姓名
 *           example: "王小明"
 *         participantAge:
 *           type: integer
 *           description: 参与者年龄
 *           example: 5
 *         parentName:
 *           type: string
 *           description: 家长姓名
 *           example: "王先生"
 *         registrationDate:
 *           type: string
 *           format: date-time
 *           description: 报名时间
 *           example: "2023-12-01T14:30:00Z"
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled, completed]
 *           description: 报名状态
 *           example: "confirmed"
 *         paymentStatus:
 *           type: string
 *           enum: [pending, paid, refunded]
 *           description: 支付状态
 *           example: "paid"
 *
 *     ActivityPlan:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 78
 *         title:
 *           type: string
 *           description: 活动计划标题
 *           example: "12月份圣诞主题活动周"
 *         description:
 *           type: string
 *           description: 计划描述
 *           example: "为期一周的圣诞主题教育活动"
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: 开始日期
 *           example: "2023-12-18T09:00:00Z"
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: 结束日期
 *           example: "2023-12-22T17:00:00Z"
 *         status:
 *           type: string
 *           enum: [planning, active, completed, cancelled]
 *           description: 计划状态
 *           example: "active"
 *         targetParticipants:
 *           type: integer
 *           description: 目标参与人数
 *           example: 120
 *         currentRegistrations:
 *           type: integer
 *           description: 当前报名数
 *           example: 85
 *         budget:
 *           type: object
 *           properties:
 *             planned:
 *               type: number
 *               format: float
 *               example: 15000.00
 *             spent:
 *               type: number
 *               format: float
 *               example: 8750.50
 *           description: 预算信息
 *         responsibleTeacher:
 *           type: string
 *           description: 负责老师
 *           example: "李老师"
 *
 *     TimelineEvent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: 事件ID
 *           example: "event_123"
 *         type:
 *           type: string
 *           enum: [activity_created, registration_received, activity_completed, payment_received, reminder_sent]
 *           description: 事件类型
 *           example: "activity_created"
 *         title:
 *           type: string
 *           description: 事件标题
 *           example: "新活动创建"
 *         description:
 *           type: string
 *           description: 事件描述
 *           example: "创建了新的科学探索活动"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 事件时间
 *           example: "2023-12-01T10:30:00Z"
 *         activityId:
 *           type: integer
 *           description: 相关活动ID
 *           example: 45
 *         activityTitle:
 *           type: string
 *           description: 相关活动标题
 *           example: "科学探索营"
 *         userId:
 *           type: integer
 *           description: 操作用户ID
 *           example: 12
 *         userName:
 *           type: string
 *           description: 操作用户姓名
 *           example: "张老师"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: 优先级
 *           example: "medium"
 *
 *     CacheStats:
 *       type: object
 *       properties:
 *         totalKeys:
 *           type: integer
 *           description: 总缓存键数量
 *           example: 156
 *         memoryUsage:
 *           type: object
 *           properties:
 *             used:
 *               type: integer
 *               description: 已使用内存（字节）
 *               example: 52428800
 *             total:
 *               type: integer
 *               description: 总内存（字节）
 *               example: 104857600
 *             percentage:
 *               type: number
 *               format: float
 *               description: 使用百分比
 *               example: 50.0
 *           description: 内存使用情况
 *         hitRate:
 *           type: number
 *           format: float
 *           description: 缓存命中率
 *           example: 85.6
 *         missRate:
 *           type: number
 *           format: float
 *           description: 缓存未命中率
 *           example: 14.4
 *         evictions:
 *           type: integer
 *           description: 驱逐次数
 *           example: 12
 *         averageTtl:
 *           type: integer
 *           description: 平均TTL（秒）
 *           example: 3600
 *         oldestKey:
 *           type: string
 *           description: 最旧的缓存键
 *           example: "activity_stats_20231101"
 *         oldestKeyAge:
 *           type: integer
 *           description: 最旧键的年龄（秒）
 *           example: 2592000
 *
 *     ActivityCenterDashboard:
 *       type: object
 *       properties:
 *         statistics:
 *           $ref: '#/components/schemas/ActivityStatistics'
 *         activityTemplates:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ActivityTemplate'
 *           description: 活动模板列表
 *         recentRegistrations:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RecentRegistration'
 *             total:
 *               type: integer
 *               description: 总报名数量
 *               example: 50
 *           description: 最近报名记录
 *         activityPlans:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ActivityPlan'
 *           description: 活动计划列表
 *         posterTemplates:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 5
 *                   name:
 *                     type: string
 *                     example: "圣诞活动海报模板"
 *                   thumbnail:
 *                     type: string
 *                     example: "https://example.com/poster-thumb.jpg"
 *                   category:
 *                     type: string
 *                     example: "节日活动"
 *                   usageCount:
 *                     type: integer
 *                     example: 28
 *           description: 海报模板数据
 *         meta:
 *           type: object
 *           properties:
 *             responseTime:
 *               type: number
 *               format: float
 *               description: 响应时间（毫秒）
 *               example: 245.5
 *             dataCount:
 *               type: object
 *               properties:
 *                 activities:
 *                   type: integer
 *                   example: 150
 *                 templates:
 *                   type: integer
 *                   example: 25
 *                 registrations:
 *                   type: integer
 *                   example: 2850
 *                 plans:
 *                   type: integer
 *                   example: 12
 *               description: 各类数据统计
 *             lastUpdated:
 *               type: string
 *               format: date-time
 *               description: 最后更新时间
 *               example: "2023-12-01T10:30:00Z"
 *           description: 元数据信息
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
 * 活动中心聚合API路由
 */

import { Router } from 'express';
import { ActivityCenterController } from '../../controllers/centers/activity-center.controller';
import { verifyToken, checkPermission } from '../../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
 * @swagger
 * /api/centers/activity/timeline:
 *   get:
 *     summary: 获取活动中心Timeline数据
 *     description: |
 *       获取活动中心的时间线数据，展示所有重要的活动和系统事件。
 *
 *       **事件类型：**
 *       - **activity_created**: 新活动创建
 *       - **registration_received**: 收到新的报名
 *       - **activity_completed**: 活动完成
 *       - **payment_received**: 收到支付
 *       - **reminder_sent**: 发送提醒
 *
 *       **业务场景：**
 *       - 实时监控活动动态
 *       - 追踪重要事件和操作
 *       - 了解系统活动情况
 *       - 分析用户行为模式
 *
 *       **数据特点：**
 *       - 按时间倒序排列
 *       - 支持多种过滤条件
 *       - 包含详细的上下文信息
 *       - 实时更新状态
 *     tags:
 *       - 活动中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: 页码
 *         example: 1
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: 每页事件数量
 *         example: 20
 *       - in: query
 *         name: eventType
 *         schema:
 *           type: string
 *           enum: [activity_created, registration_received, activity_completed, payment_received, reminder_sent]
 *         description: 按事件类型过滤
 *         example: "activity_created"
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: 按优先级过滤
 *         example: "high"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始时间过滤
 *         example: "2023-12-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束时间过滤
 *         example: "2023-12-31T23:59:59Z"
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 按用户ID过滤
 *         example: 12
 *     responses:
 *       200:
 *         description: Timeline数据获取成功
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
 *                     events:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/TimelineEvent'
 *                       description: 时间线事件列表
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                           example: 1
 *                         pageSize:
 *                           type: integer
 *                           example: 20
 *                         total:
 *                           type: integer
 *                           example: 150
 *                         totalPages:
 *                           type: integer
 *                           example: 8
 *                       description: 分页信息
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalEvents:
 *                           type: integer
 *                           example: 150
 *                         todayEvents:
 *                           type: integer
 *                           example: 12
 *                         highPriorityEvents:
 *                           type: integer
 *                           example: 5
 *                         recentActivityTypes:
 *                           type: array
 *                           items:
 *                             type: string
 *                           example: ["activity_created", "registration_received"]
 *                       description: 统计摘要
 *                 message:
 *                   type: string
 *                   example: "Timeline数据获取成功"
 *             example:
 *               success: true
 *               data:
 *                 events:
 *                   - id: "event_123"
 *                     type: "activity_created"
 *                     title: "新活动创建"
 *                     description: "创建了新的科学探索活动"
 *                     timestamp: "2023-12-01T10:30:00Z"
 *                     activityId: 45
 *                     activityTitle: "科学探索营"
 *                     userId: 12
 *                     userName: "张老师"
 *                     priority: "medium"
 *                 pagination:
 *                   page: 1
 *                   pageSize: 20
 *                   total: 150
 *                   totalPages: 8
 *                 summary:
 *                   totalEvents: 150
 *                   todayEvents: 12
 *                   highPriorityEvents: 5
 *                   recentActivityTypes: ["activity_created", "registration_received"]
 *               message: "Timeline数据获取成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/timeline', ActivityCenterController.getTimeline);

/**
 * @swagger
 * /api/centers/activity/dashboard:
 *   get:
 *     summary: 获取活动中心仪表板聚合数据
 *     description: |
 *       获取活动中心的综合仪表板数据，包括统计信息、活动模板、最新报名、活动计划等。
 *
 *       **仪表板内容：**
 *       - **统计信息**: 活动、报名、评分等关键指标
 *       - **活动模板**: 热门和推荐的活动模板
 *       - **最新报名**: 实时报名动态
 *       - **活动计划**: 当前和计划中的活动
 *       - **海报模板**: 活动宣传模板
 *       - **性能数据**: 响应时间和数据统计
 *
 *       **业务场景：**
 *       - 活动管理中心首页展示
 *       - 快速了解活动运营状况
 *       - 监控关键业务指标
 *       - 发现热门活动和趋势
 *
 *       **数据特点：**
 *       - 实时聚合计算
 *       - 多维度数据展示
 *       - 包含趋势和对比数据
 *       - 支持快速决策参考
 *     tags:
 *       - 活动中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: refresh
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否强制刷新缓存数据
 *         example: false
 *       - in: query
 *         name: includeDetailed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含详细的分析数据
 *         example: true
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter]
 *           default: month
 *         description: 统计时间范围
 *         example: "month"
 *     responses:
 *       200:
 *         description: 活动中心仪表板数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ActivityCenterDashboard'
 *                 message:
 *                   type: string
 *                   example: "活动中心仪表板数据获取成功"
 *             example:
 *               success: true
 *               data:
 *                 statistics:
 *                   totalActivities: 150
 *                   ongoingActivities: 12
 *                   completedActivities: 120
 *                   cancelledActivities: 18
 *                   totalRegistrations: 2850
 *                   activeRegistrations: 450
 *                   averageRating: 4.6
 *                   totalParticipants: 3200
 *                   monthlyGrowth: 15.5
 *                 activityTemplates:
 *                   - id: 1
 *                     name: "户外探索活动模板"
 *                     category: "户外活动"
 *                     description: "适合幼儿园的户外探索和自然学习活动"
 *                     duration: 120
 *                     maxParticipants: 30
 *                     ageRange:
 *                       min: 3
 *                       max: 6
 *                     materials: ["放大镜", "收集袋", "记录本", "彩色笔"]
 *                     objectives: ["培养观察力", "增强团队协作", "学习自然知识"]
 *                     usageCount: 45
 *                     averageRating: 4.8
 *                     createdAt: "2023-10-01T08:00:00Z"
 *                 recentRegistrations:
 *                   list:
 *                     - id: 123
 *                       activityId: 45
 *                       activityTitle: "春季科学探索营"
 *                       participantName: "王小明"
 *                       participantAge: 5
 *                       parentName: "王先生"
 *                       registrationDate: "2023-12-01T14:30:00Z"
 *                       status: "confirmed"
 *                       paymentStatus: "paid"
 *                   total: 50
 *                 activityPlans:
 *                   - id: 78
 *                     title: "12月份圣诞主题活动周"
 *                     description: "为期一周的圣诞主题教育活动"
 *                     startDate: "2023-12-18T09:00:00Z"
 *                     endDate: "2023-12-22T17:00:00Z"
 *                     status: "active"
 *                     targetParticipants: 120
 *                     currentRegistrations: 85
 *                     budget:
 *                       planned: 15000.00
 *                       spent: 8750.50
 *                     responsibleTeacher: "李老师"
 *                 posterTemplates:
 *                   data:
 *                     - id: 5
 *                       name: "圣诞活动海报模板"
 *                       thumbnail: "https://example.com/poster-thumb.jpg"
 *                       category: "节日活动"
 *                       usageCount: 28
 *                 meta:
 *                   responseTime: 245.5
 *                   dataCount:
 *                     activities: 150
 *                     templates: 25
 *                     registrations: 2850
 *                     plans: 12
 *                   lastUpdated: "2023-12-01T10:30:00Z"
 *               message: "活动中心仪表板数据获取成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/dashboard', ActivityCenterController.getDashboard);

/**
 * @swagger
 * /api/centers/activity/cache/stats:
 *   get:
 *     summary: 获取活动中心缓存统计
 *     description: |
 *       获取活动中心的缓存使用统计信息，用于监控和优化缓存性能。
 *
 *       **统计指标：**
 *       - **缓存键数量**: 当前存储的缓存项总数
 *       - **内存使用**: 缓存占用的内存情况
 *       - **命中率**: 缓存命中和未命中统计
 *       - **驱逐统计**: 缓存清理和过期情况
 *       - **TTL分析**: 生存时间分布
 *
 *       **业务场景：**
 *       - 监控缓存性能和效率
 *       - 识别缓存配置问题
 *       - 优化内存使用策略
 *       - 分析缓存命中模式
 *
 *       **优化建议：**
 *       - 命中率低于80%时考虑调整缓存策略
 *       - 内存使用率超过90%时需要清理或扩容
 *       - 驱逐次数过多时可能需要增加内存
 *     tags:
 *       - 活动中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: detailed
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否返回详细的缓存键信息
 *         example: true
 *       - in: query
 *         name: keyPattern
 *         schema:
 *           type: string
 *         description: 按键模式过滤统计
 *         example: "activity_*"
 *     responses:
 *       200:
 *         description: 缓存统计获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CacheStats'
 *                 message:
 *                   type: string
 *                   example: "缓存统计获取成功"
 *             example:
 *               success: true
 *               data:
 *                 totalKeys: 156
 *                 memoryUsage:
 *                   used: 52428800
 *                   total: 104857600
 *                   percentage: 50.0
 *                 hitRate: 85.6
 *                 missRate: 14.4
 *                 evictions: 12
 *                 averageTtl: 3600
 *                 oldestKey: "activity_stats_20231101"
 *                 oldestKeyAge: 2592000
 *               message: "缓存统计获取成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/cache/stats', ActivityCenterController.getCacheStats);

/**
 * @swagger
 * /api/centers/activity/cache/clear:
 *   post:
 *     summary: 清除活动中心缓存
 *     description: |
 *       清除活动中心的缓存数据，支持选择性清理和全部清理。
 *
 *       **清理类型：**
 *       - **全部清理**: 清除所有活动中心相关缓存
 *       - **选择性清理**: 按模式或类型清理特定缓存
 *       - **过期清理**: 仅清理过期的缓存项
 *
 *       **业务场景：**
 *       - 数据更新后强制刷新缓存
 *       - 解决缓存数据不一致问题
 *       - 释放内存空间
 *       - 系统维护后的缓存重置
 *
 *       **注意事项：**
 *       - 清除后首次访问会较慢
 *       - 可能短暂影响系统性能
 *       - 建议在低峰期执行
 *       - 清理操作不可逆
 *     tags:
 *       - 活动中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clearAll
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否清除所有缓存
 *         example: true
 *       - in: query
 *         name: pattern
 *         schema:
 *           type: string
 *         description: 按键模式清除缓存（如：activity_*, template_*）
 *         example: "activity_stats_*"
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否强制清除（忽略锁保护）
 *         example: false
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 清除原因
 *                 example: "数据更新后刷新缓存"
 *               notifyAdmins:
 *                 type: boolean
 *                 description: 是否通知管理员
 *                 default: false
 *                 example: true
 *     responses:
 *       200:
 *         description: 缓存清除成功
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
 *                     clearedKeys:
 *                       type: integer
 *                       description: 清除的键数量
 *                       example: 45
 *                     freedMemory:
 *                       type: integer
 *                       description: 释放的内存（字节）
 *                       example: 15728640
 *                     clearedPatterns:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: 清除的键模式
 *                       example: ["activity_stats_*", "template_cache_*"]
 *                     duration:
 *                       type: number
 *                       format: float
 *                       description: 清理耗时（毫秒）
 *                       example: 125.5
 *                 message:
 *                   type: string
 *                   example: "缓存清除成功"
 *             example:
 *               success: true
 *               data:
 *                 clearedKeys: 45
 *                 freedMemory: 15728640
 *                 clearedPatterns: ["activity_stats_*", "template_cache_*"]
 *                 duration: 125.5
 *               message: "缓存清除成功"
 *       400:
 *         description: 请求参数错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "清除模式无效，请检查参数"
 *               code: 400
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/cache/clear', ActivityCenterController.clearCache);

export default router;