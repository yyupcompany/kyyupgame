// Mock dependencies
jest.mock('../../../src/controllers/centers/customer-pool-center.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getCustomerPoolDashboard } from '../../../src/controllers/centers/customer-pool-center.controller';
import { getLeadStats } from '../../../src/controllers/centers/customer-pool-center.controller';
import { getConversionStats } from '../../../src/controllers/centers/customer-pool-center.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';

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

describe('Customer Pool Center Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCustomerPoolDashboard', () => {
    it('应该成功获取客户池中心仪表板', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      await getCustomerPoolDashboard(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.user = null;

      await getCustomerPoolDashboard(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      // 模拟错误
      const originalGetCustomerPoolDashboard = getCustomerPoolDashboard;
      (getCustomerPoolDashboard as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCustomerPoolDashboard(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getCustomerPoolDashboard as jest.Mock).mockImplementation(originalGetCustomerPoolDashboard);
    });
  });
  describe('getLeadStats', () => {
    it('应该成功获取线索统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          source: 'all',
          timeRange: 'month'
        };

      await getLeadStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { 
          source: 'all',
          timeRange: 'month'
        };
      req.user = null;

      await getLeadStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          source: 'all',
          timeRange: 'month'
        };

      // 模拟错误
      const originalGetLeadStats = getLeadStats;
      (getLeadStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getLeadStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getLeadStats as jest.Mock).mockImplementation(originalGetLeadStats);
    });
  });
  describe('getConversionStats', () => {
    it('应该成功获取转化统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          period: 'quarter',
          funnelStage: 'all'
        };

      await getConversionStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { 
          period: 'quarter',
          funnelStage: 'all'
        };
      req.user = null;

      await getConversionStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 401
      });
    });

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          period: 'quarter',
          funnelStage: 'all'
        };

      // 模拟错误
      const originalGetConversionStats = getConversionStats;
      (getConversionStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getConversionStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getConversionStats as jest.Mock).mockImplementation(originalGetConversionStats);
    });
  });
});