import { Router } from 'express';
import * as parentAssistantController from '../controllers/parent-assistant.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

/**
* @swagger
 * tags:
 *   - name: "家长助手服务"
 *     description: "幼儿园管理系统家长助手相关接口"
 *   - name: "认证"
 *     description: "用户认证相关接口"
*/

/**
* @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
*/

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/parent-assistant/answer:
 *   post:
 *     tags: [家长助手服务]
 *     summary: "回答家长问题"
 *     description: "为家长提供智能问答服务，解答关于幼儿教育、园所管理等问题"
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: "家长提出的问题"
 *                 minLength: 1
 *                 maxLength: 500
 *                 example: "孩子不爱吃饭怎么办？"
 *               context:
 *                 type: object
 *                 properties:
 *                   childId:
 *                     type: string
 *                     description: "孩子ID（可选）"
 *                     example: "child_001"
 *                   situation:
 *                     type: string
 *                     description: "具体情况描述（可选）"
 *                     example: "孩子最近总是挑食，只吃零食"
 *             example:
 *               question: "孩子不爱吃饭怎么办？"
 *               context:
 *                 childId: "child_001"
 *                 situation: "孩子最近总是挑食，只吃零食"
 *     responses:
 *       200:
 *         description: "回答成功"
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
 *                     answer:
 *                       type: string
 *                       description: "AI生成的专业回答"
 *                       example: "孩子不爱吃饭是常见问题，建议从以下几方面入手：1. 营造愉快的就餐氛围..."
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: "具体建议列表"
 *                       example: ["定时定量", "增加食物趣味性", "家长以身作则"]
 *                     relatedTopics:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: "相关话题"
 *                       example: ["营养搭配", "饮食习惯培养"]
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:30:00.000Z"
 *       400:
 *         description: "请求参数错误"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "问题内容不能为空"
 *       401:
 *         description: "未授权访问"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "未授权访问"
 *       500:
 *         description: "服务器错误"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "服务器内部错误"
*/
router.post('/answer', parentAssistantController.answerQuestion);

/**
* @swagger
 * /api/parent-assistant/quick-questions:
 *   get:
 *     tags: [家长助手服务]
 *     summary: "获取快捷问题"
 *     description: "获取家长常问的快捷问题列表，帮助家长快速找到想要咨询的内容"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [health, education, nutrition, behavior, development, daily]
 *           description: "问题分类"
 *           example: "nutrition"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 50
 *           default: 10
 *           description: "返回数量限制"
 *           example: 10
 *     responses:
 *       200:
 *         description: "获取成功"
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
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             description: "问题ID"
 *                             example: "quick_001"
 *                           question:
 *                             type: string
 *                             description: "问题内容"
 *                             example: "如何培养孩子的独立性？"
 *                           category:
 *                             type: string
 *                             description: "问题分类"
 *                             example: "education"
 *                           frequency:
 *                             type: integer
 *                             description: "提问频率"
 *                             example: 15
 *                           tags:
 *                             type: array
 *                             items:
 *                               type: string
 *                             description: "问题标签"
 *                             example: ["独立性", "自理能力", "成长"]
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                             description: "分类代码"
 *                             example: "health"
 *                           name:
 *                             type: string
 *                             description: "分类名称"
 *                             example: "健康保健"
 *                           count:
 *                             type: integer
 *                             description: "该分类下问题数量"
 *                             example: 25
 *                     total:
 *                       type: integer
 *                       description: "总问题数"
 *                       example: 120
 *       401:
 *         description: "未授权访问"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "未授权访问"
 *       500:
 *         description: "服务器错误"
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "服务器内部错误"
*/
router.get('/quick-questions', parentAssistantController.getQuickQuestions);

/**
* @swagger
 * /api/parent-assistant/statistics:
 *   get:
 *     tags: [家长助手服务]
 *     summary: "获取统计数据"
 *     description: "获取家长助手的使用统计数据"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "获取成功"
 */
router.get('/statistics', parentAssistantController.getStatistics);

/**
* @swagger
 * /api/parent-assistant/history:
 *   get:
 *     tags: [家长助手服务]
 *     summary: "获取对话历史"
 *     description: "获取家长的对话历史记录"
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: "获取成功"
 */
router.get('/history', parentAssistantController.getHistory);

/**
* @swagger
 * /api/parent-assistant/search:
 *   get:
 *     tags: [家长助手服务]
 *     summary: "搜索对话历史"
 *     description: "根据关键词搜索对话历史"
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: keyword
 *         required: true
 *         schema:
 *           type: string
 *         description: "搜索关键词"
 *     responses:
 *       200:
 *         description: "搜索成功"
 */
router.get('/search', parentAssistantController.searchHistory);

export default router;





