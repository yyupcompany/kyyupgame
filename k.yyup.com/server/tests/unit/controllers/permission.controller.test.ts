// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { PermissionController } from '../../../src/controllers/permission.controller';
import { sequelize } from '../../../src/init';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { QueryTypes } from 'sequelize';

// Mock implementations
const mockSequelize = {
  query: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;

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

describe('Permission Controller', () => {
  let permissionController: PermissionController;

  beforeEach(() => {
    jest.clearAllMocks();
    permissionController = new PermissionController();
  });

  describe('getPagePermissions', () => {
    it('应该成功获取页面权限列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '10'
      };

      const mockCountResult = [{ total: 25 }];
      const mockPermissions = [
        { id: 1, name: '用户管理', code: 'user.manage', path: '/users', icon: 'user', status: 1 },
        { id: 2, name: '角色管理', code: 'role.manage', path: '/roles', icon: 'role', status: 1 }
      ];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult) // count query
        .mockResolvedValueOnce(mockPermissions); // permissions query

      await permissionController.getPagePermissions(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledTimes(2);
      expect(mockSequelize.query).toHaveBeenNthCalledWith(1, 
        'SELECT COUNT(*) as total FROM permissions WHERE status = 1',
        { type: QueryTypes.SELECT }
      );
      expect(mockSequelize.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('SELECT id, name, code, path, icon, status'),
        {
          replacements: { limit: 10, offset: 0 },
          type: QueryTypes.SELECT
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: 25,
          page: 1,
          pageSize: 10,
          permissions: mockPermissions
        }
      });
    });

    it('应该处理分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '3',
        pageSize: '5'
      };

      const mockCountResult = [{ total: 25 }];
      const mockPermissions = [];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockPermissions);

      await permissionController.getPagePermissions(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('LIMIT :limit OFFSET :offset'),
        {
          replacements: { limit: 5, offset: 10 }, // (3-1) * 5 = 10
          type: QueryTypes.SELECT
        }
      );
    });

    it('应该处理无效的分页参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '-1',
        pageSize: '0'
      };

      const mockCountResult = [{ total: 25 }];
      const mockPermissions = [];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockPermissions);

      await permissionController.getPagePermissions(req as Request, res as Response);

      // 应该使用默认值：page=1, pageSize=10
      expect(mockSequelize.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('LIMIT :limit OFFSET :offset'),
        {
          replacements: { limit: 10, offset: 0 },
          type: QueryTypes.SELECT
        }
      );
    });

    it('应该限制最大页面大小', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '1',
        pageSize: '200' // 超过最大限制
      };

      const mockCountResult = [{ total: 25 }];
      const mockPermissions = [];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockPermissions);

      await permissionController.getPagePermissions(req as Request, res as Response);

      // 应该限制为最大值100
      expect(mockSequelize.query).toHaveBeenNthCalledWith(2,
        expect.stringContaining('LIMIT :limit OFFSET :offset'),
        {
          replacements: { limit: 100, offset: 0 },
          type: QueryTypes.SELECT
        }
      );
    });

    it('应该处理数据库查询错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await permissionController.getPagePermissions(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DATABASE_ERROR',
        message: '获取页面权限失败'
      });
    });

    it('应该处理空的计数结果', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockCountResult = []; // 空结果
      const mockPermissions = [];

      mockSequelize.query
        .mockResolvedValueOnce(mockCountResult)
        .mockResolvedValueOnce(mockPermissions);

      await permissionController.getPagePermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          total: 0, // 应该默认为0
          page: 1,
          pageSize: 50,
          permissions: []
        }
      });
    });
  });

  describe('getUserPermissions', () => {
    it('应该成功获取用户权限列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };

      const mockPermissions = [
        { id: 1, name: '用户管理', code: 'user.manage', path: '/users' },
        { id: 2, name: '角色管理', code: 'role.manage', path: '/roles' }
      ];

      mockSequelize.query.mockResolvedValue(mockPermissions);

      await permissionController.getUserPermissions(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT DISTINCT p.id, p.name, p.code, p.path'),
        {
          replacements: { userId: 1 },
          type: QueryTypes.SELECT
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockPermissions
      });
    });

    it('应该处理未登录用户', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await permissionController.getUserPermissions(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'USER_NOT_LOGGED_IN',
        message: '用户未登录'
      });
    });

    it('应该处理用户ID缺失的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { username: 'testuser' }; // 缺少id

      await permissionController.getUserPermissions(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'USER_NOT_LOGGED_IN',
        message: '用户未登录'
      });
    });

    it('应该返回空数组当用户没有权限时', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };

      mockSequelize.query.mockResolvedValue([]);

      await permissionController.getUserPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('checkPermission', () => {
    it('应该成功验证用户权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };
      req.body = { permissionCode: 'user.manage' };

      const mockPermissionResult = [{ count: 1 }];

      mockSequelize.query.mockResolvedValue(mockPermissionResult);

      await permissionController.checkPermission(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT COUNT(*) as count'),
        {
          replacements: { userId: 1, permissionCode: 'user.manage' },
          type: QueryTypes.SELECT
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          hasPermission: true,
          permissionCode: 'user.manage'
        }
      });
    });

    it('应该处理用户无权限的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };
      req.body = { permissionCode: 'admin.manage' };

      const mockPermissionResult = [{ count: 0 }];

      mockSequelize.query.mockResolvedValue(mockPermissionResult);

      await permissionController.checkPermission(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          hasPermission: false,
          permissionCode: 'admin.manage'
        }
      });
    });

    it('应该验证权限代码参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };
      req.body = {}; // 缺少permissionCode

      await permissionController.checkPermission(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'MISSING_PERMISSION_CODE',
        message: '权限代码不能为空'
      });
    });

    it('应该处理未登录用户的权限检查', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = { permissionCode: 'user.manage' };

      await permissionController.checkPermission(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'USER_NOT_LOGGED_IN',
        message: '用户未登录'
      });
    });
  });

  describe('getPermissionTree', () => {
    it('应该成功获取权限树结构', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockPermissions = [
        { id: 1, name: '系统管理', code: 'system', parent_id: null, path: '/system' },
        { id: 2, name: '用户管理', code: 'user.manage', parent_id: 1, path: '/system/users' },
        { id: 3, name: '角色管理', code: 'role.manage', parent_id: 1, path: '/system/roles' }
      ];

      mockSequelize.query.mockResolvedValue(mockPermissions);

      await permissionController.getPermissionTree(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT id, name, code, parent_id, path'),
        { type: QueryTypes.SELECT }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.arrayContaining([
          expect.objectContaining({
            id: 1,
            name: '系统管理',
            children: expect.arrayContaining([
              expect.objectContaining({ id: 2, name: '用户管理' }),
              expect.objectContaining({ id: 3, name: '角色管理' })
            ])
          })
        ])
      });
    });

    it('应该处理空的权限列表', async () => {
      const req = mockRequest();
      const res = mockResponse();

      mockSequelize.query.mockResolvedValue([]);

      await permissionController.getPermissionTree(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });

    it('应该处理数据库查询错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await permissionController.getPermissionTree(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DATABASE_ERROR',
        message: '获取权限树失败'
      });
    });
  });

  describe('batchCheckPermissions', () => {
    it('应该成功批量检查权限', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };
      req.body = { 
        permissionCodes: ['user.manage', 'role.manage', 'admin.manage'] 
      };

      const mockResults = [
        { permission_code: 'user.manage', count: 1 },
        { permission_code: 'role.manage', count: 1 },
        { permission_code: 'admin.manage', count: 0 }
      ];

      mockSequelize.query.mockResolvedValue(mockResults);

      await permissionController.batchCheckPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {
          'user.manage': true,
          'role.manage': true,
          'admin.manage': false
        }
      });
    });

    it('应该验证权限代码数组参数', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };
      req.body = { permissionCodes: 'invalid' }; // 不是数组

      await permissionController.batchCheckPermissions(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INVALID_PERMISSION_CODES',
        message: '权限代码必须是数组格式'
      });
    });

    it('应该处理空的权限代码数组', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };
      req.body = { permissionCodes: [] };

      await permissionController.batchCheckPermissions(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: {}
      });
    });
  });
});
