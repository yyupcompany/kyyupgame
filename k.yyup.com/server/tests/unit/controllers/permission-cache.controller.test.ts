// Mock dependencies
jest.mock('../../../src/controllers/permission-cache.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { clearCache } from '../../../src/controllers/permission-cache.controller';
import { getCacheStatus } from '../../../src/controllers/permission-cache.controller';
import { refreshCache } from '../../../src/controllers/permission-cache.controller';
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

describe('Permission Cache Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('clearCache', () => {
    it('应该成功清除缓存', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { cacheType: 'permissions' };

      await clearCache(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = { cacheType: 'permissions' };
      req.user = null;

      await clearCache(req as Request, res as Response);

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
      req.body = { cacheType: 'permissions' };

      // 模拟错误
      const originalClearCache = clearCache;
      (clearCache as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await clearCache(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (clearCache as jest.Mock).mockImplementation(originalClearCache);
    });
  });
  describe('getCacheStatus', () => {
    it('应该成功获取缓存状态', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      

      await getCacheStatus(req as Request, res as Response);

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

      await getCacheStatus(req as Request, res as Response);

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
      const originalGetCacheStatus = getCacheStatus;
      (getCacheStatus as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getCacheStatus(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getCacheStatus as jest.Mock).mockImplementation(originalGetCacheStatus);
    });
  });
  describe('refreshCache', () => {
    it('应该成功刷新缓存', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { cacheType: 'permissions' };

      await refreshCache(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = { cacheType: 'permissions' };
      req.user = null;

      await refreshCache(req as Request, res as Response);

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
      req.body = { cacheType: 'permissions' };

      // 模拟错误
      const originalRefreshCache = refreshCache;
      (refreshCache as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await refreshCache(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (refreshCache as jest.Mock).mockImplementation(originalRefreshCache);
    });
  });
});