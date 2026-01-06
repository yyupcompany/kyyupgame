/**
* @swagger
 * components:
 *   schemas:
 *     Channel:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Channel ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Channel 名称
 *           example: "示例Channel"
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
 *     CreateChannelRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Channel 名称
 *           example: "新Channel"
 *     UpdateChannelRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Channel 名称
 *           example: "更新后的Channel"
 *     ChannelListResponse:
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
 *                 $ref: '#/components/schemas/Channel'
 *         message:
 *           type: string
 *           example: "获取channel列表成功"
 *     ChannelResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Channel'
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
 * channel管理路由文件
 * 提供channel的基础CRUD操作
*
 * 功能包括：
 * - 获取channel列表
 * - 创建新channel
 * - 获取channel详情
 * - 更新channel信息
 * - 删除channel
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * channels 路由文件
 * 自动生成 - 2025-07-20T21:41:14.877Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { Channel } from '../models/channel.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/channels:
 *   get:
 *     summary: 获取channels列表
 *     tags: [Channel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await Channel.findAll();
    return ApiResponse.success(res, { list }, '获取channels列表成功');
  } catch (error) {
    console.error('[CHANNELS]: 获取channels列表失败:', error);
    return ApiResponse.error(res, '获取channels列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/channels:
 *   post:
 *     summary: 创建channels
 *     tags: [Channel]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await Channel.create(req.body);
    return ApiResponse.success(res, item, '创建channels成功');
  } catch (error) {
    console.error('[CHANNELS]: 创建channels失败:', error);
    return ApiResponse.error(res, '创建channels失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/channels/{id}:
 *   get:
 *     summary: 获取channels详情
 *     tags: [Channel]
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
    const item = await Channel.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'channels不存在');
    }
    
    return ApiResponse.success(res, item, '获取channels详情成功');
  } catch (error) {
    console.error('[CHANNELS]: 获取channels详情失败:', error);
    return ApiResponse.error(res, '获取channels详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/channels/{id}:
 *   put:
 *     summary: 更新channels
 *     tags: [Channel]
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
    const [updatedRowsCount] = await Channel.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'channels不存在');
    }
    
    const updatedItem = await Channel.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新channels成功');
  } catch (error) {
    console.error('[CHANNELS]: 更新channels失败:', error);
    return ApiResponse.error(res, '更新channels失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/channels/{id}:
 *   delete:
 *     summary: 删除channels
 *     tags: [Channel]
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
    const deletedRowsCount = await Channel.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'channels不存在');
    }
    
    return ApiResponse.success(res, null, '删除channels成功');
  } catch (error) {
    console.error('[CHANNELS]: 删除channels失败:', error);
    return ApiResponse.error(res, '删除channels失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
