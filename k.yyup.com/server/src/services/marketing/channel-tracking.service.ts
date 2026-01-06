import { NotificationType } from '../../models/notification.model';
import { FindOptions, Op } from 'sequelize';
import { sequelize } from '../../init';
import { ChannelTracking } from '../../models/channel-tracking.model';
import { ConversionTracking } from '../../models/conversion-tracking.model';
import { 
  IChannelTrackingService, 
  ChannelStatistics,
  ChannelPerformance,
  AttributionAnalysis
} from './interfaces/channel-tracking-service.interface';

/**
 * 渠道跟踪服务实现
 * @description 实现渠道跟踪管理相关的业务逻辑
 */
export class ChannelTrackingService implements IChannelTrackingService {
  /**
   * 创建渠道跟踪记录
   * @param data 渠道跟踪创建数据
   * @returns 创建的渠道跟踪实例
   */
  async create(data: any): Promise<ChannelTracking> {
    try {
      const channel = await ChannelTracking.create(data);
      return channel;
    } catch (error) {
      console.error('创建渠道跟踪记录失败:', error);
      throw new Error('创建渠道跟踪记录失败');
    }
  }

  /**
   * 根据ID查找渠道跟踪记录
   * @param id 渠道跟踪ID
   * @returns 渠道跟踪实例或null
   */
  async findById(id: number): Promise<ChannelTracking | null> {
    try {
      const channel = await ChannelTracking.findByPk(id);
      return channel;
    } catch (error) {
      console.error('查询渠道跟踪记录失败:', error);
      throw new Error('查询渠道跟踪记录失败');
    }
  }

  /**
   * 查询所有符合条件的渠道跟踪记录
   * @param options 查询选项
   * @returns 渠道跟踪数组
   */
  async findAll(options?: FindOptions): Promise<ChannelTracking[]> {
    try {
      const channels = await ChannelTracking.findAll(options);
      return channels;
    } catch (error) {
      console.error('查询渠道跟踪列表失败:', error);
      throw new Error('查询渠道跟踪列表失败');
    }
  }

  /**
   * 更新渠道跟踪信息
   * @param id 渠道跟踪ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  async update(id: number, data: Partial<any>): Promise<boolean> {
    try {
      const [affectedCount] = await ChannelTracking.update(data, {
        where: { id }
      });
      return affectedCount > 0;
    } catch (error) {
      console.error('更新渠道跟踪记录失败:', error);
      throw new Error('更新渠道跟踪记录失败');
    }
  }

  /**
   * 删除渠道跟踪记录
   * @param id 渠道跟踪ID
   * @returns 是否删除成功
   */
  async delete(id: number): Promise<boolean> {
    try {
      const affectedCount = await ChannelTracking.destroy({
        where: { id }
      });
      return affectedCount > 0;
    } catch (error) {
      console.error('删除渠道跟踪记录失败:', error);
      throw new Error('删除渠道跟踪记录失败');
    }
  }

  /**
   * 获取渠道统计信息
   * @param kindergartenId 幼儿园ID
   * @returns 统计信息
   */
  async getStats(kindergartenId: number): Promise<ChannelStatistics> {
    try {
      // 获取总渠道数
      const total = await ChannelTracking.count({
        where: { kindergartenId }
      });
      
      // 获取活跃渠道数
      const active = await ChannelTracking.count({
        where: { 
          kindergartenId,
          status: 1, // 活跃状态
        }
      });
      
      // 按来源分组统计
      const channels = await ChannelTracking.findAll({
        where: { kindergartenId },
        attributes: ['utmSource', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['utmSource'],
        raw: true
      }) as unknown as Array<{utmSource: string, count: number}>;
      
      // 构建按来源分组的统计
      const bySource: Record<string, number> = {};
      channels.forEach(channel => {
        if (channel.utmSource) {
          bySource[channel.utmSource] = channel.count;
        } else {
          bySource['未知'] = (bySource['未知'] || 0) + channel.count;
        }
      });
      
      // 获取TOP渠道
      const topChannels = [...channels]
        .filter(channel => channel.utmSource)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(channel => ({name: channel.utmSource || '未知', count: channel.count}));
      
      // 计算转化率
      const totalVisits = await ChannelTracking.sum('visitCount', {
        where: { kindergartenId }
      }) || 0;
      
      const totalConversions = await ChannelTracking.sum('conversionCount', {
        where: { kindergartenId }
      }) || 0;
      
      const conversionRate = totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;
      
      return {
        total,
        active,
        bySource,
        topChannels,
        conversionRate
      };
    } catch (error) {
      console.error('获取渠道统计信息失败:', error);
      throw new Error('获取渠道统计信息失败');
    }
  }

  /**
   * 获取渠道性能数据
   * @param channelId 渠道ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 渠道性能数据
   */
  async getPerformance(channelId: number, startDate: Date, endDate: Date): Promise<ChannelPerformance> {
    try {
      const channel = await this.findById(channelId);
      if (!channel) {
        throw new Error('渠道不存在');
      }
      
      // 获取时间范围内的转化数据
      const conversions = await ConversionTracking.findAll({
        where: {
          channelId,
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // 统计数据
      const totalConversions = conversions.length;
      const totalValue = conversions.reduce((sum, conv) => sum + (conv.get('value') as number), 0);
      
      // 获取渠道基本统计
      const views = channel.get('visitCount') as number;
      const clicks = views; // 暂时使用访问次数作为点击次数
      const leads = channel.get('leadCount') as number;
      const cost = channel.get('cost') as number || 0;
      
      // 计算各项指标
      const conversionRate = clicks > 0 ? (totalConversions / clicks) * 100 : 0;
      const cpl = leads > 0 ? cost / leads : 0;
      const cpa = totalConversions > 0 ? cost / totalConversions : 0;
      const roi = cost > 0 ? ((totalValue - cost) / cost) * 100 : 0;
      
      return {
        views,
        clicks,
        leads,
        conversions: totalConversions,
        conversionRate,
        cost,
        cpl,
        cpa,
        roi
      };
    } catch (error) {
      console.error('获取渠道性能数据失败:', error);
      throw new Error('获取渠道性能数据失败');
    }
  }

  /**
   * 记录渠道点击
   * @param channelId 渠道ID
   * @param userId 用户ID (可选)
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  async recordClick(channelId: number, userId?: number, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const channel = await this.findById(channelId);
      if (!channel) {
        throw new Error('渠道不存在');
      }
      
      // 使用标准的 increment 方法替代自定义方法
      await channel.increment('visitCount', { by: 1 });
      
      // TODO: 记录点击详情到点击日志表
      // 这里可以记录userId和metadata到一个单独的点击日志表中
      
      return true;
    } catch (error) {
      console.error('记录渠道点击失败:', error);
      throw new Error('记录渠道点击失败');
    }
  }

  /**
   * 记录潜在客户
   * @param channelId 渠道ID
   * @param userId 用户ID
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  async recordLead(channelId: number, userId: number, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const channel = await this.findById(channelId);
      if (!channel) {
        throw new Error('渠道不存在');
      }
      
      // 使用标准的 increment 方法替代自定义方法
      await channel.increment('leadCount', { by: 1 });
      
      // TODO: 记录潜在客户详情到潜在客户日志表
      // 这里可以记录userId和metadata到一个单独的潜在客户日志表中
      
      return true;
    } catch (error) {
      console.error('记录渠道潜在客户失败:', error);
      throw new Error('记录渠道潜在客户失败');
    }
  }

  /**
   * 记录渠道转化
   * @param channelId 渠道ID
   * @param userId 用户ID
   * @param value 转化价值
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  async recordConversion(channelId: number, userId: number, value: number, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const channel = await this.findById(channelId);
      if (!channel) {
        throw new Error('渠道不存在');
      }
      
      // 使用标准的 increment 方法替代自定义方法
      await channel.increment('conversionCount', { by: 1 });
      
      // 创建转化记录
      await ConversionTracking.create({
        kindergartenId: channel.get('kindergartenId') as number,
        channelId,
        parentId: userId,
        conversionType: 4, // 默认类型：其他转化
        conversionSource: 'channel',
        conversionEvent: 'channel_conversion',
        eventValue: value,
        eventTime: new Date(),
        isFirstVisit: false, // 使用布尔值而非数值
        conversionStatus: 1, // 默认状态：有效转化
        followUpStatus: 0 // 默认状态：未跟进
      });
      
      return true;
    } catch (error) {
      console.error('记录渠道转化失败:', error);
      throw new Error('记录渠道转化失败');
    }
  }

  /**
   * 生成UTM跟踪链接
   * @param baseUrl 基础URL
   * @param channel 渠道信息
   * @returns 跟踪链接
   */
  generateTrackingUrl(baseUrl: string, channel: {source: string, medium: string, campaign: string, term?: string, content?: string}): string {
    const url = new URL(baseUrl);
    
    // 添加UTM参数
    url.searchParams.append('utm_source', channel.source);
    url.searchParams.append('utm_medium', channel.medium);
    url.searchParams.append('utm_campaign', channel.campaign);
    
    if (channel.term) {
      url.searchParams.append('utm_term', channel.term);
    }
    
    if (channel.content) {
      url.searchParams.append('utm_content', channel.content);
    }
    
    return url.toString();
  }

  /**
   * 获取渠道归因分析
   * @param kindergartenId 幼儿园ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 归因分析结果
   */
  async getAttributionAnalysis(kindergartenId: number, startDate: Date, endDate: Date): Promise<AttributionAnalysis> {
    try {
      // 这里应该实现实际的归因分析逻辑
      // 需要查询用户接触点和转化数据
      
      // 示例数据
      return {
        firstTouch: {
          "搜索引擎": 35,
          "社交媒体": 25,
          "直接访问": 20,
          "邮件营销": 15,
          "其他": 5
        },
        lastTouch: {
          "搜索引擎": 30,
          "社交媒体": 20,
          "直接访问": 25,
          "邮件营销": 20,
          "其他": 5
        },
        linearAttribution: {
          "搜索引擎": 32,
          "社交媒体": 23,
          "直接访问": 22,
          "邮件营销": 18,
          "其他": 5
        },
        timeDecay: {
          "搜索引擎": 31,
          "社交媒体": 21,
          "直接访问": 24,
          "邮件营销": 19,
          "其他": 5
        }
      };
    } catch (error) {
      console.error('获取渠道归因分析失败:', error);
      throw new Error('获取渠道归因分析失败');
    }
  }

  /**
   * 比较多个渠道的性能
   * @param channelIds 渠道ID数组
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 各渠道性能数据
   */
  async compareChannels(channelIds: number[], startDate: Date, endDate: Date): Promise<Record<number, ChannelPerformance>> {
    try {
      const results: Record<number, ChannelPerformance> = {};
      
      // 获取每个渠道的性能数据
      for (const channelId of channelIds) {
        const performance = await this.getPerformance(channelId, startDate, endDate);
        results[channelId] = performance;
      }
      
      return results;
    } catch (error) {
      console.error('比较渠道性能失败:', error);
      throw new Error('比较渠道性能失败');
    }
  }
}

export default new ChannelTrackingService(); 