/**
* @swagger
 * components:
 *   schemas:
 *     Example:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Example ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Example 名称
 *           example: "示例Example"
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
 *     CreateExampleRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Example 名称
 *           example: "新Example"
 *     UpdateExampleRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Example 名称
 *           example: "更新后的Example"
 *     ExampleListResponse:
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
 *                 $ref: '#/components/schemas/Example'
 *         message:
 *           type: string
 *           example: "获取example列表成功"
 *     ExampleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Example'
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
 * example管理路由文件
 * 提供example的基础CRUD操作
*
 * 功能包括：
 * - 获取example列表
 * - 创建新example
 * - 获取example详情
 * - 更新example信息
 * - 删除example
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * 示例API路由
 * 提供API使用示例和测试端点
*/

import { Router, Request, Response } from 'express';
import { ApiResponse } from '../utils/apiResponse';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /example:
 *   get:
 *     summary: 基本示例端点
 *     tags: [Example]
 *     responses:
 *       200:
 *         description: 成功返回示例数据
*/
router.get('/', (req: Request, res: Response) => {
  const exampleData = {
    message: 'Hello from Kindergarten Management System API',
    timestamp: new Date().toISOString(),
    examples: {
      authentication: '/api/auth/login',
      users: '/api/users',
      students: '/api/students',
      teachers: '/api/teachers',
      classes: '/api/classes',
      activities: '/api/activities',
      enrollment: '/api/enrollment-plans'
    },
    documentation: '/api-docs'
  };

  ApiResponse.success(res, exampleData, '示例API响应');
});

/**
* @swagger
 * /example/{id}:
 *   get:
 *     summary: 获取指定ID的示例数据
 *     tags: [Example]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 示例数据ID
 *     responses:
 *       200:
 *         description: 成功返回示例数据
 *       404:
 *         description: 示例数据不存在
*/
router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(req.params.id);
  
  if (isNaN(id)) {
    return ApiResponse.error(res, 'INVALID_ID', 'ID必须是数字', 400);
  }
  
  const exampleData = {
    id,
    name: `示例项目 ${id}`,
    description: `这是第${id}个示例项目`,
    type: 'example',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  ApiResponse.success(res, exampleData, '示例数据获取成功');
});

/**
* @swagger
 * /example:
 *   post:
 *     summary: 创建示例数据
 *     tags: [Example]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: 示例数据创建成功
 *       400:
 *         description: 请求参数错误
*/
router.post('/', (req: Request, res: Response) => {
  const { name, description } = req.body;
  
  if (!name || !description) {
    return ApiResponse.error(res, 'MISSING_REQUIRED_FIELDS', 'name和description是必需的', 400);
  }
  
  const newExample = {
    id: Math.floor(Math.random() * 10000),
    name,
    description,
    type: 'example',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  ApiResponse.success(res, newExample, '示例数据创建成功', 201);
});

export default router;