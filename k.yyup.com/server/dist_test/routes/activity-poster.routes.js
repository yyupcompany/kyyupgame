"use strict";
exports.__esModule = true;
var express_1 = require("express");
var activity_poster_controller_1 = require("../controllers/activity-poster.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var express_validator_1 = require("express-validator");
var router = (0, express_1.Router)();
// 验证中间件
var handleValidationErrors = function (req, res, next) {
    var errors = (0, express_validator_1.validationResult)(req);
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
var generatePosterValidation = [
    (0, express_validator_1.param)('activityId').isInt().withMessage('活动ID必须是整数'),
    (0, express_validator_1.body)('posterType').optional().isIn(['main', 'share', 'detail', 'preview']).withMessage('海报类型无效'),
    (0, express_validator_1.body)('marketingConfig').optional().isObject().withMessage('营销配置必须是对象'),
    (0, express_validator_1.body)('templateId').optional().isInt().withMessage('模板ID必须是整数')
];
var shareValidation = [
    (0, express_validator_1.param)('activityId').isInt().withMessage('活动ID必须是整数'),
    (0, express_validator_1.body)('shareChannel').isIn(['wechat', 'weibo', 'qq', 'link', 'qrcode', 'other']).withMessage('分享渠道无效'),
    (0, express_validator_1.body)('posterId').optional().isInt().withMessage('海报ID必须是整数')
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
router.post('/:activityId/poster/generate', auth_middleware_1.authMiddleware, generatePosterValidation, handleValidationErrors, activity_poster_controller_1.ActivityPosterController.generatePoster);
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
router.get('/:activityId/posters', auth_middleware_1.authMiddleware, (0, express_validator_1.param)('activityId').isInt(), handleValidationErrors, activity_poster_controller_1.ActivityPosterController.getActivityPosters);
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
router.get('/:activityId/poster/preview', auth_middleware_1.authMiddleware, (0, express_validator_1.param)('activityId').isInt(), handleValidationErrors, activity_poster_controller_1.ActivityPosterController.previewPoster);
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
router.post('/:activityId/publish', auth_middleware_1.authMiddleware, (0, express_validator_1.param)('activityId').isInt(), (0, express_validator_1.body)('publishChannels').optional().isArray().withMessage('发布渠道必须是数组'), handleValidationErrors, activity_poster_controller_1.ActivityPosterController.publishActivity);
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
router.post('/:activityId/share', auth_middleware_1.authMiddleware, shareValidation, handleValidationErrors, activity_poster_controller_1.ActivityPosterController.shareActivity);
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
router.get('/:activityId/share/stats', auth_middleware_1.authMiddleware, (0, express_validator_1.param)('activityId').isInt(), handleValidationErrors, activity_poster_controller_1.ActivityPosterController.getShareStats);
exports["default"] = router;
