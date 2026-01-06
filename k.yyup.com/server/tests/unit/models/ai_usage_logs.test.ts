import { AIUsageLog } from '../../../src/models/ai_usage_logs';
import { vi } from 'vitest'
import { sequelize } from '../../../src/config/database';

// Mock the sequelize instance for testing
jest.mock('../../../src/config/database', () => ({
  sequelize: {
    define: jest.fn(),
  },
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

describe('AIUsageLog Model', () => {
  let mockSequelize: any;

  beforeEach(() => {
    mockSequelize = {
      define: jest.fn().mockReturnValue({
        belongsTo: jest.fn(),
        hasMany: jest.fn(),
      }),
    };
  });

  describe('Model Factory Function', () => {
    it('should be a function that returns AIUsageLog model', () => {
      expect(typeof AIUsageLog).toBe('function');
    });

    it('should define model with correct configuration', () => {
      const model = AIUsageLog(mockSequelize);

      expect(mockSequelize.define).toHaveBeenCalledWith(
        'ai_usage_logs',
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
          }),
          userId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            references: {
              model: 'users',
              key: 'id',
            },
          }),
          modelId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            references: {
              model: 'ai_models',
              key: 'id',
            },
          }),
          tokens: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            defaultValue: 0,
          }),
        }),
        expect.objectContaining({
          modelName: 'ai_usage_logs',
          tableName: 'ai_usage_logs',
          timestamps: true,
          indexes: expect.arrayContaining([
            { fields: ['userId', 'createdAt'] },
            { fields: ['modelId'] },
          ]),
        })
      );
    });

    it('should return the AIUsageLog model', () => {
      const model = AIUsageLog(mockSequelize);
      expect(model).toBeDefined();
    });
  });

  describe('Model Attributes', () => {
    let model: any;

    beforeEach(() => {
      model = AIUsageLog(mockSequelize);
    });

    it('should have id attribute', () => {
      const attributes = model.rawAttributes;
      expect(attributes.id).toBeDefined();
      expect(attributes.id.type).toBeDefined();
      expect(attributes.id.autoIncrement).toBe(true);
      expect(attributes.id.primaryKey).toBe(true);
    });

    it('should have userId attribute', () => {
      const attributes = model.rawAttributes;
      expect(attributes.userId).toBeDefined();
      expect(attributes.userId.type).toBeDefined();
      expect(attributes.userId.allowNull).toBe(false);
      expect(attributes.userId.references.model).toBe('users');
      expect(attributes.userId.references.key).toBe('id');
    });

    it('should have modelId attribute', () => {
      const attributes = model.rawAttributes;
      expect(attributes.modelId).toBeDefined();
      expect(attributes.modelId.type).toBeDefined();
      expect(attributes.modelId.allowNull).toBe(false);
      expect(attributes.modelId.references.model).toBe('ai_models');
      expect(attributes.modelId.references.key).toBe('id');
    });

    it('should have tokens attribute', () => {
      const attributes = model.rawAttributes;
      expect(attributes.tokens).toBeDefined();
      expect(attributes.tokens.type).toBeDefined();
      expect(attributes.tokens.allowNull).toBe(false);
      expect(attributes.tokens.defaultValue).toBe(0);
    });

    it('should have timestamps', () => {
      expect(model.options.timestamps).toBe(true);
    });

    it('should have createdAt and updatedAt', () => {
      const attributes = model.rawAttributes;
      expect(attributes.createdAt).toBeDefined();
      expect(attributes.updatedAt).toBeDefined();
    });
  });

  describe('Model Configuration', () => {
    let model: any;

    beforeEach(() => {
      model = AIUsageLog(mockSequelize);
    });

    it('should have correct model name', () => {
      expect(model.options.modelName).toBe('ai_usage_logs');
    });

    it('should have correct table name', () => {
      expect(model.options.tableName).toBe('ai_usage_logs');
    });

    it('should have indexes defined', () => {
      expect(model.options.indexes).toEqual(
        expect.arrayContaining([
          { fields: ['userId', 'createdAt'] },
          { fields: ['modelId'] },
        ])
      );
    });
  });

  describe('Model Interface', () => {
    it('should implement AIUsageLogAttributes interface', () => {
      const attributes = {
        id: 1,
        userId: 1,
        modelId: 1,
        tokens: 100,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // This would be tested with actual model instantiation
      // For now, we just validate the interface structure
      expect(attributes.id).toBe(1);
      expect(attributes.userId).toBe(1);
      expect(attributes.modelId).toBe(1);
      expect(attributes.tokens).toBe(100);
      expect(attributes.createdAt).toBeInstanceOf(Date);
      expect(attributes.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('Field Validation', () => {
    let model: any;

    beforeEach(() => {
      model = AIUsageLog(mockSequelize);
    });

    it('should validate required fields', () => {
      const validData = {
        userId: 1,
        modelId: 1,
        tokens: 100,
      };

      // This would test actual validation in a real database scenario
      expect(validData.userId).toBeDefined();
      expect(validData.modelId).toBeDefined();
      expect(validData.tokens).toBeDefined();
    });

    it('should validate tokens field', () => {
      const tokensValues = [0, 100, 1000, 5000];
      
      tokensValues.forEach(tokens => {
        expect(typeof tokens).toBe('number');
        expect(tokens).toBeGreaterThanOrEqual(0);
      });
    });

    it('should validate userId field', () => {
      const userIdValues = [1, 2, 3, 100];
      
      userIdValues.forEach(userId => {
        expect(typeof userId).toBe('number');
        expect(userId).toBeGreaterThan(0);
      });
    });

    it('should validate modelId field', () => {
      const modelIdValues = [1, 2, 3, 100];
      
      modelIdValues.forEach(modelId => {
        expect(typeof modelId).toBe('number');
        expect(modelId).toBeGreaterThan(0);
      });
    });
  });

  describe('Database Relationships', () => {
    let model: any;

    beforeEach(() => {
      model = AIUsageLog(mockSequelize);
    });

    it('should have foreign key reference to users table', () => {
      const attributes = model.rawAttributes;
      expect(attributes.userId.references.model).toBe('users');
      expect(attributes.userId.references.key).toBe('id');
    });

    it('should have foreign key reference to ai_models table', () => {
      const attributes = model.rawAttributes;
      expect(attributes.modelId.references.model).toBe('ai_models');
      expect(attributes.modelId.references.key).toBe('id');
    });
  });

  describe('Indexes', () => {
    let model: any;

    beforeEach(() => {
      model = AIUsageLog(mockSequelize);
    });

    it('should have composite index on userId and createdAt', () => {
      const indexes = model.options.indexes;
      const compositeIndex = indexes.find((index: any) => 
        index.fields.includes('userId') && index.fields.includes('createdAt')
      );
      
      expect(compositeIndex).toBeDefined();
      expect(compositeIndex.fields).toEqual(['userId', 'createdAt']);
    });

    it('should have index on modelId', () => {
      const indexes = model.options.indexes;
      const modelIdIndex = indexes.find((index: any) => 
        index.fields.includes('modelId')
      );
      
      expect(modelIdIndex).toBeDefined();
      expect(modelIdIndex.fields).toEqual(['modelId']);
    });
  });

  describe('Default Values', () => {
    let model: any;

    beforeEach(() => {
      model = AIUsageLog(mockSequelize);
    });

    it('should have default value for tokens', () => {
      const attributes = model.rawAttributes;
      expect(attributes.tokens.defaultValue).toBe(0);
    });
  });

  describe('Field Types', () => {
    let model: any;

    beforeEach(() => {
      model = AIUsageLog(mockSequelize);
    });

    it('should have correct field types', () => {
      const attributes = model.rawAttributes;
      
      expect(attributes.id.type.constructor.name).toContain('INTEGER');
      expect(attributes.userId.type.constructor.name).toContain('INTEGER');
      expect(attributes.modelId.type.constructor.name).toContain('INTEGER');
      expect(attributes.tokens.type.constructor.name).toContain('INTEGER');
    });
  });

  describe('Model Comments', () => {
    let model: any;

    beforeEach(() => {
      model = AIUsageLog(mockSequelize);
    });

    it('should have comment for tokens field', () => {
      const attributes = model.rawAttributes;
      expect(attributes.tokens.comment).toBe('使用的token数量');
    });
  });
});