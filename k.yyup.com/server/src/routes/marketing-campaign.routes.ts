import { Router } from 'express';
import { MarketingCampaignController } from '../controllers/marketing-campaign.controller';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';

const router = Router();

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

const marketingCampaignController = new MarketingCampaignController();

/**
* @swagger
 * tags:
 *   name: MarketingCampaigns
 *   description: 营销活动管理API
*/

/**
* @swagger
 * components:
 *   schemas:
 *     MarketingCampaign:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 营销活动ID
 *         name:
 *           type: string
 *           description: 活动名称
 *         description:
 *           type: string
 *           description: 活动描述
 *         campaign_type:
 *           type: string
 *           enum: [online, offline, hybrid]
 *           description: 活动类型
 *         status:
 *           type: string
 *           enum: [draft, active, paused, ended]
 *           description: 活动状态
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: 开始日期
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: 结束日期
 *         budget:
 *           type: number
 *           description: 预算金额
 *         target_audience:
 *           type: string
 *           description: 目标受众
 *         kindergarten_id:
 *           type: integer
 *           description: 幼儿园ID
 *         kindergarten_name:
 *           type: string
 *           description: 幼儿园名称
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
*     
 *     MarketingCampaignROI:
 *       type: object
 *       properties:
 *         budget:
 *           type: number
 *           description: 预算金额
 *         spent:
 *           type: number
 *           description: 已花费金额
 *         total_revenue:
 *           type: number
 *           description: 总收入
 *         roi_percentage:
 *           type: number
 *           description: ROI百分比
*     
 *     MarketingCampaignCreate:
 *       type: object
 *       required:
 *         - name
 *         - campaign_type
 *         - kindergarten_id
 *       properties:
 *         name:
 *           type: string
 *           description: 活动名称
 *         description:
 *           type: string
 *           description: 活动描述
 *         campaign_type:
 *           type: string
 *           enum: [online, offline, hybrid]
 *           description: 活动类型
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: 开始日期
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: 结束日期
 *         budget:
 *           type: number
 *           description: 预算金额
 *         target_audience:
 *           type: string
 *           description: 目标受众
 *         kindergarten_id:
 *           type: integer
 *           description: 幼儿园ID
*/

/**
* @swagger
 * /api/marketing-campaigns/by-type/{type}:
 *   get:
 *     summary: 按类型获取营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [online, offline, hybrid]
 *         description: 活动类型
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
 *                     type:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MarketingCampaign'
 *                     total:
 *                       type: integer
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/by-type/:type', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  async (req, res) => {
    try {
      const { type } = req.params;
      // 使用全局sequelize实例
      
      const campaigns = await sequelize.query(`
        SELECT mc.*, k.name as kindergarten_name
        FROM marketing_campaigns mc
        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id
        WHERE mc.campaign_type = :type AND mc.deleted_at IS NULL
        ORDER BY mc.created_at DESC
      `, {
        replacements: { type },
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        message: '按类型获取营销活动成功',
        data: {
          type,
          items: campaigns,
          total: campaigns.length
        }
      });
    } catch (error) {
      console.error('[AI]: 按类型获取营销活动失败:', error);
      res.status(500).json({ success: false, message: '按类型获取营销活动失败' });
    }
  }
);

/**
* @swagger
 * /api/marketing-campaigns/by-status/{status}:
 *   get:
 *     summary: 按状态获取营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: status
 *         required: true
 *         schema:
 *           type: string
 *           enum: [draft, active, paused, ended]
 *         description: 活动状态
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
 *                     status:
 *                       type: string
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/MarketingCampaign'
 *                     total:
 *                       type: integer
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/by-status/:status', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  async (req, res) => {
    try {
      const { status } = req.params;
      // 使用全局sequelize实例
      
      const campaigns = await sequelize.query(`
        SELECT mc.*, k.name as kindergarten_name
        FROM marketing_campaigns mc
        LEFT JOIN kindergartens k ON mc.kindergarten_id = k.id
        WHERE mc.status = :status AND mc.deleted_at IS NULL
        ORDER BY mc.created_at DESC
      `, {
        replacements: { status },
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        message: '按状态获取营销活动成功',
        data: {
          status,
          items: campaigns,
          total: campaigns.length
        }
      });
    } catch (error) {
      console.error('[AI]: 按状态获取营销活动失败:', error);
      res.status(500).json({ success: false, message: '按状态获取营销活动失败' });
    }
  }
);

/**
* @swagger
 * /api/marketing-campaigns/{id}/roi:
 *   get:
 *     summary: 获取营销活动ROI
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
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
 *                   $ref: '#/components/schemas/MarketingCampaignROI'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:id/roi', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  async (req, res) => {
    try {
      const { id } = req.params;
      // 使用全局sequelize实例
      
      const roiResults = await sequelize.query(`
        SELECT 
          mc.budget,
          mc.budget as spent,
          COALESCE(SUM(ct.event_value), 0) as total_revenue,
          CASE 
            WHEN mc.budget > 0 THEN ROUND((COALESCE(SUM(ct.event_value), 0) - mc.budget) / mc.budget * 100, 2)
            ELSE 0 
          END as roi_percentage
        FROM marketing_campaigns mc
        LEFT JOIN conversion_trackings ct ON mc.id = ct.campaign_id
        WHERE mc.id = :id AND mc.deleted_at IS NULL
        GROUP BY mc.id, mc.budget
      `, {
        replacements: { id: Number(id) },
        type: QueryTypes.SELECT
      }) as any;

      const roi = roiResults[0];
      if (!roi) {
        res.status(404).json({ success: false, message: '营销活动不存在' });
        return;
      }

      res.json({
        success: true,
        message: '获取营销活动ROI成功',
        data: roi
      });
    } catch (error) {
      console.error('[AI]: 获取营销活动ROI失败:', error);
      res.status(500).json({ success: false, message: '获取营销活动ROI失败' });
    }
  }
);

/**
* @swagger
 * /api/marketing-campaigns/{id}/performance:
 *   get:
 *     summary: 获取营销活动效果分析
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 获取成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:id/performance', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.getPerformance.bind(marketingCampaignController)
);

/**
* @swagger
 * /api/marketing-campaigns/{id}/launch:
 *   post:
 *     summary: 启动营销活动（POST方式）
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 启动成功
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
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [active]
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/launch', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  async (req, res) => {
    try {
      const { id } = req.params;
      // 使用全局sequelize实例
      
      await sequelize.query(`
        UPDATE marketing_campaigns 
        SET status = 'active', updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      `, {
        replacements: { id: Number(id) },
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '启动营销活动成功',
        data: {
          id: Number(id),
          status: 'active'
        }
      });
    } catch (error) {
      console.error('[AI]: 启动营销活动失败:', error);
      res.status(500).json({ success: false, message: '启动营销活动失败' });
    }
  }
);

/**
* @swagger
 * /api/marketing-campaigns/{id}/pause:
 *   post:
 *     summary: 暂停营销活动（POST方式）
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 暂停成功
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
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                       enum: [paused]
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/:id/pause', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  async (req, res) => {
    try {
      const { id } = req.params;
      // 使用全局sequelize实例
      
      await sequelize.query(`
        UPDATE marketing_campaigns 
        SET status = 'paused', updated_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      `, {
        replacements: { id: Number(id) },
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '暂停营销活动成功',
        data: {
          id: Number(id),
          status: 'paused'
        }
      });
    } catch (error) {
      console.error('[AI]: 暂停营销活动失败:', error);
      res.status(500).json({ success: false, message: '暂停营销活动失败' });
    }
  }
);

/**
* @swagger
 * /api/marketing-campaigns:
 *   get:
 *     summary: 获取营销活动列表
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: 每页数量
 *       - in: query
 *         name: kindergarten_id
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
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
 *                         $ref: '#/components/schemas/MarketingCampaign'
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: 服务器错误
 *   post:
 *     summary: 创建营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarketingCampaignCreate'
 *     responses:
 *       201:
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
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.findAll.bind(marketingCampaignController)
);

router.post(
  '/', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.create.bind(marketingCampaignController)
);

/**
* @swagger
 * /api/marketing-campaigns/{id}:
 *   get:
 *     summary: 获取单个营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
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
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 *   put:
 *     summary: 更新营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarketingCampaignCreate'
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                   $ref: '#/components/schemas/MarketingCampaign'
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
 *   delete:
 *     summary: 删除营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 删除成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:id', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.findOne.bind(marketingCampaignController)
);

/**
* @swagger
 * /api/marketing-campaigns/{id}:
 *   put:
 *     summary: 更新营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MarketingCampaignInput'
 *     responses:
 *       200:
 *         description: 更新成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MarketingCampaignResponse'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
*/
router.put(
  '/:id', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.update.bind(marketingCampaignController)
);

router.delete(
  '/:id', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.delete.bind(marketingCampaignController)
);

/**
* @swagger
 * /api/marketing-campaigns/{id}/rules:
 *   put:
 *     summary: 设置营销活动规则
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rules:
 *                 type: object
 *                 description: 活动规则配置
 *     responses:
 *       200:
 *         description: 设置成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: 请求参数错误
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.put(
  '/:id/rules', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.setRules.bind(marketingCampaignController)
);

/**
* @swagger
 * /api/marketing-campaigns/stats/{kindergartenId}:
 *   get:
 *     summary: 获取营销活动统计数据
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: kindergartenId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 幼儿园ID
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
 *                     totalCampaigns:
 *                       type: integer
 *                       description: 总活动数
 *                     activeCampaigns:
 *                       type: integer
 *                       description: 活跃活动数
 *                     totalBudget:
 *                       type: number
 *                       description: 总预算
 *                     totalRevenue:
 *                       type: number
 *                       description: 总收入
 *                     averageROI:
 *                       type: number
 *                       description: 平均ROI
 *       404:
 *         description: 幼儿园不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/stats/:kindergartenId', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.getStats.bind(marketingCampaignController)
);

/**
* @swagger
 * /api/marketing-campaigns/{id}/launch:
 *   put:
 *     summary: 启动营销活动（PUT方式，保持兼容性）
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 启动成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.put(
  '/:id/launch', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.launch.bind(marketingCampaignController)
);

/**
* @swagger
 * /api/marketing-campaigns/{id}/pause:
 *   put:
 *     summary: 暂停营销活动（PUT方式，保持兼容性）
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 暂停成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.put(
  '/:id/pause', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.pause.bind(marketingCampaignController)
);

/**
* @swagger
 * /api/marketing-campaigns/{id}/end:
 *   put:
 *     summary: 结束营销活动
 *     tags: [MarketingCampaigns]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销活动ID
 *     responses:
 *       200:
 *         description: 结束成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: 营销活动不存在
 *       500:
 *         description: 服务器错误
*/
router.put(
  '/:id/end', checkPermission('MARKETING_CAMPAIGN_MANAGE'),
  marketingCampaignController.end.bind(marketingCampaignController)
);

export default router; 