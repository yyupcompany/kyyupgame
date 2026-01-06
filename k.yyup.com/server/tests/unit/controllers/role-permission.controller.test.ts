// Mock dependencies
jest.mock('../../../src/controllers/role-permission.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { assignPermission } from '../../../src/controllers/role-permission.controller';
import { getRolePermissions } from '../../../src/controllers/role-permission.controller';
import { removePermission } from '../../../src/controllers/role-permission.controller';
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

describe('Role Permission Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assignPermission', () => {
    it('应该成功分配权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          roleId: 1,
          permissionId: 1
        };

      await assignPermission(req as Request, res as Response);

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
          roleId: 1,
          permissionId: 1
        };
      req.user = null;

      await assignPermission(req as Request, res as Response);

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
          roleId: 1,
          permissionId: 1
        };

      // 模拟错误
      const originalAssignPermission = assignPermission;
      (assignPermission as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await assignPermission(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (assignPermission as jest.Mock).mockImplementation(originalAssignPermission);
    });
  });
  describe('getRolePermissions', () => {
    it('应该成功获取角色权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { roleId: '1' };

      await getRolePermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { roleId: '1' };
      req.user = null;

      await getRolePermissions(req as Request, res as Response);

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
      req.query = { roleId: '1' };

      // 模拟错误
      const originalGetRolePermissions = getRolePermissions;
      (getRolePermissions as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getRolePermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getRolePermissions as jest.Mock).mockImplementation(originalGetRolePermissions);
    });
  });
  describe('removePermission', () => {
    it('应该成功移除权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          roleId: 1,
          permissionId: 1
        };

      await removePermission(req as Request, res as Response);

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
          roleId: 1,
          permissionId: 1
        };
      req.user = null;

      await removePermission(req as Request, res as Response);

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
          roleId: 1,
          permissionId: 1
        };

      // 模拟错误
      const originalRemovePermission = removePermission;
      (removePermission as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await removePermission(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (removePermission as jest.Mock).mockImplementation(originalRemovePermission);
    });
  });
});