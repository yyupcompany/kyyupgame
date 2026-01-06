/**
* @swagger
 * components:
 *   schemas:
 *     Like-collect-config:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Like-collect-config ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Like-collect-config 名称
 *           example: "示例Like-collect-config"
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
 *     CreateLike-collect-configRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Like-collect-config 名称
 *           example: "新Like-collect-config"
 *     UpdateLike-collect-configRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Like-collect-config 名称
 *           example: "更新后的Like-collect-config"
 *     Like-collect-configListResponse:
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
 *                 $ref: '#/components/schemas/Like-collect-config'
 *         message:
 *           type: string
 *           example: "获取like-collect-config列表成功"
 *     Like-collect-configResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Like-collect-config'
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
 * like-collect-config管理路由文件
 * 提供like-collect-config的基础CRUD操作
*
 * 功能包括：
 * - 获取like-collect-config列表
 * - 创建新like-collect-config
 * - 获取like-collect-config详情
 * - 更新like-collect-config信息
 * - 删除like-collect-config
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * like_collect_config 路由文件
 * 自动生成 - 2025-07-20T21:41:14.885Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { LikeCollectConfig } from '../models/likecollectconfig.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/like-collect-config:
 *   get:
 *     summary: 获取like_collect_config列表
 *     tags: [LikeCollectConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await LikeCollectConfig.findAll();
    return ApiResponse.success(res, { list }, '获取like_collect_config列表成功');
  } catch (error) {
    console.error('[LIKECOLLECTCONFIG]: 获取like_collect_config列表失败:', error);
    return ApiResponse.error(res, '获取like_collect_config列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/like-collect-config:
 *   post:
 *     summary: 创建like_collect_config
 *     tags: [LikeCollectConfig]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await LikeCollectConfig.create(req.body);
    return ApiResponse.success(res, item, '创建like_collect_config成功');
  } catch (error) {
    console.error('[LIKECOLLECTCONFIG]: 创建like_collect_config失败:', error);
    return ApiResponse.error(res, '创建like_collect_config失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/like-collect-config/{id}:
 *   get:
 *     summary: 获取like_collect_config详情
 *     tags: [LikeCollectConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LikeCollectConfig.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'like_collect_config不存在');
    }
    
    return ApiResponse.success(res, item, '获取like_collect_config详情成功');
  } catch (error) {
    console.error('[LIKECOLLECTCONFIG]: 获取like_collect_config详情失败:', error);
    return ApiResponse.error(res, '获取like_collect_config详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/like-collect-config/{id}:
 *   put:
 *     summary: 更新like_collect_config
 *     tags: [LikeCollectConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 更新成功
*/
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [updatedRowsCount] = await LikeCollectConfig.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'like_collect_config不存在');
    }
    
    const updatedItem = await LikeCollectConfig.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新like_collect_config成功');
  } catch (error) {
    console.error('[LIKECOLLECTCONFIG]: 更新like_collect_config失败:', error);
    return ApiResponse.error(res, '更新like_collect_config失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/like-collect-config/{id}:
 *   delete:
 *     summary: 删除like_collect_config
 *     tags: [LikeCollectConfig]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 删除成功
*/
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedRowsCount = await LikeCollectConfig.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'like_collect_config不存在');
    }
    
    return ApiResponse.success(res, null, '删除like_collect_config成功');
  } catch (error) {
    console.error('[LIKECOLLECTCONFIG]: 删除like_collect_config失败:', error);
    return ApiResponse.error(res, '删除like_collect_config失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
