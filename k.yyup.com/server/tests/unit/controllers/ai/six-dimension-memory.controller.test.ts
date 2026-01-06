// Mock dependencies
jest.mock('../../../src/controllers/ai/six-dimension-memory.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { storeSixDimensionMemory } from '../../../src/controllers/ai/six-dimension-memory.controller';
import { retrieveSixDimensionMemory } from '../../../src/controllers/ai/six-dimension-memory.controller';
import { analyzeSixDimensionMemory } from '../../../src/controllers/ai/six-dimension-memory.controller';
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

describe('AI Six Dimension Memory Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeSixDimensionMemory', () => {
    it('应该成功存储六维记忆', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          dimensions: {
            cognitive: 0.8,
            emotional: 0.7,
            social: 0.9,
            physical: 0.6,
            creative: 0.8,
            spiritual: 0.5
          },
          context: '学习活动',
          timestamp: new Date()
        };

      await storeSixDimensionMemory(req as Request, res as Response);

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
          dimensions: {
            cognitive: 0.8,
            emotional: 0.7,
            social: 0.9,
            physical: 0.6,
            creative: 0.8,
            spiritual: 0.5
          },
          context: '学习活动',
          timestamp: new Date()
        };
      req.user = null;

      await storeSixDimensionMemory(req as Request, res as Response);

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
          dimensions: {
            cognitive: 0.8,
            emotional: 0.7,
            social: 0.9,
            physical: 0.6,
            creative: 0.8,
            spiritual: 0.5
          },
          context: '学习活动',
          timestamp: new Date()
        };

      // 模拟错误
      const originalStoreSixDimensionMemory = storeSixDimensionMemory;
      (storeSixDimensionMemory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await storeSixDimensionMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (storeSixDimensionMemory as jest.Mock).mockImplementation(originalStoreSixDimensionMemory);
    });
  });
  describe('retrieveSixDimensionMemory', () => {
    it('应该成功检索六维记忆', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          userId: '1',
          timeRange: 'week'
        };

      await retrieveSixDimensionMemory(req as Request, res as Response);

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
          userId: '1',
          timeRange: 'week'
        };
      req.user = null;

      await retrieveSixDimensionMemory(req as Request, res as Response);

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
          userId: '1',
          timeRange: 'week'
        };

      // 模拟错误
      const originalRetrieveSixDimensionMemory = retrieveSixDimensionMemory;
      (retrieveSixDimensionMemory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await retrieveSixDimensionMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (retrieveSixDimensionMemory as jest.Mock).mockImplementation(originalRetrieveSixDimensionMemory);
    });
  });
  describe('analyzeSixDimensionMemory', () => {
    it('应该成功分析六维记忆', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          userId: 1,
          analysisType: 'trend',
          timeRange: 'month'
        };

      await analyzeSixDimensionMemory(req as Request, res as Response);

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
          userId: 1,
          analysisType: 'trend',
          timeRange: 'month'
        };
      req.user = null;

      await analyzeSixDimensionMemory(req as Request, res as Response);

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
          userId: 1,
          analysisType: 'trend',
          timeRange: 'month'
        };

      // 模拟错误
      const originalAnalyzeSixDimensionMemory = analyzeSixDimensionMemory;
      (analyzeSixDimensionMemory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await analyzeSixDimensionMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (analyzeSixDimensionMemory as jest.Mock).mockImplementation(originalAnalyzeSixDimensionMemory);
    });
  });
});