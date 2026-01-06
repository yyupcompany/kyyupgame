// Mock dependencies
jest.mock('../../../src/controllers/setup-permissions.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { setupPermissions } from '../../../src/controllers/setup-permissions.controller';
import { getPermissionSetup } from '../../../src/controllers/setup-permissions.controller';
import { resetPermissions } from '../../../src/controllers/setup-permissions.controller';
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

describe('Setup Permissions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('setupPermissions', () => {
    it('应该成功设置权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          role: 'admin' as any,
          permissions: ['user.manage', 'system.admin']
        };

      await setupPermissions(req as Request, res as Response);

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
          role: 'admin' as any,
          permissions: ['user.manage', 'system.admin']
        };
      req.user = null;

      await setupPermissions(req as Request, res as Response);

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
          role: 'admin' as any,
          permissions: ['user.manage', 'system.admin']
        };

      // 模拟错误
      const originalSetupPermissions = setupPermissions;
      (setupPermissions as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await setupPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (setupPermissions as jest.Mock).mockImplementation(originalSetupPermissions);
    });
  });
  describe('getPermissionSetup', () => {
    it('应该成功获取权限设置', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { role: 'admin' };

      await getPermissionSetup(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { role: 'admin' };
      req.user = null;

      await getPermissionSetup(req as Request, res as Response);

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
      req.query = { role: 'admin' };

      // 模拟错误
      const originalGetPermissionSetup = getPermissionSetup;
      (getPermissionSetup as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getPermissionSetup(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getPermissionSetup as jest.Mock).mockImplementation(originalGetPermissionSetup);
    });
  });
  describe('resetPermissions', () => {
    it('应该成功重置权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = { role: 'admin' };

      await resetPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = { role: 'admin' };
      req.user = null;

      await resetPermissions(req as Request, res as Response);

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
      req.body = { role: 'admin' };

      // 模拟错误
      const originalResetPermissions = resetPermissions;
      (resetPermissions as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await resetPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (resetPermissions as jest.Mock).mockImplementation(originalResetPermissions);
    });
  });
});