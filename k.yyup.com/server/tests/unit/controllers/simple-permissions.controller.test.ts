// Mock dependencies
jest.mock('../../../src/controllers/simple-permissions.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { checkPermission } from '../../../src/controllers/simple-permissions.controller';
import { getUserPermissions } from '../../../src/controllers/simple-permissions.controller';
import { grantPermission } from '../../../src/controllers/simple-permissions.controller';
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

describe('Simple Permissions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkPermission', () => {
    it('应该成功检查权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { permission: 'user.manage' };

      await checkPermission(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { permission: 'user.manage' };
      req.user = null;

      await checkPermission(req as Request, res as Response);

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
      req.query = { permission: 'user.manage' };

      // 模拟错误
      const originalCheckPermission = checkPermission;
      (checkPermission as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await checkPermission(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (checkPermission as jest.Mock).mockImplementation(originalCheckPermission);
    });
  });
  describe('getUserPermissions', () => {
    it('应该成功获取用户权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { userId: '1' };

      await getUserPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { userId: '1' };
      req.user = null;

      await getUserPermissions(req as Request, res as Response);

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
      req.query = { userId: '1' };

      // 模拟错误
      const originalGetUserPermissions = getUserPermissions;
      (getUserPermissions as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getUserPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getUserPermissions as jest.Mock).mockImplementation(originalGetUserPermissions);
    });
  });
  describe('grantPermission', () => {
    it('应该成功授予权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          userId: 1,
          permission: 'user.manage'
        };

      await grantPermission(req as Request, res as Response);

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
          permission: 'user.manage'
        };
      req.user = null;

      await grantPermission(req as Request, res as Response);

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
          permission: 'user.manage'
        };

      // 模拟错误
      const originalGrantPermission = grantPermission;
      (grantPermission as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await grantPermission(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (grantPermission as jest.Mock).mockImplementation(originalGrantPermission);
    });
  });
});