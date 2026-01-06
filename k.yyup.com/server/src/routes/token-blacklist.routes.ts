/**
* @swagger
 * components:
 *   schemas:
 *     Token-blacklist:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Token-blacklist ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Token-blacklist 名称
 *           example: "示例Token-blacklist"
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
 *     CreateToken-blacklistRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Token-blacklist 名称
 *           example: "新Token-blacklist"
 *     UpdateToken-blacklistRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Token-blacklist 名称
 *           example: "更新后的Token-blacklist"
 *     Token-blacklistListResponse:
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
 *                 $ref: '#/components/schemas/Token-blacklist'
 *         message:
 *           type: string
 *           example: "获取token-blacklist列表成功"
 *     Token-blacklistResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Token-blacklist'
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
 * token-blacklist管理路由文件
 * 提供token-blacklist的基础CRUD操作
*
 * 功能包括：
 * - 获取token-blacklist列表
 * - 创建新token-blacklist
 * - 获取token-blacklist详情
 * - 更新token-blacklist信息
 * - 删除token-blacklist
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * token_blacklist 路由文件
 * 自动生成 - 2025-07-20T21:41:14.891Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { TokenBlacklist } from '../models/tokenblacklist.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/token-blacklist:
 *   get:
 *     summary: 获取token_blacklist列表
 *     tags: [TokenBlacklist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await TokenBlacklist.findAll();
    return ApiResponse.success(res, { list }, '获取token_blacklist列表成功');
  } catch (error) {
    console.error('[TOKEN]: 获取token_blacklist列表失败:', error);
    return ApiResponse.error(res, '获取token_blacklist列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/token-blacklist:
 *   post:
 *     summary: 创建token_blacklist
 *     tags: [TokenBlacklist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await TokenBlacklist.create(req.body);
    return ApiResponse.success(res, item, '创建token_blacklist成功');
  } catch (error) {
    console.error('[TOKEN]: 创建token_blacklist失败:', error);
    return ApiResponse.error(res, '创建token_blacklist失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/token-blacklist/{id}:
 *   get:
 *     summary: 获取token_blacklist详情
 *     tags: [TokenBlacklist]
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
    const item = await TokenBlacklist.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'token_blacklist不存在');
    }
    
    return ApiResponse.success(res, item, '获取token_blacklist详情成功');
  } catch (error) {
    console.error('[TOKEN]: 获取token_blacklist详情失败:', error);
    return ApiResponse.error(res, '获取token_blacklist详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/token-blacklist/{id}:
 *   put:
 *     summary: 更新token_blacklist
 *     tags: [TokenBlacklist]
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
    const [updatedRowsCount] = await TokenBlacklist.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'token_blacklist不存在');
    }
    
    const updatedItem = await TokenBlacklist.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新token_blacklist成功');
  } catch (error) {
    console.error('[TOKEN]: 更新token_blacklist失败:', error);
    return ApiResponse.error(res, '更新token_blacklist失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/token-blacklist/{id}:
 *   delete:
 *     summary: 删除token_blacklist
 *     tags: [TokenBlacklist]
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
    const deletedRowsCount = await TokenBlacklist.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'token_blacklist不存在');
    }
    
    return ApiResponse.success(res, null, '删除token_blacklist成功');
  } catch (error) {
    console.error('[TOKEN]: 删除token_blacklist失败:', error);
    return ApiResponse.error(res, '删除token_blacklist失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
