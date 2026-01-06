import { Sequelize, DataTypes } from 'sequelize';
import { vi } from 'vitest'
import { initAIFeedback, initAIFeedbackAssociations, AIFeedback, FeedbackType, FeedbackSource, FeedbackStatus } from '../../../src/models/ai-feedback.model';


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

describe('AIFeedback Model', () => {
  let sequelize: Sequelize;

  beforeAll(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
      logging: false,
    });
    
    // 初始化模型
    initAIFeedback(sequelize);
    
    // 同步数据库
    await sequelize.sync({ force: true });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  beforeEach(async () => {
    await AIFeedback.destroy({ where: {} });
  });

  describe('Model Definition', () => {
    it('should have the correct model name', () => {
      expect(AIFeedback.tableName).toBe('ai_feedbacks');
    });

    it('should have all required attributes', () => {
      const attributes = Object.keys(AIFeedback.getAttributes());
      const requiredAttributes = [
        'id', 'userId', 'feedbackType', 'sourceType', 'sourceId', 'content',
        'rating', 'status', 'adminNotes', 'createdAt', 'updatedAt'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });

    it('should have correct field configurations', () => {
      const model = AIFeedback.getAttributes();
      
      // 检查主键
      expect(model.id.primaryKey).toBe(true);
      expect(model.id.autoIncrement).toBe(true);
      
      // 检查必需字段
      expect(model.userId.allowNull).toBe(false);
      expect(model.feedbackType.allowNull).toBe(false);
      expect(model.sourceType.allowNull).toBe(false);
      expect(model.content.allowNull).toBe(false);
      
      // 检查可选字段
      expect(model.sourceId.allowNull).toBe(true);
      expect(model.rating.allowNull).toBe(true);
      expect(model.adminNotes.allowNull).toBe(true);
      
      // 检查默认值
      expect(model.status.defaultValue).toBe(FeedbackStatus.PENDING);
      expect(model.createdAt.defaultValue).toBeDefined();
      expect(model.updatedAt.defaultValue).toBeDefined();
    });

    it('should have correct field types', () => {
      const model = AIFeedback.getAttributes();
      
      expect(model.id.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.userId.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.feedbackType.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.sourceType.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.sourceId.type).toBeInstanceOf(DataTypes.STRING);
      expect(model.content.type).toBeInstanceOf(DataTypes.TEXT);
      expect(model.rating.type).toBeInstanceOf(DataTypes.INTEGER);
      expect(model.status.type).toBeInstanceOf(DataTypes.ENUM);
      expect(model.adminNotes.type).toBeInstanceOf(DataTypes.TEXT);
    });

    it('should have correct field constraints', () => {
      const model = AIFeedback.getAttributes();
      
      // 检查字符串长度限制
      expect(model.sourceId.type.toString()).toContain('64');
      
      // 检查评分验证
      expect(model.rating.validate).toBeDefined();
      expect(model.rating.validate.min).toBe(1);
      expect(model.rating.validate.max).toBe(5);
    });
  });

  describe('Model Options', () => {
    it('should have correct table options', () => {
      const options = AIFeedback.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.paranoid).toBeUndefined(); // 没有软删除
      expect(options.underscored).toBe(true);
    });

    it('should have correct indexes', () => {
      const options = AIFeedback.options;
      
      expect(options.indexes).toBeDefined();
      expect(options.indexes).toHaveLength(3);
      
      // 检查索引配置
      const indexFields = options.indexes.map((index: any) => index.fields);
      expect(indexFields).toContainEqual(['user_id']);
      expect(indexFields).toContainEqual(['status']);
      expect(indexFields).toContainEqual(['source_type', 'source_id']);
    });

    it('should have correct timestamp fields', () => {
      const attributes = AIFeedback.getAttributes();
      
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
      expect(attributes.deletedAt).toBeUndefined(); // 没有软删除
    });
  });

  describe('Enum Values', () => {
    it('should have correct FeedbackType enum values', () => {
      expect(FeedbackType.GENERAL).toBe('general');
      expect(FeedbackType.RESPONSE).toBe('response');
      expect(FeedbackType.SUGGESTION).toBe('suggestion');
      expect(FeedbackType.BUG).toBe('bug');
      expect(FeedbackType.FEATURE).toBe('feature');
    });

    it('should have correct FeedbackSource enum values', () => {
      expect(FeedbackSource.CONVERSATION).toBe('conversation');
      expect(FeedbackSource.MESSAGE).toBe('message');
      expect(FeedbackSource.APPLICATION).toBe('application');
      expect(FeedbackSource.SYSTEM).toBe('system');
    });

    it('should have correct FeedbackStatus enum values', () => {
      expect(FeedbackStatus.PENDING).toBe('pending');
      expect(FeedbackStatus.REVIEWED).toBe('reviewed');
      expect(FeedbackStatus.RESOLVED).toBe('resolved');
      expect(FeedbackStatus.IGNORED).toBe('ignored');
    });
  });

  describe('Model Creation', () => {
    it('should create a new feedback with valid data', async () => {
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        sourceId: 'conv-12345-abcde',
        content: '希望能增加更多的模型选择',
        rating: 4,
        status: FeedbackStatus.PENDING,
        adminNotes: null,
      };

      const feedback = await AIFeedback.create(feedbackData);

      expect(feedback.id).toBeDefined();
      expect(feedback.userId).toBe(feedbackData.userId);
      expect(feedback.feedbackType).toBe(feedbackData.feedbackType);
      expect(feedback.sourceType).toBe(feedbackData.sourceType);
      expect(feedback.sourceId).toBe(feedbackData.sourceId);
      expect(feedback.content).toBe(feedbackData.content);
      expect(feedback.rating).toBe(feedbackData.rating);
      expect(feedback.status).toBe(feedbackData.status);
      expect(feedback.adminNotes).toBe(feedbackData.adminNotes);
      expect(feedback.createdAt).toBeDefined();
      expect(feedback.updatedAt).toBeDefined();
    });

    it('should create feedback with default values', async () => {
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        content: '系统出现了一个错误',
      };

      const feedback = await AIFeedback.create(feedbackData);

      expect(feedback.id).toBeDefined();
      expect(feedback.userId).toBe(feedbackData.userId);
      expect(feedback.feedbackType).toBe(feedbackData.feedbackType);
      expect(feedback.sourceType).toBe(feedbackData.sourceType);
      expect(feedback.content).toBe(feedbackData.content);
      expect(feedback.sourceId).toBeNull();
      expect(feedback.rating).toBeNull();
      expect(feedback.status).toBe(FeedbackStatus.PENDING);
      expect(feedback.adminNotes).toBeNull();
      expect(feedback.createdAt).toBeDefined();
      expect(feedback.updatedAt).toBeDefined();
    });

    it('should create feedback with all enum types', async () => {
      const feedbackTypes = Object.values(FeedbackType);
      const sourceTypes = Object.values(FeedbackSource);
      
      for (const feedbackType of feedbackTypes) {
        for (const sourceType of sourceTypes) {
          const feedbackData = {
            userId: 1001,
            feedbackType,
            sourceType,
            content: `Test ${feedbackType} feedback from ${sourceType}`,
          };

          const feedback = await AIFeedback.create(feedbackData);
          expect(feedback.feedbackType).toBe(feedbackType);
          expect(feedback.sourceType).toBe(sourceType);
        }
      }
    });

    it('should fail to create feedback without required fields', async () => {
      const invalidData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        // 缺少 sourceType, content
      };

      await expect(AIFeedback.create(invalidData as any)).rejects.toThrow();
    });

    it('should fail to create feedback with invalid enum values', async () => {
      const invalidData = {
        userId: 1001,
        feedbackType: 'invalid_type' as any,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      await expect(AIFeedback.create(invalidData)).rejects.toThrow();
    });
  });

  describe('Field Validation', () => {
    it('should validate feedbackType field', async () => {
      const validData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      // 测试所有有效枚举值
      for (const feedbackType of Object.values(FeedbackType)) {
        const data = { ...validData, feedbackType };
        await expect(AIFeedback.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, feedbackType: 'invalid_type' };
      await expect(AIFeedback.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate sourceType field', async () => {
      const validData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      // 测试所有有效枚举值
      for (const sourceType of Object.values(FeedbackSource)) {
        const data = { ...validData, sourceType };
        await expect(AIFeedback.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, sourceType: 'invalid_source' };
      await expect(AIFeedback.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate rating field', async () => {
      const validData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      // 测试有效评分值
      for (const rating of [1, 2, 3, 4, 5]) {
        const data = { ...validData, rating };
        await expect(AIFeedback.create(data)).resolves.toBeDefined();
      }

      // 测试无效评分值
      const invalidRatings = [0, 6, -1, 10];
      for (const rating of invalidRatings) {
        const invalidData = { ...validData, rating };
        await expect(AIFeedback.create(invalidData as any)).rejects.toThrow();
      }
    });

    it('should validate status field', async () => {
      const validData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      // 测试所有有效枚举值
      for (const status of Object.values(FeedbackStatus)) {
        const data = { ...validData, status };
        await expect(AIFeedback.create(data)).resolves.toBeDefined();
      }

      // 测试无效值
      const invalidData = { ...validData, status: 'invalid_status' };
      await expect(AIFeedback.create(invalidData as any)).rejects.toThrow();
    });

    it('should validate sourceId length', async () => {
      const validData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      // 测试有效长度
      const validSourceId = 'a'.repeat(64);
      const validLengthData = { ...validData, sourceId: validSourceId };
      await expect(AIFeedback.create(validLengthData)).resolves.toBeDefined();

      // 测试超长字符串
      const invalidSourceId = 'a'.repeat(65);
      const invalidLengthData = { ...validData, sourceId: invalidSourceId };
      await expect(AIFeedback.create(invalidLengthData as any)).rejects.toThrow();
    });

    it('should validate content field is not empty', async () => {
      const validData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      // 测试有效内容
      await expect(AIFeedback.create(validData)).resolves.toBeDefined();

      // 测试空内容
      const invalidData = { ...validData, content: '' };
      await expect(AIFeedback.create(invalidData as any)).rejects.toThrow();

      // 测试空白内容
      const whitespaceData = { ...validData, content: '   ' };
      await expect(AIFeedback.create(whitespaceData as any)).rejects.toThrow();
    });
  });

  describe('Model Operations', () => {
    it('should find feedback by id', async () => {
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      const created = await AIFeedback.create(feedbackData);
      const found = await AIFeedback.findByPk(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.userId).toBe(feedbackData.userId);
      expect(found?.content).toBe(feedbackData.content);
    });

    it('should update feedback', async () => {
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        content: 'Original feedback',
        status: FeedbackStatus.PENDING,
      };

      const feedback = await AIFeedback.create(feedbackData);
      
      await feedback.update({
        status: FeedbackStatus.REVIEWED,
        adminNotes: 'Reviewed by admin',
        rating: 3,
      });

      const updated = await AIFeedback.findByPk(feedback.id);
      
      expect(updated?.status).toBe(FeedbackStatus.REVIEWED);
      expect(updated?.adminNotes).toBe('Reviewed by admin');
      expect(updated?.rating).toBe(3);
      expect(updated?.content).toBe(feedbackData.content); // 未修改的字段保持不变
    });

    it('should delete feedback (hard delete)', async () => {
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      };

      const feedback = await AIFeedback.create(feedbackData);
      
      await feedback.destroy();

      const deleted = await AIFeedback.findByPk(feedback.id);
      expect(deleted).toBeNull();
    });

    it('should list all feedbacks', async () => {
      const feedbackData1 = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Suggestion feedback',
      };

      const feedbackData2 = {
        userId: 1001,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        content: 'Bug report',
      };

      await AIFeedback.create(feedbackData1);
      await AIFeedback.create(feedbackData2);

      const feedbacks = await AIFeedback.findAll();
      
      expect(feedbacks).toHaveLength(2);
      expect(feedbacks[0].feedbackType).toBe(FeedbackType.SUGGESTION);
      expect(feedbacks[1].feedbackType).toBe(FeedbackType.BUG);
    });

    it('should update timestamps automatically', async () => {
      const feedback = await AIFeedback.create({
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
      });

      const originalUpdatedAt = feedback.updatedAt;
      
      // 等待一小段时间
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await feedback.update({
        status: FeedbackStatus.REVIEWED,
      });

      const updated = await AIFeedback.findByPk(feedback.id);
      
      expect(updated?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
    });
  });

  describe('Query Operations', () => {
    it('should filter feedbacks by userId', async () => {
      const feedbackData1 = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'User 1 feedback',
      };

      const feedbackData2 = {
        userId: 1002,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        content: 'User 2 feedback',
      };

      await AIFeedback.create(feedbackData1);
      await AIFeedback.create(feedbackData2);

      const user1Feedbacks = await AIFeedback.findAll({
        where: { userId: 1001 }
      });
      
      expect(user1Feedbacks).toHaveLength(1);
      expect(user1Feedbacks[0].userId).toBe(1001);
      expect(user1Feedbacks[0].content).toBe('User 1 feedback');

      const user2Feedbacks = await AIFeedback.findAll({
        where: { userId: 1002 }
      });
      
      expect(user2Feedbacks).toHaveLength(1);
      expect(user2Feedbacks[0].userId).toBe(1002);
      expect(user2Feedbacks[0].content).toBe('User 2 feedback');
    });

    it('should filter feedbacks by feedbackType', async () => {
      const feedbackData1 = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Suggestion feedback',
      };

      const feedbackData2 = {
        userId: 1001,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        content: 'Bug report',
      };

      const feedbackData3 = {
        userId: 1001,
        feedbackType: FeedbackType.FEATURE,
        sourceType: FeedbackSource.APPLICATION,
        content: 'Feature request',
      };

      await AIFeedback.create(feedbackData1);
      await AIFeedback.create(feedbackData2);
      await AIFeedback.create(feedbackData3);

      const suggestionFeedbacks = await AIFeedback.findAll({
        where: { feedbackType: FeedbackType.SUGGESTION }
      });
      
      expect(suggestionFeedbacks).toHaveLength(1);
      expect(suggestionFeedbacks[0].feedbackType).toBe(FeedbackType.SUGGESTION);

      const bugFeedbacks = await AIFeedback.findAll({
        where: { feedbackType: FeedbackType.BUG }
      });
      
      expect(bugFeedbacks).toHaveLength(1);
      expect(bugFeedbacks[0].feedbackType).toBe(FeedbackType.BUG);

      const featureFeedbacks = await AIFeedback.findAll({
        where: { feedbackType: FeedbackType.FEATURE }
      });
      
      expect(featureFeedbacks).toHaveLength(1);
      expect(featureFeedbacks[0].feedbackType).toBe(FeedbackType.FEATURE);
    });

    it('should filter feedbacks by status', async () => {
      const feedbackData1 = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Pending feedback',
        status: FeedbackStatus.PENDING,
      };

      const feedbackData2 = {
        userId: 1001,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        content: 'Reviewed feedback',
        status: FeedbackStatus.REVIEWED,
      };

      const feedbackData3 = {
        userId: 1001,
        feedbackType: FeedbackType.FEATURE,
        sourceType: FeedbackSource.APPLICATION,
        content: 'Resolved feedback',
        status: FeedbackStatus.RESOLVED,
      };

      await AIFeedback.create(feedbackData1);
      await AIFeedback.create(feedbackData2);
      await AIFeedback.create(feedbackData3);

      const pendingFeedbacks = await AIFeedback.findAll({
        where: { status: FeedbackStatus.PENDING }
      });
      
      expect(pendingFeedbacks).toHaveLength(1);
      expect(pendingFeedbacks[0].status).toBe(FeedbackStatus.PENDING);

      const reviewedFeedbacks = await AIFeedback.findAll({
        where: { status: FeedbackStatus.REVIEWED }
      });
      
      expect(reviewedFeedbacks).toHaveLength(1);
      expect(reviewedFeedbacks[0].status).toBe(FeedbackStatus.REVIEWED);

      const resolvedFeedbacks = await AIFeedback.findAll({
        where: { status: FeedbackStatus.RESOLVED }
      });
      
      expect(resolvedFeedbacks).toHaveLength(1);
      expect(resolvedFeedbacks[0].status).toBe(FeedbackStatus.RESOLVED);
    });

    it('should filter feedbacks by sourceType and sourceId', async () => {
      const feedbackData1 = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        sourceId: 'conv-12345',
        content: 'Conversation feedback',
      };

      const feedbackData2 = {
        userId: 1001,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        sourceId: 'msg-67890',
        content: 'Message feedback',
      };

      const feedbackData3 = {
        userId: 1001,
        feedbackType: FeedbackType.FEATURE,
        sourceType: FeedbackSource.CONVERSATION,
        sourceId: 'conv-12345',
        content: 'Another conversation feedback',
      };

      await AIFeedback.create(feedbackData1);
      await AIFeedback.create(feedbackData2);
      await AIFeedback.create(feedbackData3);

      const conversationFeedbacks = await AIFeedback.findAll({
        where: { 
          sourceType: FeedbackSource.CONVERSATION,
          sourceId: 'conv-12345'
        }
      });
      
      expect(conversationFeedbacks).toHaveLength(2);
      expect(conversationFeedbacks.every(f => f.sourceType === FeedbackSource.CONVERSATION)).toBe(true);
      expect(conversationFeedbacks.every(f => f.sourceId === 'conv-12345')).toBe(true);

      const messageFeedbacks = await AIFeedback.findAll({
        where: { 
          sourceType: FeedbackSource.MESSAGE,
          sourceId: 'msg-67890'
        }
      });
      
      expect(messageFeedbacks).toHaveLength(1);
      expect(messageFeedbacks[0].sourceType).toBe(FeedbackSource.MESSAGE);
      expect(messageFeedbacks[0].sourceId).toBe('msg-67890');
    });

    it('should search feedbacks by content', async () => {
      const feedbackData1 = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: '希望能增加更多的模型选择',
      };

      const feedbackData2 = {
        userId: 1001,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        content: '系统出现了一个严重的错误',
      };

      const feedbackData3 = {
        userId: 1001,
        feedbackType: FeedbackType.FEATURE,
        sourceType: FeedbackSource.APPLICATION,
        content: '建议添加更多的功能',
      };

      await AIFeedback.create(feedbackData1);
      await AIFeedback.create(feedbackData2);
      await AIFeedback.create(feedbackData3);

      const modelFeedbacks = await AIFeedback.findAll({
        where: {
          content: { [Sequelize.Op.like]: '%模型%' }
        }
      });
      
      expect(modelFeedbacks).toHaveLength(1);
      expect(modelFeedbacks[0].content).toBe('希望能增加更多的模型选择');

      const errorFeedbacks = await AIFeedback.findAll({
        where: {
          content: { [Sequelize.Op.like]: '%错误%' }
        }
      });
      
      expect(errorFeedbacks).toHaveLength(1);
      expect(errorFeedbacks[0].content).toBe('系统出现了一个严重的错误');

      const featureFeedbacks = await AIFeedback.findAll({
        where: {
          content: { [Sequelize.Op.like]: '%功能%' }
        }
      });
      
      expect(featureFeedbacks).toHaveLength(1);
      expect(featureFeedbacks[0].content).toBe('建议添加更多的功能');
    });

    it('should filter feedbacks by rating', async () => {
      const feedbackData1 = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Excellent feedback',
        rating: 5,
      };

      const feedbackData2 = {
        userId: 1001,
        feedbackType: FeedbackType.BUG,
        sourceType: FeedbackSource.MESSAGE,
        content: 'Good feedback',
        rating: 4,
      };

      const feedbackData3 = {
        userId: 1001,
        feedbackType: FeedbackType.FEATURE,
        sourceType: FeedbackSource.APPLICATION,
        content: 'Poor feedback',
        rating: 1,
      };

      await AIFeedback.create(feedbackData1);
      await AIFeedback.create(feedbackData2);
      await AIFeedback.create(feedbackData3);

      const highRatedFeedbacks = await AIFeedback.findAll({
        where: { 
          rating: { [Sequelize.Op.gte]: 4 }
        }
      });
      
      expect(highRatedFeedbacks).toHaveLength(2);
      expect(highRatedFeedbacks.every(f => f.rating! >= 4)).toBe(true);

      const lowRatedFeedbacks = await AIFeedback.findAll({
        where: { 
          rating: { [Sequelize.Op.lte]: 2 }
        }
      });
      
      expect(lowRatedFeedbacks).toHaveLength(1);
      expect(lowRatedFeedbacks[0].rating).toBe(1);

      const unratedFeedbacks = await AIFeedback.findAll({
        where: { 
          rating: null
        }
      });
      
      expect(unratedFeedbacks).toHaveLength(0);
    });
  });

  describe('Model Associations', () => {
    it('should have no associations defined', () => {
      initAIFeedbackAssociations();

      // 验证没有定义关联关系
      const associations = AIFeedback.associations;
      expect(Object.keys(associations)).toHaveLength(0);
    });

    it('should handle association initialization without errors', () => {
      // 确保关联初始化不会抛出错误
      expect(() => {
        initAIFeedbackAssociations();
      }).not.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long content', async () => {
      const longContent = 'A'.repeat(10000); // 很长的反馈内容
      
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: longContent,
      };

      const feedback = await AIFeedback.create(feedbackData);
      
      expect(feedback.content).toBe(longContent);
    });

    it('should handle special characters in content', async () => {
      const specialContent = '反馈内容包含特殊字符：中文、English、🚀、123、!@#$%^&*()';
      
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: specialContent,
      };

      const feedback = await AIFeedback.create(feedbackData);
      
      expect(feedback.content).toBe(specialContent);
    });

    it('should handle null adminNotes', async () => {
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
        adminNotes: null,
      };

      const feedback = await AIFeedback.create(feedbackData);
      
      expect(feedback.adminNotes).toBeNull();
    });

    it('should handle empty adminNotes', async () => {
      const feedbackData = {
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Test feedback',
        adminNotes: '',
      };

      const feedback = await AIFeedback.create(feedbackData);
      
      expect(feedback.adminNotes).toBe('');
    });

    it('should handle concurrent updates', async () => {
      const feedback = await AIFeedback.create({
        userId: 1001,
        feedbackType: FeedbackType.SUGGESTION,
        sourceType: FeedbackSource.CONVERSATION,
        content: 'Concurrent test feedback',
        status: FeedbackStatus.PENDING,
      });

      // 并发更新
      const update1 = feedback.update({ status: FeedbackStatus.REVIEWED });
      const update2 = feedback.update({ status: FeedbackStatus.RESOLVED });
      
      await Promise.all([update1, update2]);
      
      const updated = await AIFeedback.findByPk(feedback.id);
      expect(updated?.status).toBe(FeedbackStatus.RESOLVED); // 最后一个更新生效
    });

    it('should handle bulk operations', async () => {
      const feedbacksData = [
        {
          userId: 1001,
          feedbackType: FeedbackType.SUGGESTION,
          sourceType: FeedbackSource.CONVERSATION,
          content: 'Bulk feedback 1',
        },
        {
          userId: 1001,
          feedbackType: FeedbackType.BUG,
          sourceType: FeedbackSource.MESSAGE,
          content: 'Bulk feedback 2',
        },
        {
          userId: 1001,
          feedbackType: FeedbackType.FEATURE,
          sourceType: FeedbackSource.APPLICATION,
          content: 'Bulk feedback 3',
        },
      ];

      const createdFeedbacks = await AIFeedback.bulkCreate(feedbacksData);
      
      expect(createdFeedbacks).toHaveLength(3);
      expect(createdFeedbacks[0].content).toBe('Bulk feedback 1');
      expect(createdFeedbacks[1].content).toBe('Bulk feedback 2');
      expect(createdFeedbacks[2].content).toBe('Bulk feedback 3');

      // 批量更新
      await AIFeedback.update(
        { status: FeedbackStatus.REVIEWED },
        { where: { userId: 1001 } }
      );

      const updatedFeedbacks = await AIFeedback.findAll({
        where: { userId: 1001 }
      });
      
      expect(updatedFeedbacks).toHaveLength(3);
      expect(updatedFeedbacks.every(f => f.status === FeedbackStatus.REVIEWED)).toBe(true);
    });
  });
});