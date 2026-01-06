import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import * as os from 'os';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * components:
 *   schemas:
 *     PerformanceOverview:
 *       type: object
 *       properties:
 *         totalTeachers:
 *           type: integer
 *           description: 总教师数量
 *           example: 25
 *         totalEvaluations:
 *           type: integer
 *           description: 总评估数量
 *           example: 150
 *         averageScore:
 *           type: integer
 *           description: 平均分数
 *           example: 85
 *         distribution:
 *           type: object
 *           properties:
 *             excellent:
 *               type: integer
 *               description: 优秀数量 (90分以上)
 *               example: 45
 *             good:
 *               type: integer
 *               description: 良好数量 (80-89分)
 *               example: 60
 *             pass:
 *               type: integer
 *               description: 及格数量 (60-79分)
 *               example: 35
 *             fail:
 *               type: integer
 *               description: 不及格数量 (60分以下)
 *               example: 10
*     
 *     SystemMetrics:
 *       type: object
 *       properties:
 *         cpu:
 *           type: object
 *           properties:
 *             usage:
 *               type: object
 *               description: CPU使用情况
 *             loadAverage:
 *               type: array
 *               items:
 *                 type: number
 *               description: 系统负载平均值
 *               example: [0.5, 0.7, 0.8]
 *             cores:
 *               type: integer
 *               description: CPU核心数
 *               example: 4
 *         memory:
 *           type: object
 *           properties:
 *             total:
 *               type: integer
 *               description: 总内存 (字节)
 *               example: 8589934592
 *             free:
 *               type: integer
 *               description: 空闲内存 (字节)
 *               example: 2147483648
 *             used:
 *               type: integer
 *               description: 已使用内存 (字节)
 *               example: 6442450944
 *             usage:
 *               type: string
 *               description: 内存使用率
 *               example: "75.00%"
 *         uptime:
 *           type: object
 *           properties:
 *             system:
 *               type: number
 *               description: 系统运行时间 (秒)
 *               example: 3600
 *             process:
 *               type: number
 *               description: 进程运行时间 (秒)
 *               example: 1800
 *         platform:
 *           type: string
 *           description: 操作系统平台
 *           example: "linux"
 *         arch:
 *           type: string
 *           description: 系统架构
 *           example: "x64"
 *         hostname:
 *           type: string
 *           description: 主机名
 *           example: "server-01"
*     
 *     DatabasePerformance:
 *       type: object
 *       properties:
 *         connections:
 *           type: array
 *           items:
 *             type: object
 *           description: 数据库连接状态
 *         status:
 *           type: string
 *           description: 数据库状态
 *           example: "connected"
*/

/**
* @swagger
 * /api/performance:
 *   get:
 *     summary: 获取绩效概览
 *     description: 获取教师绩效评估的统计概览，包括总数、平均分和分数分布
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 绩效概览获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         overview:
 *                           $ref: '#/components/schemas/PerformanceOverview'
 *             example:
 *               success: true
 *               message: "获取成功"
 *               data:
 *                 overview:
 *                   totalTeachers: 25
 *                   totalEvaluations: 150
 *                   averageScore: 85
 *                   distribution:
 *                     excellent: 45
 *                     good: 60
 *                     pass: 35
 *                     fail: 10
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/', async (req, res) => {
  try {
    // 检查表是否存在，如果不存在则返回默认数据
    let performanceStats;
    try {
      [performanceStats] = await sequelize.query(
        `SELECT 
           COUNT(DISTINCT teacher_id) as total_teachers,
           AVG(score) as avg_score,
           COUNT(*) as total_evaluations,
           SUM(CASE WHEN score >= 90 THEN 1 ELSE 0 END) as excellent_count,
           SUM(CASE WHEN score >= 80 AND score < 90 THEN 1 ELSE 0 END) as good_count,
           SUM(CASE WHEN score >= 60 AND score < 80 THEN 1 ELSE 0 END) as pass_count,
           SUM(CASE WHEN score < 60 THEN 1 ELSE 0 END) as fail_count
         FROM performance_evaluations
         WHERE deleted_at IS NULL`,
        { type: QueryTypes.SELECT }
      );
    } catch (tableError) {
      // 表不存在时返回默认数据
      performanceStats = {
        total_teachers: 0,
        avg_score: 0,
        total_evaluations: 0,
        excellent_count: 0,
        good_count: 0,
        pass_count: 0,
        fail_count: 0
      };
    }

    const stats = performanceStats as any;
    
    return ApiResponse.success(res, {
      overview: {
        totalTeachers: stats.total_teachers || 0,
        totalEvaluations: stats.total_evaluations || 0,
        averageScore: Math.round(stats.avg_score || 0),
        distribution: {
          excellent: stats.excellent_count || 0,
          good: stats.good_count || 0,
          pass: stats.pass_count || 0,
          fail: stats.fail_count || 0
        }
      }
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取绩效概览失败');
  }
});

/**
* @swagger
 * /api/performance/metrics:
 *   get:
 *     summary: 获取系统性能指标
 *     description: 获取服务器的CPU、内存、运行时间等系统性能指标
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 系统性能指标获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/SystemMetrics'
 *             example:
 *               success: true
 *               message: "获取成功"
 *               data:
 *                 cpu:
 *                   usage:
 *                     user: 123456
 *                     system: 654321
 *                   loadAverage: [0.5, 0.7, 0.8]
 *                   cores: 4
 *                 memory:
 *                   total: 8589934592
 *                   free: 2147483648
 *                   used: 6442450944
 *                   usage: "75.00%"
 *                 uptime:
 *                   system: 3600
 *                   process: 1800
 *                 platform: "linux"
 *                 arch: "x64"
 *                 hostname: "server-01"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/metrics', async (req, res) => {
  try {
    const metrics = {
      cpu: {
        usage: process.cpuUsage(),
        loadAverage: os.loadavg(),
        cores: os.cpus().length
      },
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        used: os.totalmem() - os.freemem(),
        usage: ((os.totalmem() - os.freemem()) / os.totalmem() * 100).toFixed(2) + '%'
      },
      uptime: {
        system: os.uptime(),
        process: process.uptime()
      },
      platform: os.platform(),
      arch: os.arch(),
      hostname: os.hostname()
    };

    return ApiResponse.success(res, metrics);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取性能指标失败');
  }
});

/**
* @swagger
 * /api/performance/database:
 *   get:
 *     summary: 获取数据库性能
 *     description: 获取数据库连接状态和性能指标
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 数据库性能指标获取成功
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/DatabasePerformance'
 *             example:
 *               success: true
 *               message: "获取成功"
 *               data:
 *                 connections: [
 *                   {
 *                     "Variable_name": "Threads_connected",
 *                     "Value": "5"
 *                   }
 *                 ]
 *                 status: "connected"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/database', async (req, res) => {
  try {
    const dbStats = await sequelize.query(
      'SHOW STATUS LIKE "Threads_connected"',
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      connections: dbStats,
      status: 'connected'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取数据库性能失败');
  }
});

/**
* @swagger
 * /api/performance/api-stats:
 *   get:
 *     summary: 获取API响应时间统计
 *     description: 获取API接口的响应时间和调用统计信息（功能暂未实现）
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *             example:
 *               success: false
 *               message: "API统计功能暂未实现"
 *               error:
 *                 code: "NOT_IMPLEMENTED"
 *                 details: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/api-stats', async (req, res) => {
  try {
    return ApiResponse.error(res, 'API统计功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取API统计失败');
  }
});

/**
* @swagger
 * /api/performance/errors:
 *   get:
 *     summary: 获取错误日志统计
 *     description: 获取系统错误日志的统计信息（功能暂未实现）
 *     tags: [Performance]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 功能未实现
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiErrorResponse'
 *             example:
 *               success: false
 *               message: "错误统计功能暂未实现"
 *               error:
 *                 code: "NOT_IMPLEMENTED"
 *                 details: null
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/ServerError'
*/
router.get('/errors', async (req, res) => {
  try {
    return ApiResponse.error(res, '错误统计功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取错误统计失败');
  }
});

export default router; 