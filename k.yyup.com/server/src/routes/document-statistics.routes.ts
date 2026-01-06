/**
* @swagger
 * components:
 *   schemas:
 *     Document-statistic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Document-statistic ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Document-statistic 名称
 *           example: "示例Document-statistic"
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
 *     CreateDocument-statisticRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Document-statistic 名称
 *           example: "新Document-statistic"
 *     UpdateDocument-statisticRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Document-statistic 名称
 *           example: "更新后的Document-statistic"
 *     Document-statisticListResponse:
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
 *                 $ref: '#/components/schemas/Document-statistic'
 *         message:
 *           type: string
 *           example: "获取document-statistic列表成功"
 *     Document-statisticResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Document-statistic'
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
 * document-statistic管理路由文件
 * 提供document-statistic的基础CRUD操作
*
 * 功能包括：
 * - 获取document-statistic列表
 * - 创建新document-statistic
 * - 获取document-statistic详情
 * - 更新document-statistic信息
 * - 删除document-statistic
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { DocumentStatisticsController } from '../controllers/document-statistics.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
 * 文档统计分析相关路由
 * 基础路径: /api/document-statistics
*/

// 所有路由都需要认证
router.use(verifyToken);

/**
* @swagger
 * /document-statistics/overview:
 *   get:
 *     summary: 获取文档统计概览
 *     description: 获取文档使用的总体统计数据和关键指标
 *     tags: [文档统计]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取统计概览成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalDocuments:
 *                       type: integer
 *                       description: 总文档数
 *                     activeUsers:
 *                       type: integer
 *                       description: 活跃用户数
 *                     templateUsage:
 *                       type: object
 *                       description: 模板使用统计
 *                     recentActivity:
 *                       type: array
 *                       description: 最近活动
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/overview', DocumentStatisticsController.getOverview);

/**
* @swagger
 * /document-statistics/trends:
 *   get:
 *     summary: 获取使用趋势
 *     description: 获取文档使用的时间趋势数据和增长情况
 *     tags: [文档统计]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [week, month, quarter, year]
 *           default: month
 *         description: 统计周期
 *     responses:
 *       200:
 *         description: 获取趋势数据成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           count:
 *                             type: integer
 *                           growth:
 *                             type: number
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/trends', DocumentStatisticsController.getTrends);

/**
* @swagger
 * /document-statistics/template-ranking:
 *   get:
 *     summary: 获取模板使用排行
 *     description: 获取文档模板的使用频率排行数据
 *     tags: [文档统计]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回数量限制
 *     responses:
 *       200:
 *         description: 获取排行榜成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     rankings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           templateId:
 *                             type: integer
 *                           templateName:
 *                             type: string
 *                           usageCount:
 *                             type: integer
 *                           percentage:
 *                             type: number
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/template-ranking', DocumentStatisticsController.getTemplateRanking);

/**
* @swagger
 * /document-statistics/completion-rate:
 *   get:
 *     summary: 获取完成率统计
 *     description: 获取文档创建和编辑的完成率数据
 *     tags: [文档统计]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取完成率数据成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     overallCompletion:
 *                       type: number
 *                       description: 总体完成率
 *                     byCategory:
 *                       type: object
 *                       description: 按分类的完成率
 *                     abandonmentRate:
 *                       type: number
 *                       description: 放弃率
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/completion-rate', DocumentStatisticsController.getCompletionRate);

/**
* @swagger
 * /document-statistics/user-stats:
 *   get:
 *     summary: 获取用户统计
 *     description: 获取用户的文档使用行为统计数据
 *     tags: [文档统计]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 用户ID (可选，不填则当前用户)
 *     responses:
 *       200:
 *         description: 获取用户统计成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 200
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     documentCount:
 *                       type: integer
 *                       description: 文档数量
 *                     templatesUsed:
 *                       type: array
 *                       description: 使用的模板
 *                     activityLevel:
 *                       type: string
 *                       description: 活跃度等级
 *                     lastActive:
 *                       type: string
 *                       description: 最后活跃时间
 *       401:
 *         description: 未认证
 *       500:
 *         description: 服务器错误
*/
router.get('/user-stats', DocumentStatisticsController.getUserStats);

/**
* @swagger
 * /document-statistics/export:
 *   get:
 *     summary: 导出统计报表
 *     description: 导出文档统计报表为Excel或PDF格式
 *     tags: [文档统计]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [excel, pdf, csv]
 *           default: excel
 *         description: 导出格式
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: 结束日期
 *     responses:
 *       200:
 *         description: 导出成功
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       401:
 *         description: 未认证
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.get('/export', DocumentStatisticsController.exportReport);

export default router;

