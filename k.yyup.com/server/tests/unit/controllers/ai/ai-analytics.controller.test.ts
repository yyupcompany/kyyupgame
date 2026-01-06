import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock Express types
const mockRequest = {
  params: {},
  query: {},
  body: {},
  user: { id: 1, username: 'admin', role: 'admin' },
  headers: {}
} as any;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn().mockReturnThis(),
  send: jest.fn().mockReturnThis(),
  setHeader: jest.fn().mockReturnThis(),
  end: jest.fn().mockReturnThis()
} as any;

const mockNext = jest.fn();

// Mock services
const mockAIAnalyticsService = {
  getOverallStats: jest.fn(),
  getStatsForPeriod: jest.fn(),
  getUserActivity: jest.fn(),
  getModelUsageDistribution: jest.fn(),
  getUserBehaviorAnalysis: jest.fn(),
  getTopicDistribution: jest.fn(),
  getResponseTimeAnalysis: jest.fn(),
  getErrorRateAnalysis: jest.fn(),
  getLoadTrend: jest.fn(),
  calculateUsageCosts: jest.fn(),
  predictFutureCosts: jest.fn(),
  getCostOptimizationSuggestions: jest.fn(),
  getUserSatisfactionAnalysis: jest.fn(),
  identifyHighValueUsers: jest.fn(),
  analyzeChurnRisk: jest.fn(),
  getRealTimeStatus: jest.fn(),
  detectAnomalies: jest.fn(),
  generateAlert: jest.fn(),
  generateDailyReport: jest.fn(),
  generateWeeklyReport: jest.fn(),
  generateMonthlyReport: jest.fn(),
  exportToCSV: jest.fn(),
  exportToJSON: jest.fn(),
  generatePDFReport: jest.fn()
};

// Mock logger
const mockLogger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock cache
const mockCache = {
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../../src/services/ai/ai-analytics.service', () => ({
  default: mockAIAnalyticsService
}));

jest.unstable_mockModule('../../../../../../src/utils/logger', () => ({
  default: mockLogger
}));

jest.unstable_mockModule('../../../../../../src/utils/cache', () => ({
  default: mockCache
}));


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

describe('AI Analytics Controller', () => {
  let aiAnalyticsController: any;

  beforeAll(async () => {
    const imported = await import('../../../../../../src/controllers/ai/ai-analytics.controller');
    aiAnalyticsController = imported.default || imported.AIAnalyticsController || imported;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock objects
    mockRequest.params = {};
    mockRequest.query = {};
    mockRequest.body = {};
    mockRequest.user = { id: 1, username: 'admin', role: 'admin' };
    mockRequest.headers = {};
  });

  describe('getOverallStats', () => {
    it('应该获取AI使用总体统计', async () => {
      const mockStats = {
        totalConversations: 1500,
        totalMessages: 15000,
        totalUsers: 500,
        totalTokensUsed: 50000,
        averageMessagesPerConversation: 10,
        averageTokensPerMessage: 3.33
      };

      mockAIAnalyticsService.getOverallStats.mockResolvedValue(mockStats);

      await aiAnalyticsController.getOverallStats(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getOverallStats).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });

    it('应该处理服务错误', async () => {
      const error = new Error('Database connection failed');
      mockAIAnalyticsService.getOverallStats.mockRejectedValue(error);

      await aiAnalyticsController.getOverallStats(mockRequest, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledWith(error);
      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.stringContaining('Error getting overall AI stats'),
        expect.objectContaining({ error: error.message })
      );
    });
  });

  describe('getStatsForPeriod', () => {
    it('应该获取指定时间范围的统计', async () => {
      const mockStats = {
        totalConversations: 200,
        totalMessages: 2000,
        period: { start: '2024-01-01', end: '2024-01-31' }
      };

      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      mockAIAnalyticsService.getStatsForPeriod.mockResolvedValue(mockStats);

      await aiAnalyticsController.getStatsForPeriod(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getStatsForPeriod).toHaveBeenCalledWith(
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStats
      });
    });

    it('应该验证日期参数', async () => {
      mockRequest.query = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      await aiAnalyticsController.getStatsForPeriod(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Invalid date format'
      });
    });

    it('应该验证日期范围', async () => {
      mockRequest.query = {
        startDate: '2024-01-31',
        endDate: '2024-01-01'
      };

      await aiAnalyticsController.getStatsForPeriod(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Start date must be before end date'
      });
    });
  });

  describe('getUserActivity', () => {
    it('应该获取用户活跃度统计', async () => {
      const mockActivity = [
        { date: '2024-01-01', activeUsers: 50 },
        { date: '2024-01-02', activeUsers: 65 },
        { date: '2024-01-03', activeUsers: 45 }
      ];

      mockRequest.query = { period: 'daily', days: '7' };
      mockAIAnalyticsService.getUserActivity.mockResolvedValue(mockActivity);

      await aiAnalyticsController.getUserActivity(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getUserActivity).toHaveBeenCalledWith('daily', 7);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockActivity
      });
    });

    it('应该使用默认参数', async () => {
      mockRequest.query = {};
      mockAIAnalyticsService.getUserActivity.mockResolvedValue([]);

      await aiAnalyticsController.getUserActivity(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getUserActivity).toHaveBeenCalledWith('daily', 30);
    });
  });

  describe('getModelUsageDistribution', () => {
    it('应该获取AI模型使用分布', async () => {
      const mockDistribution = [
        {
          modelId: 'gpt-4',
          usageCount: 1000,
          totalTokens: 50000,
          percentage: 40,
          averageTokensPerRequest: 50
        },
        {
          modelId: 'gpt-3.5',
          usageCount: 1500,
          totalTokens: 60000,
          percentage: 60,
          averageTokensPerRequest: 40
        }
      ];

      mockAIAnalyticsService.getModelUsageDistribution.mockResolvedValue(mockDistribution);

      await aiAnalyticsController.getModelUsageDistribution(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getModelUsageDistribution).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockDistribution
      });
    });
  });

  describe('getUserBehaviorAnalysis', () => {
    it('应该分析用户使用行为', async () => {
      const mockBehavior = [
        {
          userId: 1,
          conversationCount: 50,
          messageCount: 500,
          averageSessionLength: 15.5,
          messagesPerConversation: 10,
          userType: 'power_user'
        }
      ];

      mockAIAnalyticsService.getUserBehaviorAnalysis.mockResolvedValue(mockBehavior);

      await aiAnalyticsController.getUserBehaviorAnalysis(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getUserBehaviorAnalysis).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockBehavior
      });
    });
  });

  describe('getResponseTimeAnalysis', () => {
    it('应该分析响应时间统计', async () => {
      const mockPerformance = {
        overall: {
          average: 1200,
          median: 1000,
          p95: 2000,
          p99: 3000
        },
        byModel: {
          'gpt-4': { average: 1500, median: 1200 },
          'gpt-3.5': { average: 800, median: 700 }
        }
      };

      mockAIAnalyticsService.getResponseTimeAnalysis.mockResolvedValue(mockPerformance);

      await aiAnalyticsController.getResponseTimeAnalysis(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getResponseTimeAnalysis).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPerformance
      });
    });
  });

  describe('calculateUsageCosts', () => {
    it('应该计算AI使用成本', async () => {
      const mockCosts = {
        totalCost: 1250.50,
        costByModel: {
          'gpt-4': 800.30,
          'gpt-3.5': 450.20
        },
        costBreakdown: {
          inputTokensCost: 750.25,
          outputTokensCost: 500.25
        }
      };

      mockAIAnalyticsService.calculateUsageCosts.mockResolvedValue(mockCosts);

      await aiAnalyticsController.calculateUsageCosts(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.calculateUsageCosts).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockCosts
      });
    });
  });

  describe('predictFutureCosts', () => {
    it('应该预测未来成本', async () => {
      const mockPrediction = {
        historicalData: [
          { date: '2024-01-01', dailyCost: 100 },
          { date: '2024-01-02', dailyCost: 120 }
        ],
        prediction: {
          nextMonth: 3500,
          nextQuarter: 10500,
          trend: 'increasing'
        }
      };

      mockRequest.query = { days: '30' };
      mockAIAnalyticsService.predictFutureCosts.mockResolvedValue(mockPrediction);

      await aiAnalyticsController.predictFutureCosts(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.predictFutureCosts).toHaveBeenCalledWith(30);
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockPrediction
      });
    });
  });

  describe('getCostOptimizationSuggestions', () => {
    it('应该获取成本优化建议', async () => {
      const mockOptimization = {
        suggestions: [
          'Consider using GPT-3.5 for simple queries',
          'Implement response caching for common questions'
        ],
        potentialSavings: 500.25,
        recommendations: [
          { type: 'model_switch', impact: 'high', savings: 300 },
          { type: 'caching', impact: 'medium', savings: 200.25 }
        ]
      };

      mockAIAnalyticsService.getCostOptimizationSuggestions.mockResolvedValue(mockOptimization);

      await aiAnalyticsController.getCostOptimizationSuggestions(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getCostOptimizationSuggestions).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockOptimization
      });
    });
  });

  describe('getUserSatisfactionAnalysis', () => {
    it('应该分析用户满意度', async () => {
      const mockSatisfaction = {
        averageRating: 4.2,
        ratingDistribution: {
          5: 45,
          4: 30,
          3: 15,
          2: 7,
          1: 3
        },
        sentimentAnalysis: {
          positive: 0.75,
          neutral: 0.20,
          negative: 0.05
        },
        commonFeedback: [
          'Very helpful responses',
          'Fast response time',
          'Sometimes misunderstands context'
        ]
      };

      mockAIAnalyticsService.getUserSatisfactionAnalysis.mockResolvedValue(mockSatisfaction);

      await aiAnalyticsController.getUserSatisfactionAnalysis(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getUserSatisfactionAnalysis).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockSatisfaction
      });
    });
  });

  describe('getRealTimeStatus', () => {
    it('应该获取实时系统状态', async () => {
      const mockStatus = {
        activeConnections: 150,
        queueLength: 5,
        averageResponseTime: 1200,
        errorRate: 0.02,
        systemHealth: 'healthy',
        timestamp: Date.now()
      };

      mockAIAnalyticsService.getRealTimeStatus.mockResolvedValue(mockStatus);

      await aiAnalyticsController.getRealTimeStatus(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getRealTimeStatus).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockStatus
      });
    });
  });

  describe('detectAnomalies', () => {
    it('应该检测系统异常', async () => {
      const mockAnomalies = [
        {
          metric: 'response_time',
          value: 5000,
          threshold: 3000,
          severity: 'high',
          timestamp: Date.now()
        }
      ];

      mockAIAnalyticsService.detectAnomalies.mockResolvedValue(mockAnomalies);

      await aiAnalyticsController.detectAnomalies(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.detectAnomalies).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockAnomalies
      });
    });
  });

  describe('generateDailyReport', () => {
    it('应该生成日报', async () => {
      const mockReport = {
        date: '2024-01-15',
        summary: {
          totalConversations: 100,
          totalMessages: 1000,
          totalTokens: 50000,
          totalCost: 125.50
        },
        trends: {
          conversationGrowth: 0.05,
          costGrowth: 0.03
        },
        topUsers: [
          { userId: 1, messageCount: 50 },
          { userId: 2, messageCount: 45 }
        ],
        issues: []
      };

      mockRequest.query = { date: '2024-01-15' };
      mockAIAnalyticsService.generateDailyReport.mockResolvedValue(mockReport);

      await aiAnalyticsController.generateDailyReport(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.generateDailyReport).toHaveBeenCalledWith(new Date('2024-01-15'));
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockReport
      });
    });

    it('应该使用默认日期', async () => {
      mockRequest.query = {};
      mockAIAnalyticsService.generateDailyReport.mockResolvedValue({});

      await aiAnalyticsController.generateDailyReport(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.generateDailyReport).toHaveBeenCalledWith(expect.any(Date));
    });
  });

  describe('generateWeeklyReport', () => {
    it('应该生成周报', async () => {
      const mockReport = {
        period: {
          start: '2024-01-08',
          end: '2024-01-14'
        },
        summary: {
          totalConversations: 700,
          totalMessages: 7000
        },
        trends: {},
        insights: [],
        recommendations: []
      };

      mockRequest.query = {
        startDate: '2024-01-08',
        endDate: '2024-01-14'
      };
      mockAIAnalyticsService.generateWeeklyReport.mockResolvedValue(mockReport);

      await aiAnalyticsController.generateWeeklyReport(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.generateWeeklyReport).toHaveBeenCalledWith(
        new Date('2024-01-08'),
        new Date('2024-01-14')
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: mockReport
      });
    });
  });

  describe('exportToCSV', () => {
    it('应该导出CSV格式数据', async () => {
      const mockCSV = 'date,conversations,messages\n2024-01-01,100,1000\n2024-01-02,120,1200';

      mockRequest.query = { type: 'daily_stats', startDate: '2024-01-01', endDate: '2024-01-02' };
      mockAIAnalyticsService.exportToCSV.mockResolvedValue(mockCSV);

      await aiAnalyticsController.exportToCSV(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.exportToCSV).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'text/csv');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=ai_analytics.csv'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockCSV);
    });

    it('应该验证导出类型', async () => {
      mockRequest.query = {};

      await aiAnalyticsController.exportToCSV(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Export type is required'
      });
    });
  });

  describe('exportToJSON', () => {
    it('应该导出JSON格式数据', async () => {
      const mockJSON = JSON.stringify({
        exportedAt: '2024-01-15T10:00:00Z',
        data: { summary: { total: 1000 } }
      });

      mockRequest.query = { type: 'user_behavior' };
      mockAIAnalyticsService.exportToJSON.mockResolvedValue(mockJSON);

      await aiAnalyticsController.exportToJSON(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.exportToJSON).toHaveBeenCalled();
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=ai_analytics.json'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockJSON);
    });
  });

  describe('generatePDFReport', () => {
    it('应该生成PDF报告', async () => {
      const mockPDFBuffer = Buffer.from('fake pdf data');

      mockRequest.body = {
        title: 'AI Analytics Report',
        summary: { total: 1000 },
        charts: []
      };
      mockAIAnalyticsService.generatePDFReport.mockResolvedValue(mockPDFBuffer);

      await aiAnalyticsController.generatePDFReport(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.generatePDFReport).toHaveBeenCalledWith(mockRequest.body);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(mockResponse.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment; filename=ai_analytics_report.pdf'
      );
      expect(mockResponse.send).toHaveBeenCalledWith(mockPDFBuffer);
    });

    it('应该验证报告数据', async () => {
      mockRequest.body = {};

      await aiAnalyticsController.generatePDFReport(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Report data is required'
      });
    });
  });

  describe('权限验证', () => {
    it('应该验证管理员权限', async () => {
      mockRequest.user = { id: 1, role: 'user' };

      await aiAnalyticsController.getOverallStats(mockRequest, mockResponse, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Admin access required'
      });
    });
  });

  describe('缓存处理', () => {
    it('应该使用缓存数据', async () => {
      const cachedData = { totalConversations: 1500 };
      mockCache.get.mockResolvedValue(cachedData);

      await aiAnalyticsController.getOverallStats(mockRequest, mockResponse, mockNext);

      expect(mockCache.get).toHaveBeenCalledWith('ai_analytics:overall_stats');
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        data: cachedData,
        cached: true
      });
      expect(mockAIAnalyticsService.getOverallStats).not.toHaveBeenCalled();
    });

    it('应该在缓存未命中时查询服务', async () => {
      const serviceData = { totalConversations: 1500 };
      mockCache.get.mockResolvedValue(null);
      mockAIAnalyticsService.getOverallStats.mockResolvedValue(serviceData);

      await aiAnalyticsController.getOverallStats(mockRequest, mockResponse, mockNext);

      expect(mockAIAnalyticsService.getOverallStats).toHaveBeenCalled();
      expect(mockCache.set).toHaveBeenCalledWith(
        'ai_analytics:overall_stats',
        serviceData,
        300 // 5 minutes
      );
    });
  });
});
