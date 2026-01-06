/**
* @swagger
 * components:
 *   schemas:
 *     Usage-quota:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Usage-quota ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Usage-quota 名称
 *           example: "示例Usage-quota"
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
 *     CreateUsage-quotaRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Usage-quota 名称
 *           example: "新Usage-quota"
 *     UpdateUsage-quotaRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Usage-quota 名称
 *           example: "更新后的Usage-quota"
 *     Usage-quotaListResponse:
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
 *                 $ref: '#/components/schemas/Usage-quota'
 *         message:
 *           type: string
 *           example: "获取usage-quota列表成功"
 *     Usage-quotaResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Usage-quota'
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
 * usage-quota管理路由文件
 * 提供usage-quota的基础CRUD操作
*
 * 功能包括：
 * - 获取usage-quota列表
 * - 创建新usage-quota
 * - 获取usage-quota详情
 * - 更新usage-quota信息
 * - 删除usage-quota
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 用量配额路由 - 用户资源配额管理和监控
*/

import { Router } from 'express';
import { UsageQuotaController } from '../controllers/usage-quota.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @summary 获取用户配额信息
* @description 获取指定用户的详细配额信息，包括各类服务的配额限制、已使用量、剩余量、使用比例等。支持查看历史配额变更记录和使用趋势分析。
* @tags UsageQuota - 配额管理
* @access Private
* @security [{"bearerAuth": []}]
* @param {string} userId.path.required 用户ID
* @param {string} [query.quotaType] query optional 配额类型筛选 - ai:AI服务, storage:存储, bandwidth:带宽, api:API调用, all:全部
* @param {boolean} [query.includeHistory=false] query optional 是否包含历史变更记录
* @param {boolean} [query.includeUsage=true] query optional 是否包含使用详情
* @param {string} [query.timeRange=month] query optional 统计时间范围
* @responses {200} {object} Success_用户配额信息
* @responses {400} {object} Error_请求参数错误或用户ID无效
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足（只能查看自己的配额）
* @responses {404} {object} Error_用户不存在
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/user/:userId', UsageQuotaController.getUserQuota);

/**
* @summary 更新用户配额
* @description 更新指定用户的配额设置，包括增加/减少配额、设置配额规则、调整重置周期等。支持批量更新和即时生效。需要管理员权限。
* @tags UsageQuota - 配额管理
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} userId.path.required 用户ID
* @param {object} requestBody.body.required 配额更新数据
* @param {Array<object>} requestBody.body.quotas.required 配额规则列表
* @param {string} requestBody.body.quotas[].quotaType.required 配额类型 - ai, storage, bandwidth, api
* @param {number} requestBody.body.quotas[].limit.required 配额限制值
* @param {string} [requestBody.body.quotas[].unit] optional 配额单位 - times:次数, GB:存储大小, MB:带宽
* @param {string} [requestBody.body.quotas[].resetPeriod] optional 重置周期 - daily:每日, weekly:每周, monthly:每月, never:永不过期
* @param {number} [requestBody.body.quotas[].warningThreshold] optional 预警阈值百分比（0-100）
* @param {string} [requestBody.body.reason] optional 更新原因说明
* @param {boolean} [requestBody.body.immediateEffect=true] optional 是否立即生效
* @param {string} [requestBody.body.effectiveDate] optional 生效日期（延迟生效时使用）
* @responses {200} {object} Success_配额更新成功
* @responses {400} {object} Error_请求参数错误或配额值无效
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {404} {object} Error_用户不存在
* @responses {409} {object} Error_配额冲突（新配额小于已使用量）
* @responses {500} {object} Error_服务器内部错误
*/
router.put('/user/:userId', UsageQuotaController.updateUserQuota);

/**
* @summary 获取所有预警信息
* @description 获取系统中所有的配额预警信息，包括即将超限用户、已超限用户、配额使用异常等。支持按预警等级、用户类型、配额类型等条件筛选，帮助管理员提前发现和解决配额问题。
* @tags UsageQuota - 配额管理
* @access Private (Admin, Principal)
* @security [{"bearerAuth": []}]
* @param {string} [query.warningLevel] query optional 预警等级筛选 - critical:严重(>90%), warning:警告(>75%), notice:提醒(>50%), all:全部
* @param {string} [query.quotaType] query optional 配额类型筛选 - ai:AI服务, storage:存储, bandwidth:带宽, api:API调用, all:全部
* @param {string} [query.userRole] query optional 用户角色筛选 - teacher:教师, parent:家长, student:学生, all:全部
* @param {string} [query.status] query optional 预警状态 - active:活跃预警, resolved:已解决, ignored:已忽略, all:全部
* @param {integer} [query.page=1] query optional 页码（从1开始）
* @param {integer} [query.pageSize=20] query optional 每页记录数（1-100）
* @param {string} [query.sortBy=usagePercentage] query optional 排序字段 - usagePercentage:使用比例, exceededAt:超限时间, warningLevel:预警等级
* @param {string} [query.sortOrder=desc] query optional 排序方向 - asc:升序, desc:降序
* @param {boolean} [query.includeResolved=false] query optional 是否包含已解决的预警
* @responses {200} {object} Success_预警信息列表
* @responses {400} {object} Error_请求参数错误
* @responses {401} {object} Error_未授权访问
* @responses {403} {object} Error_权限不足
* @responses {500} {object} Error_服务器内部错误
*/
router.get('/warnings', UsageQuotaController.getWarnings);

export default router;

