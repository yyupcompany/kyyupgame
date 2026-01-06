// Mock dependencies
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/init');
jest.mock('../../../src/utils/logger');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { CustomerPoolCenterController } from '../../../src/controllers/centers/customer-pool-center.controller';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { sequelize } from '../../../src/init';
import { logger } from '../../../src/utils/logger';

// Mock implementations
const mockSequelize = {
  query: jest.fn()
};

(sequelize as any) = mockSequelize;

const mockRequest = () => ({
  user: { id: 1, role: 'admin' }
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

describe('CustomerPoolCenterController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = mockRequest();
    mockResponse = mockResponse();
    
    // Reset all mock implementations
    mockSequelize.query.mockReset();
    (ApiResponse.success as jest.Mock).mockClear();
    (ApiResponse.handleError as jest.Mock).mockClear();
    (logger.error as jest.Mock).mockClear();
  });

  describe('getDashboard', () => {
    it('should return dashboard data successfully', async () => {
      // Mock successful database queries
      mockSequelize.query
        .mockResolvedValueOnce([{ total: 100 }]) // totalCustomers
        .mockResolvedValueOnce([{ total: 60 }]) // activeCustomers
        .mockResolvedValueOnce([{ total: 30 }]) // potentialCustomers
        .mockResolvedValueOnce([{ total: 10 }]) // convertedCustomers
        .mockResolvedValueOnce([{ rate: 10.5 }]) // conversionRate
        .mockResolvedValueOnce([
          { id: 1, name: 'Pool 1', customer_count: 25 },
          { id: 2, name: 'Pool 2', customer_count: 15 }
        ]) // customerPools
        .mockResolvedValueOnce([
          { id: 1, name: 'Customer 1', status: 'active' },
          { id: 2, name: 'Customer 2', status: 'potential' }
        ]) // recentCustomers
        .mockResolvedValueOnce([
          { status: 'active', count: 60, percentage: 60 },
          { status: 'potential', count: 30, percentage: 30 },
          { status: 'converted', count: 10, percentage: 10 }
        ]) // conversionAnalysis
        .mockResolvedValueOnce([
          { channel: 'Website', customer_count: 50, converted_count: 15, conversion_rate: 30 },
          { channel: 'Referral', customer_count: 30, converted_count: 12, conversion_rate: 40 }
        ]); // channelAnalysis

      await CustomerPoolCenterController.getDashboard(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          poolStatistics: expect.objectContaining({
            totalCustomers: 100,
            activeCustomers: 60,
            potentialCustomers: 30,
            convertedCustomers: 10,
            conversionRate: 10.5
          }),
          customerPools: expect.objectContaining({
            data: expect.arrayContaining([
              expect.objectContaining({ id: 1, name: 'Pool 1' }),
              expect.objectContaining({ id: 2, name: 'Pool 2' })
            ])
          }),
          recentCustomers: expect.arrayContaining([
            expect.objectContaining({ id: 1, name: 'Customer 1' }),
            expect.objectContaining({ id: 2, name: 'Customer 2' })
          ]),
          conversionAnalysis: expect.arrayContaining([
            expect.objectContaining({ status: 'active', count: 60 }),
            expect.objectContaining({ status: 'potential', count: 30 }),
            expect.objectContaining({ status: 'converted', count: 10 })
          ]),
          channelAnalysis: expect.arrayContaining([
            expect.objectContaining({ channel: 'Website', customer_count: 50 }),
            expect.objectContaining({ channel: 'Referral', customer_count: 30 })
          ]),
          meta: expect.objectContaining({
            userId: 1,
            userRole: 'admin',
            responseTime: expect.any(Number),
            dataCount: expect.objectContaining({
              pools: 2,
              customers: 2,
              channels: 2
            })
          })
        }),
        '客户池中心仪表板数据获取成功'
      );
    });

    it('should handle database query errors gracefully', async () => {
      // Mock database errors
      mockSequelize.query.mockRejectedValue(new Error('Database connection failed'));

      await CustomerPoolCenterController.getDashboard(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ApiResponse.handleError).toHaveBeenCalledWith(
        mockResponse,
        expect.any(Error),
        '客户池中心仪表板数据获取失败'
      );
      expect(logger.error).toHaveBeenCalledWith(
        '客户池中心仪表板数据获取失败',
        expect.objectContaining({
          error: expect.any(Error),
          responseTime: expect.any(Number)
        })
      );
    });

    it('should handle partial database failures with default values', async () => {
      // Mock some successful queries and some failures
      mockSequelize.query
        .mockResolvedValueOnce([{ total: 100 }]) // totalCustomers - success
        .mockRejectedValueOnce(new Error('Query failed')) // activeCustomers - fail
        .mockRejectedValueOnce(new Error('Query failed')) // potentialCustomers - fail
        .mockResolvedValueOnce([{ total: 10 }]) // convertedCustomers - success
        .mockRejectedValueOnce(new Error('Query failed')) // conversionRate - fail
        .mockResolvedValueOnce([]) // customerPools - success (empty)
        .mockRejectedValueOnce(new Error('Query failed')) // recentCustomers - fail
        .mockResolvedValueOnce([]) // conversionAnalysis - success (empty)
        .mockResolvedValueOnce([]); // channelAnalysis - success (empty)

      await CustomerPoolCenterController.getDashboard(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          poolStatistics: expect.objectContaining({
            totalCustomers: 100,
            activeCustomers: 0, // Default value
            potentialCustomers: 0, // Default value
            convertedCustomers: 10,
            conversionRate: 0 // Default value
          }),
          customerPools: expect.objectContaining({
            data: [],
            pagination: { page: 1, pageSize: 10, total: 0 }
          }),
          recentCustomers: [], // Default value
          conversionAnalysis: [],
          channelAnalysis: []
        }),
        '客户池中心仪表板数据获取成功'
      );
    });

    it('should handle missing user information', async () => {
      const requestWithoutUser = {} as Partial<Request>;
      
      mockSequelize.query.mockResolvedValue([{ total: 0 }]);

      await CustomerPoolCenterController.getDashboard(
        requestWithoutUser as Request,
        mockResponse as Response
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          meta: expect.objectContaining({
            userId: undefined,
            userRole: undefined
          })
        }),
        '客户池中心仪表板数据获取成功'
      );
    });

    it('should execute all queries in parallel', async () => {
      // Mock all queries to take different amounts of time
      const queryPromises = [
        new Promise(resolve => setTimeout(() => resolve([{ total: 100 }]), 10)),
        new Promise(resolve => setTimeout(() => resolve([{ total: 60 }]), 20)),
        new Promise(resolve => setTimeout(() => resolve([{ total: 30 }]), 5)),
        new Promise(resolve => setTimeout(() => resolve([{ total: 10 }]), 15)),
        new Promise(resolve => setTimeout(() => resolve([{ rate: 10.5 }]), 8)),
        new Promise(resolve => setTimeout(() => resolve([{ id: 1, name: 'Pool 1' }]), 12)),
        new Promise(resolve => setTimeout(() => resolve([{ id: 1, name: 'Customer 1' }]), 7)),
        new Promise(resolve => setTimeout(() => resolve([{ status: 'active', count: 60 }]), 18)),
        new Promise(resolve => setTimeout(() => resolve([{ channel: 'Website', customer_count: 50 }]), 3))
      ];

      mockSequelize.query.mockImplementation(() => {
        return queryPromises.shift();
      });

      const startTime = Date.now();
      await CustomerPoolCenterController.getDashboard(
        mockRequest as Request,
        mockResponse as Response
      );
      const endTime = Date.now();

      // All queries should complete in roughly the time of the longest query (20ms)
      // Allow some buffer for test execution overhead
      expect(endTime - startTime).toBeLessThan(100);
      
      expect(ApiResponse.success).toHaveBeenCalled();
    });

    it('should log performance metrics', async () => {
      mockSequelize.query.mockResolvedValue([{ total: 0 }]);

      await CustomerPoolCenterController.getDashboard(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(ApiResponse.success).toHaveBeenCalledWith(
        mockResponse,
        expect.objectContaining({
          meta: expect.objectContaining({
            responseTime: expect.any(Number)
          })
        }),
        expect.any(String)
      );
    });
  });

  describe('getPoolStatistics', () => {
    it('should return correct pool statistics', async () => {
      mockSequelize.query
        .mockResolvedValueOnce([{ total: 100 }])
        .mockResolvedValueOnce([{ total: 60 }])
        .mockResolvedValueOnce([{ total: 30 }])
        .mockResolvedValueOnce([{ total: 10 }])
        .mockResolvedValueOnce([{ rate: 10.5 }]);

      const result = await (CustomerPoolCenterController as any).getPoolStatistics();

      expect(result).toEqual({
        totalCustomers: 100,
        activeCustomers: 60,
        potentialCustomers: 30,
        convertedCustomers: 10,
        conversionRate: 10.5
      });
    });

    it('should handle query failures with default values', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Query failed'));

      const result = await (CustomerPoolCenterController as any).getPoolStatistics();

      expect(result).toEqual({
        totalCustomers: 0,
        activeCustomers: 0,
        potentialCustomers: 0,
        convertedCustomers: 0,
        conversionRate: 0
      });
    });

    it('should handle null query results', async () => {
      mockSequelize.query
        .mockResolvedValueOnce([null])
        .mockResolvedValueOnce([null])
        .mockResolvedValueOnce([null])
        .mockResolvedValueOnce([null])
        .mockResolvedValueOnce([null]);

      const result = await (CustomerPoolCenterController as any).getPoolStatistics();

      expect(result).toEqual({
        totalCustomers: 0,
        activeCustomers: 0,
        potentialCustomers: 0,
        convertedCustomers: 0,
        conversionRate: 0
      });
    });
  });

  describe('getCustomerPools', () => {
    it('should return customer pools with customer count', async () => {
      const mockPools = [
        { id: 1, name: 'Pool 1', description: 'Description 1', status: 'active', customer_count: 25 },
        { id: 2, name: 'Pool 2', description: 'Description 2', status: 'inactive', customer_count: 15 }
      ];

      mockSequelize.query.mockResolvedValue(mockPools);

      const result = await (CustomerPoolCenterController as any).getCustomerPools();

      expect(result).toEqual({
        data: mockPools,
        pagination: {
          page: 1,
          pageSize: 10,
          total: 2
        }
      });
    });

    it('should handle empty results', async () => {
      mockSequelize.query.mockResolvedValue([]);

      const result = await (CustomerPoolCenterController as any).getCustomerPools();

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0
        }
      });
    });

    it('should handle query failures', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      const result = await (CustomerPoolCenterController as any).getCustomerPools();

      expect(result).toEqual({
        data: [],
        pagination: {
          page: 1,
          pageSize: 10,
          total: 0
        }
      });
    });
  });

  describe('getRecentCustomers', () => {
    it('should return recent customers with pool names', async () => {
      const mockCustomers = [
        { id: 1, name: 'Customer 1', phone: '1234567890', email: 'customer1@example.com', status: 'active', source: 'Website', pool_name: 'Pool 1' },
        { id: 2, name: 'Customer 2', phone: '0987654321', email: 'customer2@example.com', status: 'potential', source: 'Referral', pool_name: 'Pool 2' }
      ];

      mockSequelize.query.mockResolvedValue(mockCustomers);

      const result = await (CustomerPoolCenterController as any).getRecentCustomers();

      expect(result).toEqual(mockCustomers);
    });

    it('should handle empty results', async () => {
      mockSequelize.query.mockResolvedValue([]);

      const result = await (CustomerPoolCenterController as any).getRecentCustomers();

      expect(result).toEqual([]);
    });

    it('should handle query failures', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Query failed'));

      const result = await (CustomerPoolCenterController as any).getRecentCustomers();

      expect(result).toEqual([]);
    });
  });

  describe('getConversionAnalysis', () => {
    it('should return conversion analysis data', async () => {
      const mockAnalysis = [
        { status: 'active', count: 60, percentage: 60 },
        { status: 'potential', count: 30, percentage: 30 },
        { status: 'converted', count: 10, percentage: 10 }
      ];

      mockSequelize.query.mockResolvedValue(mockAnalysis);

      const result = await (CustomerPoolCenterController as any).getConversionAnalysis();

      expect(result).toEqual(mockAnalysis);
    });

    it('should handle empty results', async () => {
      mockSequelize.query.mockResolvedValue([]);

      const result = await (CustomerPoolCenterController as any).getConversionAnalysis();

      expect(result).toEqual([]);
    });

    it('should handle query failures', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Analysis failed'));

      const result = await (CustomerPoolCenterController as any).getConversionAnalysis();

      expect(result).toEqual([]);
    });
  });

  describe('getChannelAnalysis', () => {
    it('should return channel analysis data', async () => {
      const mockChannels = [
        { channel: 'Website', customer_count: 50, converted_count: 15, conversion_rate: 30 },
        { channel: 'Referral', customer_count: 30, converted_count: 12, conversion_rate: 40 }
      ];

      mockSequelize.query.mockResolvedValue(mockChannels);

      const result = await (CustomerPoolCenterController as any).getChannelAnalysis();

      expect(result).toEqual(mockChannels);
    });

    it('should handle empty results', async () => {
      mockSequelize.query.mockResolvedValue([]);

      const result = await (CustomerPoolCenterController as any).getChannelAnalysis();

      expect(result).toEqual([]);
    });

    it('should handle query failures', async () => {
      mockSequelize.query.mockRejectedValue(new Error('Channel analysis failed'));

      const result = await (CustomerPoolCenterController as any).getChannelAnalysis();

      expect(result).toEqual([]);
    });
  });

  describe('Error Handling', () => {
    it('should handle all types of errors consistently', async () => {
      const errorTypes = [
        new Error('Database error'),
        new Error('Connection timeout'),
        new Error('Query syntax error'),
        null,
        undefined
      ];

      for (const error of errorTypes) {
        jest.clearAllMocks();
        
        if (error) {
          mockSequelize.query.mockRejectedValue(error);
        } else {
          mockSequelize.query.mockResolvedValue(null);
        }

        await CustomerPoolCenterController.getDashboard(
          mockRequest as Request,
          mockResponse as Response
        );

        expect(ApiResponse.handleError).toHaveBeenCalledWith(
          mockResponse,
          expect.any(Error),
          '客户池中心仪表板数据获取失败'
        );
      }
    });
  });

  describe('Performance', () => {
    it('should not timeout on slow queries', async () => {
      // Mock a very slow query
      mockSequelize.query.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => resolve([{ total: 0 }]), 100);
        });
      });

      const startTime = Date.now();
      await CustomerPoolCenterController.getDashboard(
        mockRequest as Request,
        mockResponse as Response
      );
      const endTime = Date.now();

      // Should complete within reasonable time (allowing for test overhead)
      expect(endTime - startTime).toBeLessThan(500);
      expect(ApiResponse.success).toHaveBeenCalled();
    });
  });
});