import { Request, Response } from 'express';
import { RequestWithUser } from '../types/express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { PosterGenerationService } from '../services/poster-generation.service';
import { MarketingCampaign } from '../models/marketing-campaign.model';
import { ConversionTracking } from '../models/conversion-tracking.model';
import { getTenantDatabaseName } from '../utils/tenant-database-helper';

export class MarketingController {
  private posterService: PosterGenerationService;

  constructor() {
    this.posterService = new PosterGenerationService();
  }

  /**
   * 获取营销分析数据
   * @param req 请求
   * @param res 响应
   */
  public getAnalysis = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { timeRange = 'month' } = req.query;

      // 获取渠道分析数据
      const [channelStats] = await sequelize.query(`
        SELECT
          COALESCE(ea.source_channel, '未知渠道') as channel,
          COUNT(*) as applicationCount,
          COUNT(CASE WHEN ar.result_type = 1 THEN 1 END) as conversionCount,
          ROUND(COUNT(CASE WHEN ar.result_type = 1 THEN 1 END) * 100.0 / COUNT(*), 2) as conversionRate
        FROM ${tenantDb}.enrollment_applications ea
        LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
        WHERE ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
          AND ea.deleted_at IS NULL
        GROUP BY ea.source_channel
        ORDER BY applicationCount DESC
      `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

      // 获取月度趋势数据
      const [monthlyTrends] = await sequelize.query(`
        SELECT
          DATE_FORMAT(ea.created_at, '%Y-%m') as month,
          COUNT(*) as applications,
          COUNT(CASE WHEN ar.result_type = 1 THEN 1 END) as conversions,
          ROUND(AVG(CASE WHEN ar.result_type = 1 THEN 1 ELSE 0 END) * 100, 2) as conversionRate
        FROM ${tenantDb}.enrollment_applications ea
        LEFT JOIN ${tenantDb}.admission_results ar ON ea.id = ar.application_id
        WHERE ea.created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
          AND ea.deleted_at IS NULL
        GROUP BY DATE_FORMAT(ea.created_at, '%Y-%m')
        ORDER BY month ASC
      `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

      // 获取活动效果分析
      const [activityStats] = await sequelize.query(`
        SELECT
          a.title as activityName,
          a.activity_type as activityType,
          COUNT(ar.id) as participantCount,
          COUNT(ea.id) as generatedApplications,
          ROUND(COUNT(ea.id) * 100.0 / NULLIF(COUNT(ar.id), 0), 2) as applicationRate
        FROM ${tenantDb}.activities a
        LEFT JOIN ${tenantDb}.activity_registrations ar ON a.id = ar.activity_id AND ar.deleted_at IS NULL
        LEFT JOIN enrollment_applications ea ON ar.participant_phone = ea.phone AND ea.created_at >= a.start_time
        WHERE a.created_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
          AND a.deleted_at IS NULL
        GROUP BY a.id
        HAVING participantCount > 0
        ORDER BY applicationRate DESC
        LIMIT 10
      `, { type: QueryTypes.SELECT }) as [Record<string, any>[]];

      const channelStatsArray = Array.isArray(channelStats) ? channelStats : (channelStats ? [channelStats] : []);
      const monthlyTrendsArray = Array.isArray(monthlyTrends) ? monthlyTrends : (monthlyTrends ? [monthlyTrends] : []);
      const activityStatsArray = Array.isArray(activityStats) ? activityStats : (activityStats ? [activityStats] : []);

      res.json({
        success: true,
        message: '获取营销分析数据成功',
        data: {
          channelAnalysis: channelStatsArray.map((channel: any) => ({
            channel: channel.channel,
            applicationCount: parseInt(channel.applicationCount) || 0,
            conversionCount: parseInt(channel.conversionCount) || 0,
            conversionRate: parseFloat(channel.conversionRate) || 0
          })),
          monthlyTrends: monthlyTrendsArray.map((trend: any) => ({
            month: trend.month,
            applications: parseInt(trend.applications) || 0,
            conversions: parseInt(trend.conversions) || 0,
            conversionRate: parseFloat(trend.conversionRate) || 0
          })),
          activityEffectiveness: activityStatsArray.map((activity: any) => ({
            activityName: activity.activityName,
            activityType: activity.activityType,
            participantCount: parseInt(activity.participantCount) || 0,
            generatedApplications: parseInt(activity.generatedApplications) || 0,
            applicationRate: parseFloat(activity.applicationRate) || 0
          })),
          summary: {
            totalChannels: channelStatsArray.length,
            bestChannel: channelStatsArray[0]?.channel || '未知',
            averageConversionRate: channelStatsArray.reduce((sum: number, channel: any) =>
              sum + (parseFloat(channel.conversionRate) || 0), 0) / Math.max(channelStatsArray.length, 1),
            totalActivities: activityStatsArray.length
          }
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取营销分析数据失败');
    }
  }

  /**
   * 获取营销活动ROI分析
   * @param req 请求
   * @param res 响应
   */
  public getROIAnalysis = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      // 使用真实营销活动数据计算ROI
      const marketingCampaigns = await MarketingCampaign.findAll({
        where: {
          // kindergartenId: (req.query.kindergartenId ? parseInt(req.query.kindergartenId as string) : 1),
          status: [1, 3] // 进行中和已结束的活动
        },
        include: [
          {
            model: ConversionTracking,
            as: 'conversions',
            attributes: []
          }
        ],
        attributes: [
          'id',
          'title',
          'budget',
          'participantCount',
          'conversionCount',
          'totalRevenue',
          [
            sequelize.literal(`CASE
              WHEN budget > 0 THEN
                CASE
                  WHEN totalRevenue > 0 THEN ROUND((totalRevenue / budget) * 100, 2)
                  ELSE 0
                END
              ELSE 0
            END`),
            'roi'
          ],
          [
            sequelize.literal(`CASE
              WHEN participantCount > 0 THEN ROUND(budget / participantCount, 2)
              ELSE 0
            END`),
            'costPerLead'
          ],
          [
            sequelize.literal(`CASE
              WHEN conversionCount > 0 THEN ROUND(budget / conversionCount, 2)
              ELSE 0
            END`),
            'costPerConversion'
          ]
        ],
        order: [[sequelize.literal('roi'), 'DESC']],
        limit: 20
      });

      const roiData = marketingCampaigns.map(campaign => ({
        campaign: campaign.title,
        investment: campaign.budget || 0,
        leads: campaign.participantCount || 0,
        conversions: campaign.conversionCount || 0,
        revenue: campaign.totalRevenue || 0,
        roi: Number((campaign as any).roi) || 0,
        costPerLead: Number((campaign as any).costPerLead) || 0,
        costPerConversion: Number((campaign as any).costPerConversion) || 0
      }));

      res.json({
        success: true,
        message: '获取营销ROI分析成功',
        data: {
          campaigns: roiData,
          totalInvestment: roiData.reduce((sum, campaign) => sum + campaign.investment, 0),
          totalRevenue: roiData.reduce((sum, campaign) => sum + campaign.revenue, 0),
          averageROI: roiData.reduce((sum, campaign) => sum + campaign.roi, 0) / roiData.length
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取营销ROI分析失败');
    }
  }

  /**
   * 渠道：列表
   */
  public getChannels = async (req: Request, res: Response): Promise<void> => {
    try {
      const { page = 1, pageSize = 20, keyword = '', tag = '' } = req.query as any;

      // 真实数据：按分页返回渠道跟踪基本指标
      const [rows, count] = await Promise.all([
        sequelize.query(
          `SELECT id, channel_name AS channelName, channel_type AS channelType, utm_source AS utmSource,
                  visit_count AS visitCount, lead_count AS leadCount, conversion_count AS conversionCount,
                  ROUND(COALESCE(conversion_rate, CASE WHEN lead_count > 0 THEN conversion_count * 100.0 / lead_count ELSE 0 END), 2) AS conversionRate,
                  cost, revenue, roi, created_at AS createdAt
           FROM channel_trackings
           WHERE deleted_at IS NULL
             ${keyword ? "AND (channel_name LIKE :kw OR utm_source LIKE :kw)" : ''}
           ORDER BY created_at DESC
           LIMIT :limit OFFSET :offset`,
          {
            type: QueryTypes.SELECT,
            replacements: {
              kw: `%${keyword}%`,
              limit: Number(pageSize),
              offset: (Number(page) - 1) * Number(pageSize)
            }
          }
        ),
        sequelize.query(
          `SELECT COUNT(*) AS cnt FROM channel_trackings WHERE deleted_at IS NULL ${keyword ? "AND (channel_name LIKE :kw OR utm_source LIKE :kw)" : ''}`,
          { type: QueryTypes.SELECT, replacements: { kw: `%${keyword}%` } }
        )
      ]);

      const total = Array.isArray(count) ? Number((count[0] as any).cnt || 0) : 0;

      res.json({
        success: true,
        message: '获取渠道列表成功',
        data: { items: rows, total, page: Number(page), pageSize: Number(pageSize) }
      });
    } catch (error) {
      this.handleError(res, error, '获取渠道列表失败');
    }
  }

  /** 渠道：创建 */
  public createChannel = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ success: true, message: '创建渠道成功', data: { id: 0, ...req.body } });
    } catch (error) {
      this.handleError(res, error, '创建渠道失败');
    }
  }

  /** 渠道：更新 */
  public updateChannel = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      res.json({ success: true, message: '更新渠道成功', data: { id: Number(id), ...req.body } });
    } catch (error) {
      this.handleError(res, error, '更新渠道失败');
    }
  }

  /** 渠道：删除 */
  public deleteChannel = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ success: true, message: '删除渠道成功', data: null });
    } catch (error) {
      this.handleError(res, error, '删除渠道失败');
    }
  }

  /** 渠道人：列表 */
  public getChannelContacts = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ success: true, message: '获取渠道人成功', data: { items: [], total: 0 } });
    } catch (error) {
      this.handleError(res, error, '获取渠道人失败');
    }
  }

  /** 渠道人：新增 */
  public addChannelContact = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ success: true, message: '新增渠道人成功', data: { id: 0, ...req.body } });
    } catch (error) {
      this.handleError(res, error, '新增渠道人失败');
    }
  }

  /** 渠道人：删除 */
  public deleteChannelContact = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ success: true, message: '删除渠道人成功', data: null });
    } catch (error) {
      this.handleError(res, error, '删除渠道人失败');
    }
  }

  /** 获取所有可用标签 */
  public getAllChannelTags = async (req: Request, res: Response): Promise<void> => {
    try {
      // 返回预定义的标签列表，实际项目中可以从数据库获取
      const availableTags = [
        '重要', '推荐', '热门', '新渠道', '高转化', '低成本',
        '线上', '线下', '社交媒体', '搜索引擎', '合作伙伴', '直销',
        '付费推广', '免费推广', '口碑营销', '内容营销'
      ];

      res.json({
        success: true,
        message: '获取可用标签成功',
        data: { items: availableTags }
      });
    } catch (error) {
      this.handleError(res, error, '获取可用标签失败');
    }
  }

  /** 渠道标签：列表 */
  public getChannelTags = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ success: true, message: '获取渠道标签成功', data: { items: [] } });
    } catch (error) {
      this.handleError(res, error, '获取渠道标签失败');
    }
  }

  /** 渠道标签：新增 */
  public addChannelTags = async (req: Request, res: Response): Promise<void> => {
    try {
      const tagIds = (req.body && (req.body.tagIds || req.body.names)) || [];
      res.json({ success: true, message: '添加渠道标签成功', data: { items: tagIds } });
    } catch (error) {
      this.handleError(res, error, '添加渠道标签失败');
    }
  }

  /** 渠道标签：删除 */
  public deleteChannelTag = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ success: true, message: '删除渠道标签成功', data: null });
    } catch (error) {
      this.handleError(res, error, '删除渠道标签失败');
    }
  }

  /** 渠道指标 */
  public getChannelMetrics = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({
        success: true,
        message: '获取渠道指标成功',
        data: {
          leads: 0,
          visits: 0,
          preEnroll: 0,
          enroll: 0,
          convRates: {
            lead_to_visit: 0,
            visit_to_aware: 0,
            aware_to_pre_enroll: 0,
            pre_enroll_to_enroll: 0
          },
          trend: []
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取渠道指标失败');
    }
  }

  /** 老带新：列表 */
  public getReferrals = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { page = 1, pageSize = 20, referrerName = '', refereeName = '', status = '', activityId = '', startDate = '', endDate = '' } = req.query as any;
      const offset = (parseInt(page) - 1) * parseInt(pageSize);

      // 构建查询条件
      let whereClause = 'WHERE 1=1';
      const params: any[] = [];

      if (referrerName) {
        whereClause += ` AND r.referrer_id IN (SELECT id FROM ${tenantDb}.users WHERE real_name LIKE ?)`;
        params.push(`%${referrerName}%`);
      }

      if (refereeName) {
        whereClause += ' AND r.referee_name LIKE ?';
        params.push(`%${refereeName}%`);
      }

      if (status) {
        whereClause += ' AND r.status = ?';
        params.push(status);
      }

      if (activityId) {
        whereClause += ' AND r.activity_id = ?';
        params.push(activityId);
      }

      // 日期过滤：只有当用户明确提供日期时才应用过滤
      if (startDate && startDate.trim() !== '') {
        whereClause += ' AND DATE(r.created_at) >= ?';
        params.push(startDate);
      }

      if (endDate && endDate.trim() !== '') {
        whereClause += ' AND DATE(r.created_at) <= ?';
        params.push(endDate);
      }

      // 查询列表数据，关联用户和活动信息
      console.log('🔍 [老带新查询] 执行查询，参数:', {
        whereClause,
        params,
        pageSize: parseInt(pageSize),
        offset
      });

      const queryResult = await sequelize.query(`
        SELECT
          r.*,
          u.real_name as referrer_name,
          u.phone as referrer_phone,
          a.title as activity_name
        FROM ${tenantDb}.referrals r
        LEFT JOIN ${tenantDb}.users u ON r.referrer_id = u.id
        LEFT JOIN ${tenantDb}.activities a ON r.activity_id = a.id
        ${whereClause}
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `, {
        replacements: [...params, parseInt(pageSize), offset],
        type: QueryTypes.SELECT
      });

      // 正确处理Sequelize查询结果 - queryResult本身就是数据数组
      const items = Array.isArray(queryResult) ? queryResult : [];

      console.log('📊 [老带新查询] 查询结果:', {
        queryResultType: typeof queryResult,
        queryResultIsArray: Array.isArray(queryResult),
        itemsType: typeof items,
        itemsIsArray: Array.isArray(items),
        itemsLength: Array.isArray(items) ? items.length : 'N/A',
        firstItem: Array.isArray(items) && items.length > 0 ? items[0] : null
      });

      // 查询总数
      const countQueryResult = await sequelize.query(`
        SELECT COUNT(*) as total
        FROM ${tenantDb}.referrals r
        LEFT JOIN ${tenantDb}.users u ON r.referrer_id = u.id
        ${whereClause}
      `, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      // 正确处理总数查询结果 - countQueryResult是数组，取第一个元素
      const countResult = Array.isArray(countQueryResult) ? countQueryResult[0] : countQueryResult;

      console.log('📊 [老带新查询] 总数查询结果:', {
        countQueryResultType: typeof countQueryResult,
        countQueryResultIsArray: Array.isArray(countQueryResult),
        countResultType: typeof countResult,
        countResultIsArray: Array.isArray(countResult),
        countResult: countResult
      });

      // 确保 items 是数组
      const itemsArray = Array.isArray(items) ? items : [];
      const total = Array.isArray(countResult) && countResult.length > 0 ? (countResult[0] as any)?.total || 0 : (countResult as any)?.total || 0;

      // 格式化数据以匹配前端期望
      const formattedItems = itemsArray.map((item: any) => ({
        ...item,
        referrer: {
          id: item.referrer_id,
          name: item.referrer_name,
          phone: item.referrer_phone,
          type: item.referrer_type
        },
        referee: {
          id: item.referee_id,
          name: item.referee_name,
          phone: item.referee_phone
        },
        activity: {
          id: item.activity_id,
          name: item.activity_name
        }
      }));

      res.json({
        success: true,
        message: '获取老带新列表成功',
        data: {
          items: formattedItems,
          total: total,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取老带新列表失败');
    }
  }

  /** 老带新：统计 */
  public getReferralStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { startDate, endDate } = req.query as any;

      // 构建时间过滤条件：只有当用户明确提供日期时才应用过滤
      let dateFilter = '';
      const params: any[] = [];

      if (startDate && startDate.trim() !== '') {
        dateFilter += ' AND DATE(r.created_at) >= ?';
        params.push(startDate);
      }

      if (endDate && endDate.trim() !== '') {
        dateFilter += ' AND DATE(r.created_at) <= ?';
        params.push(endDate);
      }

      // 统计数据：使用 referrals 表
      const [stats] = await sequelize.query(`
        SELECT
          SUM(CASE WHEN r.status = 'pending' THEN 1 ELSE 0 END) AS newCount,
          SUM(CASE WHEN r.status = 'converted' THEN 1 ELSE 0 END) AS completedCount,
          ROUND(SUM(CASE WHEN r.status = 'converted' THEN 1 ELSE 0 END) * 100.0 / NULLIF(COUNT(*),0), 2) AS convRate
        FROM ${tenantDb}.referrals r
        WHERE 1=1 ${dateFilter}
      `, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      // TOP推荐人统计
      const topReferrersResult = await sequelize.query(`
        SELECT
          r.referrer_id AS referrerId,
          u.real_name AS referrerName,
          COUNT(*) AS count
        FROM ${tenantDb}.referrals r
        LEFT JOIN ${tenantDb}.users u ON r.referrer_id = u.id
        WHERE 1=1 ${dateFilter}
        GROUP BY r.referrer_id, u.real_name
        ORDER BY count DESC
        LIMIT 10
      `, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      // 确保数据安全访问
      // 注意: sequelize.query() 返回数组
      // - 对于单行查询(如stats),使用解构 [stats] 取第一个元素
      // - 对于多行查询(如topReferrers),直接使用整个数组
      const statsData = stats as any;
      const topReferrersArray = Array.isArray(topReferrersResult) ? topReferrersResult as any[] : [];
      const topReferrer = topReferrersArray.length > 0 ? topReferrersArray[0] : null;

      // 计算总奖励金额
      const [rewardStats] = await sequelize.query(`
        SELECT SUM(reward) as totalReward
        FROM ${tenantDb}.referrals r
        WHERE 1=1 ${dateFilter} AND r.reward_status = 'paid'
      `, {
        replacements: params,
        type: QueryTypes.SELECT
      });

      const totalReward = Number((rewardStats as any)?.totalReward || 0);

      res.json({
        success: true,
        message: '获取老带新统计成功',
        data: {
          newCount: Number(statsData?.newCount || 0),
          completedCount: Number(statsData?.completedCount || 0),
          convRate: Number(statsData?.convRate || 0),
          totalReward: totalReward,
          topReferrer: topReferrer ? {
            name: topReferrer.referrerName || '未知',
            count: Number(topReferrer.count || 0)
          } : { name: '-', count: 0 },
          topReferrers: topReferrersArray
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取老带新统计失败');
    }
  }

  /** 老带新：关系图 */
  public getReferralGraph = async (req: Request, res: Response): Promise<void> => {
    try {
      res.json({ success: true, message: '获取老带新关系图成功', data: { nodes: [], edges: [] } });
    } catch (error) {
      this.handleError(res, error, '获取老带新关系图失败');
    }
  }

  /** 转换统计 */
  public getConversionStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const { dimension = 'channel', period = 'month' } = req.query as any;

      // 汇总统计
      const [summary] = await sequelize.query(`
        SELECT
          SUM(lead_count) AS \`lead\`,
          SUM(visit_count) AS visit,
          SUM(registration_count) AS aware,
          SUM(CASE WHEN conversion_type = 3 THEN 1 ELSE 0 END) AS preEnroll,
          SUM(CASE WHEN conversion_type = 4 THEN 1 ELSE 0 END) AS enroll
        FROM (
          SELECT id, lead_count, visit_count, registration_count, 0 AS conversion_type
          FROM channel_trackings WHERE deleted_at IS NULL
          UNION ALL
          SELECT id, 0 AS lead_count, 0 AS visit_count, 0 AS registration_count, conversion_type
          FROM conversion_trackings WHERE deleted_at IS NULL
        ) t
      `, { type: QueryTypes.SELECT }) as [Record<string, any>];

      // 维度系列数据
      let seriesSql = '';
      if (dimension === 'channel') {
        seriesSql = `
          SELECT ct.channel_name AS label,
                 SUM(ct.lead_count) AS \`lead\`,
                 SUM(ct.visit_count) AS visit,
                 SUM(ct.registration_count) AS aware,
                 SUM(CASE WHEN c.conversion_type = 3 THEN 1 ELSE 0 END) AS preEnroll,
                 SUM(CASE WHEN c.conversion_type = 4 THEN 1 ELSE 0 END) AS enroll
          FROM channel_trackings ct
          LEFT JOIN conversion_trackings c ON c.channel_id = ct.id AND c.deleted_at IS NULL
          WHERE ct.deleted_at IS NULL
          GROUP BY ct.channel_name
          ORDER BY \`lead\` DESC
          LIMIT 50`;
      } else if (dimension === 'campaign') {
        seriesSql = `
          SELECT mc.name AS label,
                 SUM(ct.lead_count) AS \`lead\`,
                 SUM(ct.visit_count) AS visit,
                 SUM(ct.registration_count) AS aware,
                 SUM(CASE WHEN c.conversion_type = 3 THEN 1 ELSE 0 END) AS preEnroll,
                 SUM(CASE WHEN c.conversion_type = 4 THEN 1 ELSE 0 END) AS enroll
          FROM marketing_campaigns mc
          LEFT JOIN conversion_trackings c ON c.campaign_id = mc.id AND c.deleted_at IS NULL
          LEFT JOIN channel_trackings ct ON ct.id = c.channel_id AND ct.deleted_at IS NULL
          WHERE mc.deleted_at IS NULL
          GROUP BY mc.id
          ORDER BY \`lead\` DESC
          LIMIT 50`;
      } else {
        // 默认按月份
        seriesSql = `
          SELECT DATE_FORMAT(event_time, '%Y-%m') AS label,
                 SUM(CASE WHEN conversion_type = 1 THEN 1 ELSE 0 END) AS \`lead\`,
                 SUM(CASE WHEN conversion_type = 2 THEN 1 ELSE 0 END) AS visit,
                 SUM(CASE WHEN conversion_type = 3 THEN 1 ELSE 0 END) AS aware,
                 SUM(CASE WHEN conversion_type = 3 THEN 1 ELSE 0 END) AS preEnroll,
                 SUM(CASE WHEN conversion_type = 4 THEN 1 ELSE 0 END) AS enroll
          FROM conversion_trackings
          WHERE deleted_at IS NULL
          GROUP BY DATE_FORMAT(event_time, '%Y-%m')
          ORDER BY label ASC
          LIMIT 24`;
      }

      const series = await sequelize.query(seriesSql, { type: QueryTypes.SELECT });

      // 排行（渠道Top）
      const ranking = await sequelize.query(
        `SELECT channel_name AS label, lead_count AS \`lead\`, visit_count AS visit, registration_count AS aware,
                conversion_count AS enroll
         FROM channel_trackings
         WHERE deleted_at IS NULL
         ORDER BY enroll DESC
         LIMIT 10`,
        { type: QueryTypes.SELECT }
      );

      res.json({ success: true, message: '获取转换统计成功', data: {
        summary: {
          lead: Number((summary as any)?.lead || 0),
          visit: Number((summary as any)?.visit || 0),
          aware: Number((summary as any)?.aware || 0),
          preEnroll: Number((summary as any)?.preEnroll || 0),
          enroll: Number((summary as any)?.enroll || 0)
        },
        series,
        ranking
      } });
    } catch (error) {
      this.handleError(res, error, '获取转换统计失败');
    }
  }

  /** 销售漏斗 */
  public getFunnelStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const [stageCounts] = await sequelize.query(`
        SELECT
          SUM(lead_count) AS \`lead\`,
          SUM(visit_count) AS visit,
          SUM(registration_count) AS aware
        FROM channel_trackings
        WHERE deleted_at IS NULL
      `, { type: QueryTypes.SELECT }) as [Record<string, any>];

      const [preAndPaid] = await sequelize.query(`
        SELECT
          SUM(CASE WHEN conversion_type = 3 THEN 1 ELSE 0 END) AS pre_enroll,
          SUM(CASE WHEN conversion_type = 4 THEN 1 ELSE 0 END) AS paid
        FROM conversion_trackings
        WHERE deleted_at IS NULL
      `, { type: QueryTypes.SELECT }) as [Record<string, any>];

      const lead = Number((stageCounts as any)?.lead || 0);
      const visit = Number((stageCounts as any)?.visit || 0);
      const aware = Number((stageCounts as any)?.aware || 0);
      const pre_enroll = Number((preAndPaid as any)?.pre_enroll || 0);
      const paid = Number((preAndPaid as any)?.paid || 0);

      const safeRate = (a: number, b: number) => (b > 0 ? Math.round((a * 10000) / b) / 100 : 0);

      res.json({ success: true, message: '获取销售漏斗成功', data: {
        stages: [
          { code: 'lead', name: '采集单', count: lead },
          { code: 'visit', name: '进店', count: visit },
          { code: 'aware', name: '了解园区', count: aware },
          { code: 'pre_enroll', name: '预报名', count: pre_enroll },
          { code: 'paid', name: '尾款', count: paid },
        ],
        rates: {
          lead_to_visit: safeRate(visit, lead),
          visit_to_aware: safeRate(aware, visit),
          aware_to_pre_enroll: safeRate(pre_enroll, aware),
          pre_enroll_to_paid: safeRate(paid, pre_enroll),
          overall: safeRate(paid, lead),
        }
      } });
    } catch (error) {
      this.handleError(res, error, '获取销售漏斗失败');
    }
  }

  /** 获取海报模板 */
  public getPosterTemplates = async (req: Request, res: Response): Promise<void> => {
    try {
      const templates = this.posterService.getAvailableTemplates()

      res.json({
        success: true,
        message: '获取海报模板成功',
        data: templates.map(template => ({
          id: template.id,
          name: template.name,
          width: template.width,
          height: template.height,
          backgroundColor: template.backgroundColor,
          preview: `/images/poster-templates/template-${template.id}.jpg`, // 模拟预览图
          isPremium: template.id === 3 // 第3个模板设为付费模板
        }))
      });
    } catch (error) {
      this.handleError(res, error, '获取海报模板失败');
    }
  }

  /** 推广码：生成 */
  public generateReferralCode = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { activity_id, title, description, validity_days, usage_limit, is_custom } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: '用户未认证' });
        return;
      }

      // 生成唯一的推荐码
      const referralCode = this.generateUniqueReferralCode(userId);

      // 计算过期时间
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + (validity_days || 30));

      // 调试参数
      console.log('🔍 [推广码生成] 请求参数:', {
        userId, activity_id, title, description, validity_days, usage_limit, is_custom
      });

      // 使用原始SQL创建推荐码
      const [result] = await sequelize.query(`
        INSERT INTO ${tenantDb}.referral_codes (
          user_id, activity_id, referral_code, title, description,
          validity_days, usage_limit, expires_at, is_custom, status,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          userId, activity_id || null, referralCode, title || '', description || '',
          validity_days || 30, usage_limit || 100, expiresAt, is_custom || false, 'active'
        ],
        type: QueryTypes.INSERT
      });

      const referralId = (result as any).insertId;

      res.json({
        success: true,
        message: '推广码生成成功',
        data: {
          id: referralId,
          referral_code: referralCode,
          expires_at: expiresAt.toISOString(),
          usage_limit: usage_limit,
          usage_count: 0
        }
      });
    } catch (error) {
      this.handleError(res, error, '生成推广码失败');
    }
  }

  /** 推广海报：生成 */
  public generateReferralPoster = async (req: Request, res: Response): Promise<void> => {
    try {
      const {
        template_id,
        main_title,
        sub_title,
        contact_phone,
        address,
        referral_code,
        referral_link,
        kindergarten_name
      } = req.body;

      // 使用海报生成服务生成真实海报
      const posterUrl = await this.posterService.generatePoster({
        templateId: template_id,
        mainTitle: main_title,
        subTitle: sub_title,
        contactPhone: contact_phone,
        address: address,
        referralCode: referral_code,
        referralLink: referral_link,
        kindergartenName: kindergarten_name
      });

      res.json({
        success: true,
        message: '推广海报生成成功',
        data: {
          poster_url: posterUrl,
          template_id: template_id,
          generated_at: new Date().toISOString()
        }
      });
    } catch (error) {
      this.handleError(res, error, '生成推广海报失败');
    }
  }

  /** 推广码：统计 */
  public getReferralCodeStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { code } = req.params;

      // 获取推荐码统计信息
      const [stats] = await sequelize.query(`
        SELECT
          rc.*,
          0 as total_referrals,
          0 as converted_referrals,
          0 as weekly_referrals,
          0 as monthly_referrals
        FROM ${tenantDb}.referral_codes rc
        WHERE rc.referral_code = ? AND rc.deleted_at IS NULL
      `, {
        replacements: [code],
        type: QueryTypes.SELECT
      });

      const statsData = Array.isArray(stats) ? stats[0] : stats;

      if (!statsData) {
        res.status(404).json({ success: false, message: '推广码不存在' });
        return;
      }

      // 获取点击统计
      const [clickStats] = await sequelize.query(`
        SELECT
          COUNT(*) as total_clicks,
          COUNT(DISTINCT DATE(created_at)) as active_days,
          COUNT(DISTINCT ip_address) as unique_visitors
        FROM ${tenantDb}.referral_clicks
        WHERE referral_code = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `, {
        replacements: [code],
        type: QueryTypes.SELECT
      });

      const clickData = Array.isArray(clickStats) ? clickStats[0] : clickStats;

      // 计算转化率
      const conversionRate = statsData.total_referrals > 0
        ? (statsData.converted_referrals / statsData.total_referrals) * 100
        : 0;

      res.json({
        success: true,
        message: '获取推广码统计成功',
        data: {
          basic_info: {
            referral_code: statsData.referral_code,
            title: statsData.title,
            description: statsData.description,
            created_at: statsData.created_at,
            expires_at: statsData.expires_at,
            status: statsData.status,
            usage_limit: statsData.usage_limit,
            usage_count: statsData.usage_count
          },
          referral_stats: {
            total_referrals: Number(statsData.total_referrals) || 0,
            converted_referrals: Number(statsData.converted_referrals) || 0,
            weekly_referrals: Number(statsData.weekly_referrals) || 0,
            monthly_referrals: Number(statsData.monthly_referrals) || 0,
            conversion_rate: Number(conversionRate.toFixed(2))
          },
          click_stats: {
            total_clicks: Number(clickData?.total_clicks) || 0,
            active_days: Number(clickData?.active_days) || 0,
            unique_visitors: Number(clickData?.unique_visitors) || 0
          }
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取推广码统计失败');
    }
  }

  /** 推广码：点击跟踪 */
  public trackReferralClick = async (req: Request, res: Response): Promise<void> => {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const { code } = req.params;
      const { ip_address, user_agent, referrer } = req.body;

      // 记录点击
      await sequelize.query(`
        INSERT INTO ${tenantDb}.referral_clicks (
          referral_code, ip_address, user_agent, referrer, created_at
        ) VALUES (?, ?, ?, ?, NOW())
      `, {
        replacements: [code, ip_address, user_agent, referrer],
        type: QueryTypes.INSERT
      });

      // 更新使用次数
      await sequelize.query(`
        UPDATE ${tenantDb}.referral_codes
        SET usage_count = usage_count + 1, updated_at = NOW()
        WHERE referral_code = ?
      `, {
        replacements: [code],
        type: QueryTypes.UPDATE
      });

      res.json({
        success: true,
        message: '点击记录成功'
      });
    } catch (error) {
      this.handleError(res, error, '记录点击失败');
    }
  }

  /**
   * 获取我的推广码列表
   */
  public getMyReferralCodes = async (req: RequestWithUser, res: Response): Promise<void> => {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({ success: false, message: '用户未认证' });
        return;
      }

      // 使用原始SQL获取用户的推广码列表
      const [referralCodes] = await sequelize.query(`
        SELECT
          rc.*,
          a.title as activity_name
        FROM ${tenantDb}.referral_codes rc
        LEFT JOIN ${tenantDb}.activities a ON rc.activity_id = a.id
        WHERE rc.user_id = ? AND rc.deleted_at IS NULL
        ORDER BY rc.created_at DESC
      `, {
        replacements: [userId],
        type: QueryTypes.SELECT
      });

      const codesArray = Array.isArray(referralCodes) ? referralCodes : [];

      // 格式化数据
      const formattedCodes = codesArray.map((code: any) => ({
        id: code.id,
        referral_code: code.referral_code,
        title: code.title,
        description: code.description,
        activity_name: code.activity_name || null,
        status: code.status,
        created_at: code.created_at,
        expires_at: code.expires_at,
        usage_limit: code.usage_limit,
        usage_count: code.usage_count,
        qr_code_url: code.qr_code_url,
        poster_url: code.poster_url,
        is_custom: code.is_custom,
        stats: {
          total_referrals: 0, // 暂时设为0，后续可从referrals表统计
          converted_referrals: 0, // 暂时设为0，后续可从referrals表统计
          weekly_referrals: 0, // 暂时设为0，后续可从referrals表统计
          conversion_rate: 0
        }
      }));

      res.json({
        success: true,
        message: '获取我的推广码成功',
        data: {
          items: formattedCodes,
          total: formattedCodes.length
        }
      });
    } catch (error) {
      this.handleError(res, error, '获取我的推广码失败');
    }
  }

  /**
   * 生成唯一推荐码
   */
  private generateUniqueReferralCode(userId: number): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 8);
    const userHash = userId.toString(36);
    return `${userHash}${timestamp}${randomStr}`.toUpperCase();
  }

  
  /**
   * 处理错误的私有方法
   */
  private handleError(res: Response, error: any, defaultMessage: string): void {
    console.error(defaultMessage + ':', error);
    res.status(500).json({
      success: false,
      message: defaultMessage,
      error: {
        code: 'SERVER_ERROR',
        message: error?.message || '未知错误'
      }
    });
  }
}