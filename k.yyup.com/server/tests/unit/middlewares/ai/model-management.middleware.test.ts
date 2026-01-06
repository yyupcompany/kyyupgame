import { 
  aiModelManagementMiddleware,
  IAiModelManagementMiddleware
} from '../../../src/middlewares/ai/model-management.middleware';
import { vi } from 'vitest'
import {
  aiModelConfigService,
  aiModelUsageService,
  aiModelBillingService
} from '../../../src/services/ai';

// Mock dependencies
jest.mock('../../../src/services/ai');


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

describe('AiModelManagementMiddleware', () => {
  let middleware: IAiModelManagementMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = aiModelManagementMiddleware;
  });

  describe('getAvailableModels', () => {
    const userId = 1;
    const mockModels = [
      {
        id: 1,
        modelName: 'GPT-4',
        description: 'Advanced language model',
        provider: 'OpenAI',
        version: '4.0',
        capabilities: ['text-generation', 'reasoning'],
        isActive: true
      },
      {
        id: 2,
        modelName: 'GPT-3.5',
        description: 'Fast language model',
        provider: 'OpenAI',
        version: '3.5',
        capabilities: ['text-generation'],
        isActive: true
      }
    ];

    it('should return available models successfully', async () => {
      (aiModelConfigService.getAllModels as jest.Mock).mockResolvedValue(mockModels);

      const result = await middleware.getAvailableModels(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        {
          id: 1,
          modelName: 'GPT-4',
          provider: 'OpenAI',
          version: '4.0',
          capabilities: ['text-generation', 'reasoning'],
          isActive: true
        },
        {
          id: 2,
          modelName: 'GPT-3.5',
          provider: 'OpenAI',
          version: '3.5',
          capabilities: ['text-generation'],
          isActive: true
        }
      ]);
      expect(aiModelConfigService.getAllModels).toHaveBeenCalled();
    });

    it('should handle empty model list', async () => {
      (aiModelConfigService.getAllModels as jest.Mock).mockResolvedValue([]);

      const result = await middleware.getAvailableModels(userId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
    });

    it('should handle service error', async () => {
      const error = new Error('Failed to fetch models');
      (aiModelConfigService.getAllModels as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getAvailableModels(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
      expect(result.error?.message).toBe('服务操作失败');
    });
  });

  describe('getModelDetails', () => {
    const userId = 1;
    const modelId = 1;
    const mockModel = {
      id: modelId,
      modelName: 'GPT-4',
      description: 'Advanced language model',
      provider: 'OpenAI',
      version: '4.0',
      capabilities: ['text-generation', 'reasoning'],
      isActive: true,
      parameters: {
        maxTokens: 8192,
        temperature: 0.7
      }
    };
    const mockUsageStats = {
      totalRequests: 1000,
      successfulRequests: 950,
      totalTokens: 50000,
      totalCost: 25.00,
      averageProcessingTime: 1.2
    };
    const mockUserUsageStats = {
      totalRequests: 50,
      successfulRequests: 48,
      totalTokens: 2500,
      totalCost: 1.25
    };
    const mockBillingInfo = {
      inputTokenPrice: 0.001,
      outputTokenPrice: 0.002,
      currencyCode: 'USD'
    };

    it('should return model details successfully', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);
      (aiModelUsageService.getModelUsageStats as jest.Mock).mockResolvedValue(mockUsageStats);
      (aiModelUsageService.getUserUsageStats as jest.Mock).mockResolvedValue(mockUserUsageStats);
      (aiModelBillingService.getCurrentBillingRule as jest.Mock).mockResolvedValue(mockBillingInfo);

      const result = await middleware.getModelDetails(userId, modelId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(
        expect.objectContaining({
          ...mockModel,
          usageStats: mockUsageStats,
          userUsageStats: mockUserUsageStats,
          billingInfo: mockBillingInfo
        })
      );
      expect(aiModelConfigService.getModelById).toHaveBeenCalledWith(modelId);
      expect(aiModelUsageService.getModelUsageStats).toHaveBeenCalledWith(modelId, expect.any(Date), expect.any(Date));
      expect(aiModelUsageService.getUserUsageStats).toHaveBeenCalledWith(userId, expect.any(Date), expect.any(Date));
      expect(aiModelBillingService.getCurrentBillingRule).toHaveBeenCalledWith(modelId);
    });

    it('should handle model not found', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getModelDetails(userId, modelId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('模型不存在');
    });

    it('should handle service error in model config', async () => {
      const error = new Error('Failed to fetch model details');
      (aiModelConfigService.getModelById as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getModelDetails(userId, modelId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('updateUserModelPreference', () => {
    const userId = 1;
    const modelId = 1;
    const mockModel = {
      id: modelId,
      modelName: 'GPT-4',
      isActive: true
    };

    it('should return service unavailable error', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);

      const result = await middleware.updateUserModelPreference(userId, modelId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_UNAVAILABLE');
      expect(result.error?.message).toBe('更新模型偏好功能暂不可用');
    });

    it('should handle model not found', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(null);

      const result = await middleware.updateUserModelPreference(userId, modelId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('模型不存在');
    });
  });

  describe('getUserModelUsage', () => {
    const userId = 1;
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const mockUsageStats = {
      totalRequests: 100,
      successfulRequests: 95,
      totalTokens: 5000,
      totalCost: 2.50,
      usageByType: {
        text: 80,
        reasoning: 20
      }
    };

    it('should return user model usage successfully', async () => {
      (aiModelUsageService.getUserUsageStats as jest.Mock).mockResolvedValue(mockUsageStats);

      const result = await middleware.getUserModelUsage(userId, startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalRequests: 100,
        successfulRequests: 95,
        totalTokens: 5000,
        totalCost: 2.50,
        usageByType: {
          text: 80,
          reasoning: 20
        }
      });
      expect(aiModelUsageService.getUserUsageStats).toHaveBeenCalledWith(userId, startDate, endDate);
    });

    it('should handle service error', async () => {
      const error = new Error('Failed to fetch usage stats');
      (aiModelUsageService.getUserUsageStats as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getUserModelUsage(userId, startDate, endDate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });

    it('should handle empty usage stats', async () => {
      const emptyStats = {
        totalRequests: 0,
        successfulRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        usageByType: {}
      };
      (aiModelUsageService.getUserUsageStats as jest.Mock).mockResolvedValue(emptyStats);

      const result = await middleware.getUserModelUsage(userId, startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(emptyStats);
    });
  });

  describe('getModelUsageStats', () => {
    const modelId = 1;
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-31');
    const mockModel = {
      id: modelId,
      modelName: 'GPT-4',
      isActive: true
    };
    const mockUsageStats = {
      totalRequests: 1000,
      successfulRequests: 950,
      totalTokens: 50000,
      totalCost: 25.00,
      averageProcessingTime: 1.2
    };

    it('should return model usage stats successfully', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);
      (aiModelUsageService.getModelUsageStats as jest.Mock).mockResolvedValue(mockUsageStats);

      const result = await middleware.getModelUsageStats(modelId, startDate, endDate);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        modelId,
        modelName: 'GPT-4',
        totalRequests: 1000,
        successfulRequests: 950,
        totalTokens: 50000,
        totalCost: 25.00,
        averageProcessingTime: 1.2
      });
      expect(aiModelConfigService.getModelById).toHaveBeenCalledWith(modelId);
      expect(aiModelUsageService.getModelUsageStats).toHaveBeenCalledWith(modelId, startDate, endDate);
    });

    it('should handle model not found', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getModelUsageStats(modelId, startDate, endDate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('模型不存在');
    });

    it('should handle service error', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);
      const error = new Error('Failed to fetch model stats');
      (aiModelUsageService.getModelUsageStats as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getModelUsageStats(modelId, startDate, endDate);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('getUserBillingInfo', () => {
    const userId = 1;

    it('should return service unavailable error', async () => {
      const result = await middleware.getUserBillingInfo(userId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_UNAVAILABLE');
      expect(result.error?.message).toBe('计费信息查询功能暂不可用');
    });
  });

  describe('calculateCost', () => {
    const inputTokens = 1000;
    const outputTokens = 500;
    const modelId = 1;
    const mockModel = {
      id: modelId,
      modelName: 'GPT-4',
      isActive: true
    };
    const mockCostResult = {
      totalCost: 2.00,
      inputCost: 1.00,
      outputCost: 1.00
    };

    it('should calculate cost successfully', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);
      (aiModelBillingService.calculateCost as jest.Mock).mockResolvedValue(mockCostResult);

      const result = await middleware.calculateCost(inputTokens, outputTokens, modelId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ cost: 2.00 });
      expect(aiModelConfigService.getModelById).toHaveBeenCalledWith(modelId);
      expect(aiModelBillingService.calculateCost).toHaveBeenCalledWith(modelId, inputTokens, outputTokens);
    });

    it('should handle model not found', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(null);

      const result = await middleware.calculateCost(inputTokens, outputTokens, modelId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
      expect(result.error?.message).toBe('模型不存在');
    });

    it('should handle service error', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);
      const error = new Error('Failed to calculate cost');
      (aiModelBillingService.calculateCost as jest.Mock).mockRejectedValue(error);

      const result = await middleware.calculateCost(inputTokens, outputTokens, modelId);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });

    it('should handle zero tokens', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);
      (aiModelBillingService.calculateCost as jest.Mock).mockResolvedValue({ totalCost: 0 });

      const result = await middleware.calculateCost(0, 0, modelId);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ cost: 0 });
    });
  });

  describe('processPayment', () => {
    const userId = 1;
    const amount = 10.00;
    const paymentMethod = 'credit_card';

    it('should return service unavailable error', async () => {
      const result = await middleware.processPayment(userId, amount, paymentMethod);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_UNAVAILABLE');
      expect(result.error?.message).toBe('支付处理功能暂不可用');
    });

    it('should validate amount', async () => {
      const result = await middleware.processPayment(userId, 0, paymentMethod);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('支付金额必须大于0');
    });

    it('should validate negative amount', async () => {
      const result = await middleware.processPayment(userId, -10, paymentMethod);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('支付金额必须大于0');
    });

    it('should validate payment method', async () => {
      const result = await middleware.processPayment(userId, amount, 'invalid_method');

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('VALIDATION_FAILED');
      expect(result.error?.message).toBe('无效的支付方式');
    });
  });

  describe('aggregateUsageByDay', () => {
    const userId = 1;
    const startDate = new Date('2024-01-01');
    const endDate = new Date('2024-01-03');
    const usageStats = [
      {
        modelId: 1,
        totalTokens: 1000,
        inputTokens: 600,
        outputTokens: 400,
        timestamp: new Date('2024-01-01T10:00:00Z')
      },
      {
        modelId: 1,
        totalTokens: 1500,
        inputTokens: 900,
        outputTokens: 600,
        timestamp: new Date('2024-01-01T14:00:00Z')
      },
      {
        modelId: 1,
        totalTokens: 800,
        inputTokens: 500,
        outputTokens: 300,
        timestamp: new Date('2024-01-02T10:00:00Z')
      }
    ];

    it('should aggregate usage by day correctly', () => {
      const middlewareInstance = (middleware as any);
      const result = middlewareInstance.aggregateUsageByDay(usageStats, startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result[0]).toEqual({
        date: '2024-01-01',
        totalTokens: 2500,
        inputTokens: 1500,
        outputTokens: 1000
      });
      expect(result[1]).toEqual({
        date: '2024-01-02',
        totalTokens: 800,
        inputTokens: 500,
        outputTokens: 300
      });
      expect(result[2]).toEqual({
        date: '2024-01-03',
        totalTokens: 0,
        inputTokens: 0,
        outputTokens: 0
      });
    });

    it('should handle empty usage stats', () => {
      const middlewareInstance = (middleware as any);
      const result = middlewareInstance.aggregateUsageByDay([], startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result.every(day => day.totalTokens === 0)).toBe(true);
    });

    it('should handle usage stats outside date range', () => {
      const outOfRangeStats = [
        {
          modelId: 1,
          totalTokens: 1000,
          inputTokens: 600,
          outputTokens: 400,
          timestamp: new Date('2023-12-31T10:00:00Z')
        }
      ];

      const middlewareInstance = (middleware as any);
      const result = middlewareInstance.aggregateUsageByDay(outOfRangeStats, startDate, endDate);

      expect(result).toHaveLength(3);
      expect(result.every(day => day.totalTokens === 0)).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors consistently', async () => {
      const error = new Error('Service unavailable');
      (aiModelConfigService.getAllModels as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getAvailableModels(1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
      expect(result.error?.message).toBe('服务操作失败');
    });

    it('should handle network errors', async () => {
      const error = new Error('Network error');
      (aiModelUsageService.getUserUsageStats as jest.Mock).mockRejectedValue(error);

      const result = await middleware.getUserModelUsage(
        1,
        new Date('2024-01-01'),
        new Date('2024-01-31')
      );

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });

    it('should handle validation errors from services', async () => {
      const error = new Error('Invalid parameters');
      (aiModelBillingService.calculateCost as jest.Mock).mockRejectedValue(error);

      const result = await middleware.calculateCost(1000, 500, 1);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('SERVICE_ERROR');
    });
  });

  describe('Edge Cases', () => {
    it('should handle very large token counts', async () => {
      const mockModel = { id: 1, modelName: 'GPT-4', isActive: true };
      const mockCostResult = { totalCost: 1000.00 };

      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);
      (aiModelBillingService.calculateCost as jest.Mock).mockResolvedValue(mockCostResult);

      const result = await middleware.calculateCost(1000000, 500000, 1);

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ cost: 1000.00 });
    });

    it('should handle date ranges correctly', async () => {
      const mockModel = { id: 1, modelName: 'GPT-4', isActive: true };
      const mockUsageStats = { totalRequests: 100 };

      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(mockModel);
      (aiModelUsageService.getModelUsageStats as jest.Mock).mockResolvedValue(mockUsageStats);

      const startDate = new Date('2024-01-01T00:00:00Z');
      const endDate = new Date('2024-01-31T23:59:59Z');

      const result = await middleware.getModelUsageStats(1, startDate, endDate);

      expect(result.success).toBe(true);
      expect(aiModelUsageService.getModelUsageStats).toHaveBeenCalledWith(1, startDate, endDate);
    });

    it('should handle invalid model IDs', async () => {
      (aiModelConfigService.getModelById as jest.Mock).mockResolvedValue(null);

      const result = await middleware.getModelDetails(1, 999);

      expect(result.success).toBe(false);
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });
});