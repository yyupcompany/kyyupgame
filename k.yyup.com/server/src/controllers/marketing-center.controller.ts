import { Request, Response } from 'express';
import { sequelize } from '../init';
import { QueryTypes } from 'sequelize';
import { ApiError } from '../utils/apiError';
import { ApiResponse } from '../utils/apiResponse';

/**
 * 营销中心控制器
 * @description 处理营销中心相关的HTTP请求
 */
export class MarketingCenterController {

  /**
   * 获取营销中心统计数据
   * @param req 请求对象
   * @param res 响应对象
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const userData = req.user as { id: number };

      // 获取活跃营销活动数量
      const activeCampaignsQuery = `
        SELECT
          COUNT(*) as current_count,
          (
            SELECT COUNT(*)
            FROM ${tenantDb}.marketing_campaigns
            WHERE status = 1
            AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
            AND DATE(created_at) < CURDATE() - INTERVAL 1 MONTH
          ) as previous_count
        FROM ${tenantDb}.marketing_campaigns
        WHERE status = 1
      `;

      const activeCampaignsResult = await sequelize.query(activeCampaignsQuery, {
        type: QueryTypes.SELECT
      }) as any[];

      // 获取本月新客户数量（使用parents表）
      const newCustomersQuery = `
        SELECT
          COUNT(*) as current_count,
          (
            SELECT COUNT(*)
            FROM ${tenantDb}.parents
            WHERE DATE(created_at) >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 1 MONTH)
            AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)
          ) as previous_count
        FROM ${tenantDb}.parents
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)
      `;

      const newCustomersResult = await sequelize.query(newCustomersQuery, {
        type: QueryTypes.SELECT
      }) as any[];

      // 获取转化率数据
      const conversionQuery = `
        SELECT
          COALESCE(
            (SUM(conversion_count) / NULLIF(SUM(participant_count), 0)) * 100,
            0
          ) as current_rate,
          (
            SELECT COALESCE(
              (SUM(conversion_count) / NULLIF(SUM(participant_count), 0)) * 100,
              0
            )
            FROM ${tenantDb}.marketing_campaigns
            WHERE DATE(created_at) >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 1 MONTH)
            AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)
          ) as previous_rate
        FROM ${tenantDb}.marketing_campaigns
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)
      `;

      const conversionResult = await sequelize.query(conversionQuery, {
        type: QueryTypes.SELECT
      }) as any[];

      // 获取营销ROI数据
      const roiQuery = `
        SELECT
          COALESCE(
            (SUM(total_revenue) / NULLIF(SUM(budget), 0)) * 100,
            0
          ) as current_roi,
          (
            SELECT COALESCE(
              (SUM(total_revenue) / NULLIF(SUM(budget), 0)) * 100,
              0
            )
            FROM ${tenantDb}.marketing_campaigns
            WHERE DATE(created_at) >= DATE_SUB(DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY), INTERVAL 1 MONTH)
            AND DATE(created_at) < DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)
          ) as previous_roi
        FROM ${tenantDb}.marketing_campaigns
        WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL DAY(CURDATE())-1 DAY)
      `;

      const roiResult = await sequelize.query(roiQuery, {
        type: QueryTypes.SELECT
      }) as any[];

      // 计算变化百分比
      const calculateChange = (current: number, previous: number): string => {
        // 如果上期为0，当前也为0，则无变化
        if (previous === 0 && current === 0) return '0%';
        // 如果上期为0，当前大于0，显示"新增"而不是百分比
        if (previous === 0 && current > 0) return '新增';
        // 如果上期大于0，当前为0，显示-100%
        if (previous > 0 && current === 0) return '-100%';
        // 正常计算变化百分比
        const change = ((current - previous) / previous) * 100;
        return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
      };

      const activeCampaigns = activeCampaignsResult[0];
      const newCustomers = newCustomersResult[0];
      const conversion = conversionResult[0];
      const roi = roiResult[0];

      const statistics = {
        activeCampaigns: {
          count: parseInt(activeCampaigns.current_count) || 0,
          change: calculateChange(
            parseInt(activeCampaigns.current_count) || 0,
            parseInt(activeCampaigns.previous_count) || 0
          )
        },
        newCustomers: {
          count: parseInt(newCustomers.current_count) || 0,
          change: calculateChange(
            parseInt(newCustomers.current_count) || 0,
            parseInt(newCustomers.previous_count) || 0
          )
        },
        conversionRate: {
          rate: Math.min(100, Math.max(0, parseFloat(conversion.current_rate) || 0)),
          change: calculateChange(
            Math.min(100, Math.max(0, parseFloat(conversion.current_rate) || 0)),
            Math.min(100, Math.max(0, parseFloat(conversion.previous_rate) || 0))
          )
        },
        marketingROI: {
          roi: parseFloat(roi.current_roi) || 0,
          change: calculateChange(
            parseFloat(roi.current_roi) || 0,
            parseFloat(roi.previous_roi) || 0
          )
        }
      };

      res.json({
        success: true,
        data: statistics,
        message: '营销统计数据获取成功'
      });
    } catch (error) {
      console.error('获取营销统计数据失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'STATISTICS_ERROR',
          message: '获取营销统计数据失败'
        }
      });
    }
  }

  /**
   * 获取最近的营销活动
   * @param req 请求对象
   * @param res 响应对象
   */
  async getRecentCampaigns(req: Request, res: Response): Promise<void> {
    try {
      const tenantDb = req.tenant?.databaseName || 'tenant_dev';
      const limit = parseInt(req.query.limit as string) || 3;

      const query = `
        SELECT
          id,
          title,
          description,
          CASE
            WHEN status = 0 THEN '草稿'
            WHEN status = 1 THEN '进行中'
            WHEN status = 2 THEN '已暂停'
            WHEN status = 3 THEN '已完成'
            WHEN status = 4 THEN '已取消'
            ELSE '未知'
          END as status,
          DATE_FORMAT(start_date, '%Y/%m/%d') as startDate,
          participant_count as participantCount,
          COALESCE(
            ROUND((conversion_count / NULLIF(participant_count, 0)) * 100, 1),
            0
          ) as conversionRate
        FROM ${tenantDb}.marketing_campaigns
        ORDER BY created_at DESC
        LIMIT :limit
      `;

      const campaigns = await sequelize.query(query, {
        replacements: { limit },
        type: QueryTypes.SELECT
      });

      res.json({
        success: true,
        data: campaigns,
        message: '最近营销活动获取成功'
      });
    } catch (error) {
      console.error('获取最近营销活动失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CAMPAIGNS_ERROR',
          message: '获取最近营销活动失败'
        }
      });
    }
  }

  /**
   * 获取营销渠道概览
   * @param req 请求对象
   * @param res 响应对象
   */
  async getChannels(req: Request, res: Response): Promise<void> {
    try {
      // 这里可以从数据库获取真实的渠道数据
      // 目前先返回模拟数据，后续可以根据实际需求调整
      const channels = [
        {
          name: '微信朋友圈',
          icon: '💬',
          monthlyCustomers: await MarketingCenterController.getChannelCustomers('wechat'),
          conversionRate: await MarketingCenterController.getChannelConversionRate('wechat'),
          acquisitionCost: await MarketingCenterController.getChannelAcquisitionCost('wechat'),
          status: '运行中'
        },
        {
          name: '百度推广',
          icon: '🔍',
          monthlyCustomers: await MarketingCenterController.getChannelCustomers('baidu'),
          conversionRate: await MarketingCenterController.getChannelConversionRate('baidu'),
          acquisitionCost: await MarketingCenterController.getChannelAcquisitionCost('baidu'),
          status: '运行中'
        },
        {
          name: '小红书',
          icon: '📱',
          monthlyCustomers: await MarketingCenterController.getChannelCustomers('xiaohongshu'),
          conversionRate: await MarketingCenterController.getChannelConversionRate('xiaohongshu'),
          acquisitionCost: await MarketingCenterController.getChannelAcquisitionCost('xiaohongshu'),
          status: '运行中'
        },
        {
          name: '线下传单',
          icon: '📄',
          monthlyCustomers: await MarketingCenterController.getChannelCustomers('offline'),
          conversionRate: await MarketingCenterController.getChannelConversionRate('offline'),
          acquisitionCost: await MarketingCenterController.getChannelAcquisitionCost('offline'),
          status: '已暂停'
        }
      ];

      res.json({
        success: true,
        data: channels,
        message: '营销渠道数据获取成功'
      });
    } catch (error) {
      console.error('获取营销渠道数据失败:', error);
      res.status(500).json({
        success: false,
        error: {
          code: 'CHANNELS_ERROR',
          message: '获取营销渠道数据失败'
        }
      });
    }
  }

  /**
   * 获取渠道客户数量
   * @param channel 渠道名称
   * @returns 客户数量
   */
  private static async getChannelCustomers(channel: string): Promise<number> {
    try {
      // 由于没有专门的客户来源字段，暂时返回模拟数据
      // 后续可以根据实际业务需求添加相关字段到parents或users表
      const channelData = {
        wechat: 45,
        baidu: 32,
        xiaohongshu: 28,
        offline: 18
      };

      return channelData[channel as keyof typeof channelData] || Math.floor(Math.random() * 50) + 10;
    } catch (error) {
      // 如果查询失败，返回随机数据
      return Math.floor(Math.random() * 50) + 10;
    }
  }

  /**
   * 获取渠道转化率
   * @param channel 渠道名称
   * @returns 转化率
   */
  private static async getChannelConversionRate(channel: string): Promise<number> {
    try {
      // 这里可以根据实际业务逻辑计算转化率
      // 目前返回模拟数据
      const rates = {
        wechat: 12.5,
        baidu: 8.3,
        xiaohongshu: 15.6,
        offline: 6.2
      };
      return rates[channel as keyof typeof rates] || Math.random() * 20;
    } catch (error) {
      return Math.random() * 20;
    }
  }

  /**
   * 获取渠道获客成本
   * @param channel 渠道名称
   * @returns 获客成本
   */
  private static async getChannelAcquisitionCost(channel: string): Promise<number> {
    try {
      // 这里可以根据实际业务逻辑计算获客成本
      // 目前返回模拟数据
      const costs = {
        wechat: 85,
        baidu: 120,
        xiaohongshu: 95,
        offline: 45
      };
      return costs[channel as keyof typeof costs] || Math.floor(Math.random() * 100) + 50;
    } catch (error) {
      return Math.floor(Math.random() * 100) + 50;
    }
  }
}
