// Mock dependencies
jest.mock('../../../src/controllers/ai/quota.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getQuota } from '../../../src/controllers/ai/quota.controller';
import { updateQuota } from '../../../src/controllers/ai/quota.controller';
import { checkQuota } from '../../../src/controllers/ai/quota.controller';
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

describe('AI Quota Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuota', () => {
    it('应该成功获取配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { userId: '1', service: 'chatgpt' };

      await getQuota(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { userId: '1', service: 'chatgpt' };
      req.user = null;

      await getQuota(req as Request, res as Response);

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
      req.query = { userId: '1', service: 'chatgpt' };

      // 模拟错误
      const originalGetQuota = getQuota;
      (getQuota as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getQuota(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getQuota as jest.Mock).mockImplementation(originalGetQuota);
    });
  });
  describe('updateQuota', () => {
    it('应该成功更新配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          userId: 1,
          service: 'chatgpt',
          quota: 1000,
          expirationDate: new Date()
        };

      await updateQuota(req as Request, res as Response);

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
          service: 'chatgpt',
          quota: 1000,
          expirationDate: new Date()
        };
      req.user = null;

      await updateQuota(req as Request, res as Response);

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
          service: 'chatgpt',
          quota: 1000,
          expirationDate: new Date()
        };

      // 模拟错误
      const originalUpdateQuota = updateQuota;
      (updateQuota as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updateQuota(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updateQuota as jest.Mock).mockImplementation(originalUpdateQuota);
    });
  });
  describe('checkQuota', () => {
    it('应该成功检查配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { 
          userId: '1',
          service: 'chatgpt',
          requestedAmount: 10
        };

      await checkQuota(req as Request, res as Response);

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
          service: 'chatgpt',
          requestedAmount: 10
        };
      req.user = null;

      await checkQuota(req as Request, res as Response);

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
          service: 'chatgpt',
          requestedAmount: 10
        };

      // 模拟错误
      const originalCheckQuota = checkQuota;
      (checkQuota as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await checkQuota(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (checkQuota as jest.Mock).mockImplementation(originalCheckQuota);
    });
  });
});