import { FindOptions } from 'sequelize';
import { ConversionTracking } from '../../../models/conversion-tracking.model';

/**
 * 转化统计信息接口
 */
export interface ConversionStatistics {
  total: number;
  byType: Record<string, number>;
  bySource: Record<string, number>;
  conversionRate: number;
  averageValue: number;
}

/**
 * 转化跟进状态摘要接口
 */
export interface FollowUpSummary {
  notFollowed: number;
  contacted: number;
  revisited: number;
  needContact: number;
  confirmedIntent: number;
  noIntent: number;
  converted: number;
  abandoned: number;
}

/**
 * 转化分析结果接口
 */
export interface ConversionAnalysis {
  conversionByDay: Record<string, number>;
  conversionByHour: Record<string, number>;
  conversionByDevice: Record<string, number>;
  valueDistribution: Record<string, number>;
  topSources: Array<{source: string, count: number}>;
  topCampaigns: Array<{campaign: string, count: number}>;
}

/**
 * 转化跟踪服务接口
 * @description 定义转化跟踪管理的基础功能和业务逻辑
 */
export interface IConversionTrackingService {
  /**
   * 创建转化跟踪记录
   * @param data 转化跟踪创建数据
   * @returns 创建的转化跟踪实例
   */
  create(data: any): Promise<ConversionTracking>;

  /**
   * 根据ID查找转化跟踪记录
   * @param id 转化跟踪ID
   * @returns 转化跟踪实例或null
   */
  findById(id: number): Promise<ConversionTracking | null>;

  /**
   * 查询所有符合条件的转化跟踪记录
   * @param options 查询选项
   * @returns 转化跟踪数组
   */
  findAll(options?: FindOptions): Promise<ConversionTracking[]>;

  /**
   * 更新转化跟踪信息
   * @param id 转化跟踪ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  update(id: number, data: Partial<any>): Promise<boolean>;

  /**
   * 删除转化跟踪记录
   * @param id 转化跟踪ID
   * @returns 是否删除成功
   */
  delete(id: number): Promise<boolean>;

  /**
   * 获取转化统计信息
   * @param kindergartenId 幼儿园ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 统计信息
   */
  getStats(kindergartenId: number, startDate: Date, endDate: Date): Promise<ConversionStatistics>;

  /**
   * 获取转化跟进状态摘要
   * @param kindergartenId 幼儿园ID
   * @returns 跟进状态摘要
   */
  getFollowUpSummary(kindergartenId: number): Promise<FollowUpSummary>;

  /**
   * 记录转化事件
   * @param data 转化数据
   * @returns 创建的转化跟踪实例
   */
  recordConversion(data: any): Promise<ConversionTracking>;

  /**
   * 更新转化跟进状态
   * @param id 转化跟踪ID
   * @param status 跟进状态
   * @param userId 跟进人ID
   * @param remark 备注信息
   * @returns 是否更新成功
   */
  updateFollowUpStatus(id: number, status: number, userId: number, remark?: string): Promise<boolean>;

  /**
   * 获取指定营销活动的转化记录
   * @param campaignId 营销活动ID
   * @returns 转化跟踪数组
   */
  findByCampaignId(campaignId: number): Promise<ConversionTracking[]>;

  /**
   * 获取指定渠道的转化记录
   * @param channelId 渠道ID
   * @returns 转化跟踪数组
   */
  findByChannelId(channelId: number): Promise<ConversionTracking[]>;

  /**
   * 获取指定广告的转化记录
   * @param advertisementId 广告ID
   * @returns 转化跟踪数组
   */
  findByAdvertisementId(advertisementId: number): Promise<ConversionTracking[]>;

  /**
   * 获取指定家长的转化记录
   * @param parentId 家长ID
   * @returns 转化跟踪数组
   */
  findByParentId(parentId: number): Promise<ConversionTracking[]>;

  /**
   * 获取转化分析
   * @param kindergartenId 幼儿园ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 转化分析结果
   */
  getAnalysis(kindergartenId: number, startDate: Date, endDate: Date): Promise<ConversionAnalysis>;

  /**
   * 导出转化数据
   * @param kindergartenId 幼儿园ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 导出的数据数组
   */
  exportData(kindergartenId: number, startDate: Date, endDate: Date): Promise<any[]>;

  /**
   * 计算转化归因
   * @param parentId 家长ID
   * @returns 归因结果
   */
  calculateAttribution(parentId: number): Promise<Record<string, number>>;
} 