/**
* @swagger
 * components:
 *   schemas:
 *     Media-center:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Media-center ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Media-center 名称
 *           example: "示例Media-center"
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
 *     CreateMedia-centerRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Media-center 名称
 *           example: "新Media-center"
 *     UpdateMedia-centerRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Media-center 名称
 *           example: "更新后的Media-center"
 *     Media-centerListResponse:
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
 *                 $ref: '#/components/schemas/Media-center'
 *         message:
 *           type: string
 *           example: "获取media-center列表成功"
 *     Media-centerResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Media-center'
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
 * media-center管理路由文件
 * 提供media-center的基础CRUD操作
*
 * 功能包括：
 * - 获取media-center列表
 * - 创建新media-center
 * - 获取media-center详情
 * - 更新media-center信息
 * - 删除media-center
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { MediaCenterController } from '../controllers/media-center.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/media-center/recent-creations:
 *   get:
 *     summary: 获取最近创作列表
 *     tags: [MediaCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回数量限制
 *     responses:
 *       200:
 *         description: 成功获取最近创作列表
*/
router.get('/recent-creations', MediaCenterController.getRecentCreations);

/**
* @swagger
 * /api/media-center/history:
 *   get:
 *     summary: 获取创作历史
 *     tags: [MediaCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [copywriting, article, video, tts]
 *         description: 内容类型
 *       - in: query
 *         name: platform
 *         schema:
 *           type: string
 *         description: 平台名称
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *         description: 搜索关键词
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
 *     responses:
 *       200:
 *         description: 成功获取创作历史
*/
router.get('/history', MediaCenterController.getCreationHistory);

/**
* @swagger
 * /api/media-center/statistics:
 *   get:
 *     summary: 获取统计数据
 *     tags: [MediaCenter]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计数据
*/
router.get('/statistics', MediaCenterController.getStatistics);

/**
* @swagger
 * /api/media-center/content:
 *   post:
 *     summary: 创建媒体内容
 *     tags: [MediaCenter]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - type
 *               - platform
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 内容标题
 *               type:
 *                 type: string
 *                 enum: [copywriting, article, video, tts]
 *                 description: 内容类型
 *               platform:
 *                 type: string
 *                 description: 发布平台
 *               content:
 *                 type: string
 *                 description: 内容正文
 *               preview:
 *                 type: string
 *                 description: 内容预览
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 关键词列表
 *               style:
 *                 type: string
 *                 enum: [warm, professional, lively, elegant, humorous]
 *                 description: 内容风格
 *               settings:
 *                 type: object
 *                 description: 其他设置
 *     responses:
 *       200:
 *         description: 创建成功
*/
router.post('/content', MediaCenterController.createContent);

/**
* @swagger
 * /api/media-center/content/{id}:
 *   get:
 *     summary: 获取内容详情
 *     tags: [MediaCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 内容ID
 *     responses:
 *       200:
 *         description: 成功获取内容详情
*/
router.get('/content/:id', MediaCenterController.getContentDetail);

/**
* @swagger
 * /api/media-center/content/{id}:
 *   put:
 *     summary: 更新媒体内容
 *     tags: [MediaCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 内容ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               platform:
 *                 type: string
 *               keywords:
 *                 type: array
 *                 items:
 *                   type: string
 *               settings:
 *                 type: object
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put('/content/:id', MediaCenterController.updateContent);

/**
* @swagger
 * /api/media-center/content/{id}:
 *   delete:
 *     summary: 删除媒体内容
 *     tags: [MediaCenter]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 内容ID
 *     responses:
 *       200:
 *         description: 删除成功
*/
router.delete('/content/:id', MediaCenterController.deleteContent);

export default router;

