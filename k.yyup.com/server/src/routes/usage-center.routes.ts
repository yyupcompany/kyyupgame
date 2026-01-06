/**
* @swagger
 * components:
 *   schemas:
 *     Usage-center:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Usage-center ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Usage-center 名称
 *           example: "示例Usage-center"
 *         status:
 *           type: string
 *           description: 状态
 *           example: "active"
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *           example: "2024-01-01T00:00:00.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *           example: "2024-01-01T00:00:00.000Z"
 *     CreateUsage-centerRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Usage-center 名称
 *           example: "新Usage-center"
 *     UpdateUsage-centerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Usage-center 名称
 *           example: "更新后的Usage-center"
 *     Usage-centerListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           type: object
 *           properties:
 *             list:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Usage-center'
 *         message:
 *           type: string
 *           example: "获取usage-center列表成功"
 *     Usage-centerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Usage-center'
 *         message:
 *           type: string
 *           example: "操作成功"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "操作失败"
 *         code:
 *           type: string
 *           example: "INTERNAL_ERROR"
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

/**
 * usage-center管理路由文件
 * 提供usage-center的基础CRUD操作
*
 * 功能包括：
 * - 获取usage-center列表
 * - 创建新usage-center
 * - 获取usage-center详情
 * - 更新usage-center信息
 * - 删除usage-center
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 用量中心路由 - 用户使用量监控和管理
*/

import { Router } from 'express';
import { UsageCenterController } from '../controllers/usage-center.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @summary 获取用量中心概览统计
* @description 获取系统整体用量概览，包括总用户数、活跃用户、各服务使用情况等统计信息。主要用于管理员和园长查看系统整体使用状况。
* @tags UsageCenter - 用量中心管理
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} [query.timeRange] query optional 统计时间范围 - today:今日, week:本周, month:本月, quarter:本季度, year:今年
* @param {string} [query.serviceType] query optional 服务类型筛选 - ai:AI服务, storage:存储, bandwidth:带宽, all:全部
* @param {string} [query.departmentId] query optional 部门ID筛选（用于多园区管理）
* @responses {200} {object} Success_用量概览统计
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/overview', UsageCenterController.getOverview);

/**
* @summary 获取用户用量列表
* @description 分页获取系统中所有用户的用量统计列表，支持按多种条件筛选和排序。管理员可以查看所有用户的详细使用情况，便于进行用户管理和资源分配。
* @tags UsageCenter - 用量中心管理
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {integer} [query.page=1] query optional 页码（从1开始）
* @param {integer} [query.pageSize=20] query optional 每页记录数（1-100）
* @param {string} [query.search] query optional 用户搜索关键词（姓名、邮箱、手机号）
* @param {string} [query.role] query optional 用户角色筛选 - teacher:教师, parent:家长, student:学生, admin:管理员
* @param {string} [query.usageLevel] query optional 使用等级 - high:高用量, medium:中用量, low:低用量, inactive:未活跃
* @param {string} [query.sortBy=lastLoginAt] query optional 排序字段 - lastLoginAt:最后登录, usageAmount:使用量, createdAt:创建时间
* @param {string} [query.sortOrder=desc] query optional 排序方向 - asc:升序, desc:降序
* @param {string} [query.timeRange=month] query optional 统计时间范围
* @param {string} [query.serviceType] query optional 服务类型筛选
* @responses {200} {object} Success_用户用量列表
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/users', UsageCenterController.getUserUsageList);

/**
* @summary 获取用户详细用量
* @description 获取指定用户的详细用量信息，包括各类服务的具体使用数据、历史趋势、使用模式分析等。支持深度分析用户行为，为个性化服务提供数据支撑。
* @tags UsageCenter - 用量中心管理
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} userId.path.required 用户ID
* @param {string} [query.timeRange=month] query optional 统计时间范围
* @param {string} [query.serviceType] query optional 服务类型筛选
* @param {boolean} [query.includeDetails=false] query optional 是否包含详细使用记录
* @param {boolean} [query.includeTrends=true] query optional 是否包含使用趋势分析
* @param {string} [query.compareWith] query optional 对比时间范围 - previous:上一周期, lastYear:去年同期
* @responses {200} {object} Success_用户详细用量信息
* @responses {400} {object} Error_请求参数错误或用户ID无效
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {404} {object} Error_用户不存在
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/user/:userId/detail', UsageCenterController.getUserUsageDetail);

/**
* @summary 获取当前用户的用量统计
* @description 获取当前登录用户的个人用量统计信息，包括各服务的使用情况、剩余配额、使用建议等。帮助用户了解自己的资源使用状况，合理规划使用。
* @tags UsageCenter - 个人用量查询
* @access Private (All authenticated users)
* @security [{"bearerAuth": []}]
* @param {string} [query.timeRange=month] query optional 统计时间范围
* @param {string} [query.serviceType] query optional 服务类型筛选
* @param {boolean} [query.includeQuota=true] query optional 是否包含配额信息
* @param {boolean} [query.includeRecommendations=true] query optional 是否包含使用建议
* @param {string} [query.format] query optional 返回格式 - json:JSON格式, chart:图表格式
* @responses {200} {object} Success_个人用量统计
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/my-usage', UsageCenterController.getMyUsage);

/**
* @summary 获取AI模型使用统计
* @description 获取所有AI模型的使用情况统计，包括调用次数、Token消耗、平均响应时间、成本分析等。支持按时间范围和模型状态筛选。
* @tags UsageCenter - AI模型统计
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} [query.timeRange=month] query optional 统计时间范围 - today:今日, week:本周, month:本月, all:全部
* @param {string} [query.status=all] query optional 模型状态筛选 - all:全部, active:运行中, inactive:未激活
* @responses {200} {object} Success_AI模型统计列表
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/models', UsageCenterController.getAIModelStats);

/**
* @summary 获取Token消耗趋势
* @description 获取不同类型AI服务的Token消耗趋势数据，支持按时间范围查看历史趋势。包含文本、图像、视频三类服务的趋势对比和汇总统计。
* @tags UsageCenter - 趋势分析
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} [query.timeRange=week] query optional 统计时间范围 - today:今日, week:本周, month:本月, all:全部
* @param {string} [query.type] query optional 服务类型筛选 - text:文本, image:图像, video:视频
* @responses {200} {object} Success_趋势数据（包含标签、数据点、汇总统计）
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/trends', UsageCenterController.getTokenTrends);

/**
* @summary 获取用户或功能排行
* @description 获取用户用量排行或功能使用排行。用户排行显示Token消耗最多的用户列表，功能排行显示各AI功能的使用占比和趋势。
* @tags UsageCenter - 排行榜
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} [query.type=users] query optional 排行类型 - users:用户排行, features:功能排行
* @param {string} [query.timeRange=month] query optional 统计时间范围
* @param {integer} [query.limit=10] query optional 返回记录数量（1-50）
* @responses {200} {object} Success_排行数据（包含排名、名称、用量、趋势）
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/ranking', UsageCenterController.getUserRanking);

/**
* @summary 获取成本分布
* @description 获取不同AI服务类型的成本分布情况，包括文本生成、图像处理、视频分析等各类服务的成本占比和总额。
* @tags UsageCenter - 成本分析
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} [query.timeRange=month] query optional 统计时间范围
* @responses {200} {object} Success_成本分布数据（包含各类型成本和总成本）
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/cost-distribution', UsageCenterController.getCostDistribution);

/**
* @summary 刷新用量数据
* @description 手动触发用量数据的刷新，从统一租户中心同步最新的使用数据。通常用于确保显示最新数据。
* @tags UsageCenter - 数据管理
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @responses {200} {object} Success_刷新成功
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {503} {object} Error_统一租户中心服务不可用
* @responses {500} {object} Error_服务器内部错误
*/
router.post('/refresh', UsageCenterController.refreshUsageData);

/**
* @summary 导出用量报告
* @description 生成并导出AI用量统计报告，支持多种格式（Excel、CSV、PDF）。报告包含完整的用量统计、成本分析、趋势图表等内容。
* @tags UsageCenter - 报告导出
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} [body.format=xlsx] body optional 报告格式 - xlsx:Excel, csv:CSV, pdf:PDF
* @param {string} [body.timeRange=month] body optional 统计时间范围
* @responses {200} {object} Success_导出成功（包含下载链接和文件名）
* @responses {400} {object} Error_请求参数错误或格式不支持
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误或报告生成失败
*/
router.post('/export', UsageCenterController.exportUsageReport);

export default router;

