// Mock dependencies
jest.mock('../../../src/controllers/enrollment-center.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getDashboard } from '../../../src/controllers/enrollment-center.controller';
import { getStatistics } from '../../../src/controllers/enrollment-center.controller';
import { getRecentApplications } from '../../../src/controllers/enrollment-center.controller';
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

describe('Enrollment Center Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('应该成功获取仪表板', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      await getDashboard(req as Request, res as Response);

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

      await getDashboard(req as Request, res as Response);

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
      const originalGetDashboard = getDashboard;
      (getDashboard as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getDashboard(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getDashboard as jest.Mock).mockImplementation(originalGetDashboard);
    });
  });
  describe('getStatistics', () => {
    it('应该成功获取统计数据', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { period: 'month' };

      await getStatistics(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { period: 'month' };
      req.user = null;

      await getStatistics(req as Request, res as Response);

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
      req.query = { period: 'month' };

      // 模拟错误
      const originalGetStatistics = getStatistics;
      (getStatistics as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getStatistics(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getStatistics as jest.Mock).mockImplementation(originalGetStatistics);
    });
  });
  describe('getRecentApplications', () => {
    it('应该成功获取最近申请', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { limit: '10' };

      await getRecentApplications(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { limit: '10' };
      req.user = null;

      await getRecentApplications(req as Request, res as Response);

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
      req.query = { limit: '10' };

      // 模拟错误
      const originalGetRecentApplications = getRecentApplications;
      (getRecentApplications as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getRecentApplications(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getRecentApplications as jest.Mock).mockImplementation(originalGetRecentApplications);
    });
  });
});