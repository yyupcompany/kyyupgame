// Mock dependencies
jest.mock('../../../src/controllers/user-role.controller');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response, NextFunction } from 'express';
import { vi } from 'vitest'
import { assignRole } from '../../../src/controllers/user-role.controller';
import { getUserRoles } from '../../../src/controllers/user-role.controller';
import { removeRole } from '../../../src/controllers/user-role.controller';
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

describe('User Role Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('assignRole', () => {
    it('应该成功分配角色', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          userId: 1,
          roleId: 1
        };

      await assignRole(req as Request, res as Response);

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
          roleId: 1
        };
      req.user = null;

      await assignRole(req as Request, res as Response);

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
          roleId: 1
        };

      // 模拟错误
      const originalAssignRole = assignRole;
      (assignRole as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await assignRole(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (assignRole as jest.Mock).mockImplementation(originalAssignRole);
    });
  });
  describe('getUserRoles', () => {
    it('应该成功获取用户角色', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.query = { userId: '1' };

      await getUserRoles(req as Request, res as Response);

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

      await getUserRoles(req as Request, res as Response);

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
      const originalGetUserRoles = getUserRoles;
      (getUserRoles as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await getUserRoles(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (getUserRoles as jest.Mock).mockImplementation(originalGetUserRoles);
    });
  });
  describe('removeRole', () => {
    it('应该成功移除角色', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1 };
      req.body = {
          userId: 1,
          roleId: 1
        };

      await removeRole(req as Request, res as Response);

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
          roleId: 1
        };
      req.user = null;

      await removeRole(req as Request, res as Response);

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
          roleId: 1
        };

      // 模拟错误
      const originalRemoveRole = removeRole;
      (removeRole as jest.Mock).mockImplementationOnce(async () => {
        throw new Error('Test error');
      });

      await removeRole(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: expect.any(String),
        message: expect.any(String),
        statusCode: 500
      });

      // 恢复原始函数
      (removeRole as jest.Mock).mockImplementation(originalRemoveRole);
    });
  });
});