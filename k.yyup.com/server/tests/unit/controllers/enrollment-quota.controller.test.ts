// Mock dependencies
jest.mock('../../../src/controllers/enrollment-quota.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { setQuota } from '../../../src/controllers/enrollment-quota.controller';
import { getQuotas } from '../../../src/controllers/enrollment-quota.controller';
import { updateQuota } from '../../../src/controllers/enrollment-quota.controller';
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

describe('Enrollment Quota Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setQuota', () => {
    it('应该成功设置配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          grade: '小班',
          totalQuota: 30,
          availableQuota: 25
        };

      await setQuota(req as Request, res as Response);

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
          grade: '小班',
          totalQuota: 30,
          availableQuota: 25
        };
      req.user = null;

      await setQuota(req as Request, res as Response);

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
          grade: '小班',
          totalQuota: 30,
          availableQuota: 25
        };

      // 模拟错误
      const originalSetQuota = setQuota;
      (setQuota as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await setQuota(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (setQuota as jest.Mock).mockImplementation(originalSetQuota);
    });
  });
  describe('getQuotas', () => {
    it('应该成功获取配额列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { academicYear: '2024' };

      await getQuotas(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    

    

    it('应该处理错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      
      req.query = { academicYear: '2024' };

      // 模拟错误
      const originalGetQuotas = getQuotas;
      (getQuotas as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getQuotas(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getQuotas as jest.Mock).mockImplementation(originalGetQuotas);
    });
  });
  describe('updateQuota', () => {
    it('应该成功更新配额', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { availableQuota: 20 };

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
      
      req.params = { id: '1' };
        req.body = { availableQuota: 20 };
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
      req.params = { id: '1' };
        req.body = { availableQuota: 20 };

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
});