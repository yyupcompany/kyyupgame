import { Request, Response, NextFunction } from 'express';
import analyticsService from '../../services/ai/ai-analytics.service';
import { ApiError } from '../../utils/apiError';

/**
 * AI数据分析控制器
 * 负责处理AI分析相关的HTTP请求
 */
export class AnalyticsController {
  private analyticsService = analyticsService;

  /**
   * @description 获取AI使用概览
   * @route GET /api/v1/ai/analytics/overview
   */
  public getUsageOverview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          code: 400,
          message: '请提供开始和结束日期',
          data: null
        });
        return;
      }

      // 验证日期格式
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          code: 400,
          message: '无效的日期格式',
          data: null
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          code: 400,
          message: '开始日期必须早于结束日期',
          data: null
        });
        return;
      }

      const overview = await this.analyticsService.getUsageOverview(start, end);

      res.status(200).json({
        code: 200,
        message: '获取AI使用概览成功',
        data: overview
      });
        return;
    } catch (error) {
      console.error('获取AI使用概览失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取AI使用概览失败',
        data: null
      });
        return;
    }
  };

  /**
   * @description 获取模型使用分布
   * @route GET /api/v1/ai/analytics/models/distribution
   */
  public getModelUsageDistribution = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          code: 400,
          message: '请提供开始和结束日期',
          data: null
        });
        return;
      }

      // 验证日期格式
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          code: 400,
          message: '无效的日期格式',
          data: null
        });
        return;
      }

      const distribution = await this.analyticsService.getModelUsageDistribution(start, end);

      res.status(200).json({
        code: 200,
        message: '获取模型使用分布成功',
        data: distribution
      });
        return;
    } catch (error) {
      console.error('获取模型使用分布失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取模型使用分布失败',
        data: null
      });
        return;
    }
  };

  /**
   * @description 获取用户活跃度趋势
   * @route GET /api/v1/ai/analytics/activity/trend
   */
  public getUserActivityTrend = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { timeRange = 'week', limit = '30' } = req.query;

      // 验证时间范围
      const validTimeRanges = ['day', 'week', 'month', 'quarter', 'year'];
      if (!validTimeRanges.includes(timeRange as string)) {
        res.status(400).json({
          code: 400,
          message: `无效的时间范围，支持: ${validTimeRanges.join(', ')}`,
          data: null
        });
        return;
      }

      // 验证限制数量
      const limitNum = parseInt(limit as string, 10);
      if (isNaN(limitNum) || limitNum <= 0 || limitNum > 365) {
        res.status(400).json({
          code: 400,
          message: '限制数量必须是1-365之间的数字',
          data: null
        });
        return;
      }

      const trend = await this.analyticsService.getUserActivityTrend(
        timeRange as 'day' | 'week' | 'month' | 'quarter' | 'year',
        limitNum
      );

      res.status(200).json({
        code: 200,
        message: '获取用户活跃度趋势成功',
        data: trend
      });
        return;
    } catch (error) {
      console.error('获取用户活跃度趋势失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取用户活跃度趋势失败',
        data: null
      });
        return;
    }
  };

  /**
   * @description 获取特定用户分析
   * @route GET /api/v1/ai/analytics/user/:userId
   */
  public getUserAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { userId } = req.params;
      const { startDate, endDate } = req.query;
      const authenticatedUserId = (req as any).user?.id;

      // 使用认证用户ID或路径参数中的userID
      const targetUserId = authenticatedUserId || parseInt(userId, 10);

      if (!targetUserId) {
        res.status(400).json({
          code: 400,
          message: '请提供有效的用户ID',
          data: null
        });
        return;
      }

      if (!startDate || !endDate) {
        res.status(400).json({
          code: 400,
          message: '请提供开始和结束日期',
          data: null
        });
        return;
      }

      // 验证日期格式
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          code: 400,
          message: '无效的日期格式',
          data: null
        });
        return;
      }

      const userAnalytics = await this.analyticsService.getUserAnalytics(targetUserId);

      res.status(200).json({
        code: 200,
        message: '获取用户分析数据成功',
        data: userAnalytics
      });
        return;
    } catch (error) {
      console.error('获取用户分析数据失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取用户分析数据失败',
        data: null
      });
        return;
    }
  };

  /**
   * @description 获取内容分析
   * @route GET /api/v1/ai/analytics/content
   */
  public getContentAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        res.status(400).json({
          code: 400,
          message: '请提供开始和结束日期',
          data: null
        });
        return;
      }

      // 验证日期格式
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          code: 400,
          message: '无效的日期格式',
          data: null
        });
        return;
      }

      const contentAnalytics = await this.analyticsService.getContentAnalytics(start, end);

      res.status(200).json({
        code: 200,
        message: '获取内容分析数据成功',
        data: contentAnalytics
      });
        return;
    } catch (error) {
      console.error('获取内容分析数据失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取内容分析数据失败',
        data: null
      });
        return;
    }
  };

  /**
   * @description 生成分析报表
   * @route POST /api/v1/ai/analytics/report
   */
  public generateAnalyticsReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { startDate, endDate, includeUserDetails = false, selectedMetrics = [] } = req.body;

      if (!startDate || !endDate) {
        res.status(400).json({
          code: 400,
          message: '请提供开始和结束日期',
          data: null
        });
        return;
      }

      // 验证日期格式
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        res.status(400).json({
          code: 400,
          message: '无效的日期格式',
          data: null
        });
        return;
      }

      if (start >= end) {
        res.status(400).json({
          code: 400,
          message: '开始日期必须早于结束日期',
          data: null
        });
        return;
      }

      // 验证是否为管理员（报表生成通常需要管理员权限）
      const user = (req as any).user;
      if (!user || !user.isAdmin) {
        res.status(403).json({
          code: 403,
          message: '需要管理员权限才能生成报表',
          data: null
        });
        return;
      }

      const report = await this.analyticsService.generateAnalyticsReport({
        startDate: start,
        endDate: end,
        includeUserDetails,
        selectedMetrics
      });

      res.status(200).json({
        code: 200,
        message: '分析报表生成成功',
        data: report
      });
        return;
    } catch (error) {
      console.error('生成分析报表失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '生成分析报表失败',
        data: null
      });
        return;
    }
  };

  /**
   * @description 获取仪表板数据
   * @route GET /api/v1/ai/analytics/dashboard
   */
  public getDashboardData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { timeRange = 'week' } = req.query;
      
      // 计算日期范围
      const now = new Date();
      let startDate: Date;
      
      switch (timeRange) {
        case 'day':
          startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'quarter':
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        case 'year':
          startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // 并行获取所有需要的数据
      const [overview, modelDistribution, activityTrend, contentAnalytics] = await Promise.all([
        this.analyticsService.getUsageOverview(startDate, now),
        this.analyticsService.getModelUsageDistribution(startDate, now),
        this.analyticsService.getUserActivityTrend(timeRange as any, 30),
        this.analyticsService.getContentAnalytics(startDate, now)
      ]);

      const dashboardData = {
        overview,
        modelDistribution: modelDistribution.slice(0, 5), // 只显示前5个模型
        activityTrend,
        contentAnalytics,
        timeRange,
        lastUpdated: new Date()
      };

      res.status(200).json({
        code: 200,
        message: '获取仪表板数据成功',
        data: dashboardData
      });
        return;
    } catch (error) {
      console.error('获取仪表板数据失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取仪表板数据失败',
        data: null
      });
        return;
    }
  };

  /**
   * @description 获取AI预测分析数据
   * @route GET /api/v1/ai/analytics/predictive-analytics
   */
  public getPredictiveAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { type, timeRange = 'month' } = req.query;

      // 调用预测分析服务
      const predictiveData = await this.analyticsService.getPredictiveAnalytics();

      res.status(200).json({
        code: 200,
        message: '获取预测分析数据成功',
        data: predictiveData
      });
      return;
    } catch (error) {
      console.error('获取预测分析数据失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '获取预测分析数据失败',
        data: null
      });
      return;
    }
  };

  /**
   * @description 刷新预测分析数据
   * @route POST /api/v1/ai/analytics/predictive-analytics/refresh
   */
  public refreshPredictiveAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // 调用刷新服务
      await this.analyticsService.refreshPredictiveAnalytics();

      res.status(200).json({
        code: 200,
        message: '预测分析数据刷新成功',
        data: { refreshed: true, timestamp: new Date() }
      });
      return;
    } catch (error) {
      console.error('刷新预测分析数据失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '刷新预测分析数据失败',
        data: null
      });
      return;
    }
  };

  /**
   * @description 导出预测分析报告
   * @route POST /api/v1/ai/analytics/predictive-analytics/export
   */
  public exportPredictiveReport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { format = 'json', includeCharts = false } = req.body;

      // 调用导出服务
      const reportData = await this.analyticsService.exportPredictiveReport(format);

      res.status(200).json({
        code: 200,
        message: '预测分析报告导出成功',
        data: reportData
      });
      return;
    } catch (error) {
      console.error('导出预测分析报告失败:', error);
      res.status(500).json({
        code: 500,
        message: error instanceof Error ? error.message : '导出预测分析报告失败',
        data: null
      });
      return;
    }
  };
}
// 导出控制器实例
export default new AnalyticsController();
