/**
* @swagger
 * components:
 *   schemas:
 *     Sequelize-meta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Sequelize-meta ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Sequelize-meta 名称
 *           example: "示例Sequelize-meta"
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
 *     CreateSequelize-metaRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Sequelize-meta 名称
 *           example: "新Sequelize-meta"
 *     UpdateSequelize-metaRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Sequelize-meta 名称
 *           example: "更新后的Sequelize-meta"
 *     Sequelize-metaListResponse:
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
 *                 $ref: '#/components/schemas/Sequelize-meta'
 *         message:
 *           type: string
 *           example: "获取sequelize-meta列表成功"
 *     Sequelize-metaResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Sequelize-meta'
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
 * sequelize-meta管理路由文件
 * 提供sequelize-meta的基础CRUD操作
*
 * 功能包括：
 * - 获取sequelize-meta列表
 * - 创建新sequelize-meta
 * - 获取sequelize-meta详情
 * - 更新sequelize-meta信息
 * - 删除sequelize-meta
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * sequelize_meta 路由文件
 * 自动生成 - 2025-07-20T21:41:14.890Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { SequelizeMeta } from '../models/sequelizemeta.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/sequelize-meta:
 *   get:
 *     summary: 获取sequelize_meta列表
 *     tags: [SequelizeMeta]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await SequelizeMeta.findAll();
    return ApiResponse.success(res, { list }, '获取sequelize_meta列表成功');
  } catch (error) {
    console.error('[SEQUELIZEMETA]: 获取sequelize_meta列表失败:', error);
    return ApiResponse.error(res, '获取sequelize_meta列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/sequelize-meta:
 *   post:
 *     summary: 创建sequelize_meta
 *     tags: [SequelizeMeta]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await SequelizeMeta.create(req.body);
    return ApiResponse.success(res, item, '创建sequelize_meta成功');
  } catch (error) {
    console.error('[SEQUELIZEMETA]: 创建sequelize_meta失败:', error);
    return ApiResponse.error(res, '创建sequelize_meta失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/sequelize-meta/{id}:
 *   get:
 *     summary: 获取sequelize_meta详情
 *     tags: [SequelizeMeta]
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
    const item = await SequelizeMeta.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'sequelize_meta不存在');
    }
    
    return ApiResponse.success(res, item, '获取sequelize_meta详情成功');
  } catch (error) {
    console.error('[SEQUELIZEMETA]: 获取sequelize_meta详情失败:', error);
    return ApiResponse.error(res, '获取sequelize_meta详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/sequelize-meta/{id}:
 *   put:
 *     summary: 更新sequelize_meta
 *     tags: [SequelizeMeta]
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
router.put('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const [updatedRowsCount] = await SequelizeMeta.update(req.body, {
      where: { name }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'sequelize_meta不存在');
    }
    
    const updatedItem = await SequelizeMeta.findByPk(name);
    return ApiResponse.success(res, updatedItem, '更新sequelize_meta成功');
  } catch (error) {
    console.error('[SEQUELIZEMETA]: 更新sequelize_meta失败:', error);
    return ApiResponse.error(res, '更新sequelize_meta失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/sequelize-meta/{id}:
 *   delete:
 *     summary: 删除sequelize_meta
 *     tags: [SequelizeMeta]
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
router.delete('/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const deletedRowsCount = await SequelizeMeta.destroy({
      where: { name }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'sequelize_meta不存在');
    }
    
    return ApiResponse.success(res, null, '删除sequelize_meta成功');
  } catch (error) {
    console.error('[SEQUELIZEMETA]: 删除sequelize_meta失败:', error);
    return ApiResponse.error(res, '删除sequelize_meta失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
