/**
 * 提示词优化控制器
 * 提供智能提示词推荐、优化和效果评估功能
 */

const { Router } = require('express');
const { ApiError } = require('../../utils/apiError');
const { PromptOptimizationService } = require('../../services/ai/prompt-optimization.service');
const { AIShortcut } = require('../../models/ai-shortcut.model');
const { AIFeedback } = require('../../models/ai-feedback.model');
const { Op } = require('sequelize');

const router = Router();
const promptOptimizationService = new PromptOptimizationService();

/**
 * @openapi
 * tags:
 *   name: AI提示词优化
 *   description: 智能提示词推荐、优化和效果评估
 */

/**
 * @openapi
 * /api/v1/ai/prompts/recommendations:
 *   post:
 *     summary: 获取智能提示词推荐
 *     description: 基于上下文和用户角色获取智能提示词推荐
 *     tags:
 *       - AI提示词优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - context
 *               - userRole
 *             properties:
 *               context:
 *                 type: string
 *                 description: 使用场景描述
 *                 example: "需要制定招生计划"
 *               userRole:
 *                 type: string
 *                 description: 用户角色
 *                 example: "principal"
 *               category:
 *                 type: string
 *                 description: 提示词类别
 *                 example: "enrollment_planning"
 *               availablePrompts:
 *                 type: array
 *                 description: 可用的提示词列表
 *                 items:
 *                   type: object
 *               previousPrompts:
 *                 type: array
 *                 description: 之前使用的提示词ID列表
 *                 items:
 *                   type: integer
 *               excludeIds:
 *                 type: array
 *                 description: 要排除的提示词ID列表
 *                 items:
 *                   type: integer
 *               limit:
 *                 type: integer
 *                 description: 返回数量限制
 *                 default: 5
 *     responses:
 *       200:
 *         description: 推荐成功
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
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           prompt:
 *                             $ref: '#/components/schemas/AIShortcut'
 *                           score:
 *                             type: number
 *                             description: 推荐分数（0-1）
 *                           reasons:
 *                             type: array
 *                             items:
 *                               type: string
 *                           estimatedEffectiveness:
 *                             type: number
 *                             description: 预估效果（0-100）
 *                           similarContexts:
 *                             type: array
 *                             items:
 *                               type: string
 *       400:
 *         description: 请求参数错误
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/recommendations', async (req, res, next) => {
  try {
    const { context, userRole, category, availablePrompts, previousPrompts, excludeIds, limit = 5 } = req.body;
    
    if (!context || !userRole) {
      return next(ApiError.badRequest('上下文和用户角色不能为空'));
    }

    // 获取用户ID
    const userId = req.user?.id;
    if (!userId) {
      return next(ApiError.unauthorized('用户未授权'));
    }

    // 获取可用的提示词
    let prompts = availablePrompts;
    if (!prompts || prompts.length === 0) {
      // 从数据库获取可用的提示词
      const whereClause = {
        is_active: true,
        ...(userRole !== 'all' && { role: userRole }),
        ...(category && { category })
      };

      const dbPrompts = await AIShortcut.findAll({
        where: whereClause,
        order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
        limit: 100
      });

      prompts = dbPrompts.map(p => ({
        id: p.id,
        name: p.prompt_name,
        category: p.category,
        systemPrompt: p.system_prompt
      }));
    }

    // 调用AI服务进行智能推荐
    const recommendations = await promptOptimizationService.getSmartRecommendations({
      context,
      userRole,
      availablePrompts: prompts,
      previousPrompts,
      excludeIds,
      limit
    });

    res.json({
      success: true,
      data: { recommendations }
    });

  } catch (error) {
    console.error('获取智能推荐失败:', error);
    next(ApiError.internal('获取智能推荐失败'));
  }
});

/**
 * @openapi
 * /api/v1/ai/prompts/{promptId}/stats:
 *   get:
 *     summary: 获取提示词使用统计
 *     description: 获取指定提示词的使用统计信息
 *     tags:
 *       - AI提示词优化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 提示词ID
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     promptId:
 *                       type: integer
 *                     usageCount:
 *                       type: integer
 *                     successRate:
 *                       type: number
 *                     averageRating:
 *                       type: number
 *                     lastUsedAt:
 *                       type: string
 *                       format: date-time
 *                     feedbackCount:
 *                       type: object
 *                       properties:
 *                         positive:
 *                           type: integer
 *                         negative:
 *                           type: integer
 *       404:
 *         description: 提示词不存在
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:promptId/stats', async (req, res, next) => {
  try {
    const { promptId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(ApiError.unauthorized('用户未授权'));
    }

    // 验证提示词是否存在
    const prompt = await AIShortcut.findByPk(promptId);
    if (!prompt) {
      return next(ApiError.notFound('提示词不存在'));
    }

    // 获取使用统计
    const stats = await promptOptimizationService.getPromptUsageStats(promptId);
    
    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('获取提示词统计失败:', error);
    next(ApiError.internal('获取提示词统计失败'));
  }
});

/**
 * @openapi
 * /api/v1/ai/prompts/{promptId}/effectiveness:
 *   get:
 *     summary: 分析提示词效果
 *     description: 分析指定提示词的效果和性能指标
 *     tags:
 *       - AI提示词优化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promptId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 提示词ID
 *     responses:
 *       200:
 *         description: 分析成功
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
 *                     promptId:
 *                       type: integer
 *                     overallScore:
 *                       type: number
 *                     metrics:
 *                       type: object
 *                       properties:
 *                         clarity:
 *                           type: number
 *                         specificity:
 *                           type: number
 *                         completeness:
 *                           type: number
 *                         userSatisfaction:
 *                           type: number
 *                         taskCompletion:
 *                           type: number
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     usageTrend:
 *                       type: array
 *                       items:
 *                         type: object
 *       404:
 *         description: 提示词不存在
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:promptId/effectiveness', async (req, res, next) => {
  try {
    const { promptId } = req.params;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(ApiError.unauthorized('用户未授权'));
    }

    // 验证提示词是否存在
    const prompt = await AIShortcut.findByPk(promptId);
    if (!prompt) {
      return next(ApiError.notFound('提示词不存在'));
    }

    // 分析提示词效果
    const effectiveness = await promptOptimizationService.analyzePromptEffectiveness(promptId);
    
    res.json({
      success: true,
      data: effectiveness
    });

  } catch (error) {
    console.error('分析提示词效果失败:', error);
    next(ApiError.internal('分析提示词效果失败'));
  }
});

/**
 * @openapi
 * /api/v1/ai/prompts/optimize-suggestions:
 *   post:
 *     summary: 获取提示词优化建议
 *     description: 获取指定提示词的AI优化建议
 *     tags:
 *       - AI提示词优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - promptText
 *             properties:
 *               promptText:
 *                 type: string
 *                 description: 要优化的提示词文本
 *                 example: "你是一位幼儿园老师"
 *               analysisType:
 *                 type: string
 *                 enum: [basic, comprehensive, detailed]
 *                 default: comprehensive
 *                 description: 分析类型
 *     responses:
 *       200:
 *         description: 优化建议获取成功
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
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             enum: [clarity, specificity, structure, tone, length]
 *                           description:
 *                             type: string
 *                           originalText:
 *                             type: string
 *                           suggestedText:
 *                             type: string
 *                           impact:
 *                             type: string
 *                             enum: [high, medium, low]
 *                           reasoning:
 *                             type: string
 *       400:
 *         description: 请求参数错误
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/optimize-suggestions', async (req, res, next) => {
  try {
    const { promptText, analysisType = 'comprehensive' } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(ApiError.unauthorized('用户未授权'));
    }

    if (!promptText) {
      return next(ApiError.badRequest('提示词文本不能为空'));
    }

    // 获取优化建议
    const suggestions = await promptOptimizationService.getOptimizationSuggestions(promptText, analysisType);
    
    res.json({
      success: true,
      data: { suggestions }
    });

  } catch (error) {
    console.error('获取优化建议失败:', error);
    next(ApiError.internal('获取优化建议失败'));
  }
});

/**
 * @openapi
 * /api/v1/ai/prompts/usage:
 *   post:
 *     summary: 记录提示词使用
 *     description: 记录提示词的使用情况和用户反馈
 *     tags:
 *       - AI提示词优化
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - promptId
 *               - context
 *             properties:
 *               promptId:
 *                 type: integer
 *                 description: 提示词ID
 *               context:
 *                 type: string
 *                 description: 使用上下文
 *               result:
 *                 type: object
 *                 description: 使用结果
 *                 properties:
 *                   success:
 *                     type: boolean
 *                   rating:
 *                     type: number
 *                   feedback:
 *                     type: string
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: 记录成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: 使用记录已保存
 *       400:
 *         description: 请求参数错误
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/usage', async (req, res, next) => {
  try {
    const { promptId, context, result, timestamp } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(ApiError.unauthorized('用户未授权'));
    }

    if (!promptId || !context) {
      return next(ApiError.badRequest('提示词ID和使用上下文不能为空'));
    }

    // 验证提示词是否存在
    const prompt = await AIShortcut.findByPk(promptId);
    if (!prompt) {
      return next(ApiError.notFound('提示词不存在'));
    }

    // 记录使用
    await promptOptimizationService.recordPromptUsage(promptId, context, result, timestamp);
    
    res.status(201).json({
      success: true,
      message: '使用记录已保存'
    });

  } catch (error) {
    console.error('记录提示词使用失败:', error);
    next(ApiError.internal('记录提示词使用失败'));
  }
});

/**
 * @openapi
 * /api/v1/ai/prompts/trending:
 *   get:
 *     summary: 获取热门提示词
 *     description: 获取当前热门的提示词列表
 *     tags:
 *       - AI提示词优化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *         description: 用户角色
 *         example: "principal"
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 返回数量限制
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
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     prompts:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AIShortcut'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/trending', async (req, res, next) => {
  try {
    const { userRole, limit = 10 } = req.query;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(ApiError.unauthorized('用户未授权'));
    }

    // 获取热门提示词
    const prompts = await promptOptimizationService.getTrendingPrompts(userRole, parseInt(limit));
    
    res.json({
      success: true,
      data: { prompts }
    });

  } catch (error) {
    console.error('获取热门提示词失败:', error);
    next(ApiError.internal('获取热门提示词失败'));
  }
});

/**
 * @openapi
 * /api/v1/ai/prompts/search:
 *   get:
 *     summary: 搜索提示词
 *     description: 根据关键词搜索提示词
 *     tags:
 *       - AI提示词优化
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema:
 *           type: string
 *         description: 搜索关键词
 *         example: "招生"
 *       - in: query
 *         name: userRole
 *         schema:
 *           type: string
 *         description: 用户角色
 *         example: "principal"
 *     responses:
 *       200:
 *         description: 搜索成功
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
 *                     results:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/AIShortcut'
 *       400:
 *         description: 请求参数错误
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/search', async (req, res, next) => {
  try {
    const { query, userRole } = req.query;
    const userId = req.user?.id;
    
    if (!userId) {
      return next(ApiError.unauthorized('用户未授权'));
    }

    if (!query) {
      return next(ApiError.badRequest('搜索关键词不能为空'));
    }

    // 搜索提示词
    const results = await promptOptimizationService.searchPrompts(query, userRole);
    
    res.json({
      success: true,
      data: { results }
    });

  } catch (error) {
    console.error('搜索提示词失败:', error);
    next(ApiError.internal('搜索提示词失败'));
  }
});

module.exports = router;