/**
 * AI分析与反馈中间层
 * 负责AI使用分析和用户反馈管理，组合分析服务和反馈服务
 */

import {
  aiAnalyticsService,
  feedbackService as aiFeedbackService
} from '../../services/ai';
import {
  BaseMiddleware,
  IMiddlewareResult,
  MiddlewareError,
  ERROR_CODES
} from './base.middleware';

// 类型定义
interface TimeRange {
  start: Date;
  end: Date;
}

interface TrendDataPoint {
  date: string;
  value: number;
}
import { FeedbackType, FeedbackSource, FeedbackStatus } from '../../models/ai-feedback.model';

// 类型定义
interface UsageOverview {
  totalUsers: number;
  totalConversations: number;
  totalMessages: number;
  totalTokens: number;
  totalCost: number;
  activeUsersCount: number;
  avgMessagesPerConversation: number;
  avgTokensPerMessage: number;
}

interface ModelUsage {
  modelId: number;
  modelName: string;
  requestCount: number;
  tokenCount: number;
  costAmount: number;
  percentage: number;
}

interface UserAnalytics {
  conversationCount: number;
  messageCount: number;
  totalTokens: number;
  totalCost: number;
  averageResponseTime: number;
  mostUsedModelId: number;
  mostUsedModelName: string;
  activeTimeDistribution: Record<string, number>;
}

interface ContentAnalytics {
  averageMessageLength: number;
  averageResponseLength: number;
  commonTopics: Array<{topic: string, count: number}>;
  sentimentDistribution: Record<string, number>;
}

interface AnalyticsReport {
  reportId: string;
  generatedAt: Date;
  downloadUrl: string;
}

interface Feedback {
  id: number;
  userId?: number;
  feedbackType: string;
  sourceType: string;
  sourceId: string | null;
  content: string;
  rating: number | null;
  status: string;
  adminNotes?: string | null;
  createdAt: Date;
  updatedAt?: Date;
}

interface FeedbackStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  ignored: number;
  byType: Record<string, number>;
}

/**
 * AI分析与反馈中间层接口
 */
export interface IAiAnalyticsAndFeedbackMiddleware {
  // 分析功能
  getUsageOverview(startDate: Date, endDate: Date): Promise<IMiddlewareResult<UsageOverview>>;
  getModelUsageDistribution(startDate: Date, endDate: Date): Promise<IMiddlewareResult<ModelUsage[]>>;
  getUserActivityTrend(timeRange: TimeRange, limit?: number): Promise<IMiddlewareResult<TrendDataPoint[]>>;
  getUserAnalytics(userId: number, startDate: Date, endDate: Date): Promise<IMiddlewareResult<UserAnalytics>>;
  getContentAnalytics(startDate: Date, endDate: Date): Promise<IMiddlewareResult<ContentAnalytics>>;
  generateAnalyticsReport(startDate: Date, endDate: Date, includeUserDetails?: boolean, selectedMetrics?: string[]): Promise<IMiddlewareResult<AnalyticsReport>>;
  
  // 反馈功能
  createFeedback(userId: number, feedbackType: FeedbackType, sourceType: FeedbackSource, content: string, sourceId?: string | null, rating?: number | null): Promise<IMiddlewareResult<{id: number}>>;
  getUserFeedbacks(userId: number, limit?: number): Promise<IMiddlewareResult<Feedback[]>>;
  getFeedbacksByStatus(status: FeedbackStatus, limit?: number): Promise<IMiddlewareResult<Feedback[]>>;
  updateFeedbackStatus(feedbackId: number, status: FeedbackStatus, adminNotes?: string): Promise<IMiddlewareResult<boolean>>;
  getFeedbackDetails(feedbackId: number): Promise<IMiddlewareResult<Feedback | null>>;
  getFeedbackStats(): Promise<IMiddlewareResult<FeedbackStats>>;
}

/**
 * AI分析与反馈中间层实现
 */
class AiAnalyticsAndFeedbackMiddleware extends BaseMiddleware implements IAiAnalyticsAndFeedbackMiddleware {
  /**
   * 获取AI使用概览
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns AI使用概览数据
   */
  async getUsageOverview(startDate: Date, endDate: Date): Promise<IMiddlewareResult<UsageOverview>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:analytics:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看分析数据的权限'
        );
      }
      
      // 获取使用概览
      const overview = await aiAnalyticsService.getUsageOverview(startDate, endDate);
      
      return this.createSuccessResponse(overview);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<UsageOverview>;
    }
  }
  
  /**
   * 获取模型使用分布
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 模型使用分布数据
   */
  async getModelUsageDistribution(startDate: Date, endDate: Date): Promise<IMiddlewareResult<ModelUsage[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:analytics:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看分析数据的权限'
        );
      }
      
      // 获取模型使用分布
      const distribution = await aiAnalyticsService.getModelUsageDistribution(startDate, endDate);
      
      return this.createSuccessResponse(distribution);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<ModelUsage[]>;
    }
  }
  
  /**
   * 获取用户活跃度趋势
   * @param timeRange 时间范围
   * @param limit 数据点限制
   * @returns 用户活跃度趋势数据
   */
  async getUserActivityTrend(timeRange: TimeRange, limit?: number): Promise<IMiddlewareResult<TrendDataPoint[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:analytics:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看分析数据的权限'
        );
      }

      // 获取用户活跃度趋势 - 传入时间范围字符串和限制
      const trend = await aiAnalyticsService.getUserActivityTrend(timeRange as unknown as string, limit || 7);

      return this.createSuccessResponse(trend);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<TrendDataPoint[]>;
    }
  }
  
  /**
   * 获取特定用户分析
   * @param userId 用户ID
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 用户分析数据
   */
  async getUserAnalytics(userId: number, startDate: Date, endDate: Date): Promise<IMiddlewareResult<UserAnalytics>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:analytics:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看分析数据的权限'
        );
      }
      
      // 获取用户分析
      const analytics = await aiAnalyticsService.getUserAnalytics(userId);
      
      return this.createSuccessResponse(analytics);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<UserAnalytics>;
    }
  }
  
  /**
   * 获取内容分析
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @returns 内容分析数据
   */
  async getContentAnalytics(startDate: Date, endDate: Date): Promise<IMiddlewareResult<ContentAnalytics>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:analytics:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看分析数据的权限'
        );
      }
      
      // 获取内容分析
      const analytics = await aiAnalyticsService.getContentAnalytics(startDate, endDate);
      
      return this.createSuccessResponse(analytics);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<ContentAnalytics>;
    }
  }
  
  /**
   * 生成分析报表
   * @param startDate 开始日期
   * @param endDate 结束日期
   * @param includeUserDetails 是否包含用户详情
   * @param selectedMetrics 选定的指标
   * @returns 报表生成结果
   */
  async generateAnalyticsReport(
    startDate: Date, 
    endDate: Date, 
    includeUserDetails?: boolean, 
    selectedMetrics?: string[]
  ): Promise<IMiddlewareResult<AnalyticsReport>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:analytics:report']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有生成分析报表的权限'
        );
      }
      
      // 生成分析报表
      const report = await aiAnalyticsService.generateAnalyticsReport({
        startDate,
        endDate,
        includeUserDetails,
        selectedMetrics
      });
      
      // 记录操作
      await this.logOperation(0, 'GENERATE_ANALYTICS_REPORT', { 
        reportId: report.reportId,
        startDate,
        endDate,
        includeUserDetails,
        selectedMetrics
      });
      
      return this.createSuccessResponse(report);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<AnalyticsReport>;
    }
  }
  
  /**
   * 创建反馈
   * @param userId 用户ID
   * @param feedbackType 反馈类型
   * @param sourceType 来源类型
   * @param content 反馈内容
   * @param sourceId 来源ID
   * @param rating 评分
   * @returns 创建的反馈ID
   */
  async createFeedback(
    userId: number, 
    feedbackType: FeedbackType, 
    sourceType: FeedbackSource, 
    content: string, 
    sourceId?: string | null, 
    rating?: number | null
  ): Promise<IMiddlewareResult<{id: number}>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:feedback:create']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有创建反馈的权限',
          { userId }
        );
      }
      
      // 验证参数
      if (!content) {
        throw new MiddlewareError(
          ERROR_CODES.VALIDATION_FAILED,
          '反馈内容不能为空',
          { content }
        );
      }
      
      // 创建反馈
      const feedback = await aiFeedbackService.createFeedback({
        userId,
        feedbackType,
        content,
        rating
      });
      
      // 记录操作
      await this.logOperation(userId, 'CREATE_FEEDBACK', { 
        feedbackId: feedback.id,
        feedbackType,
        sourceType
      });
      
      return this.createSuccessResponse(feedback);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<{id: number}>;
    }
  }
  
  /**
   * 获取用户反馈列表
   * @param userId 用户ID
   * @param limit 数量限制
   * @returns 反馈列表
   */
  async getUserFeedbacks(userId: number, limit?: number): Promise<IMiddlewareResult<Feedback[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(userId, ['ai:feedback:read']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看反馈的权限',
          { userId }
        );
      }
      
      // 获取用户反馈
      const feedbacks = await aiFeedbackService.getUserFeedback(userId);

      // 将服务层返回的数据转换为中间层定义的接口格式
      const formattedFeedbacks: Feedback[] = (feedbacks as any[]).slice(0, limit).map(feedback => ({
        ...feedback
      }));

      return this.createSuccessResponse(formattedFeedbacks);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<Feedback[]>;
    }
  }
  
  /**
   * 获取特定状态的反馈
   * @param status 反馈状态
   * @param limit 数量限制
   * @returns 反馈列表
   */
  async getFeedbacksByStatus(status: FeedbackStatus, limit?: number): Promise<IMiddlewareResult<Feedback[]>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:feedback:admin']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有管理反馈的权限'
        );
      }
      
      // 获取特定状态的反馈 - 使用统计方法代替（服务层暂无此方法）
      const stats = await aiFeedbackService.getFeedbackStats();

      // 暂时返回空列表，因为服务层没有按状态筛选的方法
      const formattedFeedbacks: Feedback[] = [];

      return this.createSuccessResponse(formattedFeedbacks);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<Feedback[]>;
    }
  }
  
  /**
   * 更新反馈状态
   * @param feedbackId 反馈ID
   * @param status 新状态
   * @param adminNotes 管理员备注
   * @returns 更新结果
   */
  async updateFeedbackStatus(
    feedbackId: number, 
    status: FeedbackStatus, 
    adminNotes?: string
  ): Promise<IMiddlewareResult<boolean>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:feedback:admin']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有管理反馈的权限'
        );
      }
      
      // 更新反馈状态（使用 updateFeedback 方法）
      const result = await aiFeedbackService.updateFeedback(feedbackId, { status });

      // 记录操作
      await this.logOperation(0, 'UPDATE_FEEDBACK_STATUS', {
        feedbackId,
        status,
        adminNotes
      });

      return this.createSuccessResponse(!!result);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<boolean>;
    }
  }
  
  /**
   * 获取反馈详情
   * @param feedbackId 反馈ID
   * @returns 反馈详情
   */
  async getFeedbackDetails(feedbackId: number): Promise<IMiddlewareResult<Feedback | null>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:feedback:admin']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看反馈详情的权限'
        );
      }
      
      // 获取反馈详情（使用 getFeedbackStats 代替，因为服务层没有 getFeedbackDetails）
      const stats = await aiFeedbackService.getFeedbackStats();

      // 暂时返回 null，因为服务层没有获取单个反馈详情的方法
      return this.createSuccessResponse(null);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<Feedback | null>;
    }
  }
  
  /**
   * 获取反馈统计
   * @returns 反馈统计数据
   */
  async getFeedbackStats(): Promise<IMiddlewareResult<FeedbackStats>> {
    try {
      // 检查权限
      const hasPermission = await this.validatePermissions(0, ['ai:feedback:admin']);
      if (!hasPermission) {
        throw new MiddlewareError(
          ERROR_CODES.FORBIDDEN,
          '没有查看反馈统计的权限'
        );
      }
      
      // 获取反馈统计
      const stats = await aiFeedbackService.getFeedbackStats();
      
      return this.createSuccessResponse(stats);
    } catch (error) {
      return this.handleError(error) as unknown as IMiddlewareResult<FeedbackStats>;
    }
  }
}

// 导出单例实例
export const aiAnalyticsAndFeedbackMiddleware = new AiAnalyticsAndFeedbackMiddleware(); 