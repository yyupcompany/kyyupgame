/**
 * 用量中心控制器单元测试
 */

import { Request, Response } from 'express';
import { UsageCenterController } from '../usage-center.controller';
import { sequelize } from '../../init';
import { QueryTypes } from 'sequelize';

// Mock sequelize
jest.mock('../../init', () => ({
  sequelize: {
    query: jest.fn(),
    fn: jest.fn(),
    col: jest.fn()
  }
}));

describe('UsageCenterController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {
      query: {},
      params: {},
      user: { id: 1, role: 'admin' }
    } as any;

    responseObject = {
      success: false,
      data: null,
      message: ''
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn((result) => {
        responseObject = result;
        return mockResponse;
      }) as any
    } as any;

    jest.clearAllMocks();
  });

  describe('getOverview', () => {
    it('应该成功获取用量概览统计', async () => {
      // Mock数据
      const mockCountResult = [{ count: 12500 }];
      const mockCostResult = [{ sum: 138.456789 }];
      const mockUsageByType = [
        { usageType: 'text', count: '10000', totalCost: '100.123456' },
        { usageType: 'image', count: '2000', totalCost: '30.234567' }
      ];
      const mockActiveUsers = [{ userId: 1 }, { userId: 2 }, { userId: 3 }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockCountResult) // totalCalls
        .mockResolvedValueOnce(mockCostResult) // totalCost
        .mockResolvedValueOnce(mockUsageByType) // usageByType
        .mockResolvedValueOnce(mockActiveUsers); // activeUsers

      await UsageCenterController.getOverview(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toHaveProperty('totalCalls');
      expect(responseObject.data).toHaveProperty('totalCost');
      expect(responseObject.data).toHaveProperty('activeUsers');
      expect(responseObject.data).toHaveProperty('usageByType');
      expect(responseObject.data.usageByType).toHaveLength(2);
    });

    it('应该处理日期范围参数', async () => {
      mockRequest.query = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      (sequelize.query as jest.Mock).mockResolvedValue([]);

      await UsageCenterController.getOverview(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalled();
    });

    it('应该处理错误情况', async () => {
      (sequelize.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await UsageCenterController.getOverview(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toBe('获取用量概览失败');
    });
  });

  describe('getUserUsageList', () => {
    it('应该成功获取用户用量列表', async () => {
      const mockUserUsageStats = [
        {
          userId: 1,
          user: { id: 1, username: 'admin', real_name: '管理员', email: 'admin@example.com' },
          get: (key: string) => {
            const data: any = {
              totalCalls: '1500',
              totalCost: 15.678901,
              totalTokens: '150000'
            };
            return data[key];
          }
        }
      ];

      const mockTotalResult = [{ count: '10' }];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockUserUsageStats)
        .mockResolvedValueOnce(mockTotalResult);

      mockRequest.query = {
        page: '1',
        pageSize: '20'
      };

      await UsageCenterController.getUserUsageList(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toHaveProperty('items');
      expect(responseObject.data).toHaveProperty('total');
      expect(responseObject.data).toHaveProperty('page');
      expect(responseObject.data).toHaveProperty('pageSize');
    });

    it('应该处理分页参数', async () => {
      mockRequest.query = {
        page: '2',
        pageSize: '50'
      };

      (sequelize.query as jest.Mock).mockResolvedValue([]);

      await UsageCenterController.getUserUsageList(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(sequelize.query).toHaveBeenCalled();
    });
  });

  describe('getUserUsageDetail', () => {
    it('应该成功获取用户详细用量', async () => {
      mockRequest.params = { userId: '1' };

      const mockUsageByType = [
        { usageType: 'text', count: '1000', totalCost: '10.123456', totalTokens: '100000' }
      ];

      const mockUsageByModel = [
        {
          modelId: 1,
          modelConfig: { id: 1, name: 'gpt-4', display_name: 'GPT-4', provider: 'openai' },
          get: (key: string) => {
            const data: any = {
              count: '500',
              totalCost: 5.123456
            };
            return data[key];
          }
        }
      ];

      const mockRecentUsage = [
        {
          id: 1,
          modelConfig: { name: 'gpt-4', display_name: 'GPT-4' },
          usageType: 'text',
          totalTokens: 1000,
          cost: 0.123456,
          createdAt: '2024-01-01T00:00:00.000Z'
        }
      ];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockUsageByType)
        .mockResolvedValueOnce(mockUsageByModel)
        .mockResolvedValueOnce(mockRecentUsage);

      await UsageCenterController.getUserUsageDetail(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toHaveProperty('usageByType');
      expect(responseObject.data).toHaveProperty('usageByModel');
      expect(responseObject.data).toHaveProperty('recentUsage');
    });
  });

  describe('getMyUsage', () => {
    it('应该成功获取当前用户的用量统计', async () => {
      mockRequest.user = { id: 1 } as any;

      const mockUsageByType = [
        { usageType: 'text', count: '1000', totalCost: '10.123456', totalTokens: '100000' }
      ];

      (sequelize.query as jest.Mock).mockResolvedValue(mockUsageByType);

      await UsageCenterController.getMyUsage(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
    });

    it('应该处理未授权访问', async () => {
      mockRequest.user = undefined;

      await UsageCenterController.getMyUsage(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toBe('未授权访问');
    });
  });
});

