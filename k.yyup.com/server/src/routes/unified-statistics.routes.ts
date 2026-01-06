/**
* @swagger
 * components:
 *   schemas:
 *     Unified-statistic:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Unified-statistic ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Unified-statistic 名称
 *           example: "示例Unified-statistic"
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
 *     CreateUnified-statisticRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Unified-statistic 名称
 *           example: "新Unified-statistic"
 *     UpdateUnified-statisticRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Unified-statistic 名称
 *           example: "更新后的Unified-statistic"
 *     Unified-statisticListResponse:
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
 *                 $ref: '#/components/schemas/Unified-statistic'
 *         message:
 *           type: string
 *           example: "获取unified-statistic列表成功"
 *     Unified-statisticResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Unified-statistic'
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
 * unified-statistic管理路由文件
 * 提供unified-statistic的基础CRUD操作
*
 * 功能包括：
 * - 获取unified-statistic列表
 * - 创建新unified-statistic
 * - 获取unified-statistic详情
 * - 更新unified-statistic信息
 * - 删除unified-statistic
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 统一统计API路由
 * 整合所有分散的统计功能到一个统一的接口
* @swagger
 * tags:
 *   - name: UnifiedStatistics
 *     description: 统一统计分析API
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { RequestWithUser } from '../types/express';
import { sequelize } from '../init';
import { QueryTypes, Op } from 'sequelize';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/statistics:
 *   get:
 *     summary: 获取统计数据
 *     description: 统一的统计数据接口，支持多模块查询
 *     tags: [UnifiedStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: module
 *         required: true
 *         description: 统计模块
 *         schema:
 *           type: string
 *           enum: [enrollment, activities, dashboard, class, teacher, student, marketing, ai, system]
 *       - in: query
 *         name: type
 *         required: false
 *         description: 统计类型
 *         schema:
 *           type: string
 *           enum: [overview, trend, summary, detailed, comparison]
 *       - in: query
 *         name: period
 *         required: false
 *         description: 统计周期
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *       - in: query
 *         name: startDate
 *         required: false
 *         description: 开始日期
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         required: false
 *         description: 结束日期
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: 统计数据获取成功
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
 *                   description: 统计数据，结构根据模块和类型动态变化
 *                 message:
 *                   type: string
 *                   example: 统计数据获取成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器错误
*/
router.get('/', async (req: RequestWithUser, res) => {
  try {
    // 处理前端发送的params格式参数
    // 前端发送的是 params[module]=activities 格式，需要从 req.query.params 中获取
    const params = req.query.params as any || {};
    const module = req.query.module || params.module;
    const type = req.query.type || params.type || 'overview';
    const period = req.query.period || params.period || 'monthly';
    const startDate = req.query.startDate || params.startDate;
    const endDate = req.query.endDate || params.endDate;

    // 添加调试日志
    console.log('统计API参数解析:', {
      module,
      type,
      period,
      startDate,
      endDate,
      params,
      queryKeys: Object.keys(req.query),
      query: req.query
    });

    if (!module) {
      console.log('[STATISTIC]: 模块参数缺失，返回400错误');
      return ApiResponse.error(res, '缺少必需的模块参数', 'BAD_REQUEST', 400);
    }

    // 根据模块和类型分发到不同的统计处理函数
    const statisticsData = await getModuleStatistics(
      module as string, 
      type as string, 
      period as string,
      startDate as string,
      endDate as string,
      req.user
    );

    return ApiResponse.success(res, statisticsData, '统计数据获取成功');
  } catch (error) {
    console.error('[STATISTIC]: 获取统计数据失败:', error);
    return ApiResponse.error(res, '获取统计数据失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/statistics/comparison:
 *   get:
 *     summary: 获取对比统计数据
 *     description: 支持多模块、多时间段的对比分析
 *     tags: [UnifiedStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: modules
 *         required: true
 *         description: 对比模块（逗号分隔）
 *         schema:
 *           type: string
 *           example: "enrollment,activities,marketing"
 *       - in: query
 *         name: metric
 *         required: true
 *         description: 对比指标
 *         schema:
 *           type: string
 *           enum: [count, growth, conversion, satisfaction]
 *       - in: query
 *         name: period
 *         required: false
 *         description: 统计周期
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly, yearly]
 *           default: monthly
 *     responses:
 *       200:
 *         description: 对比统计数据获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     comparison:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           module:
 *                             type: string
 *                           value:
 *                             type: number
 *                           change:
 *                             type: number
 *                           trend:
 *                             type: string
*/
router.get('/comparison', async (req: RequestWithUser, res) => {
  try {
    const { modules, metric, period = 'monthly' } = req.query;

    if (!modules || !metric) {
      return ApiResponse.error(res, '缺少必需的参数', 'BAD_REQUEST', 400);
    }

    const moduleList = (modules as string).split(',');
    const comparisonData = await getComparisonStatistics(
      moduleList, 
      metric as string, 
      period as string,
      req.user
    );

    return ApiResponse.success(res, { comparison: comparisonData }, '对比统计数据获取成功');
  } catch (error) {
    console.error('[STATISTIC]: 获取对比统计数据失败:', error);
    return ApiResponse.error(res, '获取对比统计数据失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/statistics/dashboard:
 *   get:
 *     summary: 获取仪表板统计数据
 *     description: 获取适用于仪表板显示的关键统计指标
 *     tags: [UnifiedStatistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: role
 *         required: false
 *         description: 用户角色（自动从token获取）
 *         schema:
 *           type: string
 *           enum: [admin, principal, teacher, parent]
 *     responses:
 *       200:
 *         description: 仪表板统计数据获取成功
*/
router.get('/dashboard', async (req: RequestWithUser, res) => {
  try {
    const role = req.user?.role || 'admin';
    const dashboardData = await getDashboardStatistics(role, req.user);

    return ApiResponse.success(res, dashboardData, '仪表板统计数据获取成功');
  } catch (error) {
    console.error('[STATISTIC]: 获取仪表板统计数据失败:', error);
    return ApiResponse.error(res, '获取仪表板统计数据失败', 'INTERNAL_ERROR', 500);
  }
});

// 统计处理函数
async function getModuleStatistics(
  module: string, 
  type: string, 
  period: string,
  startDate?: string,
  endDate?: string,
  user?: any
) {
  // 根据模块分发到对应的统计逻辑
  switch (module) {
    case 'enrollment':
      return getEnrollmentStatistics(type, period, startDate, endDate);
    case 'activities':
      return getActivitiesStatistics(type, period, startDate, endDate);
    case 'dashboard':
      return getDashboardModuleStatistics(type, period, user);
    case 'class':
      return getClassStatistics(type, period, startDate, endDate);
    case 'teacher':
      return getTeacherStatistics(type, period, startDate, endDate);
    case 'student':
      return getStudentStatistics(type, period, startDate, endDate);
    case 'marketing':
      return getMarketingStatistics(type, period, startDate, endDate);
    case 'ai':
      return getAiStatistics(type, period, startDate, endDate);
    case 'system':
      return getSystemStatistics(type, period, startDate, endDate);
    default:
      throw new Error(`不支持的统计模块: ${module}`);
  }
}

// 具体的统计实现函数（示例）
async function getEnrollmentStatistics(type: string, period: string, startDate?: string, endDate?: string) {
  // 招生统计逻辑
  switch (type) {
    case 'overview':
      return {
        totalApplications: 245,
        approvedApplications: 198,
        pendingApplications: 47,
        conversionRate: 0.81,
        period
      };
    case 'trend':
      return {
        trends: [
          { date: '2024-01', applications: 45, approved: 38 },
          { date: '2024-02', applications: 52, approved: 41 },
          { date: '2024-03', applications: 48, approved: 39 }
        ],
        period
      };
    default:
      return { message: `招生统计类型 ${type} 的详细实现待添加` };
  }
}

async function getActivitiesStatistics(type: string, period: string, startDate?: string, endDate?: string) {
  // 活动统计逻辑 - 查询真实的activities表数据
  try {
    const tenantDb = 'tenant_dev'; // 默认租户数据库，这个函数是内部调用，无法从请求获取租户信息

    // 构建查询条件
    const whereClause: any = {};

    if (startDate && endDate) {
      whereClause.startTime = {
        [Op.between]: [startDate, endDate]
      };
    }

    // 根据统计类型返回不同数据
    switch (type) {
      case 'overview':
        // 获取活动概览统计
        const [overviewStats] = await sequelize.query(`
          SELECT
            COUNT(*) as totalActivities,
            SUM(CASE WHEN status = 1 THEN 1 ELSE 0 END) as ongoingActivities,
            SUM(CASE WHEN status = 2 THEN 1 ELSE 0 END) as completedActivities,
            SUM(registered_count) as totalRegistrations,
            AVG(CASE WHEN registered_count > 0 THEN registered_count / capacity ELSE 0 END) as averageOccupancyRate
          FROM ${tenantDb}.activities
          WHERE deleted_at IS NULL
          ${startDate ? `AND start_time >= '${startDate}'` : ''}
          ${endDate ? `AND end_time <= '${endDate}'` : ''}
        `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

        // 获取平均评分
        const [ratingStats] = await sequelize.query(`
          SELECT AVG(overall_rating) as averageRating
          FROM ${tenantDb}.activity_evaluations ae
          JOIN ${tenantDb}.activities a ON ae.activity_id = a.id
          WHERE ae.deleted_at IS NULL AND a.deleted_at IS NULL
          ${startDate ? `AND a.start_time >= '${startDate}'` : ''}
          ${endDate ? `AND a.end_time <= '${endDate}'` : ''}
        `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

        // 修复：Sequelize查询返回的是数组，需要取第一个元素
        const stats = (Array.isArray(overviewStats) ? overviewStats[0] : overviewStats) || {};
        const rating = (Array.isArray(ratingStats) ? ratingStats[0] : ratingStats) || {};

        return {
          totalActivities: parseInt(stats.totalActivities) || 0,
          ongoingActivities: parseInt(stats.ongoingActivities) || 0,
          completedActivities: parseInt(stats.completedActivities) || 0,
          totalRegistrations: parseInt(stats.totalRegistrations) || 0,
          averageRating: parseFloat(rating.averageRating) || 0,
          averageOccupancyRate: parseFloat(stats.averageOccupancyRate) || 0,
          period
        };

      case 'participation':
        // 获取参与度分析
        const [participationStats] = await sequelize.query(`
          SELECT
            a.id,
            a.title,
            a.capacity,
            a.registered_count,
            a.checked_in_count,
            ROUND(a.registered_count / a.capacity * 100, 2) as registrationRate,
            ROUND(a.checked_in_count / a.registered_count * 100, 2) as attendanceRate
          FROM ${tenantDb}.activities a
          WHERE a.deleted_at IS NULL
          ${startDate ? `AND a.start_time >= '${startDate}'` : ''}
          ${endDate ? `AND a.end_time <= '${endDate}'` : ''}
          ORDER BY a.start_time DESC
          LIMIT 10
        `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

        return {
          participationData: participationStats || [],
          period
        };

      case 'satisfaction':
        // 获取满意度分析
        const [satisfactionStats] = await sequelize.query(`
          SELECT
            a.title,
            AVG(ae.overall_rating) as averageRating,
            COUNT(ae.id) as evaluationCount,
            SUM(CASE WHEN ae.overall_rating >= 4 THEN 1 ELSE 0 END) as positiveCount
          FROM ${tenantDb}.activities a
          LEFT JOIN ${tenantDb}.activity_evaluations ae ON a.id = ae.activity_id AND ae.deleted_at IS NULL
          WHERE a.deleted_at IS NULL
          ${startDate ? `AND a.start_time >= '${startDate}'` : ''}
          ${endDate ? `AND a.end_time <= '${endDate}'` : ''}
          GROUP BY a.id, a.title
          HAVING COUNT(ae.id) > 0
          ORDER BY averageRating DESC
          LIMIT 10
        `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

        return {
          satisfactionData: satisfactionStats || [],
          period
        };

      default:
        // 默认返回概览数据
        return await getActivitiesStatistics('overview', period, startDate, endDate);
    }
  } catch (error) {
    console.error('[STATISTIC]: 获取活动统计数据失败:', error);
    // 发生错误时返回空数据，不使用硬编码
    return {
      totalActivities: 0,
      ongoingActivities: 0,
      completedActivities: 0,
      totalRegistrations: 0,
      averageRating: 0,
      error: '数据查询失败',
      period
    };
  }
}

async function getDashboardModuleStatistics(type: string, period: string, user?: any) {
  // 仪表板模块统计
  return {
    keyMetrics: {
      users: 1250,
      revenue: 2850000,
      satisfaction: 4.7,
      growth: 0.12
    },
    period
  };
}

async function getClassStatistics(type: string, period: string, startDate?: string, endDate?: string) {
  // 班级统计逻辑
  return {
    totalClasses: 24,
    activeClasses: 22,
    averageClassSize: 25,
    occupancyRate: 0.92,
    period
  };
}

async function getTeacherStatistics(type: string, period: string, startDate?: string, endDate?: string) {
  // 教师统计逻辑
  return {
    totalTeachers: 80,
    activeTeachers: 78,
    averageExperience: 5.2,
    satisfactionScore: 4.5,
    period
  };
}

async function getStudentStatistics(type: string, period: string, startDate?: string, endDate?: string) {
  // 学生统计逻辑
  return {
    totalStudents: 1200,
    newStudents: 45,
    attendanceRate: 0.95,
    graduationRate: 0.98,
    period
  };
}

async function getMarketingStatistics(type: string, period: string, startDate?: string, endDate?: string) {
  // 营销统计逻辑
  return {
    campaigns: 15,
    activeCampaigns: 5,
    conversionRate: 0.23,
    roi: 3.4,
    period
  };
}

async function getAiStatistics(type: string, period: string, startDate?: string, endDate?: string) {
  // AI服务统计逻辑
  return {
    totalQueries: 2340,
    successfulQueries: 2195,
    averageResponseTime: 0.85,
    userSatisfaction: 4.3,
    period
  };
}

async function getSystemStatistics(type: string, period: string, startDate?: string, endDate?: string) {
  // 系统统计逻辑
  return {
    uptime: 0.999,
    responseTime: 0.65,
    errorRate: 0.001,
    activeUsers: 234,
    period
  };
}

async function getComparisonStatistics(modules: string[], metric: string, period: string, user?: any) {
  // 对比统计逻辑
  return modules.map(module => ({
    module,
    value: Math.floor(Math.random() * 1000) + 100,
    change: (Math.random() - 0.5) * 0.4,
    trend: Math.random() > 0.5 ? 'up' : 'down'
  }));
}

async function getDashboardStatistics(role: string, user?: any) {
  // 基于角色的仪表板统计
  const baseStats = {
    overview: {
      totalUsers: 1250,
      totalRevenue: 2850000,
      satisfaction: 4.7,
      growth: 0.12
    },
    charts: {
      enrollment: { trend: 'up', value: 245 },
      activities: { trend: 'up', value: 125 },
      revenue: { trend: 'up', value: 2850000 }
    }
  };

  // 根据角色调整数据
  switch (role) {
    case 'principal':
      return {
        ...baseStats,
        principalSpecific: {
          pendingApprovals: 12,
          urgentTasks: 3,
          staffMetrics: { satisfaction: 4.5, retention: 0.95 }
        }
      };
    case 'teacher':
      return {
        overview: {
          myClasses: 3,
          myStudents: 75,
          todayActivities: 2,
          pendingTasks: 5
        }
      };
    case 'parent':
      return {
        overview: {
          myChildren: 2,
          upcomingActivities: 3,
          notifications: 1,
          payments: { due: 0, completed: 12 }
        }
      };
    default:
      return baseStats;
  }
}

export default router;