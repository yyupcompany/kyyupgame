// Mock dependencies
jest.mock('../../../src/controllers/permissions.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { getPermissions } from '../../../src/controllers/permissions.controller';
import { createPermission } from '../../../src/controllers/permissions.controller';
import { updatePermission } from '../../../src/controllers/permissions.controller';
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

describe('Permissions Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getPermissions', () => {
    it('应该成功获取权限列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { page: '1', limit: '10' };

      await getPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.any(Object),
        message: expect.any(String)
      });
    });

    it('应该拒绝未登录用户的请求', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = { page: '1', limit: '10' };
      req.user = null;

      await getPermissions(req as Request, res as Response);

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
      req.query = { page: '1', limit: '10' };

      // 模拟错误
      const originalGetPermissions = getPermissions;
      (getPermissions as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getPermissions as jest.Mock).mockImplementation(originalGetPermissions);
    });
  });
  describe('createPermission', () => {
    it('应该成功创建权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          name: 'user.manage',
          description: '用户管理权限',
          resource: 'users'
        };

      await createPermission(req as Request, res as Response);

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
          name: 'user.manage',
          description: '用户管理权限',
          resource: 'users'
        };
      req.user = null;

      await createPermission(req as Request, res as Response);

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
          name: 'user.manage',
          description: '用户管理权限',
          resource: 'users'
        };

      // 模拟错误
      const originalCreatePermission = createPermission;
      (createPermission as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await createPermission(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (createPermission as jest.Mock).mockImplementation(originalCreatePermission);
    });
  });
  describe('updatePermission', () => {
    it('应该成功更新权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.params = { id: '1' };
        req.body = { description: '更新后的权限描述' };

      await updatePermission(req as Request, res as Response);

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
        req.body = { description: '更新后的权限描述' };
      req.user = null;

      await updatePermission(req as Request, res as Response);

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
        req.body = { description: '更新后的权限描述' };

      // 模拟错误
      const originalUpdatePermission = updatePermission;
      (updatePermission as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await updatePermission(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (updatePermission as jest.Mock).mockImplementation(originalUpdatePermission);
    });
  });
});