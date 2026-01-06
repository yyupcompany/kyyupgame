/**
* @swagger
 * components:
 *   schemas:
 *     SystemInfo:
 *       type: object
 *       properties:
 *         nodeVersion:
 *           type: string
 *           description: Node.js版本
 *           example: "v18.17.0"
 *         platform:
 *           type: string
 *           description: 操作系统平台
 *           example: "linux"
 *         arch:
 *           type: string
 *           description: 系统架构
 *           example: "x64"
 *         uptime:
 *           type: number
 *           description: 系统运行时间（秒）
 *           example: 3600
 *         memory:
 *           type: object
 *           description: 内存使用情况
 *           properties:
 *             rss:
 *               type: number
 *             heapTotal:
 *               type: number
 *             heapUsed:
 *               type: number
 *             external:
 *               type: number
 *         cpuUsage:
 *           type: object
 *           description: CPU使用情况
 *           properties:
 *             user:
 *               type: number
 *             system:
 *               type: number
 *         environment:
 *           type: string
 *           description: 运行环境
 *           example: "development"
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 获取时间
*     
 *     LogEntry:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 日志ID
 *         level:
 *           type: string
 *           enum: [info, warn, error, debug]
 *           description: 日志级别
 *         message:
 *           type: string
 *           description: 日志消息
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: 日志时间
 *         module:
 *           type: string
 *           description: 日志模块
*     
 *     EnvironmentInfo:
 *       type: object
 *       properties:
 *         NODE_ENV:
 *           type: string
 *           description: 运行环境
 *         API_PREFIX:
 *           type: string
 *           description: API前缀
 *         PORT:
 *           type: string
 *           description: 端口号
 *         HOST:
 *           type: string
 *           description: 主机地址
 *         DB_HOST:
 *           type: string
 *           description: 数据库主机
 *         LOG_LEVEL:
 *           type: string
 *           description: 日志级别
 *         SKIP_AUTH:
 *           type: string
 *           description: 跳过认证
 *         MOCK_PERMISSIONS:
 *           type: string
 *           description: 模拟权限
*     
 *     DatabaseMetrics:
 *       type: object
 *       properties:
 *         totalQueries:
 *           type: number
 *           description: 总查询数
 *         slowQueries:
 *           type: number
 *           description: 慢查询数
 *         averageQueryTime:
 *           type: number
 *           description: 平均查询时间
 *         poolSize:
 *           type: number
 *           description: 连接池大小
 *         poolAvailable:
 *           type: number
 *           description: 可用连接数
*     
 *     TableStats:
 *       type: object
 *       properties:
 *         tableName:
 *           type: string
 *           description: 表名
 *         rowCount:
 *           type: number
 *           description: 行数
 *         size:
 *           type: string
 *           description: 表大小
*         
 *   tags:
 *     - name: Admin
 *       description: 系统管理API
*/

/**
 * 管理员路由
 * 包含系统管理员相关的API端点
*/
import express, { Request, Response } from 'express';
// 不再引入verifyToken
// import { verifyToken } from '../middlewares/auth.middleware';
import dbMonitor from '../utils/db-monitor';
import { logger } from '../utils/logger';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../init';
import { PermissionCacheController } from '../controllers/permission-cache.controller';
import { PermissionWatcherService } from '../services/permission-watcher.service';

// 创建路由实例
const router = express.Router();

/**
* @swagger
 * /admin/system-info:
 *   get:
 *     tags: [Admin]
 *     summary: 获取系统信息
 *     description: 获取服务器系统信息，包括Node.js版本、平台信息、内存使用情况等
 *     responses:
 *       200:
 *         description: 成功获取系统信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SystemInfo'
 *                 message:
 *                   type: string
 *                   example: "获取系统信息成功"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
// 获取系统信息
router.get('/system-info', function(req: Request, res: Response) {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      cpuUsage: process.cpuUsage(),
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString()
    };
    
    return res.json({
      success: true,
      data: systemInfo,
      message: '获取系统信息成功'
    });
  } catch (error) {
    logger.error('获取系统信息失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '获取系统信息失败'
      }
    });
  }
});

/**
* @swagger
 * /admin/logs:
 *   get:
 *     tags: [Admin]
 *     summary: 获取系统日志
 *     description: 获取系统日志，支持按级别过滤和限制数量
 *     parameters:
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error, debug, all]
 *           default: info
 *         description: 日志级别过滤
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *           default: 100
 *         description: 返回日志数量限制
 *     responses:
 *       200:
 *         description: 成功获取系统日志
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
 *                     logs:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/LogEntry'
 *                     total:
 *                       type: integer
 *                       description: 过滤后总数
 *                     level:
 *                       type: string
 *                       description: 当前过滤级别
 *                     limit:
 *                       type: integer
 *                       description: 限制数量
 *                 message:
 *                   type: string
 *                   example: "获取系统日志成功"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
// 获取系统日志
router.get('/logs', function(req: Request, res: Response) {
  try {
    const { level = 'info', limit = 100 } = req.query;
    
    // 模拟日志数据
    const logs = [
      {
        id: 1,
        level: 'info',
        message: '服务器启动成功',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        module: 'server'
      },
      {
        id: 2,
        level: 'info',
        message: '数据库连接成功',
        timestamp: new Date(Date.now() - 3500000).toISOString(),
        module: 'database'
      },
      {
        id: 3,
        level: 'warn',
        message: 'API请求频率较高',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        module: 'api'
      },
      {
        id: 4,
        level: 'error',
        message: '权限验证失败',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        module: 'auth'
      }
    ];
    
    // 根据级别过滤
    const filteredLogs = level === 'all' ? logs : logs.filter(log => log.level === level);
    
    // 限制数量
    const limitedLogs = filteredLogs.slice(0, Number(limit));
    
    return res.json({
      success: true,
      data: {
        logs: limitedLogs,
        total: filteredLogs.length,
        level,
        limit: Number(limit)
      },
      message: '获取系统日志成功'
    });
  } catch (error) {
    logger.error('获取系统日志失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '获取系统日志失败'
      }
    });
  }
});

/**
* @swagger
 * /admin/environment:
 *   get:
 *     tags: [Admin]
 *     summary: 获取环境配置
 *     description: 获取当前环境配置信息，包括环境变量等安全的配置信息
 *     responses:
 *       200:
 *         description: 成功获取环境信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/EnvironmentInfo'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
// 获取当前环境状态
router.get('/environment', function(req: Request, res: Response) {
  try {
    const envInfo = {
      NODE_ENV: process.env.NODE_ENV || 'development',
      // 返回其他安全的环境变量
      API_PREFIX: process.env.API_PREFIX,
      PORT: process.env.PORT,
      HOST: process.env.HOST,
      DB_HOST: process.env.DB_HOST,
      LOG_LEVEL: process.env.LOG_LEVEL,
      SKIP_AUTH: process.env.SKIP_AUTH,
      MOCK_PERMISSIONS: process.env.MOCK_PERMISSIONS
    };
    
    return res.json({
      success: true,
      data: envInfo
    });
  } catch (error) {
    logger.error('获取环境信息失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '获取环境信息失败'
      }
    });
  }
});

/**
* @swagger
 * /admin/environment:
 *   post:
 *     tags: [Admin]
 *     summary: 设置环境变量
 *     description: 临时设置环境变量（仅在内存中有效，服务器重启后恢复）
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               NODE_ENV:
 *                 type: string
 *                 enum: [development, production, test]
 *                 description: 运行环境
 *               SKIP_AUTH:
 *                 type: boolean
 *                 description: 是否跳过认证
 *               MOCK_PERMISSIONS:
 *                 type: boolean
 *                 description: 是否使用模拟权限
 *             example:
 *               NODE_ENV: "development"
 *               SKIP_AUTH: true
 *               MOCK_PERMISSIONS: true
 *     responses:
 *       200:
 *         description: 成功设置环境变量
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
 *                     NODE_ENV:
 *                       type: string
 *                     SKIP_AUTH:
 *                       type: string
 *                     MOCK_PERMISSIONS:
 *                       type: string
 *                     message:
 *                       type: string
 *                       example: "环境变量已设置（仅在内存中有效，服务器重启后将恢复）"
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
// 设置环境变量（仅内存中临时设置）
router.post('/environment', function(req: Request, res: Response) {
  try {
    const { NODE_ENV, SKIP_AUTH, MOCK_PERMISSIONS } = req.body;
    
    // 只允许设置特定的环境变量
    if (NODE_ENV) {
      process.env.NODE_ENV = NODE_ENV;
      logger.info(`已设置 NODE_ENV=${NODE_ENV}`);
    }
    
    if (SKIP_AUTH !== undefined) {
      process.env.SKIP_AUTH = SKIP_AUTH ? 'true' : 'false';
      logger.info(`已设置 SKIP_AUTH=${SKIP_AUTH}`);
    }
    
    if (MOCK_PERMISSIONS !== undefined) {
      process.env.MOCK_PERMISSIONS = MOCK_PERMISSIONS ? 'true' : 'false';
      logger.info(`已设置 MOCK_PERMISSIONS=${MOCK_PERMISSIONS}`);
    }
    
    return res.json({
      success: true,
      data: {
        NODE_ENV: process.env.NODE_ENV,
        SKIP_AUTH: process.env.SKIP_AUTH,
        MOCK_PERMISSIONS: process.env.MOCK_PERMISSIONS,
        message: '环境变量已设置（仅在内存中有效，服务器重启后将恢复）'
      }
    });
  } catch (error) {
    logger.error('设置环境变量失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '设置环境变量失败'
      }
    });
  }
});

/**
* @swagger
 * /admin/db-monitor/public-stats:
 *   get:
 *     tags: [Admin]
 *     summary: 获取公共数据库统计信息
 *     description: 获取数据库基本统计信息，包括查询数量、连接池状态等
 *     responses:
 *       200:
 *         description: 成功获取数据库统计信息
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
 *                     metrics:
 *                       $ref: '#/components/schemas/DatabaseMetrics'
 *                     tableCount:
 *                       type: number
 *                       description: 数据库表总数
 *                       example: 20
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
// 公共访问的数据库统计信息API
router.get('/db-monitor/public-stats', function(req: Request, res: Response) {
  (async function() {
  try {
    const metrics = dbMonitor.getPerformanceMetrics(sequelize);
    const tableCount = await sequelize.query<{tableCount: number}>(
      'SELECT COUNT(*) as tableCount FROM information_schema.tables WHERE table_schema = :dbName',
      {
        replacements: { dbName: sequelize.getDatabaseName() },
        type: QueryTypes.SELECT
      }
    );
    
    return res.json({
      success: true,
      data: {
        metrics: {
          totalQueries: metrics.totalQueries,
          slowQueries: metrics.slowQueries,
          averageQueryTime: metrics.averageQueryTime,
          poolSize: metrics.poolStats.size,
          poolAvailable: metrics.poolStats.available
        },
        tableCount: tableCount[0]?.tableCount || 0
      }
    });
  } catch (error) {
    logger.error('获取公共数据库统计信息失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '获取公共数据库统计信息失败'
      }
    });
  }
  })();
});

/**
* @swagger
 * /admin/db-monitor/metrics:
 *   get:
 *     tags: [Admin]
 *     summary: 获取数据库性能指标
 *     description: 获取详细的数据库性能指标，包括查询统计、连接池状态等
 *     responses:
 *       200:
 *         description: 成功获取数据库性能指标
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
 *                   description: 完整的数据库性能指标
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
// 数据库监控相关路由 - 开发环境下无需认证
router.get('/db-monitor/metrics', function(req: Request, res: Response) {
  (async function() {
  try {
    const metrics = dbMonitor.getPerformanceMetrics(sequelize);
    return res.json({
      success: true,
      data: metrics
    });
  } catch (error) {
    logger.error('获取数据库性能指标失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '获取数据库性能指标失败'
      }
    });
  }
  })();
});

/**
* @swagger
 * /admin/db-monitor/tables:
 *   get:
 *     tags: [Admin]
 *     summary: 获取数据库表统计信息
 *     description: 获取所有数据库表的统计信息，包括行数、大小等
 *     responses:
 *       200:
 *         description: 成功获取数据库表统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TableStats'
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.get('/db-monitor/tables', function(req: Request, res: Response) {
  (async function() {
  try {
    const tableStats = await dbMonitor.getTableStats(sequelize);
    return res.json({
      success: true,
      data: tableStats
    });
  } catch (error) {
    logger.error('获取数据库表统计信息失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '获取数据库表统计信息失败'
      }
    });
  }
  })();
});

/**
* @swagger
 * /admin/db-monitor/indexes:
 *   get:
 *     tags: [Admin]
 *     summary: 获取数据库索引使用情况
 *     description: 获取数据库索引的使用统计信息
 *     responses:
 *       200:
 *         description: 成功获取数据库索引使用情况
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       indexName:
 *                         type: string
 *                         description: 索引名称
 *                       tableName:
 *                         type: string
 *                         description: 表名
 *                       usageCount:
 *                         type: number
 *                         description: 使用次数
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.get('/db-monitor/indexes', function(req: Request, res: Response) {
  (async function() {
  try {
    const indexStats = await dbMonitor.getIndexUsageStats(sequelize);
    return res.json({
      success: true,
      data: indexStats
    });
  } catch (error) {
    logger.error('获取数据库索引使用情况失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '获取数据库索引使用情况失败'
      }
    });
  }
  })();
});

/**
* @swagger
 * /admin/db-monitor/queries:
 *   get:
 *     tags: [Admin]
 *     summary: 获取数据库查询统计信息
 *     description: 获取数据库查询的统计信息，包括慢查询等
 *     responses:
 *       200:
 *         description: 成功获取数据库查询统计信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       query:
 *                         type: string
 *                         description: 查询语句
 *                       executionCount:
 *                         type: number
 *                         description: 执行次数
 *                       averageTime:
 *                         type: number
 *                         description: 平均执行时间
 *                       maxTime:
 *                         type: number
 *                         description: 最大执行时间
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
*/
router.get('/db-monitor/queries', function(req: Request, res: Response) {
  (async function() {
  try {
    const queryStats = await dbMonitor.getQueryStats(sequelize);
    return res.json({
      success: true,
      data: queryStats
    });
  } catch (error) {
    logger.error('获取数据库查询统计信息失败', error);
    return res.status(500).json({
      success: false,
      error: {
        message: '获取数据库查询统计信息失败'
      }
    });
  }
  })();
});

/**
* @swagger
 * /admin/refresh-permission-cache:
 *   post:
 *     tags: [Admin]
 *     summary: 手动刷新权限缓存
 *     description: 管理员手动刷新权限路由缓存，立即生效权限变更
 *     responses:
 *       200:
 *         description: 成功刷新权限缓存
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "权限缓存已成功刷新"
 *                 data:
 *                   type: object
 *                   properties:
 *                     refreshTime:
 *                       type: number
 *                       description: 刷新耗时(ms)
 *                     before:
 *                       type: object
 *                       description: 刷新前状态
 *                     after:
 *                       type: object
 *                       description: 刷新后状态
 *                     changes:
 *                       type: object
 *                       description: 变更统计
 *       500:
 *         description: 刷新失败
*/
router.post('/refresh-permission-cache', PermissionCacheController.refreshPermissionCache);

/**
* @swagger
 * /admin/permission-cache-status:
 *   get:
 *     tags: [Admin]
 *     summary: 获取权限缓存状态
 *     description: 获取权限缓存的详细状态信息，包括健康度、性能指标等
 *     responses:
 *       200:
 *         description: 成功获取缓存状态
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
 *                     cache:
 *                       type: object
 *                       description: 缓存基本信息
 *                       properties:
 *                         routeCount:
 *                           type: number
 *                           description: 路由数量
 *                         roleCount:
 *                           type: number
 *                           description: 角色数量
 *                         lastLoadTime:
 *                           type: number
 *                           description: 最后加载时间
 *                         cacheAge:
 *                           type: number
 *                           description: 缓存年龄(ms)
 *                         isHealthy:
 *                           type: boolean
 *                           description: 是否健康
 *                     metrics:
 *                       type: object
 *                       description: 性能指标
 *                     watcher:
 *                       type: object
 *                       description: 监听状态
 *                     health:
 *                       type: object
 *                       description: 健康评分
 *       500:
 *         description: 获取状态失败
*/
router.get('/permission-cache-status', PermissionCacheController.getCacheStatus);

/**
* @swagger
 * /admin/permission-change-history:
 *   get:
 *     tags: [Admin]
 *     summary: 获取权限变更历史
 *     description: 获取权限变更的历史记录
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: 返回记录数量限制
 *     responses:
 *       200:
 *         description: 成功获取变更历史
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
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [create, update, destroy]
 *                           model:
 *                             type: string
 *                           instanceId:
 *                             type: string
 *                           timestamp:
 *                             type: number
 *                           details:
 *                             type: object
 *                     totalCount:
 *                       type: number
 *                     limit:
 *                       type: number
 *       500:
 *         description: 获取历史失败
*/
router.get('/permission-change-history', PermissionCacheController.getChangeHistory);

/**
* @swagger
 * /admin/force-refresh-cache:
 *   post:
 *     tags: [Admin]
 *     summary: 强制刷新缓存
 *     description: 紧急情况下强制立即刷新权限缓存
 *     responses:
 *       200:
 *         description: 成功强制刷新
 *       500:
 *         description: 强制刷新失败
*/
router.post('/force-refresh-cache', PermissionCacheController.forceRefreshCache);

/**
* @swagger
 * /admin/permission-change-history:
 *   delete:
 *     tags: [Admin]
 *     summary: 清空权限变更历史
 *     description: 清空权限变更历史记录
 *     responses:
 *       200:
 *         description: 成功清空历史记录
 *       500:
 *         description: 清空失败
*/
router.delete('/permission-change-history', PermissionCacheController.clearChangeHistory);

/**
* @swagger
 * /admin/warmup-cache:
 *   post:
 *     tags: [Admin]
 *     summary: 缓存预热
 *     description: 预热权限缓存，提升访问性能
 *     responses:
 *       200:
 *         description: 成功完成缓存预热
 *       500:
 *         description: 预热失败
*/
router.post('/warmup-cache', PermissionCacheController.warmupCache);

/**
* @swagger
 * /admin/start-permission-watcher:
 *   post:
 *     tags: [Admin]
 *     summary: 启动权限变更监听
 *     description: 手动启动权限变更监听服务
 *     responses:
 *       200:
 *         description: 成功启动权限变更监听
 *       500:
 *         description: 启动失败
*/
router.post('/start-permission-watcher', function(req: Request, res: Response) {
  try {
    console.log('[ADMIN]: 🔄 管理员手动启动权限变更监听服务...');
    console.log('ADMIN:', `👤 操作用户: ${(req.user as any)?.username || 'Unknown'} (ID: ${req.user?.id})`);
    
    // 启动权限变更监听
    PermissionWatcherService.startWatching();
    
    // 获取监听状态
    const watcherStatus = PermissionWatcherService.getWatcherStatus();
    
    console.log('[ADMIN]: ✅ 权限变更监听服务启动成功');
    
    res.json({
      success: true,
      message: '权限变更监听服务已启动',
      data: {
        isWatching: watcherStatus.isWatching,
        eventCount: watcherStatus.eventCount,
        lastEventTime: watcherStatus.lastEventTime,
        refreshScheduled: watcherStatus.refreshScheduled
      },
      timestamp: Date.now()
    });
    
  } catch (error) {
    console.error('[ADMIN]: ❌ 启动权限变更监听失败:', error);
    
    res.status(500).json({
      success: false,
      error: '启动权限变更监听失败',
      message: (error as Error).message,
      timestamp: Date.now()
    });
  }
});

// 导出路由
export default router; 