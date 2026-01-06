// Mock dependencies
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { EnrollmentStatisticsController } from '../../../src/controllers/enrollment-statistics.controller';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';

// 创建控制器实例
const controller = new EnrollmentStatisticsController();

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

describe('Enrollment Statistics Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getEnrollmentStats', () => {
    it('应该成功获取招生统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { period: 'month', year: '2024' };

      await getEnrollmentStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { period: 'month', year: '2024' };
      req.user = null;

      await getEnrollmentStats(req as Request, res as Response);

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
      req.query = { period: 'month', year: '2024' };

      // 模拟错误
      const originalGetEnrollmentStats = getEnrollmentStats;
      (getEnrollmentStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getEnrollmentStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getEnrollmentStats as jest.Mock).mockImplementation(originalGetEnrollmentStats);
    });
  });
  describe('getApplicationStats', () => {
    it('应该成功获取申请统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { status: 'pending' };

      await getApplicationStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { status: 'pending' };
      req.user = null;

      await getApplicationStats(req as Request, res as Response);

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
      req.query = { status: 'pending' };

      // 模拟错误
      const originalGetApplicationStats = getApplicationStats;
      (getApplicationStats as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getApplicationStats(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getApplicationStats as jest.Mock).mockImplementation(originalGetApplicationStats);
    });
  });
  describe('getConversionStats', () => {
    it('应该成功获取转化统计', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { period: 'quarter' };

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
      
      req.query = { period: 'quarter' };
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
      req.query = { period: 'quarter' };

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