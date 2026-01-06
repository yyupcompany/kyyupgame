import { FindOptions } from 'sequelize';
import { MarketingCampaign } from '../../../models/marketing-campaign.model';

/**
 * 营销活动统计信息接口
 */
export interface MarketingCampaignStatistics {
  total: number;
  statusDistribution: Record<string, number>;
  typeDistribution: Record<string, number>;
  topParticipants: Array<{
    id: number;
    title: string;
    participantCount: number;
  }>;
  topConversions: Array<{
    id: number;
    title: string;
    participantCount: number;
    conversionCount: number;
    conversionRate: number;
  }>;
  monthlyStats: Array<{
    month: string;
    campaignCount: number;
    totalParticipants: number;
    totalConversions: number;
  }>;
}

/**
 * 营销活动成效接口
 */
export interface CampaignPerformance {
  campaignInfo: {
    id: number;
    title: string;
    campaignType: number;
    campaignTypeText: string;
    startDate: Date;
    endDate: Date;
    status: number;
    statusText: string;
    duration: number;
  };
  metrics: {
    views: number;
    participants: number;
    conversions: number;
    conversionRate: number;
    revenue: number;
    costPerConversion: number;
    roi: number;
  };
  dailyTrends: Array<{
    date: string;
    viewCount: number;
    clickCount: number;
  }>;
  adPerformance: Array<{
    id: number;
    title: string;
    viewCount: number;
    clickCount: number;
    ctr: number;
  }>;
  channelPerformance: Array<{
    sourceChannel: string;
    viewCount: number;
    clickCount: number;
    conversionCount: number;
    ctr: number;
    cvr: number;
  }>;
}

/**
 * 营销活动服务接口
 * @description 定义营销活动管理的基础功能和业务逻辑
 */
export interface IMarketingCampaignService {
  /**
   * 创建营销活动
   * @param data 营销活动创建数据
   * @returns 创建的营销活动实例
   */
  create(data: any): Promise<MarketingCampaign>;

  /**
   * 根据ID查找营销活动
   * @param id 营销活动ID
   * @returns 营销活动实例或null
   */
  findById(id: number): Promise<MarketingCampaign | null>;

  /**
   * 查询所有符合条件的营销活动
   * @param options 查询选项
   * @returns 营销活动数组
   */
  findAll(options?: FindOptions): Promise<MarketingCampaign[]>;

  /**
   * 更新营销活动信息
   * @param id 营销活动ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  update(id: number, data: Partial<any>): Promise<boolean>;

  /**
   * 删除营销活动
   * @param id 营销活动ID
   * @returns 是否删除成功
   */
  delete(id: number): Promise<boolean>;

  /**
   * 启动营销活动
   * @param id 营销活动ID
   * @returns 是否启动成功
   */
  launch(id: number): Promise<boolean>;

  /**
   * 暂停营销活动
   * @param id 营销活动ID
   * @returns 是否暂停成功
   */
  pause(id: number): Promise<boolean>;

  /**
   * 结束营销活动
   * @param id 营销活动ID
   * @returns 是否结束成功
   */
  end(id: number): Promise<boolean>;

  /**
   * 获取营销活动统计信息
   * @param kindergartenId 幼儿园ID
   * @returns 统计信息
   */
  getStats(kindergartenId: number): Promise<MarketingCampaignStatistics>;

  /**
   * 获取营销活动成效
   * @param id 营销活动ID
   * @returns 营销活动成效数据
   */
  getPerformance(id: number): Promise<CampaignPerformance>;

  /**
   * 关联营销活动与广告
   * @param campaignId 营销活动ID
   * @param advertisementId 广告ID
   * @returns 是否关联成功
   */
  linkAdvertisement(campaignId: number, advertisementId: number): Promise<boolean>;

  /**
   * 获取营销活动关联的所有广告
   * @param campaignId 营销活动ID
   * @returns 广告列表
   */
  getLinkedAdvertisements(campaignId: number): Promise<any[]>;
} 