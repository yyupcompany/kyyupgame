/**
* @swagger
 * components:
 *   schemas:
 *     Base:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Base ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Base 名称
 *           example: "示例Base"
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
 *     CreateBaseRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Base 名称
 *           example: "新Base"
 *     UpdateBaseRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Base 名称
 *           example: "更新后的Base"
 *     BaseListResponse:
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
 *                 $ref: '#/components/schemas/Base'
 *         message:
 *           type: string
 *           example: "获取base列表成功"
 *     BaseResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Base'
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
 * base管理路由文件
 * 提供base的基础CRUD操作
*
 * 功能包括：
 * - 获取base列表
 * - 创建新base
 * - 获取base详情
 * - 更新base信息
 * - 删除base
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * base 路由文件
 * 自动生成 - 2025-07-20T21:41:14.877Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { Base } from '../models/base.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/base:
 *   get:
 *     summary: 获取base列表
 *     tags: [Base]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await Base.findAll();
    return ApiResponse.success(res, { list }, '获取base列表成功');
  } catch (error) {
    console.error('[BASE]: 获取base列表失败:', error);
    return ApiResponse.error(res, '获取base列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/base:
 *   post:
 *     summary: 创建base
 *     tags: [Base]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await Base.create(req.body);
    return ApiResponse.success(res, item, '创建base成功');
  } catch (error) {
    console.error('[BASE]: 创建base失败:', error);
    return ApiResponse.error(res, '创建base失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/base/{id}:
 *   get:
 *     summary: 获取base详情
 *     tags: [Base]
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
    const item = await Base.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'base不存在');
    }
    
    return ApiResponse.success(res, item, '获取base详情成功');
  } catch (error) {
    console.error('[BASE]: 获取base详情失败:', error);
    return ApiResponse.error(res, '获取base详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/base/{id}:
 *   put:
 *     summary: 更新base
 *     tags: [Base]
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
    const [updatedRowsCount] = await Base.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'base不存在');
    }
    
    const updatedItem = await Base.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新base成功');
  } catch (error) {
    console.error('[BASE]: 更新base失败:', error);
    return ApiResponse.error(res, '更新base失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/base/{id}:
 *   delete:
 *     summary: 删除base
 *     tags: [Base]
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
    const deletedRowsCount = await Base.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'base不存在');
    }
    
    return ApiResponse.success(res, null, '删除base成功');
  } catch (error) {
    console.error('[BASE]: 删除base失败:', error);
    return ApiResponse.error(res, '删除base失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
