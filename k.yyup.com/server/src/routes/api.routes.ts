/**
* @swagger
 * components:
 *   schemas:
 *     Api:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Api ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Api 名称
 *           example: "示例Api"
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
 *     CreateApiRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Api 名称
 *           example: "新Api"
 *     UpdateApiRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Api 名称
 *           example: "更新后的Api"
 *     ApiListResponse:
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
 *                 $ref: '#/components/schemas/Api'
 *         message:
 *           type: string
 *           example: "获取api列表成功"
 *     ApiResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Api'
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
 * api管理路由文件
 * 提供api的基础CRUD操作
*
 * 功能包括：
 * - 获取api列表
 * - 创建新api
 * - 获取api详情
 * - 更新api信息
 * - 删除api
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 基础API路由
 * 提供API基本信息和健康检查
*/

import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
// 导入客户管理路由
import customersRoutes from './customers.routes';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api:
 *   get:
 *     summary: API基本信息
 *     tags: [API]
 *     responses:
 *       200:
 *         description: 成功返回API基本信息
*/
router.get('/', (req: Request, res: Response) => {
  const apiInfo = {
    name: 'Kindergarten Management System API',
    version: '1.0.0',
    description: '幼儿园管理系统后端API服务',
    endpoints: '/api/list',
    documentation: '/api-docs',
    status: 'running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  };

  ApiResponse.success(res, apiInfo, 'API服务正常运行');
});

/**
* @swagger
 * /api/version:
 *   get:
 *     summary: 获取API版本信息
 *     tags: [API]
 *     responses:
 *       200:
 *         description: 成功返回版本信息
*/
router.get('/version', (req: Request, res: Response) => {
  const versionInfo = {
    version: '1.0.0',
    buildDate: new Date().toISOString(),
    nodeVersion: process.version,
    platform: process.platform,
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime()
  };

  ApiResponse.success(res, versionInfo, 'API版本信息');
});

/**
* @swagger
 * /api/health:
 *   get:
 *     summary: API健康检查
 *     tags: [API]
 *     responses:
 *       200:
 *         description: 服务健康状态
*/
router.get('/health', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  
  const healthInfo = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      rss: Math.round(memoryUsage.rss / 1024 / 1024)
    },
    cpu: {
      user: cpuUsage.user,
      system: cpuUsage.system
    },
    environment: process.env.NODE_ENV || 'development',
    nodeVersion: process.version,
    platform: process.platform
  };

  ApiResponse.success(res, healthInfo, 'API健康状态正常');
});

// 注册客户管理路由
router.use('/customers', customersRoutes);

export default router;