/**
* @swagger
 * components:
 *   schemas:
 *     Smart-promotion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: Smart-promotion ID
 *           example: 1
 *         name:
 *           type: string
 *           description: Smart-promotion 名称
 *           example: "示例Smart-promotion"
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
 *     CreateSmart-promotionRequest:
 *       type: object
 *       required:
 *         - name
 *       properties:
 *         name:
 *           type: string
 *           description: Smart-promotion 名称
 *           example: "新Smart-promotion"
 *     UpdateSmart-promotionRequest:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Smart-promotion 名称
 *           example: "更新后的Smart-promotion"
 *     Smart-promotionListResponse:
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
 *                 $ref: '#/components/schemas/Smart-promotion'
 *         message:
 *           type: string
 *           example: "获取smart-promotion列表成功"
 *     Smart-promotionResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         data:
 *           $ref: '#/components/schemas/Smart-promotion'
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
 * smart-promotion管理路由文件
 * 提供smart-promotion的基础CRUD操作
*
 * 功能包括：
 * - 获取smart-promotion列表
 * - 创建新smart-promotion
 * - 获取smart-promotion详情
 * - 更新smart-promotion信息
 * - 删除smart-promotion
*
 * 权限要求：需要有效的JWT Token认证
*/

import { Router } from 'express';
import { SmartPromotionController } from '../controllers/smart-promotion.controller';
import { verifyToken } from '../middlewares/auth.middleware';

const router = Router();

// 所有路由都需要认证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

/**
* @swagger
 * /api/smart-promotion/generate-poster:
 *   post:
 *     summary: AI生成推广海报
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               prompt:
 *                 type: string
 *                 description: AI生成提示词
 *               activityData:
 *                 type: object
 *                 description: 活动数据
 *               referralCode:
 *                 type: string
 *                 description: 推广码
 *               style:
 *                 type: string
 *                 description: 海报风格
 *     responses:
 *       200:
 *         description: 海报生成成功
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.post('/generate-poster', SmartPromotionController.generatePromotionPoster);

/**
* @swagger
 * /api/smart-promotion/generate-content:
 *   post:
 *     summary: 生成推广内容
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: 内容类型
 *               context:
 *                 type: object
 *                 description: 上下文信息
 *     responses:
 *       200:
 *         description: 内容生成成功
*/
router.post('/generate-content', SmartPromotionController.generatePromotionContent);

/**
* @swagger
 * /api/smart-promotion/social-media-content:
 *   post:
 *     summary: 生成社交媒体内容
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               platform:
 *                 type: string
 *                 description: 社交媒体平台
 *               content:
 *                 type: string
 *                 description: 基础内容
 *     responses:
 *       200:
 *         description: 社交媒体内容生成成功
*/
router.post('/social-media-content', SmartPromotionController.generateSocialMediaContent);

/**
* @swagger
 * /api/smart-promotion/complete-poster:
 *   post:
 *     summary: 一键生成完整海报
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activityId:
 *                 type: string
 *                 description: 活动ID
 *               preferences:
 *                 type: object
 *                 description: 用户偏好设置
 *     responses:
 *       200:
 *         description: 完整海报生成成功
*/
router.post('/complete-poster', SmartPromotionController.generateCompletePoster);

/**
* @swagger
 * /api/smart-promotion/calculate-reward:
 *   post:
 *     summary: 计算推广奖励
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *               referralCount:
 *                 type: number
 *                 description: 推荐数量
 *     responses:
 *       200:
 *         description: 奖励计算成功
*/
router.post('/calculate-reward', SmartPromotionController.calculateReward);

/**
* @swagger
 * /api/smart-promotion/personalized-incentive:
 *   post:
 *     summary: 生成个性化激励策略
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *               performanceData:
 *                 type: object
 *                 description: 表现数据
 *     responses:
 *       200:
 *         description: 激励策略生成成功
*/
router.post('/personalized-incentive', SmartPromotionController.generatePersonalizedIncentive);

/**
* @swagger
 * /api/smart-promotion/viral-spread:
 *   post:
 *     summary: 追踪病毒式传播
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               referralCode:
 *                 type: string
 *                 description: 推广码
 *               eventType:
 *                 type: string
 *                 description: 事件类型
 *     responses:
 *       200:
 *         description: 传播追踪成功
*/
router.post('/viral-spread', SmartPromotionController.trackViralSpread);

/**
* @swagger
 * /api/smart-promotion/optimize-strategy:
 *   post:
 *     summary: 优化病毒式传播策略
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: 用户ID
 *               currentStrategy:
 *                 type: object
 *                 description: 当前策略
 *     responses:
 *       200:
 *         description: 策略优化成功
*/
router.post('/optimize-strategy', SmartPromotionController.optimizeViralStrategy);

/**
* @swagger
 * /api/smart-promotion/stats:
 *   get:
 *     summary: 获取推广统计数据
 *     tags: [Smart Promotion]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: 用户ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *         description: 时间范围
 *     responses:
 *       200:
 *         description: 统计数据获取成功
*/
router.get('/stats', SmartPromotionController.getPromotionStats);

export default router;
