/**
 * 活动策划API路由
 * 提供活动策划相关的API接口
 */

import { Router } from 'express';
import activityPlannerService from '../services/ai/activity-planner.service';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { body, query, validationResult } from 'express-validator';

const router = Router();

// 验证中间件
const validateRequest = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '请求参数验证失败',
        details: errors.array()
      }
    });
  }
  next();
};

/**
 * @swagger
 * /api/activity-planner/generate:
 *   post:
 *     tags:
 *       - Activity Planner
 *     summary: 生成活动策划方案
 *     description: 使用AI智能体生成详细的活动策划方案，包括文本、图片和语音内容
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - activityType
 *               - targetAudience
 *             properties:
 *               activityType:
 *                 type: string
 *                 description: 活动类型
 *                 example: "儿童生日派对"
 *               targetAudience:
 *                 type: string
 *                 description: 目标受众
 *                 example: "3-6岁儿童"
 *               budget:
 *                 type: number
 *                 description: 预算（元）
 *                 example: 5000
 *               duration:
 *                 type: string
 *                 description: 活动时长
 *                 example: "2小时"
 *               location:
 *                 type: string
 *                 description: 活动地点
 *                 example: "室内游乐场"
 *               requirements:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 特殊要求
 *                 example: ["需要摄影", "准备生日蛋糕"]
 *               preferredStyle:
 *                 type: string
 *                 enum: [professional, creative, fun, educational]
 *                 description: 偏好风格
 *                 example: "fun"
 *     responses:
 *       200:
 *         description: 策划方案生成成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     planId:
 *                       type: string
 *                       example: "plan_1703123456789_abc123"
 *                     title:
 *                       type: string
 *                       example: "梦幻儿童生日派对"
 *                     description:
 *                       type: string
 *                       example: "为3-6岁儿童精心设计的生日派对活动"
 *                     detailedPlan:
 *                       type: object
 *                     generatedImages:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["/uploads/image1.png"]
 *                     audioGuide:
 *                       type: string
 *                       example: "/uploads/audio/guide.mp3"
 *                     modelsUsed:
 *                       type: object
 *                     processingTime:
 *                       type: number
 *                       example: 15000
 *       400:
 *         description: 请求参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
 */
router.post('/generate',
  verifyToken,
  [
    body('activityType').notEmpty().withMessage('活动类型不能为空'),
    body('targetAudience').notEmpty().withMessage('目标受众不能为空'),
    body('budget').optional().isNumeric().withMessage('预算必须是数字'),
    body('duration').optional().isString(),
    body('location').optional().isString(),
    body('requirements').optional().isArray(),
    body('preferredStyle').optional().isIn(['professional', 'creative', 'fun', 'educational'])
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const planningRequest = {
        userId,
        activityType: req.body.activityType,
        targetAudience: req.body.targetAudience,
        budget: req.body.budget,
        duration: req.body.duration,
        location: req.body.location,
        requirements: req.body.requirements,
        preferredStyle: req.body.preferredStyle || 'professional'
      };

      console.log(`🎯 用户 ${userId} 请求生成活动策划: ${planningRequest.activityType}`);

      const result = await activityPlannerService.generateActivityPlan(planningRequest);

      res.json({
        success: true,
        message: '活动策划方案生成成功',
        data: result
      });

    } catch (error) {
      console.error('活动策划生成失败:', error);
      res.status(500).json({
        success: false,
        message: '活动策划生成失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

/**
 * @swagger
 * /api/activity-planner/stats:
 *   get:
 *     tags:
 *       - Activity Planner
 *     summary: 获取活动策划统计
 *     description: 获取用户的活动策划使用统计信息
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           default: 30
 *         description: 统计天数
 *     responses:
 *       200:
 *         description: 统计信息获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalPlans:
 *                       type: number
 *                       example: 15
 *                     successRate:
 *                       type: number
 *                       example: 95.5
 *                     averageProcessingTime:
 *                       type: number
 *                       example: 12000
 *                     popularActivityTypes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["生日派对", "团建活动"]
 */
router.get('/stats',
  verifyToken,
  [
    query('days').optional().isInt({ min: 1, max: 365 }).withMessage('天数必须在1-365之间')
  ],
  validateRequest,
  async (req, res) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: '用户未认证'
        });
      }

      const days = parseInt(req.query.days as string) || 30;
      const stats = await activityPlannerService.getPlanningStats(userId, days);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('获取活动策划统计失败:', error);
      res.status(500).json({
        success: false,
        message: '获取统计信息失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

/**
 * @swagger
 * /api/activity-planner/models:
 *   get:
 *     tags:
 *       - Activity Planner
 *     summary: 获取可用AI模型
 *     description: 获取活动策划可用的AI模型列表
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 模型列表获取成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     textModels:
 *                       type: array
 *                       items:
 *                         type: object
 *                     imageModels:
 *                       type: array
 *                       items:
 *                         type: object
 *                     speechModels:
 *                       type: array
 *                       items:
 *                         type: object
 */
router.get('/models',
  verifyToken,
  async (req, res) => {
    try {
      const modelCacheService = require('../services/ai/model-cache.service').default;
      
      const [textModels, imageModels, speechModels] = await Promise.all([
        modelCacheService.getModels('text'),
        modelCacheService.getModels('image'),
        modelCacheService.getModels('speech')
      ]);

      res.json({
        success: true,
        data: {
          textModels: textModels.map(m => ({
            id: m.id,
            name: m.name,
            displayName: m.displayName,
            provider: m.provider,
            isDefault: m.isDefault
          })),
          imageModels: imageModels.map(m => ({
            id: m.id,
            name: m.name,
            displayName: m.displayName,
            provider: m.provider,
            isDefault: m.isDefault
          })),
          speechModels: speechModels.map(m => ({
            id: m.id,
            name: m.name,
            displayName: m.displayName,
            provider: m.provider,
            isDefault: m.isDefault
          }))
        }
      });

    } catch (error) {
      console.error('获取AI模型列表失败:', error);
      res.status(500).json({
        success: false,
        message: '获取模型列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      });
    }
  }
);

export default router; 