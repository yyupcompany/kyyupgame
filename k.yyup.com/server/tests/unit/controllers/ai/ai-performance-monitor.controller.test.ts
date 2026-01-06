// Mock dependencies
jest.mock('../../../src/controllers/ai/ai-performance-monitor.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getPerformanceMetrics } from '../../../src/controllers/ai/ai-performance-monitor.controller';
import { getSystemHealth } from '../../../src/controllers/ai/ai-performance-monitor.controller';
import { optimizePerformance } from '../../../src/controllers/ai/ai-performance-monitor.controller';
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

describe('AI Performance Monitor Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPerformanceMetrics', () => {
    it('应该成功获取性能指标', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          timeRange: '24h',
          metrics: ['cpu', 'memory', 'response_time']
        };

      await getPerformanceMetrics(req as Request, res as Response);

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
          timeRange: '24h',
          metrics: ['cpu', 'memory', 'response_time']
        };
      req.user = null;

      await getPerformanceMetrics(req as Request, res as Response);

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
          timeRange: '24h',
          metrics: ['cpu', 'memory', 'response_time']
        };

      // 模拟错误
      const originalGetPerformanceMetrics = getPerformanceMetrics;
      (getPerformanceMetrics as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getPerformanceMetrics(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getPerformanceMetrics as jest.Mock).mockImplementation(originalGetPerformanceMetrics);
    });
  });
  describe('getSystemHealth', () => {
    it('应该成功获取系统健康状态', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      await getSystemHealth(req as Request, res as Response);

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

      await getSystemHealth(req as Request, res as Response);

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
      const originalGetSystemHealth = getSystemHealth;
      (getSystemHealth as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getSystemHealth(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getSystemHealth as jest.Mock).mockImplementation(originalGetSystemHealth);
    });
  });
  describe('optimizePerformance', () => {
    it('应该成功优化性能', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { 
          optimizationType: 'memory_cleanup',
          target: 'ai_service'
        };

      await optimizePerformance(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = { 
          optimizationType: 'memory_cleanup',
          target: 'ai_service'
        };
      req.user = null;

      await optimizePerformance(req as Request, res as Response);

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
      req.body = { 
          optimizationType: 'memory_cleanup',
          target: 'ai_service'
        };

      // 模拟错误
      const originalOptimizePerformance = optimizePerformance;
      (optimizePerformance as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await optimizePerformance(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (optimizePerformance as jest.Mock).mockImplementation(originalOptimizePerformance);
    });
  });
});