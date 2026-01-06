import { FindOptions } from 'sequelize';
import { ChannelTracking } from '../../../models/channel-tracking.model';

/**
 * 渠道统计信息接口
 */
export interface ChannelStatistics {
  total: number;
  active: number;
  bySource: Record<string, number>;
  topChannels: Array<{name: string, count: number}>;
  conversionRate: number;
}

/**
 * 渠道性能接口
 */
export interface ChannelPerformance {
  views: number;
  clicks: number;
  leads: number;
  conversions: number;
  conversionRate: number;
  cost: number;
  cpl: number; // Cost Per Lead
  cpa: number; // Cost Per Acquisition
  roi: number;
}

/**
 * 归因分析结果接口
 */
export interface AttributionAnalysis {
  firstTouch: Record<string, number>;
  lastTouch: Record<string, number>;
  linearAttribution: Record<string, number>;
  timeDecay: Record<string, number>;
}

/**
 * 渠道跟踪服务接口
 * @description 定义渠道跟踪管理的基础功能和业务逻辑
 */
export interface IChannelTrackingService {
  /**
   * 创建渠道跟踪记录
   * @param data 渠道跟踪创建数据
   * @returns 创建的渠道跟踪实例
   */
  create(data: any): Promise<ChannelTracking>;

  /**
   * 根据ID查找渠道跟踪记录
   * @param id 渠道跟踪ID
   * @returns 渠道跟踪实例或null
   */
  findById(id: number): Promise<ChannelTracking | null>;

  /**
   * 查询所有符合条件的渠道跟踪记录
   * @param options 查询选项
   * @returns 渠道跟踪数组
   */
  findAll(options?: FindOptions): Promise<ChannelTracking[]>;

  /**
   * 更新渠道跟踪信息
   * @param id 渠道跟踪ID
   * @param data 更新数据
   * @returns 是否更新成功
   */
  update(id: number, data: Partial<any>): Promise<boolean>;

  /**
   * 删除渠道跟踪记录
   * @param id 渠道跟踪ID
   * @returns 是否删除成功
   */
  delete(id: number): Promise<boolean>;

  /**
   * 获取渠道统计信息
   * @param kindergartenId 幼儿园ID
   * @returns 统计信息
   */
  getStats(kindergartenId: number): Promise<ChannelStatistics>;

  /**
   * 获取渠道性能数据
   * @param channelId 渠道ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 渠道性能数据
   */
  getPerformance(channelId: number, startDate: Date, endDate: Date): Promise<ChannelPerformance>;

  /**
   * 记录渠道点击
   * @param channelId 渠道ID
   * @param userId 用户ID (可选)
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  recordClick(channelId: number, userId?: number, metadata?: Record<string, any>): Promise<boolean>;

  /**
   * 记录渠道产生的线索
   * @param channelId 渠道ID
   * @param userId 用户ID
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  recordLead(channelId: number, userId: number, metadata?: Record<string, any>): Promise<boolean>;

  /**
   * 记录渠道转化
   * @param channelId 渠道ID
   * @param userId 用户ID
   * @param value 转化价值
   * @param metadata 元数据 (可选)
   * @returns 是否记录成功
   */
  recordConversion(channelId: number, userId: number, value: number, metadata?: Record<string, any>): Promise<boolean>;

  /**
   * 生成UTM跟踪链接
   * @param baseUrl 基础URL
   * @param channel 渠道信息
   * @returns 跟踪链接
   */
  generateTrackingUrl(baseUrl: string, channel: {source: string, medium: string, campaign: string, term?: string, content?: string}): string;

  /**
   * 获取渠道归因分析
   * @param kindergartenId 幼儿园ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 归因分析结果
   */
  getAttributionAnalysis(kindergartenId: number, startDate: Date, endDate: Date): Promise<AttributionAnalysis>;

  /**
   * 比较多个渠道的性能
   * @param channelIds 渠道ID数组
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 各渠道性能数据
   */
  compareChannels(channelIds: number[], startDate: Date, endDate: Date): Promise<Record<number, ChannelPerformance>>;
} 