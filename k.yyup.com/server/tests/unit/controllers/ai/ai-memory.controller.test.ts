// Mock dependencies
jest.mock('../../../src/controllers/ai/ai-memory.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { storeMemory } from '../../../src/controllers/ai/ai-memory.controller';
import { retrieveMemory } from '../../../src/controllers/ai/ai-memory.controller';
import { searchMemory } from '../../../src/controllers/ai/ai-memory.controller';
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

describe('AI Memory Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('storeMemory', () => {
    it('应该成功存储记忆', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          content: '用户偏好设置',
          type: 'preference',
          userId: 1
        };

      await storeMemory(req as Request, res as Response);

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
          content: '用户偏好设置',
          type: 'preference',
          userId: 1
        };
      req.user = null;

      await storeMemory(req as Request, res as Response);

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
          content: '用户偏好设置',
          type: 'preference',
          userId: 1
        };

      // 模拟错误
      const originalStoreMemory = storeMemory;
      (storeMemory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await storeMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (storeMemory as jest.Mock).mockImplementation(originalStoreMemory);
    });
  });
  describe('retrieveMemory', () => {
    it('应该成功检索记忆', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { userId: '1', type: 'preference' };

      await retrieveMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { userId: '1', type: 'preference' };
      req.user = null;

      await retrieveMemory(req as Request, res as Response);

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
      req.query = { userId: '1', type: 'preference' };

      // 模拟错误
      const originalRetrieveMemory = retrieveMemory;
      (retrieveMemory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await retrieveMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (retrieveMemory as jest.Mock).mockImplementation(originalRetrieveMemory);
    });
  });
  describe('searchMemory', () => {
    it('应该成功搜索记忆', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { 
          query: '用户偏好',
          userId: 1,
          limit: 10
        };

      await searchMemory(req as Request, res as Response);

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
          query: '用户偏好',
          userId: 1,
          limit: 10
        };
      req.user = null;

      await searchMemory(req as Request, res as Response);

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
          query: '用户偏好',
          userId: 1,
          limit: 10
        };

      // 模拟错误
      const originalSearchMemory = searchMemory;
      (searchMemory as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await searchMemory(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (searchMemory as jest.Mock).mockImplementation(originalSearchMemory);
    });
  });
});