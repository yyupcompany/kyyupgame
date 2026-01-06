import { FindOptions } from 'sequelize';
import { Advertisement } from '../../../models/advertisement.model';

/**
 * 广告统计信息接口
 */
export interface AdvertisementStatistics {
  total: number;
  active: number;
  byType: Record<string, number>;
  impressions: number;
  clicks: number;
  ctr: number; // Click-Through Rate (点击率)
}

/**
 * 广告效果分析接口
 */
export interface AdvertisementPerformance {
  impressions: number;
  clicks: number;
  ctr: number; // Click-Through Rate
  conversions: number;
  conversionRate: number;
  cost: number;
  cpc: number; // Cost Per Click
  cpm: number; // Cost Per Mille (千次展示成本)
  cpa: number; // Cost Per Acquisition
  engagementRate: number;
}

/**
 * 广告投放服务接口
 * @description 定义广告投放管理的基础功能和业务逻辑
 */
export interface IAdvertisementService {
  /**
   * 创建广告
   * @param data 广告创建数据
   * @returns 创建的广告实例
   */
  create(data: any): Promise<Advertisement>;

  /**
   * 根据ID查找广告
   * @param id 广告ID
   * @returns 广告实例或null
   */
  findById(id: number): Promise<Advertisement | null>;

  /**
   * 查询所有符合条件的广告
   * @param options 查询选项
   * @returns 广告数组
   */
  findAll(options?: FindOptions): Promise<Advertisement[]>;

  /**
   * 更新广告信息
   * @param id 广告ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  update(id: number, data: Partial<any>): Promise<boolean>;

  /**
   * 删除广告
   * @param id 广告ID
   * @returns 是否删除成功
   */
  delete(id: number): Promise<boolean>;

  /**
   * 激活广告
   * @param id 广告ID
   * @returns 是否激活成功
   */
  activate(id: number): Promise<boolean>;

  /**
   * 暂停广告
   * @param id 广告ID
   * @returns 是否暂停成功
   */
  pause(id: number): Promise<boolean>;

  /**
   * 结束广告
   * @param id 广告ID
   * @returns 是否结束成功
   */
  end(id: number): Promise<boolean>;

  /**
   * 获取广告统计信息
   * @param kindergartenId 幼儿园ID
   * @returns 统计信息
   */
  getStats(kindergartenId: number): Promise<AdvertisementStatistics>;

  /**
   * 获取广告效果分析
   * @param id 广告ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 广告效果数据
   */
  getPerformance(id: number, startDate: Date, endDate: Date): Promise<AdvertisementPerformance>;

  /**
   * 记录广告展示
   * @param id 广告ID
   * @param userId 用户ID (可选)
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  recordImpression(id: number, userId?: number, metadata?: Record<string, any>): Promise<boolean>;

  /**
   * 记录广告点击
   * @param id 广告ID
   * @param userId 用户ID (可选)
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  recordClick(id: number, userId?: number, metadata?: Record<string, any>): Promise<boolean>;

  /**
   * 记录广告转化
   * @param id 广告ID
   * @param userId 用户ID
   * @param value 转化价值
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  recordConversion(id: number, userId: number, value: number, metadata?: Record<string, any>): Promise<boolean>;
  
  /**
   * 获取指定营销活动关联的广告
   * @param campaignId 营销活动ID
   * @returns 广告列表
   */
  findByCampaignId(campaignId: number): Promise<Advertisement[]>;
  
  /**
   * 关联广告到营销活动
   * @param id 广告ID
   * @param campaignId 营销活动ID
   * @returns 是否关联成功
   */
  linkToCampaign(id: number, campaignId: number): Promise<boolean>;
  
  /**
   * 解除广告与营销活动的关联
   * @param id 广告ID
   * @returns 是否解除关联成功
   */
  unlinkFromCampaign(id: number): Promise<boolean>;
  
  /**
   * 比较多个广告的效果
   * @param ids 广告ID数组
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 各广告效果数据
   */
  compareAds(ids: number[], startDate: Date, endDate: Date): Promise<Record<number, AdvertisementPerformance>>;
} 