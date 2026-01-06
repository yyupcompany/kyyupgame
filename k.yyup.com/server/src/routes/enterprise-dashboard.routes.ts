/**
* @swagger
 * components:
 *   schemas:
 *     Enterprise-dashboard:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Enterprise-dashboard ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Enterprise-dashboard 名称
 *           example: "示例Enterprise-dashboard"
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
 *     CreateEnterprise-dashboardRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Enterprise-dashboard 名称
 *           example: "新Enterprise-dashboard"
 *     UpdateEnterprise-dashboardRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Enterprise-dashboard 名称
 *           example: "更新后的Enterprise-dashboard"
 *     Enterprise-dashboardListResponse:
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
 *                 $ref: '#/components/schemas/Enterprise-dashboard'
 *         message:
 *           type: string
 *           example: "获取enterprise-dashboard列表成功"
 *     Enterprise-dashboardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Enterprise-dashboard'
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
 * enterprise-dashboard管理路由文件
 * 提供enterprise-dashboard的基础CRUD操作
*
 * 功能包括：
 * - 获取enterprise-dashboard列表
 * - 创建新enterprise-dashboard
 * - 获取enterprise-dashboard详情
 * - 更新enterprise-dashboard信息
 * - 删除enterprise-dashboard
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { EnterpriseDashboardController } from '../controllers/enterprise-dashboard.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
 * 企业仪表盘路由
 * 基础路径: /api/enterprise-dashboard
*/

/**
* @swagger
 * /enterprise-dashboard/overview:
 *   get:
 *     summary: 获取企业仪表盘汇总数据
 *     description: 获取企业管理仪表盘的核心统计数据和汇总信息
 *     tags: [企业仪表盘]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取仪表盘数据成功
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
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalKindergartens:
 *                           type: integer
 *                           description: 总幼儿园数
 *                         totalTeachers:
 *                           type: integer
 *                           description: 总教师数
 *                         totalStudents:
 *                           type: integer
 *                           description: 总学生数
 *                         totalActivities:
 *                           type: integer
 *                           description: 总活动数
 *                     trends:
 *                       type: object
 *                       properties:
 *                         growthRate:
 *                           type: number
 *                           description: 增长率
 *                         monthlyData:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               month:
 *                                 type: string
 *                               value:
 *                                 type: number
 *                           description: 月度数据趋势
 *       401:
 *         description: 未认证
 *       403:
 *         description: 无权限访问
 *       500:
 *         description: 服务器错误
*/
router.get('/overview', EnterpriseDashboardController.getOverview);

export default router;

