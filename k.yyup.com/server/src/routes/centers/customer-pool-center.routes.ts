/**
 * 客户池中心聚合API路由
 * 提供客户池管理的核心功能，包括客户资源管理、转化分析、渠道效果追踪等
 * 通过聚合API减少前端请求次数，提升用户体验和系统性能
 */

import { Router } from 'express';
import { CustomerPoolCenterController } from '../../controllers/centers/customer-pool-center.controller';
import { verifyToken } from '../../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要用户认证
router.use(verifyToken);

/**
 * @swagger
 * components:
 *   schemas:
 *     PoolStatistics:
 *       type: object
 *       description: 客户池统计数据
 *       properties:
 *         totalCustomers:
 *           type: integer
 *           description: 客户总数
 *           example: 1250
 *         activeCustomers:
 *           type: integer
 *           description: 活跃客户数
 *           example: 850
 *         potentialCustomers:
 *           type: integer
 *           description: 潜在客户数
 *           example: 320
 *         convertedCustomers:
 *           type: integer
 *           description: 已转化客户数
 *           example: 180
 *         conversionRate:
 *           type: number
 *           description: 转化率（%）
 *           example: 22.5
 *       required:
 *         - totalCustomers
 *         - activeCustomers
 *         - potentialCustomers
 *         - convertedCustomers
 *         - conversionRate

 *     CustomerPool:
 *       type: object
 *       description: 客户池信息
 *       properties:
 *         id:
 *           type: integer
 *           description: 客户池ID
 *           example: 1
 *         name:
 *           type: string
 *           description: 客户池名称
 *           example: "春季招生潜在客户"
 *         description:
 *           type: string
 *           description: 客户池描述
 *           example: "2025年春季招生收集的潜在客户信息"
 *         status:
 *           type: string
 *           description: 客户池状态
 *           enum: [active, inactive, archived]
 *           example: "active"
 *         customer_count:
 *           type: integer
 *           description: 客户数量
 *           example: 125
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2025-01-01T00:00:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2025-01-15T10:30:00.000Z"
 *       required:
 *         - id
 *         - name
 *         - status
 *         - customer_count

 *     RecentCustomer:
 *       type: object
 *       description: 最近客户信息
 *       properties:
 *         id:
 *           type: integer
 *           description: 客户ID
 *           example: 1234
 *         name:
 *           type: string
 *           description: 客户姓名
 *           example: "张小明"
 *         phone:
 *           type: string
 *           description: 联系电话
 *           example: "13800138000"
 *         email:
 *           type: string
 *           description: 邮箱地址
 *           example: "zhangxm@example.com"
 *         status:
 *           type: string
 *           description: 客户状态
 *           enum: [potential, active, converted, lost]
 *           example: "potential"
 *         source:
 *           type: string
 *           description: 客户来源
 *           example: "线上推广"
 *         pool_name:
 *           type: string
 *           description: 所属客户池名称
 *           example: "春季招生潜在客户"
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2025-01-15T10:30:00.000Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2025-01-16T14:20:00.000Z"
 *       required:
 *         - id
 *         - name
 *         - status
 *         - source

 *     ConversionAnalysis:
 *       type: object
 *       description: 转化分析数据
 *       properties:
 *         status:
 *           type: string
 *           description: 客户状态
 *           enum: [potential, active, converted, lost]
 *           example: "converted"
 *         count:
 *           type: integer
 *           description: 客户数量
 *           example: 180
 *         percentage:
 *           type: number
 *           description: 占比（%）
 *           example: 22.5
 *       required:
 *         - status
 *         - count
 *         - percentage

 *     ChannelAnalysis:
 *       type: object
 *       description: 渠道分析数据
 *       properties:
 *         channel:
 *           type: string
 *           description: 渠道名称
 *           example: "线上推广"
 *         customer_count:
 *           type: integer
 *           description: 客户数量
 *           example: 450
 *         converted_count:
 *           type: integer
 *           description: 转化客户数量
 *           example: 120
 *         conversion_rate:
 *           type: number
 *           description: 转化率（%）
 *           example: 26.7
 *       required:
 *         - channel
 *         - customer_count
 *         - converted_count
 *         - conversion_rate

 *     CustomerPoolDashboard:
 *       type: object
 *       description: 客户池中心仪表板数据
 *       properties:
 *         poolStatistics:
 *           $ref: '#/components/schemas/PoolStatistics'
 *         customerPools:
 *           type: object
 *           properties:
 *             data:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CustomerPool'
 *             pagination:
 *               type: object
 *               properties:
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 pageSize:
 *                   type: integer
 *                   example: 10
 *                 total:
 *                   type: integer
 *                   example: 8
 *         recentCustomers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RecentCustomer'
 *         conversionAnalysis:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ConversionAnalysis'
 *         channelAnalysis:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ChannelAnalysis'
 *         meta:
 *           type: object
 *           properties:
 *             userId:
 *               type: integer
 *               description: 用户ID
 *               example: 1
 *             userRole:
 *               type: string
 *               description: 用户角色
 *               example: "admin"
 *             responseTime:
 *               type: number
 *               description: 响应时间（毫秒）
 *               example: 156
 *             dataCount:
 *               type: object
 *               properties:
 *                 pools:
 *                   type: integer
 *                   description: 客户池数量
 *                   example: 8
 *                 customers:
 *                   type: integer
 *                   description: 客户数量
 *                   example: 10
 *                 channels:
 *                   type: integer
 *                   description: 渠道数量
 *                   example: 5
 *       required:
 *         - poolStatistics
 *         - customerPools
 *         - recentCustomers
 *         - conversionAnalysis
 *         - channelAnalysis
 *         - meta

 */

/**
 * @swagger
 * /api/centers/customer-pool/dashboard:
 *   get:
 *     summary: 获取客户池中心仪表板聚合数据
 *     description: |
 *       获取客户池中心首页所需的全部聚合数据，包括客户统计、客户池列表、
 *       最近客户、转化分析和渠道分析等。采用并行查询优化性能，减少前端请求次数。
 *
 *       **业务场景**：
 *       - 客户池中心首页数据展示
 *       - 客户管理仪表板
 *       - 招生效果分析
 *       - 渠道效果监控
 *
 *       **权限要求**：需要客户池管理权限
 *
 *       **数据内容**：
 *       1. **客户池统计数据**：总数、活跃、潜在、已转化客户及转化率
 *       2. **客户池列表**：分页显示客户池信息及客户数量
 *       3. **最近客户**：最新添加/更新的客户信息
 *       4. **转化分析**：按状态分组的客户转化情况
 *       5. **渠道分析**：各来源渠道的客户数量和转化效果
 *
 *       **性能优化**：
 *       - 并行执行5个查询任务
 *       - 返回响应时间统计
 *       - 数据计数元信息
 *
 *       **业务价值**：
 *       - 实时监控客户资源状况
 *       - 分析渠道投资回报率
 *       - 优化客户转化策略
 *       - 支持数据驱动决策
 *     tags: [客户池中心管理]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 客户池中心仪表板数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CustomerPoolDashboard'
 *                 message:
 *                   type: string
 *                   example: "客户池中心仪表板数据获取成功"
 *             examples:
 *               success_response:
 *                 summary: 成功响应示例
 *                 value:
 *                   success: true
 *                   data:
 *                     poolStatistics:
 *                       totalCustomers: 1250
 *                       activeCustomers: 850
 *                       potentialCustomers: 320
 *                       convertedCustomers: 180
 *                       conversionRate: 22.5
 *                     customerPools:
 *                       data:
 *                         - id: 1
 *                           name: "春季招生潜在客户"
 *                           description: "2025年春季招生收集的潜在客户信息"
 *                           status: "active"
 *                           customer_count: 125
 *                           created_at: "2025-01-01T00:00:00.000Z"
 *                           updated_at: "2025-01-15T10:30:00.000Z"
 *                         - id: 2
 *                           name: "开放日活动客户"
 *                           description: "校园开放日收集的意向客户"
 *                           status: "active"
 *                           customer_count: 85
 *                           created_at: "2025-01-08T00:00:00.000Z"
 *                           updated_at: "2025-01-14T16:45:00.000Z"
 *                       pagination:
 *                         page: 1
 *                         pageSize: 10
 *                         total: 8
 *                     recentCustomers:
 *                       - id: 1234
 *                         name: "张小明"
 *                         phone: "13800138000"
 *                         email: "zhangxm@example.com"
 *                         status: "potential"
 *                         source: "线上推广"
 *                         pool_name: "春季招生潜在客户"
 *                         created_at: "2025-01-15T10:30:00.000Z"
 *                         updated_at: "2025-01-16T14:20:00.000Z"
 *                       - id: 1235
 *                         name: "李小红"
 *                         phone: "13900139000"
 *                         email: "lixh@example.com"
 *                         status: "active"
 *                         source: "开放日活动"
 *                         pool_name: "开放日活动客户"
 *                         created_at: "2025-01-14T09:15:00.000Z"
 *                         updated_at: "2025-01-15T11:30:00.000Z"
 *                     conversionAnalysis:
 *                       - status: "potential"
 *                         count: 320
 *                         percentage: 40.0
 *                       - status: "active"
 *                         count: 300
 *                         percentage: 37.5
 *                       - status: "converted"
 *                         count: 180
 *                         percentage: 22.5
 *                       - status: "lost"
 *                         count: 0
 *                         percentage: 0.0
 *                     channelAnalysis:
 *                       - channel: "线上推广"
 *                         customer_count: 450
 *                         converted_count: 120
 *                         conversion_rate: 26.7
 *                       - channel: "开放日活动"
 *                         customer_count: 280
 *                         converted_count: 85
 *                         conversion_rate: 30.4
 *                       - channel: "地推宣传"
 *                         customer_count: 220
 *                         converted_count: 45
 *                         conversion_rate: 20.5
 *                       - channel: "老客户推荐"
 *                         customer_count: 180
 *                         converted_count: 95
 *                         conversion_rate: 52.8
 *                       - channel: "社区合作"
 *                         customer_count: 120
 *                         converted_count: 35
 *                         conversion_rate: 29.2
 *                     meta:
 *                       userId: 1
 *                       userRole: "admin"
 *                       responseTime: 156
 *                       dataCount:
 *                         pools: 8
 *                         customers: 10
 *                         channels: 5
 *                   message: "客户池中心仪表板数据获取成功"
 *       401:
 *         description: 未授权访问
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "未授权访问"
 *       403:
 *         description: 权限不足
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "权限不足"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "客户池中心仪表板数据获取失败"
 *                 error:
 *                   type: string
 *                   example: "数据库连接超时"
 */
router.get('/dashboard', CustomerPoolCenterController.getDashboard);

export default router;