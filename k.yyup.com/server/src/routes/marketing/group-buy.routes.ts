/**
 * 团购路由
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../../middlewares/auth.middleware';
import GroupBuyController from '../../controllers/marketing/group-buy.controller';

const router = express.Router();

// 验证规则
const createGroupBuyValidation = [
  body('activityId')
    .isInt({ min: 1 })
    .withMessage('活动ID必须是正整数'),
  body('targetPeople')
    .optional()
    .isInt({ min: 2, max: 50 })
    .withMessage('目标人数必须在2-50人之间'),
  body('maxPeople')
    .optional()
    .isInt({ min: 2, max: 100 })
    .withMessage('最大人数必须在2-100人之间'),
  body('groupPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('团购价格必须大于等于0'),
  body('deadlineHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('截止时间必须在1-168小时之间'),
];

const joinGroupBuyValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('团购ID必须是正整数'),
  body('inviteCode')
    .optional()
    .isString()
    .withMessage('邀请码必须是字符串'),
  body('inviterId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('邀请人ID必须是正整数'),
];

const getGroupBuyListValidation = [
  query('activityId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('活动ID必须是正整数'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('用户ID必须是正整数'),
  query('status')
    .optional()
    .isIn(['pending', 'in_progress', 'completed', 'failed', 'expired'])
    .withMessage('团购状态无效'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
];

const getGroupBuyDetailValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('团购ID必须是正整数'),
];

const shareGroupBuyValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('团购ID必须是正整数'),
  body('shareChannel')
    .isIn(['wechat', 'weibo', 'qq', 'link', 'qrcode', 'other'])
    .withMessage('分享渠道无效'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupBuy:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 团购ID
 *         activityId:
 *           type: integer
 *           description: 活动ID
 *         groupLeaderId:
 *           type: integer
 *           description: 开团者ID
 *         groupCode:
 *           type: string
 *           description: 团购码
 *         targetPeople:
 *           type: integer
 *           description: 目标人数
 *         currentPeople:
 *           type: integer
 *           description: 当前人数
 *         maxPeople:
 *           type: integer
 *           description: 最大人数
 *         groupPrice:
 *           type: number
 *           description: 团购价格
 *         originalPrice:
 *           type: number
 *           description: 原价
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: 截止时间
 *         status:
 *           type: string
 *           enum: [pending, in_progress, completed, failed, expired]
 *           description: 团购状态
 *         shareCount:
 *           type: integer
 *           description: 分享次数
 *         viewCount:
 *           type: integer
 *           description: 浏览次数
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 */

/**
 * @swagger
 * /api/marketing/group-buy:
 *   post:
 *     summary: 创建团购（开团）
 *     tags: [团购管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityId
 *             properties:
 *               activityId:
 *                 type: integer
 *                 description: 活动ID
 *               targetPeople:
 *                 type: integer
 *                 description: 目标人数
 *               maxPeople:
 *                 type: integer
 *                 description: 最大人数
 *               groupPrice:
 *                 type: number
 *                 description: 团购价格
 *               deadlineHours:
 *                 type: integer
 *                 description: 截止时间（小时）
 *     responses:
 *       200:
 *         description: 开团成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/GroupBuy'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */

/**
 * @swagger
 * /api/marketing/group-buy/{id}/join:
 *   post:
 *     summary: 参与团购
 *     tags: [团购管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 团购ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               inviteCode:
 *                 type: string
 *                 description: 邀请码
 *               inviterId:
 *                 type: integer
 *                 description: 邀请人ID
 *     responses:
 *       200:
 *         description: 参团成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */

/**
 * @swagger
 * /api/marketing/group-buy:
 *   get:
 *     summary: 获取团购列表
 *     tags: [团购管理]
 *     parameters:
 *       - in: query
 *         name: activityId
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 用户ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, failed, expired]
 *         description: 团购状态
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/GroupBuy'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 */

/**
 * @swagger
 * /api/marketing/group-buy/{id}:
 *   get:
 *     summary: 获取团购详情
 *     tags: [团购管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 团购ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/GroupBuy'
 */

/**
 * @swagger
 * /api/marketing/group-buy/{id}/share:
 *   post:
 *     summary: 分享团购
 *     tags: [团购管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 团购ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - shareChannel
 *             properties:
 *               shareChannel:
 *                 type: string
 *                 enum: [wechat, weibo, qq, link, qrcode, other]
 *                 description: 分享渠道
 *     responses:
 *       200:
 *         description: 分享成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */

/**
 * @swagger
 * /api/marketing/group-buy/my:
 *   get:
 *     summary: 我的团购
 *     tags: [团购管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, failed, expired]
 *         description: 团购状态
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         description: 未授权
 */
router.get('/my', authMiddleware, GroupBuyController.getMyGroupBuys);

/**
 * @swagger
 * /api/marketing/group-buy/activity/{activityId}:
 *   get:
 *     summary: 活动团购列表
 *     tags: [团购管理]
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 活动ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed, failed, expired]
 *         description: 团购状态
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: pageSize
 *         schema:
 *           type: integer
 *           default: 20
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/activity/:activityId', GroupBuyController.getActivityGroupBuys);

/**
 * @swagger
 * /api/marketing/group-buy/check-expired:
 *   post:
 *     summary: 检查过期团购
 *     tags: [团购管理]
 *     description: 定时任务接口，检查并处理过期的团购
 *     responses:
 *       200:
 *         description: 检查完成
 */
router.post('/check-expired', GroupBuyController.checkExpiredGroupBuys);

export default router;