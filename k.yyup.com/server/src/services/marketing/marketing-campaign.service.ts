import { NotificationType } from '../../models/notification.model';
import { FindOptions, Op } from 'sequelize';
import { MarketingCampaign, CampaignStatus, CampaignType } from '../../models/marketing-campaign.model';
import { Advertisement } from '../../models/advertisement.model';
import { ConversionTracking } from '../../models/conversion-tracking.model';
import { 
  IMarketingCampaignService, 
  MarketingCampaignStatistics,
  CampaignPerformance
} from './interfaces/marketing-campaign-service.interface';

/**
 * 营销活动服务实现
 * @description 实现营销活动管理相关的业务逻辑
 */
export class MarketingCampaignService implements IMarketingCampaignService {
  /**
   * 创建营销活动
   * @param data 营销活动创建数据
   * @returns 创建的营销活动实例
   */
  async create(data: any): Promise<MarketingCampaign> {
    try {
      const campaign = await MarketingCampaign.create(data);
      return campaign;
    } catch (error) {
      console.error('创建营销活动失败:', error);
      throw new Error('创建营销活动失败');
    }
  }

  /**
   * 根据ID查找营销活动
   * @param id 营销活动ID
   * @returns 营销活动实例或null
   */
  async findById(id: number): Promise<MarketingCampaign | null> {
    try {
      const campaign = await MarketingCampaign.findByPk(id);
      return campaign;
    } catch (error) {
      console.error('查询营销活动失败:', error);
      throw new Error('查询营销活动失败');
    }
  }

  /**
   * 查询所有符合条件的营销活动
   * @param options 查询选项
   * @returns 营销活动数组
   */
  async findAll(options?: FindOptions): Promise<MarketingCampaign[]> {
    try {
      const campaigns = await MarketingCampaign.findAll(options);
      return campaigns;
    } catch (error) {
      console.error('查询营销活动列表失败:', error);
      throw new Error('查询营销活动列表失败');
    }
  }

  /**
   * 更新营销活动信息
   * @param id 营销活动ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  async update(id: number, data: Partial<any>): Promise<boolean> {
    try {
      const [affectedCount] = await MarketingCampaign.update(data, {
        where: { id }
      });
      return affectedCount > 0;
    } catch (error) {
      console.error('更新营销活动失败:', error);
      throw new Error('更新营销活动失败');
    }
  }

  /**
   * 删除营销活动
   * @param id 营销活动ID
   * @returns 是否删除成功
   */
  async delete(id: number): Promise<boolean> {
    try {
      const affectedCount = await MarketingCampaign.destroy({
        where: { id }
      });
      return affectedCount > 0;
    } catch (error) {
      console.error('删除营销活动失败:', error);
      throw new Error('删除营销活动失败');
    }
  }

  /**
   * 启动营销活动
   * @param id 营销活动ID
   * @returns 是否启动成功
   */
  async launch(id: number): Promise<boolean> {
    try {
      const campaign = await this.findById(id);
      if (!campaign) {
        throw new Error('营销活动不存在');
      }
      
      const status = campaign.get('status') as unknown as number;
      
      if (status === CampaignStatus.ONGOING) {
        return true; // 已经是活跃状态，无需操作
      }
      
      const now = new Date();
      const updated = await this.update(id, {
        status: CampaignStatus.ONGOING,
        startDate: campaign.get('startDate') || now,
        launchedAt: now
      });
      
      return updated;
    } catch (error) {
      console.error('启动营销活动失败:', error);
      throw new Error('启动营销活动失败');
    }
  }

  /**
   * 暂停营销活动
   * @param id 营销活动ID
   * @returns 是否暂停成功
   */
  async pause(id: number): Promise<boolean> {
    try {
      const campaign = await this.findById(id);
      if (!campaign) {
        throw new Error('营销活动不存在');
      }
      
      const status = campaign.get('status') as unknown as number;
      
      if (status === CampaignStatus.PAUSED) {
        return true; // 已经是暂停状态，无需操作
      }
      
      if (status === CampaignStatus.ENDED || status === CampaignStatus.CANCELLED) {
        throw new Error('已结束或已取消的营销活动不能暂停');
      }
      
      const updated = await this.update(id, {
        status: CampaignStatus.PAUSED,
        pausedAt: new Date()
      });
      
      return updated;
    } catch (error) {
      console.error('暂停营销活动失败:', error);
      throw new Error('暂停营销活动失败');
    }
  }

  /**
   * 结束营销活动
   * @param id 营销活动ID
   * @returns 是否结束成功
   */
  async end(id: number): Promise<boolean> {
    try {
      const campaign = await this.findById(id);
      if (!campaign) {
        throw new Error('营销活动不存在');
      }
      
      const status = campaign.get('status') as unknown as number;
      
      if (status === CampaignStatus.ENDED || status === CampaignStatus.CANCELLED) {
        return true; // 已经是结束状态，无需操作
      }
      
      const updated = await this.update(id, {
        status: CampaignStatus.ENDED,
        endDate: campaign.get('endDate') || new Date(),
        completedAt: new Date()
      });
      
      return updated;
    } catch (error) {
      console.error('结束营销活动失败:', error);
      throw new Error('结束营销活动失败');
    }
  }

  /**
   * 获取营销活动统计信息
   * @param kindergartenId 幼儿园ID
   * @returns 统计信息
   */
  async getStats(kindergartenId: number): Promise<MarketingCampaignStatistics> {
    try {
      const now = new Date();
      
      // 总数
      const total = await MarketingCampaign.count({
        where: { kindergartenId }
      });
      
      // 活跃数量
      const activeCount = await MarketingCampaign.count({
        where: { 
          kindergartenId,
          status: CampaignStatus.ONGOING,
          startDate: { [Op.lte]: now },
          endDate: { [Op.gt]: now }
        }
      });
      
      // 已完成的
      const completedCount = await MarketingCampaign.count({
        where: { 
          kindergartenId,
          status: [CampaignStatus.ENDED, CampaignStatus.CANCELLED]
        }
      });
      
      // 即将开始的
      const upcomingCount = await MarketingCampaign.count({
        where: { 
          kindergartenId,
          status: [CampaignStatus.DRAFT, CampaignStatus.ONGOING],
          startDate: { [Op.gt]: now }
        }
      });
      
      // 状态分布
      const statusDistribution: Record<string, number> = {
        "活跃": activeCount,
        "已完成": completedCount,
        "即将开始": upcomingCount,
        "草稿": await MarketingCampaign.count({
          where: {
            kindergartenId,
            status: CampaignStatus.DRAFT
          }
        })
      };
      
      // 类型分布 (假设有campaignType字段)
      const typeDistribution: Record<string, number> = {
        "线上": 0,
        "线下": 0,
        "混合": 0
      };
      
      // 暂时返回空的topParticipants和topConversions
      const topParticipants: Array<{
        id: number;
        title: string;
        participantCount: number;
      }> = [];
      
      const topConversions: Array<{
        id: number;
        title: string;
        participantCount: number;
        conversionCount: number;
        conversionRate: number;
      }> = [];
      
      // 月度统计数据
      const monthlyStats: Array<{
        month: string;
        campaignCount: number;
        totalParticipants: number;
        totalConversions: number;
      }> = [];
      
      return {
        total,
        statusDistribution,
        typeDistribution,
        topParticipants,
        topConversions,
        monthlyStats
      };
    } catch (error) {
      console.error('获取营销活动统计失败:', error);
      throw new Error('获取营销活动统计失败');
    }
  }

  /**
   * 获取营销活动成效
   * @param id 营销活动ID
   * @returns 营销活动成效数据
   */
  async getPerformance(id: number): Promise<CampaignPerformance> {
    try {
      const campaign = await this.findById(id);
      if (!campaign) {
        throw new Error('营销活动不存在');
      }
      
      // 这里仅返回示例数据，实际项目中应当从数据库聚合查询
      return {
        campaignInfo: {
          id: campaign.get('id') as number,
          title: campaign.get('title') as string,
          campaignType: campaign.get('type') as number || 0,
          campaignTypeText: this.getCampaignTypeText(campaign.get('type') as number || 0),
          startDate: campaign.get('startDate') as Date,
          endDate: campaign.get('endDate') as Date,
          status: campaign.get('status') as number,
          statusText: this.getStatusText(campaign.get('status') as number),
          duration: this.calculateDuration(
            campaign.get('startDate') as Date, 
            campaign.get('endDate') as Date
          )
        },
        metrics: {
          views: 0,
          participants: 0,
          conversions: 0,
          conversionRate: 0,
          revenue: 0,
          costPerConversion: 0,
          roi: 0
        },
        dailyTrends: [],
        adPerformance: [],
        channelPerformance: []
      };
    } catch (error) {
      console.error('获取营销活动成效失败:', error);
      throw new Error('获取营销活动成效失败');
    }
  }

  /**
   * 获取活动类型文本
   * @param type 活动类型编号
   * @returns 活动类型文本
   */
  private getCampaignTypeText(type: number): string {
    const typeMap: Record<number, string> = {
      0: '未知',
      1: '线上活动',
      2: '线下活动',
      3: '混合活动'
    };
    return typeMap[type] || '未知';
  }
  
  /**
   * 获取状态文本
   * @param status 状态编号
   * @returns 状态文本
   */
  private getStatusText(status: number): string {
    const statusMap: Record<number, string> = {
      0: '草稿',
      1: '活跃',
      2: '已暂停',
      3: '已完成',
      4: '已取消'
    };
    return statusMap[status] || '未知状态';
  }
  
  /**
   * 计算活动持续时间（天数）
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 持续天数
   */
  private calculateDuration(startDate: Date, endDate: Date): number {
    if (!startDate || !endDate) return 0;
    const diffTime = endDate.getTime() - startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * 关联营销活动与广告
   * @param campaignId 营销活动ID
   * @param advertisementId 广告ID
   * @returns 是否关联成功
   */
  async linkAdvertisement(campaignId: number, advertisementId: number): Promise<boolean> {
    try {
      // TODO: 实现营销活动与广告的关联
      // 1. 验证营销活动是否存在
      // 2. 验证广告是否存在
      // 3. 更新广告的campaignId
      
      const campaign = await this.findById(campaignId);
      if (!campaign) {
        throw new Error('营销活动不存在');
      }
      
      const advertisement = await Advertisement.findByPk(advertisementId);
      if (!advertisement) {
        throw new Error('广告不存在');
      }
      
      // 更新广告的campaignId
      await advertisement.update({ campaignId });
      
      return true;
    } catch (error) {
      console.error('关联营销活动与广告失败:', error);
      throw new Error('关联营销活动与广告失败');
    }
  }

  /**
   * 获取营销活动关联的所有广告
   * @param campaignId 营销活动ID
   * @returns 广告列表
   */
  async getLinkedAdvertisements(campaignId: number): Promise<any[]> {
    try {
      const advertisements = await Advertisement.findAll({
        where: { campaignId }
      });
      
      return advertisements;
    } catch (error) {
      console.error('获取营销活动关联广告失败:', error);
      throw new Error('获取营销活动关联广告失败');
    }
  }
}

export default new MarketingCampaignService(); 