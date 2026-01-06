"use strict";
exports.__esModule = true;
var express_1 = require("express");
var customer_follow_enhanced_controller_1 = require("../controllers/customer-follow-enhanced.controller");
var auth_middleware_1 = require("../middlewares/auth.middleware");
var router = (0, express_1.Router)();
var controller = new customer_follow_enhanced_controller_1.CustomerFollowEnhancedController();
// 应用认证中间件
router.use(auth_middleware_1.verifyToken);
/**
 * @swagger
 * /api/customer-follow-enhanced/records:
 *   post:
 *     summary: 创建跟进记录
 *     tags: [客户跟进增强]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               customerId:
 *                 type: integer
 *                 description: 客户ID
 *               stage:
 *                 type: integer
 *                 description: 跟进阶段 (1-8)
 *               subStage:
 *                 type: string
 *                 description: 子阶段标识
 *               followType:
 *                 type: string
 *                 description: 跟进方式
 *               content:
 *                 type: string
 *                 description: 跟进内容
 *               customerFeedback:
 *                 type: string
 *                 description: 客户反馈
 *               nextFollowDate:
 *                 type: string
 *                 format: date-time
 *                 description: 下次跟进时间
 *               mediaFiles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: 媒体文件
 *     responses:
 *       200:
 *         description: 创建成功
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未认证
 */
router.post('/records', controller.getUploadMiddleware(), controller.createFollowRecord.bind(controller));
/**
 * @swagger
 * /api/customer-follow-enhanced/records/{id}:
 *   put:
 *     summary: 更新跟进记录
 *     tags: [客户跟进增强]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 跟进记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               customerFeedback:
 *                 type: string
 *               stageStatus:
 *                 type: string
 *                 enum: [pending, in_progress, completed, skipped]
 *               nextFollowDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 更新成功
 */
router.put('/records/:id', controller.updateFollowRecord.bind(controller));
/**
 * @swagger
 * /api/customer-follow-enhanced/customers/{customerId}/timeline:
 *   get:
 *     summary: 获取客户跟进时间线
 *     tags: [客户跟进增强]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customerId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 客户ID
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
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       stage:
 *                         type: integer
 *                       stageName:
 *                         type: string
 *                       subStage:
 *                         type: string
 *                       followType:
 *                         type: string
 *                       content:
 *                         type: string
 *                       customerFeedback:
 *                         type: string
 *                       aiSuggestions:
 *                         type: object
 *                       stageStatus:
 *                         type: string
 *                       mediaFiles:
 *                         type: array
 *                       teacherName:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/customers/:customerId/timeline', controller.getCustomerTimeline.bind(controller));
/**
 * @swagger
 * /api/customer-follow-enhanced/stages:
 *   get:
 *     summary: 获取阶段配置
 *     tags: [客户跟进增强]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/stages', controller.getStageConfigurations.bind(controller));
/**
 * @swagger
 * /api/customer-follow-enhanced/records/{followRecordId}/ai-suggestions:
 *   get:
 *     summary: 获取AI建议
 *     tags: [客户跟进增强]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followRecordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 跟进记录ID
 *     responses:
 *       200:
 *         description: 获取成功
 */
router.get('/records/:followRecordId/ai-suggestions', controller.getAISuggestions.bind(controller));
/**
 * @swagger
 * /api/customer-follow-enhanced/records/{followRecordId}/complete:
 *   post:
 *     summary: 完成阶段
 *     tags: [客户跟进增强]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followRecordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 跟进记录ID
 *     responses:
 *       200:
 *         description: 完成成功
 */
router.post('/records/:followRecordId/complete', controller.completeStage.bind(controller));
/**
 * @swagger
 * /api/customer-follow-enhanced/records/{followRecordId}/skip:
 *   post:
 *     summary: 跳过阶段
 *     tags: [客户跟进增强]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: followRecordId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 跟进记录ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 description: 跳过原因
 *     responses:
 *       200:
 *         description: 跳过成功
 */
router.post('/records/:followRecordId/skip', controller.skipStage.bind(controller));
exports["default"] = router;
