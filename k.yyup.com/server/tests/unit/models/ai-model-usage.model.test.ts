import { AIModelUsage, AIUsageType, AIUsageStatus, PaymentStatus } from '../../../src/models/ai-model-usage.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { AIModelConfig } from '../../../src/models/ai-model-config.model';
import { sequelize } from '../../../src/config/database';

// Mock dependencies
jest.mock('../../../src/models/user.model');
jest.mock('../../../src/models/ai-model-config.model');
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

describe('AIModelUsage Model', () => {
  let mockUser: jest.Mocked<typeof User>;
  let mockAIModelConfig: jest.Mocked<typeof AIModelConfig>;

  beforeEach(() => {
    mockUser = User as jest.Mocked<typeof User>;
    mockAIModelConfig = AIModelConfig as jest.Mocked<typeof AIModelConfig>;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(AIModelUsage).toBeDefined();
      expect(AIModelUsage).toBeInstanceOf(Function);
    });

    it('should have correct table configuration', () => {
      const modelInstance = new AIModelUsage();
      expect(modelInstance).toBeDefined();
    });
  });

  describe('Enums', () => {
    describe('AIUsageType', () => {
      it('should have correct enum values', () => {
        expect(AIUsageType.TEXT).toBe('text');
        expect(AIUsageType.IMAGE).toBe('image');
        expect(AIUsageType.AUDIO).toBe('audio');
        expect(AIUsageType.VIDEO).toBe('video');
        expect(AIUsageType.EMBEDDING).toBe('embedding');
      });

      it('should have all required usage types', () => {
        const usageTypes = Object.values(AIUsageType);
        expect(usageTypes).toHaveLength(5);
        expect(usageTypes).toContain('text');
        expect(usageTypes).toContain('image');
        expect(usageTypes).toContain('audio');
        expect(usageTypes).toContain('video');
        expect(usageTypes).toContain('embedding');
      });
    });

    describe('AIUsageStatus', () => {
      it('should have correct enum values', () => {
        expect(AIUsageStatus.PENDING).toBe('pending');
        expect(AIUsageStatus.SUCCESS).toBe('success');
        expect(AIUsageStatus.FAILED).toBe('failed');
        expect(AIUsageStatus.THROTTLED).toBe('throttled');
      });

      it('should have all required status types', () => {
        const statuses = Object.values(AIUsageStatus);
        expect(statuses).toHaveLength(4);
        expect(statuses).toContain('pending');
        expect(statuses).toContain('success');
        expect(statuses).toContain('failed');
        expect(statuses).toContain('throttled');
      });
    });

    describe('PaymentStatus', () => {
      it('should have correct enum values', () => {
        expect(PaymentStatus.PENDING).toBe('pending');
        expect(PaymentStatus.PAID).toBe('paid');
        expect(PaymentStatus.FAILED).toBe('failed');
      });

      it('should have all required payment statuses', () => {
        const paymentStatuses = Object.values(PaymentStatus);
        expect(paymentStatuses).toHaveLength(3);
        expect(paymentStatuses).toContain('pending');
        expect(paymentStatuses).toContain('paid');
        expect(paymentStatuses).toContain('failed');
      });
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: AIModelUsage;

    beforeEach(() => {
      modelInstance = new AIModelUsage();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('userId');
      expect(modelInstance).toHaveProperty('modelId');
      expect(modelInstance).toHaveProperty('requestId');
      expect(modelInstance).toHaveProperty('usageType');
      expect(modelInstance).toHaveProperty('requestTimestamp');
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have optional attributes', () => {
      expect(modelInstance).toHaveProperty('sessionId');
      expect(modelInstance).toHaveProperty('inputTokens');
      expect(modelInstance).toHaveProperty('outputTokens');
      expect(modelInstance).toHaveProperty('totalTokens');
      expect(modelInstance).toHaveProperty('processingTime');
      expect(modelInstance).toHaveProperty('cost');
      expect(modelInstance).toHaveProperty('status');
      expect(modelInstance).toHaveProperty('errorMessage');
      expect(modelInstance).toHaveProperty('responseTimestamp');
      expect(modelInstance).toHaveProperty('paymentStatus');
    });

    it('should have correct default values', () => {
      expect(modelInstance.inputTokens).toBeUndefined();
      expect(modelInstance.outputTokens).toBeUndefined();
      expect(modelInstance.totalTokens).toBeUndefined();
      expect(modelInstance.status).toBeUndefined();
      expect(modelInstance.paymentStatus).toBeUndefined();
    });
  });

  describe('Model Associations', () => {
    it('should belong to User', () => {
      // Mock the belongsTo method
      const mockBelongsTo = jest.fn();
      AIModelUsage.belongsTo = mockBelongsTo;

      // Call the association setup function
      require('../../../src/models/ai-model-usage.model').initAIModelUsageAssociations();

      expect(mockBelongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'userId',
        as: 'user',
      });
    });

    it('should belong to AIModelConfig', () => {
      // Mock the belongsTo method
      const mockBelongsTo = jest.fn();
      AIModelUsage.belongsTo = mockBelongsTo;

      // Call the association setup function
      require('../../../src/models/ai-model-usage.model').initAIModelUsageAssociations();

      expect(mockBelongsTo).toHaveBeenCalledWith(mockAIModelConfig, {
        foreignKey: 'modelId',
        as: 'modelConfig',
      });
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
            
      // Call the initialization function
      require('../../../src/models/ai-model-usage.model').initAIModelUsage(sequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
            comment: '记录ID',
          }),
          userId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            comment: '用户ID',
            references: expect.objectContaining({
              model: 'users',
              key: 'id',
            }),
          }),
          modelId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            comment: '模型ID',
            references: expect.objectContaining({
              model: 'ai_model_config',
              key: 'id',
            }),
          }),
          usageType: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            comment: '使用类型 (文本, 图像等)',
          }),
        }),
        expect.objectContaining({
          sequelize,
          tableName: 'ai_model_usage',
          timestamps: true,
          underscored: true,
          comment: 'AI模型使用情况统计表',
          indexes: expect.arrayContaining([
            { fields: ['user_id'] },
            { fields: ['model_id'] },
            { fields: ['session_id'] },
            { fields: ['request_timestamp'] },
          ]),
        })
      );
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new AIModelUsage();
      
      // Test that required fields are properly defined
      expect(modelInstance.userId).toBeDefined();
      expect(modelInstance.modelId).toBeDefined();
      expect(modelInstance.requestId).toBeDefined();
      expect(modelInstance.usageType).toBeDefined();
      expect(modelInstance.requestTimestamp).toBeDefined();
    });

    it('should validate unique constraint on requestId', () => {
      const modelInstance = new AIModelUsage();
      modelInstance.requestId = 'unique-request-id';
      
      expect(modelInstance.requestId).toBeDefined();
    });

    it('should validate enum values', () => {
      const modelInstance = new AIModelUsage();
      
      // Test valid usageType values
      modelInstance.usageType = AIUsageType.TEXT;
      expect(modelInstance.usageType).toBe(AIUsageType.TEXT);
      
      modelInstance.usageType = AIUsageType.IMAGE;
      expect(modelInstance.usageType).toBe(AIUsageType.IMAGE);
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance', () => {
      const modelInstance = new AIModelUsage({
        userId: 1,
        modelId: 1,
        requestId: 'test-request-id',
        usageType: AIUsageType.TEXT,
        requestTimestamp: new Date(),
      });

      expect(modelInstance.userId).toBe(1);
      expect(modelInstance.modelId).toBe(1);
      expect(modelInstance.requestId).toBe('test-request-id');
      expect(modelInstance.usageType).toBe(AIUsageType.TEXT);
      expect(modelInstance.requestTimestamp).toBeInstanceOf(Date);
    });

    it('should handle optional fields correctly', () => {
      const modelInstance = new AIModelUsage({
        userId: 1,
        modelId: 1,
        requestId: 'test-request-id',
        usageType: AIUsageType.TEXT,
        requestTimestamp: new Date(),
        sessionId: 'test-session',
        inputTokens: 100,
        outputTokens: 50,
        totalTokens: 150,
        processingTime: 1000,
        cost: 0.001,
        status: AIUsageStatus.SUCCESS,
        errorMessage: null,
        responseTimestamp: new Date(),
        paymentStatus: PaymentStatus.PAID,
      });

      expect(modelInstance.sessionId).toBe('test-session');
      expect(modelInstance.inputTokens).toBe(100);
      expect(modelInstance.outputTokens).toBe(50);
      expect(modelInstance.totalTokens).toBe(150);
      expect(modelInstance.processingTime).toBe(1000);
      expect(modelInstance.cost).toBe(0.001);
      expect(modelInstance.status).toBe(AIUsageStatus.SUCCESS);
      expect(modelInstance.errorMessage).toBeNull();
      expect(modelInstance.responseTimestamp).toBeInstanceOf(Date);
      expect(modelInstance.paymentStatus).toBe(PaymentStatus.PAID);
    });
  });
});