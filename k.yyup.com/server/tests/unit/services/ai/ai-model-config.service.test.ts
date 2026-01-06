// Mock dependencies
jest.mock('uuid');
jest.mock('../../../../../src/models/ai-model-config.model');
jest.mock('../../../../../src/utils/custom-errors');

import { v4 as uuidv4 } from 'uuid';
import { vi } from 'vitest'
import { Op } from 'sequelize';
import { AIModelConfigService } from '../../../../../src/services/ai/ai-model-config.service';
import { AIModelConfig, ModelType, ModelStatus } from '../../../../../src/models/ai-model-config.model';
import { ResourceExistsError, ValidationError } from '../../../../../src/utils/custom-errors';

// Mock implementations
const mockAIModelConfig = {
  findOne: jest.fn(),
  findByPk: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  count: jest.fn()
};

const mockUuidv4 = jest.fn();

// Setup mocks
(AIModelConfig as any) = mockAIModelConfig;
(uuidv4 as any) = mockUuidv4;


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

describe('AI Model Config Service', () => {
  let aiModelConfigService: AIModelConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    aiModelConfigService = new AIModelConfigService();
  });

  describe('createModelConfig', () => {
    it('应该成功创建模型配置', async () => {
      const configData = {
        modelName: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'openai',
        version: '1.0',
        capabilities: ['text-generation', 'conversation'],
        contextWindow: 8192,
        maxTokens: 4096,
        isActive: true,
        isDefault: false,
        apiEndpoint: 'https://api.openai.com/v1',
        apiKey: 'sk-test-key'
      };

      const mockCreatedConfig = {
        id: 1,
        ...configData,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAIModelConfig.findOne.mockResolvedValue(null); // 配置不存在
      mockUuidv4.mockReturnValue('test-uuid-123');
      mockAIModelConfig.create.mockResolvedValue(mockCreatedConfig);

      const result = await aiModelConfigService.createModelConfig(configData);

      expect(mockAIModelConfig.findOne).toHaveBeenCalledWith({
        where: {
          modelName: 'gpt-4',
          provider: 'openai'
        }
      });
      expect(mockAIModelConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          modelName: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'openai',
          capabilities: ['text-generation', 'conversation']
        })
      );
      expect(result).toEqual(mockCreatedConfig);
    });

    it('应该处理模型配置已存在', async () => {
      const configData = {
        modelName: 'gpt-4',
        provider: 'openai',
        apiEndpoint: 'https://api.openai.com/v1'
      };

      const existingConfig = {
        id: 1,
        modelName: 'gpt-4',
        provider: 'openai'
      };

      mockAIModelConfig.findOne.mockResolvedValue(existingConfig);

      await expect(aiModelConfigService.createModelConfig(configData))
        .rejects.toThrow('模型配置已存在');

      expect(mockAIModelConfig.create).not.toHaveBeenCalled();
    });

    it('应该验证必填字段', async () => {
      const invalidConfigData = {
        // 缺少必填字段
        displayName: 'Test Model'
      };

      await expect(aiModelConfigService.createModelConfig(invalidConfigData as any))
        .rejects.toThrow('缺少必填字段');

      expect(mockAIModelConfig.findOne).not.toHaveBeenCalled();
      expect(mockAIModelConfig.create).not.toHaveBeenCalled();
    });

    it('应该处理数据库创建失败', async () => {
      const configData = {
        modelName: 'gpt-4',
        provider: 'openai',
        apiEndpoint: 'https://api.openai.com/v1'
      };

      mockAIModelConfig.findOne.mockResolvedValue(null);
      mockAIModelConfig.create.mockRejectedValue(new Error('Database error'));

      await expect(aiModelConfigService.createModelConfig(configData))
        .rejects.toThrow('Database error');
    });

    it('应该设置默认值', async () => {
      const minimalConfigData = {
        modelName: 'test-model',
        provider: 'test-provider',
        apiEndpoint: 'https://api.test.com'
      };

      const mockCreatedConfig = {
        id: 1,
        ...minimalConfigData,
        displayName: 'test-model', // 默认使用modelName
        version: '1.0',
        capabilities: [],
        contextWindow: 4096,
        maxTokens: 2048,
        isActive: true,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAIModelConfig.findOne.mockResolvedValue(null);
      mockAIModelConfig.create.mockResolvedValue(mockCreatedConfig);

      const result = await aiModelConfigService.createModelConfig(minimalConfigData);

      expect(mockAIModelConfig.create).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'test-model',
          version: '1.0',
          capabilities: [],
          contextWindow: 4096,
          maxTokens: 2048,
          isActive: true,
          isDefault: false
        })
      );
      expect(result).toEqual(mockCreatedConfig);
    });
  });

  describe('getModelConfig', () => {
    it('应该成功获取模型配置', async () => {
      const configId = 1;
      const mockConfig = {
        id: 1,
        modelName: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'openai',
        version: '1.0',
        capabilities: ['text-generation'],
        contextWindow: 8192,
        maxTokens: 4096,
        isActive: true,
        isDefault: false,
        apiEndpoint: 'https://api.openai.com/v1',
        apiKey: 'sk-test-key',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockConfig);

      const result = await aiModelConfigService.getModelConfig(configId);

      expect(mockAIModelConfig.findByPk).toHaveBeenCalledWith(configId);
      expect(result).toEqual(mockConfig);
    });

    it('应该处理配置不存在', async () => {
      const configId = 999;
      mockAIModelConfig.findByPk.mockResolvedValue(null);

      const result = await aiModelConfigService.getModelConfig(configId);

      expect(result).toBeNull();
    });

    it('应该处理数据库查询错误', async () => {
      const configId = 1;
      const dbError = new Error('Database query failed');
      mockAIModelConfig.findByPk.mockRejectedValue(dbError);

      await expect(aiModelConfigService.getModelConfig(configId))
        .rejects.toThrow('Database query failed');
    });
  });

  describe('getAllModelConfigs', () => {
    it('应该成功获取所有模型配置', async () => {
      const mockConfigs = [
        {
          id: 1,
          modelName: 'gpt-4',
          displayName: 'GPT-4',
          provider: 'openai',
          isActive: true,
          isDefault: true
        },
        {
          id: 2,
          modelName: 'claude-3',
          displayName: 'Claude 3',
          provider: 'anthropic',
          isActive: true,
          isDefault: false
        }
      ];

      mockAIModelConfig.findAll.mockResolvedValue(mockConfigs);

      const result = await aiModelConfigService.getAllModelConfigs();

      expect(mockAIModelConfig.findAll).toHaveBeenCalledWith({
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      });
      expect(result).toEqual(mockConfigs);
    });

    it('应该支持筛选活跃配置', async () => {
      const mockActiveConfigs = [
        {
          id: 1,
          modelName: 'gpt-4',
          isActive: true
        }
      ];

      mockAIModelConfig.findAll.mockResolvedValue(mockActiveConfigs);

      const result = await aiModelConfigService.getAllModelConfigs({ activeOnly: true });

      expect(mockAIModelConfig.findAll).toHaveBeenCalledWith({
        where: { isActive: true },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      });
      expect(result).toEqual(mockActiveConfigs);
    });

    it('应该支持按提供商筛选', async () => {
      const mockOpenAIConfigs = [
        {
          id: 1,
          modelName: 'gpt-4',
          provider: 'openai'
        }
      ];

      mockAIModelConfig.findAll.mockResolvedValue(mockOpenAIConfigs);

      const result = await aiModelConfigService.getAllModelConfigs({ provider: 'openai' });

      expect(mockAIModelConfig.findAll).toHaveBeenCalledWith({
        where: { provider: 'openai' },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      });
      expect(result).toEqual(mockOpenAIConfigs);
    });

    it('应该处理空结果', async () => {
      mockAIModelConfig.findAll.mockResolvedValue([]);

      const result = await aiModelConfigService.getAllModelConfigs();

      expect(result).toEqual([]);
    });

    it('应该处理数据库查询错误', async () => {
      const dbError = new Error('Database query failed');
      mockAIModelConfig.findAll.mockRejectedValue(dbError);

      await expect(aiModelConfigService.getAllModelConfigs())
        .rejects.toThrow('Database query failed');
    });
  });

  describe('updateModelConfig', () => {
    it('应该成功更新模型配置', async () => {
      const configId = 1;
      const updateData = {
        displayName: '更新的GPT-4',
        maxTokens: 8192,
        isActive: false
      };

      const mockExistingConfig = {
        id: 1,
        modelName: 'gpt-4',
        displayName: 'GPT-4',
        maxTokens: 4096,
        isActive: true
      };

      const mockUpdatedConfig = {
        ...mockExistingConfig,
        ...updateData,
        updatedAt: new Date()
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockExistingConfig);
      mockAIModelConfig.update.mockResolvedValue([1]); // 更新成功
      mockAIModelConfig.findByPk.mockResolvedValueOnce(mockUpdatedConfig); // 获取更新后的数据

      const result = await aiModelConfigService.updateModelConfig(configId, updateData);

      expect(mockAIModelConfig.findByPk).toHaveBeenCalledWith(configId);
      expect(mockAIModelConfig.update).toHaveBeenCalledWith(
        updateData,
        { where: { id: configId } }
      );
      expect(result).toEqual(mockUpdatedConfig);
    });

    it('应该处理配置不存在', async () => {
      const configId = 999;
      const updateData = { displayName: '不存在的配置' };

      mockAIModelConfig.findByPk.mockResolvedValue(null);

      await expect(aiModelConfigService.updateModelConfig(configId, updateData))
        .rejects.toThrow('模型配置不存在');

      expect(mockAIModelConfig.update).not.toHaveBeenCalled();
    });

    it('应该处理设置默认配置', async () => {
      const configId = 1;
      const updateData = { isDefault: true };

      const mockExistingConfig = {
        id: 1,
        modelName: 'gpt-4',
        isDefault: false
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockExistingConfig);
      mockAIModelConfig.update
        .mockResolvedValueOnce([2]) // 清除其他默认配置
        .mockResolvedValueOnce([1]); // 设置当前为默认

      const result = await aiModelConfigService.updateModelConfig(configId, updateData);

      expect(mockAIModelConfig.update).toHaveBeenCalledWith(
        { isDefault: false },
        { where: { isDefault: true } }
      );
      expect(mockAIModelConfig.update).toHaveBeenCalledWith(
        updateData,
        { where: { id: configId } }
      );
    });

    it('应该处理数据库更新失败', async () => {
      const configId = 1;
      const updateData = { displayName: '更新失败' };

      const mockExistingConfig = {
        id: 1,
        modelName: 'gpt-4'
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockExistingConfig);
      mockAIModelConfig.update.mockRejectedValue(new Error('Database update failed'));

      await expect(aiModelConfigService.updateModelConfig(configId, updateData))
        .rejects.toThrow('Database update failed');
    });

    it('应该验证更新数据', async () => {
      const configId = 1;
      const invalidUpdateData = {
        contextWindow: -1, // 无效值
        maxTokens: 'invalid' // 类型错误
      };

      const mockExistingConfig = {
        id: 1,
        modelName: 'gpt-4'
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockExistingConfig);

      await expect(aiModelConfigService.updateModelConfig(configId, invalidUpdateData as any))
        .rejects.toThrow('无效的更新数据');

      expect(mockAIModelConfig.update).not.toHaveBeenCalled();
    });
  });

  describe('deleteModelConfig', () => {
    it('应该成功删除模型配置', async () => {
      const configId = 1;

      const mockExistingConfig = {
        id: 1,
        modelName: 'gpt-4',
        isDefault: false
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockExistingConfig);
      mockAIModelConfig.destroy.mockResolvedValue(1); // 删除成功

      const result = await aiModelConfigService.deleteModelConfig(configId);

      expect(mockAIModelConfig.findByPk).toHaveBeenCalledWith(configId);
      expect(mockAIModelConfig.destroy).toHaveBeenCalledWith({
        where: { id: configId }
      });
      expect(result).toBe(true);
    });

    it('应该处理配置不存在', async () => {
      const configId = 999;

      mockAIModelConfig.findByPk.mockResolvedValue(null);

      await expect(aiModelConfigService.deleteModelConfig(configId))
        .rejects.toThrow('模型配置不存在');

      expect(mockAIModelConfig.destroy).not.toHaveBeenCalled();
    });

    it('应该阻止删除默认配置', async () => {
      const configId = 1;

      const mockDefaultConfig = {
        id: 1,
        modelName: 'gpt-4',
        isDefault: true
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockDefaultConfig);

      await expect(aiModelConfigService.deleteModelConfig(configId))
        .rejects.toThrow('无法删除默认模型配置');

      expect(mockAIModelConfig.destroy).not.toHaveBeenCalled();
    });

    it('应该处理数据库删除失败', async () => {
      const configId = 1;

      const mockExistingConfig = {
        id: 1,
        modelName: 'gpt-4',
        isDefault: false
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockExistingConfig);
      mockAIModelConfig.destroy.mockRejectedValue(new Error('Database delete failed'));

      await expect(aiModelConfigService.deleteModelConfig(configId))
        .rejects.toThrow('Database delete failed');
    });
  });

  describe('getDefaultModelConfig', () => {
    it('应该成功获取默认模型配置', async () => {
      const mockDefaultConfig = {
        id: 1,
        modelName: 'gpt-4',
        displayName: 'GPT-4',
        provider: 'openai',
        isDefault: true,
        isActive: true
      };

      mockAIModelConfig.findOne.mockResolvedValue(mockDefaultConfig);

      const result = await aiModelConfigService.getDefaultModelConfig();

      expect(mockAIModelConfig.findOne).toHaveBeenCalledWith({
        where: {
          isDefault: true,
          isActive: true
        }
      });
      expect(result).toEqual(mockDefaultConfig);
    });

    it('应该处理没有默认配置', async () => {
      mockAIModelConfig.findOne.mockResolvedValue(null);

      const result = await aiModelConfigService.getDefaultModelConfig();

      expect(result).toBeNull();
    });

    it('应该处理数据库查询错误', async () => {
      const dbError = new Error('Database query failed');
      mockAIModelConfig.findOne.mockRejectedValue(dbError);

      await expect(aiModelConfigService.getDefaultModelConfig())
        .rejects.toThrow('Database query failed');
    });
  });

  describe('getModelConfigsByProvider', () => {
    it('应该成功按提供商获取配置', async () => {
      const provider = 'openai';
      const mockConfigs = [
        {
          id: 1,
          modelName: 'gpt-4',
          provider: 'openai',
          isActive: true
        },
        {
          id: 2,
          modelName: 'gpt-3.5-turbo',
          provider: 'openai',
          isActive: true
        }
      ];

      mockAIModelConfig.findAll.mockResolvedValue(mockConfigs);

      const result = await aiModelConfigService.getModelConfigsByProvider(provider);

      expect(mockAIModelConfig.findAll).toHaveBeenCalledWith({
        where: { provider },
        order: [['isDefault', 'DESC'], ['createdAt', 'DESC']]
      });
      expect(result).toEqual(mockConfigs);
    });

    it('应该处理提供商不存在', async () => {
      const provider = 'nonexistent';
      mockAIModelConfig.findAll.mockResolvedValue([]);

      const result = await aiModelConfigService.getModelConfigsByProvider(provider);

      expect(result).toEqual([]);
    });
  });

  describe('validateModelConfig', () => {
    it('应该成功验证有效配置', async () => {
      const configId = 1;
      const mockConfig = {
        id: 1,
        modelName: 'gpt-4',
        provider: 'openai',
        apiEndpoint: 'https://api.openai.com/v1',
        apiKey: 'sk-test-key',
        isActive: true
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockConfig);

      const result = await aiModelConfigService.validateModelConfig(configId);

      expect(result).toEqual({
        isValid: true,
        message: '配置验证成功'
      });
    });

    it('应该处理配置不存在', async () => {
      const configId = 999;
      mockAIModelConfig.findByPk.mockResolvedValue(null);

      const result = await aiModelConfigService.validateModelConfig(configId);

      expect(result).toEqual({
        isValid: false,
        message: '模型配置不存在'
      });
    });

    it('应该处理配置未激活', async () => {
      const configId = 1;
      const mockInactiveConfig = {
        id: 1,
        modelName: 'gpt-4',
        isActive: false
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockInactiveConfig);

      const result = await aiModelConfigService.validateModelConfig(configId);

      expect(result).toEqual({
        isValid: false,
        message: '模型配置未激活'
      });
    });

    it('应该处理缺少API密钥', async () => {
      const configId = 1;
      const mockConfigWithoutKey = {
        id: 1,
        modelName: 'gpt-4',
        apiEndpoint: 'https://api.openai.com/v1',
        apiKey: null,
        isActive: true
      };

      mockAIModelConfig.findByPk.mockResolvedValue(mockConfigWithoutKey);

      const result = await aiModelConfigService.validateModelConfig(configId);

      expect(result).toEqual({
        isValid: false,
        message: '缺少API密钥'
      });
    });
  });
});
