/**
* @swagger
 * components:
 *   schemas:
 *     Ai-query:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Ai-query ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Ai-query 名称
 *           example: "示例Ai-query"
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
 *     CreateAi-queryRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-query 名称
 *           example: "新Ai-query"
 *     UpdateAi-queryRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Ai-query 名称
 *           example: "更新后的Ai-query"
 *     Ai-queryListResponse:
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
 *                 $ref: '#/components/schemas/Ai-query'
 *         message:
 *           type: string
 *           example: "获取ai-query列表成功"
 *     Ai-queryResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Ai-query'
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
 * ai-query管理路由文件
 * 提供ai-query的基础CRUD操作
*
 * 功能包括：
 * - 获取ai-query列表
 * - 创建新ai-query
 * - 获取ai-query详情
 * - 更新ai-query信息
 * - 删除ai-query
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { permissionMiddleware } from '../middlewares/permission.middleware';
import { apiLimiter } from '../middlewares/security.middleware';
import aiQueryController from '../controllers/ai-query.controller';

const router = Router();

// 应用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// 临时路由：更新豆包模型参数
router.post('/update-doubao-params', aiQueryController.updateDoubaoModelParams);

// 创建AI查询限流器
const aiQueryLimiter = apiLimiter;

/**
* @swagger
 * tags:
 *   name: AI查询
 *   description: AI数据库查询接口
*/

/**
* @swagger
 * /api/ai-query/chat:
 *   post:
 *     summary: AI查询聊天接口
 *     description: AI中心查询页面专用的聊天窗口接口，支持自然语言查询和AI问答
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: 自然语言查询内容
 *                 example: "查询所有学生的基本信息"
 *               userId:
 *                 type: integer
 *                 description: 用户ID
 *                 example: 121
 *               sessionId:
 *                 type: string
 *                 description: 会话ID
 *                 example: "uuid-string"
 *     responses:
 *       200:
 *         description: 查询成功
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
 *                     response:
 *                       type: string
 *                       description: AI回复内容
 *                     queryResult:
 *                       type: array
 *                       description: 查询结果数据
 *                     sessionId:
 *                       type: string
 *                       description: 会话ID
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/chat',
  permissionMiddleware(['AI_QUERY_EXECUTE']),
  aiQueryController.executeQuery
);

/**
* @swagger
 * /api/ai/query:
 *   post:
 *     summary: AI智能查询接口
 *     description: 前端AI中心调用的主要查询接口，支持自然语言查询
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: 自然语言查询内容
 *                 example: "统计本月活动参与人数最多的前5个活动"
 *     responses:
 *       200:
 *         description: 查询成功
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/',
  permissionMiddleware(['AI_QUERY_EXECUTE']),
  aiQueryController.executeQuery
);

/**
* @swagger
 * /api/ai-query/execute:
 *   post:
 *     summary: 执行AI查询
 *     description: 执行AI生成的数据库查询
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 查询执行成功
 *       429:
 *         description: 请求过于频繁
 *       500:
 *         description: 服务器错误
*/
router.post('/execute',
  permissionMiddleware(['AI_QUERY_EXECUTE']),
  aiQueryController.executeQuery
);

/**
* @swagger
 * /api/ai-query/history:
 *   get:
 *     summary: 获取查询历史
 *     description: 获取当前用户的AI查询历史记录，支持分页和类型筛选
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: 页码
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: pageSize
 *         in: query
 *         description: 每页条数
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: queryType
 *         in: query
 *         description: 查询类型筛选
 *         schema:
 *           type: string
 *           enum: [data_query, ai_response]
*/
router.get('/history',
  permissionMiddleware(['AI_QUERY_HISTORY']),
  aiQueryController.getQueryHistory
);

/**
* @swagger
 * /api/ai-query/feedback:
 *   post:
 *     summary: 提交查询反馈
 *     description: 对AI查询结果提交用户反馈
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
*/
router.post('/feedback',
  permissionMiddleware(['AI_QUERY_FEEDBACK']),
  aiQueryController.submitFeedback
);

/**
* @swagger
 * /api/ai-query/templates:
 *   get:
 *     summary: 获取查询模板
 *     description: 获取预定义的查询模板列表
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
*/
router.get('/templates',
  permissionMiddleware(['AI_QUERY_TEMPLATE']),
  aiQueryController.getTemplates
);

/**
* @swagger
 * /api/ai-query/suggestions:
 *   get:
 *     summary: 获取查询建议
 *     description: 根据用户角色获取推荐的查询建议
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
*/
router.get('/suggestions',
  permissionMiddleware(['AI_QUERY_HISTORY']),
  aiQueryController.getSuggestions
);

/**
* @swagger
 * /api/ai-query/statistics:
 *   get:
 *     summary: 获取查询统计
 *     description: 获取AI查询系统的使用统计信息
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
*/
router.get('/statistics',
  permissionMiddleware(['AI_QUERY_STATS']),
  aiQueryController.getStatistics
);

/**
* @swagger
 * /api/ai-query/{id}:
 *   get:
 *     summary: 获取查询详情
 *     description: 获取指定查询记录的详细信息
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
*/
router.get('/:id',
  permissionMiddleware(['AI_QUERY_HISTORY']),
  aiQueryController.getQueryDetail
);

/**
* @swagger
 * /api/ai-query/{id}/re-execute:
 *   post:
 *     summary: 重新执行查询
 *     description: 重新执行指定的查询记录
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
*/
router.post('/:id/re-execute',
  permissionMiddleware(['AI_QUERY_EXECUTE']),
  aiQueryController.reExecuteQuery
);

/**
* @swagger
 * /api/ai-query/{id}/export:
 *   get:
 *     summary: 导出查询结果
 *     description: 将查询结果导出为指定格式的文件
 *     tags: [AI查询]
 *     security:
 *       - bearerAuth: []
*/
router.get('/:id/export',
  permissionMiddleware(['AI_QUERY_EXPORT']),
  aiQueryController.exportResult
);

/**
* @swagger
 * /api/ai-query/cache/cleanup:
 *   post:
 *     summary: 清理查询缓存
 *     description: 清理过期的查询缓存数据
 *     tags: [AI查询管理]
 *     security:
 *       - bearerAuth: []
*/
router.post('/cache/cleanup',
  permissionMiddleware(['AI_QUERY_ADMIN']),
  aiQueryController.cleanupCache
);

export default router;