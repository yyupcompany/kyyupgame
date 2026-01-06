import { Router } from 'express';
import { PosterUploadController, uploadPosterImageMiddleware } from '../controllers/poster-upload.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { checkPermission } from '../middlewares/auth.middleware';

/**
* @swagger
 * components:
 *   schemas:
 *     Poster-upload:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Poster-upload ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Poster-upload 名称
 *           example: "示例Poster-upload"
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
 *     CreatePoster-uploadRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Poster-upload 名称
 *           example: "新Poster-upload"
 *     UpdatePoster-uploadRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Poster-upload 名称
 *           example: "更新后的Poster-upload"
 *     Poster-uploadListResponse:
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
 *                 $ref: '#/components/schemas/Poster-upload'
 *         message:
 *           type: string
 *           example: "获取poster-upload列表成功"
 *     Poster-uploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Poster-upload'
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
 * poster-upload管理路由文件
 * 提供poster-upload的基础CRUD操作
*
 * 功能包括：
 * - 获取poster-upload列表
 * - 创建新poster-upload
 * - 获取poster-upload详情
 * - 更新poster-upload信息
 * - 删除poster-upload
*
 * 权限要求：需要有效的JWT Token认证
*/


const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const posterUploadController = new PosterUploadController();

/**
* @swagger
 * /poster/upload:
 *   post:
 *     tags: [海报管理]
 *     summary: 上传海报图片
 *     description: 上传海报图片文件，支持JPG、PNG、GIF格式
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 海报图片文件
 *     responses:
 *       201:
 *         description: 海报上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 海报图片上传成功
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       description: 图片访问URL
 *                     originalName:
 *                       type: string
 *                       description: 原始文件名
 *                     filename:
 *                       type: string
 *                       description: 服务器文件名
 *                     size:
 *                       type: integer
 *                       description: 文件大小
 *                     mimetype:
 *                       type: string
 *                       description: 文件MIME类型
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权访问
 *       500:
 *         description: 服务器内部错误
*/
router.post('/upload', checkPermission('PRINCIPAL_POSTER_MANAGE'),
  uploadPosterImageMiddleware.single('file'),
  (req, res) => posterUploadController.uploadPosterImage(req, res)
);

export default router;