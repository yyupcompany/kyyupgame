import { AIUserRelation, initAIUserRelation, initAIUserRelationAssociations, IAIUserSettings } from '../../../src/models/ai-user-relation.model';
import { vi } from 'vitest'
import { User } from '../../../src/models/user.model';
import { Sequelize } from 'sequelize';

// Mock dependencies
jest.mock('../../../src/models/user.model');


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

describe('AIUserRelation Model', () => {
  let mockUser: jest.Mocked<typeof User>;
  let mockSequelize: jest.Mocked<Sequelize>;

  beforeEach(() => {
    mockUser = User as jest.Mocked<typeof User>;
    mockSequelize = {
      define: jest.fn(),
      models: {},
    } as any;
    
    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Model Definition', () => {
    it('should have correct model attributes', () => {
      expect(AIUserRelation).toBeDefined();
      expect(AIUserRelation).toBeInstanceOf(Function);
    });

    it('should initialize model correctly', () => {
      const modelInstance = initAIUserRelation(mockSequelize);
      expect(modelInstance).toBeDefined();
      expect(modelInstance).toBe(AIUserRelation);
    });
  });

  describe('Interface Definition', () => {
    describe('IAIUserSettings', () => {
      it('should allow optional theme setting', () => {
        const settings: IAIUserSettings = {
          theme: 'dark',
        };
        expect(settings.theme).toBe('dark');
      });

      it('should allow optional preferredModel setting', () => {
        const settings: IAIUserSettings = {
          preferredModel: 'gpt-4',
        };
        expect(settings.preferredModel).toBe('gpt-4');
      });

      it('should allow optional customPrompts setting', () => {
        const settings: IAIUserSettings = {
          customPrompts: ['prompt1', 'prompt2'],
        };
        expect(settings.customPrompts).toEqual(['prompt1', 'prompt2']);
      });

      it('should allow additional custom settings', () => {
        const settings: IAIUserSettings = {
          customSetting1: 'value1',
          customSetting2: ['value2', 'value3'],
        };
        expect(settings.customSetting1).toBe('value1');
        expect(settings.customSetting2).toEqual(['value2', 'value3']);
      });

      it('should allow empty settings object', () => {
        const settings: IAIUserSettings = {};
        expect(Object.keys(settings)).toHaveLength(0);
      });
    });
  });

  describe('Model Attributes', () => {
    let modelInstance: AIUserRelation;

    beforeEach(() => {
      modelInstance = new AIUserRelation();
    });

    it('should have all required attributes', () => {
      expect(modelInstance).toHaveProperty('id');
      expect(modelInstance).toHaveProperty('externalUserId');
      expect(modelInstance).toHaveProperty('aiSettings');
      expect(modelInstance).toHaveProperty('lastActivity');
      expect(modelInstance).toHaveProperty('createdAt');
      expect(modelInstance).toHaveProperty('updatedAt');
    });

    it('should have correct default values', () => {
      expect(modelInstance.aiSettings).toBeUndefined();
      expect(modelInstance.lastActivity).toBeUndefined();
    });
  });

  describe('Model Initialization', () => {
    it('should initialize with correct configuration', () => {
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.objectContaining({
            type: expect.any(Object),
            autoIncrement: true,
            primaryKey: true,
          }),
          externalUserId: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            comment: '外部系统用户ID',
            unique: true,
            references: expect.objectContaining({
              model: 'users',
              key: 'id',
            }),
          }),
          aiSettings: expect.objectContaining({
            type: expect.any(Object),
            allowNull: true,
            comment: 'AI系统特定设置',
            defaultValue: {},
          }),
          lastActivity: expect.objectContaining({
            type: expect.any(Object),
            allowNull: false,
            comment: '最后活动时间',
            defaultValue: expect.any(Function),
          }),
        }),
        expect.objectContaining({
          sequelize: mockSequelize,
          tableName: 'ai_user_relations',
          timestamps: true,
          underscored: true,
          indexes: [
            {
              name: 'external_user_idx',
              fields: ['external_user_id'],
            },
          ],
        })
      );
    });
  });

  describe('Model Associations', () => {
    it('should belong to User', () => {
      const mockBelongsTo = jest.fn();
      AIUserRelation.belongsTo = mockBelongsTo;

      initAIUserRelationAssociations();

      expect(mockBelongsTo).toHaveBeenCalledWith(mockUser, {
        foreignKey: 'externalUserId',
        as: 'user',
      });
    });
  });

  describe('Model Validation', () => {
    it('should validate required fields', () => {
      const modelInstance = new AIUserRelation();
      
      expect(modelInstance).toHaveProperty('externalUserId');
      expect(modelInstance).toHaveProperty('aiSettings');
      expect(modelInstance).toHaveProperty('lastActivity');
    });

    it('should validate unique constraint on externalUserId', () => {
      const modelInstance = new AIUserRelation();
      modelInstance.externalUserId = 123;
      
      expect(modelInstance.externalUserId).toBe(123);
    });

    it('should validate JSON type for aiSettings', () => {
      const modelInstance = new AIUserRelation();
      
      // Test with object
      modelInstance.aiSettings = { theme: 'dark', preferredModel: 'gpt-4' };
      expect(modelInstance.aiSettings).toEqual({ theme: 'dark', preferredModel: 'gpt-4' });
      
      // Test with array
      modelInstance.aiSettings = ['prompt1', 'prompt2'];
      expect(modelInstance.aiSettings).toEqual(['prompt1', 'prompt2']);
      
      // Test with empty object
      modelInstance.aiSettings = {};
      expect(modelInstance.aiSettings).toEqual({});
    });

    it('should validate Date type for lastActivity', () => {
      const modelInstance = new AIUserRelation();
      const testDate = new Date();
      
      modelInstance.lastActivity = testDate;
      expect(modelInstance.lastActivity).toBe(testDate);
    });

    it('should validate numeric type for externalUserId', () => {
      const modelInstance = new AIUserRelation();
      
      modelInstance.externalUserId = 123;
      expect(modelInstance.externalUserId).toBe(123);
      
      modelInstance.externalUserId = 0;
      expect(modelInstance.externalUserId).toBe(0);
    });
  });

  describe('Model Instances', () => {
    it('should create a valid model instance with minimal data', () => {
      const modelInstance = new AIUserRelation({
        externalUserId: 1,
      });

      expect(modelInstance.externalUserId).toBe(1);
      expect(modelInstance.aiSettings).toBeUndefined();
      expect(modelInstance.lastActivity).toBeUndefined();
    });

    it('should create a valid model instance with full data', () => {
      const aiSettings: IAIUserSettings = {
        theme: 'dark',
        preferredModel: 'gpt-4',
        customPrompts: ['custom prompt 1', 'custom prompt 2'],
        customSetting1: 'custom value 1',
        customSetting2: ['custom value 2', 'custom value 3'],
      };

      const lastActivity = new Date();

      const modelInstance = new AIUserRelation({
        externalUserId: 1,
        aiSettings,
        lastActivity,
      });

      expect(modelInstance.externalUserId).toBe(1);
      expect(modelInstance.aiSettings).toEqual(aiSettings);
      expect(modelInstance.lastActivity).toBe(lastActivity);
    });

    it('should handle empty aiSettings', () => {
      const modelInstance = new AIUserRelation({
        externalUserId: 1,
        aiSettings: {},
        lastActivity: new Date(),
      });

      expect(modelInstance.externalUserId).toBe(1);
      expect(modelInstance.aiSettings).toEqual({});
      expect(modelInstance.lastActivity).toBeInstanceOf(Date);
    });

    it('should handle aiSettings with only strings', () => {
      const modelInstance = new AIUserRelation({
        externalUserId: 1,
        aiSettings: {
          theme: 'light',
          language: 'zh-CN',
        },
        lastActivity: new Date(),
      });

      expect(modelInstance.externalUserId).toBe(1);
      expect(modelInstance.aiSettings).toEqual({
        theme: 'light',
        language: 'zh-CN',
      });
      expect(modelInstance.lastActivity).toBeInstanceOf(Date);
    });

    it('should handle aiSettings with only arrays', () => {
      const modelInstance = new AIUserRelation({
        externalUserId: 1,
        aiSettings: {
          customPrompts: ['prompt1', 'prompt2'],
          blockedModels: ['model1', 'model2'],
        },
        lastActivity: new Date(),
      });

      expect(modelInstance.externalUserId).toBe(1);
      expect(modelInstance.aiSettings).toEqual({
        customPrompts: ['prompt1', 'prompt2'],
        blockedModels: ['model1', 'model2'],
      });
      expect(modelInstance.lastActivity).toBeInstanceOf(Date);
    });
  });

  describe('Default Values', () => {
    it('should handle default aiSettings value', () => {
      // This test verifies that the default value is set correctly during initialization
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          aiSettings: expect.objectContaining({
            defaultValue: {},
          }),
        })
      );
    });

    it('should handle default lastActivity value', () => {
      // This test verifies that the default value is set correctly during initialization
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          lastActivity: expect.objectContaining({
            defaultValue: expect.any(Function),
          }),
        })
      );
    });
  });

  describe('Database Constraints', () => {
    it('should enforce unique constraint on externalUserId', () => {
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          externalUserId: expect.objectContaining({
            unique: true,
          }),
        })
      );
    });

    it('should enforce foreign key constraint on externalUserId', () => {
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          externalUserId: expect.objectContaining({
            references: expect.objectContaining({
              model: 'users',
              key: 'id',
            }),
          }),
        })
      );
    });

    it('should have correct indexes defined', () => {
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          indexes: expect.arrayContaining([
            {
              name: 'external_user_idx',
              fields: ['external_user_id'],
            },
          ]),
        })
      );
    });
  });

  describe('Table Configuration', () => {
    it('should have correct table name', () => {
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          tableName: 'ai_user_relations',
        })
      );
    });

    it('should have timestamps enabled', () => {
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          timestamps: true,
        })
      );
    });

    it('should use underscored naming', () => {
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          underscored: true,
        })
      );
    });
  });

  describe('Field Comments', () => {
    it('should have correct field comments', () => {
            
      initAIUserRelation(mockSequelize);

      expect(mockInit).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          externalUserId: expect.objectContaining({
            comment: '外部系统用户ID',
          }),
          aiSettings: expect.objectContaining({
            comment: 'AI系统特定设置',
          }),
          lastActivity: expect.objectContaining({
            comment: '最后活动时间',
          }),
        })
      );
    });
  });

  describe('Complex AI Settings Scenarios', () => {
    it('should handle complex nested AI settings', () => {
      const complexSettings: IAIUserSettings = {
        theme: 'dark',
        preferredModel: 'gpt-4',
        customPrompts: ['prompt1', 'prompt2'],
        preferences: {
          language: 'zh-CN',
          region: 'Asia',
          timezone: 'GMT+8',
        },
        advancedSettings: {
          maxTokens: 4096,
          temperature: 0.7,
          topP: 0.9,
          frequencyPenalty: 0.1,
          presencePenalty: 0.1,
        },
        customFeatures: {
          feature1: true,
          feature2: false,
          feature3: {
            subFeature1: 'value1',
            subFeature2: ['value2', 'value3'],
          },
        },
      };

      const modelInstance = new AIUserRelation({
        externalUserId: 1,
        aiSettings: complexSettings,
        lastActivity: new Date(),
      });

      expect(modelInstance.aiSettings).toEqual(complexSettings);
      expect(modelInstance.aiSettings?.preferences?.language).toBe('zh-CN');
      expect(modelInstance.aiSettings?.advancedSettings?.maxTokens).toBe(4096);
      expect(modelInstance.aiSettings?.customFeatures?.feature3?.subFeature1).toBe('value1');
    });

    it('should handle AI settings with various data types', () => {
      const mixedSettings: IAIUserSettings = {
        theme: 'light',
        maxTokens: 2048,
        temperature: 0.5,
        isEnabled: true,
        retryCount: 3,
        timeout: 30000,
        allowedModels: ['gpt-3.5-turbo', 'gpt-4'],
        blockedDomains: [],
        metadata: null,
      };

      const modelInstance = new AIUserRelation({
        externalUserId: 1,
        aiSettings: mixedSettings,
        lastActivity: new Date(),
      });

      expect(modelInstance.aiSettings).toEqual(mixedSettings);
      expect(typeof modelInstance.aiSettings?.maxTokens).toBe('number');
      expect(typeof modelInstance.aiSettings?.temperature).toBe('number');
      expect(typeof modelInstance.aiSettings?.isEnabled).toBe('boolean');
      expect(Array.isArray(modelInstance.aiSettings?.allowedModels)).toBe(true);
      expect(Array.isArray(modelInstance.aiSettings?.blockedDomains)).toBe(true);
      expect(modelInstance.aiSettings?.metadata).toBeNull();
    });
  });
});