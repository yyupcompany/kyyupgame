// Mock dependencies
jest.mock('../../../src/controllers/page-permissions.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getPagePermissions } from '../../../src/controllers/page-permissions.controller';
import { updatePagePermissions } from '../../../src/controllers/page-permissions.controller';
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

describe('Page Permissions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPagePermissions', () => {
    it('应该成功获取页面权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { page: 'dashboard' };

      await getPagePermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { page: 'dashboard' };
      req.user = null;

      await getPagePermissions(req as Request, res as Response);

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
      req.query = { page: 'dashboard' };

      // 模拟错误
      const originalGetPagePermissions = getPagePermissions;
      (getPagePermissions as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getPagePermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getPagePermissions as jest.Mock).mockImplementation(originalGetPagePermissions);
    });
  });
  describe('updatePagePermissions', () => {
    it('应该成功更新页面权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          page: 'dashboard',
          permissions: ['read', 'write'],
          roles: ['admin', 'teacher']
        };

      await updatePagePermissions(req as Request, res as Response);

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
          page: 'dashboard',
          permissions: ['read', 'write'],
          roles: ['admin', 'teacher']
        };
      req.user = null;

      await updatePagePermissions(req as Request, res as Response);

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
          page: 'dashboard',
          permissions: ['read', 'write'],
          roles: ['admin', 'teacher']
        };

      // 模拟错误
      const originalUpdatePagePermissions = updatePagePermissions;
      (updatePagePermissions as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updatePagePermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updatePagePermissions as jest.Mock).mockImplementation(originalUpdatePagePermissions);
    });
  });
});