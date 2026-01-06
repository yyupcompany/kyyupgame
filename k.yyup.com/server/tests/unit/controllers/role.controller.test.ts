// Mock dependencies
jest.mock('../../../src/init');
jest.mock('../../../src/utils/apiError');
jest.mock('../../../src/utils/apiResponse');
jest.mock('../../../src/models/role.model');

import { Request, Response } from 'express';
import { vi } from 'vitest'
import { RoleController } from '../../../src/controllers/role.controller';
import { sequelize } from '../../../src/init';
import { ApiError } from '../../../src/utils/apiError';
import { ApiResponse } from '../../../src/utils/apiResponse';
import { Role } from '../../../src/models/role.model';

// Mock implementations
const mockSequelize = {
  query: jest.fn()
};

const mockRole = {
  findAll: jest.fn(),
  findByPk: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn()
};

// Setup mocks
(sequelize as any) = mockSequelize;
(Role as any) = mockRole;

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

describe('Role Controller', () => {
  let roleController: RoleController;

  beforeEach(() => {
    jest.clearAllMocks();
    roleController = new RoleController();
  });

  describe('getUserRoles', () => {
    it('应该成功获取用户角色列表', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };

      const mockRoles = [
        { id: 1, name: 'Admin', code: 'admin', description: '管理员' },
        { id: 2, name: 'User', code: 'user', description: '普通用户' }
      ];

      mockSequelize.query.mockResolvedValue(mockRoles);

      await roleController.getUserRoles(req as Request, res as Response);

      expect(mockSequelize.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT DISTINCT r.id, r.name, r.code, r.description'),
        {
          replacements: { userId: 1 },
          type: 'SELECT'
        }
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRoles
      });
    });

    it('应该处理未登录用户', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await roleController.getUserRoles(req as Request, res as Response);

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

      await roleController.getUserRoles(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'USER_NOT_LOGGED_IN',
        message: '用户未登录'
      });
    });

    it('应该处理数据库查询错误', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };

      mockSequelize.query.mockRejectedValue(new Error('Database error'));

      await roleController.getUserRoles(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DATABASE_ERROR',
        message: '获取用户角色失败'
      });
    });

    it('应该返回空数组当用户没有角色时', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.user = { id: 1, username: 'testuser' };

      mockSequelize.query.mockResolvedValue([]);

      await roleController.getUserRoles(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: []
      });
    });
  });

  describe('getAllRoles', () => {
    it('应该成功获取所有角色列表', async () => {
      const req = mockRequest();
      const res = mockResponse();

      const mockRoles = [
        { id: 1, name: 'Admin', code: 'admin', description: '管理员', status: 1 },
        { id: 2, name: 'User', code: 'user', description: '普通用户', status: 1 }
      ];

      mockRole.findAll.mockResolvedValue(mockRoles);

      await roleController.getAllRoles(req as Request, res as Response);

      expect(mockRole.findAll).toHaveBeenCalledWith({
        where: { status: 1 },
        order: [['id', 'ASC']]
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockRoles
      });
    });

    it('应该支持分页查询', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.query = {
        page: '2',
        pageSize: '5'
      };

      const mockRoles = [
        { id: 6, name: 'Role6', code: 'role6' }
      ];

      mockRole.findAll.mockResolvedValue(mockRoles);

      await roleController.getAllRoles(req as Request, res as Response);

      expect(mockRole.findAll).toHaveBeenCalledWith({
        where: { status: 1 },
        order: [['id', 'ASC']],
        limit: 5,
        offset: 5
      });
    });

    it('应该处理数据库错误', async () => {
      const req = mockRequest();
      const res = mockResponse();

      mockRole.findAll.mockRejectedValue(new Error('Database error'));

      await roleController.getAllRoles(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'DATABASE_ERROR',
        message: '获取角色列表失败'
      });
    });
  });

  describe('createRole', () => {
    it('应该成功创建角色', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'New Role',
        code: 'new_role',
        description: '新角色'
      };

      const mockCreatedRole = {
        id: 3,
        name: 'New Role',
        code: 'new_role',
        description: '新角色',
        status: 1
      };

      mockRole.create.mockResolvedValue(mockCreatedRole);

      await roleController.createRole(req as Request, res as Response);

      expect(mockRole.create).toHaveBeenCalledWith({
        name: 'New Role',
        code: 'new_role',
        description: '新角色',
        status: 1
      });
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockCreatedRole,
        message: '角色创建成功'
      });
    });

    it('应该验证必需字段', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'New Role'
        // 缺少code
      };

      await roleController.createRole(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'MISSING_REQUIRED_FIELDS',
        message: '角色名称和代码不能为空'
      });
    });

    it('应该处理角色代码重复的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'Duplicate Role',
        code: 'admin' // 已存在的代码
      };

      const duplicateError = new Error('Duplicate entry');
      (duplicateError as any).name = 'SequelizeUniqueConstraintError';
      mockRole.create.mockRejectedValue(duplicateError);

      await roleController.createRole(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'ROLE_ALREADY_EXISTS',
        message: '角色代码已存在'
      });
    });

    it('应该验证角色代码格式', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.body = {
        name: 'Invalid Role',
        code: 'invalid code!' // 包含特殊字符
      };

      await roleController.createRole(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INVALID_ROLE_CODE',
        message: '角色代码只能包含字母、数字和下划线'
      });
    });
  });

  describe('updateRole', () => {
    it('应该成功更新角色', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        name: 'Updated Role',
        description: '更新的角色'
      };

      const mockExistingRole = {
        id: 1,
        name: 'Old Role',
        code: 'old_role'
      };

      const mockUpdatedRole = {
        id: 1,
        name: 'Updated Role',
        code: 'old_role',
        description: '更新的角色'
      };

      mockRole.findByPk.mockResolvedValue(mockExistingRole);
      mockRole.update.mockResolvedValue([1]);
      mockRole.findByPk.mockResolvedValueOnce(mockUpdatedRole);

      await roleController.updateRole(req as Request, res as Response);

      expect(mockRole.findByPk).toHaveBeenCalledWith(1);
      expect(mockRole.update).toHaveBeenCalledWith(
        { name: 'Updated Role', description: '更新的角色' },
        { where: { id: 1 } }
      );
    });

    it('应该处理角色不存在的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };
      req.body = { name: 'Updated Role' };

      mockRole.findByPk.mockResolvedValue(null);

      await roleController.updateRole(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'ROLE_NOT_FOUND',
        message: '角色不存在'
      });
    });

    it('应该防止更新角色代码', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };
      req.body = {
        name: 'Updated Role',
        code: 'new_code' // 尝试更新代码
      };

      const mockExistingRole = {
        id: 1,
        name: 'Old Role',
        code: 'old_role'
      };

      mockRole.findByPk.mockResolvedValue(mockExistingRole);

      await roleController.updateRole(req as Request, res as Response);

      expect(mockRole.update).toHaveBeenCalledWith(
        { name: 'Updated Role' }, // code被过滤掉
        { where: { id: 1 } }
      );
    });
  });

  describe('deleteRole', () => {
    it('应该成功删除角色', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockExistingRole = {
        id: 1,
        name: 'Test Role',
        code: 'test_role'
      };

      mockRole.findByPk.mockResolvedValue(mockExistingRole);
      mockSequelize.query.mockResolvedValue([{ count: 0 }]); // 无用户关联
      mockRole.destroy.mockResolvedValue(1);

      await roleController.deleteRole(req as Request, res as Response);

      expect(mockRole.findByPk).toHaveBeenCalledWith(1);
      expect(mockRole.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: '角色删除成功'
      });
    });

    it('应该阻止删除有用户关联的角色', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '1' };

      const mockExistingRole = {
        id: 1,
        name: 'Admin Role',
        code: 'admin'
      };

      mockRole.findByPk.mockResolvedValue(mockExistingRole);
      mockSequelize.query.mockResolvedValue([{ count: 5 }]); // 有用户关联

      await roleController.deleteRole(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'ROLE_HAS_USERS',
        message: '角色下还有用户，无法删除'
      });
    });

    it('应该处理角色不存在的情况', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: '999' };

      mockRole.findByPk.mockResolvedValue(null);

      await roleController.deleteRole(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'ROLE_NOT_FOUND',
        message: '角色不存在'
      });
    });

    it('应该验证角色ID格式', async () => {
      const req = mockRequest();
      const res = mockResponse();
      
      req.params = { id: 'invalid' };

      await roleController.deleteRole(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        error: 'INVALID_ROLE_ID',
        message: '角色ID格式不正确'
      });
    });
  });
});
