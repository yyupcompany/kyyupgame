// Mock dependencies
jest.mock('../../../src/controllers/centers/finance-center.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getFinanceDashboard } from '../../../src/controllers/centers/finance-center.controller';
import { getRevenueStats } from '../../../src/controllers/centers/finance-center.controller';
import { getExpenseStats } from '../../../src/controllers/centers/finance-center.controller';
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

describe('Finance Center Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFinanceDashboard', () => {
    it('应该成功获取财务中心仪表板', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      await getFinanceDashboard(req as Request, res as Response);

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

      await getFinanceDashboard(req as Request, res as Response);

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
      const originalGetFinanceDashboard = getFinanceDashboard;
      (getFinanceDashboard as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getFinanceDashboard(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getFinanceDashboard as jest.Mock).mockImplementation(originalGetFinanceDashboard);
    });
  });
  describe('getRevenueStats', () => {
    it('应该成功获取收入统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          timeRange: 'month',
          revenueType: 'tuition'
        };

      await getRevenueStats(req as Request, res as Response);

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
          timeRange: 'month',
          revenueType: 'tuition'
        };
      req.user = null;

      await getRevenueStats(req as Request, res as Response);

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
          timeRange: 'month',
          revenueType: 'tuition'
        };

      // 模拟错误
      const originalGetRevenueStats = getRevenueStats;
      (getRevenueStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getRevenueStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getRevenueStats as jest.Mock).mockImplementation(originalGetRevenueStats);
    });
  });
  describe('getExpenseStats', () => {
    it('应该成功获取支出统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          timeRange: 'month',
          category: 'all'
        };

      await getExpenseStats(req as Request, res as Response);

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
          timeRange: 'month',
          category: 'all'
        };
      req.user = null;

      await getExpenseStats(req as Request, res as Response);

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
          timeRange: 'month',
          category: 'all'
        };

      // 模拟错误
      const originalGetExpenseStats = getExpenseStats;
      (getExpenseStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getExpenseStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getExpenseStats as jest.Mock).mockImplementation(originalGetExpenseStats);
    });
  });
});