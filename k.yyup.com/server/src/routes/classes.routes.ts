/**
* @swagger
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Class ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Class 名称
 *           example: "示例Class"
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
 *     CreateClassRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Class 名称
 *           example: "新Class"
 *     UpdateClassRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Class 名称
 *           example: "更新后的Class"
 *     ClassListResponse:
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
 *                 $ref: '#/components/schemas/Class'
 *         message:
 *           type: string
 *           example: "获取class列表成功"
 *     ClassResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Class'
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
 * class管理路由文件
 * 提供class的基础CRUD操作
*
 * 功能包括：
 * - 获取class列表
 * - 创建新class
 * - 获取class详情
 * - 更新class信息
 * - 删除class
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * classes 路由文件
 * 自动生成 - 2025-07-20T21:41:14.878Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { Class } from '../models/class.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/classes:
 *   get:
 *     summary: 获取classes列表
 *     tags: [Classe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await Class.findAll();
    return ApiResponse.success(res, { list }, '获取classes列表成功');
  } catch (error) {
    console.error('[CLASS]: 获取classes列表失败:', error);
    return ApiResponse.error(res, '获取classes列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/classes:
 *   post:
 *     summary: 创建classes
 *     tags: [Classe]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await Class.create(req.body);
    return ApiResponse.success(res, item, '创建classes成功');
  } catch (error) {
    console.error('[CLASS]: 创建classes失败:', error);
    return ApiResponse.error(res, '创建classes失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/classes/{id}:
 *   get:
 *     summary: 获取classes详情
 *     tags: [Classe]
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
    const item = await Class.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'classes不存在');
    }
    
    return ApiResponse.success(res, item, '获取classes详情成功');
  } catch (error) {
    console.error('[CLASS]: 获取classes详情失败:', error);
    return ApiResponse.error(res, '获取classes详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/classes/{id}:
 *   put:
 *     summary: 更新classes
 *     tags: [Classe]
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
    const [updatedRowsCount] = await Class.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'classes不存在');
    }
    
    const updatedItem = await Class.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新classes成功');
  } catch (error) {
    console.error('[CLASS]: 更新classes失败:', error);
    return ApiResponse.error(res, '更新classes失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/classes/{id}:
 *   delete:
 *     summary: 删除classes
 *     tags: [Classe]
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
    const deletedRowsCount = await Class.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'classes不存在');
    }
    
    return ApiResponse.success(res, null, '删除classes成功');
  } catch (error) {
    console.error('[CLASS]: 删除classes失败:', error);
    return ApiResponse.error(res, '删除classes失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
