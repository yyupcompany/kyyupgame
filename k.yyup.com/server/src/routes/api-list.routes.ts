/**
* @swagger
 * components:
 *   schemas:
 *     Api-list:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Api-list ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Api-list 名称
 *           example: "示例Api-list"
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
 *     CreateApi-listRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Api-list 名称
 *           example: "新Api-list"
 *     UpdateApi-listRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Api-list 名称
 *           example: "更新后的Api-list"
 *     Api-listListResponse:
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
 *                 $ref: '#/components/schemas/Api-list'
 *         message:
 *           type: string
 *           example: "获取api-list列表成功"
 *     Api-listResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Api-list'
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
 * api-list管理路由文件
 * 提供api-list的基础CRUD操作
*
 * 功能包括：
 * - 获取api-list列表
 * - 创建新api-list
 * - 获取api-list详情
 * - 更新api-list信息
 * - 删除api-list
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * API列表路由
 * 提供所有API端点的列表和信息
*/

import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api-list:
 *   get:
 *     tags: [API管理]
 *     summary: 获取所有API端点列表
 *     description: 获取系统中所有可用的API端点，按模块分组显示
 *     responses:
 *       200:
 *         description: 成功获取API端点列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: integer
 *                   description: API端点总数
 *                   example: 155
 *                 modules:
 *                   type: array
 *                   description: 按模块分组的API端点
 *                   items:
 *                     type: object
 *                     properties:
 *                       module:
 *                         type: string
 *                         description: 模块名称
 *                         example: "auth"
 *                       routes:
 *                         type: array
 *                         description: 该模块的路由列表
 *                         items:
 *                           type: object
 *                           properties:
 *                             method:
 *                               type: string
 *                               description: HTTP方法
 *                               example: "GET"
 *                             path:
 *                               type: string
 *                               description: 路由路径
 *                               example: "/auth/login"
 *       500:
 *         description: 获取API列表失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "获取API列表失败"
*/
// 获取所有API端点
router.get('/', (req: Request, res: Response) => {
  try {
    // 获取路由目录
    const routesDir = path.join(__dirname);
    
    // 读取所有路由文件
    const routeFiles = fs.readdirSync(routesDir)
      .filter(file => file.endsWith('.routes.ts') || file.endsWith('.routes.js'))
      .filter(file => file !== 'index.ts' && file !== 'index.js' && file !== 'api-list.routes.ts' && file !== 'api-list.routes.js');
    
    // 解析路由文件，获取API端点信息
    const apiEndpoints: any[] = [];
    
    // 实际路由映射 - 从文件名到实际注册的路径前缀
    const routeMapping: { [key: string]: string } = {
      // 基础管理路由
      'auth': 'auth',
      'user': 'users',
      'role': 'roles',
      'permission': 'permissions',
      'user-role': 'user-roles',
      'role-permission': 'role-permissions',
      
      // 核心业务路由
      'kindergarten': 'kindergartens',
      'class': 'classes',
      'teacher': 'teachers',
      'student': 'students',
      'parent': 'parents',
      'parent-student-relation': 'parent-student-relations',
      
      // 招生管理路由
      'enrollment-plan': 'enrollment-plans',
      'enrollment-quota': 'enrollment-quotas',
      'enrollment-application': 'enrollment-applications',
      'enrollment-interview': 'enrollment-interviews',
      'enrollment-consultation': 'enrollment-consultations',
      'enrollment': 'enrollment',
      'enrollment-ai': 'enrollment-ai',
      'enrollment-statistics': 'enrollment-statistics',
      'enrollment-tasks': 'enrollment-tasks',
      
      // 活动管理路由
      'activities': 'activities',
      'activity-plan': 'activity-plans',
      'activity-registration': 'activity-registrations',
      'activity-checkin': 'activity-checkins',
      'activity-evaluation': 'activity-evaluations',
      
      // 营销管理路由
      'advertisement': 'advertisements',
      'marketing-campaign': 'marketing-campaigns',
      'channel-tracking': 'channel-trackings',
      'conversion-tracking': 'conversion-trackings',
      'customer-pool': 'customer-pool',
      'customers': 'customers',
      
      // 录取管理路由
      'admission-result': 'admission-results',
      'admission-notification': 'admission-notifications',
      
      // 海报管理路由
      'poster-template': 'poster-templates',
      'poster-generation': 'poster-generations',
      
      // 系统管理路由
      'system-configs': 'system-configs',
      'system-logs': 'system-logs',
      'system-backup': 'system-backup',
      'system-ai-models': 'system-ai-models',
      'system': 'system',
      'admin': 'admin',
      
      // 功能路由
      'notifications': 'notifications',
      'schedules': 'schedules',
      'files': 'files',
      'todos': 'todos',
      'operation-logs': 'operation-logs',
      'message-templates': 'message-templates',
      
      // 性能管理路由
      'performance': 'performance',
      'performance-evaluations': 'performance-evaluations',
      'performance-reports': 'performance-reports',
      'performance-rule': 'performance-rule',
      
      // 仪表盘和统计路由
      'dashboard': 'dashboard',
      'principal': 'principal',
      'principal-performance': 'principal-performance',
      'statistics': 'statistics',
      'chat': 'chat',
      
      // 其他路由
      'api': 'api',
      'example': 'example',
      'errors': 'errors'
    };

    routeFiles.forEach(file => {
      // 从文件名中提取API模块名称
      const moduleName = file.replace(/\.routes\.(ts|js)$/, '');
      
      // 获取实际的路由前缀
      const routePrefix = routeMapping[moduleName] || moduleName;
      
      // 读取文件内容
      const filePath = path.join(routesDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // 使用正则表达式查找路由定义
      const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
      const routes: any[] = [];
      
      let match;
      while ((match = routeRegex.exec(content)) !== null) {
        const method = match[1].toUpperCase();
        const path = match[2];
        
        routes.push({
          method,
          path: `/${routePrefix}${path}`
        });
      }
      
      if (routes.length > 0) {
        apiEndpoints.push({
          module: moduleName,
          routes
        });
      }
    });
    
    // 按模块名称排序
    apiEndpoints.sort((a, b) => a.module.localeCompare(b.module));
    
    // 返回API端点列表
    res.json({
      total: apiEndpoints.reduce((sum, endpoint) => sum + endpoint.routes.length, 0),
      modules: apiEndpoints
    });
  } catch (error: any) {
    console.error('[APILIST]: 获取API列表失败:', error.message);
    res.status(500).json({ error: '获取API列表失败' });
  }
});

/**
* @swagger
 * /api-list/{module}:
 *   get:
 *     tags: [API管理]
 *     summary: 获取指定模块的API端点
 *     description: 获取指定模块的所有API端点信息
 *     parameters:
 *       - in: path
 *         name: module
 *         required: true
 *         description: 模块名称
 *         schema:
 *           type: string
 *           example: "auth"
 *     responses:
 *       200:
 *         description: 成功获取模块API端点列表
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 module:
 *                   type: string
 *                   description: 模块名称
 *                   example: "auth"
 *                 total:
 *                   type: integer
 *                   description: 该模块的API端点总数
 *                   example: 8
 *                 routes:
 *                   type: array
 *                   description: 该模块的路由列表
 *                   items:
 *                     type: object
 *                     properties:
 *                       method:
 *                         type: string
 *                         description: HTTP方法
 *                         example: "POST"
 *                       path:
 *                         type: string
 *                         description: 路由路径
 *                         example: "/auth/login"
 *       404:
 *         description: 未找到指定模块
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "未找到模块: auth"
 *       500:
 *         description: 获取模块API列表失败
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "获取模块API列表失败"
*/
// 获取指定模块的API端点
router.get('/:module', (req: Request, res: Response) => {
  try {
    const moduleName = req.params.module;
    const routeFile = path.join(__dirname, `${moduleName}.routes.ts`);
    
    // 如果文件不存在，尝试查找.js文件
    let filePath = routeFile;
    if (!fs.existsSync(routeFile)) {
      filePath = path.join(__dirname, `${moduleName}.routes.js`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: `未找到模块: ${moduleName}` });
      }
    }
    
    // 读取文件内容
    const content = fs.readFileSync(filePath, 'utf8');
    
    // 使用正则表达式查找路由定义
    const routeRegex = /router\.(get|post|put|delete|patch)\s*\(\s*['"]([^'"]+)['"]/g;
    const routes: any[] = [];
    
    let match;
    while ((match = routeRegex.exec(content)) !== null) {
      const method = match[1].toUpperCase();
      const path = match[2];
      
      routes.push({
        method,
        path: `/${moduleName}${path}`
      });
    }
    
    // 返回模块API端点列表
    res.json({
      module: moduleName,
      total: routes.length,
      routes
    });
  } catch (error: any) {
    console.error('[APILIST]: 获取模块API列表失败: ${req.params.module}', error.message);
    res.status(500).json({ error: '获取模块API列表失败' });
  }
});

export default router; 