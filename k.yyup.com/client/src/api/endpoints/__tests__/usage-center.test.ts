/**
 * 用量中心API端点单元测试
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUsageOverview,
  getUserUsageList,
  getUserUsageDetail,
  getMyUsage,
  getUserQuota,
  updateUserQuota,
  getWarnings,
  UsageType
} from '../usage-center';

// Mock request
vi.mock('@/utils/request', () => ({
  request: vi.fn()
}));

import { request } from '@/utils/request';

describe('UsageCenter API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUsageOverview', () => {
    it('应该成功获取用量概览', async () => {
      const mockResponse = {
        success: true,
        data: {
          totalCalls: 12500,
          totalCost: 138.456789,
          activeUsers: 45,
          usageByType: [
            { type: UsageType.TEXT, count: 10000, cost: 100.123456 },
            { type: UsageType.IMAGE, count: 2000, cost: 30.234567 }
          ]
        }
      };

      (request as any).mockResolvedValue(mockResponse);

      const result = await getUsageOverview();

      expect(request).toHaveBeenCalledWith({
        url: '/api1056',
        method: 'GET',
        params: undefined
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.totalCalls).toBe(12500);
      expect(result.data?.usageByType).toHaveLength(2);
    });

    it('应该支持日期范围参数', async () => {
      const mockResponse = { success: true, data: {} };
      (request as any).mockResolvedValue(mockResponse);

      const params = {
        startDate: '2024-01-01',
        endDate: '2024-01-31'
      };

      await getUsageOverview(params);

      expect(request).toHaveBeenCalledWith({
        url: '/api1681',
        method: 'GET',
        params
      });
    });
  });

  describe('getUserUsageList', () => {
    it('应该成功获取用户用量列表', async () => {
      const mockResponse = {
        success: true,
        data: {
          items: [
            {
              userId: 1,
              username: 'admin',
              realName: '管理员',
              email: 'admin@example.com',
              totalCalls: 1500,
              totalCost: 15.678901,
              totalTokens: 150000
            }
          ],
          total: 1,
          page: 1,
          pageSize: 20
        }
      };

      (request as any).mockResolvedValue(mockResponse);

      const result = await getUserUsageList({ page: 1, pageSize: 20 });

      expect(request).toHaveBeenCalledWith({
        url: '/api2477',
        method: 'GET',
        params: { page: 1, pageSize: 20 }
      });

      expect(result.success).toBe(true);
      expect(result.data?.items).toHaveLength(1);
      expect(result.data?.total).toBe(1);
    });
  });

  describe('getUserUsageDetail', () => {
    it('应该成功获取用户详细用量', async () => {
      const mockResponse = {
        success: true,
        data: {
          usageByType: [
            { type: UsageType.TEXT, count: 1000, cost: 10.123456, tokens: 100000 }
          ],
          usageByModel: [
            { modelId: 1, modelName: 'GPT-4', provider: 'openai', count: 500, cost: 5.123456 }
          ],
          recentUsage: [
            {
              id: 1,
              modelName: 'GPT-4',
              usageType: UsageType.TEXT,
              totalTokens: 1000,
              cost: 0.123456,
              createdAt: '2024-01-01T00:00:00.000Z'
            }
          ]
        }
      };

      (request as any).mockResolvedValue(mockResponse);

      const result = await getUserUsageDetail(1);

      expect(request).toHaveBeenCalledWith({
        url: '/api3587',
        method: 'GET',
        params: undefined
      });

      expect(result.success).toBe(true);
      expect(result.data?.usageByType).toHaveLength(1);
      expect(result.data?.usageByModel).toHaveLength(1);
      expect(result.data?.recentUsage).toHaveLength(1);
    });
  });

  describe('getMyUsage', () => {
    it('应该成功获取个人用量', async () => {
      const mockResponse = {
        success: true,
        data: {
          usageByType: [],
          usageByModel: [],
          recentUsage: []
        }
      };

      (request as any).mockResolvedValue(mockResponse);

      const result = await getMyUsage();

      expect(request).toHaveBeenCalledWith({
        url: '/api4297',
        method: 'GET',
        params: undefined
      });

      expect(result.success).toBe(true);
    });
  });

  describe('getUserQuota', () => {
    it('应该成功获取用户配额', async () => {
      const mockResponse = {
        success: true,
        data: {
          userId: 1,
          monthlyQuota: 10000,
          monthlyCostQuota: 100,
          currentMonthUsage: 1500,
          currentMonthCost: 15.678901,
          usagePercentage: 15,
          costPercentage: 15.678901,
          warningEnabled: true,
          warningThreshold: 80
        }
      };

      (request as any).mockResolvedValue(mockResponse);

      const result = await getUserQuota(1);

      expect(request).toHaveBeenCalledWith({
        url: '/api5047',
        method: 'GET'
      });

      expect(result.success).toBe(true);
      expect(result.data?.userId).toBe(1);
      expect(result.data?.monthlyQuota).toBe(10000);
    });
  });

  describe('updateUserQuota', () => {
    it('应该成功更新用户配额', async () => {
      const mockResponse = {
        success: true,
        message: '配额更新成功'
      };

      (request as any).mockResolvedValue(mockResponse);

      const quotaData = {
        monthlyQuota: 20000,
        monthlyCostQuota: 200,
        warningEnabled: true,
        warningThreshold: 85
      };

      const result = await updateUserQuota(1, quotaData);

      expect(request).toHaveBeenCalledWith({
        url: '/api5745',
        method: 'PUT',
        data: quotaData
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe('配额更新成功');
    });
  });

  describe('getWarnings', () => {
    it('应该成功获取预警信息', async () => {
      const mockResponse = {
        success: true,
        data: [
          {
            userId: 1,
            username: 'user1',
            realName: '用户1',
            email: 'user1@example.com',
            monthlyQuota: 10000,
            monthlyCostQuota: 100,
            currentUsage: 9000,
            currentCost: 95.123456,
            usagePercentage: 90,
            costPercentage: 95.123456,
            warningThreshold: 80
          }
        ]
      };

      (request as any).mockResolvedValue(mockResponse);

      const result = await getWarnings();

      expect(request).toHaveBeenCalledWith({
        url: '/api6630',
        method: 'GET'
      });

      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].usagePercentage).toBe(90);
    });
  });
});

