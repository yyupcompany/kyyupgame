/**
 * 用量配额控制器单元测试
 */

import { Request, Response } from 'express';
import { UsageQuotaController } from '../usage-quota.controller';
import { sequelize } from '../../init';
import { QueryTypes } from 'sequelize';

jest.mock('../../init', () => ({
  sequelize: {
    query: jest.fn()
  }
}));

describe('UsageQuotaController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let responseObject: any;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
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

  describe('getUserQuota', () => {
    it('应该成功获取用户配额信息', async () => {
      mockRequest.params = { userId: '1' };

      const mockQuotaSettings = [
        {
          id: 1,
          user_id: 1,
          monthly_quota: 10000,
          monthly_cost_quota: 100,
          warning_enabled: 1,
          warning_threshold: 80
        }
      ];

      const mockUsageStats = [
        {
          total_calls: '1500',
          total_cost: '15.678901'
        }
      ];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockQuotaSettings)
        .mockResolvedValueOnce(mockUsageStats);

      await UsageQuotaController.getUserQuota(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toHaveProperty('userId');
      expect(responseObject.data).toHaveProperty('monthlyQuota');
      expect(responseObject.data).toHaveProperty('monthlyCostQuota');
      expect(responseObject.data).toHaveProperty('currentMonthUsage');
      expect(responseObject.data).toHaveProperty('currentMonthCost');
      expect(responseObject.data).toHaveProperty('usagePercentage');
      expect(responseObject.data).toHaveProperty('costPercentage');
      expect(responseObject.data).toHaveProperty('warningEnabled');
      expect(responseObject.data).toHaveProperty('warningThreshold');
    });

    it('应该返回默认配额（当用户没有配额设置时）', async () => {
      mockRequest.params = { userId: '1' };

      (sequelize.query as jest.Mock).mockResolvedValue([]);

      await UsageQuotaController.getUserQuota(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.data.monthlyQuota).toBe(10000);
      expect(responseObject.data.monthlyCostQuota).toBe(100);
      expect(responseObject.data.warningEnabled).toBe(false);
      expect(responseObject.data.warningThreshold).toBe(80);
    });

    it('应该正确计算使用率', async () => {
      mockRequest.params = { userId: '1' };

      const mockQuotaSettings = [
        {
          monthly_quota: 10000,
          monthly_cost_quota: 100
        }
      ];

      const mockUsageStats = [
        {
          total_calls: '8000',
          total_cost: '90.123456'
        }
      ];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockQuotaSettings)
        .mockResolvedValueOnce(mockUsageStats);

      await UsageQuotaController.getUserQuota(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(responseObject.data.usagePercentage).toBe(80);
      expect(responseObject.data.costPercentage).toBeCloseTo(90.123456, 2);
    });
  });

  describe('updateUserQuota', () => {
    it('应该成功创建新配额', async () => {
      mockRequest.params = { userId: '1' };
      mockRequest.body = {
        monthlyQuota: 20000,
        monthlyCostQuota: 200,
        warningEnabled: true,
        warningThreshold: 85
      };

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce([]) // 查询不存在
        .mockResolvedValueOnce([1]); // 插入成功

      await UsageQuotaController.updateUserQuota(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.message).toBe('配额更新成功');
    });

    it('应该成功更新现有配额', async () => {
      mockRequest.params = { userId: '1' };
      mockRequest.body = {
        monthlyQuota: 15000,
        monthlyCostQuota: 150,
        warningEnabled: true,
        warningThreshold: 90
      };

      const mockExistingQuota = [
        {
          id: 1,
          monthly_quota: 10000,
          monthly_cost_quota: 100
        }
      ];

      (sequelize.query as jest.Mock)
        .mockResolvedValueOnce(mockExistingQuota) // 查询存在
        .mockResolvedValueOnce([1]); // 更新成功

      await UsageQuotaController.updateUserQuota(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.message).toBe('配额更新成功');
    });

    it('应该处理错误情况', async () => {
      mockRequest.params = { userId: '1' };
      mockRequest.body = {};

      (sequelize.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await UsageQuotaController.updateUserQuota(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toBe('更新用户配额失败');
    });
  });

  describe('getWarnings', () => {
    it('应该成功获取预警信息', async () => {
      const mockWarnings = [
        {
          user_id: 1,
          username: 'user1',
          real_name: '用户1',
          email: 'user1@example.com',
          monthly_quota: 10000,
          monthly_cost_quota: 100,
          warning_threshold: 80,
          current_usage: '9000',
          current_cost: '95.123456'
        },
        {
          user_id: 2,
          username: 'user2',
          real_name: '用户2',
          email: 'user2@example.com',
          monthly_quota: 5000,
          monthly_cost_quota: 50,
          warning_threshold: 80,
          current_usage: '5500',
          current_cost: '45.678901'
        }
      ];

      (sequelize.query as jest.Mock).mockResolvedValue(mockWarnings);

      await UsageQuotaController.getWarnings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toHaveLength(2);
      expect(responseObject.data[0]).toHaveProperty('userId');
      expect(responseObject.data[0]).toHaveProperty('username');
      expect(responseObject.data[0]).toHaveProperty('usagePercentage');
      expect(responseObject.data[0]).toHaveProperty('costPercentage');
    });

    it('应该返回空数组（当没有预警时）', async () => {
      (sequelize.query as jest.Mock).mockResolvedValue([]);

      await UsageQuotaController.getWarnings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.json).toHaveBeenCalled();
      expect(responseObject.success).toBe(true);
      expect(responseObject.data).toHaveLength(0);
    });

    it('应该处理错误情况', async () => {
      (sequelize.query as jest.Mock).mockRejectedValue(new Error('Database error'));

      await UsageQuotaController.getWarnings(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(responseObject.success).toBe(false);
      expect(responseObject.message).toBe('获取预警信息失败');
    });
  });
});

