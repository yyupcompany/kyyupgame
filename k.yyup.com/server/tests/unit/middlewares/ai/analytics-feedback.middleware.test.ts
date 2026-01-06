import { 
  aiAnalyticsAndFeedbackMiddleware,
  IAiAnalyticsAndFeedbackMiddleware
} from '../../../src/middlewares/ai/analytics-feedback.middleware';
import { vi } from 'vitest'
import { 
  aiAnalyticsService, 
  aiFeedbackService 
} from '../../../src/services/ai';
import { TimeRange, TrendDataPoint } from '../../../src/services/ai/interfaces';
import { FeedbackType, FeedbackSource, FeedbackStatus } from '../../../src/models/ai-feedback.model';

// Mock dependencies
jest.mock('../../../src/services/ai');


// 控制台错误检测
let consoleSpy: any

beforeEach(() => {
  // 监听控制台错误
  consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  // 验证没有控制台错误
  expect(consoleSpy).not.toHaveBeenCalled()
  consoleSpy.mockRestore()
})

describe('AiAnalyticsAndFeedbackMiddleware', () => {
  let middleware: IAiAnalyticsAndFeedbackMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = aiAnalyticsAndFeedbackMiddleware;
  });

  describe('getUsageOverview', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const mockOverview = {
      totalUsers: 100,
      totalConversations: 500,
      totalMessages: 2500,
      totalTokens: 50000,
      totalCost: 25.50,
      activeUsersCount: 80,
      avgMessagesPerConversation: 5,
      avgTokensPerMessage: 20
    };

    it('should return usage overview successfully', async () => {
      (aiAnalyticsService.getUsageOverview as jest.Mock).mockResolvedValue(mockOverview);

      const result = await middleware.getUsageOverview(startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOverview);
      expect(aiAnalyticsService.getUsageOverview).toHaveBeenCalledWith(startDate, endDate);
    });

    it('should handle permission denied error', async () => {
      const error = new Error('Permission denied');
      (aiAnalyticsService.getUsageOverview as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getUsageOverview(startDate, endDate);

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('SERVICE_ERROR');
      expect(result.error?.message).toBe('服务操作失败');
    });

    it('should validate date parameters', async () => {
      const invalidStartDate = new Date('invalid-date');
      
      const result = await middleware.getUsageOverview(invalidStartDate, endDate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('getModelUsageDistribution', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const mockDistribution = [
      {
        modelId: 1,
        modelName: 'GPT-4',
        requestCount: 300,
        tokenCount: 30000,
        costAmount: 15.00,
        percentage: 60
      },
      {
        modelId: 2,
        modelName: 'GPT-3.5',
        requestCount: 200,
        tokenCount: 20000,
        costAmount: 10.50,
        percentage: 40
      }
    ];

    it('should return model usage distribution successfully', async () => {
      (aiAnalyticsService.getModelUsageDistribution as jest.Mock).mockResolvedValue(mockDistribution);

      const result = await middleware.getModelUsageDistribution(startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockDistribution);
      expect(aiAnalyticsService.getModelUsageDistribution).toHaveBeenCalledWith(startDate, endDate);
    });

    it('should handle empty distribution data', async () => {
      (aiAnalyticsService.getModelUsageDistribution as jest.Mock).mockResolvedValue([]);

      const result = await middleware.getModelUsageDistribution(startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getUserActivityTrend', () => {
    const mockTrendData: TrendDataPoint[] = [
      { date: '2024-01-01', value: 50 },
      { date: '2024-01-02', value: 60 },
      { date: '2024-01-03', value: 45 }
    ];

    it('should return user activity trend successfully', async () => {
      (aiAnalyticsService.getUserActivityTrend as jest.Mock).mockResolvedValue(mockTrendData);

      const result = await middleware.getUserActivityTrend(TimeRange.LAST_7_DAYS, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockTrendData);
      expect(aiAnalyticsService.getUserActivityTrend).toHaveBeenCalledWith(TimeRange.LAST_7_DAYS, 10);
    });

    it('should handle default limit parameter', async () => {
      (aiAnalyticsService.getUserActivityTrend as jest.Mock).mockResolvedValue(mockTrendData);

      await middleware.getUserActivityTrend(TimeRange.LAST_30_DAYS);

      expect(aiAnalyticsService.getUserActivityTrend).toHaveBeenCalledWith(TimeRange.LAST_30_DAYS, undefined);
    });
  });

  describe('getUserAnalytics', () => {
    const userId = 1;
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const mockUserAnalytics = {
      conversationCount: 25,
      messageCount: 125,
      totalTokens: 2500,
      totalCost: 12.50,
      averageResponseTime: 1.5,
      mostUsedModelId: 1,
      mostUsedModelName: 'GPT-4',
      activeTimeDistribution: {
        morning: 40,
        afternoon: 35,
        evening: 25
      }
    };

    it('should return user analytics successfully', async () => {
      (aiAnalyticsService.getUserAnalytics as jest.Mock).mockResolvedValue(mockUserAnalytics);

      const result = await middleware.getUserAnalytics(userId, startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockUserAnalytics);
      expect(aiAnalyticsService.getUserAnalytics).toHaveBeenCalledWith(userId, startDate, endDate);
    });

    it('should handle user not found', async () => {
      (aiAnalyticsService.getUserAnalytics as jest.Mock).mockRejectedValue(new Error('User not found'));

      const result = await middleware.getUserAnalytics(userId, startDate, endDate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('getContentAnalytics', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const mockContentAnalytics = {
      averageMessageLength: 45.5,
      averageResponseLength: 120.3,
      commonTopics: [
        { topic: '学习', count: 150 },
        { topic: '课程', count: 120 },
        { topic: '作业', count: 80 }
      ],
      sentimentDistribution: {
        positive: 0.7,
        neutral: 0.25,
        negative: 0.05
      }
    };

    it('should return content analytics successfully', async () => {
      (aiAnalyticsService.getContentAnalytics as jest.Mock).mockResolvedValue(mockContentAnalytics);

      const result = await middleware.getContentAnalytics(startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockContentAnalytics);
      expect(aiAnalyticsService.getContentAnalytics).toHaveBeenCalledWith(startDate, endDate);
    });
  });

  describe('generateAnalyticsReport', () => {
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const mockReport = {
      reportId: 'report-123',
      generatedAt: new Date(),
      downloadUrl: 'https://example.com/reports/report-123.pdf'
    };

    it('should generate analytics report successfully', async () => {
      (aiAnalyticsService.generateAnalyticsReport as jest.Mock).mockResolvedValue(mockReport);

      const result = await middleware.generateAnalyticsReport(
        startDate,
        endDate,
        true,
        ['users', 'conversations']
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockReport);
      expect(aiAnalyticsService.generateAnalyticsReport).toHaveBeenCalledWith(
        startDate,
        endDate,
        true,
        ['users', 'conversations']
      );
    });

    it('should handle report generation with default parameters', async () => {
      (aiAnalyticsService.generateAnalyticsReport as jest.Mock).mockResolvedValue(mockReport);

      await middleware.generateAnalyticsReport(startDate, endDate);

      expect(aiAnalyticsService.generateAnalyticsReport).toHaveBeenCalledWith(
        startDate,
        endDate,
        undefined,
        undefined
      );
    });
  });

  describe('createFeedback', () => {
    const userId = 1;
    const mockFeedback = { id: 123 };

    it('should create feedback successfully', async () => {
      (aiFeedbackService.createFeedback as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await middleware.createFeedback(
        userId,
        FeedbackType.BUG_REPORT,
        FeedbackSource.USER_INTERFACE,
        'The button is not working properly'
      );

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFeedback);
      expect(aiFeedbackService.createFeedback).toHaveBeenCalledWith(
        userId,
        FeedbackType.BUG_REPORT,
        FeedbackSource.USER_INTERFACE,
        'The button is not working properly',
        undefined,
        undefined
      );
    });

    it('should create feedback with optional parameters', async () => {
      (aiFeedbackService.createFeedback as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await middleware.createFeedback(
        userId,
        FeedbackType.FEATURE_REQUEST,
        FeedbackSource.CONVERSATION,
        'Add dark mode',
        'conv-123',
        5
      );

      expect(result.success).toBe(true);
      expect(aiFeedbackService.createFeedback).toHaveBeenCalledWith(
        userId,
        FeedbackType.FEATURE_REQUEST,
        FeedbackSource.CONVERSATION,
        'Add dark mode',
        'conv-123',
        5
      );
    });

    it('should validate feedback content', async () => {
      const result = await middleware.createFeedback(
        userId,
        FeedbackType.BUG_REPORT,
        FeedbackSource.USER_INTERFACE,
        ''
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('反馈内容不能为空');
    });
  });

  describe('getUserFeedbacks', () => {
    const userId = 1;
    const mockFeedbacks = [
      {
        id: 1,
        userId,
        feedbackType: 'BUG_REPORT',
        sourceType: 'USER_INTERFACE',
        content: 'Bug report 1',
        rating: 3,
        status: 'PENDING',
        createdAt: new Date()
      },
      {
        id: 2,
        userId,
        feedbackType: 'FEATURE_REQUEST',
        sourceType: 'CONVERSATION',
        content: 'Feature request 1',
        rating: 5,
        status: 'REVIEWED',
        createdAt: new Date()
      }
    ];

    it('should return user feedbacks successfully', async () => {
      (aiFeedbackService.getUserFeedbacks as jest.Mock).mockResolvedValue(mockFeedbacks);

      const result = await middleware.getUserFeedbacks(userId, 10);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFeedbacks);
      expect(aiFeedbackService.getUserFeedbacks).toHaveBeenCalledWith(userId, 10);
    });

    it('should handle default limit parameter', async () => {
      (aiFeedbackService.getUserFeedbacks as jest.Mock).mockResolvedValue(mockFeedbacks);

      await middleware.getUserFeedbacks(userId);

      expect(aiFeedbackService.getUserFeedbacks).toHaveBeenCalledWith(userId, undefined);
    });

    it('should handle empty feedback list', async () => {
      (aiFeedbackService.getUserFeedbacks as jest.Mock).mockResolvedValue([]);

      const result = await middleware.getUserFeedbacks(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });
  });

  describe('getFeedbacksByStatus', () => {
    const mockFeedbacks = [
      {
        id: 1,
        feedbackType: 'BUG_REPORT',
        sourceType: 'USER_INTERFACE',
        content: 'Bug report 1',
        rating: 3,
        status: 'PENDING',
        createdAt: new Date()
      }
    ];

    it('should return feedbacks by status successfully', async () => {
      (aiFeedbackService.getFeedbacksByStatus as jest.Mock).mockResolvedValue(mockFeedbacks);

      const result = await middleware.getFeedbacksByStatus(FeedbackStatus.PENDING, 20);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFeedbacks);
      expect(aiFeedbackService.getFeedbacksByStatus).toHaveBeenCalledWith(FeedbackStatus.PENDING, 20);
    });
  });

  describe('updateFeedbackStatus', () => {
    const feedbackId = 1;
    const adminNotes = 'Reviewed and fixed';

    it('should update feedback status successfully', async () => {
      (aiFeedbackService.updateFeedbackStatus as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.updateFeedbackStatus(
        feedbackId,
        FeedbackStatus.RESOLVED,
        adminNotes
      );

      expect(result.success).toBe(true);
      expect(result.data).toBe(true);
      expect(aiFeedbackService.updateFeedbackStatus).toHaveBeenCalledWith(
        feedbackId,
        FeedbackStatus.RESOLVED,
        adminNotes
      );
    });

    it('should update feedback status without admin notes', async () => {
      (aiFeedbackService.updateFeedbackStatus as jest.Mock).mockResolvedValue(undefined);

      const result = await middleware.updateFeedbackStatus(feedbackId, FeedbackStatus.RESOLVED);

      expect(result.success).toBe(true);
      expect(aiFeedbackService.updateFeedbackStatus).toHaveBeenCalledWith(
        feedbackId,
        FeedbackStatus.RESOLVED,
        undefined
      );
    });
  });

  describe('getFeedbackDetails', () => {
    const feedbackId = 1;
    const mockFeedback = {
      id: feedbackId,
      userId: 1,
      feedbackType: 'BUG_REPORT',
      sourceType: 'USER_INTERFACE',
      content: 'Detailed bug description',
      rating: 3,
      status: 'PENDING',
      adminNotes: 'Under investigation',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    it('should return feedback details successfully', async () => {
      (aiFeedbackService.getFeedbackDetails as jest.Mock).mockResolvedValue(mockFeedback);

      const result = await middleware.getFeedbackDetails(feedbackId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockFeedback);
      expect(aiFeedbackService.getFeedbackDetails).toHaveBeenCalledWith(feedbackId);
    });

    it('should handle feedback not found', async () => {
      (aiFeedbackService.getFeedbackDetails as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getFeedbackDetails(feedbackId);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('getFeedbackStats', () => {
    const mockStats = {
      total: 100,
      pending: 25,
      reviewed: 50,
      resolved: 20,
      ignored: 5,
      byType: {
        BUG_REPORT: 40,
        FEATURE_REQUEST: 35,
        GENERAL: 25
      }
    };

    it('should return feedback statistics successfully', async () => {
      (aiFeedbackService.getFeedbackStats as jest.Mock).mockResolvedValue(mockStats);

      const result = await middleware.getFeedbackStats();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockStats);
      expect(aiFeedbackService.getFeedbackStats).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors consistently', async () => {
      const error = new Error('Service unavailable');
      (aiAnalyticsService.getUsageOverview as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getUsageOverview(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error?.code).toBe('SERVICE_ERROR');
      expect(result.error?.message).toBe('服务操作失败');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      (aiFeedbackService.createFeedback as jest.Mock).mockRejectedValue(error);

      const result = await middleware.createFeedback(
        1,
        FeedbackType.BUG_REPORT,
        FeedbackSource.USER_INTERFACE,
        'Test feedback'
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });

    it('should handle validation errors from services', async () => {
      const error = new Error('Invalid parameters');
      (aiAnalyticsService.getUserAnalytics as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getUserAnalytics(
        1,
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });
});