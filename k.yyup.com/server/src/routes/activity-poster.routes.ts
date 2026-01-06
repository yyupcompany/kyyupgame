/**
* @swagger
 * components:
 *   schemas:
 *     Activity-poster:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Activity-poster ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Activity-poster 名称
 *           example: "示例Activity-poster"
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
 *     CreateActivity-posterRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-poster 名称
 *           example: "新Activity-poster"
 *     UpdateActivity-posterRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Activity-poster 名称
 *           example: "更新后的Activity-poster"
 *     Activity-posterListResponse:
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
 *                 $ref: '#/components/schemas/Activity-poster'
 *         message:
 *           type: string
 *           example: "获取activity-poster列表成功"
 *     Activity-posterResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Activity-poster'
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
 * activity-poster管理路由文件
 * 提供activity-poster的基础CRUD操作
*
 * 功能包括：
 * - 获取activity-poster列表
 * - 创建新activity-poster
 * - 获取activity-poster详情
 * - 更新activity-poster信息
 * - 删除activity-poster
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { ActivityPosterController } from '../controllers/activity-poster.controller';
import { verifyToken } from '../middlewares/auth.middleware';
import { body, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// 验证中间件
const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: '验证失败',
      errors: errors.array()
    });
    return;
  }
  next();
};

// 验证规则
const generatePosterValidation = [
  param('activityId').isInt().withMessage('活动ID必须是整数'),
  body('posterType').optional().isIn(['main', 'share', 'detail', 'preview']).withMessage('海报类型无效'),
  body('marketingConfig').optional().isObject().withMessage('营销配置必须是对象'),
  body('templateId').optional().isInt().withMessage('模板ID必须是整数')
];

const shareValidation = [
  param('activityId').isInt().withMessage('活动ID必须是整数'),
  body('shareChannel').isIn(['wechat', 'weibo', 'qq', 'link', 'qrcode', 'other']).withMessage('分享渠道无效'),
  body('posterId').optional().isInt().withMessage('海报ID必须是整数')
];

/**
* @swagger
 * /api/activity-poster/{activityId}/poster/generate:
 *   post:
 *     summary: 为活动生成海报
 *     description: 为指定活动生成营销海报
 *     tags:
 *       - 活动海报
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               posterType:
 *                 type: string
 *                 enum: [main, share, detail, preview]
 *               marketingConfig:
 *                 type: object
 *               templateId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 生成成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post(
  '/:activityId/poster/generate',
  generatePosterValidation,
  handleValidationErrors,
  ActivityPosterController.generatePoster
);

/**
* @swagger
 * /api/activity-poster/{activityId}/posters:
 *   get:
 *     summary: 获取活动的所有海报
 *     description: 获取指定活动的所有海报列表
 *     tags:
 *       - 活动海报
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get(
  '/:activityId/posters',
  param('activityId').isInt(),
  handleValidationErrors,
  ActivityPosterController.getActivityPosters
);

/**
* @swagger
 * /api/activity-poster/{activityId}/poster/preview:
 *   get:
 *     summary: 预览活动海报
 *     description: 预览活动海报效果
 *     tags:
 *       - 活动海报
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 预览成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get(
  '/:activityId/poster/preview',
  param('activityId').isInt(),
  handleValidationErrors,
  ActivityPosterController.previewPoster
);

/**
* @swagger
 * /api/activity-poster/{activityId}/publish:
 *   post:
 *     summary: 发布活动和海报
 *     description: 发布活动和海报到指定渠道
 *     tags:
 *       - 活动海报
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               publishChannels:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: 发布成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post(
  '/:activityId/publish',
  param('activityId').isInt(),
  body('publishChannels').optional().isArray().withMessage('发布渠道必须是数组'),
  handleValidationErrors,
  ActivityPosterController.publishActivity
);

/**
* @swagger
 * /api/activity-poster/{activityId}/share:
 *   post:
 *     summary: 一键转发分享
 *     description: 一键转发分享活动到社交平台
 *     tags:
 *       - 活动海报
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
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
 *               posterId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: 分享成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.post(
  '/:activityId/share',
  shareValidation,
  handleValidationErrors,
  ActivityPosterController.shareActivity
);

/**
* @swagger
 * /api/activity-poster/{activityId}/share/stats:
 *   get:
 *     summary: 获取活动分享统计
 *     description: 获取活动的分享统计数据
 *     tags:
 *       - 活动海报
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: activityId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 获取成功
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
*/
router.get(
  '/:activityId/share/stats',
  param('activityId').isInt(),
  handleValidationErrors,
  ActivityPosterController.getShareStats
);

export default router;
