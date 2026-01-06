import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockAIAnalytics = {
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockUser = {
  findByPk: jest.fn(),
  findAll: jest.fn()
};

const mockAIConversation = {
  findAll: jest.fn(),
  count: jest.fn()
};

// Mock Sequelize transaction
const mockTransaction = {
  commit: jest.fn(),
  rollback: jest.fn()
};

const mockSequelize = {
  transaction: jest.fn().mockResolvedValue(mockTransaction),
  Op: {
    gte: Symbol('gte'),
    lte: Symbol('lte'),
    between: Symbol('between'),
    in: Symbol('in'),
    like: Symbol('like')
  },
  fn: jest.fn(),
  col: jest.fn(),
  literal: jest.fn()
};

// Mock imports
jest.unstable_mockModule('../../../../../src/models/ai-analytics.model', () => ({
  AIAnalytics: mockAIAnalytics
}));

jest.unstable_mockModule('../../../../../src/models/user.model', () => ({
  User: mockUser
}));

jest.unstable_mockModule('../../../../../src/models/ai-conversation.model', () => ({
  AIConversation: mockAIConversation
}));

jest.unstable_mockModule('../../../../../src/config/database', () => ({
  sequelize: mockSequelize
}));

jest.unstable_mockModule('../../../../../src/utils/apiError', () => ({
  ApiError: jest.fn().mockImplementation((message, statusCode) => {
    const error = new Error(message);
    (error as any).statusCode = statusCode;
    return error;
  })
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

describe('AI Analytics Service', () => {
  let AIAnalyticsService: any;
  let aiAnalyticsService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/ai/ai-analytics.service');
    AIAnalyticsService = imported.AIAnalyticsService;
    aiAnalyticsService = new AIAnalyticsService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('recordUsage', () => {
    it('应该成功记录AI使用情况', async () => {
      const usageData = {
        userId: 1,
        modelId: 'gpt-4',
        action: 'chat',
        inputTokens: 100,
        outputTokens: 150,
        cost: 0.05,
        responseTime: 1200,
        success: true
      };

      const mockCreatedRecord = {
        id: 1,
        ...usageData,
        timestamp: new Date(),
        createdAt: new Date()
      };

      mockUser.findByPk.mockResolvedValue({ id: 1, name: '测试用户' });
      mockAIAnalytics.create.mockResolvedValue(mockCreatedRecord);

      const result = await aiAnalyticsService.recordUsage(usageData);

      expect(mockUser.findByPk).toHaveBeenCalledWith(1);
      expect(mockAIAnalytics.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          modelId: 'gpt-4',
          action: 'chat',
          inputTokens: 100,
          outputTokens: 150,
          cost: 0.05,
          responseTime: 1200,
          success: true,
          timestamp: expect.any(Date)
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedRecord);
    });

    it('应该在用户不存在时抛出错误', async () => {
      const usageData = {
        userId: 999,
        modelId: 'gpt-4',
        action: 'chat'
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(aiAnalyticsService.recordUsage(usageData))
        .rejects
        .toThrow('用户不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该处理数据库错误', async () => {
      const usageData = {
        userId: 1,
        modelId: 'gpt-4',
        action: 'chat'
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockAIAnalytics.create.mockRejectedValue(new Error('数据库错误'));

      await expect(aiAnalyticsService.recordUsage(usageData))
        .rejects
        .toThrow('数据库错误');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getUserUsageStats', () => {
    it('应该成功获取用户使用统计', async () => {
      const userId = 1;
      const timeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const mockStats = [
        {
          action: 'chat',
          totalRequests: 50,
          totalTokens: 5000,
          totalCost: 2.5,
          avgResponseTime: 1000,
          successRate: 0.96
        },
        {
          action: 'image_generation',
          totalRequests: 10,
          totalTokens: 0,
          totalCost: 1.0,
          avgResponseTime: 3000,
          successRate: 0.9
        }
      ];

      mockUser.findByPk.mockResolvedValue({ id: 1, name: '测试用户' });
      mockAIAnalytics.findAll.mockResolvedValue(mockStats);

      const result = await aiAnalyticsService.getUserUsageStats(userId, timeRange);

      expect(mockUser.findByPk).toHaveBeenCalledWith(userId);
      expect(mockAIAnalytics.findAll).toHaveBeenCalledWith({
        where: {
          userId: userId,
          timestamp: {
            [mockSequelize.Op.between]: [timeRange.startDate, timeRange.endDate]
          }
        },
        attributes: [
          'action',
          [mockSequelize.fn('COUNT', '*'), 'totalRequests'],
          [mockSequelize.fn('SUM', mockSequelize.col('inputTokens')), 'inputTokens'],
          [mockSequelize.fn('SUM', mockSequelize.col('outputTokens')), 'outputTokens'],
          [mockSequelize.fn('SUM', mockSequelize.col('cost')), 'totalCost'],
          [mockSequelize.fn('AVG', mockSequelize.col('responseTime')), 'avgResponseTime'],
          [mockSequelize.literal('AVG(CASE WHEN success = true THEN 1.0 ELSE 0.0 END)'), 'successRate']
        ],
        group: ['action']
      });

      expect(result).toEqual({
        userId: userId,
        timeRange: timeRange,
        stats: mockStats,
        summary: expect.objectContaining({
          totalRequests: expect.any(Number),
          totalCost: expect.any(Number),
          avgSuccessRate: expect.any(Number)
        })
      });
    });

    it('应该在用户不存在时抛出错误', async () => {
      const userId = 999;
      const timeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(aiAnalyticsService.getUserUsageStats(userId, timeRange))
        .rejects
        .toThrow('用户不存在');
    });
  });

  describe('getModelUsageStats', () => {
    it('应该成功获取模型使用统计', async () => {
      const modelId = 'gpt-4';
      const timeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const mockStats = {
        modelId: 'gpt-4',
        totalRequests: 1000,
        totalUsers: 50,
        totalTokens: 100000,
        totalCost: 50.0,
        avgResponseTime: 1200,
        successRate: 0.95,
        peakHours: [9, 10, 14, 15, 16],
        topUsers: [
          { userId: 1, userName: '用户1', requestCount: 100 },
          { userId: 2, userName: '用户2', requestCount: 80 }
        ]
      };

      mockAIAnalytics.findAll.mockResolvedValue([mockStats]);

      const result = await aiAnalyticsService.getModelUsageStats(modelId, timeRange);

      expect(mockAIAnalytics.findAll).toHaveBeenCalledWith({
        where: {
          modelId: modelId,
          timestamp: {
            [mockSequelize.Op.between]: [timeRange.startDate, timeRange.endDate]
          }
        },
        attributes: [
          [mockSequelize.fn('COUNT', '*'), 'totalRequests'],
          [mockSequelize.fn('COUNT', mockSequelize.fn('DISTINCT', mockSequelize.col('userId'))), 'totalUsers'],
          [mockSequelize.fn('SUM', mockSequelize.col('inputTokens')), 'inputTokens'],
          [mockSequelize.fn('SUM', mockSequelize.col('outputTokens')), 'outputTokens'],
          [mockSequelize.fn('SUM', mockSequelize.col('cost')), 'totalCost'],
          [mockSequelize.fn('AVG', mockSequelize.col('responseTime')), 'avgResponseTime'],
          [mockSequelize.literal('AVG(CASE WHEN success = true THEN 1.0 ELSE 0.0 END)'), 'successRate']
        ]
      });

      expect(result).toEqual(expect.objectContaining({
        modelId: modelId,
        timeRange: timeRange,
        stats: expect.any(Object)
      }));
    });
  });

  describe('getSystemOverview', () => {
    it('应该成功获取系统概览统计', async () => {
      const timeRange = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      const mockOverview = {
        totalRequests: 5000,
        totalUsers: 200,
        totalCost: 250.0,
        avgResponseTime: 1100,
        successRate: 0.94,
        modelDistribution: [
          { modelId: 'gpt-4', requestCount: 3000, percentage: 60 },
          { modelId: 'gpt-3.5-turbo', requestCount: 2000, percentage: 40 }
        ],
        actionDistribution: [
          { action: 'chat', requestCount: 4000, percentage: 80 },
          { action: 'image_generation', requestCount: 1000, percentage: 20 }
        ],
        dailyUsage: [
          { date: '2024-01-01', requests: 100, cost: 5.0 },
          { date: '2024-01-02', requests: 120, cost: 6.0 }
        ]
      };

      mockAIAnalytics.findAll.mockResolvedValue([mockOverview]);

      const result = await aiAnalyticsService.getSystemOverview(timeRange);

      expect(result).toEqual(expect.objectContaining({
        timeRange: timeRange,
        overview: expect.objectContaining({
          totalRequests: expect.any(Number),
          totalUsers: expect.any(Number),
          totalCost: expect.any(Number),
          avgResponseTime: expect.any(Number),
          successRate: expect.any(Number)
        }),
        distributions: expect.objectContaining({
          models: expect.any(Array),
          actions: expect.any(Array)
        }),
        trends: expect.objectContaining({
          daily: expect.any(Array)
        })
      }));
    });
  });

  describe('getPerformanceMetrics', () => {
    it('应该成功获取性能指标', async () => {
      const options = {
        modelId: 'gpt-4',
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        groupBy: 'hour'
      };

      const mockMetrics = [
        {
          timeGroup: '2024-01-01 09:00',
          avgResponseTime: 1000,
          requestCount: 50,
          errorRate: 0.02,
          p95ResponseTime: 1500,
          p99ResponseTime: 2000
        },
        {
          timeGroup: '2024-01-01 10:00',
          avgResponseTime: 1100,
          requestCount: 60,
          errorRate: 0.03,
          p95ResponseTime: 1600,
          p99ResponseTime: 2100
        }
      ];

      mockAIAnalytics.findAll.mockResolvedValue(mockMetrics);

      const result = await aiAnalyticsService.getPerformanceMetrics(options);

      expect(result).toEqual({
        modelId: options.modelId,
        timeRange: options.timeRange,
        groupBy: options.groupBy,
        metrics: mockMetrics,
        summary: expect.objectContaining({
          avgResponseTime: expect.any(Number),
          totalRequests: expect.any(Number),
          avgErrorRate: expect.any(Number)
        })
      });
    });
  });

  describe('getCostAnalysis', () => {
    it('应该成功获取成本分析', async () => {
      const options = {
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        groupBy: 'user'
      };

      const mockCostAnalysis = [
        {
          userId: 1,
          userName: '用户1',
          totalCost: 25.0,
          requestCount: 500,
          avgCostPerRequest: 0.05
        },
        {
          userId: 2,
          userName: '用户2',
          totalCost: 20.0,
          requestCount: 400,
          avgCostPerRequest: 0.05
        }
      ];

      mockAIAnalytics.findAll.mockResolvedValue(mockCostAnalysis);

      const result = await aiAnalyticsService.getCostAnalysis(options);

      expect(result).toEqual({
        timeRange: options.timeRange,
        groupBy: options.groupBy,
        analysis: mockCostAnalysis,
        summary: expect.objectContaining({
          totalCost: expect.any(Number),
          avgCostPerRequest: expect.any(Number),
          topSpenders: expect.any(Array)
        })
      });
    });
  });

  describe('generateReport', () => {
    it('应该成功生成分析报告', async () => {
      const reportOptions = {
        type: 'monthly',
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        includeDetails: true
      };

      const mockReport = {
        reportId: 'report_2024_01',
        type: 'monthly',
        timeRange: reportOptions.timeRange,
        generatedAt: new Date(),
        summary: {
          totalRequests: 5000,
          totalCost: 250.0,
          totalUsers: 200,
          avgSuccessRate: 0.94
        },
        details: {
          modelStats: [],
          userStats: [],
          performanceMetrics: [],
          costAnalysis: []
        },
        insights: [
          'GPT-4模型使用率最高，占总请求的60%',
          '平均响应时间为1.1秒，符合预期',
          '成功率为94%，建议优化错误处理'
        ],
        recommendations: [
          '考虑增加GPT-3.5-turbo的使用以降低成本',
          '优化高频用户的请求模式',
          '建立更完善的错误监控机制'
        ]
      };

      // Mock各种统计方法
      aiAnalyticsService.getSystemOverview = jest.fn().mockResolvedValue(mockReport.summary);
      aiAnalyticsService.getModelUsageStats = jest.fn().mockResolvedValue({});
      aiAnalyticsService.getPerformanceMetrics = jest.fn().mockResolvedValue({});
      aiAnalyticsService.getCostAnalysis = jest.fn().mockResolvedValue({});

      const result = await aiAnalyticsService.generateReport(reportOptions);

      expect(result).toEqual(expect.objectContaining({
        reportId: expect.any(String),
        type: reportOptions.type,
        timeRange: reportOptions.timeRange,
        generatedAt: expect.any(Date),
        summary: expect.any(Object),
        insights: expect.any(Array),
        recommendations: expect.any(Array)
      }));

      if (reportOptions.includeDetails) {
        expect(result.details).toBeDefined();
      }
    });
  });

  describe('exportData', () => {
    it('应该成功导出分析数据', async () => {
      const exportOptions = {
        format: 'csv',
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        fields: ['timestamp', 'userId', 'modelId', 'action', 'cost']
      };

      const mockData = [
        {
          timestamp: '2024-01-01 10:00:00',
          userId: 1,
          modelId: 'gpt-4',
          action: 'chat',
          cost: 0.05
        },
        {
          timestamp: '2024-01-01 10:05:00',
          userId: 2,
          modelId: 'gpt-3.5-turbo',
          action: 'chat',
          cost: 0.02
        }
      ];

      mockAIAnalytics.findAll.mockResolvedValue(mockData);

      const result = await aiAnalyticsService.exportData(exportOptions);

      expect(mockAIAnalytics.findAll).toHaveBeenCalledWith({
        where: {
          timestamp: {
            [mockSequelize.Op.between]: [
              exportOptions.timeRange.startDate,
              exportOptions.timeRange.endDate
            ]
          }
        },
        attributes: exportOptions.fields,
        order: [['timestamp', 'ASC']]
      });

      expect(result).toEqual({
        format: exportOptions.format,
        data: mockData,
        totalRecords: mockData.length,
        exportedAt: expect.any(Date)
      });
    });

    it('应该支持JSON格式导出', async () => {
      const exportOptions = {
        format: 'json',
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        }
      };

      const mockData = [{ id: 1, userId: 1, modelId: 'gpt-4' }];
      mockAIAnalytics.findAll.mockResolvedValue(mockData);

      const result = await aiAnalyticsService.exportData(exportOptions);

      expect(result.format).toBe('json');
      expect(result.data).toEqual(mockData);
    });
  });

  describe('cleanupOldData', () => {
    it('应该成功清理旧数据', async () => {
      const retentionDays = 90;
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

      mockAIAnalytics.destroy.mockResolvedValue(150); // 删除了150条记录

      const result = await aiAnalyticsService.cleanupOldData(retentionDays);

      expect(mockAIAnalytics.destroy).toHaveBeenCalledWith({
        where: {
          timestamp: {
            [mockSequelize.Op.lte]: expect.any(Date)
          }
        }
      });

      expect(result).toEqual({
        retentionDays: retentionDays,
        cutoffDate: expect.any(Date),
        deletedRecords: 150,
        cleanupAt: expect.any(Date)
      });
    });

    it('应该处理清理过程中的错误', async () => {
      const retentionDays = 90;

      mockAIAnalytics.destroy.mockRejectedValue(new Error('清理失败'));

      await expect(aiAnalyticsService.cleanupOldData(retentionDays))
        .rejects
        .toThrow('清理失败');
    });
  });
});
