/**
* @swagger
 * components:
 *   schemas:
 *     Personal-poster:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Personal-poster ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Personal-poster 名称
 *           example: "示例Personal-poster"
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
 *     CreatePersonal-posterRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Personal-poster 名称
 *           example: "新Personal-poster"
 *     UpdatePersonal-posterRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Personal-poster 名称
 *           example: "更新后的Personal-poster"
 *     Personal-posterListResponse:
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
 *                 $ref: '#/components/schemas/Personal-poster'
 *         message:
 *           type: string
 *           example: "获取personal-poster列表成功"
 *     Personal-posterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Personal-poster'
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
 * personal-poster管理路由文件
 * 提供personal-poster的基础CRUD操作
*
 * 功能包括：
 * - 获取personal-poster列表
 * - 创建新personal-poster
 * - 获取personal-poster详情
 * - 更新personal-poster信息
 * - 删除personal-poster
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * personal_posters 路由文件
 * 自动生成 - 2025-07-20T21:41:14.887Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { PersonalPoster } from '../models/personalposter.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/personal-posters:
 *   get:
 *     summary: 获取personal_posters列表
 *     tags: [PersonalPoster]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await PersonalPoster.findAll();
    return ApiResponse.success(res, { list }, '获取personal_posters列表成功');
  } catch (error) {
    console.error('[POSTER]: 获取personal_posters列表失败:', error);
    return ApiResponse.error(res, '获取personal_posters列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/personal-posters:
 *   post:
 *     summary: 创建personal_posters
 *     tags: [PersonalPoster]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await PersonalPoster.create(req.body);
    return ApiResponse.success(res, item, '创建personal_posters成功');
  } catch (error) {
    console.error('[POSTER]: 创建personal_posters失败:', error);
    return ApiResponse.error(res, '创建personal_posters失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/personal-posters/{id}:
 *   get:
 *     summary: 获取personal_posters详情
 *     tags: [PersonalPoster]
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
    const item = await PersonalPoster.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'personal_posters不存在');
    }
    
    return ApiResponse.success(res, item, '获取personal_posters详情成功');
  } catch (error) {
    console.error('[POSTER]: 获取personal_posters详情失败:', error);
    return ApiResponse.error(res, '获取personal_posters详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/personal-posters/{id}:
 *   put:
 *     summary: 更新personal_posters
 *     tags: [PersonalPoster]
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
    const [updatedRowsCount] = await PersonalPoster.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'personal_posters不存在');
    }
    
    const updatedItem = await PersonalPoster.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新personal_posters成功');
  } catch (error) {
    console.error('[POSTER]: 更新personal_posters失败:', error);
    return ApiResponse.error(res, '更新personal_posters失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/personal-posters/{id}:
 *   delete:
 *     summary: 删除personal_posters
 *     tags: [PersonalPoster]
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
    const deletedRowsCount = await PersonalPoster.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'personal_posters不存在');
    }
    
    return ApiResponse.success(res, null, '删除personal_posters成功');
  } catch (error) {
    console.error('[POSTER]: 删除personal_posters失败:', error);
    return ApiResponse.error(res, '删除personal_posters失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
