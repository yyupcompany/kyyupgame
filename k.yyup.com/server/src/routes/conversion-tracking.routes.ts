import { Router, Request, Response } from 'express';
import { verifyToken, checkPermission } from '../middlewares/auth.middleware';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
const router = Router();

// // import { ConversionTrackingController } from '../controllers/conversion-tracking.controller';

// 全局认证中间件 - 所有路由都需要验证
router.use(verifyToken); // 已注释：全局认证中间件已移除，每个路由单独应用认证

// const conversionTrackingController = new ConversionTrackingController();

/**
* @swagger
 * components:
 *   schemas:
 *     ConversionTracking:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 转化跟踪记录ID
 *         kindergarten_id:
 *           type: integer
 *           description: 幼儿园ID
 *         parent_id:
 *           type: integer
 *           nullable: true
 *           description: 家长ID
 *         campaign_id:
 *           type: integer
 *           nullable: true
 *           description: 营销活动ID
 *         channel_id:
 *           type: integer
 *           description: 营销渠道ID
 *         advertisement_id:
 *           type: integer
 *           nullable: true
 *           description: 广告ID
 *         conversion_type:
 *           type: integer
 *           description: 转化类型 (1-咨询, 2-报名, 3-付费)
 *         conversion_type_name:
 *           type: string
 *           description: 转化类型名称
 *         conversion_source:
 *           type: string
 *           description: 转化来源
 *         conversion_event:
 *           type: string
 *           description: 转化事件
 *         event_value:
 *           type: number
 *           format: float
 *           description: 事件价值
 *         event_time:
 *           type: string
 *           format: date-time
 *           description: 事件时间
 *         conversion_status:
 *           type: integer
 *           description: 转化状态 (0-未完成, 1-已完成)
 *         follow_up_status:
 *           type: integer
 *           description: 跟进状态 (0-未跟进, 1-已跟进)
 *         is_first_visit:
 *           type: integer
 *           description: 是否首次访问 (0-否, 1-是)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 创建时间
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 更新时间
 *         deleted_at:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: 删除时间
 *     ConversionTrackingInput:
 *       type: object
 *       required:
 *         - channelId
 *       properties:
 *         kindergartenId:
 *           type: integer
 *           default: 1
 *           description: 幼儿园ID
 *         parentId:
 *           type: integer
 *           nullable: true
 *           description: 家长ID
 *         campaignId:
 *           type: integer
 *           nullable: true
 *           description: 营销活动ID
 *         channelId:
 *           type: integer
 *           description: 营销渠道ID
 *         advertisementId:
 *           type: integer
 *           nullable: true
 *           description: 广告ID
 *         conversionType:
 *           type: integer
 *           default: 1
 *           description: 转化类型 (1-咨询, 2-报名, 3-付费)
 *         conversionSource:
 *           type: string
 *           default: "未知来源"
 *           description: 转化来源
 *         conversionEvent:
 *           type: string
 *           default: "未知事件"
 *           description: 转化事件
 *         eventValue:
 *           type: number
 *           format: float
 *           default: 0
 *           description: 事件价值
 *         conversionStatus:
 *           type: integer
 *           default: 0
 *           description: 转化状态 (0-未完成, 1-已完成)
 *         followUpStatus:
 *           type: integer
 *           default: 0
 *           description: 跟进状态 (0-未跟进, 1-已跟进)
 *         isFirstVisit:
 *           type: integer
 *           default: 0
 *           description: 是否首次访问 (0-否, 1-是)
 *     ConversionTrackingUpdate:
 *       type: object
 *       properties:
 *         conversionStatus:
 *           type: integer
 *           description: 转化状态 (0-未完成, 1-已完成)
 *         followUpStatus:
 *           type: integer
 *           description: 跟进状态 (0-未跟进, 1-已跟进)
 *         eventValue:
 *           type: number
 *           format: float
 *           description: 事件价值
 *     ConversionTrackingReport:
 *       type: object
 *       properties:
 *         total_conversions:
 *           type: integer
 *           description: 总转化数
 *         successful_conversions:
 *           type: integer
 *           description: 成功转化数
 *         avg_event_value:
 *           type: number
 *           format: float
 *           description: 平均事件价值
 *         total_event_value:
 *           type: number
 *           format: float
 *           description: 总事件价值
 *     PaginatedConversionTrackingResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "获取转化跟踪列表成功"
 *         data:
 *           type: object
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ConversionTracking'
 *             page:
 *               type: integer
 *               description: 当前页码
 *             limit:
 *               type: integer
 *               description: 每页数量
 *             total:
 *               type: integer
 *               description: 总记录数
 *             totalPages:
 *               type: integer
 *               description: 总页数
 * tags:
 *   name: Marketing - Conversion Tracking
 *   description: 营销活动转化跟踪管理
*/

/**
* @swagger
 * /conversion-trackings/by-channel/{channelId}:
 *   get:
 *     summary: 按渠道获取转化跟踪列表
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: channelId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 营销渠道ID
 *     responses:
 *       200:
 *         description: 按渠道获取转化跟踪列表成功
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
 *                   example: "按渠道获取转化跟踪列表成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     channelId:
 *                       type: integer
 *                       description: 渠道ID
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ConversionTracking'
 *                     total:
 *                       type: integer
 *                       description: 记录总数
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/by-channel/:channelId',
  [],
  async (req: Request, res: Response) => {
    try {
      const { channelId } = req.params;
      
      const trackings = await sequelize.query(`
        SELECT ct.*, 
               CASE 
                 WHEN ct.conversion_type = 1 THEN '咨询'
                 WHEN ct.conversion_type = 2 THEN '报名'
                 WHEN ct.conversion_type = 3 THEN '付费'
                 ELSE '其他'
               END as conversion_type_name
        FROM conversion_trackings ct
        WHERE ct.channel_id = :channelId AND ct.deleted_at IS NULL
        ORDER BY ct.created_at DESC
      `, {
        replacements: { channelId: Number(channelId) },
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        message: '按渠道获取转化跟踪列表成功',
        data: {
          channelId: Number(channelId),
          items: trackings,
          total: trackings.length
        }
      });
    } catch (error) {
      console.error('[CONVERSIONTRACKING]: 按渠道获取转化跟踪列表失败:', error);
      res.status(500).json({ success: false, message: '按渠道获取转化跟踪列表失败' });
    }
  }
);

/**
* @swagger
 * /conversion-trackings:
 *   get:
 *     summary: 获取转化跟踪列表
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: 每页数量
 *     responses:
 *       200:
 *         description: 获取转化跟踪列表成功
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedConversionTrackingResponse'
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/',
  [],
  async (req: Request, res: Response) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (Number(page) - 1) * Number(limit);
      
      const trackings = await sequelize.query(`
        SELECT ct.*, 
               CASE 
                 WHEN ct.conversion_type = 1 THEN '咨询'
                 WHEN ct.conversion_type = 2 THEN '报名'
                 WHEN ct.conversion_type = 3 THEN '付费'
                 ELSE '其他'
               END as conversion_type_name
        FROM conversion_trackings ct
        WHERE ct.deleted_at IS NULL
        ORDER BY ct.created_at DESC
        LIMIT :limit OFFSET :offset
      `, {
        replacements: { limit: Number(limit), offset },
        type: QueryTypes.SELECT
      });

      const totalResults = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM conversion_trackings ct
        WHERE ct.deleted_at IS NULL
      `, {
        type: QueryTypes.SELECT
      }) as any;
      const { total } = totalResults[0] as any;

      res.json({
        success: true,
        message: '获取转化跟踪列表成功',
        data: {
          items: trackings,
          page: Number(page),
          limit: Number(limit),
          total: Number(total),
          totalPages: Math.ceil(Number(total) / Number(limit))
        }
      });
    } catch (error) {
      console.error('[CONVERSIONTRACKING]: 获取转化跟踪列表失败:', error);
      res.status(500).json({ success: false, message: '获取转化跟踪列表失败' });
    }
  }
);

/**
* @swagger
 * /conversion-trackings/{id}:
 *   get:
 *     summary: 获取单个转化跟踪
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 转化跟踪记录ID
 *     responses:
 *       200:
 *         description: 获取转化跟踪详情成功
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
 *                   example: "获取转化跟踪详情成功"
 *                 data:
 *                   $ref: '#/components/schemas/ConversionTracking'
 *       401:
 *         description: 未授权
 *       404:
 *         description: 转化跟踪记录不存在
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/:id',
  [],
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const trackingResults = await sequelize.query(`
        SELECT ct.*, 
               CASE 
                 WHEN ct.conversion_type = 1 THEN '咨询'
                 WHEN ct.conversion_type = 2 THEN '报名'
                 WHEN ct.conversion_type = 3 THEN '付费'
                 ELSE '其他'
               END as conversion_type_name
        FROM conversion_trackings ct
        WHERE ct.id = :id AND ct.deleted_at IS NULL
      `, {
        replacements: { id: Number(id) },
        type: QueryTypes.SELECT
      });
      const tracking = trackingResults[0];

      if (!tracking) {
        res.status(404).json({ success: false, message: '转化跟踪记录不存在' });
        return;
      }

      res.json({
        success: true,
        message: '获取转化跟踪详情成功',
        data: tracking
      });
    } catch (error) {
      console.error('[CONVERSIONTRACKING]: 获取转化跟踪详情失败:', error);
      res.status(500).json({ success: false, message: '获取转化跟踪详情失败' });
    }
  }
);

/**
* @swagger
 * /conversion-trackings:
 *   post:
 *     summary: 创建转化跟踪
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConversionTrackingInput'
 *           example:
 *             channelId: 1
 *             conversionType: 1
 *             conversionSource: "微信公众号"
 *             conversionEvent: "点击咨询按钮"
 *             eventValue: 100
 *     responses:
 *       201:
 *         description: 创建转化跟踪成功
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
 *                   example: "创建转化跟踪成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 新创建的转化跟踪记录ID
 *                     conversionType:
 *                       type: integer
 *                       description: 转化类型
 *                     conversionSource:
 *                       type: string
 *                       description: 转化来源
 *                     conversionEvent:
 *                       type: string
 *                       description: 转化事件
 *                     createTime:
 *                       type: string
 *                       format: date-time
 *                       description: 创建时间
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       500:
 *         description: 服务器错误
*/
router.post(
  '/',
  [],
  async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      const {
        kindergartenId = 1,
        parentId = null,
        campaignId = null,
        channelId,
        advertisementId = null,
        conversionType = 1,
        conversionSource = '未知来源',
        conversionEvent = '未知事件',
        eventValue = 0,
        conversionStatus = 0,
        followUpStatus = 0,
        isFirstVisit = 0
      } = req.body;

      const insertResults = await sequelize.query(`
        INSERT INTO conversion_trackings (
          kindergarten_id, parent_id, campaign_id, channel_id, advertisement_id,
          conversion_type, conversion_source, conversion_event, event_value,
          event_time, conversion_status, follow_up_status, is_first_visit,
          created_at, updated_at
        ) VALUES (
          :kindergartenId, :parentId, :campaignId, :channelId, :advertisementId,
          :conversionType, :conversionSource, :conversionEvent, :eventValue,
          NOW(), :conversionStatus, :followUpStatus, :isFirstVisit,
          NOW(), NOW()
        )
      `, {
        replacements: {
          kindergartenId, parentId, campaignId, channelId, advertisementId,
          conversionType, conversionSource, conversionEvent, eventValue,
          conversionStatus, followUpStatus, isFirstVisit
        },
        type: QueryTypes.INSERT
      });

      res.status(201).json({
        success: true,
        message: '创建转化跟踪成功',
        data: {
          id: insertResults[0],
          conversionType,
          conversionSource,
          conversionEvent,
          createTime: new Date()
        }
      });
    } catch (error) {
      console.error('[CONVERSIONTRACKING]: 创建转化跟踪失败:', error);
      res.status(500).json({ success: false, message: '创建转化跟踪失败' });
    }
  }
);

/**
* @swagger
 * /conversion-trackings/{id}:
 *   put:
 *     summary: 更新转化跟踪
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 转化跟踪记录ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ConversionTrackingUpdate'
 *           example:
 *             conversionStatus: 1
 *             followUpStatus: 1
 *             eventValue: 150
 *     responses:
 *       200:
 *         description: 更新转化跟踪成功
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
 *                   example: "更新转化跟踪成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 转化跟踪记录ID
 *                     updateTime:
 *                       type: string
 *                       format: date-time
 *                       description: 更新时间
 *       400:
 *         description: 参数错误
 *       401:
 *         description: 未授权
 *       404:
 *         description: 转化跟踪记录不存在
 *       500:
 *         description: 服务器错误
*/
router.put(
  '/:id',
  [],
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        conversionStatus = null,
        followUpStatus = null,
        eventValue = null
      } = req.body;

      // 创建替换参数对象，只包含实际提供的字段
      const replacements: any = { id: Number(id) };
      if (conversionStatus !== null) replacements.conversionStatus = conversionStatus;
      if (followUpStatus !== null) replacements.followUpStatus = followUpStatus;
      if (eventValue !== null) replacements.eventValue = eventValue;

      // 构建动态SET子句
      const setClause = [];
      if ('conversionStatus' in replacements) setClause.push('conversion_status = :conversionStatus');
      if ('followUpStatus' in replacements) setClause.push('follow_up_status = :followUpStatus');
      if ('eventValue' in replacements) setClause.push('event_value = :eventValue');
      setClause.push('updated_at = NOW()');

      const query = `
        UPDATE conversion_trackings 
        SET ${setClause.join(', ')}
        WHERE id = :id AND deleted_at IS NULL
      `;
      
      await sequelize.query(query, {
        replacements,
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '更新转化跟踪成功',
        data: {
          id: Number(id),
          updateTime: new Date()
        }
      });
    } catch (error) {
      console.error('[CONVERSIONTRACKING]: 更新转化跟踪失败:', error);
      res.status(500).json({ success: false, message: '更新转化跟踪失败' });
    }
  }
);

/**
* @swagger
 * /conversion-trackings/{id}:
 *   delete:
 *     summary: 删除转化跟踪
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 转化跟踪记录ID
 *     responses:
 *       200:
 *         description: 删除转化跟踪成功
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
 *                   example: "删除转化跟踪成功"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: 被删除的转化跟踪记录ID
 *       401:
 *         description: 未授权
 *       404:
 *         description: 转化跟踪记录不存在
 *       500:
 *         description: 服务器错误
*/
router.delete(
  '/:id',
  [],
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      await sequelize.query(`
        UPDATE conversion_trackings 
        SET deleted_at = NOW()
        WHERE id = :id AND deleted_at IS NULL
      `, {
        replacements: { id: Number(id) },
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '删除转化跟踪成功',
        data: {
          id: Number(id)
        }
      });
    } catch (error) {
      console.error('[CONVERSIONTRACKING]: 删除转化跟踪失败:', error);
      res.status(500).json({ success: false, message: '删除转化跟踪失败' });
    }
  }
);

/**
* @swagger
 * /conversion-trackings/report:
 *   get:
 *     summary: 获取转化跟踪报告
 *     tags: [Marketing - Conversion Tracking]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 获取转化跟踪报告成功
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
 *                   example: "获取转化跟踪报告成功"
 *                 data:
 *                   $ref: '#/components/schemas/ConversionTrackingReport'
 *       401:
 *         description: 未授权
 *       403:
 *         description: 权限不足
 *       500:
 *         description: 服务器错误
*/
router.get(
  '/report', checkPermission('CONVERSION_TRACKING_MANAGE'),
  async (req: Request, res: Response) => {
    try {
      const statsResults = await sequelize.query(`
        SELECT 
          COUNT(*) as total_conversions,
          SUM(CASE WHEN conversion_status = 1 THEN 1 ELSE 0 END) as successful_conversions,
          AVG(event_value) as avg_event_value,
          SUM(event_value) as total_event_value
        FROM conversion_trackings 
        WHERE deleted_at IS NULL
      `, {
        type: QueryTypes.SELECT
      }) as any;
      const stats = statsResults[0];

      res.json({
        success: true,
        message: '获取转化跟踪报告成功',
        data: stats
      });
    } catch (error) {
      console.error('[CONVERSIONTRACKING]: 获取转化跟踪报告失败:', error);
      res.status(500).json({ success: false, message: '获取转化跟踪报告失败' });
    }
  }
);

export default router; 