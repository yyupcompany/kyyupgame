/**
* @swagger
 * components:
 *   schemas:
 *     Referral-reward:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Referral-reward ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Referral-reward 名称
 *           example: "示例Referral-reward"
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
 *     CreateReferral-rewardRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Referral-reward 名称
 *           example: "新Referral-reward"
 *     UpdateReferral-rewardRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Referral-reward 名称
 *           example: "更新后的Referral-reward"
 *     Referral-rewardListResponse:
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
 *                 $ref: '#/components/schemas/Referral-reward'
 *         message:
 *           type: string
 *           example: "获取referral-reward列表成功"
 *     Referral-rewardResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Referral-reward'
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
 * referral-reward管理路由文件
 * 提供referral-reward的基础CRUD操作
*
 * 功能包括：
 * - 获取referral-reward列表
 * - 创建新referral-reward
 * - 获取referral-reward详情
 * - 更新referral-reward信息
 * - 删除referral-reward
*
 * 权限要求：需要有效的JWT Token认证
*/

/**
 * referral_rewards 路由文件
 * 自动生成 - 2025-07-20T21:41:14.888Z
*/

import * as express from 'express';
import { verifyToken } from '../middlewares/auth.middleware';
import { ReferralReward } from '../models/referralreward.model';
import { ApiResponse } from '../utils/apiResponse';

const router = express.Router();

// 使用认证中间件
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/referral-rewards:
 *   get:
 *     summary: 获取referral_rewards列表
 *     tags: [ReferralReward]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
*/
router.get('/', async (req, res) => {
  try {
    const list = await ReferralReward.findAll();
    return ApiResponse.success(res, { list }, '获取referral_rewards列表成功');
  } catch (error) {
    console.error('[REFERRAL]: 获取referral_rewards列表失败:', error);
    return ApiResponse.error(res, '获取referral_rewards列表失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/referral-rewards:
 *   post:
 *     summary: 创建referral_rewards
 *     tags: [ReferralReward]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: 创建成功
*/
router.post('/', async (req, res) => {
  try {
    const item = await ReferralReward.create(req.body);
    return ApiResponse.success(res, item, '创建referral_rewards成功');
  } catch (error) {
    console.error('[REFERRAL]: 创建referral_rewards失败:', error);
    return ApiResponse.error(res, '创建referral_rewards失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/referral-rewards/{id}:
 *   get:
 *     summary: 获取referral_rewards详情
 *     tags: [ReferralReward]
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
    const item = await ReferralReward.findByPk(id);
    
    if (!item) {
      return ApiResponse.notFound(res, 'referral_rewards不存在');
    }
    
    return ApiResponse.success(res, item, '获取referral_rewards详情成功');
  } catch (error) {
    console.error('[REFERRAL]: 获取referral_rewards详情失败:', error);
    return ApiResponse.error(res, '获取referral_rewards详情失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/referral-rewards/{id}:
 *   put:
 *     summary: 更新referral_rewards
 *     tags: [ReferralReward]
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
    const [updatedRowsCount] = await ReferralReward.update(req.body, {
      where: { id }
    });
    
    if (updatedRowsCount === 0) {
      return ApiResponse.notFound(res, 'referral_rewards不存在');
    }
    
    const updatedItem = await ReferralReward.findByPk(id);
    return ApiResponse.success(res, updatedItem, '更新referral_rewards成功');
  } catch (error) {
    console.error('[REFERRAL]: 更新referral_rewards失败:', error);
    return ApiResponse.error(res, '更新referral_rewards失败', 'INTERNAL_ERROR', 500);
  }
});

/**
* @swagger
 * /api/referral-rewards/{id}:
 *   delete:
 *     summary: 删除referral_rewards
 *     tags: [ReferralReward]
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
    const deletedRowsCount = await ReferralReward.destroy({
      where: { id }
    });
    
    if (deletedRowsCount === 0) {
      return ApiResponse.notFound(res, 'referral_rewards不存在');
    }
    
    return ApiResponse.success(res, null, '删除referral_rewards成功');
  } catch (error) {
    console.error('[REFERRAL]: 删除referral_rewards失败:', error);
    return ApiResponse.error(res, '删除referral_rewards失败', 'INTERNAL_ERROR', 500);
  }
});

export default router;
