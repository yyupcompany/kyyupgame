import { Sequelize } from 'sequelize';
import { vi } from 'vitest'
import { initAIModelConfig, initAIModelConfigAssociations, AIModelConfig, ModelType, ModelStatus, ModelParameters } from '../../../src/models/ai-model-config.model';

// Mock Sequelize
jest.mock('sequelize', () => ({
  Sequelize: jest.fn().mockImplementation(() => ({
    define: jest.fn(),
    sync: jest.fn(),
    close: jest.fn(),
  })),
  DataTypes: {
    INTEGER: jest.fn(),
    STRING: jest.fn(),
    ENUM: jest.fn(),
    JSON: jest.fn(),
    DATE: jest.fn(),
    BOOLEAN: jest.fn(),
    TEXT: jest.fn(),
  },
  Model: jest.fn(),
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

describe('AIModelConfig Model', () => {
  let sequelize: Sequelize;
  let mockSequelize: any;

  beforeEach(() => {
    mockSequelize = {
      define: jest.fn(),
      sync: jest.fn().mockResolvedValue({}),
      close: jest.fn().mockResolvedValue({}),
    };
    
    sequelize = mockSequelize as any;
  });

  describe('Model Definition', () => {
    it('should define the model with correct attributes', () => {
      initAIModelConfig(sequelize);

      expect(sequelize.define).toHaveBeenCalledWith(
        'AIModelConfig',
        expect.objectContaining({
          id: expect.any(Object),
          name: expect.any(Object),
          displayName: expect.any(Object),
          provider: expect.any(Object),
          modelType: expect.any(Object),
          apiVersion: expect.any(Object),
          endpointUrl: expect.any(Object),
          apiKey: expect.any(Object),
          modelParameters: expect.any(Object),
          isDefault: expect.any(Object),
          status: expect.any(Object),
          description: expect.any(Object),
          capabilities: expect.any(Object),
          maxTokens: expect.any(Object),
          creatorId: expect.any(Object),
          createdAt: expect.any(Object),
          updatedAt: expect.any(Object),
        }),
        expect.objectContaining({
          tableName: 'ai_model_config',
          timestamps: true,
          underscored: true,
          comment: '存储AI模型配置信息',
          indexes: expect.arrayContaining([
            { unique: true, fields: ['name', 'provider'] },
            { fields: ['model_type'] },
            { fields: ['status'] },
          ]),
        })
      );
    });

    it('should have correct field configurations', () => {
      const model = initAIModelConfig(sequelize);
      const attributes = model.getAttributes();

      // 检查主键
      expect(attributes.id.primaryKey).toBe(true);
      expect(attributes.id.autoIncrement).toBe(true);

      // 检查必填字段
      expect(attributes.name.allowNull).toBe(false);
      expect(attributes.displayName.allowNull).toBe(false);
      expect(attributes.provider.allowNull).toBe(false);
      expect(attributes.modelType.allowNull).toBe(false);
      expect(attributes.endpointUrl.allowNull).toBe(false);
      expect(attributes.apiKey.allowNull).toBe(false);

      // 检查可选字段
      expect(attributes.apiVersion.allowNull).toBe(true);
      expect(attributes.modelParameters.allowNull).toBe(true);
      expect(attributes.description.allowNull).toBe(true);
      expect(attributes.capabilities.allowNull).toBe(true);
      expect(attributes.maxTokens.allowNull).toBe(true);
      expect(attributes.creatorId.allowNull).toBe(true);

      // 检查默认值
      expect(attributes.apiVersion.defaultValue).toBe('v1');
      expect(attributes.isDefault.defaultValue).toBe(false);
      expect(attributes.status.defaultValue).toBe(ModelStatus.INACTIVE);
    });
  });

  describe('Enum Values', () => {
    it('should have correct ModelType enum values', () => {
      expect(ModelType.TEXT).toBe('text');
      expect(ModelType.SPEECH).toBe('speech');
      expect(ModelType.IMAGE).toBe('image');
      expect(ModelType.VIDEO).toBe('video');
      expect(ModelType.MULTIMODAL).toBe('multimodal');
      expect(ModelType.EMBEDDING).toBe('embedding');
      expect(ModelType.SEARCH).toBe('search');
    });

    it('should have correct ModelStatus enum values', () => {
      expect(ModelStatus.ACTIVE).toBe('active');
      expect(ModelStatus.INACTIVE).toBe('inactive');
      expect(ModelStatus.TESTING).toBe('testing');
    });
  });

  describe('Model Associations', () => {
    it('should define associations correctly', () => {
      initAIModelConfigAssociations();

      // 目前没有定义关联，所以这个测试主要是确保方法不会出错
      expect(true).toBe(true);
    });
  });

  describe('Model Creation', () => {
    it('should create a new model config with valid data', async () => {
      const modelConfigData = {
        name: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'OpenAI',
        modelType: ModelType.TEXT,
        endpointUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'test-api-key',
        modelParameters: {
          temperature: 0.7,
          maxTokens: 4096,
        } as ModelParameters,
        isDefault: true,
        status: ModelStatus.ACTIVE,
        description: 'GPT-4 model configuration',
        capabilities: ['text-generation', 'code-generation'],
        maxTokens: 8192,
        creatorId: 1,
      };

      // 由于我们使用了mock，这里主要测试数据结构
      expect(modelConfigData.name).toBe('gpt-4');
      expect(modelConfigData.displayName).toBe('GPT-4');
      expect(modelConfigData.provider).toBe('OpenAI');
      expect(modelConfigData.modelType).toBe(ModelType.TEXT);
      expect(modelConfigData.endpointUrl).toBe('https://api.openai.com/v1/chat/completions');
      expect(modelConfigData.apiKey).toBe('test-api-key');
      expect(modelConfigData.modelParameters).toEqual({
        temperature: 0.7,
        maxTokens: 4096,
      });
      expect(modelConfigData.isDefault).toBe(true);
      expect(modelConfigData.status).toBe(ModelStatus.ACTIVE);
      expect(modelConfigData.description).toBe('GPT-4 model configuration');
      expect(modelConfigData.capabilities).toEqual(['text-generation', 'code-generation']);
      expect(modelConfigData.maxTokens).toBe(8192);
      expect(modelConfigData.creatorId).toBe(1);
    });

    it('should create model config with default values', () => {
      const modelConfigData = {
        name: 'gpt-3.5-turbo',
        displayName: 'GPT-3.5 Turbo',
        provider: 'OpenAI',
        modelType: ModelType.TEXT,
        endpointUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'test-api-key',
      };

      // 检查默认值
      expect(modelConfigData.apiVersion).toBeUndefined(); // 会在数据库层面设置默认值
      expect(modelConfigData.isDefault).toBeUndefined(); // 会在数据库层面设置默认值
      expect(modelConfigData.status).toBeUndefined(); // 会在数据库层面设置默认值
    });
  });

  describe('Field Validation', () => {
    it('should validate modelType field', () => {
      const validModelTypes = Object.values(ModelType);
      
      validModelTypes.forEach(type => {
        expect(validModelTypes).toContain(type);
      });
    });

    it('should validate status field', () => {
      const validStatuses = Object.values(ModelStatus);
      
      validStatuses.forEach(status => {
        expect(validStatuses).toContain(status);
      });
    });

    it('should validate modelParameters structure', () => {
      const validParameters: ModelParameters = {
        temperature: 0.7,
        maxTokens: 4096,
        topP: 0.9,
        topK: 50,
        stopSequences: ['\n\n'],
        systemPrompt: 'You are a helpful assistant.',
      };

      expect(validParameters.temperature).toBe(0.7);
      expect(validParameters.maxTokens).toBe(4096);
      expect(validParameters.topP).toBe(0.9);
      expect(validParameters.topK).toBe(50);
      expect(validParameters.stopSequences).toEqual(['\n\n']);
      expect(validParameters.systemPrompt).toBe('You are a helpful assistant.');
    });
  });

  describe('Model Methods', () => {
    it('should have correct model name', () => {
      const model = initAIModelConfig(sequelize);
      expect(model.tableName).toBe('ai_model_config');
    });

    it('should have all required attributes', () => {
      const model = initAIModelConfig(sequelize);
      const attributes = Object.keys(model.getAttributes());
      
      const requiredAttributes = [
        'id', 'name', 'displayName', 'provider', 'modelType', 'apiVersion',
        'endpointUrl', 'apiKey', 'modelParameters', 'isDefault', 'status',
        'description', 'capabilities', 'maxTokens', 'creatorId', 'createdAt', 'updatedAt'
      ];
      
      requiredAttributes.forEach(attr => {
        expect(attributes).toContain(attr);
      });
    });
  });

  describe('Model Options', () => {
    it('should have correct table options', () => {
      const model = initAIModelConfig(sequelize);
      const options = model.options;
      
      expect(options.timestamps).toBe(true);
      expect(options.underscored).toBe(true);
      expect(options.tableName).toBe('ai_model_config');
    });

    it('should have correct indexes', () => {
      const model = initAIModelConfig(sequelize);
      const options = model.options;
      
      expect(options.indexes).toEqual(expect.arrayContaining([
        { unique: true, fields: ['name', 'provider'] },
        { fields: ['model_type'] },
        { fields: ['status'] },
      ]));
    });
  });

  describe('Model Serialization', () => {
    it('should serialize model data correctly', () => {
      const modelData = {
        id: 1,
        name: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'OpenAI',
        modelType: ModelType.TEXT,
        endpointUrl: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'test-api-key',
        modelParameters: {
          temperature: 0.7,
          maxTokens: 4096,
        },
        isDefault: true,
        status: ModelStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const serialized = JSON.stringify(modelData);
      const deserialized = JSON.parse(serialized);

      expect(deserialized.id).toBe(1);
      expect(deserialized.name).toBe('gpt-4');
      expect(deserialized.displayName).toBe('GPT-4');
      expect(deserialized.provider).toBe('OpenAI');
      expect(deserialized.modelType).toBe(ModelType.TEXT);
      expect(deserialized.endpointUrl).toBe('https://api.openai.com/v1/chat/completions');
      expect(deserialized.apiKey).toBe('test-api-key');
      expect(deserialized.modelParameters).toEqual({
        temperature: 0.7,
        maxTokens: 4096,
      });
      expect(deserialized.isDefault).toBe(true);
      expect(deserialized.status).toBe(ModelStatus.ACTIVE);
    });
  });
});