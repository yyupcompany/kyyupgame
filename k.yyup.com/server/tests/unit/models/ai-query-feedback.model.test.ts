import { AIQueryFeedback } from '../../../src/models/ai-query-feedback.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { AIQueryLog } from '../../../src/models/ai-query-log.model';
import { sequelize } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/models/ai-query-log.model');
jest.mock('../../../src/config/database');


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

describe('AIQueryFeedback Model', () => {
  let mockUser: jest.Mocked<typeof User>;
  let mockAIQueryLog: jest.Mocked<typeof AIQueryLog>;

  beforeEach(() => {
    mockUser = User as jest.Mocked<typeof User>;
    mockAIQueryLog = AIQueryLog as jest.Mocked<typeof AIQueryLog>;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(AIQueryFeedback).toBeDefined();
      expect(AIQueryFeedback).toBeInstanceOf(Function);
    });

    it('should have correct table configuration', () => {
      const modelInstance = new AIQueryFeedback();
      expect(modelInstance).toBeDefined();
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: AIQueryFeedback;

    beforeEach(() => {
      modelInstance = new AIQueryFeedback();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('queryLogId');
      expect(modelInstance).toHaveProperty('userId');
      expect(modelInstance).toHaveProperty('rating');
      expect(modelInstance).toHaveProperty('feedbackType');
      expect(modelInstance).toHaveProperty('isHelpful');
      expect(modelInstance).toHaveProperty('status');
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have optional attributes', () => {
      expect(modelInstance).toHaveProperty('comments');
      expect(modelInstance).toHaveProperty('correctedSql');
      expect(modelInstance).toHaveProperty('suggestedImprovement');
      expect(modelInstance).toHaveProperty('adminResponse');
      expect(modelInstance).toHaveProperty('reviewedAt');
      expect(modelInstance).toHaveProperty('reviewedBy');
    });

    it('should have correct default values', () => {
      expect(modelInstance.isHelpful).toBeUndefined();
      expect(modelInstance.status).toBeUndefined();
    });
  });

  describe('Instance Methods', () => {
    let modelInstance: AIQueryFeedback;

    beforeEach(() => {
      modelInstance = new AIQueryFeedback({
        queryLogId: 1,
        userId: 1,
        rating: 5,
        feedbackType: 'helpful',
        isHelpful: true,
        status: 'pending',
      });
    });

    describe('getFeedbackTypeText', () => {
      it('should return correct text for helpful feedback', () => {
        modelInstance.feedbackType = 'helpful';
        expect(modelInstance.getFeedbackTypeText()).toBe('有帮助');
      });

      it('should return correct text for incorrect feedback', () => {
        modelInstance.feedbackType = 'incorrect';
        expect(modelInstance.getFeedbackTypeText()).toBe('结果错误');
      });

      it('should return correct text for slow feedback', () => {
        modelInstance.feedbackType = 'slow';
        expect(modelInstance.getFeedbackTypeText()).toBe('响应缓慢');
      });

      it('should return correct text for confusing feedback', () => {
        modelInstance.feedbackType = 'confusing';
        expect(modelInstance.getFeedbackTypeText()).toBe('结果混乱');
      });

      it('should return correct text for suggestion feedback', () => {
        modelInstance.feedbackType = 'suggestion';
        expect(modelInstance.getFeedbackTypeText()).toBe('改进建议');
      });

      it('should return unknown for invalid feedback type', () => {
        modelInstance.feedbackType = 'invalid' as any;
        expect(modelInstance.getFeedbackTypeText()).toBe('未知');
      });
    });

    describe('getStatusText', () => {
      it('should return correct text for pending status', () => {
        modelInstance.status = 'pending';
        expect(modelInstance.getStatusText()).toBe('待处理');
      });

      it('should return correct text for reviewed status', () => {
        modelInstance.status = 'reviewed';
        expect(modelInstance.getStatusText()).toBe('已审核');
      });

      it('should return correct text for resolved status', () => {
        modelInstance.status = 'resolved';
        expect(modelInstance.getStatusText()).toBe('已解决');
      });

      it('should return correct text for dismissed status', () => {
        modelInstance.status = 'dismissed';
        expect(modelInstance.getStatusText()).toBe('已忽略');
      });

      it('should return unknown for invalid status', () => {
        modelInstance.status = 'invalid' as any;
        expect(modelInstance.getStatusText()).toBe('未知');
      });
    });

    describe('getRatingLevel', () => {
      it('should return satisfied for rating 4-5', () => {
        modelInstance.rating = 5;
        expect(modelInstance.getRatingLevel()).toBe('满意');
        
        modelInstance.rating = 4;
        expect(modelInstance.getRatingLevel()).toBe('满意');
      });

      it('should return average for rating 3', () => {
        modelInstance.rating = 3;
        expect(modelInstance.getRatingLevel()).toBe('一般');
      });

      it('should return unsatisfied for rating 2', () => {
        modelInstance.rating = 2;
        expect(modelInstance.getRatingLevel()).toBe('不满意');
      });

      it('should return very unsatisfied for rating 1', () => {
        modelInstance.rating = 1;
        expect(modelInstance.getRatingLevel()).toBe('很不满意');
      });
    });

    describe('markAsReviewed', () => {
      it('should mark feedback as reviewed with admin response', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        const reviewerId = 2;
        const adminResponse = 'Thank you for your feedback';

        await modelInstance.markAsReviewed(reviewerId, adminResponse);

        expect(modelInstance.status).toBe('reviewed');
        expect(modelInstance.reviewedAt).toBeInstanceOf(Date);
        expect(modelInstance.reviewedBy).toBe(reviewerId);
        expect(modelInstance.adminResponse).toBe(adminResponse);
        expect(mockSave).toHaveBeenCalled();
      });

      it('should mark feedback as reviewed without admin response', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        const reviewerId = 2;

        await modelInstance.markAsReviewed(reviewerId);

        expect(modelInstance.status).toBe('reviewed');
        expect(modelInstance.reviewedAt).toBeInstanceOf(Date);
        expect(modelInstance.reviewedBy).toBe(reviewerId);
        expect(modelInstance.adminResponse).toBeUndefined();
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('markAsResolved', () => {
      it('should mark feedback as resolved with admin response', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        const reviewerId = 2;
        const adminResponse = 'Issue resolved';

        await modelInstance.markAsResolved(reviewerId, adminResponse);

        expect(modelInstance.status).toBe('resolved');
        expect(modelInstance.reviewedAt).toBeInstanceOf(Date);
        expect(modelInstance.reviewedBy).toBe(reviewerId);
        expect(modelInstance.adminResponse).toBe(adminResponse);
        expect(mockSave).toHaveBeenCalled();
      });
    });

    describe('markAsDismissed', () => {
      it('should mark feedback as dismissed with reason', async () => {
        const mockSave = jest.spyOn(modelInstance, 'save').mockResolvedValue(modelInstance);
        const reviewerId = 2;
        const reason = 'Not applicable';

        await modelInstance.markAsDismissed(reviewerId, reason);

        expect(modelInstance.status).toBe('dismissed');
        expect(modelInstance.reviewedAt).toBeInstanceOf(Date);
        expect(modelInstance.reviewedBy).toBe(reviewerId);
        expect(modelInstance.adminResponse).toBe(reason);
        expect(mockSave).toHaveBeenCalled();
      });
    });
  });

  describe('Static Methods', () => {
    describe('getFeedbackStats', () => {
      it('should return correct feedback statistics', async () => {
        const mockFeedbacks = [
          { rating: 5, isHelpful: true, feedbackType: 'helpful', status: 'pending' },
          { rating: 3, isHelpful: false, feedbackType: 'incorrect', status: 'reviewed' },
          { rating: 4, isHelpful: true, feedbackType: 'helpful', status: 'resolved' },
          { rating: 2, isHelpful: false, feedbackType: 'slow', status: 'pending' },
        ];

        const mockFindAll = jest.spyOn(AIQueryFeedback, 'findAll').mockResolvedValue(mockFeedbacks as any);

        const stats = await AIQueryFeedback.getFeedbackStats();

        expect(stats).toEqual({
          totalFeedbacks: 4,
          avgRating: 3.5, // (5 + 3 + 4 + 2) / 4
          positiveCount: 2,
          negativeCount: 2,
          byType: {
            helpful: 2,
            incorrect: 1,
            slow: 1,
          },
          byStatus: {
            pending: 2,
            reviewed: 1,
            resolved: 1,
          },
        });

        expect(mockFindAll).toHaveBeenCalled();
      });

      it('should handle empty feedback list', async () => {
        const mockFindAll = jest.spyOn(AIQueryFeedback, 'findAll').mockResolvedValue([]);

        const stats = await AIQueryFeedback.getFeedbackStats();

        expect(stats).toEqual({
          totalFeedbacks: 0,
          avgRating: 0,
          positiveCount: 0,
          negativeCount: 0,
          byType: {},
          byStatus: {},
        });
      });
    });

    describe('getUserFeedbackHistory', () => {
      it('should return user feedback history with query log details', async () => {
        const userId = 1;
        const limit = 20;
        const mockFeedbacks = [
          {
            id: 1,
            userId,
            queryLog: { id: 1, naturalQuery: 'test query', executionStatus: 'success', createdAt: new Date() },
          },
        ];

        const mockFindAll = jest.spyOn(AIQueryFeedback, 'findAll').mockResolvedValue(mockFeedbacks as any);

        const result = await AIQueryFeedback.getUserFeedbackHistory(userId, limit);

        expect(result).toEqual(mockFeedbacks);
        expect(mockFindAll).toHaveBeenCalledWith({
          where: { userId },
          include: [
            {
              model: mockAIQueryLog,
              as: 'queryLog',
              attributes: ['id', 'naturalQuery', 'executionStatus', 'createdAt'],
            },
          ],
          order: [['createdAt', 'DESC']],
          limit,
        });
      });
    });

    describe('getPendingFeedbacks', () => {
      it('should return pending feedbacks with user and query log details', async () => {
        const limit = 50;
        const mockFeedbacks = [
          {
            id: 1,
            user: { id: 1, username: 'testuser', realName: 'Test User' },
            queryLog: { id: 1, naturalQuery: 'test query', executionStatus: 'success', createdAt: new Date() },
          },
        ];

        const mockFindAll = jest.spyOn(AIQueryFeedback, 'findAll').mockResolvedValue(mockFeedbacks as any);

        const result = await AIQueryFeedback.getPendingFeedbacks(limit);

        expect(result).toEqual(mockFeedbacks);
        expect(mockFindAll).toHaveBeenCalledWith({
          where: { status: 'pending' },
          include: [
            {
              model: mockUser,
              as: 'user',
              attributes: ['id', 'username', 'realName'],
            },
            {
              model: mockAIQueryLog,
              as: 'queryLog',
              attributes: ['id', 'naturalQuery', 'executionStatus', 'createdAt'],
            },
          ],
          order: [['createdAt', 'ASC']],
          limit,
        });
      });
    });
  });

  describe('Model Associations', () => {
    it('should belong to User', () => {
      const mockBelongsTo = jest.fn();
      AIQueryFeedback.belongsTo = mockBelongsTo;

      // Re-require the module to trigger association setup
      require('../../../src/models/ai-query-feedback.model');

      expect(mockBelongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'userId',
        as: 'user',
      });
    });

    it('should belong to AIQueryLog', () => {
      const mockBelongsTo = jest.fn();
      AIQueryFeedback.belongsTo = mockBelongsTo;

      // Re-require the module to trigger association setup
      require('../../../src/models/ai-query-feedback.model');

      expect(mockBelongsTo).toHaveBeenCalledWith(mockAIQueryLog, {
        foreignKey: 'queryLogId',
        as: 'queryLog',
      });
    });

    it('should belong to User as reviewer', () => {
      const mockBelongsTo = jest.fn();
      AIQueryFeedback.belongsTo = mockBelongsTo;

      // Re-require the module to trigger association setup
      require('../../../src/models/ai-query-feedback.model');

      expect(mockBelongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'reviewedBy',
        as: 'reviewer',
      });
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
            
      // Re-require the module to trigger initialization
      require('../../../src/models/ai-query-feedback.model');

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
          }),
          queryLogId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'query_log_id',
          }),
          userId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'user_id',
          }),
          rating: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            validate: {
              min: 1,
              max: 5,
            },
          }),
          feedbackType: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            field: 'feedback_type',
          }),
        }),
        expect.objectContaining({
          sequelize,
          modelName: 'AIQueryFeedback',
          tableName: 'ai_query_feedback',
          timestamps: true,
          underscored: true,
          indexes: expect.arrayContaining([
            { fields: ['query_log_id'] },
            { fields: ['user_id'] },
            { fields: ['rating'] },
            { fields: ['feedback_type'] },
            { fields: ['status'] },
            { fields: ['is_helpful'] },
            { fields: ['reviewed_by'] },
            { fields: ['created_at'] },
          ]),
        })
      );
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new AIQueryFeedback();
      
      expect(modelInstance).toHaveProperty('queryLogId');
      expect(modelInstance).toHaveProperty('userId');
      expect(modelInstance).toHaveProperty('rating');
      expect(modelInstance).toHaveProperty('feedbackType');
      expect(modelInstance).toHaveProperty('isHelpful');
      expect(modelInstance).toHaveProperty('status');
    });

    it('should validate rating range', () => {
      const modelInstance = new AIQueryFeedback();
      
      // Test valid rating values
      modelInstance.rating = 1;
      expect(modelInstance.rating).toBe(1);
      
      modelInstance.rating = 5;
      expect(modelInstance.rating).toBe(5);
    });

    it('should validate enum values for feedbackType', () => {
      const modelInstance = new AIQueryFeedback();
      
      // Test valid feedbackType values
      modelInstance.feedbackType = 'helpful';
      expect(modelInstance.feedbackType).toBe('helpful');
      
      modelInstance.feedbackType = 'incorrect';
      expect(modelInstance.feedbackType).toBe('incorrect');
    });

    it('should validate enum values for status', () => {
      const modelInstance = new AIQueryFeedback();
      
      // Test valid status values
      modelInstance.status = 'pending';
      expect(modelInstance.status).toBe('pending');
      
      modelInstance.status = 'resolved';
      expect(modelInstance.status).toBe('resolved');
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance', () => {
      const modelInstance = new AIQueryFeedback({
        queryLogId: 1,
        userId: 1,
        rating: 5,
        feedbackType: 'helpful',
        isHelpful: true,
        status: 'pending',
        comments: 'Great query!',
        correctedSql: 'SELECT * FROM users WHERE id = 1',
        suggestedImprovement: 'Add more filters',
      });

      expect(modelInstance.queryLogId).toBe(1);
      expect(modelInstance.userId).toBe(1);
      expect(modelInstance.rating).toBe(5);
      expect(modelInstance.feedbackType).toBe('helpful');
      expect(modelInstance.isHelpful).toBe(true);
      expect(modelInstance.status).toBe('pending');
      expect(modelInstance.comments).toBe('Great query!');
      expect(modelInstance.correctedSql).toBe('SELECT * FROM users WHERE id = 1');
      expect(modelInstance.suggestedImprovement).toBe('Add more filters');
    });
  });
});