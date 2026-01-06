/**
* @swagger
 * components:
 *   schemas:
 *     Poster-generation:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Poster-generation ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Poster-generation 名称
 *           example: "示例Poster-generation"
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
 *     CreatePoster-generationRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Poster-generation 名称
 *           example: "新Poster-generation"
 *     UpdatePoster-generationRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Poster-generation 名称
 *           example: "更新后的Poster-generation"
 *     Poster-generationListResponse:
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
 *                 $ref: '#/components/schemas/Poster-generation'
 *         message:
 *           type: string
 *           example: "获取poster-generation列表成功"
 *     Poster-generationResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Poster-generation'
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
 * poster-generation管理路由文件
 * 提供poster-generation的基础CRUD操作
*
 * 功能包括：
 * - 获取poster-generation列表
 * - 创建新poster-generation
 * - 获取poster-generation详情
 * - 更新poster-generation信息
 * - 删除poster-generation
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router, Request, Response } from 'express';
import * as posterGenerationController from '../controllers/poster-generation.controller';
import { verifyToken, checkPermission } from '../middlewares';
import { RequestWithUser } from '../types/express';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /poster-generation:
 *   post:
 *     summary: 生成海报
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePosterDto'
 *     responses:
 *       201:
 *         description: 海报生成成功
*/
router.post(
  '/', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.generatePoster
);

/**
* @swagger
 * /poster-generation/generate:
 *   post:
 *     summary: 生成海报（别名路由）
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeneratePosterDto'
 *     responses:
 *       201:
 *         description: 海报生成成功
*/
router.post(
  '/generate', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.generatePoster
);

/**
* @swagger
 * /poster-generation/{id}:
 *   get:
 *     summary: 获取单个海报
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get(
  '/:id', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.getPosterById
);

/**
* @swagger
 * /poster-generation/{id}:
 *   put:
 *     summary: 更新海报
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdatePosterDto'
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put(
  '/:id', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.updatePoster
);

/**
* @swagger
 * /poster-generation/{id}:
 *   delete:
 *     summary: 删除海报
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 删除成功
*/
router.delete(
  '/:id', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.deletePoster
);

/**
* @swagger
 * /poster-generation:
 *   get:
 *     summary: 获取海报列表
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/Page'
 *       - $ref: '#/components/parameters/Limit'
 *       - $ref: '#/components/parameters/SortBy'
 *       - $ref: '#/components/parameters/SortOrder'
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get(
  '/', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.getPosters
);

/**
* @swagger
 * /poster-generation/{id}/preview:
 *   get:
 *     summary: 预览海报
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 预览图URL
*/
router.get(
  '/:id/preview', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.previewPoster
);

/**
* @swagger
 * /poster-generation/{id}/download:
 *   get:
 *     summary: 下载海报
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 海报文件
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
*/
router.get(
  '/:id/download', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.downloadPoster
);

/**
* @swagger
 * /poster-generation/{id}/share:
 *   post:
 *     summary: 分享海报
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               channel:
 *                 type: string
 *                 example: 'wechat'
 *     responses:
 *       200:
 *         description: 分享链接
*/
router.post(
  '/:id/share', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.sharePoster
);

/**
* @swagger
 * /poster-generation/{id}/stats:
 *   get:
 *     summary: 获取海报统计
 *     tags: [海报生成]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 统计数据
*/
router.get(
  '/:id/stats', checkPermission('POSTER_GENERATION_MANAGE'),
  posterGenerationController.getPosterStats
);

export default router;