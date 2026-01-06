"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = require("express");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var permission_middleware_1 = require("../middlewares/permission.middleware");
var security_middleware_1 = require("../middlewares/security.middleware");
var ai_query_controller_1 = __importDefault(require("../controllers/ai-query.controller"));
var router = (0, express_1.Router)();
// 应用认证中间件
router.use(auth_middleware_1.verifyToken);
// 临时路由：更新豆包模型参数
router.post('/update-doubao-params', ai_query_controller_1["default"].updateDoubaoModelParams);
// 创建AI查询限流器
var aiQueryLimiter = security_middleware_1.apiLimiter;
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
router.post('/chat', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_EXECUTE']), ai_query_controller_1["default"].executeQuery);
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
router.post('/', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_EXECUTE']), ai_query_controller_1["default"].executeQuery);
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
router.post('/execute', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_EXECUTE']), ai_query_controller_1["default"].executeQuery);
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
router.get('/history', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_HISTORY']), ai_query_controller_1["default"].getQueryHistory);
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
router.post('/feedback', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_FEEDBACK']), ai_query_controller_1["default"].submitFeedback);
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
router.get('/templates', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_TEMPLATE']), ai_query_controller_1["default"].getTemplates);
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
router.get('/suggestions', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_HISTORY']), ai_query_controller_1["default"].getSuggestions);
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
router.get('/statistics', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_STATS']), ai_query_controller_1["default"].getStatistics);
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
router.get('/:id', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_HISTORY']), ai_query_controller_1["default"].getQueryDetail);
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
router.post('/:id/re-execute', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_EXECUTE']), ai_query_controller_1["default"].reExecuteQuery);
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
router.get('/:id/export', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_EXPORT']), ai_query_controller_1["default"].exportResult);
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
router.post('/cache/cleanup', (0, permission_middleware_1.permissionMiddleware)(['AI_QUERY_ADMIN']), ai_query_controller_1["default"].cleanupCache);
exports["default"] = router;
