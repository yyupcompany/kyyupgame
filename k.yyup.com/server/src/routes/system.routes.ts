/**
* @swagger
 * components:
 *   schemas:
 *     System:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: System ID
 *           example: 1
 *         name:
 *           type: string
 *           description: System 名称
 *           example: "示例System"
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
 *     CreateSystemRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: System 名称
 *           example: "新System"
 *     UpdateSystemRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: System 名称
 *           example: "更新后的System"
 *     SystemListResponse:
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
 *                 $ref: '#/components/schemas/System'
 *         message:
 *           type: string
 *           example: "获取system列表成功"
 *     SystemResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/System'
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
 * system管理路由文件
 * 提供system的基础CRUD操作
*
 * 功能包括：
 * - 获取system列表
 * - 创建新system
 * - 获取system详情
 * - 更新system信息
 * - 删除system
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { ApiResponse } from '../utils/apiResponse';
import { QueryTypes, Op } from 'sequelize';
import { sequelize } from '../init';
import { SystemMonitorService } from '../services/system-monitor.service';
import { User } from '../models/user.model';
import { Role } from '../models/role.model';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * tags:
 *   name: System
 *   description: 系统管理接口
*/

/**
* @swagger
 * /system:
 *   get:
 *     summary: 系统健康检查
 *     tags: [System]
 *     description: 检查系统运行状态
 *     responses:
 *       200:
 *         description: 系统运行正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       description: 系统运行时间（秒）
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *       500:
 *         description: 系统错误
*/

// 健康检查 (支持根路径)
router.get('/', async (req, res) => {
  try {
    return ApiResponse.success(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '健康检查失败');
  }
});

/**
* @swagger
 * /system/health:
 *   get:
 *     summary: 系统健康检查
 *     tags: [System]
 *     description: 检查系统运行状态
 *     responses:
 *       200:
 *         description: 系统运行正常
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "healthy"
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     uptime:
 *                       type: number
 *                       description: 系统运行时间（秒）
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *       500:
 *         description: 系统错误
*/

// 健康检查
router.get('/health', async (req, res) => {
  try {
    return ApiResponse.success(res, {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '健康检查失败');
  }
});

/**
* @swagger
 * /system/docs:
 *   get:
 *     summary: 获取API文档
 *     tags: [System]
 *     description: 获取API文档信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取API文档成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "API文档功能暂未实现"
 *                     docs_url:
 *                       type: string
 *                       example: "/api-docs"
 *                     swagger_url:
 *                       type: string
 *                       example: "/swagger"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 获取API文档
router.get('/docs', async (req, res) => {
  try {
    return ApiResponse.success(res, {
      message: 'API文档功能暂未实现',
      docs_url: '/api-docs',
      swagger_url: '/swagger'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取API文档失败');
  }
});

/**
* @swagger
 * /system/info:
 *   get:
 *     summary: 获取系统信息
 *     tags: [System]
 *     description: 获取系统运行信息
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取系统信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "幼儿园管理系统"
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     uptime:
 *                       type: number
 *                       description: 系统运行时间（秒）
 *                     memory:
 *                       type: object
 *                       properties:
 *                         rss:
 *                           type: number
 *                         heapTotal:
 *                           type: number
 *                         heapUsed:
 *                           type: number
 *                         external:
 *                           type: number
 *                         arrayBuffers:
 *                           type: number
 *                     platform:
 *                       type: string
 *                       example: "linux"
 *                     node_version:
 *                       type: string
 *                       example: "v18.17.0"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 获取系统信息
router.get('/info', async (req, res) => {
  try {
    const systemInfo = {
      name: '幼儿园管理系统',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      node_version: process.version
    };

    return ApiResponse.success(res, systemInfo);
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取系统信息失败');
  }
});

/**
* @swagger
 * /api/system/stats:
 *   get:
 *     summary: 获取系统统计数据
 *     description: 获取系统仪表板所需的统计数据
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取系统统计数据成功
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
 *                     userCount:
 *                       type: integer
 *                       description: 系统用户总数
 *                     activeUsers:
 *                       type: integer
 *                       description: 今日活跃用户数
 *                     roleCount:
 *                       type: integer
 *                       description: 系统角色总数
 *                     permissionCount:
 *                       type: integer
 *                       description: 权限总数
 *                     todayLogCount:
 *                       type: integer
 *                       description: 今日日志数量
 *                     errorLogCount:
 *                       type: integer
 *                       description: 错误日志数量
 *                     uptime:
 *                       type: string
 *                       description: 系统运行时间
 *                     cpuUsage:
 *                       type: number
 *                       description: CPU使用率
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 获取系统统计数据
router.get('/stats', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    // 获取真实系统监控数据
    const systemMonitor = SystemMonitorService.getInstance();
    const metrics = await systemMonitor.getSystemMetrics();

    // 获取用户统计
    const userCountResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tenantDb}.users`,
      { type: QueryTypes.SELECT }
    );
    const userCount = (userCountResult[0] as any)?.count || 0;

    // 获取今日活跃用户数（使用今日创建的用户作为活跃用户的替代）
    const activeUsersResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tenantDb}.users WHERE DATE(createdAt) = CURDATE()`,
      { type: QueryTypes.SELECT }
    );
    const activeUsers = (activeUsersResult[0] as any)?.count || 0;

    // 获取角色统计
    const roleCountResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tenantDb}.roles`,
      { type: QueryTypes.SELECT }
    );
    const roleCount = (roleCountResult[0] as any)?.count || 0;

    // 获取权限统计
    const permissionCountResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tenantDb}.permissions`,
      { type: QueryTypes.SELECT }
    );
    const permissionCount = (permissionCountResult[0] as any)?.count || 0;

    // 获取今日日志统计
    const todayLogCountResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tenantDb}.system_logs WHERE DATE(created_at) = CURDATE()`,
      { type: QueryTypes.SELECT }
    );
    const todayLogCount = (todayLogCountResult[0] as any)?.count || 0;

    // 获取错误日志统计
    const errorLogCountResult = await sequelize.query(
      `SELECT COUNT(*) as count FROM ${tenantDb}.system_logs WHERE level = "error" AND DATE(created_at) = CURDATE()`,
      { type: QueryTypes.SELECT }
    );
    const errorLogCount = (errorLogCountResult[0] as any)?.count || 0;

    // 格式化系统运行时间
    const uptime = systemMonitor.formatUptime(metrics.system.uptime);

    const stats = {
      userCount: Number(userCount),
      activeUsers: Number(activeUsers),
      roleCount: Number(roleCount),
      permissionCount: Number(permissionCount),
      todayLogCount: Number(todayLogCount),
      errorLogCount: Number(errorLogCount),
      uptime,
      cpuUsage: metrics.cpu.usage,
      // 新增真实监控数据
      systemMetrics: {
        cpu: metrics.cpu,
        memory: metrics.memory,
        disk: metrics.disk,
        network: metrics.network,
        security: metrics.security,
        performance: metrics.performance,
        healthScore: Math.round((metrics.performance.score + metrics.security.score) / 2)
      }
    };

    return ApiResponse.success(res, stats, '获取系统统计数据成功');
  } catch (error) {
    console.error('[SYSTEM]: 获取系统统计数据失败:', error);
    return ApiResponse.handleError(res, error, '获取系统统计数据失败');
  }
});

/**
* @swagger
 * /api/system/detail-info:
 *   get:
 *     summary: 获取系统详细信息
 *     description: 获取系统的详细配置和运行信息
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取系统详细信息成功
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
 *                     version:
 *                       type: string
 *                       description: 系统版本
 *                     lastUpdate:
 *                       type: string
 *                       description: 最后更新时间
 *                     os:
 *                       type: string
 *                       description: 操作系统
 *                     database:
 *                       type: string
 *                       description: 数据库信息
 *                     memoryUsage:
 *                       type: string
 *                       description: 内存使用情况
 *                     diskSpace:
 *                       type: string
 *                       description: 磁盘空间使用情况
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 获取系统详细信息
router.get('/detail-info', async (req, res) => {
  try {
    // 获取真实系统监控数据
    const systemMonitor = SystemMonitorService.getInstance();
    const metrics = await systemMonitor.getSystemMetrics();

    const detailInfo = {
      version: 'v1.0.0',
      lastUpdate: '2024-01-01',
      os: `${metrics.system.platform} ${metrics.system.arch}`,
      database: 'MySQL 8.0',
      memoryUsage: `${metrics.memory.used}GB / ${metrics.memory.total}GB`,
      diskSpace: `${metrics.disk.used}GB / ${metrics.disk.total}GB`,
      nodeVersion: metrics.system.nodeVersion,
      uptime: systemMonitor.formatUptime(metrics.system.uptime),
      loadAverage: metrics.system.loadAverage.map(load => Math.round(load * 100) / 100),
      // 详细的系统指标
      detailedMetrics: {
        cpu: {
          usage: metrics.cpu.usage,
          cores: metrics.cpu.cores,
          temperature: metrics.cpu.temperature
        },
        memory: {
          total: metrics.memory.total,
          used: metrics.memory.used,
          free: metrics.memory.free,
          usage: metrics.memory.usage
        },
        disk: {
          total: metrics.disk.total,
          used: metrics.disk.used,
          free: metrics.disk.free,
          usage: metrics.disk.usage
        },
        network: {
          latency: metrics.network.latency
        }
      }
    };

    return ApiResponse.success(res, detailInfo, '获取系统详细信息成功');
  } catch (error) {
    console.error('[SYSTEM]: 获取系统详细信息失败:', error);
    return ApiResponse.handleError(res, error, '获取系统详细信息失败');
  }
});

/**
* @swagger
 * /system/test/database:
 *   get:
 *     summary: 测试数据库连接
 *     tags: [System]
 *     description: 测试数据库连接状态
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 数据库连接测试成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "connected"
 *                     test_query:
 *                       type: object
 *                       properties:
 *                         test:
 *                           type: integer
 *                           example: 1
 *                     message:
 *                       type: string
 *                       example: "数据库连接正常"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 数据库连接失败
*/

// 测试数据库连接
router.get('/test/database', async (req, res) => {
  try {
    await sequelize.authenticate();
    
    const result = await sequelize.query(
      'SELECT 1 as test',
      { type: QueryTypes.SELECT }
    );

    return ApiResponse.success(res, {
      status: 'connected',
      test_query: result[0],
      message: '数据库连接正常'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '数据库连接测试失败');
  }
});

/**
* @swagger
 * /system/test/email:
 *   get:
 *     summary: 测试邮件服务状态
 *     tags: [System]
 *     description: 获取邮件服务状态
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 邮件服务测试功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 501
 *                 message:
 *                   type: string
 *                   example: "邮件服务测试功能暂未实现"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 测试邮件服务 (GET)
router.get('/test/email', async (req, res) => {
  try {
    return ApiResponse.error(res, '邮件服务测试功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '邮件服务测试失败');
  }
});

/**
* @swagger
 * /system/test/email:
 *   post:
 *     summary: 测试邮件发送
 *     tags: [System]
 *     description: 测试邮件发送功能
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 example: "test@example.com"
 *                 description: 收件人邮箱
 *               subject:
 *                 type: string
 *                 example: "测试邮件"
 *                 description: 邮件主题
 *               content:
 *                 type: string
 *                 example: "这是一封测试邮件"
 *                 description: 邮件内容
 *     responses:
 *       200:
 *         description: 邮件发送模拟成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "simulated"
 *                     to:
 *                       type: string
 *                       example: "test@example.com"
 *                     subject:
 *                       type: string
 *                       example: "测试邮件"
 *                     content:
 *                       type: string
 *                       example: "这是一封测试邮件"
 *                     message:
 *                       type: string
 *                       example: "邮件发送模拟成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 测试邮件服务 (POST)
router.post('/test/email', async (req, res) => {
  try {
    const { to, subject, content } = req.body;
    
    return ApiResponse.success(res, {
      status: 'simulated',
      to: to || 'test@example.com',
      subject: subject || '测试邮件',
      content: content || '这是一封测试邮件',
      message: '邮件发送模拟成功'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '邮件服务测试失败');
  }
});

/**
* @swagger
 * /system/test/sms:
 *   post:
 *     summary: 测试短信发送
 *     tags: [System]
 *     description: 测试短信发送功能
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "13800138000"
 *                 description: 接收短信的手机号
 *               content:
 *                 type: string
 *                 example: "这是一条测试短信"
 *                 description: 短信内容
 *     responses:
 *       200:
 *         description: 短信发送模拟成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "simulated"
 *                     phone:
 *                       type: string
 *                       example: "13800138000"
 *                     content:
 *                       type: string
 *                       example: "这是一条测试短信"
 *                     message:
 *                       type: string
 *                       example: "短信发送模拟成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 测试短信服务 (POST)
router.post('/test/sms', async (req, res) => {
  try {
    const { phone, content } = req.body;
    
    return ApiResponse.success(res, {
      status: 'simulated',
      phone: phone || '13800138000',
      content: content || '这是一条测试短信',
      message: '短信发送模拟成功'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '短信服务测试失败');
  }
});

/**
* @swagger
 * /system/upload:
 *   post:
 *     summary: 系统文件上传
 *     tags: [System]
 *     description: 系统文件上传功能
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的文件
 *     responses:
 *       200:
 *         description: 文件上传模拟成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       example: "/uploads/system/logo_1625097600000.png"
 *                     filename:
 *                       type: string
 *                       example: "logo.png"
 *                     size:
 *                       type: number
 *                       example: 1024
 *                     message:
 *                       type: string
 *                       example: "文件上传模拟成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 系统文件上传
router.post('/upload', async (req, res) => {
  try {
    // 模拟文件上传成功
    return ApiResponse.success(res, {
      url: '/uploads/system/logo_' + Date.now() + '.png',
      filename: 'logo.png',
      size: 1024,
      message: '文件上传模拟成功'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '文件上传失败');
  }
});

/**
* @swagger
 * /system/cache/clear:
 *   delete:
 *     summary: 清理缓存 (DELETE)
 *     tags: [System]
 *     description: 清理系统缓存
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       501:
 *         description: 清理缓存功能暂未实现
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 501
 *                 message:
 *                   type: string
 *                   example: "清理缓存功能暂未实现"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 清理缓存 (DELETE)
router.delete('/cache/clear', async (req, res) => {
  try {
    return ApiResponse.error(res, '清理缓存功能暂未实现', 'NOT_IMPLEMENTED', 501);
  } catch (error) {
    return ApiResponse.handleError(res, error, '清理缓存失败');
  }
});

/**
* @swagger
 * /system/cache/clear:
 *   post:
 *     summary: 清理缓存 (POST)
 *     tags: [System]
 *     description: 清理系统缓存
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 缓存清理模拟成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "simulated"
 *                     cleared_items:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["user_cache", "api_cache", "session_cache"]
 *                     message:
 *                       type: string
 *                       example: "缓存清理模拟成功"
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/

// 清理缓存 (POST)
router.post('/cache/clear', async (req, res) => {
  try {
    return ApiResponse.success(res, {
      status: 'simulated',
      cleared_items: ['user_cache', 'api_cache', 'session_cache'],
      message: '缓存清理模拟成功'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '清理缓存失败');
  }
});

/**
* @swagger
 * /system/version:
 *   get:
 *     summary: 获取版本信息
 *     tags: [System]
 *     description: 获取系统版本信息
 *     responses:
 *       200:
 *         description: 获取版本信息成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "请求成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     version:
 *                       type: string
 *                       example: "1.0.0"
 *                     build:
 *                       type: string
 *                       example: "20250610"
 *                     environment:
 *                       type: string
 *                       example: "development"
 *                     api_version:
 *                       type: string
 *                       example: "v1"
 *                     last_updated:
 *                       type: string
 *                       example: "2025-06-10"
 *       500:
 *         description: 系统错误
*/

// 获取版本信息
router.get('/version', async (req, res) => {
  try {
    return ApiResponse.success(res, {
      version: '1.0.0',
      build: '20250610',
      environment: process.env.NODE_ENV || 'development',
      api_version: 'v1',
      last_updated: '2025-06-10'
    });
  } catch (error) {
    return ApiResponse.handleError(res, error, '获取版本信息失败');
  }
});

/**
* @swagger
 * /system/logs:
 *   get:
 *     summary: 获取系统日志
 *     tags: [System]
 *     description: 获取系统日志列表，支持分页和筛选
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error, debug]
 *         description: 日志级别
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: 日志分类
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 开始日期
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: 结束日期
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 关键词搜索
 *     responses:
 *       200:
 *         description: 获取系统日志成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "获取系统日志成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           level:
 *                             type: string
 *                             example: "info"
 *                           category:
 *                             type: string
 *                             example: "system"
 *                           message:
 *                             type: string
 *                             example: "系统启动"
 *                           details:
 *                             type: string
 *                           ip_address:
 *                             type: string
 *                             example: "127.0.0.1"
 *                           user_id:
 *                             type: integer
 *                           source:
 *                             type: string
 *                             example: "system"
 *                           created_at:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     pageSize:
 *                       type: integer
 *                       example: 20
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       401:
 *         description: 未授权访问
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 系统错误
*/

// 获取系统日志 - 映射到系统日志路由
router.get('/logs', checkPermission('SYSTEM_LOG_VIEW'), async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { page = 1, pageSize = 20, level, category, startDate, endDate, keyword } = req.query;
    
    // 构建查询条件
    let whereClause = 'WHERE 1=1';
    const replacements: any = {};
    
    if (level) {
      whereClause += ' AND level = :level';
      replacements.level = level;
    }
    
    if (category) {
      whereClause += ' AND category = :category';
      replacements.category = category;
    }
    
    if (startDate) {
      whereClause += ' AND created_at >= :startDate';
      replacements.startDate = startDate;
    }
    
    if (endDate) {
      whereClause += ' AND created_at <= :endDate';
      replacements.endDate = endDate;
    }
    
    if (keyword) {
      whereClause += ' AND (message LIKE :keyword OR details LIKE :keyword)';
      replacements.keyword = `%${keyword}%`;
    }
    
    // 计算偏移量
    const offset = (Number(page) - 1) * Number(pageSize);
    replacements.limit = Number(pageSize);
    replacements.offset = offset;
    
    // 查询日志数据
    const logsQuery = `
      SELECT
        id, level, category, message, details, ip_address,
        user_id, source, created_at
      FROM ${tenantDb}.system_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT :limit OFFSET :offset
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM ${tenantDb}.system_logs
      ${whereClause}
    `;
    
    const [logs, countResult] = await Promise.all([
      sequelize.query(logsQuery, { 
        replacements, 
        type: QueryTypes.SELECT 
      }),
      sequelize.query(countQuery, { 
        replacements: { ...replacements, limit: undefined, offset: undefined }, 
        type: QueryTypes.SELECT 
      })
    ]);
    
    const total = (countResult[0] as any)?.total || 0;
    
    return ApiResponse.success(res, {
      items: logs,
      total: Number(total),
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(Number(total) / Number(pageSize))
    }, '获取系统日志成功');
    
  } catch (error) {
    console.error('[SYSTEM]: 获取系统日志失败:', error);
    return ApiResponse.handleError(res, error, '获取系统日志失败');
  }
});

/**
* @swagger
 * /system/configs:
 *   get:
 *     summary: 获取系统配置
 *     tags: [System]
 *     description: 获取系统配置信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: group
 *         schema:
 *           type: string
 *         description: 配置分组
 *       - in: query
 *         name: key
 *         schema:
 *           type: string
 *         description: 配置键
 *     responses:
 *       200:
 *         description: 获取系统配置成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   example: 0
 *                 message:
 *                   type: string
 *                   example: "获取系统配置成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     configs:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           group:
 *                             type: string
 *                           key:
 *                             type: string
 *                           value:
 *                             type: string
 *                           description:
 *                             type: string
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/
router.get('/configs', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { group, key } = req.query;
    
    let whereClause = '';
    const replacements: any = {};
    
    if (group) {
      whereClause += 'WHERE config_group = :group';
      replacements.group = group;
    }
    
    if (key) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += 'config_key = :key';
      replacements.key = key;
    }
    
    const configsQuery = `
      SELECT
        id, config_group as 'group', config_key as 'key',
        config_value as 'value', description, updated_at as updatedAt
      FROM ${tenantDb}.system_configs
      ${whereClause}
      ORDER BY config_group, config_key
    `;
    
    const configs = await sequelize.query(configsQuery, { 
      replacements, 
      type: QueryTypes.SELECT 
    });
    
    return ApiResponse.success(res, {
      configs,
      total: configs.length,
      group: group || 'all',
      timestamp: new Date().toISOString()
    }, '获取系统配置成功');
    
  } catch (error) {
    console.error('[SYSTEM]: 获取系统配置失败:', error);
    return ApiResponse.handleError(res, error, '获取系统配置失败');
  }
});

/**
* @swagger
 * /system/configs:
 *   post:
 *     summary: 创建系统配置
 *     tags: [System]
 *     description: 创建新的系统配置项
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - group
 *               - key
 *               - value
 *             properties:
 *               group:
 *                 type: string
 *                 description: 配置分组
 *                 example: "system"
 *               key:
 *                 type: string
 *                 description: 配置键
 *                 example: "maintenance_mode"
 *               value:
 *                 type: string
 *                 description: 配置值
 *                 example: "false"
 *               description:
 *                 type: string
 *                 description: 配置描述
 *                 example: "系统维护模式开关"
 *     responses:
 *       201:
 *         description: 创建系统配置成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 系统错误
*/
router.post('/configs', checkPermission('SYSTEM_CONFIG_MANAGE'), async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { group, key, value, description } = req.body;
    
    if (!group || !key || !value) {
      return ApiResponse.error(res, '配置分组、键和值都是必需的', 'VALIDATION_ERROR', 400);
    }
    
    // 检查配置是否已存在
    const existingConfig = await sequelize.query(
      `SELECT id FROM ${tenantDb}.system_configs WHERE config_group = :group AND config_key = :key`,
      {
        replacements: { group, key },
        type: QueryTypes.SELECT
      }
    );

    if (existingConfig.length > 0) {
      return ApiResponse.error(res, '配置已存在', 'CONFIG_EXISTS', 400);
    }

    // 创建新配置
    const insertQuery = `
      INSERT INTO ${tenantDb}.system_configs (config_group, config_key, config_value, description, created_at, updated_at)
      VALUES (:group, :key, :value, :description, NOW(), NOW())
    `;
    
    await sequelize.query(insertQuery, {
      replacements: { group, key, value, description: description || '' },
      type: QueryTypes.INSERT
    });
    
    return ApiResponse.success(res, {
      group,
      key,
      value,
      description,
      createdAt: new Date().toISOString()
    }, '创建系统配置成功', 201);
    
  } catch (error) {
    console.error('[SYSTEM]: 创建系统配置失败:', error);
    return ApiResponse.handleError(res, error, '创建系统配置失败');
  }
});

/**
* @swagger
 * /system/configs/{id}:
 *   put:
 *     summary: 更新系统配置
 *     tags: [System]
 *     description: 更新现有的系统配置项
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 配置ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               value:
 *                 type: string
 *                 description: 配置值
 *               description:
 *                 type: string
 *                 description: 配置描述
 *     responses:
 *       200:
 *         description: 更新系统配置成功
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       404:
 *         description: 配置不存在
 *       500:
 *         description: 系统错误
*/
router.put('/configs/:id', checkPermission('SYSTEM_CONFIG_MANAGE'), async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { id } = req.params;
    const { value, description } = req.body;
    
    if (!value) {
      return ApiResponse.error(res, '配置值不能为空', 'VALIDATION_ERROR', 400);
    }
    
    // 检查配置是否存在
    const existingConfig = await sequelize.query(
      `SELECT id, config_group, config_key FROM ${tenantDb}.system_configs WHERE id = :id`,
      {
        replacements: { id },
        type: QueryTypes.SELECT
      }
    );

    if (existingConfig.length === 0) {
      return ApiResponse.error(res, '配置不存在', 'CONFIG_NOT_FOUND', 404);
    }

    // 更新配置
    const updateQuery = `
      UPDATE ${tenantDb}.system_configs
      SET config_value = :value, description = :description, updated_at = NOW()
      WHERE id = :id
    `;
    
    await sequelize.query(updateQuery, {
      replacements: { id, value, description: description || '' },
      type: QueryTypes.UPDATE
    });
    
    return ApiResponse.success(res, {
      id: parseInt(id),
      value,
      description,
      updatedAt: new Date().toISOString()
    }, '更新系统配置成功');
    
  } catch (error) {
    console.error('[SYSTEM]: 更新系统配置失败:', error);
    return ApiResponse.handleError(res, error, '更新系统配置失败');
  }
});

// ==================== 用户管理路由 ====================

/**
* @swagger
 * /system/users:
 *   get:
 *     summary: 获取用户列表
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *     responses:
 *       200:
 *         description: 获取成功
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
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           realName:
 *                             type: string
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
*/
router.get('/users', async (req, res) => {
  try {
    const tenantDb = req.tenant?.databaseName || 'tenant_dev';
    const { page = 1, pageSize = 10, keyword } = req.query;
    const offset = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);

    // 构建查询条件
    let whereClause = '';
    const replacements: any = { limit, offset };

    if (keyword) {
      whereClause = 'WHERE username LIKE :keyword OR email LIKE :keyword OR real_name LIKE :keyword';
      replacements.keyword = `%${keyword}%`;
    }

    // 获取用户列表
    const usersQuery = `
      SELECT
        u.id, u.username, u.email, u.realName as realName,
        u.status, u.createdAt, u.updatedAt,
        GROUP_CONCAT(r.name) as roles
      FROM ${tenantDb}.users u
      LEFT JOIN ${tenantDb}.user_roles ur ON u.id = ur.user_id
      LEFT JOIN ${tenantDb}.roles r ON ur.role_id = r.id
      ${whereClause}
      GROUP BY u.id
      ORDER BY u.createdAt DESC
      LIMIT :limit OFFSET :offset
    `;

    const users = await sequelize.query(usersQuery, {
      type: QueryTypes.SELECT,
      replacements
    });

    // 获取总数
    const countQuery = `
      SELECT COUNT(DISTINCT u.id) as total
      FROM ${tenantDb}.users u
      ${whereClause}
    `;

    const countResult = await sequelize.query(countQuery, {
      type: QueryTypes.SELECT,
      replacements: keyword ? { keyword: replacements.keyword } : {}
    });

    const total = (countResult[0] as any)?.total || 0;

    return ApiResponse.success(res, {
      items: users,
      total: Number(total),
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(Number(total) / Number(pageSize))
    }, '获取用户列表成功');

  } catch (error) {
    console.error('[SYSTEM]: 获取用户列表失败:', error);
    return ApiResponse.handleError(res, error, '获取用户列表失败');
  }
});

/**
* @swagger
 * /system/users:
 *   post:
 *     summary: 创建用户
 *     tags: [System]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               realName:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/users', async (req, res) => {
  try {
    const { username, email, password, realName, status = 'active' } = req.body;

    // 检查用户名是否已存在
    const existingUsername = await User.findOne({
      where: { username }
    });

    if (existingUsername) {
      return ApiResponse.error(res, '用户名已存在', 'USERNAME_EXISTS', 400);
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: { email }
    });

    if (existingEmail) {
      return ApiResponse.error(res, '邮箱已存在', 'EMAIL_EXISTS', 400);
    }

    // 创建用户
    const user = await User.create({
      username,
      email,
      password, // 注意：实际应用中需要加密密码
      realName,
      status
    });

    return ApiResponse.success(res, {
      id: user.id,
      username: user.username,
      email: user.email,
      realName: user.realName,
      status: user.status,
      createdAt: user.createdAt
    }, '创建用户成功', 201);

  } catch (error) {
    console.error('[SYSTEM]: 创建用户失败:', error);
    return ApiResponse.handleError(res, error, '创建用户失败');
  }
});

export default router;