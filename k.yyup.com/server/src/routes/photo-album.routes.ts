/**
 * 相册中心API路由
 * 专门处理相册和照片相关的API请求
*/

import { Router } from 'express';
import { PhotoAlbumController } from '../controllers/photo-album.controller';
import { verifyToken, checkAlbumPermission } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken);

// 对家长用户添加相册权限检查
router.use(checkAlbumPermission);

/**
* @swagger
 * /api/photo-album/stats/overview:
 *   get:
 *     summary: 获取相册统计信息
 *     tags: [PhotoAlbum]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功获取统计信息
*/
router.get('/stats/overview', PhotoAlbumController.getAlbumStats);

/**
* @swagger
 * /api/photo-album/photos:
 *   get:
 *     summary: 获取照片列表（时间轴视图）
 *     tags: [PhotoAlbum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 每页数量
 *       - in: query
 *         name: albumId
 *         schema:
 *           type: integer
 *         description: 相册ID（可选，用于筛选特定相册的照片）
 *     responses:
 *       200:
 *         description: 成功获取照片列表
*/
router.get('/photos', PhotoAlbumController.getPhotos);

/**
* @swagger
 * /api/photo-album:
 *   get:
 *     summary: 获取相册列表
 *     tags: [PhotoAlbum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *         description: 每页数量
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: 相册类型（可选）
 *     responses:
 *       200:
 *         description: 成功获取相册列表
*/
router.get('/', PhotoAlbumController.getAlbums);

/**
* @swagger
 * /api/photo-album/{id}:
 *   get:
 *     summary: 获取相册详情
 *     tags: [PhotoAlbum]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 相册ID
 *     responses:
 *       200:
 *         description: 成功获取相册详情
 *       404:
 *         description: 相册不存在
*/
router.get('/:id', PhotoAlbumController.getAlbumDetail);

export default router;

