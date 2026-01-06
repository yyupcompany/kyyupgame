"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
exports.__esModule = true;
var express_1 = require("express");
var posterGenerationController = __importStar(require("../controllers/poster-generation.controller"));
var middlewares_1 = require("../middlewares");
var router = (0, express_1.Router)();
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
router.post('/', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.generatePoster);
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
router.post('/generate', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.generatePoster);
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
router.get('/:id', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.getPosterById);
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
router.put('/:id', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.updatePoster);
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
router["delete"]('/:id', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.deletePoster);
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
router.get('/', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.getPosters);
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
router.get('/:id/preview', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.previewPoster);
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
router.get('/:id/download', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.downloadPoster);
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
router.post('/:id/share', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.sharePoster);
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
router.get('/:id/stats', middlewares_1.authMiddleware, (0, middlewares_1.checkPermission)('POSTER_GENERATION_MANAGE'), posterGenerationController.getPosterStats);
exports["default"] = router;
