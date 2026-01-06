import { NotificationType } from '../../models/notification.model';
import { FindOptions, Op } from 'sequelize';
import { sequelize } from '../../init';
import { ConversionTracking } from '../../models/conversion-tracking.model';
import { MarketingCampaign } from '../../models/marketing-campaign.model';
import { ChannelTracking } from '../../models/channel-tracking.model';
import { Advertisement } from '../../models/advertisement.model';
import { 
  IConversionTrackingService, 
  ConversionStatistics, 
  FollowUpSummary,
  ConversionAnalysis
} from './interfaces/conversion-tracking-service.interface';

/**
 * 跟进状态枚举
 */
enum FollowUpStatus {
  NOT_FOLLOWED = 0,
  CONTACTED = 1,
  REVISITED = 2,
  NEED_CONTACT = 3,
  CONFIRMED_INTENT = 4,
  NO_INTENT = 5,
  CONVERTED = 6,
  ABANDONED = 7
}

/**
 * 转化跟踪服务实现
 * @description 实现转化跟踪管理相关的业务逻辑
 */
export class ConversionTrackingService implements IConversionTrackingService {
  /**
   * 创建转化跟踪记录
   * @param data 转化跟踪创建数据
   * @returns 创建的转化跟踪实例
   */
  async create(data: any): Promise<ConversionTracking> {
    try {
      const conversion = await ConversionTracking.create(data);
      return conversion;
    } catch (error) {
      console.error('创建转化跟踪记录失败:', error);
      throw new Error('创建转化跟踪记录失败');
    }
  }

  /**
   * 根据ID查找转化跟踪记录
   * @param id 转化跟踪ID
   * @returns 转化跟踪实例或null
   */
  async findById(id: number): Promise<ConversionTracking | null> {
    try {
      const conversion = await ConversionTracking.findByPk(id);
      return conversion;
    } catch (error) {
      console.error('查询转化跟踪记录失败:', error);
      throw new Error('查询转化跟踪记录失败');
    }
  }

  /**
   * 查询所有符合条件的转化跟踪记录
   * @param options 查询选项
   * @returns 转化跟踪数组
   */
  async findAll(options?: FindOptions): Promise<ConversionTracking[]> {
    try {
      const conversions = await ConversionTracking.findAll(options);
      return conversions;
    } catch (error) {
      console.error('查询转化跟踪列表失败:', error);
      throw new Error('查询转化跟踪列表失败');
    }
  }

  /**
   * 更新转化跟踪信息
   * @param id 转化跟踪ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  async update(id: number, data: Partial<any>): Promise<boolean> {
    try {
      const [affectedCount] = await ConversionTracking.update(data, {
        where: { id }
      });
      return affectedCount > 0;
    } catch (error) {
      console.error('更新转化跟踪记录失败:', error);
      throw new Error('更新转化跟踪记录失败');
    }
  }

  /**
   * 删除转化跟踪记录
   * @param id 转化跟踪ID
   * @returns 是否删除成功
   */
  async delete(id: number): Promise<boolean> {
    try {
      const affectedCount = await ConversionTracking.destroy({
        where: { id }
      });
      return affectedCount > 0;
    } catch (error) {
      console.error('删除转化跟踪记录失败:', error);
      throw new Error('删除转化跟踪记录失败');
    }
  }

  /**
   * 获取转化统计信息
   * @param kindergartenId 幼儿园ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 统计信息
   */
  async getStats(kindergartenId: number, startDate: Date, endDate: Date): Promise<ConversionStatistics> {
    try {
      // 获取总转化数
      const total = await ConversionTracking.count({
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        }
      });
      
      // 按转化类型分组统计
      const conversionsByType = await ConversionTracking.findAll({
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['conversionType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['conversionType'],
        raw: true
      }) as unknown as Array<{conversionType: number, count: number}>;
      
      // 构建按类型分组的统计
      const byType: Record<string, number> = {};
      conversionsByType.forEach(conv => {
        const typeText = this.getConversionTypeText(conv.conversionType);
        byType[typeText] = conv.count;
      });
      
      // 按来源分组统计
      const conversionsBySource = await ConversionTracking.findAll({
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        },
        attributes: ['conversionSource', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['conversionSource'],
        raw: true
      }) as unknown as Array<{conversionSource: string, count: number}>;
      
      // 构建按来源分组的统计
      const bySource: Record<string, number> = {};
      conversionsBySource.forEach(conv => {
        bySource[conv.conversionSource] = conv.count;
      });
      
      // 计算平均转化价值
      const totalValue = await ConversionTracking.sum('eventValue', {
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        }
      }) || 0;
      
      const averageValue = total > 0 ? totalValue / total : 0;
      
      // 计算转化率 (假设从渠道点击次数计算)
      const totalClicks = await ChannelTracking.sum('clicks' as any, {
        where: { kindergartenId }
      }) || 0;
      
      const conversionRate = totalClicks > 0 ? (total / totalClicks) * 100 : 0;
      
      return {
        total,
        byType,
        bySource,
        conversionRate,
        averageValue
      };
    } catch (error) {
      console.error('获取转化统计信息失败:', error);
      throw new Error('获取转化统计信息失败');
    }
  }

  /**
   * 获取转化跟进状态摘要
   * @param kindergartenId 幼儿园ID
   * @returns 跟进状态摘要
   */
  async getFollowUpSummary(kindergartenId: number): Promise<FollowUpSummary> {
    try {
      // 获取各个跟进状态的数量
      const followUpStats = await ConversionTracking.findAll({
        where: { kindergartenId },
        attributes: ['followUpStatus', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['followUpStatus'],
        raw: true
      }) as unknown as Array<{followUpStatus: number, count: number}>;
      
      // 初始化所有状态的计数为0
      const summary: FollowUpSummary = {
        notFollowed: 0,
        contacted: 0,
        revisited: 0,
        needContact: 0,
        confirmedIntent: 0,
        noIntent: 0,
        converted: 0,
        abandoned: 0
      };
      
      // 填充有数据的状态计数
      followUpStats.forEach(stat => {
        switch (stat.followUpStatus) {
          case FollowUpStatus.NOT_FOLLOWED:
            summary.notFollowed = stat.count;
            break;
          case FollowUpStatus.CONTACTED:
            summary.contacted = stat.count;
            break;
          case FollowUpStatus.REVISITED:
            summary.revisited = stat.count;
            break;
          case FollowUpStatus.NEED_CONTACT:
            summary.needContact = stat.count;
            break;
          case FollowUpStatus.CONFIRMED_INTENT:
            summary.confirmedIntent = stat.count;
            break;
          case FollowUpStatus.NO_INTENT:
            summary.noIntent = stat.count;
            break;
          case FollowUpStatus.CONVERTED:
            summary.converted = stat.count;
            break;
          case FollowUpStatus.ABANDONED:
            summary.abandoned = stat.count;
            break;
        }
      });
      
      return summary;
    } catch (error) {
      console.error('获取转化跟进状态摘要失败:', error);
      throw new Error('获取转化跟进状态摘要失败');
    }
  }

  /**
   * 记录转化事件
   * @param data 转化数据
   * @returns 创建的转化跟踪实例
   */
  async recordConversion(data: any): Promise<ConversionTracking> {
    try {
      // 确保必要字段存在
      if (!data.eventTime) {
        data.eventTime = new Date();
      }
      
      // 确保conversionStatus字段存在
      if (data.conversionStatus === undefined) {
        data.conversionStatus = 1; // 有效转化
      }
      
      // 确保followUpStatus字段存在
      if (data.followUpStatus === undefined) {
        data.followUpStatus = FollowUpStatus.NOT_FOLLOWED;
      }
      
      // 确保isFirstVisit字段存在
      if (data.isFirstVisit === undefined) {
        data.isFirstVisit = 0; // 非首次访问
      }
      
      // 创建转化记录
      const conversion = await this.create(data);
      return conversion;
    } catch (error) {
      console.error('记录转化事件失败:', error);
      throw new Error('记录转化事件失败');
    }
  }

  /**
   * 更新转化跟进状态
   * @param id 转化跟踪ID
   * @param status 跟进状态
   * @param userId 跟进人ID
   * @param remark 备注信息
   * @returns 是否更新成功
   */
  async updateFollowUpStatus(id: number, status: number, userId: number, remark?: string): Promise<boolean> {
    try {
      const conversion = await this.findById(id);
      if (!conversion) {
        throw new Error('转化记录不存在');
      }
      
      const updateData: any = {
        followUpStatus: status,
        followUpUserId: userId,
        lastFollowUpTime: new Date()
      };
      
      if (remark) {
        updateData.followUpRemark = remark;
      }
      
      // 如果状态是"已转化"，则自动设置转化状态为有效
      if (status === FollowUpStatus.CONVERTED) {
        updateData.conversionStatus = 1; // 有效转化
      }
      
      // 如果状态是"已放弃"，则自动设置转化状态为无效
      if (status === FollowUpStatus.ABANDONED) {
        updateData.conversionStatus = 0; // 无效转化
      }
      
      const updated = await this.update(id, updateData);
      return updated;
    } catch (error) {
      console.error('更新转化跟进状态失败:', error);
      throw new Error('更新转化跟进状态失败');
    }
  }

  /**
   * 获取指定营销活动的转化记录
   * @param campaignId 营销活动ID
   * @returns 转化跟踪数组
   */
  async findByCampaignId(campaignId: number): Promise<ConversionTracking[]> {
    try {
      const conversions = await ConversionTracking.findAll({
        where: { campaignId }
      });
      
      return conversions;
    } catch (error) {
      console.error('获取营销活动转化记录失败:', error);
      throw new Error('获取营销活动转化记录失败');
    }
  }

  /**
   * 获取指定渠道的转化记录
   * @param channelId 渠道ID
   * @returns 转化跟踪数组
   */
  async findByChannelId(channelId: number): Promise<ConversionTracking[]> {
    try {
      const conversions = await ConversionTracking.findAll({
        where: { channelId }
      });
      
      return conversions;
    } catch (error) {
      console.error('获取渠道转化记录失败:', error);
      throw new Error('获取渠道转化记录失败');
    }
  }

  /**
   * 获取指定广告的转化记录
   * @param advertisementId 广告ID
   * @returns 转化跟踪数组
   */
  async findByAdvertisementId(advertisementId: number): Promise<ConversionTracking[]> {
    try {
      const conversions = await ConversionTracking.findAll({
        where: { advertisementId }
      });
      
      return conversions;
    } catch (error) {
      console.error('获取广告转化记录失败:', error);
      throw new Error('获取广告转化记录失败');
    }
  }

  /**
   * 获取指定家长的转化记录
   * @param parentId 家长ID
   * @returns 转化跟踪数组
   */
  async findByParentId(parentId: number): Promise<ConversionTracking[]> {
    try {
      const conversions = await ConversionTracking.findAll({
        where: { parentId }
      });
      
      return conversions;
    } catch (error) {
      console.error('获取家长转化记录失败:', error);
      throw new Error('获取家长转化记录失败');
    }
  }

  /**
   * 获取转化分析
   * @param kindergartenId 幼儿园ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 转化分析结果
   */
  async getAnalysis(kindergartenId: number, startDate: Date, endDate: Date): Promise<ConversionAnalysis> {
    try {
      // 按天统计转化
      const conversionsByDay = await ConversionTracking.findAll({
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        },
        attributes: [
          [sequelize.fn('DATE', sequelize.col('eventTime')), 'day'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('DATE', sequelize.col('eventTime'))],
        raw: true
      }) as unknown as Array<{day: string, count: number}>;
      
      // 构建按天的统计
      const conversionByDay: Record<string, number> = {};
      conversionsByDay.forEach(item => {
        conversionByDay[item.day] = item.count;
      });
      
      // 按小时统计转化
      const conversionsByHour = await ConversionTracking.findAll({
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        },
        attributes: [
          [sequelize.fn('HOUR', sequelize.col('eventTime')), 'hour'],
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: [sequelize.fn('HOUR', sequelize.col('eventTime'))],
        raw: true
      }) as unknown as Array<{hour: string, count: number}>;
      
      // 构建按小时的统计
      const conversionByHour: Record<string, number> = {};
      conversionsByHour.forEach(item => {
        conversionByHour[item.hour] = item.count;
      });
      
      // 按设备统计转化
      const conversionsByDevice = await ConversionTracking.findAll({
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        },
        attributes: [
          'deviceType',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['deviceType'],
        raw: true
      }) as unknown as Array<{deviceType: string, count: number}>;
      
      // 构建按设备的统计
      const conversionByDevice: Record<string, number> = {};
      conversionsByDevice.forEach(item => {
        conversionByDevice[item.deviceType || '未知'] = item.count;
      });
      
      // 按价值区间统计转化
      const valueRanges = [
        {min: 0, max: 100, label: '0-100'},
        {min: 100, max: 500, label: '100-500'},
        {min: 500, max: 1000, label: '500-1000'},
        {min: 1000, max: 5000, label: '1000-5000'},
        {min: 5000, max: null, label: '5000+'}
      ];
      
      const valueDistribution: Record<string, number> = {};
      
      // 为每个价值区间计算转化数
      for (const range of valueRanges) {
        const whereClause: any = { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] },
          eventValue: {}
        };
        
        if (range.min !== null) {
          whereClause.eventValue[Op.gte] = range.min;
        }
        
        if (range.max !== null) {
          whereClause.eventValue[Op.lt] = range.max;
        }
        
        const count = await ConversionTracking.count({ where: whereClause });
        valueDistribution[range.label] = count;
      }
      
      // 获取排名前5的来源
      const topSourcesData = await ConversionTracking.findAll({
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        },
        attributes: [
          'conversionSource',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['conversionSource'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 5,
        raw: true
      }) as unknown as Array<{conversionSource: string, count: number}>;
      
      const topSources = topSourcesData.map(item => ({
        source: item.conversionSource,
        count: item.count
      }));
      
      // 获取排名前5的营销活动
      const topCampaignsData = await ConversionTracking.findAll({
        where: { 
          kindergartenId,
          campaignId: { [Op.not]: null },
          eventTime: { [Op.between]: [startDate, endDate] }
        },
        attributes: [
          'campaignId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['campaignId'],
        order: [[sequelize.fn('COUNT', sequelize.col('id')), 'DESC']],
        limit: 5,
        raw: true
      }) as unknown as Array<{campaignId: number, count: number}>;
      
      // 获取活动名称
      const topCampaigns = [];
      for (const item of topCampaignsData) {
        const campaign = await MarketingCampaign.findByPk(item.campaignId);
        topCampaigns.push({
          campaign: campaign ? campaign.get('name') as string : `活动ID:${item.campaignId}`,
          count: item.count
        });
      }
      
      return {
        conversionByDay,
        conversionByHour,
        conversionByDevice,
        valueDistribution,
        topSources,
        topCampaigns
      };
    } catch (error) {
      console.error('获取转化分析失败:', error);
      throw new Error('获取转化分析失败');
    }
  }

  /**
   * 导出转化数据
   * @param kindergartenId 幼儿园ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 导出的数据数组
   */
  async exportData(kindergartenId: number, startDate: Date, endDate: Date): Promise<any[]> {
    try {
      const conversions = await ConversionTracking.findAll({
        where: { 
          kindergartenId,
          eventTime: { [Op.between]: [startDate, endDate] }
        },
        raw: true
      });
      
      // 转换为可导出的格式
      const exportData = conversions.map(conversion => {
        return {
          转化ID: conversion.id,
          转化类型: this.getConversionTypeText(conversion.conversionType as number),
          转化来源: conversion.conversionSource,
          转化事件: conversion.conversionEvent,
          转化价值: conversion.eventValue,
          转化时间: conversion.eventTime,
          是否首次访问: conversion.isFirstVisit ? '是' : '否',
          转化状态: conversion.conversionStatus ? '有效' : '无效',
          跟进状态: this.getFollowUpStatusText(conversion.followUpStatus as number),
          最后跟进时间: conversion.updatedAt || null,
          跟进备注: ''
        };
      });
      
      return exportData;
    } catch (error) {
      console.error('导出转化数据失败:', error);
      throw new Error('导出转化数据失败');
    }
  }

  /**
   * 计算转化归因
   * @param parentId 家长ID
   * @returns 归因结果
   */
  async calculateAttribution(parentId: number): Promise<Record<string, number>> {
    try {
      // 获取该家长的所有转化记录
      const conversions = await this.findByParentId(parentId);
      
      // 如果没有转化记录，返回空结果
      if (conversions.length === 0) {
        return {};
      }
      
      // 计算各个渠道的归因权重
      const attribution: Record<string, number> = {};
      
      // 简单的最后点击归因模型
      // 取最近的转化记录进行归因
      const sortedConversions = [...conversions].sort((a, b) => {
        const aTime = a.get('eventTime') as Date;
        const bTime = b.get('eventTime') as Date;
        return bTime.getTime() - aTime.getTime();
      });
      
      const latestConversion = sortedConversions[0];
      const source = latestConversion.get('conversionSource') as string;
      
      attribution[source] = 100;
      
      return attribution;
      
      // 注: 在实际项目中，可能需要实现更复杂的归因模型，如:
      // - 首次点击归因
      // - 线性归因
      // - 位置归因
      // - 时间衰减归因
      // 这些需要更详细的用户行为数据和更复杂的计算逻辑
    } catch (error) {
      console.error('计算转化归因失败:', error);
      throw new Error('计算转化归因失败');
    }
  }
  
  /**
   * 获取转化类型文本
   * @param type 转化类型ID
   * @returns 转化类型文本
   */
  private getConversionTypeText(type: number): string {
    switch (type) {
      case 1:
        return '咨询';
      case 2:
        return '预约';
      case 3:
        return '报名';
      case 4:
        return '其他';
      default:
        return '未知';
    }
  }
  
  /**
   * 获取跟进状态文本
   * @param status 跟进状态ID
   * @returns 跟进状态文本
   */
  private getFollowUpStatusText(status: number): string {
    switch (status) {
      case FollowUpStatus.NOT_FOLLOWED:
        return '未跟进';
      case FollowUpStatus.CONTACTED:
        return '已联系';
      case FollowUpStatus.REVISITED:
        return '已回访';
      case FollowUpStatus.NEED_CONTACT:
        return '需再次联系';
      case FollowUpStatus.CONFIRMED_INTENT:
        return '已确认意向';
      case FollowUpStatus.NO_INTENT:
        return '无意向';
      case FollowUpStatus.CONVERTED:
        return '已转化';
      case FollowUpStatus.ABANDONED:
        return '已放弃';
      default:
        return '未知';
    }
  }
}

export default new ConversionTrackingService(); 