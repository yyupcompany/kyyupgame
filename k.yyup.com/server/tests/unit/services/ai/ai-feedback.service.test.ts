import { jest } from '@jest/globals';
import { vi } from 'vitest'

// Mock models
const mockAIFeedback = {
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
  findByPk: jest.fn(),
  findAll: jest.fn()
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
jest.unstable_mockModule('../../../../../src/models/ai-feedback.model', () => ({
  AIFeedback: mockAIFeedback
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

describe('AI Feedback Service', () => {
  let AIFeedbackService: any;
  let aiFeedbackService: any;

  beforeAll(async () => {
    const imported = await import('../../../../../src/services/ai/ai-feedback.service');
    AIFeedbackService = imported.AIFeedbackService;
    aiFeedbackService = new AIFeedbackService();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSequelize.transaction.mockResolvedValue(mockTransaction);
  });

  describe('submitFeedback', () => {
    it('应该成功提交反馈', async () => {
      const feedbackData = {
        userId: 1,
        conversationId: 'conv_123',
        messageId: 'msg_456',
        rating: 5,
        feedbackType: 'helpful',
        comment: '回答很有帮助',
        tags: ['准确', '详细', '及时'],
        metadata: {
          responseTime: 1200,
          modelUsed: 'gpt-4'
        }
      };

      const mockCreatedFeedback = {
        id: 1,
        ...feedbackData,
        status: 'submitted',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockUser.findByPk.mockResolvedValue({ id: 1, name: '测试用户' });
      mockAIConversation.findByPk.mockResolvedValue({ id: 'conv_123', userId: 1 });
      mockAIFeedback.create.mockResolvedValue(mockCreatedFeedback);

      const result = await aiFeedbackService.submitFeedback(feedbackData);

      expect(mockUser.findByPk).toHaveBeenCalledWith(1);
      expect(mockAIConversation.findByPk).toHaveBeenCalledWith('conv_123');
      expect(mockAIFeedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          conversationId: 'conv_123',
          messageId: 'msg_456',
          rating: 5,
          feedbackType: 'helpful',
          comment: '回答很有帮助',
          tags: ['准确', '详细', '及时'],
          status: 'submitted'
        }),
        { transaction: mockTransaction }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual(mockCreatedFeedback);
    });

    it('应该在用户不存在时抛出错误', async () => {
      const feedbackData = {
        userId: 999,
        conversationId: 'conv_123',
        rating: 5
      };

      mockUser.findByPk.mockResolvedValue(null);

      await expect(aiFeedbackService.submitFeedback(feedbackData))
        .rejects
        .toThrow('用户不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该在对话不存在时抛出错误', async () => {
      const feedbackData = {
        userId: 1,
        conversationId: 'conv_999',
        rating: 5
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockAIConversation.findByPk.mockResolvedValue(null);

      await expect(aiFeedbackService.submitFeedback(feedbackData))
        .rejects
        .toThrow('对话不存在');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('应该验证评分范围', async () => {
      const feedbackData = {
        userId: 1,
        conversationId: 'conv_123',
        rating: 6 // 超出范围
      };

      mockUser.findByPk.mockResolvedValue({ id: 1 });
      mockAIConversation.findByPk.mockResolvedValue({ id: 'conv_123', userId: 1 });

      await expect(aiFeedbackService.submitFeedback(feedbackData))
        .rejects
        .toThrow('评分必须在1-5之间');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });

  describe('getFeedbackById', () => {
    it('应该成功获取反馈详情', async () => {
      const feedbackId = 1;
      const mockFeedback = {
        id: 1,
        userId: 1,
        conversationId: 'conv_123',
        rating: 5,
        feedbackType: 'helpful',
        comment: '回答很有帮助',
        status: 'submitted',
        user: { id: 1, name: '测试用户' },
        conversation: { id: 'conv_123', title: '测试对话' }
      };

      mockAIFeedback.findByPk.mockResolvedValue(mockFeedback);

      const result = await aiFeedbackService.getFeedbackById(feedbackId);

      expect(mockAIFeedback.findByPk).toHaveBeenCalledWith(feedbackId, {
        include: [
          {
            model: mockUser,
            as: 'user',
            attributes: ['id', 'name', 'email']
          },
          {
            model: mockAIConversation,
            as: 'conversation',
            attributes: ['id', 'title', 'createdAt']
          }
        ]
      });
      expect(result).toEqual(mockFeedback);
    });

    it('应该在反馈不存在时抛出错误', async () => {
      const feedbackId = 999;

      mockAIFeedback.findByPk.mockResolvedValue(null);

      await expect(aiFeedbackService.getFeedbackById(feedbackId))
        .rejects
        .toThrow('反馈不存在');
    });
  });

  describe('getFeedbackList', () => {
    it('应该成功获取反馈列表', async () => {
      const options = {
        page: 1,
        pageSize: 10,
        userId: 1,
        rating: 5,
        feedbackType: 'helpful',
        status: 'submitted'
      };

      const mockFeedbacks = [
        {
          id: 1,
          userId: 1,
          rating: 5,
          feedbackType: 'helpful',
          comment: '很有帮助',
          status: 'submitted'
        },
        {
          id: 2,
          userId: 1,
          rating: 4,
          feedbackType: 'helpful',
          comment: '还不错',
          status: 'submitted'
        }
      ];

      mockAIFeedback.findAll.mockResolvedValue(mockFeedbacks);
      mockAIFeedback.count.mockResolvedValue(2);

      const result = await aiFeedbackService.getFeedbackList(options);

      expect(mockAIFeedback.findAll).toHaveBeenCalledWith({
        where: {
          userId: 1,
          rating: 5,
          feedbackType: 'helpful',
          status: 'submitted'
        },
        include: [
          {
            model: mockUser,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: mockAIConversation,
            as: 'conversation',
            attributes: ['id', 'title']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
        offset: 0
      });

      expect(result).toEqual({
        feedbacks: mockFeedbacks,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
    });

    it('应该支持搜索功能', async () => {
      const options = {
        search: '有帮助'
      };

      await aiFeedbackService.getFeedbackList(options);

      expect(mockAIFeedback.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            [mockSequelize.Op.or]: [
              { comment: { [mockSequelize.Op.like]: '%有帮助%' } },
              { tags: { [mockSequelize.Op.like]: '%有帮助%' } }
            ]
          })
        })
      );
    });

    it('应该支持时间范围筛选', async () => {
      const options = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31')
      };

      await aiFeedbackService.getFeedbackList(options);

      expect(mockAIFeedback.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdAt: {
              [mockSequelize.Op.between]: [options.startDate, options.endDate]
            }
          })
        })
      );
    });
  });

  describe('updateFeedbackStatus', () => {
    it('应该成功更新反馈状态', async () => {
      const feedbackId = 1;
      const status = 'reviewed';
      const reviewNote = '已审核，反馈有价值';

      const mockFeedback = {
        id: 1,
        status: 'submitted',
        update: jest.fn().mockResolvedValue(undefined)
      };

      mockAIFeedback.findByPk.mockResolvedValue(mockFeedback);

      const result = await aiFeedbackService.updateFeedbackStatus(feedbackId, status, reviewNote);

      expect(mockAIFeedback.findByPk).toHaveBeenCalledWith(feedbackId);
      expect(mockFeedback.update).toHaveBeenCalledWith({
        status: 'reviewed',
        reviewNote: '已审核，反馈有价值',
        reviewedAt: expect.any(Date)
      });
      expect(result).toBe(true);
    });

    it('应该在反馈不存在时抛出错误', async () => {
      const feedbackId = 999;
      const status = 'reviewed';

      mockAIFeedback.findByPk.mockResolvedValue(null);

      await expect(aiFeedbackService.updateFeedbackStatus(feedbackId, status))
        .rejects
        .toThrow('反馈不存在');
    });
  });

  describe('getFeedbackStats', () => {
    it('应该成功获取反馈统计', async () => {
      const options = {
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        groupBy: 'rating'
      };

      const mockStats = [
        { rating: 5, count: 100, percentage: 50 },
        { rating: 4, count: 60, percentage: 30 },
        { rating: 3, count: 30, percentage: 15 },
        { rating: 2, count: 8, percentage: 4 },
        { rating: 1, count: 2, percentage: 1 }
      ];

      mockAIFeedback.findAll.mockResolvedValue(mockStats);

      const result = await aiFeedbackService.getFeedbackStats(options);

      expect(mockAIFeedback.findAll).toHaveBeenCalledWith({
        where: {
          createdAt: {
            [mockSequelize.Op.between]: [options.timeRange.startDate, options.timeRange.endDate]
          }
        },
        attributes: [
          'rating',
          [mockSequelize.fn('COUNT', '*'), 'count']
        ],
        group: ['rating'],
        order: [['rating', 'DESC']]
      });

      expect(result).toEqual({
        timeRange: options.timeRange,
        groupBy: options.groupBy,
        stats: mockStats,
        summary: expect.objectContaining({
          totalFeedbacks: expect.any(Number),
          averageRating: expect.any(Number),
          satisfactionRate: expect.any(Number)
        })
      });
    });

    it('应该支持按反馈类型分组', async () => {
      const options = {
        groupBy: 'feedbackType'
      };

      await aiFeedbackService.getFeedbackStats(options);

      expect(mockAIFeedback.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          attributes: [
            'feedbackType',
            [mockSequelize.fn('COUNT', '*'), 'count']
          ],
          group: ['feedbackType']
        })
      );
    });
  });

  describe('analyzeFeedbackTrends', () => {
    it('应该成功分析反馈趋势', async () => {
      const options = {
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        interval: 'daily'
      };

      const mockTrends = [
        {
          date: '2024-01-01',
          totalFeedbacks: 10,
          averageRating: 4.2,
          positiveCount: 8,
          negativeCount: 2
        },
        {
          date: '2024-01-02',
          totalFeedbacks: 15,
          averageRating: 4.5,
          positiveCount: 13,
          negativeCount: 2
        }
      ];

      mockAIFeedback.findAll.mockResolvedValue(mockTrends);

      const result = await aiFeedbackService.analyzeFeedbackTrends(options);

      expect(result).toEqual({
        timeRange: options.timeRange,
        interval: options.interval,
        trends: mockTrends,
        insights: expect.objectContaining({
          overallTrend: expect.any(String),
          ratingTrend: expect.any(String),
          volumeTrend: expect.any(String)
        })
      });
    });
  });

  describe('getTopIssues', () => {
    it('应该成功获取主要问题', async () => {
      const options = {
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        minRating: 2, // 只看低评分反馈
        limit: 10
      };

      const mockIssues = [
        {
          issue: '响应速度慢',
          count: 25,
          averageRating: 2.1,
          examples: [
            { comment: '回答太慢了', rating: 2 },
            { comment: '等了很久才有回复', rating: 1 }
          ]
        },
        {
          issue: '回答不准确',
          count: 18,
          averageRating: 2.3,
          examples: [
            { comment: '答案有误', rating: 2 },
            { comment: '信息不正确', rating: 2 }
          ]
        }
      ];

      mockAIFeedback.findAll.mockResolvedValue(mockIssues);

      const result = await aiFeedbackService.getTopIssues(options);

      expect(mockAIFeedback.findAll).toHaveBeenCalledWith({
        where: {
          createdAt: {
            [mockSequelize.Op.between]: [options.timeRange.startDate, options.timeRange.endDate]
          },
          rating: {
            [mockSequelize.Op.lte]: options.minRating
          }
        },
        limit: options.limit
      });

      expect(result).toEqual({
        timeRange: options.timeRange,
        criteria: { minRating: options.minRating },
        issues: mockIssues,
        summary: expect.objectContaining({
          totalIssues: expect.any(Number),
          mostCommonIssue: expect.any(String),
          averageIssueRating: expect.any(Number)
        })
      });
    });
  });

  describe('generateFeedbackReport', () => {
    it('应该成功生成反馈报告', async () => {
      const reportOptions = {
        timeRange: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-01-31')
        },
        includeDetails: true,
        format: 'comprehensive'
      };

      const mockReport = {
        reportId: 'feedback_report_2024_01',
        timeRange: reportOptions.timeRange,
        generatedAt: new Date(),
        summary: {
          totalFeedbacks: 200,
          averageRating: 4.2,
          satisfactionRate: 85,
          responseRate: 60
        },
        ratingDistribution: [
          { rating: 5, count: 80, percentage: 40 },
          { rating: 4, count: 60, percentage: 30 },
          { rating: 3, count: 40, percentage: 20 },
          { rating: 2, count: 16, percentage: 8 },
          { rating: 1, count: 4, percentage: 2 }
        ],
        topPositiveComments: [
          '回答很准确，很有帮助',
          '响应速度很快',
          '解决了我的问题'
        ],
        topIssues: [
          { issue: '响应慢', count: 10 },
          { issue: '答案不准确', count: 8 }
        ],
        trends: {
          ratingTrend: 'improving',
          volumeTrend: 'increasing'
        },
        recommendations: [
          '继续保持高质量回答',
          '优化响应速度',
          '加强答案准确性检查'
        ]
      };

      // Mock各种统计方法
      aiFeedbackService.getFeedbackStats = jest.fn().mockResolvedValue({
        summary: mockReport.summary,
        stats: mockReport.ratingDistribution
      });
      aiFeedbackService.analyzeFeedbackTrends = jest.fn().mockResolvedValue({
        insights: mockReport.trends
      });
      aiFeedbackService.getTopIssues = jest.fn().mockResolvedValue({
        issues: mockReport.topIssues
      });

      const result = await aiFeedbackService.generateFeedbackReport(reportOptions);

      expect(result).toEqual(expect.objectContaining({
        reportId: expect.any(String),
        timeRange: reportOptions.timeRange,
        generatedAt: expect.any(Date),
        summary: expect.any(Object),
        ratingDistribution: expect.any(Array),
        trends: expect.any(Object),
        recommendations: expect.any(Array)
      }));

      if (reportOptions.includeDetails) {
        expect(result.topPositiveComments).toBeDefined();
        expect(result.topIssues).toBeDefined();
      }
    });
  });

  describe('deleteFeedback', () => {
    it('应该成功删除反馈', async () => {
      const feedbackId = 1;

      const mockFeedback = {
        id: 1,
        userId: 1,
        destroy: jest.fn().mockResolvedValue(undefined)
      };

      mockAIFeedback.findByPk.mockResolvedValue(mockFeedback);

      const result = await aiFeedbackService.deleteFeedback(feedbackId);

      expect(mockAIFeedback.findByPk).toHaveBeenCalledWith(feedbackId);
      expect(mockFeedback.destroy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('应该在反馈不存在时抛出错误', async () => {
      const feedbackId = 999;

      mockAIFeedback.findByPk.mockResolvedValue(null);

      await expect(aiFeedbackService.deleteFeedback(feedbackId))
        .rejects
        .toThrow('反馈不存在');
    });
  });

  describe('bulkUpdateStatus', () => {
    it('应该成功批量更新反馈状态', async () => {
      const feedbackIds = [1, 2, 3];
      const status = 'reviewed';
      const reviewNote = '批量审核完成';

      mockAIFeedback.update.mockResolvedValue([3]); // 更新了3条记录

      const result = await aiFeedbackService.bulkUpdateStatus(feedbackIds, status, reviewNote);

      expect(mockAIFeedback.update).toHaveBeenCalledWith(
        {
          status: 'reviewed',
          reviewNote: '批量审核完成',
          reviewedAt: expect.any(Date)
        },
        {
          where: {
            id: {
              [mockSequelize.Op.in]: feedbackIds
            }
          },
          transaction: mockTransaction
        }
      );
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(result).toEqual({
        updatedCount: 3,
        feedbackIds: feedbackIds,
        status: status
      });
    });

    it('应该处理批量更新错误', async () => {
      const feedbackIds = [1, 2, 3];
      const status = 'reviewed';

      mockAIFeedback.update.mockRejectedValue(new Error('批量更新失败'));

      await expect(aiFeedbackService.bulkUpdateStatus(feedbackIds, status))
        .rejects
        .toThrow('批量更新失败');

      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
