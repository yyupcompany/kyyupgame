// Mock dependencies
jest.mock('../../../../src/services/ai/model.service');
jest.mock('../../../../src/utils/apiError');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { ModelController } from '../../../../src/controllers/ai/model.controller';
import modelService from '../../../../src/services/ai/model.service';
import { ModelType, ModelStatus } from '../../../../src/models/ai-model-config.model';
import { ApiError } from '../../../../src/utils/apiError';

// Mock implementations
const mockModelService = {
  getAvailableModels: jest.fn(),
  getModelById: jest.fn(),
  createModel: jest.fn(),
  updateModel: jest.fn(),
  deleteModel: jest.fn(),
  getModelPricing: jest.fn(),
  updateModelPricing: jest.fn(),
  getModelUsageStats: jest.fn(),
  testModelConnection: jest.fn(),
  enableModel: jest.fn(),
  disableModel: jest.fn()
};

// Setup mocks
(modelService as any) = mockModelService;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: { id: 1, username: 'testuser' }
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn() as NextFunction;


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

describe('AI Model Controller', () => {
  let modelController: ModelController;

  beforeEach(() => {
    jest.clearAllMocks();
    modelController = new ModelController();
  });

  describe('getAvailableModels', () => {
    it('应该成功获取可用模型列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        type: 'text',
        status: 'active'
      };

      const mockModels = [
        {
          id: 1,
          name: 'GPT-4',
          provider: 'openai',
          type: ModelType.TEXT,
          status: ModelStatus.ACTIVE,
          apiEndpoint: 'https://api.openai.com/v1/chat/completions',
          maxTokens: 4096,
          pricing: {
            inputTokenPrice: 0.03,
            outputTokenPrice: 0.06,
            currency: 'USD'
          },
          capabilities: ['chat', 'completion'],
          description: 'GPT-4 模型，支持高质量的文本生成和对话',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 2,
          name: 'Claude-3',
          provider: 'anthropic',
          type: ModelType.TEXT,
          status: ModelStatus.ACTIVE,
          apiEndpoint: 'https://api.anthropic.com/v1/messages',
          maxTokens: 8192,
          pricing: {
            inputTokenPrice: 0.025,
            outputTokenPrice: 0.05,
            currency: 'USD'
          },
          capabilities: ['chat', 'analysis'],
          description: 'Claude-3 模型，擅长分析和推理',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      mockModelService.getAvailableModels.mockResolvedValue(mockModels);

      await modelController.getAvailableModels(req as Request, res as Response, mockNext);

      expect(mockModelService.getAvailableModels).toHaveBeenCalledWith({
        type: ModelType.TEXT,
        status: ModelStatus.ACTIVE
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockModels,
        message: '获取模型列表成功'
      });
    });

    it('应该使用默认参数获取模型列表', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockModels = [];
      mockModelService.getAvailableModels.mockResolvedValue(mockModels);

      await modelController.getAvailableModels(req as Request, res as Response, mockNext);

      expect(mockModelService.getAvailableModels).toHaveBeenCalledWith({
        type: undefined,
        status: ModelStatus.ACTIVE // 默认只返回active状态
      });
    });

    it('应该处理获取模型列表失败', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const serviceError = new Error('Database connection failed');
      mockModelService.getAvailableModels.mockRejectedValue(serviceError);

      await modelController.getAvailableModels(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(serviceError);
    });
  });

  describe('getModelById', () => {
    it('应该成功获取模型详情', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockModel = {
        id: 1,
        name: 'GPT-4',
        provider: 'openai',
        type: ModelType.TEXT,
        status: ModelStatus.ACTIVE,
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey: '***masked***',
        maxTokens: 4096,
        pricing: {
          inputTokenPrice: 0.03,
          outputTokenPrice: 0.06,
          currency: 'USD'
        },
        capabilities: ['chat', 'completion'],
        description: 'GPT-4 模型，支持高质量的文本生成和对话',
        configuration: {
          temperature: 0.7,
          topP: 1.0,
          frequencyPenalty: 0,
          presencePenalty: 0
        },
        usageStats: {
          totalRequests: 1250,
          totalTokens: 125000,
          averageResponseTime: 1.2,
          errorRate: 0.01
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockModelService.getModelById.mockResolvedValue(mockModel);

      await modelController.getModelById(req as Request, res as Response, mockNext);

      expect(mockModelService.getModelById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockModel,
        message: '获取模型详情成功'
      });
    });

    it('应该处理模型不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockModelService.getModelById.mockResolvedValue(null);

      await modelController.getModelById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '模型不存在'
        })
      );
    });

    it('应该处理无效的模型ID', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      const validationError = new Error('Invalid model ID');
      mockModelService.getModelById.mockRejectedValue(validationError);

      await modelController.getModelById(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });
  });

  describe('createModel', () => {
    it('应该成功创建模型配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'GPT-4-Turbo',
        provider: 'openai',
        type: ModelType.TEXT,
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        apiKey: 'sk-test-key',
        maxTokens: 8192,
        pricing: {
          inputTokenPrice: 0.01,
          outputTokenPrice: 0.03,
          currency: 'USD'
        },
        capabilities: ['chat', 'completion', 'function-calling'],
        description: 'GPT-4 Turbo 模型，更快更便宜的GPT-4版本',
        configuration: {
          temperature: 0.7,
          topP: 1.0,
          frequencyPenalty: 0,
          presencePenalty: 0
        }
      };

      const mockCreatedModel = {
        id: 3,
        ...req.body,
        status: ModelStatus.TESTING,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      mockModelService.createModel.mockResolvedValue(mockCreatedModel);

      await modelController.createModel(req as Request, res as Response, mockNext);

      expect(mockModelService.createModel).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedModel,
        message: '创建模型配置成功'
      });
    });

    it('应该验证必填字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'Test Model'
        // 缺少必填字段
      };

      const validationError = new Error('缺少必填字段');
      mockModelService.createModel.mockRejectedValue(validationError);

      await modelController.createModel(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(validationError);
    });

    it('应该处理模型名称重复', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'GPT-4',
        provider: 'openai',
        type: ModelType.TEXT
      };

      const duplicateError = new Error('模型名称已存在');
      mockModelService.createModel.mockRejectedValue(duplicateError);

      await modelController.createModel(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(duplicateError);
    });
  });

  describe('updateModel', () => {
    it('应该成功更新模型配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        name: 'GPT-4-Updated',
        maxTokens: 8192,
        pricing: {
          inputTokenPrice: 0.025,
          outputTokenPrice: 0.05,
          currency: 'USD'
        },
        description: '更新的GPT-4模型配置'
      };

      const mockUpdatedModel = {
        id: 1,
        name: 'GPT-4-Updated',
        provider: 'openai',
        type: ModelType.TEXT,
        status: ModelStatus.ACTIVE,
        maxTokens: 8192,
        pricing: {
          inputTokenPrice: 0.025,
          outputTokenPrice: 0.05,
          currency: 'USD'
        },
        description: '更新的GPT-4模型配置',
        updatedAt: new Date()
      };

      mockModelService.updateModel.mockResolvedValue(mockUpdatedModel);

      await modelController.updateModel(req as Request, res as Response, mockNext);

      expect(mockModelService.updateModel).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockUpdatedModel,
        message: '更新模型配置成功'
      });
    });

    it('应该处理更新不存在的模型', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { name: '不存在的模型' };

      mockModelService.updateModel.mockResolvedValue(null);

      await modelController.updateModel(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '模型不存在'
        })
      );
    });

    it('应该防止更新敏感字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        id: 999, // 尝试更新ID
        createdAt: new Date(), // 尝试更新创建时间
        name: '合法更新'
      };

      const mockUpdatedModel = {
        id: 1,
        name: '合法更新',
        updatedAt: new Date()
      };

      mockModelService.updateModel.mockResolvedValue(mockUpdatedModel);

      await modelController.updateModel(req as Request, res as Response, mockNext);

      // 验证服务层只接收到允许的字段
      expect(mockModelService.updateModel).toHaveBeenCalledWith(1, {
        name: '合法更新'
        // 不包含id和createdAt
      });
    });
  });

  describe('deleteModel', () => {
    it('应该成功删除模型配置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      mockModelService.deleteModel.mockResolvedValue(undefined);

      await modelController.deleteModel(req as Request, res as Response, mockNext);

      expect(mockModelService.deleteModel).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '删除模型配置成功'
      });
    });

    it('应该处理删除不存在的模型', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockModelService.deleteModel.mockResolvedValue(undefined);

      await modelController.deleteModel(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '模型不存在'
        })
      );
    });

    it('应该阻止删除正在使用的模型', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const usageError = new Error('模型正在使用中，无法删除');
      mockModelService.deleteModel.mockRejectedValue(usageError);

      await modelController.deleteModel(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(usageError);
    });
  });

  describe('getModelPricing', () => {
    it('应该成功获取模型计费信息', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockPricing = {
        modelId: 1,
        modelName: 'GPT-4',
        pricing: {
          inputTokenPrice: 0.03,
          outputTokenPrice: 0.06,
          currency: 'USD',
          billingUnit: 'per_1k_tokens'
        },
        usageStats: {
          totalCost: 125.50,
          totalTokens: 125000,
          averageCostPerRequest: 0.10
        },
        pricingHistory: [
          {
            effectiveDate: '2024-01-01',
            inputTokenPrice: 0.03,
            outputTokenPrice: 0.06
          }
        ]
      };

      mockModelService.getModelPricing.mockResolvedValue(mockPricing);

      await modelController.getModelPricing(req as Request, res as Response, mockNext);

      expect(mockModelService.getModelPricing).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPricing,
        message: '获取模型计费信息成功'
      });
    });

    it('应该处理模型不存在', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockModelService.getModelPricing.mockResolvedValue(null);

      await modelController.getModelPricing(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '模型不存在'
        })
      );
    });
  });

  describe('testModelConnection', () => {
    it('应该成功测试模型连接', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockTestResult = {
        modelId: 1,
        modelName: 'GPT-4',
        connectionStatus: 'success',
        responseTime: 1.2,
        testMessage: 'Hello, world!',
        testResponse: 'Hello! How can I help you today?',
        timestamp: new Date(),
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        statusCode: 200
      };

      mockModelService.testModelConnection.mockResolvedValue(mockTestResult);

      await modelController.testModelConnection(req as Request, res as Response, mockNext);

      expect(mockModelService.testModelConnection).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockTestResult,
        message: '模型连接测试成功'
      });
    });

    it('应该处理连接测试失败', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockTestResult = {
        modelId: 1,
        modelName: 'GPT-4',
        connectionStatus: 'failed',
        error: 'API key invalid',
        responseTime: null,
        timestamp: new Date(),
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        statusCode: 401
      };

      mockModelService.testModelConnection.mockResolvedValue(mockTestResult);

      await modelController.testModelConnection(req as Request, res as Response, mockNext);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        data: mockTestResult,
        message: '模型连接测试失败'
      });
    });

    it('应该处理测试过程中的异常', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const testError = new Error('Network timeout');
      mockModelService.testModelConnection.mockRejectedValue(testError);

      await modelController.testModelConnection(req as Request, res as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(testError);
    });
  });
});
