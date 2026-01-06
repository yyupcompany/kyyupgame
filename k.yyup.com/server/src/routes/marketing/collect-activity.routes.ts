/**
 * 积攒活动路由
 */

import express from 'express';
import { body, param, query } from 'express-validator';
import { authMiddleware } from '../../middlewares/auth.middleware';
import CollectActivityController from '../../controllers/marketing/collect-activity.controller';

const router = express.Router();

// 验证规则
const createCollectActivityValidation = [
  body('activityId')
    .isInt({ min: 1 })
    .withMessage('活动ID必须是正整数'),
  body('targetCount')
    .optional()
    .isInt({ min: 10, max: 1000 })
    .withMessage('目标人数必须在10-1000人之间'),
  body('maxCount')
    .optional()
    .isInt({ min: 10, max: 10000 })
    .withMessage('最大人数必须在10-10000人之间'),
  body('rewardType')
    .optional()
    .isIn(['discount', 'gift', 'free', 'points'])
    .withMessage('奖励类型无效'),
  body('rewardValue')
    .optional()
    .isString()
    .withMessage('奖励值必须是字符串'),
  body('deadlineHours')
    .optional()
    .isInt({ min: 1, max: 168 })
    .withMessage('截止时间必须在1-168小时之间'),
];

const helpCollectValidation = [
  body('collectCode')
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('积攒码长度必须在1-20字符之间'),
  body('inviterId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('邀请人ID必须是正整数'),
];

const getCollectActivityListValidation = [
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
    .isIn(['active', 'completed', 'expired', 'cancelled'])
    .withMessage('积攒状态无效'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是正整数'),
  query('pageSize')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须在1-100之间'),
];

const getCollectActivityDetailValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('积攒活动ID必须是正整数'),
];

const shareCollectActivityValidation = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('积攒活动ID必须是正整数'),
  body('shareChannel')
    .isIn(['wechat', 'weibo', 'qq', 'link', 'qrcode', 'other'])
    .withMessage('分享渠道无效'),
];

const getCollectActivityByCodeValidation = [
  param('code')
    .isString()
    .isLength({ min: 1, max: 20 })
    .withMessage('积攒码长度必须在1-20字符之间'),
];

/**
 * @swagger
 * components:
 *   schemas:
 *     CollectActivity:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 积攒活动ID
 *         activityId:
 *           type: integer
 *           description: 活动ID
 *         userId:
 *           type: integer
 *           description: 发起者用户ID
 *         collectCode:
 *           type: string
 *           description: 积攒码
 *         targetCount:
 *           type: integer
 *           description: 目标积攒数
 *         currentCount:
 *           type: integer
 *           description: 当前积攒数
 *         maxCount:
 *           type: integer
 *           description: 最大积攒数
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: 截止时间
 *         status:
 *           type: string
 *           enum: [active, completed, expired, cancelled]
 *           description: 积攒状态
 *         rewardType:
 *           type: string
 *           enum: [discount, gift, free, points]
 *           description: 奖励类型
 *         rewardValue:
 *           type: string
 *           description: 奖励值
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
 * /api/marketing/collect-activity:
 *   post:
 *     summary: 创建积攒活动
 *     tags: [积攒管理]
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
 *               targetCount:
 *                 type: integer
 *                 description: 目标积攒数
 *               maxCount:
 *                 type: integer
 *                 description: 最大积攒数
 *               rewardType:
 *                 type: string
 *                 enum: [discount, gift, free, points]
 *                 description: 奖励类型
 *               rewardValue:
 *                 type: string
 *                 description: 奖励值
 *               deadlineHours:
 *                 type: integer
 *                 description: 截止时间（小时）
 *     responses:
 *       200:
 *         description: 创建成功
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
 *                   $ref: '#/components/schemas/CollectActivity'
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */

/**
 * @swagger
 * /api/marketing/collect-activity/help:
 *   post:
 *     summary: 助力积攒
 *     tags: [积攒管理]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - collectCode
 *             properties:
 *               collectCode:
 *                 type: string
 *                 description: 积攒码
 *               inviterId:
 *                 type: integer
 *                 description: 邀请人ID
 *     responses:
 *       200:
 *         description: 助力成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 */

/**
 * @swagger
 * /api/marketing/collect-activity:
 *   get:
 *     summary: 获取积攒活动列表
 *     tags: [积攒管理]
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
 *           enum: [active, completed, expired, cancelled]
 *         description: 积攒状态
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
 *                         $ref: '#/components/schemas/CollectActivity'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pageSize:
 *                       type: integer
 */

/**
 * @swagger
 * /api/marketing/collect-activity/{id}:
 *   get:
 *     summary: 获取积攒活动详情
 *     tags: [积攒管理]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 积攒活动ID
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
 *                   $ref: '#/components/schemas/CollectActivity'
 */

/**
 * @swagger
 * /api/marketing/collect-activity/{id}/share:
 *   post:
 *     summary: 分享积攒活动
 *     tags: [积攒管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 积攒活动ID
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
 * /api/marketing/collect-activity/my:
 *   get:
 *     summary: 我的积攒活动
 *     tags: [积攒管理]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, expired, cancelled]
 *         description: 积攒状态
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
router.get('/my', authMiddleware, CollectActivityController.getMyCollectActivities);

/**
 * @swagger
 * /api/marketing/collect-activity/activity/{activityId}:
 *   get:
 *     summary: 活动积攒列表
 *     tags: [积攒管理]
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
 *           enum: [active, completed, expired, cancelled]
 *         description: 积攒状态
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
router.get('/activity/:activityId', CollectActivityController.getActivityCollectActivities);

/**
 * @swagger
 * /api/marketing/collect-activity/code/{code}:
 *   get:
 *     summary: 根据积攒码获取信息
 *     tags: [积攒管理]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: 积攒码
 *     responses:
 *       200:
 *         description: 获取成功
 *       404:
 *         description: 积攒码不存在
 */

/**
 * @swagger
 * /api/marketing/collect-activity/check-expired:
 *   post:
 *     summary: 检查过期积攒活动
 *     tags: [积攒管理]
 *     description: 定时任务接口，检查并处理过期的积攒活动
 *     responses:
 *       200:
 *         description: 检查完成
 */
router.post('/check-expired', CollectActivityController.checkExpiredCollectActivities);

export default router;