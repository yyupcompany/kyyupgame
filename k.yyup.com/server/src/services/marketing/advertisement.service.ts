import { NotificationType } from '../../models/notification.model';
import { FindOptions, Op } from 'sequelize';
import { sequelize } from '../../init';
import { Advertisement, AdType } from '../../models/advertisement.model';
import { ConversionTracking } from '../../models/conversion-tracking.model';
import { MarketingCampaign } from '../../models/marketing-campaign.model';
import { 
  IAdvertisementService, 
  AdvertisementStatistics,
  AdvertisementPerformance
} from './interfaces/advertisement-service.interface';

/**
 * 广告状态枚举
 */
enum AdStatus {
  DRAFT = 0,
  ACTIVE = 1,
  PAUSED = 2,
  COMPLETED = 3,
  CANCELLED = 4
}

/**
 * 获取广告类型文本
 * @param adType 广告类型编号
 * @returns 广告类型文本
 */
function getAdTypeText(adType: number): string {
  switch (adType) {
    case AdType.IMAGE: return '图片广告';
    case AdType.VIDEO: return '视频广告';
    case AdType.TEXT: return '文字广告';
    case AdType.BANNER: return '横幅广告';
    case AdType.POPUP: return '弹窗广告';
    case AdType.FEED: return '信息流广告';
    case AdType.SEARCH: return '搜索广告';
    default: return '其他广告';
  }
}

/**
 * 广告投放服务实现
 * @description 实现广告投放管理相关的业务逻辑
 */
export class AdvertisementService implements IAdvertisementService {
  /**
   * 创建广告
   * @param data 广告创建数据
   * @returns 创建的广告实例
   */
  async create(data: any): Promise<Advertisement> {
    try {
      const advertisement = await Advertisement.create(data);
      return advertisement;
    } catch (error) {
      console.error('创建广告失败:', error);
      throw new Error('创建广告失败');
    }
  }

  /**
   * 根据ID查找广告
   * @param id 广告ID
   * @returns 广告实例或null
   */
  async findById(id: number): Promise<Advertisement | null> {
    try {
      const advertisement = await Advertisement.findByPk(id);
      return advertisement;
    } catch (error) {
      console.error('查询广告失败:', error);
      throw new Error('查询广告失败');
    }
  }

  /**
   * 查询所有符合条件的广告
   * @param options 查询选项
   * @returns 广告数组
   */
  async findAll(options?: FindOptions): Promise<Advertisement[]> {
    try {
      const advertisements = await Advertisement.findAll(options);
      return advertisements;
    } catch (error) {
      console.error('查询广告列表失败:', error);
      throw new Error('查询广告列表失败');
    }
  }

  /**
   * 更新广告信息
   * @param id 广告ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  async update(id: number, data: Partial<any>): Promise<boolean> {
    try {
      const [affectedCount] = await Advertisement.update(data, {
        where: { id }
      });
      return affectedCount > 0;
    } catch (error) {
      console.error('更新广告失败:', error);
      throw new Error('更新广告失败');
    }
  }

  /**
   * 删除广告
   * @param id 广告ID
   * @returns 是否删除成功
   */
  async delete(id: number): Promise<boolean> {
    try {
      const affectedCount = await Advertisement.destroy({
        where: { id }
      });
      return affectedCount > 0;
    } catch (error) {
      console.error('删除广告失败:', error);
      throw new Error('删除广告失败');
    }
  }

  /**
   * 激活广告
   * @param id 广告ID
   * @returns 是否激活成功
   */
  async activate(id: number): Promise<boolean> {
    try {
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      const status = advertisement.get('status') as unknown as number;
      
      if (status === AdStatus.ACTIVE) {
        return true; // 已经是活跃状态，无需操作
      }
      
      const updated = await this.update(id, {
        status: AdStatus.ACTIVE,
      });
      
      return updated;
    } catch (error) {
      console.error('激活广告失败:', error);
      throw new Error('激活广告失败');
    }
  }

  /**
   * 暂停广告
   * @param id 广告ID
   * @returns 是否暂停成功
   */
  async pause(id: number): Promise<boolean> {
    try {
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      const status = advertisement.get('status') as unknown as number;
      
      if (status === AdStatus.PAUSED) {
        return true; // 已经是暂停状态，无需操作
      }
      
      if (status === AdStatus.COMPLETED || status === AdStatus.CANCELLED) {
        throw new Error('已结束或已取消的广告不能暂停');
      }
      
      const updated = await this.update(id, {
        status: AdStatus.PAUSED,
      });
      
      return updated;
    } catch (error) {
      console.error('暂停广告失败:', error);
      throw new Error('暂停广告失败');
    }
  }

  /**
   * 结束广告
   * @param id 广告ID
   * @returns 是否结束成功
   */
  async end(id: number): Promise<boolean> {
    try {
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      const status = advertisement.get('status') as unknown as number;
      
      if (status === AdStatus.COMPLETED || status === AdStatus.CANCELLED) {
        return true; // 已经是结束状态，无需操作
      }
      
      const updated = await this.update(id, {
        status: AdStatus.COMPLETED,
        endDate: new Date()
      });
      
      return updated;
    } catch (error) {
      console.error('结束广告失败:', error);
      throw new Error('结束广告失败');
    }
  }

  /**
   * 获取广告统计信息
   * @param kindergartenId 幼儿园ID
   * @returns 统计信息
   */
  async getStats(kindergartenId: number): Promise<AdvertisementStatistics> {
    try {
      // 获取总广告数
      const total = await Advertisement.count({
        where: { kindergartenId }
      });
      
      // 获取活跃广告数
      const active = await Advertisement.count({
        where: { 
          kindergartenId,
          status: AdStatus.ACTIVE,
          startDate: { [Op.lte]: new Date() },
          endDate: { [Op.gte]: new Date() }
        }
      });
      
      // 按广告类型分组统计
      const adsByType = await Advertisement.findAll({
        where: { kindergartenId },
        attributes: ['adType', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
        group: ['adType'],
        raw: true
      }) as unknown as Array<{adType: number, count: number}>;
      
      // 构建按类型分组的统计
      const byType: Record<string, number> = {};
      adsByType.forEach(ad => {
        const adType = getAdTypeText(ad.adType);
        byType[adType] = ad.count;
      });
      
      // 获取总展示次数
      const totalImpressions = await Advertisement.sum('impressions', {
        where: { kindergartenId }
      }) || 0;
      
      // 获取总点击次数
      const totalClicks = await Advertisement.sum('clicks', {
        where: { kindergartenId }
      }) || 0;
      
      // 计算总体点击率
      const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
      
      return {
        total,
        active,
        byType,
        impressions: totalImpressions,
        clicks: totalClicks,
        ctr
      };
    } catch (error) {
      console.error('获取广告统计信息失败:', error);
      throw new Error('获取广告统计信息失败');
    }
  }

  /**
   * 获取广告效果分析
   * @param id 广告ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 广告效果数据
   */
  async getPerformance(id: number, startDate: Date, endDate: Date): Promise<AdvertisementPerformance> {
    try {
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      // 获取时间范围内的转化数据
      const conversions = await ConversionTracking.count({
        where: {
          advertisementId: id,
          createdAt: {
            [Op.between]: [startDate, endDate]
          }
        }
      });
      
      // 获取广告基本统计
      const impressions = advertisement.get('impressions') as number;
      const clicks = advertisement.get('clicks') as number;
      const cost = advertisement.get('spent') as number || 0;
      
      // 计算各项指标
      const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
      const conversionRate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      const cpc = clicks > 0 ? cost / clicks : 0;
      const cpm = impressions > 0 ? (cost / impressions) * 1000 : 0; // 千次展示成本
      const cpa = conversions > 0 ? cost / conversions : 0;
      
      // 计算参与度(示例：假设点击和停留时间等因素计算得出)
      // 实际项目中可能需要更复杂的计算逻辑
      const engagementRate = clicks > 0 ? Math.min(90, ctr * 1.5) : 0;
      
      return {
        impressions,
        clicks,
        ctr,
        conversions,
        conversionRate,
        cost,
        cpc,
        cpm,
        cpa,
        engagementRate
      };
    } catch (error) {
      console.error('获取广告效果分析失败:', error);
      throw new Error('获取广告效果分析失败');
    }
  }

  /**
   * 记录广告展示
   * @param id 广告ID
   * @param userId 用户ID (可选)
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  async recordImpression(id: number, userId?: number, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      await advertisement.increment('impressions', { by: 1 });
      
      // TODO: 记录展示详情到展示日志表
      // 这里可以记录userId和metadata到一个单独的展示日志表中
      
      return true;
    } catch (error) {
      console.error('记录广告展示失败:', error);
      throw new Error('记录广告展示失败');
    }
  }

  /**
   * 记录广告点击
   * @param id 广告ID
   * @param userId 用户ID (可选)
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  async recordClick(id: number, userId?: number, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      await advertisement.increment('clicks', { by: 1 });
      
      // TODO: 记录点击详情到点击日志表
      // 这里可以记录userId和metadata到一个单独的点击日志表中
      
      return true;
    } catch (error) {
      console.error('记录广告点击失败:', error);
      throw new Error('记录广告点击失败');
    }
  }

  /**
   * 记录广告转化
   * @param id 广告ID
   * @param userId 用户ID
   * @param value 转化价值
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  async recordConversion(id: number, userId: number, value: number, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      // 直接更新记录，而不是使用不存在的incrementConversions方法
      await advertisement.increment('conversions', { by: 1 });
      
      // 创建转化记录
      await ConversionTracking.create({
        kindergartenId: advertisement.get('kindergartenId') as number,
        advertisementId: id,
        parentId: userId, // 使用parentId而不是userId
        conversionType: 4, // 默认类型：其他转化
        conversionSource: 'advertisement',
        conversionEvent: 'ad_conversion',
        eventValue: value,
        eventTime: new Date(),
        isFirstVisit: false, // 使用布尔值而非数值
        conversionStatus: 1, // 默认状态：有效转化
        followUpStatus: 0 // 默认状态：未跟进
      });
      
      return true;
    } catch (error) {
      console.error('记录广告转化失败:', error);
      throw new Error('记录广告转化失败');
    }
  }
  
  /**
   * 获取指定营销活动关联的广告
   * @param campaignId 营销活动ID
   * @returns 广告列表
   */
  async findByCampaignId(campaignId: number): Promise<Advertisement[]> {
    try {
      const advertisements = await Advertisement.findAll({
        where: { campaignId }
      });
      
      return advertisements;
    } catch (error) {
      console.error('获取活动关联广告失败:', error);
      throw new Error('获取活动关联广告失败');
    }
  }
  
  /**
   * 关联广告到营销活动
   * @param id 广告ID
   * @param campaignId 营销活动ID
   * @returns 是否关联成功
   */
  async linkToCampaign(id: number, campaignId: number): Promise<boolean> {
    try {
      // 验证广告是否存在
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      // 验证营销活动是否存在
      const campaign = await MarketingCampaign.findByPk(campaignId);
      if (!campaign) {
        throw new Error('营销活动不存在');
      }
      
      // 更新广告的campaignId
      const updated = await this.update(id, { campaignId });
      
      return updated;
    } catch (error) {
      console.error('关联广告到营销活动失败:', error);
      throw new Error('关联广告到营销活动失败');
    }
  }
  
  /**
   * 解除广告与营销活动的关联
   * @param id 广告ID
   * @returns 是否解除关联成功
   */
  async unlinkFromCampaign(id: number): Promise<boolean> {
    try {
      // 验证广告是否存在
      const advertisement = await this.findById(id);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      // 更新广告的campaignId为null
      const updated = await this.update(id, { campaignId: null });
      
      return updated;
    } catch (error) {
      console.error('解除广告与营销活动的关联失败:', error);
      throw new Error('解除广告与营销活动的关联失败');
    }
  }
  
  /**
   * 比较多个广告的效果
   * @param ids 广告ID数组
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 各广告效果数据
   */
  async compareAds(ids: number[], startDate: Date, endDate: Date): Promise<Record<number, AdvertisementPerformance>> {
    try {
      const results: Record<number, AdvertisementPerformance> = {};
      
      // 获取每个广告的效果数据
      for (const id of ids) {
        const performance = await this.getPerformance(id, startDate, endDate);
        results[id] = performance;
      }
      
      return results;
    } catch (error) {
      console.error('比较广告效果失败:', error);
      throw new Error('比较广告效果失败');
    }
  }
}

export default new AdvertisementService(); 