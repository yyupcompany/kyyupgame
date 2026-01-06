/**
* @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Coupon ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Coupon 名称
 *           example: "示例Coupon"
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
 *     CreateCouponRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Coupon 名称
 *           example: "新Coupon"
 *     UpdateCouponRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Coupon 名称
 *           example: "更新后的Coupon"
 *     CouponListResponse:
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
 *                 $ref: '#/components/schemas/Coupon'
 *         message:
 *           type: string
 *           example: "获取coupon列表成功"
 *     CouponResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Coupon'
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
 * coupon管理路由文件
 * 提供coupon的基础CRUD操作
*
 * 功能包括：
 * - 获取coupon列表
 * - 创建新coupon
 * - 获取coupon详情
 * - 更新coupon信息
 * - 删除coupon
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * coupons 路由文件
 * 自动生成 - 2025-07-20T21:41:14.878Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { Coupon } from '../models/coupon.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/coupons:
 *   get:
 *     summary: 获取coupons列表
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await Coupon.findAll();
    return ApiResponse.success(res, { list }, '获取coupons列表成功');
  } catch (error) {
    console.error('[COUPONS]: 获取coupons列表失败:', error);
    return ApiResponse.error(res, '获取coupons列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/coupons:
 *   post:
 *     summary: 创建coupons
 *     tags: [Coupon]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await Coupon.create(req.body);
    return ApiResponse.success(res, item, '创建coupons成功');
  } catch (error) {
    console.error('[COUPONS]: 创建coupons失败:', error);
    return ApiResponse.error(res, '创建coupons失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/coupons/{id}:
 *   get:
 *     summary: 获取coupons详情
 *     tags: [Coupon]
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
    const item = await Coupon.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'coupons不存在');
    }
    
    return ApiResponse.success(res, item, '获取coupons详情成功');
  } catch (error) {
    console.error('[COUPONS]: 获取coupons详情失败:', error);
    return ApiResponse.error(res, '获取coupons详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/coupons/{id}:
 *   put:
 *     summary: 更新coupons
 *     tags: [Coupon]
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
    const [updatedRowsCount] = await Coupon.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'coupons不存在');
    }
    
    const updatedItem = await Coupon.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新coupons成功');
  } catch (error) {
    console.error('[COUPONS]: 更新coupons失败:', error);
    return ApiResponse.error(res, '更新coupons失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/coupons/{id}:
 *   delete:
 *     summary: 删除coupons
 *     tags: [Coupon]
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
    const deletedRowsCount = await Coupon.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'coupons不存在');
    }
    
    return ApiResponse.success(res, null, '删除coupons成功');
  } catch (error) {
    console.error('[COUPONS]: 删除coupons失败:', error);
    return ApiResponse.error(res, '删除coupons失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
