/**
* @swagger
 * components:
 *   schemas:
 *     SequelizeMeta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: SequelizeMeta ID
 *           example: 1
 *         name:
 *           type: string
 *           description: SequelizeMeta 名称
 *           example: "示例SequelizeMeta"
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
 *     CreateSequelizeMetaRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: SequelizeMeta 名称
 *           example: "新SequelizeMeta"
 *     UpdateSequelizeMetaRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: SequelizeMeta 名称
 *           example: "更新后的SequelizeMeta"
 *     SequelizeMetaListResponse:
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
 *                 $ref: '#/components/schemas/SequelizeMeta'
 *         message:
 *           type: string
 *           example: "获取SequelizeMeta列表成功"
 *     SequelizeMetaResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/SequelizeMeta'
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
 * SequelizeMeta管理路由文件
 * 提供SequelizeMeta的基础CRUD操作
*
 * 功能包括：
 * - 获取SequelizeMeta列表
 * - 创建新SequelizeMeta
 * - 获取SequelizeMeta详情
 * - 更新SequelizeMeta信息
 * - 删除SequelizeMeta
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * SequelizeMeta 路由文件
 * 自动生成 - 2025-07-20T21:41:14.871Z
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
 * /api/SequelizeMeta:
 *   get:
 *     summary: 获取数据库迁移记录列表
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
    return ApiResponse.success(res, { list }, '获取迁移记录列表成功');
  } catch (error) {
    console.error('[SEQUELIZEMETA]: 获取迁移记录列表失败:', error);
    return ApiResponse.error(res, '获取迁移记录列表失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;