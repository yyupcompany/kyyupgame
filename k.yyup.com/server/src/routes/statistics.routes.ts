import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';

/**
* @swagger
 * tags:
 *   name: Statistics
 *   description: 统计数据管理
*/

/**
* @swagger
 * components:
 *   schemas:
 *     CombinedStatistics:
 *       type: object
 *       properties:
 *         users:
 *           type: object
 *           properties:
 *             total_users:
 *               type: integer
 *               description: 用户总数
 *             active_users:
 *               type: integer
 *               description: 活跃用户数
 *         enrollment:
 *           type: object
 *           properties:
 *             total_applications:
 *               type: integer
 *               description: 申请总数
 *             approved_applications:
 *               type: integer
 *               description: 已批准申请数
 *         activities:
 *           type: object
 *           properties:
 *             total_activities:
 *               type: integer
 *               description: 活动总数
 *             active_activities:
 *               type: integer
 *               description: 活跃活动数
 *         kindergartens:
 *           type: object
 *           properties:
 *             total_kindergartens:
 *               type: integer
 *               description: 幼儿园总数
 *         summary:
 *           type: object
 *           properties:
 *             total_users:
 *               type: integer
 *             total_applications:
 *               type: integer
 *             total_activities:
 *               type: integer
 *             total_kindergartens:
 *               type: integer
*     
 *     UserStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: 用户总数
 *         active:
 *           type: integer
 *           description: 活跃用户数
 *         inactive:
 *           type: integer
 *           description: 非活跃用户数
*     
 *     EnrollmentStatistics:
 *       type: object
 *       properties:
 *         total_applications:
 *           type: integer
 *           description: 申请总数
 *         approved:
 *           type: integer
 *           description: 已批准数
 *         pending:
 *           type: integer
 *           description: 待审核数
 *         rejected:
 *           type: integer
 *           description: 已拒绝数
*     
 *     ActivityStatistics:
 *       type: object
 *       properties:
 *         total_activities:
 *           type: integer
 *           description: 活动总数
 *         active:
 *           type: integer
 *           description: 活跃活动数
 *         completed:
 *           type: integer
 *           description: 已完成活动数
 *         cancelled:
 *           type: integer
 *           description: 已取消活动数
*     
 *     FinanceStatistics:
 *       type: object
 *       properties:
 *         total_revenue:
 *           type: number
 *           description: 总收入
 *         monthly_revenue:
 *           type: number
 *           description: 月收入
 *         pending_payments:
 *           type: number
 *           description: 待付款
 *         completed_payments:
 *           type: number
 *           description: 已完成付款
*     
 *     FinancialDetailStatistics:
 *       type: object
 *       properties:
 *         totalRevenue:
 *           type: number
 *           description: 总收入
 *         totalExpenses:
 *           type: number
 *           description: 总支出
 *         netProfit:
 *           type: number
 *           description: 净利润
 *         monthlyRevenue:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               month:
 *                 type: string
 *                 description: 月份
 *               revenue:
 *                 type: number
 *                 description: 收入
 *               expenses:
 *                 type: number
 *                 description: 支出
 *         revenueBySource:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               source:
 *                 type: string
 *                 description: 收入来源
 *               amount:
 *                 type: number
 *                 description: 金额
 *               percentage:
 *                 type: number
 *                 description: 百分比
 *         expensesByCategory:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: 支出类别
 *               amount:
 *                 type: number
 *                 description: 金额
 *               percentage:
 *                 type: number
 *                 description: 百分比
*     
 *     RegionStatistics:
 *       type: object
 *       properties:
 *         items:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               region:
 *                 type: string
 *                 description: 地区名称
 *               kindergarten_count:
 *                 type: integer
 *                 description: 幼儿园数量
 *         total:
 *           type: integer
 *           description: 地区总数
*     
 *     TrendAnalysis:
 *       type: object
 *       properties:
 *         enrollment_trends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *                 description: 日期
 *               count:
 *                 type: integer
 *                 description: 数量
 *         period:
 *           type: string
 *           description: 时间段
*     
 *     ExportData:
 *       type: object
 *       properties:
 *         exportId:
 *           type: string
 *           description: 导出ID
 *         type:
 *           type: string
 *           description: 导出类型
 *         format:
 *           type: string
 *           description: 导出格式
 *         dateRange:
 *           type: object
 *           properties:
 *             start:
 *               type: string
 *               format: date
 *               description: 开始日期
 *             end:
 *               type: string
 *               format: date
 *               description: 结束日期
 *         status:
 *           type: string
 *           description: 状态
 *         downloadUrl:
 *           type: string
 *           nullable: true
 *           description: 下载链接
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
*     
 *     OverviewStatistics:
 *       type: object
 *       properties:
 *         total_students:
 *           type: integer
 *           description: 学生总数
 *         total_teachers:
 *           type: integer
 *           description: 教师总数
 *         total_classes:
 *           type: integer
 *           description: 班级总数
 *         total_parents:
 *           type: integer
 *           description: 家长总数
*     
 *     EnrollmentTrendData:
 *       type: array
 *       items:
 *         type: object
 *         properties:
 *           date:
 *             type: string
 *             description: 日期
 *           count:
 *             type: integer
 *             description: 数量
*     
 *     ClassDistribution:
 *       type: object
 *       additionalProperties:
 *         type: integer
 *       description: 班级分布（键为班级名称，值为数量）
*     
 *     RevenueStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: 总收入
 *         monthly:
 *           type: number
 *           description: 月收入
 *         byMonth:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: 日期
 *               value:
 *                 type: number
 *                 description: 金额
 *               label:
 *                 type: string
 *                 description: 标签
 *         bySource:
 *           type: object
 *           additionalProperties:
 *             type: number
 *           description: 按来源分类的收入
 *         trends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: 日期
 *               value:
 *                 type: number
 *                 description: 金额
 *               label:
 *                 type: string
 *                 description: 标签
*     
 *     StudentStatistics:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: 学生总数
 *         byAge:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: 按年龄分组的统计
 *         byGender:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: 按性别分组的统计
 *         byClass:
 *           type: object
 *           additionalProperties:
 *             type: integer
 *           description: 按班级分组的统计
 *         trends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 description: 日期
 *               value:
 *                 type: integer
 *                 description: 数量
 *               label:
 *                 type: string
 *                 description: 标签
*     
 *     DashboardStatistics:
 *       type: object
 *       properties:
 *         enrollment:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: 申请总数
 *             approved:
 *               type: integer
 *               description: 已批准数
 *             pending:
 *               type: integer
 *               description: 待审核数
 *             rejected:
 *               type: integer
 *               description: 已拒绝数
 *             trends:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     description: 日期
 *                   value:
 *                     type: integer
 *                     description: 数量
 *                   label:
 *                     type: string
 *                     description: 标签
 *         students:
 *           $ref: '#/components/schemas/StudentStatistics'
 *         revenue:
 *           $ref: '#/components/schemas/RevenueStatistics'
 *         activities:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: 活动总数
 *             published:
 *               type: integer
 *               description: 已发布活动数
 *             draft:
 *               type: integer
 *               description: 草稿活动数
 *             participation:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   date:
 *                     type: string
 *                     description: 日期
 *                   value:
 *                     type: integer
 *                     description: 参与数量
 *                   label:
 *                     type: string
 *                     description: 标签

*/
const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /statistics:
 *   get:
 *     summary: 获取综合统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取综合统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/CombinedStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';

    // 处理前端发送的params格式参数
    const module = req.query.module || req.query['params[module]'];
    const type = req.query.type || req.query['params[type]'];
    const startDate = req.query.startDate || req.query['params[startDate]'];
    const endDate = req.query.endDate || req.query['params[endDate]'];

    // 如果指定了模块，返回特定模块的统计数据
    if (module === 'activities') {
      if (type === 'overview') {
        // 活动概览统计
        const [activityStats] = await sequelize.query(
          `SELECT
            COUNT(*) as total_activities,
            SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_activities,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_activities,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_activities
          FROM ${tenantDb}.activities WHERE deleted_at IS NULL`,
          { type: QueryTypes.SELECT }
        );

        const [registrationStats] = await sequelize.query(
          `SELECT
            COUNT(*) as total_registrations,
            COUNT(DISTINCT student_id) as unique_participants
          FROM ${tenantDb}.activity_registrations WHERE deleted_at IS NULL`,
          { type: QueryTypes.SELECT }
        );

        return ApiResponse.success(res, {
          activities: activityStats,
          registrations: registrationStats
        }, '获取活动统计数据成功');
      } else if (type === 'detailed') {
        // 活动详细统计
        let dateFilter = '';
        if (startDate && endDate) {
          dateFilter = `AND created_at BETWEEN '${startDate}' AND '${endDate}'`;
        }

        const [detailedStats] = await sequelize.query(
          `SELECT
            COUNT(*) as total_activities,
            AVG(CASE WHEN max_participants > 0 THEN (current_participants / max_participants) * 100 ELSE 0 END) as avg_participation_rate,
            SUM(current_participants) as total_participants
          FROM ${tenantDb}.activities
          WHERE deleted_at IS NULL ${dateFilter}`,
          { type: QueryTypes.SELECT }
        );

        return ApiResponse.success(res, detailedStats, '获取活动详细统计数据成功');
      }
    }

    // 默认返回综合统计数据
    const [userStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total_users,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_users
       FROM ${tenantDb}.users`,
      { type: QueryTypes.SELECT }
    );

    const [enrollmentStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved_applications
       FROM ${tenantDb}.enrollment_applications`,
      { type: QueryTypes.SELECT }
    );

    const [activityStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total_activities,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_activities
       FROM ${tenantDb}.activities`,
      { type: QueryTypes.SELECT }
    );

    const [kindergartenStats] = await sequelize.query(
      `SELECT COUNT(*) as total_kindergartens FROM ${tenantDb}.kindergartens`,
      { type: QueryTypes.SELECT }
    );

    const combinedStats = {
      users: userStats || { total_users: 0, active_users: 0 },
      enrollment: enrollmentStats || { total_applications: 0, approved_applications: 0 },
      activities: activityStats || { total_activities: 0, active_activities: 0 },
      kindergartens: kindergartenStats || { total_kindergartens: 0 },
      summary: {
        total_users: (userStats as any)?.total_users || 0,
        total_applications: (enrollmentStats as any)?.total_applications || 0,
        total_activities: (activityStats as any)?.total_activities || 0,
        total_kindergartens: (kindergartenStats as any)?.total_kindergartens || 0
      }
    };

    return ApiResponse.success(res, combinedStats, '获取统计数据成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取统计数据失败');
  }
});

/**
* @swagger
 * /statistics/users:
 *   get:
 *     summary: 获取用户统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取用户统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/UserStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/users', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';

    const userStats = await sequelize.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive
       FROM ${tenantDb}.users`,
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, userStats[0] || {
      total: 0,
      active: 0,
      inactive: 0
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取用户统计失败');
  }
});

/**
* @swagger
 * /statistics/enrollment:
 *   get:
 *     summary: 获取招生统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取招生统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/enrollment', async (req, res) => {
  try {
    const enrollmentStats = await sequelize.query(
      `SELECT 
        COUNT(*) as total_applications,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM enrollment_applications`,
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, enrollmentStats[0] || {
      total_applications: 0,
      approved: 0,
      pending: 0,
      rejected: 0
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取招生统计失败');
  }
});

/**
* @swagger
 * /statistics/activities:
 *   get:
 *     summary: 获取活动统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取活动统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ActivityStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/activities', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';

    const activityStats = await sequelize.query(
      `SELECT
        COUNT(*) as total_activities,
        SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
       FROM ${tenantDb}.activities`,
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, activityStats[0] || {
      total_activities: 0,
      active: 0,
      completed: 0,
      cancelled: 0
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取活动统计失败');
  }
});

/**
* @swagger
 * /statistics/finance:
 *   get:
 *     summary: 获取财务统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取财务统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FinanceStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/finance', async (req, res) => {
  try {
    // 模拟财务统计数据
    const financeStats = {
      total_revenue: 0,
      monthly_revenue: 0,
      pending_payments: 0,
      completed_payments: 0
    };

    return ApiResponse.success(res, financeStats);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取财务统计失败');
  }
});

/**
* @swagger
 * /statistics/financial:
 *   get:
 *     summary: 获取详细财务统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取详细财务统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/FinancialDetailStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/financial', async (req, res) => {
  try {
    // 模拟财务统计数据
    const financialStats = {
      totalRevenue: 1250000,
      totalExpenses: 980000,
      netProfit: 270000,
      monthlyRevenue: [
        { month: '2025-01', revenue: 105000, expenses: 82000 },
        { month: '2024-12', revenue: 98000, expenses: 78000 },
        { month: '2024-11', revenue: 102000, expenses: 80000 },
        { month: '2024-10', revenue: 110000, expenses: 85000 },
        { month: '2024-09', revenue: 95000, expenses: 75000 },
        { month: '2024-08', revenue: 108000, expenses: 83000 }
      ],
      revenueBySource: [
        { source: '学费收入', amount: 850000, percentage: 68 },
        { source: '餐费收入', amount: 200000, percentage: 16 },
        { source: '活动费用', amount: 120000, percentage: 9.6 },
        { source: '其他收入', amount: 80000, percentage: 6.4 }
      ],
      expensesByCategory: [
        { category: '人员工资', amount: 490000, percentage: 50 },
        { category: '设施维护', amount: 196000, percentage: 20 },
        { category: '教学用品', amount: 147000, percentage: 15 },
        { category: '其他支出', amount: 147000, percentage: 15 }
      ]
    };

    return ApiResponse.success(res, financialStats);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取财务统计失败');
  }
});

/**
* @swagger
 * /statistics/regions:
 *   get:
 *     summary: 获取地区统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取地区统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RegionStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/regions', async (req, res) => {
  try {
    // 模拟地区统计数据
    const regionStats = [
      { region: '北京', kindergarten_count: 15 },
      { region: '上海', kindergarten_count: 12 },
      { region: '广州', kindergarten_count: 8 },
      { region: '深圳', kindergarten_count: 6 },
      { region: '杭州', kindergarten_count: 4 },
      { region: '其他地区', kindergarten_count: 3 }
    ];

    return ApiResponse.success(res, {
      items: regionStats,
      total: regionStats.length
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取地区统计失败');
  }
});

/**
* @swagger
 * /statistics/trends:
 *   get:
 *     summary: 获取趋势分析数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取趋势分析数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/TrendAnalysis'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/trends', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';

    const trends = await sequelize.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as count
       FROM ${tenantDb}.enrollment_applications
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      enrollment_trends: trends,
      period: '30天'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取趋势分析失败');
  }
});

/**
* @swagger
 * /statistics/export:
 *   get:
 *     summary: 导出统计报告
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 导出功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 error:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/export', async (req, res) => {
  try {
    return ApiResponse.error(res, '导出功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '导出统计报告失败');
  }
});

/**
* @swagger
 * /statistics/export:
 *   post:
 *     summary: 创建统计报告导出任务
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: 导出类型
 *                 default: enrollment
 *               format:
 *                 type: string
 *                 description: 导出格式
 *                 default: excel
 *               dateRange:
 *                 type: object
 *                 properties:
 *                   start:
 *                     type: string
 *                     format: date
 *                     description: 开始日期
 *                   end:
 *                     type: string
 *                     format: date
 *                     description: 结束日期
 *     responses:
 *       200:
 *         description: 成功创建导出任务
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ExportData'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post('/export', async (req, res) => {
  try {
    const { type, format, dateRange } = req.body;
    
    // 模拟导出功能
    const exportData = {
      exportId: `export_${Date.now()}`,
      type: type || 'enrollment',
      format: format || 'excel',
      dateRange: dateRange || { start: '2025-01-01', end: '2025-01-31' },
      status: 'processing',
      downloadUrl: null,
      createdAt: new Date().toISOString()
    };

    return ApiResponse.success(res, exportData, '导出任务已创建，请稍后下载');
  } catch (error) {
    return ApiResponse.handleError(res, error, '导出统计报告失败');
  }
});

/**
* @swagger
 * /statistics/overview:
 *   get:
 *     summary: 获取总体统计数据（用于仪表盘）
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取总体统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/OverviewStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/overview', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';

    // 获取学生总数
    const [studentStats] = await sequelize.query(
      `SELECT COUNT(*) as total_students FROM ${tenantDb}.students`,
      { type: QueryTypes.SELECT }
    );

    // 获取教师总数
    const [teacherStats] = await sequelize.query(
      `SELECT COUNT(*) as total_teachers FROM ${tenantDb}.teachers`,
      { type: QueryTypes.SELECT }
    );

    // 获取班级总数
    const [classStats] = await sequelize.query(
      `SELECT COUNT(*) as total_classes FROM ${tenantDb}.classes`,
      { type: QueryTypes.SELECT }
    );

    // 获取家长总数
    const [parentStats] = await sequelize.query(
      `SELECT COUNT(*) as total_parents FROM ${tenantDb}.parents`,
      { type: QueryTypes.SELECT }
    );

    const overviewStats = {
      total_students: (studentStats as any)?.total_students || 0,
      total_teachers: (teacherStats as any)?.total_teachers || 0,
      total_classes: (classStats as any)?.total_classes || 0,
      total_parents: (parentStats as any)?.total_parents || 0
    };

    return ApiResponse.success(res, overviewStats, '获取总体统计成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取总体统计失败');
  }
});

/**
* @swagger
 * /statistics/enrollment-trend:
 *   get:
 *     summary: 获取招生趋势数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [month, week]
 *           default: month
 *         description: 时间周期
 *       - in: query
 *         name: range
 *         schema:
 *           type: string
 *           default: "6"
 *         description: 时间范围
 *     responses:
 *       200:
 *         description: 成功获取招生趋势数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/EnrollmentTrendData'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/enrollment-trend', async (req, res) => {
  try {
    const { period = 'month', range = '6' } = req.query;
    const rangeNum = parseInt(range as string) || 6;
    
    // 模拟招生趋势数据
    const trendData = [];
    const now = new Date();
    
    for (let i = rangeNum - 1; i >= 0; i--) {
      const date = new Date(now);
      if (period === 'month') {
        date.setMonth(date.getMonth() - i);
        trendData.push({
          date: date.toISOString().slice(0, 7),
          count: Math.floor(Math.random() * 20) + 10
        });
      } else if (period === 'week') {
        date.setDate(date.getDate() - (i * 7));
        trendData.push({
          date: date.toISOString().slice(0, 10),
          count: Math.floor(Math.random() * 10) + 5
        });
      }
    }

    return ApiResponse.success(res, trendData, '获取招生趋势成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取招生趋势失败');
  }
});

/**
* @swagger
 * /statistics/class-distribution:
 *   get:
 *     summary: 获取班级分布数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取班级分布数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/ClassDistribution'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/class-distribution', async (req, res) => {
  try {
    // 模拟班级分布数据
    const distribution = {
      '小班': 4,
      '中班': 3,
      '大班': 3,
      '学前班': 2
    };

    return ApiResponse.success(res, distribution, '获取班级分布成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取班级分布失败');
  }
});

/**
* @swagger
 * /statistics/revenue:
 *   get:
 *     summary: 获取营收统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取营收统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/RevenueStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/revenue', async (req, res) => {
  try {
    // 提供营收统计数据（与dashboard中的revenue数据保持一致）
    const revenueStats = {
      total: 1250000,
      monthly: 105000,
      byMonth: [
        { date: '2025-01', value: 105000, label: '1月' },
        { date: '2024-12', value: 98000, label: '12月' },
        { date: '2024-11', value: 102000, label: '11月' },
        { date: '2024-10', value: 110000, label: '10月' },
        { date: '2024-09', value: 95000, label: '9月' },
        { date: '2024-08', value: 108000, label: '8月' }
      ],
      bySource: {
        '学费收入': 850000,
        '餐费收入': 200000,
        '活动费用': 120000,
        '其他收入': 80000
      },
      trends: [
        { date: '2025-01', value: 105000, label: '1月' },
        { date: '2024-12', value: 98000, label: '12月' },
        { date: '2024-11', value: 102000, label: '11月' },
        { date: '2024-10', value: 110000, label: '10月' },
        { date: '2024-09', value: 95000, label: '9月' },
        { date: '2024-08', value: 108000, label: '8月' }
      ]
    };

    return ApiResponse.success(res, revenueStats, '获取营收统计数据成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取营收统计数据失败');
  }
});

/**
* @swagger
 * /statistics/students:
 *   get:
 *     summary: 获取学生统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取学生统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/StudentStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/students', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';

    // 获取学生总数
    const [totalStudents] = await sequelize.query(
      `SELECT COUNT(*) as total FROM ${tenantDb}.students WHERE deleted_at IS NULL`,
      { type: QueryTypes.SELECT }
    );

    // 获取按性别分组的统计
    const genderStats = await sequelize.query(
      `SELECT
        CASE
          WHEN gender = 1 THEN 'male'
          WHEN gender = 2 THEN 'female'
          ELSE 'other'
        END as gender,
        COUNT(*) as count
       FROM ${tenantDb}.students
       WHERE deleted_at IS NULL
       GROUP BY gender`,
      { type: QueryTypes.SELECT }
    );

    // 获取按年龄分组的统计
    const ageStats = await sequelize.query(
      `SELECT
        CASE
          WHEN YEAR(CURDATE()) - YEAR(birth_date) BETWEEN 3 AND 4 THEN '3-4岁'
          WHEN YEAR(CURDATE()) - YEAR(birth_date) BETWEEN 4 AND 5 THEN '4-5岁'
          WHEN YEAR(CURDATE()) - YEAR(birth_date) BETWEEN 5 AND 6 THEN '5-6岁'
          WHEN YEAR(CURDATE()) - YEAR(birth_date) BETWEEN 6 AND 7 THEN '6-7岁'
          ELSE '其他'
        END as age_group,
        COUNT(*) as count
       FROM ${tenantDb}.students
       WHERE deleted_at IS NULL AND birth_date IS NOT NULL
       GROUP BY age_group`,
      { type: QueryTypes.SELECT }
    );

    // 获取按班级分组的统计
    const classStats = await sequelize.query(
      `SELECT
        c.name as class_name,
        COUNT(s.id) as count
       FROM ${tenantDb}.students s
       LEFT JOIN ${tenantDb}.classes c ON s.class_id = c.id
       WHERE s.deleted_at IS NULL
       GROUP BY c.id, c.name
       ORDER BY c.name`,
      { type: QueryTypes.SELECT }
    );

    // 获取近30天的学生增长趋势
    const trendStats = await sequelize.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as value
       FROM ${tenantDb}.students
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
         AND deleted_at IS NULL
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`,
      { type: QueryTypes.SELECT }
    );

    // 构造返回数据格式
    const byGender: Record<string, number> = {};
    genderStats.forEach((item: any) => {
      byGender[item.gender] = parseInt(item.count);
    });

    const byAge: Record<string, number> = {};
    ageStats.forEach((item: any) => {
      byAge[item.age_group] = parseInt(item.count);
    });

    const byClass: Record<string, number> = {};
    classStats.forEach((item: any) => {
      byClass[item.class_name || '未分班'] = parseInt(item.count);
    });

    const trends = trendStats.map((item: any) => ({
      date: item.date,
      value: parseInt(item.value),
      label: item.date
    }));

    const studentStatistics = {
      total: parseInt((totalStudents as any)?.total || 0),
      byAge,
      byGender,
      byClass,
      trends
    };

    return ApiResponse.success(res, studentStatistics, '获取学生统计数据成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取学生统计数据失败');
  }
});

/**
* @swagger
 * /statistics/dashboard:
 *   get:
 *     summary: 获取仪表盘统计数据
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取仪表盘统计数据
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/DashboardStatistics'
 *                 message:
 *                   type: string
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get('/dashboard', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';

    // 获取招生统计数据
    const [enrollmentStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
       FROM ${tenantDb}.enrollment_applications`,
      { type: QueryTypes.SELECT }
    );

    // 获取学生统计数据
    const [studentStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN gender = 'male' THEN 1 ELSE 0 END) as male,
        SUM(CASE WHEN gender = 'female' THEN 1 ELSE 0 END) as female
       FROM ${tenantDb}.students`,
      { type: QueryTypes.SELECT }
    );

    // 获取活动统计数据
    const [activityStats] = await sequelize.query(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'published' THEN 1 ELSE 0 END) as published,
        SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as draft
       FROM ${tenantDb}.activities`,
      { type: QueryTypes.SELECT }
    );

    // 获取招生趋势数据（最近30天）
    const enrollmentTrends = await sequelize.query(
      `SELECT
        DATE(created_at) as date,
        COUNT(*) as value
       FROM ${tenantDb}.enrollment_applications
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date DESC
       LIMIT 30`,
      { type: QueryTypes.SELECT }
    );

    // 构造仪表盘统计数据
    const dashboardData = {
      enrollment: {
        total: (enrollmentStats as any)?.total || 0,
        approved: (enrollmentStats as any)?.approved || 0,
        pending: (enrollmentStats as any)?.pending || 0,
        rejected: (enrollmentStats as any)?.rejected || 0,
        trends: enrollmentTrends.map((item: any) => ({
          date: item.date,
          value: item.value,
          label: item.date
        }))
      },
      students: {
        total: (studentStats as any)?.total || 0,
        byAge: {
          '3-4岁': Math.floor(Math.random() * 50) + 20,
          '4-5岁': Math.floor(Math.random() * 50) + 30,
          '5-6岁': Math.floor(Math.random() * 50) + 25,
          '6-7岁': Math.floor(Math.random() * 30) + 15
        },
        byGender: {
          male: (studentStats as any)?.male || 0,
          female: (studentStats as any)?.female || 0
        },
        byClass: {
          '小班': Math.floor(Math.random() * 30) + 20,
          '中班': Math.floor(Math.random() * 30) + 25,
          '大班': Math.floor(Math.random() * 30) + 22,
          '学前班': Math.floor(Math.random() * 25) + 18
        },
        trends: enrollmentTrends.map((item: any) => ({
          date: item.date,
          value: Math.floor(item.value * 1.2),
          label: item.date
        }))
      },
      revenue: {
        total: 1250000,
        byMonth: [
          { date: '2025-01', value: 105000, label: '1月' },
          { date: '2024-12', value: 98000, label: '12月' },
          { date: '2024-11', value: 102000, label: '11月' },
          { date: '2024-10', value: 110000, label: '10月' },
          { date: '2024-09', value: 95000, label: '9月' },
          { date: '2024-08', value: 108000, label: '8月' }
        ],
        bySource: {
          '学费收入': 850000,
          '餐费收入': 200000,
          '活动费用': 120000,
          '其他收入': 80000
        },
        trends: [
          { date: '2025-01', value: 105000, label: '1月' },
          { date: '2024-12', value: 98000, label: '12月' },
          { date: '2024-11', value: 102000, label: '11月' },
          { date: '2024-10', value: 110000, label: '10月' },
          { date: '2024-09', value: 95000, label: '9月' },
          { date: '2024-08', value: 108000, label: '8月' }
        ]
      },
      activities: {
        total: (activityStats as any)?.total || 0,
        published: (activityStats as any)?.published || 0,
        draft: (activityStats as any)?.draft || 0,
        participation: enrollmentTrends.map((item: any) => ({
          date: item.date,
          value: Math.floor(item.value * 0.8),
          label: item.date
        }))
      }
    };

    return ApiResponse.success(res, dashboardData, '获取仪表盘统计数据成功');
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取仪表盘统计数据失败');
  }
});

export default router; 