/**
* @swagger
 * tags:
 *   - name: 通知中心
 *     description: 园长通知管理中心，提供通知统计、阅读跟踪、报告导出和消息推送功能
*
 * components:
 *   schemas:
 *     NotificationStatistics:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 通知ID
 *           example: 123
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "关于12月份活动安排的通知"
 *         type:
 *           type: string
 *           enum: [general, urgent, academic, activity, health, safety]
 *           description: 通知类型
 *           example: "activity"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: 优先级
 *           example: "medium"
 *         sentAt:
 *           type: string
 *           format: date-time
 *           description: 发送时间
 *           example: "2023-12-01T09:00:00Z"
 *         totalRecipients:
 *           type: integer
 *           description: 总接收人数
 *           example: 250
 *         readCount:
 *           type: integer
 *           description: 已读人数
 *           example: 180
 *         unreadCount:
 *           type: integer
 *           description: 未读人数
 *           example: 70
 *         readRate:
 *           type: number
 *           format: float
 *           description: 阅读率
 *           example: 72.0
 *         senderName:
 *           type: string
 *           description: 发送者姓名
 *           example: "张园长"
 *         status:
 *           type: string
 *           enum: [draft, sent, scheduled, cancelled]
 *           description: 通知状态
 *           example: "sent"
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *           enum: [app, sms, email, wechat]
 *           description: 发送渠道
 *           example: ["app", "sms"]
*
 *     NotificationOverview:
 *       type: object
 *       properties:
 *         totalNotifications:
 *           type: integer
 *           description: 总通知数
 *           example: 156
 *         sentNotifications:
 *           type: integer
 *           description: 已发送通知数
 *           example: 142
 *         scheduledNotifications:
 *           type: integer
 *           description: 定时通知数
 *           example: 8
 *         draftNotifications:
 *           type: integer
 *           description: 草稿通知数
 *           example: 6
 *         totalRecipients:
 *           type: integer
 *           description: 总接收人数
 *           example: 3580
 *         averageReadRate:
 *           type: number
 *           format: float
 *           description: 平均阅读率
 *           example: 78.5
 *         urgentNotifications:
 *           type: integer
 *           description: 紧急通知数
 *           example: 12
 *         todaysNotifications:
 *           type: integer
 *           description: 今日发送通知数
 *           example: 5
 *         notificationsByType:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "activity"
 *               count:
 *                 type: integer
 *                 example: 45
 *               readRate:
 *                 type: number
 *                 format: float
 *                 example: 82.5
 *           description: 按类型统计
 *         notificationsByPriority:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               priority:
 *                 type: string
 *                 example: "high"
 *               count:
 *                 type: integer
 *                 example: 28
 *               readRate:
 *                 type: number
 *                 format: float
 *                 example: 91.2
 *           description: 按优先级统计
*
 *     NotificationReader:
 *       type: object
 *       properties:
 *         userId:
 *           type: integer
 *           description: 用户ID
 *           example: 456
 *         userName:
 *           type: string
 *           description: 用户姓名
 *           example: "李老师"
 *         userRole:
 *           type: string
 *           enum: [teacher, parent, admin, principal]
 *           description: 用户角色
 *           example: "teacher"
 *         readAt:
 *           type: string
 *           format: date-time
 *           description: 阅读时间
 *           example: "2023-12-01T09:15:30Z"
 *         readDevice:
 *           type: string
 *           enum: [mobile, desktop, tablet]
 *           description: 阅读设备
 *           example: "mobile"
 *         readChannel:
 *           type: string
 *           enum: [app, sms, email, wechat]
 *           description: 阅读渠道
 *           example: "app"
 *         responseStatus:
 *           type: string
 *           enum: [read, acknowledged, confirmed, declined]
 *           description: 响应状态
 *           example: "acknowledged"
 *         responseComment:
 *           type: string
 *           description: 响应备注
 *           example: "已收到通知，会按时参加"
*
 *     CreateNotificationRequest:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           description: 通知标题
 *           example: "关于12月份活动安排的通知"
 *         content:
 *           type: string
 *           description: 通知内容
 *           example: "各位家长好，12月份我们将开展丰富多彩的活动..."
 *         type:
 *           type: string
 *           enum: [general, urgent, academic, activity, health, safety]
 *           description: 通知类型
 *           example: "activity"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           description: 优先级
 *           example: "medium"
 *         recipients:
 *           type: object
 *           properties:
 *             targetType:
 *               type: string
 *               enum: [all, role, class, individual, custom]
 *               description: 目标类型
 *               example: "class"
 *             targetIds:
 *               type: array
 *               items:
 *                 type: integer
 *               description: 目标ID列表
 *               example: [1, 2, 3]
 *             customFilters:
 *               type: object
 *               properties:
 *                 grade:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["小班", "中班"]
 *                 ageRange:
 *                   type: object
 *                   properties:
 *                     min:
 *                       type: integer
 *                       example: 3
 *                     max:
 *                       type: integer
 *                       example: 5
 *               description: 自定义过滤条件
 *           description: 接收人配置
 *         channels:
 *           type: array
 *           items:
 *             type: string
 *           enum: [app, sms, email, wechat]
 *           description: 发送渠道
 *           example: ["app", "sms"]
 *         scheduledAt:
 *           type: string
 *           format: date-time
 *           description: 定时发送时间
 *           example: "2023-12-01T18:00:00Z"
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "活动安排表.pdf"
 *               url:
 *                 type: string
 *                 example: "https://example.com/attachment.pdf"
 *               size:
 *                 type: integer
 *                 example: 1024576
 *           description: 附件列表
 *         requireConfirmation:
 *           type: boolean
 *           description: 是否需要确认
 *           default: false
 *           example: true
 *       required:
 *         - title
 *         - content
 *         - type
 *         - recipients
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
 *             error: "您没有权限执行此操作，需要园长或管理员权限"
 *             code: 403
*
 *     ValidationError:
 *       description: 请求参数验证失败
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             success: false
 *             error: "请求参数不完整或格式错误"
 *             code: 400
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

import { Router } from 'express';
import { notificationCenterController } from '../controllers/notification-center.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { requireRole } from '../middlewares/role.middleware';

const router = Router();

/**
 * 通知中心路由（园长专用）
 * 基础路径: /api/principal/notifications
*/

// 所有路由都需要认证和园长/管理员权限
router.use(verifyToken);
router.use(requireRole(['principal', 'admin']));

/**
* @swagger
 * /api/principal/notifications/statistics:
 *   get:
 *     summary: 获取通知统计列表
 *     description: |
 *       获取通知的详细统计列表，包含阅读率、发送状态等多维度数据分析。
*
 *       **统计维度：**
 *       - **基本信息**: 标题、类型、优先级、发送时间
 *       - **阅读统计**: 总接收人数、已读人数、未读人数、阅读率
 *       - **状态跟踪**: 发送状态、阅读渠道、响应情况
 *       - **发送渠道**: APP、短信、邮件、微信等多渠道统计
*
 *       **业务场景：**
 *       - 评估通知发送效果
 *       - 分析不同类型通知的阅读情况
 *       - 监控通知投递状态
 *       - 优化通知策略和内容
*
 *       **权限控制：**
 *       - 仅限园长和管理员访问
 *       - 支持按权限范围过滤数据
 *       - 敏感数据访问受控
 *     tags:
 *       - 通知中心
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
 *         description: 每页数量
 *         example: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [general, urgent, academic, activity, health, safety]
 *         description: 通知类型过滤
 *         example: "activity"
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: 优先级过滤
 *         example: "high"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, sent, scheduled, cancelled]
 *         description: 状态过滤
 *         example: "sent"
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期
 *         example: "2023-12-01T00:00:00Z"
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期
 *         example: "2023-12-31T23:59:59Z"
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索（标题或内容）
 *         example: "活动安排"
 *       - in: query
 *         name: minReadRate
 *         schema:
 *           type: number
 *           format: float
 *           minimum: 0
 *           maximum: 100
 *         description: 最低阅读率过滤
 *         example: 80.0
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [sentAt, readRate, totalRecipients, title]
 *           default: "sentAt"
 *         description: 排序字段
 *         example: "readRate"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: 排序顺序
 *         example: "desc"
 *     responses:
 *       200:
 *         description: 通知统计列表获取成功
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
 *                     notifications:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NotificationStatistics'
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
 *                           example: 156
 *                         totalPages:
 *                           type: integer
 *                           example: 8
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalCount:
 *                           type: integer
 *                           example: 156
 *                         averageReadRate:
 *                           type: number
 *                           format: float
 *                           example: 78.5
 *                         totalRecipients:
 *                           type: integer
 *                           example: 3580
 *                         highReadRateCount:
 *                           type: integer
 *                           example: 89
 *                 message:
 *                   type: string
 *                   example: "通知统计列表获取成功"
 *             example:
 *               success: true
 *               data:
 *                 notifications:
 *                   - id: 123
 *                     title: "关于12月份活动安排的通知"
 *                     type: "activity"
 *                     priority: "medium"
 *                     sentAt: "2023-12-01T09:00:00Z"
 *                     totalRecipients: 250
 *                     readCount: 180
 *                     unreadCount: 70
 *                     readRate: 72.0
 *                     senderName: "张园长"
 *                     status: "sent"
 *                     channels: ["app", "sms"]
 *                 pagination:
 *                   page: 1
 *                   pageSize: 20
 *                   total: 156
 *                   totalPages: 8
 *                 summary:
 *                   totalCount: 156
 *                   averageReadRate: 78.5
 *                   totalRecipients: 3580
 *                   highReadRateCount: 89
 *               message: "通知统计列表获取成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get(
  '/statistics',
  notificationCenterController.getNotificationStatistics.bind(notificationCenterController)
);

/**
* @swagger
 * /api/principal/notifications/overview:
 *   get:
 *     summary: 获取通知统计概览
 *     description: |
 *       获取通知中心的综合统计概览，提供关键指标的汇总数据。
*
 *       **概览内容：**
 *       - **总量统计**: 总通知数、已发送、草稿、定时等状态统计
 *       - **阅读分析**: 平均阅读率、接收人数、阅读趋势
 *       - **分类统计**: 按类型、优先级、状态等多维度分析
 *       - **时效分析**: 今日发送、紧急通知等时效性指标
*
 *       **业务场景：**
 *       - 园长管理首页仪表板展示
 *       - 快速了解通知运营状况
 *       - 发现通知系统使用趋势
 *       - 支持管理决策分析
*
 *       **数据特点：**
 *       - 实时计算汇总数据
 *       - 包含趋势对比信息
 *       - 支持不同维度交叉分析
 *       - 提供关键性能指标
 *     tags:
 *       - 通知中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [today, week, month, quarter]
 *           default: "month"
 *         description: 统计时间范围
 *         example: "month"
 *       - in: query
 *         name: includeTrends
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否包含趋势数据
 *         example: true
 *       - in: query
 *         name: compareWithPrevious
 *         schema:
 *           type: boolean
 *           default: false
 *         description: 是否与上期对比
 *         example: true
 *     responses:
 *       200:
 *         description: 通知统计概览获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NotificationOverview'
 *                 message:
 *                   type: string
 *                   example: "通知统计概览获取成功"
 *             example:
 *               success: true
 *               data:
 *                 totalNotifications: 156
 *                 sentNotifications: 142
 *                 scheduledNotifications: 8
 *                 draftNotifications: 6
 *                 totalRecipients: 3580
 *                 averageReadRate: 78.5
 *                 urgentNotifications: 12
 *                 todaysNotifications: 5
 *                 notificationsByType:
 *                   - type: "activity"
 *                     count: 45
 *                     readRate: 82.5
 *                   - type: "general"
 *                     count: 67
 *                     readRate: 75.2
 *                   - type: "urgent"
 *                     count: 12
 *                     readRate: 95.8
 *                 notificationsByPriority:
 *                   - priority: "high"
 *                     count: 28
 *                     readRate: 91.2
 *                   - priority: "medium"
 *                     count: 85
 *                     readRate: 79.6
 *                   - priority: "low"
 *                     count: 43
 *                     readRate: 65.4
 *               message: "通知统计概览获取成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get(
  '/overview',
  notificationCenterController.getNotificationOverview.bind(notificationCenterController)
);

/**
* @swagger
 * /api/principal/notifications/{notificationId}/readers:
 *   get:
 *     summary: 获取通知阅读详情
 *     description: |
 *       获取指定通知的阅读者详细信息，包括阅读时间、设备、渠道等数据。
*
 *       **阅读者信息：**
 *       - **基本信息**: 用户ID、姓名、角色
 *       - **阅读记录**: 阅读时间、设备类型、阅读渠道
 *       - **响应状态**: 已读、已确认、已接受、已拒绝等
 *       - **反馈信息**: 用户备注、响应内容
*
 *       **业务场景：**
 *       - 跟踪通知阅读情况
 *       - 分析不同用户群体的阅读习惯
 *       - 评估通知投递效果
 *       - 收集用户反馈和建议
*
 *       **数据分析：**
 *       - 阅读时间分布分析
 *       - 设备和渠道使用统计
 *       - 响应率统计
 *       - 用户行为模式分析
 *     tags:
 *       - 通知中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 123
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [read, unread, acknowledged, confirmed, declined, all]
 *           default: "all"
 *         description: 阅读状态过滤
 *         example: "read"
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *           enum: [teacher, parent, admin, principal]
 *         description: 用户角色过滤
 *         example: "parent"
 *       - in: query
 *         name: readChannel
 *         schema:
 *           type: string
 *           enum: [app, sms, email, wechat]
 *         description: 阅读渠道过滤
 *         example: "app"
 *       - in: query
 *         name: readDevice
 *         schema:
 *           type: string
 *           enum: [mobile, desktop, tablet]
 *         description: 阅读设备过滤
 *         example: "mobile"
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
 *         description: 每页数量
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [readAt, userName, userRole, readDevice]
 *           default: "readAt"
 *         description: 排序字段
 *         example: "readAt"
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: 排序顺序
 *         example: "desc"
 *     responses:
 *       200:
 *         description: 通知阅读详情获取成功
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
 *                     notification:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 123
 *                         title:
 *                           type: string
 *                           example: "关于12月份活动安排的通知"
 *                         totalRecipients:
 *                           type: integer
 *                           example: 250
 *                     readers:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NotificationReader'
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
 *                           example: 180
 *                         totalPages:
 *                           type: integer
 *                           example: 9
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         readCount:
 *                           type: integer
 *                           example: 180
 *                         unreadCount:
 *                           type: integer
 *                           example: 70
 *                         acknowledgedCount:
 *                           type: integer
 *                           example: 45
 *                         confirmedCount:
 *                           type: integer
 *                           example: 120
 *                         declinedCount:
 *                           type: integer
 *                           example: 5
 *                         readRate:
 *                           type: number
 *                           format: float
 *                           example: 72.0
 *                         deviceDistribution:
 *                           type: object
 *                           properties:
 *                             mobile:
 *                               type: integer
 *                               example: 125
 *                             desktop:
 *                               type: integer
 *                               example: 40
 *                             tablet:
 *                               type: integer
 *                               example: 15
 *                         channelDistribution:
 *                           type: object
 *                           properties:
 *                             app:
 *                               type: integer
 *                               example: 150
 *                             sms:
 *                               type: integer
 *                               example: 20
 *                             email:
 *                               type: integer
 *                               example: 8
 *                             wechat:
 *                               type: integer
 *                               example: 2
 *                 message:
 *                   type: string
 *                   example: "通知阅读详情获取成功"
 *             example:
 *               success: true
 *               data:
 *                 notification:
 *                   id: 123
 *                   title: "关于12月份活动安排的通知"
 *                   totalRecipients: 250
 *                 readers:
 *                   - userId: 456
 *                     userName: "李老师"
 *                     userRole: "teacher"
 *                     readAt: "2023-12-01T09:15:30Z"
 *                     readDevice: "mobile"
 *                     readChannel: "app"
 *                     responseStatus: "acknowledged"
 *                     responseComment: "已收到通知，会按时参加"
 *                 pagination:
 *                   page: 1
 *                   pageSize: 20
 *                   total: 180
 *                   totalPages: 9
 *                 statistics:
 *                   readCount: 180
 *                   unreadCount: 70
 *                   acknowledgedCount: 45
 *                   confirmedCount: 120
 *                   declinedCount: 5
 *                   readRate: 72.0
 *                   deviceDistribution:
 *                     mobile: 125
 *                     desktop: 40
 *                     tablet: 15
 *                   channelDistribution:
 *                     app: 150
 *                     sms: 20
 *                     email: 8
 *                     wechat: 2
 *               message: "通知阅读详情获取成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "指定的通知不存在"
 *               code: 404
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get(
  '/:notificationId/readers',
  notificationCenterController.getNotificationReaders.bind(notificationCenterController)
);

/**
* @swagger
 * /api/principal/notifications/{notificationId}/export:
 *   post:
 *     summary: 导出通知阅读报告
 *     description: |
 *       导出指定通知的详细阅读报告，支持多种格式导出。
*
 *       **报告内容：**
 *       - 通知基本信息
 *       - 阅读者详细列表
 *       - 阅读统计分析
 *       - 设备和渠道分布
 *       - 响应情况汇总
*
 *       **导出格式：**
 *       - Excel: 详细数据表格
 *       - PDF: 图文并茂报告
 *       - CSV: 纯数据格式
 *     tags:
 *       - 通知中心
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 通知ID
 *         example: 123
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [excel, pdf, csv]
 *                 default: "excel"
 *                 description: 导出格式
 *                 example: "excel"
 *               includeStatistics:
 *                 type: boolean
 *                 default: true
 *                 description: 是否包含统计图表
 *                 example: true
 *               includeDetails:
 *                 type: boolean
 *                 default: true
 *                 description: 是否包含详细读者列表
 *                 example: true
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date-time
 *                   end:
 *                     type: string
 *                     format: date-time
 *                 description: 导出时间范围
 *     responses:
 *       200:
 *         description: 报告导出成功
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
 *                     downloadUrl:
 *                       type: string
 *                       example: "https://example.com/downloads/notification_report_123.xlsx"
 *                     fileName:
 *                       type: string
 *                       example: "notification_report_123.xlsx"
 *                     fileSize:
 *                       type: integer
 *                       example: 2048576
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-02T09:00:00Z"
 *                 message:
 *                   type: string
 *                   example: "报告导出成功"
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         description: 通知不存在
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               error: "指定的通知不存在"
 *               code: 404
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.post(
  '/:notificationId/export',
  notificationCenterController.exportNotificationReport.bind(notificationCenterController)
);

/**
* @swagger
 * /api/principal/notifications:
 *   post:
 *     summary: 创建并发送通知
 *     description: |
 *       创建新的通知并发送给指定的接收人群体。
*
 *       **功能特点：**
 *       - 支持多种接收人选择方式
 *       - 多渠道同步发送
 *       - 定时发送功能
 *       - 附件支持
 *       - 阅读确认要求
*
 *       **接收人类型：**
 *       - all: 所有用户
 *       - role: 按角色选择
 *       - class: 按班级选择
 *       - individual: 指定个人
 *       - custom: 自定义条件
*
 *       **业务场景：**
 *       - 园所重要通知发布
 *       - 活动安排通知
 *       - 紧急情况通报
 *       - 节假日安排通知
*
 *       **发送渠道：**
 *       - APP内消息
 *       - 短信通知
 *       - 邮件发送
 *       - 微信推送
 *     tags:
 *       - 通知中心
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *           examples:
 *             activityNotification:
 *               summary: 活动通知
 *               value:
 *                 title: "关于12月份亲子活动安排的通知"
 *                 content: "各位家长好，12月份我们将举办丰富多彩的亲子活动..."
 *                 type: "activity"
 *                 priority: "medium"
 *                 recipients:
 *                   targetType: "all"
 *                 channels: ["app", "sms"]
 *                 requireConfirmation: true
 *             urgentNotification:
 *               summary: 紧急通知
 *               value:
 *                 title: "紧急停课通知"
 *                 content: "因天气原因，今日下午课程暂停..."
 *                 type: "urgent"
 *                 priority: "urgent"
 *                 recipients:
 *                   targetType: "all"
 *                 channels: ["app", "sms", "wechat"]
 *                 requireConfirmation: true
 *     responses:
 *       201:
 *         description: 通知创建成功
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
 *                     notificationId:
 *                       type: integer
 *                       example: 124
 *                     status:
 *                       type: string
 *                       enum: [draft, sent, scheduled, cancelled]
 *                       example: "sent"
 *                     totalRecipients:
 *                       type: integer
 *                       example: 250
 *                     scheduledRecipients:
 *                       type: integer
 *                       example: 0
 *                     sentChannels:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["app", "sms"]
 *                     estimatedDeliveryTime:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-12-01T09:05:00Z"
 *                 message:
 *                   type: string
 *                   example: "通知创建成功，开始发送"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.post(
  '/',
  notificationCenterController.createAndSendNotification.bind(notificationCenterController)
);

export default router;

