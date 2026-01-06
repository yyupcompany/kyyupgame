// Mock dependencies
jest.mock('../../../src/services/ai/ai-model-config.service');
jest.mock('../../../src/services/ai/ai-model-billing.service');
jest.mock('../../../src/services/ai/ai-conversation.service');
jest.mock('../../../src/utils/error-handler');
jest.mock('../../../src/init');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import AIController from '../../../src/controllers/ai.controller';
import AIModelConfigService from '../../../src/services/ai/ai-model-config.service';
import AIModelBillingService from '../../../src/services/ai/ai-model-billing.service';
import AIConversationService from '../../../src/services/ai/ai-conversation.service';
import { handleServiceError } from '../../../src/utils/error-handler';
import {
  validateApiResponse,
  validatePaginatedResponse,
  createApiValidationReport,
  validateHttpStatusCode,
  validateResponseTime
} from '../../utils/api-validation';

// Mock implementations
const mockAIModelConfigService = {
  getAllModels: jest.fn(),
  getModelById: jest.fn(),
  createModel: jest.fn(),
  updateModel: jest.fn(),
  deleteModel: jest.fn(),
  activateModel: jest.fn(),
  deactivateModel: jest.fn()
};

const mockAIModelBillingService = {
  getUsageStats: jest.fn(),
  getBillingHistory: jest.fn(),
  calculateCost: jest.fn(),
  updateQuota: jest.fn()
};

const mockAIConversationService = {
  createConversation: jest.fn(),
  getConversations: jest.fn(),
  getConversationById: jest.fn(),
  updateConversation: jest.fn(),
  deleteConversation: jest.fn(),
  addMessage: jest.fn()
};

// Setup mocks
(AIModelConfigService as any) = mockAIModelConfigService;
(AIModelBillingService as any) = mockAIModelBillingService;
(AIConversationService as any) = mockAIConversationService;

const mockRequest = () => ({
  body: {},
  query: {},
  params: {},
  user: null
} as Partial<Request>);

const mockResponse = () => {
  const res = {} as Partial<Response>;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};


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

describe('AI Controller', () => {
  let aiController: AIController;

  beforeEach(() => {
    jest.clearAllMocks();
    aiController = new AIController();
  });

  describe('Model Config Routes', () => {
    describe('getAllModels', () => {
      it('应该成功获取所有模型', async () => {
        const req = mockRequest();
        const res = mockResponse();

        const mockModels = [
          { id: 1, name: 'GPT-4', provider: 'OpenAI', active: true },
          { id: 2, name: 'Claude-3', provider: 'Anthropic', active: true }
        ];

        const startTime = Date.now();
        mockAIModelConfigService.getAllModels.mockResolvedValue(mockModels);

        await aiController.getAllModels(req as Request, res as Response);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(mockAIModelConfigService.getAllModels).toHaveBeenCalledWith(false);
        expect(res.status).toHaveBeenCalledWith(200);

        // 获取响应数据
        const responseData = (res.json as jest.Mock).mock.calls[0][0];

        // 严格验证API响应结构
        const apiValidation = validateApiResponse(responseData);
        expect(apiValidation.valid).toBe(true);

        // 验证状态码
        const statusCodeValidation = validateHttpStatusCode(200, [200]);
        expect(statusCodeValidation.valid).toBe(true);

        // 验证响应时间
        const responseTimeValidation = validateResponseTime(responseTime, 3000);
        expect(responseTimeValidation.valid).toBe(true);

        // 验证数据结构
        expect(responseData).toMatchObject({
          code: 200,
          message: 'success',
          success: true,
          data: mockModels
        });

        // 严格验证模型数据
        if (Array.isArray(responseData.data)) {
          responseData.data.forEach((model: any) => {
            expect(model).toHaveProperty('id');
            expect(model).toHaveProperty('name');
            expect(model).toHaveProperty('provider');
            expect(model).toHaveProperty('active');

            expect(typeof model.id).toBe('number');
            expect(typeof model.name).toBe('string');
            expect(typeof model.provider).toBe('string');
            expect(typeof model.active).toBe('boolean');
            expect(model.id).toBeGreaterThan(0);
          });
        }
      });

      it('应该支持只获取活跃模型', async () => {
        const req = mockRequest();
        const res = mockResponse();

        req.query = { activeOnly: 'true' };

        const mockActiveModels = [
          { id: 1, name: 'GPT-4', provider: 'OpenAI', active: true }
        ];

        const startTime = Date.now();
        mockAIModelConfigService.getAllModels.mockResolvedValue(mockActiveModels);

        await aiController.getAllModels(req as Request, res as Response);
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        expect(mockAIModelConfigService.getAllModels).toHaveBeenCalledWith(true);
        expect(res.status).toHaveBeenCalledWith(200);

        // 获取响应数据
        const responseData = (res.json as jest.Mock).mock.calls[0][0];

        // 严格验证API响应结构
        const apiValidation = validateApiResponse(responseData);
        expect(apiValidation.valid).toBe(true);

        // 验证响应时间
        const responseTimeValidation = validateResponseTime(responseTime, 2000);
        expect(responseTimeValidation.valid).toBe(true);

        // 验证数据结构
        expect(responseData.success).toBe(true);
        expect(responseData.code).toBe(200);
        expect(responseData.message).toBe('success');
        expect(Array.isArray(responseData.data)).toBe(true);

        // 验证所有返回的模型都是活跃的
        if (Array.isArray(responseData.data)) {
          responseData.data.forEach((model: any) => {
            expect(model.active).toBe(true);
            expect(typeof model.id).toBe('number');
            expect(typeof model.name).toBe('string');
            expect(typeof model.provider).toBe('string');
          });
        }

        expect(responseData.data).toEqual(mockActiveModels);
      });

      it('应该处理服务错误', async () => {
        const req = mockRequest();
        const res = mockResponse();

        const error = new Error('Service error');
        mockAIModelConfigService.getAllModels.mockRejectedValue(error);

        await aiController.getAllModels(req as Request, res as Response);

        // 验证错误处理器被正确调用
        expect(handleServiceError).toHaveBeenCalledWith(error, res);

        // 验证服务确实被调用了
        expect(mockAIModelConfigService.getAllModels).toHaveBeenCalledTimes(1);
      });
    });

    describe('getModelById', () => {
      it('应该成功获取指定模型', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.params = { id: '1' };

        const mockModel = {
          id: 1,
          name: 'GPT-4',
          provider: 'OpenAI',
          active: true
        };

        mockAIModelConfigService.getModelById.mockResolvedValue(mockModel);

        await aiController.getModelById(req as Request, res as Response);

        expect(mockAIModelConfigService.getModelById).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          code: 200,
          message: 'success',
          data: mockModel
        });
      });

      it('应该处理模型不存在的情况', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.params = { id: '999' };

        mockAIModelConfigService.getModelById.mockResolvedValue(null);

        await aiController.getModelById(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          code: 404,
          message: 'Model not found'
        });
      });

      it('应该处理无效的模型ID', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.params = { id: 'invalid' };

        const error = new Error('Invalid ID');
        mockAIModelConfigService.getModelById.mockRejectedValue(error);

        await aiController.getModelById(req as Request, res as Response);

        expect(handleServiceError).toHaveBeenCalledWith(error, res);
      });
    });

    describe('createModel', () => {
      it('应该成功创建模型', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.body = {
          name: 'New Model',
          endpointUrl: 'https://api.example.com',
          apiVersion: 'v1',
          modelType: 'text'
        };

        const mockCreatedModel = {
          id: 3,
          modelName: 'New Model',
          apiEndpoint: 'https://api.example.com',
          version: 'v1',
          capabilities: ['text']
        };

        mockAIModelConfigService.createModel.mockResolvedValue(mockCreatedModel);

        await aiController.createModel(req as Request, res as Response);

        expect(mockAIModelConfigService.createModel).toHaveBeenCalledWith({
          name: 'New Model',
          endpointUrl: 'https://api.example.com',
          apiVersion: 'v1',
          modelType: 'text',
          modelName: 'New Model',
          apiEndpoint: 'https://api.example.com',
          version: 'v1',
          capabilities: ['text']
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          code: 201,
          message: 'Model created successfully',
          data: mockCreatedModel
        });
      });

      it('应该处理字段映射', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.body = {
          modelName: 'Direct Model Name',
          apiEndpoint: 'https://direct.api.com',
          version: 'v2',
          capabilities: ['text', 'image']
        };

        const mockCreatedModel = { id: 4 };
        mockAIModelConfigService.createModel.mockResolvedValue(mockCreatedModel);

        await aiController.createModel(req as Request, res as Response);

        expect(mockAIModelConfigService.createModel).toHaveBeenCalledWith({
          modelName: 'Direct Model Name',
          apiEndpoint: 'https://direct.api.com',
          version: 'v2',
          capabilities: ['text', 'image']
        });
      });

      it('应该处理创建失败', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.body = { name: 'Invalid Model' };

        const error = new Error('Creation failed');
        mockAIModelConfigService.createModel.mockRejectedValue(error);

        await aiController.createModel(req as Request, res as Response);

        expect(handleServiceError).toHaveBeenCalledWith(error, res);
      });
    });

    describe('updateModel', () => {
      it('应该成功更新模型', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.params = { id: '1' };
        req.body = {
          name: 'Updated Model',
          active: false
        };

        const mockUpdatedModel = {
          id: 1,
          name: 'Updated Model',
          active: false
        };

        mockAIModelConfigService.updateModel.mockResolvedValue(mockUpdatedModel);

        await aiController.updateModel(req as Request, res as Response);

        expect(mockAIModelConfigService.updateModel).toHaveBeenCalledWith(1, req.body);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          code: 200,
          message: 'Model updated successfully',
          data: mockUpdatedModel
        });
      });

      it('应该处理更新不存在的模型', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.params = { id: '999' };
        req.body = { name: 'Updated Model' };

        const error = new Error('Model not found');
        mockAIModelConfigService.updateModel.mockRejectedValue(error);

        await aiController.updateModel(req as Request, res as Response);

        expect(handleServiceError).toHaveBeenCalledWith(error, res);
      });
    });

    describe('deleteModel', () => {
      it('应该成功删除模型', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.params = { id: '1' };

        mockAIModelConfigService.deleteModel.mockResolvedValue(undefined);

        await aiController.deleteModel(req as Request, res as Response);

        expect(mockAIModelConfigService.deleteModel).toHaveBeenCalledWith(1);
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          code: 200,
          message: 'Model deleted successfully'
        });
      });

      it('应该处理删除失败', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.params = { id: '1' };

        const error = new Error('Delete failed');
        mockAIModelConfigService.deleteModel.mockRejectedValue(error);

        await aiController.deleteModel(req as Request, res as Response);

        expect(handleServiceError).toHaveBeenCalledWith(error, res);
      });
    });
  });

  describe('Billing Routes', () => {
    describe('getUsageStats', () => {
      it('应该成功获取使用统计', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.query = {
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        };

        const mockStats = {
          totalTokens: 10000,
          totalCost: 25.50,
          requestCount: 150
        };

        mockAIModelBillingService.getUsageStats.mockResolvedValue(mockStats);

        await aiController.getUsageStats(req as Request, res as Response);

        expect(mockAIModelBillingService.getUsageStats).toHaveBeenCalledWith({
          startDate: '2024-01-01',
          endDate: '2024-01-31'
        });
        expect(res.status).toHaveBeenCalledWith(200);
        expect(res.json).toHaveBeenCalledWith({
          code: 200,
          message: 'success',
          data: mockStats
        });
      });

      it('应该处理无日期参数的请求', async () => {
        const req = mockRequest();
        const res = mockResponse();

        const mockStats = { totalTokens: 0, totalCost: 0, requestCount: 0 };
        mockAIModelBillingService.getUsageStats.mockResolvedValue(mockStats);

        await aiController.getUsageStats(req as Request, res as Response);

        expect(mockAIModelBillingService.getUsageStats).toHaveBeenCalledWith({});
      });
    });

    describe('getBillingHistory', () => {
      it('应该成功获取计费历史', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.query = {
          page: '1',
          pageSize: '10'
        };

        const mockHistory = {
          records: [
            { id: 1, date: '2024-01-01', cost: 10.50, tokens: 5000 },
            { id: 2, date: '2024-01-02', cost: 15.00, tokens: 7500 }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        };

        mockAIModelBillingService.getBillingHistory.mockResolvedValue(mockHistory);

        await aiController.getBillingHistory(req as Request, res as Response);

        expect(mockAIModelBillingService.getBillingHistory).toHaveBeenCalledWith({
          page: '1',
          pageSize: '10'
        });
        expect(res.json).toHaveBeenCalledWith({
          code: 200,
          message: 'success',
          data: mockHistory
        });
      });
    });
  });

  describe('Conversation Routes', () => {
    describe('createConversation', () => {
      it('应该成功创建对话', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.user = { id: 1, username: 'testuser' };
        req.body = {
          title: 'New Conversation',
          modelId: 1
        };

        const mockConversation = {
          id: 1,
          title: 'New Conversation',
          modelId: 1,
          userId: 1
        };

        mockAIConversationService.createConversation.mockResolvedValue(mockConversation);

        await aiController.createConversation(req as Request, res as Response);

        expect(mockAIConversationService.createConversation).toHaveBeenCalledWith({
          title: 'New Conversation',
          modelId: 1,
          userId: 1
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          code: 201,
          message: 'Conversation created successfully',
          data: mockConversation
        });
      });

      it('应该处理未登录用户', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.body = { title: 'New Conversation' };

        await aiController.createConversation(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          code: 401,
          message: 'User not authenticated'
        });
      });
    });

    describe('getConversations', () => {
      it('应该成功获取用户对话列表', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.user = { id: 1, username: 'testuser' };
        req.query = {
          page: '1',
          pageSize: '10'
        };

        const mockConversations = {
          conversations: [
            { id: 1, title: 'Conversation 1', userId: 1 },
            { id: 2, title: 'Conversation 2', userId: 1 }
          ],
          total: 2,
          page: 1,
          pageSize: 10
        };

        mockAIConversationService.getConversations.mockResolvedValue(mockConversations);

        await aiController.getConversations(req as Request, res as Response);

        expect(mockAIConversationService.getConversations).toHaveBeenCalledWith(1, {
          page: '1',
          pageSize: '10'
        });
        expect(res.json).toHaveBeenCalledWith({
          code: 200,
          message: 'success',
          data: mockConversations
        });
      });
    });

    describe('addMessage', () => {
      it('应该成功添加消息到对话', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.user = { id: 1, username: 'testuser' };
        req.params = { conversationId: '1' };
        req.body = {
          content: 'Hello, AI!',
          role: 'user'
        };

        const mockMessage = {
          id: 1,
          conversationId: 1,
          content: 'Hello, AI!',
          role: 'user',
          userId: 1
        };

        mockAIConversationService.addMessage.mockResolvedValue(mockMessage);

        await aiController.addMessage(req as Request, res as Response);

        expect(mockAIConversationService.addMessage).toHaveBeenCalledWith(1, {
          content: 'Hello, AI!',
          role: 'user',
          userId: 1
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
          code: 201,
          message: 'Message added successfully',
          data: mockMessage
        });
      });

      it('应该验证消息内容', async () => {
        const req = mockRequest();
        const res = mockResponse();
        
        req.user = { id: 1, username: 'testuser' };
        req.params = { conversationId: '1' };
        req.body = {
          role: 'user'
          // 缺少content
        };

        await aiController.addMessage(req as Request, res as Response);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({
          code: 400,
          message: 'Message content is required'
        });
      });
    });
  });
});
