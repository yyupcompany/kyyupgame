/**
* @swagger
 * components:
 *   schemas:
 *     Change-log:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Change-log ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Change-log 名称
 *           example: "示例Change-log"
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
 *     CreateChange-logRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Change-log 名称
 *           example: "新Change-log"
 *     UpdateChange-logRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Change-log 名称
 *           example: "更新后的Change-log"
 *     Change-logListResponse:
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
 *                 $ref: '#/components/schemas/Change-log'
 *         message:
 *           type: string
 *           example: "获取change-log列表成功"
 *     Change-logResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Change-log'
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
 * change-log管理路由文件
 * 提供change-log的基础CRUD操作
*
 * 功能包括：
 * - 获取change-log列表
 * - 创建新change-log
 * - 获取change-log详情
 * - 更新change-log信息
 * - 删除change-log
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * change_log 路由文件
 * 自动生成 - 2025-07-20T21:41:14.877Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ChangeLog } from '../models/changelog.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/change-log:
 *   get:
 *     summary: 获取change_log列表
 *     tags: [ChangeLog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await ChangeLog.findAll();
    return ApiResponse.success(res, { list }, '获取change_log列表成功');
  } catch (error) {
    console.error('[CHANGELOG]: 获取change_log列表失败:', error);
    return ApiResponse.error(res, '获取change_log列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/change-log:
 *   post:
 *     summary: 创建change_log
 *     tags: [ChangeLog]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await ChangeLog.create(req.body);
    return ApiResponse.success(res, item, '创建change_log成功');
  } catch (error) {
    console.error('[CHANGELOG]: 创建change_log失败:', error);
    return ApiResponse.error(res, '创建change_log失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/change-log/{id}:
 *   get:
 *     summary: 获取change_log详情
 *     tags: [ChangeLog]
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
    const item = await ChangeLog.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'change_log不存在');
    }
    
    return ApiResponse.success(res, item, '获取change_log详情成功');
  } catch (error) {
    console.error('[CHANGELOG]: 获取change_log详情失败:', error);
    return ApiResponse.error(res, '获取change_log详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/change-log/{id}:
 *   put:
 *     summary: 更新change_log
 *     tags: [ChangeLog]
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
    const [updatedRowsCount] = await ChangeLog.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'change_log不存在');
    }
    
    const updatedItem = await ChangeLog.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新change_log成功');
  } catch (error) {
    console.error('[CHANGELOG]: 更新change_log失败:', error);
    return ApiResponse.error(res, '更新change_log失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/change-log/{id}:
 *   delete:
 *     summary: 删除change_log
 *     tags: [ChangeLog]
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
    const deletedRowsCount = await ChangeLog.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'change_log不存在');
    }
    
    return ApiResponse.success(res, null, '删除change_log成功');
  } catch (error) {
    console.error('[CHANGELOG]: 删除change_log失败:', error);
    return ApiResponse.error(res, '删除change_log失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
