/**
* @swagger
 * components:
 *   schemas:
 *     Like-collect-record:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Like-collect-record ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Like-collect-record 名称
 *           example: "示例Like-collect-record"
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
 *     CreateLike-collect-recordRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Like-collect-record 名称
 *           example: "新Like-collect-record"
 *     UpdateLike-collect-recordRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Like-collect-record 名称
 *           example: "更新后的Like-collect-record"
 *     Like-collect-recordListResponse:
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
 *                 $ref: '#/components/schemas/Like-collect-record'
 *         message:
 *           type: string
 *           example: "获取like-collect-record列表成功"
 *     Like-collect-recordResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Like-collect-record'
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
 * like-collect-record管理路由文件
 * 提供like-collect-record的基础CRUD操作
*
 * 功能包括：
 * - 获取like-collect-record列表
 * - 创建新like-collect-record
 * - 获取like-collect-record详情
 * - 更新like-collect-record信息
 * - 删除like-collect-record
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * like_collect_records 路由文件
 * 自动生成 - 2025-07-20T21:41:14.885Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { LikeCollectRecord } from '../models/likecollectrecord.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/like-collect-records:
 *   get:
 *     summary: 获取like_collect_records列表
 *     tags: [LikeCollectRecord]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await LikeCollectRecord.findAll();
    return ApiResponse.success(res, { list }, '获取like_collect_records列表成功');
  } catch (error) {
    console.error('[LIKECOLLECTRECORDS]: 获取like_collect_records列表失败:', error);
    return ApiResponse.error(res, '获取like_collect_records列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/like-collect-records:
 *   post:
 *     summary: 创建like_collect_records
 *     tags: [LikeCollectRecord]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await LikeCollectRecord.create(req.body);
    return ApiResponse.success(res, item, '创建like_collect_records成功');
  } catch (error) {
    console.error('[LIKECOLLECTRECORDS]: 创建like_collect_records失败:', error);
    return ApiResponse.error(res, '创建like_collect_records失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/like-collect-records/{id}:
 *   get:
 *     summary: 获取like_collect_records详情
 *     tags: [LikeCollectRecord]
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
    const item = await LikeCollectRecord.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'like_collect_records不存在');
    }
    
    return ApiResponse.success(res, item, '获取like_collect_records详情成功');
  } catch (error) {
    console.error('[LIKECOLLECTRECORDS]: 获取like_collect_records详情失败:', error);
    return ApiResponse.error(res, '获取like_collect_records详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/like-collect-records/{id}:
 *   put:
 *     summary: 更新like_collect_records
 *     tags: [LikeCollectRecord]
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
    const [updatedRowsCount] = await LikeCollectRecord.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'like_collect_records不存在');
    }
    
    const updatedItem = await LikeCollectRecord.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新like_collect_records成功');
  } catch (error) {
    console.error('[LIKECOLLECTRECORDS]: 更新like_collect_records失败:', error);
    return ApiResponse.error(res, '更新like_collect_records失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/like-collect-records/{id}:
 *   delete:
 *     summary: 删除like_collect_records
 *     tags: [LikeCollectRecord]
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
    const deletedRowsCount = await LikeCollectRecord.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'like_collect_records不存在');
    }
    
    return ApiResponse.success(res, null, '删除like_collect_records成功');
  } catch (error) {
    console.error('[LIKECOLLECTRECORDS]: 删除like_collect_records失败:', error);
    return ApiResponse.error(res, '删除like_collect_records失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
